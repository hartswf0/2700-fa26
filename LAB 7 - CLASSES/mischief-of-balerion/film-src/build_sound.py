"""Voices, sound and music for The Fifth Sally, or The Mischief of King Balerion.
   python3 build_sound.py  ->  timing/mb.json and audio/mb.m4a
   Voices: Kokoro (kokoro-onnx), model files in $KOKORO_DIR (default ~/kokoro).
   Everything else is synthesized here, timed from the same score the picture reads.
   The device: the voice stays with the mind, the picture stays with the body. Each mind has its own Kokoro voice (and a small
   filter on top of it); at each horn-butt the two voices swap bodies, with a two-note exchange that pans left to right and
   right to left. While the horns are in someone's hands there is a heavy low hum. Under the later scenes a clock ticks,
   and at the end the ticking becomes the cuckoo."""
import hashlib, json, os, re, subprocess, wave
import numpy as np
from scipy.signal import butter, sosfilt, fftconvolve, resample_poly

HERE = os.path.dirname(os.path.abspath(__file__))
KDIR = os.environ.get('KOKORO_DIR', os.path.expanduser('~/kokoro'))
SR = 48000
rng = np.random.default_rng(31)
data = json.loads(subprocess.check_output(['node', '-e', "console.log(JSON.stringify(require('./script.js')))"], cwd=HERE))
SCRIPT, CAST = data['SCRIPT'], data['CAST']

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
def repitch(x, ratio):
    if abs(ratio - 1) < 1e-3: return x
    r = int(round(ratio * 1000)); return resample_poly(x, 1000, r)
def tt(d): return np.arange(int(d * SR)) / SR
def mx(*xs):
    n = max(len(x) for x in xs); o = np.zeros(n)
    for x in xs: o[:len(x)] += x
    return o

total_guess = 470
L = np.zeros(int(total_guess * SR)); Rr = np.zeros_like(L)
def put(t, sig, gain=1.0, pan=0.0, st=None):
    i = int(t * SR)
    if i < 0: sig = sig[-i:]; i = 0
    n = min(len(sig) if st is None else len(st[0]), len(L) - i)
    if n <= 0: return
    gl, gr = gain * np.sqrt((1 - pan) / 2) * 1.414, gain * np.sqrt((1 + pan) / 2) * 1.414
    if st is not None: L[i:i + n] += st[0][:n] * gl; Rr[i:i + n] += st[1][:n] * gr
    else: L[i:i + n] += sig[:n] * gl; Rr[i:i + n] += sig[:n] * gr
def putv(t, sig, rt, wet, gain=1.0, pan=0.0):
    pad = np.concatenate([sig, np.zeros(int(rt * SR))]); put(t, pad, gain, pan, st=verb(pad, rt, wet))
def putvs(t, stl, rt, wet, gain=1.0):
    l = np.concatenate([stl[0], np.zeros(int(rt * SR))]); r = np.concatenate([stl[1], np.zeros(int(rt * SR))])
    vl, vr = verb(l, rt, wet)[0], verb(r, rt, wet)[1]; put(t, None, gain, 0.0, st=(vl, vr))

# ---------------- character voices ----------------
def squeak_fx(a):
    """Balerion: lifted, thin and quick, the voice of someone who finds everything funny"""
    a = repitch(a, 1.13); return filt(a, 'highpass', 220) * 1.05
def gruff_fx(a):
    """the commissioner: lower, with a rough edge"""
    a = repitch(a, 0.93); t = np.arange(len(a)) / SR
    return np.tanh(filt(a, 'lowpass', 4200) * 1.9) * 0.62
def flat_fx(a):
    """the clock's mind in a policeman: no expression, a faint buzz"""
    t = np.arange(len(a)) / SR; rm = a * np.sign(np.sin(2 * np.pi * 95 * t))
    return filt(0.7 * a + 0.35 * rm, 'bandpass', [200, 4200]) * 1.1
def clock_fx(a):
    """a voice from inside a clock case: boxy, with a short wooden echo"""
    a = filt(a, 'bandpass', [380, 3600]) * 1.5; d = int(0.045 * SR); b = np.concatenate([a, np.zeros(d)]); b[d:] += a * 0.45; return b
FX = {'squeak': squeak_fx, 'gruff': gruff_fx, 'flat': flat_fx, 'clock': clock_fx}

def many(text, voices, conv, seed=0):
    """several Kokoro voices say the same words, close but not together"""
    r = np.random.default_rng(100 + seed)
    phrases = [p for p in re.split(r'(?<=[.!?])\s+', text.strip()) if p]
    K, V = len(phrases), len(voices)
    base = [r.uniform(0, 1, V) for _ in range(K)]; det = [r.uniform(-1, 1, V) for _ in range(K)]
    pan = np.linspace(-0.8, 0.8, V); r.shuffle(pan)
    clips = [[speak(ph, v, 0.95) for ph in phrases] for v in voices]
    starts, t = [], 0.0
    for k in range(K):
        o = base[k] * 0.12; d = 1 + det[k] * 0.025
        longest = max(len(clips[v][k]) / SR / d[v] + o[v] for v in range(V))
        starts.append(t)
        for v in range(V): clips[v][k] = (repitch(clips[v][k], d[v]), o[v])
        t += longest + 0.2
    n = int((t + 0.5) * SR); Lc = np.zeros(n); Rc = np.zeros(n)
    for k in range(K):
        for v in range(V):
            a, o = clips[v][k]; i = int((starts[k] + o) * SR)
            gl, gr = np.sqrt((1 - pan[v]) / 2) * 1.414, np.sqrt((1 + pan[v]) / 2) * 1.414
            m = min(len(a), n - i); Lc[i:i + m] += a[:m] * gl / np.sqrt(V) * 1.6; Rc[i:i + m] += a[:m] * gr / np.sqrt(V) * 1.6
    nz = np.nonzero(np.abs(Lc) + np.abs(Rc) > 0.01)[0]; end = nz[-1] + int(0.1 * SR)
    return (Lc[:end], Rc[:end])

