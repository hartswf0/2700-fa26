/* The Burning of the Abominable House. The score.
   After Italo Calvino, "The Burning of the Abominable House" (1973), in Numbers in the Dark, translated by Tim Parks (1995).
   The narration paraphrases Calvino; every spoken line was checked against the story for shared six-word runs.
   The device: a programmer's room. A computer cabinet on the left, a pinboard in the middle, the programmer at his desk on the right,
   and on the desk a counter of possible stories. The pinboard shows the burnt house, the copybook, the cards of the people,
   the grid of who-did-what-to-whom, and the rules. The counter shows exact numbers: twelve deeds, each one ordered pair of
   distinct people; each rule removes the stories that break it (counts in STORIES below, worked out in make_counts.py).
   Lines carry who (a CAST key). One fulcrum line per scene is flagged line:true: tightest camera, slower delivery.
   Times in cues: numbers, 'end-1', 'L2.t1+0.5', or 'L2@0.35' (35 percent of the way through line 2; WT() finds it from a word).
   A line may carry show: the spelling for the page and the printed script, when the spoken spelling differs. */
const CAST = {
  P: { name: 'The programmer', voice: 'bm_daniel', speed: 0.95 },
  K: { name: 'Skiller', voice: 'am_onyx', speed: 0.94, fx: 'flat' },
};
const STORIES = { start: 8916100448256, a: 5015306502144, ab: 4074936532992, abc: 3424078614528, abcd: 2663172255744,
  five: 4096000000000000, six: 531441000000000000 };
const WT = (ls, i, word, off = 0) => `L${i}@${(Math.max(0, ls[i].say.indexOf(word)) / ls[i].say.length).toFixed(3)}${off ? (off > 0 ? '+' : '') + off : ''}`;

