import CaptionExamplesManager from "@/components/CaptionExamplesManager";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function CaptionExamplesPage() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("caption_examples")
    .select("*")
    .order("created_datetime_utc", { ascending: false });

  const imageIds = (Array.isArray(data) ? data : [])
    .map((row) => row.image_id)
    .filter((value): value is string => typeof value === "string");

  const { data: images, error: imagesError } =
    imageIds.length > 0
      ? await supabase
          .from("images")
          .select("id, url")
          .in("id", imageIds)
      : { data: [], error: null };

  const imageUrlById = new Map<string, string | null>();
  (Array.isArray(images) ? images : []).forEach((image) => {
    imageUrlById.set(image.id, image.url);
  });

  const rows = Array.isArray(data)
    ? data.map((row) => ({
        ...row,
        image_url:
          typeof row.image_id === "string"
            ? imageUrlById.get(row.image_id) ?? null
            : null,
      }))
    : [];
  const errorMessage = error?.message ?? imagesError?.message;

  return (
    <div className="mx-auto w-full max-w-[1400px]">
      <header className="flex flex-col gap-4">
        <p className="text-[0.7rem] uppercase tracking-[0.5em] text-orange-300/80 [font-family:var(--font-heading)]">
          Captions
        </p>
        <h1 className="text-[2.75rem] leading-none uppercase tracking-[0.18em] text-zinc-100 sm:text-[3.25rem] lg:text-[3.75rem] [font-family:var(--font-heading)]">
          Caption Examples
        </h1>
        <p className="max-w-2xl text-sm text-zinc-300/75">
          Curated caption examples with explanations and optional linked images.
        </p>
      </header>

      <section className="mt-10">
        {errorMessage ? (
          <p className="text-sm text-rose-200/90">
            Failed to load caption examples: {errorMessage}
          </p>
        ) : (
          <CaptionExamplesManager rows={rows} />
        )}
      </section>
    </div>
  );
}
