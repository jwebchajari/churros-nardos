// Lectura pública de la carta desde Firebase Realtime Database (REST, conexión anónima).
// Cacheado con "use cache": entra en el shell estático y se revalida cada minuto
// o al instante cuando el panel llama a /api/revalidar.
import { cacheLife, cacheTag } from "next/cache";
import { LOCAL } from "./site";
import { normalizeDatos, normalizeProducts } from "./menu-shared";
import { normalizeHorarios } from "@/utils/horarios";

const DB_URL = (process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL || "").replace(/\/+$/, "");

export function localTag(slug = LOCAL) {
  return `local-${slug}`;
}

async function readPath(path) {
  if (!DB_URL) return null;
  try {
    const res = await fetch(`${DB_URL}/${path}.json`);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

/** Comidas, datos y horarios del local, leídos por separado (cada nodo tiene sus reglas). */
export async function getLocal(slug = LOCAL) {
  "use cache";
  cacheLife("minutes");
  cacheTag(localTag(slug));

  const base = `locales/${encodeURIComponent(slug)}`;
  const [comidas, datos, horarios] = await Promise.all([
    readPath(`${base}/comidas`),
    readPath(`${base}/datos`),
    readPath(`${base}/horarios`),
  ]);
  return {
    // Los ocultos (sin stock) no salen del servidor.
    productos: normalizeProducts(comidas).filter((p) => !p.oculto),
    datos: normalizeDatos(datos),
    horarios: normalizeHorarios(horarios),
  };
}

export async function getProduct(id, slug = LOCAL) {
  const { productos } = await getLocal(slug);
  return productos.find((p) => p.id === id && !p.oculto) || null;
}
