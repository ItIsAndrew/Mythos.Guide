// Each answer links to an ancient text, classical passages, or a museum object.
// Theoi pages reproduce the named ancient authors; modern summaries are not
// used as a substitute for those passages. Myths vary by author and place.
const reference = (title, path, versionNote = 'This is a familiar ancient association. Stories and divine roles vary across authors and places.') => Object.freeze({
  source: Object.freeze({ title, url: path.startsWith('https://') ? path : `https://www.theoi.com/${path}` }), versionNote,
});
const questionReferences = Object.freeze({
  zeus: reference('Ancient passages about Zeus', 'Olympios/Zeus.html'),
  athena: reference('Ancient evidence and art: Athena', 'Olympios/Athena.html'),
  poseidon: reference('Ancient passages and art: Poseidon', 'Olympios/Poseidon.html'),
  demeter: reference('Homeric hymns and other passages: Demeter', 'Olympios/Demeter.html'),
  hermes: reference('Homeric hymns and other passages: Hermes', 'Olympios/Hermes.html'),
  hades: reference('Ancient passages: Hades', 'Khthonios/Haides.html', 'Hades rules the underworld; Thanatos personifies death. They are distinct figures.'),
  artemis: reference('Homeric hymns and other passages: Artemis', 'Olympios/Artemis.html'),
  apollo: reference('Homeric hymns and other passages: Apollo', 'Olympios/Apollon.html'),
  jupiter: reference('Classical passages about Zeus and Roman Jupiter', 'Olympios/Zeus.html', 'Romans identified Jupiter with Zeus, while maintaining distinct local rites and stories.'),
  minerva: reference('Classical passages about Athena and Roman Minerva', 'Olympios/Athena.html', 'Minerva and Athena were identified with each other; their traditions are not identical.'),
  neptune: reference('Classical passages about Poseidon and Roman Neptune', 'Olympios/Poseidon.html', 'Roman Neptune shares Poseidon’s sea associations, with a distinct history of worship.'),
  vesta: reference('Ovid, Fasti 6: Vesta and the hearth', 'Text/OvidFasti6.html'),
  janus: reference('Ovid, Fasti 1: Janus explains his roles', 'Text/OvidFasti1.html', 'Ovid presents one poetic explanation of Janus’s faces and role at beginnings.'),
  venus: reference('Ovid, Fasti 4: Venus and love', 'Text/OvidFasti4.html'),
  vulcan: reference('Classical passages about Hephaestus and Vulcan', 'Olympios/Hephaistos.html'),
  mercury: reference('Classical passages about Hermes and Mercury', 'Olympios/Hermes.html'),
  hebe: reference('Homer, Iliad 4.1 and other passages: Hebe', 'Ouranios/Hebe.html', 'Hebe serves as cupbearer in Homer; other stories give that role to Ganymede.'),
  eileithyia: reference('Ancient passages: Eileithyia', 'Ouranios/Eileithyia.html', 'Some texts describe one Eileithyia; others speak of several childbirth goddesses.'),
  eris: reference('Hesiod and Homer: Eris', 'Daimon/Eris.html'),
  morpheus: reference('Ovid’s account of the dream spirits', 'Daimon/Oneiroi.html', 'The human-shaped dream spirit here follows Ovid’s Roman poem, not every ancient account of dreams.'),
  harmonia: reference('Hesiod and other passages: Harmonia', 'Ouranios/Harmonia.html'),
  plutus: reference('Hesiod, Theogony 969 and other passages: Plutus', 'Georgikos/Ploutos.html', 'Plutus, who personifies wealth, is distinct from Pluto, a name for the underworld ruler.'),
  nereus: reference('Hesiod and other passages: Nereus', 'Pontios/Nereus.html', 'Nereus is called an Old Man of the Sea; the title can also describe other sea figures.'),
  mnemosyne: reference('Hesiod, Theogony: Mnemosyne and the Muses', 'Titan/TitanisMnemosyne.html'),
  hera: reference('Homeric hymns and other passages: Hera', 'Olympios/Hera.html'),
  aphrodite: reference('Homeric hymns and other passages: Aphrodite', 'Olympios/Aphrodite.html'),
  ares: reference('Homeric hymns and other passages: Ares', 'Olympios/Ares.html', 'Ares is strongly associated with battle; Athena also has important roles in war.'),
  hestia: reference('Homeric hymns: Hestia', 'Ouranios/Hestia.html'),
  diana: reference('The Met: Diana and her hunting attributes', 'https://www.metmuseum.org/art/collection/search/436499'),
  mars: reference('Ovid, Fasti 3: Mars and the Roman calendar', 'Text/OvidFasti3.html', 'Mars has Roman civic and ancestral roles as well as his association with war.'),
  juno: reference('The Met: Juno with her peacock', 'https://www.metmuseum.org/art/collection/search/207645', 'This familiar attribute appears in ancient and later art; it is not Juno’s only symbol.'),
  bacchus: reference('Ovid, Fasti 3: Bacchus and his festival', 'Text/OvidFasti3.html'),
  dionysus: reference('Ancient passages: Dionysus and drama', 'Olympios/Dionysos.html'),
  hephaestus: reference('Homer and other passages: Hephaestus', 'Olympios/Hephaistos.html'),
  persephone: reference('Homeric Hymn to Demeter and other passages', 'Khthonios/Persephone.html', 'The number of seeds and the division of Persephone’s year vary among ancient tellings.'),
  iris: reference('Ancient passages: Iris and the rainbow', 'Pontios/Iris.html'),
  ceres: reference('Ovid, Fasti 4: Ceres and agriculture', 'Text/OvidFasti4.html'),
  aurora: reference('Classical passages: Eos and Roman Aurora', 'Titan/Eos.html'),
  luna: reference('Classical passages: Selene and Roman Luna', 'Titan/Selene.html'),
  cupid: reference('Ovid, Metamorphoses 1: Cupid’s arrows', 'Text/OvidMetamorphoses1.html', 'In this episode Cupid has arrows with different effects; love is not always welcome or mutual.'),
  euterpe: reference('Ancient art: Euterpe with double pipes', 'Ouranios/MousaEuterpe.html', 'The instrument is the aulos, often translated as flute; it is a reed instrument, unlike a modern flute.'),
  calliope: reference('Ancient passages: Calliope and poetry', 'Ouranios/MousaKalliope.html', 'Specific Muse-to-art pairings became more standardized over time.'),
  clotho: reference('Ancient passages: the Fates and spinning', 'Daimon/Moirai.html'),
  atlas: reference('Hesiod, Theogony 517–520: Atlas', 'Titan/TitanAtlas.html', 'Hesiod describes Atlas supporting the sky, not holding the planet Earth.'),
  pomona: reference('Ovid, Metamorphoses 14: Pomona’s orchard', 'Text/OvidMetamorphoses14.html'),
  portunus: reference('Cicero, On the Nature of the Gods 2.26: Portunus', 'Pontios/Palaimon.html', 'The linked collection includes Cicero’s Roman explanation of Portunus and his harbor association.'),
  terminus: reference('Ovid, Fasti 2: the Terminalia', 'Text/OvidFasti2.html'),
  concordia: reference('Ovid, Fasti 6: Concordia settles a dispute', 'Text/OvidFasti6.html'),
});

