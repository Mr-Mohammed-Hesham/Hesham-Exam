export interface SampleExam {
  id: string;
  title: string;
  subject: string;
  mimeType: string;
  data: string;
  previewUrl: string;
}

// Inline SVG samples converted to base64 data URLs
const physicsSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="800" viewBox="0 0 600 800" style="background:#ffffff;font-family:'Cairo',sans-serif">
  <rect width="600" height="800" fill="#f8fafc"/>
  <rect x="20" y="20" width="560" height="760" rx="12" fill="#ffffff" stroke="#cbd5e1" stroke-width="2"/>
  <rect x="35" y="35" width="530" height="60" rx="8" fill="#0284c7" />
  <text x="300" y="72" fill="#ffffff" font-size="20" font-weight="bold" text-anchor="middle">امتحان الفيزياء - قوانين الحركة والسرعة والقدرة</text>
  
  <text x="540" y="130" fill="#1e293b" font-size="16" font-weight="bold" text-anchor="end">السؤال الأول:</text>
  <text x="540" y="160" fill="#334155" font-size="14" text-anchor="end">تحرك جسم من السكون بعجلة منتظمة مقدارها 4 m/s² لمدة 5 ثوانٍ.</text>
  <text x="540" y="190" fill="#334155" font-size="14" text-anchor="end">احسب السرعة النهائية والمسافة المقطوعة خلال تلك الفترة.</text>
  
  <text x="540" y="240" fill="#1e293b" font-size="16" font-weight="bold" text-anchor="end">السؤال الثاني:</text>
  <text x="540" y="270" fill="#334155" font-size="14" text-anchor="end">ما هي القوة المحصلة المؤثرة على كتلة 10 kg تتحرك بتسارع 3 m/s²؟</text>
  
  <text x="540" y="330" fill="#1e293b" font-size="16" font-weight="bold" text-anchor="end">السؤال الثالث:</text>
  <text x="540" y="360" fill="#334155" font-size="14" text-anchor="end">اذكر الصيغة الرياضية لقانون نيوتن الثاني في الحركة ووضح دلالة كل رمز.</text>
  
  <circle cx="300" cy="520" r="80" fill="#e0f2fe" stroke="#0284c7" stroke-dasharray="4 4" stroke-width="2"/>
  <text x="300" y="525" fill="#0369a1" font-size="14" font-weight="bold" text-anchor="middle">مخطط القوى F = m · a</text>
</svg>`;

const mathSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="800" viewBox="0 0 600 800" style="background:#ffffff;font-family:'Cairo',sans-serif">
  <rect width="600" height="800" fill="#fdfbf7"/>
  <rect x="20" y="20" width="560" height="760" rx="12" fill="#ffffff" stroke="#e2e8f0" stroke-width="2"/>
  <rect x="35" y="35" width="530" height="60" rx="8" fill="#d97706" />
  <text x="300" y="72" fill="#ffffff" font-size="20" font-weight="bold" text-anchor="middle">اختبار الرياضيات - التفاضل والتكامل وحساب المثلثات</text>
  
  <text x="540" y="135" fill="#1e293b" font-size="16" font-weight="bold" text-anchor="end">المسألة الأولى:</text>
  <text x="540" y="165" fill="#334155" font-size="14" text-anchor="end">أوجد المشتقة الأولى للدالة: f(x) = 3x³ - 5x² + 7x - 9</text>
  <text x="540" y="195" fill="#334155" font-size="14" text-anchor="end">ثم احسب ميل المماس للمنحنى عند النقطة x = 2.</text>
  
  <text x="540" y="255" fill="#1e293b" font-size="16" font-weight="bold" text-anchor="end">المسألة الثانية:</text>
  <text x="540" y="285" fill="#334155" font-size="14" text-anchor="end">احسب قيمة التكامل المحدد: ∫ (2x + 4) dx من x = 1 إلى x = 3.</text>
  
  <text x="540" y="350" fill="#1e293b" font-size="16" font-weight="bold" text-anchor="end">المسألة الثالثة:</text>
  <text x="540" y="380" fill="#334155" font-size="14" text-anchor="end">إذا كانت sin(θ) = 0.6 حيث θ زاوية حادة، احسب cos(θ) و tan(θ).</text>
</svg>`;

const chemistrySvg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="800" viewBox="0 0 600 800" style="background:#ffffff;font-family:'Cairo',sans-serif">
  <rect width="600" height="800" fill="#f8fafc"/>
  <rect x="20" y="20" width="560" height="760" rx="12" fill="#ffffff" stroke="#cbd5e1" stroke-width="2"/>
  <rect x="35" y="35" width="530" height="60" rx="8" fill="#0d9488" />
  <text x="300" y="72" fill="#ffffff" font-size="20" font-weight="bold" text-anchor="middle">اختبار الكيمياء - الروابط الكيميائية والأحماض والغازات</text>
  
  <text x="540" y="135" fill="#1e293b" font-size="16" font-weight="bold" text-anchor="end">السؤال الأول:</text>
  <text x="540" y="165" fill="#334155" font-size="14" text-anchor="end">ما هو نوع الرابطة الكيميائية المتكونة بين ذرة الصوديوم (Na) والكلور (Cl)؟</text>
  
  <text x="540" y="235" fill="#1e293b" font-size="16" font-weight="bold" text-anchor="end">السؤال الثاني:</text>
  <text x="540" y="265" fill="#334155" font-size="14" text-anchor="end">احسب الرقم الهيدروجيني (pH) لمحلول حمض الهيدروكلوريك HCl تركيزه 0.01 M.</text>
  
  <text x="540" y="335" fill="#1e293b" font-size="16" font-weight="bold" text-anchor="end">السؤال الثالث:</text>
  <text x="540" y="365" fill="#334155" font-size="14" text-anchor="end">اكتب معادلة التفاعل المتزنة بين كربونات الكالسيوم وحمض الكبريتيك المخفف.</text>
</svg>`;

const toBase64DataUrl = (svg: string) => {
  const encoded = typeof window !== "undefined" && window.btoa ? window.btoa(unescape(encodeURIComponent(svg))) : Buffer.from(svg).toString("base64");
  return `data:image/svg+xml;base64,${encoded}`;
};

export const SAMPLE_EXAMS: SampleExam[] = [
  {
    id: "sample_physics",
    title: "ورقة أسئلة فيزياء (الحركة والعجلة)",
    subject: "الفيزياء الميكانيكية",
    mimeType: "image/svg+xml",
    data: toBase64DataUrl(physicsSvg),
    previewUrl: toBase64DataUrl(physicsSvg),
  },
  {
    id: "sample_math",
    title: "مسائل تفاضل وتكامل",
    subject: "الرياضيات البحتة والتطبيقية",
    mimeType: "image/svg+xml",
    data: toBase64DataUrl(mathSvg),
    previewUrl: toBase64DataUrl(mathSvg),
  },
  {
    id: "sample_chemistry",
    title: "ورقة امتحان كيمياء وتحليل كهربي",
    subject: "الكيمياء العامة وغير العضوية",
    mimeType: "image/svg+xml",
    data: toBase64DataUrl(chemistrySvg),
    previewUrl: toBase64DataUrl(chemistrySvg),
  },
];
