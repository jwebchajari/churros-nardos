"use client";
import { Clock, CreditCard, MapPin } from "lucide-react";
import Sheet from "@/components/ui/Sheet";
import { FacebookIcon, InstagramIcon, WhatsAppIcon } from "@/components/BrandIcons";
import { PAYMENT_METHODS, SHIPPING_ZONES, envioLabel, facebookUrl, fullAddress, instagramUrl, mapsUrl, shippingCost, waNumber } from "@/lib/site";
import { DAY_KEYS, DAY_LABELS, WEEK_ORDER, franjasText, hasAnyHorario, nowInZone } from "@/utils/horarios";
import { StatusPill, useOpenStatus } from "./Hero";
import s from "./menu.module.css";

export default function InfoSheet({ open, onClose, datos, horarios }) {
  const status = useOpenStatus(horarios);
  const todayKey = open ? DAY_KEYS[nowInZone().day] : null;
  const ig = instagramUrl(datos.redes.instagram);
  const fb = facebookUrl(datos.redes.facebook);
  const wa = waNumber(datos.whatsapp);

  return (
    <Sheet open={open} onClose={onClose} title="Info del local">
      <div className={s.infoStatus}>
        <StatusPill status={status} />
        {status?.detail ? <span className={s.statusDetail}>{status.detail}</span> : null}
      </div>

      <section className={s.infoBlock} aria-labelledby="info-horarios">
        <h3 id="info-horarios" className={s.infoTitle}>
          <Clock size={18} aria-hidden /> Horarios
        </h3>
        {hasAnyHorario(horarios) ? (
          <ul className={s.hours}>
            {WEEK_ORDER.map((k) => (
              <li key={k} className={k === todayKey ? s.today : undefined}>
                <span>
                  {DAY_LABELS[k]}
                  {k === todayKey ? <span className="visually-hidden"> (hoy)</span> : null}
                </span>
                <span>{franjasText(horarios[k])}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="hint">Todavía no hay horarios cargados. Consultanos por WhatsApp.</p>
        )}
      </section>

      {datos.direccion ? (
        <section className={s.infoBlock} aria-labelledby="info-dir">
          <h3 id="info-dir" className={s.infoTitle}>
            <MapPin size={18} aria-hidden /> Dirección
          </h3>
          <p>{fullAddress(datos.direccion)}</p>
          <a className="btn btn-ghost" href={mapsUrl(datos.direccion)} target="_blank" rel="noopener noreferrer">
            Abrir en Google Maps
          </a>
        </section>
      ) : null}

      <section className={s.infoBlock} aria-labelledby="info-envio">
        <h3 id="info-envio" className={s.infoTitle}>
          Envío
        </h3>
        <ul className={s.hours}>
          {SHIPPING_ZONES.map((z) => (
            <li key={z.id}>
              <span>{z.label}</span>
              <strong>{envioLabel(shippingCost(datos, z.id))}</strong>
            </li>
          ))}
        </ul>
        <p>También podés retirar en el local.</p>
      </section>

      <section className={s.infoBlock} aria-labelledby="info-pago">
        <h3 id="info-pago" className={s.infoTitle}>
          <CreditCard size={18} aria-hidden /> Medios de pago
        </h3>
        <p>{PAYMENT_METHODS.map((m) => m.label).join(", ")}.</p>
      </section>

      {wa.length > 3 || ig || fb ? (
        <div className={s.socials}>
          {wa.length > 3 ? (
            <a className="btn btn-whatsapp" href={`https://wa.me/${wa}`} target="_blank" rel="noopener noreferrer">
              <WhatsAppIcon size={18} /> WhatsApp
            </a>
          ) : null}
          {ig ? (
            <a className="btn btn-ghost" href={ig} target="_blank" rel="noopener noreferrer">
              <InstagramIcon size={18} /> Instagram
            </a>
          ) : null}
          {fb ? (
            <a className="btn btn-ghost" href={fb} target="_blank" rel="noopener noreferrer">
              <FacebookIcon size={18} /> Facebook
            </a>
          ) : null}
        </div>
      ) : null}
    </Sheet>
  );
}
