"""Voices, sound and music for Trurl's Machine.
   python3 build_sound.py  ->  timing/tm.json and audio/tm.m4a
   Voices: Kokoro (kokoro-onnx), model files in $KOKORO_DIR (default ~/kokoro).
   Everything else is synthesized here, timed from the same score the picture reads.
   The device: a test, expected value against actual value. Before every answer the machine thinks out loud: a long rising racket
   of hum, clanking, relays and valves popping like corks, the same every time, and it resolves into one huge word, the same every
   time. The repairs are hammering and steps on iron stairs. The chase is the machine's footfalls, which sink as it walks in sand.
   The town is masonry and dust. The cave is darkness: close breathing and a warm hum through the steel. The ramming is the loudest
   thing in the film, and after it comes silence, and a last word that can barely be heard."""
import hashlib, json, os, re, subprocess, wave
import numpy as np
from scipy.signal import butter, sosfilt, fftconvolve, resample_poly

HERE = os.path.dirname(os.path.abspath(__file__))
KDIR = os.environ.get('KOKORO_DIR', os.path.expanduser('~/kokoro'))
SR = 48000
rng = np.random.default_rng(77)
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
from scipy.signal import lfilter
def comb(x, ms, fb):
    D = int(ms / 1000 * SR); a = np.zeros(D + 1); a[0] = 1; a[D] = -fb; return lfilter([1.0], a, x)
def machine_fx(a):
    """the machine: huge and slow, pitched well down, with a ring of sheet metal around it"""
    a = repitch(a, 0.8); a = filt(a, 'lowpass', 5200)
    b = comb(a, 6.3, 0.42) * 0.5 + comb(a, 9.9, 0.38) * 0.5
    t = np.arange(len(b)) / SR; b = b + 0.18 * b * np.sin(2 * np.pi * 57 * t)
    return np.tanh(filt(b, 'highpass', 50) * 1.6) * 0.75
def horn_fx(a):
    """the machine heard from outside a building or through a steel wall: muffled, like a horn"""
    b = machine_fx(a); b = filt(comb(b, 3.8, 0.55), 'bandpass', [160, 1100], 3); return b * 1.25
def shriek_fx(a):
    """the machine with the lid off, screaming: less low, harsh"""
    a = repitch(a, 0.92); b = comb(a, 5.1, 0.4); return np.tanh(filt(b, 'highpass', 260) * 3.0) * 0.7
def faint_fx(a):
    """the last word: the machine voice, very quiet and thin"""
    b = machine_fx(a); return filt(b, 'bandpass', [180, 1600]) * 0.16
def whisper_fx(a):
    """a whisper: breath riding on the voice, the voice itself held back"""
    env = np.convolve(np.abs(a), np.ones(int(0.02 * SR)) / int(0.02 * SR), 'same')
    air = filt(filt(noise(len(a)), 'highpass', 1500), 'lowpass', 7000) * env * 2.2
    return filt(a, 'highpass', 500) * 0.4 + air
def gruff_fx(a):
    """the mayor: lower, with a rough edge"""
    a = repitch(a, 0.95); return np.tanh(filt(a, 'lowpass', 4200) * 1.8) * 0.62
