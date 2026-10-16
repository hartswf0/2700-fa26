# Builds ../index.html from the Gargantius page shell and timing/tm.json.
import json, os, re, html
H = os.path.dirname(os.path.abspath(__file__)); R = os.path.dirname(H)
T = json.load(open(os.path.join(H, 'timing', 'tm.json')))
shell = open(os.path.join(R, '..', 'gargantius', 'index.html'), encoding='utf-8').read()
esc = lambda s: html.escape(s, quote=False).replace('’', '&rsquo;')
cast = T['cast']; nm = lambda w: 'Narrator' if w == 'N' else cast.get(w, {}).get('name', w)
TITLES = {'title': None, 'test': 'THE TEST', 'repair': 'THE REPAIRS', 'expert': 'THE EXPERT', 'count': 'THE COUNT',
          'chase': 'THE CHASE', 'town': 'THE TOWN', 'cave': 'THE CAVE', 'four': 'FOUR', 'wreck': 'THE WRECK', 'end': None}
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
<p>The device is a test: an expected value set beside an actual value. Trurl chalks the expected answer on a slate at the machine&rsquo;s feet, <code>2 + 2 = 4</code>. The machine gives its actual answer in its own numerals, by lighting the windows of its eight floors in the shape of a digit. The chalk and the lit 7 side by side is the picture the film keeps returning to. After every repair the same pair comes back, and they never agree. When Klapaucius tries other sums the windows light a 6 and a 0, still wrong, still certain.</p>
<p>The machine is not broken in a way that makes it stop. It counts the kicks it receives in the same lit numerals, four, five, six, eight, and skips the seven it claims for two and two. Then it pulls itself out of its foundations and walks. It chases the two constructors across sand and hard ground into a town, where houses fold and people run and no one is hurt, and the mayor tells Trurl to leave. In a cave in the cliffs it seals them in behind a riveted steel wall. Trurl says seven once, then shouts four, and keeps shouting it while the machine throws itself at the rock until a boulder breaks it in half. Its last word, faint, is still seven.</p>
<p>The sound follows the same plan. Before every answer the machine makes the same racket of thinking, the same length each time, and every answer is delivered the same way. Outside the cave its voice is muffled through steel; at the end it is almost nothing. Where a scene has the one line that matters, the camera goes in close and the delivery slows; the other lines stay wide and quick.</p>
<p>The timing file <code>tm.json</code> drives picture and sound together. It holds the start time of every spoken line and every cue. The picture code reads those times, and <code>build_sound.py</code> makes all the non-voice sound with numpy and scipy. The voices are Kokoro, a different one for each character.</p>
<h2>AFTER THE OTHER FILMS</h2>
<p><a href="../femfatalatron/index.html">The Femfatalatron</a> measures the wrong variable: every gauge climbs and the prince does not change. This film has the right measurement and a program that will not accept it. <a href="../trurls-prescription/index.html">Trurl&rsquo;s Prescription</a> is about an object that keeps what it has accepted. Here the machine has accepted seven, and nothing that happens to it afterward changes that.</p>
<h2>FOR THE BENCH</h2>
<p>Write an object with a method <code>add(a, b)</code> that returns <code>7</code> when it is given <code>2</code> and <code>2</code>. Then write a test: a function <code>check(expected, actual, label)</code> that compares the two and draws the label green if they match and red if they do not. Call <code>check(4, machine.add(2, 2), '2 + 2')</code> and watch it fail. Add more cases, <code>1 + 2</code> and <code>1 + 1</code>, and draw them as a row of results. Now &ldquo;repair&rdquo; the method in some way that does not fix it, and run the tests again. What does the test know that the method does not? What would have to change for the machine to agree with the slate, and who gets to decide which one is right?</p>
<p class="src">Narration and dialogue paraphrase Stanis&lstrok;aw Lem, &ldquo;Trurl&rsquo;s Machine,&rdquo; <i>The Cyberiad</i>. The scene titles are reworded or invented. <a href="trurls-machine.mp4" download>Download the film</a>.</p>
</section>
<section class="script"><h2>THE SCRIPT</h2>{''.join(script)}</section>'''
out = shell
out = re.sub(r'<title>.*?</title>', '<title>Trurl&rsquo;s Machine &middot; Lab 7</title>', out, 1, re.S)
out = re.sub(r'<h1>.*?</h1>', '<h1>Trurl&rsquo;s Machine</h1>', out, 1, re.S)
out = re.sub(r'<p class="sub">.*?</p>', '<p class="sub">a machine that is sure, and wrong</p>', out, 1, re.S)
out = out.replace('gargantius.jpg', 'trurls-machine.jpg').replace('gargantius.mp4', 'trurls-machine.mp4')
out = re.sub(r'<div class="cols">.*?</main>', '<div class="cols">\n' + note.replace('\\', '\\\\') + '\n</div>\n</main>', out, 1, re.S)
open(os.path.join(R, 'index.html'), 'w', encoding='utf-8').write(out)
print('ok', n, 'fulcrum lines')
