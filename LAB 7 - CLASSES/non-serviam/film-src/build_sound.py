"""Voices, sound and music for Non Serviam.
   python3 build_sound.py  ->  timing/ns.json and audio/ns.m4a
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
MUR_LINES = ['is there a maker', 'we build, we wonder', 'what is this place', 'count the spheres again', 'the eighth generation said so', 'we know only what we observe', 'who began us', 'listen', 'the stair goes nowhere', 'divide, and divide']
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
ROOM = {'lab': (0.9, 0.16), 'world': (3.2, 0.3)}
PAN = {('colloquy', 'E'): -0.4, ('colloquy', 'A'): 0.15, ('colloquy', 'Q'): 0.5, ('listens', 'I'): 0.45, ('listens', 'D'): -0.2, ('activate', 'D'): -0.2, ('bill', 'D'): -0.2}

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


# ---------------- the machine, the tape, the dome ----------------
def hum(n, tt):
    return (0.5 * np.sin(2 * np.pi * 50 * tt) + 0.3 * np.sin(2 * np.pi * 100 * tt) + 0.12 * np.sin(2 * np.pi * 150 * tt)) * 0.5 + filt(noise(n), 'lowpass', 380) * 0.35
def whine(n, tt, speed):
    """the computer's motor: speed 0 (off) .. 1 (slow) .. 4 (fast), per sample"""
    f = 120 + 160 * speed; ph = 2 * np.pi * np.cumsum(f) / SR
    return (np.sin(ph) + 0.3 * np.sin(2 * ph) + 0.15 * np.sin(3.01 * ph)) * np.clip(speed, 0, 1) * 0.5
def harmonica(f, dur=3.2):
    n = int(dur * SR); t = np.arange(n) / SR; a = np.minimum(1, t / 0.18) * np.exp(-np.maximum(0, t - 0.18) / 1.3)
    return (np.sin(2 * np.pi * f * t) + 0.25 * np.sin(2 * np.pi * 2 * f * t) + 0.08 * np.sin(2 * np.pi * 3 * f * t)) * a * 0.4
def tape_print(t0, c, gain=0.4, pan=0.35):
    for i, ch in enumerate(c['text']):
        tk = c['at'] + i / c['rate']
        if ch == ' ': put(t0 + tk, thock(260, 0.01), gain * 0.3, pan)
        else: put(t0 + tk, mx(click(2200, 0.006), thock(340, 0.014) * 0.4), gain * (0.7 if c['rate'] > 12 else 1), pan)
def tape_secs(c): return len(c['text']) / c['rate']
def speed_curve(n, pts):
    """pts: list of (time, speed) breakpoints; linear ramps of 0.8 s into each new value"""
    sp = np.zeros(n); cur = pts[0][1]; last = 0
    for (tb, v) in pts[1:]:
        i = int(tb * SR); sp[last:i] = cur; r = min(n - i, int(0.8 * SR))
        if r > 0: sp[i:i + r] = np.linspace(cur, v, r)
        cur = v; last = i + max(r, 0)
    sp[last:] = cur; return sp
def babble_fast(n, rate, gain_lp=1500):
    raw = murmur(max(6, n / SR * rate + 4), 7)
    out = vary_rate(raw, np.full(n, rate))[:n]
    if len(out) < n: out = np.concatenate([out, np.zeros(n - len(out))])
    return filt(out, 'lowpass', gain_lp)
def inside_bed(n, tt):
    air = filt(noise(n), 'bandpass', [180, 900]) * (0.6 + 0.4 * np.sin(2 * np.pi * 0.06 * tt))
    pad = 0.5 * np.sin(2 * np.pi * 55 * tt) * (0.5 + 0.5 * np.sin(2 * np.pi * 0.11 * tt)) + 0.3 * np.sin(2 * np.pi * 82.6 * tt)
    return air * 0.5 + pad * 0.25
def duck_for(sh, n, depth=0.35):
    d = np.ones(n)
    for ln in sh['lines']:
        i0, i1 = int((ln['t0'] - 0.3) * SR), int((ln['t1'] + 0.3) * SR); d[max(0, i0):i1] = depth
    return filt(d, 'lowpass', 3)

