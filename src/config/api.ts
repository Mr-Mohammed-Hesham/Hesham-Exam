/**
 * Hesham Exam API Configuration
 * 
 * Determines the correct backend endpoint:
 * - If user configured a custom backend URL (stored in localStorage): uses that.
 * - If VITE_API_URL is set at build time: uses that.
 * - When running in local dev or AI Studio container: uses relative path /api/*.
 * - When running on GitHub Pages without a custom backend: uses Standalone Client Engine
 *   (bypassing private dev container CORS blocks).
 */

export const CUSTOM_BACKEND_STORAGE_KEY = "hesham_custom_backend_url";
export const GEMINI_API_KEY_STORAGE_KEY = "hesham_gemini_api_key";

export function getGeminiApiKey(): string {
  if (typeof window === "undefined") return "";
  try {
    const custom = localStorage.getItem(GEMINI_API_KEY_STORAGE_KEY) || "";
    if (custom.trim()) return custom.trim();
  } catch {}
  return (import.meta.env.VITE_GEMINI_API_KEY || "").trim();
}

export function setGeminiApiKey(key: string): void {
  if (typeof window === "undefined") return;
  try {
    if (!key || !key.trim()) {
      localStorage.removeItem(GEMINI_API_KEY_STORAGE_KEY);
    } else {
      localStorage.setItem(GEMINI_API_KEY_STORAGE_KEY, key.trim());
    }
  } catch (err) {
    console.warn("Failed to update Gemini API key:", err);
  }
}

export function getCustomBackendUrl(): string {
  if (typeof window === "undefined") return "";
  try {
    const saved = localStorage.getItem(CUSTOM_BACKEND_STORAGE_KEY) || "";
    // Automatically purge internal dev container URLs which cannot accept external CORS
    if (
      saved.includes("ais-dev-") ||
      saved.includes("-dev-") ||
      saved.includes("googleusercontent.com")
    ) {
      localStorage.removeItem(CUSTOM_BACKEND_STORAGE_KEY);
      return "";
    }
    return saved;
  } catch {
    return "";
  }
}

export function setCustomBackendUrl(url: string): void {
  if (typeof window === "undefined") return;
  try {
    if (!url || !url.trim()) {
      localStorage.removeItem(CUSTOM_BACKEND_STORAGE_KEY);
    } else {
      const clean = url.trim().replace(/\/$/, "");
      if (
        clean.includes("ais-dev-") ||
        clean.includes("-dev-") ||
        clean.includes("googleusercontent.com")
      ) {
        // Do not allow setting internal dev URLs on external origins
        localStorage.removeItem(CUSTOM_BACKEND_STORAGE_KEY);
      } else {
        localStorage.setItem(CUSTOM_BACKEND_STORAGE_KEY, clean);
      }
    }
  } catch (err) {
    console.warn("Failed to update custom backend URL:", err);
  }
}

export function isRunningOnGitHubPages(): boolean {
  if (typeof window === "undefined") return false;
  return window.location.hostname.includes("github.io");
}

export function isExternalOrigin(): boolean {
  if (typeof window === "undefined") return false;
  const host = window.location.hostname.toLowerCase();
  // Any origin outside the direct container host
  return (
    host.includes("github.io") ||
    (!host.includes("localhost") &&
      !host.includes("127.0.0.1") &&
      !host.includes("europe-west2.run.app") &&
      !host.includes("run.app") &&
      !host.includes("google.com"))
  );
}

export function getApiBaseUrl(): string {
  // 1. User-specified custom backend URL (e.g. deployed Cloud Run or custom server)
  const customUrl = getCustomBackendUrl();
  if (customUrl) {
    return customUrl;
  }

  // 2. Build-time environment variable (ignore if it's an internal dev URL on external origin)
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl && typeof envUrl === "string" && envUrl.trim()) {
    const trimmed = envUrl.trim().replace(/\/$/, "");
    if (isExternalOrigin() && (trimmed.includes("ais-dev-") || trimmed.includes("run.app"))) {
      return "";
    }
    return trimmed;
  }

  // 3. For local dev / AI Studio container, return empty for relative path
  return "";
}

export const API_ROUTES = {
  shouldUseClientEngineDirectly: (): boolean => {
    const customUrl = getCustomBackendUrl();
    const envUrl = getApiBaseUrl();
    // On external sites without a working backend API, use client/direct engine
    return (isRunningOnGitHubPages() || isExternalOrigin()) && !customUrl && !envUrl;
  },
  generateExamCode: () => {
    const base = getApiBaseUrl();
    return base ? `${base}/api/generate-exam-code` : "/api/generate-exam-code";
  },
  health: () => {
    const base = getApiBaseUrl();
    return base ? `${base}/api/health` : "/api/health";
  },
};
