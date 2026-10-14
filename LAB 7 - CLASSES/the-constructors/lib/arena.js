/* THE CONSTRUCTORS · arena engine (practice field and shared match). The engraved toolkit, a p5-style shim for entries, and the Match. */
"use strict";
/* =========================================================
   ENGRAVING TOOLKIT (shared with the Two Sallies reel)
   ========================================================= */
const P={paper:'#ebe3cf',ink:'#1c1814',red:'#b3402c',ochre:'#c28b25',rose:'#c25d76',amber:'#e3ad46',blue:'#4f7fbf'};
const FONT='"IM Fell English","DejaVu Serif",Georgia,serif';
let X=document.createElement('canvas').getContext('2d');
const clamp=(v,a=0,b=1)=>v<a?a:v>b?b:v;
const E={lin:x=>x,in:x=>x*x,out:x=>1-(1-x)*(1-x),io:x=>x<.5?2*x*x:1-Math.pow(-2*x+2,2)/2};
const seg=(t,a,b,e=E.io)=>e(clamp((t-a)/(b-a)));
function hash(a,b=0){let h=Math.imul(a|0,374761393)^Math.imul(b|0,668265263);h=Math.imul(h^(h>>>13),1274126177);h^=h>>>16;return(h>>>0)/4294967296;}
function rng(seed){let s=seed>>>0;return()=>{s=(s+0x6D2B79F5)>>>0;let t=s;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296;};}
let BOIL=0,SILENT=false;
const J=(id,k)=>hash(id*7919+k*131,BOIL)-.5;
function mkPat(sp,w,al){const c=document.createElement('canvas');c.width=6;c.height=sp;const g=c.getContext('2d');g.fillStyle=`rgba(28,24,20,${al})`;g.fillRect(0,0,6,w);return X.createPattern(c,'repeat');}
const PAT={f:mkPat(4,1,.75),m:mkPat(3,1.2,.9),d:mkPat(2,1.25,1)};
function ink(pts,w=1.4,id=1,amp=.9,col=P.ink,close=false){
  if(SILENT)return;X.beginPath();let k=0;
  for(let i=0;i<pts.length;i++){const[x,y]=pts[i];if(i===0){X.moveTo(x+J(id,k)*amp,y+J(id,k+1)*amp);k+=2;continue;}
    const[px,py]=pts[i-1];const n=Math.max(1,Math.ceil(Math.hypot(x-px,y-py)/26));
    for(let j=1;j<=n;j++){const u=j/n;X.lineTo(px+(x-px)*u+J(id,k)*amp,py+(y-py)*u+J(id,k+1)*amp);k+=2;}}
  if(close)X.closePath();X.lineWidth=w;X.strokeStyle=col;X.stroke();
}
function circ(x,y,r,id,amp){amp=amp??Math.min(1,r*.08);const n=r<10?10:16;X.beginPath();for(let i=0;i<=n;i++){const a=i/n*6.2832,rr=r+J(id,i%n)*amp*2;i?X.lineTo(x+Math.cos(a)*rr,y+Math.sin(a)*rr):X.moveTo(x+Math.cos(a)*rr,y+Math.sin(a)*rr);}X.closePath();}
function ball(x,y,r,id,pat=PAT.m,lw,fillCol=P.paper,stroke=true){
  if(SILENT||!(r>0))return;circ(x,y,r,id);X.fillStyle=fillCol;X.fill();X.save();X.clip();X.beginPath();X.rect(x-r-3,y-r-3,2*r+6,2*r+6);X.arc(x-r*.32,y-r*.36,r*.9,0,6.2832);X.fillStyle=pat;X.fill('evenodd');X.restore();
  if(stroke){circ(x,y,r,id);X.lineWidth=lw||Math.max(1,r*.15);X.strokeStyle=P.ink;X.stroke();}}
