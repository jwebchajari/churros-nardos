import { OG_SIZE, ProductCard, SiteCard, logoDataUrl, ogJpeg, productImageData } from "@/lib/og";
import { getProduct } from "@/lib/menu";
import { SITE_NAME, formatPrice, unitPrice } from "@/lib/site";

export const alt = `Producto de ${SITE_NAME}`;
export const size = OG_SIZE;
export const contentType = "image/jpeg";

export default async function Image({ params }) {
  const { id } = await params;
  const [product, logo] = await Promise.all([getProduct(id), logoDataUrl()]);
  if (!product) return ogJpeg(<SiteCard logo={logo} />);
  const image = await productImageData(product.imagen);
  return ogJpeg(<ProductCard name={product.nombre} price={formatPrice(unitPrice(product))} image={image} logo={logo} />);
}
