# Builds ../index.html from the Gargantius page shell and timing/ff.json.
import json, os, re, html
H = os.path.dirname(os.path.abspath(__file__)); R = os.path.dirname(H)
T = json.load(open(os.path.join(H, 'timing', 'ff.json')))
shell = open(os.path.join(R, '..', 'gargantius', 'index.html'), encoding='utf-8').read()
esc = lambda s: html.escape(s, quote=False).replace('’', '&rsquo;')
cast = T['cast']; nm = lambda w: 'Narrator' if w == 'N' else cast.get(w, {}).get('name', w)
TITLES = {'title': None, 'knock': 'THE KNOCK', 'titles': 'THE TITLES', 'temple': 'THE TEMPLE', 'run': 'THE FIRST RUN', 'again': 'HEAVIER',
          'audience': 'THE AUDIENCE', 'lab': 'THE FOUNDRY AND THE LABORATORY', 'bombard': 'THE BOMBARDMENT', 'wedding': 'TAKEN APART, AND THE WEDDING', 'end': None}
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
<p>The device is measurement, and measuring the wrong thing. The femfatalatron is drawn as a temple full of cables, screens, rose petals and perfume, and in front of it stands a glass case of dials: power in megamors, efficiency in percent, and the rapturometer, a tube of mercury. Three knobs sit underneath, an ardor damper, a sigh condenser and a swoon regulator. In the first half of the film the dials are the main picture. Trurl turns every knob up, every needle climbs and presses against its stop, and the prince comes out exactly as he went in. He says one word, the camera goes to its tightest shot on his face, and then the rapturometer is pressed to his forehead and bursts. The second machine is iron and heavier, and it fails the same way.</p>
<p>The input was turned all the way up and the output did not move, because the thing that needed to change was not inside the prince. So Trurl changes the situation instead. In the second half the same kind of dial hangs on the Emperor&rsquo;s wall as an economy gauge. As babies land and crawl in, it sinks from boom to bust, and when it reaches the bottom the Emperor signs. The babies arrive as soft bundles on small parachutes. They land gently, crawl, and multiply, and nobody is hurt. There are no captions; the only writing on screen is printed on the dials, the way it would be on a real machine.</p>
<p>The sound follows the same plan. The machine has a hum that rises with the needles and a chatter that turns into a rattle when they reach their stops, and the first run ends in breaking glass. The second machine is lower and rougher and ends the same way. The second half is soft: cauldrons, coos from behind a door, cushioned cannon thumps, and a chorus of babble that grows with the count on the gauge. At the end Trurl takes the machine apart, and the hum winds down to nothing. Where a scene has the one line that matters, the camera goes in close and the delivery slows; the other lines stay wide and quick.</p>
<p>The timing file <code>ff.json</code> drives picture and sound together. It holds the start time of every spoken line and every cue. The picture code reads those times, and <code>build_sound.py</code> makes all the non-voice sound with numpy and scipy. The voices are Kokoro, a different one for each character.</p>
<h2>AFTER THE OTHER FILMS</h2>
<p><a href="../trurls-prescription/index.html">Trurl&rsquo;s Prescription</a> is about a thing that cannot be pushed and can only be processed. This film turns that around: the machine pushes as hard as it can, and the gauges prove how hard, but the reading is about the push, not about the prince. <a href="../mischief-of-balerion/index.html">The Mischief of King Balerion</a> moves a mind from body to body. Here nothing in the prince moves at all, and what moves is the world around him.</p>
<h2>FOR THE BENCH</h2>
<p>Write an object with three numbers, <code>power</code>, <code>efficiency</code> and <code>rapture</code>, and draw each one as a needle on a dial. Add a <code>love</code> field that none of the dials read. Write <code>turnUp()</code> so that it raises every dial to its maximum, and check whether <code>love</code> changed. Then write a second object, a kingdom with an <code>economy</code> number and a list of babies; each frame, add babies and lower the economy by the length of the list. Which variable does the plot actually depend on, and which function is the only one that can reach it? What would a dial for <code>love</code> have to be connected to?</p>
<p class="src">Narration and dialogue paraphrase Stanis&lstrok;aw Lem, &ldquo;The Fourth Sally, or How Trurl Built a Femfatalatron to Save Prince Pantagoon from the Pangs of Love, and How Later He Resorted to a Cannonade of Babies,&rdquo; <i>The Cyberiad</i>. The titles, the part names and the countdown are reworded or invented. <a href="femfatalatron.mp4" download>Download the film</a>.</p>
</section>
<section class="script"><h2>THE SCRIPT</h2>{''.join(script)}</section>'''
out = shell
out = re.sub(r'<title>.*?</title>', '<title>The Fourth Sally, or How Trurl Built a Femfatalatron &middot; Lab 7</title>', out, 1, re.S)
out = re.sub(r'<h1>.*?</h1>', '<h1>The Fourth Sally, or How Trurl Built a Femfatalatron</h1>', out, 1, re.S)
out = re.sub(r'<p class="sub">.*?</p>', '<p class="sub">a machine turned all the way up, and a war fought with babies</p>', out, 1, re.S)
out = out.replace('gargantius.jpg', 'femfatalatron.jpg').replace('gargantius.mp4', 'femfatalatron.mp4')
out = re.sub(r'<div class="cols">.*?</main>', '<div class="cols">\n' + note.replace('\\', '\\\\') + '\n</div>\n</main>', out, 1, re.S)
open(os.path.join(R, 'index.html'), 'w', encoding='utf-8').write(out)
print('ok', n, 'fulcrum lines')
