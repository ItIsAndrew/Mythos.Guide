import { worlds, stories } from './learn-content.js';
import { mountQuiz } from './quiz.js';
import { familyFactsFor } from './family-facts.js';
import { topics, filterGodsByTopic, chooseRandomGod, suggestionsFor } from './discovery-content.js';
import { mountLearningTools } from './learning-tools.js';

const form = document.querySelector('#search-form');
const input = document.querySelector('#search-input');
const results = document.querySelector('#results');
const status = document.querySelector('#search-status');
const button = document.querySelector('#search-button');
const buttonLabel = document.querySelector('#search-button-label');
const discovery = document.querySelector('.discovery');

let activeRequest;
let searchNumber = 0;

function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function readable(value) {
  return Array.isArray(value) ? value.join(', ') : String(value || '');
}

function createReferences(sources, versionNote) {
  const references = Array.isArray(sources) ? sources.filter((source) => source?.title && /^https:\/\//.test(source.url)) : [];
  if (!references.length) return null;
  const panel = element('details', 'reference-panel');
  panel.append(element('summary', '', 'Sources & myth versions'));
  if (versionNote) panel.append(element('p', 'reference-note', versionNote));
  const list = element('ul', 'reference-list');
  for (const source of references) {
    const item = element('li');
    const link = element('a', '', source.title);
    link.href = source.url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.setAttribute('aria-label', `${source.title} (opens in a new tab)`);
    item.append(link);
    list.append(item);
  }
  panel.append(list, element('p', 'reference-hint', 'Reference links open in a new tab.'));
  return panel;
}

function showFeedback(title, message, isError = false) {
  const panel = element('div', `feedback-state${isError ? ' is-error' : ''}`);
  panel.append(element('h3', '', title), element('p', '', message));
  results.replaceChildren(panel);
}

function showLoading() {
  const panel = element('div', 'loading-state');
  const spinner = element('span', 'loading-spinner');
  spinner.setAttribute('aria-hidden', 'true');
  panel.append(spinner, element('span', '', 'Looking through the ancient world…'));
  results.replaceChildren(panel);
}

function revealDiscovery() {
  const resultTop = results.getBoundingClientRect().top;
  if (resultTop >= 0 && resultTop < window.innerHeight - 96) return;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  discovery.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' });
}

function renderResults(gods) {
  const cards = gods.map((god, index) => {
    const card = element('article', 'result-card');
    const main = element('div', 'result-main');
    const heading = element('div', 'result-heading');
    heading.append(
      element('span', 'result-number', String(index + 1).padStart(2, '0')),
      element('span', '', `${readable(god.tradition)} mythology`),
    );
    main.append(heading, element('h3', '', readable(god.name)), element('p', 'result-description', readable(god.description)));
    if (familyFactsFor(god.id)) {
      const more = element('button', 'fact-open-button', 'Family & more facts');
      more.type = 'button';
      more.setAttribute('aria-label', `Family and more facts about ${readable(god.name)}`);
      more.addEventListener('click', () => openGod(god, more));
      main.append(more);
    }
    const references = createReferences(god.sources, god.versionNote);
    if (references) main.append(references);
    main.append(createExploreNext(god));
    const details = element('dl', 'result-details');
    const otherTradition = god.tradition === 'Greek' ? 'Roman' : 'Greek';
    for (const [label, value] of [
      ['Known for', god.domain],
      ['Symbols', god.symbols],
      [`${otherTradition} counterpart`, god.equivalent],
    ]) {
      if (!readable(value)) continue;
      const group = element('div', 'result-detail');
      group.append(element('dt', '', label), element('dd', '', readable(value)));
      details.append(group);
    }
    card.append(main);
    if (details.childElementCount) card.append(details);
    return card;
  });
  results.replaceChildren(...cards);
}

async function search() {
  const query = input.value.trim();
  activeRequest?.abort();
  const currentSearch = ++searchNumber;

  if (!query) {
    input.setAttribute('aria-invalid', 'true');
    status.textContent = 'Enter a mythological name to start your discovery.';
    showFeedback('A name opens a world.', 'Try Zeus, Athena, or Morpheus in the search box above.');
    results.setAttribute('aria-busy', 'false');
    button.removeAttribute('aria-busy');
    buttonLabel.textContent = 'Search';
    input.focus();
    return;
  }

  input.removeAttribute('aria-invalid');
  activeRequest = new AbortController();
  results.setAttribute('aria-busy', 'true');
  button.setAttribute('aria-busy', 'true');
  buttonLabel.textContent = 'Finding';
  status.textContent = `Searching for “${query}”…`;
  showLoading();

  try {
    const response = await fetch(`/api/gods?q=${encodeURIComponent(query)}`, {
      signal: activeRequest.signal,
      headers: { Accept: 'application/json' },
    });
    const data = await response.json();
    if (currentSearch !== searchNumber) return;
    if (!response.ok || !Array.isArray(data.results)) throw new Error('Search unavailable');

    if (data.results.length === 0) {
      status.textContent = `No matches for “${query}”.`;
      showFeedback('A little mystery remains.', 'That name isn’t in our sample collection yet. Check the spelling, try part of the name, or search for Zeus, Athena, or Morpheus.');
    } else {
      renderResults(data.results);
      status.textContent = `${data.results.length} ${data.results.length === 1 ? 'discovery' : 'discoveries'} for “${query}”.`;
    }
  } catch (error) {
    if (error.name === 'AbortError' || currentSearch !== searchNumber) return;
    status.textContent = 'The search couldn’t be completed.';
    showFeedback('The archive is taking a moment.', 'We couldn’t load the results. Please try your search again in a moment.', true);
  } finally {
    if (currentSearch === searchNumber) {
      results.setAttribute('aria-busy', 'false');
      button.removeAttribute('aria-busy');
      buttonLabel.textContent = 'Search';
      revealDiscovery();
    }
  }
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  search();
});

