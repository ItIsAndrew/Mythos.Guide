import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
import vm from 'node:vm';

const activitySource = await readFile(new URL('../public/activity.js', import.meta.url), 'utf8');

// Exercise the real entry script without starting a browser or accessing an
// account. The submit listener is deliberately installed after activity.js,
// matching the deferred activity script followed by the app module.
function fixture(path) {
  const listeners = new Map();
  function eventTarget(name) {
    return {
      addEventListener(type, callback, options) {
        const key = `${name}:${type}`;
        const handlers = listeners.get(key) || [];
        handlers.push({ callback, once: Boolean(options?.once) });
        listeners.set(key, handlers);
      },
      dispatch(type) {
        const key = `${name}:${type}`;
        for (const handler of [...(listeners.get(key) || [])]) {
          if (handler.once) listeners.set(key, listeners.get(key).filter((item) => item !== handler));
          handler.callback({ type });
        }
      },
    };
  }
  const nodes = new Map();
  for (const id of ['start-here', 'search', 'discovery', 'gods', 'basics', 'worlds', 'stories', 'play', 'account']) {
    nodes.set(id, {
      id: id === 'discovery' ? '' : id,
      tagName: 'SECTION',
      hidden: false,
      classList: { contains: (name) => id === 'discovery' && name === 'discovery' },
      prepend() {},
      scrollIntoView() {},
    });
  }
  const input = { value: '' };
  const skipLink = { href: '#search-input', textContent: 'Skip to search' };
  const nextLink = { href: '#stories', firstChild: { textContent: 'Go to stories ' } };
  const nextTitle = { textContent: 'Read the myths' };
  const nextCopy = { textContent: '' };
  const scripts = [];
  const accountStatus = { textContent: 'Checking your account…' };
  let requested = 0;
  let received = 0;
  const form = {
    ...eventTarget('form'),
    requestSubmit() { requested += 1; this.dispatch('submit'); },
  };
  const document = {
    ...eventTarget('document'),
    readyState: 'loading',
    title: '',
    createElement: () => ({ addEventListener() {} }),
    head: { append(script) { scripts.push(script); } },
    querySelector(selector) {
      if (selector === 'main') return { children: [...nodes.values()] };
      if (selector === '#search-input') return input;
      if (selector === '#search-form') return form;
      if (selector === '.skip-link') return skipLink;
      if (selector === '#activity-next-link') return nextLink;
      if (selector === '#activity-next-title') return nextTitle;
      if (selector === '#activity-next-copy') return nextCopy;
      if (selector === '#account-status') return accountStatus;
      return null;
    },
    getElementById(id) { return this.querySelector(`#${id}`); },
    querySelectorAll: () => [],
  };
  const storage = new Map();
  const window = {
    ...eventTarget('window'),
    location: new URL(path, 'http://localhost:3000'),
    localStorage: { setItem: (key, value) => storage.set(key, value) },
  };
  vm.runInNewContext(activitySource, { document, window, URLSearchParams, URL, requestAnimationFrame: (callback) => callback() });
  form.addEventListener('submit', () => { received += 1; });
  return {
    input, nodes, window, document, skipLink, nextLink, nextTitle, nextCopy, scripts,
    get requested() { return requested; },
    get received() { return received; },
    ready() {
      document.readyState = 'interactive';
      document.dispatch('DOMContentLoaded');
      window.dispatch('DOMContentLoaded');
    },
    navigate(hash) { window.location.hash = hash; window.dispatch('hashchange'); },
  };
}

test('a landing search waits for the app listener and submits its trimmed name once', () => {
  const entry = fixture('/activity?q=%20Athena%20#search');
  assert.equal(entry.requested, 0, 'the deferred entry script must wait for the app module');
  assert.equal(entry.input.value, '');
  entry.ready();
  assert.equal(entry.input.value, 'Athena');
  assert.equal(entry.requested, 1);
  assert.equal(entry.received, 1, 'the actual search listener must receive the submission');
  assert.equal(entry.nodes.get('search').hidden, false);
  assert.equal(entry.nodes.get('discovery').hidden, false);
  entry.ready();
  entry.navigate('#stories');
  assert.equal(entry.requested, 1, 'later navigation must not repeat the landing search');
  assert.equal(entry.nodes.get('stories').hidden, false);
});

