import type { Metadata } from "next";
import { LegalPage } from "@/components/layout/LegalPage";
import { termsHtml } from "@/content/legal";

export const metadata: Metadata = { title: "Terms & Conditions", alternates: { canonical: "/terms" } };

export default function Page() {
  return <LegalPage eyebrow="Legal" title="Terms & conditions" html={termsHtml} />;
}
