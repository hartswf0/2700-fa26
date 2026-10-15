/* The Fifth Sally, or The Mischief of King Balerion: the score. After Stanislaw Lem, The Cyberiad.
   The device: the voice stays with the mind, the picture stays with the body.
   Every body is an ink figure with its own costume. Every mind has a mark over the head (a drawn emblem and a hatched halo) and its own Kokoro voice.
   At each horn-butt the two marks swap bodies and the two voices swap bodies. The picture keeps showing the same body; the voice you hear from it changes.
   Lines carry who (the mind speaking, a CAST key) and body (the body whose mouth moves: K king, T Trurl's body, L Klapaucius's body, S the sailor's body, C the commissioner's body, CL the clock).
   cues swap {a, b, by}: the two bodies, and the one wearing the horns. cues horns {w, mode}: where the horns are (worn, held, at x y).
   One fulcrum line per scene is flagged line:true. It is filmed on the tightest camera and delivered more slowly.
   Times in cues: numbers, 'end-1', 'L2.t1+0.5', or 'L2@0.35' (35 percent of the way through line 2; WT() finds it from a word).
   Everything paraphrases Lem ("The Fifth Sally, or The Mischief of King Balerion", The Cyberiad). Nothing is quoted. */
const CAST = {
  N: { name: 'Narrator', voice: 'bf_emma', speed: 0.97 },
  B: { name: 'Balerion', voice: 'am_puck', speed: 1.12, fx: 'squeak' },
  T: { name: 'Trurl', voice: 'bm_lewis', speed: 1.04 },
  K: { name: 'Klapaucius', voice: 'bm_george', speed: 0.94 },
  S: { name: 'The sailor', voice: 'am_michael', speed: 0.98 },
  C: { name: 'The commissioner', voice: 'am_onyx', speed: 0.9, fx: 'gruff' },
  X: { name: 'The clock’s mind', voice: 'bm_daniel', speed: 1.2, fx: 'flat' },
  P: { name: 'The court', voice: 'bf_lily', speed: 0.98, many: ['bf_lily', 'am_echo', 'af_river', 'bm_fable', 'af_nova', 'am_eric'] },
};
const WT = (ls, i, word, off = 0) => `L${i}@${(Math.max(0, ls[i].say.indexOf(word)) / ls[i].say.length).toFixed(3)}${off ? (off > 0 ? '+' : '') + off : ''}`;

