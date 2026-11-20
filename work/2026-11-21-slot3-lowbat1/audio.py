import sys; from shortaudio import Mix
m = Mix(sys.argv[1], 31)
m.music("mystery")
m.add("notify", .1, .45); m.add("static", .3, .15); m.add("sting", m.wt(0, "from your"), .35)
m.add("notify", m.at(1, 0) - .1, .4)
m.add("whoosh", m.mid(1, 2) - .12, .25); m.add("laugh", m.at(2, .05), .25); m.add("tick", m.wt(2, "it's"), .3)
m.add("notify", m.wt(3, "they'll") - .2, .4)
m.add("tick", m.at(4, 0), .3); m.add("pdown", m.wt(4, "four"), .3); m.add("hum", m.wt(4, "the whole"), .15) if False else None
m.add("dingdong", m.at(5, 0), .25)
k1 = m.wt(5, "knock"); m.add("thump", k1, .8); m.add("thump", (k1 + m.L[5]["end"]) / 2 - .05, .8); m.add("thump", m.L[5]["end"] - .35, .8)
m.add("static", m.at(6, 0), .25); m.add("creak", m.wt(6, "whispers"), .3); m.add("sting", m.wt(6, "it sounds"), .4)
m.add("buzz", m.at(7, 0), .4); m.add("notify", m.wt(7, "that's") - .1, .45); m.add("sting", m.wt(7, "that's"), .5)
m.add("whoosh", m.mid(7, 8) - .12, .3); m.add("pop", m.at(8, .1), .35); m.add("tbc", m.L[8]["end"] + .2, .5)
m.write(mvol=.08, svol=.32)
