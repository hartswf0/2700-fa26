"""Voices, sound and music for A Short History of Edifiction (film 1 of THE HOUSE THAT LANGUAGE BUILT, four fables of
   Edifiction; an original fable from Watson Hartsoe's notes, in the manner of Stanislaw Lem).
   python3 build_sound.py  ->  timing/eh.json and audio/eh.m4a      (TIMING_ONLY=1 writes the timing file and stops)
   Voices: Kokoro (kokoro-onnx), model files in $KOKORO_DIR (default ~/kokoro). The Historian is bm_lewis; the Edifier is
   af_nicole through a light tin filter (the same two voices in all four films of the series).
   Series sound palette: typewriter keys for description, a dry wooden knock when a description becomes a wall, a low hum for
   the Edifier, footsteps on stairs, a door latch, and the page of the encyclopedia turning between scenes.
   This film adds: chalk taps for counting windows, a wall clock and cutlery for the shrinking dining room, the Interpreting
   Machine's ticker tape, a brass fanfare for the Ministry, and a long held silence before the last step."""
import hashlib, json, os, re, subprocess, wave
import numpy as np
from scipy.signal import butter, sosfilt, fftconvolve, resample_poly

HERE = os.path.dirname(os.path.abspath(__file__))
KDIR = os.environ.get('KOKORO_DIR', os.path.expanduser('~/kokoro'))
SR = 48000
rng = np.random.default_rng(1107)
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
def small_fx(a):
    """the wish machine: polite and small, a little higher, through a little speaker in a tin belly"""
    a = repitch(a, 1.07); d = int(0.006 * SR); o = np.zeros(len(a) + d); o[:len(a)] += a; o[d:] += 0.3 * a
    return filt(o, 'bandpass', [320, 5200]) * 1.15
def synth_fx(a):
    """the Machines: sample-and-hold at 8 kHz, 5-bit steps, a little ring modulation, a narrow band"""
    h = SR // 8000; b = np.repeat(a[::h], h)[:len(a)]
    q = 16.0; b = np.round(b / (np.abs(b).max() + 1e-9) * q) / q * (np.abs(a).max() + 1e-9)
    t = np.arange(len(b)) / SR; rm = b * np.sin(2 * np.pi * 140 * t)
    return filt(0.75 * b + 0.3 * rm, 'bandpass', [220, 5200]) * 1.1
def edifier_fx(a):
    """the Edifier: calm, small, slightly too reasonable; a little higher, a faint doubled tin and a soft 8 kHz hold"""
    a = repitch(a, 1.03); d = int(0.004 * SR); o = np.zeros(len(a) + d); o[:len(a)] += a; o[d:] += 0.22 * a
    h = SR // 12000; b = np.repeat(o[::h], h)[:len(o)]
    return filt(0.8 * o + 0.2 * b, 'bandpass', [260, 6400]) * 1.1
FX = {'edifier': edifier_fx, 'silk': silk_fx, 'breath': breath_fx, 'gruff': gruff_fx, 'flat': flat_fx, 'small': small_fx, 'synth': synth_fx}

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
PANW = {'N': 0.0, 'D': -0.2, 'I': 0.15, 'A': 0.25, 'O': -0.25}
shots = []; t = 0.0
for s in SCRIPT:
    sh = dict(shot=s['shot'], t0=round(t, 3), lines=[], room=s.get('room'))
    cur = 0.0
    for ln in s.get('lines', []):
        c = CAST[ln['who']]; sp = c.get('speed', 1.0) * (0.88 if ln.get('line') else 1.0)
        if 'many' in c:
            a = many(ln['say'], c['many'], False, seed=len(shots) * 10 + len(sh['lines']))
            if c.get('fx'): a = (FX[c['fx']](a[0]), FX[c['fx']](a[1]))
            d = len(a[0]) / SR; mono = (a[0] + a[1]) / 2
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
        sh['lines'].append(dict(who=ln['who'], say=ln['say'], **({'show': ln['show']} if 'show' in ln else {}), t0=round(st, 3), t1=round(st + d, 3), line=bool(ln.get('line')), env=envl, _a=a))
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
    json.dump(dict(shots=shots, dur=TOTAL, cast=CAST), open(os.path.join(HERE, 'timing', 'eh.json'), 'w'))
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
def roomtone(d, g=1.0): return filt(brown(int(d * SR)), 'lowpass', 220) * 0.04 * g
def pageturn(g=1.0):
    """a large encyclopedia page turning: a dry lift, the sheet through air, a soft landing"""
    d = 1.0; t = tt(d); u = t / d
    air = filt(filt(noise(len(t)), 'highpass', 700), 'lowpass', 6500) * np.sin(np.pi * u) ** 1.5 * (0.6 + 0.4 * (rng.random(len(t)) > 0.6))
    return mx(air * 0.34, rustle(0.3, 1.4), np.concatenate([np.zeros(int(0.8 * SR)), mx(noiseb(0.1, 500, 4000, 0.025) * 0.5, thud(140, 0.08, 0.16))])) * g
