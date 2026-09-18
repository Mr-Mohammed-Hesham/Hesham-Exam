import React, { useState } from "react";
import { 
  Play, 
  Code2, 
  ListChecks, 
  Copy, 
  Check, 
  Download, 
  ExternalLink, 
  RotateCw, 
  Smartphone, 
  Monitor, 
  Tablet, 
  CheckCircle2, 
  Sparkles,
  FileCode,
  HelpCircle
} from "lucide-react";
import { ExamGenerationResult } from "../types";

interface ResultViewerProps {
  result: ExamGenerationResult;
}

export const ResultViewer: React.FC<ResultViewerProps> = ({
  result,
}) => {
  const [activeTab, setActiveTab] = useState<"preview" | "questions" | "code">("preview");
  const [copied, setCopied] = useState(false);
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [previewKey, setPreviewKey] = useState(0);

  const isWebCode = result.detectedLanguage.toLowerCase().includes("html") || 
                    result.generatedCode.trim().toLowerCase().startsWith("<!doctype") ||
                    result.generatedCode.trim().toLowerCase().startsWith("<html");

  // Default to code tab if not an HTML web page
  React.useEffect(() => {
    if (!isWebCode && activeTab === "preview") {
      setActiveTab("code");
    }
  }, [isWebCode, activeTab]);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(result.generatedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadCode = () => {
    const blob = new Blob([result.generatedCode], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = result.suggestedFileName || `exam_${Date.now()}.${result.detectedLanguage || "html"}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleOpenInNewWindow = () => {
    if (!isWebCode) return;
    const newWindow = window.open();
    if (newWindow) {
      newWindow.document.open();
      newWindow.document.write(result.generatedCode);
      newWindow.document.close();
    }
  };

  const codeLines = result.generatedCode.split("\n");

  return (
    <div id="results-section" className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
      
      {/* Banner Summary Header */}
      <div className="bg-gradient-to-r from-indigo-950/80 via-slate-900 to-purple-950/80 p-5 border-b border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                تم التوليد بنجاح
              </span>
              <span className="px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-mono">
                {result.detectedLanguage.toUpperCase()}
              </span>
              <span className="px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-mono">
                {result.extractedQuestions?.length || 0} {result.generationMode === "generate_new_similar" ? "أسئلة جديدة مبتكرة" : "أسئلة"}
              </span>
              {result.generationMode === "generate_new_similar" && (
                <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  على نفس شاكلة ونمط الصورة
                </span>
              )}
            </div>
            <h3 className="text-xl font-black text-white">
              {result.examTitle || "امتحان جديد متطابق مع التمبلت"}
            </h3>
            <p className="text-xs text-slate-300 mt-1 max-w-3xl leading-relaxed">
              {result.summary}
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleCopyCode}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? "تم نسخ الكود!" : "نسخ الكود"}</span>
            </button>
            <button
              onClick={handleDownloadCode}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-lg shadow-indigo-600/30 transition"
            >
              <Download className="w-4 h-4" />
              <span>تحميل الملف ({result.suggestedFileName || "exam.code"})</span>
            </button>
          </div>
        </div>

        {/* View Tabs */}
        <div className="flex items-center gap-2 mt-5 pt-3 border-t border-slate-800/80 overflow-x-auto">
          {isWebCode && (
            <button
              onClick={() => setActiveTab("preview")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                activeTab === "preview"
                  ? "bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/20"
                  : "bg-slate-950/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800"
              }`}
            >
              <Play className="w-3.5 h-3.5" />
              <span>المعاينة التفاعلية المباشرة (حل وتجربة الامتحان)</span>
            </button>
          )}

          <button
            onClick={() => setActiveTab("questions")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === "questions"
                ? "bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/20"
                : "bg-slate-950/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800"
            }`}
          >
            <ListChecks className="w-3.5 h-3.5" />
            <span>بنك الأسئلة والحلول النموذجية ({result.extractedQuestions?.length || 0})</span>
          </button>

          <button
            onClick={() => setActiveTab("code")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === "code"
                ? "bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/20"
                : "bg-slate-950/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800"
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>كود وتصدير ملف الامتحان ({codeLines.length} سطر)</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Live Sandbox Preview */}
      {activeTab === "preview" && isWebCode && (
        <div className="p-4 bg-slate-950">
          
          {/* Sandbox Controls Bar */}
          <div className="flex items-center justify-between px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl mb-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-slate-400">حجم شاشة العرض:</span>
              <button
                onClick={() => setPreviewDevice("desktop")}
                className={`p-1.5 rounded-lg transition ${previewDevice === "desktop" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"}`}
                title="كمبيوتر (Desktop 100%)"
              >
                <Monitor className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPreviewDevice("tablet")}
                className={`p-1.5 rounded-lg transition ${previewDevice === "tablet" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"}`}
                title="جهاز لوحي (Tablet 768px)"
              >
                <Tablet className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPreviewDevice("mobile")}
                className={`p-1.5 rounded-lg transition ${previewDevice === "mobile" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"}`}
                title="هاتف ذكي (Mobile 380px)"
              >
                <Smartphone className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setPreviewKey(k => k + 1)}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center gap-1"
                title="إعادة تشغيل وتصفير الامتحان"
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span>إعادة تشغيل</span>
              </button>
              <button
                onClick={handleOpenInNewWindow}
                className="px-2.5 py-1 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 flex items-center gap-1 border border-indigo-500/30"
                title="فتح الامتحان في نافذة مستقلة كاملة"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>فتح في نافذة كاملة</span>
              </button>
            </div>
          </div>

          {/* Sandboxed iFrame */}
          <div className="flex justify-center bg-slate-950 min-h-[560px] rounded-xl overflow-hidden border border-slate-800 p-2">
            <div 
              className={`transition-all duration-300 bg-white rounded-xl overflow-hidden shadow-2xl ${
                previewDevice === "desktop" ? "w-full" : previewDevice === "tablet" ? "w-[768px]" : "w-[380px]"
              }`}
            >
              <iframe
                key={previewKey}
                title="Hesham Exam Live Sandbox"
                srcDoc={result.generatedCode}
                sandbox="allow-scripts allow-modals"
                className="w-full h-[560px] border-0"
              />
            </div>
          </div>

        </div>
      )}

      {/* Tab 2: Generated Code Viewer */}
      {activeTab === "code" && (
        <div className="p-4 bg-slate-950">
          <div className="rounded-xl overflow-hidden border border-slate-800 bg-slate-950">
            {/* Top info */}
            <div className="flex items-center justify-between px-4 py-2 bg-slate-900 border-b border-slate-800 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <FileCode className="w-4 h-4 text-indigo-400" />
                <span className="font-mono text-slate-200">{result.suggestedFileName}</span>
              </div>
              <span className="font-mono text-slate-500">{codeLines.length} سطر • جاهز للاستخدام الفوري</span>
            </div>

            {/* Code Box */}
            <div className="p-4 overflow-x-auto max-h-[600px] scrollbar-thin">
              <pre dir="ltr" className="font-['Fira_Code',monospace] text-xs leading-relaxed text-slate-200">
                {codeLines.map((line, idx) => (
                  <div key={idx} className="table-row hover:bg-slate-900/60">
                    <span className="table-cell pr-4 text-right select-none text-slate-600 text-[11px] font-mono w-10">
                      {idx + 1}
                    </span>
                    <span className="table-cell whitespace-pre">{line || " "}</span>
                  </div>
                ))}
              </pre>
            </div>
          </div>
        </div>
      )}



      {/* Tab 4: Extracted Questions Cards */}
      {activeTab === "questions" && (
        <div className="p-5 bg-slate-950">
          <div className="grid grid-cols-1 gap-4 max-w-4xl mx-auto">
            {result.extractedQuestions && result.extractedQuestions.length > 0 ? (
              result.extractedQuestions.map((q, idx) => (
                <div
                  key={idx}
                  className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden"
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-7 h-7 rounded-lg bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">
                        {q.number || idx + 1}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                        {q.type?.toUpperCase() || "سؤال"}
                      </span>
                      {q.points && (
                        <span className="text-xs px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30">
                          {q.points} درجات
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Question Text */}
                  <h4 className="text-sm sm:text-base font-bold text-white mb-4 leading-relaxed">
                    {q.question}
                  </h4>

                  {/* Options */}
                  {q.options && q.options.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
                      {q.options.map((opt, optIdx) => {
                        const isCorrect = q.correctAnswer && (
                          q.correctAnswer.toString().toLowerCase().includes(opt.toLowerCase()) ||
                          q.correctAnswer.toString() === optIdx.toString() ||
                          (q.correctAnswer.toString().toUpperCase() === "A" && optIdx === 0) ||
                          (q.correctAnswer.toString().toUpperCase() === "B" && optIdx === 1) ||
                          (q.correctAnswer.toString().toUpperCase() === "C" && optIdx === 2) ||
                          (q.correctAnswer.toString().toUpperCase() === "D" && optIdx === 3)
                        );
                        return (
                          <div
                            key={optIdx}
                            className={`p-3 rounded-xl border text-xs font-medium flex items-center justify-between ${
                              isCorrect
                                ? "bg-emerald-950/40 border-emerald-500/60 text-emerald-200 font-semibold"
                                : "bg-slate-950 border-slate-800 text-slate-300"
                            }`}
                          >
                            <span>{opt}</span>
                            {isCorrect && (
                              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                                الإجابة الصحيحة ✓
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Explanation / Rationale */}
                  {q.explanation && (
                    <div className="p-3 rounded-xl bg-indigo-950/30 border border-indigo-900/40 text-xs text-indigo-300 flex items-start gap-2">
                      <Sparkles className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                      <div>
                        <strong className="block text-indigo-200 mb-0.5">الشرح والتبرير العلمي:</strong>
                        <span>{q.explanation}</span>
                      </div>
                    </div>
                  )}

                </div>
              ))
            ) : (
              <div className="text-center py-12 text-slate-400">
                <HelpCircle className="w-12 h-12 mx-auto mb-3 text-slate-600" />
                <p>لا توجد أسئلة مستخرجة بشكل منفصل، تم تضمين الأسئلة مباشرة داخل الكود.</p>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
