import type { Metadata } from "next";
import { Suspense } from "react";
import { hasSupabase } from "@/lib/supabase/env";
import { AdminNav } from "./AdminNav";

export const metadata: Metadata = { title: { default: "Admin", template: "%s | Admin" }, robots: { index: false, follow: false } };

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="on-paper min-h-[80svh] bg-paper text-ink">
      <div className="mx-auto grid max-w-[1440px] grid-cols-1 gap-0 lg:grid-cols-[220px_minmax(0,1fr)]">
        <Suspense fallback={<div className="bg-ink lg:min-h-[80svh]" />}>
          <AdminNav />
        </Suspense>
        <div className="min-w-0 px-4 py-8 sm:px-6 lg:px-10 lg:py-10">
          {hasSupabase ? (
            <Suspense fallback={<p className="text-slate">Loading…</p>}>{children}</Suspense>
          ) : (
            <div className="border-2 border-ink bg-white p-8 shadow-panel">
              <h1 className="display text-4xl">Connect Supabase</h1>
              <p className="mt-3 text-slate">Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY to use the dashboard.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
