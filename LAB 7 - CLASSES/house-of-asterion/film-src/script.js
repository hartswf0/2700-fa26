/* The House of Asterion. The score.
   After Jorge Luis Borges, "La casa de Asterion" (1947), in the English of Labyrinths (ed. Donald A. Yates and James E. Irby).
   Paraphrased; nothing is quoted. The house is drawn as fourteen by fourteen identical courtyards on a torus: walk off one edge
   and you come in at the other. The film keeps a set of every courtyard Asterion could be standing in, given what he has seen;
   with no landmarks it never shrinks, and the bodies of the nine are what make it shrink.
   Lines carry who (a CAST key). One fulcrum line per scene is flagged line:true. */
const CAST = {
  A: { name: 'Asterion', voice: 'am_onyx', speed: 0.86 },
  N: { name: 'Narrator', voice: 'am_adam', speed: 0.92 },
  T: { name: 'Theseus', voice: 'bm_george', speed: 0.98 },
};
const WT = (ls, i, word, off = 0) => `L${i}@${(Math.max(0, ls[i].say.indexOf(word)) / ls[i].say.length).toFixed(3)}${off ? (off > 0 ? '+' : '') + off : ''}`;
const L1 = [
  { who: 'A', pre: 1.4, say: 'I know what they say of me. That I am proud, that I hate people, that I am mad. I will deal with that in time.' },
  { who: 'A', pre: 0.8, say: 'Yes, I stay in my house. But its doors are never shut, at any hour, to any man or any animal. There are more doors than anyone can count, and not one lock.' },
  { who: 'A', pre: 0.8, say: 'There is no furniture here, and no court. There is quiet, and room to be alone.' },
  { who: 'A', pre: 1.0, say: 'They say I am a prisoner. There are no locks.', line: true },
];
const L2 = [
  { who: 'A', pre: 1.2, say: 'Once, one afternoon, I did go out into the street. I came back before night.' },
  { who: 'A', pre: 0.8, say: 'Their faces frightened me. Flat and colorless, like the palm of a hand.' },
  { who: 'A', pre: 0.8, say: 'A child cried. People prayed, ran, lay face down. Some climbed the temple steps. Others picked up stones.' },
  { who: 'A', pre: 1.0, say: 'They knew who I was.', line: true },
];
const L3 = [
  { who: 'A', pre: 1.2, say: 'My mother was a queen. I cannot be taken for one of the crowd.' },
  { who: 'A', pre: 0.8, say: 'I never learned to read. I could never keep one letter apart from another.' },
  { who: 'A', pre: 1.0, say: 'Sometimes I am sorry, because the days and the nights are long.', line: true },
];
const L4 = [
  { who: 'A', pre: 1.2, say: 'I have my games. I charge down the stone galleries with my head down, like a ram, until I fall over dizzy.' },
  { who: 'A', pre: 0.8, say: 'I crouch in the dark beside a pool, or round a corner, and pretend someone is after me.' },
  { who: 'A', pre: 0.8, say: 'There are roofs I let myself drop from, until I bleed.' },
  { who: 'A', pre: 1.0, say: 'I pretend to sleep, eyes shut, breathing hard. Sometimes I do sleep, and when I open my eyes the light has changed.', line: true },
];
const L5 = [
  { who: 'A', pre: 1.2, say: 'The game I like best is the other Asterion. I pretend he has come to visit, and I show him round.' },
  { who: 'A', pre: 0.8, say: 'I bow, and tell him: now back to the first crossing. Now out into another courtyard. The drain, I knew it would please you.' },
  { who: 'A', pre: 0.8, say: 'But every courtyard is like every other. When I say the first crossing, it could be any of them.' },
  { who: 'A', pre: 1.0, say: 'Sometimes I lead him wrong, and we both laugh.', line: true },
];
const L6 = [
  { who: 'A', pre: 1.2, say: 'I have thought about the house. Each part of it comes again and again. Every place is some other place too.' },
  { who: 'A', pre: 0.8, say: 'There is not one pool, one courtyard, one trough, one manger. There are fourteen of each, which is to say there is no end of them.' },
  { who: 'A', pre: 0.8, say: 'The house is as big as the world. No: it is the world.' },
  { who: 'A', pre: 0.8, say: 'Once, at the far end of the galleries, I came out on the street, the temple, the sea. Then a vision in the night showed me that seas and temples repeat as well.' },
  { who: 'A', pre: 1.0, say: 'Only two things seem to happen once. Above, the sun. Below, Asterion.', line: true },
];
const L7 = [
  { who: 'A', pre: 1.2, say: 'Every nine years, nine men come into the house, so that I can free them from all evil.' },
  { who: 'A', pre: 0.8, say: 'I hear their steps far off in the galleries, and I run to them, glad. It is over in a few minutes.' },
  { who: 'A', pre: 0.8, say: 'They fall, one after the other. I do not have to bloody my hands.' },
  { who: 'A', pre: 1.0, say: 'They lie where they fell. With them there, one gallery is no longer the same as the next.', line: true },
];
const L8 = [
  { who: 'A', pre: 1.2, say: 'I never learn their names. But one of them, as he died, said that one day my redeemer would come.' },
  { who: 'A', pre: 0.8, say: 'Since then the loneliness does not hurt. I know he is alive, and that one day he will stand up out of the dust.' },
  { who: 'A', pre: 0.8, say: 'If I could hear every sound in the world, his footsteps would reach me. I hope he takes me somewhere with fewer galleries, and fewer doors.' },
  { who: 'A', pre: 1.0, say: 'What will he be like? A bull, or a man? A bull with a man\'s face? Or like me?', line: true },
];
const L9 = [
  { who: 'N', pre: 1.6, say: 'In the morning the sun flashed on the bronze sword. Not a trace of blood was left on it.' },
  { who: 'T', pre: 1.0, say: 'Can you believe it, Ariadne? The Minotaur hardly fought back.', line: true },
];
const SCRIPT = [
  { shot: 'title', d: 13, lines: [], cues: [{ k: 'ink', at: 0.6, to: 7.6 }, { k: 'name', at: 8.4 }] },
  { shot: 'accused', lines: L1, tail: 1.4, cues: [{ k: 'doors', at: WT(L1, 1, 'its doors') }] },
  { shot: 'street', lines: L2, tail: 1.4, cues: [{ k: 'faces', at: 'L1.t0' }, { k: 'flee', at: 'L2.t0' }, { k: 'stones', at: WT(L2, 2, 'Others') }, { k: 'home', at: 'L3.t1+0.2' }] },
  { shot: 'unique', lines: L3, tail: 1.4, cues: [{ k: 'letters', at: 'L1.t0' }] },
  { shot: 'games', lines: L4, tail: 1.4, cues: [{ k: 'run', at: 'L0.t0+1', to: 'L0.t1' }, { k: 'hide', at: 'L1.t0' }, { k: 'roof', at: 'L2.t0' }, { k: 'sleep', at: 'L3.t0' }, { k: 'wake', at: WT(L4, 3, 'when I open') }] },
  { shot: 'other', lines: L5, tail: 1.6, cues: [{ k: 'ghost', at: 'L0.t1-1' }, { k: 'walk', at: 'L1.t0', to: 'L2.t1' }, { k: 'plan', at: 'L2.t0' }] },
  { shot: 'house', lines: L6, tail: 1.6, cues: [{ k: 'plan', at: 'L0.t0+0.5' }, { k: 'fourteen', at: 'L1.t0' }, { k: 'wrap', at: 'L2.t0' }, { k: 'sea', at: 'L3.t0' }, { k: 'sun', at: 'L4.t0' }] },
  { shot: 'nine', lines: L7, tail: 1.6, cues: [{ k: 'enter', at: 'L0.t0+0.6' }, { k: 'run', at: 'L1.t0' }, { k: 'fall', at: 'L2.t0', to: 'L2.t1' }, { k: 'mark', at: 'L3.t0', to: 'L3.t1+1.2' }] },
  { shot: 'redeemer', lines: L8, tail: 1.6, cues: [{ k: 'listen', at: 'L2.t0' }, { k: 'faces', at: 'L3.t0' }] },
  { shot: 'theseus', lines: L9, tail: 4.0, cues: [{ k: 'sun', at: 0.4 }] },
  { shot: 'end', d: 10, lines: [], cues: [] },
];
if (typeof module !== 'undefined') module.exports = { SCRIPT, CAST };
