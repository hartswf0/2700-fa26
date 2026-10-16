"""Voices, sound and music for The Architect Who Never Built Anything (film three of THE HOUSE THAT LANGUAGE BUILT, four
   fables of Edifiction; an original fable from Watson Hartsoe's notes, written in the manner of Stanislaw Lem).
   python3 build_sound.py  ->  timing/an.json and audio/an.m4a      (TIMING_ONLY=1 writes the timing file only)
   Voices: Kokoro (kokoro-onnx), model files in $KOKORO_DIR (default ~/kokoro). The narrator of the series is bm_lewis; the
   Edifier is af_nicole through a light synthetic filter (the same voice in all four films). The manufactured builders all
   share one voice, pitched a little apart; when they read their placard together it is that voice three times over.
   Everything else is synthesized here, timed from the same score the picture reads.
   The series sounds: typewriter keys for description, a dry wooden knock when a description becomes a wall, a low hum for
   the Edifier, footsteps, a door latch. This film adds the shrinking rooms (each annex has a shorter reverberation than the
   last), heat and a fly in the shut hall, rain on the strike, and at the end a trowel and real bricks, one knock each."""
import hashlib, json, os, re, subprocess, wave
import numpy as np
from scipy.signal import butter, sosfilt, fftconvolve, resample_poly

HERE = os.path.dirname(os.path.abspath(__file__))
KDIR = os.environ.get('KOKORO_DIR', os.path.expanduser('~/kokoro'))
SR = 48000
rng = np.random.default_rng(1985)
data = json.loads(subprocess.check_output(['node', '-e', "console.log(JSON.stringify(require('./script.js')))"], cwd=HERE))
SCRIPT, CAST, SENT = data['SCRIPT'], data['CAST'], data['SENT']

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
def edifier_fx(a):
    """the Edifier: calm and small, a shade too even; a faint second voice a hair above it and a trace of ring modulation"""
    a = repitch(a, 1.025); t = np.arange(len(a)) / SR
    d = int(0.011 * SR); b = repitch(a, 1.004); o = np.zeros(len(a) + d + 8); o[:len(a)] += a; o[d:d + len(b)] += 0.28 * b[: len(o) - d]
    t = np.arange(len(o)) / SR; rm = o * np.sin(2 * np.pi * 118 * t)
    return filt(0.9 * o + 0.12 * rm, 'bandpass', [240, 6400]) * 1.1
def hall_fx(a):
    """the Dean: a little lower and drier, as if from a lectern"""
    return filt(repitch(a, 0.985), 'lowpass', 5200) * 1.05
def made_fx(a):
    """a manufactured builder: plain, a little narrow"""
    return filt(a, 'bandpass', [170, 6800]) * 1.05
def trail_fx(a):
    """trailing off: the last stretch fades"""
    n = len(a); k = int(min(0.9 * SR, n * 0.35)); a = a.copy(); a[n - k:] *= np.linspace(1, 0.15, k) ** 1.5; return a
FX = {'edifier': edifier_fx, 'hall': hall_fx, 'made': made_fx, 'made2': made_fx, 'trail': trail_fx}

def many(text, voices, seed=0):
    """several voices say the same words, close but not together"""
    r = np.random.default_rng(100 + seed)
    phrases = [p for p in re.split(r'(?<=[.!?])\s+', text.strip()) if p]
    K, V = len(phrases), len(voices)
    base = [r.uniform(0, 1, V) for _ in range(K)]; det = [r.uniform(-1, 1, V) for _ in range(K)]
    pan = np.linspace(-0.6, 0.6, V); r.shuffle(pan)
    clips = [[speak(ph, v, 0.9) for ph in phrases] for v in voices]
    starts, t = [], 0.0
    for k in range(K):
        o = base[k] * 0.07; d = 1 + det[k] * 0.03
        longest = max(len(clips[v][k]) / SR / d[v] + o[v] for v in range(V))
        starts.append(t)
        for v in range(V): clips[v][k] = (repitch(clips[v][k], d[v]), o[v])
        t += longest + 0.35
    n = int((t + 0.5) * SR); Lc = np.zeros(n); Rc = np.zeros(n)
    for k in range(K):
        for v in range(V):
            a, o = clips[v][k]; i = int((starts[k] + o) * SR)
            gl, gr = np.sqrt((1 - pan[v]) / 2) * 1.414, np.sqrt((1 + pan[v]) / 2) * 1.414
            m = min(len(a), n - i); Lc[i:i + m] += a[:m] * gl / np.sqrt(V) * 1.5; Rc[i:i + m] += a[:m] * gr / np.sqrt(V) * 1.5
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
PANW = {'N': 0.0, 'K': -0.08, 'E': 0.12, 'D': 0.1, 'B': 0.0, 'C': 0.0, 'S': 0.2}
shots = []; t = 0.0
for s in SCRIPT:
    sh = dict(shot=s['shot'], t0=round(t, 3), lines=[], room=s.get('room'))
    cur = 0.0
    for ln in s.get('lines', []):
        c = CAST[ln['who']]; sp = c.get('speed', 1.0) * (0.9 if ln.get('line') else 1.0)
        if 'many' in c:
            a = many(ln['say'], c['many'], seed=len(shots) * 10 + len(sh['lines']))
            if c.get('fx'): a = (FX[c['fx']](a[0]), FX[c['fx']](a[1]))
            d = len(a[0]) / SR; mono = (a[0] + a[1]) / 2
        else:
            a = speak(ln['say'], c['voice'], sp)
            for fx in [c.get('fx'), ln.get('fx')]:
                if fx: a = FX[fx](a)
            if ln.get('p'): a = repitch(a, ln['p'])
            d = len(a) / SR; mono = a
        st = cur + ln.get('pre', 0.6)
        if 'from' in ln: st = max(cur + 0.4, resolve(ln['from'], sh['lines'], 0))
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
    json.dump(dict(shots=shots, dur=TOTAL, cast=CAST, sent=SENT), open(os.path.join(HERE, 'timing', 'an.json'), 'w'))
