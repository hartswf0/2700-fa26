/* The First Sally, or The Trap of Gargantius: the score. After Stanislaw Lem, The Cyberiad.
   The device is the graph. Every soldier is a node and every connection is an ink line between two nodes.
   The picture shows connections being made: first between two beads in a golden box, then recruit to recruit,
   then whole armies, until each army is a single object made of nodes and the red line between the kingdoms
   is covered in flowers. The sound is built on the same events: each connection is a click, and its pitch is set
   by how many nodes are already in the network, so the clicks climb a scale as the ranks close.
   Times in cues: numbers, 'end-1', 'L2.t1+0.5' (line 2 end plus half a second), or 'L2@0.35' (35 percent
   of the way through line 2; the helper WT() finds that fraction from a word in the line).
   Lines paraphrase Lem ("The First Sally, or The Trap of Gargantius", The Cyberiad). */
const CAST = {
  N: { name: 'Narrator', voice: 'bf_emma', speed: 0.92 },
  T: { name: 'Trurl', voice: 'bm_lewis', speed: 1.02 },
  K: { name: 'Klapaucius', voice: 'bm_george', speed: 0.9 },
  F: { name: 'King Ferocitus', voice: 'am_fenrir', speed: 0.86 },
  C: { name: 'The child', voice: 'af_nicole', speed: 0.98, fx: 'child' },
  S: { name: 'A sergeant', voice: 'am_michael', speed: 1.0 },
  H: { name: 'The citizens', voice: 'am_liam', speed: 0.95, many: ['af_sky', 'am_liam', 'bf_lily', 'bm_fable', 'af_river', 'am_puck'] },
  M: { name: 'The units', voice: 'am_adam', speed: 0.92, many: ['af_bella', 'am_adam', 'bf_alice', 'bm_daniel', 'af_nicole', 'am_eric'] },
};
/* WT(lines, i, word, offset): the cue time of a word, estimated from its position in the line */
const WT = (ls, i, word, off = 0) => `L${i}@${(Math.max(0, ls[i].say.indexOf(word)) / ls[i].say.length).toFixed(3)}${off ? (off > 0 ? '+' : '') + off : ''}`;

