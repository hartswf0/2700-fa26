#!/usr/bin/env python3
"""THE CYBERIAD -- opening title sequence.

Rebuilds ../cyberiad-titles.mp4 and ../cyberiad-titles.jpg from the
source films in "LAB 7 - CLASSES/<film>/<film>.mp4".

    python3 build.py            # full build
    python3 build.py --keep     # keep the intermediate folder

Needs: ffmpeg, numpy, scipy, Pillow, fontTools (+brotli for woff2).
Narration: narration.wav in this folder (made by narrate.py with Kokoro);
if it is missing and kokoro_onnx is available, narrate.py is run.
"""
import os, sys, json, shutil, subprocess, tempfile
import numpy as np
from scipy.io import wavfile
from scipy import signal
from PIL import Image, ImageDraw, ImageFont

SRC = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.dirname(SRC)                      # cyberiad-titles/
LAB = os.path.dirname(OUT)                      # LAB 7 - CLASSES/
FONTS = os.path.join(LAB, "kingdoms-in-a-box/film-src/fonts")

W, H, FPS = 1280, 720, 24
BEAT_FR = 15                 # 15 frames per beat = 0.625 s = 96 bpm
BEAT = BEAT_FR / FPS
SR = 48000

DARK = (0x13, 0x11, 0x0e)
PAPER = (0xeb, 0xe3, 0xcf)

INTRO_S = 7.5                # black + STANISŁAW LEM; ticks start at 5.0
TICK_START = INTRO_S - 4 * BEAT

# ---------------------------------------------------------------- the cut
# ("card", text, beats) or ("shot", film, in-point seconds, beats)
# shots are in the order of the book; every in-point was checked by
# extracting frames at the start, middle and end of the shot.
CUT = [
    ("card", "Two constructors", 4),
    ("shot", "world-saved", 24.0, 4),          # the N machine
    ("shot", "trurls-machine", 71.0, 4),       # 2+2=4 beside the lit tower
    ("card", "Trurl and Klapaucius", 4),
    ("shot", "good-shellacking", 188.5, 4),    # the cellar, the club raised
    ("shot", "gargantius", 181.5, 4),          # soldier graph closing ranks
    ("card", "build machines for kings", 4),
    ("shot", "electronic-bard", 11.3, 3),      # chalkboard 2+2=7
    ("shot", "electronic-bard", 405.0, 3),     # the Bard's horn in space
    ("shot", "offer-of-krool", 187.0, 3),      # pencils and the beast
    ("shot", "offer-of-krool", 330.0, 3),      # the beast splitting
    ("shot", "dragons", 24.0, 3),              # a dragon made probable
    ("shot", "dragons", 147.0, 3),             # the dragon gauge
    ("card", "and for each other", 4),
    ("shot", "femfatalatron", 122.0, 3),       # gauges climbing
    ("shot", "mischief-of-balerion", 345.0, 3),  # the cuckoo clock
    ("shot", "trurls-prescription", 345.0, 3),   # the office grown
    ("shot", "sixth-sally", 185.2, 3),         # the Demon of the Second Kind
    ("shot", "sixth-sally", 336.0, 3),         # the Demon's tape
    ("card", "Every machine does exactly", 4),
    ("shot", "seventh-sally", 38.0, 2),        # the kingdom in a box
    ("shot", "story-machines", 189.0, 2),      # the islands
    ("shot", "altruizine", 81.0, 2),           # the spiral
    ("shot", "ferrix", 129.0, 2),              # the cages
    ("shot", "non-serviam", 91.4, 2),          # WE WILL NOT SERVE.
    ("card", "what it was built to do", 4),
    ("shot", "bitic-literature", 155.9, 2),    # the five volumes
    ("shot", "bitic-literature", 212.0, 2),    # the shrinking reader
    ("shot", "bitic-introduction", 251.5, 2),  # volume IV lifts out
    ("shot", "bitic-mimesis", 259.4, 2),       # the shelf of novels
    ("shot", "bitic-apostasy", 180.0, 2),      # machine and person, puzzled
    ("shot", "bitic-theology", 150.0, 2),      # the sine of the infinite
]
TITLE_HOLD = 14.0            # title on screen before the fade
TITLE_FADE = 2.5
TAIL_BLACK = 1.0
SUB_IN = 2 * BEAT            # subtitle and struck tone, after the hard stop
NARR_AT = 3.4                # narration start, relative to the title


