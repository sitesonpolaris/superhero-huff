"use client";

import { useActionState } from "react";
import { type ActionResult, updateOrder } from "../../actions";

type Props = { order: { id: string; status: string; carrier: string | null; tracking_number: string | null; notes: string | null } };

export function OrderForm({ order }: Props) {
  const [state, action, pending] = useActionState<ActionResult | null, FormData>(updateOrder, null);
  return (
    <form action={action} className="space-y-4 border-2 border-ink bg-white p-4">
      <h2 className="eyebrow">Fulfilment</h2>
      <input type="hidden" name="id" value={order.id} />
      <div className="grid gap-4 sm:grid-cols-3">
        <label className="block text-sm font-bold">
          Status
          <select name="status" defaultValue={order.status === "pending" ? "paid" : order.status} className="field mt-1">
            <option value="paid">Paid (to pack)</option>
            <option value="fulfilled">Packed</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
            <option value="refunded">Refunded</option>
          </select>
        </label>
        <label className="block text-sm font-bold">
          Carrier
          <select name="carrier" defaultValue={order.carrier ?? ""} className="field mt-1">
            <option value="">—</option>
            <option>UPS</option>
            <option>USPS</option>
            <option>FedEx</option>
          </select>
        </label>
        <label className="block text-sm font-bold">
          Tracking number
          <input name="tracking_number" defaultValue={order.tracking_number ?? ""} className="field mt-1" />
        </label>
      </div>
      <label className="block text-sm font-bold">
        Internal notes
        <textarea name="notes" rows={3} defaultValue={order.notes ?? ""} className="field mt-1" />
      </label>
      <p className="text-xs text-slate">Refunds are issued in Stripe; the status updates here automatically when a refund goes through.</p>
      <div className="flex items-center gap-4">
        <button disabled={pending} className="btn btn-ink">
          {pending ? "Saving…" : "Save"}
        </button>
        {state && (
          <p role="status" className={`text-sm font-bold ${state.ok ? "text-purple" : "text-red"}`}>
            {state.message}
          </p>
        )}
      </div>
    </form>
  );
}
