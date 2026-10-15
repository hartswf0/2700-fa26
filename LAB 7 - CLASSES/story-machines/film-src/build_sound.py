"""Voices, sound and music for the Storytelling Machines.
   python3 build_sound.py  ->  timing/sm.json and audio/sm.m4a
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
SCRIPT, CAST, CAM = data['SCRIPT'], data['CAST'], data['CAM']

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

total_guess = 300
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
MUR_LINES = ['look, the new stars', 'who thought of us', 'nothing ever ends here', 'Baucis, Ondragor', 'listen, they are calling', 'the laws are kind', 'another sun tonight', 'we are thought of']
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
    if kind == 'machine':
        t = np.arange(len(a)) / SR
        ring = a * (0.78 + 0.22 * np.sin(2 * np.pi * 38 * t))
        d = int(0.0031 * SR); out = ring.copy()
        for k in range(1, 4): out[k * d:] += ring[:-k * d] * (0.42 ** k)
        return filt(out, 'highpass', 110) * 0.8
    if kind == 'tin':
        b = filt(a, 'bandpass', [330, 3600]); d = int(0.0017 * SR); out = b.copy()
        for k in range(1, 5): out[k * d:] += b[:-k * d] * (0.5 ** k)
        return np.tanh(out * 2.2) * 0.55
    return a

# ---------------- timing pass ----------------
def resolve(spec, lines, d):
    if isinstance(spec, (int, float)): return float(spec)
    s = spec.replace(' ', '')
    if s.startswith('end'): return d + (float(s[3:]) if len(s) > 3 else 0)
    i = int(s[1:s.index('.')]); rest = s[s.index('.') + 1:]
    base = lines[i]['t0'] if rest.startswith('t0') else lines[i]['t1']
    return base + (float(rest[2:]) if len(rest) > 2 else 0)

chapters = []; t = 0.0
for s in SCRIPT:
    ch = dict(ch=s['ch'], t0=round(t, 3), stack=s.get('stack', []), room=s.get('room'), lines=[], cues=[])
    cur = 0.0
    for ln in s.get('lines', []):
        c = CAST[ln['who']]; sp = c['speed'] * (0.94 if ln.get('line') else 1.0)
        a = speak(ln['say'], c['voice'], sp)
        if c.get('fx'): a = fx(a, c['fx'])
        st = ln['at'] if 'at' in ln else cur + ln.get('pre', 0.6); d = len(a) / SR
        hop = SR // 24; envl = [float(np.sqrt(np.mean(a[i:i + hop] ** 2))) for i in range(0, len(a), hop)]
        emax = max(envl) or 1; envl = [round(min(1, (v / emax) ** 0.7), 2) for v in envl]
        ch['lines'].append(dict(who=ln['who'], say=ln['say'], t0=round(st, 3), t1=round(st + d, 3), line=bool(ln.get('line')), env=envl, _a=a))
        cur = st + d
    ch['d'] = round(s['d'] if 'd' in s else cur + s.get('tail', 1.5), 3)
    L_ = ch['lines']; dd = ch['d']
    ch['cam'] = [[round(resolve(k[0], L_, dd), 3), k[1]] for k in CAM[s['ch']]]
    cue = lambda k, at, **kw: ch['cues'].append(dict(k=k, at=round(at, 3), **kw))
    if s['ch'] == 'dream': cue('whack', L_[4]['t1'] + 0.1)
    if s['ch'] == 'cave2': cue('snap', L_[1]['t1'] + 0.05)
    if s['ch'] == 'dump':
        cue('jug', L_[0]['t1'] - 1.2, to=L_[0]['t1'] + 1.0)
        cue('assemble', L_[1]['t0'] + 1.2, to=L_[1]['t1'] + 1.2)
        cue('walk', L_[2]['t1'] + 0.2, to=L_[2]['t1'] + 2.6)
        cue('rust', L_[3]['t0'] + 0.6, to=L_[4]['t0'] - 1.0)
        cue('shoe', L_[4]['t0'] - 0.9)
        cue('blind', L_[5]['t0'] + 1.0, to=L_[5]['t1'])
    if s['ch'] == 'gozmos': cue('travelers', L_[1]['t0'] + 2.0)
    if s['ch'] == 'shard': cue('crack', L_[0]['t1'] + 3.6)
    chapters.append(ch); t += ch['d']
TOTAL = round(t, 3)
L = L[: int((TOTAL + 3) * SR)]; Rr = Rr[: len(L)]
def C(ch, k): return [c for c in ch['cues'] if c['k'] == k]

# ---------------- the depth curve, the same one the picture uses ----------------
def depth_at(ch, lt):
    ks = ch['cam']
    if lt <= ks[0][0]: return ks[0][1]
    for a, b in zip(ks, ks[1:]):
        if a[0] <= lt < b[0] and b[0] > a[0]:
            u = (lt - a[0]) / (b[0] - a[0]); u = u * u * (3 - 2 * u); return a[1] + (b[1] - a[1]) * u
    return ks[-1][1]
FR = 100
dcurve = []  # (time, chapter index, depth)
for ci, ch in enumerate(chapters):
    for k in range(int(ch['d'] * FR)): dcurve.append((ch['t0'] + k / FR, ci, depth_at(ch, k / FR)))

# ---------------- beds: one per kind of frame; the stack above you stays audible, muffled ----------------
def kind_of(level): return level.split(':')[0]
KIND_ROOM = {'cave': 'cave', 'vestibule': 'vestibule', 'dream': 'dream', 'galaxy': 'space', 'nebula': 'space', 'cluster': 'space', 'system': 'space', 'planet': 'space', 'moon': 'space', 'dump': 'dump', 'gozmos': 'gozmos'}
NT = int((TOTAL + 3) * SR); tt = np.arange(NT) / SR
def bed(kind):
    if kind == 'cave':
        b = filt(brown(NT), 'lowpass', 160) * 0.5
        for j in range(int(TOTAL / 1.7)): i = int(rng.uniform(0, TOTAL) * SR); p = ping(rng.uniform(900, 1700), 0.35); b[i:i + len(p)] += p[: NT - i] * 0.35
        return b
    if kind == 'vestibule':
        b = filt(noise(NT), 'lowpass', 500) * 0.15 + 0.12 * np.sin(2 * np.pi * 120 * tt)
        for k in range(int(TOTAL)): i = int((k + 0.1) * SR); c = mx(click(1400 if k % 2 else 1900, 0.01), thock(500, 0.015) * 0.3); b[i:i + len(c)] += c[: NT - i] * 0.9
        return b
    if kind == 'dream':
        b = filt(noise(NT), 'bandpass', [400, 1600]) * 0.12
        for j in range(int(TOTAL * 3)):
            i = int(rng.uniform(0, TOTAL) * SR); k = int(0.05 * SR); tk = np.arange(k) / SR
            ch_ = np.sin(2 * np.pi * 4300 * tk) * (np.sin(2 * np.pi * 60 * tk) > 0) * np.hanning(k); b[i:i + k] += ch_[: NT - i] * 0.25
        return b
    if kind == 'space': return filt(brown(NT), 'lowpass', 90) * 0.6 + 0.3 * np.sin(2 * np.pi * 41 * tt) * (0.6 + 0.4 * np.sin(2 * np.pi * 0.05 * tt))
    if kind == 'dump':
        w = filt(noise(NT), 'bandpass', [250, 1200]) * (0.5 + 0.5 * np.sin(2 * np.pi * 0.08 * tt + 2)) * 0.5
        for j in range(int(TOTAL / 2.5)): i = int(rng.uniform(0, TOTAL) * SR); p = ping(rng.uniform(1100, 2200), 0.2); w[i:i + len(p)] += p[: NT - i] * 0.25
        return w
    if kind == 'gozmos':
        b = np.zeros(NT)
        for f, a in [(220, 0.3), (277.2, 0.22), (329.6, 0.22), (440, 0.12), (554.4, 0.08)]: b += a * np.sin(2 * np.pi * f * tt + rng.uniform(0, 6)) * (0.6 + 0.4 * np.sin(2 * np.pi * (0.07 + f / 9000) * tt))
        mu = murmur(60, 6, 1.5); reps = int(np.ceil(NT / len(mu))); b += np.tile(mu, reps)[:NT] * 0.25
        return b * 0.5
BEDS = {k: bed(k) for k in ['cave', 'vestibule', 'dream', 'space', 'dump', 'gozmos']}
# gain envelopes per bed kind, at FR, from the stack and depth
G = {k: np.zeros(len(dcurve)) for k in BEDS}; MUF = {k: np.zeros(len(dcurve)) for k in BEDS}
silence = np.ones(len(dcurve))
for n_, (tg, ci, d) in enumerate(dcurve):
    st = chapters[ci]['stack']
    if not st: continue
    fl = int(np.floor(d))
    for i, lev in enumerate(st):
        kind = KIND_ROOM[kind_of(lev)]
        if i == fl: g, m = 1.0, 0
        elif i == fl + 1: g, m = max(0.0, min(1.0, (d - fl) * 1.6)) * 0.9, 0
        elif i < fl: g, m = 0.45 ** (d - i), 1
        else: continue
        if g > G[kind][n_]: G[kind][n_] = g; MUF[kind][n_] = m
shard = next(c for c in chapters if c['ch'] == 'shard'); crack_t = shard['t0'] + C(shard, 'crack')[0]['at']
gate = np.ones(NT); i0 = int(crack_t * SR); i1 = int((shard['t0'] + shard['lines'][1]['t0'] - 0.3) * SR); gate[i0:i1] = 0.0; gate[i1:i1 + int(2 * SR)] *= np.linspace(0, 1, int(2 * SR))
LEVEL = {'cave': 0.022, 'vestibule': 0.05, 'dream': 0.06, 'space': 0.07, 'dump': 0.06, 'gozmos': 0.08}
for k, b in BEDS.items():
    gfull = np.interp(tt, [x[0] for x in dcurve], G[k]); mfull = np.interp(tt, [x[0] for x in dcurve], MUF[k])
    gfull = filt(gfull, 'lowpass', 4); muff = filt(b, 'lowpass', 600)
    sig = (b * (1 - mfull) + muff * mfull) * gfull * gate
    put(0, sig, LEVEL[k], 0)

# ---------------- the stack chord: every open frame holds one note of the harmonic series ----------------
chord = np.zeros(NT)
for lev in range(9):
    f = 55 * (lev + 2); g = np.zeros(len(dcurve))
    for n_, (tg, ci, d) in enumerate(dcurve):
        if chapters[ci]['stack'] and lev < len(chapters[ci]['stack']) and lev <= d + 0.15: g[n_] = 1.0 / (1 + 0.25 * lev)
    gfull = filt(np.interp(tt, [x[0] for x in dcurve], g), 'lowpass', 2)
    chord += np.sin(2 * np.pi * f * tt + lev) * (1 + 0.25 * np.sin(2 * np.pi * 2 * f * tt)) * gfull
put(0, chord * gate, 0.006, 0)

# ---------------- crossing a frame: a shutter and a breath ----------------
prev = None
for tg, ci, d in dcurve:
    fl = int(np.floor(d + 1e-6))
    if prev is not None and fl != prev[1] and prev[0] == ci and chapters[ci]['stack']:
        put(tg, mx(click(1800, 0.02), thock(80, 0.12)), 0.18, 0)
        k = int(0.6 * SR); tk = np.arange(k) / SR; put(tg - 0.3, filt(noise(k), 'bandpass', [500, 3000]) * np.hanning(k), 0.04, 0)
    prev = (ci, fl)

# ---------------- events ----------------
for ch in chapters:
    t0 = ch['t0']
    for c in ch['cues']:
        a = t0 + c['at']
        if c['k'] == 'whack':
            put(a, mx(thock(70, 0.3), filt(noise(int(0.12 * SR)), 'highpass', 800) * env_decay(int(0.12 * SR), 0.03)), 0.9, 0.1)
            k = int(1.8 * SR); tk = np.arange(k) / SR; sw = filt(noise(k), 'bandpass', [300, 2400]) * np.sin(np.pi * tk / tk[-1]); put(a + 0.1, sw, 0.12)
        if c['k'] == 'snap': put(a, mx(click(3500, 0.012), ping(2200, 0.15)), 0.5, 0.3)
        if c['k'] == 'jug':
            k = int((c['to'] - c['at']) * SR); tk = np.arange(k) / SR; f = 2400 - 1900 * tk / tk[-1]
            put(a, np.sin(2 * np.pi * np.cumsum(f) / SR) * np.minimum(1, tk / 0.4) * 0.3, 0.12, -0.3)
            b = t0 + c['to']; put(b, filt(noise(int(0.2 * SR)), 'highpass', 900) * env_decay(int(0.2 * SR), 0.05), 0.7, 0.1)
            for j in range(18): put(b + rng.uniform(0, 0.8) ** 2, ping(rng.uniform(1800, 5200), rng.uniform(0.1, 0.5)), 0.15, rng.uniform(-0.5, 0.5))
        if c['k'] == 'assemble':
            n = int((c['to'] - c['at']) * SR)
            for j in range(40): put(a + rng.uniform(0, c['to'] - c['at']), mx(click(rng.uniform(800, 3000), 0.01), thock(rng.uniform(200, 500), 0.03) * 0.4), 0.3, rng.uniform(-0.4, 0.4))
            put(a, filt(noise(n), 'highpass', 3000) * (np.random.default_rng(3).random(n) > 0.995) * 1.0, 0.5)
        if c['k'] == 'walk':
            for j in range(7): put(a + j * (c['to'] - c['at']) / 7, mx(thock(140, 0.06), ping(rng.uniform(600, 900), 0.12) * 0.4), 0.4, 0)
            put(t0 + c['to'] + 0.1, mx(thock(60, 0.3), filt(noise(int(0.25 * SR)), 'bandpass', [400, 3000]) * env_decay(int(0.25 * SR), 0.06)), 0.8, 0)
        if c['k'] == 'rust':
            n = int((c['to'] - c['at']) * SR); tk = np.arange(n) / SR
            put(a, filt(noise(n), 'bandpass', [300, 900]) * (np.abs(np.sin(2 * np.pi * (0.6 + 6 * tk / tk[-1]) * tk)) ** 4) * np.minimum(1, tk / 1.0), 0.06, 0)
        if c['k'] == 'shoe': put(a, mx(thock(90, 0.12), filt(noise(int(0.3 * SR)), 'bandpass', [600, 3000]) * env_decay(int(0.3 * SR), 0.08)), 0.6, 0.1)
        if c['k'] == 'travelers':
            for j in range(4): putv(a + j * 1.8, (np.sin(2 * np.pi * (880 if j % 2 else 1318.5) * np.arange(int(1.6 * SR)) / SR) * np.exp(-np.arange(int(1.6 * SR)) / SR / 0.6) * 0.3), 2.0, 0.4, 0.3, -0.3 if j % 2 else 0.3)
        if c['k'] == 'crack':
            put(a, mx(filt(noise(int(0.05 * SR)), 'highpass', 2000) * env_decay(int(0.05 * SR), 0.01), thock(120, 0.06)), 1.0, 0)
    if ch['ch'] == 'cave2' or ch['ch'] == 'cave1':
        for k_ in range(10):  # cabinet doors creak as the camera approaches
            pass
    if ch['ch'] == 'cave3':  # the lineage tune, slow, for "tell me another"
        st = t0 + ch['lines'][2]['t1'] + 0.4
        for tn, m in motif_times(st, 0.5)[0]: putv(tn, mbox(mnote(m)), 2.0, 0.3, 0.3, 0.1)
    if ch['ch'] == 'end':
        tn = t0 + 0.4; beat = 0.4
        for j, (m, b) in enumerate([(76, 1), (79, 1), (81, 1), (79, 2), (76, 1)]): put(tn, mbox(mnote(m) * (1 - 0.005 * j)), 0.3, 0.1); tn += b * beat; beat *= 1.25

# ---------------- voices ----------------
VROOM = {'cave': (1.8, 0.24), 'vestibule': (0.9, 0.16), 'dream': (1.4, 0.2), 'space': (0.5, 0.08), 'dump': (0.7, 0.12), 'gozmos': (2.4, 0.3)}
VPAN = {'GEN': 0.25, 'TRU': -0.3, 'G': 0.3, 'Z': -0.15}
for ch in chapters:
    rt, wet = VROOM.get(ch['room'] or 'cave', (0.6, 0.1))
    for ln in ch['lines']:
        a = ln.pop('_a'); who = ln['who']
        if who in ('W', 'B'): putv(ch['t0'] + ln['t0'], a, 0.5, 0.08, 1.15, 0)
        else: putv(ch['t0'] + ln['t0'], a, rt, wet, 0.95, VPAN.get(who, 0))
        if ch['ch'] == 'loop' and ln['line']:  # the line repeats once for every room he falls through
            for k, dl in enumerate([1.3, 2.4, 3.3, 4.0, 4.6, 5.1]):
                putv(ch['t0'] + ln['t0'] + dl, filt(a, 'lowpass', 3000 - k * 380), 1.2 + k * 0.4, 0.3 + k * 0.08, 0.55 * 0.78 ** k, (-1) ** k * 0.3)

mix = np.stack([L, Rr], 1); mix /= np.abs(mix).max() + 1e-9; mix *= 0.89
raw = os.path.join(HERE, 'audio', 'sm.wav')
with wave.open(raw, 'wb') as f:
    f.setnchannels(2); f.setsampwidth(2); f.setframerate(SR); f.writeframes((mix * 32767).astype(np.int16).tobytes())
subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', raw, '-af', 'loudnorm=I=-16:TP=-1.5:LRA=14', '-ar', '48000', '-c:a', 'aac', '-b:a', '192k', os.path.join(HERE, 'audio', 'sm.m4a')], check=True)
os.remove(raw)
json.dump(dict(chapters=chapters, dur=TOTAL, cast=CAST), open(os.path.join(HERE, 'timing', 'sm.json'), 'w'))
print('storytelling machines', TOTAL, 's,', len(chapters), 'chapters')
for ch in chapters: print(f"  {ch['ch']:9s} {ch['t0']:7.2f} {ch['d']:6.2f}", ' | '.join(f"{l['who']}@{l['t0']:.1f}-{l['t1']:.1f}" for l in ch['lines']), '|', ' '.join(f"{c['k']}@{c['at']:.1f}" for c in ch['cues']))
