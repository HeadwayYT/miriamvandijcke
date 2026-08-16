export type ContentStatus = "draft" | "published";

export type SpotifyContent = {
  title: string;
  className: string;
  date: string | null;
  focus: string;
  playlistUrl: string;
  published: boolean;
};

export type InstagramContent = {
  postUrl: string;
  label: string | null;
  coverUrl: string | null;
  published: boolean;
};

export const momentTypes = [
  "Weekly class",
  "Special ride",
  "Fitness event",
  "Guest class",
  "Studio collaboration",
  "Brand collaboration",
  "Other",
] as const;

export const momentImagesBucket = "moment-images";
export const aboutImagesBucket = "about-images";

export const momentMediaTypes = ["photo", "video"] as const;
export type MomentMediaType = (typeof momentMediaTypes)[number];

export type MomentType = (typeof momentTypes)[number];
export type MomentContent = {
  id: string;
  title: string;
  type: MomentType;
  date: string | null;
  location: string;
  caption: string;
  mediaType: MomentMediaType;
  mediaUrl: string;
  posterUrl: string | null;
  externalUrl: string | null;
  published: boolean;
};

export type PublicSiteContent = {
  spotify: SpotifyContent | null;
  instagram: InstagramContent | null;
  moments: MomentContent[];
};

export type SiteContentRow = {
  content_key: "spotify" | "instagram";
  title: string | null;
  class_name: string | null;
  event_date: string | null;
  focus: string | null;
  url: string;
  label: string | null;
  cover_url?: string | null;
  published: boolean;
};

export type MomentRow = {
  id: string;
  title: string;
  moment_type: string;
  event_date: string | null;
  location: string;
  caption: string;
  media_type?: string | null;
  media_url: string;
  poster_url?: string | null;
  external_url: string | null;
  published: boolean;
};

export const emptyPublicSiteContent: PublicSiteContent = {
  spotify: null,
  instagram: null,
  moments: [],
};

export function normalizeSpotifyPlaylistUrl(value: string): string | null {
  const url = parseHttpsUrl(value);
  if (!url || url.hostname !== "open.spotify.com") return null;

  const segments = url.pathname.split("/").filter(Boolean);
  const playlistIndex = segments.indexOf("playlist");
  const playlistId = playlistIndex >= 0 ? segments[playlistIndex + 1] : null;
  if (!playlistId || !/^[a-zA-Z0-9]+$/.test(playlistId)) return null;

  return `https://open.spotify.com/playlist/${playlistId}`;
}

export function toSpotifyEmbedUrl(value: string): string | null {
  const normalized = normalizeSpotifyPlaylistUrl(value);
  if (!normalized) return null;

  return normalized.replace(
    "https://open.spotify.com/playlist/",
    "https://open.spotify.com/embed/playlist/",
  );
}

export function normalizeInstagramPostUrl(value: string): string | null {
  const url = parseHttpsUrl(value);
  if (!url || !["instagram.com", "www.instagram.com"].includes(url.hostname)) {
    return null;
  }

  const segments = url.pathname.split("/").filter(Boolean);
  const contentType = segments[0];
  const contentId = segments[1];
  if (!["p", "reel"].includes(contentType) || !contentId) return null;
  if (!/^[a-zA-Z0-9_-]+$/.test(contentId)) return null;

  return `https://www.instagram.com/${contentType}/${contentId}/`;
}

export function normalizeExternalUrl(value: string): string | null {
  if (!value.trim()) return null;
  const url = parseHttpsUrl(value);
  if (!url || url.username || url.password) return null;
  return url.toString();
}

export function normalizeMomentMediaUrl(
  value: string,
  mediaType: MomentMediaType = "photo",
): string | null {
  return mediaType === "video"
    ? normalizeVideoMediaUrl(value)
    : normalizeImageMediaUrl(value);
}

export function normalizeImageMediaUrl(value: string): string | null {
  const url = parseHttpsUrl(value);
  if (!url || url.username || url.password) return null;

  const extension = url.pathname.split(".").pop()?.toLowerCase();
  if (["jpg", "jpeg", "png", "webp", "avif"].includes(extension ?? "")) {
    return url.toString();
  }
  return null;
}

export function normalizeVideoMediaUrl(value: string): string | null {
  const url = parseHttpsUrl(value);
  if (!url || url.username || url.password) return null;

  const extension = url.pathname.split(".").pop()?.toLowerCase();
  return ["mp4", "webm"].includes(extension ?? "") ? url.toString() : null;
}

