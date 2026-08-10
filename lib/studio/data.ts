import type { SupabaseClient, User } from "@supabase/supabase-js";
import { getSupabaseRuntimeConfig } from "@/lib/supabase/config";
import { createPublicSupabaseClient } from "@/lib/supabase/server";
import {
  emptyPublicSiteContent,
  rowsToSiteContent,
  type PublicSiteContent,
  type SiteContentRow,
} from "./content";

const siteContentColumns =
  "content_key,title,class_name,event_date,focus,url,label,published";

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

  const { data, error } = await supabase
    .from("site_content")
    .select(siteContentColumns)
    .eq("published", true);

  if (error || !data) return emptyPublicSiteContent;
  return rowsToSiteContent(data as SiteContentRow[]);
}

export async function getAdminSiteContent(
  supabase: SupabaseClient,
): Promise<PublicSiteContent> {
  const { data, error } = await supabase.from("site_content").select(siteContentColumns);
  if (error || !data) return emptyPublicSiteContent;
  return rowsToSiteContent(data as SiteContentRow[]);
}
