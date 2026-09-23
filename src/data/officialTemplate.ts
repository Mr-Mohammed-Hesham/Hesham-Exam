export const OFFICIAL_HESHAM_EXAM_TEMPLATE = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <!-- 📝 غيّر عنوان الامتحان والوصف هنا -->
    <title>قالب امتحان تفاعلي | Interactive Exam Template</title>
    <meta name="description" content="امتحان تفاعلي شامل - منصة مستر محمد هشام">
    <meta name="author" content="Mr. Mohammed Hesham">
    
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://cdn.jsdelivr.net/npm/@emailjs/browser@3/dist/email.min.js"></script>
    <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
    <style>
        body { font-family: 'Cairo', sans-serif; }
        body.en-mode { font-family: 'Inter', sans-serif; }
        .correct { background-color: #dcfce7 !important; border-color: #16a34a !important; }
        .incorrect { background-color: #fee2e2 !important; border-color: #dc2626 !important; }
        .timer-warning { color: #dc2626 !important; animation: pulse 1s infinite; }
        @keyframes pulse { 50% { opacity: 0.7; } }
        @media print { .no-print { display: none !important; } }
        .success-badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-weight: bold; font-size: 0.875rem; }
        .grade-excellent { background: #dcfce7; color: #166534; }
        .grade-good { background: #fef3c7; color: #92400e; }
        .grade-pass { background: #dbeafe; color: #1e40af; }
        .grade-fail { background: #fee2e2; color: #991b1b; }
        .lang-switch {
            position: fixed; top: 16px; left: 16px; z-index: 100;
            background: white; padding: 6px; border-radius: 30px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.15); display: flex; gap: 4px;
            border: 2px solid #0d9488;
        }
        [dir="ltr"] .lang-switch { left: auto; right: 16px; }
        .lang-btn {
            padding: 6px 14px; border-radius: 20px; cursor: pointer; font-weight: bold;
            transition: all 0.3s; border: none; font-size: 0.875rem;
            background: transparent; color: #6b7280;
        }
        .lang-btn.active { background: #0d9488; color: white; box-shadow: 0 2px 6px rgba(13,148,136,0.4); }
        .lang-btn:hover:not(.active) { background: #f0fdfa; color: #0d9488; }
        .shuffle-badge {
            display: inline-block;
            background: linear-gradient(135deg, #0d9488, #0f766e);
            color: white; padding: 4px 12px; border-radius: 20px;
            font-size: 0.75rem; font-weight: bold; margin-right: 8px;
            animation: pulse 2s infinite;
        }
        .math-display {
            display: inline-block; direction: ltr;
            font-family: 'Times New Roman', 'Cambria Math', serif;
            font-size: 1.2em; font-style: italic;
            padding: 2px 8px; background: #f0fdfa;
            border-radius: 6px; margin: 2px;
            color: #0f766e; font-weight: 600; letter-spacing: 0.5px;
        }
        .save-indicator {
            position: fixed; bottom: 20px; left: 20px; z-index: 200;
            background: #10b981; color: white; padding: 8px 16px;
            border-radius: 20px; font-size: 0.8rem; font-weight: bold;
            opacity: 0; transition: opacity 0.3s; pointer-events: none;
            box-shadow: 0 4px 12px rgba(16,185,129,0.4);
        }
        .save-indicator.show { opacity: 1; }
        .formula-box {
            background: #f0fdfa; border: 2px solid #14b8a6;
            border-radius: 8px; padding: 12px; margin: 10px 0;
            font-family: 'Times New Roman', serif;
            direction: ltr; text-align: center;
        }
        .exam-diagram-container {
            display: flex; justify-content: center; align-items: center;
            margin: 14px 0; width: 100%; overflow-x: auto;
        }
        .exam-diagram {
            max-width: 100%; height: auto; margin: 8px auto; display: block;
            background: #ffffff; border: 1.5px solid #cbd5e1; border-radius: 12px;
            padding: 10px; box-shadow: 0 3px 10px rgba(0, 0, 0, 0.05);
        }
        .exam-table-container {
            width: 100%; overflow-x: auto; margin: 12px 0;
        }
        .exam-table {
            width: 100%; max-width: 520px; margin: 0 auto;
            border-collapse: collapse; font-size: 0.88rem; text-align: center;
            background-color: #ffffff; border-radius: 8px; overflow: hidden;
            border: 1.5px solid #cbd5e1;
        }
        .exam-table th {
            background-color: #f0fdfa; color: #0f766e; font-weight: bold;
            padding: 8px 12px; border: 1px solid #ccfbf1;
        }
        .exam-table td {
            padding: 6px 12px; border: 1px solid #e2e8f0; color: #1e293b;
            font-family: 'Times New Roman', serif;
        }
        .exam-table tr:nth-child(even) { background-color: #f8fafc; }
        .q-meta-badges {
            display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 8px; align-items: center;
        }
        .q-category-pill {
            display: inline-flex; align-items: center; gap: 4px;
            background: #e0f2fe; color: #0369a1; border: 1px solid #bae6fd;
            font-size: 0.75rem; font-weight: 700; padding: 2px 10px; border-radius: 9999px;
        }
        .q-law-pill {
            display: inline-flex; align-items: center; gap: 4px;
            background: #fef3c7; color: #b45309; border: 1px solid #fde68a;
            font-size: 0.75rem; font-weight: 700; padding: 2px 10px; border-radius: 9999px;
            font-family: 'Times New Roman', 'Cambria Math', serif; direction: ltr;
        }
        .q-type-interactive {
            background: #dcfce7; color: #15803d; border: 1px solid #bbf7d0;
        }
        .q-type-graph {
            background: #ede9fe; color: #6d28d9; border: 1px solid #ddd6fe;
        }
    </style>
</head>
<body class="bg-gradient-to-br from-teal-50 to-emerald-50 text-gray-800 p-4 md:p-8 min-h-screen">

    <div class="lang-switch no-print">
        <button class="lang-btn active" onclick="setLanguage('ar')" id="btn-ar">عربي</button>
        <button class="lang-btn" onclick="setLanguage('en')" id="btn-en">EN</button>
    </div>

    <div id="saveIndicator" class="save-indicator"> <span data-ar="تم الحفظ" data-en="Saved">تم الحفظ</span></div>

    <div id="timer-container" class="max-w-4xl mx-auto mb-4 text-center no-print">
        <div class="bg-white p-4 rounded-2xl shadow-md inline-block border-2 border-teal-100">
            <span class="text-gray-600 ml-2" data-ar="الوقت المتبقي:" data-en="Time Remaining:">⏰ الوقت المتبقي:</span>
            <span id="timer" class="text-2xl font-bold text-teal-600 font-mono">60:00</span>
            <span class="shuffle-badge" data-ar="🎲 أسئلة عشوائية" data-en="🎲 Random Questions">🎲 أسئلة عشوائية</span>
        </div>
    </div>

    <div class="max-w-4xl mx-auto mb-6 flex flex-wrap gap-3 justify-center no-print">
        <button onclick="toggleAnswers()" class="bg-teal-600 hover:bg-teal-700 text-white px-5 py-2 rounded-xl font-medium transition shadow cursor-pointer" data-ar="👀 إظهار / إخفاء الإجابات" data-en="👀 Show / Hide Answers">👀 إظهار / إخفاء الإجابات</button>
        <button onclick="window.print()" class="bg-gray-700 hover:bg-gray-900 text-white px-5 py-2 rounded-xl font-medium transition shadow cursor-pointer" data-ar="🖨️ طباعة" data-en="🖨️ Print">🖨️ طباعة</button>
        <button onclick="reshuffleExam()" class="bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white px-5 py-2 rounded-xl font-medium transition shadow cursor-pointer" data-ar="🔄 أسئلة جديدة" data-en="🔄 New Questions">🔄 أسئلة جديدة</button>
        <button onclick="clearProgress()" class="bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded-xl font-medium transition shadow cursor-pointer" data-ar="🗑️ مسح التقدم" data-en="🗑️ Clear Progress">🗑️ مسح التقدم</button>
    </div>

    <!-- 📝 عناوين الامتحان والوصف المعتمد لمادتي الفيزياء والرياضيات -->
    <header class="max-w-4xl mx-auto bg-white p-6 rounded-2xl shadow-lg mb-8 border-4 border-teal-400">
        <div class="text-center">
            <h1 class="text-2xl md:text-3xl font-bold text-gray-900 mb-2" data-ar="📐 امتحان الفيزياء والرياضيات التفاعلي المتكامل" data-en="📐 Interactive Physics & Mathematics Integrated Exam">📐 امتحان الفيزياء والرياضيات التفاعلي المتكامل</h1>
            <h2 class="text-lg text-teal-600 font-semibold" data-ar="الصف الثاني عشر / المرحلة الثانوية - فيزياء ورياضيات" data-en="Grade 12 / Secondary - Physics & Mathematics">الصف الثاني عشر / المرحلة الثانوية - فيزياء ورياضيات</h2>
            <p class="text-sm text-gray-600 mt-2" data-ar="امتحان تفاعلي تطبيقي: مسائل حسابية دقيقة، معادلات وقوانين، رسوم بيانية SVG، ودوائر كهربية مع تصحيح فوري" data-en="Interactive STEM exam: Quantitative problems, formulas, SVG diagrams, circuits, and instant grading">امتحان تفاعلي تطبيقي: مسائل حسابية دقيقة، معادلات وقوانين، رسوم بيانية SVG، ودوائر كهربية مع تصحيح فوري</p>
            <p class="text-xs text-green-600 mt-2 font-semibold" data-ar="💾 يتم حفظ تقدمك تلقائياً" data-en="💾 Your progress is saved automatically">💾 يتم حفظ تقدمك تلقائياً</p>
        </div>
        <div class="mt-4 flex flex-wrap justify-center gap-4 text-sm text-gray-600">
            <span><span data-ar="📅 التاريخ:" data-en="📅 Date:">📅 التاريخ:</span> <input type="text" id="examDate" class="border-b-2 border-teal-300 bg-transparent w-28 text-center"></span>
            <span><span data-ar="😊 الاسم:" data-en="😊 Name:">😊 الاسم:</span> <input type="text" id="studentName" class="border-b-2 border-teal-300 bg-transparent w-32 text-center" placeholder="اكتب اسمك"></span>
            <span><span data-ar="🏫 الشعبة:" data-en="🏫 Class:">🏫 الشعبة:</span> <input type="text" id="studentClass" class="border-b-2 border-teal-300 bg-transparent w-28 text-center" placeholder="الشعبة"></span>
            <span><span data-ar="⏰ المدة: 60 دقيقة" data-en="⏰ Duration: 60 min">⏰ المدة: 60 دقيقة</span></span>
            <span><span data-ar="📊 المجموع: 100 درجة" data-en="📊 Total: 100 pts">📊 المجموع: 100 درجة</span></span>
        </div>
    </header>

    <!-- 📝 صيغ وقوانين أساسية للامتحان -->
    <div class="max-w-4xl mx-auto mb-6 bg-white p-4 rounded-xl shadow-md border-2 border-teal-200 no-print" id="notes-formula-box">
        <h3 class="font-bold text-lg mb-3 text-teal-700 text-center" data-ar="📐 القوانين والصيغ الرياضية والفيزيائية الهامة" data-en="📐 Key Mathematical & Physical Formulas">📐 القوانين والصيغ الرياضية والفيزيائية الهامة</h3>
        <div class="grid md:grid-cols-2 gap-3 text-sm" id="notes-content">
            <div class="formula-box"><strong>قوانين الحركة والقدرة:</strong> $F = m \cdot a \quad , \quad v = v_0 + a t \quad , \quad P = \frac{V^2}{R}$</div>
            <div class="formula-box"><strong>قوانين الكهرباء والتفاضل:</strong> $V = I \cdot R \quad , \quad \frac{d}{dx}(x^n) = n x^{n-1} \quad , \quad \int x^n dx = \frac{x^{n+1}}{n+1}$</div>
        </div>
    </div>

    <main class="max-w-4xl mx-auto space-y-8" id="exam-content"></main>

    <div class="text-center no-print pb-8 mt-8">
        <button onclick="gradeExam()" class="bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white text-lg px-10 py-4 rounded-2xl font-bold shadow-xl transition transform hover:scale-105 cursor-pointer" data-ar="🎯 صحح إجاباتي!" data-en="🎯 Grade My Answers!">🎯 صحح إجاباتي!</button>
    </div>

    <div id="results-panel" class="max-w-4xl mx-auto mt-8 bg-white p-8 rounded-2xl shadow-2xl border-4 border-teal-400 hidden no-print">
        <h2 class="text-3xl font-bold text-gray-900 mb-6 text-center" data-ar="🏆 نتيجتك يا بطل! 🏆" data-en="🏆 Your Results, Champion! 🏆">🏆 نتيجتك يا بطل! 🏆</h2>
        <div class="grid md:grid-cols-3 gap-4 mb-6">
            <div class="bg-teal-50 p-4 rounded-xl text-center"><p data-ar="😊 الاسم" data-en="😊 Name">😊 الاسم</p><p id="res-name" class="font-bold text-xl text-teal-700">-</p></div>
            <div class="bg-emerald-50 p-4 rounded-xl text-center"><p data-ar="📅 التاريخ" data-en="📅 Date">📅 التاريخ</p><p id="res-date" class="font-bold text-xl text-emerald-700">-</p></div>
            <div class="bg-teal-50 p-4 rounded-xl text-center"><p data-ar="🌟 المجموع" data-en="🌟 Score">🌟 المجموع</p><p id="res-total" class="font-bold text-3xl text-teal-600">0 / 100</p></div>
        </div>
        <div class="text-center mb-6">
            <span id="success-badge" class="success-badge grade-excellent">-</span>
            <p id="success-percent" class="text-4xl font-bold text-teal-600 mt-2">0%</p>
            <p class="text-sm text-gray-500" data-ar="نسبة النجاح" data-en="Success Rate">نسبة النجاح</p>
        </div>
        <div class="bg-gray-50 p-6 rounded-xl mb-6">
            <h3 class="font-bold text-lg mb-4 text-gray-800" data-ar="📊 أدائك في كل قسم:" data-en="📊 Your Performance:">📊 أدائك في كل قسم:</h3>
            <div class="space-y-3" id="sections-performance"></div>
        </div>
        <div class="text-center mb-6">
            <button id="sendEmailBtn" onclick="sendResultsToEmail()" class="bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white text-lg px-8 py-3 rounded-2xl font-bold shadow-xl transition transform hover:scale-105 cursor-pointer" data-ar="📧 أرسل النتيجة للمعلم" data-en="📧 Send Results to Teacher">📧 أرسل النتيجة للمعلم</button>
            <p id="emailStatus" class="text-sm mt-2 text-center font-medium"></p>
        </div>
        <div class="flex gap-3 justify-center">
            <button onclick="window.print()" class="bg-gray-700 text-white px-6 py-3 rounded-xl font-semibold" data-ar="🖨️ طباعة النتيجة" data-en="🖨️ Print Results">🖨️ طباعة النتيجة</button>
        </div>
    </div>

    <footer class="max-w-4xl mx-auto mt-10 mb-8 text-center text-gray-500 text-sm no-print">
        © <span data-ar="عنوان الامتحان" data-en="Exam Title">عنوان الامتحان</span> | Mr. Mohammed Hesham 📐
    </footer>

<script>
// ==================== إعدادات EmailJS ====================
const PUBLIC_KEY = "Rb3Lq8tXaFmc5YHUH";
const SERVICE_ID = "service_w15m64i";
const TEMPLATE_ID = "template_5b0u2tq";
const TARGET_EMAIL = "mohammedhesham872@gmail.com";
emailjs.init(PUBLIC_KEY);

// ==================== 💾 نظام حفظ التقدم ====================
// 📝 غيّر اسم المفتاح ليكون فريداً لكل امتحان جديد
const STORAGE_KEY = 'generic_exam_template_v1'; 

// ⚠️ هام: يجب أن تتطابق هذه الأرقام مع عدد الأسئلة والأقسام التي تضعها في originalExamData بالأسفل
const TOTAL_TIME = 3600; // الوقت بالثواني (3600 = 60 دقيقة)
const TOTAL_QUESTIONS = 20; // العدد الكلي للأسئلة
const TOTAL_SECTIONS = 5; // العدد الكلي للأقسام
const QUESTIONS_PER_SECTION = 4; // عدد الأسئلة في كل قسم (لحساب الدرجات)

let currentSeed = null;
let answersVisible = false;
let saveIndicatorTimeout = null;

function mulberry32(a) {
    return function() {
        var t = a += 0x6D2B79F5;
        t = Math.imul(t ^ t >>> 15, t | 1);
        t ^= t + Math.imul(t ^ t >>> 7, t | 61);
        return ((t ^ t >>> 14) >>> 0) / 4294967296;
    }
}
let rng = null;

function showSaveIndicator() {
    const indicator = document.getElementById('saveIndicator');
    if (!indicator) return;
    indicator.classList.add('show');
    if (saveIndicatorTimeout) clearTimeout(saveIndicatorTimeout);
    saveIndicatorTimeout = setTimeout(() => indicator.classList.remove('show'), 1500);
}

const _memoryStore = {};
function safeStorageGet(k) {
    try {
        if (typeof window !== 'undefined' && window.localStorage) return window.localStorage.getItem(k);
    } catch(e) {}
    return _memoryStore[k] || null;
}
function safeStorageSet(k, v) {
    try {
        if (typeof window !== 'undefined' && window.localStorage) { window.localStorage.setItem(k, v); return; }
    } catch(e) {}
    _memoryStore[k] = String(v);
}
function safeStorageRemove(k) {
    try {
        if (typeof window !== 'undefined' && window.localStorage) { window.localStorage.removeItem(k); return; }
    } catch(e) {}
    delete _memoryStore[k];
}

function saveState(showIndicator = true) {
    try {
        const state = {
            seed: currentSeed, lang: currentLang,
            studentName: document.getElementById('studentName')?.value || '',
            studentClass: document.getElementById('studentClass')?.value || '',
            examDate: document.getElementById('examDate')?.value || '',
            answers: getSelectedAnswers(),
            timeRemaining: timeRemaining,
            answersVisible: answersVisible, savedAt: Date.now()
        };
        safeStorageSet(STORAGE_KEY, JSON.stringify(state));
        if (showIndicator) showSaveIndicator();
    } catch (e) {}
}

function loadState() {
    try {
        const saved = safeStorageGet(STORAGE_KEY);
        if (saved) return JSON.parse(saved);
    } catch (e) {}
    return null;
}

function getSelectedAnswers() {
    const answers = {};
    for (let i = 0; i < TOTAL_QUESTIONS; i++) {
        const selected = document.querySelector(\`input[name="q\${i}"]:checked\`);
        if (selected) answers[i] = selected.value;
    }
    return answers;
}

function restoreAnswers(answers) {
    if (!answers) return;
    for (const [idx, val] of Object.entries(answers)) {
        const radio = document.querySelector(\`input[name="q\${idx}"][value="\${val}"]\`);
        if (radio) radio.checked = true;
    }
}

function clearProgress() {
    const confirmMsg = currentLang === 'ar' ? '⚠️ هل أنت متأكد من مسح كل التقدم؟' : '⚠️ Are you sure you want to clear all progress?';
    if (confirm(confirmMsg)) { safeStorageRemove(STORAGE_KEY); location.reload(); }
}

function setupAnswerListeners() {
    const content = document.getElementById('exam-content');
    if (content) {
        content.addEventListener('change', (e) => {
            if (e.target.type === 'radio') saveState();
        });
    }
}

function setupInputListeners() {
    ['studentName', 'studentClass', 'examDate'].forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('input', () => saveState(false));
            el.addEventListener('blur', () => saveState());
        }
    });
}

// =====================================================================
// 📝 بنك الأسئلة التفاعلية لمادتي الفيزياء والرياضيات (20 مسألة عبر 5 أقسام)
// =====================================================================
const originalExamData = {
    sections: [
        {
            id: 'sec1',
            title: { ar: '🔹 الجزء 1: الحركة الميكانيكية وقوانين نيوتن والتسارع', en: '🔹 Part 1: Mechanics, Kinematics & Newton Laws' },
            questions: [
                {
                    q: {
                        ar: \`<div class="q-meta-badges"><span class="q-category-pill q-type-graph">دالة وعلاقة بيانية وتناسب</span><span class="q-law-pill">📐 d = Area under v-t graph</span></div>يوضح الرسم البياني المقابل منحنى (السرعة - الزمن) لسيارة تتحرك في خط مستقيم انطلاقاً من السكون:
<div class="exam-diagram-container">
  <svg viewBox="0 0 360 140" class="exam-diagram" xmlns="http://www.w3.org/2000/svg" style="max-width:360px;">
    <rect width="360" height="140" fill="#f8fafc" rx="8"/>
    <line x1="45" y1="110" x2="330" y2="110" stroke="#334155" stroke-width="2"/>
    <line x1="45" y1="110" x2="45" y2="20" stroke="#334155" stroke-width="2"/>
    <line x1="45" y1="35" x2="300" y2="35" stroke="#cbd5e1" stroke-dasharray="3,3"/>
    <line x1="150" y1="110" x2="150" y2="35" stroke="#cbd5e1" stroke-dasharray="3,3"/>
    <line x1="300" y1="110" x2="300" y2="35" stroke="#cbd5e1" stroke-dasharray="3,3"/>
    <polyline points="45,110 150,35 300,35" fill="none" stroke="#0d9488" stroke-width="3"/>
    <circle cx="45" cy="110" r="3" fill="#0d9488"/>
    <circle cx="150" cy="35" r="3" fill="#0d9488"/>
    <circle cx="300" cy="35" r="3" fill="#0d9488"/>
    <text x="35" y="40" fill="#0f766e" font-size="11" font-weight="bold" text-anchor="end">20</text>
    <text x="35" y="114" fill="#64748b" font-size="11" text-anchor="end">0</text>
    <text x="150" y="126" fill="#0f766e" font-size="11" font-weight="bold" text-anchor="middle">4 s</text>
    <text x="300" y="126" fill="#0f766e" font-size="11" font-weight="bold" text-anchor="middle">10 s</text>
    <text x="45" y="15" fill="#0f766e" font-size="11" font-weight="bold" text-anchor="middle">v (m/s)</text>
    <text x="340" y="114" fill="#0f766e" font-size="11" font-weight="bold">t (s)</text>
  </svg>
</div>
احسب الإزاحة الكلية (d) التي قطعتها السيارة خلال الفترة الزمنية من t = 0 إلى t = 10 s:\`,
                        en: \`<div class="q-meta-badges"><span class="q-category-pill q-type-graph">Graph & Kinematics</span><span class="q-law-pill">📐 d = Area under curve</span></div>From the velocity-time graph, calculate the total displacement covered by the car from t = 0 to t = 10 s:\`
                    },
                    options: [
                        { ar: "160 m", en: "160 m" },
                        { ar: "200 m", en: "200 m" },
                        { ar: "120 m", en: "120 m" },
                        { ar: "140 m", en: "140 m" }
                    ],
                    correct: 0,
                    answer: {
                        ar: "الإزاحة في منحنى السرعة-الزمن تساوي المساحة الكلية تحت المنحنى: مساحة المثلث (0 إلى 4 ثوانٍ) = 0.5 × 4 × 20 = 40 m. مساحة المستطيل (4 إلى 10 ثوانٍ) = (10 - 4) × 20 = 120 m. الإزاحة الكلية d = 40 + 120 = 160 m.",
                        en: "Displacement is the area under the v-t curve: Triangle (0 to 4s) = 0.5 × 4 × 20 = 40 m. Rectangle (4 to 10s) = 6 × 20 = 120 m. Total displacement = 40 + 120 = 160 m."
                    }
                },
                {
                    q: {
                        ar: \`<div class="q-meta-badges"><span class="q-category-pill">مسألة حسابية وتطبيق قانون</span><span class="q-law-pill">📐 d = v₀t + 0.5at²</span></div>تتحرك سيارة بسرعة ابتدائية $v_0 = 10\\text{ m/s}$ في خط مستقيم بتسارع منتظم $a = 3\\text{ m/s}^2$. ما المسافة التي تقطعها خلال زمن $t = 4\\text{ s}$؟\`,
                        en: \`<div class="q-meta-badges"><span class="q-category-pill">Applied Problem</span><span class="q-law-pill">📐 d = v₀t + 0.5at²</span></div>A car moves with initial velocity v₀ = 10 m/s with constant acceleration a = 3 m/s². What distance does it cover in t = 4 s?\`
                    },
                    options: [
                        { ar: "64 m", en: "64 m" },
                        { ar: "52 m", en: "52 m" },
                        { ar: "40 m", en: "40 m" },
                        { ar: "24 m", en: "24 m" }
                    ],
                    correct: 0,
                    answer: {
                        ar: "من معادلة الحركة الثانية: $d = v_0 t + \\frac{1}{2} a t^2 = 10(4) + 0.5(3)(4^2) = 40 + 0.5(3)(16) = 40 + 24 = 64\\text{ m}$.",
                        en: "From the second kinematic equation: d = v₀t + 0.5at² = 10(4) + 0.5(3)(16) = 40 + 24 = 64 m."
                    }
                },
                {
                    q: {
                        ar: \`<div class="q-meta-badges"><span class="q-category-pill">مسألة حسابية وتطبيق قانون</span><span class="q-law-pill">📐 F = m · a , v² = 2ad</span></div>تؤثر قوة أفقية ثابتة مقدارها $F = 40\\text{ N}$ على جسم كتلته $m = 5\\text{ kg}$ موضوع على سطح أفقي أملس عديم الاحتكاك. احسب سرعة الجسم ($v$) بعد قطعه مسافة $d = 4\\text{ m}$ بدءاً من السكون:\`,
                        en: \`<div class="q-meta-badges"><span class="q-category-pill">Applied Problem</span><span class="q-law-pill">📐 F = m · a , v² = 2ad</span></div>A horizontal force F = 40 N acts on a 5 kg mass on a frictionless surface. What is its velocity after moving d = 4 m from rest?\`
                    },
                    options: [
                        { ar: "8 m/s", en: "8 m/s" },
                        { ar: "4 m/s", en: "4 m/s" },
                        { ar: "16 m/s", en: "16 m/s" },
                        { ar: "6.4 m/s", en: "6.4 m/s" }
                    ],
                    correct: 0,
                    answer: {
                        ar: "أولاً نحسب التسارع: $a = F / m = 40 / 5 = 8\\text{ m/s}^2$. ثانياً من معادلة الحركة: $v^2 = v_0^2 + 2ad = 0 + 2(8)(4) = 64 \\implies v = \\sqrt{64} = 8\\text{ m/s}$.",
                        en: "Acceleration a = F / m = 40 / 5 = 8 m/s². From kinematics: v² = 0 + 2(8)(4) = 64 => v = 8 m/s."
                    }
                },
                {
                    q: {
                        ar: \`<div class="q-meta-badges"><span class="q-category-pill">مسألة حسابية وتطبيق قانون</span><span class="q-law-pill">📐 F = Δp / Δt = m(v₂ - v₁) / t</span></div>جسم كتلته $m = 8\\text{ kg}$ يتحرك بسرعة $v_1 = 5\\text{ m/s}$. أثرت عليه قوة محصلة لمدة $t = 2\\text{ s}$ فأصبحت سرعته $v_2 = 15\\text{ m/s}$. احسب مقدار القوة المحصلة المؤثرة:\`,
                        en: \`<div class="q-meta-badges"><span class="q-category-pill">Applied Problem</span><span class="q-law-pill">📐 F = Δp / Δt</span></div>An 8 kg mass accelerates from 5 m/s to 15 m/s in 2 seconds. What net force was applied?\`
                    },
                    options: [
                        { ar: "40 N", en: "40 N" },
                        { ar: "80 N", en: "80 N" },
                        { ar: "20 N", en: "20 N" },
                        { ar: "10 N", en: "10 N" }
                    ],
                    correct: 0,
                    answer: {
                        ar: "التسارع: $a = \\Delta v / \\Delta t = (15 - 5) / 2 = 5\\text{ m/s}^2$. القوة المحصلة: $F = m \\cdot a = 8 \\times 5 = 40\\text{ N}$.",
                        en: "Acceleration a = (15 - 5) / 2 = 5 m/s². Net force F = m · a = 8 × 5 = 40 N."
                    }
                }
            ]
        },
        {
            id: 'sec2',
            title: { ar: '🔹 الجزء 2: الدوائر الكهربائية وقانون أوم وتوصيل المقاومات', en: '🔹 Part 2: Electric Circuits & Ohm Law' },
            questions: [
                {
                    q: {
                        ar: \`<div class="q-meta-badges"><span class="q-category-pill q-type-interactive">دائرة كهربائية وتطبيق تفاعلي</span><span class="q-law-pill">📐 I = V / R_eq</span></div>في الدائرة الكهربائية الموضحة بالرسم أدناه، وصلت مقاومتان متوازيتان ($R_1 = 6\\ \\Omega, R_2 = 3\\ \\Omega$) على التوالي مع مقاومة ثالثة ($R_3 = 2\\ \\Omega$) وبطارية فرق جهدها $V = 16\\text{ V}$. ما مقدار شدة التيار الكلي ($I$) المار في الدائرة؟
<div class="exam-diagram-container">
  <svg viewBox="0 0 380 120" class="exam-diagram" xmlns="http://www.w3.org/2000/svg" style="max-width:380px;">
    <rect width="380" height="120" fill="#f8fafc" rx="8"/>
    <rect x="30" y="20" width="320" height="80" fill="none" stroke="#0f766e" stroke-width="2.5" rx="4"/>
    <line x1="30" y1="45" x2="30" y2="75" stroke="#f8fafc" stroke-width="5"/>
    <line x1="20" y1="52" x2="40" y2="52" stroke="#0f766e" stroke-width="3"/>
    <line x1="25" y1="62" x2="35" y2="62" stroke="#0f766e" stroke-width="1.5"/>
    <text x="50" y="60" fill="#0f766e" font-weight="bold" font-size="12">V = 16V</text>
    <rect x="90" y="12" width="55" height="16" fill="#e2e8f0" stroke="#0f766e" stroke-width="2" rx="3"/>
    <text x="117" y="24" fill="#0f766e" font-weight="bold" font-size="11" text-anchor="middle">R₃ = 2Ω</text>
    <line x1="180" y1="20" x2="180" y2="6" stroke="#0f766e" stroke-width="2"/>
    <line x1="180" y1="20" x2="180" y2="34" stroke="#0f766e" stroke-width="2"/>
    <rect x="205" y="-1" width="55" height="15" fill="#e2e8f0" stroke="#0f766e" stroke-width="2" rx="3"/>
    <text x="232" y="11" fill="#0f766e" font-weight="bold" font-size="11" text-anchor="middle">R₁ = 6Ω</text>
    <rect x="205" y="27" width="55" height="15" fill="#e2e8f0" stroke="#0f766e" stroke-width="2" rx="3"/>
    <text x="232" y="39" fill="#0f766e" font-weight="bold" font-size="11" text-anchor="middle">R₂ = 3Ω</text>
    <line x1="180" y1="6" x2="205" y2="6" stroke="#0f766e" stroke-width="2"/>
    <line x1="180" y1="34" x2="205" y2="34" stroke="#0f766e" stroke-width="2"/>
    <line x1="260" y1="6" x2="285" y2="6" stroke="#0f766e" stroke-width="2"/>
    <line x1="260" y1="34" x2="285" y2="34" stroke="#0f766e" stroke-width="2"/>
    <line x1="285" y1="6" x2="285" y2="34" stroke="#0f766e" stroke-width="2"/>
    <line x1="285" y1="20" x2="350" y2="20" stroke="#0f766e" stroke-width="2"/>
  </svg>
</div>\`,
                        en: \`<div class="q-meta-badges"><span class="q-category-pill q-type-interactive">Circuit Diagram</span><span class="q-law-pill">📐 I = V / R_eq</span></div>In the circuit shown, two parallel resistors (R₁ = 6 Ω, R₂ = 3 Ω) connect in series with R₃ = 2 Ω and a 16 V source. What is the total current I?\`
                    },
                    options: [
                        { ar: "4 A", en: "4 A" },
                        { ar: "2.67 A", en: "2.67 A" },
                        { ar: "8 A", en: "8 A" },
                        { ar: "1.6 A", en: "1.6 A" }
                    ],
                    correct: 0,
                    answer: {
                        ar: "المقاومة المكافئة للتوازي: $R_p = (6 \\times 3) / (6 + 3) = 18 / 9 = 2\\ \\Omega$. المقاومة الكلية: $R_{eq} = R_p + R_3 = 2 + 2 = 4\\ \\Omega$. شدة التيار الكلي: $I = V / R_{eq} = 16 / 4 = 4\\text{ A}$.",
                        en: "R_parallel = (6 × 3)/(6 + 3) = 2 Ω. R_total = 2 + 2 = 4 Ω. Current I = 16 / 4 = 4 A."
                    }
                },
                {
                    q: {
                        ar: \`<div class="q-meta-badges"><span class="q-category-pill">تجربة عملية وجدول قياسات</span><span class="q-law-pill">📐 R = ΔV / ΔI</span></div>يوضح الجدول أدناه نتائج تجربة عملية لقياس فرق الجهد ($V$) وشدة التيار ($I$) المار في موصل فلزي أومي:
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
طبق قانون أوم لحساب المقاومة الكهربائية ($R$) لهذا الموصل:\`,
                        en: \`<div class="q-meta-badges"><span class="q-category-pill">Experimental Data</span><span class="q-law-pill">📐 R = ΔV / ΔI</span></div>Based on the experimental measurements table for V and I across an ohmic conductor, calculate the electrical resistance R:\`
                    },
                    options: [
                        { ar: "4.0 Ω", en: "4.0 Ω" },
                        { ar: "0.25 Ω", en: "0.25 Ω" },
                        { ar: "8.0 Ω", en: "8.0 Ω" },
                        { ar: "2.0 Ω", en: "2.0 Ω" }
                    ],
                    correct: 0,
                    answer: {
                        ar: "وفقاً لقانون أوم: $R = \\Delta V / \\Delta I$. بأخذ أي زوج من القيم: $R = (8.0 - 2.0) / (2.0 - 0.5) = 6.0 / 1.5 = 4.0\\ \\Omega$.",
                        en: "According to Ohm's law: R = ΔV / ΔI = (8.0 - 2.0) / (2.0 - 0.5) = 4.0 Ω."
                    }
                },
                {
                    q: {
                        ar: \`<div class="q-meta-badges"><span class="q-category-pill">مسألة حسابية وتطبيق قانون</span><span class="q-law-pill">📐 P = V² / R ⟹ R = V² / P</span></div>مصباح كهربي كُتب عليه ($100\\text{ W} , 220\\text{ V}$). ما هي قيمة مقاومة فتيلة هذا المصباح أثناء تشغيله بالجهد الاسمي؟\`,
                        en: \`<div class="q-meta-badges"><span class="q-category-pill">Applied Problem</span><span class="q-law-pill">📐 R = V² / P</span></div>An electric lamp is rated (100 W, 220 V). What is the resistance of its filament when operating at rated voltage?\`
                    },
                    options: [
                        { ar: "484 Ω", en: "484 Ω" },
                        { ar: "220 Ω", en: "220 Ω" },
                        { ar: "2.2 Ω", en: "2.2 Ω" },
                        { ar: "48.4 Ω", en: "48.4 Ω" }
                    ],
                    correct: 0,
                    answer: {
                        ar: "من قانون القدرة الكهربية: $P = V^2 / R \\implies R = V^2 / P = (220)^2 / 100 = 48400 / 100 = 484\\ \\Omega$.",
                        en: "From the power formula: P = V² / R => R = (220)² / 100 = 48400 / 100 = 484 Ω."
                    }
                },
                {
                    q: {
                        ar: \`<div class="q-meta-badges"><span class="q-category-pill">مسألة حسابية وتطبيق قانون</span><span class="q-law-pill">📐 R = ρ · (L / A)</span></div>سلك نحاسي طوله $L = 20\\text{ m}$ ومساحة مقطعه العرضي $A = 2\\times 10^{-6}\\text{ m}^2$ ومقاومته النوعية $\\rho = 1.7\\times 10^{-8}\\ \\Omega\\cdot\\text{m}$. احسب المقاومة الكهربائية ($R$) للسلك:\`,
                        en: \`<div class="q-meta-badges"><span class="q-category-pill">Applied Problem</span><span class="q-law-pill">📐 R = ρ · (L / A)</span></div>A copper wire of length 20 m has cross-section 2 × 10⁻⁶ m² and resistivity ρ = 1.7 × 10⁻⁸ Ω·m. Calculate its resistance: \`
                    },
                    options: [
                        { ar: "0.17 Ω", en: "0.17 Ω" },
                        { ar: "1.7 Ω", en: "1.7 Ω" },
                        { ar: "0.017 Ω", en: "0.017 Ω" },
                        { ar: "17 Ω", en: "17 Ω" }
                    ],
                    correct: 0,
                    answer: {
                        ar: "تطبيق قانون المقاومة النوعية: $R = \\rho \\cdot (L / A) = (1.7\\times 10^{-8} \\times 20) / (2\\times 10^{-6}) = 34\\times 10^{-8} / 2\\times 10^{-6} = 17\\times 10^{-2} = 0.17\\ \\Omega$.",
                        en: "R = ρ(L / A) = (1.7 × 10⁻⁸ × 20) / (2 × 10⁻⁶) = 0.17 Ω."
                    }
                }
            ]
        },
        {
            id: 'sec3',
            title: { ar: '🔹 الجزء 3: التفاضل والتكامل والتحليل الرياضي', en: '🔹 Part 3: Calculus & Mathematical Analysis' },
            questions: [
                {
                    q: {
                        ar: \`<div class="q-meta-badges"><span class="q-category-pill">مسألة حسابية وتطبيق قانون</span><span class="q-law-pill">📐 f'(x) = d/dx(ax² + bx + c)</span></div>أوجد ميل المماس لمنحنى الدالة $f(x) = 2x^2 - 5x + 4$ عند النقطة التي إحداثيها السيني $x = 3$:\`,
                        en: \`<div class="q-meta-badges"><span class="q-category-pill">Applied Problem</span><span class="q-law-pill">📐 f'(x) = d/dx</span></div>Find the slope of the tangent line to f(x) = 2x² - 5x + 4 at x = 3:\`
                    },
                    options: [
                        { ar: "7", en: "7" },
                        { ar: "11", en: "11" },
                        { ar: "5", en: "5" },
                        { ar: "9", en: "9" }
                    ],
                    correct: 0,
                    answer: {
                        ar: "المشتقة الأولى تمثل ميل المماس: $f'(x) = 4x - 5$. بالتعويض بقيمة $x = 3$: $f'(3) = 4(3) - 5 = 12 - 5 = 7$.",
                        en: "Slope of the tangent is f'(x) = 4x - 5. At x = 3: f'(3) = 4(3) - 5 = 7."
                    }
                },
                {
                    q: {
                        ar: \`<div class="q-meta-badges"><span class="q-category-pill">مسألة حسابية وتطبيق قانون</span><span class="q-law-pill">📐 ∫ x^n dx = x^(n+1)/(n+1)</span></div>احسب قيمة التكامل المحدود التالي: $\\int_{1}^{4} (3x^2 - 2x)\\ dx$:\`,
                        en: \`<div class="q-meta-badges"><span class="q-category-pill">Applied Problem</span><span class="q-law-pill">📐 Definite Integration</span></div>Evaluate the definite integral ∫ from 1 to 4 of (3x² - 2x) dx:\`
                    },
                    options: [
                        { ar: "48", en: "48" },
                        { ar: "63", en: "63" },
                        { ar: "45", en: "45" },
                        { ar: "52", en: "52" }
                    ],
                    correct: 0,
                    answer: {
                        ar: "دالة التكامل الأصلية: $F(x) = [x^3 - x^2]$. بالتعويض بحدود التكامل: $F(4) - F(1) = (4^3 - 4^2) - (1^3 - 1^2) = (64 - 16) - (1 - 1) = 48 - 0 = 48$.",
                        en: "Antiderivative: [x³ - x²]. From 1 to 4: (64 - 16) - (1 - 1) = 48."
                    }
                },
                {
                    q: {
                        ar: \`<div class="q-meta-badges"><span class="q-category-pill">دالة وعلاقة بيانية وتناسب</span><span class="q-law-pill">📐 a(t) = s''(t)</span></div>إذا كانت دالة الموضع لجسم متحرك تُعطى بالعلاقة $s(t) = 2t^3 - 6t^2 + 10$ حيث $s$ بالأمتار و $t$ بالثواني، فما هو تسارع الجسم اللحظي عند $t = 2\\text{ s}$؟\`,
                        en: \`<div class="q-meta-badges"><span class="q-category-pill">Second Derivative</span><span class="q-law-pill">📐 a(t) = s''(t)</span></div>Given position function s(t) = 2t³ - 6t² + 10, find instantaneous acceleration at t = 2 s:\`
                    },
                    options: [
                        { ar: "12 m/s²", en: "12 m/s²" },
                        { ar: "24 m/s²", en: "24 m/s²" },
                        { ar: "0 m/s²", en: "0 m/s²" },
                        { ar: "6 m/s²", en: "6 m/s²" }
                    ],
                    correct: 0,
                    answer: {
                        ar: "السرعة هي المشتقة الأولى: $v(t) = s'(t) = 6t^2 - 12t$. التسارع هو المشتقة الثانية: $a(t) = v'(t) = 12t - 12$. عند $t = 2\\text{ s}$: $a(2) = 12(2) - 12 = 24 - 12 = 12\\text{ m/s}^2$.",
                        en: "Velocity v(t) = 6t² - 12t. Acceleration a(t) = 12t - 12. At t = 2s: a(2) = 24 - 12 = 12 m/s²."
                    }
                },
                {
                    q: {
                        ar: \`<div class="q-meta-badges"><span class="q-category-pill">مسألة حسابية وتطبيق قانون</span><span class="q-law-pill">📐 log_b(x · y) = log_b(x) + log_b(y)</span></div>حل المعادلة اللوغاريتمية التالية في مجموعة الأعداد الحقيقية $\\mathbb{R}$: $\\log_2(x) + \\log_2(x - 2) = 3$:\`,
                        en: \`<div class="q-meta-badges"><span class="q-category-pill">Applied Problem</span><span class="q-law-pill">📐 Logarithmic Equations</span></div>Solve the equation in ℝ: log₂(x) + log₂(x - 2) = 3:\`
                    },
                    options: [
                        { ar: "x = 4", en: "x = 4" },
                        { ar: "x = -2, x = 4", en: "x = -2, x = 4" },
                        { ar: "x = 8", en: "x = 8" },
                        { ar: "x = 3", en: "x = 3" }
                    ],
                    correct: 0,
                    answer: {
                        ar: "$\\log_2(x(x - 2)) = 3 \\implies x^2 - 2x = 2^3 = 8 \\implies x^2 - 2x - 8 = 0 \\implies (x - 4)(x + 2) = 0$. بما أن مجال اللوغاريتم يشترط $x > 2$، فإن الحل المقبول هو $x = 4$ فقط ويهمل الحل السالب.",
                        en: "log₂(x(x - 2)) = 3 => x² - 2x = 8 => (x - 4)(x + 2) = 0. Since domain requires x > 2, x = 4 is the only valid solution."
                    }
                }
            ]
        },
        {
            id: 'sec4',
            title: { ar: '🔹 الجزء 4: المتجهات وحساب المثلثات والهندسة', en: '🔹 Part 4: Vectors, Trigonometry & Geometry' },
            questions: [
                {
                    q: {
                        ar: \`<div class="q-meta-badges"><span class="q-category-pill q-type-graph">هندسة وحساب مثلثات</span><span class="q-law-pill">📐 c = √(a² + b²) , sin(θ) = b / c</span></div>في المثلث القائم الزاوية الموضح بالشكل أدناه، طول الضلع المجاور $a = 6\\text{ cm}$، وطول الضلع المقابل $b = 8\\text{ cm}$:
<div class="exam-diagram-container">
  <svg viewBox="0 0 320 140" class="exam-diagram" xmlns="http://www.w3.org/2000/svg" style="max-width:320px;">
    <rect width="320" height="140" fill="#f8fafc" rx="8"/>
    <polygon points="50,115 230,115 50,25" fill="#e0f2fe" stroke="#0284c7" stroke-width="2.5"/>
    <rect x="50" y="102" width="13" height="13" fill="none" stroke="#0284c7" stroke-width="1.5"/>
    <text x="140" y="132" fill="#0369a1" font-weight="bold" font-size="12" text-anchor="middle">a = 6 cm</text>
    <text x="35" y="75" fill="#0369a1" font-weight="bold" font-size="12" text-anchor="end">b = 8 cm</text>
    <text x="155" y="65" fill="#dc2626" font-weight="bold" font-size="13">c = ?</text>
    <text x="195" y="108" fill="#0369a1" font-weight="bold" font-size="12">θ</text>
  </svg>
</div>
احسب طول الوتر ($c$) ثم أوجد قيمة الجيب $\\sin(\\theta)$ للزاوية الموضحة:\`,
                        en: \`<div class="q-meta-badges"><span class="q-category-pill q-type-graph">Geometry</span><span class="q-law-pill">📐 Pythagoras & Trig</span></div>In the right triangle shown with adjacent side a = 6 cm and opposite side b = 8 cm, find the hypotenuse c and sin(θ):\`
                    },
                    options: [
                        { ar: "c = 10 cm, sin(θ) = 0.8", en: "c = 10 cm, sin(θ) = 0.8" },
                        { ar: "c = 10 cm, sin(θ) = 0.6", en: "c = 10 cm, sin(θ) = 0.6" },
                        { ar: "c = 14 cm, sin(θ) = 0.8", en: "c = 14 cm, sin(θ) = 0.8" },
                        { ar: "c = 12 cm, sin(θ) = 0.5", en: "c = 12 cm, sin(θ) = 0.5" }
                    ],
                    correct: 0,
                    answer: {
                        ar: "من مبرهنة فيثاغورس: $c = \\sqrt{6^2 + 8^2} = \\sqrt{36 + 64} = \\sqrt{100} = 10\\text{ cm}$. جيب الزاوية: $\\sin(\\theta) = \\text{المقابل} / \\text{الوتر} = 8 / 10 = 0.8$.",
                        en: "c = √(6² + 8²) = 10 cm. sin(θ) = opposite / hypotenuse = 8 / 10 = 0.8."
                    }
                },
                {
                    q: {
                        ar: \`<div class="q-meta-badges"><span class="q-category-pill">مسألة حسابية وتطبيق قانون</span><span class="q-law-pill">📐 A · B = AxBx + AyBy</span></div>إذا كان المتجهان $\\vec{A} = (3\\hat{i} + 4\\hat{j})$ و $\\vec{B} = (2\\hat{i} - 1\\hat{j})$، فما هي قيمة حاصل الضرب القياسي (العددي) $\\vec{A} \\cdot \\vec{B}$؟\`,
                        en: \`<div class="q-meta-badges"><span class="q-category-pill">Applied Problem</span><span class="q-law-pill">📐 Vector Dot Product</span></div>Given vectors A = 3i + 4j and B = 2i - 1j, what is the scalar dot product A · B?\`
                    },
                    options: [
                        { ar: "2", en: "2" },
                        { ar: "10", en: "10" },
                        { ar: "14", en: "14" },
                        { ar: "-2", en: "-2" }
                    ],
                    correct: 0,
                    answer: {
                        ar: "الضرب القياسي: $\\vec{A} \\cdot \\vec{B} = A_x B_x + A_y B_y = (3)(2) + (4)(-1) = 6 - 4 = 2$.",
                        en: "A · B = AxBx + AyBy = (3)(2) + (4)(-1) = 6 - 4 = 2."
                    }
                },
                {
                    q: {
                        ar: \`<div class="q-meta-badges"><span class="q-category-pill">مسألة حسابية وتطبيق قانون</span><span class="q-law-pill">📐 cos(2θ) = 1 - 2sin²(θ)</span></div>إذا كانت $\\sin(\\theta) = 0.6$ حيث $\\theta$ زاوية حادة في الربع الأول، فما هي القيمة الدقيقة لـ $\\cos(2\\theta)$؟\`,
                        en: \`<div class="q-meta-badges"><span class="q-category-pill">Applied Problem</span><span class="q-law-pill">📐 Double Angle Identity</span></div>If sin(θ) = 0.6 in the first quadrant, what is the exact value of cos(2θ)?\`
                    },
                    options: [
                        { ar: "0.28", en: "0.28" },
                        { ar: "0.64", en: "0.64" },
                        { ar: "0.80", en: "0.80" },
                        { ar: "0.36", en: "0.36" }
                    ],
                    correct: 0,
                    answer: {
                        ar: "باستخدام متطابقة ضعف الزاوية: $\\cos(2\\theta) = 1 - 2\\sin^2(\\theta) = 1 - 2(0.6)^2 = 1 - 2(0.36) = 1 - 0.72 = 0.28$.",
                        en: "Using the double-angle identity: cos(2θ) = 1 - 2sin²(θ) = 1 - 2(0.36) = 0.28."
                    }
                },
                {
                    q: {
                        ar: \`<div class="q-meta-badges"><span class="q-category-pill">مسألة حسابية وتطبيق قانون</span><span class="q-law-pill">📐 F = B · I · L · sin(θ)</span></div>سلك مستقيم طوله $L = 0.5\\text{ m}$ يمر به تيار $I = 4\\text{ A}$ موضوع عمودياً في مجال مغناطيسي منتظم شدته $B = 0.6\\text{ T}$. احسب القوة المغناطيسية المؤثرة على السلك:\`,
                        en: \`<div class="q-meta-badges"><span class="q-category-pill">Applied Problem</span><span class="q-law-pill">📐 F = B · I · L · sin(θ)</span></div>A straight wire of length 0.5 m carrying 4 A is placed perpendicular in a 0.6 T magnetic field. Calculate the magnetic force:\`
                    },
                    options: [
                        { ar: "1.2 N", en: "1.2 N" },
                        { ar: "2.4 N", en: "2.4 N" },
                        { ar: "0.6 N", en: "0.6 N" },
                        { ar: "4.8 N", en: "4.8 N" }
                    ],
                    correct: 0,
                    answer: {
                        ar: "قانون القوة المغناطيسية: $F = B \\cdot I \\cdot L \\cdot \\sin(90^\\circ) = 0.6 \\times 4 \\times 0.5 \\times 1 = 1.2\\text{ N}$.",
                        en: "Magnetic force: F = B · I · L · sin(90°) = 0.6 × 4 × 0.5 = 1.2 N."
                    }
                }
            ]
        },
        {
            id: 'sec5',
            title: { ar: '🔹 الجزء 5: الشغل والطاقة والموجات والفيزياء الحديثة', en: '🔹 Part 5: Energy, Waves & Modern Physics' },
            questions: [
                {
                    q: {
                        ar: \`<div class="q-meta-badges"><span class="q-category-pill">مسألة حسابية وتطبيق قانون</span><span class="q-law-pill">📐 W = ΔKE = -0.5 m v²</span></div>سيارة كتلتها $m = 1200\\text{ kg}$ تسير بسرعة $v = 20\\text{ m/s}$. ضغط السائق على المكابح حتى توقفت تماماً. ما مقدار الشغل الكلي المبذول بواسطة قوة الاحتكاك لإيقاف السيارة؟\`,
                        en: \`<div class="q-meta-badges"><span class="q-category-pill">Applied Problem</span><span class="q-law-pill">📐 W = ΔKE</span></div>A 1200 kg car moving at 20 m/s comes to a complete stop. What is the work done by the braking friction force?\`
                    },
                    options: [
                        { ar: "-240 kJ", en: "-240 kJ" },
                        { ar: "-120 kJ", en: "-120 kJ" },
                        { ar: "-480 kJ", en: "-480 kJ" },
                        { ar: "240 kJ", en: "240 kJ" }
                    ],
                    correct: 0,
                    answer: {
                        ar: "نظرية الشغل والطاقة: $W = \\Delta KE = 0 - \\frac{1}{2} m v^2 = -0.5 \\times 1200 \\times (20)^2 = -600 \\times 400 = -240,000\\text{ J} = -240\\text{ kJ}$.",
                        en: "Work-energy theorem: W = ΔKE = -0.5 × 1200 × (20)² = -240,000 J = -240 kJ."
                    }
                },
                {
                    q: {
                        ar: \`<div class="q-meta-badges"><span class="q-category-pill">مسألة حسابية وتطبيق قانون</span><span class="q-law-pill">📐 v = λ · f ⟹ λ = 2d</span></div>موجة مستعرضة ترددها $f = 50\\text{ Hz}$ والمسافة الأفقية بين قمة وقاع متتاليين تساوي $0.4\\text{ m}$. ما هي سرعة انتشار هذه الموجة؟\`,
                        en: \`<div class="q-meta-badges"><span class="q-category-pill">Applied Problem</span><span class="q-law-pill">📐 v = λ · f</span></div>A transverse wave has frequency f = 50 Hz and crest-to-trough horizontal distance is 0.4 m. What is its propagation speed?\`
                    },
                    options: [
                        { ar: "40 m/s", en: "40 m/s" },
                        { ar: "20 m/s", en: "20 m/s" },
                        { ar: "80 m/s", en: "80 m/s" },
                        { ar: "10 m/s", en: "10 m/s" }
                    ],
                    correct: 0,
                    answer: {
                        ar: "المسافة بين قمة وقاع متتاليين تمثل نصف طول موجي ($\\lambda / 2 = 0.4\\text{ m} \\implies \\lambda = 0.8\\text{ m}$). سرعة انتشار الموجة: $v = \\lambda \\cdot f = 0.8 \\times 50 = 40\\text{ m/s}$.",
                        en: "Distance between crest and trough is λ/2 = 0.4 m => λ = 0.8 m. Speed v = λ · f = 0.8 × 50 = 40 m/s."
                    }
                },
                {
                    q: {
                        ar: \`<div class="q-meta-badges"><span class="q-category-pill">مسألة حسابية وتطبيق قانون</span><span class="q-law-pill">📐 KE_max = E - W₀</span></div>سقط فوتون طاقته $E = 4.5\\text{ eV}$ على سطح فلز دالة الشغل له $W_0 = 2.5\\text{ eV}$. ما هي أقصى طاقة حركة ($KE_{max}$) للإلكترون الكهروضوئي المنبعث؟\`,
                        en: \`<div class="q-meta-badges"><span class="q-category-pill">Applied Problem</span><span class="q-law-pill">📐 Photoelectric Effect</span></div>A photon with energy E = 4.5 eV strikes a metal surface with work function W₀ = 2.5 eV. What is the maximum kinetic energy KE_max?\`
                    },
                    options: [
                        { ar: "2.0 eV", en: "2.0 eV" },
                        { ar: "7.0 eV", en: "7.0 eV" },
                        { ar: "1.8 eV", en: "1.8 eV" },
                        { ar: "0 eV (لا ينبعث)", en: "0 eV (No emission)" }
                    ],
                    correct: 0,
                    answer: {
                        ar: "معادلة أينشتاين للظاهرة الكهروضوئية: $KE_{max} = E - W_0 = 4.5\\text{ eV} - 2.5\\text{ eV} = 2.0\\text{ eV}$. بما أن طاقة الفوتون أكبر من دالة الشغل تنبعث إلكترونات فوراً.",
                        en: "Einstein's photoelectric equation: KE_max = E - W₀ = 4.5 - 2.5 = 2.0 eV."
                    }
                },
                {
                    q: {
                        ar: \`<div class="q-meta-badges"><span class="q-category-pill">مسألة حسابية وتطبيق قانون</span><span class="q-law-pill">📐 C_eq = (C1·C2)/(C1+C2) , Q = C_eq · V</span></div>مكثفان سعة الأول $C_1 = 6\\ \\mu\\text{F}$ وسعة الثاني $C_2 = 3\\ \\mu\\text{F}$ متصلان على التوالي مع مصدر جهد $V = 18\\text{ V}$. ما مقدار الشحنة الكلية ($Q$) المتراكمة على المجموعة؟\`,
                        en: \`<div class="q-meta-badges"><span class="q-category-pill">Applied Problem</span><span class="q-law-pill">📐 Capacitors in Series</span></div>Two capacitors C₁ = 6 μF and C₂ = 3 μF are connected in series with an 18 V source. Find total accumulated charge Q:\`
                    },
                    options: [
                        { ar: "36 μC", en: "36 μC" },
                        { ar: "162 μC", en: "162 μC" },
                        { ar: "54 μC", en: "54 μC" },
                        { ar: "18 μC", en: "18 μC" }
                    ],
                    correct: 0,
                    answer: {
                        ar: "السعة المكافئة للتوالي: $C_{eq} = (6 \\times 3) / (6 + 3) = 18 / 9 = 2\\ \\mu\\text{F}$. الشحنة الكلية: $Q = C_{eq} \\cdot V = 2\\ \\mu\\text{F} \\times 18\\text{ V} = 36\\ \\mu\\text{C}$.",
                        en: "C_eq = (6 × 3) / (6 + 3) = 2 μF. Total charge Q = C_eq · V = 2 μF × 18 V = 36 μC."
                    }
                }
            ]
        }
    ]
};
// =====================================================================

function shuffleArray(array) {
    const arr = [...array];
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(rng() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

let examData;
let correctAnswersMap = {};
let currentLang = 'ar';
let timeRemaining = TOTAL_TIME;
let timerInterval;

function prepareShuffledExam() {
    rng = mulberry32(currentSeed);
    examData = JSON.parse(JSON.stringify(originalExamData));
    correctAnswersMap = {};
    let globalIdx = 0;
    examData.sections.forEach((section) => {
        section.questions = shuffleArray(section.questions);
        section.questions.forEach((q) => {
            const optionsWithCorrect = q.options.map((opt, idx) => ({ option: opt, isCorrect: idx === q.correct }));
            const shuffledOptions = shuffleArray(optionsWithCorrect);
            q.options = shuffledOptions.map(o => o.option);
            q.correct = shuffledOptions.findIndex(o => o.isCorrect);
            correctAnswersMap[globalIdx] = String.fromCharCode(97 + q.correct);
            globalIdx++;
        });
    });
}

function reshuffleExam() {
    const msg = currentLang === 'ar' ? '🔄 سيتم إنشاء أسئلة جديدة ومسح إجاباتك الحالية. هل أنت متأكد؟' : '🔄 New questions will be generated and current answers cleared. Are you sure?';
    if (confirm(msg)) {
        currentSeed = Date.now(); timeRemaining = TOTAL_TIME; answersVisible = false;
        prepareShuffledExam(); renderExam(); saveState();
        alert(currentLang === 'ar' ? '🎲 تم تغيير الأسئلة! حظاً موفقاً! 🍀' : '🎲 Questions changed! Good luck! 🍀');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

function setLanguage(lang) {
    currentLang = lang;
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    const btnAr = document.getElementById('btn-ar');
    const btnEn = document.getElementById('btn-en');
    if (btnAr) btnAr.classList.toggle('active', lang === 'ar');
    if (btnEn) btnEn.classList.toggle('active', lang === 'en');
    document.body.classList.toggle('en-mode', lang === 'en');
    document.querySelectorAll('[data-ar][data-en]').forEach(el => {
        el.innerHTML = lang === 'ar' ? el.getAttribute('data-ar') : el.getAttribute('data-en');
    });
    renderExam(); saveState(false);
}

function renderExam() {
    const container = document.getElementById('exam-content');
    if (!container) return;
    const labels = { ar: { option: ['أ', 'ب', 'ج', 'د'], answer: '✅ الإجابة:' }, en: { option: ['A', 'B', 'C', 'D'], answer: '✅ Answer:' } };
    const lbl = labels[currentLang]; const isRTL = currentLang === 'ar';
    let html = ''; let globalIdx = 0;
    examData.sections.forEach((section) => {
        html += \`<section class="bg-white p-6 rounded-2xl shadow-lg border-2 border-teal-100">
            <h2 class="text-xl font-bold mb-4 text-teal-700">\${section.title[currentLang]}</h2>
            <ol class="space-y-4 text-sm">\`;
        section.questions.forEach((q) => {
            const bs = isRTL ? 'border-r-4 pr-4' : 'border-l-4 pl-4';
            html += \`<li class="\${bs} border-teal-400 py-2" id="q-\${globalIdx}">
                <strong>\${globalIdx + 1}.</strong> \${q.q[currentLang]}<br>\`;
            q.options.forEach((opt, oIdx) => {
                const rs = isRTL ? 'mr-4 ml-2' : 'ml-4 mr-2';
                html += \`<label class="cursor-pointer block mt-1 \${isRTL ? 'mr-4' : 'ml-4'} hover:bg-teal-50 rounded-lg p-1 transition">
                    <input type="radio" name="q\${globalIdx}" value="\${String.fromCharCode(97 + oIdx)}" class="\${rs}">
                    \${lbl.option[oIdx]}) \${opt[currentLang]}</label>\`;
            });
            html += \`<div class="answer-box text-green-700 mt-2 font-medium \${answersVisible ? '' : 'hidden'} bg-green-50 rounded-lg p-2">
                \${lbl.answer} \${lbl.option[q.correct]}) \${q.options[q.correct][currentLang]} — \${q.answer[currentLang]}</div></li>\`;
            globalIdx++;
        });
        html += \`</ol></section>\`;
    });
    container.innerHTML = html;
}

function startTimer() {
    updateTimerDisplay();
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        timeRemaining--; updateTimerDisplay();
        if (timeRemaining % 60 === 0) saveState(false);
        const timerEl = document.getElementById('timer');
        if (timerEl && timeRemaining <= 600) timerEl.classList.add('timer-warning');
        if (timeRemaining <= 0) {
            clearInterval(timerInterval);
            alert(currentLang === 'ar' ? "⏰ انتهى الوقت!" : "⏰ Time's up!");
            gradeExam();
        }
    }, 1000);
}

function updateTimerDisplay() {
    const m = Math.floor(timeRemaining / 60); const s = timeRemaining % 60;
    const timerEl = document.getElementById('timer');
    if (timerEl) timerEl.textContent = \`\${m.toString().padStart(2,'0')}:\${s.toString().padStart(2,'0')}\`;
}

function toggleAnswers() {
    answersVisible = !answersVisible;
    document.querySelectorAll('.answer-box').forEach(el => el.classList.toggle('hidden', !answersVisible));
    saveState(false);
}

function gradeExam() {
    let correctCount = 0;
    const sectionScores = new Array(TOTAL_SECTIONS).fill(0);
    for (let i = 0; i < TOTAL_QUESTIONS; i++) {
        const sel = document.querySelector(\`input[name="q\${i}"]:checked\`);
        const li = document.getElementById(\`q-\${i}\`);
        if (li) {
            const isCorrect = sel && sel.value === correctAnswersMap[i];
            if (isCorrect) { 
                correctCount++; 
                li.classList.add('correct'); 
                li.classList.remove('incorrect'); 
                const secIdx = Math.min(TOTAL_SECTIONS - 1, Math.floor(i / Math.max(1, QUESTIONS_PER_SECTION)));
                if (sectionScores[secIdx] !== undefined) sectionScores[secIdx]++; 
            }
            else { li.classList.add('incorrect'); li.classList.remove('correct'); }
        }
    }
    const score = TOTAL_QUESTIONS > 0 ? Math.round((correctCount / TOTAL_QUESTIONS) * 100) : 0;
    const resTotal = document.getElementById('res-total');
    if (resTotal) resTotal.textContent = \`\${score} / 100\`;
    const resName = document.getElementById('res-name');
    if (resName) resName.textContent = document.getElementById('studentName')?.value || (currentLang === 'ar' ? 'بطل' : 'Champion');
    const resDate = document.getElementById('res-date');
    if (resDate) resDate.textContent = new Date().toLocaleDateString(currentLang === 'ar' ? 'ar-AE' : 'en-US');
    const pc = document.getElementById('sections-performance');
    if (pc) {
        pc.innerHTML = '';
        examData.sections.forEach((s, idx) => {
            const secQCount = originalExamData.sections[idx]?.questions.length || QUESTIONS_PER_SECTION;
            pc.innerHTML += \`<div class="flex justify-between items-center"><span class="text-gray-700">\${s.title[currentLang]}</span><span class="font-bold text-teal-700">\${sectionScores[idx] || 0}/\${secQCount}</span></div>\`;
        });
    }
    const badge = document.getElementById('success-badge');
    const successPercent = document.getElementById('success-percent');
    if (successPercent) successPercent.textContent = \`\${score}%\`;
    if (badge) {
        if (currentLang === 'ar') {
            if (score >= 90) { badge.textContent = '🌟 ممتاز جداً!'; badge.className = 'success-badge grade-excellent'; }
            else if (score >= 75) { badge.textContent = '👏 ممتاز!'; badge.className = 'success-badge grade-good'; }
            else if (score >= 50) { badge.textContent = '👍 جيد'; badge.className = 'success-badge grade-pass'; }
            else { badge.textContent = '💪 حاول مرة أخرى'; badge.className = 'success-badge grade-fail'; }
        } else {
            if (score >= 90) { badge.textContent = '🌟 Outstanding!'; badge.className = 'success-badge grade-excellent'; }
            else if (score >= 75) { badge.textContent = '👏 Excellent!'; badge.className = 'success-badge grade-good'; }
            else if (score >= 50) { badge.textContent = '👍 Good'; badge.className = 'success-badge grade-pass'; }
            else { badge.textContent = '💪 Try Again'; badge.className = 'success-badge grade-fail'; }
        }
    }
    const resultsPanel = document.getElementById('results-panel');
    if (resultsPanel) {
        resultsPanel.classList.remove('hidden');
        resultsPanel.scrollIntoView({ behavior: 'smooth' });
    }
    if (timerInterval) clearInterval(timerInterval);
}

function sendResultsToEmail() {
    const btn = document.getElementById('sendEmailBtn');
    const status = document.getElementById('emailStatus');
    if (!btn || !status) return;
    btn.disabled = true;
    btn.textContent = currentLang === 'ar' ? '⏳ جاري الإرسال...' : '⏳ Sending...';
    const name = document.getElementById('studentName')?.value || 'N/A';
    const studentClass = document.getElementById('studentClass')?.value || 'N/A';
    const date = document.getElementById('examDate')?.value || new Date().toLocaleDateString();
    const score = document.getElementById('res-total')?.textContent || '0 / 100';
    const successRate = document.getElementById('success-percent')?.textContent || '0%';
    const badge = document.getElementById('success-badge')?.textContent || '-';
    let questionsHTML = ''; let globalIdx = 0;
    examData.sections.forEach((section, sectionIdx) => {
        questionsHTML += \`<tr style="background:linear-gradient(135deg,#0d9488,#0f766e);color:white;"><td colspan="5" style="padding:12px;font-weight:bold;">📌 \${currentLang==='ar'?'القسم':'Section'} \${sectionIdx+1}: \${section.title[currentLang]}</td></tr>\`;
        section.questions.forEach((q) => {
            const sel = document.querySelector(\`input[name="q\${globalIdx}"]:checked\`);
            const sv = sel ? sel.value : null; const cv = correctAnswersMap[globalIdx]; const ic = sv === cv;
            let sat = currentLang==='ar'?'❌ لم يجب':'❌ No answer'; let sac = '#dc2626';
            if (sv) { const si = sv.charCodeAt(0)-97; sat = q.options[si] ? q.options[si][currentLang] : 'N/A'; sac = ic?'#059669':'#dc2626'; }
            const cat = q.options[q.correct] ? q.options[q.correct][currentLang] : 'N/A';
            const rb = ic?'#f0fdf4':'#fef2f2'; const bl = ic?'4px solid #10b981':'4px solid #ef4444';
            questionsHTML += \`<tr style="background:\${rb};border-right:\${bl};"><td style="padding:10px;border:1px solid #e5e7eb;text-align:center;font-weight:bold;">\${globalIdx+1}</td><td style="padding:10px;border:1px solid #e5e7eb;"><strong style="color:#0f766e;">\${currentLang==='ar'?'❓ السؤال:':'❓ Question:'}</strong><br><span style="font-size:13px;">\${q.q[currentLang]}</span></td><td style="padding:10px;border:1px solid #e5e7eb;"><strong style="color:\${sac};">\${currentLang==='ar'?'✍️ إجابة الطالب:':'✍️ Student:'}</strong><br><span style="color:\${sac};font-size:13px;">\${sat}</span></td><td style="padding:10px;border:1px solid #e5e7eb;"><strong style="color:#059669;">\${currentLang==='ar'?'✅ الصحيحة:':'✅ Correct:'}</strong><br><span style="color:#059669;font-size:13px;">\${cat}</span></td><td style="padding:10px;border:1px solid #e5e7eb;text-align:center;">\${ic?'<span style="font-size:24px;">✅</span>':'<span style="font-size:24px;">❌</span>'}</td></tr>\`;
            globalIdx++;
        });
    });
    const answersHTML = \`<div style="font-family:'Segoe UI',Tahoma,Arial;direction:\${currentLang==='ar'?'rtl':'ltr'};"><div style="background:linear-gradient(135deg,#0d9488,#0f766e);color:white;padding:20px;border-radius:10px 10px 0 0;text-align:center;"><h2 style="margin:0;">\${currentLang==='ar'?'نتيجة الامتحان':'Exam Result'}</h2><p style="margin:5px 0 0;opacity:0.9;">\${currentLang==='ar'?'تقرير تفصيلي':'Detailed Report'}</p></div><div style="background:#f0fdfa;padding:15px;"><table style="width:100%;border-collapse:collapse;"><tr><td style="padding:8px;font-weight:bold;color:#0f766e;">\${currentLang==='ar'?'😊 الاسم:':'😊 Name:'}</td><td style="padding:8px;">\${name}</td><td style="padding:8px;font-weight:bold;color:#0f766e;">\${currentLang==='ar'?'🏫 الشعبة:':'🏫 Class:'}</td><td style="padding:8px;">\${studentClass}</td></tr><tr><td style="padding:8px;font-weight:bold;color:#0f766e;">\${currentLang==='ar'?'📅 التاريخ:':'📅 Date:'}</td><td style="padding:8px;">\${date}</td><td style="padding:8px;font-weight:bold;color:#0f766e;">\${currentLang==='ar'?'🏆 التقدير:':'🏆 Grade:'}</td><td style="padding:8px;">\${badge}</td></tr></table></div><div style="background:white;padding:20px;text-align:center;"><div style="display:inline-block;margin:0 15px;"><div style="font-size:32px;font-weight:bold;color:#0d9488;">\${score}</div><div style="color:#6b7280;font-size:13px;">\${currentLang==='ar'?'الدرجة':'Score'}</div></div><div style="display:inline-block;margin:0 15px;"><div style="font-size:32px;font-weight:bold;color:#059669;">\${successRate}%</div><div style="color:#6b7280;font-size:13px;">\${currentLang==='ar'?'النسبة':'Rate'}</div></div></div><table style="width:100%;border-collapse:collapse;font-size:13px;"><thead><tr style="background:#0d9488;color:white;"><th style="padding:10px;border:1px solid #0f766e;">#</th><th style="padding:10px;border:1px solid #0f766e;">\${currentLang==='ar'?'السؤال':'Question'}</th><th style="padding:10px;border:1px solid #0f766e;">\${currentLang==='ar'?'إجابة الطالب':'Student'}</th><th style="padding:10px;border:1px solid #0f766e;">\${currentLang==='ar'?'الصحيحة':'Correct'}</th><th style="padding:10px;border:1px solid #0f766e;">\${currentLang==='ar'?'النتيجة':'Result'}</th></tr></thead><tbody>\${questionsHTML}</tbody></table><div style="background:linear-gradient(135deg,#f0fdfa,#ccfbf1);padding:15px;border-radius:0 0 10px 10px;"><p style="margin:0;color:#0f766e;text-align:center;">📐 <strong>\${currentLang==='ar'?'أحسنت يا بطل!':'Great job!'}</strong> 📐</p><p style="margin:5px 0 0;color:#0f766e;text-align:center;font-size:12px;">\${currentLang==='ar'?'تم الإرسال تلقائياً | Mr. Mohammed Hesham':'Auto-sent | Mr. Mohammed Hesham'}</p></div></div>\`;
    emailjs.send(SERVICE_ID, TEMPLATE_ID, { to_email: TARGET_EMAIL, student_name: name, student_class: studentClass, exam_date: date, total_score: score, success_rate: successRate, grade: badge, answers_table: answersHTML }).then(() => {
        status.textContent = currentLang==='ar'?'✅ تم الإرسال بنجاح!':'✅ Sent successfully!'; status.style.color = '#059669'; btn.textContent = currentLang==='ar'?'✓ تم':'✓ Sent';
    }).catch(err => {
        status.textContent = currentLang==='ar'?'❌ حدث خطأ':'❌ Error'; status.style.color = '#dc2626'; btn.disabled = false; btn.textContent = currentLang==='ar'?'📧 حاول مرة أخرى':'📧 Try Again'; console.error(err);
    });
}

window.addEventListener('DOMContentLoaded', () => {
    const saved = loadState();
    if (saved && saved.seed) {
        currentSeed = saved.seed; currentLang = saved.lang || 'ar';
        timeRemaining = saved.timeRemaining !== undefined ? saved.timeRemaining : TOTAL_TIME;
        answersVisible = saved.answersVisible || false;
        document.documentElement.lang = currentLang;
        document.documentElement.dir = currentLang === 'ar' ? 'rtl' : 'ltr';
        const btnAr = document.getElementById('btn-ar');
        const btnEn = document.getElementById('btn-en');
        if (btnAr) btnAr.classList.toggle('active', currentLang === 'ar');
        if (btnEn) btnEn.classList.toggle('active', currentLang === 'en');
        document.body.classList.toggle('en-mode', currentLang === 'en');
        document.querySelectorAll('[data-ar][data-en]').forEach(el => { el.innerHTML = currentLang === 'ar' ? el.getAttribute('data-ar') : el.getAttribute('data-en'); });
    } else { currentSeed = Date.now(); }
    prepareShuffledExam(); renderExam();
    if (saved) {
        if (saved.studentName) { const el = document.getElementById('studentName'); if (el) el.value = saved.studentName; }
        if (saved.studentClass) { const el = document.getElementById('studentClass'); if (el) el.value = saved.studentClass; }
        if (saved.examDate) { const el = document.getElementById('examDate'); if (el) el.value = saved.examDate; }
        if (saved.answers) restoreAnswers(saved.answers);
    }
    setupAnswerListeners(); setupInputListeners(); startTimer();
});
window.addEventListener('beforeunload', () => saveState(false));
</script>
</body>
</html>`;
