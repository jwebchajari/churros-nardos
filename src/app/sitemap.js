import { getLocal } from "@/lib/menu";
import { SITE_URL, productUrl } from "@/lib/site";

export default async function sitemap() {
  const { productos } = await getLocal();
  return [
    { url: SITE_URL, changeFrequency: "daily", priority: 1 },
    ...productos
      .filter((p) => !p.oculto)
      .map((p) => ({ url: productUrl(p.id), changeFrequency: "weekly", priority: 0.7 })),
  ];
}
