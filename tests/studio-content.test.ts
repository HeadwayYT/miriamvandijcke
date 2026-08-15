import assert from "node:assert/strict";
import test from "node:test";
import {
  aboutCoverStoragePath,
  normalizeInstagramPostUrl,
  normalizeExternalUrl,
  normalizeMomentMediaUrl,
  momentImageStoragePath,
  momentGridClassName,
  normalizeSpotifyPlaylistUrl,
  rowsToMoments,
  rowsToSiteContent,
  toSpotifyEmbedUrl,
  type SiteContentRow,
  type MomentRow,
} from "../lib/studio/content.ts";
import {
  calculateMomentumStatus,
  getIsoWeekKey,
  isTrustedMomentumSource,
  manualShareSourceId,
  previousIsoWeekKey,
} from "../lib/studio/momentum.ts";

test("uses Belgium-local ISO weeks across Sunday, Monday and year boundaries", () => {
  assert.equal(getIsoWeekKey(new Date("2026-08-16T21:59:59Z")), "2026-W33");
  assert.equal(getIsoWeekKey(new Date("2026-08-16T22:00:00Z")), "2026-W34");
  assert.equal(getIsoWeekKey(new Date("2027-01-01T12:00:00Z")), "2026-W53");
  assert.equal(previousIsoWeekKey("2027-W01"), "2026-W53");
});

test("counts unique weekly actions and qualifies two of three as momentum", () => {
  const status = calculateMomentumStatus([
    { action: "capture", weekKey: "2026-W33" },
    { action: "capture", weekKey: "2026-W33" },
    { action: "share", weekKey: "2026-W33" },
  ], new Date("2026-08-13T12:00:00Z"));

  assert.deepEqual(status.completed, {
    capture: true,
    share: true,
    connect: false,
  });
  assert.equal(status.completedCount, 2);
  assert.equal(status.isMomentumWeek, true);
});

test("uses manual weekly shares instead of featured Instagram curation", () => {
  assert.equal(isTrustedMomentumSource("share", manualShareSourceId), true);
  assert.equal(isTrustedMomentumSource("share", "instagram"), false);
  assert.equal(isTrustedMomentumSource("capture", "moment-id"), true);

  const status = calculateMomentumStatus([
    {
      action: "share",
      sourceUrl: "https://www.instagram.com/reel/ABC_123/",
      weekKey: "2026-W33",
    },
  ], new Date("2026-08-13T12:00:00Z"));

  assert.equal(status.completed.share, true);
  assert.equal(status.currentShareUrl, "https://www.instagram.com/reel/ABC_123/");
});

test("models the Momentum root scenarios and treats two of three as secured", () => {
  const now = new Date("2026-08-13T12:00:00Z");
  const capture = { action: "capture" as const, weekKey: "2026-W33" };
  const share = { action: "share" as const, weekKey: "2026-W33" };
  const connect = { action: "connect" as const, weekKey: "2026-W33" };

  const draftOnly = calculateMomentumStatus([capture], now);
  assert.deepEqual(draftOnly.completed, {
    capture: true,
    share: false,
    connect: false,
  });
  assert.equal(draftOnly.isMomentumWeek, false);

  const captureAndShare = calculateMomentumStatus([capture, share], now);
  assert.equal(captureAndShare.completedCount, 2);
  assert.equal(captureAndShare.isMomentumWeek, true);

  const shareAndConnect = calculateMomentumStatus([share, connect], now);
  assert.equal(shareAndConnect.completedCount, 2);
  assert.equal(shareAndConnect.isMomentumWeek, true);

  const allThree = calculateMomentumStatus([capture, share, connect], now);
  assert.equal(allThree.completedCount, 3);
  assert.equal(allThree.isMomentumWeek, true);
});

