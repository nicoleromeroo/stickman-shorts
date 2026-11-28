"""python3 mix.py voice.mp3 music.wav sfx.wav -> <out.wav> (4th arg, default mix.wav next to the music stem)
Music gated RMS = 50 % of the voice gated RMS (-6 dB). SFX gated RMS <= 50 %, SFX peaks <= 0.7 x voice peak. Voice untouched."""
import sys, subprocess, numpy as np, wave
SR = 48000
def load(p):
    raw = subprocess.check_output(["ffmpeg", "-v", "error", "-i", p, "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"])
    return np.frombuffer(raw, np.float32).astype(np.float64)
def gated_rms(x, gate_db=-40):
    w = int(0.05 * SR); n = len(x) // w; b = x[: n * w].reshape(n, w); r = np.sqrt((b ** 2).mean(1) + 1e-20)
    keep = r > (r.max() * 10 ** (gate_db / 20)); return np.sqrt((r[keep] ** 2).mean())
db = lambda x: 20 * np.log10(max(x, 1e-12))
v, m, s = load(sys.argv[1]), load(sys.argv[2]), load(sys.argv[3])
L = len(v); m = np.pad(m, (0, max(0, L - len(m))))[:L]; s = np.pad(s, (0, max(0, L - len(s))))[:L]
rv, pv = gated_rms(v), np.abs(v).max()
gm = 0.5 * rv / gated_rms(m)
gs = 0.5 * rv / gated_rms(s)
gs = min(gs, 0.7 * pv / np.abs(s).max())
mix = v + gm * m + gs * s
print(f"voice gated RMS {db(rv):.1f} dBFS, peak {db(pv):.1f}")
print(f"music vs voice: {db(gated_rms(gm * m)) - db(rv):+.1f} dB")
print(f"sfx   vs voice: {db(gated_rms(gs * s)) - db(rv):+.1f} dB, sfx peak / voice peak {np.abs(gs * s).max() / pv:.2f}")
import os
out = sys.argv[4] if len(sys.argv) > 4 else os.path.join(os.path.dirname(sys.argv[2]) or ".", "mix.wav")
w = wave.open(out, "wb"); w.setnchannels(1); w.setsampwidth(4); w.setframerate(SR)
# store float as 32-bit int to keep headroom: normalise only if it would clip (one linear gain applied later anyway)
k = 1.0 / max(1.0, np.abs(mix).max() * 1.0001); w.writeframes((mix * k * 2147483647).astype(np.int32).tobytes()); w.close()
print(f"wrote {out} (pre-gain {k:.3f})")