FX = {'machine': machine_fx, 'horn': horn_fx, 'shriek': shriek_fx, 'faint': faint_fx, 'whisper': whisper_fx, 'gruff': gruff_fx}

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
PANW = {'T': -0.3, 'K': 0.3, 'M': 0.0, 'Y': 0.25, 'N': 0.0}
shots = []; t = 0.0
for s in SCRIPT:
    sh = dict(shot=s['shot'], t0=round(t, 3), lines=[], room=s.get('room'))
    cur = 0.0
    for ln in s.get('lines', []):
        c = CAST[ln['who']]; sp = c['speed'] * (0.88 if (ln.get('line') or ln.get('same')) else 1.0)
        a = speak(ln['say'], c['voice'], sp)
        fx = ln.get('fx') or c.get('fx')
        if fx: a = FX[fx](a)
        d = len(a) / SR; mono = a
        if 'at' in ln: st = ln['at']
        elif 'after' in ln: st = sh['lines'][ln['after']]['t1'] + ln.get('pre', 0)
        else: st = cur + ln.get('pre', 0.6)
        hop = SR // 24; envl = [float(np.sqrt(np.mean(mono[i:i + hop] ** 2))) for i in range(0, len(mono), hop)]
        emax = max(envl) or 1; envl = [round(min(1, (v / emax) ** 0.7), 2) for v in envl]
        sh['lines'].append(dict(who=ln['who'], say=ln['say'], t0=round(st, 3), t1=round(st + d, 3), line=bool(ln.get('line')), same=bool(ln.get('same')), fx=ln.get('fx'), env=envl, _a=a))
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
    json.dump(dict(shots=shots, dur=TOTAL, cast=CAST), open(os.path.join(HERE, 'timing', 'tm.json'), 'w'))
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
ROOM['cave'] = (0.7, 0.2)

# ---------------- the machine's sounds ----------------
def cork(r, g=1.0):
    """a valve popping like a cork: a tight burst and a falling pitch"""
    t = tt(0.09); f = 1400 * np.exp(-t / 0.02) + 300
    return mx(np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.018) * 0.5, filt(r.standard_normal(int(0.02 * SR)), 'bandpass', [900, 5000]) * np.exp(-np.arange(int(0.02 * SR)) / SR / 0.004) * 0.6) * g
def clank(r, g=1.0):
    f = r.uniform(180, 520); t = tt(0.5)
    x = (np.sin(2 * np.pi * f * t) + 0.7 * np.sin(2 * np.pi * f * 2.41 * t) + 0.5 * np.sin(2 * np.pi * f * 3.87 * t)) * np.exp(-t / 0.09)
    k = int(0.004 * SR); x[:k] += r.standard_normal(k) * 0.8; return x * 0.3 * g
def relay(r, g=1.0):
    return mx(filt(r.standard_normal(int(0.012 * SR)), 'bandpass', [1500, 7000]) * 0.5, np.sin(2 * np.pi * r.uniform(2200, 3400) * tt(0.03)) * np.exp(-tt(0.03) / 0.006) * 0.25) * g
_RACKET = {}
def racket(d):
    """the machine thinking: hum, transformer throb, clanking, relays and corks, rising for d seconds, then a halt and a deep boom
       under the answer. Built from its own fixed seed so it is the same every time."""
    key = round(d, 2)
    if key in _RACKET: return _RACKET[key]
    r = np.random.default_rng(7); n = int((d + 1.6) * SR); o = np.zeros(n); t = np.arange(int(d * SR)) / SR; u = t / d
    f = 46 * (2.3 ** (u ** 1.5)); ph = 2 * np.pi * np.cumsum(f) / SR
    hum_ = (np.sin(ph) + 0.6 * np.sin(2 * ph) + 0.4 * np.sin(3 * ph + 1) + 0.25 * np.sin(5 * ph)) * (0.25 + 0.75 * u ** 1.3)
    throb = np.sin(2 * np.pi * 100 * t) * (0.5 + 0.5 * np.sin(2 * np.pi * (2 + 9 * u) * t)) * 0.35 * u
    rum = filt(np.cumsum(r.standard_normal(len(t))), 'lowpass', 90); rum = rum / (np.abs(rum).max() + 1e-9) * (0.3 + 0.7 * u)
    o[:len(t)] += (hum_ * 0.16 + throb * 0.12 + rum * 0.25) * np.minimum(1, t / 0.25)
    tm = 0.05
    while tm < d - 0.1:
        uu = tm / d; i = int(tm * SR); kind = r.random()
        s = clank(r, 0.6 + 0.6 * uu) if kind < 0.35 else relay(r, 0.8) if kind < 0.75 else cork(r, 0.7 + 0.5 * uu)
        o[i:i + len(s)] += s[: n - i] * r.uniform(0.5, 1.0)
        tm += r.exponential(0.22 * (1 - 0.8 * uu) + 0.025)
    for q in range(5):  # the chugging
        for k_ in range(int(d * (1.5 + q * 0.4))):
            tt_ = k_ / (1.5 + q * 0.4) + q * 0.07
            if tt_ < d: i = int(tt_ * SR); s = thud(70 + q * 8, 0.12, 0.25 * tt_ / d); o[i:i + len(s)] += s[: n - i]
    i = int(d * SR); halt = mx(thud(38, 1.4, 1.6), clank(r, 1.4), noiseb(0.5, 60, 900, 0.15) * 0.6)
    o[i:i + len(halt)] += halt[: n - i]
    _RACKET[key] = o; return o
