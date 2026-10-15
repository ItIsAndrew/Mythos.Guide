import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createGodsHandler } from '../api/gods.js';
import { normalizeSearch, sampleGods } from '../api/_lib/sample-gods.js';

const publicKeys = ['description', 'domain', 'equivalent', 'id', 'name', 'symbols', 'tradition'];
const unavailable = {
  error: 'The mythology archive is taking a break. Please try your search again in a moment.',
};

function mockDatabase() {
  const calls = { indexes: [], writes: [], finds: [], collections: [] };
  const collection = {
    async createIndex(...args) { calls.indexes.push(args); },
    async bulkWrite(...args) { calls.writes.push(args); },
    find(filter, options) {
      const call = { filter, options, limit: null };
      calls.finds.push(call);
      // Returning extra fields intentionally verifies the HTTP response strips
      // database metadata even if a driver/mock ignores the projection.
      let records = sampleGods.toReversed().map((record) => ({ ...record, _id: 'sample-private-id' }));
      records = records.filter((record) => (
        record.sampleArchive === filter.sampleArchive
        && (!filter.id || filter.id.$in.includes(record.id))
        && (!filter.tradition || record.tradition === filter.tradition)
        && (!filter.searchNames || record.searchNames.some((name) => new RegExp(filter.searchNames.$regex).test(name)))
      ));
      return {
        limit(limit) { call.limit = limit; return this; },
        async toArray() { return records.slice(0, call.limit); },
      };
    },
  };
  const database = {
    collection(name) { calls.collections.push(name); return collection; },
  };
  return { database, collection, calls };
}

async function invoke(handler, url, { method = 'GET', query } = {}) {
  const headers = {};
  let body;
  const response = {
    setHeader(name, value) { headers[name.toLowerCase()] = value; },
    end(value) { body = JSON.parse(value); },
  };
  await handler({ method, url, ...(query && { query }) }, response);
  return { status: response.statusCode, headers, body };
}

test('browse returns the complete alphabetical sample archive with public descriptions', async () => {
  const { database, calls } = mockDatabase();
  const handler = createGodsHandler(async () => database);
  const response = await invoke(handler, '/api/gods?mode=browse');
  assert.equal(response.status, 200);
  assert.equal(response.headers['cache-control'], 'no-store');
  assert.equal(response.headers['x-content-type-options'], 'nosniff');
  assert.equal(response.body.mode, 'browse');
  assert.equal(response.body.total, 141);
  const expected = sampleGods.toSorted((a, b) => (
    a.name.localeCompare(b.name, 'en') || a.tradition.localeCompare(b.tradition, 'en') || a.id.localeCompare(b.id, 'en')
  ));
  assert.deepEqual(response.body.results.map(({ id }) => id), expected.map(({ id }) => id));
  for (const record of response.body.results) {
    assert.deepEqual(Object.keys(record).sort(), publicKeys);
    assert.equal(record.description, sampleGods.find(({ id }) => id === record.id).description);
  }
  assert.equal(calls.finds[0].limit, sampleGods.length);
  assert.equal(calls.finds[0].options.maxTimeMS, 3_000);
  assert.equal(calls.finds[0].options.projection._id, 0);
  assert.deepEqual(calls.finds[0].filter.id.$in, sampleGods.map(({ id }) => id));
  assert.deepEqual(calls.collections, ['mythos_guide_sample_gods']);
});

test('all, Greek, and Roman filters return only the requested tradition', async () => {
  const { database, calls } = mockDatabase();
  const handler = createGodsHandler(async () => database);
  for (const tradition of ['all', 'Greek', 'Roman']) {
    const { status, body } = await invoke(handler, `/api/gods?mode=browse&tradition=${tradition}`);
    const expected = sampleGods.filter((record) => tradition === 'all' || record.tradition === tradition);
    assert.equal(status, 200);
    assert.equal(body.total, expected.length);
    assert.equal(body.results.length, expected.length);
    assert.ok(body.results.every((record) => tradition === 'all' || record.tradition === tradition));
    assert.equal(calls.finds.at(-1).filter.tradition, tradition === 'all' ? undefined : tradition);
  }
  assert.equal(calls.writes.length, 1, 'one handler seeds only once across requests');
});

