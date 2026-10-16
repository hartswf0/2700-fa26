"""Voices, sound and music for The Perfect Description of an Empty Room (film four of THE HOUSE THAT LANGUAGE BUILT, an original
   fable from Watson Hartsoe's notes, in the manner of Stanislaw Lem).
   python3 build_sound.py  ->  timing/er.json and audio/er.m4a      (TIMING_ONLY=1 writes the timing file and stops)
   Voices: Kokoro (kokoro-onnx), model files in $KOKORO_DIR (default ~/kokoro). The narrator is bm_lewis; the Edifier is af_nicole
   with a light synthetic filter, as in the other three films. The former inhabitants are older voices, slowed, with a little
   tremor. Everything else is synthesized here with numpy and scipy, timed from the same score the picture reads.
   The sound carries what the photographs could not: the floorboard that learns to creak (a squeak, a groan, then the right
   creak), the church clock striking four before the late sun, and a kettle in one kitchen and not the other."""
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

total_guess = 480
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
    """the Edifier: calm and small, a shade higher, a faint doubled edge and a narrow band"""
    a = repitch(a, 1.03); d = int(0.004 * SR); o = np.zeros(len(a) + d); o[:len(a)] += a; o[d:] += 0.25 * a
    t = np.arange(len(o)) / SR; o = o * (1 - 0.1) + 0.1 * o * np.sin(2 * np.pi * 70 * t)
    return filt(o, 'bandpass', [170, 6200]) * 1.1
def aged_fx(a):
    """an old voice: a little lower, softened, with a slight tremor"""
    a = repitch(a, 0.985); t = np.arange(len(a)) / SR
    return filt(a, 'lowpass', 6000) * (1 + 0.07 * np.sin(2 * np.pi * 5.3 * t))
FX = {'silk': silk_fx, 'breath': breath_fx, 'gruff': gruff_fx, 'flat': flat_fx, 'small': small_fx, 'synth': synth_fx, 'edifier': edifier_fx, 'aged': aged_fx}

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
PANW = {'S': 0.0, 'M': 0.0, 'Q': -0.15, 'R': 0.3}
shots = []; t = 0.0
for s in SCRIPT:
    sh = dict(shot=s['shot'], t0=round(t, 3), lines=[], room=s.get('room'), vol=s.get('vol'))
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
    json.dump(dict(shots=shots, dur=TOTAL, cast=CAST), open(os.path.join(HERE, 'timing', 'er.json'), 'w'))
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
def typekey(g=1.0):
    return mx(noiseb(0.025, 1400, 7000, 0.005) * 0.7, thud(220, 0.05, 0.25), metal(rng.uniform(2300, 3600), 0.04, 0.25)) * g
def typebell(g=1.0): return mx(bell(2640, 0.35), ratchet(0.35, 0.6, 30)) * g
def typing(E, a, b, rate, jitter, g=1.0, line=34, pan=0.0):
    t = a; k = 0
    while t < b:
        E(t, typekey(g * (0.75 + 0.4 * rng.random())), 1.0, pan + rng.uniform(-0.1, 0.1)); k += 1
        if k % line == 0 and t + 0.6 < b: E(t + 0.12, typebell(g * 0.8), 1.0, pan + 0.2); t += 0.55
        t += (1.0 / rate) * (1 + jitter * rng.uniform(-0.8, 1.2))
def knock(g=1.0):
    """the series' dry wooden knock: a description becoming a wall"""
    return mx(thud(150 + rng.uniform(-15, 25), 0.11, 0.7), noiseb(0.04, 900, 4200, 0.008) * 0.55) * g
def falling(E, c, g=1.0, pan=0.0):
    """words leave the paper and land as walls; landing rule shared with the picture"""
    n = len(c['text'].split()); a, b = c['at'], c['to']; st = (b - a - 0.7) / max(1, n - 1)
    E(a, swell(min(2.0, b - a), 1500, 7000, 0.07), 1.0, pan)
    for i in range(n): E(a + i * st + 0.7, knock(g * (0.8 + 0.3 * rng.random())), 1.0, pan + rng.uniform(-0.25, 0.25))
