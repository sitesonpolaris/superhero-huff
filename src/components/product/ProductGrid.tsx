"use client";

import { useMemo, useState } from "react";
import { sortSizes } from "@/lib/format";
import type { Product } from "@/lib/types";

type Sort = "featured" | "new" | "price-asc" | "price-desc";

export function ProductGrid({
  products,
  collections,
  children,
}: {
  products: Product[];
  collections?: { slug: string; name: string }[];
  /** Server-rendered cards, in the same order as `products`. */
  children: React.ReactNode[];
}) {
  const [size, setSize] = useState<string | null>(null);
  const [collection, setCollection] = useState<string>("");
  const [sort, setSort] = useState<Sort>("featured");

  const sizes = useMemo(() => {
    const s = new Set<string>();
    products.forEach((p) => p.variants.forEach((v) => v.size && !v.size.includes('"') && s.add(v.size)));
    return [...s].sort(sortSizes);
  }, [products]);

  const visible = useMemo(() => {
    let list = products.map((p, i) => ({ p, i }));
    if (size) list = list.filter(({ p }) => p.variants.some((v) => v.size === size && (v.stock === null || v.stock > 0)));
    if (collection) list = list.filter(({ p }) => p.collection === collection);
    if (sort === "new") list = [...list].sort((a, b) => b.p.createdAt.localeCompare(a.p.createdAt));
    if (sort === "price-asc") list = [...list].sort((a, b) => a.p.price - b.p.price);
    if (sort === "price-desc") list = [...list].sort((a, b) => b.p.price - a.p.price);
    return list;
  }, [products, size, collection, sort]);

  const usedCollections = collections?.filter((c) => products.some((p) => p.collection === c.slug)) ?? [];

  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 border-y-2 border-ink py-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Filter by size">
          {sizes.length > 0 && <span className="eyebrow mr-1">Size</span>}
          {sizes.map((s) => (
            <button
              key={s}
              type="button"
              aria-pressed={size === s}
              onClick={() => setSize(size === s ? null : s)}
              className={`min-h-10 min-w-11 border-2 border-ink px-2 text-sm font-bold transition-colors ${size === s ? "bg-ink text-yellow" : "bg-white hover:bg-yellow"}`}
            >
              {s}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {usedCollections.length > 1 && (
            <label className="flex items-center gap-2 text-sm font-bold">
              <span className="eyebrow">Collection</span>
              <select value={collection} onChange={(e) => setCollection(e.target.value)} className="field min-h-10 w-auto py-1.5 text-sm">
                <option value="">All</option>
                {usedCollections.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>
          )}
          <label className="flex items-center gap-2 text-sm font-bold">
            <span className="eyebrow">Sort</span>
            <select value={sort} onChange={(e) => setSort(e.target.value as Sort)} className="field min-h-10 w-auto py-1.5 text-sm">
              <option value="featured">Featured</option>
              <option value="new">Newest</option>
              <option value="price-asc">Price: low to high</option>
              <option value="price-desc">Price: high to low</option>
            </select>
          </label>
        </div>
      </div>
      <p className="sr-only" aria-live="polite">
        {visible.length} products shown
      </p>
      {visible.length === 0 ? (
        <div className="border-2 border-dashed border-ink/40 px-6 py-16 text-center">
          <p className="display text-4xl">No match in that size</p>
          <button type="button" onClick={() => (setSize(null), setCollection(""))} className="btn btn-ink mt-6">
            Clear filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 md:gap-x-6 xl:grid-cols-4">{visible.map(({ i }) => children[i])}</div>
      )}
    </div>
  );
}
