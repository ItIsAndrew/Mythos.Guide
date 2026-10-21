const activitySections = new Map([
  ['start-here', ['start-here']], ['search', ['search', 'discovery']], ['search-input', ['search', 'discovery']],
  ['gods', ['gods']], ['basics', ['basics']], ['worlds', ['worlds']],
  ['stories', ['stories']], ['play', ['play']], ['account', ['account']],
]);
const activityNodes = new Map([...document.querySelector('main').children]
  .filter((node) => node.tagName === 'SECTION')
  .map((node) => [node.id || (node.classList.contains('discovery') ? 'discovery' : ''), node]));
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
  for (const link of document.querySelectorAll('.site-nav a, .phone-menu-links a')) {
    if (link.hash) link.setAttribute('aria-current', link.hash.slice(1) === key ? 'page' : 'false');
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
