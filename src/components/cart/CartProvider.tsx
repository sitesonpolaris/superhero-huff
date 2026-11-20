"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { CartLine } from "@/lib/types";

const KEY = "shh-cart-v1";
const MAX_QTY = 10;

type CartCtx = {
  lines: CartLine[];
  count: number;
  subtotal: number;
  open: boolean;
  setOpen: (o: boolean) => void;
  add: (line: Omit<CartLine, "quantity">, qty?: number) => void;
  setQty: (variantId: string, qty: number) => void;
  remove: (variantId: string) => void;
  clear: () => void;
};

const Ctx = createContext<CartCtx | null>(null);

function read(): CartLine[] {
  try {
    const raw = localStorage.getItem(KEY);
    const parsed = raw ? (JSON.parse(raw) as CartLine[]) : [];
    return Array.isArray(parsed) ? parsed.filter((l) => l && l.variantId && l.quantity > 0) : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [ready, setReady] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // Hydrate from storage after mount so server and client markup match.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLines(read());
    setReady(true);
    const onStorage = (e: StorageEvent) => e.key === KEY && setLines(read());
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(lines));
    } catch {
      /* storage unavailable: cart lives for this tab only */
    }
  }, [lines, ready]);

  const add = useCallback((line: Omit<CartLine, "quantity">, qty = 1) => {
    setLines((prev) => {
      const hit = prev.find((l) => l.variantId === line.variantId);
      if (hit) return prev.map((l) => (l === hit ? { ...l, quantity: Math.min(MAX_QTY, l.quantity + qty) } : l));
      return [...prev, { ...line, quantity: Math.min(MAX_QTY, qty) }];
    });
    setOpen(true);
  }, []);
  const setQty = useCallback((variantId: string, qty: number) => {
    setLines((prev) =>
      qty <= 0 ? prev.filter((l) => l.variantId !== variantId) : prev.map((l) => (l.variantId === variantId ? { ...l, quantity: Math.min(MAX_QTY, qty) } : l)),
    );
  }, []);
  const remove = useCallback((variantId: string) => setLines((prev) => prev.filter((l) => l.variantId !== variantId)), []);
  const clear = useCallback(() => setLines([]), []);

  const value = useMemo<CartCtx>(
    () => ({
      lines,
      count: lines.reduce((n, l) => n + l.quantity, 0),
      subtotal: lines.reduce((n, l) => n + l.quantity * l.price, 0),
      open,
      setOpen,
      add,
      setQty,
      remove,
      clear,
    }),
    [lines, open, add, setQty, remove, clear],
  );
  return <Ctx value={value}>{children}</Ctx>;
}

export function useCart() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useCart must be used inside CartProvider");
  return c;
}
