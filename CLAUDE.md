# Stickman Shorts — daily production playbook

You are producing **5 animated stickman YouTube Shorts per day** for Nicole's channel.
There are two runs per day (15:40 and 20:40 Berlin); each run fills **up to 3** still-missing slots
of **the next day** (priority order below) and queues them for upload. Work fully
autonomously; nobody is watching. Quality and truth beat speed: if a video is not good
enough, queue fewer videos rather than a bad one.

## Schedule (Europe/Berlin) — one fixed format per slot
| slot tag | time  | format | priority |
|---|---|---|---|
| slot1 | 06:00 | FACTS — "why does this happen?" science, alternating with myth-busters | 5 |
| slot4 | 11:30 | POP CULTURE: CELEBRITY / SINGER / MOVIE / GAMING facts (rules in Step 1, point 4) | 2 |
| slot2 | 16:00 | FINANCE — money with real numbers, teen angle. Description ends with "Not financial advice." | 3 |
| slot5 | 18:30 | WHAT IF…? scenario (rules in Step 1, point 4) | 4 |
| slot3 | 20:00 | SERIES — next episode of the running series (`series.md`) | 1 |
- Slot tags keep their numbers (slot4/slot5 were added later); the tag decides the time, not the order.
- Publish times changed on 16 Nov (Nicole): 06:00 / 11:30 / 16:00 / 18:30 / 20:00, valid from 17 Nov. Series
  descriptions say "Part N tomorrow at 20:00".
- **Which slots to make:** a slot of tomorrow is filled if `video-<YYYYMMDD>-slot<N>` is on the `queue`
  branch or in `state.json` (unless topics_log.md says it is held). Make the missing ones in priority order
  (1 = first), **at most 3 per run**. If all 5 are filled, finish with a short "nothing to do" summary.
- Always for the **next calendar day**. `publish_at` in meta.json is ISO 8601 with the Berlin offset,
  e.g. `2026-11-17T06:00:00+01:00` (use +02:00 during summer time).
- Before pushing anything, `git pull --rebase` (the other run may have pushed in between).

## Step 0 — setup
```
bash engine/setup.sh
```

