"""Voices, sound and music for The Fifth Sally (A), or Trurl's Prescription.
   python3 build_sound.py  ->  timing/tp.json and audio/tp.m4a
   Voices: Kokoro (kokoro-onnx), model files in $KOKORO_DIR (default ~/kokoro).
   Everything else is synthesized here, timed from the same score the picture reads.
   The device: force fails against the thing, procedure wins. The force sequence is escalating blasts, then total silence
   and scrap-metal ticks. The office is rhythm (typewriter, rubber stamp, mailman footsteps, paper) that accelerates and
   thickens while the low hum of the thing falls in pitch and level as the thing shrinks. The end is the vending machine
   hum alone, and one drip."""
import hashlib, json, os, re, subprocess, wave
import numpy as np
from scipy.signal import butter, sosfilt, fftconvolve, resample_poly

HERE = os.path.dirname(os.path.abspath(__file__))
KDIR = os.environ.get('KOKORO_DIR', os.path.expanduser('~/kokoro'))
SR = 48000
rng = np.random.default_rng(23)
data = json.loads(subprocess.check_output(['node', '-e', "console.log(JSON.stringify(require('./script.js')))"], cwd=HERE))
SCRIPT, CAST, OFFICE = data['SCRIPT'], data['CAST'], data['OFFICE']

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
def mech_fx(a):
    """the scarechrome: a square-wave ring modulation and a coarse bit depth"""
    t = np.arange(len(a)) / SR; rm = a * np.sign(np.sin(2 * np.pi * 70 * t))
    b = np.round((0.45 * a + 0.75 * rm) * 22) / 22
    return filt(b, 'bandpass', [180, 5200]) * 1.1
def spook_fx(a):
    """the servospook: lower, hollow, with a slow tremolo and a ghost of an echo"""
    a = repitch(a, 0.84); t = np.arange(len(a)) / SR
    a = filt(a, 'lowpass', 3400) * (0.72 + 0.28 * np.sin(2 * np.pi * 5.5 * t))
    d = int(0.13 * SR); b = np.concatenate([a, np.zeros(d)]); b[d:] += a * 0.4; return b * 0.9
FX = {'mech': mech_fx, 'spook': spook_fx}

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
shots = []; t = 0.0
for s in SCRIPT:
    sh = dict(shot=s['shot'], t0=round(t, 3), lines=[], room=s.get('room'))
    cur = 0.0
    for ln in s.get('lines', []):
        c = CAST[ln['who']]; sp = c['speed'] * (0.9 if ln.get('line') else 1.0)
        if 'many' in c:
            a = many(ln['say'], c['many'], False, seed=len(shots) * 10 + len(sh['lines'])); d = len(a[0]) / SR; mono = (a[0] + a[1]) / 2
        else:
            a = speak(ln['say'], c['voice'], sp)
            if c.get('fx'): a = FX[c['fx']](a)
            d = len(a) / SR; mono = a
        st = ln['at'] if 'at' in ln else cur + ln.get('pre', 0.6)
        hop = SR // 24; envl = [float(np.sqrt(np.mean(mono[i:i + hop] ** 2))) for i in range(0, len(mono), hop)]
        emax = max(envl) or 1; envl = [round(min(1, (v / emax) ** 0.7), 2) for v in envl]
        sh['lines'].append(dict(who=ln['who'], say=ln['say'], t0=round(st, 3), t1=round(st + d, 3), line=bool(ln.get('line')), env=envl, _a=a))
        cur = st + d
    sh['d'] = round(s['d'] if 'd' in s else cur + s.get('tail', 1.5), 3)
    L_ = sh['lines']; dd = sh['d']
    sh['cues'] = [dict({k: v for k, v in c.items() if k not in ('at', 'to')}, at=round(resolve(c['at'], L_, dd), 3), **({'to': round(resolve(c['to'], L_, dd), 3)} if 'to' in c else {})) for c in s.get('cues', [])]
    sh['curve'] = {k: [[round(resolve(a, L_, dd), 3), p] for a, p in v] for k, v in s.get('curve', {}).items()}
    shots.append(sh); t += sh['d']
