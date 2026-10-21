// Older bookmarks to a guide section still open that activity directly.
const sections = new Set(['start-here', 'search', 'search-input', 'gods', 'basics', 'worlds', 'stories', 'play', 'account']);
function openOldBookmark() {
  const section = window.location.hash.slice(1);
  if (sections.has(section)) window.location.replace(`/activity#${section}`);
}
openOldBookmark();
window.addEventListener('hashchange', openOldBookmark);
