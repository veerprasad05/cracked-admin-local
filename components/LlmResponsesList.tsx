"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";

type LlmResponseRow = {
  id: string;
  created_datetime_utc: string;
  llm_model_id: number;
  model_name: string;
  profile_id: string;
  processing_time_seconds: number | null;
  llm_user_prompt: string | null;
  llm_system_prompt: string | null;
  llm_model_response: string | null;
  llm_prompt_chain_id: number | null;
};

type LlmResponsesListProps = {
  rows: LlmResponseRow[];
};

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export default function LlmResponsesList({ rows }: LlmResponsesListProps) {
  const [openRows, setOpenRows] = React.useState<Record<string, boolean>>({});

  const toggleRow = (rowId: string) => {
    setOpenRows((current) => ({
      ...current,
      [rowId]: !current[rowId],
    }));
  };

  return (
    <div className="space-y-4">
      {rows.map((row) => {
        const isOpen = openRows[row.id] === true;

        return (
          <div
            key={row.id}
            className="rounded-[2rem] border border-white/10 bg-[#15151b]/85 p-5 shadow-[0_18px_40px_rgba(0,0,0,0.55)]"
          >
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
              <div>
                <p className="text-[0.65rem] uppercase tracking-[0.28em] text-zinc-500">
                  Created
                </p>
                <p className="mt-2 text-sm text-zinc-100">
                  {formatDate(row.created_datetime_utc)}
                </p>
              </div>
              <div>
                <p className="text-[0.65rem] uppercase tracking-[0.28em] text-zinc-500">
                  Model
                </p>
                <p className="mt-2 text-sm text-zinc-100">{row.model_name}</p>
              </div>
              <div>
                <p className="text-[0.65rem] uppercase tracking-[0.28em] text-zinc-500">
                  Model ID
                </p>
                <p className="mt-2 text-sm text-zinc-100">{row.llm_model_id}</p>
              </div>
              <div>
                <p className="text-[0.65rem] uppercase tracking-[0.28em] text-zinc-500">
                  Prompt Chain ID
                </p>
                <p className="mt-2 text-sm text-zinc-100">
                  {row.llm_prompt_chain_id ?? "N/A"}
                </p>
              </div>
              <div>
                <p className="text-[0.65rem] uppercase tracking-[0.28em] text-zinc-500">
                  Processing Time
                </p>
                <p className="mt-2 text-sm text-zinc-100">
                  {row.processing_time_seconds ?? "N/A"}
                </p>
              </div>
            </div>

            <div className="mt-4">
              <p className="text-[0.65rem] uppercase tracking-[0.28em] text-zinc-500">
                Profile ID
              </p>
              <p className="mt-2 break-all text-sm text-zinc-100">
                {row.profile_id}
              </p>
            </div>

            <div className="mt-4">
              <p className="text-[0.65rem] uppercase tracking-[0.28em] text-zinc-500">
                Response
              </p>
              <p className="mt-2 whitespace-pre-wrap break-words text-sm text-zinc-100">
                {row.llm_model_response ?? "N/A"}
              </p>
            </div>

            <div className="mt-5 border-t border-white/10 pt-4">
              <button
                type="button"
                onClick={() => toggleRow(row.id)}
                className="inline-flex items-center gap-3 rounded-xl bg-black/40 px-4 py-3 text-[0.65rem] uppercase tracking-[0.28em] text-zinc-300/80 ring-1 ring-white/10 transition hover:bg-black/60 hover:text-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400/60"
                aria-expanded={isOpen}
              >
                <ChevronDown
                  className={[
                    "h-4 w-4 transition-transform",
                    isOpen ? "rotate-180 text-orange-200" : "",
                  ].join(" ")}
                />
                <span>{isOpen ? "Hide Prompts" : "Show Prompts"}</span>
              </button>
            </div>

            {isOpen ? (
              <div className="mt-4 grid gap-4 lg:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
                  <p className="text-[0.65rem] uppercase tracking-[0.28em] text-zinc-500">
                    User Prompt
                  </p>
                  <p className="mt-2 whitespace-pre-wrap break-words text-sm text-zinc-100">
                    {row.llm_user_prompt ?? "N/A"}
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
                  <p className="text-[0.65rem] uppercase tracking-[0.28em] text-zinc-500">
                    System Prompt
                  </p>
                  <p className="mt-2 whitespace-pre-wrap break-words text-sm text-zinc-100">
                    {row.llm_system_prompt ?? "N/A"}
                  </p>
                </div>
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
