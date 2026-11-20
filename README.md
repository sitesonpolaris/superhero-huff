# Superhero Huff

Store for superherohuff.com — Next.js 16 + Tailwind v4 + Supabase + Stripe, deployed on Netlify.

## Local
```
npm install
cp .env.example .env.local   # fill in Supabase + Stripe test keys
npm run dev
```
Without env vars the site runs on the bundled seed catalog (`src/data/catalog.json`); checkout and admin stay disabled.

## Database
Run `supabase/migrations/0001_store_schema.sql`, then `supabase/seed.sql`, then add the owner to `public.admins`.

## Stripe
Webhook endpoint: `https://<site>/api/stripe/webhook` with events `checkout.session.completed`, `checkout.session.expired`, `checkout.session.async_payment_succeeded`, `checkout.session.async_payment_failed`, `charge.refunded`.

See `CLAUDE.md` for project notes.