def edhum(d, g=1.0, f0=55):
    """the Edifier's low hum"""
    return mhum(d, f0, f0 * 1.02, 0.0, 0.8, 0.8) * g
def pinpush(g=1.0): return mx(noiseb(0.02, 2000, 8000, 0.004) * 0.5, thud(320, 0.04, 0.18), rustle(0.12, 0.6)) * g
def latch(g=1.0):
    """a door latch: the thumb lever, the bolt, the release"""
    o = mx(metal(1900, 0.07, 0.5), noiseb(0.03, 1500, 6000, 0.006) * 0.4)
    return mx(o, np.concatenate([np.zeros(int(0.16 * SR)), mx(metal(1500, 0.12, 0.6), thud(200, 0.06, 0.25))])) * g
def doorswing(d=1.4, g=1.0): return mx(creak(d, 180, 0.4), swell(d, 120, 900, 0.08)) * g
def screw(d, g=1.0):
    """a screwdriver: short ratchet turns with pauses"""
    o = np.zeros(int(d * SR)); t = 0.0
    while t < d - 0.35:
        b = ratchet(0.28, 0.5, 24); i = int(t * SR); o[i:i + len(b)] += b[: len(o) - i]; t += 0.42 + 0.1 * rng.random()
    return o * g
def deadstep(g=1.0):
    """a step on a floor that says nothing: a short dull pad"""
    return mx(thud(90, 0.09, 0.4), noiseb(0.03, 300, 1400, 0.008) * 0.12) * g
def stairstep(g=1.0): return mx(thud(115, 0.12, 0.45), noiseb(0.04, 600, 3000, 0.01) * 0.2) * g
def clockstrike(f=196.0, g=1.0):
    """a distant church clock: a low bell with a long hum and a little beat"""
    t = tt(4.2); x = sum(a_ * np.sin(2 * np.pi * f * r_ * t + r_) * np.exp(-t / (3.4 / (1 + r_ * 0.7))) for a_, r_ in [(1, 1), (0.6, 2.0), (0.5, 2.4), (0.35, 3.0), (0.2, 4.2), (0.5, 0.5)])
    x *= 1 + 0.12 * np.sin(2 * np.pi * 1.7 * t); k = int(0.004 * SR); x[:k] += noise(k) * 0.3
    return filt(x, 'lowpass', 2400) * 0.2 * g
def fourstrikes(E, a, g=1.0, pan=0.5):
    for i in range(4): E(a + i * 1.6, clockstrike(196.0, g), 1.0, pan)
def floorcreak(v, g=1.0):
    """the floorboard learning: v0 a thin squeak, v1 a long low groan, v2 and after the right creak, short and wooden"""
    if v == 0:
        d = 0.42; t = tt(d); f = 1100 * (1 + 0.35 * t / d) + 60 * np.sin(2 * np.pi * 30 * t)
        x = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * t / d) ** 0.5
        return mx(filt(x, 'bandpass', [700, 4000]) * 0.18, thud(110, 0.08, 0.25)) * g
    if v == 1:
        return mx(creak(1.9, 95, 1.3), thud(90, 0.1, 0.3)) * g
    d = 0.55; t = tt(d); f = 210 * (1 - 0.18 * t / d) * (1 + 0.04 * np.sin(2 * np.pi * 21 * t))
    ph = 2 * np.pi * np.cumsum(f) / SR; x = (np.sign(np.sin(ph)) * 0.4 + np.sin(2 * ph) * 0.3) * (np.abs(np.sin(2 * np.pi * 38 * t)) > 0.35)
    x = filt(x, 'bandpass', [180, 2400]) * np.sin(np.pi * t / d) ** 0.6 * 0.3
    return mx(x, thud(120, 0.1, 0.32), noiseb(0.05, 500, 2500, 0.012) * 0.1) * g
