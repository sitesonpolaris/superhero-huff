import Image from "next/image";

export function PageBanner({
  eyebrow,
  title,
  intro,
  issue,
  image,
  imageAlt = "",
}: {
  eyebrow: string;
  title: string;
  intro?: string | null;
  issue?: string;
  image?: string | null;
  imageAlt?: string;
}) {
  return (
    <section className="cut-bottom halftone relative overflow-hidden border-b border-line bg-ink pb-[calc(2.5vw+3rem)] pt-12 lg:pt-16">
      <div className="mx-auto grid max-w-[1440px] items-end gap-8 px-4 sm:px-6 md:grid-cols-[1fr_auto] lg:px-10">
        <div>
          <p className="eyebrow text-yellow">{eyebrow}</p>
          <h1 className="display mt-3 text-[clamp(3rem,9vw,7.5rem)]">
            {issue && <span className="mr-4 align-top text-[0.4em] text-yellow">{issue}</span>}
            {title}
          </h1>
          {intro && <p className="mt-4 max-w-xl text-lg text-white/80">{intro}</p>}
        </div>
        {image && (
          <div className="relative hidden aspect-square w-56 rotate-2 border-2 border-white bg-white shadow-[8px_8px_0_0_var(--color-yellow)] md:block lg:w-72">
            <Image src={image} alt={imageAlt} fill priority sizes="288px" className="object-contain p-3" />
          </div>
        )}
      </div>
    </section>
  );
}

/** Suspense fallback with the banner's footprint. No heading, so the prerendered HTML has one real <h1>. */
export function PageBannerFallback({ eyebrow }: { eyebrow: string }) {
  return (
    <section aria-busy="true" className="cut-bottom halftone relative overflow-hidden border-b border-line bg-ink pb-[calc(2.5vw+3rem)] pt-12 lg:pt-16">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10">
        <p className="eyebrow text-yellow">{eyebrow}</p>
        <div className="mt-3 h-[clamp(3rem,9vw,7.5rem)] w-2/3 max-w-xl bg-white/10" />
        <span className="sr-only">Loading…</span>
      </div>
    </section>
  );
}
