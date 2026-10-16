/* The Theory of Possibilities. The score. After Ewelina Woźniak-Czech, "The Possibilities of Theory – the Theory of Possibilities",
   Przestrzenie Teorii special issue (2024), translated by Małgorzata Olsza, CC BY-NC-ND 4.0, doi:10.14746/pt.2024.special.8.
   The essay argues that literary theory is now a field of coexisting possibilities: old and new categories stay in play together,
   concepts travel and act, and no approach has to be thrown out. It ends on Lem: books that do not exist as the purest form of
   possibility, and bitic literature, imagined in 1973, now being written. This film closes the Lab 7 collection of films after Lem.
   Everything spoken is paraphrase; check_ngrams.py checks every spoken line against the essay for any shared run of six words.
   The device: the study from the bitic films, extended. The lectern page, the shelf and the reader at the desk come back; between
   them a small stage is built, and concepts are its actors. The shelf changes in every scene: theories crowd onto it, then books
   that do not exist with blank spines, then books written by machines.
   Lines carry who (a CAST key). One fulcrum line per scene is flagged line:true: tightest camera, slower delivery.
   Times in cues: numbers, 'end-1', 'L2.t1+0.5', or 'L2@0.35'. A line may carry show: the spelling for the page and the script. */
const CAST = {
  N: { name: 'The Narrator', voice: 'af_bella', speed: 1.02 },
  A: { name: 'The Author', voice: 'bm_fable', speed: 0.96, fx: 'gruff' },
  W: { name: 'The Work', voice: 'af_kore', speed: 0.98, fx: 'silk' },
  R: { name: 'The Reader', voice: 'af_heart', speed: 0.98 },
};
const WT = (ls, i, word, off = 0) => `L${i}@${(Math.max(0, ls[i].say.indexOf(word)) / ls[i].say.length).toFixed(3)}${off ? (off > 0 ? '+' : '') + off : ''}`;

