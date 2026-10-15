// Selected relationships from cited ancient-source summaries. This is a small
// educational sample: kinship, especially for early gods, varies by account.
const source = (path) => `https://www.theoi.com/${path}`;
const facts = {
  'greek-zeus': {
    parents: 'Cronus and Rhea', partner: 'Hera is his wife; other myths name several consorts.',
    children: 'Ares, Hebe, Athena, Apollo, Artemis, Hermes, and many others.',
    note: 'Athena is born from Zeus’s head in a famous version of her story.',
    source: source('Olympios/Zeus.html'),
  },
  'greek-hera': {
    parents: 'Cronus and Rhea', partner: 'Zeus',
    children: 'Ares, Hebe, and Eileithyia. Accounts differ about Hephaestus’s father.',
    source: source('Olympios/Hera.html'),
  },
  'greek-poseidon': {
    parents: 'Cronus and Rhea', partner: 'Amphitrite',
    children: 'Triton is one of their children; Poseidon has many others in different stories.',
    source: source('Olympios/Poseidon.html'),
  },
  'greek-demeter': {
    parents: 'Cronus and Rhea', children: 'Persephone, with Zeus.',
    note: 'Her search for Persephone is one of the best-known Greek family stories.',
    source: source('Olympios/Demeter.html'),
  },
  'greek-athena': {
    parents: 'Zeus and Metis in Hesiod’s account.',
    note: 'Zeus swallows Metis; Athena later emerges from his head. She is usually described as an unmarried goddess.',
    source: source('Olympios/Athena.html'),
  },
  'greek-apollo': {
    parents: 'Zeus and Leto', sibling: 'Artemis is his twin sister.',
    children: 'Asclepius, the healer, is one of his sons.',
    source: source('Olympios/ApollonFamily.html'),
  },
  'greek-artemis': {
    parents: 'Zeus and Leto', sibling: 'Apollo is her twin brother.',
    note: 'She is usually portrayed as an unmarried goddess without children.',
    source: source('Olympios/Artemis.html'),
  },
  'greek-ares': {
    parents: 'Zeus and Hera', partner: 'Aphrodite is his best-known partner.',
    children: 'Phobos, Deimos, and Harmonia, with Aphrodite.',
    source: source('Olympios/Ares.html'),
  },
  'greek-aphrodite': {
    parents: 'One tradition says Zeus and Dione; another has her rise from sea foam.',
    partner: 'Hephaestus is her husband in the Odyssey; Ares is another partner.',
    children: 'Aeneas, Harmonia, Phobos, and Deimos; some later accounts also name Eros.',
    source: source('Olympios/Aphrodite.html'),
  },
  'greek-hephaestus': {
    parents: 'Hera; some accounts also name Zeus as his father.',
    partner: 'Aphrodite in the Odyssey; another tradition names the Grace Aglaea.',
    source: source('Olympios/Hephaistos.html'),
  },
  'greek-hermes': {
    parents: 'Zeus and Maia', children: 'Pan is his son in one familiar tradition.',
    source: source('Olympios/Hermes.html'),
  },
  'greek-hestia': {
    parents: 'Cronus and Rhea', sibling: 'Zeus, Hera, Poseidon, Hades, and Demeter.',
    note: 'She is usually portrayed as unmarried, with no children.',
    source: source('Ouranios/Hestia.html'),
  },
  'greek-dionysus': {
    parents: 'Zeus and the mortal Semele', partner: 'Ariadne',
    note: 'He is called “twice-born” because Zeus carries him to term after Semele dies.',
    source: source('Olympios/Dionysos.html'),
  },
  'greek-hades': {
    parents: 'Cronus and Rhea', partner: 'Persephone',
    sibling: 'Zeus and Poseidon are among his siblings.',
    note: 'Ancient accounts do not give Hades one settled list of children.',
    source: source('Khthonios/Haides.html'),
  },
  'greek-persephone': {
    parents: 'Zeus and Demeter', partner: 'Hades',
    note: 'Her return to her mother is central to the story of Demeter’s search.',
    source: source('Khthonios/Persephone.html'),
  },
  'greek-asclepius': {
    parents: 'Apollo and Coronis in a common account.', partner: 'Epione',
    children: 'Hygieia, Panacea, Machaon, and Podalirius are among those named.',
    source: source('Ouranios/Asklepios.html'),
  },
  'greek-cronus': {
    parents: 'Gaia and Uranus', partner: 'Rhea',
    children: 'Zeus, Hera, Poseidon, Hades, Demeter, and Hestia.',
    note: 'A prophecy that one of his children would overthrow him drives his best-known myth.',
    source: source('Titan/TitanKronos.html'),
  },
  'greek-rhea': {
    parents: 'Gaia and Uranus', partner: 'Cronus',
    children: 'Zeus, Hera, Poseidon, Hades, Demeter, and Hestia.',
    note: 'She hides the newborn Zeus from Cronus.',
    source: source('Titan/TitanisRhea.html'),
  },
  'greek-amphitrite': {
    parents: 'Nereus and Doris in Hesiod; other accounts give Oceanus and Tethys.',
    partner: 'Poseidon', children: 'Triton is their best-known son.',
    source: source('Pontios/Amphitrite.html'),
  },
  'greek-triton': {
    parents: 'Poseidon and Amphitrite',
    note: 'He is often pictured as a sea god with a fish tail.',
    source: source('Pontios/Triton.html'),
  },
  'roman-mars': {
    children: 'Romulus and Remus in Rome’s foundation story.',
    note: 'Romans gave Mars a larger place in their origin stories than Ares has in most Greek accounts.',
    source: 'https://www.perseus.tufts.edu/hopper/text?doc=Perseus%3Atext%3A1999.02.0151%3Abook%3D1s',
  },
  'roman-venus': {
    children: 'Aeneas, whose descendants feature in Roman foundation stories.',
    note: 'Venus shares many myths with the Greek Aphrodite, but Roman stories give Aeneas special weight.',
    source: source('Olympios/AphroditeFavour.html'),
  },
  'roman-ceres': {
    children: 'Proserpina in the Roman version of the mother-and-daughter story.',
    note: 'This story parallels the Greek account of Demeter and Persephone.',
    source: 'https://en.wikisource.org/wiki/1911_Encyclop%C3%A6dia_Britannica/Ceres',
  },
};

for (const id of ['calliope', 'clio', 'erato', 'euterpe', 'melpomene', 'polyhymnia', 'terpsichore', 'thalia-muse', 'urania']) {
  facts[`greek-${id}`] = {
    parents: 'Zeus and Mnemosyne', sibling: 'The other eight Muses.',
    note: 'The nine Muses are associated with song, learning, and the arts.',
    source: source('Ouranios/Mousai.html'),
  };
}

export function familyFactsFor(id) {
  return Object.hasOwn(facts, id) ? facts[id] : null;
}
