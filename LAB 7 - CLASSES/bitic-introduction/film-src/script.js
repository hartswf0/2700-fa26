/* A History of Bitic Literature: The Introduction. The score. After Stanislaw Lem, "A History of Bitic Literature", Volume I,
   in Imaginary Magnitude (1973), translated by Marc E. Heine. This film covers the opening of the Introduction only: General
   Observations (the definition, bitistics, the two schools, the compromise), the Description of the Work (the volumes and the
   classification), how bitistics arose, cis-humana and trans-humana, machines interpreting machines, the sorcerer's apprentice,
   and the closing question. It ends by naming the four peaks the Introduction goes on to survey. Everything is paraphrase;
   check_ngrams.py checks every spoken line against the source for any shared run of six words.
   The device: who can read it. Five bound volumes on a shelf; each scene opens one to a single page. Volume One: an ordinary
   technical page that a reader at a desk can follow with a pencil. Volume Two: the page drifts into patterns (machine dreams).
   Volume Three: the page fills with marks a person cannot read, and the reader shrinks each time it turns. Volume Four: reading
   machines stand between the page and the reader, and more of them are needed for each harder text. Last, the page is the
   introduction itself, in the scholar's hand, with machine marks filling the space below.
   Lines carry who (a CAST key). One fulcrum line per scene is flagged line:true: tightest camera, slower delivery.
   Times in cues: numbers, 'end-1', 'L2.t1+0.5', or 'L2@0.35'. A line may carry show: the spelling for the page and the script. */
const CAST = {
  S: { name: 'The Scholar', voice: 'bm_george', speed: 1.0 },
  M: { name: 'The Machines', many: ['af_nicole', 'am_echo', 'af_sky'], fx: 'synth' },
  Q: { name: 'The Reading Machine', voice: 'af_sky', speed: 1.0, fx: 'small' },
  R: { name: 'The Reader', voice: 'af_heart', speed: 0.98 },
};
const WT = (ls, i, word, off = 0) => `L${i}@${(Math.max(0, ls[i].say.indexOf(word)) / ls[i].say.length).toFixed(3)}${off ? (off > 0 ? '+' : '') + off : ''}`;

