import { PageBanner } from "./PageBanner";

export function LegalPage({ title, eyebrow, html }: { title: string; eyebrow: string; html: string }) {
  return (
    <>
      <PageBanner eyebrow={eyebrow} title={title} />
      <section className="on-paper bg-paper py-14 text-ink lg:py-20">
        <div className="prose-legal mx-auto max-w-3xl px-4 sm:px-6" dangerouslySetInnerHTML={{ __html: html }} />
      </section>
    </>
  );
}
