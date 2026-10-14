"""Voice and timing for The Seventh Sally.
   python3 build_voice.py  ->  timing/sally.json and audio/sally.m4a"""
import json, os, subprocess, wave
import numpy as np
from espeak import say

HERE = os.path.dirname(os.path.abspath(__file__))
beats = json.loads(subprocess.check_output(['node', '-e', "console.log(JSON.stringify(require('./script.js')))"], cwd=HERE))
VOICES = {'N': dict(voice='en-gb+m3', rate=146, pitch=38, rng=36),
          'T': dict(voice='en-gb+m3', rate=152, pitch=56, rng=44),
          'K': dict(voice='en-gb+m1', rate=130, pitch=22, rng=26)}

def trim(a, sr):
    nz = np.nonzero(np.abs(a) > 160)[0]
    if len(nz) == 0: return a[:1]
    return a[max(0, nz[0] - int(.02 * sr)): nz[-1] + int(.08 * sr)]

clips = []; t = 0.0; sr = 22050; prev = None
for b in beats:
    b['t0'] = round(t, 3)
    b.setdefault('voice', 'N')
    if b.get('say'):
        v = VOICES[b['voice']]
        a, sr, _ = say(b['say'], voice=v['voice'], rate=v['rate'], pitch=v['pitch'], rng=v['rng'])
        a = trim(a, sr); dur = len(a) / sr
        lead = 0.35 if b['shot'] == prev else 0.9
        clips.append((t + lead, a))
        b['vt0'] = round(t + lead, 3); b['vt1'] = round(t + lead + dur, 3)
        b['d'] = round(lead + dur + 0.8 + b.get('hold', 0), 3)
    prev = b['shot']
    t += b['d']
total = round(t, 3)
track = np.zeros(int((total + 1) * sr), np.float32)
for st, a in clips:
    i = int(st * sr); track[i:i + len(a)] += a.astype(np.float32) / 32768
track = np.clip(track * 0.95, -1, 1)
raw = os.path.join(HERE, 'audio', 'sally.wav')
with wave.open(raw, 'wb') as f:
    f.setnchannels(1); f.setsampwidth(2); f.setframerate(sr); f.writeframes((track * 32767).astype(np.int16).tobytes())
subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', raw, '-af', 'highpass=f=90,lowpass=f=7000,aecho=0.8:0.5:35:0.18,loudnorm=I=-17:TP=-2',
                '-ar', '44100', '-ac', '2', '-c:a', 'aac', '-b:a', '128k', os.path.join(HERE, 'audio', 'sally.m4a')], check=True)
os.remove(raw)
json.dump(dict(beats=beats, dur=total), open(os.path.join(HERE, 'timing', 'sally.json'), 'w'), indent=1)
print('sally', total, 's,', len(beats), 'beats')
