// Piezas compartidas de las imágenes Open Graph (next/og). Fuente de marca embebida.
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { cacheLife } from "next/cache";
import { ImageResponse } from "next/og";
import sharp from "sharp";
import { BRAND, SITE_CITY, SITE_NAME, SITE_PROVINCE } from "./site";
import { cldUrl, isCloudinary } from "./cloudinary-url";

export const OG_SIZE = { width: 1200, height: 630 };

const assets = join(process.cwd(), "src/assets/og");
const fontPromise = readFile(join(assets, "OleoScript-Regular.woff"));
const logoPromise = readFile(join(assets, "logo.jpg")).then((b) => `data:image/jpeg;base64,${b.toString("base64")}`);

export async function ogOptions() {
  return {
    ...OG_SIZE,
    fonts: [{ name: "Oleo Script", data: await fontPromise, style: "normal", weight: 400 }],
  };
}

export function logoDataUrl() {
  return logoPromise;
}

/**
 * Renderiza con next/og y convierte a JPEG: un PNG con foto pesa 400 KB o más,
 * y WhatsApp a veces no muestra la vista previa con imágenes pesadas.
 */
export async function ogJpeg(element) {
  const png = Buffer.from(await new ImageResponse(element, await ogOptions()).arrayBuffer());
  const jpg = await sharp(png).jpeg({ quality: 82, mozjpeg: true }).toBuffer();
  return new Response(jpg, {
    headers: { "content-type": "image/jpeg", "cache-control": "public, max-age=3600, stale-while-revalidate=86400" },
  });
}

/** Descarga la foto del producto como data URL (jpeg/png). Si falla, null. */
export async function productImageData(url) {
  "use cache";
  cacheLife("hours");
  if (!url) return null;
  const src = isCloudinary(url) ? cldUrl(url, "f_jpg,q_80,c_fill,w_700,h_630") : url;
  try {
    const res = await fetch(src, { signal: AbortSignal.timeout(5000) });
    if (!res.ok) return null;
    const type = (res.headers.get("content-type") || "").split(";")[0];
    if (!/^image\/(jpeg|png)$/.test(type)) return null;
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length > 4_000_000) return null;
    return `data:${type};base64,${buf.toString("base64")}`;
  } catch {
    return null;
  }
}

export function Frame({ children }) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        background: BRAND.wood,
        backgroundImage: "radial-gradient(circle at 20% 30%, rgba(236,217,174,0.2), rgba(44,31,22,0) 60%)",
        color: BRAND.cream,
        fontFamily: "Oleo Script",
      }}
    >
      {children}
    </div>
  );
}

export function SiteCard({ logo }) {
  return (
    <Frame>
      <div style={{ display: "flex", alignItems: "center", gap: 56, padding: "0 72px", width: "100%" }}>
        <img src={logo} width={400} height={400} style={{ borderRadius: 400, boxShadow: "0 18px 40px rgba(20,13,9,0.5)" }} alt="" />
        <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
          <div style={{ fontSize: 76, lineHeight: 1.05 }}>Churros</div>
          <div style={{ fontSize: 124, lineHeight: 1.05, color: BRAND.sand }}>Nardo’s</div>
          <div style={{ fontSize: 40, marginTop: 28 }}>Carta y pedidos por WhatsApp</div>
          <div style={{ fontSize: 30, marginTop: 6, color: "#D9C8A6" }}>
            {`${SITE_CITY}, ${SITE_PROVINCE}`}
          </div>
        </div>
      </div>
    </Frame>
  );
}

const OG_PHOTO_W = 480;
const OG_TEXT_W = OG_SIZE.width - OG_PHOTO_W - 96;

/** Achica el nombre para que entre en una línea. Solo los muy largos pasan a dos. */
function nameStyle(name) {
  const fit = Math.floor(OG_TEXT_W / (name.length * 0.47));
  return fit >= 46 ? { fontSize: Math.min(fit, 84), whiteSpace: "nowrap" } : { fontSize: 46 };
}

export function ProductCard({ name, price, image, logo }) {
  return (
    <Frame>
      {image ? (
        <img src={image} width={OG_PHOTO_W} height={630} style={{ objectFit: "cover", width: OG_PHOTO_W, height: 630 }} alt="" />
      ) : (
        <div style={{ width: OG_PHOTO_W, height: 630, display: "flex", alignItems: "center", justifyContent: "center", background: "#38281C" }}>
          <img src={logo} width={340} height={340} style={{ borderRadius: 340 }} alt="" />
        </div>
      )}
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", width: OG_TEXT_W + 96, padding: "56px 48px 48px" }}>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ ...nameStyle(name), lineHeight: 1.05 }}>{name}</div>
          <div style={{ fontSize: 76, marginTop: 20, color: BRAND.sand }}>{price}</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <img src={logo} width={96} height={96} style={{ borderRadius: 96 }} alt="" />
          <div style={{ fontSize: 36 }}>{SITE_NAME}</div>
        </div>
      </div>
    </Frame>
  );
}
