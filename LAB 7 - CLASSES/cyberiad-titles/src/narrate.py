#!/usr/bin/env python3
"""Speak the one line over the title with Kokoro (bm_george) -> narration.wav.
KOKORO_DIR must hold kokoro-v1.0.onnx and voices-v1.0.bin (default /home/claude/kokoro).
The name is spelled for the speaker as it is said: Stanislav."""
import os
import numpy as np
from scipy.io import wavfile
from kokoro_onnx import Kokoro

LINE = "The Cyberiad. Stories by Stanislav Lem."
d = os.environ.get("KOKORO_DIR", "/home/claude/kokoro")
k = Kokoro(os.path.join(d, "kokoro-v1.0.onnx"), os.path.join(d, "voices-v1.0.bin"))
s, sr = k.create(LINE, voice="bm_george", speed=0.88, lang="en-gb")
s = np.clip(s / max(1e-9, np.max(np.abs(s))) * 0.9, -1, 1)
wavfile.write(os.path.join(os.path.dirname(os.path.abspath(__file__)), "narration.wav"),
              sr, (s * 32767).astype(np.int16))
print("narration", len(s) / sr, "s")