if os.environ.get('TIMING_ONLY'):
    for sh in shots:
        print(f"{sh['shot']:9s} t0={sh['t0']:7.2f} d={sh['d']:6.2f}", ' '.join(f"L{i}:{l['t0']:.1f}-{l['t1']:.1f}" for i, l in enumerate(sh['lines'])) if os.environ.get('V') else '')
    print('total', TOTAL, f'{int(TOTAL // 60)}:{TOTAL % 60:04.1f}')
    dump(); raise SystemExit

# ---------------- the sounds ----------------
def thud(f=60, d=0.35, g=1.0):
    t = tt(d); ph = 2 * np.pi * np.cumsum(f * (1 + 0.9 * np.exp(-t / 0.03))) / SR
    return (np.sin(ph) * np.exp(-t / (d / 4)) + 0.25 * filt(noise(len(t)), 'lowpass', 400) * np.exp(-t / 0.05)) * g
def noiseb(d, lo, hi, tau, atk=0.005):
    t = tt(d); x = filt(filt(noise(len(t)), 'highpass', lo), 'lowpass', hi) * np.exp(-t / tau)
    k = max(1, int(atk * SR)); x[:k] *= np.linspace(0, 1, k); return x
def swell(d, lo, hi, g=0.5):
    t = tt(d); x = filt(filt(noise(len(t)), 'highpass', lo), 'lowpass', hi) * np.sin(np.pi * t / d) ** 2; return x * g
def padchord(freqs, d, amp=0.1, fi=1.0, fo=1.0):
    t = tt(d); x = np.zeros(len(t))
    for i, f in enumerate(freqs):
        for dt in (-0.4, 0.4): x += np.sin(2 * np.pi * (f + dt * (1 + i * 0.3)) * t + i) * (0.6 + 0.4 * np.sin(2 * np.pi * 0.07 * (i + 1) * t))
    e = np.minimum(1, t / fi) * np.minimum(1, (d - t) / fo).clip(0)
    return x / len(freqs) * amp * e
def rumble(d, g=0.4):
    t = tt(d); return filt(brown(len(t)), 'lowpass', 160) * g * (0.8 + 0.2 * np.sin(2 * np.pi * 0.4 * t))
def metal(f=None, d=0.35, g=1.0):
    f = f or rng.uniform(1500, 5200); t = tt(d)
    x = (np.sin(2 * np.pi * f * t) + 0.6 * np.sin(2 * np.pi * f * 2.76 * t) + 0.35 * np.sin(2 * np.pi * f * 5.4 * t)) * np.exp(-t / (d / 6))
    k = int(0.002 * SR); x[:k] += noise(k) * 0.5; return x * 0.35 * g
def footstep(g=1.0): return mx(thud(125, 0.1, 0.28), noiseb(0.035, 1000, 4000, 0.01) * 0.16) * g
def stonestep(g=1.0): return mx(thud(150, 0.08, 0.22), noiseb(0.03, 1500, 6000, 0.008) * 0.2) * g
def rustle(d=0.3, g=1.0):
    t = tt(d); x = filt(filt(noise(len(t)), 'highpass', 2200), 'lowpass', 9000) * (rng.random(len(t)) > 0.55) * np.exp(-t / (d / 2.5)); return x * 0.22 * g
def wood(g=1.0): return mx(thud(170, 0.12, 0.6), noiseb(0.05, 700, 3000, 0.012) * 0.4) * g
def chirp(g=1.0):
    d = 0.14 + 0.06 * rng.random(); t = tt(d); f0 = rng.uniform(2200, 3200); f = f0 + 1400 * np.sin(np.pi * t / d) + 600 * np.sin(2 * np.pi * 22 * t)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * t / d) ** 0.7 * 0.18 * g
