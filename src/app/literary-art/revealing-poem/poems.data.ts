export interface CuratedPoem {
  title: string;
  book: string;
  lines: string[];
  hidden?: boolean;
}

export const ALL_CURATED_POEMS: CuratedPoem[] = [
  // ─── The Longest Nights ──────────────────────────────────────────────
  {
    title: 'No surprises',
    book: 'The Longest Nights',
    hidden: true,
    lines: [
      'Your lies were wrapped',
      'in translucent paper:',
      'you believed they were hidden',
      'while I stared at them.'
    ]
  },
  {
    title: 'Poisoned waters',
    book: 'The Longest Nights',
    hidden: true,
    lines: [
      "I'm so thirsty of news from you",
      "I'd drink them from any source.",
      'But I know better.'
    ]
  },
  {
    title: 'Streets',
    book: 'The Longest Nights',
    lines: [
      'Still waiting for the moment',
      'when my heart stops stopping',
      'at the sight of a blue car.'
    ]
  },
  {
    title: 'And this is how it ends',
    book: 'The Longest Nights',
    lines: [
      'I started to write about us',
      'without the expectation',
      'of sharing them with you.'
    ]
  },
  {
    title: 'Facts',
    book: 'The Longest Nights',
    lines: [
      'I was a high-risk investment,',
      'he was into trust funds.'
    ]
  },
  {
    title: 'With him',
    book: 'The Longest Nights',
    lines: [
      'I got fried as an egg',
      'over the roof of a car',
      "under the Texas Sun's heat."
    ]
  },
  {
    title: 'You will never be welcomed',
    book: 'The Longest Nights',
    lines: [
      "I'd be damned",
      'if after that big of a stab',
      'I let you get',
      'anywhere near my back.'
    ]
  },

  // ─── Lust, Love, and Memories ─────────────────────────────────────────
  {
    title: 'Desynchronized',
    book: 'Lust, Love, and Memories',
    lines: [
      'I was waiting on your text',
      'like a Christmas present.',
      'Didn’t realize',
      'summer had just started.'
    ]
  },
  {
    title: 'How my poems are created',
    book: 'Lust, Love, and Memories',
    lines: [
      'Whenever I want to write you',
      'I write me.'
    ]
  },
  {
    title: 'Unfriend',
    book: 'Lust, Love, and Memories',
    lines: [
      'I’m always going to be there for you.',
      'That’s why I prefer not to be.'
    ]
  },
  {
    title: 'At sunset',
    book: 'Lust, Love, and Memories',
    lines: [
      'The Sun doesn’t set, the Earth shies away.'
    ]
  },
  {
    title: 'Bodies are just containers',
    book: 'Lust, Love, and Memories',
    lines: [
      'It never felt so true',
      'than when ours got together',
      'and their content blended in so well.'
    ]
  },
  {
    title: 'Lightness',
    book: 'Lust, Love, and Memories',
    lines: [
      'You are free now,',
      'feel the weight of it.'
    ]
  },
  {
    title: 'Memories',
    book: 'Lust, Love, and Memories',
    lines: [
      'Some memories stay with you',
      'like shattered pieces of a broken glass,',
      'making you bleed',
      'every time you stumble upon them.'
    ]
  },
  {
    title: 'Emptiness',
    book: 'Lust, Love, and Memories',
    lines: [
      'Our chemistry is pretty amazing.',
      'He said,',
      'as he walked away.'
    ]
  },
  {
    title: 'Unstable',
    book: 'Lust, Love, and Memories',
    lines: [
      'He loved birds,',
      'but was afraid to fly.'
    ]
  },
  {
    title: 'Consistency',
    book: 'Lust, Love, and Memories',
    lines: [
      'He treated his emotions',
      'like all his profile pictures,',
      'hiding every expression',
      'behind dark-tinted shades.'
    ]
  },
  {
    title: 'Hurt',
    book: 'Lust, Love, and Memories',
    lines: [
      'My head keeps visualizing',
      'the pictures we could have taken.'
    ]
  }
];

export const CURATED_POEMS: CuratedPoem[] = ALL_CURATED_POEMS.filter((p) => !p.hidden);

export const CURATED_POEM_SEGMENTS: string[][] = CURATED_POEMS.map((p) => p.lines);

/**
 * Continuous typographic stream for the ambient Letter Sea background canvas,
 * constructed directly from the curated poem collection.
 */
export const POETIC_CORPUS: string = CURATED_POEMS.map((p) => {
  const verse = p.lines.join(' ');
  return /[.!?:]$/.test(verse) ? verse : verse + '.';
}).join(' ') + ' ';