const question = (id, prompt, choices, answer, explanation, difficulty = 'easy') => Object.freeze({
  id, prompt, choices: Object.freeze(choices), answer, explanation, difficulty, ...questionReferences[id],
});

export const quizDifficulties = Object.freeze(['easy', 'medium', 'hard']);

export const questionBank = Object.freeze([
  question('zeus', 'Which Greek god is associated with thunder?', ['Zeus', 'Hermes', 'Hades', 'Pan'], 'Zeus', 'Zeus rules the Olympian gods and is associated with the sky and thunder.'),
  question('athena', 'Which goddess is linked with wisdom and an owl?', ['Athena', 'Aphrodite', 'Demeter', 'Selene'], 'Athena', 'Athena is associated with wisdom, strategy, and skilled crafts. The owl is one of her symbols.'),
  question('poseidon', 'Who carries a trident in Greek mythology?', ['Poseidon', 'Apollo', 'Ares', 'Hephaestus'], 'Poseidon', 'Poseidon is a Greek god of the sea, earthquakes, and horses; the trident is his familiar symbol.'),
  question('demeter', 'Which Greek goddess cares for grain and the harvest?', ['Demeter', 'Artemis', 'Hera', 'Iris'], 'Demeter', 'Demeter is associated with agriculture and harvests. Her daughter is Persephone.', 'medium'),
  question('hermes', 'Which Greek god is a messenger and protector of travelers?', ['Hermes', 'Cronus', 'Helios', 'Hypnos'], 'Hermes', 'Hermes carries messages and crosses boundaries. His symbols include winged sandals.'),
  question('hades', 'Who rules the Greek underworld?', ['Hades', 'Thanatos', 'Ares', 'Eros'], 'Hades', 'Hades rules the underworld. Thanatos personifies death, so the two have different roles.', 'medium'),
  question('artemis', 'Which Greek goddess is associated with the hunt and wild animals?', ['Artemis', 'Hestia', 'Nike', 'Tyche'], 'Artemis', 'Artemis is associated with hunting, the wilderness, and the protection of the young.', 'medium'),
  question('apollo', 'Which instrument is a familiar symbol of Apollo?', ['Lyre', 'Trident', 'Hammer', 'Rudder'], 'Lyre', 'Apollo is linked with music, prophecy, healing, and archery. The lyre is one of his symbols.'),
  question('jupiter', 'Which Roman god is closely identified with Zeus?', ['Jupiter', 'Neptune', 'Saturn', 'Mercury'], 'Jupiter', 'Jupiter is a leading Roman god of sky, thunder, and public authority.'),
  question('minerva', 'Which Roman goddess is closely identified with Athena?', ['Minerva', 'Venus', 'Juno', 'Ceres'], 'Minerva', 'Minerva is a Roman goddess of wisdom, crafts, and the arts. Roman and Greek traditions overlap but are not identical.', 'medium'),
  question('neptune', 'Which Roman god is associated with the sea?', ['Neptune', 'Vulcan', 'Mars', 'Janus'], 'Neptune', 'Neptune is associated with water, the sea, and horses, and is closely identified with Poseidon.'),
  question('vesta', 'Which Roman goddess is linked with the hearth and its fire?', ['Vesta', 'Luna', 'Aurora', 'Fortuna'], 'Vesta', 'Vesta is the Roman goddess of the hearth. Her fire represents the shared life of home and community.', 'medium'),
  question('janus', 'Which Roman god is linked with beginnings and doorways?', ['Janus', 'Bacchus', 'Cupid', 'Sol'], 'Janus', 'Janus is associated with beginnings and transitions. His two faces look in different directions.', 'medium'),
  question('venus', 'Which Roman goddess is linked with love and beauty?', ['Venus', 'Diana', 'Ops', 'Bellona'], 'Venus', 'Venus is a Roman goddess of love, beauty, and desire, closely identified with Aphrodite.'),
  question('vulcan', 'Which Roman god is associated with fire and metalworking?', ['Vulcan', 'Pluto', 'Faunus', 'Mercury'], 'Vulcan', 'Vulcan is associated with fire and the work of a divine smith. His familiar symbols include a hammer and anvil.', 'medium'),
  question('mercury', 'Which Roman god is linked with trade, travel, and messages?', ['Mercury', 'Saturn', 'Mars', 'Neptune'], 'Mercury', 'Mercury is the swift messenger linked with travel and trade, closely identified with Hermes.', 'medium'),
  question('hebe', 'Which Greek goddess represents youth and serves drink to the gods?', ['Hebe', 'Hestia', 'Themis', 'Rhea'], 'Hebe', 'Hebe is the goddess of youth. Some stories show her serving as cupbearer to the Olympian gods.', 'hard'),
  question('eileithyia', 'Which goddess is linked with childbirth in Greek mythology?', ['Eileithyia', 'Eris', 'Eos', 'Eirene'], 'Eileithyia', 'Eileithyia is associated with childbirth and is commonly named as a daughter of Zeus and Hera.', 'hard'),
  question('eris', 'Which divine figure personifies strife and discord?', ['Eris', 'Iris', 'Nike', 'Tyche'], 'Eris', 'Eris gives strife a divine form and appears in stories of quarrels among gods and mortals.', 'hard'),
  question('morpheus', 'Which dream spirit takes human form in the dreams of kings?', ['Morpheus', 'Hypnos', 'Thanatos', 'Helios'], 'Morpheus', 'In Ovid’s account, Morpheus is one of the dream spirits and appears in human guise.', 'hard'),
  question('harmonia', 'Which goddess is associated with harmony and concord?', ['Harmonia', 'Nemesis', 'Enyo', 'Ananke'], 'Harmonia', 'Harmonia gives harmony a divine form; ancient accounts connect her with Ares and Aphrodite.', 'hard'),
  question('plutus', 'Which Greek god personifies wealth?', ['Plutus', 'Pontus', 'Proteus', 'Pan'], 'Plutus', 'Plutus personifies wealth and appears in stories about how prosperity reaches people.', 'hard'),
  question('nereus', 'Which sea god is sometimes called the Old Man of the Sea?', ['Nereus', 'Triton', 'Oceanus', 'Poseidon'], 'Nereus', 'Nereus is an early sea god and father of the Nereids, a group of sea nymphs.', 'hard'),
  question('mnemosyne', 'Which Titaness personifies memory and is mother of the Muses?', ['Mnemosyne', 'Metis', 'Theia', 'Phoebe'], 'Mnemosyne', 'Mnemosyne personifies memory and is named as the mother of the nine Muses.', 'hard'),

  // More familiar Greek figures: The Met, Greek Gods and Religious Practices;
  // Homeric Hymn 5.18–32 for Hestia (classical quotations collected by Theoi).
  // https://www.metmuseum.org/essays/greek-gods-and-religious-practices
  // https://www.theoi.com/Ouranios/Hestia.html
  question('hera', 'Which Greek goddess is queen of the Olympian gods?', ['Hera', 'Demeter', 'Hestia', 'Artemis'], 'Hera', 'Hera is queen of the Olympian gods and is closely linked with marriage.'),
  question('aphrodite', 'Which Greek goddess is associated with love and beauty?', ['Aphrodite', 'Athena', 'Hera', 'Demeter'], 'Aphrodite', 'Aphrodite is the Greek goddess of love and beauty. Venus is her familiar Roman counterpart.'),
  question('ares', 'Which Greek god is especially associated with war and battle?', ['Ares', 'Apollo', 'Hermes', 'Dionysus'], 'Ares', 'Ares is a Greek god of war, especially the violence and fighting of battle.'),
  question('hestia', 'Which Greek goddess is linked with the hearth at the center of a home?', ['Hestia', 'Artemis', 'Aphrodite', 'Iris'], 'Hestia', 'Hestia is the Greek goddess of the hearth. Her sacred fire belongs to homes and communities.'),

  // Roman figures: museum objects identify Diana and Juno's attributes;
  // Ovid, Fasti 3.171–172 and 3.713–790 describes Mars and Bacchus.
  // https://www.metmuseum.org/art/collection/search/436499
  // https://www.metmuseum.org/art/collection/search/207645
  // https://www.theoi.com/Text/OvidFasti3.html
  question('diana', 'Which Roman goddess is known for hunting with a bow?', ['Diana', 'Ceres', 'Juno', 'Vesta'], 'Diana', 'Diana is a Roman goddess of the hunt. Artists often show her carrying a bow and arrows.'),
  question('mars', 'Which Roman god is especially associated with war?', ['Mars', 'Mercury', 'Bacchus', 'Neptune'], 'Mars', 'Mars is a Roman god of war. Roman tradition also connects him with the protection of the community.'),
  question('juno', 'Which bird is a familiar symbol of the Roman goddess Juno?', ['Peacock', 'Owl', 'Eagle', 'Dove'], 'Peacock', 'The peacock is a familiar symbol of Juno, the Roman goddess of marriage and wife of Jupiter.'),
  question('bacchus', 'Which Roman god is closely linked with wine and the grapevine?', ['Bacchus', 'Vulcan', 'Saturn', 'Janus'], 'Bacchus', 'Bacchus is associated with wine and the grapevine. Roman writers closely identify him with Dionysus.'),

  // Greek roles and stories: The Met overview; Homeric Hymn to Demeter;
  // Ovid, Metamorphoses 11.585–632 for Iris (classical quotations on Theoi).
  // https://www.metmuseum.org/essays/greek-gods-and-religious-practices
  // https://www.theoi.com/Khthonios/Persephone.html
  // https://www.theoi.com/Pontios/Iris.html
  question('dionysus', 'Which Greek god is closely connected with theater festivals?', ['Dionysus', 'Ares', 'Poseidon', 'Hephaestus'], 'Dionysus', 'Dionysus is linked with wine and theater. Greek festivals in his honor included dramatic performances.', 'medium'),
  question('hephaestus', 'Which Greek god is the divine metalworker and smith?', ['Hephaestus', 'Hermes', 'Hades', 'Helios'], 'Hephaestus', 'Hephaestus is the Greek god of metalworking. Myths describe him making remarkable objects for the gods.', 'medium'),
  question('persephone', 'Which fruit does Persephone eat in the underworld story?', ['Pomegranate', 'Apple', 'Fig', 'Grape'], 'Pomegranate', 'Persephone eats pomegranate seeds in the underworld. This binds her to spend part of each year there.', 'medium'),
  question('iris', 'Which Greek messenger goddess is associated with the rainbow?', ['Iris', 'Nike', 'Hebe', 'Selene'], 'Iris', 'Iris is a divine messenger associated with the rainbow. Ancient poems describe her colorful path across the sky.', 'medium'),

  // Roman roles: Ovid, Fasti 4.393–620; Metamorphoses 1.452–473;
  // Ovid and Virgil quotations for Aurora and Luna collected by Theoi.
  // https://www.theoi.com/Text/OvidFasti4.html
  // https://www.theoi.com/Text/OvidMetamorphoses1.html
  // https://www.theoi.com/Titan/Eos.html
  // https://www.theoi.com/Titan/Selene.html
  question('ceres', 'Which Roman goddess is especially linked with grain and farming?', ['Ceres', 'Juno', 'Venus', 'Diana'], 'Ceres', 'Ceres is associated with grain and agriculture. Ovid describes her helping people grow crops for food.', 'medium'),
  question('aurora', 'Which Roman goddess personifies the dawn?', ['Aurora', 'Luna', 'Nox', 'Fortuna'], 'Aurora', 'Aurora personifies the dawn. Roman poets describe her bringing the first light and driving away the night.', 'medium'),
  question('luna', 'What does the Roman goddess Luna personify?', ['The Moon', 'The dawn', 'The sea', 'The harvest'], 'The Moon', 'Luna personifies the Moon. Roman poets describe her traveling across the night sky in a chariot.', 'medium'),
  question('cupid', 'Which Roman god uses arrows that can inspire love?', ['Cupid', 'Mars', 'Mercury', 'Vulcan'], 'Cupid', 'Cupid is a Roman god of love. In Ovid’s stories, his arrows can change the feelings of gods and mortals.', 'medium'),

  // Muses, Fates and Titans: ancient art and classical texts collected by Theoi.
  // Atlas bears the sky in Hesiod, Theogony 517–520, rather than the Earth.
  // https://www.theoi.com/Ouranios/MousaEuterpe.html
  // https://www.theoi.com/Ouranios/MousaKalliope.html
  // https://www.theoi.com/Daimon/Moirai.html
  // https://www.theoi.com/Titan/TitanAtlas.html
  question('euterpe', 'Which Muse is often shown with a double flute?', ['Euterpe', 'Clio', 'Urania', 'Thalia'], 'Euterpe', 'Euterpe is one of the nine Muses. Her familiar double flute, also called double pipes, connects her with music.', 'hard'),
  question('calliope', 'Which Muse is traditionally associated with epic poetry?', ['Calliope', 'Terpsichore', 'Melpomene', 'Erato'], 'Calliope', 'Calliope is traditionally the Muse of epic poetry, the long poems that tell stories of heroes and their deeds.', 'hard'),
  question('clotho', 'Which of the Greek Fates is known as the Spinner?', ['Clotho', 'Lachesis', 'Atropos', 'Nemesis'], 'Clotho', 'Clotho is the Spinner among the three Fates. She spins the thread that represents a person’s life.', 'hard'),
  question('atlas', 'In Hesiod’s account, what does the Titan Atlas hold up?', ['The sky', 'The sea', 'The underworld', 'Mount Olympus'], 'The sky', 'In Hesiod’s account, Atlas supports the sky with his head and hands. This is the burden placed on him.', 'hard'),

  // Roman figures: Ovid, Metamorphoses 14.623–636; Fasti 2.639–684 and 6.89–96;
  // Cicero, De Natura Deorum 2.26, identifies Portunus as the harbor god.
  // https://www.theoi.com/Text/OvidMetamorphoses14.html
  // https://www.theoi.com/Text/OvidFasti2.html
  // https://www.theoi.com/Text/OvidFasti6.html
  // https://www.theoi.com/Pontios/Palaimon.html
  question('pomona', 'Which Roman goddess is especially linked with fruit trees and orchards?', ['Pomona', 'Flora', 'Vesta', 'Bellona'], 'Pomona', 'Pomona is associated with fruit trees and orchards. Ovid describes her skill in caring for fruitful gardens.', 'hard'),
  question('portunus', 'Which Roman god is especially associated with harbors?', ['Portunus', 'Terminus', 'Vulcan', 'Janus'], 'Portunus', 'Portunus is a Roman god of harbors. Cicero connects his name with the Latin word for a harbor.', 'hard'),
  question('terminus', 'Which Roman god protects the boundaries marked between pieces of land?', ['Terminus', 'Faunus', 'Bacchus', 'Cupid'], 'Terminus', 'Terminus guards boundaries. Romans honored him at markers separating neighboring fields and properties.', 'hard'),
  question('concordia', 'Which Roman goddess represents agreement and harmony?', ['Concordia', 'Discordia', 'Bellona', 'Fortuna'], 'Concordia', 'Concordia represents agreement and harmony. Ovid shows her arriving to settle a disagreement between goddesses.', 'hard'),
]);

