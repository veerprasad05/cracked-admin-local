"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Sparkles } from "lucide-react";
import SidebarUserMenu from "@/components/SidebarUserMenu";

const navItems = [
  { href: "/hello-world", label: "Hello World", icon: Sparkles },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col rounded-2xl bg-[#15151b]/90 p-4 backdrop-blur ring-1 ring-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.05),_0_18px_50px_rgba(0,0,0,0.7)]">
      <div className="mb-5 flex items-center justify-center gap-3 text-center text-[0.7rem] uppercase tracking-[0.4em] text-orange-300/80 [font-family:var(--font-heading)]">
        <LayoutDashboard className="h-4 w-4" />
        <span>Crackd Admin</span>
      </div>

      <nav className="flex flex-col gap-3">
        {navItems.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={[
                "flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-center text-[0.7rem] uppercase tracking-[0.32em]",
                "bg-black/40 text-zinc-300/80 ring-1 ring-white/10",
                "transition-colors hover:bg-black/60 hover:text-zinc-100",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400/50",
                active
                  ? "bg-orange-500/15 text-orange-200 ring-2 ring-orange-400/50 shadow-[0_0_24px_rgba(255,120,0,0.25)]"
                  : "",
              ].join(" ")}
            >
              <Icon className="h-4 w-4" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto pt-6">
        <SidebarUserMenu />
      </div>
    </div>
  );
}
