"""Voices, sound and music for The Second Sally, or The Offer of King Krool.
   python3 build_sound.py  ->  timing/kk.json and audio/kk.m4a
   Voices: Kokoro (kokoro-onnx), model files in $KOKORO_DIR (default ~/kokoro).
   Everything else is synthesized here, timed from the same score the picture reads.
   The device: distributed control. The beast is many small parts acting as one, so its sound is a swarm of small clicks that
   rises when it splits and settles when it rejoins; the King is one huge thing, so his sound is one pair of boots booming in a
   silver skull. The star sign comes on with a low chord, the carriage dragons roar, the trophy garden has wind in the fangs,
   the paper battle is pencils and a little percussion, the sealed wagon rings by itself, and the tooth radio crackles."""
import hashlib, json, os, re, subprocess, wave
import numpy as np
from scipy.signal import butter, sosfilt, fftconvolve, resample_poly

HERE = os.path.dirname(os.path.abspath(__file__))
KDIR = os.environ.get('KOKORO_DIR', os.path.expanduser('~/kokoro'))
SR = 48000
rng = np.random.default_rng(47)
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

total_guess = 560
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
def silk_fx(a):
    """the Grand Seneschal: grand and silky, a soft doubled shine like a glass harmonica behind the voice"""
    d = int(0.017 * SR); b = repitch(a, 1.006); o = np.zeros(len(a) + d + 10); o[:len(a)] += a; o[d:d + len(b)] += 0.42 * b[: len(o) - d]
    t = np.arange(len(o)) / SR; shine = filt(o, 'highpass', 2600) * (0.5 + 0.5 * np.sin(2 * np.pi * 5.2 * t))
    return filt(o, 'highpass', 80) * 0.9 + 0.35 * shine
def breath_fx(a):
    """the prince: faint and breathy, a hush of air riding on the voice"""
    env = np.convolve(np.abs(a), np.ones(int(0.02 * SR)) / int(0.02 * SR), 'same')
    air = filt(filt(noise(len(a)), 'highpass', 1500), 'lowpass', 7000) * env * 1.6
    return filt(a, 'lowpass', 6500) * 0.95 + air
def gruff_fx(a):
    """the Emperor: lower, with a rough edge"""
    a = repitch(a, 0.95); return np.tanh(filt(a, 'lowpass', 4200) * 1.8) * 0.62
def flat_fx(a):
    """the machine's countdown: no expression, a faint buzz"""
    t = np.arange(len(a)) / SR; rm = a * np.sign(np.sin(2 * np.pi * 95 * t))
    return filt(0.7 * a + 0.35 * rm, 'bandpass', [200, 4200]) * 1.1
def small_fx(a):
    """the wish machine: polite and small, a little higher, through a little speaker in a tin belly"""
    a = repitch(a, 1.07); d = int(0.006 * SR); o = np.zeros(len(a) + d); o[:len(a)] += a; o[d:] += 0.3 * a
    return filt(o, 'bandpass', [320, 5200]) * 1.15
def boom_fx(a):
    """King Krool: huge and low, a chest that booms, a slap of the silver hall right behind every word"""
    a = repitch(a, 0.9); x = np.tanh(filt(a, 'lowpass', 5200) * 1.5) * 0.75 + 0.35 * filt(a, 'lowpass', 300)
    d = int(0.045 * SR); o = np.zeros(len(x) + d); o[:len(x)] += x; o[d:] += 0.28 * filt(x, 'lowpass', 1800); return o * 1.05
def tape_fx(a):
    """the recorder in the jug: narrow band, a little wow, hiss"""
    t = np.arange(len(a)) / SR; a = filt(a, 'bandpass', [300, 3400]) * (1 + 0.04 * np.sin(2 * np.pi * 0.7 * t))
    return a * 1.2 + filt(noise(len(a)), 'highpass', 4000) * 0.012
FX = {'silk': silk_fx, 'breath': breath_fx, 'gruff': gruff_fx, 'flat': flat_fx, 'small': small_fx, 'boom': boom_fx, 'tape': tape_fx}

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
PANW = {'T': -0.25, 'K': 0.25, 'M': -0.1, 'R': 0.15, 'N': 0.0, 'P': 0.2, 'C': 0.1, 'O': -0.1, 'B': 0.0}
shots = []; t = 0.0
for s in SCRIPT:
    sh = dict(shot=s['shot'], t0=round(t, 3), lines=[], room=s.get('room'))
    cur = 0.0
    for ln in s.get('lines', []):
        c = CAST[ln['who']]; sp = c['speed'] * (0.88 if ln.get('line') else 1.0)
        if 'many' in c:
            a = many(ln['say'], c['many'], False, seed=len(shots) * 10 + len(sh['lines'])); d = len(a[0]) / SR; mono = (a[0] + a[1]) / 2
        else:
            a = speak(ln['say'], c['voice'], sp)
            fx = ln.get('fx') or c.get('fx')
            if fx: a = FX[fx](a)
            d = len(a) / SR; mono = a
        if 'at' in ln: st = ln['at']
        elif 'after' in ln: st = sh['lines'][ln['after']]['t1'] + ln.get('pre', 0)
        else: st = cur + ln.get('pre', 0.6)
        hop = SR // 24; envl = [float(np.sqrt(np.mean(mono[i:i + hop] ** 2))) for i in range(0, len(mono), hop)]
        emax = max(envl) or 1; envl = [round(min(1, (v / emax) ** 0.7), 2) for v in envl]
        sh['lines'].append(dict(who=ln['who'], say=ln['say'], t0=round(st, 3), t1=round(st + d, 3), line=bool(ln.get('line')), env=envl, _a=a))
        cur = max(cur, st + d)
    sh['d'] = round(s['d'] if 'd' in s else cur + s.get('tail', 1.5), 3)
    L_ = sh['lines']; dd = sh['d']
    sh['cues'] = [dict({k: v for k, v in c.items() if k not in ('at', 'to')}, at=round(resolve(c['at'], L_, dd), 3), **({'to': round(resolve(c['to'], L_, dd), 3)} if 'to' in c else {})) for c in s.get('cues', [])]
    sh['cues'].sort(key=lambda c: c['at'])
    shots.append(sh); t += sh['d']
TOTAL = round(t, 3)

def dump():
    for sh in shots:
        for l in sh['lines']: l.pop('_a', None)
    json.dump(dict(shots=shots, dur=TOTAL, cast=CAST), open(os.path.join(HERE, 'timing', 'kk.json'), 'w'))
if os.environ.get('TIMING_ONLY'):
    for sh in shots:
        print(f"{sh['shot']:9s} t0={sh['t0']:7.2f} d={sh['d']:6.2f}", ' '.join(f"L{i}:{l['t0']:.1f}-{l['t1']:.1f}" for i, l in enumerate(sh['lines'])) if os.environ.get('V') else '')
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
def chirp(g=1.0):
    d = 0.14 + 0.06 * rng.random(); t = tt(d); f0 = rng.uniform(2200, 3200); f = f0 + 1400 * np.sin(np.pi * t / d) + 600 * np.sin(2 * np.pi * 22 * t)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * t / d) ** 0.7 * 0.18 * g
def cricket(g=1.0):
    t = tt(0.22); x = np.sin(2 * np.pi * 4300 * t) * (np.sin(2 * np.pi * 30 * t) > 0.2) * np.sin(np.pi * t / 0.22); return x * 0.05 * g
def murmur(d, g=1.0):
    t = tt(d); n = filt(noise(len(t)), 'bandpass', [260, 2600]); am = np.abs(np.sin(2 * np.pi * (3.1 * t + 0.8 * np.sin(2 * np.pi * 0.3 * t)))) ** 1.5 + 0.5 * np.abs(np.sin(2 * np.pi * 4.7 * t + 1.3)) ** 2
    return n * am * 0.35 * g * np.minimum(1, t / 0.3) * np.minimum(1, (d - t) / 0.3).clip(0)
def creak(d, f0=300, g=1.0):
    t = tt(d); f = f0 * (1 + 0.5 * np.sin(2 * np.pi * 3.5 * t) * 0.3 + 0.35 * t / d); x = np.sign(np.sin(2 * np.pi * np.cumsum(f) / SR)) * 0.5 + np.sin(2 * np.pi * np.cumsum(f * 1.5) / SR) * 0.2
    return filt(x, 'bandpass', [f0 * 0.9, f0 * 6]) * np.sin(np.pi * t / d) ** 0.7 * 0.22 * g
