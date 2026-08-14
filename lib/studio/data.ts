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

const siteContentColumns =
  "content_key,title,class_name,event_date,focus,url,label,published";
const momentColumns =
  "id,title,moment_type,event_date,location,caption,media_url,external_url,published";

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

  const [siteResult, momentResult] = await Promise.all([
    supabase.from("site_content").select(siteContentColumns).eq("published", true),
    supabase
      .from("site_moments")
      .select(momentColumns)
      .eq("published", true)
      .order("event_date", { ascending: false, nullsFirst: false })
      .order("created_at", { ascending: false }),
  ]);

  const content = siteResult.error || !siteResult.data
    ? { ...emptyPublicSiteContent }
    : rowsToSiteContent(siteResult.data as SiteContentRow[]);
  content.moments = momentResult.error || !momentResult.data
    ? []
    : rowsToMoments(momentResult.data as MomentRow[]);
  return content;
}

export async function getAdminSiteContent(
  supabase: SupabaseClient,
): Promise<PublicSiteContent> {
  const [siteResult, momentResult] = await Promise.all([
    supabase.from("site_content").select(siteContentColumns),
    supabase
      .from("site_moments")
      .select(momentColumns)
      .order("event_date", { ascending: false, nullsFirst: false })
      .order("created_at", { ascending: false }),
  ]);

  const content = siteResult.error || !siteResult.data
    ? { ...emptyPublicSiteContent }
    : rowsToSiteContent(siteResult.data as SiteContentRow[]);
  content.moments = momentResult.error || !momentResult.data
    ? []
    : rowsToMoments(momentResult.data as MomentRow[]);
  return content;
}
