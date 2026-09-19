import React, { useState } from "react";
import { signInWithPopup, signOut } from "firebase/auth";
import { auth, googleProvider } from "../config/firebase";
import { isEmailWhitelisted } from "../config/authWhitelist";
import { ShieldAlert, LogIn, Lock, Loader2 } from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose?: () => void;
  requireAuth?: boolean;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, requireAuth = true }) => {
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      // Enforce Whitelist Check
      if (!isEmailWhitelisted(user.email)) {
        const unauthorizedEmail = user.email || "الحساب غير معروف";
        await signOut(auth);
        setErrorMessage(
          `عذراً، هذا الحساب (${unauthorizedEmail}) غير مصرح له بالدخول. يُسمح فقط بحسابات المعلم المعتمدة.`
        );
      } else {
        // Successful authorized login
        if (onClose) {
          onClose();
        }
      }
    } catch (error: any) {
      console.error("Google Sign-In Error:", error);
      if (error.code === "auth/popup-closed-by-user" || error.code === "auth/cancelled-popup-request") {
        // user closed popup
      } else if (error.code === "auth/unauthorized-domain") {
        setErrorMessage("النطاق الحالي غير مصرح به في إعدادات Firebase Authentication.");
      } else {
        setErrorMessage(error.message || "تعذر إتمام تسجيل الدخول باستخدام Google.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl p-6 sm:p-8 text-center space-y-5">
        
        {/* Icon & Title */}
        <div className="mx-auto w-16 h-16 rounded-2xl p-0.5 bg-gradient-to-br from-amber-400 via-orange-500 to-amber-600 flex items-center justify-center overflow-hidden shadow-lg shadow-amber-500/20">
          <img
            src={`${import.meta.env.BASE_URL}teacher-logo.jpg`}
            alt="Mr Mohamed Hesham"
            className="w-full h-full object-cover rounded-[14px]"
            referrerPolicy="no-referrer"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              if (!target.src.endsWith("/teacher-logo.jpg")) {
                target.src = "/teacher-logo.jpg";
              }
            }}
          />
        </div>

        <div className="space-y-1.5">
          <h3 className="text-xl sm:text-2xl font-black text-white font-sans tracking-wide">
            Mr. Mohamed Hesham
          </h3>
          <div className="inline-block px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold text-xs border border-amber-500/30 uppercase font-sans">
            Exam Platform
          </div>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed pt-1">
            يرجى تسجيل الدخول بحساب Google المعتمد للوصول إلى المنصة
          </p>
        </div>

        {/* Security / Whitelist Notice */}
        <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-right space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
            <Lock className="w-3.5 h-3.5 shrink-0" />
            <span>نظام الحسابات المعتمدة</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-normal">
            الوصول إلى المنصة وإدارة الامتحانات مقتصر على حسابات المعلم المعتمدة.
          </p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-rose-950/70 border border-rose-800/80 text-rose-200 text-xs text-right animate-fadeIn flex items-start gap-2.5">
            <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span className="leading-relaxed font-medium flex-1">{errorMessage}</span>
          </div>
        )}

        {/* Google Sign-In Button */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 py-3.5 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-sm shadow-md transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer min-h-[46px]"
        >
          {loading ? (
            <div className="flex items-center gap-2 text-xs text-slate-700">
              <Loader2 className="w-4 h-4 animate-spin text-amber-600" />
              <span>جاري التحقق من الحساب...</span>
            </div>
          ) : (
            <>
              {/* Google G Logo SVG */}
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>تسجيل الدخول باستخدام Google</span>
            </>
          )}
        </button>

        {!requireAuth && onClose && (
          <button
            type="button"
            onClick={onClose}
            className="text-xs text-slate-400 hover:text-slate-200 transition p-1 cursor-pointer"
          >
            إغلاق النافذة
          </button>
        )}

      </div>
    </div>
  );
};
