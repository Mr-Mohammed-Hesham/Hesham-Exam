import React, { useState, useEffect } from "react";
import { 
  Key, 
  Server, 
  Check, 
  X, 
  ExternalLink, 
  AlertCircle, 
  CheckCircle2, 
  RotateCcw,
  Sparkles,
  ShieldCheck
} from "lucide-react";
import { 
  getGeminiApiKey, 
  setGeminiApiKey, 
  getCustomBackendUrl, 
  setCustomBackendUrl,
  isRunningOnGitHubPages,
  isExternalOrigin
} from "../config/api";

interface ApiConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved?: () => void;
}

export const ApiConfigModal: React.FC<ApiConfigModalProps> = ({
  isOpen,
  onClose,
  onSaved,
}) => {
  const [apiKey, setApiKey] = useState("");
  const [backendUrl, setBackendUrl] = useState("");
  const [isSaved, setIsSaved] = useState(false);
  const [testStatus, setTestStatus] = useState<"idle" | "testing" | "success" | "error">("idle");
  const [testMessage, setTestMessage] = useState("");

  useEffect(() => {
    if (isOpen) {
      setApiKey(getGeminiApiKey());
      setBackendUrl(getCustomBackendUrl());
      setIsSaved(false);
      setTestStatus("idle");
      setTestMessage("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (backendUrl.trim().includes("github.io")) {
      setTestStatus("error");
      setTestMessage(
        "تنبيه: GitHub Pages هي استضافة صفحات ثابتة وليست خادماً برمجياً (Backend). لاستخدام الذكاء الاصطناعي على GitHub Pages، اترك خانة الخادم فارغة وضع مفتاح Gemini API في الخانة الأولى بالأعلى."
      );
      return;
    }

    setGeminiApiKey(apiKey);
    setCustomBackendUrl(backendUrl);
    setIsSaved(true);
    if (onSaved) onSaved();
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 1200);
  };

  const handleClear = () => {
    setApiKey("");
    setBackendUrl("");
    setGeminiApiKey("");
    setCustomBackendUrl("");
    setTestStatus("idle");
    setTestMessage("");
  };

  const handleTestGemini = async () => {
    if (!apiKey || !apiKey.trim()) {
      setTestStatus("error");
      setTestMessage("الرجاء إدخال مفتاح Gemini API أولاً لإجراء الفحص.");
      return;
    }

    setTestStatus("testing");
    setTestMessage("جاري اختبار الاتصال بمحرك Gemini 3.8 Flash...");

    const modelsToTest = [
      "gemini-3.8-flash",
      "gemini-flash-latest",
      "gemini-3.1-flash-lite",
      "gemini-2.5-flash-preview-12-2025",
    ];

    let success = false;
    let successfulModel = "";
    let lastErr = "";

    for (const model of modelsToTest) {
      try {
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(
          apiKey.trim()
        )}`;

        const res = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ role: "user", parts: [{ text: "ping" }] }],
            generationConfig: { maxOutputTokens: 10 },
          }),
        });

        if (res.ok) {
          success = true;
          successfulModel = model;
          break;
        } else {
          const data = await res.json().catch(() => ({}));
          lastErr = data.error?.message || `HTTP ${res.status}`;
        }
      } catch (err: any) {
        lastErr = err.message || String(err);
      }
    }

    if (success) {
      setTestStatus("success");
      setTestMessage(`✅ تم الاتصال بنجاح بمحرك (${successfulModel})! المفتاح جاهز للتوليد من الصور والنصوص فوراً.`);
    } else {
      setTestStatus("error");
      setTestMessage(`❌ فشل الاتصال بالمفتاح: ${lastErr}`);
    }
  };

  const isGitHub = isRunningOnGitHubPages();
  const isExternal = isExternalOrigin();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden text-right"
        dir="rtl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>إعدادات الذكاء الاصطناعي والربط الخارجي</span>
                {(isGitHub || isExternal) && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-bold">
                    موقع خارجي (GitHub Pages)
                  </span>
                )}
              </h3>
              <p className="text-xs text-slate-400">
                قم بتهيئة مفتاح Gemini المجاني أو خادمك الخاص للعمل في أي بيئة دون أخطاء CORS
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          
          {/* GitHub Pages / External Notice */}
          {(isGitHub || isExternal) && (
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs leading-relaxed flex items-start gap-3">
              <Sparkles className="w-5 h-5 shrink-0 text-amber-400 mt-0.5" />
              <div>
                <p className="font-bold mb-1">
                  أنت تعمل على موقع خارجي ثابت ({typeof window !== "undefined" ? window.location.hostname : "GitHub Pages"}):
                </p>
                <p className="text-slate-300">
                  لتمكين استخراج الأسئلة من الصور عبر الذكاء الاصطناعي مباشرة من المتصفح بدون الحاجة لخادم، ضع مفتاح <strong className="text-amber-300">Gemini API المجاني</strong> أدناه. أو يمكنك كتابة نص الامتحان مباشرة لتوليد أسئلته فوراً.
                </p>
              </div>
            </div>
          )}

          {/* Section 1: Gemini API Key */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-200 flex items-center gap-2">
                <Key className="w-3.5 h-3.5 text-amber-400" />
                <span>مفتاح Google Gemini API (مجاني)</span>
              </label>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-amber-400 hover:underline flex items-center gap-1 font-semibold"
              >
                <span>الحصول على مفتاح مجاني</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="relative">
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full px-4 py-2.5 bg-slate-950/80 border border-slate-700/80 rounded-xl text-white text-xs font-mono placeholder:text-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
              />
            </div>
            <p className="text-[11px] text-slate-400">
              يُحفظ المفتاح محلياً في متصفحك فقط ويُستخدم للاتصال المباشر الآمن بـ Google Generative AI.
            </p>

            {/* Test Button */}
            <div className="pt-1 flex items-center gap-3">
              <button
                type="button"
                onClick={handleTestGemini}
                disabled={testStatus === "testing" || !apiKey.trim()}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
              >
                {testStatus === "testing" ? (
                  <>
                    <div className="w-3 h-3 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                    <span>جاري الفحص...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>فحص صلاحية المفتاح</span>
                  </>
                )}
              </button>
            </div>

            {/* Test Result Message */}
            {testMessage && (
              <div
                className={`p-3 rounded-xl text-xs font-medium ${
                  testStatus === "success"
                    ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/30"
                    : testStatus === "error"
                    ? "bg-rose-500/10 text-rose-300 border border-rose-500/30"
                    : "bg-slate-800/60 text-slate-300 border border-slate-700"
                }`}
              >
                {testMessage}
              </div>
            )}
          </div>

          <div className="border-t border-slate-800 pt-4 space-y-2">
            <label className="text-xs font-bold text-slate-200 flex items-center gap-2">
              <Server className="w-3.5 h-3.5 text-sky-400" />
              <span>رابط خادم مخصص اختياري (Custom Backend URL)</span>
            </label>
            <input
              type="url"
              value={backendUrl}
              onChange={(e) => setBackendUrl(e.target.value)}
              placeholder="https://my-exam-backend.run.app (اختياري)"
              className="w-full px-4 py-2.5 bg-slate-950/80 border border-slate-700/80 rounded-xl text-white text-xs font-mono placeholder:text-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
            />
            <p className="text-[11px] text-slate-400">
              اتركه فارغاً إذا كنت تستخدم المحرك المباشر أو مفتاح Gemini المباشر.
            </p>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <button
            type="button"
            onClick={handleClear}
            className="px-3 py-2 text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 rounded-lg transition"
          >
            مسح البيانات المحفوظة
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition"
            >
              إلغاء
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-6 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs rounded-xl shadow-md transition flex items-center gap-1.5"
            >
              {isSaved ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>تم الحفظ!</span>
                </>
              ) : (
                <span>حفظ الإعدادات</span>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
