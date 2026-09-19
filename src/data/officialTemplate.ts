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

    <!-- 📝 غيّر عناوين الامتحان والوصف هنا -->
    <header class="max-w-4xl mx-auto bg-white p-6 rounded-2xl shadow-lg mb-8 border-4 border-teal-400">
        <div class="text-center">
            <h1 class="text-2xl md:text-3xl font-bold text-gray-900 mb-2" data-ar="📐 عنوان الامتحان الرئيسي" data-en="📐 Main Exam Title">📐 عنوان الامتحان الرئيسي</h1>
            <h2 class="text-lg text-teal-600 font-semibold" data-ar="الصف والمادة (مثال: الصف التاسع - رياضيات)" data-en="Grade & Subject (e.g., Grade 9 - Math)">الصف والمادة (مثال: الصف التاسع - رياضيات)</h2>
            <p class="text-sm text-gray-600 mt-2" data-ar="وصف مختصر لمحتوى الامتحان والمواضيع المغطاة" data-en="Brief description of exam content and covered topics">وصف مختصر لمحتوى الامتحان والمواضيع المغطاة</p>
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

    <!-- 📝 يمكنك إضافة صيغ أو ملاحظات هامة هنا، أو حذف هذا القسم إذا لم يكن بحاجة إليه -->
    <div class="max-w-4xl mx-auto mb-6 bg-white p-4 rounded-xl shadow-md border-2 border-teal-200 no-print" id="notes-formula-box">
        <h3 class="font-bold text-lg mb-3 text-teal-700 text-center" data-ar="📐 ملاحظات أو صيغ هامة" data-en="📐 Important Notes or Formulae">📐 ملاحظات أو صيغ هامة</h3>
        <div class="grid md:grid-cols-2 gap-3 text-sm" id="notes-content">
            <div class="formula-box"><strong>ملاحظة 1:</strong> اقرأ السؤال بدقة واختر الإجابة الصحيحة</div>
            <div class="formula-box"><strong>ملاحظة 2:</strong> يتم حفظ إجاباتك تلقائياً وتصحيحها فوراً</div>
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
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        if (showIndicator) showSaveIndicator();
    } catch (e) { console.error('خطأ في الحفظ:', e); }
}

function loadState() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) return JSON.parse(saved);
    } catch (e) { console.error('خطأ في التحميل:', e); }
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
    if (confirm(confirmMsg)) { localStorage.removeItem(STORAGE_KEY); location.reload(); }
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
// 📝 منطقة تعديل الأسئلة: قم بتعديل هذا الجزء فقط لإضافة امتحانك الجديد
// =====================================================================
const originalExamData = {
    sections: [
        {
            id: 'sec1',
            title: { ar: '🔹 الجزء 1: عنوان القسم الأول', en: '🔹 Part 1: Section One Title' },
            questions: [
                {
                    q: { ar: 'اكتب نص السؤال الأول هنا بالعربية', en: 'Write the first question text here in English' },
                    options: [
                        { ar: 'الخيار الأول', en: 'Option 1' },
                        { ar: 'الخيار الثاني', en: 'Option 2' },
                        { ar: 'الخيار الثالث', en: 'Option 3' },
                        { ar: 'الخيار الرابع', en: 'Option 4' }
                    ],
                    correct: 0,
                    answer: { ar: 'اكتب شرح الإجابة الصحيحة هنا بالعربية', en: 'Write the explanation of the correct answer here in English' }
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
