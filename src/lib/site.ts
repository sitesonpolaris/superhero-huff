export const site = {
  name: "Superhero Huff",
  shortName: "Huff",
  tagline: "Custom apparel and comics starring Agent Huff.",
  description:
    "Shop Superhero Huff: all-over-print jackets, leggings, tees and sets from the Agent Huff character collections, plus the Superhero Huff comic books.",
  story:
    "Dive into the world of Superhero Huff, a Black female undercover drug agent who unlocks her hidden powers and self-realization.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://superhero-huff.netlify.app",
  // TODO(owner): confirm this is still the store inbox.
  email: "superherohuff@gmail.com",
  publisher: "Engendering Strength",
  social: [
    { label: "Instagram", href: "https://www.instagram.com/superherohuff" },
    { label: "TikTok", href: "https://www.tiktok.com/@superherohuff" },
    { label: "Facebook", href: "https://www.facebook.com/Superherohuff" },
  ],
  nav: {
    clothing: [
      { label: "Shop all", href: "/shop" },
      { label: "Leggings", href: "/shop/leggings" },
      { label: "Jackets", href: "/shop/jackets" },
      { label: "Sets", href: "/shop/sets" },
      { label: "Women's", href: "/shop/womens" },
      { label: "Hoodies", href: "/shop/hoodies" },
      { label: "T-Shirts", href: "/shop/t-shirts" },
    ],
    help: [
      { label: "Track an order", href: "/track" },
      { label: "Shipping & Returns", href: "/shipping-returns" },
      { label: "Terms & Conditions", href: "/terms" },
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Contact", href: "/contact" },
    ],
  },
} as const;
