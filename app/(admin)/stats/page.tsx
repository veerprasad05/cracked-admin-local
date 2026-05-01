import Link from "next/link";
import type { ComponentType, CSSProperties, ReactNode } from "react";
import {
  ArrowRight,
  BarChart3,
  Clock3,
  Heart,
  ImageIcon,
  MessageSquareText,
  Users,
} from "lucide-react";
import { Card, type CaptionEntry } from "@/components/Card";
import { formatReadableDate } from "@/lib/admin/listing";
import { summarizeCaptionLikeWindow } from "@/lib/admin/stats";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type StatBlockProps = {
  href: string;
  eyebrow: string;
  title: string;
  icon: ComponentType<{ className?: string }>;
  children: ReactNode;
};

type AnalyticsPanelProps = {
  eyebrow: string;
  title: string;
  icon: ComponentType<{ className?: string }>;
  children: ReactNode;
  className?: string;
};

type LikeEventRow = {
  caption_id: string | null;
  profile_id: string | null;
  created_datetime_utc: string | null;
};

type VoteEventRow = LikeEventRow & {
  vote_value: number | null;
};

type ProfileRow = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
};

async function loadRecentLikeEvents(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  likesWindowStartIso: string
) {
  const likeResult = await supabase
    .from("caption_likes")
    .select("caption_id, profile_id, created_datetime_utc")
    .gte("created_datetime_utc", likesWindowStartIso);

  if (!likeResult.error) {
    return {
      data: Array.isArray(likeResult.data)
        ? (likeResult.data as LikeEventRow[])
        : [],
      error: null,
    };
  }

  const missingCaptionLikesTable = likeResult.error.message.includes(
    "Could not find the table 'public.caption_likes'"
  );

  if (!missingCaptionLikesTable) {
    return {
      data: [] as LikeEventRow[],
      error: likeResult.error,
    };
  }

  const voteResult = await supabase
    .from("caption_votes")
    .select("caption_id, profile_id, created_datetime_utc, vote_value")
    .eq("vote_value", 1)
    .gte("created_datetime_utc", likesWindowStartIso);

  if (voteResult.error) {
    return {
      data: [] as LikeEventRow[],
      error: voteResult.error,
    };
  }

  const voteRows = Array.isArray(voteResult.data)
    ? (voteResult.data as VoteEventRow[])
    : [];

  return {
    data: voteRows.map((row) => ({
      caption_id: row.caption_id,
      profile_id: row.profile_id,
      created_datetime_utc: row.created_datetime_utc,
    })),
    error: null,
  };
}

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