/* ---- 1. the landing ---- */
const L1 = [
  { who: 'N', pre: 1.6, say: 'Trurl and Klapaucius, two constructors, found a planet with one continent. A red line ran down the middle of it. Everything on one side was yellow, and everything on the other was pink.' },
  { who: 'T', pre: 1.4, say: 'Two kingdoms. You take one and I take the other.' },
  { who: 'K', pre: 0.5, say: 'What if a king asks us for weapons?' },
  { who: 'T', pre: 0.4, say: 'We refuse.' },
  { who: 'K', pre: 0.4, say: 'And if he threatens us?' },
  { who: 'K', pre: 2.4, say: 'I have an idea. We use the Gargantius Effect. But we must both use it, and together, or we are in trouble.' },
  { who: 'T', pre: 0.8, say: 'Fine. Two white beads in a golden box, one each.' },
  { who: 'T', pre: 1.2, say: 'Look at yours every evening. If it turns pink, I have started, and you must start too.', line: true },
  { who: 'K', pre: 0.6, say: 'Agreed.' },
  { who: 'N', pre: 0.8, say: 'They landed, shook hands, and went off in opposite directions.' },
];
/* ---- 2. Atrocia ---- */
const L2 = [
  { who: 'N', pre: 1.4, say: 'Trurl went to King Atrocitus, a soldier and a miser. To save money, the king had abolished every punishment but death, and the executioner too. A condemned man had to behead himself.' },
  { who: 'N', pre: 0.8, say: 'His best reform made treason a state office. The Royal Informer and his staff of traitors sold secrets to enemy agents, who bought only old ones, because they were cheaper.' },
  { who: 'N', pre: 0.8, say: 'Trurl offered his services, and asked the king for a few days. Alone in his room, he looked at the bead in the box. It was white. As he watched, it turned pink.' },
  { who: 'T', pre: 1.0, say: 'Pink. He has started, so I start now.', line: true },
];
/* ---- 3. Ferocia ---- */
const L3 = [
  { who: 'N', pre: 1.2, say: 'Klapaucius went to King Ferocitus, who also loved war, but was generous. His guillotines were decorated with flowers.' },
  { who: 'N', pre: 0.8, say: 'He believed laughing makes people cheerful, so everyone had to shout that life was wonderful, and the greeting became Hallelujah.' },
  { who: 'H', pre: 0.6, say: 'Hallelujah! Terrific!', many: { conv: false } },
  { who: 'N', pre: 1.0, say: 'In the first village, a child in the empty street came up to Klapaucius.' },
  { who: 'C', pre: 0.5, say: 'Want to buy something, mister? State secrets, cheap.' },
  { who: 'K', pre: 0.4, say: 'No, thank you. Take me to the mayor.' },
  { who: 'C', pre: 0.4, say: 'My dad is a secret agent.' },
  { who: 'N', pre: 1.0, say: 'In a house, a family sat round a lamp. The needles were handcuffs, the lamp a microphone, the grandmother the chief of police.' },
  { who: 'K', pre: 0.7, say: 'They must have made a mistake.', line: true },
  { who: 'N', pre: 1.0, say: 'The village was a trap for foreign spies. Klapaucius was beaten, jailed, and sentenced to a third-class guillotining.' },
  { who: 'N', pre: 0.8, say: 'At last a higher court cleared him. The king received him, and gave him a bugle to sound whenever he arrived anywhere.' },
];
/* ---- 4. the audience ---- */
const L4 = [
  { who: 'N', pre: 1.0, say: 'The king wanted new weapons. Klapaucius offered a completely new plan.' },
  { who: 'K', pre: 0.8, say: 'A winning army needs wise leaders and obedient soldiers.' },
  { who: 'K', pre: 0.6, say: 'But wisdom has limits. A leader can meet a better leader, be killed, or start wanting the throne.' },
  { who: 'K', pre: 0.6, say: 'So leaders are a necessary evil, and we must make them unnecessary.' },
  { who: 'K', pre: 0.7, say: 'People obey themselves most gladly. So make the army one self.' },
  { who: 'K', pre: 0.7, say: 'Each recruit gets a plug in front and a socket behind. On the order, they connect, and a crowd becomes one mind.' },
  { who: 'K', pre: 0.7, say: 'It grows wiser with its size. A platoon thinks like a sergeant, a company like a colonel, a brigade like a field marshal. A division beats all your strategists.' },
  { who: 'K', pre: 0.8, say: 'An army that is its own leader. That is the plan.', line: true },
  { who: 'F', pre: 0.8, say: 'I will ask my general staff.' },
  { who: 'K', pre: 0.4, say: 'Please do not. They will defend their jobs. One emperor did, and was burned out by his neighbor.' },
];
/* ---- 5. the platoon ---- */
const L5 = [
  { who: 'N', pre: 1.2, say: 'Klapaucius looked at his bead. It was deep red, so Trurl had started too. The king ordered one platoon rewired.' },
  { who: 'S', pre: 1.4, say: 'Close ranks!', line: true },
  { who: 'M', pre: 4.0, say: 'Charge! Charge!', many: { conv: false } },
  { who: 'N', pre: 0.8, say: 'The platoon attacked three squadrons of dragoons, led by six professors of the staff academy, and destroyed them.' },
  { who: 'N', pre: 0.8, say: 'The king retired his generals and had every soldier rewired. Klapaucius rode from barracks to barracks, covered in medals.' },
  { who: 'N', pre: 0.6, say: 'Trurl did the same in Atrocia, but the miser king gave him only a title: Chief Traitor to the Fatherland.' },
  { who: 'N', pre: 0.6, say: 'Both kingdoms prepared for war. The constructors packed in secret, to meet at their ship.' },
];
/* ---- 6. the minds ---- */
const L6 = [
  { who: 'N', pre: 1.0, say: 'The new units no longer had to count off. They knew their own parts.' },
  { who: 'N', pre: 0.6, say: 'After drill, they talked, in chorus.' },
  { who: 'M', pre: 0.6, say: 'What is true. What is a thing. Is there an outside. There is only us.', many: { conv: true } },
  { who: 'N', pre: 0.8, say: 'One battalion of sappers concluded that nothing exists beyond itself. With no king and no enemy, it was disconnected and reassigned to realists.' },
  { who: 'N', pre: 0.7, say: 'In Atrocia, a division gave up naval exercises for contemplating the navel, and nearly drowned.' },
  { who: 'N', pre: 0.7, say: 'Larger units grew a sense of beauty. Columns chased butterflies. One corps made its attack plan a painting. The artillery forgot its guns, and the war.' },
  { who: 'N', pre: 0.7, say: 'Whole armies grew complexes, so each got a motorcycle brigade of psychiatrists. Six regiments of shock troops wrote a sonnet on the mystery of being.' },
  { who: 'N', pre: 0.7, say: 'The kings sent couriers to restore order, but each joined the line and was lost in it. A prince jumped in to raise morale, and was gone the moment he connected.' },
  { who: 'N', pre: 1.0, say: 'Consciousness was a trap. You could enter it, but you could not leave.', line: true },
];
/* ---- 7. the field: explicit times, the picture follows a fixed timeline ---- */
const L7 = [
  { who: 'N', at: 0.4, say: 'Each king signaled his twelve buglers, and both sides sounded the charge.' },
  { who: 'N', at: 5.4, say: 'At the signal, each army linked up completely, and the contacts closed with a great clatter.' },
  { who: 'N', at: 16.6, say: 'The two giants smiled at each other. Inside the armor there was only good will, and clear thought.', line: true },
  { who: 'N', at: 24.6, say: 'The kings watched, ashamed and furious, as both armies walked off hand in hand, picking flowers on a battlefield where no battle was ever fought.' },
  { who: 'N', at: 33.8, say: 'Trurl and Klapaucius boarded their ship. Everything had gone as they planned.' },
];
const SCRIPT = [
  { shot: 'landing', room: 'ship', tail: 1.6, lines: L1,
    cues: [{ k: 'ship', at: 0.2, to: WT(L1, 0, 'Everything on one side') },
      { k: 'cabin', at: 'L0.t1+0.4' },
      { k: 'radio', at: 'L4.t1+0.3', to: 'L4.t1+2.6' },
      { k: 'box', at: 'L6.t0+0.3' },
      { k: 'link', at: 'L6.t1+0.3' },
      { k: 'pink', at: WT(L1, 7, 'turns pink', 0.4) },
      { k: 'ground', at: 'L8.t1+0.3' },
      { k: 'shake', at: 'L9.t0+2.2' }, { k: 'part', at: 'L9.t0+3.3', to: 'end' }] },
  { shot: 'title', d: 5.5 },
  { shot: 'atrocia', room: 'court', tail: 1.2, lines: L2,
    cues: [{ k: 'axe', at: WT(L2, 0, 'A condemned', 0.3) },
      { k: 'graph', at: 'L1.t0-0.1' },
      { k: 'coin', at: WT(L2, 1, 'sold secrets'), to: 'L1.t1' },
      { k: 'trurl', at: 'L2.t0-0.2' },
      { k: 'cell', at: WT(L2, 2, 'Alone in his room', -0.3) },
      { k: 'pink', at: WT(L2, 2, 'it turned pink', 0.2) },
      { k: 'link', at: 'L3.t0+0.1' }] },
  { shot: 'ferocia', room: 'hall', tail: 1.4, lines: L3,
    cues: [{ k: 'parade', at: 0 },
      { k: 'crowd', at: 'L1.t0-0.2' },
      { k: 'cheer', at: 'L2.t0', to: 'L2.t1' },
      { k: 'street', at: 'L3.t0-0.2' },
      { k: 'house', at: 'L7.t0-0.4' },
      { k: 'reveal', at: WT(L3, 7, 'The needles', 0.2) },
      { k: 'jail', at: 'L9.t0-0.2' },
      { k: 'block', at: WT(L3, 9, 'sentenced') },
      { k: 'acquit', at: 'L10.t0-0.2' },
      { k: 'bugle', at: WT(L3, 10, 'gave him a bugle') }] },
  { shot: 'audience', room: 'hall', tail: 1.2, lines: L4,
    cues: [{ k: 'throne', at: 0 },
      { k: 'tree', at: 'L1.t0-0.1', to: 'L3.t1' },
      { k: 'mesh', at: 'L4.t0-0.1', to: 'L4.t1' },
      { k: 'plug', at: 'L5.t0-0.1', to: 'L5.t1+0.4' },
      { k: 'ladder', at: 'L6.t0-0.1', to: 'L6.t1+0.4' },
      { k: 'rung', at: WT(L4, 6, 'A platoon'), n: 14 }, { k: 'rung', at: WT(L4, 6, 'a company'), n: 40 },
      { k: 'rung', at: WT(L4, 6, 'a brigade'), n: 120 }, { k: 'rung', at: WT(L4, 6, 'A division'), n: 400 },
      { k: 'self', at: 'L7.t0-0.2', to: 'L7.t1+0.5' },
      { k: 'return', at: 'L8.t0-0.2' }]
      .concat(Array.from({ length: 24 }, (_, i) => ({ k: 'link', at: `L4@${(0.04 + i * 0.86 / 24).toFixed(3)}`, n: i + 1, g: 'mesh' })))
      .concat(Array.from({ length: 4 }, (_, i) => ({ k: 'link', at: WT(L4, 5, 'On the order', 0.5 + i * 0.5), n: i + 2, g: 'plug' }))) },
  { shot: 'platoon', room: 'field', tail: 1.4, lines: L5,
    cues: [{ k: 'bead', at: 0, to: 'L0.t1-1.2' },
      { k: 'drill', at: 'L0.t1-1.2' },
      { k: 'charge', at: 'L2.t0-0.2' },
      { k: 'clash', at: 'L2.t1+1.2' },
      { k: 'wire', at: 'L4.t0-0.3' },
      { k: 'cart', at: WT(L5, 4, 'rewired') },
      { k: 'ship', at: 'L6.t0' }]
      .concat(Array.from({ length: 13 }, (_, i) => ({ k: 'link', at: `L1.t1+${(0.5 + i * 0.22).toFixed(2)}`, n: i + 2 })))
      .concat(Array.from({ length: 8 }, (_, i) => ({ k: 'row', at: `L4.t0+${(1.0 + i * 0.7).toFixed(2)}`, n: 12 * (i + 1) }))) },
  { shot: 'minds', room: 'field', tail: 1.6, lines: L6,
    cues: [{ k: 'barracks', at: 0 },
      { k: 'sap', at: 'L3.t0-0.3' },
      { k: 'cut', at: WT(L6, 3, 'it was disconnected') },
      { k: 'navel', at: 'L4.t0-0.3' },
      { k: 'taste', at: 'L5.t0-0.3' },
      { k: 'paint', at: WT(L6, 5, 'One corps') },
      { k: 'guns', at: WT(L6, 5, 'The artillery') },
      { k: 'moto', at: 'L6.t0-0.3' },
      { k: 'sonnet', at: WT(L6, 6, 'Six regiments') },
      { k: 'couriers', at: 'L7.t0-0.3' },
      { k: 'join', at: WT(L6, 7, 'each joined'), n: 1 },
      { k: 'prince', at: WT(L6, 7, 'A prince') },
      { k: 'join', at: WT(L6, 7, 'the moment he connected'), n: 2 },
      { k: 'trap', at: 'L8.t0-0.4' }] },
  { shot: 'field', room: 'open', d: 44.5,
    lines: L7,
    cues: [{ k: 'A0', at: 2.0 },
      { k: 'bugle', at: 3.55, to: 5.0 },
      { k: 'hush', at: 10.0, to: 16.5 },
      { k: 'sky', at: 32.8 }, { k: 'ship', at: 33.0 }, { k: 'lift', at: 37.4 }, { k: 'orbit', at: 39.8 }] },
  { shot: 'end', d: 7 },
];
if (typeof module !== 'undefined') module.exports = { SCRIPT, CAST };
