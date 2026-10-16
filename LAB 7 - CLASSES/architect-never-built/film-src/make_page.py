# Builds ../index.html from the Good Shellacking page shell and timing/an.json.
import json, os, re, html
H = os.path.dirname(os.path.abspath(__file__)); R = os.path.dirname(H)
T = json.load(open(os.path.join(H, 'timing', 'an.json')))
shell = open(os.path.join(R, '..', 'good-shellacking', 'index.html'), encoding='utf-8').read()
esc = lambda s: html.escape(s, quote=False).replace('’', '&rsquo;').replace('…', '&hellip;')
cast = T['cast']; nm = lambda w: cast.get(w, {}).get('name', w)
TITLES = {'office': 'THE INSTITUTE', 'collapse': 'NUMBER FORTY, QUIET STREET', 'annex': 'THE ANNEXES', 'window': 'THE WINDOW', 'factory': 'THE BUILDERS', 'strike': 'THE STRIKE', 'wall': 'THE WALL'}
BUILT = {'office': ('The Edifier builds', T['sent']['library']), 'annex': ('The Edifier builds', T['sent']['annex']), 'factory': ('The Edifier builds', T['sent']['builder'])}
lines, script = [], []
for sh in T['shots']:
    if not sh.get('lines'): continue
    if TITLES.get(sh['shot']): script.append(f"<h3>{TITLES[sh['shot']]}</h3>")
    built_done = False
    for i, l in enumerate(sh['lines']):
        say = l.get('show') or l['say']
        cls = ' class=fulcrum' if l.get('line') else ''
        script.append(f"<p{cls}><b>{esc(nm(l['who']))}.</b> {esc(say)}</p>")
        if l.get('line'): lines.append(f"<li><span>{esc(nm(l['who']))}</span>{esc(say)}</li>")
        b = BUILT.get(sh['shot'])
        if b and not built_done and ((sh['shot'] == 'office' and i == 2) or (sh['shot'] == 'annex' and i == 0) or (sh['shot'] == 'factory' and i == 3)):
            script.append(f"<p class=out>{esc(b[0])}: &ldquo;{esc(b[1])}&rdquo;</p>"); built_done = True
n = len(lines); words = {5: 'FIVE', 6: 'SIX', 7: 'SEVEN', 8: 'EIGHT'}.get(n, str(n))
note = f'''<section class="note">
<h2>{words} LINES</h2>
<ol class="lines">{''.join(lines)}</ol>
<h2>HOW IT IS MADE</h2>
<p>This is the third of four fables of Edifiction, the discipline that grew up around a machine called the Edifier, which builds whatever it is told in a sentence. Professor Mortimer Klause, Director of the Institute of Operative Description, has signed seven million sentences and has never been inside a building. One of them, a quiet library, sits down one Tuesday. Everything its sentence asked for had been built; the sentence had not asked for it to stand. The Edifier offers to explain, and its explanation is another building, whose footnote is another, smaller building, until the Professor is living in the annex of footnote 4,112. Meanwhile the Institute's windows have stopped opening themselves, a builder opens one without explaining it, and the faculty rule the act inadmissible. The Professor's answer is a machine that makes builders, and the builders ask for tools, wages, lunch and the weather. They strike. He borrows a trowel.</p>
<p>The device is what a sentence asks for and what it leaves out. Every described house in the film is drawn out of its own sentence: when the Edifier builds, the sentence is typed across the sky over an empty plot, its words fall to the ground, and the letters fly into place as the first courses of the walls, which go on rising in rows of the same sentence until the outline, roof and windows are inked over them. Each house keeps its sentence on a brass plate, in the one red of the series. When the library collapses it falls back into loose letters, and where its foundation should be there is a red dashed outline of nothing. The explanatory annexes are built the same way, each one smaller, and their walls are papered with the text of the footnote they explain; the camera fits each room to its ceiling, so the Professor seems to grow as the rooms shrink. The manufactured builders are made of the same letters as everything else, and they are all one voice. The last wall is the only thing in the film made of bricks rather than letters, and its plate stays blank.</p>
<p>The sound keeps the series palette: typewriter keys for description, a dry wooden knock for each wall the Edifier raises, a low hum whenever the Edifier is near, footsteps, a door latch. Each annex has a shorter reverberation than the one before. The shut hall has a fly, a clock and paper fans until the sash goes up and the outside comes in. The strike is rain, and under the last scene of it eSpeak reads the Edifier's endless description of a house that will need no keeping. The wall is a trowel and one knock per real brick, sixty-three of them plus the eighteen laid twice, with birds and then crickets as the sun goes down. Where a scene has the one line that matters, the camera goes in close and the delivery slows.</p>
<p>The timing file <code>an.json</code> drives picture and sound together. It holds the start time of every spoken line and every cue, down to each brick. The picture code in <code>an.js</code> reads those times, and <code>build_sound.py</code> makes all the non-voice sound with numpy and scipy.</p>
<h2>FOR THE BENCH</h2>
<p>Peter Naur argued in <i>Programming as Theory Building</i> (1985) that a program's real substance is the theory its makers hold in their heads, and that the text alone does not carry it. Test that on yourself. Take a short program you did not write, fifty to a hundred lines, something that runs: a p5.js sketch from a classmate, an example from a library, a function from an old project of someone else's. Change one requirement (the ball must now bounce off a moving wall; the list must keep its order; the score must survive a reload) and make the change work. Then, before you look back at the code, write down everything you had to understand before the change would work: what each part was for, which values could not be touched, what the original author assumed and never wrote down. Now compare your list with the program text. Which items on your list can you point to in the text, and which are not there at all? The second column is what the Professor learned laying his wall.</p>
<p class="src">An original fable from Watson Hartsoe's notes <i>The House That Language Built</i>, written in the manner of Stanis&lstrok;aw Lem. Film three of four. <a href="architect-never-built.mp4" download>Download the film</a>.</p>
</section>
<section class="script"><h2>THE SCRIPT</h2>{''.join(script)}</section>'''
out = shell
out = re.sub(r'<title>.*?</title>', '<title>The Architect Who Never Built Anything &middot; Lab 7</title>', out, count=1, flags=re.S)
out = re.sub(r'<header>.*?</header>', '<header><a href="../index.html">LAB 7</a><a href="../lineage/index.html">ALL FILMS</a></header>', out, count=1, flags=re.S)
out = re.sub(r'<h1>.*?</h1>', '<h1>The Architect Who Never Built Anything</h1>', out, count=1, flags=re.S)
out = re.sub(r'<p class="sub">.*?</p>', '<p class="sub">seven million houses, and one wall</p>', out, count=1, flags=re.S)
out = out.replace('good-shellacking.jpg', 'architect-never-built.jpg').replace('good-shellacking.mp4', 'architect-never-built.mp4')
out = re.sub(r'<div class="cols">.*?</main>', '<div class="cols">\n' + note.replace('\\', '\\\\') + '\n</div>\n</main>', out, count=1, flags=re.S)
open(os.path.join(R, 'index.html'), 'w', encoding='utf-8').write(out)
print('ok', n, 'fulcrum lines')
