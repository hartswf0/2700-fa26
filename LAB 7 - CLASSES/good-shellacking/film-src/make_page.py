# Builds ../index.html from the Gargantius page shell and timing/gs.json.
import json, os, re, html
H = os.path.dirname(os.path.abspath(__file__)); R = os.path.dirname(H)
T = json.load(open(os.path.join(H, 'timing', 'gs.json')))
shell = open(os.path.join(R, '..', 'gargantius', 'index.html'), encoding='utf-8').read()
esc = lambda s: html.escape(s, quote=False).replace('’', '&rsquo;')
cast = T['cast']; nm = lambda w: 'Narrator' if w == 'N' else cast.get(w, {}).get('name', w)
TITLES = {'title': None, 'gift': 'THE GIFT', 'copy': 'THE COPY', 'cellar': 'THE CELLAR', 'claim': 'THE CLAIM', 'proof': 'THE PROOF', 'morning': 'THE MORNING', 'bolts': 'THE BOLTS', 'medal': 'THE MEDAL', 'end': None}
lines, script = [], []
for sh in T['shots']:
    if not sh.get('lines'): continue
    if TITLES.get(sh['shot']): script.append(f"<h3>{TITLES[sh['shot']]}</h3>")
    for l in sh['lines']:
        cls = ' class=fulcrum' if l.get('line') else ''
        script.append(f"<p{cls}><b>{esc(nm(l['who']))}.</b> {esc(l['say'])}</p>")
        if l.get('line'): lines.append(f"<li><span>{esc(nm(l['who']))}</span>{esc(l['say'])}</li>")
n = len(lines); words = {6: 'SIX', 7: 'SEVEN', 8: 'EIGHT', 9: 'NINE'}.get(n, str(n))
note = f'''<section class="note">
<h2>{words} LINES</h2>
<ol class="lines">{''.join(lines)}</ol>
<h2>HOW IT IS MADE</h2>
<p>The device is equality against identity. Two things can be equal in every field you can check and still be two things, or they can be one thing seen twice, and checking the fields will not tell you which. Klapaucius asks the wish machine for a Trurl so like the real one that nobody could tell them apart. The machine delivers, and from then on the story has two Trurls and no test that separates them. The Trurl in the cellar says he is the real one. The Trurl at home says the one in the cellar was a copy, and points at a few nuts and bolts on his floor.</p>
<p>The film keeps that question open on purpose. Every Trurl on screen is drawn by one function with one fixed set of ids, so the Trurl who climbs out of the belly door and the Trurl who opens his door the next morning are the same drawing, down to the wobble in the ink. Both speak with the same Kokoro voice at the same speed. The picture has no way to mark one of them as the copy, and it does not try. What each Trurl says is the only evidence, and Klapaucius believes whichever version lets him keep hitting.</p>
<p>The workshop has a grandfather clock that ticks through every scene there, and the wish machine hands out blue paint, sandpaper, a brace and bit, white paint and one number five screw from a door in its belly, each with a small chime that climbs a step higher than the last. The cellar is dark except for one hanging lamp that swings on its hook, and it is a hard, long room in the sound: every clang of the crowbar and the club rings and comes back. The beating is metal slapstick, clangs and dents and a head that booms like a drum, and the next morning the dents have been hammered flat and painted over. At the end the King's fanfare sags flat on its last chord, Klapaucius pulls down his blinds, and the canvas comes off his own machine: a wish machine, painted blue, not finished. Where a scene has the one line that matters, the camera goes in close and the delivery slows; the other lines stay wide and quick.</p>
<p>The timing file <code>gs.json</code> drives picture and sound together. It holds the start time of every spoken line and every cue. The picture code reads those times, and <code>build_sound.py</code> makes all the non-voice sound with numpy and scipy.</p>
<h2>FOR THE BENCH</h2>
<p>Make two objects, <code>a</code> and <code>b</code>, with the same fields: <code>name: 'Trurl'</code>, <code>dents: 0</code>. Check <code>a.name === b.name</code>, then <code>a === b</code>. Now write <code>copyOf(t)</code> that returns a new object with the same fields, and <code>hit(t)</code> that adds one to <code>t.dents</code>. Hit the copy three times. Did the original change? Then try it with <code>const b = a</code> instead of a copy. Which test would Klapaucius need to run to know which Trurl was in his cellar, and is there any field you could add that a perfect copy would not also have?</p>
<p class="src">Narration and dialogue paraphrase Stanis&lstrok;aw Lem, &ldquo;A Good Shellacking,&rdquo; <i>The Cyberiad</i>. Nothing is quoted. <a href="good-shellacking.mp4" download>Download the film</a>.</p>
</section>
<section class="script"><h2>THE SCRIPT</h2>{''.join(script)}</section>'''
out = shell
out = re.sub(r'<title>.*?</title>', '<title>A Good Shellacking &middot; Lab 7</title>', out, 1, re.S)
out = re.sub(r'<h1>.*?</h1>', '<h1>A Good Shellacking</h1>', out, 1, re.S)
out = re.sub(r'<p class="sub">.*?</p>', '<p class="sub">two Trurls, and no way to tell which is which</p>', out, 1, re.S)
out = out.replace('gargantius.jpg', 'good-shellacking.jpg').replace('gargantius.mp4', 'good-shellacking.mp4')
out = re.sub(r'<div class="cols">.*?</main>', '<div class="cols">\n' + note.replace('\\', '\\\\') + '\n</div>\n</main>', out, 1, re.S)
open(os.path.join(R, 'index.html'), 'w', encoding='utf-8').write(out)
print('ok', n, 'fulcrum lines')