document.addEventListener('click', (event) => {
  const example = event.target.closest('[data-search]');
  if (!example) return;
  if (dialog.open) {
    dialogOpener = input;
    dialog.close();
  }
  input.value = example.dataset.search;
  input.focus({ preventScroll: true });
  search();
});

input.addEventListener('input', () => input.removeAttribute('aria-invalid'));

// A single native dialog keeps details and story reading accessible by keyboard.
const dialog = document.querySelector('#detail-dialog');
const dialogContent = document.querySelector('#dialog-content');
let dialogOpener;

document.querySelector('#dialog-close').addEventListener('click', () => dialog.close());
dialog.addEventListener('close', () => {
  document.body.classList.remove('dialog-open');
  dialogOpener?.focus({ preventScroll: true });
});
dialog.addEventListener('click', (event) => {
  if (event.target !== dialog) return;
  const bounds = dialog.getBoundingClientRect();
  if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
});

function openDialog(content, opener) {
  const alreadyOpen = dialog.open;
  dialogOpener = opener || document.activeElement;
  dialogContent.replaceChildren(content);
  document.body.classList.add('dialog-open');
  if (!alreadyOpen) dialog.showModal();
  else document.querySelector('#dialog-close').focus({ preventScroll: true });
  dialog.scrollTop = 0;
}

function createSearchButton(name) {
  const link = element('button', 'name-link', name);
  link.type = 'button';
  link.dataset.search = name;
  link.setAttribute('aria-label', `Search for ${name}`);
  return link;
}

function relatedNames(names, label = 'Explore these gods') {
  const related = element('div', 'related-gods');
  related.append(element('p', 'detail-label', label));
  const buttons = element('div', 'name-links');
  names.forEach((name) => buttons.append(createSearchButton(name)));
  related.append(buttons);
  return related;
}

