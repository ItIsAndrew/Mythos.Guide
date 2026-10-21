import assert from 'node:assert/strict';
import { test } from 'node:test';
import { sampleGods } from '../api/_lib/sample-gods.js';
import { guideFor, guideTopics } from '../public/god-guide.js';
import { filterGodsByTopic, suggestionsFor } from '../public/discovery-content.js';
import { worlds, stories } from '../public/learn-content.js';

test('all 141 figures have public sources, version notes, and explicit valid role tags', () => {
  const topicIds = guideTopics.map(({ id }) => id);
  assert.equal(sampleGods.length, 141);
  assert.equal(new Set(topicIds).size, 12);
  for (const god of sampleGods) {
    const guide = guideFor(god.id);
    assert.ok(guide, god.id);
    assert.ok(guide.topics.length > 0, god.id);
    assert.equal(guide.topics.length, new Set(guide.topics).size, god.id);
    assert.ok(guide.topics.every((id) => topicIds.includes(id)), god.id);
    assert.ok(guide.versionNote.length > 60 && guide.versionNote.length < 350, god.id);
    assert.ok(guide.sources.length > 0, god.id);
    for (const source of guide.sources) {
      assert.ok(source.title.length > 20, god.id);
      const url = new URL(source.url);
      assert.equal(url.protocol, 'https:', god.id);
      assert.ok(['www.theoi.com', 'penelope.uchicago.edu', 'eprints.whiterose.ac.uk'].includes(url.hostname), god.id);
      assert.ok(!url.username && !url.password, god.id);
    }
  }
  for (const { id } of guideTopics) {
    assert.ok(filterGodsByTopic(sampleGods, id).length > 0, id);
  }
  assert.equal(guideFor('unknown'), null);
  assert.equal(guideFor('__proto__'), null);
});

test('reviewed tags correct missing roles and do not guess from a changed domain field', () => {
  for (const [id, topic] of [
    ['greek-atlas', 'sky'], ['roman-ops', 'nature'], ['greek-tartarus', 'underworld'],
    ['greek-ares', 'war'], ['roman-mars', 'war'], ['greek-heracles', 'war'],
    ['greek-aphrodite', 'love'], ['roman-cupid', 'love'], ['greek-asclepius', 'healing'],
    ['roman-salus', 'healing'], ['greek-clotho', 'fate'], ['greek-eunomia', 'home'],
    ['greek-chaos', 'origins'], ['greek-morpheus', 'dreams'],
  ]) {
    assert.equal(filterGodsByTopic([{ id, domain: 'A shortened heading' }], topic).length, 1, id);
  }
  assert.equal(filterGodsByTopic([{ id: 'greek-plutus', domain: 'Underworld' }], 'underworld').length, 0);
  assert.equal(filterGodsByTopic([{ id: 'greek-thalia-grace', domain: 'Comedy' }], 'arts').length, 0);
  assert.equal(filterGodsByTopic([{ id: 'unknown', domain: 'War' }], 'war').length, 0);
});

test('all figures have a targeted collection path and expanded stories link named figures', () => {
  for (const god of sampleGods) {
    const suggestion = suggestionsFor(god, worlds, stories);
    assert.ok(guideFor(god.id).topics.includes(suggestion.topicId), god.id);
    assert.ok(filterGodsByTopic(sampleGods, suggestion.topicId).some(({ id }) => id === god.id), god.id);
  }
  for (const [id, storyId] of [
    ['greek-ares', 'ares-bronze-jar'], ['roman-mars', 'mars-anna-perenna'],
    ['greek-heracles', 'heracles-alcestis'], ['greek-morpheus', 'morpheus-message'],
    ['greek-asclepius', 'asclepius-healing'],
  ]) {
    const god = sampleGods.find((record) => record.id === id);
    assert.ok(suggestionsFor(god, worlds, stories).stories.some((story) => story.id === storyId), id);
  }
});

test('guide metadata is isolated from caller changes and ambiguous names carry a version note', () => {
  const first = guideFor('greek-zeus');
  first.topics.push('fake');
  first.sources[0].url = 'https://invalid.example/';
  assert.ok(!guideFor('greek-zeus').topics.includes('fake'));
  assert.match(guideFor('greek-zeus').sources[0].url, /theoi.com/);
  assert.match(guideFor('greek-thalia-muse').versionNote, /distinct from Thalia the Grace/);
  assert.match(guideFor('greek-thalia-grace').versionNote, /distinct from the Muse/);
  assert.match(guideFor('greek-chronos').versionNote, /distinct from the Titan Cronus/);
});
