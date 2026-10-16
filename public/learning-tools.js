import { comparisons, glossary } from './discovery-content.js';

function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function learningPanel(title, description) {
  const panel = element('details', 'learning-panel');
  const summary = element('summary', 'learning-summary');
  const copy = element('span', 'learning-summary-copy');
  copy.append(
    element('span', 'learning-title', title),
    element('span', 'learning-description', description),
  );
  const indicator = element('span', 'learning-indicator', '+');
  indicator.setAttribute('aria-hidden', 'true');
  summary.append(copy, indicator);
  panel.append(summary);
  return panel;
}

function nameButton(name, tradition) {
  const button = element('button', 'name-link', name);
  button.type = 'button';
  button.dataset.search = name;
  button.setAttribute('aria-label', `Search for ${name}, ${tradition} mythology`);
  return button;
}

function sourceLink(title, url) {
  const note = element('p', 'learning-source');
  const link = element('a', '', title);
  link.href = url;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  note.append(link, document.createTextNode(' (opens in a new tab)'));
  return note;
}

function mountComparison(root) {
  const panel = learningPanel('Greek and Roman names', 'Two names to know, one shared theme.');
  const body = element('div', 'learning-body');
  body.append(element('p', 'learning-note', 'Greek and Roman traditions often connected their gods. These are common pairings, but their stories, roles, and worship were not always the same. Tap a name to learn more.'));
  const grid = element('div', 'comparison-grid');
  for (const pair of comparisons) {
    const card = element('div', 'comparison-card');
    const names = element('div', 'comparison-names');
    for (const [tradition, name] of [['Greek', pair.greek], ['Roman', pair.roman]]) {
      const nameGroup = element('div', 'comparison-name');
      nameGroup.append(element('span', 'comparison-label', tradition), nameButton(name, tradition));
      names.append(nameGroup);
    }
    card.append(names, element('p', 'comparison-domain', pair.domain));
    grid.append(card);
  }
  body.append(grid);
  body.append(sourceLink('Read more: The Met’s guide to Roman art', 'https://www.metmuseum.org/zh/-/media/files/learn/for-educators/publications-for-educators/roman.pdf'));
  panel.append(body);
  root.replaceChildren(panel);
}

function searchableText(value) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase().trim();
}

function mountGlossary(root) {
  const panel = learningPanel('Mythology word guide', 'Clear meanings for words you meet along the way.');
  const body = element('div', 'learning-body');
  const field = element('div', 'glossary-search');
  const label = element('label', '', 'Find a word or idea');
  label.htmlFor = 'glossary-filter';
  const input = element('input');
  input.id = 'glossary-filter';
  input.type = 'search';
  input.placeholder = 'Try “hero” or “nature”';
  input.autocomplete = 'off';
  input.setAttribute('aria-controls', 'glossary-definitions');
  const count = element('p', 'glossary-count');
  count.setAttribute('role', 'status');
  const definitions = element('dl', 'glossary-list');
  definitions.id = 'glossary-definitions';
  const empty = element('p', 'glossary-empty', 'No matching words yet. Try another word or clear your search to see every definition.');
  empty.hidden = true;
  field.append(label, input);
  body.append(field, count, definitions, empty);
  body.append(sourceLink('Read more: Greek gods and religious practices at The Met', 'https://www.metmuseum.org/essays/greek-gods-and-religious-practices'));
  panel.append(body);
  root.replaceChildren(panel);

  function renderDefinitions() {
    const query = searchableText(input.value);
    const matches = glossary.filter(({ term, definition }) => searchableText(`${term} ${definition}`).includes(query));
    definitions.replaceChildren();
    for (const { term, definition } of matches) {
      const item = element('div', 'glossary-entry');
      item.append(element('dt', '', term), element('dd', '', definition));
      definitions.append(item);
    }
    count.textContent = `${matches.length} of ${glossary.length} words${query ? ' match your search' : ' in the guide'}.`;
    definitions.hidden = matches.length === 0;
    empty.hidden = matches.length !== 0;
  }

  input.addEventListener('input', renderDefinitions);
  renderDefinitions();
}

export function mountLearningTools({ comparisonRoot, glossaryRoot }) {
  if (comparisonRoot) mountComparison(comparisonRoot);
  if (glossaryRoot) mountGlossary(glossaryRoot);
}
