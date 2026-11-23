import { PAYMENT_METHODS, SITE_COUNTRY, SITE_CITY, SITE_DESCRIPTION, SITE_NAME, SITE_PROVINCE, SITE_URL, productPacks, productUrl, unitPrice, waNumber, instagramUrl, facebookUrl } from "./site";
import { openingHoursSpec } from "@/utils/horarios";

export function restaurantJsonLd({ datos, horarios }) {
  const phone = waNumber(datos.whatsapp);
  const sameAs = [instagramUrl(datos.redes.instagram), facebookUrl(datos.redes.facebook)].filter(Boolean);
  const data = {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    "@id": `${SITE_URL}/#restaurant`,
    name: datos.nombre || SITE_NAME,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    image: `${SITE_URL}/logo.png`,
    logo: `${SITE_URL}/logo.png`,
    servesCuisine: ["Churros"],
    hasMenu: SITE_URL,
    acceptsReservations: false,
    paymentAccepted: PAYMENT_METHODS.map((m) => m.label).join(", "),
    address: {
      "@type": "PostalAddress",
      ...(datos.direccion ? { streetAddress: datos.direccion } : {}),
      addressLocality: SITE_CITY,
      addressRegion: SITE_PROVINCE,
      addressCountry: SITE_COUNTRY,
    },
  };
  if (phone.length > 3) data.telephone = `+${phone}`;
  if (sameAs.length) data.sameAs = sameAs;
  const hours = openingHoursSpec(horarios);
  if (hours.length) data.openingHoursSpecification = hours;
  return data;
}

export function productJsonLd(product) {
  const prices = productPacks(product).map((p) => p.precio);
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.nombre,
    ...(product.descripcion ? { description: product.descripcion } : {}),
    ...(product.imagen ? { image: [product.imagen] } : {}),
    url: productUrl(product.id),
    brand: { "@type": "Brand", name: SITE_NAME },
    offers: {
      ...(prices.length > 1
        ? { "@type": "AggregateOffer", lowPrice: Math.min(...prices), highPrice: Math.max(...prices), offerCount: prices.length }
        : { "@type": "Offer", price: unitPrice(product) }),
      priceCurrency: "ARS",
      availability: "https://schema.org/InStock",
      url: productUrl(product.id),
      seller: { "@id": `${SITE_URL}/#restaurant` },
    },
  };
}

/** Serializa evitando que un "</script>" en los datos cierre la etiqueta. */
export function JsonLd({ data }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