/* ---- 1. the court ---- */
const L1 = [
  { who: 'N', pre: 1.2, say: 'King Balerion ruled Cymberia, and he was not cruel. He just liked to play. Cards, hopscotch, leapfrog, and above all, hide-and-seek.' },
  { who: 'N', pre: 0.4, say: 'Whenever a treaty needed signing, the king hid, and the court had to find him, or be punished.' },
  { who: 'P', pre: 0.3, say: 'One. Two. Three. Four. Five. Ready or not!', many: { conv: false } },
  { who: 'N', pre: 0.5, say: 'Once, a war went undeclared for three days, because the king was hanging in the hall in glass drops, pretending to be a lamp.' },
  { who: 'B', body: 'K', pre: 0.6, say: 'Nothing here is serious. The crown is a counter, and the world is the board.', line: true },
  { who: 'N', pre: 0.9, say: 'Then he took up riddles, and gave out jobs by the answers.' },
  { who: 'B', body: 'K', pre: 0.4, say: 'Why is a comet like a long speech?' },
  { who: 'P', pre: -0.8, say: 'Because all anyone remembers is the tail!', many: { conv: false } },
  { who: 'N', pre: 0.4, say: 'Soon the whole court answered before he had finished asking, and carried encyclopedias everywhere.' },
];
/* ---- 2. the prize, and two visitors ---- */
const L2 = [
  { who: 'N', pre: 0.9, say: 'He offered a prize for the finest hiding spot anywhere: the old family diadem, locked in the vault so long that the court had forgotten it.' },
  { who: 'N', pre: 0.4, say: 'Trurl and Klapaucius heard of it at an inn. The mob at the gate was too thick, so the next day they came back with coins.' },
  { who: 'T', body: 'T', pre: 0.4, say: 'A few more coins, I think.' },
  { who: 'K', body: 'L', pre: 0.4, say: 'We should write a contract first. With seals, and tassels.' },
  { who: 'N', pre: 0.4, say: 'But the king would not wait. Trurl opened a box and took out a pair of horns on a headband.' },
  { who: 'T', body: 'T', pre: 0.4, say: 'Wear these, touch foreheads with someone, and you trade minds. One horn sends yours across, and the other brings theirs in.' },
];
/* ---- 3. the first swap ---- */
const L3 = [
  { who: 'N', pre: 0.7, say: 'Trurl put the horns on his own head, to show how they worked.' },
  { who: 'T', body: 'T', pre: 0.4, say: 'The current runs both ways at once, so that each mind is emptied at the very moment that' },
  { who: 'B', body: 'K', pre: -0.75, say: 'Let me try!' },
  { who: 'T', body: 'K', after: 1, pre: 0.1, say: 'the other is poured in. Nothing is lost, and nothing is counted twice.' },
  { who: 'B', body: 'T', pre: -1.0, say: 'Oh! I have your fingers. Ten of them, and every one wiggles!' },
  { who: 'N', pre: 0.5, say: 'Klapaucius listened for nearly a minute before he understood. The voice was Trurl’s, and the mouth was the king’s.' },
  { who: 'B', body: 'T', pre: 0.4, say: 'Catch me if you can!' },
  { who: 'N', pre: 0.5, say: 'The king ran away wearing Trurl’s body, and Trurl, tangled in a long robe, fell on his face, holding a scepter he had never seen. The guards seized Klapaucius, and threw him out.' },
];
/* ---- 4. locked up ---- */
const L4 = [
  { who: 'T', body: 'K', pre: 1.0, say: 'Listen to me! The minds have been swapped! The king is running about in my body, and he has the horns!' },
  { who: 'N', pre: 0.5, say: 'Nobody listened. The court decided that too many riddles had unhinged the king, and locked him in his bedchamber to wait for the doctors.' },
  { who: 'T', body: 'K', pre: 1.0, say: 'Look at the robe if you like, but listen to the voice.', line: true },
];
/* ---- 5. the street ---- */
const L5 = [
  { who: 'K', body: 'L', pre: 1.4, say: 'If he strikes a stone with those horns, his mind goes into the stone, and stays there. And the body falls down empty.' },
];
/* ---- 6. the harbor steps ---- */
const L6 = [
  { who: 'N', pre: 0.7, say: 'Trurl’s body, with the king inside, ran from the palace, tripped on the harbor steps, and hurt its leg.' },
  { who: 'B', body: 'T', pre: 0.4, say: 'A stretcher! Feather pillows! Fetch the royal doctors!' },
  { who: 'N', pre: 0.5, say: 'The people laughed. One passing sailor felt sorry for him, and bent down to help.' },
  { who: 'S', body: 'S', pre: 0.4, say: 'Easy now, friend. Let me get you up.' },
  { who: 'S', body: 'T', pre: 0.55, say: 'Oh. My leg. Where am I?' },
  { who: 'B', body: 'S', pre: -0.9, say: 'Ha ha! A sailor! And what good legs!' },
  { who: 'N', pre: 0.5, say: 'He grabbed the horns off the head on the ground, and danced away toward the harbor.' },
];
/* ---- 7. the quay ---- */
const L7 = [
  { who: 'N', pre: 0.7, say: 'On the quay, a shipowner knew the man as one of his sailors, and went to scold him.' },
  { who: 'B', body: 'S', pre: 0.4, say: 'Name anyone you like, and I will be them by supper.', line: true },
  { who: 'N', pre: 0.8, say: 'He hit the shipowner with a stick. Then the police arrived, and the Commissioner himself ordered him arrested.' },
  { who: 'C', body: 'C', pre: 0.4, say: 'Take him away.' },
  { who: 'C', body: 'S', pre: 0.45, say: 'I am the Commissioner! I am in charge of this harbor!' },
  { who: 'B', body: 'C', pre: -0.3, say: 'Quite right! Take this troublemaker to jail, and do not be gentle.' },
];
/* ---- 8. the police station ---- */
const L8 = [
  { who: 'N', pre: 0.7, say: 'Klapaucius followed the trail to the police station. Inside stood a giant in a uniform too small for him, and the giant winked.' },
  { who: 'B', body: 'C', pre: 0.4, say: 'I knew you the moment I saw you! I saw you at the palace. Is this not the cleverest hiding place of all?' },
  { who: 'K', body: 'L', pre: 0.4, say: 'Your Majesty, please. Suppose you land in someone who is very ill, or hunted by the law.' },
  { who: 'B', body: 'C', pre: 0.5, say: 'One rule keeps me safe. I pull the horns off the old head, and I never let go.', line: true },
  { who: 'N', pre: 0.8, say: 'Klapaucius threw an inkwell in the king’s face, jumped out of the window, and ran into the crowd.' },
];
/* ---- 9. the trick ---- */
const L9 = [
  { who: 'N', pre: 0.7, say: 'The palace was shut, and Trurl was sedated for a whole day. So Klapaucius had himself arrested, and asked to see the Commissioner.' },
  { who: 'K', body: 'L', pre: 0.4, say: 'Great Police Sir, help! Folk call me Klapaucius, but me am another! Horned man go bang, and now me in wrong head!' },
  { who: 'N', pre: 0.5, say: 'Then he told a long tale: a rich foreigner, a ship full of puzzles, and a password for the ship’s mate.' },
  { who: 'K', body: 'L', pre: 0.4, say: 'The password is marigold.' },
  { who: 'N', pre: 0.5, say: 'The king loved puzzles. He asked where the ship was, then locked Klapaucius in, and went to look.' },
  { who: 'K', body: 'L', pre: 1.1, say: 'There is no ship. An empty dock is the trap.', line: true },
  { who: 'B', body: 'C', pre: 0.6, say: 'Liar! Where is the ship? Where are the puzzles?' },
  { who: 'K', body: 'C', after: 6, pre: 0.55, say: 'Guards! Lock him up, and watch him closely.' },
  { who: 'B', body: 'L', pre: 0.1, say: 'Swindler! Cheat! Wait until I get my hands on you!' },
];
/* ---- 10. the palace again: tickled awake, everyone restored but the king ---- */
const L10 = [
  { who: 'N', pre: 0.7, say: 'Klapaucius, in the Commissioner’s body, got into the palace on urgent business, and found Trurl asleep in the king’s bed. He touched the sleeper’s heel.' },
  { who: 'T', body: 'K', pre: 0.15, say: 'Hah! Ha ha! Stop!' },
  { who: 'K', body: 'C', pre: 0.4, say: 'Quiet. It is Klapaucius. I needed the uniform to get in, and I have the horns.' },
  { who: 'N', pre: 0.7, say: 'Trurl got up and gave orders. Trurl’s body and the sailor’s were fetched from the hospital, and the prisoner was brought in.' },
  { who: 'T', body: 'K', pre: 0.7, say: 'Everyone goes home, except the king.', line: true },
  { who: 'N', pre: 0.7, say: 'The horns went round twice. The Commissioner came home to his uniform, and Klapaucius to his robe. The king, now in a sailor, got a long lecture and a cell.' },
  { who: 'N', pre: 0.5, say: 'Next morning they told the honest sailor everything. He seemed sensible, so they gave him the crown, and Trurl took his own body back.' },
  { who: 'S', body: 'K', pre: 0.5, say: 'I will do what I can.' },
];
/* ---- 11. the clock ---- */
const L11 = [
  { who: 'N', pre: 0.7, say: 'Then Klapaucius had a big cuckoo clock carried in. The king’s mind went into its works, and the clock’s mind went into the sailor’s body.' },
  { who: 'B', body: 'CL', pre: 0.5, say: 'What have you done? Let me out!' },
  { who: 'X', body: 'S', pre: 0.9, say: 'Yes, sir. At once, sir.' },
  { who: 'N', pre: 0.5, say: 'The sailor’s body went back to the docks and hauled rope perfectly well, which says something about the work.' },
  { who: 'B', body: 'CL', pre: 1.0, say: 'Every hour I announce the hour, and every hour I must announce it again.', line: true },
  { who: 'N', pre: 0.6, say: 'That was the king’s work from then on, day and night, driven by the little teeth of the gears.' },
];
/* ---- 12. the best hiding place ---- */
const L12 = [
  { who: 'N', pre: 0.7, say: 'The friends said goodbye to the crowned sailor, and left that troublesome kingdom.' },
  { who: 'K', body: 'L', pre: 0.4, say: 'Trurl. The diadem. Where did you find it?' },
  { who: 'T', body: 'T', pre: 0.4, say: 'In the vault. Kings can open the vault, and I was one.' },
  { who: 'T', body: 'T', pre: 0.9, say: 'The finest place to hide a thing was the king himself, and no one ever looks inside a king.', line: true },
  { who: 'N', pre: 0.8, say: 'Far behind them, in the great hall, a clock struck the hour.' },
];