function AnalyticsPanel({
  eyebrow,
  title,
  icon: Icon,
  children,
  className,
}: AnalyticsPanelProps) {
  return (
    <div
      className={[
        "flex h-full flex-col rounded-[2rem] border border-white/10 bg-[#15151b]/90 p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.05),_0_24px_70px_rgba(0,0,0,0.55)]",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
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
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-black/40 text-orange-200 ring-1 ring-white/10">
          <Icon className="h-5 w-5" />
        </span>
      </div>

      <div className="mt-6 flex-1">{children}</div>
    </div>
  );
}

function DonutChart({
  likedCount,
  unlikedCount,
}: {
  likedCount: number;
  unlikedCount: number;
}) {
  const total = likedCount + unlikedCount;
  const likedPercent = total > 0 ? Math.round((likedCount / total) * 100) : 0;
  const unlikedPercent = total > 0 ? 100 - likedPercent : 0;
  const chartStyle: CSSProperties = {
    background:
      total > 0
        ? `conic-gradient(#fb923c 0% ${likedPercent}%, rgba(255,255,255,0.1) ${likedPercent}% 100%)`
        : "conic-gradient(rgba(255,255,255,0.08) 0% 100%)",
  };

  return (
    <div className="flex h-full flex-col gap-6">
      <div className="flex items-center justify-center">
        <div
          className="relative flex h-48 w-48 items-center justify-center rounded-full"
          style={chartStyle}
          aria-label={`${likedPercent}% of captions have at least one like`}
        >
          <div className="flex h-28 w-28 flex-col items-center justify-center rounded-full border border-white/10 bg-[#111118] text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
            <span className="text-3xl uppercase tracking-[0.12em] text-zinc-100 [font-family:var(--font-heading)]">
              {likedPercent}%
            </span>
            <span className="mt-1 text-[0.6rem] uppercase tracking-[0.32em] text-zinc-400/80">
              Liked
            </span>
          </div>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-orange-400/20 bg-orange-500/10 p-4">
          <p className="text-[0.65rem] uppercase tracking-[0.28em] text-orange-200/90">
            Liked Captions
          </p>
          <p className="mt-3 text-3xl uppercase tracking-[0.12em] text-zinc-100 [font-family:var(--font-heading)]">
            {likedCount}
          </p>
          <p className="mt-2 text-xs text-zinc-300/80">
            {likedPercent}% of captions have at least one like.
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
          <p className="text-[0.65rem] uppercase tracking-[0.28em] text-zinc-300/80">
            Unliked Captions
          </p>
          <p className="mt-3 text-3xl uppercase tracking-[0.12em] text-zinc-100 [font-family:var(--font-heading)]">
            {unlikedCount}
          </p>
          <p className="mt-2 text-xs text-zinc-400/80">
            {unlikedPercent}% of captions have no likes yet.
          </p>
        </div>
      </div>
    </div>
  );
}

function buildProfileLabel(profile: ProfileRow | null, profileId: string) {
  if (!profile) {
    return profileId;
  }

  const firstName =
    typeof profile.first_name === "string" ? profile.first_name.trim() : "";
  const lastName =
    typeof profile.last_name === "string" ? profile.last_name.trim() : "";
  const fullName = `${firstName} ${lastName}`.trim();

  if (fullName.length > 0) {
    return fullName;
  }

  if (typeof profile.email === "string" && profile.email.trim().length > 0) {
    return profile.email;
  }

  return profileId;
}

export default async function StatsPage() {
  const supabase = await createSupabaseServerClient();
  const now = Date.now();
  const likesWindowStartIso = new Date(now - 24 * 60 * 60 * 1000).toISOString();

  const [
    { count: imageCount },
    { count: captionCount },
    { count: profileCount },
    { count: publicImageCount },
    { count: commonUseImageCount },
    { count: superAdminCount },
    { count: matrixAdminCount },
    { count: likedCaptionCount, error: likedCaptionCountError },
    { data: mostLikedCaption, error: mostLikedCaptionError },
    recentLikeEventsResult,
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
      .select("id", { count: "exact", head: true })
      .gt("like_count", 0),
    supabase
      .from("captions")
      .select("id, image_id, content, like_count, created_datetime_utc")
      .not("content", "is", null)
      .neq("content", "")
      .order("like_count", { ascending: false })
      .order("created_datetime_utc", { ascending: false })
      .limit(1)
      .maybeSingle(),
    loadRecentLikeEvents(supabase, likesWindowStartIso),
  ]);

  const mostLikedImageId =
    mostLikedCaption && typeof mostLikedCaption.image_id === "string"
      ? mostLikedCaption.image_id
      : null;

  const { data: mostLikedImage } = mostLikedImageId
    ? await supabase.from("images").select("url").eq("id", mostLikedImageId).maybeSingle()
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
  const mostLikedLikeLabel = mostLikedCaptionLikes === 1 ? "Like" : "Likes";

  const likeEventRows = recentLikeEventsResult.data;
  const likeEventsError = recentLikeEventsResult.error;
  const likeWindowSummary = summarizeCaptionLikeWindow(likeEventRows);
  const topCaptionWindow = likeWindowSummary.topCaption;
  const topLikerWindowRows = likeWindowSummary.topLikers.slice(0, 5);

  const topCaptionId = topCaptionWindow?.captionId ?? null;
  const topLikerIds = topLikerWindowRows.map((row) => row.profileId);

  const [{ data: topCaptionData, error: topCaptionDataError }, { data: likerProfiles, error: likerProfilesError }] =
    await Promise.all([
      topCaptionId
        ? supabase
            .from("captions")
            .select("id, image_id, content, like_count, created_datetime_utc")
            .eq("id", topCaptionId)
            .maybeSingle()
        : Promise.resolve({ data: null, error: null }),
      topLikerIds.length > 0
        ? supabase
            .from("profiles")
            .select("id, first_name, last_name, email")
            .in("id", topLikerIds)
        : Promise.resolve({ data: [], error: null }),
    ]);

  const topCaptionImageId =
    topCaptionData && typeof topCaptionData.image_id === "string"
      ? topCaptionData.image_id
      : null;

  const { data: topCaptionImage, error: topCaptionImageError } = topCaptionImageId
    ? await supabase.from("images").select("id, url").eq("id", topCaptionImageId).maybeSingle()
    : { data: null, error: null };

  const topCaptionEntry: CaptionEntry = {
    id:
      topCaptionData && typeof topCaptionData.id === "string"
        ? topCaptionData.id
        : undefined,
    content:
      topCaptionData && typeof topCaptionData.content === "string"
        ? topCaptionData.content
        : null,
  };

  const topCaptionImageUrl =
    topCaptionImage && typeof topCaptionImage.url === "string"
      ? topCaptionImage.url
      : null;
  const topCaptionTotalLikes =
    topCaptionData && typeof topCaptionData.like_count === "number"
      ? topCaptionData.like_count
      : 0;
  const totalCaptions = captionCount ?? 0;
  const likedCaptions = likedCaptionCount ?? 0;
  const unlikedCaptions = Math.max(totalCaptions - likedCaptions, 0);

  const likerProfileRows = Array.isArray(likerProfiles) ? (likerProfiles as ProfileRow[]) : [];
  const likerProfilesById = new Map<string, ProfileRow>();
  likerProfileRows.forEach((profile) => {
    likerProfilesById.set(profile.id, profile);
  });

  const pieChartErrorMessage = likedCaptionCountError?.message;
  const topCaption24hErrorMessage =
    likeEventsError?.message ?? topCaptionDataError?.message ?? topCaptionImageError?.message;
  const topLikersErrorMessage = likeEventsError?.message ?? likerProfilesError?.message;

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
                  {mostLikedCaptionLikes} {mostLikedLikeLabel}
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
          href="/users"
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

      <section className="mt-12">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-[0.7rem] uppercase tracking-[0.5em] text-orange-300/80 [font-family:var(--font-heading)]">
              Caption Analytics
            </p>
            <h2 className="mt-3 text-[2rem] leading-none uppercase tracking-[0.18em] text-zinc-100 [font-family:var(--font-heading)]">
              Likes And Activity
            </h2>
            <p className="mt-4 max-w-3xl text-sm text-zinc-300/75">
              Added metrics for caption like coverage and recent rating activity.
            </p>
          </div>

          <div className="inline-flex items-center gap-3 rounded-2xl border border-white/10 bg-black/30 px-5 py-4 text-[0.65rem] uppercase tracking-[0.32em] text-zinc-300/80 shadow-[0_12px_28px_rgba(0,0,0,0.35)]">
            <Clock3 className="h-4 w-4 text-orange-200" />
            <span>Last 24 Hours Included</span>
          </div>
        </div>

        <div className="mt-8 grid gap-6 xl:grid-cols-[0.95fr_1.25fr_0.8fr]">
          <AnalyticsPanel
            eyebrow="Coverage"
            title="Caption Likes"
            icon={Heart}
          >
            {pieChartErrorMessage ? (
              <p className="text-sm text-rose-200/90">
                Failed to load like coverage: {pieChartErrorMessage}
              </p>
            ) : (
              <DonutChart likedCount={likedCaptions} unlikedCount={unlikedCaptions} />
            )}
          </AnalyticsPanel>

          <AnalyticsPanel
            eyebrow="24 Hours"
            title="Top Caption"
            icon={MessageSquareText}
            className="xl:max-w-[40rem] xl:justify-self-center xl:w-full"
          >
            {topCaption24hErrorMessage ? (
              <p className="text-sm text-rose-200/90">
                Failed to load 24-hour caption activity: {topCaption24hErrorMessage}
              </p>
            ) : !topCaptionWindow ? (
              <div className="rounded-2xl border border-white/10 bg-black/30 p-6 text-sm text-zinc-400/80">
                No caption likes were recorded in the last 24 hours.
              </div>
            ) : topCaptionImageUrl ? (
              <div className="space-y-4">
                <Card className="w-full">
                  <div className="absolute right-4 top-4 z-20 rounded-full bg-black/75 px-3 py-1.5 text-[0.62rem] uppercase tracking-[0.28em] text-orange-200 ring-1 ring-orange-400/40 shadow-[0_10px_24px_rgba(0,0,0,0.35)]">
                    {topCaptionWindow.likeCount} Likes in 24h
                  </div>
                  <Card.Image src={topCaptionImageUrl} alt="Top caption in last 24 hours" />
                  <Card.Caption captions={[topCaptionEntry]} />
                </Card>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
                    <p className="text-[0.65rem] uppercase tracking-[0.28em] text-zinc-400/80">
                      Last Like
                    </p>
                    <p className="mt-3 text-sm text-zinc-100">
                      {formatReadableDate(topCaptionWindow.latestLikeAt)}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
                    <p className="text-[0.65rem] uppercase tracking-[0.28em] text-zinc-400/80">
                      Total Lifetime Likes
                    </p>
                    <p className="mt-3 text-3xl uppercase tracking-[0.12em] text-zinc-100 [font-family:var(--font-heading)]">
                      {topCaptionTotalLikes}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="rounded-2xl border border-white/10 bg-black/30 p-6 text-sm text-zinc-400/80">
                  No image preview is available for the top 24-hour caption.
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
                  <p className="text-[0.65rem] uppercase tracking-[0.28em] text-zinc-400/80">
                    Caption
                  </p>
                  <p className="mt-3 whitespace-pre-wrap text-sm text-zinc-100">
                    {topCaptionEntry.content ?? "No caption content available."}
                  </p>
                </div>
              </div>
            )}
          </AnalyticsPanel>

          <AnalyticsPanel
            eyebrow="24 Hours"
            title="Top Likers"
            icon={Users}
          >
            {topLikersErrorMessage ? (
              <p className="text-sm text-rose-200/90">
                Failed to load 24-hour user activity: {topLikersErrorMessage}
              </p>
            ) : topLikerWindowRows.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-black/30 p-6 text-sm text-zinc-400/80">
                No users have liked captions in the last 24 hours.
              </div>
            ) : (
              <div className="space-y-3">
                {topLikerWindowRows.map((row, index) => {
                  const profile = likerProfilesById.get(row.profileId) ?? null;
                  const profileLabel = buildProfileLabel(profile, row.profileId);
                  const sublabel =
                    profile && typeof profile.email === "string" && profile.email.trim().length > 0
                      ? profile.email
                      : row.profileId;

                  return (
                    <div
                      key={row.profileId}
                      className="rounded-2xl border border-white/10 bg-black/30 p-4 shadow-[0_14px_30px_rgba(0,0,0,0.28)]"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <p className="text-[0.65rem] uppercase tracking-[0.28em] text-orange-200/90">
                            #{index + 1}
                          </p>
                          <p className="mt-2 truncate text-sm font-medium tracking-[0.04em] text-zinc-100">
                            {profileLabel}
                          </p>
                          <p className="mt-1 truncate text-xs text-zinc-400/80">
                            {sublabel}
                          </p>
                        </div>

                        <div className="rounded-full bg-orange-500/10 px-2 py-1.5 text-[0.50rem] uppercase tracking-[0.24em] text-orange-200 ring-1 ring-orange-400/30">
                          {row.likeCount} Likes
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </AnalyticsPanel>
        </div>
      </section>
    </div>
  );
}