def bell(f=1320, g=1.0):
    t = tt(1.4); x = sum(a_ * np.sin(2 * np.pi * f * r_ * t) * np.exp(-t / (1.1 / (1 + r_ * 0.4))) for a_, r_ in [(1, 1), (0.5, 2.0), (0.4, 2.76), (0.25, 5.4)]); k = int(0.003 * SR); x[:k] += noise(k) * 0.4
    return x * 0.22 * g
def sparkle(g=1.0): return pluck(rng.choice([2093, 2637, 3136, 3951]), 0.5, 0.3) * 0.45 * g
def ting(f=3200, g=1.0): return metal(f, 0.5, 0.7) * g

def mhum(d, f0a, f0b, heavy=0.0, ga=0.3, gb=1.0, curve=2.0):
    """the machine: a hum whose pitch and level rise from (f0a, ga) to (f0b, gb); heavy adds weight and grit"""
    n = int(d * SR); t = np.arange(n) / SR; u = (t / max(d, 1e-3)) ** (1 / curve)
    f = f0a * (f0b / f0a) ** u; ph = 2 * np.pi * np.cumsum(f) / SR
    x = np.sin(ph) + 0.7 * np.sin(2 * ph + 0.4) + 0.45 * np.sin(3 * ph) + 0.25 * np.sin(4 * ph + 1) + 0.15 * np.sin(5.01 * ph) + 0.6 * np.sin(ph * 1.008)
    x += 0.3 * filt(brown(n), 'lowpass', 220)
    if heavy: x = np.tanh(x * (1 + 2.2 * heavy)) * (1.0 + 0.4 * heavy) + heavy * 0.5 * np.sin(0.5 * ph)
    am = (0.85 + 0.15 * np.sin(2 * np.pi * (4 + 6 * u) * t)) * (ga + (gb - ga) * u)
    am *= np.minimum(1, t / 0.3) * np.minimum(1, (d - t) / 0.3).clip(0)
    return x * am * 0.09
def winddown(d, f0, g=1.0):
    n = int(d * SR); t = np.arange(n) / SR; u = t / d; f = f0 * (1 - 0.82 * u ** 0.8); ph = 2 * np.pi * np.cumsum(f) / SR
    x = np.sin(ph) + 0.6 * np.sin(2 * ph) + 0.3 * np.sin(3 * ph)
    return x * (1 - u) ** 1.6 * np.minimum(1, t / 0.2) * 0.09 * g
def glass(g=1.0):
    """breaking glass: a bright crack, a scatter of shards, a low knock"""
    o = mx(noiseb(0.5, 2500, 12000, 0.07, 0.001) * 1.1, thud(140, 0.2, 0.35))
    for q in range(16):
        i = int((0.01 + rng.uniform(0, 0.7) * rng.random()) * SR); s = metal(rng.uniform(2600, 7500), rng.uniform(0.15, 0.4), rng.uniform(0.4, 0.9))
        o = mx(o, np.concatenate([np.zeros(i), s]))
    return o * g
def drip(g=1.0):
    t = tt(0.09); f = 900 + 1800 * (t / 0.09); return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.025) * 0.18 * g
def coo(g=1.0, f0=None, d=None):
    """a baby's coo, synthesized: a rising-falling vowel with a little wobble (no crying)"""
    d = d or rng.uniform(0.35, 0.7); f0 = f0 or rng.uniform(330, 470); t = tt(d); u = t / d
    f = f0 * (1 + 0.35 * np.sin(np.pi * u) - 0.15 * u) * (1 + 0.025 * np.sin(2 * np.pi * 7 * t)); ph = 2 * np.pi * np.cumsum(f) / SR
    x = sum(np.sin(k * ph) / k ** 1.3 for k in range(1, 9))
    x = filt(x, 'bandpass', [260, 1400]) + 0.3 * filt(x, 'bandpass', [2400, 3400])
    return x * np.sin(np.pi * u) ** 0.8 * 0.22 * g
def babble(g=1.0):
    """two quick syllables, ma-ma or da-da, from the same little voice"""
    d = rng.uniform(0.4, 0.6); f0 = rng.uniform(340, 520); t = tt(d); u = t / d
    f = f0 * (1 + 0.12 * np.sin(2 * np.pi * 1.4 * u)); ph = 2 * np.pi * np.cumsum(f) / SR
    x = sum(np.sin(k * ph) / k ** 1.2 for k in range(1, 9)); gate = np.clip(np.sin(2 * np.pi * 2 * u / 1.0 * 1.0 * 2 - 0.4), 0, 1) ** 0.6
    x = filt(x, 'bandpass', [300, 2000]) * gate
    return x * np.sin(np.pi * u) ** 0.4 * 0.2 * g
def bubbles(d, g=1.0, rate=7):
    o = np.zeros(int(d * SR)); tm = 0.0
    while tm < d - 0.15:
        tb = tt(rng.uniform(0.04, 0.09)); fb = rng.uniform(250, 700) * (1 + 3 * tb / tb[-1])
        b = np.sin(2 * np.pi * np.cumsum(fb) / SR) * np.exp(-tb / 0.02) * rng.uniform(0.3, 1.0)
        i = int(tm * SR); o[i:i + len(b)] += b[: len(o) - i]; tm += rng.exponential(1 / rate)
    return mx(o * 0.25, filt(brown(len(o)), 'lowpass', 300) * 0.25) * g
def pomf(g=1.0):
    """a cannon that fires something soft: a low cushioned thump and a breath of air"""
    return mx(thud(48, 0.7, 1.0), noiseb(0.6, 120, 1400, 0.16, 0.01) * 0.55, swell(0.8, 400, 2400, 0.08)) * g
def softland(g=1.0): return mx(thud(90, 0.18, 0.35), rustle(0.18, 0.8)) * g
def brass(f, d, g=1.0):
    t = tt(d); fr = f * (1 + 0.006 * np.sin(2 * np.pi * 5.5 * t) * np.minimum(1, t / 0.3)); ph = 2 * np.pi * np.cumsum(fr) / SR
    x = sum(np.sin(k * ph) * (0.9 ** k) / k ** 0.5 for k in range(1, 12)); x = filt(x, 'lowpass', 2600)
    return x * np.minimum(1, t / 0.04) * np.minimum(1, (d - t) / 0.12).clip(0) * 0.11 * g
def fanfare(g=1.0):
    o = np.zeros(int(3.2 * SR))
    for (st, f, d) in [(0.0, 392, 0.22), (0.24, 523, 0.22), (0.48, 659, 0.22), (0.72, 784, 1.6)]:
        for ff_ in ([f] if d < 1 else [f, f * 1.25, f * 1.5, f / 2]):
            b = brass(ff_, d, 1.0); i = int(st * SR); o[i:i + len(b)] += b[: len(o) - i]
    return o * g
def ratchet(d, g=1.0, rate=18):
    o = np.zeros(int(d * SR)); tm = 0.0
    while tm < d - 0.05: b = gear_tick(0.6); i = int(tm * SR); o[i:i + len(b)] += b[: len(o) - i]; tm += 1 / rate
    return o * g
def whisper(d, g=1.0):
    t = tt(d); n = filt(filt(noise(len(t)), 'highpass', 1800), 'lowpass', 7000); am = np.abs(np.sin(2 * np.pi * 3.6 * t + 1.7 * np.sin(2 * np.pi * 0.7 * t))) ** 2
    return n * am * 0.12 * g * np.minimum(1, t / 0.2) * np.minimum(1, (d - t) / 0.2).clip(0)
def sizzle(d, g=1.0):
    t = tt(d); return filt(noise(len(t)), 'highpass', 3000) * (0.6 + 0.4 * (rng.random(len(t)) > 0.97)) * np.minimum(1, t / 0.1) * np.minimum(1, (d - t) / 0.4).clip(0) * 0.08 * g
def roar(d, g=1.0):
    t = tt(d); return mx(filt(brown(len(t)), 'lowpass', 400) * 0.8, filt(noise(len(t)), 'bandpass', [300, 1800]) * 0.2) * np.minimum(1, t / 0.6) * np.minimum(1, (d - t) / 1.2).clip(0) * g

def eadd(El, Er, t, sig, g=1.0, pan=0.0):
    i = int(t * SR)
    if i < 0: sig = sig[-i:]; i = 0
    n = min(len(sig), len(El) - i)
    if n <= 0: return
    El[i:i + n] += sig[:n] * g * np.sqrt((1 - pan) / 2) * 1.414; Er[i:i + n] += sig[:n] * g * np.sqrt((1 + pan) / 2) * 1.414