function createExploreNext(god) {
  const next = suggestionsFor(god, worlds, stories);
  const section = element('details', 'explore-next');
  section.append(element('summary', '', 'What can I explore next?'));
  section.append(element('p', '', next.stories.length || next.worlds.length
    ? 'Choose a related story, place, or theme. A shared theme does not mean this god appears in every story.'
    : 'Continue with other gods connected with this theme.'));
  const actions = element('div', 'explore-next-actions');
  next.stories.forEach((story) => {
    const read = element('button', 'name-link', `Read ${story.title}`);
    read.type = 'button';
    read.addEventListener('click', () => openStory(story, dialog.open ? dialogOpener : read));
    actions.append(read);
  });
  next.worlds.forEach((world) => {
    const visit = element('button', 'name-link', `Visit ${world.name}`);
    visit.type = 'button';
    visit.addEventListener('click', () => {
      const index = worlds.findIndex((item) => item.id === world.id);
      const tab = worldTabs.children[index];
      if (dialog.open) {
        dialogOpener = tab;
        dialog.close();
      }
      selectWorld(index, true);
      document.querySelector('#worlds').scrollIntoView({ block: 'start', behavior: 'auto' });
    });
    actions.append(visit);
  });
  const topic = topics.find((item) => item.id === next.topicId && item.id !== 'all');
  if (topic) {
    const explore = element('button', 'name-link', `Explore more: ${topic.label}`);
    explore.type = 'button';
    explore.addEventListener('click', async () => {
      const heading = document.querySelector('#gods-title');
      if (dialog.open) {
        dialogOpener = heading;
        dialog.close();
      }
      currentTopic = topic.id;
      topicSelect.value = topic.id;
      await loadBrowse('all');
      heading.focus({ preventScroll: true });
      document.querySelector('#gods').scrollIntoView({ block: 'start', behavior: 'auto' });
    });
    actions.append(explore);
  }
  if (!actions.childElementCount) {
    const browseStories = element('a', 'name-link', 'Browse the stories');
    browseStories.href = '#stories';
    browseStories.addEventListener('click', () => {
      if (dialog.open) {
        dialogOpener = document.querySelector('#story-grid button') || dialogOpener;
        dialog.close();
      }
    });
    actions.append(browseStories);
  }
  section.append(actions);
  return section;
}

function openGod(god, opener) {
  const content = element('article', 'god-detail');
  content.append(element('p', 'dialog-eyebrow', `${readable(god.tradition)} mythology`));
  const title = element('h2', '', readable(god.name));
  title.id = 'dialog-title';
  content.append(title, element('p', 'dialog-lead', readable(god.description)));
  const facts = element('dl', 'god-facts');
  const otherTradition = god.tradition === 'Greek' ? 'Roman' : 'Greek';
  for (const [label, value] of [
    ['Known for', god.domain], ['Symbols', god.symbols], [`${otherTradition} counterpart`, god.equivalent],
  ]) {
    if (!readable(value)) continue;
    const item = element('div', 'god-fact');
    item.append(element('dt', 'detail-label', label), element('dd', '', readable(value)));
    facts.append(item);
  }
  content.append(facts);
  const family = familyFactsFor(god.id);
  if (family) {
    const section = element('section', 'family-section');
    section.append(element('h3', '', 'Family & more facts'));
    const relationships = element('dl', 'family-relationships');
    for (const [label, value] of [
      ['Parents', family.parents], ['Partner', family.partner],
      ['Children', family.children], ['Siblings', family.sibling],
    ]) {
      if (!value) continue;
      const item = element('div', 'family-relationship');
      item.append(element('dt', '', label), element('dd', '', value));
      relationships.append(item);
    }
    section.append(relationships);
    if (family.note) section.append(element('p', 'family-note', family.note));
    const sourceLink = element('a', 'family-source', 'Read the source ↗');
    sourceLink.href = family.source;
    sourceLink.target = '_blank';
    sourceLink.rel = 'noopener noreferrer';
    section.append(sourceLink);
    content.append(section);
  }
  const references = createReferences(god.sources, god.versionNote);
  if (references) content.append(references);
  content.append(createExploreNext(god));
  const another = element('button', 'random-button', 'Meet another random god');
  another.type = 'button';
  another.addEventListener('click', () => discoverRandom(god.id, dialogOpener));
  content.append(another, element('p', 'collection-note', 'Myths have many versions. This is an educational sample description, not a single definitive account.'));
  openDialog(content, opener);
}

// Cache public records for this page visit; MongoDB remains behind /api/gods.
let archivePromise;
function getArchive() {
  if (!archivePromise) {
    archivePromise = fetch('/api/gods?mode=browse&tradition=all', { headers: { Accept: 'application/json' } })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok || !Array.isArray(data.results)) throw new Error('Collection unavailable');
        return data.results;
      }).catch((error) => {
        archivePromise = null;
        throw error;
      });
  }
  return archivePromise;
}

