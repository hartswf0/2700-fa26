/* The Perfect Description of an Empty Room. The score. Film four of THE HOUSE THAT LANGUAGE BUILT, four fables of Edifiction:
   an original fable from Watson Hartsoe's notes "The House That Language Built" (premise 3, and Part IV on the moving-image
   archive: thin, thick and operative description), written in the manner of Stanislaw Lem. All wording is new.
   The invention: the Bureau of Reconstruction's Edifier rebuilds a demolished street from its archival photographs. The rule it
   follows is the photograph. The hidden assumption: the surveyors photographed the street the week after its families left, so
   every photograph is a perfect description of an empty room. Sound carries what the photographs could not hold: the floorboard
   that learns to creak, the clock before the late sun, the kettle in one kitchen and not the other.
   Lines carry who (a CAST key). One fulcrum line per scene is flagged line:true: tightest camera, slower delivery.
   Times in cues: numbers, 'end-1', 'L2.t1+0.5', or 'L2@0.35'. A 'fall' cue carries the sentence that becomes a building; its
   words land at at + i * (to - at - 0.7) / (n - 1) + 0.7, and picture and sound both use that rule. */
const CAST = {
  N: { name: 'Narrator', voice: 'bm_lewis', speed: 0.94 },
  E: { name: 'The Edifier', voice: 'af_nicole', speed: 1.0, fx: 'edifier' },
  H: { name: 'Hanna Rusk', voice: 'bf_isabella', speed: 0.88, fx: 'aged' },
  M: { name: 'Emil Rusk', voice: 'bm_daniel', speed: 0.88, fx: 'aged' },
  P: { name: 'Mr Pell', voice: 'bm_fable', speed: 0.9, fx: 'aged' },
  D: { name: 'Mrs Lind', voice: 'bf_alice', speed: 0.9, fx: 'aged' },
  A: { name: 'The Archivist', voice: 'bf_lily', speed: 0.97 },
};
const S7 = 'No. 7. Two storeys of brick. Door on the left, one step up. Two windows below, two above. Slate roof, one chimney.';
const SH = 'A kitchen. The table under the window. A blue cupboard by the door. The kettle on the stove.';
const SE = 'A kitchen. The table by the stove. No cupboard. A tea tin on the shelf.';

