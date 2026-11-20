import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin";
import { cents, orderLabel } from "@/lib/format";
import { AdminTitle, StatusPill } from "../../ui";
import { OrderForm } from "./OrderForm";

type Address = { line1?: string; line2?: string | null; city?: string; state?: string; postal_code?: string; country?: string } | null;

export default async function OrderDetail({ params }: PageProps<"/admin/orders/[id]">) {
  const { id } = await params;
  const { supabase } = await requireAdmin();
  const { data: o } = await supabase
    .from("orders")
    .select("*, order_items(id, name, size, color, image, unit_price_cents, quantity, product_id)")
    .eq("id", id)
    .maybeSingle();
  if (!o) notFound();
  const a = o.shipping_address as Address;

  return (
    <>
      <Link href="/admin/orders" className="text-sm font-bold underline">
        ← All orders
      </Link>
      <AdminTitle actions={<StatusPill status={o.status} />}>{orderLabel(o.number)}</AdminTitle>
      <div className="grid gap-8 xl:grid-cols-[1.5fr_1fr]">
        <div className="space-y-8">
          <section className="border-2 border-ink bg-white">
            <h2 className="eyebrow border-b-2 border-ink px-4 py-3">Items</h2>
            <ul className="divide-y divide-ink/10">
              {o.order_items.map((it: { id: string; name: string; size: string | null; color: string | null; image: string | null; unit_price_cents: number; quantity: number; product_id: string | null }) => (
                <li key={it.id} className="flex items-center gap-4 px-4 py-3">
                  <div className="relative size-16 shrink-0 border border-ink/20 bg-white">{it.image && <Image src={it.image} alt="" fill sizes="64px" className="object-contain p-1" />}</div>
                  <div className="min-w-0 flex-1">
                    {it.product_id ? (
                      <Link href={`/admin/products/${it.product_id}`} className="font-bold underline">
                        {it.name}
                      </Link>
                    ) : (
                      <p className="font-bold">{it.name}</p>
                    )}
                    <p className="text-sm text-slate">{[it.color, it.size].filter(Boolean).join(" / ") || "One size"}</p>
                  </div>
                  <p className="text-sm tabular-nums">
                    {it.quantity} × {cents(it.unit_price_cents)}
                  </p>
                </li>
              ))}
            </ul>
            <dl className="space-y-1 border-t-2 border-ink px-4 py-3 text-sm">
              <div className="flex justify-between">
                <dt>Subtotal</dt>
                <dd className="tabular-nums">{cents(o.subtotal_cents)}</dd>
              </div>
              <div className="flex justify-between">
                <dt>Shipping</dt>
                <dd className="tabular-nums">{cents(o.shipping_cents)}</dd>
              </div>
              <div className="flex justify-between">
                <dt>Tax</dt>
                <dd className="tabular-nums">{cents(o.tax_cents)}</dd>
              </div>
              <div className="flex justify-between text-base font-extrabold">
                <dt>Total</dt>
                <dd className="tabular-nums">{cents(o.total_cents)}</dd>
              </div>
            </dl>
          </section>
          <OrderForm order={{ id: o.id, status: o.status, carrier: o.carrier, tracking_number: o.tracking_number, notes: o.notes }} />
        </div>
        <aside className="space-y-6">
          <section className="border-2 border-ink bg-white p-4">
            <h2 className="eyebrow">Customer</h2>
            <p className="mt-2 font-bold">{o.shipping_name ?? "—"}</p>
            <a href={`mailto:${o.email}`} className="break-all text-sm underline">
              {o.email}
            </a>
          </section>
          <section className="border-2 border-ink bg-white p-4">
            <h2 className="eyebrow">Ship to</h2>
            {a ? (
              <address className="mt-2 text-sm not-italic leading-relaxed">
                {o.shipping_name}
                <br />
                {a.line1}
                {a.line2 && (
                  <>
                    <br />
                    {a.line2}
                  </>
                )}
                <br />
                {a.city}, {a.state} {a.postal_code}
                <br />
                {a.country}
              </address>
            ) : (
              <p className="mt-2 text-sm text-slate">No address yet.</p>
            )}
          </section>
          <section className="border-2 border-ink bg-white p-4 text-sm">
            <h2 className="eyebrow">Payment</h2>
            <p className="mt-2">Placed {new Date(o.created_at).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })}</p>
            {o.paid_at && <p>Paid {new Date(o.paid_at).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })}</p>}
            {o.stripe_payment_intent && (
              <a href={`https://dashboard.stripe.com/payments/${o.stripe_payment_intent}`} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block font-bold underline">
                View in Stripe ↗
              </a>
            )}
          </section>
        </aside>
      </div>
    </>
  );
}
