// Merudichis Capuchinis · base compartida: pantalla, configuración, voz, sonido, entrada y dibujos comunes
'use strict';
const cv=document.getElementById('c');
let cx=cv.getContext('2d');   // el nivel pixel art lo cambia un momento para dibujar en baja resolución
const overlay=document.getElementById('overlay'), card=document.getElementById('card'), pauseBtn=document.getElementById('pause');
const T=32, VROWS=13;           // VROWS: filas visibles en pantalla (la escala se calcula con ellas)
let ROWS=13, G=11;                // filas del mundo y fila del suelo; la torre vertical usa un mundo más alto
function tamMundo(filas){ROWS=filas;G=filas-2;}
let W,H,dpr,scale;
function resize(){dpr=Math.min(window.devicePixelRatio||1,2);W=innerWidth;H=innerHeight;cv.width=W*dpr;cv.height=H*dpr;scale=H/(VROWS*T);}
addEventListener('resize',resize);resize();

// ---------- Estado ----------
// ---------- Configuración ----------
let cfg={swap:false,voice:true,mode:'touch',car:'sedan',musica:true,volumen:0.7,volante:'dedo',inclInv:false,personaje:'chibi'};
try{const c=JSON.parse(localStorage.getItem('tm_cfg')||'null');if(c)cfg=Object.assign(cfg,c);}catch(_){}
function saveCfg(){try{localStorage.setItem('tm_cfg',JSON.stringify(cfg))}catch(_){}applyCfg();}
function applyCfg(){document.body.classList.toggle('swap',cfg.swap);document.body.classList.toggle('nobtn',cfg.mode!=='buttons');}
applyCfg();
let bubble=0, view='';
// Frases habladas: ver voces.js
function say(forzar){Voces.decir('zombie',forzar);}

let COLS=0, grid=[], enemies=[], parts=[], P=null, cam=0, state='menu', coins=0, lives=3, frames=0,
    checkpoint=3, totalCoins=0, flagCol=0, springT=0, faceCanvas=null;

let level=1;

// ---------- Sonido ----------
let ac=null;
function beep(f1,f2,dur,type='square',vol=.07){
  if(!ac)return; const t=ac.currentTime,o=ac.createOscillator(),g=ac.createGain();
  o.type=type;o.frequency.setValueAtTime(f1,t);if(f2)o.frequency.exponentialRampToValueAtTime(f2,t+dur);
  g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(0.0001,t+dur);o.connect(g).connect(ac.destination);o.start(t);o.stop(t+dur+.02);
}
const sfx={
  coin:()=>{beep(988,0,.06,'square',.05);setTimeout(()=>beep(1319,0,.12,'square',.05),55)},
  jump:()=>beep(300,750,.15,'square',.045), stomp:()=>beep(420,110,.16,'triangle',.12),
  hurt:()=>beep(520,90,.4,'sawtooth',.06), spring:()=>beep(200,1300,.3,'triangle',.1),
  boost:()=>beep(250,1600,.3,'sawtooth',.035), check:()=>beep(660,990,.2,'triangle',.1),
  win:()=>[523,659,784,1047].forEach((f,i)=>setTimeout(()=>beep(f,0,.22,'square',.06),i*130)),
  romper:()=>{for(let i=0;i<4;i++)setTimeout(()=>beep(180+Math.random()*120,60,.08,'square',.06),i*25)},
  tock:()=>beep(140,90,.08,'square',.06),
  item:()=>[392,523,659,784].forEach((f,i)=>setTimeout(()=>beep(f,0,.1,'triangle',.08),i*70)),
  ladrido:()=>{beep(620,300,.09,'square',.07);setTimeout(()=>beep(560,280,.1,'square',.07),130)},
  aturdido:()=>[880,660,880,660].forEach((f,i)=>setTimeout(()=>beep(f,0,.08,'triangle',.06),i*90)),
  silbido:()=>{beep(1300,1900,.18,'sine',.08);setTimeout(()=>beep(1900,1400,.22,'sine',.08),190)}
};

