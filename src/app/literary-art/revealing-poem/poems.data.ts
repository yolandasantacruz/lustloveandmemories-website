export interface CuratedPoem {
  title: string;
  book: string;
  lines: string[];
}

export const CURATED_POEMS: CuratedPoem[] = [
  {
    title: 'How My Poems Are Created',
    book: 'Lust, Love, and Memories',
    lines: [
      'Whenever I want to write you,',
      'I write me.'
    ]
  },
  {
    title: 'Unflourished',
    book: 'The Longest Nights',
    lines: [
      'Some flowers get killed',
      'before they get their chance to flourish.'
    ]
  },
  {
    title: 'Entry as Exit',
    book: 'The Longest Nights',
    lines: [
      'Enter, come in, you are welcomed.',
      'I want to break free,',
      'the only way of doing so is opening the door.'
    ]
  },
  {
    title: 'Shattered Glass',
    book: 'The Longest Nights',
    lines: [
      'Some memories stay with you like shattered glass,',
      'making you bleed every time you stumble upon them.'
    ]
  },
  {
    title: 'The Longest Nights',
    book: 'The Longest Nights',
    lines: [
      'I wear a sleep mask to bed.',
      'Every time I lift it up,',
      'I pray that it is already morning.'
    ]
  },
  {
    title: 'Peace',
    book: 'The Longest Nights',
    lines: [
      'We already lost each other many weeks ago.',
      'I am getting back my peace.'
    ]
  },
  {
    title: 'For Emotions',
    book: 'Lust, Love, and Memories',
    lines: [
      'I will always make time for emotions,',
      'and that’s how this book came to be.'
    ]
  },
  {
    title: 'Soft Spot',
    book: 'Lust, Love, and Memories',
    lines: [
      'Softness is my soft spot.',
      'We were creating art.'
    ]
  }
];

export const CURATED_POEM_SEGMENTS: string[][] = CURATED_POEMS.map((p) => p.lines);
