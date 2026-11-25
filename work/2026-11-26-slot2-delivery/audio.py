import sys; from shortaudio import Mix
m = Mix(sys.argv[1], 8826)
m.music("cozy")
m.add("cash", .05, .4); m.add("whoosh", .3, .25); m.add("pop", m.wt(0, "fifteen"), .3)
m.add("whoosh", m.mid(0, 1) - .12, .25); [m.add("pop", m.wt(1, "seven") - 1.2 + i * .1, .15) for i in range(10)]; m.add("cash", m.wt(1, "seven"), .35)
m.add("whoosh", m.mid(1, 2) - .12, .25); m.add("pop", m.at(2, .1), .3); m.add("ding", m.wt(2, "comment"), .3)
m.add("whoosh", m.mid(2, 3) - .12, .25); [m.add("clink", m.at(3, 0) + i * .5, .15) for i in range(8)]
m.add("whoosh", m.mid(3, 4) - .12, .25); m.add("pop", m.wt(4, "not"), .3)
m.add("whoosh", m.mid(4, 5) - .12, .25); m.add("slide", m.wt(5, "it could"), .3); m.add("ding", m.wt(5, "it could") + 1.2, .3)
m.add("whoosh", m.mid(5, 6) - .12, .25); m.add("ding", m.wt(6, "you paid"), .25)
m.add("slide", m.at(7, 0), .35); m.add("cash", m.at(7, 0) + 1.6, .4); m.add("chime", m.at(7, 0) + 1.7, .35)
m.add("whoosh", m.mid(7, 8) - .12, .25); m.add("slide", m.at(8, 0), .3)
m.add("whoosh", m.mid(8, 9) - .12, .25); m.add("pop", m.at(9, .1), .35)
m.write(mvol=.08, svol=.30)
