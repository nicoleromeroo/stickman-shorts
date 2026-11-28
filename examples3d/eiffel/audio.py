# Eiffel example: music stops for the twist ("And the tower?"), SFX on every visual beat. Run from the repo root.
import sys; sys.path.insert(0, "engine3d"); from sound3d import *
W = sys.argv[1] if len(sys.argv) > 1 else "examples3d/eiffel"
D = Dur(f"{W}/timing.json")
music = score(D, preset="sly", seed=7, stop=F(1099))
sfx = blank(D)
for fr, x, g in [(45, whoosh(1.2), 0.5), (124, thunk(110, 0.5), 0.9), (126, ting(1568, 0.9), 0.55), (150, whoosh(0.5), 0.6), (160, whoosh(1.8), 0.35),
                 (236, creak(1.0, 150), 0.6), (276, rustle(1.6), 0.7), (302, ding_cash(), 0.55), (426, pop(), 0.8), (428, ting(1760, 1.0), 0.6),
                 (555, shh(0.8), 0.8), (621, thunk(80, 0.6), 1.0), (712, scrape(0.6), 0.5), (731, ting(2093, 0.9), 0.6), (744, whoosh(0.5), 0.6),
                 (758, whistle(1.2), 0.55), (912, slide_down(0.8), 0.6), (938, whoosh(0.5), 0.6), (1036, shh(0.7), 0.8), (1067, whoosh(0.35), 0.7),
                 (1193, thunk(140, 0.4), 0.85)]:
    cue(sfx, F(fr), x, g)
for i in range(6): cue(sfx, F(668 + i * 4), pop(), 0.55)
for k in range(20): cue(sfx, F(751 + k * 30 / 4.2), chuff(), 0.45)
write(f"{W}/music.wav", norm(music)); write(f"{W}/sfx.wav", norm(sfx))
print("stems written", round(D, 2), "s")
