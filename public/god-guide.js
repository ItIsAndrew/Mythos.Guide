// Public reading metadata, reviewed by stable archive ID. These modern topic
// tags are browsing aids, not ancient categories or a complete list of roles.
// Theoi links collect attributed ancient passages; Roman-only reading links
// use ancient texts or the University of Chicago's classical reference library.
export const guideTopics = [
  { id: 'sea', label: 'Sea & water' },
  { id: 'sky', label: 'Sky & stars' },
  { id: 'arts', label: 'Arts & wisdom' },
  { id: 'nature', label: 'Nature & growth' },
  { id: 'underworld', label: 'The underworld' },
  { id: 'war', label: 'War & heroes' },
  { id: 'love', label: 'Love & beauty' },
  { id: 'healing', label: 'Healing & health' },
  { id: 'fate', label: 'Fate, time & justice' },
  { id: 'home', label: 'Home & community' },
  { id: 'origins', label: 'Creation & Titans' },
  { id: 'dreams', label: 'Sleep & dreams' },
];

const greekRows = [
  ['zeus', 'sky home fate', 'Olympios/Zeus.html'],
  ['hera', 'home', 'Olympios/Hera.html'],
  ['poseidon', 'sea', 'Olympios/Poseidon.html'],
  ['demeter', 'nature', 'Olympios/Demeter.html'],
  ['athena', 'arts war', 'Olympios/Athena.html'],
  ['apollo', 'arts healing fate', 'Olympios/Apollon.html'],
  ['artemis', 'nature healing', 'Olympios/Artemis.html'],
  ['ares', 'war', 'Olympios/Ares.html'],
  ['aphrodite', 'love', 'Olympios/Aphrodite.html'],
  ['hephaestus', 'arts', 'Olympios/Hephaistos.html'],
  ['hermes', 'home underworld arts', 'Olympios/Hermes.html'],
  ['hestia', 'home', 'Ouranios/Hestia.html'],
  ['dionysus', 'arts nature', 'Olympios/Dionysos.html'],
  ['hades', 'underworld', 'Khthonios/Haides.html'],
  ['persephone', 'underworld nature', 'Khthonios/Persephone.html'],
  ['hecate', 'underworld home', 'Khthonios/Hekate.html'],
  ['helios', 'sky', 'Titan/Helios.html'],
  ['selene', 'sky', 'Titan/Selene.html'],
  ['eos', 'sky', 'Titan/Eos.html'],
  ['nike', 'war', 'Daimon/Nike.html'],
  ['iris', 'sky', 'Pontios/Iris.html'],
  ['eros', 'love origins', 'Ouranios/Eros.html'],
  ['tyche', 'fate home', 'Daimon/Tykhe.html'],
  ['nemesis', 'fate', 'Daimon/Nemesis.html'],
  ['asclepius', 'healing', 'Ouranios/Asklepios.html'],
  ['hypnos', 'dreams', 'Daimon/Hypnos.html'],
  ['thanatos', 'underworld', 'Daimon/Thanatos.html'],
  ['pan', 'nature arts', 'Georgikos/Pan.html'],
  ['gaia', 'origins nature', 'Protogenos/Gaia.html'],
  ['uranus', 'sky origins', 'Protogenos/Ouranos.html'],
  ['cronus', 'origins nature', 'Titan/TitanKronos.html'],
  ['nyx', 'sky dreams origins', 'Protogenos/Nyx.html'],
  ['aether', 'sky origins', 'Protogenos/Aither.html'],
  ['chaos', 'origins', 'Protogenos/Khaos.html'],
  ['erebus', 'underworld origins', 'Protogenos/Erebos.html'],
  ['hemera', 'sky origins', 'Protogenos/Hemera.html'],
  ['tartarus', 'underworld origins', 'Protogenos/Tartaros.html'],
  ['pontus', 'sea origins', 'Protogenos/Pontos.html'],
  ['thalassa', 'sea origins', 'Protogenos/Thalassa.html'],
  ['ananke', 'fate origins', 'Protogenos/Ananke.html'],
  ['chronos', 'fate origins', 'Protogenos/Khronos.html'],
  ['rhea', 'origins home nature', 'Titan/TitanisRhea.html'],
  ['oceanus', 'sea origins', 'Titan/TitanOkeanos.html'],
  ['tethys', 'sea origins', 'Titan/TitanisTethys.html'],
  ['hyperion', 'sky origins', 'Titan/TitanHyperion.html'],
  ['theia', 'sky origins', 'Titan/TitanisTheia.html'],
  ['coeus', 'origins', 'Titan/TitanKoios.html'],
  ['phoebe', 'fate origins', 'Titan/TitanisPhoibe.html'],
  ['crius', 'origins', 'Titan/TitanKrios.html'],
  ['iapetus', 'origins', 'Titan/TitanIapetos.html'],
  ['themis', 'fate home origins', 'Titan/TitanisThemis.html'],
  ['mnemosyne', 'arts origins', 'Titan/TitanisMnemosyne.html'],
  ['prometheus', 'arts origins', 'Titan/TitanPrometheus.html'],
  ['epimetheus', 'origins', 'Titan/TitanEpimetheus.html'],
  ['atlas', 'sky origins', 'Titan/TitanAtlas.html'],
  ['leto', 'home origins', 'Titan/TitanisLeto.html'],
  ['metis', 'arts origins', 'Titan/TitanisMetis.html'],
  ['asteria', 'sky origins', 'Titan/TitanisAsteria.html'],
  ['calliope', 'arts', 'Ouranios/MousaKalliope.html'],
  ['clio', 'arts', 'Ouranios/MousaKleio.html'],
  ['erato', 'arts love', 'Ouranios/MousaErato.html'],
  ['euterpe', 'arts', 'Ouranios/MousaEuterpe.html'],
  ['melpomene', 'arts', 'Ouranios/MousaMelpomene.html'],
  ['polyhymnia', 'arts', 'Ouranios/MousaPolyhymnia.html'],
  ['terpsichore', 'arts', 'Ouranios/MousaTerpsikhore.html'],
  ['thalia-muse', 'arts', 'Ouranios/MousaThaleia.html'],
  ['urania', 'arts sky', 'Ouranios/MousaOurania.html'],
  ['clotho', 'fate', 'Daimon/Moirai.html'],
  ['lachesis', 'fate', 'Daimon/Moirai.html'],
  ['atropos', 'fate', 'Daimon/Moirai.html'],
  ['hebe', 'home', 'Ouranios/Hebe.html'],
  ['eileithyia', 'healing home', 'Ouranios/Eileithyia.html'],
  ['enyo', 'war', 'Daimon/Enyo.html'],
  ['eris', 'war', 'Daimon/Eris.html'],
  ['deimos', 'war', 'Daimon/Deimos.html'],
  ['phobos', 'war', 'Daimon/Deimos.html'],
  ['harmonia', 'home love', 'Ouranios/Harmonia.html'],
  ['hygieia', 'healing', 'Ouranios/AsklepiasHygeia.html'],
  ['plutus', 'nature home', 'Georgikos/Ploutos.html'],
  ['morpheus', 'dreams', 'Daimon/OneirosMorpheus.html'],
  ['amphitrite', 'sea', 'Pontios/Amphitrite.html'],
  ['triton', 'sea', 'Pontios/Triton.html'],
  ['proteus', 'sea', 'Pontios/Proteus.html'],
  ['nereus', 'sea', 'Pontios/Nereus.html'],
  ['thetis', 'sea home', 'Pontios/NereisThetis.html'],
  ['boreas', 'sky', 'Titan/AnemosBoreas.html'],
  ['zephyrus', 'sky nature', 'Titan/AnemosZephyros.html'],
  ['notus', 'sky', 'Titan/AnemosNotos.html'],
  ['eurus', 'sky', 'Titan/AnemosEuros.html'],
  ['alecto', 'fate underworld', 'Khthonios/Erinyes.html'],
  ['megaera', 'fate underworld', 'Khthonios/Erinyes.html'],
  ['tisiphone', 'fate underworld', 'Khthonios/Erinyes.html'],
  ['aglaia', 'love', 'Ouranios/KharisAglaia.html'],
  ['euphrosyne', 'love home', 'Ouranios/KharisEuphrosyne.html'],
  ['thalia-grace', 'love nature', 'Ouranios/KharisThalia.html'],
  ['eirene', 'home nature', 'Ouranios/HoraEirene.html'],
  ['dike', 'fate home', 'Ouranios/HoraDike.html'],
  ['eunomia', 'home fate', 'Ouranios/HoraEunomia.html'],
  ['heracles', 'war', 'greek-mythology/heracles.html'],
];

