#!/bin/bash
# One-time setup per fresh session: Python + Node deps, fonts, offline voice model.
set -e
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT/engine"
pip install --break-system-packages -q kokoro-onnx soundfile numpy 2>&1 | grep -v -i warning || true
[ -d node_modules/@fontsource/luckiest-guy ] || npm i -s --no-audit --no-fund @fontsource/luckiest-guy @fontsource/nunito >/dev/null
mkdir -p "$ROOT/engine/models"
cd "$ROOT/engine/models"
for f in kokoro-v1.0.onnx voices-v1.0.bin; do
  [ -s "$f" ] || curl -sSL --max-time 600 -o "$f" "https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/$f"
done
ls -la "$ROOT/engine/models"
command -v ffmpeg >/dev/null || echo "WARNING: ffmpeg missing"
node -e "require('playwright')" 2>/dev/null && echo "playwright ok" || echo "WARNING: playwright missing"
echo "setup done"
