import Image from "next/image";
import Link from "next/link";
import { site } from "@/lib/site";
import { NewsletterForm } from "../forms/NewsletterForm";
import { Year } from "./Year";

export function Footer({ collections }: { collections: { slug: string; name: string }[] }) {
  return (
    <footer className="halftone relative mt-auto border-t-4 border-yellow bg-ink">
      <div className="mx-auto max-w-[1440px] px-4 pb-8 pt-14 sm:px-6 lg:px-10">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1.2fr_2fr]">
          <div>
            <Image src="/brand/logo.png" alt="Superhero Huff" width={163} height={150} className="h-20 w-auto" />
            <p className="mt-5 max-w-sm text-mist">{site.story}</p>
            <div className="mt-8 max-w-md">
              <p className="display text-2xl">Join the mailing list</p>
              <p className="mt-1 text-sm text-mist">New drops, new issues, first dibs.</p>
              <NewsletterForm />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            <FooterCol title="Clothing" links={site.nav.clothing.map((l) => ({ label: l.label, href: l.href }))} />
            <FooterCol title="Collections" links={collections.map((c) => ({ label: c.name, href: `/collections/${c.slug}` }))} />
            <div>
              <FooterCol
                title="Help"
                links={[{ label: "My account", href: "/account" }, ...site.nav.help.map((l) => ({ label: l.label, href: l.href }))]}
              />
              <p className="eyebrow mt-8 text-yellow">Follow Agent Huff</p>
              <ul className="mt-3 flex flex-wrap gap-2">
                {site.social.map((s) => (
                  <li key={s.label}>
                    <a href={s.href} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-10 items-center border border-line px-3 text-sm font-semibold hover:border-yellow hover:text-yellow">
                      {s.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        <div className="mt-14 flex flex-col gap-2 border-t border-line pt-6 text-xs text-mist sm:flex-row sm:items-center sm:justify-between">
          <span>
            © <Year /> Superhero Huff. Comics published by {site.publisher}.
          </span>
          <span>
            Designed by{" "}
            <a href="https://www.sitesonpolaris.com" target="_blank" rel="noopener noreferrer" className="hover:text-white/70 transition">
              Sites on Polaris
            </a>
          </span>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: { label: string; href: string }[] }) {
  return (
    <div>
      <p className="eyebrow text-yellow">{title}</p>
      <ul className="mt-3 space-y-2">
        {links.map((l) => (
          <li key={l.href}>
            <Link href={l.href} className="text-sm text-white/85 hover:text-yellow">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
