/* A Good Shellacking: the score. After Stanislaw Lem, The Cyberiad.
   The device: equality against identity. Two Trurls are equal in every field the picture can show, and the question the story
   turns on is whether they are the same object. Both are drawn by the one routine with the one set of ids, and both speak with
   the one voice, so the film cannot settle which Trurl was in the cellar; it only shows what each of them says.
   Lines carry who (a CAST key). One fulcrum line per scene is flagged line:true: it is filmed on the tightest camera and delivered more slowly.
   Times in cues: numbers, 'end-1', 'L2.t1+0.5', or 'L2@0.35' (35 percent of the way through line 2; WT() finds it from a word).
   Everything paraphrases Lem ("A Good Shellacking", The Cyberiad). Nothing is quoted. */
const CAST = {
  N: { name: 'Narrator', voice: 'bf_emma', speed: 1.0 },
  K: { name: 'Klapaucius', voice: 'bm_george', speed: 0.95 },
  T: { name: 'Trurl', voice: 'bm_lewis', speed: 1.02 },
  M: { name: 'The Wish Machine', voice: 'af_sky', speed: 1.04, fx: 'small' },
  R: { name: 'The King', voice: 'am_onyx', speed: 0.9 },
};
const WT = (ls, i, word, off = 0) => `L${i}@${(Math.max(0, ls[i].say.indexOf(word)) / ls[i].say.length).toFixed(3)}${off ? (off > 0 ? '+' : '') + off : ''}`;

