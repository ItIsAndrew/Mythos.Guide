import assert from 'node:assert/strict';
import { request } from 'node:http';
import { once } from 'node:events';
import { after, before, test } from 'node:test';
import { createAppServer } from '../scripts/dev-server.mjs';
import godsHandler from '../api/gods.js';
import { normalizeSearch } from '../api/_lib/sample-gods.js';

let server;
let address;

before(async () => {
  server = createAppServer();
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  address = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  if (!server?.listening) return;
  await new Promise((resolve, reject) => {
    server.close((error) => error ? reject(error) : resolve());
    server.closeIdleConnections();
  });
});

function getRawPath(path) {
  return new Promise((resolve, reject) => {
    const req = request(`${address}/`, { path }, (res) => {
      let body = '';
      res.setEncoding('utf8');
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => resolve({ status: res.statusCode, body }));
      res.on('error', reject);
    });
    req.on('error', reject);
    req.end();
  });
}

test('the app serves its page and public assets locally', async () => {
  for (const [path, expectedType] of [
    ['/', 'text/html'],
    ['/styles.css', 'text/css'],
    ['/app.js', 'text/javascript'],
    ['/learn-content.js', 'text/javascript'],
    ['/quiz.js', 'text/javascript'],
    ['/quiz.css', 'text/css'],
  ]) {
    const response = await fetch(`${address}${path}`);
    assert.equal(response.status, 200, path);
    assert.ok(response.headers.get('content-type').startsWith(expectedType), path);
    const body = await response.text();
    assert.ok(body.length > 0, path);
    if (path === '/') assert.match(body, /Mythos\.Guide/);
  }
});

test('private files, server source, and traversal requests are never served', async () => {
  for (const path of [
    '/.env.local',
    '/.env',
    '/.git/config',
    '/package.json',
    '/AGENTS.md',
    '/api/_lib/mongodb.js',
    '/scripts/dev-server.mjs',
    '/../.env.local',
    '/%2e%2e/.env.local',
    '/%2e%2e%2f.env.local',
    '/%2e%2e%2fapi/gods.js',
  ]) {
    const response = await getRawPath(path);
    assert.equal(response.status, 404, path);
    assert.equal(response.body, 'Page not found.', path);
  }
});

test('HEAD returns page headers without sending page contents', async () => {
  const response = await fetch(`${address}/`, { method: 'HEAD' });
  assert.equal(response.status, 200);
  assert.match(response.headers.get('content-type'), /^text\/html/);
  assert.equal(await response.text(), '');
});

test('static page rejects writes', async () => {
  const response = await fetch(`${address}/`, { method: 'POST' });
  assert.equal(response.status, 405);
  assert.equal(response.headers.get('allow'), 'GET, HEAD');
  assert.equal(await response.text(), 'Method not allowed.');
});

test('search rejects missing, blank, repeated, and invalid queries before accessing a database', async () => {
  for (const query of [
    '',
    '?q=',
    '?q=%20%20%20',
    '?q=Zeus&q=Hera',
    '?q=%5B%5D%2E%2A',
    '?q=%F0%9F%8C%9F',
    '?q%5B%24ne%5D=',
    '?q=Zeus%ZZ',
    '?q=%E0%A4%A',
    `?q=${'a'.repeat(81)}`,
  ]) {
    const response = await fetch(`${address}/api/gods${query}`);
    assert.equal(response.status, 400, query);
    assert.match(response.headers.get('content-type'), /^application\/json/);
    assert.equal(response.headers.get('cache-control'), 'no-store');
    assert.deepEqual(await response.json(), {
      error: "Enter one god's name using 1 to 80 characters.",
    });
  }
});

test('search rejects write methods before accessing a database', async () => {
  for (const method of ['POST', 'PUT', 'DELETE']) {
    const response = await fetch(`${address}/api/gods?q=Zeus`, { method });
    assert.equal(response.status, 405, method);
    assert.equal(response.headers.get('allow'), 'GET', method);
    assert.deepEqual(await response.json(), {
      error: 'Please use the search box to look up a god.',
    });
  }
});

test('the Vercel request format rejects arrays and objects as god names', async () => {
  for (const q of [['Zeus', 'Hera'], { $ne: '' }]) {
    let responseBody;
    const res = {
      setHeader() {},
      end(body) { responseBody = JSON.parse(body); },
    };
    await godsHandler({ method: 'GET', url: '/api/gods', query: { q } }, res);
    assert.equal(res.statusCode, 400);
    assert.deepEqual(responseBody, {
      error: "Enter one god's name using 1 to 80 characters.",
    });
  }
});

test('browse rejects conflicting, repeated, and invalid options before accessing a database', async () => {
  for (const query of [
    '?mode=search',
    '?mode=',
    '?mode=Browse',
    '?mode=browse&mode=browse',
    '?mode=browse&q=Zeus',
    '?mode=browse&q=',
    '?mode=browse&tradition=greek',
    '?mode=browse&tradition=',
    '?mode=browse&tradition=Egyptian',
    '?mode=browse&tradition=Greek&tradition=Roman',
    '?tradition=all&q=Zeus',
    '?mode%5B%5D=browse&q=Zeus',
    '?mode=browse&tradition%5B%24ne%5D=',
  ]) {
    const response = await fetch(`${address}/api/gods${query}`);
    assert.equal(response.status, 400, query);
    assert.deepEqual(await response.json(), {
      error: "Choose all, Greek, or Roman in the gods browser, or search for one god's name.",
    });
  }
});

test('search treats names consistently across accents, case, and separators', () => {
  assert.equal(normalizeSearch(' ATHÉNA '), normalizeSearch('Athena'));
  assert.equal(normalizeSearch('Ath-ena'), normalizeSearch('Athena'));
  assert.equal(normalizeSearch('Pallas Athena'), normalizeSearch('Pallas-Athena'));
  assert.equal(normalizeSearch('Ζεύς'), normalizeSearch('ΖΕΥΣ'));
});
