import { Card, type CaptionEntry } from "@/components/Card";
import CaptionFilterControls from "@/components/CaptionFilterControls";
import Pagination from "@/components/Pagination";
import {
  ADMIN_PAGE_SIZE,
  CAPTION_SORT_OPTIONS,
  clampPage,
  parseBooleanSearchParam,
  parseCaptionSortMode,
} from "@/lib/admin/listing";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type PageProps = {
  searchParams?: Promise<{
    page?: string;
    sort?: string;
    featured?: string;
    public?: string;
  }>;
};

type CaptionRow = {
  id: string;
  image_id: string;
  content: string | null;
  created_datetime_utc: string;
  is_featured: boolean;
  is_public: boolean | null;
  like_count: number;
};

export default async function CaptionsPage({ searchParams }: PageProps) {
  const supabase = await createSupabaseServerClient();
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const sort = parseCaptionSortMode(resolvedSearchParams?.sort);
  const featuredOnly = parseBooleanSearchParam(resolvedSearchParams?.featured);
  const publicOnly = parseBooleanSearchParam(resolvedSearchParams?.public);

  const buildCaptionQuery = () => {
    let query = supabase
      .from("captions")
      .select(
        "id, image_id, content, created_datetime_utc, is_featured, is_public, like_count"
      )
      .not("content", "is", null)
      .neq("content", "");

    if (featuredOnly) {
      query = query.eq("is_featured", true);
    }

    if (publicOnly) {
      query = query.eq("is_public", true);
    }

    return query;
  };

  let countQuery = supabase
    .from("captions")
    .select("id", { count: "exact", head: true })
    .not("content", "is", null)
    .neq("content", "");

  if (featuredOnly) {
    countQuery = countQuery.eq("is_featured", true);
  }

  if (publicOnly) {
    countQuery = countQuery.eq("is_public", true);
  }

  const { count: filteredCount, error: filteredCountError } = await countQuery;

  const totalPages = Math.max(
    1,
    Math.ceil((filteredCount ?? 0) / ADMIN_PAGE_SIZE)
  );
  const currentPage = clampPage(resolvedSearchParams?.page, totalPages);
  const rangeStart = (currentPage - 1) * ADMIN_PAGE_SIZE;
  const rangeEnd = rangeStart + ADMIN_PAGE_SIZE - 1;

  let captionsQuery = buildCaptionQuery();

  if (sort === "most-likes" || sort === "least-likes") {
    captionsQuery = captionsQuery.order("like_count", {
      ascending: sort === "least-likes",
    });
  }

  const { data: captions, error: captionsError } = await captionsQuery
    .order("created_datetime_utc", {
      ascending: sort === "asc" ? true : false,
    })
    .range(rangeStart, rangeEnd);

  const captionSourceRows = Array.isArray(captions)
    ? (captions as CaptionRow[])
    : [];
  const captionRows = captionSourceRows;

  const imageIds = Array.from(
    new Set(
      captionRows
        .map((caption) => caption.image_id)
        .filter((imageId): imageId is string => typeof imageId === "string")
    )
  );

  const { data: images, error: imagesError } = imageIds.length
    ? await supabase.from("images").select("id, url").in("id", imageIds)
    : { data: [], error: null };

  const imageRows = Array.isArray(images) ? images : [];
  const imagesById = new Map<string, string | null>();
  imageRows.forEach((image) => {
    imagesById.set(
      String(image.id),
      typeof image.url === "string" ? image.url : null
    );
  });

  const errorMessage =
    filteredCountError?.message ??
    captionsError?.message ??
    imagesError?.message;

  return (
    <div className="mx-auto w-full max-w-[1400px]">
      <header className="flex flex-col gap-6 lg:flex-row lg:items-start">
        <div className="min-w-0 flex-1">
          <p className="text-[0.7rem] uppercase tracking-[0.5em] text-orange-300/80 [font-family:var(--font-heading)]">
            Library
          </p>
          <h1 className="mt-3 text-[2.75rem] leading-none uppercase tracking-[0.18em] text-zinc-100 sm:text-[3.25rem] lg:text-[3.75rem] [font-family:var(--font-heading)]">
            Captions
          </h1>
          <p className="mt-4 max-w-2xl text-sm text-zinc-300/75">
            Review caption records alongside their associated images. Voting
            controls are intentionally omitted in the admin view.
          </p>
        </div>

        <div className="lg:ml-auto lg:self-start">
          <CaptionFilterControls
            sort={sort}
            featuredOnly={featuredOnly}
            publicOnly={publicOnly}
            options={CAPTION_SORT_OPTIONS}
          />
        </div>
      </header>

      <section className="mt-10">
        {errorMessage ? (
          <p className="text-sm text-rose-200/90">
            Failed to load captions: {errorMessage}
          </p>
        ) : captionRows.length === 0 ? (
          <p className="text-sm text-zinc-400/80">No captions found.</p>
        ) : (
          <>
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {captionRows.map((caption) => {
                const captionEntry: CaptionEntry = {
                  id:
                    typeof caption.id === "string" || typeof caption.id === "number"
                      ? caption.id
                      : undefined,
                  content:
                    typeof caption.content === "string" ? caption.content : null,
                };
                const imageUrl =
                  typeof caption.image_id === "string"
                    ? imagesById.get(caption.image_id) ?? null
                    : null;
                const likeCount =
                  typeof caption.like_count === "number"
                    ? caption.like_count
                    : 0;
                const likeTone =
                  likeCount > 0
                    ? "text-emerald-200 ring-emerald-400/40"
                    : likeCount < 0
                      ? "text-rose-200 ring-rose-400/40"
                      : "text-zinc-200 ring-white/15";
                const likeString = likeCount === 1 ? "Like" : "Likes";

                return (
                  <Card key={String(caption.id)} className="w-full">
                    <div
                      className={[
                        "absolute right-4 top-4 z-20 rounded-full bg-black/75 px-3 py-1.5 text-[0.62rem] uppercase tracking-[0.28em] ring-1 shadow-[0_10px_24px_rgba(0,0,0,0.35)]",
                        likeTone,
                      ].join(" ")}
                    >
                      {likeCount} {likeString}
                    </div>
                    {imageUrl ? (
                      <Card.Image src={imageUrl} alt="Caption image" />
                    ) : (
                      <div className="relative z-10 flex aspect-[16/9] w-full items-center justify-center bg-black text-xs uppercase tracking-[0.32em] text-zinc-500 sm:aspect-[7/4]">
                        Image unavailable
                      </div>
                    )}
                    <Card.Caption captions={[captionEntry]} />
                  </Card>
                );
              })}
            </div>

            <Pagination
              pathname="/captions"
              currentPage={currentPage}
              totalPages={totalPages}
              queryParams={{
                sort,
                featured: featuredOnly ? "true" : undefined,
                public: publicOnly ? "true" : undefined,
              }}
            />
          </>
        )}
      </section>
    </div>
  );
}
