import { ExamGenerationResult, ExtractedQuestion, GenerationMode } from "../types";
import { OFFICIAL_HESHAM_EXAM_TEMPLATE } from "../data/officialTemplate";
import { hydrateClientExamTemplate } from "./clientExamGenerator";
import { getGeminiApiKey } from "../config/api";
import { resolveExamTitleAndGrade } from "../utils/examMetaHelper";
import { ensureExactQuestionCount } from "../utils/questionCountHelper";

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
    base64Data = base64Data.trim().replace(/\s+/g, "");

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
MANDATORY QUESTION COUNT REQUIREMENT: EXACTLY ${questionCount} QUESTIONS!
======================================================================
- The teacher explicitly requested an exam with EXACTLY ${questionCount} questions.
- You MUST generate EXACTLY ${questionCount} distinct, complete questions in the "questions" array.
- The "questions" array in your JSON output MUST have a length of EXACTLY ${questionCount} (items from index 0 to ${questionCount - 1}).
- Under NO circumstances generate fewer than ${questionCount} questions (do NOT stop at 3 or 5).
- If the source image/text only has a few questions, your job is to generate SIMULATED PARALLEL questions on the same lesson/topic until you reach EXACTLY ${questionCount} questions.

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
    text: `CRITICAL MANDATORY INSTRUCTION: Generate EXACTLY ${questionCount} parallel simulated questions in the 'questions' array.
Do NOT generate 3 questions or stop early. You MUST output all ${questionCount} questions completely.
Exam Title: ${resolvedMeta.title}
Grade / Stage: ${resolvedMeta.grade || "محدد بالملاحظات"}
Difficulty: ${difficulty}
Teacher Instructions: ${instructions || "توليد امتحان محاكٍ متكامل لنفس نوع وأفكار الأسئلة"}
Solve Questions: ${solveQuestions ? "yes" : "no"}`,
  });

  const defaultModelsToTry = [
    "gemini-3.8-flash",
    "gemini-flash-latest",
    "gemini-3.1-flash-lite",
    "gemini-2.5-flash-preview-12-2025",
  ];

  let modelsToTry = [...defaultModelsToTry];

  // Try to query Google API dynamically to get the exact models active on this API key
  try {
    const listRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(apiKey)}`
    );
    if (listRes.ok) {
      const listData = await listRes.json();
      if (Array.isArray(listData.models)) {
        const supported = listData.models
          .filter(
            (m: any) =>
              Array.isArray(m.supportedGenerationMethods) &&
              m.supportedGenerationMethods.includes("generateContent")
          )
          .map((m: any) => m.name.replace(/^models\//, ""))
          .filter(
            (n: string) =>
              !n.includes("embedding") &&
              !n.includes("aqa") &&
              !n.includes("imagen")
          );

        if (supported.length > 0) {
          // Prioritize known stable models
          const matched = defaultModelsToTry.filter((m) => supported.includes(m));
          const others = supported.filter((m: string) => !defaultModelsToTry.includes(m));
          modelsToTry = [...matched, ...others];
          console.log("[Gemini Direct] Active models discovered for this key:", modelsToTry);
        }
      }
    }
  } catch (discoveryErr) {
    console.warn("[Gemini Direct] Model discovery skipped, using default priority list:", discoveryErr);
  }

  let lastError: any = null;
  let parsedData: any = null;

  for (const modelName of modelsToTry) {
    try {
      const cleanModel = modelName.replace(/^models\//, "");
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${cleanModel}:generateContent?key=${encodeURIComponent(
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
            maxOutputTokens: 8192,
          },
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        let errMsg = `فشل الاتصال بالنموذج ${cleanModel}`;
        try {
          const parsed = JSON.parse(errText);
          errMsg = parsed.error?.message || errMsg;
        } catch {}
        lastError = new Error(errMsg);
        console.warn(`[Gemini Direct] Model ${cleanModel} returned error (${response.status}):`, errMsg);

        // If high demand or rate limit, brief sleep before trying alternative model
        const isTemporary =
          response.status === 503 ||
          response.status === 429 ||
          errMsg.toLowerCase().includes("high demand") ||
          errMsg.toLowerCase().includes("overloaded") ||
          errMsg.toLowerCase().includes("resource");

        if (isTemporary) {
          console.warn(`[Gemini Direct] Temporary surge on ${cleanModel}, waiting 1.2s before trying fallback model...`);
          await new Promise((r) => setTimeout(r, 1200));
        }
        continue;
      }

      const resultData = await response.json();
      const rawContent = resultData.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
      
      let cleanJson = rawContent.trim();
      if (cleanJson.startsWith("```json")) {
        cleanJson = cleanJson.replace(/^```json\s*/i, "").replace(/\s*```$/i, "");
      } else if (cleanJson.startsWith("```")) {
        cleanJson = cleanJson.replace(/^```\s*/i, "").replace(/\s*```$/i, "");
      }

      let candidateData: any = null;
      try {
        candidateData = JSON.parse(cleanJson);
      } catch {
        const jsonMatch = cleanJson.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          try {
            candidateData = JSON.parse(jsonMatch[0]);
          } catch {}
        }
      }

      const questionsList = candidateData?.questions || candidateData?.extractedQuestions;

      if (candidateData && Array.isArray(questionsList) && questionsList.length > 0) {
        candidateData.questions = questionsList;
        parsedData = candidateData;
        console.log(`[Gemini Direct] Successfully extracted exam from source using model: ${cleanModel}`);
        break;
      }
    } catch (err: any) {
      lastError = err;
      console.warn(`[Gemini Direct] Model ${modelName} fetch exception:`, err?.message || err);
      await new Promise((r) => setTimeout(r, 600));
    }
  }

  if (!parsedData || !Array.isArray(parsedData.questions) || parsedData.questions.length === 0) {
    throw new Error(`خطأ Gemini API: ${lastError?.message || "تعذر استخراج الأسئلة من النماذج المدعومة"}`);
  }

  const rawQuestions: any[] = parsedData.questions || [];
  const normalizedQuestions: ExtractedQuestion[] = rawQuestions.map((q, idx) => ({
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
    points: q.points || Math.round(100 / Math.max(1, questionCount)),
  }));

  const finalMeta = resolveExamTitleAndGrade({
    examTitle: parsedData.examTitle || resolvedMeta.title,
    instructions: instructions,
    examText: examText,
  });

  // ABSOLUTE GUARANTEE: Enforce that extractedQuestions has EXACTLY questionCount items!
  const extractedQuestions = ensureExactQuestionCount(normalizedQuestions, questionCount, {
    topicHint: `${finalMeta.title} ${finalMeta.subheading} ${instructions || ""} ${examText || ""}`,
    examTitle: finalMeta.title,
    grade: finalMeta.grade,
    subject: finalMeta.subject,
  });

  const baseTemplate =
    templateCode && templateCode.includes("originalExamData")
      ? templateCode
      : OFFICIAL_HESHAM_EXAM_TEMPLATE;

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
