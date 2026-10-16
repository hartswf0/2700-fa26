"""Voices, sound and music for A Good Shellacking.
   python3 build_sound.py  ->  timing/gs.json and audio/gs.m4a
   Voices: Kokoro (kokoro-onnx), model files in $KOKORO_DIR (default ~/kokoro).
   Everything else is synthesized here, timed from the same score the picture reads.
   The device: equality against identity. Both Trurls speak with one voice and the same settings, so the ear cannot settle which
   is which either. The workshop has a grandfather clock and the wish machine's chime, one for every item out of its belly door.
   The cellar is a long, hard room: every clang rings and comes back. Then snoring, a gallop away in the night, a fanfare for the
   medal that goes sour, and the blinds coming down."""
import hashlib, json, os, re, subprocess, wave
import numpy as np
from scipy.signal import butter, sosfilt, fftconvolve, resample_poly

HERE = os.path.dirname(os.path.abspath(__file__))
KDIR = os.environ.get('KOKORO_DIR', os.path.expanduser('~/kokoro'))
SR = 48000
rng = np.random.default_rng(44)
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

total_guess = 460
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
FX = {'silk': silk_fx, 'breath': breath_fx, 'gruff': gruff_fx, 'flat': flat_fx, 'small': small_fx}

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
PANW = {'T': -0.25, 'K': 0.25, 'M': -0.1, 'R': 0.2, 'N': 0.0}
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
    json.dump(dict(shots=shots, dur=TOTAL, cast=CAST), open(os.path.join(HERE, 'timing', 'gs.json'), 'w'))
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


# ---------------- this film's sounds ----------------
def clock_tick(hi=True, g=1.0): return mx(wood(0.35), metal(1900 if hi else 1500, 0.07, 0.35), noiseb(0.02, 2000, 7000, 0.004) * 0.3) * 0.55 * g
def clockbed(E, a, b, g=1.0, pan=0.75):
    """the grandfather clock: tick, tock, once a second"""
    t = a; j = 0
    while t < b: E(t, clock_tick(j % 2 == 0, g), 1.0, pan); t += 1.0; j += 1
def chime(n=0, g=1.0):
    """the wish machine's chime: two small bell notes, the second one higher each time"""
    f0 = [1046.5, 1174.7, 1318.5, 1568.0, 1760.0, 2093.0][n % 6]
    a = bell(f0, 0.55); b = bell(f0 * 1.5, 0.45); o = np.zeros(len(a) + int(0.13 * SR)); o[:len(a)] += a; o[int(0.13 * SR):] += b
    return o * g
def bellydoor(g=1.0): return mx(creak(0.32, 520, 0.7), metal(2400, 0.08, 0.45), noiseb(0.03, 1500, 5000, 0.008) * 0.3) * g
def knock3(g=1.0):
    o = np.zeros(int(0.8 * SR))
    for q in range(3): s = mx(wood(1.1), thud(85, 0.2, 0.5)); i = int(q * 0.19 * SR); o[i:i + len(s)] += s[: len(o) - i]
    return o * g
def slosh(g=1.0):
    t = tt(0.5); x = filt(filt(noise(len(t)), 'highpass', 200), 'lowpass', 900) * np.abs(np.sin(2 * np.pi * 5 * t)) * np.exp(-t / 0.2); return x * 0.4 * g
def clang(f=None, g=1.0, echo=True):
    """metal slapstick: a hard strike on a hollow body, then the ring"""
    f = f or rng.uniform(380, 620)
    o = mx(metal(f, 1.6, 1.6), metal(f * 1.37, 1.2, 1.0), metal(f * 2.21, 0.7, 0.6), thud(80, 0.3, 0.9), noiseb(0.06, 900, 7000, 0.015) * 0.9)
    if echo:
        for k, dl in enumerate([0.32, 0.61, 0.95]): o = mx(o, np.concatenate([np.zeros(int(dl * SR)), filt(o[: int(1.0 * SR)], 'lowpass', 2400 - k * 500) * (0.32 / (k + 1))]))
    return o * g
def drumhead(g=1.0):
    """the head that rings like a drum: a low boom with a pitched membrane and a long metal shimmer"""
    t = tt(2.2); f = 92 * (1 + 0.35 * np.exp(-t / 0.05)); mem = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.7) + 0.5 * np.sin(2 * np.pi * np.cumsum(f * 1.59) / SR) * np.exp(-t / 0.4)
    return mx(mem * 0.6, thud(50, 0.8, 1.2), metal(310, 2.0, 0.7), noiseb(0.08, 300, 3000, 0.03) * 0.6) * g
