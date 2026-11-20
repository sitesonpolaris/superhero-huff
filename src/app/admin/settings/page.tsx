import { requireAdmin } from "@/lib/admin";
import { SettingsForm } from "../forms";
import { AdminTitle } from "../ui";

export default async function SettingsPage() {
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from("settings").select("flat_shipping_cents, free_shipping_threshold_cents, announcement, store_email").eq("id", 1).single();
  return (
    <>
      <AdminTitle>Settings</AdminTitle>
      {data ? <SettingsForm s={data} /> : <p>Settings row missing. Run the database migration.</p>}
      <div className="mt-8 max-w-2xl border-2 border-dashed border-ink/40 p-5 text-sm text-slate">
        <p className="font-bold text-ink">Sales tax</p>
        <p className="mt-1">Tax is calculated by Stripe Tax at checkout once it&apos;s turned on in the Stripe dashboard and STRIPE_AUTOMATIC_TAX is set to true.</p>
      </div>
    </>
  );
}
