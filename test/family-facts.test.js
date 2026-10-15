import assert from 'node:assert/strict';
import { test } from 'node:test';
import { sampleGods } from '../api/_lib/sample-gods.js';
import { familyFactsFor } from '../public/family-facts.js';

test('sourced family facts attach only to real collection entries', () => {
  const availableIds = new Set(sampleGods.map(({ id }) => id));
  const factIds = [
    'greek-zeus', 'greek-hera', 'greek-poseidon', 'greek-demeter',
    'greek-athena', 'greek-apollo', 'greek-artemis', 'greek-ares',
    'greek-aphrodite', 'greek-hephaestus', 'greek-hermes', 'greek-hestia',
    'greek-dionysus', 'greek-hades', 'greek-persephone', 'greek-asclepius',
    'greek-cronus', 'greek-rhea', 'greek-amphitrite', 'greek-triton',
    'roman-mars', 'roman-venus', 'roman-ceres',
    ...['calliope', 'clio', 'erato', 'euterpe', 'melpomene', 'polyhymnia', 'terpsichore', 'thalia-muse', 'urania'].map((name) => `greek-${name}`),
  ];

  for (const id of factIds) {
    assert.ok(availableIds.has(id), `${id} must appear in the collection`);
    const facts = familyFactsFor(id);
    assert.ok(facts, `${id} has family facts`);
    assert.ok(facts.parents || facts.partner || facts.children || facts.sibling);
    assert.match(facts.source, /^https:\/\//);
  }
  assert.equal(familyFactsFor('missing-figure'), null);
  assert.equal(familyFactsFor('__proto__'), null);
});

test('different ancient versions are labeled instead of presented as one genealogy', () => {
  assert.match(familyFactsFor('greek-aphrodite').parents, /one tradition.*another/i);
  assert.match(familyFactsFor('greek-hephaestus').parents, /some accounts/i);
  assert.match(familyFactsFor('greek-amphitrite').parents, /other accounts/i);
});