// ---------- Entrada ----------
const input={l:false,r:false,j:false,jp:false,d:false,swipe:null,a1:false,a2:false,pu:false,pd:false,pl:false,pr:false,volante:null,inclinacion:0};
function setKey(k,v){if(k==='j'&&v&&!input.j)input.jp=true;input[k]=v;}
const keyMap={ArrowLeft:'l',KeyA:'l',ArrowRight:'r',KeyD:'r',Space:'j',ArrowUp:'j',KeyW:'j',KeyZ:'j',ArrowDown:'d',KeyS:'d',KeyX:'a1',KeyC:'a2'};
addEventListener('keydown',e=>{const k=keyMap[e.code];if(k){e.preventDefault();if(!e.repeat)setKey(k,true)} if(e.code==='Escape'&&state==='play')pauseGame();});
addEventListener('keyup',e=>{const k=keyMap[e.code];if(k)setKey(k,false)});
function bind(id,k){const el=document.getElementById(id);
  el.addEventListener('pointerdown',e=>{e.preventDefault();try{el.setPointerCapture(e.pointerId)}catch(_){}el.classList.add('on');setKey(k,true)});
  ['pointerup','pointercancel','lostpointercapture'].forEach(ev=>el.addEventListener(ev,()=>{el.classList.remove('on');setKey(k,false)}));
}
bind('bL','l');bind('bR','r');bind('bJ','j');bind('bOlfa','a1');bind('bLadra','a2');
(()=>{
  const pad=document.getElementById('dpad');
  const marca=()=>{for(const [id,k] of [['pU','pu'],['pD','pd'],['pL','pl'],['pR','pr']])document.getElementById(id).classList.toggle('on',input[k]);};
  const leer=e=>{
    const r=pad.getBoundingClientRect(),dx=e.clientX-(r.left+r.width/2),dy=e.clientY-(r.top+r.height/2);
    input.pu=input.pd=input.pl=input.pr=false;
    if(Math.hypot(dx,dy)>=14){if(Math.abs(dx)>Math.abs(dy))input[dx>0?'pr':'pl']=true;else input[dy>0?'pd':'pu']=true;}
    marca();
  };
  pad.addEventListener('pointerdown',e=>{e.preventDefault();try{pad.setPointerCapture(e.pointerId)}catch(_){}leer(e);});
  pad.addEventListener('pointermove',e=>{if(e.buttons||e.pointerType==='touch')leer(e);});
  ['pointerup','pointercancel','lostpointercapture'].forEach(ev=>pad.addEventListener(ev,()=>{input.pu=input.pd=input.pl=input.pr=false;marca();}));
})();
document.addEventListener('contextmenu',e=>e.preventDefault());

// Control táctil
//  Plataformas (niveles 1, 4 y 5): un lado se desliza para moverse y el otro se toca para saltar.
//  Nivel 2: arrastrar el dedo es el volante (más lejos = gira más); deslizar hacia arriba da un brinco.
//  Nivel 3: deslizar gira la viborita (además de la cruz direccional).
//  Minijuegos: reciben los toques directamente en su función "toque".
const touches=new Map();
const nivelActual=()=>typeof NIVELES!=='undefined'?NIVELES[level]:null;
function updTouchInput(){
  let l=false,r=false,j=false,volante=null;
  for(const t of touches.values()){
    if(t.role==='move'){if(t.dx>14)r=true;else if(t.dx<-14)l=true;if(t.swipe)j=true;}
    else if(t.role==='volante'){volante=Math.max(-1,Math.min(1,(t.cx-t.sx)/70));if(t.swipe)j=true;}
    else if(t.role==='swipe'){}
    else j=true;
  }
  input.l=l;input.r=r;input.volante=volante;if(j&&!input.j)input.jp=true;input.j=j;
}
cv.addEventListener('pointerdown',e=>{
  if(state!=='play')return;
  const nv=nivelActual();
  if(nv&&nv.toque){e.preventDefault();try{cv.setPointerCapture(e.pointerId)}catch(_){}nv.toque('down',e.clientX,e.clientY,e.pointerId);return;}
  if(cfg.mode==='buttons'&&level!==3)return;
  e.preventDefault();try{cv.setPointerCapture(e.pointerId)}catch(_){}
  let role='jump';
  if(level===2)role='volante';
  else if(level===3)role='swipe';
  else if(cfg.mode==='touch'||!(level===1||esPixel(level))){const left=e.clientX<W*0.5;role=(left!==cfg.swap)?'move':'jump';}
  touches.set(e.pointerId,{role,x0:e.clientX,y0:e.clientY,sx:e.clientX,cx:e.clientX,dx:0,swipe:false,usado:false});
  updTouchInput();
});
cv.addEventListener('pointermove',e=>{
  const nv=nivelActual();
  if(state==='play'&&nv&&nv.toque){nv.toque('move',e.clientX,e.clientY,e.pointerId);return;}
  const t=touches.get(e.pointerId);if(!t)return;
  t.cx=e.clientX;
  t.dx=e.clientX-t.x0;
  if(t.dx>70){t.x0=e.clientX-70;t.dx=70;} if(t.dx<-70){t.x0=e.clientX+70;t.dx=-70;}
  if(t.role==='swipe'){                                  // nivel 3: un deslizamiento = un giro
    const dx=e.clientX-t.sx,dy=e.clientY-t.y0;
    if(!t.usado&&Math.hypot(dx,dy)>28){t.usado=true;input.swipe=Math.abs(dx)>Math.abs(dy)?(dx>0?'r':'l'):(dy>0?'d':'u');}
    return;
  }
  if(t.role==='volante'){if(t.y0-e.clientY>45&&Math.abs(e.clientX-t.sx)<45)t.swipe=true;}
  else if(t.role!=='jump'&&t.y0-e.clientY>45)t.swipe=true;   // deslizar hacia arriba también salta
  updTouchInput();
});
['pointerup','pointercancel','lostpointercapture'].forEach(ev=>cv.addEventListener(ev,e=>{
  const nv=nivelActual();
  if(nv&&nv.toque&&ev!=='lostpointercapture'){nv.toque('up',e.clientX,e.clientY,e.pointerId);}
  if(touches.delete(e.pointerId))updTouchInput();
}));
// Inclinar el celular como volante (opción del nivel 2)
addEventListener('devicemotion',e=>{
  const g=e.accelerationIncludingGravity;if(!g||g.y==null)return;
  const ang=(screen.orientation&&screen.orientation.angle)||window.orientation||0;
  const v=ang===90?g.y:(ang===270||ang===-90)?-g.y:g.x;
  input.inclinacion=Math.max(-1,Math.min(1,v/5))*(cfg.inclInv?-1:1);
});
function clearTouches(){touches.clear();for(const k in input)input[k]=k==='swipe'||k==='volante'?null:k==='inclinacion'?input.inclinacion:false;}

