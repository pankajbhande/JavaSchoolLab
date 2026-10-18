import { toast } from "sonner";

/**
 * Registers /sw.js in production builds only (never under `vite dev`) and shows a toast when a
 * new version is waiting. Accepting it tells the waiting worker to skipWaiting, then reloads.
 */
export function registerServiceWorker(): void {
  if (!import.meta.env.PROD || typeof window === "undefined" || !("serviceWorker" in navigator)) {
    return;
  }

  let reloading = false;
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (reloading) return;
    reloading = true;
    window.location.reload();
  });

  const promptUpdate = (worker: ServiceWorker) => {
    toast("Update available", {
      id: "pwa-update",
      duration: Infinity,
      action: { label: "Reload", onClick: () => worker.postMessage({ type: "SKIP_WAITING" }) },
    });
  };

  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then((reg) => {
        // A worker may already be waiting from an earlier visit.
        if (reg.waiting && navigator.serviceWorker.controller) promptUpdate(reg.waiting);
        reg.addEventListener("updatefound", () => {
          const worker = reg.installing;
          if (!worker) return;
          worker.addEventListener("statechange", () => {
            if (worker.state === "installed" && navigator.serviceWorker.controller) promptUpdate(worker);
          });
        });
      })
      .catch((err) => console.warn("Service worker registration failed", err));
  });
}
