import sys; from shortaudio import Mix
m = Mix(sys.argv[1], 46)
m.music("mystery")
m.add("sting", .05, .4); m.ambience("wind", 0, m.L[1]["end"], .06); m.add("pdown", m.wt(0, "one text"), .3)
m.add("whoosh", m.mid(0, 1) - .12, .25); [m.add("pop", m.at(1, .1) + i * .3, .25) for i in range(3)]
m.add("whoosh", m.mid(1, 2) - .12, .2); [m.add("tick", m.wt(2, "you type") + i * .18, .2) for i in range(14)]
m.add("notify", m.at(3, 0), .45); m.add("ding", m.wt(3, "delivered"), .35)
m.add("whoosh", m.mid(3, 4) - .12, .2); m.add("notify", m.wt(4, "send."), .4); m.add("notify", m.at(4, .93), .4)
m.add("static", m.at(5, 0), .4); m.add("whoosh", m.wt(5, "fades"), .35)
m.add("pdown", m.at(6, 0), .4); m.add("thump", m.wt(6, "zero"), .45)
m.add("tick", m.wt(7, "a click"), .6); m.add("chime", m.wt(7, "twelve"), .45)
m.add("whoosh", m.mid(7, 8) - .12, .25); m.add("lights", m.at(8, 0), .3); m.add("pop", m.wt(8, "did you"), .3)
m.add("whoosh", m.mid(8, 9) - .12, .3); m.add("pop", m.at(9, .1), .35); m.add("chime", m.L[9]["end"] + .2, .5)
m.write(mvol=.08, svol=.32)