def tick(g=1.0): return mx(noiseb(0.012, 2500, 8000, 0.003) * 0.25, metal(3300, 0.03, 0.12)) * g
def clockticks(E, a, b, g=1.0, pan=0.6):
    t = a; k = 0
    while t < b: E(t, tick(g * (1.0 if k % 2 else 0.7)), 1.0, pan); t += 0.5; k += 1
def kettle(d, g=1.0, whistle_at=None):
    """a kettle on a gas ring: a hiss, the water ticking and rumbling louder, then a whistle that rises and holds"""
    n = int(d * SR); t = np.arange(n) / SR; u = t / d
    ring = filt(noise(n), 'bandpass', [400, 3000]) * 0.05
    rum = filt(brown(n), 'lowpass', 300) * (0.05 + 0.5 * u ** 2) * 0.4
    tk = np.zeros(n); tm = 0.2
    while tm < d - 0.1:
        b = drip(0.6 + u[int(tm * SR)]); i = int(tm * SR); tk[i:i + len(b)] += b[: n - i] * 0.6; tm += rng.exponential(0.6 * (1.2 - u[int(tm * SR)]))
    o = ring + rum + tk
    if whistle_at is not None and whistle_at < d:
        wd = d - whistle_at; tw = tt(wd); wu = np.minimum(1, tw / 3.0)
        f = 1400 + 900 * wu + 12 * np.sin(2 * np.pi * 5 * tw); x = np.sin(2 * np.pi * np.cumsum(f) / SR) + 0.25 * filt(noise(len(tw)), 'bandpass', [1600, 3200])
        x *= wu ** 1.5 * 0.13; x[-int(0.3 * SR):] *= np.linspace(1, 0, int(0.3 * SR))
        i = int(whistle_at * SR); o[i:i + len(x)] += x[: n - i]
    return o * np.minimum(1, t / 0.4) * np.minimum(1, (d - t) / 0.6).clip(0) * g
def blackbird(g=1.0):
    """a short descending blackbird phrase, outside"""
    o = np.zeros(int(1.6 * SR)); tm = 0.0; f0 = rng.uniform(1700, 2300)
    for k in range(int(rng.integers(4, 7))):
        d = rng.uniform(0.09, 0.2); t = tt(d); f = f0 * (1 + 0.25 * np.sin(np.pi * t / d) - 0.1 * k / 6) + 300 * np.sin(2 * np.pi * rng.uniform(15, 30) * t)
        x = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * t / d) ** 0.8 * 0.12
        i = int(tm * SR); o[i:i + len(x)] += x[: len(o) - i]; tm += d + rng.uniform(0.03, 0.1)
    return filt(o, 'lowpass', 5000) * g
def birds(E, a, b, g=1.0, pan=-0.6):
    t = a + rng.uniform(0.5, 2.0)
    while t < b - 1.6: E(t, blackbird(g), 1.0, pan + rng.uniform(-0.2, 0.2)); t += rng.uniform(3.5, 7.0)
def wall_tap(g=1.0): return mx(thud(140, 0.08, 0.6), noiseb(0.025, 500, 3000, 0.006) * 0.3) * g
def pencil(d=0.8, g=1.0):
    t = tt(d); x = filt(filt(noise(len(t)), 'highpass', 1800), 'lowpass', 6500) * (0.4 + 0.6 * np.abs(np.sin(2 * np.pi * 3.2 * t)) ** 2)
    return x * np.minimum(1, t / 0.03) * np.minimum(1, (d - t) / 0.06).clip(0) * 0.22 * g
def pen(E, a, b, g=1.0, pan=-0.1):
    t = a
    while t < b - 0.3:
        w = 0.25 + 0.5 * rng.random(); E(t, pencil(w, 0.55 * g), 1.0, pan); t += w + 0.12 + 0.25 * rng.random()
