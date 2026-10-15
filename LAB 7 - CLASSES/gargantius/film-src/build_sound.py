"""Voices, sound and music for The First Sally, or The Trap of Gargantius.
   python3 build_sound.py  ->  timing/gg.json and audio/gg.m4a
   Voices: Kokoro (kokoro-onnx), model files in $KOKORO_DIR (default ~/kokoro).
   Everything else is synthesized here, timed from the same score the picture reads.
   The device is the graph: every connection made is a click, pitched by how many nodes
   are already in the network, so the clicks climb a scale as the ranks close."""
import hashlib, json, os, re, subprocess, wave
import numpy as np
from scipy.signal import butter, sosfilt, fftconvolve, resample_poly

HERE = os.path.dirname(os.path.abspath(__file__))
KDIR = os.environ.get('KOKORO_DIR', os.path.expanduser('~/kokoro'))
SR = 48000
rng = np.random.default_rng(11)
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
    pos = np.cumsum(rate); pos = pos[pos < len(x) - 1]
    i = pos.astype(int); f = pos - i
    return x[i] * (1 - f) + x[i + 1] * f
def repitch(x, ratio):
    """change pitch and speed together by ratio (>1 higher)"""
    if abs(ratio - 1) < 1e-3: return x
    r = int(round(ratio * 1000)); return resample_poly(x, 1000, r)

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
    """a stereo signal through the room"""
    l = np.concatenate([stl[0], np.zeros(int(rt * SR))]); r = np.concatenate([stl[1], np.zeros(int(rt * SR))])
    vl, vr = verb(l, rt, wet)[0], verb(r, rt, wet)[1]; put(t, None, gain, 0.0, st=(vl, vr))

def mx(*xs):
    n = max(len(x) for x in xs); o = np.zeros(n)
    for x in xs: o[:len(x)] += x
    return o

# ---------------- many voices: the units, the citizens ----------------
def many(text, voices, conv, seed=0):
    """Several Kokoro voices say the same words. With conv=True the voices start staggered and out of
    tune and close in on each other, phrase by phrase, until the last phrase is a unison.
    Returns (stereo, phrase start times, per-phrase per-voice offsets in seconds)."""
    r = np.random.default_rng(100 + seed)
    phrases = [p for p in re.split(r'(?<=[.!?])\s+', text.strip()) if p]
    K, V = len(phrases), len(voices)
    base = [r.uniform(0, 1, V) for _ in range(K)]; det = [r.uniform(-1, 1, V) for _ in range(K)]
    pan = np.linspace(-0.8, 0.8, V); r.shuffle(pan)
    clips = [[speak(ph, v, 0.95) for ph in phrases] for v in voices]
    starts, offs, t = [], [], 0.0
    for k in range(K):
        spread = (K - 1 - k) / max(1, K - 1) if conv else 0.0
        o = base[k] * 0.9 * spread + (0.0 if conv else base[k] * 0.03)
        d = 1 + det[k] * 0.07 * spread
        longest = max(len(clips[v][k]) / SR / d[v] + o[v] for v in range(V))
        starts.append(t); offs.append([round(float(x), 3) for x in o])
        clips_k = [repitch(clips[v][k], d[v]) for v in range(V)]
        for v in range(V): clips[v][k] = (clips_k[v], o[v])
        t += longest + 0.22
    n = int((t + 0.5) * SR); Lc = np.zeros(n); Rc = np.zeros(n)
    for k in range(K):
        for v in range(V):
            a, o = clips[v][k]; i = int((starts[k] + o) * SR)
            w = 1.0 if not conv or k < K - 1 else (1.0 if v == 0 else 0.35)
            gl, gr = np.sqrt((1 - pan[v]) / 2) * 1.414, np.sqrt((1 + pan[v]) / 2) * 1.414
            m = min(len(a), n - i); Lc[i:i + m] += a[:m] * gl * w / np.sqrt(V) * 1.6; Rc[i:i + m] += a[:m] * gr * w / np.sqrt(V) * 1.6
    nz = np.nonzero(np.abs(Lc) + np.abs(Rc) > 0.01)[0]; end = nz[-1] + int(0.1 * SR)
    return (Lc[:end], Rc[:end]), [round(s, 3) for s in starts], offs

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
        c = CAST[ln['who']]; sp = c['speed'] * (0.94 if ln.get('line') else 1.0)
        extra = {}
        if 'many' in c:
            conv = bool((ln.get('many') or {}).get('conv'))
            stl, phr, offs = many(ln['say'], c['many'], conv, seed=len(shots) * 10 + len(sh['lines']))
            a = stl; d = len(stl[0]) / SR
            extra = dict(phr=phr, offs=offs, nv=len(c['many']), conv=conv)
            mono = (stl[0] + stl[1]) / 2
        else:
            a = speak(ln['say'], c['voice'], sp)
            if c.get('fx') == 'child': a = repitch(a, 1.3)
            d = len(a) / SR; mono = a
        st = ln['at'] if 'at' in ln else cur + ln.get('pre', 0.6)
        hop = SR // 24; envl = [float(np.sqrt(np.mean(mono[i:i + hop] ** 2))) for i in range(0, len(mono), hop)]
        emax = max(envl) or 1; envl = [round(min(1, (v / emax) ** 0.7), 2) for v in envl]
        sh['lines'].append(dict(who=ln['who'], say=ln['say'], t0=round(st, 3), t1=round(st + d, 3), line=bool(ln.get('line')), env=envl, _a=a, **extra))
        cur = st + d
    sh['d'] = round(s['d'] if 'd' in s else cur + s.get('tail', 1.5), 3)
    L_ = sh['lines']; dd = sh['d']
    sh['cues'] = [dict({k: v for k, v in c.items() if k not in ('at', 'to')}, at=round(resolve(c['at'], L_, dd), 3), **({'to': round(resolve(c['to'], L_, dd), 3)} if 'to' in c else {})) for c in s.get('cues', [])]
    sh['curve'] = {k: [[round(resolve(a, L_, dd), 3), p] for a, p in v] for k, v in s.get('curve', {}).items()}
    shots.append(sh); t += sh['d']
