import assert from 'node:assert/strict';
import { test } from 'node:test';
import { stories } from '../public/learn-content.js';
import { filterStories, storyThemesFor } from '../public/story-discovery.js';

const ids = (records) => records.map(({ id }) => id);

test('story search finds titles, related gods, and beginner-friendly themes', () => {
  assert.deepEqual(ids(filterStories(stories, 'Athena gift')), ['athenas-gift']);
  assert.deepEqual(ids(filterStories(stories, 'Jupiter')), ['an-open-door']);
  assert.deepEqual(ids(filterStories(stories, 'kindness')), ['an-open-door']);
  assert.deepEqual(ids(filterStories(stories, 'craftsmanship')), ['venus-shield']);
  assert.ok(ids(filterStories(stories, 'healing')).includes('asclepius-healing'));
  assert.ok(ids(filterStories(stories, 'dreams')).includes('morpheus-message'));
});

test('story search handles accents, apostrophes, spacing, and literal special characters', () => {
  assert.deepEqual(ids(filterStories(stories, '  ATHÉNA’S   GIFT  ')), ['athenas-gift']);
  assert.deepEqual(ids(filterStories(stories, "Athena's gift")), ['athenas-gift']);
  assert.deepEqual(ids(filterStories(stories, 'ATHENA—GIFT')), ['athenas-gift']);
  assert.deepEqual(filterStories(stories, '<script>missing</script>'), []);
  assert.deepEqual(filterStories(stories, 'unfindablestory'), []);
});

test('tradition and text filters work together and clearing restores the full ordered collection', () => {
  assert.deepEqual(filterStories(stories), stories);
  assert.deepEqual(filterStories(stories, '  ', 'all'), stories);
  assert.deepEqual(filterStories(stories, '', 'Greek'), stories.filter(({ tradition }) => tradition === 'Greek'));
  assert.deepEqual(filterStories(stories, '', 'Roman'), stories.filter(({ tradition }) => tradition === 'Roman'));
  assert.deepEqual(ids(filterStories(stories, 'love', 'Roman')), ['psyches-last-task', 'venus-shield']);
  assert.deepEqual(filterStories(stories, 'Athena gift', 'Roman'), []);
  assert.deepEqual(filterStories([], 'Athena'), []);
});

test('every story has readable themes and filtering does not change source records or theme data', () => {
  for (const story of stories) {
    const before = JSON.stringify(story);
    const themes = storyThemesFor(story);
    assert.equal(themes.length, 2, story.id);
    assert.ok(themes.every((theme) => typeof theme === 'string' && theme.length > 2));
    assert.ok(filterStories(stories, themes[0]).includes(story), story.id);
    themes.push('This must not change the shared theme list');
    assert.equal(storyThemesFor(story).length, 2);
    filterStories(Object.freeze([Object.freeze(story)]), 'help');
    assert.equal(JSON.stringify(story), before);
  }
  assert.deepEqual(storyThemesFor(null), []);
});
