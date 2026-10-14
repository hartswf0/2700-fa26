/* Engraving toolkit (from The Constructors and Two Sallies) */
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
function figure(o){
  X.save();X.translate(o.x,o.y);X.rotate(o.ang||0);const s=o.s||1;X.scale(s*(o.f||1),s*(o.sy||1));X.globalAlpha=o.alpha??1;
  const id=o.id,ph=o.ph||0,wk=o.walk||0,f1=[-9+Math.sin(ph)*16*wk,-Math.max(0,Math.cos(ph))*8*wk],f2=[9-Math.sin(ph)*16*wk,-Math.max(0,-Math.cos(ph))*8*wk];
  for(const[f,k]of[[f1,0],[f2,1]]){ink([[k?6:-6,-95],[(f[0]+(k?6:-6))/2+5,-48+f[1]/2],f],2,id+k,.3);X.beginPath();X.ellipse(f[0]+6,f[1]-3,10,4,0,Math.PI,0);X.fillStyle=P.ink;X.fill();}
  const hb=o.hb||[-30,-110];ink([[-17,-158],[(hb[0]-17)/2-6,(hb[1]-158)/2+6],hb],1.8,id+5,.3);ball(hb[0],hb[1],5,id+6,PAT.f,1.2);
  X.beginPath();X.moveTo(-16,-160);X.lineTo(16,-160);X.lineTo(42,-38);X.lineTo(-42,-38);X.closePath();X.fillStyle=P.paper;X.fill();X.fillStyle=o.dark?PAT.d:PAT.f;X.save();X.clip();if(o.dark)X.fillRect(-50,-170,100,140);else X.fillRect(-50,-80,100,50);X.restore();X.lineWidth=2;X.strokeStyle=P.ink;X.stroke();
  ink([[-14,-128],[14,-128]],1.2,id+7,.2);
  ball(0,-176,6,id+8,PAT.f);
  const hx=0,hy=-200;
  if(o.hood){X.beginPath();X.arc(hx,hy,28,Math.PI*.95,Math.PI*2.15);X.lineTo(hx+16,hy+24);X.lineTo(hx-24,hy+24);X.closePath();X.fillStyle=PAT.d;X.fill();X.lineWidth=1.6;X.stroke();}
  ball(hx,hy,21,id+9,PAT.f,2);
  if(o.short){for(let i=0;i<11;i++){const a=Math.PI*.55+i*.14;ink([[hx+Math.cos(a)*16,hy+Math.sin(a)*16-6],[hx+Math.cos(a)*26-4,hy+Math.sin(a)*24+2]],1.1,id+20+i,.4,'#4a443b');}}
  if(o.closed){ink([[hx+5,hy-3],[hx+13,hy-2]],1.6,id+10,.2);}else{X.beginPath();X.arc(hx+9,hy-3,2.4,0,6.2832);X.fillStyle=P.ink;X.fill();}
  ink([[hx+10,hy+9],[hx+15,hy+8]],1.2,id+11,.1);
  const hf=o.hf||[30,-112];ink([[17,-158],[(hf[0]+17)/2+6,(hf[1]-158)/2+6],hf],1.8,id+12,.3);ball(hf[0],hf[1],5,id+13,PAT.f,1.2);
  X.restore();
}
const toWorld=(o,p)=>{const s=o.s||1,[rx,ry]=rot(p[0]*s*(o.f||1),p[1]*s*(o.sy||1),o.ang||0);return[o.x+rx,o.y+ry];};
