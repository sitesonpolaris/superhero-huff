"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { issueLabel, money } from "@/lib/format";

export type RailIssue = {
  slug: string;
  name: string;
  tagline: string | null;
  issue: number;
  cover: string | null;
  items: { slug: string; name: string; price: number; image: string | null }[];
};

/**
 * "Choose your Huff": the character collections as numbered comic issues.
 * Selecting an issue swaps the feature panel to that collection's pieces.
 */
export function IssueRail({ issues }: { issues: RailIssue[] }) {
  const [active, setActive] = useState(0);
  const current = issues[active];
  if (!current) return null;

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,360px)_1fr] lg:gap-10">
      <div role="tablist" aria-label="Character collections" aria-orientation="vertical" className="-mx-4 flex snap-x gap-2 overflow-x-auto px-4 pb-2 lg:mx-0 lg:flex-col lg:overflow-visible lg:px-0 lg:pb-0">
        {issues.map((c, i) => {
          const on = i === active;
          return (
            <button
              key={c.slug}
              id={`issue-tab-${c.slug}`}
              role="tab"
              type="button"
              aria-selected={on}
              aria-controls="issue-panel"
              tabIndex={on ? 0 : -1}
              onClick={() => setActive(i)}
              onMouseEnter={() => window.matchMedia("(hover: hover)").matches && setActive(i)}
              onKeyDown={(e) => {
                const next = e.key === "ArrowDown" || e.key === "ArrowRight" ? 1 : e.key === "ArrowUp" || e.key === "ArrowLeft" ? -1 : 0;
                if (!next) return;
                e.preventDefault();
                const n = (i + next + issues.length) % issues.length;
                setActive(n);
                document.getElementById(`issue-tab-${issues[n].slug}`)?.focus();
              }}
              className={`group flex shrink-0 snap-start items-baseline gap-3 border-2 px-4 py-3 text-left transition-[background-color,color,border-color,transform] duration-200 lg:py-2.5 ${
                on ? "border-yellow bg-yellow text-ink lg:translate-x-2" : "border-line text-white hover:border-white"
              }`}
            >
              <span className={`font-display text-lg ${on ? "text-ink" : "text-yellow"}`}>{issueLabel(c.issue)}</span>
              <span className="display whitespace-nowrap text-2xl lg:text-3xl">{c.name}</span>
            </button>
          );
        })}
      </div>

      <div id="issue-panel" role="tabpanel" aria-labelledby={`issue-tab-${current.slug}`} className="relative min-w-0">
        <div key={current.slug} className="issue-swap grid gap-5 sm:grid-cols-[1.1fr_1fr]">
          <Link href={`/collections/${current.slug}`} className="group relative block aspect-[4/5] overflow-hidden border-2 border-white bg-paper shadow-[8px_8px_0_0_var(--color-yellow)]">
            {current.cover && <Image src={current.cover} alt={`${current.name} collection`} fill sizes="(min-width: 1024px) 34vw, 90vw" className="object-contain p-6 transition-transform duration-500 group-hover:scale-[1.03]" />}
            <div className="absolute inset-x-0 top-0 flex items-start justify-between p-4">
              <span className="bg-ink px-2 py-1 font-display text-2xl text-yellow">{issueLabel(current.issue)}</span>
            </div>
            <div className="absolute inset-x-0 bottom-0 bg-ink p-4">
              <p className="display text-4xl text-white sm:text-5xl">{current.name}</p>
              {current.tagline && <p className="mt-1 text-sm font-semibold text-yellow">{current.tagline}</p>}
            </div>
          </Link>
          <div className="flex flex-col">
            <p className="eyebrow text-mist">In this issue</p>
            <ul className="mt-3 grid grid-cols-2 gap-3">
              {current.items.slice(0, 4).map((p) => (
                <li key={p.slug}>
                  <Link href={`/product/${p.slug}`} className="group block">
                    <div className="relative aspect-square border-2 border-line bg-white transition-colors group-hover:border-yellow">
                      {p.image && <Image src={p.image} alt="" fill sizes="(min-width: 1024px) 14vw, 40vw" className="object-contain p-2" />}
                    </div>
                    <p className="mt-2 line-clamp-2 text-sm font-semibold leading-snug group-hover:text-yellow">{p.name}</p>
                    <p className="text-sm text-mist tabular-nums">{money(p.price)}</p>
                  </Link>
                </li>
              ))}
            </ul>
            <Link href={`/collections/${current.slug}`} className="btn btn-yellow mt-auto self-start max-sm:mt-6">
              Shop {current.name} →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