test("continues streaks equally for two-of-three and three-of-three weeks", () => {
  const twoOfThree = calculateMomentumStatus([
    { action: "capture", weekKey: "2026-W32" },
    { action: "share", weekKey: "2026-W32" },
    { action: "capture", weekKey: "2026-W33" },
    { action: "connect", weekKey: "2026-W33" },
  ], new Date("2026-08-13T12:00:00Z"));
  const threeOfThree = calculateMomentumStatus([
    { action: "capture", weekKey: "2026-W32" },
    { action: "share", weekKey: "2026-W32" },
    { action: "connect", weekKey: "2026-W32" },
    { action: "capture", weekKey: "2026-W33" },
    { action: "share", weekKey: "2026-W33" },
  ], new Date("2026-08-13T12:00:00Z"));

  assert.equal(twoOfThree.currentStreak, 2);
  assert.equal(threeOfThree.currentStreak, 2);
});

test("keeps a streak alive during an unfinished current week", () => {
  const status = calculateMomentumStatus([
    { action: "capture", weekKey: "2026-W31" },
    { action: "connect", weekKey: "2026-W31" },
    { action: "share", weekKey: "2026-W32" },
    { action: "connect", weekKey: "2026-W32" },
    { action: "capture", weekKey: "2026-W33" },
  ], new Date("2026-08-13T12:00:00Z"));

  assert.equal(status.isMomentumWeek, false);
  assert.equal(status.currentStreak, 2);
});

test("ends a streak after a missed completed week", () => {
  const status = calculateMomentumStatus([
    { action: "capture", weekKey: "2026-W30" },
    { action: "share", weekKey: "2026-W30" },
    { action: "connect", weekKey: "2026-W32" },
  ], new Date("2026-08-13T12:00:00Z"));

  assert.equal(status.currentStreak, 0);
});

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

test("recognizes only Moment images stored in the configured Supabase bucket", () => {
  const projectUrl = "https://project-ref.supabase.co";
  assert.equal(
    momentImageStoragePath(
      "https://project-ref.supabase.co/storage/v1/object/public/moment-images/user-id/photo.webp",
      projectUrl,
    ),
    "user-id/photo.webp",
  );
  assert.equal(
    momentImageStoragePath("https://cdn.example.com/photo.webp", projectUrl),
    null,
  );
  assert.equal(
    momentImageStoragePath(
      "https://project-ref.supabase.co/storage/v1/object/public/other-bucket/photo.webp",
      projectUrl,
    ),
    null,
  );
});

test("recognizes only About covers stored in the dedicated Supabase bucket", () => {
  const projectUrl = "https://project-ref.supabase.co";
  assert.equal(
    aboutCoverStoragePath(
      "https://project-ref.supabase.co/storage/v1/object/public/about-images/user-id/cover.webp",
      projectUrl,
    ),
    "user-id/cover.webp",
  );
  assert.equal(
    aboutCoverStoragePath(
      "https://project-ref.supabase.co/storage/v1/object/public/moment-images/user-id/cover.webp",
      projectUrl,
    ),
    null,
  );
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

test("uses intentional Moment grids for low and balanced content counts", () => {
  assert.equal(momentGridClassName(1), "moments-grid is-single");
  assert.equal(momentGridClassName(2), "moments-grid is-pair");
  assert.equal(momentGridClassName(3), "moments-grid");
  assert.equal(momentGridClassName(4), "moments-grid is-four");
  assert.equal(momentGridClassName(5), "moments-grid");
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
      cover_url: null,
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
      cover_url: "https://cdn.example.com/about-cover.webp",
      published: true,
    },
  ];

  const content = rowsToSiteContent(rows);
  assert.equal(content.spotify?.published, false);
  assert.equal(content.instagram?.published, true);
  assert.equal(content.instagram?.label, "Saturday RIDE energy");
  assert.equal(content.instagram?.coverUrl, "https://cdn.example.com/about-cover.webp");
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
      cover_url: null,
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
      cover_url: null,
      published: true,
    },
  ];

  assert.deepEqual(rowsToSiteContent(rows), {
    spotify: null,
    instagram: null,
    moments: [],
  });
});
