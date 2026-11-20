import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { PageBanner } from "@/components/layout/PageBanner";
import { getCollections } from "@/lib/catalog";
import { issueLabel } from "@/lib/format";

export const metadata: Metadata = {
  title: "Character Collections",
  description: "Every Superhero Huff character collection, issue by issue: Black Majic, Lioness Calm, Peaceful Powerful, Unleashed, Vortex and more.",
  alternates: { canonical: "/collections" },
};

export default async function CollectionsPage() {
  const collections = await getCollections();
  return (
    <>
      <PageBanner eyebrow="The character collections" title="Every issue" intro="Each collection is a chapter of Agent Huff's story, printed head to toe." />
      <section className="on-paper bg-paper py-14 text-ink lg:py-20">
        <ul className="mx-auto grid max-w-[1440px] gap-6 px-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-3 lg:gap-8 lg:px-10">
          {collections.map((c, i) => (
            <li key={c.slug} data-reveal style={{ "--reveal-delay": `${(i % 3) * 70}ms` } as React.CSSProperties}>
              <Link href={`/collections/${c.slug}`} className="group block border-2 border-ink bg-white shadow-panel transition-[transform,box-shadow] duration-200 hover:-translate-x-1 hover:-translate-y-1 hover:shadow-panel-lg">
                <div className="flex items-center justify-between border-b-2 border-ink bg-ink px-4 py-2 text-white">
                  <span className="font-display text-xl text-yellow">{issueLabel(c.issue)}</span>
                  <span className="text-xs font-bold uppercase tracking-widest text-mist">
                    {c.count} piece{c.count === 1 ? "" : "s"}
                  </span>
                </div>
                <div className="relative aspect-[4/3]">
                  {c.cover && <Image src={c.cover} alt="" fill sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 90vw" className="object-contain p-5 transition-transform duration-500 group-hover:scale-105" />}
                </div>
                <div className="border-t-2 border-ink bg-yellow px-4 py-3">
                  <h2 className="display text-4xl">{c.name}</h2>
                  {c.tagline && <p className="mt-1 text-sm font-semibold">{c.tagline}</p>}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
