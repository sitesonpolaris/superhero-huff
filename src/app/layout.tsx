import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { CartProvider } from "@/components/cart/CartProvider";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { SiteMotion } from "@/components/SiteMotion";
import { getCatalog } from "@/lib/catalog";
import { site } from "@/lib/site";
import "./globals.css";

const anton = localFont({
  src: "../../node_modules/@fontsource/anton/files/anton-latin-400-normal.woff2",
  variable: "--font-anton",
  weight: "400",
  display: "swap",
  fallback: ["Impact", "Arial Narrow", "sans-serif"],
});

const archivo = localFont({
  src: "../../node_modules/@fontsource-variable/archivo/files/archivo-latin-wght-normal.woff2",
  variable: "--font-archivo",
  weight: "100 900",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: "Superhero Huff | Comic-Book Apparel & Comics", template: "%s | Superhero Huff" },
  description: site.description,
  openGraph: {
    type: "website",
    siteName: site.name,
    images: [{ url: "/brand/og.jpg", width: 1200, height: 630, alt: "Agent Huff, Superhero Huff" }],
  },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  themeColor: "#0b0d14",
  colorScheme: "dark",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { collections, settings } = await getCatalog();
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "OnlineStore",
    name: site.name,
    url: site.url,
    logo: `${site.url}/brand/logo.png`,
    email: site.email,
    sameAs: site.social.map((s) => s.href),
  };

  return (
    <html lang="en" className={`${anton.variable} ${archivo.variable}`}>
      <body className="flex min-h-dvh flex-col">
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:bg-yellow focus:px-4 focus:py-3 focus:font-bold focus:text-ink">
          Skip to content
        </a>
        <CartProvider>
          <Header
            collections={collections.map((c) => ({ slug: c.slug, name: c.name, issue: c.issue }))}
            announcement={settings.announcement ?? "New drop: the Signature puffer & motorcycle jackets"}
          />
          <main id="main" className="flex-1">
            {children}
          </main>
          <Footer collections={collections.map((c) => ({ slug: c.slug, name: c.name }))} />
          <CartDrawer flatShippingCents={settings.flatShippingCents} freeShippingThresholdCents={settings.freeShippingThresholdCents} />
        </CartProvider>
        <SiteMotion />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </body>
    </html>
  );
}

