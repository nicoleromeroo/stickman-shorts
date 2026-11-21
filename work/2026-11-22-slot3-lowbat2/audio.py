import sys; from shortaudio import Mix
m = Mix(sys.argv[1], 32)
m.music("mystery")
m.add("sting", .05, .4); m.add("tick", .02, .4); m.add("static", m.wt(0, "and you"), .15)
m.add("whoosh", m.mid(0, 1) - .12, .25)
k = m.wt(1, "knocked"); [m.add("thump", k + i * .3, .5) for i in range(3)]
m.add("whoosh", m.mid(1, 2) - .12, .25); m.add("thump", m.at(2, 0), .5); m.add("pdown", m.wt(2, "the knocking"), .25)
m.add("creak", m.at(3, 0), .3); m.add("lights", m.wt(3, "every"), .35)
m.add("sting", m.wt(4, "stuck"), .35); m.ambience("wind", m.at(3, 0), m.L[4]["end"], .08)
m.add("tick", m.at(5, 0), .3); m.add("ding", m.wt(5, "so does"), .25)
m.add("buzz", m.at(6, 0) - .1, .4); m.add("notify", m.wt(6, "find"), .45)
m.add("pdown", m.wt(7, "and your"), .35)
m.add("sting", m.at(8, 0), .45); b = m.wt(8, "blinks"); [m.add("tick", b + i * .25, .5) for i in range(3)]
m.add("whoosh", m.mid(8, 9) - .12, .3); m.add("pop", m.at(9, .1), .35); m.add("tbc", m.L[9]["end"] + .2, .5)
m.write(mvol=.08, svol=.32)
