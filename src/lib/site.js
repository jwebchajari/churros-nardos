// Único punto de configuración del negocio.
// Cambiar de cliente = editar este archivo + tokens de color en globals.css + logo/íconos.
// Los datos que el dueño edita (WhatsApp, dirección, alias, redes, precios, horarios)
// viven en Firebase y NUNCA se escriben acá.

// URL pública: NEXT_PUBLIC_SITE_URL si está cargada (dominio propio); si no, el dominio de
// producción que Vercel expone en el build; en local, localhost. Las imágenes al compartir
// necesitan una URL absoluta real: con localhost WhatsApp no muestra la vista previa.
function resolveSiteUrl() {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL || "";
  const vercel = process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_PROJECT_PRODUCTION_URL;
  // Si en Vercel quedó cargada la URL de desarrollo (localhost), se ignora: rompería las vistas previas.
  const isLocal = /^https?:\/\/(localhost|127\.0\.0\.1)(:|\/|$)/i.test(explicit);
  if (explicit && !(isLocal && vercel)) return explicit;
  if (vercel) return `https://${vercel}`;
  return "http://localhost:3000";
}
export const SITE_URL = resolveSiteUrl().replace(/\/+$/, "");
export const SITE_NAME = "Churros Nardo’s";
export const SITE_SHORT_NAME = "Nardo’s";
export const SITE_CITY = "City Bell";
export const SITE_PROVINCE = "Buenos Aires";
export const SITE_COUNTRY = "AR";
export const SITE_AREA_CODE = "221"; // característica local, para normalizar teléfonos sin código de área
export const TIMEZONE = "America/Argentina/Buenos_Aires";
export const SITE_DESCRIPTION =
  "Churros en City Bell, La Plata. Mirá la carta de Churros Nardo’s, armá tu pedido y mandalo por WhatsApp.";

// Colores de marca para manifest, themeColor y OG (la UI usa los tokens de globals.css).
export const BRAND = {
  wood: "#2C1F16",
  sand: "#ECD9AE",
  cream: "#F7EEDC",
};

// Slug del local que publica este deploy.
export const LOCAL = process.env.NEXT_PUBLIC_LOCAL_NAME || "churros-nardo-s";

// Carpeta raíz en Cloudinary: <ROOT>/<slug>
export const CLOUDINARY_ROOT = "CardCloude";

/* ---------------- Categorías ---------------- */

// El panel central no tiene categoría "churros": se cargan en "otros" y acá se muestran como Churros.
export const CATEGORIES = [
  { id: "otros", label: "Churros" },
  { id: "bebidas", label: "Bebidas" },
];

export const CATEGORY_ALIASES = {
  churro: "otros",
  churros: "otros",
  bebida: "bebidas",
  gaseosa: "bebidas",
  gaseosas: "bebidas",
  cafe: "bebidas",
  cafes: "bebidas",
};

