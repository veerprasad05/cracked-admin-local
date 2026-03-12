"use client";

import * as React from "react";
import { startTransition } from "react";
import { Plus, Upload, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import {
  generatePresignedUrl,
  registerImageUrl,
  uploadImageToPresignedUrl,
} from "@/lib/image-pipeline";
import { ACCEPT_ATTR, resolveContentType } from "@/lib/image-upload";

export default function ImageUploadModal() {
  const router = useRouter();
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);
  const [isOpen, setIsOpen] = React.useState(false);
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);
  const [fileName, setFileName] = React.useState<string | null>(null);
  const [status, setStatus] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [isWorking, setIsWorking] = React.useState(false);

  React.useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const resetState = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setPreviewUrl(null);
    setFileName(null);
    setStatus(null);
    setError(null);
  };

  const closeModal = () => {
    if (isWorking) {
      return;
    }

    setIsOpen(false);
    resetState();
  };

  const handlePickImage = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) {
      return;
    }

    setError(null);
    setStatus(null);

    const contentType = resolveContentType(file);

    if (!contentType) {
      setError(
        "Unsupported file type. Please upload jpeg, jpg, png, webp, gif, or heic."
      );
      return;
    }

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    const nextPreviewUrl = URL.createObjectURL(file);
    setPreviewUrl(nextPreviewUrl);
    setFileName(file.name);

    try {
      setIsWorking(true);
      setStatus("Checking authentication...");

      const supabase = createSupabaseBrowserClient();
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;

      if (!token) {
        throw new Error("You need to sign in before uploading images.");
      }

      setStatus("Requesting upload URL...");
      const { presignedUrl, cdnUrl } = await generatePresignedUrl(
        token,
        contentType
      );

      setStatus("Uploading image...");
      await uploadImageToPresignedUrl(presignedUrl, file, contentType);

      setStatus("Creating image record...");
      await registerImageUrl(token, cdnUrl, false);

      setIsOpen(false);
      resetState();
      startTransition(() => {
        router.refresh();
      });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to upload image.";
      setError(message);
      setStatus(null);
    } finally {
      setIsWorking(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-orange-500/15 text-orange-200 ring-2 ring-orange-400/50 shadow-[0_0_24px_rgba(255,120,0,0.25)] transition-colors hover:bg-orange-500/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400/60"
        aria-label="Upload image"
      >
        <Plus className="h-5 w-5" />
      </button>

      {isOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-6 py-8 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-[2rem] border border-white/10 bg-[#15151b]/95 p-6 shadow-[0_24px_70px_rgba(0,0,0,0.7)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[0.7rem] uppercase tracking-[0.5em] text-orange-300/80 [font-family:var(--font-heading)]">
                  Images
                </p>
                <h2 className="mt-3 text-3xl uppercase tracking-[0.16em] text-zinc-100 [font-family:var(--font-heading)]">
                  Upload Image
                </h2>
              </div>

              <button
                type="button"
                onClick={closeModal}
                disabled={isWorking}
                className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-black/40 text-zinc-300 ring-1 ring-white/10 transition hover:bg-black/60 hover:text-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400/60 disabled:cursor-not-allowed disabled:opacity-60"
                aria-label="Close upload modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="mt-4 max-w-lg text-sm text-zinc-300/75">
              Uploading here only creates a new record in the `images` table. It
              does not trigger caption generation.
            </p>

            <div className="mt-6 rounded-2xl border border-white/10 bg-black/30 p-5">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.32em] text-zinc-300/70">
                    Selected File
                  </p>
                  <p className="mt-2 text-sm text-zinc-100">
                    {fileName ?? "No file selected yet."}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handlePickImage}
                  disabled={isWorking}
                  className="inline-flex items-center gap-2 rounded-xl bg-orange-500/15 px-5 py-3 text-[0.7rem] uppercase tracking-[0.32em] text-orange-200 ring-2 ring-orange-400/50 shadow-[0_0_24px_rgba(255,120,0,0.2)] transition-colors hover:bg-orange-500/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400/60 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Upload className="h-4 w-4" />
                  <span>{isWorking ? "Uploading..." : "Choose Image"}</span>
                </button>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept={ACCEPT_ATTR}
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>

              {previewUrl ? (
                <div className="mt-6 overflow-hidden rounded-2xl ring-1 ring-white/10">
                  <img
                    src={previewUrl}
                    alt="Selected upload preview"
                    className="aspect-[16/9] w-full bg-black object-contain"
                  />
                </div>
              ) : null}

              {status ? (
                <p className="mt-4 text-xs uppercase tracking-[0.32em] text-orange-200/80">
                  {status}
                </p>
              ) : null}

              {error ? (
                <p className="mt-4 text-sm text-rose-200/90">{error}</p>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
