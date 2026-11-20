import type { Metadata } from "next";
import { Listing } from "@/components/product/Listing";
import { PageBanner } from "@/components/layout/PageBanner";
import { getCatalog } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Shop All Clothing",
  description: "Jackets, leggings, tees, hoodies and sets from every Superhero Huff character collection.",
  alternates: { canonical: "/shop" },
};

export default async function ShopPage() {
  const { products, collections } = await getCatalog();
  const apparel = products.filter((p) => !p.categories.includes("comics"));
  return (
    <>
      <PageBanner eyebrow="Superhero Huff clothing" title="Shop all" intro="Every piece is all-over printed with art from the Superhero Huff comics." />
      <Listing products={apparel} collections={collections} />
    </>
  );
}
