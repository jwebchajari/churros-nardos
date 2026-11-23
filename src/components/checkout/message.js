import { SITE_NAME, envioLabel, formatPrice, fullAddress, includesFries, isCustomizable, meatLabel, packUnits, paymentLabel, productPacks, shippingCost, shippingZone } from "@/lib/site";

/**
 * Mensaje de WhatsApp en texto plano con negritas (*...*).
 * El encoding se hace una sola vez, en whatsappOrderUrl().
 */
export function buildOrderMessage({ datos, lines, subtotal, buyer }) {
  const envio = buyer.entrega === "envio";
  const costo = envio ? shippingCost(datos, buyer.zona) : 0;
  const envioPending = envio && costo === null;
  const total = subtotal + (envio && !envioPending ? Number(costo) || 0 : 0);

  const out = [];
  out.push(`*Pedido para ${datos.nombre || SITE_NAME}*`);
  out.push("");
  out.push(`*Cliente:* ${buyer.nombre.trim()}`);
  out.push(`*Entrega:* ${envio ? "Envío a domicilio" : "Retiro en el local"}`);
  if (envio) {
    const fuera = shippingZone(buyer.zona).id === "fuera";
    out.push(`*Zona:* ${shippingZone(buyer.zona).label}`);
    // Fuera de la ciudad no se le agrega la ciudad a la dirección.
    out.push(`*Dirección:* ${fuera ? buyer.direccion.trim() : fullAddress(buyer.direccion.trim())}`);
    if (buyer.referencia.trim()) out.push(`*Referencia:* ${buyer.referencia.trim()}`);
  }
  out.push(`*Pago:* ${paymentLabel(buyer.pago)}`);
  if (buyer.pago === "efectivo" && buyer.pagaCon && Number(buyer.pagaCon) > 0) {
    out.push(`*Paga con:* ${formatPrice(buyer.pagaCon)}`);
  }
  out.push("");
  out.push("*Detalle*");
  for (const l of lines) {
    out.push(`${l.qty} x ${l.product.nombre}: ${formatPrice(l.total)}`);
    const pack = productPacks(l.product).find((p) => p.key === l.pack);
    if (pack) out.push(`   - Presentación ${pack.key}: ${packUnits(pack.cantidad * l.qty)} en total`);
    if (isCustomizable(l.product) && l.meats) out.push(`   - ${meatLabel(l.meats)}`);
    if (includesFries(l.product)) out.push("   - Con papas fritas");
    if (l.nota) out.push(`   - Aclaración: ${l.nota}`);
  }
  out.push("");
  out.push(`*Subtotal:* ${formatPrice(subtotal)}`);
  if (envio) out.push(`*Envío:* ${envioLabel(costo)}`);
  out.push(envioPending ? `*Total sin envío:* ${formatPrice(total)}` : `*Total:* ${formatPrice(total)}`);
  if (buyer.comentario?.trim()) {
    out.push("");
    out.push(`*Comentario:* ${buyer.comentario.trim()}`);
  }
  return { text: out.join("\n"), total, envioPending };
}