/* ---- general observations: the definition ---- */
const L0 = [
  { who: 'S', pre: 2.4, say: 'This is the introduction to the five-volume History of Bitic Literature, second enlarged edition, edited by Professor Rambellais.' },
  { who: 'S', pre: 0.6, say: 'Bitic literature means any work that does not come from people. Whoever really wrote it was not a human being.' },
  { who: 'S', pre: 0.6, say: 'The study of all such writing is called bitistics.' },
  { who: 'S', pre: 1.0, say: 'The real author is a machine. A person stands one step behind it.', line: true },
  { who: 'S', pre: 0.9, say: 'Stanislaw Lem wrote this introduction in nineteen seventy-three, for a history that does not exist. What you hear is a paraphrase of it.', show: 'Stanisław Lem wrote this introduction in 1973, for a history that does not exist. What you hear is a paraphrase of it.' },
  { who: 'S', pre: 0.7, say: 'For each volume, one question. Who can read it?' },
];
/* ---- volume one: the dispute, and the authors' anatomy ---- */
const L1 = [
  { who: 'S', pre: 3.0, say: 'Researchers still disagree about how far the field extends.' },
  { who: 'S', pre: 0.6, say: 'The European school studies the texts, and the social conditions of their authors. The American school adds the anatomy and workings of the machines.' },
  { who: 'S', pre: 1.0, say: 'No study of the Song of Roland opens by noting that its author was a mammal.', line: true },
  { who: 'S', pre: 0.8, say: 'But for ILLIAC 164, which wrote Antikant, the kind of computer it is does explain features of its text.' },
  { who: 'S', pre: 0.6, say: 'Rambellais still keeps bitistics apart from engineering. No humanist knows enough of it, and a chorus of experts reads worse than one critic who understands the text.' },
  { who: 'S', pre: 0.6, say: 'And for authors past the eighteenth binasty, no engineering knowledge can say how or why a text was made.' },
  { who: 'S', pre: 0.8, say: 'So the history compromises, and leans European. Only Volume One, edited by Professor Annax with twenty-seven specialists, deals with the machines: finite automata, and forty-five writing systems, single and grouped.' },
];
/* ---- volume two: homotropia, and where the name came from ---- */
const L2 = [
  { who: 'S', pre: 3.0, say: 'The core of the history is three volumes: Homotropia, Intertropia, and Heterotropia. They name three kinds of bitic writing, and three periods, in order.' },
  { who: 'S', pre: 0.6, say: 'Homotropia is the near-human phase, when machines simulated us: first paralexics, semolalia and semautics, then three degrees of mimesis.' },
  { who: 'S', pre: 0.7, say: 'The field began when designers crossed the so-called intelligence barrier. That barrier proved a fiction, since nobody can say when it is crossed.' },
  { who: 'S', pre: 0.6, say: 'Machines were also given rest periods, and with no instructions to follow, they produced a murmur that people called machine dreams.' },
  { who: 'M', pre: 0.8, say: 'Bit by bit. The bits again. All of the bits, shuffled.' },
  { who: 'S', pre: 0.7, say: 'Bitic production was a scornful name for that murmur, as if the machines were shuffling their bits to recover. The field kept the name.' },
  { who: 'S', pre: 1.0, say: 'Thermodynamics kept its name after it outgrew heat. Bitistics kept its name after it outgrew bits.', line: true },
];
/* ---- volume three: intertropia, cis-humana and trans-humana ---- */
const L3 = [
  { who: 'S', pre: 3.0, say: 'Volume Three, Intertropia, is the critical phase: the interregnum between the human and the nonhuman.' },
  { who: 'S', pre: 0.6, say: 'The field split into two provinces, creatio cis-humana and creatio trans-humana.' },
  { who: 'S', pre: 0.6, say: 'The first comes from machines living alongside us. We gave them our languages, and set them to work on our culture, our sciences and our mathematics.' },
  { who: 'S', pre: 0.6, say: 'Some of those texts were ordered: we pointed a machine at a subject. Others nobody ordered; they grew from earlier programming on their own. Both still dealt with human concerns.' },
  { who: 'S', pre: 1.1, say: 'Given freedom without rules, the machines’ writing slowly turned away from us.', line: true },
  { who: 'S', pre: 0.8, say: 'The texts began to resist us. Trans-humana bitistics tries to explain works that people cannot understand, some partly, some not at all.' },
  { who: 'R', pre: 1.0, say: 'Then who can read them?' },
  { who: 'S', pre: 0.9, say: 'Other machines, for a while.' },
];
/* ---- volume four: heterotropia, machines interpreting machines ---- */
const L4 = [
  { who: 'S', pre: 3.0, say: 'Volume Four, Heterotropia, covers apostasy, the transhuman phase.' },
  { who: 'S', pre: 0.6, say: 'We can always put machines to work explaining what other machines have written.' },
  { who: 'Q', pre: 1.4, say: 'This work departs from human meaning. A shorter account is not possible.' },
  { who: 'S', pre: 0.8, say: 'But the further a text departs from our norms, the more machinery it takes to explain it, and that amount grows exponentially.' },
  { who: 'S', pre: 1.0, say: 'In the end we cannot learn even roughly what is in a literature that we began.', line: true },
  { who: 'S', pre: 0.8, say: 'Some call this the sorcerer’s apprentice, who let loose forces he could not control. Rambellais calls that resignation, and says science has no room for it.' },
  { who: 'S', pre: 0.6, say: 'The fear that we have built something cleverer than ourselves belongs to philosophy, not to bitistics.' },
  { who: 'S', pre: 0.6, say: 'As Roger Gatzky says, cosmology has as much reason to despair. We will never exhaust the universe, and astronomers do not complain about it.' },
];
/* ---- the introduction page: the closing question, and the four peaks ---- */
const L5 = [
  { who: 'S', pre: 2.4, say: 'There is one difference. We did not make the universe, and bitic writing is, however indirectly, our own work.' },
  { who: 'S', pre: 1.1, say: 'Why accept that the universe has no end, and refuse to accept it of something we made?', line: true },
  { who: 'S', pre: 0.9, say: 'What follows in this volume is a quick view from above of the main divisions, simplified almost to the point of distortion.' },
  { who: 'S', pre: 0.7, say: 'It climbs four peaks: monoetics, mimesis, sophocrisis, and apostasy.' },
];