def run(cmd):
    subprocess.run(cmd, check=True)


def ff(*args):
    run(["ffmpeg", "-v", "error", "-y", "-threads", "2", *args])


# ---------------------------------------------------------------- fonts
def fonts(tmp):
    from fontTools.ttLib import TTFont
    out = {}
    for k, name in (("roman", "im-fell-english-latin-400-normal"),
                    ("italic", "im-fell-english-latin-400-italic")):
        f = TTFont(os.path.join(FONTS, name + ".woff2"))
        f.flavor = None
        p = os.path.join(tmp, name + ".ttf")
        f.save(p)
        out[k] = p
    return out


def draw_tracked(img, text, font, cy, tracking=0.0, fill=PAPER):
    """Centered text with letter-spacing. The Fell latin subset has no
    'Ł', so it is drawn as an L with a stroke through the stem."""
    d = ImageDraw.Draw(img)
    size = font.size
    widths = []
    for ch in text:
        base = "L" if ch == "Ł" else ch
        widths.append(d.textlength(base, font=font))
    total = sum(widths) + tracking * size * (len(text) - 1)
    x = (img.width - total) / 2
    asc, desc = font.getmetrics()
    y = cy - (asc - desc * 0.2) / 2 - size * 0.05
    for ch, w in zip(text, widths):
        base = "L" if ch == "Ł" else ch
        d.text((x, y), base, font=font, fill=fill)
        if ch == "Ł":
            bb = d.textbbox((x, y), "L", font=font)
            h = bb[3] - bb[1]
            sx = bb[0] + (bb[2] - bb[0]) * 0.22    # stem centre
            ym = bb[1] + h * 0.55
            lw = max(1, round(size * 0.055))
            d.line([(sx - h * 0.20, ym + h * 0.13), (sx + h * 0.24, ym - h * 0.13)],
                   fill=fill, width=lw)
        x += w + tracking * size


def text_png(path, lines):
    """lines: list of (text, fontpath, size, cy, tracking). Transparent RGBA,
    supersampled 2x for clean edges."""
    S = 2
    img = Image.new("RGBA", (W * S, H * S), (0, 0, 0, 0))
    for text, fp, size, cy, tr in lines:
        draw_tracked(img, text, ImageFont.truetype(fp, size * S), cy * S, tr,
                     fill=PAPER + (255,))
    img.resize((W, H), Image.LANCZOS).save(path)


def flat_png(path, layers):
    img = Image.new("RGB", (W, H), DARK)
    for p in layers:
        lay = Image.open(p)
        img.paste(lay, (0, 0), lay)
    img.save(path)


# ---------------------------------------------------------------- video
ENC = ["-c:v", "libx264", "-preset", "medium", "-crf", "14", "-pix_fmt", "yuv420p",
       "-r", str(FPS), "-video_track_timescale", "12288", "-an"]
# consistent grade + thin dark frame so the twenty films read as one
GRADE = ("eq=contrast=1.04:saturation=0.9,"
         "scale=1222:688:flags=lanczos,"
         "pad=1280:720:29:16:color=0x13110e,"
         "drawbox=x=27:y=14:w=1226:h=692:color=0x2a251e:t=1,"
         "vignette=angle=PI/11")


def seg_shot(out, film, t, frames):
    src = os.path.join(LAB, film, film + ".mp4")
    ff("-ss", f"{t:.3f}", "-i", src, "-frames:v", str(frames),
       "-vf", f"fps={FPS},{GRADE},setsar=1", *ENC, out)


