import type { Metadata } from "next";
import { LegalPage } from "@/components/layout/LegalPage";
import { shippingHtml } from "@/content/legal";

export const metadata: Metadata = { title: "Shipping & Returns", description: "How Superhero Huff orders ship, and our return policy.", alternates: { canonical: "/shipping-returns" } };

export default function Page() {
  return <LegalPage eyebrow="Help" title="Shipping & returns" html={shippingHtml} />;
}
