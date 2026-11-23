import CheckoutApp from "@/components/checkout/CheckoutApp";
import { getLocal } from "@/lib/menu";

export const metadata = {
  title: "Tu pedido",
  robots: { index: false, follow: true },
  alternates: { canonical: "/comprar" },
};

// Los precios salen del servidor; el carrito del navegador solo guarda la selección.
export default async function ComprarPage() {
  const data = await getLocal();
  return <CheckoutApp data={data} />;
}