const randomButton = document.querySelector('#random-god');
const randomStatus = document.querySelector('#random-status');
let previousRandomId;
let randomBusy = false;
async function discoverRandom(excludeId = previousRandomId, opener = randomButton) {
  if (randomBusy) return;
  randomBusy = true;
  randomButton.disabled = true;
  randomButton.setAttribute('aria-busy', 'true');
  randomStatus.textContent = 'Choosing a god from the collection…';
  try {
    const god = chooseRandomGod(await getArchive(), excludeId);
    if (!god) throw new Error('Collection empty');
    previousRandomId = god.id;
    randomStatus.textContent = `Meet ${god.name} from ${god.tradition} mythology.`;
    openGod(god, opener);
  } catch {
    randomStatus.textContent = 'The collection couldn’t be loaded. Please try the random button again.';
  } finally {
    randomBusy = false;
    randomButton.disabled = false;
    randomButton.removeAttribute('aria-busy');
  }
}
randomButton.addEventListener('click', () => discoverRandom());

const browseResults = document.querySelector('#browse-results');
const browseStatus = document.querySelector('#browse-status');
const browseMore = document.querySelector('#browse-more');
const browseLess = document.querySelector('#browse-less');
const topicSelect = document.querySelector('#god-topic');
topics.forEach((topic) => {
  const option = element('option', '', topic.label);
  option.value = topic.id;
  if (topic.id === 'all') topicSelect.replaceChildren(option);
  else topicSelect.append(option);
});
const traditionButtons = Array.from(document.querySelectorAll('[data-tradition]'));
const browsePageSize = 12;
let browseGods = [];
let visibleGods = browsePageSize;
let currentTradition = 'all';
let currentTopic = 'all';
let browseNumber = 0;

function renderBrowse() {
  const matchingGods = filterGodsByTopic(browseGods, currentTopic);
  const cards = matchingGods.slice(0, visibleGods).map((god, index) => {
    const card = element('button', 'god-card');
    card.type = 'button';
    card.setAttribute('aria-label', `Read about ${readable(god.name)}, ${readable(god.tradition)} mythology`);
    const top = element('span', 'god-card-top');
    top.append(element('span', 'god-tradition', readable(god.tradition)), element('span', 'god-index', String(index + 1).padStart(2, '0')));
    card.append(top, element('span', 'god-card-title', readable(god.name)), element('span', 'god-card-domain', readable(god.domain)), element('span', 'god-card-description', readable(god.description)));
    const action = element('span', 'card-action', familyFactsFor(god.id) ? 'Family & more facts' : 'Meet this god');
    const arrow = element('span', '', '↗');
    arrow.setAttribute('aria-hidden', 'true');
    action.append(arrow);
    card.append(action);
    card.addEventListener('click', () => openGod(god, card));
    return card;
  });
  browseResults.replaceChildren(...cards);
  const shown = Math.min(visibleGods, matchingGods.length);
  const traditionLabel = currentTradition === 'all' ? '' : `${currentTradition} `;
  const topicLabel = currentTopic === 'all' ? 'in the collection' : `· ${topics.find((topic) => topic.id === currentTopic).label}`;
  browseStatus.textContent = `${shown} of ${matchingGods.length} ${traditionLabel}gods ${topicLabel}`;
  browseMore.hidden = shown >= matchingGods.length;
  browseLess.hidden = shown <= browsePageSize;
  if (!browseMore.hidden) browseMore.firstChild.textContent = `Show ${Math.min(browsePageSize, matchingGods.length - shown)} more gods `;
  if (!matchingGods.length) {
    const empty = element('div', 'feedback-state browse-feedback');
    empty.append(element('h3', '', 'Try another part of the collection.'), element('p', '', 'No gods match this combination of tradition and topic.'));
    const reset = element('button', 'outline-button', 'Clear filters');
    reset.type = 'button';
    reset.addEventListener('click', () => {
      currentTopic = 'all';
      topicSelect.value = 'all';
      loadBrowse('all');
    });
    empty.append(reset);
    browseResults.replaceChildren(empty);
  }
}