function shuffled(items, random) {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const target = Math.floor(random() * (index + 1));
    [result[index], result[target]] = [result[target], result[index]];
  }
  return result;
}

// The session owns scoring and progression; it can be tested without a browser.
export function createQuizSession({ questions = questionBank, roundSize = 5, random = Math.random, difficulty = 'easy' } = {}) {
  if (!Number.isInteger(roundSize) || roundSize < 1 || roundSize > questions.length) {
    throw new RangeError('Choose a round size within the question bank.');
  }
  let round = [];
  let status = 'ready';
  let index = 0;
  let score = 0;
  let selectedIndex = null;
  let selectedDifficulty = difficulty;
  let mode = 'round';
  let answers = [];

  function poolFor(value) {
    if (!quizDifficulties.includes(value)) throw new RangeError('Choose easy, medium, or hard.');
    const pool = questions.filter((item) => item.difficulty === value);
    if (pool.length < roundSize) throw new RangeError('Not enough questions for this difficulty.');
    return pool;
  }

  poolFor(selectedDifficulty);

  const copyQuestion = (item) => ({ ...item, choices: [...item.choices], source: item.source ? { ...item.source } : undefined });
  const getState = () => ({
    status, index, score, total: round.length || roundSize, selectedIndex, difficulty: selectedDifficulty, mode,
    currentQuestion: round[index] ? copyQuestion(round[index]) : null,
    answers: answers.map((item) => ({ ...item, question: copyQuestion(item.question) })),
  });

  function startRound(items, nextMode, size = items.length) {
    round = shuffled(items, random).slice(0, size).map((item) => ({
      ...item, choices: shuffled(item.choices, random),
    }));
    mode = nextMode;
    status = 'question';
    index = 0;
    score = 0;
    selectedIndex = null;
    answers = [];
    return getState();
  }

  function start() {
    return startRound(poolFor(selectedDifficulty), 'round', roundSize);
  }

  function practiceMissed() {
    if (status !== 'complete') return getState();
    const missed = answers.filter((item) => !item.correct).map((item) => item.question);
    return missed.length ? startRound(missed, 'practice') : getState();
  }

  function selectDifficulty(value) {
    if (status === 'question') return getState();
    poolFor(value);
    selectedDifficulty = value;
    status = 'ready';
    round = [];
    index = 0;
    score = 0;
    selectedIndex = null;
    mode = 'round';
    answers = [];
    return getState();
  }

  function quitRound() {
    status = 'ready';
    round = [];
    index = 0;
    score = 0;
    selectedIndex = null;
    mode = 'round';
    answers = [];
    return getState();
  }

  function answer(choiceIndex) {
    const current = round[index];
    if (status !== 'question' || selectedIndex !== null || !Number.isInteger(choiceIndex)
      || choiceIndex < 0 || choiceIndex >= current.choices.length) return getState();
    selectedIndex = choiceIndex;
    const selectedAnswer = current.choices[choiceIndex];
    const correct = selectedAnswer === current.answer;
    answers.push({ question: current, selectedAnswer, correct });
    if (correct) score += 1;
    return getState();
  }

  function next() {
    if (status !== 'question' || selectedIndex === null) return getState();
    if (index + 1 === round.length) {
      status = 'complete';
    } else {
      index += 1;
      selectedIndex = null;
    }
    return getState();
  }

  return { getState, start, answer, next, restart: start, selectDifficulty, quitRound, practiceMissed };
}