def lerp_(a, b, u): return a + (b - a) * max(0, min(1, u))
def ticks(E, a, b, rate0, rate1, mk, g=1.0, pan_alt=0.4, jitter=0.0):
    t = a; j = 0
    while t < b:
        u = (t - a) / max(0.01, b - a); E(t, mk(), g, pan_alt * (1 if j % 2 else -1)); r = rate0 + (rate1 - rate0) * u
        t += 1.0 / r * (1 + jitter * rng.uniform(-1, 1)); j += 1
def steps(E, a, b, period, p0, p1, mk, g=1.0, jit=0.05):
    t = a
    while t < b:
        u = (t - a) / max(0.01, b - a); E(t, mk(g * (0.8 + 0.4 * rng.random())), 1.0, p0 + (p1 - p0) * u); t += period * (1 + jit * rng.uniform(-1, 1))




# ---------------- borrowed from A Good Shellacking ----------------
def clang(f=None, g=1.0, echo=True):
    """metal slapstick: a hard strike on a hollow body, then the ring"""
    f = f or rng.uniform(380, 620)
    o = mx(metal(f, 1.6, 1.6), metal(f * 1.37, 1.2, 1.0), metal(f * 2.21, 0.7, 0.6), thud(80, 0.3, 0.9), noiseb(0.06, 900, 7000, 0.015) * 0.9)
    if echo:
        for k, dl in enumerate([0.32, 0.61, 0.95]): o = mx(o, np.concatenate([np.zeros(int(dl * SR)), filt(o[: int(1.0 * SR)], 'lowpass', 2400 - k * 500) * (0.32 / (k + 1))]))
    return o * g
def whoosh(d=0.35, g=1.0):
    t = tt(d); f0 = 500; x = filt(noise(len(t)), 'bandpass', [400, 3000]) * np.sin(np.pi * t / d) ** 2; return x * 0.25 * g
def hoof(g=1.0): return mx(thud(110, 0.12, 0.5), metal(rng.uniform(1600, 2400), 0.06, 0.3), noiseb(0.04, 600, 3000, 0.012) * 0.3) * g
def gallop(E, a, b, p0, p1, g0, g1):
    t = a; k = 0
    while t < b:
        u = (t - a) / max(0.01, b - a)
        for q, dt in enumerate((0.0, 0.11, 0.22)): E(t + dt, hoof(lerp_(g0, g1, u) * (1.0 if q == 2 else 0.8)), 1.0, lerp_(p0, p1, u))
        t += 0.62; k += 1
def muffled(g=1.0):
    """a laugh held in behind a hand"""
    d = 0.22; t = tt(d); x = np.sin(2 * np.pi * np.cumsum(150 + 40 * np.sin(np.pi * t / d)) / SR); x = np.tanh(2 * x) * filt(noise(len(t)), 'lowpass', 600) * 0.6 + x * 0.3
    return filt(x, 'lowpass', 700) * np.sin(np.pi * t / d) * 0.3 * g
def sigh(g=1.0):
    t = tt(1.4); x = filt(filt(noise(len(t)), 'highpass', 400), 'lowpass', 2600) * np.sin(np.pi * t / 1.4) ** 2 * (1 - 0.4 * t / 1.4); return x * 0.18 * g
def lockclick(g=1.0): return mx(metal(1800, 0.06, 0.6), wood(0.6), metal(2600, 0.05, 0.4)) * g
def roomtone(d, g=1.0): return filt(brown(int(d * SR)), 'lowpass', 220) * 0.04 * g

# ---------------- this film's sounds ----------------
def swarm(d, r0, r1, g=1.0, lo=2500, hi=9000):
    """the beast: many tiny clicks, one per mark that moves; the rate rises from r0 to r1 per second"""
    n = int(d * SR); o = np.zeros(n); tm = 0.0
    while tm < d - 0.01:
        u = tm / max(d, 1e-3); k = int(rng.uniform(0.002, 0.006) * SR); c = filt(noise(k), 'bandpass', [lo, hi]) * np.exp(-np.arange(k) / (k / 3)) * rng.uniform(0.3, 1.0)
        if rng.random() < 0.3: c = c + metal(rng.uniform(3000, 7000), 0.02, 0.4)[:k]
        i = int(tm * SR); m = min(k, n - i); o[i:i + m] += c[:m]; tm += rng.exponential(1.0 / max(1, r0 + (r1 - r0) * u))
    return o * 0.5 * g
def boot_boom(g=1.0):
    """one of Krool's boots on the silver floor"""
    return mx(thud(52, 0.55, 1.3), noiseb(0.08, 200, 1800, 0.03) * 0.6, metal(rng.uniform(380, 520), 0.9, 0.35)) * g
def krool_laugh(g=1.0, n=6):
    """a huge 'ha, ha, ha': vowel pulses on a low voice, falling"""
    o = np.zeros(int((n * 0.26 + 0.6) * SR))
    for k in range(n):
        d = 0.22; t = tt(d); f0 = 92 * (1 - 0.03 * k) * (1 + 0.08 * np.sin(np.pi * t / d)); ph = 2 * np.pi * np.cumsum(f0) / SR
        x = sum(np.sin(j * ph) / j for j in range(1, 24)); x = filt(x, 'bandpass', [500, 1100]) * 1.4 + filt(x, 'bandpass', [1100, 1500]) * 0.6 + filt(noise(len(t)), 'bandpass', [600, 2500]) * 0.25
        x *= np.sin(np.pi * t / d) ** 0.6 * (1 - 0.08 * k); i = int(k * 0.26 * SR); o[i:i + len(x)] += x
    return np.tanh(o * 1.4) * 0.35 * g
def small_laugh(g=1.0, f=230, n=5):
    o = np.zeros(int((n * 0.16 + 0.4) * SR))
    for k in range(n):
        d = 0.11; t = tt(d); ph = 2 * np.pi * np.cumsum(f * (1 + 0.1 * np.sin(np.pi * t / d))) / SR; x = sum(np.sin(j * ph) / j for j in range(1, 14))
        x = filt(x, 'bandpass', [600, 2400]) * np.sin(np.pi * t / d); i = int(k * 0.16 * SR); o[i:i + len(x)] += x
    return o * 0.18 * g
def growl(d, g=1.0, f0=55):
    t = tt(d); f = f0 * (1 + 0.15 * np.sin(2 * np.pi * 3 * t)); ph = 2 * np.pi * np.cumsum(f) / SR
    x = np.tanh(3 * np.sin(ph)) * filt(noise(len(t)), 'lowpass', 700) + 0.5 * np.sin(ph)
    return filt(x, 'lowpass', 1400) * np.sin(np.pi * t / d) ** 0.5 * 0.5 * g
def dragon_roar(g=1.0): return mx(growl(1.4, 1.0, 48), roar(1.4, 0.6), noiseb(1.2, 300, 3000, 0.4) * 0.25) * g
def fire_puff(g=1.0): return mx(noiseb(0.7, 200, 2600, 0.25, 0.04) * 0.7, thud(70, 0.3, 0.3)) * g
def clawstep(g=1.0): return mx(thud(70, 0.16, 0.55), noiseb(0.05, 600, 3500, 0.015) * 0.3, metal(rng.uniform(1600, 2400), 0.05, 0.15)) * g
def wheels(d, g=1.0, rate=7):
    o = np.zeros(int(d * SR)); tm = 0.0
    while tm < d: b = mx(thud(110, 0.06, 0.25), noiseb(0.03, 800, 3000, 0.008) * 0.2); i = int(tm * SR); o[i:i + len(b)] += b[: len(o) - i]; tm += 1 / rate * rng.uniform(0.8, 1.2)
    return mx(o, rumble(d, 0.25)) * g
def low_chord(d, g=1.0): return padchord([55, 82.4, 110, 164.8], d, 0.16 * g, 0.8, 1.5)
def shimmer(d, g=1.0):
    t = tt(d); x = sum(np.sin(2 * np.pi * f * t + i) * (0.5 + 0.5 * np.sin(2 * np.pi * (3 + i) * t)) for i, f in enumerate([1760, 2217, 2637, 3322]))
    return x * np.minimum(1, t / 0.3) * np.minimum(1, (d - t) / 0.5).clip(0) * 0.02 * g
