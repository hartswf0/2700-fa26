# Builds ../index.html from the Gargantius page shell and timing/kk.json.
import json, os, re, html
H = os.path.dirname(os.path.abspath(__file__)); R = os.path.dirname(H)
T = json.load(open(os.path.join(H, 'timing', 'kk.json')))
shell = open(os.path.join(R, '..', 'gargantius', 'index.html'), encoding='utf-8').read()
esc = lambda s: html.escape(s, quote=False).replace('’', '&rsquo;')
cast = T['cast']; nm = lambda w: 'Narrator' if w == 'N' else cast.get(w, {}).get('name', w)
TITLES = {'title': None, 'offer': 'THE OFFER', 'terms': 'THE TERMS', 'work': 'THE WORK', 'veranda': 'THE VERANDA', 'paper': 'ON PAPER', 'shop': 'THE REQUISITIONS', 'hunt': 'THE HUNT', 'sentence': 'THE SENTENCE', 'ransom': 'THE RANSOM', 'rhyme': 'THE RHYME', 'end': None}
lines, script = [], []
for sh in T['shots']:
    if not sh.get('lines'): continue
    if TITLES.get(sh['shot']): script.append(f"<h3>{TITLES[sh['shot']]}</h3>")
    for l in sh['lines']:
        cls = ' class=fulcrum' if l.get('line') else ''
        script.append(f"<p{cls}><b>{esc(nm(l['who']))}.</b> {esc(l['say'])}</p>")
        if l.get('line'): lines.append(f"<li><span>{esc(nm(l['who']))}</span>{esc(l['say'])}</li>")
n = len(lines); words = {6: 'SIX', 7: 'SEVEN', 8: 'EIGHT', 9: 'NINE', 10: 'TEN'}.get(n, str(n))
note = f'''<section class="note">
<h2>{words} LINES</h2>
<ol class="lines">{''.join(lines)}</ol>
<h2>HOW IT IS MADE</h2>
<p>The device is distributed control. King Krool has won every hunt the same way: he finds the part of the beast that does the thinking and smashes it. Trurl and Klapaucius cannot hide a brain anywhere he will not reach, so they build a beast with no brain to find. Every part of it does the thinking. Cut off its head and it grows another; cut it in two and there are two beasts; chop it into pieces and the pieces gather into one again.</p>
<p>The picture follows that rule. The beast is never drawn as one creature with organs. It is a few hundred short, weedy marks, each with its own fixed position in a list, and every shape the beast takes is a formation those same marks move into: a long low hill of dry grass, a hill with a head, two hills and a head running between them, a scatter of clumps, a sandstorm, three policemen, and at the end a heap of ash. No mark is special. Before they build it, the constructors test it on paper, and the film shows that test as a fight across a page of equations: the beast hides under a radical sign, slips around an asymptote and comes back bigger, while the pencils snap.</p>
<p>The second half of the idea is that a program keeps the authority it was given. The constructors wrote a police force into the beast, because nobody resists an arrest, and a postmaster, because nobody stops the mail. Both run exactly as written. Then the beast is called back by a radio in Klapaucius&rsquo;s tooth, and it refuses to hand the King over, in a perfectly ordinary voice, and starts listing demands of its own. Trurl stops it with a second tooth and a counting rhyme.</p>
<p>In the sound, Krool paces the whole skull hall and every step is one boot on a silver floor, the same step clock the picture uses. The beast is a swarm of small clicks that rises when it splits and settles when it rejoins. The sealed wagon rings by itself after a counted fourteen and a half seconds. Where a scene has the one line that matters, the camera goes in close and the delivery slows; the other lines stay wide and quick.</p>
<p>The timing file <code>kk.json</code> drives picture and sound together. It holds the start time of every spoken line and every cue. The picture code reads those times, and <code>build_sound.py</code> makes all the non-voice sound with numpy and scipy.</p>
<h2>FOR THE BENCH</h2>
<p>Make an array of 300 particles, each with a home position on a hill shape. Draw every particle as a short stroke. Now write <code>cut(x)</code> that sends every particle left of <code>x</code> to a second hill, and <code>gather()</code> that sends them all back home. Delete any one particle, or any fifty. Does the beast still work? Then give each particle the same small rule, move toward the average of your neighbours, and ask where in your code the beast&rsquo;s brain is.</p>
<p class="src">Narration and dialogue paraphrase Stanis&lstrok;aw Lem, &ldquo;The Second Sally, or The Offer of King Krool,&rdquo; <i>The Cyberiad</i>. Nothing is quoted. <a href="offer-of-krool.mp4" download>Download the film</a>.</p>
</section>
<section class="script"><h2>THE SCRIPT</h2>{''.join(script)}</section>'''
out = shell
out = re.sub(r'<title>.*?</title>', '<title>The Offer of King Krool &middot; Lab 7</title>', out, 1, re.S)
out = re.sub(r'<h1>.*?</h1>', '<h1>The Second Sally, or The Offer of King Krool</h1>', out, 1, re.S)
out = re.sub(r'<p class="sub">.*?</p>', '<p class="sub">a beast that is all brain, and a king who cannot catch it</p>', out, 1, re.S)
out = out.replace('gargantius.jpg', 'offer-of-krool.jpg').replace('gargantius.mp4', 'offer-of-krool.mp4')
out = re.sub(r'<div class="cols">.*?</main>', '<div class="cols">\n' + note.replace('\\', '\\\\') + '\n</div>\n</main>', out, 1, re.S)
open(os.path.join(R, 'index.html'), 'w', encoding='utf-8').write(out)
print('ok', n, 'fulcrum lines')
