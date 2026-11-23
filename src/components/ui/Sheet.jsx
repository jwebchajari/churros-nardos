"use client";
import { useEffect, useId, useRef } from "react";
import { X } from "lucide-react";
import s from "./ui.module.css";

/**
 * Bottom sheet en móvil y diálogo centrado desde 768 px, sobre <dialog> nativo
 * (foco atrapado, Escape y top layer gratis).
 */
export default function Sheet({ open, onClose, title, hideTitle = false, children, footer, wide = false, editor = false }) {
  const ref = useRef(null);
  const titleId = useId();

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  // Si el componente se desmonta abierto (navegación), cerrar el diálogo.
  useEffect(() => {
    const d = ref.current;
    return () => {
      if (d?.open) d.close();
    };
  }, []);

  return (
    <dialog
      ref={ref}
      className={`${s.sheet} ${wide ? s.sheetWide : ""} ${editor ? s.sheetEditor : ""}`}
      aria-labelledby={titleId}
      // El evento close llega después: si el diálogo ya se reabrió (Strict Mode, Activity), se ignora.
      onClose={() => open && !ref.current?.open && onClose?.()}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose?.();
      }}
    >
      <div className={s.sheetInner}>
        <header className={s.sheetHeader}>
          <h2 id={titleId} className={hideTitle ? "visually-hidden" : s.sheetTitle}>
            {title}
          </h2>
          <button type="button" className={s.iconBtn} onClick={() => onClose?.()} aria-label="Cerrar">
            <X size={22} aria-hidden />
          </button>
        </header>
        <div className={s.sheetBody}>{open ? children : null}</div>
        {footer && open ? <footer className={s.sheetFooter}>{footer}</footer> : null}
      </div>
    </dialog>
  );
}
