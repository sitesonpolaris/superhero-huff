import Link from "next/link";
import { cents, orderLabel } from "@/lib/format";

export function AdminTitle({ children, actions }: { children: React.ReactNode; actions?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4 sm:mb-8">
      <h1 className="display text-4xl sm:text-5xl">{children}</h1>
      {actions}
    </div>
  );
}

const TONE: Record<string, string> = {
  pending: "bg-paper-2 text-slate",
  paid: "bg-yellow text-ink",
  fulfilled: "bg-purple-2 text-ink",
  shipped: "bg-purple text-white",
  delivered: "bg-ink text-white",
  cancelled: "bg-red/15 text-red",
  refunded: "bg-red/15 text-red",
};

export function StatusPill({ status }: { status: string }) {
  return <span className={`inline-block px-2 py-0.5 text-xs font-extrabold uppercase tracking-wider ${TONE[status] ?? "bg-paper-2"}`}>{status}</span>;
}

type OrderRow = {
  id: string;
  number: number;
  email: string;
  status: string;
  total_cents: number;
  created_at?: string;
  shipping_name?: string | null;
  items?: number;
};

/** Phone layout for order lists: one tappable card per order. Tables take over from `sm`. */
export function OrderCards({ orders, empty }: { orders: OrderRow[]; empty: string }) {
  return (
    <ul className="divide-y divide-ink/10 border-2 border-ink bg-white sm:hidden">
      {orders.map((o) => (
        <li key={o.id}>
          <Link href={`/admin/orders/${o.id}`} className="flex items-center gap-3 px-4 py-3 active:bg-paper">
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-2">
                <span className="font-bold">{orderLabel(o.number)}</span>
                <StatusPill status={o.status} />
              </p>
              <p className="mt-1 truncate text-sm">{o.shipping_name || o.email}</p>
              <p className="truncate text-xs text-slate">
                {[
                  o.created_at && new Date(o.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
                  o.items != null && `${o.items} item${o.items === 1 ? "" : "s"}`,
                  o.shipping_name && o.email,
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
            </div>
            <span className="font-bold tabular-nums">{cents(o.total_cents)}</span>
            <span aria-hidden="true" className="text-slate">
              ›
            </span>
          </Link>
        </li>
      ))}
      {!orders.length && <li className="px-4 py-8 text-center text-sm text-slate">{empty}</li>}
    </ul>
  );
}
