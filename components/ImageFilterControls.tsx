"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import SortDropdown from "@/components/SortDropdown";
import type { ImageSortMode } from "@/lib/admin/listing";
import { IMAGE_SORT_OPTIONS } from "@/lib/admin/listing";

type ImageFilterControlsProps = {
  sort: ImageSortMode;
  publicOnly: boolean;
  commonUseOnly: boolean;
};

export default function ImageFilterControls({
  sort,
  publicOnly,
  commonUseOnly,
}: ImageFilterControlsProps) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const pushParams = (updates: Record<string, string | undefined>) => {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(updates).forEach(([key, value]) => {
      if (typeof value === "string" && value.length > 0) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });

    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
  };

  const toggleFlag = (key: "public" | "commonUse", enabled: boolean) => {
    pushParams({ [key]: enabled ? undefined : "true" });
  };

  return (
    <div className="flex flex-wrap items-center gap-3 sm:flex-nowrap lg:justify-end">
      <SortDropdown value={sort} options={IMAGE_SORT_OPTIONS} />

      <button
        type="button"
        onClick={() => toggleFlag("public", publicOnly)}
        aria-pressed={publicOnly}
        className={[
          "rounded-2xl px-4 py-3 text-[0.65rem] uppercase tracking-[0.28em] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400/60",
          publicOnly
            ? "bg-orange-500/15 text-orange-200 ring-2 ring-orange-400/50 shadow-[0_0_24px_rgba(255,120,0,0.2)]"
            : "bg-black/40 text-zinc-300/80 ring-1 ring-white/10 hover:bg-black/60 hover:text-zinc-100",
        ].join(" ")}
      >
        Public Only
      </button>

      <button
        type="button"
        onClick={() => toggleFlag("commonUse", commonUseOnly)}
        aria-pressed={commonUseOnly}
        className={[
          "rounded-2xl px-4 py-3 text-[0.65rem] uppercase tracking-[0.28em] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400/60",
          commonUseOnly
            ? "bg-orange-500/15 text-orange-200 ring-2 ring-orange-400/50 shadow-[0_0_24px_rgba(255,120,0,0.2)]"
            : "bg-black/40 text-zinc-300/80 ring-1 ring-white/10 hover:bg-black/60 hover:text-zinc-100",
        ].join(" ")}
      >
        Common Use Only
      </button>
    </div>
  );
}
