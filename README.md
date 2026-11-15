# stickman-shorts
Automated animated stickman YouTube Shorts.

- `CLAUDE.md` — the daily production playbook (used by the scheduled Claude task)
- `engine/` — animation + voice + audio engine (`setup.sh`, `build.sh`)
- `examples/` — finished example videos (scene code, scripts, audio)
- `work/` — sources of produced videos
- `uploader/` + `.github/workflows/upload.yml` — uploads queued videos (folders on the `queue` branch) to YouTube
- `tools/get_youtube_token.py` — run once on your PC to connect YouTube
- `state.json` — upload log. The first 10 uploads are private (review), after that scheduled automatically.
  Change the number with a repo variable `REVIEW_COUNT`.