/* ---- 1. the gift ---- */
const L1 = [
  { who: 'N', pre: 1.4, say: 'Someone was hammering on the front door of the constructor Klapaucius. He opened it, and found a round-bellied machine standing on four stubby legs.' },
  { who: 'K', pre: 0.4, say: 'Who are you? What do you want?' },
  { who: 'M', pre: 0.4, say: 'I am a wish machine, sir. I grant every wish. Your friend Trurl, Trurl the Magnificent, sent me to you as a present.' },
  { who: 'N', pre: 0.4, say: 'Klapaucius had mixed feelings about Trurl, and the word Magnificent annoyed him. Still, he let it in.' },
  { who: 'N', pre: 0.4, say: 'He parked it by the grandfather clock, and went back to his own work, a low machine on three stubby legs, almost done.' },
  { who: 'M', pre: 1.2, say: 'Excuse me. I am still here.' },
  { who: 'K', pre: 0.3, say: 'I know.' },
  { who: 'M', pre: 0.9, say: 'May I ask what you are building?' },
  { who: 'K', pre: 0.3, say: 'Are you for wishes, or for questions? Blue paint.' },
  { who: 'N', pre: 0.3, say: 'A little door opened in its belly, and out came a bucket of blue.' },
  { who: 'M', pre: 0.2, say: 'I hope the shade is right.' },
  { who: 'N', pre: 0.5, say: 'Over the next hours he asked for sandpaper, then a brace and bit, then a pot of white paint, and one number five screw. Each came straight out of the belly door.' },
  { who: 'N', pre: 0.5, say: 'At evening he threw a canvas over his work, and pulled a chair up opposite the machine.' },
  { who: 'K', pre: 0.4, say: 'So. Every wish? Now, something harder.' },
  { who: 'K', pre: 0.8, say: 'Make me a Trurl. So like the real one that nobody could ever tell the two apart.', line: true },
];
/* ---- 2. the copy ---- */
const L2 = [
  { who: 'M', pre: 1.0, say: 'Very well, I will make one. Only, please, be gentle with him.', line: true },
  { who: 'K', pre: 0.6, say: 'Of course, of course. Well? Where is he?' },
  { who: 'M', pre: 0.3, say: 'Already? A Trurl takes longer than a screw, you know.' },
  { who: 'N', pre: 0.5, say: 'It did not take long. The belly door swung open, and a Trurl climbed out.' },
  { who: 'N', pre: 0.5, say: 'Klapaucius looked him over, touched him, tapped him, and found no difference at all.' },
  { who: 'K', pre: 0.4, say: 'Hello, Trurl!' },
  { who: 'T', pre: 0.3, say: 'Hello, Klapaucius. Hold on. How did I end up here?' },
  { who: 'K', pre: 0.3, say: 'Oh, you dropped by. How do you like the place?' },
  { who: 'T', pre: 0.3, say: 'Very nice. What is under the canvas?' },
  { who: 'K', pre: 0.2, say: 'Nothing much. Do sit down.' },
  { who: 'T', pre: 0.3, say: 'I really ought to go. It is getting dark.' },
  { who: 'K', pre: 0.3, say: 'So soon? But you have not seen my cellar.' },
];
/* ---- 3. the cellar ---- */
const L3 = [
  { who: 'N', pre: 1.0, say: 'Klapaucius put an arm around his shoulders and walked him down the stairs. At the bottom he tripped him, sat on him, and tied him up.' },
  { who: 'N', pre: 0.4, say: 'Then he picked up a crowbar, and went to work.' },
  { who: 'T', pre: 2.4, say: 'Ow! Ow! What are you hitting me for?' },
  { who: 'K', pre: 0.3, say: 'Because I enjoy it. You ought to try it some time.' },
  { who: 'N', pre: 0.6, say: 'The next blow landed on top of his head, and it rang like a drum.' },
  { who: 'T', pre: 0.8, say: 'Let me go, or I will tell the King, and he will lock you in his deepest dungeon!' },
  { who: 'K', pre: 0.4, say: 'He will not. Shall I tell you why?' },
  { who: 'K', pre: 0.9, say: 'Because you are not the real Trurl.', line: true },
  { who: 'K', pre: 0.8, say: 'I had Trurl’s machine make you. And tonight your head comes off, to serve as my bootjack.' },
];
/* ---- 4. the claim ---- */
const L4 = [
  { who: 'T', pre: 0.9, say: 'You monster!' },
  { who: 'N', pre: 0.4, say: 'Klapaucius stood up, and this time he lifted a great club in both hands.' },
  { who: 'T', pre: 0.3, say: 'Wait! Stop! Listen to me!' },
  { who: 'K', pre: 0.4, say: 'What could you possibly say that would save your head?' },
  { who: 'T', pre: 0.9, say: 'I am the real Trurl! I hid inside the machine, and had it carry me here.', line: true },
  { who: 'T', pre: 0.7, say: 'I only wanted to see what you were building, behind your shut doors and your curtains.' },
];
/* ---- 5. the proof ---- */
const L5 = [
  { who: 'K', pre: 0.8, say: 'Nonsense, and not even clever nonsense. I can see straight through you.' },
  { who: 'K', pre: 0.9, say: 'A machine that can make a number five screw can certainly make you.', line: true },
  { who: 'T', pre: 0.6, say: 'I packed all of that in its belly beforehand! It was easy to guess what you would need!' },
  { who: 'K', pre: 0.3, say: 'So my good friend Trurl is a common sneak? I will never believe it. Take that!' },
  { who: 'N', pre: 0.3, say: 'He walloped him for slandering his friend, and walloped him again, and again, until his arm gave out.' },
  { who: 'K', pre: 0.6, say: 'Now I will have a little nap. Don’t worry. I will be back.' },
  { who: 'N', pre: 0.6, say: 'Soon his snoring carried down into the cellar. Trurl wriggled out of the knots, crept up to the machine and climbed into it, and it galloped away for home.' },
  { who: 'N', pre: 0.5, say: 'Klapaucius watched from his bedroom window, with a hand pressed over his mouth so he would not laugh out loud.' },
];
/* ---- 6. the morning ---- */
const L6 = [
  { who: 'N', pre: 1.0, say: 'Next day Klapaucius called on Trurl. A gloomy, silent Trurl opened the door. Even in the dark the signs showed: scratches painted over, dents hammered flat.' },
  { who: 'K', pre: 0.4, say: 'Why so glum? I have come to thank you for the present. A pity it ran away while I was asleep.' },
  { who: 'T', pre: 0.4, say: 'You abused my gift. The machine has told me all of it. You had it make me, the copy of me, I mean, and beat it in your cellar.' },
  { who: 'K', pre: 0.4, say: 'Why so cross? Yes, I had it make a copy, a perfect one. A poke or two, to check the workmanship.' },
  { who: 'K', pre: 0.3, say: 'It even claimed to be you, and called your gift a low trick. So I thrashed it, for your honor.' },
  { who: 'K', pre: 0.9, say: 'It was very like you. Clever, too.', line: true },
];
/* ---- 7. the bolts ---- */
const L7 = [
  { who: 'K', pre: 0.9, say: 'Oh, one more thing. What became of the artificial Trurl? May I have a look at it?' },
  { who: 'T', pre: 0.4, say: 'It was wild with rage. It meant to ambush you at the mountain pass. It ran off into the dark to build traps.' },
  { who: 'T', pre: 0.4, say: 'So, for the sake of our old friendship,' },
  { who: 'T', pre: 0.6, say: 'I had to take it apart.', line: true },
  { who: 'N', pre: 0.8, say: 'He nudged some nuts and bolts lying on the floor with the toe of his shoe, and sighed.' },
  { who: 'N', pre: 0.6, say: 'Then they shook hands, and parted as the best of friends.' },
];
/* ---- 8. the medal ---- */
const L8 = [
  { who: 'N', pre: 1.0, say: 'From then on Trurl told everyone how the copy had lied so cleverly, and how the real Trurl took it apart to protect his friend.' },
  { who: 'N', pre: 0.4, say: 'The story reached the royal court, though not long before he had been called the builder of the stupidest computer in the world.' },
  { who: 'R', pre: 0.6, say: 'To Trurl, our Order of the Great Parallax.' },
  { who: 'K', pre: 2.2, say: 'What? I saw through his little game. I beat him so soundly that he had to creep home in the dark and patch himself up.' },
  { who: 'K', pre: 0.9, say: 'And for that they give him a medal.', line: true },
  { who: 'N', pre: 0.8, say: 'Furious, Klapaucius went home, locked the door, and pulled down the blinds.' },
  { who: 'N', pre: 0.7, say: 'He too had been building a machine to grant every wish. Trurl had simply finished first.' },
];

