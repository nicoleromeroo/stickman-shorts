// Generic cast helpers on the Pen/bodyFront library (toonbase.js).
// person(outfit, opts) -> card draw fn. opts = bodyFront opts (expr, mode, phase, facing, look, blink, tilt, headTilt, seed)
// + armL/armR presets ("up","raise","out","hold","hip","face","whisper") + heldL/heldR(p,hx,hy,u) prop painters + blush 0..1.
// Outfit hats: "tophat","cap","hair","bonnet","shako","bowler" (+ bowler: colour). Builds: adult / stout / kid.
import { Pen, bodyFront, INK, SKIN, SKINS, shade, mix, fxPuff, fxBurst } from "./toonbase.js";
export { Pen, INK, SKIN, SKINS, shade, mix };
/** quick outfit: coat colour + extras */
export const outfit = (jacket, extra = {}) => ({ pants: "#3b3f52", boots: "#4a3426", buttons: "#2b2b2b", ...extra, jacket });

/** bowler hat drawn on top of the head (after-callback) */
const bowler = (col) => (p, m) => {
  const { H, u, crown } = m, cx = 300;
  const yb = crown + 0.26 * 2 * H.b;
  p.ell(cx, yb - 2 * u, 46 * u, 40 * u, col, 4.2 * u, 180, 360);
  p.poly([[cx - 46 * u, yb - 2 * u], [cx + 46 * u, yb - 2 * u], [cx + 46 * u, yb + 4 * u], [cx - 46 * u, yb + 4 * u]], shade(col, 0.6), 0);
  p.ell(cx, yb + 3 * u, 62 * u, 9 * u, shade(col, 0.85), 4.2 * u);
  p.ell(cx - 14 * u, yb - 22 * u, 10 * u, 6 * u, shade(col, 1.35), 0);
};

export const txt = (p, s, x, y, size, col, rot = 0, font = "Georgia, serif") => {
  const g = p.g, [X, Y] = p.P(x, y); g.save(); g.translate(X, Y); g.rotate(rot); g.fillStyle = col;
  g.font = `bold ${size}px ${font}`; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(s, 0, 0); g.restore();
};
export const envelope = (p, hx, hy, u) => {
  const w = 120, h = 74, cx = hx + 6, cy = hy - 18;
  p.poly([[cx - w / 2, cy - h / 2], [cx + w / 2, cy - h / 2], [cx + w / 2, cy + h / 2], [cx - w / 2, cy + h / 2]], "#efe0b8", 5);
  p.stroke([[cx - w / 2 + 4, cy - h / 2 + 4], [cx, cy + 6], [cx + w / 2 - 4, cy - h / 2 + 4]], 4);
  p.poly([[cx - 14, cy + 22], [cx + 14, cy + 22], [cx + 14, cy + 4], [cx - 14, cy + 4]], "#c0353a", 0);
  p.ell(cx + 36, cy - 30, 26, 10, "#7fb069", 4); // banknotes poking out
};
export const suitcase = (p, hx, hy, u) => {
  const w = 150, h = 104, cx = hx + 4, cy = hy + 70;
  p.stroke([[hx - 24, hy + 18], [hx - 20, hy - 6], [hx + 28, hy - 6], [hx + 32, hy + 18]], 9);
  p.poly([[cx - w / 2, cy - h / 2], [cx + w / 2, cy - h / 2], [cx + w / 2, cy + h / 2], [cx - w / 2, cy + h / 2]], "#8a5a34", 6);
  p.band([[cx - w / 2, cy], [cx + w / 2, cy]], "#5a3a22", 10, 2);
  p.ell(cx + 40, cy - 22, 16, 12, "#7fb069", 3); p.ell(cx - 30, cy - 24, 14, 10, "#7fb069", 3);
};
/** character card draw fn. o: outfit, opts: bodyFront opts + {hold:{R,L}: prop fns, after} */
export const person = (o, opts = {}) => (p) => {
  const hats = o.hat === "bowler" ? { ...o, hat: null } : o;
  const after = (pp, m) => { if (o.hat === "bowler") bowler(o.bowler)(pp, m); if (opts.after) opts.after(pp, m); };
  const held = (pp, side, hx, hy, u) => { const fn = side > 0 ? opts.heldR : opts.heldL; if (fn) fn(pp, hx, hy, u); };
  bodyFront(p, hats, { ...opts, after, held });
};
/** bust only (train window): clip to the top part of the card */
export const bust = (draw, cut = 560) => (p) => { p.clip([[0, 0], [600, 0], [600, cut], [0, cut]], () => draw(p)); };

// ---------------- props & effects (own canvases) ----------------
export const banknote = (seed) => (p) => {
  p.poly([[20, 30], [180, 20], [186, 96], [26, 106]], "#9cc77f", 7);
  p.ell(103, 63, 26, 22, "#6f9e58", 4);
  txt(p, "F", 103, 66, 34, "#2e5a2a");
};
export const rustFlake = (seed) => (p) => { p.poly([[20, 40], [70, 18], [96, 52], [60, 88], [24, 74]], seed % 2 ? "#c4622d" : "#a84f25", 6); };
export const leaf = (seed) => (p) => {
  const c = ["#e08a2c", "#d4552e", "#e8b83a"][seed % 3];
  p.poly([[50, 6], [86, 40], [70, 84], [50, 96], [30, 84], [14, 40]], c, 6); p.stroke([[50, 14], [50, 92]], 4);
};
export const steam = (t) => (p) => {
  const g = p.g, k = 0.6 + 0.4 * t; g.globalAlpha = 1 - 0.7 * t;
  for (const [x, y, r] of [[200, 230, 90], [290, 190, 110], [370, 240, 85], [260, 280, 100]]) p.ell(x, y, r * k, r * k * 0.85, "#f4f1ea", 8);
  g.globalAlpha = 1;
};
export const puff = (t) => (p) => fxPuff(p, t);
export const burst = (t, col = "#fff3b0") => (p) => fxBurst(p, t, col);
export const zzz = () => (p) => {};
export const contactBlob = () => (p) => { p.ell(300, 100, 280, 90, "rgba(20,12,30,0.32)", 0); };