def cricket(g=1.0):
    t = tt(0.22); x = np.sin(2 * np.pi * 4300 * t) * (np.sin(2 * np.pi * 30 * t) > 0.2) * np.sin(np.pi * t / 0.22); return x * 0.05 * g
def creak(d, f0=300, g=1.0):
    t = tt(d); f = f0 * (1 + 0.5 * np.sin(2 * np.pi * 3.5 * t) * 0.3 + 0.35 * t / d); x = np.sign(np.sin(2 * np.pi * np.cumsum(f) / SR)) * 0.5 + np.sin(2 * np.pi * np.cumsum(f * 1.5) / SR) * 0.2
    return filt(x, 'bandpass', [f0 * 0.9, f0 * 6]) * np.sin(np.pi * t / d) ** 0.7 * 0.22 * g
def bell(f=1320, g=1.0):
    t = tt(1.4); x = sum(a_ * np.sin(2 * np.pi * f * r_ * t) * np.exp(-t / (1.1 / (1 + r_ * 0.4))) for a_, r_ in [(1, 1), (0.5, 2.0), (0.4, 2.76), (0.25, 5.4)]); k = int(0.003 * SR); x[:k] += noise(k) * 0.4
    return x * 0.22 * g
def gear_tick(g=1.0): return mx(noiseb(0.03, 1200, 6000, 0.008), 0.5 * metal(rng.uniform(900, 1500), 0.08)) * 0.5 * g
def ratchet(d, g=1.0, rate=18):
    o = np.zeros(int(d * SR)); tm = 0.0
    while tm < d - 0.05: b = gear_tick(0.6); i = int(tm * SR); o[i:i + len(b)] += b[: len(o) - i]; tm += 1 / rate
    return o * g
def murmur(d, g=1.0):
    t = tt(d); n = filt(noise(len(t)), 'bandpass', [260, 2600]); am = np.abs(np.sin(2 * np.pi * (3.1 * t + 0.8 * np.sin(2 * np.pi * 0.3 * t)))) ** 1.5 + 0.5 * np.abs(np.sin(2 * np.pi * 4.7 * t + 1.3)) ** 2
    return n * am * 0.35 * g * np.minimum(1, t / 0.3) * np.minimum(1, (d - t) / 0.3).clip(0)

def eadd(El, Er, t, sig, g=1.0, pan=0.0):
    i = int(t * SR)
    if i < 0: sig = sig[-i:]; i = 0
    n = min(len(sig), len(El) - i)
    if n <= 0: return
    El[i:i + n] += sig[:n] * g * np.sqrt((1 - pan) / 2) * 1.414; Er[i:i + n] += sig[:n] * g * np.sqrt((1 + pan) / 2) * 1.414
def steps(E, a, b, period, p0, p1, mk, g=1.0, jit=0.05):
    t = a
    while t < b:
        u = (t - a) / max(0.01, b - a); E(t, mk(g * (0.8 + 0.4 * rng.random())), 1.0, p0 + (p1 - p0) * u); t += period * (1 + jit * rng.uniform(-1, 1))

# ---------------- the series sounds ----------------
def roomtone(d, g=1.0): return filt(brown(int(d * SR)), 'lowpass', 220) * 0.04 * g
def typekey(g=1.0):
    return mx(noiseb(0.025, 1400, 7000, 0.005) * 0.7, thud(220, 0.05, 0.25), metal(rng.uniform(2300, 3600), 0.04, 0.25)) * g
def typebell(g=1.0): return mx(bell(2640, 0.35), ratchet(0.35, 0.6, 30)) * g
def typing(E, a, b, rate, jitter, g=1.0, bell_end=True):
    t = a
    while t < b - 0.05:
        E(t, typekey(g * (0.75 + 0.4 * rng.random())), 1.0, rng.uniform(-0.2, 0.2))
        t += (1.0 / rate) * (1 + jitter * rng.uniform(-0.8, 1.2))
    if bell_end: E(b, typebell(g * 0.8), 1.0, 0.3)
def knock(g=1.0):
    """the series' dry wooden knock: a description becoming a wall"""
    return mx(thud(140, 0.16, 0.7), noiseb(0.04, 900, 3800, 0.01) * 0.45, thud(300, 0.05, 0.2)) * g
def lettertick(g=1.0):
    return mx(noiseb(0.012, 2500, 9000, 0.003) * 0.5, metal(rng.uniform(3000, 6000), 0.03, 0.15)) * g
def patter(E, a, b, rate, g=1.0, pan=0.0, spread=0.5):
    """letters landing: light dry ticks, thick at first, thinning"""
    t = a
    while t < b:
        u = (t - a) / max(0.01, b - a); E(t, lettertick(g * (1 - 0.6 * u) * (0.5 + rng.random())), 1.0, pan + rng.uniform(-spread, spread))
        t += rng.exponential(1.0 / (rate * (1.2 - u)))
