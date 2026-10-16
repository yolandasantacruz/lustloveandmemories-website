export interface ShapeDefinition {
  name: string;
  words: string;
  w: number;
  h: number;
  ops: (string | number)[][];
}

export const SHAPES: ShapeDefinition[] = [
  {
    name: 'a dancer',
    words: 'whenever i want to write you i write me',
    w: 100,
    h: 130,
    ops: [
      ['c', 54, 15, 6.6],
      ['c', 59.5, 10, 3.4],
      ['s', 'M52,21 L50,28', 4.6],
      ['f', 'M41,28 C47,26 56,26 61,28 L57,50 L45,51 Z'],
      ['f', 'M45,48 L58,47 C64,58 70,66 77,74 C66,79 52,81 44,80 C38,79 33,78 27,76 C34,66 40,57 45,48 Z'],
      ['s', 'M44,31 Q36,24 32,18 Q28,11 25,3', 4.2],
      ['s', 'M58,31 Q66,36 73,38 Q80,38 89,33', 4.2],
      ['s', 'M49,78 Q49,92 48.5,104 Q48,114 47,121', 5.8],
      ['s', 'M47,121 L54,124', 3.4],
      ['s', 'M57,76 Q66,86 72,92 Q79,96 89,97', 5.2]
    ]
  },
  {
    name: 'two lovers',
    words: 'softness is my soft spot',
    w: 100,
    h: 135,
    ops: [
      // Left figure (standing)
      ['c', 35, 16, 6.2],
      ['s', 'M35,22 L35,29', 4.4],
      ['f', 'M26,29 C32,27 38,27 44,29 L41,62 L29,62 Z'],
      ['s', 'M27,31 Q20,44 22,60', 4.0],
      ['s', 'M33,62 L32,124', 5.6],
      ['s', 'M39,62 L40,124', 5.4],
      // Right figure (leaning in embrace)
      ['c', 58, 20, 6.0],
      ['s', 'M56,26 L53,33', 4.2],
      ['f', 'M46,33 C53,30 62,31 66,35 L61,66 L49,66 Z'],
      ['s', 'M50,35 Q42,48 40,62', 4.2],
      ['s', 'M64,35 Q71,46 66,62', 3.8],
      ['s', 'M52,66 L50,124', 5.4],
      ['s', 'M59,66 L62,124', 5.2]
    ]
  },
  {
    name: 'a flower',
    words: 'some flowers get killed before they get their chance to flourish',
    w: 100,
    h: 125,
    ops: [
      ['c', 50, 32, 8.5],
      ['f', 'M50,23 C42,12 58,12 50,23 Z'],
      ['f', 'M50,41 C42,52 58,52 50,41 Z'],
      ['f', 'M41,32 C30,24 30,40 41,32 Z'],
      ['f', 'M59,32 C70,24 70,40 59,32 Z'],
      ['f', 'M43,26 C33,18 40,10 48,22 Z'],
      ['f', 'M57,26 C67,18 60,10 52,22 Z'],
      ['s', 'M50,41 Q51,75 50,118', 4.8],
      ['f', 'M50,68 C38,58 35,74 49,75 Z'],
      ['f', 'M50,88 C62,78 65,94 51,95 Z']
    ]
  },
  {
    name: 'a profile in wire',
    words: 'we already lost each other many weeks ago i am getting back my peace',
    w: 100,
    h: 120,
    ops: [
      ['c', 50, 28, 14],
      ['f', 'M42,24 C45,36 55,42 64,48 C58,54 52,58 46,68 L36,54 Z'],
      ['s', 'M46,68 Q44,82 46,96', 5],
      ['s', 'M38,42 Q30,58 32,84', 4.2],
      ['s', 'M58,52 Q70,68 62,94', 4.5],
      ['s', 'M46,96 L58,114', 6],
      ['s', 'M38,90 L34,114', 5]
    ]
  },
  {
    name: 'a bird in flight',
    words: 'i wear a sleep mask to bed praying it is already morning',
    w: 100,
    h: 80,
    ops: [
      ['e', 50, 60, 16, 6, -0.08],
      ['c', 66, 56, 5],
      ['f', 'M69,55 L79,57.5 L69,59 Z'],
      ['f', 'M47,58 Q36,42 22,44 Q10,45 2,38 Q12,58 32,63 Z'],
      ['f', 'M53,56 Q62,38 79,30 Q90,26 99,19 Q88,42 66,57 Z'],
      ['f', 'M36,57 L24,61 L26,66 L38,63 Z']
    ]
  }
];
