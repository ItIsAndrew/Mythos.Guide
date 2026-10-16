import { worlds, stories } from './learn-content.js';
import { mountQuiz } from './quiz.js';
import { familyFactsFor } from './family-facts.js';

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
  dialogOpener = opener || document.activeElement;
  dialogContent.replaceChildren(content);
  document.body.classList.add('dialog-open');
  dialog.showModal();
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
  content.append(element('p', 'collection-note', 'Myths have many versions. This is an educational sample description, not a single definitive account.'));
  openDialog(content, opener);
}

const browseResults = document.querySelector('#browse-results');
const browseStatus = document.querySelector('#browse-status');
const browseMore = document.querySelector('#browse-more');
const browseLess = document.querySelector('#browse-less');
const traditionButtons = Array.from(document.querySelectorAll('[data-tradition]'));
const browsePageSize = 12;
let browseGods = [];
let visibleGods = browsePageSize;
let currentTradition = 'all';
let browseRequest;
let browseNumber = 0;

function renderBrowse() {
  const cards = browseGods.slice(0, visibleGods).map((god, index) => {
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
  const shown = Math.min(visibleGods, browseGods.length);
  const traditionLabel = currentTradition === 'all' ? '' : `${currentTradition} `;
  browseStatus.textContent = `${shown} of ${browseGods.length} ${traditionLabel}gods in the collection`;
  browseMore.hidden = shown >= browseGods.length;
  browseLess.hidden = shown <= browsePageSize;
  if (!browseMore.hidden) browseMore.firstChild.textContent = `Show ${Math.min(browsePageSize, browseGods.length - shown)} more gods `;
}

async function loadBrowse(tradition = currentTradition) {
  browseRequest?.abort();
  const requestNumber = ++browseNumber;
  currentTradition = tradition;
  traditionButtons.forEach((filter) => filter.setAttribute('aria-pressed', String(filter.dataset.tradition === tradition)));
  browseRequest = new AbortController();
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
    const response = await fetch(`/api/gods?mode=browse&tradition=${encodeURIComponent(tradition)}`, {
      signal: browseRequest.signal,
      headers: { Accept: 'application/json' },
    });
    const data = await response.json();
    if (requestNumber !== browseNumber) return;
    if (!response.ok || !Array.isArray(data.results)) throw new Error('Collection unavailable');
    browseGods = data.results;
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
    if (requestNumber === browseNumber) browseResults.setAttribute('aria-busy', 'false');
  }
}

traditionButtons.forEach((filter) => filter.addEventListener('click', () => loadBrowse(filter.dataset.tradition)));
browseMore.addEventListener('click', () => {
  const firstNewIndex = Math.min(visibleGods, browseGods.length);
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
const realmSymbols = ['☼', '≋', '☾', '⌂'];

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
  if (story.note) reader.append(element('p', 'story-source-note', story.note));
  if (story.source?.url) {
    const sourceNote = element('p', 'story-source-note', 'Read more: ');
    const sourceLink = element('a', '', story.source.title);
    sourceLink.href = story.source.url;
    sourceLink.target = '_blank';
    sourceLink.rel = 'noopener noreferrer';
    sourceNote.append(sourceLink, document.createTextNode(' (opens in a new tab)'));
    reader.append(sourceNote);
  }
  reader.append(relatedNames(story.relatedGods));
  reader.append(element('p', 'collection-note', 'An original educational sample retelling. Ancient accounts and interpretations vary.'));
  openDialog(reader, opener);
}

const storyGrid = document.querySelector('#story-grid');
stories.forEach((story, index) => {
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
  storyGrid.append(card);
});

mountQuiz(document.querySelector('#quiz-root'));

document.querySelectorAll('.phone-nav a').forEach((link) => {
  link.addEventListener('click', () => {
    document.querySelector('.phone-menu').open = false;
  });
});
loadBrowse();
