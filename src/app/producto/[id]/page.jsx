import { Suspense } from "react";
import { notFound } from "next/navigation";
import MenuApp from "@/components/menu/MenuApp";
import { MenuSkeleton } from "@/components/Loading";
import { JsonLd, productJsonLd } from "@/lib/jsonld";
import { getLocal, getProduct } from "@/lib/menu";
import { SITE_NAME, formatPrice, productPath, unitPrice } from "@/lib/site";

// Con Cache Components tiene que devolver al menos un param. Si todavía no hay productos,
// se prerenderiza un id inexistente que responde 404.
export async function generateStaticParams() {
  const { productos } = await getLocal();
  const ids = productos.filter((p) => !p.oculto).map((p) => ({ id: p.id }));
  return ids.length ? ids : [{ id: "sin-productos" }];
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  const p = await getProduct(id);
  if (!p) return { title: "Producto no encontrado", robots: { index: false } };
  const description = (p.descripcion || `${p.nombre} en ${SITE_NAME}.`).slice(0, 150) + ` ${formatPrice(unitPrice(p))}.`;
  return {
    title: p.nombre,
    description,
    alternates: { canonical: productPath(p.id) },
    openGraph: { type: "website", url: productPath(p.id), title: `${p.nombre} | ${SITE_NAME}`, description },
    twitter: { card: "summary_large_image", title: `${p.nombre} | ${SITE_NAME}`, description },
  };
}

async function ProductContent({ params }) {
  const { id } = await params;
  const data = await getLocal();
  const product = data.productos.find((p) => p.id === id && !p.oculto);
  if (!product) notFound();
  return (
    <>
      <JsonLd data={productJsonLd(product)} />
      <MenuApp data={data} spotlightId={product.id} />
    </>
  );
}

export default function ProductPage({ params }) {
  return (
    <Suspense fallback={<MenuSkeleton />}>
      <ProductContent params={params} />
    </Suspense>
  );
}
