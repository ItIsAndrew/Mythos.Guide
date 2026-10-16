import assert from 'node:assert/strict';
import { test } from 'node:test';
import { sampleGods } from '../api/_lib/sample-gods.js';
import { worlds, stories } from '../public/learn-content.js';
import { topics, filterGodsByTopic, chooseRandomGod, comparisons, glossary, suggestionsFor } from '../public/discovery-content.js';

const byId = (id) => sampleGods.find((god) => god.id === id);
const ids = (gods) => gods.map(({ id }) => id);

test('topics combine with either tradition and preserve archive ordering', () => {
  assert.deepEqual(topics.map(({ id }) => id), ['all', 'sea', 'sky', 'arts', 'nature', 'underworld']);
  const greekSea = filterGodsByTopic(sampleGods.filter((god) => god.tradition === 'Greek'), 'sea');
  const romanSea = filterGodsByTopic(sampleGods.filter((god) => god.tradition === 'Roman'), 'sea');
  assert.ok(ids(greekSea).includes('greek-poseidon'));
  assert.ok(ids(greekSea).includes('greek-nereus'));
  assert.ok(ids(romanSea).includes('roman-neptune'));
  assert.ok(ids(romanSea).includes('roman-portunus'));
  assert.ok(greekSea.every((god) => god.tradition === 'Greek'));
  assert.deepEqual(filterGodsByTopic(sampleGods, 'all'), sampleGods);
  assert.deepEqual(filterGodsByTopic(sampleGods, 'missing'), sampleGods);
  assert.deepEqual(filterGodsByTopic(sampleGods, '__proto__'), sampleGods);
  assert.deepEqual(filterGodsByTopic([], 'sea'), []);
});

test('topics support multiple roles without confusing similarly named figures', () => {
  const arts = ids(filterGodsByTopic(sampleGods, 'arts'));
  const sky = ids(filterGodsByTopic(sampleGods, 'sky'));
  const nature = ids(filterGodsByTopic(sampleGods, 'nature'));
  const underworld = ids(filterGodsByTopic(sampleGods, 'underworld'));
  assert.ok(arts.includes('greek-euterpe'));
  assert.ok(arts.includes('greek-thalia-muse'));
  assert.ok(!arts.includes('greek-thalia-grace'));
  assert.ok(sky.includes('greek-aether'));
  assert.ok(sky.includes('greek-urania') && arts.includes('greek-urania'));
  assert.ok(nature.includes('greek-persephone') && underworld.includes('greek-persephone'));
  assert.ok(underworld.includes('greek-hermes'));
  assert.ok(underworld.includes('roman-mercury'));
  assert.ok(!underworld.includes('greek-plutus'));
});

test('topic filtering and random selection leave their input untouched', () => {
  const records = Object.freeze([Object.freeze(byId('greek-zeus')), Object.freeze(byId('greek-poseidon'))]);
  assert.deepEqual(ids(filterGodsByTopic(records, 'sea')), ['greek-poseidon']);
  assert.equal(chooseRandomGod(records, 'greek-zeus', () => 0), records[1]);
  assert.deepEqual(ids(records), ['greek-zeus', 'greek-poseidon']);
});

test('random discovery handles empty and one-god groups and avoids the previous god', () => {
  assert.equal(chooseRandomGod([], null), null);
  const zeus = byId('greek-zeus');
  assert.equal(chooseRandomGod([zeus], zeus.id), zeus);
  const group = [zeus, byId('greek-poseidon'), byId('greek-athena')];
  assert.equal(chooseRandomGod(group, zeus.id, () => 0), group[1]);
  assert.equal(chooseRandomGod(group, zeus.id, () => 0.99), group[2]);
  assert.equal(chooseRandomGod(group, null, () => 0), group[0]);
  assert.equal(chooseRandomGod(group, null, () => 1), group[2]);
  assert.equal(chooseRandomGod(group, null, () => Number.NaN), group[0]);
});

