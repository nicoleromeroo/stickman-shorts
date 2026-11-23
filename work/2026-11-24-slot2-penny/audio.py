import sys; from shortaudio import Mix
m = Mix(sys.argv[1], 7781)
m.music("cozy")
m.add("cash", .05, .35); m.add("clink", m.wt(0, "one cent"), .35); m.add("ding", m.wt(0, "comment"), .3)
m.add("whoosh", m.mid(0, 1) - .12, .25); m.add("clink", m.at(1, .05), .3); m.add("pop", m.wt(1, "day ten"), .3)
m.add("whoosh", m.mid(1, 2) - .12, .25); m.add("pop", m.wt(2, "just over"), .3); m.add("bonk", m.wt(2, "the million"), .25)
m.add("whoosh", m.mid(2, 3) - .12, .3); m.add("thump", m.at(3, .1), .5); m.add("shing", m.at(3, .5), .35)
m.add("whoosh", m.mid(3, 4) - .12, .25); m.add("cash", m.wt(4, "one point"), .35); m.add("cash", m.wt(4, "day thirty"), .4)
m.add("whoosh", m.mid(4, 5) - .12, .25); m.add("slide", m.at(5, .2), .3)
m.add("whoosh", m.mid(5, 6) - .12, .25); m.add("pop", m.wt(6, "same curve"), .3)
m.add("whoosh", m.mid(6, 7) - .12, .25); [m.add("pop", m.wt(7, "doubles") + i * .45, .25) for i in range(5)]
m.add("whoosh", m.mid(7, 8) - .12, .25); m.add("cash", m.wt(8, "almost"), .35); m.add("ding", m.wt(8, "not guaranteed"), .25)
m.add("whoosh", m.mid(8, 9) - .12, .25); m.add("pop", m.at(9, .1), .35)
m.write(mvol=.08, svol=.30)
