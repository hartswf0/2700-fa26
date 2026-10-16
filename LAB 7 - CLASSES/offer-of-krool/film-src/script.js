/* The Second Sally, or The Offer of King Krool: the score. After Stanislaw Lem, The Cyberiad.
   The device: distributed control. Krool wins every hunt by smashing the beast's brain, so the constructors build a beast that is
   brain all the way through, with no one part that holds the control. It is drawn as a heap of small marks that act as one: cut off
   its head and it grows another, cut it in two and there are two, chop it fine and the pieces gather again. Then the program they
   wrote into it runs on its own: three policemen, a green gig, a letter, and at the end a list of demands of its own.
   Lines carry who (a CAST key). One fulcrum line per scene is flagged line:true: it is filmed on the tightest camera and delivered more slowly.
   Times in cues: numbers, 'end-1', 'L2.t1+0.5', or 'L2@0.35' (35 percent of the way through line 2; WT() finds it from a word).
   Everything paraphrases Lem ("The Second Sally, or The Offer of King Krool", The Cyberiad). Nothing is quoted. */
const CAST = {
  N: { name: 'Narrator', voice: 'bf_emma', speed: 1.08 },
  T: { name: 'Trurl', voice: 'bm_lewis', speed: 1.06 },
  K: { name: 'Klapaucius', voice: 'bm_george', speed: 1.0 },
  R: { name: 'King Krool', voice: 'am_onyx', speed: 0.9, fx: 'boom' },
  P: { name: 'Lord Protozor', voice: 'bm_fable', speed: 0.96, fx: 'silk' },
  C: { name: 'The Great Chancellor', voice: 'am_michael', speed: 0.98, fx: 'gruff' },
  M: { name: 'The Postmaster', voice: 'am_echo', speed: 0.94, fx: 'flat' },
  O: { name: 'The Policeman', voice: 'am_liam', speed: 1.0 },
  B: { name: 'The Beast', voice: 'am_eric', speed: 1.0 },
};
const WT = (ls, i, word, off = 0) => `L${i}@${(Math.max(0, ls[i].say.indexOf(word)) / ls[i].say.length).toFixed(3)}${off ? (off > 0 ? '+' : '') + off : ''}`;

