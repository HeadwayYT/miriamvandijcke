import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

async function render() {
  return readFile(new URL("../.next/server/app/index.html", import.meta.url), "utf8");
}

test("server-renders the two distinct visitor journeys", async () => {
  const html = await render();
  assert.match(html, /<title>Miriam Van Dijcke \| Group Fitness &amp; Fitness Experiences<\/title>/i);
  assert.match(html, /href="#schedule"[^>]*>[\s\S]*?Find a class<\/a>/i);
  assert.match(html, /href="#experiences">Private experiences/i);
  assert.match(html, /href="#contact">Book Miriam<\/a>/i);
  assert.match(html, /Booking and access are handled directly through each gym or studio\./i);
  assert.match(html, /No\. Miriam is a group fitness and indoor cycling instructor/i);
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
  assert.match(translations, /"Book Miriam": "Boek Miriam"/);
  assert.match(translations, /"Send enquiry": "Verstuur aanvraag"/);
  assert.match(translations, /"My energy is contagious\.": "Mijn energie werkt aanstekelijk\."/);
  assert.doesNotMatch(source, /about-certified/);
});

test("renders the compact venue schedules and private enquiry options", async () => {
  const html = await render();

  assert.match(html, /19:00 - 20:00/);
  assert.match(html, /20:00 - 21:00/);
  assert.match(html, /10:00 - 10:50/);
  assert.match(html, /BODYATTACK/);
  assert.match(html, /BODYPUMP/);
  assert.match(html, /RIDE: PERFORMANCE/);
  assert.match(html, />Private Indoor Cycling Experience<\/h3>/);
  assert.match(html, />Private Group Workout<\/h3>/);
  assert.match(html, />Corporate &amp; Events<\/h3>/);

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
  assert.match(dataSource, /\.eq\("published", true\)/);
  assert.match(actionSource, /isStudioAdmin\(data\.user\)/);
  assert.doesNotMatch(actionSource, /localStorage|service[_-]?role/i);
  assert.match(policies, /enable row level security/i);
  assert.match(policies, /app_metadata[\s\S]*?studio_admin/i);
});
