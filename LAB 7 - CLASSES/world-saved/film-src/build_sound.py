"""Voices, sound and music for How the World Was Saved.
   python3 build_sound.py  ->  timing/ws.json and audio/ws.m4a
   Voices: Kokoro (kokoro-onnx), model files in $KOKORO_DIR (default ~/kokoro).
   Everything else is synthesized here, timed from the same score the picture reads."""
import hashlib, json, os, subprocess, wave
import numpy as np
from scipy.signal import butter, sosfilt, fftconvolve, resample_poly

HERE = os.path.dirname(os.path.abspath(__file__))
KDIR = os.environ.get('KOKORO_DIR', os.path.expanduser('~/kokoro'))
SR = 48000
rng = np.random.default_rng(7)
data = json.loads(subprocess.check_output(['node', '-e', "console.log(JSON.stringify(require('./script.js')))"], cwd=HERE))
SCRIPT, CAST, THINGS = data['SCRIPT'], data['CAST'], data['THINGS']

# ---------------- voices ----------------
_k = None
def kokoro():
    global _k
    if _k is None:
        from kokoro_onnx import Kokoro
        _k = Kokoro(os.path.join(KDIR, 'kokoro-v1.0.onnx'), os.path.join(KDIR, 'voices-v1.0.bin'))
    return _k

def speak(text, voice, speed):
    os.makedirs(os.path.join(HERE, 'voice-cache'), exist_ok=True)
    key = hashlib.md5(f'{voice}|{speed}|{text}'.encode()).hexdigest()[:16]
    p = os.path.join(HERE, 'voice-cache', key + '.npy')
    if os.path.exists(p): return np.load(p)
    lang = 'en-gb' if voice.startswith('b') else 'en-us'
    a, sr = kokoro().create(text, voice=voice, speed=speed, lang=lang)
    a = resample_poly(a.astype(np.float64), SR, sr)
    nz = np.nonzero(np.abs(a) > 0.01)[0]
    a = a[max(0, nz[0] - int(0.03 * SR)): nz[-1] + int(0.12 * SR)] if len(nz) else a[:1]
    np.save(p, a.astype(np.float32)); return a

# ---------------- dsp ----------------
def filt(x, kind, f, order=2):
    sos = butter(order, f, btype=kind, fs=SR, output='sos'); return sosfilt(sos, x)
def env_decay(n, tau): return np.exp(-np.arange(n) / SR / tau)
def noise(n): return rng.standard_normal(n)
def brown(n):
    b = np.cumsum(noise(n)); b = filt(b, 'highpass', 15); return b / (np.abs(b).max() + 1e-9)
IRS = {}
def ir(rt):
    if rt not in IRS:
        n = int(rt * SR); t = np.arange(n) / SR
        IRS[rt] = [filt(noise(n), 'lowpass', 5200) * np.exp(-6.9 * t / rt) for _ in range(2)]
        for k in range(2): IRS[rt][k][: int(0.012 * SR)] *= np.linspace(0, 1, int(0.012 * SR))
    return IRS[rt]
def verb(x, rt, wet):
    a, b = ir(rt); s = np.sqrt(np.sum(a * a))
    return [x * (1 - wet) + wet * fftconvolve(x, a)[: len(x)] / s * 0.9, x * (1 - wet) + wet * fftconvolve(x, b)[: len(x)] / s * 0.9]
def vary_rate(x, rate):
    """read x with a time-varying playback rate (tape speed)"""
    pos = np.cumsum(rate); pos = pos[pos < len(x) - 1]
    i = pos.astype(int); f = pos - i
    return x[i] * (1 - f) + x[i + 1] * f

