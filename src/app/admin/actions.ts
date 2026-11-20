"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin";
import { CATALOG_TAG } from "@/lib/catalog";

export type ActionResult = { ok: boolean; message: string; id?: string };

const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
const num = (v: unknown, fallback = 0) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
};
const money = (v: unknown) => Math.max(0, Math.round(num(v) * 100) / 100);

// Products -----------------------------------------------------------------

export type ProductInput = {
  id?: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  compareAtPrice: number | null;
  collection: string | null;
  categories: string[];
  isNew: boolean;
  featured: boolean;
  active: boolean;
  images: { src: string; alt: string }[];
  variants: { id?: string; sku: string | null; size: string | null; color: string | null; price: number; stock: number | null; image: string | null; active: boolean }[];
};

export async function saveProduct(input: ProductInput): Promise<ActionResult> {
  const { supabase } = await requireAdmin();
  const name = input.name.trim().slice(0, 160);
  if (!name) return { ok: false, message: "Name is required." };
  const slug = slugify(input.slug || name);
  if (!slug) return { ok: false, message: "Slug is required." };
  if (!input.variants.length) return { ok: false, message: "Add at least one variant (use one with no size for single items)." };

  const row = {
    name,
    slug,
    description: input.description.trim().slice(0, 5000),
    price: money(input.price),
    compare_at_price: input.compareAtPrice == null || input.compareAtPrice === 0 ? null : money(input.compareAtPrice),
    collection_slug: input.collection || null,
    categories: [...new Set(input.categories)],
    is_new: input.isNew,
    featured: input.featured,
    active: input.active,
    images: input.images.filter((i) => i.src).map((i) => ({ src: i.src, alt: i.alt.trim() || name })),
  };

  let id = input.id;
  if (id) {
    const { error } = await supabase.from("products").update(row).eq("id", id);
    if (error) return { ok: false, message: error.code === "23505" ? "Another product already uses that slug." : error.message };
  } else {
    const { data, error } = await supabase.from("products").insert(row).select("id").single();
    if (error) return { ok: false, message: error.code === "23505" ? "Another product already uses that slug." : error.message };
    id = data.id;
  }

  // Variants: update existing, insert new, deactivate removed (kept for order history).
  const { data: existing } = await supabase.from("variants").select("id").eq("product_id", id);
  const keep = new Set(input.variants.filter((v) => v.id).map((v) => v.id!));
  const removed = (existing ?? []).map((v) => v.id).filter((vid) => !keep.has(vid));
  if (removed.length) await supabase.from("variants").update({ active: false }).in("id", removed);

  for (const [i, v] of input.variants.entries()) {
    const vr = {
      product_id: id,
      sku: v.sku?.trim() || null,
      size: v.size?.trim() || null,
      color: v.color?.trim() || null,
      price: money(v.price || input.price),
      stock: v.stock == null || (v.stock as unknown) === "" ? null : Math.max(0, Math.floor(num(v.stock))),
      image: v.image || null,
      sort: i,
      active: v.active,
    };
    const { error } = v.id ? await supabase.from("variants").update(vr).eq("id", v.id) : await supabase.from("variants").insert(vr);
    if (error) return { ok: false, message: `Variant ${i + 1}: ${error.message}`, id };
  }

  // The product's "from" price follows its cheapest active variant.
  const activePrices = input.variants.filter((v) => v.active).map((v) => money(v.price || input.price));
  if (activePrices.length) await supabase.from("products").update({ price: Math.min(...activePrices) }).eq("id", id);

  updateTag(CATALOG_TAG);
  return { ok: true, message: "Saved.", id };
}

export async function deleteProduct(id: string) {
  const { supabase } = await requireAdmin();
  // Products with orders are archived instead of deleted so order history keeps its links.
  const { count } = await supabase.from("order_items").select("id", { count: "exact", head: true }).eq("product_id", id);
  if (count) await supabase.from("products").update({ active: false }).eq("id", id);
  else await supabase.from("products").delete().eq("id", id);
  updateTag(CATALOG_TAG);
  redirect("/admin/products");
}

// Orders -------------------------------------------------------------------

const STATUSES = ["paid", "fulfilled", "shipped", "delivered", "cancelled", "refunded"];

export async function updateOrder(_: ActionResult | null, form: FormData): Promise<ActionResult> {
  const { supabase } = await requireAdmin();
  const id = String(form.get("id"));
  const status = String(form.get("status"));
  if (!STATUSES.includes(status)) return { ok: false, message: "Pick a valid status." };
  const tracking = String(form.get("tracking_number") ?? "").trim() || null;
  const patch: Record<string, unknown> = {
    status,
    carrier: String(form.get("carrier") ?? "").trim() || null,
    tracking_number: tracking,
    notes: String(form.get("notes") ?? "").trim().slice(0, 2000) || null,
  };
  if (status === "shipped") patch.shipped_at = new Date().toISOString();
  const { error } = await supabase.from("orders").update(patch).eq("id", id);
  if (error) return { ok: false, message: error.message };
  return { ok: true, message: "Order updated." };
}

// Collections ----------------------------------------------------------------

export async function saveCollection(_: ActionResult | null, form: FormData): Promise<ActionResult> {
  const { supabase } = await requireAdmin();
  const original = String(form.get("original") ?? "");
  const name = String(form.get("name") ?? "").trim();
  const slug = slugify(String(form.get("slug") || name));
  if (!name || !slug) return { ok: false, message: "Name is required." };
  const row = {
    slug,
    name,
    tagline: String(form.get("tagline") ?? "").trim() || null,
    issue: Math.max(0, Math.floor(num(form.get("issue")))),
    cover: String(form.get("cover") ?? "").trim() || null,
    active: form.get("active") === "on",
  };
  const { error } = original ? await supabase.from("collections").update(row).eq("slug", original) : await supabase.from("collections").insert(row);
  if (error) return { ok: false, message: error.code === "23505" ? "That slug is taken." : error.message };
  updateTag(CATALOG_TAG);
  return { ok: true, message: original ? "Collection saved." : "Collection added." };
}

// Settings -------------------------------------------------------------------

export async function saveSettings(_: ActionResult | null, form: FormData): Promise<ActionResult> {
  const { supabase } = await requireAdmin();
  const free = String(form.get("free_threshold") ?? "").trim();
  const { error } = await supabase
    .from("settings")
    .update({
      flat_shipping_cents: Math.round(money(form.get("flat_shipping")) * 100),
      free_shipping_threshold_cents: free ? Math.round(money(free) * 100) : null,
      announcement: String(form.get("announcement") ?? "").trim().slice(0, 140) || null,
      store_email: String(form.get("store_email") ?? "").trim() || null,
    })
    .eq("id", 1);
  if (error) return { ok: false, message: error.message };
  updateTag(CATALOG_TAG);
  return { ok: true, message: "Settings saved." };
}

// Inbox ------------------------------------------------------------------------

export async function toggleHandled(id: string, handled: boolean) {
  const { supabase } = await requireAdmin();
  await supabase.from("contact_messages").update({ handled }).eq("id", id);
}
