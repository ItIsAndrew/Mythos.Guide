import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createGodsHandler } from '../api/gods.js';
import { normalizeSearch, sampleGods } from '../api/_lib/sample-gods.js';

function searchableArchive() {
  const collection = {
    async createIndex() {},
    async bulkWrite() {},
    find(filter) {
      const matches = sampleGods.filter((figure) => (
        filter.id.$in.includes(figure.id)
        && figure.searchNames.some((name) => new RegExp(filter.searchNames.$regex).test(name))
      ));
      return {
        limit(count) { this.count = count; return this; },
        async toArray() { return matches.slice(0, this.count); },
      };
    },
  };
  return { collection: () => collection };
}

async function search(handler, name) {
  let body;
  const response = {
    setHeader() {},
    end(value) { body = JSON.parse(value); },
  };
  await handler({ method: 'GET', url: `/api/gods?q=${encodeURIComponent(name)}` }, response);
  assert.equal(response.statusCode, 200, name);
  return body.results;
}

test('named lesser-known divine figures are searchable, including alternate spellings', async () => {
  const handler = createGodsHandler(async () => searchableArchive());
  for (const [name, id] of [
    ['Hebe', 'greek-hebe'],
    ['Eileithyia', 'greek-eileithyia'],
    ['Morpheus', 'greek-morpheus'],
    ['Nereus', 'greek-nereus'],
    ['Mnemosyne', 'greek-mnemosyne'],
    ['Hekate', 'greek-hecate'],
  ]) {
    assert.ok(sampleGods.some((figure) => figure.id === id && figure.searchNames.includes(normalizeSearch(name))));
    const results = await search(handler, name);
    assert.equal(results[0]?.id, id, name);
  }
});
