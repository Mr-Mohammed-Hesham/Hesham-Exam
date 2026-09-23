import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import cors from "cors";
import { CODE_TEMPLATES } from "./src/data/templates";
import { resolveExamTitleAndGrade } from "./src/utils/examMetaHelper";
import { ensureExactQuestionCount } from "./src/utils/questionCountHelper";

dotenv.config();

const currentDir = typeof __dirname !== "undefined" ? __dirname : process.cwd();

const app = express();
const PORT = 3000;

// Enable robust CORS for GitHub Pages (mr-mohammed-hesham.github.io) and all cross-origin clients
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Credentials", "true");
  } else {
    res.setHeader("Access-Control-Allow-Origin", "*");
  }
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, X-Requested-With, Accept, Origin, *"
  );
  res.setHeader("Access-Control-Max-Age", "86400");

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }
  next();
});

app.use(
  cors({
    origin: true,
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept", "Origin"],
    credentials: true,
    maxAge: 86400,
  })
);
app.options("*", (_req, res) => {
  res.status(204).end();
});

// High limit for base64 exam images
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Handle JSON parsing errors gracefully with JSON response
app.use((err: any, _req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (err) {
    return res.status(400).json({
      success: false,
      error: err.message || "Invalid JSON payload in request.",
    });
  }
  next();
});

// Lazy Gemini client helper
function getGeminiClient(customApiKey?: string) {
  const apiKey = (customApiKey && customApiKey.trim()) || process.env.GEMINI_API_KEY;
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

function escapeHtml(str: any): string {
  if (str === null || str === undefined) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function formatMathInText(text: string): string {
  if (!text) return "";
  // Convert LaTeX $formula$ to <span class="math-display">formula</span>
  let res = text.replace(/\$([^$]+)\$/g, '<span class="math-display">$1</span>');
  // Convert backticked formulas
  res = res.replace(/`([^`]+)`/g, '<span class="math-display">$1</span>');
  return res;
}

function renderQuestionContent(text: string): string {
  if (!text) return "";
  return formatMathInText(text);
}

function normalizeQuestions(rawList: any[], targetCount: number, metaContext: any = {}): any[] {
  let mapped: any[] = [];
  if (Array.isArray(rawList) && rawList.length > 0) {
    mapped = rawList.map((q: any, idx: number) => {
      const num = idx + 1;
      let questionAr = q.questionAr || q.question || q.text || `مسألة علمية تطبيقية رقم ${num}`;
      let questionEn = q.questionEn || q.question || `Applied Problem #${num}`;

    // Clean any unwanted reference to the uploaded picture
    questionAr = questionAr
      .replace(/بالرجوع إلى الصورة المرفقة\s*،?/g, "")
      .replace(/بالرجوع للصورة المرفقة\s*،?/g, "")
      .replace(/في الصورة المرفقة\s*،?/g, "")
      .replace(/كما في الصورة المرفقة\s*،?/g, "")
      .replace(/وفقاً للملف المرفق\s*،?/g, "");

    questionEn = questionEn
      .replace(/referring to the attached image\s*,?/gi, "")
      .replace(/as shown in the attached image\s*,?/gi, "")
      .replace(/according to the attached file\s*,?/gi, "");

    // Integrate diagramSvg if provided separately
    if (q.diagramSvg && typeof q.diagramSvg === 'string' && q.diagramSvg.includes('<svg')) {
      if (!questionAr.includes('<svg')) {
        questionAr += `\n<div class="exam-diagram-container">${q.diagramSvg}</div>`;
      }
      if (!questionEn.includes('<svg')) {
        questionEn += `\n<div class="exam-diagram-container">${q.diagramSvg}</div>`;
      }
    }

    // Integrate tableHtml if provided separately
    if (q.tableHtml && typeof q.tableHtml === 'string' && q.tableHtml.includes('<table')) {
      if (!questionAr.includes('<table')) {
        questionAr += `\n<div class="exam-table-container">${q.tableHtml}</div>`;
      }
      if (!questionEn.includes('<table')) {
        questionEn += `\n<div class="exam-table-container">${q.tableHtml}</div>`;
      }
    }

    // Options
    let optsAr: string[] = [];
    if (Array.isArray(q.optionsAr) && q.optionsAr.length > 0) {
      optsAr = q.optionsAr.map(String);
    } else if (Array.isArray(q.options) && q.options.length > 0) {
      optsAr = q.options.map(String);
    } else {
      optsAr = ["الخيار أ", "الخيار ب", "الخيار ج", "الخيار د"];
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

    const explanationAr = q.explanationAr || q.explanation || "حل المسألة بخطوات رياضية وعلمية دقيقة وتطبيق القوانين المعتمدة.";
    const explanationEn = q.explanationEn || q.explanation || "Step-by-step mathematical derivation and formula application.";
    const points = q.points || Math.round(100 / Math.max(1, rawList.length));

    // Resolve question category & law/formula
    let category = q.category || "";
    let categoryLabel = "مسألة حسابية وتطبيق قانون";

    if (category === "function_and_graph" || category.includes("دالة") || category.includes("بيان") || (q.diagramSvg && typeof q.diagramSvg === "string" && q.diagramSvg.includes("<svg"))) {
      category = "function_and_graph";
      categoryLabel = "دالة وعلاقة بيانية وتناسب";
    } else if (category === "practical_and_table" || category.includes("عملي") || category.includes("جدول") || (q.tableHtml && typeof q.tableHtml === "string" && q.tableHtml.includes("<table"))) {
      category = "practical_and_table";
      categoryLabel = "تجربة عملية وجدول قياسات";
    } else if (category === "interactive_reasoning" || category.includes("تفاعلي") || category.includes("استنتاج")) {
      category = "interactive_reasoning";
      categoryLabel = "استنتاج وتطبيق تفاعلي";
    } else {
      category = "problem_and_law";
      categoryLabel = "مسألة حسابية وتطبيق قانون";
    }

    const lawOrFormula = q.lawOrFormula || q.formula || "";

    return {
      id: num,
      number: num,
      question: questionAr,
      questionAr,
      questionEn,
      type: q.type || "mcq",
      category,
      categoryLabel,
      lawOrFormula,
      options: optsAr,
      optionsAr: optsAr,
      optionsEn: optsEn,
      correctAnswer: correctIdx,
      correctIndex: correctIdx,
      explanation: explanationAr,
      explanationAr,
      explanationEn,
      points,
      diagramSvg: q.diagramSvg || null,
      tableHtml: q.tableHtml || null,
    };
  });
  }

  return ensureExactQuestionCount(mapped as any, targetCount, metaContext);
}

