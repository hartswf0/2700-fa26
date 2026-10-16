"""Voices, sound and music for The Great International Congress of Doors. Film two of THE HOUSE THAT LANGUAGE BUILT, four fables
   of Edifiction: an original fable from Watson Hartsoe's notes "The House That Language Built", in the manner of Stanislaw Lem.
   python3 build_sound.py  ->  timing/cd.json and audio/cd.m4a      (TIMING_ONLY=1 writes the timing file and stops)
   Voices: Kokoro (kokoro-onnx), model files in $KOKORO_DIR (default ~/kokoro). Everything else is synthesized here with numpy
   and scipy, timed from the same score the picture reads.
   Shared series sounds: typewriter keys for description, a dry wooden knock as each letter becomes wall, the Edifier's low hum,
   footsteps, a door latch. This film adds the chairman's hand bell, the hall clock (always there, loud only in silences), a
   small brass flourish when a door is finished (two notes for the passage, none for the encounter), the shoulder that meets
   a door without hinges, the breath of air of a passage, the tea trolley, and the cleaner's mop and plain latch."""
import hashlib, json, os, re, subprocess, wave
import hashlib, json, os, re, subprocess, wave
import numpy as np
from scipy.signal import butter, sosfilt, fftconvolve, resample_poly

HERE = os.path.dirname(os.path.abspath(__file__))
KDIR = os.environ.get('KOKORO_DIR', os.path.expanduser('~/kokoro'))
SR = 48000
rng = np.random.default_rng(73)
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

total_guess = 420
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
    """the Edifier (the same voice in all four films): calm and small, a little higher, a faint doubled ring like a voice in a cabinet"""
    a = repitch(a, 1.04); d = int(0.004 * SR); o = np.zeros(len(a) + d); o[:len(a)] += a; o[d:] += 0.35 * a
    t = np.arange(len(o)) / SR; ring = filt(o, 'highpass', 2400) * np.sin(2 * np.pi * 330 * t) * 0.12
    return filt(o, 'bandpass', [240, 6200]) * 1.1 + ring
def old_fx(a):
    """the chairman: a touch lower and drier, a faint tremble"""
    a = repitch(a, 0.97); t = np.arange(len(a)) / SR; return filt(a * (1 + 0.06 * np.sin(2 * np.pi * 5.5 * t)), 'lowpass', 6800)
def deep_fx(a):
    """the Encounterist: lower, slower, close to the microphone"""
    a = repitch(a, 0.94); return filt(a, 'lowpass', 5200) * 1.08 + 0.12 * filt(a, 'lowpass', 300)
FX = {'silk': silk_fx, 'breath': breath_fx, 'gruff': gruff_fx, 'flat': flat_fx, 'small': small_fx, 'synth': synth_fx, 'edifier': edifier_fx, 'old': old_fx, 'deep': deep_fx}

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
PANW = {'N': 0.0, 'C': 0.0, 'O': -0.35, 'T': -0.15, 'V': 0.15, 'K': 0.35, 'E': 0.0}
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
    json.dump(dict(shots=shots, dur=TOTAL, cast=CAST), open(os.path.join(HERE, 'timing', 'cd.json'), 'w'))
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
NB = 44  # letter-bricks in every door frame: 17 courses on each jamb and 10 across the lintel (cd.js uses the same count)
def land_times(c, n=NB):
    """letter i of a 'fall' cue lands at at + 0.7 + i * (to - at - 0.7) / (n - 1); the picture uses the same rule"""
    return [c['at'] + 0.7 + i * (c['to'] - c['at'] - 0.7) / (n - 1) for i in range(n)]
XP = lambda x: float(np.clip((x - 830) / 820, -0.85, 0.85))  # world x of the hall to stereo pan
BAYX = {'A': 510, 'B': 730, 'C': 970, 'D': 1190}; EDX = {'A': 400, 'B': 620, 'C': 1080, 'D': 1300}
SEATX = {'O': 560, 'T': 720, 'V': 980, 'K': 1140}

