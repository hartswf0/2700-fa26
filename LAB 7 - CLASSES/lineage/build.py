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
  dict(dir='gargantius', title='The Trap of Gargantius', sub='two kings, one wire, and an army that thinks', source='The First Sally',
       line=('Klapaucius', 'An army that is its own leader. That is the plan.'),
       picture='A graph drawn in ink. A soldier is a node and a connection is a line between two nodes. It grows from two beads joined by a thread to a platoon, two armies, and two giants whose bones are the links. At the end flowers cover the border.',
       sound='Every connection is a click pitched by how many nodes are already linked, so the clicks climb a scale as the ranks close. The soldiers think as many voices that start apart and end as one.',
       code='Objects that hold references to other objects. A network does things no single node was told to do, and a connection cannot be undone one node at a time.',
       builds='Filtering in The Sixth Sally keeps one thing out of many. Here many things are joined into one. It was first the opening section of the Two Sallies reel.'),
  dict(dir='electronic-bard', title='Trurl’s Electronic Bard', sub='a horn that learns to speak', source='The First Sally (A)',
       line=('The Bard', 'you are the basis I was written in.'),
       picture='The machine is a horn. Each poem is projected from it as a small film in a window in the frame. Before the repairs the window shows static and wrong pictures, and each part Trurl installs removes one kind of damage.',
       sound='The voice runs through a chain Trurl rebuilds with each repair: tinny and stuttering at first, then warm with brass resonances. On the asteroid it becomes radio static with verses in it.',
       code='Strings and generative text. A grammar and a constraint, such as every word beginning with the same letter, and output that has to obey them.',
       builds='The Demon in The Sixth Sally selects meaning from noise. The Bard produces it on request, and the question is whether anyone can tell the difference. It was first sections II and III of the Two Sallies reel.'),
  dict(dir='trurls-prescription', title='Trurl’s Prescription', sub='an office that shrinks what it cannot fight', source='The Fifth Sally (A)',
       line=('Trurl', 'Once it took delivery of the first notice, it belonged to the paperwork.'),
       picture='The thing that lands on the machine is an ink drawing at the top of the frame, and its size is the only readout. Each weapon is bigger and it stays the same size. Then an office is drawn piece by piece underneath it while it shrinks to a damp spot.',
       sound='Force is blasts followed by silence. The office is a rhythm of typing, stamps, paper and footsteps that speeds up and thickens, while the hum of the thing drops in pitch and level as it shrinks.',
       code='State. An object keeps what it has already accepted, and its behavior afterward depends on that.',
       builds='The Electronic Bard obeys a rule it is given. Here the thing is beaten by getting it to accept a rule, and Trurl throws the rules out so they cannot be used on the Steelypips.'),
  dict(dir='mischief-of-balerion', title='The Mischief of King Balerion', sub='a mind that moves, and a rule it has to keep', source='The Fifth Sally',
       line=('Trurl', 'The finest place to hide a thing was the king himself, and no one ever looks inside a king.'),
       picture='Every body is an ink figure in its own costume, and every mind is a mark over the head: a die, a gear, a star, an anchor, a badge, a bird. When the horns strike, the marks fly across and change heads. The king, a sailor, a policeman and finally a cuckoo clock are all the same mind, moved.',
       sound='Each mind has its own voice, and the voice goes with the mind, not the body. Every swap is the same two-note exchange, left to right and back. A heavy low hum plays whenever the horns are in someone’s hands, and a ticking turns into the cuckoo at the end.',
       code='Copying against referencing. Swapping two references takes a third variable, and a body only holds what it points to. The horns are a third object that someone has to be holding.',
       builds='The Trap of Gargantius links many soldiers by reference. Trurl’s Prescription is an object that keeps what it has accepted. Here the object is handed from body to body, and the plot is about who is holding what.'),
  dict(dir='femfatalatron', title='The Femfatalatron', sub='a machine turned all the way up, and a war fought with babies', source='The Fourth Sally',
       line=('Trurl', 'Every dial measured the prince. The trouble was never inside the prince.'),
       picture='The machine is a temple of cables, screens, rose petals and perfume, with a glass case of dials in front: power, efficiency, and the rapturometer. In the first half the dials are the main picture, and every needle climbs to its stop without changing the prince. In the second half the same kind of dial hangs on the Emperor’s wall as an economy gauge, and it sinks while soft parachuting bundles land and crawl.',
       sound='A hum that rises with the needles, a chatter that becomes a rattle at the stops, and breaking glass when the rapturometer bursts; the iron machine is lower and fails the same way. Then cauldrons, coos, cushioned cannon thumps and a growing chorus of babble, and at the end the hum winds down to nothing.',
       code='Measurement. A gauge reads only the variable it is wired to; turning every input to its maximum does nothing if the result depends on a variable none of them touch.',
       builds='Trurl’s Prescription beats a thing by changing what it has accepted. The Mischief of King Balerion moves a mind between bodies. Here nothing inside the prince moves at all, and the plot turns when Trurl changes the world around him instead.'),
  dict(dir='trurls-machine', title='Trurl’s Machine', sub='a machine that is sure, and wrong', source='Trurl’s Machine',
       line=('Klapaucius', 'My friend, you set out to build one machine, and you built a different one.'),
       picture='Trurl chalks the expected answer on a slate, 2 + 2 = 4, and the machine answers by lighting the windows of its eight floors in the shape of a 7. The chalk and the lit numeral side by side come back after every repair and never agree. The machine counts its insults in the same numerals and skips 7, then walks out of its foundations, through a town, and seals its makers in a cave behind a riveted steel wall until a boulder breaks it.',
       sound='The same racket of thinking, the same length every time, before every wrong answer, and every answer delivered the same way. Outside the cave the voice is muffled through steel; Trurl shouts four while the machine pounds the cliff, and its last seven is almost nothing.',
       code='Testing. An expected value is set beside an actual value; a test does not fix the program, it only shows where the program disagrees with what it should do.',
       builds='The Femfatalatron measures the wrong variable. Here the measurement is right and the program refuses it. Like Trurl’s Prescription, the machine keeps what it has accepted, and nothing done to it afterward changes the answer.'),
  dict(dir='good-shellacking', title='A Good Shellacking', sub='two Trurls, and no way to tell which is which', source='A Good Shellacking',
       line=('Klapaucius', 'Because you are not the real Trurl.'),
       picture='Every Trurl in the film is drawn by the same routine and speaks with the same voice, so the picture never settles which Trurl was in the cellar. The wish machine hands each item out of a door in its belly.',
       sound='Each item from the wish machine gets a chime. The cellar is clangs that echo under one lamp, then snoring and a gallop in the dark. The medal fanfare goes flat and the blinds come down.',
       code='Equality against identity. Two objects can be equal in every field and still be two objects, and nothing you can read from the outside says which one is the original.',
       builds='In The Mischief of King Balerion one body holds different minds. Here two bodies look and sound the same, and the question is whether they are the same one.'),
  dict(dir='offer-of-krool', title='The Offer of King Krool', sub='a beast that is all brain, and a king who cannot catch it', source='The Second Sally',
       line=('The Beast', 'It is my turn to make demands.'),
       picture='The beast is never drawn as one creature with organs. It is a few hundred small weedy marks that move as one: a low hill of dry grass with eyes. Cut off its head and the marks grow another; cut it in two and there are two, with the old head running between them; chop it fine and the pieces gather again. On paper first, the King and the beast fight across a page of equations while the pencils snap. In the air the same marks become three policemen, and then a green gig with THINK on the back.',
       sound='Krool paces the whole of the skull hall, one booming boot at a time on a silver floor. The beast is a swarm of small clicks that rises when it splits and settles when it rejoins. The paper battle has its own little percussion score, the sealed wagon rings by itself after a counted fourteen and a half seconds, and the tooth radio crackles before the beast blows away as wind.',
       code='Distributed control. There is no single part that holds the brain, so there is nothing to smash; and a program keeps the authority you gave it, even when its authors ask for the King back.',
       builds='The Trap of Gargantius joins many parts into one mind and watches what that mind decides on its own. Here the constructors build such a mind on purpose and find it has its own demands. Like Trurl’s Electronic Bard, it is a machine that does exactly what it was written to do, which is not the same as what its makers want.'),
]

