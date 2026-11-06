# Builds ../index.html from the Good Shellacking page shell and timing/bw.json.
import json, os, re, html
H = os.path.dirname(os.path.abspath(__file__)); R = os.path.dirname(H)
T = json.load(open(os.path.join(H, 'timing', 'bw.json')))
shell = open(os.path.join(R, '..', 'good-shellacking', 'index.html'), encoding='utf-8').read()
esc = lambda s: html.escape(s, quote=False).replace('’', '&rsquo;')
cast = T['cast']; nm = lambda w: cast.get(w, {}).get('name', w)
TITLES = {'old': 'THE FIRST ENGINE', 'quatrain': 'FOUR MORE PARTS', 'rules': 'THE RULES', 'strands': 'ROWS AND COLUMNS', 'count': 'THE COUNT', 'tzero': 'STOPPED', 'memos': 'THE GRID', 'film': 'ONE FILM FROM THE GRID'}
lines, script = [], []
for sh in T['shots']:
    if not sh.get('lines'): continue
    if TITLES.get(sh['shot']): script.append(f"<h3>{TITLES[sh['shot']]}</h3>")
    for l in sh['lines']:
        say = l.get('show') or l['say']
        cls = ' class=fulcrum' if l.get('line') else ''
        script.append(f"<p{cls}><b>{esc(nm(l['who']))}.</b> {esc(say)}</p>")
        if l.get('line'): lines.append(f"<li><span>{esc(nm(l['who']))}</span>{esc(say)}</li>")
n = len(lines); words = {7: 'SEVEN', 8: 'EIGHT', 9: 'NINE'}.get(n, str(n))
D = json.load(open(os.path.join(H, 'data.json'))); F = json.load(open(os.path.join(H, 'film.json')))
fm = lambda n: f'{int(n):,}'
note = f'''<section class="note">
<h2>{words} LINES</h2>
<ol class="lines">{''.join(lines)}</ol>
<h2>HOW IT IS MADE</h2>
<p>This film continues from <a href="../abominable-house/index.html">The Burning of the Abominable House</a>, where a computer counted who did each of twelve deeds to whom: twelve to the twelfth power, 8,916,100,448,256 films. Here the four tenants are flour sacks, and each deed also gets the four parts of Alison Knowles and James Tenney&rsquo;s <i>The House of Dust</i>, read as causes: what the deed leaves behind, which room, what light, and who else is in the room. The light decides who sees. By candle or lamp everyone in the room sees who did it; by moonlight nobody does; four deeds happen behind a shut door; after the sixth deed the house can catch fire, and then the fire lights everything. What a deed leaves (paper, cloth, flour, rope or ash) is found by the next sack to come into that room with a light. A sack that has acted once may act again only against someone it knows is guilty; that rule is checked down each sack&rsquo;s own column, after Calvino&rsquo;s <i>The Castle of Crossed Destinies</i>. The engine plays the deeds in the order the index lists them and chooses only who, where, by what light and with whom.</p>
<p>Every number in the film was computed by the film&rsquo;s own engine (<a href="film-src/engine.js">engine.js</a>). With every choice open there are {fm(D['framesRaw'])} films. The rules leave exactly {fm(D['framesValid'])}. The count is done by dynamic programming: the room changes what is left behind but not what can happen next, so it is multiplied in and forgotten, and what the next deed depends on fits in at most {fm(max(p['states'] for p in D['perBeat']))} cases (who is alive, who is tied, whether the fire has started, who has acted, who knows whom). For the first three deeds the film also lists every raw choice and throws out the ones that break a rule: {fm(D['check']['3']['brute'])} of {fm(D['check']['3']['raw'])}, the same number the count gives. Of 200,000 who-to-whom films drawn at random, {fm(F['why']['strand'])} fail first on the column rule.</p>
<p>A million random films were scored by one number (deeds solved, then deeds that answer an earlier wrong). The best three open differently but are the same kind of film: every deed solved, five or six rooms. So the film keeps a grid instead, after Mouret and Clune&rsquo;s MAP-Elites, with three of Calvino&rsquo;s <i>Six Memos</i> as its axes: exactitude as deeds solved, multiplicity as rooms used, visibility as deeds a witness sees. The million films fill {D['gridFilled']} of 64 squares, and each square keeps its best. The film played at the end comes from a square the three winners never reach: every deed solved in two rooms, the cellar and the attic. Stopped before its fourth deed (after Calvino&rsquo;s <i>t zero</i>), the engine gives the exact share of every pair that could do the knifing: five pairs are impossible, Ogiva knifing the widow takes 51 percent of what can follow, and the film takes a branch worth 8.6 percent.</p>
<p>The four sexual deeds of the index are never named or shown; they happen behind a shut door. The sound follows the parts of each deed: paper, cloth, flour, rope and ash, a candle, a lamp, the moon, a witness&rsquo;s whisper, a door, and a clock that speeds up from 66 to 108 ticks a minute until the fire.</p>
<h2>FOR THE BENCH</h2>
<p>Count instead of sampling. Write <code>moves(k, state)</code> that lists every legal choice for deed <code>k</code>, and <code>step(k, state, move)</code> that returns the next state. Keep a <code>Map</code> from a packed state key to how many films reach it, and push it forward one deed at a time: for every state and every move, add its count to the next state&rsquo;s key. Use <code>BigInt</code>; the totals pass twenty digits. Then check yourself: for the first two or three deeds, list every raw choice with a recursive function, keep the legal ones, and compare. The two numbers must match exactly. Then remove the room from the state key and watch the number of states drop while the count stays the same.</p>
<p class="src">After Italo Calvino, <i>The Burning of the Abominable House</i>, in <i>Numbers in the Dark</i>, translated by Tim Parks; with Alison Knowles and James Tenney, <i>The House of Dust</i> (1967); Calvino, <i>t zero</i>, <i>The Castle of Crossed Destinies</i> and <i>Six Memos for the Next Millennium</i>; Jean-Baptiste Mouret and Jeff Clune, &ldquo;Illuminating search spaces by mapping elites&rdquo; (2015); Richard Bellman, <i>Dynamic Programming</i> (1957). Nothing is quoted. <a href="by-what-light.mp4" download>Download the film (mp4)</a>.</p>
</section>
<section class="script"><h2>THE SCRIPT</h2>{''.join(script)}</section>'''
out = shell
out = re.sub(r'<title>.*?</title>', '<title>By What Light &middot; Lab 7</title>', out, 1, re.S)
out = re.sub(r'<header>.*?</header>', '<header><a href="../index.html">LAB 7</a><a href="../lineage/index.html">ALL FILMS</a></header>', out, 1, re.S)
out = re.sub(r'<h1>.*?</h1>', '<h1>By What Light</h1>', out, 1, re.S)
out = re.sub(r'<p class="sub">.*?</p>', '<p class="sub">a ledger for the Abominable House: room, light, witness, and an exact count</p>', out, 1, re.S)
out = out.replace('good-shellacking.jpg', 'by-what-light.jpg').replace('good-shellacking.mp4', 'by-what-light.mp4')
out = re.sub(r'<div class="cols">.*?</main>', '<div class="cols">\n' + note.replace('\\', '\\\\') + '\n</div>\n</main>', out, 1, re.S)
open(os.path.join(R, 'index.html'), 'w', encoding='utf-8').write(out)
print('ok', n, 'fulcrum lines')
