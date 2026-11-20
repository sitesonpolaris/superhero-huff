import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Meet Agent Huff",
  description: site.story,
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <>
      <section className="cut-bottom halftone relative overflow-hidden bg-ink pb-[calc(2.5vw+4rem)] pt-14 lg:pt-20">
        <div className="mx-auto grid max-w-[1440px] items-center gap-12 px-4 sm:px-6 md:grid-cols-[1.1fr_1fr] lg:px-10">
          <div>
            <p className="eyebrow text-yellow">Origin story</p>
            <h1 className="display mt-3 text-[clamp(3.5rem,10vw,8rem)]">Meet Agent Huff</h1>
            <p className="mt-6 max-w-xl text-xl leading-relaxed text-white/90">{site.story}</p>
            {/* TODO(owner): full origin story and creator bio go here. */}
            <p className="mt-4 max-w-xl text-lg text-mist">
              Her adventures are told in the Superhero Huff comic books from {site.publisher}, and every collection in the store is drawn from those pages.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/comics" className="btn btn-yellow">
                Read the comics
              </Link>
              <Link href="/collections" className="btn btn-ghost">
                Shop her collections
              </Link>
            </div>
          </div>
          <div className="relative mx-auto aspect-[1535/2048] w-full max-w-md">
            <Image src="/brand/huff-classic.webp" alt="Agent Huff in a white crop top and jeans, holding her badge" fill priority sizes="(min-width: 768px) 40vw, 90vw" className="object-contain drop-shadow-[12px_12px_0_var(--color-purple)]" />
          </div>
        </div>
      </section>
      <section className="py-20 lg:py-28">
        <div className="mx-auto grid max-w-[1440px] gap-6 px-4 sm:px-6 md:grid-cols-2 lg:px-10">
          <figure className="relative aspect-[1571/2000] border-2 border-white shadow-[8px_8px_0_0_var(--color-yellow)]" data-reveal>
            <Image src="/brand/huff-rooftop.webp" alt="Superhero Huff comic cover: Agent Huff rising between city buildings with glowing hands" fill sizes="(min-width: 768px) 45vw, 90vw" className="object-cover" />
          </figure>
          <figure className="relative aspect-[1190/2000] border-2 border-white shadow-[8px_8px_0_0_var(--color-purple)]" data-reveal style={{ "--reveal-delay": "100ms" } as React.CSSProperties}>
            <Image src="/brand/agent-huff-power.webp" alt="Agent Huff in a silver suit charging an orb of energy" fill sizes="(min-width: 768px) 45vw, 90vw" className="object-cover" />
          </figure>
        </div>
      </section>
    </>
  );
}
