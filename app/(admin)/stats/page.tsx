import Link from "next/link";
import { ArrowRight, BarChart3, ImageIcon, MessageSquareText, Users } from "lucide-react";
import { Card, type CaptionEntry } from "@/components/Card";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type StatBlockProps = {
  href: string;
  eyebrow: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
};

function StatBlock({
  href,
  eyebrow,
  title,
  icon: Icon,
  children,
}: StatBlockProps) {
  return (
    <Link
      href={href}
      className="group flex h-full flex-col rounded-[2rem] border border-white/10 bg-[#15151b]/90 p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.05),_0_24px_70px_rgba(0,0,0,0.55)] transition-transform hover:-translate-y-1 hover:bg-[#181820] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400/60"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[0.65rem] uppercase tracking-[0.4em] text-orange-300/80 [font-family:var(--font-heading)]">
            {eyebrow}
          </p>
          <h2 className="mt-3 text-2xl uppercase tracking-[0.16em] text-zinc-100 [font-family:var(--font-heading)]">
            {title}
          </h2>
        </div>
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-black/40 text-orange-200 ring-1 ring-white/10 transition group-hover:ring-orange-400/40">
          <Icon className="h-5 w-5" />
        </span>
      </div>

      <div className="mt-6 flex-1">{children}</div>

      <div className="mt-6 inline-flex items-center gap-2 text-[0.65rem] uppercase tracking-[0.32em] text-zinc-300/75 transition group-hover:text-orange-200">
        <span>Open</span>
        <ArrowRight className="h-4 w-4" />
      </div>
    </Link>
  );
}

