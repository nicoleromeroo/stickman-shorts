#!/bin/bash
# usage: engine/build.sh <project_dir> <page.html> [voice] [speed]
# expects lines.json and audio.py in project dir; writes <project_dir>/final.mp4
set -e
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
P="$(cd "$1" && pwd)"; HTML="$2"; VOICE="${3:-am_michael}"; SPEED="${4:-1.08}"; export MIN_GAP="${MIN_GAP:-0.5}"
cd "$P"
if [ ! -f voice.json ] || [ lines.json -nt voice.json ]; then
  python3 -I "$ROOT/engine/gen_voice.py" "$ROOT/engine/models" "$VOICE" lines.json voice "$SPEED" | tail -1
fi
PYTHONPATH="$ROOT/engine" python3 audio.py "$PWD"
node "$ROOT/engine/render.js" "$HTML" voice.json full silent.mp4
ffmpeg -v error -y -i silent.mp4 -i mix.wav -map 0:v:0 -map 1:a:0 -c:v copy -af "loudnorm=I=-14:TP=-1.5:LRA=7" -c:a aac -b:a 160k -ar 48000 -shortest -movflags +faststart final.mp4
ffprobe -v error -show_entries format=duration,size -of compact final.mp4
