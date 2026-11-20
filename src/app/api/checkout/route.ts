import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { site } from "@/lib/site";
import { hasStripe, stripe } from "@/lib/stripe";
import { serviceClient } from "@/lib/supabase/admin";
import { hasSupabase } from "@/lib/supabase/env";
import { serverClient } from "@/lib/supabase/server";

type Body = { items?: { variantId?: unknown; quantity?: unknown }[] };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type V = {
  id: string;
  size: string | null;
  color: string | null;
  price: number | string;
  stock: number | null;
  image: string | null;
  active: boolean;
  product: { id: string; slug: string; name: string; images: { src: string }[]; active: boolean };
};

const absolute = (src: string | null | undefined) => (!src ? undefined : src.startsWith("http") ? src : `${site.url}${src}`);
const label = (v: V) => [v.product.name, [v.color, v.size].filter(Boolean).join(" / ")].filter(Boolean).join(" — ");

export async function POST(req: Request) {
  if (!hasSupabase || !hasStripe() || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ error: "Checkout opens soon. The store is still being set up." }, { status: 503 });
  }

  let body: Body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  // Merge duplicate lines and validate shape.
  const wanted = new Map<string, number>();
  for (const it of body.items ?? []) {
    const id = String(it.variantId ?? "");
    const qty = Math.floor(Number(it.quantity));
    if (!UUID.test(id) || !Number.isFinite(qty) || qty < 1) continue;
    wanted.set(id, Math.min(10, (wanted.get(id) ?? 0) + qty));
  }
  if (!wanted.size) return NextResponse.json({ error: "Your bag is empty or out of date. Please re-add your items." }, { status: 400 });
  if (wanted.size > 40) return NextResponse.json({ error: "That's a lot of gear! Please split it into smaller orders." }, { status: 400 });

  const db = serviceClient();
  // Prices and stock always come from the database, never the browser.
  const { data, error } = await db
    .from("variants")
    .select("id, size, color, price, stock, image, active, product:products!inner(id, slug, name, images, active)")
    .in("id", [...wanted.keys()]);
  if (error) return NextResponse.json({ error: "Could not load your bag. Please try again." }, { status: 500 });

  const rows = (data ?? []) as unknown as V[];
  if (rows.length !== wanted.size) {
    return NextResponse.json({ error: "Some items in your bag are no longer available. Please remove them and try again." }, { status: 409 });
  }
  for (const v of rows) {
    const qty = wanted.get(v.id)!;
    if (!v.active || !v.product.active) return NextResponse.json({ error: `${label(v)} is no longer available.` }, { status: 409 });
    if (v.stock !== null && v.stock < qty) {
      return NextResponse.json({ error: v.stock === 0 ? `${label(v)} just sold out.` : `Only ${v.stock} left of ${label(v)}.` }, { status: 409 });
    }
  }

  const { data: settings } = await db.from("settings").select("flat_shipping_cents, free_shipping_threshold_cents").eq("id", 1).maybeSingle();
  const subtotal = rows.reduce((n, v) => n + Math.round(Number(v.price) * 100) * wanted.get(v.id)!, 0);
  const threshold = settings?.free_shipping_threshold_cents ?? null;
  const shippingCents = threshold != null && subtotal >= threshold ? 0 : (settings?.flat_shipping_cents ?? 800);

  // Signed-in shoppers get the order linked to their account.
  let userId: string | null = null;
  let userEmail: string | undefined;
  try {
    const { data: auth } = await (await serverClient()).auth.getUser();
    userId = auth.user?.id ?? null;
    userEmail = auth.user?.email ?? undefined;
  } catch {
    /* guest checkout */
  }

  const { data: order, error: orderErr } = await db
    .from("orders")
    .insert({ email: userEmail ?? "", user_id: userId, status: "pending", subtotal_cents: subtotal, shipping_cents: shippingCents })
    .select("id, number")
    .single();
  if (orderErr || !order) return NextResponse.json({ error: "Could not start checkout. Please try again." }, { status: 500 });

  const { error: itemsErr } = await db.from("order_items").insert(
    rows.map((v) => ({
      order_id: order.id,
      product_id: v.product.id,
      variant_id: v.id,
      name: v.product.name,
      size: v.size,
      color: v.color,
      image: v.image ?? v.product.images?.[0]?.src ?? null,
      unit_price_cents: Math.round(Number(v.price) * 100),
      quantity: wanted.get(v.id)!,
    })),
  );
  if (itemsErr) {
    await db.from("orders").delete().eq("id", order.id);
    return NextResponse.json({ error: "Could not start checkout. Please try again." }, { status: 500 });
  }

  const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = rows.map((v) => {
    const img = absolute(v.image ?? v.product.images?.[0]?.src);
    return {
      quantity: wanted.get(v.id)!,
      price_data: {
        currency: "usd",
        unit_amount: Math.round(Number(v.price) * 100),
        tax_behavior: "exclusive",
        product_data: {
          name: v.product.name,
          description: [v.color, v.size].filter(Boolean).join(" / ") || undefined,
          images: img && !img.includes("localhost") ? [img] : undefined,
          metadata: { variant_id: v.id, product_slug: v.product.slug },
        },
      },
    };
  });

  const origin = process.env.NEXT_PUBLIC_SITE_URL || new URL(req.url).origin;
  try {
    const session = await stripe().checkout.sessions.create({
      mode: "payment",
      line_items,
      customer_email: userEmail,
      client_reference_id: order.id,
      metadata: { order_id: order.id, order_number: String(order.number) },
      payment_intent_data: { metadata: { order_id: order.id, order_number: String(order.number) } },
      // TODO(owner): the old policy also mentions Canada; add "CA" with its own rate once confirmed.
      shipping_address_collection: { allowed_countries: ["US"] },
      shipping_options: [
        {
          shipping_rate_data: {
            type: "fixed_amount",
            display_name: shippingCents === 0 ? "Free shipping" : "Standard shipping (UPS / USPS)",
            fixed_amount: { amount: shippingCents, currency: "usd" },
            tax_behavior: "exclusive",
          },
        },
      ],
      automatic_tax: { enabled: process.env.STRIPE_AUTOMATIC_TAX === "true" },
      phone_number_collection: { enabled: true },
      success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/shop`,
      expires_at: Math.floor(Date.now() / 1000) + 60 * 60,
    });
    await db.from("orders").update({ stripe_session_id: session.id }).eq("id", order.id);
    return NextResponse.json({ url: session.url });
  } catch (e) {
    console.error("Stripe session failed", e);
    await db.from("orders").update({ status: "cancelled", notes: "Stripe session could not be created" }).eq("id", order.id);
    return NextResponse.json({ error: "Payment is unavailable right now. Please try again shortly." }, { status: 502 });
  }
}
