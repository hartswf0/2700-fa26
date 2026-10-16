"""Voices, sound and music for The Fourth Sally, or How Trurl Built a Femfatalatron.
   python3 build_sound.py  ->  timing/ff.json and audio/ff.m4a
   Voices: Kokoro (kokoro-onnx), model files in $KOKORO_DIR (default ~/kokoro).
   Everything else is synthesized here, timed from the same score the picture reads.
   The device: measurement and the wrong variable. The machine has a rising hum and a chatter of needles; when every needle is
   at its stop the chatter becomes a rattle, and at the rapturometer it all ends in breaking glass. The second machine is lower
   and heavier and fails the same way. In the second half the sound is soft: cauldrons, coos, the thump of bundles landing,
   and a chorus of babble that grows until the Emperor gives in. At the end the hum winds down to nothing."""
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

total_guess = 520
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
FX = {'silk': silk_fx, 'breath': breath_fx, 'gruff': gruff_fx, 'flat': flat_fx}

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
PANW = {'T': -0.3, 'G': 0.3, 'K': 0.32, 'P': 0.0, 'E': 0.25, 'C': 0.0, 'N': 0.0}
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
    json.dump(dict(shots=shots, dur=TOTAL, cast=CAST), open(os.path.join(HERE, 'timing', 'ff.json'), 'w'))
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

ROOM = {'open': (1.8, 0.12), 'hall': (1.4, 0.2), 'office': (0.5, 0.08), None: (1.2, 0.16)}
def ticks(E, a, b, rate0, rate1, mk, g=1.0, pan_alt=0.4, jitter=0.0):
    t = a; j = 0
    while t < b:
        u = (t - a) / max(0.01, b - a); E(t, mk(), g, pan_alt * (1 if j % 2 else -1)); r = rate0 + (rate1 - rate0) * u
        t += 1.0 / r * (1 + jitter * rng.uniform(-1, 1)); j += 1
def steps(E, a, b, period, p0, p1, mk, g=1.0, jit=0.05):
    t = a
    while t < b:
        u = (t - a) / max(0.01, b - a); E(t, mk(g * (0.8 + 0.4 * rng.random())), 1.0, p0 + (p1 - p0) * u); t += period * (1 + jit * rng.uniform(-1, 1))

def machine_run(E, a, top, b, f0a, f0b, heavy, g):
    """the climb: hum rising from a to top, then held at the stop until b; needles chatter faster as they climb, and rattle at the stop"""
    E(a, mhum(top - a + 0.3, f0a, f0b, heavy, 0.25, 1.0), g, 0.0)
    if b > top: E(top, mhum(b - top, f0b, f0b * 1.02, heavy, 1.0, 1.0, 1.0), g, 0.0)
    ticks(E, a + 0.1, top, 3, 22, lambda: gear_tick(0.55 + 0.3 * heavy), 1.0, 0.35, 0.25)
    if b > top: ticks(E, top, b, 30, 30, lambda: gear_tick(0.35), 0.8, 0.25, 0.4)
    E(top, mx(metal(600 if heavy else 900, 0.4, 0.8), thud(70 if heavy else 90, 0.3, 0.6 + 0.5 * heavy)), 1.0, 0.0)

