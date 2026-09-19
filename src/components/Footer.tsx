import React from "react";
import { GraduationCap, Heart, Sparkles, ShieldCheck } from "lucide-react";

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-[#070a12] border-t border-slate-800/80 py-8 mt-12 text-slate-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
        
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg p-0.5 bg-gradient-to-br from-amber-400 via-orange-500 to-amber-600 flex items-center justify-center overflow-hidden shrink-0 shadow-xs">
            <img
              src={`${import.meta.env.BASE_URL}teacher-logo.jpg`}
              alt="Mr Mohammed Hesham"
              className="w-full h-full object-cover rounded-[6px]"
              referrerPolicy="no-referrer"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                if (!target.src.endsWith("/teacher-logo.jpg")) {
                  target.src = "/teacher-logo.jpg";
                }
              }}
            />
          </div>
          <div>
            <p className="text-slate-200 font-bold text-sm tracking-wide font-sans">
              Mr. Mohamed Hesham | Exam Platform
            </p>
            <p className="text-[11px] text-slate-400">
              Interactive Examination System & Academic Assessment
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center md:justify-end gap-3 sm:gap-4 text-[11px] text-slate-400">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>نظام تصحيح إلكتروني فوري</span>
          </span>
          <span className="hidden sm:inline">•</span>
          <span className="flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>مدعوم بالذكاء الاصطناعي</span>
          </span>
          <span className="hidden sm:inline">•</span>
          <span>Mr. Mohamed Hesham © {new Date().getFullYear()}</span>
        </div>

      </div>
    </footer>
  );
};
