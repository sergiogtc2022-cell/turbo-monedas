// Merudichis Capuchinis · minijuego Corre sin parar: el personaje corre solo y cada vez más rápido.
// Toque = saltar (mantener = más alto); deslizar hacia abajo = agacharse para pasar debajo de los pájaros.
'use strict';
const MiniCorre=(()=>{
  let p=null, cosas=[], vel=5, dist=0, sigT=0, muerto=0, ini=null, dedo=false, msgT=0;
  const SUELO=()=>H-50;
  function init(){frames=0;coins=0;cosas=[];vel=5;dist=0;sigT=60;muerto=0;msgT=180;dedo=false;
    p={x:W*0.18,y:SUELO(),vy:0,suelo:true,agachado:0};}
  function saltar(){if(p.suelo&&!muerto){p.vy=-11.5;p.suelo=false;p.agachado=0;sfx.jump();msgT=0;}}
  function toque(tipo,x,y){
    if(tipo==='down'){ini={x,y};dedo=true;saltar();}
    else if(tipo==='move'&&ini&&y-ini.y>35){p.agachado=30;if(!p.suelo)p.vy=Math.max(p.vy,9);ini=null;}
    else if(tipo==='up'){dedo=false;ini=null;}
  }
  function nueva(){
    const r=Math.random();
    if(dist>600&&r<0.25)cosas.push({t:'pajaro',x:W+30,y:SUELO()-48-(Math.random()<.5?0:22),w:38,h:22});
    else if(r<0.55)cosas.push({t:'maceta',x:W+30,y:SUELO()-34,w:28,h:34});
    else if(r<0.8)cosas.push({t:'picos',x:W+30,y:SUELO()-20,w:44+Math.floor(Math.random()*2)*22,h:20});
    else cosas.push({t:'zombie',x:W+30,y:SUELO()-26,w:28,h:26});
    if(Math.random()<0.5)for(let i=0;i<4;i++)cosas.push({t:'moneda',x:W+120+i*28,y:SUELO()-90,w:16,h:20});
  }
  function step(){
    frames++;
    if(input.jp){input.jp=false;saltar();}
    if(muerto){if(++muerto>70)terminarMinijuego('corre',Math.floor(dist/10),coins+Math.floor(dist/400),[`🏃 ${Math.floor(dist/10)} m`,`🪙 ${coins} monedas`],false);return;}
    vel=5+Math.min(6,dist/900);dist+=vel/3;
    const g=p.vy<0&&(dedo||input.j)?0.45:0.9;
    p.vy=Math.min(p.vy+g,16);p.y+=p.vy;
    if(p.y>=SUELO()){p.y=SUELO();p.vy=0;p.suelo=true;}
    if(p.agachado>0)p.agachado--;
    if(--sigT<=0){nueva();sigT=Math.max(38,Math.round(90-dist/80)+Math.floor(Math.random()*40));}
    const alto=p.agachado>0&&p.suelo?24:46;
    const caja={x:p.x-10,y:p.y-alto,w:20,h:alto-2};
    for(const o of cosas){o.x-=vel*(o.t==='pajaro'?1.15:1);
      if(o.got||!aabb(caja,o))continue;
      if(o.t==='moneda'){o.got=true;coins++;sfx.coin();continue;}
      if(o.t==='zombie'&&p.vy>0&&p.y-o.y<14){o.got=true;p.vy=-9;sfx.stomp();continue;}
      muerto=1;sfx.hurt();if(o.t==='zombie'){bubble=90;say();}else Voces.decir('choque');}
    cosas=cosas.filter(o=>o.x>-80&&!(o.got&&o.t==='moneda'));
    if(bubble>0)bubble--;
  }
  function draw(){
    cx.setTransform(dpr,0,0,dpr,0,0);
    const g=cx.createLinearGradient(0,0,0,H);g.addColorStop(0,'#ffcf8b');g.addColorStop(1,'#ffe9c4');cx.fillStyle=g;cx.fillRect(0,0,W,H);
    if(!p)return;
    cx.fillStyle='#e8b46a';cx.beginPath();cx.moveTo(0,SUELO());
    for(let x=0;x<=W;x+=10)cx.lineTo(x,SUELO()-40-Math.sin((x+dist*0.8)/90)*22);cx.lineTo(W,SUELO());cx.fill();
    cx.fillStyle='#c98a3c';cx.fillRect(0,SUELO(),W,H-SUELO());cx.fillStyle='#9a6a2a';
    for(let x=-((dist*3)%40);x<W;x+=40)cx.fillRect(x,SUELO()+10,18,3);
    for(const o of cosas){
      if(o.t==='moneda'){if(o.got)continue;const s=Math.abs(Math.cos(frames*0.1+o.x*0.05));cx.fillStyle='#ffd23f';cx.strokeStyle='#c98a00';cx.lineWidth=2;cx.beginPath();cx.ellipse(o.x+8,o.y+10,7*s+1.5,9,0,0,7);cx.fill();cx.stroke();}
      else if(o.t==='maceta'){cx.fillStyle='#d2733a';cx.fillRect(o.x,o.y+8,o.w,o.h-8);cx.fillStyle='#b5651d';cx.fillRect(o.x-3,o.y+6,o.w+6,8);cx.fillStyle='#43a047';cx.beginPath();cx.arc(o.x+8,o.y+4,7,0,7);cx.arc(o.x+20,o.y+2,8,0,7);cx.fill();}
      else if(o.t==='picos'){cx.fillStyle='#cfd8dc';cx.strokeStyle='#607d8b';for(let x=o.x;x<o.x+o.w;x+=11){cx.beginPath();cx.moveTo(x,o.y+o.h);cx.lineTo(x+5.5,o.y);cx.lineTo(x+11,o.y+o.h);cx.fill();cx.stroke();}}
      else if(o.t==='pajaro'){const a=Math.sin(frames*0.4)*8;cx.fillStyle='#5d4037';cx.beginPath();cx.ellipse(o.x+19,o.y+12,15,8,0,0,7);cx.fill();
        cx.beginPath();cx.moveTo(o.x+12,o.y+10);cx.lineTo(o.x+20,o.y-4+a);cx.lineTo(o.x+26,o.y+10);cx.fill();cx.fillStyle='#ffb300';cx.fillRect(o.x,o.y+10,7,3);}
      else if(!o.got){const x=o.x+14,by=o.y+o.h;cx.fillStyle='#7b3fa0';cx.beginPath();cx.ellipse(x,by-12,14,11,0,Math.PI,0);cx.lineTo(x+14,by-2);cx.lineTo(x-14,by-2);cx.fill();
        cx.fillStyle='#fff';cx.beginPath();cx.arc(x-5,by-14,4,0,7);cx.arc(x+5,by-14,4,0,7);cx.fill();}
    }
    const pose=muerto?'golpe':!p.suelo?(p.vy<0?'salto':'cae'):(Math.floor(dist/14)%2?'caminaA':'caminaB');
    cx.save();cx.translate(p.x,p.y);if(p.agachado>0&&p.suelo)cx.scale(1.15,0.55);
    Personajes.heroe(cx,pose,0,0,1,52);cx.restore();
    if(bubble>0)drawSpeech(p.x,p.y-60,bubble);
    cx.textBaseline='middle';cx.textAlign='left';cx.font='bold 20px system-ui,Arial';
    txt('🏃 '+Math.floor(dist/10)+' m',12,24);txt('🪙 '+coins,130,24);txt('Mejor: '+Progreso.puntaje('corre')+' m',200,24);
    if(msgT>0){msgT--;cx.textAlign='center';cx.font='bold 18px system-ui,Arial';txt('Toca para saltar · desliza hacia abajo para agacharte',W/2,H*0.32);cx.textAlign='left';}
  }
  return {init,step,draw,toque};
})();