const genericGreekNote = 'This short educational summary draws on ancient accounts. Roles, family stories, and images can vary by author, place, and period; the reference collects attributed passages.';
const genericRomanNote = 'Roman worship and stories have their own history. Greek identifications are useful comparisons, not identical traditions; details vary by author, place, and period.';
const guides = new Map(greekRows.map(([id, topicIds, path]) => [`greek-${id}`, {
  topics: topicIds.split(' '),
  sources: [{ title: `Ancient accounts: ${id === 'thalia-muse' ? 'Thalia and the Muses' : id === 'thalia-grace' ? 'Thalia and the Graces' : id.replaceAll('-', ' ').replace(/^./, (letter) => letter.toUpperCase())} — Theoi`, url: `https://www.theoi.com/${path}` }],
  versionNote: genericGreekNote,
}]));

const romanRows = [
  ['jupiter', 'sky home fate', 'zeus'], ['juno', 'home', 'hera'],
  ['neptune', 'sea', 'poseidon'], ['ceres', 'nature', 'demeter'],
  ['minerva', 'arts war', 'athena'], ['apollo', 'arts healing fate', 'apollo'],
  ['diana', 'nature sky healing', 'artemis'], ['mars', 'war home nature', 'ares'],
  ['venus', 'love', 'aphrodite'], ['vulcan', 'arts', 'hephaestus'],
  ['mercury', 'home underworld arts', 'hermes'], ['vesta', 'home', 'hestia'],
  ['bacchus', 'nature arts', 'dionysus'], ['pluto', 'underworld', 'hades'],
  ['proserpina', 'underworld nature', 'persephone'], ['trivia', 'home underworld', 'hecate'],
  ['sol', 'sky', 'helios'], ['luna', 'sky', 'selene'], ['aurora', 'sky', 'eos'],
  ['victoria', 'war', 'nike'], ['cupid', 'love', 'eros'], ['fortuna', 'fate home', 'tyche'],
  ['janus', 'home fate', null], ['saturn', 'nature origins', 'cronus'],
  ['ops', 'nature home', 'rhea'], ['bellona', 'war', 'enyo'],
  ['faunus', 'nature fate', 'pan'], ['tellus', 'nature origins', 'gaia'],
  ['flora', 'nature', null], ['pomona', 'nature', null], ['terminus', 'home', null],
  ['fides', 'home fate', null], ['pax', 'home', 'eirene'],
  ['concordia', 'home', 'harmonia'], ['salus', 'healing home', 'hygieia'],
  ['quirinus', 'home war', null], ['silvanus', 'nature', null],
  ['portunus', 'sea home', null], ['salacia', 'sea', 'amphitrite'],
  ['somnus', 'dreams', 'hypnos'], ['hercules', 'war', 'heracles'],
  ['aesculapius', 'healing', 'asclepius'],
];

