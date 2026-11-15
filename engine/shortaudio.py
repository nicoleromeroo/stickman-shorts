"""Reusable audio for stickman shorts: voice + music preset + sfx events -> mix.wav"""
import json, numpy as np, soundfile as sf
SR = 48000

class Mix:
    def __init__(self, d, seed=1):
        self.d = d; self.rng = np.random.default_rng(seed)
        vo, vsr = sf.read(f"{d}/voice.wav", dtype="float32")
        n = int(len(vo) * SR / vsr)
        self.vo = np.interp(np.linspace(0, len(vo) - 1, n), np.arange(len(vo)), vo).astype(np.float32)
        self.L = json.load(open(f"{d}/voice.json"))["lines"]
        self.N = len(self.vo) + int(.4 * SR); self.tt = np.arange(self.N) / SR
        self.mus = np.zeros(self.N, np.float32); self.sfx = np.zeros(self.N, np.float32)
    # timing
    def at(self, i, f=0): l = self.L[i]; return l["start"] + (l["end"] - l["start"]) * f
    def wt(self, i, w): s = self.L[i]["text"].lower(); p = s.find(w.lower()); return self.at(i, max(p, 0) / len(s))
    def mid(self, a, b): return (self.L[a]["end"] + self.L[b]["start"]) / 2
    # primitives
    def _add(self, buf, x, t, g=1.0):
        s = int(t * SR); e = min(self.N, s + len(x))
        if 0 <= s < self.N and e > s: buf[s:e] += (np.asarray(x[:e - s]) * g).astype(np.float32)
    def tone(self, f, dur, dec): t = np.arange(int(dur * SR)) / SR; return np.sin(2 * np.pi * f * t) * np.exp(-t * dec)
    def noise(self, dur): return self.rng.normal(0, 1, int(dur * SR))
    def lp(self, x, a):
        y = np.zeros_like(x); s = 0.0
        for i in range(len(x)): s += a * (x[i] - s); y[i] = s
        return y
    def env(self, n, dec): return np.exp(-np.arange(n) / SR * dec)
    # ---------- sfx ----------
    def sfx_wave(self, name):
        T, N, n = self.tone, self.noise, lambda d: int(d * SR)
        if name == "pop": t = np.arange(n(.15)) / SR; return np.sin(2 * np.pi * (900 - 2500 * t) * t) * np.exp(-t * 30)
        if name == "whoosh": x = self.lp(N(.35), .04); return x * np.sin(np.linspace(0, np.pi, len(x))) * 5
        if name == "clink": return T(2637, .5, 9) * .5 + T(3520, .5, 12) * .35 + T(5274, .5, 18) * .2
        if name == "bonk": t = np.arange(n(.5)) / SR; return np.sin(2 * np.pi * (300 + 500 * np.exp(-t * 12)) * t) * np.exp(-t * 6)
        if name == "slide": x = self.lp(N(.35), .03); return x * np.sin(np.linspace(0, np.pi, len(x))) * 5
        if name == "chime": return sum(T(f, .9, 3) for f in (523, 659, 784, 1046)) * .35
        if name == "ding": return T(880, .6, 5) * .5 + T(1320, .6, 7) * .2
        if name == "dingdong": return np.concatenate([T(880, .35, 5), T(698, .5, 4)]) * .6
        if name == "pdown": t = np.arange(n(.6)) / SR; return np.sin(2 * np.pi * (600 * np.exp(-t * 4)) * t) * np.exp(-t * 3)
        if name == "alarm": return np.concatenate([np.concatenate([T(2000, .05, 40), np.zeros(n(.05))]) for _ in range(8)]) * .6
        if name == "sting": return sum(T(f, 1.6, 1.6) for f in (110, 164.8, 233.1, 329.6)) * .5
        if name == "tbc": return sum(T(f, 1.4, 2) for f in (196, 247, 294)) * .5
        if name == "creak": m = n(.7); t = np.arange(m) / SR; return np.sin(2 * np.pi * (180 + 60 * np.sin(np.linspace(0, 9, m))) * t) * np.exp(-t * 2)
        if name == "thump": return self.lp(N(.3), .08) * self.env(n(.3), 14) * 4 + T(70, .3, 10)
        if name == "splash": return self.lp(N(.8), .3) * self.env(n(.8), 5) * 1.5
        if name == "drip": t = np.arange(n(.12)) / SR; return np.sin(2 * np.pi * (1200 + 1800 * t / .12) * t) * np.exp(-t * 40)
        if name == "heart": return T(55, .18, 18) + T(80, .18, 25) * .4
        if name == "shing": return T(2400, .7, 5) * .6 + T(3600, .7, 7) * .4 + T(4800, .7, 9) * .25
        if name == "zipper": m = n(.5); return self.lp(N(.5), .25) * (0.5 + 0.5 * np.sign(np.sin(2 * np.pi * 40 * np.arange(m) / SR))) * 2
        if name == "static": return N(.3) * self.env(n(.3), 6) * .5
        if name == "buzz": return np.sign(np.sin(2 * np.pi * 120 * np.arange(n(.4)) / SR)) * .25 * self.env(n(.4), 2)
        if name == "boing": t = np.arange(n(.5)) / SR; return np.sin(2 * np.pi * (220 + 120 * np.sin(t * 40)) * t) * np.exp(-t * 5)
        if name == "giggle": return np.concatenate([T(f, .09, 12) for f in (700, 900, 760, 980, 820, 1040)]) * .6
        if name == "yawn": t = np.arange(n(1.2)) / SR; return np.sin(2 * np.pi * (220 - 80 * t) * t) * np.sin(np.pi * t / 1.2) * .5
        if name == "tick": return T(3000, .03, 80)
        if name == "notify": return np.concatenate([T(1318, .12, 10), T(1760, .25, 8)]) * .6
        if name == "cash": return np.concatenate([T(1800, .08, 20), T(2600, .4, 6)]) * .6
        if name == "lights": return (self.lp(N(.25), .5) * self.env(n(.25), 8) * 3 + T(90, .25, 8)) * .8
        if name == "laugh": return np.concatenate([T(f, .12, 10) for f in (300, 260, 300, 250, 290, 240)]) * .7
        raise ValueError(name)
    def add(self, name, t, g=1.0): self._add(self.sfx, self.sfx_wave(name), t, g)
    def steps(self, t0, n=8, dt=.3, g=.35):
        for i in range(n): self._add(self.sfx, self.lp(self.noise(.05), .3) * 2, t0 + i * dt, g)
    def ambience(self, kind, t0, t1, g=.12):
        m = (self.tt >= t0) & (self.tt < t1)
        if kind == "wind": x = self.lp(self.noise(self.N / SR), .01) * 6
        elif kind == "hum": x = np.sin(2 * np.pi * 60 * self.tt) * .6 + np.sin(2 * np.pi * 120 * self.tt) * .3
        elif kind == "water": x = self.lp(self.noise(self.N / SR), .2) * 1.5
        elif kind == "crowd": x = self.lp(self.noise(self.N / SR), .05) * 3
        else: raise ValueError(kind)
        self.sfx += (x[:self.N] * m * g).astype(np.float32)
    # ---------- music ----------
    def music(self, preset, quiet=()):
        note = lambda m: 440 * 2 ** ((m - 69) / 12); T = self.tone; dur = self.N / SR
        if preset in ("lofi", "upbeat", "mystery"):
            if preset == "lofi": bpm, chords, oct_ = 84, [[53, 57, 60, 64], [52, 55, 59, 62], [50, 53, 57, 60], [48, 52, 55, 59]], 12
            elif preset == "upbeat": bpm, chords, oct_ = 112, [[60, 64, 67, 72], [55, 59, 62, 67], [57, 60, 64, 69], [53, 57, 60, 65]], 12
            else: bpm, chords, oct_ = 70, [[57, 60, 64, 71], [53, 57, 60, 67], [55, 59, 62, 69], [52, 56, 59, 64]], 12
            beat = 60 / bpm; t = 0.0; bar = 0
            hits = (0, 1, 1.5, 2.5, 3, 3.5) if preset == "upbeat" else (0, 1.5, 2.5) if preset == "lofi" else (0, 2)
            while t < dur:
                ch = chords[bar % 4]
                for b in hits:
                    for j, mm in enumerate(ch):
                        dec = 6 if preset == "upbeat" else 2.2
                        self._add(self.mus, T(note(mm + oct_), 1.2, dec) * .25 + T(note(mm + oct_ + 12), 1.2, dec * 2) * .05, t + b * beat + j * (.012 if preset == "upbeat" else .03))
                self._add(self.mus, T(note(ch[0] - 12), 2.5, 1.2) * .5, t)
                if preset != "mystery":
                    for b in (0, 2): self._add(self.mus, T(55, .2, 16) * .8, t + b * beat)
                    for b in (1, 3): self._add(self.mus, self.lp(self.noise(.12), .5) * self.env(int(.12 * SR), 30) * .4, t + b * beat)
                else:
                    for b in (1, 3): self._add(self.mus, T(note(ch[-1] + 24), 1.5, 3) * .15, t + b * beat)
                t += 4 * beat; bar += 1
        elif preset == "tense":
            tt = self.tt
            drone = (np.sin(2 * np.pi * 55 * tt) + .6 * np.sin(2 * np.pi * 55.7 * tt) + .4 * np.sin(2 * np.pi * 82.4 * tt) + .2 * np.sin(2 * np.pi * 110.3 * tt))
            grow = np.clip(tt / 4, 0, 1) * (0.5 + 0.5 * np.clip((tt - dur * .6) / (dur * .3), 0, 1))
            self.mus += (drone * grow * .35).astype(np.float32)
            t = 1.0
            while t < dur - 1.5:
                bpm = 70 + 45 * min(1, t / dur)
                self._add(self.mus, self.sfx_wave("heart"), t, .55); self._add(self.mus, self.sfx_wave("heart"), t + .22, .35); t += 60 / bpm
        for a, b in quiet:
            m = (self.tt >= a) & (self.tt < b); self.mus[m] *= .2
        self.mus /= np.abs(self.mus).max() + 1e-9
    def write(self, mvol=.08, svol=.30):
        v = np.zeros(self.N, np.float32); v[:len(self.vo)] = self.vo
        e = np.convolve(np.abs(v), np.ones(int(.08 * SR)) / int(.08 * SR), mode="same")
        duck = 1 - .65 * np.clip(e / (e.max() * .2), 0, 1)
        mix = v + self.mus * mvol * duck + self.sfx * svol
        f = int(.3 * SR); mix[-f:] *= np.linspace(1, 0, f); mix = mix / (np.abs(mix).max() + 1e-9) * .95
        sf.write(f"{self.d}/mix.wav", mix, SR)
