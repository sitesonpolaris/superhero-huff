import type { Metadata } from "next";
import { LegalPage } from "@/components/layout/LegalPage";
import { privacyHtml } from "@/content/legal";

export const metadata: Metadata = { title: "Privacy Policy", alternates: { canonical: "/privacy" } };

export default function Page() {
  return <LegalPage eyebrow="Legal" title="Privacy policy" html={privacyHtml.replace(/^<h2>Privacy Policy<\/h2>\s*/i, "")} />;
}
