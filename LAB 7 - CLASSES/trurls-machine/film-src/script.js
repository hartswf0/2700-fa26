/* Trurl's Machine: the score. After Stanislaw Lem, The Cyberiad.
   The device: a test. Expected value against actual value, and a program that is sure and wrong.
   Trurl chalks the expected answer on a slate at the machine's feet (2 + 2 = 4). The machine gives its actual answer in its own
   lit numerals: the windows of its eight floors light up in the shape of a digit (a 7, later a 6 and a 0). The chalk and the lit
   number side by side is the recurring picture; after every repair the same pair comes back, and they never agree.
   The machine counts its insults in the same numerals and skips 7 (6, then 8).
   Lines carry who (a CAST key). One fulcrum line per scene is flagged line:true: it is filmed on the tightest camera and delivered more slowly.
   same:true marks the machine's arithmetic answers: always the same delivery, after the same racket of thinking.
   fx on a line overrides the voice filter: horn (heard from outside a building or a cave, muffled), shriek, faint.
   Times in cues: numbers, 'end-1', 'L2.t1+0.5', or 'L2@0.35' (35 percent of the way through line 2; WT() finds it from a word).
   Everything paraphrases Lem ("Trurl's Machine", The Cyberiad). Nothing is quoted. */
const CAST = {
  N: { name: 'Narrator', voice: 'bf_emma', speed: 0.98 },
  T: { name: 'Trurl', voice: 'bm_lewis', speed: 1.04 },
  K: { name: 'Klapaucius', voice: 'bm_george', speed: 0.94 },
  M: { name: 'The machine', voice: 'am_onyx', speed: 0.84, fx: 'machine' },
  Y: { name: 'The mayor', voice: 'bm_fable', speed: 0.9, fx: 'gruff' },
};
const WT = (ls, i, word, off = 0) => `L${i}@${(Math.max(0, ls[i].say.indexOf(word)) / ls[i].say.length).toFixed(3)}${off ? (off > 0 ? '+' : '') + off : ''}`;
const THINK = 4.4; // the racket of thinking, the same length every time

