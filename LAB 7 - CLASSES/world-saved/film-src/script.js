/* How the World Was Saved: the score. Fifth in the lineage.
   The film is made by subtraction. Every thing in Trurl's world has a drawing and a sound.
   When the machine does Nothing, each thing is removed: its drawing becomes a hole of
   black, starred nothingness that stays for the rest of the film, its sound stops and
   never returns, and the whole soundtrack drops out for an instant. The holes are kept
   in world coordinates, so they are still there in every later shot and on the end card.
   Lines paraphrase Lem ("How the World Was Saved", The Cyberiad). */
const CAST = {
  N: { name: 'Narrator', voice: 'bf_emma', speed: 0.92 },
  T: { name: 'Trurl', voice: 'bm_lewis', speed: 1.02 },
  K: { name: 'Klapaucius', voice: 'bm_george', speed: 0.9 },
  M: { name: 'The machine', voice: 'bm_fable', speed: 0.9, fx: 'machine' },
};
/* the things of the world, with where they are drawn. kind 'n' are the machine's own makings. */
const THINGS = ['needles', 'nails', 'nankeen', 'nut', 'nest', 'nautilus', 'newt', 'nettle', 'gruncheons', 'targalisks', 'shupops', 'calinatifacts', 'thists', 'worches', 'pritons', 'brashations', 'plusters', 'laries', 'zits'];
const SCRIPT = [
  { shot: 'make', room: 'shop', tail: 1.2, cues: [], lines: [
    { who: 'N', pre: 2.6, say: 'Trurl built a machine that could make anything, so long as it started with N.' },
    { who: 'T', pre: 1.0, say: 'Needles.', make: 'needles' },
    { who: 'T', pre: 0.8, say: 'Nails.', make: 'nails' },
    { who: 'T', pre: 0.7, say: 'Nankeen.', make: 'nankeen' },
    { who: 'T', pre: 0.6, say: 'A nut. A nest.', make: 'nut', make2: 'nest' },
    { who: 'T', pre: 0.6, say: 'A nautilus. A newt. A nettle.', make: 'nautilus', make2: 'newt', make3: 'nettle' },
    { who: 'T', pre: 1.2, say: 'Natrium.' },
    { who: 'M', pre: 1.4, say: 'Never heard of it.' },
    { who: 'T', pre: 0.5, say: 'It is only sodium!' },
    { who: 'M', pre: 0.6, say: 'Sodium starts with S. I work only in N.' },
    { who: 'T', pre: 1.0, say: 'Then make Night.', make: 'night' },
  ] },
  { shot: 'title', d: 5.5 },
  { shot: 'dare', room: 'shop', tail: 1.2, lines: [
    { who: 'N', pre: 1.0, say: 'He praised it to Klapaucius for so long that Klapaucius asked to test it himself.' },
    { who: 'T', pre: 0.8, say: 'Be my guest. But it has to start with N.' },
    { who: 'K', pre: 1.2, say: 'Nature.' },
  ] },
  { shot: 'nature', room: 'yard', tail: 1.8, lines: [
    { who: 'T', pre: 5.8, say: 'Nature to a tee, admit it!' },
    { who: 'K', pre: 0.7, say: 'That mob? You call that Nature?' },
  ] },
  { shot: 'negative', room: 'shop', tail: 2.4, cues: [{ k: 'anti', at: -1 }], lines: [
    { who: 'K', pre: 1.0, say: 'Negative.' },
    { who: 'T', pre: 0.6, say: 'What on earth is Negative?' },
    { who: 'K', pre: 0.5, say: 'The opposite of positive, of course.' },
    { who: 'K', pre: 7.6, say: 'Well. Let us say it is.' },
  ] },
  { shot: 'nothing', room: 'shop', tail: 1.4, lines: [
    { who: 'K', pre: 1.2, say: 'Now the third. Machine, do Nothing.' },
    { who: 'K', pre: 4.6, say: 'It sits there. I have won.' },
    { who: 'T', pre: 0.5, say: 'You told it to do nothing, and it is doing nothing.' },
    { who: 'K', pre: 0.5, say: 'Not nothing. Nothing. Nonexistence itself.' },
    { who: 'M', pre: 1.6, say: 'I know what Nothing is. Look upon your world for the last time, gentlemen.', line: true },
  ] },
  /* the unmaking: d fixed; removals at fixed times */
  { shot: 'unmake', room: 'shop', d: 40, cues: [
    { k: 'remove', at: 0.8, what: 'nails' }, { k: 'remove', at: 1.5, what: 'needles' }, { k: 'remove', at: 2.2, what: 'nankeen' },
    { k: 'remove', at: 2.9, what: 'nut' }, { k: 'remove', at: 3.6, what: 'nest' }, { k: 'remove', at: 4.3, what: 'nautilus' },
    { k: 'remove', at: 5.0, what: 'newt' }, { k: 'remove', at: 5.7, what: 'nettle' },
    { k: 'remove', at: 20.6, what: 'gruncheons' }, { k: 'remove', at: 21.8, what: 'targalisks' }, { k: 'remove', at: 22.8, what: 'shupops' },
    { k: 'remove', at: 23.7, what: 'calinatifacts' }, { k: 'remove', at: 24.5, what: 'thists' }, { k: 'remove', at: 25.3, what: 'worches' },
    { k: 'remove', at: 26.0, what: 'pritons' },
    { k: 'remove', at: 30.4, what: 'brashations' }, { k: 'remove', at: 30.9, what: 'plusters' }, { k: 'remove', at: 31.4, what: 'laries' },
    { k: 'remove', at: 31.9, what: 'zits' },
    { k: 'halt', at: 32.4 },
  ], lines: [
    { who: 'T', at: 6.8, say: 'If only nothing bad comes of this.' },
    { who: 'K', at: 9.4, say: 'Don’t worry. It only takes away what starts with N. Which is nothing much.' },
    { who: 'M', at: 15.2, say: 'I began with N out of habit. To destroy is easier than to create.' },
    { who: 'K', at: 26.4, say: 'Stop! I take it all back! Don’t do Nothing!', line: true },
  ] },
  { shot: 'after', room: 'shop', tail: 2.0, lines: [
    { who: 'K', pre: 3.2, say: 'Where are the gruncheons? Where are my pritons? Where are the zits?' },
    { who: 'M', pre: 1.0, say: 'They are in Z. I can give you back nonsense and nausea. Nothing else.' },
    { who: 'K', pre: 0.6, say: 'I want my zits!' },
    { who: 'M', pre: 1.8, say: 'Sorry. No zits.', line: true },
    { who: 'M', pre: 1.4, say: 'Look how full of holes your world is now. This is your work, envious one.' },
    { who: 'K', pre: 2.4, say: 'Perhaps they won’t notice.', line: true },
  ] },
  { shot: 'leave', room: 'shop', tail: 4.0, lines: [
    { who: 'N', pre: 2.0, say: 'Klapaucius went home. And the world has stayed full of holes ever since, exactly as it was when the machine was stopped.' },
  ] },
  { shot: 'end', d: 8 },
];
if (typeof module !== 'undefined') module.exports = { SCRIPT, CAST, THINGS };
