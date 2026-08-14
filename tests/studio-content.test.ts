import assert from "node:assert/strict";
import test from "node:test";
import {
  normalizeInstagramPostUrl,
  normalizeExternalUrl,
  normalizeMomentMediaUrl,
  normalizeSpotifyPlaylistUrl,
  rowsToMoments,
  rowsToSiteContent,
  toSpotifyEmbedUrl,
  type SiteContentRow,
  type MomentRow,
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

test("accepts only direct HTTPS media URLs for Moments", () => {
  assert.equal(normalizeMomentMediaUrl("https://cdn.example.com/pride-ride.JPG?width=1200"), "https://cdn.example.com/pride-ride.JPG?width=1200");
  assert.equal(normalizeMomentMediaUrl("https://cdn.example.com/ride.webm"), null);
  assert.equal(normalizeMomentMediaUrl("http://cdn.example.com/photo.jpg"), null);
  assert.equal(normalizeMomentMediaUrl("https://cdn.example.com/photo.svg"), null);
  assert.equal(normalizeMomentMediaUrl("https://cdn.example.com/media"), null);
  assert.equal(normalizeExternalUrl("javascript:alert(1)"), null);
  assert.equal(normalizeExternalUrl("https://www.instagram.com/p/ABC/"), "https://www.instagram.com/p/ABC/");
});

test("maps valid Moments and drops malformed portfolio records", () => {
  const rows: MomentRow[] = [
    {
      id: "11111111-1111-4111-8111-111111111111",
      title: "Pride Ride",
      moment_type: "Special ride",
      event_date: "2026-08-05",
      location: "Pulsate Antwerp",
      caption: "A real ride from Antwerp Pride week.",
      media_url: "https://cdn.example.com/pride.jpg",
      external_url: "https://www.instagram.com/p/ABC/",
      published: true,
    },
    {
      id: "22222222-2222-4222-8222-222222222222",
      title: "Broken",
      moment_type: "Influencer campaign",
      event_date: null,
      location: "Antwerp",
      caption: "Invalid type.",
      media_url: "https://cdn.example.com/image.jpg",
      external_url: null,
      published: true,
    },
  ];

  assert.deepEqual(rowsToMoments(rows), [{
    id: "11111111-1111-4111-8111-111111111111",
    title: "Pride Ride",
    type: "Special ride",
    date: "2026-08-05",
    location: "Pulsate Antwerp",
    caption: "A real ride from Antwerp Pride week.",
    mediaUrl: "https://cdn.example.com/pride.jpg",
    externalUrl: "https://www.instagram.com/p/ABC/",
    published: true,
  }]);
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

test("drops malformed stored URLs instead of exposing broken public content", () => {
  const rows: SiteContentRow[] = [
    {
      content_key: "spotify",
      title: "Power & Speed",
      class_name: "RIDE: PERFORMANCE",
      event_date: null,
      focus: "Power / Speed / Endurance",
      url: "https://open.spotify.com/track/not-a-playlist",
      label: null,
      published: true,
    },
    {
      content_key: "instagram",
      title: null,
      class_name: null,
      event_date: null,
      focus: null,
      url: "https://www.instagram.com/mir.i.am_vd/",
      label: "Not a post",
      published: true,
    },
  ];

  assert.deepEqual(rowsToSiteContent(rows), {
    spotify: null,
    instagram: null,
    moments: [],
  });
});