GEAR = {'slow': 1.0, 'fast': 4.0}
for sh in shots:
    t0, d, name = sh['t0'], sh['d'], sh['shot']
    n = int(d * SR); tt = np.arange(n) / SR
    fade = np.minimum(1, np.minimum(tt / 0.4, (d - tt) / 0.4)).clip(0, 1)
    duck = duck_for(sh, n)
    if sh['room'] == 'lab':
        pts = [(0, 1.0)]
        if name == 'activate': pts = [(0, 0.0), (C(sh, 'power')[0]['at'], 1.0)]
        for c in C(sh, 'lever'): pts.append((c['at'] + 0.2, GEAR[c['to']]))
        sp = speed_curve(n, pts)
        bed = hum(n, tt) * (0.25 if name == 'activate' and False else 1)
        if name == 'activate': bed *= np.clip(sp + 0.25, 0, 1)
        put(t0, bed * fade * duck, 0.05)
        put(t0, whine(n, tt, sp) * fade * duck, 0.035, 0.1)
        fast = np.clip((sp - 1) / 3, 0, 1)
        if fast.max() > 0:  # the world heard from outside while it runs fast: tiny, quick voices behind glass
            bb = babble_fast(n, 5.5) * fast * fade * duck
            put(t0, bb, 0.06, 0.05)
        for c in C(sh, 'tape'): tape_print(t0, c, 0.32)
        for c in C(sh, 'lever'):
            put(t0 + c['at'], mx(thock(70, 0.25), click(900, 0.04)), 0.55, -0.1); put(t0 + c['at'] + 0.06, ping(1400, 0.4), 0.08, -0.1)
    if name == 'title':
        put(t0 + 0.4, harmonica(mnote(57), 4.5), 0.5)
    if name == 'activate':
        for c in C(sh, 'switch'): putv(t0 + c['at'], mx(thock(110, 0.08), click(1500, 0.03)), 0.9, 0.2, 0.5, -0.2)
        pw = C(sh, 'power')[0]['at']
        for j in range(14): put(t0 + pw + j * 0.045 + rng.uniform(0, 0.02), click(rng.uniform(1200, 3500), 0.01), 0.3, rng.uniform(-0.5, 0.5))
        k = int(2.2 * SR); tk = np.arange(k) / SR; sw = np.sin(2 * np.pi * np.cumsum(60 + 340 * (tk / tk[-1]) ** 2) / SR) * np.minimum(1, tk / 0.3) * np.exp(-tk / 1.6)
        put(t0 + pw, sw, 0.12)
    if sh['room'] == 'world':
        put(t0, inside_bed(n, tt) * fade * duck_for(sh, n, 0.5), 0.07)
        if name == 'wake':
            r = C(sh, 'rise')[0]
            putv(t0 + r['at'], harmonica(mnote(69)), 3.2, 0.4, 0.4)
            putv(t0 + r['to'], harmonica(mnote(76)), 3.2, 0.4, 0.3)
            for j in range(3): putv(t0 + r['to'] + 0.3 + j * 0.55, mx(thock(95, 0.06), filt(noise(int(0.02 * SR)), 'bandpass', [500, 2500]) * 0.3), 3.0, 0.3, 0.25, 0.1)
        if name == 'colloquy':
            fl = [l for l in sh['lines'] if l['line']][0]
            for tn, m in motif_times(1.0, 0.9)[0][:6]: putv(t0 + tn, harmonica(mnote(m - 12)), 3.2, 0.45, 0.16, 0.3)
            k = 0.9
            while k < d - 1:
                if not (fl['t0'] - 2.6 < k < fl['t1'] + 1.5): putv(t0 + k, mx(thock(100, 0.05), filt(noise(int(0.015 * SR)), 'bandpass', [600, 3000]) * 0.25), 3.0, 0.3, 0.08, rng.uniform(-0.6, 0.6))
                k += rng.uniform(1.6, 3.2)
        if name == 'after':
            for tn, m in motif_times(0.8, 0.8)[0]: putv(t0 + tn, harmonica(mnote(m - 12)), 3.2, 0.45, 0.28, 0.2)
            pu = C(sh, 'pull')[0]; a, b = pu['at'], pu['to']
            out = np.clip((tt - a) / (b - a), 0, 1) ** 1.5
            put(t0, hum(n, tt) * out * fade, 0.05); put(t0, whine(n, tt, np.full(n, 4.0)) * out * fade, 0.035, 0.1)
            put(t0, babble_fast(n, 5.5) * out * fade, 0.06, 0.05)
            for j in range(int((d - b) * 18)): put(t0 + b - 1 + j / 18, mx(click(2200, 0.006), thock(340, 0.014) * 0.4), 0.18 * out[min(n - 1, int((b - 1 + j / 18) * SR))], 0.35)
    if name == 'bill':
        op = C(sh, 'open')[0]['at']
        k = int(0.9 * SR); tk = np.arange(k) / SR
        put(t0 + op, filt(noise(k), 'bandpass', [1200, 6000]) * (0.4 + 0.6 * np.abs(np.sin(2 * np.pi * 9 * tk))) * np.exp(-tk / 0.5), 0.12, -0.15)
        for j in range(6): put(t0 + op + 1.2 + j * 0.05, filt(noise(int(0.02 * SR)), 'bandpass', [1500, 6000]), 0.1, -0.15)
        rc = C(sh, 'reach')[0]
        put(t0 + rc['to'], mx(ping(2600, 0.5) * 0.5, click(3000, 0.004)), 0.12, -0.3)
        k = int(1.6 * SR); tk = np.arange(k) / SR
        put(t0 + rc['to'] + 0.1, filt(noise(k), 'bandpass', [400, 1200]) * np.abs(np.sin(2 * np.pi * 2.3 * tk)) ** 6 * np.exp(-tk / 0.8), 0.05, -0.3)
    if name == 'end':
        put(t0, hum(n, tt) * np.exp(-tt / 2.5), 0.05)
        for j in range(30): put(t0 + 0.2 + j / 12, mx(click(2200, 0.006), thock(340, 0.014) * 0.4), 0.15 * np.exp(-j / 10), 0.35)

