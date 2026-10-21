import assert from 'node:assert/strict';
import { test } from 'node:test';
import { mountQuiz } from '../public/quiz.js';

// A small DOM test double exercises the actual mounted event handlers. Phone
// geometry is checked in the real browser; these checks prevent a regression
// where focus moves but the replacement question or feedback is never scrolled.
class Node {
  constructor(tag, doc) {
    this.tagName = tag;
    this.ownerDocument = doc;
    this.children = [];
    this.attributes = {};
    this.listeners = {};
    this.className = '';
    this.textContent = '';
    this.classList = { add: (...names) => { this.className += ` ${names.join(' ')}`; } };
  }
  append(...nodes) { this.children.push(...nodes); }
  replaceChildren(...nodes) { this.children = nodes; }
  setAttribute(name, value) { this.attributes[name] = value; }
  addEventListener(event, handler) { this.listeners[event] = handler; }
  focus(options) { this.ownerDocument.activeElement = this; this.ownerDocument.focusOptions = options; }
  scrollIntoView(options) { this.ownerDocument.lastScroll = { node: this, options }; }
  click() { if (!this.disabled) this.listeners.click?.(); }
  all() { return [this, ...this.children.flatMap((child) => child.all())]; }
  querySelector(selector) {
    if (selector === '.quiz-difficulty input:checked') return this.all().find((node) => node.tagName === 'input' && node.checked) ?? null;
    return this.all().find((node) => node.className.split(' ').includes(selector.slice(1))) ?? null;
  }
}
function fixture() {
  const doc = { createElement: (tag) => new Node(tag, doc) };
  const root = new Node('section', doc);
  const session = mountQuiz(root);
  const button = (label) => {
    const match = root.all().find((node) => node.tagName === 'button' && node.textContent === label);
    assert.ok(match, `Button ${label} exists`);
    return match;
  };
  const choose = () => root.all().find((node) => node.className === 'quiz-choice').click();
  const chooseAnswer = (correct) => {
    const { currentQuestion } = session.getState();
    const choiceIndex = currentQuestion.choices.findIndex((choice) => (choice === currentQuestion.answer) === correct);
    root.all().filter((node) => node.className === 'quiz-choice')[choiceIndex].click();
  };
  return { root, doc, session, button, choose, chooseAnswer };
}
function assertVisibleFocus(doc, expected) {
  assert.equal(doc.activeElement, expected);
  assert.equal(doc.lastScroll.node, expected, 'the newly focused content must also be scrolled into view');
  assert.deepEqual(doc.lastScroll.options, { block: 'start', behavior: 'instant' }, 'quiz transitions must not inherit the page\'s smooth scrolling');
  assert.deepEqual(doc.focusOptions, { preventScroll: true });
}

test('mounted quiz reveals first question, every explanation, each next question, and final score', () => {
  const { root, doc, session, button, choose } = fixture();
  button('Start quiz').click();
  assertVisibleFocus(doc, root.querySelector('.quiz-heading'));
  for (let index = 0; index < 5; index += 1) {
    assert.equal(session.getState().index, index);
    choose();
    const feedback = root.querySelector('.quiz-feedback');
    assertVisibleFocus(doc, feedback);
    const source = root.querySelector('.quiz-source');
    assert.equal(source.href, session.getState().currentQuestion.source.url);
    assert.equal(source.target, '_blank');
    assert.equal(source.rel, 'noopener noreferrer');
    assert.equal(root.querySelector('.quiz-version-note').textContent, session.getState().currentQuestion.versionNote);
    assert.equal(root.all().filter((node) => node.tagName === 'button' && node.className.includes('quiz-choice') && node.disabled).length, 4);
    button(index === 4 ? 'See my score' : 'Next question').click();
    assertVisibleFocus(doc, root.querySelector('.quiz-heading'));
  }
  assert.equal(session.getState().status, 'complete');
  button('Play again').click();
  assert.equal(session.getState().index, 0);
  assertVisibleFocus(doc, root.querySelector('.quiz-heading'));
});