/* ---- the ruins ---- */
const L0 = [
  { who: 'P', pre: 1.6, say: 'Skiller, from the insurance company, comes back tonight for the results. I have not written the program yet.' },
  { who: 'P', pre: 0.7, say: 'The house stood on a hump of waste ground, between the railway and the scrapyards. It burned from the roof to the cellar.' },
  { who: 'P', pre: 0.6, say: 'Four people lived in it. All four died in the fire, and what was left of them tells us nothing.' },
  { who: 'P', pre: 0.7, say: 'One thing came through: a copybook in a plastic folder. The pages burned. The cover did not.' },
  { who: 'P', pre: 0.6, say: 'On the front, a title: it promises to set down every abominable thing that was done in this house.' },
  { who: 'P', pre: 1.0, say: 'On the back is the index: twelve deeds in alphabetical order, with the page numbers burned black.', line: true },
  { who: 'P', pre: 0.8, say: 'A thirteenth is missing from the list. The fire.' },
];
/* ---- the count ---- */
const L1 = [
  { who: 'P', pre: 1.6, say: 'The widow Roessler, who kept the boarding house.' },
  { who: 'P', pre: 0.4, say: 'Ogiva, the girl she adopted, who modelled for magazines, with a shaved head and a hundred wigs.' },
  { who: 'P', pre: 0.4, say: 'Inigo, a disowned young lord, who owned the house and rented a room in it from his own tenant.' },
  { who: 'P', pre: 0.4, say: 'And Belindo Kid, a wrestler past his best, the one lodger who paid.' },
  { who: 'P', pre: 0.8, say: 'Suppose each deed was done by one of them to one other. Four people make twelve ordered pairs.' },
  { who: 'P', pre: 1.0, say: 'Twelve pairs for each of twelve deeds: twelve to the twelfth power. Almost nine trillion stories.', line: true },
  { who: 'P', pre: 0.8, say: 'The police did not try to read them. Whoever did what, they reasoned, burned with whoever it was done to.' },
];
/* ---- the policies ---- */
const L2 = [
  { who: 'P', pre: 1.6, say: 'The insurance company cannot be so calm. There are four policies.' },
  { who: 'P', pre: 0.5, say: 'Inigo insured the house against fire. If he set the fire, the company owes nothing.' },
  { who: 'P', pre: 0.4, say: 'The widow insured her own life, for Ogiva. If Ogiva killed her, nothing.' },
  { who: 'P', pre: 0.4, say: 'Ogiva insured her wigs. If she burned them herself, nothing.' },
  { who: 'P', pre: 0.4, say: 'The widow insured Belindo\'s tour against injury. If she drove him to his death, nothing.' },
  { who: 'P', pre: 1.0, say: 'Every policy pays, unless the right person did the wrong thing.', line: true },
  { who: 'P', pre: 0.7, say: 'Skiller wants the machine to tell him which of the nine trillion stories that is.' },
];
/* ---- the rules ---- */
const L3 = [
  { who: 'P', pre: 1.6, say: 'So I write rules, to throw out the stories that cannot have happened.' },
  { who: 'P', pre: 0.6, say: 'Belindo does not use a knife. And nobody strangles Belindo; their fingers would not go round his neck.' },
  { who: 'P', pre: 0.6, say: 'Belindo can only be tied up if somebody has a gun on him first.' },
  { who: 'P', pre: 0.6, say: 'If you have slandered someone, you have nothing left to blackmail them with, and no reason to snoop.' },
  { who: 'P', pre: 0.6, say: 'And nobody who was strangled was also knifed.' },
  { who: 'P', pre: 1.0, say: 'Every rule I add throws away a trillion stories.', line: true },
  { who: 'P', pre: 0.8, say: 'Then I picture one of them. Drugs for the wrestler. A boy who wants some too. A threat, a rope, two fingers on a throat.' },
  { who: 'P', pre: 0.5, say: 'And a body that has to look like a suicide. So, a knife.' },
  { who: 'P', pre: 0.6, say: 'Stop. That breaks my own rule. I take it out, and the stories come back.' },
];
/* ---- Skiller ---- */
const L4 = [
  { who: 'P', pre: 1.6, say: 'There is a fifth person in this story. Skiller sold all four policies.' },
  { who: 'P', pre: 0.6, say: 'He sat in their lounge. He drank their tea. He knew each of them.' },
  { who: 'P', pre: 0.6, say: 'Then why bring the problem to me? Did he find the copybook in the ashes, or leave it there?' },
  { who: 'P', pre: 0.6, say: 'I put him on a card. Five people, twenty pairs.' },
  { who: 'P', pre: 0.8, say: 'I try a story where the house was innocent until he rang the bell, and all the harm came in with him.' },
  { who: 'P', pre: 0.6, say: 'And one where he is the only innocent, called in by four people, each with a plan against the other three.' },
  { who: 'P', pre: 1.1, say: 'The computer stops. It will not accept a story with anyone innocent in it.', line: true },
];
/* ---- Waldemar ---- */
const L5 = [
  { who: 'P', pre: 1.6, say: 'The house is ash, and they are all dead. Inside the computer, I can put the facts in another order.' },
  { who: 'P', pre: 0.6, say: 'I add a sixth character. Myself.' },
  { who: 'P', pre: 1.0, say: 'The house comes back up out of the ashes, and I ring the bell with my suitcase.', line: true },
  { who: 'P', pre: 0.7, say: 'Waldemar, systems analyst. I ask for a room.', show: 'Waldemar, systems analyst. I ask for a room.' },
  { who: 'P', pre: 0.6, say: 'I tell them what I work on at night: a system that turns each private vice into a part of the general good.' },
  { who: 'P', pre: 0.7, say: 'They say nothing. They think Skiller sent me.' },
  { who: 'P', pre: 1.0, say: 'They are right.' },
  { who: 'P', pre: 0.8, say: 'If I am only his instrument, my program is a copy of his. For this to come out, we have to be enemies.' },
];
/* ---- the second programmer ---- */
const L6 = [
  { who: 'K', pre: 1.6, say: 'Good evening. My company is studying how households contribute to disasters. With your permission, we would like to observe you. There are discounts on your policies.' },
  { who: 'P', pre: 0.8, say: 'He already knows what each of them will do. Another computer told him.' },
  { who: 'P', pre: 0.6, say: 'A bank of names: people inclined to fraud and harm, hundreds of thousands of them.' },
  { who: 'P', pre: 0.5, say: 'Get them to insure everything. Let them stage their accidents and finish each other off. The company keeps the evidence and pays no one.' },
  { who: 'P', pre: 0.6, say: 'Some deeds in the index never happened. They are noise, put there so the clients\' guilt hides the company\'s.' },
  { who: 'P', pre: 0.6, say: 'After the fire, he takes the data to a second computer, whose programmer knows none of this, to check that no one can trace it back.' },
  { who: 'P', pre: 1.2, say: 'I am the second programmer.', line: true },
  { who: 'P', pre: 1.0, say: 'Between two computers, the winner is not the one that plays better. It is the one that works out how the other is playing better than it.' },
  { who: 'P', pre: 0.6, say: 'Mine now holds the other one\'s winning game.' },
  { who: 'P', pre: 1.2, say: 'The doorbell. Skiller sold me a fire policy too.' },
  { who: 'P', pre: 0.7, say: 'I can hear the siren. I rang the fire brigade an hour ago. I release the safety catch, and go to the door.' },
];