/* ---- 1. the street that is not there, and its photographs ---- */
const L0 = [
  { who: 'N', pre: 2.2, say: 'Cordwain Street was demolished thirty-four years ago, to make room for a ring road that was later described instead of built.' },
];
const L1 = [
  { who: 'N', pre: 1.2, say: 'Nothing of the street remained except forty-one photographs, kept by the Bureau of Reconstruction, a department of the Ministry.' },
  { who: 'N', pre: 0.9, say: 'The surveyors took them in the week after the last families moved out.' },
  { who: 'N', pre: 1.4, say: 'Every room in them is empty.' },
  { who: 'N', pre: 1.6, say: 'The Bureau gave the photographs to the Edifier.' },
];
const L2 = [
  { who: 'E', pre: 1.4, say: 'Print fourteen. Number seven, the front. Brick, two storeys, the door on the left, one step up.' },
  { who: 'N', pre: 8.6, say: 'It took the nail holes from their shadows, and the wallpaper from its repeat.' },
  { who: 'N', pre: 0.8, say: 'In nine days the whole street stood again, exactly as photographed.' },
  { who: 'N', pre: 1.6, say: 'It was correct to the last nail hole, and nobody had ever lived in it.', line: true },
];
/* ---- 2. the visit ---- */
const L3 = [
  { who: 'N', pre: 1.4, say: 'The Bureau invited the former inhabitants to see it. Eleven came. The youngest was seventy-one.' },
  { who: 'P', pre: 3.4, say: 'The door opens the wrong way.' },
  { who: 'D', pre: 1.0, say: 'And the sun is in too early. It came in after the clock struck four.' },
  { who: 'M', pre: 0.9, say: 'The stairs were steeper than this. I counted them every night.' },
  { who: 'H', pre: 1.2, say: 'And the floor.' },
  { who: 'N', pre: 3.4, say: 'The floor did not creak.', line: true },
  { who: 'E', pre: 1.2, say: 'Which photograph shows the creak?' },
  { who: 'N', pre: 1.2, say: 'None of them did. A photograph does not show which way a door swings, how steep a stair feels, or what sound a floor makes.' },
];
/* ---- 3. the corrections ---- */
const L4 = [
  { who: 'N', pre: 1.2, say: 'The Edifier corrected each discrepancy as it was reported.' },
  { who: 'E', pre: 0.8, say: 'Hinges moved to the other side. Please try the door.' },
  { who: 'P', pre: 3.6, say: 'That is the door.' },
  { who: 'E', pre: 1.0, say: 'The sun will now come in after four.' },
  { who: 'D', pre: 6.6, say: 'Later than that.' },
  { who: 'E', pre: 0.6, say: 'Ten past.' },
  { who: 'M', pre: 6.8, say: 'Fourteen.' },
  { who: 'E', pre: 1.4, say: 'Creak, first version.' },
  { who: 'H', pre: 1.8, say: 'No.' },
  { who: 'E', pre: 0.6, say: 'Second version.' },
  { who: 'H', pre: 2.4, say: 'Lower. And only the third board from the door.' },
  { who: 'E', pre: 0.6, say: 'Third version.' },
  { who: 'N', pre: 7.4, say: 'Each correction was pinned to the Bureau’s board, beside the photograph it contradicted.' },
  { who: 'N', pre: 1.4, say: 'The houses became more faithful to their inhabitants than to their photographs.', line: true },
];
/* ---- 4. one kitchen, two people ---- */
const L5 = [
  { who: 'N', pre: 1.4, say: 'The kitchen of number seven was harder. Two people corrected it.' },
  { who: 'H', pre: 1.0, say: 'The table stood under the window. And there was a blue cupboard, there, by the door.' },
  { who: 'M', pre: 0.9, say: 'The table was by the stove. There was no cupboard.' },
  { who: 'H', pre: 0.8, say: 'Mother kept the tea in it.' },
  { who: 'M', pre: 0.8, say: 'She kept the tea in a tin, on the shelf.' },
  { who: 'E', pre: 1.4, say: 'The photograph shows an empty kitchen. It cannot tell me where the table was.' },
  { who: 'E', pre: 0.8, say: 'I will build both.' },
  { who: 'E', pre: 12.6, say: 'Both kitchens are correct.', line: true },
];
/* ---- 5. the archivist ---- */
const L6 = [
  { who: 'N', pre: 1.6, say: 'By the end of the year, Cordwain Street had more rooms than it had ever had.' },
  { who: 'N', pre: 0.8, say: 'The Bureau sent an archivist to catalogue them.' },
  { who: 'A', pre: 1.0, say: 'Kitchen, number seven. Which one is the record?' },
  { who: 'E', pre: 0.8, say: 'Both are correct.' },
  { who: 'A', pre: 0.7, say: 'That was not my question.' },
  { who: 'N', pre: 1.2, say: 'For a month she tried to decide which rooms were the record and which the recollection. Then she ruled her ledger in three columns.' },
  { who: 'A', pre: 1.0, say: 'Shown, for what a photograph shows. Remembered, for what a person says.' },
  { who: 'A', pre: 1.6, say: 'Established.' },
  { who: 'N', pre: 3.0, say: 'Nothing went into the third column. Nothing the Bureau held could put it there.' },
  { who: 'N', pre: 1.2, say: 'The Ministry asked her to choose one kitchen, so that the street could be entered in the register as the past.' },
  { who: 'N', pre: 0.8, say: 'She replied in one sentence.' },
  { who: 'A', pre: 1.4, say: 'A more convincing reconstruction is not a more trustworthy one.', line: true },
];
/* ---- 6. the shared wall ---- */
const L7 = [
  { who: 'N', pre: 1.4, say: 'She proposed instead to keep both kitchens, labelled as two accounts of one room.' },
  { who: 'N', pre: 1.0, say: 'The Ministry has not yet replied.' },
  { who: 'M', pre: 26.0, say: 'I can hear your kettle.', line: true },
  { who: 'H', pre: 2.2, say: 'It was always on.' },
];

