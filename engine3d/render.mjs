// node engine3d/render.mjs <page-dir> <out-dir> "<frames: 0-10,15,20>" [scale]   (run from the repo root; RESUME=1 skips existing)
// page-dir: folder with index.html, story.js, world.js (e.g. work/2026-11-29-slot3-x/web). Serves the repo root over HTTP.
import { chromium } from "playwright";
import http from "http"; import fs from "fs"; import path from "path";
const [pageDir, outDir, spec = "0", scale = "1"] = process.argv.slice(2);
const root = process.cwd();
const types = { ".js": "text/javascript", ".mjs": "text/javascript", ".html": "text/html", ".woff2": "font/woff2", ".json": "application/json" };
const srv = http.createServer((q, r) => { let p = path.join(root, decodeURIComponent(q.url.split("?")[0])); if (p.endsWith("/")) p += "index.html";
  fs.readFile(p, (e, d) => { if (e) { r.writeHead(404); r.end(); return; } r.writeHead(200, { "Content-Type": types[path.extname(p)] || "application/octet-stream" }); r.end(d); }); });
await new Promise((ok) => srv.listen(0, ok)); const port = srv.address().port;
const frames = []; for (const part of spec.split(",")) { const [a, b] = part.split("-").map(Number); for (let f = a; f <= (isNaN(b) ? a : b); f++) frames.push(f); }
fs.mkdirSync(outDir, { recursive: true });
const browser = await chromium.launch({ args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist", "--disable-gpu-sandbox"] });
const W = Math.round(1080 * +scale), H = Math.round(1920 * +scale);
const page = await browser.newPage({ viewport: { width: W, height: H } });
page.on("console", (m) => { if (m.type() === "error") console.error("[page]", m.text()); });
await page.goto(`http://localhost:${port}/${pageDir.replace(/^\.?\//, "").replace(/\/$/, "")}/index.html?s=${scale}`);
await page.waitForFunction(() => window.ready || window.__err, null, { timeout: 180000 });
let err = await page.evaluate(() => window.__err); if (err) { console.error("PAGE ERROR", err); process.exit(1); }
await page.evaluate(() => document.fonts.ready);
const t0 = Date.now(); let n = 0;
for (const f of frames) {
  const file = path.join(outDir, `f${String(f).padStart(4, "0")}.jpg`);
  if (process.env.RESUME && fs.existsSync(file)) continue;
  const url = await page.evaluate((f) => { window.renderFrame(f); return window.grab(0.95); }, f);
  err = await page.evaluate(() => window.__err); if (err) { console.error("PAGE ERROR at frame", f, err); process.exit(1); }
  fs.writeFileSync(file, Buffer.from(url.split(",")[1], "base64")); n++;
  if (n % 25 === 0 || n === frames.length) console.log(`frame ${f}  ${n}/${frames.length}  ${((Date.now() - t0) / n / 1000).toFixed(2)} s/f`);
}
await browser.close(); srv.close();
