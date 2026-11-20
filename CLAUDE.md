@AGENTS.md

# Superhero Huff: client notes

E-commerce redesign of superherohuff.com (WordPress/WooCommerce → Next.js). Comic-book apparel and comics starring Agent Huff. **Custom-quote tier** (store + Stripe + accounts + admin).

## Status (Nov 20 2026)
- Supabase project **Superhero Huff**, ref `jdpalhrjxqfzzxouuffb` (us-east-2, org Sites on Polaris, Pro). Migrations 0001 + 0002 applied, catalog seeded (56 products, 256 variants, 9 collections, 10 categories). Security advisor: only the intended `is_admin()` warning.
- **Live:** https://superhero-huff.netlify.app, Netlify site id `52a43508-eb80-4983-a7a0-1640bae3d651` (team sitesonpolaris). Env vars set: Supabase URL + publishable key, NEXT_PUBLIC_SITE_URL, STRIPE_AUTOMATIC_TAX=false. Deployed Nov 20 2026 via Netlify MCP upload of a clean `git archive` (uploading the working folder 500s because of node_modules/.next). Verified: 10 pages at 375px with no errors or overflow; Front-End Checklist audit has no critical issues.
- Not on continuous deploy yet: no GitHub repo until `gh auth login`.
- Still to do: `SUPABASE_SERVICE_ROLE_KEY` (Jesse adds it himself, never in chat); Stripe test keys + webhook; private GitHub repo `sitesonpolaris/superhero-huff` + link Netlify to it; admin: the Sites on Polaris account is in `public.admins`; add the owner the same way once they sign up (`insert into admins (user_id) select id from auth.users where email = '…'`); set Supabase Auth Site URL + redirect URLs to the live domain.
- Without Supabase env vars the site falls back to the bundled seed catalog (`src/data/catalog.json`).

## Stack
Next 16.4 (cacheComponents + partialPrefetching on), Tailwind v4 via `@tailwindcss/postcss`, Supabase (`@supabase/ssr`), Stripe Checkout (hosted), Netlify.
- Catalog reads: `src/lib/catalog.ts` → `getCatalog()` is `"use cache"` + `cacheTag("catalog")`; admin saves call `updateTag`, the Stripe webhook calls `revalidateTag(..., "max")`.
- Checkout: `src/app/api/checkout/route.ts` re-prices from the DB, creates a `pending` order + items, then a Stripe session (US shipping only, flat rate from `settings`, `automatic_tax` only if `STRIPE_AUTOMATIC_TAX=true`).
- Webhook: `src/app/api/stripe/webhook/route.ts` (checkout.session.completed / expired / async, charge.refunded). Marks paid once (idempotent), decrements stock via `decrement_stock()`.
- Auth: Supabase email+password or magic link; `/auth/callback`; `src/proxy.ts` refreshes the session and gates `/account` + `/admin`. Admin = row in `public.admins` (checked by `is_admin()` and `requireAdmin()`).
- Admin `/admin`: dashboard, orders (status/carrier/tracking), products (editor with Storage photo upload to bucket `product-images`, variants/stock), collections, inbox (contact + subscribers CSV), settings (flat shipping, free-shipping threshold, announcement).
- Env vars: see `.env.example`.
- **Don't use `usePathname` in the root Header**: it makes the header stream behind Suspense and caused a production hydration error (#418). Menus close on link click instead.

## Identity
- Palette (tokens in `globals.css @theme`): ink #0B0D14, Huff yellow #FFD400, Engendering purple #6B2FD6, power red #D7262E (badges only), paper #F4F1EA.
- Fonts: Anton (display, uppercase) + Archivo variable (body), via next/font/local from @fontsource.
- Motif: character collections are numbered comic **issues** (#01 Black Majic … #09 Release); panel cards with ink outline + offset shadow; angled `cut-bottom/cut-top` section edges; faint `halftone` dots.
- Showpiece: "Choose your Huff" issue rail on the homepage (`IssueRail.tsx`).
- Hero: 11.3s loop re-cut from the 2023 promo video (7 shots: kick, purple tee flex, pink-room skates, three tees, camo group, skate stretch, close-up wave). `public/video/hero-desktop.mp4` (1920×1080, 3.0 MB), `hero-mobile.mp4` (720×1280 portrait crop, 1.2 MB), posters. Edit script was in the session scratchpad (ffmpeg xfade, 0.3s dissolves, seamless loop). No Higgsfield credits used.
- Logo: only a 163×150 PNG exists (`public/brand/logo.png` recoloured yellow from the old footer logo). **Ask the owner for a vector/hi-res logo.**

## Data sources
- `Superhero_huff/` WordPress export (sibling folder): DB dump `mwp_db/db_dom710557.sql`, uploads. `scripts/build-seed.mjs` turns the extracted catalog into `src/data/catalog.json` + `public/products/*.webp`; `scripts/seed-sql.mjs` → `supabase/seed.sql`.
- 56 published products, 9 collections, 256 variants, real prices from WooCommerce. 14 draft products were left out.
- Google Drive folder (Characters, Clothing, Comics PDFs) matches the WP uploads.
- Socials: instagram.com/superherohuff, tiktok.com/@superherohuff, facebook.com/Superherohuff.
- Legal copy (`src/content/legal.ts`) carried over from WP. Changed only: Payments paragraph (now "cards via Stripe") and the Illinois 9.25% tax line (now "calculated at checkout").

## Owner to confirm
- Store email (superherohuff@gmail.com?) and creator name + full Agent Huff origin story for `/about` (only one line exists).
- Flat shipping rate (placeholder $8.00) and any free-shipping threshold; whether to ship to Canada (old policy says yes; checkout is US-only for now).
- Return policy wording ("no cash refunds", 20% restocking fee, RA numbers) still OK.
- Stock levels: WooCommerce only tracked stock on 3 products; everything else sells untracked until counts are entered in admin.
- Two products are both named "Peaceful Powerful Baseball Jacket" (slugs `peaceful-powerful` and `peaceful-powerful-jacket-2`).
- Sorority licensing: the 2026 "Custom Signature" jackets mention ΔΣΘ detailing (they're live on the old site and were kept). Separate Delta/Zeta collection pages were not built. Confirm the owner is licensed for Greek-letter marks.
- Black Majic T-Shirt and the Black Majic Leggings + Lace Back Shirt Set had stock 0 in WooCommerce, so they show as sold out.
- Seven tees only had "…T-shirt is now available!" as a description; replaced with the standard tee fabric/care text.
- Vector logo.