def mhum2(d, f0=48, g=1.0):
    """the machine idling: a low two-note hum"""
    t = tt(d); x = np.sin(2 * np.pi * f0 * t) + 0.7 * np.sin(2 * np.pi * f0 * 1.007 * t + 1) + 0.4 * np.sin(2 * np.pi * f0 * 2 * t) + 0.18 * np.sin(2 * np.pi * f0 * 3.01 * t)
    return x * np.minimum(1, t / 0.5) * np.minimum(1, (d - t) / 0.5).clip(0) * 0.06 * g
def chalk(d, g=1.0):
    """chalk on slate: squeaky strokes with gaps"""
    t = tt(d); x = filt(filt(noise(len(t)), 'highpass', 2600), 'lowpass', 9000) * (np.sin(2 * np.pi * 2.6 * t) > -0.3) * (0.6 + 0.4 * np.sin(2 * np.pi * 31 * t))
    sq = np.sin(2 * np.pi * np.cumsum(3100 + 400 * np.sin(2 * np.pi * 5 * t)) / SR) * (np.sin(2 * np.pi * 1.3 * t + 1) > 0.75) * 0.25
    return (x * 0.18 + sq * 0.12) * np.minimum(1, t / 0.05) * np.minimum(1, (d - t) / 0.05).clip(0) * g
def hammer(g=1.0): return mx(metal(rng.uniform(900, 1500), 0.3, 1.0), thud(130, 0.08, 0.5)) * g
def stairstep(g=1.0): return mx(metal(rng.uniform(420, 620), 0.25, 0.55), thud(110, 0.1, 0.4)) * g
def kickclang(g=1.0):
    """a boot against the machine's base: a big hollow boom of sheet metal"""
    t = tt(1.6); f = 74
    x = sum(a_ * np.sin(2 * np.pi * f * r_ * t) * np.exp(-t / (0.9 / r_)) for a_, r_ in [(1, 1), (0.6, 1.53), (0.5, 2.31), (0.35, 3.7), (0.2, 5.2)])
    return mx(x * 0.35, thud(60, 0.4, 0.8), noiseb(0.05, 600, 4000, 0.01) * 0.5) * g
def bigstep(sink=0.0, g=1.0):
    """one footfall of an eight-storey machine; sink adds the slide of sand closing round the foot"""
    o = mx(thud(34, 1.0, 1.5), thud(70, 0.3, 0.6), clank(rng, 0.5), noiseb(0.4, 80, 900, 0.12) * 0.5)
    if sink > 0: o = mx(o, np.concatenate([np.zeros(int(0.15 * SR)), swell(1.1, 250, 3500, 0.35 * sink)]), np.concatenate([np.zeros(int(0.1 * SR)), filt(brown(int(1.0 * SR)), 'lowpass', 300) * np.linspace(1, 0, int(1.0 * SR)) * 0.35 * sink]))
    return o * g