def whoosh(d=0.35, g=1.0):
    t = tt(d); f0 = 500; x = filt(noise(len(t)), 'bandpass', [400, 3000]) * np.sin(np.pi * t / d) ** 2; return x * 0.25 * g
def snore(g=1.0):
    """one breath of a snore: a buzzing inhale, a soft whistling exhale"""
    d1, d2 = 1.5, 1.7; t = tt(d1); ph = 2 * np.pi * np.cumsum(68 + 8 * np.sin(np.pi * t / d1) + 3 * noise(len(t)) * 0) / SR
    buzz = np.tanh(3 * np.sin(ph)) * filt(noise(len(t)), 'lowpass', 900) * 0.5 + np.tanh(3 * np.sin(ph)) * 0.3
    inh = filt(buzz, 'bandpass', [80, 1600]) * np.sin(np.pi * t / d1) ** 1.5
    t2 = tt(d2); ex = filt(noise(len(t2)), 'bandpass', [600, 1800]) * np.sin(np.pi * t2 / d2) ** 2 * 0.25 + np.sin(2 * np.pi * np.cumsum(900 - 200 * t2 / d2) / SR) * np.sin(np.pi * t2 / d2) ** 3 * 0.03
    return np.concatenate([inh, np.zeros(int(0.15 * SR)), ex]) * 0.5 * g
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
def tink(g=1.0): return metal(rng.uniform(3200, 6000), rng.uniform(0.15, 0.3), 0.5) * g
def rolling(g=1.0):
    o = np.zeros(int(1.2 * SR)); tm = 0.0
    for q in range(6): s = tink(0.8 - q * 0.1); i = int(tm * SR); o[i:i + len(s)] += s[: len(o) - i]; tm += 0.08 + 0.1 * rng.random()
    return o * g
def sigh(g=1.0):
    t = tt(1.4); x = filt(filt(noise(len(t)), 'highpass', 400), 'lowpass', 2600) * np.sin(np.pi * t / 1.4) ** 2 * (1 - 0.4 * t / 1.4); return x * 0.18 * g
def sour_fanfare(g=1.0):
    """the medal fanfare: it starts bright, and the last chord sags flat and wobbles"""
    o = np.zeros(int(4.4 * SR))
    for (st, f, d) in [(0.0, 392, 0.22), (0.24, 523, 0.22), (0.48, 659, 0.22)]:
        b = brass(f, d, 1.0); i = int(st * SR); o[i:i + len(b)] += b
    d = 3.4; t = tt(d); bend = 1 - 0.07 * np.clip((t - 0.9) / 1.8, 0, 1) ** 1.5; wob = 1 + 0.012 * np.sin(2 * np.pi * 4.3 * t) * np.clip((t - 1.0) / 1.0, 0, 1)
    for k, f in enumerate([784, 784 * 1.25, 784 * 1.5, 392]):
        fr = f * bend * wob * (1 + 0.006 * k * np.clip(t - 1.2, 0, 1)); ph = 2 * np.pi * np.cumsum(fr) / SR
        x = sum(np.sin(j * ph) * (0.9 ** j) / j ** 0.5 for j in range(1, 12)); x = filt(x, 'lowpass', 2600)
        x *= np.minimum(1, t / 0.04) * np.minimum(1, (d - t) / 0.6).clip(0) * 0.11
        i = int(0.72 * SR); o[i:i + len(x)] += x[: len(o) - i]
    return o * g
def blinds(d, g=1.0):
    """slats rattling down, faster as they drop, then the bottom rail hits the sill"""
    o = np.zeros(int((d + 0.6) * SR)); tm = 0.0
    while tm < d: s = mx(noiseb(0.03, 1800, 7000, 0.006) * 0.5, wood(0.25)); i = int(tm * SR); o[i:i + len(s)] += s[: len(o) - i]; tm += 0.07 * (1 - 0.6 * tm / d)
    s = mx(wood(1.3), thud(120, 0.2, 0.6)); i = int(d * SR); o[i:i + len(s)] += s[: len(o) - i]
    return o * g
def lockclick(g=1.0): return mx(metal(1800, 0.06, 0.6), wood(0.6), metal(2600, 0.05, 0.4)) * g
def canvas_pull(d=0.9, g=1.0): return mx(swell(d, 900, 7000, 0.35), rustle(d, 2.4)) * g
def roomtone(d, g=1.0): return filt(brown(int(d * SR)), 'lowpass', 220) * 0.04 * g

