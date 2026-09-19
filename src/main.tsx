import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

// Register PWA service worker and capture early install prompt
if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    (window as any).__pwaInstallPrompt = e;
  });
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("./sw.js").catch((err) => {
        console.debug("Service Worker registration bypassed:", err);
      });
    });
  }
}

const rootElement = document.getElementById("root");

if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}

