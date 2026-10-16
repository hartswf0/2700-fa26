# Builds ../index.html from the Good Shellacking page shell and timing/bt.json.
import json, os, re, html
H = os.path.dirname(os.path.abspath(__file__)); R = os.path.dirname(H)
T = json.load(open(os.path.join(H, 'timing', 'bt.json')))
shell = open(os.path.join(R, '..', 'good-shellacking', 'index.html'), encoding='utf-8').read()
esc = lambda s: html.escape(s, quote=False).replace('’', '&rsquo;')
cast = T['cast']; nm = lambda w: cast.get(w, {}).get('name', w)
TITLES = {'edition': 'THE SECOND EDITION', 'information': '1. INFORMATIONAL THEOLOGY', 'oscillation': '2. MATHEMATICAL THEOLOGY', 'cold': 'THE COLD AGGREGATES', 'physical': '3. PHYSICALISTIC THEOLOGY'}
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
<p>In <i>Imaginary Magnitude</i> Stanis&lstrok;aw Lem wrote the introduction to a five-volume history of literature written by machines. Its second edition adds a fifth volume on what the machines have written about metaphysics and religion, which the editors call theobitistics. This film follows that introduction to the second edition section by section: the new volume, informational theology, mathematical theology, the cold aggregates, and physicalistic theology. The narration paraphrases Lem; every spoken line was checked against his text and reworded wherever six words in a row matched. The machines' theologies are given as the machines' claims, in the scholar's even voice.</p>
<p>It is set in the same study as the earlier bitic film: a shelf of volumes, a page on a lectern, a reader at a desk. In the first scene the scholar writes the new introduction while a fifth volume is set on the shelf. Each later scene opens that volume to one page. For informational theology the page is a passage of mystical writing, written new for the film, that passes through a counter on the desk: as each word is measured its text turns into a grey bar and its surprise in bits is printed above it, because the Brookhaven study measured quantity and set meaning aside. A laboratory record counts higher; a journal counts the same as the mystical text, and the gain reads zero. For mathematical theology a pen draws a sine wave between two infinities, with a hatched shortfall where the balance fails and a red ring at every zero crossing. For the cold aggregates a frost-covered machine prints digits that halve in size and distance as they near the margin, so the line never ends, and METAX keeps a tally of contradictions. For physicalistic theology a granulate assembles into a lattice and bursts into a galaxy, with a few small people left on the fragments, and then two clocks, one racing and one almost still.</p>
<p>The sound follows the pages: a pen, a volume knocked into place, a counter ticking word by word, a pure tone that rises with Good, falls with Evil and goes silent each time the curve crosses zero, a cold hiss with frost crackle and a printer whose strokes thin out, grains gathering and scattering, and two clocks. Professor Rambellais is the same Kokoro voice as the scholar of the earlier film. The Brookhaven computers and UNITARS are three Kokoro voices together, sample-and-held and reduced to a few bits; ONTARES II carries a slow tremolo; METAX is lowered and breathed over with cold air. The timing file <code>bt.json</code> drives picture and sound together; <code>bt.js</code> draws, and <code>build_sound.py</code> makes all the non-voice sound with numpy and scipy.</p>
<h2>FOR THE BENCH</h2>
<p>Measure information the way the Brookhaven machines did, by ignoring meaning. Write <code>surprise(text)</code>: split the text into words, count how often each word appears, and give each word the value <code>-Math.log2(count / total)</code>, its surprise in bits. A word used once in a hundred scores about 6.6; a word used every tenth time scores about 3.3. Print each word with its score, then the total and the average per word. Run it on two texts of about the same length: a paragraph you wrote about your day, and a page of measurements or a recipe with quantities. Which has the higher average? Now shuffle the words of the first text randomly and measure again. The score does not change. What does that tell you about what this measure can and cannot see?</p>
<p class="src">After Stanis&lstrok;aw Lem, <i>A History of Bitic Literature</i>, Volume I, Introduction to the Second Edition, in <i>Imaginary Magnitude</i> (1973), translated by Marc E. Heine. Narration paraphrases Lem. <a href="bitic-theology.mp4" download>Download the film</a>.</p>
</section>
<section class="script"><h2>THE SCRIPT</h2>{''.join(script)}</section>'''
out = shell
out = re.sub(r'<title>.*?</title>', '<title>A History of Bitic Literature: Theobitistics &middot; Lab 7</title>', out, 1, re.S)
out = re.sub(r'<header>.*?</header>', '<header><a href="../index.html">LAB 7</a><a href="../lineage/index.html">ALL FILMS</a></header>', out, 1, re.S)
out = re.sub(r'<h1>.*?</h1>', '<h1>A History of Bitic Literature: Theobitistics</h1>', out, 1, re.S)
out = re.sub(r'<p class="sub">.*?</p>', '<p class="sub">the fifth volume, where machines write about God</p>', out, 1, re.S)
out = out.replace('good-shellacking.jpg', 'bitic-theology.jpg').replace('good-shellacking.mp4', 'bitic-theology.mp4')
out = re.sub(r'<div class="cols">.*?</main>', '<div class="cols">\n' + note.replace('\\', '\\\\') + '\n</div>\n</main>', out, 1, re.S)
open(os.path.join(R, 'index.html'), 'w', encoding='utf-8').write(out)
print('ok', n, 'fulcrum lines')