test('seeding uses insert-only upserts and preserves existing sample records', async () => {
  const { database, calls } = mockDatabase();
  const handler = createGodsHandler(async () => database);
  await invoke(handler, '/api/gods?mode=browse');
  await invoke(handler, '/api/gods?q=Zeus');
  assert.equal(calls.indexes.length, 1);
  assert.deepEqual(calls.indexes[0], [{ id: 1 }, { unique: true, name: 'sample_god_id' }]);
  assert.equal(calls.writes.length, 1);
  const [operations, options] = calls.writes[0];
  assert.equal(operations.length, sampleGods.length);
  assert.deepEqual(options, { ordered: false });
  for (const [index, operation] of operations.entries()) {
    assert.deepEqual(operation, {
      updateOne: {
        filter: { id: sampleGods[index].id },
        update: { $setOnInsert: sampleGods[index] },
        upsert: true,
      },
    });
  }
});

test('search retains aliases, accents, exact-name ranking, ambiguity, limits, and no matches', async () => {
  const { database, calls } = mockDatabase();
  const handler = createGodsHandler(async () => database);
  for (const [query, expectedId] of [
    ['  Zeús  ', 'greek-zeus'],
    ['Jove', 'roman-jupiter'],
    ['ATHÉNA', 'greek-athena'],
    ['Pallas-Athena', 'greek-athena'],
    ['Ζεύς', 'greek-zeus'],
    ['Aether', 'greek-aether'],
    ['Aither', 'greek-aether'],
    ['Euterpe', 'greek-euterpe'],
    ['Euterpê', 'greek-euterpe'],
    ['Calliope', 'greek-calliope'],
    ['Clio', 'greek-clio'],
    ['Erato', 'greek-erato'],
    ['Melpomene', 'greek-melpomene'],
    ['Polyhymnia', 'greek-polyhymnia'],
    ['Terpsichore', 'greek-terpsichore'],
    ['Thalia', 'greek-thalia-grace'],
    ['Thalia the Grace', 'greek-thalia-grace'],
    ['Aglaia', 'greek-aglaia'],
    ['Euphrosyne', 'greek-euphrosyne'],
    ['Eirene', 'greek-eirene'],
    ['Dike', 'greek-dike'],
    ['Eunomia', 'greek-eunomia'],
    ['Alecto', 'greek-alecto'],
    ['Megaera', 'greek-megaera'],
    ['Tisiphone', 'greek-tisiphone'],
    ['Heracles', 'greek-heracles'],
    ['Aesculapius', 'roman-aesculapius'],
    ['Urania', 'greek-urania'],
    ['Chronos', 'greek-chronos'],
    ['Cronus', 'greek-cronus'],
    ['Rhea', 'greek-rhea'],
    ['Themis', 'greek-themis'],
    ['Amphitrite', 'greek-amphitrite'],
    ['Triton', 'greek-triton'],
    ['Flora', 'roman-flora'],
    ['Terminus', 'roman-terminus'],
    ['Somnus', 'roman-somnus'],
  ]) {
    const { status, body } = await invoke(handler, `/api/gods?q=${encodeURIComponent(query)}`);
    assert.equal(status, 200);
    assert.equal(body.query, query.trim());
    assert.equal(body.results[0].id, expectedId);
    assert.equal(calls.finds.at(-1).filter.searchNames.$regex, normalizeSearch(query));
    assert.equal(calls.finds.at(-1).limit, sampleGods.length);
    assert.deepEqual(calls.finds.at(-1).filter.id.$in, sampleGods.map(({ id }) => id));
  }
  const apollo = await invoke(handler, '/api/gods?q=Apollo');
  assert.deepEqual(apollo.body.results.map(({ id }) => id), ['greek-apollo', 'roman-apollo']);
  const thalia = await invoke(handler, '/api/gods?q=Thalia');
  assert.deepEqual(thalia.body.results.map(({ id }) => id), ['greek-thalia-grace', 'greek-thalia-muse']);
  const broad = await invoke(handler, '/api/gods?q=a');
  assert.equal(broad.body.results.length, 8);
  assert.equal(broad.body.results[0].name, 'Aesculapius');
  for (const record of broad.body.results) assert.deepEqual(Object.keys(record).sort(), publicKeys);
  assert.deepEqual((await invoke(handler, '/api/gods?q=not-a-god-123')).body, {
    query: 'not-a-god-123', results: [],
  });
});

