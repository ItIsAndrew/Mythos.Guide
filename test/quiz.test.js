import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createQuizSession, questionBank, quizDifficulties } from '../public/quiz.js';
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

test('difficulty choice limits each round to its question pool and survives replay', () => {
  assert.deepEqual(quizDifficulties, ['easy', 'medium', 'hard']);
  const session = createQuizSession({ random: () => 0.5 });
  for (const difficulty of quizDifficulties) {
    session.selectDifficulty(difficulty);
    assert.equal(session.getState().difficulty, difficulty);
    session.start();
    const seen = new Set();
    for (let index = 0; index < 5; index += 1) {
      const current = session.getState().currentQuestion;
      assert.equal(current.difficulty, difficulty);
      seen.add(current.id);
      chooseAnswer(session, true);
      session.next();
    }
    assert.equal(seen.size, 5);
    assert.equal(session.getState().status, 'complete');
    assert.equal(session.restart().difficulty, difficulty);
    assert.equal(session.getState().currentQuestion.difficulty, difficulty);
    // Finish the replay before choosing a new difficulty.
    for (let index = 0; index < 5; index += 1) {
      chooseAnswer(session, true);
      session.next();
    }
  }
});

test('difficulty cannot change during a round or to an unavailable pool', () => {
  const session = createQuizSession();
  assert.throws(() => session.selectDifficulty('unknown'), RangeError);
  session.start();
  assert.equal(session.selectDifficulty('hard').difficulty, 'easy');
  assert.equal(session.getState().status, 'question');
  assert.throws(() => createQuizSession({ difficulty: 'unknown' }), RangeError);
  const hardPoolSize = questionBank.filter((item) => item.difficulty === 'hard').length;
  assert.throws(() => createQuizSession({ difficulty: 'hard', roundSize: hardPoolSize + 1 }), RangeError);
});

