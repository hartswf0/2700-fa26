# Builds ../index.html from the Good Shellacking page shell and timing/ba.json.
import json, os, re, html
H = os.path.dirname(os.path.abspath(__file__)); R = os.path.dirname(H)
T = json.load(open(os.path.join(H, 'timing', 'ba.json')))
shell = open(os.path.join(R, '..', 'good-shellacking', 'index.html'), encoding='utf-8').read()
esc = lambda s: html.escape(s, quote=False).replace('’', '&rsquo;')
cast = T['cast']; nm = lambda w: cast.get(w, {}).get('name', w)
TITLES = {'sopho': 'C. SOPHOCRISIS', 'apostasy': 'D. APOSTASY', 'cogito': 'THE COGITO PARADOX', 'anti': 'ANTIMATICS', 'tachy': 'TERRAPHYSICS: THE POLYVERSUM', 'lampoon': 'LAMPOON UPON THE UNIVERSE'}
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
<p>In <i>Imaginary Magnitude</i> Stanis&lstrok;aw Lem wrote the foreword to a history of literature written by machines. This film covers the second half of its survey: sophocrisis, the machine critique of systematic philosophy, and apostasy, the writing in which people no longer appear, with the Cogito paradox, antimatics, terraphysics and the Lampoon upon the Universe. The narration paraphrases Lem. Every spoken line was checked against the source text for runs of six words or more, and reworded wherever one matched. Lem's names and coined terms are kept.</p>
<p>It is set in the same study as <a href="../bitic-literature/index.html">A History of Bitic Literature</a>: a shelf of volumes, one page on a lectern, a reader at a desk. In Sophocrisis the page shows a system of philosophy as a knot of bright threads in a block of dark glass; then copies of the block, in four sizes and colours, are set down on the desk like ornaments, and a small machine stands at the edge of the next page writing objections in red in the margin, line by line. In Apostasy the words <i>we</i>, <i>us</i>, <i>our</i> and <i>people</i> fade out of a page, and the next page is a mountain whose upper level is closed off. For the Cogito paradox the human reader and a machine sit at opposite ends of one table, with a chess game between them; a dotted line runs down the middle of the table, and a question mark rises over each of them in turn. Antimatics writes <i>n = n</i> and strikes it out, then strikes out zero. Terraphysics is an open book whose gutter is the speed of light: the slow world on the left page, a single particle smeared into the whole right page, a burst across the gutter that fills the left page with stars, and the sums written on both sides. The Lampoon is a shelf of thirteen volumes and a book that is closed without being read out.</p>
<p>The scholar Rambellais has the same voice as in the earlier film. The Machines are three Kokoro voices reading together, sample-and-held and reduced to a few bits; the therapy program is one flat voice with a buzz. A chess clock ticks under the Cogito paradox for the intellect that does not think, and stops for the fulcrum. A tone rises toward the speed of light. After the Lampoon closes there is no sound. Where a scene has the one line that matters, the camera goes in close and the delivery slows. The timing file <code>ba.json</code> holds the start of every line and cue; <code>ba.js</code> draws from it, and <code>build_sound.py</code> makes all the non-voice sound with numpy and scipy.</p>
<h2>FOR THE BENCH</h2>
<p>Write the Turing test as code. First write <code>answer(q)</code>, a program that replies to a question string, using nothing but a table of keywords and canned replies (if the question contains <code>feel</code>, reply <code>"When did you first notice that?"</code>). Then write <code>judge(transcript)</code>, a second program that reads a list of question and answer pairs and returns <code>"person"</code> or <code>"machine"</code>. List what <code>judge</code> can actually measure: reply length, delay, repeated phrases, whether a reply reuses words from the question, whether it ever contradicts an earlier answer. Run it on your <code>answer</code> and on transcripts you type yourself. Then improve <code>answer</code> until <code>judge</code> cannot tell. Which of the measurements has anything to do with thinking? Now swap the roles: if <code>judge</code> reads your own typed answers, what would it need to see to decide that you think?</p>
<p class="src">After Stanis&lstrok;aw Lem, <i>A History of Bitic Literature, Volume I</i>, in <i>Imaginary Magnitude</i> (1973), translated by Marc E. Heine. Narration paraphrases Lem. <a href="bitic-apostasy.mp4" download>Download the film</a>.</p>
</section>
<section class="script"><h2>THE SCRIPT</h2>{''.join(script)}</section>'''
out = shell
out = re.sub(r'<title>.*?</title>', '<title>A History of Bitic Literature: Sophocrisis and Apostasy &middot; Lab 7</title>', out, 1, re.S)
out = re.sub(r'<header>.*?</header>', '<header><a href="../index.html">LAB 7</a><a href="../lineage/index.html">ALL FILMS</a></header>', out, 1, re.S)
out = re.sub(r'<h1>.*?</h1>', '<h1>A History of Bitic Literature: Sophocrisis and Apostasy</h1>', out, 1, re.S)
out = re.sub(r'<p class="sub">.*?</p>', '<p class="sub">machines that ask whether we think</p>', out, 1, re.S)
out = out.replace('good-shellacking.jpg', 'bitic-apostasy.jpg').replace('good-shellacking.mp4', 'bitic-apostasy.mp4')
out = re.sub(r'<div class="cols">.*?</main>', '<div class="cols">\n' + note.replace('\\', '\\\\') + '\n</div>\n</main>', out, 1, re.S)
open(os.path.join(R, 'index.html'), 'w', encoding='utf-8').write(out)
print('ok', n, 'fulcrum lines')
