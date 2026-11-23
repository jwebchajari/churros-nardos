"use client";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { useCart } from "@/lib/cart";
import { baseMeats, clampMeats, formatPrice, isCustomizable, linePrice, resolvePack } from "@/lib/site";
import s from "./menu.module.css";

/** Totales del carrito con precios del servidor. Ignora productos que ya no existen. */
export function priceCart(items, productos) {
  const byId = new Map(productos.filter((p) => !p.oculto).map((p) => [p.id, p]));
  let count = 0;
  let subtotal = 0;
  const lines = [];
  for (const it of items) {
    const product = byId.get(it.id);
    if (!product) continue;
    // Un carrito guardado puede traer una cantidad de carnes que ya no existe.
    const base = baseMeats(product);
    const meats = isCustomizable(product) ? clampMeats(it.meats ?? base, base) : null;
    const pack = resolvePack(product, it.pack)?.key ?? null;
    const unit = linePrice(product, { meats, pack });
    count += it.qty;
    subtotal += unit * it.qty;
    lines.push({ ...it, meats, pack, product, unit, total: unit * it.qty });
  }
  return { count, subtotal, lines };
}

export default function CartBar({ productos }) {
  const items = useCart();
  const { count, subtotal } = priceCart(items, productos);
  if (count === 0) return null;

  return (
    <div className={s.cartBar}>
      <Link href="/comprar" className={s.cartBtn}>
        <span className={s.cartCount} aria-hidden>
          {count}
        </span>
        <span className={s.cartLabel}>
          <ShoppingBag size={18} aria-hidden />
          Ver pedido
          <span className="visually-hidden">, {count} {count === 1 ? "producto" : "productos"}</span>
        </span>
        <span className={s.cartTotal}>{formatPrice(subtotal)}</span>
      </Link>
    </div>
  );
}
