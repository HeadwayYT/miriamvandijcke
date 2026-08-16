"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSupabaseRuntimeConfig } from "@/lib/supabase/config";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import {
  aboutCoverStoragePath,
  aboutImagesBucket,
  cleanText,
  isMomentMediaType,
  isMomentType,
  momentImagesBucket,
  momentImageStoragePath,
  momentMediaStoragePath,
  normalizeExternalUrl,
  normalizeImageMediaUrl,
  normalizeInstagramPostUrl,
  normalizeMomentMediaUrl,
  normalizeSpotifyPlaylistUrl,
} from "@/lib/studio/content";
import { isStudioAdmin } from "@/lib/studio/data";
import {
  getBelgiumDateKey,
  parsePositiveFollowerCount,
  rowsToFollowerSnapshots,
  type FollowerSnapshotRow,
} from "@/lib/studio/followers";
import {
  getIsoWeekKey,
  manualShareSourceId,
  type MomentumAction,
} from "@/lib/studio/momentum";

export async function signInStudio(formData: FormData) {
  const config = getSupabaseRuntimeConfig();
  const supabase = await createServerSupabaseClient();
  if (!config || !supabase) redirect("/studio?error=setup");

  const email = cleanText(formData.get("email"), 160).toLowerCase();
  const password = cleanText(formData.get("password"), 200);
  if (!email || !password || email !== config.adminEmail) {
    redirect("/studio?error=signin");
  }

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) redirect("/studio?error=signin");

  const { data } = await supabase.auth.getUser();
  if (!data.user || !isStudioAdmin(data.user)) {
    await supabase.auth.signOut();
    redirect("/studio?error=unauthorized");
  }

  revalidatePath("/studio");
  redirect("/studio");
}

export async function signOutStudio() {
  const supabase = await createServerSupabaseClient();
  if (supabase) await supabase.auth.signOut();
  revalidatePath("/studio");
  redirect("/studio");
}

export async function saveSpotifyContent(formData: FormData) {
  const { supabase, userId } = await requireStudioAdmin();
  const title = cleanText(formData.get("title"), 80);
  const className = cleanText(formData.get("className"), 60);
  const focus = cleanText(formData.get("focus"), 120);
  const dateValue = cleanText(formData.get("date"), 10);
  const playlistUrl = normalizeSpotifyPlaylistUrl(cleanText(formData.get("playlistUrl"), 500));
  const published = formData.get("status") === "published";

  if (!title || !className || !focus || !playlistUrl || !isValidOptionalDate(dateValue)) {
    redirect("/studio?editor=spotify&error=spotify-validation#spotify");
  }

  const savedAt = new Date();
  const { error } = await supabase.from("site_content").upsert(
    {
      content_key: "spotify",
      title,
      class_name: className,
      event_date: dateValue || null,
      focus,
      url: playlistUrl,
      label: null,
      published,
      updated_at: savedAt.toISOString(),
      updated_by: userId,
    },
    { onConflict: "content_key" },
  );

  if (error) redirect("/studio?editor=spotify&error=save#spotify");
  if (published) {
    await recordStudioActivity(supabase, userId, "connect", "spotify", savedAt);
  }
  refreshContent();
  redirect("/studio?editor=spotify&success=spotify#spotify");
}

export async function saveInstagramContent(formData: FormData) {
  const { config, supabase, userId } = await requireStudioAdmin();
  const postUrl = normalizeInstagramPostUrl(cleanText(formData.get("postUrl"), 500));
  const label = cleanText(formData.get("label"), 80);
  const coverUrlValue = cleanText(formData.get("coverUrl"), 1000);
  const coverUrl = coverUrlValue ? normalizeImageMediaUrl(coverUrlValue) : null;
  const previousCoverUrl = normalizeImageMediaUrl(
    cleanText(formData.get("previousCoverUrl"), 1000),
  );
  const published = formData.get("status") === "published";

  if (!postUrl || (coverUrlValue && !coverUrl)) {
    redirect("/studio?editor=instagram&error=instagram-validation#instagram");
  }

  const savedAt = new Date();
  const { error } = await supabase.from("site_content").upsert(
    {
      content_key: "instagram",
      title: null,
      class_name: null,
      event_date: null,
      focus: null,
      url: postUrl,
      label: label || null,
      cover_url: coverUrl,
      published,
      updated_at: savedAt.toISOString(),
      updated_by: userId,
    },
    { onConflict: "content_key" },
  );

  if (error) redirect("/studio?editor=instagram&error=save#instagram");
  if (previousCoverUrl && previousCoverUrl !== coverUrl) {
    await removeStoredMedia(
      supabase,
      previousCoverUrl,
      config.url,
      aboutImagesBucket,
      aboutCoverStoragePath,
    );
  }
  refreshContent();
  redirect("/studio?editor=instagram&success=instagram#instagram");
}

