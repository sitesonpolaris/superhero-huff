import "server-only";
import { createClient } from "@supabase/supabase-js";
import { SUPABASE_KEY, SUPABASE_URL } from "./env";

/** Cookie-less client for public catalog reads (safe inside "use cache"). */
export const publicClient = () =>
  createClient(SUPABASE_URL, SUPABASE_KEY, { auth: { persistSession: false, autoRefreshToken: false } });
