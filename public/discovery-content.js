import { guideFor, guideTopics } from './god-guide.js';

// Reviewed role tags replace guesses from a short domain phrase.
export const topics = [{ id: 'all', label: 'All topics' }, ...guideTopics];

export function filterGodsByTopic(gods, topicId) {
  const records = Array.isArray(gods) ? gods : [];
  if (!guideTopics.some(({ id }) => id === topicId)) return records.slice();
  return records.filter((god) => guideFor(god?.id)?.topics.includes(topicId));
}

export function chooseRandomGod(gods, previousId, random = Math.random) {
  const records = Array.isArray(gods) ? gods.filter(Boolean) : [];
  if (!records.length) return null;
  const alternatives = records.filter((god) => god.id !== previousId);
  const choices = alternatives.length ? alternatives : records;
  const draw = Number(random());
  const fraction = Number.isFinite(draw) ? Math.min(Math.max(draw, 0), 1) : 0;
  return choices[Math.min(Math.floor(fraction * choices.length), choices.length - 1)];
}

// Common identifications, not a claim that Greek and Roman religious traditions
// were identical. Names and short role summaries were checked against:
// https://www.metmuseum.org/zh/-/media/files/learn/for-educators/publications-for-educators/roman.pdf
// https://www.theoi.com/Pantheon.html (including Hestia / Vesta).
export const comparisons = [
  { greek: 'Zeus', roman: 'Jupiter', domain: 'Sky and thunder' },
  { greek: 'Hera', roman: 'Juno', domain: 'Marriage and queenship' },
  { greek: 'Poseidon', roman: 'Neptune', domain: 'The sea' },
  { greek: 'Demeter', roman: 'Ceres', domain: 'Grain and harvest' },
  { greek: 'Athena', roman: 'Minerva', domain: 'Wisdom and crafts' },
  { greek: 'Apollo', roman: 'Apollo', domain: 'Music, healing, and prophecy' },
  { greek: 'Artemis', roman: 'Diana', domain: 'Hunting and wild places' },
  { greek: 'Ares', roman: 'Mars', domain: 'War' },
  { greek: 'Aphrodite', roman: 'Venus', domain: 'Love and beauty' },
  { greek: 'Hephaestus', roman: 'Vulcan', domain: 'Fire and metalworking' },
  { greek: 'Hermes', roman: 'Mercury', domain: 'Messages, travel, and trade' },
  { greek: 'Hestia', roman: 'Vesta', domain: 'The hearth and home' },
];

// Original beginner definitions, checked against museum education material and
// the ancient-text references collected by Theoi:
// https://www.metmuseum.org/essays/greek-gods-and-religious-practices
// https://www.theoi.com/Titan/Titanes.html
// https://www.theoi.com/Nymphe/Nymphai.html
// https://delphi.culture.gr/archaelogical-site/site-history/mythological-versions-of-the-foundation-of-the-oracle/
// https://www.theoi.com/Daimon/Moirai.html
// https://www.theoi.com/Pontios/Nereides.html
export const glossary = [
  { term: 'Myth', definition: 'A traditional story about gods, heroes, or the world. Myths can have many different versions.', example: 'Athena appears in a story about a gift to a city.', figure: 'Athena' },
  { term: 'Deity', definition: 'Another word for a god or goddess.', example: 'Zeus is a Greek deity linked with the sky.', figure: 'Zeus' },
  { term: 'Pantheon', definition: 'The gods and goddesses of a particular tradition, considered together.', example: 'Hera belongs to the Greek pantheon.', figure: 'Hera' },
  { term: 'Olympian', definition: 'A god associated with Mount Olympus, the home of the leading Greek gods in myths.', example: 'Hestia is often counted among the Olympians.', figure: 'Hestia' },
  { term: 'Titan', definition: 'One of an older family of Greek gods. The Titans include Cronus and Rhea; some of their descendants are also called Titans.', example: 'Cronus rules before Zeus in many myths.', figure: 'Cronus' },
  { term: 'Underworld', definition: 'The realm of the dead in Greek and Roman myths. Hades rules it in Greek tradition.', example: 'Persephone is queen of the Greek underworld.', figure: 'Persephone' },
  { term: 'Oracle', definition: 'A message believed to come from a god, or the person or sacred place through which it was given.', example: 'People asked Apollo’s oracle at Delphi for guidance.', figure: 'Apollo' },
  { term: 'Nymph', definition: 'A female divine spirit connected with nature, such as a spring, tree, mountain, or the sea.', example: 'Amphitrite is one of the Nereids, a group of sea nymphs.', figure: 'Amphitrite' },
  { term: 'Hero', definition: 'A remarkable figure in a myth whose adventures and choices matter to the story.', example: 'Heracles is a Greek hero known for difficult adventures.', figure: 'Heracles' },
  { term: 'Muse', definition: 'One of the Greek goddesses associated with music, poetry, and other arts.', example: 'Euterpe is a Muse linked with music.', figure: 'Euterpe' },
  { term: 'Fate', definition: 'A person’s destiny or the course of events; Greek myths sometimes show the Fates as goddesses.', example: 'Clotho, one of the Fates, spins the thread of life.', figure: 'Clotho' },
  { term: 'Prophecy', definition: 'A message or prediction about what may happen in the future.', example: 'Apollo is connected with prophecy and the oracle at Delphi.', figure: 'Apollo' },
  { term: 'Ritual', definition: 'A repeated action used in worship, such as making an offering to a god.', example: 'Hestia often received a place of honor in offerings.', figure: 'Hestia' },
  { term: 'Shrine', definition: 'A place set apart to honor a god or another sacred figure.', example: 'People visited healing sanctuaries associated with Asclepius.', figure: 'Asclepius' },
  { term: 'Hearth', definition: 'The place for a household fire, also a symbol of home and shared life.', example: 'Hestia is the Greek goddess of the hearth.', figure: 'Hestia' },
  { term: 'Personification', definition: 'An idea represented as a person or divine figure.', example: 'Ananke personifies necessity in Greek tradition.', figure: 'Ananke' },
];

