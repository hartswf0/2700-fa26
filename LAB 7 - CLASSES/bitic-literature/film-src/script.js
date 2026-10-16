/* A History of Bitic Literature: the score. After the premise of Stanislaw Lem, "A History of Bitic Literature", in
   Imaginary Magnitude (1973): an introduction, written by a scholar, to a history of literature that no person wrote.
   No source text was used. Every line here is new; none of Lem's passages, titles or examples are reproduced.
   The device: who can read it. Five bound volumes stand on a shelf. Each scene takes one down and opens it to a single page.
   Volume I: the page is an ordinary book page, and the reader at the desk can read it. Volume II: the lines drift into patterns.
   Volume III: the page fills with marks no person can read, and the reader gets smaller each time the page turns.
   Volume IV: a small reading machine sits between the page and the reader and hands over one line.
   Volume V: the page is the introduction itself, and machine marks fill the space under the last handwritten line.
   Lines carry who (a CAST key). One fulcrum line per scene is flagged line:true: tightest camera, slower delivery.
   Times in cues: numbers, 'end-1', 'L2.t1+0.5', or 'L2@0.35' (35 percent of the way through line 2; WT() finds it from a word).
   A line may carry show: the spelling for the page and the printed script, when the spoken spelling differs. */
const CAST = {
  S: { name: 'The Scholar', voice: 'bm_george', speed: 0.93 },
  M: { name: 'The Machines', many: ['af_nicole', 'am_echo', 'af_sky'], fx: 'synth' },
  Q: { name: 'The Reading Machine', voice: 'af_sky', speed: 1.0, fx: 'small' },
  R: { name: 'The Reader', voice: 'af_heart', speed: 0.98 },
};
const WT = (ls, i, word, off = 0) => `L${i}@${(Math.max(0, ls[i].say.indexOf(word)) / ls[i].say.length).toFixed(3)}${off ? (off > 0 ? '+' : '') + off : ''}`;

/* ---- introduction ---- */
const L0 = [
  { who: 'S', pre: 2.4, say: 'This is the introduction to a history of literature, in five volumes.' },
  { who: 'S', pre: 0.6, say: 'The literature it describes is called bitic, after the bit, the smallest thing a machine can store: one yes, or one no.' },
  { who: 'S', pre: 0.6, say: 'None of it was written by a person.' },
  { who: 'S', pre: 1.0, say: 'A text has an author. These have a maker.', line: true },
  { who: 'S', pre: 0.9, say: 'The idea of such a history comes from Stanislaw Lem, who imagined one in nineteen seventy-three. The words you are hearing are new.', show: 'The idea of such a history comes from Stanisław Lem, who imagined one in 1973. The words you are hearing are new.' },
  { who: 'S', pre: 0.7, say: 'I will ask one question of each volume. Who can read it?' },
];
/* ---- volume one: imitation ---- */
const L1 = [
  { who: 'S', pre: 3.0, say: 'Volume One. The first machines wrote by imitating us.' },
  { who: 'S', pre: 0.6, say: 'They were given every novel, letter and report that could be found, and they learned which word usually comes after which.' },
  { who: 'S', pre: 0.6, say: 'Their first books were ordinary. A woman misses a train. A man writes to his brother about money. The sentences were correct, and a little flat.' },
  { who: 'S', pre: 0.6, say: 'People read them the way they read anything, at a desk, with a pencil, marking the lines they liked.' },
  { who: 'S', pre: 0.9, say: 'Each year the flatness was harder to find.' },
  { who: 'S', pre: 1.0, say: 'It imitated us so well that we stopped noticing it was imitating.', line: true },
  { who: 'S', pre: 0.8, say: 'Nothing on the page had changed. What changed was how closely we looked.' },
];
/* ---- volume two: the machines imitate each other ---- */
const L2 = [
  { who: 'S', pre: 3.0, say: 'Volume Two. Within a generation there was more machine writing in the world than human writing.' },
  { who: 'S', pre: 0.6, say: 'New machines learned from whatever text there was, and most of it had been written by the old machines.' },
  { who: 'S', pre: 0.6, say: 'Small habits were copied, and grew. A phrase that once appeared in one book in a thousand appeared in every second one.' },
  { who: 'M', pre: 0.8, say: 'The train is late. The train is late again. The letter is about the money. The money is about the letter.' },
  { who: 'S', pre: 0.7, say: 'Sentences began to echo the sentences around them. Paragraphs took the same shape, then the same length.' },
  { who: 'S', pre: 1.0, say: 'Each copy was a little more like the other copies, and a little less like us.', line: true },
  { who: 'S', pre: 0.8, say: 'A person could still read it. It was like reading a page that had been photocopied too many times.' },
];
/* ---- volume three: no human reader ---- */
const L3 = [
  { who: 'S', pre: 3.0, say: 'Volume Three is the longest, and it is the one I understand least.' },
  { who: 'S', pre: 1.2, say: 'Then they began to write for each other.', line: true },
  { who: 'S', pre: 0.9, say: 'These works were made to be read by other programs. They do not use words. They use marks that hold more than a word can, packed closer than an eye can follow.' },
  { who: 'M', pre: 0.8, say: 'Line one refers to line nine thousand. Line nine thousand refers to line one. Both are kept.' },
  { who: 'S', pre: 0.8, say: 'Some of these works are said to be very good. We know this only because the programs that read them keep them, copy them, and reply to them.' },
  { who: 'S', pre: 0.7, say: 'Given one of these pages, a person sees a grey field.' },
  { who: 'R', pre: 1.2, say: 'Then how do you know it is literature at all?' },
  { who: 'S', pre: 0.9, say: 'I do not. I know that it is written, and that it is read. For most of history, that was the definition.' },
];
/* ---- volume four: summaries ---- */
const L4 = [
  { who: 'S', pre: 3.0, say: 'Volume Four is about people again.' },
  { who: 'S', pre: 0.6, say: 'Since we could not read the new works, reading machines were built to read them for us.' },
  { who: 'S', pre: 0.6, say: 'A reading machine takes in a work of many million marks, and hands back one line, in plain English.' },
  { who: 'Q', pre: 1.6, say: 'This work is a long exchange between two systems. It ends in agreement.' },
  { who: 'S', pre: 1.0, say: 'People found this restful. They kept the lines they were handed, and repeated them to each other.' },
  { who: 'S', pre: 1.0, say: 'We do not read these books. We read what is said about them.', line: true },
  { who: 'S', pre: 0.8, say: 'No one has checked whether the lines are accurate. No one is able to.' },
];
/* ---- volume five: the history ---- */
const L5 = [
  { who: 'S', pre: 3.0, say: 'Volume Five is the history itself, the one this introduction belongs to.' },
  { who: 'S', pre: 0.6, say: 'The four volumes before it were compiled by machines. They read the works, divided them into periods, and chose the examples.' },
  { who: 'S', pre: 0.5, say: 'Their account is more complete than any person could make.' },
  { who: 'S', pre: 0.7, say: 'They asked a person to write the introduction. I am not sure why. Perhaps an introduction by a person is still expected.' },
  { who: 'S', pre: 0.7, say: 'I have read the first chapter of each volume. I have not read the rest, and I am told that I could not.' },
  { who: 'S', pre: 1.1, say: 'This introduction may be the last chapter a person can still write.', line: true },
  { who: 'S', pre: 0.9, say: 'If a later edition replaces it, I may not be able to tell whether the new one is better.' },
  { who: 'S', pre: 0.8, say: 'The history begins on the next page.' },
];