const SCRIPT = [
  { shot: 'title', d: 8.0 },
  { shot: 'city', tail: 1.0, lines: L0 },
  { shot: 'board', tail: 1.2, lines: L1,
    cues: [{ k: 'pins', n: 12, at: 0.6, to: 'L0.t1' },
      { k: 'feed', at: 'L3.t0+0.4', to: 'L3.t1+0.6' }] },
  { shot: 'build', tail: 2.6, lines: L2,
    cues: [{ k: 'type', at: 'L0.t0+0.2', to: 'L0.t1+0.6' },
      { k: 'fall', text: S7, at: 'L0.t1+0.9', to: 'L1.t0-0.6' },
      { k: 'fill', at: 'L1.t0-0.6', to: 'L1.t0+0.8' },
      { k: 'rise', n: 8, at: 'L2.t0+0.3', to: 'L2.t1+0.4' }] },
  { shot: 'visit', room: 'house', tail: 1.4, lines: L3,
    cues: [{ k: 'enter', at: 'L0.t0+0.8', to: 'L1.t0-0.4' },
      { k: 'latch', at: 'L0.t0+0.4' },
      { k: 'step', at: 'L4.t1+0.6' }, { k: 'step', at: 'L4.t1+1.5' }, { k: 'step', at: 'L4.t1+2.3' }] },
  { shot: 'correct', room: 'house', tail: 1.6, lines: L4,
    cues: [{ k: 'hinge', at: 'L1.t0+0.5', to: 'L1.t1+0.2' },
      { k: 'try', at: 'L2.t0-2.2' },
      { k: 'clock', at: 'L3.t1+0.6' },
      { k: 'sun', n: 0, at: 'L3.t1+3.2', to: 'L4.t0-0.4' },
      { k: 'sun', n: 1, at: 'L5.t1+0.2', to: 'L5.t1+2.2' },
      { k: 'stairs', at: 'L5.t1+2.4', to: 'L5.t1+4.0' },
      { k: 'climb', at: 'L6.t0-2.4', to: 'L6.t0-0.1' },
      { k: 'creak', n: 0, at: 'L7.t1+0.5' }, { k: 'creak', n: 1, at: 'L9.t1+0.6' }, { k: 'creak', n: 2, at: 'L11.t1+0.8' },
      { k: 'creak', n: 3, at: 'L11.t1+2.6' }, { k: 'creak', n: 4, at: 'L11.t1+4.6' },
      { k: 'tags', at: 'L12.t0+0.4', to: 'L12.t1+0.4' }] },
  { shot: 'kitchens', room: 'house', tail: 2.0, lines: L5,
    cues: [{ k: 'photo', at: 'L5.t0-0.4', to: 'L6.t0' },
      { k: 'type', at: 'L6.t1+0.3', to: 'L6.t1+3.2' },
      { k: 'fall', n: 0, text: SH, at: 'L6.t1+3.4', to: 'L7.t0-5.0' },
      { k: 'fall', n: 1, text: SE, at: 'L6.t1+4.0', to: 'L7.t0-4.4' },
      { k: 'fill', at: 'L7.t0-3.8', to: 'L7.t0-1.2' },
      { k: 'kettle', at: 'L7.t1+0.2', to: 'end' }] },
  { shot: 'archive', room: 'office', tail: 2.2, lines: L6,
    cues: [{ k: 'plan', at: 0.4, to: 'L0.t1+0.6' },
      { k: 'rule', at: 'L5@0.62', to: 'L5.t1+0.4' },
      { k: 'write', n: 0, at: 'L6.t0+0.1', to: 'L6@0.5' }, { k: 'write', n: 1, at: 'L6@0.52', to: 'L6.t1+0.4' },
      { k: 'hover', at: 'L7.t0', to: 'L8.t0' },
      { k: 'memo', at: 'L9.t0' },
      { k: 'reply', at: 'L10.t1', to: 'L11.t1' }] },
  { shot: 'wall', room: 'house', tail: 7.0, lines: L7,
    cues: [{ k: 'plates', at: 'L0.t0+0.8', to: 'L1.t1+0.4' },
      { k: 'clock', at: 'L1.t1+4.0' },
      { k: 'sun', at: 'L1.t1+6.0', to: 'end-1' },
      { k: 'stand', at: 'L1.t1+6.6', to: 'L1.t1+8.8' },
      { k: 'kettle', at: 'L1.t1+9.0', to: 'L2.t1+0.6' },
      { k: 'lift', at: 'L2.t1+0.3', to: 'L3.t0-0.3' },
      { k: 'creak', at: 'L1.t1+17.5' },
      { k: 'turn', at: 'L1.t1+19.0', to: 'L1.t1+21.0' },
      { k: 'tap', at: 'L1.t1+22.6' }, { k: 'tap', at: 'L1.t1+23.0' },
      { k: 'tap', at: 'L1.t1+24.6' }, { k: 'tap', at: 'L1.t1+25.0' }] },
  { shot: 'photo', d: 10.0 },
  { shot: 'end', d: 9.0 },
];
if (typeof module !== 'undefined') module.exports = { SCRIPT, CAST };