TOTAL = round(t, 3)
def dump():
    for sh in shots:
        for l in sh['lines']: l.pop('_a', None)
    json.dump(dict(shots=shots, dur=TOTAL, cast=CAST), open(os.path.join(HERE, 'timing', 'tp.json'), 'w'))
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
def typekey(g=1.0): return mx(noiseb(0.035, 1800, 7500, 0.007), thud(200, 0.04, 0.35)) * 0.55 * g
def mixa(a, b):
    o = np.zeros(max(len(a), len(b))); o[:len(a)] += a; o[:len(b)] += b
    return o
def bell(g=1.0):
    a = pluck(2637, 0.9, 0.5) * g * 0.6; b = pluck(3951, 0.5, 0.3) * g * 0.2
    o = np.zeros(max(len(a), len(b))); o[:len(a)] += a; o[:len(b)] += b
    return o
def carriage(g=1.0): return noiseb(0.22, 700, 3500, 0.07, 0.01) * 0.4 * g
def stampk(g=1.0): return mx(thud(85, 0.22, 0.9), noiseb(0.07, 400, 3000, 0.02) * 0.55) * g
def footstep(g=1.0): return mx(thud(125, 0.1, 0.28), noiseb(0.035, 1000, 4000, 0.01) * 0.16) * g
def rustle(d=0.3, g=1.0):
    t = tt(d); x = filt(filt(noise(len(t)), 'highpass', 2200), 'lowpass', 9000) * (rng.random(len(t)) > 0.55) * np.exp(-t / (d / 2.5)); return x * 0.22 * g
def scratch(d, g=1.0):
    t = tt(d); x = filt(filt(noise(len(t)), 'highpass', 2500), 'lowpass', 8000) * (0.5 + 0.5 * np.sin(2 * np.pi * 9 * t) ** 2) * np.minimum(1, t / 0.05) * np.minimum(1, (d - t) / 0.08).clip(0); return x * 0.2 * g
def drip(g=1.0):
    t = tt(0.5); f = 2300 * np.exp(-t / 0.018) + 620; x = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.07)
    return (x + 0.25 * np.sin(2 * np.pi * np.cumsum(f * 1.6) / SR) * np.exp(-t / 0.03)) * 0.45 * g
def vending(d, g=0.1):
    t = tt(d); x = 0.55 * np.sin(2 * np.pi * 60 * t) + 0.38 * np.sin(2 * np.pi * 120.4 * t) + 0.16 * np.sin(2 * np.pi * 180.7 * t) + 0.05 * np.sin(2 * np.pi * 240 * t)
    x += filt(noise(len(t)), 'bandpass', [220, 700]) * 0.08 * (1 + 0.3 * np.sin(2 * np.pi * 0.4 * t))
    return x * g * np.minimum(1, t / 0.8)
def blast(d, g=1.0, lo=2800):
    t = tt(d); n = noise(len(t)); x = np.zeros(len(t)); seg_n = 6
    for k in range(seg_n):
        cut = lo * (0.18 ** (k / (seg_n - 1))); w = np.exp(-((t - k * d / seg_n / 2) / (d / 3)) ** 2) if k else np.exp(-t / (d / 5))
        x += filt(n, 'lowpass', max(80, cut)) * np.exp(-t / (d / (2.2 + 0.4 * k)))
    sub = np.sin(2 * np.pi * np.cumsum(70 * np.exp(-t / (d / 3)) + 28) / SR) * np.exp(-t / (d / 2.4)) * 1.6
    k = int(0.004 * SR); x[:k] *= np.linspace(0, 1, k)
    return np.tanh((x * 0.5 + sub) * 1.2) * g
def thing_hum(sh):
    """the low hum of the thing: its pitch and level follow the size curve, so it falls as the thing shrinks"""
    cv = sh.get('curve', {}).get('size')
    if not cv: return None
    d = sh['d']; n = int((d + 1.0) * SR); t = np.arange(n) / SR
    s = np.interp(t, [p[0] for p in cv], [p[1] for p in cv])
    if s.max() <= 0.001: return None
    f = 34 + 46 * np.clip(s, 0, 1) ** 0.7
    ph = 2 * np.pi * np.cumsum(f) / SR; ph2 = 2 * np.pi * np.cumsum(f * 1.0107) / SR
    x = np.sin(ph) + 0.8 * np.sin(ph2) + 0.45 * np.sin(2 * ph + 0.7) + 0.2 * np.sin(3 * ph2)
    x += filt(brown(n), 'lowpass', 140) * 0.9
    amp = 0.2 * np.clip(s, 0, 1) ** 0.9 * (0.88 + 0.12 * np.sin(2 * np.pi * 2.6 * t))
    amp *= np.where(s < 0.012, 0, 1) * np.minimum(1, np.maximum(0, s - 0.0) / 0.03)
    return x * amp