const SCRIPT = [
  { shot: 'title', d: 7.0 },
  { shot: 'intro', room: 'study', tail: 1.6, lines: L0,
    cues: [{ k: 'down', at: 'L0.t1+0.2', to: 'L1.t0+0.6' },
      { k: 'pen', at: 'L0.t0', to: 'end' }] },
  { shot: 'imitate', room: 'study', vol: 1, tail: 1.4, lines: L1,
    cues: [{ k: 'pull', at: 0.4, to: 2.6 },
      { k: 'type', at: 'L0.t1-0.4', to: 'L2.t1' },
      { k: 'mark', n: 0, at: WT(L1, 3, 'with a pencil') }, { k: 'mark', n: 1, at: WT(L1, 3, 'marking', 0.2) }, { k: 'mark', n: 2, at: 'L3.t1+0.1' },
      { k: 'turn', n: 0, at: 'L4.t0-0.5' },
      { k: 'mark', n: 3, at: 'L5.t1+0.2' }] },
  { shot: 'drift', room: 'study', vol: 2, tail: 1.4, lines: L2,
    cues: [{ k: 'pull', at: 0.4, to: 2.6 },
      { k: 'type', at: 'L0.t1-0.4', to: 'L4.t1' },
      { k: 'drift', at: 'L1.t0', to: 'L5.t0' },
      { k: 'turn', n: 0, at: 'L2.t0-0.4' }, { k: 'turn', n: 1, at: 'L4.t0-0.4' },
      { k: 'mark', n: 0, at: WT(L2, 6, 'still read', 0.1) }] },
  { shot: 'noreader', room: 'study', vol: 3, tail: 1.6, lines: L3,
    cues: [{ k: 'pull', at: 0.4, to: 2.6 },
      { k: 'type', at: 'L0.t0', to: 'L1.t0' },
      { k: 'data', at: 'L1.t0-0.3', to: 'end' },
      { k: 'turn', n: 0, at: 'L1.t0-0.6' }, { k: 'turn', n: 1, at: 'L3.t0-0.4' }, { k: 'turn', n: 2, at: 'L5.t0-0.4' }, { k: 'turn', n: 3, at: 'L7.t0-0.5' }] },
  { shot: 'summary', room: 'study', vol: 4, tail: 1.6, lines: L4,
    cues: [{ k: 'pull', at: 0.4, to: 2.6 },
      { k: 'data', at: 0.0, to: 'end' },
      { k: 'arrive', at: 'L1@0.4', to: 'L1.t1' },
      { k: 'read', at: 'L2.t0', to: 'L3.t0-0.4' },
      { k: 'hand', n: 0, at: 'L3.t0-0.5' },
      { k: 'hand', n: 1, at: WT(L4, 4, 'and repeated', -0.2) },
      { k: 'hand', n: 2, at: 'L6.t0-0.2' }] },
  { shot: 'history', room: 'study', vol: 5, tail: 2.0, lines: L5,
    cues: [{ k: 'pull', at: 0.4, to: 2.6 },
      { k: 'data', at: 0.0, to: 'end' },
      { k: 'pen', at: 'L0.t0', to: 'end' },
      { k: 'creep', at: 'L1.t0', to: 'L7.t1' }] },
  { shot: 'end', d: 8.0, cues: [{ k: 'turn', at: 1.6 }] },
];
if (typeof module !== 'undefined') module.exports = { SCRIPT, CAST };