def jet(d, g=1.0):
    t = tt(d); return mx(filt(noise(len(t)), 'bandpass', [200, 2400]) * 0.5, rumble(d, 0.6)) * np.minimum(1, t / 0.4) * np.minimum(1, (d - t) / 1.0).clip(0) * g
def glassbells(d=2.4, g=1.0):
    """a cluster of little glass bells, shaken: many high bell notes, irregular"""
    o = np.zeros(int((d + 1.5) * SR)); tm = 0.0
    while tm < d: b = bell(rng.choice([2349, 2637, 2960, 3136, 3520, 3951]), 0.5 * (1 - tm / d * 0.6)); i = int(tm * SR); o[i:i + len(b)] += b[: len(o) - i]; tm += rng.uniform(0.04, 0.16)
    return o * g
def watch_tick(g=1.0): return mx(metal(4200, 0.03, 0.5), noiseb(0.01, 3000, 9000, 0.003) * 0.4) * g
def stamp(g=1.0): return mx(thud(90, 0.2, 0.9), wood(0.8), noiseb(0.04, 400, 2500, 0.01) * 0.5) * g
def paperslide(g=1.0): return swell(0.45, 1500, 8000, 0.25) * g
def typing(d, g=1.0):
    o = np.zeros(int(d * SR)); tm = 0.0
    while tm < d - 0.05: b = mx(metal(rng.uniform(1800, 2600), 0.03, 0.4), wood(0.25)); i = int(tm * SR); o[i:i + len(b)] += b[: len(o) - i]; tm += rng.uniform(0.07, 0.15)
    return o * 0.6 * g
def hammering(d, g=1.0):
    o = np.zeros(int(d * SR)); tm = 0.0; k = 0
    while tm < d - 0.2: b = clang(rng.uniform(500, 900), 0.4, False) if k % 3 else mx(metal(rng.uniform(900, 1400), 0.3, 0.6), thud(120, 0.1, 0.4)); i = int(tm * SR); o[i:i + len(b)] += b[: len(o) - i]; tm += rng.choice([0.32, 0.32, 0.64]); k += 1
    return o * g
def shanty_hum(d, g=1.0):
    """two constructors humming a sea song through closed mouths: no words, just the tune"""
    tune = [(62, 1), (62, 0.5), (62, 0.5), (62, 1), (57, 1), (60, 1), (60, 0.5), (60, 0.5), (60, 1), (55, 1), (62, 1), (64, 1), (65, 1), (67, 1), (65, 1), (64, 1), (62, 2)]
    o = np.zeros(int(d * SR)); tm = 0.0; beat = 0.42
    while tm < d - 0.5:
        for m, b in tune:
            if tm >= d - 0.3: break
            f = 440 * 2 ** ((m - 69) / 12) / 2; dd = b * beat; t = tt(dd); ph = 2 * np.pi * np.cumsum(f * (1 + 0.012 * np.sin(2 * np.pi * 5 * t))) / SR
            x = sum(np.sin(j * ph) / j ** 1.6 for j in range(1, 10)); x = filt(x, 'lowpass', 900) * np.minimum(1, t / 0.05) * np.minimum(1, (dd - t) / 0.06).clip(0)
            i = int(tm * SR); m_ = min(len(x), len(o) - i); o[i:i + m_] += x[:m_]; tm += dd
    return o * 0.12 * g
def squeak(g=1.0):
    t = tt(0.08); return np.sin(2 * np.pi * np.cumsum(3200 + 900 * np.sin(np.pi * t / 0.08)) / SR) * np.sin(np.pi * t / 0.08) * 0.08 * g
def chalk(d, g=1.0): return scratch(d, 1.2 * g)
def bark(g=1.0):
    t = tt(0.16); f = 520 * (1 - 0.4 * t / 0.16); x = np.sign(np.sin(2 * np.pi * np.cumsum(f) / SR)) * np.exp(-t / 0.08); return filt(x, 'bandpass', [400, 3000]) * 0.12 * g
def laser_hiss(d=0.6, g=1.0):
    t = tt(d); x = np.sin(2 * np.pi * np.cumsum(2400 - 1600 * t / d) / SR) * 0.4 + filt(noise(len(t)), 'highpass', 3000) * 0.5; return x * np.exp(-t / (d / 2)) * 0.3 * g
def slice_(g=1.0): return mx(whoosh(0.3, 1.2), metal(2600, 0.25, 0.5), noiseb(0.06, 2000, 9000, 0.02) * 0.4) * g
def cannon_boom(g=1.0): return mx(thud(40, 1.2, 1.6), noiseb(1.4, 60, 1500, 0.35, 0.003) * 1.2, swell(1.2, 300, 1500, 0.1)) * g
def police_whistle(d=0.8, g=1.0):
    t = tt(d); f = 2900 * (1 + 0.04 * np.sign(np.sin(2 * np.pi * 28 * t))); x = np.sin(2 * np.pi * np.cumsum(f) / SR) * 0.6 + filt(noise(len(t)), 'bandpass', [2500, 3500]) * 0.3
    return x * np.minimum(1, t / 0.02) * np.minimum(1, (d - t) / 0.05).clip(0) * 0.2 * g
def whirr(d, g=1.0, f0=60, f1=180):
    t = tt(d); f = f0 + (f1 - f0) * np.minimum(1, t / (d * 0.4)); ph = 2 * np.pi * np.cumsum(f) / SR; return (np.sign(np.sin(ph)) * 0.3 + filt(noise(len(t)), 'bandpass', [300, 1500]) * np.abs(np.sin(ph * 0.5))) * np.minimum(1, t / 0.2) * np.minimum(1, (d - t) / 0.6).clip(0) * 0.25 * g
def torches(d, g=1.0):
    o = np.zeros(int(d * SR)); tm = 0.0
    while tm < d - 0.05: b = noiseb(0.02, 1500, 7000, 0.005) * rng.uniform(0.2, 1); i = int(tm * SR); o[i:i + len(b)] += b[: len(o) - i]; tm += rng.exponential(0.07)
    return mx(o * 0.25, filt(brown(len(o)), 'lowpass', 300) * 0.12) * g
def crumble(d, g=1.0): return mx(swarm(d, 300, 40, 0.8, 1200, 6000), swell(d, 600, 5000, 0.18)) * g
def firework(g=1.0): return mx(noiseb(0.9, 100, 4000, 0.25, 0.002) * 0.7, thud(60, 0.5, 0.5), sizzle(1.2, 2.0)) * g
def band(d, g=1.0):
    """an eighty-piece band, reduced: a brass tune in thirds and a bass drum"""
    tune = [(67, 0.5), (72, 0.5), (76, 0.5), (72, 0.5), (74, 0.5), (77, 0.5), (79, 1.0), (76, 0.5), (72, 0.5), (74, 0.5), (71, 0.5), (72, 1.0)]
    o = np.zeros(int(d * SR)); tm = 0.0; beat = 0.42
    while tm < d - 0.4:
        for m, b in tune:
            if tm >= d - 0.3: break
            f = 440 * 2 ** ((m - 69) / 12); dd = b * beat
            for ff in (f, f * 0.8): x = brass(ff, dd * 0.95, 0.9); i = int(tm * SR); mm = min(len(x), len(o) - i); o[i:i + mm] += x[:mm]
            tm += dd
    tm = 0.0
    while tm < d - 0.2: x = thud(60, 0.3, 0.7); i = int(tm * SR); mm = min(len(x), len(o) - i); o[i:i + mm] += x[:mm]; tm += beat * 2
    return o * g
def choir(d, g=1.0):
    """a children's choir on 'ah', synthesized: a bright chord with vibrato and a soft vowel"""
    t = tt(d); o = np.zeros(len(t))
    for k, f in enumerate([523.3, 659.3, 784.0, 1046.5]):
        for v in range(3):
            fr = f * (1 + 0.004 * (v - 1)) * (1 + 0.01 * np.sin(2 * np.pi * (5.2 + v * 0.3) * t + k)); ph = 2 * np.pi * np.cumsum(fr) / SR
            o += sum(np.sin(j * ph) / j ** 1.4 for j in range(1, 6))
    o = filt(o, 'bandpass', [600, 1600]) * 0.8 + filt(o, 'bandpass', [2500, 3400]) * 0.25
    return o * np.minimum(1, t / 0.4) * np.minimum(1, (d - t) / 0.5).clip(0) * 0.02 * g
