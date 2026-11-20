import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { OrderProgress, statusLabel } from "@/components/orders/OrderStatus";
import { cents, orderLabel } from "@/lib/format";
import { serviceClient } from "@/lib/supabase/admin";
import { hasSupabase } from "@/lib/supabase/env";
import { serverClient } from "@/lib/supabase/server";
import { SignOutButton } from "./SignOutButton";

export const metadata: Metadata = { title: "My Account", robots: { index: false } };

export default function AccountPage() {
  return (
    <section className="on-paper min-h-[60svh] bg-paper py-14 text-ink lg:py-20">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <p className="eyebrow text-purple">My account</p>
        <Suspense fallback={<p className="mt-6 text-slate">Loading your account…</p>}>
          <AccountBody />
        </Suspense>
      </div>
    </section>
  );
}

async function AccountBody() {
  if (!hasSupabase) redirect("/account/login");
  const supabase = await serverClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/account/login");

  // Attach earlier guest orders placed with this (confirmed) email.
  if (user.email && user.email_confirmed_at && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    await serviceClient().from("orders").update({ user_id: user.id }).is("user_id", null).ilike("email", user.email).neq("status", "pending");
  }

  const [{ data: orders }, { data: isAdmin }] = await Promise.all([
    supabase
      .from("orders")
      .select("id, number, status, created_at, total_cents, carrier, tracking_number, order_items(name, size, color, quantity)")
      .neq("status", "pending")
      .order("created_at", { ascending: false }),
    supabase.rpc("is_admin"),
  ]);

  return (
    <>
      <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="display text-6xl">Hey, hero</h1>
          <p className="mt-2 text-slate">{user.email}</p>
        </div>
        <div className="flex gap-3">
          {isAdmin && (
            <Link href="/admin" className="btn btn-yellow">
              Store admin
            </Link>
          )}
          <SignOutButton />
        </div>
      </div>

      <h2 className="display mt-12 text-4xl">Your orders</h2>
      {!orders?.length ? (
        <div className="mt-6 border-2 border-dashed border-ink/40 p-10 text-center">
          <p className="font-semibold">No orders yet.</p>
          <Link href="/shop" className="btn btn-ink mt-5">
            Start shopping
          </Link>
        </div>
      ) : (
        <ul className="mt-6 space-y-5">
          {orders.map((o) => (
            <li key={o.id} className="border-2 border-ink bg-white p-5 shadow-panel">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="display text-3xl">{orderLabel(o.number)}</p>
                <p className="text-sm font-semibold text-slate">
                  {new Date(o.created_at).toLocaleDateString("en-US", { dateStyle: "medium" })} · {cents(o.total_cents)} · {statusLabel(o.status)}
                </p>
              </div>
              <div className="mt-4">
                <OrderProgress status={o.status} />
              </div>
              {o.tracking_number && (
                <p className="mt-4 text-sm">
                  {o.carrier ?? "Tracking"}: <strong>{o.tracking_number}</strong>
                </p>
              )}
              <ul className="mt-4 text-sm text-slate">
                {o.order_items?.map((it, i) => (
                  <li key={i}>
                    {it.quantity} × {it.name} {[it.color, it.size].filter(Boolean).join(" / ")}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
