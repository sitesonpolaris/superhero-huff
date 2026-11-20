import { requireAdmin } from "@/lib/admin";
import { HandledToggle } from "../forms";
import { AdminTitle } from "../ui";

export default async function InboxPage() {
  const { supabase } = await requireAdmin();
  const [{ data: messages }, { data: subs, count }] = await Promise.all([
    supabase.from("contact_messages").select("id, name, email, message, handled, created_at").order("created_at", { ascending: false }).limit(200),
    supabase.from("subscribers").select("email, created_at", { count: "exact" }).order("created_at", { ascending: false }),
  ]);
  const csv = "data:text/csv;charset=utf-8," + encodeURIComponent(["email,joined", ...(subs ?? []).map((s) => `${s.email},${s.created_at}`)].join("\n"));

  return (
    <>
      <AdminTitle>Inbox</AdminTitle>
      <div className="grid gap-10 xl:grid-cols-[1.6fr_1fr]">
        <section>
          <h2 className="eyebrow mb-3">Contact messages</h2>
          <ul className="space-y-4">
            {(messages ?? []).map((m) => (
              <li key={m.id} className={`border-2 border-ink bg-white p-4 ${m.handled ? "opacity-60" : "shadow-panel"}`}>
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="font-bold">
                    {m.name}{" "}
                    <a href={`mailto:${m.email}`} className="font-normal underline">
                      {m.email}
                    </a>
                  </p>
                  <p className="text-xs text-slate">{new Date(m.created_at).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })}</p>
                </div>
                <p className="mt-2 whitespace-pre-wrap text-sm">{m.message}</p>
                <div className="mt-3">
                  <HandledToggle id={m.id} handled={m.handled} />
                </div>
              </li>
            ))}
            {!messages?.length && <li className="border-2 border-dashed border-ink/40 p-8 text-center text-slate">No messages yet.</li>}
          </ul>
        </section>
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="eyebrow">Mailing list ({count ?? 0})</h2>
            {!!subs?.length && (
              <a href={csv} download="superhero-huff-subscribers.csv" className="text-sm font-bold underline">
                Download CSV
              </a>
            )}
          </div>
          <ul className="max-h-[60vh] divide-y divide-ink/10 overflow-y-auto border-2 border-ink bg-white text-sm">
            {(subs ?? []).map((s) => (
              <li key={s.email} className="flex justify-between gap-3 px-3 py-2">
                <span className="truncate">{s.email}</span>
                <span className="shrink-0 text-slate">{new Date(s.created_at).toLocaleDateString("en-US")}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </>
  );
}
