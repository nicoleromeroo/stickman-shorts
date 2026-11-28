// "The Man Who Sold the Eiffel Tower" - shots, cameras, lens, world state and actors as pure functions of the frame.
import { camFromKeys, ss, easeOut, easeIn, back, spring, ramp, clamp, lerp, idle, blinkAt, walk, q } from "/engine3d/motion.js";
import * as K from "./props.js";

export const FRAMES = 1208;
const SAL = 1000; // salon x offset
// ---------- shots ----------
export const SHOTS = [
  { id: "A", a: 0, b: 157, light: "day", sunAt: [0, 0, 176], shadowR: 30 },
  { id: "B", a: 158, b: 229, light: "day", sunAt: [0, 0, 20], shadowR: 110 },
  { id: "C", a: 230, b: 338, light: "day", sunAt: [26, 0, 30], shadowR: 30 },
  { id: "D", a: 339, b: 459, light: "day", sunAt: [11, 0, 182], shadowR: 25 },
  { id: "E", a: 460, b: 582, light: "interior", sunAt: [SAL, 0, -0.5], shadowR: 12 },
  { id: "F", a: 583, b: 634, light: "interior", sunAt: [SAL, 0, -2.5], shadowR: 6 },
  { id: "G", a: 635, b: 705, light: "interior", sunAt: [SAL, 0, 2], shadowR: 12 },
  { id: "H", a: 706, b: 750, light: "interior", sunAt: [SAL, 0, -2.5], shadowR: 8 },
  { id: "I", a: 751, b: 835, light: "day", sunAt: null, shadowR: 30 },
  { id: "J", a: 836, b: 944, light: "day", sunAt: [-9, 0, 178], shadowR: 22 },
  { id: "K", a: 945, b: 1035, light: "autumn", sunAt: [5, 0, 172], shadowR: 30 },
  { id: "L", a: 1036, b: 1067, light: "interior", sunAt: [SAL, 0, -2], shadowR: 12 },
  { id: "M", a: 1068, b: 1098, light: "interior", sunAt: [SAL, 0, -2], shadowR: 12 },
  { id: "N", a: 1099, b: 1207, light: "golden", sunAt: [3, 0, 40], shadowR: 40 },
];
export const shotAt = (f) => { const s = SHOTS.find((s) => f >= s.a && f <= s.b) || SHOTS[SHOTS.length - 1]; return s.id === "I" ? { ...s, sunAt: [trainX(f) + 6, 0, 2500] } : s; };
export const CUTS = [157.5, 750.5, 944.5];
export const flashAt = (f) => { let v = 0; for (const c of CUTS) { const d = f - c; if (d > -3.5 && d < 0) v = Math.max(v, (3.5 + d) / 3.5); if (d >= 0 && d < 4) v = Math.max(v, 1 - d / 4); } return v * 0.92; };

// key beats (frames)
export const BEAT = { tower: 38, again: 126, rustUp: 236, fortune: 300, official: 428, poses: 385, whisper: 557, down: 620, highest: 668, pays: 731, money: 805, police: 883, embarrassed: 914, back: 1005, same: 1036, newBuyer: 1068, tower2: 1099, standing: 1127, sale: 1190 };
export const KICKS = [{ f: BEAT.again, a: 1.4 }, { f: BEAT.down + 2, a: 1.1 }, { f: BEAT.official, a: 0.5 }, { f: BEAT.sale + 4, a: 1.0 }, { f: 1099, a: 0.6 }];
export const trainX = (f) => -40 + (f - 751) * 0.42;

