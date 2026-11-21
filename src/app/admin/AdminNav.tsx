"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

const LINKS = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/collections", label: "Collections" },
  { href: "/admin/inbox", label: "Inbox" },
  { href: "/admin/settings", label: "Settings" },
];

export function AdminNav() {
  const path = usePathname();
  const active = (href: string) => (href === "/admin" ? path === "/admin" : path.startsWith(href));
  const list = useRef<HTMLUListElement>(null);
  // On phones the nav is a horizontal strip: bring the current section into view.
  useEffect(() => {
    const ul = list.current;
    const a = ul?.querySelector<HTMLElement>('[aria-current="page"]');
    if (ul && a && ul.scrollWidth > ul.clientWidth) ul.scrollTo({ left: a.offsetLeft - 16 });
  }, [path]);
  return (
    <aside className="min-w-0 border-b-2 border-ink bg-ink text-white lg:min-h-[80svh] lg:border-b-0 lg:border-r-2">
      <p className="eyebrow hidden px-5 pb-2 pt-8 text-yellow lg:block">Store admin</p>
      <nav aria-label="Admin">
        <ul ref={list} className="flex snap-x overflow-x-auto [scrollbar-width:none] lg:snap-none lg:flex-col">
          {LINKS.map((l) => (
            <li key={l.href} className="snap-start">
              <Link
                href={l.href}
                aria-current={active(l.href) ? "page" : undefined}
                className={`block whitespace-nowrap px-5 py-3 text-sm font-bold uppercase tracking-wider ${
                  active(l.href) ? "bg-yellow text-ink" : "hover:bg-ink-3 hover:text-yellow"
                }`}
              >
                {l.label}
              </Link>
            </li>
          ))}
          <li className="lg:mt-6">
            <Link href="/" className="block whitespace-nowrap px-5 py-3 text-sm font-semibold text-mist hover:text-white">
              ← View store
            </Link>
          </li>
        </ul>
      </nav>
    </aside>
  );
}
