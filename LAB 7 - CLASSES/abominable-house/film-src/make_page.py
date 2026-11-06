# Builds ../index.html from the Good Shellacking page shell and timing/ah.json.
import json, os, re, html
H = os.path.dirname(os.path.abspath(__file__)); R = os.path.dirname(H)
T = json.load(open(os.path.join(H, 'timing', 'ah.json')))
shell = open(os.path.join(R, '..', 'good-shellacking', 'index.html'), encoding='utf-8').read()
esc = lambda s: html.escape(s, quote=False).replace('’', '&rsquo;')
cast = T['cast']; nm = lambda w: cast.get(w, {}).get('name', w)
TITLES = {'ruins': 'THE RUINS', 'count': 'THE COUNT', 'policies': 'THE POLICIES', 'rules': 'THE RULES', 'skiller': 'THE FIFTH PERSON', 'waldemar': 'THE SIXTH PERSON', 'second': 'THE SECOND PROGRAMMER'}
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
<p>In Italo Calvino&rsquo;s story a house has burned down with its four tenants, and all that survives of a copybook recording what they did to each other is its index: twelve deeds in alphabetical order, with the page numbers burned away. An insurance agent asks a programmer to have his computer reconstruct the lost account. The programmer counts the possible stories, writes rules to throw most of them out, adds the agent to the cast, adds himself, and works out that he has been set up.</p>
<p>It is set in the programmer&rsquo;s room: a computer cabinet on the left, a corkboard in the middle, his desk on the right, and above the board a counter of possible stories. The board shows the house burning, the copybook front and back, the four tenants as pinned cards, the grid of who did what to whom, the four insurance policies, the rules, the house rising again in the computer, and the two computers. The counter shows exact numbers: each of the twelve deeds is one ordered pair of distinct people, so four people give twelve to the twelfth power stories, and each rule removes the stories that break it. The deeds appear only in the copybook&rsquo;s index; the narration names none of the sexual ones.</p>
<p>The sound follows the room: the cabinet&rsquo;s hum, a house fire, a plastic folder lifted out of ash, cards pinned to cork, a counter rolling, typing, an error beep, rain at the window, a doorbell, a two-tone siren getting closer, and a safety catch.</p>
<h2>FOR THE BENCH</h2>
<p>Count the stories, then cut them down. With four people there are <code>4 * 3 = 12</code> ordered pairs, and each of twelve deeds takes one, so there are <code>12 ** 12</code> stories. Use <code>BigInt</code>, because the number is past what a JavaScript number holds exactly once you reach six people: <code>30n ** 12n</code>. Calvino&rsquo;s programmer gives a slightly different total; work out <code>12n ** 12n</code> yourself and check him. Then make the problem small enough to list: three people, three deeds. Write every story as an array of pairs, write each rule as a function that returns <code>false</code> for a story that breaks it (<code>s =&gt; s.knifing[0] !== &#39;B&#39;</code>), and keep the stories that pass every rule with <code>stories.filter(s =&gt; rules.every(r =&gt; r(s)))</code>. Print how many are left after each rule. Then take a rule out and watch the count go back up.</p>
<p class="src">After Italo Calvino, <i>The Burning of the Abominable House</i>, in <i>Numbers in the Dark</i>, translated by Tim Parks. Narration paraphrases Calvino. <a href="abominable-house.mp4" download>Download the film (mp4)</a>.</p>
</section>
<section class="script"><h2>THE SCRIPT</h2>{''.join(script)}</section>'''
out = shell
out = re.sub(r'<title>.*?</title>', '<title>The Burning of the Abominable House &middot; Lab 7</title>', out, 1, re.S)
out = re.sub(r'<header>.*?</header>', '<header><a href="../index.html">LAB 7</a><a href="../lineage/index.html">ALL FILMS</a></header>', out, 1, re.S)
out = re.sub(r'<h1>.*?</h1>', '<h1>The Burning of the Abominable House</h1>', out, 1, re.S)
out = re.sub(r'<p class="sub">.*?</p>', '<p class="sub">four tenants, twelve deeds, and a computer asked to put them in order</p>', out, 1, re.S)
out = out.replace('good-shellacking.jpg', 'abominable-house.jpg').replace('good-shellacking.mp4', 'abominable-house.mp4')
out = re.sub(r'<div class="cols">.*?</main>', '<div class="cols">\n' + note.replace('\\', '\\\\') + '\n</div>\n</main>', out, 1, re.S)
open(os.path.join(R, 'index.html'), 'w', encoding='utf-8').write(out)
print('ok', n, 'fulcrum lines')
