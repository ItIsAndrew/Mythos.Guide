import { randomBytes } from 'node:crypto';
import { setTimeout as pause } from 'node:timers/promises';
import { nicknameEnds, nicknameStarts } from '../public/nickname-words.js';

// Exercise the local HTTP API only. MongoDB access remains inside /api.
const base = 'http://localhost:3000';
const owner = { cookie: '' };
const first = { cookie: '' };
const second = { cookie: '' };
const visitor = { cookie: '' };
const aliases = nicknameStarts.flatMap((start) => nicknameEnds.map((end) => `${start}-${end}`));
const firstAlias = randomBytes(2).readUInt16BE() % aliases.length;
let nicknameA;
let nicknameB;
const password = randomBytes(24).toString('base64url');
const created = new Set();
let originalPosting;
let ownerLoggedIn = false;

function check(condition, message) {
  if (!condition) throw new Error(message);
}

async function call(jar, path, method = 'GET', body, retry = true) {
  const response = await fetch(`${base}${path}`, {
    method,
    headers: {
      Accept: 'application/json', Origin: base,
      ...(jar.cookie && { Cookie: jar.cookie }),
      ...(body !== undefined && { 'Content-Type': 'application/json' }),
    },
    ...(body !== undefined && { body: JSON.stringify(body) }),
  });
  const cookies = response.headers.getSetCookie();
  if (cookies.length) {
    const saved = new Map(jar.cookie.split('; ').filter(Boolean).map((part) => part.split('=')));
    for (const cookie of cookies) {
      const [name, value] = cookie.split(';')[0].split('=');
      if (value) saved.set(name, value); else saved.delete(name);
    }
    jar.cookie = [...saved].map(([name, value]) => `${name}=${value}`).join('; ');
  }
  let data;
  try { data = await response.json(); } catch { throw new Error('An API returned an unreadable response.'); }
  if (response.status === 429 && retry) {
    const seconds = Number(response.headers.get('retry-after'));
    check(seconds > 0 && seconds <= 60, 'Rate limit requires a later safety check.');
    await pause((seconds + 1) * 1000);
    return call(jar, path, method, body, false);
  }
  return { status: response.status, data, response };
}

async function expect(jar, path, method, body, status) {
  const result = await call(jar, path, method, body);
  check(result.status === status, `Safety check failed: ${method} ${path} expected ${status}.`);
  return result;
}

async function registerMadeUp(jar, inviteCode, exclude = '') {
  for (let index = 0; index < aliases.length; index += 1) {
    const nickname = aliases[(firstAlias + index) % aliases.length];
    if (nickname === exclude) continue;
    const result = await call(jar, '/api/account', 'POST', { action: 'register', nickname, password, inviteCode });
    if (result.status === 201) return nickname;
    check(result.status === 409, 'A made-up test account could not be registered.');
  }
  throw new Error('No unused made-up nickname remains for the safety check.');
}