test('every activity offers a working next path and updates it when switching activities', () => {
  const entry = fixture('/activity#start-here');
  for (const [current, next, title] of [
    ['start-here', 'search', 'Find a god'], ['search', 'stories', 'Read the myths'],
    ['gods', 'worlds', 'Explore their worlds'], ['worlds', 'stories', 'Read the myths'],
    ['stories', 'play', 'Try a quiz'], ['basics', 'search', 'Find a god'],
    ['play', 'basics', 'Names & words'], ['account', 'stories', 'Read the myths'],
  ]) {
    entry.navigate(`#${current}`);
    assert.equal(entry.nextLink.href, `#${next}`, current);
    assert.equal(entry.nextTitle.textContent, title, current);
    assert.notEqual(current, next);
    assert.ok(entry.nextCopy.textContent.length > 15, current);
  }
});

test('account code loads only on My posts, including a direct link, and only once', () => {
  const entry = fixture('/activity#stories');
  assert.equal(entry.scripts.length, 0, 'reading a story should not load account code');
  entry.navigate('#play');
  entry.navigate('#gods');
  assert.equal(entry.scripts.length, 0, 'other activities should not load account code');
  entry.navigate('#account');
  assert.equal(entry.scripts.length, 1);
  assert.equal(entry.scripts[0].src, '/accounts.js');
  assert.equal(entry.scripts[0].type, 'module');
  entry.navigate('#stories');
  entry.navigate('#account');
  assert.equal(entry.scripts.length, 1, 'returning must reuse the account module');
  assert.equal(fixture('/activity#account').scripts.length, 1, 'a direct account link must load the module');
});

test('plain and legacy search URLs accept multiword and Unicode names as input text', () => {
  for (const hash of ['', '#search', '#search-input']) {
    for (const name of ['Thalia the Muse', 'Æther', 'A'.repeat(80)]) {
      const entry = fixture(`/activity?q=${encodeURIComponent(name)}${hash}`);
      entry.ready();
      assert.equal(entry.input.value, name, `${hash || 'no hash'}: ${name}`);
      assert.equal(entry.received, 1);
    }
  }
});

test('a retained query does not override a different requested activity', () => {
  for (const id of ['start-here', 'gods', 'basics', 'worlds', 'stories', 'play', 'account']) {
    const entry = fixture(`/activity?q=Athena#${id}`);
    entry.ready();
    assert.equal(entry.requested, 0, id);
    assert.equal(entry.input.value, '', id);
    assert.equal(entry.nodes.get(id).hidden, false, `${id} remains the selected activity`);
  }
});

test('empty, overlong, and ambiguous repeated queries never trigger an automatic search', () => {
  for (const query of ['', '?other=Athena', '?q=', '?q=%20%20', `?q=${'A'.repeat(81)}`, '?q=Athena&q=Zeus', '?q=&q=Athena', '?q=Athena&q=Athena']) {
    const entry = fixture(`/activity${query}#search`);
    entry.ready();
    assert.equal(entry.requested, 0, query || 'no query');
    assert.equal(entry.input.value, '', query || 'no query');
    assert.equal(entry.nodes.get('search').hidden, false);
  }
});

test('the skip link targets the current visible activity and restores search when selected', () => {
  const entry = fixture('/activity#stories');
  assert.equal(entry.skipLink.href, '#stories');
  assert.equal(entry.skipLink.textContent, 'Skip to this activity');
  assert.equal(entry.nodes.get('stories').tabIndex, -1, 'native anchor navigation can focus the section');
  for (const id of ['start-here', 'gods', 'basics', 'worlds', 'play', 'account']) {
    entry.navigate(`#${id}`);
    assert.equal(entry.skipLink.href, `#${id}`);
    assert.equal(entry.nodes.get(id).hidden, false);
    assert.equal(entry.nodes.get(id).tabIndex, -1);
  }
  for (const hash of ['#search', '#search-input', '#unknown']) {
    entry.navigate(hash);
    assert.equal(entry.skipLink.href, '#search-input');
    assert.equal(entry.skipLink.textContent, 'Skip to search');
    assert.equal(entry.nodes.get('search').hidden, false);
  }
});