const SCRIPT = [
  { shot: 'title', d: 7.0 },
  { shot: 'ruins', room: 'lab', tail: 1.4, lines: L0,
    cues: [{ k: 'burn', at: 'L1.t0+0.6', to: 'L2.t1' },
      { k: 'find', at: 'L3.t0+0.3' },
      { k: 'front', at: 'L4.t0-0.3' },
      { k: 'turn', n: 0, at: 'L5.t0-0.6' },
      { k: 'thirteen', at: 'L6.t0+0.2' }] },
  { shot: 'count', room: 'lab', tail: 1.3, lines: L1,
    cues: [{ k: 'card', n: 0, at: 'L0.t0' }, { k: 'card', n: 1, at: 'L1.t0' }, { k: 'card', n: 2, at: 'L2.t0' }, { k: 'card', n: 3, at: 'L3.t0' },
      { k: 'grid', at: 'L4.t0+0.4', to: 'L4.t1' },
      { k: 'roll', at: 'L5.t0+0.6', to: 'L5.t1+0.4' },
      { k: 'stamp', at: 'L6.t1-1.4' }] },
  { shot: 'policies', room: 'lab', tail: 1.3, lines: L2,
    cues: [{ k: 'slip', n: 0, at: 'L1.t0' }, { k: 'slip', n: 1, at: 'L2.t0' }, { k: 'slip', n: 2, at: 'L3.t0' }, { k: 'slip', n: 3, at: 'L4.t0' },
      { k: 'void', at: 'L5.t0+0.3' }] },
  { shot: 'rules', room: 'lab', tail: 1.4, lines: L3,
    cues: [{ k: 'rule', n: 0, at: 'L1.t0+0.3' }, { k: 'rule', n: 1, at: 'L2.t0+0.3' }, { k: 'rule', n: 2, at: 'L3.t0+0.3' }, { k: 'rule', n: 3, at: 'L4.t0+0.2' },
      { k: 'chain', at: 'L6.t0+0.4', to: 'L7.t1' },
      { k: 'clash', at: WT(L3, 7, 'knife', -0.1) },
      { k: 'strike', at: 'L8.t0+1.0' }] },
  { shot: 'skiller', room: 'lab', tail: 1.4, lines: L4,
    cues: [{ k: 'card5', at: 'L3.t0' },
      { k: 'roll', at: 'L3.t0+0.8', to: 'L3.t1+0.6' },
      { k: 'harm', at: 'L4.t0+0.3', to: 'L4.t1+0.3' },
      { k: 'plans', at: 'L5.t0+0.3', to: 'L5.t1+0.3' },
      { k: 'error', at: 'L6.t0+0.4' }] },
  { shot: 'waldemar', room: 'lab', tail: 1.5, lines: L5,
    cues: [{ k: 'card6', at: 'L1.t0+0.6' },
      { k: 'roll', at: 'L1.t0+1.0', to: 'L1.t1+0.8' },
      { k: 'rise', at: 'L2.t0-0.2', to: WT(L5, 2, 'and I', 0.0) },
      { k: 'ring', at: WT(L5, 2, 'bell', 0.1) },
      { k: 'eyes', at: 'L5.t0' },
      { k: 'right', at: 'L6.t0' },
      { k: 'split', at: 'L7.t0+0.4' }] },
  { shot: 'second', room: 'lab', tail: 2.0, lines: L6,
    cues: [{ k: 'door', at: 'L0.t0-0.6' },
      { k: 'bank', at: 'L2.t0', to: 'L3.t1' },
      { k: 'noise', at: 'L4.t0+0.3' },
      { k: 'hand', at: 'L5.t0+0.5', to: 'L5.t1' },
      { k: 'game', at: 'L7.t0+0.3', to: 'L8.t1' },
      { k: 'bell', at: 'L9.t0-0.4' },
      { k: 'siren', at: 'L10.t0-0.3', to: 'end' },
      { k: 'catch', at: WT(L6, 10, 'release', 0.0) }] },
  { shot: 'end', d: 8.0, cues: [{ k: 'close', at: 0.6 }] },
];
if (typeof module !== 'undefined') module.exports = { SCRIPT, CAST, STORIES };
