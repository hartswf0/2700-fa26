"""Voices, sound and music for The First Sally (A), or Trurl's Electronic Bard.
   python3 build_sound.py  ->  timing/eb.json and audio/eb.m4a        (python3 build_sound.py --timing-only: timing only)
   Voices: Kokoro (kokoro-onnx), model files in $KOKORO_DIR (default ~/kokoro).
   Everything else is synthesized here, timed from the same score the picture reads.
   The Bard's voice goes through a chain that gets better with each of Trurl's repairs: bard_fx(a, q), q = 0..5."""
import hashlib, json, os, subprocess, sys, wave
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
    pos = np.cumsum(rate); pos = pos[pos < len(x) - 1]
    i = pos.astype(int); f = pos - i
    return x[i] * (1 - f) + x[i + 1] * f
def mx(*xs):
    n = max(len(x) for x in xs); o = np.zeros(n)
    for x in xs: o[:len(x)] += x
    return o

# ---------------- the Bard's sound chain: each repair of Trurl's changes it ----------------
def stutter(a, prob, r):
    out = []; i = 0; n = len(a); sg = int(0.07 * SR)
    while i < n:
        L = int(r.uniform(0.18, 0.4) * SR); ch = a[i:i + L]; out.append(ch); i += L
        if r.random() < prob and len(ch) > sg:
            for _ in range(int(r.integers(2, 4))): out.append(ch[-sg:])
    return np.concatenate(out)
PITCH = [1.34, 1.2, 1.12, 1.07, 1.03, 0.97, 0.97]
def bard_fx(a, q):
    q = int(max(0, min(6, round(q)))); r = np.random.default_rng(100 + q)
    a = resample_poly(a.astype(np.float64), 100, int(round(100 * PITCH[q])))  # q0 is a third too high; q5 is a little low
    t = np.arange(len(a)) / SR
    if q == 0:
        a = filt(a, 'bandpass', [800, 3000]) * (0.6 + 0.4 * np.sin(2 * np.pi * 70 * t)); a = stutter(a, 0.9, r) * 2.2
    elif q == 1:
        a = filt(a, 'bandpass', [500, 4200]) * (0.55 + 0.45 * np.sin(2 * np.pi * 7.5 * t)); a = stutter(a, 0.4, r) * 1.8
    elif q == 2:
        a = filt(a, 'bandpass', [350, 5000]); e = np.abs(filt(a, 'lowpass', 40)); saw = ((t * 110) % 1.0) * 2 - 1
        a = (a + 0.5 * saw * e) * 1.4
    elif q == 3:
        a = filt(a, 'bandpass', [220, 6000]); d = int(0.007 * SR); b = a.copy(); b[d:] += a[:-d] * 0.35; a = b * 1.1
    elif q == 4:
        a = filt(a, 'bandpass', [120, 8000]); d = int(0.004 * SR); b = a.copy(); b[d:] += a[:-d] * 0.18; a = b
    else:
        warm = filt(a, 'lowpass', 420) * 0.55; br = np.zeros_like(a)
        for f, g in [(520, 0.34), (1040, 0.24), (1560, 0.13)]: br += filt(a, 'bandpass', [f * 0.93, f * 1.07]) * g * 3.0
        a = np.tanh((a + warm + br) * 1.15) * 0.9
    return a
def radio_fx(a):
    a = filt(a, 'bandpass', [420, 3100]); a = np.tanh(a * 3.0) * 0.5
    e = np.abs(filt(np.abs(a), 'lowpass', 30)); n = filt(noise(len(a)), 'bandpass', [500, 6500]) * (0.10 + 0.22 * (1 - np.minimum(1, e * 6)))
    t = np.arange(len(a)) / SR
    return a + n + 0.015 * np.sin(2 * np.pi * 1000 * t) * (0.5 + 0.5 * np.sin(2 * np.pi * 3 * t))
def far_fx(a):
    a = bard_fx(a, 5); return filt(a, 'lowpass', 2600) * 0.9

# ---------------- timing pass ----------------
def resolve(spec, lines, d):
    if isinstance(spec, (int, float)): return float(spec)
    s = spec.replace(' ', '')
    if s.startswith('end'): return d + (float(s[3:]) if len(s) > 3 else 0)
    i = int(s[1:s.index('.')]); rest = s[s.index('.') + 1:]
    base = lines[i]['t0'] if rest.startswith('t0') else lines[i]['t1']
    return base + (float(rest[2:]) if len(rest) > 2 else 0)

