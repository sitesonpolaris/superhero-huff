"use server";

import { serviceClient } from "@/lib/supabase/admin";

export type FormState = { ok: boolean; message: string } | null;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const clean = (v: FormDataEntryValue | null, max = 2000) => String(v ?? "").trim().slice(0, max);

function configured() {
  return Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY && process.env.NEXT_PUBLIC_SUPABASE_URL);
}

export async function subscribe(_: FormState, form: FormData): Promise<FormState> {
  if (clean(form.get("company"))) return { ok: true, message: "You're on the list." }; // honeypot
  const email = clean(form.get("email"), 254).toLowerCase();
  if (!EMAIL.test(email)) return { ok: false, message: "Enter a valid email address." };
  if (!configured()) return { ok: false, message: "Sign-ups open soon. Please try again later." };
  const { error } = await serviceClient().from("subscribers").upsert({ email }, { onConflict: "email", ignoreDuplicates: true });
  if (error) return { ok: false, message: "Something went wrong. Please try again." };
  return { ok: true, message: "You're on the list. Welcome to the team." };
}

export async function sendContact(_: FormState, form: FormData): Promise<FormState> {
  if (clean(form.get("company"))) return { ok: true, message: "Thanks! We'll get back to you soon." };
  const name = clean(form.get("name"), 120);
  const email = clean(form.get("email"), 254).toLowerCase();
  const message = clean(form.get("message"), 4000);
  if (!name) return { ok: false, message: "Please tell us your name." };
  if (!EMAIL.test(email)) return { ok: false, message: "Enter a valid email address." };
  if (message.length < 5) return { ok: false, message: "Please write a short message." };
  if (!configured()) return { ok: false, message: "The contact form isn't connected yet. Please email us instead." };
  const db = serviceClient();
  const { error } = await db.from("contact_messages").insert({ name, email, message });
  if (error) return { ok: false, message: "Something went wrong. Please email us instead." };
  if (form.get("subscribe") === "on") await db.from("subscribers").upsert({ email }, { onConflict: "email", ignoreDuplicates: true });
  return { ok: true, message: "Thanks! Agent Huff's team will get back to you soon." };
}
