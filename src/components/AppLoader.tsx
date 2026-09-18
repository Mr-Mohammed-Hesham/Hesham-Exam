import React from "react";
import { Loader2, Sparkles, BrainCircuit } from "lucide-react";

interface AppLoaderProps {
  message?: string;
  submessage?: string;
}

export const AppLoader: React.FC<AppLoaderProps> = ({
  message = "جاري الاتصال بالنظام وبدء محرك الامتحانات الذكية...",
  submessage = "منظومة السجلات والامتحانات الأكاديمية والذكاء الاصطناعي",
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#090d16]/90 backdrop-blur-md px-4">
      <div className="text-center max-w-md w-full bg-slate-900/90 border border-slate-800 p-8 rounded-2xl shadow-2xl space-y-5">
        <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-amber-500/20 animate-ping opacity-75" />
          <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center text-slate-950 shadow-lg shadow-amber-500/20">
            <BrainCircuit className="w-8 h-8 animate-pulse" />
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-lg font-bold text-white leading-snug">
            {message}
          </h3>
          {submessage && (
            <p className="text-xs text-slate-400">
              {submessage}
            </p>
          )}
        </div>

        <div className="flex items-center justify-center gap-2 text-xs text-amber-400 font-medium">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>يرجى الانتظار قليلاً...</span>
        </div>
      </div>
    </div>
  );
};
