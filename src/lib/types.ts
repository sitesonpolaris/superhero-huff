export type ProductImage = { src: string; alt: string; width?: number; height?: number };

export type Variant = {
  id: string;
  sku: string | null;
  size: string | null;
  color: string | null;
  price: number;
  stock: number | null; // null = not tracked
  image: string | null;
};

export type Product = {
  id: string;
  slug: string;
  name: string;
  description: string;
  price: number;
  compareAtPrice: number | null;
  categories: string[];
  collection: string | null;
  isNew: boolean;
  featured: boolean;
  images: ProductImage[];
  variants: Variant[];
  createdAt: string;
};

export type Collection = {
  slug: string;
  name: string;
  tagline: string | null;
  issue: number;
  cover: string | null;
  count: number;
};

export type Category = { slug: string; name: string; count: number };

export type StoreSettings = {
  flatShippingCents: number;
  freeShippingThresholdCents: number | null;
  announcement: string | null;
};

export type CartLine = {
  variantId: string;
  productSlug: string;
  name: string;
  size: string | null;
  color: string | null;
  price: number;
  image: string | null;
  quantity: number;
};
