// Merudichis Capuchinis · poder de Kiara: llega por 10 segundos y, al azar, ataca, ladra y paraliza, o se hace grande para montarla
'use strict';
const KIARA_DURA=600;                 // 10 segundos a 60 cuadros por segundo
const KIARA_ALTO=24, KIARA_GRANDE=44; // altura en pixeles del mundo
let kiara=null, kiaraMsg={texto:'',t:0};

function activarKiara(){
  if(kiara&&kiara.montada)bajarDeKiara();
  const modo=['ataca','ladra','grande'][Math.floor(Math.random()*3)];
  const grande=modo==='grande';
  P.llama=45;
  sfx.silbido();
  hablar('¡Ven, Kiara!');
  kiara={modo,t:KIARA_DURA,x:Math.max(2,cam-40),y:Math.max(0,P.y-60),w:grande?34:24,h:grande?26:18,vx:0,vy:0,
    face:1,anim:0,ladra:0,montada:false,saliendo:false,onGround:false};
  kiaraMsg={texto:modo==='ataca'?'¡Kiara al ataque!':modo==='ladra'?'¡Kiara ladra y paraliza!':'¡Kiara gigante! Súbete',t:150};
}

function subirAKiara(){
  kiara.montada=true;
  P.y-=14;P.h=44;P.x-=4;P.w=30;
  sfx.item();
}
function bajarDeKiara(){
  if(!kiara||!kiara.montada)return;
  kiara.montada=false;
  P.y+=14;P.h=30;P.x+=4;P.w=22;P.vy=-7;
  kiara.x=P.x-P.face*30;kiara.y=P.y+P.h-kiara.h;
}
const kiaraMontada=()=>!!(kiara&&kiara.montada);

function ahuyentar(e,dir){
  e.alive=false;e.dead=0;e.huye={vx:dir*5,vy:-8};
  sparkle(e.x+13,e.y+12,'#ffe082',8);
}
function enemigoCercano(k,rango){
  let mejor=null,dist=rango;
  for(const e of enemies){
    if(!e.alive)continue;
    const d=Math.abs(e.x-k.x);
    if(d<dist&&Math.abs(e.y-k.y)<120){dist=d;mejor=e;}
  }
  return mejor;
}

function actualizarKiara(){
  if(kiaraMsg.t>0)kiaraMsg.t--;
  const k=kiara;if(!k)return;
  let dx=0;
  if(k.montada){
    k.x=P.x+P.w/2-k.w/2;k.y=P.y+P.h-k.h;k.face=P.face;k.anim+=Math.abs(P.vx)*0.08;
  } else {
    let tx=P.x+P.w/2-P.face*34, prisa=7.5;
    if(k.saliendo){tx=k.x+600;prisa=9;}
    else if(k.modo==='grande')tx=P.x+P.w/2;
    else if(k.modo==='ataca'){const e=enemigoCercano(k,330);if(e)tx=e.x+e.w/2;}
    dx=tx-(k.x+k.w/2);
    if(Math.abs(dx)>6){k.vx+=Math.sign(dx)*0.7;k.face=Math.sign(dx);}
    else{k.vx*=0.7;const e=enemigoCercano(k,300);k.face=e?Math.sign(e.x-k.x)||1:P.face;}
    k.vx=Math.max(-prisa,Math.min(prisa,k.vx));
    k.vy=Math.min(k.vy+0.6,14);
    moveX(k);
    if(k.onGround){
      const ahead=k.vx>0?k.x+k.w+4:k.x-4;
      const hueco=!solid(Math.floor(ahead/T),Math.floor((k.y+k.h+4)/T));
      if(k.hitWall||(hueco&&Math.abs(dx)>40)||(P.y+P.h<k.y-40&&Math.abs(dx)<90))k.vy=-11.5;
    }
    moveY(k);
    k.anim+=Math.abs(k.vx)*0.08;
    if(k.saliendo){
      if(k.x>cam+W/scale+60||k.y>ROWS*T+40)kiara=null;
      return;
    }
    if(k.y>ROWS*T+40||Math.abs(k.x-P.x)>520){k.x=P.x-P.face*40;k.y=Math.max(0,P.y-30);k.vx=0;k.vy=0;}
    if(k.modo==='grande'&&Math.abs(dx)<18&&Math.abs((k.y+k.h)-(P.y+P.h))<30)subirAKiara();
  }

  if(k.modo==='ataca'){
    for(const e of enemies)if(e.alive&&aabb(k,e)){ahuyentar(e,k.face);sfx.ladrido();}
  } else if(k.modo==='ladra'){
    if(k.ladra>0)k.ladra--;
    if(k.t%75===0){
      k.ladra=24;sfx.ladrido();
      for(const e of enemies)if(e.alive&&Math.abs(e.x-k.x)<300&&Math.abs(e.y-k.y)<160)e.paralizado=240;
    }
  } else if(k.montada){
    for(const e of enemies)if(e.alive&&aabb(P,e)){ahuyentar(e,P.face);sfx.stomp();}
  }

  k.t--;
  if(k.t<=0){bajarDeKiara();k.saliendo=true;k.vy=-8;}
}

