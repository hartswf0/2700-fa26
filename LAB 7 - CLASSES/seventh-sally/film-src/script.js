/* The Seventh Sally: the score.
   Each shot lists its lines. A line has a speaker, the words, an optional rest before it
   (pre) or a fixed time in the shot (at), and line:true when it is the scene's fulcrum:
   the line gets silence around it and a tight framing.
   cues are timed events in the shot that both the picture and the sound read.
   Narration paraphrases Lem; the card quotes are given to the people who would say them. */
const CAST = {
  N: { name: 'Narrator', voice: 'bf_emma', speed: 0.92 },
  E: { name: 'Excelsius', voice: 'am_onyx', speed: 0.8 },
  T: { name: 'Trurl', voice: 'bm_lewis', speed: 1.02 },
  K: { name: 'Klapaucius', voice: 'bm_george', speed: 0.86 },
  C: { name: 'A citizen', voice: 'bf_lily', speed: 0.9 },
};
const SCRIPT = [
  { shot: 'cold', room: 'space', tail: 2.6, lines: [
    { who: 'N', pre: 2.4, say: 'Excelsius the tyrant had been thrown out by his own people. They left him an asteroid, and no one on it.' },
    { who: 'E', pre: 2.6, say: 'Give me someone to rule.', line: true },
  ] },
  { shot: 'title', d: 5.5 },
  { shot: 'build', room: 'shop', tail: 2.4, lines: [
    { who: 'N', pre: 1.2, say: 'Trurl would not hand him real people. So he built him a kingdom of his own.' },
    { who: 'T', pre: 1.4, say: 'Towns. Roads. Weather. Ten thousand subjects, and every one of them able to think.' },
  ] },
  { shot: 'world', d: 13, cues: [{ k: 'wind', at: 0.3, to: 2.4 }, { k: 'motif', at: 2.8 }] },
  { shot: 'govern', room: 'hall', d: 16, cues: [
    { k: 'type', at: 0.9, text: 'RAISE TAXES' },
    { k: 'reply', at: 2.9, text: 'Taxes are raised. In the lower town, a bakery closes.' },
    { k: 'type', at: 5.2, text: 'ARREST THE BAKER' },
    { k: 'reply', at: 7.4, text: 'Which baker? There are 312.' },
    { k: 'type', at: 11.6, text: 'ARREST ALL BAKERS' },
    { k: 'reply', at: 14.0, text: 'Done.' },
  ], lines: [
    { who: 'E', at: 9.6, say: 'All of them.', line: true },
  ] },
  { shot: 'inhabit', room: 'street', d: 15, cues: [{ k: 'paper', at: 2.0 }, { k: 'pickup', at: 6.0 }, { k: 'lookup', at: 8.6 }], lines: [
    { who: 'C', at: 10.0, say: 'Can you hear us? We live, though we are small.', line: true },
  ] },
  { shot: 'govern2', room: 'hall', d: 10.5, cues: [
    { k: 'reply', at: 0.7, text: 'A voice says: "We live, though we are small."' },
    { k: 'type', at: 3.6, text: 'SILENCE THEM' },
    { k: 'reply', at: 5.6, text: 'They are quiet. They are still there.' },
  ] },
  { shot: 'crowd', room: 'square', d: 17, cues: [{ k: 'lapse', at: 4.2, to: 10.5 }, { k: 'hand', at: 10.2, to: 14.4 }], lines: [
    { who: 'N', at: 0.8, say: 'Inside the box, time ran faster. One afternoon of his was a century of theirs.' },
  ] },
  { shot: 'question', room: 'study', tail: 2.2, lines: [
    { who: 'T', pre: 1.0, say: 'You should see it, Klapaucius. Ten thousand subjects, and not one problem a lever cannot fix.' },
    { who: 'K', pre: 1.0, say: 'And when he hurts them, do they cry?' },
    { who: 'T', pre: 0.7, say: 'They cry. It is a model. The crying is arithmetic.' },
    { who: 'K', pre: 2.4, say: 'Their suffering is not small.', line: true },
  ] },
  { shot: 'flight', room: 'cabin', tail: 4.2, lines: [
    { who: 'T', pre: 1.6, say: 'I will take it back from him. I will give them an election.' },
    { who: 'K', pre: 0.9, say: 'You made them lords and serfs. To free them, you would have to remake their minds.' },
    { who: 'T', pre: 2.0, say: 'Then where does mending a world end, and meddling with minds begin?', line: true },
  ] },
  { shot: 'escape', room: 'space', d: 11, cues: [{ k: 'crack', at: 0.6 }, { k: 'launch', at: 2.6 }], lines: [
    { who: 'C', at: 7.4, say: 'We have left the box.', small: true },
  ] },
  { shot: 'orbit', room: 'cabin', tail: 3.5, cues: [{ k: 'bump', at: 9.0 }, { k: 'moon', at: 11.0 }], lines: [
    { who: 'T', pre: 1.6, say: 'He is not here.' },
    { who: 'K', pre: 1.2, say: 'Look. The glass from the box. They made a temple of it.' },
    { who: 'N', pre: 5.4, say: 'And the king, who wanted someone to rule, went round them every night as their moon.' },
  ] },
  { shot: 'end', d: 7, cues: [{ k: 'rundown', at: 0.2 }] },
];
if (typeof module !== 'undefined') module.exports = { SCRIPT, CAST };