def masonry(g=1.0, d=2.2):
    """a wall coming down: a crack, a heavy slump, bricks and a long hiss of dust"""
    o = mx(noiseb(0.25, 400, 5000, 0.05, 0.002) * 0.9, thud(45, 1.2, 1.4), filt(brown(int(d * SR)), 'lowpass', 500) * np.exp(-tt(d) / (d / 3)) * 0.8, np.concatenate([np.zeros(int(0.3 * SR)), swell(d, 1500, 9000, 0.12)]))
    for q in range(16):
        i = int((0.08 + rng.uniform(0, 1.0) * rng.random()) * SR); s = mx(thud(rng.uniform(110, 220), 0.1, rng.uniform(0.2, 0.5)), noiseb(0.05, 600, 4000, 0.012) * 0.4)
        o = mx(o, np.concatenate([np.zeros(i), s]))
    return o * g
def pebbles(n=5, g=1.0):
    o = np.zeros(int(1.6 * SR))
    for q in range(n):
        i = int(rng.uniform(0, 1.2) * SR); s = mx(thud(rng.uniform(180, 320), 0.07, 0.3), noiseb(0.04, 1200, 6000, 0.008) * 0.35); o[i:i + len(s)] += s[: len(o) - i]
    return o * g
def breath(d, rate=0.32, g=1.0):
    """close breathing in the dark"""
    t = tt(d); x = filt(filt(noise(len(t)), 'highpass', 500), 'lowpass', 3200); ph = (t * rate) % 1
    env = np.where(ph < 0.4, np.sin(np.pi * ph / 0.4) ** 2, 0.55 * np.sin(np.pi * (ph - 0.4) / 0.6) ** 2)
    return x * env * 0.09 * g * np.minimum(1, t / 0.5) * np.minimum(1, (d - t) / 0.5).clip(0)
def warmhum(d, g=1.0):
    """the machine through the steel lid: a low warm hum, slow beating"""
    t = tt(d); x = np.sin(2 * np.pi * 52 * t) + 0.8 * np.sin(2 * np.pi * 52.7 * t + 1) + 0.45 * np.sin(2 * np.pi * 104.3 * t) + 0.2 * np.sin(2 * np.pi * 157 * t)
    x = filt(x, 'lowpass', 220) + 0.3 * filt(brown(len(t)), 'lowpass', 120)
    return x * np.minimum(1, t / 1.0) * np.minimum(1, (d - t) / 1.0).clip(0) * 0.09 * g
def scrape(d, f0=90, g=1.0):
    """steel dragged across rock"""
    t = tt(d); fr = f0 * (1 + 0.15 * np.sin(2 * np.pi * 3.1 * t)); ph = 2 * np.pi * np.cumsum(fr) / SR
    x = np.sign(np.sin(ph)) * 0.4 + filt(noise(len(t)), 'bandpass', [400, 3000]) * (0.5 + 0.5 * (rng.random(len(t)) > 0.6))
    return filt(x, 'lowpass', 3500) * np.sin(np.pi * t / d) ** 0.5 * 0.3 * g
def ramhit(g=1.0):
    """the machine's eight floors against the mountain: the loudest thing in the film"""
    o = mx(thud(30, 1.8, 2.2), thud(55, 0.7, 1.4), kickclang(1.1), noiseb(0.8, 80, 3000, 0.25, 0.002) * 1.3, masonry(0.7, 1.6))
    for q in range(10):  # sparks
        i = int(rng.uniform(0, 0.25) * SR); s = metal(rng.uniform(3500, 8000), 0.15, 0.4); o = mx(o, np.concatenate([np.zeros(i), s]))
    return o * g
def snap(g=1.0): return mx(noiseb(0.06, 1500, 9000, 0.01, 0.001) * 1.0, metal(1900, 0.2, 0.7), thud(160, 0.08, 0.4)) * g

