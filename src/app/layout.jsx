import { Alegreya_Sans, Oleo_Script } from "next/font/google";
import { BRAND, SITE_DESCRIPTION, SITE_NAME, SITE_SHORT_NAME, SITE_URL } from "@/lib/site";
import "./globals.css";

const display = Oleo_Script({ subsets: ["latin"], weight: "400", variable: "--font-brand", display: "swap" });
const body = Alegreya_Sans({ subsets: ["latin"], weight: ["400", "500", "700", "800"], variable: "--font-text", display: "swap" });

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: `${SITE_NAME} | Carta y pedidos`, template: `%s | ${SITE_NAME}` },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "es_AR",
    url: "/",
    siteName: SITE_NAME,
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
  },
  twitter: { card: "summary_large_image", title: SITE_NAME, description: SITE_DESCRIPTION },
  appleWebApp: { capable: true, title: SITE_SHORT_NAME, statusBarStyle: "black-translucent" },
  formatDetection: { telephone: false },
};

export const viewport = {
  themeColor: BRAND.wood,
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es-AR" className={`${display.variable} ${body.variable}`}>
      {/* Extensiones del navegador (ColorZilla, Grammarly, etc.) agregan atributos al body antes
          de que cargue React. Esto solo ignora diferencias de atributos de este elemento. */}
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
