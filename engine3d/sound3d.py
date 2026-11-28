"""sound3d: synthesized music + SFX for the 3D cartoon shorts (no downloaded audio, so no copyright claims).
Usage in a video's audio.py:
    import sys; sys.path.insert(0, "engine3d"); from sound3d import *
    D = Dur("work/<dir>/timing.json")            # duration from timing.py
    music = score(D, preset="sly", seed=7, stop=F(1099))   # stop = frame/30 where the music cuts for the twist (None = no stop)
    sfx = blank(D); cue(sfx, F(124), thunk(), 0.9) ...
    write("work/<dir>/music.wav", norm(music)); write("work/<dir>/sfx.wav", norm(sfx))
Presets: sly (pizzicato tiptoe march), mystery (minor pads + ticking pluck), upbeat (bright pluck pop), chip (8-bit square lead),
cozy (soft piano-ish pluck, slow), tense (low pulses + rising drone), hype (fast four-on-the-floor), dreamy (bell plucks + pads)."""
import numpy as np, json, wave
SR = 48000
rng = np.random.default_rng(7)
F = lambda f: f / 30.0
def Dur(meta): return json.load(open(meta))["duration"]
def blank(dur): return np.zeros(int(round(dur * SR)))
def norm(x, peak=0.8): return x / max(1e-9, np.abs(x).max()) * peak
def cue(buf, t, x, g=1.0): place(buf, t, x, g)
def write(name, x):
    x = np.clip(x, -1, 1); w = wave.open(name, "wb"); w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((x * 32767).astype(np.int16).tobytes()); w.close()
def env(n, a=0.005, d=0.2):
    t = np.arange(n) / SR; return np.minimum(1, t / max(a, 1e-4)) * np.exp(-t / d)
def place(buf, t, x, g=1.0):
    i = int(t * SR)
    if i >= len(buf): return
    x = x[: len(buf) - i]; buf[i : i + len(x)] += g * x
def lp(x, k=0.1):  # one-pole low-pass (slow; prefer lpf)
    y = np.empty_like(x); s = 0.0
    for i in range(len(x)): s += k * (x[i] - s); y[i] = s
    return y
def lpf(x, cut):  # fast FFT low-pass
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR); X[f > cut] *= np.exp(-(f[f > cut] - cut) / (cut * 0.3)); return np.fft.irfft(X, len(x))
def hpf(x, cut):
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR); X[f < cut] *= (f[f < cut] / cut) ** 2; return np.fft.irfft(X, len(x))
noise = lambda s: rng.standard_normal(int(s * SR))
tt = lambda s: np.arange(int(s * SR)) / SR
nf = lambda m: 440 * 2 ** ((m - 69) / 12)

# ---------------- instruments ----------------
def pluck(freq, s=0.35, bright=0.5):  # Karplus-Strong pizzicato
    n = int(s * SR); p = max(2, int(SR / freq)); buf = rng.uniform(-1, 1, p); out = np.empty(n)
    for i in range(n):
        out[i] = buf[i % p]; buf[i % p] = 0.5 * (buf[i % p] + buf[(i + 1) % p]) * (0.993 + 0.006 * bright)
    return out * env(n, 0.002, s * 0.5)
def kick(): t = tt(0.25); return np.sin(2 * np.pi * (50 + 90 * np.exp(-t * 30)) * t) * np.exp(-t * 14)
def snare(): n = noise(0.18); return hpf(n, 1500) * env(len(n), 0.001, 0.05) * 0.5 + np.sin(2 * np.pi * 190 * tt(0.18)) * env(len(n), 0.001, 0.04) * 0.4
def brass(freq, s):  # soft saw pad, filtered
    t = tt(s); x = sum(np.sin(2 * np.pi * freq * k * t + k) / k for k in range(1, 7))
    a = np.minimum(1, t / 0.06) * np.minimum(1, (s - t) / 0.12); return lpf(x * a, 1800) * 0.35
def clar(freq, s):  # tiptoe lead: odd harmonics
    t = tt(s); vib = 1 + 0.004 * np.sin(2 * np.pi * 5.5 * t) * np.minimum(1, t / 0.2)
    x = sum(np.sin(2 * np.pi * freq * k * t * vib) / k for k in (1, 3, 5, 7))
    return x * np.minimum(1, t / 0.03) * np.minimum(1, np.maximum(0, s - t) / 0.06) * 0.3