def design(sh):
    d = sh['d']; name = sh['shot']; rt, wet = ROOM.get(sh['room'], ROOM[None])
    n = int((d + 1.0) * SR); El = np.zeros(n); Er = np.zeros(n)
    E = lambda t, sig, g=1.0, pan=0.0: eadd(El, Er, t, sig, g, pan)
    cues = sh['cues']; C = lambda k: [c for c in cues if c['k'] == k]; one = lambda k: C(k)[0]
    LN = sh['lines']
    for c in C('think'): E(c['at'], racket(5.2), 1.0, 0.0)
    if name == 'test':
        pa, ch = one('paint'), one('chalk')
        E(0, wind(d + 0.5, 0.04))
        E(0, mhum2(d, 46, 0.5))
        for q in range(int((pa['to'] - pa['at']) / 0.9)): E(pa['at'] + q * 0.9 + rng.uniform(0, 0.3), scratch(0.5, 0.5), 1.0, 0.3)
        E(ch['at'], chalk(ch['to'] - ch['at'], 1.0), 1.0, -0.2)
        steps(E, 0.2, 2.0, 0.42, -0.5, -0.2, dirtstep, 0.6)
    elif name == 'repair':
        ins, ou, ag, kl, wi, c2 = one('inside'), one('out'), one('again'), one('klap'), one('wipe'), one('chalk2')
        E(0, mhum2(d, 46, 0.6))
        E(ins['at'] - 1.2, mx(creak(0.8, 220, 1.0), metal(500, 0.3, 0.5)), 1.0, 0.0)
        tm = ins['at'] + 0.2; k = 0
        while tm < ins['to'] - 0.3:  # hammering, steps on the iron stairs, a sizzle, a switch
            ph_ = k % 14
            if ph_ < 5: E(tm, hammer(0.7), 1.0, rng.uniform(-0.3, 0.3)); tm += 0.32
            elif ph_ < 11: E(tm, stairstep(0.8), 1.0, -0.4 + 0.12 * (ph_ - 5)); tm += 0.2
            elif ph_ == 11: E(tm, sizzle(1.0, 1.4), 1.0, 0.2); tm += 0.9
            else: E(tm, mx(metal(300, 0.3, 0.9), thud(80, 0.2, 0.6)), 1.0, 0.0); tm += 0.5
            k += 1
        E(ou['at'] - 0.5, mx(creak(0.7, 240, 1.0), metal(500, 0.3, 0.5)), 1.0, 0.0)
        tm = ag['at'] + 0.4
        while tm < ag['to'] - 0.5: E(tm, hammer(0.25), 1.0, 0.0); tm += 0.45 + rng.uniform(0, 0.4)
        steps(E, kl['at'] - 1.5, kl['to'], 0.42, 0.8, 0.3, dirtstep, 0.6)
        E(wi['at'], rustle(0.6, 1.4), 1.0, 0.2); E(wi['at'] + 0.7, chalk(1.6, 1.0), 1.0, 0.2); E(c2['at'], chalk(1.2, 1.0), 1.0, 0.2)
    elif name == 'expert':
        E(0, wind(d + 0.5, 0.035)); E(0, mhum2(d, 46, 0.5))
        for c in C('kick'): E(c['at'], kickclang(1.0), 1.0, 0.0)
        for c in C('warn'): E(c['at'] - 0.3, mx(relay(rng, 1.0), clank(rng, 0.7)), 1.0, 0.0)
    elif name == 'count':
        ks, ns, dk, lf, tn, rn = C('kick'), C('n'), one('dark'), one('lift'), one('turn'), one('run')
        E(0, wind(d + 0.5, 0.035)); E(0, mhum2(lf['at'], 46, 0.6))
        for c in ks: E(c['at'], kickclang(1.0), 1.0, 0.0)
        for c in ns: E(c['at'], mx(relay(rng, 1.2), thud(90, 0.3, 0.6), mhum2(0.6, 92, 1.4)), 1.0, 0.0)
        E(dk['at'], mx(thud(50, 0.8, 1.0), noiseb(0.3, 200, 2000, 0.08) * 0.5), 1.0, 0.0)
        E(lf['at'], rumble(lf['to'] - lf['at'] + 1.0, 0.6), 1.0, 0.0)
        tm = lf['at']
        while tm < lf['to']: E(tm, mx(creak(0.9, rng.uniform(70, 130), 1.6), noiseb(0.2, 300, 4000, 0.05) * 0.6), 1.0, rng.uniform(-0.5, 0.5)); tm += 0.7 + rng.uniform(0, 0.4)
        for q in range(5): E(lf['to'] - 0.6 + q * 0.12, masonry(0.5, 1.4), 1.0, rng.uniform(-0.6, 0.6))
        tm = tn['at']
        while tm < d: E(tm, bigstep(0, 0.9), 1.0, 0.1); tm += 1.3
        steps(E, rn['at'], d, 0.2, 0.0, -0.8, dirtstep, 0.9, 0.1)
    elif name == 'chase':
        sa, hd, wl = one('sand'), one('hard'), one('wild')
        E(0, wind(d + 0.5, 0.05))
        tm = 0.3
        while tm < hd['at']: E(tm, bigstep(1.0, 0.9), 1.0, 0.3 * np.sin(tm)); tm += 1.6
        while tm < wl['at']: E(tm, bigstep(0, 1.0), 1.0, 0.2 * np.sin(tm)); tm += 0.85
        E(hd['at'], mx(swell(hd['to'] - hd['at'], 1800, 7000, 0.06), np.zeros(1)), 1.0, 0.2)
        tm = hd['at'] + 0.5
        while tm < hd['to']: E(tm, cork(rng, 0.5) if rng.random() < 0.5 else sizzle(0.5, 0.8), 0.8, 0.2); tm += rng.uniform(0.3, 0.9)
        while tm < d: E(tm, bigstep(0, 0.45), 1.0, 0.4); tm += 0.95
        steps(E, 0.0, d, 0.19, -0.3, -0.5, dirtstep, 0.8, 0.1)
    elif name == 'town':
        cr, pl, hl, ce, tr, lv = one('crash'), one('plow'), one('hall'), one('cellar'), one('tremble'), one('leave')
        E(0, wind(ce['at'] + 0.5, 0.03))
        steps(E, 0.0, hl['to'], 0.2, -0.2, 0.3, footstep, 0.8, 0.1)
        E(cr['at'], masonry(1.2, 2.6), 1.0, 0.6)
        tm = pl['at']
        while tm < pl['to']: E(tm, masonry(rng.uniform(0.6, 1.0), 2.0), 1.0, rng.uniform(0.2, 0.9)); tm += rng.uniform(0.7, 1.3)
        tm = pl['at'] + 0.4
        while tm < hl['at']: E(tm, bigstep(0, 0.6), 1.0, 0.6); tm += 1.0
        for q in range(4): steps(E, pl['at'] + 1.5 + q * 0.3, pl['to'], 0.17 + 0.02 * q, -0.9 + 0.5 * q, 0.9 - 0.4 * q, footstep, 0.5, 0.15)
        E(pl['at'] + 1.0, swell(pl['to'] - pl['at'] + 1.5, 1500, 8000, 0.08), 1.0, 0.3)
        steps(E, hl['at'] + 0.4, ce['at'], 0.28, 0.0, 0.0, footstep, 0.9)
        E(ce['at'], mx(thud(70, 0.5, 0.8), wood(0.8)), 1.0, -0.3)
        E(ce['at'], rumble(d - ce['at'], 0.05), 1.0, 0.0)
        steps(E, ce['at'] + 0.6, ce['at'] + 3.0, 0.35, 0.8, 0.4, footstep, 0.6)
        E(tr['at'], mx(rumble(tr['to'] - tr['at'] + 1.5, 0.9), masonry(0.5, 2.0)), 1.0, 0.0)
        for q in range(6): E(tr['at'] + 0.3 + q * 0.4, pebbles(3, 0.5), 1.0, rng.uniform(-0.6, 0.6))
        steps(E, lv['at'], d, 0.3, 0.0, -0.6, footstep, 0.8)
    elif name == 'cave':
        cl, ins, lk, shd, se, fe, gr = one('climb'), one('inside'), one('look'), one('shadow'), one('seal'), one('feel'), one('grope')
        E(0, wind(se['at'] + 0.3, 0.05))
        E(0, rumble(cl['at'], 0.15))
        tm = 0.4
        while tm < cl['at'] - 0.3: E(tm, bigstep(0, 0.35), 1.0, 0.5); tm += 1.1
        steps(E, 0.3, cl['at'], 0.19, -0.6, 0.4, footstep, 0.7, 0.1)
        steps(E, cl['at'], cl['to'], 0.24, -0.2, 0.3, dirtstep, 1.0, 0.2)
        for q in range(6): E(cl['at'] + 0.5 + q * 0.9, pebbles(4, 0.7), 1.0, rng.uniform(-0.5, 0.5))
        tm = lk['at'] + 0.6
        while tm < se['at']: E(tm, bigstep(0, 0.5 + 0.4 * (tm - lk['at']) / max(1, se['at'] - lk['at'])), 1.0, 0.0); tm += 1.0
        E(shd['at'], swell(shd['to'] - shd['at'] + 0.6, 200, 2000, 0.15), 1.0, 0.0)
        E(se['at'], scrape(se['to'] - se['at'], 70, 1.4), 1.0, 0.0)
        E(se['to'] - 0.25, mx(thud(32, 1.6, 2.0), kickclang(0.9), noiseb(0.3, 80, 1500, 0.08)), 1.0, 0.0)
        E(se['to'] + 0.4, warmhum(d - se['to'] + 0.5, 1.0), 1.0, 0.0)
        E(se['to'] + 1.2, breath(d - se['to'] - 1.0, 0.31, 1.0), 1.0, -0.3); E(se['to'] + 2.0, breath(d - se['to'] - 2.0, 0.27, 0.8), 1.0, 0.3)
        E(fe['at'], scratch(1.4, 0.6), 1.0, 0.0); E(fe['to'] - 0.2, mx(thud(90, 0.1, 0.2), metal(300, 0.3, 0.25)), 1.0, 0.0)
        steps(E, gr['at'], gr['at'] + 1.6, 0.45, 0.2, -0.1, dirtstep, 0.5)
        for q in range(3): E(se['to'] + 3.0 + q * 4.7, mx(noiseb(0.04, 1000, 4000, 0.01) * 0.2, pluck(rng.uniform(1300, 1700), 0.3, 0.2) * 0.25), 1.0, rng.uniform(-0.5, 0.5))
    elif name == 'four':
        rg, chk, pu, rm, br = one('rage'), one('chalk'), one('pull'), one('ram'), one('break')
        E(0, warmhum(pu['at'] + 0.6, 1.0), 1.0, 0.0)
        E(0, breath(rg['at'], 0.3, 1.0), 1.0, -0.3); E(0, breath(rg['at'], 0.26, 0.8), 1.0, 0.3)
        E(chk['at'], chalk(chk['to'] - chk['at'], 0.8), 1.0, 0.0)
        E(pu['at'], scrape(1.6, 80, 1.3), 1.0, 0.0); E(pu['at'] + 1.0, wind(rm['at'] - pu['at'], 0.06), 1.0, 0.0)
        E(pu['at'] + 0.6, mhum2(rm['at'] - pu['at'], 52, 1.8), 1.0, 0.0)
        tm = rm['at']; k = 0
        while tm < rm['to'] - 0.4:
            g = 0.75 + 0.35 * min(1, k / 6)
            E(tm - 0.5, scrape(0.5, 60, 0.5), 1.0, 0.0); E(tm, ramhit(g), 1.0, rng.uniform(-0.2, 0.2))
            for q in range(3): E(tm + 0.3 + q * 0.25, pebbles(5, 0.6), 1.0, rng.uniform(-0.7, 0.7))
            tm += 1.25 - 0.04 * min(k, 6); k += 1
        b = br['at']
        E(b - 1.2, scrape(1.3, 50, 1.6), 1.0, 0.0)
        E(b, mx(ramhit(1.6), rumble(5.0, 1.6), swell(2.0, 200, 6000, 0.5)), 1.0, 0.0)
        for q in range(14): E(b + 0.3 + q * 0.18 + rng.uniform(0, 0.2), masonry(0.5 * (1 - q / 16), 1.5), 1.0, rng.uniform(-0.8, 0.8))
    elif name == 'wreck':
        dn, sn, wk_ = one('down'), one('snap'), one('walk')
        E(0, wind(d + 0.5, 0.025))
        steps(E, dn['at'], dn['to'], 0.42, -0.4, 0.1, dirtstep, 0.6); steps(E, dn['at'] + 0.2, dn['to'], 0.42, -0.2, 0.2, dirtstep, 0.6)
        tm = 0.8
        while tm < sn['at']: E(tm, creak(1.1, 150 + 30 * np.sin(tm), 0.55), 1.0, 0.2); tm += 2.6
        E(sn['at'], snap(0.7), 1.0, 0.2); E(sn['at'] + 0.4, pebbles(4, 0.7), 1.0, 0.3)
        steps(E, wk_['at'], d - 0.3, 0.45, 0.0, -0.9, dirtstep, 0.6); steps(E, wk_['at'] + 0.2, d - 0.3, 0.45, 0.1, -0.8, dirtstep, 0.55)
    return El, Er, rt, wet

