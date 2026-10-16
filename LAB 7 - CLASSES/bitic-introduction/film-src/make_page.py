# Builds ../index.html from the Good Shellacking page shell and timing/bi.json.
import json, os, re, html
H = os.path.dirname(os.path.abspath(__file__)); R = os.path.dirname(H)
T = json.load(open(os.path.join(H, 'timing', 'bi.json')))
shell = open(os.path.join(R, '..', 'good-shellacking', 'index.html'), encoding='utf-8').read()
esc = lambda s: html.escape(s, quote=False).replace('’', '&rsquo;')
cast = T['cast']; nm = lambda w: cast.get(w, {}).get('name', w)
TITLES = {'intro': 'GENERAL OBSERVATIONS', 'imitate': 'VOLUME ONE: THE TWO SCHOOLS', 'drift': 'VOLUME TWO: HOMOTROPIA, AND THE NAME', 'noreader': 'VOLUME THREE: INTERTROPIA', 'summary': 'VOLUME FOUR: HETEROTROPIA', 'history': 'THE FOUR PEAKS'}
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
<p>Stanis&lstrok;aw Lem's <i>A History of Bitic Literature</i> is the introduction to a five-volume history that does not exist, of literature written by machines. This film covers the opening of that introduction: the definition of bitic literature and bitistics, the dispute between the European and American schools over whether the machines' anatomy belongs to the subject, the compromise the history makes, the plan of its volumes and its classification into Homotropia, Intertropia and Heterotropia, how the field and its name arose, the split into cis-human and trans-human writing, machines interpreting machines, and the reply to the sorcerer's apprentice. It stops where the introduction turns to its four peaks; the films that follow take those up. All narration is paraphrase. A script check compares every spoken line with the translation and rejects any run of six words in common.</p>
<p>The device is one question asked of each volume: who can read it? Five bound volumes stand on a shelf, and each scene takes one down and opens it to a single page. Volume One, on the authors' anatomy, is a technical page that a reader at a desk can follow with a pencil. Volume Two opens on the classification table, then the page drifts into patterns while the narration reaches the machine dreams that gave the field its name. In Volume Three the page fills with marks a person cannot read, and the reader is drawn smaller each time the page turns. In Volume Four a reading machine stands on the desk and hands the reader one line on a slip of paper; when the narration says the machinery needed grows exponentially, more machines arrive, one, then two, then four, until the desk and the floor are crowded. The last scene returns to the introduction page in the scholar's hand, with machine marks filling the space below it, and the four peaks are marked over the volumes that hold them.</p>
<p>The sound follows the same line. A typewriter in Volume One gets faster and more regular in Volume Two and turns into a fixed sixteen-step data rhythm in Volume Three, which stays to the end. The reader breathes and uses a pencil; his breathing gets quieter as he gets smaller. The reading machine chimes each time it hands over a slip. The Machines are three Kokoro voices reading together, sample-and-held and reduced to a few bits, and under Volume Three eSpeak reads strings of numbers too fast to follow. Where a scene has the one line that matters, the camera goes in close and the delivery slows.</p>
<p>The timing file <code>bi.json</code> drives picture and sound together. It holds the start time of every spoken line and every cue. The picture code in <code>bi.js</code> reads those times, and <code>build_sound.py</code> makes all the non-voice sound with numpy and scipy.</p>
<h2>FOR THE BENCH</h2>
<p>Write text for a program instead of a person. First write <code>writer()</code>, which returns one sentence built from a few variables, for example <code>{{system: 31, binasty: 19, languages: 1, memoryClosed: true, texts: 4}}</code>. Then write <code>reader(s)</code>, which takes only that sentence as a string and returns a summary of ten words or fewer. Print both, and compare the summary with the original object: which fields survived, which were dropped, and which did <code>reader</code> get wrong? Now change <code>writer()</code> to output JSON instead of a sentence, and rewrite <code>reader</code> to use it. The summary gets more accurate. Is the JSON still writing, and who is it written for?</p>
<p class="src">After Stanis&lstrok;aw Lem, <i>A History of Bitic Literature</i>, Volume I, in <i>Imaginary Magnitude</i> (1973), translated by Marc E. Heine. Narration paraphrases Lem. <a href="bitic-introduction.mp4" download>Download the film</a>.</p>
</section>
<section class="script"><h2>THE SCRIPT</h2>{''.join(script)}</section>'''
out = shell
out = re.sub(r'<title>.*?</title>', '<title>A History of Bitic Literature: The Introduction &middot; Lab 7</title>', out, count=1, flags=re.S)
out = re.sub(r'<header>.*?</header>', '<header><a href="../index.html">LAB 7</a><a href="../lineage/index.html">ALL FILMS</a></header>', out, count=1, flags=re.S)
out = re.sub(r'<h1>.*?</h1>', '<h1>A History of Bitic Literature: The Introduction</h1>', out, count=1, flags=re.S)
out = re.sub(r'<p class="sub">.*?</p>', '<p class="sub">what bitistics is, and the five volumes</p>', out, count=1, flags=re.S)
out = out.replace('good-shellacking.jpg', 'bitic-introduction.jpg').replace('good-shellacking.mp4', 'bitic-introduction.mp4')
out = re.sub(r'<div class="cols">.*?</main>', '<div class="cols">\n' + note.replace('\\', '\\\\') + '\n</div>\n</main>', out, count=1, flags=re.S)
open(os.path.join(R, 'index.html'), 'w', encoding='utf-8').write(out)
print('ok', n, 'fulcrum lines')
