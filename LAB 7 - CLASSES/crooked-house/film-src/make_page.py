# Builds ../index.html from the Good Shellacking page shell, timing/KEY.json and notes.html.
import json, os, re, html
KEY, DIR = 'ch', 'crooked-house'
TITLE, SUB = 'And He Built a Crooked House', 'an eight-room house built as an unfolded tesseract, folded up by an earthquake'
TITLES = {'what': 'WHAT IS A HOUSE', 'model': 'TOOTHPICKS AND CLAY', 'unfold': 'THE CROSS', 'build': 'THE EARTHQUAKE', 'inside': 'THE STAIRS', 'window': 'FOUR ROOMS AWAY', 'study': 'THE STUDY', 'quake': 'THE SECOND SHOCK', 'gone': 'THE LOT'}
H = os.path.dirname(os.path.abspath(__file__)); R = os.path.dirname(H)
T = json.load(open(os.path.join(H, 'timing', KEY + '.json')))
shell = open(os.path.join(R, '..', 'good-shellacking', 'index.html'), encoding='utf-8').read()
esc = lambda s: html.escape(s, quote=False).replace('’', '&rsquo;')
cast = T['cast']; nm = lambda w: cast.get(w, {}).get('name', w)
lines, script = [], []
for sh in T['shots']:
    if not sh.get('lines'): continue
    if TITLES.get(sh['shot']): script.append(f"<h3>{TITLES[sh['shot']]}{' &middot; ' + sh['clock'] if sh.get('clock') else ''}</h3>")
    for l in sh['lines']:
        say = l.get('show') or l['say']; cls = ' class=fulcrum' if l.get('line') else ''
        script.append(f"<p{cls}><b>{esc(nm(l['who']))}.</b> {esc(say)}</p>")
        if l.get('line'): lines.append(f"<li><span>{esc(nm(l['who']))}</span>{esc(say)}</li>")
n = len(lines); words = {6: 'SIX', 7: 'SEVEN', 8: 'EIGHT', 9: 'NINE', 10: 'TEN', 11: 'ELEVEN', 12: 'TWELVE'}.get(n, str(n))
notes = open(os.path.join(H, 'notes.html'), encoding='utf-8').read().replace('{MP4}', DIR + '.mp4')
note = f'<section class="note">\n<h2>{words} LINES</h2>\n<ol class="lines">{"".join(lines)}</ol>\n{notes}\n</section>\n<section class="script"><h2>THE SCRIPT</h2>{"".join(script)}</section>'
out = shell
out = re.sub(r'<title>.*?</title>', f'<title>{TITLE} &middot; Lab 7</title>', out, 1, re.S)
out = re.sub(r'<header>.*?</header>', '<header><a href="../index.html">LAB 7</a><a href="../lineage/index.html">ALL FILMS</a></header>', out, 1, re.S)
out = re.sub(r'<h1>.*?</h1>', f'<h1>{TITLE}</h1>', out, 1, re.S)
out = re.sub(r'<p class="sub">.*?</p>', f'<p class="sub">{SUB}</p>', out, 1, re.S)
out = out.replace('good-shellacking.jpg', DIR + '.jpg').replace('good-shellacking.mp4', DIR + '.mp4')
out = re.sub(r'<div class="cols">.*?</main>', '<div class="cols">\n' + note.replace('\\', '\\\\') + '\n</div>\n</main>', out, 1, re.S)
open(os.path.join(R, 'index.html'), 'w', encoding='utf-8').write(out)
print('ok', n, 'fulcrum lines')