def typekey(g=1.0): return mx(noiseb(0.025, 1400, 7000, 0.005) * 0.7, thud(220, 0.05, 0.25), metal(rng.uniform(2300, 3600), 0.04, 0.25)) * g
def typebell(g=1.0): return mx(bell(2640, 0.35), ratchet(0.35, 0.6, 30)) * g
def typing(E, a, b, rate, jitter, g=1.0, pan=0.0):
    t = a
    while t < b:
        E(t, typekey(g * (0.75 + 0.4 * rng.random())), 1.0, pan + rng.uniform(-0.15, 0.15)); t += (1.0 / rate) * (1 + jitter * rng.uniform(-0.8, 1.2))
def pencil(d=0.8, g=1.0):
    """graphite on paper: a short dry scratch with the hand's rhythm in it"""
    t = tt(d); x = filt(filt(noise(len(t)), 'highpass', 1800), 'lowpass', 6500) * (0.4 + 0.6 * np.abs(np.sin(2 * np.pi * 3.2 * t)) ** 2)
    return x * np.minimum(1, t / 0.03) * np.minimum(1, (d - t) / 0.06).clip(0) * 0.22 * g
def knock(g=1.0):
    """the series' dry wooden knock: a description becoming a wall"""
    return mx(thud(150, 0.12, 0.7), noiseb(0.05, 600, 2600, 0.012) * 0.5, thud(320, 0.04, 0.2)) * g
def whoosh(d=0.8, g=1.0):
    t = tt(d); u = t / d; f = filt(filt(noise(len(t)), 'highpass', 500 + 900 * 0), 'lowpass', 4500) * (0.6 + 0.4 * u); return f * np.sin(np.pi * u) ** 2 * 0.12 * g
def chalk(g=1.0): return mx(noiseb(0.06, 2000, 8000, 0.015) * 0.5, thud(420, 0.03, 0.12)) * g
def plaster(g=1.0): return mx(thud(110, 0.14, 0.5), noiseb(0.04, 200, 900, 0.02) * 0.3) * g
def tick(g=1.0): return mx(noiseb(0.012, 2500, 9000, 0.003) * 0.4, metal(3100, 0.03, 0.2)) * g
def clink(g=1.0): return metal(rng.uniform(2800, 5200), 0.25, 0.5) * g
def stairstep(g=1.0): return mx(wood(0.7), creak(0.18, rng.uniform(260, 420), 0.4)) * g
def hum(d, g=1.0): return mhum(d, 92, 98, 0.0, 0.8, 0.8, 1.0) * g
def murmurs(d, g=1.0): return mx(murmur(d, 0.6), murmur(d, 0.5)) * g
def sigh(g=1.0): return swell(1.2, 200, 900, 0.12) * g
def snuff(g=1.0): return mx(noiseb(0.15, 300, 2500, 0.05) * 0.3, swell(0.5, 800, 3000, 0.04)) * g
def grind(d, g=1.0):
    t = tt(d); x = filt(filt(noise(len(t)), 'highpass', 900), 'lowpass', 3200) * (0.5 + 0.5 * np.abs(np.sin(2 * np.pi * 1.7 * t)))
    return x * np.minimum(1, t / 0.5) * np.minimum(1, (d - t) / 0.5).clip(0) * 0.09 * g
def smallfan(g=1.0):
    o = np.zeros(int(1.6 * SR))
    for st_, f, d in [(0.0, 523, 0.18), (0.2, 784, 1.0)]:
        for ff in ([f] if d < 0.5 else [f, f * 1.25, f * 1.5]): b = brass(ff, d, 0.8); i = int(st_ * SR); o[i:i + len(b)] += b[:len(o) - i]
    return o * g
FL = 0.9
def word_lands(c):
    n = c.get('n', 1); gap = (c['to'] - c['at'] - FL) / (n - 1) if n > 1 else 0
    return [c['at'] + k * gap + FL for k in range(n)]
def fall_sounds(E, c, g=1.0, pan=0.0):
    for i, tl in enumerate(word_lands(c)): E(tl - FL, whoosh(FL, 0.8 * g), 1.0, pan); E(tl, knock(g * 0.9), 1.0, pan + 0.1 * (i % 3 - 1))
