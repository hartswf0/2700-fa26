"""Voices, sound and music for The Sixth Sally, or The Demon of the Second Kind.
   python3 build_sound.py  ->  timing/ps.json and audio/ps.m4a
   Voices: Kokoro (kokoro-onnx), model files in $KOKORO_DIR (default ~/kokoro).
   Everything else is synthesized here, timed from the same score the picture reads."""
import hashlib, json, os, subprocess, wave
import numpy as np
from scipy.signal import butter, sosfilt, fftconvolve, resample_poly

HERE = os.path.dirname(os.path.abspath(__file__))
KDIR = os.environ.get('KOKORO_DIR', os.path.expanduser('~/kokoro'))
SR = 48000
rng = np.random.default_rng(7)
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
def env_decay(n, tau): return np.exp(-np.arange(n) / SR / tau)
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
def vary_rate(x, rate):
    """read x with a time-varying playback rate (tape speed)"""
    pos = np.cumsum(rate); pos = pos[pos < len(x) - 1]
    i = pos.astype(int); f = pos - i
    return x[i] * (1 - f) + x[i + 1] * f

total_guess = 480
L = np.zeros(int(total_guess * SR)); Rr = np.zeros_like(L)
def put(t, sig, gain=1.0, pan=0.0, st=None):
    i = int(t * SR)
    if i < 0: sig = sig[-i:]; i = 0
    n = min(len(sig), len(L) - i)
    if n <= 0: return
    gl, gr = gain * np.sqrt((1 - pan) / 2) * 1.414, gain * np.sqrt((1 + pan) / 2) * 1.414
    if st is not None: L[i:i + n] += st[0][:n] * gl; Rr[i:i + n] += st[1][:n] * gr
    else: L[i:i + n] += sig[:n] * gl; Rr[i:i + n] += sig[:n] * gr
def putv(t, sig, rt, wet, gain=1.0, pan=0.0):
    pad = np.concatenate([sig, np.zeros(int(rt * SR))]); put(t, pad, gain, pan, st=verb(pad, rt, wet))

# ---------------- instruments ----------------
def mnote(m): return 440 * 2 ** ((m - 69) / 12)
def mbox(f, dur=1.8):
    n = int(dur * SR); t = np.arange(n) / SR
    s = np.sin(2 * np.pi * f * t) * np.exp(-t / 1.0) + 0.3 * np.sin(2 * np.pi * 2.0 * f * t) * np.exp(-t / 0.35) + 0.22 * np.sin(2 * np.pi * 4.18 * f * t) * np.exp(-t / 0.12) + 0.1 * np.sin(2 * np.pi * 6.3 * f * t) * np.exp(-t / 0.05)
    c = int(0.004 * SR); s[:c] += filt(noise(c), 'highpass', 3000) * 0.25
    return s * 0.5
def bell(f, dur=6.0):
    n = int(dur * SR); t = np.arange(n) / SR; s = np.zeros(n)
    for r, a, d in [(0.5, 0.55, 4.5), (1, 1, 3.2), (1.19, 0.5, 2.2), (1.5, 0.35, 1.8), (2, 0.4, 1.4), (2.52, 0.2, 0.9), (3, 0.16, 0.7), (4.1, 0.08, 0.4)]:
        s += a * np.sin(2 * np.pi * f * r * t * (1 + 0.0012 * rng.standard_normal())) * np.exp(-t / d)
    s[: int(0.003 * SR)] *= np.linspace(0, 1, int(0.003 * SR)); return s * 0.28
MOTIF = [(76, 1), (79, 1), (81, 1), (79, 2), (76, 1), (74, 1), (72, 1), (74, 2), (76, 1), (77, 1), (76, 1), (74, 1), (71, 1), (72, 3)]
def motif_times(t0, beat):
    out = []; t = t0
    for m, b in MOTIF: out.append((t, m)); t += b * beat
    return out, t
def click(f0=2500, n=0.006, q=1.0):
    k = int(n * SR); s = filt(noise(k), 'bandpass', [f0 * 0.6, min(f0 * 1.6, 20000)]) * np.linspace(1, 0, k) ** 2; return s * q
def thock(f=180, d=0.03):
    n = int(d * SR); t = np.arange(n) / SR; return np.sin(2 * np.pi * f * t) * np.exp(-t / (d / 4))
def ping(f, d):
    n = int(d * SR); t = np.arange(n) / SR; return np.sin(2 * np.pi * f * t) * np.exp(-t / (d / 5))

