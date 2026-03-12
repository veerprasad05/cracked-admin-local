"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";

type HumorFlavorStep = {
  id: number;
  order_by: number;
  llm_model_name: string;
  llm_input_type_name: string;
  llm_output_type_name: string;
  description: string | null;
  llm_user_prompt: string | null;
  llm_system_prompt: string;
};

type HumorFlavor = {
  id: number;
  slug: string;
  description: string | null;
  steps: HumorFlavorStep[];
};

type HumorFlavorListProps = {
  flavors: HumorFlavor[];
};

export default function HumorFlavorList({ flavors }: HumorFlavorListProps) {
  const [openSteps, setOpenSteps] = React.useState<Record<string, boolean>>({});

  const toggleStep = (stepId: number) => {
    setOpenSteps((current) => ({
      ...current,
      [String(stepId)]: !current[String(stepId)],
    }));
  };

  return (
    <div className="space-y-6">
      {flavors.map((flavor) => (
        <div
          key={String(flavor.id)}
          className="rounded-[2rem] border border-white/10 bg-[#15151b]/85 p-6 shadow-[0_18px_40px_rgba(0,0,0,0.55)]"
        >
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-[0.65rem] uppercase tracking-[0.28em] text-zinc-500">
                Slug
              </p>
              <h2 className="mt-2 text-2xl uppercase tracking-[0.16em] text-zinc-100 [font-family:var(--font-heading)]">
                {flavor.slug}
              </h2>
            </div>
            <p className="max-w-2xl text-sm text-zinc-300/80">
              {flavor.description ?? "No description."}
            </p>
          </div>

          <div className="mt-6 space-y-4">
            {flavor.steps.length === 0 ? (
              <p className="text-sm text-zinc-400/80">No steps found.</p>
            ) : (
              flavor.steps.map((step) => {
                const isOpen = openSteps[String(step.id)] === true;

                return (
                  <div
                    key={String(step.id)}
                    className="relative mt-8 rounded-2xl border border-white/10 bg-black/30 p-4 pt-10"
                  >
                    <div className="absolute -left-4 -top-4 inline-flex h-10 w-10 items-center justify-center rounded-full border border-orange-400/60 bg-[#15151b] text-sm font-semibold text-orange-200 shadow-[0_0_18px_rgba(255,120,0,0.18)]">
                      {step.order_by}
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                      <div>
                        <p className="text-[0.65rem] uppercase tracking-[0.28em] text-zinc-500">
                          Model
                        </p>
                        <p className="mt-2 text-sm text-zinc-100">
                          {step.llm_model_name}
                        </p>
                      </div>
                      <div>
                        <p className="text-[0.65rem] uppercase tracking-[0.28em] text-zinc-500">
                          Input Type
                        </p>
                        <p className="mt-2 text-sm text-zinc-100">
                          {step.llm_input_type_name}
                        </p>
                      </div>
                      <div>
                        <p className="text-[0.65rem] uppercase tracking-[0.28em] text-zinc-500">
                          Output Type
                        </p>
                        <p className="mt-2 text-sm text-zinc-100">
                          {step.llm_output_type_name}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4">
                      <p className="text-[0.65rem] uppercase tracking-[0.28em] text-zinc-500">
                        Description
                      </p>
                      <p className="mt-2 whitespace-pre-wrap break-words text-sm text-zinc-100">
                        {step.description ?? "No description."}
                      </p>
                    </div>

                    <div className="mt-5 border-t border-white/10 pt-4">
                      <button
                        type="button"
                        onClick={() => toggleStep(step.id)}
                        className="inline-flex items-center gap-3 rounded-xl bg-black/40 px-4 py-3 text-[0.65rem] uppercase tracking-[0.28em] text-zinc-300/80 ring-1 ring-white/10 transition hover:bg-black/60 hover:text-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400/60"
                        aria-expanded={isOpen}
                      >
                        <ChevronDown
                          className={[
                            "h-4 w-4 transition-transform",
                            isOpen ? "rotate-180 text-orange-200" : "",
                          ].join(" ")}
                        />
                        <span>{isOpen ? "Hide Prompts" : "View Prompts"}</span>
                      </button>
                    </div>

                    {isOpen ? (
                      <div className="mt-4 grid gap-4 lg:grid-cols-2">
                        <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                          <p className="text-[0.65rem] uppercase tracking-[0.28em] text-zinc-500">
                            User Prompt
                          </p>
                          <p className="mt-2 whitespace-pre-wrap break-words text-sm text-zinc-100">
                            {step.llm_user_prompt ?? "No user prompt."}
                          </p>
                        </div>

                        <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                          <p className="text-[0.65rem] uppercase tracking-[0.28em] text-zinc-500">
                            System Prompt
                          </p>
                          <p className="mt-2 whitespace-pre-wrap break-words text-sm text-zinc-100">
                            {step.llm_system_prompt}
                          </p>
                        </div>
                      </div>
                    ) : null}
                  </div>
                );
              })
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
