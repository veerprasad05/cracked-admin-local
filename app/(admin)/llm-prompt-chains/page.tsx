import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function LlmPromptChainsPage() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("llm_prompt_chains")
    .select("*")
    .order("created_datetime_utc", { ascending: false });

  const rows = Array.isArray(data) ? data : [];

  return (
    <div className="mx-auto w-full max-w-[1200px]">
      <header>
        <p className="text-[0.7rem] uppercase tracking-[0.5em] text-orange-300/80 [font-family:var(--font-heading)]">
          LLMs
        </p>
        <h1 className="mt-3 text-[2.75rem] leading-none uppercase tracking-[0.18em] text-zinc-100 sm:text-[3.25rem] lg:text-[3.75rem] [font-family:var(--font-heading)]">
          Prompt Chains
        </h1>
      </header>

      <section className="mt-10">
        {error ? (
          <p className="text-sm text-rose-200/90">
            Failed to load prompt chains: {error.message}
          </p>
        ) : rows.length === 0 ? (
          <p className="text-sm text-zinc-400/80">No prompt chains found.</p>
        ) : (
          <div className="space-y-4">
            {rows.map((row) => (
              <div
                key={String(row.id)}
                className="rounded-[2rem] border border-white/10 bg-[#15151b]/85 p-5 shadow-[0_18px_40px_rgba(0,0,0,0.55)]"
              >
                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <p className="text-[0.65rem] uppercase tracking-[0.28em] text-zinc-500">
                      Chain ID
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
                      Caption Request ID
                    </p>
                    <p className="mt-2 text-sm text-zinc-100">
                      {String(row.caption_request_id)}
                    </p>
                  </div>
                </div>

                <div className="mt-4 border-t border-white/10 pt-4">
                  <p className="text-sm text-zinc-300/80">
                    This prompt chain belongs to caption request{" "}
                    <span className="text-zinc-100">{String(row.caption_request_id)}</span>.
                  </p>

                  <Link
                    href={`/llm-responses?promptChainId=${row.id}`}
                    className="mt-4 inline-flex items-center gap-2 rounded-xl bg-orange-500/15 px-4 py-3 text-[0.65rem] uppercase tracking-[0.28em] text-orange-200 ring-2 ring-orange-400/50 shadow-[0_0_24px_rgba(255,120,0,0.2)] transition-colors hover:bg-orange-500/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400/60"
                  >
                    <span>View Responses</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
