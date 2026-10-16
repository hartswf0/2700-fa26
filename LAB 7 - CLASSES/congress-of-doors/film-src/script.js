/* The Great International Congress of Doors. The score. Film two of THE HOUSE THAT LANGUAGE BUILT, four fables of Edifiction:
   an original fable from Watson Hartsoe's notes "The House That Language Built" (premise 4), written in the manner of
   Stanislaw Lem. All wording is new.
   The invention: four Edifiers, lent by the Ministry, each build a door from one delegate's definition, and each door does
   exactly what its definition says and nothing else. The Objectist's door is an object: it has no hinges. The Transitionist's
   is a passage: a door-shaped absence with no frame and no wall. The Conventionalist's is an agreement: it checks credentials.
   The Encounterist's does not exist until someone tries to pass, and then it is there, closed, in front of every exit.
   The hidden assumption: a door is whatever can be said about it. The cleaner's door, which nobody defined, is the only one
   that works. A comedy on a closed set: one conference hall, four delegates, one chairman's bell.
   Lines carry who (a CAST key). One fulcrum line per scene is flagged line:true: tightest camera, slower delivery.
   Times in cues: numbers, 'end-1', 'L2.t1+0.5', or 'L2@0.35'. A 'fall' cue carries the sentence that becomes a door; its
   letters land at at + i * (to - at - 0.7) / (n - 1) + 0.7, and picture and sound both use that rule. */
const CAST = {
  N: { name: 'Narrator', voice: 'bm_lewis', speed: 0.94 },
  C: { name: 'The Chairman', voice: 'bm_fable', speed: 0.92, fx: 'old' },
  O: { name: 'The Objectist', voice: 'bf_isabella', speed: 0.95 },
  T: { name: 'The Transitionist', voice: 'am_puck', speed: 1.06 },
  V: { name: 'The Conventionalist', voice: 'bf_alice', speed: 0.97 },
  K: { name: 'The Encounterist', voice: 'am_onyx', speed: 0.84, fx: 'deep' },
  E: { name: 'The Edifier', voice: 'af_nicole', speed: 1.0, fx: 'edifier' },
};
const DEF = {
  A: 'A door is an object.',
  B: 'A door is a passage.',
  C: 'A door is an agreement about who may pass.',
  D: 'No door exists until someone tries to pass.',
};

