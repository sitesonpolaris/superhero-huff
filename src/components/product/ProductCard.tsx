import Image from "next/image";
import Link from "next/link";
import { money } from "@/lib/format";
import { priceRange, productInStock } from "@/lib/product-utils";
import type { Product } from "@/lib/types";

export function ProductCard({ product, priority = false, index = 0 }: { product: Product; priority?: boolean; index?: number }) {
  const img = product.images[0];
  const alt = product.images[1];
  const { min, max } = priceRange(product);
  const soldOut = !productInStock(product);
  return (
    <article data-reveal style={{ "--reveal-delay": `${(index % 4) * 60}ms` } as React.CSSProperties} className="group relative">
      <Link href={`/product/${product.slug}`} className="block">
        <div className="relative aspect-square overflow-hidden border-2 border-ink bg-white shadow-panel transition-[transform,box-shadow] duration-200 ease-[var(--ease-snap)] group-hover:-translate-x-1 group-hover:-translate-y-1 group-hover:shadow-panel-lg">
          {img && (
            <Image
              src={img.src}
              alt={img.alt || product.name}
              fill
              priority={priority}
              sizes="(min-width: 1280px) 22vw, (min-width: 768px) 30vw, 46vw"
              className={`object-contain p-3 transition-opacity duration-300 ${alt ? "group-hover:opacity-0" : ""}`}
            />
          )}
          {alt && <Image src={alt.src} alt="" fill sizes="(min-width: 1280px) 22vw, (min-width: 768px) 30vw, 46vw" className="object-contain p-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />}
          <div className="absolute left-0 top-0 flex flex-col items-start gap-1">
            {product.isNew && <span className="bg-yellow px-2 py-1 text-[11px] font-extrabold uppercase tracking-wider text-ink">New</span>}
            {soldOut && <span className="bg-red px-2 py-1 text-[11px] font-extrabold uppercase tracking-wider text-white">Sold out</span>}
          </div>
        </div>
        <div className="mt-3 flex items-start justify-between gap-3">
          <h3 className="text-[15px] font-bold leading-snug group-hover:underline group-hover:decoration-2 group-hover:underline-offset-4">{product.name}</h3>
          <p className="shrink-0 font-bold tabular-nums">
            {min !== max ? <span className="text-xs font-semibold opacity-70">from </span> : null}
            {money(min)}
          </p>
        </div>
      </Link>
    </article>
  );
}
