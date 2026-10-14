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
  if (results.getBoundingClientRect().top < window.innerHeight - 96) return;
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
    status.textContent = 'Enter a god’s name to start your discovery.';
    showFeedback('A name opens a world.', 'Try Zeus, Athena, or Neptune in the search box above.');
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
      showFeedback('A little mystery remains.', 'That name isn’t in our sample collection yet. Check the spelling, try part of the name, or search for Zeus, Athena, or Neptune.');
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

document.querySelectorAll('[data-search]').forEach((example) => {
  example.addEventListener('click', () => {
    input.value = example.dataset.search;
    search();
  });
});

input.addEventListener('input', () => input.removeAttribute('aria-invalid'));
