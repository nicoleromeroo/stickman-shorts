// Painted canvas textures: flat colour, dark seams, a little hand jitter. All deterministic.
import * as THREE from "./node_modules/three/build/three.module.js";

export const rng = (seed) => { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); };
const cache = new Map();
export const ctex = (key, w, h, draw, { repeat = true, srgb = true } = {}) => {
  if (cache.has(key)) return cache.get(key);
  const c = document.createElement("canvas"); c.width = w; c.height = h;
  const g = c.getContext("2d"); draw(g, rng(key.length * 7919 + w), w, h);
  const t = new THREE.CanvasTexture(c);
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  if (repeat) t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.anisotropy = 4; t.generateMipmaps = true; t.minFilter = THREE.LinearMipmapLinearFilter;
  cache.set(key, t); return t;
};
const hsl = (hex) => { const c = new THREE.Color(hex); const o = {}; c.getHSL(o); return o; };
export const jit = (r, hex, dv = 0.06, dh = 0.01) => { const o = hsl(hex); const c = new THREE.Color(); c.setHSL((o.h + (r() - 0.5) * dh + 1) % 1, o.s, Math.min(1, Math.max(0, o.l + (r() - 0.5) * dv))); return "#" + c.getHexString(); };
const seamCol = (hex, k = 0.55) => { const c = new THREE.Color(hex).multiplyScalar(k); return "#" + c.getHexString(); };

/** iron lattice: flat bronze-brown with dark X bracing + girder frame; rust patches */
export const lattice = (key, base = "#8b6a4c", cells = 2, rust = 0) => ctex("lat" + key, 512, 512, (g, r, W, H) => {
  g.fillStyle = base; g.fillRect(0, 0, W, H);
  const dark = seamCol(base, 0.36), mid = seamCol(base, 0.6), n = cells, s = W / n;
  // shadowed openings between girders
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
    const x = i * s, y = j * s, m = s * 0.11;
    g.fillStyle = mid;
    for (const tri of [[[x + m, y + m], [x + s - m, y + m], [x + s / 2, y + s / 2]], [[x + m, y + s - m], [x + s - m, y + s - m], [x + s / 2, y + s / 2]],
      [[x + m, y + m * 1.5], [x + m, y + s - m * 1.5], [x + s / 2 - m * 0.4, y + s / 2]], [[x + s - m, y + m * 1.5], [x + s - m, y + s - m * 1.5], [x + s / 2 + m * 0.4, y + s / 2]]]) {
      g.beginPath(); g.moveTo(...tri[0]); g.lineTo(...tri[1]); g.lineTo(...tri[2]); g.closePath(); g.fill();
    }
  }
  g.strokeStyle = dark; g.lineCap = "round";
  for (let i = 0; i <= n; i++) { g.lineWidth = 7; g.beginPath(); g.moveTo(i * s, 0); g.lineTo(i * s, H); g.stroke(); g.beginPath(); g.moveTo(0, i * s); g.lineTo(W, i * s); g.stroke(); }
  g.lineWidth = 5;
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
    const x = i * s, y = j * s;
    g.beginPath(); g.moveTo(x + 4, y + 4); g.lineTo(x + s - 4, y + s - 4); g.moveTo(x + s - 4, y + 4); g.lineTo(x + 4, y + s - 4); g.stroke();
  }
  // rivet ticks
  g.fillStyle = seamCol(base, 1.25);
  for (let i = 0; i <= n; i++) for (let k = 0; k < 16; k++) g.fillRect(i * s + 5, k * (H / 16) + 3, 3, 3);
  if (rust) for (let k = 0; k < 26 * rust; k++) {
    const x = r() * W, y = r() * H, rr = 8 + r() * 26;
    g.fillStyle = jit(r, "#c4622d", 0.12, 0.02); g.globalAlpha = 0.85;
    g.beginPath(); for (let a = 0; a < 12; a++) { const t = (a / 12) * Math.PI * 2, q = rr * (0.6 + 0.5 * r()); g.lineTo(x + Math.cos(t) * q, y + Math.sin(t) * q * 0.8); } g.closePath(); g.fill();
    g.fillStyle = "#e08a4a"; g.beginPath(); g.arc(x - rr * 0.2, y - rr * 0.2, rr * 0.3, 0, 7); g.fill();
    g.globalAlpha = 1;
  }
});