total_guess = 320
L = np.zeros(int(total_guess * SR)); Rr = np.zeros_like(L)
def put(t, sig, gain=1.0, pan=0.0, st=None):
    i = int(t * SR)
    if i < 0: sig = sig[-i:]; i = 0
    n = min(len(sig), len(L) - i)
    if n <= 0: return
    gl, gr = gain * np.sqrt((1 - pan) / 2) * 1.414, gain * np.sqrt((1 + pan) / 2) * 1.414
    if st is not None: L[i:i + n] += st[0][:n] * gl; Rr[i:i + n] += st[1][:n] * gr
    else: L[i:i + n] += sig[:n] * gl; Rr[i:i + n] += sig[:n] * gr
def putv(t, sig, rt, wet, gain=1.0, pan=0.0):
    pad = np.concatenate([sig, np.zeros(int(rt * SR))]); put(t, pad, gain, pan, st=verb(pad, rt, wet))

# ---------------- instruments ----------------
def mnote(m): return 440 * 2 ** ((m - 69) / 12)
def mbox(f, dur=1.8):
    n = int(dur * SR); t = np.arange(n) / SR
    s = np.sin(2 * np.pi * f * t) * np.exp(-t / 1.0) + 0.3 * np.sin(2 * np.pi * 2.0 * f * t) * np.exp(-t / 0.35) + 0.22 * np.sin(2 * np.pi * 4.18 * f * t) * np.exp(-t / 0.12) + 0.1 * np.sin(2 * np.pi * 6.3 * f * t) * np.exp(-t / 0.05)
    c = int(0.004 * SR); s[:c] += filt(noise(c), 'highpass', 3000) * 0.25
    return s * 0.5
def bell(f, dur=6.0):
    n = int(dur * SR); t = np.arange(n) / SR; s = np.zeros(n)
    for r, a, d in [(0.5, 0.55, 4.5), (1, 1, 3.2), (1.19, 0.5, 2.2), (1.5, 0.35, 1.8), (2, 0.4, 1.4), (2.52, 0.2, 0.9), (3, 0.16, 0.7), (4.1, 0.08, 0.4)]:
        s += a * np.sin(2 * np.pi * f * r * t * (1 + 0.0012 * rng.standard_normal())) * np.exp(-t / d)
    s[: int(0.003 * SR)] *= np.linspace(0, 1, int(0.003 * SR)); return s * 0.28
MOTIF = [(76, 1), (79, 1), (81, 1), (79, 2), (76, 1), (74, 1), (72, 1), (74, 2), (76, 1), (77, 1), (76, 1), (74, 1), (71, 1), (72, 3)]
def motif_times(t0, beat):
    out = []; t = t0
    for m, b in MOTIF: out.append((t, m)); t += b * beat
    return out, t
def click(f0=2500, n=0.006, q=1.0):
    k = int(n * SR); s = filt(noise(k), 'bandpass', [f0 * 0.6, min(f0 * 1.6, 20000)]) * np.linspace(1, 0, k) ** 2; return s * q
def thock(f=180, d=0.03):
    n = int(d * SR); t = np.arange(n) / SR; return np.sin(2 * np.pi * f * t) * np.exp(-t / (d / 4))
def ping(f, d):
    n = int(d * SR); t = np.arange(n) / SR; return np.sin(2 * np.pi * f * t) * np.exp(-t / (d / 5))

def mx(*xs):
    n = max(len(x) for x in xs); o = np.zeros(n)
    for x in xs: o[:len(x)] += x
    return o

# ---------------- murmur: the citizens, built from many small voices ----------------
MUR_LINES = ['that is not nature', 'my book disproves yours', 'read the appendix', 'heresy', 'burn it', 'I object', 'nature is a machine', 'nature is a garden', 'subpoena', 'the evidence is clear', 'nonsense', 'footnote seven']
MUR_VOICES = ['af_bella', 'am_adam', 'bf_alice', 'bm_daniel', 'af_nicole', 'am_eric', 'bf_isabella', 'am_liam', 'af_river', 'bm_fable']
def murmur(seconds, density=7, pitch=1.0):
    n = int(seconds * SR); out = np.zeros(n)
    for j in range(int(seconds * density)):
        v = MUR_VOICES[j % len(MUR_VOICES)]; s = speak(MUR_LINES[(j * 5) % len(MUR_LINES)], v, 1.0)
        if pitch != 1.0: s = resample_poly(s, 100, int(100 * pitch))
        i = int(rng.uniform(0, max(1, n - len(s))))
        out[i:i + len(s)] += s[: n - i] * rng.uniform(0.25, 0.6)
    out = filt(out, 'lowpass', 2600); out = filt(out, 'highpass', 180); return out / (np.abs(out).max() + 1e-9)

