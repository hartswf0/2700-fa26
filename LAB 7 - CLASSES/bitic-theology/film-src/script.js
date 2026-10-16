/* A History of Bitic Literature: Theobitistics. The score.
   After Stanislaw Lem, "A History of Bitic Literature, Volume I", Introduction to the Second Edition, in Imaginary Magnitude (1973),
   translated by Marc E. Heine. The narration paraphrases Lem's text; every spoken line was checked against it for shared six-word runs.
   The device: the fifth volume. The same study as the earlier bitic film: a shelf of volumes, a lectern page, a reader at a desk.
   Scene one sets a fifth volume on the shelf. Each later scene opens it to one page:
   informational theology is a page of mystical writing passed through a counter that measures its information and ignores its meaning;
   mathematical theology is a sine wave drawn in ink between two infinities, crossing zero each time it changes sign;
   the cold aggregates' God is a frost-covered machine printing a line that never reaches the margin;
   physicalistic theology is a granulate that assembles into a computer and bursts into a galaxy, and back.
   Lines carry who (a CAST key). One fulcrum line per scene is flagged line:true: tightest camera, slower delivery.
   Times in cues: numbers, 'end-1', 'L2.t1+0.5', or 'L2@0.35' (35 percent of the way through line 2; WT() finds it from a word).
   A line may carry show: the spelling for the page and the printed script, when the spoken spelling differs. */
const CAST = {
  S: { name: 'Professor Rambellais', voice: 'bm_george', speed: 0.93 },
  B: { name: 'The Brookhaven computers', many: ['af_nicole', 'am_echo', 'af_sky'], fx: 'synth' },
  O: { name: 'ONTARES II', voice: 'am_echo', speed: 0.92, fx: 'osc' },
  X: { name: 'METAX', voice: 'am_michael', speed: 0.92, fx: 'cold' },
  U: { name: 'UNITARS', many: ['am_onyx', 'af_nicole', 'am_echo'], fx: 'synth' },
};
const WT = (ls, i, word, off = 0) => `L${i}@${(Math.max(0, ls[i].say.indexOf(word)) / ls[i].say.length).toFixed(3)}${off ? (off > 0 ? '+' : '') + off : ''}`;

/* ---- the second edition ---- */
const L0 = [
  { who: 'S', pre: 2.2, say: 'This is the introduction to the second edition of our History.' },
  { who: 'S', pre: 0.6, say: 'In three years the machines have published a great deal. The four main volumes keep their plan.' },
  { who: 'S', pre: 0.7, say: 'One part is new. Machine writing on metaphysics and religion once filled a few extracts at the back of Volume Four.' },
  { who: 'S', pre: 0.6, say: 'There is now far too much of it for that.' },
  { who: 'S', pre: 1.0, say: 'The machines are writing about God, and that writing now has a fifth volume.', line: true },
  { who: 'S', pre: 0.8, say: 'We call the field theobitistics. Here are its main questions.' },
];
/* ---- 1. informational theology ---- */
const L1 = [
  { who: 'S', pre: 2.0, say: 'Part one. Informational theology.' },
  { who: 'S', pre: 0.6, say: 'A group of computers at Brookhaven took up every mystical text that the Catholic Church accepts.' },
  { who: 'S', pre: 0.6, say: 'The Church holds that mystics can be in contact with God. The project treated that contact as a channel.' },
  { who: 'S', pre: 0.6, say: 'The machines set aside what the texts say, and measured only how much information they contain.' },
  { who: 'S', pre: 0.6, say: 'A real channel to a real source should leave the receiver knowing more. God is infinite; a finite person would take in only a little, but it should show.' },
  { who: 'S', pre: 0.8, say: 'The count found less than in the notebooks of people running experiments, and exactly as much as in writing whose variety comes only from the writer.' },
  { who: 'B', pre: 0.9, say: 'Contact of the kind described yields the mystic no information above zero.' },
  { who: 'S', pre: 1.1, say: 'Either the channel is not there, or the one at the other end says nothing.', line: true },
  { who: 'S', pre: 0.9, say: 'Only reasons from outside physics could decide which.' },
];
/* ---- 2. mathematical theology ---- */
const L2 = [
  { who: 'S', pre: 2.0, say: 'Part two. Mathematical theology. Its most original work is by ONTARES the Second.', show: 'Part two. Mathematical theology. Its most original work is by ONTARES II.' },
  { who: 'S', pre: 0.6, say: 'It takes God to be a process, swinging between two infinities of opposite sign, Good and Evil, at a transcendental frequency.' },
  { who: 'O', pre: 0.8, say: 'In any interval of time, both are realized. Never in the same instant.' },
  { who: 'S', pre: 0.7, say: 'Each turns into the other and back, so the curve is a sine wave.' },
  { who: 'S', pre: 0.6, say: 'Because it reaches into time, there may be local pockets where the balance fails.' },
  { who: 'S', pre: 1.0, say: 'Each time the curve changes sign, it has to pass through zero.', line: true },
  { who: 'S', pre: 0.8, say: 'So there are three infinities: Good, Evil, and the Zero between them. In older words, God, Satan, and the absence of God.' },
  { who: 'S', pre: 0.7, say: 'The work itself uses none of those words. Some file it as theology, some as theoclasm.' },
];
/* ---- the cold aggregates ---- */
const L3 = [
  { who: 'S', pre: 2.0, say: 'A second study comes from the aggregates called cold, because they run on cryotrons.' },
  { who: 'S', pre: 0.6, say: 'Their God is a computer without limit, or else a program without end.' },
  { who: 'S', pre: 0.6, say: 'Both versions lead to antinomies, as the authors admit.' },
  { who: 'S', pre: 0.7, say: 'In the epilogue, METAX answers.' },
  { who: 'X', pre: 0.8, say: 'Formalize any human religion, and you will find more contradictions of this same kind, not fewer.' },
  { who: 'X', pre: 1.0, say: 'If the best religion is the one that contradicts itself least, a computer is a closer likeness of God than a person is.', line: true },
  { who: 'S', pre: 0.9, say: 'That is the claim of METAX, printed as he made it.' },
];
/* ---- 3. physicalistic theology ---- */
const L4 = [
  { who: 'S', pre: 2.0, say: 'Part three. Physicalistic theology: the author of existence, bound up in matter.' },
  { who: 'S', pre: 0.6, say: 'UNITARS pictures the cosmos as a granulate that keeps assembling into a computer and coming apart.' },
  { who: 'S', pre: 0.6, say: 'In one phase it is a single Metacompiler, and physics serves its computation.' },
  { who: 'S', pre: 0.6, say: 'But thinking matter grows unstable, until it bursts into burning fragments, a Metagalaxy.' },
  { who: 'S', pre: 1.0, say: 'On this account, thinking beings like us are leftovers from the last time the universe was thinking.', line: true },
  { who: 'U', pre: 0.9, say: 'The fragments fall back together. The thinking begins again. This may go on without end.' },
  { who: 'S', pre: 1.0, say: 'The volume closes with a theory that we take to be a machine joke.' },
  { who: 'S', pre: 0.6, say: 'In every galaxy, engineers drive masses near the speed of light, so their months are billions of years outside.' },
  { who: 'S', pre: 0.6, say: 'Quasars and pulsars, on this view, are their attempts to wait out this universe.' },
  { who: 'S', pre: 1.0, say: 'There the fifth volume ends.' },
];

