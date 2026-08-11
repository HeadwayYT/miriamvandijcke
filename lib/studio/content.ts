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
  published: boolean;
};

export type PublicSiteContent = {
  spotify: SpotifyContent | null;
  instagram: InstagramContent | null;
};

export type SiteContentRow = {
  content_key: "spotify" | "instagram";
  title: string | null;
  class_name: string | null;
  event_date: string | null;
  focus: string | null;
  url: string;
  label: string | null;
  published: boolean;
};

export const emptyPublicSiteContent: PublicSiteContent = {
  spotify: null,
  instagram: null,
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
      result.instagram = {
        postUrl: normalizedUrl,
        label: row.label,
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