/** Haussmann facade bay: cream stone, tall window with shutters, iron balcony on some floors. One tile = 1 bay x 1 floor. */
export const facade = (key, wall = "#e9dcc2", shutter = "#5f7d8c", balcony = true, lit = false) => ctex("fac" + key, 256, 256, (g, r, W, H) => {
  g.fillStyle = wall; g.fillRect(0, 0, W, H);
  // stone courses
  g.strokeStyle = seamCol(wall, 0.82); g.lineWidth = 2;
  for (let y = 32; y < H; y += 42) { g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); }
  g.fillStyle = seamCol(wall, 0.9); g.fillRect(0, H - 14, W, 14); // cornice band
  g.fillStyle = seamCol(wall, 0.6); g.fillRect(0, H - 14, W, 3);
  const wx = 80, wy = 52, ww = 96, wh = 150;
  g.fillStyle = shutter; g.fillRect(wx - 34, wy, 30, wh); g.fillRect(wx + ww + 4, wy, 30, wh);
  g.strokeStyle = seamCol(shutter, 0.6); g.lineWidth = 2;
  for (let y = wy + 8; y < wy + wh; y += 10) { g.beginPath(); g.moveTo(wx - 32, y); g.lineTo(wx - 6, y); g.moveTo(wx + ww + 6, y); g.lineTo(wx + ww + 32, y); g.stroke(); }
  g.fillStyle = seamCol(wall, 0.7); g.fillRect(wx - 6, wy - 6, ww + 12, wh + 10);
  g.fillStyle = lit ? "#ffd98a" : "#36465e"; g.fillRect(wx, wy, ww, wh);
  if (!lit) { g.fillStyle = "#4f6382"; g.fillRect(wx + 6, wy + 6, ww / 2 - 9, wh * 0.45); }
  g.fillStyle = "#1d1b22"; g.fillRect(wx + ww / 2 - 3, wy, 6, wh); g.fillRect(wx, wy + wh * 0.5 - 3, ww, 6);
  g.fillStyle = seamCol(wall, 1.05); g.fillRect(wx - 10, wy + wh + 2, ww + 20, 10); // sill
  if (balcony) { // wrought iron rail
    g.strokeStyle = "#1e1c20"; g.lineWidth = 4; const by = wy + wh - 44;
    g.beginPath(); g.moveTo(wx - 12, by); g.lineTo(wx + ww + 12, by); g.moveTo(wx - 12, wy + wh + 2); g.lineTo(wx + ww + 12, wy + wh + 2); g.stroke();
    g.lineWidth = 2.5;
    for (let x = wx - 8; x < wx + ww + 12; x += 12) { g.beginPath(); g.moveTo(x, by); g.lineTo(x, wy + wh + 2); g.stroke(); g.beginPath(); g.arc(x + 6, by + 14, 5, 0, 7); g.stroke(); }
  }
});
export const shopfront = (key, col = "#2f5f4a", sign = null) => ctex("shop" + key, 512, 256, (g, r, W, H) => {
  g.fillStyle = "#e3d3b4"; g.fillRect(0, 0, W, H);
  g.fillStyle = col; g.fillRect(20, 40, W - 40, H - 40);
  g.fillStyle = "#ffe2a0"; g.fillRect(44, 80, W / 2 - 70, H - 80); g.fillRect(W / 2 + 26, 80, W / 2 - 70, H - 80);
  g.fillStyle = "#1d1b22"; g.fillRect(W / 2 - 26, 70, 52, H - 70);
  g.fillStyle = seamCol(col, 0.5); g.fillRect(20, 40, W - 40, 8);
  if (sign) { g.fillStyle = "#f4ead2"; g.font = "bold 34px Georgia, serif"; g.textAlign = "center"; g.fillText(sign, W / 2, 34); }
});
export const slate = (key = "slate", col = "#5d6b80") => ctex("slate" + key, 256, 256, (g, r, W, H) => {
  g.fillStyle = col; g.fillRect(0, 0, W, H);
  for (let y = 0; y < H; y += 21) for (let x = (y / 21) % 2 ? -16 : 0; x < W; x += 32) {
    g.fillStyle = jit(r, col, 0.06); g.fillRect(x + 1, y + 1, 30, 19);
  }
  g.fillStyle = seamCol(col, 0.55);
  for (let y = 0; y < H; y += 21) g.fillRect(0, y, W, 2);
  // dormer windows
  g.fillStyle = "#e9dcc2"; g.fillRect(96, 120, 64, 80); g.fillStyle = "#36465e"; g.fillRect(106, 132, 44, 60);
  g.fillStyle = seamCol(col, 0.5); g.fillRect(92, 116, 72, 6);
});
export const grass = (key = "grass", col = "#79a84a") => ctex("grass" + key, 512, 512, (g, r, W, H) => {
  g.fillStyle = col; g.fillRect(0, 0, W, H);
  for (let k = 0; k < 900; k++) { g.fillStyle = jit(r, col, 0.09); const x = r() * W, y = r() * H; g.fillRect(x, y, 3 + r() * 5, 2); }
  for (let k = 0; k < 70; k++) { g.strokeStyle = seamCol(col, 0.8); g.lineWidth = 2; const x = r() * W, y = r() * H; g.beginPath(); g.moveTo(x, y); g.lineTo(x + 3, y - 8); g.moveTo(x + 4, y); g.lineTo(x + 8, y - 6); g.stroke(); }
});
export const gravel = () => ctex("gravel", 512, 512, (g, r, W, H) => {
  g.fillStyle = "#d8c7a2"; g.fillRect(0, 0, W, H);
  for (let k = 0; k < 1600; k++) { g.fillStyle = jit(r, "#cdb98f", 0.14); g.beginPath(); g.arc(r() * W, r() * H, 1 + r() * 2.5, 0, 7); g.fill(); }
});
export const cobble = () => ctex("cobble", 512, 512, (g, r, W, H) => {
  g.fillStyle = "#6f6a66"; g.fillRect(0, 0, W, H);
  for (let y = 0; y < H; y += 32) for (let x = (y / 32) % 2 ? -20 : 0; x < W; x += 40) {
    g.fillStyle = jit(r, "#a9a196", 0.08); g.beginPath(); g.roundRect(x + 3, y + 3, 34, 26, 7); g.fill();
  }
});
export const water = () => ctex("water", 512, 512, (g, r, W, H) => {
  g.fillStyle = "#4f86a8"; g.fillRect(0, 0, W, H);
  g.strokeStyle = "#8fc0d8"; g.lineWidth = 3; g.lineCap = "round";
  for (let k = 0; k < 40; k++) { const x = r() * W, y = r() * H, l = 20 + r() * 40; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + l / 2, y - 5, x + l, y); g.stroke(); }
});
export const panel = (key, wall = "#f1e3c4", gold = "#c8a24a") => ctex("pan" + key, 512, 512, (g, r, W, H) => {
  g.fillStyle = wall; g.fillRect(0, 0, W, H);
  g.fillStyle = seamCol(wall, 0.85); g.fillRect(0, H - 90, W, 90); // dado
  g.strokeStyle = gold; g.lineWidth = 9; g.strokeRect(46, 40, W - 92, H - 180);
  g.lineWidth = 3; g.strokeStyle = seamCol(gold, 0.6); g.strokeRect(60, 54, W - 120, H - 208);
  g.fillStyle = gold;
  for (const [x, y] of [[46, 40], [W - 46, 40], [46, H - 140], [W - 46, H - 140]]) { g.beginPath(); g.arc(x, y, 14, 0, 7); g.fill(); }
  g.strokeStyle = gold; g.lineWidth = 5; g.strokeRect(46, H - 70, W - 92, 44);
  g.fillStyle = seamCol(gold, 0.55); g.fillRect(0, H - 92, W, 4); g.fillRect(0, 0, W, 6);
});
export const carpet = () => ctex("carpet", 512, 512, (g, r, W, H) => {
  g.fillStyle = "#9b2d35"; g.fillRect(0, 0, W, H);
  g.strokeStyle = "#d4a84f"; g.lineWidth = 6; g.strokeRect(30, 30, W - 60, H - 60);
  g.fillStyle = "#7d222b";
  for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) { g.save(); g.translate(64 + i * 128, 64 + j * 128); g.rotate(Math.PI / 4); g.fillRect(-26, -26, 52, 52); g.restore(); }
  g.fillStyle = "#d4a84f"; for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) { g.beginPath(); g.arc(64 + i * 128, 64 + j * 128, 8, 0, 7); g.fill(); }
});
export const parquet = () => ctex("parquet", 512, 512, (g, r, W, H) => {
  for (let y = 0; y < H; y += 32) for (let x = 0; x < W; x += 128) {
    g.fillStyle = jit(r, "#9a6a3e", 0.08); g.fillRect(x + ((y / 32) % 2) * 64, y, 128, 32);
  }
  g.fillStyle = "#4a2f1a"; for (let y = 0; y < H; y += 32) g.fillRect(0, y, W, 2);
});
export const cloth = () => ctex("cloth", 256, 256, (g, r, W, H) => {
  g.fillStyle = "#2f6b4f"; g.fillRect(0, 0, W, H);
  g.strokeStyle = "#285c44"; g.lineWidth = 2; for (let x = 0; x < W; x += 16) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, H); g.stroke(); }
});
export const wood = (key = "wood", col = "#7a4e2c") => ctex("wood" + key, 256, 256, (g, r, W, H) => {
  g.fillStyle = col; g.fillRect(0, 0, W, H);
  g.strokeStyle = seamCol(col, 0.7); g.lineWidth = 2;
  for (let y = 6; y < H; y += 14) { g.beginPath(); g.moveTo(0, y); for (let x = 0; x <= W; x += 32) g.lineTo(x, y + Math.sin(x * 0.05 + y) * 2); g.stroke(); }
  g.fillStyle = seamCol(col, 0.5); g.fillRect(0, 0, W, 3);
});
export const carriage = (key = "car", col = "#7a2e2e") => ctex("car" + key, 512, 256, (g, r, W, H) => {
  g.fillStyle = col; g.fillRect(0, 0, W, H);
  g.fillStyle = seamCol(col, 0.7); g.fillRect(0, H * 0.62, W, 6); g.fillRect(0, H - 22, W, 22);
  g.fillStyle = "#e7c36a"; g.fillRect(0, 26, W, 5);
  for (let x = 22; x < W; x += 100) {
    g.fillStyle = seamCol(col, 0.5); g.fillRect(x - 5, 46, 72, 76);
    g.fillStyle = "#ffe3a6"; g.fillRect(x, 50, 62, 68);
    g.fillStyle = "#e8c882"; g.fillRect(x, 50, 62, 18);
  }
});
export const rails = () => ctex("rails", 256, 256, (g, r, W, H) => {
  g.fillStyle = "#8d7f6c"; g.fillRect(0, 0, W, H);
  for (let k = 0; k < 500; k++) { g.fillStyle = jit(r, "#7d705f", 0.15); g.fillRect(r() * W, r() * H, 3, 3); }
  for (let x = 8; x < W; x += 32) { g.fillStyle = "#5a3e28"; g.fillRect(x, 40, 18, H - 80); }
  g.fillStyle = "#3a3a40"; g.fillRect(0, 70, W, 10); g.fillRect(0, H - 80, W, 10);
  g.fillStyle = "#b9bcc4"; g.fillRect(0, 70, W, 3); g.fillRect(0, H - 80, W, 3);
});
export const CLOUD = { lit: "#fbf8f1", mid: "#e4e8f4", shade: "#c5cdea" };
export const CLOUD_GOLD = { lit: "#ffd9b0", mid: "#f4a991", shade: "#a993c6" };
export const cloudTex = (seed, pal = CLOUD) => ctex(`cloud_${pal.lit}_${seed}`, 512, 256, (g, r, W, H) => {
  const blobs = []; for (let k = 0; k < 9; k++) blobs.push([70 + r() * (W - 140), H * 0.55 - r() * 70, 40 + r() * 55]);
  const draw = (col, dy, k) => { g.fillStyle = col; for (const [x, y, rr] of blobs) { g.beginPath(); g.arc(x, y + dy, rr * k, 0, 7); g.fill(); } g.fillRect(60, H * 0.55 + dy - 10, W - 120, 40 * k); };
  draw(pal.shade, 14, 1); draw(pal.mid, 6, 0.96); draw(pal.lit, -4, 0.86);
}, { repeat: false });
/** hotel / police enamel signs: flat, unlit */
export const signTex = (key, text, bg = "#1f3d6b", fg = "#f4ead2", w = 512, h = 128, font = "bold 72px Georgia, serif") => ctex("sign" + key, w, h, (g) => {
  g.fillStyle = bg; g.fillRect(0, 0, w, h); g.strokeStyle = fg; g.lineWidth = 6; g.strokeRect(10, 10, w - 20, h - 20);
  g.fillStyle = fg; g.font = font; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(text, w / 2, h / 2 + 4);
}, { repeat: false });
