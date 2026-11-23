import "server-only";
import { createHash } from "node:crypto";
import { cloudNameFromUrl, publicIdFromUrl } from "./cloudinary-url";

const DB_URL = (process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL || "").replace(/\/+$/, "");
const CLOUD = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "";
const KEY = process.env.CLOUDINARY_API_KEY || "";
const SECRET = process.env.CLOUDINARY_API_SECRET || "";

/**
 * Borra de Cloudinary una foto reemplazada o eliminada, solo si:
 * - es de nuestra cuenta y de la carpeta del local,
 * - ningún producto del local la sigue usando.
 */
export async function destroyIfUnused({ slug, url, folderRoot }) {
  if (!CLOUD || !KEY || !SECRET || !DB_URL) return { deleted: false, reason: "no-config" };
  if (cloudNameFromUrl(url) !== CLOUD) return { deleted: false, reason: "foreign" };
  const publicId = publicIdFromUrl(url);
  if (!publicId || !publicId.startsWith(`${folderRoot}/${slug}/`)) return { deleted: false, reason: "outside-folder" };

  const res = await fetch(`${DB_URL}/locales/${slug}/comidas.json`, { cache: "no-store" });
  if (!res.ok) return { deleted: false, reason: "db" };
  const comidas = (await res.json()) || {};
  const inUse = Object.values(comidas).some((c) => c && typeof c.imagen === "string" && publicIdFromUrl(c.imagen) === publicId);
  if (inUse) return { deleted: false, reason: "in-use" };

  const timestamp = Math.floor(Date.now() / 1000);
  const signature = createHash("sha1").update(`invalidate=true&public_id=${publicId}&timestamp=${timestamp}${SECRET}`).digest("hex");
  const body = new URLSearchParams({ public_id: publicId, timestamp: String(timestamp), api_key: KEY, invalidate: "true", signature });
  const del = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD}/image/destroy`, { method: "POST", body });
  const out = await del.json().catch(() => ({}));
  return { deleted: out.result === "ok", reason: out.result || "error" };
}