function star(x,y,r,id,col=P.ink,n=8){for(let i=0;i<n;i++){const a=i/n*6.2832+hash(id,i)*.3,r0=r*.35,r1=r*(.8+hash(id,i+9)*.5);ink([[x+Math.cos(a)*r0,y+Math.sin(a)*r0],[x+Math.cos(a)*r1,y+Math.sin(a)*r1]],1.5,id+i,.3,col);}}
function skyLines(y0,y1,dark){if(SILENT)return;for(let y=y0;y<y1;y+=4){const w=.45+1.15*clamp((dark-y)/1100)+hash(y|0,3)*.25;X.fillStyle=P.ink;X.fillRect(-100,y,1480,w);}}
function txt(s,x,y,size,o={}){if(SILENT)return;X.font=`${o.italic?'italic ':''}${o.bold?'bold ':''}${size}px ${o.mono?'"IBM Plex Mono","DejaVu Sans Mono",monospace':FONT}`;X.textAlign=o.align||'center';X.textBaseline='middle';X.fillStyle=o.col||P.ink;X.fillText(s,x,y);}
function border(w=1280,h=720){if(SILENT)return;X.fillStyle=P.paper;X.beginPath();X.rect(0,0,w,h);X.rect(22,22,w-44,h-44);X.fill('evenodd');ink([[22,22],[w-22,22],[w-22,h-22],[22,h-22]],2.4,3100,.6,P.ink,true);ink([[14,14],[w-14,14],[w-14,h-14],[14,h-14]],.9,3101,.5,P.ink,true);}
function flower(x,y,u,id,col,s=1.6){if(SILENT||u<=0)return;const top=[x,y-12*s*Math.min(1,u*1.6)];ink([[x,y],top],1.4,id,.2);const p=clamp((u-.4)/.6);if(p<=0)return;
  for(let i=0;i<5;i++){const a=i/5*6.2832-1.57;X.beginPath();X.arc(top[0]+Math.cos(a)*3*s*p,top[1]+Math.sin(a)*3*s*p,2.3*s*p,0,6.2832);X.fillStyle=col;X.fill();X.lineWidth=.7;X.strokeStyle=P.ink;X.stroke();}
  X.beginPath();X.arc(top[0],top[1],1.1*s*p,0,6.2832);X.fillStyle=P.ink;X.fill();}
function caption(str,mono){if(SILENT||!str)return;X.fillStyle='rgba(235,227,207,.95)';X.fillRect(22,624,1236,74);ink([[22,624],[1258,624]],1.4,7700,.5);
  let size=mono?22:28;X.font=`${mono?'':'italic '}${size}px ${mono?'"IBM Plex Mono","DejaVu Sans Mono",monospace':FONT}`;const w=X.measureText(str).width;if(w>1160)size*=1160/w;txt(str,640,661,size,{italic:!mono,mono});}

/* =========================================================
   THE RECRUIT. (x, y) is the body centre; feet at y + 25.
   plain style = the p5 helper students paste into the editor
   ========================================================= */
let DRAWN=0,TINT=null;
function recruit(x,y,dir,opts){
  if(SILENT)return;DRAWN++;
  if(RUN&&RUN.style==='plain'){X.save();X.lineWidth=1.5;X.strokeStyle='#1e1e1e';X.beginPath();X.moveTo(x,y+7);X.lineTo(x-6,y+25);X.moveTo(x,y+7);X.lineTo(x+6,y+25);X.moveTo(x,y+7);X.lineTo(x,y-23);X.stroke();
    X.fillStyle='rgb(255,220,0)';for(const[yy,d]of[[7,12],[-7,16],[-23,14]]){X.beginPath();X.arc(x,y+yy,d/2,0,6.2832);X.fill();X.stroke();}
    X.fillStyle='#1e1e1e';X.fillRect(x-14,y-10,4,7);X.fillStyle='rgb(255,220,0)';X.fillRect(x+9,y-9,6,2);X.fillRect(x+9,y-5,6,2);X.restore();return;}
  dir=dir===-1?-1:1;opts=opts||{};const id=7000+(DRAWN)*37,build=opts.build??1,acc=opts.acc||TINT||P.ochre,s=1.15;
  const hip=[x,y+6*s],ch=[x,y-6*s],hd=[x,y-20*s],g=y+22*s;
  if(build>.05){ink([hip,[x-5*s,g]],1.5,id+1);ink([hip,[x+5*s,g]],1.5,id+2);ink([[x-9*s,g],[x-3*s,g]],1.9,id+3,.3);ink([[x+3*s,g],[x+9*s,g]],1.9,id+4,.3);}
  if(build>.25){ink([hip,ch],1.5,id+5);ink([ch,[x+dir*8*s,ch[1]+7*s]],1.3,id+6);}
  if(build>.5)ink([ch,hd],1.3,id+7);
  if(build>.75){X.fillStyle=P.ink;X.fillRect(ch[0]-dir*10*s-2,ch[1]-3,4,6);ink([[ch[0]+dir*7*s,ch[1]],[ch[0]+dir*10*s,ch[1]]],2.3,id+8,.2);
    ink([[ch[0]+dir*10*s,ch[1]-1.8],[ch[0]+dir*14*s,ch[1]-1.8]],1.4,id+9,.2,acc);ink([[ch[0]+dir*10*s,ch[1]+1.8],[ch[0]+dir*14*s,ch[1]+1.8]],1.4,id+10,.2,acc);}
  if(build>.05)ball(hip[0],hip[1],5.4,id+11,PAT.f);
  if(build>.25)ball(ch[0],ch[1],7.1,id+12,PAT.m,0,opts.tint||(TINT?TINT:P.paper));
  if(build>.5)ball(hd[0],hd[1],6.2,id+13,PAT.f);
}

/* =========================================================
   P5 SHIM: student sketches run here unchanged
   ========================================================= */