def fx(a, kind):
    if kind == 'machine':
        t = np.arange(len(a)) / SR; ring = a * (0.75 + 0.25 * np.sin(2 * np.pi * 47 * t))
        d = int(0.0029 * SR); out = ring.copy()
        for k in range(1, 4): out[k * d:] += ring[:-k * d] * (0.4 ** k)
        return filt(out, 'highpass', 120) * 0.85
    return a
ROOM = {'shop': (0.7, 0.13), 'yard': (0.5, 0.08)}
PAN = {'T': -0.3, 'K': 0.05, 'M': 0.35, 'N': 0}

# ---------------- timing pass ----------------
shots = []; t = 0.0; MAKE = {}
for s in SCRIPT:
    sh = dict(shot=s['shot'], t0=round(t, 3), cues=[dict(c) for c in s.get('cues', [])], lines=[], room=s.get('room'))
    cur = 0.0
    for ln in s.get('lines', []):
        c = CAST[ln['who']]; sp = c['speed'] * (0.94 if ln.get('line') else 1.0)
        a = speak(ln['say'], c['voice'], sp)
        if c.get('fx'): a = fx(a, c['fx'])
        st = ln['at'] if 'at' in ln else cur + ln.get('pre', 0.6); d = len(a) / SR
        hop = SR // 24; envl = [float(np.sqrt(np.mean(a[i:i + hop] ** 2))) for i in range(0, len(a), hop)]
        emax = max(envl) or 1; envl = [round(min(1, (v / emax) ** 0.7), 2) for v in envl]
        sh['lines'].append(dict(who=ln['who'], say=ln['say'], t0=round(st, 3), t1=round(st + d, 3), line=bool(ln.get('line')), env=envl, _a=a))
        ks = [ln.get(k) for k in ('make', 'make2', 'make3') if ln.get(k)]
        for j, k in enumerate(ks):  # each thing appears as its word ends
            MAKE[k] = round(sh['t0'] + st + d * (j + 1) / len(ks) - 0.05, 3)
        cur = st + d
    sh['d'] = round(s['d'] if 'd' in s else cur + s.get('tail', 1.5), 3)
    for c in sh['cues']:
        if c['k'] == 'anti' and c['at'] < 0: c['at'] = round(sh['lines'][2]['t1'] + 0.4, 3)
    shots.append(sh); t += sh['d']
TOTAL = round(t, 3)
L = L[: int((TOTAL + 3) * SR)]; Rr = Rr[: len(L)]
def S(n): return next(x for x in shots if x['shot'] == n)
def C(sh, k): return [c for c in sh['cues'] if c['k'] == k]
un = S('unmake'); REMOVE = {c['what']: round(un['t0'] + c['at'], 3) for c in C(un, 'remove')}
HALT = un['t0'] + C(un, 'halt')[0]['at']
for k in THINGS:
    MAKE.setdefault(k, 0.0)
NT = len(L); tt = np.arange(NT) / SR

# ---------------- where creature sounds can be heard: the shop shots only ----------------
present = np.zeros(NT)
for sh in shots:
    if sh['room'] == 'shop' or sh['shot'] == 'title': i0, i1 = int(sh['t0'] * SR), int((sh['t0'] + sh['d']) * SR); present[i0:i1] = 1
