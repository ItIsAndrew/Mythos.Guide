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

test('the front page leads into the existing guide and keeps section links', async () => {
  const front = await fetch(base);
  assert.equal(front.status, 200);
  const landing = await front.text();
  assert.match(landing, /The old stories/);
  assert.match(landing, /href="\/guide#start-here"/);
  assert.match(landing, /href="\/guide#search"/);
  assert.match(landing, /href="\/guide#stories"/);
  assert.match(landing, /href="\/guide#play"/);

  const guide = await fetch(`${base}/guide`);
  assert.equal(guide.status, 200);
  const html = await guide.text();
  assert.match(html, /id="search-form"/);
  assert.match(html, /id="account-form"/);
  assert.notEqual(html, landing);

  for (const [path, type] of [['/landing.css', 'text/css'], ['/landing.js', 'text/javascript']]) {
    const asset = await fetch(`${base}${path}`);
    assert.equal(asset.status, 200, path);
    assert.match(asset.headers.get('content-type'), new RegExp(type), path);
  }
});

test('deployment routes match the local front page and guide paths', async () => {
  const config = JSON.parse(await readFile(new URL('../vercel.json', import.meta.url), 'utf8'));
  assert.ok(config.redirects.some((route) => route.source === '/' && route.destination === '/landing.html'));
  assert.ok(config.rewrites.some((route) => route.source === '/guide' && route.destination === '/index.html'));
});
