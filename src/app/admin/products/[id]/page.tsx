import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin";
import type { ProductInput } from "../../actions";
import { AdminTitle } from "../../ui";
import { ProductEditor } from "../ProductEditor";

export default async function EditProduct({ params }: PageProps<"/admin/products/[id]">) {
  const { id } = await params;
  const { supabase } = await requireAdmin();
  const isNew = id === "new";
  const [prod, colls, cats] = await Promise.all([
    isNew ? Promise.resolve({ data: null }) : supabase.from("products").select("*, variants(*)").eq("id", id).maybeSingle(),
    supabase.from("collections").select("slug, name").order("issue"),
    supabase.from("categories").select("slug, name").order("sort"),
  ]);
  if (!isNew && !prod.data) notFound();
  const p = prod.data;

  const initial: ProductInput = p
    ? {
        id: p.id,
        name: p.name,
        slug: p.slug,
        description: p.description,
        price: Number(p.price),
        compareAtPrice: p.compare_at_price == null ? null : Number(p.compare_at_price),
        collection: p.collection_slug,
        categories: p.categories ?? [],
        isNew: p.is_new,
        featured: p.featured,
        active: p.active,
        images: p.images ?? [],
        variants: (p.variants ?? [])
          .sort((a: { sort: number }, b: { sort: number }) => a.sort - b.sort)
          .map((v: { id: string; sku: string | null; size: string | null; color: string | null; price: number; stock: number | null; image: string | null; active: boolean }) => ({
            id: v.id,
            sku: v.sku,
            size: v.size,
            color: v.color,
            price: Number(v.price),
            stock: v.stock,
            image: v.image,
            active: v.active,
          })),
      }
    : {
        name: "",
        slug: "",
        description: "",
        price: 0,
        compareAtPrice: null,
        collection: null,
        categories: [],
        isNew: true,
        featured: false,
        active: true,
        images: [],
        variants: [],
      };

  return (
    <>
      <Link href="/admin/products" className="text-sm font-bold underline">
        ← All products
      </Link>
      <AdminTitle>{isNew ? "New product" : initial.name}</AdminTitle>
      <ProductEditor initial={initial} collections={colls.data ?? []} categories={cats.data ?? []} />
    </>
  );
}