def radio_crackle(d, g=1.0):
    t = tt(d); x = filt(noise(len(t)), 'bandpass', [800, 5000]) * (0.3 + 0.7 * (rng.random(len(t)) > 0.995)) * (0.6 + 0.4 * np.sin(2 * np.pi * 3 * t))
    x += np.sin(2 * np.pi * 1200 * t) * (np.sin(2 * np.pi * 4 * t) > 0.7) * 0.15
    return x * np.minimum(1, t / 0.05) * np.minimum(1, (d - t) / 0.1).clip(0) * 0.25 * g
def sandstorm(d, g=1.0):
    t = tt(d); x = filt(noise(len(t)), 'bandpass', [300, 4000]) * (0.6 + 0.4 * np.sin(2 * np.pi * 1.3 * t)); return mx(x * 0.5, swarm(d, 200, 900, 0.6), rumble(d, 0.4)) * (t / d) ** 1.2 * g
def hot_wind(d, g=1.0): return mx(swell(d, 200, 3000, 0.6), crumble(d, 0.6), filt(brown(int(d * SR)), 'lowpass', 400) * 0.3 * np.sin(np.pi * tt(d) / d)) * g
def crowd_cheer(d, g=1.0): return mx(murmur(d, 0.25), filt(noise(int(d * SR)), 'bandpass', [600, 3000]) * 0.08 * np.sin(np.pi * tt(d) / d)) * g
def yawn(g=1.0):
    d = 1.2; t = tt(d); f = 180 * (1 + 0.5 * np.sin(np.pi * t / d)) * (1 - 0.3 * t / d); ph = 2 * np.pi * np.cumsum(f) / SR
    x = sum(np.sin(j * ph) / j for j in range(1, 16)); return filt(x, 'bandpass', [300, 1200]) * np.sin(np.pi * t / d) * 0.09 * g
def raspberry(g=1.0):
    t = tt(0.5); return filt(np.sign(np.sin(2 * np.pi * 70 * t)) * (1 + 0.5 * noise(len(t))), 'bandpass', [150, 1800]) * np.sin(np.pi * t / 0.5) * 0.1 * g
def pencil_snap(g=1.0): return mx(noiseb(0.04, 1500, 9000, 0.008, 0.001) * 1.3, wood(0.9), metal(1900, 0.06, 0.3)) * g
def blocks(E, a, b, g=1.0):
    """the paper battle's little score: woodblock and a plucked bass on a two-bar loop"""
    pat = [(0, 'b', 98), (0.5, 'w', 0), (1.0, 'w', 0), (1.25, 'w', 0), (1.5, 'b', 147), (2.0, 'w', 0), (2.5, 'b', 110), (3.0, 'w', 0), (3.25, 'w', 0), (3.5, 'w', 0)]
    tm = a; beat = 0.36
    while tm < b:
        for off, k, f in pat:
            x = tm + off * beat * 2
            if x >= b: break
            E(x, pluck(f, 0.35, 0.6) * 1.1 if k == 'b' else mx(thud(700, 0.05, 0.25), noiseb(0.02, 1500, 5000, 0.005) * 0.3), g, 0.0 if k == 'b' else 0.3)
        tm += beat * 8

ROOM = {'lawn': (0.8, 0.08), 'hall': (3.2, 0.36), 'room': (0.8, 0.1), 'veranda': (0.6, 0.06), 'paper': (0.6, 0.08), 'shop': (1.2, 0.14), 'field': (0.9, 0.06), 'court': (2.2, 0.28), 'port': (0.9, 0.07), None: (1.0, 0.12)}
PACEP, PACEN = 0.6, 10
def pace_times(sh, a, b):
    """the same step clock the picture uses: steps every PACEP seconds of walking, none during the fulcrum line"""
    fu = [l for l in sh['lines'] if l['line']]; ps, pe = (fu[0]['t0'] - 0.4, fu[0]['t1'] + 0.6) if fu else (1e9, 1e9)
    out = []; k = 0
    while True:
        t = a + k * PACEP
        if t >= ps: t += (pe - ps)
        if t >= b: break
        out.append(t); k += 1
    return out