present = filt(present, 'lowpass', 3)
def life(k):  # 1 while the thing exists, cut dead at removal
    g = np.zeros(NT); a, b = int(MAKE[k] * SR), int(REMOVE[k] * SR); g[a:b] = 1; return g * present

# ---------------- the sound of each thing ----------------
def events(k, rate, fn, gain, pan=(-0.8, 0.8)):
    t_ = MAKE[k] + rng.uniform(0, 1 / rate)
    while t_ < REMOVE[k]:
        i = int(t_ * SR); s_ = fn()
        n = min(len(s_), int((REMOVE[k] - t_) * SR))
        if n > 0: put(t_, s_[:n] * present[i], gain, rng.uniform(*pan))
        t_ += rng.exponential(1 / rate)
def tone(f, d, a=0.01, r=None):
    n = int(d * SR); tk = np.arange(n) / SR; env = np.minimum(1, tk / a) * np.exp(-tk / (r or d / 3)); return np.sin(2 * np.pi * f * tk) * env
# zits: bright twinkles
events('zits', 4.0, lambda: mx(tone(rng.uniform(3200, 6400), 0.5, 0.002, 0.12), tone(rng.uniform(6400, 9000), 0.3, 0.002, 0.05) * 0.4), 0.07, (-0.9, 0.9))
# worches: a glorious chord on the horizon
w = np.zeros(NT)
for f, a in [(220, 0.3), (277.2, 0.25), (329.6, 0.25), (440, 0.15), (554.4, 0.1), (659.3, 0.08)]: w += a * np.sin(2 * np.pi * f * tt * (1 + 0.003 * np.sin(2 * np.pi * 5.1 * tt + f)))
put(0, w * life('worches') * (0.7 + 0.3 * np.sin(2 * np.pi * 0.07 * tt)), 0.022, 0)
# pritons: chirps
def chirp():
    n = int(0.12 * SR); tk = np.arange(n) / SR; f = 2400 + 1400 * np.sin(np.pi * tk / tk[-1]); return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.hanning(n)
events('pritons', 2.2, lambda: mx(chirp(), np.concatenate([np.zeros(int(0.15 * SR)), chirp()])), 0.06, (-0.7, 0.7))
# gruncheons: grunts
events('gruncheons', 0.9, lambda: filt(noise(int(0.3 * SR)), 'bandpass', [140, 420]) * np.hanning(int(0.3 * SR)) ** 0.6, 0.18, (-0.5, 0.1))
# targalisks: ratchets
events('targalisks', 0.6, lambda: mx(*[np.concatenate([np.zeros(int(j * 0.035 * SR)), click(1800, 0.008)]) for j in range(7)]), 0.18, (-0.8, -0.2))
# shupops: pops
events('shupops', 1.6, lambda: mx(tone(rng.uniform(500, 900), 0.08, 0.001, 0.02), click(2500, 0.003)), 0.16, (0.3, 0.9))
# calinatifacts: wooden knocks in a slow pattern
events('calinatifacts', 1.1, lambda: mx(tone(rng.choice([420, 560, 630]), 0.25, 0.001, 0.05), click(900, 0.01)), 0.14, (-0.2, 0.6))
# thists: hiss
put(0, filt(noise(NT), 'bandpass', [4000, 9000]) * (0.5 + 0.5 * np.sin(2 * np.pi * 0.23 * tt) ** 2) * life('thists'), 0.012, -0.4)
# brashations: brass swells
def brass():
    n = int(1.6 * SR); tk = np.arange(n) / SR; f = rng.choice([146.8, 174.6, 196]); s_ = sum(np.sin(2 * np.pi * f * h * tk) / h for h in range(1, 8)); return s_ * np.abs(np.sin(np.pi * tk / tk[-1])) ** 1.5