def hum(d, f0=55, g=1.0):
    """the Edifier's hum: low, steady, a slow beat in it"""
    t = tt(d); ph = 2 * np.pi * f0 * t
    x = np.sin(ph) + 0.55 * np.sin(2 * ph + 0.3) + 0.3 * np.sin(3 * ph) + 0.2 * np.sin(2.01 * ph) + 0.12 * np.sin(5 * ph)
    am = (0.85 + 0.15 * np.sin(2 * np.pi * 0.6 * t)) * np.minimum(1, t / 0.6) * np.minimum(1, (d - t) / 0.6).clip(0)
    return filt(x, 'lowpass', 900) * am * 0.05 * g
def latch(g=1.0):
    """a door latch: the lever, the click, the door's weight"""
    return mx(metal(1900, 0.06, 0.5), np.concatenate([np.zeros(int(0.08 * SR)), mx(metal(2600, 0.05, 0.7), noiseb(0.02, 2000, 7000, 0.004) * 0.4)]),
              np.concatenate([np.zeros(int(0.16 * SR)), thud(110, 0.12, 0.25)])) * g
def doorswing(g=1.0): return mx(creak(0.7, 380, 0.5), swell(0.6, 300, 1500, 0.06)) * g

# ---------------- this film's sounds ----------------
def ink_scratch(d=0.8, g=1.0):
    """the Professor's signature: a pen with a flourish"""
    t = tt(d); x = filt(filt(noise(len(t)), 'highpass', 1800), 'lowpass', 6500) * (0.4 + 0.6 * np.abs(np.sin(2 * np.pi * 4.2 * t)) ** 2)
    return x * np.minimum(1, t / 0.03) * np.minimum(1, (d - t) / 0.06).clip(0) * 0.2 * g
def settle(d, g=1.0):
    """a building sitting down: a long groan, then the weight arriving"""
    o = mx(creak(d * 0.7, 140, 0.9), rumble(d, 0.5))
    return mx(o, np.concatenate([np.zeros(int(d * 0.62 * SR)), thud(42, 1.2, 1.2), swell(1.8, 200, 2000, 0.25)])) * g
def fly(d, g=1.0):
    """a fly in a shut room: a buzz that comes and goes and wanders"""
    t = tt(d); f = 190 + 25 * np.sin(2 * np.pi * 0.7 * t) + 12 * np.sin(2 * np.pi * 3.1 * t); ph = 2 * np.pi * np.cumsum(f) / SR
    x = filt(np.sign(np.sin(ph)) * 0.6 + np.sin(2 * ph) * 0.3, 'bandpass', [180, 2400])
    gate = (np.sin(2 * np.pi * 0.23 * t) > -0.2) * 1.0; gate = np.convolve(gate, np.ones(int(0.2 * SR)) / int(0.2 * SR), 'same')
    return x * gate * (0.6 + 0.4 * np.sin(2 * np.pi * 0.5 * t)) * 0.05 * g
def fan(d=0.9, g=1.0):
    """a sheet of paper used as a fan: two soft beats of air"""
    o = np.zeros(int(d * SR))
    for k in range(2): s = swell(0.32, 400, 3000, 0.12); i = int(k * 0.42 * SR); o[i:i + len(s)] += s[: len(o) - i]
    return o * g
def clocktick(g=1.0): return mx(metal(2100, 0.03, 0.25), thud(400, 0.03, 0.08)) * g
def sash(d=1.2, g=1.0):
    """a sash window going up: wood sliding in its runners"""
    t = tt(d); x = filt(filt(noise(len(t)), 'highpass', 300), 'lowpass', 2500) * (0.6 + 0.4 * np.abs(np.sin(2 * np.pi * 11 * t)))
    return mx(x * np.sin(np.pi * t / d) ** 0.5 * 0.22, creak(d, 520, 0.25), np.concatenate([np.zeros(int((d - 0.05) * SR)), wood(0.5)])) * g
def outside(d, g=1.0):
    """the air outside: a breeze, a far street, birds"""
    t = tt(d); x = filt(filt(noise(len(t)), 'highpass', 200), 'lowpass', 1600) * (0.6 + 0.4 * np.sin(2 * np.pi * 0.11 * t + 1)) * 0.06
    return x * np.minimum(1, t / 0.8) * g
def stamp(g=1.0): return mx(thud(90, 0.18, 0.8), noiseb(0.06, 500, 3000, 0.02) * 0.4, wood(0.4)) * g
def drawer(d=1.0, g=1.0):
    t = tt(d); x = filt(filt(noise(len(t)), 'highpass', 250), 'lowpass', 1800) * (0.7 + 0.3 * np.abs(np.sin(2 * np.pi * 7 * t)))
    return mx(x * np.sin(np.pi * t / d) ** 0.6 * 0.2, np.concatenate([np.zeros(int((d - 0.06) * SR)), wood(0.6)])) * g