def roomtone(d, g=1.0): return filt(brown(int(d * SR)), 'lowpass', 220) * 0.045 * g
def handbell(g=1.0, n=3):
    """the chairman's bell: a small brass hand bell, struck n times by its clapper"""
    o = np.zeros(int(2.2 * SR))
    for k in range(n):
        f = 1046 * (1 + 0.004 * k); t = tt(1.6)
        x = sum(a_ * np.sin(2 * np.pi * f * r_ * t + k) * np.exp(-t / (0.9 / (1 + r_ * 0.5))) for a_, r_ in [(1, 1), (0.6, 2.0), (0.45, 2.92), (0.3, 4.16), (0.18, 5.4)])
        kk = int(0.002 * SR); x[:kk] += noise(kk) * 0.6
        i = int(k * 0.15 * SR); o[i:i + len(x)] += x[: len(o) - i] * (1 - 0.18 * k)
    return o * 0.2 * g
def typekey(g=1.0):
    return mx(noiseb(0.025, 1400, 7000, 0.005) * 0.7, thud(220, 0.05, 0.25), metal(rng.uniform(2300, 3600), 0.04, 0.25)) * g
def typebell(g=1.0): return mx(bell(2640, 0.35), ratchet(0.35, 0.6, 30)) * g
def typing(E, a, b, rate, jitter, g=1.0, pan=0.0):
    t = a
    while t < b - 0.3:
        E(t, typekey(g * (0.75 + 0.4 * rng.random())), 1.0, pan + rng.uniform(-0.08, 0.08))
        t += (1.0 / rate) * (1 + jitter * rng.uniform(-0.8, 1.2))
    E(b - 0.25, typebell(g * 0.8), 1.0, pan)
def knock(g=1.0):
    """the dry wooden knock of a word becoming wall"""
    return mx(thud(210, 0.08, 0.5), noiseb(0.03, 900, 4200, 0.008) * 0.45) * g
def bigknock(g=1.0): return mx(thud(120, 0.25, 0.9), noiseb(0.06, 500, 3000, 0.015) * 0.5, thud(70, 0.4, 0.4)) * g
def flourish(g=1.0, notes=(392, 523.3, 659.3), cut=None):
    """a small ceremonial brass figure when a door is finished; cut drops the last notes"""
    o = np.zeros(int(2.0 * SR)); seq = [(0.0, notes[0], 0.16), (0.18, notes[1], 0.16), (0.36, notes[2], 0.9)]
    if cut: seq = seq[:cut]
    for st, f, d in seq:
        for ff_ in ([f] if d < 0.5 else [f, f * 1.25, f / 2]):
            b = brass(ff_, d, 1.0); i = int(st * SR); o[i:i + len(b)] += b[: len(o) - i]
    return o * g
def latch(g=1.0):
    """a door latch: the bolt drawn, a click, the catch"""
    return mx(metal(1900, 0.06, 0.5), noiseb(0.02, 1500, 7000, 0.004) * 0.5, np.concatenate([np.zeros(int(0.09 * SR)), mx(metal(2600, 0.05, 0.6), thud(300, 0.04, 0.2))])) * g
def boom(g=1.0):
    """the hall's great doors shutting"""
    return mx(thud(46, 1.2, 1.2), thud(70, 0.5, 0.6), noiseb(0.25, 80, 900, 0.08) * 0.6, np.concatenate([np.zeros(int(0.12 * SR)), latch(0.7)])) * g
def thump(g=1.0):
    """a shoulder against a solid door that has no hinges: nothing gives"""
    return mx(thud(85, 0.3, 1.0), noiseb(0.05, 300, 2200, 0.012) * 0.35) * g
def rattle(g=1.0):
    """a carved knob that does not turn"""
    o = np.zeros(int(0.5 * SR))
    for k in range(4): b = metal(rng.uniform(1700, 2400), 0.05, 0.6); i = int(k * 0.09 * SR); o[i:i + len(b)] += b[: len(o) - i]
    return o * g
def airpass(g=1.0):
    """passing through an absence: a soft breath of air and nothing else"""
    return swell(1.0, 300, 2600, 0.22) * g
def shutter(g=1.0): return mx(noiseb(0.12, 900, 5000, 0.04, 0.02) * 0.4, metal(2200, 0.05, 0.5)) * g
def plaque(g=1.0): return mx(metal(1500, 0.18, 0.9), metal(2900, 0.1, 0.5), thud(400, 0.04, 0.2)) * g
def chink(g=1.0): return metal(rng.uniform(3000, 5200), 0.12, rng.uniform(0.3, 0.7)) * g
def trolley(d, g=1.0):
    """the tea trolley: small wheels, cups chinking, one wheel that squeaks"""
    o = np.zeros(int(d * SR)); t = 0.0
    while t < d - 0.2:
        b = chink(0.5); i = int(t * SR); o[i:i + len(b)] += b[: len(o) - i]; t += rng.exponential(0.16)
    o += filt(brown(len(o)), 'bandpass', [80, 400]) * 0.25
    for k in range(int(d / 0.7)):
        c = creak(0.18, 900, 0.5); i = int((0.2 + k * 0.7) * SR); o[i:i + len(c)] += c[: max(0, len(o) - i)]
    return o * np.minimum(1, tt(d) / 0.3) * g
