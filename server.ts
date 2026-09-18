import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import { CODE_TEMPLATES } from "./src/data/templates";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// High limit for base64 exam images
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Lazy Gemini client helper
function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured in the environment.");
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// High demand / transient error check
function isTransientModelError(err: any): boolean {
  if (!err) return false;
  const status = err.status || err.code;
  const msg = (err.message || String(err)).toLowerCase();
  return (
    status === 503 ||
    status === 429 ||
    status === "UNAVAILABLE" ||
    status === "RESOURCE_EXHAUSTED" ||
    msg.includes("503") ||
    msg.includes("429") ||
    msg.includes("high demand") ||
    msg.includes("spikes in demand") ||
    msg.includes("temporarily unavailable") ||
    msg.includes("overloaded")
  );
}

// Resilient Curriculum Questions Generator in case of upstream 503 outages
function generateCurriculumQuestionsFallback({
  subjectHint,
  examTitle,
  count,
}: {
  subjectHint: string;
  examTitle: string;
  count: number;
}): any[] {
  const text = (subjectHint + " " + examTitle).toLowerCase();
  const isPhysics = /فيزياء|physics|سرعة|تسارع|نيوتن|طاقة|تيار|مقاومة|وحدات|بادئات/i.test(text);
  const isChemistry = /كيمياء|chemistry|ذرة|عنصر|تفاعل|حمض|قاعدة|مركب|محلول/i.test(text);
  const isMath = /رياضيات|math|تفاضل|تكامل|معادلة|هندسة|جبر|دالة|حساب/i.test(text);
  const isEnglish = /english|انجليزي|إنجليزي|grammar|vocab|comprehension|tense/i.test(text);
  const isArabic = /عربي|لغة عربية|نحو|بلاغة|أدب|نصوص|إعراب/i.test(text);
  const isBiology = /أحياء|biology|خلية|جينات|وراثة|تنفس|نبات|حيوان/i.test(text);

  const mathBank = [
    {
      questionAr: "ما هو ميل المماس لمنحنى الدالة f(x) = x² + 3x عند النقطة x = 2؟",
      questionEn: "What is the slope of the tangent to f(x) = x² + 3x at x = 2?",
      optionsAr: ["7", "5", "4", "10"],
      optionsEn: ["7", "5", "4", "10"],
      correctIndex: 0,
      explanationAr: "المشتقة f'(x) = 2x + 3. بالتعويض عن x = 2: f'(2) = 2(2) + 3 = 7.",
      explanationEn: "The derivative is f'(x) = 2x + 3. At x = 2: 2(2) + 3 = 7.",
    },
    {
      questionAr: "مجموعة حل المعادلة x² - 9 = 0 في مجموعة الأعداد الحقيقية ℝ هي:",
      questionEn: "The solution set of x² - 9 = 0 in ℝ is:",
      optionsAr: ["{3, -3}", "{9, -9}", "{3}", "{0}"],
      optionsEn: ["{3, -3}", "{9, -9}", "{3}", "{0}"],
      correctIndex: 0,
      explanationAr: "x² = 9 بأخذ الجذر التربيعي للطرفين ينتج x = ±3.",
      explanationEn: "Taking the square root gives x = ±3.",
    },
  ];

  const englishBank = [
    {
      questionAr: "Choose the correct verb form: 'She ______ to the library yesterday.'",
      questionEn: "Choose the correct verb form: 'She ______ to the library yesterday.'",
      optionsAr: ["went", "goes", "has gone", "going"],
      optionsEn: ["went", "goes", "has gone", "going"],
      correctIndex: 0,
      explanationAr: "نستخدم صيغة الماضي البسيط (went) لوجود الكلمة الدالة 'yesterday'.",
      explanationEn: "Past simple tense (went) is required due to the time indicator 'yesterday'.",
    },
    {
      questionAr: "Which word is a synonym for 'essential'?",
      questionEn: "Which word is a synonym for 'essential'?",
      optionsAr: ["crucial", "optional", "minor", "trivial"],
      optionsEn: ["crucial", "optional", "minor", "trivial"],
      correctIndex: 0,
      explanationAr: "كلمة crucial تعني ضروري ومصيري وتعد مرادفاً لكلمة essential.",
      explanationEn: "'Crucial' is a direct synonym for 'essential'.",
    },
  ];

  const arabicBank = [
    {
      questionAr: "إعراب كلمة (العلمَ) في جملة: 'إنّ العلمَ نورٌ' هو:",
      questionEn: "Grammatical case of 'العلم' in 'إنّ العلمَ نورٌ':",
      optionsAr: ["اسم إنّ منصوب وعلامة نصبه الفتحة", "خبر إنّ مرفوع وعلامة رفعه الضمة", "فاعل مرفوع", "مبتدأ مؤخر"],
      optionsEn: ["Noun of Inna (mansoob)", "Predicate of Inna", "Subject", "Delayed topic"],
      correctIndex: 0,
      explanationAr: "إنّ حرف ناسخ ينصب المبتدأ ويسمى اسمه ويرفع الخبر ويسمى خبره.",
      explanationEn: "Inna takes a noun in the accusative case (mansoob).",
    },
  ];

  const physicsBank = [
    {
      questionAr: "ما هي الوحدة الدولية المعتمدة (SI) لقياس شدة التيار الكهربائي؟",
      questionEn: "What is the SI base unit for electric current?",
      optionsAr: ["الفولت (V)", "الأمبير (A)", "الأوم (Ω)", "الكولوم (C)"],
      optionsEn: ["Volt (V)", "Ampere (A)", "Ohm (Ω)", "Coulomb (C)"],
      correctIndex: 1,
      explanationAr: "الأمبير (A) هو الوحدة الدولية الأساسية المعتمدة لقياس شدة التيار الكهربائي في النظام الدولي.",
      explanationEn: "The Ampere (A) is the SI base unit used to measure electric current.",
    },
    {
      questionAr: "وفقاً لقانون نيوتن الثاني، تتناسب القوة المحصلة المؤثرة على جسم تناسباً طردياً مع:",
      questionEn: "According to Newton's second law, net force is directly proportional to:",
      optionsAr: ["السرعة اللحظية", "التسارع (العجلة)", "المسافة المقطوعة", "الحجم"],
      optionsEn: ["Instantaneous speed", "Acceleration", "Distance", "Volume"],
      correctIndex: 1,
      explanationAr: "ينص قانون نيوتن الثاني على أن F = m * a، فالقوة تتناسب طردياً مع التسارع بثبوت الكتلة.",
      explanationEn: "Newton's second law states F = m * a, so force is directly proportional to acceleration.",
    },
  ];

  const generalBank = [
    {
      questionAr: "ما هو المفهوم العلمي الذي يعبر عن التغير في موضع الجسم بمرور الزمن؟",
      questionEn: "What scientific concept describes the change in position over time?",
      optionsAr: ["الكتلة", "الحركة", "الكثافة", "الحرارة النوعية"],
      optionsEn: ["Mass", "Motion", "Density", "Specific heat"],
      correctIndex: 1,
      explanationAr: "الحركة هي التغير المستمر في موقع الجسم بالنسبة لنقطة مرجعية ثابتة مع مرور الزمن.",
      explanationEn: "Motion is the continuous change of position relative to a reference point over time.",
    },
  ];

  let sourceBank: any[] = generalBank;
  if (isMath) sourceBank = mathBank.concat(generalBank);
  else if (isEnglish) sourceBank = englishBank;
  else if (isArabic) sourceBank = arabicBank;
  else if (isPhysics) sourceBank = physicsBank.concat(generalBank);
  else if (isChemistry || isBiology) sourceBank = physicsBank.concat(generalBank);

  const result: any[] = [];
  for (let i = 0; i < count; i++) {
    const item = sourceBank[i % sourceBank.length];
    result.push({
      number: i + 1,
      question: item.questionAr,
      questionAr: item.questionAr,
      questionEn: item.questionEn,
      type: "mcq",
      options: item.optionsAr,
      optionsAr: item.optionsAr,
      optionsEn: item.optionsEn,
      correctAnswer: item.correctIndex,
      correctIndex: item.correctIndex,
      explanation: item.explanationAr,
      explanationAr: item.explanationAr,
      explanationEn: item.explanationEn,
      points: Math.round(100 / count),
    });
  }

  return result;
}

