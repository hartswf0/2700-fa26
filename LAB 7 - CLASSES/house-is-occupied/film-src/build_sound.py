"""Voices, sound and music for The House Is Occupied (from Watson Hartsoe's screenplay, after Italo Calvino).
   python3 build_sound.py  ->  timing/hi.json and audio/hi.m4a. Kokoro voices; phone and recorded-call voices band-limited;
   rain, a printer, a telephone, a freight train at 21:16, a chain and a steel shutter, fire, a camera flash, a siren."""
import hashlib, json, os, re, subprocess, wave
import numpy as np
from scipy.signal import butter, sosfilt, fftconvolve, resample_poly

HERE = os.path.dirname(os.path.abspath(__file__))
KDIR = os.environ.get('KOKORO_DIR', os.path.expanduser('~/kokoro'))
SR = 48000
rng = np.random.default_rng(1973)
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

total_guess = 640
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
def osc_fx(a):
    """ONTARES II: an even voice with a slow swell and fade, as if riding a wave, and a faint ring underneath"""
    t = np.arange(len(a)) / SR; trem = 0.72 + 0.28 * np.sin(2 * np.pi * 2.2 * t)
    rm = a * np.sin(2 * np.pi * 180 * t)
    return filt(a * trem + 0.18 * rm, 'bandpass', [160, 6000]) * 1.1
def cold_fx(a):
    """METAX: lowered, sample-and-held at 11 kHz, with cold air riding on the voice"""
    a = repitch(a, 0.95); h = SR // 11000; b = np.repeat(a[::h], h)[:len(a)]
    env = np.convolve(np.abs(b), np.ones(int(0.02 * SR)) / int(0.02 * SR), 'same')
    air = filt(noise(len(b)), 'highpass', 5000) * env * 0.9
    d = int(0.031 * SR); o = np.zeros(len(b) + d); o[:len(b)] += b + air; o[d:] += 0.22 * b
    return filt(o, 'highpass', 90) * 1.05
def phone_fx(a):
    """a voice down a telephone line: narrow band, a little grit"""
    return np.tanh(filt(a, 'bandpass', [330, 3200]) * 2.2) * 0.55
def record_fx(a):
    """a recorded message on a call box: telephone band, flat, with a faint hum"""
    t = np.arange(len(a)) / SR
    return filt(a, 'bandpass', [300, 3400]) * 1.1 + 0.004 * np.sin(2 * np.pi * 50 * t)
FX = {'phone': phone_fx, 'record': record_fx, 'silk': silk_fx, 'breath': breath_fx, 'gruff': gruff_fx, 'flat': flat_fx, 'small': small_fx, 'synth': synth_fx, 'osc': osc_fx, 'cold': cold_fx}

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
PANW = {'K': 0.2, 'W': -0.1, 'R': -0.2, 'O': 0.2, 'I': 0.25, 'B': -0.25, 'A': 0.3, 'C': 0.1, 'S': 0.0, 'M': 0.0, 'Q': -0.15, 'R': 0.3}
shots = []; t = 0.0
for s in SCRIPT:
    sh = dict(shot=s['shot'], t0=round(t, 3), lines=[], room=s.get('room'), vol=s.get('vol'), clock=s.get('clock', ''))
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
    json.dump(dict(shots=shots, dur=TOTAL, cast=CAST), open(os.path.join(HERE, 'timing', 'hi.json'), 'w'))
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
def chime(n=0, g=1.0):
    """the reading machine's chime: two small bell notes, a fifth apart"""
    f0 = [1318.5, 1174.7][n % 2]
    a = bell(f0, 0.55); b = bell(f0 * 1.5, 0.45); o = np.zeros(len(a) + int(0.13 * SR)); o[:len(a)] += a; o[int(0.13 * SR):] += b
    return o * g
def pageturn(g=1.0):
    """a page turning: a dry lift, the sheet passing through air, a soft landing"""
    d = 0.7; t = tt(d); u = t / d
    air = filt(filt(noise(len(t)), 'highpass', 900), 'lowpass', 7500) * np.sin(np.pi * u) ** 1.5 * (0.6 + 0.4 * (rng.random(len(t)) > 0.6))
    o = mx(air * 0.32, rustle(0.25, 1.4), np.concatenate([np.zeros(int(0.55 * SR)), mx(noiseb(0.09, 600, 5000, 0.02) * 0.5, thud(160, 0.06, 0.12))]))
    return o * g
