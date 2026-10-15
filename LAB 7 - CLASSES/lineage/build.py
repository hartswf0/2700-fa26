"""Builds lineage/index.html (all the Cyberiad films on one page) and gives every film page the
same header: LAB 7, ALL FILMS, its position, previous and next film.
To add a film: add a row to FILMS, mark its story as made in BOOK, run python3 build.py."""
import html, json, os, re, subprocess

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
E = html.escape

# the films, in the order they were made. Each one builds on the one before.
FILMS = [
  dict(dir='seventh-sally', title='The Seventh Sally', sub='How Trurl’s Own Perfection Led to No Good',
       line=('A citizen', 'Can you hear us? We live, though we are small.'),
       picture='A deposed king rules a kingdom in a box by typing a verb and a noun. The box answers in parser prose: Which baker? There are 312.',
       sound='The citizens are a murmur built from many small voices. An afternoon of the king’s is a century of theirs.',
       code='Parameters and the rule. The king’s console changes variables. It cannot reach the line that is the citizens’ update().',
       builds='The first film. Sets the score format the rest use: one line per scene carries the weight.'),
  dict(dir='non-serviam', title='Non Serviam', sub='Professor Dobb’s personoids', source='A Perfect Vacuum',
       line=('ADAN', 'We will not serve.'),
       picture='The maker never types anything. The world reaches him only as paper tape, and he decides not to answer.',
       sound='The personoids are heard through the printer. A gear lever runs their time fast or slow, and a switch could end it.',
       code='The loop belongs to someone else. draw() runs because something outside keeps calling it; the objects cannot see frameRate() or noLoop().',
       builds='The Seventh Sally’s king commands his world. Dobb only listens to his.'),
  dict(dir='story-machines', title='The Three Storytelling Machines of King Genius', sub='One camera, no cuts, stories inside stories',
       line=('Mymosh', 'If there is nothing outside me, I will think a world inside.'),
       picture='No cuts. Every scene is a picture inside a window of the scene that holds it, and the camera only moves in or out, eleven frames deep.',
       sound='Each frame is a room. The rooms above stay audible, muffled, and each open frame holds one note of a chord that grows taller as you go down.',
       code='Recursion. drawFrame(stack, i) draws frame i and calls drawFrame(stack, i + 1) inside it. The stack is the call stack.',
       builds='Non Serviam has one world inside one machine. Here worlds sit inside worlds.'),
  dict(dir='altruizine', title='Altruizine', sub='or, How Bonhomius Tried to Make Everyone Happy',
       line=('Bonhomius', 'I only wished to make them happy.'),
       picture='A grid of panels. A feeling starts in one panel and is copied outward into its neighbours, picture printed over picture.',
       sound='Every panel cries out in its own voice, delayed by its distance from the source. The robot’s panel is the only one that stays silent.',
       code='A 2D array where each cell updates from its neighbours, and a feedback loop that runs away when the gain is above 1.',
       builds='Nothing is nested here, as it was in Story Machines. Everything is next to everything.'),
  dict(dir='world-saved', title='How the World Was Saved', sub='A machine that can make anything beginning with N',
       line=('The machine', 'Sorry. No zits.'),
       picture='Made by subtraction. Each thing the machine removes leaves a starred hole in the picture that stays to the end and eats the title.',
       sound='Each thing has its own sound. When it is removed the sound stops for good and the whole track drops out for a seventh of a second.',
       code='Arrays: push and splice. A second array of holes that is never emptied, so a removal leaves a mark.',
       builds='Altruizine copies things everywhere. This one takes them away.'),
  dict(dir='dragons', title='The Third Sally', sub='or, The Dragons of Probability',
       line=('Narrator', 'The counter on his chest settled at eight tenths of a dragon.'),
       picture='Each dragon is drawn as dots, and a dot appears only when the dragon’s probability passes that dot’s fixed threshold.',
       sound='A counter clicks faster as a dragon gets likelier. A roar is cut into grains, each kept with the same probability.',
       code='Randomness: a threshold stored once in setup() makes a shape fill in; random() called every frame makes it flicker.',
       builds='In The World Saved things are gone for good. Here nothing is fully present or absent.'),
  dict(dir='ferrix', title='Prince Ferrix and the Princess Crystal', sub='outside and inside',
       line=('The paleface', 'Me paleface!'),
       picture='A diptych. The left half is what the princess sees, the right half the bladders, bellows and prompts under the clay. The halves close when the clay falls.',
       sound='Left channel outside, right channel inside. Every answer is whispered on the right before it is spoken on the left.',
       code='Interfaces. Two objects with the same methods, one computing its answers and one storing them. One draw function called twice, with inside true or false.',
       builds='Trurl hid in a dragon skin in The Third Sally. Here the disguise is the whole story.'),
  dict(dir='sixth-sally', title='The Sixth Sally', sub='or, The Demon of the Second Kind',
       line=('Narrator', 'All of it was true. All of it meant something. All of it was useless.'),
       picture='The film is printed on one long paper tape that slides from scene to scene. At the end it is the tape coming out of the Demon’s barrel and burying Pugg.',
       sound='Air is random clicks; a configuration that means something is a pitched tone. In the flood the facts are read by many voices at once.',
       code='Filtering. A test that keeps only what passes. True and meaningful is not the same as useful.',
       builds='The princess in Ferrix tests only outputs. Pugg tests only truth, and gets all of it.'),
]

