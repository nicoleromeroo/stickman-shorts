import sys; from shortaudio import Mix
m = Mix(sys.argv[1], 2711)
m.music("spooky")
m.ambience("hum", 0, m.L[2]["end"], .07); m.add("sting", .05, .35); m.add("pop", m.wt(0, "every seat"), .3)
m.add("whoosh", m.mid(0, 1) - .12, .25); m.add("notify", m.at(1, 0), .3); m.add("pdown", m.wt(1, "no signal"), .3)
m.add("whoosh", m.mid(1, 2) - .12, .25); m.ambience("wind", m.at(2, 0), m.L[2]["end"], .1); [m.add("pop", m.at(2, 0) + i * .8, .25) for i in range(3)]
m.add("whoosh", m.mid(2, 3) - .12, .25); m.add("thump", m.wt(3, "you press"), .3); m.add("ding", m.wt(3, "ding"), .45); m.add("static", m.wt(3, "flickers"), .2)
m.add("sting", m.at(4, 0), .45)
m.add("whoosh", m.mid(4, 5) - .12, .25); m.add("creak", m.wt(5, "he just"), .35)
m.add("whoosh", m.mid(5, 6) - .12, .25); m.add("slide", m.at(6, 0), .3); m.add("thump", m.wt(6, "one way"), .35)
m.add("whoosh", m.mid(6, 7) - .12, .25); m.ambience("wind", m.wt(7, "a whisper"), m.L[7]["end"], .1); m.add("sting", m.wt(7, "don't give"), .35)
m.add("whoosh", m.mid(7, 8) - .12, .3); m.add("pop", m.at(8, .1), .35); m.add("tbc", m.L[8]["end"] + .2, .5)
m.write(mvol=.08, svol=.32)