// ---------- cameras ----------
const C = (f, pos, look, fov, roll = 0, ease, via) => ({ f, pos, look, fov, roll, ease, via });
const CAMS = {
  A: [C(0, [1.9, 1.55, 179.6], [1.74, 1.66, 176], 33), C(40, [1.86, 1.58, 179.3], [1.72, 1.68, 176], 32),
    C(100, [2.1, 2.2, 188], [1.0, 40, 0], 46, -2, ss, [[2.0, 1.9, 182.5]]), C(118, [2.05, 2.15, 187.4], [1.0, 41, 0], 45.5, -2),
    C(132, [1.95, 1.75, 180.2], [1.75, 1.7, 176], 33, 3, easeOut), C(157, [1.92, 1.74, 179.9], [1.75, 1.7, 176], 32, 3.5)],
  B: [C(158, [150, 70, 300], [0, 38, 0], 42, 0), C(229, [92, 34, 182], [0, 50, 0], 46, -3)],
  C: [C(230, [43, 2.6, 49], [24, 10, 25], 44), C(272, [41, 9, 47], [21, 17, 22], 46, 2),
    C(300, [36.5, 2.4, 41], [31.4, 1.5, 33.6], 40, 0, ss), C(338, [36, 2.25, 40.2], [31.4, 1.4, 33.6], 38, -2)],
  D: [C(339, [7.4, 1.8, 188.2], [11.2, 1.45, 182], 36), C(410, [8.2, 1.75, 186.6], [11.2, 1.45, 182], 34), C(428, [8.7, 1.72, 185.6], [11.3, 1.6, 182], 31, 2, easeOut), C(459, [8.9, 1.72, 185.2], [11.3, 1.6, 182], 30, 3)],
  E: [C(460, [SAL + 0.9, 2.9, 8.4], [SAL, 1.15, -2], 46, 0), C(540, [SAL + 0.6, 2.25, 4.6], [SAL, 1.35, -2.6], 44, 1), C(582, [SAL + 0.35, 1.95, 1.3], [SAL, 1.55, -4.2], 40, 2)],
  F: [C(583, [SAL + 0.42, 1.2, -1.25], [SAL, 1.26, -2.6], 40, 0), C(612, [SAL + 0.36, 1.19, -1.35], [SAL, 1.25, -2.6], 39, 0), C(634, [SAL + 0.3, 1.24, -1.3], [SAL, 1.15, -2.3], 40, -3, easeOut)],
  G: [C(635, [SAL - 0.2, 2.0, -2.2], [SAL, 1.6, 4.8], 44, 0), C(705, [SAL + 0.2, 1.95, -1.4], [SAL, 1.65, 4.8], 40, 2)],
  H: [C(706, [SAL + 0.6, 1.5, 0.6], [SAL + 0.25, 1.3, -3.6], 42), C(735, [SAL + 0.5, 1.42, -0.2], [SAL + 0.2, 1.3, -3.6], 38, 2, easeOut), C(750, [SAL + 0.48, 1.42, -0.3], [SAL + 0.2, 1.32, -3.6], 37, 2)],
  K: [C(945, [-2.2, 2.3, 196], [3.5, 1.9, 168], 44), C(1035, [6.2, 1.75, 182.4], [8.4, 1.5, 176.6], 38, 2)],
  J: [C(836, [-5.4, 1.75, 186.5], [-10.8, 1.9, 175.5], 42), C(890, [-7.4, 1.72, 182.6], [-11.3, 1.85, 175.5], 39), C(936, [-9.0, 1.66, 179.4], [-11.4, 1.5, 175.6], 34, 3, ss)],
  L: [C(1036, [SAL + 0.35, 1.95, 1.3], [SAL, 1.55, -4.2], 40, 2), C(1067, [SAL + 0.3, 1.9, 0.6], [SAL, 1.6, -4.2], 38, 2.5)],
  M: [C(1068, [SAL + 0.3, 1.9, 0.6], [SAL, 1.6, -4.2], 38, 2.5), C(1077, [SAL - 0.2, 1.7, 0.5], [SAL + 1.15, 1.55, -2.3], 36, -3, easeOut), C(1098, [SAL - 0.15, 1.68, 0.3], [SAL + 1.15, 1.55, -2.3], 34, -3.5)],
  N: [C(1099, [3.7, 1.0, 43.6], [3.05, 1.05, 40], 36, 0), C(1120, [3.75, 1.02, 43.3], [3.05, 1.05, 40], 35, 0), C(1155, [5, 1.7, 49], [0, 62, 0], 50, 4, ss), C(1178, [4.1, 1.05, 44.4], [3.05, 0.7, 40], 38, 1, ss), C(1207, [4.0, 1.0, 44.0], [3.05, 0.55, 40], 37, 1.5)],
};
export const camAt = (f) => {
  const s = shotAt(f);
  if (s.id === "I") { // train tracking (moves with the train)
    const x = trainX(f), t = ramp(f, 751, 790);
    const p0 = [x + 32, 1.6, 2487], l0 = [x + 14, 3, 2500], p1 = [x + 7.6, 3.4, 2491.4], l1 = [x + 6, 3.25, 2498.6];
    const pos = p0.map((v, i) => lerp(v, p1[i], t)), look = l0.map((v, i) => lerp(v, l1[i], t));
    return { pos, look, fov: lerp(44, 36, t), roll: lerp(0, -2, t), shake: [0.15 * Math.sin(f * 1.7), 0.12 * Math.sin(f * 2.3)] };
  }
  return camFromKeys(CAMS[s.id], f, { kicks: KICKS.filter((k) => k.f >= s.a && k.f <= s.b) });
};
// ---------- lens ----------
const DOF = { A: [[0, 3.3, 12], [55, 3.3, 12], [95, 20, 0], [118, 20, 0], [132, 4.1, 9], [157, 4.1, 9]], B: [[158, 50, 0]], C: [[230, 15, 0], [286, 15, 0], [300, 8, 6], [338, 7.8, 7]],
  D: [[339, 7.2, 6], [428, 4.6, 9], [459, 4.4, 9]], E: [[460, 7, 0], [535, 7, 0], [575, 5.4, 7], [582, 5.4, 8]], F: [[583, 1.33, 14], [634, 1.25, 12]], G: [[635, 6.9, 7], [705, 6.6, 8]],
  H: [[706, 2.2, 6], [722, 3.4, 9], [735, 4.0, 9], [750, 4.0, 9]], I: [[751, 20, 0], [785, 7.3, 0], [800, 7.3, 5], [835, 7.3, 5]], J: [[836, 8, 5], [890, 6.5, 7], [936, 4.4, 10], [944, 4.4, 10]],
  K: [[945, 20, 0], [990, 12, 3], [1035, 9.2, 7]], L: [[1036, 5.6, 8], [1067, 4.8, 9]], M: [[1068, 4.8, 9], [1077, 2.6, 12], [1098, 2.5, 12]], N: [[1099, 3.6, 14], [1120, 3.6, 14], [1150, 60, 0], [1160, 60, 0], [1180, 4.3, 10], [1207, 4.2, 10]] };
