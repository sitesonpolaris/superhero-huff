"use client";

import { useRouter } from "next/navigation";
import { browserClient } from "@/lib/supabase/client";

export function SignOutButton() {
  const router = useRouter();
  return (
    <button
      type="button"
      className="btn border-ink bg-white text-ink"
      onClick={async () => {
        await browserClient().auth.signOut();
        router.replace("/");
        router.refresh();
      }}
    >
      Sign out
    </button>
  );
}
