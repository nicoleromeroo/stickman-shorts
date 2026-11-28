# Cartoon Shorts — daily production playbook (3D cartoon style, Nicole's voice)

Since 28 Nov 2026 the channel makes **3 animated 3D-cartoon Shorts per day**: flat 2D bean-head characters on camera-facing
cards in a colourful 3D world with ink outlines, depth of field and gliding cameras (engine: `engine3d/`, worked example:
`examples3d/eiffel/`). **The voice is Nicole's ElevenLabs recording**, so production runs in two stages: the runs write
scripts a day ahead, Nicole records and uploads them, then the runs build the videos. The old 2D stickman engine (`engine/`,
`examples/`) is retired: never make stickman videos any more. Work autonomously; nobody is watching. Quality and truth beat
speed: queue fewer videos rather than a bad one.

## Schedule (Europe/Berlin) — 3 STORY slots per day
| slot tag | time  | format | priority |
|---|---|---|---|
| slot4 | 11:30 | STORY — one surprising true story (history / science / animals / inventions), twist ending | 1 |
| slot2 | 16:00 | STORY — same format, different era and theme than slot4 | 2 |
| slot3 | 20:00 | STORY — same format, different era and theme than both | 3 |
- **Nicole, 28 Nov:** every video is a "story short" like `ideas.md` and `examples3d/eiffel/` ("The Man Who Sold the Eiffel
  Tower"). The old formats (pop culture, finance, what-if, series, facts) are paused; their rules further down stay only
  as a reference for drawing/sourcing limits. The running series THE LAST BUS is on hold.
- `publish_at` is ISO 8601 with the Berlin offset (`+01:00`, summer `+02:00`).
- Before pushing anything, `git pull --rebase` (the other run may have pushed in between).

## The two stages (do both in every run, in this order: B first if anything is buildable, then A)
**Stage A — scripts (one day ahead).** Make sure scripts exist for **tomorrow and the day after** (Berlin dates). For each
missing slot of those days: pick the topic (Step 1), research + fact-check (Step 2), write the script (Step 3), create
`work/<YYYY-MM-DD>-<slot>-<slug>/` with `script.txt` (the exact words to record, one sentence per line, nothing else),
`sources.md` (URLs + the numbers used) and a short `PLAN.md` (visual idea per sentence). Also append all of that day's
scripts to `scripts/<YYYY-MM-DD>.md` (heading per slot: tag, title idea, the script in a code block, the file name to upload).
Commit and push. Then tell Nicole with SendUserMessage: the scripts in copyable blocks, and per script the file name.
**Stage B — build.** A slot is buildable when its `script.txt` exists, its voice file is in `voice_inbox/`
(`<YYYYMMDD>-slot<N>.mp3`, also accept .wav/.m4a and names like `29-11-slot3` or `20261129_slot3` that clearly
match), and `video-<YYYYMMDD>-slot<N>` is neither on the `queue` branch nor in `state.json`. Build buildable slots for
**tomorrow first, then the day after**, in priority order, **up to 3 per run**; do not start a new video after the run has
been going ~2.5 hours. Copy the voice to `work/<dir>/voice.mp3`. If Nicole changed wording while recording, the script still
times fine as long as the sentences are the same; if a sentence differs a lot, ask nothing, re-time with the closest text.
**Missing voice:** if a slot of tomorrow has a script but no voice at the 20:40 run, skip it and say so clearly in the summary
("29 Nov slot3 not made: no recording in voice_inbox"). Never use the Kokoro voice or any other TTS instead.

### How Nicole records (repeat this in every scripts message, short)
ElevenLabs, the voice "Adam – Radio Announcer" (her settings: stability ~50 %, similarity ~75 %), read the script exactly,
natural pauses at sentence ends, export mp3 **without music**. Upload on GitHub: repo `nicoleromeroo/stickman-shorts` →
folder `voice_inbox` → Add file → Upload files, named `<YYYYMMDD>-slot<N>.mp3` (e.g. `20261129-slot3.mp3`). Tomorrow's
recordings are needed before the 20:40 run; the day-after ones can come any time before the next day's 20:40 run.

## Step 0 — setup
```
bash engine/setup.sh      # fonts (Luckiest Guy for on-screen text); skip the voice model if it is slow
bash engine3d/setup.sh    # three.js + Playwright for the 3D engine
```

## Step 1 — pick the stories (`ideas.md`)
0. **Take ideas from `ideas.md` first** (the backlog, top = next). Re-verify every fact before using one. Move used ideas to
   "## Done" with the date and slot. Keep at least 10 unused ideas in the backlog: when it gets shorter, add new idea cards
   in exactly the same format (title, hook, twist, why it animates well, true/legend + source).
1. **What makes a perfect story idea** (Nicole loves this list style):
   - One surprising story with a **physical cause and effect you can show** (a collapse, a fall, a chase, a reveal, a sinking,
     a flood, an explosion of popcorn…), a clear everyman character, stakes that escalate, and an **ironic twist in the last line**.
   - A setting buildable from simple 3D shapes plus cartoon cards: towns, bridges, ships, castles, deserts, labs, palaces,
     farms, trains, factories, ancient cities.
   - Mix across the 3 daily videos: eras (ancient, medieval, 1600–1800s, 1900s, modern) and themes (con artists, disasters,
     animals, inventions/lucky accidents, weird laws, science, engineering fails, sport oddities, exploration).
   - **Title** 5–8 words, curiosity-driven ("The Soldier Who Never Left", "The War Australia Lost to Birds").
   - **Hook** = the first spoken sentence, a paradox stated as fact, no setup ("A man sold the Eiffel Tower. Twice.").
2. **Truth:** documented history is told as fact; a disputed account says so ("the best explanation is…"); folklore is
   framed as "Legend says…". Never present a viral legend as fact. Verify the key facts on pages you opened (Step 2).
   Record which it is in `sources.md` (True / Disputed / Legend).
3. Never repeat a story or near-duplicate from `topics_log.md` or `ideas.md` "Done".
4. Season rule: a seasonal story only if it fits the next ~10 days (Christmas stories only from 1 December; the 1914
   Christmas truce is a December story). Never more than one seasonal video a day.
5. **Off-limits:** real living people as characters, brand mascots/logos, anything graphic or gory (wars and disasters only
   from the absurd/human side, never casualties as a punchline), politics, mocking any group, sexual content. Historical
   people (long dead) may appear as generic cartoon characters with their name spoken.

### Reference only (paused formats)
4. FACTS slot (slot1) alternates "why" science and myth-busters day by day. CELEBRITY (slot4) and
   WHAT IF (slot5) have their own daily slots:
   - **Celebrity / singer / movie facts** (Nicole wants these): only globally famous people (A-list actors,
     top-charting singers) and big upcoming or current movies/series (e.g. a film releasing within ~3 weeks
     counts as "trending now"). Facts about their **public career only**: records, chart history, box office,
     how a famous film/song was made, behind-the-scenes production facts, early-career stories they told
     publicly. Every fact from a reputable source (official sites, Guinness, Billboard, Variety, BBC,
     Rolling Stone, studio press releases). Hedge anything not 100 % confirmed ("reportedly").
     NEVER: rumours, gossip, dating/relationships, family/children, health, body/looks, scandals, legal
     trouble, politics, anything mocking or negative, made-up quotes, song lyrics.
     **Drawing rules:** never draw the real person or a caricature of them; use generic stickmen
     ("a famous singer"), the name only as on-screen text, and neutral symbols (microphone, stage,
     clapperboard, trophy, ticket). Never draw movie posters, logos, album covers, or a character's
     signature costume/symbol (e.g. no mockingjay pin, no wand, no mask). Movie and person names are fine
     in text. Hook example: "This singer got rejected X times before…" / "The new X movie comes out
     in 5 days. Here's what most fans don't know…".
   - **Gaming facts** (Nicole wants these; they share slot4 with celebrity/movie): viral and trending video
     games: big releases (e.g. GTA 6, launching 19 Nov 2026), record-breaking trailers, launches and updates of
     games Gen Z / Gen Alpha actually play (Minecraft, Fortnite, Roblox, Pokémon, EA FC, Mario, Zelda…), and
     esports records. **Rotation:** a huge launch within ~2 weeks takes priority over celebrity/movie topics
     (GTA 6 launch week = gaming every day it is the clear top trend, but never the same angle twice);
     otherwise aim for about 2–3 gaming videos per week in slot4, and never two gaming videos in a row in other
     slots. Good angles: sales/viewing records, development time and team size, budget, map size, price then vs
     now, how a famous game was made, surprising design facts, "this game took X years…".
     Sources: official publisher/developer sites and press releases, Guinness World Records, The Game
     Awards, Circana/GfK charts, reputable gaming press (IGN, Eurogamer, The Verge, GamesIndustry.biz,
     Polygon, BBC). Leaks, insider claims and rumours are NOT facts: only use them clearly labelled as
     "rumoured" and never as the main hook; prefer confirmed info only.
     **Age-rated games (USK 18 / PEGI 18 / ESRB M, e.g. GTA):** talk only about records, money, production and
     the world/map; never show, describe or joke about crime, weapons, violence, drugs or sexual content, and
     don't encourage under-age players to buy them. No loot-box/skins-gambling content, no cheats/exploits,
     no piracy.
     **Drawing rules:** never draw game characters, logos, box art, maps, HUDs or signature items/vehicles from
     the game; use generic stickmen with a controller, a generic console/PC, a loading bar, a trophy, a
     calendar/countdown, money stacks. Game names only as on-screen text. Hook example: "GTA 6 comes out in
     3 days. It took longer to make than you've been in school…".
   - **What if…?** scenarios ("What if the internet went down for a week?", "What if all women
     disappeared tomorrow?", "What if you never slept?"). Base the consequences on real numbers
     (population shares, how many jobs/people depend on something) and keep it respectful: no violence,
     no gore, nothing that mocks or blames any group; the payoff shows how much the world depends on X.
5. FINANCE slot: rotate sub-themes (everyday costs, saving tricks, compound interest / investing basics,
   prices then vs now, salary/tax basics in Germany) so it never feels templated.
   **Nicole's favourite style (16 Nov):** "aha" money videos that change how a young viewer thinks. Two main
   formats; use them most days, alternating, and only fill in the other sub-themes in between:
   - **"Small money, big result" (investing starts small):** "What if you invest 50 € a month?", "Start at 16
     vs 26: who ends up richer?", "Your daily 3 € snack invested instead", "Skip one delivery order a week…",
     "What 25 € a month becomes by the time you retire". The message: you don't need a lot of money to start,
     time matters more than amount. Always show **money paid in vs final value** side by side (the gap is
     the payoff). Use a **sourced, conservative return assumption** (e.g. long-run average of a broad world
     stock index, after costs, from a reputable source; show it as "assumed ~X % a year" in an on-screen
     footnote) and say clearly that returns are not guaranteed, values go up and down, and the past is no
     promise. Do the maths in Python (monthly compounding). Never recommend a specific product, fund, broker
     or app, and never crypto; "a broad index fund / ETF" as a concept is fine. Don't repeat an amount + time
     combination that's already in topics_log (the 100 € / 30 years video exists): change the amount,
     starting age, duration or comparison.
   - **"Is it worth it?" (work and pay in Germany, real net numbers):** "Is full-time in Germany worth it?"
     (net pay per hour, full-time vs part-time vs minijob), "Your first apprenticeship salary: what's left?",
     "Gross 3,000 € → what actually lands in your account?", "Is a raise of 200 € really 200 €?", "Working
     Sundays/nights: how much extra?", "Student job vs minijob vs Werkstudent". Use **current-year**
     official numbers (tax brackets, Grundfreibetrag, social contribution rates from BMF, Deutsche
     Rentenversicherung, Krankenkassen, Destatis, Mindestlohn; the BMF tax calculator or a reputable
     Brutto-Netto calculator for net figures) and state the assumptions on screen (tax class I, no
     children, no church tax, average health insurance add-on…). Keep the twist honest, e.g. "you work 2.5×
     the hours but only take home 2× the money".
   Hooks for both: start mid-situation with a big number on screen ("50 € a month. That's one pizza a
   week.", "You just signed a full-time contract: 40 hours.").
6. SERIES slot: see Step 1b.
7. Audience: Gen Z / Gen Alpha. Plain spoken English, no slang overload.
8. Off-limits: real living people *except* the celebrity rules above (public-career facts, never drawn),
   game content beyond the gaming rules above,
   brands/logos/trademarked characters (drawn), politics, tragedies,
   medical or legal advice, gambling, crypto shilling, anything sexual or gory, content aimed
   at under-13s specifically.

## Step 1b — the SERIES slot (`series.md`) — paused, reference only
- One story series runs at a time, **5–7 episodes**, one episode per day, ~45–60 s each.
- Read `series.md`. If no series is running (or the last one finished), invent a new one and write its
  bible there first: title, premise (second-person "you" mystery/survival/adventure, PG, no gore),
  main characters with fixed looks (shirt colours, hair etc. so drawings stay consistent),
  setting, and a rough arc for all episodes, with a satisfying final episode.
- Each episode: from Episode 2 on, a 1-line cold open (this episode's big moment), then a 2-second recap line ("Last time, …"), one clear
  event, and a cliffhanger at the end. Last on-screen card: "PART <N+1> TOMORROW" (final episode: "THE END").
- Title format: `<Series title> (Part N) #shorts`. Same music preset for the whole series.
- After building, append to `series.md`: episode number, date, a 2–3 sentence summary, the cliffhanger.
- Facts in a story still have to be true if stated as facts; the story itself is fiction.

## Step 2 — research and fact-check
- Every number or claim must come from a page you actually opened with WebFetch
  (official stats, consumer orgs, universities, reputable press). Record URLs.
- Prefer current-year data. When unsure, hedge in the script ("scientists think", "about").
- Do the maths in Python and keep the numbers you speak consistent with on-screen numbers.
- Put assumptions in an on-screen footnote (HUD text via `hudAt`, Step 4).

## Step 3 — script (`work/<YYYY-MM-DD>-<slot>-<slug>/script.txt`)
**Retention rules (Nicole's feedback 15 Nov: earlier videos felt slow and "adult"):**
- **Hook in the first second, mid-action.** Line 1 drops the viewer into a situation they recognise
  ("It's 2 AM. You said one more video... 47 videos ago." / "Your Short just hit one million views.")
  — never an intro, never a dry fact like "Today in Munich the sun sets at…". Frame 0 must already
  show the situation plus a big on-screen text/number.
- **Win the first second (Nicole's stats 16 Nov: ~40 % swipe away, but those who stay watch ~78 %):** the swipe
  is the bottleneck, not the middle. Frame 0 = a character already moving + ≤5 big words (a number or a question),
  first spoken words are the most surprising thing in the video. Never open on a recap, intro, sepia still or
  title card. **Series:** cold open with the most dramatic moment of THIS episode (1 line), then "Last time…" recap
  in one short line, then the episode.
- **Hook patterns that worked (stay rate ~70 %):** a challenge the viewer can do right now ("Try to tickle yourself
  right now. Go on.") or a belief everyone knows, flipped in the same breath ("Put on a hat! You lose half your heat
  through your head. Except, you don't."). **Weak (46–53 %):** news statements ("The new X movie comes out this
  week…"), situations that aren't the viewer's real life ("Your Short hit one million views"), abstract what-ifs.
  Pop culture / gaming / what-if hooks must still start with YOU + a challenge, guess or surprise, not the news.
- **Gen Z / Gen Alpha interests first:** phones, social media, gaming, school, sleep, creators/YouTube,
  AI, money for things *they* buy (phones, sneakers, games, food), "what if" scenarios, gross/awe facts.
  Adult topics (heating bills, pensions, taxes) only with a teen angle.
- **Length 30–45 s** (up to 50 s). 9–14 short sentences. Open a loop early, pay it off at the end.
- Nicole's ElevenLabs voice speaks ~2.9 words/s with natural pauses: 30 s ≈ 85 words, 45 s ≈ 125, 50 s ≈ 140.
  Plain text, one sentence per line, no stage directions, no emoji, no brackets.
- **Story structure (every video):** 1) Hook: the absurd fact, sentence 1, no setup. 2) Setting in 1–2 lines: when, where,
  who, one concrete detail. 3) Escalation, 2–4 beats, each bigger; others doubt or mock; one exaggeration joke.
  4) Pivot: "But…" / "You see," reveals the real mechanism, often with an everyday analogy. 5) Twist/payoff: short, ironic,
  the last words of the video. Never describe what the viewer already sees.
- Numbers written as words in script.txt so the voice says them right; spell acronyms "P O V".
- Good references: `examples3d/eiffel/script.txt` (hook → setting → escalation → pivot → ironic twist as the last words).
- **Comment prompt (Nicole, 16 Nov), every video:** one honest question answerable in one word: A or B, a number
  guess, yes/no, "comment 1, 2 or 3". Guess-type questions go early, before the reveal ("Guess before the end"); opinion
  questions ("Agree or disagree?", "Would you?") go in the last line. Show it as HUD text too (`hudAt`, Step 4), and make it the
  first line of the description. Mild controversy only if it is true ("most people get this wrong" must be a fact);
  never about politics, people or groups. Comments can't be pinned via the API, so the question lives in the video.

## Step 4 — the 3D cartoon video (`work/<dir>/web/`)
Read `examples3d/eiffel/web/` (world.js, story.js, props.js, index.html) and `engine3d/core.js` before the first video
of a run. Copy the example's `index.html` unchanged; write `world.js`, `story.js` (and `props.js` if you need new props).
1. **Timing:** `python3 engine3d/timing.py work/<dir>/voice.mp3 work/<dir>/script.txt --out work/<dir>` aligns the
   sentences to the pauses in the recording → `phrases.json` (frames per phrase), `words.json`, `timing.json`. Check that
   phrase boundaries fall on pauses; hand-fix a boundary if two sentences share one pause. FRAMES = round(duration × 30);
   the video is exactly as long as the voice. Every visual reaction lands 0–3 frames before its word.
2. **Shot plan in PLAN.md first:** one row per shot (frames, words, set, light, camera move, characters/poses/expressions,
   effect + SFX cue). Usually one shot per phrase. Frame 0 is already the hook image. Vary shot sizes (hook MCU → wide reveal
   → two-shot → insert close-up on the key object → reaction close-up → environment move for the payoff). Light presets
   `day`, `autumn`, `golden`, `interior` (add more in core.js LIGHTS if needed). Time jumps get a white flash (`flashAt`).
   The twist line gets a sting: music stops (Step 5), push-in with a little roll; the last physical payoff lands on the last word.
3. **World (`world.js`):** `export default function buildWorld(api)` builds the set from primitives with painted textures
   (`api.tbox` constant texel density, `frustum`, `cyl`, `sph`, `tree`, `building` (Haussmann block), `hills`, `P.*` painters:
   lattice, facade, shopfront, slate, grass, gravel, cobble, water, panel, carpet, parquet, cloth, wood, carriage, rails,
   signTex). Write new painters in the same flat-with-dark-seams style. Separate sets live far apart in one world
   (e.g. a room at x=1000, a countryside at z=2500). Return `{ update(state, f, shot) }` for animated parts (pivoted groups
   driven by 0..1 progress from `worldAt(f)`). Signs/text on planes must read correctly (not mirrored).
4. **Cast (`story.js` actorsAt):** characters are `K.person(outfit, opts)` cards (2.25 m, soles at the position).
   Outfits via `K.outfit(coat, {hat, cap/hair/bowler colour, moustache, skin, build})`; hats tophat/cap/hair/bonnet/bowler.
   Arms: `armL/armR` = up, raise, out, hold, hip, face, whisper; props via `heldL/heldR(p,hx,hy,u)` painters (envelope,
   suitcase, signs). Expressions: neutral stern grin laugh whistle nervous shock relief relief_open dazed pained smile
   smile_closed lick; `blush` 0..1. Every card gets idle tilt + `blinkAt` blinks; walks use `mode:"stroll"` + `walk()` phase.
   Card `key` must change only when the drawing changes (quantise with `q()`). Effects (puff, burst, steam, leaf,
   banknote, flakes) are small cards; `flat:true` cards lie on the ground (put them ≥0.08 m above any floor/path box).
   Generic characters only: the celebrity/game drawing rules in Step 1 still apply in full.
5. **Cameras/lens (`story.js`):** `camFromKeys` smootherstep glides (18–45 f), `easeOut` whips/reveals, `via` points for
   curved moves, 3–5° rolls on drama, `KICKS` on impacts; every hold creeps. `dofAt`: close-ups/mediums cInf 8–14 px with
   focus on the eyes, wides 0. **Vertical frame is narrow:** half-width at distance d with vfov v is
   d·tan(v/2)·0.5625 (4 m at fov 40 → ±0.8 m), so stage characters in depth, not side by side.
6. **HUD text (`hudAt(f)`):** `[{text, y, size, color, alpha, box}]` drawn in Luckiest Guy with a dark outline. Use it for
   the ≤5 big hook words on frame 0 (they stay ~2 s), the comment question, finance footnotes/assumptions and the series
   end card ("PART <N+1> TOMORROW" / "THE END"). No running captions. Keep text in the top third, never over faces.
7. **Look check (mandatory):** render stills at each shot's middle plus key beats:
   `node engine3d/render.mjs work/<dir>/web work/<dir>/stills "5,60,..." 1` then
   `python3 engine3d/sheet.py work/<dir>/stills work/<dir>/stills/sheet.jpg 6` and look at it with Read. Fix: characters cut by
   the frame edge or too small, camera inside walls/props, props within ~2 m of the lens, raised arms hidden behind heads,
   flat cards under the floor, mirrored or unreadable text, HUD over faces. Repeat until clean. (~1.5–2 s per frame.)

## Step 5 — sound + build
- `work/<dir>/audio.py` (copy `examples3d/eiffel/audio.py`): `score(D, preset, seed, stop=F(twist_frame))` + SFX cues
  (whoosh, ting, thunk, creak, rustle, pop, shh, step, chuff, whistle, slide_down, scrape, ding_cash …) on the visual beats.
  Only synthesized audio. **Presets:** sly, mystery, upbeat, chip, cozy, tense, hype, dreamy — never the same preset twice in
  one day (the series keeps its fixed preset); give every video its own seed.
- Levels are fixed by `engine3d/mix.py` (music exactly 50 % of the voice level, −6 dB gated RMS; SFX at or below that with
  peaks capped). Never edit or re-time Nicole's voice.
- `bash engine3d/build.sh work/<dir>` renders all frames (resumable), mixes, masters to ~−14 LUFS and writes
  `work/<dir>/final.mp4` + `qa_sheet.jpg`. Look at the QA sheet; frozen spans ≥0.4 s or black frames need a fix.
  Run the render with Bash `run_in_background` and poll it (it takes ~30–45 min for 40 s); don't run other heavy jobs meanwhile.
- Check: duration 28–55 s, 1080×1920, audio present.

## Step 6 — metadata (`work/<dir>/meta.json`)
```json
{"title": "Why You Can't Tickle Yourself 🤔 #shorts",
 "description": "<1–2 sentence hook caption>\n\nSources: <short source names>\n\n#shorts #science #funfacts",
 "tags": ["shorts", "science", "fun facts"],
 "publish_at": "2026-11-17T06:00:00+01:00",
 "category_id": "27",
 "made_for_kids": false}
```
- Title ≤ 70 characters, curiosity hook, no clickbait lies, max one emoji.
- Description: caption + "Sources:" line + **2–4 hashtags** total plus `#shorts`.
- Finance videos: add "Not financial advice." to the description.

## Step 7 — queue for upload (the `queue` branch)
Releases are not available to this session; videos are queued by pushing them to the
`queue` branch. The GitHub Action (every 3 hours, at :23) uploads each folder, then removes it from that branch.
Tag = `video-<YYYYMMDD>-slot<N>` (date = publish day). Asset names MUST be `video.mp4` and `meta.json`.
```
QD=/tmp/queue-wt
rm -rf $QD; if git ls-remote --exit-code --heads origin queue >/dev/null; then
  git fetch --depth 1 origin queue && git worktree add -f $QD FETCH_HEAD
else   # branch is deleted when empty -> start a fresh one
  mkdir -p $QD && git -C $QD init -q -b queue
fi
for each finished video:
  mkdir -p $QD/<tag> && cp work/<dir>/final.mp4 $QD/<tag>/video.mp4 && cp work/<dir>/meta.json $QD/<tag>/meta.json
cd $QD && git add -A && git commit -m "queue <date>" && git push origin HEAD:queue
cd - && (git worktree remove --force $QD 2>/dev/null || rm -rf $QD)
```
If the push is rejected (the Action just cleaned the branch), redo the fetch/worktree step and push again.
After pushing, **start the upload right away**: trigger the `upload.yml` workflow (workflow_dispatch on `main`,
GitHub MCP `actions_run_trigger` → `run_workflow`). GitHub's scheduled :23 runs are often skipped or delayed by hours,
so don't rely on them. A minute later, check `state.json` on main to confirm each tag shows up with mode "scheduled".
Push all videos of this run in one commit. Never put mp4/wav files on `main`.

## Step 8 — log + summary
Append one line per video to `topics_log.md`:
`- 2026-11-17 slot1 | A numbers | Black Friday deals | sources: which.co.uk …`
Commit `topics_log.md` and the `work/<dir>/` sources (script.txt, sources.md, PLAN.md, phrases.json, web/*.js, web/index.html,
audio.py, meta.json only — never frames, wav or mp4) and push. Leave the voice files in `voice_inbox/`.

Finish every run with one SendUserMessage: videos queued (title + publish time), scripts waiting for a recording (with the
file names), slots skipped and why, problems.

## If something fails
Skip that video, log the reason in `topics_log.md` under `## Problems`, and continue with the others.
Never queue a video whose facts you could not verify.
