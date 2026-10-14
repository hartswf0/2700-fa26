"""Voice and timing for the Kingdoms in a Box films.
   python3 build_voice.py [id ...]   ->  timing/<id>.json and audio/<id>.m4a"""
import json, os, subprocess, sys, wave
import numpy as np
from espeak import say

HERE = os.path.dirname(os.path.abspath(__file__))
data = json.loads(subprocess.check_output(['node', '-e', """
const fs=require('fs');const vm=require('vm');const c={module:{}};vm.createContext(c);
vm.runInContext(fs.readFileSync('../worlds.js','utf8')+';this.WORLDS=WORLDS;',c);
vm.runInContext(fs.readFileSync('films.js','utf8')+';this.FILMS=FILMS;this.CLOSING=CLOSING;',c);
console.log(JSON.stringify({films:c.FILMS,worlds:c.WORLDS.map(w=>({id:w.id,no:w.no,title:w.title,aphorism:w.aphorism,aphRef:w.aphRef,source:w.source})),closing:c.CLOSING}));
"""], cwd=HERE))
VOICES = {'N': dict(voice='en-gb+m3', rate=148, pitch=38, rng=38), 'A': dict(voice='en-gb+m3', rate=122, pitch=32, rng=30), 'K': dict(voice='en-gb+m1', rate=132, pitch=20, rng=28)}

def trim(a, sr):
    nz = np.nonzero(np.abs(a) > 160)[0]
    if len(nz) == 0: return a[:1]
    return a[max(0, nz[0] - int(.02 * sr)): nz[-1] + int(.08 * sr)]

def build(wid):
    film = data['films'][wid]; w = next(x for x in data['worlds'] if x['id'] == wid)
    beats = [dict(shot='title', d=3.4)]
    for b in film['beats']:
        b = dict(b)
        if b['shot'] == 'aphorism': b['say'] = w['aphorism']; b['voice'] = 'A'
        elif b['shot'] == 'doubt': b['voice'] = 'K'
        else: b['voice'] = 'N'
        beats.append(b)
    beats.append(dict(shot='end', d=3.8))
    clips = []; t = 0.0; sr = None
    for b in beats:
        b['t0'] = round(t, 3)
        if b.get('say'):
            v = VOICES[b['voice']]
            a, sr, _ = say(b['say'], voice=v['voice'], rate=v['rate'], pitch=v['pitch'], rng=v['rng'])
            a = trim(a, sr); dur = len(a) / sr
            lead = 0.6 if b['shot'] == 'aphorism' else 0.5
            clips.append((t + lead, a))
            b['vt0'] = round(t + lead, 3); b['vt1'] = round(t + lead + dur, 3)
            b['d'] = round(lead + dur + (1.5 if b['shot'] == 'aphorism' else 0.9) + b.get('hold', 0), 3)
        t += b['d']
    total = round(t, 3)
    track = np.zeros(int((total + 1) * sr), np.float32)
    for st, a in clips:
        i = int(st * sr); track[i:i + len(a)] += a.astype(np.float32) / 32768
    track = np.clip(track * 0.95, -1, 1)
    raw = os.path.join(HERE, 'audio', wid + '.wav')
    with wave.open(raw, 'wb') as f:
        f.setnchannels(1); f.setsampwidth(2); f.setframerate(sr); f.writeframes((track * 32767).astype(np.int16).tobytes())
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', raw, '-af', 'highpass=f=90,lowpass=f=7000,aecho=0.8:0.5:35:0.18,loudnorm=I=-17:TP=-2', '-ar', '44100', '-ac', '2', '-c:a', 'aac', '-b:a', '128k', os.path.join(HERE, 'audio', wid + '.m4a')], check=True)
    os.remove(raw)
    json.dump(dict(id=wid, world=w, closing=data['closing'], seed=film.get('seed', 1), beats=beats, dur=total), open(os.path.join(HERE, 'timing', wid + '.json'), 'w'), indent=1)
    print(wid, total, 's,', len(beats), 'beats')

for wid in (sys.argv[1:] or list(data['films'].keys())):
    build(wid)