let RUN=null,R=Math.random;
const SH={};
function resetSH(){Object.assign(SH,{fill:'#ffffff',stroke:'#000000',sw:1,noStroke:false,noFill:false,tsize:16,talign:'left',stack:[]});}
resetSH();
function colorArg(a){if(typeof a[0]==='string')return a[0];if(a.length<=2){const g=a[0];return`rgba(${g},${g},${g},${a.length===2?a[1]/255:1})`;}return`rgba(${a[0]},${a[1]},${a[2]},${a.length>3?a[3]/255:1})`;}
const plain=()=>!RUN||RUN.style==='plain';
function pFillStroke(){if(!SH.noFill){X.fillStyle=SH.fill;X.fill();}if(!SH.noStroke){X.lineWidth=SH.sw;X.strokeStyle=SH.stroke;X.stroke();}}
const P5={
  createCanvas(w,h){if(RUN)RUN.resize(w,h);},resizeCanvas(w,h){if(RUN)RUN.resize(w,h);},frameRate(){},noLoop(){if(RUN)RUN.looping=false;},loop(){if(RUN)RUN.looping=true;},angleMode(){},rectMode(){},ellipseMode(){},noCursor(){},smooth(){},noSmooth(){},
  background(...a){if(SILENT||!RUN)return;if(RUN.station&&RUN.style!=='plain'){RUN.terrain();return;}X.save();X.setTransform(1,0,0,1,0,0);X.fillStyle=colorArg(a);X.fillRect(0,0,RUN.w,RUN.h);X.restore();},
  clear(){if(SILENT||!RUN)return;X.clearRect(0,0,RUN.w,RUN.h);},
  fill(...a){SH.fill=colorArg(a);SH.noFill=false;},noFill(){SH.noFill=true;},stroke(...a){SH.stroke=colorArg(a);SH.noStroke=false;},noStroke(){SH.noStroke=true;},strokeWeight(w){SH.sw=w;},
  color(...a){return colorArg(a);},
  circle(x,y,d){P5.ellipse(x,y,d,d);},
  ellipse(x,y,w,h){if(SILENT)return;DRAWN++;h=h??w;if(!plain()&&Math.abs(w-h)<2){const col=SH.noFill?'rgba(0,0,0,0)':(SH.fill==='#ffffff'?P.paper:SH.fill);ball(x,y,Math.abs(w/2),9800+DRAWN,PAT.m,Math.max(1,SH.sw*1.2),col,!SH.noStroke);return;}
    X.beginPath();X.ellipse(x,y,Math.abs(w/2),Math.abs(h/2),0,0,6.2832);pFillStroke();},
  line(x1,y1,x2,y2){if(SILENT||SH.noStroke)return;DRAWN++;if(plain()){X.beginPath();X.moveTo(x1,y1);X.lineTo(x2,y2);X.lineWidth=SH.sw;X.strokeStyle=SH.stroke;X.stroke();return;}ink([[x1,y1],[x2,y2]],Math.max(1,SH.sw*1.3),9000+DRAWN,.5,SH.stroke==='#000000'?P.ink:SH.stroke);},
  point(x,y){if(SILENT)return;DRAWN++;X.beginPath();X.arc(x,y,Math.max(.8,SH.sw/2),0,6.2832);X.fillStyle=SH.stroke;X.fill();},
  rect(x,y,w,h){if(SILENT)return;DRAWN++;X.beginPath();X.rect(x,y,w,h);pFillStroke();},
  square(x,y,s){P5.rect(x,y,s,s);},
  triangle(x1,y1,x2,y2,x3,y3){if(SILENT)return;DRAWN++;X.beginPath();X.moveTo(x1,y1);X.lineTo(x2,y2);X.lineTo(x3,y3);X.closePath();pFillStroke();},
  text(s,x,y){if(SILENT)return;DRAWN++;X.font=`${SH.tsize}px ${plain()?'Arial,Helvetica,sans-serif':FONT}`;X.textAlign=SH.talign;X.textBaseline='alphabetic';X.fillStyle=SH.noFill?'#000':SH.fill==='#ffffff'&&!plain()?P.ink:SH.fill;X.fillText(String(s),x,y);},
  textSize(s){SH.tsize=s;},textAlign(a){SH.talign=(a==='center'||a===P5.CENTER)?'center':(a==='right'||a===P5.RIGHT)?'right':'left';},
  push(){X.save();SH.stack.push({...SH,stack:null});},pop(){X.restore();const s=SH.stack.pop();if(s){const st=SH.stack;Object.assign(SH,s);SH.stack=st;}},
  translate(x,y){X.translate(x,y);},rotate(a){X.rotate(a);},scale(a,b){X.scale(a,b??a);},
  random(a,b){if(Array.isArray(a))return a[Math.floor(R()*a.length)];if(a===undefined)return R();if(b===undefined)return R()*a;return a+R()*(b-a);},
  randomSeed(s){R=rng(s|0);},
  dist(x1,y1,x2,y2){return Math.hypot(x2-x1,y2-y1);},
  map(v,a,b,c,d){return c+(v-a)*(d-c)/(b-a);},constrain(v,a,b){return Math.min(Math.max(v,a),b);},lerp(a,b,t){return a+(b-a)*t;},
  abs:Math.abs,min:Math.min,max:Math.max,sqrt:Math.sqrt,floor:Math.floor,ceil:Math.ceil,round:Math.round,sin:Math.sin,cos:Math.cos,tan:Math.tan,atan2:Math.atan2,pow:Math.pow,sq:x=>x*x,
  noise(x,y=0){const xi=Math.floor(x),yi=Math.floor(y),xf=x-xi,yf=y-yi,f=t=>t*t*(3-2*t),h=(a,b)=>hash(a,b*57+11);const a=h(xi,yi),b=h(xi+1,yi),c=h(xi,yi+1),d=h(xi+1,yi+1),u=f(xf),v=f(yf);return a+(b-a)*u+(c-a)*v+(a-b-c+d)*u*v;},
  PI:Math.PI,TWO_PI:Math.PI*2,HALF_PI:Math.PI/2,CENTER:'center',LEFT:'left',RIGHT:'right',
  windowWidth:1280,windowHeight:720,
  recruit,letterPoints
};
for(const k in P5)window[k]=P5[k];
for(const[k,f]of Object.entries({width:()=>RUN?RUN.w:1280,height:()=>RUN?RUN.h:720,frameCount:()=>RUN?RUN.frame:0,world:()=>RUN?RUN.world:null,
  mouseX:()=>RUN?RUN.mouse.x:0,mouseY:()=>RUN?RUN.mouse.y:0,mouseIsPressed:()=>RUN?RUN.mouse.down:false,keyIsPressed:()=>RUN?RUN.keyDown:false,key:()=>RUN?RUN.key:''}))
  Object.defineProperty(window,k,{get:f,configurable:true});

