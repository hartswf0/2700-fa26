# Builds ../index.html from the Good Shellacking page shell and timing/bl.json.
import json, os, re, html
H = os.path.dirname(os.path.abspath(__file__)); R = os.path.dirname(H)
T = json.load(open(os.path.join(H, 'timing', 'bl.json')))
shell = open(os.path.join(R, '..', 'good-shellacking', 'index.html'), encoding='utf-8').read()
esc = lambda s: html.escape(s, quote=False).replace('’', '&rsquo;')
cast = T['cast']; nm = lambda w: cast.get(w, {}).get('name', w)
TITLES = {'intro': 'INTRODUCTION', 'imitate': 'VOLUME ONE', 'drift': 'VOLUME TWO', 'noreader': 'VOLUME THREE', 'summary': 'VOLUME FOUR', 'history': 'VOLUME FIVE'}
lines, script = [], []
for sh in T['shots']:
    if not sh.get('lines'): continue
    if TITLES.get(sh['shot']): script.append(f"<h3>{TITLES[sh['shot']]}</h3>")
    for l in sh['lines']:
        say = l.get('show') or l['say']
        cls = ' class=fulcrum' if l.get('line') else ''
        script.append(f"<p{cls}><b>{esc(nm(l['who']))}.</b> {esc(say)}</p>")
        if l.get('line'): lines.append(f"<li><span>{esc(nm(l['who']))}</span>{esc(say)}</li>")
n = len(lines); words = {5: 'FIVE', 6: 'SIX', 7: 'SEVEN'}.get(n, str(n))
note = f'''<section class="note">
<h2>{words} LINES</h2>
<ol class="lines">{''.join(lines)}</ol>
<h2>HOW IT IS MADE</h2>
<p>Stanis&lstrok;aw Lem wrote the introduction to a history that does not exist: a five-volume history of literature written by machines, which he called bitic, after the bit. This film takes only that premise. No source text was used, and none of Lem's passages, titles or examples are reproduced. The scholar's introduction, the novel page in Volume One, and every other line were written new for this film.</p>
<p>The device is one question asked of each volume: who can read it? Five bound volumes stand on a shelf, and each scene takes one down and opens it to a single page. In Volume One the page is an ordinary page of a novel, typed in line by line, and a reader at a desk underlines it in pencil. In Volume Two the same kind of page drifts: lines repeat the line above with one word changed, words turn into grey bars, and the right edge of the text settles into a wave. In Volume Three the page fills with marks a person cannot read, and the reader at the desk is drawn smaller each time the page turns, until the desk is far taller than he is. In Volume Four a small reading machine stands on the desk between the page and the reader, scans the page, and hands him one line on a slip of paper. In Volume Five the page is the introduction itself, written by the scholar's hand as you hear it, while machine marks fill the space below the last handwritten line. The reader's chair is empty.</p>
<p>The sound follows the same line. A typewriter in Volume One gets faster and more regular in Volume Two and turns into a fixed sixteen-step data rhythm in Volume Three, which stays to the end. The reader breathes and uses a pencil; his breathing gets quieter as he gets smaller. The reading machine chimes each time it hands over a slip. The Machines are three Kokoro voices reading together, sample-and-held and reduced to a few bits, and under Volume Three eSpeak reads strings of numbers too fast to follow. At the end only the data rhythm and one page turn are left. Where a scene has the one line that matters, the camera goes in close and the delivery slows.</p>
<p>The timing file <code>bl.json</code> drives picture and sound together. It holds the start time of every spoken line and every cue. The picture code in <code>bl.js</code> reads those times, and <code>build_sound.py</code> makes all the non-voice sound with numpy and scipy.</p>
<h2>FOR THE BENCH</h2>
<p>Write text for a program instead of a person. First write <code>writer()</code>, which returns one sentence built from a few variables, for example <code>{{who: 'Mara', missed: 'the 8:10 train', walked: 'home along the river', letter: 'from her brother', answered: false}}</code>. Then write <code>reader(s)</code>, which takes only that sentence as a string and returns a summary of ten words or fewer. Print both. Now compare the summary with the original object: which fields survived, which were dropped, and which did <code>reader</code> get wrong? Change <code>writer()</code> so that it outputs JSON instead of a sentence, and rewrite <code>reader</code> to use it. The summary gets more accurate. Is the JSON still something a person would call writing?</p>
<p class="src">After the premise of Stanis&lstrok;aw Lem, <i>A History of Bitic Literature</i>, in <i>Imaginary Magnitude</i> (1973); all wording here is new. <a href="bitic-literature.mp4" download>Download the film</a>.</p>
</section>
<section class="script"><h2>THE SCRIPT</h2>{''.join(script)}</section>'''
out = shell
out = re.sub(r'<title>.*?</title>', '<title>A History of Bitic Literature &middot; Lab 7</title>', out, 1, re.S)
out = re.sub(r'<header>.*?</header>', '<header><a href="../index.html">LAB 7</a><a href="../lineage/index.html">ALL FILMS</a></header>', out, 1, re.S)
out = re.sub(r'<h1>.*?</h1>', '<h1>A History of Bitic Literature</h1>', out, 1, re.S)
out = re.sub(r'<p class="sub">.*?</p>', '<p class="sub">books written by machines, for readers who are not us</p>', out, 1, re.S)
out = out.replace('good-shellacking.jpg', 'bitic-literature.jpg').replace('good-shellacking.mp4', 'bitic-literature.mp4')
out = re.sub(r'<div class="cols">.*?</main>', '<div class="cols">\n' + note.replace('\\', '\\\\') + '\n</div>\n</main>', out, 1, re.S)
open(os.path.join(R, 'index.html'), 'w', encoding='utf-8').write(out)
print('ok', n, 'fulcrum lines')
