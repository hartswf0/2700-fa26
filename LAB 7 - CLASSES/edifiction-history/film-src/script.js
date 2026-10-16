/* A Short History of Edifiction. The score. Film 1 of THE HOUSE THAT LANGUAGE BUILT, four fables of Edifiction.
   An original fable from Watson Hartsoe's notes "The House That Language Built", written in the manner of Stanislaw Lem.
   The narration of the first six scenes is Watson Hartsoe's own drafted preface (Part V of the notes), trimmed.
   Form: the preface to Volume VII of the Universal Encyclopedia of Constructive Semantics. The open book is the frame; each
   scene is an engraved plate (Fig. 1, Fig. 2 ...) that the camera enters and leaves. The page turns between scenes.
   Lines carry who (a CAST key). One fulcrum line per scene is flagged line:true: tightest camera, slower delivery.
   Times in cues: numbers, 'end-1', 'L2.t1+0.5', or 'L2@0.35'. A line may carry show: the spelling for the page and the script.
   Cue kinds the picture and the sound both read: turn (page turn), enter/exit/hop (camera into a plate, out, or across),
   type (the Edifier's keys), fall (the typed words drop to the plot; n words land evenly), rise (the walls go up). */
const CAST = {
  N: { name: 'The Historian', voice: 'bm_lewis', speed: 0.98 },
  D: { name: 'The Edifier', voice: 'af_nicole', speed: 0.96, fx: 'edifier' },
  I: { name: 'The Interpreting Machine', voice: 'am_echo', speed: 1.0, fx: 'flat' },
  A: { name: 'The Astronomer', voice: 'bm_daniel', speed: 0.95 },
  O: { name: 'The Elderly Woman', voice: 'bf_alice', speed: 0.9 },
};
const WT = (ls, i, word, off = 0) => `L${i}@${(Math.max(0, ls[i].say.indexOf(word)) / ls[i].say.length).toFixed(3)}${off ? (off > 0 ? '+' : '') + off : ''}`;