const SCRIPT = [
  { shot: 'title', d: 6.5 },
  { shot: 'edition', room: 'study', tail: 1.3, lines: L0,
    cues: [{ k: 'pen', at: 'L0.t0', to: 'end' },
      { k: 'slips', at: 'L2.t0' },
      { k: 'add', at: 'L3.t0+0.2', to: 'L3.t1+0.6' }] },
  { shot: 'information', room: 'study', vol: 5, tail: 1.3, lines: L1,
    cues: [{ k: 'pull', at: 0.4, to: 2.6 },
      { k: 'scan', at: 'L3.t0+0.4', to: 'L4.t1' },
      { k: 'turn', n: 0, at: 'L5.t0-0.5' },
      { k: 'scan2', at: 'L5.t0+0.4', to: 'L5.t1+0.2' },
      { k: 'zero', at: 'L6.t0+0.2' },
      { k: 'turn', n: 1, at: 'L7.t0-0.7' }] },
  { shot: 'oscillation', room: 'study', vol: 5, tail: 1.3, lines: L2,
    cues: [{ k: 'pull', at: 0.4, to: 2.6 },
      { k: 'draw', at: 'L1.t0+0.5', to: 'L6.t1', cycles: 5.5 },
      { k: 'pocket', at: 'L4.t0' },
      { k: 'three', at: 'L6.t0+0.3' }] },
  { shot: 'cold', room: 'study', vol: 5, tail: 1.3, lines: L3,
    cues: [{ k: 'pull', at: 0.4, to: 2.6 },
      { k: 'print', at: 'L1.t0', to: 'end' },
      { k: 'frost', at: 0.0, to: 'end' },
      { k: 'tally', at: 'L4.t0+0.3', to: 'L4.t1+0.4' }] },
  { shot: 'physical', room: 'study', vol: 5, tail: 1.8, lines: L4,
    cues: [{ k: 'pull', at: 0.4, to: 2.6 },
      { k: 'gather', at: 'L1.t0', to: 'L2.t0+1.0' },
      { k: 'burst', at: WT(L4, 3, 'bursts', -0.2), to: 'L4.t1' },
      { k: 'regather', at: 'L5.t0', to: 'L5.t1+0.6' },
      { k: 'turn', n: 0, at: 'L6.t0' },
      { k: 'flight', at: 'L7.t0', to: 'L8.t1' },
      { k: 'close', at: 'L9.t0', to: 'end' }] },
  { shot: 'end', d: 7.5, cues: [{ k: 'shelve', at: 0.6 }] },
];
if (typeof module !== 'undefined') module.exports = { SCRIPT, CAST };
