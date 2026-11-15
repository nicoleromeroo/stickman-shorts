// Stickman Shorts engine: drawing helpers, stickman, captions, scene runner.
const W = 1080, H = 1920;
const c = document.getElementById('c'); let ctx = c.getContext('2d');
const off = document.createElement('canvas'); off.width = W; off.height = H;
let VO = window.VO; const L = VO.lines;
const INK = '#151515';
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;
const inv = (a, b, v) => clamp((v - a) / (b - a));
const eio = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
const eo = t => 1 - Math.pow(1 - t, 3);
const eob = t => { const c1 = 1.9, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); };
function rnd(i) { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); }
// time at a fraction through line i (approximate word timing)
const at = (i, f = 0) => L[i].start + (L[i].end - L[i].start) * f;
// time of the word that starts with `word` in line i (by character position)
function wt(i, word) { const s = L[i].text.toLowerCase(); const p = s.indexOf(word.toLowerCase()); return at(i, p < 0 ? 0 : p / s.length); }

function rr(x, y, w, h, r, g = ctx) { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); }
function line(x1, y1, x2, y2, w, col = INK) { ctx.strokeStyle = col; ctx.lineWidth = w; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); }
function circ(x, y, r, fill, stroke, lw) { ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); if (fill) { ctx.fillStyle = fill; ctx.fill(); } if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw; ctx.stroke(); } }
function box(x, y, w, h, fill, r = 10, lw = 8) { ctx.fillStyle = fill; ctx.strokeStyle = INK; ctx.lineWidth = lw; ctx.lineJoin = 'round'; rr(x, y, w, h, r); ctx.fill(); if (lw) ctx.stroke(); }
function txt(s, x, y, size, fill, opt = {}) {
  s = String(s);
  if (s.includes('€') && (opt.font || 'Lucky') === 'Lucky' && !opt._run) {
    // draw € with a font that has the glyph, rest with the cartoon font
    const runs = s.split(/(€)/).filter(Boolean); ctx.save();
    const fontOf = r => r === '€' ? `900 ${size}px Nun` : `${size}px Lucky`;
    const widths = runs.map(r => { ctx.font = fontOf(r); return ctx.measureText(r).width; }); ctx.restore();
    const total = widths.reduce((a, b) => a + b, 0); const al = opt.align || 'center';
    let cx = al === 'center' ? x - total / 2 : al === 'right' ? x - total : x;
    runs.forEach((r, i) => { txt(r, cx, y, size, fill, Object.assign({}, opt, { align: 'left', _run: true, font: r === '€' ? 'Nun' : 'Lucky', weight: r === '€' ? '900 ' : '' })); cx += widths[i]; });
    return;
  }
  ctx.save(); ctx.font = `${opt.weight || ''}${size}px ${opt.font || 'Lucky'}, Nun, sans-serif`; ctx.textAlign = opt.align || 'center'; ctx.textBaseline = 'middle';
  if (opt.stroke !== false) { ctx.lineJoin = 'round'; ctx.strokeStyle = opt.strokeCol || INK; ctx.lineWidth = opt.lw || size * 0.18; ctx.strokeText(s, x, y); }
  ctx.fillStyle = fill; ctx.fillText(s, x, y); ctx.restore();
}
function sparkle(x, y, r, a, col = '#fff3a0') {
  ctx.save(); ctx.globalAlpha = clamp(a); ctx.translate(x, y); ctx.fillStyle = col; ctx.strokeStyle = INK; ctx.lineWidth = 5; ctx.beginPath();
  for (let i = 0; i < 8; i++) { const r2 = i % 2 ? r * .35 : r; const an = i * Math.PI / 4; ctx.lineTo(Math.cos(an) * r2, Math.sin(an) * r2); }
  ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.restore();
}
function impact(x, y, r, a) { ctx.save(); ctx.globalAlpha = clamp(a); for (let i = 0; i < 8; i++) { const an = i * Math.PI / 4 + .3; line(x + Math.cos(an) * r * .55, y + Math.sin(an) * r * .55, x + Math.cos(an) * r, y + Math.sin(an) * r, 9); } ctx.restore(); }
function sweat(x, y, a) { ctx.save(); ctx.globalAlpha = clamp(a); ctx.fillStyle = '#7cc8ff'; ctx.strokeStyle = INK; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(x, y - 26); ctx.quadraticCurveTo(x + 18, y, x, y + 14); ctx.quadraticCurveTo(x - 18, y, x, y - 26); ctx.fill(); ctx.stroke(); ctx.restore(); }
function vignette(a) { const g = ctx.createRadialGradient(W / 2, H * .5, H * .25, W / 2, H * .5, H * .75); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, `rgba(0,0,0,${a})`); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); }