def resolve(spec, lines, d):
    if isinstance(spec, (int, float)): return float(spec)
    s = spec.replace(' ', '')
    if s.startswith('end'): return d + (float(s[3:]) if len(s) > 3 else 0)
    m = re.match(r'L(\d+)(?:\.(t0|t1)|@([0-9.]+))([+-][0-9.]+)?$', s)
    i = int(m.group(1)); ln = lines[i]
    base = ln['t0'] if m.group(2) == 't0' else ln['t1'] if m.group(2) == 't1' else ln['t0'] + float(m.group(3)) * (ln['t1'] - ln['t0'])
    return base + (float(m.group(4)) if m.group(4) else 0)

# ---------------- timing pass ----------------
PANB = {'T': -0.45, 'L': -0.28, 'K': 0.3, 'S': 0.38, 'C': 0.42, 'CL': 0.0, None: 0.0}
shots = []; t = 0.0
for s in SCRIPT:
    sh = dict(shot=s['shot'], t0=round(t, 3), lines=[], room=s.get('room'), own=s.get('own'), horns0=s.get('horns0'))
    cur = 0.0
    for ln in s.get('lines', []):
        c = CAST[ln['who']]; sp = c['speed'] * (0.88 if ln.get('line') else 1.0)
        if 'many' in c:
            a = many(ln['say'], c['many'], False, seed=len(shots) * 10 + len(sh['lines'])); d = len(a[0]) / SR; mono = (a[0] + a[1]) / 2
        else:
            a = speak(ln['say'], c['voice'], sp)
            fx = ln.get('fx') or c.get('fx')
            if fx: a = FX[fx](a)
            if ln.get('body') == 'CL': a = clock_fx(a)
            d = len(a) / SR; mono = a
        if 'at' in ln: st = ln['at']
        elif 'after' in ln: st = sh['lines'][ln['after']]['t1'] + ln.get('pre', 0)
        else: st = cur + ln.get('pre', 0.6)
        hop = SR // 24; envl = [float(np.sqrt(np.mean(mono[i:i + hop] ** 2))) for i in range(0, len(mono), hop)]
        emax = max(envl) or 1; envl = [round(min(1, (v / emax) ** 0.7), 2) for v in envl]
        sh['lines'].append(dict(who=ln['who'], body=ln.get('body'), say=ln['say'], t0=round(st, 3), t1=round(st + d, 3), line=bool(ln.get('line')), env=envl, pan=ln.get('pan'), _a=a))
        cur = max(cur, st + d)
    sh['d'] = round(s['d'] if 'd' in s else cur + s.get('tail', 1.5), 3)
    L_ = sh['lines']; dd = sh['d']
    sh['cues'] = [dict({k: v for k, v in c.items() if k not in ('at', 'to')}, at=round(resolve(c['at'], L_, dd), 3), **({'to': round(resolve(c['to'], L_, dd), 3)} if 'to' in c else {})) for c in s.get('cues', [])]
    sh['cues'].sort(key=lambda c: c['at'])
    sh['curve'] = {}
    shots.append(sh); t += sh['d']
TOTAL = round(t, 3)

# who is in which body at each line: the voice must belong to the mind in that body (checks the score against the swaps)
def check():
    for sh in shots:
        own = dict(sh['own'] or {}); sw = [c for c in sh['cues'] if c['k'] == 'swap']
        for l in sh['lines']:
            if not l.get('body'): continue
            o = dict(own)
            for c in sw:
                if l['t0'] >= c['at'] - 0.001: o[c['a']], o[c['b']] = o[c['b']], o[c['a']]
            want = {'N': None}.get(l['who'], l['who'].lower())
            if o.get(l['body']) != want: print('MISMATCH', sh['shot'], l['body'], l['who'], 'but body holds', o.get(l['body']), '|', l['say'][:40])
        for c in sw: own[c['a']], own[c['b']] = own[c['b']], own[c['a']]
        nxt = shots[shots.index(sh) + 1]['own'] if shots.index(sh) + 1 < len(shots) else None
        if nxt and nxt != own: print('CARRY MISMATCH after', sh['shot'], own, nxt)
check()
def dump():
    for sh in shots:
        for l in sh['lines']: l.pop('_a', None)
    json.dump(dict(shots=shots, dur=TOTAL, cast=CAST), open(os.path.join(HERE, 'timing', 'mb.json'), 'w'))
if os.environ.get('TIMING_ONLY'):
    for sh in shots:
        print(f"{sh['shot']:9s} t0={sh['t0']:7.2f} d={sh['d']:6.2f} lines_end={sh['lines'][-1]['t1'] if sh['lines'] else 0:6.2f}", ' '.join(f"L{i}:{l['t0']:.1f}-{l['t1']:.1f}" for i, l in enumerate(sh['lines'])) if os.environ.get('V') else '')
    print('total', TOTAL, f'{int(TOTAL // 60)}:{TOTAL % 60:04.1f}')
    dump(); raise SystemExit

# ---------------- the sounds ----------------
def pluck(f, d=0.5, bright=1.0):
    t = tt(d); e = np.exp(-t / (d / 4.5))
    x = np.sin(2 * np.pi * f * t) * e + 0.28 * bright * np.sin(2 * np.pi * 2 * f * t) * np.exp(-t / (d / 9)) + 0.12 * bright * np.sin(2 * np.pi * 3 * f * t) * np.exp(-t / (d / 14))
    k = int(0.004 * SR); x[:k] += noise(k) * 0.25 * np.linspace(1, 0, k)
    x[:int(0.001 * SR)] *= np.linspace(0, 1, int(0.001 * SR)); return x * 0.5
