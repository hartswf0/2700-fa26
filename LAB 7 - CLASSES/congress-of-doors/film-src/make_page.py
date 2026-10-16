# Builds ../index.html from the Good Shellacking page shell and timing/cd.json.
import json, os, re, html
H = os.path.dirname(os.path.abspath(__file__)); R = os.path.dirname(H)
T = json.load(open(os.path.join(H, 'timing', 'cd.json')))
shell = open(os.path.join(R, '..', 'good-shellacking', 'index.html'), encoding='utf-8').read()
esc = lambda s: html.escape(s, quote=False).replace('’', '&rsquo;')
cast = T['cast']; nm = lambda w: cast.get(w, {}).get('name', w)
TITLES = {'arrive': 'THE HALL', 'object': 'THE OBJECTIST', 'passage': 'THE TRANSITIONIST', 'convention': 'THE CONVENTIONALIST',
          'encounter': 'THE ENCOUNTERIST', 'vote': 'THE VOTE, AND LUNCH', 'days': 'THE DAYS', 'cleaner': 'THE CLEANER', 'published': 'THE PROCEEDINGS'}
lines, script = [], []
for sh in T['shots']:
    if not sh.get('lines'): continue
    if TITLES.get(sh['shot']): script.append(f"<h3>{TITLES[sh['shot']]}</h3>")
    for l in sh['lines']:
        say = l.get('show') or l['say']
        cls = ' class=fulcrum' if l.get('line') else ''
        script.append(f"<p{cls}><b>{esc(nm(l['who']))}.</b> {esc(say)}</p>")
        if l.get('line'): lines.append(f"<li><span>{esc(nm(l['who']))}</span>{esc(say)}</li>")
n = len(lines); words = {5: 'FIVE', 6: 'SIX', 7: 'SEVEN', 8: 'EIGHT', 9: 'NINE', 10: 'TEN'}.get(n, str(n))
note = f'''<section class="note">
<h2>{words} LINES</h2>
<ol class="lines">{''.join(lines)}</ol>
<h2>HOW IT IS MADE</h2>
<p>This is the second of four fables of Edifiction, a world in which the Ministry of Constructive Semantics builds whatever can be described. Here four schools send a delegate each to settle what a door is, and the Ministry lends each delegate an Edifier, the machine that builds from description. Every door does exactly what its definition says and nothing more. The Objectist says a door is an object, and gets a magnificent door with six panels, a carved lintel and a brass knob, and no hinges, because hinges are about use. The Transitionist says a door is a passage, and gets a door-shaped absence with no frame and no wall: you walk through it and arrive in the hall. The Conventionalist says a door is an agreement about who may pass, and gets a door with a grille that refuses the chairman and admits the tea. The Encounterist says no door exists until someone tries to pass, and gets nothing at all, until somebody tries to leave. When the Congress adjourns for lunch, every exit in the hall, the windows included, has his door in front of it. The only door that works is the plain one at the back, which the cleaner uses every night, because nobody defined it.</p>
<p>The film is a comedy on one closed set. The hall has four arched bays, four Edifiers, a rostrum with a bell, a clock and a calendar, a long table with name cards and carafes, and a plain door in the corner that the camera passes many times before the film looks at it. Each delegate has a silhouette you can read from across the hall: the Objectist tall and columnar, the Transitionist thin and leaning into a step he has not taken, the Conventionalist short and round under a flat hat, the Encounterist a dark block with his arms folded. Each door frame is built from the letters of its definition, in the series' signature shot: the Edifier types the sentence, and the letters fly to the bay and become bricks, so that each lintel reads the start of its sentence and each door carries its whole definition on a brass plate. The one accent colour, brick red, is kept for the plates and for what is wrong: the missing hinges, drawn where they should be, and the sign behind the Conventionalist's grille.</p>
<p>The sound keeps the series' palette: typewriter keys for description, a dry wooden knock for each letter that becomes a brick, the Edifier's hum, footsteps, a latch. This film adds the chairman's hand bell, a hall clock that is always ticking and is only heard in the silences, and a small brass flourish when a door is finished. The passage gets two notes of it, and the encounter gets none. The voices are Kokoro voices, one for each delegate, with the series' narrator and the series' Edifier. The timing file <code>cd.json</code> drives picture and sound together. The picture code in <code>cd.js</code> reads it, and <code>build_sound.py</code> makes all the sound with numpy and scipy.</p>
<h2>FOR THE BENCH</h2>
<p>Write one interface, <code>Door</code>, with one method, <code>pass(person)</code>, which returns a sentence saying what happens. Then write four classes that implement it, one for each definition in the film. <code>ObjectDoor</code> is admired and never opens. <code>PassageDoor</code> always lets the person through and returns them to the room they were in. <code>ConventionDoor</code> checks a field on the person, such as <code>person.expected</code>, and admits or refuses. <code>EncounterDoor</code> does not exist until <code>pass</code> is called, and then exists, closed. Make one delegate, for example <code>{{name: 'the chairman', expected: false, room: 'the hall'}}</code>, run the same delegate through all four doors, and print what happens. All four classes satisfy the interface. Which of them is a door? Now write a fifth class, <code>PlainDoor</code>, that the cleaner uses. What do you have to say in it that none of the four definitions said?</p>
<p class="src">An original fable from Watson Hartsoe's notes <i>The House That Language Built</i>, written in the manner of Stanis&lstrok;aw Lem. Film two of <i>The House That Language Built</i>, four fables of Edifiction. <a href="congress-of-doors.mp4" download>Download the film</a>.</p>
</section>
<section class="script"><h2>THE SCRIPT</h2>{''.join(script)}</section>'''
out = shell
out = re.sub(r'<title>.*?</title>', '<title>The Great International Congress of Doors &middot; Lab 7</title>', out, count=1, flags=re.S)
out = re.sub(r'<header>.*?</header>', '<header><a href="../index.html">LAB 7</a><a href="../lineage/index.html">ALL FILMS</a></header>', out, count=1, flags=re.S)
out = re.sub(r'<h1>.*?</h1>', '<h1>The Great International Congress of Doors</h1>', out, count=1, flags=re.S)
out = re.sub(r'<p class="sub">.*?</p>', '<p class="sub">four definitions, and no way out</p>', out, count=1, flags=re.S)
out = out.replace('good-shellacking.jpg', 'congress-of-doors.jpg').replace('good-shellacking.mp4', 'congress-of-doors.mp4')
out = re.sub(r'<div class="cols">.*?</main>', '<div class="cols">\n' + note.replace('\\', '\\\\') + '\n</div>\n</main>', out, count=1, flags=re.S)
open(os.path.join(R, 'index.html'), 'w', encoding='utf-8').write(out)
print('ok', n, 'fulcrum lines')
