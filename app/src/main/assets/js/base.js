// Turbo Monedas · base compartida: pantalla, configuración, voz, sonido, entrada y dibujos comunes
'use strict';
const cv=document.getElementById('c'), cx=cv.getContext('2d');
const overlay=document.getElementById('overlay'), card=document.getElementById('card'), pauseBtn=document.getElementById('pause');
const T=32, ROWS=13, G=11;
let W,H,dpr,scale;
function resize(){dpr=Math.min(window.devicePixelRatio||1,2);W=innerWidth;H=innerHeight;cv.width=W*dpr;cv.height=H*dpr;scale=H/(ROWS*T);}
addEventListener('resize',resize);resize();

// ---------- Estado ----------
// ---------- Configuración ----------
let cfg={swap:false,voice:true,mode:'touch',car:'sedan'};
try{const c=JSON.parse(localStorage.getItem('tm_cfg')||'null');if(c)cfg=Object.assign(cfg,c);}catch(_){}
function saveCfg(){try{localStorage.setItem('tm_cfg',JSON.stringify(cfg))}catch(_){}applyCfg();}
function applyCfg(){document.body.classList.toggle('swap',cfg.swap);document.body.classList.toggle('nobtn',cfg.mode!=='buttons');}
applyCfg();
let bubble=0, view='';
// Voz: primero la grabación del jugador; si no hay, la voz del celular
let voiceData=null, voiceBuf=null, esVoice=null, ttsPrimed=false;
try{voiceData=localStorage.getItem('tm_voice');}catch(_){}
function pickVoice(){try{const v=speechSynthesis.getVoices();esVoice=v.find(x=>/es[-_](MX|US|419)/i.test(x.lang))||v.find(x=>/^es/i.test(x.lang))||null;}catch(_){}}
if(window.speechSynthesis){pickVoice();try{speechSynthesis.onvoiceschanged=pickVoice;}catch(_){}}
async function decodeVoice(){
  voiceBuf=null; if(!ac||!voiceData)return false;
  try{const bin=atob(voiceData.split(',')[1]);const arr=new Uint8Array(bin.length);
    for(let i=0;i<bin.length;i++)arr[i]=bin.charCodeAt(i);
    voiceBuf=await ac.decodeAudioData(arr.buffer);return true;}catch(_){voiceBuf=null;return false;}
}
function primeTTS(){ // Android necesita "despertar" la voz con un toque del usuario
  if(ttsPrimed||!window.speechSynthesis)return; ttsPrimed=true;
  try{const u=new SpeechSynthesisUtterance(' ');u.volume=0;speechSynthesis.speak(u);}catch(_){}
}
function say(force){
  if(!cfg.voice&&!force)return;
  if(voiceBuf&&ac){try{const src=ac.createBufferSource(),g=ac.createGain();g.gain.value=1.2;src.buffer=voiceBuf;src.connect(g).connect(ac.destination);src.start();return;}catch(_){}}
  if(window.AndroidVoz){try{if(window.AndroidVoz.hablar('¡Ora, zombi!'))return;}catch(_){}}   // voz nativa en la app Android
  if(!window.speechSynthesis)return;
  try{speechSynthesis.cancel();speechSynthesis.resume();
    const u=new SpeechSynthesisUtterance('¡Ora, zombi!');u.lang=esVoice?esVoice.lang:'es-MX';if(esVoice)u.voice=esVoice;
    u.rate=1.1;u.pitch=1.25;u.volume=1;speechSynthesis.speak(u);}catch(_){}
}

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
  win:()=>[523,659,784,1047].forEach((f,i)=>setTimeout(()=>beep(f,0,.22,'square',.06),i*130))
};

// ---------- Entrada ----------
const input={l:false,r:false,j:false,jp:false};
function setKey(k,v){if(k==='j'&&v&&!input.j)input.jp=true;input[k]=v;}
const keyMap={ArrowLeft:'l',KeyA:'l',ArrowRight:'r',KeyD:'r',Space:'j',ArrowUp:'j',KeyW:'j',KeyZ:'j'};
addEventListener('keydown',e=>{const k=keyMap[e.code];if(k){e.preventDefault();if(!e.repeat)setKey(k,true)} if(e.code==='Escape'&&state==='play')pauseGame();});
addEventListener('keyup',e=>{const k=keyMap[e.code];if(k)setKey(k,false)});
function bind(id,k){const el=document.getElementById(id);
  el.addEventListener('pointerdown',e=>{e.preventDefault();try{el.setPointerCapture(e.pointerId)}catch(_){}el.classList.add('on');setKey(k,true)});
  ['pointerup','pointercancel','lostpointercapture'].forEach(ev=>el.addEventListener(ev,()=>{el.classList.remove('on');setKey(k,false)}));
}
bind('bL','l');bind('bR','r');bind('bJ','j');
document.addEventListener('contextmenu',e=>e.preventDefault());

// Control táctil
//  Nivel 1: un lado se desliza para moverse, el otro se toca para saltar ("auto-correr": tocar en cualquier parte salta).
//  Nivel 2: mantener el lado izquierdo gira a la izquierda, el derecho a la derecha; deslizar hacia arriba da un brinco.
const touches=new Map();
function updTouchInput(){
  let l=false,r=false,j=false;
  for(const t of touches.values()){
    if(t.role==='move'){if(t.dx>14)r=true;else if(t.dx<-14)l=true;if(t.swipe)j=true;}
    else if(t.role==='kl'){l=true;if(t.swipe)j=true;}
    else if(t.role==='kr'){r=true;if(t.swipe)j=true;}
    else j=true;
  }
  input.l=l;input.r=r;if(j&&!input.j)input.jp=true;input.j=j;
}
cv.addEventListener('pointerdown',e=>{
  if(state!=='play'||cfg.mode==='buttons')return;
  e.preventDefault();try{cv.setPointerCapture(e.pointerId)}catch(_){}
  let role='jump';
  if(level===2)role=e.clientX<W*0.5?'kl':'kr';
  else if(cfg.mode==='touch'){const left=e.clientX<W*0.5;role=(left!==cfg.swap)?'move':'jump';}
  touches.set(e.pointerId,{role,x0:e.clientX,y0:e.clientY,dx:0,swipe:false});
  updTouchInput();
});
cv.addEventListener('pointermove',e=>{
  const t=touches.get(e.pointerId);if(!t)return;
  t.dx=e.clientX-t.x0;
  if(t.dx>70){t.x0=e.clientX-70;t.dx=70;} if(t.dx<-70){t.x0=e.clientX+70;t.dx=-70;}
  if(t.role!=='jump'&&t.y0-e.clientY>45)t.swipe=true;   // deslizar hacia arriba también salta
  updTouchInput();
});
['pointerup','pointercancel','lostpointercapture'].forEach(ev=>cv.addEventListener(ev,e=>{
  if(touches.delete(e.pointerId))updTouchInput();
}));
function clearTouches(){touches.clear();for(const k in input)input[k]=false;}

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
