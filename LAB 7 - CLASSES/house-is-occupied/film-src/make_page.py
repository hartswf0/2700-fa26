# Builds ../index.html from the Good Shellacking page shell and timing/hi.json.
import json, os, re, html
H = os.path.dirname(os.path.abspath(__file__)); R = os.path.dirname(H)
T = json.load(open(os.path.join(H, 'timing', 'hi.json')))
shell = open(os.path.join(R, '..', 'good-shellacking', 'index.html'), encoding='utf-8').read()
esc = lambda s: html.escape(s, quote=False).replace('’', '&rsquo;')
cast = T['cast']; nm = lambda w: cast.get(w, {}).get('name', w)
TITLES = {'lab': 'THE FORECAST', 'call': 'THE AGENT', 'replay': 'THE REPLAY', 'yard': 'THE YARD', 'hall': 'THE HALL', 'ogiva': 'OGIVA’S ROOM',
          'landing': 'THE LANDING', 'desk': 'THE FIRE DESK', 'order': 'THE ORDER', 'fire': 'THE FIRE', 'picture': 'THE PICTURE',
          'count': 'THE COUNT', 'evidence': 'THE EVIDENCE', 'participant': 'THE CERTIFICATE', 'dawn': 'CASE 013'}
lines, script = [], []
for sh in T['shots']:
    if not sh.get('lines'): continue
    if TITLES.get(sh['shot']): script.append(f"<h3>{TITLES[sh['shot']]}{' &middot; ' + sh['clock'] if sh.get('clock') else ''}</h3>")
    for l in sh['lines']:
        say = l.get('show') or l['say']
        cls = ' class=fulcrum' if l.get('line') else ''
        script.append(f"<p{cls}><b>{esc(nm(l['who']))}.</b> {esc(say)}</p>")
        if l.get('line'): lines.append(f"<li><span>{esc(nm(l['who']))}</span>{esc(say)}</li>")
n = len(lines); words = {14: 'FOURTEEN', 15: 'FIFTEEN', 16: 'SIXTEEN'}.get(n, str(n))
note = f'''<section class="note">
<h2>{words} LINES</h2>
<ol class="lines">{''.join(lines)}</ol>
<h2>HOW IT IS MADE</h2>
<p>This film continues from <a href="../abominable-house/index.html">The Burning of the Abominable House</a>. Waldemar, the programmer, now works for himself, and Skiller, the insurance agent, now sends him forecasts to check. At 21:06 his machine prints a second sheet for the Roessler boarding house across the rail yard: at 21:16 the system will order the stockroom shutter closed, and at 21:17 the stockroom will burn. Skiller wants an independent observer who does not go in. Waldemar runs the forecast again with himself in it, and the machine refuses him as a party. He crosses the yard anyway.</p>
<p>Inside are four people who live there: the widow Roessler, who owns the house; Ogiva, who makes wigs; Inigo, who lives on the stair; and Belindo Kid, who boxes and carries the forecast picture folded in his glove. Waldemar reports the forecast to Ada at the fire desk, and the slip gets a time stamp. At 21:16 the order rings through on the house phone, the freight train covers the warning, and the shutter comes down with Inigo behind it. The fire happens at 21:17 as forecast. The picture the machine printed at 21:06 turns out to be the frame of the rescue itself. Afterwards the captain notes that the slip came in eleven minutes early, and Skiller notes that Waldemar has signed as a participant. At dawn the printer starts on case 013.</p>
<p>Every person is a jointed puppet drawn in the same engraved line as the earlier films, with a costume for each: Waldemar&rsquo;s cardigan and glasses, Skiller&rsquo;s coat, hat and camera, the widow&rsquo;s shawl and bun, Ogiva&rsquo;s bare head, Inigo&rsquo;s long hair and bare feet, Belindo&rsquo;s singlet and gloves with a white stitch on the left thumb, Ada&rsquo;s headset, the captain&rsquo;s striped helmet. The clock in the corner is the story&rsquo;s own clock. The forecast picture is not a separate drawing: the film draws its own rescue frame once when it loads, samples it into a grid of dots, and prints that grid on the title sheet and in the inserts, so the forecast and the event are the same picture.</p>
<p>The sound follows the house: rain, a dot-matrix printer, two telephones, a call-record box with two lamps, a spoon on a cup, a fan on the bottom step, a spark at a socket, the 21:16 freight, a shutter chain, a fire, a camera flash, a siren, an engine at idle, and the train again at dawn.</p>
<h2>FOR THE BENCH</h2>
<p>Make the forecast picture the way the film does. Draw a scene on a hidden <code>&lt;canvas&gt;</code>, shrink it with <code>drawImage(big, 0, 0, 160, 90)</code>, and read the pixels back with <code>getImageData</code>. For each pixel compute darkness, <code>1 - (0.3*r + 0.59*g + 0.11*b) / 255</code>, and draw a dot whose radius grows with the square root of that number. Print the rows one at a time to get the printer. Then change one thing in the hidden scene, such as moving a person a few pixels, and compare the two dot grids: count how many dots changed. That count is how far the forecast is from the event.</p>
<p class="src">From Watson Hartsoe&rsquo;s screenplay <i>The House Is Occupied</i>, after Italo Calvino, <i>The Burning of the Abominable House</i>, in <i>Numbers in the Dark</i>, translated by Tim Parks. Nothing is quoted from Calvino. <a href="house-is-occupied.mp4" download>Download the film (mp4)</a>.</p>
</section>
<section class="script"><h2>THE SCRIPT</h2>{''.join(script)}</section>'''
out = shell
out = re.sub(r'<title>.*?</title>', '<title>The House Is Occupied &middot; Lab 7</title>', out, 1, re.S)
out = re.sub(r'<header>.*?</header>', '<header><a href="../index.html">LAB 7</a><a href="../lineage/index.html">ALL FILMS</a></header>', out, 1, re.S)
out = re.sub(r'<h1>.*?</h1>', '<h1>The House Is Occupied</h1>', out, 1, re.S)
out = re.sub(r'<p class="sub">.*?</p>', '<p class="sub">a forecast fire at 21:17, a boarding house of four, and the observer who goes in</p>', out, 1, re.S)
out = out.replace('good-shellacking.jpg', 'house-is-occupied.jpg').replace('good-shellacking.mp4', 'house-is-occupied.mp4')
out = re.sub(r'<div class="cols">.*?</main>', '<div class="cols">\n' + note.replace('\\', '\\\\') + '\n</div>\n</main>', out, 1, re.S)
open(os.path.join(R, 'index.html'), 'w', encoding='utf-8').write(out)
print('ok', n, 'fulcrum lines')
