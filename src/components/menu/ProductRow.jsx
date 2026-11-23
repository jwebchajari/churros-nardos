"use client";
import { SITE_NAME, formatPrice, hasOffer, productPath, unitPrice } from "@/lib/site";
import ShareButton from "@/components/ui/ShareButton";
import ProductImage from "./ProductImage";
import s from "./menu.module.css";

export function Price({ product, big = false }) {
  const offer = hasOffer(product);
  return (
    <span className={`${s.price} ${big ? s.priceBig : ""}`}>
      {offer ? (
        <del className={s.priceOld}>
          <span className="visually-hidden">Antes </span>
          {formatPrice(product.valor)}
        </del>
      ) : null}
      <span className={offer ? s.priceOffer : undefined}>{formatPrice(unitPrice(product))}</span>
    </span>
  );
}

/** Renglón de pizarra: nombre, puntos guía y precio. Toda la fila abre la ficha (::after del botón). */
export default function ProductRow({ product, onOpen, large = false }) {
  const hasImage = Boolean(product.imagen);
  return (
    <li className={`${s.row} ${hasImage ? s.rowHasImg : ""}`}>
      {hasImage ? (
        <ProductImage src={product.imagen} alt="" width={large ? 720 : 160} ratio={large ? "4 / 3" : "1 / 1"} className={s.rowImg} />
      ) : null}
      <div className={s.rowText}>
        <div className={s.rowLine}>
          <h3 className={s.rowName}>
            <button type="button" className={s.rowBtn} onClick={() => onOpen(product)} aria-haspopup="dialog">
              {product.nombre}
            </button>
          </h3>
          <span className={s.rowLeader} aria-hidden />
          <Price product={product} />
        </div>
        {product.descripcion ? <p className={s.rowDesc}>{product.descripcion}</p> : null}
        <div className={s.rowMeta}>
          {hasOffer(product) ? <span className={s.badge}>Oferta</span> : null}
          <ShareButton
            compact
            title={product.nombre}
            text={`Mirá ${product.nombre} en ${SITE_NAME}`}
            path={productPath(product.id)}
            className={s.rowShare}
          />
          <span className={s.rowCta} aria-hidden>
            Pedir
          </span>
        </div>
      </div>
    </li>
  );
}