def ruler(d, g=1.0):
    t = tt(d); x = filt(filt(noise(len(t)), 'highpass', 2200), 'lowpass', 7000) * np.minimum(1, t / 0.05) * np.minimum(1, (d - t) / 0.08).clip(0)
    return x * 0.14 * g
def paperslide(g=1.0): return mx(swell(0.6, 600, 6000, 0.14), rustle(0.3, 0.8)) * g
def piano(f, d=3.0, g=1.0):
    t = tt(d); x = sum(np.sin(2 * np.pi * f * k * t * (1 + 0.0004 * k * k)) * np.exp(-t * (0.9 + k * 0.7)) / k ** 1.1 for k in range(1, 7))
    k = int(0.003 * SR); x[:k] *= np.linspace(0, 1, k); return x * 0.09 * g

ROOM = {'house': (0.45, 0.14), 'office': (0.8, 0.12), None: (1.0, 0.12)}
PANW = {'N': 0.0, 'E': 0.25, 'H': -0.2, 'M': 0.2, 'P': -0.35, 'D': 0.3, 'A': -0.1}
PANS = {'wall': {'H': -0.5, 'M': 0.5}, 'archive': {'E': 0.35}}

def design(sh):
    d = sh['d']; name = sh['shot']; rt, wet = ROOM.get(sh['room'], ROOM[None])
    n = int((d + 1.0) * SR); El = np.zeros(n); Er = np.zeros(n)
    E = lambda t, sig, g=1.0, pan=0.0: eadd(El, Er, t, sig, g, pan)
    cues = sh['cues']; C = lambda k: [c for c in cues if c['k'] == k]; one = lambda k: C(k)[0]
    LN = sh['lines']
    E(0, roomtone(d + 0.5, 0.9))
    if name == 'city':
        E(0, wind(d + 0.5, 0.05)); E(0.5, padchord([98, 146.8, 196, 246.9], d, 0.05, 2.0, 1.5))
        for k in range(3): E(1.5 + k * 3.1, clockstrike(130.8, 0.25), 1.0, 0.7)
    elif name == 'board':
        p = one('pins'); m = p['n']
        for i in range(m): E(p['at'] + i * (p['to'] - p['at']) / (m - 1), pinpush(0.9), 1.0, -0.5 + i / m)
        f = one('feed'); E(f['at'] - 1.4, edhum(d - f['at'] + 1.6, 0.8), 1.0, 0.4); E(f['at'], paperslide(1.0), 1.0, 0.4)
        ticks(E, f['at'] + 0.4, f['to'], 14, 22, lambda: gear_tick(0.45), 0.8, 0.2, 0.2)
    elif name == 'build':
        E(0, edhum(d, 1.0), 1.0, 0.3)
        ty = one('type'); typing(E, ty['at'], ty['to'], 9.0, 0.35, 0.85, 40, 0.3)
        falling(E, one('fall'), 1.0, 0.0)
        fl = one('fill'); E(fl['at'], swell(fl['to'] - fl['at'] + 0.4, 200, 1500, 0.08))
        r = one('rise'); m = r['n']
        for i in range(m):
            t0 = r['at'] + i * (r['to'] - r['at']) / m; pan = -0.8 + 1.6 * i / (m - 1)
            for k in range(6): E(t0 + k * 0.07 + 0.02 * rng.random(), knock(0.45), 1.0, pan)
        E(LN[3]['t0'] - 1.0, padchord([110, 164.8, 220], LN[3]['t1'] - LN[3]['t0'] + 3.5, 0.05, 1.0, 2.0))
    elif name == 'visit':
        birds(E, 0, d, 0.25, -0.7)
        E(one('latch')['at'], latch(1.0), 1.0, -0.6); E(one('latch')['at'] + 0.3, doorswing(1.4, 0.8), 1.0, -0.6)
        en = one('enter'); steps(E, en['at'], en['to'], 0.42, -0.7, 0.1, lambda g: footstep(g) * 0.5, 0.8, 0.12)
        for c in C('step'): E(c['at'], deadstep(1.2), 1.0, -0.1)
        E(0, edhum(d, 0.35), 1.0, 0.45)
    elif name == 'correct':
        birds(E, 0, d, 0.22, -0.7); E(0, edhum(d, 0.4), 1.0, 0.45)
        hg = one('hinge'); E(hg['at'], screw(hg['to'] - hg['at'], 0.8), 1.0, -0.55)
        tr = one('try'); E(tr['at'], latch(1.0), 1.0, -0.55); E(tr['at'] + 0.3, doorswing(1.6, 0.9), 1.0, -0.55)
        fourstrikes(E, one('clock')['at'], 0.7, 0.6)
        for c in C('sun'): E(c['at'], swell(c['to'] - c['at'] + 0.6, 1200, 6000, 0.035), 1.0, 0.5)
        stc = one('stairs')
        for k in range(14): E(stc['at'] + k * (stc['to'] - stc['at']) / 14, knock(0.35), 1.0, 0.5)
        cl = one('climb')
        for k in range(14): E(cl['at'] + k * (cl['to'] - cl['at']) / 14, stairstep(0.6 + 0.02 * k), 1.0, 0.3 + k * 0.02)
        for c in C('creak'): E(c['at'], floorcreak(min(c['n'], 2), 1.3), 1.0, -0.1)
        tg = one('tags')
        for k in range(5): E(tg['at'] + k * (tg['to'] - tg['at']) / 5, pinpush(0.8), 1.0, -0.4 + 0.2 * k)
    elif name == 'kitchens':
        E(0, edhum(d, 0.5), 1.0, 0.0)
        ph = one('photo'); E(ph['at'], paperslide(0.8), 1.0, 0.2)
        ty = one('type'); typing(E, ty['at'], ty['to'], 11.0, 0.3, 0.8, 50, 0.0)
        for c in C('fall'): falling(E, c, 0.95, -0.45 if c['n'] == 0 else 0.45)
        fl = one('fill'); E(fl['at'], swell(fl['to'] - fl['at'] + 0.4, 200, 1500, 0.08))
        k = one('kettle'); E(k['at'], kettle(k['to'] - k['at'] + 0.5, 0.7), 1.0, -0.6)
        clockticks(E, LN[7]['t0'] - 0.5, d, 0.45, 0.6)
    elif name == 'archive':
        pl = one('plan'); t = pl['at']
        while t < pl['to']: E(t, pencil(0.18 + 0.2 * rng.random(), 0.9), 1.0, rng.uniform(-0.3, 0.3)); t += 0.35 + 0.2 * rng.random()
        ru = one('rule')
        for k in range(3): E(ru['at'] + k * (ru['to'] - ru['at']) / 3, ruler((ru['to'] - ru['at']) / 3 * 0.8, 1.0), 1.0, -0.1)
        for c in C('write'): pen(E, c['at'], c['to'], 1.2, -0.1)
        me = one('memo'); E(me['at'], paperslide(1.1), 1.0, 0.3)
        rp = one('reply'); pen(E, rp['at'], rp['to'], 1.0, -0.1)
        clockticks(E, 0.2, d, 0.3, 0.5)
    elif name == 'wall':
        pl = one('plates'); E(pl['at'], screw(1.6, 0.6), 1.0, -0.5); E(pl['at'] + (pl['to'] - pl['at']) * 0.55, screw(1.6, 0.6), 1.0, 0.5)
        birds(E, 0, d, 0.2, -0.8)
        clockticks(E, 0.3, d, 0.35, 0.75)
        fourstrikes(E, one('clock')['at'], 0.65, 0.0)
        s = one('sun'); E(s['at'], padchord([130.8, 196, 246.9, 329.6], s['to'] - s['at'], 0.035, 4.0, 3.0))
        k = one('kettle'); E(k['at'], kettle(k['to'] - k['at'], 0.75, whistle_at=10.5), 1.0, -0.55)
        E(one('lift')['at'], mx(metal(900, 0.15, 0.4), thud(160, 0.08, 0.2)), 1.0, -0.5)
        E(one('creak')['at'], floorcreak(2, 1.2), 1.0, 0.5)
        tu = one('turn'); E(tu['at'], rustle(0.6, 0.5), 1.0, 0.45)
        for i, c in enumerate(C('tap')): E(c['at'], wall_tap(0.9), 1.0, 0.25 if i < 2 else -0.25)
        last = LN[-1]['t1']
        for i, f in enumerate([392.0, 329.6, 293.7]): E(last + 1.4 + i * 1.3, piano(f, 3.2, 0.7), 1.0, -0.2 + 0.2 * i)
    return El, Er, rt, wet

