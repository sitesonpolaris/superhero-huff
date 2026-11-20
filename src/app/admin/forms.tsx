"use client";

import { useActionState } from "react";
import { type ActionResult, saveCollection, saveSettings, toggleHandled } from "./actions";

function Status({ state }: { state: ActionResult | null }) {
  if (!state) return null;
  return (
    <p role="status" className={`text-sm font-bold ${state.ok ? "text-purple" : "text-red"}`}>
      {state.message}
    </p>
  );
}

type Coll = { slug: string; name: string; tagline: string | null; issue: number; cover: string | null; active: boolean };

export function CollectionForm({ c }: { c?: Coll }) {
  const [state, action, pending] = useActionState<ActionResult | null, FormData>(saveCollection, null);
  return (
    <form action={action} className="grid gap-3 border-2 border-ink bg-white p-4 md:grid-cols-[80px_1fr_1fr] md:items-end">
      <input type="hidden" name="original" value={c?.slug ?? ""} />
      <label className="block text-sm font-bold">
        Issue #
        <input name="issue" type="number" min="0" defaultValue={c?.issue ?? ""} className="field mt-1" />
      </label>
      <label className="block text-sm font-bold">
        Name
        <input name="name" required defaultValue={c?.name ?? ""} className="field mt-1" />
      </label>
      <label className="block text-sm font-bold">
        Slug
        <input name="slug" defaultValue={c?.slug ?? ""} placeholder="auto from name" className="field mt-1" />
      </label>
      <label className="block text-sm font-bold md:col-span-2">
        Tagline
        <input name="tagline" defaultValue={c?.tagline ?? ""} className="field mt-1" />
      </label>
      <label className="block text-sm font-bold">
        Cover image URL
        <input name="cover" defaultValue={c?.cover ?? ""} placeholder="/products/… or https://…" className="field mt-1" />
      </label>
      <div className="flex flex-wrap items-center gap-4 md:col-span-3">
        <label className="flex items-center gap-2 text-sm font-bold">
          <input type="checkbox" name="active" defaultChecked={c?.active ?? true} className="size-5 accent-purple" /> Visible
        </label>
        <button disabled={pending} className="btn btn-ink min-h-10 shadow-none">
          {pending ? "Saving…" : c ? "Save" : "Add collection"}
        </button>
        <Status state={state} />
      </div>
    </form>
  );
}

type Settings = { flat_shipping_cents: number; free_shipping_threshold_cents: number | null; announcement: string | null; store_email: string | null };

export function SettingsForm({ s }: { s: Settings }) {
  const [state, action, pending] = useActionState<ActionResult | null, FormData>(saveSettings, null);
  return (
    <form action={action} className="max-w-2xl space-y-5 border-2 border-ink bg-white p-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block text-sm font-bold">
          Flat shipping rate ($)
          <input name="flat_shipping" type="number" min="0" step="0.01" required defaultValue={(s.flat_shipping_cents / 100).toFixed(2)} className="field mt-1" />
        </label>
        <label className="block text-sm font-bold">
          Free shipping over ($, blank = never)
          <input
            name="free_threshold"
            type="number"
            min="0"
            step="0.01"
            defaultValue={s.free_shipping_threshold_cents == null ? "" : (s.free_shipping_threshold_cents / 100).toFixed(2)}
            className="field mt-1"
          />
        </label>
      </div>
      <label className="block text-sm font-bold">
        Announcement bar (blank = default)
        <input name="announcement" maxLength={140} defaultValue={s.announcement ?? ""} className="field mt-1" />
      </label>
      <label className="block text-sm font-bold">
        Store email
        <input name="store_email" type="email" defaultValue={s.store_email ?? ""} className="field mt-1" />
      </label>
      <div className="flex items-center gap-4">
        <button disabled={pending} className="btn btn-ink">
          {pending ? "Saving…" : "Save settings"}
        </button>
        <Status state={state} />
      </div>
    </form>
  );
}

export function HandledToggle({ id, handled }: { id: string; handled: boolean }) {
  return (
    <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
      <input type="checkbox" defaultChecked={handled} onChange={(e) => toggleHandled(id, e.target.checked)} className="size-4 accent-purple" /> Handled
    </label>
  );
}