async function loadBrowse(tradition = currentTradition) {
  const requestNumber = ++browseNumber;
  currentTradition = tradition;
  traditionButtons.forEach((filter) => filter.setAttribute('aria-pressed', String(filter.dataset.tradition === tradition)));
  topicSelect.disabled = true;
  browseResults.setAttribute('aria-busy', 'true');
  browseStatus.textContent = 'Opening the collection…';
  browseMore.hidden = true;
  browseLess.hidden = true;
  const loading = element('div', 'loading-state browse-feedback');
  const spinner = element('span', 'loading-spinner');
  spinner.setAttribute('aria-hidden', 'true');
  loading.append(spinner, element('span', '', 'Gathering the gods and goddesses…'));
  browseResults.replaceChildren(loading);
  try {
    const records = await getArchive();
    if (requestNumber !== browseNumber) return;
    browseGods = records.filter((god) => tradition === 'all' || god.tradition === tradition);
    visibleGods = browsePageSize;
    if (browseGods.length) {
      renderBrowse();
    } else {
      browseStatus.textContent = 'No gods in this part of the collection yet.';
      const empty = element('div', 'feedback-state browse-feedback');
      empty.append(element('h3', '', 'A new discovery is still to come.'), element('p', '', 'Choose another tradition to explore the collection.'));
      browseResults.replaceChildren(empty);
    }
  } catch (error) {
    if (error.name === 'AbortError' || requestNumber !== browseNumber) return;
    browseStatus.textContent = 'The collection couldn’t be loaded.';
    const feedback = element('div', 'feedback-state is-error browse-feedback');
    feedback.append(element('h3', '', 'The archive is taking a moment.'), element('p', '', 'Please try loading the collection again.'));
    const retry = element('button', 'outline-button', 'Try again');
    retry.type = 'button';
    retry.addEventListener('click', () => loadBrowse());
    feedback.append(retry);
    browseResults.replaceChildren(feedback);
  } finally {
    if (requestNumber === browseNumber) {
      browseResults.setAttribute('aria-busy', 'false');
      topicSelect.disabled = !browseGods.length;
    }
  }
}

traditionButtons.forEach((filter) => filter.addEventListener('click', () => loadBrowse(filter.dataset.tradition)));
topicSelect.addEventListener('change', () => {
  currentTopic = topicSelect.value;
  visibleGods = browsePageSize;
  renderBrowse();
});
browseMore.addEventListener('click', () => {
  const firstNewIndex = Math.min(visibleGods, filterGodsByTopic(browseGods, currentTopic).length);
  visibleGods += browsePageSize;
  renderBrowse();
  browseResults.children[firstNewIndex]?.focus({ preventScroll: true });
});
browseLess.addEventListener('click', () => {
  visibleGods = browsePageSize;
  renderBrowse();
  browseMore.focus();
});

const worldTabs = document.querySelector('#world-tabs');
const worldPanel = document.querySelector('#world-panel');
const realmSymbols = ['☼', '≋', '☾', '⌂', '⚕', '◇'];

function selectWorld(index, moveFocus = false) {
  const world = worlds[index];
  Array.from(worldTabs.children).forEach((tab, tabIndex) => {
    tab.setAttribute('aria-selected', String(index === tabIndex));
    tab.tabIndex = index === tabIndex ? 0 : -1;
  });
  worldPanel.setAttribute('aria-labelledby', `world-tab-${world.id}`);
  const introduction = element('div', 'world-introduction');
  introduction.append(element('p', 'dialog-eyebrow', world.eyebrow), element('h3', '', world.name), element('p', 'world-description', world.description));
  const symbol = element('span', 'world-emblem', realmSymbols[index] || '✦');
  symbol.setAttribute('aria-hidden', 'true');
  introduction.append(symbol);
  const detailGrid = element('div', 'world-details');
  world.details.forEach((detail) => {
    const item = element('div', 'world-detail');
    item.append(element('h4', '', detail.title), element('p', '', detail.text));
    detailGrid.append(item);
  });
  worldPanel.replaceChildren(introduction, detailGrid, relatedNames(world.gods, 'Meet a few of the gods connected with this world'));
  const references = createReferences(world.sources, world.versionNote);
  if (references) worldPanel.append(references);
  if (moveFocus) worldTabs.children[index].focus();
}

worlds.forEach((world, index) => {
  const tab = element('button', 'world-tab');
  tab.id = `world-tab-${world.id}`;
  tab.type = 'button';
  tab.setAttribute('role', 'tab');
  tab.setAttribute('aria-controls', 'world-panel');
  tab.setAttribute('aria-selected', String(index === 0));
  tab.tabIndex = index === 0 ? 0 : -1;
  const symbol = element('span', 'world-tab-symbol', realmSymbols[index] || '✦');
  symbol.setAttribute('aria-hidden', 'true');
  tab.append(symbol, element('span', '', world.name));
  tab.addEventListener('click', () => selectWorld(index));
  tab.addEventListener('keydown', (event) => {
    let next;
    if (event.key === 'ArrowRight') next = (index + 1) % worlds.length;
    if (event.key === 'ArrowLeft') next = (index - 1 + worlds.length) % worlds.length;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = worlds.length - 1;
    if (next === undefined) return;
    event.preventDefault();
    selectWorld(next, true);
  });
  worldTabs.append(tab);
});
if (worlds.length) selectWorld(0);