// ---------- Dibujo ----------
function drawDefaultFace(ctx,x,y,r,face){
  ctx.fillStyle='#ffcc99';ctx.beginPath();ctx.arc(x,y,r,0,7);ctx.fill();
  ctx.fillStyle='#3b2416';ctx.beginPath();ctx.arc(x,y-r*0.25,r,Math.PI*1.05,Math.PI*1.95);ctx.fill();
  ctx.fillStyle='#222';const ex=face*r*0.15;
  ctx.beginPath();ctx.arc(x-r*0.35+ex,y+r*0.05,r*0.12,0,7);ctx.arc(x+r*0.35+ex,y+r*0.05,r*0.12,0,7);ctx.fill();
  ctx.strokeStyle='#222';ctx.lineWidth=Math.max(1,r*0.1);ctx.beginPath();ctx.arc(x+ex,y+r*0.3,r*0.3,0.2,Math.PI-0.2);ctx.stroke();
}
function drawHead(ctx,x,y,r,face){
  if(faceCanvas)ctx.drawImage(faceCanvas,x-r,y-r,r*2,r*2); else drawDefaultFace(ctx,x,y,r,face);
  ctx.strokeStyle='#1e8f3a';ctx.lineWidth=r*0.18;ctx.beginPath();ctx.arc(x,y,r,0,7);ctx.stroke();
}
function rr(x,y,w,h,r){cx.beginPath();cx.moveTo(x+r,y);cx.arcTo(x+w,y,x+w,y+h,r);cx.arcTo(x+w,y+h,x,y+h,r);cx.arcTo(x,y+h,x,y,r);cx.arcTo(x,y,x+w,y,r);cx.closePath();}
// Globo de diálogo "¡Ora, zombie!" (t va de 100 a 0)
function drawSpeech(x,y,t,size=1){
  const msg='¡Ora, zombie!';
  cx.font=`bold ${Math.round(15*size)}px system-ui,Arial`;
  const w=cx.measureText(msg).width+18*size, h=26*size;
  const pop=Math.min(1,(100-t)/6+0.4);
  cx.save();cx.translate(x,y);cx.scale(pop,pop);cx.globalAlpha=Math.min(1,t/15);
  cx.fillStyle='#fff';cx.strokeStyle='#222';cx.lineWidth=2;
  rr(-w/2,-h-8,w,h,10*size);cx.fill();cx.stroke();
  cx.beginPath();cx.moveTo(-6,-9);cx.lineTo(0,0);cx.lineTo(6,-9);cx.closePath();cx.fill();
  cx.beginPath();cx.moveTo(-6,-8);cx.lineTo(0,0);cx.lineTo(6,-8);cx.stroke();
  cx.fillStyle='#d32f2f';cx.textAlign='center';cx.textBaseline='middle';cx.fillText(msg,0,-h/2-8);
  cx.restore();cx.textAlign='left';
}
function txt(s,x,y){cx.fillStyle='rgba(0,0,0,.55)';cx.fillText(s,x+2,y+2);cx.fillStyle='#fff';cx.fillText(s,x,y);}
