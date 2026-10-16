/* The Fourth Sally, or How Trurl Built a Femfatalatron: the score. After Stanislaw Lem, The Cyberiad.
   The device: measurement and the wrong variable. The machine is a wall of dials (power, efficiency, the rapturometer).
   Trurl turns everything up and every needle climbs to its stop, but the prince comes out unchanged, because the thing to change
   was not inside the prince. In the second half the same kind of dial hangs on the Emperor's wall as an economy gauge, and it is
   the situation, not the prince, that gets turned.
   Lines carry who (a CAST key). One fulcrum line per scene is flagged line:true: it is filmed on the tightest camera and delivered more slowly.
   Times in cues: numbers, 'end-1', 'L2.t1+0.5', or 'L2@0.35' (35 percent of the way through line 2; WT() finds it from a word).
   Everything paraphrases Lem ("The Fourth Sally", The Cyberiad). Nothing is quoted. The titles and the machine's part names are invented. */
const CAST = {
  N: { name: 'Narrator', voice: 'bf_emma', speed: 0.98 },
  T: { name: 'Trurl', voice: 'bm_lewis', speed: 1.04 },
  G: { name: 'The Grand Seneschal', voice: 'bm_fable', speed: 0.9, fx: 'silk' },
  K: { name: 'King Protuberon', voice: 'am_onyx', speed: 0.94 },
  P: { name: 'Prince Pantagoon', voice: 'am_liam', speed: 0.8, fx: 'breath' },
  C: { name: 'The machine', voice: 'bm_daniel', speed: 0.92, fx: 'flat' },
  E: { name: 'The Emperor', voice: 'am_fenrir', speed: 0.92, fx: 'gruff' },
  W: { name: 'The guests', voice: 'bf_lily', speed: 0.98, many: ['bf_lily', 'am_echo', 'af_river', 'bm_george', 'af_nova', 'am_eric'] },
};
const WT = (ls, i, word, off = 0) => `L${i}@${(Math.max(0, ls[i].say.indexOf(word)) / ls[i].say.length).toFixed(3)}${off ? (off > 0 ? '+' : '') + off : ''}`;

