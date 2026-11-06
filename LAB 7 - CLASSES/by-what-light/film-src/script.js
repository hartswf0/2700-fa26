/* By What Light. The score.
   A ledger for the Abominable House. The engine (engine.js) and its numbers (data.json, film.json) come first; every number
   spoken here is one the engine computed. After Italo Calvino, "The Burning of the Abominable House", in Numbers in the Dark,
   translated by Tim Parks; with the four slots of Alison Knowles and James Tenney's The House of Dust (1967) used as a form,
   Calvino's t zero (the frozen instant), The Castle of Crossed Destinies (rows and columns), three of the Six Memos as the axes of
   a MAP-Elites grid (Mouret and Clune, 2015), and Bellman's dynamic programming. Nothing is quoted from Calvino or Knowles.
   The four sexual deeds of the index are never named or shown: they happen behind a shut door.
   Lines carry who (a CAST key). One fulcrum line per scene is flagged line:true: tightest camera, slower delivery.
   Times in cues: numbers, 'end-1', 'L2.t1+0.5', or 'L2@0.35'. */
const CAST = {
  W: { name: 'Waldemar', voice: 'bm_daniel', speed: 0.96 },
  M: { name: 'The printer', voice: 'af_sky', speed: 0.93, fx: 'synth' },
};
const WT = (ls, i, word, off = 0) => `L${i}@${(Math.max(0, ls[i].say.indexOf(word)) / ls[i].say.length).toFixed(3)}${off ? (off > 0 ? '+' : '') + off : ''}`;

const L1 = [
  { who: 'W', pre: 1.2, say: 'The first time, the machine asked one question of each deed: who did it to whom.' },
  { who: 'W', pre: 0.6, say: 'Twelve deeds, twelve pairs for each. Twelve to the twelfth power. Almost nine trillion films.' },
  { who: 'W', pre: 0.7, say: 'I ran a million of them at random, gave each one a score, and kept the best three.' },
  { who: 'W', pre: 0.7, say: 'They open differently. They end the same way. In all three every deed is solved, and the story moves through five or six rooms.' },
  { who: 'W', pre: 0.9, say: 'With one number, every winner is the same kind of film.', line: true },
];
const L2 = [
  { who: 'W', pre: 1.0, say: 'So each deed gets four more parts. What it leaves behind. Which room. What light. Who else is in the room.' },
  { who: 'M', pre: 0.9, say: 'Blackmail. Inigo, the widow. Paper. The attic, by candle. Ogiva at the door.' },
  { who: 'W', pre: 0.9, say: 'The room and the light decide who knows.', line: true },
];
const L3 = [
  { who: 'W', pre: 1.0, say: 'These are the rules. A dead sack does nothing, and nothing more is done to it. A tied sack cannot act.' },
  { who: 'W', pre: 0.7, say: 'By candle or lamp, everyone in the room sees who did it. By moonlight nobody does, not even the one it was done to.' },
  { who: 'W', pre: 0.7, say: 'Four of the deeds happen behind a shut door. Nobody sees those.' },
  { who: 'W', pre: 0.7, say: 'Every deed leaves something in the room: paper, cloth, flour, rope, or ash. The next sack to come in with a light finds it.' },
  { who: 'W', pre: 0.7, say: 'After the sixth deed the house can catch fire. Once it has, the fire lights every deed that follows, and the last deed is always lit by it.' },
  { who: 'W', pre: 0.9, say: 'A sack that has acted once may act again only against someone it knows is guilty.', line: true },
];
const L4 = [
  { who: 'W', pre: 1.0, say: 'That last rule is read down each sack\'s own column, not across the film.' },
  { who: 'W', pre: 0.7, say: 'This film breaks it at the fourth deed. Ogiva knifes Inigo, and nothing Inigo has done has reached her.' },
  { who: 'W', pre: 0.7, say: 'Of two hundred thousand who-to-whom films drawn at random, nine in ten fail first on this rule.' },
  { who: 'W', pre: 0.9, say: 'A film has to hold across the rows and down every column.', line: true },
];
const L5 = [
  { who: 'W', pre: 1.0, say: 'With the four parts added, the number of films is thirty-seven digits long.' },
  { who: 'W', pre: 0.7, say: 'I did not list them. The room changes what is left behind, but not what can happen next. So the count multiplies by six and forgets the room.' },
  { who: 'W', pre: 0.7, say: 'The next deed depends on very little: who is alive, who is tied, whether the fire has started, who has acted, and who knows whom.' },
  { who: 'W', pre: 0.7, say: 'That never comes to more than eighty-five thousand cases. So the machine counts every film exactly, one deed at a time.' },
  { who: 'W', pre: 0.7, say: 'The answer is twenty-five digits long.' },
  { who: 'W', pre: 0.7, say: 'For the first three deeds I also listed every film, one by one, and threw out the ones that break a rule. Forty-four million, seven hundred and eighty-nine thousand, seven hundred and sixty.' },
  { who: 'W', pre: 0.9, say: 'The list and the count agree.', line: true },
];
const L6 = [
  { who: 'W', pre: 1.0, say: 'Now take one film and stop it just before the fourth deed, the knifing.' },
  { who: 'W', pre: 0.7, say: 'Here are the twelve pairs that could do it, each with its share of all the films that can still follow.' },
  { who: 'W', pre: 0.7, say: 'Five of them cannot happen: the dead, the tied, and the sacks with no reason are out.' },
  { who: 'W', pre: 0.7, say: 'In half of what can follow, Ogiva knifes the widow.' },
  { who: 'W', pre: 0.9, say: 'This film takes a branch worth less than one in ten.', line: true },
];
const L7 = [
  { who: 'W', pre: 1.0, say: 'Instead of one winner, keep a grid. Across, how many deeds are solved. Down, how many rooms are used. Deep, how many deeds a witness sees.' },
  { who: 'W', pre: 0.7, say: 'Each square keeps its own best film. The million films filled thirty-eight of the sixty-four squares.' },
  { who: 'W', pre: 0.7, say: 'The three winners from before sit together in one corner.' },
  { who: 'W', pre: 0.9, say: 'This one solves every deed and never leaves two rooms.', line: true },
];
const L8 = [
  { who: 'M', pre: 1.4, say: 'One. Blackmail. Inigo, the widow. Paper. The attic, by candle. Ogiva sees.' },
  { who: 'M', pre: 1.2, say: 'Two. Drugging. Ogiva, Inigo. Cloth. The attic, by lamp. The widow sees, and finds the paper.' },
  { who: 'M', pre: 1.2, say: 'Three. The cellar, by moonlight. The door is shut.' },
  { who: 'M', pre: 1.2, say: 'Four. Knifing. The widow, Inigo. Flour. The cellar, by lamp. Ogiva and Belindo see.' },
  { who: 'M', pre: 1.2, say: 'Five. The attic, by moonlight. The door is shut.' },
  { who: 'M', pre: 1.2, say: 'Six. A gun. Belindo, the widow. Ash. The cellar, by candle. Ogiva sees, and finds the flour.' },
  { who: 'M', pre: 1.2, say: 'Seven. Tying and gagging. Belindo, the widow. Rope. The attic, by lamp. Two pieces of cloth are found.' },
  { who: 'M', pre: 1.2, say: 'Eight. The attic, by lamp. The door is shut. The rope is found.' },
  { who: 'M', pre: 1.2, say: 'Nine. The cellar. The fire has started. The door is shut.' },
  { who: 'M', pre: 1.2, say: 'Ten. Slander. Belindo, Ogiva. Paper. The attic, by firelight.' },
  { who: 'M', pre: 1.2, say: 'Eleven. Snooping. Ogiva, the widow. Flour. The attic, by firelight.' },
  { who: 'M', pre: 1.2, say: 'Twelve. Strangling. Belindo, the widow. Rope. The attic, by firelight.' },
  { who: 'W', pre: 1.4, say: 'Every deed is solved. Two sacks are left, and the house is burning.', line: true },
];