def thud(f=60, d=0.35, g=1.0):
    t = tt(d); ph = 2 * np.pi * np.cumsum(f * (1 + 0.9 * np.exp(-t / 0.03))) / SR
    return (np.sin(ph) * np.exp(-t / (d / 4)) + 0.25 * filt(noise(len(t)), 'lowpass', 400) * np.exp(-t / 0.05)) * g
def noiseb(d, lo, hi, tau, atk=0.005):
    t = tt(d); x = filt(filt(noise(len(t)), 'highpass', lo), 'lowpass', hi) * np.exp(-t / tau)
    k = max(1, int(atk * SR)); x[:k] *= np.linspace(0, 1, k); return x
def swell(d, lo, hi, g=0.5):
    t = tt(d); x = filt(filt(noise(len(t)), 'highpass', lo), 'lowpass', hi) * np.sin(np.pi * t / d) ** 2; return x * g
def rise(d, lo, hi, g=0.5):
    t = tt(d); x = filt(filt(noise(len(t)), 'highpass', lo), 'lowpass', hi) * (t / d) ** 2; return x * g
def padchord(freqs, d, amp=0.1, fi=1.0, fo=1.0):
    t = tt(d); x = np.zeros(len(t))
    for i, f in enumerate(freqs):
        for dt in (-0.4, 0.4): x += np.sin(2 * np.pi * (f + dt * (1 + i * 0.3)) * t + i) * (0.6 + 0.4 * np.sin(2 * np.pi * 0.07 * (i + 1) * t))
    e = np.minimum(1, t / fi) * np.minimum(1, (d - t) / fo).clip(0)
    return x / len(freqs) * amp * e
def wind(d, g=0.05):
    t = tt(d); x = filt(filt(noise(len(t)), 'highpass', 150), 'lowpass', 800)
    return x * (0.6 + 0.4 * np.sin(2 * np.pi * 0.09 * t + 1)) * g
def rumble(d, g=0.4):
    t = tt(d); return filt(brown(len(t)), 'lowpass', 160) * g * (0.8 + 0.2 * np.sin(2 * np.pi * 0.4 * t))
def metal(f=None, d=0.35, g=1.0):
    f = f or rng.uniform(1500, 5200); t = tt(d)
    x = (np.sin(2 * np.pi * f * t) + 0.6 * np.sin(2 * np.pi * f * 2.76 * t) + 0.35 * np.sin(2 * np.pi * f * 5.4 * t)) * np.exp(-t / (d / 6))
    k = int(0.002 * SR); x[:k] += noise(k) * 0.5; return x * 0.35 * g
def gear_tick(g=1.0): return mx(noiseb(0.03, 1200, 6000, 0.008), 0.5 * metal(rng.uniform(900, 1500), 0.08)) * 0.5 * g
def stampk(g=1.0): return mx(thud(85, 0.22, 0.9), noiseb(0.07, 400, 3000, 0.02) * 0.55) * g
def footstep(g=1.0): return mx(thud(125, 0.1, 0.28), noiseb(0.035, 1000, 4000, 0.01) * 0.16) * g
def dirtstep(g=1.0): return mx(noiseb(0.09, 300, 2400, 0.03, 0.01) * 0.3, thud(95, 0.08, 0.14)) * g
def march(g=1.0): return mx(thud(105, 0.14, 0.4), noiseb(0.05, 800, 3500, 0.014) * 0.22, metal(rng.uniform(2400, 3200), 0.05, 0.12)) * g
def rustle(d=0.3, g=1.0):
    t = tt(d); x = filt(filt(noise(len(t)), 'highpass', 2200), 'lowpass', 9000) * (rng.random(len(t)) > 0.55) * np.exp(-t / (d / 2.5)); return x * 0.22 * g
def scratch(d, g=1.0):
    t = tt(d); x = filt(filt(noise(len(t)), 'highpass', 2500), 'lowpass', 8000) * (0.5 + 0.5 * np.sin(2 * np.pi * 9 * t) ** 2) * np.minimum(1, t / 0.05) * np.minimum(1, (d - t) / 0.08).clip(0); return x * 0.2 * g
def wood(g=1.0): return mx(thud(170, 0.12, 0.6), noiseb(0.05, 700, 3000, 0.012) * 0.4) * g
def pop(g=1.0):
    t = tt(0.12); f = 300 + 900 * (t / 0.12); return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.035) * 0.35 * g
def boing(d=0.5, g=1.0):
    t = tt(d); f = 180 + 260 * np.sin(2 * np.pi * 7 * t) * np.exp(-t / 0.2) + 220 * t; return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / (d / 3)) * 0.3 * g
def chirp(g=1.0):
    d = 0.14 + 0.06 * rng.random(); t = tt(d); f0 = rng.uniform(2200, 3200); f = f0 + 1400 * np.sin(np.pi * t / d) + 600 * np.sin(2 * np.pi * 22 * t)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * t / d) ** 0.7 * 0.18 * g
def gull(g=1.0):
    d = 0.5 + 0.3 * rng.random(); t = tt(d); f = 900 + 700 * np.sin(np.pi * t / d) - 250 * t / d
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) + 0.5 * np.sin(4 * np.pi * np.cumsum(f) / SR); return filt(x, 'bandpass', [600, 3200]) * np.sin(np.pi * t / d) ** 1.2 * 0.1 * g
def murmur(d, g=1.0):
    t = tt(d); n = filt(noise(len(t)), 'bandpass', [260, 2600]); am = np.abs(np.sin(2 * np.pi * (3.1 * t + 0.8 * np.sin(2 * np.pi * 0.3 * t)))) ** 1.5 + 0.5 * np.abs(np.sin(2 * np.pi * 4.7 * t + 1.3)) ** 2
    return n * am * 0.35 * g * np.minimum(1, t / 0.3) * np.minimum(1, (d - t) / 0.3).clip(0)