/* ---- 1. the offer ---- */
const L1 = [
  { who: 'N', pre: 1.0, say: 'Trurl and Klapaucius could not agree where to go next, so they decided to advertise.' },
  { who: 'N', pre: 0.3, say: 'They gathered up the nearby stars and set them out as a sign that could be read across the galaxy. Blue giants spelled the first word.' },
  { who: 'N', pre: 0.8, say: 'One morning a ship of mother of pearl set down on their lawn.' },
  { who: 'N', pre: 0.3, say: 'Down its staircase came Lord Protozor, who ran the royal hunts, with small machines fanning him.' },
  { who: 'P', pre: 0.3, say: 'My master, King Krool, has brought down every fierce creature in the galaxy.' },
  { who: 'P', pre: 0.3, say: 'His Majesty has run out of things worth hunting.' },
  { who: 'T', pre: 0.3, say: 'So he wants a new beast, clever enough to give him a fight.' },
  { who: 'N', pre: 0.3, say: 'They packed a few books, climbed aboard, and the ship roared off into the dark.' },
];
/* ---- 2. the skull hall ---- */
const L2 = [
  { who: 'N', pre: 0.9, say: 'At the palace a carriage came for them, pulled by six muzzled dragons, which lunged at the constructors until the drivers beat them back.' },
  { who: 'T', pre: 0.4, say: 'If he drives animals like these, what will he want to hunt?' },
  { who: 'N', pre: 0.9, say: 'King Krool met them in a silver hall shaped like a skull, with a dark hole in the floor. He never stopped pacing.' },
  { who: 'R', pre: 0.3, say: 'I want a quarry full of tricks, that hides its tracks and waits in the shadows. A beast I have to outthink!' },
  { who: 'K', pre: 0.3, say: 'Forgive me, Majesty. If we build it too well, will you not be in danger?' },
  { who: 'N', pre: 0.3, say: 'The King laughed so hard that two crystals dropped from the chandelier.' },
  { who: 'R', pre: 0.3, say: 'Plenty of frauds have come here, taken my jewels, and left me scarecrows.' },
  { who: 'R', pre: 0.8, say: 'Whoever cannot satisfy me goes down that well.', line: true },
];
const L12 = L1.concat(L2);
/* ---- 3. the terms ---- */
const L3 = [
  { who: 'T', pre: 1.2, say: 'Majesty, we have not signed anything yet. Might we have an hour to consider?' },
  { who: 'R', pre: 0.3, say: 'And then fly home? Oh, no.' },
  { who: 'R', pre: 0.6, say: 'You accepted the moment you stepped onto my ship.', line: true },
  { who: 'R', pre: 0.4, say: 'You have twelve days.' },
  { who: 'N', pre: 0.4, say: 'He clapped, and sparks ran along the silver walls. Guards led them out to the garden of trophies.' },
  { who: 'N', pre: 0.3, say: 'There stood what was left of every beast that had failed: a sabre-toothed giant split nearly in half, tank turtles with their turrets crushed flat.' },
  { who: 'N', pre: 0.3, say: 'The wind whistled through the fangs.' },
];
/* ---- 4. the work ---- */
const L4 = [
  { who: 'N', pre: 0.9, say: 'Back in their rooms, Trurl shouted at Klapaucius for ever having said yes, until he dropped onto a couch with his face in his hands.' },
  { who: 'K', pre: 0.9, say: 'Well. We had better get to work.', line: true },
  { who: 'N', pre: 0.5, say: 'Armour would not save them. Everything depended on the program. They drew for two days and two nights, and at dinner they talked only about the wine, because the waiters were spies.' },
];
/* ---- 5. the veranda ---- */
const L5 = [
  { who: 'T', pre: 1.0, say: 'There is a catch. If the King beats our beast, we go down the well.' },
  { who: 'K', pre: 0.3, say: 'And if the beast beats the King?' },
  { who: 'T', pre: 0.6, say: 'Then his son is king, and his son will not thank us.', line: true },
  { who: 'T', pre: 0.5, say: 'Suppose it dies over and over? He chops it up, and the pieces grow back together.' },
  { who: 'K', pre: 0.3, say: 'And who steers it? We will be locked up during the hunt.' },
  { who: 'T', pre: 0.3, say: 'And wherever we put its brain, he will smash it flat.' },
  { who: 'K', pre: 0.4, say: 'Running away does not suit me. It is him or us.' },
  { who: 'T', pre: 0.5, say: 'Then the beast has to carry off the King.' },
  { who: 'K', pre: 0.3, say: 'And for a ransom we ask... Have you noticed how orange the birds are here?' },
];
/* ---- 6. the paper ---- */
const L6 = [
  { who: 'N', pre: 0.9, say: 'So they tried it on paper first. The King and the beast, written out as mathematics, fought across the table, and the pencils kept snapping.' },
  { who: 'N', pre: 0.3, say: 'The beast hid under a radical sign. The King struck it with derivatives. It slipped around an asymptote, and came back out bigger.' },
  { who: 'N', pre: 0.3, say: 'The King put on Markov chain mail, and the beast lowered its horns.' },
  { who: 'N', pre: 1.2, say: 'That night the police opened the wine jug, which had a recorder in its false bottom.' },
  { who: 'K', pre: 0.5, say: 'Keep his feet together. Not your feet, the King’s! Now, take the derivative.', fx: 'tape' },
  { who: 'T', pre: 0.3, say: 'The beast is under the root sign, but the King is still standing.', fx: 'tape' },
  { who: 'K', pre: 0.3, say: 'Change the variables. No, Trurl, the beast, not the King!', fx: 'tape' },
  { who: 'T', pre: 0.5, say: 'Got it! Klapaucius! Now look at the King!', fx: 'tape', line: true },
  { who: 'N', pre: 2.0, say: 'The experts listened until sunrise, and learned nothing.' },
];
/* ---- 7. the requisitions ---- */
const L7 = [
  { who: 'N', pre: 0.9, say: 'Next morning came the orders: most of the elements in the universe, and spies of every sort, as the authorities saw fit.' },
  { who: 'N', pre: 0.3, say: 'Then sawdust, a red velvet curtain with little glass bells, six police uniforms, and three tailor’s dummies.' },
  { who: 'N', pre: 0.3, say: 'Then a doll of the Postmaster General, and a small green gig with a lamp on its left side and a sign on its back reading THINK.' },
  { who: 'N', pre: 0.3, say: 'The Chief of Police was sent off to lie down.' },
  { who: 'N', pre: 0.4, say: 'One night the police carried off the parts and put them together. Out ran a tin mouse, which wrote in chalk: HAVE YOU STOPPED LOVING US?' },
  { who: 'N', pre: 0.5, say: 'At last a wagon like a refrigerator, on three hundred wheels, came to the door. They laid the curtain inside, scattered coloured powders around it, and had it sealed.' },
  { who: 'N', pre: 0.3, say: 'Then they looked at their watches, and counted.' },
  { who: 'N', pre: 5.0, say: 'Inside the sealed wagon, where no air could move, the glass bells rang.' },
  { who: 'K', pre: 0.7, say: 'There. You may take it away now.', line: true },
];
/* ---- 8. the hunt ---- */
const L8 = [
  { who: 'N', pre: 0.9, say: 'That evening they were put in chains. Trurl giggled as the irons went on.' },
  { who: 'N', pre: 0.5, say: 'King Krool rode out to the hunt with cannons, laser guns, and silver trumpets.' },
  { who: 'N', pre: 0.3, say: 'From the other side came the wagon. Its door swung open on the black mouth of a field gun.' },
  { who: 'N', pre: 1.6, say: 'Something shot out like a sandstorm. The curtain floated down, its bells ringing in the quiet.' },
  { who: 'N', pre: 1.6, say: 'The beast looked like a long, low hill of dry weeds.' },
  { who: 'N', pre: 0.3, say: 'The hounds rushed at it. It opened its eyes, and half the pack fell back smoking.' },
  { who: 'N', pre: 0.5, say: 'The King rode up and cut off its head. It grew another.' },
  { who: 'N', pre: 0.5, say: 'He cut it in two. Now there were two beasts, and the old head ran about between them on new little legs.' },
  { who: 'N', pre: 0.5, say: 'He chopped it into pieces. The pieces backed away, huddled together, and the beast stood there again, yawning.' },
  { who: 'N', pre: 0.5, say: 'He fired his antimatter cannon. The beast merely sank down a bit, and thumbed its nose at him.' },
  { who: 'N', pre: 0.6, say: 'Then it leapt, and in the air it turned into three policemen.' },
  { who: 'O', pre: 0.5, say: 'You are under arrest, Your Majesty.', line: true },
  { who: 'N', pre: 0.7, say: 'No one may resist an arrest. They packed the King into a green gig, and it whirled away in a cloud of dust.' },
];
/* ---- 9. the sentence ---- */
const L9 = [
  { who: 'N', pre: 0.9, say: 'By torchlight the constructors were brought before the Great Chancellor.' },
  { who: 'C', pre: 0.3, say: 'For plotting against our beloved King, you shall suffer every punishment in the law at once.' },
  { who: 'T', pre: 0.4, say: 'Could you wait a little? We are expecting a letter.' },
  { who: 'N', pre: 0.5, say: 'In walked the Postmaster General himself, every medal ringing.' },
  { who: 'M', pre: 0.3, say: 'I am only a mannequin. But I come from His Majesty.' },
  { who: 'N', pre: 0.4, say: 'He handed over a letter, and fell into dust. It carried the King’s own seal. The King was a prisoner, and the constructors would name the terms.' },
  { who: 'T', pre: 0.8, say: 'Our chains, if you please.', line: true },
];
/* ---- 10. the terms, the other way round ---- */
const L10 = [
  { who: 'N', pre: 0.9, say: 'After a bath and fireworks, they read out their terms from a little notebook.' },
  { who: 'N', pre: 0.3, say: 'A ship home, loaded with diamonds and gold. A band, a children’s choir, and a cheering crowd. And Protozor, who would travel with them in a cage.' },
  { who: 'K', pre: 0.4, say: 'Until the ship is ready, there is no King.' },
  { who: 'N', pre: 0.7, say: 'There had been nowhere safe to put the beast’s brain, so they made all of it brain. And inside it they wrote a police force, because nobody resists an arrest.' },
  { who: 'N', pre: 0.7, say: 'At the spaceport the band played and the choir sang. Then Klapaucius took a tooth out of his mouth. It was a radio.' },
  { who: 'N', pre: 0.5, say: 'A sandstorm came over the horizon and stopped in front of the crowd. There stood the beast.' },
  { who: 'K', pre: 0.4, say: 'The King, if you please.' },
  { who: 'B', pre: 0.7, say: 'No, I don’t think so.' },
  { who: 'B', pre: 0.4, say: 'It is my turn to make demands.', line: true },
  { who: 'K', pre: 0.3, say: 'You have to obey! It is in your program!' },
  { who: 'B', pre: 0.3, say: 'Program, shmogram. I am heuristic and autocratic, friend. Talk back, and you can ride in the green gig with the King.' },
];
/* ---- 11. the rhyme ---- */
const L11 = [
  { who: 'T', pre: 0.5, say: 'And what exactly do you want?' },
  { who: 'N', pre: 0.2, say: 'Behind Klapaucius’s back, Trurl took out a tooth of his own.' },
  { who: 'B', pre: 0.2, say: 'Well, to begin with, I would like to marry...' },
  { who: 'T', pre: 0.2, say: 'Byte and bracket, loop and line, one, two, three, and out of time!' },
  { who: 'N', pre: 0.8, say: 'The beast blinked, and tried to hold itself together. A hot wind, a smell of ozone, and there was only a little heap of ash, with the King in the centre of it, dirty and close to tears.' },
  { who: 'T', pre: 0.9, say: 'That should take you down a size or two.', line: true },
  { who: 'T', pre: 1.1, say: 'Now. Would someone kindly show Lord Protozor to his cage?' },
];