// ---------- stickman ----------
function limb(x, y, a1, a2, l1, l2, w, col) {
  const ex = x + Math.sin(a1) * l1, ey = y + Math.cos(a1) * l1; const hx = ex + Math.sin(a1 + a2) * l2, hy = ey + Math.cos(a1 + a2) * l2;
  if (col) { line(x, y, ex, ey, w + 10, INK); line(ex, ey, hx, hy, w + 10, INK); line(x, y, ex, ey, w, col); line(ex, ey, hx, hy, w, col); }
  else { line(x, y, ex, ey, w); line(ex, ey, hx, hy, w); }
  return [hx, hy];
}
function stick(o) {
  const s = o.s || 1; ctx.save(); ctx.translate(o.x, o.y); ctx.scale(s * (o.flip ? -1 : 1), s); ctx.rotate(o.lean || 0);
  const hipY = -150 - (o.bob || 0), shY = hipY - 140, headY = shY - 78, R = 62;
  if (o.shadow !== false) { ctx.save(); ctx.globalAlpha = .15; ctx.fillStyle = '#000'; ctx.beginPath(); ctx.ellipse(0, (o.bob || 0) + 4, 85, 14, 0, 0, 7); ctx.fill(); ctx.restore(); }
  const P = Object.assign({ lt: 0, ls: 0, rt: 0, rs: 0, la: .35, le: .3, ra: -.35, re: -.3 }, o.pose || {});
  const pant = o.pants || '#2f6fd0', skin = o.skin || '#fff';
  const f1 = limb(-14, hipY, P.lt, P.ls, 78, 78, 20, pant), f2 = limb(14, hipY, P.rt, P.rs, 78, 78, 20, pant);
  ctx.fillStyle = INK; ctx.beginPath(); ctx.ellipse(f1[0] + 12, f1[1] + 4, 26, 12, 0, 0, 7); ctx.fill(); ctx.beginPath(); ctx.ellipse(f2[0] + 12, f2[1] + 4, 26, 12, 0, 0, 7); ctx.fill();
  const h2 = limb(-30, shY + 18, P.la, P.le, 72, 68, 13); circ(h2[0], h2[1], 13, o.zombie ? skin : INK, INK, 5);
  if (o.holdBack) o.holdBack(h2[0], h2[1]);
  ctx.fillStyle = o.shirt || '#e8453c'; ctx.strokeStyle = INK; ctx.lineWidth = 9; ctx.lineJoin = 'round';
  ctx.beginPath(); ctx.moveTo(-46, shY + 4); ctx.quadraticCurveTo(0, shY - 10, 46, shY + 4);
  if (o.zombie) { ctx.lineTo(40, hipY + 8); ctx.lineTo(24, hipY - 6); ctx.lineTo(10, hipY + 14); ctx.lineTo(-6, hipY - 4); ctx.lineTo(-22, hipY + 12); ctx.lineTo(-40, hipY + 8); }
  else { ctx.lineTo(40, hipY + 8); ctx.quadraticCurveTo(0, hipY + 18, -40, hipY + 8); }
  ctx.closePath(); ctx.fill(); ctx.stroke();
  if (o.hood) { ctx.strokeStyle = INK; ctx.lineWidth = 5; line(-10, shY + 6, -12, shY + 60, 5); line(10, shY + 6, 12, shY + 60, 5); }
  if (o.apron) { ctx.fillStyle = o.apron; rr(-30, shY + 30, 60, hipY - shY - 20, 8); ctx.fill(); ctx.stroke(); }
  const h1 = limb(30, shY + 18, P.ra, P.re, 72, 68, 13); circ(h1[0], h1[1], 13, o.zombie ? skin : INK, INK, 5);
  if (o.hold) o.hold(h1[0], h1[1]);
  line(0, shY, 0, headY + R - 6, 12);
  if (o.scarf) { box(-42, shY - 26, 84, 32, o.scarf, 14, 6); line(18, shY, 30, shY + 80, 18, INK); line(18, shY, 30, shY + 80, 10, o.scarf); }
  ctx.save(); ctx.translate(0, headY); ctx.rotate(o.tilt || 0);
  circ(0, 0, R, skin, INK, 9);
  if (o.hair) { ctx.fillStyle = o.hair; ctx.strokeStyle = INK; ctx.lineWidth = 7; ctx.beginPath(); ctx.arc(0, 0, R, Math.PI * 1.08, Math.PI * 1.92); ctx.quadraticCurveTo(10, -30, -58, -22); ctx.closePath(); ctx.fill(); ctx.stroke(); }
  const E = o.eyes || 'norm', ey = -8, ex = 22, lx = (o.look || 0) * 6, ly = (o.lookY || 0) * 5;
  if (E === 'closed') { ctx.strokeStyle = INK; ctx.lineWidth = 7; for (const sx of [-1, 1]) { ctx.beginPath(); ctx.arc(sx * ex, ey, 11, Math.PI * .1, Math.PI * .9); ctx.stroke(); } }
  else if (E === 'zombie') { for (const sx of [-1, 1]) { circ(sx * ex, ey, 16, '#f4f4d0', INK, 5); circ(sx * ex + lx, ey + 2, 4, INK); } }
  else { const er = E === 'huge' ? 23 : 16, pr = E === 'huge' ? 8 : 8; for (const sx of [-1, 1]) { circ(sx * ex, ey, er, '#fff', INK, 5); circ(sx * ex + lx, ey + 2 + ly, pr, INK); } }
  if (o.brows) { const b = o.brows; line(-36, -40 - b * 6, -12, -36 + b * 2, 6); line(36, -40 - b * 6, 12, -36 + b * 2, 6); }
  const M = o.mouth || 'smile'; ctx.strokeStyle = INK; ctx.lineWidth = 7; ctx.lineCap = 'round';
  if (M === 'smile') { ctx.beginPath(); ctx.arc(0, 18, 20, .15 * Math.PI, .85 * Math.PI); ctx.stroke(); }
  else if (M === 'grin') { ctx.fillStyle = '#7a1f1f'; ctx.beginPath(); ctx.moveTo(-26, 18); ctx.quadraticCurveTo(0, 58, 26, 18); ctx.closePath(); ctx.fill(); ctx.stroke(); }
  else if (M === 'o') { circ(0, 30, o.mouthOpen || 12, '#7a1f1f', INK, 6); }
  else if (M === 'scream') { ctx.fillStyle = '#7a1f1f'; ctx.beginPath(); ctx.ellipse(0, 32, 18, 26, 0, 0, 7); ctx.fill(); ctx.stroke(); }
  else if (M === 'flat') { line(-14, 28, 14, 28, 7); }
  else if (M === 'frown') { ctx.beginPath(); ctx.arc(0, 44, 18, 1.2 * Math.PI, 1.8 * Math.PI); ctx.stroke(); }
  else if (M === 'wavy') { ctx.beginPath(); ctx.moveTo(-22, 30); for (let i = 1; i <= 4; i++) ctx.quadraticCurveTo(-22 + i * 11 - 5.5, 30 + (i % 2 ? -8 : 8), -22 + i * 11, 30); ctx.stroke(); }
  else if (M === 'zombie') { ctx.beginPath(); ctx.moveTo(-22, 30); ctx.lineTo(22, 26); ctx.stroke(); for (const tx of [-10, 4]) { ctx.fillStyle = '#fff'; ctx.fillRect(tx, 28, 9, 9); ctx.strokeRect(tx, 28, 9, 9); } }
  else if (M === 'smirk') { ctx.beginPath(); ctx.moveTo(-16, 26); ctx.quadraticCurveTo(6, 34, 22, 18); ctx.stroke(); }
  if (o.zombie) { ctx.strokeStyle = '#3f6b2a'; ctx.lineWidth = 5; line(-40, 10, -30, 22, 5, '#3f6b2a'); line(30, -36, 44, -30, 5, '#3f6b2a'); }
  ctx.restore();
  ctx.restore();
}
function walkPose(p, amp = 1) { const s = Math.sin(p); return { lt: .42 * s * amp, ls: Math.max(0, -Math.sin(p + .6)) * .7 * amp, rt: -.42 * s * amp, rs: Math.max(0, Math.sin(p + .6)) * .7 * amp, la: -.45 * s * amp, le: .35, ra: .45 * s * amp, re: .35 }; }
function runPose(p) { const s = Math.sin(p); return { lt: .75 * s, ls: Math.max(0, -Math.sin(p + .6)) * 1.3, rt: -.75 * s, rs: Math.max(0, Math.sin(p + .6)) * 1.3, la: -2.6 + .3 * s, le: -.2, ra: 2.6 - .3 * s, re: .2 }; }

