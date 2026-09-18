import React from "react";
import { HelpCircle, X, Camera, Play, CheckCircle2, Sparkles } from "lucide-react";

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2 text-white font-bold text-base">
            <HelpCircle className="w-5 h-5 text-purple-400" />
            <span>كيف تعمل منصة Hesham Exam؟</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm text-slate-300">
          
          <div className="bg-amber-950/40 border border-amber-500/40 rounded-xl p-4 text-xs leading-relaxed text-amber-200">
            <strong className="text-white block mb-1 text-sm">نظام توليد الامتحانات الذكية - مستر محمد هشام:</strong>
            <span className="font-semibold text-amber-300">"المنصة قائمة بالكامل على الملفات والصور المرفوعة فقط، حيث يتم تحليل الأسئلة أو ابتكار أسئلة جديدة وحلها وتوليد امتحان إلكتروني تفاعلي متكامل بضغطة زر واحدة."</span>
          </div>

          <div className="space-y-4">
            
            {/* Step 1 */}
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-indigo-600/30 border border-indigo-500/40 text-indigo-400 font-bold flex items-center justify-center shrink-0">
                1
              </div>
              <div>
                <h4 className="font-bold text-white text-sm mb-1 flex items-center gap-1.5">
                  <Camera className="w-4 h-4 text-indigo-400" />
                  <span>رفع ملفات أو التقاط صور الامتحان</span>
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  ارفع مستندات (PDF / Word) أو صور أوراق الامتحان، أو التقط صورة مباشرة بالكاميرا، أو اضغط <kbd className="px-1 py-0.5 bg-slate-800 rounded border border-slate-700 text-slate-300 font-mono">Ctrl+V</kbd> للصق سكرين شوت. يدعم تحليل المعادلات والرسومات والمسائل المعقدة.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-purple-600/30 border border-purple-500/40 text-purple-400 font-bold flex items-center justify-center shrink-0">
                2
              </div>
              <div>
                <h4 className="font-bold text-white text-sm mb-1 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  <span>تحديد خيارات الامتحان ونمط التوليد</span>
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  اختر بين "توليد أسئلة ومسائل جديدة على نفس شاكلة الملف" أو "استخراج نفس أسئلة الملف نصياً"، مع ضبط عدد الأسئلة وزمن الاختبار بالدقائق وتفعيل الحل والشرح النموذجي.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-600/30 border border-emerald-500/40 text-emerald-400 font-bold flex items-center justify-center shrink-0">
                3
              </div>
              <div>
                <h4 className="font-bold text-white text-sm mb-1 flex items-center gap-1.5">
                  <Play className="w-4 h-4 text-emerald-400" />
                  <span>حل وتجربة الامتحان التفاعلي وتصديره</span>
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  اضغط "توليد الامتحان التفاعلي". يعتمد النظام القالب التفاعلي الرسمي المعتمد لمستر محمد هشام: ثنائية لغة كاملة (عربي | English)، إرسال النتيجة للمعلم تلقائياً عبر EmailJS، عرض المعادلات والمسائل الرياضية والفيزيائية بدقة عالية، مؤقت تنازلي، وحفظ تلقائي للتقدم.
                </p>
              </div>
            </div>

          </div>

          <div className="pt-2">
            <button
              onClick={onClose}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-indigo-600/20"
            >
              فهمت، ابدأ الآن!
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
