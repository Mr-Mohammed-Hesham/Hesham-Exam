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

  // 2. Build-time environment variable
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl && typeof envUrl === "string" && envUrl.trim()) {
    return envUrl.trim().replace(/\/$/, "");
  }

  // 3. For GitHub Pages or external static sites without a custom backend,
  // do NOT point to a private dev container URL that requires internal Google cookies.
  // Instead, return empty so the client engine or same-origin endpoint is used.
  return "";
}

export const API_ROUTES = {
  shouldUseClientEngineDirectly: (): boolean => {
    const customUrl = getCustomBackendUrl();
    const envUrl = import.meta.env.VITE_API_URL;
    // On external sites without a designated backend API, use client engine directly to prevent CORS failures
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