def mx(*xs):
    n = max(len(x) for x in xs); o = np.zeros(n)
    for x in xs: o[:len(x)] += x
    return o

# ---------------- murmur: the citizens, built from many small voices ----------------
def resolve(spec, lines, d):
    if isinstance(spec, (int, float)): return float(spec)
    s = spec.replace(' ', '')
    if s.startswith('end'): return d + (float(s[3:]) if len(s) > 3 else 0)
    i = int(s[1:s.index('.')]); rest = s[s.index('.') + 1:]
    base = lines[i]['t0'] if rest.startswith('t0') else lines[i]['t1']
    return base + (float(rest[2:]) if len(rest) > 2 else 0)


FACTS, FACT_VOICES = data['FACTS'], data['FACT_VOICES']
ROOM = {'shop': (0.6, 0.12), 'space': (0.4, 0.05), 'ship': (0.7, 0.16), 'cellar': (2.2, 0.3)}
PAN = {'N': 0, 'T': -0.3, 'K': 0.3, 'P': 0.1}
PANEL = lambda name: name not in ('title', 'today', 'end')

def giant(a):
    """Pugg: a quarter lower and slower, thickened with a sub octave and a little grit"""
    y = resample_poly(a, 5, 4)
    sub = np.abs(y); sub = filt(sub * np.sign(np.sin(np.cumsum(np.full(len(y), 2 * np.pi * 55 / SR)))), 'lowpass', 160) * 0.3
    return np.tanh((y + sub) * 1.5) * 0.8
def voice(text, who, line=False):
    c = CAST[who]; a = speak(text, c['voice'], c['speed'] * (0.94 if line else 1.0))
    if c.get('fx') == 'giant': a = giant(a)
    return a

# ---------------- timing pass ----------------
shots = []; t = 0.0
for s in SCRIPT:
    sh = dict(shot=s['shot'], t0=round(t, 3), lines=[], room=s.get('room'))
    cur = 0.0
    for ln in s.get('lines', []):
        a = voice(ln['say'], ln['who'], ln.get('line'))
        st = ln['at'] if 'at' in ln else cur + ln.get('pre', 0.6); d = len(a) / SR
        hop = SR // 24; envl = [float(np.sqrt(np.mean(a[i:i + hop] ** 2))) for i in range(0, len(a), hop)]
        emax = max(envl) or 1; envl = [round(min(1, (v / emax) ** 0.7), 2) for v in envl]
        sh['lines'].append(dict(who=ln['who'], say=ln['say'], t0=round(st, 3), t1=round(st + d, 3), line=bool(ln.get('line')), env=envl, _a=a))
        cur = st + d
    sh['d'] = round(s['d'] if 'd' in s else cur + s.get('tail', 1.5), 3)
    L_ = sh['lines']; dd = sh['d']
    sh['cues'] = [dict({k: v for k, v in c.items() if k not in ('at', 'to')}, at=round(resolve(c['at'], L_, dd), 3), **({'to': round(resolve(c['to'], L_, dd), 3)} if 'to' in c else {})) for c in s.get('cues', [])]
    shots.append(sh); t += sh['d']
TOTAL = round(t, 3)
L = L[: int((TOTAL + 3) * SR)]; Rr = Rr[: len(L)]
NT = len(L); tt = np.arange(NT) / SR
def C(sh, k): return [c for c in sh['cues'] if c['k'] == k]
def S(name): return next(s for s in shots if s['shot'] == name)

# ---------------- the facts: when each is read, and by whom ----------------
fl = S('flood'); fc = C(fl, 'facts')[0]; facts = []; tf = fc['at']; i = 0
while tf < fc['to'] - 1.0:
    k = i % len(FACTS); v = FACT_VOICES[(i * 7) % len(FACT_VOICES)]
    a = speak(FACTS[k], v, 1.06 + 0.08 * min(1, i / 20))
    d = len(a) / SR
    facts.append(dict(i=k, t0=round(tf, 3), t1=round(tf + d, 3), pan=round(float(np.sin(i * 2.4) * min(0.9, i * 0.08)), 2), v=v, _a=a))
    tf += d * max(0.12, 1.05 - i * 0.075); i += 1
fl['facts'] = facts