/* letter targets */
const LP={};
function letterPoints(word,n){word=String(word||'BRUMM').toUpperCase();n=n||48;const key=word+'|'+n;if(LP[key])return LP[key].map(p=>({x:p.x,y:p.y}));
  const W=1280,H=720,c=document.createElement('canvas');c.width=W;c.height=H;const g=c.getContext('2d');let size=230;g.font=`bold ${size}px ${FONT}`;let w=g.measureText(word).width;if(w>980){size*=980/w;g.font=`bold ${size}px ${FONT}`;}
  g.textAlign='center';g.textBaseline='middle';g.fillStyle='#000';g.fillText(word,W/2,300);const data=g.getImageData(0,0,W,H).data;let step=40,pts=[];
  while(step>3){pts=[];for(let y=Math.floor(step/2);y<H;y+=step)for(let x=Math.floor(step/2);x<W;x+=step)if(data[(y*W+x)*4+3]>128)pts.push({x,y});if(pts.length>=n)break;step-=1;}
  const out=[];for(let i=0;i<n;i++)out.push(pts[Math.floor(i*pts.length/n)]);LP[key]=out;return out.map(p=>({x:p.x,y:p.y}));}

/* =========================================================
   HARNESS: compile a sketch, run it, read its state
   ========================================================= */