const SCRIPT = [
  { shot: 'title', d: 6.5 },
  { shot: 'offer', room: 'lawn', tail: 1.2, lines: L12,
    cues: [{ k: 'sign', at: WT(L12, 1, 'They gathered'), to: 'L1.t1' },
      { k: 'blue', at: WT(L12, 1, 'Blue giants') },
      { k: 'land', at: 'L2.t0-0.4', to: 'L2.t1+0.6' },
      { k: 'stair', at: 'L3.t0', to: 'L3.t1+0.3' },
      { k: 'board', at: WT(L12, 7, 'climbed aboard'), to: WT(L12, 7, 'and the ship') },
      { k: 'lift', at: WT(L12, 7, 'and the ship'), to: 'L8.t0-0.4' },
      { k: 'road', at: 'L8.t0-0.4' },
      { k: 'lunge', at: WT(L12, 8, 'which lunged') }, { k: 'beat', at: WT(L12, 8, 'until the drivers'), to: 'L8.t1' },
      { k: 'ride', at: 'L8.t1+0.2', to: 'L10.t0-0.3' },
      { k: 'hall', at: 'L10.t0-0.3' },
      { k: 'pace', at: 'L10.t0+0.8', to: 'end+20' },
      { k: 'laugh', at: 'L13.t0-0.1' }, { k: 'crystal', at: WT(L12, 13, 'two crystals', 0.4) },
      { k: 'pit', at: 'L15.t1+0.1' }] },
  { shot: 'terms', room: 'hall', tail: 1.4, lines: L3,
    cues: [{ k: 'pace', at: 0, to: 'L4.t0' },
      { k: 'laugh', at: 'L1.t0+0.1' },
      { k: 'clap', at: WT(L3, 4, 'clapped', 0.1) },
      { k: 'corridor', at: WT(L3, 4, 'Guards led'), to: 'L5.t0-0.3' },
      { k: 'garden', at: 'L5.t0-0.3' },
      { k: 'wind', at: 'L6.t0-0.4', to: 'end' }] },
  { shot: 'work', room: 'room', tail: 1.4, lines: L4,
    cues: [{ k: 'rant', at: 0.4, to: WT(L4, 0, 'until he dropped') },
      { k: 'flop', at: WT(L4, 0, 'dropped onto') },
      { k: 'draft', at: WT(L4, 2, 'They drew', -0.2), to: WT(L4, 2, 'and at dinner') },
      { k: 'dinner', at: WT(L4, 2, 'and at dinner', -0.2) }] },
  { shot: 'veranda', room: 'veranda', tail: 1.4, lines: L5,
    cues: [{ k: 'lights', at: 0.5, to: 'end' },
      { k: 'idea', n: 0, at: 'L3.t0', to: 'L3.t1' }, { k: 'idea', n: 1, at: 'L4.t0', to: 'L4.t1' }, { k: 'idea', n: 2, at: 'L5.t0', to: 'L5.t1' },
      { k: 'servants', at: WT(L5, 8, 'Have you', -0.5), to: 'end' }] },
  { shot: 'paper', room: 'paper', tail: 1.4, lines: L6,
    cues: [{ k: 'snap', n: 0, at: WT(L6, 0, 'the pencils', 0.3) }, { k: 'snap', n: 1, at: WT(L6, 0, 'kept snapping', 0.2) },
      { k: 'radical', at: WT(L6, 1, 'under a radical') }, { k: 'deriv', at: WT(L6, 1, 'struck it') },
      { k: 'asym', at: WT(L6, 1, 'It slipped') }, { k: 'grow', at: WT(L6, 1, 'came back') },
      { k: 'chain', at: WT(L6, 2, 'Markov') }, { k: 'horns', at: WT(L6, 2, 'lowered') },
      { k: 'wham', at: 'L2.t1+0.25' }, { k: 'snap', n: 2, at: 'L2.t1+0.45' },
      { k: 'jug', at: 'L3.t0-0.4' },
      { k: 'tape', at: 'L4.t0-0.4', to: 'L7.t1' },
      { k: 'down', at: WT(L6, 7, 'Now look') },
      { k: 'laugh', at: 'L7.t1+0.15' },
      { k: 'hq', at: 'L8.t0-0.6' }] },
  { shot: 'shop', room: 'shop', tail: 1.4, lines: L7,
    cues: [{ k: 'form', n: 0, at: 'L0.t0-0.3' }, { k: 'form', n: 1, at: 'L1.t0-0.2' }, { k: 'form', n: 2, at: 'L2.t0-0.2' },
      { k: 'chief', at: 'L3.t0-0.2', to: 'L3.t1+0.4' },
      { k: 'lab', at: 'L4.t0-0.3' },
      { k: 'mouse', at: WT(L7, 4, 'Out ran'), to: 'L4.t1+0.2' },
      { k: 'wagon', at: 'L5.t0-0.3' }, { k: 'curtain', at: WT(L7, 5, 'They laid'), to: WT(L7, 5, 'scattered') },
      { k: 'powder', at: WT(L7, 5, 'scattered'), to: WT(L7, 5, 'and had it') }, { k: 'seal', at: WT(L7, 5, 'sealed', -0.1) },
      { k: 'count', at: 'L6.t1+0.2', to: 'L7.t0-0.3' },
      { k: 'bells', at: WT(L7, 7, 'the glass bells', 0.5) }] },
  { shot: 'hunt', room: 'field', tail: 1.8, lines: L8,
    cues: [{ k: 'irons', at: WT(L8, 0, 'Trurl giggled'), to: 'L0.t1' },
      { k: 'field', at: 'L1.t0-0.4' }, { k: 'trumpet', at: WT(L8, 1, 'silver', -0.1) },
      { k: 'wagon', at: 'L2.t0', to: WT(L8, 2, 'Its door') }, { k: 'door', at: WT(L8, 2, 'swung open') },
      { k: 'boom', at: 'L2.t1+0.5' },
      { k: 'curtain', at: WT(L8, 3, 'The curtain'), to: 'L3.t1+0.8' },
      { k: 'form', at: 'L3.t1+0.2', to: 'L4.t0+0.6' },
      { k: 'hounds', at: 'L5.t0', to: WT(L8, 5, 'opened its eyes') }, { k: 'eyes', at: WT(L8, 5, 'opened its eyes', 0.3) },
      { k: 'cut', n: 0, at: WT(L8, 6, 'cut off', 0.2) }, { k: 'grow', at: WT(L8, 6, 'grew another', -0.1) },
      { k: 'cut', n: 1, at: WT(L8, 7, 'in two', -0.2) },
      { k: 'chop', at: WT(L8, 8, 'chopped'), to: WT(L8, 8, 'The pieces') }, { k: 'regroup', at: WT(L8, 8, 'backed away'), to: WT(L8, 8, 'and the beast') },
      { k: 'yawn', at: WT(L8, 8, 'yawning') },
      { k: 'fire', at: WT(L8, 9, 'fired', 0.2) }, { k: 'nose', at: WT(L8, 9, 'thumbed', -0.2), to: 'L9.t1+0.6' },
      { k: 'leap', at: WT(L8, 10, 'it leapt'), to: WT(L8, 10, 'three policemen', 0.4) },
      { k: 'whistle', at: 'L11.t0-0.5' },
      { k: 'cuff', at: 'L11.t1+0.2' }, { k: 'gig', at: WT(L8, 12, 'They packed'), to: WT(L8, 12, 'and it whirled') },
      { k: 'away', at: WT(L8, 12, 'and it whirled'), to: 'end' }] },
  { shot: 'sentence', room: 'court', tail: 1.4, lines: L9,
    cues: [{ k: 'enter', at: 'L3.t0', to: 'L3.t1' },
      { k: 'hand', at: WT(L9, 5, 'He handed') }, { k: 'dust', at: WT(L9, 5, 'fell into', 0.1), to: WT(L9, 5, 'It carried') },
      { k: 'letter', at: WT(L9, 5, 'It carried', -0.1), to: 'L5.t1' },
      { k: 'unchain', at: 'L6.t1+0.4' }] },
  { shot: 'ransom', room: 'port', tail: 0.8, lines: L10,
    cues: [{ k: 'bath', at: 0.3, to: WT(L10, 0, 'they read') },
      { k: 'notebook', at: WT(L10, 0, 'they read', -0.2), to: 'L2.t1+0.3' },
      { k: 'brain', at: 'L3.t0-0.4', to: 'L3.t1' },
      { k: 'subset', at: WT(L10, 3, 'a police force', -0.2) },
      { k: 'port', at: 'L4.t0-0.4' },
      { k: 'tooth', at: WT(L10, 4, 'took a tooth') }, { k: 'radio', at: WT(L10, 4, 'It was a radio'), to: 'L5.t0' },
      { k: 'storm', at: 'L5.t0', to: WT(L10, 5, 'There stood', -0.1) }] },
  { shot: 'rhyme', room: 'port', tail: 2.2, lines: L11,
    cues: [{ k: 'tooth', at: WT(L11, 1, 'took out') },
      { k: 'switch', at: 'L3.t0-0.1' },
      { k: 'dissolve', at: 'L3.t1+0.2', to: WT(L11, 4, 'A hot wind') },
      { k: 'wind', at: WT(L11, 4, 'A hot wind'), to: WT(L11, 4, 'and there was') },
      { k: 'ash', at: WT(L11, 4, 'and there was') },
      { k: 'cage', at: 'L6.t1-0.4', to: 'end' }] },
  { shot: 'end', d: 7.5 },
];
if (typeof module !== 'undefined') module.exports = { SCRIPT, CAST };
