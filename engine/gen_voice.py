"""usage: gen_voice2.py <model_dir> <voice> <lines.json> <out_prefix> [speed]
lines.json: list of strings or {"text":..., "gap":seconds}"""
import sys, json, numpy as np, soundfile as sf
from kokoro_onnx import Kokoro
d, voice, lines_path, out = sys.argv[1:5]
speed = float(sys.argv[5]) if len(sys.argv) > 5 else 1.08
k = Kokoro(f"{d}/kokoro-v1.0.onnx", f"{d}/voices-v1.0.bin")
items = json.load(open(lines_path))
sr = 24000
parts = [np.zeros(int(0.12 * sr), np.float32)]; t = 0.12; timing = []
for it in items:
    text = it if isinstance(it, str) else it["text"]
    MIN = float(__import__("os").environ.get("MIN_GAP", "1.2"))
    gap = MIN if isinstance(it, str) else max(MIN, it.get("gap", MIN) + (MIN - 0.3 if it.get("gap", 0) > 0.35 else 0))
    a, sr = k.create(text, voice=voice, speed=speed, lang="en-us")
    a = a.astype(np.float32)
    # trim leading/trailing near-silence
    nz = np.where(np.abs(a) > 0.01)[0]
    if len(nz): a = a[max(0, nz[0] - 600): min(len(a), nz[-1] + 1200)]
    timing.append({"text": text, "start": round(t, 3), "end": round(t + len(a) / sr, 3)})
    parts += [a, np.zeros(int(gap * sr), np.float32)]; t += len(a) / sr + gap
y = np.concatenate(parts); y = y / max(1e-6, np.abs(y).max()) * 0.9
sf.write(f"{out}.wav", y, sr)
json.dump({"duration": round(len(y) / sr, 3), "lines": timing}, open(f"{out}.json", "w"), indent=1)
for x in timing: print(f'{x["start"]:6.2f} {x["end"]:6.2f}  {x["text"]}')
print("total", round(len(y) / sr, 2))
