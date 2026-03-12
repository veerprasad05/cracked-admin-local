import AdminCrudManager from "@/components/AdminCrudManager";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function LlmModelsPage() {
  const supabase = await createSupabaseServerClient();
  const [{ data: models, error: modelsError }, { data: providers, error: providersError }] =
    await Promise.all([
      supabase.from("llm_models").select("*").order("created_datetime_utc", { ascending: false }),
      supabase.from("llm_providers").select("id, name"),
    ]);

  const providerMap = new Map<number, string>();
  (Array.isArray(providers) ? providers : []).forEach((provider) => {
    providerMap.set(Number(provider.id), provider.name);
  });

  const rows = Array.isArray(models)
    ? models.map((model) => ({
        ...model,
        provider_name: providerMap.get(Number(model.llm_provider_id)) ?? "Unknown",
      }))
    : [];

  const errorMessage = modelsError?.message ?? providersError?.message;

  return (
    <div className="mx-auto w-full max-w-[1400px]">
      <header>
        <p className="text-[0.7rem] uppercase tracking-[0.5em] text-orange-300/80 [font-family:var(--font-heading)]">
          LLMs
        </p>
        <h1 className="mt-3 text-[2.75rem] leading-none uppercase tracking-[0.18em] text-zinc-100 sm:text-[3.25rem] lg:text-[3.75rem] [font-family:var(--font-heading)]">
          LLM Models
        </h1>
      </header>

      <section className="mt-10">
        {errorMessage ? (
          <p className="text-sm text-rose-200/90">
            Failed to load llm models: {errorMessage}
          </p>
        ) : (
          <AdminCrudManager
            tableName="llm_models"
            rows={rows}
            fields={[
              { name: "name", label: "Name", type: "text", required: true },
              {
                name: "llm_provider_id",
                label: "Provider ID",
                type: "number",
                required: true,
              },
              {
                name: "provider_model_id",
                label: "Provider Model ID",
                type: "text",
                required: true,
              },
              {
                name: "is_temperature_supported",
                label: "Temperature Supported",
                type: "checkbox",
              },
            ]}
            columns={[
              { key: "created_datetime_utc", label: "Created", type: "datetime" },
              { key: "name", label: "Model Name" },
              { key: "provider_name", label: "Provider" },
              { key: "provider_model_id", label: "Provider Model ID" },
              {
                key: "is_temperature_supported",
                label: "Temperature Supported",
                type: "boolean",
              },
            ]}
            emptyMessage="No llm models found."
            createLabel="Create LLM Model"
            editLabel="Edit LLM Model"
            deleteLabel="Delete LLM Model"
            createdAtField="created_datetime_utc"
          />
        )}
      </section>
    </div>
  );
}
