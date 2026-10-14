// Original educational sample writing. Myths have many versions; these short
// retellings are starting points, not a complete account of ancient beliefs.
export const worlds = [
  {
    id: 'olympus',
    name: 'Mount Olympus',
    eyebrow: 'Above the clouds · Greek tradition',
    description: 'Imagine a bright hall above the clouds: messengers arrive, music fills a feast, and even the gods disagree about what should happen next.',
    details: [
      { title: 'A home in the stories', text: 'Greek poets place the Olympian gods on Olympus. Their imagined divine home is connected with a real mountain, but its shining halls belong to myth.' },
      { title: 'A divine gathering', text: 'In familiar tales, Zeus calls councils, Hera defends her authority, and Apollo makes music. Gods share feasts of ambrosia and nectar rather than an ordinary human meal.' },
      { title: 'Look a little closer', text: 'The gods have extraordinary powers and very recognizable feelings: pride, care, jealousy, and loyalty. Their disagreements often set a story in motion.' },
    ],
    gods: ['Zeus', 'Hera', 'Apollo', 'Athena', 'Hermes'],
  },
  {
    id: 'sea',
    name: 'The sea kingdom',
    eyebrow: 'Beneath the waves · Greek & Roman traditions',
    description: 'Picture a journey from a quiet shore to a churning open sea. In myth, the water can offer a safe passage or become a powerful obstacle.',
    details: [
      { title: 'A powerful ruler', text: 'Poseidon governs the sea in Greek mythology. He is also linked with horses and earthquakes, so his power reaches beyond the water.' },
      { title: 'Travel and uncertainty', text: 'For a sailor inside a myth, a calm morning does not promise an easy voyage. Storms make the sea a place where plans can change in a moment.' },
      { title: 'Across traditions', text: 'Roman Neptune shares many of Poseidon’s familiar symbols, including the trident. Greek and Roman gods often overlap, but the traditions are not identical.' },
    ],
    gods: ['Poseidon', 'Neptune', 'Iris'],
  },
  {
    id: 'underworld',
    name: 'The underworld',
    eyebrow: 'Beyond the threshold · Greek tradition',
    description: 'Follow a torchlit path into a quiet realm of boundaries and difficult returns. These stories ask how people face separation, memory, and loss.',
    details: [
      { title: 'A realm of the dead', text: 'Hades rules the underworld; Persephone is its queen. Hades is not the same figure as Thanatos, who personifies death.' },
      { title: 'Guides and guardians', text: 'Hermes can guide souls across boundaries. Cerberus, the many-headed dog, is a famous guardian of the underworld’s entrance.' },
      { title: 'Journeys back', text: 'Persephone’s return and the journey of Orpheus show how important the boundary between the living and the dead is in Greek stories. Versions differ about its paths and rules.' },
    ],
    gods: ['Hades', 'Persephone', 'Hermes', 'Hecate', 'Thanatos'],
  },
  {
    id: 'roman-hearth',
    name: 'The Roman hearth',
    eyebrow: 'Fire & doorways · Roman tradition',
    description: 'Start with a doorway and the warmth of a shared fire. Roman divine life belongs to beginnings, households, and the community as well as grand adventures.',
    details: [
      { title: 'The center of home', text: 'Vesta is the goddess of the hearth. Her flame connects the idea of a household’s shared life with the continuing life of the community.' },
      { title: 'A moment of beginning', text: 'Janus is linked with doors, transitions, and beginnings. His two faces look in different directions, a fitting image for crossing a threshold.' },
      { title: 'An imagined visit', text: 'This scene is a way to picture the gods’ associations, not a reconstruction of one household. Customs and beliefs varied across the ancient Roman world.' },
    ],
    gods: ['Vesta', 'Janus', 'Juno', 'Jupiter'],
  },
];

