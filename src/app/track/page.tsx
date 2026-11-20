import type { Metadata } from "next";
import { PageBanner } from "@/components/layout/PageBanner";
import { TrackForm } from "./TrackForm";

export const metadata: Metadata = { title: "Track an Order", description: "Check the status of your Superhero Huff order.", alternates: { canonical: "/track" } };

export default function TrackPage() {
  return (
    <>
      <PageBanner eyebrow="Order tracking" title="Where's my gear?" intro="Enter your order number from your receipt and the email you used at checkout." />
      <section className="on-paper bg-paper py-14 text-ink lg:py-20">
        <div className="mx-auto max-w-[1100px] px-4 sm:px-6">
          <TrackForm />
        </div>
      </section>
    </>
  );
}
