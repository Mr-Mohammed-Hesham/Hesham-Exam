import React from "react";
import { GraduationCap, Heart, Sparkles, ShieldCheck } from "lucide-react";

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-[#070a12] border-t border-slate-800/80 py-8 mt-12 text-slate-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
        
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold">
            <GraduationCap className="w-4 h-4" />
          </div>
          <div>
            <p className="text-slate-200 font-bold text-sm">
              Hesham Exam Platform | منصة مستر محمد هشام
            </p>
            <p className="text-[11px] text-slate-400">
              النظام الأكاديمي الذكي المعتمد لتوليد الامتحانات التفاعلية من الأوراق والملفات
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-[11px] text-slate-400">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>نظام تصحيح إلكتروني فوري</span>
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>مدعوم بالذكاء الاصطناعي</span>
          </span>
          <span>•</span>
          <span>جميع الحقوق محفوظة © {new Date().getFullYear()}</span>
        </div>

      </div>
    </footer>
  );
};