export function slugText(raw) {
  return String(raw ?? "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();
}

/** Normaliza lo que escribe el dueño. Desconocido cae en "otros". */
export function categoryOf(raw) {
  const s = slugText(raw);
  if (CATEGORIES.some((c) => c.id === s)) return s;
  return CATEGORY_ALIASES[s] || "otros";
}

export function categoryLabel(id) {
  return CATEGORIES.find((c) => c.id === id)?.label || "Otros";
}

/* ---------------- Personalización del rubro ---------------- */

// Carnes (medallones): cualquier producto con `medallones` cargado (1 a 4) deja elegir la cantidad.
// Las hamburguesas siempre dejan elegir (sin dato, base 1). El precio cargado es el de la base y
// cada opción suma la diferencia de MEAT_SURCHARGE. La base máxima es 3 para que haya algo que elegir.
export const MIN_MEATS = 1;
export const MAX_MEATS = 4;
export const MAX_BASE_MEATS = MAX_MEATS - 1;
export const MEAT_LABELS = { 1: "Simple", 2: "Doble", 3: "Triple", 4: "Cuádruple" };
// Recargo sobre el precio de 1 carne, para productos sin precio propio en `precios`.
export const MEAT_SURCHARGE = { 1: 0, 2: 3000, 3: 5000, 4: 7000 };
// Claves de `precios` en la base. Con texto y no números para que Firebase no lo convierta en array.
export const MEAT_PRICE_KEYS = { 2: "doble", 3: "triple", 4: "cuadruple" };

// Este local no vende productos con papas incluidas.
export function includesFries() {
  return false;
}

/* ---------------- Ingredientes ---------------- */

// El orden de los grupos es el orden en que se muestran. Dentro de cada grupo, alfabético.
export const INGREDIENT_GROUPS = [
  { id: "pan", label: "Pan" },
  { id: "carne", label: "Carne" },
  { id: "aderezos", label: "Aderezos y agregados" },
];

export const INGREDIENT_CATALOG = { pan: [], carne: [], aderezos: [] };

const MAX_INGREDIENT_NAME = 40;
const MAX_INGREDIENTS_PER_GROUP = 30;
const ingredientCollator = new Intl.Collator("es", { sensitivity: "base" });

export function ingredientKey(name) {
  return slugText(name).replace(/\s+/g, " ");
}

/** Lista sin repetidos (ignora mayúsculas y acentos) y en orden alfabético. */
export function sortIngredientNames(list) {
  const seen = new Map();
  for (const item of Array.isArray(list) ? list : Object.values(list || {})) {
    const name = String(item ?? "").trim().replace(/\s+/g, " ").slice(0, MAX_INGREDIENT_NAME);
    const key = ingredientKey(name);
    if (key && !seen.has(key)) seen.set(key, name);
  }
  return [...seen.values()].sort(ingredientCollator.compare);
}

export function cleanIngredients(raw) {
  const out = {};
  for (const { id } of INGREDIENT_GROUPS) out[id] = sortIngredientNames(raw?.[id]).slice(0, MAX_INGREDIENTS_PER_GROUP);
  return out;
}

export function hasIngredients(raw) {
  const clean = cleanIngredients(raw);
  return INGREDIENT_GROUPS.some(({ id }) => clean[id].length > 0);
}

/** Texto para la carta: pan, carne y después aderezos en orden alfabético. */
export function ingredientsText(raw) {
  const clean = cleanIngredients(raw);
  const names = INGREDIENT_GROUPS.flatMap(({ id }) => clean[id]);
  return names.length ? `${names.join(", ")}.` : "";
}

/* ---------------- Zonas de envío ---------------- */

// Cada zona lee su costo del campo indicado en datos (lo carga el dueño en el panel).
export const SHIPPING_ZONES = [
  { id: "ciudad", label: `Dentro de ${SITE_CITY}`, field: "costoEnvio" },
  { id: "fuera", label: "Fuera de la ciudad", field: "costoEnvioFuera" },
];

export function shippingZone(id) {
  return SHIPPING_ZONES.find((z) => z.id === id) || SHIPPING_ZONES[0];
}

/** Costo de la zona: número, o null si todavía está a confirmar. */
export function shippingCost(datos, zoneId) {
  const costo = datos?.[shippingZone(zoneId).field];
  if (costo === null || costo === undefined || costo === "") return null;
  const n = Number(costo);
  return Number.isFinite(n) && n >= 0 ? n : null;
}

/* ---------------- Medios de pago ---------------- */

export const PAYMENT_METHODS = [
  { id: "efectivo", label: "Efectivo" },
  { id: "transferencia", label: "Transferencia" },
  { id: "tarjeta", label: "Tarjeta" },
];

export function paymentLabel(id) {
  return PAYMENT_METHODS.find((m) => m.id === id)?.label || "Efectivo";
}

function validMeats(n) {
  return Number.isInteger(n) && n >= MIN_MEATS && n <= MAX_MEATS;
}

// La elección de carnes no aplica a una churrería.
export function isCustomizable() {
  return false;
}

export function baseMeats(product) {
  const n = Number(product?.medallones);
  return validMeats(n) ? n : MIN_MEATS;
}

export function meatLabel(n) {
  return MEAT_LABELS[n] || `${n} medallones`;
}

/* ---------------- Precios ---------------- */

export function hasOffer(p) {
  const v = Number(p?.valor);
  const o = Number(p?.valorOferta);
  return Boolean(p?.oferta) && o > 0 && o < v;
}

export function unitPrice(p) {
  return hasOffer(p) ? Number(p.valorOferta) : Number(p?.valor) || 0;
}

/** Precio unitario de una línea con sus opciones. */
export function linePrice(product, options = {}) {
  let price = unitPrice(product);
  if (isCustomizable(product)) {
    const base = baseMeats(product);
    const meats = clampMeats(options.meats ?? base, base);
    if (meats === base) return price;
    const own = Number(product.precios?.[MEAT_PRICE_KEYS[meats]]);
    // Con oferta, el precio propio mantiene el mismo descuento en pesos que el precio base.
    if (own > 0) return Math.max(0, own - (Number(product.valor) - price));
    price += MEAT_SURCHARGE[meats] - MEAT_SURCHARGE[base];
  }
  return price;
}

export function clampMeats(n, base = MIN_MEATS) {
  const v = Math.round(Number(n));
  if (!Number.isFinite(v)) return base;
  return Math.min(MAX_MEATS, Math.max(base, v));
}

const ARS = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  maximumFractionDigits: 0,
  minimumFractionDigits: 0,
});

