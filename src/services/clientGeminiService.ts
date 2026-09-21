import { ExamGenerationResult, ExtractedQuestion, GenerationMode } from "../types";
import { OFFICIAL_HESHAM_EXAM_TEMPLATE } from "../data/officialTemplate";
import { hydrateClientExamTemplate } from "./clientExamGenerator";
import { getGeminiApiKey } from "../config/api";

export interface ClientGeminiPayload {
  images?: { mimeType: string; data: string; name?: string }[];
  examText?: string;
  instructions?: string;
  examTitle?: string;
  questionCount?: number;
  durationMinutes?: number;
  difficulty?: string;
  solveQuestions?: boolean;
  generationMode?: GenerationMode;
  templateCode?: string;
}

export async function generateExamWithClientGemini(
  payload: ClientGeminiPayload
): Promise<ExamGenerationResult> {
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    throw new Error(
      "لم يتم العثور على مفتاح Gemini API. يرجى إدخال مفتاح Gemini API في إعدادات المنصة أو كتابة نص الامتحان مباشرة."
    );
  }

  const {
    images = [],
    examText = "",
    instructions = "",
    examTitle = "امتحان تفاعلي",
    questionCount = 7,
    durationMinutes = 30,
    difficulty = "same",
    solveQuestions = true,
    generationMode = "exact_extract",
    templateCode = "",
  } = payload;

  const parts: any[] = [];

  // 1. Add image and file parts
  for (const img of images) {
    let base64Data = img.data || "";
    if (base64Data.includes(",")) {
      base64Data = base64Data.split(",")[1];
    }
    const mimeType = img.mimeType || "image/jpeg";

    if (mimeType.startsWith("text/")) {
      try {
        const decoded = atob(base64Data);
        parts.push({
          text: `=== ATTACHED EXAM DOCUMENT/FILE (${img.name || "Document"}) ===\n${decoded}`,
        });
        continue;
      } catch {}
    }

    parts.push({
      inlineData: {
        mimeType: mimeType,
        data: base64Data,
      },
    });
  }

  // 2. Add exam text if provided
  if (examText && examText.trim()) {
    parts.push({
      text: `=== EXAM TEXT AND QUESTIONS PROVIDED BY TEACHER ===\n${examText.trim()}\n\nSTRICT REQUIREMENT: Extract and build the exam questions strictly from this text!`,
    });
  }

  // 3. System prompt for multimodal generation
  const systemPrompt = `You are "Hesham Exam AI Engine" - an elite educational AI engine specialized in extracting and generating interactive digital exams from uploaded exam sheets, images, and text.

PEDAGOGICAL & ACCURACY DIRECTIVES:
1. STRICT BAN ON RANDOM QUESTIONS:
   - You MUST extract and derive questions directly from the provided images and/or text.
   - If the teacher provided text with questions and choices, extract those exact questions faithfully!
   - If images are provided, perform OCR and vision analysis to read every question, formula, and diagram accurately.
2. Question Structure:
   - Each question must have:
     * questionAr & questionEn (or bilingual).
     * 4 distinct options (optionsAr & optionsEn).
     * correctIndex (0, 1, 2, or 3).
     * explanationAr & explanationEn with clear step-by-step reasoning.
     * points: integer score.
     * type: "mcq".
3. Return ONLY valid JSON matching this schema:
{
  "examTitle": "string",
  "summary": "string",
  "questions": [
    {
      "number": 1,
      "question": "string",
      "questionAr": "string",
      "questionEn": "string",
      "type": "mcq",
      "options": ["string", "string", "string", "string"],
      "optionsAr": ["string", "string", "string", "string"],
      "optionsEn": ["string", "string", "string", "string"],
      "correctAnswer": 0,
      "correctIndex": 0,
      "explanation": "string",
      "explanationAr": "string",
      "explanationEn": "string",
      "points": 10
    }
  ]
}`;

  parts.push({
    text: `Generate ${questionCount} questions based on the attached materials.
Exam Title: ${examTitle || "امتحان تفاعلي"}
Generation Mode: ${generationMode}
Difficulty: ${difficulty}
Teacher Instructions: ${instructions || "استخرج الأسئلة بدقة من المحتوى المرفق واحلها بدقة."}
Solve Questions: ${solveQuestions ? "yes" : "no"}`,
  });

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(
    apiKey
  )}`;

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      contents: [
        {
          role: "user",
          parts: parts,
        },
      ],
      systemInstruction: {
        parts: [{ text: systemPrompt }],
      },
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.2,
      },
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    let errMsg = "فشل الاتصال بمحرك Gemini المباشر.";
    try {
      const parsed = JSON.parse(errText);
      errMsg = parsed.error?.message || errMsg;
    } catch {}
    throw new Error(`خطأ Gemini API: ${errMsg}`);
  }

  const resultData = await response.json();
  const rawContent = resultData.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
  const parsedData = JSON.parse(rawContent);

  const rawQuestions: any[] = parsedData.questions || [];
  const extractedQuestions: ExtractedQuestion[] = rawQuestions.map((q, idx) => ({
    number: q.number || idx + 1,
    question: q.questionAr || q.question || `سؤال ${idx + 1}`,
    questionAr: q.questionAr || q.question || `سؤال ${idx + 1}`,
    questionEn: q.questionEn || q.question || `Question ${idx + 1}`,
    type: "mcq",
    options: q.optionsAr || q.options || ["أ", "ب", "ج", "د"],
    optionsAr: q.optionsAr || q.options || ["أ", "ب", "ج", "د"],
    optionsEn: q.optionsEn || q.options || ["A", "B", "C", "D"],
    correctAnswer: typeof q.correctIndex === "number" ? q.correctIndex : q.correctAnswer || 0,
    correctIndex: typeof q.correctIndex === "number" ? q.correctIndex : q.correctAnswer || 0,
    explanation: q.explanationAr || q.explanation || "الإجابة النموذجية المعتمدة",
    explanationAr: q.explanationAr || q.explanation || "الإجابة النموذجية المعتمدة",
    explanationEn: q.explanationEn || q.explanation || "Standard verified solution",
    points: q.points || Math.round(100 / Math.max(1, rawQuestions.length)),
  }));

  const baseTemplate =
    templateCode && templateCode.includes("originalExamData")
      ? templateCode
      : OFFICIAL_HESHAM_EXAM_TEMPLATE;

  const generatedCode = hydrateClientExamTemplate({
    code: baseTemplate,
    questions: extractedQuestions,
    examTitle: parsedData.examTitle || examTitle,
    durationMinutes: durationMinutes,
  });

  return {
    examTitle: parsedData.examTitle || examTitle,
    detectedLanguage: "html",
    suggestedFileName: "interactive_exam.html",
    summary:
      parsedData.summary ||
      `تم استخراج وتوليد ${extractedQuestions.length} أسئلة بنجاح من المواد المرفقة عبر محرك الذكاء الاصطناعي.`,
    extractedQuestions,
    generatedCode,
    generatedAt: new Date().toISOString(),
    generationMode: generationMode,
  };
}
