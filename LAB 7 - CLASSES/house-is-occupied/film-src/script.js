/* The House Is Occupied. The score.
   From Watson Hartsoe's screenplay of the same name (second draft), after Italo Calvino, "The Burning of the Abominable House",
   in Numbers in the Dark, translated by Tim Parks. Nothing in it is quoted from Calvino; lines were checked against the story for
   shared six-word runs.
   The device: eleven minutes, 21:06 to 21:17, shown in the corner of each scene. The forecast picture that opens the film is a
   dot-matrix rendering of the film's own later frame (Belindo kneeling at the shutter), so the picture the audience is shown first
   is the picture the rescue arrives at.
   Lines carry who (a CAST key). One fulcrum line per scene is flagged line:true: tightest camera, slower delivery.
   Times in cues: numbers, 'end-1', 'L2.t1+0.5', or 'L2@0.35' (35 percent of the way through line 2; WT() finds it from a word). */
const CAST = {
  N: { name: 'Narrator', voice: 'bm_lewis', speed: 0.95 },
  W: { name: 'Waldemar', voice: 'bm_daniel', speed: 0.96 },
  K: { name: 'Skiller', voice: 'am_onyx', speed: 0.94 },
  R: { name: 'Widow Roessler', voice: 'bf_alice', speed: 0.9 },
  O: { name: 'Ogiva', voice: 'af_nova', speed: 0.96 },
  I: { name: 'Inigo', voice: 'am_puck', speed: 0.98 },
  B: { name: 'Belindo Kid', voice: 'am_fenrir', speed: 0.9, fx: 'gruff' },
  A: { name: 'Ada', voice: 'af_sarah', speed: 1.0, fx: 'phone' },
  V: { name: 'Recorded woman', voice: 'af_nicole', speed: 0.98, fx: 'record' },
  L: { name: 'Live operator', voice: 'am_eric', speed: 0.98, fx: 'phone' },
  C: { name: 'Fire captain', voice: 'am_adam', speed: 0.98 },
  M: { name: 'The replay', voice: 'af_sky', speed: 0.95, fx: 'synth' },
};
const WT = (ls, i, word, off = 0) => `L${i}@${(Math.max(0, ls[i].say.indexOf(word)) / ls[i].say.length).toFixed(3)}${off ? (off > 0 ? '+' : '') + off : ''}`;