def seg_still(out, png, frames, vf_extra=""):
    dur = frames / FPS
    vf = f"color=c=0x13110e:s={W}x{H}:r={FPS}:d={dur:.4f}[bg];" \
         f"movie='{png}',loop=-1:1:0,setpts=N/{FPS}/TB,format=rgba{vf_extra}[t];" \
         f"[bg][t]overlay=shortest=1,format=yuv420p,setsar=1"
    ff("-f", "lavfi", "-i", vf, "-frames:v", str(frames), *ENC, out)


def seg_black(out, frames):
    ff("-f", "lavfi", "-i", f"color=c=black:s={W}x{H}:r={FPS}", "-frames:v",
       str(frames), *ENC, out)


# ---------------------------------------------------------------- score
rng = np.random.default_rng(1964)   # the year Lem's Bajki robotów appeared


def env_exp(n, tau):
    return np.exp(-np.arange(n) / (tau * SR))


def bandnoise(n, lo, hi, order=4):
    sos = signal.butter(order, [lo, hi], "bandpass", fs=SR, output="sos")
    return signal.sosfilt(sos, rng.standard_normal(n))


def add(buf, at, x, pan=0.0):
    i = int(round(at * SR))
    if i >= buf.shape[1]:
        return
    x = x[: buf.shape[1] - i]
    l, r = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
    buf[0, i:i + len(x)] += x * l * 1.414
    buf[1, i:i + len(x)] += x * r * 1.414


def pen_scratch():
    n = int(0.62 * SR)
    t = np.arange(n) / SR
    x = bandnoise(n, 1800, 7500)
    # the nib catches the paper fibre: irregular grains
    grains = np.clip(signal.sosfilt(signal.butter(2, 60, fs=SR, output="sos"),
                                    rng.standard_normal(n)) * 6 + 0.4, 0, None)
    shape = np.minimum(t / 0.03, 1) * np.exp(-np.maximum(t - 0.35, 0) / 0.07)
    x = x * grains * shape
    x += bandnoise(n, 300, 1200) * shape * 0.25
    return x / np.max(np.abs(x)) * 0.5


def tick(freq, amp):
    n = int(0.06 * SR)
    t = np.arange(n) / SR
    click = bandnoise(n, 2500, 9000) * env_exp(n, 0.0025)
    ping = np.sin(2 * np.pi * freq * t) * env_exp(n, 0.012)
    return (click * 0.6 + ping * 0.5) * amp


def pulse(amp):
    n = int(0.35 * SR)
    t = np.arange(n) / SR
    f = 46 + 70 * np.exp(-t / 0.03)
    ph = 2 * np.pi * np.cumsum(f) / SR
    x = np.sin(ph) * env_exp(n, 0.11)
    x += bandnoise(n, 120, 600) * env_exp(n, 0.012) * 0.3
    return x * amp


def hat(amp):
    n = int(0.05 * SR)
    return bandnoise(n, 6000, 14000) * env_exp(n, 0.008) * amp


def pluck(freq, dur, amp):
    """Karplus-Strong: a dry mechanical string."""
    n = int(dur * SR)
    p = int(SR / freq)
    buf = rng.uniform(-1, 1, p)
    out = np.empty(n)
    for i in range(n):
        out[i] = buf[i % p]
        buf[i % p] = 0.5 * (buf[i % p] + buf[(i + 1) % p]) * 0.994
    return out * amp


def pad(freqs, dur, amp, bright=1.0):
    n = int(dur * SR)
    t = np.arange(n) / SR
    x = np.zeros(n)
    for f in freqs:
        for k in range(1, 7):
            det = 1 + 0.0015 * rng.standard_normal()
            x += np.sin(2 * np.pi * f * k * det * t + rng.uniform(0, 6.28)) / k ** (2.2 - bright * 0.6)
    a = np.minimum(t / 0.6, 1) * np.minimum((dur - t) / 0.05, 1)
    trem = 1 + 0.12 * np.sin(2 * np.pi * (1 / BEAT / 2) * t)
    return x * a * trem * amp / len(freqs)


