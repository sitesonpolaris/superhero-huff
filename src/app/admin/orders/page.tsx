import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { cents, orderLabel } from "@/lib/format";
import { AdminTitle, OrderCards, StatusPill } from "../ui";

const FILTERS = ["all", "paid", "fulfilled", "shipped", "delivered", "cancelled", "refunded"];

export default async function OrdersPage({ searchParams }: PageProps<"/admin/orders">) {
  const { supabase } = await requireAdmin();
  const sp = await searchParams;
  const status = typeof sp.status === "string" && FILTERS.includes(sp.status) ? sp.status : "all";
  const q = typeof sp.q === "string" ? sp.q.trim() : "";
  let query = supabase
    .from("orders")
    .select("id, number, email, shipping_name, status, total_cents, created_at, order_items(quantity)")
    .neq("status", "pending")
    .order("created_at", { ascending: false })
    .limit(200);
  if (status !== "all") query = query.eq("status", status);
  if (q) query = /^\D*\d+$/.test(q) ? query.eq("number", Number(q.replace(/\D/g, ""))) : query.ilike("email", `%${q}%`);
  const { data: orders } = await query;

  return (
    <>
      <AdminTitle>Orders</AdminTitle>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <ul className="-mx-4 flex w-[calc(100%+2rem)] gap-2 overflow-x-auto px-4 [scrollbar-width:none] sm:mx-0 sm:w-auto sm:flex-wrap sm:overflow-visible sm:px-0">
          {FILTERS.map((f) => (
            <li key={f} className="shrink-0">
              <Link
                href={f === "all" ? "/admin/orders" : `/admin/orders?status=${f}`}
                className={`inline-block border-2 border-ink px-3 py-2.5 text-xs sm:py-1.5 font-bold uppercase tracking-wider ${status === f ? "bg-ink text-yellow" : "bg-white hover:bg-yellow"}`}
              >
                {f}
              </Link>
            </li>
          ))}
        </ul>
        <form className="flex w-full sm:w-auto">
          <label htmlFor="oq" className="sr-only">
            Search orders
          </label>
          <input id="oq" name="q" defaultValue={q} placeholder="Order # or email" className="field min-h-11 min-w-0 flex-1 py-1.5 text-base sm:min-h-10 sm:w-56 sm:flex-none sm:text-sm" />
          <button className="btn btn-ink min-h-11 px-4 shadow-none sm:min-h-10 sm:px-6">Search</button>
        </form>
      </div>
      <OrderCards
        orders={(orders ?? []).map((o) => ({ ...o, items: (o.order_items ?? []).reduce((n: number, i: { quantity: number }) => n + i.quantity, 0) }))}
        empty="No orders match."
      />
      <div className="hidden overflow-x-auto border-2 border-ink bg-white sm:block">
        <table className="w-full text-left text-sm">
          <thead className="bg-ink text-white">
            <tr>
              <th className="px-3 py-2">Order</th>
              <th className="px-3 py-2">Date</th>
              <th className="px-3 py-2">Customer</th>
              <th className="px-3 py-2">Items</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2 text-right">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink/10">
            {(orders ?? []).map((o) => (
              <tr key={o.id} className="hover:bg-paper">
                <td className="px-3 py-2 font-bold">
                  <Link href={`/admin/orders/${o.id}`} className="underline">
                    {orderLabel(o.number)}
                  </Link>
                </td>
                <td className="whitespace-nowrap px-3 py-2">{new Date(o.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</td>
                <td className="max-w-56 truncate px-3 py-2">
                  {o.shipping_name && <span className="font-semibold">{o.shipping_name} · </span>}
                  {o.email}
                </td>
                <td className="px-3 py-2 tabular-nums">{(o.order_items ?? []).reduce((n: number, i: { quantity: number }) => n + i.quantity, 0)}</td>
                <td className="px-3 py-2">
                  <StatusPill status={o.status} />
                </td>
                <td className="px-3 py-2 text-right tabular-nums">{cents(o.total_cents)}</td>
              </tr>
            ))}
            {!orders?.length && (
              <tr>
                <td colSpan={6} className="px-3 py-10 text-center text-slate">
                  No orders match.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
