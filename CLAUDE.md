# Stickman Shorts — daily production playbook

You are producing **3 animated stickman YouTube Shorts per day** for Nicole's channel.
Each run makes the videos for **the next day** and queues them for upload. Work fully
autonomously; nobody is watching. Quality and truth beat speed: if a video is not good
enough, queue fewer videos rather than a bad one.

## Schedule (Europe/Berlin)
- Slot 1: 08:00 · Slot 2: 12:30 · Slot 3: 18:00 — always for the **next calendar day**.
- `publish_at` in meta.json is ISO 8601 with the Berlin offset, e.g. `2026-11-17T08:00:00+01:00`
  (use +02:00 during summer time).

## Step 0 — setup
```
bash engine/setup.sh
```

## Step 1 — pick 3 topics
1. Read `topics_log.md` (every topic ever made). Never repeat a topic or a near-duplicate.
2. Research what is trending **right now** with WebSearch (TikTok / YouTube Shorts / Instagram
   trend roundups of this week, Google-trending news that is safe and family-friendly) and what is
   **seasonal** (upcoming holidays, events, school/payday cycles; Germany + international).
3. Pick 3 topics with a **different format each**, rotating so the channel never feels templated:
   - A) *Numbers explainer* — money/season with real figures (e.g. "what X really costs")
   - B) *"Why does this happen?"* everyday science
   - C) *Second-person mini story* ("you…") with a cliffhanger, or a myth-buster / history oddity
   Audience: Gen Z / Gen Alpha. Plain spoken English, no slang overload.
4. Off-limits: real living people, brands/logos/trademarked characters, politics, tragedies,
   medical or legal advice, gambling, crypto shilling, anything sexual or gory, content aimed
   at under-13s specifically. Finance = education only, add "Not financial advice."

## Step 2 — research and fact-check
- Every number or claim must come from a page you actually opened with WebFetch
  (official stats, consumer orgs, universities, reputable press). Record URLs.
- Prefer current-year data. When unsure, hedge in the script ("scientists think", "about").
- Do the maths in Python and keep the numbers you speak consistent with on-screen numbers.
- Put assumptions in an on-screen footnote (see `examples/x_lights`, `examples/x_santa`).

## Step 3 — script (`work/<YYYY-MM-DD>-<slot>-<slug>/lines.json`)
- Structure: hook stated as a fact (no intro) → setup → escalation → `Wait. …?` →
  `You see, …` explanation with an everyday comparison → short twist/punchline.
- 8–12 lines, 35–60 s total. Numbers written as words in lines.json so the voice says them right
  ("two hundred and sixty-two euros"; spell acronyms "P O V").
- Use `{"text": "...", "gap": 0.4}` after punchlines; the generator adds ≥1.2 s pause per line.

## Step 4 — animation (`<slug>.html`)
- Copy the closest example from `examples/` and adapt. Shared helpers live in `engine/engine.js`
  (stick, hero, brainChar, phoneDev, captions, runScenes, sparkle, bubble, meter, snow, tbc, sepia …).
- Head of the page must load fonts from `../../engine/node_modules/@fontsource/...` and
  `<script src="../../engine/engine.js">` — same as the examples.
- 3–6 scenes, each line illustrated literally, captions via `captions(t, CAP, HOT, 1640)`.
- **Render check is mandatory**: `node engine/render.js work/<dir>/<page>.html work/<dir>/voice.json stills <t1,t2,…> work/<dir>/st`
  then build a contact sheet with ffmpeg and look at it with Read. Fix: overlapping text,
  captions covering faces, cut-off labels, wrong timing, unreadable small text, `<` instead of `€`.
  Repeat until clean.

## Step 5 — audio + build
- `audio.py` uses `from shortaudio import Mix` (see examples). Music presets: `upbeat`, `lofi`,
  `mystery`, `tense`. Music stays quiet (mvol ≤ 0.09). Only synthesized audio — never download music.
- `bash engine/build.sh work/<dir> <page>.html` → `work/<dir>/final.mp4`.
- Check: duration 30–62 s, 1080×1920, audio present, a final contact sheet looks right.

## Step 6 — metadata (`work/<dir>/meta.json`)
```json
{"title": "Why You Can't Tickle Yourself 🤔 #shorts",
 "description": "<1–2 sentence hook caption>\n\nSources: <short source names>\n\n#shorts #science #funfacts",
 "tags": ["shorts", "science", "fun facts"],
 "publish_at": "2026-11-17T08:00:00+01:00",
 "category_id": "27",
 "made_for_kids": false}
```
- Title ≤ 70 characters, curiosity hook, no clickbait lies, max one emoji.
- Description: caption + "Sources:" line + **2–4 hashtags** total plus `#shorts`.
- Finance videos: add "Not financial advice." to the description.

## Step 7 — queue for upload
For each finished video:
```
gh release create video-<YYYYMMDD>-<slot> work/<dir>/final.mp4#video.mp4 work/<dir>/meta.json \
  --title "<title>" --notes "<publish_at>"
```
(asset names must end up as `video.mp4` and `meta.json` — copy/rename the files first if needed.)
The GitHub Action uploads them. Do not commit mp4/wav files.

## Step 8 — log
Append one line per video to `topics_log.md`:
`- 2026-11-17 slot1 | A numbers | Black Friday deals | sources: which.co.uk …`
Commit `topics_log.md` and the `work/<dir>/` sources (html, lines.json, audio.py, meta.json only) and push.

## If something fails
Skip that video, log the reason in `topics_log.md` under `## Problems`, and continue with the others.
Never queue a video whose facts you could not verify.