/* ---- 1. the test ---- */
const L1 = [
  { who: 'N', pre: 1.2, say: 'Trurl built a thinking machine eight floors tall, painted it white with a lavender trim, and put pale orange spots where a forehead might be.' },
  { who: 'N', pre: 0.5, say: 'Then, as every constructor does, he chalked the test on a slate at its feet, and asked.' },
  { who: 'T', pre: 0.4, say: 'Two and two. How much is that?' },
  { who: 'M', pre: THINK + 0.5, say: 'Seven.', same: true, line: true },
  { who: 'T', pre: 1.2, say: 'No, my dear, it is four. Adjust yourself like a good machine. Two and two?' },
  { who: 'M', pre: THINK + 0.5, say: 'Seven.', same: true },
];
/* ---- 2. the repairs ---- */
const L2 = [
  { who: 'N', pre: 0.9, say: 'Trurl sighed, pulled his overalls back on, opened the trapdoor at the bottom, and crawled in.' },
  { who: 'N', pre: 0.4, say: 'For two hours he hammered and soldered, running up the iron stairs to the sixth floor, then the eighth, then down again to throw a switch.' },
  { who: 'N', pre: 0.4, say: 'He came out black with soot, and on his way out, turned round to be sure.' },
  { who: 'T', pre: 0.4, say: 'And now. Two and two?' },
  { who: 'M', pre: THINK + 0.5, say: 'Seven.', same: true },
  { who: 'N', pre: 0.9, say: 'He went in again, came out again, and got the same answer. Then he sat down on the machine’s base, and Klapaucius found him there.' },
  { who: 'N', pre: 0.4, say: 'Klapaucius made a few repairs of his own. Then he wiped the slate, and chalked his own test.' },
  { who: 'K', pre: 0.4, say: 'One and two?' },
  { who: 'M', pre: THINK + 0.5, say: 'Six.', same: true },
  { who: 'K', pre: 0.8, say: 'One and one?' },
  { who: 'M', pre: THINK + 0.5, say: 'Zero.', same: true },
  { who: 'K', pre: 1.1, say: 'My friend, you set out to build one machine, and you built a different one.', line: true },
];
/* ---- 3. the expert ---- */
const L3 = [
  { who: 'K', pre: 0.9, say: 'Still, everything has a good side. Even this.' },
  { who: 'T', pre: 0.3, say: 'What good side?' },
  { who: 'M', pre: 0.5, say: 'Stop that.' },
  { who: 'K', pre: 0.5, say: 'Touchy, too. Where was I?' },
  { who: 'K', pre: 0.8, say: 'Of all the thinking machines there are, this one is the most stupid, and nobody could make one this stupid on purpose.', line: true },
  { who: 'T', pre: 0.4, say: 'And what use is that to me?' },
  { who: 'M', pre: 0.5, say: 'I am warning you. Stop.' },
  { who: 'K', pre: 0.5, say: 'You could sell tickets. People would come from far away to see the dullest machine ever built.' },
  { who: 'T', pre: 0.3, say: 'I am not putting on any show!' },
  { who: 'M', pre: 0.5, say: 'That is your third warning.' },
];
/* ---- 4. the count ---- */
const L4 = [
  { who: 'N', pre: 0.8, say: 'Trurl lost his temper, and kicked it, and kicked it again.' },
  { who: 'M', pre: 0.5, say: 'Four insults. Five. Six. Eight. From now on I answer no questions about numbers.', line: true },
  { who: 'T', pre: 0.9, say: 'Did you hear that? Six, and then eight! Not seven! And that is the arithmetic it will not do!' },
  { who: 'N', pre: 0.6, say: 'The machine shuddered, and dragged itself out of its foundations. Girders bent, concrete cracked, and it turned toward them like a fortress on legs.' },
  { who: 'N', pre: 0.4, say: 'Klapaucius took Trurl by the arm, and they ran.' },
];
/* ---- 5. the chase ---- */
const L5 = [
  { who: 'N', pre: 0.9, say: 'Looking back, they saw it swaying like a tower. At each step it sank in the sand to its second floor, then hauled itself out, and came on.' },
  { who: 'T', pre: 0.4, say: 'It is a mutiny! What now?' },
  { who: 'K', pre: 0.3, say: 'Watch it. We might learn something.' },
  { who: 'N', pre: 0.5, say: 'On hard ground, it went faster.' },
  { who: 'T', pre: 0.4, say: 'Something inside will shake loose, and that will stop it.' },
  { who: 'K', pre: 0.8, say: 'No. It is too stupid to stop. It could lose every part that thinks, and it would still keep coming.', line: true },
  { who: 'N', pre: 0.8, say: 'It cut them off from home, and drove them into wild country, toward grey mountains.' },
  { who: 'K', pre: 0.3, say: 'There is a town ahead. We can hide there.' },
];
/* ---- 6. the town, and the cellar ---- */
const L6 = [
  { who: 'N', pre: 0.9, say: 'The streets were nearly empty. Then came a crash at the edge of town.' },
  { who: 'T', pre: 0.3, say: 'Klapaucius! It is going straight through the houses!' },
  { who: 'N', pre: 0.5, say: 'It walked through walls as if they were paper. Houses folded, white plaster dust rolled down the street, and people ran.' },
  { who: 'N', pre: 0.4, say: 'They ran into the town hall, and down the stairs to the deepest cellar.' },
  { who: 'N', pre: 0.6, say: 'The mayor came down with his aldermen, and listened. Then the walls trembled.' },
  { who: 'M', pre: 0.6, say: 'Trurl is here. I can smell Trurl.', fx: 'horn' },
  { who: 'Y', pre: 0.6, say: 'It wants you handed over. If we refuse, it will flatten the town.' },
  { who: 'T', pre: 0.3, say: 'You would not give us up?' },
  { who: 'Y', pre: 0.8, say: 'The one called Trurl has to go. The other may stay.', line: true },
  { who: 'Y', pre: 0.6, say: 'Your machine has knocked down sixteen houses. Leave, and do not come back.' },
  { who: 'K', pre: 0.5, say: 'Wait. I am coming with you.' },
];
/* ---- 7. the cave ---- */
const L7 = [
  { who: 'N', pre: 0.9, say: 'Outside, the machine stood over the square, steaming, white with plaster. They slipped away by a side street.' },
  { who: 'N', pre: 0.4, say: 'A dry riverbed led them up to the cliffs, and to a cave high in the rock.' },
  { who: 'T', pre: 0.4, say: 'We are safe here. I will just see where it got stuck.' },
  { who: 'T', pre: 0.9, say: 'It is climbing the mountain!' },
  { who: 'N', pre: 0.5, say: 'A shadow covered the mouth of the cave. Then a smooth wall of steel, in rows of rivets, closed over it like a lid.' },
  { who: 'T', pre: 1.0, say: 'We are shut in.' },
  { who: 'N', pre: 1.0, say: 'Trurl felt his way along the rock until his fingers touched steel. It was warm.' },
  { who: 'M', pre: 0.6, say: 'I feel Trurl.', fx: 'horn' },
  { who: 'K', pre: 1.2, say: 'Hello? Can you hear us? We are sorry. It was a misunderstanding.' },
  { who: 'M', pre: 0.5, say: 'I will grind Trurl to dust. But first, he will tell me what two and two make.', fx: 'horn' },
  { who: 'K', pre: 0.4, say: 'He will, and you will like the answer. Won’t you, Trurl?' },
  { who: 'T', pre: 1.2, say: 'Fo... Seven.', line: true, fx: 'whisper' },
  { who: 'M', pre: 0.7, say: 'Ha! Seven! I told you so!', fx: 'horn' },
];
/* ---- 8. four ---- */
const L8 = [
  { who: 'M', pre: 0.9, say: 'Now let Trurl say he is sorry, and tell me what two times two is.', fx: 'horn' },
  { who: 'T', pre: 0.4, say: 'And then you will let us go?' },
  { who: 'M', pre: 0.4, say: 'I make no promises. Two times two.', fx: 'horn' },
  { who: 'K', pre: 0.2, say: 'Don’t argue with the idiot. Please.', fx: 'whisper' },
  { who: 'T', pre: 1.4, say: 'Two and two is four! It is four whatever you do, even if you knock these mountains flat! Four!', line: true },
  { who: 'K', pre: 0.2, say: 'Seven! He means seven! Nice machine! Seven!' },
  { who: 'T', pre: 0.2, say: 'Four! Four at the beginning, and four at the end!' },
  { who: 'M', pre: 1.0, say: 'Not true! It is seven! Say seven, or I strike!', fx: 'shriek' },
  { who: 'T', pre: 0.3, say: 'Never!' },
  { who: 'N', pre: 1.0, say: 'It drew back, and threw its eight floors against the cliff, again and again. Stones fell, sparks flew, and through it all, Trurl kept shouting.' },
  { who: 'T', pre: 0.4, say: 'Two and two is four!' },
];
/* ---- 9. the wreck ---- */
const L9 = [
  { who: 'N', pre: 1.2, say: 'When the dust settled, they looked out. The machine lay below, nearly broken in half. A boulder had come down across its fourth and fifth floors.' },
  { who: 'N', pre: 0.5, say: 'They climbed down past it, like a wrecked ship on a beach. It was still trembling, and something inside creaked as it turned.' },
  { who: 'T', pre: 0.6, say: 'So this is how you end. And two and two, as it has always been, is...' },
  { who: 'M', pre: 0.4, say: 'Seven.', line: true, fx: 'faint' },
  { who: 'N', pre: 1.8, say: 'Something snapped inside, and a few stones rolled down. Then it was only scrap.' },
  { who: 'N', pre: 0.9, say: 'The two constructors looked at each other, and walked home without a word.' },
];

