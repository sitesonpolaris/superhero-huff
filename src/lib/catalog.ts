import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import seed from "@/data/catalog.json";
import { hasSupabase } from "./supabase/env";
import { publicClient } from "./supabase/public";
import type { Category, Collection, Product, StoreSettings, Variant } from "./types";

export const CATALOG_TAG = "catalog";

type Catalog = { products: Product[]; collections: Collection[]; categories: Category[]; settings: StoreSettings };

const DEFAULT_SETTINGS: StoreSettings = { flatShippingCents: 800, freeShippingThresholdCents: null, announcement: null };

function fromSeed(): Catalog {
  const products: Product[] = seed.products.map((p) => {
    const variants: Variant[] = (p.variants.length ? p.variants : [{ sku: null, size: null, color: null, price: p.price, stock: null, image: null }]).map(
      (v) => ({
        id: `seed:${p.slug}:${v.size ?? ""}:${v.color ?? ""}`,
        sku: v.sku,
        size: v.size,
        color: v.color,
        price: v.price,
        stock: v.stock,
        image: v.image,
      }),
    );
    return {
      id: `seed:${p.slug}`,
      slug: p.slug,
      name: p.name,
      description: p.description,
      price: p.price,
      compareAtPrice: null,
      categories: p.categories,
      collection: p.collection,
      isNew: p.is_new,
      featured: p.featured,
      images: p.images,
      variants,
      createdAt: p.created_at,
    };
  });
  return {
    products,
    collections: seed.collections.map((c) => ({ ...c })),
    categories: seed.categories.map((c) => ({ ...c })),
    settings: DEFAULT_SETTINGS,
  };
}

type Row = {
  id: string;
  slug: string;
  name: string;
  description: string;
  price: number | string;
  compare_at_price: number | string | null;
  categories: string[];
  collection_slug: string | null;
  is_new: boolean;
  featured: boolean;
  images: Product["images"];
  created_at: string;
  variants: {
    id: string;
    sku: string | null;
    size: string | null;
    color: string | null;
    price: number | string;
    stock: number | null;
    image: string | null;
    sort: number;
    active: boolean;
  }[];
};

async function fromSupabase(): Promise<Catalog> {
  const db = publicClient();
  const [prod, coll, cat, set] = await Promise.all([
    db
      .from("products")
      .select("id, slug, name, description, price, compare_at_price, categories, collection_slug, is_new, featured, images, created_at, variants(id, sku, size, color, price, stock, image, sort, active)")
      .eq("active", true)
      .order("created_at", { ascending: false }),
    db.from("collections").select("slug, name, tagline, issue, cover").eq("active", true).order("issue"),
    db.from("categories").select("slug, name, sort").order("sort"),
    db.from("settings").select("flat_shipping_cents, free_shipping_threshold_cents, announcement").eq("id", 1).maybeSingle(),
  ]);
  if (prod.error) throw prod.error;
  const products: Product[] = (prod.data as unknown as Row[]).map((r) => ({
    id: r.id,
    slug: r.slug,
    name: r.name,
    description: r.description,
    price: Number(r.price),
    compareAtPrice: r.compare_at_price == null ? null : Number(r.compare_at_price),
    categories: r.categories ?? [],
    collection: r.collection_slug,
    isNew: r.is_new,
    featured: r.featured,
    images: r.images ?? [],
    createdAt: r.created_at,
    variants: (r.variants ?? [])
      .filter((v) => v.active)
      .sort((a, b) => a.sort - b.sort)
      .map((v) => ({ id: v.id, sku: v.sku, size: v.size, color: v.color, price: Number(v.price), stock: v.stock, image: v.image })),
  }));
  const count = (pred: (p: Product) => boolean) => products.filter(pred).length;
  return {
    products,
    collections: (coll.data ?? []).map((c) => ({ ...c, count: count((p) => p.collection === c.slug) })).filter((c) => c.count > 0),
    categories: (cat.data ?? []).map((c) => ({ slug: c.slug, name: c.name, count: count((p) => p.categories.includes(c.slug)) })).filter((c) => c.count > 0),
    settings: set.data
      ? {
          flatShippingCents: set.data.flat_shipping_cents,
          freeShippingThresholdCents: set.data.free_shipping_threshold_cents,
          announcement: set.data.announcement,
        }
      : DEFAULT_SETTINGS,
  };
}

export async function getCatalog(): Promise<Catalog> {
  "use cache";
  cacheTag(CATALOG_TAG);
  cacheLife("hours");
  if (!hasSupabase) return fromSeed();
  try {
    return await fromSupabase();
  } catch (e) {
    console.error("Catalog: Supabase read failed, serving seed catalog", e);
    return fromSeed();
  }
}

export async function getProducts() {
  return (await getCatalog()).products;
}

export async function getProduct(slug: string) {
  return (await getCatalog()).products.find((p) => p.slug === slug) ?? null;
}

export async function getCollections() {
  return (await getCatalog()).collections;
}

export async function getCollection(slug: string) {
  const c = await getCatalog();
  const collection = c.collections.find((x) => x.slug === slug);
  if (!collection) return null;
  return { collection, products: c.products.filter((p) => p.collection === slug) };
}

export async function getCategories() {
  return (await getCatalog()).categories;
}

export async function getCategory(slug: string) {
  const c = await getCatalog();
  const category = c.categories.find((x) => x.slug === slug);
  if (!category) return null;
  return { category, products: c.products.filter((p) => p.categories.includes(slug)) };
}

export async function getSettings() {
  return (await getCatalog()).settings;
}