def whoosh(s=0.6, up=True):
    n = noise(s); t = tt(s); x = lpf(n, 2500) * np.sin(np.pi * t / s) ** 2; return hpf(x, 200)
def ting(freq=1760, s=1.0):
    t = tt(s); return (np.sin(2 * np.pi * freq * t) + 0.4 * np.sin(2 * np.pi * freq * 2.76 * t) + 0.2 * np.sin(2 * np.pi * freq * 5.4 * t)) * env(len(t), 0.001, 0.25)
def thunk(f0=90, s=0.5):
    t = tt(s); return np.sin(2 * np.pi * (f0 + 60 * np.exp(-t * 25)) * t) * np.exp(-t * 9) + lpf(noise(s), 900) * env(len(t), 0.001, 0.05)
def creak(s=0.8, f=180):
    t = tt(s); fr = f * (1 + 0.25 * np.sin(2 * np.pi * 1.3 * t)); ph = np.cumsum(fr) / SR
    x = np.sign(np.sin(2 * np.pi * ph)) * (rng.random(len(t)) < 0.35); return lpf(x.astype(float), 1500) * np.sin(np.pi * t / s) * 0.7
def rustle(s=1.2):
    n = noise(s); return hpf(n, 2500) * (0.5 + 0.5 * np.abs(np.sin(2 * np.pi * 7 * tt(s)))) * np.sin(np.pi * tt(s) / s) * 0.5
def pop(): t = tt(0.12); return np.sin(2 * np.pi * (300 + 900 * np.exp(-t * 40)) * t) * env(len(t), 0.001, 0.03)
def shh(s=0.7): return hpf(noise(s), 3500) * np.sin(np.pi * tt(s) / s) ** 2 * 0.6
def step(): return lpf(noise(0.08), 1200) * env(int(0.08 * SR), 0.001, 0.02)
def chuff(): return lpf(noise(0.22), 1800) * env(int(0.22 * SR), 0.005, 0.07)
def whistle(s=1.1):
    t = tt(s); a = np.minimum(1, t / 0.08) * np.minimum(1, (s - t) / 0.2)
    return (np.sin(2 * np.pi * 740 * t) + np.sin(2 * np.pi * 932 * t) + 0.5 * np.sin(2 * np.pi * 1110 * t)) * a * 0.3 + hpf(noise(s), 3000) * a * 0.05
def slide_down(s=0.7):
    t = tt(s); ph = np.cumsum(900 * np.exp(-t * 2.2)) / SR; return np.sin(2 * np.pi * ph) * np.minimum(1, t / 0.03) * np.minimum(1, (s - t) / 0.1) * 0.5
def scrape(s=0.6): return lpf(hpf(noise(s), 600), 3000) * np.sin(np.pi * tt(s) / s) * 0.5
def ding_cash():
    return ting(2093, 1.0) * 0.7 + ting(2637, 1.0) * 0.5


# ---------------- score ----------------
PRESETS = {
  "sly":    dict(bpm=112, lead="clar", drums="march", minor=True,  bass=True, pad=True),
  "mystery":dict(bpm=92,  lead="pluck", drums="tick",  minor=True,  bass=True, pad=True),
  "upbeat": dict(bpm=120, lead="pluck", drums="pop",   minor=False, bass=True, pad=True),
  "chip":   dict(bpm=132, lead="square", drums="pop",  minor=False, bass=True, pad=False),
  "cozy":   dict(bpm=88,  lead="pluck", drums="soft",  minor=False, bass=True, pad=True),
  "tense":  dict(bpm=100, lead=None,    drums="pulse", minor=True,  bass=True, pad=True),
  "hype":   dict(bpm=140, lead="square", drums="four", minor=True,  bass=True, pad=False),
  "dreamy": dict(bpm=84,  lead="bell",  drums="soft",  minor=False, bass=False, pad=True),
}
def square(freq, s):
    t = tt(s); x = np.sign(np.sin(2 * np.pi * freq * t)) * 0.25
    return lpf(x * np.minimum(1, t / 0.005) * np.exp(-t / max(0.08, s * 0.6)), 5000)
