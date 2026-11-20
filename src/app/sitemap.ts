import type { MetadataRoute } from "next";
import { getCatalog } from "@/lib/catalog";
import { site } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { products, collections, categories } = await getCatalog();
  const u = (path: string, priority = 0.6) => ({ url: `${site.url}${path}`, priority });
  return [
    u("/", 1),
    u("/shop", 0.9),
    u("/collections", 0.8),
    u("/comics", 0.8),
    u("/about", 0.5),
    u("/contact", 0.4),
    u("/shipping-returns", 0.3),
    u("/terms", 0.2),
    u("/privacy", 0.2),
    u("/track", 0.3),
    ...categories.filter((c) => c.slug !== "comics").map((c) => u(`/shop/${c.slug}`, 0.7)),
    ...collections.map((c) => u(`/collections/${c.slug}`, 0.7)),
    ...products.map((p) => u(`/product/${p.slug}`, 0.6)),
  ];
}
