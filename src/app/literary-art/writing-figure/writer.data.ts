export const WRITER = {
  w: 154,
  h: 152,
  ops: [
    // ─── 1. CHAIR (Tall straight back, seat, legs — from User Sketch) ────────
    ['s', 'M28,38 L28,140', 3.5], // main vertical back post & rear leg
    ['s', 'M26,38 L34,38', 3],    // top rail
    ['s', 'M32,42 L32,92', 2],    // inner vertical backrest slat
    ['s', 'M24,92 L44,92', 4],    // horizontal chair seat
    ['s', 'M42,92 L41,140', 3],   // front chair leg

    // ─── 2. SEATED PERSON (Head with bun, leaning torso, arm resting on desk) ─
    ['c', 52, 28, 8.5],           // tilted head
    ['c', 44, 23, 4],             // hair bun at nape
    ['s', 'M50,36 L46,46', 4.5],  // slender neck
    // Torso leaning forward toward desk
    ['f', 'M45,45 C37,58 35,74 37,92 L49,92 C53,78 56,62 54,48 Z'],
    // Arm resting on table: shoulder down to elbow, forearm resting on tabletop
    ['s', 'M47,48 L51,66 L80,69', 5], // upper arm & resting forearm
    ['c', 81, 69, 3],             // resting hand
    // Seated thighs
    ['f', 'M37,90 L68,91 L66,99 L37,96 Z'],
    // Near lower leg dropping down vertically to floor & foot
    ['s', 'M66,97 L65,136 L76,138', 5],
    // Far lower leg slightly offset in depth
    ['s', 'M60,97 L59,136 L69,138', 3.5],

    // ─── 3. TABLE IN 3/4 OBLIQUE 3D PERSPECTIVE (From User Sketch) ───────────
    // Tabletop surface (parallelogram showing 3D depth)
    ['f', 'M52,73 L126,72 L140,62 L68,63 Z'],
    // Front and right apron rims
    ['f', 'M52,73 L126,72 L126,77 L52,78 Z'],
    ['f', 'M126,72 L140,62 L140,67 L126,77 Z'],
    // Desk legs (front-right and back-right only, keeping open negative space!)
    ['s', 'M124,77 L124,140', 4],   // front-right desk leg
    ['s', 'M138,67 L138,126', 3.5], // back-right desk leg in perspective

    // Letter paper sheet resting on table for correspondence / easter egg launch
    ['f', 'M84,65 L104,64 L107,69 L87,70 Z']
  ]
};