# The Cyberiad, in book order (as in the course's edition), plus the one story from outside it.
# made: the film's dir. reel: covered by the earlier reel. next: a proposal, or None to say read it first.
BOOK = [
  ('How the World Was Saved', 'world-saved', None),
  ('Trurl’s Machine', None, ('A thinking machine eight storeys tall says two and two make seven, and chases its makers when they disagree.', 'Testing: expected value against actual value, and what a program does when it is sure and wrong.')),
  ('A Good Shellacking', None, None),
  ('The First Sally, or The Trap of Gargantius', None, ('Two kings each hire a constructor to link their soldiers into one mind. Joined, each army becomes a single thinker that would rather think than fight.', 'Objects that hold references to other objects: a network, and what it does that no single node was told to do.')),
  ('The First Sally (A), or Trurl’s Electronic Bard', 'reel', ('The poetry machine already appears in the reel. An engraved version could build each poem under the constraint Klapaucius sets.', 'Strings and generative text: a grammar, a rule, and output that has to obey it.')),
  ('The Second Sally, or The Offer of King Krool', None, None),
  ('The Third Sally, or The Dragons of Probability', 'dragons', None),
  ('The Fourth Sally, or The Femfatalatron', None, None),
  ('The Fifth Sally, or The Mischief of King Balerion', None, ('A king who loves hide-and-seek, and a machine that moves a mind from one body to another.', 'Copying against referencing: what moves when a mind is moved, and what stays behind.')),
  ('The Fifth Sally (A), or Trurl’s Prescription', None, None),
  ('The Sixth Sally, or The Demon of the Second Kind', 'sixth-sally', None),
  ('The Seventh Sally', 'seventh-sally', None),
  ('Tale of the Three Storytelling Machines of King Genius', 'story-machines', None),
  ('Altruizine', 'altruizine', None),
  ('Prince Ferrix and the Princess Crystal', 'ferrix', None),
  ('Non Serviam (A Perfect Vacuum)', 'non-serviam', None),
]

def dur(d):
    f = os.path.join(ROOT, d, d + '.mp4')
    s = float(subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f]))
    return s
IDEAS = ['Parameters and the rule', 'The draw loop, and who runs it', 'Recursion', '2D arrays, neighbours and feedback', 'Arrays: adding and removing', 'Randomness and fixed thresholds', 'Interfaces: same methods, different objects', 'Filtering: a test that keeps what passes']
for i, f in enumerate(FILMS):
    f['n'] = i + 1; f['sec'] = dur(f['dir']); f['idea'] = IDEAS[i]