def laugh(d, g=1.0):
    t = tt(d); n = filt(noise(len(t)), 'bandpass', [400, 2200]); am = (np.sin(2 * np.pi * 5.8 * t) > 0.1) * (0.6 + 0.4 * np.sin(2 * np.pi * 1.7 * t)) ** 2
    return n * am * 0.45 * g * np.minimum(1, t / 0.3) * np.minimum(1, (d - t) / 0.5).clip(0)
def waves(d, g=1.0):
    t = tt(d); x = filt(brown(len(t)), 'bandpass', [90, 900]); return x * (0.55 + 0.45 * np.sin(2 * np.pi * 0.17 * t + 0.6)) * 0.55 * g
def creak(d, f0=300, g=1.0):
    t = tt(d); f = f0 * (1 + 0.5 * np.sin(2 * np.pi * 3.5 * t) * 0.3 + 0.35 * t / d); x = np.sign(np.sin(2 * np.pi * np.cumsum(f) / SR)) * 0.5 + np.sin(2 * np.pi * np.cumsum(f * 1.5) / SR) * 0.2
    return filt(x, 'bandpass', [f0 * 0.9, f0 * 6]) * np.sin(np.pi * t / d) ** 0.7 * 0.22 * g
def bell(g=1.0):
    a = pluck(2637, 0.9, 0.5) * g * 0.6; b = pluck(3951, 0.5, 0.3) * g * 0.2
    return mixa(a, b)
def mixa(a, b):
    o = np.zeros(max(len(a), len(b))); o[:len(a)] += a; o[:len(b)] += b
    return o
def strike(f=523, g=1.0):
    t = tt(1.6); x = sum(a_ * np.sin(2 * np.pi * f * r_ * t) * np.exp(-t / (1.3 / (1 + 0.8 * r_ * 0.4))) for a_, r_ in [(1, 1), (0.5, 2.0), (0.4, 2.76), (0.25, 5.4)]); k = int(0.003 * SR); x[:k] += noise(k) * 0.4
    return x * 0.3 * g
def cuckoo(g=1.0):
    """two notes, the second lower and longer, with a little wobble on the voice"""
    def note(f, d):
        t = tt(d); fr = f * (1 + 0.012 * np.sin(2 * np.pi * 30 * t)); x = np.sin(2 * np.pi * np.cumsum(fr) / SR) + 0.25 * np.sin(4 * np.pi * np.cumsum(fr) / SR) + 0.08 * np.sin(6 * np.pi * np.cumsum(fr) / SR)
        return x * np.minimum(1, t / 0.02) * np.minimum(1, (d - t) / 0.05).clip(0) * 0.3
    a, b = note(990, 0.17), note(785, 0.3); o = np.zeros(int(0.7 * SR)); o[:len(a)] += a; i = int(0.2 * SR); o[i:i + len(b)] += b; return o * g
def tick(hi=True, g=1.0):
    return mx(noiseb(0.03, 1500 if hi else 800, 7000 if hi else 4000, 0.006), 0.4 * pluck(1800 if hi else 1250, 0.06, 0.2)) * 0.5 * g
def sparkle(g=1.0):
    return mixa(pluck(rng.choice([2093, 2637, 3136, 3951]), 0.5, 0.3), np.zeros(1)) * 0.45 * g
def hum(d, g=1.0):
    """a heavy low hum with a slow beat, and a thin upper note so small speakers carry it"""
    n = int(d * SR); t = np.arange(n) / SR
    x = np.sin(2 * np.pi * 55 * t) + 0.8 * np.sin(2 * np.pi * 55.6 * t + 1) + 0.5 * np.sin(2 * np.pi * 110.4 * t + 0.7) + 0.28 * np.sin(2 * np.pi * 165.5 * t) + 0.12 * np.sin(2 * np.pi * 220.9 * t + 2)
    x += 0.5 * filt(brown(n), 'lowpass', 150)
    am = (0.82 + 0.18 * np.sin(2 * np.pi * 4.3 * t)) * np.minimum(1, t / 0.35) * np.minimum(1, (d - t) / 0.45).clip(0)
    return x * am * 0.1 * g

def eadd(El, Er, t, sig, g=1.0, pan=0.0):
    i = int(t * SR)
    if i < 0: sig = sig[-i:]; i = 0
    n = min(len(sig), len(El) - i)
    if n <= 0: return
    El[i:i + n] += sig[:n] * g * np.sqrt((1 - pan) / 2) * 1.414; Er[i:i + n] += sig[:n] * g * np.sqrt((1 + pan) / 2) * 1.414
def esweep(El, Er, t, sig, g, p0, p1):
    """a sound whose pan moves from p0 to p1 while it plays"""
    i = int(t * SR)
    if i < 0: sig = sig[-i:]; i = 0
    n = min(len(sig), len(El) - i)
    if n <= 0: return
    p = np.linspace(p0, p1, n); El[i:i + n] += sig[:n] * g * np.sqrt((1 - p) / 2) * 1.414; Er[i:i + n] += sig[:n] * g * np.sqrt((1 + p) / 2) * 1.414

ROOM = {'open': (1.8, 0.12), 'hall': (1.4, 0.22), 'office': (0.45, 0.07), None: (1.2, 0.18)}
def ticks(E, a, b, rate0, rate1, mk, g=1.0, pan_alt=0.4, jitter=0.0):
    t = a; j = 0
    while t < b:
        u = (t - a) / max(0.01, b - a); E(t, mk(), g, pan_alt * (1 if j % 2 else -1)); r = rate0 + (rate1 - rate0) * u
        t += 1.0 / r * (1 + jitter * rng.uniform(-1, 1)); j += 1
def steps(E, a, b, period, p0, p1, mk, g=1.0, jit=0.05):
    """footfalls from a to b, one per period, the pan moving from p0 to p1"""
    t = a
    while t < b:
        u = (t - a) / max(0.01, b - a); E(t, mk(g * (0.8 + 0.4 * rng.random())), 1.0, p0 + (p1 - p0) * u); t += period * (1 + jit * rng.uniform(-1, 1))

