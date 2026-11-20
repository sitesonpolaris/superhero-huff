"use client";

import { useActionState } from "react";
import { subscribe, type FormState } from "@/app/actions";

export function NewsletterForm() {
  const [state, action, pending] = useActionState<FormState, FormData>(subscribe, null);
  return (
    <form action={action} className="mt-4">
      <div className="flex">
        <label htmlFor="nl-email" className="sr-only">
          Email address
        </label>
        <input id="nl-email" name="email" type="email" autoComplete="email" required placeholder="you@email.com" className="field min-w-0 flex-1 border-r-0" />
        <label className="hidden" aria-hidden="true">
          Leave this empty <input name="company" tabIndex={-1} autoComplete="off" />
        </label>
        <button type="submit" disabled={pending} className="btn btn-yellow shrink-0 shadow-none">
          {pending ? "…" : "Sign up"}
        </button>
      </div>
      <p role="status" className={`mt-2 min-h-5 text-sm ${state?.ok ? "text-yellow" : "text-red-300"}`}>
        {state?.message}
      </p>
    </form>
  );
}
