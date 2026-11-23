"use client";
import { Minus, Plus } from "lucide-react";
import s from "./ui.module.css";

export default function Stepper({ value, onChange, min = 1, max = 99, label = "Cantidad", size = "md" }) {
  return (
    <div className={`${s.stepper} ${size === "sm" ? s.stepperSm : ""}`} role="group" aria-label={label}>
      <button
        type="button"
        className={s.stepBtn}
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        aria-label={`Restar ${label.toLowerCase()}`}
      >
        <Minus size={18} aria-hidden />
      </button>
      <output className={s.stepValue} aria-live="polite">
        {value}
      </output>
      <button
        type="button"
        className={s.stepBtn}
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        aria-label={`Sumar ${label.toLowerCase()}`}
      >
        <Plus size={18} aria-hidden />
      </button>
    </div>
  );
}