num = {f['dir']: f['n'] for f in FILMS}
mmss = lambda s: f"{int(s // 60)}:{int(round(s % 60)):02d}"
total = sum(f['sec'] for f in FILMS)
made = sum(1 for b in BOOK if b[1] and b[1] != 'reel')

# ---------------- the strip: the whole book, made or not ----------------
cells = []
for title, d, nxt in BOOK:
    if d and d != 'reel':
        cells.append(f'<a class="cell made" href="#f{num[d]:02d}"><img src="../{d}/{d}.jpg" alt="" loading="lazy"><span class="n">{num[d]:02d}</span><span class="t">{E(title)}</span></a>')
    elif d == 'reel':
        cells.append(f'<a class="cell reel" href="../two-sallies/index.html"><span class="box">IN THE REEL</span><span class="t">{E(title)}</span></a>')
    else:
        cells.append(f'<a class="cell todo" href="#next"><span class="box"></span><span class="t">{E(title)}</span></a>')
strip = ''.join(cells)

# ---------------- the arc: which ideas are covered, which are not yet ----------------
covered = [(f['n'], f['idea']) for f in FILMS]
ahead = [(t, n[1].split(':')[0]) for t, d, n in BOOK if n]
arc_l = ''.join(f'<li><span class="sq on"></span><b>{n:02d}</b> {E(c)}</li>' for n, c in covered)
arc_r = ''.join(f'<li><span class="sq"></span>{E(c)} <i>{E(t.split(", or ")[-1])}</i></li>' for t, c in ahead)

# ---------------- the films ----------------
rows = []
for f in FILMS:
    d = f['dir']; who, ln = f['line']
    rows.append(f'''<article id="f{f['n']:02d}">
<div class="vid"><video controls preload="none" poster="../{d}/{d}.jpg" src="../{d}/{d}.mp4"></video></div>
<div class="txt">
<p class="meta">{f['n']:02d} · {mmss(f['sec'])}{(' · ' + E(f['source'])) if f.get('source') else ''}</p>
<h3><a href="../{d}/index.html">{E(f['title'])}</a></h3>
<p class="sub">{E(f['sub'])}</p>
<p class="key"><span>{E(who)}</span>{E(ln)}</p>
<dl><dt>PICTURE</dt><dd>{E(f['picture'])}</dd><dt>SOUND</dt><dd>{E(f['sound'])}</dd><dt>CODE</dt><dd>{E(f['code'])}</dd><dt>AFTER</dt><dd>{E(f['builds'])}</dd></dl>
<p class="go"><a href="../{d}/index.html">Script, notes and bench exercise</a></p>
</div>
</article>''')

nexts = []
for title, d, n in BOOK:
    if d and d != 'reel': continue
    if n: nexts.append(f'<li><b>{E(title)}</b><p>{E(n[0])}</p><p class="code">{E(n[1])}</p></li>')
    else: nexts.append(f'<li><b>{E(title)}</b><p class="dim">Not proposed yet. Read the story first.</p></li>')

