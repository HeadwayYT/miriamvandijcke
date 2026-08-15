"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSupabaseRuntimeConfig } from "@/lib/supabase/config";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import {
  aboutCoverStoragePath,
  aboutImagesBucket,
  cleanText,
  isMomentType,
  momentImagesBucket,
  momentImageStoragePath,
  normalizeExternalUrl,
  normalizeInstagramPostUrl,
  normalizeMomentMediaUrl,
  normalizeSpotifyPlaylistUrl,
} from "@/lib/studio/content";
import { isStudioAdmin } from "@/lib/studio/data";

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
    redirect("/studio?error=spotify-validation#spotify");
  }

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
      updated_at: new Date().toISOString(),
      updated_by: userId,
    },
    { onConflict: "content_key" },
  );

  if (error) redirect("/studio?error=save#spotify");
  refreshContent();
  redirect("/studio?success=spotify#spotify");
}

export async function saveInstagramContent(formData: FormData) {
  const { config, supabase, userId } = await requireStudioAdmin();
  const postUrl = normalizeInstagramPostUrl(cleanText(formData.get("postUrl"), 500));
  const label = cleanText(formData.get("label"), 80);
  const coverUrlValue = cleanText(formData.get("coverUrl"), 1000);
  const coverUrl = coverUrlValue ? normalizeMomentMediaUrl(coverUrlValue) : null;
  const previousCoverUrl = normalizeMomentMediaUrl(
    cleanText(formData.get("previousCoverUrl"), 1000),
  );
  const published = formData.get("status") === "published";

  if (!postUrl || (coverUrlValue && !coverUrl)) {
    redirect("/studio?error=instagram-validation#instagram");
  }

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
      updated_at: new Date().toISOString(),
      updated_by: userId,
    },
    { onConflict: "content_key" },
  );

  if (error) redirect("/studio?error=save#instagram");
  if (previousCoverUrl && previousCoverUrl !== coverUrl) {
    await removeStoredImage(
      supabase,
      previousCoverUrl,
      config.url,
      aboutImagesBucket,
      aboutCoverStoragePath,
    );
  }
  refreshContent();
  redirect("/studio?success=instagram#instagram");
}

export async function saveMoment(formData: FormData) {
  const { config, supabase, userId } = await requireStudioAdmin();
  const id = cleanText(formData.get("id"), 36);
  const title = cleanText(formData.get("title"), 80);
  const type = cleanText(formData.get("type"), 40);
  const dateValue = cleanText(formData.get("date"), 10);
  const location = cleanText(formData.get("location"), 100);
  const caption = cleanText(formData.get("caption"), 240);
  const media = normalizeMomentMediaUrl(cleanText(formData.get("mediaUrl"), 1000));
  const previousMedia = normalizeMomentMediaUrl(
    cleanText(formData.get("previousMediaUrl"), 1000),
  );
  const rawExternalUrl = cleanText(formData.get("externalUrl"), 1000);
  const externalUrl = normalizeExternalUrl(rawExternalUrl);
  const published = formData.get("status") === "published";

  if (
    !title ||
    !isMomentType(type) ||
    !isValidOptionalDate(dateValue) ||
    !location ||
    !caption ||
    !media ||
    (rawExternalUrl && !externalUrl)
  ) {
    redirect("/studio?error=moment-validation#moments");
  }

  const { error } = await supabase.from("site_moments").upsert({
    id: id || crypto.randomUUID(),
    title,
    moment_type: type,
    event_date: dateValue || null,
    location,
    caption,
    media_url: media,
    external_url: externalUrl,
    published,
    updated_at: new Date().toISOString(),
    updated_by: userId,
  });

  if (error) redirect("/studio?error=save#moments");
  if (previousMedia && previousMedia !== media) {
    await removeStoredImage(
      supabase,
      previousMedia,
      config.url,
      momentImagesBucket,
      momentImageStoragePath,
    );
  }
  refreshContent();
  redirect("/studio?success=moment#moments");
}

export async function deleteMoment(formData: FormData) {
  const { config, supabase } = await requireStudioAdmin();
  const id = cleanText(formData.get("id"), 36);
  if (!/^[0-9a-f-]{36}$/i.test(id)) redirect("/studio?error=moment-validation#moments");

  const { data: moment } = await supabase
    .from("site_moments")
    .select("media_url")
    .eq("id", id)
    .maybeSingle();
  const { error } = await supabase.from("site_moments").delete().eq("id", id);
  if (error) redirect("/studio?error=save#moments");
  if (moment?.media_url) {
    await removeStoredImage(
      supabase,
      moment.media_url,
      config.url,
      momentImagesBucket,
      momentImageStoragePath,
    );
  }
  refreshContent();
  redirect("/studio?success=moment-deleted#moments");
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

async function removeStoredImage(
  supabase: NonNullable<Awaited<ReturnType<typeof createServerSupabaseClient>>>,
  mediaUrl: string,
  supabaseUrl: string,
  bucket: string,
  getStoragePath: (value: string, projectUrl: string) => string | null,
) {
  const path = getStoragePath(mediaUrl, supabaseUrl);
  if (path) await supabase.storage.from(bucket).remove([path]);
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
