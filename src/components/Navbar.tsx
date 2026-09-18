import React from "react";
import { 
  Sparkles, 
  History, 
  HelpCircle, 
  RotateCcw, 
  GraduationCap,
  LogOut,
  LogIn,
  UserCheck
} from "lucide-react";
import { User } from "firebase/auth";

interface NavbarProps {
  onOpenHistory: () => void;
  onOpenHelp: () => void;
  onReset: () => void;
  historyCount: number;
  user: User | null;
  onSignIn: () => void;
  onSignOut: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenHistory,
  onOpenHelp,
  onReset,
  historyCount,
  user,
  onSignIn,
  onSignOut,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full bg-[#090d16]/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand / Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 via-amber-500 to-yellow-400 flex items-center justify-center text-slate-950 shadow-md shadow-amber-500/20 font-black">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base sm:text-lg font-black text-white tracking-wide">
                منصة مستر محمد هشام
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                Hesham Exam
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              توليد الامتحانات التفاعلية الذكية وحفظها سحابياً على Firebase
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          
          {/* User Account / Auth Section */}
          {user ? (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
              <div className="flex items-center gap-2 px-2.5 py-1 rounded-xl bg-slate-900/90 border border-slate-800 text-xs">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || "User"}
                    className="w-5 h-5 rounded-full object-cover border border-amber-500/40"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <UserCheck className="w-4 h-4 text-emerald-400" />
                )}
                <div className="text-right hidden md:block">
                  <div className="text-slate-200 font-bold text-[11px] leading-tight truncate max-w-[120px]">
                    {user.displayName || "مستخدم معتمد"}
                  </div>
                  <div className="text-slate-400 text-[9px] leading-tight truncate max-w-[120px]">
                    {user.email}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={onSignOut}
                className="p-1.5 rounded-xl bg-slate-900 hover:bg-rose-950/40 text-slate-400 hover:text-rose-300 border border-slate-800 hover:border-rose-800/80 transition"
                title="تسجيل الخروج"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={onSignIn}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition"
              title="تسجيل الدخول بحساب Google"
            >
              <LogIn className="w-4 h-4" />
              <span>تسجيل الدخول</span>
            </button>
          )}

          {/* History Button */}
          <button
            type="button"
            onClick={onOpenHistory}
            className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700/80 text-xs font-semibold transition"
            title="سجل الامتحانات السابقة في Firestore"
          >
            <History className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">السجل</span>
            {historyCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-slate-950 text-[10px] font-black">
                {historyCount}
              </span>
            )}
          </button>

          {/* Help Button */}
          <button
            type="button"
            onClick={onOpenHelp}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700/80 text-xs font-semibold transition"
            title="طريقة الاستخدام والمساعدة"
          >
            <HelpCircle className="w-4 h-4 text-sky-400" />
            <span className="hidden sm:inline">المساعدة</span>
          </button>

          {/* Reset Button */}
          <button
            type="button"
            onClick={onReset}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-rose-950/40 text-slate-200 hover:text-rose-300 border border-slate-700/80 hover:border-rose-800/80 text-xs font-semibold transition"
            title="بدء جلسة جديدة"
          >
            <RotateCcw className="w-4 h-4 text-slate-400" />
            <span className="hidden sm:inline">جلسة جديدة</span>
          </button>
        </div>

      </div>
    </header>
  );
};
