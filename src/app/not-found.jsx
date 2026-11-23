import Link from "next/link";

export const metadata = { title: "No encontrado", robots: { index: false } };

export default function NotFound() {
  return (
    <main style={{ minHeight: "80dvh", display: "grid", placeItems: "center", padding: 24, textAlign: "center" }}>
      <div style={{ display: "grid", gap: 16, justifyItems: "center" }}>
        <img src="/logo-hero.webp" alt="" width={120} height={120} style={{ borderRadius: "50%" }} />
        <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 400, fontSize: 36, textTransform: "uppercase" }}>
          Esto no está en la carta
        </h1>
        <p style={{ color: "var(--text-muted)" }}>Puede que el producto ya no esté disponible.</p>
        <Link href="/" className="btn btn-primary">
          Ver la carta
        </Link>
      </div>
    </main>
  );
}
