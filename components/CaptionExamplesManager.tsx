"use client";

import * as React from "react";
import { startTransition } from "react";
import { Pencil, Plus, Trash2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/Card";
import {
  applyInsertAuditFields,
  applyUpdateAuditFields,
  getAuthenticatedUserId,
} from "@/lib/supabase/audit";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type CaptionExampleRow = {
  id: number;
  created_datetime_utc: string;
  modified_datetime_utc: string;
  image_description: string;
  caption: string;
  explanation: string;
  priority: number;
  image_id: string | null;
  image_url: string | null;
};

type CaptionExamplesManagerProps = {
  rows: CaptionExampleRow[];
};

type CreateDraft = {
  image_description: string;
  caption: string;
  explanation: string;
  priority: string;
  image_id: string;
};

type EditDraft = {
  caption: string;
  explanation: string;
};

function formatDate(value: string | null) {
  if (!value) {
    return "N/A";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "N/A";
  }

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function buildCreateDraft(): CreateDraft {
  return {
    image_description: "",
    caption: "",
    explanation: "",
    priority: "",
    image_id: "",
  };
}

function buildEditDraft(row: CaptionExampleRow): EditDraft {
  return {
    caption: row.caption,
    explanation: row.explanation,
  };
}

export default function CaptionExamplesManager({
  rows,
}: CaptionExamplesManagerProps) {
  const router = useRouter();
  const [error, setError] = React.useState<string | null>(null);
  const [isWorking, setIsWorking] = React.useState(false);
  const [isCreating, setIsCreating] = React.useState(false);
  const [editingRow, setEditingRow] = React.useState<CaptionExampleRow | null>(
    null
  );
  const [createDraft, setCreateDraft] = React.useState<CreateDraft>(
    buildCreateDraft()
  );
  const [editDraft, setEditDraft] = React.useState<EditDraft>({
    caption: "",
    explanation: "",
  });

  const isOpen = isCreating || editingRow !== null;

  const closeModal = () => {
    if (isWorking) {
      return;
    }

    setIsCreating(false);
    setEditingRow(null);
    setCreateDraft(buildCreateDraft());
    setEditDraft({ caption: "", explanation: "" });
    setError(null);
  };

  const openCreate = () => {
    setIsCreating(true);
    setEditingRow(null);
    setCreateDraft(buildCreateDraft());
    setEditDraft({ caption: "", explanation: "" });
    setError(null);
  };

  const openEdit = (row: CaptionExampleRow) => {
    setIsCreating(false);
    setEditingRow(row);
    setEditDraft(buildEditDraft(row));
    setError(null);
  };

  const handleCreate = async () => {
    try {
      setIsWorking(true);
      setError(null);

      const supabase = createSupabaseBrowserClient();
      const timestamp = new Date().toISOString();
      const userId = await getAuthenticatedUserId(supabase);
      const priority = Number(createDraft.priority);
      const payload = applyInsertAuditFields(
        {
          image_description: createDraft.image_description,
          caption: createDraft.caption,
          explanation: createDraft.explanation,
          priority: Number.isFinite(priority) ? priority : 0,
          image_id:
            createDraft.image_id.trim().length > 0 ? createDraft.image_id : null,
        },
        {
          createdAtField: "created_datetime_utc",
          modifiedAtField: "modified_datetime_utc",
          timestamp,
          userId,
        }
      );

      const { error: insertError } = await supabase
        .from("caption_examples")
        .insert(payload);

      if (insertError) {
        throw new Error(insertError.message);
      }

      closeModal();
      startTransition(() => {
        router.refresh();
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create caption example."
      );
    } finally {
      setIsWorking(false);
    }
  };

  const handleEdit = async () => {
    if (!editingRow) {
      return;
    }

    try {
      setIsWorking(true);
      setError(null);

      const supabase = createSupabaseBrowserClient();
      const timestamp = new Date().toISOString();
      const userId = await getAuthenticatedUserId(supabase);
      const payload = applyUpdateAuditFields(
        {
          caption: editDraft.caption,
          explanation: editDraft.explanation,
        },
        {
          modifiedAtField: "modified_datetime_utc",
          timestamp,
          userId,
        }
      );
      const { error: updateError } = await supabase
        .from("caption_examples")
        .update(payload)
        .eq("id", editingRow.id);

      if (updateError) {
        throw new Error(updateError.message);
      }

      closeModal();
      startTransition(() => {
        router.refresh();
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update caption example."
      );
    } finally {
      setIsWorking(false);
    }
  };

  const handleDelete = async (row: CaptionExampleRow) => {
    const confirmed = window.confirm("Delete this caption example?");

    if (!confirmed) {
      return;
    }

    try {
      setIsWorking(true);
      setError(null);

      const supabase = createSupabaseBrowserClient();
      const { error: deleteError } = await supabase
        .from("caption_examples")
        .delete()
        .eq("id", row.id);

      if (deleteError) {
        throw new Error(deleteError.message);
      }

      startTransition(() => {
        router.refresh();
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to delete caption example."
      );
    } finally {
      setIsWorking(false);
    }
  };

  return (
    <>
      <div className="flex items-center justify-between gap-4">
        {error ? <p className="text-sm text-rose-200/90">{error}</p> : <span />}

        <button
          type="button"
          onClick={openCreate}
          className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-orange-500/15 text-orange-200 ring-2 ring-orange-400/50 shadow-[0_0_24px_rgba(255,120,0,0.25)] transition-colors hover:bg-orange-500/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400/60"
          aria-label="Create caption example"
        >
          <Plus className="h-5 w-5" />
        </button>
      </div>

      {rows.length === 0 ? (
        <p className="mt-8 text-sm text-zinc-400/80">No caption examples found.</p>
      ) : (
        <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {rows.map((row) => (
            <Card key={row.id} className="h-full">
              <div className="absolute left-4 top-4 z-20 rounded-full bg-black/75 px-3 py-1.5 text-[0.62rem] uppercase tracking-[0.28em] text-zinc-200 ring-1 ring-white/10 shadow-[0_10px_24px_rgba(0,0,0,0.35)]">
                Priority {row.priority}
              </div>

              <div className="absolute right-4 top-4 z-20 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => openEdit(row)}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-black/75 text-orange-200 ring-1 ring-orange-400/40 transition hover:bg-orange-500/15 hover:text-orange-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400/70"
                  aria-label="Edit caption example"
                >
                  <Pencil className="h-4 w-4" />
                </button>

                <button
                  type="button"
                  onClick={() => handleDelete(row)}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-black/75 text-red-300 ring-1 ring-red-400/40 transition hover:bg-red-500/15 hover:text-red-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400/70"
                  aria-label="Delete caption example"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              {row.image_url ? (
                <Card.Image
                  src={row.image_url}
                  alt={row.image_description || "Caption example image"}
                />
              ) : (
                <div className="relative z-10 flex aspect-[16/9] items-center justify-center bg-black px-6 text-center text-sm uppercase tracking-[0.2em] text-zinc-500">
                  No linked image
                </div>
              )}

              <Card.Caption captions={[{ id: row.id, content: row.caption }]} />

              <div className="relative z-10 flex flex-1 flex-col border-t border-white/10 bg-[#0f0f14]/90 px-6 py-5">
                <div className="flex flex-wrap items-center gap-3 text-[0.62rem] uppercase tracking-[0.24em] text-zinc-500">
                  <span>Created {formatDate(row.created_datetime_utc)}</span>
                  <span>Image {row.image_id ?? "N/A"}</span>
                </div>

                <div className="mt-4">
                  <p className="text-[0.65rem] uppercase tracking-[0.28em] text-zinc-500">
                    Explanation
                  </p>
                  <p className="mt-2 whitespace-pre-wrap break-words text-sm text-zinc-100">
                    {row.explanation}
                  </p>
                </div>

                <div className="mt-4">
                  <p className="text-[0.65rem] uppercase tracking-[0.28em] text-zinc-500">
                    Image Description
                  </p>
                  <p className="mt-2 whitespace-pre-wrap break-words text-sm text-zinc-300/85">
                    {row.image_description}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {isOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-6 py-8 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-[2rem] border border-white/10 bg-[#15151b]/95 p-6 shadow-[0_24px_70px_rgba(0,0,0,0.7)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[0.7rem] uppercase tracking-[0.5em] text-orange-300/80 [font-family:var(--font-heading)]">
                  Captions
                </p>
                <h2 className="mt-3 text-3xl uppercase tracking-[0.16em] text-zinc-100 [font-family:var(--font-heading)]">
                  {isCreating ? "Create Caption Example" : "Edit Caption Example"}
                </h2>
              </div>

              <button
                type="button"
                onClick={closeModal}
                disabled={isWorking}
                className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-black/40 text-zinc-300 ring-1 ring-white/10 transition hover:bg-black/60 hover:text-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400/60 disabled:cursor-not-allowed disabled:opacity-60"
                aria-label="Close modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {isCreating ? (
              <div className="mt-6 grid gap-4">
                <label className="grid gap-2">
                  <span className="text-[0.65rem] uppercase tracking-[0.28em] text-zinc-400">
                    Image Description
                  </span>
                  <textarea
                    value={createDraft.image_description}
                    onChange={(event) =>
                      setCreateDraft((current) => ({
                        ...current,
                        image_description: event.target.value,
                      }))
                    }
                    rows={4}
                    className="min-h-[8rem] rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400/60"
                  />
                </label>

                <label className="grid gap-2">
                  <span className="text-[0.65rem] uppercase tracking-[0.28em] text-zinc-400">
                    Caption
                  </span>
                  <textarea
                    value={createDraft.caption}
                    onChange={(event) =>
                      setCreateDraft((current) => ({
                        ...current,
                        caption: event.target.value,
                      }))
                    }
                    rows={4}
                    className="min-h-[8rem] rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400/60"
                  />
                </label>

                <label className="grid gap-2">
                  <span className="text-[0.65rem] uppercase tracking-[0.28em] text-zinc-400">
                    Explanation
                  </span>
                  <textarea
                    value={createDraft.explanation}
                    onChange={(event) =>
                      setCreateDraft((current) => ({
                        ...current,
                        explanation: event.target.value,
                      }))
                    }
                    rows={5}
                    className="min-h-[8rem] rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400/60"
                  />
                </label>

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="grid gap-2">
                    <span className="text-[0.65rem] uppercase tracking-[0.28em] text-zinc-400">
                      Priority
                    </span>
                    <input
                      type="number"
                      value={createDraft.priority}
                      onChange={(event) =>
                        setCreateDraft((current) => ({
                          ...current,
                          priority: event.target.value,
                        }))
                      }
                      className="rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400/60"
                    />
                  </label>

                  <label className="grid gap-2">
                    <span className="text-[0.65rem] uppercase tracking-[0.28em] text-zinc-400">
                      Image ID
                    </span>
                    <input
                      type="text"
                      value={createDraft.image_id}
                      onChange={(event) =>
                        setCreateDraft((current) => ({
                          ...current,
                          image_id: event.target.value,
                        }))
                      }
                      className="rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400/60"
                    />
                  </label>
                </div>
              </div>
            ) : (
              <div className="mt-6 grid gap-4">
                <label className="grid gap-2">
                  <span className="text-[0.65rem] uppercase tracking-[0.28em] text-zinc-400">
                    Caption
                  </span>
                  <textarea
                    value={editDraft.caption}
                    onChange={(event) =>
                      setEditDraft((current) => ({
                        ...current,
                        caption: event.target.value,
                      }))
                    }
                    rows={4}
                    className="min-h-[8rem] rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400/60"
                  />
                </label>

                <label className="grid gap-2">
                  <span className="text-[0.65rem] uppercase tracking-[0.28em] text-zinc-400">
                    Explanation
                  </span>
                  <textarea
                    value={editDraft.explanation}
                    onChange={(event) =>
                      setEditDraft((current) => ({
                        ...current,
                        explanation: event.target.value,
                      }))
                    }
                    rows={6}
                    className="min-h-[8rem] rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400/60"
                  />
                </label>
              </div>
            )}

            {error ? (
              <p className="mt-4 text-sm text-rose-200/90">{error}</p>
            ) : null}

            <div className="mt-6 flex justify-end gap-3">
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
                onClick={isCreating ? handleCreate : handleEdit}
                disabled={isWorking}
                className="rounded-xl bg-orange-500/15 px-4 py-3 text-[0.7rem] uppercase tracking-[0.32em] text-orange-200 ring-2 ring-orange-400/50 shadow-[0_0_24px_rgba(255,120,0,0.2)] transition-colors hover:bg-orange-500/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400/60 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isWorking ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
