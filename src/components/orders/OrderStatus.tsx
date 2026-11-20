const STEPS = ["paid", "fulfilled", "shipped", "delivered"] as const;
const LABEL: Record<string, string> = {
  pending: "Awaiting payment",
  paid: "Order received",
  fulfilled: "Packed",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
  refunded: "Refunded",
};

export const statusLabel = (s: string) => LABEL[s] ?? s;

export function trackingUrl(carrier: string | null, num: string | null) {
  if (!num) return null;
  const c = (carrier ?? "").toLowerCase();
  if (c.includes("ups")) return `https://www.ups.com/track?tracknum=${encodeURIComponent(num)}`;
  if (c.includes("usps")) return `https://tools.usps.com/go/TrackConfirmAction?tLabels=${encodeURIComponent(num)}`;
  if (c.includes("fedex")) return `https://www.fedex.com/fedextrack/?trknbr=${encodeURIComponent(num)}`;
  return null;
}

export function OrderProgress({ status }: { status: string }) {
  if (status === "cancelled" || status === "refunded") return <p className="font-bold text-red">{statusLabel(status)}</p>;
  const at = STEPS.indexOf(status as (typeof STEPS)[number]);
  return (
    <ol className="grid grid-cols-4 gap-1" aria-label={`Order status: ${statusLabel(status)}`}>
      {STEPS.map((s, i) => (
        <li key={s} aria-current={i === at ? "step" : undefined}>
          <div className={`h-2 border border-ink ${i <= at ? "bg-purple" : "bg-white"}`} />
          <p className={`mt-2 text-xs font-bold uppercase tracking-wider ${i <= at ? "text-ink" : "text-ink/45"}`}>{statusLabel(s)}</p>
        </li>
      ))}
    </ol>
  );
}