def eadd(El, Er, t, sig, g=1.0, pan=0.0):
    i = int(t * SR)
    if i < 0: sig = sig[-i:]; i = 0
    n = min(len(sig), len(El) - i)
    if n <= 0: return
    El[i:i + n] += sig[:n] * g * np.sqrt((1 - pan) / 2) * 1.414; Er[i:i + n] += sig[:n] * g * np.sqrt((1 + pan) / 2) * 1.414

ROOM = {'open': (1.8, 0.12), 'hall': (1.4, 0.22), 'office': (0.45, 0.07), None: (1.2, 0.18)}
PAN = {'T': -0.2, 'S': 0.15, 'M': 0.3, 'B': 0.2, 'G': 0.0}
def ticks(E, a, b, rate0, rate1, mk, g=1.0, pan_alt=0.4, jitter=0.0):
    """events from a to b whose rate goes from rate0 to rate1 per second"""
    t = a; j = 0
    while t < b:
        u = (t - a) / max(0.01, b - a); E(t, mk(), g, pan_alt * (1 if j % 2 else -1)); r = rate0 + (rate1 - rate0) * u
        t += 1.0 / r * (1 + jitter * rng.uniform(-1, 1)); j += 1

def design(sh):
    d = sh['d']; name = sh['shot']; rt, wet = ROOM.get(sh['room'], ROOM[None])
    n = int((d + 1.0) * SR); El = np.zeros(n); Er = np.zeros(n)
    E = lambda t, sig, g=1.0, pan=0.0: eadd(El, Er, t, sig, g, pan)
    cues = sh['cues']; C = lambda k: [c for c in cues if c['k'] == k]; one = lambda k: C(k)[0]
    to = lambda c, dflt: c.get('to', c['at'] + dflt)
    hum = thing_hum(sh)
    if hum is not None and name == 'force':
        b2_ = one('blast2')['at']; q1_ = one('quiet')['to']; tm_ = np.arange(len(hum)) / SR
        hum = hum * np.where(tm_ < b2_ - 0.05, 1.0, np.where(tm_ < q1_, 0.0, np.minimum(1, (tm_ - q1_) / 3.0)))
    if hum is not None: E(0, hum, 1.0)
    VEND = {'trurl': 0.02, 'notice': 0.025, 'office': 0.0, 'clear': 0.0}
    if name == 'machine':
        c = one('comet'); calm = one('calm')['at']; sw = one('switch')['at']
        ticks(E, 0.5, c['at'] + 2, 2.2, 2.2, lambda: gear_tick(0.3), 0.5, 0.5, 0.3)
        E(0, padchord([98, 147, 196, 247], c['at'] + 3, 0.07, 1.5, 1.5)); E(0, wind(sw, 0.03))
        for j in range(5): E(1.8 + j * 3.1, pluck(262 * 2 ** ([0, 4, 7, 9, 12][j] / 12), 0.8, 0.5), 0.12, rng.uniform(-0.6, 0.6))
        E(c['at'], rise(sw - c['at'], 120, 3200, 0.55)); E(c['at'], rumble(sw - c['at'], 0.4) * np.linspace(0.2, 1, int((sw - c['at']) * SR)))
        for x_ in np.arange(c['at'] + 2.0, sw, 0.07): E(x_, noiseb(0.015, 2500, 9000, 0.004) * (rng.random() > 0.4), 0.2 + 0.3 * (x_ - c['at']) / (sw - c['at']), rng.uniform(-0.8, 0.8))
        m = one('moon'); E(m['at'], noiseb(1.8, 1500, 7000, 0.6) * 0.15)
        f = one('fields'); dd = sw - f['at']
        E(f['at'], np.sin(2 * np.pi * np.cumsum(np.linspace(180, 540, int(dd * SR))) / SR) * np.linspace(0, 0.09, int(dd * SR)))
        E(sw, blast(2.8, 0.9, 2400)); E(sw, thud(48, 0.9, 1.0)); E(sw + 0.1, noiseb(0.4, 3000, 9000, 0.12), 0.5)
        a = one('ash'); E(a['at'] + 0.5, noiseb(to(a, 5) - a['at'], 3000, 9000, 2.0) * 0.03)
        E(calm, padchord([131, 196, 262, 330], d - calm + 0.5, 0.1, 1.2, 1.5))
        ticks(E, calm + 1.0, d, 2.0, 2.0, lambda: gear_tick(0.3), 0.5, 0.5, 0.3)
    if name == 'arrival':
        ticks(E, 0.0, d, 1.4, 1.4, lambda: gear_tick(0.22), 0.5, 0.4, 0.3)
        E(0, wind(d + 0.5, 0.03)); E(0, padchord([110, 165, 208], d, 0.05, 1.0, 1.0))
        c = one('land'); E(c['at'] - 0.9, swell(1.0, 100, 1400, 0.4)); E(c['at'], thud(42, 1.2, 1.1)); E(c['at'], noiseb(0.9, 100, 2500, 0.3), 0.7); E(c['at'] + 0.15, thud(55, 0.8, 0.7))
        E(c['at'] + 0.4, rumble(2.2, 0.5) * np.linspace(1, 0, int(2.2 * SR)))
        for j in range(8): E(c['at'] + 0.5 + j * 0.13 + rng.uniform(0, 0.1), metal(rng.uniform(600, 1800), 0.2), 0.15, rng.uniform(-0.8, 0.8))
        g = one('scare_go'); ticks(E, g['at'], to(g, 2), 3.6, 3.6, lambda: footstep(0.5), 1.0, 0.3, 0.1)
        h = one('hiss'); dd = to(h, 4) - h['at']
        E(h['at'], swell(dd, 3000, 9000, 0.35) * (0.6 + 0.4 * (rng.random(int(dd * SR)) > 0.5)))
        for j in range(6): E(h['at'] + 0.4 + j * 0.65, noiseb(0.08, 2000, 8000, 0.03) * 0.8, 0.5, rng.uniform(-0.4, 0.4))
        s2 = one('second'); E(s2['at'], np.sin(2 * np.pi * np.cumsum(np.linspace(900, 380, int(1.0 * SR))) / SR) * np.linspace(0.16, 0, int(1.0 * SR)))
        b = one('scare_back'); ticks(E, b['at'], to(b, 2), 1.6, 1.6, lambda: footstep(0.4), 1.0, 0.3, 0.15)
    if name == 'force':
        gate = to(one('quiet'), 5)                         # the bed and the hum stop at the second blast and return after the silence
        b1 = one('blast1')['at']; b2 = one('blast2')['at']; q0 = one('quiet')['at']; q1 = one('quiet')['to']
        ticks(E, 0.0, b2, 1.4, 1.4, lambda: gear_tick(0.22), 0.5, 0.4, 0.3)
        c = one('hy_in'); E(c['at'], rumble(to(c, 4) - c['at'] + 1, 0.5) * np.sin(np.linspace(0, np.pi, int((to(c, 4) - c['at'] + 1) * SR)))); E(c['at'] + 0.5, swell(3.0, 200, 2500, 0.28))
        for x_, k in ((0, 4), (1, 3), (2, 2), (3, 1)):
            tk = [c2 for c2 in C('tick') if c2['n'] == k][0]; E(tk['at'], pluck(700 - x_ * 70, 0.4, 1.2), 0.5); E(tk['at'], metal(1100, 0.12), 0.35)
        E(b1 - 0.1, np.sin(2 * np.pi * np.cumsum(np.linspace(120, 60, int(0.6 * SR))) / SR) * np.linspace(0.0, 0.3, int(0.6 * SR)))
        E(b1, blast(3.6, 1.0, 2600)); E(b1, thud(45, 1.2, 1.1)); E(b1 + 0.05, noiseb(0.35, 2000, 8000, 0.1), 0.7)
        E(b1 + 2.2, rumble(2.6, 0.45) * np.linspace(1, 0, int(2.6 * SR)))
        for j in range(12): E(b1 + 3.2 + j * 0.22 + rng.uniform(0, 0.1), mixa(noiseb(0.12, 300, 2200, 0.05) * 0.5, metal(rng.uniform(500, 1400), 0.15) * 0.3), 0.4, rng.uniform(-0.6, 0.6))
        cn = one('council'); bd = one('build')
        ticks(E, bd['at'], bd['to'], 4, 12, lambda: gear_tick(0.5), 0.8, 0.6, 0.0)
        s = one('stars'); E(s['at'], swell(2.0, 60, 900, 0.3))
        mi = one('mega_in'); E(mi['at'], rumble(to(mi, 8) - mi['at'], 0.6) * np.minimum(1, tt(to(mi, 8) - mi['at']) / 3))
        ch = one('charge'); dd = to(ch, 3) - ch['at']
        E(ch['at'], np.sin(2 * np.pi * np.cumsum(np.linspace(35, 260, int(dd * SR))) / SR) * (np.linspace(0, 1, int(dd * SR)) ** 2) * 0.28 + rise(dd, 80, 2500, 0.5))
        E(b2, blast(5.0, 1.0, 3200)); E(b2, thud(32, 2.2, 1.4)); E(b2 + 0.1, thud(40, 1.6, 1.2)); E(b2, noiseb(0.7, 1000, 9000, 0.3), 0.9)
        E(b2 + 0.4, rumble(4.0, 0.9) * np.linspace(1, 0.0, int(4.0 * SR)))
        # total silence from here: only scrap
        t_ = q0 + 0.9; j = 0; scrap = []
        while t_ < q1 - 0.5:
            scrap.append((t_, metal(rng.uniform(1100, 5200), rng.uniform(0.2, 0.5), rng.uniform(0.3, 0.8)), 0.7, rng.uniform(-0.8, 0.8))); t_ += rng.uniform(0.35, 1.1) + 0.12 * j; j += 1
        sh['_gate'] = (q0, q1, scrap)
    if name == 'ivy':
        ticks(E, 0.0, d, 1.3, 1.3, lambda: gear_tick(0.2), 0.5, 0.4, 0.3)
        E(0, wind(d + 0.5, 0.03)); E(0, padchord([98, 147, 185], d, 0.05, 1.0, 1.0))
        c = one('ivy'); dd = to(c, 9) - c['at']
        for x_ in np.arange(c['at'], c['at'] + dd, 0.16): E(x_, noiseb(0.06, 400, 2600, 0.025) * rng.uniform(0.3, 1.0), 0.3, rng.uniform(-0.7, 0.7))
        for x_ in np.arange(c['at'] + 1, c['at'] + dd, 1.1): E(x_, pluck(rng.uniform(150, 260), 0.4, 0.3), 0.15, rng.uniform(-0.6, 0.6))
        w = one('wrap'); E(w['at'], swell(1.8, 100, 900, 0.3)); E(w['at'], thud(60, 0.5, 0.4))
        wl = one('wilt'); dd = to(wl, 2) - wl['at']
        for x_ in np.arange(wl['at'], wl['at'] + dd, 0.07): E(x_, rustle(0.15, rng.uniform(0.3, 1.0)), 0.5, rng.uniform(-0.8, 0.8))
        tl = one('tools'); ticks(E, tl['at'], to(tl, 4), 2.5, 7, lambda: [rustle(0.25), metal(rng.uniform(600, 1600), 0.12, 0.6), noiseb(0.12, 300, 1800, 0.05) * 0.5][int(rng.integers(0, 3))], 0.7, 0.6, 0.3)
        E(one('slump')['at'], padchord([82, 98, 123], 4.0, 0.1, 1.0, 2.0))
    if name == 'trurl':
        ticks(E, 0.0, d, 1.3, 1.3, lambda: gear_tick(0.2), 0.5, 0.4, 0.3)
        E(0, wind(d + 0.5, 0.03)); E(0, vending(d + 0.5, VEND['trurl']))
        r = one('ride'); dd = to(r, 9) - r['at']
        E(r['at'], swell(dd * 0.8, 150, 3500, 0.4)); E(r['at'] + 0.5, np.sin(2 * np.pi * np.cumsum(np.linspace(300, 90, int(dd * 0.7 * SR))) / SR) * 0.07 * np.linspace(1, 0, int(dd * 0.7 * SR)))
        for j in range(4): E(r['at'] + dd * 0.55 + j * 0.2, thud(150 - j * 8, 0.1, 0.3))
        E(r['at'] + dd * 0.55 + 1.0, pluck(2093, 0.6, 0.4), 0.2)
        E(to(r, 0) - 0.6, thud(70, 0.4, 0.5)); E(to(r, 0) - 0.5, noiseb(0.4, 200, 3000, 0.12), 0.5)
        for c in C('list'): E(c['at'], pluck(523 * 2 ** ([0, 2, 4, 7, 9, 12, 14][c['n']] / 12), 0.5, 0.6), 0.5, -0.3 + c['n'] * 0.1)
        ru = one('run'); ticks(E, ru['at'], ru['at'] + 3.2, 7, 7, lambda: footstep(0.3), 1.0, 0.5, 0.3)
        for j in range(18): E(ru['at'] + j * 0.14, footstep(0.3) * 0.7, 1.0, np.sin(j) * 0.8)
    if name == 'notice':
        E(0, wind(d + 0.5, 0.025)); E(0, vending(d + 0.5, VEND['notice']))
        c = one('dict'); E(c['at'], scratch(to(c, 8) - c['at'], 1.0), 1.0, -0.3)
        for x_ in np.arange(c['at'] + 0.4, to(c, 8), 0.5): E(x_, typekey(0.3), 1.0, -0.2)
        E(one('seal')['at'], mx(noiseb(0.3, 200, 1500, 0.1) * 0.6, thud(80, 0.2, 0.7)))
        E(one('stamp')['at'], stampk(0.9)); E(one('ledger')['at'], rustle(0.5, 1.2)); E(one('register')['at'], mixa(rustle(0.5, 1.2), noiseb(0.2, 500, 2000, 0.08) * 0.3))
        E(one('call')['at'], bell(0.8))
        mo = one('mail_out'); ticks(E, mo['at'], to(mo, 3), 3.4, 3.4, lambda: footstep(0.8), 1.0, 0.5, 0.05)
        for j in range(int((to(mo, 3) - mo['at']) * 3.4)): pass
        E(one('deliver')['at'], thud(90, 0.12, 0.6)); E(one('deliver')['at'] + 0.12, thud(100, 0.12, 0.5)); E(one('deliver')['at'] + 0.5, rustle(0.4, 1.0))
        sg = one('sign'); E(sg['at'], scratch(0.45, 1.5), 1.0, 0.3); E(sg['at'] + 0.55, thud(48, 0.6, 0.55))
        mb = one('mail_back'); ticks(E, mb['at'], to(mb, 3), 3.8, 3.8, lambda: footstep(0.8), 1.0, 0.5, 0.05)
        wr = one('wrong'); E(wr['at'], scratch(to(wr, 3) - wr['at'], 1.3), 1.0, -0.2)
        E(one('return')['at'] + 0.2, rustle(0.4, 1.2)); E(one('return')['at'] + 0.9, stampk(0.6))
        E(one('receipt')['at'] + 0.05, pluck(110, 3.0, 0.2), 0.1)
    if name == 'office':
        E(0, wind(d + 0.5, 0.02))
        a, b = 1.0, 54.0
        def u_(x_): return min(1, max(0, (x_ - a) / (b - a)))
        # typewriter: bursts of keys, faster and denser, with a bell and a carriage return at the end of each burst
        t_ = a; burst = 0
        while t_ < b + 3:
            u = u_(t_); rate = 5 + 15 * u; nk = int(6 + 18 * u)
            for k in range(nk):
                E(t_, typekey(0.55 + 0.4 * u), 1.0, -0.35 + 0.05 * (k % 3)); t_ += 1.0 / rate * rng.uniform(0.7, 1.3)
            E(t_, bell(0.4), 0.5, -0.35); E(t_ + 0.1, carriage(0.8), 0.7, -0.3); t_ += 0.35 - 0.2 * u
        # rubber stamp thunks
        t_ = a + 1.0; j = 0
        while t_ < b + 2:
            u = u_(t_); E(t_, stampk(0.55 + 0.4 * u), 1.0, 0.1 + 0.3 * np.sin(j)); t_ += (1.7 - 1.4 * u) * rng.uniform(0.8, 1.2); j += 1
        # the mailman: footsteps that go from a walk to a sprint
        t_ = a; j = 0
        while t_ < b + 2:
            u = u_(t_); E(t_, footstep(0.6 + 0.5 * u), 1.0, (-1 if j % 2 else 1) * (0.2 + 0.5 * abs(np.sin(t_ * (0.6 + 2.5 * u))))); t_ += 0.52 - 0.38 * u; j += 1
        # paper
        t_ = a;
        while t_ < b + 2:
            u = u_(t_); E(t_, rustle(0.3, 0.6 + 0.8 * u), 1.0, rng.uniform(-0.8, 0.8)); t_ += (1.4 - 1.25 * u) * rng.uniform(0.6, 1.4)
        # what each new thing sounds like when it lands
        for c in C('item'):
            kd = c['kind']; at = c['at']
            if kd in ('desk', 'cabinet', 'window', 'chair'): E(at, thud(70, 0.3, 0.7)); E(at, noiseb(0.12, 300, 2500, 0.04) * 0.4, 1.0)
            elif kd == 'stamp': E(at, stampk(0.8))
            elif kd in ('paper', 'notes'): E(at, rustle(0.4, 1.4))
            elif kd == 'pigeon': E(at, mx(*[np.concatenate([np.zeros(int(q * 0.045 * SR)), thud(300 + 30 * q, 0.04, 0.4)]) for q in range(6)]))
            elif kd == 'clips': E(at, metal(3800, 0.1, 0.9)); E(at + 0.06, metal(4200, 0.1, 0.9))
            elif kd == 'bands': E(at, pluck(520, 0.3, 1.0), 0.5)
            elif kd == 'sign': E(at, thud(160, 0.05, 0.5)); E(at, noiseb(0.04, 1500, 6000, 0.01), 0.4)
            elif kd == 'stain': E(at, drip(0.5), 0.5)
            elif kd in ('web', 'plant', 'umbrella'): E(at, swell(0.7, 800, 3500, 0.12))
            elif kd == 'spoon': E(at, metal(3300, 0.5, 1.0)); E(at + 0.05, metal(4400, 0.4, 0.6))
            elif kd == 'clock': E(at, thud(200, 0.04, 0.5)); E(at + 0.15, metal(2200, 0.3, 0.5))
            elif kd == 'ink': E(at, thud(100, 0.08, 0.4))
            else: E(at, thud(90, 0.2, 0.4))
        # the room thickens: a low tone that grows as the office fills
        tm = tt(b + 4); E(0, filt(noise(len(tm)), 'bandpass', [180, 520]) * 0.02 * np.minimum(1, tm / (b)) ** 1.5)
        # last typed order, slow and heavy
        l5 = sh['lines'][5]['t0']
        for k in range(14): E(l5 + k * 0.17, typekey(0.8), 1.0, -0.3)
        E(l5 + 2.6, bell(0.6)); E(l5 + 2.7, stampk(1.1))
    if name == 'clear':
        hu = one('hurl'); dd = to(hu, 5) - hu['at']
        for j, x_ in enumerate(np.linspace(hu['at'], hu['at'] + dd, 22)): E(x_, rise(0.5, 400, 4000, 0.3) * np.linspace(1, 0, int(0.5 * SR)) ** 0.3 if j % 2 else swell(0.5, 300, 3000, 0.3), 0.8, np.sin(j * 1.7) * 0.9); E(x_ + 0.04, thud(110, 0.06, 0.3), 0.4, np.sin(j * 1.7) * 0.9)
        for j in range(6): E(hu['at'] + 0.3 + j * 0.9, metal(rng.uniform(900, 3000), 0.3, 0.6), 0.5, rng.uniform(-0.8, 0.8))
        E(0, vending(d + 0.5, 0.07 * min(1, 1)))
        po = one('pour'); dd = to(po, 3) - po['at']
        t_ = tt(dd); E(po['at'], (filt(noise(len(t_)), 'bandpass', [700, 2800]) * (0.5 + 0.5 * np.abs(np.sin(2 * np.pi * 9 * t_ * (1 + t_ / dd)))) * np.minimum(1, t_ / 0.1) * np.minimum(1, (dd - t_) / 0.2).clip(0)) * 0.22, 1.0, 0.1)
        E(one('drip')['at'], drip(1.0), 1.0, 0.0)
        fl = one('fly'); E(fl['at'], swell(to(fl, 3) - fl['at'], 150, 2500, 0.3)); E(fl['at'] + 0.2, np.sin(2 * np.pi * np.cumsum(np.linspace(80, 400, int((to(fl, 3) - fl['at']) * SR))) / SR) * np.linspace(0.12, 0, int((to(fl, 3) - fl['at']) * SR)))
    return El, Er, rt, wet

