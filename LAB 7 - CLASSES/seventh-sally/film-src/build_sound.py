"""Voices, sound and music for The Seventh Sally.
   python3 build_sound.py  ->  timing/sally.json and audio/sally.m4a
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

total_guess = 260
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
MUR_LINES = ['the bread is dear again', 'have you seen my brother', 'the bells are early', 'they say a new decree', 'keep your voice down', 'my daughter is sick',
             'the bakers are gone', 'what year is it', 'the sky was moving', 'we should go home', 'he is watching', 'not today', 'bring the children in', 'listen']
MUR_VOICES = ['af_bella', 'am_adam', 'bf_alice', 'bm_daniel', 'af_nicole', 'am_eric', 'bf_isabella', 'am_liam', 'af_river', 'bm_fable']
def murmur(seconds, density=7, pitch=1.0):
    n = int(seconds * SR); out = np.zeros(n)
    for j in range(int(seconds * density)):
        v = MUR_VOICES[j % len(MUR_VOICES)]; s = speak(MUR_LINES[(j * 5) % len(MUR_LINES)], v, 1.0)
        if pitch != 1.0: s = resample_poly(s, 100, int(100 * pitch))
        i = int(rng.uniform(0, max(1, n - len(s))))
        out[i:i + len(s)] += s[: n - i] * rng.uniform(0.25, 0.6)
    out = filt(out, 'lowpass', 2600); out = filt(out, 'highpass', 180); return out / (np.abs(out).max() + 1e-9)

# ---------------- rooms ----------------
ROOM = {'space': (0.35, 0.05), 'shop': (0.5, 0.13), 'hall': (2.6, 0.3), 'street': (1.3, 0.18), 'square': (1.7, 0.22), 'study': (0.6, 0.13), 'cabin': (0.28, 0.16)}
PAN = {('build', 'T'): -0.3, ('question', 'K'): -0.4, ('question', 'T'): 0.45, ('flight', 'K'): -0.18, ('flight', 'T'): 0.22, ('orbit', 'K'): -0.18, ('orbit', 'T'): 0.22, ('escape', 'C'): -0.55}

# ---------------- timing pass ----------------
shots = []; t = 0.0
for s in SCRIPT:
    sh = dict(shot=s['shot'], t0=round(t, 3), cues=s.get('cues', []), lines=[], room=s.get('room'))
    cur = 0.0
    for ln in s.get('lines', []):
        c = CAST[ln['who']]; sp = c['speed'] * (0.94 if ln.get('line') else 1.0)
        a = speak(ln['say'], c['voice'], sp)
        if ln.get('small'): a = resample_poly(a, 2, 3)  # half a fifth up and faster: a small body
        st = ln['at'] if 'at' in ln else cur + ln.get('pre', 0.6)
        d = len(a) / SR
        hop = SR // 24; envl = [float(np.sqrt(np.mean(a[i:i + hop] ** 2))) for i in range(0, len(a), hop)]
        emax = max(envl) or 1; envl = [round(min(1, (v / emax) ** 0.7), 2) for v in envl]
        sh['lines'].append(dict(who=ln['who'], say=ln['say'], t0=round(st, 3), t1=round(st + d, 3), line=bool(ln.get('line')), small=bool(ln.get('small')), env=envl, _a=a))
        cur = st + d
    sh['d'] = round(s['d'] if 'd' in s else cur + s.get('tail', 1.5), 3)
    shots.append(sh); t += sh['d']
TOTAL = round(t, 3)
L = L[: int((TOTAL + 2) * SR)]; Rr = Rr[: len(L)]

def S(name): return next(x for x in shots if x['shot'] == name)
def C(sh, k): return [c for c in sh['cues'] if c['k'] == k]

# ---------------- beds and effects per shot ----------------
for sh in shots:
    t0, d, name = sh['t0'], sh['d'], sh['shot']
    n = int(d * SR); tt = np.arange(n) / SR
    fade = np.minimum(1, np.minimum(tt / 0.6, (d - tt) / 0.5)).clip(0, 1)
    if name in ('cold', 'escape', 'orbit', 'flight'):  # the dark: a low, slow tone
        bed = filt(brown(n), 'lowpass', 110) * 0.5 + 0.25 * np.sin(2 * np.pi * 46 * tt) * (0.6 + 0.4 * np.sin(2 * np.pi * 0.07 * tt))
        put(t0, bed * fade, 0.10)
    if name in ('flight', 'orbit'):  # the ship's engine
        eng = filt(brown(n), 'lowpass', 170) + 0.5 * np.sin(2 * np.pi * 37 * tt) + 0.2 * np.sin(2 * np.pi * 74.3 * tt)
        eng *= 1 + 0.12 * np.sin(2 * np.pi * 0.4 * tt)
        put(t0, eng * fade, 0.055 if name == 'flight' else 0.035)
    if name == 'title':
        put(t0 + 0.5, bell(mnote(45), 5.0), 0.5)
    if name == 'build':  # workshop: clock, and small taps when Trurl's hand reaches the case
        for k in range(int(d)):
            put(t0 + k + 0.2, click(1800 if k % 2 else 1400, 0.01), 0.18, 0.5)
        kk = 0
        while 1.6 + kk * 3.2 < d - 0.5:
            tp = t0 + 1.6 + kk * 3.2
            for j in range(3): put(tp + j * 0.11, mx(ping(rng.uniform(3200, 5200), 0.25) * 0.4, click(4000, 0.004)), 0.22, 0.15)
            kk += 1
        put(t0, filt(noise(n), 'lowpass', 900) * fade, 0.012)
    if name == 'world':
        w = C(sh, 'wind')[0]; a, b = w['at'], w['to']; tc = a; gap = 0.2
        while tc < b:  # ratchet of the key, quickening
            put(t0 + tc, mx(click(3200, 0.008), thock(900, 0.012) * 0.3), 0.32, 0.45); tc += gap; gap = max(0.075, gap * 0.92)
        m0 = C(sh, 'motif')[0]['at']; beat = 0.34; u_of = lambda x: min(1, max(0, (x - 1.2) / (d - 0.4 - 1.2))) ** 2
        tc = m0
        while tc < d - 0.2:  # repeat the tune while we travel in
            notes, tend = motif_times(tc, beat)
            for tn, m in notes:
                if tn >= d - 0.1: break
                u = u_of(tn)
                put(t0 + tn, mbox(mnote(m)), 0.5 * (1 - u) ** 1.3, 0.1)
                if u > 0.05: putv(t0 + tn, bell(mnote(m - 24), 5), 2.4, 0.35, 0.55 * u, -0.05)
            tc = tend + beat
        birds = np.zeros(n)
        for j in range(26):
            st = rng.uniform(5, d - 1); f = rng.uniform(2600, 4200); k = int(0.07 * SR); tk = np.arange(k) / SR
            ch = np.sin(2 * np.pi * (f + 900 * np.sin(2 * np.pi * 14 * tk)) * tk) * np.hanning(k); i = int(st * SR); birds[i:i + k] += ch * u_of(st)
        put(t0, birds, 0.05, 0.3)
    if name in ('govern', 'govern2'):  # the hall; keys; teletype
        put(t0, (filt(noise(n), 'lowpass', 300) * 0.6 + 0.3 * np.sin(2 * np.pi * 60 * tt)) * fade, 0.025)
        for c in C(sh, 'type'):
            for i, ch in enumerate(c['text']):
                tk = c['at'] + i / 9 + rng.uniform(-0.02, 0.02)
                if ch != ' ': putv(t0 + tk, mx(click(2600, 0.007), thock(rng.uniform(160, 220), 0.03) * 0.5), 1.2, 0.18, 0.5, 0.1)
                else: putv(t0 + tk, thock(120, 0.05), 1.2, 0.18, 0.4, 0.1)
            te = c['at'] + len(c['text']) / 9 + 0.15
            putv(t0 + te, mx(thock(90, 0.07), click(1200, 0.02)), 1.2, 0.2, 0.6, 0.1); putv(t0 + te + 0.05, mx(ping(2400, 0.9), 0.5 * ping(3610, 0.6)), 2.0, 0.3, 0.12, 0.2)
        for c in C(sh, 'reply'):
            for i in range(len(c['text'])):
                putv(t0 + c['at'] + i / 24, mx(click(1700, 0.005) * 0.8, thock(300, 0.012) * 0.3), 1.2, 0.2, 0.28, -0.1)
    if name == 'inhabit':  # the street, full size: wind, the far bells, footsteps, the falling decree
        wnd = filt(noise(n), 'bandpass', [250, 1100]) * (0.6 + 0.4 * np.sin(2 * np.pi * 0.11 * tt + 1))
        put(t0, wnd * fade, 0.05)
        notes, _ = motif_times(0.6, 0.62)
        for tn, m in notes[:7]: putv(t0 + tn, bell(mnote(m - 24), 5), 3.0, 0.5, 0.12, 0.4)
        for k in range(40):
            ts = 0.3 + k * np.pi / 6
            if ts > 5.6: break
            near = min(1, ts / 5.6)
            put(t0 + ts, mx(thock(110, 0.05), filt(noise(int(0.03 * SR)), 'bandpass', [600, 3000]) * 0.4), 0.12 + 0.3 * near, -0.05)
        pa = C(sh, 'paper')[0]['at']; k = int(3.6 * SR); tk = np.arange(k) / SR
        fl = filt(noise(k), 'bandpass', [900, 4500]) * (0.5 + 0.5 * np.sin(2 * np.pi * 7 * tk) ** 2) * np.minimum(1, tk / 0.4) * np.exp(-tk / 2.5)
        put(t0 + pa, fl, 0.08, 0.1)
        pu = C(sh, 'pickup')[0]['at']
        for j in range(9): put(t0 + pu + j * 0.04 + rng.uniform(0, 0.03), filt(noise(int(0.02 * SR)), 'bandpass', [1500, 6000]), 0.12, -0.05)
    if name == 'crowd':  # an afternoon of the king's, a century of theirs; then the hand
        lap = C(sh, 'lapse')[0]; hd = C(sh, 'hand')[0]
        rate = np.ones(n)
        a, b = int(lap['at'] * SR), int(lap['to'] * SR); rate[a:b] = 1 + 7 * np.linspace(0, 1, b - a) ** 2; rate[b:] = 1
        raw = murmur(80, 6)
        bells = np.zeros(int(80 * SR)); tb = 1.0
        while tb < 78:
            for tn, m in motif_times(tb, 0.6)[0][:4]: i = int(tn * SR); bl = bell(mnote(m - 24), 4); bells[i:i + len(bl)] += bl[: len(bells) - i]
            tb += 7.5
        bed = vary_rate(raw * 0.8 + bells * 0.6, rate)[:n]
        if len(bed) < n: bed = np.concatenate([bed, np.zeros(n - len(bed))])
        hs, he = hd['at'], hd['to']
        gate = np.ones(n); i0, i1 = int((he - 0.6) * SR), int(he * SR); gate[i0:i1] = np.linspace(1, 0, i1 - i0); gate[i1:] = 0
        duck = np.ones(n)
        for ln in sh['lines']:
            i0, i1 = int((ln['t0'] - 0.3) * SR), int((ln['t1'] + 0.3) * SR); duck[max(0, i0):i1] = 0.3
        duck = filt(duck, 'lowpass', 3)
        st = verb(bed * gate * fade * duck, 1.7, 0.25); put(t0, st[0], 0.24, 0, st=st)
        k0 = int(hs * SR); kn = int((he - hs + 2.5) * SR); tk = np.arange(kn) / SR; sw = np.minimum(1, tk / (he - hs)) ** 2 * np.exp(-np.maximum(0, tk - (he - hs)) / 0.9)
        sub = (np.sin(2 * np.pi * (30 + 14 * np.minimum(1, tk / (he - hs))) * tk) + 0.4 * filt(brown(kn), 'lowpass', 90)) * sw
        creak = filt(noise(kn), 'bandpass', [700, 1400]) * (np.abs(np.sin(2 * np.pi * 3.1 * tk)) ** 8) * sw
        put(t0 + hs, sub, 0.5); put(t0 + hs, creak, 0.05, 0.2)
        put(t0 + he, thock(55, 0.4), 0.6)
    if name == 'question':  # the study clock stops for the line
        lnK = [l for l in sh['lines'] if l['line']][0]; stop0, stop1 = lnK['t0'] - 0.5, lnK['t1'] + 1.6
        k = 0.4
        while k < d - 0.2:
            if not (stop0 < k < stop1): put(t0 + k, mx(click(1300, 0.012), thock(400, 0.02) * 0.3), 0.16, 0.6)
            k += 1.15
        put(t0, filt(noise(n), 'lowpass', 700) * fade, 0.012)
    if name == 'escape':  # glass breaks; a small ship; small cheers
        ca = C(sh, 'crack')[0]['at']
        put(t0 + ca, filt(noise(int(0.08 * SR)), 'highpass', 1500) * env_decay(int(0.08 * SR), 0.02), 0.9, -0.4)
        for j in range(30):
            tj = ca + rng.uniform(0, 1.6) ** 1.6; put(t0 + tj, ping(rng.uniform(2800, 8500), rng.uniform(0.2, 1.0)), 0.1 * rng.uniform(0.4, 1), rng.uniform(-0.8, 0.2))
        la = C(sh, 'launch')[0]['at']; kn = int((d - la) * SR); tk = np.arange(kn) / SR; u = tk / tk[-1]
        rk = np.zeros(kn); nz = noise(kn); blk = int(0.05 * SR)
        for i in range(0, kn, blk):
            fc = 6000 * (1 - u[i]) + 700 * u[i]; rk[i:i + blk] = filt(nz[i:i + blk + 200], 'bandpass', [fc * 0.5, fc * 1.5])[:len(rk[i:i + blk])]
        put(t0 + la, rk * (0.15 + 0.85 * u) * np.minimum(1, tk / 0.3), 0.22, -0.2)
        ch = murmur(3.5, 5, pitch=1.6); put(t0 + la + 0.4, ch * np.hanning(len(ch)), 0.1, -0.5)
    if name == 'orbit':
        bu = C(sh, 'bump')[0]['at']
        clang = mx(*[ping(180 * r, 1.6 / r ** 0.4) * a for r, a in [(1, 1), (2.76, 0.6), (5.4, 0.35), (8.9, 0.2)]], thock(60, 0.25))
        putv(t0 + bu, clang, 0.3, 0.3, 0.5, 0.3)
        mo = C(sh, 'moon')[0]['at']
        for tn, m in motif_times(mo, 0.7)[0]:
            if tn > d + 4: break
            putv(t0 + tn, mbox(mnote(m - 12) * (1 + 0.014 * rng.standard_normal()), 2.6), 3.2, 0.45, 0.35, 0.25)
    if name == 'end':  # the spring runs down
        tn = 0.3; beat = 0.36
        for j, (m, b) in enumerate(MOTIF[:9]):
            put(t0 + tn, mbox(mnote(m) * (1 - 0.004 * j)), 0.35, 0.1); tn += b * beat; beat *= 1.18

# ---------------- voices into their rooms ----------------
for sh in shots:
    rt, wet = ROOM.get(sh['room'] or 'space', (0.4, 0.1))
    for ln in sh['lines']:
        a = ln.pop('_a'); g = 0.95 if ln['who'] != 'N' else 0.8; pan = PAN.get((sh['shot'], ln['who']), 0.0)
        if ln['who'] == 'N': putv(sh['t0'] + ln['t0'], a, 0.4, 0.05, g, 0)
        elif sh['room'] == 'cabin': putv(sh['t0'] + ln['t0'], filt(a, 'bandpass', [140, 6500]), rt, wet, g, pan)
        elif ln['small']: putv(sh['t0'] + ln['t0'], filt(a, 'highpass', 300), 0.9, 0.25, 0.5, pan)
        else: putv(sh['t0'] + ln['t0'], a, rt, wet, g, pan)

mix = np.stack([L, Rr], 1); mix /= np.abs(mix).max() + 1e-9; mix *= 0.89
raw = os.path.join(HERE, 'audio', 'sally.wav')
with wave.open(raw, 'wb') as f:
    f.setnchannels(2); f.setsampwidth(2); f.setframerate(SR); f.writeframes((mix * 32767).astype(np.int16).tobytes())
subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', raw, '-af', 'loudnorm=I=-16:TP=-1.5:LRA=14', '-ar', '48000', '-c:a', 'aac', '-b:a', '192k', os.path.join(HERE, 'audio', 'sally.m4a')], check=True)
os.remove(raw)
json.dump(dict(shots=shots, dur=TOTAL, cast=CAST), open(os.path.join(HERE, 'timing', 'sally.json'), 'w'))
print('sally', TOTAL, 's,', len(shots), 'shots')
for sh in shots: print(f"  {sh['shot']:9s} {sh['t0']:7.2f} {sh['d']:6.2f}", ' | '.join(f"{l['who']}@{l['t0']:.1f}-{l['t1']:.1f}" for l in sh['lines']))