def design(sh):
    d = sh['d']; name = sh['shot']; rt, wet = ROOM.get(sh['room'], ROOM[None])
    n = int((d + 1.0) * SR); El = np.zeros(n); Er = np.zeros(n)
    E = lambda t, sig, g=1.0, pan=0.0: eadd(El, Er, t, sig, g, pan)
    cues = sh['cues']; C = lambda k: [c for c in cues if c['k'] == k]; one = lambda k: C(k)[0]
    LN = sh['lines']
    if name == 'offer':
        sg, bl, ld, st, bd, lf, rd = one('sign'), one('blue'), one('land'), one('stair'), one('board'), one('lift'), one('road')
        lg, bt, ri, ha, pc, la, cr, pt = one('lunge'), one('beat'), one('ride'), one('hall'), one('pace'), one('laugh'), one('crystal'), one('pit')
        E(0.0, padchord([110, 146.8, 220], ld['at'], 0.05, 1.5, 0.8), 1.0, 0.0)
        for q in range(26): E(sg['at'] + q * (sg['to'] - sg['at']) / 26 + rng.uniform(0, 0.2), sparkle(0.5), 1.0, rng.uniform(-0.8, 0.8))
        E(bl['at'], low_chord(ld['at'] - bl['at'] + 1.0, 1.0), 1.0, 0.0); E(bl['at'], shimmer(ld['at'] - bl['at'] + 0.5, 1.2), 1.0, 0.0)
        E(ld['at'], jet(ld['to'] - ld['at'] + 0.4, 0.6), 1.0, 0.3); E(ld['to'] - 0.3, mx(thud(50, 0.6, 1.1), noiseb(0.5, 200, 2000, 0.15) * 0.4), 1.0, 0.3)
        E(ld['to'], roomtone(rd['at'] - ld['to'], 0.5), 1.0, 0.0)
        for q in range(8): E(ld['to'] + 0.5 + q * 2.4 + rng.uniform(0, 1), chirp(0.4), 1.0, rng.uniform(-0.8, 0.8))
        E(st['at'] - 0.5, bubbles(lf['at'] - st['at'] + 0.4, 0.35, 10), 1.0, 0.3)
        steps(E, st['at'] + 0.2, st['to'] - 0.4, 0.38, 0.2, -0.1, lambda g: mx(metal(rng.uniform(1700, 2300), 0.06, 0.3), thud(160, 0.06, 0.2)) * g, 0.7)
        E(st['at'], sizzle(bd['at'] - st['at'], 0.5), 1.0, -0.1)
        steps(E, bd['at'] - 0.3, bd['to'] + 0.4, 0.3, -0.2, 0.2, lambda g: mx(metal(rng.uniform(1700, 2300), 0.06, 0.3), thud(160, 0.06, 0.2)) * g, 0.7)
        E(lf['at'], jet(lf['to'] - lf['at'] + 1.2, 1.3), 1.0, 0.2); E(lf['at'], roar(lf['to'] - lf['at'] + 1.0, 0.6), 1.0, 0.0)
        # the dragon carriage
        E(rd['at'], roomtone(ha['at'] - rd['at'], 0.6), 1.0, 0.0)
        E(rd['at'] + 0.3, growl(lg['at'] - rd['at'], 0.4, 60), 1.0, 0.4)
        E(lg['at'] - 0.2, dragon_roar(1.0), 1.0, 0.3); E(lg['at'] + 0.4, dragon_roar(0.8), 1.0, 0.6); E(lg['at'] + 0.1, fire_puff(0.8), 1.0, 0.2)
        tm = bt['at']
        while tm < bt['to']: E(tm, mx(wood(1.0), thud(130, 0.1, 0.5)), 1.0, rng.uniform(0.2, 0.7)); tm += rng.uniform(0.18, 0.3)
        E(bt['at'] + 0.5, growl(1.0, 0.6, 70), 1.0, 0.5)
        tm = ri['at']
        while tm < ri['to']: E(tm, clawstep(0.8), 1.0, rng.uniform(0.1, 0.7)); tm += rng.uniform(0.09, 0.16)
        E(ri['at'], wheels(ri['to'] - ri['at'], 0.9, 9), 1.0, -0.2); E(ri['at'] + 1.0, dragon_roar(0.5), 1.0, 0.5); E(ri['at'] + 0.6, fire_puff(0.5), 1.0, 0.6)
        # the skull hall
        E(ha['at'], roomtone(d - ha['at'] + 0.5, 1.4), 1.0, 0.0)
        for q, t in enumerate(pace_times(sh, pc['at'], d)): E(t, boot_boom(0.5), 1.0, 0.3 * (1 if (q // PACEN) % 2 == 0 else -1))
        E(la['at'], krool_laugh(1.0, 7), 1.0, 0.1)
        E(cr['at'], glass(0.6), 1.0, 0.0)
        E(pt['at'] - 0.2, swell(2.5, 60, 400, 0.6), 1.0, 0.0); E(pt['at'], whisper(1.8, 0.6), 1.0, 0.0)
    elif name == 'terms':
        pc, la, cl, co, ga, wi = one('pace'), one('laugh'), one('clap'), one('corridor'), one('garden'), one('wind')
        E(0, roomtone(co['at'] + 0.5, 1.4), 1.0, 0.0)
        for q, t in enumerate(pace_times(sh, pc['at'], pc['to'])): E(t, boot_boom(0.5), 1.0, 0.3 * (1 if (q // PACEN) % 2 == 0 else -1))
        E(la['at'], krool_laugh(0.9, 4), 1.0, 0.1)
        E(cl['at'], mx(noiseb(0.08, 500, 6000, 0.02, 0.001) * 2.0, thud(90, 0.2, 0.8)), 1.0, 0.0)
        for q in range(18): E(cl['at'] + q * 0.04, noiseb(0.03, 3000, 9000, 0.006) * 0.4, 1.0, -0.8 + q * 0.09)
        steps(E, cl['at'] + 0.6, co['at'], 0.4, 0.4, 0.0, march, 0.7)
        steps(E, co['at'], ga['at'], 0.36, -0.5, 0.5, march, 0.6)
        E(ga['at'], wind(d - ga['at'] + 0.5, 0.12), 1.0, 0.0)
        steps(E, ga['at'] + 0.2, d - 0.3, 0.6, -0.3, 0.3, dirtstep, 0.6)
        t_ = tt(wi['to'] - wi['at'] + 0.5); wh_ = sum(np.sin(2 * np.pi * f * t_) * (0.5 + 0.5 * np.sin(2 * np.pi * (0.3 + k * 0.17) * t_ + k)) for k, f in enumerate([620, 930, 1240])) * 0.03
        E(wi['at'], mx(wh_ * np.minimum(1, t_ / 0.6), swell(len(t_) / SR, 400, 2500, 0.25)), 1.0, 0.4)
    elif name == 'work':
        ra_, fl, dr, dn = one('rant'), one('flop'), one('draft'), one('dinner')
        E(0, roomtone(d + 0.5, 0.8), 1.0, 0.0)
        steps(E, ra_['at'], ra_['to'], 0.33, -0.5, 0.5, footstep, 0.8)
        for q in range(5): E(ra_['at'] + 0.4 + q * 0.8, muffled(1.6), 1.0, rng.uniform(-0.5, 0.2))
        E(fl['at'], mx(thud(80, 0.3, 0.8), rustle(0.4, 1.5), creak(0.4, 180, 0.5)), 1.0, -0.4)
        E(dr['at'], scratch(dr['to'] - dr['at'], 1.5), 1.0, 0.0); E(dr['at'] + 0.3, scratch(dr['to'] - dr['at'] - 0.3, 1.2), 1.0, 0.5)
        E(dn['at'], murmur(d - dn['at'], 0.06), 1.0, 0.0)
        for q in range(4): E(dn['at'] + 0.4 + q * 0.9, ting(rng.uniform(2800, 3800), 0.4), 1.0, rng.uniform(-0.5, 0.5))
    elif name == 'veranda':
        li, sv = one('lights'), one('servants')
        E(0, wind(d + 0.5, 0.05), 1.0, 0.0)
        for q in range(int(d / 0.9)): E(0.3 + q * 0.9 + rng.uniform(0, 0.3), cricket(0.9), 1.0, rng.uniform(-0.9, 0.9))
        for q in range(5): E(1.0 + q * 6.5 + rng.uniform(0, 2), chirp(0.25), 1.0, rng.uniform(-0.9, 0.9))
        steps(E, sv['at'], sv['at'] + 2.2, 0.34, 0.8, 0.4, footstep, 0.6)
        for q in range(3): E(sv['at'] + 0.3 + q * 0.7, ting(rng.uniform(2400, 3000), 0.25), 1.0, 0.6)
        for q in range(3): E(sv['at'] + 1.4 + q * 0.5, chirp(0.6), 1.0, 0.8)
    elif name == 'paper':
        sn, rad, dv, as_, gr, ch, ho, wh, jg, tp, dn, la, hq = C('snap'), one('radical'), one('deriv'), one('asym'), one('grow'), one('chain'), one('horns'), one('wham'), one('jug'), one('tape'), one('down'), one('laugh'), one('hq')
        E(0, roomtone(d + 0.5, 0.6), 1.0, 0.0)
        blocks(E, 0.6, jg['at'] - 0.2, 0.9)
        tm = 0.4
        while tm < jg['at'] - 0.3: E(tm, scratch(rng.uniform(0.3, 0.8), 1.2), 1.0, rng.uniform(-0.6, 0.6)); tm += rng.uniform(0.4, 0.9)
        for c in sn: E(c['at'], pencil_snap(1.0), 1.0, 0.3 if c['n'] == 1 else -0.3)
        E(rad['at'] - 0.3, whoosh(0.5, 1.0), 1.0, 0.3)
        for q in range(3): E(dv['at'] + q * 0.4, whoosh(0.3, 0.6), 1.0, 0.2); E(dv['at'] + q * 0.4 + 0.5, pop(1.0), 1.0, 0.3)
        t_ = tt(1.6); E(as_['at'], np.sin(2 * np.pi * np.cumsum(500 + 900 * np.sin(np.pi * t_ / 1.6)) / SR) * np.sin(np.pi * t_ / 1.6) * 0.07, 1.0, 0.4)
        t_ = tt(0.9); E(gr['at'], np.sin(2 * np.pi * np.cumsum(200 * 2 ** (t_ / 0.45)) / SR) * np.sin(np.pi * t_ / 0.9) * 0.08, 1.0, 0.4)
        for q in range(8): E(ch['at'] + q * 0.06, metal(rng.uniform(3000, 5000), 0.08, 0.35), 1.0, -0.3)
        E(ho['at'], growl(0.8, 0.5, 90), 1.0, 0.3); steps(E, ho['at'] + 0.4, wh['at'], 0.12, 0.4, -0.1, lambda g: thud(150, 0.06, 0.3) * g, 1.0)
        E(wh['at'], mx(thud(60, 0.6, 1.4), noiseb(0.3, 300, 5000, 0.08, 0.002), metal(900, 0.5, 0.4)), 1.0, 0.0)
        # headquarters, and the recording
        E(jg['at'], roomtone(tp['at'] - jg['at'], 1.2), 1.0, 0.0)
        E(jg['at'] + 0.6, mx(wood(1.0), metal(1200, 0.2, 0.4), creak(0.5, 300, 0.6)), 1.0, -0.1); E(jg['at'] + 1.8, mx(metal(1800, 0.05, 0.6), wood(0.6)), 1.0, 0.1)
        E(tp['at'] - 0.2, mx(filt(noise(int((tp['to'] - tp['at'] + 1.0) * SR)), 'highpass', 3500) * 0.02, mhum(tp['to'] - tp['at'] + 1.0, 50, 52, 0.0, 0.5, 0.5)), 1.0, 0.0)
        E(dn['at'] + 0.5, mx(thud(80, 0.3, 0.7), wood(0.5)), 1.0, 0.0)
        for q, f in enumerate([230, 160]): E(la['at'] + q * 0.2, filt(small_laugh(1.6, f, 7), 'bandpass', [300, 3400]), 1.0, -0.3 + q * 0.6)
        E(hq['at'], roomtone(d - hq['at'] + 0.5, 1.0), 1.0, 0.0)
        for q in range(5): E(hq['at'] + 0.4 + q * 0.7, chirp(0.4), 1.0, rng.uniform(0.3, 0.9))
        E(hq['at'] + 1.2, sigh(1.0), 1.0, -0.3); E(hq['at'] + 2.2, sigh(0.8), 1.0, 0.3)
    elif name == 'shop':
        fm, cf, lb, ms, wg, ct, pw, sl, cn, be = C('form'), one('chief'), one('lab'), one('mouse'), one('wagon'), one('curtain'), one('powder'), one('seal'), one('count'), one('bells')
        E(0, roomtone(wg['at'] + 0.5, 0.8), 1.0, 0.0)
        # under the paperwork: the basement workshop, hammering and humming a sea song
        E(0.2, hammering(cf['at'] - 0.2, 0.35), 1.0, -0.4); E(0.6, shanty_hum(cf['at'] - 0.6, 1.0), 1.0, 0.2)
        fms = sorted(fm, key=lambda c: c['n'])
        for i, q in enumerate(fms):
            nxt = fms[i + 1]['at'] if i + 1 < len(fms) else cf['at']; a, b = q['at'] + 0.4, nxt - 0.8
            E(q['at'], paperslide(1.0), 1.0, 0.5); E(a, typing(max(0.2, b - a), 0.8), 1.0, 0.0)
            if q['n'] < 2: E(a + 0.9 * (b - a), stamp(1.0), 1.0, 0.2)
        E(cf['at'] + 0.6, mx(thud(70, 0.4, 0.8), wood(0.6)), 1.0, 0.1); steps(E, cf['at'] + 0.9, cf['to'] + 0.2, 0.3, 0.0, 0.8, footstep, 0.8)
        for q in range(14): E(ms['at'] + q * (ms['to'] - ms['at']) / 14, squeak(1.0), 1.0, -0.6 + q * 0.09)
        E(ms['at'], chalk(ms['to'] - ms['at'], 1.0), 1.0, 0.0); E(ms['at'], bubbles(ms['to'] - ms['at'], 0.3, 8), 1.0, 0.2)
        E(lb['at'], murmur(ms['at'] - lb['at'], 0.05), 1.0, 0.0); E(ms['to'] - 0.4, murmur(1.4, 0.1), 1.0, 0.0)
        E(wg['at'], wind(cn['at'] - wg['at'], 0.05), 1.0, 0.0); E(wg['at'], wheels(1.6, 0.7, 14), 1.0, -0.3)
        E(ct['at'], rustle(ct['to'] - ct['at'] + 0.3, 2.0), 1.0, 0.2); E(ct['at'] + 0.2, glassbells(0.5, 0.25), 1.0, 0.2)
        tm = pw['at']
        while tm < pw['to']: E(tm, rustle(0.12, 1.2), 1.0, rng.uniform(-0.3, 0.3)); tm += 0.15
        E(sl['at'], mx(creak(0.5, 200, 0.6), thud(70, 0.3, 1.0), lockclick(1.0)), 1.0, -0.2)
        span = cn['to'] - cn['at']
        for q in range(15): E(cn['at'] + q / 14.5 * span, watch_tick(0.9), 1.0, 0.0)
        E(be['at'], filt(glassbells(2.4, 0.9), 'lowpass', 6000), 1.0, 0.0)
    elif name == 'hunt':
        ir, fd, tr, wg, dr, bm, ct, fm, hd, ey = one('irons'), one('field'), one('trumpet'), one('wagon'), one('door'), one('boom'), one('curtain'), one('form'), one('hounds'), one('eyes')
        gw, chp, rg, yw, fi, ns, lp, wh, cf, gg, aw = one('grow'), one('chop'), one('regroup'), one('yawn'), one('fire'), one('nose'), one('leap'), one('whistle'), one('cuff'), one('gig'), one('away')
        cs = sorted(C('cut'), key=lambda c: c['n']); c0, c1 = cs[0], cs[1]
        E(0, roomtone(fd['at'] + 0.4, 1.4), 1.0, 0.0)
        tm = ir['at']
        while tm < ir['to'] + 0.6: E(tm, metal(rng.uniform(1100, 1500), 0.3, 0.7), 1.0, 0.4); tm += 0.42
        E(ir['at'] + 0.1, small_laugh(1.0, 260, 6), 1.0, -0.3)
        E(fd['at'], wind(d - fd['at'] + 0.5, 0.06), 1.0, 0.0)
        gallop(E, fd['at'] + 0.2, fd['at'] + 4.0, -0.9, -0.4, 0.4, 0.9)
        E(tr['at'], fanfare(0.8), 1.0, -0.5); E(tr['at'] + 0.06, fanfare(0.5), 1.0, -0.2)
        E(wg['at'], wheels(wg['to'] - wg['at'] + 0.4, 0.8, 16), 1.0, 0.6); E(dr['at'], creak(0.8, 160, 1.0), 1.0, 0.6)
        E(bm['at'], cannon_boom(1.3), 1.0, 0.5); E(bm['at'] + 0.1, sandstorm(1.2, 0.8), 1.0, 0.2)
        E(bm['at'] + 1.2, swarm(ct['at'] - bm['at'] - 1.2, 600, 300, 0.7), 1.0, 0.0)
        E(ct['at'], glassbells(ct['to'] - ct['at'] - 0.4, 0.6), 1.0, -0.1)
        E(fm['at'], swarm(fm['to'] - fm['at'], 500, 60, 0.8), 1.0, 0.0)
        tm = hd['at']
        while tm < hd['to'] + 0.3: E(tm, bark(1.0), 1.0, rng.uniform(-0.8, -0.2)); tm += rng.uniform(0.1, 0.25)
        steps(E, hd['at'], hd['to'], 0.08, -0.8, -0.2, lambda g: thud(200, 0.04, 0.2) * g, 0.8)
        E(ey['at'], laser_hiss(0.7, 1.4), 1.0, -0.2); E(ey['at'] + 0.3, mx(thud(80, 0.3, 0.6), noiseb(0.4, 300, 3000, 0.1) * 0.5), 1.0, -0.4)
        gallop(E, c0['at'] - 1.2, c0['at'] - 0.2, -0.6, -0.2, 0.7, 0.9)
        E(c0['at'] - 0.1, slice_(1.0), 1.0, -0.1); E(c0['at'], swarm(0.9, 500, 80, 0.6), 1.0, -0.2); E(c0['at'] + 0.5, softland(1.0), 1.0, -0.3)
        E(gw['at'], swarm(0.9, 80, 500, 0.6), 1.0, -0.1)
        E(c1['at'] - 0.1, slice_(1.1), 1.0, 0.0); E(c1['at'], swarm(1.2, 900, 200, 0.8), 1.0, 0.0)
        steps(E, c1['at'] + 1.0, chp['at'], 0.14, -0.2, 0.2, lambda g: thud(260, 0.04, 0.15) * g, 0.6)
        tm = chp['at']
        while tm < chp['to']: E(tm, slice_(0.7), 1.0, rng.uniform(-0.4, 0.4)); tm += 0.18
        E(chp['at'], swarm(chp['to'] - chp['at'] + 0.4, 400, 1600, 0.9), 1.0, 0.0)
        E(rg['at'] - 0.4, swarm(rg['to'] - rg['at'] + 0.9, 1600, 60, 0.9), 1.0, 0.0)
        E(yw['at'], yawn(1.0), 1.0, -0.1)
        E(fi['at'] - 0.6, mx(metal(800, 0.2, 0.5), wood(0.6)), 1.0, -0.3); E(fi['at'], mx(shimmer(1.0, 6.0), swell(1.0, 2000, 8000, 0.15)), 1.0, -0.1); E(fi['at'] + 0.9, mx(thud(50, 0.4, 0.6), swarm(0.6, 400, 50, 0.5)), 1.0, 0.0)
        E(ns['at'] + 0.4, raspberry(1.0), 1.0, 0.0)
        E(lp['at'], whoosh(0.8, 1.5), 1.0, 0.0); E(lp['at'], swarm(lp['to'] - lp['at'], 200, 1500, 0.9), 1.0, 0.0); E(lp['to'], pop(1.2), 1.0, -0.1)
        E(lp['to'] + 0.7, mx(thud(110, 0.15, 0.6), thud(120, 0.15, 0.5)), 1.0, -0.1)
        E(wh['at'], police_whistle(0.9, 1.0), 1.0, -0.2)
        for q in range(2): E(cf['at'] + q * 0.25, mx(metal(2400, 0.08, 0.7), metal(1800, 0.05, 0.5)), 1.0, 0.0)
        E(gg['at'], swarm(gg['to'] - gg['at'], 300, 800, 0.5), 1.0, 0.0); E(gg['at'] + 0.4, creak(0.8, 260, 0.7), 1.0, 0.0)
        E(aw['at'], whirr(aw['to'] - aw['at'] + 0.5, 1.2), 1.0, 0.4); E(aw['at'], wheels(aw['to'] - aw['at'], 0.8, 18), 1.0, 0.6); E(aw['at'] + 0.3, swell(2.5, 300, 3000, 0.3), 1.0, 0.7)
    elif name == 'sentence':
        en, hn, du, le, un = one('enter'), one('hand'), one('dust'), one('letter'), one('unchain')
        E(0, torches(d + 0.5, 1.0), 1.0, 0.0)
        steps(E, en['at'], en['to'], 0.42, -0.7, 0.2, march, 0.7)
        tm = en['at']
        while tm < en['to'] + 0.3: E(tm, metal(rng.uniform(3000, 4500), 0.15, 0.25), 1.0, -0.3); tm += rng.uniform(0.08, 0.2)
        E(hn['at'], rustle(0.5, 1.6), 1.0, 0.3); E(du['at'], crumble(1.6, 1.0), 1.0, 0.2)
        E(le['at'], mx(rustle(0.6, 2.0), creak(0.3, 600, 0.2)), 1.0, 0.0)
        E(un['at'], mx(metal(900, 0.5, 0.8), metal(1300, 0.4, 0.6), thud(90, 0.2, 0.6)), 1.0, -0.2); E(un['at'] + 0.15, mx(metal(1100, 0.4, 0.7), thud(90, 0.2, 0.5)), 1.0, 0.1)
    elif name == 'ransom':
        ba, nb, br, sb, po, to, ra_, stm = one('bath'), one('notebook'), one('brain'), one('subset'), one('port'), one('tooth'), one('radio'), one('storm')
        for q in range(3): E(ba['at'] + q * 0.6, firework(0.7), 1.0, rng.uniform(-0.7, 0.7))
        E(0, bubbles(nb['at'] + 0.3, 0.3, 10), 1.0, 0.0)
        E(nb['at'], roomtone(br['at'] - nb['at'], 0.6), 1.0, 0.0); E(nb['at'] + 0.1, paperslide(1.0), 1.0, 0.0); E(nb['at'] + 0.5, scratch(br['at'] - nb['at'] - 1.2, 0.7), 1.0, 0.1)
        E(br['at'], wind(po['at'] - br['at'], 0.05), 1.0, 0.0); E(br['at'], murmur(po['at'] - br['at'], 0.05), 1.0, 0.3)
        tm = br['at']
        while tm < po['at']: E(tm, metal(rng.uniform(3000, 4800), 0.12, 0.3), 1.0, 0.7); tm += rng.uniform(0.12, 0.4)
        E(sb['at'], police_whistle(0.25, 0.4), 1.0, -0.2)
        E(po['at'], wind(d - po['at'] + 0.5, 0.05), 1.0, 0.0)
        E(po['at'], band(stm['at'] - po['at'], 0.55), 1.0, -0.3); E(po['at'] + 0.2, choir(stm['at'] - po['at'] - 0.2, 1.0), 1.0, -0.5); E(po['at'], crowd_cheer(stm['at'] - po['at'], 0.6), 1.0, -0.6)
        E(to['at'], mx(metal(3000, 0.05, 0.5), wood(0.3)), 1.0, 0.0)
        E(ra_['at'], radio_crackle(ra_['to'] - ra_['at'] + 1.0, 1.0), 1.0, 0.0)
        E(stm['at'], sandstorm(stm['to'] - stm['at'] + 0.2, 1.3), 1.0, 0.6); E(stm['to'], mx(thud(60, 0.6, 1.0), noiseb(0.5, 200, 3000, 0.15) * 0.6), 1.0, 0.3)
        E(stm['to'] + 0.3, swarm(0.8, 300, 40, 0.5), 1.0, 0.3); E(stm['to'] + 1.2, laser_hiss(0.5, 0.6), 1.0, 0.3)
    elif name == 'rhyme':
        to, sw, ds, wi, as_, cg = one('tooth'), one('switch'), one('dissolve'), one('wind'), one('ash'), one('cage')
        E(0, wind(d + 0.5, 0.05), 1.0, 0.0)
        E(to['at'], mx(metal(3000, 0.05, 0.5), wood(0.3)), 1.0, -0.2); E(sw['at'], mx(metal(4200, 0.03, 0.6), radio_crackle(LN[3]['t1'] - sw['at'] + 0.3, 0.8)), 1.0, -0.2)
        E(ds['at'], swarm(wi['at'] - ds['at'] + 0.5, 100, 1200, 0.8), 1.0, 0.2); E(ds['at'] + 0.3, radio_crackle(wi['at'] - ds['at'], 0.6), 1.0, 0.2)
        E(wi['at'], hot_wind(2.6, 1.4), 1.0, 0.5)
        E(as_['at'] + 1.0, crowd_cheer(3.0, 0.8), 1.0, -0.5)
        steps(E, cg['at'], cg['to'], 0.4, 0.7, 0.5, footstep, 0.7)
        E(cg['to'] - 0.2, mx(metal(700, 0.6, 0.9), metal(1050, 0.5, 0.6), thud(80, 0.2, 0.6)), 1.0, 0.6)
    return El, Er, rt, wet

def title_end_design(sh):
    d = sh['d']; n = int((d + 1.0) * SR); El = np.zeros(n); Er = np.zeros(n)
    E = lambda t, sig, g=1.0, pan=0.0: eadd(El, Er, t, sig, g, pan)
    if sh['shot'] == 'title':
        E(0, low_chord(d, 0.8), 1.0, 0.0); E(0.0, wind(d, 0.04), 1.0, 0.0)
        # the title beast splits and rejoins on a six-second cycle (phase 0.6): clicks rise on the split, settle on the rejoin
        for k in range(2):
            a = k * 6 + 0.15 * 6 - 0.6; b = k * 6 + 0.65 * 6 - 0.6
            if 0 <= a < d: E(a, swarm(1.5, 100, 900, 0.7), 1.0, 0.0)
            if 0 <= b < d: E(b, swarm(1.5, 900, 60, 0.7), 1.0, 0.0)
    else:
        E(0, padchord([55, 82.4, 110], d, 0.08, 2.0, 2.5), 1.0, 0.0); E(0, wind(d, 0.05), 1.0, 0.0)
        E(1.5, swarm(5.0, 120, 10, 0.4), 1.0, 0.4)
    return El, Er, 1.0, 0.12

for sh in shots:
    t0 = sh['t0']
    if sh['shot'] in ('title', 'end'): El, Er, rt, wet = title_end_design(sh)
    else: El, Er, rt, wet = design(sh)
    putvs(t0, (El, Er), rt, wet, 1.0)
    rt, wet = ROOM.get(sh['room'], ROOM[None])
    for ln in sh['lines']:
        a = ln['_a']; gg = 1.0 * (1.12 if ln['line'] else 1.0); w = wet * (1.4 if ln['line'] else 1.0)
        if ln['who'] in ('T', 'K') and sh['shot'] == 'paper' and ln['t0'] > 20: w = 0.03
        if isinstance(a, tuple): putvs(t0 + ln['t0'], a, rt, w, gg * 0.9)
        else: putv(t0 + ln['t0'], a, rt, w, gg, PANW.get(ln['who'], 0.0))

end_i = int((TOTAL + 0.6) * SR)
mixL, mixR = L[:end_i], Rr[:end_i]
fade = int(0.8 * SR); mixL[-fade:] *= np.linspace(1, 0, fade); mixR[-fade:] *= np.linspace(1, 0, fade)
pk = max(np.abs(mixL).max(), np.abs(mixR).max()); sc = 0.8 / pk
st = np.stack([mixL * sc, mixR * sc], 1)
os.makedirs(os.path.join(HERE, 'audio'), exist_ok=True)
wp = os.path.join(HERE, 'audio', 'kk_raw.wav')
with wave.open(wp, 'wb') as wf:
    wf.setnchannels(2); wf.setsampwidth(2); wf.setframerate(SR); wf.writeframes((np.clip(st, -1, 1) * 32767).astype('<i2').tobytes())
subprocess.check_call(['ffmpeg', '-y', '-loglevel', 'error', '-i', wp, '-af', 'loudnorm=I=-16:TP=-1.5:LRA=11', '-c:a', 'aac', '-b:a', '128k', '-ar', '48000', os.path.join(HERE, 'audio', 'kk.m4a')])
os.remove(wp)
dump()
print('done', TOTAL)