## Step 1 — pick the topics
0. **Check `plan.md` first** (Nicole's topic plan): use the planned topic for that day and slot unless it can't be
   verified, became a near-duplicate, or the news changed; then pick one the normal way. Move made topics to "Done".
1. Read `topics_log.md` (every topic ever made). Never repeat a topic or a near-duplicate.
2. Research what is trending **right now** with WebSearch (TikTok / YouTube Shorts / Instagram
   trend roundups of this week, Google-trending news that is safe and family-friendly).
3. **Season rule — match the calendar.** A seasonal topic must fit what people are living through
   *now*: something happening today or within the next ~10 days. Christmas topics (trees, gifts,
   Santa, Glühwein…) only from **1 December**; in November think autumn, darker days, cold/heating,
   Black Friday (only in the week before it), St. Martin, first snow. Evergreen topics are always fine.
   Never more than one seasonal video per day.
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

## Step 1b — the SERIES slot (`series.md`)
- One story series runs at a time, **5–7 episodes**, one episode per day, ~45–60 s each.
- Read `series.md`. If no series is running (or the last one finished), invent a new one and write its
  bible there first: title, premise (second-person "you" mystery/survival/adventure, PG, no gore),
  main characters with fixed looks (shirt colours, hair etc. so drawings stay consistent),
  setting, and a rough arc for all episodes, with a satisfying final episode.
- Each episode: 2-second recap line at the start from Episode 2 on ("Last time, …"), one clear
  event, and a cliffhanger at the end. Last on-screen card: "PART <N+1> TOMORROW" (final episode: "THE END").
- Title format: `<Series title> (Part N) #shorts`. Same music preset for the whole series.
- After building, append to `series.md`: episode number, date, a 2–3 sentence summary, the cliffhanger.
- Facts in a story still have to be true if stated as facts; the story itself is fiction.

## Step 2 — research and fact-check
- Every number or claim must come from a page you actually opened with WebFetch
  (official stats, consumer orgs, universities, reputable press). Record URLs.
- Prefer current-year data. When unsure, hedge in the script ("scientists think", "about").
- Do the maths in Python and keep the numbers you speak consistent with on-screen numbers.
- Put assumptions in an on-screen footnote (see `examples/x_lights`, `examples/x_santa`).

## Step 3 — script (`work/<YYYY-MM-DD>-<slot>-<slug>/lines.json`)
**Retention rules (Nicole's feedback 15 Nov: earlier videos felt slow and "adult"):**
- **Hook in the first second, mid-action.** Line 1 drops the viewer into a situation they recognise
  ("It's 2 AM. You said one more video... 47 videos ago." / "Your Short just hit one million views.")
  — never an intro, never a dry fact like "Today in Munich the sun sets at…". Frame 0 must already
  show the situation plus a big on-screen text/number.
- **Gen Z / Gen Alpha interests first:** phones, social media, gaming, school, sleep, creators/YouTube,
  AI, money for things *they* buy (phones, sneakers, games, food), "what if" scenarios, gross/awe facts.
  Adult topics (heating bills, pensions, taxes) only with a teen angle.
- **Length 30–45 s** (stories up to 50 s). 8–10 short lines. Open a loop early, pay it off at the end.
- Pacing: `MIN_GAP=0.5` (build.sh default) and voice speed 1.08; give `{"gap": 0.5–0.9}` only after
  punchlines and cliffhangers.
- Structure for facts/finance: situation hook → "why?" → explanation with one strong visual metaphor
  (slot machine, giant pot, ice cube) → twist line.
- Numbers written as words in lines.json so the voice says them right; spell acronyms "P O V".
- Good references: `work/2026-11-15-slotA-scroll`, `work/2026-11-15-slotB-views`, `work/2026-11-15-slotC-respawn1`.
- **Comment prompt (Nicole, 16 Nov), every video:** one honest question answerable in one word: A or B, a number
  guess, yes/no, "comment 1, 2 or 3". Guess-type questions go early, before the reveal ("Guess before the end"); opinion
  questions ("Agree or disagree?", "Would you?") go in the last line. Show it as on-screen text too, and make it the
  first line of the description. Mild controversy only if it is true ("most people get this wrong" must be a fact);
  never about politics, people or groups. Comments can't be pinned via the API, so the question lives in the video.

## Step 4 — animation (`<slug>.html`)
- Copy the closest example from `examples/` and adapt. Shared helpers live in `engine/engine.js`
  (stick, hero, brainChar, phoneDev, captions, runScenes, sparkle, bubble, meter, snow, tbc, sepia …).
- Head of the page must load fonts from `../../engine/node_modules/@fontsource/...` and
  `<script src="../../engine/engine.js">` — same as the examples.
- 3–6 scenes, each line illustrated literally, captions via `captions(t, CAP, HOT, 1640)`.
- Keep characters big in frame (no tiny figures in empty rooms); main text at the top, captions at 1640.
- Never use glyphs the fonts lack (▲ ≈ ÷ ▶ emoji): draw shapes instead. `€` is handled by txt().
- **Render check is mandatory**: `node engine/render.js work/<dir>/<page>.html work/<dir>/voice.json stills <t1,t2,…> work/<dir>/st`
  then build a contact sheet with ffmpeg and look at it with Read. Fix: overlapping text,
  captions covering faces, cut-off labels, wrong timing, unreadable small text, `<` instead of `€`.
  Repeat until clean.

## Step 5 — audio + build
- `audio.py` uses `from shortaudio import Mix` (see examples). Music presets: `upbeat`, `lofi`,
  `mystery`, `tense`. Music stays quiet (mvol ≤ 0.09). Only synthesized audio — never download music.
- `bash engine/build.sh work/<dir> <page>.html` → `work/<dir>/final.mp4`.
- Check: duration 28–50 s, 1080×1920, audio present, a final contact sheet looks right.

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

## Step 8 — log
Append one line per video to `topics_log.md`:
`- 2026-11-17 slot1 | A numbers | Black Friday deals | sources: which.co.uk …`
Commit `topics_log.md` and the `work/<dir>/` sources (html, lines.json, audio.py, meta.json only) and push.

## If something fails
Skip that video, log the reason in `topics_log.md` under `## Problems`, and continue with the others.
Never queue a video whose facts you could not verify.