function openStory(story, opener) {
  const reader = element('article', 'story-reader');
  reader.append(element('p', 'dialog-eyebrow', `${story.tradition} tradition · ${story.readingTime}`));
  const title = element('h2', '', story.title);
  title.id = 'dialog-title';
  reader.append(title, element('p', 'story-reader-summary', story.summary));
  const prose = element('div', 'story-prose');
  story.paragraphs.forEach((paragraph) => prose.append(element('p', '', paragraph)));
  reader.append(prose);
  if (story.note || story.versionNote) reader.append(element('p', 'story-source-note', story.versionNote || story.note));
  if (story.source?.url) {
    const sourceNote = element('p', 'story-source-note', 'Read more: ');
    const sourceLink = element('a', '', story.source.title);
    sourceLink.href = story.source.url;
    sourceLink.target = '_blank';
    sourceLink.rel = 'noopener noreferrer';
    sourceNote.append(sourceLink, document.createTextNode(' (opens in a new tab)'));
    reader.append(sourceNote);
  }
  const furtherReferences = createReferences((story.sources || []).filter((source) => source.url !== story.source?.url));
  if (furtherReferences) reader.append(furtherReferences);
  reader.append(relatedNames(story.relatedGods));
  reader.append(element('p', 'collection-note', 'An original educational sample retelling. Ancient accounts and interpretations vary.'));
  openDialog(reader, opener);
}

const storyGrid = document.querySelector('#story-grid');
const storyMore = document.querySelector('#stories-more');
const storyLess = document.querySelector('#stories-less');
const storyStatus = document.querySelector('#stories-status');
const storyPageSize = 6;
let visibleStories = storyPageSize;

function createStoryCard(story, index) {
  const card = element('article', 'story-card');
  const top = element('div', 'story-card-top');
  const number = element('span', 'story-number', String(index + 1).padStart(2, '0'));
  number.setAttribute('aria-hidden', 'true');
  top.append(element('span', 'god-tradition', `${story.tradition} tradition`), number);
  const title = element('h3', '', story.title);
  card.append(top, title, element('p', 'story-summary', story.summary));
  const bottom = element('div', 'story-card-bottom');
  bottom.append(element('span', 'story-time', story.readingTime));
  const read = element('button', 'text-button', 'Read the story');
  read.type = 'button';
  read.setAttribute('aria-label', `Read ${story.title}`);
  const arrow = element('span', '', '↗');
  arrow.setAttribute('aria-hidden', 'true');
  read.append(arrow);
  read.addEventListener('click', () => openStory(story, read));
  bottom.append(read);
  card.append(bottom);
  return card;
}

function renderStories() {
  storyGrid.replaceChildren(...stories.slice(0, visibleStories).map(createStoryCard));
  const shown = Math.min(visibleStories, stories.length);
  storyStatus.textContent = `${shown} of ${stories.length} stories`;
  storyMore.hidden = shown >= stories.length;
  storyLess.hidden = shown <= storyPageSize;
  if (!storyMore.hidden) storyMore.textContent = `Show ${Math.min(storyPageSize, stories.length - shown)} more stories`;
}
storyMore.addEventListener('click', () => {
  const firstNew = visibleStories;
  visibleStories += storyPageSize;
  renderStories();
  const card = storyGrid.children[firstNew];
  card?.scrollIntoView({ block: 'start', behavior: 'auto' });
  card?.querySelector('button')?.focus({ preventScroll: true });
});
storyLess.addEventListener('click', () => {
  visibleStories = storyPageSize;
  renderStories();
  storyMore.focus();
});
renderStories();

mountQuiz(document.querySelector('#quiz-root'));
mountLearningTools({ comparisonRoot: document.querySelector('#name-comparison'), glossaryRoot: document.querySelector('#myth-glossary') });

document.querySelectorAll('.phone-nav a').forEach((link) => {
  link.addEventListener('click', () => {
    document.querySelector('.phone-menu').open = false;
  });
});
loadBrowse();
