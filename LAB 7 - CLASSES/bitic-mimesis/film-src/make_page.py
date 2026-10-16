# Builds ../index.html from the Good Shellacking page shell and timing/bm.json.
import json, os, re, html
H = os.path.dirname(os.path.abspath(__file__)); R = os.path.dirname(H)
T = json.load(open(os.path.join(H, 'timing', 'bm.json')))
shell = open(os.path.join(R, '..', 'good-shellacking', 'index.html'), encoding='utf-8').read()
esc = lambda s: html.escape(s, quote=False).replace('’', '&rsquo;')
cast = T['cast']; nm = lambda w: cast.get(w, {}).get('name', w)
TITLES = {'peaks': 'THE FOUR PEAKS', 'dictionary': 'MONOETICS: OLD WORDS', 'axis': 'MONOETICS: NEW WORDS', 'gravity': 'MONOETICS: THE BODY', 'translate': 'MIMESIS: TRANSLATION', 'plates': 'MIMESIS: THE SEMASCOPE', 'girl': 'MIMESIS: THE GIRL', 'rule': 'MIMESIS: THE RULE', 'press': 'MIMESIS: THE INDUSTRY'}
lines, script = [], []
for sh in T['shots']:
    if not sh.get('lines'): continue
    if TITLES.get(sh['shot']): script.append(f"<h3>{TITLES[sh['shot']]}</h3>")
    for l in sh['lines']:
        say = l.get('show') or l['say']
        cls = ' class=fulcrum' if l.get('line') else ''
        script.append(f"<p{cls}><b>{esc(nm(l['who']))}.</b> {esc(say)}</p>")
        if l.get('line'): lines.append(f"<li><span>{esc(nm(l['who']))}</span>{esc(say)}</li>")
n = len(lines); words = {5: 'FIVE', 6: 'SIX', 7: 'SEVEN', 8: 'EIGHT', 9: 'NINE'}.get(n, str(n))
note = f'''<section class="note">
<h2>{words} LINES</h2>
<ol class="lines">{''.join(lines)}</ol>
<h2>HOW IT IS MADE</h2>
<p>Stanis&lstrok;aw Lem's <i>A History of Bitic Literature</i> is the introduction to a scholarly history of books written by machines. This film covers its first two "peaks". Monoetics is the stage where machines, taught how English builds words, give old words new meanings and coin new ones. Mimesis is the stage where machines translating an author's complete works write a new book by that author. The narration paraphrases Lem's text; no sentence of his is quoted. Each spoken line was checked against the translation for any run of six words in common, and reworded where it had one. Lem's names, coined terms and a few of his coined words are kept.</p>
<p>The study is the same one as in the first bitic film: five volumes on a shelf, one page on a lectern, a reader at a desk. A second shelf holds Dostoevsky's collected works, with a gap between <i>The Possessed</i> and <i>The Brothers Karamazov</i>. In the monoetics scenes the page is a dictionary: a red pencil strikes out each old meaning and the machine's meaning is typed under it. Then one root word puts out a family of new words, and a figure is drawn standing under gravity, with the words for up and down at either end of it. In the mimesis scenes three small machines aim at a page of text, press it into a block, and grow a woven, many-shelled body from it; the translation is written from that body and checked by translating it back. The body is then printed as plates: an argument, a poem and a psalm, an allegory, a novel. A typescript arrives under a pen name, a broken ring is drawn across Dostoevsky's shelf, and one more spine, <i>The Girl</i>, slides into the gap. At the end a press stamps out numbered spines onto a pile on the floor.</p>
<p>The sound follows the same line. A soft typewriter types the machine's meanings. In the translation scene the keys even out into a steady machine rhythm, which stays to the end. The woven body hums. The Machine's words are read by one Kokoro voice through a sample-and-hold, bit-reduced filter. The rule of mimesis is heard as bells: one note with its echoes, two notes, and a note that drowns in its own echoes. At the end the press slows down and stops, and one page turns. Where a scene has the one line that matters, the camera goes in close and the delivery slows.</p>
<p>The timing file <code>bm.json</code> drives picture and sound together. It holds the start time of every spoken line and every cue. The picture code in <code>bm.js</code> reads those times, and <code>build_sound.py</code> makes all the non-voice sound with numpy and scipy.</p>
<h2>FOR THE BENCH</h2>
<p>Write a program that continues an author. Take a few thousand words by one writer as a string. Build a table that maps every pair of consecutive words to the list of words that followed that pair in the text. Then start from a pair that occurs in the text, pick a random follower, shift the pair along by one word, and repeat for two hundred words. Print the result. It will sound like the author, sentence by sentence. Now check two things. First, list every three-word sequence in your output that does not occur in the source: these are the only places the program added anything, and each one was made by joining two phrases the author did write. Second, try to make it write about a subject the author never mentions. It cannot, because it has no word the author did not use. Lem's mimesis works on the shape of a whole body of work and can find the book that is missing from it. Yours works on the order of words. What would your program need, beyond the table, to find a gap?</p>
<p class="src">After Stanis&lstrok;aw Lem, <i>A History of Bitic Literature, Volume I</i>, in <i>Imaginary Magnitude</i> (1973), translated by Marc E. Heine. Narration paraphrases Lem. <a href="bitic-mimesis.mp4" download>Download the film</a>.</p>
</section>
<section class="script"><h2>THE SCRIPT</h2>{''.join(script)}</section>'''
out = shell
out = re.sub(r'<title>.*?</title>', '<title>A History of Bitic Literature: Monoetics and Mimesis &middot; Lab 7</title>', out, 1, re.S)
out = re.sub(r'<header>.*?</header>', '<header><a href="../index.html">LAB 7</a><a href="../lineage/index.html">ALL FILMS</a></header>', out, 1, re.S)
out = re.sub(r'<h1>.*?</h1>', '<h1>A History of Bitic Literature: Monoetics and Mimesis</h1>', out, 1, re.S)
out = re.sub(r'<p class="sub">.*?</p>', '<p class="sub">machines that make words, and a novel Dostoevsky could not write</p>', out, 1, re.S)
out = out.replace('good-shellacking.jpg', 'bitic-mimesis.jpg').replace('good-shellacking.mp4', 'bitic-mimesis.mp4')
out = re.sub(r'<div class="cols">.*?</main>', '<div class="cols">\n' + note.replace('\\', '\\\\') + '\n</div>\n</main>', out, 1, re.S)
open(os.path.join(R, 'index.html'), 'w', encoding='utf-8').write(out)
print('ok', n, 'fulcrum lines')
