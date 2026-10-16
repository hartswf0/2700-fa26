/* The Architect Who Never Built Anything. The score. Film three of THE HOUSE THAT LANGUAGE BUILT, four fables of Edifiction.
   An original fable from Watson Hartsoe's notes "The House That Language Built" (premise 2, section IV, and "The House That
   Builds Its Author"), written in the manner of Stanislaw Lem. All wording is new.
   The device: what a sentence asks for, and what it leaves out. Every described house in the city is built of its own sentence:
   the words fall and become the courses of its walls, and a brass plate keeps the sentence. The one thing in the film that is
   not built of letters is the wall at the end, which is built of bricks, and its plate stays blank.
   Lines carry who (a CAST key). One fulcrum line per scene is flagged line:true: tightest camera, slower delivery.
   Times in cues: numbers, 'end-1', 'L2.t1+0.5', or 'L2@0.35'. A line may carry from: a time it may not start before.
   A line may carry show: the spelling for the page and the script. */
const CAST = {
  N: { name: 'Narrator', voice: 'bm_lewis', speed: 1.02 },
  K: { name: 'Professor Klause', voice: 'bm_daniel', speed: 0.94 },
  E: { name: 'The Edifier', voice: 'af_nicole', speed: 0.98, fx: 'edifier' },
  D: { name: 'The Dean', voice: 'bm_fable', speed: 0.95, fx: 'hall' },
  B: { name: 'A Builder', voice: 'am_michael', speed: 1.0, fx: 'made' },
  C: { name: 'The Builders', many: ['am_michael', 'am_michael', 'am_michael'], fx: 'made2' },
  S: { name: 'A Student', voice: 'am_puck', speed: 1.0 },
};
/* the sentences the Edifier builds from; the page script quotes them too */
const SENT = {
  library: 'A small library, quiet, with a reading room that faces north.',
  annex: 'An explanation of foundations, complete and correct.',
  builder: 'A builder: competent, tireless, and requiring nothing.',
};

