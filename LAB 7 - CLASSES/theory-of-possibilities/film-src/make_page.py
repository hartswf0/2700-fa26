# Builds ../index.html from the Good Shellacking page shell and timing/tq.json.
import json, os, re, html
H = os.path.dirname(os.path.abspath(__file__)); R = os.path.dirname(H)
T = json.load(open(os.path.join(H, 'timing', 'tq.json')))
shell = open(os.path.join(R, '..', 'good-shellacking', 'index.html'), encoding='utf-8').read()
esc = lambda s: html.escape(s, quote=False).replace('’', '&rsquo;')
cast = T['cast']; nm = lambda w: cast.get(w, {}).get('name', w)
TITLES = {'field': 'WHAT LITERATURE IS', 'turns': 'THE OLD AND THE YOUNG; TURNS', 'gaps': 'NEW ASPECTS OF OLD CATEGORIES: CONCRETIZATION', 'hopscotch': 'DECONSTRUCTIVE HOPSCOTCH; LIQUID HISTORIES', 'dramatic': 'WHERE IS THE AUTHOR? THE DRAMATIC AND DRAMATURGY', 'vacuum': '(IM)POSSIBLE WORKS: LEM’S APOCRYPHA', 'bitic': 'WHERE IS LITERATURE? BITIC LITERATURE'}
lines, script = [], []
for sh in T['shots']:
    if not sh.get('lines'): continue
    if TITLES.get(sh['shot']): script.append(f"<h3>{TITLES[sh['shot']]}</h3>")
    for l in sh['lines']:
        say = l.get('show') or l['say']
        cls = ' class=fulcrum' if l.get('line') else ''
        script.append(f"<p{cls}><b>{esc(nm(l['who']))}.</b> {esc(say)}</p>")
        if l.get('line'): lines.append(f"<li><span>{esc(nm(l['who']))}</span>{esc(say)}</li>")
n = len(lines); words = {5: 'FIVE', 6: 'SIX', 7: 'SEVEN', 8: 'EIGHT'}.get(n, str(n))
note = f'''<section class="note">
<h2>{words} LINES</h2>
<ol class="lines">{''.join(lines)}</ol>
<h2>HOW IT IS MADE</h2>
<p>Ewelina Wo&zacute;niak-Czech's essay argues that literary theory no longer has to choose one method. Every definition of literature has failed to hold, theories have multiplied rather than ended, and the field can be treated as a set of possibilities that coexist: old categories such as Ingarden's concretization and Derrida's play stay valid beside the turns of the last thirty years, concepts travel between disciplines, and in Anna Krajewska's dramatic theory the author, the work and the reader act together, with theory as one of the players. The essay ends on Stanis&lstrok;aw Lem. His apocrypha, <i>A Perfect Vacuum</i> (reviews of books that were never written) and <i>Imaginary Magnitude</i> (introductions to them), are possibility in its purest form; and one of those introductions, to <i>A History of Bitic Literature</i>, described in 1973 a literature written by machines that is now being written. This film closes the Lab 7 collection: after the Cyberiad stories, <i>Non Serviam</i>, and five films on the bitic history, it reads Lem through a literary theorist. All narration is paraphrase. A script check compares every spoken line with the translation and rejects any run of six words in common; the short passages the essay itself quotes from Culler, Burzy&nacute;ska, Bal and Lem are paraphrased too.</p>
<p>The picture is the study from the bitic films: the shelf, the lectern page, and the reader at the desk. Two things are added. Between the lectern and the desk a small stage is built, and concepts are its actors: robed figures whose heads are cards with their names. STRUCTURE, SYSTEM and MODEL face the young who arrive in 1966; the turns come on one by one; and on the line about turning, every actor on the stage turns round and none leaves. Later the AUTHOR lies dead, gets up, and speaks with the WORK and the READER, a concept walks off one wing and comes back by the other with a different name, and THEORY walks on to join them. The second addition is that the shelf changes in every scene. It fills with theories, then a library of books that do not exist rises above it with blank spines, and at the end the five volumes of the bitic history get their numbers and the shelves fill with books written by machines.</p>
<p>The page scenes stage one idea each. A list of definitions of literature is struck through until the last line is written in: its potential. A paragraph has four places left open; one reader fills them, another fills them differently, and the page then holds all the readings at once, flickering until a reader settles one. A hypertext is a hopscotch court on which two readers walk two paths. <i>A Perfect Vacuum</i> opens to its contents, the first review points back at the book itself, and the page holds a smaller copy of itself; then a review title over a page that is not written. At the end the bitic history is written by a machine on the ledge of the lectern, a prize waits on the desk with nobody to accept it, and the essay's last image, concepts colliding in an accelerator, runs as a ring on the page.</p>
<p>The timing file <code>tq.json</code> drives picture and sound together. It holds the start time of every spoken line and every cue. The picture code in <code>tp2.js</code> reads those times, and <code>build_sound.py</code> makes all the non-voice sound with numpy and scipy. The narrator is a different Kokoro voice from the bitic films' Rambellais.</p>
<h2>FOR THE BENCH</h2>
<p>Write a class <code>Reading</code> that holds one text with gaps in it, for example <code>"A woman came in from the _ and set the _ down."</code>, and a list of interpretations, each an array of fill-ins. Give it <code>add(fills)</code>, which appends a new interpretation and never removes one, <code>show(i)</code>, which prints the text completed by interpretation <code>i</code>, and a key that steps through them. Now write <code>OneReading</code>, which keeps a single array: <code>add</code> replaces whatever was there. Add three interpretations to each and print what each object can still show. What does the first program know that the second has thrown away? Which one is the theory of possibilities, and what does it cost in memory?</p>
<p class="src">After Ewelina Wo&zacute;niak-Czech, <i>The Possibilities of Theory &ndash; the Theory of Possibilities</i>, <i>Przestrzenie Teorii</i> special issue (2024), translated by Ma&lstrok;gorzata Olsza, CC BY-NC-ND 4.0, <a href="https://doi.org/10.14746/pt.2024.special.8">doi:10.14746/pt.2024.special.8</a>. Narration paraphrases the essay. <a href="theory-of-possibilities.mp4" download>Download the film</a>.</p>
</section>
<section class="script"><h2>THE SCRIPT</h2>{''.join(script)}</section>'''
out = shell
out = re.sub(r'<title>.*?</title>', '<title>The Theory of Possibilities &middot; Lab 7</title>', out, count=1, flags=re.S)
out = re.sub(r'<header>.*?</header>', '<header><a href="../index.html">LAB 7</a><a href="../lineage/index.html">ALL FILMS</a></header>', out, count=1, flags=re.S)
out = re.sub(r'<h1>.*?</h1>', '<h1>The Theory of Possibilities</h1>', out, count=1, flags=re.S)
out = re.sub(r'<p class="sub">.*?</p>', '<p class="sub">an essay by Ewelina Wo&zacute;niak-Czech, and Lem&rsquo;s books that do not exist</p>', out, count=1, flags=re.S)
out = out.replace('good-shellacking.jpg', 'theory-of-possibilities.jpg').replace('good-shellacking.mp4', 'theory-of-possibilities.mp4')
out = re.sub(r'<div class="cols">.*?</main>', '<div class="cols">\n' + note.replace('\\', '\\\\') + '\n</div>\n</main>', out, count=1, flags=re.S)
open(os.path.join(R, 'index.html'), 'w', encoding='utf-8').write(out)
print('ok', n, 'fulcrum lines')
