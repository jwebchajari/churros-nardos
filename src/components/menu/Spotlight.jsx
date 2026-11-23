"use client";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import ProductImage from "./ProductImage";
import { Price } from "./ProductRow";
import s from "./menu.module.css";

/** Producto destacado arriba de la carta en /producto/[id]. */
export default function Spotlight({ product, onOpen }) {
  return (
    <section className={s.spotlight} aria-labelledby="spotlight-title">
      <Link href="/" className={s.backLink}>
        <ArrowLeft size={18} aria-hidden /> Ver toda la carta
      </Link>
      <ProductImage src={product.imagen} alt={product.nombre} width={960} ratio="16 / 10" className={s.spotImg} eager />
      <div className={s.spotBody}>
        <h1 id="spotlight-title" className={s.spotTitle}>
          {product.nombre}
        </h1>
        {product.descripcion ? <p className={s.spotDesc}>{product.descripcion}</p> : null}
        <div className={s.spotActions}>
          <Price product={product} big />
          <button type="button" className="btn btn-primary btn-lg" onClick={() => onOpen(product)}>
            Pedir
          </button>
        </div>
      </div>
    </section>
  );
}
