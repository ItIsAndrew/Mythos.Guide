const question = (id, prompt, choices, answer, explanation) => Object.freeze({
  id, prompt, choices: Object.freeze(choices), answer, explanation,
});

export const questionBank = Object.freeze([
  question('zeus', 'Which Greek god is associated with thunder?', ['Zeus', 'Hermes', 'Hades', 'Pan'], 'Zeus', 'Zeus rules the Olympian gods and is associated with the sky and thunder.'),
  question('athena', 'Which goddess is linked with wisdom and an owl?', ['Athena', 'Aphrodite', 'Demeter', 'Selene'], 'Athena', 'Athena is associated with wisdom, strategy, and skilled crafts. The owl is one of her symbols.'),
  question('poseidon', 'Who carries a trident in Greek mythology?', ['Poseidon', 'Apollo', 'Ares', 'Hephaestus'], 'Poseidon', 'Poseidon is a Greek god of the sea, earthquakes, and horses; the trident is his familiar symbol.'),
  question('demeter', 'Which Greek goddess cares for grain and the harvest?', ['Demeter', 'Artemis', 'Hera', 'Iris'], 'Demeter', 'Demeter is associated with agriculture and harvests. Her daughter is Persephone.'),
  question('hermes', 'Which Greek god is a messenger and protector of travelers?', ['Hermes', 'Cronus', 'Helios', 'Hypnos'], 'Hermes', 'Hermes carries messages and crosses boundaries. His symbols include winged sandals.'),
  question('hades', 'Who rules the Greek underworld?', ['Hades', 'Thanatos', 'Ares', 'Eros'], 'Hades', 'Hades rules the underworld. Thanatos personifies death, so the two have different roles.'),
  question('artemis', 'Which Greek goddess is associated with the hunt and wild animals?', ['Artemis', 'Hestia', 'Nike', 'Tyche'], 'Artemis', 'Artemis is associated with hunting, the wilderness, and the protection of the young.'),
  question('apollo', 'Which instrument is a familiar symbol of Apollo?', ['Lyre', 'Trident', 'Hammer', 'Rudder'], 'Lyre', 'Apollo is linked with music, prophecy, healing, and archery. The lyre is one of his symbols.'),
  question('jupiter', 'Which Roman god is closely identified with Zeus?', ['Jupiter', 'Neptune', 'Saturn', 'Mercury'], 'Jupiter', 'Jupiter is a leading Roman god of sky, thunder, and public authority.'),
  question('minerva', 'Which Roman goddess is closely identified with Athena?', ['Minerva', 'Venus', 'Juno', 'Ceres'], 'Minerva', 'Minerva is a Roman goddess of wisdom, crafts, and the arts. Roman and Greek traditions overlap but are not identical.'),
  question('neptune', 'Which Roman god is associated with the sea?', ['Neptune', 'Vulcan', 'Mars', 'Janus'], 'Neptune', 'Neptune is associated with water, the sea, and horses, and is closely identified with Poseidon.'),
  question('vesta', 'Which Roman goddess is linked with the hearth and its fire?', ['Vesta', 'Luna', 'Aurora', 'Fortuna'], 'Vesta', 'Vesta is the Roman goddess of the hearth. Her fire represents the shared life of home and community.'),
  question('janus', 'Which Roman god is linked with beginnings and doorways?', ['Janus', 'Bacchus', 'Cupid', 'Sol'], 'Janus', 'Janus is associated with beginnings and transitions. His two faces look in different directions.'),
  question('venus', 'Which Roman goddess is linked with love and beauty?', ['Venus', 'Diana', 'Ops', 'Bellona'], 'Venus', 'Venus is a Roman goddess of love, beauty, and desire, closely identified with Aphrodite.'),
  question('vulcan', 'Which Roman god is associated with fire and metalworking?', ['Vulcan', 'Pluto', 'Faunus', 'Mercury'], 'Vulcan', 'Vulcan is associated with fire and the work of a divine smith. His familiar symbols include a hammer and anvil.'),
  question('mercury', 'Which Roman god is linked with trade, travel, and messages?', ['Mercury', 'Saturn', 'Mars', 'Neptune'], 'Mercury', 'Mercury is the swift messenger linked with travel and trade, closely identified with Hermes.'),
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
export function createQuizSession({ questions = questionBank, roundSize = 5, random = Math.random } = {}) {
  if (!Number.isInteger(roundSize) || roundSize < 1 || roundSize > questions.length) {
    throw new RangeError('Choose a round size within the question bank.');
  }
  let round = [];
  let status = 'ready';
  let index = 0;
  let score = 0;
  let selectedIndex = null;

  const getState = () => ({
    status, index, score, total: roundSize, selectedIndex,
    currentQuestion: round[index] ? { ...round[index], choices: [...round[index].choices] } : null,
  });

  function start() {
    round = shuffled(questions, random).slice(0, roundSize).map((item) => ({
      ...item, choices: shuffled(item.choices, random),
    }));
    status = 'question';
    index = 0;
    score = 0;
    selectedIndex = null;
    return getState();
  }

  function answer(choiceIndex) {
    const current = round[index];
    if (status !== 'question' || selectedIndex !== null || !Number.isInteger(choiceIndex)
      || choiceIndex < 0 || choiceIndex >= current.choices.length) return getState();
    selectedIndex = choiceIndex;
    if (current.choices[choiceIndex] === current.answer) score += 1;
    return getState();
  }

  function next() {
    if (status !== 'question' || selectedIndex === null) return getState();
    if (index + 1 === roundSize) {
      status = 'complete';
    } else {
      index += 1;
      selectedIndex = null;
    }
    return getState();
  }

  return { getState, start, answer, next, restart: start };
}

let mountNumber = 0;

export function mountQuiz(root) {
  if (!root) return null;
  const session = createQuizSession();
  const doc = root.ownerDocument;
  const headingId = `quiz-heading-${++mountNumber}`;

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

  function render(focusTarget = null) {
    const state = session.getState();
    const panel = element('div', 'quiz-panel');
    panel.setAttribute('aria-labelledby', headingId);

    if (state.status === 'ready') {
      panel.append(element('p', 'quiz-eyebrow', 'A little challenge'));
      const title = element('h3', 'quiz-heading', 'How well do you know the gods?');
      title.id = headingId;
      panel.append(title, element('p', 'quiz-description', 'Five questions, one answer each. Learn something with every choice, and play again for a fresh mix. There is no timer.'));
      panel.append(button('Start quiz', () => { session.start(); render('heading'); }));
      panel.append(element('p', 'quiz-small-note', 'Play just for fun. Your answers stay in this page.'));
    } else if (state.status === 'complete') {
      panel.append(element('p', 'quiz-eyebrow', 'Round complete'));
      const title = element('h3', 'quiz-heading', `You scored ${state.score} out of ${state.total}`);
      title.id = headingId;
      title.tabIndex = -1;
      const message = state.score === state.total
        ? 'A brilliant round! Try another mix of Greek and Roman questions.'
        : 'Every answer is a chance to learn. Explore the gods, then try a new round whenever you like.';
      panel.append(title, element('p', 'quiz-description', message));
      panel.append(button('Play again', () => { session.restart(); render('heading'); }));
    } else {
      const current = state.currentQuestion;
      const answered = state.selectedIndex !== null;
      const progress = element('div', 'quiz-progress');
      progress.append(element('p', 'quiz-eyebrow', `Question ${state.index + 1} of ${state.total}`));
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
        const option = button('', () => { session.answer(choiceIndex); render('feedback'); }, 'quiz-choice');
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
      }
      panel.append(feedback);
      if (answered) {
        panel.append(button(state.index + 1 === state.total ? 'See my score' : 'Next question', () => {
          session.next(); render('heading');
        }));
      } else {
        panel.append(element('p', 'quiz-small-note', 'Choose one answer. You can use Tab and Enter to play.'));
      }
    }

    root.replaceChildren(panel);
    if (focusTarget === 'heading') panel.querySelector('.quiz-heading')?.focus({ preventScroll: true });
    if (focusTarget === 'feedback') panel.querySelector('.quiz-feedback')?.focus({ preventScroll: true });
  }

  render();
  return session;
}
