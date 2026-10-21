import assert from 'node:assert/strict';
import { once } from 'node:events';
import { readFile } from 'node:fs/promises';
import { after, before, test } from 'node:test';
import { createAppServer } from '../scripts/dev-server.mjs';

let server;
let base;

before(async () => {
  server = createAppServer();
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  base = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  if (server?.listening) await new Promise((resolve) => server.close(resolve));
});

test('the front page leads into an activity menu and each activity keeps its section', async () => {
  const front = await fetch(base);
  assert.equal(front.status, 200);
  const landing = await front.text();
  assert.match(landing, /The old stories/);
  assert.match(landing, /href="\/guide"/);
  assert.match(landing, /href="\/activity#search"/);
  assert.match(landing, /href="\/activity#stories"/);
  assert.match(landing, /href="\/activity#play"/);

  const guide = await fetch(`${base}/guide`);
  assert.equal(guide.status, 200);
  const menu = await guide.text();
  for (const section of ['search', 'gods', 'basics', 'worlds', 'stories', 'play', 'account']) {
    assert.match(menu, new RegExp(`href="/activity#${section}"`));
  }
  assert.doesNotMatch(menu, /id="search-form"/);
  const activity = await fetch(`${base}/activity`);
  assert.equal(activity.status, 200);
  const html = await activity.text();
  assert.match(html, /id="search-form"/);
  assert.match(html, /id="account-form"/);
  assert.match(html, /src="\/activity\.js"/);
  assert.notEqual(html, menu);

  for (const [path, type] of [['/landing.css', 'text/css'], ['/landing.js', 'text/javascript'], ['/guide.css', 'text/css'], ['/guide-home.js', 'text/javascript'], ['/activity.css', 'text/css'], ['/activity.js', 'text/javascript']]) {
    const asset = await fetch(`${base}${path}`);
    assert.equal(asset.status, 200, path);
    assert.match(asset.headers.get('content-type'), new RegExp(type), path);
  }
});

test('deployment routes match the local front page, menu, and activity paths', async () => {
  const config = JSON.parse(await readFile(new URL('../vercel.json', import.meta.url), 'utf8'));
  assert.ok(config.redirects.some((route) => route.source === '/' && route.destination === '/landing.html'));
  assert.ok(config.rewrites.some((route) => route.source === '/guide' && route.destination === '/guide.html'));
  assert.ok(config.rewrites.some((route) => route.source === '/activity' && route.destination === '/index.html'));
});
