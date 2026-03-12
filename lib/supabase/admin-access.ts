import { cache } from "react";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const getAdminAccessState = cache(async () => {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      isAuthenticated: false,
      isSuperadmin: false,
      user: null,
    };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_superadmin")
    .eq("id", user.id)
    .maybeSingle();

  return {
    isAuthenticated: true,
    isSuperadmin: profile?.is_superadmin === true,
    user,
  };
});
