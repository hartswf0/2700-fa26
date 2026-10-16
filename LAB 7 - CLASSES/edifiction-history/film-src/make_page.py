# Builds ../index.html from the Good Shellacking page shell and timing/eh.json.
import json, os, re, html
H = os.path.dirname(os.path.abspath(__file__)); R = os.path.dirname(H)
T = json.load(open(os.path.join(H, 'timing', 'eh.json')))
shell = open(os.path.join(R, '..', 'good-shellacking', 'index.html'), encoding='utf-8').read()
esc = lambda s: html.escape(s, quote=False).replace('’', '&rsquo;')
cast = T['cast']; nm = lambda w: cast.get(w, {}).get('name', w)
TITLES = {'preface': 'PREFACE', 'prize': '1. THE ROYAL PRIZE', 'astro': '2. TENANTS', 'stair': '3. ELEVATION', 'ministry': '4. THE INTERPRETATION OF INHABITANTS',
          'discipline': '5. THE FOUNDING OF EDIFICTION', 'schools': '6. THE SCHOOLS', 'builder': '7. THE BUILDER', 'gens': '8. THE GENERATIONS',
          'close': '9. AUTHORS AND MATERIALS', 'last': 'THE STAIR'}
lines, script = [], []
for sh in T['shots']:
    if not sh.get('lines'): continue
    if TITLES.get(sh['shot']): script.append(f"<h3>{TITLES[sh['shot']]}</h3>")
    for l in sh['lines']:
        say = l.get('show') or l['say']
        cls = ' class=fulcrum' if l.get('line') else ''
        script.append(f"<p{cls}><b>{esc(nm(l['who']))}.</b> {esc(say)}</p>")
        if l.get('line'): lines.append(f"<li><span>{esc(nm(l['who']))}</span>{esc(say)}</li>")
n = len(lines); words = {9: 'NINE', 10: 'TEN', 11: 'ELEVEN', 12: 'TWELVE'}.get(n, str(n))
note = f'''<section class="note">
<h2>{words} LINES</h2>
<ol class="lines">{''.join(lines)}</ol>
<h2>HOW IT IS MADE</h2>
<p>This is the first of four films in <i>The House That Language Built</i>, fables of Edifiction, the study of buildings brought into existence by description. It takes the form of the preface to Volume VII of the <i>Universal Encyclopedia of Constructive Semantics</i>. The first six scenes are read from Watson Hartsoe's own drafted preface, trimmed; the schools, the generations, the controversy and the stair are new. The machine is the Edifier, a tall cabinet with a brass keyboard, a paper slot and a funnel, which builds whatever it is told; every building it makes carries a brass plate with the sentence it was built from, and that sentence is the only red in the film besides the things that are wrong: the twelfth window, the staircase's top step, the rooms the philosopher's house was built without.</p>
<p>The open encyclopedia is the frame. Each scene is a numbered engraved plate on a right-hand page, under a column of printed text that is the narration itself. The camera reads the column, enters the plate until the plate is the whole picture, and comes back out to the page before the page turns. Inside the plates the Edifier types its sentence and the words leave the sheet, fall onto the plot and land as a stack of letter blocks; the walls then rise in courses whose bricks are rows of the same sentence. The same move builds the five schools' houses from the same two words, <i>A house.</i>, and the builder the Ministry orders from <i>A builder.</i> The camera counts the astronomer's windows twice, twelve from the street and eleven from inside, and stops on the wallpaper where the twelfth should be. The woman climbs a staircase whose steps slide down under her as fast as she climbs. The volume closes on the controversy, and the last shot, outside the encyclopedia, is the stair again.</p>
<p>The voices are Kokoro: the Historian is <code>bm_lewis</code>, the Edifier <code>af_nicole</code> through a small tin filter, the Interpreting Machine <code>am_echo</code>, the astronomer <code>bm_daniel</code>, the elderly woman <code>bf_alice</code>. Everything else is synthesized with numpy and scipy: typewriter keys for every description, a dry wooden knock for each word that lands, a low hum while the Edifier works, chalk taps for counting (the twelfth tap inside is a dull knock on plaster), the dining room's clock and cutlery, the ticker tape, a brass fanfare, chisels on the three principles, forty-seven volumes set on a shelf, and one step on a wooden stair. The timing file <code>eh.json</code> drives picture and sound together; the picture is <code>eh.js</code> on the same engraving toolkit as the Lem films.</p>
<h2>FOR THE BENCH</h2>
<p>Write <code>build(description)</code> twice. The first version builds only what the description states: take a sentence such as <code>"a modest dwelling suitable for a philosopher"</code> and return an object whose fields come only from its words, with nothing else (no rooms, no door, no roof unless the sentence names them). The second version fills in every default a house is ordinarily expected to have: walls, a door that opens, windows, a kitchen, a bed, stairs that go up. Run both on three descriptions and print the two houses side by side. Then write <code>canDo(house, act)</code> for a short list of acts (<code>enter</code>, <code>sleep</code>, <code>cook</code>, <code>climb</code>, <code>look out</code>) and list, for each house, what it could not do. Which house was more faithful to the sentence, and which could you live in? Where did the defaults come from, and who wrote them?</p>
<p class="src">An original fable from Watson Hartsoe's notes <i>The House That Language Built</i>, written in the manner of Stanis&lstrok;aw Lem. <a href="edifiction-history.mp4" download>Download the film</a>.</p>
</section>
<section class="script"><h2>THE SCRIPT</h2>{''.join(script)}</section>'''
out = shell
out = re.sub(r'<title>.*?</title>', '<title>A Short History of Edifiction &middot; Lab 7</title>', out, count=1, flags=re.S)
out = re.sub(r'<header>.*?</header>', '<header><a href="../index.html">LAB 7</a><a href="../lineage/index.html">ALL FILMS</a></header>', out, count=1, flags=re.S)
out = re.sub(r'<h1>.*?</h1>', '<h1>A Short History of Edifiction</h1>', out, count=1, flags=re.S)
out = re.sub(r'<p class="sub">.*?</p>', '<p class="sub">the houses that were too perfect to live in</p>', out, count=1, flags=re.S)
out = out.replace('good-shellacking.jpg', 'edifiction-history.jpg').replace('good-shellacking.mp4', 'edifiction-history.mp4')
out = re.sub(r'<div class="cols">.*?</main>', '<div class="cols">\n' + note.replace('\\', '\\\\') + '\n</div>\n</main>', out, count=1, flags=re.S)
open(os.path.join(R, 'index.html'), 'w', encoding='utf-8').write(out)
print('ok', n, 'fulcrum lines')
