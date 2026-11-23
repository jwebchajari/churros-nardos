// Normalización de datos de la base. Sin dependencias de runtime: sirve en server, cliente y OG.
import { categoryAnchor, categoryLabel, categoryOf, categoryRank, MAX_MEATS, MEAT_PRICE_KEYS, MIN_MEATS, cleanPacks } from "./site";

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
    nombre: str(r.nombre, 80).replace(/´/g, "’") || "Sin nombre",
    descripcion: str(r.descripcion, 400),
    categoria,
    valor,
    oferta: Boolean(r.oferta) && valorOferta > 0 && valorOferta < valor,
    valorOferta,
    imagen: safeImage(r.imagen),
    // 0 = no se eligen carnes. Las hamburguesas sin dato arrancan en 1.
    medallones: categoria === "bebidas" ? 0 : medOk ? med : categoria === "hamburguesas" ? MIN_MEATS : 0,
    precios: Object.fromEntries(Object.values(MEAT_PRICE_KEYS).map((k) => [k, num(r.precios?.[k])])),
    presentaciones: cleanPacks(r.presentaciones),
    oculto: Boolean(r.oculto),
  };
}

export function normalizeProducts(raw) {
  if (!raw || typeof raw !== "object") return [];
  return Object.entries(raw)
    .map(([id, p]) => normalizeProduct(id, p))
    .sort(
      (a, b) =>
        categoryRank(a.categoria) - categoryRank(b.categoria) ||
        categoryLabel(a.categoria).localeCompare(categoryLabel(b.categoria), "es") ||
        a.nombre.localeCompare(b.nombre, "es")
    );
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

/** Agrupa por categoría, comunes y propias del local. Los ocultos solo entran si se piden. */
export function groupByCategory(products, { hidden = false } = {}) {
  const groups = new Map();
  for (const p of products) {
    if (p.oculto && !hidden) continue;
    const id = categoryAnchor(p.categoria);
    if (!groups.has(id)) groups.set(id, { id, label: categoryLabel(p.categoria), rank: categoryRank(p.categoria), items: [] });
    groups.get(id).items.push(p);
  }
  return [...groups.values()].sort((a, b) => a.rank - b.rank || a.label.localeCompare(b.label, "es"));
}
