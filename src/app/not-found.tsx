import Image from "next/image";
import Link from "next/link";

export default function NotFound() {
  return (
    <section className="halftone flex min-h-[70svh] items-center py-20">
      <div className="mx-auto grid max-w-5xl items-center gap-10 px-4 sm:px-6 md:grid-cols-[1fr_280px]">
        <div>
          <p className="eyebrow text-yellow">Error 404</p>
          <h1 className="display mt-3 text-6xl sm:text-8xl">This page went undercover</h1>
          <p className="mt-4 max-w-md text-lg text-white/80">Even Agent Huff can&apos;t find it. It may have moved when the store was rebuilt.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/shop" className="btn btn-yellow">
              Shop clothing
            </Link>
            <Link href="/" className="btn btn-ghost">
              Home
            </Link>
          </div>
        </div>
        <div className="relative mx-auto aspect-[1535/2048] w-56 md:w-full">
          <Image src="/brand/huff-classic.webp" alt="" fill sizes="280px" className="object-contain" />
        </div>
      </div>
    </section>
  );
}
