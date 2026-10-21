import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
import vm from 'node:vm';

const source = await readFile(new URL('../public/guide-home.js', import.meta.url), 'utf8');
const activities = ['search', 'gods', 'stories', 'worlds', 'play', 'basics', 'account'];

function fixture({ stored = null, hash = '', blocked = false } = {}) {
  const nodes = Object.fromEntries([
    '#resume-panel', '#continue-activity', '#continue-title', '#continue-copy',
    '#suggested-activity', '#suggested-title', '#suggested-copy',
  ].map((id) => [id, { hidden: id === '#resume-panel', textContent: `Original ${id}`, href: '/original' }]));
  const listeners = {};
  const replacements = [];
  const storageKeys = [];
  let currentStored = stored;
  const window = {
    location: { hash, replace: (url) => replacements.push(url) },
    localStorage: { getItem(key) {
      storageKeys.push(key);
      if (blocked) throw new Error('Storage is blocked');
      return currentStored;
    } },
    addEventListener: (event, listener) => { listeners[event] = listener; },
  };
  const document = { querySelector(selector) {
    assert.ok(Object.hasOwn(nodes, selector), `Only the menu's public IDs are required: ${selector}`);
    return nodes[selector];
  } };
  vm.runInNewContext(source, { window, document });
  return {
    nodes, replacements, storageKeys,
    setStored(value) { currentStored = value; },
    show() { listeners.pageshow(); },
    changeHash(value) { window.location.hash = value; listeners.hashchange(); },
  };
}

test('new visitors see the activity menu without an empty resume panel', () => {
  const { nodes, storageKeys } = fixture();
  assert.equal(nodes['#resume-panel'].hidden, true);
  for (const selector of ['#continue-activity', '#suggested-activity']) assert.equal(nodes[selector].href, '/original');
  for (const selector of ['#continue-title', '#continue-copy', '#suggested-title', '#suggested-copy']) {
    assert.equal(nodes[selector].textContent, `Original ${selector}`);
  }
  assert.deepEqual(storageKeys, ['mythos-guide:last-activity']);
});

test('each of the seven saved activities resumes correctly and suggests a different activity', () => {
  const titles = ['Find a god', 'Meet the gods', 'Read the myths', 'Explore their worlds', 'Try a quiz', 'Names & words', 'My posts'];
  for (const [index, stored] of activities.entries()) {
    const { nodes } = fixture({ stored });
    assert.equal(nodes['#resume-panel'].hidden, false, stored);
    assert.equal(nodes['#continue-activity'].href, `/activity#${stored}`);
    assert.equal(nodes['#continue-title'].textContent, titles[index]);
    assert.ok(nodes['#continue-copy'].textContent.length > 10);
    const suggestion = nodes['#suggested-activity'].href;
    assert.notEqual(suggestion, nodes['#continue-activity'].href, stored);
    assert.ok(activities.some((key) => suggestion === `/activity#${key}`), suggestion);
    assert.ok(titles.includes(nodes['#suggested-title'].textContent));
    assert.ok(nodes['#suggested-copy'].textContent.length > 10);
  }
});

test('corrupt, unknown, prototype, and forged saved activities cannot supply a menu destination', () => {
  for (const stored of ['', 'unknown', '__proto__', 'constructor', 'toString', 'search ', 'SEARCH', 'https://example.com', 'search\" onclick=\"bad()', '{"activity":"search"}', {}, ['search']]) {
    const { nodes } = fixture({ stored });
    assert.equal(nodes['#resume-panel'].hidden, true, String(stored));
    assert.equal(nodes['#continue-activity'].href, '/original');
    assert.equal(nodes['#suggested-activity'].href, '/original');
  }
});

test('blocked storage leaves the menu usable without showing a false resume activity', () => {
  const page = fixture({ blocked: true, stored: 'search' });
  assert.equal(page.nodes['#resume-panel'].hidden, true);
  assert.doesNotThrow(() => page.show());
});

test('back navigation refreshes the most recent activity and hides a cleared resume panel', () => {
  const page = fixture({ stored: 'search' });
  page.setStored('play');
  page.show();
  assert.equal(page.nodes['#continue-activity'].href, '/activity#play');
  assert.equal(page.nodes['#suggested-activity'].href, '/activity#basics');
  page.setStored(null);
  page.show();
  assert.equal(page.nodes['#resume-panel'].hidden, true);
  page.setStored('stories');
  page.show();
  assert.equal(page.nodes['#resume-panel'].hidden, false);
  assert.equal(page.nodes['#continue-activity'].href, '/activity#stories');
});

test('old guide bookmarks still redirect only to known local activity sections', () => {
  for (const section of ['start-here', 'search', 'search-input', 'gods', 'basics', 'worlds', 'stories', 'play', 'account']) {
    assert.deepEqual(fixture({ hash: `#${section}` }).replacements, [`/activity#${section}`]);
  }
  for (const hash of ['', '#unknown', '#__proto__', '#https://example.com', '#%73earch', '#search?other=1']) {
    assert.deepEqual(fixture({ hash }).replacements, []);
  }
  const page = fixture();
  page.changeHash('#stories');
  assert.deepEqual(page.replacements, ['/activity#stories']);
  page.changeHash('#unknown');
  assert.deepEqual(page.replacements, ['/activity#stories']);
});
