"use client";
import { useState } from "react";
import { Banknote, Bike, Check, Copy, CreditCard, Landmark, MapPin, Route, Store } from "lucide-react";
import { SHIPPING_ZONES, envioLabel, shippingCost } from "@/lib/site";
import s from "./checkout.module.css";

function Choice({ name, value, checked, onChange, icon: Icon, title, note }) {
  return (
    <label className={s.choice}>
      <input type="radio" name={name} value={value} checked={checked} onChange={() => onChange(value)} />
      <Icon size={20} aria-hidden />
      <span className={s.choiceText}>
        <span className={s.choiceTitle}>{title}</span>
        {note ? <span className={s.choiceNote}>{note}</span> : null}
      </span>
    </label>
  );
}

export default function BuyerForm({ buyer, setBuyer, datos, errors }) {
  const [copied, setCopied] = useState(false);
  const set = (k) => (v) => setBuyer((b) => ({ ...b, [k]: v }));

  async function copyAlias() {
    try {
      await navigator.clipboard.writeText(datos.alias);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className={s.form}>
      <label className="field">
        <span>Tu nombre</span>
        <input
          className="input"
          name="name"
          autoComplete="name"
          value={buyer.nombre}
          maxLength={60}
          onChange={(e) => set("nombre")(e.target.value)}
          aria-invalid={errors.nombre ? "true" : undefined}
          aria-describedby={errors.nombre ? "err-nombre" : undefined}
        />
        {errors.nombre ? (
          <span id="err-nombre" className="error-text">
            {errors.nombre}
          </span>
        ) : null}
      </label>

      <fieldset className={s.fieldset}>
        <legend className="label">¿Cómo lo recibís?</legend>
        <div className={s.choices}>
          <Choice
            name="entrega"
            value="envio"
            checked={buyer.entrega === "envio"}
            onChange={set("entrega")}
            icon={Bike}
            title="Envío a domicilio"
            note="El costo depende de la zona"
          />
          <Choice
            name="entrega"
            value="retiro"
            checked={buyer.entrega === "retiro"}
            onChange={set("entrega")}
            icon={Store}
            title="Retiro en el local"
            note="Sin costo"
          />
        </div>
      </fieldset>

      {buyer.entrega === "envio" ? (
        <>
          <fieldset className={s.fieldset}>
            <legend className="label">¿A qué zona?</legend>
            <div className={s.choices}>
              {SHIPPING_ZONES.map((z) => (
                <Choice
                  key={z.id}
                  name="zona"
                  value={z.id}
                  checked={buyer.zona === z.id}
                  onChange={set("zona")}
                  icon={z.id === "ciudad" ? MapPin : Route}
                  title={z.label}
                  note={`Envío: ${envioLabel(shippingCost(datos, z.id))}`}
                />
              ))}
            </div>
          </fieldset>
          <label className="field">
            <span>Dirección</span>
            <input
              className="input"
              name="street-address"
              autoComplete="street-address"
              value={buyer.direccion}
              maxLength={120}
              placeholder="Calle y número"
              onChange={(e) => set("direccion")(e.target.value)}
              aria-invalid={errors.direccion ? "true" : undefined}
              aria-describedby={errors.direccion ? "err-direccion" : undefined}
            />
            {errors.direccion ? (
              <span id="err-direccion" className="error-text">
                {errors.direccion}
              </span>
            ) : null}
          </label>
          <label className="field">
            <span>Referencia (opcional)</span>
            <input
              className="input"
              value={buyer.referencia}
              maxLength={120}
              placeholder="Ej: casa con portón negro"
              onChange={(e) => set("referencia")(e.target.value)}
            />
          </label>
        </>
      ) : null}

      <fieldset className={s.fieldset}>
        <legend className="label">¿Cómo pagás?</legend>
        <div className={s.choices}>
          <Choice name="pago" value="efectivo" checked={buyer.pago === "efectivo"} onChange={set("pago")} icon={Banknote} title="Efectivo" />
          <Choice
            name="pago"
            value="transferencia"
            checked={buyer.pago === "transferencia"}
            onChange={set("pago")}
            icon={Landmark}
            title="Transferencia"
          />
          <Choice name="pago" value="tarjeta" checked={buyer.pago === "tarjeta"} onChange={set("pago")} icon={CreditCard} title="Tarjeta" />
        </div>
      </fieldset>

      {buyer.pago === "efectivo" ? (
        <label className="field">
          <span>¿Con cuánto pagás? (opcional)</span>
          <input
            className="input"
            inputMode="numeric"
            value={buyer.pagaCon}
            placeholder="Para llevarte el vuelto"
            onChange={(e) => set("pagaCon")(e.target.value.replace(/\D/g, "").slice(0, 9))}
          />
        </label>
      ) : null}

      {buyer.pago === "transferencia" ? (
        datos.alias ? (
          <div className={s.alias}>
            <div>
              <span className="label">Alias</span>
              <p className={s.aliasValue}>{datos.alias}</p>
            </div>
            <button type="button" className="btn btn-ghost" onClick={copyAlias}>
              {copied ? <Check size={18} aria-hidden /> : <Copy size={18} aria-hidden />}
              {copied ? "Copiado" : "Copiar"}
            </button>
            <p className="hint" style={{ gridColumn: "1 / -1" }}>
              Mandá el comprobante por WhatsApp junto con el pedido.
            </p>
          </div>
        ) : (
          <p className="hint">Te pasamos el alias por WhatsApp.</p>
        )
      ) : null}

      <label className="field">
        <span>Comentario (opcional)</span>
        <textarea
          className="input"
          rows={2}
          value={buyer.comentario}
          maxLength={200}
          placeholder="Algo más que tengamos que saber"
          onChange={(e) => set("comentario")(e.target.value)}
        />
      </label>
    </div>
  );
}