def assemble(g=1.0):
    """the Encounterist's door: letters rushing together, then a hard clack"""
    return mx(rise(0.35, 1500, 8000, 0.18), np.concatenate([np.zeros(int(0.33 * SR)), mx(bigknock(0.9), latch(0.5))])) * g
def disperse(g=1.0): return mx(swell(0.45, 1800, 9000, 0.1), rustle(0.3, 0.6)) * g
def tick(g=1.0, hi=True): return mx(metal(2300 if hi else 1900, 0.04, 0.7), thud(900, 0.02, 0.15)) * 0.6 * g
def clockticks(E, a, b, g=1.0, pan=0.0):
    t = np.ceil(a * 2) / 2; k = 0
    while t < b: E(t, tick(g, k % 2 == 0), 1.0, pan); t += 1.0; k += 1
def pageflip(g=1.0):
    d = 0.5; t = tt(d); air = filt(filt(noise(len(t)), 'highpass', 900), 'lowpass', 7000) * np.sin(np.pi * t / d) ** 1.5
    return mx(air * 0.25, rustle(0.2, 1.0)) * g
def walkto(E, a, b, x0, x1, g=1.0, period=0.42):
    t = a
    while t < b - 0.1:
        u = (t - a) / max(0.01, b - a); E(t, footstep(g * (0.8 + 0.4 * rng.random())), 1.0, XP(x0 + (x1 - x0) * u)); t += period * (1 + 0.05 * rng.uniform(-1, 1))
def chair(g=1.0): return mx(creak(0.25, 260, 0.7), wood(0.4)) * g
def mop(d, g=1.0):
    """a wet mop: slow sweeps"""
    t = tt(d); x = filt(filt(noise(len(t)), 'highpass', 400), 'lowpass', 3200) * (0.25 + 0.75 * np.abs(np.sin(np.pi * t / 1.1)) ** 2)
    return x * 0.16 * np.minimum(1, t / 0.2) * np.minimum(1, (d - t) / 0.3).clip(0) * g
def bucket(g=1.0): return mx(metal(700, 0.4, 0.8), metal(1130, 0.3, 0.5), bubbles(0.4, 0.3)) * g
def snore(d, g=1.0, f0=95):
    t = tt(d); o = np.zeros(len(t)); per = 3.6
    for k in range(int(d / per)):
        s0 = int(k * per * SR); n = int(1.4 * SR); u = np.arange(n) / n
        x = filt(noise(n), 'lowpass', 500) * (1 + np.sign(np.sin(2 * np.pi * f0 * np.arange(n) / SR)) * 0.6) * np.sin(np.pi * u) ** 2
        o[s0:s0 + n] += x[: len(o) - s0] * 0.05
    return o * g
