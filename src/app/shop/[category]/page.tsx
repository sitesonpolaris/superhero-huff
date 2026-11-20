import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Listing } from "@/components/product/Listing";
import { PageBanner } from "@/components/layout/PageBanner";
import { getCatalog, getCategory } from "@/lib/catalog";

const INTRO: Record<string, string> = {
  leggings: "Pocket leggings with all-over sublimated prints. Soft, stretchy and lightweight.",
  jackets: "Baseball, motorcycle and signature puffer jackets that carry the whole story on your back.",
  sets: "Matching looks, head to toe. Jackets, tees, leggings and dresses from one collection.",
  "t-shirts": "High-performance dry-wicking tees with full-colour front prints. True to size.",
  hoodies: "Off-the-shoulder hoodies in the Superhero Huff prints.",
  womens: "Every women's cut from the Superhero Huff collections.",
};

export async function generateStaticParams() {
  const { categories } = await getCatalog();
  return categories.filter((c) => c.slug !== "comics").map((c) => ({ category: c.slug }));
}

export async function generateMetadata({ params }: PageProps<"/shop/[category]">): Promise<Metadata> {
  const { category } = await params;
  const data = await getCategory(category);
  if (!data) return {};
  return {
    title: `${data.category.name} | Shop`,
    description: INTRO[category] ?? `Shop Superhero Huff ${data.category.name.toLowerCase()}.`,
    alternates: { canonical: `/shop/${category}` },
  };
}

export default async function CategoryPage({ params }: PageProps<"/shop/[category]">) {
  const { category } = await params;
  const data = await getCategory(category);
  if (!data) notFound();
  const { collections } = await getCatalog();
  return (
    <>
      <PageBanner eyebrow="Clothing" title={data.category.name} intro={INTRO[category]} />
      <Listing products={data.products} collections={collections} />
    </>
  );
}