const SCRIPT = [
  { shot: 'title', d: 6.0 },
  { shot: 'gift', room: 'shop', tail: 1.4, lines: L1,
    cues: [{ k: 'knock', at: 0.4, to: 'L0@0.3' },
      { k: 'open', at: WT(L1, 0, 'He opened') },
      { k: 'step', at: 'L3@0.85', to: 'L4@0.4' },
      { k: 'work', at: WT(L1, 4, 'and went back'), to: 'L5.t0-0.2' },
      { k: 'item', n: 0, at: 'L9@0.62' },
      { k: 'paint', at: 'L10.t1', to: 'L11.t0' },
      { k: 'item', n: 1, at: WT(L1, 11, 'sandpaper', 0.1) }, { k: 'item', n: 2, at: WT(L1, 11, 'a brace', 0.1) },
      { k: 'item', n: 3, at: WT(L1, 11, 'white paint', 0.1) }, { k: 'item', n: 4, at: WT(L1, 11, 'one number', 0.4) },
      { k: 'canvas', at: WT(L1, 12, 'threw a canvas'), to: WT(L1, 12, 'and pulled') },
      { k: 'chair', at: WT(L1, 12, 'pulled a chair'), to: 'L12.t1' }] },
  { shot: 'copy', room: 'shop', tail: 1.4, lines: L2,
    cues: [{ k: 'hum', at: 'L2.t1+0.1', to: WT(L2, 3, 'The belly') },
      { k: 'open', at: WT(L2, 3, 'swung open') },
      { k: 'climb', at: WT(L2, 3, 'and a Trurl', -0.1), to: 'L3.t1+0.6' },
      { k: 'tap', n: 0, at: WT(L2, 4, 'tapped') }, { k: 'tap', n: 1, at: WT(L2, 4, 'tapped', 0.3) },
      { k: 'look', at: 'L8.t0', to: 'L8.t1' },
      { k: 'stair', at: 'L11@0.7' }] },
  { shot: 'cellar', room: 'cellar', tail: 1.6, lines: L3,
    cues: [{ k: 'down', at: 0.3, to: WT(L3, 0, 'At the bottom') },
      { k: 'trip', at: WT(L3, 0, 'tripped') },
      { k: 'tie', at: WT(L3, 0, 'tied him', -0.2), to: 'L0.t1+0.3' },
      { k: 'hit', n: 0, at: 'L1.t1+0.3' }, { k: 'hit', n: 1, at: 'L1.t1+1.0' }, { k: 'hit', n: 2, at: 'L1.t1+1.7' },
      { k: 'hit', n: 3, at: 'L3.t1+0.25' },
      { k: 'drum', at: WT(L3, 4, 'and it rang', -0.25) },
      { k: 'sit', at: 'L6.t1+0.1' }] },
  { shot: 'claim', room: 'cellar', tail: 1.4, lines: L4,
    cues: [{ k: 'club', at: WT(L4, 1, 'he lifted'), to: 'L1.t1' },
      { k: 'stop', at: 'L2.t0' }] },
  { shot: 'proof', room: 'cellar', tail: 2.0, lines: L5,
    cues: [{ k: 'hit', n: 0, at: WT(L5, 3, 'Take that', 0.3) },
      { k: 'hit', n: 1, at: WT(L5, 4, 'walloped him again', -0.1) }, { k: 'hit', n: 2, at: WT(L5, 4, 'and again', -0.05) }, { k: 'hit', n: 3, at: WT(L5, 4, 'until', -0.05) },
      { k: 'drop', at: 'L4.t1+0.1' },
      { k: 'snore', at: 'L5.t1+0.3', to: WT(L5, 6, 'Trurl wriggled') },
      { k: 'free', at: WT(L5, 6, 'Trurl wriggled'), to: WT(L5, 6, 'crept up') },
      { k: 'climb', at: WT(L5, 6, 'climbed into', -0.2) },
      { k: 'gallop', at: WT(L5, 6, 'and it galloped', -0.1), to: 'end' },
      { k: 'window', at: 'L7.t0-0.4' }] },
  { shot: 'morning', room: 'home', tail: 1.2, lines: L6,
    cues: [{ k: 'knock', at: 0.3, to: 1.0 },
      { k: 'open', at: WT(L6, 0, 'opened the door') },
      { k: 'dark', at: WT(L6, 0, 'Even in the dark') },
      { k: 'marks', at: WT(L6, 0, 'scratches', -0.2), to: 'L0.t1' },
      { k: 'poke', at: WT(L6, 3, 'a poke', 0.1) }] },
  { shot: 'bolts', room: 'home', tail: 1.6, lines: L7,
    cues: [{ k: 'nudge', n: 0, at: WT(L7, 4, 'nudged', 0.1) }, { k: 'nudge', n: 1, at: WT(L7, 4, 'nudged', 0.7) },
      { k: 'sigh', at: WT(L7, 4, 'and sighed') },
      { k: 'shake', at: WT(L7, 5, 'shook hands', -0.3) }] },
  { shot: 'medal', room: 'court', tail: 3.4, lines: L8,
    cues: [{ k: 'tell', at: 0.3, to: 'L0.t1' },
      { k: 'court', at: 'L1@0.3' },
      { k: 'pin', at: 'L2.t1+0.2' },
      { k: 'fanfare', at: 'L2.t1+0.3' },
      { k: 'news', at: 'L3.t0-0.9' },
      { k: 'home', at: 'L5.t0-0.3' },
      { k: 'lock', at: WT(L8, 5, 'locked', 0.2) },
      { k: 'blinds', at: WT(L8, 5, 'pulled down', 0.1), to: 'L5.t1+0.3' },
      { k: 'reveal', at: 'L6@0.55', to: 'L6.t1+0.6' }] },
  { shot: 'end', d: 7.5 },
];
if (typeof module !== 'undefined') module.exports = { SCRIPT, CAST };