def title_end_design(sh):
    d = sh['d']; n = int((d + 1.0) * SR); El = np.zeros(n); Er = np.zeros(n)
    E = lambda t, sig, g=1.0, pan=0.0: eadd(El, Er, t, sig, g, pan)
    E(0, roomtone(d + 0.5, 0.8))
    if sh['shot'] == 'title':
        E(0, padchord([98, 146.8, 196, 246.9], d, 0.06, 1.5, 1.8), 1.0, 0.0)
        typing(E, 0.8, 4.2, 9.0, 0.4, 0.7, 60)
        E(4.6, knock(0.8), 1.0, 0.0)
    elif sh['shot'] == 'photo':
        E(1.0, pinpush(0.7), 1.0, 0.0)
    else:
        E(0.6, piano(392.0, 3.5, 0.5)); E(2.0, piano(293.7, 4.0, 0.45))
    return El, Er, 1.0, 0.12

for sh in shots:
    t0 = sh['t0']
    if sh['shot'] in ('title', 'end', 'photo'): El, Er, rt, wet = title_end_design(sh)
    else: El, Er, rt, wet = design(sh)
    putvs(t0, (El, Er), rt, wet, 1.0)
    rt, wet = ROOM.get(sh['room'], ROOM[None])
    for ln in sh['lines']:
        a = ln['_a']; gg = 1.0 * (1.12 if ln['line'] else 1.0); w = wet * (1.4 if ln['line'] else 1.0)
        if ln['who'] == 'N': w = 0.06
        pan = PANS.get(sh['shot'], {}).get(ln['who'], PANW.get(ln['who'], 0.0))
        putv(t0 + ln['t0'], a, rt, w, gg, pan)

end_i = int((TOTAL + 0.6) * SR)
mixL, mixR = L[:end_i], Rr[:end_i]
fade = int(0.8 * SR); mixL[-fade:] *= np.linspace(1, 0, fade); mixR[-fade:] *= np.linspace(1, 0, fade)
pk = max(np.abs(mixL).max(), np.abs(mixR).max()); sc = 0.8 / pk
st = np.stack([mixL * sc, mixR * sc], 1)
os.makedirs(os.path.join(HERE, 'audio'), exist_ok=True)
wp = os.path.join(HERE, 'audio', 'er_raw.wav')
with wave.open(wp, 'wb') as wf:
    wf.setnchannels(2); wf.setsampwidth(2); wf.setframerate(SR); wf.writeframes((np.clip(st, -1, 1) * 32767).astype('<i2').tobytes())
subprocess.check_call(['ffmpeg', '-y', '-loglevel', 'error', '-i', wp, '-af', 'loudnorm=I=-16:TP=-1.5:LRA=11', '-c:a', 'aac', '-b:a', '128k', '-ar', '48000', os.path.join(HERE, 'audio', 'er.m4a')])
os.remove(wp)
dump()
print('done', TOTAL)