def tune(d, g=1.0, root=196.0):
    """the little procession: plucked strings walking up and down, a dry ceremonial tune"""
    seq = [0, 4, 7, 4, 9, 7, 4, 2, 0, 4, 7, 12, 11, 7, 2, 0]; o = np.zeros(int(d * SR)); st = 0.32
    for k in range(int((d - 0.8) / st)):
        n = seq[k % len(seq)]; f = root * 2 ** (n / 12); b = pluck(f, 0.5, 0.8); i = int(k * st * SR); o[i:i + len(b)] += b[: len(o) - i] * (0.9 if k % 4 == 0 else 0.6)
        if k % 4 == 0: b = pluck(root / 2 * 2 ** ((0 if (k // 4) % 2 == 0 else 7) / 12), 0.7, 0.5); o[i:i + len(b)] += b[: len(o) - i] * 0.7
    return o * g

ROOM = {'hall': (1.7, 0.2), 'night': (1.9, 0.22), None: (1.0, 0.12)}

def design(sh):
    d = sh['d']; name = sh['shot']; rt, wet = ROOM.get(sh['room'], ROOM[None])
    n = int((d + 1.0) * SR); El = np.zeros(n); Er = np.zeros(n)
    E = lambda t, sig, g=1.0, pan=0.0: eadd(El, Er, t, sig, g, pan)
    cues = sh['cues']; C = lambda k: [c for c in cues if c['k'] == k]; one = lambda k: C(k)[0]
    LN = sh['lines']
    E(0, roomtone(d + 0.5, 1.0))
    for c in C('bell'): E(c['at'], handbell(1.0), 1.0, 0.0)
    # the hall clock, always there, faint
    if name not in ('published',): clockticks(E, 0.3, d, 0.12 if name != 'cleaner' else 0.3, 0.0)
    door = {'object': 'A', 'passage': 'B', 'convention': 'C', 'encounter': 'D'}.get(name)
    if door:
        ty = one('type'); px = XP(EDX[door])
        E(ty['at'] - 0.3, mhum(ty['to'] - ty['at'] + (3.6 if C('fall') else 0.8), 70, 92, 0.0, 0.5, 0.9), 0.55, px)
        typing(E, ty['at'], ty['to'], 11.0, 0.35, 0.8, px)
        if C('fall'):
            fa = one('fall')
            for i, tl in enumerate(land_times(fa)): E(tl, knock(0.35 + 0.25 * rng.random()), 1.0, XP(BAYX[door] + (i % 2 * 2 - 1) * 50))
            lf = one('leaf'); E(lf['at'], bigknock(0.9), 1.0, XP(BAYX[door]))
            if door == 'B': E(lf['at'] + 0.15, disperse(1.2), 1.0, XP(BAYX[door]))
            E(lf['to'] + 0.1, flourish(0.55, cut=(2 if door == 'B' else None)), 1.0, 0.0)
    if name == 'arrive':
        cl = one('climb'); steps(E, cl['at'] + 1.5, cl['to'] - 0.5, 0.31, -0.3, 0.3, lambda g: dirtstep(g), 0.7)
        E(0, tune(cl['to'] + 1.5, 0.5), 1.0, 0.0)
        en = one('enter')
        for k, (w, x) in enumerate(SEATX.items()): walkto(E, en['at'] + k * 0.7, en['to'] - 1.6 + k * 0.35, 140, x, 0.7)
        for k in range(4): E(en['to'] - 1.2 + k * 0.35, chair(0.8), 1.0, XP(list(SEATX.values())[k]))
        pr = one('props'); E(pr['at'] + 0.9, chink(0.9), 1.0, 0.1); E(pr['at'] + 1.1, chink(0.6), 1.0, 0.1)
        E(pr['at'] + 2.2, mx(metal(1046, 0.4, 0.3)), 1.0, 0.0)
        c = one('close'); E(c['at'] + 0.6, boom(1.3), 1.0, -0.7)
        E(c['at'] - 0.2, creak(1.0, 140, 0.8), 1.0, -0.7)
    elif name == 'object':
        w = one('walk'); walkto(E, w['at'], w['to'], SEATX['T'], 560)
        for c in C('push'): E(c['at'], thump(1.2), 1.0, XP(510))
        E(one('knob')['at'], rattle(1.0), 1.0, XP(530))
        b = one('back'); walkto(E, b['at'], b['to'] - 0.4, 560, SEATX['T']); E(b['to'] - 0.3, chair(0.7), 1.0, XP(SEATX['T']))
    elif name == 'passage':
        w = one('walk'); walkto(E, w['at'], w['to'], SEATX['T'], 730)
        th = one('through'); walkto(E, th['at'], th['to'], 730, 760, 0.7, 0.45); E(th['at'] + 0.8, airpass(1.0), 1.0, XP(730))
        t2 = one('through2'); walkto(E, t2['at'], t2['to'], 760, 760, 0.6, 0.45); E(t2['at'] + 1.0, airpass(0.8), 1.0, XP(730))
        ar = one('around'); walkto(E, ar['at'] - 1.2, ar['to'], 560, 690, 0.6, 0.5)
        b = one('back'); walkto(E, b['at'], b['to'] - 0.3, 740, 720, 0.7)
    elif name == 'convention':
        dn = one('down'); walkto(E, dn['at'], dn['to'], 850, 930)
        E(one('card')['at'] + 0.3, mx(rustle(0.2, 0.8), metal(3000, 0.04, 0.3)), 1.0, XP(970))
        sc = one('shutter'); E(sc['at'], shutter(1.0), 1.0, XP(970)); E(sc['at'] + 0.35, plaque(0.9), 1.0, XP(970)); E(sc['to'], shutter(0.9), 1.0, XP(970))
        tr = one('trolley'); E(tr['at'], trolley(5.4, 0.9), 1.0, XP(1000))
        E(tr['at'] + 1.2, mx(latch(0.9), creak(0.8, 220, 0.6)), 1.0, XP(970)); E(tr['at'] + 4.6, latch(1.0), 1.0, XP(970))
        up = one('up'); walkto(E, up['at'], up['to'], 930, 850, 0.7)
    elif name == 'encounter':
        E(one('type')['to'] + 0.2, winddown(1.2, 92, 0.6), 1.0, XP(1300))
        dn = one('down'); walkto(E, dn['at'], dn['to'], 850, 1190)
        for c in C('appear'): E(c['at'] - 0.5, footstep(1.0), 1.0, XP(1190)); E(c['at'] - 0.35, assemble(1.1), 1.0, XP(1190))
        for c in C('vanish'): E(c['at'] - 0.4, footstep(0.8), 1.0, XP(1190)); E(c['at'], disperse(1.0), 1.0, XP(1190))
        up = one('up'); walkto(E, up['at'], up['to'], 1190, 850, 0.7)
    elif name == 'vote':
        for c in C('hand'): E(c['at'], rustle(0.3, 1.2), 1.0, XP(list(SEATX.values())[c['n']]))
        ri = one('rise'); M = ri['at']
        for k in range(4): E(M + 0.3 + k * 0.15, chair(0.9), 1.0, XP(list(SEATX.values())[k]))
        walkto(E, M + 0.6, M + 2.2, 560, 520, 0.6); E(M + 2.4, thump(1.1), 1.0, XP(510)); E(M + 2.9, thump(0.9), 1.0, XP(510))
        walkto(E, M + 0.6, M + 2.4, 720, 730, 0.6); E(M + 3.0, airpass(0.9), 1.0, XP(730))
        walkto(E, M + 0.7, M + 3.0, 980, 970, 0.6); E(LN[6]['t0'] - 0.9, shutter(0.9), 1.0, XP(970)); E(LN[6]['t0'] - 0.55, plaque(0.9), 1.0, XP(970)); E(LN[6]['t1'] + 0.5, shutter(0.8), 1.0, XP(970))
        walkto(E, M + 0.5, M + 4.8, 1140, 160, 0.7); E(M + 4.6, assemble(1.2), 1.0, XP(140))
        walkto(E, M + 5.0, M + 7.0, 520, 300, 0.6); E(M + 6.9, assemble(1.1), 1.0, XP(300))
        walkto(E, M + 6.0, M + 8.6, 760, 1400, 0.6); E(M + 8.5, assemble(1.1), 1.0, XP(1400))
        walkto(E, M + 7.4, M + 9.9, 850, 1190, 0.6); E(M + 9.8, assemble(1.2), 1.0, XP(1190))
        ck = one('clock'); clockticks(E, ck['at'], ck['to'], 0.55, 0.0)
    elif name == 'days':
        ca = one('cal'); k = 0; tm = ca['at']
        while tm < ca['to']: E(tm, pageflip(0.7), 1.0, XP(1480)); k += 1; tm += max(0.45, 1.4 * 0.93 ** k)
        clockticks(E, 0.3, d, 0.12, 0.0)
        E(0, tune(d - 0.4, 0.28, 174.6), 1.0, 0.0)
        for i in range(6): E(LN[4]['t0'] + 0.8 + i * 0.55, assemble(0.35), 1.0, XP([140, 300, 1400, 1190, 140, 300][i]))
        E(LN[1]['t0'] + 1.0, rattle(0.4), 1.0, XP(510)); walkto(E, LN[2]['t0'], LN[2]['t1'] + 0.5, 730, 740, 0.5, 0.45)
        E(LN[3]['t0'] - 0.3, pageflip(0.9), 1.0, XP(980))
    elif name == 'cleaner':
        E(0, snore(d, 1.0, 92), 1.0, -0.2); E(1.7, snore(d - 2, 0.7, 120), 1.0, 0.3)
        op = one('open'); E(op['at'], mx(latch(1.0), creak(0.7, 300, 0.5)), 1.0, XP(1570))
        en = one('enter'); walkto(E, en['at'], en['to'], 1570, 1100, 0.45, 0.5)
        E(en['at'] + 0.3, bucket(0.5), 1.0, XP(1540))
        mo = one('mop'); E(mo['at'], mop(mo['to'] - mo['at'], 1.0), 1.0, XP(900))
        E(mo['at'] + 0.4, bucket(0.6), 1.0, XP(1000))
        bk = one('basket'); E(bk['at'], mx(rustle(0.6, 1.4), pageflip(0.6)), 1.0, XP(700))
        lv = one('leave'); walkto(E, lv['at'], lv['to'], 900, 1570, 0.45, 0.5); E(lv['at'] + 0.5, bucket(0.5), 1.0, XP(1200))
        E(one('shut')['at'], latch(1.0), 1.0, XP(1570))
    elif name == 'published':
        E(0.3, mx(wood(0.6), rustle(0.4, 0.8)), 1.0, 0.0)
        E(one('turn')['at'], pageturn(1.0), 1.0, 0.0)
        dr = one('door'); clockticks(E, dr['at'] + 0.2, d - 0.3, 0.16, 0.2)
        E(dr['at'] + 2.6, filt(handbell(0.8, 2), 'lowpass', 1500), 1.0, 0.25)
    return El, Er, rt, wet

def pageturn(g=1.0):
    d = 0.7; t = tt(d); u = t / d
    air = filt(filt(noise(len(t)), 'highpass', 900), 'lowpass', 7500) * np.sin(np.pi * u) ** 1.5 * (0.6 + 0.4 * (rng.random(len(t)) > 0.6))
    return mx(air * 0.32, rustle(0.25, 1.4), np.concatenate([np.zeros(int(0.55 * SR)), mx(noiseb(0.09, 600, 5000, 0.02) * 0.5, thud(160, 0.06, 0.12))])) * g

def title_end_design(sh):
    d = sh['d']; n = int((d + 1.0) * SR); El = np.zeros(n); Er = np.zeros(n)
    E = lambda t, sig, g=1.0, pan=0.0: eadd(El, Er, t, sig, g, pan)
    E(0, roomtone(d, 0.6))
    if sh['shot'] == 'title':
        E(0.4, tune(d - 0.2, 0.55), 1.0, 0.0)
        E(5.6, handbell(0.7), 1.0, 0.0)
    else:
        E(0.3, tune(d - 1.0, 0.45, 174.6), 1.0, 0.0)
        E(d - 2.2, latch(0.8), 1.0, 0.4)
    return El, Er, 1.0, 0.12

for sh in shots:
    t0 = sh['t0']
    if sh['shot'] in ('title', 'end'): El, Er, rt, wet = title_end_design(sh)
    else: El, Er, rt, wet = design(sh)
    putvs(t0, (El, Er), rt, wet, 1.0)
    rt, wet = ROOM.get(sh['room'], ROOM[None])
    for ln in sh['lines']:
        a = ln['_a']; gg = 1.0 * (1.12 if ln['line'] else 1.0); w = wet * (0.6 if ln['who'] == 'N' else 1.0) * (1.3 if ln['line'] else 1.0)
        if isinstance(a, tuple): putvs(t0 + ln['t0'], a, rt, w, gg * 0.85)
        else: putv(t0 + ln['t0'], a, rt, w, gg, PANW.get(ln['who'], 0.0))

end_i = int((TOTAL + 0.6) * SR)
mixL, mixR = L[:end_i], Rr[:end_i]
fade = int(0.8 * SR); mixL[-fade:] *= np.linspace(1, 0, fade); mixR[-fade:] *= np.linspace(1, 0, fade)
pk = max(np.abs(mixL).max(), np.abs(mixR).max()); sc = 0.8 / pk
st = np.stack([mixL * sc, mixR * sc], 1)
os.makedirs(os.path.join(HERE, 'audio'), exist_ok=True)
wp = os.path.join(HERE, 'audio', 'cd_raw.wav')
with wave.open(wp, 'wb') as wf:
    wf.setnchannels(2); wf.setsampwidth(2); wf.setframerate(SR); wf.writeframes((np.clip(st, -1, 1) * 32767).astype('<i2').tobytes())
subprocess.check_call(['ffmpeg', '-y', '-loglevel', 'error', '-i', wp, '-af', 'loudnorm=I=-16:TP=-1.5:LRA=11', '-c:a', 'aac', '-b:a', '128k', '-ar', '48000', os.path.join(HERE, 'audio', 'cd.m4a')])
os.remove(wp)
dump()
print('done', TOTAL)
