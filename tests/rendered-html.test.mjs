import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

async function render() {
  return readFile(new URL("../.next/server/app/index.html", import.meta.url), "utf8");
}

test("server-renders Miriam's fitness hub priorities", async () => {
  const html = await render();
  assert.match(html, /<title>Miriam Van Dijcke \| Group Fitness &amp; Indoor Cycling<\/title>/i);
  assert.match(html, /href="#schedule"[^>]*>[\s\S]*?Find a class<\/a>/i);
  assert.match(
    html,
    /href="https:\/\/www\.instagram\.com\/mir\.i\.am_vd\/"[^>]*>[\s\S]*?Follow Miriam/i,
  );
  assert.match(html, /href="#contact"[^>]*>Collaborate<\/a>/i);
  assert.match(html, /href="\/#home"[^>]*>\s*MV\s*<\/a>/i);
  assert.match(html, /Booking and access are handled directly through each gym or studio\./i);
  assert.match(html, />4 Classes<\/h2>/i);
  assert.match(html, /Find me in class every week\.<\/h3>/i);
  assert.match(html, /Potential partnership/i);
  assert.doesNotMatch(html, /Private group experience/i);
  assert.match(html, /Want to collaborate, plan a fitness event or simply get in touch/i);
  assert.doesNotMatch(html, /Private experiences/i);
  assert.doesNotMatch(html, /Move with purpose/i);
  assert.doesNotMatch(html, /These are the formats I&#x27;m qualified and experienced to teach/i);
  assert.doesNotMatch(html, /Find me in class every week in Mechelen and Antwerp/i);
  assert.doesNotMatch(html, /Bring Miriam to your event/i);
  assert.doesNotMatch(html, />Book now</i);
});

test("renders an accessible English and Dutch language switch", async () => {
  const html = await render();
  const source = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  const translations = await readFile(
    new URL("../app/translations.ts", import.meta.url),
    "utf8",
  );

  assert.match(html, /aria-label="Choose language"/i);
  assert.match(html, />EN<\/button>/i);
  assert.match(html, />NL<\/button>/i);
  assert.match(source, /localStorage\.setItem\("miriam-language"/);
  assert.match(source, /document\.documentElement\.lang = language/);
  assert.match(source, /aria-controls="site-navigation"/);
  assert.match(source, /aria-expanded=\{mobileNavOpen\}/);
  assert.match(source, /href="#moments"/);
  assert.match(source, /href="#contact"/);
  assert.match(source, /siteConfig\.instagramProfileUrl/);
  assert.match(translations, /"Move together\.": "Samen in beweging\."/);
  assert.match(translations, /"Rides & music": "Rides & muziek"/);
  assert.match(translations, /"Follow Miriam": "Volg Miriam"/);
  assert.match(translations, /"Get in touch\.": "Neem contact op\."/);
  assert.match(translations, /"Send enquiry": "Verstuur aanvraag"/);
  assert.match(translations, /"My energy is contagious\.": "Mijn energie werkt aanstekelijk\."/);
  assert.doesNotMatch(source, /about-certified/);
  assert.doesNotMatch(source, /marquee-band|marquee-track/);
});

test("keeps the public navigation contained above the hero", async () => {
  const source = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  const styles = await readFile(new URL("../app/public-media.css", import.meta.url), "utf8");

  assert.match(source, /className="site-nav-container"/);
  assert.match(source, /header\.classList\.toggle\("is-scrolled", window\.scrollY > 24\)/);
  assert.match(source, /addEventListener\("scroll", syncHeaderMode, \{ passive: true \}\)/);
  assert.doesNotMatch(source, /toggleClass:\s*\{\s*targets:\s*"\.site-header"/);
  assert.match(styles, /\.site-header\s*\{[\s\S]*?position:\s*sticky;/);
  assert.match(styles, /\.site-header\s*\{[\s\S]*?background:\s*transparent;/);
  assert.match(styles, /\.site-header\s*\{[\s\S]*?margin-bottom:\s*-64px;/);
  assert.match(styles, /\.site-nav-container\s*\{[\s\S]*?width:\s*max-content;/);
  assert.match(styles, /\.site-nav-container\s*\{[\s\S]*?background:\s*transparent;/);
  assert.match(styles, /\.site-header\.is-scrolled \.site-nav-container/);
  assert.match(styles, /\.site-header\.is-scrolled \.site-nav-container\s*\{[\s\S]*?transform:\s*translate\(0, 4px\);/);
  assert.doesNotMatch(styles, /\.site-header\s*\{[\s\S]*?position:\s*fixed;/);
  assert.match(styles, /\.hero-media\s*\{[\s\S]*?miriam-kettlebell-coach\.jpg/);
  assert.match(styles, /background-position:\s*69% 96px;/);
});

test("renders compact venue schedules and a contact enquiry path", async () => {
  const html = await render();

  assert.match(html, /19:00 - 20:00/);
  assert.match(html, /20:00 - 21:00/);
  assert.match(html, /10:00 - 10:50/);
  assert.match(html, /BODYATTACK/);
  assert.match(html, /BODYPUMP/);
  assert.match(html, /RIDE: PERFORMANCE/);
  assert.match(html, /What&#x27;s this about\?/);
  assert.match(html, /Select an option/);
  assert.match(html, /General question/);
  assert.match(html, /Private group request/);
  assert.doesNotMatch(html, />Private Indoor Cycling Experience<\/h3>/);
  assert.doesNotMatch(html, /Bring the room together/i);

  const source = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  const ids = new Set([...source.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]));
  const internalTargets = [...source.matchAll(/href="(#[^"]+)"/g)].map(
    (match) => match[1].slice(1),
  );

  assert.deepEqual(
    [...new Set(internalTargets.filter((target) => !ids.has(target)))],
    [],
  );
  assert.match(source, /https:\/\/www\.basic-fit\.com\/en-be\/clubs\/basic-fit-mechelen-bruul-/);
  assert.match(source, /https:\/\/pulsate\.be\/timetable\//);
  assert.match(source, /https:\/\/formspree\.io\/f\/mzepdael/);
  assert.doesNotMatch(source, /mailto:/);
  assert.match(source, /type="date" name="timing"/);
  assert.match(source, /eventRequestTypes\.has\(requestType\)/);
  assert.match(source, /\{isEventRequest \? \(/);
  assert.doesNotMatch(source, /View featured post/);
  assert.match(source, /target="_blank" rel="noreferrer"/);
});

test("produces a static root route with resolvable Vercel assets", async () => {
  const html = await render();
  const prerenderManifest = JSON.parse(
    await readFile(new URL("../.next/prerender-manifest.json", import.meta.url), "utf8"),
  );

  assert.equal(prerenderManifest.routes["/"]?.compute, "static");
  assert.deepEqual(prerenderManifest.dynamicRoutes, {});

  const nextAssets = new Set(
    [...html.matchAll(/(?:href|src)="(\/_next\/static\/[^"?]+)/g)].map(
      (match) => match[1],
    ),
  );
  assert.ok(nextAssets.size > 0);

  for (const asset of nextAssets) {
    const relativePath = asset.replace("/_next/static/", "");
    await access(new URL(`../.next/static/${relativePath}`, import.meta.url));
  }

  const source = [
    await readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    await readFile(new URL("../app/public-media.css", import.meta.url), "utf8"),
    await readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
  ].join("\n");
  const publicAssets = new Set(
    [...source.matchAll(/\/(images\/[^"')\s]+|favicon\.svg)/g)].map(
      (match) => match[1],
    ),
  );

  for (const asset of publicAssets) {
    await access(new URL(`../public/${asset}`, import.meta.url));
  }
});

test("keeps Miriam Studio private and fail-closed", async () => {
  const html = await render();
  const pageSource = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  const instagramSource = await readFile(
    new URL("../app/components/instagram-feature-media.tsx", import.meta.url),
    "utf8",
  );
  const studioSource = await readFile(new URL("../app/studio/page.tsx", import.meta.url), "utf8");
  const dashboardSource = await readFile(
    new URL("../app/studio/studio-dashboard.tsx", import.meta.url),
    "utf8",
  );
  const shareDetailSource = await readFile(
    new URL("../app/studio/share-detail-action.tsx", import.meta.url),
    "utf8",
  );
  const momentFormSource = await readFile(
    new URL("../app/studio/moment-form.tsx", import.meta.url),
    "utf8",
  );
  const imageUploadSource = await readFile(
    new URL("../app/studio/studio-image-upload.tsx", import.meta.url),
    "utf8",
  );
  const videoUploadSource = await readFile(
    new URL("../app/studio/studio-video-upload.tsx", import.meta.url),
    "utf8",
  );
  const momentMediaSource = await readFile(
    new URL("../app/components/moment-media.tsx", import.meta.url),
    "utf8",
  );
  const savedMomentSource = await readFile(
    new URL("../app/studio/saved-moment-summary.tsx", import.meta.url),
    "utf8",
  );
  const followerTrackerSource = await readFile(
    new URL("../app/studio/instagram-follower-tracker.tsx", import.meta.url),
    "utf8",
  );
  const instagramFormSource = await readFile(
    new URL("../app/studio/instagram-form.tsx", import.meta.url),
    "utf8",
  );
  const cssSource = await readFile(new URL("../app/public-media.css", import.meta.url), "utf8");
  const dataSource = await readFile(new URL("../lib/studio/data.ts", import.meta.url), "utf8");
  const actionSource = await readFile(
    new URL("../app/studio/actions.ts", import.meta.url),
    "utf8",
  );
  const apiSource = await readFile(
    new URL("../app/api/site-content/route.ts", import.meta.url),
    "utf8",
  );
  const policies = await readFile(
    new URL("../supabase/studio-setup.sql", import.meta.url),
    "utf8",
  );

  assert.doesNotMatch(html, /href="\/studio"/i);
  assert.match(pageSource, /Follow[\s\S]*?siteConfig\.instagramHandle/);
  assert.match(pageSource, /publishedRide[\s\S]*?href="#rides"[\s\S]*?Latest ride/);
  assert.match(pageSource, /\{siteContent\.moments\.length \? \(/);
  assert.match(pageSource, /Miriam in action/);
  assert.match(pageSource, /toSpotifyEmbedUrl/);
  assert.match(pageSource, /height="152"/);
  assert.match(instagramSource, /https:\/\/www\.instagram\.com\/embed\.js/);
  assert.match(instagramSource, /data-instgrm-captioned/);
  assert.match(instagramSource, /miriam-headset\.jpg/);
  assert.match(instagramSource, /status === "failed"/);
  assert.match(instagramSource, /MutationObserver/);
  assert.match(instagramSource, /observer\.disconnect\(\)/);
  assert.match(instagramSource, /window\.clearTimeout\(failureTimer\)/);
  assert.doesNotMatch(instagramSource, /instagram-fallback/);
  assert.doesNotMatch(cssSource, /\.instagram-fallback/);
  assert.doesNotMatch(cssSource, /\.instagram-native-embed\s*\{[^}]*position:\s*absolute/s);
  assert.doesNotMatch(cssSource, /marquee-band|marquee-track|@keyframes\s+marquee/);
  assert.doesNotMatch(
    cssSource,
    /\.compact-card p\s*\{[^}]*background:\s*var\(--bone\)[^}]*padding-(?:top|bottom)/s,
  );
  assert.equal((pageSource.match(/<InstagramFeatureMedia/g) ?? []).length, 1);
  assert.match(pageSource, /key=\{siteContent\.instagram\.postUrl\}/);
  assert.doesNotMatch(studioSource, /InstagramFeatureMedia/);
  assert.match(studioSource, /getStudioMomentum/);
  assert.match(studioSource, /<StudioDashboard/);
  assert.match(studioSource, /<ShareDetailAction momentum=\{momentum\}/);
  assert.match(shareDetailSource, /markShareCompleted/);
  assert.ok(
    studioSource.indexOf("Update Latest Ride") < studioSource.indexOf("Current Ride"),
    "Connect must show its editor before the current ride",
  );
  assert.ok(
    studioSource.indexOf("<ShareDetailAction") < studioSource.indexOf("<InstagramForm"),
    "Share must show the weekly action before featured website content",
  );
  assert.ok(
    studioSource.indexOf('selectedMoment ? "Edit Moment" : "Add a Moment"')
      < studioSource.indexOf("Saved Moments"),
    "Capture must show the Moment work area before saved moments",
  );
  assert.match(studioSource, /<SavedMomentSummary/);
  assert.match(savedMomentSource, /editor=moments&moment=\$\{moment\.id\}/);
  assert.doesNotMatch(studioSource, /<MomentForm moment=\{moment\}/);
  assert.match(dashboardSource, /Keep the momentum/);
  assert.match(dashboardSource, /Current focus/);
  assert.match(dashboardSource, /Build the following/);
  assert.match(dashboardSource, /momentum\.completedCount/);
  assert.match(dashboardSource, /momentum\.currentStreak/);
  assert.match(dashboardSource, /markShareCompleted/);
  assert.match(dashboardSource, /Momentum secured/);
  assert.ok(
    dashboardSource.indexOf('action: "capture"') < dashboardSource.indexOf('action: "share"')
      && dashboardSource.indexOf('action: "share"') < dashboardSource.indexOf('action: "connect"'),
    "Momentum actions must remain Capture, Share, Connect",
  );
  assert.match(dashboardSource, /editor=moments/);
  assert.match(dashboardSource, /editor=instagram/);
  assert.match(dashboardSource, /editor=spotify/);
  assert.match(dashboardSource, /InstagramFollowerTracker/);
  assert.match(
    dashboardSource,
    /className=\{styles\.momentumPanel\}[\s\S]*?<InstagramFollowerTracker[\s\S]*?className=\{styles\.focusPanel\}/,
    "The follower tracker must sit between Momentum and Current Focus",
  );
  assert.match(momentFormSource, /StudioImageUpload/);
  assert.match(momentFormSource, /StudioVideoUpload/);
  assert.match(momentFormSource, /mediaType/);
  assert.match(momentFormSource, /posterUrl/);
  assert.match(imageUploadSource, /createBrowserClient/);
  assert.match(imageUploadSource, /\.storage[\s\S]*?\.upload\(/);
  assert.match(imageUploadSource, /accept=\{acceptedImageTypes\.join/);
  assert.match(imageUploadSource, /maxStudioImageDimension = 2000/);
  assert.match(videoUploadSource, /video\/mp4/);
  assert.match(videoUploadSource, /video\/webm/);
  assert.match(videoUploadSource, /maxStudioVideoSize = 25 \* 1024 \* 1024/);
  assert.match(videoUploadSource, /controls/);
  assert.match(videoUploadSource, /muted/);
  assert.match(savedMomentSource, /moment\.posterUrl/);
  assert.doesNotMatch(savedMomentSource, /<video/);
  assert.match(momentMediaSource, /IntersectionObserver/);
  assert.match(momentMediaSource, /prefers-reduced-motion/);
  assert.match(momentMediaSource, /video\.pause\(\)/);
  assert.match(momentMediaSource, /autoPlay=\{nearViewport && !reducedMotion\}/);
  assert.match(momentMediaSource, /muted/);
  assert.match(momentMediaSource, /loop/);
  assert.match(momentMediaSource, /playsInline/);
  assert.match(momentMediaSource, /controls=\{false\}/);
  assert.match(momentMediaSource, /disablePictureInPicture/);
  assert.match(instagramFormSource, /aboutImagesBucket/);
  assert.match(instagramFormSource, /previousCoverUrl/);
  assert.match(instagramSource, /coverUrl/);
  assert.match(dataSource, /\.eq\("published", true\)/);
  assert.match(dataSource, /from\("site_moments"\)/);
  assert.match(dataSource, /from\("studio_activity"\)/);
  assert.match(
    dataSource,
    /from\("site_moments"\)[\s\S]*?\.eq\("published", true\)/,
  );
  assert.match(actionSource, /isStudioAdmin\(data\.user\)/);
  assert.match(actionSource, /recordStudioActivity/);
  assert.match(actionSource, /source_id:\s*manualShareSourceId/);
  assert.doesNotMatch(
    actionSource,
    /recordStudioActivity\(supabase, userId, "share", "instagram"/,
  );
  assert.match(actionSource, /ignoreDuplicates:\s*true/);
  assert.match(actionSource, /saveInstagramFollowerCount/);
  assert.match(actionSource, /from\("instagram_follower_snapshots"\)\.upsert/);
  assert.match(actionSource, /onConflict:\s*"updated_by,snapshot_date"/);
  assert.match(followerTrackerSource, /onBlur=\{commitValue\}/);
  assert.match(followerTrackerSource, /event\.key === "Enter"[\s\S]*?event\.currentTarget\.blur\(\)/);
  assert.match(followerTrackerSource, /latest\?\.date === today/);
  assert.match(followerTrackerSource, /aria-live="polite"/);
  assert.match(followerTrackerSource, /mergeFollowerSnapshot/);
  assert.doesNotMatch(followerTrackerSource, /<button|Save month|Update month/i);
  assert.doesNotMatch(studioSource, /editor === "growth"|GrowthSignalsEditor/);
  assert.doesNotMatch(dashboardSource, /Growth signals|Invitations|Collaborations|Update month/i);
  const followerAction = actionSource.match(
    /export async function saveInstagramFollowerCount[\s\S]*?(?=export async function|async function requireStudioAdmin)/,
  )?.[0] ?? "";
  assert.doesNotMatch(followerAction, /recordStudioActivity|Momentum|streak/i);
  assert.match(
    actionSource,
    /saveMoment[\s\S]*?shouldCapture[\s\S]*?recordStudioActivity\(supabase, userId, "capture"/,
  );
  assert.doesNotMatch(apiSource, /growth_signals|instagram_followers/);
  assert.doesNotMatch(actionSource, /localStorage|service[_-]?role/i);
  assert.match(policies, /enable row level security/i);
  assert.match(policies, /site_moments[\s\S]*?enable row level security/i);
  assert.match(policies, /studio_activity[\s\S]*?enable row level security/i);
  assert.match(policies, /studio_activity_updated_by_idx/i);
  assert.match(policies, /studio_activity_source_url_check/i);
  assert.match(policies, /studio admin can update momentum activity/i);
  assert.match(policies, /revoke all on table public\.studio_activity from anon, authenticated/i);
  assert.match(policies, /moment-images[\s\S]*?storage\.objects/i);
  assert.match(policies, /studio admin can upload moment media/i);
  assert.match(policies, /video\/mp4/i);
  assert.match(policies, /video\/webm/i);
  assert.match(policies, /media_type[\s\S]*?poster_url/i);
  assert.match(policies, /about-images[\s\S]*?storage\.objects/i);
  assert.match(policies, /studio admin can upload about images/i);
  assert.match(policies, /app_metadata[\s\S]*?studio_admin/i);
  assert.match(policies, /growth_signals[\s\S]*?enable row level security/i);
  assert.match(policies, /unique check \(month/i);
  assert.match(policies, /revoke all on table public\.growth_signals from anon, authenticated/i);
  assert.doesNotMatch(
    policies,
    /grant select on table public\.growth_signals to anon/i,
  );
  assert.match(policies, /studio admin can inspect growth signals/i);
  assert.match(policies, /studio admin can update growth signals/i);
  assert.match(policies, /instagram_follower_snapshots[\s\S]*?enable row level security/i);
  assert.match(policies, /unique \(updated_by, snapshot_date\)/i);
  assert.match(policies, /revoke all on table public\.instagram_follower_snapshots from anon, authenticated/i);
  assert.match(policies, /grant select, insert, update on table public\.instagram_follower_snapshots to authenticated/i);
  assert.doesNotMatch(policies, /grant select on table public\.instagram_follower_snapshots to anon/i);
  assert.match(policies, /studio admin can inspect follower snapshots/i);
  assert.match(policies, /studio admin can update follower snapshots/i);
});
