import AdminCrudManager from "@/components/AdminCrudManager";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function HumorMixPage() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("humor_flavor_mix")
    .select("*")
    .order("created_datetime_utc", { ascending: false });

  const rows = Array.isArray(data) ? data : [];

  return (
    <div className="mx-auto w-full max-w-[1200px]">
      <header>
        <p className="text-[0.7rem] uppercase tracking-[0.5em] text-orange-300/80 [font-family:var(--font-heading)]">
          Humor Flavors
        </p>
        <h1 className="mt-3 text-[2.75rem] leading-none uppercase tracking-[0.18em] text-zinc-100 sm:text-[3.25rem] lg:text-[3.75rem] [font-family:var(--font-heading)]">
          Humor Mix
        </h1>
      </header>

      <section className="mt-10">
        {error ? (
          <p className="text-sm text-rose-200/90">
            Failed to load humor mix: {error.message}
          </p>
        ) : (
          <AdminCrudManager
            tableName="humor_flavor_mix"
            rows={rows}
            fields={[
              {
                name: "humor_flavor_id",
                label: "Humor Flavor ID",
                type: "number",
                required: true,
              },
              {
                name: "caption_count",
                label: "Caption Count",
                type: "number",
                required: true,
              },
            ]}
            columns={[
              { key: "created_datetime_utc", label: "Created", type: "datetime" },
              { key: "humor_flavor_id", label: "Humor Flavor ID", type: "number" },
              { key: "caption_count", label: "Caption Count", type: "number" },
            ]}
            emptyMessage="No humor mix rows found."
            createLabel="Create Humor Mix Row"
            editLabel="Edit Humor Mix Row"
            deleteLabel="Delete Humor Mix Row"
            createdAtField="created_datetime_utc"
            modifiedAtField="modified_datetime_utc"
            allowCreate={false}
            allowDelete={false}
          />
        )}
      </section>
    </div>
  );
}
