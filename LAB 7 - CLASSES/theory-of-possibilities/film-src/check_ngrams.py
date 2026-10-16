# Checks every spoken line (say and show) and the page texts in tp2.js against the essay for any shared run of N words.
# python3 check_ngrams.py /path/to/wc-plain.txt [N=6]
import json, os, re, subprocess, sys
src = open(sys.argv[1], encoding='utf-8').read(); N = int(sys.argv[2]) if len(sys.argv) > 2 else 6
tok = lambda s: re.findall(r"[a-z0-9]+", s.lower().replace('’', "'"))
st = tok(src); grams = {tuple(st[i:i + N]) for i in range(len(st) - N + 1)}
data = json.loads(subprocess.check_output(['node', '-e', "console.log(JSON.stringify(require('./script.js')))"]))
texts = [(s['shot'], t) for s in data['SCRIPT'] for l in s.get('lines', []) for t in {l['say'], l.get('show', l['say'])}]
if os.path.exists('tp2.js'):
    js = open('tp2.js', encoding='utf-8').read()
    texts += [('page', m) for m in re.findall(r"'((?:[^'\\]|\\.){20,})'", js)]
hits = 0
for where, t in texts:
    w = tok(t)
    for i in range(len(w) - N + 1):
        if tuple(w[i:i + N]) in grams: hits += 1; print(f'HIT [{where}]', ' '.join(w[i:i + N]), '|', t[:70])
print('lines checked', len(texts), 'hits', hits)
