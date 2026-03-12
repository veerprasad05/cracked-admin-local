"use client";

import * as React from "react";
import { startTransition } from "react";
import { Pencil, Plus, Trash2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type CrudFieldType = "text" | "textarea" | "number" | "checkbox";

type CrudField = {
  name: string;
  label: string;
  type: CrudFieldType;
  required?: boolean;
  nullable?: boolean;
  placeholder?: string;
};

type CrudColumn = {
  key: string;
  label: string;
  type?: "text" | "number" | "boolean" | "datetime" | "longtext";
};

type CrudRow = {
  id: string | number;
  [key: string]: unknown;
};

type AdminCrudManagerProps = {
  tableName: string;
  rows: CrudRow[];
  fields: CrudField[];
  columns: CrudColumn[];
  emptyMessage: string;
  createLabel: string;
  editLabel: string;
  deleteLabel: string;
  allowCreate?: boolean;
  allowEdit?: boolean;
  allowDelete?: boolean;
  createdAtField?: string;
  modifiedAtField?: string;
};

function formatValue(value: unknown, type: CrudColumn["type"]) {
  if (type === "boolean") {
    return value === true ? "Yes" : "No";
  }

  if (type === "datetime") {
    if (typeof value !== "string" || value.length === 0) {
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

  if (value === null || value === undefined || value === "") {
    return "N/A";
  }

  return String(value);
}

function buildDraft(fields: CrudField[], row?: CrudRow | null) {
  const draft: Record<string, string | boolean> = {};

  fields.forEach((field) => {
    const value = row?.[field.name];

    if (field.type === "checkbox") {
      draft[field.name] = value === true;
      return;
    }

    if (typeof value === "number") {
      draft[field.name] = String(value);
      return;
    }

    if (typeof value === "string") {
      draft[field.name] = value;
      return;
    }

    draft[field.name] = "";
  });

  return draft;
}

function buildPayload(
  fields: CrudField[],
  draft: Record<string, string | boolean>
) {
  const payload: Record<string, unknown> = {};

  fields.forEach((field) => {
    const rawValue = draft[field.name];

    if (field.type === "checkbox") {
      payload[field.name] = rawValue === true;
      return;
    }

    if (typeof rawValue !== "string") {
      payload[field.name] = field.nullable ? null : "";
      return;
    }

    if (field.type === "number") {
      if (rawValue.trim().length === 0) {
        payload[field.name] = field.nullable ? null : 0;
        return;
      }

      const parsed = Number(rawValue);
      payload[field.name] = Number.isFinite(parsed) ? parsed : 0;
      return;
    }

    if (rawValue.trim().length === 0 && field.nullable) {
      payload[field.name] = null;
      return;
    }

    payload[field.name] = rawValue;
  });

  return payload;
}

export default function AdminCrudManager({
  tableName,
  rows,
  fields,
  columns,
  emptyMessage,
  createLabel,
  editLabel,
  deleteLabel,
  allowCreate = true,
  allowEdit = true,
  allowDelete = true,
  createdAtField,
  modifiedAtField,
}: AdminCrudManagerProps) {
  const router = useRouter();
  const [error, setError] = React.useState<string | null>(null);
  const [isWorking, setIsWorking] = React.useState(false);
  const [editingRow, setEditingRow] = React.useState<CrudRow | null>(null);
  const [isCreating, setIsCreating] = React.useState(false);
  const [draft, setDraft] = React.useState<Record<string, string | boolean>>(
    {}
  );

  const isOpen = isCreating || editingRow !== null;

  const openCreate = () => {
    setDraft(buildDraft(fields));
    setEditingRow(null);
    setIsCreating(true);
    setError(null);
  };

  const openEdit = (row: CrudRow) => {
    setDraft(buildDraft(fields, row));
    setEditingRow(row);
    setIsCreating(false);
    setError(null);
  };

  const closeModal = () => {
    if (isWorking) {
      return;
    }

    setEditingRow(null);
    setIsCreating(false);
    setDraft({});
    setError(null);
  };

  const handleDraftChange = (name: string, value: string | boolean) => {
    setDraft((current) => ({ ...current, [name]: value }));
  };

  const handleSave = async () => {
    try {
      setIsWorking(true);
      setError(null);

      const supabase = createSupabaseBrowserClient();
      const timestamp = new Date().toISOString();
      const payload = buildPayload(fields, draft);

      if (isCreating) {
        if (createdAtField) {
          payload[createdAtField] = timestamp;
        }

        const { error: insertError } = await supabase
          .from(tableName)
          .insert(payload);

        if (insertError) {
          throw new Error(insertError.message);
        }
      } else if (editingRow) {
        if (modifiedAtField) {
          payload[modifiedAtField] = timestamp;
        }

        const { error: updateError } = await supabase
          .from(tableName)
          .update(payload)
          .eq("id", editingRow.id);

        if (updateError) {
          throw new Error(updateError.message);
        }
      }

      closeModal();
      startTransition(() => {
        router.refresh();
      });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to save record.";
      setError(message);
    } finally {
      setIsWorking(false);
    }
  };

  const handleDelete = async (row: CrudRow) => {
    const confirmed = window.confirm(`Delete this ${deleteLabel.toLowerCase()}?`);

    if (!confirmed) {
      return;
    }

    try {
      setIsWorking(true);
      setError(null);

      const supabase = createSupabaseBrowserClient();
      const { error: deleteError } = await supabase
        .from(tableName)
        .delete()
        .eq("id", row.id);

      if (deleteError) {
        throw new Error(deleteError.message);
      }

      startTransition(() => {
        router.refresh();
      });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to delete record.";
      setError(message);
    } finally {
      setIsWorking(false);
    }
  };

  return (
    <>
      <div className="flex items-center justify-between gap-4">
        {error ? <p className="text-sm text-rose-200/90">{error}</p> : <span />}

        {allowCreate ? (
          <button
            type="button"
            onClick={openCreate}
            className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-orange-500/15 text-orange-200 ring-2 ring-orange-400/50 shadow-[0_0_24px_rgba(255,120,0,0.25)] transition-colors hover:bg-orange-500/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400/60"
            aria-label={createLabel}
          >
            <Plus className="h-5 w-5" />
          </button>
        ) : null}
      </div>

      {rows.length === 0 ? (
        <p className="mt-8 text-sm text-zinc-400/80">{emptyMessage}</p>
      ) : (
        <div className="mt-8 space-y-4">
          {rows.map((row) => (
            <div
              key={String(row.id)}
              className="rounded-[2rem] border border-white/10 bg-[#15151b]/85 p-5 shadow-[0_18px_40px_rgba(0,0,0,0.55)]"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="grid flex-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {columns.map((column) => (
                    <div key={`${row.id}-${column.key}`}>
                      <p className="text-[0.65rem] uppercase tracking-[0.28em] text-zinc-500">
                        {column.label}
                      </p>
                      <p
                        className={[
                          "mt-2 text-sm text-zinc-100",
                          column.type === "longtext"
                            ? "whitespace-pre-wrap break-words"
                            : "",
                        ].join(" ")}
                      >
                        {formatValue(row[column.key], column.type)}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  {allowEdit ? (
                    <button
                      type="button"
                      onClick={() => openEdit(row)}
                      className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-black/70 text-orange-200 ring-1 ring-orange-400/40 transition hover:bg-orange-500/15 hover:text-orange-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400/70"
                      aria-label={editLabel}
                    >
                      <Pencil className="h-5 w-5" />
                    </button>
                  ) : null}

                  {allowDelete ? (
                    <button
                      type="button"
                      onClick={() => handleDelete(row)}
                      className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-black/70 text-red-300 ring-1 ring-red-400/40 transition hover:bg-red-500/15 hover:text-red-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400/70"
                      aria-label={deleteLabel}
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  ) : null}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {isOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-6 py-8 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-[2rem] border border-white/10 bg-[#15151b]/95 p-6 shadow-[0_24px_70px_rgba(0,0,0,0.7)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[0.7rem] uppercase tracking-[0.5em] text-orange-300/80 [font-family:var(--font-heading)]">
                  Admin
                </p>
                <h2 className="mt-3 text-3xl uppercase tracking-[0.16em] text-zinc-100 [font-family:var(--font-heading)]">
                  {isCreating ? createLabel : editLabel}
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

            <div className="mt-6 grid gap-4">
              {fields.map((field) => {
                const value = draft[field.name];

                if (field.type === "checkbox") {
                  return (
                    <button
                      key={field.name}
                      type="button"
                      onClick={() =>
                        handleDraftChange(field.name, value !== true)
                      }
                      aria-pressed={value === true}
                      className={[
                        "flex items-center justify-between rounded-2xl px-4 py-4 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400/60",
                        value === true
                          ? "bg-orange-500/15 text-orange-100 ring-2 ring-orange-400/50"
                          : "bg-black/40 text-zinc-300 ring-1 ring-white/10 hover:bg-black/60 hover:text-zinc-100",
                      ].join(" ")}
                    >
                      <span className="text-sm uppercase tracking-[0.18em]">
                        {field.label}
                      </span>
                      <span className="text-[0.65rem] uppercase tracking-[0.28em]">
                        {value === true ? "On" : "Off"}
                      </span>
                    </button>
                  );
                }

                if (field.type === "textarea") {
                  return (
                    <label key={field.name} className="grid gap-2">
                      <span className="text-[0.65rem] uppercase tracking-[0.28em] text-zinc-400">
                        {field.label}
                      </span>
                      <textarea
                        value={typeof value === "string" ? value : ""}
                        onChange={(event) =>
                          handleDraftChange(field.name, event.target.value)
                        }
                        placeholder={field.placeholder}
                        rows={5}
                        className="min-h-[8rem] rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400/60"
                      />
                    </label>
                  );
                }

                return (
                  <label key={field.name} className="grid gap-2">
                    <span className="text-[0.65rem] uppercase tracking-[0.28em] text-zinc-400">
                      {field.label}
                    </span>
                    <input
                      type={field.type === "number" ? "number" : "text"}
                      value={typeof value === "string" ? value : ""}
                      onChange={(event) =>
                        handleDraftChange(field.name, event.target.value)
                      }
                      placeholder={field.placeholder}
                      required={field.required}
                      className="rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400/60"
                    />
                  </label>
                );
              })}
            </div>

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
                onClick={handleSave}
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
