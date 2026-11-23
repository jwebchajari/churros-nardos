"use client";
import { useEffect, useRef, useState } from "react";
import { FEW_PRODUCTS } from "@/lib/menu-shared";
import s from "./menu.module.css";

/** Chips sticky con scrollspy: queda activa la sección que cruza el tercio superior. */
export default function CategoryNav({ groups }) {
  const [active, setActive] = useState(groups[0]?.id);
  const scroller = useRef(null);

  useEffect(() => {
    const sections = groups.map((g) => document.getElementById(`cat-${g.id}`)).filter(Boolean);
    if (sections.length === 0) return undefined;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(e.target.id.slice(4));
      },
      { rootMargin: "-33% 0px -66% 0px" }
    );
    sections.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [groups]);

  // Mantener el chip activo visible sin mover la página.
  useEffect(() => {
    const box = scroller.current;
    const chip = box?.querySelector(`[data-cat="${active}"]`);
    if (!box || !chip) return;
    const left = chip.offsetLeft - box.clientWidth / 2 + chip.clientWidth / 2;
    box.scrollTo({ left, behavior: "smooth" });
  }, [active]);

  // Con carta corta no hace falta navegar: se ve todo con un par de deslizamientos.
  if (groups.length < 2 || groups.reduce((n, g) => n + g.items.length, 0) <= FEW_PRODUCTS) return null;

  return (
    <nav className={s.catNav} aria-label="Categorías">
      <div className={s.catScroller} ref={scroller}>
        {groups.map((g) => (
          <a
            key={g.id}
            href={`#cat-${g.id}`}
            data-cat={g.id}
            className={`${s.chip} ${active === g.id ? s.chipActive : ""}`}
            aria-current={active === g.id ? "true" : undefined}
            onClick={() => setActive(g.id)}
          >
            {g.label}
          </a>
        ))}
      </div>
    </nav>
  );
}
