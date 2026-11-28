"""Align script phrases to speech segments found by silence detection (no ASR needed).
usage: python3 timing.py voice.mp3 script.txt --out work
Writes work/phrases.json [{text,t0,t1,f0,f1}] and work/words.json (words spread by syllables inside each phrase)."""
import json, re, subprocess, sys, os

FPS = 30
voice, script = sys.argv[1], sys.argv[2]
out = sys.argv[sys.argv.index("--out") + 1] if "--out" in sys.argv else "work"
os.makedirs(out, exist_ok=True)

dur = float(subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", voice]))
log = subprocess.run(["ffmpeg", "-i", voice, "-af", "silencedetect=noise=-35dB:d=0.1", "-f", "null", "-"], capture_output=True, text=True).stderr
starts = [float(x) for x in re.findall(r"silence_start: ([\d.]+)", log)]
ends = [float(x) for x in re.findall(r"silence_end: ([\d.]+)", log)]
gaps = list(zip(starts, ends + [dur] * (len(starts) - len(ends))))
segs, t = [], 0.0
for s, e in gaps:
    if s - t > 0.05: segs.append([t, s])
    t = e
if dur - t > 0.05: segs.append([t, dur])

text = open(script).read().replace("\n", " ")
phrases = [p.strip() for p in re.split(r"(?<=[.,:?!])\s+", text) if p.strip()]

def syl(w):
    w = re.sub(r"[^a-z]", "", w.lower())
    if not w: return 0
    n = len(re.findall(r"[aeiouy]+", w))
    if w.endswith("e") and not w.endswith("le") and n > 1: n -= 1
    return max(1, n)
psyl = [sum(syl(w) for w in p.split()) for p in phrases]
seg_d = [b - a for a, b in segs]
rate = sum(psyl) / sum(seg_d)  # syllables per second of speech

# DP: assign contiguous phrase runs to contiguous segment runs (each group = >=1 phrase, >=1 segment).
INF = 1e18
P, S = len(phrases), len(segs)
best = [[INF] * (S + 1) for _ in range(P + 1)]; back = {}
best[0][0] = 0
for i in range(P + 1):
    for j in range(S + 1):
        if best[i][j] >= INF: continue
        for di in range(1, 4):
            for dj in range(1, 4):
                ii, jj = i + di, j + dj
                if ii > P or jj > S: continue
                want = sum(psyl[i:ii]) / rate; got = sum(seg_d[j:jj]) + sum(segs[k + 1][0] - segs[k][1] for k in range(j, jj - 1))
                cost = (want - got) ** 2 / max(got, 0.3)
                # sentence ends inside a group are bad; gaps inside one phrase are bad
                cost += 0.6 * sum(1 for p in phrases[i:ii - 1] if p[-1] in ".?!")
                if di == 1 and dj > 1: cost += 0.4 * (dj - 1)
                if best[i][j] + cost < best[ii][jj]:
                    best[ii][jj] = best[i][j] + cost; back[(ii, jj)] = (i, j)
i, j, groups = P, S, []
while (i, j) != (0, 0):
    pi, pj = back[(i, j)]; groups.append((pi, i, pj, j)); i, j = pi, pj
groups.reverse()

res = []
for a, b, c, d in groups:
    t0, t1 = segs[c][0], segs[d - 1][1]
    tot = sum(psyl[a:b]); acc = t0
    for k in range(a, b):
        e = acc + (t1 - t0) * psyl[k] / tot
        res.append({"text": phrases[k], "t0": round(acc, 3), "t1": round(e, 3)}); acc = e
words = []
for r in res:
    ws = r["text"].split(); sy = [syl(w) for w in ws]; tot = sum(sy) or 1; acc = r["t0"]
    for w, s in zip(ws, sy):
        e = acc + (r["t1"] - r["t0"]) * s / tot
        words.append({"w": w, "t0": round(acc, 3), "t1": round(e, 3), "f0": round(acc * FPS), "f1": round(e * FPS)}); acc = e
for r in res: r["f0"], r["f1"] = round(r["t0"] * FPS), round(r["t1"] * FPS)
json.dump(res, open(f"{out}/phrases.json", "w"), indent=1)
json.dump(words, open(f"{out}/words.json", "w"), indent=1)
json.dump({"duration": dur, "frames": round(dur * FPS), "segments": segs}, open(f"{out}/timing.json", "w"), indent=1)
print(f"duration {dur:.2f}s frames {round(dur*FPS)} segments {len(segs)} phrases {P}")
for r in res: print(f'{r["f0"]:5d}-{r["f1"]:5d}  {r["t0"]:6.2f}-{r["t1"]:6.2f}  {r["text"]}')
