/* The Third Sally, or The Dragons of Probability: the score. Sixth in the lineage.
   Every dragon has a probability p from 0 to 1. The picture draws it as dots: each dot
   appears when p passes that dot's own fixed threshold, so a dragon fills in as it becomes
   likely and empties as it becomes unlikely. The sound reads the same numbers: a counter
   clicks at random with a rate that rises with p, and a dragon's roar is cut into short
   grains, each one kept with probability p.
   Trurl's fake dragon is the one exception. It has probability-proof shields, so its p is
   pinned at 1 while Klapaucius makes everything around it improbable.
   Times may be numbers or strings: 'L2.t1+0.5' = line 2 end plus 0.5 s, 'end-1'.
   prob: { dragonName: [[time, p], ...] }  linear between keys.
   Lines paraphrase Lem ("The Third Sally, or The Dragons of Probability", The Cyberiad). */
const CAST = {
  N: { name: 'Narrator', voice: 'bf_emma', speed: 0.92 },
  T: { name: 'Trurl', voice: 'bm_lewis', speed: 1.02 },
  K: { name: 'Klapaucius', voice: 'bm_george', speed: 0.9 },
  P: { name: 'A porter', voice: 'am_echo', speed: 0.9 },
  G: { name: 'Master Gyles', voice: 'bm_daniel', speed: 0.92 },
};
const SCRIPT = [
  { shot: 'lab', room: 'cellar', counter: true, tail: 2.0,
    cues: [{ k: 'dial', at: 'L2.t0', to: 'L2.t1+6' }, { k: 'lunge', at: 'L2.t1+6.2' }, { k: 'down', at: 'L4.t0', to: 'L4.t1+1.6' }],
    prob: { A: [[0, 0], ['L2.t0', 0], ['L2.t1+6', 1], ['L4.t1+0.2', 1], ['L4.t1+1.6', 0]] },
    lines: [
      { who: 'N', pre: 2.6, say: 'Trurl and Klapaucius proved that dragons are not impossible, only improbable. For one to appear by itself, you would have to wait sixteen quintoquadrillion heptillion years.' },
      { who: 'N', pre: 1.0, say: 'So Trurl built a probability amplifier, and tried it in his cellar.' },
      { who: 'T', pre: 1.0, say: 'Raising the probability.' },
      { who: 'T', pre: 7.4, say: 'Klapaucius!' },
      { who: 'K', pre: 0.3, say: 'Lowering it.' },
      { who: 'N', pre: 2.4, say: 'A dragon is distinguished not by its actuality but by its probability. Once it exists, that probability is overwhelming.', line: true },
    ] },
  { shot: 'title', d: 5.5 },
  { shot: 'country', room: 'field', tail: 1.6,
    cues: [{ k: 'ring', at: 'L1.t0-0.4', to: 'L1.t0+4' }],
    prob: { A: [[0, 1], ['L1.t0+3.6', 1], ['L1.t0+5.4', 0]], B: [[0, 0.62], ['end', 0.55]], C: [[0, 0.25], ['end', 0.3]] },
    lines: [
      { who: 'N', pre: 1.0, say: 'Other scholars repeated the experiment, with less care. Dragons got loose, and multiplied.' },
      { who: 'N', pre: 3.0, say: 'When hunters closed a ring around one, it slipped out of real space into configurational space. All they found was a burnt patch and a smell.' },
    ] },
  { shot: 'basil', room: 'street', tail: 1.6,
    prob: { V: [[0, 0.2], ['L3.t0', 0.2], ['L3.t1', 0.85], ['L4.t0', 0.85], ['L4.t1', 0.1], ['end', 0.1]] },
    lines: [
      { who: 'T', pre: 1.2, say: 'Have you heard about this Basiliscus?' },
      { who: 'K', pre: 0.5, say: 'I don’t like it.' },
      { who: 'T', pre: 0.6, say: 'Wherever he lands, dragons appear. Then he charges the king to remove them.' },
      { who: 'K', pre: 0.6, say: 'He brings them with him, at a probability near zero, and turns it up.' },
      { who: 'T', pre: 0.6, say: 'And if he only turns it down again, they come back. By then he is gone, with the gold.', line: true },
    ] },
  { shot: 'dampers', room: 'city', tail: 2.6,
    cues: [{ k: 'fit', at: 'L0.t0+1.0' }, { k: 'fit', at: 'L0.t0+3.4' }, { k: 'fit', at: 'L0.t0+5.6' }, { k: 'fit', at: 'L0.t1+0.6' }],
    prob: { D1: [[0, 0.7], ['L0.t0+1.0', 0.7], ['L0.t0+2.0', 0]], D2: [[0, 0.55], ['L0.t0+3.4', 0.55], ['L0.t0+4.4', 0]], D3: [[0, 0.8], ['L0.t0+5.6', 0.8], ['L0.t0+6.6', 0]], D4: [[0, 0.45], ['L0.t1+0.6', 0.45], ['L0.t1+1.6', 0]] },
    lines: [
      { who: 'N', pre: 1.0, say: 'They split up. Klapaucius did not chase dragons. He set dragon dampers in every square, and soon the beasts were very rare.' },
    ] },
  { shot: 'court', room: 'hall', tail: 1.4,
    cues: [{ k: 'storm', at: 'L1.t0+1.6' }],
    lines: [
      { who: 'N', pre: 0.8, say: 'On the planet of King Pfftius he heard that Trurl had been there first. Trurl had killed the dragon, the king said, and brought twenty-four of its teeth.' },
      { who: 'N', pre: 0.6, say: 'But there was some misunderstanding about the fee. Trurl stormed out. That same day the dragon came back, worse than before.' },
    ] },
  { shot: 'tribute', room: 'mountain', counter: true, tail: 2.0,
    cues: [{ k: 'howl', at: 'L0.t0-2.4' }, { k: 'dial', at: 'L5.t1+0.3', to: 'L5.t1+2.2' }],
    prob: { F: [[0, 0.8], ['end', 0.8]] },
    lines: [
      { who: 'K', pre: 3.4, say: 'What are you carrying, good people?' },
      { who: 'P', pre: 0.5, say: 'The tribute for the dragon, sir. Gold, jewels, imported perfume.' },
      { who: 'K', pre: 0.5, say: 'Perfume? Dragons have no use for perfume. Or for money.' },
      { who: 'P', pre: 0.5, say: 'It used to ask for virgins. That stopped after the stranger came, with his boxes, and a little dial just like yours.' },
      { who: 'G', pre: 0.4, say: 'A fortnight past, or maybe two.' },
      { who: 'N', pre: 1.2, say: 'The counter on his chest settled at eight tenths of a dragon.', line: true },
    ] },
  { shot: 'gorge', room: 'canyon', counter: true, tail: 0.4,
    cues: [{ k: 'shot', at: 'L0.t1+0.8' }, { k: 'scratch', at: 'L0.t1+2.4', to: 'L0.t1+5.6' }, { k: 'improb', at: 'L1.t1+0.4', to: 'L2.t0-0.4' }, { k: 'grenade', at: 'L2.t1+0.6' }, { k: 'charge', at: 'L3.t0', to: 'L4.t1' }],
    prob: { F: [[0, 1], ['end', 1]] },
    lines: [
      { who: 'K', pre: 1.6, say: 'A second head in its body. Two heads always quarrel. It will freeze.' },
      { who: 'K', pre: 6.6, say: 'Then I will make you improbable.' },
      { who: 'K', pre: 11.0, say: 'Nothing touches it.' },
      { who: 'T', pre: 1.8, say: 'Yipe!' },
      { who: 'T', pre: 0.8, say: 'Stop! Stop! Don’t kill me!' },
    ] },
  { shot: 'reveal', room: 'canyon', tail: 3.2,
    cues: [{ k: 'kneel', at: 1.0 }],
    lines: [
      { who: 'K', pre: 2.6, say: 'Trurl? What is this masquerade?' },
      { who: 'T', pre: 0.6, say: 'I killed the real dragon. The king would not pay. He wanted a death certificate, an autopsy, forms in triplicate.' },
      { who: 'T', pre: 0.5, say: 'So I kept its skin. A telephone pole, some pulleys, and I was ready.' },
      { who: 'K', pre: 0.6, say: 'But if they would not pay you in the first place…' },
      { who: 'T', pre: 1.0, say: 'This way I get the tribute.', line: true },
      { who: 'K', pre: 1.2, say: 'It was not right to force them.' },
      { who: 'T', pre: 0.5, say: 'Who forced them? I walked around in the mountains, and in the evenings I howled a little.' },
      { who: 'K', pre: 0.8, say: 'Why didn’t it vanish, when I made everything improbable?' },
      { who: 'T', pre: 0.6, say: 'Probability-proof shields, under the skin. In case Basiliscus came by.' },
      { who: 'T', pre: 1.2, say: 'Come on. I saved the platinum for last. Now you can help me carry it.' },
    ] },
  { shot: 'end', d: 7 },
];
if (typeof module !== 'undefined') module.exports = { SCRIPT, CAST };
