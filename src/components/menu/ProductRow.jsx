"use client";
import { SITE_NAME, formatPrice, hasOffer, productPath, productPacks, resolvePack, unitPrice } from "@/lib/site";
import ShareButton from "@/components/ui/ShareButton";
import ProductImage from "./ProductImage";
import s from "./menu.module.css";

export function Price({ product, big = false, pack = null }) {
  const packs = productPacks(product);
  if (packs.length) {
    const chosen = pack || packs.length === 1 ? resolvePack(product, pack) : null;
    return (
      <span className={`${s.price} ${big ? s.priceBig : ""}`}>
        <small className={s.pricePack}>{chosen ? chosen.key : "Desde"}</small>
        <span>{formatPrice(chosen ? chosen.precio : Math.min(...packs.map((p) => p.precio)))}</span>
      </span>
    );
  }
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
  const packs = productPacks(product);
  const showPackList = packs.length > 1;
  return (
    <li className={`${s.row} ${hasImage ? s.rowHasImg : ""}`}>
      {hasImage ? (
        <ProductImage src={product.imagen} alt="" width={large ? 280 : 200} ratio="1 / 1" className={s.rowImg} />
      ) : null}
      <div className={s.rowText}>
        <div className={s.rowLine}>
          <h3 className={s.rowName}>
            <button type="button" className={s.rowBtn} onClick={() => onOpen(product)} aria-haspopup="dialog">
              {product.nombre}
            </button>
          </h3>
          {showPackList ? null : (
            <>
              <span className={s.rowLeader} aria-hidden />
              <Price product={product} />
            </>
          )}
        </div>
        {showPackList ? (
          <ul className={s.packList} aria-label={`Precios de ${product.nombre}`}>
            {packs.map((p) => (
              <li key={p.key}>
                <span>{p.key}</span>
                <span className={s.rowLeader} aria-hidden />
                <span className={s.packPrice}>{formatPrice(p.precio)}</span>
              </li>
            ))}
          </ul>
        ) : null}
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
