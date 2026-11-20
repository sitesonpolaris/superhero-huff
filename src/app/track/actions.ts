"use server";

import { serviceClient } from "@/lib/supabase/admin";

export type TrackedOrder = {
  number: number;
  status: string;
  createdAt: string;
  totalCents: number;
  carrier: string | null;
  trackingNumber: string | null;
  items: { name: string; size: string | null; color: string | null; quantity: number }[];
};
export type TrackState = { error?: string; order?: TrackedOrder } | null;

export async function trackOrder(_: TrackState, form: FormData): Promise<TrackState> {
  const raw = String(form.get("number") ?? "").trim().toUpperCase().replace(/^SH-?/, "").replace(/^#/, "");
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  const number = Number(raw);
  if (!Number.isInteger(number) || number <= 0 || !email) return { error: "Enter your order number (like SH-1001) and the email you used at checkout." };
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return { error: "Order tracking is not available yet." };

  const { data } = await serviceClient()
    .from("orders")
    .select("number, status, created_at, total_cents, carrier, tracking_number, email, order_items(name, size, color, quantity)")
    .eq("number", number)
    .neq("status", "pending")
    .maybeSingle();
  // Same message for "not found" and "wrong email" so order numbers can't be probed.
  if (!data || data.email.toLowerCase() !== email) return { error: "We couldn't find an order with that number and email." };
  return {
    order: {
      number: data.number,
      status: data.status,
      createdAt: data.created_at,
      totalCents: data.total_cents,
      carrier: data.carrier,
      trackingNumber: data.tracking_number,
      items: data.order_items ?? [],
    },
  };
}