test('changing difficulty during a round needs an explicit end and keeps progress when cancelled', () => {
  const { root, doc, session, button, choose } = fixture();
  button('Start quiz').click();
  const questionId = session.getState().currentQuestion.id;
  button('Change difficulty').click();
  button('Keep playing').click();
  assert.equal(session.getState().currentQuestion.id, questionId);
  assert.equal(session.getState().selectedIndex, null);
  assertVisibleFocus(doc, root.querySelector('.quiz-heading'));
  choose();
  const before = session.getState();
  button('Change difficulty').click();
  assertVisibleFocus(doc, root.querySelector('.quiz-quit-title'));
  assert.equal(session.getState().status, 'question');
  button('Keep playing').click();
  assert.equal(session.getState().score, before.score);
  assert.equal(session.getState().selectedIndex, before.selectedIndex);
  assertVisibleFocus(doc, root.querySelector('.quiz-feedback'));
  button('Change difficulty').click();
  button('End round').click();
  assert.equal(session.getState().status, 'ready');
  assert.equal(session.getState().score, 0);
  assert.equal(session.getState().currentQuestion, null);
  assertVisibleFocus(doc, root.querySelector('.quiz-difficulty input:checked'));
  const hard = root.all().find((node) => node.tagName === 'input' && node.value === 'hard');
  hard.listeners.change();
  button('Start quiz').click();
  assert.equal(session.getState().currentQuestion.difficulty, 'hard');
  assertVisibleFocus(doc, root.querySelector('.quiz-heading'));
});

test('end-of-round review shows only missed answers and starts a focused practice round', () => {
  const { root, doc, session, button, chooseAnswer } = fixture();
  button('Start quiz').click();
  const expected = [];
  for (let index = 0; index < 5; index += 1) {
    chooseAnswer(index % 2 === 0);
    if (index % 2 !== 0) expected.push(session.getState().answers.at(-1));
    button(index === 4 ? 'See my score' : 'Next question').click();
  }
  assert.equal(root.querySelector('.quiz-heading').textContent, 'You scored 3 out of 5');
  assert.equal(root.all().filter((node) => node.className === 'quiz-correct-card').length, 3);
  assert.ok(root.all().some((node) => node.tagName === 'summary' && node.textContent === 'Review 3 correct answers'));
  assert.equal(root.all().find((node) => node.tagName === 'a' && node.textContent === 'Practice mythology words').href, '#basics');
  const cards = root.all().filter((node) => node.className === 'quiz-review-card');
  assert.equal(cards.length, 2);
  for (const [index, card] of cards.entries()) {
    const item = expected[index];
    assert.equal(card.querySelector('.quiz-review-question').textContent, item.question.prompt);
    assert.equal(card.querySelector('.quiz-review-choice').textContent, `Your answer: ${item.selectedAnswer}`);
    assert.equal(card.querySelector('.quiz-review-correct').textContent, `Correct answer: ${item.question.answer}`);
    assert.equal(card.querySelector('.quiz-explanation').textContent, item.question.explanation);
    assert.equal(card.querySelector('.quiz-source').href, item.question.source.url);
    assert.equal(card.querySelector('.quiz-source').rel, 'noopener noreferrer');
    assert.equal(card.querySelector('.quiz-version-note').textContent, item.question.versionNote);
  }
  button('Practice missed answers').click();
  assertVisibleFocus(doc, root.querySelector('.quiz-heading'));
  assert.equal(session.getState().mode, 'practice');
  assert.equal(session.getState().total, 2);
  assert.equal(session.getState().score, 0);
  assert.equal(root.querySelector('.quiz-review'), null);
  assert.match(root.querySelector('.quiz-eyebrow').textContent, /Practice question 1 of 2/);
  for (let index = 0; index < 2; index += 1) {
    chooseAnswer(true);
    assertVisibleFocus(doc, root.querySelector('.quiz-feedback'));
    button(index === 1 ? 'See my score' : 'Next question').click();
  }
  assert.equal(root.querySelector('.quiz-heading').textContent, 'You scored 2 out of 2');
  assert.match(root.querySelector('.quiz-eyebrow').textContent, /practice complete/);
  assert.equal(root.querySelector('.quiz-review'), null);
  assert.ok(!root.all().some((node) => node.tagName === 'button' && node.textContent === 'Practice missed answers'));
  button('Play again').click();
  assertVisibleFocus(doc, root.querySelector('.quiz-heading'));
  assert.equal(session.getState().mode, 'round');
  assert.equal(session.getState().total, 5);
  assert.equal(session.getState().score, 0);
});

test('a perfect round offers a fresh quiz without an empty missed-answer review', () => {
  const { root, button, chooseAnswer } = fixture();
  button('Start quiz').click();
  for (let index = 0; index < 5; index += 1) {
    chooseAnswer(true);
    button(index === 4 ? 'See my score' : 'Next question').click();
  }
  assert.equal(root.querySelector('.quiz-heading').textContent, 'You scored 5 out of 5');
  assert.equal(root.querySelector('.quiz-review'), null);
  assert.ok(!root.all().some((node) => node.tagName === 'button' && node.textContent === 'Practice missed answers'));
  button('Change difficulty').click();
  assert.equal(root.querySelector('.quiz-review'), null);
  assert.equal(root.querySelector('.quiz-heading').textContent, 'How well do you know the gods?');
});
