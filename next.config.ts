import type { NextConfig } from "next";

const collections = [
  "black-majic",
  "lioness-calm",
  "peaceful-powerful",
  "punch-superhero-huff",
  "unleashed",
  "vortex-superhero-huff",
  "purple-thrust",
  "propel",
  "release",
];

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [{ protocol: "https", hostname: "*.supabase.co", pathname: "/storage/v1/object/public/**" }],
  },
  async redirects() {
    // 301s from the old WordPress / WooCommerce URLs.
    const r = (source: string, destination: string) => ({ source, destination, permanent: true });
    return [
      ...collections.flatMap((c) => [
        r(`/${c}`, `/collections/${c}`),
        r(`/product-category/char-collections/${c}`, `/collections/${c}`),
        r(`/character_collection/${c}`, `/collections/${c}`),
      ]),
      r("/lioness-calm-2", "/collections/lioness-calm"),
      r("/product-category/char-collections", "/collections"),
      r("/delta-sigma-theta", "/collections"),
      r("/character_collection/:slug", "/collections"),
      r("/product-category/comic-books", "/comics"),
      r("/product-category/children", "/shop/kids"),
      r("/product-category/metal-posters", "/shop/posters"),
      r("/product-category/uncategorized", "/shop"),
      r("/product-category/:slug", "/shop/:slug"),
      r("/product-tag/:slug", "/shop"),
      r("/clothing-2", "/shop"),
      r("/clothing", "/shop"),
      r("/womens-clothing", "/shop/womens"),
      r("/wishlist", "/shop"),
      r("/preview", "/"),
      r("/connect", "/contact"),
      r("/log-in", "/account/login"),
      r("/my-account", "/account"),
      r("/my-account/:path*", "/account"),
      r("/order-tracking", "/track"),
      r("/cart", "/shop"),
      r("/checkout", "/shop"),
      r("/blog", "/"),
      r("/fashion/:path*", "/"),
      r("/uncategorized/:path*", "/"),
      r("/category/:path*", "/"),
      r("/tag/:path*", "/"),
    ].filter((x) => x.source !== x.destination);
  },
};

export default nextConfig;