TOTAL = round(t, 3)
if os.environ.get('TIMING_ONLY'):
    for sh in shots:
        print(f"{sh['shot']:9s} t0={sh['t0']:7.2f} d={sh['d']:6.2f} lines_end={sh['lines'][-1]['t1'] if sh['lines'] else 0:6.2f}")
    print('total', TOTAL, f'{int(TOTAL // 60)}:{TOTAL % 60:04.1f}')
    for sh in shots:
        for l in sh['lines']: l.pop('_a')
    json.dump(dict(shots=shots, dur=TOTAL, cast=CAST), open(os.path.join(HERE, 'timing', 'gg.json'), 'w'))
    raise SystemExit

# ---------------- synthesized sound ----------------
PEN = [0, 2, 4, 7, 9]
def tt(d): return np.arange(int(d * SR)) / SR
def pluck(f, d=0.5, bright=1.0):
    t = tt(d); e = np.exp(-t / (d / 4.5))
    x = np.sin(2 * np.pi * f * t) * e + 0.28 * bright * np.sin(2 * np.pi * 2 * f * t) * np.exp(-t / (d / 9)) + 0.12 * bright * np.sin(2 * np.pi * 3 * f * t) * np.exp(-t / (d / 14))
    k = int(0.004 * SR); x[:k] += noise(k) * 0.25 * np.linspace(1, 0, k)
    x[:int(0.001 * SR)] *= np.linspace(0, 1, int(0.001 * SR)); return x * 0.5
