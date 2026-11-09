/* House Taken Over. The score.
   After Julio Cortazar, "Casa tomada" (1946), translated by Paul Blackburn as "House Taken Over". Paraphrased; nothing is quoted.
   The house is drawn as a plan and read as a graph: rooms are nodes, doors are edges, and "ours" is every room that can be
   reached from Irene's room without opening a shut door. Whoever takes the house is never drawn; they are only heard.
   Lines carry who (a CAST key). One fulcrum line per scene is flagged line:true. Cue times: numbers, 'end-1', 'L2.t1+0.5', 'L2@0.35'. */
const CAST = {
  N: { name: 'The brother', voice: 'bm_fable', speed: 0.94 },
  I: { name: 'Irene', voice: 'bf_emma', speed: 0.92 },
};
const WT = (ls, i, word, off = 0) => `L${i}@${(Math.max(0, ls[i].say.indexOf(word)) / ls[i].say.length).toFixed(3)}${off ? (off > 0 ? '+' : '') + off : ''}`;
const L1 = [
  { who: 'N', pre: 1.2, say: 'We liked the house because it was old and big, and because it still held our great-grandparents, our grandfather, our parents, and all of our childhood.' },
  { who: 'N', pre: 0.7, say: 'There was room in it for eight people who need never meet. Irene and I lived in it alone.' },
  { who: 'N', pre: 0.7, say: 'We were nearly forty. We took it for granted that the two of us were how the family would end, here.' },
  { who: 'N', pre: 0.9, say: 'Some day distant cousins would pull the house down and sell the bricks.', line: true },
];
const L2 = [
  { who: 'N', pre: 1.0, say: 'This is the plan. A vestibule with tiles. An iron gate. A living room, with our two bedrooms on either side of it.' },
  { who: 'N', pre: 0.7, say: 'Then a corridor. Just before it ends, a narrow passage turns off to the bath and the kitchen.' },
  { who: 'N', pre: 0.7, say: 'At the end of the corridor, a heavy oak door. Behind it, the dining room, the room with the tapestries, the library, and three big bedrooms at the back.' },
  { who: 'N', pre: 0.7, say: 'With the oak door open you could feel how big the house was. With it shut, it was like one of the small flats they build now.' },
  { who: 'N', pre: 0.9, say: 'Fifteen rooms with the door open. Eight with it shut.', line: true },
];
const L3 = [
  { who: 'N', pre: 1.0, say: 'We got up at seven and cleaned. At eleven I went to the kitchen. We ate at noon exactly.' },
  { who: 'N', pre: 0.7, say: 'After that Irene knitted on her sofa until night. Sweaters, socks, bed jackets. Sometimes she pulled a whole jacket apart because something in it did not please her.' },
  { who: 'N', pre: 0.7, say: 'Every Saturday I took the tram downtown for her wool, and asked in the bookshops for new French books. Nothing new had come since nineteen thirty-nine.' },
  { who: 'N', pre: 0.9, say: 'I could watch her hands for hours: the needles going, the balls of yarn jumping in the basket.', line: true },
];
const L4 = [
  { who: 'N', pre: 1.0, say: 'It happened simply. It was eight at night. Irene was knitting, and I went to put water on for mate.' },
  { who: 'N', pre: 0.7, say: 'The oak door was half open. As I turned toward the kitchen I heard a sound from the dining room, or else the library. A chair falling on a carpet, or a low conversation.' },
  { who: 'N', pre: 0.7, say: 'Then I heard it in the passage behind the door. I threw myself against the door and shut it, and leaned on it. The key, by luck, was in our side of the lock. I ran the big bolt as well.' },
  { who: 'N', pre: 0.8, say: 'I made the mate, carried the tray to her room, and told her I had shut the corridor door. They had taken the back part.' },
  { who: 'I', pre: 0.8, say: 'Are you sure?' },
  { who: 'I', pre: 1.6, say: 'Then we will live on this side.', line: true },
  { who: 'N', pre: 0.8, say: 'She took up her knitting again, slowly. It was a gray vest. I liked that vest.' },
];
const L5 = [
  { who: 'N', pre: 1.0, say: 'At first it was hard. My French books were in the library. Irene\'s writing paper and her winter slippers were back there, and my pipe.' },
  { who: 'N', pre: 0.7, say: 'We would shut a drawer and look at each other. It was not there. One more thing on the other side.' },
  { who: 'N', pre: 0.7, say: 'But the cleaning was done by eleven now. Irene helped me in the kitchen. We made cold suppers and ate them at the table in her room.' },
  { who: 'N', pre: 0.7, say: 'She had more time to knit. I sorted our father\'s stamps.' },
  { who: 'N', pre: 0.9, say: 'We were all right. Bit by bit we stopped thinking, and it turned out a person can live that way.', line: true },
];
const L6 = [
  { who: 'N', pre: 1.0, say: 'At night every sound in the house carried. Each of us could hear the other breathe, cough, and feel for the light switch.' },
  { who: 'N', pre: 0.7, say: 'If Irene spoke in her sleep, I was awake at once. The voice did not seem to come from her throat.' },
  { who: 'N', pre: 0.9, say: 'In the kitchen we made enough noise with the plates. In the other rooms we walked slowly and kept quiet.', line: true },
];
const L7 = [
  { who: 'N', pre: 1.0, say: 'It was almost the same scene again, except for what came of it. I was thirsty, and I told Irene I would fetch a glass of water.' },
  { who: 'N', pre: 0.7, say: 'From her doorway I heard it. The bath, or the kitchen. Irene saw me stop, and came and stood beside me.' },
  { who: 'N', pre: 0.7, say: 'We listened. It was this side of the oak door now. The bath, the kitchen, then the bend of the hall, close beside us.' },
  { who: 'N', pre: 0.7, say: 'I took her arm and we ran to the iron gate without looking back. I slammed it. In the vestibule there was nothing to hear.' },
  { who: 'I', pre: 0.9, say: 'They have taken our side.' },
  { who: 'N', pre: 0.9, say: 'Her knitting had come off her hands. The yarn was running back under the gate, and she let the rest drop.', line: true },
];
const L8 = [
  { who: 'N', pre: 1.0, say: 'I asked if she had brought anything.' },
  { who: 'I', pre: 0.6, say: 'Nothing.' },
  { who: 'N', pre: 0.8, say: 'We had what we were wearing. I thought of fifteen thousand pesos in my wardrobe. Too late.' },
  { who: 'N', pre: 0.7, say: 'My watch said eleven at night. I put my arm around her. I think she was crying.' },
  { who: 'N', pre: 1.0, say: 'I locked the front door and threw the key down the drain, so that no poor thief would go into the house at that hour, the way it was now.', line: true },
];
const SCRIPT = [
  { shot: 'title', d: 13, lines: [], cues: [{ k: 'ink', at: 0.8, to: 8.0 }, { k: 'name', at: 8.6 }] },
  { shot: 'house', lines: L1, tail: 1.2, cues: [{ k: 'in', at: 'L1.t0' }] },
  { shot: 'plan', lines: L2, tail: 1.6, cues: [{ k: 'front', at: 'L0.t0' }, { k: 'gate', at: WT(L2, 0, 'An iron') }, { k: 'beds', at: WT(L2, 0, 'with our') }, { k: 'corr', at: 'L1.t0' }, { k: 'kit', at: WT(L2, 1, 'a narrow') }, { k: 'oak', at: 'L2.t0' }, { k: 'back', at: WT(L2, 2, 'Behind') }, { k: 'open', at: 'L3.t0' }, { k: 'shut', at: WT(L2, 3, 'With it shut') }, { k: 'count', at: 'L4.t0-0.2' }] },
  { shot: 'days', lines: L3, tail: 1.4, cues: [{ k: 'unravel', at: WT(L3, 1, 'Sometimes') }, { k: 'sat', at: 'L2.t0' }] },
  { shot: 'night1', lines: L4, tail: 1.6, clock: '20:00', cues: [{ k: 'walk', at: 'L0.t0+1.5', to: 'L1.t0+2' }, { k: 'noise1', at: WT(L4, 1, 'A chair') }, { k: 'noise2', at: 'L2.t0+0.4' }, { k: 'shut', at: WT(L4, 2, 'I threw') }, { k: 'bolt', at: WT(L4, 2, "I ran") }, { k: 'room', at: 'L3.t0' }, { k: 'drop', at: 'L4.t0-0.4' }, { k: 'nod', at: 'L4.t1+0.3' }] },
  { shot: 'after', lines: L5, tail: 1.4, cues: [{ k: 'drawer', at: 'L1.t0' }, { k: 'supper', at: 'L2.t0' }, { k: 'stamps', at: 'L3.t0' }] },
  { shot: 'nights', lines: L6, tail: 1.4, cues: [{ k: 'sleep', at: 'L1.t0' }, { k: 'kitchen', at: 'L2.t0' }] },
  { shot: 'night2', lines: L7, tail: 1.6, clock: '23:00', cues: [{ k: 'noise', at: 'L1.t0+0.4' }, { k: 'stand', at: WT(L7, 1, 'Irene saw') }, { k: 'near', at: WT(L7, 2, 'or in the hall') }, { k: 'run', at: 'L3.t0+0.3', to: WT(L7, 3, 'I slammed') }, { k: 'slam', at: WT(L7, 3, 'I slammed') }, { k: 'yarn', at: 'L5.t0' }] },
  { shot: 'street', lines: L8, tail: 4.0, clock: '23:00', cues: [{ k: 'lock', at: 'L4.t0+0.4' }, { k: 'key', at: WT(L8, 4, 'threw') }, { k: 'walk', at: 'L4.t1-1.5' }] },
  { shot: 'end', d: 10, lines: [], cues: [] },
];
if (typeof module !== 'undefined') module.exports = { SCRIPT, CAST };