# ---------------- instruments ----------------
SCALE = [62, 64, 65, 67, 69, 72, 74, 76, 77, 79, 81, 84]
def meaning(f, d=0.5):
    """the tone of a configuration that means something"""
    n = int(d * SR); tk = np.arange(n) / SR
    s = np.sin(2 * np.pi * f * tk) + 0.3 * np.sin(2 * np.pi * 2 * f * tk) * np.exp(-tk / 0.08) + 0.1 * np.sin(2 * np.pi * 3 * f * tk)
    return s * np.minimum(1, tk / 0.004) * np.exp(-tk / (d / 4)) * 0.5
def steelhit(f=700, d=0.8):
    n = int(d * SR); tk = np.arange(n) / SR; s = np.zeros(n)
    for r, a, dd in [(1, 1, 0.4), (2.76, 0.5, 0.2), (5.4, 0.3, 0.1), (8.9, 0.15, 0.05)]: s += a * np.sin(2 * np.pi * f * r * tk) * np.exp(-tk / dd)
    return s * 0.4
def slide(d=1.2):
    n = int(d * SR); tk = np.arange(n) / SR; e = np.sin(np.pi * tk / d) ** 1.5
    return filt(noise(n), 'bandpass', [1200, 6000]) * e * (0.7 + 0.3 * filt(noise(n), 'lowpass', 30) * 4)
def telegraph(t0, t1, rate, gain, pan=0.3, tone_rate=0.0, tone_gain=0.0):
    """the diamond pen: clicks at `rate` per second (a function of time), and meaning tones"""
    tcur = t0
    while tcur < t1:
        r = rate(tcur); put(tcur, click(rng.uniform(3000, 5200), 0.003), gain * rng.uniform(0.6, 1), pan + rng.uniform(-0.1, 0.1))
        if tone_rate and rng.random() < tone_rate(tcur) / r: put(tcur, meaning(mnote(rng.choice(SCALE)), rng.uniform(0.25, 0.6)), tone_gain(tcur) if callable(tone_gain) else tone_gain, rng.uniform(-0.9, 0.9))
        tcur += rng.exponential(1 / r)
def gas(t0, t1, gain, pan=0):
    """air: random clicks, a few hundred a second, soft"""
    n = int((t1 - t0) * SR); sig = (rng.random(n) > 0.994) * rng.uniform(-1, 1, n); sig = filt(sig, 'bandpass', [1500, 9000])
    put(t0, sig, gain, pan)

