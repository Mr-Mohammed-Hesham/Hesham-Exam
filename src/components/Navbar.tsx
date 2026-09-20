import React, { useState } from "react";
import { 
  Sparkles, 
  History, 
  HelpCircle, 
  RotateCcw, 
  GraduationCap,
  LogOut,
  LogIn,
  UserCheck,
  Download,
  Menu,
  X
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
  onInstall?: () => void;
  isAppInstalled?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenHistory,
  onOpenHelp,
  onReset,
  historyCount,
  user,
  onSignIn,
  onSignOut,
  onInstall,
  isAppInstalled = false,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full bg-[#090d16]/95 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand / Logo */}
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-xl p-0.5 bg-gradient-to-br from-amber-400 via-orange-500 to-amber-600 shadow-md shadow-amber-500/20 shrink-0 overflow-hidden">
            <img
              src={`${import.meta.env.BASE_URL}teacher-logo.jpg`}
              alt="Hesham Exam"
              title="Hesham Exam"
              className="w-full h-full object-cover rounded-[10px]"
              referrerPolicy="no-referrer"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                if (!target.src.endsWith("/teacher-logo.jpg")) {
                  target.src = "/teacher-logo.jpg";
                }
              }}
            />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="text-sm sm:text-lg font-black text-white tracking-wide font-sans truncate">
                Hesham Exam
              </span>
              <span className="text-[9px] sm:text-[10px] px-1.5 sm:px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30 whitespace-nowrap">
                Platform
              </span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-slate-400 hidden sm:block truncate">
              Interactive Examination System & Academic Assessment
            </p>
          </div>
        </div>

        {/* Desktop Actions (hidden on mobile, visible on sm+) */}
        <div className="hidden sm:flex items-center gap-2">
          
          {/* Direct Install PWA Button */}
          {!isAppInstalled && onInstall && (
            <button
              id="btn-install-pwa-header"
              type="button"
              onClick={onInstall}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-amber-500/30 hover:border-amber-500/60 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 font-bold text-xs transition-all shadow-xs cursor-pointer active:scale-95 shrink-0"
              title="تثبيت التطبيق مباشرة على الهاتف أو سطح المكتب"
            >
              <Download className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span>تثبيت التطبيق</span>
            </button>
          )}

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

              {/* Functional Sign Out Button */}
              <button
                id="btn-signout-desktop"
                type="button"
                onClick={onSignOut}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 hover:text-white border border-rose-800/60 hover:border-rose-700 text-xs font-semibold transition cursor-pointer shadow-xs active:scale-95"
                title="تسجيل الخروج من الحساب"
              >
                <LogOut className="w-3.5 h-3.5 text-rose-400" />
                <span className="hidden lg:inline">تسجيل الخروج</span>
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
            className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700/80 text-xs font-semibold transition cursor-pointer"
            title="سجل الامتحانات السابقة في Firestore"
          >
            <History className="w-4 h-4 text-amber-400" />
            <span>السجل</span>
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
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700/80 text-xs font-semibold transition cursor-pointer"
            title="طريقة الاستخدام والمساعدة"
          >
            <HelpCircle className="w-4 h-4 text-sky-400" />
            <span>المساعدة</span>
          </button>

          {/* Reset Button */}
          <button
            type="button"
            onClick={onReset}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700/80 text-xs font-semibold transition cursor-pointer"
            title="بدء جلسة جديدة"
          >
            <RotateCcw className="w-4 h-4 text-slate-400" />
            <span>جلسة جديدة</span>
          </button>
        </div>

        {/* Mobile Header Quick Actions & Menu Toggle */}
        <div className="flex sm:hidden items-center gap-1.5">
          {/* Quick Sign Out button directly on mobile header */}
          {user && (
            <button
              id="btn-signout-mobile-header"
              type="button"
              onClick={onSignOut}
              className="p-2 min-h-[40px] min-w-[40px] rounded-xl bg-rose-950/50 text-rose-300 border border-rose-800/80 flex items-center justify-center transition active:scale-95"
              title="تسجيل الخروج"
              aria-label="تسجيل الخروج"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}

          {/* Mobile Menu Toggle Button */}
          <button
            id="btn-mobile-menu-toggle"
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 min-h-[40px] min-w-[40px] rounded-xl bg-slate-900 text-slate-200 border border-slate-700 flex items-center justify-center transition active:scale-95"
            aria-label="القائمة"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5 text-amber-400" /> : <Menu className="w-5 h-5 text-slate-300" />}
          </button>
        </div>

      </div>

      {/* Mobile Drawer / Dropdown Menu */}
      {isMobileMenuOpen && (
        <div className="sm:hidden border-t border-slate-800 bg-[#090d16]/98 px-4 py-3 space-y-2.5 shadow-2xl animate-fadeIn">
          {user && (
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs">
              <div className="flex items-center gap-2">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || "User"}
                    className="w-7 h-7 rounded-full object-cover border border-amber-500/40"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <UserCheck className="w-5 h-5 text-emerald-400" />
                )}
                <div className="text-right">
                  <div className="text-slate-200 font-bold text-xs truncate max-w-[180px]">
                    {user.displayName || "مستخدم معتمد"}
                  </div>
                  <div className="text-slate-400 text-[10px] truncate max-w-[180px]">
                    {user.email}
                  </div>
                </div>
              </div>

              {/* Prominent Mobile Sign Out inside drawer */}
              <button
                type="button"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onSignOut();
                }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-rose-950/60 hover:bg-rose-900 text-rose-300 font-bold text-xs border border-rose-800 transition"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>تسجيل الخروج</span>
              </button>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2 pt-1">
            {/* History */}
            <button
              type="button"
              onClick={() => {
                setIsMobileMenuOpen(false);
                onOpenHistory();
              }}
              className="flex items-center justify-center gap-2 p-3 min-h-[44px] rounded-xl bg-slate-900 text-slate-200 border border-slate-800 text-xs font-semibold active:bg-slate-800 transition"
            >
              <History className="w-4 h-4 text-amber-400" />
              <span>السجل ({historyCount})</span>
            </button>

            {/* Help */}
            <button
              type="button"
              onClick={() => {
                setIsMobileMenuOpen(false);
                onOpenHelp();
              }}
              className="flex items-center justify-center gap-2 p-3 min-h-[44px] rounded-xl bg-slate-900 text-slate-200 border border-slate-800 text-xs font-semibold active:bg-slate-800 transition"
            >
              <HelpCircle className="w-4 h-4 text-sky-400" />
              <span>المساعدة</span>
            </button>
          </div>

          <div className="grid grid-cols-1 gap-2">
            {/* New Session */}
            <button
              type="button"
              onClick={() => {
                setIsMobileMenuOpen(false);
                onReset();
              }}
              className="flex items-center justify-center gap-2 p-3 min-h-[44px] rounded-xl bg-slate-900 text-slate-200 border border-slate-800 text-xs font-semibold active:bg-slate-800 transition"
            >
              <RotateCcw className="w-4 h-4 text-slate-400" />
              <span>جلسة جديدة (تصفير)</span>
            </button>

            {/* Install PWA if available */}
            {!isAppInstalled && onInstall && (
              <button
                type="button"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onInstall();
                }}
                className="flex items-center justify-center gap-2 p-3 min-h-[44px] rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold active:bg-amber-500/20 transition"
              >
                <Download className="w-4 h-4" />
                <span>تثبيت التطبيق على الهاتف</span>
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
