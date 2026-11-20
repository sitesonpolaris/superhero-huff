import { ProductCard } from "./ProductCard";
import { ProductGrid } from "./ProductGrid";
import type { Product } from "@/lib/types";

export function Listing({ products, collections }: { products: Product[]; collections?: { slug: string; name: string }[] }) {
  return (
    <section className="on-paper bg-paper py-12 text-ink lg:py-16">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10">
        <ProductGrid products={products} collections={collections}>
          {products.map((p, i) => (
            <ProductCard key={p.id} product={p} index={i} priority={i < 4} />
          ))}
        </ProductGrid>
      </div>
    </section>
  );
}
