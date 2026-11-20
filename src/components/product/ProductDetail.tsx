"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { money, sortSizes } from "@/lib/format";
import { inStock } from "@/lib/product-utils";
import type { Product } from "@/lib/types";
import { useCart } from "../cart/CartProvider";

export function ProductDetail({ product, collectionName }: { product: Product; collectionName: string | null }) {
  const { add } = useCart();
  const colors = useMemo(() => [...new Set(product.variants.map((v) => v.color).filter((c): c is string => !!c))], [product]);
  const sizes = useMemo(() => [...new Set(product.variants.map((v) => v.size).filter((s): s is string => !!s))].sort(sortSizes), [product]);
  const [color, setColor] = useState<string | null>(colors[0] ?? null);
  const [size, setSize] = useState<string | null>(sizes.length === 1 ? sizes[0] : null);
  const [imgIndex, setImgIndex] = useState(0);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [needSize, setNeedSize] = useState(false);

  const variantFor = (s: string | null, c: string | null) => product.variants.find((v) => (v.size ?? null) === s && (v.color ?? null) === c);
  const variant = sizes.length ? (size ? variantFor(size, color) : undefined) : variantFor(null, color);
  const price = variant?.price ?? product.price;

  const gallery = useMemo(() => {
    const colorImg = color ? product.variants.find((v) => v.color === color && v.image)?.image : null;
    const base = product.images;
    if (colorImg && !base.some((i) => i.src === colorImg)) return [{ src: colorImg, alt: `${product.name} in ${color}` }, ...base];
    if (colorImg) return [...base.filter((i) => i.src === colorImg), ...base.filter((i) => i.src !== colorImg)];
    return base;
  }, [color, product]);
  const shown = gallery[Math.min(imgIndex, gallery.length - 1)];

  function addToBag() {
    if (sizes.length && !size) {
      setNeedSize(true);
      document.getElementById("size-group")?.focus();
      return;
    }
    if (!variant || !inStock(variant)) return;
    add(
      {
        variantId: variant.id,
        productSlug: product.slug,
        name: product.name,
        size: variant.size,
        color: variant.color,
        price: variant.price,
        image: variant.image ?? product.images[0]?.src ?? null,
      },
      qty,
    );
    setAdded(true);
    setTimeout(() => setAdded(false), 2200);
  }

  const soldOut = variant ? !inStock(variant) : product.variants.every((v) => !inStock(v));
  const lowStock = variant && variant.stock !== null && variant.stock > 0 && variant.stock <= 3;

  return (
    <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:gap-16">
      {/* Gallery */}
      <div className="lg:sticky lg:top-24 lg:self-start">
        <div className="relative aspect-square border-2 border-ink bg-white shadow-panel-lg">
          {shown && <Image key={shown.src} src={shown.src} alt={shown.alt || product.name} fill priority sizes="(min-width: 1024px) 50vw, 100vw" className="object-contain p-4 sm:p-8" />}
        </div>
        {gallery.length > 1 && (
          <ul className="mt-4 flex gap-3 overflow-x-auto pb-1" aria-label="Product images">
            {gallery.map((g, i) => (
              <li key={g.src} className="shrink-0">
                <button
                  type="button"
                  onClick={() => setImgIndex(i)}
                  aria-label={`Show image ${i + 1}`}
                  aria-current={i === imgIndex}
                  className={`relative block size-20 border-2 bg-white transition-colors ${i === imgIndex ? "border-ink shadow-[3px_3px_0_0_var(--color-ink)]" : "border-ink/20 hover:border-ink"}`}
                >
                  <Image src={g.src} alt="" fill sizes="80px" className="object-contain p-1" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Buy box */}
      <div>
        {collectionName && <p className="eyebrow text-purple">{collectionName} collection</p>}
        <h1 className="display mt-2 text-[clamp(2.5rem,5vw,4rem)]">{product.name}</h1>
        <p className="mt-4 text-2xl font-extrabold tabular-nums">{money(price)}</p>

        {colors.length > 0 && (
          <fieldset className="mt-8">
            <legend className="eyebrow">
              Colour: <span className="normal-case tracking-normal">{color}</span>
            </legend>
            <div className="mt-3 flex flex-wrap gap-2">
              {colors.map((c) => (
                <button
                  key={c}
                  type="button"
                  aria-pressed={color === c}
                  onClick={() => (setColor(c), setImgIndex(0))}
                  className={`min-h-11 border-2 border-ink px-4 text-sm font-bold ${color === c ? "bg-ink text-yellow" : "bg-white hover:bg-yellow"}`}
                >
                  {c}
                </button>
              ))}
            </div>
          </fieldset>
        )}

        {sizes.length > 0 && (
          <fieldset className="mt-8">
            <legend className="eyebrow">Size</legend>
            <div id="size-group" tabIndex={-1} className="mt-3 flex flex-wrap gap-2 outline-none">
              {sizes.map((s) => {
                const v = variantFor(s, color);
                const out = !v || !inStock(v);
                return (
                  <button
                    key={s}
                    type="button"
                    aria-pressed={size === s}
                    disabled={out}
                    onClick={() => (setSize(s), setNeedSize(false))}
                    className={`relative min-h-11 min-w-14 border-2 border-ink px-3 text-sm font-bold transition-colors disabled:cursor-not-allowed disabled:border-ink/25 disabled:text-ink/35 disabled:line-through ${
                      size === s ? "bg-ink text-yellow" : "bg-white hover:bg-yellow"
                    }`}
                  >
                    {s}
                  </button>
                );
              })}
            </div>
            {needSize && (
              <p role="alert" className="mt-2 text-sm font-bold text-red">
                Pick a size first.
              </p>
            )}
          </fieldset>
        )}

        <div className="mt-8 flex gap-3">
          <label className="sr-only" htmlFor="qty">
            Quantity
          </label>
          <select id="qty" value={qty} onChange={(e) => setQty(Number(e.target.value))} className="field w-20 text-center font-bold">
            {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
              <option key={n}>{n}</option>
            ))}
          </select>
          <button type="button" onClick={addToBag} disabled={soldOut} className="btn btn-yellow flex-1 border-ink">
            {soldOut ? "Sold out" : added ? "Added to your bag ✓" : "Add to bag"}
          </button>
        </div>
        <p className="mt-3 min-h-5 text-sm font-semibold text-red" aria-live="polite">
          {lowStock ? `Only ${variant!.stock} left in ${variant!.size ?? "stock"}.` : ""}
        </p>

        {product.description && (
          <div className="mt-8 border-t-2 border-ink pt-6">
            <h2 className="eyebrow">Details & care</h2>
            <p className="mt-3 leading-relaxed text-ink/85">{product.description}</p>
          </div>
        )}
        <div className="mt-6 border-t-2 border-ink pt-6 text-sm text-ink/80">
          <p>
            Please allow 48 hours for processing. See{" "}
            <Link href="/shipping-returns" className="font-bold underline underline-offset-2">
              shipping & returns
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
