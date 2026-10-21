import assert from 'node:assert/strict';
import { test } from 'node:test';
import { Readable } from 'node:stream';
import bcrypt from 'bcrypt';
import { createAccountHandler } from '../api/account.js';
import { createPostsHandler } from '../api/posts.js';
import { createAdminHandler } from '../api/admin.js';
import { COLLECTIONS, hashToken } from '../api/_lib/accounts.js';
import {
  validateNickname, validatePassword, validatePostText, validateSignupNickname,
} from '../api/_lib/validation.js';
import { memoryDatabase } from './helpers/memory-database.js';

const OWNER_PASSCODE = 'MadeUpOwnerPasscodeForTestsOnly';
const PASSWORD = 'MadeUpCometPassword';
process.env.ADMIN_PASSCODE = OWNER_PASSCODE;

let requestAddress = 0;
async function invoke(handler, {
  method = 'GET', body, cookie, origin = 'http://localhost:3000',
  headers = {}, address = `127.0.0.${++requestAddress}`, raw, url = '/api/test',
} = {}) {
  const request = Readable.from(raw === undefined ? (body === undefined ? [] : [JSON.stringify(body)]) : [raw]);
  Object.assign(request, {
    method, url,
    headers: {
      host: 'localhost:3000',
      ...(method !== 'GET' && { origin, 'content-type': 'application/json' }),
      ...(cookie && { cookie }), ...headers,
    },
    socket: { remoteAddress: address, encrypted: false },
  });
  const responseHeaders = {};
  let result;
  const response = {
    setHeader(key, value) { responseHeaders[key.toLowerCase()] = value; },
    end(value) { result = value ? JSON.parse(value) : null; },
  };
  await handler(request, response);
  return { status: response.statusCode, headers: responseHeaders, body: result };
}

function cookieOf(response) {
  const header = response.headers['set-cookie'];
  assert.ok(header, 'successful authentication sets a cookie');
  return (Array.isArray(header) ? header[0] : header).split(';')[0];
}

function fixture() {
  const database = memoryDatabase();
  const provider = async () => database;
  const state = { promise: null };
  return {
    database,
    account: createAccountHandler(provider, state),
    posts: createPostsHandler(provider, state),
    admin: createAdminHandler(provider, state),
  };
}

// Ordinary behavioral tests advance persisted cooldown records between actions.
// Rate-limit and concurrent-request tests deliberately retain all those records.
function clearCooldowns(f) {
  for (const [name, collection] of f.database.collections) {
    if (/rate|cooldown|limit/.test(name)) collection.documents = [];
  }
}

async function owner(f) {
  const response = await invoke(f.admin, {
    method: 'POST', body: { action: 'login', passcode: OWNER_PASSCODE },
  });
  assert.equal(response.status, 200, JSON.stringify(response.body));
  return cookieOf(response);
}

async function member(f, nickname = 'CometFox') {
  clearCooldowns(f);
  const response = await invoke(f.account, {
    method: 'POST', body: { action: 'register', nickname, password: PASSWORD },
  });
  assert.equal(response.status, 201, JSON.stringify(response.body));
  assert.deepEqual(response.body.user, { nickname });
  return cookieOf(response);
}

async function writePost(f, cookie, text = 'Athena represents wisdom in Greek mythology.') {
  clearCooldowns(f);
  const response = await invoke(f.posts, { method: 'POST', cookie, body: { text } });
  assert.equal(response.status, 201, JSON.stringify(response.body));
  const listed = await invoke(f.posts, { cookie });
  assert.equal(listed.status, 200);
  return listed.body.posts.find((post) => post.text === text);
}

