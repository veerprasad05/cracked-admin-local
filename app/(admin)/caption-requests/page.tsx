import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function CaptionRequestsPage() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("caption_requests")
    .select("*")
    .order("created_datetime_utc", { ascending: false });

  const rows = Array.isArray(data) ? data : [];

  return (
    <div className="mx-auto w-full max-w-[1400px]">
      <header>
        <p className="text-[0.7rem] uppercase tracking-[0.5em] text-orange-300/80 [font-family:var(--font-heading)]">
          Captions
        </p>
        <h1 className="mt-3 text-[2.75rem] leading-none uppercase tracking-[0.18em] text-zinc-100 sm:text-[3.25rem] lg:text-[3.75rem] [font-family:var(--font-heading)]">
          Caption Requests
        </h1>
        <p className="mt-4 max-w-2xl text-sm text-zinc-300/75">
          Read-only request history for caption generation.
        </p>
      </header>

      <section className="mt-10">
        {error ? (
          <p className="text-sm text-rose-200/90">
            Failed to load caption requests: {error.message}
          </p>
        ) : rows.length === 0 ? (
          <p className="text-sm text-zinc-400/80">No caption requests found.</p>
        ) : (
          <div className="space-y-4">
            {rows.map((row) => (
              <div
                key={String(row.id)}
                className="rounded-[2rem] border border-white/10 bg-[#15151b]/85 p-5 shadow-[0_18px_40px_rgba(0,0,0,0.55)]"
              >
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  <div>
                    <p className="text-[0.65rem] uppercase tracking-[0.28em] text-zinc-500">
                      Request ID
                    </p>
                    <p className="mt-2 text-sm text-zinc-100">{String(row.id)}</p>
                  </div>
                  <div>
                    <p className="text-[0.65rem] uppercase tracking-[0.28em] text-zinc-500">
                      Created
                    </p>
                    <p className="mt-2 text-sm text-zinc-100">
                      {String(row.created_datetime_utc)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[0.65rem] uppercase tracking-[0.28em] text-zinc-500">
                      Profile ID
                    </p>
                    <p className="mt-2 break-all text-sm text-zinc-100">
                      {String(row.profile_id)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[0.65rem] uppercase tracking-[0.28em] text-zinc-500">
                      Image ID
                    </p>
                    <p className="mt-2 break-all text-sm text-zinc-100">
                      {String(row.image_id)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
