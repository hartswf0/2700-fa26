/* The Three Storytelling Machines of King Genius: the score.
   One continuous camera. Each chapter names the stack of nested frames the camera
   travels through; the picture and the sound both read the stack and the depth.
   Lines paraphrase Lem ("Tale of the Three Storytelling Machines of King Genius", The Cyberiad). */
const CAST = {
  GEN: { name: 'King Genius', voice: 'am_fenrir', speed: 0.84 },
  TRU: { name: 'Trurl', voice: 'bm_lewis', speed: 1.0 },
  W: { name: 'The white machine', voice: 'bf_alice', speed: 0.94, fx: 'machine' },
  Z: { name: 'Zipperupus', voice: 'am_eric', speed: 0.96 },
  G: { name: 'The gatekeeper', voice: 'bm_george', speed: 0.84 },
  B: { name: 'The black machine', voice: 'bm_fable', speed: 0.9, fx: 'machine' },
  M: { name: 'Mymosh', voice: 'am_puck', speed: 0.9, fx: 'tin' },
};
const SCRIPT = [
  { ch: 'cave1', stack: ['cave:white', 'vestibule:cabinet', 'dream'], room: 'cave', tail: 3.2, lines: [
    { who: 'GEN', pre: 3.2, say: 'There are two wisdoms, constructor. One acts, and one refrains. The greater refrains, for no mind can see where its acts will end.' },
    { who: 'TRU', pre: 1.1, say: 'To refrain from acting, you must first be able to act. Inaction is certain. That is all it has to recommend it.', line: true },
    { who: 'GEN', pre: 1.6, say: 'Then let your machines act. The white one first.' },
    { who: 'W', pre: 1.6, say: 'This is a story Trurl once told a king who wanted stories without end.' },
  ] },
  { ch: 'vestibule', stack: ['cave:white', 'vestibule:cabinet', 'dream'], room: 'vestibule', tail: 3.6, lines: [
    { who: 'W', pre: 0.8, say: 'King Zipperupus had a courtier who wished him dead. The courtier brought him cabinets of dreams that dream themselves.' },
    { who: 'W', pre: 0.7, say: 'Whoever plugs into one cannot tell the dream from the waking world.' },
    { who: 'Z', pre: 1.2, say: 'Then let me dream.' },
  ] },
  { ch: 'dream', stack: ['cave:white', 'vestibule:cabinet', 'dream'], room: 'dream', tail: 0.6, cues: [{ k: 'whack' }], lines: [
    { who: 'Z', pre: 2.0, say: 'Stand aside. Let me pass.' },
    { who: 'G', pre: 0.6, say: 'Ten ducats.' },
    { who: 'Z', pre: 0.5, say: 'Ten ducats, for one embrace?' },
    { who: 'G', pre: 0.5, say: 'Not a ducat less.' },
    { who: 'Z', pre: 0.4, say: 'Then you get nothing!' },
  ] },
  { ch: 'loop', stack: ['cave:white', 'vestibule:door', 'vestibule:door', 'vestibule:door', 'vestibule:door', 'vestibule:door', 'vestibule:door', 'vestibule:door'], room: 'vestibule', tail: 9.0, lines: [
    { who: 'Z', pre: 2.0, say: 'Is this a dream, or am I awake?', line: true },
    { who: 'W', pre: 6.4, say: 'Every exit led him back to the same room.' },
  ] },
  { ch: 'cave2', stack: ['cave:black', 'galaxy', 'nebula', 'cluster', 'system', 'planet', 'moon', 'dump', 'gozmos'], room: 'cave', tail: 1.4, cues: [{ k: 'snap' }], lines: [
    { who: 'GEN', pre: 1.6, say: 'Clever. Have you nothing darker?' },
    { who: 'TRU', pre: 0.8, say: 'The black one, Your Majesty.' },
  ] },
  { ch: 'powers', stack: ['cave:black', 'galaxy', 'nebula', 'cluster', 'system', 'planet', 'moon', 'dump', 'gozmos'], room: 'space', tail: 1.6, lines: [
    { who: 'B', pre: 1.4, say: 'In the Constellation of the Wringer there was a spiral galaxy,' },
    { who: 'B', pre: 0.5, say: 'and in the galaxy, a black nebula,' },
    { who: 'B', pre: 0.5, say: 'and in the nebula, five clusters,' },
    { who: 'B', pre: 0.5, say: 'and in the fifth cluster, a lilac sun, very old and very dim,' },
    { who: 'B', pre: 0.5, say: 'and its third planet had two moons,' },
    { who: 'B', pre: 0.5, say: 'and on the second moon there was a garbage dump, where nothing ever happened but garbage.' },
  ] },
  { ch: 'dump', stack: ['cave:black', 'galaxy', 'nebula', 'cluster', 'system', 'planet', 'moon', 'dump', 'gozmos'], room: 'dump', tail: 3.2, cues: [{ k: 'jug' }, { k: 'assemble' }, { k: 'fall' }, { k: 'shoe' }], lines: [
    { who: 'B', pre: 0.8, say: 'One day Trurl, flying past, threw an old cracked jug out of his window.' },
    { who: 'B', pre: 2.6, say: 'It struck a can, the can bent round a wire, a current ran, and in the middle of the dump, by accident, a mind began.' },
    { who: 'M', pre: 3.8, say: 'Look at me. I am perfect. How good must be the one who made me!' },
    { who: 'B', pre: 3.4, say: 'On the seventh step he tripped, fell on his head, and lay in the garbage for three hundred thousand years.' },
    { who: 'M', pre: 4.0, say: 'Apparently... I am.' },
    { who: 'B', pre: 1.0, say: 'His eyes had rusted away. All he could do now was think.' },
    { who: 'M', pre: 1.6, say: 'If there is nothing outside me, I will think a world inside.', line: true },
  ] },
  { ch: 'gozmos', stack: ['cave:black', 'galaxy', 'nebula', 'cluster', 'system', 'planet', 'moon', 'dump', 'gozmos'], room: 'gozmos', tail: 5.0, lines: [
    { who: 'B', pre: 2.4, say: 'He called it the Gozmos. He gave it kind laws, where nothing ever had to end, and he felt responsible for everyone in it.' },
    { who: 'B', pre: 1.4, say: 'Last of all he imagined two travelers, Baucis and Ondragor, walking hand in hand among his dark suns.' },
  ] },
  { ch: 'shard', stack: ['cave:black', 'galaxy', 'nebula', 'cluster', 'system', 'planet', 'moon', 'dump', 'gozmos'], room: 'dump', tail: 4.0, cues: [{ k: 'crack' }], lines: [
    { who: 'B', pre: 1.2, say: 'A shard of that same jug drifted across the puddle toward his head.' },
    { who: 'B', pre: 7.2, say: 'And those who had made him never learned that he was gone.' },
  ] },
  { ch: 'cave3', stack: ['cave:loop', 'cave:loop', 'cave:loop', 'cave:loop', 'cave:loop'], room: 'cave', tail: 6.0, lines: [
    { who: 'GEN', pre: 3.6, say: 'I will pay you, constructor. I give you your life. Go, and keep hiding truths too bitter for this world inside fairy tales.' },
    { who: 'TRU', pre: 1.4, say: 'My life? Was that to have been my payment?', line: true },
    { who: 'GEN', pre: 2.2, say: 'Tell me another.' },
  ] },
  { ch: 'end', d: 6 },
];
/* camera depth through the stack: [time, depth]. time is seconds into the chapter, or
   'L2.t0+0.5' (line 2 start plus 0.5 s), 'L2.t1' (line 2 end), 'end-1.5'. Depth n means the
   camera is exactly at frame n of the stack; 2.5 is halfway through frame 2's portal. */