/* ---- 1. arrival: the Ministry, the hall, the doors closing ---- */
const LA = [
  { who: 'N', pre: 1.4, say: 'These are the proceedings of the Great International Congress of Doors, as recorded by the Ministry of Constructive Semantics. The delegates have not approved them.' },
  { who: 'N', pre: 0.9, say: 'Four schools sent one delegate each. Each delegate brought a definition, and the Ministry lent each of them an Edifier.' },
  { who: 'N', pre: 0.7, say: 'There were name cards, carafes of water, and a bell.' },
  { who: 'N', pre: 2.8, say: 'Behind them, the doors of the hall swung shut. Nobody looked round. Those doors were not on the agenda.' },
  { who: 'C', pre: 2.0, say: 'The Congress is open.' },
  { who: 'C', pre: 0.7, say: 'We are here to settle, once and for all, what a door is.', line: true },
];
/* ---- 2. the Objectist ---- */
const LO = [
  { who: 'C', pre: 1.4, say: 'The Objectist.' },
  { who: 'O', pre: 0.9, say: DEF.A, line: true },
  { who: 'N', pre: 6.2, say: 'It was the finest door the Ministry had ever built: six panels, a carved lintel, and a knob of solid brass.' },
  { who: 'T', pre: 3.2, say: 'It does not open.' },
  { who: 'O', pre: 0.6, say: 'It has no hinges. Hinges are about use. I was asked about the door.' },
  { who: 'N', pre: 1.0, say: 'The delegates admired it for some time. Admiring it was the only thing it allowed.' },
];
/* ---- 3. the Transitionist ---- */
const LP = [
  { who: 'C', pre: 1.4, say: 'The Transitionist.' },
  { who: 'T', pre: 0.9, say: DEF.B, line: true },
  { who: 'N', pre: 6.0, say: 'His Edifier built the passing and nothing else: no frame, no wall, no door. A door-shaped absence, standing in the air.' },
  { who: 'T', pre: 5.4, say: 'There. I have passed.' },
  { who: 'O', pre: 0.8, say: 'Into what?' },
  { who: 'T', pre: 1.0, say: 'Into the hall.' },
  { who: 'N', pre: 5.0, say: 'He passed through it eleven times that morning. Each time, it delivered him exactly where he had been standing.' },
];
/* ---- 4. the Conventionalist ---- */
const LC = [
  { who: 'C', pre: 1.4, say: 'The Conventionalist.' },
  { who: 'V', pre: 0.9, say: DEF.C, line: true },
  { who: 'N', pre: 6.0, say: 'Her door had a brass grille, a slot for credentials, and opinions.' },
  { who: 'C', pre: 3.4, say: 'The chairman of the Congress.' },
  { who: 'E', pre: 1.8, say: 'The chairman is not expected.' },
  { who: 'N', pre: 7.4, say: 'It refused the chairman. It admitted the tea.' },
  { who: 'V', pre: 0.8, say: 'It is working perfectly. The tea was expected.' },
];
/* ---- 5. the Encounterist ---- */
const LE = [
  { who: 'C', pre: 1.4, say: 'The Encounterist.' },
  { who: 'K', pre: 1.2, say: DEF.D, line: true },
  { who: 'E', pre: 3.6, say: 'Built.' },
  { who: 'N', pre: 2.4, say: 'There was nothing to see. The chairman went down to look more closely.' },
  { who: 'K', pre: 8.0, say: 'It is there whenever someone tries to leave. It is always closed.' },
  { who: 'C', pre: 1.0, say: 'Thank you. Most helpful.' },
];
/* ---- 6. the vote, and lunch ---- */
const LV = [
  { who: 'C', pre: 2.0, say: 'We shall vote. Those in favour of an object.' },
  { who: 'C', pre: 1.3, say: 'Of a passage.' },
  { who: 'C', pre: 1.1, say: 'Of an agreement.' },
  { who: 'C', pre: 1.1, say: 'Of an encounter.' },
  { who: 'C', pre: 2.4, say: 'One vote each. The question remains open. We adjourn for lunch.' },
  { who: 'N', pre: 1.6, say: 'Every delegate rose, and went to the nearest door.' },
  { who: 'E', pre: 3.0, say: 'Voting members are not admitted.' },
  { who: 'C', pre: 8.0, say: 'Motion to adjourn.' },
  { who: 'C', pre: 2.2, say: 'Motion fails: no exit.', line: true },
];
/* ---- 7. the days ---- */
const LD = [
  { who: 'N', pre: 1.6, say: 'The Congress continued.' },
  { who: 'N', pre: 2.4, say: 'A sub-committee on hinges met each morning at the Objectist’s door, which did not take part.' },
  { who: 'N', pre: 1.2, say: 'The Transitionist walked through his passage until he had worn a path in the floor.' },
  { who: 'N', pre: 1.2, say: 'A minority report on knobs was circulated, and not read.', line: true },
  { who: 'N', pre: 1.2, say: 'Every attempt to leave was minuted. Every attempt produced a door.' },
];
/* ---- 8. the cleaner ---- */
const LN = [
  { who: 'N', pre: 5.0, say: 'Each night a cleaner came in, through a plain door at the back of the hall.' },
  { who: 'N', pre: 1.2, say: 'She was not a delegate. She mopped the floor, emptied the waste-paper baskets, and left the way she had come.' },
  { who: 'N', pre: 6.4, say: 'Nobody noticed her door. It had never been on the agenda.' },
  { who: 'N', pre: 1.8, say: 'The only door in the building that worked was the one nobody had defined.', line: true },
];
/* ---- 9. the proceedings ---- */
const LB = [
  { who: 'N', pre: 1.6, say: 'The drafts went out with the rubbish. The Ministry found them, and published them as A Universal Theory of Doors.' },
  { who: 'N', pre: 2.0, say: 'The delegates have not yet left the hall to approve it.', line: true },
];

