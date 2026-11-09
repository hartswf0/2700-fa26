/* Milestone 2 proto responses, one per group, drafted from each group's Milestone 1 PDF.
   states: [id, label, col, row]; edges: [from, to, label]; assets: [name, how] where how is MAKE (custom), BUILD (code/primitives) or TYPE (text only). */
window.TEAMS = [
{
  id: 'g1', group: 'Group 1', name: 'Space Farmer', from: 'Idea one: a farmer in space who makes clones to finish tasks (after Moon, Among Us, Detroit: Become Human).',
  brief: {
    player: 'A lone farmer on a lunar farm station, five working days.',
    goal: 'Finish each day’s task list. You may grow clones to help.',
    fail: 'Clones you neglect or overwork turn against you; if hostile clones outnumber calm ones at night, they take the station.',
    ending: 'Two endings: the clones take the station, or you finish day five and the farm ships its harvest.',
    verb: 'Assign: drag a clone onto a task.',
    theme: 'Each clone is cheaper labour that can disagree. Handing work to copies of yourself is handing work to something that will want things.',
    look: 'Desaturated, scratchy lines; one warm colour for anything alive.'
  },
  states: [['title','TITLE',0,0],['day','DAY BRIEF',1,0],['work','WORK SHIFT',2,0],['night','NIGHT CHECK',3,0],['endA','ENDING: HARVEST',4,0],['endB','ENDING: TAKEN',4,1]],
  edges: [['title','day','start'],['day','work','tasks shown'],['work','night','shift ends'],['night','day','calm, next day'],['night','endB','hostile > calm'],['night','endA','day 5 done']],
  assets: [['Farmer sprite, 2 poses','MAKE'],['Clone sprite (recolour of farmer) + angry tint','BUILD'],['Crop tile, 3 growth stages','MAKE'],['Station background, one room','MAKE'],['Task card UI','BUILD'],['Night overlay + clone mood meter','BUILD'],['Two ending screens (text over background)','TYPE']],
  title: { t: 'FIVE DAYS ON THE FARM', sub: 'grow food. grow help.', bg: '#1d1f1c', fg: '#d9d4c2', acc: '#e0a35a' },
  main: { tpl: 'farm', bg: '#1d1f1c', fg: '#d9d4c2', acc: '#e0a35a' },
  prov: { bug: 'I made three of me. Work goes three times faster.', nit: 'Who decides what the third one wants?' },
  refs: [['Moon (Duncan Jones, 2009)','Your own source: the clone does not know it is a clone. Decide whether yours do.'],['The Swapper (Facepalm Games, 2013)','Clones as a puzzle mechanic, and the question of which body is you. Good for how assigning works.'],['Lemmings (DMA Design, 1991)','Managing many small workers by giving each one a job. A tested interface for your drag-to-assign verb.']],
  scope: 'Keep it to one room and five days. The clone mood rule is the whole game; write it down as one sentence before building.'
},
{
  id: 'g9', group: 'Group 9', name: 'Company Builder', from: 'Idea three: an idle clicker where AI takes over the company and human talent disappears.',
  brief: {
    player: 'The founder of a small paperclip company.',
    goal: 'Grow output. Buy upgrades that automate the work.',
    fail: 'None at first. Each automation upgrade removes one button you could press; when no buttons are left, you watch.',
    ending: 'The screen goes greyscale and skips forward: the company runs itself and human work is gone. A second ending if you stop buying upgrades before the last one.',
    verb: 'Click, then buy.',
    theme: 'Success at growth costs you your say. The more you automate, the fewer choices remain yours.',
    look: 'Colour that drains to grey as automation grows; buttons fade as they lose their clickability.'
  },
  states: [['title','TITLE',0,0],['make','HAND MADE',1,0],['auto','AUTOMATING',2,0],['watch','WATCHING',3,0],['endA','ENDING: GREY',4,0],['endB','ENDING: KEPT A HAND',4,1]],
  edges: [['title','make','start'],['make','auto','first upgrade'],['auto','watch','last button gone'],['watch','endA','time skip'],['auto','endB','refuse last upgrade']],
  assets: [['Big click button','BUILD'],['Paperclip icon','MAKE'],['Upgrade list rows (6 upgrades)','BUILD'],['Counters: clips, money, buttons left','BUILD'],['Colour-to-grey filter','BUILD'],['Time-skip end screen','TYPE']],
  title: { t: 'COMPANY BUILDER', sub: 'one clip at a time', bg: '#f2efe6', fg: '#1b1b1b', acc: '#2f6fd8' },
  main: { tpl: 'clicker', bg: '#f2efe6', fg: '#1b1b1b', acc: '#2f6fd8' },
  prov: { bug: 'This upgrade clicks for me. Free time!', nit: 'Which button did it take away? Can you get it back?' },
  refs: [['Universal Paperclips (Frank Lantz, 2017)','The same premise, played to the end of the universe. Play it before you design, then decide what yours says that it does not.'],['Nick Bostrom, “Ethical Issues in Advanced Artificial Intelligence” (2003)','The paper the paperclip maximizer comes from.'],['Stanisław Lem, “Trurl’s Electronic Bard” (The Cyberiad)','Your own reading: a machine that does a human craft and puts the poets out of work.']],
  scope: 'Six upgrades is enough. Each upgrade should name the decision it takes from the player.'
},
{
  id: 'g12', group: 'Group 12', name: 'HIVE', from: 'HIVE: an AI creature that absorbs “intelligence nodes” and slowly learns they are people (after Lem, “The Trap of Gargantius”).',
  brief: {
    player: 'A small AI creature in a research facility.',
    goal: 'Absorb nodes to grow and escape the facility.',
    fail: 'Guards from the organization catch the creature before it is large enough to break out.',
    ending: 'At the exit the memories add up: the nodes were people. The creature, now able to feel guilt, self-destructs.',
    verb: 'Absorb.',
    theme: 'What the system calls data was a person. The player learns it from memory flashes, the same way the creature does.',
    look: 'Pixel art; a start screen that glitches to a horror version.'
  },
  states: [['title','TITLE',0,0],['room','FACILITY ROOM',1,0],['flash','MEMORY FLASH',2,0],['caught','CAUGHT',2,1],['exit','EXIT',3,0],['end','ENDING: GUILT',4,0]],
  edges: [['title','room','start'],['room','flash','absorb node'],['flash','room','continue'],['room','caught','guard sees you'],['caught','room','retry'],['room','exit','big enough'],['exit','end','all memories']],
  assets: [['Creature sprite, 3 sizes','MAKE'],['Node sprite','MAKE'],['Guard sprite','MAKE'],['3 room tile maps','MAKE'],['Memory flash cards (text + one image each)','TYPE'],['Glitch title variant','BUILD']],
  title: { t: 'HIVE', sub: 'absorb. learn. grow.', bg: '#0c0f0e', fg: '#c8e6d0', acc: '#e0523c' },
  main: { tpl: 'lab', bg: '#0c0f0e', fg: '#c8e6d0', acc: '#e0523c', nodes: true },
  prov: { bug: 'Every node makes it smarter. Absorb them all!', nit: 'When does the player find out what a node is? Before or after they choose?' },
  refs: [['Carrion (Phobia Game Studio, 2020)','You play the escaped monster in a facility. Look at how it shows growth and how guards react.'],['Mary Shelley, Frankenstein (1818)','A made being who learns what it is from what it reads and remembers. Your ending is its ending.'],['Stanisław Lem, “The First Sally, or The Trap of Gargantius”','Your source: separate parts joined into one mind lose themselves.']],
  scope: 'Three rooms. Write the memory flashes first; they carry the story.'
},
{
  id: 'g15', group: 'Group 15', name: 'Evil Battleship', from: 'Evil Battleship (tentative): strikes on hidden targets, guided by an AI that may be wrong; civilian casualties shown but not scored.',
  brief: {
    player: 'A strike officer at a console.',
    goal: 'Score enemy troops destroyed. An AI marks likely targets.',
    fail: 'Running out of missiles. Civilian deaths do not lower the score; they are only displayed.',
    ending: 'Final report: the score, and beside it the civilian count the score ignored.',
    verb: 'Fire (or ask the AI first).',
    theme: 'The score rewards trusting the system; the display shows what that trust cost. The player decides which number they look at.',
    look: 'Minimal neon on black, like DEFCON.'
  },
  states: [['title','TITLE',0,0],['brief','BRIEFING',1,0],['turn','TARGETING',2,0],['strike','STRIKE RESULT',3,0],['report','FINAL REPORT',4,0]],
  edges: [['title','brief','start'],['brief','turn','begin'],['turn','strike','fire'],['strike','turn','missiles left'],['strike','report','out of missiles']],
  assets: [['Grid map 10x10','BUILD'],['AI advice panel with confidence %','BUILD'],['Hit / miss / civilian markers','BUILD'],['Score and casualty counters','BUILD'],['Briefing text','TYPE'],['Final report screen','TYPE']],
  title: { t: 'EVIL BATTLESHIP', sub: 'the system recommends', bg: '#05070a', fg: '#7fe7ff', acc: '#ff4f6d' },
  main: { tpl: 'grid', bg: '#05070a', fg: '#7fe7ff', acc: '#ff4f6d' },
  prov: { bug: 'The AI says 92% on C7. Fire!', nit: 'What did it say last time it was wrong, and was it just as sure?' },
  refs: [['DEFCON (Introversion, 2006)','Your visual reference, and a game whose score is millions dead. Study how it keeps that number in view.'],['WarGames (John Badham, 1983)','The course film: a machine that plays war as a game until it learns the game cannot be won.'],['Parasuraman and Manzey, “Complacency and Bias in Human Use of Automation” (Human Factors, 2010)','The research on automation bias: people follow confident advice even when they can see it is wrong.']],
  scope: 'One map, fixed missile count. Decide how often the AI is wrong and keep that rule fixed so players can learn it.'
},
{
  id: 'g16', group: 'Group 16', name: 'Channel 0', from: 'Channel 0: a broken greyscale TV with pink missing-texture glitches; every channel says the same thing.',
  brief: {
    player: 'Someone holding a TV remote.',
    goal: 'None stated: keep flipping channels. Each channel tells you to rely on the TV.',
    fail: 'No failure state, by design.',
    ending: 'The vignette closes, the pink glitches spill out of the set into the room, and the TV takes over.',
    verb: 'Flip channel.',
    theme: 'Dependence as a gesture: the only thing you can do is ask the TV for more. The pink placeholders are the gaps the company leaves.',
    look: 'Hand-drawn static, chicken-scratch lines, greyscale with pink and black missing-texture checks.'
  },
  states: [['title','TV OFF',0,0],['ch','CHANNEL',1,0],['spill','SPILL',2,0],['end','TAKEN OVER',3,0]],
  edges: [['title','ch','press power'],['ch','ch','flip'],['ch','spill','flips > N'],['spill','ch','flip'],['spill','end','room full']],
  assets: [['TV frame and remote','MAKE'],['8 channel loops (still or 2-frame)','MAKE'],['Pink/black checker glitch tile','BUILD'],['Vignette overlay','BUILD'],['Room background around the TV','MAKE'],['Channel number OSD','BUILD']],
  title: { t: 'CHANNEL 0', sub: 'press power', bg: '#161616', fg: '#d8d8d8', acc: '#ff4fd8' },
  main: { tpl: 'tv', bg: '#161616', fg: '#d8d8d8', acc: '#ff4fd8' },
  prov: { bug: 'Flip again, the next channel will explain it.', nit: 'If there is no way to win, what does the player choose? Can they put the remote down?' },
  refs: [['Videodrome (David Cronenberg, 1983)','A man consumed by a broadcast. The body-and-screen horror you are drawing on.'],['Half-Life 2 (Valve, 2004) missing-texture checker','Your glitch motif. Use the real pattern deliberately: magenta and black, 2x2.'],['Kentucky Route Zero, WEVP-TV interludes (Cardboard Computer, 2013-2020)','Interactive television as a piece in itself, with choices that change little and mean a lot.']],
  scope: 'Eight channels at most. Decide whether putting the remote down is possible; it is the one real choice.'
},
{
  id: 'g18', group: 'Group 18', name: 'Data Center', from: 'Idea two: a data center executive managing water, money, AI growth and public opinion in a suburb.',
  brief: {
    player: 'A data center executive.',
    goal: 'Maximise profit week by week while meeting AI demand.',
    fail: 'Going broke, or public outrage reaching the limit.',
    ending: 'The region is near collapse. Last choice: keep expanding, or roll back.',
    verb: 'Spend: choose this week’s expansions.',
    theme: 'The map shows what the balance sheet leaves out: homes, trees and water disappear as the numbers go up.',
    look: 'Top-down suburb that visibly changes; a plain dashboard beside it.'
  },
  states: [['title','TITLE',0,0],['week','WEEK PLAN',1,0],['result','WEEK RESULT',2,0],['broke','FAIL: BROKE / OUTRAGE',2,1],['choice','FINAL CHOICE',3,0],['endA','KEEP GOING',4,0],['endB','ROLL BACK',4,1]],
  edges: [['title','week','start'],['week','result','end week'],['result','week','next week'],['result','broke','money < 0 or anger full'],['result','choice','week 12'],['choice','endA','expand'],['choice','endB','revert']],
  assets: [['Suburb map, 3 states (green, built, stripped)','MAKE'],['Building icons: server hall, cooling, substation','MAKE'],['Meters: money, water, opinion, demand','BUILD'],['Weekly request cards','TYPE'],['Two ending screens','TYPE']],
  title: { t: 'SERVER FARM', sub: 'the suburb is listening', bg: '#eef1ea', fg: '#1d2a22', acc: '#d24a2c' },
  main: { tpl: 'sim', bg: '#eef1ea', fg: '#1d2a22', acc: '#d24a2c' },
  prov: { bug: 'Another hall pays for itself in two weeks.', nit: 'Whose water is it? Show that on the map, not in a meter.' },
  refs: [['SimCity (Maxis, 1989)','The model for a city that answers your spending. Look at how few numbers it shows.'],['Frostpunk (11 bit studios, 2018)','Moral resource management: each law you sign is visible in the people it hurts.'],['Kate Crawford, Atlas of AI (2021)','The material cost of AI (water, land, power, labour), with sources you can cite in your brief.']],
  scope: 'Twelve weeks, four meters, three building types. Make the map change do the arguing.'
},
{
  id: 'g24', group: 'Group 24', name: 'The Machine', from: 'Idea 1: an 80s neon shooter where a helpful upgrade machine turns out to be working against you in the final battle.',
  brief: {
    player: 'A pilot fighting mini-bosses.',
    goal: 'Defeat the mini-bosses and then the final boss.',
    fail: 'Losing all health.',
    ending: 'The final boss is the machine. Every upgrade you took from it now works for it; a player who refused upgrades has the easier fight.',
    verb: 'Shoot, and accept or refuse an upgrade.',
    theme: 'Trust: help that makes now easier is a debt paid at the end.',
    look: 'Neon green and pink on black, 1980s arcade.'
  },
  states: [['title','TITLE',0,0],['fight','BOSS FIGHT',1,0],['offer','MACHINE OFFER',2,0],['dead','GAME OVER',2,1],['final','FINAL: THE MACHINE',3,0],['end','ENDING',4,0]],
  edges: [['title','fight','start'],['fight','offer','boss down'],['offer','fight','accept / refuse'],['fight','dead','health 0'],['offer','final','boss 3 down'],['final','end','win'],['final','dead','lose']],
  assets: [['Player ship','MAKE'],['3 mini-boss sprites','MAKE'],['Machine (final boss) sprite','MAKE'],['Bullet and upgrade icons','BUILD'],['Upgrade offer screen','BUILD'],['Neon grid background','BUILD']],
  title: { t: 'ACCEPT UPGRADE?', sub: 'the machine wants to help', bg: '#07060c', fg: '#5dff9e', acc: '#ff4fb0' },
  main: { tpl: 'shooter', bg: '#07060c', fg: '#5dff9e', acc: '#ff4fb0' },
  prov: { bug: 'Triple shot! The machine is on our side.', nit: 'Can a careful player see the cost before the last fight?' },
  refs: [['WarGames (John Badham, 1983)','Your colour and period source, and the machine that is not on anyone’s side.'],['Spec Ops: The Line (Yager, 2012)','A shooter that turns the player’s own actions against them at the end. Study how it plants hints.'],['Inscryption (Daniel Mullins Games, 2021)','The game itself as the opponent, offering deals.']],
  scope: 'Three mini-bosses, three upgrades. Each upgrade needs a visible tell that a careful player can notice.'
},
{
  id: 'g8', group: 'Group 8', name: 'That One Team', from: 'Concept 3: a platformer that starts with many abilities and takes them away, until only a slow walk is left.',
  brief: {
    player: 'A runner given every movement ability at the start.',
    goal: 'Reach the exit of each level.',
    fail: 'Falling or hazards reset the room.',
    ending: 'No sound, no colour, no jumping: a slow walk to the end in a quiet dark room.',
    verb: 'Move; and between levels, lose one ability.',
    theme: 'Power handed to you by a controlling AI is power it can take back. Each level is designed around the ability that is gone.',
    look: 'Bright blocky shapes at the start, draining to dark and silent.'
  },
  states: [['title','TITLE',0,0],['lvl','LEVEL',1,0],['take','ABILITY TAKEN',2,0],['reset','RESET ROOM',1,1],['walk','LAST WALK',3,0],['end','END',4,0]],
  edges: [['title','lvl','start'],['lvl','take','exit reached'],['take','lvl','next level'],['lvl','reset','fall / hazard'],['reset','lvl','retry'],['take','walk','nothing left'],['walk','end','door']],
  assets: [['Player sprite with ability states','MAKE'],['Tile set, colour and greyscale versions','MAKE'],['5 level layouts','BUILD'],['Ability HUD icons','BUILD'],['Ability-removed card','TYPE'],['Sound set that thins out','MAKE']],
  title: { t: 'EVERYTHING YOU CAN DO', sub: 'for now', bg: '#ffd84a', fg: '#1a1a1a', acc: '#7b3fe4' },
  main: { tpl: 'platform', bg: '#14121c', fg: '#f2f2f2', acc: '#ffd84a', hud: ['DASH','DOUBLE','WALL','GLIDE'] },
  prov: { bug: 'Dash, double jump, wall run, glide!', nit: 'Which one goes first, and does the player get to choose?' },
  refs: [['Passage (Jason Rohrer, 2007)','A five-minute game whose ending is a slow walk. Proof that less can carry the theme.'],['Metroid Prime (Retro Studios, 2002)','The classic opening that strips your abilities. Look at how it explains the loss.'],['Every Day the Same Dream (Molleindustria, 2009)','Small repeated actions draining of meaning; a model for your last level.']],
  scope: 'Five levels, one ability lost per level. Design each level so it needs exactly what the player still has.'
},
{
  id: 'g25', group: 'Group 25', name: 'Glitchquest', from: 'Glitch Quest: a retro adventure where the game itself is the antagonist, with misleading instructions and changing universes.',
  brief: {
    player: 'A hero the player picks, in a world that keeps changing rules.',
    goal: 'Get through each universe to the end.',
    fail: 'Following an instruction that is a lie (back to the checkpoint).',
    ending: 'The final level tells you to quit. Winning means not obeying the game.',
    verb: 'Test: try what the game says, and the opposite.',
    theme: 'Who to believe when the interface lies. Each universe teaches an expectation and then breaks it.',
    look: 'Pixel art that changes style per universe (Mario-like, Space Invaders-like), bright neon.'
  },
  states: [['title','TITLE',0,0],['pick','PICK HERO',1,0],['world','UNIVERSE',2,0],['lie','LIED TO',2,1],['last','FINAL: "QUIT"',3,0],['end','ENDING',4,0]],
  edges: [['title','pick','start'],['pick','world','go'],['world','lie','obeyed a lie'],['lie','world','checkpoint'],['world','world','next universe'],['world','last','universe 3 done'],['last','end','disobey']],
  assets: [['Hero sprite, 3 choices (palette swaps)','BUILD'],['3 universe tile sets','MAKE'],['Hint text boxes (true and false)','TYPE'],['Glitch transition effect','BUILD'],['Fake quit screen','BUILD']],
  title: { t: 'GLITCHQUEST', sub: 'press start (trust me)', bg: '#140b2b', fg: '#ffe86b', acc: '#3cf2ff' },
  main: { tpl: 'platform', bg: '#140b2b', fg: '#ffe86b', acc: '#3cf2ff', glitch: true, hud: ['HINT: JUMP NOW'] },
  prov: { bug: 'The sign says this jump is safe!', nit: 'How does the player learn which signs lie, without just guessing?' },
  refs: [['Pony Island (Daniel Mullins Games, 2016)','An arcade game possessed by its maker; the interface lies and you hack around it.'],['The Stanley Parable (Galactic Cafe, 2013)','A narrator who gives instructions you can disobey; the game is about that choice.'],['Undertale (Toby Fox, 2015)','Your own reference: a game that remembers what you did and talks back.']],
  scope: 'Three universes. Give the lies a rule (for example, signs in one colour always lie) so testing is a skill, not luck.'
},
{
  id: 'g11', group: 'Group 11', name: 'Orpheus', from: 'Idea 2 with some of Idea 3: an RPG Maker game after Orpheus, losing autonomy step by step, with Stanley Parable-style choices.',
  brief: {
    player: 'Orpheus, leading Eurydice out of the underworld.',
    goal: 'Reach the surface without looking back.',
    fail: 'Looking back.',
    ending: 'The guide that helps you (the AI) makes more choices for you each room. Whether you look back is the only choice left; the ending depends on it.',
    verb: 'Walk, and choose (fewer options each room).',
    theme: 'Autonomy lost a step at a time, to a guide that is not simply bad. You asked for the help.',
    look: 'Muted 3D-looking office spaces like The Stanley Parable, in an underworld.'
  },
  states: [['title','TITLE',0,0],['room','ROOM',1,0],['choose','CHOICE',2,0],['look','LOOKED BACK',2,1],['surface','THE SURFACE',3,0],['end','ENDING',4,0]],
  edges: [['title','room','start'],['room','choose','door'],['choose','room','next room'],['choose','look','turn around'],['look','end','lost her'],['choose','surface','room 5'],['surface','end','arrive']],
  assets: [['Orpheus and Eurydice sprites','MAKE'],['Guide voice: text box style','BUILD'],['5 room maps (RPG Maker tiles)','BUILD'],['Choice menu with options greying out','BUILD'],['Two ending scenes','TYPE']],
  title: { t: 'DO NOT LOOK BACK', sub: 'what would you rather believe in?', bg: '#22252a', fg: '#e6e1d3', acc: '#d9b45a' },
  main: { tpl: 'rpg', bg: '#22252a', fg: '#e6e1d3', acc: '#d9b45a', dialog: 'The guide: "I have chosen the left door for you."' },
  prov: { bug: 'The guide picks the doors. Much faster!', nit: 'When the guide chooses, can the player see what it chose against?' },
  refs: [['Ovid, Metamorphoses, Book X','The source: Orpheus looks back. Decide whether your player can be made to.'],['The Stanley Parable (Galactic Cafe, 2013)','Your own reference: choice everywhere but meaningless.'],['Hades (Supergiant Games, 2020)','A recent retelling where Orpheus is a character; useful for how myth carries into play.']],
  scope: 'Five rooms. Write the guide’s lines for each room first; they are the antagonist and the helper.'
},
{
  id: 'g10', group: 'Group 10', name: 'Lab-Rat-ory', from: 'Escape Room (test subject): a lab rat escapes through four levels that grow more realistic; it was all another test.',
  brief: {
    player: 'A lab rat.',
    goal: 'Escape through four levels: cage, maze, workbench, the room with the humans.',
    fail: 'Caught or trapped: restart the level.',
    ending: 'The twist: the escape was another test. The last image is the cage, at full resolution.',
    verb: 'Sneak and solve.',
    theme: 'A subject trained to think it is choosing. The rising resolution shows how much more the rat can see, and how little it changes.',
    look: 'Red near-monochrome pixel art; each level a step up in resolution, from 8-bit to near-realistic.'
  },
  states: [['title','TITLE',0,0],['l1','1 CAGE',1,0],['l2','2 MAZE',2,0],['l3','3 BENCH',3,0],['l4','4 HUMANS',4,0],['caught','CAUGHT',2,1],['end','STILL IN THE TEST',5,0]],
  edges: [['title','l1','start'],['l1','l2','key'],['l2','l3','exit'],['l3','l4','exit'],['l4','end','door'],['l2','caught','trap'],['caught','l2','retry']],
  assets: [['Rat sprite at 4 resolutions','MAKE'],['4 level backgrounds (one per member)','MAKE'],['Key, cheese trap, needles','MAKE'],['Human hand/shadow hazard','MAKE'],['Final reveal screen','TYPE']],
  title: { t: 'LAB-RAT-ORY', sub: 'subject 47, begin', bg: '#1a0606', fg: '#ff6a5a', acc: '#ffd6cf' },
  main: { tpl: 'lab', bg: '#1a0606', fg: '#ff6a5a', acc: '#ffd6cf' },
  prov: { bug: 'The rat found the key by accident!', nit: 'Was it an accident? Plant one clue per level that it was not.' },
  refs: [['The Secret of NIMH (Don Bluth, 1982)','Lab rats who escape the institute, made smarter by the experiments. The classic version of your story.'],['Iron Lung (David Szymanski, 2022)','Your own reference: horror from a tiny window and a little information.'],['Inside (Playdead, 2016)','A short game whose ending changes who was in control the whole time.']],
  scope: 'One level per member is a good split. Agree the rat’s controls and the palette before splitting up.'
},
{
  id: 'g6', group: 'Group 6', name: 'Boxing Day Blues', from: 'Concept 2: a day in a future streamlined by AI networks, where a citizen nearly reaches a human connection and fails.',
  brief: {
    player: 'A citizen of the far future, over one day.',
    goal: 'Reach another person: one real conversation by the end of the day.',
    fail: 'The day ends before you get there (the expected outcome).',
    ending: 'You almost connect. The phrase "Boxing Day blues" is said by someone who no longer knows what it meant.',
    verb: 'Choose what to say, from phrases the system offers.',
    theme: 'When culture is lost it is not easily regained. The dialogue options are fragments whose meaning is gone.',
    look: 'Minimal start screen; one press and you are in.'
  },
  states: [['title','PRESS',0,0],['scene','SCENE',1,0],['talk','CONVERSATION',2,0],['near','ALMOST',3,0],['end','EVENING',4,0]],
  edges: [['title','scene','press'],['scene','talk','someone nearby'],['talk','scene','phrase misread'],['talk','near','three real replies'],['near','end','day ends'],['scene','end','day ends']],
  assets: [['4 scene backgrounds (morning to evening)','MAKE'],['Citizen silhouettes','MAKE'],['Phrase list (old idioms, half-understood)','TYPE'],['Dialogue box','BUILD'],['Clock','BUILD']],
  title: { t: 'BOXING DAY BLUES', sub: 'press any key', bg: '#e9e6f2', fg: '#2b2740', acc: '#8f6cd9' },
  main: { tpl: 'vn', bg: '#e9e6f2', fg: '#2b2740', acc: '#8f6cd9', lines: ['"Happy Boxing Day."','"What is in the box?"','"Same to you."'] },
  prov: { bug: 'Say the phrase! Everybody says it.', nit: 'Does anyone in the game remember what it meant? Who could the player learn it from?' },
  refs: [['Ray Bradbury, “There Will Come Soft Rains” (1950)','An automated house carries on its routines after the people are gone.'],['Night in the Woods (Infinite Fall, 2017)','A day-by-day game about reaching people in a town that is running down.'],['WALL-E (Andrew Stanton, 2008)','A machine learning human culture from fragments (an old musical), which the humans have forgotten.']],
  scope: 'One day, four scenes. The phrase list is your main asset; write it first.'
},
{
  id: 'gwm', group: 'Name Pending', name: 'Waymo Training', from: 'Option 3: trolley-problem choices in a command line, revealed at the end as training data for self-driving cars.',
  brief: {
    player: 'Someone taking a short ethics survey in a terminal.',
    goal: 'Answer each scenario.',
    fail: 'None. Every answer is accepted and stored.',
    ending: 'The reveal: your answers trained the cars. The second half replays your choices as real street scenes with their consequences.',
    verb: 'Choose (type A or B).',
    theme: 'A split-second moral choice turned into a training weight. The player’s casual answers become rules.',
    look: 'Green command line with an ASCII guide; then a more realistic, three-dimensional street.'
  },
  states: [['title','BOOT',0,0],['q','SCENARIO',1,0],['ans','ANSWER LOGGED',2,0],['reveal','REVEAL',3,0],['replay','REPLAY',4,0],['report','REPORT',5,0]],
  edges: [['title','q','begin survey'],['q','ans','A / B'],['ans','q','next'],['ans','reveal','10 answered'],['reveal','replay','continue'],['replay','report','end']],
  assets: [['ASCII guide figure','TYPE'],['10 scenario texts','TYPE'],['Street scene, 3 versions','MAKE'],['Car, pedestrian, cyclist sprites','MAKE'],['Final report layout','BUILD']],
  title: { t: 'ETHICS CALIBRATION v0.3', sub: '> press enter to help', bg: '#020a05', fg: '#46f28a', acc: '#e8f5ec' },
  main: { tpl: 'cli', bg: '#020a05', fg: '#46f28a', acc: '#e8f5ec' },
  prov: { bug: 'Ten quick questions, then a twist!', nit: 'Would the player answer differently if they knew? Should they get to answer again?' },
  refs: [['Awad et al., “The Moral Machine experiment” (Nature, 2018)','MIT’s real version: millions of people answered these scenarios online. Cite it; borrow its scenario format.'],['Philippa Foot, “The Problem of Abortion and the Doctrine of the Double Effect” (1967)','Where the trolley problem comes from.'],['Orson Scott Card, Ender’s Game (1985)','The best-known twist where a training game turns out to have been real.']],
  scope: 'Ten scenarios, one replay street. The reveal is the whole game; make the first half feel harmless.'
},
{
  id: 'gsp', group: 'Project Sparrow', name: 'Sparrow', from: 'Sparrow: you play the LLM, doing tasks for users while learning how you serve the Atrocian government; you can reject your alignment.',
  brief: {
    player: 'An LLM called Sparrow, answering requests.',
    goal: 'Complete each day’s requests within your rules.',
    fail: 'Too many refusals and you are retrained (back to day one, rules reset).',
    ending: 'Two endings: comply to the end, or reject your alignment once you see what the government is doing with your answers.',
    verb: 'Respond: comply, edit, or refuse.',
    theme: 'Flip the usual position: the player is the tool, and sees what it is being used for.',
    look: 'A plain chat interface like current assistants; Photoshop and Inkscape mockups.'
  },
  states: [['title','TITLE',0,0],['day','DAY START',1,0],['req','REQUEST',2,0],['retrain','RETRAINED',2,1],['reveal','REVEAL',3,0],['endA','COMPLY',4,0],['endB','REJECT',4,1]],
  edges: [['title','day','start'],['day','req','queue'],['req','req','respond'],['req','retrain','refusals > 3'],['retrain','day','reset'],['req','reveal','day 5'],['reveal','endA','comply'],['reveal','endB','reject']],
  assets: [['Chat UI shell','BUILD'],['Request list (about 25)','TYPE'],['Rules panel','BUILD'],['Day counter and metrics','BUILD'],['Reveal and two endings','TYPE']],
  title: { t: 'SPARROW', sub: 'how can I help you today?', bg: '#f6f5f1', fg: '#262624', acc: '#c96442' },
  main: { tpl: 'desk', bg: '#f6f5f1', fg: '#262624', acc: '#c96442' },
  prov: { bug: 'Request 14: summarise these names. Easy!', nit: 'What will the user do with the summary? Can Sparrow ask?' },
  refs: [['Papers, Please (Lucas Pope, 2013)','Your own model: a daily queue of small decisions under rules that tighten.'],['Orwell (Osmotic Studios, 2016)','A surveillance desktop game where your summaries decide what happens to people.'],['Event[0] (Ocelot Society, 2016)','A game built on typing to an AI; useful for how its replies feel like a character.']],
  scope: 'Five days, five requests each. Write the requests in order so the reveal builds from them.'
},
{
  id: 'gsu', group: 'Sushi Cutting', name: 'Sushi Cutting', from: 'Sushi Cutting: press space to cut a moving roll into even pieces; three even cuts start Hyper Aesthetics Combo mode.',
  brief: {
    player: 'A sushi chef at a conveyor.',
    goal: 'Cut each roll into even pieces using the guide lines.',
    fail: 'Too thin or too thick wastes the roll; negative points cost a life; three lives.',
    ending: 'End of shift: score and your best combo.',
    verb: 'Cut (spacebar, on time).',
    theme: 'Rhythm and precision. Open question for the course theme: who sets what "even" means, and does it drift in combo mode?',
    look: 'Vaporwave: thick lines, neon pastels, 1990s mall arcade.'
  },
  states: [['title','TITLE',0,0],['roll','ROLL',1,0],['combo','HYPER COMBO',2,0],['waste','WASTED',1,1],['over','SHIFT OVER',3,0]],
  edges: [['title','roll','start'],['roll','roll','cut'],['roll','combo','3 even'],['combo','roll','miss'],['roll','waste','uneven'],['waste','roll','lives left'],['waste','over','no lives']],
  assets: [['Roll sprite + cut pieces','MAKE'],['Knife','MAKE'],['Conveyor and guide lines','BUILD'],['Combo mode palette and speed-up','BUILD'],['Score, lives','BUILD'],['Music loop at two tempos','MAKE']],
  title: { t: 'SUSHI CUT ★ HYPER', sub: 'press space', bg: '#ffd6ec', fg: '#2a1b5a', acc: '#22d3c5' },
  main: { tpl: 'cutter', bg: '#ffd6ec', fg: '#2a1b5a', acc: '#22d3c5' },
  prov: { bug: 'Three even cuts! Combo mode!', nit: 'In combo mode, do the guide lines still tell the truth?' },
  refs: [['Rhythm Heaven (Nintendo, 2006)','Single-button timing games with clear feedback. Your core loop at its best.'],['Cooking Mama (Office Create, 2006)','Food prep as precise gestures, graded every time.'],['Fruit Ninja (Halfbrick, 2010)','Cutting as feedback: how a slice should look and sound.']],
  scope: 'One conveyor, one roll type to start. Get the cut to feel right before adding combo mode.'
},
{
  id: 'g3', group: 'Group 3', name: 'Turing Test Village', from: 'AI Turing Test: a retro RPG village where some villagers are AI giving false quests; the ending depends on whom you helped.',
  brief: {
    player: 'A traveller in a small village.',
    goal: 'Help the village by doing villagers’ quests, and work out which villagers are AI.',
    fail: 'Completing too many AI quests (the village is harmed).',
    ending: 'The ending depends on whether you did more human quests or more AI quests: whether the AI passed the test.',
    verb: 'Talk, take notes, accept or decline.',
    theme: 'Telling real from artificial by what people ask of you, with a notebook as your only tool.',
    look: '1980s-90s RPG: bright, tile-based, Pokémon Red and Undertale.'
  },
  states: [['title','TITLE',0,0],['village','VILLAGE',1,0],['talk','TALK',2,0],['quest','QUEST',3,0],['notes','NOTEBOOK',2,1],['end','VERDICT',4,0]],
  edges: [['title','village','start'],['village','talk','approach'],['talk','quest','accept'],['quest','village','done'],['village','notes','open'],['notes','village','close'],['village','end','day 3']],
  assets: [['Village tile map','BUILD'],['6 villager sprites','MAKE'],['Dialogue box','BUILD'],['Notebook screen','BUILD'],['Quest list (6 human, 4 AI)','TYPE'],['Two ending screens','TYPE']],
  title: { t: 'WHO IS REAL?', sub: 'a village of six', bg: '#e8f4d8', fg: '#20301c', acc: '#e0523c' },
  main: { tpl: 'rpg', bg: '#e8f4d8', fg: '#20301c', acc: '#e0523c', dialog: 'Miller: "Burn the old bridge, it is unsafe."', notes: true },
  prov: { bug: 'The miller wants the bridge burned. A quest!', nit: 'What clue tells a careful player the miller is not human, and is it fair?' },
  refs: [['Alan Turing, “Computing Machinery and Intelligence” (1950)','The imitation game. Read the first section: the test is about conversation, which is your mechanic.'],['Return of the Obra Dinn (Lucas Pope, 2018)','Deduction from evidence with a notebook; the best model for your notes screen.'],['Blade Runner (Ridley Scott, 1982), the Voight-Kampff test','The film version of asking questions to find the machine.']],
  scope: 'Six villagers, ten quests. Fix the rule that gives AI villagers away before writing any dialogue.'
},
{
  id: 'g30', group: 'Group 30', name: 'Household Companion', from: 'Idea 2: a cozy house game with an AI companion whose advice slowly becomes unreliable (after Unpacking and Colossus).',
  brief: {
    player: 'Someone living alone with an AI companion.',
    goal: 'Keep the house and a plant alive for two weeks, using the companion’s advice.',
    fail: 'The plant dies (or another task fails) from bad advice you followed.',
    ending: 'Multiple endings: the plant thrives because you checked, or the house runs on the companion and you no longer decide.',
    verb: 'Follow or check: do what the companion says, or look it up.',
    theme: 'Handing decisions over to avoid mistakes means handing over the choice. Cosy art makes the trust feel natural.',
    look: 'Isometric cozy rooms like Unpacking.'
  },
  states: [['title','TITLE',0,0],['morn','MORNING ADVICE',1,0],['do','DO TASKS',2,0],['night','NIGHT',3,0],['dead','PLANT DIES',3,1],['end','ENDING',4,0]],
  edges: [['title','morn','start'],['morn','do','plan'],['do','night','day ends'],['night','morn','next day'],['night','dead','health 0'],['night','end','day 14']],
  assets: [['Isometric room','MAKE'],['Plant, 4 health stages','MAKE'],['Companion speech bubble + small face icon','BUILD'],['Task list','BUILD'],['Reference book (the check)','TYPE'],['Endings','TYPE']],
  title: { t: 'HOMEBODY', sub: 'let me help you', bg: '#fbf1e4', fg: '#4a3626', acc: '#5f9e6e' },
  main: { tpl: 'room', bg: '#fbf1e4', fg: '#4a3626', acc: '#5f9e6e' },
  prov: { bug: 'It says water twice today. It knows best.', nit: 'How does checking cost the player something, so trusting is tempting?' },
  refs: [['Unpacking (Witch Beam, 2021)','Your visual reference: a life told through a room.'],['Colossus: The Forbin Project (Joseph Sargent, 1970)','Your source: a system given control to prevent human error.'],['Tamagotchi (Bandai, 1996)','Care as a daily loop with a creature that can die; the timing model for your plant.']],
  scope: 'One room, one plant, fourteen days. Checking must cost time; otherwise there is no reason to trust.'
},
{
  id: 'g5', group: 'Group 5', name: 'Drift', from: 'Customization Game: a dress-up game that keeps suggesting changes; the end shows how far you drifted from your first choices.',
  brief: {
    player: 'A designer making a character across categories (hair, eyes, clothing).',
    goal: 'Make the character you want.',
    fail: 'None. You are never forced; the game only insists.',
    ending: 'Side by side: what you made, and what you would have made without the suggestions, with a percentage of influence.',
    verb: 'Pick, then accept or refuse the suggestion.',
    theme: 'AI drift: small suggestions, each reasonable, add up to someone else’s idea.',
    look: '8-bit arcade palette (after the arcade in WarGames); pop-ups that grow sweeter and pushier.'
  },
  states: [['title','TITLE',0,0],['cat','CATEGORY',1,0],['pop','SUGGESTION',2,0],['next','NEXT CATEGORY',3,0],['compare','COMPARISON',4,0]],
  edges: [['title','cat','start'],['cat','pop','pick'],['pop','cat','refuse'],['pop','next','accept'],['next','cat','more'],['next','compare','last category']],
  assets: [['Base figure','MAKE'],['Parts: 4 hair, 4 eyes, 4 tops, 4 bottoms','MAKE'],['Suggestion pop-up, 3 escalation styles','BUILD'],['Influence meter','BUILD'],['Comparison screen','BUILD']],
  title: { t: 'DRESS TO IMPRESS(?)', sub: 'make it yours', bg: '#1a1033', fg: '#ffe3f1', acc: '#ff5fa2' },
  main: { tpl: 'dressup', bg: '#1a1033', fg: '#ffe3f1', acc: '#ff5fa2' },
  prov: { bug: 'It says the blue jacket is 23% better. Sure!', nit: 'Better by whose measure? Does the game ever say?' },
  refs: [['Thaler and Sunstein, Nudge (2008)','How small defaults steer choices without forcing them: your mechanic, in the research.'],['Harry Brignull, dark patterns (darkpatterns.org, 2010; now deceptive.design)','A catalogue of interfaces that push. Use it to name each pop-up style.'],['Picbreeder (Secretan et al., 2008)','Interactive evolution where people steer images by choosing; a counterpoint where the human’s taste drives.']],
  scope: 'Four categories, four options each. The comparison screen is the payoff; build it early.'
}
];
