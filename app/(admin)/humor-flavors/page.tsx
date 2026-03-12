import HumorFlavorList from "@/components/HumorFlavorList";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function HumorFlavorsPage() {
  const supabase = await createSupabaseServerClient();
  const [
    { data: flavors, error: flavorsError },
    { data: steps, error: stepsError },
    { data: models, error: modelsError },
    { data: inputTypes, error: inputTypesError },
    { data: outputTypes, error: outputTypesError },
  ] = await Promise.all([
    supabase
      .from("humor_flavors")
      .select("*")
      .order("created_datetime_utc", { ascending: false }),
    supabase
      .from("humor_flavor_steps")
      .select("*")
      .order("order_by", { ascending: true }),
    supabase.from("llm_models").select("id, name"),
    supabase.from("llm_input_types").select("id, slug"),
    supabase.from("llm_output_types").select("id, slug"),
  ]);

  const flavorRows = Array.isArray(flavors) ? flavors : [];
  const stepRows = Array.isArray(steps) ? steps : [];
  const stepsByFlavorId = new Map<number, typeof stepRows>();
  const modelNameById = new Map<number, string>();
  const inputTypeNameById = new Map<number, string>();
  const outputTypeNameById = new Map<number, string>();

  (Array.isArray(models) ? models : []).forEach((model) => {
    modelNameById.set(Number(model.id), model.name);
  });

  (Array.isArray(inputTypes) ? inputTypes : []).forEach((inputType) => {
    inputTypeNameById.set(Number(inputType.id), inputType.slug);
  });

  (Array.isArray(outputTypes) ? outputTypes : []).forEach((outputType) => {
    outputTypeNameById.set(Number(outputType.id), outputType.slug);
  });

  stepRows.forEach((step) => {
    const flavorId = Number(step.humor_flavor_id);
    const existing = stepsByFlavorId.get(flavorId) ?? [];
    existing.push(step);
    stepsByFlavorId.set(flavorId, existing);
  });

  const errorMessage =
    flavorsError?.message ??
    stepsError?.message ??
    modelsError?.message ??
    inputTypesError?.message ??
    outputTypesError?.message;
  const flavorsWithSteps = flavorRows.map((flavor) => ({
    id: Number(flavor.id),
    slug: flavor.slug,
    description: flavor.description,
    steps: (stepsByFlavorId.get(Number(flavor.id)) ?? []).map((step) => ({
      id: Number(step.id),
      order_by: Number(step.order_by),
      llm_model_name:
        modelNameById.get(Number(step.llm_model_id)) ??
        `Model ${String(step.llm_model_id)}`,
      llm_input_type_name:
        inputTypeNameById.get(Number(step.llm_input_type_id)) ??
        `Input Type ${String(step.llm_input_type_id)}`,
      llm_output_type_name:
        outputTypeNameById.get(Number(step.llm_output_type_id)) ??
        `Output Type ${String(step.llm_output_type_id)}`,
      description: step.description,
      llm_user_prompt: step.llm_user_prompt,
      llm_system_prompt: step.llm_system_prompt,
    })),
  }));

  return (
    <div className="mx-auto w-full max-w-[1400px]">
      <header>
        <p className="text-[0.7rem] uppercase tracking-[0.5em] text-orange-300/80 [font-family:var(--font-heading)]">
          Humor Flavors
        </p>
        <h1 className="mt-3 text-[2.75rem] leading-none uppercase tracking-[0.18em] text-zinc-100 sm:text-[3.25rem] lg:text-[3.75rem] [font-family:var(--font-heading)]">
          Humor Flavors
        </h1>
        <p className="mt-4 max-w-2xl text-sm text-zinc-300/75">
          Read-only view of all humor flavors and their associated steps.
        </p>
      </header>

      <section className="mt-10">
        {errorMessage ? (
          <p className="text-sm text-rose-200/90">
            Failed to load humor flavors: {errorMessage}
          </p>
        ) : flavorRows.length === 0 ? (
          <p className="text-sm text-zinc-400/80">No humor flavors found.</p>
        ) : (
          <HumorFlavorList flavors={flavorsWithSteps} />
        )}
      </section>
    </div>
  );
}
