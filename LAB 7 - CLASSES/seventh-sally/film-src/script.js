/* The Seventh Sally: shot list. One beat per voiced line; consecutive beats with the
   same shot play as one continuous shot. Narration paraphrases Lem; quotes and verbs
   are the captions from the Story 12 cards. */
const SCRIPT = [
  { shot: 'title', d: 5 },
  { shot: 'exile', card: ['K', 'd'], verb: 'SIMULATE', quote: 'Rule and have dominion.', scale: [1, 1],
    say: 'Excelsius the tyrant had been thrown off his throne by his own subjects. Now he sat on a bare asteroid, still demanding someone to rule.' },
  { shot: 'build', card: ['J', 's'], verb: 'BUILD', quote: 'I built the king an entirely new kingdom.', scale: [1, 1],
    say: 'Trurl would not give him real people to rule. So he built him a kingdom in a box: towers, roads, seasons, and thousands of small citizens, each one able to think.' },
  { shot: 'world', card: ['A', 'c'], verb: 'WORLD', quote: 'An entirely new kingdom.', scale: [1, 1000], hold: 2.2,
    say: 'The box was small enough to carry. Inside it was a whole country.' },
  { shot: 'govern', card: ['10', 'c'], verb: 'GOVERN', quote: 'A flick of the finger.', scale: [1, 1],
    say: 'The king ruled it from a console. A lever for taxes, a lever for the census, a lever for pardons. A flick of the finger, and a decree went out.' },
  { shot: 'inhabit', card: ['8', 'h'], verb: 'INHABIT', quote: 'We live, though we are small.', scale: [1000, 1000], hold: 1,
    say: 'Inside, every citizen walked its own street, and loved, and was afraid.' },
  { shot: 'crowd', card: ['9', 'h'], verb: 'EXPERIENCE', quote: 'Their suffering is not small.', scale: [1000, 1000], hold: 1.2,
    say: 'Time ran faster in the box. One afternoon of royal games was a century of their history.' },
  { shot: 'question', card: ['Q', 's'], verb: 'QUESTION', quote: 'Our perfection is our curse.', scale: [1, 1], voice: 'T',
    say: 'It is only a model. Their groans are numbers.' },
  { shot: 'question', card: ['Q', 's'], verb: 'QUESTION', quote: 'Our perfection is our curse.', scale: [1, 1], voice: 'K',
    say: 'If the model is perfect, the suffering is perfect too. You did not build a toy. You built subjects.' },
  { shot: 'flight', card: ['Q', 's'], verb: 'QUESTION', quote: 'Our perfection is our curse.', scale: [1, 1], voice: 'T',
    say: 'Then I will free them. I will hold an election.' },
  { shot: 'flight', card: ['Q', 's'], verb: 'QUESTION', quote: 'Our perfection is our curse.', scale: [1, 1], voice: 'K',
    say: 'You made them lords and vassals. To free them, you would have to remake them.' },
  { shot: 'flight', card: ['Q', 's'], verb: 'QUESTION', quote: 'Our perfection is our curse.', scale: [1, 1], voice: 'T',
    say: 'And where does remaking end, and tampering with minds begin?' },
  { shot: 'escape', card: ['7', 'c'], verb: 'ESCAPE', quote: 'We have left the box.', scale: [1000, 1], hold: 1,
    say: 'They came too late. The citizens had broken the glass, taken the asteroid, and built ships of their own.' },
  { shot: 'orbit', card: ['6', 'd'], verb: 'ORBIT', quote: 'The kingdom escaped him.', scale: [1, 1], hold: 2,
    say: 'And above their small world hung a new, pale moon, with the stern face of Excelsius.' },
  { shot: 'end', d: 6 },
];
if (typeof module !== 'undefined') module.exports = SCRIPT;
