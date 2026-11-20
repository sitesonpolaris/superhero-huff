import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductCard } from "@/components/product/ProductCard";
import { ProductDetail } from "@/components/product/ProductDetail";
import { getCatalog, getProduct } from "@/lib/catalog";
import { inStock } from "@/lib/product-utils";
import { site } from "@/lib/site";

export async function generateStaticParams() {
  const { products } = await getCatalog();
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/product/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const p = await getProduct(slug);
  if (!p) return {};
  return {
    title: p.name,
    description: p.description ? p.description.slice(0, 155) : `${p.name} from Superhero Huff.`,
    alternates: { canonical: `/product/${slug}` },
    openGraph: p.images[0] ? { images: [p.images[0].src] } : undefined,
  };
}

export default async function ProductPage({ params }: PageProps<"/product/[slug]">) {
  const { slug } = await params;
  const { products, collections } = await getCatalog();
  const product = products.find((p) => p.slug === slug);
  if (!product) notFound();
  const collection = collections.find((c) => c.slug === product.collection) ?? null;
  const related = products
    .filter((p) => p.id !== product.id && (p.collection && p.collection === product.collection ? true : p.categories.some((c) => product.categories.includes(c))))
    .sort((a, b) => Number(b.collection === product.collection) - Number(a.collection === product.collection))
    .slice(0, 4);

  const prices = product.variants.map((v) => v.price);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description || undefined,
    image: product.images.map((i) => (i.src.startsWith("http") ? i.src : `${site.url}${i.src}`)),
    brand: { "@type": "Brand", name: site.name },
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "USD",
      lowPrice: Math.min(...prices),
      highPrice: Math.max(...prices),
      offerCount: product.variants.length,
      availability: product.variants.some(inStock) ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      url: `${site.url}/product/${product.slug}`,
    },
  };

  return (
    <>
      <section className="on-paper bg-paper pb-20 pt-8 text-ink lg:pt-12">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10">
          <nav aria-label="Breadcrumb" className="mb-6 text-sm text-slate">
            <ol className="flex flex-wrap items-center gap-2">
              <li>
                <Link href="/shop" className="hover:underline">
                  Shop
                </Link>
              </li>
              {collection && (
                <>
                  <li aria-hidden="true">/</li>
                  <li>
                    <Link href={`/collections/${collection.slug}`} className="hover:underline">
                      {collection.name}
                    </Link>
                  </li>
                </>
              )}
              <li aria-hidden="true">/</li>
              <li aria-current="page" className="font-semibold text-ink">
                {product.name}
              </li>
            </ol>
          </nav>
          <ProductDetail product={product} collectionName={collection?.name ?? null} />
        </div>
      </section>
      {related.length > 0 && (
        <section aria-labelledby="related-title" className="on-paper border-t-2 border-ink bg-paper-2 py-16 text-ink lg:py-20">
          <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10">
            <h2 id="related-title" className="display text-5xl">
              {collection ? `More from ${collection.name}` : "You might also like"}
            </h2>
            <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4 md:gap-x-6">
              {related.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} />
              ))}
            </div>
          </div>
        </section>
      )}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </>
  );
}
