export type SupabaseRuntimeConfig = {
  url: string;
  publishableKey: string;
  adminEmail: string;
};

export function getSupabaseRuntimeConfig(): SupabaseRuntimeConfig | null {
  const url = process.env.SUPABASE_URL?.trim();
  const publishableKey = process.env.SUPABASE_PUBLISHABLE_KEY?.trim();
  const adminEmail = process.env.STUDIO_ADMIN_EMAIL?.trim().toLowerCase();

  if (!url || !publishableKey || !adminEmail || !isValidUrl(url)) return null;

  return { url, publishableKey, adminEmail };
}

export function getMissingStudioEnvironment(): string[] {
  const missing: string[] = [];
  if (!process.env.SUPABASE_URL?.trim()) missing.push("SUPABASE_URL");
  if (!process.env.SUPABASE_PUBLISHABLE_KEY?.trim()) {
    missing.push("SUPABASE_PUBLISHABLE_KEY");
  }
  if (!process.env.STUDIO_ADMIN_EMAIL?.trim()) missing.push("STUDIO_ADMIN_EMAIL");
  return missing;
}

function isValidUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "https:";
  } catch {
    return false;
  }
}
