import { OG_SIZE, SiteCard, logoDataUrl, ogJpeg } from "@/lib/og";
import { SITE_NAME } from "@/lib/site";

export const alt = `${SITE_NAME}: carta y pedidos por WhatsApp`;
export const size = OG_SIZE;
export const contentType = "image/jpeg";

export default async function Image() {
  return ogJpeg(<SiteCard logo={await logoDataUrl()} />);
}