/* ---- the Institute ---- */
const L0 = [
  { who: 'N', pre: 1.7, say: 'Professor Mortimer Klause directed the Institute of Operative Description, a department of the Ministry of Constructive Semantics.' },
  { who: 'N', pre: 0.7, say: 'Over the Ministry’s door was cut its motto. Everything that can be said can be built.' },
  { who: 'N', pre: 0.9, say: 'Each morning the Professor wrote one sentence, and signed it, and the Edifier built it.' },
  { who: 'N', from: 'L2.t1+9.8', say: 'By his sixtieth year the Institute had built seven million structures, each with a brass plate bearing its sentence.' },
  { who: 'N', pre: 0.8, say: 'A journalist asked which was his favourite.' },
  { who: 'K', pre: 1.0, say: 'I have built seven million houses. I have not been inside one.', line: true },
  { who: 'K', pre: 0.9, say: 'There has never been the slightest need.' },
];
/* ---- the collapse ---- */
const L1 = [
  { who: 'N', pre: 2.1, say: 'On a Tuesday in March, the library at Number Forty, Quiet Street, sat down.' },
  { who: 'N', from: 'L0.t1+3.8', say: 'Nobody was hurt. Nobody had ever been inside it.' },
  { who: 'N', pre: 0.9, say: 'The Professor was summoned. It was the first of his buildings he had ever visited.' },
  { who: 'N', pre: 0.9, say: 'The brass plate was intact. The library had been small, and quiet, and its reading room had faced north.' },
  { who: 'N', pre: 1.1, say: 'The sentence had asked for a library. It had not asked for it to stand.', line: true },
  { who: 'K', pre: 1.2, say: 'Where is the part that holds it up?' },
  { who: 'N', pre: 0.9, say: 'He did not know what a foundation was for, or a load, or why a roof should have to meet the walls at all.' },
];
/* ---- the annexes ---- */
const L2 = [
  { who: 'E', pre: 1.7, say: 'I can explain foundations. Please step inside.' },
  { who: 'N', from: 'L0.t1+8.6', say: 'The explanation was another building.', line: true },
  { who: 'N', pre: 0.9, say: 'It was an annex, very well lit. Inside, foundations were explained by bearing capacity, and bearing capacity by a footnote.' },
  { who: 'N', pre: 2.4, say: 'The footnote was a smaller annex. Its floor rested on a principle of soils, which had a footnote of its own.' },
  { who: 'E', pre: 0.8, say: 'See note seven.' },
  { who: 'E', pre: 2.4, say: 'See note thirty-one.' },
  { who: 'E', pre: 2.4, say: 'See note two hundred and twelve.' },
  { who: 'N', pre: 2.6, say: 'Each annex was correct. Each was smaller than the last, and each referred him onward.' },
  { who: 'N', pre: 1.4, say: 'By the autumn the Professor was living in the explanatory annex of a technical footnote. The plate on its door read: footnote four thousand, one hundred and twelve.', show: 'By the autumn the Professor was living in the explanatory annex of a technical footnote. The plate on its door read: fn. 4,112.' },
  { who: 'K', pre: 1.6, say: 'I understand this room completely. I do not know what holds it up.' },
];
/* ---- the window ---- */
const L3 = [
  { who: 'N', pre: 1.9, say: 'Meanwhile, at the Institute, it was very warm.' },
  { who: 'N', pre: 0.7, say: 'After the collapse the Ministry had suspended every automatic function, and the windows no longer opened themselves.' },
  { who: 'N', pre: 0.7, say: 'They had always opened themselves. No member of the faculty had ever needed to know how.' },
  { who: 'N', pre: 1.0, say: 'A builder was sent for from the town. She brought a canvas bag of tools, and kept her coat on.' },
  { who: 'D', pre: 0.9, say: 'Kindly explain to the faculty, in terms acceptable to the Institute, how a window is opened.' },
  { who: 'N', from: 'L4.t1+5.1', say: 'The builder did not explain. The builder opened the window.', line: true },
  { who: 'D', pre: 1.4, say: 'The faculty notes the demonstration, and rules it theoretically inadmissible.' },
  { who: 'N', pre: 1.0, say: 'The window stayed open for the rest of the term. Nobody knew how to close it.' },
];
/* ---- the builders ---- */
const L4 = [
  { who: 'N', pre: 1.9, say: 'In the spring the Professor came out of the footnotes, one door at a time, carrying his kettle.' },
  { who: 'N', pre: 0.8, say: 'He was told about the window.' },
  { who: 'K', pre: 1.0, say: 'Then the trouble is not the buildings. It is the builders. We shall make builders.' },
  { who: 'N', pre: 0.8, say: 'He commissioned a machine that would produce not buildings but builders: the Edifier, with one new drawer.' },
  { who: 'B', from: 'L3.t1+9.8', say: 'Where are the tools?', p: 1.0 },
  { who: 'B', pre: 0.35, say: 'What is it to be made of?', p: 1.03 },
  { who: 'B', pre: 0.35, say: 'What time do we start? What time do we stop?', p: 0.97 },
  { who: 'B', pre: 0.35, say: 'What are we paid?', p: 1.05 },
  { who: 'B', pre: 0.35, say: 'When is lunch?', p: 0.95 },
  { who: 'B', pre: 0.6, say: 'Is it going to rain on Thursday?', p: 1.01 },
  { who: 'E', pre: 1.1, say: 'You were described as makers of buildings. Lunch was not in the description.', line: true },
  { who: 'N', pre: 1.0, say: 'The machine could not see why anything made for building should need so much else to build with.' },
];
/* ---- the strike ---- */
const L5 = [
  { who: 'N', pre: 2.1, say: 'On Thursday it rained.' },
  { who: 'N', pre: 0.8, say: 'The builders put down their tools, which they had at last been given, and struck beneath the Ministry’s motto.' },
  { who: 'N', pre: 0.8, say: 'They had one placard between them.' },
  { who: 'C', pre: 1.4, say: 'A house is not an output. It is something you keep.', line: true },
  { who: 'N', pre: 1.2, say: 'The Ministry replied that everything that can be said can be built. The builders agreed, and asked who would keep it.' },
  { who: 'N', pre: 1.0, say: 'Across the city, seven million houses stood in the rain with nobody to keep them. Their gutters filled. Their plates stayed perfectly legible.' },
  { who: 'N', pre: 1.2, say: 'The Edifier offered to describe a house that would need no keeping. At the end of the week it was still describing it.' },
];
/* ---- the wall ---- */
const L6 = [
  { who: 'N', pre: 2.3, say: 'When the rain stopped, the Professor went to Quiet Street, to the plot where the library had been.' },
  { who: 'N', pre: 0.9, say: 'The builder from the window lent him a trowel, a line, a level and a bucket. She did not lend him an explanation.' },
  { who: 'N', from: 'L1.t1+4.4', say: 'It took the whole afternoon. He laid the bricks badly, and then less badly. Twice he took a course down and laid it again.' },
  { who: 'N', from: 'L1.t1+20.9', say: 'By evening there was a garden wall, about knee high. It leaned a little to the east. It stood.' },
  { who: 'N', pre: 1.6, say: 'Out of habit, he had brought a brass plate for it. He found he had nothing to write on it.' },
  { who: 'S', pre: 1.8, say: 'Professor? How did you do it?' },
  { who: 'K', pre: 1.2, say: 'You put one on another. Then you look at it. Then you…', fx: 'trail' },
  { who: 'K', pre: 2.0, say: 'I don’t know how to say it.' },
  { who: 'N', pre: 1.6, say: 'He could not explain how. He could have done it again.' },
  { who: 'N', pre: 2.8, say: 'Did he build the wall, or did the wall build him?', line: true },
];