events('brashations', 0.3, brass, 0.05, (-0.5, 0.5))
# plusters: soft puffs
events('plusters', 0.8, lambda: filt(noise(int(0.4 * SR)), 'lowpass', 800) * np.hanning(int(0.4 * SR)), 0.08, (-0.9, 0.9))
# laries: whistle glides
def glide():
    n = int(0.9 * SR); tk = np.arange(n) / SR; f = 900 + 700 * np.sin(np.pi * tk / tk[-1] * 1.2); return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.hanning(n)
events('laries', 0.5, glide, 0.05, (-0.9, 0.9))
# the n-things: each sounds once, as it is made
NSND = {'needles': lambda: mx(*[np.concatenate([np.zeros(int(j * 0.05 * SR)), ping(rng.uniform(4000, 6000), 0.15)]) for j in range(5)]),
        'nails': lambda: mx(*[np.concatenate([np.zeros(int(j * 0.07 * SR)), mx(click(2500, 0.01), ping(rng.uniform(2200, 3200), 0.2))]) for j in range(6)]),
        'nankeen': lambda: filt(noise(int(0.6 * SR)), 'bandpass', [1500, 5000]) * np.hanning(int(0.6 * SR)),
        'nut': lambda: mx(thock(300, 0.05), click(1200, 0.02)), 'nest': lambda: filt(noise(int(0.5 * SR)), 'bandpass', [2000, 6000]) * np.hanning(int(0.5 * SR)) * (np.random.default_rng(2).random(int(0.5 * SR)) > 0.8),
        'nautilus': lambda: mx(tone(880, 1.4, 0.01, 0.6), tone(1320, 1.0, 0.01, 0.3) * 0.5), 'newt': lambda: filt(noise(int(0.25 * SR)), 'bandpass', [800, 2500]) * np.hanning(int(0.25 * SR)),
        'nettle': lambda: filt(noise(int(0.7 * SR)), 'bandpass', [3000, 8000]) * np.hanning(int(0.7 * SR))}
for k, fn in NSND.items():
    put(MAKE[k] - 0.15, mx(filt(noise(int(0.25 * SR)), 'highpass', 2000) * np.linspace(0, 1, int(0.25 * SR)) ** 2), 0.12, 0.3)
    put(MAKE[k], fn(), 0.4, 0.3)
put(MAKE['night'] - 0.2, mx(*[tone(f, 4.0, 0.6, 1.6) * 0.3 for f in [110, 164.8, 220]]), 0.25, 0.2)
for k in THINGS: assert k in REMOVE, k