def rise_sounds(E, a, b, g=1.0, pan=0.0, n=14):
    for k in range(n): u = k / max(1, n - 1); E(a + (b - a) * u ** 0.8, knock(g * (0.55 + 0.25 * rng.random())), 1.0, pan + rng.uniform(-0.2, 0.2))
def walking(E, a, b, period=0.48, g=0.5, pan=0.0):
    t = a; k = 0
    while t < b: E(t, footstep(g * (0.8 + 0.3 * rng.random())), 1.0, pan + (0.08 if k % 2 else -0.08)); t += period * (1 + 0.05 * rng.uniform(-1, 1)); k += 1

def design(sh):
    d = sh['d']; name = sh['shot']
    n = int((d + 1.0) * SR); El = np.zeros(n); Er = np.zeros(n)
    E = lambda t, sig, g=1.0, pan=0.0: eadd(El, Er, t, sig, g, pan)
    cues = sh['cues']; C = lambda k: [c for c in cues if c['k'] == k]; one = lambda k: C(k)[0]
    LN = sh['lines']
    E(0, roomtone(d + 0.5, 0.9))
    for c in C('turn'): E(c['at'], pageturn(1.0), 1.0, 0.1)
    for c in C('enter') + C('hop'): E(c['at'], swell(max(0.8, c['to'] - c['at']), 300, 2400, 0.05), 1.0, 0.0)
    for c in C('exit'): E(c['at'], swell(max(0.8, c['to'] - c['at']), 200, 1600, 0.04), 1.0, 0.0)
    if name == 'preface':
        w = one('walk'); nt = one('note'); yr = one('years')
        walking(E, w['at'], nt['at'] - 0.6, 0.5, 0.45, -0.2); walking(E, nt['to'] + 0.3, d - 1.0, 0.5, 0.4, 0.2)
        for k in range(11): E(yr['at'] + (yr['to'] - yr['at']) * (k + 0.5) / 11, mx(rustle(0.5, 1.2), wind(0.9, 0.08)), 1.0, 0.5)
        E(nt['at'] + 0.3, pencil(1.4, 1.2), 1.0, -0.1); E(nt['at'] + 2.0, pencil(1.0, 1.0), 1.0, -0.1)
    elif name in ('prize', 'builder'):
        ty = one('type'); fa = one('fall'); ri = one('rise')
        E(ty['at'] - 1.2, hum(ri['to'] - ty['at'] + 3.0, 0.9), 0.8, -0.2)
        typing(E, ty['at'], ty['to'], 9.0, 0.5, 0.9, -0.25)
        fall_sounds(E, fa, 1.0, 0.0); rise_sounds(E, ri['at'], ri['to'], 0.9, 0.1, 16)
        if name == 'prize':
            md = one('medal'); E(md['at'] + 1.2, mx(bell(1760, 0.5), smallfan(0.9)), 1.0, 0.1)
            ins = one('inside'); E(ins['at'], creak(0.9, 260, 0.8), 1.0, 0.1)
            pr = one('proof')
            for k in range(3): E(pr['at'] + 0.3 + k * (pr['to'] - pr['at'] - 0.6) / 3, scratch(1.6, 1.1), 1.0, -0.3)
            sl = one('sleep'); E(sl['at'] + 1.5 + (sl['to'] - sl['at'] - 1.5) * 0.98, snuff(1.0), 1.0, 0.2)
            ticks(E, sl['at'], d - 0.5, 1.0, 1.0, lambda: tick(0.5), 1.0, 0.1)
        else:
            wk = one('wake'); E(wk['at'], ting(2600, 0.5), 1.0, 0.2)
            se = one('second'); rise_sounds(E, se['at'] + 0.6, se['to'], 1.0, 0.3, 22)
            E(se['to'] - 0.2, ting(2000, 0.6), 1.0, 0.3)
            E(LN[1]['t0'] + 0.4, mx(thud(90, 0.2, 0.6), noiseb(0.05, 400, 3000, 0.01) * 0.4), 1.0, -0.6)   # the order stamped
    elif name == 'astro':
        w = one('walk'); walking(E, w['at'], w['to'], 0.5, 0.5, -0.4)
        walking(E, w['at'] - 1.0, w['at'] + 9.0, 0.36, 0.25, 0.2)
        c0, c1 = sorted(C('count'), key=lambda c: c['n'])
        for i in range(12): E(c0['at'] + (c0['to'] - c0['at']) * (i + 0.5) / 12, chalk(1.0), 1.0, -0.3 + 0.05 * i)
        for i in range(12): E(c1['at'] + (c1['to'] - c1['at']) * (i + 0.5) / 12, chalk(1.0) if i < 11 else plaster(1.2), 1.0, 0.3 - 0.05 * i)
    elif name == 'stair':
        ml = one('meal'); ticks(E, ml['at'] - 1.0, ml['to'], 2.0, 9.0, lambda: tick(0.6), 1.0, 0.3)
        for k in range(14): E(ml['at'] + rng.uniform(0, ml['to'] - ml['at']), clink(0.7), 1.0, rng.uniform(-0.5, 0.5))
        E(ml['at'] + 0.5, creak(2.4, 180, 0.9), 1.0, -0.6); E(ml['at'] + 0.9, creak(2.2, 200, 0.9), 1.0, 0.6); E(ml['to'] - 0.6, sigh(1.0), 1.0, 0.0)
        cl = one('climb')
        for k in range(11): E(cl['at'] + (cl['to'] - cl['at']) * k / 11 + 0.15, stairstep(0.8), 1.0, 0.1)
        E(cl['at'] + 0.4, rumble(cl['to'] - cl['at'], 0.12), 1.0, 0.0)
    elif name == 'ministry':
        wh = one('wheel'); E(wh['at'], creak(wh['to'] - wh['at'], 520, 0.7), 1.0, 0.5); E(wh['at'], rumble(wh['to'] - wh['at'], 0.25), 1.0, 0.4)
        for c in C('step'): walking(E, c['at'], c['at'] + 1.0, 0.4, 0.4, -0.2)
        tp = one('tape'); E(tp['at'], hum(tp['to'] - tp['at'] + 1.0, 0.8), 0.8, 0.3); E(tp['at'], ratchet(tp['to'] - tp['at'], 0.25, 22), 1.0, 0.4)
        for l in LN:
            if l['who'] == 'I': E(l['t1'] + 0.1, typebell(0.7), 1.0, 0.4)
        fe = one('fete'); E(fe['at'], fanfare(0.9), 1.0, 0.0); E(fe['at'] + 0.4, murmurs(fe['to'] - fe['at'] + 1.5, 0.7), 1.0, 0.0)
    elif name == 'discipline':
        us = sorted(C('use'), key=lambda c: c['n'])
        E(us[0]['at'], filt(noise(int((us[-1]['at'] - us[0]['at'] + 6) * SR)), 'bandpass', [1500, 7000]) * 0.03 * np.minimum(1, tt(us[-1]['at'] - us[0]['at'] + 6) / 0.6), 1.0, 0.0)
        for c in us: E(c['at'], pluck([392, 440, 494, 523, 587, 659, 698, 784, 880][c['n']], 0.6, 0.6), 0.6, -0.4 + 0.1 * c['n'])
        gr = one('grey'); E(gr['at'], swell(gr['to'] - gr['at'], 150, 600, 0.06), 1.0, 0.0)
        for c in C('carve'):
            t = c['at']; e = t + (3.4 if c['n'] == 2 else 2.6)
            while t < e: E(t, mx(metal(rng.uniform(2200, 3400), 0.06, 0.35), thud(300, 0.03, 0.12)), 1.0, -0.3 + 0.3 * c['n']); t += 0.14 + 0.06 * rng.random()
        vo = one('vols')
        for i in range(47): E(vo['at'] + (vo['to'] - vo['at']) * ((i + 1) / 47) ** (1 / 0.85), mx(wood(0.45), thud(200, 0.05, 0.15)), 1.0, -0.4 + 0.8 * i / 47)
    elif name == 'schools':
        ty = one('type')
        for k in range(5): typing(E, ty['at'], ty['to'], 7.0, 0.6, 0.45, -0.8 + 0.4 * k)
        for k in range(5):
            fa = [c for c in C('fall') if c['s'] == k][0]; ri = [c for c in C('rise') if c['s'] == k][0]
            E(fa['at'] - 0.6, hum(ri['to'] - fa['at'] + 1.2, 0.6), 0.6, 0.0); fall_sounds(E, fa, 0.9)
            a, b = ri['at'], ri['to']
            if k == 0: E(a, scratch(b - a, 1.4), 1.0, 0.0)
            elif k == 1: rise_sounds(E, a, b, 0.8, 0.0, 12)
            elif k == 2:
                for j in range(7): E(a + (b - a) * j / 7, pluck([523, 587, 659, 698, 784, 880, 988][j], 0.5, 0.4), 0.8, -0.3 + 0.1 * j)
            elif k == 3:
                for j in range(12): E(a + (b - a) * j / 12, metal(rng.uniform(900, 1600), 0.3, 0.7), 1.0, rng.uniform(-0.4, 0.4))
            else: E(a, winddown(b - a + 0.6, 420, 1.3), 1.0, 0.0); E(a, rumble(b - a, 0.25), 1.0, 0.0)
        l3 = LN[3]; walking(E, l3['t0'] - 1.6, l3['t0'] + 1.2, 0.42, 0.45, -0.2)
    elif name == 'gens':
        for c in C('gen'): E(c['at'], swell(1.0, 400, 2600, 0.04), 1.0, 0.0); E(c['at'] + 0.6, pluck([330, 392, 440, 494, 587, 659][c['n']], 0.7, 0.3), 0.5, 0.0)
        st = one('stone'); E(st['at'], grind(st['to'] - st['at'], 1.2), 1.0, 0.1); E(st['at'], rumble(st['to'] - st['at'], 0.15), 1.0, 0.0)
    elif name == 'close':
        sw = one('swap'); E(sw['at'], swell(1.4, 300, 2000, 0.05), 1.0, 0.0)
        su = one('shut'); E(su['at'], pageturn(0.9), 1.0, 0.0); E(su['to'] - 0.25, mx(thud(70, 0.4, 1.0), noiseb(0.12, 200, 2200, 0.03) * 0.6), 1.0, 0.0)
    elif name == 'last':
        stc = one('stand'); cl = one('climb')
        E(stc['at'], creak(0.8, 300, 0.9), 1.0, -0.2); walking(E, stc['to'] + 0.1, cl['at'], 0.5, 0.35, -0.1)
        E(cl['at'] + 0.8, stairstep(1.1), 1.0, 0.0)
        E(cl['to'], padchord([196, 246.9, 293.7, 392], d - cl['to'] + 0.5, 0.05, 1.5, 2.0), 1.0, 0.0)
    return El, Er, 1.0, 0.12

