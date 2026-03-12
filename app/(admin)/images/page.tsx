import ImageFilterControls from "@/components/ImageFilterControls";
import ImageUploadModal from "@/components/ImageUploadModal";
import ImagesGrid from "@/components/ImagesGrid";
import Pagination from "@/components/Pagination";
import {
  ADMIN_PAGE_SIZE,
  clampPage,
  dedupeImagesByUrl,
  parseBooleanSearchParam,
  parseImageSortMode,
} from "@/lib/admin/listing";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type PageProps = {
  searchParams?: Promise<{
    page?: string;
    sort?: string;
    public?: string;
    commonUse?: string;
  }>;
};

export default async function ImagesPage({ searchParams }: PageProps) {
  const supabase = await createSupabaseServerClient();
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const sort = parseImageSortMode(resolvedSearchParams?.sort);
  const publicOnly = parseBooleanSearchParam(resolvedSearchParams?.public);
  const commonUseOnly = parseBooleanSearchParam(
    resolvedSearchParams?.commonUse
  );

  let imagesQuery = supabase
    .from("images")
    .select("id, url, created_datetime_utc, is_public, is_common_use");

  if (publicOnly) {
    imagesQuery = imagesQuery.eq("is_public", true);
  }

  if (commonUseOnly) {
    imagesQuery = imagesQuery.eq("is_common_use", true);
  }

  const { data: images, error: imagesError } = await imagesQuery.order(
    "created_datetime_utc",
    { ascending: sort === "asc" }
  );

  const dedupedImages = Array.isArray(images)
    ? images.map((image) => ({
        id: String(image.id),
        url: typeof image.url === "string" ? image.url : null,
        isPublic: image.is_public === true,
        isCommonUse: image.is_common_use === true,
      }))
    : [];
  const uniqueImageRows = dedupeImagesByUrl(dedupedImages);
  const totalPages = Math.max(
    1,
    Math.ceil(uniqueImageRows.length / ADMIN_PAGE_SIZE)
  );
  const currentPage = clampPage(resolvedSearchParams?.page, totalPages);
  const rangeStart = (currentPage - 1) * ADMIN_PAGE_SIZE;
  const rangeEnd = rangeStart + ADMIN_PAGE_SIZE;
  const imageRows = uniqueImageRows.slice(rangeStart, rangeEnd);

  const errorMessage = imagesError?.message;

  return (
    <div className="mx-auto w-full max-w-[1400px]">
      <header className="flex flex-col gap-6 lg:flex-row lg:items-start">
        <div className="min-w-0 flex-1">
          <p className="text-[0.7rem] uppercase tracking-[0.5em] text-orange-300/80 [font-family:var(--font-heading)]">
            Asset Manager
          </p>
          <h1 className="mt-3 text-[2.75rem] leading-none uppercase tracking-[0.18em] text-zinc-100 sm:text-[3.25rem] lg:text-[3.75rem] [font-family:var(--font-heading)]">
            Images
          </h1>
          <p className="mt-4 max-w-2xl text-sm text-zinc-300/75">
            Browse the images table, upload new assets, and delete records that
            should no longer remain in the admin dataset.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 lg:ml-auto lg:self-start">
          <ImageFilterControls
            sort={sort}
            publicOnly={publicOnly}
            commonUseOnly={commonUseOnly}
          />
          <ImageUploadModal />
        </div>
      </header>

      <section className="mt-10">
        {errorMessage ? (
          <p className="text-sm text-rose-200/90">
            Failed to load images: {errorMessage}
          </p>
        ) : imageRows.length === 0 ? (
          <p className="text-sm text-zinc-400/80">No images found.</p>
        ) : (
          <>
            <ImagesGrid images={imageRows} />
            <Pagination
              pathname="/images"
              currentPage={currentPage}
              totalPages={totalPages}
              queryParams={{
                sort,
                public: publicOnly ? "true" : undefined,
                commonUse: commonUseOnly ? "true" : undefined,
              }}
            />
          </>
        )}
      </section>
    </div>
  );
}
