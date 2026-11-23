import sys; from shortaudio import Mix
m = Mix(sys.argv[1], 2411)
m.music("hype")
m.add("pop", .05, .4); m.add("ding", m.wt(0, "comment"), .3)
m.add("whoosh", m.mid(0, 1) - .12, .25); m.add("pop", m.wt(1, "three"), .3)
m.add("whoosh", m.mid(1, 2) - .12, .25); m.add("crowd" if False else "chime", m.wt(2, "spider"), .3)
m.add("whoosh", m.mid(2, 3) - .12, .25); [m.add("tick", m.at(3, 0) + i * .2, .3) for i in range(8)]; m.add("shing", m.wt(3, "eight") + .5, .35)
m.add("whoosh", m.mid(3, 4) - .12, .25); m.add("cash", m.wt(4, "seven"), .35)
m.add("whoosh", m.mid(4, 5) - .12, .25); [m.add("notify", m.at(5, 0) + i * .3, .2) for i in range(9)]
m.add("whoosh", m.mid(5, 6) - .12, .25); m.add("shing", m.wt(6, "one billion"), .4)
m.add("whoosh", m.mid(6, 7) - .12, .25); m.add("pop", m.wt(7, "five"), .3); m.add("ding", m.wt(7, "second"), .3)
m.add("whoosh", m.mid(7, 8) - .12, .25); m.add("chime", m.wt(8, "december"), .3)
m.add("whoosh", m.mid(8, 9) - .12, .25); m.add("pop", m.at(9, .1), .35)
m.write(mvol=.08, svol=.30)