let mountNumber = 0;

export function mountQuiz(root) {
  if (!root) return null;
  const session = createQuizSession();
  const doc = root.ownerDocument;
  const headingId = `quiz-heading-${++mountNumber}`;
  let confirmQuit = false;

  function element(tag, className, text) {
    const node = doc.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function button(label, action, className = 'quiz-button') {
    const node = element('button', className, label);
    node.type = 'button';
    node.addEventListener('click', action);
    return node;
  }

  function sourceFor(item) {
    const source = element('a', 'quiz-source', `Read the source: ${item.source.title}`);
    source.href = item.source.url;
    source.target = '_blank';
    source.rel = 'noopener noreferrer';
    return source;
  }

  function render(focusTarget = null) {
    const state = session.getState();
    const panel = element('div', 'quiz-panel');
    panel.setAttribute('aria-labelledby', headingId);

    if (state.status === 'ready') {
      panel.append(element('p', 'quiz-eyebrow', 'A little challenge'));
      const title = element('h3', 'quiz-heading', 'How well do you know the gods?');
      title.id = headingId;
      panel.append(title, element('p', 'quiz-description', 'Choose a difficulty, then answer five questions. Each answer has an explanation, and there is no timer.'));
      const difficultyChoices = element('fieldset', 'quiz-difficulty');
      difficultyChoices.append(element('legend', '', 'Choose difficulty'));
      for (const [value, label, hint] of [
        ['easy', 'Easy', 'Familiar gods'],
        ['medium', 'Medium', 'More names and symbols'],
        ['hard', 'Hard', 'Lesser-known figures'],
      ]) {
        const option = element('label', 'quiz-difficulty-option');
        const input = element('input');
        input.type = 'radio';
        input.name = `quiz-difficulty-${mountNumber}`;
        input.value = value;
        input.checked = state.difficulty === value;
        input.addEventListener('change', () => session.selectDifficulty(value));
        option.append(input, element('span', 'quiz-difficulty-name', label), element('span', 'quiz-difficulty-hint', hint));
        difficultyChoices.append(option);
      }
      panel.append(difficultyChoices);
      panel.append(button('Start quiz', () => { confirmQuit = false; session.start(); render('heading'); }));
      panel.append(element('p', 'quiz-small-note', 'Play just for fun. Your answers stay in this page.'));
    } else if (state.status === 'complete') {
      panel.append(element('p', 'quiz-eyebrow', `${state.difficulty} ${state.mode === 'practice' ? 'practice' : 'round'} complete`));
      const title = element('h3', 'quiz-heading', `You scored ${state.score} out of ${state.total}`);
      title.id = headingId;
      title.tabIndex = -1;
      const missed = state.answers.filter((item) => !item.correct);
      const message = missed.length === 0
        ? state.mode === 'practice' ? 'You got every practice answer right. Try a fresh five-question round when you’re ready.' : 'You got every answer right. Try another mix of Greek and Roman questions.'
        : 'See what you missed below, then practice those questions again. There is no timer.';
      panel.append(title, element('p', 'quiz-description', message));
      const actions = element('div', 'quiz-result-actions');
      if (missed.length) {
        actions.append(button('Practice missed answers', () => { confirmQuit = false; session.practiceMissed(); render('heading'); }));
      }
      actions.append(button('Play again', () => { confirmQuit = false; session.restart(); render('heading'); }, missed.length ? 'quiz-change-button' : 'quiz-button'));
      actions.append(button('Change difficulty', () => { session.selectDifficulty(state.difficulty); render('difficulty'); }, 'quiz-change-button'));
      const wordGuide = element('a', 'quiz-change-button', 'Practice mythology words');
      wordGuide.href = '#basics';
      actions.append(wordGuide);
      panel.append(actions);
      if (missed.length) {
        const review = element('section', 'quiz-review');
        const reviewTitle = element('h4', 'quiz-review-heading', `Review ${missed.length} missed ${missed.length === 1 ? 'answer' : 'answers'}`);
        reviewTitle.id = `${headingId}-review`;
        review.setAttribute('aria-labelledby', reviewTitle.id);
        review.append(reviewTitle);
        for (const item of missed) {
          const card = element('article', 'quiz-review-card');
          card.append(element('h5', 'quiz-review-question', item.question.prompt));
          card.append(element('p', 'quiz-review-choice', `Your answer: ${item.selectedAnswer}`));
          card.append(element('p', 'quiz-review-correct', `Correct answer: ${item.question.answer}`));
          card.append(element('p', 'quiz-explanation', item.question.explanation));
          card.append(sourceFor(item.question), element('p', 'quiz-version-note', item.question.versionNote));
          review.append(card);
        }
        panel.append(review);
      }
      const correctAnswers = state.answers.filter((item) => item.correct);
      if (correctAnswers.length) {
        const review = element('details', 'quiz-correct-review');
        review.append(element('summary', '', `Review ${correctAnswers.length} correct ${correctAnswers.length === 1 ? 'answer' : 'answers'}`));
        for (const item of correctAnswers) {
          const card = element('article', 'quiz-correct-card');
          card.append(element('h5', 'quiz-review-question', item.question.prompt));
          card.append(element('p', 'quiz-review-correct', `Your answer: ${item.question.answer}`));
          card.append(element('p', 'quiz-explanation', item.question.explanation));
          card.append(sourceFor(item.question), element('p', 'quiz-version-note', item.question.versionNote));
          review.append(card);
        }
        panel.append(review);
      }
    } else {
      const current = state.currentQuestion;
      const answered = state.selectedIndex !== null;
      const progress = element('div', 'quiz-progress');
      progress.append(element('p', 'quiz-eyebrow', `${state.difficulty} · ${state.mode === 'practice' ? 'Practice question' : 'Question'} ${state.index + 1} of ${state.total}`));
      progress.append(element('p', 'quiz-score', `Score: ${state.score} / ${state.total}`));
      panel.append(progress);
      const meter = element('progress', 'quiz-meter');
      meter.max = state.total;
      meter.value = state.index + (answered ? 1 : 0);
      meter.setAttribute('aria-label', 'Questions answered');
      panel.append(meter);
      const title = element('h3', 'quiz-heading', current.prompt);
      title.id = headingId;
      title.tabIndex = -1;
      panel.append(title);
      const choices = element('div', 'quiz-choices');
      choices.setAttribute('role', 'group');
      choices.setAttribute('aria-labelledby', headingId);
      current.choices.forEach((choice, choiceIndex) => {
        const option = button('', () => { confirmQuit = false; session.answer(choiceIndex); render('feedback'); }, 'quiz-choice');
        option.append(element('span', 'quiz-choice-letter', String.fromCharCode(65 + choiceIndex)));
        option.append(element('span', 'quiz-choice-name', choice));
        if (answered) {
          option.disabled = true;
          if (choice === current.answer) {
            option.classList.add('quiz-correct');
            option.append(element('span', 'quiz-choice-label', choiceIndex === state.selectedIndex ? 'Your answer · Correct' : 'Correct answer'));
          } else if (choiceIndex === state.selectedIndex) {
            option.classList.add('quiz-incorrect');
            option.append(element('span', 'quiz-choice-label', 'Your answer · Incorrect'));
          }
        }
        choices.append(option);
      });
      panel.append(choices);
      const feedback = element('div', 'quiz-feedback');
      feedback.setAttribute('aria-live', 'polite');
      feedback.setAttribute('aria-atomic', 'true');
      if (answered) {
        const correct = current.choices[state.selectedIndex] === current.answer;
        feedback.classList.add(correct ? 'quiz-feedback-correct' : 'quiz-feedback-incorrect');
        feedback.tabIndex = -1;
        feedback.append(element('p', 'quiz-feedback-title', correct ? 'Correct!' : `The correct answer is ${current.answer}.`));
        feedback.append(element('p', 'quiz-explanation', current.explanation));
        feedback.append(sourceFor(current), element('p', 'quiz-version-note', current.versionNote));
      }
      panel.append(feedback);
      if (answered) {
        panel.append(button(state.index + 1 === state.total ? 'See my score' : 'Next question', () => {
          confirmQuit = false; session.next(); render('heading');
        }));
      } else {
        panel.append(element('p', 'quiz-small-note', 'Choose one answer. You can use Tab and Enter to play.'));
      }
      const change = button('Change difficulty', () => { confirmQuit = true; render('quit'); }, 'quiz-change-button');
      change.setAttribute('aria-expanded', String(confirmQuit));
      panel.append(change);
      if (confirmQuit) {
        const confirmation = element('div', 'quiz-quit-confirmation');
        confirmation.setAttribute('role', 'group');
        confirmation.setAttribute('aria-label', 'End this round?');
        const title = element('p', 'quiz-quit-title', 'End this round to choose a difficulty?');
        title.tabIndex = -1;
        confirmation.append(title, element('p', 'quiz-small-note', 'Your current score will reset. You can also keep playing.'));
        confirmation.append(button('Keep playing', () => { confirmQuit = false; render(answered ? 'feedback' : 'heading'); }));
        confirmation.append(button('End round', () => { confirmQuit = false; session.quitRound(); render('difficulty'); }, 'quiz-change-button'));
        panel.append(confirmation);
      }
    }

    root.replaceChildren(panel);
    const target = {
      heading: '.quiz-heading', feedback: '.quiz-feedback',
      difficulty: '.quiz-difficulty input:checked', quit: '.quiz-quit-title',
    }[focusTarget];
    const focusNode = target ? panel.querySelector(target) : null;
    if (focusNode) {
      focusNode.focus({ preventScroll: true });
      // Replacing a tall question leaves a phone at the old scroll position.
      // Focus alone deliberately avoids scrolling, so make the new content
      // visible explicitly. The header offset is provided by scroll-margin.
      focusNode.scrollIntoView({ block: 'start', behavior: 'instant' });
    }
  }

  render();
  return session;
}