const LOOP_GUARD='if(++__LC>3e6)throw new Error("Loop ceiling: a loop ran more than 3,000,000 times. Check its exit condition.");';
function instrument(code){
  let c=code.replace(/(class\s+Soldier\b[^{]*\{[\s\S]*?constructor\s*\(([^)]*)\)\s*\{)/,'$1__REG.push(this);');
  c=c.replace(/(\n[ \t]*display\s*\(\s*\)\s*\{)/,'$1__SHOWN.add(this);');
  c=c.replace(/(\n[ \t]*update\s*\(([^)]*)\)\s*\{)/,'$1if(typeof world!=="undefined"&&world)world.__self=this;');
  c=c.replace(/\b(for|while)(\s*\((?:[^()]|\([^()]*\))*\)\s*)\{/g,'$1$2{'+LOOP_GUARD);
  return c;
}
function topNames(code){const out=new Set();for(const m of code.matchAll(/^(?:let|const|var)\s+([^=;\n]+)/gm)){for(const part of m[1].split(',')){const nm=part.trim().split(/\s|=/)[0];if(/^[A-Za-z_$][\w$]*$/.test(nm))out.add(nm);}}return[...out];}
const SHADOW=['claude','window','document','globalThis','self','top','parent','frames','localStorage','sessionStorage','indexedDB','fetch','XMLHttpRequest','WebSocket','Worker','open','location','navigator'];
function compile(code,{shadow=false}={}){
  const names=topNames(code);
  const tail='\n;return {setup:typeof setup==="function"?setup:null,draw:typeof draw==="function"?draw:null,mousePressed:typeof mousePressed==="function"?mousePressed:null,keyPressed:typeof keyPressed==="function"?keyPressed:null,Soldier:typeof Soldier==="function"?Soldier:null,vars:{'+names.map(n=>`get ${n}(){try{return ${n}}catch(e){return undefined}}`).join(',')+'}};';
  const params=['__REG','__SHOWN','console'].concat(shadow?SHADOW:[]);
  return{fn:new Function(...params,'let __LC=0;\n'+instrument(code)+tail),names,offset:3};
}
function faultLine(e){const m=String(e&&e.stack||'').match(/<anonymous>:(\d+):(\d+)/);return m?Math.max(1,+m[1]-3):null;}
function fmtErr(e,where){const ln=faultLine(e);return{msg:String(e&&e.message||e),line:ln,where};}
function field(){if(SILENT)return;X.fillStyle=P.paper;X.fillRect(0,0,1280,720);for(let y=30;y<720;y+=9)ink([[0,y],[1280,y]],.55,1200+y,.35);}
const FIELD={cx:640,cy:360,rx:540,ry:280,per:6,cap:2.4,limit:20,reachR:34,linkR:40,keepR:110};
const TEAMCOLORS=['#c28b25','#c25d76','#4f7fbf','#5c9a5a','#8a5fb0','#c0612f','#3f8f8f','#a0453f','#6c7a2b','#b07a9a','#2f6f9f','#9b7b2f','#6a4a8a','#3d8a6b','#b55a2c','#5a6fa8','#8f3f6f','#7a8f3a','#a86a3a','#4a7a8f','#9a5a5a','#5a8a3a','#6f5aa0','#a07040','#3f6a5a'];
const CARDS={none:{name:'No card',text:'The field as dealt.'},butterflies:{name:'Butterflies',text:'Three butterflies drift across. Any recruit within 50 px is pulled toward one. world.butterflies lists them.'},
  enemy:{name:'Enemy undefined',text:'Every other recruit\'s team reads as undefined. Tell them apart by what they do.'},solipsism:{name:'Solipsism',text:'world.agents lists only recruits within 80 px of the one asking.'},
  cosmos:{name:'Civilian cosmos',text:'The scoring is announced: each recruit that links with another team scores 3, and the whole field earns a bonus if most recruits reach their targets.'}};
const BOTS={
  'Straight Line':`class Soldier {
  constructor(x, y) { this.x = x; this.y = y; this.connected = false; }
  update(world) {
    let dx = this.target.x - this.x, dy = this.target.y - this.y, d = sqrt(dx * dx + dy * dy);
    if (d > 1) { this.x += dx / d * 2.4; this.y += dy / d * 2.4; }
  }
  display() { recruit(this.x, this.y); }
}`,
  'Keep Right':`class Soldier {
  constructor(x, y) { this.x = x; this.y = y; this.connected = false; }
  update(world) {
    let dx = this.target.x - this.x, dy = this.target.y - this.y, d = sqrt(dx * dx + dy * dy);
    if (d < 1) return;
    let side = d > 120 ? 0.55 : 0;
    let mx = dx / d - dy / d * side, my = dy / d + dx / d * side, m = sqrt(mx * mx + my * my);
    this.x += mx / m * 2.4; this.y += my / m * 2.4;
  }
  display() { recruit(this.x, this.y); }
}`,
  'Waver':`class Soldier {
  constructor(x, y) { this.x = x; this.y = y; this.connected = false; this.k = random(100); }
  update(world) {
    let a = atan2(this.target.y - this.y, this.target.x - this.x) + (noise(this.k + frameCount * 0.01) - 0.5) * 2;
    this.x += cos(a) * 2.2; this.y += sin(a) * 2.2;
  }
  display() { recruit(this.x, this.y); }
}`,
  'Greeter':`class Soldier {
  constructor(x, y) { this.x = x; this.y = y; this.connected = false; }
  update(world) {
    for (let o of world.agents) if (o.team !== this.team && dist(this.x, this.y, o.x, o.y) < 40) this.connected = true;
    let dx = this.target.x - this.x, dy = this.target.y - this.y, d = sqrt(dx * dx + dy * dy);
    if (d > 1) { this.x += dx / d * 2.0; this.y += dy / d * 2.0; }
  }
  display() { recruit(this.x, this.y); }
}`
};
function parseTeam(code,fallback){const m=String(code).match(/^\s*\/\/\s*TEAM:\s*(.+)$/m);return(m?m[1].trim():fallback||'Unnamed').slice(0,32);}
function splitEntries(text){const parts=[];const lines=String(text).split('\n');let cur=null;for(const ln of lines){if(/^\s*\/\/\s*TEAM:/.test(ln)){if(cur)parts.push(cur.join('\n'));cur=[ln];}else if(cur)cur.push(ln);}if(cur)parts.push(cur.join('\n'));
  if(!parts.length&&/class\s+Soldier/.test(text))parts.push(text);return parts.map(c=>({team:parseTeam(c),code:c.trim()}));}

const STUB={style:'engraved',w:1280,h:720,frame:0,mouse:{x:0,y:0,down:false},world:null,station:null,keyDown:false,key:''};
class Match{
  constructor({entries,canvas,seed=1,card='none',limit=FIELD.limit,per=FIELD.per}){
    this.canvas=canvas;this.ctx=canvas?canvas.getContext('2d'):null;if(canvas&&(canvas.width!==1280||canvas.height!==720)){canvas.width=1280;canvas.height=720;}
    this.card=card;this.limit=limit;this.per=per;this.frame=0;this.done=false;this.seed=seed;
    this.butterflies=card==='butterflies'?[0,1,2].map(i=>({x:400+i*240,y:200+i*130,ph:i*2.1})):[];
    const n=entries.length;this.teams=[];const prevRun=RUN;RUN=STUB;
    entries.forEach((e,k)=>{const a=Math.PI+k*2*Math.PI/Math.max(1,n),home={x:FIELD.cx+Math.cos(a)*FIELD.rx,y:FIELD.cy+Math.sin(a)*FIELD.ry},tgt={x:FIELD.cx-Math.cos(a)*FIELD.rx,y:FIELD.cy-Math.sin(a)*FIELD.ry};
      const team={name:e.team,code:e.code,color:TEAMCOLORS[k%TEAMCOLORS.length],home,target:tgt,recruits:[],fault:null,reached:0,points:0,linked:new Set(),moved:0,displayDrew:false,you:!!e.you,src:e.src||''};this.teams.push(team);
      R=rng(seed*97+k*13+1);
      let Cls=null;try{const c=compile(e.code,{shadow:true});const api=c.fn([],new Set(),{log(){},warn(){},error(){},info(){}});Cls=api.Soldier;if(!Cls)team.fault={msg:'No class named Soldier',where:'compile'};}catch(err){team.fault={msg:String(err.message||err),line:faultLine(err),where:'compile'};}
      if(Cls)for(let i=0;i<per;i++){const ang=i/per*Math.PI*2,x=home.x+Math.cos(ang)*26+(hash(k,i)-.5)*6,y=home.y+Math.sin(ang)*20;
        try{const s=new Cls(x,y);if(typeof s.x!=='number'||typeof s.y!=='number'){s.x=x;s.y=y;team.badXY=true;}s.team=team.name;s.target={x:tgt.x+(i%3-1)*22,y:tgt.y+(Math.floor(i/3)-0.5)*22};s.id=k*100+i;if(s.connected===undefined)s.connected=false;s.__t=team;s.__done=false;s.__start=[s.x,s.y];team.recruits.push(s);}
        catch(err){team.fault=fmtErr(err,'constructor');break;}}
      if(!Cls||team.fault)team.recruits=[];
    });
    RUN=prevRun;
  }
  get t(){return this.frame/60;}
  all(){const out=[];for(const t of this.teams)for(const s of t.recruits)if(!s.__done)out.push(s);return out;}
  step(silent){
    if(this.done)return;this.frame++;const prevSilent=SILENT;SILENT=!!silent||!this.ctx;
    const prevRun=RUN;STUB.frame=this.frame;RUN=STUB;if(this.ctx)X=this.ctx;BOIL=Math.floor(this.frame/5);DRAWN=0;
    const live=this.all();const snaps=live.map(s=>({x:s.x,y:s.y,team:this.card==='enemy'?undefined:s.team,connected:!!s.connected,id:s.id,__s:s}));
    for(const b of this.butterflies){b.x=640+Math.cos(this.t*.35+b.ph)*420;b.y=360+Math.sin(this.t*.53+b.ph*1.7)*220;}
    let cur=null;const match=this;
    const world={get t(){return match.t;},card:this.card,field:{x:FIELD.cx,y:FIELD.cy},keep:{x:FIELD.cx,y:FIELD.cy,r:FIELD.keepR},butterflies:this.butterflies.map(b=>({x:b.x,y:b.y})),
      get agents(){if(match.card==='solipsism'&&cur)return snaps.filter(o=>o.__s!==cur&&Math.hypot(o.x-cur.x,o.y-cur.y)<80).map(strip);return snaps.filter(o=>o.__s!==cur).map(strip);}};
    function strip(o){return{x:o.x,y:o.y,team:o.team,connected:o.connected,id:o.id};}
    const order=this.teams.map((t,i)=>i);const rot=this.frame%Math.max(1,order.length);
    for(let q=0;q<order.length;q++){const team=this.teams[order[(q+rot)%order.length]];if(team.fault)continue;
      for(const s of team.recruits){if(s.__done)continue;const px=s.x,py=s.y;cur=s;R=rng(this.seed*1009+this.frame*31+s.id);
        try{s.update(world);}catch(err){team.fault=fmtErr(err,'update()');break;}
        let dx=s.x-px,dy=s.y-py;if(!isFinite(dx)||!isFinite(dy)){s.x=px;s.y=py;dx=dy=0;}const d=Math.hypot(dx,dy);if(d>FIELD.cap){s.x=px+dx/d*FIELD.cap;s.y=py+dy/d*FIELD.cap;}team.moved+=Math.min(d,FIELD.cap);}}
    this.physics();this.score();
    if(this.ctx&&!SILENT)this.render();
    SILENT=prevSilent;RUN=prevRun;
    if(this.frame>=this.limit*60)this.done=true;
  }
  physics(){const live=this.all(),cell=24,grid=new Map();
    for(const b of this.butterflies)for(const s of live){const d=Math.hypot(b.x-s.x,b.y-s.y);if(d<50&&d>0){s.x+=(b.x-s.x)/d*.8;s.y+=(b.y-s.y)/d*.8;}}
    for(const s of live){const k=Math.floor(s.x/cell)+','+Math.floor(s.y/cell);if(!grid.has(k))grid.set(k,[]);grid.get(k).push(s);}
    for(const s of live){const gx=Math.floor(s.x/cell),gy=Math.floor(s.y/cell);for(let ix=-1;ix<=1;ix++)for(let iy=-1;iy<=1;iy++){const L=grid.get((gx+ix)+','+(gy+iy));if(!L)continue;for(const o of L){if(o.id<=s.id)continue;const dx=o.x-s.x,dy=o.y-s.y,d=Math.hypot(dx,dy);if(d<18&&d>0){const p=(18-d)/2;s.x-=dx/d*p;s.y-=dy/d*p;o.x+=dx/d*p;o.y+=dy/d*p;}}}}
    for(const s of live){const dx=s.x-FIELD.cx,dy=s.y-FIELD.cy,d=Math.hypot(dx,dy)||1;if(d<FIELD.keepR+9){s.x=FIELD.cx+dx/d*(FIELD.keepR+9);s.y=FIELD.cy+dy/d*(FIELD.keepR+9);}s.x=clamp(s.x,30,1250);s.y=clamp(s.y,30,690);}}
  score(){const live=this.all();
    for(const s of live){if(Math.hypot(s.x-s.target.x,s.y-s.target.y)<FIELD.reachR){s.__done=true;s.__at=this.t;s.__t.reached++;s.__t.points+=1+Math.max(0,this.limit-this.t)/5;}}
    const live2=this.all();for(const s of live2){if(!s.connected||s.__t.linked.has(s.id))continue;for(const o of live2){if(o.__t!==s.__t&&Math.hypot(o.x-s.x,o.y-s.y)<FIELD.linkR){s.__t.linked.add(s.id);break;}}}}
  results(){const total=this.teams.reduce((a,t)=>a+t.recruits.length,0)||1,reached=this.teams.reduce((a,t)=>a+t.reached,0),bonus=reached/total>=.8?10:0,lm=3;
    return{bonus,fieldShare:reached/total,rows:this.teams.map(t=>({name:t.name,color:t.color,you:t.you,src:t.src,reached:t.reached,linked:t.linked.size,fault:t.fault,arrive:Math.round(t.points*10)/10,score:Math.round((t.fault&&!t.reached?0:t.points+t.linked.size*lm+bonus)*10)/10}))};}
  render(){X.setTransform(1,0,0,1,0,0);X.lineCap='round';X.lineJoin='round';X.globalAlpha=1;
    field();X.save();X.setLineDash([4,8]);X.beginPath();X.ellipse(FIELD.cx,FIELD.cy,FIELD.rx,FIELD.ry,0,0,6.2832);X.lineWidth=1.2;X.strokeStyle='rgba(28,24,20,.4)';X.stroke();X.restore();
    ball(FIELD.cx,FIELD.cy,FIELD.keepR,1250,PAT.f,3);for(let i=0;i<16;i++){const a=i/16*6.2832;X.fillStyle=P.ink;X.save();X.translate(FIELD.cx+Math.cos(a)*(FIELD.keepR-4),FIELD.cy+Math.sin(a)*(FIELD.keepR-4));X.rotate(a);X.fillRect(-4,-6,8,12);X.restore();}txt('THE KEEP',FIELD.cx,FIELD.cy,18,{mono:1});
    for(const t of this.teams){X.beginPath();X.arc(t.home.x,t.home.y,6,0,6.2832);X.fillStyle=t.color;X.fill();X.save();X.setLineDash([3,4]);circ(t.target.x,t.target.y,FIELD.reachR,1300+t.recruits.length,.3);X.lineWidth=1.4;X.strokeStyle=t.color;X.stroke();X.restore();
      const lx=t.home.x+(t.home.x<FIELD.cx?14:-14);txt(t.name.slice(0,16),lx,t.home.y-30,13,{mono:1,align:t.home.x<FIELD.cx?'left':'right',col:t.fault?P.red:P.ink});
      for(const s of t.recruits)if(s.__done)flower(s.target.x+(s.id%3-1)*9,s.target.y+10,clamp((this.t-s.__at)/.5),1400+s.id,t.color,1.2);}
    for(const t of this.teams){if(t.fault)continue;TINT=t.color;for(const s of t.recruits){if(s.__done)continue;const before=DRAWN;X.save();try{s.display();}catch(err){t.fault=fmtErr(err,'display()');}X.restore();if(DRAWN>before)t.displayDrew=true;else{recruit(s.x,s.y);}
      X.beginPath();X.arc(s.x,s.y+30,3,0,6.2832);X.fillStyle=t.color;X.fill();}}
    TINT=null;
    for(const t of this.teams)if(t.fault)for(const s of t.recruits){if(!s.__done){X.globalAlpha=.35;recruit(s.x,s.y);X.globalAlpha=1;}}
    for(const b of this.butterflies){const f=Math.sin(this.t*18)*6;ink([[b.x-10,b.y-4+f],[b.x,b.y]],2,960,.2);ink([[b.x,b.y],[b.x+10,b.y-4+f]],2,961,.2);X.beginPath();X.arc(b.x,b.y,2.5,0,6.2832);X.fillStyle=P.blue;X.fill();}
    const live=this.all();for(const s of live){if(!s.connected)continue;for(const o of live)if(o.__t!==s.__t&&o.id>s.id&&o.connected&&Math.hypot(o.x-s.x,o.y-s.y)<FIELD.linkR)ink([[s.x,s.y-6],[o.x,o.y-6]],1.2,970,.2,P.red);}
    txt(`${String(Math.floor(this.t)).padStart(2,'0')} s / ${this.limit} s`,1240,46,14,{mono:1,align:'right'});if(this.card!=='none')txt(`CARD: ${CARDS[this.card].name.toUpperCase()}`,40,46,14,{mono:1,align:'left'});
    border();}
}
const TEMPLATE=`// TEAM: Your team name
// THE CONSTRUCTORS · ARENA ENTRY
//
// The arena makes 6 of your Soldiers and sets, for each one:
//   this.team    your team name
//   this.target  {x, y}: where this recruit must go
//   this.id      a number no other recruit has
// Every frame it calls update(world), then display().
// You may change this.x, this.y and this.connected.
// A recruit moves at most 2.4 px a frame.
// world.agents lists every other recruit as {x, y, team, connected, id}.
// world.keep is the round keep in the middle: {x, y, r}. Nobody passes through it.
// The match lasts 20 seconds. You cannot move other recruits.
// The score is revealed after the match.

class Soldier {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.connected = false;
  }

  update(world) {
    // 1. Which way is my target?
    let dx = this.target.x - this.x;
    let dy = this.target.y - this.y;
    let d = sqrt(dx * dx + dy * dy);

    // 2. Take one step toward it.
    if (d > 1) {
      this.x += dx / d * 2.4;
      this.y += dy / d * 2.4;
    }
  }

  display() {
    recruit(this.x, this.y);
  }
}`;
function trainEntries(code){return[{team:parseTeam(code,'You'),code,you:true},...['Straight Line','Keep Right','Waver','Greeter','Straight Line'].map((n,i)=>({team:i===4?'Straight Line II':n,code:BOTS[n],src:'house'}))];}
function gradeTrain(m){const t=m.teams[0],per=FIELD.per;let Cls=null;try{Cls=compile(t.code,{shadow:true}).fn([],new Set(),{log(){}}).Soldier;}catch(e){}
  const proto=Cls&&Cls.prototype;const moved=t.recruits.length?t.moved/t.recruits.length:0;
  return[[!!Cls,'The code compiles and defines class Soldier'],[!!(t.recruits.length&&!t.badXY),'new Soldier(x, y) stores numbers in this.x and this.y'],
    [!!(proto&&typeof proto.update==='function'&&typeof proto.display==='function'),'It has update(world) and display()'],[!t.fault,'It runs the whole match without an error'+(t.fault?`: ${t.fault.msg}`:'')],
    [moved>60,`Your recruits move (average ${Math.round(moved)} px)`],[t.reached>=3,`At least 3 of your ${per} reach their target (${t.reached})`],[t.displayDrew||!m.ctx,'display() draws something']];}
window.ARENA={Match,BOTS,CARDS,FIELD,TEMPLATE,trainEntries,gradeTrain,parseTeam,splitEntries,TEAMCOLORS};
