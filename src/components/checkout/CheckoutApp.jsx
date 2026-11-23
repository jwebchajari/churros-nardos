"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, CircleAlert } from "lucide-react";
import { WhatsAppIcon } from "@/components/BrandIcons";
import { priceCart } from "@/components/menu/CartBar";
import { useOpenStatus } from "@/components/menu/Hero";
import { clearCart, useCart } from "@/lib/cart";
import { envioLabel, formatPrice, shippingCost, shippingZone, waNumber, whatsappOrderUrl } from "@/lib/site";
import BuyerForm from "./BuyerForm";
import CartLine from "./CartLine";
import { buildOrderMessage } from "./message";
import s from "./checkout.module.css";

const BUYER_KEY = "comprador";
const EMPTY_BUYER = {
  nombre: "",
  entrega: "envio",
  zona: "ciudad",
  direccion: "",
  referencia: "",
  pago: "efectivo",
  pagaCon: "",
  comentario: "",
};

export default function CheckoutApp({ data }) {
  const { productos, datos, horarios } = data;
  const items = useCart();
  const { lines, subtotal, count } = priceCart(items, productos);
  const status = useOpenStatus(horarios);
  const [buyer, setBuyer] = useState(EMPTY_BUYER);
  const [errors, setErrors] = useState({});
  const [sent, setSent] = useState(false);
  const loaded = useRef(false);

  // Recordar nombre y dirección en este dispositivo.
  useEffect(() => {
    // Una sola vez: si el efecto se repite, leería lo que el guardado inicial acaba de escribir.
    if (loaded.current) return;
    try {
      const saved = JSON.parse(localStorage.getItem(BUYER_KEY) || "null");
      // Restaurar después de hidratar (localStorage no existe en el servidor).
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (saved) setBuyer((b) => ({ ...b, nombre: saved.nombre || "", direccion: saved.direccion || "", referencia: saved.referencia || "", entrega: saved.entrega || b.entrega, zona: shippingZone(saved.zona).id }));
    } catch {
      // sin almacenamiento disponible
    }
    loaded.current = true;
  }, []);

  useEffect(() => {
    if (!loaded.current) return;
    try {
      const { nombre, direccion, referencia, entrega, zona } = buyer;
      localStorage.setItem(BUYER_KEY, JSON.stringify({ nombre, direccion, referencia, entrega, zona }));
    } catch {
      // ignorar
    }
  }, [buyer]);

  const envio = buyer.entrega === "envio";
  const costoEnvio = envio ? shippingCost(datos, buyer.zona) : 0;
  const envioPending = envio && costoEnvio === null;
  const total = subtotal + (envioPending ? 0 : costoEnvio);
  const hasPhone = waNumber(datos.whatsapp).length > 10;

  function send() {
    const e = {};
    if (!buyer.nombre.trim()) e.nombre = "Escribí tu nombre.";
    if (envio && !buyer.direccion.trim()) e.direccion = "Escribí la dirección de entrega.";
    setErrors(e);
    if (Object.keys(e).length) {
      document.querySelector('[aria-invalid="true"]')?.focus();
      return;
    }
    const { text } = buildOrderMessage({ datos, lines, subtotal, buyer });
    setSent(true);
    window.location.assign(whatsappOrderUrl(datos.whatsapp, text));
  }

  if (count === 0) {
    return (
      <main className={s.page}>
        <TopBar />
        <div className={s.empty}>
          <p className={s.emptyTitle}>{sent ? "Pedido vaciado" : "Tu pedido está vacío"}</p>
          <p className="hint">Elegí tus churros en la carta y volvé acá para mandarlo.</p>
          <Link href="/" className="btn btn-primary">
            Ver la carta
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className={s.page}>
      <TopBar />

      {status?.known && !status.open ? (
        <p className={s.notice} role="note">
          <CircleAlert size={18} aria-hidden />
          <span>
            Ahora estamos cerrados{status.detail ? ` (${status.detail.toLowerCase()})` : ""}. Podés mandar el pedido igual y te
            respondemos cuando abramos.
          </span>
        </p>
      ) : null}

      <section className={s.block} aria-labelledby="h-pedido">
        <h2 id="h-pedido" className={s.blockTitle}>
          Tu pedido
        </h2>
        <ul className={s.lines}>
          {lines.map((l) => (
            <CartLine key={l.key} line={l} />
          ))}
        </ul>
        <Link href="/" className={s.moreLink}>
          + Agregar algo más
        </Link>
      </section>

      <section className={s.block} aria-labelledby="h-datos">
        <h2 id="h-datos" className={s.blockTitle}>
          Tus datos
        </h2>
        <BuyerForm buyer={buyer} setBuyer={setBuyer} datos={datos} errors={errors} />
      </section>

      <section className={s.block} aria-labelledby="h-total">
        <h2 id="h-total" className="visually-hidden">
          Total
        </h2>
        <dl className={s.totals}>
          <div>
            <dt>Subtotal</dt>
            <dd>{formatPrice(subtotal)}</dd>
          </div>
          {envio ? (
            <div>
              <dt>Envío {shippingZone(buyer.zona).label.charAt(0).toLowerCase() + shippingZone(buyer.zona).label.slice(1)}</dt>
              <dd>{envioLabel(costoEnvio)}</dd>
            </div>
          ) : null}
          <div className={s.totalRow}>
            <dt>{envioPending ? "Total sin envío" : "Total"}</dt>
            <dd>{formatPrice(total)}</dd>
          </div>
        </dl>
      </section>

      <div className={s.sendBar}>
        {hasPhone ? (
          <button type="button" className="btn btn-whatsapp btn-lg btn-block" onClick={send}>
            <WhatsAppIcon size={20} /> Enviar pedido por WhatsApp
          </button>
        ) : (
          <p className="error-text">El local todavía no cargó su WhatsApp. Probá más tarde.</p>
        )}
        {sent ? (
          <button type="button" className={s.clearBtn} onClick={clearCart}>
            ¿Ya lo enviaste? Vaciar pedido
          </button>
        ) : null}
      </div>
    </main>
  );
}

function TopBar() {
  return (
    <header className={s.top}>
      <Link href="/" className={s.back} aria-label="Volver a la carta">
        <ArrowLeft size={22} aria-hidden />
      </Link>
      <h1 className={s.title}>Tu pedido</h1>
    </header>
  );
}
