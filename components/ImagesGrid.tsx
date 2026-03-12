"use client";

import { startTransition } from "react";
import { useState } from "react";
import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/Card";
import ImageEditModal from "@/components/ImageEditModal";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type ImageRecord = {
  id: string;
  url: string | null;
  isPublic: boolean;
  isCommonUse: boolean;
};

type ImagesGridProps = {
  images: ImageRecord[];
};

export default function ImagesGrid({ images }: ImagesGridProps) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete(imageId: string) {
    const confirmed = window.confirm(
      "Delete this image record from the images table?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(imageId);
      setError(null);

      const supabase = createSupabaseBrowserClient();
      const { error: deleteError } = await supabase
        .from("images")
        .delete()
        .eq("id", imageId);

      if (deleteError) {
        throw new Error(deleteError.message);
      }

      startTransition(() => {
        router.refresh();
      });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to delete image.";
      setError(message);
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <>
      {error ? <p className="mb-6 text-sm text-rose-200/90">{error}</p> : null}

      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {images.map((image) => (
          <Card key={image.id} className="w-full">
            <div className="absolute right-4 top-4 z-20 flex items-center gap-2">
              <ImageEditModal
                imageId={image.id}
                isPublic={image.isPublic}
                isCommonUse={image.isCommonUse}
              />
              <button
                type="button"
                onClick={() => handleDelete(image.id)}
                disabled={deletingId === image.id}
                className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-black/70 text-red-300 ring-1 ring-red-400/40 transition hover:bg-red-500/15 hover:text-red-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400/70 disabled:cursor-not-allowed disabled:opacity-60"
                aria-label="Delete image"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </div>

            {image.url ? (
              <Card.Image src={image.url} alt="Uploaded image" />
            ) : (
              <div className="relative z-10 flex aspect-[16/9] w-full items-center justify-center bg-black text-xs uppercase tracking-[0.32em] text-zinc-500 sm:aspect-[7/4]">
                Image unavailable
              </div>
            )}

            {image.isPublic || image.isCommonUse ? (
              <div className="absolute left-4 top-4 z-20 flex flex-wrap gap-2">
                {image.isPublic ? (
                  <span className="rounded-full bg-black/75 px-3 py-1.5 text-[0.62rem] uppercase tracking-[0.28em] text-orange-100 ring-1 ring-orange-400/40 shadow-[0_10px_24px_rgba(0,0,0,0.35)]">
                    Public
                  </span>
                ) : null}
                {image.isCommonUse ? (
                  <span className="rounded-full bg-black/75 px-3 py-1.5 text-[0.62rem] uppercase tracking-[0.28em] text-cyan-100 ring-1 ring-cyan-400/40 shadow-[0_10px_24px_rgba(0,0,0,0.35)]">
                    Common Use
                  </span>
                ) : null}
              </div>
            ) : null}
          </Card>
        ))}
      </div>
    </>
  );
}
