// Verificación del ID token sin service account: leemos usuarios/{uid}.json?auth=<token>.
// Si el token es inválido o expiró, Firebase responde 401 y no hay acceso.
import "server-only";

const DB_URL = (process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL || "").replace(/\/+$/, "");
const SLUG = /^[a-z0-9-]{2,40}$/;

function uidFromToken(token) {
  try {
    const payload = JSON.parse(Buffer.from(token.split(".")[1], "base64url").toString("utf8"));
    return typeof payload.user_id === "string" ? payload.user_id : typeof payload.sub === "string" ? payload.sub : null;
  } catch {
    return null;
  }
}

export function bearer(request) {
  const h = request.headers.get("authorization") || "";
  return h.startsWith("Bearer ") ? h.slice(7).trim() : "";
}

/** Devuelve el perfil si el token es válido y tiene acceso al local; si no, null. */
export async function verifyAccess(request, slug) {
  if (!DB_URL || !SLUG.test(String(slug || ""))) return null;
  const token = bearer(request);
  const uid = token && uidFromToken(token);
  if (!uid || !/^[A-Za-z0-9]{1,128}$/.test(uid)) return null;
  try {
    const res = await fetch(`${DB_URL}/usuarios/${uid}.json?auth=${encodeURIComponent(token)}`, { cache: "no-store" });
    if (!res.ok) return null;
    const profile = await res.json();
    if (!profile) return null;
    const ok = profile.superadmin === true || profile.locales?.[slug] === true;
    return ok ? { uid, profile, token } : null;
  } catch {
    return null;
  }
}

export { SLUG };