def slide(g=1.0):
    """a bound volume drawn off the shelf: cloth on wood, then set down on the lectern"""
    o = mx(swell(0.8, 250, 2600, 0.35), rustle(0.6, 0.8))
    return mx(o, np.concatenate([np.zeros(int(1.5 * SR)), mx(wood(0.7), thud(110, 0.15, 0.4))])) * g
def typekey(g=1.0):
    return mx(noiseb(0.025, 1400, 7000, 0.005) * 0.7, thud(220, 0.05, 0.25), metal(rng.uniform(2300, 3600), 0.04, 0.25)) * g
def typebell(g=1.0): return mx(bell(2640, 0.35), ratchet(0.35, 0.6, 30)) * g
def typing(E, a, b, rate, jitter, g=1.0, line=34):
    """a typewriter: keys at rate per second, jitter 0..1; a bell and a carriage return every line keys"""
    t = a; k = 0
    while t < b:
        E(t, typekey(g * (0.75 + 0.4 * rng.random())), 1.0, rng.uniform(-0.2, 0.2)); k += 1
        if k % line == 0 and t + 0.6 < b: E(t + 0.12, typebell(g * 0.8), 1.0, 0.3); t += 0.55
        t += (1.0 / rate) * (1 + jitter * rng.uniform(-0.8, 1.2) + (0.6 * jitter if rng.random() < 0.15 * jitter else 0))
def blip(f, d=0.03, g=1.0):
    t = tt(d); x = np.sign(np.sin(2 * np.pi * f * t)) * np.exp(-t / (d / 3)); x[:int(0.001 * SR)] *= np.linspace(0, 1, int(0.001 * SR)); return filt(x, 'lowpass', 6000) * 0.07 * g