export const dofAt = (f) => {
  const k = DOF[shotAt(f).id]; let i = 0; while (i < k.length - 1 && f >= k[i + 1][0]) i++;
  const A = k[i], B = k[Math.min(i + 1, k.length - 1)]; const t = B === A ? 0 : ss((f - A[0]) / (B[0] - A[0]));
  return { focus: lerp(A[1], B[1], t), cInf: lerp(A[2], B[2], t) };
};
// ---------- world state ----------
export const worldAt = (f) => {
  const s = shotAt(f).id;
  const tip = f < BEAT.down - 8 ? 0 : (Math.PI / 2) * (f < BEAT.down + 2 ? easeIn((f - (BEAT.down - 8)) / 10) : 1 - 0.06 * Math.exp(-(f - BEAT.down - 2) * 0.35) * Math.abs(Math.sin((f - BEAT.down - 2) * 0.9)));
  return { rust: s === "C", modelTip: f >= 583 ? tip : 0, trainX: trainX(Math.max(751, f)) };
};
// ---------- actors ----------
const PX = 0.00225; // metres per design unit (card 1000 units = 2.25 m)
const actor = (id, outfit, pos, o = {}) => {
  const k = o.k ?? 1.25;
  const opts = { expr: o.expr ?? "neutral", mode: o.mode ?? "stand", phase: q(o.phase ?? 0, 0.05), blink: o.blink ?? 0, facing: o.facing ?? 0, seed: o.seed ?? 1,
    tilt: q(o.tilt ?? 0, 0.5), headTilt: q(o.headTilt ?? 0, 0.5), look: q(o.look ?? 0, 0.25), armL: o.armL, armR: o.armR, blush: q(o.blush ?? 0, 0.05) };
  const keyExtra = o.keyExtra ?? "";
  return { id, key: id + JSON.stringify(opts) + keyExtra + (o.bust ? "b" : ""), pos, h: 2.25, k,
    draw: o.bust ? K.bust(K.person(outfit, { ...opts, heldR: o.heldR, heldL: o.heldL }), o.bust) : K.person(outfit, { ...opts, heldR: o.heldR, heldL: o.heldL }),
    blob: o.blob, ground: o.ground, shadow: o.shadow, tint: o.tint };
};
const fx = (id, key, draw, pos, h, cw = 200, ch = 120, extra = {}) => ({ id, key, draw, pos, h, cw, ch, k: extra.k ?? 1, blob: false, shadow: extra.shadow ?? false, ...extra });
const breathe = (f, seed) => idle(f, seed).tilt;

