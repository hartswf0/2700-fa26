/* The Fifth Sally (A), or Trurl's Prescription: the score. After Stanislaw Lem, The Cyberiad.
   The device: force fails against the thing, procedure wins.
   The thing is an ink drawing in the upper band of the frame. Its size is its only readout: there is no number.
   Four attacks (the comet, which works, then the scarechrome, the hydraulic engine and the megalomechanism, and the vine)
   each fail louder and bigger than the one before, and the thing does not change. Then Trurl has one notice delivered.
   The thing signs for it, and from then on it shrinks while an office grows in ink in the lower stage, until it is a damp spot.
   One fulcrum line per scene is flagged line:true. It is filmed on the tightest camera and delivered more slowly.
   Times in cues: numbers, 'end-1', 'L2.t1+0.5', or 'L2@0.35' (35 percent of the way through line 2; WT() finds it from a word).
   Everything paraphrases Lem ("The Fifth Sally (A), or Trurl's Prescription", The Cyberiad). The notice is invented. */
const CAST = {
  N: { name: 'Narrator', voice: 'bf_emma', speed: 0.92 },
  T: { name: 'Trurl', voice: 'bm_lewis', speed: 1.02 },
  S: { name: 'The Steelypip spokesperson', voice: 'af_nova', speed: 1.0 },
  P: { name: 'The Steelypips', voice: 'af_sky', speed: 0.98, many: ['af_sky', 'am_puck', 'bf_lily', 'af_river', 'am_echo', 'bm_fable', 'af_bella'] },
  M: { name: 'The mailman', voice: 'bm_daniel', speed: 1.12 },
  B: { name: 'The scarechrome', voice: 'am_onyx', speed: 1.05, fx: 'mech' },
  G: { name: 'The servospook', voice: 'af_kore', speed: 0.84, fx: 'spook' },
};
const WT = (ls, i, word, off = 0) => `L${i}@${(Math.max(0, ls[i].say.indexOf(word)) / ls[i].say.length).toFixed(3)}${off ? (off > 0 ? '+' : '') + off : ''}`;

/* ---- the office: forty things, each appears once, in this order. Positions are stage coordinates (the floor is at y 560 to 698). ---- */
const OFFICE = [
  { k: 'desk', x: 560, y: 548 }, { k: 'typewriter', x: 520, y: 548 }, { k: 'chair', x: 320, y: 650 }, { k: 'stamp', x: 640, y: 548 },
  { k: 'paper', x: 700, y: 548 }, { k: 'window', x: 150, y: 560 }, { k: 'sign', x: 150, y: 330, t: 'WINDOW 2' }, { k: 'pigeon', x: 760, y: 470, c: 6, r: 4 },
  { k: 'clips', x: 590, y: 548 }, { k: 'bands', x: 436, y: 330 }, { k: 'cabinet', x: 900, y: 560 }, { k: 'stain', x: 600, y: 548 },
  { k: 'stamp', x: 470, y: 548 }, { k: 'sign', x: 330, y: 300, t: 'FORMS' }, { k: 'paper', x: 280, y: 660, big: 1 }, { k: 'cabinet', x: 980, y: 560 },
  { k: 'ink', x: 680, y: 548 }, { k: 'web', x: 22, y: 270, f: 1 }, { k: 'sign', x: 520, y: 296, t: 'BACK IN AN HOUR' }, { k: 'cabinet', x: 1060, y: 560 },
  { k: 'stain', x: 430, y: 680, big: 1 }, { k: 'paper', x: 880, y: 660, big: 1 }, { k: 'cabinet', x: 820, y: 560 }, { k: 'web', x: 1258, y: 270, f: -1 },
  { k: 'spoon', x: 610, y: 548 }, { k: 'pigeon', x: 420, y: 470, c: 4, r: 3 }, { k: 'sign', x: 800, y: 300, t: 'STAFF ONLY' }, { k: 'stain', x: 700, y: 650, big: 1 },
  { k: 'cabinet', x: 740, y: 560 }, { k: 'notes', x: 960, y: 310 }, { k: 'web', x: 700, y: 270, f: 1, s: 0.7 }, { k: 'clock', x: 1090, y: 330 },
  { k: 'paper', x: 380, y: 548 }, { k: 'sign', x: 1000, y: 300, t: 'NEXT' }, { k: 'stain', x: 520, y: 548 }, { k: 'plant', x: 60, y: 660 },
  { k: 'paper', x: 560, y: 668, big: 1 }, { k: 'stamp', x: 760, y: 548 }, { k: 'umbrella', x: 1230, y: 660 }, { k: 'web', x: 360, y: 270, f: -1, s: 0.8 },
];
const OFFICE_D = 62;              // the office scene is 62 seconds long: the items arrive faster and faster inside it
const OFF_A = 1.0, OFF_B = 54.0;  // seconds into the scene when the first and last items arrive
const officeAt = (i) => OFF_A + (OFF_B - OFF_A) * Math.pow(i / (OFFICE.length - 1), 1.75);
/* the mailman's trip phase and the typing rhythm are functions of the same ramp */
const ramp = (t) => Math.min(1, Math.max(0, (t - OFF_A) / (OFF_B - OFF_A)));

