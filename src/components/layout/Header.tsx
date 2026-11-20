"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { issueLabel } from "@/lib/format";
import { site } from "@/lib/site";
import { useCart } from "../cart/CartProvider";

type NavCollection = { slug: string; name: string; issue: number };

export function Header({ collections, announcement }: { collections: NavCollection[]; announcement: string | null }) {
  const { count, setOpen } = useCart();
  const [menu, setMenu] = useState<null | "clothing" | "collections">(null);
  const [mobile, setMobile] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navRef = useRef<HTMLElement>(null);


  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!menu) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenu(null);
    const onClick = (e: MouseEvent) => navRef.current && !navRef.current.contains(e.target as Node) && setMenu(null);
    window.addEventListener("keydown", onKey);
    window.addEventListener("click", onClick);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("click", onClick);
    };
  }, [menu]);

  useEffect(() => {
    document.documentElement.style.overflow = mobile ? "hidden" : "";
  }, [mobile]);

  // Any link click inside a menu closes it (navigation is client-side).
  const closeOnLink = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest("a")) {
      setMenu(null);
      setMobile(false);
    }
  };

  return (
    <>
      {announcement && (
        <div className="bg-yellow px-4 py-2 text-center text-xs font-extrabold uppercase tracking-[0.14em] text-ink">{announcement}</div>
      )}
      <header
        className={`sticky top-0 z-50 border-b transition-colors duration-300 ${
          scrolled ? "border-line bg-ink/95 backdrop-blur-md" : "border-transparent bg-ink"
        }`}
      >
        <div className="mx-auto flex h-16 max-w-[1440px] items-center gap-4 px-4 sm:px-6 lg:h-[72px] lg:px-10">
          <button
            type="button"
            className="-ml-2 grid size-11 place-items-center lg:hidden"
            aria-label="Open menu"
            aria-expanded={mobile}
            aria-controls="mobile-menu"
            onClick={() => setMobile(true)}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M3 6h18M3 12h18M3 18h12" stroke="currentColor" strokeWidth="2.25" />
            </svg>
          </button>

          <Link href="/" className="shrink-0" aria-label="Superhero Huff home">
            <Image src="/brand/logo.png" alt="Superhero Huff" width={163} height={150} priority className="h-11 w-auto lg:h-14" />
          </Link>

          <nav ref={navRef} aria-label="Main" onClick={closeOnLink} className="ml-6 hidden h-full items-center lg:flex">
            <ul className="flex h-full items-center gap-1">
              <li className="relative h-full">
                <button
                  type="button"
                  aria-expanded={menu === "clothing"}
                  aria-controls="menu-clothing"
                  onClick={() => setMenu(menu === "clothing" ? null : "clothing")}
                  className={`nav-link flex h-full items-center gap-1.5 px-3`}
                >
                  Clothing <Chevron open={menu === "clothing"} />
                </button>
                <Dropdown id="menu-clothing" open={menu === "clothing"}>
                  <ul className="grid gap-1 p-3">
                    {site.nav.clothing.map((l) => (
                      <li key={l.href}>
                        <Link href={l.href} className="block px-3 py-2.5 font-semibold hover:bg-yellow hover:text-ink">
                          {l.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </Dropdown>
              </li>
              <li className="relative h-full">
                <button
                  type="button"
                  aria-expanded={menu === "collections"}
                  aria-controls="menu-collections"
                  onClick={() => setMenu(menu === "collections" ? null : "collections")}
                  className={`nav-link flex h-full items-center gap-1.5 px-3`}
                >
                  Collections <Chevron open={menu === "collections"} />
                </button>
                <Dropdown id="menu-collections" open={menu === "collections"} wide>
                  <ul className="grid grid-cols-2 gap-1 p-3">
                    {collections.map((c) => (
                      <li key={c.slug}>
                        <Link href={`/collections/${c.slug}`} className="group flex items-baseline gap-3 px-3 py-2.5 hover:bg-yellow hover:text-ink">
                          <span className="font-display text-sm text-yellow group-hover:text-ink">{issueLabel(c.issue)}</span>
                          <span className="font-semibold">{c.name}</span>
                        </Link>
                      </li>
                    ))}
                    <li className="col-span-2 border-t border-line pt-1">
                      <Link href="/collections" className="block px-3 py-2.5 text-sm font-bold uppercase tracking-wider text-mist hover:text-yellow">
                        All collections →
                      </Link>
                    </li>
                  </ul>
                </Dropdown>
              </li>
              {[
                { label: "Comics", href: "/comics" },
                { label: "Meet Agent Huff", href: "/about" },
                { label: "Contact", href: "/contact" },
              ].map((l) => (
                <li key={l.href} className="h-full">
                  <Link href={l.href} className="nav-link flex h-full items-center px-3">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="ml-auto flex items-center gap-1">
            <Link href="/account" className="grid size-11 place-items-center hover:text-yellow" aria-label="My account">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2" />
                <path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6" stroke="currentColor" strokeWidth="2" />
              </svg>
            </Link>
            <button type="button" onClick={() => setOpen(true)} className="relative grid size-11 place-items-center hover:text-yellow" aria-label={`Open cart, ${count} item${count === 1 ? "" : "s"}`}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M5 8h14l-1.2 12.2a1 1 0 0 1-1 .8H7.2a1 1 0 0 1-1-.8L5 8Z" stroke="currentColor" strokeWidth="2" />
                <path d="M9 8V6a3 3 0 0 1 6 0v2" stroke="currentColor" strokeWidth="2" />
              </svg>
              {count > 0 && (
                <span className="absolute right-0.5 top-0.5 grid min-w-5 place-items-center rounded-full bg-yellow px-1 text-[11px] font-extrabold leading-5 text-ink tabular-nums">{count}</span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile menu */}
      <div id="mobile-menu" className={`fixed inset-0 z-[70] lg:hidden ${mobile ? "" : "pointer-events-none"}`} aria-hidden={!mobile} inert={!mobile}>
        <div className={`absolute inset-0 bg-ink transition-opacity duration-300 ${mobile ? "opacity-100" : "opacity-0"}`} />
        <div className={`halftone relative flex h-full flex-col overflow-y-auto transition-transform duration-300 ease-[var(--ease-snap)] ${mobile ? "translate-x-0" : "-translate-x-full"}`}>
          <div className="flex h-16 items-center justify-between px-4">
            <Image src="/brand/logo.png" alt="" width={163} height={150} className="h-11 w-auto" />
            <button type="button" onClick={() => setMobile(false)} className="grid size-11 place-items-center" aria-label="Close menu">
              <svg width="20" height="20" viewBox="0 0 16 16" aria-hidden="true">
                <path d="M2 2l12 12M14 2L2 14" stroke="currentColor" strokeWidth="2.25" />
              </svg>
            </button>
          </div>
          <nav aria-label="Mobile" onClick={closeOnLink} className="px-5 pb-10">
            <p className="eyebrow mt-4 text-yellow">Clothing</p>
            <ul className="mt-2 grid grid-cols-2 gap-x-4">
              {site.nav.clothing.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="block py-2.5 text-lg font-semibold">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
            <p className="eyebrow mt-8 text-yellow">Collections</p>
            <ul className="mt-2">
              {collections.map((c) => (
                <li key={c.slug}>
                  <Link href={`/collections/${c.slug}`} className="flex items-baseline gap-3 py-2.5">
                    <span className="font-display text-yellow">{issueLabel(c.issue)}</span>
                    <span className="display text-3xl">{c.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
            <ul className="mt-8 space-y-1 border-t border-line pt-6">
              {[
                { label: "Comics", href: "/comics" },
                { label: "Meet Agent Huff", href: "/about" },
                { label: "Contact", href: "/contact" },
                { label: "My account", href: "/account" },
                { label: "Track an order", href: "/track" },
              ].map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="block py-2.5 text-lg font-semibold">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </>
  );
}

function Chevron({ open }: { open: boolean }) {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true" className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}>
      <path d="M1 3l4 4 4-4" stroke="currentColor" strokeWidth="1.75" fill="none" />
    </svg>
  );
}

function Dropdown({ id, open, wide, children }: { id: string; open: boolean; wide?: boolean; children: React.ReactNode }) {
  return (
    <div
      id={id}
      className={`absolute left-0 top-full origin-top border-2 border-line bg-ink-2 shadow-[8px_8px_0_0_var(--color-yellow)] transition-[opacity,transform] duration-200 ease-[var(--ease-snap)] ${
        wide ? "w-[520px]" : "w-64"
      } ${open ? "visible translate-y-0 opacity-100" : "invisible -translate-y-1 opacity-0"}`}
    >
      {children}
    </div>
  );
}
