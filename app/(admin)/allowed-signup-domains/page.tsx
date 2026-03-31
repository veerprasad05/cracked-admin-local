import AdminCrudManager from "@/components/AdminCrudManager";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function AllowedSignupDomainsPage() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("allowed_signup_domains")
    .select("*")
    .order("created_datetime_utc", { ascending: false });

  const rows = Array.isArray(data) ? data : [];

  return (
    <div className="mx-auto w-full max-w-[1200px]">
      <header>
        <p className="text-[0.7rem] uppercase tracking-[0.5em] text-orange-300/80 [font-family:var(--font-heading)]">
          Profiles
        </p>
        <h1 className="mt-3 text-[2.75rem] leading-none uppercase tracking-[0.18em] text-zinc-100 sm:text-[3.25rem] lg:text-[3.75rem] [font-family:var(--font-heading)]">
          Allowed Signup Domains
        </h1>
      </header>

      <section className="mt-10">
        {error ? (
          <p className="text-sm text-rose-200/90">
            Failed to load allowed signup domains: {error.message}
          </p>
        ) : (
          <AdminCrudManager
            tableName="allowed_signup_domains"
            rows={rows}
            fields={[
              {
                name: "apex_domain",
                label: "Apex Domain",
                type: "text",
                required: true,
              },
            ]}
            columns={[
              { key: "created_datetime_utc", label: "Created", type: "datetime" },
              { key: "apex_domain", label: "Apex Domain", type: "text" },
            ]}
            emptyMessage="No allowed signup domains found."
            createLabel="Create Allowed Signup Domain"
            editLabel="Edit Allowed Signup Domain"
            deleteLabel="Delete Allowed Signup Domain"
            createdAtField="created_datetime_utc"
            modifiedAtField="modified_datetime_utc"
          />
        )}
      </section>
    </div>
  );
}
