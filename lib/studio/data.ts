import type { SupabaseClient, User } from "@supabase/supabase-js";
import { getSupabaseRuntimeConfig } from "@/lib/supabase/config";
import { createPublicSupabaseClient } from "@/lib/supabase/server";
import {
  emptyPublicSiteContent,
  rowsToMoments,
  rowsToSiteContent,
  type MomentRow,
  type PublicSiteContent,
  type SiteContentRow,
} from "./content";
import {
  rowsToFollowerSnapshots,
  type FollowerSnapshot,
  type FollowerSnapshotRow,
} from "./followers";
import {
  calculateMomentumStatus,
  getIsoWeekKey,
  isTrustedMomentumSource,
  momentumActions,
  type MomentumAction,
  type MomentumActivity,
  type MomentumStatus,
} from "./momentum";

const siteContentColumns =
  "content_key,title,class_name,event_date,focus,url,label,published";
const momentColumns =
  "id,title,moment_type,event_date,location,caption,media_type,media_url,poster_url,external_url,published";
const followerSnapshotColumns =
  "id,snapshot_date,follower_count,created_at,updated_at";

export function isStudioAdmin(user: User): boolean {
  const config = getSupabaseRuntimeConfig();
  return Boolean(
    config &&
      user.email?.toLowerCase() === config.adminEmail &&
      user.app_metadata?.studio_admin === true,
  );
}

export async function getPublicSiteContent(): Promise<PublicSiteContent> {
  const supabase = createPublicSupabaseClient();
  if (!supabase) return emptyPublicSiteContent;

  const [siteResult, coverResult, momentRows] = await Promise.all([
    supabase.from("site_content").select(siteContentColumns).eq("published", true),
    supabase
      .from("site_content")
      .select("cover_url")
      .eq("content_key", "instagram")
      .eq("published", true)
      .maybeSingle(),
    getPublicMomentRows(supabase),
  ]);

  const siteRows = withInstagramCover(
    (siteResult.data ?? []) as SiteContentRow[],
    coverResult.error ? null : coverResult.data?.cover_url,
  );
  const content = siteResult.error || !siteResult.data
    ? { ...emptyPublicSiteContent }
    : rowsToSiteContent(siteRows);
  content.moments = rowsToMoments(momentRows);
  return content;
}

export async function getAdminSiteContent(
  supabase: SupabaseClient,
): Promise<PublicSiteContent> {
  const [siteResult, coverResult, momentRows] = await Promise.all([
    supabase.from("site_content").select(siteContentColumns),
    supabase
      .from("site_content")
      .select("cover_url")
      .eq("content_key", "instagram")
      .maybeSingle(),
    getAdminMomentRows(supabase),
  ]);

  const siteRows = withInstagramCover(
    (siteResult.data ?? []) as SiteContentRow[],
    coverResult.error ? null : coverResult.data?.cover_url,
  );
  const content = siteResult.error || !siteResult.data
    ? { ...emptyPublicSiteContent }
    : rowsToSiteContent(siteRows);
  content.moments = rowsToMoments(momentRows);
  return content;
}

export async function getInstagramFollowerSnapshots(
  supabase: SupabaseClient,
): Promise<FollowerSnapshot[]> {
  const result = await supabase
    .from("instagram_follower_snapshots")
    .select(followerSnapshotColumns)
    .order("snapshot_date", { ascending: true })
    .limit(730);

  return result.error || !result.data
    ? []
    : rowsToFollowerSnapshots(result.data as FollowerSnapshotRow[]);
}

export async function getStudioMomentum(
  supabase: SupabaseClient,
  now: Date = new Date(),
): Promise<MomentumStatus> {
  const [activityResult, contentResult, momentResult] = await Promise.all([
    supabase
      .from("studio_activity")
      .select("action_type,week_key,source_id,source_url,occurred_at")
      .order("occurred_at", { ascending: false })
      .limit(1000),
    supabase
      .from("site_content")
      .select("content_key,published,updated_at")
      .eq("content_key", "spotify")
      .eq("published", true),
    supabase
      .from("site_moments")
      .select("created_at")
      .order("created_at", { ascending: false })
      .limit(250),
  ]);

  const activities: MomentumActivity[] = [];

  if (!activityResult.error) {
    for (const row of activityResult.data ?? []) {
      if (
        momentumActions.includes(row.action_type as MomentumAction) &&
        typeof row.week_key === "string" &&
        typeof row.source_id === "string" &&
        isTrustedMomentumSource(row.action_type as MomentumAction, row.source_id)
      ) {
        activities.push({
          action: row.action_type as MomentumAction,
          sourceUrl: typeof row.source_url === "string" ? row.source_url : null,
          weekKey: row.week_key,
        });
      }
    }
  }

  if (!contentResult.error) {
    for (const row of contentResult.data ?? []) {
      const weekKey = weekKeyFromTimestamp(row.updated_at);
      if (row.content_key === "spotify" && weekKey) {
        activities.push({ action: "connect", weekKey });
      }
    }
  }

  if (!momentResult.error) {
    for (const row of momentResult.data ?? []) {
      const weekKey = weekKeyFromTimestamp(row.created_at);
      if (weekKey) activities.push({ action: "capture", weekKey });
    }
  }

  return calculateMomentumStatus(activities, now);
}

function withInstagramCover(
  rows: SiteContentRow[],
  coverUrl: string | null | undefined,
): SiteContentRow[] {
  return rows.map((row) => (
    row.content_key === "instagram"
      ? { ...row, cover_url: coverUrl ?? null }
      : row
  ));
}

async function getPublicMomentRows(supabase: SupabaseClient): Promise<MomentRow[]> {
  const result = await supabase
    .from("site_moments")
    .select(momentColumns)
    .eq("published", true)
    .order("event_date", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });
  if (!result.error) return (result.data ?? []) as MomentRow[];
  if (!isMissingMomentMediaColumn(result.error)) return [];

  const legacy = await supabase
    .from("site_moments")
    .select("id,title,moment_type,event_date,location,caption,media_url,external_url,published")
    .eq("published", true)
    .order("event_date", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });
  return legacy.error ? [] : (legacy.data ?? []) as MomentRow[];
}

async function getAdminMomentRows(supabase: SupabaseClient): Promise<MomentRow[]> {
  const result = await supabase
    .from("site_moments")
    .select(momentColumns)
    .order("event_date", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });
  if (!result.error) return (result.data ?? []) as MomentRow[];
  if (!isMissingMomentMediaColumn(result.error)) return [];

  const legacy = await supabase
    .from("site_moments")
    .select("id,title,moment_type,event_date,location,caption,media_url,external_url,published")
    .order("event_date", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });
  return legacy.error ? [] : (legacy.data ?? []) as MomentRow[];
}

function isMissingMomentMediaColumn(error: { code?: string; message?: string }): boolean {
  return (
    ["42703", "PGRST204"].includes(error.code ?? "")
    || /media_type|poster_url/i.test(error.message ?? "")
  );
}

function weekKeyFromTimestamp(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : getIsoWeekKey(date);
}
