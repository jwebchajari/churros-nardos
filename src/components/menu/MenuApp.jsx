"use client";
import { useEffect, useMemo, useState } from "react";
import { FEW_PRODUCTS, groupByCategory } from "@/lib/menu-shared";
import CartBar from "./CartBar";
import CategoryNav from "./CategoryNav";
import Hero from "./Hero";
import InfoSheet from "./InfoSheet";
import ProductRow from "./ProductRow";
import ProductSheet from "./ProductSheet";
import SiteFooter from "./SiteFooter";
import Spotlight from "./Spotlight";
import VisitTracker from "./VisitTracker";
import s from "./menu.module.css";

export default function MenuApp({ data, spotlightId = null, footer = true }) {
  const { productos, datos, horarios } = data;
  const groups = useMemo(() => groupByCategory(productos), [productos]);
  const spotlight = spotlightId ? productos.find((p) => p.id === spotlightId && !p.oculto) : null;

  const few = productos.length <= FEW_PRODUCTS;

  const [selected, setSelected] = useState(null);
  const [infoOpen, setInfoOpen] = useState(false);
  const [toast, setToast] = useState("");

  useEffect(() => {
    if (!toast) return undefined;
    const t = setTimeout(() => setToast(""), 2200);
    return () => clearTimeout(t);
  }, [toast]);

  return (
    <div className={s.page}>
      <Hero datos={datos} horarios={horarios} onInfo={() => setInfoOpen(true)} asTitle={!spotlight} />

      {spotlight ? <Spotlight product={spotlight} onOpen={setSelected} /> : null}

      <CategoryNav groups={groups} />

      <main className={s.main} id="carta">
        {groups.length === 0 ? (
          <div className={s.empty}>
            <p className={s.emptyTitle}>Estamos armando la carta</p>
            <p className="hint">Volvé en un rato o escribinos por WhatsApp.</p>
          </div>
        ) : (
          groups.map((g) => (
            <section key={g.id} id={`cat-${g.id}`} className={s.section} aria-labelledby={`h-${g.id}`}>
              <h2 id={`h-${g.id}`} className={s.sectionTitle}>
                {g.label}
              </h2>
              <ul className={s.list} data-density={few ? "pocos" : "carta"}>
                {g.items.map((p) => (
                  <ProductRow key={p.id} product={p} onOpen={setSelected} large={few} />
                ))}
              </ul>
            </section>
          ))
        )}
      </main>

      {footer ? <SiteFooter datos={datos} /> : null}

      <CartBar productos={productos} />

      <ProductSheet
        product={selected}
        onClose={() => setSelected(null)}
        onAdded={(p, qty) => setToast(`Agregaste ${qty > 1 ? `${qty} x ` : ""}${p.nombre}`)}
      />
      <InfoSheet open={infoOpen} onClose={() => setInfoOpen(false)} datos={datos} horarios={horarios} />

      <div className={s.toast} role="status" aria-live="polite" data-show={toast ? "true" : "false"}>
        {toast}
      </div>

      <VisitTracker />
    </div>
  );
}
