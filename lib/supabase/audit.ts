import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type BrowserSupabaseClient = ReturnType<typeof createSupabaseBrowserClient>;

type InsertAuditOptions = {
  createdAtField?: string;
  modifiedAtField?: string;
  timestamp: string;
  userId: string;
};

type UpdateAuditOptions = {
  modifiedAtField?: string;
  timestamp: string;
  userId: string;
};

export async function getAuthenticatedUserId(
  supabase: BrowserSupabaseClient,
  errorMessage = "You need to sign in before saving changes."
) {
  const { data, error } = await supabase.auth.getUser();
  const userId = data.user?.id;

  if (error || !userId) {
    throw new Error(error?.message ?? errorMessage);
  }

  return userId;
}

export function applyInsertAuditFields<T extends Record<string, unknown>>(
  payload: T,
  { createdAtField, modifiedAtField, timestamp, userId }: InsertAuditOptions
) {
  const nextPayload: Record<string, unknown> = {
    ...payload,
    created_by_user_id: userId,
    modified_by_user_id: userId,
  };

  if (createdAtField) {
    nextPayload[createdAtField] = timestamp;
  }

  if (modifiedAtField) {
    nextPayload[modifiedAtField] = timestamp;
  }

  return nextPayload;
}

export function applyUpdateAuditFields<T extends Record<string, unknown>>(
  payload: T,
  { modifiedAtField, timestamp, userId }: UpdateAuditOptions
) {
  const nextPayload: Record<string, unknown> = {
    ...payload,
    modified_by_user_id: userId,
  };

  if (modifiedAtField) {
    nextPayload[modifiedAtField] = timestamp;
  }

  return nextPayload;
}
