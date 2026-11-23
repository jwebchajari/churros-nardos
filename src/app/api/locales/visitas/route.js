import { LOCAL, TIMEZONE } from "@/lib/site";

const DB_URL = (process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL || "").replace(/\/+$/, "");

function today() {
  // en-CA formatea como YYYY-MM-DD
  return new Intl.DateTimeFormat("en-CA", { timeZone: TIMEZONE, year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
}

// POST público: suma 1 visita (total y del día). Las reglas solo permiten incrementos de a 1.
export async function POST() {
  if (!DB_URL) return Response.json({ ok: false }, { status: 503 });
  const inc = { ".sv": { increment: 1 } };
  try {
    const res = await fetch(`${DB_URL}/locales/${LOCAL}/visitas.json`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ total: inc, [`dias/${today()}`]: inc }),
    });
    return Response.json({ ok: res.ok }, { status: res.ok ? 200 : 502 });
  } catch {
    return Response.json({ ok: false }, { status: 502 });
  }
}