const fasti = (book, lines, name) => ({ title: `Ovid, Fasti ${book}.${lines}: ${name}`, url: `https://www.theoi.com/Text/OvidFasti${book}.html` });
const platner = (page, name) => ({ title: `Roman evidence: ${name} — Platner & Ashby, University of Chicago`, url: `https://penelope.uchicago.edu/Thayer/E/Gazetteer/Places/Europe/Italy/Lazio/Roma/Rome/_Texts/PLATOP%2A/${page}.html` });
const romanSources = {
  mars: [fasti(3, '1–26, 167–234', 'Mars and Rome')],
  janus: [fasti(1, '89–288', 'Janus and beginnings')],
  ops: [{ title: 'The goddess Ops in archaic Rome — Daniele Miano, academic research', url: 'https://eprints.whiterose.ac.uk/id/eprint/114534/1/ops%20revised.pdf' }],
  flora: [fasti(5, '183–378', 'Flora and her festival')],
  pomona: [{ title: 'Ovid, Metamorphoses 14.623–771: Pomona and Vertumnus', url: 'https://www.theoi.com/Text/OvidMetamorphoses14.html' }],
  terminus: [fasti(2, '639–684', 'Terminus and boundaries')],
  fides: [platner('Aedes_Fidei', 'Fides and public trust')],
  pax: [fasti(1, '709–724', 'Pax and the altar of Peace')],
  concordia: [fasti(1, '637–650', 'Concordia and her temple')],
  salus: [platner('Aedes_Salutis', 'the cult of Salus')],
  quirinus: [fasti(2, '475–512', 'Quirinus and Romulus')],
  silvanus: [{ title: 'Virgil, Georgics 1.1–23: the country gods and Silvanus', url: 'https://www.theoi.com/Text/VirgilGeorgics1.html' }],
  portunus: [{ title: 'Ancient accounts of Portunus and the identification with Palaemon — Theoi', url: 'https://www.theoi.com/Pontios/Palaimon.html' }],
  hercules: [fasti(1, '543–586', 'Hercules in Rome')],
};
for (const [id, topicIds, greekId] of romanRows) {
  const comparisonSources = greekId ? guides.get(`greek-${greekId}`).sources.map((source) => ({
    ...source, title: `Greek/Roman identification and ancient accounts: ${id.replace(/^./, (letter) => letter.toUpperCase())} — Theoi`,
  })) : [];
  guides.set(`roman-${id}`, { topics: topicIds.split(' '), sources: romanSources[id] || comparisonSources, versionNote: genericRomanNote });
}

