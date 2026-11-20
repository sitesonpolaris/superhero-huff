import type { Metadata } from "next";
import Link from "next/link";
import { ContactForm } from "@/components/forms/ContactForm";
import { PageBanner } from "@/components/layout/PageBanner";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact",
  description: "Questions about an order, sizing or custom pieces? Get in touch with the Superhero Huff team.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <>
      <PageBanner eyebrow="Stay in touch with Agent Huff" title="Contact" intro="Questions about an order, sizing or a custom piece? Send us a message." />
      <section className="on-paper bg-paper py-14 text-ink lg:py-20">
        <div className="mx-auto grid max-w-[1440px] gap-14 px-4 sm:px-6 md:grid-cols-[1.3fr_1fr] lg:px-10">
          <ContactForm />
          <aside className="space-y-8">
            <div>
              <p className="eyebrow text-purple">Email</p>
              <a href={`mailto:${site.email}`} className="mt-2 block break-all text-xl font-bold underline decoration-2 underline-offset-4">
                {site.email}
              </a>
            </div>
            <div>
              <p className="eyebrow text-purple">Social</p>
              <ul className="mt-3 space-y-2">
                {site.social.map((s) => (
                  <li key={s.label}>
                    <a href={s.href} target="_blank" rel="noopener noreferrer" className="text-lg font-bold hover:underline">
                      {s.label} ↗
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div className="border-2 border-ink bg-white p-5 shadow-panel">
              <p className="font-bold">Already ordered?</p>
              <p className="mt-1 text-sm text-slate">Check where your package is with your order number and email.</p>
              <Link href="/track" className="mt-3 inline-block text-sm font-extrabold uppercase tracking-wider underline">
                Track an order →
              </Link>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