/* ---- 21:06 the lab ---- */
const L1 = [
  { who: 'N', pre: 1.4, say: 'Six minutes past nine. A room above a rail yard.' },
  { who: 'N', pre: 0.5, say: 'Across the yard, a boarding house with four lit windows. In the doorway, a man in a singlet, smoking, with his boxing gloves on.' },
  { who: 'N', pre: 0.8, say: 'The printer feeds a second sheet.' },
  { who: 'W', pre: 0.9, say: 'Sixteen past, the order. Seventeen past, the fire.', line: true },
  { who: 'N', pre: 0.8, say: 'His invoice has come back from Reserve Mutual, with a cheque that nobody has signed. Payment on independent certification.' },
];
/* ---- the call ---- */
const L2 = [
  { who: 'K', pre: 1.2, say: 'Which one have you got?' },
  { who: 'W', pre: 0.4, say: 'Roessler. The forecast has a fire at seventeen past. Your schedule has an order at sixteen past.' },
  { who: 'K', pre: 0.4, say: 'That\'s how a forecast reads. One thing, then the next.' },
  { who: 'W', pre: 0.4, say: 'Your order is the first thing. Take the call off the schedule.' },
  { who: 'K', pre: 0.4, say: 'The call is the study. Take it off, and the forecast has nothing to be compared with.' },
  { who: 'W', pre: 0.4, say: 'There are four people in that house.' },
  { who: 'K', pre: 0.5, say: 'Then you have four people to watch. That is what the cheque is for.' },
  { who: 'K', pre: 0.9, say: 'Independent means you don\'t go in. Leave the house as you find it.', line: true },
];
/* ---- 21:08 the replay ---- */
const L3 = [
  { who: 'N', pre: 1.4, say: 'Eight minutes past. On his own copy of the case, he withholds the order.' },
  { who: 'M', pre: 0.6, say: 'Projected loss, none. Local copy only. Live schedule unchanged.' },
  { who: 'N', pre: 0.6, say: 'He adds a fifth name to the parties. Skiller.' },
  { who: 'M', pre: 0.5, say: 'Party must be insured at this address.' },
  { who: 'N', pre: 0.6, say: 'He types his own.' },
  { who: 'M', pre: 0.8, say: 'Observer. Cannot be entered.', line: true },
  { who: 'N', pre: 0.9, say: 'He folds the forecast and goes out without his coat.' },
];
/* ---- 21:10 the yard ---- */
const L4 = [
  { who: 'N', pre: 1.3, say: 'Ten past. He crosses the tracks.' },
  { who: 'B', pre: 1.2, say: 'Rent\'s paid.' },
  { who: 'W', pre: 0.4, say: 'Keep your gloves on.' },
  { who: 'N', pre: 0.6, say: 'Belindo looks at the man in the picture for longer than Waldemar expects. Then at the hair.' },
  { who: 'B', pre: 0.9, say: 'That\'s Ogiva\'s.', line: true },
];
/* ---- 21:11 the hall ---- */
const L5 = [
  { who: 'N', pre: 1.3, say: 'The front hall. A steel shutter rolled up over the stockroom door, its chain in a porcelain hand. A fan on the bottom step, its cable running in under the shutter.' },
  { who: 'W', pre: 0.6, say: 'Mrs. Roessler. Your insurer is going to telephone in five minutes, about the stockroom.' },
  { who: 'R', pre: 0.4, say: 'Which policy?' },
  { who: 'W', pre: 0.8, say: 'The house.' },
  { who: 'R', pre: 0.8, say: 'That\'s his. Up one flight. I only insure the people.', line: true },
];
/* ---- Ogiva's room ---- */
const L6 = [
  { who: 'B', pre: 1.2, say: 'He\'s got a picture of your red one.' },
  { who: 'N', pre: 0.6, say: 'She turns back the cap. Inside, a label with her name, sewn by hand.' },
  { who: 'O', pre: 0.8, say: 'That\'s the only one with my name in it.', line: true },
  { who: 'N', pre: 0.6, say: 'An envelope of banknotes and a snapshot of a small boy go inside her blouse. She lifts the wig stand by its iron foot, and puts it down.' },
  { who: 'W', pre: 0.4, say: 'Leave the rest.' },
  { who: 'O', pre: 0.4, say: 'The rest were never mine.' },
];
/* ---- 21:12 the landing and the stockroom ---- */
const L7 = [
  { who: 'I', pre: 1.3, say: 'Is that my stair?' },
  { who: 'W', pre: 0.4, say: 'They have a picture of every room.' },
  { who: 'I', pre: 1.0, say: 'They measured the rooms with me in them. They kept asking me to step outside.', line: true },
  { who: 'W', pre: 0.6, say: 'Everybody into the yard.' },
  { who: 'N', pre: 0.9, say: 'The fan cable runs to a socket beside a bricked-up door. The plate is hot. The tape on a splice has gone soft.' },
  { who: 'W', pre: 0.5, say: 'One way in. One way out.' },
];
/* ---- 21:13 the fire desk ---- */
const L8 = [
  { who: 'A', pre: 1.3, say: 'Fire desk. Is there smoke?' },
  { who: 'W', pre: 0.4, say: 'A socket\'s hot. The room has one way out, and in three minutes somebody is going to be told to drop a steel shutter across it.' },
  { who: 'A', pre: 0.4, say: 'Get everybody to the road. Address.' },
  { who: 'W', pre: 0.6, say: 'And write case zero one two on it.' },
  { who: 'A', pre: 1.0, say: 'Stay out once you\'re out.', line: true },
];
/* ---- 21:16 the order ---- */
const L9 = [
  { who: 'N', pre: 1.6, say: 'Fifteen past. Far off, a diesel horn.' },
  { who: 'V', pre: 2.4, say: 'This is a scheduled loss-prevention call from Reserve Mutual. Please close the stockroom shutter. When the shutter is closed, say closed. To decline the protection, say declined.' },
  { who: 'R', pre: 0.6, say: 'What happens if I say declined?' },
  { who: 'N', pre: 0.5, say: 'On the back of the forecast, in small type: cover subject to compliance with protective orders.' },
  { who: 'R', pre: 0.6, say: 'Can I give you the keys to four rooms and get four rooms back?' },
  { who: 'W', pre: 1.2, say: 'Inigo. Pull it at the wall.', line: true },
];
/* ---- 21:17 the fire ---- */
const L10 = [
  { who: 'I', pre: 3.2, say: 'Open it.' },
  { who: 'R', pre: 1.8, say: 'Give me your hand.' },
  { who: 'B', pre: 1.6, say: 'Stand up.' },
  { who: 'V', pre: 1.6, say: 'Please confirm the shutter is closed.' },
  { who: 'O', pre: 1.6, say: 'Get it up to here.' },
  { who: 'W', pre: 1.0, say: 'Say your name into this.' },
  { who: 'I', pre: 1.0, say: 'Inigo. I\'m in the stockroom.', line: true },
  { who: 'L', pre: 0.8, say: 'What is the status of the shutter?' },
  { who: 'R', pre: 0.5, say: 'It\'s down. I put it down when you told me.' },
  { who: 'L', pre: 0.5, say: 'I need the word closed.' },
  { who: 'O', pre: 1.6, say: 'Other shoulder first. Show me your ear.' },
];
/* ---- the picture ---- */
const L11 = [
  { who: 'N', pre: 2.6, say: 'Belindo stays where he is, on his knees, with the red wig in both hands.' },
  { who: 'N', pre: 1.2, say: 'It is the same picture.', line: true },
  { who: 'K', pre: 2.6, say: 'This is Reserve Mutual. I can confirm the shutter is closed.' },
  { who: 'O', pre: 0.7, say: 'Out. Now.' },
];
/* ---- 21:24 the count ---- */
const L12 = [
  { who: 'C', pre: 1.6, say: 'Everybody out?' },
  { who: 'R', pre: 2.6, say: 'Five. Count me.', line: true },
  { who: 'K', pre: 0.9, say: 'I have a record of a resident closing the shutter, and a photograph of the result.' },
  { who: 'O', pre: 1.2, say: 'That\'s what he lifted it with. Put that in your photograph.' },
];
/* ---- the evidence ---- */
const L13 = [
  { who: 'C', pre: 1.4, say: 'Who took this one?' },
  { who: 'W', pre: 0.4, say: 'A printer. At six minutes past nine.' },
  { who: 'K', pre: 0.4, say: 'It\'s an exercise.' },
  { who: 'C', pre: 1.0, say: 'It\'s eleven minutes early.', line: true },
  { who: 'K', pre: 0.9, say: 'You walked into a house you were paid to watch. You sent a man into that room. Do you want that on the record?' },
  { who: 'W', pre: 0.6, say: 'Yes.' },
  { who: 'N', pre: 0.5, say: 'He writes two lines under the picture. Nine past nine, I crossed the yard. Sixteen past, I sent Inigo to the socket. He signs.' },
  { who: 'W', pre: 0.5, say: 'Now ask her who told her to drop the shutter.' },
  { who: 'R', pre: 0.5, say: 'The woman on the telephone. Then he came in and said closed.' },
  { who: 'A', pre: 0.8, say: 'Zero one two. Twenty-one thirteen. Order to drop the stockroom shutter. It\'s on my slip.' },
  { who: 'R', pre: 0.5, say: 'I wrote it in duplicate.' },
];
/* ---- the participant ---- */
const L14 = [
  { who: 'K', pre: 1.4, say: 'You\'ve just signed as a participant.', line: true },
  { who: 'C', pre: 1.2, say: 'Any more calls on that schedule?' },
  { who: 'K', pre: 1.4, say: 'Three.' },
  { who: 'C', pre: 0.6, say: 'Give the desk the addresses.' },
  { who: 'N', pre: 0.8, say: 'To take the radio, Skiller has to put the wig down. He looks for somewhere dry. In the end he puts it on his own folder.' },
];
/* ---- dawn ---- */
const L15 = [
  { who: 'N', pre: 1.6, say: 'Before dawn, in the lab. The widow copies a rent receipt. Ogiva picks a knot out of the wig. Inigo brings five mugs.' },
  { who: 'N', pre: 0.6, say: 'Waldemar writes the fire desk\'s number on the back of the cheque.' },
  { who: 'N', pre: 1.2, say: 'The printer strikes once. Case zero one three.' },
  { who: 'W', pre: 1.6, say: 'Ada. Case zero one three.', line: true },
  { who: 'N', pre: 1.4, say: 'The widow sets a stone from the track against the door, and it stays open.' },
];