def click_idx(idx, d=0.24):
    idx = max(0, int(round(idx))); semis = 12 * (idx // 5) + PEN[idx % 5]
    return pluck(min(3200.0, 330 * 2 ** (semis / 12)), d)
def click_n(n, d=0.24): return click_idx(min(n - 1, 26), d)
def thud(f=60, d=0.35, g=1.0):
    t = tt(d); ph = 2 * np.pi * np.cumsum(f * (1 + 0.9 * np.exp(-t / 0.03))) / SR
    return (np.sin(ph) * np.exp(-t / (d / 4)) + 0.25 * filt(noise(len(t)), 'lowpass', 400) * np.exp(-t / 0.05)) * g
def noiseb(d, lo, hi, tau, atk=0.01):
    t = tt(d); x = filt(filt(noise(len(t)), 'highpass', lo), 'lowpass', hi) * np.exp(-t / tau)
    k = int(atk * SR); x[:k] *= np.linspace(0, 1, k); return x
def swell(d, lo, hi, g=0.5):
    t = tt(d); x = filt(filt(noise(len(t)), 'highpass', lo), 'lowpass', hi) * np.sin(np.pi * t / d) ** 2; return x * g
def brass(f, d, g=0.5):
    t = tt(d); vib = 1 + 0.004 * np.sin(2 * np.pi * 5.5 * t) * np.minimum(1, t / 0.3)
    ph = 2 * np.pi * np.cumsum(f * vib) / SR
    x = sum(np.sin(h * ph) / h ** 0.8 for h in range(1, 9))
    e = np.minimum(1, t / 0.05) * np.minimum(1, (d - t) / 0.08).clip(0)
    return filt(x, 'lowpass', 3200) * e * g * 0.35
def padchord(freqs, d, amp=0.1, fi=1.0, fo=1.0):
    t = tt(d); x = np.zeros(len(t))
    for i, f in enumerate(freqs):
        for dt in (-0.4, 0.4):
            x += np.sin(2 * np.pi * (f + dt * (1 + i * 0.3)) * t + i) * (0.6 + 0.4 * np.sin(2 * np.pi * 0.07 * (i + 1) * t))
    e = np.minimum(1, t / fi) * np.minimum(1, (d - t) / fo).clip(0)
    return x / len(freqs) * amp * e
def snare(g=1.0): return mx(noiseb(0.14, 1500, 7000, 0.035), 0.35 * thud(190, 0.1)) * g
def coin(): return mx(pluck(3100, 0.25, 0.6) * 0.4, pluck(4300, 0.2, 0.3) * 0.25)
def wind(d, g=0.05):
    t = tt(d); x = filt(noise(len(t)), 'bandpass', [180, 900]) if False else filt(filt(noise(len(t)), 'highpass', 150), 'lowpass', 800)
    return x * (0.6 + 0.4 * np.sin(2 * np.pi * 0.09 * t + 1)) * g
def rumble(d, g=0.4):
    t = tt(d); return filt(brown(len(t)), 'lowpass', 160) * g * (0.8 + 0.2 * np.sin(2 * np.pi * 0.4 * t))
def crickets(d, g=0.03):
    t = tt(d); x = filt(noise(len(t)), 'bandpass', [3800, 4600]) if False else filt(filt(noise(len(t)), 'highpass', 3800), 'lowpass', 4800)
    return x * (np.sin(2 * np.pi * 7 * t) > 0.6) * (np.sin(2 * np.pi * 0.3 * t) > -0.3) * g

ROOM = {'ship': (0.5, 0.10), 'court': (1.0, 0.18), 'hall': (1.5, 0.26), 'field': (0.9, 0.14), 'open': (1.8, 0.12), None: (1.2, 0.18)}
PAN = {'N': 0.0, 'T': -0.25, 'K': 0.25, 'F': 0.35, 'C': -0.1, 'S': 0.1}
BEDROOT = {'landing': 55.0, 'atrocia': 49.0, 'ferocia': 65.4, 'audience': 55.0, 'platoon': 73.4, 'minds': 61.7}

def eadd(El, Er, t, sig, g=1.0, pan=0.0):
    i = int(t * SR)
    if i < 0: sig = sig[-i:]; i = 0
    n = min(len(sig), len(El) - i)
    if n <= 0: return
    El[i:i + n] += sig[:n] * g * np.sqrt((1 - pan) / 2) * 1.414; Er[i:i + n] += sig[:n] * g * np.sqrt((1 + pan) / 2) * 1.414

def cue_to(c, dflt): return c.get('to', c['at'] + dflt)

def design(sh):
    d = sh['d']; name = sh['shot']; rt, wet = ROOM.get(sh['room'], ROOM[None])
    n = int((d + 1.0) * SR); El = np.zeros(n); Er = np.zeros(n)
    E = lambda t, sig, g=1.0, pan=0.0: eadd(El, Er, t, sig, g, pan)
    cues = sh['cues']; C = lambda k: [c for c in cues if c['k'] == k]
    one = lambda k: C(k)[0]
    # beds
    if name in BEDROOT:
        r = BEDROOT[name]; E(0, padchord([r, r * 1.5, r * 2, r * 2.52], d + 0.5, 0.08, 1.5, 1.5), 1.0)
        E(0, wind(d + 0.5, 0.035), 1.0)
    if name == 'landing':
        E(0, rumble(d, 0.5), 1.0)
        c = one('ship'); E(c['at'], swell(cue_to(c, 6) - c['at'], 80, 1400, 0.25))
        c = one('cabin'); E(c['at'], thud(90, 0.3, 0.35))
        c = one('radio'); dd = cue_to(c, 2) - c['at']; t = tt(dd)
        E(c['at'], noiseb(dd, 800, 5000, 9) * (rng.random(len(t)) > 0.4) * 0.25 * np.minimum(1, (dd - t) / 0.3), 1.0, 0.4)
        c = one('box'); E(c['at'], noiseb(0.4, 200, 900, 0.1) * 0.6)
        E(one('link')['at'], click_n(2), 0.9)
        c = one('pink'); E(c['at'], pluck(523, 1.4), 0.8); E(c['at'] + 0.15, pluck(659, 1.4), 0.6)
        E(one('ground')['at'], thud(70, 0.4, 0.5))
        c = one('shake'); E(c['at'], thud(110, 0.15, 0.3)); E(c['at'] + 0.28, thud(110, 0.15, 0.3))
        c = one('part'); E(c['at'], click_idx(3), 0.6); E(c['at'] + 1.0, click_idx(5), 0.5)
    if name == 'atrocia':
        c = one('axe'); E(c['at'], thud(60, 0.3, 0.6)); E(c['at'], noiseb(0.08, 2000, 8000, 0.02), 0.4)
        for k, c in enumerate(C('coin')):
            for j in range(int((cue_to(c, 8) - c['at']) / 0.45)): E(c['at'] + j * 0.45 + rng.uniform(0, 0.1), coin(), 0.45, rng.uniform(-0.5, 0.5))
        c = one('graph')
        for j in range(5): E(c['at'] + 0.5 + j * 0.9, click_idx(j + 1), 0.4)
        c = one('cell'); E(c['at'], thud(80, 0.5, 0.25))
        c = one('pink'); E(c['at'], pluck(523, 1.5), 0.8); E(c['at'] + 0.15, pluck(659, 1.5), 0.6)
        E(one('link')['at'], click_n(2), 0.9)
    if name == 'ferocia':
        c = one('parade'); cr = one('crowd')['at']
        for j in range(int((cr + 2 - c['at']) / 0.5)): E(c['at'] + j * 0.5, snare(0.4 if j % 2 else 0.25), 0.7, -0.2)
        for j in range(3): E(c['at'] + 0.5 + j * 1.5, brass([196, 262, 330][j], 0.9, 0.35), 0.6, 0.3)
        c = one('cheer'); E(c['at'], swell(cue_to(c, 3) - c['at'], 400, 3500, 0.5))
        E(one('house')['at'], thud(75, 0.4, 0.3))
        c = one('reveal'); E(c['at'], pluck(180, 1.0, 1.4), 0.6); E(c['at'], pluck(190, 1.0, 1.4), 0.4)
        E(one('jail')['at'], thud(55, 0.5, 0.5)); E(one('jail')['at'], pluck(900, 0.5, 0.2), 0.3)
        c = one('block'); E(c['at'], thud(60, 0.35, 0.8)); E(c['at'], noiseb(0.1, 2500, 9000, 0.02), 0.5)
        E(one('acquit')['at'], pluck(392, 1.3), 0.5)
        c = one('bugle')
        for j, f in enumerate([392, 523, 659]): E(c['at'] + j * 0.28, brass(f, 0.36 if j < 2 else 1.0, 0.5), 0.8, 0.2)
    if name == 'audience':
        E(one('throne')['at'] + 0.5, thud(70, 0.4, 0.3))
        for c in C('link'):
            if c.get('g') == 'mesh': E(c['at'], click_idx(c['n'] - 1), 0.7, np.sin(c['n']) * 0.6)
            else: E(c['at'], click_n(c['n']), 0.8, 0.3)
        for i, c in enumerate(C('rung')): E(c['at'], pluck(262 * 2 ** (i * 7 / 12), 1.3), 0.7)
        c = one('self'); E(c['at'], padchord([220, 233, 330], cue_to(c, 4) - c['at'], 0.12, 0.8, 1.2), 1.0)
        E(one('return')['at'], pluck(196, 1.2), 0.5)
    if name == 'platoon':
        for c in C('link'): E(c['at'], click_n(c['n']), 0.85, 0.0)
        c = one('drill')
        for j in range(int((one('charge')['at'] - c['at']) / 0.6)): E(c['at'] + j * 0.6, snare(0.3), 0.6)
        c = one('charge'); dd = one('clash')['at'] - c['at']; E(c['at'], swell(dd, 150, 3000, 0.6))
        for j in range(int(dd / 0.22)): E(c['at'] + j * 0.22, thud(80, 0.2, 0.3), 0.7)
        c = one('clash'); E(c['at'], noiseb(1.2, 500, 8000, 0.25), 0.7); E(c['at'], thud(55, 0.8, 0.9))
        for c in C('row'): E(c['at'], click_idx(c['n'] * 0.26), 0.6, np.sin(c['n']) * 0.6)
        c = one('cart'); E(c['at'], noiseb(1.6, 300, 2500, 1.0) * 0.5, 1.0)
        E(one('ship')['at'], pluck(330, 1.0), 0.4)
    if name == 'minds':
        c = one('barracks'); E(c['at'], crickets(10, 0.05), 1.0)
        c = one('sap'); E(c['at'] + 1.0, click_idx(4), 0.5)
        c = one('cut'); E(c['at'], noiseb(0.05, 3000, 9000, 0.01), 0.6); E(c['at'], pluck(180, 0.5), 0.4)
        E(one('navel')['at'], pluck(294, 1.2), 0.4)
        E(one('taste')['at'], pluck(349, 1.2), 0.4)
        E(one('guns')['at'], thud(60, 0.4, 0.8)); E(one('paint')['at'], noiseb(0.6, 1500, 6000, 0.3) * 0.2)
        c = one('moto')
        for j in range(26): E(c['at'] + j * 0.2, thud(95, 0.12, 0.25), 0.6, -0.3)
        E(one('sonnet')['at'], pluck(392, 1.4), 0.4)
        for c in C('join'): E(c['at'], click_n(c['n'] + 1), 0.9, -0.3)
        E(one('prince')['at'], brass(262, 0.5, 0.3), 0.6, 0.3)
        c = one('trap'); E(c['at'], rumble(5.0, 0.8) * np.minimum(1, tt(5.0) / 3), 1.0); E(c['at'] + 3.8, thud(48, 1.2, 1.0))
    return El, Er, rt, wet

def field_design(sh):
    d = sh['d']; rt, wet = ROOM['open']
    n = int((d + 1.0) * SR); El = np.zeros(n); Er = np.zeros(n)
    E = lambda t, sig, g=1.0, pan=0.0: eadd(El, Er, t, sig, g, pan)
    bed = wind(d, 0.06) + rumble(d, 0.12)
    tm = tt(d); gate = np.ones(len(tm))
    gate = np.where(tm < 9.6, 1.0, np.where(tm < 10.0, 1 - (tm - 9.6) / 0.4, np.where(tm < 16.5, 0.0, np.minimum(1, (tm - 16.5) / 1.0))))
    El += np.pad(bed * gate, (0, n - len(bed))) * 0.7; Er += np.pad(bed * gate, (0, n - len(bed))) * 0.7
    dry = []   # sounds that must not leak into the hush
    # buglers from both sides
    for side, pan, fr in ((-1, -0.6, [392, 523, 659, 784]), (1, 0.6, [370, 494, 622, 740])):
        for j, f in enumerate(fr): E(3.55 + j * 0.35, brass(f * (1 if side < 0 else 1.0), 0.42 if j < 3 else 1.1, 0.5), 0.8, pan)
    # arrival ticks: each soldier takes its place
    for i in range(84): E(5.55 + 0.035 * i, click_idx((i // 2) * 24 / 42, 0.1), 0.14, -0.55 if i % 2 == 0 else 0.55)
    # closing ranks into two giants
    for k in range(42): E(8.0 + 0.9 * k / 41, click_idx(k * 24 / 41), 0.45, np.sin(k) * 0.4)
    E(8.95, thud(50, 1.0, 0.8)); E(8.95, thud(52, 1.0, 0.8), 1.0, 0.3)
    # real silence 10.0 - 16.5, with only a faint sustained chord
    E(10.0, padchord([110, 164.8, 220, 277.2], 6.5, 0.05, 0.9, 1.0), 1.0)
    # first handshake of the giants: all 84 nodes linked
    E(20.5, click_idx(26, 0.9), 0.9); E(20.5, padchord([131, 196, 262, 330, 392], 5.0, 0.12, 0.4, 3.0), 1.0)
    # footsteps and flowers
    j = 0; t = 21.9
    while t < 32.8:
        E(t, thud(68, 0.3, 0.45), 1.0, -0.3 if j % 2 == 0 else 0.3); E(t + 0.12, pluck([880, 1047, 1319, 1568][j % 4], 0.35, 0.4), 0.2, 0.6 if j % 2 else -0.6)
        t += 0.55; j += 1
    for q in range(20): E(23 + q * 0.4 + rng.uniform(0, 0.2), pluck(1568 * 2 ** (PEN[q % 5] / 12), 0.3, 0.3), 0.1, rng.uniform(-0.8, 0.8))
    # ship
    E(33.0, rumble(4.4, 0.7) * np.minimum(1, tt(4.4) / 1.0), 1.0)
    E(37.4, swell(3.0, 80, 2500, 0.5), 1.0)
    E(39.8, padchord([131, 196, 262, 330, 494], 5.0, 0.12, 1.0, 2.5), 1.0)
    return El, Er, rt, wet

def title_end_design(sh):
    d = sh['d']; n = int((d + 1.0) * SR); El = np.zeros(n); Er = np.zeros(n)
    E = lambda t, sig, g=1.0, pan=0.0: eadd(El, Er, t, sig, g, pan)
    if sh['shot'] == 'title':
        E(0, padchord([110, 165, 220, 277], d, 0.1, 1.0, 1.5), 1.0)
        for i in range(9): E(0.6 + 0.45 * i, click_idx(i * 1.5 + 2), 0.7, np.sin(i) * 0.4)
    else:
        E(0, padchord([131, 196, 262, 330, 392], d + 0.5, 0.12, 0.5, 3.0), 1.0)
        for q in range(8): E(0.6 + q * 0.5 + rng.uniform(0, 0.15), pluck(1568 * 2 ** (PEN[q % 5] / 12), 0.35, 0.3), 0.15, rng.uniform(-0.8, 0.8))
    return El, Er, 1.6, 0.2

for sh in shots:
    t0 = sh['t0']
    if sh['shot'] in ('title', 'end'): El, Er, rt, wet = title_end_design(sh)
    elif sh['shot'] == 'field': El, Er, rt, wet = field_design(sh)
    else: El, Er, rt, wet = design(sh)
    putvs(t0, (El, Er), rt, wet, 1.0)
    rt, wet = ROOM.get(sh['room'], ROOM[None])
    for ln in sh['lines']:
        a = ln['_a']; g = 1.0 * (1.12 if ln['line'] else 1.0); w = wet * (1.4 if ln['line'] else 1.0)
        if isinstance(a, tuple): putvs(t0 + ln['t0'], a, rt, w, g * 0.9)
        else: putv(t0 + ln['t0'], a, rt, w, g, PAN.get(ln['who'], 0.0))

end_i = int((TOTAL + 0.6) * SR)
mixL, mixR = L[:end_i], Rr[:end_i]
fade = int(0.8 * SR); mixL[-fade:] *= np.linspace(1, 0, fade); mixR[-fade:] *= np.linspace(1, 0, fade)
pk = max(np.abs(mixL).max(), np.abs(mixR).max()); sc = 0.8 / pk
st = np.stack([mixL * sc, mixR * sc], 1)
os.makedirs(os.path.join(HERE, 'audio'), exist_ok=True)
wp = os.path.join(HERE, 'audio', 'gg_raw.wav')
with wave.open(wp, 'wb') as wf:
    wf.setnchannels(2); wf.setsampwidth(2); wf.setframerate(SR); wf.writeframes((np.clip(st, -1, 1) * 32767).astype('<i2').tobytes())
subprocess.check_call(['ffmpeg', '-y', '-loglevel', 'error', '-i', wp, '-af', 'loudnorm=I=-16:TP=-1.5:LRA=11', '-c:a', 'aac', '-b:a', '128k', '-ar', '48000', os.path.join(HERE, 'audio', 'gg.m4a')])
os.remove(wp)
for sh in shots:
    for l in sh['lines']: l.pop('_a')
json.dump(dict(shots=shots, dur=TOTAL, cast=CAST), open(os.path.join(HERE, 'timing', 'gg.json'), 'w'))
print('done', TOTAL)