// ---------- captions ----------
// CAP: array per line of chunks; HOT: set of highlighted chunks
function captions(t, CAP, HOT, y = 1640) {
  for (let i = 0; i < L.length; i++) {
    const l = L[i]; if (!CAP[i] || t < l.start - 0.05 || t > l.end + 0.25) continue; const ch = CAP[i];
    const tot = ch.reduce((a, b) => a + b.length + 3, 0); let acc = l.start, cur = null, cs = 0;
    for (const w of ch) { const d = (l.end - l.start) * (w.length + 3) / tot; if (t >= acc - 0.04) { cur = w; cs = acc; } acc += d; }
    if (!cur) continue; const k = eob(inv(cs, cs + .14, t)); const hot = HOT.has(cur);
    ctx.save(); ctx.font = `${hot ? 112 : 98}px Lucky`; const fit = Math.min(1, 960 / ctx.measureText(cur.toUpperCase()).width); ctx.restore();
    const sz = (hot ? 112 : 98) * fit * (.6 + .4 * k);
    txt(cur.toUpperCase(), W / 2, y, sz, hot ? '#ffd23f' : '#ffffff', { lw: sz * .22 });
  }
}

// ---------- scene runner ----------
// SCENES: [{t0: start time, fn(tLocal, tGlobal), xfade: seconds (0 = flash cut), push}]
function runScenes(t, SCENES, opts = {}) {
  let i = 0; while (i + 1 < SCENES.length && t >= SCENES[i + 1].t0) i++;
  const S = SCENES[i], end = i + 1 < SCENES.length ? SCENES[i + 1].t0 : VO.duration;
  const drawScene = (S, tt, endT) => {
    const lt = tt - S.t0; const z = 1 + (S.push ?? 0.05) * eio(inv(0, endT - S.t0, lt)) + 0.04 * (1 - eo(inv(0, .3, lt)));
    ctx.save(); ctx.translate(W / 2, H * .55); ctx.scale(z, z); ctx.translate(-W / 2, -H * .55);
    if (opts.shake) { const k = opts.shake(tt); if (k > 0) ctx.translate((rnd(Math.floor(tt * 30)) - .5) * 60 * k, (rnd(Math.floor(tt * 30) + 7) - .5) * 60 * k); }
    S.fn(lt, tt); ctx.restore();
  };
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, W, H);
  drawScene(S, t, end);
  // crossfade from previous scene
  if (i > 0 && S.xfade && t - S.t0 < S.xfade) {
    const P = SCENES[i - 1]; const main = ctx;
    const g = off.getContext('2d'); g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, W, H);
    // draw previous scene frozen at its end into offscreen
    const saved = window.__ctx; window.__ctx = g;
    ctx.save(); // swap drawing context
    swapCtx(g); drawScene(P, S.t0 - 0.001, S.t0); swapCtx(main);
    ctx.restore();
    ctx.save(); ctx.globalAlpha = 1 - (t - S.t0) / S.xfade; ctx.drawImage(off, 0, 0); ctx.restore();
  }
  if (opts.after) opts.after(t);
  // flash cuts
  for (let k = 1; k < SCENES.length; k++) { if (SCENES[k].xfade) continue; const d = t - SCENES[k].t0; if (d >= 0 && d < .12) { ctx.fillStyle = `rgba(255,255,255,${(1 - d / .12) * (SCENES[k].flash ?? 1)})`; ctx.fillRect(0, 0, W, H); } }
}
let __main = ctx;
function swapCtx(g) { ctx = g; }

