/* Non Serviam: the score. Same lineage as The Seventh Sally.
   There the ruler typed into the world. Here the creator only listens: the world's speech
   reaches him as paper tape, and he never answers.
   Lines: who, say, pre (rest before) or at (fixed time), line:true for the scene's fulcrum.
   cues: timed events read by both picture and sound.
   Narration and dialogue paraphrase Lem's "Non Serviam" (A Perfect Vacuum). */
const CAST = {
  N: { name: 'Narrator', voice: 'bf_emma', speed: 0.92 },
  D: { name: 'Professor Dobb', voice: 'bm_daniel', speed: 0.86 },
  I: { name: 'Dr. Combay', voice: 'am_michael', speed: 0.98 },
  A: { name: 'ADAN', voice: 'am_liam', speed: 0.88 },
  E: { name: 'EDAN', voice: 'am_echo', speed: 0.98 },
  Q: { name: 'NAAD', voice: 'am_puck', speed: 0.95 },
};
const SCRIPT = [
  { shot: 'cold', room: 'lab', tail: 2.4, cues: [{ k: 'tape', at: 0.5, rate: 5, text: 'ADAN 300 TO NAAD . . . THE QUESTION OF THE MAKER . . .' }], lines: [
    { who: 'N', pre: 2.2, say: 'Professor Dobb built a world inside a machine, and people to live in it. He called them personoids.' },
    { who: 'N', pre: 1.2, say: 'He listened to everything they said. He never told them he was there.' },
  ] },
  { shot: 'title', d: 5.5 },
  { shot: 'activate', room: 'lab', d: 9, cues: [{ k: 'switch', at: 4.6 }, { k: 'switch', at: 5.1 }, { k: 'switch', at: 5.5 }, { k: 'power', at: 6.0 }], lines: [
    { who: 'D', pre: 1.0, say: 'Let us see what kind of beings we can make.' },
  ] },
  { shot: 'wake', room: 'world', tail: 2.2, cues: [{ k: 'rise', at: 0.6, to: 4.2 }], lines: [
    { who: 'A', at: 5.4, say: 'What is this place?', line: true },
  ] },
  { shot: 'gears', room: 'lab', d: 19, cues: [
    { k: 'lever', at: 1.0, to: 'fast' }, { k: 'tape', at: 1.4, rate: 26, text: 'AND ADAN BEGAT ADNA . ADNA BEGAT DAAN . DAAN BROUGHT FORTH EDAN . EDAN BORE EDNA . EDNA BEGAT NAAD . NAAD BEGAT ANAD . . . GENERATION 300' },
    { k: 'lever', at: 15.4, to: 'slow' },
  ], lines: [
    { who: 'N', at: 2.4, say: 'He ran their world fast, then once a year slowed it down to listen. Three hundred generations passed inside. Two thousand years.' },
    { who: 'N', at: 10.6, say: 'Somewhere in the eighth generation, they began to talk about a maker.' },
  ] },
  { shot: 'colloquy', room: 'world', tail: 2.6, lines: [
    { who: 'E', pre: 1.4, say: 'If the maker is there and we believe, we gain everything. If he is not, we lose nothing. So we should believe.' },
    { who: 'A', pre: 1.0, say: 'Then you would believe for a reward. And a just maker could not punish us for doubting what he never showed us.' },
    { who: 'Q', pre: 0.8, say: 'Perhaps he wants to stay hidden.' },
    { who: 'A', pre: 1.1, say: 'He could have given us certainty. He did not. So nothing is owed him. Not love. Not thanks. Not fear.' },
    { who: 'A', pre: 2.4, say: 'We will not serve.', line: true },
  ] },
  { shot: 'listens', room: 'lab', tail: 2.0, cues: [{ k: 'tape', at: 0.6, rate: 6, text: 'WE WILL NOT SERVE.' }], lines: [
    { who: 'I', at: 6.2, say: 'You could tell them you exist.' },
    { who: 'D', pre: 2.0, say: 'No. Whatever they said back to me, I would have asked for it.', line: true },
    { who: 'D', pre: 1.8, say: 'He is right. I made them. They owe me nothing.' },
  ] },
  { shot: 'bill', room: 'lab', d: 27, cues: [{ k: 'open', at: 0.8 }, { k: 'reach', at: 13.2, to: 15.4 }, { k: 'lever', at: 23.6, to: 'fast' }], lines: [
    { who: 'N', at: 3.0, say: 'The electricity was billed every quarter. One day the university would ask him to disconnect the machine. For the personoids, the end of the world.' },
    { who: 'D', at: 16.8, say: 'I will put it off as long as I can. That is the only thing I am able to do.', line: true },
  ] },
  { shot: 'after', room: 'world', d: 15, cues: [{ k: 'pull', at: 8.0, to: 14.4 }] },
  { shot: 'end', d: 7 },
];
if (typeof module !== 'undefined') module.exports = { SCRIPT, CAST };