/* ---- 1. the machine, and the comet ---- */
const L1 = [
  { who: 'N', pre: 1.6, say: 'Beyond a green star, close to a white sun, lived a people called the Steelypips. They had no quarrels and no lessons. They lived on, in, and under one machine.' },
  { who: 'N', pre: 0.7, say: 'It was a fine machine of gears and springs. They had built it from their own saved atoms.' },
  { who: 'S', pre: 0.9, say: 'We made it ourselves, so there is nothing in it to fix.', line: true },
  { who: 'N', pre: 0.9, say: 'One day a comet came by, in a lace bonnet, with four long tails and a smell of almonds. She said she would burn them to the ground, as a start.' },
  { who: 'S', pre: 0.6, say: 'One moment, madam. This machine has no faults. Please leave, or you will be sorry.' },
  { who: 'N', pre: 0.8, say: 'She filled the sky with fire, until their old moon curled up at both tips. So the Steelypips wrapped their strongest fields around it, and threw the switch.' },
  { who: 'N', pre: 2.4, say: 'The sky cleared with a bang. All that was left of the comet was a bit of ash. The Steelypips went back to being pleased.' },
];
/* ---- 2. something arrives ---- */
const L2 = [
  { who: 'N', pre: 1.2, say: 'Some time later, something came down from the sky. Nobody knew what it was. It landed on the highest peak, very heavily, and nobody wanted a second look.' },
  { who: 'S', pre: 0.7, say: 'Pardon us, but this is a very good machine. Please move along.' },
  { who: 'N', pre: 1.1, say: 'It did not move. It did not attack either. It just stayed.', line: true },
  { who: 'N', pre: 0.8, say: 'So, to save money, they sent a small scarechrome to frighten it.' },
  { who: 'B', pre: 0.5, say: 'Fear me. I am terrible. Fear me.' },
  { who: 'N', pre: 0.8, say: 'It hissed and spat and frightened itself a little. The thing stayed. It tried a second frequency, but its heart was not in it.' },
];
/* ---- 3. force ---- */
const L3 = [
  { who: 'S', pre: 1.0, say: 'Something heavier, then. Hydraulic, with plenty of muscle, and a scarechrome on top for luck.' },
  { who: 'N', pre: 0.7, say: 'The great engine rolled out. It wound itself up, and counted down from four.' },
  { who: 'N', pre: 3.9, say: 'Oil bubbled and gears rattled. Not a scratch.' },
  { who: 'N', pre: 0.8, say: 'The Steelypips held a council of war. They built a machine to build a machine to build a machine so large that the nearest stars stepped back, with a servospook at its heart.' },
  { who: 'G', pre: 0.6, say: 'I am the servospook. I mean business.' },
  { who: 'N', pre: 0.6, say: 'It gathered all its strength, and let go.' },
  { who: 'N', pre: 9.4, say: 'When the dark cleared, there was only scrap metal, ticking as it cooled.' },
  { who: 'N', pre: 1.3, say: 'Each weapon had been bigger than the last. The thing was the same size.', line: true },
];
/* ---- 4. the vine, and despair ---- */
const L4 = [
  { who: 'S', pre: 1.0, say: 'Then we must be patient. We will send a cyberivy, to creep up quietly and take its time.' },
  { who: 'N', pre: 0.8, say: 'The ivy crept up as if it had nothing on its mind. It sent out a root, then another, and closed in from behind. It went exactly as planned, and when it was over, it was not over.' },
  { who: 'N', pre: 0.7, say: 'They made nets and glues, lassos and screws, traps and walls, and turned the machine upside down. Nothing helped.' },
  { who: 'S', pre: 1.5, say: 'This has never happened to us before. We do not know what to do with our hands.', line: true },
];
/* ---- 5. Trurl arrives ---- */
const L5 = [
  { who: 'N', pre: 1.2, say: 'Then someone came along on a vehicle nobody could name. It had a horse’s head, one bicycle wheel and a rocket’s tail. The rider was Trurl, out on one of his trips.' },
  { who: 'P', pre: 0.6, say: 'We tried everything. It is still there.', many: { conv: false } },
  { who: 'T', pre: 0.7, say: 'Did you try anything that was not a weapon?' },
  { who: 'S', pre: 0.5, say: 'What else is there? We have gears, springs, and force.' },
  { who: 'T', pre: 0.7, say: 'I can stay a little while, as an adviser. Is that agreeable?' },
  { who: 'S', pre: 0.5, say: 'Of course! Shall we bring hammers, artillery, dynamite? Coffee or tea? The vending machine makes both.' },
  { who: 'T', pre: 0.6, say: 'Coffee. Not for me, for the job. The rest, no.' },
  { who: 'T', pre: 1.0, say: 'Force has failed, so we will use forms.', line: true },
  { who: 'T', pre: 0.8, say: 'I need paper and ink, stamps and seals, a teller’s window, a zinc spoon, a saucer, coffee, and a mailman. And something to write with.' },
  { who: 'P', pre: 0.4, say: 'We will fetch it!', many: { conv: false } },
];
/* ---- 6. the first notice ---- */
const L6 = [
  { who: 'N', pre: 1.0, say: 'Trurl sat down, and dictated the first notice.' },
  { who: 'T', pre: 0.6, say: 'Regarding the obstruction of these premises, under Form Four, subsection Q: all services to the occupant are withdrawn, pending review. Appeals must be in writing, on the correct forms.' },
  { who: 'N', pre: 0.7, say: 'He sealed it, stamped it, entered it in the ledger, and checked the register. Then he sent for the mailman.' },
  { who: 'N', pre: 0.7, say: 'The mailman took it away. They waited.' },
  { who: 'T', pre: 5.6, say: 'Was it delivered?' },
  { who: 'M', pre: 0.4, say: 'It was.' },
  { who: 'T', pre: 0.4, say: 'And the receipt?' },
  { who: 'M', pre: 0.4, say: 'Signed, on this line. And here is its appeal.' },
  { who: 'T', pre: 1.6, say: 'Once it took delivery of the first notice, it belonged to the paperwork.', line: true },
  { who: 'N', pre: 0.9, say: 'Without reading the appeal, he sent it back. Across the front he wrote, in a hurry, wrong forms, and signed with a scrawl no one could read.' },
  { who: 'T', pre: 0.6, say: 'Now, to work.' },
];
/* ---- 7. the office ---- */
const L7 = [
  { who: 'N', pre: 1.0, say: 'The mailman ran all day. Trurl stamped and filed. The typewriter chattered, and an office grew out of nothing: stamps and rubber bands, paper clips, pigeonholes, filing cabinets, signs, coffee rings, cobwebs.' },
  { who: 'N', pre: 0.5, say: 'Notices went out, then reminders, then final demands.' },
  { who: 'S', pre: 6.0, say: 'It is smaller. It really is smaller.', line: true },
  { who: 'T', pre: 1.2, say: 'Next, please. The window is closed. Come back in an hour.' },
  { who: 'N', pre: 2.2, say: 'The coffee went cold. An official was offered a bribe, and filed it. New cabinets arrived, and cobwebs reached from wall to wall.' },
  { who: 'N', pre: 3.0, say: 'The typewriter typed an order that the occupant must leave, and may not appeal.' },
];
/* ---- 8. the clearing ---- */
const L8 = [
  { who: 'N', pre: 1.0, say: 'Then Trurl stood up and threw it all out into deep space: the desks, the chairs, the stamps, the seals, the pigeonholes. Only the vending machine stayed.' },
  { who: 'S', pre: 0.5, say: 'What are you doing? We had grown used to it!' },
  { who: 'T', pre: 0.6, say: 'Take a look instead, friends.' },
  { who: 'N', pre: 1.0, say: 'They looked, and the thing was gone. It had shrunk and shrunk, until they needed a magnifying glass. All they could find was one small damp spot, where something had dripped.' },
  { who: 'S', pre: 0.6, say: 'But why throw out the papers, and pour out the coffee?' },
  { who: 'T', pre: 0.9, say: 'Throw it all out, or the office will start on you.', line: true },
  { who: 'N', pre: 0.9, say: 'He nodded to them kindly, climbed onto his odd vehicle, and flew away, smiling.' },
];

