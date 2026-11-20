import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { CATALOG_TAG } from "@/lib/catalog";
import { stripe } from "@/lib/stripe";
import { serviceClient } from "@/lib/supabase/admin";

export async function POST(req: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const sig = req.headers.get("stripe-signature");
  if (!secret || !sig) return NextResponse.json({ error: "Not configured" }, { status: 400 });

  let event: Stripe.Event;
  try {
    event = await stripe().webhooks.constructEventAsync(await req.text(), sig, secret);
  } catch (e) {
    console.error("Webhook signature failed", e);
    return NextResponse.json({ error: "Bad signature" }, { status: 400 });
  }

  const db = serviceClient();

  if (event.type === "checkout.session.completed" || event.type === "checkout.session.async_payment_succeeded") {
    const s = event.data.object;
    const orderId = s.metadata?.order_id ?? s.client_reference_id;
    if (!orderId) return NextResponse.json({ received: true });
    if (s.payment_status !== "paid") return NextResponse.json({ received: true }); // async methods settle later

    // Idempotent: only the first delivery moves pending -> paid and decrements stock.
    const ship = s.collected_information?.shipping_details ?? null;
    const { data: updated } = await db
      .from("orders")
      .update({
        status: "paid",
        paid_at: new Date().toISOString(),
        email: s.customer_details?.email ?? undefined,
        subtotal_cents: s.amount_subtotal ?? undefined,
        shipping_cents: s.total_details?.amount_shipping ?? undefined,
        tax_cents: s.total_details?.amount_tax ?? 0,
        total_cents: s.amount_total ?? undefined,
        stripe_payment_intent: typeof s.payment_intent === "string" ? s.payment_intent : (s.payment_intent?.id ?? null),
        shipping_name: ship?.name ?? s.customer_details?.name ?? null,
        shipping_address: ship?.address ?? s.customer_details?.address ?? null,
        notes: s.customer_details?.phone ? `Phone: ${s.customer_details.phone}` : null,
      })
      .eq("id", orderId)
      .eq("status", "pending")
      .select("id");

    if (updated?.length) {
      const { data: items } = await db.from("order_items").select("variant_id, quantity").eq("order_id", orderId);
      for (const it of items ?? []) {
        if (it.variant_id) await db.rpc("decrement_stock", { p_variant: it.variant_id, p_qty: it.quantity });
      }
      revalidateTag(CATALOG_TAG, "max");
    }
  }

  if (event.type === "checkout.session.expired" || event.type === "checkout.session.async_payment_failed") {
    const s = event.data.object;
    const orderId = s.metadata?.order_id ?? s.client_reference_id;
    if (orderId) await db.from("orders").update({ status: "cancelled" }).eq("id", orderId).eq("status", "pending");
  }

  if (event.type === "charge.refunded") {
    const c = event.data.object;
    const pi = typeof c.payment_intent === "string" ? c.payment_intent : c.payment_intent?.id;
    if (pi && c.refunded) await db.from("orders").update({ status: "refunded" }).eq("stripe_payment_intent", pi);
  }

  return NextResponse.json({ received: true });
}