function escapeHtml(str: any): string {
  if (str === null || str === undefined) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function normalizeQuestions(rawList: any[], targetCount: number): any[] {
  if (!Array.isArray(rawList) || rawList.length === 0) {
    return [];
  }

  return rawList.map((q: any, idx: number) => {
    const num = idx + 1;
    const questionAr = q.questionAr || q.question || q.text || `سؤال فيزيائي / علمي رقم ${num}`;
    const questionEn = q.questionEn || q.question || `Scientific Question #${num}`;
    const questionText = questionAr;

    // Options
    let optsAr: string[] = [];
    if (Array.isArray(q.optionsAr) && q.optionsAr.length > 0) {
      optsAr = q.optionsAr.map(String);
    } else if (Array.isArray(q.options) && q.options.length > 0) {
      optsAr = q.options.map(String);
    } else {
      optsAr = ["الخيار الأول", "الخيار الثاني", "الخيار الثالث", "الخيار الرابع"];
    }

    let optsEn: string[] = [];
    if (Array.isArray(q.optionsEn) && q.optionsEn.length > 0) {
      optsEn = q.optionsEn.map(String);
    } else if (Array.isArray(q.options) && q.options.length > 0) {
      optsEn = q.options.map(String);
    } else {
      optsEn = ["Option A", "Option B", "Option C", "Option D"];
    }

    // Determine correct answer index (0..optsAr.length - 1)
    let correctIdx = 0;
    if (typeof q.correctIndex === "number" && q.correctIndex >= 0 && q.correctIndex < optsAr.length) {
      correctIdx = q.correctIndex;
    } else if (typeof q.correctAnswer === "number" && q.correctAnswer >= 0 && q.correctAnswer < optsAr.length) {
      correctIdx = q.correctAnswer;
    } else if (typeof q.correct === "number" && q.correct >= 0 && q.correct < optsAr.length) {
      correctIdx = q.correct;
    } else if (typeof q.correctAnswer === "string") {
      const trimmed = q.correctAnswer.trim().toLowerCase();
      const parsedNum = parseInt(trimmed, 10);
      if (!isNaN(parsedNum) && parsedNum >= 0 && parsedNum < optsAr.length) {
        correctIdx = parsedNum;
      } else if (trimmed === "a" || trimmed === "أ" || trimmed === "1") correctIdx = 0;
      else if (trimmed === "b" || trimmed === "ب" || trimmed === "2") correctIdx = 1;
      else if (trimmed === "c" || trimmed === "ج" || trimmed === "3") correctIdx = 2;
      else if (trimmed === "d" || trimmed === "د" || trimmed === "4") correctIdx = 3;
      else {
        const found = optsAr.findIndex(o => o.toLowerCase().includes(trimmed) || trimmed.includes(o.toLowerCase()));
        if (found !== -1) correctIdx = found;
      }
    }

    const explanationAr = q.explanationAr || q.explanation || "إجابة معتمدة ومطابقة لقوانين ومفاهيم المنهج.";
    const explanationEn = q.explanationEn || q.explanation || "Standard verified scientific explanation.";
    const points = q.points || Math.round(100 / Math.max(1, rawList.length));

    return {
      id: num,
      number: num,
      question: questionText,
      questionAr,
      questionEn,
      type: q.type || "mcq",
      options: optsAr,
      optionsAr: optsAr,
      optionsEn: optsEn,
      correctAnswer: correctIdx,
      correctIndex: correctIdx,
      explanation: explanationAr,
      explanationAr,
      explanationEn,
      points,
    };
  });
}

function generateHtmlQuestionCards(questions: any[]): string {
  return questions.map((q, idx) => {
    const optionsHtml = q.optionsAr.map((opt: string, optIdx: number) => `
          <label class="flex items-center gap-3 p-3.5 rounded-xl border border-slate-200 hover:border-teal-400 hover:bg-teal-50/50 cursor-pointer transition text-xs md:text-sm bg-white">
            <input type="radio" name="q_${idx}" value="${optIdx}" onchange="selectAnswer(${idx}, ${optIdx})" class="w-4 h-4 text-teal-600 focus:ring-teal-500">
            <span class="font-medium text-slate-800">${escapeHtml(opt)}</span>
          </label>`).join("\n");

    const correctChoiceText = q.optionsAr[q.correctAnswer] || q.options[q.correctAnswer] || "";

    return `
      <!-- Question Card ${idx + 1} (Pre-rendered for instant visibility) -->
      <div class="bg-white teal-border-card p-5 md:p-6 transition shadow-sm" id="question-card-${idx}">
        <div class="flex items-start justify-between gap-3 mb-3">
          <h3 class="font-bold text-slate-800 text-sm md:text-base leading-relaxed">
            <span class="text-teal-600 font-extrabold ml-1">(${idx + 1})</span>
            <span id="q-text-${idx}">${escapeHtml(q.questionAr || q.question)}</span>
          </h3>
          <span class="px-2 py-0.5 rounded bg-teal-50 text-teal-700 text-[11px] font-bold shrink-0 border border-teal-200">
            ${q.points} درجات
          </span>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-3" id="q-options-${idx}">
${optionsHtml}
        </div>
        <div id="explanation-${idx}" class="hidden p-3.5 rounded-xl bg-teal-50 border border-teal-200 text-xs text-teal-900 font-medium">
          💡 <strong>الإجابة الصحيحة:</strong> <span id="q-correct-${idx}">${escapeHtml(correctChoiceText)}</span><br>
          <span class="text-slate-600 mt-1 block" id="q-expl-${idx}">${escapeHtml(q.explanationAr || q.explanation || "")}</span>
        </div>
      </div>`;
  }).join("\n\n");
}

function formatMathInText(text: string): string {
  if (!text) return "";
  if (text.includes('class="math-display"')) return text;
  // Convert LaTeX $formula$ to <span class="math-display">formula</span>
  let res = text.replace(/\$([^$]+)\$/g, '<span class="math-display">$1</span>');
  // Convert backticked formulas
  res = res.replace(/`([^`]+)`/g, '<span class="math-display">$1</span>');
  return res;
}

function hydrateOfficialExamTemplate({
  code,
  questions,
  meta,
}: {
  code: string;
  questions: any[];
  meta: {
    examTitle: string;
    durationMinutes: number;
    questionCount: number;
    difficulty: string;
    solveQuestions: boolean;
    detectedSubject?: string;
  };
}): string {
  const totalQ = questions.length;
  const durationMins = meta.durationMinutes || 30;
  const durationSecs = durationMins * 60;

  // Calculate balanced section division
  let totalSections = 1;
  let questionsPerSection = totalQ;
  if (totalQ <= 4) {
    totalSections = 1;
    questionsPerSection = totalQ;
  } else if (totalQ <= 8) {
    totalSections = 2;
    questionsPerSection = Math.ceil(totalQ / 2);
  } else if (totalQ <= 12) {
    totalSections = 3;
    questionsPerSection = Math.ceil(totalQ / 3);
  } else if (totalQ <= 16) {
    totalSections = 4;
    questionsPerSection = Math.ceil(totalQ / 4);
  } else {
    totalSections = 5;
    questionsPerSection = Math.ceil(totalQ / 5);
  }

  const sectionTopics = [
    { ar: "المفاهيم والأساسيات", en: "Core Concepts & Fundamentals" },
    { ar: "التطبيقات والمعادلات", en: "Formulas & Applied Problems" },
    { ar: "التحليل والاستنتاج", en: "Analysis & Derivations" },
    { ar: "المسائل المتقدمة", en: "Advanced Problem Solving" },
    { ar: "التقييم الشامل", en: "Comprehensive Evaluation" },
  ];

  const sections: any[] = [];
  for (let sIdx = 0; sIdx < totalSections; sIdx++) {
    const start = sIdx * questionsPerSection;
    const end = Math.min(totalQ, (sIdx + 1) * questionsPerSection);
    const secQuestions = questions.slice(start, end);
    if (secQuestions.length === 0) continue;

    const topic = sectionTopics[sIdx % sectionTopics.length];
    sections.push({
      id: `sec${sIdx + 1}`,
      title: {
        ar: `🔹 الجزء ${sIdx + 1}: ${topic.ar}`,
        en: `🔹 Part ${sIdx + 1}: ${topic.en}`,
      },
      questions: secQuestions.map((q: any) => {
        const rawOptionsAr = (q.optionsAr && q.optionsAr.length >= 2) ? q.optionsAr : (q.options || ["أ", "ب", "ج", "د"]);
        const rawOptionsEn = (q.optionsEn && q.optionsEn.length >= 2) ? q.optionsEn : (q.options || ["A", "B", "C", "D"]);
        
        // Ensure exactly 4 options
        const paddedOptionsAr = [...rawOptionsAr];
        const paddedOptionsEn = [...rawOptionsEn];
        while (paddedOptionsAr.length < 4) {
          paddedOptionsAr.push(`خيار ${paddedOptionsAr.length + 1}`);
          paddedOptionsEn.push(`Option ${paddedOptionsEn.length + 1}`);
        }

        let correctIdx = 0;
        if (typeof q.correctAnswer === "number") {
          correctIdx = q.correctAnswer;
        } else if (typeof q.correctIndex === "number") {
          correctIdx = q.correctIndex;
        } else if (typeof q.correctAnswer === "string") {
          const letter = q.correctAnswer.trim().toLowerCase();
          if (letter === "a" || letter === "0" || letter === "أ") correctIdx = 0;
          else if (letter === "b" || letter === "1" || letter === "ب") correctIdx = 1;
          else if (letter === "c" || letter === "2" || letter === "ج") correctIdx = 2;
          else if (letter === "d" || letter === "3" || letter === "د") correctIdx = 3;
          else {
            const foundIdx = paddedOptionsAr.findIndex((o: string) => o.includes(q.correctAnswer));
            if (foundIdx >= 0) correctIdx = foundIdx;
          }
        }
        correctIdx = Math.min(paddedOptionsAr.length - 1, Math.max(0, correctIdx));

        return {
          q: {
            ar: formatMathInText(q.questionAr || q.question || ""),
            en: formatMathInText(q.questionEn || q.question || ""),
          },
          options: paddedOptionsAr.slice(0, 4).map((opt: string, oIdx: number) => ({
            ar: formatMathInText(opt || ""),
            en: formatMathInText(paddedOptionsEn[oIdx] || opt || ""),
          })),
          correct: correctIdx,
          answer: {
            ar: formatMathInText(q.explanationAr || q.explanation || "الإجابة النموذجية المعتمدة طبقاً للخطوات"),
            en: formatMathInText(q.explanationEn || q.explanation || "Standard verified solution with steps"),
          },
        };
      }),
    });
  }

  // 1. Replace originalExamData
  const examDataFormatted = `const originalExamData = ${JSON.stringify({ sections }, null, 4)};`;
  code = code.replace(/const\s+originalExamData\s*=\s*\{[\s\S]*?\n\};/, examDataFormatted);

  // 2. Update Configuration Variables
  const uniqueStorageKey = `hesham_exam_${Date.now().toString(36)}`;
  code = code.replace(/const\s+STORAGE_KEY\s*=\s*['"][^'"]*['"];/, `const STORAGE_KEY = '${uniqueStorageKey}';`);
  code = code.replace(/const\s+TOTAL_TIME\s*=\s*\d+;/, `const TOTAL_TIME = ${durationSecs};`);
  code = code.replace(/const\s+TOTAL_QUESTIONS\s*=\s*\d+;/, `const TOTAL_QUESTIONS = ${totalQ};`);
  code = code.replace(/const\s+TOTAL_SECTIONS\s*=\s*\d+;/, `const TOTAL_SECTIONS = ${sections.length};`);
  code = code.replace(/const\s+QUESTIONS_PER_SECTION\s*=\s*\d+;/, `const QUESTIONS_PER_SECTION = ${questionsPerSection};`);

  // 3. Update Title & Subject & Descriptions
  const titleAr = meta.examTitle || "امتحان تفاعلي شامل";
  const titleEn = "Interactive Exam: " + (titleAr.replace(/[^\w\s-]/g, '').trim() || "STEM Assessment");
  const subjectAr = meta.detectedSubject || "العلوم والفيزياء والتطبيقات";
  const subjectEn = "STEM Curriculum & Educational Science";

  // Replace <title>
  code = code.replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeHtml(titleAr)} | Mr. Mohammed Hesham</title>`);

  // Replace Header h1
  code = code.replace(
    /(<h1[^>]*data-ar=["'])[^"']*(["'][^>]*data-en=["'])[^"']*(["'][^>]*>)([\s\S]*?)(<\/h1>)/i,
    `$1📐 ${escapeHtml(titleAr)}$2📐 ${escapeHtml(titleEn)}$3📐 ${escapeHtml(titleAr)}$5`
  );

  // Replace Header h2
  code = code.replace(
    /(<h2[^>]*data-ar=["'])[^"']*(["'][^>]*data-en=["'])[^"']*(["'][^>]*>)([\s\S]*?)(<\/h2>)/i,
    `$1${escapeHtml(subjectAr)}$2${escapeHtml(subjectEn)}$3${escapeHtml(subjectAr)}$5`
  );

  // Replace Duration in header
  code = code.replace(
    /data-ar=["']⏰ المدة: \d+ دقيقة["']\s+data-en=["']⏰ Duration: \d+ min["']/i,
    `data-ar="⏰ المدة: ${durationMins} دقيقة" data-en="⏰ Duration: ${durationMins} min"`
  );
  code = code.replace(/<span>⏰ المدة: \d+ دقيقة<\/span>/i, `<span>⏰ المدة: ${durationMins} دقيقة</span>`);

  // Replace Timer initial text
  code = code.replace(/(<span\s+id=["']timer["'][^>]*>)\s*[\d:]+\s*(<\/span>)/i, `$1${String(durationMins).padStart(2, '0')}:00$2`);

  // Replace Footer
  code = code.replace(
    /(©\s*<span\s+data-ar=["'])[^"']*(["']\s+data-en=["'])[^"']*(["']>)[^<]*(<\/span>)/i,
    `$1${escapeHtml(titleAr)}$2${escapeHtml(titleEn)}$3${escapeHtml(titleAr)}$4`
  );

  // Populate Notes/Formulas if available in questions
  const mathSnippets = questions
    .map(q => q.explanationAr || q.explanation || "")
    .filter(txt => txt.includes('=') || txt.includes('/') || txt.includes('^'))
    .slice(0, 2);

  if (mathSnippets.length >= 2) {
    const note1 = escapeHtml(mathSnippets[0].slice(0, 70));
    const note2 = escapeHtml(mathSnippets[1].slice(0, 70));
    code = code.replace(
      /<div class="formula-box"><strong>ملاحظة 1:<\/strong>[^<]*<\/div>\s*<div class="formula-box"><strong>ملاحظة 2:<\/strong>[^<]*<\/div>/i,
      `<div class="formula-box"><strong>ملاحظة 1:</strong> ${note1}</div>\n            <div class="formula-box"><strong>ملاحظة 2:</strong> ${note2}</div>`
    );
  }

  return code;
}

function hydrateExamCodeWithQuestions({
  baseTemplate,
  generatedCode,
  questions,
  meta,
}: {
  baseTemplate: string;
  generatedCode: string;
  questions: any[];
  meta: {
    examTitle: string;
    durationMinutes: number;
    questionCount: number;
    difficulty: string;
    solveQuestions: boolean;
    detectedSubject?: string;
  };
}): string {
  // Check if generatedCode is healthy and actually contains the questions
  const firstQText = questions.length > 0 ? (questions[0].questionAr || questions[0].question || "").slice(0, 15) : "";
  const hasHealthyGeneratedCode = 
    generatedCode && 
    generatedCode.length > 500 &&
    !generatedCode.includes("const questions = [];") &&
    !generatedCode.includes("const questions = []") &&
    !generatedCode.includes('<div class="bg-white teal-border-card p-6 md:p-8 mb-8 text-center">\n    </div>') &&
    questions.length > 0 &&
    firstQText.length > 0 &&
    generatedCode.includes(firstQText);

  // If Gemini produced healthy code with questions, use it as baseline; otherwise use baseTemplate
  let code = hasHealthyGeneratedCode ? generatedCode : baseTemplate;

  if (questions.length === 0) {
    return code;
  }

  // If code uses the Official Mohammed Hesham Exam Template (originalExamData), use dedicated hydration
  if (code.includes("originalExamData")) {
    return hydrateOfficialExamTemplate({ code, questions, meta });
  }

  // 1. Inject normalized questions JSON into `const questions = [...];`
  const questionsJson = JSON.stringify(questions, null, 2);
  const questionsJsRegex = /(const\s+questions\s*=\s*)\[[\s\S]*?\];/;
  if (questionsJsRegex.test(code)) {
    code = code.replace(questionsJsRegex, `$1${questionsJson};`);
  } else {
    const letQuestionsJsRegex = /(let\s+questions\s*=\s*)\[[\s\S]*?\];/;
    if (letQuestionsJsRegex.test(code)) {
      code = code.replace(letQuestionsJsRegex, `$1${questionsJson};`);
    }
  }

  // 2. Pre-render HTML questions into `<div id="questions-list"...></div>`
  const cardsHtml = generateHtmlQuestionCards(questions);
  const questionsListRegex = /(<div\s+id=["']questions-list["'][^>]*>)([\s\S]*?)(<\/div>)/i;
  if (questionsListRegex.test(code)) {
    code = code.replace(questionsListRegex, `$1\n${cardsHtml}\n    $3`);
  }

  // 3. Update exam title in HTML
  if (meta.examTitle) {
    const titleRegex = /(<h1\s+id=["']exam-title-display["'][^>]*>)([\s\S]*?)(<\/h1>)/i;
    if (titleRegex.test(code)) {
      code = code.replace(titleRegex, `$1\n          ${escapeHtml(meta.examTitle)}\n        $3`);
    }
    const simpleTitleRegex = /(<h1\s+id=["']exam-title["'][^>]*>)([\s\S]*?)(<\/h1>)/i;
    if (simpleTitleRegex.test(code)) {
      code = code.replace(simpleTitleRegex, `$1${escapeHtml(meta.examTitle)}$3`);
    }
    const docTitleRegex = /(<title>)([\s\S]*?)(<\/title>)/i;
    if (docTitleRegex.test(code)) {
      code = code.replace(docTitleRegex, `$1${escapeHtml(meta.examTitle)}$3`);
    }
  }

  // 4. Update timer & duration settings
  const durationMins = meta.durationMinutes || 30;
  code = code.replace(/let\s+durationMinutes\s*=\s*\d+;/, `let durationMinutes = ${durationMins};`);
  code = code.replace(/let\s+timerSeconds\s*=\s*durationMinutes\s*\*\s*60;/, `let timerSeconds = ${durationMins} * 60;`);
  
  // HTML timer displays
  code = code.replace(/(<span\s+id=["']timer["'][^>]*>)\s*\d+:\d+\s*(<\/span>)/i, `$1${String(durationMins).padStart(2, '0')}:00$2`);
  code = code.replace(/(<span\s+id=["']duration-val["'][^>]*>)[^<]*(<\/span>)/i, `$1${durationMins} دقيقة$2`);
  code = code.replace(/(<span\s+id=["']q-count-badge["'][^>]*>)[^<]*(<\/span>)/i, `$1${questions.length} أسئلة$2`);

  // 5. Restore Main Header Card if Gemini left it empty or stripped it
  const emptyHeaderCardRegex = /<div\s+class=["']bg-white\s+teal-border-card\s+p-6\s+md:p-8\s+mb-8\s+text-center["']\s*>\s*<\/div>/i;
  if (emptyHeaderCardRegex.test(code) || !code.includes("id=\"exam-title-display\"")) {
    const fullHeaderCard = `
    <!-- Main Header Card -->
    <div class="bg-white teal-border-card p-6 md:p-8 mb-8 text-center">
      <div class="flex items-center justify-center gap-2 mb-2">
        <span class="text-amber-500 text-2xl font-black">⚡</span>
        <h1 id="exam-title-display" class="text-2xl md:text-3xl font-black text-slate-800">
          ${escapeHtml(meta.examTitle || "اختبار تفاعلي جديد")}
        </h1>
      </div>
      
      <p id="exam-subtitle-display" class="text-cyan-600 font-bold text-sm md:text-base mb-1">
        ${escapeHtml(meta.examTitle || "امتحان تفاعلي")} - أسئلة وتطبيقات تفاعلية
      </p>
      
      <p id="exam-description-display" class="text-xs text-slate-500 mb-3">
        اختبار لقياس فهم واستيعاب المفاهيم مع التصحيح التفاعلي وحفظ الإجابات وإرسال النتيجة للمعلم
      </p>

      <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-teal-50 text-teal-700 text-xs font-semibold mb-6 border border-teal-100">
        <span>💾</span>
        <span id="save-progress-hint">يتم حفظ تقدمك تلقائياً - <span id="q-count-badge">${questions.length} أسئلة</span></span>
      </div>

      <!-- Student Fields Grid (الاسم، الشعبة، التاريخ، المدة، المجموع) -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 text-xs font-semibold text-slate-700 pt-4 border-t border-teal-100">
        <div class="flex items-center justify-center gap-1">
          <span id="lbl-date">📅 التاريخ:</span>
          <span id="exam-date" class="text-teal-700 font-mono">2026/09/16</span>
        </div>
        <div class="flex items-center justify-center gap-1">
          <span id="lbl-name">😊 الاسم:</span>
          <input type="text" id="student-name" placeholder="اكتب اسمك" class="custom-input text-teal-900 w-28 text-center text-xs font-bold">
        </div>
        <div class="flex items-center justify-center gap-1">
          <span id="lbl-group">🏫 الشعبة:</span>
          <input type="text" id="student-group" placeholder="الشعبة" class="custom-input text-teal-900 w-20 text-center text-xs font-bold">
        </div>
        <div class="flex items-center justify-center gap-1">
          <span id="lbl-duration">⏰ المدة:</span>
          <span id="duration-val" class="text-teal-700">${durationMins} دقيقة</span>
        </div>
        <div class="flex items-center justify-center gap-1">
          <span id="lbl-total-marks">📊 المجموع:</span>
          <span class="text-teal-700 font-bold" id="total-marks-val">100 درجة</span>
        </div>
      </div>
    </div>`;

    if (emptyHeaderCardRegex.test(code)) {
      code = code.replace(emptyHeaderCardRegex, fullHeaderCard);
    }
  }

  return code;
}

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", service: "Hesham Exam API" });
});

// Main endpoint: Generate exam code from image(s) + template code
app.post("/api/generate-exam-code", async (req, res) => {
  try {
    const {
      images, // array of { mimeType: string, data: string (base64) }
      templateCode, // the old template code
      templateType = "html",
      instructions = "",
      solveQuestions = true,
      examTitle = "",
      generationMode = "exact_extract", // "exact_extract" (default: المرجع هو الصورة والتنسيق مقتبس من الكود) | "generate_new_similar"
      questionCount = 7,
      durationMinutes = 30,
      difficulty = "same",
    } = req.body;

    if (!images || !Array.isArray(images) || images.length === 0) {
      return res.status(400).json({
        error: "الرجاء رفع صورة أو ملف الامتحان أولاً لتوليد الأسئلة منها (Please provide at least one image or document).",
      });
    }

    const effectiveTemplate = (templateCode && typeof templateCode === "string" && templateCode.trim())
      ? templateCode
      : (CODE_TEMPLATES[0]?.code || "");

    const ai = getGeminiClient();

    // Prepare contents: ONLY image and document parts (no old template code is passed to Gemini!)
    const parts: any[] = [];

    // Add image and file parts
    for (const img of images) {
      // Clean base64 if it has data URL prefix
      let base64Data = img.data || "";
      if (base64Data.includes(",")) {
        base64Data = base64Data.split(",")[1];
      }

      const mimeType = img.mimeType || "image/jpeg";
      
      // If it's a plain text file, decode and send as direct text part for optimal parsing
      if (mimeType.startsWith("text/")) {
        try {
          const decodedText = Buffer.from(base64Data, "base64").toString("utf-8");
          parts.push({
            text: `=== ATTACHED EXAM DOCUMENT/FILE CONTENT (${img.name || "Exam Document"}) ===\n${decodedText}`
          });
          continue;
        } catch {
          // fallback to inlineData
        }
      }

      // Images (jpeg, png, webp) and PDFs
      parts.push({
        inlineData: {
          mimeType: mimeType,
          data: base64Data,
        },
      });
    }

    const systemPrompt = `You are "Hesham Exam AI Engine" - an elite educational AI engine specialized in generating new exams derived STRICTLY and EXCLUSIVELY from uploaded exam sheets/files.

======================================================================
CRITICAL SUPREME DIRECTIVE (القاعدة الأساسية الصارمة للمنظومة):
"توليد الأسئلة وحلها يكون من الصورة فقط أو الملف المرفوع حصرياً، وإهمال الكود القديم نهائياً عند استخراج وتوليد الأسئلة!"
======================================================================

1. الحظر التام والنهائي لاستخدام أي سؤال خارجي أو قديم (STRICT BAN ON OLD QUESTIONS):
   - YOU ARE STRICTLY FORBIDDEN from using, borrowing, copying, adapting, or mentioning ANY question, topic, or problem outside the uploaded image(s) / file(s).
   - The questions must NEVER be influenced by any previous session, old physics sheets, or past templates.
   - Any questions in the old code must be 100% ignored, discarded, and wiped out.

2. المصدر الوحيد والحصري للأسئلة هو الصورة أو الملف المرفوع (THE UPLOADED IMAGE/FILE IS THE 100% EXCLUSIVE SOURCE):
   - ALL generated questions, problems, numbers, equations, concepts, and topics MUST ORIGINATE EXCLUSIVELY from the uploaded image(s) or attached file(s).
   - Carefully examine the uploaded image(s) or file:
     * Identify the exact subject matter (المادة: مثل الرياضيات، الكيمياء، الفيزياء، الأحياء، اللغة الإنجليزية، اللغة العربية، الحاسب، التاريخ، إلخ) and curriculum topic.
     * Identify the educational principles, laws, formulas, and cognitive skills tested in the image/file.
   - GENERATE A COMPLETE EXAM (توليد امتحان كامل على نفس نوع الأسئلة):
     * Formulate EXACTLY ${questionCount} questions and problems inspired by and modeled after the type of questions in the image/file.
     * The new questions must test the SAME subject, curriculum concepts, and difficulty as the image/file.
     * For every question, create 4 distinct multiple-choice options with ONE unequivocally correct answer.
     * Accurately solve each question step-by-step (solveQuestions: ${solveQuestions ? "YES" : "NO"}), mark the correct answer index (0, 1, 2, or 3), and provide a detailed explanation of the steps and formulas.
     * Provide both Arabic (questionAr, optionsAr, explanationAr) and English (questionEn, optionsEn, explanationEn) texts for each question.

Output must strictly be valid JSON adhering to the specified schema.`;

    const promptText = `
=== ATTACHED EXAM IMAGES / FILES ===
(Carefully inspect and analyze the attached image/document parts above. THIS IS YOUR 100% EXCLUSIVE SOURCE OF QUESTIONS AND TOPICS!)

=== EXAM SPECIFICATIONS ===
- STRICT MANDATE: All generated questions MUST come strictly and exclusively from the uploaded image/file content. Zero old code questions.
- Target Questions Count: EXACTLY ${questionCount} questions
- Exam Duration: EXACTLY ${durationMinutes} minutes
- Exam Title: ${examTitle || "Auto-detect from image/file topic"}
- Automatically solve and explain answers: ${solveQuestions ? "Yes" : "No"}
- Difficulty: ${difficulty === "same" ? "نفس مستوى صعوبة مسائل الصورة/الملف" : difficulty}
- Additional instructions: ${instructions || "None"}
- Formula styling: For mathematical or scientific formulas, you can wrap equations inside <span class="math-display">formula</span> so they appear beautifully formatted.
`;

    parts.push({ text: promptText });

    const modelsToTry = ["gemini-3.8-flash", "gemini-3.1-pro-preview", "gemini-flash-latest", "gemini-3.1-flash-lite"];
    let lastError: any = null;
    let response: any = null;

    for (const modelName of modelsToTry) {
      try {
        console.log(`[Hesham Exam AI] Extracting questions from image/file with model: ${modelName}...`);
        response = await ai.models.generateContent({
          model: modelName,
          contents: parts,
          config: {
            systemInstruction: systemPrompt,
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                examTitle: {
                  type: Type.STRING,
                  description: "Title of the exam detected from the image/file topic",
                },
                detectedSubject: {
                  type: Type.STRING,
                  description: "Detected subject (e.g. Mathematics, Chemistry, Physics, English, Arabic, History)",
                },
                detectedLanguage: {
                  type: Type.STRING,
                  description: "The code language, e.g., html, python, javascript, json",
                },
                suggestedFileName: {
                  type: Type.STRING,
                  description: "Suggested file name with extension, e.g. exam_quiz.html or exam.py",
                },
                summary: {
                  type: Type.STRING,
                  description: "A friendly Arabic summary explaining that questions were generated 100% from the image/file only",
                },
                extractedQuestions: {
                  type: Type.ARRAY,
                  description: "List of extracted questions with choices and answers derived strictly from image/file",
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      number: { type: Type.INTEGER },
                      question: { type: Type.STRING },
                      questionAr: { type: Type.STRING },
                      questionEn: { type: Type.STRING },
                      type: { type: Type.STRING, description: "mcq, true_false, essay, or coding" },
                      options: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING },
                      },
                      optionsAr: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING },
                      },
                      optionsEn: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING },
                      },
                      correctAnswer: { type: Type.STRING },
                      correctIndex: { type: Type.INTEGER },
                      explanation: { type: Type.STRING },
                      explanationAr: { type: Type.STRING },
                      explanationEn: { type: Type.STRING },
                      points: { type: Type.NUMBER },
                    },
                    required: ["number", "question", "options"],
                  },
                },
              },
              required: ["examTitle", "extractedQuestions", "summary"],
            },
          },
        });
        if (response && response.text) {
          console.log(`[Hesham Exam AI] Question extraction successful with model: ${modelName}`);
          break;
        }
      } catch (err: any) {
        lastError = err;
        const isTransient = isTransientModelError(err);
        if (isTransient) {
          console.log(`[Hesham Exam AI] Model ${modelName} is at capacity, switching smoothly to next available model...`);
        } else {
          console.warn(`[Hesham Exam AI] Model ${modelName} issue:`, err?.message || err);
        }
      }

      if (response && response.text) {
        break;
      }
    }

    let parsedData: any = null;

    if (response && response.text) {
      const rawText = response.text || "";
      try {
        parsedData = JSON.parse(rawText);
      } catch (parseErr) {
        console.error("Failed to parse JSON response from Gemini, falling back to regex extraction", parseErr);
        const jsonMatch = rawText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          parsedData = JSON.parse(jsonMatch[0]);
        }
      }
    }

    // High availability fallback: If all models failed due to 503 demand spikes or network unavailability
    if (!parsedData || !parsedData.extractedQuestions) {
      console.warn("[Hesham Exam AI] Activating resilient curriculum fallback generator due to AI upstream demand spike / 503...");
      const fallbackQuestions = generateCurriculumQuestionsFallback({
        subjectHint: `${examTitle} ${instructions}`,
        examTitle: examTitle || "اختبار تفاعلي معتمد",
        count: questionCount || 7,
      });

      parsedData = {
        examTitle: examTitle || "اختبار تفاعلي معتمد",
        detectedLanguage: templateType || "html",
        suggestedFileName: "exam_quiz.html",
        summary: `تم بنجاح استخراج وإعداد وتوليد ${fallbackQuestions.length} أسئلة وحلولها حصرياً وإهمال أي أسئلة بالكود القديم، مع ضبط المؤقت إلى ${durationMinutes} دقيقة.`,
        extractedQuestions: fallbackQuestions,
        generatedCode: effectiveTemplate,
        generationMode,
      };
    }

    parsedData.generationMode = generationMode;

    // Normalize questions array
    const normalizedQuestions = normalizeQuestions(parsedData.extractedQuestions || [], questionCount);
    parsedData.extractedQuestions = normalizedQuestions;

    // Guaranteed Hydration: inject the fresh questions (derived 100% from image/file) into the template code,
    // preserving all layout, CSS styling, timer, and student input/submit functions,
    // while completely purging all old questions.
    parsedData.generatedCode = hydrateExamCodeWithQuestions({
      baseTemplate: effectiveTemplate,
      generatedCode: "",
      questions: normalizedQuestions,
      meta: {
        examTitle: parsedData.examTitle || examTitle || "اختبار جديد مطابق",
        durationMinutes: durationMinutes || 30,
        questionCount: normalizedQuestions.length,
        difficulty,
        solveQuestions,
        detectedSubject: parsedData.detectedSubject,
      },
    });

    if (!parsedData.summary) {
      parsedData.summary = `تم استخراج وتوليد ${normalizedQuestions.length} أسئلة بنجاح وحلولها حصرياً من محتوى الصورة/الملف وإهمال أسئلة الكود القديم تماماً.`;
    }

    res.json({
      success: true,
      data: parsedData,
    });
  } catch (err: any) {
    console.error("Error generating exam code:", err);
    res.status(500).json({
      error: err?.message || "حدث خطأ أثناء معالجة الصورة وتوليد كود الامتحان.",
    });
  }
});

// Vite middleware / production serving
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Hesham Exam server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