def title_end_design(sh):
    d = sh['d']; n = int((d + 1.0) * SR); El = np.zeros(n); Er = np.zeros(n)
    E = lambda t, sig, g=1.0, pan=0.0: eadd(El, Er, t, sig, g, pan)
    if sh['shot'] == 'title':
        E(0, padchord([110, 164.8, 220, 277.2], d, 0.07, 1.5, 1.8), 1.0, 0.0)
        typing(E, 0.8, 3.0, 7.0, 0.6, 0.7)
        E(3.3, knock(0.9), 1.0, 0.0)
    else:
        E(0, padchord([98, 146.8, 196, 246.9], d, 0.07, 1.0, 2.2), 1.0, 0.0)
        E(1.0, knock(0.7), 1.0, 0.0)
    return El, Er, 1.0, 0.12

for sh in shots:
    t0 = sh['t0']
    if sh['shot'] in ('title', 'end'): El, Er, rt, wet = title_end_design(sh)
    else: El, Er, rt, wet = design(sh)
    putvs(t0, (El, Er), rt, wet, 1.0)
    for ln in sh['lines']:
        a = ln['_a']; gg = 1.0 * (1.12 if ln['line'] else 1.0); w = wet * (1.4 if ln['line'] else 1.0)
        if isinstance(a, tuple): putvs(t0 + ln['t0'], a, rt, w, gg * 0.85)
        else: putv(t0 + ln['t0'], a, rt, w, gg, PANW.get(ln['who'], 0.0))

end_i = int((TOTAL + 0.6) * SR)
mixL, mixR = L[:end_i], Rr[:end_i]
fade = int(0.8 * SR); mixL[-fade:] *= np.linspace(1, 0, fade); mixR[-fade:] *= np.linspace(1, 0, fade)
pk = max(np.abs(mixL).max(), np.abs(mixR).max()); sc = 0.8 / pk
st = np.stack([mixL * sc, mixR * sc], 1)
os.makedirs(os.path.join(HERE, 'audio'), exist_ok=True)
wp = os.path.join(HERE, 'audio', 'eh_raw.wav')
with wave.open(wp, 'wb') as wf:
    wf.setnchannels(2); wf.setsampwidth(2); wf.setframerate(SR); wf.writeframes((np.clip(st, -1, 1) * 32767).astype('<i2').tobytes())
subprocess.check_call(['ffmpeg', '-y', '-loglevel', 'error', '-i', wp, '-af', 'loudnorm=I=-16:TP=-1.5:LRA=11', '-c:a', 'aac', '-b:a', '128k', '-ar', '48000', os.path.join(HERE, 'audio', 'eh.m4a')])
os.remove(wp)
dump()
print('done', TOTAL)
