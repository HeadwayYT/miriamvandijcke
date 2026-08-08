import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("server-renders the two distinct visitor journeys", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>Miriam Van Dijcke \| Group Fitness &amp; Fitness Experiences<\/title>/i);
  assert.match(html, /href="#schedule">Find a class<\/a>/i);
  assert.match(html, /href="#experiences">Book an experience<\/a>/i);
  assert.match(html, /Booking and access are handled directly through each gym or studio\./i);
  assert.match(html, /No\. Miriam is a group fitness and indoor cycling instructor/i);
  assert.doesNotMatch(html, />Book now</i);
});

test("renders the compact venue schedules and private enquiry options", async () => {
  const response = await render();
  const html = await response.text();

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
