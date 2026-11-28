import { INK, SKIN, SKINS, shade, txt } from "/engine3d/cast.js";
export * from "/engine3d/cast.js";

export const LUSTIG = { jacket: "#2e3140", pants: "#26272f", boots: INK, hat: "tophat", moustache: "#2a1d16", buttons: "#d7b65a", skin: SKIN };
export const OFFICIAL = { ...LUSTIG, sash: "#c0353a" };
const D = (jacket, extra) => ({ pants: "#3b3f52", boots: "#4a3426", buttons: "#2b2b2b", ...extra, jacket });
export const DEALERS = [
  D("#8a5a3a", { build: "stout", hat: "bowler", bowler: "#4a3a2e", moustache: "#5a3a22", skin: SKINS[1] }), // buyer one
  D("#5d6b4a", { hat: "cap", cap: "#6b5a44", skin: SKINS[2] }),
  D("#6a4a6a", { hat: "bowler", bowler: "#2a2630", skin: SKINS[3], moustache: "#1f1712" }),
  D("#4a5a7a", { hat: "hair", hair: "#a06a3a", skin: SKINS[0] }),
  D("#7a6a3a", { build: "stout", hat: "bowler", bowler: "#3a3a3a", skin: SKINS[0], moustache: "#8a8a8a" }),
  D("#3f6f6a", { hat: "cap", cap: "#3a4a5a", skin: SKINS[1] }),
];
export const BUYER2 = D("#3f6fb5", { hat: "bowler", bowler: "#1f2330", skin: SKINS[2], moustache: "#3a2414", pants: "#2b2f3f" });
export const CLERK = D("#3f6fb5", { hat: "cap", cap: "#2f4f8a", pants: "#2f3f6a", skin: SKINS[1], moustache: "#4a3020", build: "stout" });

/** the SOLD sign: tag on a stick held in the raised hand; stamp 0..1 slams a red "x2" */
export const soldSign = (p, hx, hy, u, stamp = 0, stick = true) => {
  const w = 150, h = 90, cx = hx + 10, cy = hy - 120;
  if (stick) p.band([[hx, hy + 6], [cx, cy + h / 2]], "#8a5a34", 8, 3, "round");
  p.poly([[cx - w / 2, cy - h / 2], [cx + w / 2, cy - h / 2], [cx + w / 2, cy + h / 2], [cx - w / 2, cy + h / 2]], "#fbf3de", 6);
  txt(p, "SOLD", cx, cy + 4, 56, "#b8262e");
  if (stamp > 0) {
    const s = 1 + 1.6 * (1 - Math.min(1, stamp));
    const g = p.g, [X, Y] = p.P(cx + 52, cy - 34); g.save(); g.translate(X, Y); g.scale(s, s); g.rotate(-0.3);
    g.globalAlpha = Math.min(1, stamp * 1.4);
    g.beginPath(); g.arc(0, 0, 38, 0, 7); g.fillStyle = "#d8343c"; g.fill(); g.lineWidth = 6; g.strokeStyle = INK; g.stroke();
    g.fillStyle = "#fff6e6"; g.font = "bold 40px Georgia, serif"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("×2", 0, 3);
    g.restore();
  }
};
export const scrollRoll = (p, hx, hy, u) => p.ell(hx, hy, 26, 30, "#f6ecd0", 5);

/** the long repair bill unrolling: len 0..1 */
export const bill = (len) => (p) => {
  const L = 60 + 1800 * len, x0 = 80, x1 = 320;
  p.poly([[x0, 40], [x1, 40], [x1, 40 + L], [x0, 40 + L]], "#f6ecd0", 6);
  const g = p.g; g.fillStyle = "#3a2a20"; g.font = "bold 22px Georgia, serif"; g.textAlign = "left";
  for (let y = 80, i = 0; y < 40 + L - 40; y += 34, i++) {
    g.fillRect(x0 + 18, y - 6, 120 + ((i * 37) % 60), 5);
    g.fillText(String(1000 + ((i * 7919) % 90000)).replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " F", x0 + 150, y);
  }
  if (len > 0.85) { g.fillStyle = "#b8262e"; g.font = "bold 40px Georgia, serif"; g.textAlign = "center"; g.fillText("TOTAL ?!", (x0 + x1) / 2, 40 + L - 22); }
  p.ell((x0 + x1) / 2, 40 + L, (x1 - x0) / 2 + 8, 22, "#eadcb6", 6);
};
/** small enamel "SOLD" sign hung on the fence in the ending */
export const fenceSign = () => (p) => {
  p.stroke([[120, 30], [300, -20 + 40], [480, 30]], 8);
  p.poly([[110, 40], [490, 40], [490, 250], [110, 250]], "#fbf3de", 10);
  txt(p, "SOLD", 300, 150, 120, "#b8262e");
};
