import type { Product, Variant } from "./types";

export const inStock = (v: Variant) => v.stock === null || v.stock > 0;
export const productInStock = (p: Product) => p.variants.some(inStock);
export const priceRange = (p: Product) => {
  const prices = p.variants.map((v) => v.price);
  return { min: Math.min(p.price, ...prices), max: Math.max(p.price, ...prices) };
};
export const isComic = (p: Product) => p.categories.includes("comics");
