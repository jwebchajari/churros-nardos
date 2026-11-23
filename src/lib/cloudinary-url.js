// Helpers de URLs de Cloudinary (sin dependencias, sirven en cliente y servidor).

const CLD = /^https:\/\/res\.cloudinary\.com\/([^/]+)\/image\/upload\/(.+)$/i;

export function isCloudinary(url) {
  return CLD.test(String(url || ""));
}

export function cloudNameFromUrl(url) {
  return String(url || "").match(CLD)?.[1] || "";
}

/** Inserta una transformación, ej. cldUrl(url, "f_auto,q_auto,w_480"). Otras URLs pasan sin cambios. */
export function cldUrl(url, transform = "f_auto,q_auto") {
  const m = String(url || "").match(CLD);
  if (!m) return url || "";
  return `https://res.cloudinary.com/${m[1]}/image/upload/${transform}/${m[2]}`;
}

/** public_id sin transformaciones, versión ni extensión. */
export function publicIdFromUrl(url) {
  const m = String(url || "").match(CLD);
  if (!m) return "";
  const parts = m[2].split("?")[0].split("/");
  // descartar segmentos de transformación (contienen "_" y ",", o empiezan con letra_)
  let i = 0;
  while (i < parts.length - 1 && /^[a-z]{1,3}_[^/]*$/i.test(parts[i]) && !/^v\d+$/.test(parts[i])) i++;
  if (/^v\d+$/.test(parts[i])) i++;
  const rest = parts.slice(i).join("/");
  return decodeURIComponent(rest.replace(/\.[a-z0-9]+$/i, ""));
}
