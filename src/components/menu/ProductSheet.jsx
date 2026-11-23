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
  productPath,
} from "@/lib/site";
import ProductImage from "./ProductImage";
import { Price } from "./ProductRow";
import s from "./menu.module.css";

function ProductForm({ product, onAdded }) {
  const custom = isCustomizable(product);
  const base = baseMeats(product);
  const [meats, setMeats] = useState(base);
  const [qty, setQty] = useState(1);
  const [nota, setNota] = useState("");

  const unit = linePrice(product, { meats });
  const total = unit * qty;

  function add() {
    addItem({ id: product.id, qty, meats: custom ? meats : null, nota });
    onAdded(qty);
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
        <Price product={product} big />
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
        <Stepper value={qty} onChange={setQty} max={20} />
        <button type="button" className="btn btn-primary btn-lg" onClick={add} style={{ flex: 1 }}>
          Agregar {formatPrice(total)}
        </button>
      </div>

      <div className={s.shareRow}>
        <ShareButton title={product.nombre} text={`Mirá ${product.nombre} en ${SITE_NAME}`} path={productPath(product.id)} />
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