def swap_sound(E, El, Er, c):
    """the exchange: a short two-note figure. The first note travels left to right, the answer travels right to left."""
    at = c['at']
    if not c.get('nolunge'): E(at - 0.45, rise(0.45, 300, 2600, 0.3), 1.0, 0.0)
    E(at, mx(thud(70, 0.4, 0.9), metal(rng.uniform(700, 900), 0.4, 1.0), noiseb(0.08, 1200, 6000, 0.02) * 0.7), 1.0, 0.0)
    esweep(El, Er, at + 0.04, pluck(659, 0.55, 0.8) * 1.1, 1.0, -0.95, 0.95)
    esweep(El, Er, at + 0.21, pluck(988, 0.55, 0.8) * 1.1, 1.0, 0.95, -0.95)
    esweep(El, Er, at + 0.05, swell(c.get('dur', 1.0), 1400, 7000, 0.12), 1.0, -0.6, 0.6)

def design(sh):
    d = sh['d']; name = sh['shot']; rt, wet = ROOM.get(sh['room'], ROOM[None])
    n = int((d + 1.0) * SR); El = np.zeros(n); Er = np.zeros(n)
    E = lambda t, sig, g=1.0, pan=0.0: eadd(El, Er, t, sig, g, pan)
    cues = sh['cues']; C = lambda k: [c for c in cues if c['k'] == k]; one = lambda k: C(k)[0]
    to = lambda c, dflt: c.get('to', c['at'] + dflt)
    LN = sh['lines']
    for c in C('swap'): swap_sound(E, El, Er, c)
    # a clock ticks under the later scenes; its phase follows the pendulum (period 1.43 s, one tick at each end of the swing)
    def pend(a, b, g, pan):
        k = 0
        while True:
            t = 0.357 + 0.714 * k; k += 1
            if t < a: continue
            if t >= b: break
            E(t, tick(k % 2 == 0, g), 1.0, pan)
    if name == 'court':
        hop, hide, scat, lamp, drop, thr, ask, books = one('hop'), one('hide'), one('scatter'), one('lamp'), one('drop'), one('throne'), one('ask'), one('books')
        E(0, wind(d + 0.5, 0.03))
        k = 1
        while hop['at'] + k * 0.5712 < hop['to']: E(hop['at'] + k * 0.5712, footstep(1.0), 0.8, lerp_(-0.2, 0.15, k * 0.5712 / (hop['to'] - hop['at']))); k += 1
        steps(E, hide['at'], hide['to'], 0.286, 0.0, 0.4, footstep, 0.9)
        steps(E, scat['at'], scat['at'] + 3.4, 0.07, -0.9, 0.9, footstep, 0.22, 0.6)
        for q in range(10): E(lamp['at'] + 0.1 * q + rng.uniform(0, 0.25), metal(rng.uniform(3000, 6000), 0.35, 0.35), 1.0, rng.uniform(-0.3, 0.3))
        E(lamp['at'] - 0.2, swell(0.9, 800, 6000, 0.12), 1.0, 0.0)
        ticks(E, lamp['at'] + 1.2, drop['at'], 1.4, 1.4, lambda: metal(rng.uniform(3500, 6500), 0.3, 0.22), 1.0, 0.3, 0.7)
        E(drop['at'], mx(noiseb(0.9, 500, 9000, 0.25), thud(60, 0.6, 1.0) * 1.2), 0.9, 0.0)
        for q in range(14): E(drop['at'] + 0.05 + q * 0.04 + rng.uniform(0, 0.15), metal(rng.uniform(1800, 6500), 0.3, 0.5), 1.0, rng.uniform(-0.7, 0.7))
        walkK = max(thr['at'] + 0.3, drop['at'] + 0.7); steps(E, walkK, walkK + 1.5, 0.286, 0.0, 0.5, footstep, 0.8)
        E(ask['at'], pop(1.0), 1.0, 0.3)
        for q in range(8): E(books['at'] + q * 0.3 + rng.uniform(0, 0.15), thud(115, 0.12, 0.45), 1.0, rng.uniform(-0.8, 0.8))
    elif name == 'prize':
        vault, gate, coins, contract, hall, box = one('vault'), one('gate'), one('coins'), one('contract'), one('hall'), one('box')
        E(0, wind(d + 0.5, 0.025))
        E(vault['at'], padchord([55, 82.4, 110, 123.5], vault['to'] - vault['at'], 0.2, 0.8, 0.6), 1.0, 0.0)
        E(vault['at'] + 0.3, creak(1.1, 240, 1.0), 1.0, 0.0)
        for q in range(9): E(vault['at'] + 1.2 + q * 0.38 + rng.uniform(0, 0.2), sparkle(0.9), 1.0, rng.uniform(-0.6, 0.6))
        E(gate['at'] - 0.2, murmur(hall['at'] - gate['at'] + 0.2, 0.28), 1.0, 0.45)
        E(gate['at'] - 0.2, murmur(hall['at'] - gate['at'] + 0.2, 0.2), 1.0, -0.6)
        for q in range(5): E(coins['at'] + q * 0.28 + 0.4, metal(rng.uniform(2800, 4600), 0.22, 0.6), 1.0, -0.3 + q * 0.18)
        E(contract['at'], rustle(0.5, 1.4), 1.0, -0.3)
        E(box['at'], creak(0.4, 420, 0.8), 1.0, -0.1); E(box['at'] + 0.4, mx(wood(0.5), metal(1500, 0.1, 0.4)), 1.0, -0.1)
    elif name == 'swap':
        wg, run, fall, seize, thr = one('wiggle'), one('run'), one('fall'), one('seize'), one('throw')
        E(0, wind(d + 0.5, 0.025))
        ticks(E, wg['at'] + 0.1, wg['to'], 11, 11, lambda: gear_tick(0.5), 1.0, 0.2, 0.3)
        steps(E, run['at'] + 0.1, run['to'] - 0.4, 0.224, -0.3, -0.95, footstep, 0.9)
        E(fall['at'] + 0.3, mx(thud(75, 0.5, 1.0), rustle(0.3, 2.0)), 0.9, 0.2)
        steps(E, seize['at'], seize['to'], 0.286, 0.9, 0.7, march, 0.6)
        E(thr['at'], swell(0.9, 300, 3500, 0.2), 1.0, 0.5); E(thr['at'] + 0.9, mx(thud(70, 0.5, 1.0), rustle(0.3, 2.0)), 1.0, 0.85)
    elif name == 'locked':
        shut, pound, bolt = one('shut'), one('pound'), one('bolt')
        E(0, rumble(d + 0.5, 0.05))
        E(shut['at'] + 0.4, mx(thud(60, 0.6, 1.0) * 1.3, wood(1.0) * 0.9, noiseb(0.2, 300, 2500, 0.06) * 0.5), 1.0, -0.35)
        E(bolt['at'] + 0.1, mx(metal(420, 0.4, 1.0), thud(120, 0.15, 0.5)), 1.0, -0.4)
        tm = pound['at'] + 0.55; pe = pound['to'] - 0.8
        while tm < pe:
            if rng.random() > 0.22: E(tm, wood(0.5 * (0.8 + 0.4 * rng.random())), 1.0, -0.38)
            tm += 0.262
        steps(E, 0.0, shut['at'], 0.286, -0.3, -0.25, footstep, 0.7)
        steps(E, pe, pe + 0.9, 0.39, -0.2, 0.3, footstep, 0.6)
    elif name == 'street':
        bub, mi, fl = one('bubble'), one('mind_in'), one('fall')
        E(0, wind(d + 0.5, 0.035)); E(0, murmur(d, 0.07), 1.0, 0.0)
        steps(E, 0.0, bub['at'], 0.35, -0.5, -0.1, footstep, 0.8)
        E(bub['at'], pop(1.0), 1.0, -0.1)
        E(mi['at'], mx(thud(90, 0.3, 0.8), metal(900, 0.3, 0.7)), 0.7, 0.4); E(mi['at'] + 0.05, swell(0.7, 600, 4000, 0.15), 1.0, 0.2)
        E(fl['at'] + 0.4, thud(80, 0.4, 0.7), 0.7, 0.3)
    elif name == 'steps':
        run, tum, app, dn = one('run'), one('tumble'), one('approach'), one('dance')
        E(0, waves(d + 0.5, 0.2));
        for q in range(3): E(1.5 + q * 7 + rng.uniform(0, 2), gull(1.0), 1.0, rng.uniform(-0.8, 0.8))
        steps(E, run['at'] + 0.1, tum['at'], 0.21, -0.8, -0.2, footstep, 0.8, 0.1)
        for q in range(6): E(tum['at'] + 0.1 + q * 0.11, thud(90 - q * 6, 0.25, 1.0), 0.9 - 0.1 * q, -0.2 + 0.05 * q)
        E(tum['at'] + 0.8, scratch(0.6, 1.0), 1.0, -0.1)
        E(tum['at'] + 1.0, laugh(3.2, 0.4), 1.0, 0.6)
        steps(E, app['at'], app['to'] - 0.3, 0.393, 0.9, 0.5, footstep, 0.7)
        steps(E, dn['at'], d - 0.2, 0.449, 0.4, 0.95, footstep, 0.8)
    elif name == 'quay':
        sc, hit, arr, esc = one('scold'), one('hit'), one('arrive'), one('escort')
        E(0, waves(d + 0.5, 0.25))
        for q in range(4): E(1.0 + q * 5.3 + rng.uniform(0, 1.5), gull(1.0), 1.0, rng.uniform(-0.8, 0.8))
        steps(E, 0.0, sc['at'], 0.393, -0.5, -0.1, footstep, 0.7)
        steps(E, sc['at'], sc['to'], 0.35, 0.5, 0.25, footstep, 0.7)
        E(hit['at'] + 0.17, mx(wood(1.0), noiseb(0.06, 500, 4000, 0.015) * 0.5), 1.0, 0.0); E(hit['at'] + 0.55, mx(thud(80, 0.5, 0.9), rustle(0.3, 1.5)), 0.9, 0.35)
        steps(E, arr['at'], arr['to'], 0.286, 0.9, 0.4, march, 0.8)
        steps(E, esc['at'], d - 0.2, 0.286, 0.0, -0.9, march, 0.8)
    elif name == 'station':
        en, sl, ik, jp = one('enter'), one('slam'), one('ink'), one('jump'); hc = C('horns')
        E(0, rumble(d + 0.5, 0.045))
        steps(E, en['at'], en['to'], 0.393, -0.6, -0.15, footstep, 0.8)
        E(sl['at'] + 0.12, mx(stampk(1.0), wood(0.6)), 1.0, 0.4)
        for q, dt in enumerate([0.3, 0.52, 0.65]): E(sl['at'] + 0.12 + dt, metal(1500 + 300 * q, 0.25, 0.6), 1.0, 0.1)
        E(hc[2]['at'] - 0.4, mx(rustle(0.4, 2.0), metal(1200, 0.2, 0.4)), 1.0, 0.4)
        E(ik['at'], swell(0.35, 700, 5000, 0.25), 1.0, 0.0); E(ik['at'] + 0.35, mx(noiseb(0.25, 300, 1800, 0.07) * 0.9, thud(100, 0.2, 0.5)), 1.0, 0.45)
        for q, dt in enumerate([0.0, 0.2, 0.32]): E(hc[3]['at'] + dt + 0.1, metal(1400 + 250 * q, 0.25, 0.5), 1.0, 0.1)
        steps(E, jp['at'], jp['at'] + 0.9, 0.16, -0.3, -0.5, footstep, 0.8); E(jp['at'] + 1.0, mx(creak(0.5, 600, 1.0), swell(0.8, 800, 5000, 0.12)), 1.0, -0.6)
    elif name == 'trick':
        arr, kn, tale, flw, lv, lk, ret, dr, dg = one('arrest'), one('kneel'), one('tale'), one('flower'), one('leave'), one('lock'), one('return'), one('drawer'), one('drag')
        E(0, rumble(d + 0.5, 0.045))
        for q in range(2): steps(E, arr['at'] + 0.2 * q, arr['to'], 0.393, -0.8, 0.0, march, 0.45)
        E(kn['at'] + 0.3, thud(100, 0.2, 0.4), 1.0, -0.1)
        for tm in (tale['at'], (tale['at'] + flw['at']) / 2, flw['at']): E(tm + 0.05, pop(1.0), 1.0, -0.15)
        for q in range(5): E(flw['at'] + 0.3 + q * 0.17, sparkle(0.7), 1.0, -0.2 + 0.1 * q)
        steps(E, lv['at'], lk['at'] - 0.1, 0.393, 0.6, 0.3, footstep, 0.8)
        E(lk['at'] - 0.05, mx(metal(900, 0.15, 0.7), wood(0.4)), 1.0, 0.2)
        ticks(E, lk['at'], lk['at'] + 0.5, 34, 34, lambda: gear_tick(0.5), 1.0, 0.2, 0.2); E(lk['at'] + 0.5, mx(metal(260, 0.6, 1.4), thud(55, 0.5, 1.0)), 1.0, -0.1)
        steps(E, lk['at'] + 0.6, ret['at'] - 0.4, 0.286, 0.3, 0.9, footstep, 0.8)
        steps(E, ret['at'], LN[6]['t1'] - 0.1, 0.3, 0.9, 0.3, stampk, 0.5, 0.08)
        E(dr['at'] + 0.4, swell(0.5, 500, 4000, 0.18), 1.0, 0.3)
        e0 = LN[7]['t0'] + 0.8
        steps(E, e0, dg['at'] + 0.3, 0.286, 0.9, 0.4, march, 0.7)
        ticks(E, dg['at'], dg['at'] + 0.5, 34, 34, lambda: gear_tick(0.5), 1.0, 0.2, 0.2); E(dg['at'] + 0.5, metal(300, 0.4, 0.7), 1.0, 0.0)
        E(dg['at'] + 0.4, scratch(3.0, 0.9), 1.0, 0.5); steps(E, dg['at'] + 0.4, d - 0.4, 0.286, 0.4, 0.95, march, 0.7)
    elif name == 'restore':
        tk, bd, hl, lit, pr, ce, mo = one('tickle'), one('bound'), one('hall'), one('litter'), one('prisoner'), one('cell'), one('morning')
        sws = C('swap')
        E(0, rumble(d + 0.5, 0.04))
        steps(E, 1.0, tk['at'] - 2.0, 0.393, 0.6, 0.3, footstep, 0.8)
        E(tk['at'], scratch(bd['at'] - tk['at'], 1.2), 1.0, -0.3)
        E(bd['at'] + 0.05, boing(0.5, 1.0), 1.0, -0.2); E(bd['at'] + 0.5, thud(80, 0.3, 0.6), 1.0, -0.15)
        E(hl['at'] - 0.25, swell(0.55, 250, 3500, 0.15), 1.0, 0.0)
        steps(E, lit['at'] + 0.1, lit['at'] + 2.2, 0.393, -0.9, -0.5, footstep, 0.7); steps(E, lit['at'] + 0.1, lit['at'] + 2.2, 0.393, -0.8, -0.1, footstep, 0.6)
        steps(E, pr['at'], pr['at'] + 2.0, 0.286, 0.9, 0.3, march, 0.7)
        steps(E, ce['at'], ce['at'] + 3.2, 0.286, -0.1, -0.9, march, 0.7)
        for q in range(7): E(mo['at'] + 0.2 + q * 0.55 + rng.uniform(0, 0.25), chirp(1.0), 1.0, rng.uniform(-0.7, 0.7))
        E(mo['at'], swell(2.5, 900, 6000, 0.08), 1.0, 0.5)
        steps(E, mo['at'] + 0.2, mo['at'] + 1.6, 0.393, -0.7, -0.2, footstep, 0.6); steps(E, mo['at'] + 0.2, mo['at'] + 1.5, 0.393, 0.3, 0.0, footstep, 0.6)
        steps(E, sws[2]['at'] - 0.5, sws[2]['at'], 0.25, 0.4, 0.0, footstep, 0.6)
    elif name == 'clock':
        hg, push, ck = one('hang'), one('push'), C('cuckoo')
        E(0, wind(d + 0.5, 0.025))
        E(hg['at'], creak(hg['to'] - hg['at'], 330, 1.0), 1.0, 0.4)
        ticks(E, hg['at'], hg['to'], 5, 5, lambda: gear_tick(0.5), 1.0, 0.3, 0.2)
        E(hg['to'], mx(thud(60, 0.5, 1.0), metal(500, 0.5, 0.7)), 0.8, 0.4)
        pend(hg['to'] + 0.2, d + 0.4, 0.12, 0.35)
        steps(E, push['at'] - 0.8, sws0(sh) , 0.286, -0.3, 0.2, march, 0.6)
        for c in ck: E(c['at'] + 0.05, cuckoo(0.6), 1.0, 0.4)
        steps(E, LN[3]['t0'] + 0.3, LN[3]['t1'] + 0.6, 0.393, 0.2, -0.9, footstep, 0.7)
    elif name == 'hiding':
        bag, show, far = one('horns'), one('show'), one('far')
        E(0, wind(d + 0.5, 0.04))
        for q in range(9): E(0.5 + q * 2.6 + rng.uniform(0, 1.4), chirp(0.8), 1.0, rng.uniform(-0.8, 0.8))
        steps(E, 0.4, d - 0.3, 0.393, -0.2, -0.1, dirtstep, 0.5); steps(E, 0.55, d - 0.3, 0.393, 0.1, 0.15, dirtstep, 0.5)
        E(bag['at'] + 0.35, mx(rustle(0.4, 2.0), metal(1100, 0.2, 0.4)), 1.0, 0.0)
        for q in range(4): E(show['at'] + 0.3 + q * 0.2, sparkle(0.8), 1.0, 0.1 + 0.05 * q)
        pend(2.0, far['at'] - 0.2, 0.05, -0.5)
        for q in range(3): E(far['at'] + q * 0.9, filt(strike(392, 0.5), 'lowpass', 1600), 1.0, -0.6)
        for tm in (far['at'] + 0.1, far['at'] + 1.7): E(tm, filt(cuckoo(0.35), 'lowpass', 2200), 1.0, -0.65)
    return El, Er, rt, wet

