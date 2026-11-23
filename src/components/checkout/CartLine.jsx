"use client";
import { useState } from "react";
import { Trash2 } from "lucide-react";
import Stepper from "@/components/ui/Stepper";
import ProductImage from "@/components/menu/ProductImage";
import { removeItem, updateItem } from "@/lib/cart";
import { MAX_MEATS, baseMeats, formatPrice, isCustomizable, meatLabel, packUnits, productPacks } from "@/lib/site";
import s from "./checkout.module.css";

export default function CartLine({ line }) {
  const { product } = line;
  const custom = isCustomizable(product);
  const base = baseMeats(product);
  const [nota, setNota] = useState(line.nota || "");
  const packs = productPacks(product);
  const currentPack = packs.find((p) => p.key === line.pack);
  const packId = `pack-${line.key}`;
  const meatsId = `meats-${line.key}`;
  const notaId = `nota-${line.key}`;

  const meatOptions = [];
  for (let n = base; n <= MAX_MEATS; n++) meatOptions.push(n);

  return (
    <li className={s.line}>
      <ProductImage src={product.imagen} alt="" width={160} className={s.lineImg} />
      <div className={s.lineBody}>
        <div className={s.lineTop}>
          <h3 className={s.lineName}>{product.nombre}</h3>
          <span className={s.lineTotal}>{formatPrice(line.total)}</span>
        </div>
        <p className={s.lineUnit}>
          {currentPack ? `${currentPack.key}: ` : ""}
          {formatPrice(line.unit)} c/u
        </p>

        {custom && meatOptions.length > 1 ? (
          <div className={s.lineField}>
            <label htmlFor={meatsId}>Carnes</label>
            <select
              id={meatsId}
              className="input"
              value={line.meats ?? base}
              onChange={(e) => updateItem(line.key, { meats: Number(e.target.value) })}
            >
              {meatOptions.map((n) => (
                <option key={n} value={n}>
                  {meatLabel(n)}
                </option>
              ))}
            </select>
          </div>
        ) : null}

        {packs.length > 1 ? (
          <div className={s.lineField}>
            <label htmlFor={packId}>Cantidad</label>
            <select id={packId} className="input" value={line.pack ?? packs[0].key} onChange={(e) => updateItem(line.key, { pack: e.target.value })}>
              {packs.map((p) => (
                <option key={p.key} value={p.key}>
                  {p.key} ({packUnits(p.cantidad)})
                </option>
              ))}
            </select>
          </div>
        ) : null}

        <div className={s.lineField}>
          <label htmlFor={notaId}>Aclaraciones</label>
          <input
            id={notaId}
            className="input"
            value={nota}
            maxLength={200}
            placeholder="Ej: sin azúcar"
            onChange={(e) => setNota(e.target.value)}
            onBlur={() => {
              if (nota.trim() !== (line.nota || "")) updateItem(line.key, { nota: nota.trim() });
            }}
          />
        </div>

        <div className={s.lineActions}>
          <Stepper size="sm" value={line.qty} min={1} max={99} onChange={(qty) => updateItem(line.key, { qty })} />
          <button type="button" className={s.removeBtn} onClick={() => removeItem(line.key)}>
            <Trash2 size={18} aria-hidden /> Quitar
          </button>
        </div>
      </div>
    </li>
  );
}
