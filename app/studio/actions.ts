"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSupabaseRuntimeConfig } from "@/lib/supabase/config";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import {
  cleanText,
  normalizeInstagramPostUrl,
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
  const { supabase, userId } = await requireStudioAdmin();
  const postUrl = normalizeInstagramPostUrl(cleanText(formData.get("postUrl"), 500));
  const label = cleanText(formData.get("label"), 80);
  const published = formData.get("status") === "published";

  if (!postUrl) redirect("/studio?error=instagram-validation#instagram");

  const { error } = await supabase.from("site_content").upsert(
    {
      content_key: "instagram",
      title: null,
      class_name: null,
      event_date: null,
      focus: null,
      url: postUrl,
      label: label || null,
      published,
      updated_at: new Date().toISOString(),
      updated_by: userId,
    },
    { onConflict: "content_key" },
  );

  if (error) redirect("/studio?error=save#instagram");
  refreshContent();
  redirect("/studio?success=instagram#instagram");
}

async function requireStudioAdmin() {
  const supabase = await createServerSupabaseClient();
  if (!supabase) redirect("/studio?error=setup");

  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user || !isStudioAdmin(data.user)) {
    redirect("/studio?error=unauthorized");
  }

  return { supabase, userId: data.user.id };
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
