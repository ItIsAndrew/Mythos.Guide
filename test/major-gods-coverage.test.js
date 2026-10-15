import assert from 'node:assert/strict';
import { test } from 'node:test';
import { sampleGods } from '../api/_lib/sample-gods.js';

// Defined, finite reference for the student's 75% goal. The Greek list uses
// named individuals from Theoi's major-pantheon overview, including the
// named Furies, Graces, Horae, Fates, and Muses. The Roman list uses the
// twelve Dei Consentes named by Ennius. This is not a count of every deity
// in all ancient local traditions.
// https://www.theoi.com/Pantheon.html
// https://penelope.uchicago.edu/encyclopaedia_romana/romanforum/deorumconsentium.html
const majorGreekIds = [
  'greek-zeus', 'greek-poseidon', 'greek-hera', 'greek-demeter',
  'greek-apollo', 'greek-artemis', 'greek-athena', 'greek-ares',
  'greek-aphrodite', 'greek-hermes', 'greek-hephaestus',
  'greek-dionysus', 'greek-hestia', 'greek-hades', 'greek-persephone',
  'greek-hecate', 'greek-alecto', 'greek-megaera', 'greek-tisiphone',
  'greek-helios', 'greek-gaia', 'greek-rhea', 'greek-themis',
  'greek-leto', 'greek-pan', 'greek-eileithyia', 'greek-eros',
  'greek-amphitrite', 'greek-asclepius',
  'greek-clio', 'greek-euterpe', 'greek-thalia-muse',
  'greek-melpomene', 'greek-terpsichore', 'greek-erato',
  'greek-polyhymnia', 'greek-urania', 'greek-calliope',
  'greek-aglaia', 'greek-euphrosyne', 'greek-thalia-grace',
  'greek-eirene', 'greek-dike', 'greek-eunomia',
  'greek-clotho', 'greek-lachesis', 'greek-atropos', 'greek-heracles',
];
const majorRomanIds = [
  'roman-juno', 'roman-vesta', 'roman-minerva', 'roman-ceres',
  'roman-diana', 'roman-venus', 'roman-mars', 'roman-mercury',
  'roman-jupiter', 'roman-neptune', 'roman-vulcan', 'roman-apollo',
];

test('the archive covers at least 75% of each defined major-pantheon list', () => {
  const archive = new Map(sampleGods.map((record) => [record.id, record]));
  assert.equal(archive.size, sampleGods.length, 'archive IDs must be unique');
  for (const [tradition, referenceIds] of [['Greek', majorGreekIds], ['Roman', majorRomanIds]]) {
    const covered = referenceIds.filter((id) => archive.has(id));
    assert.ok(covered.length / referenceIds.length >= 0.75, `${tradition}: ${covered.length}/${referenceIds.length} covered`);
    for (const id of covered) {
      const record = archive.get(id);
      assert.equal(record.tradition, tradition);
      assert.ok(record.description.length >= 60, `${id} needs a useful description`);
      assert.ok(record.searchNames.length > 0, `${id} must be searchable`);
    }
  }
});