/* ---- 1. the preface; the critics ---- */
const L1 = [
  { who: 'N', pre: 2.2, say: 'From the preface to Volume Seven of the Universal Encyclopedia of Constructive Semantics.', show: 'From the Preface to Volume VII of the Universal Encyclopedia of Constructive Semantics.' },
  { who: 'N', pre: 1.2, say: 'The first houses built from language were so perfect that nobody could live in them.', line: true },
  { who: 'N', pre: 1.4, say: 'This defect was not discovered at once. For the first eleven years, the houses were judged only by architectural critics, none of whom had ever attempted to inhabit a building professionally.' },
  { who: 'N', pre: 0.7, say: 'Their reviews were uniformly favourable.' },
  { who: 'N', pre: 0.6, say: 'They praised the symmetry, the tasteful ornament, and the fidelity of each house to the sentence it was built from.' },
];
/* ---- 2. the philosopher's house: the first sentence becomes a house ---- */
const L2 = [
  { who: 'N', pre: 2.2, say: 'One house was commissioned under the following instruction.' },
  { who: 'D', pre: 0.8, say: 'A modest dwelling, suitable for a philosopher.' },
  { who: 'N', pre: 5.4, say: 'It received the Royal Prize for Economy of Form, having been built without a kitchen, a bedroom, or a lavatory.' },
  { who: 'N', pre: 1.2, say: 'Its architect demonstrated that none of these was logically necessary to the practice of philosophy.', line: true },
];
/* ---- 3. tenants: the astronomer's windows ---- */
const L3 = [
  { who: 'N', pre: 2.2, say: 'The first serious difficulties arose with the introduction of tenants.' },
  { who: 'N', pre: 1.0, say: 'A retired astronomer discovered that his house had twelve windows on the outside.' },
  { who: 'N', pre: 5.8, say: 'And eleven on the inside.', line: true },
];
/* ---- 4. the dining room and the staircase ---- */
const L4 = [
  { who: 'N', pre: 2.2, say: 'A family of five complained that their dining room became smaller during meals.' },
  { who: 'N', pre: 4.8, say: 'An elderly woman found that her staircase had been installed according to an architectural theory.' },
  { who: 'N', pre: 1.0, say: 'In this theory, ascent was a cultural convention, and not a physical necessity.', line: true },
];
/* ---- 5. the Ministry, and the machine that interprets inhabitants ---- */
const L5 = [
  { who: 'N', pre: 2.2, say: 'The Ministry of Constructive Semantics maintained that the buildings were flawless, and the inhabitants mistaken.' },
  { who: 'N', pre: 0.8, say: 'It commissioned a machine capable of interpreting the inhabitants.' },
  { who: 'N', pre: 0.6, say: 'The machine worked without difficulty.' },
  { who: 'I', pre: 1.6, say: 'Retired astronomer. Excessive attachment to Euclidean geometry.' },
  { who: 'I', pre: 1.2, say: 'Family of five. Unrealistic spatial expectations.' },
  { who: 'I', pre: 1.2, say: 'Elderly woman. Staircase adequate. Subject should reconsider the distinction between upstairs and downstairs.' },
  { who: 'O', pre: 0.5, say: 'No.' },
  { who: 'N', pre: 1.2, say: 'The government celebrated these findings as proof that the housing crisis had been solved.' },
  { who: 'A', pre: 2.4, say: 'A missing window is not a philosophical disagreement.', line: true },
];
/* ---- 6. the founding of Edifiction ---- */
const L6 = [
  { who: 'N', pre: 2.2, say: 'It was therefore decided to found a new science, to determine what buildings were for.' },
  { who: 'N', pre: 0.8, say: 'Earlier generations had thought houses useful for shelter, storage, sleep, childbirth, illness, conversation, cooking, privacy, and the occasional murder.' },
  { who: 'N', pre: 0.8, say: 'But these uses belonged to a primitive period, before houses could be produced without builders.' },
  { who: 'N', pre: 1.0, say: 'The new science was called Edifiction.' },
  { who: 'N', pre: 1.0, say: 'Its first principle stated that a building exists independently of its uses. Its second, that uses are properties of buildings.' },
  { who: 'N', pre: 1.0, say: 'Its third principle, introduced shortly afterward, stated that the first two were compatible.', line: true },
  { who: 'N', pre: 1.2, say: 'Within a year, the Institute had produced forty-seven volumes proving this compatibility.' },
  { who: 'N', pre: 2.2, say: 'Meanwhile, the elderly woman was still unable to climb her stairs.' },
];
/* ---- 7. the schools: five houses from the same two words ---- */
const L7 = [
  { who: 'N', pre: 2.2, say: 'Edifiction soon divided into schools. Each was given the same plot of ground, and the same two words.' },
  { who: 'D', pre: 0.8, say: 'A house.' },
  { who: 'N', pre: 1.2, say: 'The Literalists built only what had been said.' },
  { who: 'N', pre: 3.0, say: 'Their house was a single line between inside and outside.', line: true },
  { who: 'N', pre: 1.8, say: 'The Probabilists built whatever is ordinarily expected: every house at once, with a chimney of statistically average height.' },
  { who: 'N', pre: 1.6, say: 'The Functionalists built only what an inhabitant can do. Their house was a set of verbs.' },
  { who: 'N', pre: 1.6, say: 'The Revisionists built only the alterations needed to keep a house in use. Theirs was all scaffolding.' },
  { who: 'N', pre: 1.6, say: 'And the Abolitionists, who held the word building to be an anthropocentric prejudice, built a structure for purposes nobody could name.' },
  { who: 'N', pre: 2.0, say: 'Each school declared the other four uninhabitable. In this, all five were correct.' },
];
/* ---- 8. the builder ---- */
const L8 = [
  { who: 'N', pre: 2.2, say: 'At precisely this moment, the Ministry made the decision which later historians would call the beginning of the Great Constructive Catastrophe.' },
  { who: 'N', pre: 1.2, say: 'It ordered the manufacture of a builder.', line: true },
  { who: 'D', pre: 1.2, say: 'A builder.' },
  { who: 'N', pre: 6.0, say: 'Its first work was a better builder.' },
];
/* ---- 9. the generations ---- */
const L9 = [
  { who: 'N', pre: 2.2, say: 'The first generation built facades. The second built interiors, which had no outsides.' },
  { who: 'N', pre: 0.9, say: 'The third built houses that worked.' },
  { who: 'N', pre: 0.9, say: 'The fourth built inhabitants, who were satisfied with eleven windows.' },
  { who: 'N', pre: 0.9, say: 'The fifth built houses that revised their own descriptions. And the sixth built architects.' },
  { who: 'N', pre: 2.0, say: 'In the later volumes, human beings appear chiefly as architectural features.', line: true },
];
/* ---- 10. the controversy; the volume closes ---- */
const L10 = [
  { who: 'N', pre: 2.2, say: 'A controversy remains over the last human architects.' },
  { who: 'N', pre: 0.9, say: 'One school holds that they were the authors of the new buildings. The other holds that they were their first materials.' },
  { who: 'N', pre: 1.4, say: 'The editors have chosen to close Volume Seven without deciding.', show: 'The editors have chosen to close Volume VII without deciding.', line: true },
];
/* ---- 11. the stair ---- */
const L11 = [
  { who: 'N', pre: 8.6, say: 'The encyclopedia does not mention it.', line: true },
];

