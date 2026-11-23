"use client";
import { useState } from "react";
import Sheet from "@/components/ui/Sheet";
import Stepper from "@/components/ui/Stepper";
import ShareButton from "@/components/ui/ShareButton";
import { addItem } from "@/lib/cart";
import {
  MAX_MEATS,
  SITE_NAME,
  baseMeats,
  formatPrice,
  includesFries,
  isCustomizable,
  linePrice,
  meatLabel,
  packUnits,
  productPacks,
  productPath,
} from "@/lib/site";
import ProductImage from "./ProductImage";
import { Price } from "./ProductRow";
import s from "./menu.module.css";

/** Una forma de comprar el producto, con su propio contador. */
function PackOption({ pack, value, onChange }) {
  const single = pack.cantidad === 1;
  const title = single ? "Por unidad" : pack.key;
  return (
    <div className={s.packOpt} data-active={value > 0 ? "true" : "false"}>
      <span className={s.packOptText}>
        <strong>{title}</strong>
        <small>{single ? `${formatPrice(pack.precio)} c/u` : formatPrice(pack.precio)}</small>
      </span>
      <Stepper size="sm" value={value} min={0} max={20} onChange={onChange} label={`Cantidad ${title}`} />
    </div>
  );
}

function ProductForm({ product, onAdded }) {
  const custom = isCustomizable(product);
  const base = baseMeats(product);
  const [meats, setMeats] = useState(base);
  const packs = productPacks(product);
  const [counts, setCounts] = useState(() => (packs[0] ? { [packs[0].key]: 1 } : {}));
  const [qty, setQty] = useState(1);
  const [nota, setNota] = useState("");

  const hasPacks = packs.length > 0;
  const singlePack = packs.find((p) => p.cantidad === 1);
  const otherPacks = packs.filter((p) => p.cantidad !== 1);
  const chosen = packs.map((p) => ({ ...p, qty: counts[p.key] || 0 })).filter((p) => p.qty > 0);
  const units = hasPacks ? chosen.reduce((n, p) => n + p.cantidad * p.qty, 0) : qty;
  const total = hasPacks ? chosen.reduce((n, p) => n + p.precio * p.qty, 0) : linePrice(product, { meats }) * qty;
  const setCount = (key) => (value) => setCounts((c) => ({ ...c, [key]: value }));

  function add() {
    if (hasPacks) chosen.forEach((p) => addItem({ id: product.id, qty: p.qty, pack: p.key, nota }));
    else addItem({ id: product.id, qty, meats: custom ? meats : null, nota });
    onAdded(units);
  }

  const meatOptions = [];
  for (let n = base; n <= MAX_MEATS; n++) meatOptions.push(n);

  return (
    <>
      <ProductImage src={product.imagen} alt={product.nombre} width={960} ratio="16 / 10" className={s.sheetImg} eager />
      <div className={s.sheetHead}>
        <p className={s.sheetName} aria-hidden="true">
          {product.nombre}
        </p>
        <div className={s.sheetHeadEnd}>
          {hasPacks ? null : <Price product={product} big />}
          <ShareButton compact title={product.nombre} text={`Mirá ${product.nombre} en ${SITE_NAME}`} path={productPath(product.id)} className={s.sheetShare} />
        </div>
      </div>
      {product.descripcion ? <p className={s.sheetDesc}>{product.descripcion}</p> : null}
      {includesFries(product) ? <p className={s.fries}>Incluye papas fritas</p> : null}

      {custom && meatOptions.length > 1 ? (
        <fieldset className={s.optGroup}>
          <legend className={s.optLegend}>Cantidad de carnes</legend>
          <div className={s.optList}>
            {meatOptions.map((n) => (
              <label key={n} className={s.opt}>
                <input type="radio" name="meats" value={n} checked={meats === n} onChange={() => setMeats(n)} />
                <span className={s.optLabel}>{meatLabel(n)}</span>
                <span className={s.optPrice}>{formatPrice(linePrice(product, { meats: n }))}</span>
              </label>
            ))}
          </div>
        </fieldset>
      ) : null}

      {hasPacks ? (
        <fieldset className={s.optGroup}>
          <legend className={s.optLegend}>Elegí cuántos querés</legend>
          <div className={s.optList}>
            {singlePack ? <PackOption pack={singlePack} value={counts[singlePack.key] || 0} onChange={setCount(singlePack.key)} /> : null}
            {singlePack && otherPacks.length ? (
              <p className={s.packDivider}>
                <span>o por cantidad</span>
              </p>
            ) : null}
            {otherPacks.map((p) => (
              <PackOption key={p.key} pack={p} value={counts[p.key] || 0} onChange={setCount(p.key)} />
            ))}
          </div>
        </fieldset>
      ) : null}

      <label className={`field ${s.notes}`}>
        <span>Aclaraciones</span>
        <textarea
          className="input"
          value={nota}
          maxLength={200}
          onChange={(e) => setNota(e.target.value)}
          placeholder="Ej: sin azúcar"
          rows={2}
        />
      </label>

      <div className={s.addBar}>
        {hasPacks ? (
          <p className={s.addTotal} aria-live="polite">
            <small>Total</small>
            <strong>{packUnits(units)}</strong>
          </p>
        ) : (
          <Stepper value={qty} onChange={setQty} max={20} />
        )}
        <button type="button" className="btn btn-primary btn-lg" onClick={add} disabled={units === 0} style={{ flex: 1 }}>
          {units === 0 ? "Elegí una cantidad" : `Agregar ${formatPrice(total)}`}
        </button>
      </div>

    </>
  );
}

export default function ProductSheet({ product, onClose, onAdded }) {
  return (
    <Sheet open={Boolean(product)} onClose={onClose} title={product?.nombre || "Producto"} hideTitle>
      {product ? (
        <ProductForm
          key={product.id}
          product={product}
          onAdded={(qty) => {
            onAdded?.(product, qty);
            onClose();
          }}
        />
      ) : null}
    </Sheet>
  );
}