/* ---- what literature is: the field ---- */
const L0 = [
  { who: 'N', pre: 2.4, say: 'This film follows an essay by Ewelina Vozhniak-Chekh on the possibilities of theory. What you hear is a paraphrase of it.', show: 'This film follows an essay by Ewelina Woźniak-Czech on the possibilities of theory. What you hear is a paraphrase of it.' },
  { who: 'N', pre: 0.7, say: 'Jonathan Culler notes that nobody can say exactly where literary theory ends. One reason is that literature keeps crossing its own borders.' },
  { who: 'N', pre: 0.6, say: 'Every attempt to fence it in has failed. Even Aristotle’s Poetics has a gap: the part on comedy is lost.' },
  { who: 'N', pre: 1.0, say: 'No definition of literature has lasted. What lasts is its potential.', line: true },
  { who: 'N', pre: 0.9, say: 'Anna Burzinska recalls colleagues who hoped she would announce that theory no longer exists. Instead it has multiplied: many theories, side by side, in alliance and in tension.', show: 'Anna Burzyńska recalls colleagues who hoped she would announce that theory no longer exists. Instead it has multiplied: many theories, side by side, in alliance and in tension.' },
  { who: 'N', pre: 0.6, say: 'The essay proposes treating that crowd as the theory: a field of possibilities, in which no approach has to be thrown out.' },
];
/* ---- the old and the young; turns ---- */
const L1 = [
  { who: 'N', pre: 3.0, say: 'Changes in literary study are called turns. Take the word literally: a turn changes which way you are going.' },
  { who: 'N', pre: 0.6, say: 'In nineteen sixty-six, at a conference in Baltimore, the young turned on the old, and poststructuralism began.', show: 'In 1966, at a conference in Baltimore, the young turned on the old, and poststructuralism began.' },
  { who: 'N', pre: 0.6, say: 'Structuralism had systems and models. The young brought back what those left out: reading, writing, pleasure, the event.' },
  { who: 'N', pre: 0.8, say: 'Then came more turns: cultural, affective, posthuman, performative, dramatic. Each one opened literature to something outside it.' },
  { who: 'N', pre: 1.0, say: 'A turn does not send anyone off the stage. It changes the direction everyone faces.', line: true },
  { who: 'N', pre: 0.9, say: 'So the old categories stay in play beside the new ones, without having to win.' },
];
/* ---- new aspects of old categories: concretization ---- */
const L2 = [
  { who: 'N', pre: 3.0, say: 'The oldest of these categories is Roman Ingarden’s concretization, from the nineteen thirties.', show: 'The oldest of these categories is Roman Ingarden’s concretization, from the 1930s.' },
  { who: 'N', pre: 0.6, say: 'A literary work leaves many places undetermined. Each reader fills them in while reading, and each fills them differently.' },
  { who: 'R', pre: 0.8, say: 'I put in what the page leaves out.' },
  { who: 'N', pre: 1.0, say: 'Each reading settles one version of the work, and leaves the others possible.', line: true },
  { who: 'N', pre: 0.9, say: 'Ingarden called meanings that will not hold still iridescent. In Jacek Dukai’s novel Ice, a mathematician adds a third value to true and false: neither, because the thing does not exist.', show: 'Ingarden called meanings that will not hold still iridescent. In Jacek Dukaj’s novel Ice, a mathematician adds a third value to true and false: neither, because the thing does not exist.' },
  { who: 'N', pre: 0.7, say: 'The work stays open. A reader stops its flickering for a moment, and only for that reader.' },
];
/* ---- deconstructive hopscotch; liquid histories ---- */
const L3 = [
  { who: 'N', pre: 3.0, say: 'For Derrida, language is a finite field, and because it is finite it allows endless substitution. He called that field play.' },
  { who: 'N', pre: 0.7, say: 'Sometimes the play becomes a real game. Mariusz Pisarski turned Potocki’s Manuscript Found in Saragossa into a hypertext, and Bruno Schulz’s stories became an online game in which the hero is simply you.' },
  { who: 'N', pre: 1.0, say: 'The reader no longer follows a plot. The reader walks a path, and the path is the reading.', line: true },
  { who: 'N', pre: 0.8, say: 'The paths are only the ones the makers built. But each walk through them is a new event.' },
  { who: 'N', pre: 0.7, say: 'Zygmunt Bauman’s liquidity adds that nothing happens twice. Even the ice in Dukai’s novel moves.', show: 'Zygmunt Bauman’s liquidity adds that nothing happens twice. Even the ice in Dukaj’s novel moves.' },
];
/* ---- where is the author? the dramatic and dramaturgy ---- */
const L4 = [
  { who: 'N', pre: 3.0, say: 'The death of the author, announced by Roland Barthes, has been announced many times since.' },
  { who: 'A', pre: 0.8, say: 'I have been declared dead more than once.' },
  { who: 'N', pre: 0.8, say: 'Anna Krayevska’s dramatic theory of literature brings the author back, as one actor among three.', show: 'Anna Krajewska’s dramatic theory of literature brings the author back, as one actor among three.' },
  { who: 'A', pre: 0.9, say: 'I write it.' },
  { who: 'W', pre: 0.5, say: 'I happen between you.' },
  { who: 'R', pre: 0.5, say: 'I write it again when I read it.' },
  { who: 'N', pre: 0.9, say: 'Theory stops standing outside the text and starts to play with it. Its terms come from the theatre: scene, act, dialogue, event.' },
  { who: 'N', pre: 0.6, say: 'Mieke Bal adds that concepts travel between disciplines and periods, and change their meaning at every crossing.' },
  { who: 'N', pre: 1.0, say: 'Theory is not the audience here. It is one of the players.', line: true },
];
/* ---- (im)possible works: Lem's apocrypha ---- */
const L5 = [
  { who: 'N', pre: 3.0, say: 'Books that do not exist show possibility most clearly. Borges imagined a library holding every possible arrangement of letters: every book that could be written.' },
  { who: 'N', pre: 0.7, say: 'Stanislaw Lem wrote a library of his own. A Perfect Vacuum, from nineteen seventy-one, is made of reviews of books that were never written.', show: 'Stanisław Lem wrote a library of his own. A Perfect Vacuum, from 1971, is made of reviews of books that were never written.' },
  { who: 'N', pre: 0.6, say: 'All but one. The first review is of A Perfect Vacuum itself, and Lem reviews it as if another Lem, in another world, had written it.' },
  { who: 'N', pre: 0.7, say: 'So which book is in your hands? The title says vacuum, and the book is full.' },
  { who: 'N', pre: 1.1, say: 'A book that does not exist has not chosen yet. It keeps all of its possibilities.', line: true },
  { who: 'N', pre: 1.0, say: 'Imaginary Magnitude, from nineteen seventy-three, collects introductions to books that do not exist, and begins with an introduction to writing introductions.', show: 'Imaginary Magnitude, from 1973, collects introductions to books that do not exist, and begins with an introduction to writing introductions.' },
  { who: 'N', pre: 0.6, say: 'Lem jokes that scholars mostly write introductions, and that introductions outnumber literature, since they only announce from far off what literature tries to do.' },
  { who: 'N', pre: 0.7, say: 'Vozhniak-Chekh wants a theory that stops introducing from far off, and comes close enough to be tangled up with literature.', show: 'Woźniak-Czech wants a theory that stops introducing from far off, and comes close enough to be tangled up with literature.' },
];
/* ---- where is literature? A History of Bitic Literature ---- */
const L6 = [
  { who: 'N', pre: 3.0, say: 'One of those introductions is to A History of Bitic Literature, in five volumes.' },
  { who: 'N', pre: 0.6, say: 'Bitic literature is writing that people did not make. Whoever really wrote it is not human, though a person may stand one step behind. Its study is bitistics.' },
  { who: 'N', pre: 1.1, say: 'In nineteen seventy-three, bitic literature was a book that did not exist. Now it is being written.', line: true, show: 'In 1973, bitic literature was a book that did not exist. Now it is being written.' },
  { who: 'N', pre: 1.0, say: 'In twenty sixteen a novella written by a computer was entered for the Hoshi Shinichi literary award. It did not win. But if it had, who would have gone up to take the prize?', show: 'In 2016 a novella written by a computer was entered for the Hoshi Shinichi literary award. It did not win. But if it had, who would have gone up to take the prize?' },
  { who: 'N', pre: 0.7, say: 'In twenty eighteen a French publisher issued a novel written by a program. In twenty twenty-two came ChatGPT, then fake books under famous names, and writers suing over their work being used to train it.', show: 'In 2018 a French publisher issued a novel written by a program. In 2022 came ChatGPT, then fake books under famous names, and writers suing over their work being used to train it.' },
  { who: 'N', pre: 0.7, say: 'A library of Babel written only by machines is a matter of time. Whether it is the library we wanted is another question.' },
  { who: 'N', pre: 0.8, say: 'Lem has one of his reviewers say that in times of transition it is hardest to see the road behind and the road ahead.' },
  { who: 'N', pre: 0.9, say: 'The essay ends with concepts colliding like particles in an accelerator. Will a new theory come out of them? It is possible.' },
];

