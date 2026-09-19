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

export function getCustomBackendUrl(): string {
  if (typeof window === "undefined") return "";
  try {
    return localStorage.getItem(CUSTOM_BACKEND_STORAGE_KEY) || "";
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
      localStorage.setItem(CUSTOM_BACKEND_STORAGE_KEY, url.trim().replace(/\/$/, ""));
    }
  } catch (err) {
    console.warn("Failed to update custom backend URL:", err);
  }
}

export function isRunningOnGitHubPages(): boolean {
  if (typeof window === "undefined") return false;
  return window.location.hostname.includes("github.io");
}

export function getApiBaseUrl(): string {
  // 1. User-specified custom backend URL (e.g. deployed Cloud Run or server)
  const customUrl = getCustomBackendUrl();
  if (customUrl) {
    return customUrl;
  }

  // 2. Build-time environment variable
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl && typeof envUrl === "string" && envUrl.trim()) {
    return envUrl.trim().replace(/\/$/, "");
  }

  // 3. For GitHub Pages without custom backend, relative path won't hit dev container directly
  // It will attempt the request or trigger seamless client generator
  if (isRunningOnGitHubPages()) {
    return "";
  }

  // 4. Default relative path for local dev and AI Studio preview
  return "";
}

export const API_ROUTES = {
  generateExamCode: () => {
    const base = getApiBaseUrl();
    return base ? `${base}/api/generate-exam-code` : "/api/generate-exam-code";
  },
  health: () => {
    const base = getApiBaseUrl();
    return base ? `${base}/api/health` : "/api/health";
  },
};
