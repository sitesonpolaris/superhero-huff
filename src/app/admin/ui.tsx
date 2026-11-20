export function AdminTitle({ children, actions }: { children: React.ReactNode; actions?: React.ReactNode }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <h1 className="display text-5xl">{children}</h1>
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
