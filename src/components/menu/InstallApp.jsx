"use client";
import { useEffect, useState, useSyncExternalStore } from "react";
import { Download } from "lucide-react";
import s from "./menu.module.css";

const noop = () => () => {};

// "standalone" (ya instalada), "ios" (instalación manual desde Safari) u "other". null en el servidor.
function platform() {
  const standalone = window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;
  if (standalone) return "standalone";
  return /iphone|ipad|ipod/i.test(navigator.userAgent) ? "ios" : "other";
}

/** Oferta discreta de instalar la app (sin popup). Registra el service worker. */
export default function InstallApp() {
  const env = useSyncExternalStore(noop, platform, () => null);
  const [prompt, setPrompt] = useState(null);
  const [installed, setInstalled] = useState(false);
  const [showIosHelp, setShowIosHelp] = useState(false);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      if (process.env.NODE_ENV === "production") {
        navigator.serviceWorker.register("/sw.js", { scope: "/", updateViaCache: "none" }).catch(() => {});
      } else {
        // En desarrollo se quita cualquier service worker de una prueba de producción previa.
        navigator.serviceWorker.getRegistrations().then((regs) => regs.forEach((r) => r.unregister())).catch(() => {});
        if ("caches" in window) caches.keys().then((keys) => keys.forEach((k) => caches.delete(k))).catch(() => {});
      }
    }
    const onPrompt = (e) => {
      e.preventDefault();
      setPrompt(e);
    };
    const onInstalled = () => {
      setInstalled(true);
      setPrompt(null);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const ios = env === "ios";
  if (installed || env === null || env === "standalone" || (!prompt && !ios)) return null;

  return (
    <div className={s.install}>
      <button
        type="button"
        className={s.installBtn}
        onClick={async () => {
          if (prompt) {
            prompt.prompt();
            await prompt.userChoice.catch(() => null);
            setPrompt(null);
          } else {
            setShowIosHelp((v) => !v);
          }
        }}
        aria-expanded={ios && !prompt ? showIosHelp : undefined}
      >
        <Download size={16} aria-hidden /> Instalá la app de Nardo’s
      </button>
      {showIosHelp ? <p className="hint">En Safari tocá Compartir y después &quot;Agregar a inicio&quot;.</p> : null}
    </div>
  );
}
