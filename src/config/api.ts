/**
 * Hesham Exam API Configuration
 * 
 * Determines the correct backend endpoint:
 * - When running on GitHub Pages (mr-mohammed-hesham.github.io):
 *   Routes to the active Google Cloud Run backend.
 * - When running in local dev or AI Studio container:
 *   Routes to relative path /api/*
 * - Can be overridden at build time via VITE_API_URL environment variable.
 */

export const DEFAULT_CLOUD_API_URL = "https://ais-dev-ztzoh22v25piqmda53fiyu-684462415759.europe-west2.run.app";

export function getApiBaseUrl(): string {
  // 1. Check if an explicit environment variable was injected during build
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl && typeof envUrl === "string" && envUrl.trim()) {
    return envUrl.trim().replace(/\/$/, "");
  }

  // 2. If running on GitHub Pages, fallback to the verified Google Cloud Run serverless endpoint
  if (typeof window !== "undefined") {
    const hostname = window.location.hostname;
    if (hostname.includes("github.io")) {
      return DEFAULT_CLOUD_API_URL;
    }
  }

  // 3. For local dev or inside AI Studio preview container, use relative path
  return "";
}

export const API_ROUTES = {
  generateExamCode: () => `${getApiBaseUrl()}/api/generate-exam-code`,
  health: () => `${getApiBaseUrl()}/api/health`,
};
