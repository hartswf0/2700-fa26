#!/usr/bin/env python3
"""
embed_chapters.py — FFmpeg Chapter Multiplexer for Trouttown Ep 7 Suites.
Embeds standard QuickTime/MP4 FFMETADATA chapter marks and re-aligns +faststart
for immediate mobile & desktop hardware-accelerated chapter seeking.
"""

import subprocess, os, sys

CUTS = [
    {
        "file": "trouttown-ep7-college.mp4",
        "title": "Trouttown Ep 7: College Cut (Lab Edition)",
        "chapters": [
            {"start": 0, "end": 63420, "title": "Part 0: Attendance (setup & draw callbacks)"},
            {"start": 63420, "end": 121290, "title": "Part 1: The TV Turns On (Radius-aware bounce)"},
            {"start": 121290, "end": 186750, "title": "Part 2: Lost & Found (Arrays & zero-indexing)"},
            {"start": 186750, "end": 245340, "title": "Part 3: The Crosswalk (Loops & modulo wrapping)"},
            {"start": 245340, "end": 283480, "title": "Part 4: Slack Water & Credits (noLoop & roll call)"}
        ]
    },
    {
        "file": "trouttown-ep7-professional.mp4",
        "title": "Trouttown Ep 7: Professional Cut (Engineering Review)",
        "chapters": [
            {"start": 0, "end": 91790, "title": "Part 0: Pure Step & Control (Inversion of control & invariants)"},
            {"start": 91790, "end": 177040, "title": "Part 1: Cyclic Cursor & Stable IDs (Immutable modules)"},
            {"start": 177040, "end": 261050, "title": "Part 2: Layout as Data & Roll Call (Pure layout & push/pop)"}
        ]
    },
    {
        "file": "trouttown-ep7-middle-school.mp4",
        "title": "Trouttown Ep 7: Middle School Cut (Classroom Edition)",
        "chapters": [
            {"start": 0, "end": 82540, "title": "Part 0: The Current Calls (Room 4 TV & Functions)"},
            {"start": 82540, "end": 152330, "title": "Part 1: Lost & Found Drawer (Arrays starting at slot 0)"},
            {"start": 152330, "end": 226450, "title": "Part 2: Main Street Loop (Painting crosswalks & loop bug)"}
        ]
    },
    {
        "file": "HOUSE of SILT/trouttown-house-of-silt.mp4",
        "title": "Trouttown: House of Silt (1967/1970)",
        "chapters": [
            {"start": 0, "end": 108000, "title": "Trouttown: House of Silt (Alison Knowles Multiplane Canvas)"}
        ]
    }
]

def main():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    ffmpeg_bin = "/Users/gaia/anaconda3/bin/ffmpeg" if os.path.exists("/Users/gaia/anaconda3/bin/ffmpeg") else "ffmpeg"
    
    print(f"Using ffmpeg: {ffmpeg_bin}")
    for cut in CUTS:
        target_path = os.path.join(base_dir, cut["file"])
        if not os.path.exists(target_path):
            print(f"Skipping missing file: {target_path}")
            continue

        meta_file = target_path + ".meta.txt"
        with open(meta_file, "w") as f:
            f.write(";FFMETADATA1\n")
            f.write(f"title={cut['title']}\n\n")
            for ch in cut["chapters"]:
                f.write("[CHAPTER]\nTIMEBASE=1/1000\n")
                f.write(f"START={ch['start']}\n")
                f.write(f"END={ch['end']}\n")
                f.write(f"title={ch['title']}\n\n")

        temp_out = target_path + ".tagged.mp4"
        cmd = [
            ffmpeg_bin, "-y",
            "-i", target_path,
            "-i", meta_file,
            "-map_metadata", "1",
            "-codec", "copy",
            "-movflags", "+faststart",
            temp_out
        ]
        res = subprocess.run(cmd, capture_output=True, text=True)
        if res.returncode == 0:
            os.replace(temp_out, target_path)
            if os.path.exists(meta_file): os.remove(meta_file)
            print(f"✓ Embedded {len(cut['chapters'])} chapters into {cut['file']}")
        else:
            print(f"✗ Failed on {cut['file']}:\n{res.stderr}")

if __name__ == "__main__":
    main()