const SCRIPT = [
  { shot: 'title', d: 7.0 },
  { shot: 'field', room: 'study', tail: 1.4, lines: L0,
    cues: [{ k: 'strike', n: 0, at: WT(L0, 1, 'nobody') }, { k: 'strike', n: 1, at: WT(L0, 1, 'One reason') }, { k: 'strike', n: 2, at: WT(L0, 1, 'crossing') },
      { k: 'strike', n: 3, at: 'L2@0.05' }, { k: 'strike', n: 4, at: 'L2@0.3' }, { k: 'strike', n: 5, at: WT(L0, 2, 'Even') }, { k: 'strike', n: 6, at: WT(L0, 2, 'comedy') },
      { k: 'write', at: WT(L0, 3, 'What lasts'), to: 'L3.t1' },
      { k: 'crowd', at: WT(L0, 4, 'Instead'), to: 'L4.t1+0.5' }] },
  { shot: 'turns', room: 'stage', tail: 1.6, lines: L1,
    cues: [{ k: 'curtain', at: 0.2, to: 2.4 },
      { k: 'young', at: 'L1@0.45', to: 'L1.t1' }, { k: 'sign', at: WT(L1, 1, 'Baltimore') },
      { k: 'enter', n: 0, at: WT(L1, 3, 'cultural') }, { k: 'enter', n: 1, at: WT(L1, 3, 'affective') }, { k: 'enter', n: 2, at: WT(L1, 3, 'posthuman') },
      { k: 'enter', n: 3, at: WT(L1, 3, 'performative') }, { k: 'enter', n: 4, at: WT(L1, 3, 'dramatic') },
      { k: 'turn', at: WT(L1, 4, 'It changes'), to: 'L4.t1' }] },
  { shot: 'gaps', room: 'study', tail: 1.6, lines: L2,
    cues: [{ k: 'fill', n: 0, at: WT(L2, 1, 'Each reader'), to: 'L1.t1' }, { k: 'fill', n: 1, at: 'L2.t0', to: 'L2.t1+0.4' },
      { k: 'ghost', at: WT(L2, 3, 'and leaves'), to: 'L3.t1' },
      { k: 'shimmer', at: 'L4.t0+0.3', to: WT(L2, 4, 'In Jacek') }, { k: 'three', at: WT(L2, 4, 'third') }, { k: 'tick', at: WT(L2, 4, 'neither') },
      { k: 'settle', at: WT(L2, 5, 'A reader') }] },
  { shot: 'hopscotch', room: 'study', tail: 1.6, lines: L3,
    cues: [{ k: 'court', at: 0.6, to: 'L0.t1' }, { k: 'you', at: WT(L3, 1, 'simply you') },
      { k: 'pathA', at: 'L2.t0-0.4', to: 'L2.t1' }, { k: 'pathB', at: 'L3.t0', to: 'L3.t1+0.3' },
      { k: 'melt', at: 'L4.t0', to: 'end' }] },
  { shot: 'dramatic', room: 'stage', tail: 1.6, lines: L4,
    cues: [{ k: 'curtain', at: 0.2, to: 2.4 }, { k: 'rise', at: WT(L4, 2, 'brings'), to: WT(L4, 2, 'as one', 0.4) },
      { k: 'term', n: 0, at: WT(L4, 6, 'scene') }, { k: 'term', n: 1, at: WT(L4, 6, 'act,') }, { k: 'term', n: 2, at: WT(L4, 6, 'dialogue') }, { k: 'term', n: 3, at: WT(L4, 6, 'event') },
      { k: 'travel', at: WT(L4, 7, 'concepts'), to: 'L7.t1+0.6' },
      { k: 'theory', at: 'L8.t0-1.6', to: 'L8.t0+0.2' }] },
  { shot: 'vacuum', room: 'study', tail: 1.6, lines: L5,
    cues: [{ k: 'blank', at: 0.4, to: 'L0.t1' }, { k: 'pull', at: 'L1.t0-0.4', to: 'L1.t0+1.4' },
      { k: 'first', at: WT(L5, 2, 'The first') }, { k: 'abyss', at: WT(L5, 2, 'as if'), to: 'L2.t1' },
      { k: 'turn', n: 0, at: 'L4.t0-1.0' },
      { k: 'pull2', at: 'L5.t0-0.6', to: 'L5.t0+1.2' }, { k: 'turn', n: 1, at: WT(L5, 6, 'and that', -0.4) }, { k: 'turn', n: 2, at: WT(L5, 6, 'since', -0.4) }, { k: 'turn', n: 3, at: WT(L5, 6, 'what literature', -0.4) },
      { k: 'near', at: 'L7.t0', to: 'L7.t1' }] },
  { shot: 'bitic', room: 'study', tail: 2.4, lines: L6,
    cues: [{ k: 'machine', at: WT(L6, 1, 'Whoever'), to: 'L1.t1' },
      { k: 'write', at: WT(L6, 2, 'Now'), to: 'end' },
      { k: 'prize', at: WT(L6, 3, 'Hoshi') },
      { k: 'flood', at: 'L4.t0', to: 'L5.t1' },
      { k: 'ring', at: 'L7.t0', to: 'end' }] },
  { shot: 'end', d: 8.0, cues: [{ k: 'turn', at: 1.6 }] },
];
if (typeof module !== 'undefined') module.exports = { SCRIPT, CAST };