export function formatPrice(n) {
  return ARS.format(Math.round(Number(n) || 0));
}

/** null/"" = "A confirmar", 0 = "Gratis". */
export function envioLabel(costo) {
  if (costo === null || costo === undefined || costo === "") return "A confirmar";
  const n = Number(costo);
  if (!Number.isFinite(n)) return "A confirmar";
  return n === 0 ? "Gratis" : formatPrice(n);
}

/* ---------------- WhatsApp y links ---------------- */

/**
 * Normaliza un teléfono argentino al formato de wa.me: 54 9 <área> <número>.
 * Acepta "03456 15-123456", "+54 9 3456 123456", "3456123456", "15123456", etc.
 */
export function waNumber(raw) {
  let d = String(raw ?? "").replace(/\D/g, "");
  if (!d) return "";
  if (d.startsWith("00")) d = d.slice(2);
  if (d.startsWith("54")) {
    d = d.slice(2);
    if (d.startsWith("9")) d = d.slice(1);
  }
  if (d.startsWith("0")) d = d.slice(1);
  // número local sin característica
  if (d.length === 8 && d.startsWith("15")) d = d.slice(2);
  if (d.length <= 7) d = SITE_AREA_CODE + d;
  // área + 15 + número (12 dígitos): sacar el 15
  if (d.length === 12) {
    for (const i of [4, 3, 2]) {
      if (d.slice(i, i + 2) === "15") {
        d = d.slice(0, i) + d.slice(i + 2);
        break;
      }
    }
  }
  return `549${d}`;
}

export function whatsappOrderUrl(phone, text) {
  return `https://wa.me/${waNumber(phone)}?text=${encodeURIComponent(text)}`;
}

export function whatsappShareUrl(text) {
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}

export function productPath(id) {
  return `/producto/${encodeURIComponent(id)}`;
}

export function productUrl(id) {
  return `${SITE_URL}${productPath(id)}`;
}

function handleFrom(raw, hosts) {
  let s = String(raw ?? "").trim();
  if (!s) return "";
  if (/^https?:\/\//i.test(s)) {
    try {
      const u = new URL(s);
      if (hosts.some((h) => u.hostname.endsWith(h))) return u.pathname.split("/").filter(Boolean)[0] || "";
      return "";
    } catch {
      return "";
    }
  }
  s = s.replace(/^@/, "").split(/[/?#\s]/)[0];
  return s;
}

export function instagramUrl(raw) {
  const h = handleFrom(raw, ["instagram.com"]);
  return h ? `https://www.instagram.com/${encodeURIComponent(h)}/` : "";
}

export function facebookUrl(raw) {
  const h = handleFrom(raw, ["facebook.com", "fb.com"]);
  return h ? `https://www.facebook.com/${encodeURIComponent(h)}` : "";
}

/** Agrega ciudad y provincia si faltan. */
export function fullAddress(dir) {
  const s = String(dir ?? "").trim();
  if (!s) return "";
  return slugText(s).includes(slugText(SITE_CITY)) ? s : `${s}, ${SITE_CITY}, ${SITE_PROVINCE}`;
}

export function mapsUrl(dir) {
  const a = fullAddress(dir);
  return a ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(a)}` : "";
}
