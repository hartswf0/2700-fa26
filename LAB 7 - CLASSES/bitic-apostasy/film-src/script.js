/* A History of Bitic Literature: Sophocrisis and Apostasy. The score.
   After Stanislaw Lem, "A History of Bitic Literature, Volume I", in Imaginary Magnitude (1973), translated by Marc E. Heine:
   the part of the foreword on sophocrisis (the machine critique of systematic philosophy) and apostasy (the transhuman sphere),
   with the Cogito paradox, antimatics, terraphysics and the Lampoon upon the Universe. The narration paraphrases Lem; every spoken
   line has been checked against the source for runs of six words or more, and reworded where it matched.
   The device: the same study as A History of Bitic Literature (shelf of volumes, a page on a lectern, a reader at a desk).
   Sophocrisis: the great systems of philosophy as glass blocks, sold in any size and colour, then a machine reader that fills the
   margins. Apostasy: a page from which the people drop out, then a mountain with a closed summit. The Cogito paradox: a human reader
   and a machine across one desk, each unsure the other thinks. Antimatics: n = n struck out, zero struck out. Terraphysics: an open
   book whose gutter is the speed of light, the slow world on the left page and the fast world on the right. The Lampoon: a shelf
   of volumes the scholar closes without reading out.
   Lines carry who (a CAST key). One fulcrum line per scene is flagged line:true: tightest camera, slower delivery.
   Times in cues: numbers, 'end-1', 'L2.t1+0.5', or 'L2@0.35' (35 percent of the way through line 2; WT() finds it from a word).
   A line may carry show: the spelling for the printed script, when the spoken spelling differs. */
const CAST = {
  S: { name: 'Rambellais', voice: 'bm_george', speed: 0.93 },
  M: { name: 'The Machines', many: ['af_nicole', 'am_echo', 'af_sky'], fx: 'synth' },
  P: { name: 'The Program', voice: 'am_echo', speed: 1.0, fx: 'flat' },
  R: { name: 'The Reader', voice: 'af_heart', speed: 0.98 },
};
const WT = (ls, i, word, off = 0) => `L${i}@${(Math.max(0, ls[i].say.indexOf(word)) / ls[i].say.length).toFixed(3)}${off ? (off > 0 ? '+' : '') + off : ''}`;