shots = []; t = 0.0
for s in SCRIPT:
    sh = dict(shot=s['shot'], t0=round(t, 3), lines=[], room=s.get('room'), parts=s.get('parts', 6), slip=s.get('slip'))
    cur = 0.0
    for ln in s.get('lines', []):
        c = CAST[ln['who']]; fl = ln.get('line')
        sp = c['speed'] * ((0.88 if ln['who'] == 'B' else 0.94) if fl else 1.0)
        a = speak(ln['say'], c['voice'], sp)
        fx = ln.get('fx', c.get('fx'))
        if ln['who'] == 'B': a = bard_fx(a, ln.get('q', 5))
        if fx == 'radio': a = radio_fx(a)
        if fx == 'far': a = far_fx(a)
        st = ln['at'] if 'at' in ln else cur + ln.get('pre', 0.6); d = len(a) / SR
        hop = SR // 24; envl = [float(np.sqrt(np.mean(a[i:i + hop] ** 2))) for i in range(0, len(a), hop)]
        emax = max(envl) or 1; envl = [round(min(1, (v / emax) ** 0.7), 2) for v in envl]
        ws = ln['say'].split(); wl = [len(w) + 2 for w in ws]; tot = sum(wl); acc = 0.0; words = []
        for w, l in zip(ws, wl): words.append(dict(w=w, t=round(st + 0.04 + acc / tot * (d - 0.1), 3))); acc += l
        sh['lines'].append(dict(who=ln['who'], say=ln['say'], t0=round(st, 3), t1=round(st + d, 3), line=bool(fl), q=ln.get('q'), poem=bool(ln.get('poem')), env=envl, words=words, text=ln['say'], _a=a))
        cur = st + d
    sh['d'] = round(s['d'] if 'd' in s else cur + s.get('tail', 1.5), 3)
    L_ = sh['lines']; dd = sh['d']
    sh['cues'] = [dict({k: v for k, v in c.items() if k not in ('at', 'to')}, at=round(resolve(c['at'], L_, dd), 3), **({'to': round(resolve(c['to'], L_, dd), 3)} if 'to' in c else {})) for c in s.get('cues', [])]
    sh['curve'] = {k: [[round(resolve(a, L_, dd), 3), p] for a, p in v] for k, v in s.get('curve', {}).items()}
    shots.append(sh); t += sh['d']
TOTAL = round(t, 3)
def dump_timing():
    out = [dict({k: v for k, v in sh.items() if k != 'lines'}, lines=[{k: v for k, v in l.items() if k != '_a'} for l in sh['lines']]) for sh in shots]
    json.dump(dict(shots=out, dur=TOTAL, cast=CAST), open(os.path.join(HERE, 'timing', 'eb.json'), 'w'))
for sh in shots: print(f"  {sh['shot']:9s} t0 {sh['t0']:7.2f} d {sh['d']:6.2f}")
print('TOTAL', TOTAL, f'= {int(TOTAL // 60)}:{TOTAL % 60:04.1f}')
if '--timing-only' in sys.argv:
    dump_timing(); sys.exit(0)

# ---------------- mixing buffers and instruments ----------------
NT = int((TOTAL + 3) * SR); L = np.zeros(NT); Rr = np.zeros(NT); tt = np.arange(NT) / SR
def put(t, sig, gain=1.0, pan=0.0, st=None):
    i = int(t * SR)
    if i < 0: sig = sig[-i:]; i = 0
    n = min(len(sig), NT - i)
    if n <= 0: return
    gl, gr = gain * np.sqrt((1 - pan) / 2) * 1.414, gain * np.sqrt((1 + pan) / 2) * 1.414
    if st is not None: L[i:i + n] += st[0][:n] * gl; Rr[i:i + n] += st[1][:n] * gr
    else: L[i:i + n] += sig[:n] * gl; Rr[i:i + n] += sig[:n] * gr
def putv(t, sig, rt, wet, gain=1.0, pan=0.0):
    pad = np.concatenate([sig, np.zeros(int(rt * SR))]); put(t, pad, gain, pan, st=verb(pad, rt, wet))
def mnote(m): return 440 * 2 ** ((m - 69) / 12)
def click(f0=2500, n=0.006, q=1.0):
    k = int(n * SR); return filt(noise(k), 'bandpass', [f0 * 0.6, min(f0 * 1.6, 20000)]) * np.linspace(1, 0, k) ** 2 * q
