import { requireAdmin } from "@/lib/admin";
import { CollectionForm } from "../forms";
import { AdminTitle } from "../ui";

export default async function CollectionsAdmin() {
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from("collections").select("slug, name, tagline, issue, cover, active").order("issue");
  return (
    <>
      <AdminTitle>Collections</AdminTitle>
      <p className="mb-6 max-w-2xl text-slate">Each character collection shows as a numbered issue on the homepage and in the menu. Assign products to a collection from the product editor.</p>
      <div className="space-y-4">
        {(data ?? []).map((c) => (
          <CollectionForm key={c.slug} c={c} />
        ))}
        <h2 className="eyebrow pt-6">Add a collection</h2>
        <CollectionForm />
      </div>
    </>
  );
}
