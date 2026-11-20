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
        <input id="pq" name="q" defaultValue={q} placeholder="Search by name" className="field min-h-10 py-1.5 text-sm" />
        <button className="btn btn-ink min-h-10 shadow-none">Search</button>
      </form>
      <div className="overflow-x-auto border-2 border-ink bg-white">
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
              const vs = (p.variants ?? []).filter((v: { active: boolean }) => v.active) as { stock: number | null }[];
              const tracked = vs.filter((v) => v.stock !== null);
              const stock = tracked.length ? tracked.reduce((n, v) => n + (v.stock ?? 0), 0) : null;
              const img = (p.images as { src: string }[])?.[0]?.src;
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
                    {!p.active && <span className="bg-paper-2 px-2 py-0.5 text-xs font-bold uppercase">Hidden</span>}
                    {p.is_new && <span className="bg-yellow px-2 py-0.5 text-xs font-bold uppercase">New</span>}
                    {p.featured && <span className="bg-purple px-2 py-0.5 text-xs font-bold uppercase text-white">Featured</span>}
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