// ---------- common set pieces ----------
function bgFill(col) { ctx.fillStyle = col; ctx.fillRect(-300, -300, W + 600, H + 600); }
function floor(col, y = 1380) { ctx.fillStyle = col; ctx.fillRect(-300, y, W + 600, H); line(-300, y, W + 300, y, 8); }
function floorTiles(y0, c1, c2) { const s = 120; for (let y = y0; y < H + 200; y += s) for (let x = -240; x < W + 240; x += s) { ctx.fillStyle = ((x + y) / s) % 2 ? c1 : c2; ctx.fillRect(x, y, s, s); } line(-300, y0, W + 300, y0, 8); }
function dark(a, col = '10,12,30') { if (a > 0) { ctx.fillStyle = `rgba(${col},${a})`; ctx.fillRect(-300, -300, W + 600, H + 600); } }
function qmark(x, y, t, t0, col = '#ffd23f', s = 150) { if (t < t0) return; const b = Math.abs(Math.sin((t - t0) * 7)) * 20; txt('?', x, y - b, s * eob(inv(t0, t0 + .2, t)), col, { lw: s * .17 }); }
function excl(x, y, t, t0, s = 150) { if (t < t0) return; txt('!', x, y, s * eob(inv(t0, t0 + .2, t)), '#ef4444', { lw: s * .17 }); }
function bubble(x, y, s, size = 58, maxw = 960) { ctx.save(); ctx.font = `${size}px Lucky`; const tw = Math.min(maxw, ctx.measureText(s).width + 70); ctx.restore(); box(x - tw / 2, y - size * .95, tw, size * 1.9, '#fff', 40, 7); txt(s, x, y + 4, size, INK, { stroke: false }); }
function snow(t, n = 60, a = 1) { ctx.save(); ctx.globalAlpha = a; for (let i = 0; i < n; i++) { const sp = 60 + rnd(i) * 90; const x = (rnd(i + 3) * W * 1.2 + Math.sin(t * .8 + i) * 30) % (W + 100) - 50; const y = ((rnd(i + 7) * H + t * sp) % (H + 60)) - 30; circ(x, y, 6 + rnd(i + 11) * 8, '#ffffff'); } ctx.restore(); }
function windowFrame(x, y, w, h, sky = '#bfdbfe') { box(x, y, w, h, sky, 10, 8); line(x + w / 2, y, x + w / 2, y + h, 8); line(x, y + h / 2, x + w, y + h / 2, 8); }
function doorway(x, y, w, h, openK, inside = '#0b1020', col = '#92400e') { box(x, y, w, h, inside, 6, 8); ctx.save(); ctx.translate(x, y); ctx.scale(Math.max(.06, 1 - openK * .94), 1); box(0, 0, w, h, col, 6, 8); circ(w - 30, h / 2, 12, '#fbbf24', INK, 5); ctx.restore(); }
function phoneDev(x, y, s, mode, opt = {}) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.rotate(opt.rot || 0);
  box(-90, -170, 180, 340, '#111827', 30, 8);
  const sx = -76, sy = -150, sw = 152, sh = 300;
  if (mode === 'dead') { ctx.fillStyle = '#000'; ctx.fillRect(sx, sy, sw, sh); }
  else { const g = ctx.createLinearGradient(0, sy, 0, sy + sh); g.addColorStop(0, opt.c1 || '#60a5fa'); g.addColorStop(1, opt.c2 || '#a78bfa'); ctx.fillStyle = g; ctx.fillRect(sx, sy, sw, sh);
    if (opt.draw) opt.draw(sx, sy, sw, sh); }
  ctx.restore();
}
function holdPhone(mode, opt) { return (hx, hy) => phoneDev(hx + 10, hy - 50, .42, mode, opt); }
const PHONE_POSE = { lt: .05, ls: 0, rt: -.05, rs: 0, la: .3, le: .2, ra: -1.6, re: -1.5 };
const STAND = { lt: .05, ls: 0, rt: -.05, rs: 0, la: .3, le: .2, ra: -.3, re: -.2 };
function hero(o) { return stick(Object.assign({ shirt: '#3b82f6', pants: '#334155', hood: true }, o)); }
function spot(x, y, r, a = .5, col = '255,240,170') { const g = ctx.createRadialGradient(x, y, 10, x, y, r); g.addColorStop(0, `rgba(${col},${a})`); g.addColorStop(1, `rgba(${col},0)`); ctx.fillStyle = g; ctx.fillRect(x - r, y - r, r * 2, r * 2); }
function darkness(a, cx, cy, r) { // dark overlay with a hole of light
  const g = ctx.createRadialGradient(cx, cy, r * .3, cx, cy, r); g.addColorStop(0, 'rgba(5,6,15,0)'); g.addColorStop(1, `rgba(5,6,15,${a})`); ctx.fillStyle = g; ctx.fillRect(-300, -300, W + 600, H + 600); }
