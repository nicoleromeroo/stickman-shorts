// Pure motion helpers: easing, camera key interpolation, idles, blinks, walks.
export const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
export const lerp = (a, b, t) => a + (b - a) * t;
export const ss = (t) => { t = clamp(t); return t * t * t * (t * (t * 6 - 15) + 10); }; // smootherstep
export const easeOut = (t) => 1 - Math.pow(1 - clamp(t), 3);
export const easeIn = (t) => Math.pow(clamp(t), 3);
export const back = (t, s = 1.7) => { t = clamp(t) - 1; return t * t * ((s + 1) * t + s) + 1; };
export const spring = (t, k = 7, d = 5) => { t = Math.max(0, t); return 1 - Math.exp(-d * t) * Math.cos(k * t); };
export const ramp = (f, a, b, fn = ss) => fn((f - a) / (b - a));
export const v3 = (a, b, t) => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
const cr = (p0, p1, p2, p3, t) => { const t2 = t * t, t3 = t2 * t; return 0.5 * (2 * p1 + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 + (-p0 + 3 * p1 - 3 * p2 + p3) * t3); };
export const path = (pts, t) => { // Catmull-Rom through pts, t 0..1
  const n = pts.length - 1, x = clamp(t) * n, i = Math.min(n - 1, Math.floor(x)), u = x - i;
  const P = (k) => pts[Math.max(0, Math.min(n, k))];
  return [0, 1, 2].map((c) => cr(P(i - 1)[c], P(i)[c], P(i + 1)[c], P(i + 2)[c], u));
};
/** keys: [{f, pos, look, fov, roll, ease?, via?}] -> camera at frame f; glide between consecutive keys, creep on holds */
export const camFromKeys = (keys, f, { creep = 0.0018, kicks = [] } = {}) => {
  let k = 0; while (k < keys.length - 1 && f >= keys[k + 1].f) k++;
  const A = keys[k], B = keys[Math.min(k + 1, keys.length - 1)];
  let pos, look, fov, roll;
  if (B === A || f >= B.f) { pos = A.pos; look = A.look; fov = A.fov; roll = A.roll || 0; }
  else {
    const raw = (f - A.f) / (B.f - A.f), t = (B.ease || ss)(raw);
    pos = B.via ? path([A.pos, ...B.via, B.pos], t) : v3(A.pos, B.pos, t);
    look = v3(A.look, B.look, t); fov = lerp(A.fov, B.fov, t); roll = lerp(A.roll || 0, B.roll || 0, t);
  }
  // creep: slow push toward look (never static)
  const since = f - keys[0].f, d = [look[0] - pos[0], look[1] - pos[1], look[2] - pos[2]];
  const c = creep * since * 0.5; pos = [pos[0] + d[0] * c * 0.05, pos[1] + d[1] * c * 0.05, pos[2] + d[2] * c * 0.05];
  fov = fov * (1 - Math.min(0.08, creep * since * 0.04));
  let sx = 0, sy = 0;
  for (const kk of kicks) { const dt = f - kk.f; if (dt >= 0 && dt < 8) { const a = (kk.a || 1) * (1 - dt / 8) * (dt % 2 ? -1 : 1); sx += a * 0.6; sy += a * 0.35; roll += a * 0.4; } }
  return { pos, look, fov, roll, shake: [sx, sy] };
};
const h = (n) => { const x = Math.sin(n * 91.345 + 3.1) * 47453.5453; return x - Math.floor(x); };
/** idle breathing / sway, returns {dy (frac of height), tilt (deg), sx} */
export const idle = (f, seed) => ({ dy: 0.006 * Math.sin(f * 0.09 + seed * 2.1), tilt: 1.2 * Math.sin(f * 0.045 + seed), sx: 0.01 * Math.sin(f * 0.03 + seed * 5) });
/** blink lid amount 0..1 for frame f */
export const blinkAt = (f, seed) => {
  let t = 0, i = 0;
  while (t <= f + 4) { const gap = 15 + Math.floor(h(seed * 13 + i) * 55); if (f >= t && f < t + 4) return [0.5, 1, 1, 0.5][f - t]; t += gap; i++; }
  return 0;
};
export const walk = (f, f0, speed = 1.3, stepHz = 1.9) => { const t = Math.max(0, f - f0) / 30; return { dist: t * speed, phase: (t * stepHz) % 1 }; };
export const q = (x, s = 0.04) => Math.round(x / s) * s;
