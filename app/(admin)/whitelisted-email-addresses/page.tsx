import AdminCrudManager from "@/components/AdminCrudManager";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function WhitelistedEmailAddressesPage() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("whitelist_email_addresses")
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
          Whitelisted Email Addresses
        </h1>
      </header>

      <section className="mt-10">
        {error ? (
          <p className="text-sm text-rose-200/90">
            Failed to load whitelisted email addresses: {error.message}
          </p>
        ) : (
          <AdminCrudManager
            tableName="whitelist_email_addresses"
            rows={rows}
            fields={[
              {
                name: "email_address",
                label: "Email Address",
                type: "text",
                required: true,
              },
            ]}
            columns={[
              { key: "created_datetime_utc", label: "Created", type: "datetime" },
              { key: "modified_datetime_utc", label: "Modified", type: "datetime" },
              { key: "email_address", label: "Email Address", type: "text" },
            ]}
            emptyMessage="No whitelisted email addresses found."
            createLabel="Create Whitelisted Email"
            editLabel="Edit Whitelisted Email"
            deleteLabel="Delete Whitelisted Email"
            createdAtField="created_datetime_utc"
            modifiedAtField="modified_datetime_utc"
          />
        )}
      </section>
    </div>
  );
}