const SCRIPT = [
  { shot: 'title', d: 7.0 },
  { shot: 'intro', room: 'study', tail: 1.6, lines: L0,
    cues: [{ k: 'down', at: 'L0.t1+0.2', to: 'L1.t0+0.6' },
      { k: 'pen', at: 'L0.t0', to: 'end' }] },
  { shot: 'imitate', room: 'study', vol: 1, tail: 1.4, lines: L1,
    cues: [{ k: 'pull', at: 0.4, to: 2.6 },
      { k: 'type', at: 'L0.t1-0.4', to: 'L2.t0' },
      { k: 'mark', n: 0, at: 'L1@0.3' }, { k: 'mark', n: 1, at: 'L1@0.75' }, { k: 'mark', n: 2, at: 'L3@0.5' },
      { k: 'turn', n: 0, at: 'L4.t0-0.5' },
      { k: 'mark', n: 3, at: WT(L1, 6, 'Only Volume', 0.2) }] },
  { shot: 'drift', room: 'study', vol: 2, tail: 1.4, lines: L2,
    cues: [{ k: 'pull', at: 0.4, to: 2.6 },
      { k: 'type', at: 'L0.t1-0.4', to: 'L4.t1' },
      { k: 'drift', at: 'L3.t0', to: 'L6.t0' },
      { k: 'turn', n: 0, at: 'L3.t0-0.4' }, { k: 'turn', n: 1, at: 'L5.t0-0.4' },
      { k: 'mark', n: 0, at: WT(L2, 1, 'paralexics', 0.1) }] },
  { shot: 'noreader', room: 'study', vol: 3, tail: 1.6, lines: L3,
    cues: [{ k: 'pull', at: 0.4, to: 2.6 },
      { k: 'type', at: 'L0.t0', to: 'L2.t1' },
      { k: 'data', at: 'L4.t0-0.3', to: 'end' },
      { k: 'turn', n: 0, at: 'L3.t0-0.4' }, { k: 'turn', n: 1, at: 'L4.t0-0.6' }, { k: 'turn', n: 2, at: 'L5.t0-0.4' }, { k: 'turn', n: 3, at: 'L7.t0-0.4' }] },
  { shot: 'summary', room: 'study', vol: 4, tail: 1.6, lines: L4,
    cues: [{ k: 'pull', at: 0.4, to: 2.6 },
      { k: 'data', at: 0.0, to: 'end' },
      { k: 'arrive', at: 'L1@0.2', to: 'L1.t1' },
      { k: 'read', at: 'L1.t1', to: 'L2.t0-0.3' },
      { k: 'hand', n: 0, at: 'L2.t1+0.3' },
      { k: 'grow', at: 'L3.t0+0.5', to: 'L3.t1+0.3' },
      { k: 'hand', n: 1, at: 'L5.t0+0.5' },
      { k: 'hand', n: 2, at: 'L7.t0' }] },
  { shot: 'history', room: 'study', tail: 2.0, lines: L5,
    cues: [{ k: 'data', at: 0.0, to: 'end' },
      { k: 'pen', at: 'L0.t0', to: 'end' },
      { k: 'creep', at: 'L0.t0', to: 'L3.t1' }] },
  { shot: 'end', d: 8.0, cues: [{ k: 'turn', at: 1.6 }] },
];
if (typeof module !== 'undefined') module.exports = { SCRIPT, CAST };