def title_end_design(sh):
    d = sh['d']; n = int((d + 1.0) * SR); El = np.zeros(n); Er = np.zeros(n)
    E = lambda t, sig, g=1.0, pan=0.0: eadd(El, Er, t, sig, g, pan)
    if sh['shot'] == 'title':
        for k in range(12): E(0.5 + k * 0.1, typekey(0.8), 1.0, -0.3)
        E(1.9, bell(0.6)); E(1.9, carriage(0.6)); E(2.5, stampk(1.0), 1.0, 0.2); E(3.2, stampk(1.0), 1.0, 0.0); E(3.7, stampk(1.0), 1.0, -0.2)
        E(0, vending(d + 0.5, 0.025))
    else:
        vv = vending(d + 0.5, 0.07); env_ = np.ones(len(vv)); k_ = int(5.5 * SR); env_[k_:] = np.linspace(1, 0, len(vv) - k_); E(0, vv * env_)
    return El, Er, 1.0, 0.1

for sh in shots:
    t0 = sh['t0']
    if sh['shot'] in ('title', 'end'): El, Er, rt, wet = title_end_design(sh)
    else:
        El, Er, rt, wet = design(sh)
        g = sh.pop('_gate', None)
    putvs(t0, (El, Er), rt, wet, 1.0)
    if sh['shot'] == 'force' and g:   # total silence: zero everything (tails included) in the quiet window; only scrap ticks live there
        q0, q1, scrap = g; i0, i1 = int((t0 + q0) * SR), int((t0 + q1) * SR); f0 = int(0.3 * SR)
        for arr in (L, Rr):
            arr[i0 - f0:i0] *= np.linspace(1, 0, f0); arr[i0:i1] = 0
        for (ts, sig, gn, pn) in scrap: putv(t0 + ts, sig, 1.6, 0.25, gn, pn)
    rt, wet = ROOM.get(sh['room'], ROOM[None])
    for ln in sh['lines']:
        a = ln['_a']; gg = 1.0 * (1.12 if ln['line'] else 1.0); w = wet * (1.4 if ln['line'] else 1.0)
        if isinstance(a, tuple): putvs(t0 + ln['t0'], a, rt, w, gg * 0.9)
        else: putv(t0 + ln['t0'], a, rt, w, gg, PAN.get(ln['who'], 0.0))

end_i = int((TOTAL + 0.6) * SR)
mixL, mixR = L[:end_i], Rr[:end_i]
fade = int(0.8 * SR); mixL[-fade:] *= np.linspace(1, 0, fade); mixR[-fade:] *= np.linspace(1, 0, fade)
pk = max(np.abs(mixL).max(), np.abs(mixR).max()); sc = 0.8 / pk
st = np.stack([mixL * sc, mixR * sc], 1)
os.makedirs(os.path.join(HERE, 'audio'), exist_ok=True)
wp = os.path.join(HERE, 'audio', 'tp_raw.wav')
with wave.open(wp, 'wb') as wf:
    wf.setnchannels(2); wf.setsampwidth(2); wf.setframerate(SR); wf.writeframes((np.clip(st, -1, 1) * 32767).astype('<i2').tobytes())
subprocess.check_call(['ffmpeg', '-y', '-loglevel', 'error', '-i', wp, '-af', 'loudnorm=I=-16:TP=-1.5:LRA=11', '-c:a', 'aac', '-b:a', '128k', '-ar', '48000', os.path.join(HERE, 'audio', 'tp.m4a')])
os.remove(wp)
dump()
print('done', TOTAL)
