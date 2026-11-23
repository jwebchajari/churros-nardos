// Normalización de datos de la base. Sin dependencias de runtime: sirve en server, cliente y OG.
import { CATEGORIES, categoryOf, MAX_MEATS, MEAT_PRICE_KEYS, MIN_MEATS } from "./site";

function str(v, max = 500) {
  return typeof v === "string" ? v.trim().slice(0, max) : "";
}

function num(v) {
  const n = Number(v);
  return Number.isFinite(n) && n >= 0 ? n : 0;
}

export function safeImage(url) {
  const s = str(url, 2000);
  return /^https:\/\//i.test(s) ? s : "";
}

export function normalizeProduct(id, raw) {
  const r = raw && typeof raw === "object" ? raw : {};
  const valor = num(r.valor);
  const valorOferta = num(r.valorOferta);
  const med = Number(r.medallones);
  const categoria = categoryOf(r.categoria);
  const medOk = Number.isInteger(med) && med >= MIN_MEATS && med <= MAX_MEATS;
  return {
    id: String(id),
    nombre: str(r.nombre, 80) || "Sin nombre",
    descripcion: str(r.descripcion, 400),
    categoria,
    valor,
    oferta: Boolean(r.oferta) && valorOferta > 0 && valorOferta < valor,
    valorOferta,
    imagen: safeImage(r.imagen),
    // 0 = no se eligen carnes. Las hamburguesas sin dato arrancan en 1.
    medallones: categoria === "bebidas" ? 0 : medOk ? med : categoria === "hamburguesas" ? MIN_MEATS : 0,
    precios: Object.fromEntries(Object.values(MEAT_PRICE_KEYS).map((k) => [k, num(r.precios?.[k])])),
    oculto: Boolean(r.oculto),
  };
}

export function normalizeProducts(raw) {
  if (!raw || typeof raw !== "object") return [];
  const order = Object.fromEntries(CATEGORIES.map((c, i) => [c.id, i]));
  return Object.entries(raw)
    .map(([id, p]) => normalizeProduct(id, p))
    .sort((a, b) => order[a.categoria] - order[b.categoria] || a.nombre.localeCompare(b.nombre, "es"));
}

export function normalizeDatos(raw) {
  const r = raw && typeof raw === "object" ? raw : {};
  const costoOrNull = (c) => (c === null || c === undefined || c === "" || !Number.isFinite(Number(c)) ? null : num(c));
  const redes = r.redes && typeof r.redes === "object" ? r.redes : {};
  return {
    nombre: str(r.nombre, 80).replace(/´/g, "’"),
    whatsapp: str(r.whatsapp, 30),
    direccion: str(r.direccion, 160),
    alias: str(r.alias, 60),
    costoEnvio: costoOrNull(r.costoEnvio),
    costoEnvioFuera: costoOrNull(r.costoEnvioFuera),
    redes: { instagram: str(redes.instagram, 120), facebook: str(redes.facebook, 160) },
  };
}

/** Hasta esta cantidad la carta se muestra con fotos grandes y sin barra de categorías. */
export const FEW_PRODUCTS = 6;

/** Agrupa por categoría en el orden de CATEGORIES, solo las que tienen productos visibles. */
export function groupByCategory(products) {
  return CATEGORIES.map((c) => ({
    ...c,
    items: products.filter((p) => p.categoria === c.id && !p.oculto),
  })).filter((g) => g.items.length > 0);
}
