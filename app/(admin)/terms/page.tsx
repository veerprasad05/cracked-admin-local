import AdminCrudManager from "@/components/AdminCrudManager";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function TermsPage() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("terms")
    .select("*")
    .order("created_datetime_utc", { ascending: false });

  const rows = Array.isArray(data) ? data : [];

  return (
    <div className="mx-auto w-full max-w-[1400px]">
      <header>
        <p className="text-[0.7rem] uppercase tracking-[0.5em] text-orange-300/80 [font-family:var(--font-heading)]">
          Humor Flavors
        </p>
        <h1 className="mt-3 text-[2.75rem] leading-none uppercase tracking-[0.18em] text-zinc-100 sm:text-[3.25rem] lg:text-[3.75rem] [font-family:var(--font-heading)]">
          Terms
        </h1>
      </header>

      <section className="mt-10">
        {error ? (
          <p className="text-sm text-rose-200/90">
            Failed to load terms: {error.message}
          </p>
        ) : (
          <AdminCrudManager
            tableName="terms"
            rows={rows}
            fields={[
              { name: "term", label: "Term", type: "text", required: true },
              {
                name: "definition",
                label: "Definition",
                type: "textarea",
                required: true,
              },
              {
                name: "example",
                label: "Example",
                type: "textarea",
                required: true,
              },
              { name: "priority", label: "Priority", type: "number", required: true },
              {
                name: "term_type_id",
                label: "Term Type ID",
                type: "number",
                nullable: true,
              },
            ]}
            columns={[
              { key: "created_datetime_utc", label: "Created", type: "datetime" },
              { key: "modified_datetime_utc", label: "Modified", type: "datetime" },
              { key: "term", label: "Term" },
              { key: "priority", label: "Priority", type: "number" },
              { key: "term_type_id", label: "Term Type ID", type: "number" },
              { key: "definition", label: "Definition", type: "longtext" },
              { key: "example", label: "Example", type: "longtext" },
            ]}
            emptyMessage="No terms found."
            createLabel="Create Term"
            editLabel="Edit Term"
            deleteLabel="Delete Term"
            createdAtField="created_datetime_utc"
            modifiedAtField="modified_datetime_utc"
          />
        )}
      </section>
    </div>
  );
}
