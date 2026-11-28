#!/bin/bash
# One-time setup per fresh session for the 3D cartoon engine: three.js r160 + Playwright link. Run from anywhere.
set -e
D="$(cd "$(dirname "$0")" && pwd)"; cd "$D"
[ -f node_modules/three/build/three.module.js ] || npm i -s --no-audit --no-fund --no-save three@0.160.0 >/dev/null
if ! node --input-type=module -e "import('$D/node_modules/playwright/index.mjs').then(()=>{}).catch(()=>process.exit(1))" 2>/dev/null; then
  for c in "$(npm root -g)/playwright" /opt/npm-tools/node_modules/playwright /opt/node-tools/node_modules/playwright "$(npm root -g)/@playwright/mcp/node_modules/playwright"; do
    if [ -f "$c/index.mjs" ]; then mkdir -p node_modules; ln -sfn "$c" node_modules/playwright; [ -d "$(dirname "$c")/playwright-core" ] && ln -sfn "$(dirname "$c")/playwright-core" node_modules/playwright-core; break; fi
  done
fi
[ -f node_modules/playwright/index.mjs ] || npm i -s --no-audit --no-fund --no-save playwright >/dev/null
python3 -c "import numpy, PIL" 2>/dev/null || pip install --break-system-packages -q numpy pillow
command -v ffmpeg >/dev/null || echo "WARNING: ffmpeg missing"
echo "engine3d setup done"