def rain(d, g=1.0, heavy=1.0):
    """rain: a steady hiss, close drops, a gutter running"""
    t = tt(d); hiss = filt(filt(noise(len(t)), 'highpass', 900), 'lowpass', 7000) * 0.05 * heavy
    drops = np.zeros(len(t)); k = int(d * 90 * heavy)
    for _ in range(k):
        i = int(rng.uniform(0, len(t) - 2000)); dd = tt(rng.uniform(0.01, 0.03)); drops[i:i + len(dd)] += np.sin(2 * np.pi * rng.uniform(1800, 5000) * dd) * np.exp(-dd / 0.004) * rng.uniform(0.02, 0.09)
    gutter = filt(noise(len(t)), 'bandpass', [400, 1400]) * (0.5 + 0.5 * np.abs(np.sin(2 * np.pi * 1.3 * t + np.sin(2 * np.pi * 0.31 * t)))) * 0.025
    return (hiss + drops + gutter) * np.minimum(1, t / 1.0) * np.minimum(1, (d - t) / 1.0).clip(0) * g
def drip(g=1.0):
    t = tt(0.09); f = 900 + 1800 * (t / 0.09); return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.025) * 0.18 * g
def scrollpaper(d, g=1.0):
    """paper feeding out of the slot without stopping"""
    t = tt(d); x = filt(filt(noise(len(t)), 'highpass', 1500), 'lowpass', 8000) * (0.5 + 0.5 * (rng.random(len(t)) > 0.7))
    return x * 0.05 * np.minimum(1, t / 0.5) * np.minimum(1, (d - t) / 0.5).clip(0) * g
def trowel(d=0.35, g=1.0):
    """a trowel through mortar: a wet scrape with a ring in it"""
    t = tt(d); x = filt(filt(noise(len(t)), 'highpass', 700), 'lowpass', 4200) * np.sin(np.pi * t / d) ** 0.8 * 0.2
    return mx(x, metal(rng.uniform(1700, 2300), 0.12, 0.12)) * g
def brick(g=1.0):
    """a real brick set down: a short hard tap and its weight, a little wet"""
    return mx(thud(230, 0.07, 0.55), noiseb(0.03, 800, 3500, 0.008) * 0.35, thud(120, 0.1, 0.25)) * g
def unbrick(g=1.0): return mx(noiseb(0.06, 600, 2500, 0.02) * 0.3, thud(260, 0.04, 0.2)) * g
def espeak_layer(E, a, b, text, g=1.0):
    """eSpeak reading the Edifier's endless description, fast and far away"""
    try:
        import sys; sys.path.insert(0, HERE); import espeak as ES
    except Exception as e:
        print('espeak unavailable', e); return
    t = a; k = 0; parts = [p.strip() for p in text.split('.') if p.strip()]
    while t < b - 1.0:
        x, sr, _ = ES.say(parts[k % len(parts)], 'en-us', 330, 46, 10); x = resample_poly(x.astype(np.float64) / 32768.0, SR, sr)
        x = filt(x, 'bandpass', [500, 3600]) * 0.5; n = min(len(x), int((b - t) * SR)); x = x[:n]; x[-min(n, 2000):] *= np.linspace(1, 0, min(n, 2000))
        E(t, x * g, 1.0, 0.25); t += len(x) / SR + 0.15; k += 1
NOKEEP = ('A house that needs no keeping. Its gutters do not fill. Its roof does not admit the weather. Its paint does not consider the sun. '
          'Its hinges require no oil, because they are described as not requiring it. Its doors close on their own account. '
          'Its windows open on their own account. Its plaster is described as holding. Its plaster is described as continuing to hold.')

ROOM = {'office': (0.7, 0.1), 'street': (1.2, 0.07), 'annex': (0.5, 0.06), 'hall': (1.7, 0.16), 'garden': (0.6, 0.04), None: (1.0, 0.12)}

def sig_shot(E, C, one, pan=0.2, keyrate=11.0, g=1.0):
    """the signature shot: the sentence typed, its words falling, the walls knocked into place course by course"""
    ty, fa, bu = one('type'), one('fall'), one('build')
    typing(E, ty['at'], ty['to'], keyrate, 0.35, 0.9 * g)
    patter(E, fa['at'] + 0.35, fa['to'] + 0.3, 30, 0.8 * g, pan, 0.5)
    n = 6
    for i in range(n): E(bu['at'] + (bu['to'] - bu['at']) * (0.1 + 0.8 * i / (n - 1)) ** 1.1, knock(0.8 + 0.06 * i), 1.0, pan + rng.uniform(-0.15, 0.15))
    E(bu['to'] + 0.1, metal(2900, 0.5, 0.35), 1.0, pan)  # the plate

