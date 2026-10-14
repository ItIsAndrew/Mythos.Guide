import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createQuizSession, questionBank } from '../public/quiz.js';
import { stories, worlds } from '../public/learn-content.js';
import { normalizeSearch, sampleGods } from '../api/_lib/sample-gods.js';

function chooseAnswer(session, isCorrect) {
  const { currentQuestion } = session.getState();
  const index = currentQuestion.choices.findIndex((choice) => (choice === currentQuestion.answer) === isCorrect);
  return session.answer(index);
}

test('a round uses five distinct questions and exposes no mutable internal choices', () => {
  const session = createQuizSession({ random: () => 0.5 });
  assert.equal(session.getState().status, 'ready');
  assert.equal(session.getState().currentQuestion, null);
  session.start();
  const ids = new Set();
  for (let index = 0; index < 5; index += 1) {
    const before = session.getState();
    assert.equal(before.index, index);
    ids.add(before.currentQuestion.id);
    before.currentQuestion.choices.length = 0;
    assert.equal(session.getState().currentQuestion.choices.length, 4);
    chooseAnswer(session, true);
    session.next();
  }
  assert.equal(ids.size, 5);
  assert.equal(session.getState().status, 'complete');
  assert.equal(session.getState().score, 5);
});

test('answers lock after one choice and cannot inflate the score', () => {
  const session = createQuizSession();
  session.start();
  const correct = chooseAnswer(session, true);
  assert.equal(correct.score, 1);
  for (let choice = 0; choice < 4; choice += 1) session.answer(choice);
  assert.equal(session.getState().score, 1);
  assert.equal(session.getState().selectedIndex, correct.selectedIndex);
  session.next();
  const incorrect = chooseAnswer(session, false);
  assert.equal(incorrect.score, 1);
  chooseAnswer(session, true);
  assert.equal(session.getState().score, 1);
  assert.equal(session.getState().selectedIndex, incorrect.selectedIndex);
});

test('only a valid answer enables progression, including the final score', () => {
  const session = createQuizSession({ roundSize: 2 });
  session.answer(0);
  session.next();
  assert.equal(session.getState().status, 'ready');
  session.start();
  for (const invalid of [-1, 4, 0.2, null, '0', NaN]) session.answer(invalid);
  session.next();
  assert.equal(session.getState().index, 0);
  assert.equal(session.getState().selectedIndex, null);
  chooseAnswer(session, false);
  session.next();
  assert.equal(session.getState().index, 1);
  assert.equal(session.getState().selectedIndex, null);
  session.next();
  assert.equal(session.getState().status, 'question');
  chooseAnswer(session, true);
  session.next();
  assert.equal(session.getState().status, 'complete');
  assert.equal(session.getState().score, 1);
  session.answer(0);
  session.next();
  assert.equal(session.getState().score, 1);
  assert.equal(session.getState().index, 1);
});

test('replay resets score, selections, progress, and completion without changing the bank', () => {
  const original = JSON.stringify(questionBank);
  const session = createQuizSession({ roundSize: 2, random: () => 0.1 });
  session.start();
  chooseAnswer(session, true);
  session.next();
  chooseAnswer(session, true);
  session.next();
  assert.equal(session.getState().status, 'complete');
  assert.equal(session.getState().score, 2);
  const replay = session.restart();
  assert.equal(replay.status, 'question');
  assert.equal(replay.index, 0);
  assert.equal(replay.score, 0);
  assert.equal(replay.selectedIndex, null);
  chooseAnswer(session, false);
  assert.equal(session.getState().score, 0);
  assert.equal(JSON.stringify(questionBank), original);
});

test('the quiz rejects invalid round sizes and every answer exists exactly once', () => {
  for (const roundSize of [0, -1, 1.5, questionBank.length + 1]) {
    assert.throws(() => createQuizSession({ roundSize }), RangeError);
  }
  assert.ok(questionBank.length >= 12);
  assert.equal(new Set(questionBank.map((item) => item.id)).size, questionBank.length);
  for (const item of questionBank) {
    assert.equal(item.choices.length, 4);
    assert.equal(new Set(item.choices).size, 4);
    assert.equal(item.choices.filter((choice) => choice === item.answer).length, 1);
    assert.ok(item.explanation.length > 40);
  }
});

test('learning content has unique stories, both traditions, and complete realm details', () => {
  assert.equal(worlds.length, 4);
  assert.equal(stories.length, 6);
  assert.equal(new Set([...worlds, ...stories].map((item) => item.id)).size, 10);
  assert.deepEqual(new Set(stories.map((item) => item.tradition)), new Set(['Greek', 'Roman']));
  for (const world of worlds) {
    assert.equal(world.details.length, 3);
    assert.ok(world.gods.length >= 3);
    assert.ok(world.details.every((detail) => detail.title && detail.text));
  }
  for (const story of stories) {
    assert.equal(story.paragraphs.length, 3);
    assert.ok(story.relatedGods.length >= 2);
    assert.ok(story.source.url.startsWith('https://'));
  }
});

test('every god linked from a realm or story can be found in the sample archive', () => {
  const searchableNames = new Set(sampleGods.flatMap((god) => god.searchNames));
  for (const item of [...worlds, ...stories]) {
    for (const name of item.gods ?? item.relatedGods) {
      assert.ok(searchableNames.has(normalizeSearch(name)), `${item.id}: ${name}`);
    }
  }
});