# ---------------- beds and effects ----------------
for sh in shots:
    t0, d, name = sh['t0'], sh['d'], sh['shot']; n = int(d * SR); tl = np.arange(n) / SR; Ls = sh['lines']
    fade = np.minimum(1, np.minimum(tl / 0.4, (d - tl) / 0.4)).clip(0, 1)
    rm = ROOM.get(sh['room'] or 'shop', (0.6, 0.1))
    if PANEL(name) and name != 'book': put(t0, slide(1.3), 0.12, 0.0)  # the tape slides to the next panel
    if name == 'book':
        put(t0, filt(brown(n), 'lowpass', 200) * fade, 0.04)
        for j in range(int(d)): put(t0 + 0.5 + j, mx(click(2400, 0.005), ping(1500, 0.08) * 0.3), 0.05, -0.6)  # a clock
        pg = C(sh, 'page')[0]
        for j in range(3): k = int(0.35 * SR); put(t0 + pg['at'] + j * 0.12, filt(noise(k), 'bandpass', [1500, 6000]) * np.sin(np.pi * np.arange(k) / k) ** 3, 0.25, -0.2)
        k = int(5 * SR); tk = np.arange(k) / SR; put(t0 + pg['at'] + 0.4, filt(brown(k), 'lowpass', 120) * np.sin(np.pi * tk / 5) + np.sin(2 * np.pi * 41 * tk) * np.sin(np.pi * tk / 5) * 0.3, 0.2, 0)
    if name == 'title':
        telegraph(t0 + 0.4, t0 + d - 0.6, lambda x: 40, 0.12, 0.2, lambda x: 4, 0.15)
    if name == 'wastes':
        for j in range(int(d * 5)): put(t0 + rng.uniform(0, d), mx(steelhit(rng.uniform(250, 1400), rng.uniform(0.3, 0.9)), thock(rng.uniform(60, 200), 0.06)), rng.uniform(0.03, 0.09), rng.uniform(-0.9, 0.9))
        put(t0, filt(brown(n), 'lowpass', 90) * fade, 0.1)
        sd_ = C(sh, 'sand')[0]['at']; k = n - int(sd_ * SR); put(t0 + sd_, filt((rng.random(k) > 0.985) * rng.uniform(-1, 1, k), 'highpass', 3000) * np.minimum(1, np.arange(k) / SR / 2), 0.25, 0.2)
        lu = C(sh, 'lurch')[0]['at']; k = int(1.6 * SR); tk = np.arange(k) / SR
        put(t0 + lu, filt(noise(k), 'bandpass', [200, 1500]) * np.sin(np.pi * tk / 1.6) ** 2, 0.25, 0)
        for j in range(12): put(t0 + lu + 0.4 + rng.uniform(0, 1.2), mx(steelhit(rng.uniform(600, 2200), 0.5), thock(rng.uniform(100, 300), 0.05)), 0.15, rng.uniform(-0.8, 0.8))  # pots and pans
        cr = C(sh, 'crunch')[0]['at']; put(t0 + cr, mx(thock(45, 0.6), filt(noise(int(0.8 * SR)), 'lowpass', 400) * env_decay(int(0.8 * SR), 0.2)), 0.8, 0)
        bg = C(sh, 'bang')[0]
        for j in range(int((bg['to'] - bg['at']) / 0.55) + 1): putv(t0 + bg['at'] + j * 0.55, mx(thock(55, 0.4), steelhit(180, 1.2), filt(noise(int(0.2 * SR)), 'lowpass', 800) * env_decay(int(0.2 * SR), 0.05)), 1.0, 0.25, 0.7, -0.2)
    if name in ('face', 'paw', 'gold'):
        put(t0, filt(brown(n), 'lowpass', 120) * fade, 0.05)
        for j in range(int(d * 0.6)): put(t0 + rng.uniform(0, d), mx(steelhit(rng.uniform(200, 900), 0.6), thock(80, 0.05)), 0.04, rng.uniform(-0.9, 0.9))  # the junk outside
    if name == 'face':
        hc = C(sh, 'hatch')[0]['at']; k = int(1.4 * SR); tk = np.arange(k) / SR
        put(t0 + hc, mx(filt(noise(k), 'bandpass', [400, 3000]) * np.exp(-tk / 0.4) * 0.5, steelhit(300, 1.4)), 0.4, 0.3)
        for j in range(int(d * 3)): put(t0 + 2 + rng.uniform(0, d - 2), click(rng.uniform(800, 1600), 0.01), 0.05, rng.uniform(-0.5, 0.5))  # the eyes, darting
        k = n; put(t0, filt(brown(k), 'lowpass', 70) * (0.5 + 0.5 * np.sin(2 * np.pi * 0.18 * tl)) * fade, 0.12, 0.1)  # its breathing
        wh = C(sh, 'whistle')[0]; D = wh['to'] - wh['at']; k = int(D * SR); tk = np.arange(k) / SR
        f = 2600 + 400 * np.sin(np.pi * tk / D) + 30 * np.sin(2 * np.pi * 6 * tk); ph = 2 * np.pi * np.cumsum(f) / SR
        w = (np.sin(ph) + 0.2 * np.sin(2 * ph) + filt(noise(k), 'bandpass', [2000, 5000]) * 0.15) * np.minimum(1, tk / 0.1) * np.minimum(1, (D - tk) / 0.3)
        put(t0 + wh['at'], w, 0.42, 0)
        k = int(4 * SR); tk = np.arange(k) / SR; put(t0 + wh['to'], np.sin(2 * np.pi * 6200 * tk) * np.exp(-tk / 1.5), 0.02, -0.3)  # ears ringing
    if name == 'paw':
        pw = C(sh, 'paw')[0]
        for j in range(26): put(t0 + pw['at'] + rng.uniform(0, pw['to'] - pw['at']), mx(steelhit(rng.uniform(300, 2600), rng.uniform(0.3, 0.8)), thock(rng.uniform(60, 220), 0.08), filt(noise(int(0.12 * SR)), 'lowpass', 1800) * env_decay(int(0.12 * SR), 0.03)), rng.uniform(0.1, 0.3), rng.uniform(-0.9, 0.9))
        k = int((pw['to'] - pw['at']) * SR); put(t0 + pw['at'], filt(noise(k), 'bandpass', [150, 900]) * (0.5 + 0.5 * np.sin(2 * np.pi * 1.3 * np.arange(k) / SR)), 0.1, 0.2)
        pk = C(sh, 'poker')[0]
        for j in range(4): put(t0 + pk['at'] + j * 0.42, mx(steelhit(1100, 0.6), thock(150, 0.04)), 0.45, 0.1)
        put(t0 + pk['at'] + 1.9, speak('Ow!', 'am_onyx', 0.8), 0.4, 0.3)
        put(t0, filt(brown(n), 'lowpass', 60) * fade, 0.06)  # the reactor
    if name == 'gold':
        kn = C(sh, 'knead')[0]
        telegraph(t0 + kn['at'], t0 + kn['to'], lambda x: 30 + 120 * (x - t0 - kn['at']) / (kn['to'] - kn['at']), 0.1, -0.3)
        put(t0 + C(sh, 'nugget')[0]['at'], mx(bell(mnote(76), 4), bell(mnote(83), 3) * 0.5), 0.3, -0.2)
    if name in ('cellar', 'barrel', 'flood', 'today'):
        put(t0, filt(brown(n), 'lowpass', 100) * fade, 0.06)
        for j in range(int(d * 0.4)): put(t0 + rng.uniform(0, d), ping(rng.uniform(900, 1500), 0.12), 0.04, rng.uniform(-0.8, 0.8))  # drips
    if name == 'cellar':
        wk = C(sh, 'walk')[0]
        for j in range(int((wk['to'] - wk['at']) / 1.1)): putv(t0 + wk['at'] + 0.6 + j * 1.1, mx(thock(50, 0.3), filt(noise(int(0.5 * SR)), 'bandpass', [300, 2500]) * env_decay(int(0.5 * SR), 0.15) * 0.4), 2.0, 0.3, 0.4, 0.2)  # creaking giant steps
        for j in range(5): put(t0 + 14 + j * 0.25, steelhit(1800 + 200 * j, 0.4), 0.05, -0.5)  # the chain
        g = C(sh, 'gas')[0]; gas(t0 + g['at'], t0 + g['to'], 0.35, 0)
        for c in C(sh, 'form'):
            for j, m in enumerate([62, 69, 74]): put(t0 + c['at'] + j * 0.05, meaning(mnote(m), 1.0), 0.18, rng.uniform(-0.5, 0.5))
        pc = C(sh, 'pounce')[0]['at']; put(t0 + pc, mx(meaning(mnote(81), 0.8), click(5000, 0.004)), 0.25, 0.2)
        k = int(0.3 * SR); put(t0 + pc + 0.1, filt(noise(k), 'bandpass', [3000, 8000]) * np.hanning(k), 0.08, 0.2)
    if name == 'barrel':
        b = C(sh, 'barrel')[0]['at']; putv(t0 + b + 1.0, mx(thock(70, 0.3), steelhit(240, 1.6)), 2.0, 0.3, 0.5, -0.2)
        for j in range(3): put(t0 + b + 3.4 + j * 0.3, steelhit(2400, 0.2), 0.1, -0.2)  # the pinhole
        put(t0 + C(sh, 'demon')[0]['at'], mx(click(6000, 0.003), ping(4800, 0.1)), 0.15, 0)
        pn = C(sh, 'pen')[0]; telegraph(t0 + pn['at'], t0 + pn['to'], lambda x: 60, 0.12, 0.1, lambda x: 2.5, 0.12)
        gas(t0 + pn['at'] - 2, t0 + d, 0.15)
    if name == 'escape':
        put(t0, filt(brown(n), 'lowpass', 90) * fade, 0.08)
        for j, c in enumerate(C(sh, 'pull')):
            k = int(0.9 * SR); tk = np.arange(k) / SR; put(t0 + c['at'], mx(filt(noise(k), 'bandpass', [80, 400]) * np.sin(np.pi * tk / 0.9), steelhit(140 + 30 * j, 0.6) * 0.5), 0.3 + 0.1 * j, -0.2)
        la = C(sh, 'launch')[0]['at']; k = int(4 * SR); tk = np.arange(k) / SR
        put(t0 + la, filt(noise(k), 'lowpass', 900) * np.exp(-tk / 1.2) + np.sin(2 * np.pi * np.cumsum(80 + 200 * tk) / SR) * np.exp(-tk / 1.0) * 0.4, 0.45, 0.4)
        telegraph(t0, t0 + d, lambda x: 80, 0.03, -0.7, lambda x: 3, 0.04)  # the pen, far away below
    if name == 'flood':
        T0 = t0
        telegraph(t0, t0 + d, lambda x: 80 + 900 * min(1, (x - T0) / 36) ** 2, 0.1, 0.1, lambda x: 2 + 40 * min(1, (x - T0) / 36) ** 2, lambda x: 0.12 * (1 - 0.6 * min(1, (x - T0) / 36)))
        gas(t0, t0 + d, 0.12)
        k = n; put(t0, filt(noise(k), 'bandpass', [600, 5000]) * (tl / d) ** 2 * fade, 0.12, 0)  # paper piling up
        for j in range(int(d * 2)): put(t0 + d * (j / (d * 2)) ** 0.7, filt(noise(int(0.3 * SR)), 'bandpass', [1500, 6000]) * np.hanning(int(0.3 * SR)), 0.05 + 0.1 * j / (d * 2), rng.uniform(-0.9, 0.9))
        # a held cluster that grows from the tones
        cl = sum(np.sin(2 * np.pi * mnote(m) * tl * (1 + 0.001 * k)) for k, m in enumerate([62, 69, 74, 76, 81])) / 5
        put(t0, cl * (tl / d) ** 2.4 * fade, 0.12, 0)
        # the facts, ducked under the narrator and Pugg
        duck = np.ones(n)
        for ln in sh['lines']:
            a_, b_ = int((ln['t0'] - 0.3) * SR), int((ln['t1'] + 0.3) * SR); duck[max(0, a_):b_] = 0.3
        duck = filt(duck, 'lowpass', 6)
        for fct in sh['facts']:
            a = fct['_a']; i0 = int(fct['t0'] * SR); g = duck[i0: i0 + len(a)]; a = a[: len(g)] * g
            if abs(fct['pan']) > 0.5: a = filt(a, 'lowpass', 3000)
            putv(t0 + fct['t0'], a, 1.6, 0.25, 0.5, fct['pan'])
    if name == 'today':
        T0 = t0
        telegraph(t0, t0 + d, lambda x: 400, 0.06, 0.0, lambda x: 10, 0.04)
        gas(t0, t0 + d, 0.08)
        k = n; put(t0, filt(noise(k), 'bandpass', [600, 5000]) * fade, 0.04, 0)
        for j in range(12):  # the facts go on, far off
            fct = FACTS[(j * 5) % len(FACTS)]; a = filt(speak(fct, FACT_VOICES[(j * 3) % len(FACT_VOICES)], 1.1), 'lowpass', 1800)
            putv(t0 + 0.4 + j * 2.6, a, 2.2, 0.5, 0.12 * (1 - j / 14), np.sin(j * 1.7) * 0.8)
        for tn, m in motif_times(t0 + Ls[-1]['t1'] + 0.6, 0.4)[0][:7]: putv(tn, meaning(mnote(m - 2), 1.2), 2.2, 0.3, 0.18, 0)
    if name == 'end':
        telegraph(t0, t0 + d - 1.5, lambda x: 60 * max(0.05, 1 - (x - t0) / (d - 1.5)), 0.05, 0.0)