export const actorsAt = (f, camPos) => {
  const s = shotAt(f).id, out = [];
  // ---- A: the hook ----
  if (s === "A") {
    const stamp = f < BEAT.again - 6 ? 0 : clamp((f - (BEAT.again - 6)) / 6);
    const expr = f < BEAT.tower ? "smile" : f < BEAT.again - 6 ? "grin" : f < BEAT.again + 10 ? "laugh" : "grin";
    const bob = f > BEAT.again - 2 && f < BEAT.again + 10 ? 2 * Math.sin((f - BEAT.again) * 0.9) : 0;
    out.push(actor("lustig", K.LUSTIG, [1.5, 0, 176], { k: 1.7, expr, armR: "raise", armL: f < 100 ? "hip" : "hip", blink: blinkAt(f, 3), seed: 3, tilt: breathe(f, 3) + bob, headTilt: bob * 1.5,
      heldR: (p, hx, hy, u) => K.soldSign(p, hx, hy, u, stamp), keyExtra: "st" + q(stamp, 0.17) }));
  }
  // ---- C: rust + the repair bill ----
  if (s === "C") {
    for (let i = 0; i < 9; i++) { // rust flakes drifting down the leg
      const t0 = 230 + i * 9, life = ((f - t0) % 80 + 80) % 80, y = 17 - life * 0.16, x = 27.6 + Math.sin(i * 3.1) * 1.6 + Math.sin(life * 0.1 + i) * 0.4, z = 30.6 + Math.cos(i * 1.7) * 1.4;
      if (f >= t0 && y > 0.3) out.push(fx("rf" + i, "rf" + (i % 2), K.rustFlake(i), [x, y, z], 0.32, 120, 100, { roll: life * 0.2 + i }));
    }
    const unroll = ramp(f, 276, 326, easeOut), shock = f > BEAT.fortune;
    out.push(actor("clerk", K.CLERK, [31.4, 0, 33.6], { k: 1.2, expr: shock ? "shock" : "nervous", armL: "hold", armR: "hold", blink: blinkAt(f, 7), seed: 7, tilt: breathe(f, 7) + (shock ? -3 : 0),
      heldR: (p, hx, hy) => K.scrollRoll(p, hx, hy), keyExtra: "" }));
    if (f >= 276) {
      const cx = 31.4, cz = 33.6, cam = camPos, dx = cx - cam.x, dz = cz - cam.z, l = Math.hypot(dx, dz), ux = dx / l, uz = dz / l;
      const len = 4.4; // canvas 400x1900 units at 0.0025 m (flat)
      out.push({ id: "bill", key: "bill" + q(unroll, 0.02), draw: K.bill(unroll), cw: 400, ch: 1900, k: 0.55, h: 1900 * 0.0023, flat: true, blob: false, shadow: false,
        pos: [cx - ux * (len / 2 - 0.25) + 0.05, 0.085, cz - uz * (len / 2 - 0.25)], rotY: Math.atan2(ux, uz) });
    }
  }
  // ---- D: the con man becomes an official ----
  if (s === "D") {
    const sash = f >= BEAT.official - 2;
    const pose = f >= BEAT.poses;
    out.push(actor("lustigD", sash ? K.OFFICIAL : K.LUSTIG, [11.3, 0, 180.8], { k: 1.5, expr: sash ? "grin" : pose ? "smile" : "neutral", armL: "hip", armR: sash ? "out" : pose ? "up" : "hip",
      blink: blinkAt(f, 4), seed: 3, tilt: breathe(f, 4) + (sash ? 2 * spring((f - BEAT.official) / 10) * 0 : 0), headTilt: sash ? -3 : pose ? 3 : 0, look: pose ? 0.5 : 0 }));
    if (f >= BEAT.official - 2 && f < BEAT.official + 12) { const t = (f - BEAT.official + 2) / 14; out.push(fx("pop", "pop" + q(t, 0.08), K.burst(t), [11.25, 1.1, 181.1], 1.6, 500, 500)); }
  }
  // ---- salon cast (E, F, G, H, L, M) ----
  const salon = "EFGHLM".includes(s);
  if (salon) {
    const whisper = (s === "E" && f >= BEAT.whisper) || s === "L" || (s === "M" && f < 1072);
    const lx = SAL, lz = -4.2;
    const lExpr = s === "F" || s === "G" ? "grin" : s === "H" ? (f > BEAT.pays ? "laugh" : "smile") : whisper ? "smile" : "smile";
    if (s !== "M" || f < 1074) out.push(actor("lustigS", K.OFFICIAL, [lx, 0, lz], { k: s === "L" || s === "H" ? 1.5 : 1.15, expr: lExpr, blink: blinkAt(f, 5), seed: 3, tint: "#fff4e4",
      armR: whisper ? "whisper" : s === "F" ? "out" : s === "G" ? "up" : s === "H" && f > BEAT.pays - 4 ? "hold" : "hip", armL: "hip", tilt: breathe(f, 5) + (whisper ? 6 : 0), headTilt: whisper ? 5 : 0,
      heldR: s === "H" && f > BEAT.pays - 4 ? (p, hx, hy, u) => K.envelope(p, hx, hy, u) : null, keyExtra: s === "H" && f > BEAT.pays - 4 ? "env" : "" }));
    const lean = (s === "E" && f >= BEAT.whisper) || s === "L" ? ramp(f, s === "L" ? 1036 : BEAT.whisper, (s === "L" ? 1036 : BEAT.whisper) + 10) : 0;
    const seats = [[1.2, -2.3], [-1.2, -2.3], [1.2, -0.4], [-1.2, -0.4], [1.2, 1.5], [-1.2, 1.5]];
    if (s === "E" || s === "L" || s === "H" || s === "M") {
      for (let i = 0; i < 6; i++) {
        let o = K.DEALERS[i];
        if (s === "H" && i !== 0) continue;
        if ((s === "L" || s === "M") && i === 0) o = K.BUYER2; // a new buyer has the best seat
        const [sx, sz] = s === "H" ? [0.78, -1.45] : seats[i], side = sx > 0 ? 1 : -1;
        const isNew = (s === "M" || s === "L") && i === 0;
        const ex = isNew && s === "M" ? "grin" : lean > 0.5 ? "shock" : s === "H" ? (f > BEAT.pays ? "relief" : "nervous") : "neutral";
        out.push(actor("dealer" + i, o, [SAL + sx, 0, sz], { k: isNew && s === "M" ? 1.6 : 1.1, expr: ex, facing: -side, look: -side, blink: blinkAt(f, 11 + i), seed: 11 + i, tint: "#fff4e4",
          tilt: breathe(f, 11 + i) - side * 7 * lean, headTilt: -side * 4 * lean,
          armR: isNew && s === "M" ? "raise" : s === "H" && i === 0 && f < BEAT.pays ? "out" : undefined,
          heldR: isNew && s === "M" ? (p, hx, hy, u) => K.envelope(p, hx, hy, u) : null, keyExtra: isNew && s === "M" ? "env" : "" }));
      }
    }
    if (s === "G") { // they crowd the near end, hands shooting up one by one
      const spots = [[-0.55, 3.6], [0.6, 3.9], [-1.05, 4.6], [0.05, 4.9], [1.1, 4.7], [-0.4, 5.7]];
      for (let i = 0; i < 6; i++) {
        const up = f >= BEAT.highest + i * 4, t = clamp((f - BEAT.highest - i * 4) / 6);
        const [sx, sz] = spots[i];
        out.push(actor("dealerG" + i, K.DEALERS[i], [SAL + sx, 0, sz], { k: 1.1, expr: up ? (i % 2 ? "laugh" : "grin") : "shock", blink: blinkAt(f, 21 + i), seed: 11 + i, tint: "#fff4e4",
          armR: up ? "up" : undefined, armL: up && i % 3 === 0 ? "raise" : undefined, tilt: breathe(f, 21 + i) + (up ? 3 * Math.sin((f + i * 7) * 0.5) * (1 - t * 0.3) : 0) }));
      }
    }
    if (s === "H" && f < BEAT.pays + 2) { // envelope slides across the cloth to Lustig
      const t = ramp(f, 712, BEAT.pays, easeOut);
      out.push({ id: "env", key: "env", draw: (p) => K.envelope(p, 100, 80, 1), cw: 200, ch: 150, k: 1.2, h: 0.24, flat: true, blob: false, shadow: false,
        pos: [SAL + lerp(0.6, 0.12, t), 1.025, lerp(-1.75, -3.5, t)], rotY: 0.3 * (1 - t) });
    }
  }
  // ---- I: the getaway train ----
  if (s === "I") {
    const x = trainX(f) + 6;
    const wave = f > 790;
    out.push(actor("lustigT", K.OFFICIAL, [x, 1.9, 2498.4], { k: 1.3, bust: 560, expr: f > BEAT.money ? "laugh" : "grin", armR: wave ? (Math.floor(f / 6) % 2 ? "up" : "raise") : "hip",
      blink: blinkAt(f, 6), seed: 3, blob: false, shadow: false, heldR: wave ? (p, hx, hy, u) => K.envelope(p, hx, hy, u) : null, keyExtra: wave ? "env" : "" }));
    for (let i = 0; i < 10; i++) { // banknotes fluttering away behind the window
      const t0 = 795 + i * 4; if (f < t0) continue; const t = f - t0;
      out.push(fx("note" + i, "note", K.banknote(i), [trainX(t0) + 6.4 - t * 0.05, 3.8 + t * 0.02 + Math.sin(t * 0.3 + i) * 0.25, 2498.2 - t * 0.03], 0.28, 200, 120, { roll: t * 0.25 + i }));
    }
    for (let i = 0; i < 14; i++) { // steam puffs left behind by the stack
      const t0 = 751 + i * 6 - 40; const t = f - t0; if (t < 0 || t > 70) continue;
      out.push(fx("steam" + i, "st" + q(t / 70, 0.1), K.steam(t / 70), [trainX(t0) + 23, 5.6 + t * 0.06, 2500], 2.2 + t * 0.06, 600, 400));
    }
  }
  // ---- J: the buyer by the police station ----
  if (s === "J") {
    const w = walk(f, 836, 1.25), go = f < 872, back = f >= 892;
    const t = clamp((f - 836) / 36);
    let pos = [lerp(-6.6, -10.9, ss(t)), 0, lerp(181.5, 176.4, ss(t))];
    if (back) { const tb = ss((f - 892) / 40); pos = [lerp(-10.9, -10.2, tb), 0, lerp(176.4, 177.2, tb)]; }
    const emb = f >= BEAT.embarrassed - 4;
    out.push(actor("buyer", K.DEALERS[0], pos, { k: 1.4, mode: go ? "stroll" : "stand", phase: go ? w.phase : 0, facing: back ? 1 : -1, look: back ? 1 : -1,
      expr: emb ? "pained" : back ? "nervous" : f > 872 ? "nervous" : "smile", blink: blinkAt(f, 9), seed: 11, armL: emb ? "face" : undefined, armR: emb ? "face" : f > 874 && f < 892 ? "out" : undefined,
      blush: emb ? ramp(f, BEAT.embarrassed - 4, BEAT.embarrassed + 10) * 0.55 : f > 885 ? 0.25 : 0, tilt: breathe(f, 9) + (emb ? 6 * Math.sin(f * 0.25) * 0.4 : 0), headTilt: emb ? 6 : 0 }));
  }
  // ---- K: six months later ----
  if (s === "K") {
    for (let i = 0; i < 14; i++) { const life = ((f - 945 + i * 11) % 90 + 90) % 90; const y = 6 - life * 0.07; if (y < 0.1) continue;
      out.push(fx("leaf" + i, "leaf" + (i % 3), K.leaf(i), [-1 + (i * 2.3) % 11 + Math.sin(life * 0.12 + i) * 0.7, y, 178 + (i * 3.7) % 14], 0.3, 100, 100, { roll: Math.sin(life * 0.15 + i) * 1.2 })); }
    const t = clamp((f - 958) / 50), w = walk(f, 958, 1.3), moving = f >= 958 && f < 1008;
    const pos = [lerp(3.2, 8.4, ss(t)), 0, lerp(160, 176.6, ss(t))];
    const arrived = f >= BEAT.back;
    out.push(actor("lustigK", K.LUSTIG, pos, { k: 1.3, mode: moving ? "stroll" : "stand", phase: w.phase, expr: arrived ? "grin" : "smile", blink: blinkAt(f, 8), seed: 3, facing: arrived ? 0 : 1,
      armL: "hold", armR: arrived ? "up" : undefined, heldL: (p, hx, hy, u) => K.suitcase(p, hx, hy, u), tilt: breathe(f, 8) + (arrived ? 3 * back((f - BEAT.back) / 8) - 3 : 0), keyExtra: "case" }));
  }
  // ---- N: the ending ----
  if (s === "N") {
    const tf = clamp((f - (BEAT.sale - 2)) / 6), fallen = f >= BEAT.sale + 4;
    if (!fallen) out.push({ id: "sign", key: "sign", draw: K.fenceSign(), cw: 600, ch: 300, k: 0.9, h: 0.5, rotY: 0, blob: false, shadow: true,
      pos: [3.05, 0.72 - 0.7 * easeIn(tf), 40.12], roll: -0.6 * easeIn(tf) + 0.05 * Math.sin(f * 0.08) });
    else out.push({ id: "signF", key: "sign", draw: K.fenceSign(), cw: 600, ch: 300, k: 0.9, h: 0.5, flat: true, rotY: 0.35, blob: false, shadow: false, pos: [3.1, 0.09, 40.55] });
    if (f >= BEAT.sale + 4 && f < BEAT.sale + 16) { const t = (f - BEAT.sale - 4) / 12; out.push(fx("dust", "d" + q(t, 0.08), K.puff(t), [3.1, 0.09, 40.6], 0.8, 300, 260)); }
  }
  return out;
};
// ---------- HUD: big hook words on frame 0, comment question at the end (Luckiest Guy, white with dark outline) ----------
export const hudAt = (f) => {
  const out = [];
  if (f < 70) out.push({ text: "SOLD... TWICE?!", y: 250, size: 118, alpha: f < 60 ? 1 : 1 - (f - 60) / 10, scale: 1 + 0.06 * Math.max(0, 1 - f / 8) });
  if (f >= 1150) out.push({ text: "WOULD YOU HAVE\nBOUGHT IT?\nYES OR NO", y: 300, size: 84, alpha: Math.min(1, (f - 1150) / 8), color: "#ffe066" });
  return out;
};