export function isMomentMediaType(value: string): value is MomentMediaType {
  return momentMediaTypes.includes(value as MomentMediaType);
}

export function momentImageStoragePath(value: string, supabaseUrl: string): string | null {
  return storageMediaPath(value, supabaseUrl, momentImagesBucket, normalizeImageMediaUrl);
}

export function momentMediaStoragePath(value: string, supabaseUrl: string): string | null {
  return storageMediaPath(
    value,
    supabaseUrl,
    momentImagesBucket,
    (candidate) => normalizeImageMediaUrl(candidate) ?? normalizeVideoMediaUrl(candidate),
  );
}

export function aboutCoverStoragePath(value: string, supabaseUrl: string): string | null {
  return storageMediaPath(value, supabaseUrl, aboutImagesBucket, normalizeImageMediaUrl);
}

export function isMomentType(value: string): value is MomentType {
  return momentTypes.includes(value as MomentType);
}

export function momentGridClassName(count: number): string {
  if (count === 1) return "moments-grid is-single";
  if (count === 2) return "moments-grid is-pair";
  if (count === 4) return "moments-grid is-four";
  return "moments-grid";
}

export function rowsToMoments(rows: MomentRow[]): MomentContent[] {
  return rows.flatMap((row) => {
    const storedMediaType = row.media_type ?? "photo";
    const mediaType: MomentMediaType = isMomentMediaType(storedMediaType)
      ? storedMediaType
      : "photo";
    const media = normalizeMomentMediaUrl(row.media_url, mediaType);
    const posterUrl = row.poster_url ? normalizeImageMediaUrl(row.poster_url) : null;
    const externalUrl = row.external_url ? normalizeExternalUrl(row.external_url) : null;
    if (
      !row.id ||
      !row.title ||
      !isMomentType(row.moment_type) ||
      !row.location ||
      !row.caption ||
      !media ||
      (row.poster_url && !posterUrl) ||
      (row.external_url && !externalUrl)
    ) {
      return [];
    }

    return [{
      id: row.id,
      title: row.title,
      type: row.moment_type,
      date: row.event_date,
      location: row.location,
      caption: row.caption,
      mediaType,
      mediaUrl: media,
      posterUrl: mediaType === "video" ? posterUrl : null,
      externalUrl,
      published: row.published,
    }];
  });
}

export function rowsToSiteContent(rows: SiteContentRow[]): PublicSiteContent {
  const result: PublicSiteContent = { ...emptyPublicSiteContent };

  for (const row of rows) {
    const normalizedUrl =
      row.content_key === "spotify"
        ? normalizeSpotifyPlaylistUrl(row.url)
        : normalizeInstagramPostUrl(row.url);

    if (
      row.content_key === "spotify" &&
      row.title &&
      row.class_name &&
      row.focus &&
      normalizedUrl
    ) {
      result.spotify = {
        title: row.title,
        className: row.class_name,
        date: row.event_date,
        focus: row.focus,
        playlistUrl: normalizedUrl,
        published: row.published,
      };
    }

    if (row.content_key === "instagram" && normalizedUrl) {
      const coverUrl = row.cover_url ? normalizeImageMediaUrl(row.cover_url) : null;
      result.instagram = {
        postUrl: normalizedUrl,
        label: row.label,
        coverUrl,
        published: row.published,
      };
    }
  }

  return result;
}

export function cleanText(value: FormDataEntryValue | null, maxLength: number): string {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function parseHttpsUrl(value: string): URL | null {
  try {
    const url = new URL(value.trim());
    return url.protocol === "https:" ? url : null;
  } catch {
    return null;
  }
}

function storageMediaPath(
  value: string,
  supabaseUrl: string,
  bucket: string,
  normalize: (value: string) => string | null,
): string | null {
  const mediaUrl = normalize(value);
  const projectUrl = parseHttpsUrl(supabaseUrl);
  if (!mediaUrl || !projectUrl) return null;

  const url = new URL(mediaUrl);
  const prefix = `/storage/v1/object/public/${bucket}/`;
  if (url.origin !== projectUrl.origin || !url.pathname.startsWith(prefix)) return null;

  let path: string;
  try {
    path = decodeURIComponent(url.pathname.slice(prefix.length));
  } catch {
    return null;
  }
  if (!path || path.split("/").some((segment) => !segment || segment === "..")) return null;
  return path;
}