# ---------------- voices ----------------
for sh in shots:
    rt, wt = ROOM.get(sh['room'] or 'shop', (0.5, 0.1))
    for ln in sh['lines']:
        a = ln.pop('_a'); who = ln['who']; T0 = sh['t0'] + ln['t0']
        if who == 'N': put(T0, a, 0.8, 0)
        elif who == 'P': putv(T0, a, max(rt, 1.2), max(wt, 0.22), 1.0, PAN['P'])
        else: putv(T0, a, rt, wt, 0.95, PAN.get(who, 0))
for f_ in fl['facts']: f_.pop('_a')

mix = np.stack([L, Rr], 1); mix /= np.abs(mix).max() + 1e-9; mix *= 0.89
raw = os.path.join(HERE, 'audio', 'ps.wav')
with wave.open(raw, 'wb') as f:
    f.setnchannels(2); f.setsampwidth(2); f.setframerate(SR); f.writeframes((mix * 32767).astype(np.int16).tobytes())
subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', raw, '-af', 'loudnorm=I=-16:TP=-1.5:LRA=14', '-ar', '48000', '-c:a', 'aac', '-b:a', '192k', os.path.join(HERE, 'audio', 'ps.m4a')], check=True)
os.remove(raw)
json.dump(dict(shots=shots, dur=TOTAL, cast=CAST, facts=FACTS), open(os.path.join(HERE, 'timing', 'ps.json'), 'w'))
print('sixth sally', TOTAL, 's,', len(shots), 'shots,', len(fl['facts']), 'facts read')
for sh in shots: print(f"  {sh['shot']:8s} {sh['t0']:7.2f} {sh['d']:6.2f}", ' | '.join(f"{l['who']}@{l['t0']:.1f}-{l['t1']:.1f}" for l in sh['lines']), '|', ' '.join(f"{c['k']}@{c['at']:.1f}" for c in sh['cues']))
