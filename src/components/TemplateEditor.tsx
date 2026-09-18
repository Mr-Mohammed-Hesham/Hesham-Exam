import React, { useRef } from "react";
import { 
  Code, 
  Upload, 
  FileCode, 
  Copy, 
  Check, 
  RotateCcw, 
  Sparkles, 
  Layers 
} from "lucide-react";
import { CODE_TEMPLATES } from "../data/templates";
import { CodeTemplatePreset } from "../types";

interface TemplateEditorProps {
  selectedPresetId: string;
  onSelectPreset: (preset: CodeTemplatePreset) => void;
  templateCode: string;
  onTemplateCodeChange: (code: string) => void;
  templateLanguage: string;
  onTemplateLanguageChange: (lang: string) => void;
}

export const TemplateEditor: React.FC<TemplateEditorProps> = ({
  selectedPresetId,
  onSelectPreset,
  templateCode,
  onTemplateCodeChange,
  templateLanguage,
  onTemplateLanguageChange,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [copied, setCopied] = React.useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Detect language from extension
    const ext = file.name.split(".").pop()?.toLowerCase() || "";
    let lang = "javascript";
    if (ext === "py") lang = "python";
    else if (ext === "html" || ext === "htm") lang = "html";
    else if (ext === "tsx" || ext === "jsx" || ext === "ts" || ext === "js") lang = "typescript";
    else if (ext === "json") lang = "json";
    else if (ext === "md" || ext === "tex") lang = "markdown";

    onTemplateLanguageChange(lang);

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        onTemplateCodeChange(content);
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(templateCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const lineCount = templateCode.split("\n").length;

  return (
    <div className="flex flex-col h-full bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl">
      
      {/* Section Header */}
      <div className="flex flex-wrap items-center justify-between pb-3 mb-4 border-b border-slate-800/80 gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400 font-bold text-sm">
            2
          </div>
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span>كود الامتحان القديم (المصدر الحصري للشكل والهيكل والوظائف)</span>
              <span className="text-[11px] px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 font-normal font-mono">
                {templateLanguage.toUpperCase()}
              </span>
            </h2>
            <p className="text-xs text-slate-300">
              <strong className="text-purple-300 font-semibold">شكل ووظائف الكود القديم:</strong> طريقة عرض الامتحان مستوحاة بالكامل من هذا الكود، مع الاحتفاظ بجميع الوظائف والهيكلة والبرمجة وحذف أسئلته القديمة.
            </p>
          </div>
        </div>

        {/* Upload & Actions */}
        <div className="flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept=".html,.htm,.py,.js,.jsx,.ts,.tsx,.json,.md,.txt,.cpp,.java,.cs"
            className="hidden"
            onChange={handleFileUpload}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition"
            title="رفع ملف كود من جهازك (.html, .py, .tsx, .json)"
          >
            <Upload className="w-3.5 h-3.5 text-purple-400" />
            <span>رفع ملف كود</span>
          </button>
          <button
            type="button"
            onClick={handleCopy}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs transition"
            title="نسخ كود التمبلت"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Preset Selector Tabs */}
      <div className="mb-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 scrollbar-thin">
          {CODE_TEMPLATES.map((preset) => {
            const isSelected = selectedPresetId === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => onSelectPreset(preset)}
                className={`whitespace-nowrap px-3 py-1.5 rounded-lg text-xs font-medium border transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? "bg-purple-600 text-white border-purple-500 shadow-md shadow-purple-600/20"
                    : "bg-slate-950/60 text-slate-400 hover:text-slate-200 border-slate-800 hover:border-slate-700"
                }`}
              >
                <FileCode className="w-3 h-3" />
                <span>{preset.titleEn}</span>
              </button>
            );
          })}
          <button
            type="button"
            onClick={() => {
              onSelectPreset({
                id: "custom",
                title: "تمبلت كود مخصص",
                titleEn: "Custom Code",
                category: "Custom",
                language: "javascript",
                extension: "js",
                description: "تمبلت كود خاص بك مخصص بالكامل.",
                code: "",
              });
            }}
            className={`whitespace-nowrap px-3 py-1.5 rounded-lg text-xs font-medium border transition-all flex items-center gap-1.5 ${
              selectedPresetId === "custom"
                ? "bg-purple-600 text-white border-purple-500 shadow-md shadow-purple-600/20"
                : "bg-slate-950/60 text-slate-400 hover:text-slate-200 border-slate-800 hover:border-slate-700"
            }`}
          >
            <Code className="w-3 h-3" />
            <span>كود مخصص (فارغ)</span>
          </button>
        </div>
      </div>

      {/* Code Editor Container */}
      <div className="relative flex-1 flex flex-col min-h-[220px] rounded-xl overflow-hidden border border-slate-800 bg-slate-950">
        
        {/* Editor Top Bar */}
        <div className="flex items-center justify-between px-3 py-1.5 bg-slate-900/90 border-b border-slate-800 text-[11px] text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80 inline-block"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block"></span>
            <span className="mr-2 text-slate-400 font-mono">template.{templateLanguage}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-mono text-slate-500">{lineCount} سطر</span>
            <span className="font-mono text-slate-500">{templateCode.length} حرف</span>
          </div>
        </div>

        {/* Textarea */}
        <textarea
          dir="ltr"
          value={templateCode}
          onChange={(e) => onTemplateCodeChange(e.target.value)}
          placeholder="الصق كود الامتحان القديم هنا (HTML, Python, React, JSON, إلخ)..."
          className="flex-1 w-full p-3 font-['Fira_Code',monospace] text-xs leading-relaxed bg-transparent text-slate-200 resize-none focus:outline-none focus:ring-1 focus:ring-purple-500/50 selection:bg-purple-600 selection:text-white"
          spellCheck={false}
        />
      </div>

      {/* Footer info */}
      <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500">
        <span>سيحافظ الذكاء الاصطناعي على كافة الأنماط والوظائف مع استبدال الأسئلة فقط.</span>
        <button
          type="button"
          onClick={() => {
            const found = CODE_TEMPLATES.find((p) => p.id === selectedPresetId);
            if (found) onTemplateCodeChange(found.code);
          }}
          className="text-purple-400 hover:underline flex items-center gap-1"
        >
          <RotateCcw className="w-3 h-3" />
          <span>استعادة الكود الأصلي</span>
        </button>
      </div>

    </div>
  );
};
