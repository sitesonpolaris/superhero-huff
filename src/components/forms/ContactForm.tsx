"use client";

import { useActionState } from "react";
import { sendContact, type FormState } from "@/app/actions";

export function ContactForm() {
  const [state, action, pending] = useActionState<FormState, FormData>(sendContact, null);
  if (state?.ok)
    return (
      <div role="status" className="border-2 border-ink bg-yellow p-8 shadow-panel">
        <p className="display text-4xl">Message sent</p>
        <p className="mt-2 font-semibold">{state.message}</p>
      </div>
    );
  return (
    <form action={action} className="space-y-5" noValidate>
      <div>
        <label htmlFor="c-name" className="eyebrow">
          Name
        </label>
        <input id="c-name" name="name" required autoComplete="name" className="field mt-2" />
      </div>
      <div>
        <label htmlFor="c-email" className="eyebrow">
          Email
        </label>
        <input id="c-email" name="email" type="email" required autoComplete="email" className="field mt-2" />
      </div>
      <div>
        <label htmlFor="c-msg" className="eyebrow">
          Message
        </label>
        <textarea id="c-msg" name="message" required rows={6} className="field mt-2" />
      </div>
      <label className="hidden" aria-hidden="true">
          Leave this empty <input name="company" tabIndex={-1} autoComplete="off" />
        </label>
      <label className="flex items-center gap-3 text-sm font-semibold">
        <input type="checkbox" name="subscribe" className="size-5 accent-purple" /> Add me to the mailing list
      </label>
      {state && !state.ok && (
        <p role="alert" className="border-2 border-red bg-red/10 px-3 py-2 text-sm font-bold text-red">
          {state.message}
        </p>
      )}
      <button type="submit" disabled={pending} className="btn btn-ink">
        {pending ? "Sending…" : "Send message"}
      </button>
    </form>
  );
}