const CAM = {
  cave1: [[0, 0], ['L3.t0', 0], ['end', 1]],
  vestibule: [[0, 1], ['L2.t1+0.4', 1], ['end', 2]],
  dream: [[0, 2], ['end', 2]],
  loop: [[0, 1], ['L0.t1+0.5', 1], ['L1.t0-0.3', 6.2], ['L1.t1+1.2', 6.4], ['end', 0]],
  cave2: [[0, 0], ['L1.t1+0.2', 0], ['end', 0.45]],
  powers: [[0, 0.45], ['L0.t0+0.2', 0.45], ['L0.t1', 1], ['L1.t1', 2], ['L2.t1', 3], ['L3.t1', 4], ['L4.t1', 5], ['L5.t0+1.5', 6], ['end', 7]],
  dump: [[0, 7], ['L6.t1+0.2', 7], ['end', 8]],
  gozmos: [[0, 8], ['end', 8]],
  shard: [[0, 8], [1.2, 7.3], ['L0.t1+3.6', 7.42], ['L0.t1+3.6', 8], ['L1.t0-0.4', 8], ['end', 0]],
  cave3: [[0, 0], ['L2.t1+0.6', 0], ['end', 2.6]],
  end: [[0, 0], ['end', 0]],
};
if (typeof module !== 'undefined') module.exports = { SCRIPT, CAST, CAM };