def lerp_(a, b, u): return a + (b - a) * max(0, min(1, u))
def sws0(sh):
    c = [c for c in sh['cues'] if c['k'] == 'swap']; return c[0]['at'] if c else sh['d']

def title_end_design(sh):
    d = sh['d']; n = int((d + 1.0) * SR); El = np.zeros(n); Er = np.zeros(n)
    E = lambda t, sig, g=1.0, pan=0.0: eadd(El, Er, t, sig, g, pan)
    if sh['shot'] == 'title':
        E(0, padchord([110, 164.8, 220, 277], d, 0.16, 1.5, 1.5), 1.0, 0.0)
        ticks(E, 0.7, 2.2, 1.4, 1.4, lambda: tick(True, 0.6), 1.0, 0.3, 0.0)
        swap_sound(E, El, Er, {'at': 2.3, 'dur': 1.0, 'nolunge': False})
        E(3.4, hum(d - 3.4 + 0.5, 0.8), 1.0, 0.0)
    else:
        a = 0.5
        ticks(E, a, 3.0, 1.4, 8.0, lambda: tick(rng.random() > 0.5, 0.45), 1.0, 0.1, 0.05)
        E(3.0, cuckoo(0.9), 1.0, 0.0); E(4.5, cuckoo(0.7), 1.0, 0.0)
        pend_t = 5.6
        while pend_t < d: E(pend_t, tick(int(pend_t * 10) % 2 == 0, 0.25), 1.0, 0.0); pend_t += 0.714
        E(0, padchord([110, 138.6, 165], d, 0.05, 2.0, 2.5), 1.0, 0.0)
    return El, Er, 1.0, 0.12