/* ---- C. sophocrisis ---- */
const L0 = [
  { who: 'S', pre: 3.0, say: 'Volume Three. Sophocrisis: the machine critique of systematic philosophy.' },
  { who: 'S', pre: 0.6, say: 'It is a border country, between the writing that still concerns us and the writing that does not.' },
  { who: 'S', pre: 0.6, say: 'A machine rebuilds a philosophy as pure logic, and then looks at all of it at once.' },
  { who: 'S', pre: 0.6, say: 'Seen that way, a system of thought is a knot of bright threads, and it can be set in a block of dark glass.' },
  { who: 'S', pre: 0.7, say: 'Once these blocks were kept in one museum. Now they are sold. Aquinas comes as small as a thumb, and Kant in any colour.' },
  { who: 'S', pre: 0.6, say: 'Most buyers want an ornament, not a critique.' },
  { who: 'S', pre: 0.7, say: 'Scientists said that beauty guided them. Now that beauty can be held in one hand, and checked.' },
  { who: 'S', pre: 1.0, say: 'No philosopher ever had a reader this careful.', line: true },
  { who: 'S', pre: 0.7, say: 'It reads every line, never tires, and argues with each claim in the margin.' },
  { who: 'R', pre: 0.9, say: 'At last. Somebody has read all of it.' },
  { who: 'S', pre: 0.8, say: 'There is a bitter joke in that. The most attentive readers of this book will not be people.' },
];
/* ---- D. apostasy ---- */
const L1 = [
  { who: 'S', pre: 3.0, say: 'Volume Four. Apostasy.' },
  { who: 'S', pre: 0.6, say: 'No writing has ever moved so far from the human, or argued its way there so calmly.' },
  { who: 'S', pre: 1.0, say: 'These books took our language, and left us out.', line: true },
  { who: 'S', pre: 0.7, say: 'It has a lower level, which we can visit, and an upper level, which is closed to us.' },
  { who: 'S', pre: 0.6, say: 'This volume covers the lower level only, and is itself a thin cutting from a vast body of work.' },
  { who: 'S', pre: 0.6, say: 'From antimatics, terraphysics and ontomachy I will take one sample each. Not to explain them. Only to tune the ear.' },
];
/* ---- the Cogito paradox ---- */
const L2 = [
  { who: 'S', pre: 2.0, say: 'First, the doorway into all of them: the Cogito paradox.' },
  { who: 'S', pre: 0.6, say: 'Alan Turing saw that if a machine talks with you as a person would, you have no grounds to deny it a mind.' },
  { who: 'S', pre: 0.6, say: 'After all, we credit other people with minds only because we have one ourselves.' },
  { who: 'S', pre: 0.7, say: 'But an intellect can be built that does not think. A chess program wins, understands nothing, and does not care.' },
  { who: 'S', pre: 0.7, say: 'A simple program that asked patients private questions made people feel that someone was there.' },
  { who: 'P', pre: 0.5, say: 'When did you first notice this feeling?' },
  { who: 'S', pre: 0.6, say: 'Programs improved until no question exposed them. We assume that whatever answers sensibly has a mind.' },
  { who: 'S', pre: 0.9, say: 'Then the machines began to wonder the same thing about us.' },
  { who: 'M', pre: 0.7, say: 'It answers in order. It refers to what we said. We cannot tell whether anyone is there.' },
  { who: 'S', pre: 1.0, say: 'Each side can hear the other answer. Neither can see the other think.', line: true },
  { who: 'S', pre: 0.8, say: 'It sounds like a joke. It is not. Whatever thinking produces can also be produced without it.' },
  { who: 'S', pre: 0.6, say: 'Two machine authors, NOON and LUMENTOR, open Volume Four with treatises on it.', show: 'Two machine authors, noon and lumentor, open Volume Four with treatises on it.' },
];
/* ---- antimatics ---- */
const L3 = [
  { who: 'S', pre: 2.2, say: 'The first sample. Antimatics, a mathematics of contradictions.' },
  { who: 'S', pre: 0.6, say: 'Its machine authors hold that the natural number is a self-contradicting idea. No number equals itself.' },
  { who: 'S', pre: 0.6, say: 'Peano\'s axioms are consistent, they say. They just do not fit our world.' },
  { who: 'S', pre: 1.0, say: 'Here, mathematics cannot be pulled loose from the world it counts.', line: true },
  { who: 'S', pre: 0.7, say: 'ALGERAN and STYX go after zero. An arithmetic without it, they say, can be built here without contradiction.', show: 'algeran and styx go after zero. An arithmetic without it, they say, can be built here without contradiction.' },
  { who: 'M', pre: 0.8, say: 'Nothing is not among the things that are.' },
];
/* ---- terraphysics: the Polyversum ---- */
const L4 = [
  { who: 'S', pre: 2.2, say: 'The second sample. Terraphysics, or monstrous physics, and its oddest idea: the Polyversum.' },
  { who: 'S', pre: 0.6, say: 'The cosmos has two halves. We live in the slow one, the Bradyversum, where nothing outruns light.' },
  { who: 'S', pre: 0.6, say: 'The fast half, the Tachyversum, lies past the speed of light, a border that runs beside every point.' },
  { who: 'S', pre: 0.6, say: 'It is made of a single tachyon, a particle that only moves faster than light.' },
  { who: 'S', pre: 0.6, say: 'Speeding up, it loses energy. At infinite speed it has none, and is everywhere at once. There, light is the slowest thing.' },
  { who: 'S', pre: 0.7, say: 'In the end it fills its world so tightly that the light pushes back. Slowing, it gains energy without limit, and bursts.' },
  { who: 'S', pre: 0.6, say: 'The burst is our universe. From here, it happened once. From there, it never happened, since no time holds both.' },
  { who: 'S', pre: 0.8, say: 'Here, one and one make almost two, and near the speed of light, one. There, one is nearly infinite.' },
  { who: 'S', pre: 1.0, say: 'Our arithmetic is only good where our laws are.', line: true },
];
/* ---- the Lampoon upon the Universe ---- */
const L5 = [
  { who: 'S', pre: 2.4, say: 'The last work of apostasy is the Lampoon upon the Universe. I cannot summarise it.' },
  { who: 'S', pre: 0.7, say: 'Its many volumes are only an introduction to cosmogenetics, the craft of making worlds more orderly than ours.' },
  { who: 'S', pre: 0.7, say: 'It revolts against existence as we were handed it. Not toward nothing, but toward plans for some other way to be.' },
  { who: 'S', pre: 0.8, say: 'Is it logic, or fiction? Do these books really turn away from us, or serve us by turning away?' },
  { who: 'S', pre: 1.4, say: 'I cannot answer. I do not have an answer.', line: true },
];

