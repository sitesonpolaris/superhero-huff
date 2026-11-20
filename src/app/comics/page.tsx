import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getCatalog } from "@/lib/catalog";
import { money } from "@/lib/format";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Comic Books",
  description: "Superhero Huff comic books from Engendering Strength: Engendering Strength #1–#4, Book of Confidence and Justice of Truth. Printed and shipped.",
  alternates: { canonical: "/comics" },
};

export default async function ComicsPage() {
  const { products } = await getCatalog();
  const comics = products.filter((p) => p.categories.includes("comics")).sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));
  return (
    <>
      <section className="cut-bottom relative isolate overflow-hidden bg-ink pb-[calc(2.5vw+4rem)] pt-16 lg:pt-24">
        <Image src="/brand/huff-space.webp" alt="" fill priority sizes="100vw" className="-z-10 object-cover object-[60%_center] opacity-70" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-ink via-ink/70 to-transparent" />
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10">
          <p className="eyebrow text-yellow">Published by {site.publisher}</p>
          <h1 className="display mt-3 max-w-[10ch] text-[clamp(3.5rem,11vw,8rem)]">The comics</h1>
          <p className="mt-4 max-w-lg text-lg text-white/85">{site.story}</p>
        </div>
      </section>
      <section className="on-paper bg-paper py-14 text-ink lg:py-20">
        <ul className="mx-auto grid max-w-[1440px] grid-cols-2 gap-x-6 gap-y-12 px-4 sm:px-6 md:grid-cols-3 lg:px-10 xl:grid-cols-6">
          {comics.map((c, i) => (
            <li key={c.id} data-reveal style={{ "--reveal-delay": `${(i % 6) * 50}ms` } as React.CSSProperties}>
              <Link href={`/product/${c.slug}`} className="group block">
                <div className="relative aspect-[3/4] transition-transform duration-300 ease-[var(--ease-snap)] group-hover:-translate-y-2 group-hover:-rotate-1">
                  {c.images[0] && <Image src={c.images[0].src} alt={`${c.name} cover`} fill sizes="(min-width: 1280px) 15vw, (min-width: 768px) 30vw, 45vw" className="object-contain" />}
                </div>
                <h2 className="mt-3 font-bold leading-snug group-hover:underline">{c.name}</h2>
                <p className="text-sm font-semibold tabular-nums text-slate">{money(c.price)} · Printed comic</p>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
