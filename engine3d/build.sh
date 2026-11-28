#!/bin/bash
# bash engine3d/build.sh work/<dir>     (run from the repo root)
# Needs in work/<dir>: voice.mp3 (Nicole's ElevenLabs recording), script.txt (exact spoken text), web/{index.html,story.js,world.js},
# audio.py. Produces: phrases.json/words.json/timing.json (if missing), frames/, music.wav, sfx.wav, mix.wav, final.mp4, qa_sheet.jpg.
set -e
W="${1%/}"
[ -f "$W/phrases.json" ] || python3 engine3d/timing.py "$W/voice.mp3" "$W/script.txt" --out "$W"
N=$(python3 -c "import json;print(json.load(open('$W/timing.json'))['frames'])")
echo "== render $N frames"
RESUME=1 node engine3d/render.mjs "$W/web" "$W/frames" "0-$((N-1))" 1
echo "== sound"
python3 "$W/audio.py" "$W"
python3 engine3d/mix.py "$W/voice.mp3" "$W/music.wav" "$W/sfx.wav" "$W/mix.wav"
I=$(ffmpeg -hide_banner -i "$W/mix.wav" -af ebur128 -f null - 2>&1 | grep -E "^\s+I:" | tail -1 | awk '{print $2}')
G=$(python3 -c "print(round(-14 - ($I), 2))")
ffmpeg -y -v error -i "$W/mix.wav" -af "volume=${G}dB,alimiter=limit=0.891:attack=2:release=60:level=disabled,aresample=48000" -c:a pcm_s16le "$W/master.wav"
ffmpeg -y -v error -framerate 30 -i "$W/frames/f%04d.jpg" -i "$W/master.wav" -map 0:v:0 -map 1:a:0 \
  -c:v libx264 -preset veryfast -crf 17 -pix_fmt yuv420p -c:a aac -b:a 192k -ar 48000 -shortest -movflags +faststart "$W/final.mp4"
echo "== QA"
ffprobe -v error -show_entries format=duration:stream=codec_name,width,height,nb_frames -of compact "$W/final.mp4"
ffmpeg -hide_banner -i "$W/final.mp4" -af ebur128 -f null - 2>&1 | grep -E "^\s+I:" | tail -1
ffmpeg -hide_banner -i "$W/final.mp4" -vf "freezedetect=n=0.0008:d=0.4,blackdetect=d=0.1:pix_th=0.06" -an -f null - 2>&1 | grep -E "freeze_start|black_start" || echo "no freezes / black frames"
ffmpeg -y -v error -i "$W/final.mp4" -vf "fps=1.5,scale=216:384,tile=10x6" -frames:v 1 "$W/qa_sheet.jpg"
echo "$W/final.mp4"
