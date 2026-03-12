import LlmResponseFilter from "@/components/LlmResponseFilter";
import LlmResponsesList from "@/components/LlmResponsesList";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type PageProps = {
  searchParams?: Promise<{ model?: string; promptChainId?: string }>;
};

export default async function LlmResponsesPage({ searchParams }: PageProps) {
  const supabase = await createSupabaseServerClient();
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const modelFilter = resolvedSearchParams?.model ?? "";
  const promptChainFilter = resolvedSearchParams?.promptChainId ?? "";
  const parsedModelFilter = Number(modelFilter);
  const parsedPromptChainFilter = Number(promptChainFilter);

  const { data: models } = await supabase
    .from("llm_models")
    .select("id, name")
    .order("name", { ascending: true });

  const modelNameById = new Map<number, string>();
  (Array.isArray(models) ? models : []).forEach((model) => {
    modelNameById.set(Number(model.id), model.name);
  });

  let responsesQuery = supabase
    .from("llm_model_responses")
    .select("*")
    .order("created_datetime_utc", { ascending: false });

  if (modelFilter.length > 0 && Number.isFinite(parsedModelFilter)) {
    responsesQuery = responsesQuery.eq("llm_model_id", parsedModelFilter);
  }

  if (
    promptChainFilter.length > 0 &&
    Number.isFinite(parsedPromptChainFilter)
  ) {
    responsesQuery = responsesQuery.eq(
      "llm_prompt_chain_id",
      parsedPromptChainFilter
    );
  }

  const { data: responses, error } = await responsesQuery.limit(200);

  const modelOptions = [
    { value: "", label: "All Models" },
    ...((Array.isArray(models) ? models : []).map((model) => ({
      value: String(model.id),
      label: model.name,
    }))),
  ];

  const rows = Array.isArray(responses)
    ? responses.map((row) => ({
        ...row,
        model_name: modelNameById.get(Number(row.llm_model_id)) ?? "Unknown",
      }))
    : [];

  return (
    <div className="mx-auto w-full max-w-[1500px]">
      <header className="flex flex-col gap-6 lg:flex-row lg:items-start">
        <div className="min-w-0 flex-1">
          <p className="text-[0.7rem] uppercase tracking-[0.5em] text-orange-300/80 [font-family:var(--font-heading)]">
            LLMs
          </p>
          <h1 className="mt-3 text-[2.75rem] leading-none uppercase tracking-[0.18em] text-zinc-100 sm:text-[3.25rem] lg:text-[3.75rem] [font-family:var(--font-heading)]">
            LLM Responses
          </h1>
        </div>

        <div className="lg:ml-auto lg:self-start">
          <LlmResponseFilter
            modelValue={modelFilter}
            promptChainValue={promptChainFilter}
            modelOptions={modelOptions}
          />
        </div>
      </header>

      <section className="mt-10">
        {error ? (
          <p className="text-sm text-rose-200/90">
            Failed to load llm responses: {error.message}
          </p>
        ) : rows.length === 0 ? (
          <p className="text-sm text-zinc-400/80">No llm responses found.</p>
        ) : (
          <LlmResponsesList rows={rows} />
        )}
      </section>
    </div>
  );
}
