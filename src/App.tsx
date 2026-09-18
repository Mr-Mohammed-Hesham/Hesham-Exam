import React, { useState, useEffect } from "react";
import { Navbar } from "./components/Navbar";
import { ImageUploader } from "./components/ImageUploader";
import { GenerationOptions } from "./components/GenerationOptions";
import { ResultViewer } from "./components/ResultViewer";
import { CameraCaptureModal } from "./components/CameraCaptureModal";
import { HistoryModal } from "./components/HistoryModal";
import { HelpModal } from "./components/HelpModal";
import { AppLoader } from "./components/AppLoader";
import { Footer } from "./components/Footer";
import { ExamImage, ExamGenerationResult, GenerationHistoryItem, GenerationMode } from "./types";
import { AlertTriangle, Sparkles, CheckCircle2, ArrowDown } from "lucide-react";
import { API_ROUTES } from "./config/api";

export default function App() {
  // Initial App Loading State (from Records repository)
  const [appInitializing, setAppInitializing] = useState<boolean>(true);

  // State: Purely file and image-based workflow
  const [images, setImages] = useState<ExamImage[]>([]);
  
  const [examTitle, setExamTitle] = useState<string>("");
  const [solveQuestions, setSolveQuestions] = useState<boolean>(true);
  const [instructions, setInstructions] = useState<string>("");
  const [generationMode, setGenerationMode] = useState<GenerationMode>("generate_new_similar");
  const [questionCount, setQuestionCount] = useState<number>(7);
  const [durationMinutes, setDurationMinutes] = useState<number>(30);
  const [difficulty, setDifficulty] = useState<string>("same");

  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generationStep, setGenerationStep] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [currentResult, setCurrentResult] = useState<ExamGenerationResult | null>(null);

  // Modals
  const [isCameraOpen, setIsCameraOpen] = useState<boolean>(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);
  const [isHelpOpen, setIsHelpOpen] = useState<boolean>(false);

  // History from localStorage
  const [history, setHistory] = useState<GenerationHistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem("hesham_exam_history");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Save history to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("hesham_exam_history", JSON.stringify(history));
    } catch (e) {
      console.warn("Failed to persist history to localStorage", e);
    }
  }, [history]);

  // Initial loader matching Records repo experience
  useEffect(() => {
    const timer = setTimeout(() => {
      setAppInitializing(false);
    }, 650);
    return () => clearTimeout(timer);
  }, []);

  // Camera snap handler
  const handleCameraCapture = (imageDataUrl: string) => {
    const newImg: ExamImage = {
      id: `cam_${Date.now()}`,
      name: `صورة كاميرا_${images.length + 1}.jpg`,
      mimeType: "image/jpeg",
      data: imageDataUrl,
      previewUrl: imageDataUrl,
    };
    setImages((prev) => [...prev, newImg]);
  };

  // Main Generate Action - pure file/image based
  const handleGenerate = async () => {
    if (images.length === 0) {
      setErrorMsg("يرجى رفع صورة أو ملف الامتحان أولاً للبدء في التوليد.");
      return;
    }

    setIsGenerating(true);
    setErrorMsg(null);
    setGenerationStep("جاري قراءة واستخراج الأسئلة والمسائل من الملفات والصور المرفوعة...");

    const timer1 = setTimeout(() => {
      setGenerationStep("جاري صياغة الامتحان الإلكتروني وبنك الأسئلة وإعداد الخيارات والحلول النموذجية...");
    }, 2200);

    const timer2 = setTimeout(() => {
      setGenerationStep("جاري بناء وتجميع واجهة الامتحان التفاعلية مع المؤقت ونظام التصحيح الآلي...");
    }, 4500);

    try {
      const payload = {
        images: images.map((img) => ({
          mimeType: img.mimeType,
          data: img.data,
        })),
        instructions,
        solveQuestions,
        examTitle,
        generationMode,
        questionCount,
        durationMinutes,
        difficulty,
      };

      const endpoint = API_ROUTES.generateExamCode();
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      // Defensive check to avoid SyntaxError: Unexpected token '<' ... is not valid JSON
      const contentType = response.headers.get("content-type") || "";
      let data: any = null;

      if (contentType.includes("application/json")) {
        data = await response.json();
      } else {
        const textResp = await response.text();
        console.error("Non-JSON response from server:", textResp.slice(0, 300));
        throw new Error(
          `تعذر الاتصال بخادم التوليد الذكي (${response.status} ${response.statusText || ""}). تأكد من إتاحة خادم الـBackend أو إعداد رابط الـAPI.`
        );
      }

      if (!response.ok || !data.success) {
        throw new Error(data?.error || "فشل توليد الامتحان. يرجى المحاولة مرة أخرى.");
      }

      const res: ExamGenerationResult = {
        ...data.data,
        generatedAt: new Date().toISOString(),
      };

      setCurrentResult(res);

      // Add to history
      const historyItem: GenerationHistoryItem = {
        id: `gen_${Date.now()}`,
        timestamp: Date.now(),
        title: res.examTitle || "امتحان إلكتروني جديد",
        language: res.detectedLanguage || "html",
        questionsCount: res.extractedQuestions?.length || 0,
        result: res,
      };
      setHistory((prev) => [historyItem, ...prev.slice(0, 19)]); // keep last 20

      // Scroll smoothly to results
      setTimeout(() => {
        document.getElementById("results-section")?.scrollIntoView({ behavior: "smooth" });
      }, 300);

    } catch (err: any) {
      console.error("Generation error:", err);
      setErrorMsg(err?.message || "حدث خطأ غير متوقع أثناء توليد الامتحان.");
    } finally {
      clearTimeout(timer1);
      clearTimeout(timer2);
      setIsGenerating(false);
      setGenerationStep("");
    }
  };

  // Reset Session
  const handleReset = () => {
    if (window.confirm("هل تريد بدء جلسة جديدة وتصفير الملفات الحالية؟")) {
      setImages([]);
      setExamTitle("");
      setInstructions("");
      setCurrentResult(null);
      setErrorMsg(null);
    }
  };

  // History action handlers
  const handleSelectHistoryItem = (item: GenerationHistoryItem) => {
    setCurrentResult(item.result);
    setTimeout(() => {
      document.getElementById("results-section")?.scrollIntoView({ behavior: "smooth" });
    }, 200);
  };

  const handleClearHistory = () => {
    if (window.confirm("هل أنت متأكد من رغبتك في مسح سجل الامتحانات السابقة بالكامل؟")) {
      setHistory([]);
    }
  };

  const handleDeleteHistoryItem = (id: string) => {
    setHistory((prev) => prev.filter((item) => item.id !== id));
  };

  const canGenerate = images.length > 0;

  if (appInitializing) {
    return <AppLoader message="جاري الاتصال بالنظام وبدء محرك الامتحانات الذكية..." />;
  }

  return (
    <div className="min-h-screen bg-[#090d16] text-[#f1f5f9] flex flex-col font-['Cairo',sans-serif] selection:bg-amber-500 selection:text-slate-950">
      
      {/* Full screen loader when generating exam code */}
      {isGenerating && (
        <AppLoader
          message={generationStep || "جاري استخراج الأسئلة وتوليد الامتحان التفاعلي..."}
          submessage="منظومة السجلات والامتحانات الأكاديمية والذكاء الاصطناعي"
        />
      )}

      {/* Top Navbar */}
      <Navbar
        onOpenHistory={() => setIsHistoryOpen(true)}
        onOpenHelp={() => setIsHelpOpen(true)}
        onReset={handleReset}
        historyCount={history.length}
      />

      {/* Hero Banner with clean, high-contrast palette */}
      <section className="relative overflow-hidden pt-8 pb-6 border-b border-slate-800/80 bg-gradient-to-b from-slate-950 via-slate-900/40 to-slate-950">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(245,158,11,0.12),rgba(255,255,255,0))] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-300 text-xs font-bold shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>توليد فوري ومباشر من ملفات أو صور الامتحان فقط</span>
            </div>

            <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight">
              توليد امتحان تفاعلي كامل على نفس نوع أسئلة{" "}
              <span className="bg-gradient-to-r from-amber-400 via-orange-300 to-amber-200 bg-clip-text text-transparent">
                الصورة أو الملف مباشرة
              </span>
            </h2>

            <p className="text-sm text-slate-300 leading-relaxed max-w-3xl mx-auto">
              ارفع صورة ورقة امتحان، مذكرة، أو ملف (PDF / Word / صور)، وسيقوم النظام الذكي باستخراج الأسئلة أو ابتكار أسئلة جديدة مماثلة وتوليد امتحان إلكتروني تفاعلي متكامل جاهز للحل والتصحيح الفوري والتحميل.
            </p>
          </div>
        </div>
      </section>

      {/* Main Workbench Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Error Alert if any */}
        {errorMsg && (
          <div className="p-4 rounded-xl bg-rose-950/50 border border-rose-800 text-rose-200 text-xs flex items-center justify-between shadow-lg">
            <div className="flex items-center gap-2.5">
              <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
            <button
              onClick={() => setErrorMsg(null)}
              className="px-2 py-1 text-[11px] bg-rose-900/60 hover:bg-rose-900 rounded text-rose-300"
            >
              إغلاق
            </button>
          </div>
        )}

        {/* Dedicated File & Image Hub */}
        <div className="w-full">
          <ImageUploader
            images={images}
            onImagesChange={setImages}
            onOpenCamera={() => setIsCameraOpen(true)}
          />
        </div>

        {/* Generation Options & Action Button */}
        <GenerationOptions
          examTitle={examTitle}
          onExamTitleChange={setExamTitle}
          solveQuestions={solveQuestions}
          onSolveQuestionsChange={setSolveQuestions}
          instructions={instructions}
          onInstructionsChange={setInstructions}
          generationMode={generationMode}
          onGenerationModeChange={setGenerationMode}
          questionCount={questionCount}
          onQuestionCountChange={setQuestionCount}
          durationMinutes={durationMinutes}
          onDurationMinutesChange={setDurationMinutes}
          difficulty={difficulty}
          onDifficultyChange={setDifficulty}
          onGenerate={handleGenerate}
          isGenerating={isGenerating}
          canGenerate={canGenerate}
          generationStep={generationStep}
        />

        {/* Generation Output & Interactive Sandbox */}
        {currentResult && (
          <div className="pt-4">
            <ResultViewer
              result={currentResult}
            />
          </div>
        )}

      </main>

      {/* Footer from Records repository */}
      <Footer />

      {/* Modals */}
      <CameraCaptureModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={handleCameraCapture}
      />

      <HistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        onSelect={handleSelectHistoryItem}
        onClear={handleClearHistory}
        onDeleteOne={handleDeleteHistoryItem}
      />

      <HelpModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
      />

    </div>
  );
}
