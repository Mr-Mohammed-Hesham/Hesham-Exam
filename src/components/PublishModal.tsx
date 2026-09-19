import React, { useState, useEffect } from "react";
import {
  Rocket,
  Download,
  Copy,
  Check,
  AlertTriangle,
  Globe,
  Github,
  FolderArchive,
  FileCode,
  CheckCircle2,
  X,
  ExternalLink,
  Terminal,
  Clock,
  HelpCircle,
  Loader2,
  Settings2,
} from "lucide-react";
import { ExamGenerationResult } from "../types";
import {
  generateRepositorySlug,
  validateExamCode,
  getSavedGitHubUsername,
  saveGitHubUsername,
  downloadExamZip,
  createExamPublishPackage,
  DEFAULT_GITHUB_USERNAME,
} from "../services/examPublisher";

export type PublishState =
  | "idle"
  | "preparing"
  | "validating"
  | "ready"
  | "publishing"
  | "success"
  | "error";

interface PublishModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: ExamGenerationResult;
  onExamPublished?: (details: {
    repositoryName: string;
    githubUsername: string;
    pagesUrl: string;
  }) => void;
}

export const PublishModal: React.FC<PublishModalProps> = ({
  isOpen,
  onClose,
  result,
  onExamPublished,
}) => {
  const [githubUsername, setGithubUsername] = useState<string>(
    getSavedGitHubUsername()
  );
  const [repositorySlug, setRepositorySlug] = useState<string>("");
  const [publishState, setPublishState] = useState<PublishState>("idle");
  const [statusMessage, setStatusMessage] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [validationWarnings, setValidationWarnings] = useState<string[]>([]);
  const [copiedCommands, setCopiedCommands] = useState<boolean>(false);
  const [copiedUrl, setCopiedUrl] = useState<boolean>(false);
  const [showAdvancedSettings, setShowAdvancedSettings] = useState<boolean>(false);

  // Initialize slug and validate when opening
  useEffect(() => {
    if (isOpen && result) {
      const slug = generateRepositorySlug(result.examTitle);
      setRepositorySlug(slug);
      setPublishState("idle");
      setErrorMessage(null);
      setValidationWarnings([]);
      setStatusMessage("");
    }
  }, [isOpen, result]);

  if (!isOpen) return null;

  const targetPagesUrl = `https://${githubUsername.toLowerCase()}.github.io/${repositorySlug}/`;
  const githubRepoUrl = `https://github.com/${githubUsername}/${repositorySlug}`;
  const questionsCount = result.extractedQuestions?.length || 0;
  const codeSizeKb = (new Blob([result.generatedCode]).size / 1024).toFixed(1);

  const gitBashCommands = `# 1. فك ضغط ملف الـ ZIP ثم افتح المجلد في Terminal:
cd ${repositorySlug}

# 2. تهيئة المستودع وربطه بحسابك على GitHub:
git init
git add .
git commit -m "Add interactive exam: ${result.examTitle.replace(/"/g, "")}"
git branch -M main
git remote add origin https://github.com/${githubUsername}/${repositorySlug}.git
git push -u origin main`;

  const handleCopyCommands = () => {
    navigator.clipboard.writeText(gitBashCommands);
    setCopiedCommands(true);
    setTimeout(() => setCopiedCommands(false), 2000);
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(targetPagesUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const handleSaveUsername = (value: string) => {
    const clean = value.replace(/[^\w-]/g, "");
    setGithubUsername(clean);
    saveGitHubUsername(clean);
  };

  const handleSlugChange = (value: string) => {
    const clean = value
      .toLowerCase()
      .replace(/[^\w-]/g, "")
      .replace(/[\s_]+/g, "-");
    setRepositorySlug(clean);
  };

  // Step 1 & 2: Validate code
  const runValidation = (): boolean => {
    setPublishState("validating");
    setStatusMessage("🔍 جاري التحقق من سلامة وصلاحية كود الامتحان...");
    const val = validateExamCode(result.generatedCode);

    if (!val.isValid) {
      setPublishState("error");
      setErrorMessage(val.errors.join(" • "));
      return false;
    }

    setValidationWarnings(val.warnings);
    return true;
  };

  // Handler for Direct Download of ZIP Package
  const handleDownloadZipOnly = async () => {
    try {
      setErrorMessage(null);
      if (!runValidation()) return;

      setPublishState("preparing");
      setStatusMessage("📦 جاري تجهيز حزمة النشر المعتمدة (ZIP)...");

      await new Promise((r) => setTimeout(r, 400));

      await downloadExamZip({
        result,
        githubUsername,
        repositoryName: repositorySlug,
      });

      setPublishState("success");
      setStatusMessage("✅ تم تجهيز وتنزيل حزمة الامتحان المستقل (ZIP) بنجاح!");

      if (onExamPublished) {
        onExamPublished({
          repositoryName: repositorySlug,
          githubUsername,
          pagesUrl: targetPagesUrl,
        });
      }
    } catch (err: any) {
      console.error("ZIP packaging error:", err);
      setPublishState("error");
      setErrorMessage(err?.message || "تعذر تجهيز ملفات الامتحان.");
    }
  };

  // Handler for "🚀 نشر" Button
  const handlePublishProcess = async () => {
    try {
      setErrorMessage(null);
      if (!runValidation()) return;

      setPublishState("preparing");
      setStatusMessage("⏳ جاري تجهيز الامتحان وهيكلة مستودع GitHub Pages...");
      await new Promise((r) => setTimeout(r, 400));

      setPublishState("publishing");
      setStatusMessage("🚀 جاري بناء وتصدير حزمة الـ Repository الكاملة...");
      await new Promise((r) => setTimeout(r, 500));

      // Trigger download of the complete ready repository
      await downloadExamZip({
        result,
        githubUsername,
        repositoryName: repositorySlug,
      });

      setPublishState("success");
      setStatusMessage("✅ تم إنشاء وتصدير حزمة النشر بنجاح! ارفع الملفات إلى مستودعك ليعمل الرابط تلقائياً.");

      if (onExamPublished) {
        onExamPublished({
          repositoryName: repositorySlug,
          githubUsername,
          pagesUrl: targetPagesUrl,
        });
      }
    } catch (err: any) {
      console.error("Publishing error:", err);
      setPublishState("error");
      setErrorMessage(err?.message || "تعذر إتمام عملية النشر. تحقق من الكود.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-auto">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 bg-gradient-to-r from-indigo-950/90 via-slate-900 to-amber-950/60 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Rocket className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                <span>نشر الامتحان على GitHub Pages</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold">
                  مستقل 100%
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                تحويل الامتحان التفاعلي إلى موقع ويب فوري للطلاب عبر GitHub Actions
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            title="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 space-y-4 max-h-[75vh] overflow-y-auto scrollbar-thin">
          
          {/* Confirmation Card */}
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3">
            <div className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
              <span>هل تريد نشر هذا الامتحان كصفحة تفاعلية مستقلة؟</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800/80">
                <span className="text-slate-400 block text-[11px] mb-0.5">📝 اسم الامتحان:</span>
                <span className="font-bold text-slate-100 truncate block">
                  {result.examTitle || "امتحان بدون عنوان"}
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800/80">
                <span className="text-slate-400 block text-[11px] mb-0.5">📄 الملف الرئيسي:</span>
                <span className="font-mono text-emerald-400 font-bold">index.html ({codeSizeKb} KB)</span>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800/80">
                <span className="text-slate-400 block text-[11px] mb-0.5">❓ عدد الأسئلة:</span>
                <span className="font-bold text-indigo-300">{questionsCount} أسئلة مفصلة</span>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800/80">
                <span className="text-slate-400 block text-[11px] mb-0.5">⏱️ تقدير الوقت:</span>
                <span className="font-bold text-slate-200">محدد داخل الامتحان</span>
              </div>
            </div>
          </div>

          {/* Repository & GitHub Config */}
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Github className="w-4 h-4 text-slate-400" />
                <span>المستودع المقترح (Repository Slug):</span>
              </label>

              <button
                type="button"
                onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
                className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
              >
                <Settings2 className="w-3.5 h-3.5" />
                <span>{showAdvancedSettings ? "إخفاء الإعدادات" : "تعديل الحساب"}</span>
              </button>
            </div>

            {showAdvancedSettings && (
              <div className="p-3 rounded-lg bg-slate-900 border border-indigo-900/50 space-y-2 text-xs">
                <label className="block text-slate-400 text-[11px]">
                  اسم المستخدم أو المؤسسة على GitHub (GitHub Username / Org):
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-slate-500 font-mono">github.com/</span>
                  <input
                    type="text"
                    value={githubUsername}
                    onChange={(e) => handleSaveUsername(e.target.value)}
                    placeholder={DEFAULT_GITHUB_USERNAME}
                    className="flex-1 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 font-mono text-xs focus:outline-hidden focus:border-indigo-500"
                  />
                </div>
                <p className="text-[10px] text-slate-400">
                  يتم حفظ هذا الاسم تلقائياً ليتم استخدامه في روابط النشر القادمة دون الحاجة لأي كلمات سر أو توكن.
                </p>
              </div>
            )}

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={repositorySlug}
                onChange={(e) => handleSlugChange(e.target.value)}
                placeholder="physics-grade12-exam"
                className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 font-mono text-xs focus:outline-hidden focus:border-amber-500"
              />
              <button
                type="button"
                onClick={() => setRepositorySlug(generateRepositorySlug(result.examTitle))}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold shrink-0"
                title="إعادة التوليد التلقائي لاسم المستودع"
              >
                تحديث
              </button>
            </div>

            {/* Target Public Exam URL */}
            <div className="p-3 rounded-xl bg-indigo-950/40 border border-indigo-500/30 flex items-center justify-between gap-2">
              <div className="min-w-0">
                <span className="text-[10px] text-indigo-300 font-bold block mb-0.5 flex items-center gap-1">
                  <Globe className="w-3 h-3 text-indigo-400" />
                  رابط الامتحان المباشر بعد النشر (GitHub Pages URL):
                </span>
                <span className="font-mono text-xs text-white block truncate select-all">
                  {targetPagesUrl}
                </span>
              </div>

              <button
                type="button"
                onClick={handleCopyUrl}
                className="p-1.5 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 shrink-0 transition"
                title="نسخ الرابط"
              >
                {copiedUrl ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Validation Warnings if any */}
          {validationWarnings.length > 0 && (
            <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-800/80 text-amber-200 text-xs flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                {validationWarnings.map((w, idx) => (
                  <p key={idx}>{w}</p>
                ))}
              </div>
            </div>
          )}

          {/* Status Bar */}
          {statusMessage && (
            <div
              className={`p-3 rounded-xl text-xs flex items-center gap-2.5 transition-all ${
                publishState === "success"
                  ? "bg-emerald-950/60 border border-emerald-700/80 text-emerald-200"
                  : publishState === "error"
                  ? "bg-rose-950/60 border border-rose-700/80 text-rose-200"
                  : "bg-indigo-950/60 border border-indigo-700/80 text-indigo-200"
              }`}
            >
              {publishState === "publishing" || publishState === "preparing" || publishState === "validating" ? (
                <Loader2 className="w-4 h-4 text-amber-400 animate-spin shrink-0" />
              ) : publishState === "success" ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              )}
              <span className="font-medium leading-relaxed">{statusMessage}</span>
            </div>
          )}

          {/* Error Message */}
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-950/70 border border-rose-700 text-rose-200 text-xs">
              <strong>خطأ: </strong>
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Repository Package Blueprint */}
          <div className="p-3.5 rounded-xl bg-slate-950/90 border border-slate-800 text-xs space-y-2">
            <span className="font-bold text-slate-300 block flex items-center gap-1.5">
              <FolderArchive className="w-4 h-4 text-amber-400" />
              <span>محتويات حزمة الامتحان المستقلة (Exam Repository Structure):</span>
            </span>
            <div className="font-mono text-[11px] text-slate-400 bg-slate-900/90 p-2.5 rounded-lg border border-slate-800/80 space-y-1">
              <div className="text-amber-300 font-bold">📁 {repositorySlug}/</div>
              <div className="pl-4 text-emerald-300">├── 📄 index.html <span className="text-slate-500">(كود الامتحان التفاعلي الكامل والمراجع)</span></div>
              <div className="pl-4 text-sky-300">├── 📄 README.md <span className="text-slate-500">(توثيق الامتحان والروابط وطريقة التشغيل)</span></div>
              <div className="pl-4 text-purple-300">└── 📁 .github/workflows/deploy.yml <span className="text-slate-500">(أكشن النشر الآلي لـ GitHub Pages)</span></div>
            </div>
          </div>

          {/* Instructions & Git Deployment */}
          {publishState === "success" && (
            <div className="p-4 rounded-xl bg-slate-900/90 border border-emerald-500/40 space-y-3 animate-fade-in">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                  <Terminal className="w-4 h-4 text-emerald-400" />
                  <span>خطوات نشر المستودع على GitHub (خلال 30 ثانية):</span>
                </span>
                <button
                  type="button"
                  onClick={handleCopyCommands}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-semibold flex items-center gap-1 border border-slate-700"
                >
                  {copiedCommands ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCommands ? "تم النسخ!" : "نسخ الأوامر"}</span>
                </button>
              </div>

              <div className="text-xs text-slate-300 space-y-2">
                <p>
                  <strong>الخيار 1 (الأسهل عبر المتصفح):</strong>
                  {" "}أنشئ مستودعاً جديداً باسم <code className="text-amber-400 font-mono bg-slate-950 px-1.5 py-0.5 rounded">{repositorySlug}</code> على{" "}
                  <a
                    href="https://github.com/new"
                    target="_blank"
                    rel="noreferrer"
                    className="text-indigo-400 hover:underline inline-flex items-center gap-0.5 font-bold"
                  >
                    GitHub New Repo <ExternalLink className="w-3 h-3" />
                  </a>
                  {" "}ثم اسحب محتويات ملف الـ ZIP وفك الضغط وارفعها مباشرة.
                </p>

                <p>
                  <strong>الخيار 2 (عبر سطر الأوامر Git):</strong>
                </p>
                <pre dir="ltr" className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-[11px] font-mono text-slate-300 overflow-x-auto leading-relaxed select-all">
                  {gitBashCommands}
                </pre>
              </div>

              <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-[11px] text-amber-200">
                💡 <strong>ملاحظة هامة:</strong> بعد أول Push، ادخل على إعدادات المستودع <code>Settings &gt; Pages</code> وتأكد من اختيار <code>GitHub Actions</code> كمصدر للنشر وسيعمل الرابط تلقائياً!
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 sm:p-5 bg-slate-950 border-t border-slate-800">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>نظام نشر آمن 100% بدون أي Tokens أو أسرار</span>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={handleDownloadZipOnly}
              disabled={publishState === "publishing" || publishState === "preparing"}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Download className="w-4 h-4 text-indigo-400" />
              <span>📦 تنزيل ZIP</span>
            </button>

            <button
              type="button"
              onClick={handlePublishProcess}
              disabled={publishState === "publishing" || publishState === "preparing"}
              className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-black shadow-lg shadow-amber-500/20 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {publishState === "publishing" || publishState === "preparing" ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                  <span>جاري التجهيز...</span>
                </>
              ) : (
                <>
                  <Rocket className="w-4 h-4 text-slate-950" />
                  <span>🚀 نشر</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
