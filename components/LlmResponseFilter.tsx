"use client";

import * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

type LlmResponseFilterProps = {
  modelValue: string;
  promptChainValue: string;
  modelOptions: Array<{ value: string; label: string }>;
};

export default function LlmResponseFilter({
  modelValue,
  promptChainValue,
  modelOptions,
}: LlmResponseFilterProps) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedModel, setSelectedModel] = React.useState(modelValue);
  const [selectedPromptChain, setSelectedPromptChain] =
    React.useState(promptChainValue);

  React.useEffect(() => {
    setSelectedModel(modelValue);
  }, [modelValue]);

  React.useEffect(() => {
    setSelectedPromptChain(promptChainValue);
  }, [promptChainValue]);

  const applyFilters = () => {
    const params = new URLSearchParams(searchParams.toString());

    if (selectedModel.length > 0) {
      params.set("model", selectedModel);
    } else {
      params.delete("model");
    }

    if (selectedPromptChain.trim().length > 0) {
      params.set("promptChainId", selectedPromptChain.trim());
    } else {
      params.delete("promptChainId");
    }

    const nextUrl = params.toString().length > 0 ? `${pathname}?${params}` : pathname;
    router.push(nextUrl);
  };

  return (
    <div className="flex flex-wrap items-center gap-3 lg:justify-end">
      <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-[0.65rem] uppercase tracking-[0.28em] text-zinc-300/80 shadow-[0_12px_28px_rgba(0,0,0,0.45)]">
        <span>Model</span>
        <select
          value={selectedModel}
          onChange={(event) => setSelectedModel(event.target.value)}
          className="rounded-xl border border-white/10 bg-[#101016] px-3 py-2 text-[0.65rem] uppercase tracking-[0.28em] text-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400/60"
        >
          {modelOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>

      <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-[0.65rem] uppercase tracking-[0.28em] text-zinc-300/80 shadow-[0_12px_28px_rgba(0,0,0,0.45)]">
        <span>Prompt Chain</span>
        <input
          type="number"
          min="1"
          step="1"
          value={selectedPromptChain}
          onChange={(event) => setSelectedPromptChain(event.target.value)}
          className="w-32 rounded-xl border border-white/10 bg-[#101016] px-3 py-2 text-[0.65rem] uppercase tracking-[0.28em] text-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400/60"
          placeholder="Any"
        />
      </label>

      <button
        type="button"
        onClick={applyFilters}
        className="rounded-2xl bg-orange-500/15 px-4 py-3 text-[0.65rem] uppercase tracking-[0.28em] text-orange-200 ring-2 ring-orange-400/50 shadow-[0_0_24px_rgba(255,120,0,0.2)] transition-colors hover:bg-orange-500/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400/60"
      >
        Apply
      </button>
    </div>
  );
}