test('Vercel query objects support browse and reject arrays, objects, and conflicting inputs', async () => {
  const { database } = mockDatabase();
  let databaseCalls = 0;
  const handler = createGodsHandler(async () => { databaseCalls += 1; return database; });
  const valid = await invoke(handler, '/api/gods', { query: { mode: 'browse', tradition: 'Roman' } });
  assert.equal(valid.status, 200);
  assert.ok(valid.body.results.every(({ tradition }) => tradition === 'Roman'));
  assert.equal(databaseCalls, 1);

  for (const query of [
    { mode: ['browse'] },
    { mode: { $ne: '' } },
    { mode: 'browse', tradition: ['Greek'] },
    { mode: 'browse', tradition: { $ne: '' } },
    { mode: 'browse', q: 'Zeus' },
    { mode: 'browse', q: ['Zeus'] },
    { mode: 'browse', tradition: 'greek' },
    { mode: 'browse', tradition: 'Egyptian' },
    { mode: 'unknown', q: 'Zeus' },
    { tradition: 'Greek', q: 'Zeus' },
    { 'mode[]': 'browse', q: 'Zeus' },
    { mode: 'browse', 'tradition[$ne]': '' },
  ]) {
    const response = await invoke(handler, '/api/gods', { query });
    assert.equal(response.status, 400);
  }
  for (const url of [
    '/api/gods?mode=browse&mode=browse',
    '/api/gods?mode=browse&tradition=Greek&tradition=Roman',
  ]) {
    const response = await invoke(handler, url, { query: { mode: 'browse', tradition: 'Greek' } });
    assert.equal(response.status, 400, 'repeated URL parameters are rejected even with a query object');
  }
  assert.equal(databaseCalls, 1, 'invalid requests never reach the database');
});

test('database failures return a fixed private error for search and browse', async () => {
  const handler = createGodsHandler(async () => { throw new Error('PRIVATE_DRIVER_DETAILS'); });
  for (const url of ['/api/gods?q=Zeus', '/api/gods?mode=browse']) {
    const response = await invoke(handler, url);
    assert.equal(response.status, 503);
    assert.deepEqual(response.body, unavailable);
    assert.ok(!JSON.stringify(response).includes('PRIVATE_DRIVER_DETAILS'));
  }
});

test('failed archive preparation can be retried without caching a rejected promise', async () => {
  const { database, collection } = mockDatabase();
  let attempts = 0;
  collection.createIndex = async () => {
    attempts += 1;
    if (attempts === 1) throw new Error('PRIVATE_DRIVER_DETAILS');
  };
  const handler = createGodsHandler(async () => database);
  const first = await invoke(handler, '/api/gods?mode=browse');
  assert.equal(first.status, 503);
  assert.deepEqual(first.body, unavailable);
  const second = await invoke(handler, '/api/gods?mode=browse');
  assert.equal(second.status, 200);
  assert.equal(second.body.total, sampleGods.length);
  assert.equal(attempts, 2);
});

test('a failed database read also returns a fixed error without driver details', async () => {
  const { database, collection } = mockDatabase();
  collection.find = () => { throw new Error('PRIVATE_DRIVER_DETAILS'); };
  const handler = createGodsHandler(async () => database);
  for (const url of ['/api/gods?q=Zeus', '/api/gods?mode=browse']) {
    const response = await invoke(handler, url);
    assert.equal(response.status, 503);
    assert.deepEqual(response.body, unavailable);
  }
});
