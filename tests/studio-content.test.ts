import assert from "node:assert/strict";
import test from "node:test";
import {
  normalizeInstagramPostUrl,
  normalizeSpotifyPlaylistUrl,
  rowsToSiteContent,
  toSpotifyEmbedUrl,
  type SiteContentRow,
} from "../lib/studio/content.ts";

test("accepts and normalizes Spotify playlist URLs only", () => {
  assert.equal(
    normalizeSpotifyPlaylistUrl(
      "https://open.spotify.com/playlist/37i9dQZF1DX76Wlfdnj7AP?si=example",
    ),
    "https://open.spotify.com/playlist/37i9dQZF1DX76Wlfdnj7AP",
  );
  assert.equal(normalizeSpotifyPlaylistUrl("https://open.spotify.com/track/abc"), null);
  assert.equal(normalizeSpotifyPlaylistUrl("http://open.spotify.com/playlist/abc"), null);
  assert.equal(normalizeSpotifyPlaylistUrl("https://open.spotify.com.evil.test/playlist/abc"), null);
  assert.equal(
    toSpotifyEmbedUrl("https://open.spotify.com/playlist/37i9dQZF1DX76Wlfdnj7AP"),
    "https://open.spotify.com/embed/playlist/37i9dQZF1DX76Wlfdnj7AP",
  );
  assert.equal(toSpotifyEmbedUrl("https://open.spotify.com/track/abc"), null);
});

test("accepts and normalizes public Instagram post and Reel URLs only", () => {
  assert.equal(
    normalizeInstagramPostUrl("https://instagram.com/reel/ABC_123/?igsh=example"),
    "https://www.instagram.com/reel/ABC_123/",
  );
  assert.equal(
    normalizeInstagramPostUrl("https://www.instagram.com/p/POST-123/"),
    "https://www.instagram.com/p/POST-123/",
  );
  assert.equal(normalizeInstagramPostUrl("https://www.instagram.com/mir.i.am_vd/"), null);
  assert.equal(normalizeInstagramPostUrl("https://instagram.example/reel/ABC_123/"), null);
});

test("maps normalized database rows without turning drafts into published content", () => {
  const rows: SiteContentRow[] = [
    {
      content_key: "spotify",
      title: "Power & Speed",
      class_name: "RIDE: PERFORMANCE",
      event_date: null,
      focus: "Power / Speed / Endurance",
      url: "https://open.spotify.com/playlist/abc123",
      label: null,
      published: false,
    },
    {
      content_key: "instagram",
      title: null,
      class_name: null,
      event_date: null,
      focus: null,
      url: "https://www.instagram.com/reel/ABC_123/",
      label: "Saturday RIDE energy",
      published: true,
    },
  ];

  const content = rowsToSiteContent(rows);
  assert.equal(content.spotify?.published, false);
  assert.equal(content.instagram?.published, true);
  assert.equal(content.instagram?.label, "Saturday RIDE energy");
});