def thock(f=180, d=0.03):
    n = int(d * SR); t = np.arange(n) / SR; return np.sin(2 * np.pi * f * t) * np.exp(-t / (d / 4))
def ping(f, d):
    n = int(d * SR); t = np.arange(n) / SR; return np.sin(2 * np.pi * f * t) * np.exp(-t / (d / 5))
def bell(f, dur=6.0):
    n = int(dur * SR); t = np.arange(n) / SR; s = np.zeros(n)
    for r, a, d in [(0.5, 0.55, 4.5), (1, 1, 3.2), (1.19, 0.5, 2.2), (1.5, 0.35, 1.8), (2, 0.4, 1.4), (2.52, 0.2, 0.9), (3, 0.16, 0.7), (4.1, 0.08, 0.4)]:
        s += a * np.sin(2 * np.pi * f * r * t * (1 + 0.0012 * rng.standard_normal())) * np.exp(-t / d)
    s[: int(0.003 * SR)] *= np.linspace(0, 1, int(0.003 * SR)); return s * 0.28
def steel(f=880, dur=1.2):
    n = int(dur * SR); tk = np.arange(n) / SR; s = np.zeros(n)
    for r, a, d in [(1, 1, 0.6), (2.76, 0.5, 0.3), (5.4, 0.3, 0.15), (8.93, 0.15, 0.08)]: s += a * np.sin(2 * np.pi * f * r * tk) * np.exp(-tk / d)
    return s * 0.35
def whoosh(d=0.4):
    n = int(d * SR); tk = np.arange(n) / SR; e = np.sin(np.pi * tk / d) ** 2; out = np.zeros(n)
    for j in range(8):
        a, b = j * n // 8, (j + 1) * n // 8; f = 400 + 2600 * (j / 8); out[a:b] = filt(noise(b - a), 'bandpass', [f * 0.7, f * 1.3])
    return out * e
