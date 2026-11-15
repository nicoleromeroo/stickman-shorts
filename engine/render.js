// usage: node render.js <page.html> <vo.json> stills <t1,t2,...> <outdir>
//        node render.js <page.html> <vo.json> full <out.mp4>
const { chromium } = require('playwright');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
(async () => {
  const [html, voPath, mode, a, b] = process.argv.slice(2);
  const vo = JSON.parse(fs.readFileSync(voPath, 'utf8'));
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
  page.on('pageerror', e => console.error('PAGE ERROR:', e.message));
  await page.addInitScript((v) => { window.VO = v; }, vo);
  await page.goto('file://' + path.resolve(html));
  await page.evaluate(() => Promise.all([document.fonts.load('100px Lucky'), document.fonts.load('900 30px Nun')]));
  const grab = (t) => page.evaluate((t) => { render(t); return document.getElementById('c').toDataURL('image/jpeg', 0.93); }, t);
  if (mode === 'stills') {
    fs.mkdirSync(b, { recursive: true });
    for (const t of a.split(',').map(Number)) {
      const d = await grab(t);
      fs.writeFileSync(path.join(b, `s_${String(t.toFixed(2)).padStart(6, '0')}.jpg`), Buffer.from(d.split(',')[1], 'base64'));
    }
  } else {
    const fps = 30, n = Math.ceil(vo.duration * fps);
    const ff = spawn('ffmpeg', ['-y', '-v', 'error', '-f', 'image2pipe', '-c:v', 'mjpeg', '-r', String(fps), '-i', '-',
      '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '18', '-pix_fmt', 'yuv420p', a], { stdio: ['pipe', 'inherit', 'inherit'] });
    for (let i = 0; i < n; i++) {
      const d = await grab(i / fps);
      if (!ff.stdin.write(Buffer.from(d.split(',')[1], 'base64'))) await new Promise(r => ff.stdin.once('drain', r));
    }
    ff.stdin.end();
    await new Promise(r => ff.on('close', r));
  }
  await browser.close();
})();