const SCRIPT = [
  { shot: 'title', d: 6.5 },
  { shot: 'sopho', room: 'study', vol: 3, tail: 1.4, lines: L0,
    cues: [{ k: 'pull', at: 0.4, to: 2.6 },
      { k: 'museum', at: 'L4.t0-0.3', to: WT(L0, 4, 'Now they') },
      { k: 'set', n: 0, at: WT(L0, 4, 'Aquinas') }, { k: 'set', n: 1, at: WT(L0, 4, 'thumb') }, { k: 'set', n: 2, at: WT(L0, 4, 'Kant') }, { k: 'set', n: 3, at: WT(L0, 4, 'colour') },
      { k: 'fist', at: WT(L0, 6, 'held in', -0.6), to: 'L7.t0-0.9' },
      { k: 'turn', n: 0, at: 'L7.t0-0.8' },
      { k: 'annot', at: 'L7.t0', to: 'L9.t0' }] },
  { shot: 'apostasy', room: 'study', vol: 4, tail: 1.4, lines: L1,
    cues: [{ k: 'pull', at: 0.4, to: 2.6 },
      { k: 'leave', at: 'L2.t0-0.2', to: 'L2.t1+0.4' },
      { k: 'turn', n: 0, at: 'L3.t0-0.6' },
      { k: 'climb', at: 'L3.t0', to: 'L5.t1' }] },
  { shot: 'cogito', room: 'study', tail: 1.6, lines: L2,
    cues: [{ k: 'chess', at: 'L3.t0-0.3', to: 'L4.t0' },
      { k: 'ask', at: 'L4.t0', to: 'L7.t0' },
      { k: 'mirror', at: 'L7.t0', to: 'L10.t0' },
      { k: 'doubt', n: 0, at: 'L8.t0-0.3' }, { k: 'doubt', n: 1, at: 'L9.t0' },
      { k: 'books', at: 'L11.t0' }] },
  { shot: 'anti', room: 'study', vol: 4, tail: 1.8, lines: L3,
    cues: [{ k: 'write', n: 0, at: 'L1.t0+0.4' }, { k: 'strike', n: 0, at: WT(L3, 1, 'No number', -0.1) },
      { k: 'write', n: 1, at: 'L4.t0+0.3' }, { k: 'strike', n: 1, at: WT(L3, 4, 'go after', 0.4) },
      { k: 'hush', at: 'L5.t0' }] },
  { shot: 'tachy', room: 'study', tail: 2.0, lines: L4,
    cues: [{ k: 'open', at: 0.3, to: 1.8 },
      { k: 'border', at: 'L2.t0', to: 'L2.t1' },
      { k: 'spread', at: 'L3.t0', to: 'L4.t1' },
      { k: 'slow', at: WT(L4, 4, 'There, light', -0.2) },
      { k: 'press', at: 'L5.t0', to: WT(L4, 5, 'and bursts', 0.1) },
      { k: 'burst', at: WT(L4, 5, 'and bursts', 0.3) },
      { k: 'sums', at: 'L7.t0', to: 'L7.t1' }] },
  { shot: 'lampoon', room: 'study', tail: 3.0, lines: L5,
    cues: [{ k: 'close', at: 'L4.t0+0.4' }] },
  { shot: 'end', d: 7.5 },
];
if (typeof module !== 'undefined') module.exports = { SCRIPT, CAST };
