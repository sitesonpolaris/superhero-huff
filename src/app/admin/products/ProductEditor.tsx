"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { browserClient } from "@/lib/supabase/client";
import { deleteProduct, type ProductInput, saveProduct } from "../actions";

type Option = { slug: string; name: string };
type VariantRow = ProductInput["variants"][number] & { key: string };

const SIZES = ["XS", "S", "M", "L", "XL", "2XL", "3XL", "4XL"];
let k = 0;
const key = () => `v${++k}`;

export function ProductEditor({ initial, collections, categories }: { initial: ProductInput; collections: Option[]; categories: Option[] }) {
  const router = useRouter();
  const [p, setP] = useState(initial);
  const [variants, setVariants] = useState<VariantRow[]>(initial.variants.map((v) => ({ ...v, key: key() })));
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [uploading, setUploading] = useState(false);
  const [pending, start] = useTransition();
  const set = <K extends keyof ProductInput>(k: K, v: ProductInput[K]) => setP((x) => ({ ...x, [k]: v }));
  const setV = (key: string, patch: Partial<VariantRow>) => setVariants((vs) => vs.map((v) => (v.key === key ? { ...v, ...patch } : v)));

  async function upload(files: FileList | null) {
    if (!files?.length) return;
    setUploading(true);
    setMsg(null);
    const sb = browserClient();
    const added: { src: string; alt: string }[] = [];
    for (const f of Array.from(files)) {
      if (f.size > 8 * 1024 * 1024) {
        setMsg({ ok: false, text: `${f.name} is over 8 MB.` });
        continue;
      }
      const ext = f.name.split(".").pop()?.toLowerCase() || "jpg";
      const path = `${p.slug || "product"}/${crypto.randomUUID()}.${ext}`;
      const { error } = await sb.storage.from("product-images").upload(path, f, { cacheControl: "31536000", contentType: f.type });
      if (error) {
        setMsg({ ok: false, text: `Upload failed: ${error.message}` });
        continue;
      }
      added.push({ src: sb.storage.from("product-images").getPublicUrl(path).data.publicUrl, alt: p.name });
    }
    set("images", [...p.images, ...added]);
    setUploading(false);
  }

  const move = (i: number, d: number) => {
    const imgs = [...p.images];
    const j = i + d;
    if (j < 0 || j >= imgs.length) return;
    [imgs[i], imgs[j]] = [imgs[j], imgs[i]];
    set("images", imgs);
  };

  function addSizes() {
    const color = variants.at(-1)?.color ?? null;
    const have = new Set(variants.filter((v) => v.color === color).map((v) => v.size));
    const add = ["S", "M", "L", "XL"].filter((s) => !have.has(s)).map((s) => ({ key: key(), sku: null, size: s, color, price: p.price, stock: null, image: null, active: true }));
    setVariants((vs) => [...vs, ...add]);
  }

  function save() {
    setMsg(null);
    start(async () => {
      const res = await saveProduct({ ...p, variants: variants.map((row) => { const v: Partial<VariantRow> = { ...row }; delete v.key; return v as ProductInput["variants"][number]; }) });
      setMsg({ ok: res.ok, text: res.message });
      if (res.ok && !p.id && res.id) router.replace(`/admin/products/${res.id}`);
      else if (res.ok) router.refresh();
    });
  }

  return (
    <div className="space-y-8 pb-24">
      <section className="grid gap-5 border-2 border-ink bg-white p-5 md:grid-cols-2">
        <label className="block text-sm font-bold md:col-span-2">
          Name
          <input value={p.name} onChange={(e) => set("name", e.target.value)} className="field mt-1" required />
        </label>
        <label className="block text-sm font-bold">
          URL slug
          <input value={p.slug} onChange={(e) => set("slug", e.target.value)} placeholder="auto from name" className="field mt-1" />
          <span className="mt-1 block text-xs font-normal text-slate">/product/{p.slug || "…"}</span>
        </label>
        <label className="block text-sm font-bold">
          Collection
          <select value={p.collection ?? ""} onChange={(e) => set("collection", e.target.value || null)} className="field mt-1">
            <option value="">None</option>
            {collections.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm font-bold">
          Base price ($)
          <input type="number" min="0" step="0.01" value={p.price} onChange={(e) => set("price", Number(e.target.value))} className="field mt-1" />
        </label>
        <label className="block text-sm font-bold">
          Compare-at price ($, optional)
          <input type="number" min="0" step="0.01" value={p.compareAtPrice ?? ""} onChange={(e) => set("compareAtPrice", e.target.value ? Number(e.target.value) : null)} className="field mt-1" />
        </label>
        <label className="block text-sm font-bold md:col-span-2">
          Description, fabric & care
          <textarea rows={5} value={p.description} onChange={(e) => set("description", e.target.value)} className="field mt-1" />
        </label>
        <fieldset className="md:col-span-2">
          <legend className="text-sm font-bold">Categories</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {categories.map((c) => {
              const on = p.categories.includes(c.slug);
              return (
                <button
                  key={c.slug}
                  type="button"
                  aria-pressed={on}
                  onClick={() => set("categories", on ? p.categories.filter((x) => x !== c.slug) : [...p.categories, c.slug])}
                  className={`border-2 border-ink px-3 py-1.5 text-sm font-bold ${on ? "bg-ink text-yellow" : "bg-white hover:bg-yellow"}`}
                >
                  {c.name}
                </button>
              );
            })}
          </div>
        </fieldset>
        <div className="flex flex-wrap gap-6 md:col-span-2">
          {(
            [
              ["active", "Visible in store"],
              ["isNew", "Mark as New"],
              ["featured", "Featured"],
            ] as const
          ).map(([k, label]) => (
            <label key={k} className="flex items-center gap-2 text-sm font-bold">
              <input type="checkbox" checked={p[k]} onChange={(e) => set(k, e.target.checked)} className="size-5 accent-purple" />
              {label}
            </label>
          ))}
        </div>
      </section>

      <section className="border-2 border-ink bg-white p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="eyebrow">Photos</h2>
          <label className="btn btn-ink cursor-pointer shadow-none">
            {uploading ? "Uploading…" : "Upload photos"}
            <input type="file" accept="image/jpeg,image/png,image/webp,image/avif" multiple className="sr-only" disabled={uploading} onChange={(e) => upload(e.target.files)} />
          </label>
        </div>
        <p className="mt-2 text-xs text-slate">First photo is the main image. Square photos on a white background look best.</p>
        <ul className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-6">
          {p.images.map((img, i) => (
            <li key={img.src + i} className="border-2 border-ink/20">
              <div className="relative aspect-square bg-white">
                <Image src={img.src} alt="" fill sizes="160px" className="object-contain p-1" />
                {i === 0 && <span className="absolute left-0 top-0 bg-yellow px-1.5 text-[10px] font-extrabold uppercase">Main</span>}
              </div>
              <div className="flex border-t border-ink/20 text-xs font-bold">
                <button type="button" onClick={() => move(i, -1)} className="flex-1 py-1.5 hover:bg-paper" aria-label="Move left">
                  ←
                </button>
                <button type="button" onClick={() => move(i, 1)} className="flex-1 py-1.5 hover:bg-paper" aria-label="Move right">
                  →
                </button>
                <button type="button" onClick={() => set("images", p.images.filter((_, j) => j !== i))} className="flex-1 py-1.5 text-red hover:bg-red/10" aria-label="Remove photo">
                  ✕
                </button>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="border-2 border-ink bg-white p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="eyebrow">Variants & stock</h2>
          <div className="flex gap-2">
            <button type="button" onClick={addSizes} className="border-2 border-ink px-3 py-1.5 text-sm font-bold hover:bg-yellow">
              + S–XL
            </button>
            <button
              type="button"
              onClick={() => setVariants((vs) => [...vs, { key: key(), sku: null, size: null, color: null, price: p.price, stock: null, image: null, active: true }])}
              className="border-2 border-ink px-3 py-1.5 text-sm font-bold hover:bg-yellow"
            >
              + Variant
            </button>
          </div>
        </div>
        <p className="mt-2 text-xs text-slate">Leave stock empty to sell without tracking. A product with no sizes needs one variant with size left empty.</p>
        <div className="mt-4 md:overflow-x-auto">
          <table className="block w-full text-left text-sm md:table md:min-w-[720px]">
            <thead className="hidden md:table-header-group">
              <tr className="border-b-2 border-ink">
                <th className="py-2 pr-2">Size</th>
                <th className="py-2 pr-2">Colour</th>
                <th className="py-2 pr-2">Price $</th>
                <th className="py-2 pr-2">Stock</th>
                <th className="py-2 pr-2">SKU</th>
                <th className="py-2 pr-2">On</th>
                <th className="py-2" />
              </tr>
            </thead>
            <tbody className="block space-y-3 md:table-row-group md:space-y-0">
              {variants.map((v) => (
                <tr key={v.key} className="relative grid grid-cols-2 gap-x-3 gap-y-2 border-2 border-ink/15 p-3 pr-12 md:table-row md:border-0 md:border-b md:border-ink/10 md:p-0">
                  <td className="block md:table-cell md:py-1.5 md:pr-2">
                    <span aria-hidden="true" className="mb-1 block text-xs font-bold md:hidden">Size</span>
                    <input list="sizes" value={v.size ?? ""} onChange={(e) => setV(v.key, { size: e.target.value || null })} className="field min-h-11 w-full py-1 text-base md:min-h-9 md:w-24 md:text-sm" aria-label="Size" />
                  </td>
                  <td className="block md:table-cell md:py-1.5 md:pr-2">
                    <span aria-hidden="true" className="mb-1 block text-xs font-bold md:hidden">Colour</span>
                    <input value={v.color ?? ""} onChange={(e) => setV(v.key, { color: e.target.value || null })} className="field min-h-11 w-full py-1 text-base md:min-h-9 md:w-28 md:text-sm" aria-label="Colour" />
                  </td>
                  <td className="block md:table-cell md:py-1.5 md:pr-2">
                    <span aria-hidden="true" className="mb-1 block text-xs font-bold md:hidden">Price $</span>
                    <input type="number" min="0" step="0.01" value={v.price} onChange={(e) => setV(v.key, { price: Number(e.target.value) })} className="field min-h-11 w-full py-1 text-base md:min-h-9 md:w-24 md:text-sm" aria-label="Price" />
                  </td>
                  <td className="block md:table-cell md:py-1.5 md:pr-2">
                    <span aria-hidden="true" className="mb-1 block text-xs font-bold md:hidden">Stock</span>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={v.stock ?? ""}
                      placeholder="∞"
                      onChange={(e) => setV(v.key, { stock: e.target.value === "" ? null : Number(e.target.value) })}
                      className="field min-h-11 w-full py-1 text-base md:min-h-9 md:w-20 md:text-sm"
                      aria-label="Stock"
                    />
                  </td>
                  <td className="block md:table-cell md:py-1.5 md:pr-2">
                    <span aria-hidden="true" className="mb-1 block text-xs font-bold md:hidden">SKU</span>
                    <input value={v.sku ?? ""} onChange={(e) => setV(v.key, { sku: e.target.value || null })} className="field min-h-11 w-full py-1 text-base md:min-h-9 md:w-28 md:text-sm" aria-label="SKU" />
                  </td>
                  <td className="block md:table-cell md:py-1.5 md:pr-2">
                    <label className="flex min-h-11 items-center md:min-h-0">
                    <input type="checkbox" checked={v.active} onChange={(e) => setV(v.key, { active: e.target.checked })} className="size-5 accent-purple" aria-label="Active" />
                    <span className="ml-2 text-sm font-semibold md:hidden">Active</span>
                    </label>
                  </td>
                  <td className="absolute right-1 top-1 md:static md:table-cell md:py-1.5 md:text-right">
                    <button type="button" onClick={() => setVariants((vs) => vs.filter((x) => x.key !== v.key))} className="flex size-11 items-center justify-center font-bold text-red md:inline md:size-auto md:px-2" aria-label="Remove variant">
                      ✕
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <datalist id="sizes">
            {SIZES.map((s) => (
              <option key={s} value={s} />
            ))}
          </datalist>
        </div>
      </section>

      <div className="sticky bottom-0 z-10 -mx-4 flex flex-wrap items-center gap-4 border-t-2 border-ink bg-paper px-4 py-4 sm:-mx-6 sm:px-6 lg:-mx-10 lg:px-10">
        <button type="button" onClick={save} disabled={pending || uploading} className="btn btn-ink">
          {pending ? "Saving…" : "Save product"}
        </button>
        {p.id && (
          <a href={`/product/${p.slug}`} target="_blank" rel="noopener noreferrer" className="text-sm font-bold underline">
            View in store ↗
          </a>
        )}
        {msg && (
          <p role="status" className={`text-sm font-bold ${msg.ok ? "text-purple" : "text-red"}`}>
            {msg.text}
          </p>
        )}
        {p.id && (
          <button
            type="button"
            className="ml-auto text-sm font-bold text-red underline"
            onClick={() => {
              if (confirm("Delete this product? Products with past orders are hidden instead of deleted.")) start(() => deleteProduct(p.id!));
            }}
          >
            Delete
          </button>
        )}
      </div>
    </div>
  );
}
