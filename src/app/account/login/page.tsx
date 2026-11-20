import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = { title: "Log In", robots: { index: false } };

export default function LoginPage() {
  return (
    <section className="on-paper bg-paper py-16 text-ink lg:py-24">
      <div className="mx-auto max-w-md px-4 sm:px-6">
        <p className="eyebrow text-purple">My account</p>
        <h1 className="display mt-2 text-6xl">Log in</h1>
        <p className="mt-3 text-slate">
          Accounts are optional. See past orders and check out faster. You can also{" "}
          <Link href="/track" className="font-bold underline">
            track an order
          </Link>{" "}
          without one.
        </p>
        <div className="mt-8 border-2 border-ink bg-white p-6 shadow-panel">
          <Suspense>
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </section>
  );
}