test('nickname and password validation accepts only bounded nickname-only credentials', () => {
  assert.equal(validateNickname('Comet-Fox'), 'Comet-Fox');
  assert.equal(validateSignupNickname('CometFox'), 'CometFox');
  assert.equal(validateSignupNickname('Moon-Quill'), 'Moon-Quill');
  for (const nickname of ['Sarah', 'sarah', 'SARAH', 'SarahJones', 'Sarah-Jones', 'MoonSarah']) {
    assert.throws(() => validateSignupNickname(nickname), { status: 400 });
  }
  for (const nickname of [null, '', 'A', 'a'.repeat(25), 'Fox99', '@Comet', 'Fox--Comet', 'Real Name', 'fox@example.com', { $ne: '' }]) {
    assert.throws(() => validateNickname(nickname), { status: 400 });
  }
  assert.equal(validatePassword('a'.repeat(72)), 'a'.repeat(72));
  assert.equal(validatePassword('🌠'.repeat(18)), '🌠'.repeat(18));
  for (const password of [null, 'short', 'a'.repeat(73), '🌠'.repeat(19), 'long\0password', { $ne: '' }]) {
    assert.throws(() => validatePassword(password), { status: 400 });
  }
});

test('posts reject contact details, obfuscation, controls, and oversized content', () => {
  assert.equal(validatePostText('  Athena is associated with wisdom.  '), 'Athena is associated with wisdom.');
  assert.equal(validatePostText('x'.repeat(500)), 'x'.repeat(500));
  for (const text of [
    '', '  ', 'x'.repeat(501), null, { $ne: '' },
    'mira@example.com', 'mira＠example．com', 'mira (at) example dot com',
    'My number is 555-123-4567', '٥٥٥ ١٢٣ ٤٥٦٧', 'My address: 123 Sample Street',
    'Send to PO Box 432', '@cometfox', 'Instagram: cometfox', 'https://example.com',
    'my real name is Sample Person', 'Athena\u200bis wise',
    'I go to Cedar Valley Middle School.', 'I attend Cedar Valley Academy.',
    'My teacher is in the morning class.',
    'My friend Sarah likes Athena.', 'Sarah is my friend and likes Athena.',
    'Our classmate Alex likes Zeus.', 'I know someone who likes Hera.',
  ]) assert.throws(() => validatePostText(text), { status: 400 }, text);
});

test('anyone can create a nickname-only account with a bcrypt password and no invitation', async () => {
  const f = fixture();
  const unauthenticated = await invoke(f.account);
  assert.equal(unauthenticated.status, 200);
  assert.equal(unauthenticated.body.user, null);
  const memberCookie = await member(f);
  const current = await invoke(f.account, { cookie: memberCookie });
  assert.deepEqual(current.body.user, { nickname: 'CometFox' });
  assert.doesNotMatch(JSON.stringify(current), /password|hash|userId|token|@/i);
  const users = [...f.database.collections.values()].flatMap((value) => value.documents)
    .filter((document) => document.nickname === 'CometFox' && document.passwordHash);
  assert.equal(users.length, 1);
  assert.match(users[0].passwordHash, /^\$2[ab]\$1[2-9]\$/);
  assert.ok(await bcrypt.compare(PASSWORD, users[0].passwordHash));
  assert.ok(!JSON.stringify(users[0]).includes(PASSWORD));
  const oldInviteField = await invoke(f.account, {
    method: 'POST', body: { action: 'register', nickname: 'MoonOtter', password: PASSWORD, inviteCode: 'x'.repeat(43) },
  });
  assert.equal(oldInviteField.status, 400, 'unexpected fields must be rejected');
});

test('public registration limits rapid account creation by source IP', async () => {
  const f = fixture();
  const responses = [];
  for (const nickname of ['CometFox', 'MoonOtter', 'StarBadger', 'RiverOwl', 'CloudFinch', 'SilverMoth']) {
    responses.push(await invoke(f.account, { method: 'POST', address: '192.0.2.10', body: { action: 'register', nickname, password: PASSWORD } }));
  }
  assert.deepEqual(responses.map(({ status }) => status), [201, 201, 201, 201, 201, 429]);
  assert.ok(Number(responses.at(-1).headers['retry-after']) > 0);
  assert.equal(await f.database.collection(COLLECTIONS.users).countDocuments({}), 5);
});

