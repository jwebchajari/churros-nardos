"use client";
// Carrito en localStorage con TTL de 3 h. Solo guarda la selección (id, cantidad, opciones);
// los precios se recalculan siempre con datos del servidor.
import { useSyncExternalStore } from "react";
import { LOCAL } from "./site";

const KEY = `carrito:${LOCAL}`;
const TTL = 3 * 60 * 60 * 1000;
const EMPTY = [];
const listeners = new Set();

let cachedRaw = null;
let cachedItems = EMPTY;

function read() {
  let raw = null;
  try {
    raw = window.localStorage.getItem(KEY);
  } catch {
    return cachedItems;
  }
  if (raw === cachedRaw) return cachedItems;
  cachedRaw = raw;
  try {
    const data = raw ? JSON.parse(raw) : null;
    const fresh = data && Array.isArray(data.items) && Date.now() - Number(data.ts) < TTL;
    cachedItems = fresh ? data.items.filter(validItem) : EMPTY;
  } catch {
    cachedItems = EMPTY;
  }
  return cachedItems;
}

function validItem(it) {
  return it && typeof it.id === "string" && Number.isInteger(it.qty) && it.qty > 0;
}

function write(items) {
  try {
    if (items.length === 0) window.localStorage.removeItem(KEY);
    else window.localStorage.setItem(KEY, JSON.stringify({ ts: Date.now(), items }));
  } catch {
    // modo privado o almacenamiento lleno: el carrito vive solo en memoria
    cachedRaw = Symbol("mem");
    cachedItems = items;
  }
  listeners.forEach((l) => l());
}

function subscribe(cb) {
  listeners.add(cb);
  const onStorage = (e) => {
    if (e.key === KEY) cb();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", onStorage);
  };
}

export function useCart() {
  return useSyncExternalStore(subscribe, read, () => EMPTY);
}

export function lineKey({ id, meats, pack, nota }) {
  return [id, meats ?? "", pack ?? "", (nota || "").trim().toLowerCase()].join("|");
}

export function addItem({ id, qty = 1, meats = null, pack = null, nota = "" }) {
  const item = { id, qty, meats, pack, nota: nota.trim().slice(0, 200) };
  item.key = lineKey(item);
  const items = read();
  const found = items.find((i) => i.key === item.key);
  const next = found
    ? items.map((i) => (i.key === item.key ? { ...i, qty: Math.min(99, i.qty + qty) } : i))
    : [...items, item];
  write(next);
}

export function updateItem(key, patch) {
  const items = read();
  const next = [];
  for (const i of items) {
    if (i.key !== key) {
      next.push({ ...i });
      continue;
    }
    const updated = { ...i, ...patch };
    updated.key = lineKey(updated);
    if (updated.qty <= 0) continue;
    const dup = next.find((n) => n.key === updated.key);
    if (dup) dup.qty = Math.min(99, dup.qty + updated.qty);
    else next.push(updated);
  }
  write(next);
}

export function removeItem(key) {
  write(read().filter((i) => i.key !== key));
}

export function clearCart() {
  write([]);
}

export function cartCount(items) {
  return items.reduce((n, i) => n + i.qty, 0);
}