function poseKiara(k){
  if(k.modo==='ladra'&&k.ladra>0)return 'k_ladra';
  if(!k.onGround&&k.modo==='ataca')return 'k_ataca';
  if(Math.abs(k.vx)>0.8||(k.montada&&Math.abs(P.vx)>0.5))return Math.floor(k.anim/2.5)%2?'k_correA':'k_correB';
  return 'k_parada';
}
function dibujarKiara(){
  const k=kiara;if(!k||k.montada)return;
  const alto=k.modo==='grande'?KIARA_GRANDE:KIARA_ALTO;
  const x=k.x+k.w/2,y=k.y+k.h;
  Personajes.kiara(cx,poseKiara(k),x,y,k.face,alto);
  if(k.ladra>0){
    const bx=x+k.face*alto*0.75,by=y-alto*0.6;
    cx.strokeStyle='rgba(255,255,255,.9)';cx.lineWidth=2;
    for(let i=1;i<=3;i++){const r=i*8+(24-k.ladra);cx.beginPath();cx.arc(bx,by,r,k.face>0?-0.6:Math.PI-0.6,k.face>0?0.6:Math.PI+0.6);cx.stroke();}
    cx.fillStyle='#fff';cx.font='bold 13px system-ui,Arial';cx.textAlign='center';cx.fillText('¡GUAU!',bx+k.face*22,by-18);cx.textAlign='left';
  }
}
// Jugador montado: Kiara grande abajo y el jugador sentado encima
function dibujarMontados(dir){
  const x=P.x+P.w/2,suelo=P.y+P.h;
  Personajes.kiara(cx,poseKiara(kiara),x,suelo,dir,KIARA_GRANDE);
  Personajes.heroe(cx,'monta',x-dir*4,suelo-4,dir,46);
}
function hudKiara(L){
  if(kiara&&!kiara.saliendo){
    const w=120,x=W/2-w/2,y=16;
    cx.fillStyle='rgba(0,0,0,.35)';cx.fillRect(x,y,w,10);
    cx.fillStyle='#ffb74d';cx.fillRect(x,y,w*kiara.t/KIARA_DURA,10);
    cx.font='bold 14px system-ui,Arial';cx.textAlign='center';txt('Kiara',W/2-18,y+24);cx.textAlign='left';
  }
  if(kiaraMsg.t>0){
    cx.font='bold 22px system-ui,Arial';cx.textAlign='center';
    cx.globalAlpha=Math.min(1,kiaraMsg.t/20);txt(kiaraMsg.texto,W/2-10,64);cx.globalAlpha=1;cx.textAlign='left';
  }
}