def bell(f0, dur, amp):
    n = int(dur * SR)
    t = np.arange(n) / SR
    x = np.zeros(n)
    for ratio, a, tau in ((0.5, 0.5, 4.5), (1, 1, 3.6), (2.0, 0.55, 2.4), (2.76, 0.4, 1.6),
                          (4.07, 0.25, 1.0), (5.43, 0.15, 0.7)):
        x += a * np.sin(2 * np.pi * f0 * ratio * t) * np.exp(-t / tau)
    x *= np.minimum(t / 0.004, 1)
    return x * amp / 2.2


def hz(m):
    return 440 * 2 ** ((m - 69) / 12)


def build_score(sections, montage_end, title_at, total, narr):
    buf = np.zeros((2, int(total * SR) + SR))
    add(buf, 0.8, pen_scratch(), pan=-0.15)

    # clock: tick/tock from the count-in to the hard stop
    nb = int(round((montage_end - TICK_START) / BEAT))
    for b in range(nb):
        t = TICK_START + b * BEAT
        add(buf, t, tick(3100 if b % 2 == 0 else 2550, 0.32), pan=0.25 if b % 2 else -0.25)

    # chords per section (one section per title card)
    chords = [[50, 57, 62, 65], [50, 57, 62, 65], [46, 53, 58, 62],
              [43, 50, 55, 58], [45, 52, 57, 61], [45, 52, 57, 64]]
    for si, (s0, s1) in enumerate(sections):
        notes = chords[si]
        add(buf, s0, pad([hz(m) for m in notes], s1 - s0, 0.16 + 0.03 * si, bright=0.6 + si * 0.15))
        nbeats = int(round((s1 - s0) / BEAT))
        for b in range(nbeats):
            t = s0 + b * BEAT
            # machine pulse on every beat, accent on the bar
            add(buf, t, pulse(0.55 if b % 4 == 0 else 0.30 + 0.04 * si))
            if si >= 2:      # mechanical ostinato in eighths
                seq = [notes[0] + 12, notes[2], notes[1] + 12, notes[3]]
                for e in range(2):
                    m = seq[(2 * b + e) % 4] + (12 if si >= 4 and e == 1 else 0)
                    add(buf, t + e * BEAT / 2, pluck(hz(m), 0.5, 0.20 + 0.03 * si),
                        pan=-0.4 if e == 0 else 0.4)
            if si >= 4:      # offbeat ticks: the clock doubles
                add(buf, t + BEAT / 2, tick(3600, 0.16), pan=0.5)
            if si >= 5:      # sixteenth hats: it runs away
                for q in range(4):
                    add(buf, t + q * BEAT / 4, hat(0.10 + 0.08 * (q % 2 == 0)), pan=0.3)
    # rising noise into the hard stop
    sw = 4 * BEAT
    n = int(sw * SR)
    x = rng.standard_normal(n)
    out = np.zeros(n)
    for k in range(0, n, 2048):
        f = 400 + 7000 * (k / n) ** 2
        sos = signal.butter(2, [f, min(f * 1.6, 20000)], "bandpass", fs=SR, output="sos")
        out[k:k + 2048] = signal.sosfilt(sos, x[k:k + 2048])
    add(buf, montage_end - sw, out * np.linspace(0, 0.35, n) ** 1.5)

    # hard stop: everything before the title is cut dead
    i = int(montage_end * SR)
    fade = int(0.004 * SR)
    buf[:, i - fade:i] *= np.linspace(1, 0, fade)
    buf[:, i:] = 0

    # the title: a single struck tone, then the narrator
    add(buf, title_at + SUB_IN, bell(hz(38), 16.0, 0.55))
    if narr is not None:
        add(buf, title_at + NARR_AT, narr * 0.8)
    n_end = int(total * SR)
    buf = buf[:, :n_end]
    # fade with the picture
    f0 = int((title_at + TITLE_HOLD) * SR)
    f1 = int((title_at + TITLE_HOLD + TITLE_FADE) * SR)
    buf[:, f0:f1] *= np.linspace(1, 0, f1 - f0) ** 1.5
    buf[:, f1:] = 0
    # a little room
    ir_n = int(0.9 * SR)
    ir = rng.standard_normal(ir_n) * env_exp(ir_n, 0.18)
    ir = signal.sosfilt(signal.butter(2, 4000, fs=SR, output="sos"), ir) * 0.012
    wet = np.stack([signal.fftconvolve(buf[c], ir)[: buf.shape[1]] for c in range(2)])
    buf = buf + wet
    buf[:, i:int((title_at + SUB_IN) * SR)] = 0   # keep the hard stop dead silent
    buf[:, f1:] = 0
    buf /= max(1e-9, np.max(np.abs(buf))) / 0.85
    return buf


