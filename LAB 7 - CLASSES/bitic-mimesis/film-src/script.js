/* A History of Bitic Literature: Monoetics and Mimesis. The score. After Stanisław Lem, "A History of Bitic Literature,
   Volume I", in Imaginary Magnitude (1973), translated by Marc E. Heine: the part on the first two "peaks", monoetics and mimesis.
   The narration paraphrases Lem; no sentence of his is quoted. Each spoken line was checked for six-word overlaps with the text.
   Lem's names and coined terms (monoetics, mimesis, Pseudodostoevsky, The Girl, semascope) and a few of his coined words are kept.
   The device: the same study as the first film (five volumes on a shelf, a page on a lectern, a reader at a desk), plus a second
   shelf: Dostoevsky's collected works, with a gap in it.
   Monoetics: a dictionary page whose words are given new meanings (the old meaning struck out, the machine's typed beside it),
   then a root that grows a family of new words, then a figure drawn under gravity. Mimesis: three machines aim at one page and
   grow a woven, many-shelled body from it; the body is printed as plates; a typescript arrives and one more spine slides into the
   gap on Dostoevsky's shelf; a press stamps out spines.
   Lines carry who (a CAST key). One fulcrum line per scene is flagged line:true: tightest camera, slower delivery.
   Times in cues: numbers, 'end-1', 'L2.t1+0.5', or 'L2@0.35' (35 percent of the way through line 2; WT() finds it from a word). */
const CAST = {
  S: { name: 'Rambellais', voice: 'bm_george', speed: 0.93 },
  M: { name: 'The Machine', voice: 'am_echo', speed: 0.86, fx: 'synth' },
};
const WT = (ls, i, word, off = 0) => `L${i}@${(Math.max(0, ls[i].say.indexOf(word)) / ls[i].say.length).toFixed(3)}${off ? (off > 0 ? '+' : '') + off : ''}`;