export async function saveMoment(formData: FormData) {
  const { config, supabase, userId } = await requireStudioAdmin();
  const id = cleanText(formData.get("id"), 36);
  const title = cleanText(formData.get("title"), 80);
  const type = cleanText(formData.get("type"), 40);
  const dateValue = cleanText(formData.get("date"), 10);
  const location = cleanText(formData.get("location"), 100);
  const caption = cleanText(formData.get("caption"), 240);
  const mediaType = cleanText(formData.get("mediaType"), 10);
  const previousMediaType = cleanText(formData.get("previousMediaType"), 10);
  const media = isMomentMediaType(mediaType)
    ? normalizeMomentMediaUrl(cleanText(formData.get("mediaUrl"), 1000), mediaType)
    : null;
  const previousMedia = normalizeMomentMediaUrl(
    cleanText(formData.get("previousMediaUrl"), 1000),
    isMomentMediaType(previousMediaType) ? previousMediaType : "photo",
  );
  const posterValue = cleanText(formData.get("posterUrl"), 1000);
  const posterUrl = mediaType === "video" && posterValue
    ? normalizeImageMediaUrl(posterValue)
    : null;
  const previousPosterUrl = normalizeImageMediaUrl(
    cleanText(formData.get("previousPosterUrl"), 1000),
  );
  const rawExternalUrl = cleanText(formData.get("externalUrl"), 1000);
  const externalUrl = normalizeExternalUrl(rawExternalUrl);
  const published = formData.get("status") === "published";
  const momentId = id || crypto.randomUUID();

  if (id && !/^[0-9a-f-]{36}$/i.test(id)) {
    redirect("/studio?editor=moments&error=moment-validation#moments");
  }

  if (
    !title ||
    !isMomentType(type) ||
    !isMomentMediaType(mediaType) ||
    !isValidOptionalDate(dateValue) ||
    !location ||
    !caption ||
    !media ||
    (posterValue && !posterUrl) ||
    (rawExternalUrl && !externalUrl)
  ) {
    redirect("/studio?editor=moments&error=moment-validation#moments");
  }

  const { data: existingMoment } = id
    ? await supabase.from("site_moments").select("id").eq("id", id).maybeSingle()
    : { data: null };
  const shouldCapture = !id || !existingMoment;
  const savedAt = new Date();
  const { error } = await supabase.from("site_moments").upsert({
    id: momentId,
    title,
    moment_type: type,
    event_date: dateValue || null,
    location,
    caption,
    media_type: mediaType,
    media_url: media,
    poster_url: posterUrl,
    external_url: externalUrl,
    published,
    updated_at: savedAt.toISOString(),
    updated_by: userId,
  });

  if (error) redirect("/studio?editor=moments&error=save#moments");
  if (shouldCapture) {
    await recordStudioActivity(supabase, userId, "capture", momentId, savedAt);
  }
  if (previousMedia && previousMedia !== media) {
    await removeStoredMedia(
      supabase,
      previousMedia,
      config.url,
      momentImagesBucket,
      momentMediaStoragePath,
    );
  }
  if (previousPosterUrl && previousPosterUrl !== posterUrl) {
    await removeStoredMedia(
      supabase,
      previousPosterUrl,
      config.url,
      momentImagesBucket,
      momentImageStoragePath,
    );
  }
  refreshContent();
  redirect("/studio?editor=moments&success=moment#moments");
}

