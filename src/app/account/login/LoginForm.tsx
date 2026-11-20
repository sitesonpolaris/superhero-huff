"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { browserClient } from "@/lib/supabase/client";
import { hasSupabase } from "@/lib/supabase/env";

type Mode = "signin" | "signup" | "link";

export function LoginForm() {
  const params = useSearchParams();
  const router = useRouter();
  const next = (() => {
    const n = params.get("next");
    return n && n.startsWith("/") && !n.startsWith("//") ? n : "/account";
  })();
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(params.get("error") ? { ok: false, text: "That sign-in link has expired. Request a new one." } : null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!hasSupabase) return setMsg({ ok: false, text: "Accounts open soon." });
    setBusy(true);
    setMsg(null);
    const sb = browserClient();
    const redirect = `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;
    try {
      if (mode === "link") {
        const { error } = await sb.auth.signInWithOtp({ email, options: { emailRedirectTo: redirect } });
        if (error) throw error;
        setMsg({ ok: true, text: `Check ${email} for your sign-in link.` });
      } else if (mode === "signup") {
        const { data, error } = await sb.auth.signUp({ email, password, options: { emailRedirectTo: redirect } });
        if (error) throw error;
        if (data.session) router.replace(next);
        else setMsg({ ok: true, text: `Almost there: confirm your email from the link we sent to ${email}.` });
      } else {
        const { error } = await sb.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.replace(next);
        router.refresh();
      }
    } catch (err) {
      setMsg({ ok: false, text: err instanceof Error ? err.message : "Something went wrong." });
    } finally {
      setBusy(false);
    }
  }

  const tabs: { id: Mode; label: string }[] = [
    { id: "signin", label: "Sign in" },
    { id: "signup", label: "Create account" },
    { id: "link", label: "Email me a link" },
  ];

  return (
    <div>
      <div className="mb-6 flex flex-wrap gap-2" role="tablist" aria-label="Sign-in method">
        {tabs.map((t) => (
          <button
            key={t.id}
            role="tab"
            type="button"
            aria-selected={mode === t.id}
            onClick={() => (setMode(t.id), setMsg(null))}
            className={`min-h-10 border-2 border-ink px-3 text-sm font-bold ${mode === t.id ? "bg-ink text-yellow" : "bg-white hover:bg-yellow"}`}
          >
            {t.label}
          </button>
        ))}
      </div>
      <form onSubmit={submit} className="space-y-5">
        <div>
          <label htmlFor="l-email" className="eyebrow">
            Email
          </label>
          <input id="l-email" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className="field mt-2" />
        </div>
        {mode !== "link" && (
          <div>
            <label htmlFor="l-pass" className="eyebrow">
              Password
            </label>
            <input
              id="l-pass"
              type="password"
              required
              minLength={8}
              autoComplete={mode === "signup" ? "new-password" : "current-password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="field mt-2"
            />
          </div>
        )}
        {msg && (
          <p role={msg.ok ? "status" : "alert"} className={`border-2 px-3 py-2 text-sm font-bold ${msg.ok ? "border-ink bg-yellow" : "border-red bg-red/10 text-red"}`}>
            {msg.text}
          </p>
        )}
        <button type="submit" disabled={busy} className="btn btn-ink w-full">
          {busy ? "One moment…" : mode === "signup" ? "Create account" : mode === "link" ? "Send sign-in link" : "Sign in"}
        </button>
      </form>
    </div>
  );
}
