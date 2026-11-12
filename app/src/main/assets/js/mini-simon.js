// Merudichis Capuchinis · minijuego Kiara dice: Kiara ladra una secuencia de colores; repítela tocando los botones.
// Cada ronda agrega uno más. Un error y se acaba.
'use strict';
const MiniSimon=(()=>{
  const BOTONES=[{c:'#e53935',l:'#ff8a80',f:262},{c:'#1e88e5',l:'#82b1ff',f:330},{c:'#43a047',l:'#b9f6ca',f:392},{c:'#fdd835',l:'#ffff8d',f:523}];
  let sec=[], paso=0, modo='muestra', t=0, luz=-1, luzT=0, fin=0;
  function geometria(){const s=Math.min(W*0.42,H*0.36),cx0=W/2,cy0=H*0.56;return {s,cx0,cy0};}
  function caja(i){const g=geometria(),x=g.cx0+(i%2?4:-g.s-4),y=g.cy0+(i>1?4:-g.s-4);return {x,y,w:g.s,h:g.s};}
  function sonar(i){luz=i;luzT=18;beep(BOTONES[i].f,BOTONES[i].f*1.02,.25,'square',.06);}
  function init(){frames=0;coins=0;sec=[];fin=0;nuevaRonda();}
  function nuevaRonda(){sec.push(Math.floor(Math.random()*4));paso=0;modo='muestra';t=-40;
    if(sec.length>1&&(sec.length-1)%5===0){coins++;sfx.coin();}}
  function toque(tipo,x,y){
    if(tipo!=='down'||modo!=='turno'||fin)return;
    for(let i=0;i<4;i++){const b=caja(i);if(x>b.x&&x<b.x+b.w&&y>b.y&&y<b.y+b.h){
      sonar(i);
      if(sec[paso]!==i){fin=1;modo='fin';sfx.hurt();Musica.jingle('error');return;}
      if(++paso>=sec.length){modo='bien';t=0;Musica.jingle('acierto');}
      return;}}
  }
  function step(){
    frames++;if(luzT>0&&--luzT===0)luz=-1;
    if(modo==='muestra'){t++;const vel=Math.max(16,34-sec.length);
      if(t>=0&&t%vel===0){const i=t/vel;if(i<sec.length)sonar(sec[i]);else{modo='turno';paso=0;}}}
    else if(modo==='bien'&&++t>50)nuevaRonda();
    if(fin&&++fin>70){const n=sec.length-1;terminarMinijuego('simon',n,coins+Math.floor(n/3),[`🐶 ${n} rondas completas`,`🪙 ${coins} monedas`],false);}
  }
  function draw(){
    cx.setTransform(dpr,0,0,dpr,0,0);
    cx.fillStyle='#2b2140';cx.fillRect(0,0,W,H);
    const g=geometria();
    for(let i=0;i<4;i++){const b=caja(i);cx.fillStyle=luz===i?BOTONES[i].l:BOTONES[i].c;rr(b.x,b.y,b.w,b.h,18);cx.fill();
      cx.strokeStyle='#151515';cx.lineWidth=4;cx.stroke();}
    cx.fillStyle='#2b2140';cx.beginPath();cx.arc(g.cx0,g.cy0,g.s*0.32,0,7);cx.fill();
    Personajes.kiara(cx,luz>=0&&modo!=='turno'?'k_ladra':'k_parada',g.cx0,g.cy0+g.s*0.18,1,g.s*0.36);
    cx.textBaseline='middle';cx.textAlign='center';cx.font='bold 20px system-ui,Arial';
    txt(modo==='muestra'?'Escucha a Kiara…':modo==='turno'?'Tu turno: '+paso+' / '+sec.length:modo==='bien'?'¡Bien!':'¡Uy! Ese no era',W/2,g.cy0-g.s-26);
    cx.textAlign='left';cx.font='bold 18px system-ui,Arial';txt('Ronda '+sec.length,12,22);txt('🪙 '+coins,110,22);txt('Mejor: '+Progreso.puntaje('simon'),170,22);
  }
  return {init,step,draw,toque};
})();
