import React from "react";
import { Sparkles, CheckCircle, Wand2, Sliders, AlertCircle, RefreshCw, FileText, Lightbulb } from "lucide-react";
import { GenerationMode } from "../types";

interface GenerationOptionsProps {
  examTitle: string;
  onExamTitleChange: (val: string) => void;
  solveQuestions: boolean;
  onSolveQuestionsChange: (val: boolean) => void;
  instructions: string;
  onInstructionsChange: (val: string) => void;
  generationMode: GenerationMode;
  onGenerationModeChange: (mode: GenerationMode) => void;
  questionCount: number;
  onQuestionCountChange: (cnt: number) => void;
  durationMinutes: number;
  onDurationMinutesChange: (mins: number) => void;
  difficulty: string;
  onDifficultyChange: (diff: string) => void;
  onGenerate: () => void;
  isGenerating: boolean;
  canGenerate: boolean;
  generationStep: string;
}

export const GenerationOptions: React.FC<GenerationOptionsProps> = ({
  examTitle,
  onExamTitleChange,
  solveQuestions,
  onSolveQuestionsChange,
  instructions,
  onInstructionsChange,
  generationMode,
  onGenerationModeChange,
  questionCount,
  onQuestionCountChange,
  durationMinutes,
  onDurationMinutesChange,
  difficulty,
  onDifficultyChange,
  onGenerate,
  isGenerating,
  canGenerate,
  generationStep,
}) => {
  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-5">
      
      {/* Header */}
      <div className="flex items-center gap-2 pb-3 border-b border-slate-800/80">
        <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold text-sm">
          2
        </div>
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <span>إعدادات الامتحان ونمط الأسئلة</span>
            <span className="text-[11px] px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 font-normal">
              تحكم ذكي متكامل
            </span>
          </h2>
          <p className="text-xs text-slate-400">
            حدد هل تريد ابتكار أسئلة جديدة على نفس شاكلة الملف/الصورة، أو استخراجها كما هي، مع ضبط وقت وعدد الأسئلة
          </p>
        </div>
      </div>

      {/* CORE FEATURE: Generation Mode Selector Cards */}
      <div>
        <label className="block text-xs font-bold text-slate-300 mb-2">
          نظام توليد الامتحان (مبني حصرياً على الملف أو الصورة المرفوعة):
        </label>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          
          {/* Mode 1: Generate New Questions Like the Image/File */}
          <div
            onClick={() => onGenerationModeChange("generate_new_similar")}
            className={`p-4 rounded-xl border cursor-pointer transition relative ${
              generationMode === "generate_new_similar"
                ? "bg-gradient-to-br from-amber-950/60 via-slate-900 to-amber-950/40 border-amber-500/80 ring-1 ring-amber-500/50 shadow-lg shadow-amber-950/50"
                : "bg-slate-950/60 border-slate-800 hover:border-slate-700 opacity-75 hover:opacity-100"
            }`}
          >
            <div className="flex items-start justify-between gap-2 mb-1.5">
              <div className="flex items-center gap-2 font-bold text-white text-sm">
                <span className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  <Sparkles className="w-4 h-4" />
                </span>
                <span>توليد أسئلة ومسائل جديدة مماثلة للملف لتكوين امتحان جديد</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold">
                النظام المعتمد 🎯
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed pr-8">
              المرجع هو الملف وقوانينه ومسائله: يدرس الذكاء الاصطناعي أفكار ومسائل الملف أو الصورة ويبتكر أسئلة ومسائل جديدة مماثلة لها في الصعوبة والمفهوم لإنشاء امتحان تفاعلي شامل.
            </p>
          </div>

          {/* Mode 2: Exact Extraction of original image questions */}
          <div
            onClick={() => onGenerationModeChange("exact_extract")}
            className={`p-4 rounded-xl border cursor-pointer transition relative ${
              generationMode === "exact_extract"
                ? "bg-gradient-to-br from-amber-950/60 via-slate-900 to-amber-950/40 border-amber-500/80 ring-1 ring-amber-500/50 shadow-lg shadow-amber-950/50"
                : "bg-slate-950/60 border-slate-800 hover:border-slate-700 opacity-75 hover:opacity-100"
            }`}
          >
            <div className="flex items-start justify-between gap-2 mb-1.5">
              <div className="flex items-center gap-2 font-bold text-white text-sm">
                <span className="p-1.5 rounded-lg bg-slate-800 text-slate-300 border border-slate-700">
                  <FileText className="w-4 h-4" />
                </span>
                <span>استخراج نفس أسئلة ومسائل الملف الأصلية نصياً</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 font-semibold">
                استخراج حرفي 📋
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed pr-8">
              استخراج نفس المسائل والأرقام الموجودة في الورقة أو الملف كما هي بحذافيرها دون ابتكار أسئلة جديدة، وتحويلها إلى تطبيق امتحان تفاعلي فوري.
            </p>
          </div>

        </div>
      </div>

      {/* Sub-parameters for Question Count, Exam Duration (Time), and Difficulty */}
      <div className="p-4 rounded-xl bg-indigo-950/40 border border-indigo-900/50 grid grid-cols-1 md:grid-cols-12 gap-4 text-xs">
        
        {/* Manual Question Count Selector (تحديد عدد الأسئلة يدوياً) */}
        <div className="md:col-span-5 space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-slate-200 font-bold flex items-center gap-1.5">
              <span>🔢 عدد الأسئلة:</span>
              <span className="text-[10px] text-indigo-300 font-normal">(إدخال يدوي حر)</span>
            </label>
            <div className="flex items-center gap-1">
              <input
                type="number"
                min={1}
                max={100}
                value={questionCount}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  if (!isNaN(val) && val > 0) onQuestionCountChange(val);
                }}
                className="w-16 px-2 py-1 rounded-md bg-slate-950 border border-indigo-500/50 text-indigo-300 text-center font-mono font-bold text-xs focus:outline-none focus:ring-1 focus:ring-indigo-400"
              />
              <span className="text-slate-400 text-[11px]">سؤال</span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {[3, 5, 7, 10, 15, 20, 25].map((cnt) => (
              <button
                key={cnt}
                type="button"
                onClick={() => onQuestionCountChange(cnt)}
                className={`flex-1 py-1 rounded font-mono font-bold text-[11px] transition cursor-pointer ${
                  questionCount === cnt
                    ? "bg-indigo-600 text-white shadow"
                    : "bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800"
                }`}
              >
                {cnt}
              </button>
            ))}
          </div>
        </div>

        {/* Manual Exam Duration Selector (تحديد وقت الامتحان يدوياً) */}
        <div className="md:col-span-4 space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-slate-200 font-bold flex items-center gap-1.5">
              <span>⏰ وقت الامتحان:</span>
              <span className="text-[10px] text-teal-300 font-normal">(إدخال يدوي)</span>
            </label>
            <div className="flex items-center gap-1">
              <input
                type="number"
                min={1}
                max={300}
                value={durationMinutes}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  if (!isNaN(val) && val > 0) onDurationMinutesChange(val);
                }}
                className="w-16 px-2 py-1 rounded-md bg-slate-950 border border-teal-500/50 text-teal-300 text-center font-mono font-bold text-xs focus:outline-none focus:ring-1 focus:ring-teal-400"
              />
              <span className="text-slate-400 text-[11px]">دقيقة</span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {[10, 15, 20, 30, 45, 60].map((mins) => (
              <button
                key={mins}
                type="button"
                onClick={() => onDurationMinutesChange(mins)}
                className={`flex-1 py-1 rounded font-mono font-bold text-[11px] transition cursor-pointer ${
                  durationMinutes === mins
                    ? "bg-teal-600 text-white shadow"
                    : "bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800"
                }`}
              >
                {mins}د
              </button>
            ))}
          </div>
        </div>

        {/* Difficulty Selector */}
        <div className="md:col-span-3 space-y-1.5">
          <label className="block text-slate-200 font-bold">
            مستوى الصعوبة:
          </label>
          <select
            value={difficulty}
            onChange={(e) => onDifficultyChange(e.target.value)}
            className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="same">نفس مستوى الصورة تماماً</option>
            <option value="medium">متوسط وشامل للمفاهيم</option>
            <option value="hard">متقدم للمتفوقين (تحدي)</option>
            <option value="easy">مباشر وتمهيدي</option>
          </select>
        </div>

      </div>

      {/* Row of Inputs: Exam Title, Prompt Instructions, Solve Toggle */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end pt-1">
        
        {/* Exam Title */}
        <div className="md:col-span-4">
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            عنوان الامتحان الجديد (اختياري)
          </label>
          <input
            type="text"
            value={examTitle}
            onChange={(e) => onExamTitleChange(e.target.value)}
            placeholder="مثال: اختبار الفيزياء: البادئات والوحدات الأساسية"
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700/80 text-white placeholder-slate-500 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition"
          />
        </div>

        {/* Custom Instructions */}
        <div className="md:col-span-5">
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            توجيهات أو تعديلات برمجية إضافية (Prompt)
          </label>
          <input
            type="text"
            value={instructions}
            onChange={(e) => onInstructionsChange(e.target.value)}
            placeholder="مثال: ركز على تحويل الميكرو والنانو، أضف مؤقت 30 دقيقة..."
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700/80 text-white placeholder-slate-500 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition"
          />
        </div>

        {/* Solve Questions Toggle */}
        <div className="md:col-span-3">
          <label 
            className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 cursor-pointer transition select-none"
          >
            <input
              type="checkbox"
              checked={solveQuestions}
              onChange={(e) => onSolveQuestionsChange(e.target.checked)}
              className="w-4 h-4 rounded text-indigo-600 bg-slate-800 border-slate-700 focus:ring-indigo-500 accent-indigo-600"
            />
            <div className="text-right">
              <span className="text-xs font-semibold text-slate-200 block">حل الأسئلة والشرح</span>
              <span className="text-[10px] text-slate-400 block">تحديد الإجابة الصحيحة والتبرير</span>
            </div>
          </label>
        </div>

      </div>

      {/* Action Bar */}
      <div className="pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3">
        
        {/* Status / Hint */}
        <div className="text-xs text-slate-400 flex items-center gap-2">
          {isGenerating ? (
            <div className="flex items-center gap-2 text-amber-300 animate-pulse font-medium">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
              <span>{generationStep || "جاري استخراج الأسئلة وتوليد الامتحان التفاعلي..."}</span>
            </div>
          ) : !canGenerate ? (
            <div className="flex items-center gap-1.5 text-amber-400/90 text-[11px]">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>يرجى رفع صورة أو ملف الامتحان للبدء فوراً.</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-emerald-400/90 text-[11px]">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>
                {generationMode === "generate_new_similar" 
                  ? `جاهز لتوليد امتحان تفاعلي كامل (${questionCount} أسئلة) مستوحى ومحلول من الملف/الصورة المرفوعة.` 
                  : "جاهز لاستخراج أسئلة ومسائل الملف وحلها كإمتحان تفاعلي."}
              </span>
            </div>
          )}
        </div>

        {/* Generate Button */}
        <button
          type="button"
          onClick={onGenerate}
          disabled={!canGenerate || isGenerating}
          id="btn-generate-exam-code"
          className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-amber-600 via-orange-600 to-amber-500 hover:from-amber-500 hover:via-orange-500 hover:to-amber-400 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 font-black text-sm shadow-xl shadow-amber-600/30 transition-all flex items-center justify-center gap-2.5 active:scale-[0.98]"
        >
          {isGenerating ? (
            <>
              <div className="w-4 h-4 border-2 border-slate-950/30 border-t-slate-950 rounded-full animate-spin"></div>
              <span>جاري توليد الامتحان التفاعلي...</span>
            </>
          ) : (
            <>
              <Wand2 className="w-4 h-4 text-slate-950" />
              <span>
                {generationMode === "generate_new_similar" 
                  ? `توليد امتحان تفاعلي كامل (${questionCount} أسئلة)` 
                  : "توليد وحل الامتحان الآن"}
              </span>
            </>
          )}
        </button>

      </div>

    </div>
  );
};
