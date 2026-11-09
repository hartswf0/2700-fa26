/* And He Built a Crooked House. The score.
   After Robert A. Heinlein, "—And He Built a Crooked House" (Astounding, 1941). Paraphrased; nothing is quoted.
   The computation is the tesseract: its counts (16 corners, 32 edges, 24 squares, 8 cubes), its rotation in four dimensions
   and projection to the page, its unfolding into a cross of eight cubes, and the graph of which rooms touch which.
   Lines carry who (a CAST key). One fulcrum line per scene is flagged line:true. */
const CAST = {
  N: { name: 'Narrator', voice: 'bm_lewis', speed: 0.95 },
  T: { name: 'Teal', voice: 'am_puck', speed: 1.02 },
  H: { name: 'Bailey', voice: 'am_michael', speed: 0.95 },
  M: { name: 'Mrs. Bailey', voice: 'af_bella', speed: 0.96 },
  F: { name: 'The rancher', voice: 'am_eric', speed: 0.92 },
};
const WT = (ls, i, word, off = 0) => `L${i}@${(Math.max(0, ls[i].say.indexOf(word)) / ls[i].say.length).toFixed(3)}${off ? (off > 0 ? '+' : '') + off : ''}`;
const L1 = [
  { who: 'N', pre: 1.2, say: 'Quintus Teal was an architect in the Hollywood hills, and he thought every other architect alive was timid.' },
  { who: 'T', pre: 0.7, say: 'Homer, what is a house?' },
  { who: 'H', pre: 0.5, say: 'Something to keep the rain off, I suppose.' },
  { who: 'T', pre: 0.5, say: 'That is a cave with furniture in it. A house ought to move and change with the people living in it.' },
  { who: 'H', pre: 0.5, say: 'Next you will want a fourth dimension.' },
  { who: 'T', pre: 0.8, say: 'Why not? A fourth direction in space, at right angles to the other three. Eight rooms on the ground of one.', line: true },
];
const L2 = [
  { who: 'N', pre: 1.0, say: 'He built it on the table, with toothpicks and little balls of clay.' },
  { who: 'T', pre: 0.6, say: 'Four sticks make a square. Twelve make a cube. Now take two cubes, and join each corner of one to the same corner of the other.' },
  { who: 'N', pre: 0.7, say: 'That is a tesseract. Sixteen corners, thirty-two edges, twenty-four square faces, and eight cubes. Every one of the eight is on the outside.' },
  { who: 'H', pre: 0.6, say: 'I see two cubes, and six things that are not cubes. They slant.' },
  { who: 'T', pre: 0.5, say: 'That is perspective. Draw a cube on paper and its sides slant too.' },
  { who: 'N', pre: 0.9, say: 'Seen in three dimensions, a four-dimensional figure always looks crooked.', line: true },
];
const L3 = [
  { who: 'T', pre: 1.0, say: 'Now open it out the way you flatten a cardboard box. Four cubes in a column, and four more around the second one.' },
  { who: 'N', pre: 0.7, say: 'Eight rooms. One on the ground for the garage and the services. Above it a cross of five, with four rooms jutting out. A bedroom above that, and a study on top.' },
  { who: 'H', pre: 0.6, say: 'Forget about folding it through anything. Build it like that.' },
  { who: 'N', pre: 0.7, say: 'Mrs. Bailey wanted a Georgian house. By the second bottle of gin, Bailey had written the cheque.' },
  { who: 'T', pre: 0.8, say: 'Every room gets sun all day, and the whole house stands on the foundation of one room.', line: true },
];
const L4 = [
  { who: 'N', pre: 1.0, say: 'It went up in days. The four jutting rooms needed strong girders, and some money for the inspectors.' },
  { who: 'N', pre: 0.7, say: 'The night before the Baileys came back from Bakersfield, there was a small earthquake, at about two in the morning.' },
  { who: 'N', pre: 0.8, say: 'When Teal drove them up the hill, there was one plain cube on the lot, with doors and windows and patterns on its walls. The other seven rooms were gone.' },
  { who: 'T', pre: 0.4, say: 'I have been robbed!' },
  { who: 'N', pre: 0.9, say: 'Nothing in the garden had been touched.', line: true },
];
const L5 = [
  { who: 'N', pre: 1.0, say: 'Inside, a stair came down out of the ceiling. At the top they were not on the roof, but in the middle room of the second floor, with every room in place.' },
  { who: 'N', pre: 0.7, say: 'Up again to the bedroom, up again to the study, and up once more to reach the roof. They stepped out into the room on the ground, the one they had come in by.' },
  { who: 'N', pre: 0.7, say: 'In a tesseract each room touches six of the other seven. Only the room opposite does not touch it at all.' },
  { who: 'N', pre: 0.6, say: 'Keep going straight through four rooms and you are back where you began.' },
  { who: 'H', pre: 0.6, say: 'This place is haunted. We are leaving.' },
  { who: 'N', pre: 0.9, say: 'They went out through the front door, and walked into the lounge upstairs.', line: true },
];
const L6 = [
  { who: 'N', pre: 1.0, say: 'Teal said that in a house like this, every doorway leads two ways. You go the way you are looking.' },
  { who: 'N', pre: 0.7, say: 'He stepped through a window without looking, and dropped off the house into a rosebush.' },
  { who: 'N', pre: 0.7, say: 'Back inside, Mrs. Bailey heard voices. Through a far window Teal saw a man four rooms away, with his back turned, and ran after him.' },
  { who: 'N', pre: 0.7, say: 'He never gained a room on him. The man jumped a sill and lost his hat. Teal picked it up. His own initials were in it.' },
  { who: 'N', pre: 0.7, say: 'Four rooms away they could see the backs of three people, two men and a woman. The thin one was waving his arms.' },
  { who: 'N', pre: 0.9, say: 'They were looking at themselves.', line: true },
];
const L7 = [
  { who: 'N', pre: 1.0, say: 'The study at the top had four windows with the blinds down. By the plan, they should have looked into the four rooms around it.' },
  { who: 'N', pre: 0.7, say: 'The first looked straight down the face of a skyscraper, from above its tower, onto a city far below.' },
  { who: 'N', pre: 0.7, say: 'The second showed open sea, upside down: the waves overhead, the sky beneath.' },
  { who: 'N', pre: 0.9, say: 'The third showed nothing. Not darkness. No color and no shape at all.', line: true },
  { who: 'T', pre: 0.6, say: 'I think we looked around a corner where there is no space.' },
  { who: 'N', pre: 0.7, say: 'The fourth showed flat desert under a yellow sky, with twisted trees, and a sun that seemed too bright.' },
];
const L8 = [
  { who: 'N', pre: 1.0, say: 'Then a second shock came, a long roll. Every Californian has the same reflex in an earthquake: get outside.' },
  { who: 'N', pre: 0.6, say: 'They went through the open window, and landed on sand.' },
  { who: 'H', pre: 0.8, say: 'Where is the house?' },
  { who: 'N', pre: 0.6, say: 'There was no house. Only the desert, the trees, and the sun.' },
  { who: 'N', pre: 0.7, say: 'They walked until they found a road. A rancher in an old truck stopped for them.' },
  { who: 'F', pre: 0.6, say: 'You are in the middle of Joshua Tree.' },
  { who: 'N', pre: 0.9, say: 'They had gone out of a window in the study, and come down more than a hundred miles from Hollywood.', line: true },
];
const L9 = [
  { who: 'N', pre: 1.0, say: 'When the truck brought them back up the hill, the ground floor room was gone too. Only the foundation was left.' },
  { who: 'T', pre: 0.6, say: 'On that last shock it must have fallen through into some other part of space. I should have anchored it to the foundation.' },
  { who: 'H', pre: 0.5, say: 'That is not the only thing you should have done.' },
  { who: 'T', pre: 0.5, say: 'But it was insured, and look how much we have learned. In fact, I have a new idea for a house right now.' },
  { who: 'N', pre: 0.9, say: 'Teal ducked just in time.', line: true },
];
const SCRIPT = [
  { shot: 'title', d: 13, lines: [], cues: [{ k: 'spin', at: 0.5, to: 8.0 }, { k: 'name', at: 8.4 }] },
  { shot: 'what', lines: L1, tail: 1.2, cues: [] },
  { shot: 'model', lines: L2, tail: 1.6, cues: [{ k: 'square', at: WT(L2, 1, 'Four') }, { k: 'cube', at: WT(L2, 1, 'Twelve') }, { k: 'join', at: WT(L2, 1, 'join') }, { k: 'count', at: 'L2.t0' }, { k: 'turn', at: 'L3.t0' }] },
  { shot: 'unfold', lines: L3, tail: 1.4, cues: [{ k: 'open', at: 'L0.t0+0.5', to: 'L0.t1+1.0' }, { k: 'rooms', at: 'L1.t0' }, { k: 'build', at: 'L2.t0' }] },
  { shot: 'build', lines: L4, tail: 1.4, cues: [{ k: 'rise', at: 'L0.t0', to: 'L0.t1' }, { k: 'quake', at: WT(L4, 1, 'there was'), to: 'L1.t1+0.5' }, { k: 'arrive', at: 'L2.t0' }] },
  { shot: 'inside', lines: L5, tail: 1.4, cues: [{ k: 'stair', at: 'L0.t0+0.6' }, { k: 'loop', at: 'L1.t0', to: 'L1.t1' }, { k: 'graph', at: 'L2.t0' }, { k: 'ring', at: 'L3.t0' }, { k: 'door', at: 'L5.t0' }] },
  { shot: 'window', lines: L6, tail: 1.4, cues: [{ k: 'fall', at: 'L1.t0+0.8' }, { k: 'chase', at: WT(L6, 2, 'Through'), to: 'L3.t0+1.5' }, { k: 'hat', at: WT(L6, 3, 'Teal picked') }, { k: 'three', at: 'L4.t0' }] },
  { shot: 'study', lines: L7, tail: 1.4, cues: [{ k: 'w1', at: 'L1.t0' }, { k: 'w2', at: 'L2.t0' }, { k: 'w3', at: 'L3.t0' }, { k: 'w4', at: 'L5.t0' }] },
  { shot: 'quake', lines: L8, tail: 1.4, cues: [{ k: 'roll', at: 'L0.t0+0.8', to: 'L1.t0+0.6' }, { k: 'land', at: 'L1.t1' }, { k: 'road', at: 'L4.t0' }] },
  { shot: 'gone', lines: L9, tail: 3.2, cues: [{ k: 'idea', at: 'L3.t0' }, { k: 'duck', at: 'L4.t0-0.4' }] },
  { shot: 'end', d: 10, lines: [], cues: [] },
];
if (typeof module !== 'undefined') module.exports = { SCRIPT, CAST };