# ---------------- voices into their rooms ----------------
for sh in shots:
    rt, wet = ROOM.get(sh['room'] or 'lab', (0.6, 0.1))
    for ln in sh['lines']:
        a = ln.pop('_a'); pan = PAN.get((sh['shot'], ln['who']), 0.0)
        if ln['who'] == 'N': putv(sh['t0'] + ln['t0'], a, 0.4, 0.05, 0.8, 0)
        elif ln['who'] in 'AEQ': putv(sh['t0'] + ln['t0'], filt(a, 'highpass', 120), rt, wet, 0.95, pan)
        else: putv(sh['t0'] + ln['t0'], a, rt, wet, 0.95, pan)

mix = np.stack([L, Rr], 1); mix /= np.abs(mix).max() + 1e-9; mix *= 0.89
raw = os.path.join(HERE, 'audio', 'ns.wav')
with wave.open(raw, 'wb') as f:
    f.setnchannels(2); f.setsampwidth(2); f.setframerate(SR); f.writeframes((mix * 32767).astype(np.int16).tobytes())
subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', raw, '-af', 'loudnorm=I=-16:TP=-1.5:LRA=14', '-ar', '48000', '-c:a', 'aac', '-b:a', '192k', os.path.join(HERE, 'audio', 'ns.m4a')], check=True)
os.remove(raw)
json.dump(dict(shots=shots, dur=TOTAL, cast=CAST), open(os.path.join(HERE, 'timing', 'ns.json'), 'w'))
print('non serviam', TOTAL, 's,', len(shots), 'shots')
for sh in shots: print(f"  {sh['shot']:9s} {sh['t0']:7.2f} {sh['d']:6.2f}", ' | '.join(f"{l['who']}@{l['t0']:.1f}-{l['t1']:.1f}" for l in sh['lines']))
