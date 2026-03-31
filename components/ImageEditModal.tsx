"use client";

import * as React from "react";
import { startTransition } from "react";
import { Pencil, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import {
  applyUpdateAuditFields,
  getAuthenticatedUserId,
} from "@/lib/supabase/audit";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type ImageEditModalProps = {
  imageId: string;
  isPublic: boolean;
  isCommonUse: boolean;
};

export default function ImageEditModal({
  imageId,
  isPublic,
  isCommonUse,
}: ImageEditModalProps) {
  const router = useRouter();
  const [isMounted, setIsMounted] = React.useState(false);
  const [isOpen, setIsOpen] = React.useState(false);
  const [nextIsPublic, setNextIsPublic] = React.useState(isPublic);
  const [nextIsCommonUse, setNextIsCommonUse] = React.useState(isCommonUse);
  const [error, setError] = React.useState<string | null>(null);
  const [isWorking, setIsWorking] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  React.useEffect(() => {
    if (!isOpen) {
      setNextIsPublic(isPublic);
      setNextIsCommonUse(isCommonUse);
      setError(null);
    }
  }, [isCommonUse, isOpen, isPublic]);

  const closeModal = () => {
    if (isWorking) {
      return;
    }

    setIsOpen(false);
    setError(null);
  };

  const handleSave = async () => {
    try {
      setIsWorking(true);
      setError(null);

      const supabase = createSupabaseBrowserClient();
      const timestamp = new Date().toISOString();
      const userId = await getAuthenticatedUserId(supabase);
      const payload = applyUpdateAuditFields(
        {
          is_public: nextIsPublic,
          is_common_use: nextIsCommonUse,
        },
        {
          modifiedAtField: "modified_datetime_utc",
          timestamp,
          userId,
        }
      );
      const { error: updateError } = await supabase
        .from("images")
        .update(payload)
        .eq("id", imageId);

      if (updateError) {
        throw new Error(updateError.message);
      }

      setIsOpen(false);
      startTransition(() => {
        router.refresh();
      });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to update image.";
      setError(message);
    } finally {
      setIsWorking(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-black/70 text-orange-200 ring-1 ring-orange-400/40 transition hover:bg-orange-500/15 hover:text-orange-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400/70"
        aria-label="Edit image flags"
      >
        <Pencil className="h-5 w-5" />
      </button>

      {isMounted && isOpen
        ? createPortal(
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-6 py-8 backdrop-blur-sm">
              <div className="w-full max-w-lg rounded-[2rem] border border-white/10 bg-[#15151b]/95 p-6 shadow-[0_24px_70px_rgba(0,0,0,0.7)]">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[0.7rem] uppercase tracking-[0.5em] text-orange-300/80 [font-family:var(--font-heading)]">
                      Images
                    </p>
                    <h2 className="mt-3 text-3xl uppercase tracking-[0.16em] text-zinc-100 [font-family:var(--font-heading)]">
                      Edit Image
                    </h2>
                  </div>

                  <button
                    type="button"
                    onClick={closeModal}
                    disabled={isWorking}
                    className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-black/40 text-zinc-300 ring-1 ring-white/10 transition hover:bg-black/60 hover:text-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400/60 disabled:cursor-not-allowed disabled:opacity-60"
                    aria-label="Close edit modal"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <p className="mt-4 max-w-lg text-sm text-zinc-300/75">
                  Toggle the image visibility flags for this row. Saving updates
                  `is_public`, `is_common_use`, `modified_datetime_utc`, and
                  `modified_by_user_id`.
                </p>

                <div className="mt-6 space-y-4 rounded-2xl border border-white/10 bg-black/30 p-5">
                  <button
                    type="button"
                    onClick={() => setNextIsPublic((value) => !value)}
                    aria-pressed={nextIsPublic}
                    className={[
                      "flex w-full items-center justify-between rounded-2xl px-4 py-4 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400/60",
                      nextIsPublic
                        ? "bg-orange-500/15 text-orange-100 ring-2 ring-orange-400/50"
                        : "bg-black/40 text-zinc-300 ring-1 ring-white/10 hover:bg-black/60 hover:text-zinc-100",
                    ].join(" ")}
                  >
                    <span>
                      <span className="block text-[0.65rem] uppercase tracking-[0.28em] text-zinc-400">
                        Flag
                      </span>
                      <span className="mt-2 block text-sm uppercase tracking-[0.18em]">
                        Public
                      </span>
                    </span>
                    <span className="text-[0.65rem] uppercase tracking-[0.28em]">
                      {nextIsPublic ? "On" : "Off"}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setNextIsCommonUse((value) => !value)}
                    aria-pressed={nextIsCommonUse}
                    className={[
                      "flex w-full items-center justify-between rounded-2xl px-4 py-4 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400/60",
                      nextIsCommonUse
                        ? "bg-orange-500/15 text-orange-100 ring-2 ring-orange-400/50"
                        : "bg-black/40 text-zinc-300 ring-1 ring-white/10 hover:bg-black/60 hover:text-zinc-100",
                    ].join(" ")}
                  >
                    <span>
                      <span className="block text-[0.65rem] uppercase tracking-[0.28em] text-zinc-400">
                        Flag
                      </span>
                      <span className="mt-2 block text-sm uppercase tracking-[0.18em]">
                        Common Use
                      </span>
                    </span>
                    <span className="text-[0.65rem] uppercase tracking-[0.28em]">
                      {nextIsCommonUse ? "On" : "Off"}
                    </span>
                  </button>

                  {error ? (
                    <p className="text-sm text-rose-200/90">{error}</p>
                  ) : null}

                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={closeModal}
                      disabled={isWorking}
                      className="rounded-xl bg-black/40 px-4 py-3 text-[0.7rem] uppercase tracking-[0.32em] text-zinc-300/80 ring-1 ring-white/10 transition-colors hover:bg-black/60 hover:text-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400/50 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSave}
                      disabled={isWorking}
                      className="rounded-xl bg-orange-500/15 px-4 py-3 text-[0.7rem] uppercase tracking-[0.32em] text-orange-200 ring-2 ring-orange-400/50 shadow-[0_0_24px_rgba(255,120,0,0.2)] transition-colors hover:bg-orange-500/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400/60 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isWorking ? "Saving..." : "Save"}
                    </button>
                  </div>
                </div>
              </div>
            </div>,
            document.body
          )
        : null}
    </>
  );
}
