import { redirect } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import { getAdminAccessState } from "@/lib/supabase/admin-access";

export default async function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const { isSuperadmin } = await getAdminAccessState();

  if (!isSuperadmin) {
    redirect("/");
  }

  return (
    <div className="min-h-screen w-full px-6 py-6">
      <div className="flex min-h-[calc(100vh-3rem)] gap-6 max-lg:flex-col">
        <aside className="w-72 shrink-0 self-start max-lg:w-full lg:sticky lg:top-6 lg:h-[calc(100vh-3rem)]">
          <Sidebar />
        </aside>

        <main className="flex-1 pt-8 pb-12 max-lg:pt-0">{children}</main>
      </div>
    </div>
  );
}