const SCRIPT = [
  { shot: 'title', d: 7.5 },
  { shot: 'arrive', room: 'hall', tail: 1.4, lines: LA,
    cues: [{ k: 'climb', at: 0.2, to: 'L0.t1' },
      { k: 'inside', at: 'L1.t0-0.4' },
      { k: 'enter', at: 'L1.t0', to: 'L2.t0+0.4' },
      { k: 'props', at: 'L2.t0-0.2', to: 'L2.t1+0.4' },
      { k: 'close', at: 'L2.t1+0.8' },
      { k: 'bell', at: 'L4.t0-1.2' }] },
  { shot: 'object', room: 'hall', tail: 1.6, lines: LO,
    cues: [{ k: 'bell', at: 'L0.t0-1.0' },
      { k: 'type', at: 'L1.t1+0.3', to: 'L1.t1+2.3' },
      { k: 'fall', s: DEF.A, at: 'L1.t1+2.3', to: 'L1.t1+5.0' },
      { k: 'leaf', at: 'L1.t1+5.0', to: 'L1.t1+5.9' },
      { k: 'walk', at: 'L2@0.45', to: 'L2.t1+0.3' },
      { k: 'push', at: 'L2.t1+0.6' }, { k: 'push', at: 'L2.t1+1.4' }, { k: 'knob', at: 'L2.t1+2.2' },
      { k: 'hinge', at: 'L4.t0+0.2', to: 'L4.t1+0.4' },
      { k: 'back', at: 'L5@0.15', to: 'L5@0.15+3.0' }] },
  { shot: 'passage', room: 'hall', tail: 1.6, lines: LP,
    cues: [{ k: 'bell', at: 'L0.t0-1.0' },
      { k: 'type', at: 'L1.t1+0.3', to: 'L1.t1+2.3' },
      { k: 'fall', s: DEF.B, at: 'L1.t1+2.3', to: 'L1.t1+5.0' },
      { k: 'leaf', at: 'L1.t1+5.0', to: 'L1.t1+5.9' },
      { k: 'walk', at: 'L2@0.4', to: 'L2.t1+0.2' },
      { k: 'through', at: 'L2.t1+0.4', to: 'L2.t1+4.8' },
      { k: 'around', at: 'L5.t1+0.4', to: 'L5.t1+4.6' },
      { k: 'through2', at: 'L5.t1+0.8', to: 'L5.t1+4.8' },
      { k: 'back', at: 'L6@0.45', to: 'L6.t1+0.8' }] },
  { shot: 'convention', room: 'hall', tail: 1.6, lines: LC,
    cues: [{ k: 'bell', at: 'L0.t0-1.0' },
      { k: 'type', at: 'L1.t1+0.3', to: 'L1.t1+2.3' },
      { k: 'fall', s: DEF.C, at: 'L1.t1+2.3', to: 'L1.t1+5.0' },
      { k: 'leaf', at: 'L1.t1+5.0', to: 'L1.t1+5.9' },
      { k: 'down', at: 'L2@0.5', to: 'L3.t0-0.2' },
      { k: 'card', at: 'L3.t0+0.2' },
      { k: 'shutter', at: 'L3.t1+0.5', to: 'L4.t1+0.9' },
      { k: 'trolley', at: 'L4.t1+2.2', to: 'L5.t0-0.2' },
      { k: 'up', at: 'L6.t0', to: 'L6.t1+1.2' }] },
  { shot: 'encounter', room: 'hall', tail: 1.6, lines: LE,
    cues: [{ k: 'bell', at: 'L0.t0-1.0' },
      { k: 'type', at: 'L1.t1+0.4', to: 'L1.t1+2.6' },
      { k: 'down', at: 'L3@0.55', to: 'L3.t1+1.4' },
      { k: 'appear', at: 'L3.t1+2.2' }, { k: 'vanish', at: 'L3.t1+3.8' },
      { k: 'appear', at: 'L3.t1+5.0' }, { k: 'vanish', at: 'L3.t1+6.6' },
      { k: 'up', at: 'L5.t1+0.1', to: 'L5.t1+1.6' }] },
  { shot: 'vote', room: 'hall', tail: 2.4, lines: LV,
    cues: [{ k: 'bell', at: 0.7 },
      { k: 'hand', n: 0, at: 'L0.t1+0.2' }, { k: 'hand', n: 1, at: 'L1.t1+0.15' }, { k: 'hand', n: 2, at: 'L2.t1+0.15' }, { k: 'hand', n: 3, at: 'L3.t1+0.5' },
      { k: 'hands', at: 'L4.t0' },
      { k: 'bell', at: 'L4.t1+0.35' },
      { k: 'rise', at: 'L5.t0', to: 'L7.t0-0.3' },
      { k: 'clock', at: 'L6.t1+3.0', to: 'L7.t0' },
      { k: 'bell', at: 'L7.t1+0.3' }] },
  { shot: 'days', room: 'hall', tail: 1.8, lines: LD,
    cues: [{ k: 'cal', at: 0.8, to: 'end-0.8' }] },
  { shot: 'cleaner', room: 'night', tail: 2.6, lines: LN,
    cues: [{ k: 'open', at: 2.4 }, { k: 'enter', at: 3.0, to: 'L0.t1+1.2' },
      { k: 'mop', at: 'L0.t1+1.2', to: 'L1.t1+2.2' },
      { k: 'basket', at: 'L1@0.62' },
      { k: 'leave', at: 'L1.t1+2.2', to: 'L1.t1+4.6' }, { k: 'shut', at: 'L1.t1+5.0' }] },
  { shot: 'published', room: 'hall', tail: 5.8, lines: LB,
    cues: [{ k: 'turn', at: 'L0.t1+0.5' },
      { k: 'door', at: 'L1.t1+1.4' }] },
  { shot: 'end', d: 8.5 },
];
if (typeof module !== 'undefined') module.exports = { SCRIPT, CAST, DEF };