ROOM = {'shop': (0.7, 0.1), 'cellar': (2.6, 0.34), 'home': (0.6, 0.08), 'court': (1.6, 0.18), None: (1.0, 0.12)}

def design(sh):
    d = sh['d']; name = sh['shot']; rt, wet = ROOM.get(sh['room'], ROOM[None])
    n = int((d + 1.0) * SR); El = np.zeros(n); Er = np.zeros(n)
    E = lambda t, sig, g=1.0, pan=0.0: eadd(El, Er, t, sig, g, pan)
    cues = sh['cues']; C = lambda k: [c for c in cues if c['k'] == k]; one = lambda k: C(k)[0]
    LN = sh['lines']
    if name == 'gift':
        kn, op, stp, wk, its, pt, cv, ch = one('knock'), one('open'), one('step'), one('work'), C('item'), one('paint'), one('canvas'), one('chair')
        E(0, roomtone(d + 0.5, 1.0))
        tm = kn['at']
        while tm < kn['to']: E(tm, knock3(1.0), 1.0, -0.5); tm += 1.5
        E(op['at'], creak(0.9, 240, 1.1), 1.0, -0.5)
        clockbed(E, op['at'] + 0.6, d, 0.8)
        steps(E, stp['at'], stp['to'], 0.22, -0.5, 0.6, lambda g: mx(thud(150, 0.07, 0.25), metal(rng.uniform(1800, 2600), 0.05, 0.12)) * g, 0.9)
        ticks(E, wk['at'], wk['to'], 1.4, 1.4, lambda: mx(metal(rng.uniform(900, 1600), 0.12, 0.45), wood(0.3)), 0.9, 0.3, 0.4)
        for c in its:
            E(c['at'] - 0.35, bellydoor(0.9), 1.0, 0.55); E(c['at'], chime(c['n'], 0.85), 1.0, 0.55)
        it = sorted(its, key=lambda c: c['n'])
        E(pt['at'], slosh(1.0), 1.0, -0.2); E(pt['at'] + 0.4, scratch(0.8, 0.6), 1.0, -0.2)
        E(it[1]['at'] + 0.6, scratch(1.0, 1.4), 1.0, -0.3)
        E(it[2]['at'] + 0.6, ratchet(1.0, 1.0, 12), 1.0, -0.3)
        E(it[3]['at'] + 0.6, slosh(0.8), 1.0, -0.3)
        E(it[4]['at'] + 0.6, mx(ting(3800, 0.6), ratchet(0.4, 0.7, 20)), 1.0, -0.3)
        E(cv['at'], canvas_pull(0.9, 1.0), 1.0, -0.2)
        E(ch['at'], creak(0.6, 160, 1.0), 1.0, 0.2); E(ch['at'] + 0.6, wood(0.6), 1.0, 0.2)
    elif name == 'copy':
        hm, op, cl, tp, lk, st = one('hum'), one('open'), one('climb'), C('tap'), one('look'), one('stair')
        E(0, roomtone(d + 0.5, 1.0)); clockbed(E, 0.4, d, 0.8)
        E(hm['at'], mhum(hm['to'] - hm['at'] + 0.3, 70, 150, 0.0, 0.3, 1.0), 0.8, 0.5)
        ticks(E, hm['at'] + 0.2, hm['to'], 3, 14, lambda: gear_tick(0.6), 1.0, 0.3, 0.3)
        E(op['at'] - 0.3, bellydoor(1.2), 1.0, 0.5); E(op['at'], chime(5, 1.0), 1.0, 0.5)
        steps(E, cl['at'], cl['to'], 0.34, 0.5, 0.2, lambda g: mx(thud(120, 0.1, 0.35), metal(rng.uniform(900, 1300), 0.08, 0.2)) * g, 1.0)
        for c in tp:
            for q in range(2): E(c['at'] + q * 0.16, metal(1250 + 80 * q, 0.35, 0.7), 1.0, 0.1)
        E(st['at'], creak(1.1, 200, 1.0), 1.0, -0.6)
    elif name in ('cellar', 'claim', 'proof'):
        E(0, roomtone(d + 0.5, 1.6))
        for q in range(int(d / 3.1)): E(0.6 + q * 3.1, creak(0.5, 330, 0.25), 1.0, 0.1)  # the lamp, swinging on its hook
        for q in range(int(d / 4.3)): E(1.3 + q * 4.3 + rng.uniform(0, 1.5), drip(0.6), 1.0, rng.uniform(-0.6, 0.6))
        if name == 'cellar':
            dn, tr, ti, hs, dr, si = one('down'), one('trip'), one('tie'), C('hit'), one('drum'), one('sit')
            E(dn['at'], creak(0.8, 260, 0.9), 1.0, -0.7)
            steps(E, dn['at'] + 0.6, dn['to'], 0.4, -0.7, -0.1, lambda g: mx(wood(0.6), thud(120, 0.1, 0.3)) * g, 1.0)
            E(tr['at'], mx(thud(70, 0.5, 1.3), clang(700, 0.35, False)), 1.0, 0.0)
            E(ti['at'], rustle(ti['to'] - ti['at'], 2.0), 1.0, 0.0); E(ti['at'] + 0.4, creak(ti['to'] - ti['at'] - 0.3, 420, 0.5), 1.0, 0.0)
            E(LN[1]['t0'] + 1.0, mx(metal(260, 0.6, 0.6), noiseb(0.1, 300, 2000, 0.03) * 0.4), 1.0, 0.3)
            for c in hs: E(c['at'] - 0.25, whoosh(0.3, 0.9), 1.0, 0.2); E(c['at'], clang(None, 0.95), 1.0, rng.uniform(-0.2, 0.2))
            E(dr['at'] - 0.25, whoosh(0.3, 1.0), 1.0, 0.2); E(dr['at'], drumhead(1.2), 1.0, 0.0)
            E(si['at'] + 0.3, mx(wood(0.8), thud(90, 0.3, 0.5)), 1.0, 0.4)
        elif name == 'claim':
            cb, sp = one('club'), one('stop')
            E(cb['at'], mx(creak(0.6, 180, 0.6), noiseb(0.3, 200, 1500, 0.08) * 0.3), 1.0, 0.3)
            E(cb['at'] + 0.5, rise(cb['to'] - cb['at'] + 1.6, 1500, 6000, 0.05), 1.0, 0.0)
        else:
            hs, dp, sn, fr, cl, ga, wn = C('hit'), one('drop'), one('snore'), one('free'), one('climb'), one('gallop'), one('window')
            for c in hs: E(c['at'] - 0.25, whoosh(0.3, 0.9), 1.0, 0.2); E(c['at'], clang(None, 0.95), 1.0, rng.uniform(-0.2, 0.2))
            E(dp['at'], mx(wood(1.2), thud(70, 0.4, 0.9)), 1.0, 0.4)
            tm = sn['at']
            while tm < fr['to'] + 1.0: E(tm, snore(1.0), 0.55, 0.5); tm += 3.6
            E(fr['at'], rustle(fr['to'] - fr['at'], 1.6), 1.0, -0.1); E(fr['at'] + 0.4, creak(0.9, 380, 0.6), 1.0, -0.1)
            steps(E, fr['to'], cl['at'], 0.45, -0.1, 0.4, lambda g: mx(thud(120, 0.08, 0.2), noiseb(0.03, 1200, 5000, 0.008) * 0.08) * g, 0.6)
            E(cl['at'], bellydoor(1.0), 1.0, 0.4); E(cl['at'] + 0.7, mx(metal(900, 0.2, 0.4), thud(90, 0.2, 0.4)), 1.0, 0.4)
            gallop(E, ga['at'] + 0.4, d - 0.3, -0.6, 0.9, 1.0, 0.25)
            E(wn['at'], creak(0.7, 300, 0.7), 1.0, -0.3)
            for q in range(4): E(wn['at'] + 1.2 + q * 0.5 + rng.uniform(0, 0.15), muffled(1.0), 1.0, -0.3)
    elif name == 'morning':
        kn, op, dk, mk, pk = one('knock'), one('open'), one('dark'), one('marks'), one('poke')
        E(0, roomtone(d + 0.5, 0.8))
        for q in range(8): E(0.3 + q * 1.3 + rng.uniform(0, 0.6), chirp(0.5), 1.0, rng.uniform(-0.8, 0.8))
        E(kn['at'], knock3(1.0), 1.0, 0.4)
        E(op['at'], creak(0.9, 230, 1.0), 1.0, 0.3)
        E(mk['at'], metal(900, 0.25, 0.25), 1.0, -0.2)
        E(pk['at'], metal(1200, 0.3, 0.5), 1.0, -0.1)
    elif name == 'bolts':
        nu, sg, sk = C('nudge'), one('sigh'), one('shake')
        E(0, roomtone(d + 0.5, 0.8))
        for c in nu: E(c['at'], rolling(1.0), 1.0, -0.2)
        E(sg['at'] + 0.2, sigh(1.0), 1.0, -0.2)
        E(sk['at'], mx(metal(820, 0.25, 0.7), thud(110, 0.12, 0.4)), 1.0, 0.0)
        E(sk['at'] + 1.2, padchord([261.6, 329.6, 392], d - sk['at'] - 1.0, 0.04, 0.8, 1.0), 1.0, 0.0)
    elif name == 'medal':
        te, co, pi, fa, nw, ho, lk, bl, rv = one('tell'), one('court'), one('pin'), one('fanfare'), one('news'), one('home'), one('lock'), one('blinds'), one('reveal')
        E(te['at'], murmur(te['to'] - te['at'], 0.05), 1.0, 0.0)
        E(co['at'], murmur(nw['at'] - co['at'], 0.09), 1.0, 0.0)
        steps(E, co['at'] + 0.5, co['at'] + 4.0, 0.5, -0.4, 0.0, march, 0.5)
        E(pi['at'], ting(3600, 0.7), 1.0, 0.0)
        E(fa['at'], sour_fanfare(0.7), 1.0, 0.0)
        E(nw['at'], rustle(0.8, 2.0), 1.0, 0.0); clockbed(E, nw['at'] + 0.3, ho['at'], 0.8)
        steps(E, ho['at'], lk['at'] - 0.3, 0.38, -0.6, 0.0, footstep, 1.0)
        E(lk['at'] - 0.4, mx(wood(1.4), thud(70, 0.4, 0.9)), 1.0, -0.4); E(lk['at'], lockclick(1.0), 1.0, -0.4)
        E(bl['at'], blinds(bl['to'] - bl['at'], 1.0), 1.0, 0.3)
        clockbed(E, bl['to'], d, 0.8)
        E(rv['at'], canvas_pull(1.0, 1.0), 1.0, 0.0)
        E(rv['at'] + 1.2, chime(0, 0.6), 1.0, 0.0)
    return El, Er, rt, wet

