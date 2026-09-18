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
  FileCheck,
  FileCode,
  FileType2
} from "lucide-react";
import { ExamImage } from "../types";
import { SAMPLE_EXAMS, SampleExam } from "../data/sampleExams";

interface ImageUploaderProps {
  images: ExamImage[];
  onImagesChange: (images: ExamImage[]) => void;
  onOpenCamera: () => void;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  images,
  onImagesChange,
  onOpenCamera,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [activePreviewImage, setActivePreviewImage] = useState<ExamImage | null>(null);

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
        const isImg = file.type.startsWith("image/");
        const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
        const isText = file.type.startsWith("text/") || 
                       file.name.toLowerCase().endsWith(".txt") || 
                       file.name.toLowerCase().endsWith(".md") || 
                       file.name.toLowerCase().endsWith(".json") ||
                       file.name.toLowerCase().endsWith(".csv");
        const isWord = file.name.toLowerCase().endsWith(".docx") || file.name.toLowerCase().endsWith(".doc");

        let category: 'image' | 'pdf' | 'document' | 'text' = 'image';
        let mimeType = file.type || "image/jpeg";

        if (isPdf) {
          category = 'pdf';
          mimeType = "application/pdf";
        } else if (isText) {
          category = 'text';
          mimeType = file.type || "text/plain";
        } else if (isWord) {
          category = 'document';
          mimeType = file.type || "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
        } else if (!isImg) {
          category = 'document';
        }