def design(sh):
    d = sh['d']; name = sh['shot']; rt, wet = ROOM.get(sh['room'], ROOM[None])
    n = int((d + 1.0) * SR); El = np.zeros(n); Er = np.zeros(n)
    E = lambda t, sig, g=1.0, pan=0.0: eadd(El, Er, t, sig, g, pan)
    cues = sh['cues']; C = lambda k: [c for c in cues if c['k'] == k]; one = lambda k: C(k)[0]
    LN = sh['lines']
    if name == 'knock':
        kn, op, rv, sk, kt, bw = one('knock'), one('open'), one('reveal'), one('sacks'), one('knight'), one('bow')
        E(0, wind(d + 0.5, 0.025))
        ticks(E, 0.3, d, 2.2, 2.2, lambda: cricket(1.0), 1.0, 0.7, 0.5)
        tm = kn['at']
        while tm < kn['to']:
            for q in range(4): E(tm + q * 0.17, mx(wood(1.1), thud(80, 0.2, 0.6)), 1.0, -0.35)
            tm += 1.4
        E(op['at'], creak(0.9, 260, 1.2), 1.0, -0.35)
        E(rv['at'], mhum(d - rv['at'] + 0.3, 42, 44, 0.4, 0.5, 0.5, 1.0), 0.45, 0.35)
        E(rv['at'] - 0.2, swell(1.4, 300, 3000, 0.12), 1.0, 0.3)
        tm = sk['at'] + 0.2; k = 0
        while tm < sk['to']: E(tm, softland(1.3), 1.0, 0.5 - 0.6 * ((tm - sk['at']) / (sk['to'] - sk['at']))); tm += 0.32 + 0.12 * rng.random(); k += 1
        steps(E, sk['at'], sk['to'], 0.3, 0.6, 0.0, footstep, 0.5, 0.2)
        steps(E, kt['at'], kt['at'] + 2.6, 0.5, 0.2, -0.05, march, 0.9)
        E(bw['at'], mx(metal(1800, 0.3, 0.5), swell(0.5, 900, 5000, 0.1)), 1.0, 0.1)
    elif name == 'titles':
        pu, sw, db, dm, lk, cl, ca, lf = one('purr'), one('sword'), one('dub'), one('dim'), one('look'), one('clang'), one('carry'), one('lift')
        E(0, rumble(lf['at'] + 0.5, 0.05))
        tp = tt(pu['to'] - pu['at']); E(pu['at'], filt(noise(len(tp)), 'lowpass', 300) * (0.5 + 0.5 * np.sin(2 * np.pi * 24 * tp)) * 0.18 * np.sin(np.pi * tp / tp[-1]), 1.0, 0.3)
        E(sw['at'], mx(scratch(0.5, 1.3), metal(2400, 0.9, 0.6)), 1.0, 0.25)
        for q in range(5): E(db['at'] + 0.2 + q * (db['to'] - db['at'] - 0.4) / 4, metal(2900 - q * 120, 0.35, 0.6), 1.0, -0.15)
        for q in range(5): E(dm['at'] + q * 0.45, softland(1.0), 0.8, 0.55)
        E(lk['at'] - 0.2, murmur(3.0, 0.05), 1.0, 0.6)
        E(cl['at'], mx(metal(700, 0.8, 1.3), metal(1100, 0.6, 0.9), thud(90, 0.3, 0.6)), 1.0, 0.25)
        steps(E, ca['at'], ca['to'], 0.28, 0.4, -0.4, march, 0.8)
        ticks(E, lf['at'], lf['at'] + 3.0, 2.8, 2.8, lambda: pomf(0.22), 1.0, 0.3, 0.05)
        E(lf['at'] + 0.5, roar(d - lf['at'] + 0.5, 0.32), 1.0, 0.0)
    elif name == 'temple':
        bd, dl, pts, kb, pu, shu = one('build'), one('dials'), C('point'), one('knobs'), one('push'), one('shut')
        E(0, wind(d + 0.5, 0.02))
        for q in range(9): E(0.6 + q * 2.9 + rng.uniform(0, 1.2), chirp(0.9), 1.0, rng.uniform(-0.8, 0.8))
        ticks(E, bd['at'], bd['to'], 3.2, 3.2, lambda: mx(metal(rng.uniform(1200, 2200), 0.15, 0.5), wood(0.3)), 1.0, 0.5, 0.4)
        E(dl['at'], mhum(d - dl['at'] + 0.3, 55, 56, 0.0, 0.25, 0.25, 1.0), 0.6, 0.0)
        for c in pts: E(c['at'] + 0.1, ting(3000 + 300 * c['n'], 0.7), 1.0, 0.0)
        for q in range(3): E(kb['at'] + 0.6 + q * (kb['to'] - kb['at'] - 1.0) / 2, mx(gear_tick(1.0), metal(1300, 0.08, 0.4)), 1.0, -0.1 + 0.1 * q)
        steps(E, pu['at'], pu['to'], 0.36, -0.7, 0.1, footstep, 0.6, 0.3)
        tm = pu['at'] + 0.3
        while tm < pu['to']: E(tm, mx(thud(110, 0.15, 0.3), rustle(0.25, 1.5)), 1.0, rng.uniform(-0.4, 0.2)); tm += 0.7 + 0.3 * rng.random()
        E(shu['at'], mx(thud(60, 0.6, 1.2), wood(1.0), metal(500, 0.3, 0.5)), 1.0, 0.0)
    elif name == 'run':
        sw, ct, cb, hr, op, fa, pr, bu = one('switch'), one('count'), one('climb'), one('hour'), one('open'), one('faint'), one('press'), one('burst')
        E(sw['at'], mx(metal(400, 0.5, 1.0), thud(70, 0.4, 0.9), noiseb(0.1, 1500, 6000, 0.02) * 0.4), 1.0, 0.2)
        for q in range(6): E(ct['at'] + 0.1 + q * (ct['to'] - ct['at'] - 0.2) / 5.0, pluck(880 if q < 5 else 1320, 0.25, 0.2) * 0.5, 1.0, 0.0)
        machine_run(E, cb['at'], cb['to'], op['at'], 50, 112, 0.0, 1.0)
        E(op['at'], winddown(3.0, 112, 1.0), 1.0, 0.0)
        for q in range(6): E(hr['at'] + 1.0 + q * 0.9, chirp(0.4), 1.0, rng.uniform(-0.8, 0.8))
        E(op['at'] + 0.1, mx(creak(1.0, 210, 1.2), thud(70, 0.3, 0.5)), 1.0, 0.0)
        E(op['at'] + 0.4, swell(2.6, 500, 6000, 0.14), 1.0, 0.0)
        for q in range(8): E(op['at'] + 0.6 + q * 0.3, sparkle(0.5), 1.0, rng.uniform(-0.5, 0.5))
        E(fa['at'] + 0.3, mx(thud(90, 0.3, 0.5), rustle(0.4, 2.0)), 1.0, 0.0)
        E(pr['at'] + 0.3, pop(0.8), 1.0, 0.1)
        tw = tt(bu['at'] - pr['at'] - 0.4); f = 500 * (3.5 ** (tw / max(tw[-1], 0.01))); E(pr['at'] + 0.4, np.sin(2 * np.pi * np.cumsum(f) / SR) * (tw / tw[-1]) * 0.05, 1.0, 0.0)
        E(bu['at'], glass(1.1), 1.0, 0.0)
        for q in range(10): E(bu['at'] + 0.4 + q * 0.13 + rng.uniform(0, 0.1), drip(1.0), 1.0, rng.uniform(-0.3, 0.3))
    elif name == 'again':
        ms, on, sm, ir_, sw, cb, ou, rm, th = one('masons'), one('on'), one('smoke'), one('iron'), one('switch'), one('climb'), one('out'), one('room'), C('throw')
        ticks(E, 0.2, on['at'], 2.4, 2.4, lambda: cricket(1.0), 1.0, 0.7, 0.5)
        steps(E, ms['at'], ms['to'], 0.5, -0.6, 0.0, dirtstep, 0.6)
        E(on['at'], mhum(1.6, 60, 120, 0.0, 0.5, 1.0), 1.0, 0.0); E(on['at'] + 1.5, winddown(1.0, 120, 1.0), 1.0, 0.0)
        E(sm['at'], sizzle(sm['to'] - sm['at'], 1.0), 1.0, 0.1)
        for q in range(6): E(sm['at'] + 0.5 + q * 0.45, bell(1980, 0.35), 1.0, 0.7)
        for q in range(6): E(ir_['at'] + 0.2 + q * 0.4, mx(metal(rng.uniform(300, 700), 0.6, 1.0), thud(60, 0.3, 0.5)), 1.0, rng.uniform(-0.4, 0.4))
        E(sw['at'], mx(metal(260, 0.7, 1.3), thud(50, 0.5, 1.2)), 1.0, 0.2)
        machine_run(E, cb['at'], cb['to'], ou['at'], 34, 82, 0.9, 1.25)
        E(ou['at'], glass(0.7), 1.0, 0.0); E(ou['at'], winddown(2.6, 82, 1.4), 1.0, 0.0)
        E(ou['at'] + 0.3, swell(1.8, 500, 6000, 0.12), 1.0, 0.0)
        E(rm['at'], rumble(d - rm['at'] + 0.3, 0.04))
        k = 0; tm = rm['at'] + 0.3
        while tm < d - 0.8: E(tm, footstep(0.9), 1.0, 0.6 * np.sin(k * 0.45)); tm += 0.42; k += 1
        for c in th: E(c['at'] + 0.35, mx(thud(110, 0.25, 0.9), rustle(0.4, 2.2)), 1.0, 0.6); E(c['at'], rustle(0.3, 1.6), 1.0, -0.2)
    elif name == 'audience':
        en, wh, br = one('enter'), one('whisper'), one('bright')
        E(0, murmur(d, 0.035), 1.0, 0.0)
        steps(E, en['at'], en['to'], 0.42, -0.6, -0.15, footstep, 0.8)
        E(wh['at'] + 0.3, whisper(wh['to'] - wh['at'], 1.0), 1.0, 0.1)
        for q, f in enumerate([523, 659, 784, 1046]): E(br['at'] + 0.3 + q * 0.16, pluck(f, 0.9, 0.5) * 0.6, 1.0, 0.2)
    elif name == 'lab':
        fo, ds, lb, cs, rn = one('foundry'), one('disguise'), one('lab'), C('coo'), one('run')
        E(0, bubbles(fo['at'] + 0.4, 0.5), 1.0, -0.2)
        E(fo['at'], roar(fo['to'] - fo['at'] + 0.5, 0.35), 1.0, 0.0)
        ticks(E, fo['at'] + 0.3, fo['to'], 1.3, 1.3, lambda: mx(metal(rng.uniform(500, 900), 0.6, 1.0), thud(80, 0.2, 0.5)), 1.0, 0.4, 0.15)
        for q in range(14): E(fo['at'] + rng.uniform(0, fo['to'] - fo['at']), sparkle(0.4), 1.0, rng.uniform(-0.7, 0.7))
        E(ds['at'], swell(0.8, 300, 2500, 0.12), 1.0, 0.0)
        E(lb['at'], bubbles(d - lb['at'] + 0.5, 1.0, 9), 1.0, -0.25); E(lb['at'], bubbles(d - lb['at'] + 0.5, 0.7, 6), 1.0, 0.35)
        for c in cs: E(c['at'] + 0.2, filt(coo(1.0), 'lowpass', 2200), 0.9, 0.55)
        for q in range(4): E(lb['at'] + 1.0 + q * 1.8 + rng.uniform(0, 0.8), filt(coo(0.7), 'lowpass', 1800), 0.8, 0.7)
        steps(E, rn['at'], d - 0.3, 0.2, -0.9, 0.9, footstep, 0.7); E(rn['at'] + 0.2, rustle(1.5, 1.5), 1.0, 0.0)
    elif name == 'bombard':
        ra, fi, ci, hl, sg = one('raise'), one('fire'), one('city'), one('hall'), one('sign')
        E(0, wind(d + 0.5, 0.03))
        E(ra['at'], creak(ra['to'] - ra['at'], 180, 1.4), 1.0, -0.3)
        ticks(E, fi['at'], fi['to'], 2.2, 3.5, lambda: pomf(0.42), 1.0, 0.5, 0.2)
        # landing: soft thumps and babble, denser as the count grows (the picture uses the same curve)
        a = ci['at']; tm = a
        while tm < d - 0.5:
            u = (tm - a) / max(1, (d - a)); E(tm, softland(0.55), 1.0, rng.uniform(-0.8, 0.8)); tm += 0.5 / (1 + 4 * u)
        tm = a + 0.4
        while tm < d - 0.3:
            u = (tm - a) / max(1, (d - a)); E(tm, (coo(0.9) if rng.random() < 0.5 else babble(1.0)) * (0.32 + 0.4 * u), 1.0, rng.uniform(-0.9, 0.9)); tm += 0.42 / (1 + 6 * u)
        E(hl['at'], creak(4.0, 140, 1.0), 1.0, 0.4)
        ticks(E, hl['at'] + 0.5, d - 0.5, 1.6, 1.6, lambda: gear_tick(0.4), 1.0, 0.4, 0.1)
        E(sg['at'], scratch(1.2, 1.6), 1.0, 0.2); E(sg['at'] + 1.3, bell(880, 0.5), 1.0, 0.2)
    elif name == 'wedding':
        pl, ap, of, fe, to, fa, ho = one('plug'), one('apart'), one('off'), one('feast'), one('toast'), one('fanfare'), one('home')
        E(0, wind(fe['at'] + 0.5, 0.02))
        for q in range(4): E(pl['at'] + 0.2 + q * 0.5, mx(thud(70, 0.3, 0.6), metal(500, 0.3, 0.5)), 1.0, -0.6 + 0.4 * q)
        E(pl['at'], mhum(of['at'] - pl['at'], 56, 54, 0.0, 0.35, 0.35, 1.0), 0.8, 0.0)
        tm = ap['at']
        while tm < ap['to']: E(tm, ratchet(0.5, 1.0, 16), 1.0, 0.2); E(tm + 0.7, mx(metal(rng.uniform(600, 1000), 0.4, 0.6), thud(90, 0.2, 0.4)), 1.0, 0.2); tm += 1.3
        E(of['at'] - 0.3, winddown(3.5, 54, 1.2), 1.0, 0.0); E(of['at'] - 0.3, mx(metal(1800, 0.1, 0.5), noiseb(0.04, 1500, 5000, 0.01)), 1.0, 0.0)
        E(fe['at'], murmur(ho['at'] - fe['at'] + 1.0, 0.09), 1.0, 0.0); E(fe['at'], padchord([196, 247, 294, 392], ho['at'] - fe['at'] + 1.5, 0.06, 1.0, 1.0), 1.0, 0.0)
        for q in range(7): E(fe['at'] + 0.6 + q * 0.6 + rng.uniform(0, 0.3), metal(rng.uniform(3500, 5200), 0.3, 0.25), 1.0, rng.uniform(-0.7, 0.7))
        for q in range(6): E(to['at'] + LN[3]['t1'] - LN[3]['t0'] + 0.1 + q * 0.09, metal(rng.uniform(4200, 5600), 0.6, 0.6), 1.0, rng.uniform(-0.6, 0.6))
        E(fa['at'], fanfare(0.55), 1.0, 0.0)
        E(ho['at'] + 0.6, roar(d - ho['at'], 0.22), 1.0, 0.0); E(ho['at'] + 0.6, swell(d - ho['at'] - 0.6, 300, 3000, 0.1), 1.0, -0.3)
    return El, Er, rt, wet