test('comparison names resolve to distinct archive entries in their stated tradition', () => {
  assert.equal(comparisons.length, 12);
  for (const pair of comparisons) {
    assert.equal(sampleGods.filter((god) => god.name === pair.greek && god.tradition === 'Greek').length, 1);
    assert.equal(sampleGods.filter((god) => god.name === pair.roman && god.tradition === 'Roman').length, 1);
    assert.ok(pair.domain.length > 2);
  }
  assert.deepEqual(comparisons.find(({ greek }) => greek === 'Apollo'), { greek: 'Apollo', roman: 'Apollo', domain: 'Music, healing, and prophecy' });
  assert.deepEqual(glossary.map(({ term }) => term), ['Myth', 'Deity', 'Pantheon', 'Olympian', 'Titan', 'Underworld', 'Oracle', 'Nymph']);
  assert.ok(glossary.every(({ definition }) => definition.length > 15 && definition.length < 180));
});

test('suggestions prioritize existing exact relationships and counterparts', () => {
  const athena = suggestionsFor(byId('greek-athena'), worlds, stories);
  assert.deepEqual(ids(athena.stories), ['athenas-gift']);
  assert.deepEqual(ids(athena.worlds), ['olympus']);
  const ceres = suggestionsFor(byId('roman-ceres'), worlds, stories);
  assert.deepEqual(ids(ceres.stories), ['persephones-return']);
  const mercury = suggestionsFor(byId('roman-mercury'), worlds, stories);
  assert.ok(ids(mercury.stories).includes('an-open-door'));
  assert.equal(mercury.stories.length, 2);
  assert.equal(mercury.worlds.length, 1);
});

test('suggestions recognize aliases exactly without matching name fragments', () => {
  const fixtures = [
    { id: 'alias-story', relatedGods: ['Athene'] },
    { id: 'fragment-story', relatedGods: ['Athenaia'] },
  ];
  const result = suggestionsFor({ id: 'local-athena', name: 'Athena', aliases: ['Athene'] }, [], fixtures);
  assert.deepEqual(ids(result.stories), ['alias-story']);
  assert.deepEqual(suggestionsFor({ name: 'Pan' }, [], [{ id: 'bad-match', relatedGods: ['Pandora'] }]).stories, []);
});

test('unqualified Thalia names do not establish a false Muse or Grace relationship', () => {
  const fixtures = [
    { id: 'ambiguous', relatedGods: ['Thalia'] },
    { id: 'muse', relatedGods: ['greek-thalia-muse'] },
    { id: 'grace', relatedGods: ['Thalia the Grace'] },
  ];
  assert.deepEqual(ids(suggestionsFor(byId('greek-thalia-muse'), [], fixtures).stories), ['muse']);
  assert.deepEqual(ids(suggestionsFor(byId('greek-thalia-grace'), [], fixtures).stories), ['grace']);
});

test('thematic suggestions use real content and never invent a missing story or world', () => {
  assert.deepEqual(ids(suggestionsFor(byId('greek-euterpe'), worlds, stories).stories), ['hermes-and-the-lyre']);
  assert.deepEqual(ids(suggestionsFor(byId('greek-nereus'), worlds, stories).worlds), ['sea']);
  assert.deepEqual(suggestionsFor(byId('greek-euterpe'), [], []), { stories: [], worlds: [] });
  assert.deepEqual(suggestionsFor(null, worlds, stories), { stories: [], worlds: [] });
  assert.deepEqual(suggestionsFor({ name: 'Unknown', domain: 'Unknown' }, worlds, stories), { stories: [], worlds: [] });
  for (const god of sampleGods) {
    const result = suggestionsFor(god, worlds, stories);
    assert.ok(result.stories.length <= 2 && result.worlds.length <= 1);
    assert.ok(result.stories.every((story) => stories.includes(story)));
    assert.ok(result.worlds.every((world) => worlds.includes(world)));
  }
});
