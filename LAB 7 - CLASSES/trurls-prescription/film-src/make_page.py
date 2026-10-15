# Builds ../index.html from the Gargantius page shell and timing/tp.json.
import json, os, re, html
H = os.path.dirname(os.path.abspath(__file__)); R = os.path.dirname(H)
T = json.load(open(os.path.join(H, 'timing', 'tp.json')))
shell = open(os.path.join(R, '..', 'gargantius', 'index.html'), encoding='utf-8').read()
esc = lambda s: html.escape(s, quote=False).replace('’', '&rsquo;')
cast = T['cast']; nm = lambda w: 'Narrator' if w == 'N' else cast.get(w, {}).get('name', w)
TITLES = {'title': None, 'machine': 'THE MACHINE', 'arrival': 'SOMETHING ARRIVES', 'force': 'FORCE', 'ivy': 'THE VINE', 'trurl': 'TRURL ARRIVES',
          'notice': 'THE NOTICE', 'office': 'THE OFFICE', 'clear': 'CLEARING OUT', 'end': None}
lines, script = [], []
for sh in T['shots']:
    if not sh.get('lines'): continue
    if TITLES.get(sh['shot']): script.append(f"<h3>{TITLES[sh['shot']]}</h3>")
    for l in sh['lines']:
        cls = ' class=fulcrum' if l.get('line') else ''
        script.append(f"<p{cls}><b>{esc(nm(l['who']))}.</b> {esc(l['say'])}</p>")
        if l.get('line'): lines.append(f"<li><span>{esc(nm(l['who']))}</span>{esc(l['say'])}</li>")
n = len(lines); words = {8: 'EIGHT'}.get(n, str(n))
note = f'''<section class="note">
<h2>{words} LINES</h2>
<ol class="lines">{''.join(lines)}</ol>
<h2>HOW IT IS MADE</h2>
<p>The device is a size. The thing that lands on the Steelypips&rsquo; machine is drawn at the top of the picture, and the only way to read it is by how big it is. There is no number. Each weapon the Steelypips build is larger than the last, and the thing stays exactly as large as it was. Then Trurl has one notice delivered and signed for, and from that point the thing gets smaller every time the office gets a new piece of furniture. The office is drawn from nothing: a desk, a typewriter, a stamp, then pigeonholes, cabinets, signs, coffee stains and cobwebs, forty things in all, arriving faster and faster.</p>
<p>The sound runs the same way. The force scenes are blasts, each louder than the one before, followed each time by silence and the tick of cooling scrap. The office is a rhythm made of typing, rubber stamps, paper and the mailman&rsquo;s footsteps, and it speeds up and thickens as the office grows. Under it there is a low hum that belongs to the thing, and it drops in pitch and in level as the thing shrinks. At the end Trurl throws out the whole office and only the vending machine is left, humming, and then one drop falls.</p>
<p>The timing file <code>tp.json</code> drives picture and sound together. It holds the start time of every spoken line, every cue and the size curve of the thing. The picture code reads those times, and <code>build_sound.py</code> makes all the non-voice sound with numpy and scipy. The voices are Kokoro.</p>
<h2>AFTER THE OTHER FILMS</h2>
<p>The Sixth Sally, <a href="../sixth-sally/index.html">The Demon of the Second Kind</a>, is about a test that lets one kind of thing through. This film is about something that cannot be pushed out by force, and gets smaller when it is given forms to fill in. In the book it sits next to <a href="../electronic-bard/index.html">Trurl&rsquo;s Electronic Bard</a> in the book, and both are in the first experiment of the lineage, with <a href="../world-saved/index.html">How the World Was Saved</a>.</p>
<h2>FOR THE BENCH</h2>
<p>Write an <code>Intruder</code> object with a <code>size</code> and a method <code>accept(notice)</code>. Each time it accepts a notice, a counter goes up, and its size is a function of that counter. Write a <code>Clerk</code> that sends notices and counts the replies. Make the <code>Intruder</code> shrink only after the first <code>accept</code> and see what happens if the clerk sends a thousand notices to an object that refuses the first one. Then draw the intruder as a circle whose radius is its size, and the office as one rectangle added to the screen each time <code>accept</code> is called. What state does the object keep, and which method changes it?</p>
<p class="src">Narration and dialogue paraphrase Stanis&lstrok;aw Lem, &ldquo;The Fifth Sally (A), or Trurl&rsquo;s Prescription,&rdquo; <i>The Cyberiad</i>. The notices are invented. <a href="trurls-prescription.mp4" download>Download the film</a>.</p>
</section>
<section class="script"><h2>THE SCRIPT</h2>{''.join(script)}</section>'''
out = shell
out = re.sub(r'<title>.*?</title>', '<title>The Fifth Sally (A), or Trurl&rsquo;s Prescription &middot; Lab 7</title>', out, 1, re.S)
out = re.sub(r'<h1>.*?</h1>', '<h1>The Fifth Sally (A), or Trurl&rsquo;s Prescription</h1>', out, 1, re.S)
out = re.sub(r'<p class="sub">.*?</p>', '<p class="sub">an office that shrinks what it cannot fight</p>', out, 1, re.S)
out = out.replace('gargantius.jpg', 'trurls-prescription.jpg').replace('gargantius.mp4', 'trurls-prescription.mp4')
out = re.sub(r'<div class="cols">.*?</main>', '<div class="cols">\n' + note.replace('\\', '\\\\') + '\n</div>\n</main>', out, 1, re.S)
open(os.path.join(R, 'index.html'), 'w', encoding='utf-8').write(out)
print('ok', n, 'fulcrum lines')