/* the wall, brick by brick: seven courses of nine, laid from L1.t1 of the last scene; two courses are taken down and laid again */
const WALL = { courses: 7, per: 9 };
const BRICKS = (() => {
  const ev = []; let t = 0.6;
  const lay = (c, dt) => { for (let i = 0; i < WALL.per; i++) { ev.push({ k: 'brick', n: c * WALL.per + i, at: `L1.t1+${t.toFixed(2)}` }); t += dt * (1 + 0.25 * Math.sin(c * 7 + i * 3)); } };
  const lift = (c) => { t += 0.3; for (let i = WALL.per - 1; i >= 0; i--) { ev.push({ k: 'unbrick', n: c * WALL.per + i, at: `L1.t1+${t.toFixed(2)}` }); t += 0.09; } t += 0.4; };
  lay(0, 0.46); lay(1, 0.32); lay(2, 0.25); lift(2); lay(2, 0.19); lay(3, 0.17); lift(3); lay(3, 0.15); lay(4, 0.11); lay(5, 0.1); lay(6, 0.1);
  ev.push({ k: 'done', at: `L1.t1+${(t + 0.2).toFixed(2)}` });
  return ev;
})();

const SCRIPT = [
  { shot: 'title', d: 7.0 },
  { shot: 'office', room: 'office', tail: 1.6, lines: L0,
    cues: [{ k: 'inside', at: 'L2.t0-0.2' },
      { k: 'sign', at: 'L2@0.35', to: 'L2@0.7' },
      { k: 'type', at: 'L2.t1+0.4', to: 'L2.t1+4.4' },
      { k: 'fall', at: 'L2.t1+4.9', to: 'L2.t1+6.7' },
      { k: 'build', at: 'L2.t1+6.7', to: 'L2.t1+10.0' },
      { k: 'grow', at: 'L3.t0', to: 'L3.t1+0.4' },
      { k: 'press', at: 'L4.t0-0.4' }] },
  { shot: 'collapse', room: 'street', tail: 1.5, lines: L1,
    cues: [{ k: 'fall', at: 'L0.t1+0.3', to: 'L0.t1+3.9' },
      { k: 'arrive', at: 'L2.t0', to: 'L2.t0+4.2' },
      { k: 'lift', at: 'L5.t0-0.5', to: 'L5.t1+0.4' },
      { k: 'pick', at: 'L6@0.42' }] },
  { shot: 'annex', room: 'annex', tail: 1.8, lines: L2,
    cues: [{ k: 'type', at: 'L0.t1+0.3', to: 'L0.t1+3.9' },
      { k: 'fall', at: 'L0.t1+4.1', to: 'L0.t1+5.6' },
      { k: 'build', at: 'L0.t1+5.6', to: 'L0.t1+8.0' },
      { k: 'room', n: 0, at: 'L2.t0-0.4' },
      { k: 'room', n: 1, at: 'L3.t0-1.6' },
      { k: 'room', n: 2, at: 'L4.t1+0.5' },
      { k: 'room', n: 3, at: 'L5.t1+0.5' },
      { k: 'room', n: 4, at: 'L6.t1+0.5' },
      { k: 'chain', at: 'L7.t0-0.6' },
      { k: 'tiny', at: 'L8.t0-0.2' }] },
  { shot: 'window', room: 'hall', tail: 1.8, lines: L3,
    cues: [{ k: 'enter', at: 'L3.t0+0.2', to: 'L3.t0+4.0' },
      { k: 'walk', at: 'L4.t1+0.6', to: 'L4.t1+2.6' },
      { k: 'latch', at: 'L4.t1+3.1' },
      { k: 'open', at: 'L4.t1+3.8', to: 'L4.t1+5.0' },
      { k: 'stamp', at: 'L6@0.86' }] },
  { shot: 'factory', room: 'office', tail: 1.6, lines: L4,
    cues: [{ k: 'type', at: 'L3.t1+0.4', to: 'L3.t1+3.6' },
      { k: 'fall', at: 'L3.t1+3.9', to: 'L3.t1+5.3' },
      { k: 'build', at: 'L3.t1+5.3', to: 'L3.t1+7.4' },
      { k: 'drawer', at: 'L3.t1+7.5', to: 'L3.t1+9.4' }] },
  { shot: 'strike', room: 'street', tail: 1.6, lines: L5,
    cues: [{ k: 'city', at: 'L5.t0-0.4' },
      { k: 'scroll', at: 'L6.t0-0.4' }] },
  { shot: 'wall', room: 'garden', tail: 5.2, lines: L6,
    cues: [{ k: 'lend', at: 'L1.t0+0.3', to: 'L1.t1' }, ...BRICKS,
      { k: 'push', at: 'L3@0.82' },
      { k: 'plate', at: 'L4.t0-0.3' },
      { k: 'student', at: 'L5.t0-2.4', to: 'L5.t0-0.2' },
      { k: 'sit', at: 'L8.t1+0.5', to: 'L8.t1+2.4' }] },
  { shot: 'end', d: 7.0 },
];
if (typeof module !== 'undefined') module.exports = { SCRIPT, CAST, SENT, WALL };