def load_narration():
    p = os.path.join(SRC, "narration.wav")
    if not os.path.exists(p):
        try:
            run([sys.executable, os.path.join(SRC, "narrate.py")])
        except Exception as e:
            print("narration unavailable:", e)
            return None
    sr, x = wavfile.read(p)
    x = x.astype(np.float64) / 32768.0
    if x.ndim > 1:
        x = x.mean(1)
    if sr != SR:
        x = signal.resample_poly(x, SR, sr)
    return x / np.max(np.abs(x))


# ---------------------------------------------------------------- main
def main():
    keep = "--keep" in sys.argv
    tmp = tempfile.mkdtemp(prefix="cyberiad-titles-")
    print("work dir", tmp)
    F = fonts(tmp)

    # text layers
    text_png(f"{tmp}/t_lem.png", [("STANISŁAW LEM", F["roman"], 30, 360, 0.32)])
    for i, (kind, *rest) in enumerate(CUT):
        if kind == "card":
            text_png(f"{tmp}/t_card{i}.png", [(rest[0], F["roman"], 58, 356, 0.01)])
    text_png(f"{tmp}/t_title.png", [("THE CYBERIAD", F["roman"], 104, 336, 0.09)])
    text_png(f"{tmp}/t_sub.png", [("filmed in ink, in the order of the book", F["italic"], 38, 440, 0.01)])

    segs = []
    # 1. black, pen scratch, the author's name
    intro_fr = int(round(INTRO_S * FPS))
    p = f"{tmp}/s00_intro.mp4"
    dur = INTRO_S
    vf = (f"color=c=black:s={W}x{H}:r={FPS}:d={dur}[bg];"
          f"movie='{tmp}/t_lem.png',loop=-1:1:0,setpts=N/{FPS}/TB,format=rgba,"
          f"fade=in:st=1.5:d=1.6:alpha=1,fade=out:st=5.3:d=1.3:alpha=1[t];"
          f"[bg][t]overlay=shortest=1,format=yuv420p,setsar=1")
    ff("-f", "lavfi", "-i", vf, "-frames:v", str(intro_fr), *ENC, p)
    segs.append(p)

    # 2-4. the montage
    t = INTRO_S
    sections, shotlist = [], []
    for i, item in enumerate(CUT):
        kind = item[0]
        beats = item[-1]
        fr = beats * BEAT_FR
        p = f"{tmp}/s{i + 1:02d}.mp4"
        if kind == "card":
            if sections:
                sections[-1][1] = t
            sections.append([t, None])
            seg_still(p, f"{tmp}/t_card{i}.png", fr, ",fade=in:st=0:d=0.22:alpha=1")
        else:
            film, tin = item[1], item[2]
            seg_shot(p, film, tin, fr)
            shotlist.append((round(t, 3), film, tin, round(fr / FPS, 3)))
        segs.append(p)
        t += fr / FPS
    montage_end = t
    sections[-1][1] = t

    # 5. hard stop; the title in silence, subtitle, hold, fade to black
    title_at = t
    tfr = int(round((TITLE_HOLD + TITLE_FADE) * FPS))
    p = f"{tmp}/s99_title.mp4"
    vf = (f"color=c=0x13110e:s={W}x{H}:r={FPS}:d={TITLE_HOLD + TITLE_FADE}[bg];"
          f"movie='{tmp}/t_title.png',loop=-1:1:0,setpts=N/{FPS}/TB,format=rgba[a];"
          f"movie='{tmp}/t_sub.png',loop=-1:1:0,setpts=N/{FPS}/TB,format=rgba,"
          f"fade=in:st={SUB_IN}:d=1.4:alpha=1[b];"
          f"[bg][a]overlay=shortest=1[c];[c][b]overlay=shortest=1,"
          f"fade=out:st={TITLE_HOLD}:d={TITLE_FADE},format=yuv420p,setsar=1")
    ff("-f", "lavfi", "-i", vf, "-frames:v", str(tfr), *ENC, p)
    segs.append(p)
    p = f"{tmp}/s99z_black.mp4"
    seg_black(p, int(round(TAIL_BLACK * FPS)))
    segs.append(p)
    total = title_at + TITLE_HOLD + TITLE_FADE + TAIL_BLACK

    with open(f"{tmp}/list.txt", "w") as fh:
        for s in segs:
            fh.write(f"file '{s}'\n")
    ff("-f", "concat", "-safe", "0", "-i", f"{tmp}/list.txt", "-c", "copy", f"{tmp}/video.mp4")

    # score
    narr = load_narration()
    mix = build_score(sections, montage_end, title_at, total, narr)
    wavfile.write(f"{tmp}/score.wav", SR, (mix.T * 32767).astype(np.int16))

    # loudnorm, two pass, -16 LUFS integrated
    r = subprocess.run(["ffmpeg", "-hide_banner", "-i", f"{tmp}/score.wav", "-af",
                        "loudnorm=I=-16:TP=-1.5:LRA=11:print_format=json", "-f", "null", "-"],
                       capture_output=True, text=True)
    js = json.loads(r.stderr[r.stderr.rindex("{"):r.stderr.rindex("}") + 1])
    ln = (f"loudnorm=I=-16:TP=-1.5:LRA=11:measured_I={js['input_i']}:"
          f"measured_TP={js['input_tp']}:measured_LRA={js['input_lra']}:"
          f"measured_thresh={js['input_thresh']}:offset={js['target_offset']}:linear=true")

    out_mp4 = os.path.join(OUT, "cyberiad-titles.mp4")
    ff("-i", f"{tmp}/video.mp4", "-i", f"{tmp}/score.wav",
       "-map", "0:v", "-map", "1:a",
       "-c:v", "libx264", "-preset", "slow", "-crf", "21", "-maxrate", "2400k",
       "-bufsize", "4800k", "-pix_fmt", "yuv420p", "-profile:v", "high",
       "-af", ln + ",aresample=48000", "-c:a", "aac", "-b:a", "192k", "-ar", "48000",
       "-movflags", "+faststart", "-shortest", out_mp4)

    # poster still of the main title (subtitle fully in)
    ff("-ss", f"{title_at + SUB_IN + 2.5:.3f}", "-i", out_mp4, "-frames:v", "1",
       "-q:v", "2", os.path.join(OUT, "cyberiad-titles.jpg"))

    with open(os.path.join(SRC, "shotlist.json"), "w") as fh:
        json.dump({"beat_seconds": BEAT, "montage_start": INTRO_S,
                   "title_at": round(title_at, 3), "total": round(total, 3),
                   "shots": [dict(zip(("at", "film", "source_in", "dur"), s)) for s in shotlist]},
                  fh, indent=1)
    print("montage end / title at", round(title_at, 3), "total", round(total, 3))
    if not keep:
        shutil.rmtree(tmp)


if __name__ == "__main__":
    main()
