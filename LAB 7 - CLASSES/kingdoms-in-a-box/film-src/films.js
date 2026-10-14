/* KINGDOMS IN A BOX · film scripts
   Each film runs the box's own sketch. Beats are spoken by the narrator (N) or Klapaucius (K).
   shot: title | workshop | inside | aphorism | doubt | end
   restart + set: rerun the sketch from the start with these top-level values.
   acts: timed actions inside a beat (seconds from the beat's start):
     { t, set: {name: value} }      change a variable while it runs
     { t, click: [x, y] }           click the sketch
     { t, fn: "..." }               JS with V (variables) that returns [[x, y], ...] to click
     { from, to, every, fn: "..." } the same, repeated
   speed: sketch frames per film frame (the film runs at 24 fps). hold: extra seconds after the line. */

const CLOSING = 'A clean result may describe the rule more clearly than it describes the world.';
const NODE = 'const N = V.nodes; return ';

const FILMS = {
  bay: { seed: 7, beats: [
    { shot: 'workshop', say: 'Trurl builds Kealakekua Bay, as it was in seventeen seventy-nine, inside a box. Klapaucius asks which rule grew the crowd on the shore.' },
    { shot: 'inside', restart: true, set: { symbolic: 0 }, speed: 0, say: 'Each islander gets a hardship, a fear of acting alone, and a rite that can be broken.',
      code: ['constructor(x, y) {', '  this.hardship = random(0.1, 0.5);', '  this.riskAversion = random(0.3, 0.8);', '  this.breach = random(0.05, 0.45);', '}'] },
    { shot: 'inside', speed: 2, hold: 2, say: 'First, the practical rule. A cutter is taken. Those with grievance and support go down to the shore.',
      code: ['let support = activeNear / near;', 'let practical = this.hardship', '  - (1 - support) * this.riskAversion;'], acts: [{ t: 0.8, click: [200, 180] }, { t: 1.4, click: [400, 180] }, { t: 2.0, click: [600, 180] }] },
    { shot: 'inside', restart: true, set: { symbolic: 1 }, speed: 2, hold: 3, say: 'Again, from the start, with the ritual rule. A rite is broken, and the breach passes to everyone near it.',
      code: ['breachMax = max(breachMax, o.breach);', 'this.breach = lerp(this.breach, breachMax, 0.02);', 'let ritual = this.breach - 0.5;'], acts: [{ t: 0.8, click: [200, 180] }, { t: 1.4, click: [400, 180] }, { t: 2.0, click: [600, 180] }] },
    { shot: 'inside', speed: 1, hold: 1, say: 'Two different rules. The same crowd, on the same shore.' },
    { shot: 'aphorism' },
    { shot: 'doubt', say: 'A successful run does not choose between them.' },
  ] },
  crowd: { seed: 2, beats: [
    { shot: 'workshop', say: 'Trurl builds a public square inside a box. Six hundred and eighty citizens, and forty-five police.' },
    { shot: 'inside', restart: true, speed: 3, say: 'Each citizen weighs grievance against the risk of arrest. Grievance is hardship, times one minus legitimacy.',
      code: ['let grievance = this.hardship * (1 - legitimacy);', 'let arrestRisk = 1 - exp(-2.3 * floor(cops / rebels));', 'this.active = grievance', '  - this.riskAversion * arrestRisk > 0.1;'] },
    { shot: 'inside', speed: 3, hold: 1, say: 'With police close by, the risk is high. The square stays quiet.' },
    { shot: 'inside', speed: 3, hold: 1, say: 'Legitimacy does not change. Only the police are taken away, one by one.',
      acts: [{ from: 0.5, to: 7, every: 0.12, fn: 'return V.police.length ? [[V.police[0].i * 20 + 10, V.police[0].j * 20 + 10]] : [];' }] },
    { shot: 'inside', speed: 3, hold: 3, say: 'Then the quiet breaks, all at once.' },
    { shot: 'aphorism' },
    { shot: 'doubt', say: 'Quiet is not the same as consent.' },
  ] },
  culture: { seed: 2, beats: [
    { shot: 'workshop', say: 'Trurl gives every cell of a box a list of five traits.' },
    { shot: 'inside', restart: true, set: { features: 4, traits: 8 }, speed: 0, say: 'One rule. Talk to a neighbour as often as you already agree. When you talk, copy one trait.',
      code: ['let s = shared(this, other);', 'if (random() < s / features) {', '  let k = random(differ);', '  this.culture[k] = other.culture[k];', '}'] },
    { shot: 'inside', speed: 1, hold: 2, say: 'Neighbours who agree a little come to agree completely. Borders thicken where nobody agrees at all.' },
    { shot: 'inside', speed: 8, hold: 3, say: 'Then nothing can change any more. The world has frozen into a few cultures.' },
    { shot: 'aphorism' },
    { shot: 'doubt', say: 'The borders froze because the rule stopped, not because anyone drew them.' },
  ] },
  city: { seed: 5, beats: [
    { shot: 'workshop', say: 'Trurl fills a box with two kinds of households, and gives each one a mild wish.' },
    { shot: 'inside', restart: true, set: { tolerance: 0.34 }, speed: 0, say: 'A household stays if a third of its neighbours are its kind. Otherwise it moves.',
      code: ['happy() {', '  return this.share() >= tolerance;', '}'] },
    { shot: 'inside', speed: 0.6, say: 'Every move is small. Each one unsettles someone else.' },
    { shot: 'inside', speed: 1.5, hold: 3, say: 'Until the whole city is divided, and every household is content.' },
    { shot: 'aphorism' },
    { shot: 'doubt', say: 'Nobody in the box asked for a divided city.' },
  ] },
  ties: { seed: 2, beats: [
    { shot: 'workshop', say: 'In the First Sally, an army becomes one machine once its recruits plug into each other. Trurl builds a ring of sixty.' },
    { shot: 'inside', restart: true, speed: 1, hold: 1, say: 'Each node is tied to its two nearest neighbours on each side. A message from the top takes eight steps to cross.',
      code: ['for (let d = 1; d <= 2; d++) {', '  tie(a, nodes[(a.id + d) % n]);', '}'] },
    { shot: 'inside', speed: 1, hold: 1, say: 'Klapaucius is given six plugs. Each one drops a local tie and reaches across the ring.',
      code: ['untie(a, random(local));', 'tie(a, far);', 'rewires++;'],
      acts: [10, 20, 30, 40, 50].flatMap((k, i) => [{ t: 0.6 + i * 0.8, fn: NODE + `[[N[${k}].x, N[${k}].y]];` }, { t: 0.9 + i * 0.8, fn: NODE + '[[N[0].x, N[0].y]];' }]).concat([{ t: 4.6, fn: NODE + '[[N[15].x, N[15].y]];' }, { t: 4.9, fn: NODE + '[[N[45].x, N[45].y]];' }]) },
    { shot: 'inside', speed: 1, hold: 2, say: 'The average distance falls from almost eight steps to about four. The neighbourhoods stay as they were.' },
    { shot: 'aphorism' },
    { shot: 'doubt', say: 'Six plugs, and every recruit is a few steps from every other.' },
  ] },
  rough: { seed: 9, beats: [
    { shot: 'workshop', say: 'Trurl lays mountains in a box, and puts a capital on its western edge.' },
    { shot: 'inside', restart: true, speed: 1, say: 'The state reaches out from the capital. Its reach falls with distance, and falls again in rough country.',
      code: ['power() {', '  let d = dist(this.i, this.j, 0, 12);', '  return reach * exp(-d / 22)', '    * (1 - 0.7 * this.rough);', '}'] },
    { shot: 'inside', speed: 1, say: 'Six cells of resistance are planted: three near the capital, three in the far mountains.',
      acts: [{ t: 0.6, click: [70, 210] }, { t: 1.0, click: [90, 290] }, { t: 1.4, click: [50, 170] },
        { t: 2.0, fn: 'const P = V.patches.filter(p => p.i > 22).sort((a, b) => b.rough - a.rough); const out = []; for (const p of P) { if (out.every(o => Math.abs(o.i - p.i) + Math.abs(o.j - p.j) > 6)) out.push(p); if (out.length === 3) break; } return out.map(p => [p.i * 20 + 10, p.j * 20 + 10]);' }] },
    { shot: 'inside', speed: 2, hold: 4, say: 'The sweeps begin. Near the capital the cells are cleared. In the mountains they spread.' },
    { shot: 'aphorism' },
    { shot: 'doubt', say: 'The map of the rebellion is a map of where the state is weak.' },
  ] },
  harm: { seed: 4, beats: [
    { shot: 'workshop', say: 'Trurl builds four villages in a box, with a few fighters among them. Klapaucius is handed a strike, and a gift of care.' },
    { shot: 'inside', restart: true, set: { tool: 'strike' }, speed: 2, hold: 1, say: 'First, strikes alone. Each strike removes the fighters near it, and harms everyone around them.',
      code: ['if (d < 45 && p.fighter()) p.allegiance = -0.2;', 'else if (d < 90) p.anger += 1;'],
      acts: [{ from: 0.8, to: 9, every: 0.9, fn: 'const F = V.villagers.filter(v => v.fighter()); return F.length ? [[F[0].x, F[0].y]] : [];' }] },
    { shot: 'inside', speed: 2, hold: 1, say: 'Anger turns neighbours into fighters faster than the strikes can remove them.',
      acts: [{ from: 0, to: 6, every: 0.9, fn: 'const F = V.villagers.filter(v => v.fighter()); return F.length ? [[F[0].x, F[0].y]] : [];' }] },
    { shot: 'inside', restart: true, set: { tool: 'care' }, speed: 2, hold: 2, say: 'Again, from the start. Care for every village first. Then strike only where the fighters are.',
      code: ['p.anger = max(0, p.anger - 0.6);', 'p.allegiance -= 0.25;', 'p.trust = 600;'],
      acts: [{ t: 0.5, click: [180, 140] }, { t: 0.8, click: [600, 130] }, { t: 1.1, click: [220, 360] }, { t: 1.4, click: [610, 360] }, { t: 1.8, set: { tool: 'strike' } },
        { from: 2.0, to: 12, every: 0.3, fn: 'const F = V.villagers.filter(v => v.fighter()); const out = []; for (const f of F) { if (out.every(o => Math.hypot(o[0] - f.x, o[1] - f.y) > 60)) out.push([f.x, f.y]); if (out.length === 3) break; } return out;' }] },
    { shot: 'inside', speed: 2, hold: 1, say: 'The insurgency ends, and most of the villagers lean toward the state.',
      acts: [{ from: 0, to: 6, every: 0.3, fn: 'const F = V.villagers.filter(v => v.fighter()); const out = []; for (const f of F) { if (out.every(o => Math.hypot(o[0] - f.x, o[1] - f.y) > 60)) out.push([f.x, f.y]); if (out.length === 3) break; } return out;' }] },
    { shot: 'aphorism' },
    { shot: 'doubt', say: 'Every strike recruited someone. The care decided who.' },
  ] },
  border: { seed: 6, beats: [
    { shot: 'workshop', say: 'Trurl divides a box between two peoples, and opens the border to trade.' },
    { shot: 'inside', restart: true, set: { trade: 0.2, assimilation: 0.8 }, speed: 2, hold: 1, say: 'With strong assimilation, every border cell is pulled back to one side. The line stays sharp.',
      code: ['if (differ && random() < trade) {', '  this.h = min(1, this.h + 0.12);', '}', 'this.h -= 0.006 * assimilation;'] },
    { shot: 'inside', restart: true, set: { trade: 0.3, assimilation: 0.5 }, speed: 2, hold: 3, say: 'With more trade and less assimilation, the border thickens into something that is neither.' },
    { shot: 'inside', speed: 2, hold: 1, say: 'A third culture holds the middle. Both first cultures remain.' },
    { shot: 'aphorism' },
    { shot: 'doubt', say: 'Neither people was erased. A third one was made.' },
  ] },
  metis: { seed: 8, beats: [
    { shot: 'workshop', say: 'Trurl builds a valley that a state is trying to map. A survey line crosses it, again and again.' },
    { shot: 'inside', restart: true, set: { cunning: 0.3 }, speed: 2, hold: 1, say: 'Every villager the line catches in the open makes the valley more legible.',
      code: ['if (beam >= 0 && abs(beam - this.x) < 3', '    && !inCover) {', '  legibility += 3;', '}'] },
    { shot: 'inside', speed: 2, hold: 3, say: 'Metis is what they do so that the map comes out wrong. They run for cover, and they leave false trails.',
      acts: [{ from: 0, to: 12, every: 0.25, fn: 'return (V.beam >= 0 && V.beam < 80 && V.trailsLeft === 4) ? [[220, 120], [380, 330], [540, 160], [680, 300]] : [];' }] },
    { shot: 'inside', speed: 3, hold: 2, say: 'The survey records the trails instead of the people. The index stays low, and the harvest comes in.',
      acts: [{ from: 0, to: 12, every: 0.25, fn: 'return (V.beam >= 0 && V.beam < 80 && V.trailsLeft === 4) ? [[220, 120], [380, 330], [540, 160], [680, 300]] : [];' }] },
    { shot: 'aphorism' },
    { shot: 'doubt', say: 'The map is wrong because the villagers made it wrong.' },
  ] },
  dream: { seed: 10, beats: [
    { shot: 'workshop', say: 'Trurl builds a sleeper inside a box, three floors deep.' },
    { shot: 'inside', restart: true, set: { repression: 0.6, drive: 0.8 }, speed: 2, say: 'Wishes rise from the bottom. Censors patrol the middle floor. A wish that reaches the surface is a symptom.',
      code: ['let ego = egos.find(e => dist(this.x, this.y, e.x, e.y) < 30);', 'let censor = censors.find(c =>', '  dist(this.x, this.y, c.x, c.y) < 110);', 'if (ego && censor) made++;'] },
    { shot: 'inside', speed: 2, hold: 2, say: 'Where a go-between waits beside a censor, a wish is turned into an image.',
      acts: [{ t: 0.6, click: [130, 240] }, { t: 1.2, click: [270, 240] }, { t: 1.8, click: [560, 240] }] },
    { shot: 'inside', speed: 2, hold: 3, say: 'The censor does not stop the dream. It is part of how the image is made.' },
    { shot: 'aphorism' },
    { shot: 'doubt', say: 'Without the censor there are only symptoms.' },
  ] },
  counter: { seed: 12, beats: [
    { shot: 'workshop', say: 'Trurl builds an empire in a box, and an engine that answers every gain with a harder push.' },
    { shot: 'inside', restart: true, set: { growth: 0.14 }, speed: 4, say: 'The empire spreads hex by hex. At twenty seconds the invaders come, and every six seconds they push harder.',
      code: ['wave = max(0, floor((frameCount - 1200) / 360) + 1);', 'if (random() < 0.012 * invaders * wave)', '  this.owner = 2;'] },
    { shot: 'inside', speed: 4, hold: 1, say: 'Forts slow them down. For a while, half the land is held.',
      acts: [{ t: 0.4, fn: 'const own = V.hexes.filter(h => h.owner === 1).sort((a, b) => Math.hypot(a.x - 400, a.y - 240) - Math.hypot(b.x - 400, b.y - 240)); return own.slice(0, 8).map(h => [h.x, h.y]);' }] },
    { shot: 'inside', speed: 5, hold: 3, say: 'Then the engine breaks the empire, as it was built to do.' },
    { shot: 'aphorism' },
    { shot: 'doubt', say: 'You do not win this box. You learn where it breaks.' },
  ] },
};
if (typeof module !== 'undefined') module.exports = { FILMS, CLOSING };
