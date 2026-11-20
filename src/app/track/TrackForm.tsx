"use client";

import { useActionState } from "react";
import { OrderProgress, trackingUrl } from "@/components/orders/OrderStatus";
import { cents, orderLabel } from "@/lib/format";
import { trackOrder, type TrackState } from "./actions";

export function TrackForm() {
  const [state, action, pending] = useActionState<TrackState, FormData>(trackOrder, null);
  const o = state?.order;
  const link = o ? trackingUrl(o.carrier, o.trackingNumber) : null;
  return (
    <div className="grid gap-12 md:grid-cols-[1fr_1.2fr]">
      <form action={action} className="space-y-5">
        <div>
          <label htmlFor="t-num" className="eyebrow">
            Order number
          </label>
          <input id="t-num" name="number" required placeholder="SH-1001" className="field mt-2" autoComplete="off" />
        </div>
        <div>
          <label htmlFor="t-email" className="eyebrow">
            Email used at checkout
          </label>
          <input id="t-email" name="email" type="email" required className="field mt-2" autoComplete="email" />
        </div>
        {state?.error && (
          <p role="alert" className="border-2 border-red bg-red/10 px-3 py-2 text-sm font-bold text-red">
            {state.error}
          </p>
        )}
        <button type="submit" disabled={pending} className="btn btn-ink">
          {pending ? "Searching…" : "Track order"}
        </button>
      </form>
      <div aria-live="polite">
        {o && (
          <div className="border-2 border-ink bg-white p-6 shadow-panel">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <p className="display text-4xl">{orderLabel(o.number)}</p>
              <p className="text-sm font-semibold text-slate">
                {new Date(o.createdAt).toLocaleDateString("en-US", { dateStyle: "medium" })} · {cents(o.totalCents)}
              </p>
            </div>
            <div className="mt-6">
              <OrderProgress status={o.status} />
            </div>
            {o.trackingNumber && (
              <p className="mt-6 text-sm">
                {o.carrier ?? "Tracking"}:{" "}
                {link ? (
                  <a href={link} target="_blank" rel="noopener noreferrer" className="font-bold underline">
                    {o.trackingNumber}
                  </a>
                ) : (
                  <strong>{o.trackingNumber}</strong>
                )}
              </p>
            )}
            <ul className="mt-6 divide-y divide-ink/15 border-t-2 border-ink">
              {o.items.map((it, i) => (
                <li key={i} className="flex justify-between py-2 text-sm">
                  <span>
                    {it.name}
                    <span className="text-slate"> {[it.color, it.size].filter(Boolean).join(" / ")}</span>
                  </span>
                  <span className="font-bold">×{it.quantity}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