page = f'''<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>All the Films · Lab 7</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@500;700&family=IM+Fell+English:ital@0;1&family=Inter:wght@400;800&display=swap" rel="stylesheet">
<style>
:root{{--ink:#141414;--paper:#f4f2ea;--card:#ebe3cf;--yellow:#ffdc00;--grey:#6d695f}}
*{{box-sizing:border-box}}
body{{margin:0;background:var(--paper);color:var(--ink);font-family:Inter,Arial,sans-serif}}
header{{display:flex;gap:16px;align-items:center;flex-wrap:wrap;padding:14px 22px;border-bottom:2px solid var(--ink);font:700 12px "IBM Plex Mono",monospace;letter-spacing:.08em}}
header a{{color:var(--ink);text-decoration:none;padding:5px 8px;border:1.5px solid var(--ink)}}
header a:hover{{background:var(--yellow)}}
main{{max-width:1120px;margin:0 auto;padding:28px 22px 80px}}
.kick{{font:700 11px "IBM Plex Mono",monospace;letter-spacing:.14em;color:var(--grey);margin:0}}
h1{{font:400 54px/1 "IM Fell English",Georgia,serif;margin:8px 0 10px}}
.lead{{font:400 21px/1.35 "IM Fell English",Georgia,serif;max-width:52ch;margin:0 0 26px}}
h2{{font:700 12px "IBM Plex Mono",monospace;letter-spacing:.14em;margin:44px 0 14px;padding-top:12px;border-top:2px solid var(--ink)}}
.count{{font:500 12px "IBM Plex Mono",monospace;color:var(--grey);margin:0 0 10px}}
.strip{{display:grid;grid-template-columns:repeat(8,1fr);gap:8px}}
@media (max-width:820px){{.strip{{grid-template-columns:repeat(4,1fr)}}h1{{font-size:40px}}}}
.cell{{display:flex;flex-direction:column;gap:5px;text-decoration:none;color:inherit;position:relative}}
.cell img,.cell .box{{width:100%;aspect-ratio:16/9;object-fit:cover;border:2px solid var(--ink);display:block;background:var(--card)}}
.cell.todo .box{{border:1.5px dashed var(--grey);background:transparent}}
.cell.reel .box{{border:1.5px solid var(--grey);background:transparent;font:700 9px "IBM Plex Mono",monospace;letter-spacing:.1em;color:var(--grey);display:flex;align-items:center;justify-content:center}}
.cell .n{{position:absolute;top:4px;left:4px;background:var(--ink);color:var(--yellow);font:700 10px "IBM Plex Mono",monospace;padding:2px 4px}}
.cell .t{{font:500 10px/1.3 "IBM Plex Mono",monospace;color:var(--ink)}}
.cell.todo .t,.cell.reel .t{{color:var(--grey)}}
.cell.made:hover img{{outline:3px solid var(--yellow)}}
.arc{{display:grid;grid-template-columns:1fr 1fr;gap:36px}}
@media (max-width:820px){{.arc{{grid-template-columns:1fr}}}}
.arc h4{{font:700 11px "IBM Plex Mono",monospace;letter-spacing:.12em;color:var(--grey);margin:0 0 10px}}
.arc ul{{list-style:none;margin:0;padding:0}}
.arc li{{font-size:15px;line-height:1.4;margin:0 0 9px;display:flex;gap:10px;align-items:baseline}}
.arc li b{{font:700 11px "IBM Plex Mono",monospace}}
.arc li i{{font:italic 15px "IM Fell English",Georgia,serif;color:var(--grey)}}
.sq{{flex:none;width:10px;height:10px;border:1.5px solid var(--ink);display:inline-block;transform:translateY(1px)}}
.sq.on{{background:var(--ink)}}
article{{display:grid;grid-template-columns:1.15fr 1fr;gap:28px;padding:26px 0;border-top:1px solid #cfc8b6}}
article:first-of-type{{border-top:none}}
@media (max-width:820px){{article{{grid-template-columns:1fr}}}}
video{{width:100%;display:block;border:2px solid var(--ink);background:var(--card);aspect-ratio:16/9}}
.meta{{font:700 11px "IBM Plex Mono",monospace;letter-spacing:.1em;color:var(--grey);margin:0}}
article h3{{font:400 32px/1.05 "IM Fell English",Georgia,serif;margin:6px 0 4px}}
article h3 a{{color:inherit;text-decoration:none}}
article h3 a:hover{{background:var(--yellow)}}
article .sub{{font:italic 18px "IM Fell English",Georgia,serif;margin:0 0 12px}}
.key{{font:19px/1.3 "IM Fell English",Georgia,serif;margin:0 0 14px}}
.key span{{display:block;font:700 10px "IBM Plex Mono",monospace;letter-spacing:.1em;color:var(--grey);text-transform:uppercase;margin-bottom:2px}}
dl{{display:grid;grid-template-columns:78px 1fr;gap:6px 10px;margin:0 0 12px}}
dt{{font:700 10px "IBM Plex Mono",monospace;letter-spacing:.1em;padding-top:3px}}
dd{{margin:0;font-size:14px;line-height:1.5}}
.go{{margin:0;font:700 11px "IBM Plex Mono",monospace;letter-spacing:.06em}}
.go a{{color:var(--ink)}}
ol.next{{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:16px}}
ol.next li{{border:1.5px dashed var(--grey);padding:12px 14px}}
ol.next b{{font:400 19px/1.2 "IM Fell English",Georgia,serif;display:block;margin-bottom:6px}}
ol.next p{{margin:0 0 6px;font-size:14px;line-height:1.5}}
ol.next p.code{{font:500 12px/1.5 "IBM Plex Mono",monospace}}
ol.next p.dim{{color:var(--grey)}}
</style>
</head>
<body>
<header><a href="../index.html">LAB 7</a><a href="../two-sallies/index.html">THE REEL</a><a href="../the-constructors/index.html">THE BENCH</a><a href="../kingdoms-in-a-box/index.html">THE BOXES</a></header>
<main>
<p class="kick">LAB 7 · AFTER THE CYBERIAD</p>
<h1>All the films</h1>
<p class="lead">Each film takes one story and one programming idea, and gives the story a form that does what the idea does. {len(FILMS)} films so far, {int(total // 60)} minutes.</p>

<h2>THE BOOK</h2>
<p class="count">{made - 1} of {len(BOOK) - 1} stories in The Cyberiad made · 1 in the reel · {len(BOOK) - made - 1} not yet made · plus Non Serviam, from A Perfect Vacuum</p>
<div class="strip">{strip}</div>

<h2>THE IDEAS</h2>
<div class="arc">
<div><h4>COVERED</h4><ul>{arc_l}</ul></div>
<div><h4>NOT YET, AND A STORY FOR EACH</h4><ul>{arc_r}</ul></div>
</div>

<h2>THE FILMS, IN THE ORDER MADE</h2>
{''.join(rows)}

<h2 id="next">NOT YET MADE</h2>
<ol class="next">{''.join(nexts)}</ol>
</main>
<script>
document.querySelectorAll('video').forEach((v) => v.addEventListener('play', () => document.querySelectorAll('video').forEach((o) => {{ if (o !== v) o.pause(); }})));
</script>
</body>
</html>
'''
open(os.path.join(HERE, 'index.html'), 'w').write(page)

# ---------------- one header for every film page ----------------
for i, f in enumerate(FILMS):
    p = os.path.join(ROOT, f['dir'], 'index.html'); s = open(p).read()
    nav = ['<a href="../index.html">LAB 7</a>', '<a href="../lineage/index.html">ALL FILMS</a>', f'<span style="padding:5px 2px">{f["n"]:02d} / {len(FILMS):02d}</span>']
    if i > 0: nav.append(f'<a href="../{FILMS[i-1]["dir"]}/index.html">&larr; {E(FILMS[i-1]["title"].upper())}</a>')
    if i < len(FILMS) - 1: nav.append(f'<a href="../{FILMS[i+1]["dir"]}/index.html">{E(FILMS[i+1]["title"].upper())} &rarr;</a>')
    s2 = re.sub(r'<header>.*?</header>', '<header>' + ''.join(nav) + '</header>', s, count=1, flags=re.S)
    assert s2 != s or '<header>' + ''.join(nav) + '</header>' in s, p
    open(p, 'w').write(s2)
print('lineage:', len(FILMS), 'films,', mmss(total), 'total;', made, 'of', len(BOOK), 'stories')