test('two users can read and manage only their own posts, including forged owner fields', async () => {
  const f = fixture();
  const ownerCookie = await owner(f);
  const alice = await member(f, 'CometFox');
  const bob = await member(f, 'MoonOtter');
  const alicePost = await writePost(f, alice, 'Athena has an owl symbol.');
  const bobPost = await writePost(f, bob, 'Hermes carries messages in mythology.');
  assert.deepEqual((await invoke(f.posts, { cookie: alice })).body.posts.map(({ id }) => id), [alicePost.id]);
  assert.deepEqual((await invoke(f.posts, { cookie: bob })).body.posts.map(({ id }) => id), [bobPost.id]);
  for (const method of ['PATCH', 'DELETE']) {
    clearCooldowns(f);
    const response = await invoke(f.posts, {
      method, cookie: bob, body: { id: alicePost.id, ...(method === 'PATCH' && { text: 'Changed by another member.' }) },
    });
    assert.equal(response.status, 404);
  }
  clearCooldowns(f);
  const forged = await invoke(f.posts, {
    method: 'POST', cookie: bob, body: { text: 'A myth note.', userId: 'forged-owner' },
  });
  assert.equal(forged.status, 400);
  const anonymous = await invoke(f.posts);
  assert.equal(anonymous.status, 401);
  const remaining = await invoke(f.posts, { cookie: alice });
  assert.equal(remaining.body.posts[0].text, 'Athena has an owl symbol.');
  assert.deepEqual(Object.keys(remaining.body.posts[0]).sort(), ['createdAt', 'id', 'text']);
});

test('owner access is separate, can delete any post, and stops both new posts and edits', async () => {
  const f = fixture();
  assert.equal((await invoke(f.admin)).status, 401);
  const ownerCookie = await owner(f);
  const memberCookie = await member(f);
  const post = await writePost(f, memberCookie);
  assert.equal((await invoke(f.admin, { cookie: memberCookie })).status, 401);
  assert.equal((await invoke(f.posts, { cookie: ownerCookie })).status, 401);
  const overview = await invoke(f.admin, { cookie: ownerCookie });
  assert.equal(overview.status, 200);
  assert.equal(overview.body.posts[0].nickname, 'CometFox');
  clearCooldowns(f);
  const disabled = await invoke(f.admin, {
    method: 'POST', cookie: ownerCookie, body: { action: 'posting', enabled: false },
  });
  assert.equal(disabled.status, 200);
  for (const method of ['POST', 'PATCH']) {
    clearCooldowns(f);
    const stopped = await invoke(f.posts, {
      method, cookie: memberCookie, body: { text: 'A mythology note.', ...(method === 'PATCH' && { id: post.id }) },
    });
    assert.equal(stopped.status, 403);
  }
  const after = await invoke(f.posts, { cookie: memberCookie });
  assert.equal(after.body.postingEnabled, false);
  assert.equal(after.body.posts[0].text, post.text);
  clearCooldowns(f);
  const removed = await invoke(f.admin, { method: 'DELETE', cookie: ownerCookie, body: { id: post.id } });
  assert.equal(removed.status, 200);
  assert.deepEqual((await invoke(f.posts, { cookie: memberCookie })).body.posts, []);
});