def creak(d=0.5, f=60):
    n = int(d * SR); tk = np.arange(n) / SR; out = np.zeros(n + 40); per = int(SR / f)
    for i in range(0, n, per + rng.integers(-per // 4, per // 4 + 1)): out[i:i + 40] += np.hanning(40) * rng.uniform(0.5, 1)
    out = out[:n]
    return filt(out, 'bandpass', [300, 3000]) * np.sin(np.pi * tk / d)
def paper(d=0.5):
    n = int(d * SR); return filt(noise(n), 'bandpass', [1800, 7000]) * np.sin(np.pi * np.arange(n) / n) ** 2 * (0.5 + 0.5 * (rng.random(n) > 0.6))
def brass(f, dur=1.2, q=5):
    """the horn's own note: a sawtooth through a band; q is how well the machine has been repaired"""
    n = int(dur * SR); tk = np.arange(n) / SR
    vib = 1 + (0.012 if q < 3 else 0.004) * np.sin(2 * np.pi * 5.5 * tk)
    ph = 2 * np.pi * np.cumsum(f * vib) / SR; s = np.zeros(n)
    for h in range(1, 9): s += np.sin(h * ph) / h ** (1.1 if q >= 4 else 0.6)
    s = filt(s, 'lowpass', 900 + 380 * q)
    if q < 3: s = np.tanh(s * 2.5) * 0.7 + filt(noise(n), 'bandpass', [2000, 6000]) * 0.04
    return s * np.minimum(1, tk / 0.06) * np.exp(-tk / (dur * 0.7)) * 0.35
def glass(f, dur=3.0):
    n = int(dur * SR); tk = np.arange(n) / SR
    return (np.sin(2 * np.pi * f * tk) + 0.18 * np.sin(4 * np.pi * f * tk)) * np.minimum(1, tk / 0.08) * np.exp(-tk / (dur / 3.5)) * 0.4
def C(sh, k): return [c for c in sh['cues'] if c['k'] == k]
ROOM = {'study': (0.9, 0.12), 'lab': (0.8, 0.14), 'hall': (1.8, 0.22), 'space': (3.0, 0.3)}
PAN = {'N': 0, 'T': -0.3, 'K': 0.3, 'B': -0.1, 'Y': 0.35, 'R': 0}
MOT = [(64, 1), (67, 1), (69, 1), (67, 2), (64, 1), (62, 1), (60, 1), (62, 2), (64, 1), (65, 1), (64, 1), (62, 1), (59, 1), (60, 3)]
def motif(t0, beat, q, oct_=0, gain=0.2, pan=0.0):
    t = t0
    for m, b in MOT: putv(t, brass(mnote(m + oct_), b * beat * 1.1, q), 1.4, 0.25, gain, pan); t += b * beat
    return t
def qat(sh, lt):
    k = 0
    for l in sh['lines']:
        if l['who'] == 'B' and l['t0'] <= lt and l.get('q') is not None: k = l['q']
    return k

# ---------------- beds and effects ----------------
for sh in shots:
    t0, d, name = sh['t0'], sh['d'], sh['shot']; n = int(d * SR); tl = np.arange(n) / SR
    fade = np.minimum(1, np.minimum(tl / 0.5, (d - tl) / 0.5)).clip(0, 1)
    Ls = sh['lines']
    if name == 'title':
        for j, (m, b) in enumerate(MOT[:6]): putv(t0 + 0.5 + j * 0.62, brass(mnote(m + 12 if j else m + 12), 1.1, 1 + j * 0.3), 1.6, 0.3, 0.22, -0.2 + 0.1 * j)
        put(t0, filt(brown(n), 'lowpass', 160) * fade, 0.05)
    if name == 'tease':
        put(t0, filt(brown(n), 'lowpass', 180) * fade, 0.05)
        for j in range(int(d * 0.8)): put(t0 + rng.uniform(0.5, d), click(rng.uniform(2000, 4500), 0.004), 0.025, rng.uniform(-0.7, 0.7))
        s_ = C(sh, 'slate')[0]; k = int((s_['to'] - s_['at']) * SR)
        put(t0 + s_['at'], filt(noise(k), 'bandpass', [1800, 6500]) * np.hanning(k) * (0.5 + 0.5 * (rng.random(k) > 0.5)), 0.2, -0.3)
        sk = C(sh, 'sketch')[0]
        for j in range(int((sk['to'] - sk['at']) * 3)): put(t0 + sk['at'] + j / 3, filt(noise(int(0.18 * SR)), 'bandpass', [1500, 6000]) * np.hanning(int(0.18 * SR)) * 0.5, 0.18, 0.1)
        bk = C(sh, 'books')[0]
        for j in range(int((bk['to'] - bk['at']) * 1.5)): put(t0 + bk['at'] + j / 1.5, mx(paper(0.35), thock(110, 0.05) * 0.5), 0.15, 0.4)
    if name in ('universe', 'trials', 'warmup'):
        put(t0, mx(filt(brown(n), 'lowpass', 220) * 0.8, filt(noise(n), 'bandpass', [1800, 4000]) * 0.03) * fade, 0.07)
        hum = (np.sin(2 * np.pi * 55 * tl) + 0.5 * np.sin(2 * np.pi * 110.4 * tl) + 0.2 * np.sin(2 * np.pi * 165 * tl)) * 0.5
        put(t0, hum * fade, 0.03 + (0.02 if name != 'universe' else 0), -0.2)
        for j in range(int(d * 1.6)): put(t0 + rng.uniform(0, d), mx(click(rng.uniform(3000, 5500), 0.003), ping(rng.uniform(1800, 3200), 0.05) * 0.2), 0.05, rng.uniform(-0.6, 0.2))  # relays
        # the window: static until the picture can hold
        if name == 'universe' or name == 'trials':
            qs = 0
            for j in range(int(d)):
                tj = j + 0.0; qv = qat(sh, tj) if name == 'trials' else 0
                np_ = [c for c in sh['cues'] if c['k'] == 'part' and c['at'] <= tj]
                qv = len(np_)
                if qv < 3:
                    k = int(1.0 * SR); put(t0 + tj, filt(noise(k), 'bandpass', [900, 7000]) * 0.5, 0.03 * (1 - qv / 3), 0.5)
    if name == 'universe':
        ep = C(sh, 'epoch')[0]; T_ = ep['to'] - ep['at']; k = int(T_ * SR); tk = np.arange(k) / SR
        put(t0 + ep['at'], np.sin(2 * np.pi * np.cumsum(70 * 2 ** (tk / T_ * 3)) / SR) * np.minimum(1, tk / 2) * 0.5, 0.12, 0)  # the universe winding up
        for j in range(8): put(t0 + ep['at'] + j * T_ / 8, mx(bell(mnote(50 + 3 * j), 3), thock(80, 0.1)), 0.1 + 0.01 * j, 0.0)
        for r in C(sh, 'rewind'):
            k = int(1.2 * SR); tk = np.arange(k) / SR
            put(t0 + r['at'], filt(noise(k), 'bandpass', [400, 4000]) * np.sin(np.pi * (1 - tk / 1.2)) ** 2 * 0.6 * np.sin(2 * np.pi * np.cumsum(300 + 1800 * (1 - tk / 1.2)) / SR) * 0.9 + 0, 0.2, 0.2)
        rl = C(sh, 'reels')[0]; k = int((rl['to'] - rl['at']) * SR); tk = np.arange(k) / SR
        put(t0 + rl['at'], filt(noise(k), 'bandpass', [200, 900]) * (0.5 + 0.5 * np.sin(2 * np.pi * 18 * tk)) * np.minimum(1, tk / 1) * 0.5, 0.12, 0.3)
        tl_ = C(sh, 'tilt')[0]; put(t0 + tl_['at'], mx(creak(1.2, 40), thock(60, 0.2)), 0.35, 0)
    if name == 'trials':
        sw = C(sh, 'switch')[0]['at']; put(t0 + sw, mx(thock(90, 0.12), click(1800, 0.01) * 0.8, steel(300, 1.0) * 0.4), 0.5, 0)
        for c in C(sh, 'part'):  # each repair: a clank, a part seated, and a stronger tone
            qn = c['n']; tp = t0 + c['at']
            put(tp, mx(steel(300 + 40 * qn, 0.9), thock(120, 0.08), click(2500, 0.01) * 0.6), 0.4, -0.1)
            putv(tp + 0.35, brass(mnote(52 + 2 * qn), 1.4, qn), 1.0, 0.2, 0.25, 0.1)
            if qn == 6: putv(tp + 0.7, brass(mnote(59), 2.5, 6), 1.6, 0.3, 0.25, 0.1)
        fl = C(sh, 'floors')[0]
        for j in range(5): put(t0 + fl['at'] + j * (fl['to'] - fl['at']) / 5, mx(creak(0.4, 45), thock(70, 0.1)), 0.18, 0.3)
        sk = C(sh, 'sink')[0]; k = int((sk['to'] - sk['at']) * SR); tk = np.arange(k) / SR
        put(t0 + sk['at'], np.sin(2 * np.pi * np.cumsum(200 - 120 * tk / (k / SR)) / SR) * np.sin(np.pi * tk / (k / SR)) * 0.4, 0.2, 0)
        of = C(sh, 'off')[0]['at']; k = int(2.0 * SR); tk = np.arange(k) / SR
        put(t0 + of, np.sin(2 * np.pi * np.cumsum(220 * np.exp(-tk * 1.6)) / SR) * np.exp(-tk / 0.8) * 0.5, 0.3, 0); put(t0 + of, mx(thock(60, 0.2), click(1200, 0.02)), 0.4, 0)
    if name == 'warmup':
        lv = C(sh, 'lever')[0]['at']; put(t0 + lv, mx(creak(0.5, 50), thock(70, 0.12), steel(260, 1.2) * 0.5), 0.5, 0)
        sk = C(sh, 'shake')[0]; k = int((sk['to'] - sk['at']) * SR); tk = np.arange(k) / SR
        put(t0 + sk['at'], filt(noise(k), 'bandpass', [80, 600]) * (0.5 + 0.5 * np.sin(2 * np.pi * 14 * tk)) * np.minimum(1, tk / 0.6) * 0.8, 0.3, 0)
        for j in range(int((sk['to'] - sk['at']) * 5)): put(t0 + sk['at'] + j / 5 + rng.uniform(0, 0.1), mx(steel(rng.uniform(300, 900), 0.3), click(2200, 0.008)), 0.15, rng.uniform(-0.6, 0.4))
        put(t0 + C(sh, 'kick')[0]['at'], mx(thock(60, 0.1), steel(500, 0.6) * 0.5), 0.5, 0.3)
        bu = C(sh, 'burst')[0]['at']; put(t0 + bu, mx(filt(noise(int(0.5 * SR)), 'bandpass', [600, 5000]) * np.exp(-np.arange(int(0.5 * SR)) / SR / 0.15), steel(700, 1.0)), 0.5, 0)
        rn = C(sh, 'run')[0]
        for j in range(int((rn['to'] - rn['at']) * 6)): put(t0 + rn['at'] + j / 6, thock(rng.uniform(110, 160), 0.04), 0.2, -0.5 + 0.1 * j)
        cl = C(sh, 'climb')[0]
        for j in range(int((cl['to'] - cl['at']) * 4)): put(t0 + cl['at'] + j / 4, mx(thock(rng.uniform(300, 450), 0.03), steel(rng.uniform(700, 1100), 0.3) * 0.4), 0.14, -0.2 + 0.06 * j)
        put(t0 + C(sh, 'dive')[0]['at'], whoosh(0.5), 0.3, -0.2)
        for j, c in enumerate(C(sh, 'bang')):
            put(t0 + c['at'], mx(steel(rng.uniform(250, 500), 0.7), thock(80, 0.08), click(2000, 0.01)), 0.38, -0.1)
            putv(t0 + c['at'] + 0.1, brass(mnote(40 + j * 2), 0.5, 1), 0.9, 0.2, 0.08, 0.1)
        put(t0 + C(sh, 'out')[0]['at'], mx(whoosh(0.5), thock(60, 0.15)), 0.3, 0.3)
        cn = C(sh, 'clean')[0]['at']
        for j, m in enumerate((60, 64, 67, 72)): putv(t0 + cn + j * 0.12, brass(mnote(m), 2.8, 6), 1.8, 0.3, 0.2, -0.1 + 0.1 * j)
    if name in ('epigram', 'shears', 'glori', 'tensor', 'plea'):
        put(t0, mx(filt(brown(n), 'lowpass', 200) * 0.7, filt(noise(n), 'bandpass', [2500, 5000]) * 0.015) * fade, 0.06)
        # a soft pedal under the poem, the horn at rest: two held notes
        base = {'epigram': 55, 'shears': 52, 'glori': 53, 'tensor': 57, 'plea': 50}[name]
        for j, m in enumerate((base, base + 7)): putv(t0 + 1.0 + j * 0.3, brass(mnote(m), d - 2, 6) * 0.5, 1.8, 0.3, 0.14, 0.0)
        if name in ('epigram', 'shears', 'glori', 'tensor'):
            for l in Ls:
                if l['poem'] and l['line']: putv(t0 + l['t1'] + 0.1, bell(mnote(base + 24), 4.5), 1.8, 0.3, 0.12, 0.2)
    if name == 'exit':
        put(t0, filt(brown(n), 'lowpass', 180) * fade, 0.05)
        dr = C(sh, 'door')[0]['at']
        for j in range(6): put(t0 + dr - 1.6 + j * 0.28, mx(thock(rng.uniform(110, 150), 0.04), click(900, 0.01)), 0.18, 0.6 - 0.1 * j)
        put(t0 + dr, mx(creak(0.7, 40), thock(60, 0.12), steel(280, 0.8) * 0.5), 0.45, 0.6)
    if name == 'poets':
        put(t0, filt(brown(n), 'lowpass', 180) * fade, 0.05)
        en = C(sh, 'enter')[0]
        for j in range(int((en['to'] - en['at']) * 3.4)): put(t0 + en['at'] + j / 3.4, thock(rng.uniform(100, 170), 0.04), 0.14, rng.uniform(0, 0.8))
        jr = C(sh, 'jeer')[0]
        for j in range(int((jr['to'] - jr['at']) * 3)): put(t0 + jr['at'] + j / 3, mx(thock(rng.uniform(90, 150), 0.05), filt(noise(int(0.1 * SR)), 'bandpass', [300, 1500]) * 0.3), 0.2, rng.uniform(0, 0.8))
        tp = C(sh, 'trip')[0]['at']
        put(t0 + tp, mx(thock(70, 0.2), filt(noise(int(0.4 * SR)), 'bandpass', [1000, 6000]) * np.exp(-np.arange(int(0.4 * SR)) / SR / 0.1)), 0.5, 0.2)
        for j in range(6): put(t0 + tp + 0.1 + j * 0.07, paper(0.2) * 0.8, 0.2, rng.uniform(0.1, 0.8))
        lv = C(sh, 'leave')[0]
        for j in range(int((lv['to'] - lv['at']) * 3.4)): put(t0 + lv['at'] + j / 3.4, thock(rng.uniform(100, 170), 0.04), 0.14, 0.2 + 0.7 * j / 12)
    if name == 'protest':
        put(t0, filt(noise(n), 'bandpass', [300, 2000]) * fade, 0.05, 0.2)
        st = C(sh, 'stones')[0]
        for j in range(int((st['to'] - st['at']) * 3)): put(t0 + st['at'] + j * 0.33, mx(thock(rng.uniform(300, 700), 0.01), steel(rng.uniform(1500, 3000), 0.2) * 0.3), 0.2, rng.uniform(-0.6, 0.2))  # stones on the walls
        br = C(sh, 'brawl')[0]
        for j in range(int((br['to'] - br['at']) * 5)): put(t0 + br['at'] + j / 5 + rng.uniform(0, 0.1), mx(thock(rng.uniform(70, 200), 0.06), filt(noise(int(0.06 * SR)), 'lowpass', 1500)), 0.25, rng.uniform(-0.5, 0.5))
        put(t0 + C(sh, 'bed')[0]['at'], mx(creak(0.8, 45), thock(60, 0.2)), 0.2, 0.4)
    if name == 'plea':
        pp = C(sh, 'paper')[0]
        for j in range(int((pp['to'] - pp['at']) * 5)): put(t0 + pp['at'] + j / 5 + rng.uniform(0, 0.1), paper(rng.uniform(0.2, 0.5)), 0.08 + 0.04 * j / 25, rng.uniform(-0.8, 0.8))
        put(t0 + C(sh, 'pliers')[0]['at'], mx(click(3000, 0.01), steel(1800, 0.3) * 0.5), 0.3, 0)
        dr = C(sh, 'drop')[0]['at']; put(t0 + dr, mx(steel(900, 1.4), thock(100, 0.08), steel(1500, 0.9) * 0.5), 0.45, 0.1)
        for j in range(3): put(t0 + dr + 0.25 + j * 0.2, steel(1000 + 300 * j, 0.5), 0.1 / (j + 1), 0.1)
    if name == 'bill':
        put(t0, mx(filt(brown(n), 'lowpass', 180) * 0.7, filt(noise(n), 'bandpass', [2000, 4000]) * 0.015) * fade, 0.06)
        un = C(sh, 'unroll')[0]; k = int((un['to'] - un['at']) * SR); put(t0 + un['at'], paper((un['to'] - un['at'])) * 1.3, 0.35, 0.3)
        for j in range(int((un['to'] - un['at']) * 8)): put(t0 + un['at'] + j / 8, click(rng.uniform(3000, 5000), 0.003), 0.08, rng.uniform(0, 0.7))
        put(t0 + C(sh, 'chair')[0]['at'], mx(creak(0.8, 50), thock(100, 0.08)), 0.35, -0.2)
        nt = C(sh, 'night')[0]['at']
        for j in range(int((d - nt) * 2)): put(t0 + nt + j / 2 + rng.uniform(0, 0.2), ping(rng.uniform(3500, 4500), 0.08) * 0.3, 0.05, rng.uniform(-0.8, 0.8))
        put(t0 + nt, np.sin(2 * np.pi * 50 * tl[: int((d - nt) * SR)]) * 0.4, 0.04, 0)
        put(t0 + C(sh, 'pop')[0]['at'], mx(thock(200, 0.05), click(2200, 0.01), steel(1300, 0.6) * 0.4), 0.4, 0)
    if name == 'broadcast':
        put(t0, mx(filt(noise(n), 'bandpass', [500, 7000]) * 0.3, filt(brown(n), 'lowpass', 140) * 0.5) * fade, 0.05)
        wv = C(sh, 'waves')[0]['at']; k = int((d - wv) * SR); tk = np.arange(k) / SR
        put(t0 + wv, filt(noise(k), 'bandpass', [800, 6000]) * (0.4 + 0.6 * np.abs(np.sin(2 * np.pi * 0.5 * tk))) * np.minimum(1, tk / 1.5) * np.minimum(1, (k / SR - tk) / 1.0), 0.07, 0.4)
        sp = C(sh, 'ship')[0]; k = int((sp['to'] - sp['at']) * SR); tk = np.arange(k) / SR
        put(t0 + sp['at'], filt(brown(k), 'lowpass', 400) * np.sin(np.pi * tk / (k / SR)) * 1.2 + np.sin(2 * np.pi * np.cumsum(90 + 30 * np.sin(tk)) / SR) * np.sin(np.pi * tk / (k / SR)) * 0.25, 0.28, 0.5)
        for j in range(5): put(t0 + C(sh, 'techs')[0]['at'] + j * 0.28, mx(steel(rng.uniform(500, 1200), 0.4), thock(90, 0.06)), 0.14, rng.uniform(-0.5, 0.5))
        mm = C(sh, 'mime')[0]
        for j in range(int((mm['to'] - mm['at']) * 4)): put(t0 + mm['at'] + j / 4, click(rng.uniform(600, 1200), 0.01) * 0.8, 0.1, -0.2)
        tw = C(sh, 'tow')[0]; k = int((tw['to'] - tw['at']) * SR); tk = np.arange(k) / SR
        put(t0 + tw['at'], filt(brown(k), 'lowpass', 300) * np.sin(np.pi * tk / (k / SR)) + np.sin(2 * np.pi * np.cumsum(70 + 25 * tk / (k / SR)) / SR) * 0.3 * np.sin(np.pi * tk / (k / SR)), 0.28, 0.4)
    if name == 'stars':
        put(t0, mx(filt(noise(n), 'bandpass', [1000, 6000]) * 0.15, filt(brown(n), 'lowpass', 120) * 0.8) * fade, 0.05)
        for j, m in enumerate((57, 64, 69)): putv(t0 + 1.0 + j * 0.5, glass(mnote(m), 6), 2.4, 0.35, 0.14, -0.3 + 0.3 * j)
        for j, c in enumerate(C(sh, 'flare')):
            k = int(2.6 * SR); tk = np.arange(k) / SR
            fl = filt(noise(k), 'bandpass', [300, 3500]) * np.minimum(1, tk / 0.08) * np.exp(-tk / 0.8) * 0.8 + np.sin(2 * np.pi * np.cumsum(180 * (2 ** (tk * 1.2)) * 0.9) / SR) * np.exp(-tk / 0.9) * 0.2
            putv(t0 + c['at'], fl, 2.0, 0.3, 0.3, -0.5 + 0.5 * j)
            putv(t0 + c['at'] + 0.2, glass(mnote(76 + 3 * j), 4.0), 2.4, 0.35, 0.18, -0.3 + 0.3 * j)
    if name == 'end':
        motif(t0 + 0.3, 0.42, 6, 0, 0.2, 0.0)
        put(t0 + 4.2, mx(bell(mnote(52), 6), glass(mnote(76), 5)), 0.2)

# ---------------- the whispers, and voices ----------------
for sh in shots:
    for c in C(sh, 'laugh'): putv(sh['t0'] + c['at'], speak(c['say'], CAST['K']['voice'], 0.85), 0.9, 0.12, 0.9, 0.3)
for sh in shots:
    for c in C(sh, 'whisper'):
        w = speak(c.get('say', 'Something harder. A cyclotron. A tensor. A haircut, in verse.'), 'bm_daniel', 0.95); w = filt(w, 'highpass', 900) + filt(noise(len(w)), 'bandpass', [3000, 8000]) * 0.02
        put(sh['t0'] + c['at'], w, 0.4, 0.9)
for sh in shots:
    rt, wt = ROOM.get(sh['room'] or 'hall', (0.5, 0.1))
    for ln in sh['lines']:
        a = ln.pop('_a'); who = ln['who']; T0 = sh['t0'] + ln['t0']; fx = CAST[who].get('fx'); lfx = ln.get('fx', fx)
        if who == 'N': put(T0, a, 0.8, 0)
        elif lfx in ('radio', 'far'):
            put(T0, a, 0.8, 0.0)
        elif who == 'B':
            putv(T0, a, rt, wt, 0.9, -0.1)                      # the voice in the room
            put(T0, a, 0.3, 0.95)                               # the same voice as a bare signal on the wire, right channel
            put(T0 - 0.01, filt(a, 'highpass', 1500) * 0.05, 1.0, 0.95)
        else: putv(T0, a, rt, wt, 0.95, PAN.get(who, 0))

mix = np.stack([L, Rr], 1); mix /= np.abs(mix).max() + 1e-9; mix *= 0.89
raw = os.path.join(HERE, 'audio', 'eb.wav'); os.makedirs(os.path.join(HERE, 'audio'), exist_ok=True)
with wave.open(raw, 'wb') as f:
    f.setnchannels(2); f.setsampwidth(2); f.setframerate(SR); f.writeframes((mix * 32767).astype(np.int16).tobytes())
subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', raw, '-af', 'loudnorm=I=-16:TP=-1.5:LRA=14', '-ar', '48000', '-c:a', 'aac', '-b:a', '192k', os.path.join(HERE, 'audio', 'eb.m4a')], check=True)
os.remove(raw)
dump_timing()
print('electronic-bard', TOTAL, 's,', len(shots), 'shots')
