"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  BrainCircuit,
  ChevronRight,
  ImageIcon,
  LayoutDashboard,
  MessageSquareText,
  Sparkles,
  Users,
} from "lucide-react";
import SidebarUserMenu from "@/components/SidebarUserMenu";

const directItems = [
  { href: "/stats", label: "Stats", icon: BarChart3 },
  { href: "/images", label: "Images", icon: ImageIcon },
];

const groupedItems = [
  {
    label: "Captions",
    icon: MessageSquareText,
    children: [
      { href: "/captions", label: "Captions" },
      { href: "/caption-examples", label: "Caption Examples" },
    ],
  },
  {
    label: "Profiles",
    icon: Users,
    children: [
      { href: "/users", label: "Users" },
      {
        href: "/whitelisted-email-addresses",
        label: "Whitelisted Email Addresses",
      },
      { href: "/allowed-signup-domains", label: "Allowed Signup Domains" },
    ],
  },
  {
    label: "Humor Flavors",
    icon: Sparkles,
    children: [
      { href: "/humor-flavors", label: "Humor Flavors" },
      { href: "/humor-mix", label: "Humor Mix" },
    ],
  },
  {
    label: "LLMs",
    icon: BrainCircuit,
    children: [
      { href: "/llm-models", label: "Models" },
      { href: "/llm-providers", label: "Providers" },
      { href: "/llm-prompt-chains", label: "Prompt Chains" },
      { href: "/llm-responses", label: "LLM Responses" },
    ],
  },
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
        {directItems.map((item) => {
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

        {groupedItems.map((group) => {
          const Icon = group.icon;
          const isActive = group.children.some((child) => pathname === child.href);

          return (
            <div
              key={group.label}
              className="rounded-2xl bg-black/20 p-3 ring-1 ring-white/10"
            >
              <div
                className={[
                  "flex items-center justify-between rounded-xl px-4 py-3 text-[0.7rem] uppercase tracking-[0.32em]",
                  isActive ? "text-orange-200" : "text-zinc-300/80",
                ].join(" ")}
              >
                <span className="flex items-center gap-2">
                  <Icon className="h-4 w-4" />
                  <span>{group.label}</span>
                </span>
                <ChevronRight
                  className={[
                    "h-4 w-4 transition-transform",
                    isActive ? "rotate-90 text-orange-200" : "text-zinc-500",
                  ].join(" ")}
                />
              </div>

              <div className="mt-2 flex flex-col gap-2">
                {group.children.map((child) => {
                  const childActive = pathname === child.href;

                  return (
                    <Link
                      key={child.href}
                      href={child.href}
                      aria-current={childActive ? "page" : undefined}
                      className={[
                        "rounded-xl px-4 py-3 text-[0.65rem] uppercase tracking-[0.28em]",
                        "bg-black/30 text-zinc-300/80 ring-1 ring-white/10",
                        "transition-colors hover:bg-black/60 hover:text-zinc-100",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400/50",
                        childActive
                          ? "bg-orange-500/15 text-orange-200 ring-2 ring-orange-400/50 shadow-[0_0_24px_rgba(255,120,0,0.2)]"
                          : "",
                      ].join(" ")}
                    >
                      {child.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>

      <div className="mt-auto pt-6">
        <SidebarUserMenu />
      </div>
    </div>
  );
}
