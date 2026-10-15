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


# ---------------- the videotext: data for the contents page and the reader ----------------
TIMING = {'seventh-sally': 'sally', 'non-serviam': 'ns', 'story-machines': 'sm', 'altruizine': 'al', 'world-saved': 'ws', 'dragons': 'dr', 'ferrix': 'fx', 'sixth-sally': 'ps'}
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
book = []
for title, d, nxt in BOOK:
    if title.startswith('The First Sally, or'): book.append(dict(part='The Seven Sallies of Trurl and Klapaucius'))
    if title.startswith('Non Serviam'): book.append(dict(part='From A Perfect Vacuum')); title = 'Non Serviam'
    if title.startswith('Tale of'): book.append(dict(part='Tales'))
    e = dict(title=title)
    if d == 'reel': e['reel'] = True
    elif d: e['slug'] = d
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
made = sum(1 for b in BOOK if b[1] and b[1] != 'reel')
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
