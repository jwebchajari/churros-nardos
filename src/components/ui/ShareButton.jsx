"use client";
import { Share2 } from "lucide-react";
import { whatsappShareUrl } from "@/lib/site";

/**
 * Comparte el link de una página del sitio. En el celular abre el menú nativo de compartir
 * (WhatsApp, Instagram, etc.); donde no existe, abre WhatsApp con el texto y el link.
 * La URL se arma con el dominio desde el que se está viendo el sitio, así la vista previa
 * (og:image de esa página) siempre apunta al deploy real.
 */
export default function ShareButton({ title, text, path = "/", label = "Compartir", compact = false, className = "btn btn-ghost" }) {
  async function share(e) {
    e.stopPropagation();
    const url = new URL(path, window.location.origin).href;
    if (typeof navigator.share === "function") {
      try {
        await navigator.share({ title, text, url });
        return;
      } catch (err) {
        if (err?.name === "AbortError") return;
      }
    }
    window.open(whatsappShareUrl(`${text}\n${url}`), "_blank", "noopener,noreferrer");
  }

  return (
    <button type="button" className={className} onClick={share} aria-label={compact ? `Compartir ${title}` : undefined}>
      <Share2 size={18} aria-hidden="true" />
      {compact ? null : label}
    </button>
  );
}