try {
  check(process.env.ADMIN_PASSCODE?.length >= 16, 'Owner passcode is not configured.');
  await expect(visitor, '/api/posts', 'GET', undefined, 401);
  await expect(visitor, '/api/admin', 'GET', undefined, 401);
  await expect(visitor, '/api/admin', 'POST', { action: 'login', passcode: 'fictional-wrong-passcode' }, 401);
  const login = await expect(owner, '/api/admin', 'POST', { action: 'login', passcode: process.env.ADMIN_PASSCODE }, 200);
  ownerLoggedIn = true;
  const cookies = login.response.headers.getSetCookie().join(';');
  check(/HttpOnly/i.test(cookies) && /SameSite=Strict/i.test(cookies), 'Owner session cookie protections missing.');
  const initial = await expect(owner, '/api/admin', 'GET', undefined, 200);
  originalPosting = initial.data.postingEnabled;
  if (!originalPosting) await expect(owner, '/api/admin', 'POST', { action: 'posting', enabled: true }, 200);

  const invitationA = await expect(owner, '/api/admin', 'POST', { action: 'invite' }, 201);
  const invitationB = await expect(owner, '/api/admin', 'POST', { action: 'invite' }, 201);
  nicknameA = await registerMadeUp(first, invitationA.data.inviteCode);
  created.add(first);
  await expect(visitor, '/api/account', 'POST', { action: 'register', nickname: 'Sarah', password, inviteCode: invitationB.data.inviteCode }, 400);
  await expect(visitor, '/api/account', 'POST', { action: 'register', nickname: 'SarahJones', password, inviteCode: invitationB.data.inviteCode }, 400);
  nicknameB = await registerMadeUp(second, invitationB.data.inviteCode, nicknameA);
  created.add(second);
  await expect(visitor, '/api/account', 'POST', { action: 'register', nickname: 'Star-Fox', password, inviteCode: invitationA.data.inviteCode }, 400);
  console.log('PASS: invite-only nickname accounts and one-use invitations.');

  await expect(first, '/api/posts', 'POST', { text: 'Athena carries a shield in the sample story.' }, 201);
  const postsA = await expect(first, '/api/posts', 'GET', undefined, 200);
  check(postsA.data.posts.length === 1, 'First user did not receive only their own post.');
  const idA = postsA.data.posts[0].id;
  const rapid = await call(first, '/api/posts', 'POST', { text: 'Poseidon has a trident.' }, false);
  check(rapid.status === 429, 'Rapid posting was not rejected.');
  check(rapid.response.headers.has('retry-after'), 'Rate limit omitted retry timing.');
  await expect(second, '/api/posts', 'POST', { text: 'The sample owl belongs to Athena.' }, 201);
  const postsB = await expect(second, '/api/posts', 'GET', undefined, 200);
  check(postsB.data.posts.length === 1 && postsB.data.posts[0].id !== idA, 'Second user can see another user’s post.');
  const idB = postsB.data.posts[0].id;
  const scope = await call(second, `/api/posts?userId=${encodeURIComponent(nicknameA)}`);
  check(scope.status === 400 || (scope.status === 200 && scope.data.posts.every((post) => post.id !== idA)), 'Query parameters bypass ownership.');
  await expect(second, '/api/posts', 'PATCH', { id: idA, text: 'Forbidden edit attempt.' }, 404);
  await expect(second, '/api/posts', 'DELETE', { id: idA }, 404);
  await expect(first, '/api/posts', 'PATCH', { id: idA, text: 'Athena is associated with wisdom.' }, 200);
  console.log('PASS: two users cannot read, edit, or delete one another’s data; edits work for the owner.');

  for (const text of [
    'x'.repeat(501), 'Contact fictional@example.invalid', 'fictional [at] example [dot] invalid',
    'Call 202-555-0199', 'Find me at 123 Fictional Street', 'Follow @fictional_owl',
    'https://example.invalid/fictional', 'I go to Cedar Valley Middle School.',
    'My friend Sarah likes Athena.', 'Sarah is my friend and likes Athena.',
  ]) await expect(first, '/api/posts', 'POST', { text }, 400);
  const before = await expect(first, '/api/posts', 'GET', undefined, 200);
  check(before.data.posts.length === 1, 'Blocked contact information was saved.');
  await expect(first, '/api/posts', 'POST', { text: 'Safe mythology note.', userId: nicknameB }, 400);
  const crossOrigin = await fetch(`${base}/api/posts`, {
    method: 'POST', headers: { Origin: 'https://example.invalid', Cookie: first.cookie, 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: 'Cross-origin attempt.' }),
  });
  check(crossOrigin.status === 403, 'Cross-origin write was accepted.');
  console.log('PASS: length limits, contact filters, fast-request rejection, and cross-origin protection.');

  await expect(owner, '/api/admin', 'POST', { action: 'posting', enabled: false }, 200);
  await expect(first, '/api/posts', 'POST', { text: 'Posting should be paused.' }, 403);
  await expect(second, '/api/posts', 'PATCH', { id: idB, text: 'Editing should be paused.' }, 403);
  await expect(owner, '/api/admin', 'DELETE', { id: idA }, 200);
  const after = await expect(first, '/api/posts', 'GET', undefined, 200);
  check(after.data.posts.length === 0 && !after.data.postingEnabled, 'Owner deletion or global posting switch failed.');
  await expect(second, '/api/posts', 'DELETE', { id: idB }, 200);
  console.log('PASS: owner can delete any post, posting pause blocks writes, and members can still delete.');

  const oldCookie = first.cookie;
  await expect(first, '/api/account', 'POST', { action: 'logout' }, 200);
  await expect({ cookie: oldCookie }, '/api/posts', 'GET', undefined, 401);
  await expect(first, '/api/account', 'POST', { action: 'login', nickname: nicknameA, password: 'fictional-wrong-password' }, 401);
  await expect(first, '/api/account', 'POST', { action: 'login', nickname: nicknameA, password }, 200);
  await expect(first, '/api/account', 'DELETE', { password: 'fictional-wrong-password' }, 401);
  console.log('PASS: logout revokes sessions, password login works, and deletion requires the password.');
} catch (error) {
  console.error(error.message?.startsWith('Safety check') || error.message?.startsWith('Rate limit') ? error.message : 'A local safety check failed. Ask Codex to review it; private values are hidden.');
  process.exitCode = 1;
} finally {
  for (const jar of created) {
    try {
      const result = await call(jar, '/api/account', 'DELETE', { password });
      check(result.status === 200, 'Could not remove a made-up test account.');
    } catch {
      console.error('A made-up test account needs cleanup.');
      process.exitCode = 1;
    }
  }
  if (ownerLoggedIn) {
    try {
      if (typeof originalPosting === 'boolean') await expect(owner, '/api/admin', 'POST', { action: 'posting', enabled: originalPosting }, 200);
      await expect(owner, '/api/admin', 'POST', { action: 'logout' }, 200);
    } catch {
      console.error('Owner test session or posting setting needs cleanup.');
      process.exitCode = 1;
    }
  }
  if (!process.exitCode) console.log('PASS: made-up accounts/posts removed and original posting setting restored. Local safety checks passed.');
}