def title_end_design(sh):
    d = sh['d']; n = int((d + 1.0) * SR); El = np.zeros(n); Er = np.zeros(n)
    E = lambda t, sig, g=1.0, pan=0.0: eadd(El, Er, t, sig, g, pan)
    if sh['shot'] == 'title':
        E(0, padchord([110, 164.8, 220, 277], d, 0.1, 1.5, 1.5), 1.0, 0.0)
        clockbed(E, 0.4, d - 0.5, 0.7, 0.0)
        a = clang(520, 0.5, True); E(1.6, a, 1.0, -0.6); E(3.0, a, 1.0, 0.6)  # two strikes, sample for sample the same
    else:
        E(0, padchord([110, 138.6, 165, 220], d, 0.06, 2.0, 2.5), 1.0, 0.0)
        clockbed(E, 0.3, d - 1.0, 0.6, 0.0)
        E(2.2, rolling(0.8), 1.0, 0.0); E(4.0, chime(0, 0.5), 1.0, 0.0)
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
        else: putv(t0 + ln['t0'], a, rt, w, gg, PANW.get(ln['who'], 0.0))

end_i = int((TOTAL + 0.6) * SR)
mixL, mixR = L[:end_i], Rr[:end_i]
fade = int(0.8 * SR); mixL[-fade:] *= np.linspace(1, 0, fade); mixR[-fade:] *= np.linspace(1, 0, fade)
pk = max(np.abs(mixL).max(), np.abs(mixR).max()); sc = 0.8 / pk
st = np.stack([mixL * sc, mixR * sc], 1)
os.makedirs(os.path.join(HERE, 'audio'), exist_ok=True)
wp = os.path.join(HERE, 'audio', 'gs_raw.wav')
with wave.open(wp, 'wb') as wf:
    wf.setnchannels(2); wf.setsampwidth(2); wf.setframerate(SR); wf.writeframes((np.clip(st, -1, 1) * 32767).astype('<i2').tobytes())
subprocess.check_call(['ffmpeg', '-y', '-loglevel', 'error', '-i', wp, '-af', 'loudnorm=I=-16:TP=-1.5:LRA=11', '-c:a', 'aac', '-b:a', '128k', '-ar', '48000', os.path.join(HERE, 'audio', 'gs.m4a')])
os.remove(wp)
dump()
print('done', TOTAL)
