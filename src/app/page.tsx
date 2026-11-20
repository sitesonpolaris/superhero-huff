import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { HeroVideo } from "@/components/home/HeroVideo";
import { IssueRail, type RailIssue } from "@/components/home/IssueRail";
import { ProductCard } from "@/components/product/ProductCard";
import { getCatalog } from "@/lib/catalog";
import { money } from "@/lib/format";
import { site } from "@/lib/site";

export const metadata: Metadata = { alternates: { canonical: "/" } };

const CATEGORY_TILES = ["leggings", "jackets", "sets", "t-shirts", "hoodies", "womens"];

export default async function Home() {
  const { products, collections, categories } = await getCatalog();

  const issues: RailIssue[] = collections.map((c) => {
    const items = products.filter((p) => p.collection === c.slug);
    return {
      slug: c.slug,
      name: c.name,
      tagline: c.tagline,
      issue: c.issue,
      cover: c.cover,
      items: items.map((p) => ({ slug: p.slug, name: p.name, price: p.price, image: p.images[0]?.src ?? null })),
    };
  });
  const newDrop = products.filter((p) => p.isNew).slice(0, 4);
  const comics = products.filter((p) => p.categories.includes("comics"));
  const tiles = CATEGORY_TILES.map((slug) => {
    const cat = categories.find((c) => c.slug === slug);
    const pick = products.find((p) => p.categories.includes(slug) && p.images[0]);
    return cat && pick ? { ...cat, image: pick.images[0].src } : null;
  }).filter((x): x is NonNullable<typeof x> => x !== null);

  return (
    <>
      {/* HERO */}
      <section aria-labelledby="hero-title" className="cut-bottom relative isolate flex min-h-[86svh] items-end overflow-hidden bg-ink lg:min-h-[92svh]">
        <HeroVideo />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink via-ink/45 to-ink/10" />
        <div className="pointer-events-none absolute inset-y-0 left-0 w-2/3 bg-gradient-to-r from-ink/70 to-transparent max-sm:hidden" />
        <div className="relative z-10 mx-auto w-full max-w-[1440px] px-4 pb-[calc(2.5vw+3.5rem)] sm:px-6 lg:px-10 lg:pb-[calc(2.5vw+5rem)]">
          <p className="eyebrow text-yellow">Agent Huff is on the case</p>
          <h1 id="hero-title" className="display mt-3 max-w-[12ch] text-[clamp(3.25rem,10vw,8.5rem)]">
            Unleash your inner hero
          </h1>
          <p className="mt-4 max-w-md text-base text-white/85 sm:text-lg">All-over-print jackets, leggings and sets straight from the pages of the Superhero Huff comics.</p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link href="/shop" className="btn btn-yellow">
              Shop clothing
            </Link>
            <Link href="/comics" className="btn btn-ghost">
              Read the comics
            </Link>
          </div>
        </div>
      </section>

      {/* MARQUEE */}
      <div aria-hidden="true" className="-mt-[2.5vw] overflow-hidden border-y-2 border-ink bg-yellow py-3 text-ink">
        <div className="flex w-max animate-marquee gap-10 whitespace-nowrap">
          {[0, 1].map((k) => (
            <div key={k} className="flex gap-10">
              {collections.map((c) => (
                <span key={c.slug} className="display flex items-center gap-10 text-3xl">
                  {c.name}
                  <span className="text-xl">★</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* CHOOSE YOUR HUFF */}
      <section aria-labelledby="issues-title" className="halftone py-20 lg:py-28">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10">
          <div className="mb-10 flex flex-wrap items-end justify-between gap-4" data-reveal>
            <div>
              <p className="eyebrow text-yellow">The character collections</p>
              <h2 id="issues-title" className="display mt-2 text-6xl sm:text-7xl">
                Choose your Huff
              </h2>
            </div>
            <Link href="/collections" className="nav-link underline decoration-yellow decoration-2 underline-offset-8 hover:text-yellow">
              All {collections.length} issues
            </Link>
          </div>
          <IssueRail issues={issues} />
        </div>
      </section>

      {/* NEW DROP */}
      {newDrop.length > 0 && (
        <section aria-labelledby="new-title" className="on-paper cut-top bg-paper pb-20 pt-[calc(2.5vw+4rem)] text-ink lg:pb-28">
          <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10">
            <div className="mb-10 flex flex-wrap items-end justify-between gap-4" data-reveal>
              <div>
                <p className="eyebrow text-purple">New release</p>
                <h2 id="new-title" className="display mt-2 text-6xl sm:text-7xl">
                  The Signature line
                </h2>
                <p className="mt-3 max-w-lg text-slate">Cropped puffers, statement coats and motorcycle jackets in the Superhero Huff signature print.</p>
              </div>
              <Link href="/shop/jackets" className="btn btn-ink">
                Shop jackets
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4 md:gap-x-6">
              {newDrop.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* SHOP BY CATEGORY */}
      <section aria-labelledby="cat-title" className="on-paper bg-paper-2 py-20 text-ink lg:py-28">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10">
          <h2 id="cat-title" className="display text-6xl sm:text-7xl" data-reveal>
            Suit up
          </h2>
          <ul className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6">
            {tiles.map((t, i) => (
              <li key={t.slug} data-reveal style={{ "--reveal-delay": `${(i % 3) * 70}ms` } as React.CSSProperties}>
                <Link href={`/shop/${t.slug}`} className="group relative block aspect-[4/5] overflow-hidden border-2 border-ink bg-white shadow-panel transition-[transform,box-shadow] duration-200 hover:-translate-x-1 hover:-translate-y-1 hover:shadow-panel-lg sm:aspect-[5/4]">
                  <Image src={t.image} alt="" fill sizes="(min-width: 768px) 30vw, 46vw" className="object-contain p-6 pb-16 transition-transform duration-500 group-hover:scale-105" />
                  <div className="absolute inset-x-0 bottom-0 flex items-center justify-between border-t-2 border-ink bg-yellow px-4 py-3">
                    <span className="display text-2xl sm:text-3xl">{t.name}</span>
                    <span className="text-sm font-bold">{t.count}</span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* COMICS */}
      <section aria-labelledby="comics-title" className="relative overflow-hidden bg-ink py-20 lg:py-28">
        <Image src="/brand/huff-space.webp" alt="" fill sizes="100vw" className="object-cover object-[70%_center] opacity-45" />
        <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/85 to-ink/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-transparent to-ink/70" />
        <div className="relative mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10">
          <div className="max-w-xl" data-reveal>
            <p className="eyebrow text-yellow">Published by {site.publisher}</p>
            <h2 id="comics-title" className="display mt-2 text-6xl sm:text-7xl">
              The comics
            </h2>
            <p className="mt-4 text-lg text-white/85">{site.story} Every issue ships printed, straight to your door.</p>
          </div>
          <ul className="-mx-4 mt-12 flex snap-x snap-mandatory gap-5 overflow-x-auto px-4 pb-4 sm:mx-0 sm:grid sm:grid-cols-3 sm:overflow-visible sm:px-0 lg:grid-cols-6">
            {comics.map((c, i) => (
              <li key={c.id} className="w-40 shrink-0 snap-start sm:w-auto" data-reveal style={{ "--reveal-delay": `${i * 60}ms` } as React.CSSProperties}>
                <Link href={`/product/${c.slug}`} className="group block">
                  <div className="relative aspect-[3/4] transition-transform duration-300 ease-[var(--ease-snap)] group-hover:-translate-y-2 group-hover:-rotate-1">
                    {c.images[0] && <Image src={c.images[0].src} alt={`${c.name} comic cover`} fill sizes="(min-width: 1024px) 15vw, (min-width: 640px) 30vw, 160px" className="object-contain drop-shadow-[0_20px_30px_rgba(0,0,0,0.6)]" />}
                  </div>
                  <p className="mt-3 font-bold leading-snug group-hover:text-yellow">{c.name}</p>
                  <p className="text-sm text-mist tabular-nums">{money(c.price)}</p>
                </Link>
              </li>
            ))}
          </ul>
          <Link href="/comics" className="btn btn-yellow mt-10">
            Shop all comics
          </Link>
        </div>
      </section>

      {/* MEET AGENT HUFF */}
      <section aria-labelledby="meet-title" className="halftone border-t border-line py-20 lg:py-28">
        <div className="mx-auto grid max-w-[1440px] items-center gap-12 px-4 sm:px-6 md:grid-cols-2 lg:px-10">
          <div className="relative mx-auto aspect-[1190/2000] w-full max-w-sm border-2 border-white shadow-[10px_10px_0_0_var(--color-purple)]" data-reveal>
            <Image src="/brand/agent-huff-power.webp" alt="Agent Huff in a silver suit, charging a glowing ball of energy between her hands" fill sizes="(min-width: 768px) 384px, 90vw" className="object-cover" />
          </div>
          <div data-reveal>
            <p className="eyebrow text-yellow">Origin story</p>
            <h2 id="meet-title" className="display mt-2 text-6xl sm:text-7xl">
              Meet Agent Huff
            </h2>
            <p className="mt-5 max-w-lg text-lg text-white/85">{site.story}</p>
            <p className="mt-4 max-w-lg text-mist">Every print in the store comes from her world: the fights, the powers and the calm before the storm.</p>
            <Link href="/about" className="btn btn-ghost mt-8">
              Read her story
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
