const themes = {
  'athenas-gift': ['Wisdom', 'Useful gifts'],
  'hermes-and-the-lyre': ['Music', 'Creative thinking'],
  'persephones-return': ['Seasons', 'Family'],
  'orpheus-looks-back': ['Love', 'Trust'],
  'an-open-door': ['Kindness', 'Hospitality'],
  'psyches-last-task': ['Love', 'Curiosity'],
  'ares-bronze-jar': ['Courage', 'Asking for help'],
  'mars-anna-perenna': ['Respect', 'Choices'],
  'asclepius-healing': ['Healing', 'Limits'],
  'heracles-alcestis': ['Courage', 'Hospitality'],
  'morpheus-message': ['Dreams', 'Loss'],
  'venus-shield': ['Protection', 'Craftsmanship'],
};

export function storyThemesFor(story) {
  return [...(themes[story?.id] || [])];
}

function normalize(value) {
  return String(value || '').normalize('NFD').replace(/\p{M}/gu, '').toLowerCase()
    .replace(/['’]/g, '').replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
}

// Search the retellings already on this page; no query or reading choice is saved.
export function filterStories(stories, query = '', tradition = 'all') {
  const words = normalize(query).split(' ').filter(Boolean);
  return stories.filter((story) => {
    if (['Greek', 'Roman'].includes(tradition) && story.tradition !== tradition) return false;
    const text = normalize([story.title, story.summary, ...(story.relatedGods || []),
      ...storyThemesFor(story), ...(story.paragraphs || [])].join(' '));
    return words.every((word) => text.includes(word));
  });
}