const SCRIPT = [
  { shot: 'title', d: 15.0, clock: '',
    cues: [{ k: 'print', at: 1.0, to: 8.6 }, { k: 'caption', at: 8.8 }, { k: 'name', at: 11.2 }] },
  { shot: 'lab', clock: '21:06', tail: 1.2, lines: L1,
    cues: [{ k: 'sheet', at: 'L2.t0+0.3', to: 'L2.t1' }, { k: 'cheque', at: 'L4.t0' }] },
  { shot: 'call', clock: '21:07', tail: 1.0, lines: L2,
    cues: [{ k: 'staple', at: 'L6.t1' }, { k: 'click', at: 'end-0.6' }] },
  { shot: 'replay', clock: '21:08', tail: 1.2, lines: L3,
    cues: [{ k: 'withhold', at: 'L0.t1-0.6' }, { k: 'party', at: 'L2.t1-0.4' }, { k: 'own', at: 'L4.t1-0.3' }, { k: 'go', at: 'L6.t0+0.6' }] },
  { shot: 'yard', clock: '21:10', tail: 1.4, lines: L4,
    cues: [{ k: 'cross', at: 0, to: 'L0.t1+1.0' }, { k: 'unfold', at: 'L2.t1+0.2' }, { k: 'enter', at: 'end-1.2' }] },
  { shot: 'hall', clock: '21:11', tail: 1.2, lines: L5,
    cues: [{ k: 'climb', at: 'L4.t1-0.4' }] },
  { shot: 'ogiva', clock: '21:11', tail: 1.2, lines: L6,
    cues: [{ k: 'label', at: 'L1.t0' }, { k: 'blouse', at: 'L3.t0+0.4' }, { k: 'stand', at: WT(L6, 3, 'lifts', 0) }] },
  { shot: 'landing', clock: '21:12', tail: 1.3, lines: L7,
    cues: [{ k: 'down', at: 'L3.t1' }, { k: 'touch', at: WT(L7, 4, 'plate', 0) }] },
  { shot: 'desk', clock: '21:13', tail: 1.0, lines: L8,
    cues: [{ k: 'stamp', at: 'L2.t1+0.3' }, { k: 'margin', at: 'L3.t1' }] },
  { shot: 'order', clock: '21:16', tail: 8.0, lines: L9,
    cues: [{ k: 'boots', at: 0.4 }, { k: 'spoon', at: 'L0.t1' }, { k: 'ring', at: 'L1.t0-1.9' }, { k: 'back', at: 'L3.t0' },
      { k: 'spark', at: 'L4.t1+0.3' }, { k: 'go', at: 'L5.t1+0.3' }, { k: 'train', at: 'L5.t1+1.2', to: 'end' },
      { k: 'ask', at: 'L5.t1+2.6' }, { k: 'chain', at: 'L5.t1+4.6' }] },
  { shot: 'fire', clock: '21:17', tail: 4.5, lines: L10,
    cues: [{ k: 'flame', at: 0.2, to: 'end' }, { k: 'fingers', at: 'L0.t1+0.3' }, { k: 'heat', at: 'L1.t1+0.3' },
      { k: 'lift1', at: 'L2.t1+0.2' }, { k: 'glove', at: 'L3.t1+0.2' }, { k: 'iron', at: 'L4.t1+0.2' },
      { k: 'mouth', at: 'L5.t0-0.4' }, { k: 'lamp2', at: 'L6.t1' }, { k: 'tile', at: 'L9.t1+0.2' },
      { k: 'lift2', at: 'L9.t1+0.9' }, { k: 'pull', at: 'L10.t1+0.2', to: 'end' }] },
  { shot: 'picture', clock: '21:18', tail: 1.2, lines: L11,
    cues: [{ k: 'match', at: 'L1.t0-0.4' }, { k: 'flash', at: 'L1.t1+1.2' }, { k: 'phone', at: 'L2.t0' }] },
  { shot: 'count', clock: '21:24', tail: 1.2, lines: L12,
    cues: [{ k: 'touch', at: 'L0.t1+0.3', to: 'L1.t0' }, { k: 'form', at: 'L2.t0' }, { k: 'wig', at: 'L3.t0-0.5' }] },
  { shot: 'evidence', clock: '21:26', tail: 1.2, lines: L13,
    cues: [{ k: 'pair', at: 0.4 }, { k: 'write', at: 'L6.t0+1.0', to: 'L6.t1' }, { k: 'radio', at: 'L9.t0-0.4' }, { k: 'carbon', at: 'L10.t0' }] },
  { shot: 'participant', clock: '21:29', tail: 1.4, lines: L14,
    cues: [{ k: 'cert', at: 0.4 }, { k: 'handover', at: 'L0.t1+0.4' }, { k: 'radio', at: 'L3.t1+0.2' }] },
  { shot: 'dawn', clock: '05:52', tail: 3.0, lines: L15,
    cues: [{ k: 'strike', at: 'L2.t0' }, { k: 'tear', at: 'L3.t0-0.8' }, { k: 'stone', at: 'L4.t0', to: 'L4.t1' }, { k: 'train', at: 'L4.t1-0.2', to: 'end' }] },
  { shot: 'end', d: 8.0, cues: [] },
];
if (typeof module !== 'undefined') module.exports = { SCRIPT, CAST };