guides.get('roman-ops').versionNote = 'Ops is linked to abundance and, in later interpretations, the earth. Her origins and connection with Saturn are debated; the linked research compares the ancient evidence.';
guides.get('greek-morpheus').versionNote = 'Morpheus appears with a Greek name in Ovid’s Roman poem, Metamorphoses 11. This summary follows his dream-message episode; different texts describe dreams and their divine origins in different ways.';

guides.get('greek-chronos').versionNote = 'This entry follows the primordial Time figure in Orphic traditions. Chronos is distinct from the Titan Cronus, although later writers sometimes associated them.';
guides.get('greek-cronus').versionNote = 'Cronus is the Titan father of Zeus in this summary. He is distinct from the primordial Time figure Chronos; later identifications and Roman comparisons vary.';
guides.get('greek-thalia-muse').versionNote = 'This Thalia is the Muse associated with comedy in later tradition. She is distinct from Thalia the Grace; the Muses’ specializations developed over time.';
guides.get('greek-thalia-grace').versionNote = 'This Thalia is one of the Graces in Hesiod’s account. She is distinct from the Muse of comedy; the Graces’ number and names vary in local traditions.';
guides.get('greek-eunomia').versionNote = 'Eunomia represents good order. Lyric poetry connects her with blossoms and the wreath-wearing Horae; her imagery and associations vary across sources.';

// Return fresh data so a caller cannot mutate the reviewed shared metadata.
export function guideFor(id) {
  const guide = guides.get(id);
  return guide ? { topics: [...guide.topics], sources: guide.sources.map((source) => ({ ...source })), versionNote: guide.versionNote } : null;
}