for sh in shots:
    t0 = sh['t0']
    if sh['shot'] in ('title', 'end'): El, Er, rt, wet = title_end_design(sh)
    else: El, Er, rt, wet = design(sh)
    putvs(t0, (El, Er), rt, wet, 1.0)
    rt, wet = ROOM.get(sh['room'], ROOM[None])
    for ln in sh['lines']:
        a = ln['_a']; gg = 1.0 * (1.12 if ln['line'] else 1.0); w = wet * (1.4 if ln['line'] else 1.0)
        if isinstance(a, tuple): putvs(t0 + ln['t0'], a, rt, w, gg * 0.9)
        else: putv(t0 + ln['t0'], a, rt, w, gg, PANB.get(ln.get('body'), 0.0))

# the hum: whenever the horns are in someone's hands (the picture draws them held), continuous across the cuts
spans = []
for sh in shots:
    ev = [dict(at=-1e9, w=(sh['horns0'] or {}).get('w'), mode=(sh['horns0'] or {}).get('mode'))] + sorted([c for c in sh['cues'] if c['k'] == 'horns'], key=lambda c: c['at'])
    for i, e in enumerate(ev):
        if e['mode'] != 'held': continue
        a = max(0.0, e['at']) + (0.3 if e['at'] > -1e8 else 0.0); b = ev[i + 1]['at'] if i + 1 < len(ev) else sh['d']
        if b - a < 0.2: continue
        spans.append([sh['t0'] + a, sh['t0'] + b, e['w'], sh['t0'] + sh['d'] if i + 1 >= len(ev) else None])