function normalize(value) {
  return String(value || '').normalize('NFKD').replace(/\p{M}/gu, '')
    .toLocaleLowerCase('en').replace(/[^\p{L}\p{N}]/gu, '');
}

function godNames(god) {
  const names = [god.name, god.id, ...(Array.isArray(god.aliases) ? god.aliases : []),
    ...(Array.isArray(god.searchNames) ? god.searchNames : [])];
  const normalized = new Set(names.filter(Boolean).map(normalize));

  // Two collection entries are named Thalia. An unqualified name alone cannot
  // establish which one a story means; keep qualified names and IDs instead.
  if (/^greek-thalia-(muse|grace)$/.test(god.id || '')) {
    normalized.delete('thalia');
    normalized.delete('thaleia');
    normalized.add(normalize(`Thalia the ${god.id.endsWith('muse') ? 'Muse' : 'Grace'}`));
  }
  return normalized;
}

function directMatches(records, key, names) {
  return records.filter((record) => Array.isArray(record?.[key])
    && record[key].some((name) => names.has(normalize(name))));
}

function relatedMatches(records, key, names, counterpart) {
  // A story naming Mercury should appear before a story naming Hermes when
  // reading about Mercury. Both can be useful, but they are different links.
  return [...new Set([
    ...directMatches(records, key, names),
    ...directMatches(records, key, counterpart),
  ])];
}

function existingById(records, ids) {
  return ids.map((id) => records.find((record) => record?.id === id)).filter(Boolean);
}

// Always return objects from the supplied content. Direct name matches take
// priority. The fallback offers a related topic, not a claim that this god
// appears in that story or lives in that place.
export function suggestionsFor(god, worlds, stories) {
  if (!god) return { stories: [], worlds: [], topicId: null };
  const worldRecords = Array.isArray(worlds) ? worlds : [];
  const storyRecords = Array.isArray(stories) ? stories : [];
  const names = godNames(god);
  const counterpart = new Set(god.equivalent
    ? [normalize(String(god.equivalent).replace(/\s*\([^)]*\)\s*$/, ''))] : []);
  const directStories = relatedMatches(storyRecords, 'relatedGods', names, counterpart);
  const directWorlds = relatedMatches(worldRecords, 'gods', names, counterpart);
  const topic = guideFor(god.id)?.topics[0] || null;
  const fallbackStoryIds = {
    sea: ['athenas-gift'],
    sky: ['morpheus-message'],
    arts: ['hermes-and-the-lyre'],
    nature: ['persephones-return'],
    underworld: ['persephones-return', 'orpheus-looks-back'],
    war: [god.tradition === 'Roman' ? 'mars-anna-perenna' : 'ares-bronze-jar', 'heracles-alcestis'],
    love: ['venus-shield'],
    healing: ['asclepius-healing', 'heracles-alcestis'],
    fate: ['morpheus-message'],
    home: ['an-open-door'],
    origins: [],
    dreams: ['morpheus-message'],
  };
  const fallbackWorldIds = { sea: ['sea'], sky: ['olympus'], underworld: ['underworld'], healing: ['healing-sanctuary'], home: ['roman-forum'], nature: ['roman-hearth'], fate: ['roman-forum'], origins: ['olympus'] };
  return {
    topicId: topic,
    stories: (directStories.length ? directStories
      : existingById(storyRecords, fallbackStoryIds[topic] || [])).slice(0, 2),
    worlds: (directWorlds.length ? directWorlds
      : existingById(worldRecords, fallbackWorldIds[topic] || [])).slice(0, 1),
  };
}
