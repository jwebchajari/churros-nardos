import { TIMEZONE } from "@/lib/site";

// Índices como Date#getDay(): 0 = domingo.
export const DAY_KEYS = ["domingo", "lunes", "martes", "miercoles", "jueves", "viernes", "sabado"];
export const DAY_LABELS = {
  lunes: "Lunes",
  martes: "Martes",
  miercoles: "Miércoles",
  jueves: "Jueves",
  viernes: "Viernes",
  sabado: "Sábado",
  domingo: "Domingo",
};
// Orden de visualización (semana argentina).
export const WEEK_ORDER = ["lunes", "martes", "miercoles", "jueves", "viernes", "sabado", "domingo"];
export const MAX_FRANJAS = 4;

const HHMM = /^([01]\d|2[0-3]):[0-5]\d$/;

export function isHHMM(s) {
  return HHMM.test(String(s ?? ""));
}

export function toMinutes(hhmm) {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

export function normalizeHorarios(raw) {
  const r = raw && typeof raw === "object" ? raw : {};
  const out = {};
  for (const key of WEEK_ORDER) {
    const d = r[key] && typeof r[key] === "object" ? r[key] : {};
    const list = Array.isArray(d.franjas) ? d.franjas : Object.values(d.franjas || {});
    const franjas = list
      .filter((f) => f && isHHMM(f.desde) && isHHMM(f.hasta) && f.desde !== f.hasta)
      .slice(0, MAX_FRANJAS)
      .map((f) => ({ desde: f.desde, hasta: f.hasta }))
      .sort((a, b) => toMinutes(a.desde) - toMinutes(b.desde));
    out[key] = { cerrado: Boolean(d.cerrado) || franjas.length === 0, franjas };
  }
  return out;
}

export function hasAnyHorario(h) {
  return WEEK_ORDER.some((k) => h?.[k] && !h[k].cerrado && h[k].franjas.length > 0);
}

/** Día y minutos actuales en la zona horaria del comercio. */
export function nowInZone(date = new Date(), timeZone = TIMEZONE) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const get = (t) => parts.find((p) => p.type === t)?.value;
  const day = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(get("weekday"));
  return { day, minutes: Number(get("hour")) * 60 + Number(get("minute")) };
}

function franjasOf(h, dayIdx) {
  const d = h?.[DAY_KEYS[(dayIdx + 7) % 7]];
  return d && !d.cerrado ? d.franjas : [];
}

function crossesMidnight(f) {
  return toMinutes(f.hasta) <= toMinutes(f.desde);
}

/**
 * Estado abierto/cerrado.
 * { known: false } si no hay horarios cargados.
 * { known: true, open, detail } con detail tipo "Cierra a las 23:30" o "Abre mañana a las 20:00".
 */
export function getStatus(horarios, date = new Date()) {
  if (!hasAnyHorario(horarios)) return { known: false, open: false, detail: "" };
  const { day, minutes: m } = nowInZone(date);

  // Franjas de ayer que cruzan la medianoche.
  for (const f of franjasOf(horarios, day - 1)) {
    if (crossesMidnight(f) && m < toMinutes(f.hasta)) {
      return { known: true, open: true, detail: `Cierra a las ${f.hasta}` };
    }
  }
  for (const f of franjasOf(horarios, day)) {
    const a = toMinutes(f.desde);
    const b = toMinutes(f.hasta);
    const open = crossesMidnight(f) ? m >= a : m >= a && m < b;
    if (open) return { known: true, open: true, detail: `Cierra a las ${f.hasta}` };
  }
  // Próxima apertura.
  const later = franjasOf(horarios, day).find((f) => toMinutes(f.desde) > m);
  if (later) return { known: true, open: false, detail: `Abre hoy a las ${later.desde}` };
  for (let i = 1; i <= 7; i++) {
    const f = franjasOf(horarios, day + i)[0];
    if (f) {
      const when = i === 1 ? "mañana" : `el ${DAY_LABELS[DAY_KEYS[(day + i) % 7]].toLowerCase()}`;
      return { known: true, open: false, detail: `Abre ${when} a las ${f.desde}` };
    }
  }
  return { known: true, open: false, detail: "" };
}

export function franjasText(dia) {
  if (!dia || dia.cerrado || dia.franjas.length === 0) return "Cerrado";
  return dia.franjas.map((f) => `${f.desde} a ${f.hasta}`).join(" y ");
}

/** Para JSON-LD openingHoursSpecification. */
export function openingHoursSpec(horarios) {
  const map = {
    lunes: "Monday",
    martes: "Tuesday",
    miercoles: "Wednesday",
    jueves: "Thursday",
    viernes: "Friday",
    sabado: "Saturday",
    domingo: "Sunday",
  };
  const out = [];
  for (const k of WEEK_ORDER) {
    const d = horarios?.[k];
    if (!d || d.cerrado) continue;
    for (const f of d.franjas) {
      out.push({
        "@type": "OpeningHoursSpecification",
        dayOfWeek: `https://schema.org/${map[k]}`,
        opens: f.desde,
        closes: f.hasta,
      });
    }
  }
  return out;
}