test('session cookies are private, logout revokes a copied cookie, and password errors are generic', async () => {
  const f = fixture();
  const ownerCookie = await owner(f);
  const cookie = await member(f);
  clearCooldowns(f);
  const login = await invoke(f.account, {
    method: 'POST', body: { action: 'login', nickname: 'CometFox', password: PASSWORD },
  });
  assert.equal(login.status, 200);
  const header = login.headers['set-cookie'];
  assert.match(String(header), /HttpOnly/i);
  assert.match(String(header), /SameSite=Strict/i);
  assert.match(String(header), /Path=\//i);
  clearCooldowns(f);
  const bad = await invoke(f.account, {
    method: 'POST', body: { action: 'login', nickname: 'CometFox', password: 'IncorrectMadeUpPassword' },
  });
  clearCooldowns(f);
  const missing = await invoke(f.account, {
    method: 'POST', body: { action: 'login', nickname: 'UnknownFox', password: 'IncorrectMadeUpPassword' },
  });
  assert.equal(bad.status, 401);
  assert.deepEqual(bad.body, missing.body);
  clearCooldowns(f);
  const logout = await invoke(f.account, { method: 'POST', cookie, body: { action: 'logout' } });
  assert.equal(logout.status, 200);
  assert.equal((await invoke(f.account, { cookie })).body.user, null);
  assert.equal((await invoke(f.posts, { cookie })).status, 401);
});

test('account deletion verifies the password and removes the member, private posts, and sessions', async () => {
  const f = fixture();
  const ownerCookie = await owner(f);
  const cookie = await member(f);
  await writePost(f, cookie);
  clearCooldowns(f);
  const denied = await invoke(f.account, { method: 'DELETE', cookie, body: { password: 'IncorrectMadeUpPassword' } });
  assert.equal(denied.status, 401);
  assert.equal((await invoke(f.posts, { cookie })).body.posts.length, 1);
  clearCooldowns(f);
  const deleted = await invoke(f.account, { method: 'DELETE', cookie, body: { password: PASSWORD } });
  assert.equal(deleted.status, 200);
  assert.equal((await invoke(f.account, { cookie })).body.user, null);
  assert.deepEqual((await invoke(f.admin, { cookie: ownerCookie })).body.posts, []);
  assert.ok(![...f.database.collections.values()].some((value) => value.documents.some((document) => (
    document.nickname === 'CometFox' && document.passwordHash
  ))));
});

test('mutations reject foreign or missing origins, non-JSON, oversized JSON, and malformed schemas', async () => {
  const f = fixture();
  const ownerCookie = await owner(f);
  for (const options of [
    { origin: 'https://other.invalid' },
    { origin: undefined, headers: { origin: undefined } },
    { headers: { 'content-type': 'text/plain' } },
    { raw: '{' },
    { raw: JSON.stringify({ action: 'login', passcode: 'x'.repeat(10_000) }) },
    { body: { action: 'login', passcode: OWNER_PASSCODE, email: 'forbidden@example.com' } },
    { body: { action: { $ne: '' }, passcode: OWNER_PASSCODE } },
  ]) {
    const response = await invoke(f.admin, {
      method: 'POST', cookie: ownerCookie, body: { action: 'login', passcode: OWNER_PASSCODE }, ...options,
    });
    assert.ok([400, 403, 413, 415].includes(response.status), JSON.stringify(response));
    assert.ok(!JSON.stringify(response).includes(OWNER_PASSCODE));
  }
});

test('duplicate nicknames fail and registration commits account and session together', async () => {
  const f = fixture();
  await member(f);
  clearCooldowns(f);
  const duplicate = await invoke(f.account, {
    method: 'POST', body: { action: 'register', nickname: 'CometFOX', password: PASSWORD },
  });
  assert.equal(duplicate.status, 409);
  clearCooldowns(f);
  const sessionsBefore = await f.database.collection(COLLECTIONS.sessions).countDocuments({});
  f.database.failNextCommit(new Error('PRIVATE_TRANSACTION_COMMIT_DETAILS'));
  const failed = await invoke(f.account, {
    method: 'POST', body: { action: 'register', nickname: 'MoonOtter', password: PASSWORD },
  });
  assert.equal(failed.status, 503);
  assert.ok(!JSON.stringify(failed.body).includes('PRIVATE_TRANSACTION_COMMIT_DETAILS'));
  assert.equal(await f.database.collection(COLLECTIONS.users).countDocuments({ nicknameKey: 'moonotter' }), 0);
  assert.equal(await f.database.collection(COLLECTIONS.sessions).countDocuments({}), sessionsBefore);
  clearCooldowns(f);
  const retry = await invoke(f.account, {
    method: 'POST', body: { action: 'register', nickname: 'MoonOtter', password: PASSWORD },
  });
  assert.equal(retry.status, 201);
});

test('post validation runs on the server and never persists rejected contact details', async () => {
  const f = fixture();
  const ownerCookie = await owner(f);
  const memberCookie = await member(f);
  for (const text of ['x'.repeat(501), 'sample@example.com', '555-123-4567', '@fictionalfox', '123 Sample Street']) {
    clearCooldowns(f);
    const result = await invoke(f.posts, { method: 'POST', cookie: memberCookie, body: { text } });
    assert.equal(result.status, 400);
    assert.ok(!JSON.stringify(result.body).includes(text));
  }
  assert.equal(await f.database.collection(COLLECTIONS.posts).countDocuments({}), 0);
  const accepted = await writePost(f, memberCookie, 'x'.repeat(500));
  clearCooldowns(f);
  const rejectedEdit = await invoke(f.posts, {
    method: 'PATCH', cookie: memberCookie, body: { id: accepted.id, text: 'sample@example.com' },
  });
  assert.equal(rejectedEdit.status, 400);
  assert.equal((await invoke(f.posts, { cookie: memberCookie })).body.posts[0].text, accepted.text);
});

test('legacy unsafe posts are redacted on output while retaining owner deletion access', async () => {
  const f = fixture();
  const ownerCookie = await owner(f);
  const memberCookie = await member(f);
  const user = await f.database.collection(COLLECTIONS.users).findOne({ nicknameKey: 'cometfox' });
  const id = 'e'.repeat(32);
  await f.database.collection(COLLECTIONS.posts).insertOne({
    _id: id, userId: user._id, nickname: 'sample@example.com',
    text: 'Email sample@example.com to contact this made-up person.', createdAt: new Date(),
  });
  for (const [handler, cookie] of [[f.posts, memberCookie], [f.admin, ownerCookie]]) {
    const response = await invoke(handler, { cookie });
    assert.equal(response.status, 200);
    assert.ok(!JSON.stringify(response).includes('sample@example.com'));
  }
  const visible = await invoke(f.admin, { cookie: ownerCookie });
  assert.equal(visible.body.posts[0].id, id, 'the owner can select an unsafe legacy post for deletion');
  clearCooldowns(f);
  assert.equal((await invoke(f.admin, { method: 'DELETE', cookie: ownerCookie, body: { id } })).status, 200);
});

test('expired, forged, and duplicate cookies cannot authenticate; rotating the owner secret revokes owner sessions', async () => {
  const f = fixture();
  const ownerCookie = await owner(f);
  const memberCookie = await member(f);
  const sessionToken = memberCookie.split('=')[1];
  const session = await f.database.collection(COLLECTIONS.sessions).findOne({ _id: hashToken(sessionToken) });
  assert.ok(session);
  assert.ok(!JSON.stringify(session).includes(sessionToken), 'raw session tokens are never stored');
  for (const cookie of [`${memberCookie}; ${memberCookie}`, `mythos_session=${'x'.repeat(43)}`, 'mythos_session=bad']) {
    assert.equal((await invoke(f.posts, { cookie })).status, 401);
  }
  await f.database.collection(COLLECTIONS.sessions).updateOne({ _id: session._id }, { $set: { expiresAt: new Date(0) } });
  assert.equal((await invoke(f.posts, { cookie: memberCookie })).status, 401);
  try {
    process.env.ADMIN_PASSCODE = 'DifferentMadeUpOwnerPasscode';
    assert.equal((await invoke(f.admin, { cookie: ownerCookie })).status, 401);
  } finally { process.env.ADMIN_PASSCODE = OWNER_PASSCODE; }
});

test('HTTPS deployment authentication sets a Secure session cookie', async () => {
  const f = fixture();
  const previous = process.env.NODE_ENV;
  try {
    process.env.NODE_ENV = 'production';
    const response = await invoke(f.admin, {
      method: 'POST', origin: 'https://localhost:3000', body: { action: 'login', passcode: OWNER_PASSCODE },
    });
    assert.equal(response.status, 200);
    assert.match(String(response.headers['set-cookie']), /; Secure(?:;|$)/i);
  } finally {
    if (previous === undefined) delete process.env.NODE_ENV;
    else process.env.NODE_ENV = previous;
  }
});

test('owner pagination reaches every post exactly once and validates cursor inputs', async () => {
  const f = fixture();
  const ownerCookie = await owner(f);
  for (let index = 0; index < 205; index += 1) {
    await f.database.collection(COLLECTIONS.posts).insertOne({
      _id: index.toString(16).padStart(32, '0'), userId: 'a'.repeat(32), nickname: 'CometFox',
      text: `Athena mythology note ${index}.`, createdAt: new Date(Math.floor(index / 20) * 1000),
    });
  }
  const seen = [];
  let cursor = null;
  for (const expectedSize of [100, 100, 5]) {
    const response = await invoke(f.admin, {
      cookie: ownerCookie, url: `/api/admin${cursor ? `?cursor=${cursor}` : ''}`,
    });
    assert.equal(response.status, 200);
    assert.equal(response.body.posts.length, expectedSize);
    seen.push(...response.body.posts.map(({ id }) => id));
    cursor = response.body.nextCursor;
  }
  assert.equal(cursor, null);
  assert.equal(new Set(seen).size, 205);
  assert.deepEqual(seen, [...seen].sort().reverse());
  for (const url of [
    '/api/admin?cursor=invalid', '/api/admin?cursor[$ne]=anything',
    `/api/admin?cursor=${'a'.repeat(32)}&cursor=${'b'.repeat(32)}`,
    '/api/admin?cursor=%E0%A4%A', '/api/admin?other=anything',
  ]) assert.equal((await invoke(f.admin, { cookie: ownerCookie, url })).status, 400);
  const first = await invoke(f.admin, { cookie: ownerCookie });
  await f.database.collection(COLLECTIONS.posts).deleteOne({ _id: first.body.nextCursor });
  assert.equal((await invoke(f.admin, { cookie: ownerCookie, url: `/api/admin?cursor=${first.body.nextCursor}` })).status, 400);
});

test('concurrent fast requests are limited across independent handler instances', async () => {
  const f = fixture();
  const ownerCookie = await owner(f);
  const memberCookie = await member(f);
  clearCooldowns(f);
  const independent = createPostsHandler(async () => f.database, { promise: null });
  const responses = await Promise.all(Array.from({ length: 12 }, (_, index) => invoke(index % 2 ? f.posts : independent, {
    method: 'POST', cookie: memberCookie, address: '192.0.2.7', body: { text: `A myth note ${index}.` },
  })));
  assert.equal(responses.filter(({ status }) => status === 201).length, 1);
  assert.equal(responses.filter(({ status }) => status === 429).length, 11);
  assert.ok(responses.filter(({ status }) => status === 429).every(({ headers }) => Number(headers['retry-after']) > 0));
  assert.equal((await invoke(f.posts, { cookie: memberCookie })).body.posts.length, 1);
});

test('database failures give fixed errors and never leak driver details', async () => {
  const failing = async () => { throw new Error('PRIVATE_DATABASE_URL_PASSWORD'); };
  for (const handler of [createAccountHandler(failing), createPostsHandler(failing), createAdminHandler(failing)]) {
    const response = await invoke(handler);
    assert.equal(response.status, 503);
    assert.ok(!JSON.stringify(response).includes('PRIVATE_DATABASE_URL_PASSWORD'));
    assert.deepEqual(Object.keys(response.body), ['error']);
    assert.equal(response.headers['cache-control'], 'no-store');
    assert.equal(response.headers['x-content-type-options'], 'nosniff');
  }
});

test('privacy filtering catches colon declarations and common introductions while allowing historical school research', async () => {
  const f = fixture(); const ownerCookie = await owner(f); const cookie = await member(f);
  for (const text of [
    'Full name: Astra Fictional', 'Real name=Astra Fictional', 'My name: Astra Fictional',
    'My full name is Astra Fictional', 'Name: Astra Fictional', 'Call me Astra Fictional',
    'Me llamo Astra Fictional', 'Mi nombre es Astra Fictional', "Je m’appelle Astra Fictional", 'Mon nom est Astra Fictional',
    'Meu nome é Astra Fictional', 'Eu me chamo Astra Fictional', 'Ich heiße Astra Fictional', 'Mein Name ist Astra Fictional',
    'Mi chiamo Astra Fictional', 'Il mio nome è Astra Fictional',
    'My school is at the edge of town.', 'Our academy is Cedar Valley Academy.', 'University address: Sample Road',
  ]) {
    assert.throws(() => validatePostText(text), { status: 400 }, text);
    const result = await invoke(f.posts, { method: 'POST', cookie, body: { text } });
    assert.equal(result.status, 400, text);
  }
  assert.equal(await f.database.collection(COLLECTIONS.posts).countDocuments({}), 0);
  for (const text of [
    'The Academy of Athens has a statue of Athena.', 'The university library has books about Roman myths.',
    'Ancient schools discussed philosophy and mythology.', 'Her Roman name is Minerva.',
    'Ancient students attend the Academy in this imagined scene.', 'The Academy is in Athens.',
  ]) {
    assert.equal(validatePostText(text), text);
    const post = await writePost(f, cookie, text);
    assert.equal(post.text, text);
  }
});

test('nickname suggestions use a large curated space and exclude unavailable account names', async () => {
  const { nicknameStarts, nicknameEnds } = await import('../public/nickname-words.js');
  const candidates = nicknameStarts.flatMap((start) => nicknameEnds.map((end) => `${start}-${end}`)).filter((name) => name.length <= 24);
  assert.ok(new Set(candidates.map((name) => name.toLowerCase())).size >= 6000);
  const f = fixture();
  // Only one suggestion remains, so this also exercises every randomized batch.
  const remaining = candidates.at(-1);
  f.database.collection(COLLECTIONS.users).documents = candidates.slice(0, -1).map((nickname, index) => ({ _id: `fixture-${index}`, nicknameKey: nickname.toLowerCase() }));
  const response = await invoke(f.account, { url: '/api/account?mode=nickname' });
  assert.equal(response.status, 200);
  assert.deepEqual(response.body, { nickname: remaining });
  assert.equal(validateSignupNickname(remaining), remaining);
  f.database.collection(COLLECTIONS.users).documents.push({ _id: 'fixture-last', nicknameKey: remaining.toLowerCase() });
  assert.equal((await invoke(f.account, { url: '/api/account?mode=nickname' })).status, 503);
});

test('recovery codes are private, one-use, replace passwords, and revoke previous sessions', async () => {
  const f = fixture();
  const joined = await invoke(f.account, { method: 'POST', body: { action: 'register', nickname: 'CometFox', password: PASSWORD } });
  assert.equal(joined.status, 201);
  const code = joined.body.recoveryCode; const oldCookie = cookieOf(joined);
  assert.match(code, /^[A-Za-z0-9_-]{43}$/);
  const stored = await f.database.collection(COLLECTIONS.users).findOne({ nicknameKey: 'cometfox' });
  assert.equal(stored.recoveryHash, hashToken(code));
  assert.ok(!JSON.stringify(stored).includes(code));
  for (const response of [await invoke(f.account, { cookie: oldCookie }), await invoke(f.account, { method: 'POST', body: { action: 'login', nickname: 'CometFox', password: PASSWORD } })]) {
    assert.ok(!JSON.stringify(response.body).includes(code)); assert.equal(response.body.recoveryCode, undefined);
  }
  await writePost(f, oldCookie);
  clearCooldowns(f);
  const wrong = await invoke(f.account, { method: 'POST', body: { action: 'recover', nickname: 'CometFox', recoveryCode: 'x'.repeat(43), password: 'DifferentFictionalPassword' } });
  const missing = await invoke(f.account, { method: 'POST', body: { action: 'recover', nickname: 'UnknownFox', recoveryCode: 'x'.repeat(43), password: 'DifferentFictionalPassword' } });
  assert.equal(wrong.status, 401); assert.deepEqual(wrong.body, missing.body);
  clearCooldowns(f);
  const recovered = await invoke(f.account, { method: 'POST', body: { action: 'recover', nickname: 'CometFox', recoveryCode: code, password: 'DifferentFictionalPassword' } });
  assert.equal(recovered.status, 200); assert.notEqual(recovered.body.recoveryCode, code);
  assert.equal((await invoke(f.account, { cookie: oldCookie })).body.user, null);
  assert.equal((await invoke(f.posts, { cookie: cookieOf(recovered) })).body.posts.length, 1);
  clearCooldowns(f);
  assert.equal((await invoke(f.account, { method: 'POST', body: { action: 'recover', nickname: 'CometFox', recoveryCode: code, password: PASSWORD } })).status, 401);
  assert.equal((await invoke(f.account, { method: 'POST', body: { action: 'login', nickname: 'CometFox', password: PASSWORD } })).status, 401);
  assert.equal((await invoke(f.account, { method: 'POST', body: { action: 'login', nickname: 'CometFox', password: 'DifferentFictionalPassword' } })).status, 200);
  assert.equal((await invoke(f.admin, { cookie: cookieOf(recovered) })).status, 401);
});

test('password-protected code rotation supports older accounts and invalidates former codes and sessions', async () => {
  const f = fixture(); const ownerCookie = await owner(f); const oldCookie = await member(f);
  const users = f.database.collection(COLLECTIONS.users);
  const user = await users.findOne({ nicknameKey: 'cometfox' });
  const formerCode = 'p'.repeat(43);
  await users.updateOne({ _id: user._id }, { $set: { recoveryHash: hashToken(formerCode) } });
  const denied = await invoke(f.account, { method: 'POST', cookie: oldCookie, body: { action: 'recovery-code', password: 'WrongFictionalPassword' } });
  assert.equal(denied.status, 401);
  assert.equal((await users.findOne({ _id: user._id })).recoveryHash, hashToken(formerCode));
  const updated = await invoke(f.account, { method: 'POST', cookie: oldCookie, body: { action: 'recovery-code', password: PASSWORD } });
  assert.equal(updated.status, 200); assert.match(updated.body.recoveryCode, /^[A-Za-z0-9_-]{43}$/);
  assert.equal((await invoke(f.account, { cookie: oldCookie })).body.user, null);
  assert.equal((await invoke(f.account, { cookie: cookieOf(updated) })).body.user.nickname, 'CometFox');
  assert.equal((await invoke(f.account, { method: 'POST', body: { action: 'recover', nickname: 'CometFox', recoveryCode: formerCode, password: PASSWORD } })).status, 401);
  await users.updateOne({ _id: user._id }, { $unset: { recoveryHash: '' } });
  const legacy = await invoke(f.account, { method: 'POST', cookie: cookieOf(updated), body: { action: 'recovery-code', password: PASSWORD } });
  assert.equal(legacy.status, 200);
});

test('recovery code consumption is atomic, rolls back on failure, and recovery attempts are limited', async () => {
  const f = fixture(); const ownerCookie = await owner(f); const cookie = await member(f);
  const issued = await invoke(f.account, { method: 'POST', cookie, body: { action: 'recovery-code', password: PASSWORD } });
  const code = issued.body.recoveryCode;
  f.database.failNextCommit(new Error('PRIVATE_COMMIT_FAILURE'));
  const failed = await invoke(f.account, { method: 'POST', body: { action: 'recover', nickname: 'CometFox', recoveryCode: code, password: 'ReplacementFictionalPassword' } });
  assert.equal(failed.status, 503);
  assert.equal(failed.headers['set-cookie'], undefined, 'a rolled-back recovery must not replace the browser session');
  assert.equal((await invoke(f.account, { cookie: cookieOf(issued) })).body.user.nickname, 'CometFox');
  clearCooldowns(f);
  const responses = await Promise.all(Array.from({ length: 2 }, () => invoke(f.account, { method: 'POST', body: { action: 'recover', nickname: 'CometFox', recoveryCode: code, password: 'ReplacementFictionalPassword' } })));
  assert.equal(responses.filter((response) => response.status === 200).length, 1);
  assert.equal(responses.filter((response) => response.status === 401).length, 1);
  clearCooldowns(f);
  const attempts = [];
  for (let index = 0; index < 6; index += 1) attempts.push(await invoke(f.account, { method: 'POST', body: { action: 'recover', nickname: 'CometFox', recoveryCode: 'x'.repeat(43), password: PASSWORD } }));
  assert.equal(attempts.at(-1).status, 429);
  assert.ok(attempts.at(-1).headers['retry-after']);
});
