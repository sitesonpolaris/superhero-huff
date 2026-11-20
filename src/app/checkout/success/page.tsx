import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ClearCart } from "@/components/cart/ClearCart";
import { cents, orderLabel } from "@/lib/format";
import { hasStripe, stripe } from "@/lib/stripe";

export const metadata: Metadata = { title: "Order confirmed", robots: { index: false } };

export default function SuccessPage({ searchParams }: PageProps<"/checkout/success">) {
  return (
    <section className="halftone flex min-h-[70svh] items-center py-20">
      <div className="mx-auto w-full max-w-2xl px-4 text-center sm:px-6">
        <ClearCart />
        <p className="eyebrow text-yellow">Mission complete</p>
        <h1 className="display mt-3 text-6xl sm:text-8xl">Thank you!</h1>
        <Suspense fallback={<p className="mt-6 text-mist">Loading your order…</p>}>
          <OrderSummary searchParams={searchParams} />
        </Suspense>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <Link href="/track" className="btn btn-yellow">
            Track your order
          </Link>
          <Link href="/shop" className="btn btn-ghost">
            Keep shopping
          </Link>
        </div>
      </div>
    </section>
  );
}

async function OrderSummary({ searchParams }: { searchParams: PageProps<"/checkout/success">["searchParams"] }) {
  const sp = await searchParams;
  const id = typeof sp.session_id === "string" ? sp.session_id : null;
  if (!id || !hasStripe()) return <p className="mt-6 text-lg text-white/85">Your order is in. A receipt is on its way to your inbox.</p>;
  const s = await stripe()
    .checkout.sessions.retrieve(id)
    .catch(() => null);
  if (!s) return <p className="mt-6 text-lg text-white/85">Your order is in. A receipt is on its way to your inbox.</p>;
  return (
    <div className="mt-6 space-y-2 text-lg text-white/85">
      {s.metadata?.order_number && (
        <p>
          Order <strong className="text-yellow">{orderLabel(s.metadata.order_number)}</strong>
          {s.amount_total != null && <> · {cents(s.amount_total)}</>}
        </p>
      )}
      <p>A receipt is on its way to {s.customer_details?.email ?? "your inbox"}. Please allow 48 hours for processing.</p>
    </div>
  );
}
