import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { cents, orderLabel } from "@/lib/format";
import { AdminTitle, StatusPill } from "./ui";

export default async function AdminHome() {
  const { supabase } = await requireAdmin();
  const since = thirtyDaysAgo();
  const [recent, toShip, lowStock, inbox] = await Promise.all([
    supabase.from("orders").select("id, number, email, status, total_cents, created_at").neq("status", "pending").gte("created_at", since).order("created_at", { ascending: false }),
    supabase.from("orders").select("id", { count: "exact", head: true }).in("status", ["paid", "fulfilled"]),
    supabase.from("variants").select("id, size, color, stock, product:products!inner(id, name)").eq("active", true).not("stock", "is", null).lte("stock", 3).order("stock").limit(12),
    supabase.from("contact_messages").select("id", { count: "exact", head: true }).eq("handled", false),
  ]);
  const paid = (recent.data ?? []).filter((o) => !["cancelled", "refunded"].includes(o.status));
  const revenue = paid.reduce((n, o) => n + o.total_cents, 0);

  const stats = [
    { label: "Revenue, last 30 days", value: cents(revenue) },
    { label: "Orders, last 30 days", value: String(paid.length) },
    { label: "Waiting to ship", value: String(toShip.count ?? 0), href: "/admin/orders?status=paid" },
    { label: "Unread messages", value: String(inbox.count ?? 0), href: "/admin/inbox" },
  ];

  return (
    <>
      <AdminTitle>Dashboard</AdminTitle>
      <dl className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {stats.map((s) => {
          const body = (
            <>
              <dt className="eyebrow text-slate">{s.label}</dt>
              <dd className="display mt-2 text-4xl tabular-nums">{s.value}</dd>
            </>
          );
          return s.href ? (
            <Link key={s.label} href={s.href} className="border-2 border-ink bg-white p-5 shadow-panel hover:bg-yellow">
              {body}
            </Link>
          ) : (
            <div key={s.label} className="border-2 border-ink bg-white p-5 shadow-panel">
              {body}
            </div>
          );
        })}
      </dl>

      <div className="mt-10 grid gap-8 xl:grid-cols-[1.6fr_1fr]">
        <section>
          <h2 className="eyebrow mb-3">Recent orders</h2>
          <div className="overflow-x-auto border-2 border-ink bg-white">
            <table className="w-full text-left text-sm">
              <thead className="bg-ink text-white">
                <tr>
                  <th className="px-3 py-2">Order</th>
                  <th className="px-3 py-2">Customer</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/10">
                {(recent.data ?? []).slice(0, 10).map((o) => (
                  <tr key={o.id} className="hover:bg-paper">
                    <td className="px-3 py-2 font-bold">
                      <Link href={`/admin/orders/${o.id}`} className="underline">
                        {orderLabel(o.number)}
                      </Link>
                    </td>
                    <td className="max-w-48 truncate px-3 py-2">{o.email}</td>
                    <td className="px-3 py-2">
                      <StatusPill status={o.status} />
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums">{cents(o.total_cents)}</td>
                  </tr>
                ))}
                {!recent.data?.length && (
                  <tr>
                    <td colSpan={4} className="px-3 py-8 text-center text-slate">
                      No orders in the last 30 days.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
        <section>
          <h2 className="eyebrow mb-3">Low stock (3 or fewer)</h2>
          <ul className="divide-y divide-ink/10 border-2 border-ink bg-white">
            {(lowStock.data ?? []).map((v) => {
              const p = v.product as unknown as { id: string; name: string };
              return (
                <li key={v.id} className="flex items-center justify-between gap-3 px-3 py-2 text-sm">
                  <Link href={`/admin/products/${p.id}`} className="truncate underline">
                    {p.name} <span className="text-slate">{[v.color, v.size].filter(Boolean).join(" / ")}</span>
                  </Link>
                  <span className={`font-bold tabular-nums ${v.stock === 0 ? "text-red" : ""}`}>{v.stock}</span>
                </li>
              );
            })}
            {!lowStock.data?.length && <li className="px-3 py-6 text-center text-sm text-slate">Nothing running low. Stock is only tracked where a number is set.</li>}
          </ul>
        </section>
      </div>
    </>
  );
}

function thirtyDaysAgo() {
  return new Date(Date.now() - 30 * 864e5).toISOString();
}
