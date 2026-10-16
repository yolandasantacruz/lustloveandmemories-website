export function getWalkerOps(phi: number, phoneAmt = 1): (string | number)[][] {
  // Tranquil, subtle stride amplitude
  const s1 = Math.sin(phi); // forward leg swing
  const c1 = Math.cos(phi);
  const s2 = -s1;           // trailing leg swing
  const c2 = -c1;
  const bob = -Math.abs(s1) * 1.5;
  const sway = s1 * 0.8;

  // Phone & forward arm positions:
  // When phoneAmt = 0 (walking): arm swings naturally down at side with full sleeve
  // When phoneAmt = 1 (stopped/arrived): forearm bent up holding phone close in front of chest
  const armDownX = 64 + s2 * 4;
  const armDownY = 74 + bob;

  // Final phone position in hand: comfortable reading position right in front of chest
  const phoneTargetX = 71;
  const phoneTargetY = 38 + bob;

  // Elbow & hand positions smoothly interpolate
  const armElbowX = 63 + (1 - phoneAmt) * (s2 * 3);
  const armElbowY = 53 + (1 - phoneAmt) * 3 + bob;
  const armHandX = (1 - phoneAmt) * armDownX + phoneAmt * (phoneTargetX - 1);
  const armHandY = (1 - phoneAmt) * armDownY + phoneAmt * (phoneTargetY + 9);

  // Phone coordinates are locked to hand!
  const phoneX = armHandX + 1;
  const phoneY = armHandY - 9;

  // Back arm: swings in cadence with stride
  const backArmX = 30 - s1 * 3.5;
  const backArmHandX = 26 - s1 * 5.5;

  // Forward leg (Right leg):
  // Anatomically natural knee flexion across all walk phases
  let fKneeBend = 2.0;
  if (s1 > 0) {
    // Forward swing: knee flexes forward, leading the step
    fKneeBend = 2.5 + s1 * 4.5;
  } else if (s1 < -0.2) {
    // Back push-off: knee flexes as heel lifts
    fKneeBend = -s1 * 4.0;
  }
  const fKneeX = 58 + s1 * 5.0 + fKneeBend * 1.3;
  const fKneeY = 126 + bob - (s1 > 0 ? fKneeBend * 0.4 : 0);
  const fLift = (s1 > 0.15 && c1 > 0) ? c1 * 3.2 : 0;
  const fAnkleX = 63 + s1 * 7.5;
  const fAnkleY = 151 - fLift;
  const fToeX = fAnkleX + 9; // Points forward!
  const fToeY = fAnkleY + 2;

  // Trailing leg (Left leg):
  // Symmetrical natural knee flexion
  let bKneeBend = 2.0;
  if (s2 > 0) {
    bKneeBend = 2.5 + s2 * 4.5;
  } else if (s2 < -0.2) {
    bKneeBend = -s2 * 4.0;
  }
  const bKneeX = 42 + s2 * 5.0 + bKneeBend * 1.3;
  const bKneeY = 126 + bob - (s2 > 0 ? bKneeBend * 0.4 : 0);
  const bLift = (s2 > 0.15 && c2 > 0) ? c2 * 3.2 : 0;
  const bAnkleX = 38 + s2 * 7.5;
  const bAnkleY = 151 - bLift;
  const bToeX = bAnkleX + 8.5; // Points forward in natural walking direction!
  const bToeY = bAnkleY + 2;

  const ops: (string | number)[][] = [
    // Head & Bun
    ['c', 50, 14 + bob, 8],
    ['c', 57, 7 + bob, 4],
    ['s', `M48,${(22 + bob).toFixed(1)} L47,${(29 + bob).toFixed(1)}`, 5.5],
    // Torso / Coat
    ['f', `M36,${(28 + bob).toFixed(1)} L60,${(28 + bob).toFixed(1)} L66,${(60 + bob).toFixed(1)} L${(72 + sway).toFixed(1)},${(99 + bob).toFixed(1)} L${(30 + sway).toFixed(1)},${(101 + bob).toFixed(1)} L34,${(60 + bob).toFixed(1)} Z`],
    // Forward arm: upper sleeve & forearm with full anatomical substance
    ['s', `M58,${(32 + bob).toFixed(1)} L${armElbowX.toFixed(1)},${armElbowY.toFixed(1)}`, 8.5],
    ['s', `M${armElbowX.toFixed(1)},${armElbowY.toFixed(1)} L${armHandX.toFixed(1)},${armHandY.toFixed(1)}`, 7.5],
    ['c', armHandX, armHandY, phoneAmt > 0.6 ? 4.0 : 3.5]
  ];

  // Only render phone when hand is raised (phoneAmt > 0.6), firmly inside the hand!
  if (phoneAmt > 0.6) {
    const pScale = (phoneAmt - 0.6) / 0.4;
    const px = phoneX;
    const py = phoneY;
    ops.push(
      ['f', `M${(px - 2).toFixed(1)},${py.toFixed(1)} L${(px + 4 * pScale).toFixed(1)},${py.toFixed(1)} L${(px + 3 * pScale).toFixed(1)},${(py + 11).toFixed(1)} L${(px - 3).toFixed(1)},${(py + 11).toFixed(1)} Z`],
      ['s', `M${(px - 2).toFixed(1)},${py.toFixed(1)} L${(px + 4 * pScale).toFixed(1)},${py.toFixed(1)}`, 1.5]
    );
  }

  // Back arm
  ops.push(
    ['s', `M38,${(32 + bob).toFixed(1)} L${backArmX.toFixed(1)},${(56 + bob).toFixed(1)} L${backArmHandX.toFixed(1)},${(74 + bob).toFixed(1)}`, 5.5]
  );

  // Forward leg & foot (pointing forward with natural knee flexion)
  ops.push(
    ['s', `M${(56 + sway).toFixed(1)},${(98 + bob).toFixed(1)} L${fKneeX.toFixed(1)},${fKneeY.toFixed(1)} L${fAnkleX.toFixed(1)},${fAnkleY.toFixed(1)}`, 7],
    ['s', `M${fAnkleX.toFixed(1)},${fAnkleY.toFixed(1)} L${fToeX.toFixed(1)},${fToeY.toFixed(1)}`, 4.5]
  );

  // Trailing leg with natural knee flexion & forward-pointing foot
  ops.push(
    ['s', `M${(44 + sway).toFixed(1)},${(98 + bob).toFixed(1)} L${bKneeX.toFixed(1)},${bKneeY.toFixed(1)} L${bAnkleX.toFixed(1)},${bAnkleY.toFixed(1)}`, 7],
    ['s', `M${bAnkleX.toFixed(1)},${bAnkleY.toFixed(1)} L${bToeX.toFixed(1)},${bToeY.toFixed(1)}`, 4.5]
  );

  return ops;
}

export const WALKER = {
  w: 100,
  h: 155,
  ops: getWalkerOps(0, 1)
};