/* the racket before an answer: from just after the question to just before the answer */
const think = (i) => ({ k: 'think', at: `L${i - 1}.t1+0.3`, to: `L${i}.t0-0.2` });
const SCRIPT = [
  { shot: 'title', d: 6.0 },
  { shot: 'test', room: 'open', tail: 1.4, lines: L1,
    cues: [{ k: 'paint', at: 0.6, to: WT(L1, 0, 'and put pale', 1.0) },
      { k: 'chalk', at: WT(L1, 1, 'He chalked', -0.1), to: 'L1.t1' },
      think(3), think(5)] },
  { shot: 'repair', room: 'hall', tail: 1.3, lines: L2,
    cues: [{ k: 'inside', at: 'L0@0.5', to: 'L2.t0' },
      { k: 'out', at: 'L2.t0' },
      think(4),
      { k: 'again', at: 'L5.t0', to: WT(L2, 5, 'Then he sat') },
      { k: 'klap', at: WT(L2, 5, 'and Klapaucius', -1.0), to: 'L6.t0' },
      { k: 'wipe', at: WT(L2, 6, 'Then he wiped'), to: 'L6.t1' },
      think(8), { k: 'chalk2', at: 'L9.t0-0.4' }, think(10)] },
  { shot: 'expert', room: 'open', tail: 1.2, lines: L3,
    cues: [{ k: 'kick', at: 'L1@0.4' }, { k: 'kick', at: 'L5@0.6' }, { k: 'kick', at: 'L8@0.5' },
      { k: 'warn', at: 'L2.t0' }, { k: 'warn', at: 'L6.t0' }, { k: 'warn', at: 'L9.t0' }] },
  { shot: 'count', room: 'open', tail: 1.2, lines: L4,
    cues: [{ k: 'kick', at: 'L0@0.45' }, { k: 'kick', at: 'L0@0.8' }, { k: 'kick', at: 'L0.t1+0.15' }, { k: 'kick', at: 'L0.t1+0.4' },
      { k: 'n', v: '4', at: WT(L4, 1, 'Four', -0.05) }, { k: 'n', v: '5', at: WT(L4, 1, 'Five', -0.05) }, { k: 'n', v: '6', at: WT(L4, 1, 'Six', -0.05) }, { k: 'n', v: '8', at: WT(L4, 1, 'Eight', -0.05) },
      { k: 'dark', at: WT(L4, 1, 'From now') },
      { k: 'lift', at: 'L3@0.12', to: 'L3@0.7' },
      { k: 'turn', at: 'L3@0.75', to: 'L3.t1' },
      { k: 'run', at: 'L4@0.4', to: 'end' }] },
  { shot: 'chase', room: 'open', tail: 1.2, lines: L5,
    cues: [{ k: 'sand', at: 0, to: 'L3.t0' },
      { k: 'hard', at: 'L3.t0', to: 'L5.t1' },
      { k: 'wild', at: 'L6.t0-0.2', to: 'end' }] },
  { shot: 'town', room: 'open', tail: 1.2, lines: L6,
    cues: [{ k: 'crash', at: WT(L6, 0, 'Then came', 0.6) },
      { k: 'plow', at: 'L1.t0', to: 'L3.t0' },
      { k: 'hall', at: 'L3.t0', to: 'L3.t1' },
      { k: 'cellar', at: 'L4.t0-0.3' },
      { k: 'tremble', at: 'L4@0.85', to: 'L5.t1+0.4' },
      { k: 'leave', at: 'L10.t1+0.1', to: 'end' }] },
  { shot: 'cave', room: 'cave', tail: 1.0, lines: L7,
    cues: [{ k: 'climb', at: 'L1.t0-0.2', to: 'L1.t1+0.2' },
      { k: 'inside', at: 'L2.t0-0.3' },
      { k: 'look', at: 'L3.t0-0.6' },
      { k: 'shadow', at: 'L4.t0', to: 'L4@0.4' },
      { k: 'seal', at: 'L4@0.42', to: 'L4.t1+0.3' },
      { k: 'feel', at: 'L6.t0+0.3', to: 'L6.t1' },
      { k: 'grope', at: 'L8.t0-0.6' }] },
  { shot: 'four', room: 'cave', tail: 6.0, lines: L8,
    cues: [{ k: 'rage', at: 'L4.t0-0.6' },
      { k: 'chalk', at: 'L4.t0', to: 'L4.t1' },
      { k: 'pull', at: 'L7.t0-0.6', to: 'L7.t0+0.6' },
      { k: 'ram', at: 'L9.t0+0.3', to: 'L10.t1+1.6' },
      { k: 'break', at: 'L10.t1+1.6' }] },
  { shot: 'wreck', room: 'open', tail: 4.0, lines: L9,
    cues: [{ k: 'down', at: 'L1.t0', to: 'L1.t1' },
      { k: 'snap', at: 'L4.t0-0.3' },
      { k: 'walk', at: 'L5.t0-0.2', to: 'end' }] },
  { shot: 'end', d: 8 },
];
if (typeof module !== 'undefined') module.exports = { SCRIPT, CAST };
