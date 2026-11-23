"use client";
import { useEffect } from "react";

/** Una visita por sesión de navegador. Ignora navegadores automatizados. */
export default function VisitTracker() {
  useEffect(() => {
    if (navigator.webdriver) return;
    try {
      if (sessionStorage.getItem("visita")) return;
      sessionStorage.setItem("visita", "1");
    } catch {
      return;
    }
    fetch("/api/locales/visitas", { method: "POST", keepalive: true }).catch(() => {});
  }, []);
  return null;
}
