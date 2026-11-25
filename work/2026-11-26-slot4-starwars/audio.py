import sys; from shortaudio import Mix
m = Mix(sys.argv[1], 2611)
m.music("upbeat")
m.add("whoosh", .05, .3); m.add("buzz", m.wt(0, "from a computer"), .2); m.add("pop", m.wt(0, "a bear"), .35); m.add("pop", m.wt(0, "an elephant"), .35); m.add("pop", m.wt(0, "an old"), .35)
m.add("whoosh", m.mid(0, 1) - .12, .25); m.add("ding", m.wt(1, "recorded"), .3)
m.add("whoosh", m.mid(1, 2) - .12, .25); [m.add("pop", m.at(2, 0) + .2 + i * .2, .3) for i in range(3)]; m.add("ding", m.wt(2, "comment"), .3)
m.add("whoosh", m.mid(2, 3) - .12, .25); m.ambience("hum", m.wt(3, "projector"), m.L[3]["end"], .08); m.add("static", m.wt(3, "buzz"), .2)
m.add("whoosh", m.mid(3, 4) - .12, .25); m.add("boing", m.wt(4, "young bear"), .3)
m.add("whoosh", m.mid(4, 5) - .12, .25); m.add("sting", m.wt(5, "elephant"), .3)
m.add("whoosh", m.mid(5, 6) - .12, .25); [m.add("tick", m.wt(6, "synth") + i * .15, .2) for i in range(5)]
m.add("whoosh", m.mid(6, 7) - .12, .25); m.add("shing", m.wt(7, "a hammer") + .3, .4); m.add("chime", m.wt(7, "number"), .4)
m.add("whoosh", m.mid(7, 8) - .12, .25); m.add("ding", m.at(8, .3), .3)
m.add("whoosh", m.mid(8, 9) - .12, .25); m.add("pop", m.at(9, .1), .35)
m.write(mvol=.08, svol=.30)