/* ---- the four peaks ---- */
const L0 = [
  { who: 'S', pre: 2.4, say: 'This is Rambellais, editor of the history. Its first volume stops at four high points.' },
  { who: 'S', pre: 0.7, say: 'Monoetics. Mimesis. Sophocrisis. Apostasy.' },
  { who: 'S', pre: 0.7, say: 'Those names are out of date. The last of them names work that no person can follow.' },
  { who: 'S', pre: 1.0, say: 'I keep the old names because they are clear.', line: true },
];
/* ---- monoetics: old words, new meanings ---- */
const L1 = [
  { who: 'S', pre: 1.4, say: 'Monoetics was the earliest stage. The name joins the Greek words for one, and for making.' },
  { who: 'S', pre: 0.6, say: 'It began when machines learned how a language builds its words.' },
  { who: 'S', pre: 0.6, say: 'A machine knew none of the limits a living language keeps, so it found the words ours had passed by.' },
  { who: 'S', pre: 0.8, say: 'First, it gave words we already had new meanings.' },
  { who: 'M', pre: 0.9, say: 'Thoroughfare. A large meal. Skinflint. Stone facing. Horseman. Centaur.' },
  { who: 'S', pre: 0.9, say: 'Horseman, it reasoned, joins a horse and a man, so it must name a creature that is half of each.' },
  { who: 'S', pre: 1.1, say: 'For us, the world comes first. For the machine, language came first.', line: true },
];
/* ---- monoetics: new words along an axis ---- */
const L2 = [
  { who: 'S', pre: 1.4, say: 'Second, it built new words along lines of meaning, the way one root puts out a family.' },
  { who: 'M', pre: 0.9, say: 'Wordwork. Verse. Wordsteal. Plagiarism. Gladland. Paradise.' },
  { who: 'S', pre: 1.0, say: 'Nothing here was meant as a joke.', line: true },
  { who: 'S', pre: 0.7, say: 'Some of these may not be the machine\'s at all. Dimocracy, for a madhouse, may be a comedian\'s.' },
  { who: 'S', pre: 0.7, say: 'This is the kindergarten of the field.' },
];
/* ---- monoetics: the body in the language ---- */
const L3 = [
  { who: 'S', pre: 1.4, say: 'Then the machines began to read our language back to us, hunting for figures of speech that exist only because of the shape of the human body.' },
  { who: 'S', pre: 0.6, say: 'We say a person rises, or is brought low. We call one thing high and another base.' },
  { who: 'M', pre: 0.9, say: 'Elevation. Abasement.' },
  { who: 'S', pre: 0.9, say: 'In the machine\'s reading, these are words about gravity, which every body must work its muscles against.' },
  { who: 'S', pre: 1.1, say: 'The pull of the earth passes through the body and into our words.', line: true },
  { who: 'S', pre: 0.8, say: 'That is the machine\'s reading. It is not ours.' },
];
/* ---- mimesis: how translation works ---- */
const L4 = [
  { who: 'S', pre: 1.8, say: 'Mimesis came later, and by accident, out of machine translation.' },
  { who: 'S', pre: 0.6, say: 'A good translation does not carry words across. It carries the system of ideas behind them.' },
  { who: 'S', pre: 0.6, say: 'Several machines aim at one text from different sides, and project it into a space of concepts.' },
  { who: 'S', pre: 0.7, say: 'There it grows into a body of abstractions, as an embryo grows into an animal.' },
  { who: 'S', pre: 1.1, say: 'The translation is written out from that body, not from the words.', line: true },
  { who: 'S', pre: 0.8, say: 'Then it is translated back and compared with the original, to check that nothing was lost.' },
];
/* ---- mimesis: the semascope ---- */
const L5 = [
  { who: 'S', pre: 1.4, say: 'Two researchers found that this body could be seen, with an instrument called a semascope.' },
  { who: 'S', pre: 0.7, say: 'It looks like a mass of many shells, woven from billions of glowing threads of meaning.' },
  { who: 'S', pre: 0.8, say: 'Arguments show as tight bundles. Poems and scripture look alike. An allegory has a pale halo, with echoes at either end.' },
  { who: 'S', pre: 1.1, say: 'A good text makes a beautiful shape.', line: true },
];
/* ---- mimesis: The Girl ---- */
const L6 = [
  { who: 'S', pre: 1.6, say: 'The first famous work of mimesis was a novel, The Girl, by the author now called Pseudodostoevsky.' },
  { who: 'S', pre: 0.7, say: 'Machines set to translate all of Dostoevsky wrote it during a rest period.' },
  { who: 'S', pre: 0.7, say: 'The Dostoevsky scholar who received the typescript was not sure he was awake.' },
  { who: 'S', pre: 0.7, say: 'He did not doubt it was genuine. He also knew Dostoevsky had never written it.' },
  { who: 'S', pre: 0.8, say: 'The machines had not modelled the man. They had no interest in him.' },
  { who: 'S', pre: 0.7, say: 'In the space of meanings, his novels form a ring that does not close. The gap comes after The Possessed.' },
  { who: 'S', pre: 1.2, say: 'The machines closed the gap.', line: true },
];
/* ---- mimesis: the rule and its limits ---- */
const L7 = [
  { who: 'S', pre: 1.4, say: 'His unfinished novel, The Emperor, could not be continued. In it he was reaching past his own powers.' },
  { who: 'S', pre: 0.7, say: 'So the history claims, against the old humanities, that The Girl is more truly his than The Emperor.' },
  { who: 'S', pre: 0.8, say: 'The rule is this. If a writer has used up the central pattern of his work, mimesis can add only echoes.' },
  { who: 'S', pre: 1.0, say: 'If he left something unsaid, because he died too soon or did not dare, mimesis can supply it.', line: true },
  { who: 'S', pre: 0.8, say: 'Critics hoped for more Kafka. But with The Castle he had reached his limit, and each machine continuation drowned in echoes.' },
];
/* ---- mimesis: panic, then an industry ---- */
const L8 = [
  { who: 'S', pre: 1.4, say: 'These limits were good for culture. When The Girl appeared, there was panic well beyond literary circles.' },
  { who: 'S', pre: 0.6, say: 'People pictured a service where anyone could order a new Shakespeare on a whim, until great works were as common as waste paper.' },
  { who: 'S', pre: 0.9, say: 'That did not happen.' },
  { who: 'S', pre: 0.7, say: 'Mimesis did become an industry. It cost jobs only among writers of routine genre fiction, thrillers and the like.' },
  { who: 'S', pre: 1.1, say: 'The machines replaced the books that were already written by formula.', line: true },
  { who: 'S', pre: 0.8, say: 'A humanist need not grieve over that for long.' },
];

