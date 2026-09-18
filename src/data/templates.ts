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
            <span id="q-text-0">ما هي الوحدة الدولية الأساسية لقياس شدة التيار الكهربائي؟</span>
          </h3>
          <span class="px-2 py-0.5 rounded bg-teal-50 text-teal-700 text-[11px] font-bold shrink-0 border border-teal-200">20 درجات</span>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-3" id="q-options-0">
          <label class="flex items-center gap-3 p-3.5 rounded-xl border border-slate-200 hover:border-teal-400 hover:bg-teal-50/50 cursor-pointer transition text-xs md:text-sm bg-white">
            <input type="radio" name="q_0" value="0" onchange="selectAnswer(0, 0)" class="w-4 h-4 text-teal-600 focus:ring-teal-500">
            <span class="font-medium text-slate-800">الفولت (V)</span>
          </label>
          <label class="flex items-center gap-3 p-3.5 rounded-xl border border-slate-200 hover:border-teal-400 hover:bg-teal-50/50 cursor-pointer transition text-xs md:text-sm bg-white">
            <input type="radio" name="q_0" value="1" onchange="selectAnswer(0, 1)" class="w-4 h-4 text-teal-600 focus:ring-teal-500">
            <span class="font-medium text-slate-800">الأمبير (A)</span>
          </label>
          <label class="flex items-center gap-3 p-3.5 rounded-xl border border-slate-200 hover:border-teal-400 hover:bg-teal-50/50 cursor-pointer transition text-xs md:text-sm bg-white">
            <input type="radio" name="q_0" value="2" onchange="selectAnswer(0, 2)" class="w-4 h-4 text-teal-600 focus:ring-teal-500">
            <span class="font-medium text-slate-800">الأوم (Ω)</span>
          </label>
          <label class="flex items-center gap-3 p-3.5 rounded-xl border border-slate-200 hover:border-teal-400 hover:bg-teal-50/50 cursor-pointer transition text-xs md:text-sm bg-white">
            <input type="radio" name="q_0" value="3" onchange="selectAnswer(0, 3)" class="w-4 h-4 text-teal-600 focus:ring-teal-500">
            <span class="font-medium text-slate-800">الكولوم (C)</span>
          </label>
        </div>
        <div id="explanation-0" class="hidden p-3.5 rounded-xl bg-teal-50 border border-teal-200 text-xs text-teal-900 font-medium">
          💡 <strong>الإجابة الصحيحة:</strong> الأمبير (A)<br>
          <span class="text-slate-600 mt-1 block">الأمبير (Ampere) هو الوحدة الدولية الأساسية المعتمدة في النظام الدولي (SI) لقياس شدة التيار.</span>
        </div>
      </div>

      <!-- Question Card 2 -->
      <div class="bg-white teal-border-card p-5 md:p-6 transition shadow-sm" id="question-card-1">
        <div class="flex items-start justify-between gap-3 mb-3">
          <h3 class="font-bold text-slate-800 text-sm md:text-base leading-relaxed">
            <span class="text-teal-600 font-extrabold ml-1">(2)</span>
            <span id="q-text-1">النانومتر (1 nm) يعادل بالمتر:</span>
          </h3>
          <span class="px-2 py-0.5 rounded bg-teal-50 text-teal-700 text-[11px] font-bold shrink-0 border border-teal-200">20 درجات</span>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-3" id="q-options-1">
          <label class="flex items-center gap-3 p-3.5 rounded-xl border border-slate-200 hover:border-teal-400 hover:bg-teal-50/50 cursor-pointer transition text-xs md:text-sm bg-white">
            <input type="radio" name="q_1" value="0" onchange="selectAnswer(1, 0)" class="w-4 h-4 text-teal-600 focus:ring-teal-500">
            <span class="font-medium text-slate-800">10^-6 m</span>
          </label>
          <label class="flex items-center gap-3 p-3.5 rounded-xl border border-slate-200 hover:border-teal-400 hover:bg-teal-50/50 cursor-pointer transition text-xs md:text-sm bg-white">
            <input type="radio" name="q_1" value="1" onchange="selectAnswer(1, 1)" class="w-4 h-4 text-teal-600 focus:ring-teal-500">
            <span class="font-medium text-slate-800">10^-9 m</span>
          </label>
          <label class="flex items-center gap-3 p-3.5 rounded-xl border border-slate-200 hover:border-teal-400 hover:bg-teal-50/50 cursor-pointer transition text-xs md:text-sm bg-white">
            <input type="radio" name="q_1" value="2" onchange="selectAnswer(1, 2)" class="w-4 h-4 text-teal-600 focus:ring-teal-500">
            <span class="font-medium text-slate-800">10^-12 m</span>
          </label>
          <label class="flex items-center gap-3 p-3.5 rounded-xl border border-slate-200 hover:border-teal-400 hover:bg-teal-50/50 cursor-pointer transition text-xs md:text-sm bg-white">
            <input type="radio" name="q_1" value="3" onchange="selectAnswer(1, 3)" class="w-4 h-4 text-teal-600 focus:ring-teal-500">
            <span class="font-medium text-slate-800">10^9 m</span>
          </label>
        </div>
        <div id="explanation-1" class="hidden p-3.5 rounded-xl bg-teal-50 border border-teal-200 text-xs text-teal-900 font-medium">
          💡 <strong>الإجابة الصحيحة:</strong> 10^-9 m<br>
          <span class="text-slate-600 mt-1 block">البادئة نانو (nano) تعني الضرب في المعامل 10 أس سالب تسعة (10^-9).</span>
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
        questionAr: "ما هي الوحدة الدولية الأساسية لقياس شدة التيار الكهربائي؟",
        questionEn: "What is the SI base unit for measuring electric current intensity?",
        optionsAr: ["الفولت (V)", "الأمبير (A)", "الأوم (Ω)", "الكولوم (C)"],
        optionsEn: ["Volt (V)", "Ampere (A)", "Ohm (Ω)", "Coulomb (C)"],
        correctAnswer: 1,
        explanationAr: "الأمبير (Ampere) هو الوحدة الدولية الأساسية المعتمدة في النظام الدولي (SI) لقياس شدة التيار.",
        explanationEn: "Ampere (A) is the SI base unit officially adopted for electric current."
      },
      {
        id: 2,
        questionAr: "النانومتر (1 nm) يعادل بالمتر:",
        questionEn: "One nanometer (1 nm) in meters equals:",
        optionsAr: ["10^-6 m", "10^-9 m", "10^-12 m", "10^9 m"],
        optionsEn: ["10^-6 m", "10^-9 m", "10^-12 m", "10^9 m"],
        correctAnswer: 1,
        explanationAr: "البادئة نانو (nano) تعني الضرب في المعامل 10 أس سالب تسعة (10^-9).",
        explanationEn: "The prefix nano represents a factor of 10^-9."
      },
      {
        id: 3,
        questionAr: "أي من الكميات الفيزيائية التالية تُعد كمية أساسية وليست مشتقة؟",
        questionEn: "Which of the following physical quantities is a fundamental base quantity?",
        optionsAr: ["السرعة", "القوة", "درجة الحرارة المطلقة", "الطاقة الحركية"],
        optionsEn: ["Velocity", "Force", "Thermodynamic Temperature", "Kinetic Energy"],
        correctAnswer: 2,
        explanationAr: "درجة الحرارة بالكلفن من الكميات الأساسية السبع في النظام الدولي.",
        explanationEn: "Thermodynamic temperature (in Kelvin) is one of the seven SI base quantities."
      },
      {
        id: 4,
        questionAr: "البادئة ميجا (Mega) تعادل المعامل العددي:",
        questionEn: "The prefix Mega corresponds to the numerical factor:",
        optionsAr: ["10^3", "10^6", "10^9", "10^-6"],
        optionsEn: ["10^3", "10^6", "10^9", "10^-6"],
        correctAnswer: 1,
        explanationAr: "الميجا تعادل مليون أو 10^6.",
        explanationEn: "Mega denotes 1,000,000 or 10^6."
      },
      {
        id: 5,
        questionAr: "إذا كانت سرعة الضوء تساوي 300,000 km/s، فإنها تعادل بوحدة m/s:",
        questionEn: "If the speed of light is 300,000 km/s, it equals in m/s:",
        optionsAr: ["3 × 10^5 m/s", "3 × 10^8 m/s", "3 × 10^6 m/s", "3 × 10^11 m/s"],
        optionsEn: ["3 × 10^5 m/s", "3 × 10^8 m/s", "3 × 10^6 m/s", "3 × 10^11 m/s"],
        correctAnswer: 1,
        explanationAr: "التحويل من كيلومتر إلى متر بالضرب في 10^3: (3 × 10^5) × 10^3 = 3 × 10^8 m/s.",
        explanationEn: "Converting km to m by multiplying by 10^3 yields: 3 × 10^8 m/s."
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
  <title>امتحان تجريبي قديم - نموذج كود</title>
  <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
  <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Cairo', sans-serif; }
  </style>
</head>
<body class="bg-slate-900 text-slate-100 min-h-screen py-10 px-4">
  <div class="max-w-2xl mx-auto bg-slate-800 border border-slate-700 rounded-2xl p-6 shadow-2xl">
    <!-- Header -->
    <div class="flex items-center justify-between border-b border-slate-700 pb-4 mb-6">
      <div>
        <h1 id="exam-title" class="text-2xl font-bold text-indigo-400">امتحان مادة البرمجة القديم</h1>
        <p class="text-xs text-slate-400 mt-1">أجب عن جميع الأسئلة بدقة</p>
      </div>
      <div class="text-left bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-700 text-sm font-mono text-emerald-400">
        الوقت: <span id="timer">15:00</span>
      </div>
    </div>

    <!-- Progress -->
    <div class="mb-6">
      <div class="flex justify-between text-xs text-slate-400 mb-1">
        <span>السؤال <span id="current-index">1</span> من <span id="total-count">3</span></span>
        <span id="score-counter">الدرجة: 0</span>
      </div>
      <div class="w-full bg-slate-700 rounded-full h-2">
        <div id="progress-bar" class="bg-indigo-500 h-2 rounded-full transition-all duration-300" style="width: 33%"></div>
      </div>
    </div>

    <!-- Question Container -->
    <div id="quiz-container">
      <h2 id="question-text" class="text-lg font-semibold text-white mb-4">ما هو ناتج 2 + 2 في بايثون؟</h2>
      <div id="options-container" class="space-y-3">
        <!-- Options generated dynamically -->
      </div>
    </div>

    <!-- Actions -->
    <div class="mt-8 flex justify-between items-center pt-4 border-t border-slate-700">
      <button id="prev-btn" onclick="prevQuestion()" class="px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-sm disabled:opacity-40" disabled>السابق</button>
      <button id="next-btn" onclick="nextQuestion()" class="px-6 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-sm font-semibold text-white">التالي</button>
    </div>

    <!-- Results Modal -->
    <div id="result-view" class="hidden text-center py-8">
      <div class="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl font-bold">✓</div>
      <h2 class="text-2xl font-bold text-white mb-2">تم إنهاء الامتحان بنجاح!</h2>
      <p id="final-score" class="text-xl text-indigo-300 font-semibold mb-6">درجتك: 3 / 3</p>
      <button onclick="restartQuiz()" class="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg">إعادة الامتحان</button>
    </div>
  </div>

  <script>
    // بيانات الأسئلة القديمة (ستقوم المنصة باستبدالها بأسئلة الامتحان الجديد من الصورة)
    const questions = [
      {
        text: "ما هي لغة البرمجة الأكثر استخداماً في تطوير واجهات الويب التفاعلية؟",
        options: ["Python", "JavaScript", "C++", "Ruby"],
        correct: 1,
        explanation: "جافاسكريبت هي اللغة الأساسية في المتصفح."
      },
      {
        text: "ما هو الوسم الصحيح لإنشاء رابط تشعبي في HTML؟",
        options: ["<link>", "<a>", "<href>", "<route>"],
        correct: 1,
        explanation: "الوسم <a> (Anchor) يستخدم لإنشاء الروابط."
      },
      {
        text: "أي من التالي ليس نوع بيانات أساسي (Primitive) في جافاسكريبت؟",
        options: ["Number", "String", "Array", "Boolean"],
        correct: 2,
        explanation: "المصفوفات Array تعتبر كائنات Object وليست نوعاً أولياً."
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
نموذج كود قديم - سكربت امتحان بايثون
Old Exam Template - Python CLI Quiz Runner
"""
import sys
import time

class Question:
    def __init__(self, text, options, correct_index, explanation=""):
        self.text = text
        self.options = options
        self.correct_index = correct_index
        self.explanation = explanation

# مصفوفة الأسئلة القديمة التي سيتم استبدالها بأسئلة الامتحان الجديد
QUESTIONS = [
    Question(
        text="ما هي الدالة المستخدمة لطباعة النصوص في بايثون؟",
        options=["echo()", "print()", "System.out.println()", "console.log()"],
        correct_index=1,
        explanation="الدالة print() هي الدالة القياسية للطباعة في Python."
    ),
    Question(
        text="أي من الهياكل التالية في بايثون غير قابلة للتعديل (Immutable)؟",
        options=["List", "Dictionary", "Tuple", "Set"],
        correct_index=2,
        explanation="الـ Tuple هي بنية بيانات ثابتة لا يمكن تغيير عناصرها بعد إنشائها."
    ),
    Question(
        text="كيف تبدأ دالة (Function) في لغة بايثون؟",
        options=["function myFunc():", "def myFunc():", "func myFunc():", "define myFunc():"],
        correct_index=1,
        explanation="تُستخدم الكلمة المحجوزة def لتعريف الدوال في Python."
    )
]

def run_exam(exam_title="امتحان مادة البرمجة"):
    print("=" * 60)
    print(f"       📚 {exam_title}")
    print("=" * 60)
    print(f"عدد الأسئلة: {len(QUESTIONS)}")
    print("أدخل رقم الخيار (1-4) واضغط Enter لكل سؤال.\\n")

    score = 0
    start_time = time.time()

    for idx, q in enumerate(QUESTIONS, 1):
        print(f"\\n[سؤال {idx}/{len(QUESTIONS)}] {q.text}")
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
            print("✅ إجابة صحيحة!")
            score += 1
        else:
            correct_opt = q.options[q.correct_index]
            print(f"❌ إجابة خاطئة. الإجابة الصحيحة هي: {correct_opt}")
            if q.explanation:
                print(f"💡 توضيح: {q.explanation}")

    elapsed = round(time.time() - start_time, 1)
    percentage = round((score / len(QUESTIONS)) * 100, 1)

    print("\\n" + "=" * 60)
    print("               🏁 نتيجة الامتحان")
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
        print("التقدير: تحتاج للمزيد من المراجعة 📚")
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
    description: "مكون ريأكت كامل مع State، عداد نقاط، خيارات تفاعلية وتصميم Tailwind عصري.",
    code: `import React, { useState } from 'react';

interface QuestionItem {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

// بيانات الأسئلة القديمة
const EXAM_QUESTIONS: QuestionItem[] = [
  {
    id: 1,
    question: "ما هي الخاصية المسؤولة عن تمرير البيانات من المكون الأب إلى المكون الابن في React؟",
    options: ["State", "Props", "Context", "Redux"],
    correctAnswer: 1,
    explanation: "تستخدم الـ Props لتمرير البيانات من المكونات الأب إلى الأبناء."
  },
  {
    id: 2,
    question: "أي Hook يستخدم لإدارة التأثيرات الجانبية (Side Effects) في مكونات React؟",
    options: ["useState", "useMemo", "useEffect", "useCallback"],
    correctAnswer: 2,
    explanation: "الـ useEffect هو الـ Hook القياسي لتنفيذ الـ Side Effects."
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
        <div className="text-4xl font-black text-indigo-400 mb-2">
          {score} / {EXAM_QUESTIONS.length}
        </div>
        <button
          onClick={() => { setSelectedAnswers({}); setIsSubmitted(false); setCurrentIndex(0); }}
          className="mt-6 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-medium"
        >
          إعادة المحاولة
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white shadow-xl">
      <div className="flex justify-between items-center mb-6">
        <span className="text-sm text-slate-400">سؤال {currentIndex + 1} من {EXAM_QUESTIONS.length}</span>
        <span className="px-3 py-1 bg-indigo-950 text-indigo-400 border border-indigo-800 rounded-full text-xs font-mono">
          React Exam
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
                  ? 'bg-indigo-600/30 border-indigo-500 text-indigo-200'
                  : 'bg-slate-800/60 border-slate-700 hover:bg-slate-800 text-slate-300'
              }\`}
            >
              <span>{option}</span>
              <div className={\`w-4 h-4 rounded-full border \${isSelected ? 'bg-indigo-500 border-indigo-400' : 'border-slate-600'}\`} />
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
            className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-sm font-semibold"
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
    description: "تنسيق JSON قياسي وموثق مناسب لمنصات التعليم الإلكتروني مثل Moodle، Google Forms، أو قواعد البيانات.",
    code: `{
  "examMetadata": {
    "title": "امتحان البرمجة والذكاء الاصطناعي - نموذج قديم",
    "courseCode": "CS201",
    "totalMarks": 30,
    "durationMinutes": 45,
    "instructions": "اختر الإجابة الصحيحة لكل سؤال."
  },
  "questions": [
    {
      "id": "q1",
      "number": 1,
      "type": "multiple_choice",
      "questionText": "ما هي الخوارزمية الأكثر شهرة في تدريب الشبكات العصبية العميقة؟",
      "choices": [
        { "key": "A", "text": "Binary Search" },
        { "key": "B", "text": "Backpropagation (الانتشار العكسي)" },
        { "key": "C", "text": "Dijkstra" },
        { "key": "D", "text": "K-Means" }
      ],
      "correctAnswer": "B",
      "points": 10,
      "explanation": "خوارزمية Backpropagation مع Gradient Descent هي الأساس لتدريب الشبكات العصبية."
    },
    {
      "id": "q2",
      "number": 2,
      "type": "multiple_choice",
      "questionText": "أي من هذه المكتبات مخصصة لتعلم الآلة والشبكات العصبية في بايثون؟",
      "choices": [
        { "key": "A", "text": "PyTorch" },
        { "key": "B", "text": "Flask" },
        { "key": "C", "text": "Django" },
        { "key": "D", "text": "Requests" }
      ],
      "correctAnswer": "A",
      "points": 10,
      "explanation": "PyTorch و TensorFlow هما أشهر أطر العمل لتعلم الآلة والذكاء الاصطناعي."
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
    description: "تنسيق أكاديمي فائق الدقة مناسب للطباعة الورقية أو التصدير كـ PDF مع ترويسة وسلالم الدرجات.",
    code: `# جامعة العلوم والتقنية
## كلية الحاسبات والمعلومات | الفصل الدراسي الأول
### اسم المقرر: هندسة البرمجيات | الرمز: CS310
**زمن الامتحان: ساعتان | الدرجة الكلية: 50 درجة**

---

### تعليمات هامة:
1. تأكد من كتابة اسمك ورقم جلوسك في ورقة الإجابة.
2. أجب عن جميع الأسئلة التالية بوضع علامة (✓) أمام الإجابة الصحيحة.

---

### السؤال الأول: اختر الإجابة الصحيحة (10 درجات لكل سؤال)

**1. أي من المراحل التالية هي الأولى في دورة حياة تطوير البرمجيات (SDLC)؟**
- [ ] أ) كتابة الكود البرمجي (Implementation)
- [x] ب) جمع وتحليل المتطلبات (Requirements Analysis)
- [ ] ج) اختبار النظام (Testing)
- [ ] د) الصيانة (Maintenance)

*نموذج الإجابة والتعليل:* جمع وتحليل المتطلبات هي حجر الأساس لأي مشروع برمجي.

**2. ما هو المبدأ الأساسي في منهجية أجايل (Agile)؟**
- [ ] أ) التوثيق الشامل قبل البدء
- [x] ب) التطوير التكراري والتكيف مع التغيير (Iterative & Flexible)
- [ ] ج) الالتزام الصارم بالخطة دون تعديل
- [ ] د) عزل الفريق عن العميل حتى التسليم النهائي

*نموذج الإجابة والتعليل:* تركز أجايل على التسليم المستمر والتجاوب السريع مع المتطلبات.
`
  }
];