const SCRIPT = [
  { shot: 'title', d: 6.0 },
  { shot: 'court', room: 'hall', tail: 1.0, lines: L1,
    cues: [{ k: 'hop', at: 0.8, to: 'L0.t1+0.2' },
      { k: 'hide', at: 'L1@0.62', to: 'L1.t1' },
      { k: 'count', at: 'L2.t0-0.1', to: 'L2.t1-0.9' },
      { k: 'scatter', at: 'L2.t1-0.8', to: 'L3@0.5' },
      { k: 'lamp', at: WT(L1, 3, 'because the king', -0.4), to: 'L4.t1+0.5' },
      { k: 'drop', at: 'L4.t1+0.5' },
      { k: 'throne', at: 'L5.t0-0.2' },
      { k: 'ask', at: 'L6.t0' }, { k: 'answer', at: 'L7.t0' },
      { k: 'books', at: 'L8.t0' }] },
  { shot: 'prize', room: 'hall', tail: 1.2, lines: L2,
    cues: [{ k: 'vault', at: WT(L2, 0, 'the old family', -0.3), to: 'L0.t1+0.3' },
      { k: 'gate', at: 'L1.t0', to: 'L2.t0-0.2' },
      { k: 'coins', at: 'L2.t0+0.3', to: 'L2.t1' },
      { k: 'contract', at: 'L3.t0' },
      { k: 'hall', at: 'L4.t0-0.15' },
      { k: 'box', at: 'L4@0.55' },
      { k: 'horns', at: 'L4@0.8', w: 'T', mode: 'held' },
      { k: 'explain', at: 'L5.t0', to: 'L5.t1' }] },
  { shot: 'swap', room: 'hall', tail: 1.6, lines: L3,
    cues: [{ k: 'horns', at: 'L0@0.55', w: 'T', mode: 'worn' },
      { k: 'swap', a: 'K', b: 'T', by: 'K', at: 'L3.t0-0.02', dur: 1.0 },
      { k: 'wiggle', at: 'L4.t0', to: 'L5.t0+1.0' },
      { k: 'run', at: 'L6.t0+0.2', to: 'L7.t0+2.0' },
      { k: 'fall', at: 'L7@0.12' },
      { k: 'seize', at: 'L7@0.55', to: 'L7@0.85' },
      { k: 'throw', at: 'L7@0.85' }] },
  { shot: 'locked', room: 'office', tail: 1.4, lines: L4,
    cues: [{ k: 'shut', at: 0.7 }, { k: 'pound', at: 'L0.t0+0.2', to: 'L2.t0-0.3' }, { k: 'bolt', at: 0.9 }] },
  { shot: 'street', room: 'open', tail: 1.6, lines: L5,
    cues: [{ k: 'bubble', at: 'L0.t0+0.3', to: 'end' }, { k: 'mind_in', at: WT(L5, 0, 'his mind goes'), to: WT(L5, 0, 'And the body') }, { k: 'fall', at: WT(L5, 0, 'And the body') }] },
  { shot: 'steps', room: 'open', tail: 1.4, lines: L6,
    cues: [{ k: 'run', at: 0.4, to: 'L0@0.8' }, { k: 'tumble', at: 'L0@0.8' },
      { k: 'approach', at: 'L2.t0+0.5', to: 'L3.t0' },
      { k: 'swap', a: 'T', b: 'S', by: 'T', at: 'L4.t0-0.05', dur: 1.0, nolunge: true },
      { k: 'horns', at: 'L6.t0+0.35', w: 'S', mode: 'held' },
      { k: 'dance', at: 'L6@0.45', to: 'end' }] },
  { shot: 'quay', room: 'open', tail: 1.4, lines: L7,
    cues: [{ k: 'scold', at: 'L0@0.3', to: 'L1.t0' },
      { k: 'hit', at: 'L2@0.1' },
      { k: 'arrive', at: 'L2@0.45', to: 'L3.t0' },
      { k: 'horns', at: 'L3.t1-0.15', w: 'S', mode: 'worn' },
      { k: 'swap', a: 'S', b: 'C', by: 'S', at: 'L4.t0-0.05', dur: 1.0 },
      { k: 'horns', at: 'L5.t0+0.35', w: 'C', mode: 'held' },
      { k: 'escort', at: 'L5@0.55', to: 'end' }] },
  { shot: 'station', room: 'office', tail: 1.4, lines: L8,
    cues: [{ k: 'enter', at: 0.4, to: 'L0@0.8' },
      { k: 'horns', at: 0.3, mode: 'at', x: 800, y: 528, dur: 0.4 },
      { k: 'slam', at: 'L1.t1+0.15' },
      { k: 'horns', at: 'L1.t1+0.3', mode: 'at', x: 800, y: 648, dur: 0.35 },
      { k: 'horns', at: 'L3.t0-0.5', w: 'C', mode: 'held', dur: 0.6 },
      { k: 'ink', at: 'L4@0.28' },
      { k: 'horns', at: 'L4@0.36', mode: 'at', x: 800, y: 648, dur: 0.5 },
      { k: 'jump', at: 'L4@0.55', to: 'L4.t1+0.5' }] },
  { shot: 'trick', room: 'office', tail: 1.6, lines: L9,
    cues: [{ k: 'horns', at: 0.05, mode: 'at', x: 800, y: 540, dur: 0.01 },
      { k: 'arrest', at: 0.4, to: 'L0.t1' },
      { k: 'marks', at: 'L0@0.55' },
      { k: 'kneel', at: 'L1.t0-0.3' },
      { k: 'tale', at: 'L2.t0', to: 'L4.t0' },
      { k: 'flower', at: 'L3.t0', to: 'L3.t1+0.8' },
      { k: 'leave', at: 'L4@0.6', to: 'L4.t1+0.2' },
      { k: 'lock', at: 'L4.t1+0.4' },
      { k: 'drawer', at: 'L5.t1+0.3' },
      { k: 'horns', at: 'L5.t1+0.75', w: 'L', mode: 'held' },
      { k: 'horns', at: 'L5.t1+1.8', w: 'L', mode: 'worn' },
      { k: 'return', at: 'L6.t0-1.0' },
      { k: 'swap', a: 'L', b: 'C', by: 'L', at: 'L6.t1+0.4', dur: 1.0 },
      { k: 'horns', at: 'L7.t0+0.45', w: 'C', mode: 'held' },
      { k: 'drag', at: 'L7.t1-0.3' }] },
  { shot: 'restore', room: 'hall', tail: 1.6, lines: L10,
    cues: [{ k: 'tickle', at: 'L0@0.86' }, { k: 'bound', at: 'L1.t0-0.2' },
      { k: 'hall', at: 'L3.t0-0.6' },
      { k: 'litter', at: 'L3@0.35' }, { k: 'prisoner', at: 'L3@0.7' },
      { k: 'horns', at: 'L5.t0+0.1', w: 'C', mode: 'worn' },
      { k: 'swap', a: 'C', b: 'S', by: 'C', at: 'L5.t0+1.1', dur: 1.0 },
      { k: 'horns', at: 'L5.t0+2.3', w: 'S', mode: 'held' },
      { k: 'horns', at: 'L5.t0+3.1', w: 'S', mode: 'worn' },
      { k: 'swap', a: 'S', b: 'L', by: 'S', at: 'L5.t0+3.6', dur: 1.0 },
      { k: 'horns', at: 'L5.t0+4.8', w: 'L', mode: 'held' },
      { k: 'cell', at: 'L5@0.8' },
      { k: 'morning', at: 'L6.t0-0.1' },
      { k: 'horns', at: 'L6.t0+0.3', w: 'K', mode: 'held' },
      { k: 'horns', at: 'L6@0.5', w: 'K', mode: 'worn' },
      { k: 'swap', a: 'K', b: 'T', by: 'K', at: 'L7.t0-0.05', dur: 1.0, nolunge: true },
      { k: 'horns', at: 'L7.t0+0.7', w: 'T', mode: 'held' }] },
  { shot: 'clock', room: 'hall', tail: 1.8, lines: L11,
    cues: [{ k: 'hang', at: 0.3, to: 'L0@0.2' },
      { k: 'horns', at: 'L0@0.3', w: 'L', mode: 'held' },
      { k: 'horns', at: 'L0@0.62', w: 'S', mode: 'worn' },
      { k: 'push', at: 'L0.t1-0.7' },
      { k: 'swap', a: 'S', b: 'CL', by: 'S', at: 'L1.t0-0.05', dur: 1.0 },
      { k: 'horns', at: 'L1.t0+0.9', w: 'L', mode: 'held' },
      { k: 'cuckoo', n: 1, at: 'L1.t1+0.3' },
      { k: 'cuckoo', n: 2, at: 'L5.t0+0.2' }, { k: 'cuckoo', n: 3, at: 'L5.t0+1.7' }, { k: 'cuckoo', n: 4, at: 'L5.t0+3.2' }] },
  { shot: 'hiding', room: 'open', tail: 3.5, lines: L12,
    cues: [{ k: 'horns', at: 'L0@0.6', w: 'T', mode: 'bag', dur: 0.7 },
      { k: 'walk', at: 0.4, to: 'end' },
      { k: 'show', at: 'L2.t0+0.2' },
      { k: 'far', at: 'L4.t0+1.2' }] },
  { shot: 'end', d: 8 },
];

/* who is in which body, and where the horns are, at the start of each shot (carried forward from the swaps and horn cues) */
(function carry() {
  let own = { K: 'b', T: 't', L: 'k', S: 's', C: 'c', CL: 'x' }, horns = { mode: 'at', x: 560, y: 636 };
  for (const s of SCRIPT) {
    s.own = Object.assign({}, own); s.horns0 = Object.assign({}, horns);
    for (const c of (s.cues || [])) {
      if (c.k === 'swap') { const t = own[c.a]; own[c.a] = own[c.b]; own[c.b] = t; }
      if (c.k === 'horns') horns = { w: c.w, mode: c.mode, x: c.x, y: c.y };
    }
  }
})();
if (typeof module !== 'undefined') module.exports = { SCRIPT, CAST };