/* ---- 1. the knock ---- */
const L1 = [
  { who: 'N', pre: 1.4, say: 'One night, long after Trurl had gone to bed, somebody hammered on his door hard enough to shake it loose.' },
  { who: 'N', pre: 0.5, say: 'He drew the bolts, half asleep. A ship shaped like an enormous pyramid had landed on his front lawn.' },
  { who: 'N', pre: 0.4, say: 'Porters hurried down its ramp with sacks of gifts, and stacked them so fast that the sacks were soon taller than the house.' },
  { who: 'N', pre: 0.4, say: 'Through a gap in the sacks came a knight of polished armor, with jeweled eyes, swept-back antennas, and a stole of diamonds.' },
  { who: 'G', pre: 0.4, say: 'Do I have the pleasure of addressing Trurl, the celebrated constructor?' },
  { who: 'T', pre: 0.3, say: 'Yes. Sorry. I was asleep. Come in, come in.' },
  { who: 'G', pre: 0.7, say: 'My king sends for you. His son is sick with love, and you alone can cure him.', line: true },
];
/* ---- 2. the titles ---- */
const L2 = [
  { who: 'N', pre: 0.9, say: 'Trurl put on a bathrobe. The knight sat down across from him, and his helmet purred like a cat.' },
  { who: 'G', pre: 0.4, say: 'First, a small advance on your reward.' },
  { who: 'N', pre: 0.3, say: 'He drew his sword, and tapped Trurl on the shoulder once for every title.' },
  { who: 'G', pre: 0.3, say: 'Duke of the Lesser Drizzle. Warden of the Eleven Spoons. Baron Upside, and Baron Downside. Keeper of the Royal Hiccup.' },
  { who: 'N', pre: 0.4, say: 'Outside, the sacks had climbed past the window, and the room went dim.' },
  { who: 'T', pre: 0.8, say: 'Matters of the heart are not my field.', line: true },
  { who: 'G', pre: 0.8, say: 'The prince loves Amarandina, the only daughter of the Emperor next door. Our two kingdoms have hated each other for centuries, so her father will refuse. A year has gone by, and the prince is wasting away.' },
  { who: 'N', pre: 0.4, say: 'Trurl looked out through the gap in the sacks. Rows of soldiers stood on his lawn, perfectly still.' },
  { who: 'T', pre: 0.4, say: 'Well. If the king wishes it, then naturally.' },
  { who: 'N', pre: 0.4, say: 'The knight clapped his hands with a clang. Armored retainers carried Trurl aboard, and the ship rose into the sky.' },
];
/* ---- 3. the temple ---- */
const L3 = [
  { who: 'N', pre: 1.0, say: 'In the royal gardens stood the Temple of Contemplation. In three weeks Trurl filled it with cables, glowing screens, rose petals and perfume, and named it the femfatalatron.' },
  { who: 'N', pre: 0.4, say: 'Whoever stepped inside would feel every charm in the universe at once. On the front, behind glass, were the dials.' },
  { who: 'T', pre: 0.4, say: 'Power, forty megamors. Efficiency, ninety-six percent. And this is the rapturometer.' },
  { who: 'N', pre: 0.4, say: 'There was also an ardor damper, a sigh condenser, and a swoon regulator, each with its own knob.' },
  { who: 'N', pre: 0.5, say: 'Forty elderly peers took four hours to push the prince along the garden path. He kicked and butted them all the way, so they pushed with feather pillows.' },
  { who: 'T', pre: 0.8, say: 'Every dial, all the way up.', line: true },
];
/* ---- 4. the first run ---- */
const L4 = [
  { who: 'C', pre: 0.9, say: 'Five. Four. Three. Two. One. Begin.' },
  { who: 'N', pre: 0.8, say: 'The hum rose. Every needle climbed until it pressed against its stop, and stayed there for an hour.' },
  { who: 'N', pre: 0.5, say: 'Trurl watched and waited. He only made sure nothing went too far, so the prince would not fall for the machine instead.' },
  { who: 'N', pre: 0.6, say: 'At last the trapdoor opened. Out of a cloud of perfume, across crushed rose petals, the prince stumbled, and fainted.' },
  { who: 'P', pre: 1.1, say: 'Amarandina.', line: true },
  { who: 'N', pre: 1.2, say: 'Trurl pressed the rapturometer to his forehead. It read one hundred and seven, and then the glass burst, and the mercury ran out, still trembling.' },
];
/* ---- 5. again, heavier ---- */
const L5 = [
  { who: 'N', pre: 0.9, say: 'That night some stonemasons crept inside to see how it worked, and switched it on by accident. They came out smoking, and somebody sent for the fire brigade.' },
  { who: 'N', pre: 0.6, say: 'Next Trurl built a heavier machine, all iron, with bigger parts and bigger dials.' },
  { who: 'C', pre: 0.6, say: 'Five. Four. Three. Two. One. Begin.' },
  { who: 'N', pre: 0.5, say: 'The needles climbed faster this time, and hit their stops harder.' },
  { who: 'P', pre: 0.7, say: 'Amarandina!' },
  { who: 'N', pre: 0.5, say: 'Trurl paced his room for miles, read every manual he owned, and threw each one at the wall.' },
  { who: 'T', pre: 0.9, say: 'Every dial measured the prince. The trouble was never inside the prince.', line: true },
];
/* ---- 6. the audience ---- */
const L6 = [
  { who: 'N', pre: 0.9, say: 'In the morning he asked to see the king.' },
  { who: 'T', pre: 0.4, say: 'Your Majesty, I used the strongest methods there are. I could build him an imitation Amarandina, but sooner or later he would hear about the real one.' },
  { who: 'T', pre: 0.8, say: 'He will not stop loving her as long as he lives. So he has to marry her.', line: true },
  { who: 'K', pre: 0.8, say: 'Impossible. The Emperor will never agree.' },
  { who: 'T', pre: 0.3, say: 'Not even if he had to? If he were beaten, and begged for peace?' },
  { who: 'K', pre: 0.3, say: 'A war, for my son’s wedding? Two great kingdoms in blood? Out of the question.' },
  { who: 'T', pre: 0.4, say: 'That is the answer I hoped for. But not every war is the same.' },
  { who: 'N', pre: 0.4, say: 'Trurl leaned in and whispered his plan, and slowly the king’s face brightened.' },
  { who: 'K', pre: 0.4, say: 'Go and do it, stranger. And good luck to you.' },
];
/* ---- 7. the foundry and the laboratory ---- */
const L7 = [
  { who: 'T', pre: 1.0, say: 'Not one of their people will be killed. Quite the reverse.', line: true },
  { who: 'N', pre: 0.8, say: 'The royal foundries began casting huge cannons, and nobody knew what for. They were set all around the planet, disguised as defenses.' },
  { who: 'N', pre: 0.5, say: 'Trurl lived in the royal laboratory, day and night, over cauldrons that bubbled and gurgled.' },
  { who: 'N', pre: 0.5, say: 'A spy at the door would have heard only small cooing sounds, and seen assistants running past with armfuls of diapers.' },
];
/* ---- 8. the bombardment ---- */
const L8 = [
  { who: 'N', pre: 1.0, say: 'Seven days later, at midnight, the cannons lifted their muzzles toward the pale white star where the Emperor ruled, and fired.' },
  { who: 'N', pre: 0.5, say: 'They fired no shells. They fired babies, wrapped up soft, each one on its own small parachute.' },
  { who: 'N', pre: 0.6, say: 'The babies landed gently, by the thousand, and crawled everywhere, and grew, and there were always more of them.' },
  { who: 'N', pre: 0.5, say: 'The nurseries filled, then the streets, then the treasury. The Emperor’s economy began to sink.' },
  { who: 'N', pre: 0.5, say: 'And still the bundles came down, plump and cheerful, diapers flapping.' },
  { who: 'E', pre: 1.0, say: 'Enough. Tell him the prince may marry my daughter.', line: true },
];
/* ---- 9. taken apart, and the wedding ---- */
const L9 = [
  { who: 'N', pre: 1.0, say: 'The cannons were plugged and stored. Just in case, Trurl took the femfatalatron apart with his own hands.' },
  { who: 'T', pre: 0.9, say: 'Nobody turns this on again.', line: true },
  { who: 'N', pre: 1.0, say: 'At the wedding feast Trurl was best man, dressed in emeralds from collar to cuff, and led the toasts with a ceremonial baton.' },
  { who: 'W', pre: 0.4, say: 'To the prince and Amarandina!', many: { conv: false } },
  { who: 'P', pre: 0.6, say: 'Amarandina.' },
  { who: 'N', pre: 0.9, say: 'Then Trurl loaded his rocket with all the titles both monarchs had given him, and flew home.' },
];

