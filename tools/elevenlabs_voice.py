"""Make the voiceover mp3s with ElevenLabs (runs inside the GitHub Action "Make voiceovers"; needs secret ELEVENLABS_API_KEY).
For every work/<YYYY-MM-DD>-slot<N>-<slug>/script.txt without a recording, writes voice_inbox/<YYYYMMDD>-slot<N>.mp3.
A recording Nicole uploads herself always wins (existing files are never overwritten). Only today and later are voiced.
Voice: "Adam - Radio Announcer" (looked up by name, or repo variable ELEVENLABS_VOICE_ID). Model: eleven_flash_v2_5
(0.5 credits per character on the Starter plan; set repo variable ELEVENLABS_MODEL=eleven_multilingual_v2 for best quality)."""
import os, re, sys, json, glob, datetime, urllib.request, urllib.parse

KEY = os.environ.get("ELEVENLABS_API_KEY", "").strip()
MODEL = os.environ.get("ELEVENLABS_MODEL", "").strip() or "eleven_flash_v2_5"
VOICE_ID = os.environ.get("ELEVENLABS_VOICE_ID", "").strip()
VOICE_NAME = os.environ.get("ELEVENLABS_VOICE_NAME", "").strip() or "Adam - Radio Announcer"
API = "https://api.elevenlabs.io/v1"
if not KEY: sys.exit("ELEVENLABS_API_KEY secret is missing")

def call(path, data=None, method=None, raw=False):
    req = urllib.request.Request(API + path, data=json.dumps(data).encode() if data is not None else None, method=method or ("POST" if data is not None else "GET"),
                                 headers={"xi-api-key": KEY, "Content-Type": "application/json", "Accept": "audio/mpeg" if raw else "application/json"})
    with urllib.request.urlopen(req, timeout=120) as r: return r.read() if raw else json.loads(r.read() or b"{}")

norm = lambda s: re.sub(r"[^a-z0-9]", "", s.lower())
def find_voice():
    if VOICE_ID: return VOICE_ID, "(from ELEVENLABS_VOICE_ID)"
    want = norm(VOICE_NAME)
    try:
        mine = call("/voices").get("voices", [])
        for v in mine:
            if norm(v.get("name", "")) == want or want in norm(v.get("name", "")): return v["voice_id"], v["name"] + " (my voices)"
    except Exception as e: print("could not list my voices:", e)
    # not in "My Voices" yet: search the shared Voice Library and add it
    q = urllib.parse.quote("Radio Announcer")
    shared = call(f"/shared-voices?page_size=50&search={q}").get("voices", [])
    hits = [v for v in shared if "adam" in v.get("name", "").lower() and "radio" in v.get("name", "").lower()] or \
           [v for v in shared if "radio" in v.get("name", "").lower() and "announcer" in v.get("name", "").lower()]
    if not hits: sys.exit(f"voice '{VOICE_NAME}' not found: add it to My Voices in ElevenLabs or set repo variable ELEVENLABS_VOICE_ID")
    v = hits[0]
    try:
        call(f"/voices/add/{v['public_owner_id']}/{v['voice_id']}", {"new_name": VOICE_NAME})
        print("added shared voice to My Voices:", v.get("name"))
    except Exception as e: print("note: could not add shared voice (may already be added):", e)
    return v["voice_id"], v.get("name", "") + " (voice library)"

def credits():
    try:
        s = call("/user/subscription"); return s.get("character_limit", 0) - s.get("character_count", 0), s.get("tier", "?")
    except Exception as e: print("could not read credits:", e); return None, "?"

def main():
    today = datetime.datetime.now(datetime.timezone(datetime.timedelta(hours=1))).date()
    todo = []
    for sc in sorted(glob.glob("work/*/script.txt")):
        m = re.match(r"work/(\d{4})-(\d{2})-(\d{2})-slot(\d+)[^/]*/script\.txt", sc)
        if not m: continue
        d = datetime.date(int(m[1]), int(m[2]), int(m[3]))
        if d < today: continue
        out = f"voice_inbox/{m[1]}{m[2]}{m[3]}-slot{m[4]}.mp3"
        if any(os.path.exists(out[:-4] + ext) for ext in (".mp3", ".wav", ".m4a")): continue
        todo.append((sc, out))
    test = os.environ.get("VOICE_TEST") == "1" and not os.path.exists("voice_inbox/_test.mp3")
    left, tier = credits()
    print(f"plan: {tier}, credits left: {left}, model: {MODEL}, scripts to voice: {len(todo)}")
    if not todo and not test: return
    vid, vname = find_voice(); print("voice:", vname, vid)
    settings = {"stability": 0.5, "similarity_boost": 0.75, "style": 0.0, "use_speaker_boost": True}
    jobs = todo + ([("_test", "voice_inbox/_test.mp3")] if test else [])
    for sc, out in jobs:
        lines = ["A man sold the Eiffel Tower.", "Then he came back and sold it again."] if sc == "_test" else \
                [l.strip() for l in open(sc, encoding="utf-8").read().splitlines() if l.strip()]
        # a short pause between sentences keeps them separate for engine3d/timing.py
        text = ' <break time="0.45s" /> '.join(lines)
        cost = len(" ".join(lines)) * (0.5 if "flash" in MODEL or "turbo" in MODEL else 1.0)
        if left is not None and cost > left: print(f"NOT ENOUGH CREDITS for {out} (needs ~{cost:.0f}, left {left})"); continue
        audio = call(f"/text-to-speech/{vid}?output_format=mp3_44100_128", {"text": text, "model_id": MODEL, "voice_settings": settings}, raw=True)
        os.makedirs("voice_inbox", exist_ok=True); open(out, "wb").write(audio)
        if left is not None: left -= cost
        print(f"wrote {out} ({len(audio) // 1024} KB, ~{cost:.0f} credits)")

if __name__ == "__main__": main()
