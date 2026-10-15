/* Prince Ferrix and the Princess Crystal: the score. Seventh in the lineage.
   The film is a diptych. The left half is the outside: what the princess sees, a steel prince
   plastered with mud and chalk until he looks like a paleface. The right half is the inside:
   the same body cut open, with the hidden parts that make the act work, a bladder of cinnabar,
   a bellows of dungeon air, tubes of water by the eyes, and the vizier's prompt.
   The sound is split the same way: the left channel is what she hears, the right channel is
   the machinery behind it. Every answer Ferrix gives is whispered to him first on the right.
   The princess only ever checks the outside. When the clay falls off in the duel, the inside
   and the outside become the same picture, and the two halves close into one frame.
   Curves: split (0 = one frame, 1 = full diptych) and clay (0 = bare steel, 1 = fully plastered),
   [[time, value], ...], linear between keys. Times may be numbers or 'L2.t1+0.5', 'end-1'.
   Lines paraphrase Lem ("Prince Ferrix and the Princess Crystal", The Cyberiad). */
const CAST = {
  N: { name: 'Narrator', voice: 'bf_emma', speed: 0.92 },
  F: { name: 'Ferrix', voice: 'am_michael', speed: 0.98 },
  A: { name: 'The King', voice: 'am_fenrir', speed: 0.84 },
  P: { name: 'Polyphase', voice: 'bm_daniel', speed: 0.9 },
  C: { name: 'Princess Crystal', voice: 'bf_isabella', speed: 0.94, fx: 'glass' },
  Y: { name: 'Cyberhazy', voice: 'am_echo', speed: 0.96 },
  Z: { name: 'The paleface', voice: 'am_onyx', speed: 0.78, fx: 'wet' },
};
const SCRIPT = [
  { shot: 'father', room: 'hall', tail: 1.8,
    cues: [{ k: 'heads', at: 'L4.t0' }],
    curve: { split: [[0, 0]], clay: [[0, 0]] },
    lines: [
      { who: 'N', pre: 2.4, say: 'Prince Ferrix loved the Princess Crystal, whose face rang like a bell. When she walked past, plain iron threw sparks.' },
      { who: 'A', pre: 1.0, say: 'Give it up, my son. She has sworn to marry no one but a paleface.' },
      { who: 'F', pre: 0.6, say: 'A paleface? What is that?' },
      { who: 'A', pre: 0.8, say: 'A creature of slush and splashes. They began as mold in the sea, and ate each other, and stood up on scaffolds of chalk, and at last they built machines. Our first father set us free from them.' },
      { who: 'A', pre: 1.0, say: 'She tests every suitor. Every one who is caught lying, she beheads.' },
      { who: 'F', pre: 1.6, say: 'Then I will be a paleface.', line: true },
    ] },
  { shot: 'title', d: 5.5 },
  { shot: 'lab', room: 'lab', tail: 1.6,
    cues: [{ k: 'smear', at: 'L0.t1+0.4', to: 'L2.t1+0.4' }, { k: 'chalk', at: 'L3.t0+1.6', to: 'L3.t1' }, { k: 'rust', at: 'L3.t1+0.3' },
      { k: 'mirror', at: 'L4.t0-0.2', to: 'L6.t1' }, { k: 'bladder', at: 'L7.t0+2.2' }, { k: 'bellows', at: 'L7.t0+4.4' }, { k: 'tubes', at: 'L7.t0+6.8' }],
    curve: { split: [[0, 0], ['L6.t1+0.4', 0], ['L7.t0+1.2', 1], ['end', 1]],
      clay: [[0, 0], ['L0.t1+0.4', 0], ['L2.t1+0.4', 0.45], ['L3.t0+1.6', 0.45], ['L3.t1', 0.92], ['L3.t1+0.3', 1], ['end', 1]] },
    lines: [
      { who: 'N', pre: 1.0, say: 'The vizier Polyphase went into his laboratory and brewed things that were gluey and dripping.' },
      { who: 'P', pre: 2.0, say: 'Shall I go on, Prince?' },
      { who: 'F', pre: 0.6, say: 'Do what you must.' },
      { who: 'N', pre: 1.2, say: 'Grease and old crud over the steel. Over that, a paste of chalk and powdered rubies. On top of the head, a clump of rust.' },
      { who: 'P', pre: 1.2, say: 'Behold.' },
      { who: 'F', pre: 1.4, say: 'Get this abomination off me! She will hate me on sight!' },
      { who: 'P', pre: 0.8, say: 'No, Prince. Her madness is that ugliness is beautiful, and beauty ugly.', line: true },
      { who: 'P', pre: 1.6, say: 'Now the inside. Under your cloak, cinnabar. In your chest, a bellows of dungeon air. By your eyes, little tubes of water.' },
      { who: 'P', pre: 0.8, say: 'When she asks what it is, you answer. Blood. Breath. Tears.' },
    ] },
  { shot: 'market', room: 'square', tail: 1.4,
    curve: { split: [[0, 1], ['end', 1]], clay: [[0, 1]] },
    lines: [
      { who: 'N', pre: 1.0, say: 'Polyphase dressed as a portly merchant, with the books on paleface customs stuffed inside his robe. He locked the prince in a cage and cried him for sale.' },
      { who: 'P', pre: 0.6, say: 'A young paleface, from far away! A real one!' },
      { who: 'C', pre: 1.2, say: 'A hoax. But no one knows palefaces as I do. Bring him to me.' },
    ] },
  { shot: 'tests', room: 'palace', tail: 1.4,
    cues: [{ k: 'sword', at: 'L0.t1+0.6', to: 'L0.t1+3.0' }, { k: 'bladder', at: 'L0.t1+2.6' }, { k: 'whisper', at: 'L1.t1+0.2', say: 'Blood.' },
      { k: 'enter', at: 'L2.t1+0.4', to: 'L2.t1+3.2' }, { k: 'bellows', at: 'L2.t1+3.4' }, { k: 'whisper', at: 'L3.t1+0.2', say: 'Breath.' },
      { k: 'bow', at: 'L5.t1+0.4' }, { k: 'tubes', at: 'L5.t1+1.0' }, { k: 'whisper', at: 'L6.t1+0.2', say: 'Tears.' }],
    curve: { split: [[0, 1]], clay: [[0, 1]] },
    lines: [
      { who: 'C', pre: 1.4, say: 'You worked hard, old man, plastering this scarecrow with mud and chalk. When I expose it, you will both lose your heads.' },
      { who: 'C', pre: 3.4, say: 'What is that?' },
      { who: 'F', pre: 1.0, say: 'Blood!' },
      { who: 'C', pre: 4.6, say: 'What is that?' },
      { who: 'F', pre: 1.0, say: 'Breath!' },
      { who: 'C', pre: 1.2, say: 'You are a clever craftsman. But you have lied to me, and you will die, and your scarecrow with you.' },
      { who: 'C', pre: 3.0, say: 'What is that?' },
      { who: 'F', pre: 1.0, say: 'Tears!', line: true },
    ] },
  { shot: 'questions', room: 'palace', tail: 1.4,
    cues: [{ k: 'book', at: 'L0.t1+0.1', to: 'L1.t1' }, { k: 'book', at: 'L2.t1+0.1', to: 'L3.t1' }, { k: 'book', at: 'L4.t1+0.1', to: 'L5.t1' },
      { k: 'hand', at: 'L7.t1+0.4', to: 'L7.t1+1.6' }, { k: 'whisper', at: 'L7.t1+0.6', say: 'Now.' }, { k: 'cry', at: 'L7.t1+1.4' }, { k: 'whisper', at: 'L8.t1+0.2', say: 'Pain.' }],
    curve: { split: [[0, 1]], clay: [[0, 1]] },
    lines: [
      { who: 'C', pre: 1.2, say: 'Tell me, Myamlak. What do your brothers do all day?' },
      { who: 'F', pre: 1.6, say: 'In the morning they pour clear water over themselves, and into themselves, for pleasure. When something grieves them, salt water runs from their eyes. When something cheers them, they shake and hiccup, and their eyes stay dry. The wet kind we call weeping. The dry kind, laughter.' },
      { who: 'C', pre: 1.0, say: 'And where do you get the energy to slosh about?' },
      { who: 'F', pre: 1.6, say: 'Other palefaces walk on four legs. We perforate them, bake them, and put them inside ourselves, through a hole called the mouth. We call it gastronomy. It has nothing to do with astronomy.' },
      { who: 'C', pre: 1.0, say: 'So you make yourselves into coffins for your brothers?' },
      { who: 'F', pre: 1.6, say: 'It is not a game, Highness. Life lives on life. We have only made the necessity into an art.', line: true },
      { who: 'C', pre: 1.4, say: 'It sounds as if it makes sense, and it does not, not at all. You are a paleface.' },
      { who: 'C', pre: 0.8, say: 'One last test. Give me your hand.' },
      { who: 'C', pre: 2.2, say: 'Why did you cry out?' },
      { who: 'F', pre: 1.0, say: 'From the pain!' },
    ] },
  { shot: 'rival', room: 'palace', tail: 1.2,
    cues: [{ k: 'land', at: 0.6 }, { k: 'fog', at: 'L2.t1+0.2', to: 'L3.t1' }],
    curve: { split: [[0, 1]], clay: [[0, 1]] },
    lines: [
      { who: 'N', pre: 2.4, say: 'Then the Cybercount Cyberhazy landed, back from the stars, with a paleface of his own.' },
      { who: 'Y', pre: 0.8, say: 'Highness, you have been deceived. Your Myamlak is no paleface. Here is the real one.' },
      { who: 'Z', pre: 1.4, say: 'Me paleface!', line: true },
      { who: 'N', pre: 1.2, say: 'When it spoke, a pink worm seemed to crawl in its mouth. Its breath fogged the mirrors, and nearby iron rusted. Now the princess saw what a paleface was. She was too proud to say so.' },
      { who: 'C', pre: 0.8, say: 'Let them fight. The winner has my hand.' },
      { who: 'F', pre: 0.8, say: 'If I crush it, the clay will fall off me, and the steel will show.' },
      { who: 'P', pre: 0.5, say: 'Then don’t attack. Only defend.' },
    ] },
  { shot: 'duel', room: 'court', d: 27,
    cues: [{ k: 'circle', at: 1.0, to: 6.4 }, { k: 'swing', at: 6.6 }, { k: 'shatter', at: 6.9 }, { k: 'fall', at: 7.3 }, { k: 'splash', at: 7.6 },
      { k: 'slip', at: 10.0, to: 13.6 }],
    curve: { split: [[0, 1], [10.0, 1], [13.6, 0], ['end', 0]], clay: [[0, 1], [6.9, 1], [7.0, 0.85], [10.0, 0.85], [13.6, 0], ['end', 0]] },
    lines: [
      { who: 'N', at: 15.0, say: 'He stood there with no disguise, waiting for his sentence. In her crystal face he saw admiration.', line: true },
      { who: 'N', at: 22.4, say: 'Her heart had changed.' },
    ] },
  { shot: 'museum', room: 'museum', tail: 3.4,
    curve: { split: [[0, 0], ['L0.t1+0.6', 0], ['L1.t0', 1], ['L1.t1+0.6', 1], ['L2.t1', 0], ['end', 0]], clay: [[0, 0]] },
    lines: [
      { who: 'N', pre: 1.6, say: 'They married, and reigned long and well. The paleface was stuffed and put in the royal museum, where it stands to this day, a scarecrow thinly overgrown with hair.' },
      { who: 'N', pre: 1.8, say: 'Some say there never were any palefaces. Perhaps. There are fables enough in this world.' },
      { who: 'N', pre: 1.4, say: 'But even if the story is not true, there is a grain of sense in it.', line: true },
    ] },
  { shot: 'end', d: 7, curve: { split: [[0, 0]], clay: [[0, 0]] } },
];
if (typeof module !== 'undefined') module.exports = { SCRIPT, CAST };
