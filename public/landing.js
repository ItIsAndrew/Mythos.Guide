// Existing links to guide sections should still reach the same activity.
const guideSections = new Set(['start-here', 'search', 'search-input', 'gods', 'basics', 'worlds', 'stories', 'play', 'account']);
function forwardGuideSection() {
  const section = window.location.hash.slice(1);
  if (guideSections.has(section)) window.location.replace(`/activity#${section}`);
}
forwardGuideSection();
window.addEventListener('hashchange', forwardGuideSection);