def bell(freq, s): return ting(freq, s) * 0.5
def score(dur, preset="sly", seed=1, stop=None, drone_after_stop=True):
    P = PRESETS[preset]; r = np.random.default_rng(seed); out = blank(dur); beat = 60 / P["bpm"]
    root = 45 + int(r.integers(0, 7))  # A2..E3
    minor = P["minor"]
    progs = [[0, 5, 7, 4], [0, 8, 3, 7], [0, 5, 3, 7], [0, 3, 8, 7]] if minor else [[0, 5, 7, 5], [0, 7, 9, 5], [0, 9, 5, 7], [0, 5, 9, 7]]
    prog = progs[int(r.integers(0, 4))]
    scale = [0, 2, 3, 5, 7, 8, 10, 12, 14, 15] if minor else [0, 2, 4, 5, 7, 9, 11, 12, 14, 16]
    mel = [scale[int(r.integers(0, 8))] for _ in range(16)]
    STOP = dur if stop is None else stop - 0.05
    cache = {}
    def cp(m, s, b=0.5):
        k = (m, s, b)
        if k not in cache: cache[k] = pluck(nf(m), s, b)
        return cache[k]
    b = 0; t0 = 0.1
    while True:
        t = t0 + b * beat
        if t >= STOP: break
        ch = prog[(b // 4) % 4]; d = P["drums"]
        if d == "march": place(out, t, kick() if b % 2 == 0 else snare(), 0.55 if b % 2 == 0 else 0.32)
        elif d == "four": place(out, t, kick(), 0.6); place(out, t + beat / 2, hpf(noise(0.05), 6000) * env(int(0.05 * SR), 0.001, 0.02), 0.25); (b % 2 == 1) and place(out, t, snare(), 0.35)
        elif d == "pop": (b % 2 == 0) and place(out, t, kick(), 0.5); (b % 2 == 1) and place(out, t, snare(), 0.3)
        elif d == "tick": place(out, t, hpf(noise(0.03), 5000) * env(int(0.03 * SR), 0.001, 0.01), 0.3); (b % 4 == 0) and place(out, t, kick(), 0.4)
        elif d == "pulse": place(out, t, lpf(kick(), 300), 0.5); place(out, t + beat / 2, lpf(kick(), 300), 0.25)
        elif d == "soft": (b % 4 == 0) and place(out, t, kick(), 0.3); (b % 4 == 2) and place(out, t, snare(), 0.15)
        if P["bass"]: place(out, t, cp(root + ch, 0.45, 0.3), 0.6)
        if P["pad"] and b % 4 == 0:
            for iv in (0, 3 if minor else 4, 7): place(out, t, brass(nf(root + 12 + ch + iv), beat * 3.6), 0.2)
        L = P["lead"]
        if L and (b // 8) % 2 == 1:
            m = root + 24 + mel[b % 16]; ln = beat * 0.9
            x = clar(nf(m), ln) if L == "clar" else square(nf(m), ln) if L == "square" else bell(nf(m), ln * 1.5) if L == "bell" else cp(m, ln, 0.8)
            place(out, t, x, 0.45 if L != "bell" else 0.6)
        b += 1
    if stop is not None:
        i = int(STOP * SR); out[i:] = 0; out[max(0, i - 2880):i] *= np.linspace(1, 0, min(2880, i))
        if drone_after_stop and dur - stop > 0.8:
            place(out, stop, np.sin(2 * np.pi * 55 * tt(2.5)) * env(int(2.5 * SR), 0.003, 0.9) + lpf(noise(2.5), 400) * env(int(2.5 * SR), 0.002, 0.25) * 0.6, 0.9)
            dl = dur - stop - 0.3; t = tt(dl)
            dr = (np.sin(2 * np.pi * 55 * t) + 0.5 * np.sin(2 * np.pi * 82.4 * t)) * np.minimum(1, t / 0.8) * np.minimum(1, (dl - t) / 1.0) * 0.35
            place(out, stop + 0.3, lpf(dr, 900), 1.0)
    return out