def title_end_design(sh):
    d = sh['d']; n = int((d + 1.0) * SR); El = np.zeros(n); Er = np.zeros(n)
    E = lambda t, sig, g=1.0, pan=0.0: eadd(El, Er, t, sig, g, pan)
    if sh['shot'] == 'title':
        E(0, padchord([110, 164.8, 220, 277], d, 0.14, 1.5, 1.5), 1.0, 0.0)
        E(0.6, mhum(3.0, 50, 110, 0.0, 0.2, 1.0), 0.9, 0.0); ticks(E, 0.7, 3.6, 4, 24, lambda: gear_tick(0.5), 1.0, 0.3, 0.2)
        E(3.6, glass(0.6), 1.0, 0.0)
        for q in range(6): E(4.0 + q * 0.15, drip(0.8), 1.0, rng.uniform(-0.3, 0.3))
    else:
        E(0, padchord([110, 138.6, 165, 220], d, 0.06, 2.0, 2.5), 1.0, 0.0)
        for q, f in enumerate([392, 523, 659]): E(0.6 + q * 0.4, pluck(f, 1.2, 0.4) * 0.5, 1.0, 0.0)
        E(3.2, filt(coo(0.6, 420, 0.6), 'lowpass', 2000), 1.0, 0.3)
        E(4.4, winddown(2.5, 55, 0.8), 1.0, 0.0)
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
wp = os.path.join(HERE, 'audio', 'ff_raw.wav')
with wave.open(wp, 'wb') as wf:
    wf.setnchannels(2); wf.setsampwidth(2); wf.setframerate(SR); wf.writeframes((np.clip(st, -1, 1) * 32767).astype('<i2').tobytes())
subprocess.check_call(['ffmpeg', '-y', '-loglevel', 'error', '-i', wp, '-af', 'loudnorm=I=-16:TP=-1.5:LRA=11', '-c:a', 'aac', '-b:a', '128k', '-ar', '48000', os.path.join(HERE, 'audio', 'ff.m4a')])
os.remove(wp)
dump()
print('done', TOTAL)
