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
  assert.match(html, /href="#contact">Contact<\/a>/i);
  assert.match(html, /Booking and access are handled directly through each gym or studio\./i);
  assert.match(html, /Bring Miriam to your event/i);
  assert.match(html, /Potential partnership/i);
  assert.doesNotMatch(html, /Private group experience/i);
  assert.match(html, /Want to collaborate, plan a fitness event or simply get in touch/i);
  assert.doesNotMatch(html, /Private experiences/i);
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
  assert.match(translations, /"Move together\.": "Samen in beweging\."/);
  assert.match(translations, /"Rides & music": "Rides & muziek"/);
  assert.match(translations, /"Follow Miriam": "Volg Miriam"/);
  assert.match(translations, /"Get in touch\.": "Neem contact op\."/);
  assert.match(translations, /"Send enquiry": "Verstuur aanvraag"/);
  assert.match(translations, /"My energy is contagious\.": "Mijn energie werkt aanstekelijk\."/);
  assert.doesNotMatch(source, /about-certified/);
});

test("renders compact venue schedules and a secondary event path", async () => {
  const html = await render();

  assert.match(html, /19:00 - 20:00/);
  assert.match(html, /20:00 - 21:00/);
  assert.match(html, /10:00 - 10:50/);
  assert.match(html, /BODYATTACK/);
  assert.match(html, /BODYPUMP/);
  assert.match(html, /RIDE: PERFORMANCE/);
  assert.match(html, /Special rides/);
  assert.match(html, /Fitness events/);
  assert.match(html, /Guest classes/);
  assert.match(html, /Studio collaborations/);
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
    await readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
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
  const momentFormSource = await readFile(
    new URL("../app/studio/moment-form.tsx", import.meta.url),
    "utf8",
  );
  const imageUploadSource = await readFile(
    new URL("../app/studio/studio-image-upload.tsx", import.meta.url),
    "utf8",
  );
  const instagramFormSource = await readFile(
    new URL("../app/studio/instagram-form.tsx", import.meta.url),
    "utf8",
  );
  const cssSource = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");
  const dataSource = await readFile(new URL("../lib/studio/data.ts", import.meta.url), "utf8");
  const actionSource = await readFile(
    new URL("../app/studio/actions.ts", import.meta.url),
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
  assert.doesNotMatch(
    cssSource,
    /\.compact-card p\s*\{[^}]*background:\s*var\(--bone\)[^}]*padding-(?:top|bottom)/s,
  );
  assert.equal((pageSource.match(/<InstagramFeatureMedia/g) ?? []).length, 1);
  assert.match(pageSource, /key=\{siteContent\.instagram\.postUrl\}/);
  assert.match(studioSource, /key=\{instagram\.postUrl\}/);
  assert.match(momentFormSource, /StudioImageUpload/);
  assert.match(imageUploadSource, /createBrowserClient/);
  assert.match(imageUploadSource, /\.storage[\s\S]*?\.upload\(/);
  assert.match(imageUploadSource, /accept=\{acceptedImageTypes\.join/);
  assert.match(imageUploadSource, /maxStudioImageDimension = 2000/);
  assert.match(instagramFormSource, /aboutImagesBucket/);
  assert.match(instagramFormSource, /previousCoverUrl/);
  assert.match(instagramSource, /coverUrl/);
  assert.match(dataSource, /\.eq\("published", true\)/);
  assert.match(dataSource, /from\("site_moments"\)/);
  assert.match(
    dataSource,
    /from\("site_moments"\)[\s\S]*?\.eq\("published", true\)/,
  );
  assert.match(actionSource, /isStudioAdmin\(data\.user\)/);
  assert.doesNotMatch(actionSource, /localStorage|service[_-]?role/i);
  assert.match(policies, /enable row level security/i);
  assert.match(policies, /site_moments[\s\S]*?enable row level security/i);
  assert.match(policies, /moment-images[\s\S]*?storage\.objects/i);
  assert.match(policies, /studio admin can upload moment images/i);
  assert.match(policies, /about-images[\s\S]*?storage\.objects/i);
  assert.match(policies, /studio admin can upload about images/i);
  assert.match(policies, /app_metadata[\s\S]*?studio_admin/i);
});
