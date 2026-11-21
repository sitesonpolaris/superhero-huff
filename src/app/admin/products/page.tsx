import Image from "next/image";
import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { money } from "@/lib/format";
import { AdminTitle } from "../ui";

export default async function ProductsPage({ searchParams }: PageProps<"/admin/products">) {
  const { supabase } = await requireAdmin();
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q.trim() : "";
  let query = supabase
    .from("products")
    .select("id, slug, name, price, active, is_new, featured, images, collection_slug, categories, variants(stock, active)")
    .order("created_at", { ascending: false });
  if (q) query = query.ilike("name", `%${q}%`);
  const { data: products } = await query;

  return (
    <>
      <AdminTitle
        actions={
          <Link href="/admin/products/new" className="btn btn-yellow">
            + New product
          </Link>
        }
      >
        Products
      </AdminTitle>
      <form className="mb-5 flex max-w-md">
        <label htmlFor="pq" className="sr-only">
          Search products
        </label>
        <input id="pq" name="q" defaultValue={q} placeholder="Search by name" className="field min-h-11 min-w-0 flex-1 py-1.5 text-base sm:min-h-10 sm:text-sm" />
        <button className="btn btn-ink min-h-11 px-4 shadow-none sm:min-h-10 sm:px-6">Search</button>
      </form>
      <ul className="divide-y divide-ink/10 border-2 border-ink bg-white sm:hidden">
        {(products ?? []).map((p) => {
          const { stock, img } = summary(p);
          return (
            <li key={p.id}>
              <Link href={`/admin/products/${p.id}`} className="flex items-center gap-3 px-3 py-3 active:bg-paper">
                <span className="relative size-14 shrink-0 border border-ink/20 bg-white">{img && <Image src={img} alt="" fill sizes="56px" className="object-contain p-0.5" />}</span>
                <span className="min-w-0 flex-1">
                  <span className="line-clamp-2 font-bold leading-snug">{p.name}</span>
                  <span className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
                    <span className="font-bold tabular-nums">{money(Number(p.price))}</span>
                    <span className="text-slate">·</span>
                    {stock === null ? <span className="text-slate">Stock not tracked</span> : <span className={stock === 0 ? "font-bold text-red" : ""}>{stock} in stock</span>}
                    <Flags p={p} />
                  </span>
                </span>
                <span aria-hidden="true" className="text-slate">
                  ›
                </span>
              </Link>
            </li>
          );
        })}
        {!products?.length && <li className="px-4 py-8 text-center text-sm text-slate">No products match.</li>}
      </ul>
      <div className="hidden overflow-x-auto border-2 border-ink bg-white sm:block">
        <table className="w-full text-left text-sm">
          <thead className="bg-ink text-white">
            <tr>
              <th className="px-3 py-2">Product</th>
              <th className="px-3 py-2">Categories</th>
              <th className="px-3 py-2">Stock</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2 text-right">Price</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink/10">
            {(products ?? []).map((p) => {
              const { stock, img } = summary(p);
              return (
                <tr key={p.id} className="hover:bg-paper">
                  <td className="px-3 py-2">
                    <Link href={`/admin/products/${p.id}`} className="flex items-center gap-3">
                      <span className="relative size-12 shrink-0 border border-ink/20 bg-white">{img && <Image src={img} alt="" fill sizes="48px" className="object-contain p-0.5" />}</span>
                      <span className="font-bold underline">{p.name}</span>
                    </Link>
                  </td>
                  <td className="px-3 py-2 text-slate">{(p.categories as string[]).join(", ")}</td>
                  <td className="px-3 py-2 tabular-nums">{stock === null ? <span className="text-slate">Not tracked</span> : <span className={stock === 0 ? "font-bold text-red" : ""}>{stock}</span>}</td>
                  <td className="space-x-1 px-3 py-2">
                    <Flags p={p} />
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums">{money(Number(p.price))}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}

type Row = { active: boolean; is_new: boolean; featured: boolean; images: unknown; variants: unknown };

function summary(p: Row) {
  const vs = ((p.variants ?? []) as { stock: number | null; active: boolean }[]).filter((v) => v.active);
  const tracked = vs.filter((v) => v.stock !== null);
  const stock = tracked.length ? tracked.reduce((n, v) => n + (v.stock ?? 0), 0) : null;
  const img = (p.images as { src: string }[] | null)?.[0]?.src;
  return { stock, img };
}

function Flags({ p }: { p: Row }) {
  return (
    <>
      {!p.active && <span className="bg-paper-2 px-2 py-0.5 text-xs font-bold uppercase">Hidden</span>}
      {p.is_new && <span className="bg-yellow px-2 py-0.5 text-xs font-bold uppercase">New</span>}
      {p.featured && <span className="bg-purple px-2 py-0.5 text-xs font-bold uppercase text-white">Featured</span>}
    </>
  );
}