SCALE = [880, 990, 1100, 1320, 1480, 1760, 1980, 2200, 2640]
def databed(E, a, b, g=1.0, rate=16, density=0.7, seed=0):
    """the data rhythm: a fixed sixteen-step pattern of blips, clicks and a low pulse, at rate steps per second"""
    r = np.random.default_rng(500 + seed); pat = [(r.random() < density, int(r.integers(0, len(SCALE))), r.random() < 0.3) for _ in range(16)]
    t = a; k = 0
    while t < b:
        on, fi, cl = pat[k % 16]
        if on: E(t, blip(SCALE[fi] * (2 if (k // 64) % 2 and fi < 3 else 1), 0.028, g), 1.0, 0.5 * np.sin(k * 0.7))
        if cl: E(t, noiseb(0.012, 3000, 9000, 0.003) * 0.12 * g, 1.0, -0.3)
        if k % 4 == 0: E(t, thud(70, 0.09, 0.22 * g), 1.0, 0.0)
        t += 1.0 / rate; k += 1
def breathing(E, a, b, g=1.0, pan=0.35):
    """the reader's breath: in, out, a pause"""
    t = a
    while t < b - 1.0:
        di, do = 1.1 + 0.3 * rng.random(), 1.5 + 0.4 * rng.random()
        ti = tt(di); x = filt(filt(noise(len(ti)), 'highpass', 500), 'lowpass', 2800) * np.sin(np.pi * ti / di) ** 2 * 0.07
        to_ = tt(do); y = filt(filt(noise(len(to_)), 'highpass', 300), 'lowpass', 1800) * np.sin(np.pi * to_ / do) ** 2 * 0.09
        E(t, x * g, 1.0, pan); E(t + di + 0.1, y * g, 1.0, pan); t += di + do + 1.0 + 0.8 * rng.random()
def pencil(d=0.8, g=1.0):
    """graphite on paper: a short dry scratch with the hand's rhythm in it"""
    t = tt(d); x = filt(filt(noise(len(t)), 'highpass', 1800), 'lowpass', 6500) * (0.4 + 0.6 * np.abs(np.sin(2 * np.pi * 3.2 * t)) ** 2)
    return x * np.minimum(1, t / 0.03) * np.minimum(1, (d - t) / 0.06).clip(0) * 0.22 * g
def pen(E, a, b, g=1.0, pan=-0.1):
    """the scholar's pen: soft strokes in bursts, words and spaces"""
    t = a
    while t < b - 0.3:
        w = 0.25 + 0.5 * rng.random(); E(t, pencil(w, 0.55 * g), 1.0, pan); t += w + 0.12 + 0.25 * rng.random()
def espeak_layer(E, a, b, g=1.0):
    """eSpeak reading strings of numbers too fast to follow, narrow and quiet"""
    try:
        import sys; sys.path.insert(0, HERE); import espeak as ES
    except Exception as e:
        print('espeak unavailable', e); return
    r = np.random.default_rng(9); t = a
    while t < b - 1.0:
        s = ' '.join(''.join(str(int(r.integers(0, 10))) for _ in range(int(r.integers(2, 5)))) for _ in range(6))
        x, sr, _ = ES.say(s, 'en-us', 420, 60, 10); x = resample_poly(x.astype(np.float64) / 32768.0, SR, sr)
        x = filt(x, 'bandpass', [600, 3800]) * 0.5; E(t, x * g, 1.0, float(r.uniform(-0.6, 0.6))); t += len(x) / SR + 0.5 + r.random()


# ---------------- this film's sounds ----------------
def roomtone(d, g=1.0): return filt(brown(int(d * SR)), 'lowpass', 220) * 0.04 * g
def pageturn(g=1.0):
    """a page turning: a dry lift, the sheet passing through air, a soft landing"""
    d = 0.7; t = tt(d); u = t / d
    air = filt(filt(noise(len(t)), 'highpass', 900), 'lowpass', 7500) * np.sin(np.pi * u) ** 1.5 * (0.6 + 0.4 * (rng.random(len(t)) > 0.6))
    o = mx(air * 0.32, rustle(0.25, 1.4), np.concatenate([np.zeros(int(0.55 * SR)), mx(noiseb(0.09, 600, 5000, 0.02) * 0.5, thud(160, 0.06, 0.12))]))
    return o * g
def slide(g=1.0):
    """a bound volume drawn off the shelf: cloth on wood, then set down on the lectern"""
    o = mx(swell(0.8, 250, 2600, 0.35), rustle(0.6, 0.8))
    return mx(o, np.concatenate([np.zeros(int(1.5 * SR)), mx(wood(0.7), thud(110, 0.15, 0.4))])) * g
def shelve(g=1.0):
    """a volume pushed into its place on the shelf: cloth sliding, a wooden knock"""
    return mx(swell(0.6, 300, 2400, 0.3), np.concatenate([np.zeros(int(0.55 * SR)), mx(wood(0.8), thud(120, 0.12, 0.35))])) * g
def counter_tick(g=1.0):
    """one step of a mechanical counter: a small click and a metal wheel"""
    return mx(noiseb(0.018, 1800, 8000, 0.004) * 0.6, metal(rng.uniform(2600, 3400), 0.05, 0.22)) * g
def roll(d, g=1.0, rate=22):
    o = np.zeros(int(d * SR)); tm = 0.0
    while tm < d - 0.03: b = counter_tick(0.5 + 0.3 * rng.random()); i = int(tm * SR); o[i:i + len(b)] += b[: len(o) - i]; tm += 1 / rate
    return o * g
def amp_u(u, pk):
    """the oscillation's amplitude along the drawn curve: 1, with one local shortfall near pk (shared with bt.js)"""
    return 1 - 0.55 * np.exp(-((u - pk) / 0.045) ** 2)
def osc_tone(d, cycles, pk, g=1.0):
    """the pure tone that follows the ink curve: loud at each peak, silent at each zero, higher for Good and lower for Evil"""
    t = tt(d); u = t / d; ph = 2 * np.pi * cycles * u; s = np.sin(ph) * amp_u(u, pk)
    f = 330 * (1 + 0.22 * s); x = np.sin(2 * np.pi * np.cumsum(f) / SR) + 0.12 * np.sin(4 * np.pi * np.cumsum(f) / SR)
    e = np.abs(s) ** 0.8 * np.minimum(1, t / 0.2) * np.minimum(1, (d - t) / 0.4).clip(0)
    return x * e * 0.16 * g
def coldhiss(d, g=1.0, grow=1.0):
    """the cryotrons: a high cold hiss with crackles of frost that grow denser"""
    t = tt(d); u = t / d
    x = filt(filt(noise(len(t)), 'highpass', 3800), 'lowpass', 11000) * (0.7 + 0.3 * np.sin(2 * np.pi * 0.13 * t)) * 0.05
    cr = (rng.random(len(t)) > 1 - (0.00012 + 0.0005 * u * grow)).astype(float) * rng.uniform(0.2, 1.0, len(t))
    cr = filt(cr, 'highpass', 4000) * 0.5
    return (x + cr) * np.minimum(1, t / 1.0) * np.minimum(1, (d - t) / 0.8).clip(0) * g
def strike(g=1.0):
    """one printed digit from the cold machine"""
    return mx(noiseb(0.02, 1500, 7000, 0.005) * 0.5, thud(240, 0.04, 0.15), metal(rng.uniform(3000, 4200), 0.03, 0.12)) * g
def tallymark(g=1.0):
    t = tt(0.12); x = filt(filt(noise(len(t)), 'highpass', 2000), 'lowpass', 7000) * np.sin(np.pi * t / 0.12) ** 0.5
    return x * 0.2 * g
def granular(d, g=1.0, conv=True):
    """many small grains; conv=True gathers (sparse to dense, rising), False scatters"""
    o = np.zeros(int(d * SR)); tm = 0.0
    while tm < d - 0.05:
        u = tm / d; v = u if conv else 1 - u
        f = 600 + 2600 * v + rng.uniform(-200, 200); b = blip(f, 0.02, 0.6 + 0.6 * rng.random())
        i = int(tm * SR); o[i:i + len(b)] += b[: len(o) - i]; tm += 1 / (8 + 60 * v) * rng.uniform(0.6, 1.4)
    return o * g
def burst(g=1.0):
    return mx(thud(42, 1.2, 1.0), noiseb(2.2, 80, 3000, 0.6, 0.004) * 0.7, rise(0.3, 400, 4000, 0.1)) * g
def clock_tick(f=1800, g=1.0): return mx(noiseb(0.015, 1500, 6000, 0.004) * 0.5, metal(f, 0.06, 0.25)) * g
def whoosh(d, g=1.0):
    t = tt(d); u = t / d; x = filt(noise(len(t)), 'bandpass', [500, 6000]) * np.sin(np.pi * u) ** 2
    return x * 0.25 * g

def crackle(d, g=1.0, dens=1.0):
    """a house fire: a low roar under dry pops and snaps"""
    t = tt(d); u = t / d
    base = filt(brown(len(t)), 'lowpass', 600) * 0.35 + filt(noise(len(t)), 'bandpass', [400, 2500]) * 0.03
    pops = (rng.random(len(t)) > 1 - 0.0006 * dens).astype(float) * rng.uniform(0.3, 1.0, len(t))
    pops = filt(pops, 'highpass', 1500) * 0.9
    return (base + pops) * np.minimum(1, t / 0.8) * np.minimum(1, (d - t) / 1.0).clip(0) * g
def crinkle(g=1.0):
    """a plastic folder lifted out of ash"""
    t = tt(0.6); x = filt(noise(len(t)), 'highpass', 2500) * (rng.random(len(t)) > 0.93) * np.sin(np.pi * t / 0.6)
    return mx(x * 0.5, rustle(0.4, 0.6)) * g
def pin(g=1.0):
    """a card pinned to cork"""
    return mx(thud(220, 0.05, 0.25), noiseb(0.02, 1500, 6000, 0.005) * 0.4, metal(rng.uniform(3200, 3800), 0.04, 0.1)) * g
def stamp(g=1.0): return mx(thud(85, 0.25, 0.8), wood(0.5), noiseb(0.05, 300, 2000, 0.02) * 0.3) * g
def doorbell(g=1.0):
    """a two-note house bell"""
    return mx(bell(659.3, 0.6), np.concatenate([np.zeros(int(0.42 * SR)), bell(523.3, 0.6)])) * g
def drizzle(d, g=1.0):
    t = tt(d); x = filt(filt(noise(len(t)), 'highpass', 1800), 'lowpass', 9000) * 0.025
    drops = filt((rng.random(len(t)) > 0.9993).astype(float) * rng.uniform(0.2, 0.8, len(t)), 'bandpass', [1500, 5000]) * 0.25
    return (x + drops) * np.minimum(1, t / 1.5) * np.minimum(1, (d - t) / 1.5).clip(0) * g
def siren(d, g=1.0, grow=True):
    """a two-tone siren, distant and coming nearer"""
    t = tt(d); ph = np.floor(t / 0.62) % 2; f = np.where(ph == 0, 740, 554)
    f = filt(f.astype(float), 'lowpass', 40); x = np.sin(2 * np.pi * np.cumsum(f) / SR)
    x = filt(np.tanh(x * 1.6), 'bandpass', [300, 3500])
    e = (np.minimum(1, t / d) ** 1.4 if grow else 1) * np.minimum(1, (d - t) / 0.6).clip(0)
    return x * e * 0.08 * g
def catch(g=1.0): return mx(metal(4200, 0.05, 0.4), noiseb(0.015, 2500, 9000, 0.003) * 0.6, thud(300, 0.03, 0.15)) * g
def errbeep(g=1.0):
    o = np.zeros(int(1.4 * SR))
    for k in range(4): b = blip(440 if k % 2 else 330, 0.22, 9.0); i = int(k * 0.3 * SR); o[i:i + len(b)] += b[: len(o) - i]
    return o * g
def hum(d, g=1.0):
    """the computer cabinet: a steady mains hum with a fan"""
    t = tt(d); x = 0.5 * np.sin(2 * np.pi * 60 * t) + 0.25 * np.sin(2 * np.pi * 120 * t) + 0.1 * np.sin(2 * np.pi * 180 * t)
    fan = filt(noise(len(t)), 'bandpass', [200, 900]) * 0.08
    return (x * 0.035 + fan * 0.5) * np.minimum(1, t / 1.0) * np.minimum(1, (d - t) / 1.0).clip(0) * g
def chesspiece(g=1.0): return mx(wood(0.6), thud(260, 0.05, 0.2)) * g

ROOM = {None: (0.6, 0.08)}
def train(d, g=1.0, near=1.0):
    """a freight train passing: a low roar, wheel clatter over joints, rising and falling"""
    t = tt(d); u = t / d
    env = np.minimum(1, t / 3.0) * np.minimum(1, (d - t) / 4.0).clip(0)
    roar = filt(brown(len(t)), 'lowpass', 300) * 0.9 + filt(noise(len(t)), 'bandpass', [200, 1800]) * 0.12
    o = roar * env
    tm = 0.4
    while tm < d - 0.3:
        b = mx(thud(70, 0.12, 0.9), noiseb(0.05, 400, 3000, 0.02) * 0.5); i = int(tm * SR); o[i:i + len(b)] += b[: len(o) - i] * env[i] * 1.3
        tm += 0.38 if (int(tm / 0.38) % 2) else 0.16
    return o * 0.5 * g * near
def horn(d=2.2, g=1.0):
    t = tt(d); x = sum(np.sin(2 * np.pi * f * t) for f in (311, 370, 466)) * np.minimum(1, t / 0.3) * np.minimum(1, (d - t) / 0.5)
    return filt(np.tanh(x * 0.8), 'lowpass', 2500) * 0.05 * g
def phonering(g=1.0):
    t = tt(1.6); x = np.sin(2 * np.pi * 440 * t) * np.sign(np.sin(2 * np.pi * 20 * t)) * ((t % 0.8) < 0.6)
    return filt(x, 'bandpass', [400, 3000]) * 0.18 * g
def chainfall(g=1.0):
    o = np.zeros(int(1.6 * SR)); tm = 0.0
    for k in range(18): b = metal(rng.uniform(1800, 3200), 0.06, 0.4); i = int(tm * SR); o[i:i + len(b)] += b[: len(o) - i]; tm += 0.035
    b = mx(thud(55, 0.6, 1.2), noiseb(0.3, 200, 3000, 0.1) * 0.6, metal(900, 0.5, 0.5)); i = int(0.7 * SR); o[i:i + len(b)] += b[: len(o) - i]
    return o * g
def zap(g=1.0): return mx(noiseb(0.25, 2000, 9000, 0.05) * 0.8, thud(120, 0.1, 0.4)) * g
def flashpop(g=1.0): return mx(noiseb(0.04, 3000, 9000, 0.01) * 0.6, rise(0.5, 2000, 5000, 0.08)) * g
def siren2(d, g=1.0): return siren(d, g)
def design(sh):
    d = sh['d']; name = sh['shot']; rt, wet = ROOM[None]
    n = int((d + 1.0) * SR); El = np.zeros(n); Er = np.zeros(n)
    E = lambda t, sig, g=1.0, pan=0.0: eadd(El, Er, t, sig, g, pan)
    cues = sh['cues']; C = lambda k: [c for c in cues if c['k'] == k]; one = lambda k: C(k)[0]
    LN = sh['lines']
    E(0, roomtone(d + 0.5, 0.9))
    if name in ('lab', 'replay', 'dawn'): E(0, hum(d + 0.4, 1.0), 1.0, -0.4)
    if name in ('lab', 'replay', 'yard', 'call'): E(0, drizzle(d + 0.4, 0.9), 1.0, 0.2)
    if name == 'lab':
        sh_ = one('sheet'); E(sh_['at'], ratchet(sh_['to'] - sh_['at'], 0.6, 22), 1.0, -0.4)
        E(one('cheque')['at'] + 0.2, rustle(0.4, 0.8), 1.0, 0.1)
    elif name == 'call':
        E(one('click')['at'], mx(thud(300, 0.04, 0.4), noiseb(0.02, 2000, 6000, 0.005) * 0.4), 1.0, 0.3)
    elif name == 'replay':
        for k in ('withhold', 'party', 'own'): typing(E, one(k)['at'] - 1.4, one(k)['at'], 12, 0.3, 0.6); E(one(k)['at'] + 0.1, blip(880, 0.08, 6), 1.0, -0.2)
        E(one('own')['at'] + 0.2, errbeep(0.7), 1.0, -0.3)
        E(one('go')['at'], mx(creak(0.8, 300, 0.5), footstep(0.6)), 1.0, 0.3)
    elif name == 'yard':
        cr = one('cross'); tm = cr['at'] + 0.3
        while tm < cr['to']: E(tm, dirtstep(0.8), 1.0, 0.1); tm += 0.34
        E(one('enter')['at'], mx(creak(0.7, 260, 0.6), thud(90, 0.2, 0.5)), 1.0, 0.0)
    elif name == 'hall':
        E(0, mhum(d, 110, 110, 0.0, 0.1, 0.25), 0.5, 0.4)
        cl = one('climb'); tm = cl['at']
        for k in range(6): E(tm + k * 0.42, footstep(0.7), 1.0, 0.3)
    elif name == 'ogiva':
        E(one('stand')['at'] + 1.6, mx(thud(80, 0.2, 0.6), wood(0.4)), 1.0, 0.1)
    elif name == 'landing':
        E(0, scratch(LN[2]['t1'], 0.25), 1.0, 0.2)
        E(one('touch')['at'], sizzle(1.0, 0.3), 1.0, 0.2)
    elif name == 'desk':
        E(one('stamp')['at'], stamp(0.9), 1.0, 0.3)
    elif name == 'order':
        E(0, mhum(d, 110, 110, 0.0, 0.1, 0.25), 0.5, 0.4)
        E(LN[0]['t1'] - 1.2, horn(2.4, 0.6), 1.0, -0.5)
        E(one('ring')['at'], mx(phonering(1.0), np.concatenate([np.zeros(int(1.9 * SR)), phonering(0.4)])), 1.0, 0.2)
        E(one('spark')['at'], zap(0.8), 1.0, 0.4)
        tr = one('train'); E(tr['at'], train(tr['to'] - tr['at'] + 1.0, 1.0), 1.0, -0.2)
        E(tr['at'] - 0.6, horn(2.0, 1.0), 1.0, -0.4)
        E(one('chain')['at'], chainfall(1.0), 1.0, 0.0)
        E(one('chain')['at'] + 0.75, zap(1.0), 1.0, 0.3)
    elif name == 'fire':
        E(0, train(6.0, 0.8), 1.0, -0.2)
        fl = one('flame'); E(fl['at'], crackle(fl['to'] - fl['at'], 1.0, 1.4), 1.0, 0.3)
        for k in ('lift1', 'lift2'): E(one(k)['at'], mx(metal(600, 0.6, 0.4), noiseb(0.6, 200, 2000, 0.3) * 0.3), 1.0, 0.0)
        E(one('iron')['at'] + 0.6, mx(thud(70, 0.2, 0.7), metal(1200, 0.3, 0.4)), 1.0, 0.1)
        pl = one('pull'); E(pl['at'] + 1.6, chainfall(0.6), 1.0, 0.0)
    elif name == 'picture':
        E(0, crackle(d, 0.5, 0.8), 1.0, 0.3)
        E(one('flash')['at'], flashpop(1.0), 1.0, -0.3)
    elif name in ('count', 'evidence', 'participant'):
        E(0, mx(drizzle(d + 0.4, 0.5), filt(brown(int((d + 0.4) * SR)), 'lowpass', 160) * 0.05), 1.0, 0.0)
        E(0, noiseb(d, 300, 4000, d, 0.5) * 0.12, 1.0, 0.4)
        if name == 'count': E(0, siren(4.0, 0.7, False), 1.0, 0.5)
        if name == 'evidence': E(one('write')['at'], scratch(one('write')['to'] - one('write')['at'], 0.6), 1.0, 0.0)
    elif name == 'dawn':
        E(one('strike')['at'], mx(ratchet(0.6, 0.7, 26), blip(660, 0.1, 5)), 1.0, -0.4)
        E(one('tear')['at'], noiseb(0.3, 1500, 8000, 0.1) * 0.6, 1.0, -0.3)
        E(one('stone')['at'] + 1.0, mx(thud(110, 0.15, 0.6), noiseb(0.08, 500, 3000, 0.03) * 0.4), 1.0, 0.2)
        tr = one('train'); E(tr['at'], train(tr['to'] - tr['at'] + 0.5, 0.7), 1.0, 0.2)
    return El, Er, rt, wet

def title_end_design(sh):
    d = sh['d']; n = int((d + 1.0) * SR); El = np.zeros(n); Er = np.zeros(n)
    E = lambda t, sig, g=1.0, pan=0.0: eadd(El, Er, t, sig, g, pan)
    if sh['shot'] == 'title':
        pr = [c for c in sh['cues'] if c['k'] == 'print'][0]; tm = pr['at']
        while tm < pr['to']: E(tm, strike(0.7), 1.0, -0.1); tm += 0.11
        E(0, drizzle(d, 0.5), 1.0, 0.2)
        E(11.0, padchord([98, 146.8, 196, 233.1], d - 11.0, 0.07, 1.2, 2.0), 1.0, 0.0)
    else:
        E(0, padchord([98, 146.8, 196, 233.1], d, 0.07, 1.5, 1.8), 1.0, 0.0)
        E(0.4, train(6.5, 0.35), 1.0, 0.2)
    return El, Er, 1.0, 0.12

for sh in shots:
    t0 = sh['t0']
    if sh['shot'] in ('title', 'end'): El, Er, rt, wet = title_end_design(sh)
    else: El, Er, rt, wet = design(sh)
    putvs(t0, (El, Er), rt, wet, 1.0)
    rt, wet = ROOM[None]
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
wp = os.path.join(HERE, 'audio', 'hi_raw.wav')
with wave.open(wp, 'wb') as wf:
    wf.setnchannels(2); wf.setsampwidth(2); wf.setframerate(SR); wf.writeframes((np.clip(st, -1, 1) * 32767).astype('<i2').tobytes())
subprocess.check_call(['ffmpeg', '-y', '-loglevel', 'error', '-i', wp, '-af', 'loudnorm=I=-16:TP=-1.5:LRA=11', '-c:a', 'aac', '-b:a', '128k', '-ar', '48000', os.path.join(HERE, 'audio', 'hi.m4a')])
os.remove(wp)
dump()
print('done', TOTAL)
