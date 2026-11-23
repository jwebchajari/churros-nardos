import s from "./loading.module.css";

export function Spinner({ label = "Cargando" }) {
  return (
    <span className={s.spinner} role="status">
      <span className="visually-hidden">{label}</span>
    </span>
  );
}

/** Esqueleto de la carta para fallbacks de Suspense. */
export function MenuSkeleton() {
  return (
    <div className={s.page} aria-busy="true">
      <div className={s.hero}>
        <span className={s.logo} />
        <span className={s.lines}>
          <span className={s.line} style={{ width: "70%", height: 30 }} />
          <span className={s.line} style={{ width: "40%" }} />
        </span>
      </div>
      {[0, 1, 2, 3].map((i) => (
        <span key={i} className={s.card} />
      ))}
      <Spinner />
    </div>
  );
}

export default function Loading() {
  return (
    <div className={s.center}>
      <Spinner />
    </div>
  );
}
