import "server-only";
import { redirect } from "next/navigation";
import { serverClient } from "./supabase/server";

/** Returns an RLS-bound client for a signed-in admin, or redirects. Call in every admin page and action. */
export async function requireAdmin() {
  const supabase = await serverClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/account/login?next=/admin");
  const { data: isAdmin } = await supabase.rpc("is_admin");
  if (!isAdmin) redirect("/account?denied=1");
  return { supabase, user };
}
