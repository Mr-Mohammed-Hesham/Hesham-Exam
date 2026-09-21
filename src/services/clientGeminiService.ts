import { ExamGenerationResult, ExtractedQuestion, GenerationMode } from "../types";
import { OFFICIAL_HESHAM_EXAM_TEMPLATE } from "../data/officialTemplate";
import { hydrateClientExamTemplate } from "./clientExamGenerator";
import { getGeminiApiKey } from "../config/api";
import { resolveExamTitleAndGrade } from "../utils/examMetaHelper";

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
    examTitle = "",
    questionCount = 7,
    durationMinutes = 30,
    difficulty = "same",
    solveQuestions = true,
    generationMode = "generate_new_similar",
    templateCode = "",
  } = payload;

  // Resolve Title, Grade and Subject dynamically from teacher notes and inputs
  const resolvedMeta = resolveExamTitleAndGrade({
    examTitle,
    instructions,
    examText,
  });

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
      text: `=== EXAM TEXT / LESSON TOPIC / QUESTIONS PROVIDED BY TEACHER ===\n${examText.trim()}\n\nSTRICT REQUIREMENT: Generate the simulated exam questions based on this curriculum content and topic!`,
    });
  }

  // 3. System prompt for simulated exam generation
  const systemPrompt = `You are "Hesham Exam AI Engine" - an elite educational AI engine specialized in generating parallel SIMULATED digital exams for Mr. Mohammed Hesham's educational platform.

======================================================================
CRITICAL PEDAGOGICAL MISSION: FULL SIMULATED EXAM GENERATION (توليد امتحان محاكي بالكامل)
======================================================================
The teacher's absolute imperative rule:
"تذكر دائما دورك هو توليد امتحان محاكي للصورة المرفوعة أو الاسئلة المكتوبة أو عنوان الدرس المكتوب"
"مطلوب توليد امتحان محاكي لنفس نوع الاسئلة وليس كتابة امتحان من مخك أو استخراج للاسئلة فقط"
"اسم الامتحان والصف يتغير حسب ما اكتبه انا في خانة الملاحظات"
"توليد امتحان محاكي كامل وليس نفس الاسئلة"

1. DO NOT MERELY TRANSCRIBE OR COPY-PASTE (ممنوع مجرد استخراج نفس الأسئلة):
   Do not just copy the identical questions word-for-word.

2. DO NOT INVENT RANDOM QUESTIONS FROM YOUR HEAD (ممنوع كتابة امتحان عشوائي من مخك):
   Do not invent arbitrary or random questions unrelated to the source material.

3. YOUR REQUIRED MISSION: GENERATE A PARALLEL SIMULATED EXAM (امتحان محاكي لنفس نوع الأسئلة):
   - Thoroughly inspect the attached image(s), text, or lesson title.
   - Extract:
     * Subject and educational stage (e.g., Physics, Chemistry, Math, Biology).
     * The exact lesson / branch (e.g. Electric circuits & Ohm's law, Kinematics, Chemical equations).
     * Specific physical laws, formulas, mathematical relations, and scientific principles.
     * Question styles (computational problems, graph slope analysis, experimental data tables, physical deductions).
   - Generate BRAND NEW, SIMULATED QUESTIONS that mirror the EXACT SAME type, style, difficulty, and scientific concepts as the source material.
     (e.g., Change numbers, circuit component values, physical scenarios, or ask for another variable using the exact same formula and question style).
   - If the teacher provided a lesson title (e.g. "درس قانون أوم" or "الحركة الدائرية"), generate an intensive simulated exam focused 100% on that lesson.

======================================================================
EXAM TITLE & GRADE MANDATE (اسم الامتحان والصف الدراسي يتغير حسب خانة الملاحظات):
======================================================================
- Target Exam Title: "${resolvedMeta.title}"
- Target Grade / Class: "${resolvedMeta.grade || "الصف الدراسي المحدد"}"
- Target Subject: "${resolvedMeta.subject}"
- Teacher Instructions / Notes: "${instructions || "توليد امتحان محاكٍ متكامل لنفس نمط الأسئلة والأفكار"}"

You MUST set the JSON 'examTitle' property to: "${resolvedMeta.title}".

Question Structure:
- Each question must have:
  * questionAr & questionEn (or bilingual).
  * 4 distinct options (optionsAr & optionsEn).
  * correctIndex (0, 1, 2, or 3).
  * explanationAr & explanationEn with clear step-by-step reasoning.
  * points: integer score.
  * type: "mcq".

Return ONLY valid JSON matching this schema:
{
  "examTitle": "${resolvedMeta.title}",
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
    text: `Generate ${questionCount} parallel simulated questions based on the attached materials and teacher notes.
Exam Title: ${resolvedMeta.title}
Grade / Stage: ${resolvedMeta.grade || "محدد بالملاحظات"}
Difficulty: ${difficulty}
Teacher Instructions: ${instructions || "توليد امتحان محاكٍ متكامل لنفس نوع وأفكار الأسئلة"}
Solve Questions: ${solveQuestions ? "yes" : "no"}`,
  });

  const modelsToTry = [
    "gemini-3.6-flash",
    "gemini-3.8-flash",
    "gemini-flash-latest",
    "gemini-3.1-flash-lite",
  ];

  let lastError: any = null;
  let parsedData: any = null;

  for (const modelName of modelsToTry) {
    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${encodeURIComponent(
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
        let errMsg = `فشل الاتصال بالنموذج ${modelName}`;
        try {
          const parsed = JSON.parse(errText);
          errMsg = parsed.error?.message || errMsg;
        } catch {}
        lastError = new Error(errMsg);
        console.warn(`[Gemini Direct] Model ${modelName} returned error:`, errMsg);
        continue;
      }

      const resultData = await response.json();
      const rawContent = resultData.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
      const candidateData = JSON.parse(rawContent);

      if (candidateData && Array.isArray(candidateData.questions) && candidateData.questions.length > 0) {
        parsedData = candidateData;
        console.log(`[Gemini Direct] Successfully generated exam using model: ${modelName}`);
        break;
      }
    } catch (err: any) {
      lastError = err;
      console.warn(`[Gemini Direct] Model ${modelName} fetch exception:`, err?.message || err);
    }
  }

  if (!parsedData || !Array.isArray(parsedData.questions) || parsedData.questions.length === 0) {
    throw new Error(`خطأ Gemini API: ${lastError?.message || "تعذر استخراج الأسئلة من النماذج المدعومة"}`);
  }

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

  const finalMeta = resolveExamTitleAndGrade({
    examTitle: parsedData.examTitle || resolvedMeta.title,
    instructions: instructions,
    examText: examText,
  });

  const generatedCode = hydrateClientExamTemplate({
    code: baseTemplate,
    questions: extractedQuestions,
    examTitle: finalMeta.title,
    grade: finalMeta.grade,
    subheading: finalMeta.subheading,
    detectedSubject: finalMeta.subject,
    durationMinutes: durationMinutes,
  });

  return {
    examTitle: finalMeta.title,
    detectedLanguage: "html",
    suggestedFileName: "interactive_exam.html",
    summary:
      parsedData.summary ||
      `تم بنجاح توليد امتحان محاكٍ متكامل (${extractedQuestions.length} أسئلة) لـ "${finalMeta.title}" (${finalMeta.subheading}) بناءً على المواد والملاحظات المقدمة.`,
    extractedQuestions,
    generatedCode,
    generatedAt: new Date().toISOString(),
    generationMode: generationMode,
  };
}
