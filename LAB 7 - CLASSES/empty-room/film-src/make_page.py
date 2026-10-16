# Builds ../index.html from the Good Shellacking page shell and timing/er.json.
import json, os, re, html
H = os.path.dirname(os.path.abspath(__file__)); R = os.path.dirname(H)
T = json.load(open(os.path.join(H, 'timing', 'er.json')))
shell = open(os.path.join(R, '..', 'good-shellacking', 'index.html'), encoding='utf-8').read()
esc = lambda s: html.escape(s, quote=False).replace('’', '&rsquo;')
cast = T['cast']; nm = lambda w: cast.get(w, {}).get('name', w)
TITLES = {'city': 'CORDWAIN STREET', 'build': 'THE RECONSTRUCTION', 'visit': 'THE VISIT', 'correct': 'THE CORRECTIONS', 'kitchens': 'ONE KITCHEN, TWO PEOPLE', 'archive': 'THE ARCHIVIST', 'wall': 'THE SHARED WALL'}
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
<p>This is the fourth of four fables of Edifiction, <i>The House That Language Built</i>, set in one city where every building was made from a sentence and carries that sentence on a brass plate by its door. The Bureau of Reconstruction gives the Edifier forty-one archival photographs of a demolished street and it rebuilds the street from them. The surveyors took the photographs in the week after the last families moved out, so every room in them is empty, and the reconstruction is exact and uninhabited. The people who lived there come back and correct it. A brother and sister remember one kitchen two ways, and the Edifier builds both. An archivist then has to catalogue rooms that are records and rooms that are recollections. The story follows the distinction in Watson Hartsoe's notes between what an image shows, what later research establishes, and what a reconstruction is made to do.</p>
<p>The photographs are drawn as halftone prints with deckled edges and archive numbers. Each print is a small luminance function sampled on a forty-five degree screen, so moving the camera closer makes the dots bigger. The street is built with the series' signature shot: the Edifier types its description, the words leave the sheet, and each one lands as a line of the house with its letters set in it like courses of brick. Red is used only for the plates' sentences and for what is wrong. At first that means the rooms: the door's swing, the board that makes no sound, the stair that is too shallow. After the corrections the red moves to tags pinned on the photographs, which now disagree with the street. The last shot is print 31, the empty kitchen, unchanged.</p>
<p>The sound holds what the photographs could not. The first steps on the floor are dull. The floorboard then goes through three versions: a thin squeak, a long groan, and a short wooden creak that Hanna accepts by stepping on it again. A church clock strikes four before the late sun comes in. A kettle heats in her kitchen and not in his, and he hears it through the shared wall. The narrator is Kokoro bm_lewis and the Edifier is af_nicole with a light synthetic filter, as in the other three films. The inhabitants are older Kokoro voices, slowed, with a slight tremor. All other sound is made with numpy and scipy.</p>
<p>The timing file <code>er.json</code> drives picture and sound together. It holds the start time of every spoken line and every cue, including the moment each word of a falling sentence lands, so each landing has its own knock. The picture code in <code>er.js</code> reads those times, and <code>build_sound.py</code> reads the same score.</p>
<h2>FOR THE BENCH</h2>
<p>Keep provenance. Write a store where every fact about a room is recorded with its source: <code>{{room: 'kitchen-7', field: 'table', value: 'under the window', source: 'memory:Hanna'}}</code>, with sources such as <code>photo:31</code>, <code>memory:Hanna</code> and <code>memory:Emil</code>. Then write two views. <code>account(room, source)</code> returns the room as one source describes it and never fills a gap from another source. If the photograph has no table, the photograph's account has no table. <code>disagreements(room)</code> lists every field where two sources give different values, with both values and both sources. Next, try a third view, <code>established(room)</code>, that returns only the facts every source agrees on. Run it on the kitchen. What is left, and which fields does your code want to fill anyway?</p>
<p class="src">An original fable from Watson Hartsoe's notes <i>The House That Language Built</i>, written in the manner of Stanis&lstrok;aw Lem. <a href="empty-room.mp4" download>Download the film</a>.</p>
</section>
<section class="script"><h2>THE SCRIPT</h2>{''.join(script)}</section>'''
out = shell
out = re.sub(r'<title>.*?</title>', '<title>The Perfect Description of an Empty Room &middot; Lab 7</title>', out, count=1, flags=re.S)
out = re.sub(r'<header>.*?</header>', '<header><a href="../index.html">LAB 7</a><a href="../lineage/index.html">ALL FILMS</a></header>', out, count=1, flags=re.S)
out = re.sub(r'<h1>.*?</h1>', '<h1>The Perfect Description of an Empty Room</h1>', out, count=1, flags=re.S)
out = re.sub(r'<p class="sub">.*?</p>', '<p class="sub">a street rebuilt from photographs, and from memory</p>', out, count=1, flags=re.S)
out = out.replace('good-shellacking.jpg', 'empty-room.jpg').replace('good-shellacking.mp4', 'empty-room.mp4')
out = re.sub(r'<div class="cols">.*?</main>', '<div class="cols">\n' + note.replace('\\', '\\\\') + '\n</div>\n</main>', out, count=1, flags=re.S)
open(os.path.join(R, 'index.html'), 'w', encoding='utf-8').write(out)
print('ok', n, 'fulcrum lines')
