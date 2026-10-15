"""Voices, sound and music for Prince Ferrix and the Princess Crystal.
   python3 build_sound.py  ->  timing/fx.json and audio/fx.m4a
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


def resolve(spec, lines, d):
    if isinstance(spec, (int, float)): return float(spec)
    s = spec.replace(' ', '')
    if s.startswith('end'): return d + (float(s[3:]) if len(s) > 3 else 0)
    i = int(s[1:s.index('.')]); rest = s[s.index('.') + 1:]
    base = lines[i]['t0'] if rest.startswith('t0') else lines[i]['t1']
    return base + (float(rest[2:]) if len(rest) > 2 else 0)

MUR_LINES = ['a paleface', 'is it real', 'look at it', 'how much', 'it drips', 'from far away', 'the princess', 'ugh', 'in a cage', 'smell that']

ROOM = {'hall': (1.8, 0.24), 'lab': (0.7, 0.14), 'square': (0.5, 0.08), 'palace': (1.5, 0.22), 'court': (1.0, 0.13), 'museum': (2.4, 0.3)}
PAN = {'N': 0, 'F': -0.15, 'A': 0.3, 'P': 0.2, 'C': -0.35, 'Y': 0.3, 'Z': 0.4}

# ---------------- timing pass ----------------
shots = []; t = 0.0
for s in SCRIPT:
    sh = dict(shot=s['shot'], t0=round(t, 3), lines=[], room=s.get('room'))
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
    sh['curve'] = {k: [[round(resolve(a, L_, dd), 3), p] for a, p in v] for k, v in s.get('curve', {}).items()}
    shots.append(sh); t += sh['d']
TOTAL = round(t, 3)
L = L[: int((TOTAL + 3) * SR)]; Rr = Rr[: len(L)]
NT = len(L); tt = np.arange(NT) / SR
def C(sh, k): return [c for c in sh['cues'] if c['k'] == k]
def curve_all(name, default):
    out = np.full(NT, float(default))
    for sh in shots:
        ks = sh['curve'].get(name)
        if not ks: continue
        i0, i1 = int(sh['t0'] * SR), min(NT, int((sh['t0'] + sh['d']) * SR))
        out[i0:i1] = np.interp(tt[i0:i1] - sh['t0'], [k[0] for k in ks], [k[1] for k in ks])
    return out
SPLIT = curve_all('split', 0); CLAY = curve_all('clay', 0)
def at(arr, tsec): return float(arr[min(NT - 1, max(0, int(tsec * SR)))])

# outside sounds go left as the diptych opens, inside sounds go right
def out_(t0, sig, gain, room=None):
    p = -0.75 * at(SPLIT, t0)
    if room: putv(t0, sig, room[0], room[1], gain, p)
    else: put(t0, sig, gain, p)
def in_(t0, sig, gain):
    put(t0, filt(sig, 'lowpass', 5000), gain * (0.35 + 0.65 * at(SPLIT, t0)), 0.85 * at(SPLIT, t0))

# ---------------- instruments of this film ----------------
def glass(f, dur=4.0, att=0.08):
    """glass harmonica: pure partials, a soft attack, a long ring"""
    n = int(dur * SR); tk = np.arange(n) / SR
    s = np.sin(2 * np.pi * f * tk) + 0.18 * np.sin(2 * np.pi * 2 * f * tk) + 0.05 * np.sin(2 * np.pi * 3.01 * f * tk)
    return s * np.minimum(1, tk / att) * np.exp(-tk / (dur / 3.5)) * 0.4
def steel(f=880, dur=1.2):
    """a struck steel plate: inharmonic partials"""
    n = int(dur * SR); tk = np.arange(n) / SR; s = np.zeros(n)
    for r, a, d in [(1, 1, 0.6), (2.76, 0.5, 0.3), (5.4, 0.3, 0.15), (8.93, 0.15, 0.08)]: s += a * np.sin(2 * np.pi * f * r * tk) * np.exp(-tk / d)
    return s * 0.35
def squelch(d=0.25, f0=300):
    n = int(d * SR); tk = np.arange(n) / SR
    s = filt(noise(n), 'bandpass', [f0 * 0.5, f0 * 3]) * np.exp(-tk / (d / 3))
    bub = np.sin(2 * np.pi * np.cumsum(f0 * (1.6 - 0.9 * tk / d)) / SR) * np.exp(-tk / (d / 4)) * 0.6
    return np.tanh((s + bub) * 1.6)
def step(t0, clay, gain, room=None):
    """one footstep of Ferrix: steel ring, smothered by clay"""
    hit = mx(thock(120, 0.06), steel(rng.uniform(700, 900), 0.6) * (1 - clay) ** 1.5 * 0.8, squelch(0.18, 220) * clay * 0.9)
    out_(t0, hit, gain, room)
def drip(f=1800):
    n = int(0.12 * SR); tk = np.arange(n) / SR
    return np.sin(2 * np.pi * np.cumsum(f * (1 + 1.2 * tk / 0.12)) / SR) * np.exp(-tk / 0.025)
def wheeze(d=1.4):
    n = int(d * SR); tk = np.arange(n) / SR; e = np.sin(np.pi * tk / d) ** 1.5
    return (filt(noise(n), 'bandpass', [400, 2200]) * 0.8 + filt(noise(n), 'bandpass', [90, 200]) * 0.6) * e * (1 + 0.3 * np.sin(2 * np.pi * 23 * tk))
def creak(d=0.5, f=60):
    n = int(d * SR); tk = np.arange(n) / SR; out = np.zeros(n); per = int(SR / f)
    for i in range(0, n, per + rng.integers(-per // 4, per // 4 + 1)): out[i:i + 40] += np.hanning(40) * rng.uniform(0.5, 1)
    return filt(out, 'bandpass', [300, 3000]) * np.sin(np.pi * tk / d)
def whoosh(d=0.4):
    n = int(d * SR); tk = np.arange(n) / SR; e = np.sin(np.pi * tk / d) ** 2; out = np.zeros(n)
    for j in range(8):
        a, b = j * n // 8, (j + 1) * n // 8; f = 400 + 2600 * (j / 8)
        out[a:b] = filt(noise(b - a), 'bandpass', [f * 0.7, f * 1.3])
    return out * e
CRYSTAL = [76, 83, 79, 88, 86, 79, 83, 76]

# ---------------- beds and effects ----------------
for sh in shots:
    t0, d, name = sh['t0'], sh['d'], sh['shot']; n = int(d * SR); tl = np.arange(n) / SR
    fade = np.minimum(1, np.minimum(tl / 0.4, (d - tl) / 0.4)).clip(0, 1)
    rm = ROOM.get(sh['room'] or 'hall', (0.6, 0.1)); Ls = sh['lines']
    # the inside bed: Ferrix's own works, a steel hum and a slow escapement, heard only when the body is open
    sp = SPLIT[int(t0 * SR): int(t0 * SR) + n]
    if sp.max() > 0.05:
        hum = (np.sin(2 * np.pi * 110 * tl) + 0.4 * np.sin(2 * np.pi * 165 * tl) + 0.15 * np.sin(2 * np.pi * 330.5 * tl)) * 0.5
        put(t0, hum * sp * fade, 0.035, 0.85)
        for j in range(int(d * 2)):
            if sp[min(n - 1, int(j * SR / 2))] > 0.1: put(t0 + j / 2, mx(click(4200, 0.004), ping(2200 + 300 * (j % 2), 0.08) * 0.3), 0.09 * sp[min(n - 1, int(j * SR / 2))], 0.85)
    if name == 'father':
        put(t0, filt(brown(n), 'lowpass', 160) * fade, 0.06)
        for tn, m in motif_times(t0 + 0.6, 0.5)[0][:6]: putv(tn, glass(mnote(m + 12), 3.0), 2.0, 0.3, 0.12, -0.3)
        for j in range(5): step(t0 + Ls[2]['t0'] - 2.2 + j * 0.42, 0, 0.12, rm)
        hd = C(sh, 'heads')[0]['at']
        for j in range(14): put(t0 + hd + 0.3 + j * 0.16 + rng.uniform(0, 0.05), mx(thock(rng.uniform(140, 260), 0.08), steel(rng.uniform(500, 1200), 0.4) * 0.4), 0.11, rng.uniform(-0.6, 0.6))
        put(t0 + Ls[-1]['t1'] + 0.2, bell(mnote(52), 5), 0.22)
    if name == 'title':
        for j, m in enumerate(CRYSTAL[:5]): putv(t0 + 0.6 + j * 0.62, glass(mnote(m), 3.6), 2.2, 0.35, 0.3, -0.4 + 0.2 * j)
    if name == 'lab':
        put(t0, mx(filt(brown(n), 'lowpass', 220) * 0.6, filt(noise(n), 'bandpass', [1800, 4000]) * 0.04) * fade, 0.07)
        for j in range(int(d * 0.7)): put(t0 + rng.uniform(0, d), mx(squelch(0.3, rng.uniform(80, 160)) * 0.5, drip(rng.uniform(900, 1400)) * 0.4), 0.07, -0.6)  # the vats
        sm = C(sh, 'smear')[0]
        for j in range(int((sm['to'] - sm['at']) * 2.6)): out_(t0 + sm['at'] + j / 2.6 + rng.uniform(0, 0.1), squelch(rng.uniform(0.2, 0.4), rng.uniform(180, 420)), 0.25)
        ch = C(sh, 'chalk')[0]
        for j in range(int((ch['to'] - ch['at']) * 3)):
            k = int(0.22 * SR); out_(t0 + ch['at'] + j / 3, mx(filt(noise(k), 'bandpass', [1500, 6000]) * np.hanning(k) * 0.6, squelch(0.15, 600) * 0.3), 0.2)
        out_(t0 + C(sh, 'rust')[0]['at'], mx(squelch(0.5, 110), thock(70, 0.2)), 0.45)
        mi = C(sh, 'mirror')[0]; k = int(1.8 * SR); tk = np.arange(k) / SR
        put(t0 + mi['at'], sum(np.sin(2 * np.pi * f * tk) for f in (1320, 1980, 2640)) * np.minimum(1, tk / 0.4) * np.exp(-tk / 0.8) * 0.2, 0.25, -0.3)
        # his body shakes like agar: a low wet wobble under his outburst
        k = int(1.6 * SR); tk = np.arange(k) / SR; out_(t0 + Ls[5]['t0'] - 1.0, filt(brown(k), 'lowpass', 300) * (0.5 + 0.5 * np.sin(2 * np.pi * 7 * tk)) * np.exp(-tk / 0.6), 0.35)
        in_(t0 + C(sh, 'bladder')[0]['at'], mx(squelch(0.4, 140), squelch(0.3, 200)), 0.5)
        in_(t0 + C(sh, 'bellows')[0]['at'], mx(wheeze(1.2), creak(0.6, 50)), 0.35)
        tb = C(sh, 'tubes')[0]['at']
        for j in range(6): in_(t0 + tb + j * 0.18, mx(drip(2400 + 200 * j), click(5000, 0.003)), 0.25)
    if name == 'market':
        put(t0, filt(noise(n), 'bandpass', [300, 2000]) * 0.3 * fade, 0.05, -0.4)
        mu = murmur(d + 2, 5, 1.0); put(t0, mu[:n] * fade, 0.08, -0.5)
        for j in range(int(d / 2.2)): out_(t0 + 0.8 + j * 2.2 + rng.uniform(0, 0.5), mx(steel(rng.uniform(1100, 1500), 0.5), click(2000, 0.02)), 0.1)  # the cage bars
        for j in range(int(d * 0.8)): in_(t0 + rng.uniform(0, d), squelch(0.15, rng.uniform(250, 500)), 0.12)  # the clay shifting inside
        put(t0 + Ls[2]['t0'] - 1.4, glass(mnote(CRYSTAL[0]), 3.0), 0.15, -0.5)
    if name in ('tests', 'questions', 'rival'):
        k = n; put(t0, (np.sin(2 * np.pi * 1760 * tl) * 0.3 + np.sin(2 * np.pi * 2637 * tl) * 0.2) * (0.5 + 0.5 * np.sin(2 * np.pi * 0.13 * tl)) * fade, 0.012, -0.6)  # the glass palace sings faintly
        put(t0, filt(brown(n), 'lowpass', 120) * fade, 0.04)
    if name == 'tests':
        sw = C(sh, 'sword')[0]; k = int((sw['to'] - sw['at']) * SR); tk = np.arange(k) / SR
        out_(t0 + sw['at'], mx(steel(1400, 0.8), filt(noise(k), 'bandpass', [2500, 7000]) * np.hanning(k) * 0.4), 0.35)
        out_(t0 + sw['at'] + 0.9, mx(steel(1900, 1.4), steel(2600, 0.9) * 0.5), 0.2)
        in_(t0 + C(sh, 'bladder')[0]['at'], mx(squelch(0.5, 120), squelch(0.4, 180)), 0.6)
        for j in range(5): out_(t0 + C(sh, 'bladder')[0]['at'] + 0.4 + j * 0.35, drip(1100 - 60 * j), 0.18)
        en = C(sh, 'enter')[0]
        out_(t0 + en['at'], mx(creak(0.9, 40), steel(600, 1.2) * 0.6), 0.3)
        for j in range(4): out_(t0 + en['at'] + 1.0 + j * 0.45, mx(glass(mnote(CRYSTAL[j]), 0.6, 0.002) * 0.5, click(3000, 0.004)), 0.18)  # her steps ring
        in_(t0 + C(sh, 'bellows')[0]['at'], mx(wheeze(1.5), creak(0.8, 45)), 0.5)
        out_(t0 + C(sh, 'bellows')[0]['at'] + 0.2, filt(wheeze(1.4), 'lowpass', 900), 0.2)
        out_(t0 + C(sh, 'bow')[0]['at'], creak(0.6, 70), 0.15)
        tb = C(sh, 'tubes')[0]['at']
        for j in range(7): in_(t0 + tb + j * 0.22, drip(2600 + 150 * (j % 3)), 0.3)
        for j in range(4): out_(t0 + tb + 0.6 + j * 0.5, drip(1500 + 80 * j), 0.15)
        put(t0 + Ls[-1]['t1'] + 0.1, glass(mnote(CRYSTAL[3]), 3.0), 0.12, -0.4)
    if name == 'questions':
        for b in C(sh, 'book'):  # Polyphase turning pages inside his robe
            for j in range(int((b['to'] - b['at']) / 2.2) + 1):
                k = int(0.35 * SR); in_(t0 + b['at'] + j * 2.2, filt(noise(k), 'bandpass', [1500, 6000]) * np.sin(np.pi * np.arange(k) / k) ** 3 * 0.5, 0.25)
        hd = C(sh, 'hand')[0]; out_(t0 + hd['at'], mx(squelch(0.4, 260), creak(1.0, 35)), 0.3)
        in_(t0 + hd['at'] + 0.3, mx(steel(500, 0.5) * 0.6, creak(0.6, 30)), 0.3)
        out_(t0 + C(sh, 'cry')[0]['at'], speak('Aaagh!', 'am_michael', 0.9), 0.75, rm)
    if name == 'rival':
        la = C(sh, 'land')[0]['at']; k = int(4.0 * SR); tk = np.arange(k) / SR
        put(t0 + la, filt(brown(k), 'lowpass', 400) * np.sin(np.pi * tk / 4.0) + np.sin(2 * np.pi * np.cumsum(140 - 80 * tk / 4) / SR) * np.sin(np.pi * tk / 4) * 0.2, 0.3, 0.4)
        for j in range(8): put(t0 + Ls[1]['t1'] + 0.1 + j * 0.3, mx(squelch(0.35, 120), filt(noise(int(0.1 * SR)), 'lowpass', 600)), 0.22, 0.4)  # the thing walks in
        fg = C(sh, 'fog')[0]; k = int((fg['to'] - fg['at']) * SR); tk = np.arange(k) / SR
        put(t0 + fg['at'], filt(noise(k), 'bandpass', [1500, 6000]) * np.minimum(1, tk / 1.5) * np.minimum(1, (k / SR - tk) / 1.0) * 0.4, 0.07, 0.2)
        for j in range(40): put(t0 + fg['at'] + rng.uniform(1, (fg['to'] - fg['at'])), click(rng.uniform(2000, 5000), 0.003), 0.08, rng.uniform(-0.6, 0.6))  # rust crackles
        for j in range(int(d * 0.9)): put(t0 + Ls[1]['t1'] + rng.uniform(0, d - Ls[1]['t1']), squelch(rng.uniform(0.2, 0.5), rng.uniform(60, 140)) * 0.6, 0.06, 0.45)  # its breathing
    if name == 'duel':
        put(t0, filt(noise(n), 'bandpass', [200, 900]) * fade, 0.04)
        mu = murmur(d + 2, 3, 1.0); put(t0, mu[:n] * fade * np.where(tl < 6.6, 1.0, np.where(tl < 9, 0.15, 0.5)), 0.04, -0.2)
        ci = C(sh, 'circle')[0]
        for j in range(int((ci['to'] - ci['at']) * 2.2)):
            tj = ci['at'] + j / 2.2; put(t0 + tj, squelch(rng.uniform(0.25, 0.45), rng.uniform(90, 170)), 0.28, 0.35 + 0.1 * np.sin(j))
            if j % 2 == 0: step(t0 + tj + 0.2, at(CLAY, t0 + tj), 0.16)
        for j in range(5): put(t0 + ci['at'] + 0.5 + j * 1.1, speak(['Hrr.', 'Gluk.', 'Hah.', 'Blub.', 'Hrrah!'][j], 'am_onyx', 0.8) * 0.8, 0.3, 0.4)
        sw = C(sh, 'swing')[0]['at']; put(t0 + sw, whoosh(0.35), 0.4, 0.3)
        sha = C(sh, 'shatter')[0]['at']
        put(t0 + sha, mx(squelch(0.3, 400), steel(1200, 2.0), steel(1750, 1.5) * 0.7, thock(90, 0.2)), 0.9, 0.0)
        for j in range(10): put(t0 + sha + 0.05 + rng.uniform(0, 0.8) ** 1.5, steel(rng.uniform(2000, 4000), 0.3), 0.12, rng.uniform(-0.8, 0.8))  # pieces of its blade
        put(t0 + C(sh, 'fall')[0]['at'], mx(thock(60, 0.3), squelch(0.6, 90)), 0.6, 0.1)
        sp_ = C(sh, 'splash')[0]['at']; k = int(2.2 * SR); tk = np.arange(k) / SR
        put(t0 + sp_, mx(filt(noise(k), 'lowpass', 2500) * np.exp(-tk / 0.35) * 1.2, squelch(0.9, 70)), 0.75, 0.15)
        for j in range(16): put(t0 + sp_ + 0.3 + rng.uniform(0, 2.2), mx(squelch(rng.uniform(0.1, 0.3), rng.uniform(200, 600)), drip(rng.uniform(700, 1300)) * 0.5), 0.12, rng.uniform(-0.9, 0.9))
        sl = C(sh, 'slip')[0]  # the clay falls in chunks, and each chunk lets a little more steel ring through
        for j in range(12):
            tj = sl['at'] + j * (sl['to'] - sl['at']) / 12 + rng.uniform(0, 0.1)
            put(t0 + tj, mx(thock(rng.uniform(80, 140), 0.12), filt(noise(int(0.15 * SR)), 'lowpass', 1500) * np.exp(-np.arange(int(0.15 * SR)) / SR / 0.04)), 0.2, rng.uniform(-0.4, 0.4))
            put(t0 + tj + 0.05, steel(880 * 2 ** (j % 5 / 12), 1.6), 0.04 + 0.03 * j, 0)
        put(t0 + sl['to'] + 0.2, mx(bell(mnote(64), 6), bell(mnote(71), 6) * 0.6), 0.25, 0)
        for j, m in enumerate(CRYSTAL): putv(t0 + 16.6 + j * 0.55, glass(mnote(m), 3.6), 2.2, 0.35, 0.26, -0.3 + 0.08 * j)
    if name == 'museum':
        put(t0, filt(brown(n), 'lowpass', 140) * fade, 0.05)
        for j in range(int(d)): put(t0 + 0.5 + j, mx(click(2600, 0.005), ping(1600, 0.1) * 0.4), 0.06, 0.4)  # a museum clock
        for j in range(6): put(t0 + 1.0 + j * 0.9, mx(thock(110, 0.05), steel(800, 0.4) * 0.3), 0.05, -0.5 + j * 0.1)  # distant visitors
        k = int(5 * SR); tk = np.arange(k) / SR; in_(t0 + Ls[1]['t0'] - 1.0, filt(noise(k), 'bandpass', [2000, 7000]) * (0.4 + 0.6 * (rng.random(k) > 0.97)) * np.sin(np.pi * tk / 5) * 0.3, 0.35)  # straw
        for j, m in enumerate(CRYSTAL[:6]): putv(t0 + Ls[-1]['t1'] + 0.4 + j * 0.6, glass(mnote(m), 3.6), 2.6, 0.4, 0.22, 0)
    if name == 'end':
        put(t0 + 0.5, mx(bell(mnote(64), 6), glass(mnote(76), 5)), 0.2)

# the prompts, on the inside channel only
for sh in shots:
    for c in C(sh, 'whisper'):
        w = speak(c['say'], 'bm_daniel', 0.95); w = filt(w, 'highpass', 900) + filt(noise(len(w)), 'bandpass', [3000, 8000]) * 0.02
        put(sh['t0'] + c['at'], w, 0.42, 0.9)

# ---------------- voices ----------------
def glassy(a):
    """Crystal: her voice rings, a comb tuned high plus a faint octave shimmer"""
    dl = int(SR / 1318); y = a.copy()
    for k in range(1, 6): y[k * dl:] += a[: -k * dl] * 0.55 ** k
    up = resample_poly(a, 1, 2); sh_ = np.zeros_like(a); sh_[: len(up)] = up
    return y * 0.7 + filt(sh_, 'highpass', 1500) * 0.12
def wet(a):
    """the paleface: slowed, wobbling, lowpassed, with bubbles"""
    r = 0.86 + 0.06 * np.sin(2 * np.pi * 3.1 * np.arange(len(a) * 2) / SR); y = vary_rate(a, r)
    y = filt(y, 'lowpass', 1800); b = np.zeros_like(y)
    for j in range(int(len(y) / SR * 6)): i = rng.integers(0, max(1, len(y) - 4000)); bb = squelch(0.08, rng.uniform(200, 500)); b[i:i + len(bb)] += bb[: len(b) - i]
    return y + b * 0.1
for sh in shots:
    rt, wt = ROOM.get(sh['room'] or 'hall', (0.5, 0.1))
    for ln in sh['lines']:
        a = ln.pop('_a'); who = ln['who']; T0 = sh['t0'] + ln['t0']
        fx = CAST[who].get('fx')
        if fx == 'glass': a = glassy(a)
        if fx == 'wet': a = wet(a)
        if who == 'F' and at(CLAY, T0) > 0.5: a = filt(a, 'lowpass', 4200)  # the clay over his speaker
        if who == 'N': put(T0, a, 0.8, 0)
        else:
            p = PAN.get(who, 0)
            p = p * (1 - at(SPLIT, T0)) + (-0.55 if who in ('C', 'F', 'Y', 'Z') else 0.3 if who == 'P' else p) * at(SPLIT, T0)
            putv(T0, a, rt, wt, 0.95, p)

mix = np.stack([L, Rr], 1); mix /= np.abs(mix).max() + 1e-9; mix *= 0.89
raw = os.path.join(HERE, 'audio', 'fx.wav')
with wave.open(raw, 'wb') as f:
    f.setnchannels(2); f.setsampwidth(2); f.setframerate(SR); f.writeframes((mix * 32767).astype(np.int16).tobytes())
subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', raw, '-af', 'loudnorm=I=-16:TP=-1.5:LRA=14', '-ar', '48000', '-c:a', 'aac', '-b:a', '192k', os.path.join(HERE, 'audio', 'fx.m4a')], check=True)
os.remove(raw)
json.dump(dict(shots=shots, dur=TOTAL, cast=CAST), open(os.path.join(HERE, 'timing', 'fx.json'), 'w'))
print('ferrix', TOTAL, 's,', len(shots), 'shots')
for sh in shots: print(f"  {sh['shot']:9s} {sh['t0']:7.2f} {sh['d']:6.2f}", ' | '.join(f"{l['who']}@{l['t0']:.1f}-{l['t1']:.1f}" for l in sh['lines']), '|', ' '.join(f"{c['k']}@{c['at']:.1f}" for c in sh['cues']))
