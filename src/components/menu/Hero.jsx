"use client";
import { useEffect, useState } from "react";
import { ChevronRight, MapPin } from "lucide-react";
import { SITE_NAME, fullAddress } from "@/lib/site";
import { getStatus } from "@/utils/horarios";
import s from "./menu.module.css";

/** Estado abierto/cerrado: se calcula solo en el cliente para no desajustar la hidratación. */
export function useOpenStatus(horarios) {
  const [status, setStatus] = useState(null);
  useEffect(() => {
    const tick = () => setStatus(getStatus(horarios));
    tick();
    const t = setInterval(tick, 60_000);
    return () => clearInterval(t);
  }, [horarios]);
  return status;
}

export function StatusPill({ status }) {
  if (!status) return <span className={`${s.pill} ${s.pillLoading}`}>Horarios</span>;
  if (!status.known) return <span className={s.pill}>Ver horarios</span>;
  return (
    <span className={`${s.pill} ${status.open ? s.pillOpen : s.pillClosed}`}>
      <span className={s.dot} aria-hidden />
      {status.open ? "Abierto ahora" : "Cerrado"}
    </span>
  );
}

export default function Hero({ datos, horarios, onInfo, asTitle = true }) {
  const status = useOpenStatus(horarios);
  const name = datos.nombre || SITE_NAME;
  const Title = asTitle ? "h1" : "p";

  return (
    <header className={s.hero}>
      <div className={s.heroBoard}>
        <img className={s.heroLogo} src="/logo-hero.webp" alt={`Logo de ${name}`} width={156} height={156} fetchPriority="high" />
        <Title className={s.heroTitle}>{name}</Title>
        <button type="button" className={s.statusBtn} onClick={onInfo} aria-haspopup="dialog">
          <StatusPill status={status} />
          {status?.detail ? <span className={s.statusDetail}>{status.detail}</span> : null}
          <ChevronRight size={18} aria-hidden className={s.statusChevron} />
        </button>
        {datos.direccion ? (
          <p className={s.heroAddress}>
            <MapPin size={15} aria-hidden />
            <span>{fullAddress(datos.direccion)}</span>
          </p>
        ) : null}
      </div>
    </header>
  );
}