export const stories = [
  {
    id: 'athenas-gift',
    title: 'Athena’s gift to a city',
    tradition: 'Greek',
    readingTime: '1 min',
    summary: 'An olive tree and a salt spring become two very different gifts.',
    paragraphs: [
      'Athena and Poseidon both wanted to protect the same city. Each offered a sign of divine power. Poseidon struck the rock with his trident, and a spring of salt water burst from the ground.',
      'Athena gave an olive tree. It could grow, bear fruit, and provide something useful year after year. Her gift won the contest, and the city was linked with her name: Athens.',
      'This short version follows the familiar contest shown in ancient art. It invites a question that still feels fresh: what makes a gift valuable — its sudden drama, or the good it can do over time?',
    ],
    relatedGods: ['Athena', 'Poseidon'],
    source: { title: 'British Museum: the Parthenon’s west pediment', url: 'https://www.britishmuseum.org/sites/default/files/2020-12/Room_18_Parthenon_Large_Print_Guide.pdf' },
  },
  {
    id: 'hermes-and-the-lyre',
    title: 'Hermes finds a new tune',
    tradition: 'Greek',
    readingTime: '1 min',
    summary: 'A clever invention helps Hermes turn a quarrel into an exchange.',
    paragraphs: [
      'Hermes is quick, curious, and always ready to try something unexpected. In one famous tale, his tricks upset Apollo, and the two gods have a quarrel to settle.',
      'Then Hermes plays a new instrument: the lyre. Its strings make music that catches Apollo’s attention. The sound creates a new possibility where a moment before there was only anger.',
      'The instrument passes to Apollo and becomes one of his best-known symbols. Traditions differ about who first invented the lyre; this version gives that inventive moment to Hermes. Even a story about a trickster can become a story about making something worth sharing.',
    ],
    relatedGods: ['Hermes', 'Apollo'],
    source: { title: 'Getty: poetry and music in antiquity', url: 'https://www.getty.edu/education/teachers/classroom_resources/curricula/poetry_and_art/downloads/antiquity.pdf' },
  },
  {
    id: 'persephones-return',
    title: 'Persephone returns',
    tradition: 'Greek',
    readingTime: '1 min',
    summary: 'A mother’s search becomes a story about growing things and reunion.',
    paragraphs: [
      'After Hades took Persephone into the underworld, her mother Demeter searched for her. Demeter’s grief reached the fields: the world that depended on her care could no longer flourish.',
      'Persephone could not simply leave the underworld forever. The arrangement that followed divided her time between that realm and the world above. Hermes and the torch-bearing Hecate appear as guides in ancient images of her return.',
      'When Demeter receives her daughter, life returns to the land. This myth connects separation and reunion with the agricultural year. Different ancient tellings divide Persephone’s time differently, so this retelling leaves the number of months open.',
    ],
    relatedGods: ['Demeter', 'Persephone', 'Hades', 'Hermes', 'Hecate'],
    source: { title: 'The Met: Persephone’s return on an ancient vase', url: 'https://www.metmuseum.org/art/collection/search/252973' },
  },
  {
    id: 'orpheus-looks-back',
    title: 'The look back',
    tradition: 'Greek',
    readingTime: '1 min',
    summary: 'Orpheus reaches the edge of the underworld with one difficult rule.',
    paragraphs: [
      'The musician Orpheus entered the underworld hoping to bring back Eurydice, the wife he had lost. The gods allowed her to follow him toward the living world, but the permission came with a condition.',
      'He must keep walking and not turn to look at her until they had both reached the world above. Near the entrance, the silence became too much. Orpheus looked back before the journey was complete.',
      'Eurydice vanished from him again. This is a sad tale of love, uncertainty, and a boundary that cannot easily be crossed. Ancient and later artists retold its final moment in many ways; this brief version keeps its familiar tragic ending.',
    ],
    relatedGods: ['Hades', 'Persephone'],
    source: { title: 'The Met: Orpheus and Eurydice', url: 'https://www.metmuseum.org/art/collection/search/191330' },
  },
  {
    id: 'an-open-door',
    title: 'A door opened to strangers',
    tradition: 'Roman',
    readingTime: '1 min',
    summary: 'Jupiter and Mercury find a welcome in a modest home.',
    paragraphs: [
      'Two travelers arrived at the home of Philemon and Baucis, a couple from a myth told by the Roman poet Ovid. The visitors appeared ordinary, and the home was modest. Still, the couple made room for them.',
      'The hosts offered what they could. Then the visitors revealed a remarkable secret: they were Jupiter and Mercury. A simple act of welcome had become a meeting between mortals and gods.',
      'This retelling pauses at that revelation rather than following every event in the longer story. Its small room and shared meal offer a different view of divine power: a god might arrive quietly, and generosity might begin with opening a door.',
    ],
    relatedGods: ['Jupiter', 'Mercury'],
    source: { title: 'National Gallery of Art: Philemon and Baucis', url: 'https://www.nga.gov/artworks/1204-philemon-and-baucis' },
  },
  {
    id: 'psyches-last-task',
    title: 'Psyche’s last task',
    tradition: 'Roman',
    readingTime: '1 min',
    summary: 'A forbidden container brings Psyche’s long journey to a turning point.',
    paragraphs: [
      'In the tale of Cupid and Psyche, preserved in a Latin story by Apuleius, Venus sets Psyche difficult tasks. One sends her to the underworld to bring back a container that she must keep closed.',
      'Psyche returns, but curiosity overcomes her caution. When she opens it, a deep sleep falls over her. Cupid finds her and helps awaken her, bringing the long separation between them toward an end.',
      'The story eventually brings the gods together to accept their union and grant Psyche immortality. This is a short retelling of the final episode, not the whole adventure. Its changing fortunes have inspired many different images of trust, curiosity, and reunion.',
    ],
    relatedGods: ['Cupid', 'Venus'],
    source: { title: 'Louvre: Psyche revived by Cupid', url: 'https://boutique.louvre.fr/en/product/16807-poster-canova-psyche-revived-by-cupid-kiss.html' },
  },
];
