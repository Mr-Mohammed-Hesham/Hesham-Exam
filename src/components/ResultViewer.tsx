import React, { useState, useEffect } from "react";
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
  HelpCircle,
  Rocket,
  Globe,
  FolderArchive,
  Edit3,
  Save,
  Loader2,
  AlertTriangle,
  Undo,
  Calculator,
  BarChart2,
  Beaker,
  Zap,
  Layers
} from "lucide-react";
import { ExamGenerationResult } from "../types";
import { PublishModal } from "./PublishModal";
import { downloadExamZip, validateExamCode } from "../services/examPublisher";

interface ResultViewerProps {
  result: ExamGenerationResult;
  onUpdateResult?: (updatedResult: ExamGenerationResult) => void;
}

export const ResultViewer: React.FC<ResultViewerProps> = ({
  result,
  onUpdateResult,
}) => {
  const [activeTab, setActiveTab] = useState<"preview" | "questions" | "code">("preview");
  const [copied, setCopied] = useState(false);
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [previewKey, setPreviewKey] = useState(0);

  // Publishing & Editing States
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [isDownloadingZip, setIsDownloadingZip] = useState(false);
  const [isEditingCode, setIsEditingCode] = useState(false);
  const [editableCode, setEditableCode] = useState(result.generatedCode);
  const [codeEditNotice, setCodeEditNotice] = useState<string | null>(null);

  // Sync editable code when result changes
  useEffect(() => {
    setEditableCode(result.generatedCode);
    setCodeEditNotice(null);
  }, [result.generatedCode]);

  const isWebCode = result.detectedLanguage.toLowerCase().includes("html") || 
                    result.generatedCode.trim().toLowerCase().startsWith("<!doctype") ||
                    result.generatedCode.trim().toLowerCase().startsWith("<html");

  // Default to code tab if not an HTML web page
  useEffect(() => {
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

  // Direct ZIP download handler
  const handleQuickDownloadZip = async () => {
    try {
      setIsDownloadingZip(true);
      const val = validateExamCode(result.generatedCode);
      if (!val.isValid) {
        alert("تعذر تصدير الحزمة:\n" + val.errors.join("\n"));
        return;
      }
      await downloadExamZip({ result });
    } catch (err: any) {
      console.error("Direct zip download error:", err);
      alert(err?.message || "تعذر تنزيل حزمة الـ ZIP.");
    } finally {
      setIsDownloadingZip(false);
    }
  };

  // Save edited code and update preview
  const handleApplyCodeEdits = () => {
    const val = validateExamCode(editableCode);
    if (!val.isValid) {
      alert("الكود غير صالح:\n" + val.errors.join("\n"));
      return;
    }

    if (onUpdateResult) {
      onUpdateResult({
        ...result,
        generatedCode: editableCode,
      });
    } else {
      result.generatedCode = editableCode;
    }

    setIsEditingCode(false);
    setPreviewKey((k) => k + 1);
    setCodeEditNotice("تم حفظ التعديلات وتحديث المعاينة بنجاح!");
    setTimeout(() => setCodeEditNotice(null), 3000);
  };

  const handleCancelCodeEdits = () => {
    setEditableCode(result.generatedCode);
    setIsEditingCode(false);
    setCodeEditNotice(null);
  };

  const codeBytes = new Blob([result.generatedCode]).size;
  const codeSizeKb = (codeBytes / 1024).toFixed(1);
  const codeLines = result.generatedCode.split("\n");
  const hasValidCode = result.generatedCode && result.generatedCode.trim().length > 50;

  return (
    <div id="results-section" className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
      
      {/* Banner Summary Header */}
      <div className="bg-gradient-to-r from-indigo-950/80 via-slate-900 to-purple-950/80 p-5 border-b border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
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

          {/* Prominent Publish & Quick Actions */}
          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            {hasValidCode && (
              <button
                id="btn-publish-exam-top"
                type="button"
                onClick={() => setIsPublishModalOpen(true)}
                className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 rounded-xl text-xs font-black flex items-center gap-2 shadow-lg shadow-amber-500/20 transition cursor-pointer active:scale-95"
                title="نشر الامتحان التفاعلي على GitHub Pages"
              >
                <Rocket className="w-4 h-4 text-slate-950" />
                <span>🚀 نشر الامتحان</span>
              </button>
            )}

            <button
              onClick={handleCopyCode}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? "تم النسخ!" : "نسخ الكود"}</span>
            </button>
            <button
              onClick={handleDownloadCode}
              className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-lg shadow-indigo-600/30 transition cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>تحميل ({result.suggestedFileName || "exam.html"})</span>
            </button>
          </div>
        </div>

        {/* View Tabs */}
        <div className="flex items-center gap-2 mt-5 pt-3 border-t border-slate-800/80 overflow-x-auto">
          {isWebCode && (
            <button
              onClick={() => setActiveTab("preview")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
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
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
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
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
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

      {/* ============================================================ */}
      {/* REQUIRED "النشر" SECTION (Publishing Module) */}
      {/* ============================================================ */}
      {hasValidCode && (
        <div className="p-4 sm:p-5 bg-slate-950/80 border-b border-slate-800">
          <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/30 to-slate-900 border border-indigo-900/40 shadow-inner">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              
              {/* Left Info Columns */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Rocket className="w-4 h-4 text-amber-400" />
                  <h4 className="text-sm font-bold text-white tracking-wide">
                    نشر وتوزيع الامتحان التفاعلي (GitHub Pages Ready)
                  </h4>
                  <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-mono">
                    Zero-Secrets
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-1">
                  <div className="p-2 rounded-xl bg-slate-950/80 border border-slate-800/80">
                    <span className="text-slate-400 block text-[11px] mb-0.5">📝 اسم الامتحان:</span>
                    <span className="font-semibold text-slate-200 truncate block">
                      {result.examTitle || "امتحان بدون عنوان"}
                    </span>
                  </div>

                  <div className="p-2 rounded-xl bg-slate-950/80 border border-slate-800/80">
                    <span className="text-slate-400 block text-[11px] mb-0.5">📄 اسم الملف:</span>
                    <span className="font-mono text-emerald-400 font-bold truncate block">
                      index.html
                    </span>
                  </div>

                  <div className="p-2 rounded-xl bg-slate-950/80 border border-slate-800/80">
                    <span className="text-slate-400 block text-[11px] mb-0.5">📦 حجم الكود:</span>
                    <span className="font-mono text-indigo-300 font-bold block">
                      {codeSizeKb} KB ({codeLines.length} سطر)
                    </span>
                  </div>

                  <div className="p-2 rounded-xl bg-slate-950/80 border border-slate-800/80">
                    <span className="text-slate-400 block text-[11px] mb-0.5">🌐 طريقة النشر:</span>
                    <span className="font-semibold text-amber-400 block truncate">
                      GitHub Pages (Actions)
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons: [ 🚀 نشر الامتحان ] [ 📦 تنزيل ZIP ] [ 📋 نسخ الكود ] */}
              <div className="flex items-center gap-2.5 shrink-0 flex-wrap sm:flex-nowrap">
                <button
                  id="btn-publish-exam-section"
                  type="button"
                  onClick={() => setIsPublishModalOpen(true)}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-black shadow-lg shadow-amber-500/20 transition flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                >
                  <Rocket className="w-4 h-4 text-slate-950" />
                  <span>🚀 نشر الامتحان</span>
                </button>

                <button
                  type="button"
                  onClick={handleQuickDownloadZip}
                  disabled={isDownloadingZip}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                  title="تنزيل حزمة النشر الجاهزة لـ GitHub كملف ZIP"
                >
                  {isDownloadingZip ? (
                    <Loader2 className="w-4 h-4 text-indigo-400 animate-spin" />
                  ) : (
                    <Download className="w-4 h-4 text-indigo-400" />
                  )}
                  <span>📦 تنزيل ZIP</span>
                </button>

                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                  title="نسخ كود الامتحان النهائي"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? "تم النسخ!" : "📋 نسخ الكود"}</span>
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* Tab 1: Live Sandbox Preview */}
      {activeTab === "preview" && isWebCode && (
        <div className="p-4 bg-slate-950">
          
          {/* Sandbox Controls Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl mb-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-slate-400">حجم شاشة العرض:</span>
              <button
                onClick={() => setPreviewDevice("desktop")}
                className={`p-1.5 rounded-lg transition cursor-pointer ${previewDevice === "desktop" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"}`}
                title="كمبيوتر (Desktop 100%)"
              >
                <Monitor className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPreviewDevice("tablet")}
                className={`p-1.5 rounded-lg transition cursor-pointer ${previewDevice === "tablet" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"}`}
                title="جهاز لوحي (Tablet 768px)"
              >
                <Tablet className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPreviewDevice("mobile")}
                className={`p-1.5 rounded-lg transition cursor-pointer ${previewDevice === "mobile" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"}`}
                title="هاتف ذكي (Mobile 380px)"
              >
                <Smartphone className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => setPreviewKey(k => k + 1)}
                className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center gap-1 cursor-pointer"
                title="إعادة تشغيل وتصفير الامتحان"
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span>إعادة تشغيل</span>
              </button>
              <button
                onClick={handleOpenInNewWindow}
                className="px-2.5 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 flex items-center gap-1 border border-indigo-500/30 cursor-pointer"
                title="فتح الامتحان في نافذة مستقلة كاملة"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>فتح في نافذة كاملة</span>
              </button>
              {hasValidCode && (
                <button
                  type="button"
                  onClick={() => setIsPublishModalOpen(true)}
                  className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 flex items-center gap-1 border border-amber-500/40 font-bold cursor-pointer"
                  title="نشر الامتحان التفاعلي على صفحة ويب خاصة"
                >
                  <Rocket className="w-3.5 h-3.5" />
                  <span>نشر الامتحان الآن</span>
                </button>
              )}
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
                sandbox="allow-scripts allow-modals allow-same-origin allow-forms"
                className="w-full h-[580px] border-0"
              />
            </div>
          </div>

        </div>
      )}

      {/* Tab 2: Generated Code Viewer & Editor */}
      {activeTab === "code" && (
        <div className="p-4 bg-slate-950">
          <div className="rounded-xl overflow-hidden border border-slate-800 bg-slate-950">
            {/* Top info and Edit Controls */}
            <div className="flex flex-wrap items-center justify-between px-4 py-2.5 bg-slate-900 border-b border-slate-800 text-xs text-slate-400 gap-2">
              <div className="flex items-center gap-2">
                <FileCode className="w-4 h-4 text-indigo-400" />
                <span className="font-mono text-slate-200">index.html</span>
                <span className="text-slate-600">|</span>
                <span className="font-mono text-slate-400">{codeLines.length} سطر • {codeSizeKb} KB</span>
              </div>

              <div className="flex items-center gap-2">
                {codeEditNotice && (
                  <span className="text-emerald-400 text-xs font-bold animate-fade-in">
                    {codeEditNotice}
                  </span>
                )}

                {!isEditingCode ? (
                  <button
                    type="button"
                    onClick={() => {
                      setEditableCode(result.generatedCode);
                      setIsEditingCode(true);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 font-semibold flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>تعديل الكود مباشرة</span>
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleCancelCodeEdits}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold flex items-center gap-1 transition cursor-pointer"
                    >
                      <Undo className="w-3.5 h-3.5" />
                      <span>إلغاء</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleApplyCodeEdits}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center gap-1.5 transition cursor-pointer shadow-md shadow-emerald-600/30"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>حفظ التعديلات وتحديث المعاينة</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Code Box or Live Textarea Editor */}
            {isEditingCode ? (
              <div className="p-2 bg-slate-950">
                <textarea
                  dir="ltr"
                  value={editableCode}
                  onChange={(e) => setEditableCode(e.target.value)}
                  className="w-full h-[550px] p-4 bg-slate-950 font-['Fira_Code',monospace] text-xs leading-relaxed text-emerald-300 border border-indigo-900/50 rounded-lg focus:outline-hidden focus:border-amber-500 resize-y"
                  placeholder="<!DOCTYPE html>..."
                />
              </div>
            ) : (
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
            )}
          </div>
        </div>
      )}

      {/* Tab 3: Extracted Questions Cards */}
      {activeTab === "questions" && (
        <div className="p-5 bg-slate-950">
          <div className="max-w-4xl mx-auto space-y-4">
            
            {/* Comprehensive Distribution Banner */}
            {result.extractedQuestions && result.extractedQuestions.length > 0 && (
              <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 shadow-md">
                <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2 text-slate-200 font-bold">
                    <Layers className="w-4 h-4 text-amber-400" />
                    <span>توزيع أسئلة الامتحان الشامل:</span>
                    <span className="text-slate-400 font-normal">({result.extractedQuestions.length} أسئلة متنوعة)</span>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-300 border border-amber-500/30 font-semibold text-[11px]">
                      <Calculator className="w-3 h-3 text-amber-400" />
                      <span>مسائل وقوانين</span>
                    </span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-purple-500/10 text-purple-300 border border-purple-500/30 font-semibold text-[11px]">
                      <BarChart2 className="w-3 h-3 text-purple-400" />
                      <span>دوال ورسوم بيانية</span>
                    </span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 font-semibold text-[11px]">
                      <Beaker className="w-3 h-3 text-cyan-400" />
                      <span>تجارب عملية وجداول</span>
                    </span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 font-semibold text-[11px]">
                      <Zap className="w-3 h-3 text-emerald-400" />
                      <span>استنتاج تفاعلي</span>
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 gap-4">
              {result.extractedQuestions && result.extractedQuestions.length > 0 ? (
                result.extractedQuestions.map((q, idx) => {
                  const isGraph = q.category === "function_and_graph" || Boolean(q.diagramSvg);
                  const isPractical = q.category === "practical_and_table" || Boolean(q.tableHtml);
                  const isInteractive = q.category === "interactive_reasoning";
                  
                  const categoryLabel = q.categoryLabel || (
                    isGraph ? "دالة وعلاقة بيانية وتناسب" :
                    isPractical ? "تجربة عملية وجدول قياسات" :
                    isInteractive ? "استنتاج وتطبيق تفاعلي" :
                    "مسألة حسابية وتطبيق قانون"
                  );

                  return (
                    <div
                      key={idx}
                      className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden space-y-3.5"
                    >
                      {/* Top Header: Number, Category, Formula, Points */}
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="w-7 h-7 rounded-lg bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                            {q.number || idx + 1}
                          </span>
                          
                          {/* Category Badge */}
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${
                            isGraph ? "bg-purple-950/40 text-purple-300 border-purple-500/40" :
                            isPractical ? "bg-cyan-950/40 text-cyan-300 border-cyan-500/40" :
                            isInteractive ? "bg-emerald-950/40 text-emerald-300 border-emerald-500/40" :
                            "bg-amber-950/40 text-amber-300 border-amber-500/40"
                          }`}>
                            {isGraph && <BarChart2 className="w-3 h-3 text-purple-400" />}
                            {isPractical && <Beaker className="w-3 h-3 text-cyan-400" />}
                            {isInteractive && <Zap className="w-3 h-3 text-emerald-400" />}
                            {!isGraph && !isPractical && !isInteractive && <Calculator className="w-3 h-3 text-amber-400" />}
                            <span>{categoryLabel}</span>
                          </span>

                          {/* Law or Formula Badge */}
                          {q.lawOrFormula && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-800/90 text-amber-300 border border-amber-500/30 text-xs font-mono font-bold" dir="ltr">
                              <span>📐</span>
                              <span>{q.lawOrFormula}</span>
                            </span>
                          )}
                        </div>

                        {q.points && (
                          <span className="text-xs px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 font-bold">
                            {q.points} درجات
                          </span>
                        )}
                      </div>

                      {/* Question Text */}
                      <div className="text-sm sm:text-base font-bold text-white leading-relaxed">
                        <div 
                          dangerouslySetInnerHTML={{ 
                            __html: q.questionAr || q.question 
                          }} 
                        />
                      </div>

                      {/* Inline Diagram SVG if present */}
                      {q.diagramSvg && (
                        <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-center overflow-x-auto">
                          <div dangerouslySetInnerHTML={{ __html: q.diagramSvg }} />
                        </div>
                      )}

                      {/* Inline Data Table HTML if present */}
                      {q.tableHtml && (
                        <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 overflow-x-auto">
                          <div dangerouslySetInnerHTML={{ __html: q.tableHtml }} />
                        </div>
                      )}

                      {/* Options */}
                      {q.options && q.options.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                          {q.options.map((opt, optIdx) => {
                            const isCorrect = q.correctAnswer !== undefined && (
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
                                    ? "bg-emerald-950/50 border-emerald-500/70 text-emerald-200 font-semibold"
                                    : "bg-slate-950 border-slate-800 text-slate-300"
                                }`}
                              >
                                <span dangerouslySetInnerHTML={{ __html: opt }} />
                                {isCorrect && (
                                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-bold shrink-0">
                                    الإجابة الصحيحة ✓
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Explanation / Rationale */}
                      {(q.explanationAr || q.explanation) && (
                        <div className="p-3.5 rounded-xl bg-indigo-950/30 border border-indigo-900/50 text-xs text-indigo-300 flex items-start gap-2.5">
                          <Sparkles className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                          <div className="space-y-1">
                            <strong className="block text-indigo-200">خطوات البرهان والشرح العلمي:</strong>
                            <div 
                              className="text-slate-300 leading-relaxed font-sans"
                              dangerouslySetInnerHTML={{ 
                                __html: q.explanationAr || q.explanation || "" 
                              }} 
                            />
                          </div>
                        </div>
                      )}

                    </div>
                  );
                })
              ) : (
                <div className="text-center py-12 text-slate-400">
                  <HelpCircle className="w-12 h-12 mx-auto mb-3 text-slate-600" />
                  <p>لا توجد أسئلة مستخرجة بشكل منفصل، تم تضمين الأسئلة مباشرة داخل الكود.</p>
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* Publish Confirmation Modal */}
      <PublishModal
        isOpen={isPublishModalOpen}
        onClose={() => setIsPublishModalOpen(false)}
        result={result}
      />

    </div>
  );
};
