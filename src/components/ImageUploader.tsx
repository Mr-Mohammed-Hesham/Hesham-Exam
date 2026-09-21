import React, { useState, useRef, useEffect } from "react";
import { 
  UploadCloud, 
  Image as ImageIcon, 
  Camera, 
  Trash2, 
  Eye, 
  FileText, 
  Sparkles, 
  Plus, 
  CheckCircle2,
  Maximize2,
  X,
  FileCode,
  Edit3,
  Columns,
  Key,
  Copy,
  BookOpen,
  Info
} from "lucide-react";
import { ExamImage } from "../types";
import { SAMPLE_EXAMS, SampleExam } from "../data/sampleExams";
import { isRunningOnGitHubPages, isExternalOrigin, getGeminiApiKey } from "../config/api";

export interface ImageUploaderProps {
  images: ExamImage[];
  onImagesChange: (images: ExamImage[]) => void;
  onOpenCamera: () => void;
  examText: string;
  onExamTextChange: (text: string) => void;
  onOpenApiConfig?: () => void;
}

const SAMPLE_TEXT_TEMPLATES = [
  {
    title: "نموذج فيزياء (دوائر وقوانين)",
    text: `س1: في الدائرة الكهربائية، إذا وصلت ثلاث مقاومات متماثلة قيمة كل منها 6 أوم على التوازي، فإن المقاومة المكافئة تساوي:
أ) 2 أوم
ب) 18 أوم
ج) 6 أوم
د) 0.5 أوم
الإجابة: أ
التفسير: في حالة التوصيل على التوازي لمقاومات متماثلة: R_eq = R / n = 6 / 3 = 2 أوم.

س2: ما هي وحدة قياس شدة المجال المغناطيسي في النظام الدولي للوحدات (SI)؟
أ) تسلا (Tesla)
ب) ويبر (Weber)
ج) هنري (Henry)
د) فولت (Volt)
الإجابة: أ
التفسير: التسلا (T) هي وحدة قياس كثافة الفيض أو شدة المجال المغناطيسي، بينما الويبر لوحدة الفيض المغناطيسي.

س3: سلك مستقيم يمر به تيار كهربائي شدته 5 أمبير في مجال مغناطيسي منتظم مقداره 0.2 تسلا وعمودي على السلك. إذا كان طول السلك 0.4 متر، فما مقدار القوة المغناطيسية المؤثرة عليه؟
أ) 0.4 نيوتن
ب) 0.8 نيوتن
ج) 0.2 نيوتن
د) 1.0 نيوتن
الإجابة: أ
التفسير: F = B × I × L × sin(90°) = 0.2 × 5 × 0.4 × 1 = 0.4 N.`
  },
  {
    title: "نموذج كيمياء وأحياء",
    text: `س1: ما هو المركب العضوي الذي يعتبر المصدر الأساسي والسريع لإنتاج الطاقة في الخلايا الحية؟
أ) الجلوكوز
ب) الكوليسترول
ج) الهيموجلوبين
د) السيليلوز
الإجابة: أ
التفسير: الجلوكوز سكر أحادي بسيط يدخل مباشرة في مسار التنفس الخلوي لإنتاج جزيئات ATP الحاملة للطاقة.

س2: في التفاعل الكيميائي: N₂ + 3H₂ ⇌ 2NH₃ (تفاعل طارد للحرارة)، ماذا يحدث لموضع الاتزان عند زيادة الضغط؟
أ) يزاح الاتزان نحو تكوين غاز الأمونيا (النواتج)
ب) يزاح الاتزان نحو المتفاعلات
ج) لا يتأثر موضع الاتزان بتغير الضغط
د) يتوقف التفاعل الكيميائي
الإجابة: أ
التفسير: وفقاً لقاعدة لوشاتلييه، زيادة الضغط تزيح موضع الاتزان نحو الطرف الذي يحتوي على عدد مولات غازية أقل (2 مول مقابل 4 مولات).`
  },
  {
    title: "نموذج رياضيات (جبر وتفاضل)",
    text: `س1: أوجد مشتقة الدالة التالية: f(x) = 3x² - 5x + 7
أ) f'(x) = 6x - 5
ب) f'(x) = 3x - 5
ج) f'(x) = 6x + 7
د) f'(x) = x² - 5
الإجابة: أ
التفسير: مشتقة 3x² هي 6x، ومشتقة -5x هي -5، ومشتقة الثابت 7 تساوي صفراً.

س2: حل المعادلة الأسية التالية في مجموعة الأعداد الحقيقية: 2^(x + 1) = 16
أ) x = 3
ب) x = 4
ج) x = 2
د) x = 5
الإجابة: أ
التفسير: 16 = 2⁴، وبالتالي x + 1 = 4، ومنها x = 3.`
  }
];

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  images,
  onImagesChange,
  onOpenCamera,
  examText,
  onExamTextChange,
  onOpenApiConfig,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [activePreviewImage, setActivePreviewImage] = useState<ExamImage | null>(null);
  const [activeTab, setActiveTab] = useState<"split" | "images" | "text">("split");

  // Clipboard paste listener: Allows user to press Ctrl+V anywhere to paste an exam screenshot or text!
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (!e.clipboardData) return;
      const items = e.clipboardData.items;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf("image") !== -1) {
          const file = items[i].getAsFile();
          if (file) {
            processFiles([file]);
            return;
          }
        }
      }
    };

    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, [images]);

  const processFiles = async (files: FileList | File[]) => {
    const fileList = Array.from(files);
    const readPromises = fileList.map((file) => {
      return new Promise<ExamImage | null>((resolve) => {
        const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
        const isText = file.type.startsWith("text/") || 
                       file.name.toLowerCase().endsWith(".txt") || 
                       file.name.toLowerCase().endsWith(".md") || 
                       file.name.toLowerCase().endsWith(".json") ||
                       file.name.toLowerCase().endsWith(".csv");

        let category: 'image' | 'pdf' | 'document' | 'text' = 'image';
        let mimeType = file.type || "image/jpeg";

        if (isPdf) {
          category = 'pdf';
          mimeType = "application/pdf";
        } else if (isText) {
          category = 'text';
          mimeType = file.type || "text/plain";
        }

        const reader = new FileReader();
        reader.onload = () => {
          resolve({
            id: `file_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
            name: file.name,
            mimeType,
            data: reader.result as string,
            previewUrl: category === 'image' ? (reader.result as string) : undefined,
            fileCategory: category,
            size: file.size,
          });
        };
        reader.onerror = () => resolve(null);
        reader.readAsDataURL(file);
      });
    });

    const newItems = (await Promise.all(readPromises)).filter(Boolean) as ExamImage[];
    if (newItems.length > 0) {
      onImagesChange([...images, ...newItems]);
      if (activeTab === "text") setActiveTab("split");
    }
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleRemoveImage = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onImagesChange(images.filter((img) => img.id !== id));
  };

  const handleSelectSample = (sample: SampleExam) => {
    const newImg: ExamImage = {
      id: `sample_${Date.now()}`,
      name: `${sample.title}.png`,
      mimeType: sample.mimeType,
      data: sample.data,
      previewUrl: sample.previewUrl,
      fileCategory: 'image',
    };
    onImagesChange([...images, newImg]);
  };

  // Detect count of questions in the entered text
  const detectedQuestionCount = examText
    ? (examText.match(/(?:س(?:ؤال)?\s*\d+[\:\-\.]|\d+[\.\-\)]|Q(?:uestion)?\s*\d+[\:\-\.])/gi) || []).length
    : 0;

  const isExternal = isRunningOnGitHubPages() || isExternalOrigin();
  const hasGeminiKey = Boolean(getGeminiApiKey());

  return (
    <div className="flex flex-col h-full bg-slate-900/95 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl text-right" dir="rtl">
      
      {/* Header with Source Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 mb-4 border-b border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold text-sm">
            1
          </div>
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span>مصدر امتحانك (صور أو نص مكتوب)</span>
              {images.length > 0 && (
                <span className="text-[11px] px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 font-semibold border border-indigo-500/30">
                  {images.length} صور/ملفات
                </span>
              )}
              {examText.trim().length > 0 && (
                <span className="text-[11px] px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30">
                  نص مضاف ({detectedQuestionCount > 0 ? `${detectedQuestionCount} أسئلة` : `${examText.length} حرف`})
                </span>
              )}
            </h2>
            <p className="text-xs text-slate-400">
              يمكنك رفع صور الامتحان أو كتابة الأسئلة كنص بجوار الصور وسيتم التوليد بناءً عليها بدقة 100%
            </p>
          </div>
        </div>

        {/* View Switcher: Split / Images / Text */}
        <div className="flex items-center gap-1.5 bg-slate-950/70 p-1 rounded-xl border border-slate-800 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setActiveTab("split")}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition ${
              activeTab === "split"
                ? "bg-amber-500 text-slate-950 shadow-xs"
                : "text-slate-400 hover:text-white"
            }`}
            title="عرض مجاور: الصور والنص معاً"
          >
            <Columns className="w-3.5 h-3.5" />
            <span className="hidden md:inline">عرض مجاور</span>
            <span>(صور + نص)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("images")}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition ${
              activeTab === "images"
                ? "bg-amber-500 text-slate-950 shadow-xs"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>الصور فقط</span>
            {images.length > 0 && (
              <span className="w-4 h-4 rounded-full bg-slate-900 text-amber-300 text-[10px] flex items-center justify-center font-black">
                {images.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("text")}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition ${
              activeTab === "text"
                ? "bg-amber-500 text-slate-950 shadow-xs"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>نص الامتحان</span>
            {examText.trim().length > 0 && (
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            )}
          </button>
        </div>
      </div>

      {/* External Notice & Gemini Key Button for GitHub Pages */}
      {isExternal && !hasGeminiKey && (
        <div className="mb-3 p-3 rounded-xl bg-indigo-950/40 border border-indigo-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs text-indigo-300">
            <Info className="w-4 h-4 shrink-0 text-amber-400" />
            <span>
              نصيحة للموقع الخارجي: يمكنك كتابة نص الامتحان مباشرة لتوليد أسئلته فوراً بدون مفاتيح، أو اضغط لإضافة مفتاح Gemini المجاني لمعالجة الصور مباشرة.
            </span>
          </div>
          {onOpenApiConfig && (
            <button
              type="button"
              onClick={onOpenApiConfig}
              className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-lg transition shrink-0 self-start sm:self-auto flex items-center gap-1.5"
            >
              <Key className="w-3.5 h-3.5" />
              <span>تهيئة المفتاح</span>
            </button>
          )}
        </div>
      )}

      {/* Main Content Area (Split / Single) */}
      <div className={`flex-1 grid gap-4 ${
        activeTab === "split" 
          ? "grid-cols-1 lg:grid-cols-2" 
          : "grid-cols-1"
      }`}>

        {/* --- LEFT / FIRST PANE: IMAGES & UPLOAD --- */}
        {(activeTab === "split" || activeTab === "images") && (
          <div className="flex flex-col h-full space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-indigo-400" />
                <span>صور ومستندات الامتحان ({images.length})</span>
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onOpenCamera}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-[11px] font-semibold transition"
                  title="التقاط صورة للامتحان عبر الكاميرا"
                >
                  <Camera className="w-3 h-3 text-indigo-400" />
                  <span>الكاميرا</span>
                </button>
              </div>
            </div>

            {/* Dropzone */}
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleFileDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`relative flex-1 min-h-[220px] rounded-xl border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center p-4 text-center ${
                isDragging
                  ? "border-amber-500 bg-amber-500/10 scale-[0.99]"
                  : images.length > 0
                  ? "border-slate-700/80 bg-slate-950/50 hover:border-slate-600"
                  : "border-indigo-500/40 bg-indigo-950/10 hover:border-indigo-500/70 hover:bg-indigo-950/20"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,.pdf,.txt,.doc,.docx,.md,.json"
                multiple
                className="hidden"
                onChange={handleFileSelect}
              />

              {images.length === 0 ? (
                <div className="space-y-2 pointer-events-none p-2">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center mx-auto text-indigo-400 shadow-inner">
                    <UploadCloud className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-bold text-white">
                      اسحب وأفلت صور أوراق الامتحان هنا، أو <span className="text-amber-400 underline">تصفح جهازك</span>
                    </p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      يدعم الصور (JPG, PNG) • مستندات PDF • أو اضغط <kbd className="px-1 py-0.5 bg-slate-800 text-slate-300 rounded text-[10px] font-mono border border-slate-700">Ctrl + V</kbd> للصق لقطة الشاشة
                    </p>
                  </div>
                </div>
              ) : (
                <div className="w-full h-full flex flex-col justify-between" onClick={(e) => e.stopPropagation()}>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 w-full max-h-[300px] overflow-y-auto p-1">
                    {images.map((item, idx) => {
                      const isPdf = item.fileCategory === 'pdf' || item.name.toLowerCase().endsWith('.pdf');
                      const isDoc = item.fileCategory === 'document' || item.fileCategory === 'text' || (!item.previewUrl && !isPdf);
                      
                      return (
                        <div
                          key={item.id}
                          className="group relative aspect-4/3 rounded-xl overflow-hidden border border-slate-700/80 bg-slate-900 shadow-md transition-all hover:border-amber-500 flex flex-col items-center justify-center p-2 text-center"
                        >
                          {item.previewUrl ? (
                            <img
                              src={item.previewUrl}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          ) : isPdf ? (
                            <div className="flex flex-col items-center justify-center gap-1 text-rose-400">
                              <div className="w-8 h-8 rounded-lg bg-rose-500/20 border border-rose-500/30 flex items-center justify-center font-bold text-xs">
                                PDF
                              </div>
                              <span className="text-[10px] font-bold text-slate-200 line-clamp-1 px-1">
                                {item.name}
                              </span>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center justify-center gap-1 text-sky-400">
                              <FileText className="w-6 h-6" />
                              <span className="text-[10px] font-bold text-slate-200 line-clamp-1 px-1">
                                {item.name}
                              </span>
                            </div>
                          )}
                          
                          <span className="absolute top-1 right-1 bg-black/80 backdrop-blur-sm text-white text-[9px] font-bold px-1.5 py-0.2 rounded border border-white/10">
                            {isPdf ? "PDF" : isDoc ? "مستند" : `صفحة ${idx + 1}`}
                          </span>

                          <div className="absolute inset-0 bg-slate-950/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 p-2">
                            {item.previewUrl && (
                              <button
                                type="button"
                                onClick={() => setActivePreviewImage(item)}
                                className="p-1 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs"
                                title="معاينة"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={(e) => handleRemoveImage(item.id, e)}
                              className="p-1 bg-rose-600/90 hover:bg-rose-500 text-white rounded-lg text-xs"
                              title="حذف"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}

                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="aspect-4/3 rounded-xl border border-dashed border-slate-700 hover:border-amber-500 bg-slate-950/40 hover:bg-amber-950/20 flex flex-col items-center justify-center text-slate-400 hover:text-amber-300 transition text-[11px] font-semibold gap-1"
                    >
                      <Plus className="w-4 h-4 text-amber-400" />
                      <span>إضافة صفحة أخرى</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Ready Sample Exams */}
            <div className="pt-2 border-t border-slate-800/80">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-bold text-slate-300 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  <span>نماذج صور جاهزة للتجربة:</span>
                </span>
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                {SAMPLE_EXAMS.map((sample) => (
                  <button
                    key={sample.id}
                    type="button"
                    onClick={() => handleSelectSample(sample)}
                    className="text-right p-1.5 rounded-lg border border-slate-800 bg-slate-950/40 hover:bg-slate-800/80 hover:border-indigo-500/50 transition truncate text-[10px] text-slate-300 font-semibold"
                    title={sample.title}
                  >
                    📄 {sample.title}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* --- RIGHT / SECOND PANE: TEXT INPUT & DIRECT QUESTIONS --- */}
        {(activeTab === "split" || activeTab === "text") && (
          <div className="flex flex-col h-full space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <Edit3 className="w-3.5 h-3.5 text-amber-400" />
                <span>كتابة أو لصق نص الامتحان والأسئلة مباشرة</span>
              </label>
              {examText.trim() && (
                <button
                  type="button"
                  onClick={() => onExamTextChange("")}
                  className="text-[11px] text-rose-400 hover:text-rose-300 font-semibold hover:underline"
                >
                  مسح النص
                </button>
              )}
            </div>

            {/* Textarea Area */}
            <div className="relative flex-1 flex flex-col min-h-[220px]">
              <textarea
                value={examText}
                onChange={(e) => onExamTextChange(e.target.value)}
                placeholder={`اكتب أو الصق نص الامتحان هنا، مثل:\n\nس1: ما هو القانون الأول للديناميكا الحرارية؟\nأ) حفظ الطاقة\nب) زيادة الإنتروبيا\nج) الصفر المطلق\nد) قانون التوازن\nالإجابة: أ\nالتفسير: ينص القانون الأول على أن الطاقة لا تفنى ولا تستحدث من عدم.\n\n(أو الصق أي نص دراسي وسيقوم النظام بصياغة وتوليد أسئلة دقيقة منه مباشرة)`}
                className="w-full flex-1 min-h-[190px] p-3.5 bg-slate-950/90 border border-slate-700/90 rounded-xl text-slate-100 text-xs font-sans leading-relaxed placeholder:text-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 resize-none font-mono"
              />

              {/* Bottom bar of textarea */}
              <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1 px-1">
                <span>
                  {examText.length} حرف • {detectedQuestionCount > 0 ? `✨ تم رصد ${detectedQuestionCount} أسئلة في النص` : "جاهز للتحليل"}
                </span>
                <span className="text-emerald-400 font-semibold">
                  {examText.trim().length > 10 ? "✓ سيتم التوليد مباشرة من هذا النص" : ""}
                </span>
              </div>
            </div>

            {/* Quick Templates Buttons */}
            <div className="pt-2 border-t border-slate-800/80">
              <span className="text-[11px] font-bold text-slate-300 flex items-center gap-1 mb-1.5">
                <BookOpen className="w-3 h-3 text-amber-400" />
                <span>إدراج نماذج أسئلة نصية جاهزة للتجربة والتعديل:</span>
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5">
                {SAMPLE_TEXT_TEMPLATES.map((tpl, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => onExamTextChange(tpl.text)}
                    className="text-right p-1.5 rounded-lg border border-slate-800 bg-slate-950/40 hover:bg-slate-800/80 hover:border-amber-500/50 transition text-[10px] text-slate-200 font-semibold truncate"
                    title={tpl.title}
                  >
                    ✍️ {tpl.title}
                  </button>
                ))}
              </div>
            </div>

          </div>
        )}

      </div>

      {/* Fullscreen Image Preview Lightbox */}
      {activePreviewImage && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
          onClick={() => setActivePreviewImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden p-2">
            <button
              onClick={() => setActivePreviewImage(null)}
              className="absolute top-4 right-4 z-10 p-2 bg-black/70 hover:bg-black text-white rounded-full transition"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={activePreviewImage.previewUrl}
              alt={activePreviewImage.name}
              className="max-h-[82vh] w-auto object-contain rounded-xl"
            />
            <div className="p-3 text-center text-xs text-slate-300 font-medium">
              {activePreviewImage.name}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
