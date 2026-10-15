/* Altruizine: the score. Fourth in the lineage.
   The Seventh Sally commands a world, Non Serviam listens to one, the Storytelling Machines
   nest worlds inside each other. Here nothing is nested: the drug copies whatever one person
   feels into every neighbour within fifty yards, and the copies feed back.
   The picture does the same: in the grid shots the source panel's image is copied into the
   panels around it as the feeling reaches them, and every voice is copied by its neighbours.
   Bonhomius is a robot. The drug does nothing to him, so his voice is never copied.
   Lines paraphrase Lem ("Altruizine", The Cyberiad).
   A wave cue: {k:'wave', at, src:[col,row], feel, speed (cells/s), dur, cry (sound)}. */
const CAST = {
  B: { name: 'Bonhomius', voice: 'am_adam', speed: 0.9 },
  T: { name: 'Trurl', voice: 'bm_lewis', speed: 1.0 },
  K: { name: 'Klapaucius', voice: 'bm_george', speed: 0.88 },
  G: { name: 'The Gnostotron', voice: 'am_onyx', speed: 0.8, fx: 'god' },
  P: { name: 'A policeman', voice: 'am_eric', speed: 0.92 },
};
const SCRIPT = [
  { shot: 'yard', room: 'yard', tail: 1.6, cues: [{ k: 'collapse', at: 1.6 }, { k: 'repair', at: 4.6, to: 9.0 }], lines: [
    { who: 'T', at: 9.6, say: 'Hold still. There. What happened to you?' },
    { who: 'B', pre: 1.0, say: 'I was a hermit, kind sir, sixty-seven years in a cave. One morning I saw that it was wrong to live alone, when my first duty was to help my neighbour.' },
    { who: 'B', pre: 0.8, say: 'In the city I met your friend Klapaucius. He had gone looking for the beings at the Highest Possible Level of Development.' },
  ] },
  { shot: 'title', d: 5.5 },
  { shot: 'cube', room: 'sand', tail: 3.4, lines: [
    { who: 'B', pre: 1.6, say: 'He found them on a square planet, under a square sun.' },
    { who: 'K', pre: 2.6, say: 'Excuse me. Is this the Highest Possible Level of Development?' },
    { who: 'B', pre: 4.2, say: 'They lay in the sand and scratched themselves, and would not answer.' },
  ] },
  { shot: 'gnosto', room: 'machine', tail: 2.4, cues: [{ k: 'print', at: -1 }], lines: [
    { who: 'B', pre: 1.2, say: 'So he built a machine that could model one of them, and asked it instead.' },
    { who: 'K', pre: 1.0, say: 'If you are gods, your duty is clear. Banish the misery of others!' },
    { who: 'G', pre: 1.0, say: 'We tried, sixty-four thousand times. When a civilization starts straightening humps, there is no end to it.' },
    { who: 'G', pre: 1.6, say: 'One can accomplish something only so long as one cannot accomplish everything.', line: true },
    { who: 'B', pre: 1.4, say: 'Surely there is something you can give us!' },
    { who: 'G', pre: 1.0, say: 'Very well. Here is a formula that has not been tried. No good will come of it.' },
  ] },
  { shot: 'card', room: 'machine', tail: 2.4, lines: [
    { who: 'B', pre: 4.4, say: 'Whoever takes it, everyone within fifty yards feels what he feels. It has no effect on robots.' },
  ] },
  { shot: 'inn', room: 'yard', d: 26, grid: [4, 4], open: [6.6, 10.6], src: [3, 1], well: [1, 2], cues: [
    { k: 'pinch', at: 3.0 },
    { k: 'wave', at: 11.0, src: [3, 1], feel: 'labor', speed: 2.2, dur: 3.6, cry: 'moo' },
    { k: 'wave', at: 15.6, src: [3, 1], feel: 'labor', speed: 2.6, dur: 3.6, cry: 'moo' },
    { k: 'wave', at: 20.0, src: [3, 1], feel: 'labor', speed: 3.0, dur: 4.0, cry: 'moo' },
  ], lines: [
    { who: 'B', at: 0.6, say: 'I dropped one pinch into the well of a country inn.' },
    { who: 'B', at: 4.4, say: 'In the barn, a cow was giving birth.' },
  ] },
  { shot: 'bridge', room: 'yard', tail: 3.0, cues: [{ k: 'spill', at: 3.2 }], lines: [
    { who: 'B', pre: 0.8, say: 'On the bridge to the city my suitcase fell open.' },
    { who: 'B', pre: 3.0, say: 'Forty kilograms went into the stream the whole city drinks from.' },
  ] },
  { shot: 'city', room: 'city', d: 36.4, grid: [5, 5], open: [5.8, 7.6], src: [1, 2], cues: [
    { k: 'wave', at: 5.0, src: [1, 2], feel: 'blow', speed: 3.0, dur: 2.6, cry: 'ow' },
    { k: 'wave', at: 10.4, src: [4, 1], feel: 'ache', speed: 2.4, dur: 3.4, cry: 'aah' },
    { k: 'wave', at: 16.6, src: [3, 3], feel: 'fear', speed: 4.0, dur: 5.0, cry: 'scream', cat: true },
    { k: 'wave', at: 23.4, src: [4, 0], feel: 'sneeze', speed: 6.0, dur: 1.4, cry: 'achoo' },
    { k: 'wave', at: 28.8, src: [0, 3], feel: 'grief', speed: 2.0, dur: 5.0, cry: 'sob' },
  ], lines: [
    { who: 'B', at: 1.0, say: 'By night the city had drunk it.' },
    { who: 'B', at: 11.8, say: 'A toothache was everyone’s toothache.' },
    { who: 'B', at: 19.0, say: 'A cat chased a mouse in the cellar, and the whole hotel ran.' },
    { who: 'B', at: 31.4, say: 'They drove a widow out of town, because they could not bear her grief.' },
  ] },
  { shot: 'police', room: 'city', d: 19, grid: [4, 4], open: [9.4, 11.4], src: [1, 1], me: [2, 1], cues: [
    { k: 'punch', at: 5.4 },
    { k: 'wave', at: 5.5, src: [1, 1], feel: 'blow', speed: 6, dur: 9.0, cry: 'ow' },
  ], lines: [
    { who: 'B', at: 0.6, say: 'Then two men stopped in front of me. One struck the other in the face.' },
    { who: 'P', at: 13.0, say: 'That one felt nothing.', line: true },
  ] },
  { shot: 'cannon', room: 'space', tail: 3.6, cues: [{ k: 'fire', at: 2.2 }], lines: [
    { who: 'B', pre: 4.0, say: 'They broke every plate in me, and fired what was left out of a cannon. Going up, I could see the rivers carrying it on.' },
    { who: 'B', pre: 2.2, say: 'I only wished to make them happy.', line: true },
  ] },
  { shot: 'yard2', room: 'yard', tail: 4.0, lines: [
    { who: 'T', pre: 1.2, say: 'And now?' },
    { who: 'B', pre: 1.0, say: 'Now I am cured, kind sir, of making anyone happy by revolutionary means.' },
  ] },
  { shot: 'end', d: 6 },
];
if (typeof module !== 'undefined') module.exports = { SCRIPT, CAST };