# ---------------- the machine, the shots ----------------
for sh in shots:
    t0, d, name = sh['t0'], sh['d'], sh['shot']; n = int(d * SR); tl = np.arange(n) / SR
    fade = np.minimum(1, np.minimum(tl / 0.4, (d - tl) / 0.4)).clip(0, 1)
    if sh['room'] == 'shop':
        on = 1.0 if name != 'unmake' else 1.0
        hum = 0.5 * np.sin(2 * np.pi * 50 * tl) + 0.25 * np.sin(2 * np.pi * 100 * tl) + filt(noise(n), 'lowpass', 300) * 0.3
        if name == 'unmake': hum *= 1 + 1.5 * np.clip((tl - 0.5) / 20, 0, 1) * (tl < C(sh, 'halt')[0]['at'])
        if name in ('after', 'leave'): hum *= 0.4
        put(t0, hum * fade, 0.03, 0.35)
    if name == 'title':
        for tn, m in motif_times(t0 + 0.6, 0.34)[0][:9]: put(tn, mbox(mnote(m)), 0.3, 0.1)
    if name == 'nature':
        mu = murmur(d + 2, 9); put(t0, mu[:n] * fade, 0.3, 0)
        for j in range(int(d * 2)): put(t0 + rng.uniform(0, d), filt(noise(int(0.3 * SR)), 'bandpass', [1500, 6000]) * np.hanning(int(0.3 * SR)), 0.06, rng.uniform(-0.9, 0.9))
        fire = filt(noise(n), 'bandpass', [400, 3000]) * (np.random.default_rng(5).random(n) > 0.996) * 3 + filt(brown(n), 'lowpass', 200) * 0.5
        put(t0, fire * fade, 0.05, -0.5)
        for tb in (2.0, 7.5): put(t0 + tb, filt(brown(int(3 * SR)), 'lowpass', 140) * env_decay(int(3 * SR), 0.9), 0.5, 0.2)
    if name == 'negative':
        a = C(sh, 'anti')[0]['at']; seq = np.zeros(int(9 * SR))
        for tn, m in motif_times(0, 0.5)[0]:
            i = int(tn * SR); b = mbox(mnote(m - 12), 2.0)
            if i + len(b) < len(seq): seq[i:i + len(b)] += b
        put(t0 + a, seq[::-1], 0.35, -0.1)  # the tune, played backwards: the antiworld
        put(t0 + a, filt(noise(int(9 * SR)), 'bandpass', [200, 900]) * np.linspace(0, 1, int(9 * SR)) ** 2 * 0.5, 0.1)
    if name == 'nothing':
        st = sh['lines'][0]['t1']; put(t0 + st + 0.3, mx(thock(60, 0.4), click(800, 0.05)), 0.4, 0.35)
    if name == 'leave':
        for j in range(8): put(t0 + 0.6 + j * 0.62, mx(thock(110, 0.05), filt(noise(int(0.03 * SR)), 'bandpass', [600, 3000]) * 0.4), 0.2 * (1 - j / 9), 0.1 + j * 0.08)
    if name == 'end':  # the tune with its holes: every third note removed
        for j, (tn, m) in enumerate(motif_times(t0 + 0.6, 0.4)[0]):
            if j % 3 != 1: put(tn, mbox(mnote(m)), 0.3, 0.1)

# ---------------- voices ----------------
for sh in shots:
    rt, wet = ROOM.get(sh['room'] or 'shop', (0.5, 0.1))
    for ln in sh['lines']:
        a = ln.pop('_a'); who = ln['who']
        if who == 'N': put(sh['t0'] + ln['t0'], a, 0.8, 0)
        else: putv(sh['t0'] + ln['t0'], a, rt, wet, 0.95, PAN[who])

# ---------------- the holes in the sound: every removal drops the whole track out for an instant ----------------
gate = np.ones(NT)
for k, tr in REMOVE.items():
    i = int(tr * SR); n = int(0.14 * SR); gate[i:i + n] = 0
gate[int(HALT * SR): int((HALT + 1.4) * SR)] *= np.linspace(0, 1, int(1.4 * SR)) ** 3
L *= gate; Rr *= gate

mix = np.stack([L, Rr], 1); mix /= np.abs(mix).max() + 1e-9; mix *= 0.89
raw = os.path.join(HERE, 'audio', 'ws.wav')
with wave.open(raw, 'wb') as f:
    f.setnchannels(2); f.setsampwidth(2); f.setframerate(SR); f.writeframes((mix * 32767).astype(np.int16).tobytes())
subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', raw, '-af', 'loudnorm=I=-16:TP=-1.5:LRA=14', '-ar', '48000', '-c:a', 'aac', '-b:a', '192k', os.path.join(HERE, 'audio', 'ws.m4a')], check=True)
os.remove(raw)
json.dump(dict(shots=shots, dur=TOTAL, cast=CAST, make=MAKE, remove=REMOVE, halt=HALT), open(os.path.join(HERE, 'timing', 'ws.json'), 'w'))
print('world saved', TOTAL, 's,', len(shots), 'shots')
for sh in shots: print(f"  {sh['shot']:8s} {sh['t0']:7.2f} {sh['d']:6.2f}", ' | '.join(f"{l['who']}@{l['t0']:.1f}-{l['t1']:.1f}" for l in sh['lines']))
print('make', MAKE)
