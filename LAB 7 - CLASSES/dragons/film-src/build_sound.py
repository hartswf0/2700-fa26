"""Voices, sound and music for The Dragons of Probability.
   python3 build_sound.py  ->  timing/dr.json and audio/dr.m4a
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

total_guess = 320
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
MUR_LINES = ['what was that', 'did you hear it', 'not again', 'the barn', 'stay together', 'gold and jewels', 'keep walking', 'up the mountain', 'quiet now', 'it is near']
MUR_VOICES = ['af_bella', 'am_adam', 'bf_alice', 'bm_daniel', 'af_nicole', 'am_eric', 'bf_isabella', 'am_liam', 'af_river', 'bm_fable']
def murmur(seconds, density=7, pitch=1.0):
    n = int(seconds * SR); out = np.zeros(n)
    for j in range(int(seconds * density)):
        v = MUR_VOICES[j % len(MUR_VOICES)]; s = speak(MUR_LINES[(j * 5) % len(MUR_LINES)], v, 1.0)
        if pitch != 1.0: s = resample_poly(s, 100, int(100 * pitch))
        i = int(rng.uniform(0, max(1, n - len(s))))
        out[i:i + len(s)] += s[: n - i] * rng.uniform(0.25, 0.6)
    out = filt(out, 'lowpass', 2600); out = filt(out, 'highpass', 180); return out / (np.abs(out).max() + 1e-9)

ROOM = {'cellar': (0.6, 0.13), 'field': (0.3, 0.05), 'street': (0.5, 0.08), 'city': (0.7, 0.1), 'hall': (1.6, 0.22), 'mountain': (0.6, 0.1), 'canyon': (1.4, 0.24)}
PAN = {'T': -0.25, 'K': 0.25, 'P': -0.35, 'G': -0.5, 'N': 0}

def resolve(spec, lines, d):
    if isinstance(spec, (int, float)): return float(spec)
    s = spec.replace(' ', '')
    if s.startswith('end'): return d + (float(s[3:]) if len(s) > 3 else 0)
    i = int(s[1:s.index('.')]); rest = s[s.index('.') + 1:]
    base = lines[i]['t0'] if rest.startswith('t0') else lines[i]['t1']
    return base + (float(rest[2:]) if len(rest) > 2 else 0)

# ---------------- timing pass ----------------
shots = []; t = 0.0
for s in SCRIPT:
    sh = dict(shot=s['shot'], t0=round(t, 3), lines=[], room=s.get('room'), counter=bool(s.get('counter')))
    cur = 0.0
    for ln in s.get('lines', []):
        c = CAST[ln['who']]; sp = c['speed'] * (0.94 if ln.get('line') else 1.0)
        a = speak(ln['say'], c['voice'], sp)
        st = ln['at'] if 'at' in ln else cur + ln.get('pre', 0.6); d = len(a) / SR
        hop = SR // 24; envl = [float(np.sqrt(np.mean(a[i:i + hop] ** 2))) for i in range(0, len(a), hop)]
        emax = max(envl) or 1; envl = [round(min(1, (v / emax) ** 0.7), 2) for v in envl]
        sh['lines'].append(dict(who=ln['who'], say=ln['say'], t0=round(st, 3), t1=round(st + d, 3), line=bool(ln.get('line')), env=envl, _a=a))
        cur = st + d
    sh['d'] = round(s['d'] if 'd' in s else cur + s.get('tail', 1.5), 3)
    L_ = sh['lines']; dd = sh['d']
    sh['cues'] = [dict({k: v for k, v in c.items() if k not in ('at', 'to')}, at=round(resolve(c['at'], L_, dd), 3), **({'to': round(resolve(c['to'], L_, dd), 3)} if 'to' in c else {})) for c in s.get('cues', [])]
    sh['prob'] = {k: [[round(resolve(a, L_, dd), 3), p] for a, p in v] for k, v in s.get('prob', {}).items()}
    shots.append(sh); t += sh['d']
TOTAL = round(t, 3)
L = L[: int((TOTAL + 3) * SR)]; Rr = Rr[: len(L)]
NT = len(L); tt = np.arange(NT) / SR
def C(sh, k): return [c for c in sh['cues'] if c['k'] == k]
def pcurve(sh, name):
    """p of one dragon across the whole timeline (0 outside its shot), per sample"""
    out = np.zeros(NT); ks = sh['prob'].get(name)
    if not ks: return out
    i0, i1 = int(sh['t0'] * SR), int((sh['t0'] + sh['d']) * SR)
    loc = tt[i0:i1] - sh['t0']; out[i0:i1] = np.interp(loc, [k[0] for k in ks], [k[1] for k in ks]); return out

# ---------------- the dragon counter: random clicks, rate rises with p ----------------
pmax = np.zeros(NT); cnt = np.zeros(NT)
for sh in shots:
    for k in sh['prob']: pmax = np.maximum(pmax, pcurve(sh, k))
    if sh['counter']: i0, i1 = int(sh['t0'] * SR), int((sh['t0'] + sh['d']) * SR); cnt[i0:i1] = 1
cnt = filt(cnt, 'lowpass', 4)
gorge = next(s for s in shots if s['shot'] == 'gorge'); imp = C(gorge, 'improb')[0]
wild = np.zeros(NT); a_, b_ = int((gorge['t0'] + imp['at']) * SR), int((gorge['t0'] + imp['to']) * SR); wild[a_:b_] = 1
rate = (0.6 + 38 * pmax ** 2.2 + 70 * wild) * cnt
step = int(0.004 * SR); tc = 0.0; clk = click(3400, 0.004)
for i in range(0, NT - step, step):
    if rng.random() < rate[i] * step / SR:
        j = i + rng.integers(0, step); put(j / SR, clk, 0.22 * (0.7 + 0.3 * rng.random()), 0.15)

# ---------------- the dragon's voice, cut into grains kept with probability p ----------------
def roar(d, f0=55):
    n = int(d * SR); tk = np.arange(n) / SR; f = f0 * (1 + 0.25 * np.sin(np.pi * tk / d)) * (1 + 0.03 * np.sin(2 * np.pi * 7 * tk))
    ph = 2 * np.pi * np.cumsum(f) / SR; saw = sum(np.sin(k * ph) / k for k in range(1, 30))
    v = filt(saw, 'bandpass', [120, 900]) * 0.8 + filt(noise(n), 'bandpass', [300, 1800]) * 0.6 * (0.6 + 0.4 * np.sin(2 * np.pi * 11 * tk))
    env = np.minimum(1, tk / 0.25) * np.minimum(1, (d - tk) / 0.6); return np.tanh(v * 2.4) * env
def grained(sig, t0, pc):
    g = int(0.045 * SR); out = sig.copy(); i0 = int(t0 * SR)
    for i in range(0, len(sig), g):
        p = pc[min(NT - 1, i0 + i)]
        if rng.random() > p: out[i:i + g] = 0
        else: out[i:i + min(g, len(out) - i)] *= np.hanning(min(g, len(out) - i)) ** 0.3
    return out

# ---------------- beds and effects ----------------
for sh in shots:
    t0, d, name = sh['t0'], sh['d'], sh['shot']; n = int(d * SR); tl = np.arange(n) / SR
    fade = np.minimum(1, np.minimum(tl / 0.4, (d - tl) / 0.4)).clip(0, 1)
    for k in sh['prob']:  # every dragon breathes: a low rumble in proportion to p
        pc = pcurve(sh, k)[int(t0 * SR): int(t0 * SR) + n]
        put(t0, filt(brown(n), 'lowpass', 110) * pc * fade, 0.18 if k in ('A', 'F') else 0.07)
    if name == 'lab':
        dl = C(sh, 'dial')[0]; pc = pcurve(sh, 'A')[int(t0 * SR): int(t0 * SR) + n]
        f = 70 + 260 * pc; ph = 2 * np.pi * np.cumsum(f) / SR; put(t0, (np.sin(ph) + 0.3 * np.sin(2 * ph)) * 0.5 * fade, 0.06, -0.3)
        put(t0, filt(noise(n), 'lowpass', 300) * fade, 0.02)
        for j in range(int((dl['to'] - dl['at']) * 6)): put(t0 + dl['at'] + j / 6, click(1500, 0.01), 0.15, -0.3)
        lu = C(sh, 'lunge')[0]['at']; r = roar(2.6, 48); put(t0 + lu - 0.3, grained(r, t0 + lu - 0.3, pcurve(sh, 'A')), 0.9, 0.1)
        dn = C(sh, 'down')[0]; r = roar(2.2, 60); put(t0 + dn['at'], grained(r, t0 + dn['at'], pcurve(sh, 'A')), 0.6, 0.1)
    if name == 'title':
        for tn, m in motif_times(t0 + 0.6, 0.34)[0][:9]: put(tn, mbox(mnote(m) * (1 + 0.03 * (rng.random() - 0.5))), 0.3, 0.1)
    if name == 'country':
        put(t0, filt(noise(n), 'bandpass', [400, 2400]) * 0.3 * fade, 0.05)
        mu = murmur(d + 2, 6, 1.1); put(t0, mu[:n] * fade, 0.06)
        fire = filt(noise(n), 'bandpass', [400, 3000]) * (np.random.default_rng(5).random(n) > 0.996) * 3 + filt(brown(n), 'lowpass', 200) * 0.5; put(t0, fire * fade, 0.05, -0.6)
        for k, f0, g in [('A', 50, 0.4), ('B', 64, 0.22), ('C', 80, 0.15)]:
            for st in (0.2, 7.6, 18.0):
                r = roar(2.0, f0); put(t0 + st + 0.4 * (f0 % 3), grained(r, t0 + st, pcurve(sh, k)), g, {'A': -0.4, 'B': 0.1, 'C': 0.6}[k])
        for j in range(10): put(t0 + 0.4 + j * 0.31, mx(thock(140, 0.04), click(900, 0.02)), 0.12, -0.2 + j * 0.05)
        rg = C(sh, 'ring')[0]
        for j in range(18): put(t0 + rg['at'] + j * 0.25, mx(thock(110, 0.05), filt(noise(int(0.03 * SR)), 'bandpass', [600, 3000]) * 0.4), 0.15, rng.uniform(-0.8, 0.8))
        put(t0 + rg['to'] + 1.4, filt(noise(int(1.5 * SR)), 'bandpass', [300, 2000]) * env_decay(int(1.5 * SR), 0.4), 0.2)
    if name == 'basil':
        put(t0, filt(noise(n), 'bandpass', [2500, 7000]) * 0.15 * fade, 0.04, 0.3)
        r = roar(3.0, 70); put(t0 + sh['lines'][3]['t0'], grained(r, t0 + sh['lines'][3]['t0'], pcurve(sh, 'V')), 0.35, 0.5)
    if name == 'dampers':
        put(t0, filt(noise(n), 'bandpass', [300, 1500]) * 0.2 * fade, 0.04)
        for c in C(sh, 'fit'):
            put(t0 + c['at'], mx(click(2400, 0.02), ping(2600, 0.5), ping(3900, 0.3) * 0.5), 0.3, 0.2)
            k = int(1.2 * SR); tk = np.arange(k) / SR; put(t0 + c['at'] + 0.1, np.sin(2 * np.pi * np.cumsum(900 - 600 * tk / tk[-1]) / SR) * np.exp(-tk / 0.5), 0.05, 0.3)
    if name == 'court':
        put(t0, filt(noise(n), 'lowpass', 500) * 0.3 * fade, 0.03)
        for j in range(24): put(t0 + 3.0 + j * 0.06, ping(rng.uniform(2500, 4500), 0.15), 0.06, 0.2)
        st = C(sh, 'storm')[0]['at']
        for j in range(6): put(t0 + st + j * 0.28, mx(thock(100, 0.06), click(800, 0.02)), 0.3, -0.1 - j * 0.12)
        put(t0 + st + 2.0, mx(thock(60, 0.5), filt(noise(int(0.3 * SR)), 'lowpass', 1500) * env_decay(int(0.3 * SR), 0.08)), 0.5, -0.8)
        r = roar(2.4, 52); put(t0 + st + 4.6, r, 0.15, 0.7)
    if name == 'tribute':
        put(t0, filt(noise(n), 'bandpass', [200, 900]) * (0.6 + 0.4 * np.sin(2 * np.pi * 0.1 * tl)) * fade, 0.07)
        hw = C(sh, 'howl')[0]['at']; h = speak('Aaoooooooo!', 'bm_lewis', 0.7); h = resample_poly(h, 3, 2); putv(t0 + hw, h, 3.0, 0.55, 0.3, 0.6)
        for j in range(int(d / 0.75)): put(t0 + 0.3 + j * 0.75, mx(thock(90, 0.05), filt(noise(int(0.04 * SR)), 'bandpass', [500, 2500]) * 0.5), 0.12, -0.3)
        for j in range(int(d * 1.5)): put(t0 + rng.uniform(0, d), ping(rng.uniform(1800, 3200), 0.25), 0.04, -0.4)
    if name == 'gorge':
        put(t0, filt(noise(n), 'bandpass', [150, 700]) * fade, 0.06)
        so = C(sh, 'shot')[0]['at']
        put(t0 + so, mx(thock(50, 0.6), filt(noise(int(1.2 * SR)), 'lowpass', 1600) * env_decay(int(1.2 * SR), 0.35)), 1.0, 0.2)
        r = roar(2.2, 45); putv(t0 + so + 0.3, r, 2.0, 0.4, 0.8, -0.2)
        for j in range(10): put(t0 + so + 0.6 + rng.uniform(0, 1.5), mx(thock(rng.uniform(70, 160), 0.15), filt(noise(int(0.1 * SR)), 'lowpass', 1200)), 0.25, rng.uniform(-0.8, 0.2))
        sc = C(sh, 'scratch')[0]
        for j in range(int((sc['to'] - sc['at']) * 5)): put(t0 + sc['at'] + j / 5, filt(noise(int(0.12 * SR)), 'bandpass', [1500, 5000]) * np.hanning(int(0.12 * SR)), 0.1, -0.2)
        put(t0 + sc['to'] - 0.8, speak('Ahem.', 'bm_lewis', 0.8), 0.25, -0.2)
        im = C(sh, 'improb')[0]; a, b = im['at'], im['to']; D = b - a
        k = int(D * SR); tk = np.arange(k) / SR; put(t0 + a, filt(noise(k), 'bandpass', [600, 4000]) * (0.5 + 0.5 * np.sin(2 * np.pi * 3 * tk)) * np.minimum(1, tk / 0.6) * np.minimum(1, (D - tk) / 0.6), 0.08, 0.3)
        morse = '-.-- --- ..- .-. / ... . .-. ...- .. -.-. .'; tm = a + 1.0
        for ch in morse:
            if ch == '/': tm += 0.3; continue
            if ch == ' ': tm += 0.18; continue
            dur = 0.07 if ch == '.' else 0.2; put(t0 + tm, tone_ := np.sin(2 * np.pi * 1100 * np.arange(int(dur * SR)) / SR) * np.hanning(int(dur * SR)) ** 0.2, 0.08, 0.5); tm += dur + 0.07
        for j in range(int(D * 2.4)): put(t0 + a + 1.4 + j / 2.4 * 0.95, mx(thock(160, 0.05), click(800, 0.02)), 0.15, -0.7 + 0.1 * (j % 4))
        st_ = murmur(5.5, 4, 1.6); put(t0 + a + D * 0.45, st_ * np.hanning(len(st_)), 0.12, 0.6)
        for tn, m in motif_times(t0 + a + 0.6, 0.45)[0]:
            if tn > t0 + b: break
            put(tn, mbox(mnote(m + rng.choice([-5, 0, 0, 7, 12, -12]))), 0.18, rng.uniform(-0.6, 0.6))
        for j in range(5): put(t0 + a + 2.4 + j * 1.3, speak(['Hee hee.', 'Hah!', 'Ooh.', 'Shh.', 'Hee.'][j], ['af_sky', 'af_nicole', 'bf_lily', 'af_bella', 'af_river'][j], 1.2) * 0.6, 0.18, rng.uniform(-0.9, 0.9))
        gr = C(sh, 'grenade')[0]['at']; put(t0 + gr, mx(thock(40, 1.0), filt(noise(int(2 * SR)), 'lowpass', 2000) * env_decay(int(2 * SR), 0.5)), 1.0, 0.0)
        for j in range(16): put(t0 + gr + 0.2 + rng.uniform(0, 2) ** 1.3, mx(thock(rng.uniform(90, 200), 0.1), click(1500, 0.02)), 0.2, rng.uniform(-0.9, 0.9))
        chg = C(sh, 'charge')[0]
        for j in range(int((chg['to'] - chg['at']) * 3)): put(t0 + chg['at'] + j / 3, mx(thock(55, 0.18), filt(noise(int(0.08 * SR)), 'lowpass', 600)), 0.5 * (0.5 + 0.5 * j / ((chg['to'] - chg['at']) * 3)), -0.1)
    if name == 'reveal':
        kn = C(sh, 'kneel')[0]['at']; k = int(2.4 * SR); tk = np.arange(k) / SR
        wh = filt(noise(k), 'bandpass', [300, 1500]) * np.exp(-tk / 1.2) + np.sin(2 * np.pi * np.cumsum(220 - 140 * tk / tk[-1]) / SR) * np.exp(-tk / 1.0) * 0.4
        put(t0 + kn, wh, 0.25, -0.1)
        for j in range(5): put(t0 + kn + 0.3 + j * 0.3, mx(thock(70, 0.15), click(600, 0.04)), 0.25, -0.1)
        put(t0, filt(noise(n), 'bandpass', [150, 700]) * fade, 0.05)
        tl_ = t0 + sh['lines'][-1]['t1'] + 0.4
        for tn, m in motif_times(tl_, 0.36)[0][:9]: putv(tn, mbox(mnote(m)), 1.4, 0.24, 0.3, 0.1)
    if name == 'end':
        for j in range(12): put(t0 + 0.6 + j * 0.22 + rng.uniform(0, 0.05), mx(ping(rng.uniform(2200, 4200), 0.3), click(1800, 0.01)), 0.12, rng.uniform(-0.5, 0.5))

# ---------------- voices ----------------
for sh in shots:
    rt, wet = ROOM.get(sh['room'] or 'field', (0.5, 0.1))
    for ln in sh['lines']:
        a = ln.pop('_a'); who = ln['who']
        if who == 'N': put(sh['t0'] + ln['t0'], a, 0.8, 0)
        elif sh['shot'] == 'gorge' and who == 'T': putv(sh['t0'] + ln['t0'], filt(a, 'lowpass', 2600), 1.6, 0.35, 1.0, -0.2)  # inside the skin
        else: putv(sh['t0'] + ln['t0'], a, rt, wet, 0.95, PAN.get(who, 0))

mix = np.stack([L, Rr], 1); mix /= np.abs(mix).max() + 1e-9; mix *= 0.89
raw = os.path.join(HERE, 'audio', 'dr.wav')
with wave.open(raw, 'wb') as f:
    f.setnchannels(2); f.setsampwidth(2); f.setframerate(SR); f.writeframes((mix * 32767).astype(np.int16).tobytes())
subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', raw, '-af', 'loudnorm=I=-16:TP=-1.5:LRA=14', '-ar', '48000', '-c:a', 'aac', '-b:a', '192k', os.path.join(HERE, 'audio', 'dr.m4a')], check=True)
os.remove(raw)
json.dump(dict(shots=shots, dur=TOTAL, cast=CAST), open(os.path.join(HERE, 'timing', 'dr.json'), 'w'))
print('dragons', TOTAL, 's,', len(shots), 'shots')
for sh in shots: print(f"  {sh['shot']:8s} {sh['t0']:7.2f} {sh['d']:6.2f}", ' | '.join(f"{l['who']}@{l['t0']:.1f}-{l['t1']:.1f}" for l in sh['lines']), '|', ' '.join(f"{c['k']}@{c['at']:.1f}" for c in sh['cues']))