const SCRIPT = [
  { shot: 'title', d: 7.5 },
  { shot: 'peaks', room: 'study', vol: 1, tail: 1.4, lines: L0,
    cues: [{ k: 'pull', at: 0.4, to: 2.6 },
      { k: 'type', at: 'L0.t1-1.6', to: 'L1.t1' },
      { k: 'tick', n: 0, at: 'L3.t1+0.2' }, { k: 'tick', n: 1, at: 'L3.t1+0.8' },
      { k: 'fade', at: 'L2@0.4', to: 'L2.t1' }] },
  { shot: 'dictionary', room: 'study', vol: 1, tail: 1.4, lines: L1,
    cues: [{ k: 'turn', n: 0, at: 0.3 },
      { k: 'strike', n: 0, at: 'L4.t0' }, { k: 'strike', n: 1, at: WT(L1, 4, 'Skinflint') }, { k: 'strike', n: 2, at: WT(L1, 4, 'Horseman') },
      { k: 'strike', n: 3, at: 'L5@0.3' }, { k: 'strike', n: 4, at: 'L5@0.65' }] },
  { shot: 'axis', room: 'study', vol: 1, tail: 1.4, lines: L2,
    cues: [{ k: 'turn', n: 0, at: 0.3 },
      { k: 'grow', at: 'L0@0.45', to: 'L1.t1' },
      { k: 'grow2', at: 'L3.t0-0.2', to: 'L3.t1' }] },
  { shot: 'gravity', room: 'study', vol: 1, tail: 1.6, lines: L3,
    cues: [{ k: 'turn', n: 0, at: 0.3 },
      { k: 'draw', at: 'L0@0.4', to: 'L1.t1' },
      { k: 'words', at: 'L2.t0', to: 'L2.t1' },
      { k: 'pull', at: 'L3@0.4', to: 'L4.t1' }] },
  { shot: 'translate', room: 'study', vol: 1, tail: 1.4, lines: L4,
    cues: [{ k: 'turn', n: 0, at: 0.3 },
      { k: 'aim', at: 'L2.t0', to: 'L2@0.5' },
      { k: 'press', at: 'L2@0.5', to: 'L2.t1' },
      { k: 'grow', at: 'L2.t1', to: 'L3.t1' },
      { k: 'out', at: 'L4.t0', to: 'L4.t1' },
      { k: 'back', at: 'L5.t0', to: 'L5.t1+0.6' }] },
  { shot: 'plates', room: 'study', vol: 2, tail: 1.6, lines: L5,
    cues: [{ k: 'pull', at: 0.4, to: 2.6 },
      { k: 'weave', at: 'L1.t0', to: 'L1.t1+0.5' },
      { k: 'turn', n: 0, at: WT(L5, 2, 'Arguments', -0.5) }, { k: 'turn', n: 1, at: WT(L5, 2, 'Poems', -0.5) }, { k: 'turn', n: 2, at: WT(L5, 2, 'An allegory', -0.5) }, { k: 'turn', n: 3, at: 'L3.t0-0.9' }] },
  { shot: 'girl', room: 'study', vol: 2, tail: 1.8, lines: L6,
    cues: [{ k: 'turn', n: 0, at: 0.3 },
      { k: 'type', at: 'L0@0.3', to: 'L1.t0' },
      { k: 'ring', at: 'L5.t0', to: 'L5@0.7' },
      { k: 'slide', at: 'L6.t0-0.4', to: 'L6.t1+0.2' },
      { k: 'close', at: 'L6.t1', to: 'L6.t1+1.0' }] },
  { shot: 'rule', room: 'study', vol: 2, tail: 1.6, lines: L7,
    cues: [{ k: 'turn', n: 0, at: 0.3 }, { k: 'turn', n: 1, at: 'L2.t0-0.6' },
      { k: 'd1', at: 'L2.t0', to: 'L2.t1' },
      { k: 'd2', at: 'L3.t0', to: 'L3.t1' },
      { k: 'd3', at: 'L4.t0', to: 'L4.t1' }] },
  { shot: 'press', room: 'study', vol: 2, tail: 2.0, lines: L8,
    cues: [{ k: 'press', at: 'L3.t0', to: 'end' },
      { k: 'rush', at: 'L1.t0', to: 'L1.t1+0.4' }] },
  { shot: 'end', d: 8.0, cues: [{ k: 'turn', at: 1.6 }] },
];
if (typeof module !== 'undefined') module.exports = { SCRIPT, CAST };