def title_end_design(sh):
    d = sh['d']; n = int((d + 1.0) * SR); El = np.zeros(n); Er = np.zeros(n)
    E = lambda t, sig, g=1.0, pan=0.0: eadd(El, Er, t, sig, g, pan)
    if sh['shot'] == 'title':
        E(0.5, chalk(1.4, 0.9), 1.0, -0.2)
        E(2.0, racket(2.2) * 0.8, 1.0, 0.0)
    else:
        E(0, wind(d, 0.03), 1.0, 0.0)
        steps(E, 0.4, 4.5, 0.45, -0.3, -0.9, dirtstep, 0.45)
        E(5.0, creak(1.4, 140, 0.35), 1.0, 0.3)
    return El, Er, 1.0, 0.12

for sh in shots:
    t0 = sh['t0']
    if sh['shot'] in ('title', 'end'): El, Er, rt, wet = title_end_design(sh)
    else: El, Er, rt, wet = design(sh)
    putvs(t0, (El, Er), rt, wet, 1.0)
    rt, wet = ROOM.get(sh['room'], ROOM[None])
    for ln in sh['lines']:
        a = ln['_a']; big = ln['line'] or ln['same']; gg = 1.0 * (1.12 if big else 1.0); w = wet * (1.4 if big else 1.0)
        if ln['who'] == 'M' and ln['same']: gg *= 1.35
        putv(t0 + ln['t0'], a, rt, w, gg, PANW.get(ln['who'], 0.0))

end_i = int((TOTAL + 0.6) * SR)
mixL, mixR = L[:end_i], Rr[:end_i]
fade = int(0.8 * SR); mixL[-fade:] *= np.linspace(1, 0, fade); mixR[-fade:] *= np.linspace(1, 0, fade)
pk = max(np.abs(mixL).max(), np.abs(mixR).max()); sc = 0.8 / pk
st = np.stack([mixL * sc, mixR * sc], 1)
os.makedirs(os.path.join(HERE, 'audio'), exist_ok=True)
wp = os.path.join(HERE, 'audio', 'tm_raw.wav')
with wave.open(wp, 'wb') as wf:
    wf.setnchannels(2); wf.setsampwidth(2); wf.setframerate(SR); wf.writeframes((np.clip(st, -1, 1) * 32767).astype('<i2').tobytes())
subprocess.check_call(['ffmpeg', '-y', '-loglevel', 'error', '-i', wp, '-af', 'loudnorm=I=-16:TP=-1.5:LRA=11', '-c:a', 'aac', '-b:a', '128k', '-ar', '48000', os.path.join(HERE, 'audio', 'tm.m4a')])
os.remove(wp)
dump()
print('done', TOTAL)