test('the quiz rejects invalid round sizes and every answer exists exactly once', () => {
  for (const roundSize of [0, -1, 1.5, questionBank.length + 1]) {
    assert.throws(() => createQuizSession({ roundSize }), RangeError);
  }
  assert.ok(questionBank.length >= 48);
  assert.equal(new Set(questionBank.map((item) => item.id)).size, questionBank.length);
  assert.equal(new Set(questionBank.map((item) => normalizeSearch(item.prompt))).size, questionBank.length);
  for (const difficulty of quizDifficulties) {
    assert.ok(questionBank.filter((item) => item.difficulty === difficulty).length >= 16);
  }
  for (const item of questionBank) {
    assert.ok(quizDifficulties.includes(item.difficulty));
    assert.equal(item.choices.length, 4);
    assert.equal(new Set(item.choices).size, 4);
    assert.equal(item.choices.filter((choice) => choice === item.answer).length, 1);
    assert.ok(item.explanation.length > 40);
    assert.ok(item.source?.title.length > 10, `${item.id}: visible source title`);
    assert.match(item.source?.url ?? '', /^https:\/\/(www\.theoi\.com|www\.metmuseum\.org)\//, `${item.id}: relevant research source`);
    assert.ok(item.versionNote.length > 40, `${item.id}: myth-version note`);
  }
});

test('every question in the expanded bank scores correct and incorrect answers consistently', () => {
  const visited = new Set();
  for (const difficulty of quizDifficulties) {
    const roundSize = questionBank.filter((item) => item.difficulty === difficulty).length;
    const session = createQuizSession({ difficulty, roundSize, random: () => 0.37 });
    for (const correct of [true, false]) {
      session.start();
      const roundIds = new Set();
      for (let index = 0; index < roundSize; index += 1) {
        const current = session.getState().currentQuestion;
        assert.equal(current.difficulty, difficulty);
        roundIds.add(current.id);
        visited.add(current.id);
        const state = chooseAnswer(session, correct);
        assert.equal(state.score, correct ? index + 1 : 0, current.id);
        assert.equal(state.currentQuestion.explanation, current.explanation);
        chooseAnswer(session, !correct);
        assert.equal(session.getState().score, state.score, `${current.id}: answer must stay locked`);
        session.next();
      }
      assert.equal(roundIds.size, roundSize);
      assert.equal(session.getState().status, 'complete');
      assert.equal(session.getState().score, correct ? roundSize : 0);
    }
  }
  assert.equal(visited.size, questionBank.length);
});

test('learning content has unique stories, both traditions, and complete realm details', () => {
  assert.equal(worlds.length, 6);
  assert.equal(stories.length, 12);
  assert.equal(new Set([...worlds, ...stories].map((item) => item.id)).size, worlds.length + stories.length);
  assert.deepEqual(new Set(stories.map((item) => item.tradition)), new Set(['Greek', 'Roman']));
  for (const world of worlds) {
    assert.equal(world.details.length, 3);
    assert.ok(world.gods.length >= 3);
    assert.ok(world.details.every((detail) => detail.title && detail.text));
    assert.ok(world.sources?.length >= 1, world.id);
    assert.ok(world.sources.every((source) => source.title && source.url.startsWith('https://')), world.id);
    assert.ok(world.versionNote.length > 40, world.id);
    assert.ok(world.storyIds?.length >= 1, world.id);
    for (const storyId of world.storyIds) {
      const story = stories.find((item) => item.id === storyId);
      assert.ok(story, `${world.id}: ${storyId}`);
      assert.ok(story.relatedGods.some((name) => world.gods.includes(name)), `${world.id}: ${storyId} has a linked figure`);
    }
  }
  for (const story of stories) {
    assert.equal(story.paragraphs.length, 3);
    assert.ok(story.relatedGods.length >= 2);
    assert.ok(story.source.url.startsWith('https://'));
    assert.ok(story.versionNote.length > 40, story.id);
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


test('ending a round resets progress while preserving the chosen difficulty', () => {
  const session = createQuizSession({ difficulty: 'hard' });
  session.start();
  chooseAnswer(session, true);
  session.next();
  chooseAnswer(session, false);
  const state = session.quitRound();
  assert.equal(state.status, 'ready');
  assert.equal(state.currentQuestion, null);
  assert.equal(state.score, 0);
  assert.equal(state.index, 0);
  assert.equal(state.selectedIndex, null);
  assert.equal(state.difficulty, 'hard');
  session.selectDifficulty('medium');
  assert.equal(session.start().currentQuestion.difficulty, 'medium');
});

test('new retellings add sustained reading and distinct paths beyond the Olympians', () => {
  const newIds = ['ares-bronze-jar', 'mars-anna-perenna', 'asclepius-healing', 'heracles-alcestis', 'morpheus-message', 'venus-shield'];
  for (const id of newIds) {
    const story = stories.find((item) => item.id === id);
    assert.ok(story, id);
    const words = story.paragraphs.join(' ').split(/\s+/).length;
    assert.ok(words >= 200 && words <= 300, `${id}: ${words} words`);
    assert.equal(story.readingTime, '2 min');
  }
  for (const name of ['Ares', 'Mars', 'Heracles', 'Morpheus', 'Asclepius', 'Venus']) {
    assert.ok(stories.filter((item) => newIds.includes(item.id)).some((story) => story.relatedGods.includes(name)), name);
  }
  assert.ok(worlds.find((item) => item.id === 'healing-sanctuary').gods.includes('Hygieia'));
  assert.deepEqual(worlds.find((item) => item.id === 'roman-forum').gods, ['Janus', 'Concordia', 'Terminus', 'Mars']);
});

test('completed rounds retain the chosen answers, explanations, and sources for review', () => {
  const session = createQuizSession({ random: () => 0.4 });
  session.start();
  const expected = [];
  for (let index = 0; index < 5; index += 1) {
    const current = session.getState().currentQuestion;
    const state = chooseAnswer(session, index % 2 === 0);
    expected.push({ question: current, selectedAnswer: current.choices[state.selectedIndex], correct: index % 2 === 0 });
    // A second answer must never add a second review entry.
    chooseAnswer(session, index % 2 !== 0);
    session.next();
  }
  const complete = session.getState();
  assert.equal(complete.mode, 'round');
  assert.equal(complete.score, 3);
  assert.deepEqual(complete.answers, expected);
  complete.answers[0].question.choices.length = 0;
  complete.answers[0].question.source.title = 'Changed outside the session';
  complete.answers[0].selectedAnswer = 'Changed';
  complete.answers.length = 0;
  assert.deepEqual(session.getState().answers, expected, 'review snapshots must not mutate session results');
});

test('practice contains only missed questions and never carries over the old score or answers', () => {
  const session = createQuizSession({ difficulty: 'hard', random: () => 0.4 });
  session.start();
  const firstId = session.getState().currentQuestion.id;
  assert.equal(session.practiceMissed().currentQuestion.id, firstId, 'practice cannot interrupt an active round');
  const missedIds = new Set();
  for (let index = 0; index < 5; index += 1) {
    if (index > 2) missedIds.add(session.getState().currentQuestion.id);
    chooseAnswer(session, index <= 2);
    session.next();
  }
  const practice = session.practiceMissed();
  assert.equal(practice.mode, 'practice');
  assert.equal(practice.total, 2);
  assert.equal(practice.score, 0);
  assert.equal(practice.index, 0);
  assert.equal(practice.selectedIndex, null);
  assert.equal(practice.difficulty, 'hard');
  assert.deepEqual(practice.answers, []);
  const practicedIds = new Set();
  for (let index = 0; index < 2; index += 1) {
    const state = session.getState();
    practicedIds.add(state.currentQuestion.id);
    assert.equal(state.currentQuestion.difficulty, 'hard');
    chooseAnswer(session, index === 0);
    session.next();
  }
  assert.deepEqual(practicedIds, missedIds);
  assert.equal(session.getState().status, 'complete');
  assert.equal(session.getState().score, 1);
  const remainingId = session.getState().answers.find((item) => !item.correct).question.id;
  const retry = session.practiceMissed();
  assert.equal(retry.total, 1);
  assert.equal(retry.currentQuestion.id, remainingId);
  assert.equal(retry.score, 0);
  chooseAnswer(session, true);
  session.next();
  assert.equal(session.getState().status, 'complete');
  assert.equal(session.getState().score, 1);
  const allCorrect = session.getState();
  assert.deepEqual(session.practiceMissed(), allCorrect, 'a perfect practice round has nothing to retry');
  const replay = session.restart();
  assert.equal(replay.mode, 'round');
  assert.equal(replay.total, 5);
  assert.equal(replay.score, 0);
  assert.equal(replay.difficulty, 'hard');
  assert.deepEqual(replay.answers, []);
});

test('ending practice or changing difficulty clears the review and restores a five-question round', () => {
  const session = createQuizSession({ difficulty: 'medium' });
  assert.equal(session.practiceMissed().status, 'ready');
  session.start();
  for (let index = 0; index < 5; index += 1) {
    chooseAnswer(session, index !== 0);
    session.next();
  }
  session.practiceMissed();
  chooseAnswer(session, false);
  const ready = session.quitRound();
  assert.equal(ready.mode, 'round');
  assert.equal(ready.total, 5);
  assert.equal(ready.score, 0);
  assert.deepEqual(ready.answers, []);
  assert.equal(ready.difficulty, 'medium');
  session.selectDifficulty('easy');
  assert.equal(session.start().currentQuestion.difficulty, 'easy');
  for (let index = 0; index < 5; index += 1) {
    chooseAnswer(session, true);
    session.next();
  }
  assert.equal(session.getState().score, 5);
  assert.equal(session.practiceMissed().status, 'complete');
  const hard = session.selectDifficulty('hard');
  assert.equal(hard.mode, 'round');
  assert.equal(hard.total, 5);
  assert.equal(hard.score, 0);
  assert.deepEqual(hard.answers, []);
});
