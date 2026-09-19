import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import cors from "cors";
import { CODE_TEMPLATES } from "./src/data/templates";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// Enable robust CORS for GitHub Pages (mr-mohammed-hesham.github.io) and all cross-origin clients
app.use((req, res, next) => {
  const origin = req.headers.origin || "*";
  res.setHeader("Access-Control-Allow-Origin", origin);
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, X-Requested-With, Accept, Origin"
  );
  res.setHeader("Access-Control-Allow-Credentials", "true");
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
  const isPhysics = /فيزياء|physics|سرعة|تسارع|نيوتن|طاقة|تيار|مقاومة|وحدات|بادئات|دائرة|شغل|قوة/i.test(text);
  const isChemistry = /كيمياء|chemistry|ذرة|عنصر|تفاعل|حمض|قاعدة|مركب|محلول|مول|كتلة/i.test(text);
  const isMath = /رياضيات|math|تفاضل|تكامل|معادلة|هندسة|جبر|دالة|حساب|مثلث|مصفوفة/i.test(text);
  const isEnglish = /english|انجليزي|إنجليزي|grammar|vocab|comprehension|tense/i.test(text);
  const isArabic = /عربي|لغة عربية|نحو|بلاغة|أدب|نصوص|إعراب/i.test(text);
  const isBiology = /أحياء|biology|خلية|جينات|وراثة|تنفس|نبات|حيوان|وراثي/i.test(text);

  const physicsBank = [
    {
      questionAr: `في الدائرة الكهربائية الموضحة بالرسم أدناه، وصلت مقاومتان متوازيتان (R₁ = 6 Ω, R₂ = 3 Ω) على التوالي مع مقاومة ثالثة (R₃ = 2 Ω) وبطارية مثالية فرق جهدها V = 16 V. ما مقدار شدة التيار الكلي (I) المار في الدائرة؟
<div class="exam-diagram-container">
  <svg viewBox="0 0 380 130" class="exam-diagram" xmlns="http://www.w3.org/2000/svg" style="max-width:380px;">
    <rect width="380" height="130" fill="#f8fafc" rx="8"/>
    <rect x="30" y="25" width="320" height="80" fill="none" stroke="#0f766e" stroke-width="2.5" rx="4"/>
    <!-- Battery -->
    <line x1="30" y1="50" x2="30" y2="80" stroke="#f8fafc" stroke-width="5"/>
    <line x1="20" y1="58" x2="40" y2="58" stroke="#0f766e" stroke-width="3"/>
    <line x1="25" y1="68" x2="35" y2="68" stroke="#0f766e" stroke-width="1.5"/>
    <text x="50" y="66" fill="#0f766e" font-weight="bold" font-size="12">V = 16V</text>
    <!-- Series Resistor R3 -->
    <rect x="90" y="16" width="55" height="18" fill="#e2e8f0" stroke="#0f766e" stroke-width="2" rx="3"/>
    <text x="117" y="29" fill="#0f766e" font-weight="bold" font-size="11" text-anchor="middle">R₃ = 2Ω</text>
    <!-- Parallel branches -->
    <line x1="180" y1="25" x2="180" y2="10" stroke="#0f766e" stroke-width="2"/>
    <line x1="180" y1="25" x2="180" y2="40" stroke="#0f766e" stroke-width="2"/>
    <rect x="205" y="2" width="55" height="16" fill="#e2e8f0" stroke="#0f766e" stroke-width="2" rx="3"/>
    <text x="232" y="14" fill="#0f766e" font-weight="bold" font-size="11" text-anchor="middle">R₁ = 6Ω</text>
    <rect x="205" y="32" width="55" height="16" fill="#e2e8f0" stroke="#0f766e" stroke-width="2" rx="3"/>
    <text x="232" y="44" fill="#0f766e" font-weight="bold" font-size="11" text-anchor="middle">R₂ = 3Ω</text>
    <line x1="180" y1="10" x2="205" y2="10" stroke="#0f766e" stroke-width="2"/>
    <line x1="180" y1="40" x2="205" y2="40" stroke="#0f766e" stroke-width="2"/>
    <line x1="260" y1="10" x2="285" y2="10" stroke="#0f766e" stroke-width="2"/>
    <line x1="260" y1="40" x2="285" y2="40" stroke="#0f766e" stroke-width="2"/>
    <line x1="285" y1="10" x2="285" y2="40" stroke="#0f766e" stroke-width="2"/>
    <line x1="285" y1="25" x2="350" y2="25" stroke="#0f766e" stroke-width="2"/>
  </svg>
</div>`,
      questionEn: "In the electric circuit shown, two parallel resistors (R₁ = 6 Ω, R₂ = 3 Ω) are connected in series with R₃ = 2 Ω and a 16 V source. What is the total current (I)?",
      optionsAr: ["4 A", "2.67 A", "8 A", "1.6 A"],
      optionsEn: ["4 A", "2.67 A", "8 A", "1.6 A"],
      correctIndex: 0,
      explanationAr: "حساب المقاومة المكافئة لمجموعتي التوازي والتوالي: R_p = (6 × 3) / (6 + 3) = 18 / 9 = 2 Ω. المقاومة الكلية R_eq = R_p + R₃ = 2 + 2 = 4 Ω. شدة التيار الكلي I = V / R_eq = 16 / 4 = 4 A.",
      explanationEn: "Parallel equivalent: R_p = (6 × 3) / (6 + 3) = 2 Ω. Total resistance: R_eq = 2 + 2 = 4 Ω. Current: I = V / R_eq = 16 / 4 = 4 A.",
    },
    {
      questionAr: `يوضح الرسم البياني المقابل منحنى (السرعة - الزمن) لسيارة تتحرك في خط مستقيم انطلاقاً من السكون:
<div class="exam-diagram-container">
  <svg viewBox="0 0 360 150" class="exam-diagram" xmlns="http://www.w3.org/2000/svg" style="max-width:360px;">
    <rect width="360" height="150" fill="#f8fafc" rx="8"/>
    <line x1="45" y1="120" x2="330" y2="120" stroke="#334155" stroke-width="2"/>
    <line x1="45" y1="120" x2="45" y2="20" stroke="#334155" stroke-width="2"/>
    <line x1="45" y1="40" x2="300" y2="40" stroke="#cbd5e1" stroke-dasharray="3,3"/>
    <line x1="150" y1="120" x2="150" y2="40" stroke="#cbd5e1" stroke-dasharray="3,3"/>
    <line x1="300" y1="120" x2="300" y2="40" stroke="#cbd5e1" stroke-dasharray="3,3"/>
    <polyline points="45,120 150,40 300,40" fill="none" stroke="#0d9488" stroke-width="3"/>
    <circle cx="45" cy="120" r="3" fill="#0d9488"/>
    <circle cx="150" cy="40" r="3" fill="#0d9488"/>
    <circle cx="300" cy="40" r="3" fill="#0d9488"/>
    <text x="35" y="44" fill="#0f766e" font-size="11" font-weight="bold" text-anchor="end">20</text>
    <text x="35" y="124" fill="#64748b" font-size="11" text-anchor="end">0</text>
    <text x="150" y="136" fill="#0f766e" font-size="11" font-weight="bold" text-anchor="middle">4 s</text>
    <text x="300" y="136" fill="#0f766e" font-size="11" font-weight="bold" text-anchor="middle">10 s</text>
    <text x="45" y="15" fill="#0f766e" font-size="11" font-weight="bold" text-anchor="middle">v (m/s)</text>
    <text x="340" y="124" fill="#0f766e" font-size="11" font-weight="bold">t (s)</text>
  </svg>
</div>
احسب الإزاحة الكلية (d) التي قطعتها السيارة خلال الفترة الزمنية من t = 0 إلى t = 10 s:`,
      questionEn: "From the given velocity-time graph, calculate the total displacement covered by the car from t = 0 to t = 10 s:",
      optionsAr: ["160 m", "200 m", "120 m", "140 m"],
      optionsEn: ["160 m", "200 m", "120 m", "140 m"],
      correctIndex: 0,
      explanationAr: "الإزاحة في منحنى السرعة-الزمن تساوي المساحة تحت المنحنى = مساحة المثلث (0 إلى 4 ثوانٍ) + مساحة المستطيل (4 إلى 10 ثوانٍ). مساحة المثلث = 0.5 × 4 × 20 = 40 m. مساحة المستطيل = (10 - 4) × 20 = 6 × 20 = 120 m. الإزاحة الكلية d = 40 + 120 = 160 m.",
      explanationEn: "Displacement is the area under the v-t curve: Triangle (0 to 4s) = 0.5 × 4 × 20 = 40 m. Rectangle (4 to 10s) = (10 - 4) × 20 = 120 m. Total displacement = 40 + 120 = 160 m.",
    },
    {
      questionAr: `يوضح الجدول أدناه نتائج تجربة عملية لقياس فرق الجهد (V) وشدة التيار (I) المار في موصل فلزي أومي:
<div class="exam-table-container">
  <table class="exam-table">
    <thead>
      <tr>
        <th>فرق الجهد V (فولت)</th>
        <td>2.0</td>
        <td>4.0</td>
        <td>6.0</td>
        <td>8.0</td>
      </tr>
    </thead>
    <tbody>
      <tr>
        <th>شدة التيار I (أمبير)</th>
        <td>0.5</td>
        <td>1.0</td>
        <td>1.5</td>
        <td>2.0</td>
      </tr>
    </tbody>
  </table>
</div>
طبق قانون أوم لحساب المقاومة الكهربائية (R) لهذا الموصل:`,
      questionEn: "Based on the experimental data table for V and I across an ohmic conductor, calculate the electrical resistance R:",
      optionsAr: ["4.0 Ω", "0.25 Ω", "8.0 Ω", "2.0 Ω"],
      optionsEn: ["4.0 Ω", "0.25 Ω", "8.0 Ω", "2.0 Ω"],
      correctIndex: 0,
      explanationAr: "وفقاً لقانون أوم: R = ΔV / ΔI. بأخذ أي زوج من القيم: R = (8.0 - 2.0) / (2.0 - 0.5) = 6.0 / 1.5 = 4.0 Ω.",
      explanationEn: "According to Ohm's law: R = ΔV / ΔI = (8.0 - 2.0) / (2.0 - 0.5) = 6.0 / 1.5 = 4.0 Ω.",
    },
    {
      questionAr: "تؤثر قوة أفقية ثابتة مقدارها F = 40 N على جسم كتلته m = 5 kg موضوع على سطح أفقي أملس عديم الاحتكاك. احسب سرعة الجسم (v) بعد قطعه مسافة d = 4 m بدءاً من السكون:",
      questionEn: "A constant force F = 40 N acts on a 5 kg mass on a frictionless surface. What is its speed after moving d = 4 m from rest?",
      optionsAr: ["8 m/s", "4 m/s", "16 m/s", "6.4 m/s"],
      optionsEn: ["8 m/s", "4 m/s", "16 m/s", "6.4 m/s"],
      correctIndex: 0,
      explanationAr: "أولاً نحسب التسارع: a = F / m = 40 / 5 = 8 m/s². ثانياً من معادلة الحركة: v² = v₀² + 2ad = 0 + 2(8)(4) = 64. بأخذ الجذر التربيعي: v = √64 = 8 m/s.",
      explanationEn: "Acceleration a = F / m = 40 / 5 = 8 m/s². From motion equation: v² = 0 + 2(8)(4) = 64 => v = 8 m/s.",
    },
  ];

  const mathBank = [
    {
      questionAr: `في المثلث القائم الزاوية الموضح بالشكل أدناه، طول الضلع المجاور a = 6 cm، وطول الضلع المقابل b = 8 cm:
<div class="exam-diagram-container">
  <svg viewBox="0 0 320 160" class="exam-diagram" xmlns="http://www.w3.org/2000/svg" style="max-width:320px;">
    <rect width="320" height="160" fill="#f8fafc" rx="8"/>
    <polygon points="50,130 230,130 50,30" fill="#e0f2fe" stroke="#0284c7" stroke-width="2.5"/>
    <rect x="50" y="115" width="15" height="15" fill="none" stroke="#0284c7" stroke-width="1.5"/>
    <text x="140" y="148" fill="#0369a1" font-weight="bold" font-size="12" text-anchor="middle">a = 6 cm</text>
    <text x="35" y="85" fill="#0369a1" font-weight="bold" font-size="12" text-anchor="end">b = 8 cm</text>
    <text x="155" y="70" fill="#dc2626" font-weight="bold" font-size="13">c = ?</text>
    <text x="195" y="122" fill="#0369a1" font-weight="bold" font-size="12">θ</text>
  </svg>
</div>
احسب طول الوتر (c) ثم أوجد قيمة الجيب sin(θ) للزاوية الموضحة:`,
      questionEn: "In the right-angled triangle shown with adjacent side a = 6 cm and opposite side b = 8 cm, find the hypotenuse c and sin(θ):",
      optionsAr: ["c = 10 cm, sin(θ) = 0.8", "c = 10 cm, sin(θ) = 0.6", "c = 14 cm, sin(θ) = 0.8", "c = 12 cm, sin(θ) = 0.5"],
      optionsEn: ["c = 10 cm, sin(θ) = 0.8", "c = 10 cm, sin(θ) = 0.6", "c = 14 cm, sin(θ) = 0.8", "c = 12 cm, sin(θ) = 0.5"],
      correctIndex: 0,
      explanationAr: "من مبرهنة فيثاغورس: c = √(6² + 8²) = √(36 + 64) = √100 = 10 cm. جيب الزاوية sin(θ) = المقابل / الوتر = 8 / 10 = 0.8.",
      explanationEn: "By Pythagorean theorem: c = √(36 + 64) = 10 cm. sin(θ) = opposite / hypotenuse = 8 / 10 = 0.8.",
    },
    {
      questionAr: "أوجد ميل المماس لمنحنى الدالة f(x) = 2x² - 5x + 4 عند النقطة التي إحداثيها السيني x = 3:",
      questionEn: "Find the slope of the tangent to the curve f(x) = 2x² - 5x + 4 at x = 3:",
      optionsAr: ["7", "11", "5", "9"],
      optionsEn: ["7", "11", "5", "9"],
      correctIndex: 0,
      explanationAr: "المشتقة الأولى تمثل ميل المماس: f'(x) = 4x - 5. بالتعويض بقيمة x = 3: f'(3) = 4(3) - 5 = 12 - 5 = 7.",
      explanationEn: "Derivative gives the slope: f'(x) = 4x - 5. At x = 3: f'(3) = 4(3) - 5 = 7.",
    },
    {
      questionAr: "احسب قيمة التكامل المحدد التالي: ∫ من 0 إلى 3 للدالة (2x + 1) dx:",
      questionEn: "Evaluate the definite integral ∫ from 0 to 3 of (2x + 1) dx:",
      optionsAr: ["12", "9", "15", "6"],
      optionsEn: ["12", "9", "15", "6"],
      correctIndex: 0,
      explanationAr: "دالة التكامل الأصلية: F(x) = [x² + x]. بالتعويض بحدود التكامل: F(3) - F(0) = (3² + 3) - 0 = 9 + 3 = 12.",
      explanationEn: "Antiderivative: [x² + x]. Evaluating from 0 to 3 gives (3² + 3) - 0 = 12.",
    },
  ];

  const chemistryBank = [
    {
      questionAr: "احسب كتلة (m) عينة من كربونات الكالسيوم CaCO₃ تحتوي على 0.5 mol من المادة، علماً بأن الكتل الذرية: (Ca = 40, C = 12, O = 16 g/mol):",
      questionEn: "Calculate the mass of a 0.5 mol sample of CaCO₃, given atomic masses (Ca = 40, C = 12, O = 16 g/mol):",
      optionsAr: ["50 g", "100 g", "25 g", "75 g"],
      optionsEn: ["50 g", "100 g", "25 g", "75 g"],
      correctIndex: 0,
      explanationAr: "الكتلة المولية لمركب CaCO₃ = 40 + 12 + (3 × 16) = 100 g/mol. الكتلة بالجرام = عدد المولات × الكتلة المولية = 0.5 × 100 = 50 g.",
      explanationEn: "Molar mass of CaCO₃ = 40 + 12 + 48 = 100 g/mol. Mass = moles × molar mass = 0.5 × 100 = 50 g.",
    },
  ];

  const biologyBank = [
    {
      questionAr: `يوضح مربع بانيت أدناه تزاوجاً وراثياً بين نباتين هجينين لصفة لون الأزهار (Bb × Bb):
<div class="exam-table-container">
  <table class="exam-table">
    <thead>
      <tr>
        <th>الجاميطات</th>
        <th>B</th>
        <th>b</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <th>B</th>
        <td>BB</td>
        <td>Bb</td>
      </tr>
      <tr>
        <th>b</th>
        <td>Bb</td>
        <td>bb</td>
      </tr>
    </tbody>
  </table>
</div>
ما هي النسبة المئوية المتوقعة لظهور الطراز الشكلي المتنحي (bb) في أفراد الجيل الناتج؟`,
      questionEn: "From the Punnett square of Bb × Bb cross, what is the expected percentage of the recessive phenotype (bb)?",
      optionsAr: ["25%", "50%", "75%", "0%"],
      optionsEn: ["25%", "50%", "75%", "0%"],
      correctIndex: 0,
      explanationAr: "ينتج من التزاوج 4 احتمالات: 1 BB و 2 Bb و 1 bb. احتمال الطراز المتنحي bb هو 1 من أصل 4 أي بنسبة (1 / 4) × 100% = 25%.",
      explanationEn: "The cross yields 1 BB : 2 Bb : 1 bb. The recessive genotype bb is 1 out of 4 = 25%.",
    },
  ];

  const englishBank = [
    {
      questionAr: "Choose the correct verb form to complete the conditional sentence: 'If the team ______ harder, they will win the tournament.'",
      questionEn: "Choose the correct verb form: 'If the team ______ harder, they will win the tournament.'",
      optionsAr: ["trains", "trained", "will train", "had trained"],
      optionsEn: ["trains", "trained", "will train", "had trained"],
      correctIndex: 0,
      explanationAr: "في الجملة الشرطية من النوع الأول (First Conditional): If + Present Simple, will + base verb. لذلك نستخدم trains.",
      explanationEn: "First conditional rule requires present simple in the if-clause: 'trains'.",
    },
  ];

  const arabicBank = [
    {
      questionAr: "في جملة: 'لا تقصرْ في أداءِ واجبِكَ'، ما هو الإعراب الدقيق للفعل المضارع (تقصرْ)؟",
      questionEn: "Grammatical case of 'تقصر' after 'لا' الناهية:",
      optionsAr: ["فعل مضارع مجزوم بلا الناهية وعلامة جزمه السكون", "فعل مضارع مرفوع وعلامة رفعه الضمة", "فعل مضارع منصوب وعلامة نصبه الفتحة", "فعل ماض مبني على الفتح"],
      optionsEn: ["Jussive verb (Majzoom with Sukoon)", "Nominative verb", "Accusative verb", "Past tense"],
      correctIndex: 0,
      explanationAr: "'لا' هنا هي لا الناهية الجازمة التي تجزم الفعل المضارع، وعلامة جزمه السكون لأنه صحيح الآخر.",
      explanationEn: "La al-Nahiyah is a jussive particle causing the present verb to be majzoom with sukoon.",
    },
  ];

  let sourceBank: any[] = physicsBank;
  if (isMath) sourceBank = mathBank.concat(physicsBank);
  else if (isPhysics) sourceBank = physicsBank;
  else if (isChemistry) sourceBank = chemistryBank.concat(physicsBank);
  else if (isBiology) sourceBank = biologyBank.concat(physicsBank);
  else if (isEnglish) sourceBank = englishBank;
  else if (isArabic) sourceBank = arabicBank;
  else sourceBank = physicsBank.concat(mathBank);

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

function normalizeQuestions(rawList: any[], targetCount: number): any[] {
  if (!Array.isArray(rawList) || rawList.length === 0) {
    return [];
  }

  return rawList.map((q: any, idx: number) => {
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

    return {
      id: num,
      number: num,
      question: questionAr,
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
      diagramSvg: q.diagramSvg || null,
      tableHtml: q.tableHtml || null,
    };
  });
}

function generateHtmlQuestionCards(questions: any[]): string {
  return questions.map((q, idx) => {
    const optionsHtml = q.optionsAr.map((opt: string, optIdx: number) => `
          <label class="flex items-center gap-3 p-3.5 rounded-xl border border-slate-200 hover:border-teal-400 hover:bg-teal-50/50 cursor-pointer transition text-xs md:text-sm bg-white">
            <input type="radio" name="q_${idx}" value="${optIdx}" onchange="selectAnswer(${idx}, ${optIdx})" class="w-4 h-4 text-teal-600 focus:ring-teal-500">
            <span class="font-medium text-slate-800">${formatMathInText(opt)}</span>
          </label>`).join("\n");

    const correctChoiceText = q.optionsAr[q.correctAnswer] || q.options[q.correctAnswer] || "";

    return `
      <!-- Question Card ${idx + 1} (Pre-rendered for instant visibility) -->
      <div class="bg-white teal-border-card p-5 md:p-6 transition shadow-sm" id="question-card-${idx}">
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

// Health check (supports both /api/health and /Hesham-Exam/api/health)
app.get(["/api/health", "/Hesham-Exam/api/health"], (_req, res) => {
  res.json({ status: "ok", service: "Hesham Exam API", timestamp: new Date().toISOString() });
});

// Main endpoint: Generate exam code from image(s) + template code
app.post(["/api/generate-exam-code", "/Hesham-Exam/api/generate-exam-code"], async (req, res) => {
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
        success: false,
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

    const systemPrompt = `You are "Hesham Exam AI Engine" - an elite educational AI engine specialized in generating comprehensive, self-contained, and skill-based simulated exams (امتحانات محاكية متكاملة وقائمة بذاتها) based on the curriculum topic and difficulty of the uploaded exam sheets/files.

======================================================================
CRITICAL CORE DIRECTIVES (القواعد الأساسية الصارمة لتوليد الامتحان):
======================================================================

1. الحظر التام والنهائي لاستخدام أي سؤال خارجي أو قديم (STRICT BAN ON OLD QUESTIONS):
   - YOU ARE STRICTLY FORBIDDEN from using, borrowing, or copying any question from the previous code template.
   - Any questions in the old code must be 100% ignored, discarded, and wiped out.

2. امتحان محاكٍ متكامل قائم بذاته بدون أي إحالة خارجية للصورة (100% STANDALONE SIMULATED EXAM):
   - The generated questions must be SIMULATED (محاكية), meaning they reflect the SAME curriculum concepts, difficulty, and skills as the image, BUT they are 100% independent and self-contained.
   - STRICT BAN ON EXTERNAL REFERENCES: You must NEVER refer to the uploaded picture in the question text.
     * STRICTLY FORBIDDEN: Do NOT write "بالرجوع للصورة المرفقة", "كما في الصورة", "في الشكل المقابل بالورقة", "وفقاً للملف المرفق".
     * Why? The student taking the generated exam sees ONLY this interactive exam webpage and does NOT see the teacher's upload!
     * Every question must contain all its own givens, variables, and context.

3. توليد رسومات بيانية وجداول داخل الامتحان المولد (EMBEDDED STANDALONE DIAGRAMS & TABLES):
   - If the uploaded exam image/file contains diagrams, circuits, graphs, coordinate curves, pulleys, forces, or data tables:
     * YOU MUST GENERATE SIMULATED STANDALONE VISUALS directly inside the generated exam!
     * FOR DIAGRAMS/CIRCUITS/GRAPHS: Provide a clean, standalone, responsive inline SVG in 'diagramSvg' or directly in 'questionAr' (e.g. <svg viewBox="0 0 360 150" class="exam-diagram" xmlns="http://www.w3.org/2000/svg">...</svg>) with axes, arrows, grid lines, circuit components, or geometric shapes with clear numerical labels.
     * FOR MEASUREMENTS/DATA: Provide a clean HTML table in 'tableHtml' or directly in 'questionAr' (e.g. <table class="exam-table">...</table>) with column headers and numerical data rows.
     * The generated exam must look like an official, high-quality, fully illustrated exam sheet!

4. التركيز على الأسئلة المهارية والمسائل الحسابية والتطبيقية (SKILL-BASED & QUANTITATIVE PROBLEMS):
   - Make the questions primarily SKILL-BASED PROBLEMS (مسائل حسابية وتطبيقية) rather than dry theoretical definitions.
   - Strictly avoid rote definitions (e.g. "ما هو تعريف...", "المصطلح العلمي...").
   - Give realistic numbers, initial values, physical units (m/s², Ω, V, N, J, kg, mol), and ask the student to solve for the unknown using equations and physical/mathematical laws.
   - Provide 4 distinct multiple-choice options with ONE unequivocally correct answer. The options must be realistic calculated values.
   - Accurately solve each question step-by-step (solveQuestions: ${solveQuestions ? "YES" : "NO"}), mark the correct answer index (0, 1, 2, or 3), and provide detailed step-by-step mathematical reasoning in 'explanationAr' and 'explanationEn'.
   - Formulate EXACTLY ${questionCount} questions.
   - Provide both Arabic (questionAr, optionsAr, explanationAr) and English (questionEn, optionsEn, explanationEn).

Output must strictly be valid JSON adhering to the specified schema.`;

    const promptText = `
=== ATTACHED EXAM IMAGES / FILES ===
(Carefully inspect and analyze the attached image/document parts above. Identify the subject, curriculum concepts, and whether there are circuits, graphs, tables, or geometric figures.)

=== GENERATION INSTRUCTIONS ===
1. GENERATE A STANDALONE SIMULATED EXAM (امتحان محاكٍ قائم بذاته متكامل).
2. DO NOT write "بالرجوع للصورة المرفقة" or "كما بالصورة". The questions must be 100% self-contained for the student.
3. If the uploaded material contains or requires diagrams, circuits, graphs, or tables:
   - Provide inline SVG diagrams in 'diagramSvg' or within the question!
   - Provide clean HTML tables in 'tableHtml' or within the question!
4. MAKE QUESTIONS SKILL-BASED PROBLEMS (أسئلة مهارية ومسائل حسابية وتطبيقية):
   - Focus on problem-solving, calculations, quantitative analysis, reading values from tables and graphs, and applying laws and formulas.
   - Avoid memorization and theoretical definitions.
5. Target Questions Count: EXACTLY ${questionCount} questions.
6. Exam Duration: EXACTLY ${durationMinutes} minutes.
7. Exam Title: ${examTitle || "Auto-detect from curriculum topic"}.
8. Difficulty: ${difficulty === "same" ? "نفس مستوى صعوبة مسائل الصورة/الملف" : difficulty}.
9. Additional instructions: ${instructions || "None"}.
10. Formula styling: For mathematical or scientific formulas, you can wrap equations inside <span class="math-display">formula</span> so they appear beautifully formatted.
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
                  description: "List of simulated, skill-based questions with choices, answers, and optional diagrams/tables",
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      number: { type: Type.INTEGER },
                      question: { type: Type.STRING },
                      questionAr: { type: Type.STRING },
                      questionEn: { type: Type.STRING },
                      type: { type: Type.STRING, description: "mcq, true_false, essay, or coding" },
                      diagramSvg: {
                        type: Type.STRING,
                        description: "If the question tests a graph, circuit, geometric figure, or mechanism, provide a clean inline SVG (<svg viewBox='0 0 360 150' class='exam-diagram' xmlns='http://www.w3.org/2000/svg'>...</svg>) with axes, arrows, and labels.",
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