export default async function StatsPage() {
  const supabase = await createSupabaseServerClient();

  const [
    { count: imageCount },
    { count: captionCount },
    { count: profileCount },
    { count: publicImageCount },
    { count: commonUseImageCount },
    { count: superAdminCount },
    { count: matrixAdminCount },
    { data: mostLikedCaption, error: mostLikedCaptionError },
  ] = await Promise.all([
    supabase.from("images").select("id", { count: "exact", head: true }),
    supabase.from("captions").select("id", { count: "exact", head: true }),
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    supabase
      .from("images")
      .select("id", { count: "exact", head: true })
      .eq("is_public", true),
    supabase
      .from("images")
      .select("id", { count: "exact", head: true })
      .eq("is_common_use", true),
    supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("is_superadmin", true),
    supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("is_matrix_admin", true),
    supabase
      .from("captions")
      .select("id, image_id, content, like_count, created_datetime_utc")
      .not("content", "is", null)
      .neq("content", "")
      .order("like_count", { ascending: false })
      .order("created_datetime_utc", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  const mostLikedImageId =
    mostLikedCaption && typeof mostLikedCaption.image_id === "string"
      ? mostLikedCaption.image_id
      : null;

  const { data: mostLikedImage } = mostLikedImageId
    ? await supabase
        .from("images")
        .select("url")
        .eq("id", mostLikedImageId)
        .maybeSingle()
    : { data: null };

  const mostLikedCaptionEntry: CaptionEntry = {
    id:
      mostLikedCaption && typeof mostLikedCaption.id === "string"
        ? mostLikedCaption.id
        : undefined,
    content:
      mostLikedCaption && typeof mostLikedCaption.content === "string"
        ? mostLikedCaption.content
        : null,
  };

  const mostLikedImageUrl =
    mostLikedImage && typeof mostLikedImage.url === "string"
      ? mostLikedImage.url
      : null;
  const mostLikedCaptionLikes =
    mostLikedCaption && typeof mostLikedCaption.like_count === "number"
      ? mostLikedCaption.like_count
      : 0;
  const likeLabel = mostLikedCaptionLikes === 1 ? "Like" : "Likes";

  return (
    <div className="mx-auto w-full max-w-[1500px]">
      <header className="flex flex-col gap-4">
        <p className="text-[0.7rem] uppercase tracking-[0.5em] text-orange-300/80 [font-family:var(--font-heading)]">
          Admin Overview
        </p>
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div>
            <h1 className="text-[2.75rem] leading-none uppercase tracking-[0.18em] text-zinc-100 sm:text-[3.25rem] lg:text-[3.75rem] [font-family:var(--font-heading)]">
              Stats
            </h1>
            <p className="mt-4 max-w-3xl text-sm text-zinc-300/75">
              Snapshot metrics across images, captions, and profiles.
            </p>
          </div>

          <div className="inline-flex items-center gap-3 rounded-2xl border border-white/10 bg-black/40 px-5 py-4 text-[0.65rem] uppercase tracking-[0.32em] text-zinc-300/80 shadow-[0_12px_28px_rgba(0,0,0,0.45)]">
            <BarChart3 className="h-4 w-4 text-orange-200" />
            <span>Live dataset stats</span>
          </div>
        </div>
      </header>

      <section className="mt-10 grid gap-6 xl:grid-cols-3">
        <StatBlock
          href="/images"
          eyebrow="Images"
          title="Images"
          icon={ImageIcon}
        >
          <p className="text-5xl uppercase tracking-[0.12em] text-zinc-100 [font-family:var(--font-heading)]">
            {imageCount ?? 0}
          </p>
          <p className="mt-2 text-[0.65rem] uppercase tracking-[0.32em] text-zinc-400/80">
            Total images
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
              <p className="text-[0.65rem] uppercase tracking-[0.28em] text-zinc-400/80">
                Public Use
              </p>
              <p className="mt-3 text-3xl uppercase tracking-[0.12em] text-zinc-100 [font-family:var(--font-heading)]">
                {publicImageCount ?? 0}
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
              <p className="text-[0.65rem] uppercase tracking-[0.28em] text-zinc-400/80">
                Common Use
              </p>
              <p className="mt-3 text-3xl uppercase tracking-[0.12em] text-zinc-100 [font-family:var(--font-heading)]">
                {commonUseImageCount ?? 0}
              </p>
            </div>
          </div>
        </StatBlock>

        <StatBlock
          href="/captions"
          eyebrow="Captions"
          title="Captions"
          icon={MessageSquareText}
        >
          <p className="text-5xl uppercase tracking-[0.12em] text-zinc-100 [font-family:var(--font-heading)]">
            {captionCount ?? 0}
          </p>
          <p className="mt-2 text-[0.65rem] uppercase tracking-[0.32em] text-zinc-400/80">
            Total captions
          </p>

          <div className="mt-8">
            <p className="mb-4 text-[0.65rem] uppercase tracking-[0.28em] text-zinc-400/80">
              Most liked caption
            </p>
            {mostLikedCaptionError ? (
              <p className="text-sm text-rose-200/90">
                Failed to load top caption: {mostLikedCaptionError.message}
              </p>
            ) : mostLikedImageUrl ? (
              <Card className="w-full">
                <div className="absolute right-4 top-4 z-20 rounded-full bg-black/75 px-3 py-1.5 text-[0.62rem] uppercase tracking-[0.28em] text-emerald-200 ring-1 ring-emerald-400/40 shadow-[0_10px_24px_rgba(0,0,0,0.35)]">
                  {mostLikedCaptionLikes} {likeLabel}
                </div>
                <Card.Image src={mostLikedImageUrl} alt="Most liked caption image" />
                <Card.Caption captions={[mostLikedCaptionEntry]} />
              </Card>
            ) : (
              <div className="rounded-2xl border border-white/10 bg-black/30 p-6 text-sm text-zinc-400/80">
                No caption preview available.
              </div>
            )}
          </div>
        </StatBlock>

        <StatBlock
          href="/profiles"
          eyebrow="Profiles"
          title="Profiles"
          icon={Users}
        >
          <p className="text-5xl uppercase tracking-[0.12em] text-zinc-100 [font-family:var(--font-heading)]">
            {profileCount ?? 0}
          </p>
          <p className="mt-2 text-[0.65rem] uppercase tracking-[0.32em] text-zinc-400/80">
            Total profiles
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
              <p className="text-[0.65rem] uppercase tracking-[0.28em] text-zinc-400/80">
                Super Admins
              </p>
              <p className="mt-3 text-3xl uppercase tracking-[0.12em] text-zinc-100 [font-family:var(--font-heading)]">
                {superAdminCount ?? 0}
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
              <p className="text-[0.65rem] uppercase tracking-[0.28em] text-zinc-400/80">
                Matrix Admins
              </p>
              <p className="mt-3 text-3xl uppercase tracking-[0.12em] text-zinc-100 [font-family:var(--font-heading)]">
                {matrixAdminCount ?? 0}
              </p>
            </div>
          </div>
        </StatBlock>
      </section>
    </div>
  );
}