const SCRIPT = [
  { shot: 'title', d: 14, lines: [], cues: [{ k: 'print', at: 1.0, to: 8.4 }, { k: 'name', at: 9.0 }] },
  { shot: 'old', lines: L1, tail: 1.4, cues: [{ k: 'roll', at: 'L1.t0+0.3', to: 'L1.t1' }, { k: 'run', at: 'L2.t0', to: 'L2.t1' }, { k: 'three', at: 'L3.t0' }] },
  { shot: 'quatrain', lines: L2, tail: 1.6, cues: [{ k: 'mat', at: WT(L2, 0, 'What it') }, { k: 'room', at: WT(L2, 0, 'Which') }, { k: 'light', at: WT(L2, 0, 'What light') }, { k: 'who', at: WT(L2, 0, 'Who') }, { k: 'play', at: 'L1.t0-0.3' }] },
  { shot: 'rules', lines: L3, tail: 1.4, cues: [{ k: 'dead', at: 'L0.t0' }, { k: 'tied', at: WT(L3, 0, 'A tied') }, { k: 'light', at: 'L1.t0' }, { k: 'moon', at: WT(L3, 1, 'By moon') }, { k: 'door', at: 'L2.t0' }, { k: 'trace', at: 'L3.t0' }, { k: 'find', at: WT(L3, 3, 'The next') }, { k: 'fire', at: 'L4.t0' }, { k: 'strand', at: 'L5.t0' }] },
  { shot: 'strands', lines: L4, tail: 1.4, cues: [{ k: 'grid', at: 'L0.t0' }, { k: 'break', at: WT(L4, 1, 'Ogiva') }, { k: 'stat', at: 'L2.t0' }] },
  { shot: 'count', lines: L5, tail: 1.5, cues: [{ k: 'raw', at: 'L0.t0+0.5' }, { k: 'factor', at: 'L1.t0' }, { k: 'state', at: 'L2.t0' }, { k: 'dp', at: 'L3.t0', to: 'L4.t1' }, { k: 'check', at: 'L5.t0' }] },
  { shot: 'tzero', lines: L6, tail: 1.6, cues: [{ k: 'freeze', at: 'L0.t1-0.4' }, { k: 'fan', at: 'L1.t0' }, { k: 'cross', at: 'L2.t0' }, { k: 'half', at: 'L3.t0' }, { k: 'chosen', at: 'L4.t0-0.2' }] },
  { shot: 'memos', lines: L7, tail: 1.5, cues: [{ k: 'axes', at: 'L0.t0' }, { k: 'fill', at: 'L1.t0', to: 'L1.t1' }, { k: 'top', at: 'L2.t0' }, { k: 'pick', at: 'L3.t0-0.3' }] },
  { shot: 'film', lines: L8, tail: 4.0, cues: [] },
  { shot: 'end', d: 11, lines: [], cues: [] },
];
if (typeof module !== 'undefined') module.exports = { SCRIPT, CAST };