const SCRIPT = [
  { shot: 'title', d: 6.0 },
  { shot: 'machine', room: 'open', tail: 1.2, lines: L1, curve: { size: [[0, 0], ['end', 0]] },
    cues: [{ k: 'comet', at: 'L3.t0+3.0', to: 'L5.t0+5.5' },
      { k: 'moon', at: WT(L1, 5, 'until their old moon'), to: WT(L1, 5, 'So the Steelypips') },
      { k: 'fields', at: WT(L1, 5, 'wrapped'), to: 'L5.t1+0.1' },
      { k: 'switch', at: 'L5.t1+0.5' },
      { k: 'ash', at: 'L5.t1+0.7', to: 'L6.t1' },
      { k: 'calm', at: 'L6.t0' }] },
  { shot: 'arrival', room: 'hall', tail: 1.2, lines: L2,
    curve: { size: [[0, 0], ['L0.t0+4.7', 0], ['L0.t0+4.75', 1], ['end', 1]] },
    cues: [{ k: 'land', at: 'L0.t0+4.7' },
      { k: 'look', at: 'L0.t0+6.0' },
      { k: 'scare_go', at: 'L3.t0+2.2', to: 'L4.t0+0.5' },
      { k: 'bark', at: 'L4.t0+0.2' },
      { k: 'hiss', at: 'L5.t0+0.3', to: 'L5.t0+4.6' },
      { k: 'second', at: WT(L2, 5, 'second frequency') },
      { k: 'scare_back', at: 'L5.t1-1.8', to: 'end-0.2' }] },
  { shot: 'force', room: 'hall', tail: 1.0, lines: L3, curve: { size: [[0, 1], ['end', 1]] },
    cues: [{ k: 'hy_in', at: 'L1.t0-0.2', to: 'L1.t1+0.1' },
      { k: 'tick', n: 4, at: 'L1.t1+0.3' }, { k: 'tick', n: 3, at: 'L1.t1+0.95' }, { k: 'tick', n: 2, at: 'L1.t1+1.6' }, { k: 'tick', n: 1, at: 'L1.t1+2.25' },
      { k: 'blast1', at: 'L1.t1+3.0', to: 'L2.t0+0.6' },
      { k: 'council', at: 'L3.t0-0.3' },
      { k: 'build', at: WT(L3, 3, 'a machine to build'), to: WT(L3, 3, 'so large') },
      { k: 'stars', at: WT(L3, 3, 'the nearest stars') },
      { k: 'mega_in', at: 'L3.t0+2.0', to: 'L5.t0+0.3' },
      { k: 'spook', at: 'L4.t0' },
      { k: 'charge', at: 'L5.t0', to: 'L5.t1+1.2' },
      { k: 'blast2', at: 'L5.t1+1.6', to: 'L5.t1+4.8' },
      { k: 'dark', at: 'L5.t1+1.6', to: 'L5.t1+8.2' },
      { k: 'quiet', at: 'L5.t1+4.2', to: 'L6.t0-0.2' },
      { k: 'scrap', at: 'L5.t1+5.2' }] },
  { shot: 'ivy', room: 'hall', tail: 1.2, lines: L4, curve: { size: [[0, 1], ['end', 1]] },
    cues: [{ k: 'ivy', at: 'L1.t0+0.4', to: 'L1.t0+10.0' },
      { k: 'wrap', at: WT(L4, 1, 'closed in') },
      { k: 'wilt', at: 'L1.t1-1.0', to: 'L1.t1+1.4' },
      { k: 'tools', at: 'L2.t0', to: 'L2.t1' },
      { k: 'slump', at: 'L3.t0-0.6' }] },
  { shot: 'trurl', room: 'hall', tail: 1.2, lines: L5, curve: { size: [[0, 1], ['end', 1]] },
    cues: [{ k: 'ride', at: 0.4, to: 'L0.t0+9.4' },
      { k: 'list', n: 0, at: WT(L5, 8, 'paper') }, { k: 'list', n: 1, at: WT(L5, 8, 'stamps') }, { k: 'list', n: 2, at: WT(L5, 8, 'a teller') },
      { k: 'list', n: 3, at: WT(L5, 8, 'a zinc spoon') }, { k: 'list', n: 4, at: WT(L5, 8, 'a saucer') }, { k: 'list', n: 5, at: WT(L5, 8, 'coffee, and') }, { k: 'list', n: 6, at: WT(L5, 8, 'a mailman') },
      { k: 'run', at: 'L9.t0-0.1', to: 'end' }] },
  { shot: 'notice', room: 'office', tail: 1.6, lines: L6,
    curve: { size: [[0, 1], ['L4.t0-1.0', 1], ['L4.t0-0.6', 0.97], ['L8.t0', 0.96], ['end', 0.92]] },
    cues: [{ k: 'dict', at: 'L1.t0', to: 'L1.t1' },
      { k: 'seal', at: WT(L6, 2, 'sealed') }, { k: 'stamp', at: WT(L6, 2, 'stamped') }, { k: 'ledger', at: WT(L6, 2, 'entered') }, { k: 'register', at: WT(L6, 2, 'checked') }, { k: 'call', at: WT(L6, 2, 'Then he sent') },
      { k: 'mail_out', at: 'L3.t0+0.5', to: 'L3.t1+0.8' },
      { k: 'deliver', at: 'L3.t1+1.0' },
      { k: 'sign', at: 'L3.t1+1.7' },
      { k: 'mail_back', at: 'L3.t1+2.6', to: 'L4.t0-0.4' },
      { k: 'receipt', at: 'L5.t0', to: 'end' },
      { k: 'wrong', at: WT(L6, 9, 'wrote'), to: WT(L6, 9, 'and signed') },
      { k: 'return', at: WT(L6, 9, 'and signed') }] },
  { shot: 'office', room: 'office', d: OFFICE_D, lines: L7,
    curve: { size: [[0, 0.92], [8, 0.84], [16, 0.7], [26, 0.52], [36, 0.38], [46, 0.26], [54, 0.2], ['end', 0.18]] },
    cues: [{ k: 'build', at: OFF_A, to: OFF_B }]
      .concat(OFFICE.map((o, i) => ({ k: 'item', i, kind: o.k, at: Number(officeAt(i).toFixed(2)) }))) },
  { shot: 'clear', room: 'open', tail: 4.6, lines: L8,
    curve: { size: [[0, 0.18], ['L0.t0+1.0', 0.16], ['L1.t0', 0.1], ['L2.t1', 0.05], ['L3.t0+1.0', 0.012], ['L3.t0+3.0', 0]] },
    cues: [{ k: 'hurl', at: WT(L8, 0, 'threw it'), to: WT(L8, 0, 'Only the vending') },
      { k: 'look', at: 'L2.t0' },
      { k: 'loupe', at: WT(L8, 3, 'a magnifying'), to: 'end' },
      { k: 'pour', at: 'L5.t0-1.2', to: 'L5.t1+0.6' },
      { k: 'fly', at: 'L6.t0+1.0', to: 'L6.t1+1.6' },
      { k: 'drip', at: 'end-2.3' }] },
  { shot: 'end', d: 8 },
];
if (typeof module !== 'undefined') module.exports = { SCRIPT, CAST, OFFICE, OFFICE_D };
