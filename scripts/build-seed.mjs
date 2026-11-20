// Builds src/data/catalog.json + public/products/*.webp from the WordPress export.
// Usage: node scripts/build-seed.mjs <extracted-catalog.json> <wp-content/uploads dir>
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { fileURLToPath } from "node:url";

const [, , catalogPath, uploadsDir] = process.argv;
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outImg = path.join(root, "public", "products");
fs.mkdirSync(outImg, { recursive: true });

const src = JSON.parse(fs.readFileSync(catalogPath, "utf8"));

const COLLECTIONS = [
  { slug: "black-majic", name: "Black Majic", tagline: "Experience the magic of Superhero Huff!" },
  { slug: "lioness-calm", name: "Lioness Calm", tagline: "The calm before the storm!" },
  { slug: "peaceful-powerful", name: "Peaceful Powerful", tagline: "Experience the calm force of Superhero Huff!" },
  { slug: "punch-superhero-huff", name: "Punch Superhero Huff", tagline: "Superhero Huff takes crime into her own hands!" },
  { slug: "unleashed", name: "Unleashed", tagline: "The strength of Superhero Huff has been unleashed!" },
  { slug: "vortex-superhero-huff", name: "Vortex Superhero Huff", tagline: "Superhero Huff unleashes her vortex power on her enemies!" },
  { slug: "purple-thrust", name: "Purple Thrust", tagline: "Superhero Huff cannot be stopped!" },
  { slug: "propel", name: "Propel", tagline: "Experience the power of Superhero Huff!" },
  { slug: "release", name: "Release", tagline: "Let it go. Let it fly." },
];
const CATEGORIES = [
  { slug: "t-shirts", name: "T-Shirts", wp: ["t-shirts"] },
  { slug: "leggings", name: "Leggings", wp: ["leggings"] },
  { slug: "jackets", name: "Jackets", wp: ["jackets"] },
  { slug: "sets", name: "Sets", wp: ["sets"] },
  { slug: "hoodies", name: "Hoodies", wp: ["hoodies"] },
  { slug: "womens", name: "Women's", wp: ["womens"] },
  { slug: "kids", name: "Kids", wp: ["children"] },
  { slug: "comics", name: "Comics", wp: ["comic-books"] },
  { slug: "posters", name: "Metal Posters", wp: ["metal-posters"] },
  { slug: "custom", name: "Custom", wp: ["custom"] },
];
const SIZE = { "extra-small": "XS", small: "S", medium: "M", large: "L", xl: "XL", "2xl": "2XL", "3xl": "3XL", "4xl": "4XL" };
const SIZE_ORDER = ["XS", "S", "M", "L", "XL", "2XL", "3XL", "4XL"];

const strip = (s) =>
  (s || "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\[[^\]]+\]/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&#8217;|&rsquo;/g, "’")
    .replace(/&#8220;|&#8221;/g, '"')
    .replace(/\s+/g, " ")
    .trim();
const slugify = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const imgCache = new Map();
async function convert(rel, base) {
  if (!rel) return null;
  if (imgCache.has(rel)) return imgCache.get(rel);
  const file = path.join(uploadsDir, rel);
  if (!fs.existsSync(file)) {
    console.warn("missing image", rel);
    imgCache.set(rel, null);
    return null;
  }
  const name = `${base}.webp`;
  await sharp(file).rotate().resize({ width: 1400, height: 1400, fit: "inside", withoutEnlargement: true }).webp({ quality: 80 }).toFile(path.join(outImg, name));
  const meta = await sharp(path.join(outImg, name)).metadata();
  const out = { src: `/products/${name}`, width: meta.width, height: meta.height };
  imgCache.set(rel, out);
  return out;
}

const products = [];
const seenSlugs = new Set();
for (const p of src.products.filter((p) => p.status === "publish")) {
  const wpCats = p.terms.filter((t) => t.tax === "product_cat").map((t) => t.slug);
  let categories = CATEGORIES.filter((c) => c.wp.some((w) => wpCats.includes(w))).map((c) => c.slug);
  const isSignature = p.title.startsWith("Custom ") && p.date >= "2026";
  if (isSignature) categories = ["jackets", "womens"];
  const collection =
    (COLLECTIONS.find((c) => p.terms.some((t) => t.tax === "product_cat" && t.slug === c.slug)) ??
      COLLECTIONS.find((c) => p.title.toLowerCase().startsWith(c.name.toLowerCase().split(" ")[0] + " ")))?.slug ?? null;

  let slug = p.slug;
  if (seenSlugs.has(slug)) slug = `${slug}-2`;
  seenSlugs.add(slug);

  const images = [];
  for (const [i, rel] of [p.thumb, ...p.gallery].filter(Boolean).entries()) {
    const im = await convert(rel, `${slug}-${i + 1}`);
    if (im && !images.some((x) => x.src === im.src)) images.push({ ...im, alt: `${p.title}${i ? ` — view ${i + 1}` : ""}` });
  }

  const variants = [];
  for (const v of p.variations.filter((v) => v.status === "publish")) {
    const sizeRaw = v.attrs["attribute_pa_size"];
    const color = v.attrs["attribute_color"] || v.attrs["attribute_pa_color"] || null;
    const posterSize = v.attrs["attribute_sizes"] || null;
    const size = posterSize || (sizeRaw ? SIZE[sizeRaw] ?? sizeRaw.toUpperCase() : null);
    if (!size && !color) continue;
    if (variants.some((x) => x.size === size && x.color === color)) continue;
    let image = null;
    if (v.image) {
      const im = await convert(v.image, `${slug}-${slugify(color || size || "v")}`);
      if (im) image = im.src;
    }
    variants.push({
      sku: v.sku || null,
      size,
      color: color || null,
      price: Number(v.price || p.price),
      stock: v.stock != null && v.stock !== "" ? Number(v.stock) : null,
      image,
    });
  }
  variants.sort((a, b) => (a.color || "").localeCompare(b.color || "") || SIZE_ORDER.indexOf(a.size) - SIZE_ORDER.indexOf(b.size));

  const prices = variants.length ? variants.map((v) => v.price) : [Number(p.price)];
  products.push({
    slug,
    legacy_slug: p.slug,
    name: p.title.replace(/\s+/g, " ").trim(),
    description: strip(p.content) || strip(p.excerpt),
    price: Math.min(...prices),
    compare_at_price: null,
    categories,
    collection,
    is_new: isSignature,
    featured: false,
    images,
    variants,
    created_at: p.date,
  });
}

const collections = COLLECTIONS.map((c, i) => {
  const items = products.filter((p) => p.collection === c.slug);
  return { ...c, issue: i + 1, cover: items[0]?.images[0]?.src ?? null, count: items.length };
}).filter((c) => c.count > 0);
const categories = CATEGORIES.map(({ wp, ...c }) => ({ ...c, count: products.filter((p) => p.categories.includes(c.slug)).length })).filter((c) => c.count > 0);

fs.mkdirSync(path.join(root, "src", "data"), { recursive: true });
fs.writeFileSync(path.join(root, "src", "data", "catalog.json"), JSON.stringify({ collections, categories, products }, null, 1));
console.log(products.length, "products;", collections.length, "collections;", categories.map((c) => `${c.slug}:${c.count}`).join(" "));
console.log("no images:", products.filter((p) => !p.images.length).map((p) => p.slug));