        const reader = new FileReader();
        reader.onload = (event) => {
          const result = event.target?.result as string;
          if (!result) return resolve(null);
          resolve({
            id: `file_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
            name: file.name || `ملف_امتحان_${Date.now()}`,
            mimeType: mimeType,
            data: result,
            previewUrl: isImg ? result : "",
            size: file.size,
            fileCategory: category,
          });
        };
        reader.onerror = () => resolve(null);
        reader.readAsDataURL(file);
      });
    });

    const newItems = (await Promise.all(readPromises)).filter(Boolean) as ExamImage[];
    if (newItems.length > 0) {
      onImagesChange([...images, ...newItems]);
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
    // reset
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

  return (
    <div className="flex flex-col h-full bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl">
      
      {/* Section Header */}
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold text-sm">
            1
          </div>
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span>رفع ملفات أو صور الامتحان</span>
              <span className="text-[11px] px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30">
                {images.length > 0 ? `${images.length} ملف/صورة مرفوعة` : "المصدر الحصري 🎯"}
              </span>
            </h2>
            <p className="text-xs text-slate-300">
              ارفع أوراق الامتحان، مذكرات، أو صور الأسئلة ليتم توليد الامتحان التفاعلي وحلوله منها مباشرة (يدعم PDF، Word، صور، نصوص)
            </p>
          </div>
        </div>

        {/* Camera and Add Buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenCamera}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition"
            title="التقاط صورة للامتحان عبر الكاميرا"
          >
            <Camera className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">الكاميرا</span>
          </button>
        </div>
      </div>

      {/* Main Drag-and-Drop Area */}
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleFileDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative flex-1 min-h-[220px] rounded-xl border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center p-6 text-center ${
          isDragging
            ? "border-indigo-500 bg-indigo-500/10 scale-[0.99]"
            : images.length > 0
            ? "border-slate-700/80 bg-slate-950/40 hover:border-slate-600"
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
          <div className="space-y-3 pointer-events-none">
            <div className="w-14 h-14 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center mx-auto text-indigo-400 shadow-inner">
              <UploadCloud className="w-7 h-7" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">
                اسحب وأفلت صورة الامتحان أو ملف الأسئلة هنا، أو <span className="text-indigo-400 underline">تصفح جهازك</span>
              </p>
              <p className="text-xs text-slate-400 mt-1">
                يدعم الصور (JPG, PNG) • مستندات PDF • ملفات Word و Text • أو اضغط <kbd className="px-1.5 py-0.5 bg-slate-800 text-slate-300 rounded text-[10px] font-mono border border-slate-700">Ctrl + V</kbd> للصق المباشر
              </p>
            </div>
          </div>
        ) : (
          <div className="w-full h-full flex flex-col justify-between">
            {/* Gallery of uploaded images and files */}
            <div 
              className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full"
              onClick={(e) => e.stopPropagation()}
            >
              {images.map((item, idx) => {
                const isPdf = item.fileCategory === 'pdf' || item.name.toLowerCase().endsWith('.pdf');
                const isDoc = item.fileCategory === 'document' || item.fileCategory === 'text' || (!item.previewUrl && !isPdf);
                
                return (
                  <div
                    key={item.id}
                    className="group relative aspect-4/3 rounded-xl overflow-hidden border border-slate-700/80 bg-slate-900 shadow-md transition-all hover:border-indigo-500 flex flex-col items-center justify-center p-3 text-center"
                  >
                    {item.previewUrl ? (
                      <img
                        src={item.previewUrl}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    ) : isPdf ? (
                      <div className="flex flex-col items-center justify-center gap-1.5 text-rose-400">
                        <div className="w-10 h-10 rounded-lg bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400 font-bold">
                          PDF
                        </div>
                        <span className="text-[11px] font-bold text-slate-200 line-clamp-1 px-1">
                          {item.name}
                        </span>
                        {item.size && (
                          <span className="text-[9px] text-slate-400">
                            {(item.size / 1024).toFixed(0)} KB
                          </span>
                        )}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center gap-1.5 text-sky-400">
                        <div className="w-10 h-10 rounded-lg bg-sky-500/20 border border-sky-500/30 flex items-center justify-center text-sky-400 font-bold">
                          <FileText className="w-5 h-5" />
                        </div>
                        <span className="text-[11px] font-bold text-slate-200 line-clamp-1 px-1">
                          {item.name}
                        </span>
                        {item.size && (
                          <span className="text-[9px] text-slate-400">
                            {(item.size / 1024).toFixed(0)} KB
                          </span>
                        )}
                      </div>
                    )}
                    
                    {/* Badge */}
                    <span className="absolute top-2 right-2 bg-black/80 backdrop-blur-sm text-white text-[10px] font-bold px-1.5 py-0.5 rounded border border-white/10">
                      {isPdf ? "ملف PDF" : isDoc ? "مستند" : `صفحة ${idx + 1}`}
                    </span>

                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-2">
                      {item.previewUrl && (
                        <button
                          type="button"
                          onClick={() => setActivePreviewImage(item)}
                          className="p-1.5 bg-slate-800/90 hover:bg-slate-700 text-white rounded-lg text-xs"
                          title="معاينة بالحجم الكامل"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={(e) => handleRemoveImage(item.id, e)}
                        className="p-1.5 bg-rose-600/90 hover:bg-rose-500 text-white rounded-lg text-xs mr-auto"
                        title="حذف الملف"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}

              {/* Add more button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="aspect-4/3 rounded-xl border border-dashed border-slate-700 hover:border-indigo-500/80 bg-slate-950/40 hover:bg-indigo-950/20 flex flex-col items-center justify-center text-slate-400 hover:text-indigo-300 transition text-xs font-semibold gap-1.5"
              >
                <Plus className="w-5 h-5 text-indigo-400" />
                <span>إضافة ملف أو صورة</span>
              </button>
            </div>

            <p className="text-[11px] text-slate-400 mt-3 text-center">
              يمكنك رفع صفحات متعددة أو ملفات مختلفة للمادة المراد توليد أسئلتها
            </p>
          </div>
        )}
      </div>

      {/* Quick Test Samples */}
      <div className="mt-4 pt-3 border-t border-slate-800/80">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-300 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>نماذج أوراق ومسائل جاهزة للتجربة الفورية:</span>
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {SAMPLE_EXAMS.map((sample) => (
            <button
              key={sample.id}
              type="button"
              onClick={() => handleSelectSample(sample)}
              className="text-right p-2.5 rounded-xl border border-slate-800 bg-slate-950/50 hover:bg-slate-800/80 hover:border-indigo-500/50 transition flex items-start gap-2 group"
            >
              <div className="w-6 h-6 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center shrink-0 mt-0.5 text-indigo-400 group-hover:scale-105 transition">
                <FileText className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-200 group-hover:text-indigo-300 truncate">
                  {sample.title}
                </p>
                <p className="text-[10px] text-slate-400 truncate mt-0.5">
                  {sample.subject}
                </p>
              </div>
            </button>
          ))}
        </div>
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
