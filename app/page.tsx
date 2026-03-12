import { redirect } from "next/navigation";
import AccessDeniedPanel from "@/components/AccessDeniedPanel";
import SignInModal from "@/components/SignInModal";
import { getAdminAccessState } from "@/lib/supabase/admin-access";

export default async function HomePage() {
  const { isAuthenticated, isSuperadmin } = await getAdminAccessState();

  if (isSuperadmin) {
    redirect("/stats");
  }

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-4xl items-center justify-center px-6 py-6">
      {isAuthenticated ? <AccessDeniedPanel /> : <SignInModal />}
    </div>
  );
}