function generateHtmlQuestionCards(questions: any[]): string {
  return questions.map((q, idx) => {
    const optionsHtml = q.optionsAr.map((opt: string, optIdx: number) => `
          <label class="flex items-center gap-3 p-3.5 rounded-xl border border-slate-200 hover:border-teal-400 hover:bg-teal-50/50 cursor-pointer transition text-xs md:text-sm bg-white">
            <input type="radio" name="q_${idx}" value="${optIdx}" onchange="selectAnswer(${idx}, ${optIdx})" class="w-4 h-4 text-teal-600 focus:ring-teal-500">
            <span class="font-medium text-slate-800">${formatMathInText(opt)}</span>
          </label>`).join("\n");

    const correctChoiceText = q.optionsAr[q.correctAnswer] || q.options[q.correctAnswer] || "";
    
    const catBadge = `
      <div class="flex flex-wrap items-center gap-1.5 mb-2.5">
        <span class="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-cyan-50 text-cyan-800 border border-cyan-200">
          ${q.categoryLabel || "مسألة وتطبيق قانون"}
        </span>
        ${q.lawOrFormula ? `<span class="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200 font-mono" dir="ltr">📐 ${q.lawOrFormula}</span>` : ""}
      </div>`;

    return `
      <!-- Question Card ${idx + 1} (Pre-rendered for instant visibility) -->
      <div class="bg-white teal-border-card p-5 md:p-6 transition shadow-sm" id="question-card-${idx}">
        ${catBadge}
        <div class="flex items-start justify-between gap-3 mb-3">
          <div class="font-bold text-slate-800 text-sm md:text-base leading-relaxed w-full">
            <span class="text-teal-600 font-extrabold ml-1">(${idx + 1})</span>
            <div id="q-text-${idx}" class="inline-block w-full">${renderQuestionContent(q.questionAr || q.question)}</div>
          </div>
          <span class="px-2 py-0.5 rounded bg-teal-50 text-teal-700 text-[11px] font-bold shrink-0 border border-teal-200">
            ${q.points} درجات
          </span>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-3" id="q-options-${idx}">
${optionsHtml}
        </div>
        <div id="explanation-${idx}" class="hidden p-3.5 rounded-xl bg-teal-50 border border-teal-200 text-xs text-teal-900 font-medium">
          💡 <strong>الإجابة الصحيحة:</strong> <span id="q-correct-${idx}">${formatMathInText(correctChoiceText)}</span><br>
          <div class="text-slate-600 mt-1 block" id="q-expl-${idx}">${renderQuestionContent(q.explanationAr || q.explanation || "")}</div>
        </div>
      </div>`;
  }).join("\n\n");
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

        const categoryLabel = q.categoryLabel || (q.category === "function_and_graph" ? "دالة وعلاقة بيانية وتناسب" : q.category === "practical_and_table" ? "تجربة عملية وجدول قياسات" : q.category === "interactive_reasoning" ? "استنتاج وتطبيق تفاعلي" : "مسألة حسابية وتطبيق قانون");
        const categoryClass = q.category === "interactive_reasoning" ? "q-type-interactive" : q.category === "function_and_graph" ? "q-type-graph" : "";
        const formulaBadge = q.lawOrFormula ? `<span class="q-law-pill" title="القانون الرياضي/العلمي المستخدم">📐 ${q.lawOrFormula}</span>` : "";
        const catBadgeAr = `<div class="q-meta-badges"><span class="q-category-pill ${categoryClass}">${categoryLabel}</span>${formulaBadge}</div>`;
        const catBadgeEn = `<div class="q-meta-badges"><span class="q-category-pill ${categoryClass}">${q.category || "Applied Problem"}</span>${formulaBadge}</div>`;

        let questionTextAr = formatMathInText(q.questionAr || q.question || "");
        if (!questionTextAr.includes("q-category-pill")) {
          questionTextAr = catBadgeAr + questionTextAr;
        }

        let questionTextEn = formatMathInText(q.questionEn || q.question || "");
        if (!questionTextEn.includes("q-category-pill")) {
          questionTextEn = catBadgeEn + questionTextEn;
        }

        let explanationTextAr = q.explanationAr || q.explanation || "الإجابة النموذجية المعتمدة طبقاً للخطوات";
        if (q.lawOrFormula && !explanationTextAr.includes(q.lawOrFormula)) {
          explanationTextAr = `القانون المستخدم: ${q.lawOrFormula}\n${explanationTextAr}`;
        }

        return {
          q: {
            ar: questionTextAr,
            en: questionTextEn,
          },
          options: paddedOptionsAr.slice(0, 4).map((opt: string, oIdx: number) => ({
            ar: formatMathInText(opt || ""),
            en: formatMathInText(paddedOptionsEn[oIdx] || opt || ""),
          })),
          correct: correctIdx,
          answer: {
            ar: formatMathInText(explanationTextAr),
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

// Health check (supports both /api/health and /Hesham-Exam/api/health)
app.get(
  ["/api/health", "/api/health/", "/Hesham-Exam/api/health", "/Hesham-Exam/api/health/"],
  (_req, res) => {
    res.json({ status: "ok", service: "Hesham Exam API", timestamp: new Date().toISOString() });
  }
);

// Main endpoint: Generate exam code from image(s) + template code
app.post(
  [
    "/api/generate-exam-code",
    "/api/generate-exam-code/",
    "/Hesham-Exam/api/generate-exam-code",
    "/Hesham-Exam/api/generate-exam-code/",
  ],
  async (req, res) => {
  try {
    const {
      images = [], // array of { mimeType: string, data: string (base64) }
      examText = "", // Direct text or questions provided by teacher
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

    const hasImages = Array.isArray(images) && images.length > 0;
    const hasText = typeof examText === "string" && examText.trim().length > 0;

    if (!hasImages && !hasText) {
      return res.status(400).json({
        success: false,
        error: "الرجاء رفع صورة أو ملف الامتحان أو كتابة نص الامتحان والأسئلة (Please provide at least one image, document, or exam text).",
      });
    }

    const effectiveTemplate = (templateCode && typeof templateCode === "string" && templateCode.trim())
      ? templateCode
      : (CODE_TEMPLATES[0]?.code || "");

    const userApiKey = (req.body.apiKey as string)?.trim() || (req.headers.authorization?.replace(/^Bearer\s+/i, ""))?.trim() || "";
    const ai = getGeminiClient(userApiKey);

    // Prepare contents: image and document parts + user provided text
    const parts: any[] = [];

    // Add direct exam text if provided by teacher
    if (hasText) {
      parts.push({
        text: `=== EXAM TEXT / DIRECT QUESTIONS / CONTENT PROVIDED BY TEACHER ===\n${examText.trim()}\n\nSTRICT INSTRUCTION: Extract and formulate the questions directly from this provided text and content! Do NOT use generic or unrelated questions.`
      });
    }

    // Add image and file parts
    if (hasImages) {
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
    }

    const isExactExtract = generationMode === "exact_extract";

    // Pre-resolve title and grade from teacher's notes and inputs
    const preMeta = resolveExamTitleAndGrade({
      examTitle,
      instructions,
      examText,
    });

    const systemPrompt = `You are "Hesham Exam AI Engine" - an elite educational AI engine specialized in deeply analyzing uploaded exam sheets, worksheets, and textbooks to generate interactive digital exams.

======================================================================
CRITICAL CORE DIRECTIVE: FULL SIMULATED EXAM GENERATION (توليد امتحان محاكي بالكامل)
======================================================================
The teacher's absolute imperative rule:
"تذكر دائما دورك هو توليد امتحان محاكي للصورة المرفوعة أو الاسئلة المكتوبة أو عنوان الدرس المكتوب"
"مطلوب توليد امتحان محاكي لنفس نوع الاسئلة وليس كتابة امتحان من مخك أو استخراج للاسئلة فقط"
"اسم الامتحان والصف يتغير حسب ما اكتبه انا في خانة الملاحظات"
"توليد امتحان محاكي كامل وليس نفس الاسئلة"

1. الحظر التام لمجرد النقل الحرفي (NOT JUST EXTRACTION):
   لا تقم بمجرد استخراج الأسئلة نفسها حرفياً، بل قم بتوليد أسئلة ومسائل جديدة محاكية لنفس الفكرة والنوع والقانون.

2. الحظر التام للأسئلة العشوائية من الذاكرة (NOT WRITING UNRELATED QUESTIONS FROM YOUR HEAD):
   ممنوع اختراع أسئلة عامة أو تافهة من مخك لا علاقة لها بالمفاهيم والقوانين الموجودة بالصورة أو النص.

3. الدور المطلوب بدقة: توليد امتحان محاكٍ كامل متكافئ (TRUE PARALLEL SIMULATION):
   - قم بتحليل عميق للمواد المرفوعة (صورة / نص / عنوان درس).
   - استخرج: القوانين والمعادلات العلمية، الدوال البيانية، التجارب وجداول القياسات، وطريقة التفكير.
   - قم بابتكار مسائل وأسئلة جديدة تماماً محاكية لنفس القوانين ونفس الأسلوب والصعوبة (تغيير المعطيات الرقمية، عكس المطلوب، تغيير السيناريو الفيزيائي/الكيميائي/الرياضي).
   - إذا كتب المعلم عنوان درس أو موضوع في الملاحظات أو النص (مثل: "قانون كيرشوف"، "المعادلات الخطية"، "الخلية الجلفانية")، ابنِ امتحاناً محاكياً مكثفاً يدور بالكامل حول ذلك الدرس.

4. اسم الامتحان والصف الدراسي (EXAM TITLE & GRADE MANDATE):
   - Target Exam Title: "${preMeta.title}"
   - Target Grade / Class: "${preMeta.grade || "محدد من ملاحظات المعلم"}"
   - Target Subheading: "${preMeta.subheading}"
   - Teacher Notes / Instructions: "${instructions || "توليد امتحان محاكٍ متكامل لنفس نوع وأفكار الأسئلة"}"
   - يجب أن يطابق 'examTitle' في مخرجات JSON اسم الامتحان والصف كما حدده المعلم: "${preMeta.title}".

5. الحظر التام للأسئلة النظرية المصمتة أو العبارات الإنشائية البحتة:
   - الأسئلة لا ينبغى أن تكون كلها نظرية مصمتة أو عبارات سردية أو تعريفات مجردة (مثل: "أي العبارات الآتية صحيحة؟" أو أسئلة حفظ وتلقين).
   - يجب أن تركز الأسئلة على: [مسائل حسابية دقيقة] + [دوال وتغيرات] + [علاقات بيانية وتناسبات] + [قوانين ومعادلات علمية ورياضية] + [تجارب عملية وجداول قياسات].

6. الشمول والتنوع الإلزامي لجميع أنواع الأسئلة (MANDATORY COMPREHENSIVE DIVERSITY):
   - [النوع 1: مسائل حسابية وتطبيق قوانين] (problem_and_law)
   - [النوع 2: دوال وعلاقات بيانية وتناسبات] (function_and_graph) مع رسم بياني SVG بداخل 'diagramSvg'.
   - [النوع 3: أسئلة عملية وتجارب معملية وجداول قياسات] (practical_and_table) مع جدول HTML بداخل 'tableHtml'.
   - [النوع 4: أسئلة استنتاجية وتفاعلية وفهم للعلاقات] (interactive_reasoning).

7. الامتحان قائم بذاته ومكتمل المعطيات دون أي إحالة خارجية للصورة (100% STANDALONE):
   - الطالب يرى صفحة الويب فقط. يُمنع كتابة: "كما بالصورة المرفقة" أو "بالرجوع للملف".
   - اذكر جميع الأرقام والمعطيات مباشرة في نص السؤال.

======================================================================
MANDATORY QUESTION COUNT REQUIREMENT: EXACTLY ${questionCount} QUESTIONS!
======================================================================
- The teacher explicitly requested an exam with EXACTLY ${questionCount} questions.
- You MUST generate EXACTLY ${questionCount} distinct, complete questions in the 'extractedQuestions' array (items from index 0 to ${questionCount - 1}).
- Under NO circumstances generate fewer than ${questionCount} questions (e.g. NEVER stop at 3 or 5 questions!).
- If the uploaded image or text only has 1 or 2 questions, your role is to generate SIMULATED PARALLEL questions on the same scientific laws, concepts, and formulas until the array contains EXACTLY ${questionCount} questions.
`;

    const promptText = `
=== ATTACHED EXAM IMAGES / FILES ===
(Carefully inspect and analyze the attached image/document parts above. Identify the subject, curriculum concepts, formulas, laws, graphs, tables, and numerical relations.)

=== MANDATORY QUESTION COUNT: EXACTLY ${questionCount} QUESTIONS ===
You MUST return EXACTLY ${questionCount} questions in the 'extractedQuestions' array. Do NOT stop at 3 questions.

=== GENERATION MODE: ${isExactExtract ? "EXACT EXTRACTION (استخراج دقيق للمسائل من الصورة)" : "SIMILAR NEW QUESTIONS (توليد مسائل ودوال وقوانين جديدة من نفس أفكار الصورة)"} ===

=== MANDATORY INSTRUCTIONS ===
1. DO NOT make the questions all dry theoretical statements or rote definitions.
2. The exam MUST be comprehensive and include: quantitative problems with numbers & laws, functions & relations with graphs, practical experiment questions with data tables, and interactive conceptual deductions.
3. Every question must have:
   - 'category': "problem_and_law" | "function_and_graph" | "practical_and_table" | "interactive_reasoning"
   - 'lawOrFormula': The formula or law (e.g. V = I × R or f(x) = 2x² - 3x or F = m × a)
   - 'diagramSvg': SVG code for questions with graphs, functions, or circuits.
   - 'tableHtml': HTML table for questions with experimental measurements.
4. Target Questions Count: EXACTLY ${questionCount} questions.
5. Exam Duration: EXACTLY ${durationMinutes} minutes.
6. Exam Title: ${examTitle || "Auto-detect from curriculum topic"}.
7. Difficulty: ${difficulty === "same" ? "نفس مستوى صعوبة مسائل الصورة/الملف" : difficulty}.
8. Additional instructions: ${instructions || "None"}.
`;

    parts.push({ text: promptText });

    const modelsToTry = [
      "gemini-3.6-flash",
      "gemini-flash-lite-latest",
      "gemini-3.5-flash-lite",
      "gemini-3.1-flash-lite",
      "gemini-3.8-flash",
      "gemini-flash-latest",
    ];
    let lastError: any = null;
    let response: any = null;

    for (const modelName of modelsToTry) {
      try {
        console.log(`[Hesham Exam AI] Analyzing image/file with model: ${modelName}...`);
        response = await ai.models.generateContent({
          model: modelName,
          contents: parts,
          config: {
            systemInstruction: systemPrompt,
            responseMimeType: "application/json",
            maxOutputTokens: 16384,
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
                  description: "A friendly Arabic summary explaining that questions were generated 100% from the image/file only, highlighting the variety of problems, functions, and laws",
                },
                extractedQuestions: {
                  type: Type.ARRAY,
                  description: "Comprehensive list of questions covering quantitative problems, functions, graphs, tables, and laws",
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      number: { type: Type.INTEGER },
                      question: { type: Type.STRING },
                      questionAr: { type: Type.STRING },
                      questionEn: { type: Type.STRING },
                      type: { type: Type.STRING, description: "mcq, true_false, essay, or coding" },
                      category: {
                        type: Type.STRING,
                        description: "Category: 'problem_and_law' (مسألة حسابية وتطبيق قانون), 'function_and_graph' (دالة وعلاقة بيانية وتناسب), 'practical_and_table' (تجربة عملية وجدول قياسات), or 'interactive_reasoning' (استنتاج وتطبيق تفاعلي)",
                      },
                      lawOrFormula: {
                        type: Type.STRING,
                        description: "The mathematical formula, function, or scientific law applied (e.g. 'V = I × R' or 'f(x) = ax² + bx + c' or 'F = m × a')",
                      },
                      diagramSvg: {
                        type: Type.STRING,
                        description: "If the question tests a graph, function curve, circuit, geometric figure, or mechanism, provide a clean inline SVG (<svg viewBox='0 0 360 160' class='exam-diagram' xmlns='http://www.w3.org/2000/svg'>...</svg>) with axes, arrows, and labels.",
                      },
                      tableHtml: {
                        type: Type.STRING,
                        description: "If the question is based on experimental data, measurements, truth tables, or coordinates, provide a clean HTML table (<table class='exam-table'>...</table>) with header and data rows.",
                      },
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
        console.warn(`[Hesham Exam AI] Model ${modelName} issue:`, err?.status, err?.message || err);
        // Instant cascade to the next available model
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

    if (!parsedData || !parsedData.extractedQuestions || parsedData.extractedQuestions.length === 0) {
      console.error("[Hesham Exam AI] Failed to extract questions from uploaded image/file. Refusing to serve canned questions.", lastError);
      return res.status(503).json({
        success: false,
        error: "تعذر استخراج الأسئلة من الصورة أو الملف المرفوع حالياً بسبب ضغط مؤقت في خوادم الذكاء الاصطناعي. يرجى الضغط على زر التوليد مرة أخرى للحرص على استخراج الأسئلة من صورتك حصرياً وبدقة تامة دون أي نماذج افتراضية.",
      });
    }

    parsedData.generationMode = generationMode;

    // Resolve Title, Grade and Subject dynamically from teacher notes and inputs
    const finalMeta = resolveExamTitleAndGrade({
      examTitle: parsedData.examTitle || examTitle,
      instructions: instructions || "",
      examText: examText || "",
    });
    parsedData.examTitle = finalMeta.title;

    // Normalize questions array and guarantee EXACT questionCount items
    const normalizedQuestions = normalizeQuestions(parsedData.extractedQuestions || [], questionCount, {
      topicHint: `${finalMeta.title} ${finalMeta.subheading} ${instructions || ""} ${examText || ""}`,
      examTitle: finalMeta.title,
      grade: finalMeta.grade,
      subject: finalMeta.subject,
    });
    parsedData.extractedQuestions = normalizedQuestions;

    // Guaranteed Hydration: inject the fresh questions (derived 100% from image/file) into the template code,
    // preserving all layout, CSS styling, timer, and student input/submit functions,
    // while completely purging all old questions.
    parsedData.generatedCode = hydrateExamCodeWithQuestions({
      baseTemplate: effectiveTemplate,
      generatedCode: "",
      questions: normalizedQuestions,
      meta: {
        examTitle: finalMeta.title,
        durationMinutes: durationMinutes || 30,
        questionCount: normalizedQuestions.length,
        difficulty,
        solveQuestions,
        detectedSubject: finalMeta.subheading,
      },
    });

    if (!parsedData.summary) {
      parsedData.summary = `تم بنجاح توليد امتحان محاكٍ كامل (${normalizedQuestions.length} أسئلة) لـ "${finalMeta.title}" (${finalMeta.subheading}) بناءً على المواد والملاحظات المقدمة.`;
    }

    res.json({
      success: true,
      data: parsedData,
    });
  } catch (err: any) {
    console.error("Error generating exam code:", err);
    res.status(500).json({
      success: false,
      error: err?.message || "حدث خطأ أثناء معالجة الصورة وتوليد كود الامتحان.",
    });
  }
});

// Explicit JSON 404 for any unhandled API routes
app.all(["/api/*", "/Hesham-Exam/api/*"], (_req, res) => {
  res.status(404).json({
    success: false,
    error: "API endpoint not found",
  });
});

// Global error handler guaranteeing JSON responses
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error("Uncaught server error:", err);
  res.status(err.status || 500).json({
    success: false,
    error: err?.message || "Internal server error occurred.",
  });
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
    // Serve both root and /Hesham-Exam prefix for compatibility
    app.use("/Hesham-Exam", express.static(distPath));
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

export { app };
export default app;
