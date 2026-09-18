import React, { useState, useRef, useEffect } from "react";
import { Camera, X, RefreshCw, AlertCircle, Check } from "lucide-react";

interface CameraCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (imageDataUrl: string) => void;
}

export const CameraCaptureModal: React.FC<CameraCaptureModalProps> = ({
  isOpen,
  onClose,
  onCapture,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("environment");
  const [hasCaptured, setHasCaptured] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      setHasCaptured(null);
      setError(null);
      return;
    }

    startCamera();

    return () => {
      stopCamera();
    };
  }, [isOpen, facingMode]);

  const startCamera = async () => {
    stopCamera();
    setError(null);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("المتصفح لا يدعم الوصول إلى الكاميرا بشكل مباشر.");
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facingMode,
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      });

      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err: any) {
      console.error("Camera access error:", err);
      // Try fallback without facingMode constraints
      try {
        const fallbackStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
        setStream(fallbackStream);
        if (videoRef.current) {
          videoRef.current.srcObject = fallbackStream;
        }
      } catch (fallbackErr: any) {
        setError(fallbackErr?.message || "تعذر فتح الكاميرا. يرجى التأكد من منح الإذن للمتصفح.");
      }
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  };

  const handleSnap = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;

    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;

    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL("image/jpeg", 0.92);
      setHasCaptured(dataUrl);
    }
  };

  const handleConfirm = () => {
    if (hasCaptured) {
      onCapture(hasCaptured);
      onClose();
    }
  };

  const handleRetake = () => {
    setHasCaptured(null);
    startCamera();
  };

  const toggleFacingMode = () => {
    setFacingMode((prev) => (prev === "user" ? "environment" : "user"));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden shadow-2xl flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-800 bg-slate-950/70">
          <div className="flex items-center gap-2 text-white font-bold text-sm">
            <Camera className="w-4 h-4 text-amber-400" />
            <span>التقاط صورة للامتحان عبر الكاميرا</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Camera Viewport */}
        <div className="relative bg-black min-h-[320px] max-h-[60vh] flex items-center justify-center overflow-hidden">
          {error ? (
            <div className="p-6 text-center space-y-3">
              <AlertCircle className="w-10 h-10 text-rose-400 mx-auto" />
              <p className="text-sm text-rose-200">{error}</p>
              <button
                onClick={startCamera}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold"
              >
                إعادة المحاولة
              </button>
            </div>
          ) : hasCaptured ? (
            <img
              src={hasCaptured}
              alt="Captured"
              className="max-h-[60vh] w-auto object-contain"
            />
          ) : (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full max-h-[60vh] object-contain"
            />
          )}

          <canvas ref={canvasRef} className="hidden" />
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between px-5 py-4 bg-slate-950/80 border-t border-slate-800">
          {!hasCaptured ? (
            <>
              <button
                type="button"
                onClick={toggleFacingMode}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
                title="تبديل الكاميرا الأمامية / الخلفية"
              >
                <RefreshCw className="w-4 h-4 text-slate-400" />
                <span>تبديل الكاميرا</span>
              </button>

              <button
                type="button"
                onClick={handleSnap}
                disabled={!!error || !stream}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/20 disabled:opacity-50 transition"
              >
                <Camera className="w-5 h-5" />
                <span>التقاط الصورة</span>
              </button>

              <div className="w-24" />
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={handleRetake}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
              >
                <RefreshCw className="w-4 h-4 text-slate-400" />
                <span>التقاط أخرى</span>
              </button>

              <button
                type="button"
                onClick={handleConfirm}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/20 transition"
              >
                <Check className="w-5 h-5" />
                <span>استخدام هذه الصورة</span>
              </button>
            </>
          )}
        </div>

      </div>
    </div>
  );
};
