"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { cents, money } from "@/lib/format";
import { useCart } from "./CartProvider";

type Props = { flatShippingCents: number; freeShippingThresholdCents: number | null };

export function CartDrawer({ flatShippingCents, freeShippingThresholdCents }: Props) {
  const { lines, open, setOpen, setQty, remove, subtotal, count } = useCart();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const panel = useRef<HTMLDivElement>(null);
  const closeBtn = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const prev = document.activeElement as HTMLElement | null;
    closeBtn.current?.focus();
    document.documentElement.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
      if (e.key === "Tab" && panel.current) {
        const f = panel.current.querySelectorAll<HTMLElement>("a[href], button:not([disabled]), input");
        if (!f.length) return;
        const first = f[0];
        const last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.documentElement.style.overflow = "";
      prev?.focus?.();
    };
  }, [open, setOpen]);

  const subtotalCents = Math.round(subtotal * 100);
  const free = freeShippingThresholdCents != null && subtotalCents >= freeShippingThresholdCents;
  const toFree = freeShippingThresholdCents != null ? Math.max(0, freeShippingThresholdCents - subtotalCents) : null;

  async function checkout() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ items: lines.map((l) => ({ variantId: l.variantId, quantity: l.quantity })) }),
      });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) throw new Error(data.error || "Checkout is unavailable right now.");
      window.location.href = data.url;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Checkout is unavailable right now.");
      setBusy(false);
    }
  }

  return (
    <div className={`fixed inset-0 z-[60] ${open ? "" : "pointer-events-none"}`} aria-hidden={!open}>
      <button
        type="button"
        tabIndex={-1}
        aria-label="Close cart"
        onClick={() => setOpen(false)}
        className={`absolute inset-0 bg-ink/70 transition-opacity duration-300 ${open ? "opacity-100" : "opacity-0"}`}
      />
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-title"
        inert={!open}
        className={`on-paper absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-paper text-ink shadow-2xl transition-transform duration-300 ease-[var(--ease-snap)] ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b-2 border-ink bg-yellow px-5 py-4">
          <h2 id="cart-title" className="display text-3xl">
            Your bag {count > 0 && <span className="align-middle text-lg">({count})</span>}
          </h2>
          <button ref={closeBtn} type="button" onClick={() => setOpen(false)} className="grid size-11 place-items-center border-2 border-ink bg-paper font-bold" aria-label="Close cart">
            <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
              <path d="M2 2l12 12M14 2L2 14" stroke="currentColor" strokeWidth="2.5" />
            </svg>
          </button>
        </div>

        {lines.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-5 px-8 text-center">
            <p className="display text-4xl">Nothing here yet</p>
            <p className="text-slate">Every hero needs a uniform. Start with a collection.</p>
            <Link href="/shop" onClick={() => setOpen(false)} className="btn btn-ink">
              Shop clothing
            </Link>
          </div>
        ) : (
          <>
            {toFree !== null && (
              <p className="border-b border-ink/15 px-5 py-3 text-sm font-semibold">
                {free ? "You've unlocked free shipping." : `You're ${cents(toFree)} away from free shipping.`}
              </p>
            )}
            <ul className="flex-1 divide-y divide-ink/15 overflow-y-auto px-5">
              {lines.map((l) => (
                <li key={l.variantId} className="flex gap-4 py-4">
                  <div className="relative size-24 shrink-0 border-2 border-ink bg-white">
                    {l.image && <Image src={l.image} alt="" fill sizes="96px" className="object-contain p-1" />}
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <Link href={`/product/${l.productSlug}`} onClick={() => setOpen(false)} className="font-bold leading-snug hover:underline">
                      {l.name}
                    </Link>
                    <p className="text-sm text-slate">{[l.color, l.size].filter(Boolean).join(" / ")}</p>
                    <div className="mt-auto flex items-center justify-between pt-2">
                      <div className="flex items-center border-2 border-ink">
                        <button type="button" className="grid size-9 place-items-center font-bold" onClick={() => setQty(l.variantId, l.quantity - 1)} aria-label={`Decrease quantity of ${l.name}`}>
                          −
                        </button>
                        <span className="w-8 text-center font-bold tabular-nums" aria-live="polite">
                          {l.quantity}
                        </span>
                        <button type="button" className="grid size-9 place-items-center font-bold" onClick={() => setQty(l.variantId, l.quantity + 1)} aria-label={`Increase quantity of ${l.name}`}>
                          +
                        </button>
                      </div>
                      <div className="text-right">
                        <p className="font-bold tabular-nums">{money(l.price * l.quantity)}</p>
                        <button type="button" onClick={() => remove(l.variantId)} className="text-xs font-semibold uppercase tracking-wider text-slate underline underline-offset-2">
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            <div className="border-t-2 border-ink px-5 pb-6 pt-4">
              <dl className="space-y-1 text-sm">
                <div className="flex justify-between text-base font-bold">
                  <dt>Subtotal</dt>
                  <dd className="tabular-nums">{money(subtotal)}</dd>
                </div>
                <div className="flex justify-between text-slate">
                  <dt>Shipping</dt>
                  <dd>{free ? "Free" : cents(flatShippingCents)}</dd>
                </div>
                <div className="flex justify-between text-slate">
                  <dt>Tax</dt>
                  <dd>Calculated at checkout</dd>
                </div>
              </dl>
              {error && (
                <p role="alert" className="mt-3 border-2 border-red bg-red/10 px-3 py-2 text-sm font-semibold text-red">
                  {error}
                </p>
              )}
              <button type="button" onClick={checkout} disabled={busy} className="btn btn-ink mt-4 w-full">
                {busy ? "Opening secure checkout…" : "Checkout"}
              </button>
              <p className="mt-3 text-center text-xs text-slate">Secure payment by Stripe.</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