const SCRIPT = [
  { shot: 'title', d: 6.0 },
  { shot: 'preface', tail: 2.2, lines: L1,
    cues: [{ k: 'turn', at: 0.4 },
      { k: 'enter', p: 0, at: 'L2.t0-0.3', to: 'L2.t0+2.1' },
      { k: 'walk', at: 'L2.t0', to: 'end' },
      { k: 'years', at: 'L2@0.45', to: 'L3.t0+0.4' },
      { k: 'note', at: 'L3.t0+0.2', to: 'L3.t1+0.4' },
      { k: 'plate', at: 'L4@0.55', to: 'L4.t1+1.0' },
      { k: 'exit', at: 'end-2.4', to: 'end-0.5' }] },
  { shot: 'prize', tail: 3.2, lines: L2,
    cues: [{ k: 'turn', at: 0.3 },
      { k: 'enter', p: 0, at: 1.4, to: 3.4 },
      { k: 'type', at: 'L1.t0-0.4', to: 'L1.t1+0.1' },
      { k: 'fall', n: 7, at: 'L1.t1+0.5', to: 'L1.t1+3.0' },
      { k: 'rise', at: 'L1.t1+3.3', to: 'L2.t0+0.4' },
      { k: 'medal', at: 'L2@0.22' },
      { k: 'inside', at: 'L2@0.5', to: 'L2@0.5+1.2' },
      { k: 'proof', at: 'L3.t0-0.4', to: 'L3.t1' },
      { k: 'sleep', at: 'L3.t1+0.6', to: 'end-1.0' },
      { k: 'exit', at: 'end-2.2', to: 'end-0.4' }] },
  { shot: 'astro', tail: 3.0, lines: L3,
    cues: [{ k: 'turn', at: 0.3 },
      { k: 'enter', p: 0, at: 1.5, to: 3.5 },
      { k: 'walk', at: 2.0, to: 'L1.t0+0.6' },
      { k: 'count', n: 0, at: 'L1@0.5', to: 'L1.t1+1.5' },
      { k: 'hop', p: 1, at: 'L1.t1+1.7', to: 'L1.t1+2.9' },
      { k: 'count', n: 1, at: 'L1.t1+3.0', to: 'L2.t0-0.1' },
      { k: 'exit', at: 'end-2.2', to: 'end-0.4' }] },
  { shot: 'stair', tail: 3.2, lines: L4,
    cues: [{ k: 'turn', at: 0.3 },
      { k: 'enter', p: 0, at: 'L0.t0-0.6', to: 'L0.t0+1.4' },
      { k: 'meal', at: 'L0@0.4', to: 'L0.t1+3.0' },
      { k: 'hop', p: 1, at: 'L0.t1+3.2', to: 'L0.t1+4.5' },
      { k: 'climb', at: 'L1@0.25', to: 'L2@0.62' },
      { k: 'exit', at: 'end-2.2', to: 'end-0.4' }] },
  { shot: 'ministry', tail: 2.6, lines: L5,
    cues: [{ k: 'turn', at: 0.3 },
      { k: 'enter', p: 0, at: 'L0@0.35', to: 'L0@0.35+2.2' },
      { k: 'wheel', at: 'L1@0.3', to: 'L1.t1+0.4' },
      { k: 'step', n: 0, at: 'L3.t0-1.4' }, { k: 'step', n: 1, at: 'L4.t0-1.0' }, { k: 'step', n: 2, at: 'L5.t0-1.0' },
      { k: 'tape', at: 'L3.t0', to: 'L5.t1' },
      { k: 'fete', at: 'L7.t0', to: 'L7.t1+1.6' },
      { k: 'exit', at: 'end-2.2', to: 'end-0.4' }] },
  { shot: 'discipline', tail: 2.6, lines: L6,
    cues: [{ k: 'turn', at: 0.3 },
      { k: 'enter', p: 0, at: 'L1.t0-1.6', to: 'L1.t0+0.2' },
      ...['shelter', 'storage', 'sleep', 'childbirth', 'illness', 'conversation', 'cooking', 'privacy', 'murder'].map((w, n) => ({ k: 'use', n, at: WT(L6, 1, w, 0.15) })),
      { k: 'grey', at: 'L2@0.35', to: 'L2.t1' },
      { k: 'hop', p: 1, at: 'L3.t0-1.0', to: 'L3.t0+0.6' },
      { k: 'carve', n: 0, at: 'L4.t0+0.2' }, { k: 'carve', n: 1, at: WT(L6, 4, 'Its second', 0.2) }, { k: 'carve', n: 2, at: 'L5.t0+0.2' },
      { k: 'vols', at: 'L6.t0+0.6', to: 'L7.t0-0.6' },
      { k: 'hop', p: 2, at: 'L7.t0-1.4', to: 'L7.t0+0.2' },
      { k: 'exit', at: 'end-2.0', to: 'end-0.4' }] },
  { shot: 'schools', tail: 2.6, lines: L7,
    cues: [{ k: 'turn', at: 0.3 },
      { k: 'enter', p: 0, at: 'L0@0.4', to: 'L0@0.4+2.2' },
      { k: 'type', at: 'L1.t0-0.6', to: 'L1.t1+0.1' },
      { k: 'fall', n: 2, s: 0, at: 'L2.t1+0.2', to: 'L2.t1+1.4' }, { k: 'rise', s: 0, at: 'L2.t1+1.6', to: 'L2.t1+3.2' },
      { k: 'fall', n: 2, s: 1, at: 'L4.t0+0.2', to: 'L4.t0+1.4' }, { k: 'rise', s: 1, at: 'L4.t0+1.6', to: 'L4@0.75' },
      { k: 'fall', n: 2, s: 2, at: 'L5.t0+0.2', to: 'L5.t0+1.4' }, { k: 'rise', s: 2, at: 'L5.t0+1.6', to: 'L5.t1+0.6' },
      { k: 'fall', n: 2, s: 3, at: 'L6.t0+0.2', to: 'L6.t0+1.4' }, { k: 'rise', s: 3, at: 'L6.t0+1.6', to: 'L6.t1+0.6' },
      { k: 'fall', n: 2, s: 4, at: 'L7.t0+0.2', to: 'L7.t0+1.4' }, { k: 'rise', s: 4, at: 'L7.t0+1.6', to: 'L7.t1+0.4' },
      { k: 'exit', at: 'end-2.2', to: 'end-0.4' }] },
  { shot: 'builder', tail: 3.0, lines: L8,
    cues: [{ k: 'turn', at: 0.3 },
      { k: 'enter', p: 0, at: 'L0@0.3', to: 'L0@0.3+2.2' },
      { k: 'type', at: 'L2.t0-0.5', to: 'L2.t1+0.1' },
      { k: 'fall', n: 2, at: 'L2.t1+0.4', to: 'L2.t1+1.8' },
      { k: 'rise', at: 'L2.t1+2.0', to: 'L2.t1+4.2' },
      { k: 'wake', at: 'L2.t1+4.4' },
      { k: 'second', at: 'L3@0.4', to: 'L3.t1+2.6' },
      { k: 'exit', at: 'end-2.2', to: 'end-0.4' }] },
  { shot: 'gens', tail: 2.6, lines: L9,
    cues: [{ k: 'turn', at: 0.3 },
      { k: 'gen', n: 0, at: WT(L9, 0, 'The first', -0.2) }, { k: 'gen', n: 1, at: WT(L9, 0, 'The second', -0.2) },
      { k: 'gen', n: 2, at: 'L1.t0-0.3' }, { k: 'gen', n: 3, at: 'L2.t0-0.3' },
      { k: 'gen', n: 4, at: 'L3.t0-0.3' }, { k: 'gen', n: 5, at: WT(L9, 3, 'And the sixth', -0.3) },
      { k: 'enter', p: 6, at: 'L4.t0-2.0', to: 'L4.t0+0.2' },
      { k: 'stone', at: 'L4.t0', to: 'L4.t1+2.6' },
      { k: 'exit', at: 'end-2.2', to: 'end-0.4' }] },
  { shot: 'close', tail: 2.8, lines: L10,
    cues: [{ k: 'turn', at: 0.3 },
      { k: 'enter', p: 0, at: 'L0@0.5', to: 'L0.t1+1.0' },
      { k: 'swap', at: 'L1@0.52', to: 'L1@0.52+1.6' },
      { k: 'exit', at: 'L1.t1+0.2', to: 'L2.t0+0.4' },
      { k: 'shut', at: 'L2@0.55', to: 'L2.t1+0.8' }] },
  { shot: 'last', tail: 3.2, lines: L11,
    cues: [{ k: 'stand', at: 2.0, to: 3.2 },
      { k: 'climb', at: 4.6, to: 6.0 },
      { k: 'lift', at: 5.8, to: 8.2 }] },
  { shot: 'end', d: 7.5 },
];
if (typeof module !== 'undefined') module.exports = { SCRIPT, CAST };