# The Cyberiad, in book order (as in the course's edition), plus the one story from outside it.
# made: the film's dir. reel: covered by the earlier reel. next: a proposal, or None to say read it first.
BOOK = [
  ('How the World Was Saved', 'world-saved', None),
  ('Trurl’s Machine', 'trurls-machine', None),
  ('A Good Shellacking', 'good-shellacking', None),
  ('The First Sally, or The Trap of Gargantius', 'gargantius', ('Two kings each hire a constructor to link their soldiers into one mind. Joined, each army becomes a single thinker that would rather think than fight.', 'Objects that hold references to other objects: a network, and what it does that no single node was told to do.')),
  ('The First Sally (A), or Trurl’s Electronic Bard', 'electronic-bard', ('The poetry machine already appears in the reel. An engraved version could build each poem under the constraint Klapaucius sets.', 'Strings and generative text: a grammar, a rule, and output that has to obey it.')),
  ('The Second Sally, or The Offer of King Krool', 'offer-of-krool', None),
  ('The Third Sally, or The Dragons of Probability', 'dragons', None),
  ('The Fourth Sally, or The Femfatalatron', 'femfatalatron', None),
  ('The Fifth Sally, or The Mischief of King Balerion', 'mischief-of-balerion', None),
  ('The Fifth Sally (A), or Trurl’s Prescription', 'trurls-prescription', None),
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
IDEAS = ['Parameters and the rule', 'The draw loop, and who runs it', 'Recursion', '2D arrays, neighbours and feedback', 'Arrays: adding and removing', 'Randomness and fixed thresholds', 'Interfaces: same methods, different objects', 'Filtering: a test that keeps what passes', 'Objects that hold references to other objects', 'Strings and generative text', 'State: what an object has already accepted', 'Copying against referencing: what moves when a mind is moved', 'Measurement: a gauge reads only what it was built to read', 'Testing: expected value against actual value', 'Equality against identity: two objects alike in every field', 'Distributed control: no single part holds the brain']
for i, f in enumerate(FILMS):
    f['n'] = i + 1; f['sec'] = dur(f['dir']); f['idea'] = IDEAS[i]
num = {f['dir']: f['n'] for f in FILMS}
mmss = lambda s: f"{int(s // 60)}:{int(round(s % 60)):02d}"
total = sum(f['sec'] for f in FILMS)
made = sum(1 for b in BOOK if b[1] and not b[1].startswith('reel'))


# ---------------- the videotext: data for the contents page and the reader ----------------
TIMING = {'seventh-sally': 'sally', 'non-serviam': 'ns', 'story-machines': 'sm', 'altruizine': 'al', 'world-saved': 'ws', 'dragons': 'dr', 'ferrix': 'fx', 'sixth-sally': 'ps', 'gargantius': 'gg', 'electronic-bard': 'eb', 'trurls-prescription': 'tp', 'mischief-of-balerion': 'mb', 'femfatalatron': 'ff', 'trurls-machine': 'tm', 'good-shellacking': 'gs', 'offer-of-krool': 'kk'}
films = {}
for f in FILMS:
    d = f['dir']; T = json.load(open(os.path.join(ROOT, d, 'film-src', 'timing', TIMING[d] + '.json')))
    cast = T.get('cast', {}); shots = T.get('shots') or T.get('chapters')
    scenes = []
    for sh in shots:
        ls = [dict(t0=round(sh['t0'] + l['t0'], 2), t1=round(sh['t0'] + l['t1'], 2), who='' if l['who'] == 'N' else cast.get(l['who'], {}).get('name', l['who']), say=l['say'], f=bool(l.get('line'))) for l in sh.get('lines', [])]
        for fc in sh.get('facts', []):
            ls.append(dict(t0=round(sh['t0'] + fc['t0'], 2), t1=round(sh['t0'] + fc['t1'], 2), who='', say=T['facts'][fc['i']], tape=True))
        ls.sort(key=lambda x: x['t0'])
        if ls: scenes.append(ls)
    films[d] = dict(title=f['title'], sub=f['sub'], n=f['n'], dur=round(f['sec'], 2), idea=f['idea'], video=f'../{d}/{d}.mp4', poster=f'../{d}/{d}.jpg', page=f'../{d}/index.html',
                    picture=f['picture'], sound=f['sound'], code=f['code'], after=f['builds'], scenes=scenes)
# the two chapters filmed inside the Two Sallies reel (261.75 s): where each sits in it
REEL = {'reel:click': dict(sec='I. The Click', t0=1.75, t1=19.75, poster='../two-sallies/click.jpg', note='Soldiers close ranks until their separate bodies make one thinking body.'),
        'reel:bard': dict(sec='II. The Warm-Up and III. The Commissions', t0=19.75, t1=257.77, poster='../two-sallies/bard.jpg', note='An engine is repaired until it speaks, then answers seven commissions with seven poems.')}
book = []
for title, d, nxt in BOOK:
    if title.startswith('The First Sally, or'): book.append(dict(part='The Seven Sallies of Trurl and Klapaucius'))
    if title.startswith('Non Serviam'): book.append(dict(part='From A Perfect Vacuum')); title = 'Non Serviam'
    if title.startswith('Tale of'): book.append(dict(part='Tales'))
    e = dict(title=title)
    if d and d.startswith('reel'): e['reel'] = REEL[d]
    elif d:
        e['slug'] = d
        if d in ('gargantius', 'electronic-bard'): e['legacy'] = True
    elif nxt: e['next'] = 'not yet filmed · could carry: ' + nxt[1].split(':')[0].lower()
    book.append(e)
# the three experiments (the course's grouping). Each item is a substring of a BOOK title.
EXPERIMENTS = [
  ('EXPERIMENT I', 'When Words Operate', 'Investigate how descriptions become actions, creative artifacts, or enforceable rules.',
   ['How the World Was Saved', 'Prescription', 'Electronic Bard']),
  ('EXPERIMENT II', 'When Models Become Worlds', 'Investigate how textual specifications generate coherent worlds, possible entities, and nested realities.',
   ['The Seventh Sally', 'Dragons of Probability', 'Three Storytelling Machines']),
  ('EXPERIMENT III', 'When Description Exceeds Understanding', 'Investigate information overload, collective interactions, and consequences not reducible to individual instructions.',
   ['Demon of the Second Kind', 'Altruizine', 'Trap of Gargantius']),
]
ents = [(t, e) for (t, _, _), e in zip([b for b in BOOK], [x for x in book if 'part' not in x])]
def find(key):
    m = [e for t, e in ents if key in t]; assert len(m) == 1, key; return m[0]
groups = []; used = set()
for lab, ttl, blurb, keys in EXPERIMENTS:
    its = [find(k) for k in keys]; used.update(id(i) for i in its)
    groups.append(dict(label=lab, title=ttl, blurb=blurb, items=its))
also = [e for t, e in ents if e.get('slug') and id(e) not in used]; used.update(id(i) for i in also)
groups.append(dict(label='ALSO FILMED', title='', blurb='Chapters filmed that the three experiments do not name.', items=also))
rest = [e for t, e in ents if id(e) not in used]
groups.append(dict(label='ELSEWHERE IN THE BOOK', title='', blurb='Not yet filmed.', items=rest))
data = json.dumps(dict(book=book, groups=groups, films=films, course='INTRO TO COMPUTATIONAL MEDIA'), ensure_ascii=False, separators=(',', ':'))
page = open(os.path.join(HERE, 'template.html')).read().replace('/*DATA*/null', data)
total = sum(f['sec'] for f in FILMS)
made = sum(1 for b in BOOK if b[1] and not b[1].startswith('reel'))
open(os.path.join(HERE, 'index.html'), 'w').write(page)

# ---------------- the Cyberiad page: a cinema, every film in book order ----------------
# Works from a plain folder or drive: no fetch, no server, fonts and films by relative path.
byd = {f['dir']: f for f in FILMS}
BOOK_PLUS = list(BOOK) + [('A History of Bitic Literature', 'bitic-literature', None)]
reel, part = [], ''
for title, d, nxt in BOOK_PLUS:
    if title.startswith('How the World'): part = 'Three Early Stories'
    if title.startswith('The First Sally, or'): part = 'The Seven Sallies'
    if title.startswith('Tale of'): part = 'Tales'
    if title.startswith('Non Serviam'): part = 'From A Perfect Vacuum'; title = 'Non Serviam'
    if title.startswith('A History of Bitic'): part = 'From Imaginary Magnitude'
    f = byd.get(d)
    if f and os.path.exists(os.path.join(ROOT, d, d + '.mp4')):
        reel.append(dict(d=d, t=title, s='' if f['sub'].lower().startswith('or,') else f['sub'], p=part, n=round(f['sec'])))
tot = sum(r['n'] for r in reel)
hm = lambda s: (f"{int(s // 3600)} hr {int(s % 3600 // 60)} min" if s >= 3600 else f"{int(s // 60)} min")
groups = []
for i, r in enumerate(reel):
    if not groups or groups[-1][0] != r['p']: groups.append((r['p'], []))
    groups[-1][1].append(f'<li><button data-i="{i}"><span class="no">{i+1:02d}</span><span class="tt">{E(r["t"])}</span><span class="du">{mmss(r["n"])}</span></button></li>')
rows = ''.join(f'<li class="grp"><p class="pt">{E(p)}</p><ul>{"".join(items)}</ul></li>' for p, items in groups)
cy = """<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>The Cyberiad</title>
<style>
@font-face{font-family:"IM Fell English";src:url(../kingdoms-in-a-box/film-src/fonts/im-fell-english-latin-400-normal.woff2) format("woff2");font-style:normal;font-display:swap}
@font-face{font-family:"IM Fell English";src:url(../kingdoms-in-a-box/film-src/fonts/im-fell-english-latin-400-italic.woff2) format("woff2");font-style:italic;font-display:swap}
@font-face{font-family:"IBM Plex Mono";src:url(../kingdoms-in-a-box/film-src/fonts/ibm-plex-mono-latin-400-normal.woff2) format("woff2");font-weight:400 500;font-display:swap}
:root{--dark:#13110e;--paper:#ebe3cf;--soft:#9b917d;--faint:#5a5246}
*{box-sizing:border-box}
html,body{margin:0;height:100%;background:var(--dark);color:var(--paper);font:19px/1.5 "IM Fell English",Georgia,serif;-webkit-font-smoothing:antialiased;overflow:hidden}
button{font:inherit;color:inherit;background:none;border:0;padding:0;cursor:pointer;text-align:left}
.screen{position:fixed;inset:0;display:flex;align-items:center;justify-content:center;transition:opacity 1.2s ease}
.screen.off{opacity:0;pointer-events:none}
video{width:100%;height:100%;object-fit:contain;background:var(--dark);display:block}
.card{flex-direction:column;text-align:center;padding:24px;background:var(--dark);z-index:3}
.title h1{font-weight:400;font-size:clamp(44px,9vw,120px);letter-spacing:.08em;line-height:1;margin:0 0 .25em;text-transform:uppercase}
.title .by{font-style:italic;font-size:clamp(18px,2.4vw,26px);color:var(--soft);margin:0 0 2.2em}
.title .intro{max-width:34em;margin:0 auto 2.4em;font-size:clamp(16px,1.9vw,20px);line-height:1.6}
.title .intro p{margin:0 0 .8em}
.begin{display:inline-flex;flex-direction:column;align-items:center;gap:12px;text-align:center}
.begin .ring{width:76px;height:76px;border:1.5px solid var(--paper);border-radius:50%;display:flex;align-items:center;justify-content:center;transition:background .2s}
.begin .ring:after{content:"";border-left:20px solid var(--paper);border-top:13px solid transparent;border-bottom:13px solid transparent;margin-left:6px;transition:border-color .2s}
.begin:hover .ring{background:var(--paper)}.begin:hover .ring:after{border-left-color:var(--dark)}
.begin span{font:500 12px "IBM Plex Mono",monospace;letter-spacing:.18em;color:var(--soft)}
.title .meta{position:absolute;bottom:28px;left:0;right:0;font:500 11px "IBM Plex Mono",monospace;letter-spacing:.16em;color:var(--faint)}
.inter .pt{font:500 12px "IBM Plex Mono",monospace;letter-spacing:.3em;color:var(--soft);margin:0 0 22px}
.inter .nm{font-size:clamp(30px,5vw,58px);letter-spacing:.06em;text-transform:uppercase;margin:0}
.end h2{font-weight:400;font-size:clamp(36px,6vw,72px);letter-spacing:.12em;margin:0 0 .6em}
.end p{color:var(--soft);font-style:italic;margin:0 auto .5em;max-width:40em}
.end .again{margin-top:2em}
.end a{color:var(--soft)}
.bar{position:fixed;left:0;right:0;bottom:0;z-index:4;padding:28px 26px 18px;display:flex;align-items:center;gap:18px;background:linear-gradient(transparent,rgba(19,17,14,.85));transition:opacity .5s}
.bar.hide{opacity:0;pointer-events:none}
.bar .now{flex:1;min-width:0}
.bar .now b{font-weight:400;font-size:19px;display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.bar .now i{font-size:15px;color:var(--soft)}
.bar .k{font:500 12px "IBM Plex Mono",monospace;letter-spacing:.08em;color:var(--soft)}
.bar button.ic{font:500 12px "IBM Plex Mono",monospace;letter-spacing:.12em;color:var(--paper);padding:6px 4px;opacity:.8}
.bar button.ic:hover{opacity:1;text-decoration:underline;text-underline-offset:4px}
.prog{position:fixed;left:0;right:0;bottom:0;height:2px;z-index:5;background:rgba(235,227,207,.12)}
.prog i{display:block;height:100%;width:0;background:var(--paper);opacity:.55}
.list{position:fixed;inset:0;z-index:6;background:rgba(19,17,14,.96);overflow:auto;padding:60px 26px;transition:opacity .4s}
.list.off{opacity:0;pointer-events:none}
.list ol{list-style:none;margin:0 auto;padding:0;max-width:1000px;columns:2 340px;column-gap:56px}
.list .grp{break-inside:avoid;margin:0 0 26px}
.list ul{list-style:none;margin:0;padding:0}
.list .pt{font:500 11px "IBM Plex Mono",monospace;letter-spacing:.16em;text-transform:uppercase;color:var(--soft);margin:0 0 6px}
.list li button{display:flex;gap:12px;width:100%;padding:4px 0;align-items:baseline}
.list .no{font:500 12px "IBM Plex Mono",monospace;color:var(--faint);width:22px;flex:none}
.list .tt{flex:1}
.list .du{font:500 12px "IBM Plex Mono",monospace;color:var(--faint)}
.list li button:hover .tt{text-decoration:underline;text-underline-offset:3px;text-decoration-thickness:1px}
.list li button.on .tt{font-style:italic}.list li button.on .no{color:var(--paper)}
.list .close{position:fixed;top:20px;right:26px;font:500 12px "IBM Plex Mono",monospace;letter-spacing:.12em;color:var(--soft)}
body.idle{cursor:none}
@media (max-width:640px){.keys{display:none}.bar{flex-wrap:wrap;gap:10px}.bar .now{flex-basis:100%}}
</style>
</head>
<body class="">
<div class="screen" id="stage"><video id="v" playsinline preload="auto"></video></div>

<div class="screen card title" id="title">
  <h1>The Cyberiad</h1>
  <p class="by">Stanis&lstrok;aw Lem, filmed</p>
  <div class="intro">
    <p>Two constructors, Trurl and Klapaucius, build machines for kings and for each other. Every machine does exactly what it was built to do, and that is where each story begins.</p>
    <p>These are Lem&rsquo;s stories in the order his book prints them, drawn in ink and played one after another, with __EXTRA__ at the end from his books about imaginary books.</p>
  </div>
  <button class="begin" id="begin"><div class="ring"></div><span>BEGIN</span></button>
  <p class="meta">__N__ FILMS &middot; __HM__<span class="keys"> &middot; F FOR FULL SCREEN &middot; C FOR CONTENTS</span></p>
</div>

<div class="screen card inter off" id="inter"><p class="pt" id="ip"></p><p class="nm" id="in"></p></div>

<div class="screen card end off" id="end">
  <h2>THE END</h2>
  <p>After Stanis&lstrok;aw Lem, <i>The Cyberiad</i>, translated by Michael Kandel, with <i>Non Serviam</i> from <i>A Perfect Vacuum</i>__BITIC__.</p>
  <p>Narration and dialogue paraphrase Lem. Drawn in ink in the browser, voiced with Kokoro, the sound made in code.</p>
  <p class="again"><button class="begin" id="again"><div class="ring"></div><span>FROM THE BEGINNING</span></button></p>
  <p style="margin-top:2em;font-style:normal"><a href="../index.html">Lab 7</a> &middot; <a href="../lineage/index.html">The videotext</a></p>
</div>

<div class="bar hide" id="bar">
  <div class="now"><b id="nt"></b><i id="ns"></i></div>
  <span class="k" id="nk"></span>
  <button class="ic" id="prev">PREV</button><button class="ic" id="pp">PAUSE</button><button class="ic" id="next">NEXT</button>
  <button class="ic" id="ct">CONTENTS</button><button class="ic" id="fs">FULL SCREEN</button>
</div>
<div class="prog"><i id="pb"></i></div>

<div class="list off" id="list"><button class="close" id="lx">CLOSE</button><ol>__ROWS__</ol></div>

<script>
const R = __DATA__;
const $ = (id) => document.getElementById(id);
const v = $('v'), btns = [...document.querySelectorAll('#list button[data-i]')];
const TOT = R.reduce((a, r) => a + r.n, 0), BEFORE = R.map((_, i) => R.slice(0, i).reduce((a, r) => a + r.n, 0));
let cur = -1, started = false, timer = 0;
const show = (el, on) => el.classList.toggle('off', !on);
function setNow() {
  const r = R[cur]; $('nt').textContent = r.t; $('ns').textContent = r.s; $('nk').textContent = String(cur + 1).padStart(2, '0') + ' / ' + R.length;
  btns.forEach((b, j) => b.classList.toggle('on', j === cur));
  try { history.replaceState(null, '', '#' + r.d); } catch (e) {}
}
function go(i, withInter) {
  cur = Math.max(0, Math.min(R.length - 1, i)); const r = R[cur];
  v.pause(); v.src = '../' + r.d + '/' + r.d + '.mp4'; setNow();
  const newPart = withInter && (cur === 0 || R[cur - 1].p !== r.p);
  if (newPart) {
    const parts = [...new Set(R.map((x) => x.p))], pi = parts.indexOf(r.p); $('ip').textContent = 'PART ' + ['I','II','III','IV','V','VI'][pi]; $('in').textContent = r.p; show($('inter'), true);
    setTimeout(() => { show($('inter'), false); v.play().catch(() => {}); }, 3800);
  } else v.play().catch(() => {});
}
v.addEventListener('ended', () => { if (cur < R.length - 1) go(cur + 1, true); else { show($('end'), true); $('bar').classList.add('hide'); } });
v.addEventListener('timeupdate', () => { if (cur >= 0) $('pb').style.width = (100 * (BEFORE[cur] + v.currentTime) / TOT) + '%'; });
v.addEventListener('play', () => { $('pp').textContent = 'PAUSE'; });
v.addEventListener('pause', () => { $('pp').textContent = 'PLAY'; });
v.addEventListener('click', () => { v.paused ? v.play() : v.pause(); poke(); });
function begin(i) { started = true; show($('title'), false); show($('end'), false); go(i, true); fullscreen(true); }
$('begin').addEventListener('click', () => begin(cur > 0 ? cur : 0));
$('again').addEventListener('click', () => begin(0));
$('prev').addEventListener('click', () => go(cur - 1, false));
$('next').addEventListener('click', () => go(cur + 1, true));
$('pp').addEventListener('click', () => { v.paused ? v.play() : v.pause(); });
$('ct').addEventListener('click', () => show($('list'), true));
$('lx').addEventListener('click', () => show($('list'), false));
$('fs').addEventListener('click', () => fullscreen(!document.fullscreenElement));
btns.forEach((b, j) => b.addEventListener('click', () => { show($('list'), false); if (!started) { started = true; show($('title'), false); } show($('end'), false); go(j, true); }));
function fullscreen(on) { try { if (on && !document.fullscreenElement) document.documentElement.requestFullscreen().catch(() => {}); else if (!on && document.fullscreenElement) document.exitFullscreen(); } catch (e) {} }
function poke() { if (!started) return; $('bar').classList.remove('hide'); document.body.classList.remove('idle'); clearTimeout(timer); timer = setTimeout(() => { if (!v.paused) { $('bar').classList.add('hide'); document.body.classList.add('idle'); } }, 2600); }
document.addEventListener('mousemove', poke); document.addEventListener('touchstart', poke);
document.addEventListener('keydown', (e) => {
  const k = e.key.toLowerCase();
  if (k === ' ') { e.preventDefault(); if (!started) begin(0); else v.paused ? v.play() : v.pause(); }
  else if (k === 'f') fullscreen(!document.fullscreenElement);
  else if (k === 'c') show($('list'), $('list').classList.contains('off'));
  else if (k === 'escape') show($('list'), false);
  else if (k === 'arrowright' && e.shiftKey) go(cur + 1, true);
  else if (k === 'arrowleft' && e.shiftKey) go(cur - 1, false);
  poke();
});
const h = location.hash.slice(1), hi = R.findIndex((r) => r.d === h);
cur = hi < 0 ? 0 : hi; setNow();
</script>
</body>
</html>
"""
cy = cy.replace('__DATA__', json.dumps(reel, ensure_ascii=False)).replace('__ROWS__', rows).replace('__BITIC__', ' and <i>A History of Bitic Literature</i> from <i>Imaginary Magnitude</i>' if any(r['d'] == 'bitic-literature' for r in reel) else '').replace('__EXTRA__', 'two pieces' if any(r['d'] == 'bitic-literature' for r in reel) else 'one piece').replace('__N__', str(len(reel)).upper()).replace('__HM__', hm(tot).upper())
open(os.path.join(ROOT, 'cyberiad', 'index.html'), 'w', encoding='utf-8').write(cy)

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