def design(sh):
    d = sh['d']; name = sh['shot']; rt, wet = ROOM.get(sh['room'], ROOM[None])
    n = int((d + 1.0) * SR); El = np.zeros(n); Er = np.zeros(n)
    E = lambda t, sig, g=1.0, pan=0.0: eadd(El, Er, t, sig, g, pan)
    def EV(t, sig, rt_, wet_, g=1.0, pan=0.0):
        pad = np.concatenate([sig, np.zeros(int(rt_ * SR))]); l, r = verb(pad, rt_, wet_)
        eadd(El, Er, t, l, g, pan - 0.3); eadd(El, Er, t, r, g, pan + 0.3)
    cues = sh['cues']; C = lambda k: [c for c in cues if c['k'] == k]; one = lambda k: C(k)[0]
    LN = sh['lines']
    E(0, roomtone(d + 0.5, 0.9))
    if name == 'office':
        ins = one('inside')['at']
        E(0, mx(murmur(ins, 0.25), filt(brown(int(ins * SR)), 'lowpass', 300) * 0.06), 1.0, 0.0)
        for k in range(5): E(rng.uniform(0.5, ins - 1), chirp(0.4), 1.0, rng.uniform(-0.7, 0.7))
        E(ins, hum(d - ins, 55, 1.0), 1.0, -0.3)
        sg = one('sign'); E(sg['at'], ink_scratch(sg['to'] - sg['at'], 1.2), 1.0, 0.1)
        sig_shot(E, C, one, 0.15, 10.0)
        gr = one('grow')  # the city multiplies: knocks far off, quicker and quicker
        k = 0; tm = gr['at']
        while tm < gr['to'] and k < 60: E(tm, knock(0.25 + 0.25 * rng.random()), 1.0, rng.uniform(-0.8, 0.8)); k += 1; tm += max(0.07, 0.7 * 0.93 ** k)
        pr = one('press'); E(pr['at'], footstep(0.6), 1.0, 0.4); E(pr['at'] + 0.5, footstep(0.6), 1.0, 0.35)
        for k in range(6): E(LN[4]['t0'] + k * 0.9, ink_scratch(0.5, 0.35), 1.0, 0.45)
    elif name == 'collapse':
        E(0, mx(murmur(d, 0.12), filt(brown(int(d * SR)), 'lowpass', 300) * 0.05))
        for k in range(8): E(rng.uniform(0.5, d - 1), chirp(0.35), 1.0, rng.uniform(-0.8, 0.8))
        fa = one('fall'); E(fa['at'], settle(fa['to'] - fa['at'] + 1.0, 1.0), 1.0, 0.0)
        patter(E, fa['at'] + (fa['to'] - fa['at']) * 0.55, fa['to'] + 1.6, 60, 1.0, 0.0, 0.8)
        E(fa['to'] + 0.2, swell(3.0, 150, 1400, 0.2), 1.0, 0.1)
        ar = one('arrive'); steps(E, ar['at'], ar['to'], 0.5, -0.6, -0.1, lambda g: footstep(g * 0.8), 1.0)
        li = one('lift'); E(li['at'], mx(noiseb(0.5, 400, 3000, 0.15) * 0.3, thud(160, 0.1, 0.2)), 1.0, 0.0); E(li['to'] - 0.3, mx(wood(0.4), lettertick(0.6)), 1.0, 0.0)
        pk = one('pick'); E(pk['at'], lettertick(1.2), 1.0, -0.1); E(pk['at'] + 0.15, rustle(0.2, 0.8), 1.0, -0.1)
    elif name == 'annex':
        E(0, hum(LN[1]['t0'], 55, 1.0), 1.0, -0.2)
        ty = one('type')
        for k in range(3): E(ty['at'] - 0.6 + k * 0.12, metal(1500 + 300 * k, 0.1, 0.2), 1.0, -0.2)  # the keys begin on their own
        sig_shot(E, C, one, 0.1, 12.0)
        rooms = C('room'); RT = [1.2, 0.85, 0.55, 0.38, 0.26]
        for i, r in enumerate(rooms):
            a = r['at']; b = rooms[i + 1]['at'] if i + 1 < len(rooms) else one('chain')['at']
            tm = a + 0.5
            while tm < b - 1.6: EV(tm, footstep(0.7 - 0.08 * i), RT[i], 0.35, 1.0, -0.3 + 0.6 * (tm - a) / max(1, b - a)); tm += 0.55 + 0.05 * i
            EV(b - 1.3, latch(0.9), RT[i], 0.3, 1.0, 0.4); EV(b - 0.9, doorswing(0.7), RT[i], 0.3, 1.0, 0.4)
        ch = one('chain'); E(ch['at'], swell(2.5, 200, 1200, 0.08), 1.0, 0.0)
        tn = one('tiny')
        tm = tn['at'] + 1.0
        while tm < d - 1: E(tm, clocktick(0.35), 1.0, 0.3); tm += 1.0
        E(tn['at'] + 2.0, mx(swell(3.0, 200, 900, 0.05)), 1.0, 0.2)  # the kettle, faintly
        for k in range(3): E(tn['at'] + 3 + k * 2.3, rustle(0.4, 0.6), 1.0, 0.5)  # leaves at the little window
    elif name == 'window':
        op = one('open')
        E(0, fly(op['at'] + 0.6, 1.0), 1.0, 0.2)
        tm = 0.6
        while tm < d - 0.5: E(tm, clocktick(0.45 if tm < op['at'] else 0.3), 1.0, -0.5); tm += 1.0
        for k in range(14): E(rng.uniform(0.3, op['at'] - 1.0), fan(0.9, 0.7), 1.0, rng.uniform(-0.7, 0.7))
        en = one('enter'); E(en['at'], latch(0.8), 1.0, 0.7); E(en['at'] + 0.3, doorswing(0.6), 1.0, 0.7)
        steps(E, en['at'] + 0.6, en['to'], 0.5, 0.7, 0.3, lambda g: stonestep(g), 0.9)
        wk = one('walk'); steps(E, wk['at'], wk['to'], 0.48, 0.3, 0.0, lambda g: stonestep(g), 0.9)
        E(wk['to'] + 0.1, mx(thud(130, 0.12, 0.3), rustle(0.3, 1.0)), 1.0, 0.0)  # the bag set down
        la = one('latch'); E(la['at'], latch(1.1), 1.0, 0.0)
        E(op['at'], sash(op['to'] - op['at'], 1.2), 1.0, 0.0)
        E(op['at'] + 0.2, outside(d - op['at'], 1.0), 1.0, 0.0)
        E(op['to'] - 0.2, swell(2.4, 500, 6000, 0.25), 1.0, 0.0)
        for k in range(12): E(op['to'] + 0.2 + rng.uniform(0, 0.8), rustle(0.35, 1.2), 1.0, rng.uniform(-0.6, 0.6))  # the papers lift
        for k in range(10): E(rng.uniform(op['to'], d - 0.5), chirp(0.5), 1.0, rng.uniform(-0.6, 0.6))
        sp = one('stamp'); E(sp['at'], stamp(1.1), 1.0, 0.1)
    elif name == 'factory':
        E(0, hum(d, 55, 1.2), 1.0, -0.2)
        steps(E, LN[0]['t0'] + 0.3, LN[0]['t1'], 0.6, 0.6, 0.2, lambda g: footstep(g), 0.6)
        sig_shot(E, C, one, -0.1, 11.0)
        dr = one('drawer'); E(dr['at'], drawer(0.9, 1.0), 1.0, -0.2)
        for k in range(5): tm = dr['at'] + 0.6 + k * (dr['to'] - dr['at'] - 0.6) / 5; E(tm, mx(wood(0.4), footstep(0.6)), 1.0, -0.3 + 0.12 * k); E(tm + 0.3, footstep(0.5), 1.0, -0.2 + 0.12 * k)
        for i in range(4, 10): E(LN[i]['t0'] - 0.15, rustle(0.2, 0.6), 1.0, -0.4 + 0.15 * (i - 4))  # a hand goes up
    elif name == 'strike':
        cy = one('city')['at']; sc = one('scroll')['at']
        E(0, rain(sc + 0.6, 1.0, 1.0), 1.0, 0.0)
        E(sc, rain(d - sc, 0.45, 0.7), 1.0, 0.0)  # heard from inside
        for k in range(28): E(rng.uniform(cy, sc - 0.3), drip(0.6 + 0.6 * rng.random()), 1.0, rng.uniform(-0.8, 0.8))
        E(cy + 1.4, rumble(3.0, 0.3), 1.0, 0.0)
        E(sc, hum(d - sc, 55, 1.0), 1.0, -0.2)
        E(sc, scrollpaper(d - sc, 1.2), 1.0, 0.1)
        typing(E, sc + 0.3, d - 0.3, 9.0, 0.2, 0.45, False)
        espeak_layer(E, sc + 0.5, d - 0.2, NOKEEP, 0.18)
    elif name == 'wall':
        E(0, mx(filt(brown(int(d * SR)), 'lowpass', 300) * 0.04), 1.0, 0.0)
        dn = one('done')['at']
        for k in range(26): E(rng.uniform(0.5, dn), chirp(0.45), 1.0, rng.uniform(-0.8, 0.8))
        tm = dn - 2
        while tm < d - 0.8: E(tm, cricket(0.9 if tm > LN[3]['t1'] else 0.4), 1.0, rng.uniform(-0.8, 0.8)); tm += rng.uniform(0.25, 0.7)
        steps(E, 0.6, LN[0]['t1'] - 0.5, 0.55, -0.6, -0.1, lambda g: footstep(g), 0.7)
        le = one('lend'); E(le['at'] + 0.8, mx(thud(120, 0.1, 0.3), metal(1800, 0.15, 0.3)), 1.0, 0.3)  # the bag set down, the tools in it
        E(le['at'] + 2.2, metal(2400, 0.2, 0.25), 1.0, 0.25); E(le['at'] + 3.0, wood(0.3), 1.0, 0.2)
        steps(E, le['to'] - 1.6, le['to'] + 1.2, 0.5, 0.3, 0.8, lambda g: footstep(g), 0.6)
        for c in C('brick'): E(c['at'] - 0.22, trowel(0.25, 0.6), 1.0, -0.05 + 0.002 * (c['n'] % 9)); E(c['at'], brick(0.9), 1.0, -0.15 + 0.035 * (c['n'] % 9))
        for c in C('unbrick'): E(c['at'], unbrick(0.8), 1.0, 0.0)
        pu = one('push'); E(pu['at'], mx(noiseb(0.4, 300, 2000, 0.12) * 0.15, thud(90, 0.2, 0.15)), 1.0, 0.0)
        st = one('student'); steps(E, st['at'], st['to'], 0.45, 0.8, 0.4, lambda g: footstep(g), 0.6)
        si = one('sit'); E(si['at'] + 1.2, mx(rustle(0.4, 0.8), thud(100, 0.15, 0.25)), 1.0, 0.0)
        q = [l for l in LN if l['line']][0]
        E(q['t0'] - 2.5, padchord([98, 146.8, 196, 293.7], d - q['t0'] + 2.5, 0.05, 3.0, 4.0), 1.0, 0.0)
    return El, Er, rt, wet

