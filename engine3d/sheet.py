import sys, glob, os
from PIL import Image, ImageDraw
src, out = sys.argv[1], sys.argv[2]; cols = int(sys.argv[3]) if len(sys.argv) > 3 else 6
fs = sorted(glob.glob(os.path.join(src, "f*.jpg")))
tw, th = 270, 480; rows = (len(fs) + cols - 1) // cols
S = Image.new("RGB", (cols * tw, rows * (th + 22)), "#111")
d = ImageDraw.Draw(S)
for i, f in enumerate(fs):
    im = Image.open(f).convert("RGB").resize((tw, th)); x, y = (i % cols) * tw, (i // cols) * (th + 22)
    S.paste(im, (x, y + 22)); d.text((x + 6, y + 4), os.path.basename(f)[1:5], fill="#fff")
S.save(out, quality=88); print(out, len(fs))
