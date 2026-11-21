import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { PageBanner, PageBannerFallback } from "@/components/layout/PageBanner";
import { Listing } from "@/components/product/Listing";
import { getCollection, getCollections } from "@/lib/catalog";
import { issueLabel } from "@/lib/format";

export async function generateStaticParams() {
  const collections = await getCollections();
  return collections.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: PageProps<"/collections/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const data = await getCollection(slug);
  if (!data) return {};
  return {
    title: `${data.collection.name} Collection`,
    description: `${data.collection.tagline ?? ""} Shop the ${data.collection.name} collection from Superhero Huff.`.trim(),
    alternates: { canonical: `/collections/${slug}` },
    openGraph: data.collection.cover ? { images: [data.collection.cover] } : undefined,
  };
}

export default function CollectionPage({ params }: PageProps<"/collections/[slug]">) {
  // `params` is read inside Suspense so Next can regenerate the shared shell
  // (slug unknown) at runtime on Netlify. Prerendered slugs still ship full HTML.
  return (
    <Suspense fallback={<PageBannerFallback eyebrow="Character collection" />}>
      <Collection params={params} />
    </Suspense>
  );
}

async function Collection({ params }: Pick<PageProps<"/collections/[slug]">, "params">) {
  const { slug } = await params;
  const data = await getCollection(slug);
  if (!data) notFound();
  const { collection, products } = data;
  return (
    <>
      <PageBanner eyebrow="Character collection" issue={issueLabel(collection.issue)} title={collection.name} intro={collection.tagline} image={collection.cover} />
      <Listing products={products} />
    </>
  );
}
