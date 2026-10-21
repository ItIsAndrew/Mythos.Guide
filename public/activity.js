const activitySections = new Map([
  ['start-here', ['start-here']], ['search', ['search', 'discovery']], ['search-input', ['search', 'discovery']],
  ['gods', ['gods']], ['basics', ['basics']], ['worlds', ['worlds']],
  ['stories', ['stories']], ['play', ['play']], ['account', ['account']],
]);
const activityNodes = new Map([...document.querySelector('main').children]
  .filter((node) => node.tagName === 'SECTION')
  .map((node) => [node.id || (node.classList.contains('discovery') ? 'discovery' : ''), node]));
const nextActivity = {
  'start-here': ['search', 'Find a god', 'Pick a name and begin your discovery.', 'Find a god'],
  search: ['stories', 'Read the myths', 'Choose a short story and see the gods in action.', 'Go to stories'],
  gods: ['worlds', 'Explore their worlds', 'Visit a place connected to the gods.', 'Explore places'],
  worlds: ['stories', 'Read the myths', 'Follow a story set in this world.', 'Go to stories'],
  stories: ['play', 'Try a quiz', 'See what you remember from the myths.', 'Try a quiz'],
  basics: ['search', 'Find a god', 'Use a name you learned to discover more.', 'Find a god'],
  play: ['basics', 'Names & words', 'Learn a little more before your next round.', 'Learn the words'],
  account: ['stories', 'Read the myths', 'Find a story to write about in your private notes.', 'Go to stories'],
};
let accountModuleRequested = false;
function loadAccountWhenOpened() {
  if (accountModuleRequested) return;
  accountModuleRequested = true;
  const script = document.createElement('script');
  script.type = 'module';
  script.src = '/accounts.js';
  script.addEventListener('error', () => {
    document.querySelector('#account-status').textContent = 'Account tools could not load. Reload the page to try again.';
  }, { once: true });
  document.head.append(script);
}
for (const [id, node] of activityNodes) {
  if (id === 'discovery') continue;
  const back = document.createElement('a');
  back.className = 'activity-back';
  back.href = '/guide';
  back.textContent = '← All activities';
  node.prepend(back);
}

function showActivity(name, scroll = true) {
  const key = name === 'search-input' ? 'search' : activitySections.has(name) ? name : 'search';
  if (key !== 'start-here') {
    try { window.localStorage.setItem('mythos-guide:last-activity', key); } catch { /* Browsing still works without storage. */ }
  }
  const visible = new Set(activitySections.get(key));
  for (const [id, node] of activityNodes) node.hidden = !visible.has(id);
  if (key === 'account') loadAccountWhenOpened();
  const skipLink = document.querySelector('.skip-link');
  const activeSection = activityNodes.get(activitySections.get(key)[0]);
  if (skipLink && activeSection) {
    if (key === 'search') {
      skipLink.href = '#search-input';
      skipLink.textContent = 'Skip to search';
    } else {
      activeSection.tabIndex = -1;
      skipLink.href = `#${activeSection.id}`;
      skipLink.textContent = 'Skip to this activity';
    }
  }
  for (const link of document.querySelectorAll('.site-nav a, .phone-menu-links a')) {
    if (link.hash) link.setAttribute('aria-current', link.hash.slice(1) === key ? 'page' : 'false');
  }
  const [nextKey, nextTitle, nextCopy, nextLabel] = nextActivity[key];
  const nextLink = document.querySelector('#activity-next-link');
  if (nextLink) {
    nextLink.href = `#${nextKey}`;
    nextLink.firstChild.textContent = `${nextLabel} `;
    document.querySelector('#activity-next-title').textContent = nextTitle;
    document.querySelector('#activity-next-copy').textContent = nextCopy;
  }
  document.title = `${({ 'start-here': 'Start here', search: 'Find a god', gods: 'Meet the gods', basics: 'Names and words', worlds: 'Explore their worlds', stories: 'Read the myths', play: 'Try a quiz', account: 'My posts' })[key] || 'Discover'} — Mythos.Guide`;
  if (scroll) requestAnimationFrame(() => activityNodes.get(activitySections.get(key)[0])?.scrollIntoView({ block: 'start' }));
}

window.mythosOpenActivity = (name) => {
  if (window.location.hash !== `#${name}`) window.location.hash = name;
  showActivity(name);
};
showActivity(window.location.hash.slice(1), false);
window.addEventListener('hashchange', () => showActivity(window.location.hash.slice(1)));

// Deferred modules attach the real search handler before DOMContentLoaded.
// Keep shared search links useful without overriding a different activity.
window.addEventListener('DOMContentLoaded', () => {
  const section = window.location.hash.slice(1);
  if (section && !['search', 'search-input'].includes(section)) return;
  const queries = new URLSearchParams(window.location.search).getAll('q');
  if (queries.length !== 1) return;
  const query = queries[0].trim();
  if (!query || query.length > 80) return;
  const searchInput = document.querySelector('#search-input');
  const searchForm = document.querySelector('#search-form');
  if (!searchInput || !searchForm) return;
  searchInput.value = query;
  searchForm.requestSubmit();
}, { once: true });