merged = []
for s_ in spans:
    if merged and abs(merged[-1][1] - s_[0]) < 0.35 and merged[-1][2] == s_[2] and merged[-1][3] is not None: merged[-1][1] = s_[1]; merged[-1][3] = s_[3]
    else: merged.append(s_)
for a, b, w, _ in merged: put(a, hum(b - a, 1.0), 1.0, PANB.get(w, 0.0))

end_i = int((TOTAL + 0.6) * SR)
mixL, mixR = L[:end_i], Rr[:end_i]
fade = int(0.8 * SR); mixL[-fade:] *= np.linspace(1, 0, fade); mixR[-fade:] *= np.linspace(1, 0, fade)
pk = max(np.abs(mixL).max(), np.abs(mixR).max()); sc = 0.8 / pk
st = np.stack([mixL * sc, mixR * sc], 1)
os.makedirs(os.path.join(HERE, 'audio'), exist_ok=True)
wp = os.path.join(HERE, 'audio', 'mb_raw.wav')
with wave.open(wp, 'wb') as wf:
    wf.setnchannels(2); wf.setsampwidth(2); wf.setframerate(SR); wf.writeframes((np.clip(st, -1, 1) * 32767).astype('<i2').tobytes())
subprocess.check_call(['ffmpeg', '-y', '-loglevel', 'error', '-i', wp, '-af', 'loudnorm=I=-16:TP=-1.5:LRA=11', '-c:a', 'aac', '-b:a', '128k', '-ar', '48000', os.path.join(HERE, 'audio', 'mb.m4a')])
os.remove(wp)
dump()
print('done', TOTAL, 'hum spans', [(round(a, 1), round(b, 1), w) for a, b, w, _ in merged])