def title_end_design(sh):
    d = sh['d']; n = int((d + 1.0) * SR); El = np.zeros(n); Er = np.zeros(n)
    E = lambda t, sig, g=1.0, pan=0.0: eadd(El, Er, t, sig, g, pan)
    if sh['shot'] == 'title':
        E(0, padchord([110, 164.8, 220, 277.2], d, 0.06, 1.5, 1.8), 1.0, 0.0)
        typing(E, 0.8, 3.6, 10.0, 0.3, 0.7)
        patter(E, 4.0, 5.2, 24, 0.6, 0.0, 0.6)
        E(5.2, knock(0.8), 1.0, -0.1); E(5.6, knock(0.7), 1.0, 0.1)
    else:
        E(0, padchord([98, 146.8, 196, 293.7], d, 0.045, 0.2, 3.0), 1.0, 0.0)
        tm = 0.3
        while tm < d - 2.0: E(tm, cricket(0.6), 1.0, rng.uniform(-0.8, 0.8)); tm += rng.uniform(0.4, 0.9)
    return El, Er, 1.0, 0.12

for sh in shots:
    t0 = sh['t0']
    if sh['shot'] in ('title', 'end'): El, Er, rt, wet = title_end_design(sh)
    else: El, Er, rt, wet = design(sh)
    putvs(t0, (El, Er), rt, wet, 1.0)
    rt, wet = ROOM.get(sh['room'], ROOM[None])
    for ln in sh['lines']:
        a = ln['_a']; gg = 1.0 * (1.1 if ln['line'] else 1.0); w = wet * (1.3 if ln['line'] else 1.0)
        if ln['who'] == 'N': w = 0.05  # the historian is not in the room
        if isinstance(a, tuple): putvs(t0 + ln['t0'], a, rt, w, gg * 0.85)
        else: putv(t0 + ln['t0'], a, rt, w, gg, PANW.get(ln['who'], 0.0))

end_i = int((TOTAL + 0.6) * SR)
mixL, mixR = L[:end_i], Rr[:end_i]
fade = int(0.8 * SR); mixL[-fade:] *= np.linspace(1, 0, fade); mixR[-fade:] *= np.linspace(1, 0, fade)
pk = max(np.abs(mixL).max(), np.abs(mixR).max()); sc = 0.8 / pk
st = np.stack([mixL * sc, mixR * sc], 1)
os.makedirs(os.path.join(HERE, 'audio'), exist_ok=True)
wp = os.path.join(HERE, 'audio', 'an_raw.wav')
with wave.open(wp, 'wb') as wf:
    wf.setnchannels(2); wf.setsampwidth(2); wf.setframerate(SR); wf.writeframes((np.clip(st, -1, 1) * 32767).astype('<i2').tobytes())
subprocess.check_call(['ffmpeg', '-y', '-loglevel', 'error', '-i', wp, '-af', 'loudnorm=I=-16:TP=-1.5:LRA=11', '-c:a', 'aac', '-b:a', '96k', '-ar', '48000', os.path.join(HERE, 'audio', 'an.m4a')])
os.remove(wp)
dump()
print('done', TOTAL)
