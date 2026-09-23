import { CodeTemplatePreset } from "../types";
import { OFFICIAL_HESHAM_EXAM_TEMPLATE } from "./officialTemplate";

export { OFFICIAL_HESHAM_EXAM_TEMPLATE };

export const CODE_TEMPLATES: CodeTemplatePreset[] = [
  {
    id: "official-hesham-interactive-exam",
    title: "قالب الامتحان التفاعلي الرسمي - مستر محمد هشام (Bilingual + EmailJS + Shuffle + Math)",
    titleEn: "Official Mohammed Hesham Interactive Exam Template (Bilingual + EmailJS + Shuffle + Math)",
    category: "Web & Browser",
    language: "html",
    extension: "html",
    description: "القالب التفاعلي الرسمي المعتمد لمستر محمد هشام: يدعم ثنائية اللغة (عربي | EN)، إرسال النتيجة للمعلم عبر EmailJS، مؤقت تنازلي، أسئلة عشوائية، حفظ التقدم تلقائياً، صيغ ومعادلات رياضية، وتقارير درجات تفصيلية لكل قسم.",
    code: OFFICIAL_HESHAM_EXAM_TEMPLATE,
  },
  {
    id: "qutoof-physics-teal",
    title: "قالب قطوف فيزيائية - مستر محمد هشام (Teal STEM Quiz + ثنائية اللغة وإرسال للمعلم)",
    titleEn: "Qutoof Physics Interactive Exam (Bilingual + Send to Teacher)",
    category: "Web & Browser",
    language: "html",
    extension: "html",
    description: "القالب التفاعلي الكامل المطابق لقطوف فيزيائية: يدعم ثنائية اللغة (عربي | EN)، مؤقت يدوي، إرسال النتيجة للمعلم (واتساب / بريد / خادم)، إظهار/إخفاء الإجابات، طباعة، وأسئلة عشوائية.",
    code: `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>اختبار الفيزياء: البادئات والوحدات الأساسية - قطوف فيزيائية</title>
  <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
  <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&display=swap" rel="stylesheet">
  <style>
    body {
      font-family: 'Cairo', sans-serif;
      background-color: #e3faf7;
      color: #134e4a;
    }
    .teal-border-card {
      border: 3px solid #06b6d4;
      border-radius: 1.5rem;
      box-shadow: 0 10px 25px -5px rgba(6, 182, 212, 0.2);
    }
    .custom-input {
      border-bottom: 2px solid #06b6d4;
      background: transparent;
      outline: none;
      padding: 2px 8px;
    }
    .custom-input:focus {
      border-bottom-color: #0891b2;
    }
  </style>
</head>
<body class="min-h-screen py-6 px-4">
  <div class="max-w-4xl mx-auto">

    <!-- Top Navigation Bar matching the image -->
    <div class="flex flex-wrap items-center justify-between gap-3 mb-6">
      
      <!-- Bilingual Language Switcher (عربي | EN) -->
      <div>
        <button id="lang-btn" onclick="toggleLanguage()" class="px-4 py-1.5 rounded-full bg-teal-800 text-white text-xs font-bold shadow-md hover:bg-teal-900 transition flex items-center gap-1.5 cursor-pointer">
          <span>🌐</span>
          <span id="lang-btn-label">English</span>
        </button>
      </div>

      <!-- Timer Pill (Manual Configurable Countdown) -->
      <div class="bg-white/90 backdrop-blur border border-teal-200 px-4 py-1.5 rounded-2xl shadow-sm flex items-center gap-3 text-xs font-bold text-teal-900">
        <span class="flex items-center gap-1 text-slate-700">
          <span id="lbl-timer">⏰ الوقت المتبقي:</span>
          <span id="timer" class="font-mono text-teal-600 text-sm">30:00</span>
        </span>
        <span class="px-2.5 py-0.5 rounded-full bg-teal-500 text-white text-[11px] flex items-center gap-1 font-semibold" id="badge-random">
          🎲 أسئلة عشوائية
        </span>
      </div>

      <!-- Action Buttons Bar -->
      <div class="flex flex-wrap items-center gap-2">
        <button onclick="toggleAnswers()" class="px-3.5 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold flex items-center gap-1 shadow-sm transition cursor-pointer">
          <span>👀</span>
          <span id="toggle-answers-text">إظهار/إخفاء الإجابات</span>
        </button>
        <button onclick="window.print()" class="px-3.5 py-1.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold flex items-center gap-1 shadow-sm transition cursor-pointer">
          <span>🖨️</span>
          <span id="btn-print-text">طباعة</span>
        </button>
        <button onclick="reshuffleQuestions()" class="px-3.5 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold flex items-center gap-1 shadow-sm transition cursor-pointer">
          <span>🔄</span>
          <span id="btn-new-q-text">أسئلة جديدة</span>
        </button>
        <button onclick="resetExam()" class="px-3.5 py-1.5 rounded-xl bg-rose-500 hover:bg-rose-400 text-white text-xs font-bold flex items-center gap-1 shadow-sm transition cursor-pointer">
          <span>🗑️</span>
          <span id="btn-reset-text">مسح التقدم</span>
        </button>
      </div>

    </div>

    <!-- Main Header Card -->
    <div class="bg-white teal-border-card p-6 md:p-8 mb-8 text-center">
      <div class="flex items-center justify-center gap-2 mb-2">
        <span class="text-amber-500 text-2xl font-black">⚡</span>
        <h1 id="exam-title-display" class="text-2xl md:text-3xl font-black text-slate-800">
          اختبار الفيزياء: البادئات والوحدات الأساسية
        </h1>
      </div>
      
      <p id="exam-subtitle-display" class="text-cyan-600 font-bold text-sm md:text-base mb-1">
        قطوف فيزيائية - تحويل الوحدات والبادئات النظامية
      </p>
      
      <p id="exam-description-display" class="text-xs text-slate-500 mb-3">
        اختبار لقياس فهم الوحدات الأساسية والبادئات العشرية والتحويل بينها وتطبيقاتها
      </p>

      <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-teal-50 text-teal-700 text-xs font-semibold mb-6 border border-teal-100">
        <span>💾</span>
        <span id="save-progress-hint">يتم حفظ تقدمك تلقائياً - <span id="q-count-badge">5 أسئلة</span></span>
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
          <span id="duration-val" class="text-teal-700">30 دقيقة</span>
        </div>
        <div class="flex items-center justify-center gap-1">
          <span id="lbl-total-marks">📊 المجموع:</span>
          <span class="text-teal-700 font-bold" id="total-marks-val">100 درجة</span>
        </div>
      </div>

    </div>

    <!-- Questions Container (Pre-rendered for instant visibility) -->
    <div id="questions-list" class="space-y-6 mb-8">
      <!-- Question Card 1 -->
      <div class="bg-white teal-border-card p-5 md:p-6 transition shadow-sm" id="question-card-0">
        <div class="flex items-start justify-between gap-3 mb-3">
          <h3 class="font-bold text-slate-800 text-sm md:text-base leading-relaxed">
            <span class="text-teal-600 font-extrabold ml-1">(1)</span>
            <span id="q-text-0">في دائرة كهربائية موصل بها مقاومتان متوازيتان (R₁ = 6 Ω, R₂ = 3 Ω) على التوالي مع R₃ = 2 Ω وبطارية V = 16 V، ما شدة التيار الكلي (I) المار في الدائرة؟</span>
          </h3>
          <span class="px-2 py-0.5 rounded bg-teal-50 text-teal-700 text-[11px] font-bold shrink-0 border border-teal-200">20 درجة</span>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-3" id="q-options-0">
          <label class="flex items-center gap-3 p-3.5 rounded-xl border border-slate-200 hover:border-teal-400 hover:bg-teal-50/50 cursor-pointer transition text-xs md:text-sm bg-white">
            <input type="radio" name="q_0" value="0" onchange="selectAnswer(0, 0)" class="w-4 h-4 text-teal-600 focus:ring-teal-500">
            <span class="font-medium text-slate-800">4 A</span>
          </label>
          <label class="flex items-center gap-3 p-3.5 rounded-xl border border-slate-200 hover:border-teal-400 hover:bg-teal-50/50 cursor-pointer transition text-xs md:text-sm bg-white">
            <input type="radio" name="q_0" value="1" onchange="selectAnswer(0, 1)" class="w-4 h-4 text-teal-600 focus:ring-teal-500">
            <span class="font-medium text-slate-800">2.67 A</span>
          </label>
          <label class="flex items-center gap-3 p-3.5 rounded-xl border border-slate-200 hover:border-teal-400 hover:bg-teal-50/50 cursor-pointer transition text-xs md:text-sm bg-white">
            <input type="radio" name="q_0" value="2" onchange="selectAnswer(0, 2)" class="w-4 h-4 text-teal-600 focus:ring-teal-500">
            <span class="font-medium text-slate-800">8 A</span>
          </label>
          <label class="flex items-center gap-3 p-3.5 rounded-xl border border-slate-200 hover:border-teal-400 hover:bg-teal-50/50 cursor-pointer transition text-xs md:text-sm bg-white">
            <input type="radio" name="q_0" value="3" onchange="selectAnswer(0, 3)" class="w-4 h-4 text-teal-600 focus:ring-teal-500">
            <span class="font-medium text-slate-800">1.6 A</span>
          </label>
        </div>
        <div id="explanation-0" class="hidden p-3.5 rounded-xl bg-teal-50 border border-teal-200 text-xs text-teal-900 font-medium">
          💡 <strong>الإجابة الصحيحة:</strong> 4 A<br>
          <span class="text-slate-600 mt-1 block">مقاومة التوازي R_p = (6 × 3)/(6 + 3) = 2 Ω. المقاومة الكلية R_eq = 2 + 2 = 4 Ω. التيار I = V / R_eq = 16 / 4 = 4 A.</span>
        </div>
      </div>

      <!-- Question Card 2 -->
      <div class="bg-white teal-border-card p-5 md:p-6 transition shadow-sm" id="question-card-1">
        <div class="flex items-start justify-between gap-3 mb-3">
          <h3 class="font-bold text-slate-800 text-sm md:text-base leading-relaxed">
            <span class="text-teal-600 font-extrabold ml-1">(2)</span>
            <span id="q-text-1">تحرك جسم من السكون بعجلة منتظمة a = 4 m/s² لمدة 5 ثوانٍ، احسب المسافة المقطوعة (d):</span>
          </h3>
          <span class="px-2 py-0.5 rounded bg-teal-50 text-teal-700 text-[11px] font-bold shrink-0 border border-teal-200">20 درجة</span>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-3" id="q-options-1">
          <label class="flex items-center gap-3 p-3.5 rounded-xl border border-slate-200 hover:border-teal-400 hover:bg-teal-50/50 cursor-pointer transition text-xs md:text-sm bg-white">
            <input type="radio" name="q_1" value="0" onchange="selectAnswer(1, 0)" class="w-4 h-4 text-teal-600 focus:ring-teal-500">
            <span class="font-medium text-slate-800">50 m</span>
          </label>
          <label class="flex items-center gap-3 p-3.5 rounded-xl border border-slate-200 hover:border-teal-400 hover:bg-teal-50/50 cursor-pointer transition text-xs md:text-sm bg-white">
            <input type="radio" name="q_1" value="1" onchange="selectAnswer(1, 1)" class="w-4 h-4 text-teal-600 focus:ring-teal-500">
            <span class="font-medium text-slate-800">20 m</span>
          </label>
          <label class="flex items-center gap-3 p-3.5 rounded-xl border border-slate-200 hover:border-teal-400 hover:bg-teal-50/50 cursor-pointer transition text-xs md:text-sm bg-white">
            <input type="radio" name="q_1" value="2" onchange="selectAnswer(1, 2)" class="w-4 h-4 text-teal-600 focus:ring-teal-500">
            <span class="font-medium text-slate-800">100 m</span>
          </label>
          <label class="flex items-center gap-3 p-3.5 rounded-xl border border-slate-200 hover:border-teal-400 hover:bg-teal-50/50 cursor-pointer transition text-xs md:text-sm bg-white">
            <input type="radio" name="q_1" value="3" onchange="selectAnswer(1, 3)" class="w-4 h-4 text-teal-600 focus:ring-teal-500">
            <span class="font-medium text-slate-800">40 m</span>
          </label>
        </div>
        <div id="explanation-1" class="hidden p-3.5 rounded-xl bg-teal-50 border border-teal-200 text-xs text-teal-900 font-medium">
          💡 <strong>الإجابة الصحيحة:</strong> 50 m<br>
          <span class="text-slate-600 mt-1 block">من قانون الحركة: d = v₀t + 0.5 a t² = 0 + 0.5(4)(5²) = 2 × 25 = 50 m.</span>
        </div>
      </div>
    </div>

    <!-- Submit / Correct Button & Send to Teacher Section -->
    <div class="text-center mb-8 space-y-4">
      <button 
        id="submit-btn" 
        onclick="submitAndGrade()" 
        class="px-10 py-3.5 rounded-2xl bg-teal-600 hover:bg-teal-500 active:scale-95 text-white font-black text-base shadow-xl shadow-teal-600/30 transition flex items-center justify-center gap-2 mx-auto cursor-pointer"
      >
        <span>🎯</span>
        <span id="submit-btn-text">صحح إجاباتي!</span>
      </button>
      
      <!-- Results Banner with Send to Teacher actions -->
      <div id="result-banner" class="hidden mt-6 p-6 rounded-2xl bg-white teal-border-card text-center transition-all space-y-4">
        <h3 class="text-xl font-bold text-slate-800 mb-1" id="result-title">النتيجة النهائية</h3>
        <p class="text-4xl font-black text-teal-600 my-2" id="score-text">0 / 100</p>
        <p class="text-xs text-slate-500" id="feedback-text">أحسنت! راجع الإجابات الموضحة في الأسئلة.</p>
        
        <!-- SEND TO TEACHER FEATURE (إرسال النتيجة للمعلم) -->
        <div class="pt-4 border-t border-teal-100 flex flex-wrap items-center justify-center gap-3">
          <span class="text-xs font-bold text-teal-900 w-full mb-1" id="send-teacher-title">📤 إرسال ورقة الإجابة والنتيجة إلى المعلم:</span>
          
          <button 
            onclick="sendResultToTeacherWhatsApp()" 
            class="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow transition cursor-pointer"
          >
            <span>💬</span>
            <span id="btn-wa-text">إرسال عبر واتساب (WhatsApp)</span>
          </button>
          
          <button 
            onclick="sendResultViaEmail()" 
            class="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold flex items-center gap-1.5 shadow transition cursor-pointer"
          >
            <span>✉️</span>
            <span id="btn-email-text">إرسال عبر البريد الإلكتروني</span>
          </button>

          <button 
            onclick="copyResultSummary()" 
            class="px-4 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold flex items-center gap-1.5 shadow transition cursor-pointer"
          >
            <span>📋</span>
            <span id="btn-copy-summary">نسخ تقرير الدرجة</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Footer Rights matching image -->
    <div class="text-center text-xs text-slate-500 pb-10">
      <p id="footer-text">© قطوف فيزيائية - البادئات والوحدات الأساسية | Mr. Mohammed Hesham</p>
    </div>

  </div>

  <script>
    // Configuration & Meta
    let currentLang = 'ar'; // 'ar' | 'en'
    let durationMinutes = 30;
    let timerSeconds = durationMinutes * 60;
    let teacherPhoneNumber = "+201000000000"; // رقم هاتف المعلم لواتساب
    let teacherEmail = "teacher@school.edu";

    // Questions Bank (يدعم المحتوى الثنائي: عربي وإنجليزي)
    const questions = [
      {
        id: 1,
        questionAr: "في دائرة كهربائية موصل بها مقاومتان متوازيتان (R₁ = 6 Ω, R₂ = 3 Ω) على التوالي مع R₃ = 2 Ω وبطارية V = 16 V، ما شدة التيار الكلي (I) المار في الدائرة؟",
        questionEn: "In a circuit with two parallel resistors (R₁ = 6 Ω, R₂ = 3 Ω) in series with R₃ = 2 Ω and a 16 V source, what is the total current (I)?",
        optionsAr: ["4 A", "2.67 A", "8 A", "1.6 A"],
        optionsEn: ["4 A", "2.67 A", "8 A", "1.6 A"],
        correctAnswer: 0,
        explanationAr: "مقاومة التوازي: R_p = (6 × 3)/(6 + 3) = 2 Ω. المقاومة الكلية: R_eq = 2 + 2 = 4 Ω. شدة التيار الكلي: I = V / R_eq = 16 / 4 = 4 A.",
        explanationEn: "Parallel equivalent: R_p = 2 Ω. Total R_eq = 4 Ω. Total current I = V / R_eq = 16 / 4 = 4 A."
      },
      {
        id: 2,
        questionAr: "تحرك جسم من السكون بعجلة منتظمة a = 4 m/s² لمدة 5 ثوانٍ، احسب المسافة المقطوعة (d):",
        questionEn: "A body starts from rest with uniform acceleration a = 4 m/s² for 5 seconds. Calculate displacement (d):",
        optionsAr: ["50 m", "20 m", "100 m", "40 m"],
        optionsEn: ["50 m", "20 m", "100 m", "40 m"],
        correctAnswer: 0,
        explanationAr: "من معادلة الحركة: d = v₀t + 0.5 a t² = 0 + 0.5(4)(25) = 50 m.",
        explanationEn: "From kinematics: d = v₀t + 0.5 a t² = 0 + 0.5(4)(25) = 50 m."
      },
      {
        id: 3,
        questionAr: "أوجد ميل المماس لمنحنى الدالة الرياضية f(x) = 2x² - 5x + 4 عند النقطة x = 3:",
        questionEn: "Find the slope of the tangent line to the curve f(x) = 2x² - 5x + 4 at x = 3:",
        optionsAr: ["7", "11", "5", "9"],
        optionsEn: ["7", "11", "5", "9"],
        correctAnswer: 0,
        explanationAr: "المشتقة تمثل ميل المماس: f'(x) = 4x - 5. بالتعويض بـ x = 3: f'(3) = 4(3) - 5 = 12 - 5 = 7.",
        explanationEn: "Derivative gives slope: f'(x) = 4x - 5. At x = 3: f'(3) = 7."
      },
      {
        id: 4,
        questionAr: "تؤثر قوة أفقية ثابتة F = 40 N على جسم كتلته m = 5 kg موضوع على سطح أملس. احسب سرعة الجسم (v) بعد قطع مسافة d = 4 m من السكون:",
        questionEn: "A constant force F = 40 N acts on a 5 kg mass from rest on a frictionless surface. What is its velocity after d = 4 m?",
        optionsAr: ["8 m/s", "4 m/s", "16 m/s", "6.4 m/s"],
        optionsEn: ["8 m/s", "4 m/s", "16 m/s", "6.4 m/s"],
        correctAnswer: 0,
        explanationAr: "التسارع a = F / m = 40 / 5 = 8 m/s². السرعة: v² = 2ad = 2(8)(4) = 64 => v = √64 = 8 m/s.",
        explanationEn: "Acceleration a = 40 / 5 = 8 m/s². v² = 2ad = 64 => v = 8 m/s."
      },
      {
        id: 5,
        questionAr: "احسب قيمة التكامل المحدود التالي: ∫ من 1 إلى 4 للدالة (3x² - 2x) dx:",
        questionEn: "Evaluate the definite integral ∫ from 1 to 4 of (3x² - 2x) dx:",
        optionsAr: ["48", "63", "45", "52"],
        optionsEn: ["48", "63", "45", "52"],
        correctAnswer: 0,
        explanationAr: "دالة التكامل الأصلية [x³ - x²]. بالتعويض: (4³ - 4²) - (1³ - 1²) = (64 - 16) - 0 = 48.",
        explanationEn: "Antiderivative: [x³ - x²]. (64 - 16) - 0 = 48."
      }
    ];

    let userAnswers = {};
    let showAnswersState = false;

    // Render questions according to current language
    function renderQuestions() {
      const container = document.getElementById('questions-list');
      if (!container) return;
      if (!questions || !Array.isArray(questions) || questions.length === 0) {
        return;
      }
      
      container.innerHTML = '';
      
      const qCountText = currentLang === 'ar' ? (questions.length + ' أسئلة') : (questions.length + ' Questions');
      const badge = document.getElementById('q-count-badge');
      if (badge) badge.textContent = qCountText;

      questions.forEach((q, idx) => {
        const card = document.createElement('div');
        card.className = 'bg-white teal-border-card p-5 md:p-6 transition shadow-sm';
        card.id = 'question-card-' + idx;

        const qText = currentLang === 'ar' ? (q.questionAr || q.question || '') : (q.questionEn || q.question || '');
        const optionsList = (currentLang === 'ar' ? (q.optionsAr || q.options) : (q.optionsEn || q.options)) || [];
        const explText = (currentLang === 'ar' ? (q.explanationAr || q.explanation) : (q.explanationEn || q.explanation)) || '';
        const correctIndex = typeof q.correctAnswer === 'number' ? q.correctAnswer : 0;
        const correctText = optionsList[correctIndex] || optionsList[0] || '';

        const optionsHtml = optionsList.map((opt, optIdx) => {
          const checked = userAnswers[idx] === optIdx ? 'checked' : '';
          return \`
            <label class="flex items-center gap-3 p-3.5 rounded-xl border border-slate-200 hover:border-teal-400 hover:bg-teal-50/50 cursor-pointer transition text-xs md:text-sm bg-white">
              <input type="radio" name="q_\${idx}" value="\${optIdx}" \${checked} onchange="selectAnswer(\${idx}, \${optIdx})" class="w-4 h-4 text-teal-600 focus:ring-teal-500">
              <span class="font-medium text-slate-800">\${opt}</span>
            </label>
          \`;
        }).join('');

        const ptsLabel = currentLang === 'ar' ? 'درجات' : 'pts';
        const explHead = currentLang === 'ar' ? 'الإجابة الصحيحة:' : 'Correct Answer:';
        const ptsValue = q.points || Math.round(100 / Math.max(1, questions.length));

        card.innerHTML = \`
          <div class="flex items-start justify-between gap-3 mb-3">
            <h3 class="font-bold text-slate-800 text-sm md:text-base leading-relaxed">
              <span class="text-teal-600 font-extrabold ml-1">(\${idx + 1})</span> \${qText}
            </h3>
            <span class="px-2 py-0.5 rounded bg-teal-50 text-teal-700 text-[11px] font-bold shrink-0 border border-teal-200">
              \${ptsValue} \${ptsLabel}
            </span>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-3">
            \${optionsHtml}
          </div>
          <div id="explanation-\${idx}" class="\${showAnswersState ? '' : 'hidden'} p-3.5 rounded-xl bg-teal-50 border border-teal-200 text-xs text-teal-900 font-medium">
            💡 <strong>\${explHead}</strong> \${correctText}<br>
            <span class="text-slate-600 mt-1 block">\${explText || ''}</span>
          </div>
        \`;
        container.appendChild(card);
      });
    }

    function selectAnswer(qIdx, optIdx) {
      userAnswers[qIdx] = optIdx;
    }

    function submitAndGrade() {
      let correctCount = 0;
      questions.forEach((q, idx) => {
        const card = document.getElementById('question-card-' + idx);
        const expl = document.getElementById('explanation-' + idx);
        if (userAnswers[idx] === q.correctAnswer) {
          correctCount++;
          if (card) {
            card.classList.remove('border-rose-300', 'bg-rose-50/20');
            card.classList.add('border-emerald-500', 'bg-emerald-50/30');
          }
        } else {
          if (card) {
            card.classList.remove('border-emerald-500', 'bg-emerald-50/30');
            card.classList.add('border-rose-300', 'bg-rose-50/20');
          }
        }
        if (expl) expl.classList.remove('hidden');
      });

      const totalScore = Math.round((correctCount / questions.length) * 100);
      const banner = document.getElementById('result-banner');
      banner.classList.remove('hidden');
      document.getElementById('score-text').textContent = totalScore + ' / 100';
      banner.scrollIntoView({ behavior: 'smooth' });
    }

    function toggleAnswers() {
      showAnswersState = !showAnswersState;
      questions.forEach((q, idx) => {
        const expl = document.getElementById('explanation-' + idx);
        if (expl) {
          if (showAnswersState) expl.classList.remove('hidden');
          else expl.classList.add('hidden');
        }
      });
    }

    function reshuffleQuestions() {
      questions.sort(() => Math.random() - 0.5);
      userAnswers = {};
      renderQuestions();
      document.getElementById('result-banner').classList.add('hidden');
    }

    function resetExam() {
      const msg = currentLang === 'ar' ? 'هل تريد مسح جميع الإجابات وبدء الاختبار من جديد؟' : 'Reset all answers and start over?';
      if (confirm(msg)) {
        userAnswers = {};
        renderQuestions();
        document.getElementById('result-banner').classList.add('hidden');
        timerSeconds = durationMinutes * 60;
      }
    }

    // Toggle Bilingual Language (Arabic <-> English)
    function toggleLanguage() {
      currentLang = currentLang === 'ar' ? 'en' : 'ar';
      const html = document.documentElement;
      
      if (currentLang === 'en') {
        html.dir = 'ltr';
        html.lang = 'en';
        document.getElementById('lang-btn-label').textContent = 'عربي';
        document.getElementById('lbl-timer').textContent = '⏰ Time Left:';
        document.getElementById('badge-random').textContent = '🎲 Random Questions';
        document.getElementById('toggle-answers-text').textContent = 'Show/Hide Answers';
        document.getElementById('btn-print-text').textContent = 'Print';
        document.getElementById('btn-new-q-text').textContent = 'New Questions';
        document.getElementById('btn-reset-text').textContent = 'Clear Progress';
        document.getElementById('save-progress-hint').innerHTML = 'Progress is saved automatically - <span id="q-count-badge"></span>';
        document.getElementById('lbl-date').textContent = '📅 Date:';
        document.getElementById('lbl-name').textContent = '😊 Name:';
        document.getElementById('student-name').placeholder = 'Enter your name';
        document.getElementById('lbl-group').textContent = '🏫 Class:';
        document.getElementById('student-group').placeholder = 'Class ID';
        document.getElementById('lbl-duration').textContent = '⏰ Duration:';
        document.getElementById('duration-val').textContent = durationMinutes + ' mins';
        document.getElementById('lbl-total-marks').textContent = '📊 Total:';
        document.getElementById('total-marks-val').textContent = '100 marks';
        document.getElementById('submit-btn-text').textContent = 'Submit & Grade!';
        document.getElementById('result-title').textContent = 'Final Exam Result';
        document.getElementById('feedback-text').textContent = 'Well done! Review the answers detailed below.';
        document.getElementById('send-teacher-title').textContent = '📤 Send Exam Score & Answers to Teacher:';
        document.getElementById('btn-wa-text').textContent = 'Send via WhatsApp';
        document.getElementById('btn-email-text').textContent = 'Send via Email';
        document.getElementById('btn-copy-summary').textContent = 'Copy Score Report';
      } else {
        html.dir = 'rtl';
        html.lang = 'ar';
        document.getElementById('lang-btn-label').textContent = 'English';
        document.getElementById('lbl-timer').textContent = '⏰ الوقت المتبقي:';
        document.getElementById('badge-random').textContent = '🎲 أسئلة عشوائية';
        document.getElementById('toggle-answers-text').textContent = 'إظهار/إخفاء الإجابات';
        document.getElementById('btn-print-text').textContent = 'طباعة';
        document.getElementById('btn-new-q-text').textContent = 'أسئلة جديدة';
        document.getElementById('btn-reset-text').textContent = 'مسح التقدم';
        document.getElementById('save-progress-hint').innerHTML = 'يتم حفظ تقدمك تلقائياً - <span id="q-count-badge"></span>';
        document.getElementById('lbl-date').textContent = '📅 التاريخ:';
        document.getElementById('lbl-name').textContent = '😊 الاسم:';
        document.getElementById('student-name').placeholder = 'اكتب اسمك';
        document.getElementById('lbl-group').textContent = '🏫 الشعبة:';
        document.getElementById('student-group').placeholder = 'الشعبة';
        document.getElementById('lbl-duration').textContent = '⏰ المدة:';
        document.getElementById('duration-val').textContent = durationMinutes + ' دقيقة';
        document.getElementById('lbl-total-marks').textContent = '📊 المجموع:';
        document.getElementById('total-marks-val').textContent = '100 درجة';
        document.getElementById('submit-btn-text').textContent = 'صحح إجاباتي!';
        document.getElementById('result-title').textContent = 'النتيجة النهائية';
        document.getElementById('feedback-text').textContent = 'أحسنت! راجع الإجابات الموضحة في الأسئلة.';
        document.getElementById('send-teacher-title').textContent = '📤 إرسال ورقة الإجابة والنتيجة إلى المعلم:';
        document.getElementById('btn-wa-text').textContent = 'إرسال عبر واتساب (WhatsApp)';
        document.getElementById('btn-email-text').textContent = 'إرسال عبر البريد الإلكتروني';
        document.getElementById('btn-copy-summary').textContent = 'نسخ تقرير الدرجة';
      }

      renderQuestions();
    }

    // Send to Teacher via WhatsApp
    function sendResultToTeacherWhatsApp() {
      const name = document.getElementById('student-name').value.trim() || (currentLang === 'ar' ? 'طالب غير محدد' : 'Anonymous Student');
      const group = document.getElementById('student-group').value.trim() || '-';
      const score = document.getElementById('score-text').textContent;
      const title = document.getElementById('exam-title-display').textContent.trim();
      
      const text = encodeURIComponent(
        \`السلام عليكم ورحمة الله،\nتقرير نتيجة امتحان الطالب:\n- الامتحان: \${title}\n- اسم الطالب: \${name}\n- الشعبة: \${group}\n- النتيجة: \${score}\n- التاريخ: 2026/09/16\`
      );
      window.open(\`https://wa.me/\${teacherPhoneNumber}?text=\${text}\`, '_blank');
    }

    // Send to Teacher via Email
    function sendResultViaEmail() {
      const name = document.getElementById('student-name').value.trim() || 'الطالب';
      const score = document.getElementById('score-text').textContent;
      const title = document.getElementById('exam-title-display').textContent.trim();
      
      const subject = encodeURIComponent(\`نتيجة امتحان \${title} - الطالب: \${name}\`);
      const body = encodeURIComponent(\`امتحان: \${title}\nاسم الطالب: \${name}\nالدرجة النهائية: \${score}\nتاريخ الإجراء: 2026/09/16\`);
      window.location.href = \`mailto:\${teacherEmail}?subject=\${subject}&body=\${body}\`;
    }

    function copyResultSummary() {
      const name = document.getElementById('student-name').value.trim() || 'طالب';
      const score = document.getElementById('score-text').textContent;
      const title = document.getElementById('exam-title-display').textContent.trim();
      const report = \`تقرير نتيجة امتحان: \${title}\nالطالب: \${name}\nالدرجة: \${score}\nالتاريخ: 2026/09/16\`;
      navigator.clipboard.writeText(report);
      alert(currentLang === 'ar' ? 'تم نسخ التقرير بنجاح!' : 'Result summary copied to clipboard!');
    }

    // Timer countdown
    setInterval(() => {
      if (timerSeconds > 0) {
        timerSeconds--;
        const mins = Math.floor(timerSeconds / 60);
        const secs = timerSeconds % 60;
        document.getElementById('timer').textContent = 
          String(mins).padStart(2, '0') + ':' + String(secs).padStart(2, '0');
      }
    }, 1000);

    // Initial render
    renderQuestions();
  </script>
</body>
</html>`
  },
  {
    id: "interactive-html-quiz",
    title: "تطبيق امتحان ويب تفاعلي (HTML + Tailwind + JS)",
    titleEn: "Interactive Web Quiz (HTML/JS)",
    category: "Web & Browser",
    language: "html",
    extension: "html",
    description: "صفحة ويب متكاملة بتصميم عصري وأنيق، تشمل عداد تنازلي، شريط تقدم، تصحيح فوري، واحتساب النتيجة مع مؤثرات.",
    code: `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>امتحان تفاعلي للفيزياء والرياضيات - نموذج كود</title>
  <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
  <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Cairo', sans-serif; }
    .math-font { font-family: 'Times New Roman', serif; direction: ltr; display: inline-block; }
  </style>
</head>
<body class="bg-slate-900 text-slate-100 min-h-screen py-10 px-4">
  <div class="max-w-2xl mx-auto bg-slate-800 border border-slate-700 rounded-2xl p-6 shadow-2xl">
    <!-- Header -->
    <div class="flex items-center justify-between border-b border-slate-700 pb-4 mb-6">
      <div>
        <h1 id="exam-title" class="text-2xl font-bold text-teal-400">امتحان الفيزياء والرياضيات التفاعلي</h1>
        <p class="text-xs text-slate-400 mt-1">مسائل حسابية وقوانين ومعادلات مع تصحيح فوري</p>
      </div>
      <div class="text-left bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-700 text-sm font-mono text-emerald-400">
        الوقت: <span id="timer">30:00</span>
      </div>
    </div>

    <!-- Progress -->
    <div class="mb-6">
      <div class="flex justify-between text-xs text-slate-400 mb-1">
        <span>السؤال <span id="current-index">1</span> من <span id="total-count">3</span></span>
        <span id="score-counter">الدرجة: 0</span>
      </div>
      <div class="w-full bg-slate-700 rounded-full h-2">
        <div id="progress-bar" class="bg-teal-500 h-2 rounded-full transition-all duration-300" style="width: 33%"></div>
      </div>
    </div>

    <!-- Question Container -->
    <div id="quiz-container">
      <h2 id="question-text" class="text-lg font-semibold text-white mb-4">تحرك جسم من السكون بعجلة منتظمة a = 4 m/s² لمدة 5 ثوانٍ، احسب سرعته النهائية (v) والمسافة (d):</h2>
      <div id="options-container" class="space-y-3">
        <!-- Options generated dynamically -->
      </div>
    </div>

    <!-- Actions -->
    <div class="mt-8 flex justify-between items-center pt-4 border-t border-slate-700">
      <button id="prev-btn" onclick="prevQuestion()" class="px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-sm disabled:opacity-40" disabled>السابق</button>
      <button id="next-btn" onclick="nextQuestion()" class="px-6 py-2 rounded-lg bg-teal-600 hover:bg-teal-500 text-sm font-semibold text-white">التالي</button>
    </div>

    <!-- Results Modal -->
    <div id="result-view" class="hidden text-center py-8">
      <div class="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl font-bold">✓</div>
      <h2 class="text-2xl font-bold text-white mb-2">تم إنهاء الامتحان بنجاح!</h2>
      <p id="final-score" class="text-xl text-teal-300 font-semibold mb-6">درجتك: 3 / 3</p>
      <button onclick="restartQuiz()" class="px-6 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-lg">إعادة الامتحان</button>
    </div>
  </div>

  <script>
    // بنك مسائل الفيزياء والرياضيات التفاعلية
    const questions = [
      {
        text: "تحرك جسم من السكون بعجلة منتظمة a = 4 m/s² لمدة 5 ثوانٍ، احسب سرعته النهائية (v) والمسافة المقطوعة (d):",
        options: ["v = 20 m/s , d = 50 m", "v = 20 m/s , d = 100 m", "v = 10 m/s , d = 25 m", "v = 15 m/s , d = 40 m"],
        correct: 0,
        explanation: "السرعة: v = at = 4 × 5 = 20 m/s. المسافة: d = 0.5 a t² = 0.5 × 4 × 25 = 50 m."
      },
      {
        text: "في دائرة كهربائية موصل بها مقاومتان (6 Ω, 3 Ω) على التوازي مع بطارية 12 V، ما مقدار شدة التيار الكلي I؟",
        options: ["6 A", "2 A", "4 A", "1.5 A"],
        correct: 0,
        explanation: "المقاومة المكافئة R_p = (6 × 3)/(6 + 3) = 2 Ω. التيار الكلي I = V / R = 12 / 2 = 6 A."
      },
      {
        text: "أوجد ميل المماس لمنحنى الدالة f(x) = 3x² - 5x + 7 عند النقطة التي إحداثيها x = 2:",
        options: ["7", "12", "6", "1"],
        correct: 0,
        explanation: "المشتقة f'(x) = 6x - 5. بالتعويض بـ x = 2: f'(2) = 6(2) - 5 = 12 - 5 = 7."
      }
    ];

    let currentIndex = 0;
    let userAnswers = {};

    function renderQuestion() {
      const q = questions[currentIndex];
      document.getElementById('current-index').textContent = currentIndex + 1;
      document.getElementById('total-count').textContent = questions.length;
      document.getElementById('question-text').textContent = q.text;
      document.getElementById('progress-bar').style.width = ((currentIndex + 1) / questions.length * 100) + '%';
      
      const optContainer = document.getElementById('options-container');
      optContainer.innerHTML = '';

      q.options.forEach((opt, idx) => {
        const btn = document.createElement('button');
        const isSelected = userAnswers[currentIndex] === idx;
        btn.className = \`w-full text-right p-3.5 rounded-xl border transition-all text-sm font-medium flex items-center justify-between \${
          isSelected 
            ? 'bg-indigo-600/30 border-indigo-500 text-indigo-200' 
            : 'bg-slate-700/50 border-slate-600 hover:bg-slate-700 text-slate-200'
        }\`;
        btn.innerHTML = \`<span>\${opt}</span><span class="w-5 h-5 rounded-full border border-slate-500 flex items-center justify-center text-xs \${isSelected ? 'bg-indigo-500 border-indigo-500 text-white' : ''}">\${isSelected ? '●' : ''}</span>\`;
        btn.onclick = () => selectOption(idx);
        optContainer.appendChild(btn);
      });

      document.getElementById('prev-btn').disabled = currentIndex === 0;
      document.getElementById('next-btn').textContent = currentIndex === questions.length - 1 ? 'إنهاء الامتحان' : 'التالي';
    }

    function selectOption(idx) {
      userAnswers[currentIndex] = idx;
      renderQuestion();
    }

    function nextQuestion() {
      if (currentIndex < questions.length - 1) {
        currentIndex++;
        renderQuestion();
      } else {
        finishQuiz();
      }
    }

    function prevQuestion() {
      if (currentIndex > 0) {
        currentIndex--;
        renderQuestion();
      }
    }

    function finishQuiz() {
      let score = 0;
      questions.forEach((q, idx) => {
        if (userAnswers[idx] === q.correct) score++;
      });
      document.getElementById('quiz-container').classList.add('hidden');
      document.getElementById('prev-btn').classList.add('hidden');
      document.getElementById('next-btn').classList.add('hidden');
      document.getElementById('result-view').classList.remove('hidden');
      document.getElementById('final-score').textContent = \`درجتك: \${score} من \${questions.length} (\${Math.round(score/questions.length*100)}%)\`;
    }

    function restartQuiz() {
      userAnswers = {};
      currentIndex = 0;
      document.getElementById('quiz-container').classList.remove('hidden');
      document.getElementById('prev-btn').classList.remove('hidden');
      document.getElementById('next-btn').classList.remove('hidden');
      document.getElementById('result-view').classList.add('hidden');
      renderQuestion();
    }

    renderQuestion();
  </script>
</body>
</html>`
  },
  {
    id: "python-cli-exam",
    title: "سكربت بايثون تفاعلي في الترمنال (Python CLI)",
    titleEn: "Python Terminal Quiz CLI",
    category: "Backend & CLI",
    language: "python",
    extension: "py",
    description: "كود بايثون متكامل يطرح الأسئلة في سطر الأوامر، يحسب النقاط، يعرض شريط تقدم وتقرير نهائي.",
    code: `"""
امتحان تفاعلي للفيزياء والرياضيات - سكربت بايثون
Interactive Physics & Mathematics Exam - Python CLI Runner
"""
import sys
import time

class Question:
    def __init__(self, text, options, correct_index, explanation=""):
        self.text = text
        self.options = options
        self.correct_index = correct_index
        self.explanation = explanation

# مصفوفة مسائل وقوانين الفيزياء والرياضيات التفاعلية
QUESTIONS = [
    Question(
        text="تتحرك سيارة بسرعة ابتدائية v₀ = 10 m/s وبتسارع منتظم a = 3 m/s² لمدة t = 4 s. ما المسافة المقطوعة (d)؟",
        options=["64 m", "52 m", "40 m", "24 m"],
        correct_index=0,
        explanation="القانون: d = v₀t + 0.5 a t² = 10(4) + 0.5(3)(16) = 40 + 24 = 64 m."
    ),
    Question(
        text="ما مقدار القوة المحصلة F المؤثرة على كتلة m = 5 kg لتكسبها تسارعاً a = 8 m/s²؟",
        options=["40 N", "13 N", "1.6 N", "200 N"],
        correct_index=0,
        explanation="قانون نيوتن الثاني: F = m · a = 5 × 8 = 40 N."
    ),
    Question(
        text="أوجد المشتقة الأولى للدالة f(x) = 3x² - 5x + 4 عند النقطة x = 2:",
        options=["7", "12", "6", "1"],
        correct_index=0,
        explanation="المشتقة: f'(x) = 6x - 5. بالتعويض بـ x = 2: f'(2) = 6(2) - 5 = 7."
    )
]

def run_exam(exam_title="امتحان الفيزياء والرياضيات"):
    print("=" * 60)
    print(f"       📐 {exam_title}")
    print("=" * 60)
    print(f"عدد الأسئلة: {len(QUESTIONS)}")
    print("أدخل رقم الخيار (1-4) واضغط Enter لكل مسألة.\\n")

    score = 0
    start_time = time.time()

    for idx, q in enumerate(QUESTIONS, 1):
        print(f"\\n[مسألة {idx}/{len(QUESTIONS)}] {q.text}")
        for opt_idx, opt in enumerate(q.options, 1):
            print(f"   {opt_idx}. {opt}")

        while True:
            try:
                ans = input("\\nإجابتك (1-4): ").strip()
                choice = int(ans)
                if 1 <= choice <= len(q.options):
                    break
                print("⚠️ الرجاء إدخال رقم خيار صحيح بين 1 و", len(q.options))
            except ValueError:
                print("⚠️ إدخال غير صالح، يرجى إدخال رقم.")

        if (choice - 1) == q.correct_index:
            print("✅ إجابة صحيحة ومحسوبة بدقة!")
            score += 1
        else:
            correct_opt = q.options[q.correct_index]
            print(f"❌ إجابة خاطئة. الإجابة الصحيحة هي: {correct_opt}")
            if q.explanation:
                print(f"💡 خطوات الحل: {q.explanation}")

    elapsed = round(time.time() - start_time, 1)
    percentage = round((score / len(QUESTIONS)) * 100, 1)

    print("\\n" + "=" * 60)
    print("               🏁 نتيجة امتحان الفيزياء والرياضيات")
    print("=" * 60)
    print(f"الدرجة النهائية: {score} من {len(QUESTIONS)} ({percentage}%)")
    print(f"الوقت المستغرق: {elapsed} ثانية")
    
    if percentage >= 85:
        print("التقدير: ممتاز 🌟")
    elif percentage >= 70:
        print("التقدير: جيد جداً 👍")
    elif percentage >= 50:
        print("التقدير: ناجح ✔️")
    else:
        print("التقدير: تحتاج للمزيد من التدريب على المسائل 📚")
    print("=" * 60)

if __name__ == "__main__":
    run_exam()`
  },
  {
    id: "react-quiz-component",
    title: "مكون ريأكت تفاعلي (React + TypeScript Component)",
    titleEn: "React Quiz Component (TSX)",
    category: "React / Frontend",
    language: "typescript",
    extension: "tsx",
    description: "مكون ريأكت كامل مع State، عداد نقاط، خيارات تفاعلية وتصميم Tailwind عصري لمسائل الفيزياء والرياضيات.",
    code: `import React, { useState } from 'react';

interface QuestionItem {
  id: number;
  question: string;
  formula: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

// بنك مسائل الفيزياء والرياضيات التفاعلية
const EXAM_QUESTIONS: QuestionItem[] = [
  {
    id: 1,
    question: "في دائرة كهربائية موصل بها مقاومتان متوازيتان (6 Ω, 3 Ω) على التوالي مع مقاومة 2 Ω ومصدر جهد 16 V، ما شدة التيار الكلي I؟",
    formula: "I = V / R_eq",
    options: ["4 A", "2.67 A", "8 A", "1.6 A"],
    correctAnswer: 0,
    explanation: "المقاومة المكافئة: R_p = (6 × 3) / 9 = 2 Ω. المقاومة الكلية: R_eq = 2 + 2 = 4 Ω. التيار I = 16 / 4 = 4 A."
  },
  {
    id: 2,
    question: "أوجد ميل المماس لمنحنى الدالة f(x) = 2x² - 5x + 4 عند النقطة التي إحداثيها x = 3:",
    formula: "f'(x) = 4x - 5",
    options: ["7", "11", "5", "9"],
    correctAnswer: 0,
    explanation: "المشتقة الأولى تمثل الميل: f'(x) = 4x - 5. بالتعويض بـ x = 3: f'(3) = 4(3) - 5 = 7."
  }
];

export const ExamQuizComponent: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  const currentQ = EXAM_QUESTIONS[currentIndex];

  const handleSelect = (optionIdx: number) => {
    setSelectedAnswers(prev => ({ ...prev, [currentIndex]: optionIdx }));
  };

  const calculateScore = () => {
    let score = 0;
    EXAM_QUESTIONS.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctAnswer) score++;
    });
    return score;
  };

  if (isSubmitted) {
    const score = calculateScore();
    return (
      <div className="max-w-lg mx-auto bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center text-white">
        <h2 className="text-2xl font-bold mb-4">نتيجة الامتحان</h2>
        <div className="text-4xl font-black text-teal-400 mb-2">
          {score} / {EXAM_QUESTIONS.length}
        </div>
        <button
          onClick={() => { setSelectedAnswers({}); setIsSubmitted(false); setCurrentIndex(0); }}
          className="mt-6 px-6 py-2.5 bg-teal-600 hover:bg-teal-500 rounded-xl font-medium"
        >
          إعادة المحاولة
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white shadow-xl">
      <div className="flex justify-between items-center mb-6">
        <span className="text-sm text-slate-400">مسألة {currentIndex + 1} من {EXAM_QUESTIONS.length}</span>
        <span className="px-3 py-1 bg-teal-950 text-teal-400 border border-teal-800 rounded-full text-xs font-mono">
          {currentQ.formula}
        </span>
      </div>

      <h3 className="text-lg font-semibold mb-6">{currentQ.question}</h3>

      <div className="space-y-3">
        {currentQ.options.map((option, idx) => {
          const isSelected = selectedAnswers[currentIndex] === idx;
          return (
            <button
              key={idx}
              onClick={() => handleSelect(idx)}
              className={\`w-full text-right p-4 rounded-xl border transition-all text-sm flex items-center justify-between \${
                isSelected
                  ? 'bg-teal-600/30 border-teal-500 text-teal-200'
                  : 'bg-slate-800/60 border-slate-700 hover:bg-slate-800 text-slate-300'
              }\`}
            >
              <span>{option}</span>
              <div className={\`w-4 h-4 rounded-full border \${isSelected ? 'bg-teal-500 border-teal-400' : 'border-slate-600'}\`} />
            </button>
          );
        })}
      </div>

      <div className="mt-8 flex justify-between">
        <button
          disabled={currentIndex === 0}
          onClick={() => setCurrentIndex(prev => prev - 1)}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm disabled:opacity-40"
        >
          السابق
        </button>
        {currentIndex === EXAM_QUESTIONS.length - 1 ? (
          <button
            onClick={() => setIsSubmitted(true)}
            className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-sm font-semibold"
          >
            تسليم الامتحان
          </button>
        ) : (
          <button
            onClick={() => setCurrentIndex(prev => prev + 1)}
            className="px-6 py-2 bg-teal-600 hover:bg-teal-500 rounded-lg text-sm font-semibold"
          >
            التالي
          </button>
        )}
      </div>
    </div>
  );
};`
  },
  {
    id: "json-question-bank",
    title: "قاعدة بيانات أسئلة مهيكلة (JSON Question Bank)",
    titleEn: "JSON Question Bank Schema",
    category: "Data & Schema",
    language: "json",
    extension: "json",
    description: "تنسيق JSON قياسي وموثق لمسائل الفيزياء والرياضيات مع القوانين والحلول النموذجية.",
    code: `{
  "examMetadata": {
    "title": "بنك مسائل الفيزياء والرياضيات التفاعلي",
    "subject": "Physics & Mathematics",
    "courseCode": "PHY-MATH-301",
    "totalMarks": 100,
    "durationMinutes": 60,
    "instructions": "اختر الإجابة الصحيحة لكل مسألة بناءً على القوانين العلمية والخطوات الحسابية."
  },
  "questions": [
    {
      "id": "q1",
      "number": 1,
      "type": "multiple_choice",
      "topic": "الدوائر الكهربائية وقانون أوم",
      "lawOrFormula": "I = V / R_eq",
      "questionText": "في دائرة موصل بها مقاومتان متوازيتان (6 Ω, 3 Ω) على التوالي مع 2 Ω ومصدر 16 V، ما شدة التيار الكلي؟",
      "choices": [
        { "key": "A", "text": "4 A" },
        { "key": "B", "text": "2.67 A" },
        { "key": "C", "text": "8 A" },
        { "key": "D", "text": "1.6 A" }
      ],
      "correctAnswer": "A",
      "points": 25,
      "explanation": "المقاومة المكافئة R_p = (6 × 3) / 9 = 2 Ω. المقاومة الكلية R_eq = 2 + 2 = 4 Ω. شدة التيار I = 16 / 4 = 4 A."
    },
    {
      "id": "q2",
      "number": 2,
      "type": "multiple_choice",
      "topic": "حساب التفاضل وميل المماس",
      "lawOrFormula": "f'(x) = dy/dx",
      "questionText": "أوجد ميل المماس لمنحنى الدالة f(x) = 2x² - 5x + 4 عند النقطة x = 3:",
      "choices": [
        { "key": "A", "text": "7" },
        { "key": "B", "text": "11" },
        { "key": "C", "text": "5" },
        { "key": "D", "text": "9" }
      ],
      "correctAnswer": "A",
      "points": 25,
      "explanation": "المشتقة f'(x) = 4x - 5. بالتعويض بـ x = 3: f'(3) = 4(3) - 5 = 7."
    }
  ]
}`
  },
  {
    id: "latex-exam-template",
    title: "ورقة امتحان أكاديمي منسقة (LaTeX / Markdown)",
    titleEn: "Academic Exam Sheet (Markdown / LaTeX)",
    category: "Academic & Print",
    language: "markdown",
    extension: "md",
    description: "تنسيق أكاديمي فائق الدقة مناسب لمادتي الفيزياء والرياضيات مع المعادلات والرموز العلمية وسلالم الدرجات.",
    code: `# ثانوية المتفوقين للعلوم والتكنولوجيا
## قسم العلوم الدقيقة | امتحان الفيزياء والرياضيات الموحد
### الصف الثالث الثانوي / الثاني عشر | نموذج امتحاني تفاعلي
**زمن الامتحان: 60 دقيقة | الدرجة الكلية: 100 درجة**

---

### القوانين والصيغ المرجعية:
$$\\vec{F} = m \\cdot \\vec{a} \\quad , \\quad v^2 = v_0^2 + 2ad \\quad , \\quad V = I \\cdot R \\quad , \\quad \\frac{d}{dx}[x^n] = n x^{n-1} \\quad , \\quad \\int x^n dx = \\frac{x^{n+1}}{n+1}$$

---

### الأسئلة والمسائل الحسابية (اختر الإجابة الصحيحة):

**1. تؤثر قوة أفقية ثابتة مقدارها $F = 40\\text{ N}$ على كتلة $m = 5\\text{ kg}$ ساكنة على سطح أملس، فما سرعتها بعد قطع $d = 4\\text{ m}$؟**
- [x] أ) $8\\text{ m/s}$
- [ ] ب) $4\\text{ m/s}$
- [ ] ج) $16\\text{ m/s}$
- [ ] د) $6.4\\text{ m/s}$

*خطوات الحل النموذجية:* التسارع $a = F/m = 40/5 = 8\\text{ m/s}^2$. من معادلة الحركة: $v = \\sqrt{2ad} = \\sqrt{2 \\times 8 \\times 4} = \\sqrt{64} = 8\\text{ m/s}$.

---

**2. احسب قيمة التكامل المحدود: $\\int_{1}^{4} (3x^2 - 2x) dx$:**
- [x] أ) $48$
- [ ] ب) $63$
- [ ] ج) $45$
- [ ] د) $52$

*خطوات الحل النموذجية:* الدالة الأصلية $F(x) = [x^3 - x^2]_1^4 = (4^3 - 4^2) - (1^3 - 1^2) = (64 - 16) - 0 = 48$.
`
  }
];
