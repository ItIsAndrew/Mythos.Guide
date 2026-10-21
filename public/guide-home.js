// Older bookmarks to a guide section still open that activity directly.
const sections = new Set(['start-here', 'search', 'search-input', 'gods', 'basics', 'worlds', 'stories', 'play', 'account']);
function openOldBookmark() {
  const section = window.location.hash.slice(1);
  if (sections.has(section)) window.location.replace(`/activity#${section}`);
}
openOldBookmark();
window.addEventListener('hashchange', openOldBookmark);

const activityNames = {
  search: ['Find a god', 'Search for a name and follow the discoveries it opens.'],
  gods: ['Meet the gods', 'Browse figures by tradition or topic.'],
  stories: ['Read the myths', 'Choose a short Greek or Roman story.'],
  worlds: ['Explore their worlds', 'Visit a place from the myths.'],
  play: ['Try a quiz', 'Choose a difficulty and answer five questions.'],
  basics: ['Names & words', 'Compare names and look up mythology terms.'],
  account: ['My posts', 'Open your own private mythology notes.'],
};
const suggestions = { search: 'stories', gods: 'worlds', stories: 'play', worlds: 'gods', play: 'basics', basics: 'search', account: 'stories' };
let lastActivity;
try { lastActivity = window.localStorage.getItem('mythos-guide:last-activity'); } catch { /* Storage may be unavailable. */ }
if (!Object.hasOwn(activityNames, lastActivity)) lastActivity = null;

if (lastActivity) {
  const [title, copy] = activityNames[lastActivity];
  document.querySelector('#continue-activity').href = `/activity#${lastActivity}`;
  document.querySelector('#continue-title').textContent = title;
  document.querySelector('#continue-copy').textContent = copy;
} else {
  document.querySelector('#continue-activity .pick-label').textContent = 'A GOOD PLACE TO START';
  document.querySelector('#continue-activity .pick-action').firstChild.textContent = 'Start exploring ';
}

const suggestion = suggestions[lastActivity] || 'stories';
const [suggestedTitle, suggestedCopy] = activityNames[suggestion];
document.querySelector('#suggested-activity').href = `/activity#${suggestion}`;
document.querySelector('#suggested-title').textContent = suggestedTitle;
document.querySelector('#suggested-copy').textContent = suggestedCopy;
