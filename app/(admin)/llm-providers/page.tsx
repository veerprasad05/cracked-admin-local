import AdminCrudManager from "@/components/AdminCrudManager";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function LlmProvidersPage() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("llm_providers")
    .select("*")
    .order("created_datetime_utc", { ascending: false });

  const rows = Array.isArray(data) ? data : [];

  return (
    <div className="mx-auto w-full max-w-[1200px]">
      <header>
        <p className="text-[0.7rem] uppercase tracking-[0.5em] text-orange-300/80 [font-family:var(--font-heading)]">
          LLMs
        </p>
        <h1 className="mt-3 text-[2.75rem] leading-none uppercase tracking-[0.18em] text-zinc-100 sm:text-[3.25rem] lg:text-[3.75rem] [font-family:var(--font-heading)]">
          LLM Providers
        </h1>
      </header>

      <section className="mt-10">
        {error ? (
          <p className="text-sm text-rose-200/90">
            Failed to load llm providers: {error.message}
          </p>
        ) : (
          <AdminCrudManager
            tableName="llm_providers"
            rows={rows}
            fields={[{ name: "name", label: "Name", type: "text", required: true }]}
            columns={[
              { key: "created_datetime_utc", label: "Created", type: "datetime" },
              { key: "name", label: "Name" },
            ]}
            emptyMessage="No llm providers found."
            createLabel="Create LLM Provider"
            editLabel="Edit LLM Provider"
            deleteLabel="Delete LLM Provider"
            createdAtField="created_datetime_utc"
          />
        )}
      </section>
    </div>
  );
}
