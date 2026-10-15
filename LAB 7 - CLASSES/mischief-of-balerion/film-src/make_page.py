# Builds ../index.html from the Gargantius page shell and timing/mb.json.
import json, os, re, html
H = os.path.dirname(os.path.abspath(__file__)); R = os.path.dirname(H)
T = json.load(open(os.path.join(H, 'timing', 'mb.json')))
shell = open(os.path.join(R, '..', 'gargantius', 'index.html'), encoding='utf-8').read()
esc = lambda s: html.escape(s, quote=False).replace('’', '&rsquo;')
cast = T['cast']; nm = lambda w: 'Narrator' if w == 'N' else cast.get(w, {}).get('name', w)
TITLES = {'title': None, 'court': 'THE COURT', 'prize': 'THE PRIZE', 'swap': 'THE FIRST SWAP', 'locked': 'LOCKED UP', 'street': 'THE STREET',
          'steps': 'THE HARBOR STEPS', 'quay': 'THE QUAY', 'station': 'THE POLICE STATION', 'trick': 'THE TRICK', 'restore': 'SETTING IT RIGHT',
          'clock': 'THE CLOCK', 'hiding': 'THE BEST HIDING PLACE', 'end': None}
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
<p>The device is a split between a body and a mind. Each body is an ink figure with its own costume: the king in a purple robe and a crown, Trurl with his bag, Klapaucius in a long grey robe, the sailor in stripes, the Commissioner in a tall hat, and at the end a cuckoo clock. Each mind is a mark drawn over the head, a small emblem inside a hatched halo: a die for the king, a gear for Trurl, a star for Klapaucius, an anchor for the sailor, a badge for the Commissioner, a bird for the clock. There are no captions. When the horns strike, the two marks fly across the gap and land on each other&rsquo;s heads, and the voices go with them. The picture keeps the body, and the voice keeps the mind. The first swap comes in the middle of one of Trurl&rsquo;s sentences, so his voice goes on coming out of the king.</p>
<p>The horns are tracked the whole way through. They are drawn on a desk, in a bag, on a head, or held up beside it, and the king&rsquo;s rule is to grab them after every swap, so the grab is always shown. Where a scene needs the one line that matters, the camera goes in close on the speaker and the delivery slows down. The other lines stay wide and quick.</p>
<p>The sound follows the same split. Each mind has its own voice and its own small filter: the king is high and thin, the Commissioner rough, the clock&rsquo;s mind flat with a buzz. Every swap makes the same short two-note exchange, the first note moving from left to right and the answer from right to left. While the horns are in somebody&rsquo;s hands there is a heavy low hum that carries across the cuts. Hide-and-seek is counting and footsteps. From the clock scene on, a ticking runs underneath, and in the last shot it speeds up and turns into the cuckoo.</p>
<p>The timing file <code>mb.json</code> drives picture and sound together. It holds the start time of every spoken line, every cue, and which mind is in which body at the start of each scene. The picture code reads those times, and <code>build_sound.py</code> makes all the non-voice sound with numpy and scipy. The voices are Kokoro.</p>
<h2>AFTER THE OTHER FILMS</h2>
<p><a href="../gargantius/index.html">The Trap of Gargantius</a> joins many soldiers into one by giving each of them a reference to the next. This film asks what happens when a mind is moved instead of linked. <a href="../trurls-prescription/index.html">Trurl&rsquo;s Prescription</a> is about an object that keeps what it has accepted. Here the king is an object that keeps being handed to someone else, and the whole plot is about who ends up holding what.</p>
<h2>FOR THE BENCH</h2>
<p>Write a <code>Body</code> with a <code>mind</code> field, and a <code>Mind</code> with a name and a voice. Write <code>swap(a, b)</code> two ways. In the first, set <code>a.mind = b.mind</code> and then <code>b.mind = a.mind</code>, and look at what the two bodies hold afterward. In the second, keep the first mind in a temporary variable. Then write a version that copies the mind instead of referencing it, and ask how many Balerions exist after one swap. The horns are a third object: who holds a reference to them after a swap, and why does the king grab them every time? What would the code look like if the horns could be copied?</p>
<p class="src">Narration and dialogue paraphrase Stanis&lstrok;aw Lem, &ldquo;The Fifth Sally, or The Mischief of King Balerion,&rdquo; <i>The Cyberiad</i>. The riddles, the password and the clock lines are reworded. <a href="mischief-of-balerion.mp4" download>Download the film</a>.</p>
</section>
<section class="script"><h2>THE SCRIPT</h2>{''.join(script)}</section>'''
out = shell
out = re.sub(r'<title>.*?</title>', '<title>The Fifth Sally, or The Mischief of King Balerion &middot; Lab 7</title>', out, 1, re.S)
out = re.sub(r'<h1>.*?</h1>', '<h1>The Fifth Sally, or The Mischief of King Balerion</h1>', out, 1, re.S)
out = re.sub(r'<p class="sub">.*?</p>', '<p class="sub">a mind that moves, and a rule it has to keep</p>', out, 1, re.S)
out = out.replace('gargantius.jpg', 'mischief-of-balerion.jpg').replace('gargantius.mp4', 'mischief-of-balerion.mp4')
out = re.sub(r'<div class="cols">.*?</main>', '<div class="cols">\n' + note.replace('\\', '\\\\') + '\n</div>\n</main>', out, 1, re.S)
open(os.path.join(R, 'index.html'), 'w', encoding='utf-8').write(out)
print('ok', n, 'fulcrum lines')