const SCRIPT = [
  { shot: 'title', d: 6.0 },
  { shot: 'knock', room: 'open', tail: 1.2, lines: L1,
    cues: [{ k: 'knock', at: 0.5, to: 'L0.t1+0.2' },
      { k: 'open', at: 'L1@0.12' },
      { k: 'reveal', at: WT(L1, 1, 'A ship', -0.2) },
      { k: 'sacks', at: 'L2.t0', to: 'L3.t0+0.5' },
      { k: 'knight', at: WT(L1, 3, 'came a knight', -0.2), to: 'L3.t1' },
      { k: 'bow', at: 'L4.t0' }] },
  { shot: 'titles', room: 'office', tail: 1.4, lines: L2,
    cues: [{ k: 'purr', at: WT(L2, 0, 'his helmet'), to: 'L0.t1' },
      { k: 'sword', at: 'L2@0.3' },
      { k: 'dub', at: 'L3.t0', to: 'L3.t1' },
      { k: 'dim', at: 'L4.t0', to: 'L4.t1' },
      { k: 'look', at: 'L7.t0' },
      { k: 'clang', at: WT(L2, 9, 'with a clang', -0.15) },
      { k: 'carry', at: WT(L2, 9, 'Armored'), to: WT(L2, 9, 'and the ship') },
      { k: 'lift', at: WT(L2, 9, 'and the ship', -0.3), to: 'end' }] },
  { shot: 'temple', room: 'hall', tail: 1.2, lines: L3,
    cues: [{ k: 'build', at: 0.6, to: WT(L3, 0, 'and named') },
      { k: 'dials', at: WT(L3, 1, 'On the front', -0.3) },
      { k: 'point', n: 0, at: 'L2.t0' }, { k: 'point', n: 1, at: WT(L3, 2, 'Efficiency') }, { k: 'point', n: 2, at: WT(L3, 2, 'And this') },
      { k: 'knobs', at: 'L3.t0', to: 'L3.t1' },
      { k: 'push', at: 'L4.t0-0.3', to: 'L5.t0-0.4' },
      { k: 'shut', at: 'L5.t1+0.4' }] },
  { shot: 'run', room: 'hall', tail: 1.8, lines: L4,
    cues: [{ k: 'switch', at: 0.5 },
      { k: 'count', at: 'L0.t0', to: 'L0.t1' },
      { k: 'climb', at: 'L0.t1+0.1', to: WT(L4, 1, 'and stayed') },
      { k: 'hour', at: WT(L4, 1, 'and stayed'), to: 'L2.t1' },
      { k: 'open', at: 'L3@0.18' },
      { k: 'faint', at: 'L3@0.9' },
      { k: 'press', at: 'L5@0.1' },
      { k: 'burst', at: WT(L4, 5, 'and then the glass', 0.2) }] },
  { shot: 'again', room: 'hall', tail: 1.6, lines: L5,
    cues: [{ k: 'masons', at: 0.3, to: WT(L5, 0, 'and switched') },
      { k: 'on', at: WT(L5, 0, 'by accident') },
      { k: 'smoke', at: WT(L5, 0, 'They came out', -0.1), to: 'L0.t1+0.3' },
      { k: 'iron', at: 'L1.t0-0.4' },
      { k: 'switch', at: 'L2.t0-0.3' },
      { k: 'climb', at: 'L2.t1+0.05', to: 'L3.t1-0.6' },
      { k: 'out', at: 'L4.t0-0.8' },
      { k: 'room', at: 'L5.t0-0.25' },
      { k: 'throw', n: 0, at: WT(L5, 5, 'threw') }, { k: 'throw', n: 1, at: WT(L5, 5, 'threw', 0.7) }, { k: 'throw', n: 2, at: WT(L5, 5, 'threw', 1.4) }] },
  { shot: 'audience', room: 'hall', tail: 1.4, lines: L6,
    cues: [{ k: 'enter', at: 0.4, to: 'L0.t1' },
      { k: 'whisper', at: 'L7.t0', to: 'L7.t1' },
      { k: 'bright', at: WT(L6, 7, 'and slowly') }] },
  { shot: 'lab', room: 'office', tail: 1.6, lines: L7,
    cues: [{ k: 'foundry', at: 'L1.t0-0.3', to: 'L2.t0-0.3' },
      { k: 'disguise', at: WT(L7, 1, 'They were set') },
      { k: 'lab', at: 'L2.t0-0.3' },
      { k: 'coo', n: 0, at: WT(L7, 3, 'small cooing') }, { k: 'coo', n: 1, at: WT(L7, 3, 'small cooing', 0.9) },
      { k: 'run', at: WT(L7, 3, 'and seen'), to: 'end' }] },
  { shot: 'bombard', room: 'open', tail: 1.8, lines: L8,
    cues: [{ k: 'raise', at: 'L0@0.3', to: WT(L8, 0, 'and fired') },
      { k: 'fire', at: WT(L8, 0, 'and fired', 0.3), to: 'L1.t1' },
      { k: 'city', at: 'L2.t0-0.3' },
      { k: 'hall', at: 'L3.t0-0.3' },
      { k: 'sign', at: 'L5@0.7' }] },
  { shot: 'wedding', room: 'hall', tail: 3.5, lines: L9,
    cues: [{ k: 'plug', at: 0.4, to: 'L0@0.45' },
      { k: 'apart', at: 'L0@0.55', to: 'L1.t0-0.2' },
      { k: 'off', at: 'L1.t1+0.3' },
      { k: 'feast', at: 'L2.t0-0.3' },
      { k: 'toast', at: 'L3.t0+0.2' },
      { k: 'fanfare', at: 'L4.t1+0.3' },
      { k: 'home', at: 'L5.t0-0.2', to: 'end' }] },
  { shot: 'end', d: 8 },
];
if (typeof module !== 'undefined') module.exports = { SCRIPT, CAST };