function tbc(lt) { const k = eo(inv(0, .25, lt)); ctx.save(); ctx.translate(lerp(-700, 60, k), 1600);
  ctx.fillStyle = '#e9b949'; ctx.strokeStyle = INK; ctx.lineWidth = 9; ctx.beginPath(); ctx.moveTo(0, -70); ctx.lineTo(760, -70); ctx.lineTo(760, -110); ctx.lineTo(900, 0); ctx.lineTo(760, 110); ctx.lineTo(760, 70); ctx.lineTo(0, 70); ctx.closePath(); ctx.fill(); ctx.stroke();
  txt('TO BE CONTINUED', 400, 6, 76, '#3b2a10', { stroke: false }); ctx.restore(); }
function sepia() { ctx.save(); ctx.globalCompositeOperation = 'saturation'; ctx.fillStyle = 'hsl(0,0%,50%)'; ctx.fillRect(-300, -300, W + 600, H + 600); ctx.globalCompositeOperation = 'multiply'; ctx.fillStyle = '#e0c48f'; ctx.fillRect(-300, -300, W + 600, H + 600); ctx.restore(); }
function title(s, t, t0, y = 300, col = '#fff') { if (t < t0) return; const k = eob(inv(t0, t0 + .25, t)); txt(s, W / 2, y, 90 * k, col, { lw: 18 }); }
function brainChar(x, y, s, o = {}) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.rotate(o.tilt || 0);
  ctx.fillStyle = o.col || '#f9a8d4'; ctx.strokeStyle = INK; ctx.lineWidth = 9; ctx.beginPath();
  const bumps = 9; for (let i = 0; i <= bumps; i++) { const a = Math.PI + i * Math.PI / bumps; const r = 150 + (i % 2) * 18; ctx.lineTo(Math.cos(a) * r * 1.2, Math.sin(a) * r * .9); }
  ctx.quadraticCurveTo(190, 110, 0, 120); ctx.quadraticCurveTo(-190, 110, -180, 0); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(0, -150); ctx.bezierCurveTo(20, -100, -20, -60, 0, -20); ctx.stroke();
  for (const [a, b] of [[-110, -70], [90, -80], [-60, 40], [80, 30]]) { ctx.beginPath(); ctx.arc(a, b, 26, .3, 2.6); ctx.stroke(); }
  const E = o.eyes || 'norm', lx = (o.look || 0) * 6;
  if (E === 'bored') { for (const sx of [-1, 1]) { circ(sx * 45, 10, 22, '#fff', INK, 5); ctx.fillStyle = o.col || '#f9a8d4'; ctx.fillRect(sx * 45 - 24, -14, 48, 22); line(sx * 45 - 22, 8, sx * 45 + 22, 8, 5); circ(sx * 45 + lx, 18, 8, INK); } }
  else if (E === 'closed') { for (const sx of [-1, 1]) { ctx.beginPath(); ctx.arc(sx * 45, 10, 14, .1 * Math.PI, .9 * Math.PI); ctx.stroke(); } }
  else { const er = E === 'huge' ? 28 : 22; for (const sx of [-1, 1]) { circ(sx * 45, 10, er, '#fff', INK, 5); circ(sx * 45 + lx, 14, 9, INK); } }
  const M = o.mouth || 'smile'; ctx.lineWidth = 7;
  if (M === 'smile') { ctx.beginPath(); ctx.arc(0, 50, 22, .15 * Math.PI, .85 * Math.PI); ctx.stroke(); }
  else if (M === 'flat') line(-18, 66, 18, 66, 7);
  else if (M === 'o') circ(0, 70, 14, '#7a1f1f', INK, 5);
  else if (M === 'yawn') { ctx.fillStyle = '#7a1f1f'; ctx.beginPath(); ctx.ellipse(0, 72, 22, 30 * (o.open ?? 1), 0, 0, 7); ctx.fill(); ctx.stroke(); }
  else if (M === 'smirk') { ctx.beginPath(); ctx.moveTo(-18, 62); ctx.quadraticCurveTo(6, 72, 24, 54); ctx.stroke(); }
  if (o.armL || o.armR) { if (o.armL) { line(-170, 40, -170 + o.armL[0], 40 + o.armL[1], 10); circ(-170 + o.armL[0], 40 + o.armL[1], 13, INK); } if (o.armR) { line(170, 40, 170 + o.armR[0], 40 + o.armR[1], 10); circ(170 + o.armR[0], 40 + o.armR[1], 13, INK); } }
  if (o.legs !== false) { line(-50, 118, -60, 220, 10); line(50, 118, 60, 220, 10); ctx.fillStyle = INK; ctx.beginPath(); ctx.ellipse(-50, 222, 24, 10, 0, 0, 7); ctx.fill(); ctx.beginPath(); ctx.ellipse(70, 222, 24, 10, 0, 0, 7); ctx.fill(); }
  ctx.restore();
}
function meter(x, y, label, v, col = '#22c55e') { box(x - 40, y - 300, 80, 300, '#fff', 20, 7); ctx.fillStyle = col; rr(x - 32, y - 8 - 284 * clamp(v), 64, 284 * clamp(v), 16); ctx.fill(); txt(label, x, y + 50, 40, '#fff', { lw: 8 }); }
