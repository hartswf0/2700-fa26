/* The Sixth Sally, or The Demon of the Second Kind: the score. Eighth in the lineage.
   The whole film is printed on one long paper tape. Each shot is a panel on the tape, and
   between shots the tape slides past the camera to the next panel. The tape's edges carry
   a running line of small print, the way the Demon's tape does. At the end the camera pulls
   back and the tape turns out to be the one coming out of the Demon's barrel and burying
   Pugg: the film you have watched is a section of it, as the story says his fate is.
   The sound treats meaning as a filter on noise. Air is heard as random clicks; whenever the
   atoms happen to form something, a short pitched tone sounds. The Demon keeps only the
   tones. In the flood, the facts on the tape are read aloud by many voices at once.
   Times may be numbers or 'L2.t1+0.5', 'end-1'. Lines paraphrase Lem ("The Sixth Sally", The Cyberiad). */
const CAST = {
  N: { name: 'Narrator', voice: 'bf_emma', speed: 0.92 },
  T: { name: 'Trurl', voice: 'bm_lewis', speed: 1.02 },
  K: { name: 'Klapaucius', voice: 'bm_george', speed: 0.9 },
  P: { name: 'Pugg', voice: 'am_onyx', speed: 0.86, fx: 'giant' },
};
/* what the tape says, in the flood. Read aloud by many voices, overlapping more and more. */
const FACTS = [
  'how exactly the Harlebardonian wrigglers wriggle',
  'that the daughter of King Petrolius of Labondia is named Humpinella',
  'how many electron shells thermionolium would have, if it existed',
  'the number of books on stamp collecting to be published in the year seventy thousand',
  'how to tell a bindlesnurk from an ordinary trundlespiff',
  'why fan-tailed fleas will not eat moss',
  'how to play Fratcher-My-Pliss, and win',
  'the drinking songs of the Quaidacabondish',
  'the sizes of bedroom slippers on the continent of Cob, with pompons and without',
  'six ways to cook cream of wheat',
  'the names of all the citizens of Foofaraw Junction beginning with M',
  'what unmarried whales think about, getting on in years',
  'how to mend an old gunny sack',
  'all the words that rhyme with spinach',
  'the difference between fiddle and faddle',
  'who plays the eight-tone autocomb',
  'a poll on the taste of beer mixed with mushroom syrup',
  'how many bruises one can have at a single time',
];
const FACT_VOICES = ['af_bella', 'am_adam', 'bf_alice', 'am_eric', 'af_nicole', 'bm_daniel', 'bf_isabella', 'am_liam', 'af_river', 'bm_fable', 'af_sarah', 'am_puck', 'bf_lily', 'am_michael', 'af_sky', 'am_echo', 'af_kore', 'bm_lewis'];
const SCRIPT = [
  { shot: 'book', room: 'shop', tail: 1.6,
    cues: [{ k: 'page', at: 'L1.t0-0.4', to: 'L1.t1+0.6' }],
    lines: [
      { who: 'N', pre: 2.6, say: 'Trurl bought an old book from a passing peddler. It described a tunnel through a burning star, and beyond it a black waste called the Shroud, where a nameless monster lies in wait for caravans.' },
      { who: 'T', pre: 0.8, say: 'Look. There is even an engraving of it, eating two ships.' },
      { who: 'K', pre: 0.8, say: 'I could draw you a dragon right now, with a thousand suns for each eye. Would the drawing prove that it exists?', line: true },
      { who: 'K', pre: 0.6, say: 'Your Shroud is a cosmic dump. It is dark because of the garbage.' },
      { who: 'T', pre: 0.8, say: 'We will go there. Then you will see what is true in this book, and what is not.' },
    ] },
  { shot: 'title', d: 6 },
  { shot: 'wastes', room: 'space', tail: 4.2,
    cues: [{ k: 'sand', at: 'L0.t0' }, { k: 'lurch', at: 'L1.t1+0.6' }, { k: 'crunch', at: 'L1.t1+2.4' }, { k: 'bang', at: 'L2.t1+0.4', to: 'L2.t1+3.6' }],
    lines: [
      { who: 'N', pre: 1.6, say: 'The Wastes were not a shroud. They were a junkyard. Old stars, cinders, cans and wrecks, all clattering together.' },
      { who: 'N', pre: 1.0, say: 'Sand pattered on the bow. Then the ship lurched, and everything went flying.' },
      { who: 'N', pre: 3.4, say: 'It stuck nose first in something soft. Outside it was pitch black, and someone was banging on the hull.' },
    ] },
  { shot: 'face', room: 'ship', tail: 3.6,
    cues: [{ k: 'hatch', at: 0.8 }, { k: 'whistle', at: 'L5.t1+0.5', to: 'L5.t1+3.0' }],
    lines: [
      { who: 'N', pre: 3.2, say: 'A face filled the hatch. It was covered with bulging eyes. The nose was a saw, and the jaw was an iron hook. The eyes looked everything over, as if pricing it.' },
      { who: 'T', pre: 1.0, say: 'Well? What do you want, you unwashed mug? We have no gold and no silver. Take that face away!' },
      { who: 'P', pre: 1.2, say: 'I have no use for gold or silver. Speak to me delicately. I am a pirate with a Ph.D.' },
      { who: 'P', pre: 0.6, say: 'I rob in a modern and scientific manner. I collect facts. Genuine truths. Information of value.' },
      { who: 'P', pre: 0.6, say: 'Hand it over, or I whistle. One. Two. Three.' },
      { who: 'P', pre: 0.5, say: 'Four. Five.' },
    ] },
  { shot: 'paw', room: 'ship', tail: 1.0,
    cues: [{ k: 'paw', at: 'L0.t1+0.3', to: 'L0.t1+5.0' }, { k: 'poker', at: 'L0.t1+5.4', to: 'L0.t1+7.0' }],
    lines: [
      { who: 'P', pre: 1.2, say: 'You don’t like my face? Maybe you will like my hand.' },
      { who: 'P', pre: 8.0, say: 'Come to terms now, or I will put you at the bottom of my bin, under the rocks, and let you rust.' },
      { who: 'K', pre: 0.6, say: 'What exactly does Your Doctoral Diplomahood want?' },
      { who: 'P', pre: 0.8, say: 'Everything is information. I want all of it, as long as it is true. For false information, as for false coin, I give a good beating.' },
      { who: 'K', pre: 0.8, say: 'He could keep us here an eon before we told him everything we know.' },
    ] },
  { shot: 'gold', room: 'ship', tail: 1.4,
    cues: [{ k: 'knead', at: 'L1.t1+0.2', to: 'L1.t1+4.6' }, { k: 'nugget', at: 'L1.t1+4.8' }],
    lines: [
      { who: 'T', pre: 1.2, say: 'Then take the best fact we have. How to make gold out of hydrogen.' },
      { who: 'T', pre: 0.6, say: 'One hundred and ninety-six atoms. Shell the electrons, knead the protons, sprinkle the electrons back on. Watch.' },
      { who: 'P', pre: 5.6, say: 'Yes, that is gold.' },
      { who: 'T', pre: 0.5, say: 'You could turn the whole universe into gold!' },
      { who: 'P', pre: 0.8, say: 'If the universe were gold, gold would be worthless.', line: true },
      { who: 'T', pre: 0.8, say: 'Then what do you want to know?' },
      { who: 'P', pre: 0.6, say: 'Everything!' },
    ] },
  { shot: 'cellar', room: 'cellar', tail: 1.2,
    cues: [{ k: 'walk', at: 0, to: 'L0.t1+0.6' }, { k: 'gas', at: 'L2.t0-0.3', to: 'end' }, { k: 'form', at: 'L3.t0+2.2' }, { k: 'form', at: 'L4.t0+1.4' }, { k: 'form', at: 'L4.t0+4.0' }, { k: 'pounce', at: 'L5.t0+2.4' }],
    lines: [
      { who: 'N', pre: 1.6, say: 'Trurl promised him a Demon of the Second Kind, if he swore to let them go. Pugg swore. He led them down through his cellars, past sacks of stolen facts tied with string, and a great catalog chained to the rock, beginning with A.' },
      { who: 'P', pre: 0.8, say: 'There is air down here. It is not very clean.' },
      { who: 'T', pre: 0.8, say: 'It does not matter. Air is atoms, jumping this way and that, colliding billions of times a second.' },
      { who: 'T', pre: 0.4, say: 'They jump at random. But there are so many that now and then, by accident, they make something with meaning.' },
      { who: 'T', pre: 0.4, say: 'As if you fired at a wall blindfold, and the holes spelled a letter. For every sentence of sense there are thousands of nonsense, and both fly apart at once.' },
      { who: 'T', pre: 0.6, say: 'So the whole trick is a selector, that keeps only what means something. That is the Demon of the Second Kind.', line: true },
      { who: 'P', pre: 0.8, say: 'And what is the First Kind?' },
      { who: 'K', pre: 0.5, say: 'An ordinary demon. It lets the fast atoms out and keeps the slow ones in. It has nothing to do with information.' },
    ] },
  { shot: 'barrel', room: 'cellar', tail: 1.0,
    cues: [{ k: 'barrel', at: 'L0.t0' }, { k: 'demon', at: 'L1.t0+1.2' }, { k: 'pen', at: 'L1.t1+0.4', to: 'end' }],
    lines: [
      { who: 'N', pre: 1.0, say: 'Pugg found an old iron barrel, and made a tiny hole in it. The air inside was so foul that one’s nose wanted to hide.' },
      { who: 'N', pre: 0.8, say: 'Trurl set the Demon astride the hole, a mote of a mite with a diamond pen, and threaded the paper tape under it.' },
      { who: 'N', pre: 3.4, say: 'The pen began to scratch, like a telegraph, only a million times faster. Pugg sat down by the barrel, lifted the tape to his hundred eyes, and read.' },
    ] },
  { shot: 'escape', room: 'space', tail: 1.2,
    cues: [{ k: 'pull', at: 'L0.t1+0.6' }, { k: 'pull', at: 'L0.t1+1.7' }, { k: 'pull', at: 'L0.t1+2.8' }, { k: 'launch', at: 'L0.t1+3.2' }],
    lines: [
      { who: 'N', pre: 1.4, say: 'He did not notice the two constructors leave. They pulled the ship once, twice, and the third time it came free.' },
      { who: 'N', pre: 4.6, say: 'They knew the Demon would work. It would work too well.' },
    ] },
  { shot: 'flood', room: 'cellar', d: 44, cues: [{ k: 'pen', at: 0, to: 44 }, { k: 'facts', at: 3.0, to: 40 }, { k: 'enough', at: 27.4 }],
    lines: [
      { who: 'N', at: 1.0, say: 'He read about everything.' },
      { who: 'N', at: 19.8, say: 'All of it was true. All of it meant something. All of it was useless.', line: true },
      { who: 'P', at: 27.4, say: 'Enough! I have had enough!' },
      { who: 'N', at: 31.0, say: 'But the tape had wrapped him in its paper miles, and he had too many eyes not to keep reading.' },
    ] },
  { shot: 'today', room: 'cellar', d: 34, cues: [{ k: 'pen', at: 0, to: 34 }, { k: 'pull', at: 1.0, to: 22 }],
    lines: [
      { who: 'N', at: 2.0, say: 'He sits there to this day, at the bottom of his rubbish, under a mountain of paper, and the diamond pen still flickers.' },
      { who: 'N', at: 10.6, say: 'He learns about rickshaws, rents and roaches, and about his own fate, which has been told here. That is on the tape too.', line: true },
      { who: 'N', at: 22.8, say: 'There is no hope for him. Unless the paper runs out.' },
    ] },
  { shot: 'end', d: 7 },
];
if (typeof module !== 'undefined') module.exports = { SCRIPT, CAST, FACTS, FACT_VOICES };
