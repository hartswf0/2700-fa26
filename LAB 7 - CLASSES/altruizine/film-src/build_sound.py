"""Voices, sound and music for Altruizine.
   python3 build_sound.py  ->  timing/al.json and audio/al.m4a
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

# ---------------- voices with character ----------------
def fx(a, kind):
    if kind == 'god':  # the modelled being: an octave below doubled under the voice, and a slow shimmer
        lo = resample_poly(a, 2, 1)[: len(a) * 2]; lo = vary_rate(lo, np.full(len(a), 2.0))[: len(a)]
        if len(lo) < len(a): lo = np.concatenate([lo, np.zeros(len(a) - len(lo))])
        t = np.arange(len(a)) / SR; out = a * 0.8 + lo * 0.45; d = int(0.023 * SR); out[d:] += out[:-d] * 0.35
        return out * (0.92 + 0.08 * np.sin(2 * np.pi * 5.5 * t))
    return a
ROOM = {'yard': (0.5, 0.08), 'sand': (0.3, 0.05), 'machine': (3.2, 0.32), 'city': (1.0, 0.16), 'space': (0.3, 0.05)}
PAN = {('yard', 'T'): -0.3, ('yard', 'B'): 0.25, ('yard2', 'T'): -0.3, ('yard2', 'B'): 0.25, ('gnosto', 'K'): -0.3, ('police', 'P'): -0.3}

# ---------------- timing pass ----------------
shots = []; t = 0.0
for s in SCRIPT:
    sh = dict(shot=s['shot'], t0=round(t, 3), cues=[dict(c) for c in s.get('cues', [])], lines=[], room=s.get('room'), grid=s.get('grid'), open=s.get('open'), src=s.get('src'), me=s.get('me'), well=s.get('well'))
    cur = 0.0
    for ln in s.get('lines', []):
        c = CAST[ln['who']]; sp = c['speed'] * (0.94 if ln.get('line') else 1.0)
        a = speak(ln['say'], c['voice'], sp)
        if c.get('fx'): a = fx(a, c['fx'])
        st = ln['at'] if 'at' in ln else cur + ln.get('pre', 0.6); d = len(a) / SR
        hop = SR // 24; envl = [float(np.sqrt(np.mean(a[i:i + hop] ** 2))) for i in range(0, len(a), hop)]
        emax = max(envl) or 1; envl = [round(min(1, (v / emax) ** 0.7), 2) for v in envl]
        sh['lines'].append(dict(who=ln['who'], say=ln['say'], t0=round(st, 3), t1=round(st + d, 3), line=bool(ln.get('line')), env=envl, _a=a))
        cur = st + d
    sh['d'] = round(s['d'] if 'd' in s else cur + s.get('tail', 1.5), 3)
    for c in sh['cues']:
        if c['k'] == 'print' and c['at'] < 0: c['at'] = round(sh['lines'][-1]['t1'] + 0.2, 3)
    shots.append(sh); t += sh['d']
TOTAL = round(t, 3)
L = L[: int((TOTAL + 3) * SR)]; Rr = Rr[: len(L)]
def C(sh, k): return [c for c in sh['cues'] if c['k'] == k]

# ---------------- the copied cry: one sound per neighbour, delayed by distance, louder as more share it ----------------
CRY_TEXT = {'ow': ['Ow!', 'Agh!', 'Oof!'], 'aah': ['Aaah.', 'Ohh, my tooth.', 'Ahh.'], 'scream': ['Aaah!', 'Help!', 'Eek!'], 'achoo': ['Achoo!', 'Atchoo!'], 'sob': ['Oh, oh.', 'Ohhh.'], 'moo': ['Ohhh.', 'Oh, oh, oh.', 'Mmmh.']}
CRY_VOICES = ['af_bella', 'am_adam', 'bf_alice', 'bm_daniel', 'af_nicole', 'am_eric', 'bf_isabella', 'am_liam', 'af_river', 'bm_fable', 'af_sarah', 'am_michael', 'bf_emma', 'af_sky']
def cow(d=2.2):
    n = int(d * SR); t = np.arange(n) / SR; f = 115 + 20 * np.sin(np.pi * t / d) - 30 * t / d
    ph = 2 * np.pi * np.cumsum(f) / SR; s = sum(np.sin(k * ph) / k for k in range(1, 9))
    s = filt(s, 'bandpass', [180, 1400]) * np.sin(np.pi * t / d) ** 0.6; return s * 0.6
def wave_cells(sh, c):
    cols, rows = sh['grid']; out = []
    for r in range(rows):
        for q in range(cols):
            if sh.get('me') and [q, r] == sh['me']: continue
            dist = ((q - c['src'][0]) ** 2 + (r - c['src'][1]) ** 2) ** 0.5
            out.append((q, r, dist, c['at'] + dist / c['speed']))
    return sorted(out, key=lambda x: x[3])
for sh in shots:
    for c in C(sh, 'wave'):
        cells = wave_cells(sh, c); cols, rows = sh['grid']
        if c['cry'] == 'moo': put(sh['t0'] + c['at'], cow(c['dur'] * 0.7), 0.5, 0.6)
        for i, (q, r, dist, ta) in enumerate(cells):
            if dist == 0 and c['cry'] == 'moo': continue
            txt_ = CRY_TEXT[c['cry']][(q + r * 3) % len(CRY_TEXT[c['cry']])]; v = CRY_VOICES[(q * 5 + r * 7 + i) % len(CRY_VOICES)]
            a = speak(txt_, v, 1.0 + 0.1 * ((q + r) % 3))
            reson = 0.35 + 0.65 * (i + 1) / len(cells)  # the more who share it, the louder each copy
            pan = (q / max(1, cols - 1)) * 1.6 - 0.8
            putv(sh['t0'] + ta + 0.05 * hash_ if (hash_ := ((q * 31 + r * 17) % 7) / 7) else sh['t0'] + ta, a, 0.8, 0.15, 0.32 * reson, pan)
            if c['feel'] == 'blow': put(sh['t0'] + ta, thock(90 + 10 * r, 0.06), 0.25 * reson, pan)
        # the feedback: the sum of the copies, fed back and swelling, then cut
        span = cells[-1][3] - c['at'] + c['dur']; n = int(span * SR); tt_ = np.arange(n) / SR
        fb = filt(noise(n), 'bandpass', [300, 1600]) * (tt_ / span) ** 2 * np.exp(-np.maximum(0, tt_ - span * 0.85) / 0.1)
        put(sh['t0'] + c['at'], fb, 0.06)

# ---------------- beds and effects ----------------
NT = len(L); tt = np.arange(NT) / SR
for sh in shots:
    t0, d, name = sh['t0'], sh['d'], sh['shot']; n = int(d * SR); tl = np.arange(n) / SR
    fade = np.minimum(1, np.minimum(tl / 0.5, (d - tl) / 0.5)).clip(0, 1)
    if name in ('yard', 'yard2'):
        b = filt(noise(n), 'bandpass', [2500, 7000]) * 0.15
        for j in range(int(d * 1.2)):
            i = int(rng.uniform(0, d) * SR); k = int(0.09 * SR); tk = np.arange(k) / SR
            ch_ = np.sin(2 * np.pi * (3200 + 800 * np.sin(2 * np.pi * 30 * tk)) * tk) * np.hanning(k)
            if i + k < n: b[i:i + k] += ch_ * 0.5
        put(t0, b * fade, 0.06, 0.3)
        if name == 'yard':
            co = C(sh, 'collapse')[0]['at']
            for j in range(4): put(t0 + co + j * 0.13, mx(filt(noise(int(0.06 * SR)), 'highpass', 2000) * env_decay(int(0.06 * SR), 0.015), ping(5200, 0.2)), 0.45, 0.2)
            for j in range(14): put(t0 + co + 0.6 + rng.uniform(0, 1.4) ** 1.5, mx(thock(rng.uniform(120, 400), 0.05), ping(rng.uniform(900, 3000), 0.2) * 0.5), 0.35, rng.uniform(-0.3, 0.6))
            rp = C(sh, 'repair')[0]
            for j in range(16):
                tj = rp['at'] + j * (rp['to'] - rp['at']) / 16; put(t0 + tj, mx(click(2400, 0.02), click(1600, 0.02)), 0.3, 0)
                if j % 4 == 3: k = int(0.5 * SR); put(t0 + tj, filt(noise(k), 'bandpass', [800, 3000]) * np.hanning(k), 0.08, 0)
    if name == 'title':
        for tn, m in motif_times(t0 + 0.6, 0.34)[0][:9]: put(tn, mbox(mnote(m)), 0.3, 0.1)
    if name == 'cube':
        put(t0, (filt(noise(n), 'bandpass', [150, 700]) * (0.6 + 0.4 * np.sin(2 * np.pi * 0.1 * tl))) * fade, 0.08)
        for j in range(int(d / 1.6)):  # scratching, yawning
            tj = rng.uniform(1, d - 1); k = int(0.5 * SR); tk = np.arange(k) / SR
            put(t0 + tj, filt(noise(k), 'bandpass', [1500, 4500]) * (np.abs(np.sin(2 * np.pi * 9 * tk)) ** 3) * np.hanning(k), 0.07, rng.uniform(-0.7, 0.7))
        put(t0 + sh['lines'][1]['t1'] + 1.0, speak('Hmm.', 'am_puck', 0.8), 0.25, 0.4)
        put(t0 + sh['lines'][1]['t1'] + 2.4, speak('Hhhaaa.', 'bm_daniel', 0.7) * 0.6, 0.2, -0.4)
    if name in ('gnosto', 'card'):
        hum_ = 0.5 * np.sin(2 * np.pi * 55 * tl) + 0.3 * np.sin(2 * np.pi * 82.5 * tl) + 0.2 * np.sin(2 * np.pi * 110.3 * tl) + filt(noise(n), 'lowpass', 250) * 0.4
        put(t0, hum_ * fade, 0.06)
        for j in range(int(d * 2)): put(t0 + rng.uniform(0, d), ping(rng.uniform(1200, 3200), 0.15), 0.06, rng.uniform(-0.8, 0.8))
        for c in C(sh, 'print'):
            for j in range(60): put(t0 + c['at'] + j / 20, mx(click(2200, 0.006), thock(340, 0.014) * 0.4), 0.25, 0.3)
        if name == 'card':
            for j in range(160): put(t0 + 0.2 + j / 40, mx(click(2400, 0.005), thock(360, 0.012) * 0.3), 0.18, 0.2)
    if name == 'inn':
        put(t0, filt(noise(n), 'bandpass', [400, 2400]) * 0.3 * fade, 0.04)
        pc = C(sh, 'pinch')[0]['at']; put(t0 + pc, ping(2600, 0.6), 0.12, -0.2); put(t0 + pc + 0.9, mx(thock(70, 0.2), filt(noise(int(0.3 * SR)), 'lowpass', 900) * env_decay(int(0.3 * SR), 0.08)), 0.35, -0.2)
        for j in range(30): k_ = t0 + 0.5 + j * 0.62; put(k_, mx(ping(900 + 40 * (j % 3), 0.3) * 0.5, click(700, 0.04)), 0.05, -0.4)  # the well chain
        put(t0 + 4.4, cow(2.0), 0.35, 0.6)
    if name == 'bridge':
        w = filt(noise(n), 'bandpass', [300, 2500]) * (0.7 + 0.3 * np.sin(2 * np.pi * 0.3 * tl)); put(t0, w * fade, 0.12)
        sp = C(sh, 'spill')[0]['at']; put(t0 + sp, mx(thock(140, 0.08), click(1200, 0.05)), 0.6, 0.2)
        put(t0 + sp + 0.6, filt(noise(int(1.5 * SR)), 'bandpass', [600, 4000]) * env_decay(int(1.5 * SR), 0.4), 0.3, 0.2)
    if name == 'city':
        put(t0, (filt(brown(n), 'lowpass', 300) + filt(noise(n), 'bandpass', [200, 900]) * 0.3) * fade, 0.05)
        fire = filt(noise(n), 'bandpass', [400, 3000]) * (np.random.default_rng(5).random(n) > 0.997) * 3 + filt(brown(n), 'lowpass', 200)
        on = np.clip((tl - 7.5) / 3, 0, 1); put(t0, fire * on * fade, 0.04, -0.5)
        c = [x for x in C(sh, 'wave') if x.get('cat')][0]
        for j in range(5): put(t0 + c['at'] - 1.2 + j * 0.18, ping(rng.uniform(4000, 6000), 0.08), 0.1, 0.2)
        put(t0 + c['at'] - 0.3, speak('Mrrraow!', 'af_sky', 1.3), 0.3, 0.2)
        put(t0 + 27.0, mx(*[bell(mnote(45 + k_ * 7), 4.0) * 0.4 for k_ in range(2)]), 0.15, -0.6)
    if name == 'police':
        put(t0, filt(noise(n), 'bandpass', [200, 900]) * 0.3 * fade, 0.04)
        put(t0 + C(sh, 'punch')[0]['at'], mx(thock(80, 0.2), filt(noise(int(0.05 * SR)), 'highpass', 1500) * env_decay(int(0.05 * SR), 0.01)), 0.8, -0.1)
        fl = [l for l in sh['lines'] if l['line']][0]
        put(t0 + fl['t1'] + 0.8, mx(click(3000, 0.02), ping(2200, 0.3)), 0.5, -0.2); put(t0 + fl['t1'] + 1.0, click(3000, 0.02), 0.5, 0.2)
    if name == 'cannon':
        fi = C(sh, 'fire')[0]['at']
        put(t0 + fi, mx(thock(45, 0.9), filt(noise(int(1.6 * SR)), 'lowpass', 1200) * env_decay(int(1.6 * SR), 0.5)), 1.0)
        put(t0 + fi, filt(brown(int(4 * SR)), 'lowpass', 300) * env_decay(int(4 * SR), 1.5), 0.4)
        sp_ = filt(brown(n), 'lowpass', 90) * 0.6 + 0.3 * np.sin(2 * np.pi * 41 * tl); put(t0, sp_ * np.clip((tl - fi) / 3, 0, 1) * fade, 0.08)
        for j in range(14): put(t0 + fi + 0.3 + rng.uniform(0, 3) ** 1.3, ping(rng.uniform(1500, 6000), 0.3), 0.12, rng.uniform(-0.8, 0.8))
        fl = [l for l in sh['lines'] if l['line']][0]
        for tn, m in motif_times(t0 + fl['t1'] + 0.6, 0.55)[0][:7]: putv(tn, mbox(mnote(m - 12), 2.4), 2.6, 0.4, 0.25, 0.1)
    if name == 'end':
        for j, (m, b) in enumerate(MOTIF[:5]): put(t0 + 0.4 + j * 0.42, mbox(mnote(m)), 0.25, 0.1)

# ---------------- voices: Bonhomius is a robot, so his voice is never copied ----------------
for sh in shots:
    rt, wet = ROOM.get(sh['room'] or 'yard', (0.6, 0.1))
    for ln in sh['lines']:
        a = ln.pop('_a'); who = ln['who']; pan = PAN.get((sh['shot'], who), 0.0)
        if who == 'B' and sh['shot'] not in ('yard', 'yard2'): put(sh['t0'] + ln['t0'], a, 0.9, 0)
        else: putv(sh['t0'] + ln['t0'], a, rt, wet, 0.95, pan)
        if who == 'P':  # everyone in earshot says it with him: the neighbours' copies
            for k, dl in enumerate([0.09, 0.17, 0.26, 0.34, 0.45]):
                b = speak(ln['say'], CRY_VOICES[k * 2], 0.92); putv(sh['t0'] + ln['t0'] + dl, b, 1.2, 0.3, 0.32 * 0.85 ** k, (-1) ** k * 0.5)

mix = np.stack([L, Rr], 1); mix /= np.abs(mix).max() + 1e-9; mix *= 0.89
raw = os.path.join(HERE, 'audio', 'al.wav')
with wave.open(raw, 'wb') as f:
    f.setnchannels(2); f.setsampwidth(2); f.setframerate(SR); f.writeframes((mix * 32767).astype(np.int16).tobytes())
subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', raw, '-af', 'loudnorm=I=-16:TP=-1.5:LRA=14', '-ar', '48000', '-c:a', 'aac', '-b:a', '192k', os.path.join(HERE, 'audio', 'al.m4a')], check=True)
os.remove(raw)
json.dump(dict(shots=shots, dur=TOTAL, cast=CAST), open(os.path.join(HERE, 'timing', 'al.json'), 'w'))
print('altruizine', TOTAL, 's,', len(shots), 'shots')
for sh in shots: print(f"  {sh['shot']:8s} {sh['t0']:7.2f} {sh['d']:6.2f}", ' | '.join(f"{l['who']}@{l['t0']:.1f}-{l['t1']:.1f}" for l in sh['lines']), '|', ' '.join(f"{c['k']}@{c['at']}" for c in sh['cues']))