export async function saveInstagramFollowerCount(rawValue: unknown) {
  const { supabase, userId } = await requireStudioAdmin();
  const followerCount = parsePositiveFollowerCount(rawValue);
  if (followerCount === null) return { ok: false as const };

  const savedAt = new Date();
  const { data, error } = await supabase.from("instagram_follower_snapshots").upsert(
    {
      snapshot_date: getBelgiumDateKey(savedAt),
      follower_count: followerCount,
      updated_at: savedAt.toISOString(),
      updated_by: userId,
    },
    { onConflict: "updated_by,snapshot_date" },
  ).select("id,snapshot_date,follower_count,created_at,updated_at").single();

  if (error || !data) return { ok: false as const };
  const snapshot = rowsToFollowerSnapshots([data as FollowerSnapshotRow])[0];
  if (!snapshot) return { ok: false as const };

  revalidatePath("/studio");
  return { ok: true as const, snapshot };
}

export async function markShareCompleted(formData: FormData) {
  const { supabase, userId } = await requireStudioAdmin();
  const rawShareUrl = cleanText(formData.get("shareUrl"), 1000);
  const shareUrl = rawShareUrl ? normalizeExternalUrl(rawShareUrl) : null;

  if (rawShareUrl && !shareUrl) {
    redirect("/studio?error=share-validation#momentum");
  }

  const occurredAt = new Date();
  const { error } = await supabase.from("studio_activity").upsert(
    {
      action_type: "share",
      week_key: getIsoWeekKey(occurredAt),
      source_id: manualShareSourceId,
      source_url: shareUrl,
      occurred_at: occurredAt.toISOString(),
      updated_by: userId,
    },
    { onConflict: "action_type,week_key,source_id" },
  );

  if (error) redirect("/studio?error=save#momentum");
  revalidatePath("/studio");
  redirect("/studio?success=share#momentum");
}

export async function deleteMoment(formData: FormData) {
  const { config, supabase } = await requireStudioAdmin();
  const id = cleanText(formData.get("id"), 36);
  if (!/^[0-9a-f-]{36}$/i.test(id)) {
    redirect("/studio?editor=moments&error=moment-validation#moments");
  }

  const { data: moment } = await supabase
    .from("site_moments")
    .select("media_url,poster_url")
    .eq("id", id)
    .maybeSingle();
  const { error } = await supabase.from("site_moments").delete().eq("id", id);
  if (error) redirect("/studio?editor=moments&error=save#moments");
  if (moment?.media_url) {
    await removeStoredMedia(
      supabase,
      moment.media_url,
      config.url,
      momentImagesBucket,
      momentMediaStoragePath,
    );
  }
  if (moment?.poster_url) {
    await removeStoredMedia(
      supabase,
      moment.poster_url,
      config.url,
      momentImagesBucket,
      momentImageStoragePath,
    );
  }
  refreshContent();
  redirect("/studio?editor=moments&success=moment-deleted#moments");
}

async function requireStudioAdmin() {
  const config = getSupabaseRuntimeConfig();
  const supabase = await createServerSupabaseClient();
  if (!config || !supabase) redirect("/studio?error=setup");

  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user || !isStudioAdmin(data.user)) {
    redirect("/studio?error=unauthorized");
  }

  return { config, supabase, userId: data.user.id };
}

async function removeStoredMedia(
  supabase: NonNullable<Awaited<ReturnType<typeof createServerSupabaseClient>>>,
  mediaUrl: string,
  supabaseUrl: string,
  bucket: string,
  getStoragePath: (value: string, projectUrl: string) => string | null,
) {
  const path = getStoragePath(mediaUrl, supabaseUrl);
  if (path) await supabase.storage.from(bucket).remove([path]);
}

async function recordStudioActivity(
  supabase: NonNullable<Awaited<ReturnType<typeof createServerSupabaseClient>>>,
  userId: string,
  action: MomentumAction,
  sourceId: string,
  occurredAt: Date,
) {
  const { error } = await supabase.from("studio_activity").upsert(
    {
      action_type: action,
      week_key: getIsoWeekKey(occurredAt),
      source_id: sourceId,
      occurred_at: occurredAt.toISOString(),
      updated_by: userId,
    },
    {
      ignoreDuplicates: true,
      onConflict: "action_type,week_key,source_id",
    },
  );

  if (error && !["42P01", "PGRST205"].includes(error.code)) {
    console.error("Unable to record Studio momentum activity", error.code);
  }
}

function refreshContent() {
  revalidatePath("/");
  revalidatePath("/api/site-content");
  revalidatePath("/studio");
}

function isValidOptionalDate(value: string): boolean {
  if (!value) return true;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  return !Number.isNaN(Date.parse(`${value}T00:00:00Z`));
}
