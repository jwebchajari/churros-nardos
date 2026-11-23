import MenuApp from "@/components/menu/MenuApp";
import { JsonLd, restaurantJsonLd } from "@/lib/jsonld";
import { getLocal } from "@/lib/menu";

// Carta pública. getLocal() usa "use cache" (cacheLife "minutes" + tag del local),
// así la página entra completa en el shell estático y se actualiza al guardar desde el panel.
export default async function Home() {
  const data = await getLocal();
  return (
    <>
      <JsonLd data={restaurantJsonLd(data)} />
      <MenuApp data={data} />
    </>
  );
}
