import Pagination from "@/components/Pagination";
import ProfileFilterControls from "@/components/ProfileFilterControls";
import {
  ADMIN_PAGE_SIZE,
  clampPage,
  formatReadableDate,
  parseBooleanSearchParam,
  parseProfileSortMode,
} from "@/lib/admin/listing";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type PageProps = {
  searchParams?: Promise<{
    page?: string;
    sort?: string;
    superAdmin?: string;
    matrixAdmin?: string;
  }>;
};

export default async function UsersPage({ searchParams }: PageProps) {
  const supabase = await createSupabaseServerClient();
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const sort = parseProfileSortMode(resolvedSearchParams?.sort);
  const superAdminOnly = parseBooleanSearchParam(
    resolvedSearchParams?.superAdmin
  );
  const matrixAdminOnly = parseBooleanSearchParam(
    resolvedSearchParams?.matrixAdmin
  );

  let countQuery = supabase
    .from("profiles")
    .select("id", { count: "exact", head: true })
    .not("email", "is", null);

  if (superAdminOnly) {
    countQuery = countQuery.eq("is_superadmin", true);
  }

  if (matrixAdminOnly) {
    countQuery = countQuery.eq("is_matrix_admin", true);
  }

  const { count, error: countError } = await countQuery;

  const totalPages = Math.max(1, Math.ceil((count ?? 0) / ADMIN_PAGE_SIZE));
  const currentPage = clampPage(resolvedSearchParams?.page, totalPages);
  const rangeStart = (currentPage - 1) * ADMIN_PAGE_SIZE;
  const rangeEnd = rangeStart + ADMIN_PAGE_SIZE - 1;

  let profilesQuery = supabase
    .from("profiles")
    .select("*")
    .not("email", "is", null);

  if (superAdminOnly) {
    profilesQuery = profilesQuery.eq("is_superadmin", true);
  }

  if (matrixAdminOnly) {
    profilesQuery = profilesQuery.eq("is_matrix_admin", true);
  }

  const { data: profiles, error: profilesError } = await profilesQuery
    .order("created_datetime_utc", { ascending: sort === "asc" })
    .range(rangeStart, rangeEnd);

  const profileRows = Array.isArray(profiles) ? profiles : [];
  const errorMessage = countError?.message ?? profilesError?.message;

  return (
    <div className="mx-auto w-full max-w-[1200px]">
      <header className="flex flex-col gap-6 lg:flex-row lg:items-start">
        <div className="min-w-0 flex-1">
          <p className="text-[0.7rem] uppercase tracking-[0.5em] text-orange-300/80 [font-family:var(--font-heading)]">
            Directory
          </p>
          <h1 className="mt-3 text-[2.75rem] leading-none uppercase tracking-[0.18em] text-zinc-100 sm:text-[3.25rem] lg:text-[3.75rem] [font-family:var(--font-heading)]">
            Users
          </h1>
          <p className="mt-4 max-w-2xl text-sm text-zinc-300/75">
            Inspect profile records and expand each row to review core user
            details.
          </p>
        </div>

        <div className="lg:ml-auto lg:self-start">
          <ProfileFilterControls
            sort={sort}
            superAdminOnly={superAdminOnly}
            matrixAdminOnly={matrixAdminOnly}
          />
        </div>
      </header>

      <section className="mt-10">
        {errorMessage ? (
          <p className="text-sm text-rose-200/90">
            Failed to load users: {errorMessage}
          </p>
        ) : profileRows.length === 0 ? (
          <p className="text-sm text-zinc-400/80">No users found.</p>
        ) : (
          <>
            <div className="space-y-4">
              {profileRows.map((profile) => {
                const row = profile as Record<string, unknown>;
                const email =
                  typeof row.email === "string" && row.email.trim().length > 0
                    ? row.email
                    : "N/A";
                const firstName =
                  typeof row.first_name === "string" &&
                  row.first_name.trim().length > 0
                    ? row.first_name
                    : "N/A";
                const lastName =
                  typeof row.last_name === "string" &&
                  row.last_name.trim().length > 0
                    ? row.last_name
                    : "N/A";
                const createdAt =
                  typeof row.created_datetime_utc === "string"
                    ? row.created_datetime_utc
                    : null;
                const isSuperadmin = row.is_superadmin === true;
                const isMatrixAdmin = row.is_matrix_admin === true;

                return (
                  <details
                    key={String(row.id)}
                    className="overflow-hidden rounded-2xl border border-white/10 bg-[#15151b]/85 shadow-[0_18px_40px_rgba(0,0,0,0.55)]"
                  >
                    <summary className="flex cursor-pointer list-none flex-wrap items-center justify-between gap-4 px-6 py-5 text-sm text-zinc-100 marker:hidden">
                      <span className="flex flex-wrap items-center gap-3">
                        <span className="font-medium tracking-[0.04em]">{email}</span>
                        {isSuperadmin ? (
                          <span className="rounded-full bg-orange-500/15 px-3 py-1 text-[0.6rem] font-semibold uppercase tracking-[0.28em] text-orange-200 ring-1 ring-orange-400/40">
                            Super Admin
                          </span>
                        ) : null}
                        {isMatrixAdmin ? (
                          <span className="rounded-full bg-cyan-500/15 px-3 py-1 text-[0.6rem] font-semibold uppercase tracking-[0.28em] text-cyan-200 ring-1 ring-cyan-400/40">
                            Matrix Admin
                          </span>
                        ) : null}
                      </span>
                      <span className="text-[0.65rem] uppercase tracking-[0.28em] text-zinc-400/80">
                        Created {formatReadableDate(createdAt)}
                      </span>
                    </summary>

                    <div className="grid gap-4 border-t border-white/10 bg-black/20 px-6 py-5 text-sm text-zinc-300/85 sm:grid-cols-3">
                      <div>
                        <p className="text-[0.65rem] uppercase tracking-[0.28em] text-zinc-500">
                          First Name
                        </p>
                        <p className="mt-2 text-zinc-100">{firstName}</p>
                      </div>

                      <div>
                        <p className="text-[0.65rem] uppercase tracking-[0.28em] text-zinc-500">
                          Last Name
                        </p>
                        <p className="mt-2 text-zinc-100">{lastName}</p>
                      </div>

                      <div>
                        <p className="text-[0.65rem] uppercase tracking-[0.28em] text-zinc-500">
                          Account Created
                        </p>
                        <p className="mt-2 text-zinc-100">
                          {formatReadableDate(createdAt)}
                        </p>
                      </div>
                    </div>
                  </details>
                );
              })}
            </div>

            <Pagination
              pathname="/users"
              currentPage={currentPage}
              totalPages={totalPages}
              queryParams={{
                sort,
                superAdmin: superAdminOnly ? "true" : undefined,
                matrixAdmin: matrixAdminOnly ? "true" : undefined,
              }}
            />
          </>
        )}
      </section>
    </div>
  );
}
