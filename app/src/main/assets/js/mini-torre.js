// Merudichis Capuchinis · minijuego Torre de bloques: un bloque va de lado a lado; toca para soltarlo.
// Lo que sobresale se cae y el siguiente bloque es igual de angosto. Si lo pones exacto, crece un poco. Kiara mira desde abajo.
'use strict';
const MiniTorre=(()=>{
  const ALTO=26;
  let pila=[], mov=null, trozos=[], camY=0, perfectos=0, fin=0, msgT=0;
  const COLORES=['#e53935','#fb8c00','#fdd835','#43a047','#1e88e5','#8e24aa'];
  function init(){frames=0;coins=0;trozos=[];camY=0;perfectos=0;fin=0;msgT=150;
    const w=Math.min(220,W*0.42);pila=[{x:W/2-w/2,w,y:H-60}];siguiente();}
  function siguiente(){
    const tope=pila[pila.length-1],n=pila.length,v=2.2+Math.min(4,n*0.12);
    mov={x:n%2?0:W-tope.w,w:tope.w,y:tope.y-ALTO,vx:n%2?v:-v};
  }
  function soltar(){
    if(fin)return;msgT=0;
    const tope=pila[pila.length-1],a=Math.max(mov.x,tope.x),b=Math.min(mov.x+mov.w,tope.x+tope.w);
    if(b<=a){trozos.push({x:mov.x,y:mov.y,w:mov.w,vy:0,c:pila.length});mov=null;fin=1;sfx.hurt();Voces.decir('choque');return;}
    if(Math.abs(mov.x-tope.x)<4){       // perfecto
      perfectos++;const w=Math.min(tope.w+(perfectos>=3?8:0),W*0.5);
      pila.push({x:tope.x-(w-tope.w)/2,w,y:mov.y});beep(660,1320,.1,'triangle',.06);
      if(perfectos%3===0){coins++;sfx.coin();}
    } else {
      perfectos=0;
      if(mov.x<a)trozos.push({x:mov.x,y:mov.y,w:a-mov.x,vy:0,c:pila.length});
      if(mov.x+mov.w>b)trozos.push({x:b,y:mov.y,w:mov.x+mov.w-b,vy:0,c:pila.length});
      pila.push({x:a,w:b-a,y:mov.y});beep(330,440,.06,'square',.04);
    }
    siguiente();
  }
  function toque(tipo){if(tipo==='down'&&frames>30)soltar();}   // al inicio se ignora el toque que abrió el juego
  function step(){
    frames++;
    if(input.jp){input.jp=false;soltar();}
    if(mov){mov.x+=mov.vx;if(mov.x<-mov.w*0.6||mov.x+mov.w>W+mov.w*0.6)mov.vx=-mov.vx;}
    for(const t of trozos){t.vy+=0.5;t.y+=t.vy;}trozos=trozos.filter(t=>t.y<camY+H+100);
    const meta=Math.min(0,pila[pila.length-1].y-H*0.45);camY+=(meta-camY)*0.08;
    if(fin&&++fin>80){const n=pila.length-1;terminarMinijuego('torre',n,coins+Math.floor(n/5),[`🧱 ${n} pisos`,`✨ ${perfectos} perfectos al final`,`🪙 ${coins} monedas`],false);}
  }
  function bloque(x,y,w,i){
    cx.fillStyle=COLORES[i%6];cx.fillRect(x,y,w,ALTO);cx.fillStyle='rgba(255,255,255,.3)';cx.fillRect(x,y,w,4);
    cx.fillStyle='rgba(0,0,0,.25)';cx.fillRect(x,y+ALTO-4,w,4);cx.strokeStyle='#151515';cx.lineWidth=2;cx.strokeRect(x,y,w,ALTO);
  }
  function draw(){
    cx.setTransform(dpr,0,0,dpr,0,0);
    const n=pila.length,t=Math.min(1,n/40);
    const g=cx.createLinearGradient(0,0,0,H);g.addColorStop(0,`hsl(${210+t*40},60%,${60-t*35}%)`);g.addColorStop(1,'#cfe9ff');cx.fillStyle=g;cx.fillRect(0,0,W,H);
    if(!pila.length)return;
    cx.save();cx.translate(0,-camY);
    cx.fillStyle='#5fb55c';cx.fillRect(0,H-34,W,200);
    Personajes.kiara(cx,fin?'k_ladra':'k_parada',W/2-pila[0].w/2-40,H-34,1,32);
    pila.forEach((p,i)=>bloque(p.x,p.y,p.w,i));
    if(mov)bloque(mov.x,mov.y,mov.w,n);
    trozos.forEach(tz=>bloque(tz.x,tz.y,tz.w,tz.c));
    cx.restore();
    cx.textBaseline='middle';cx.textAlign='center';cx.font='bold 34px system-ui,Arial';txt(String(n-1),W/2,40);
    cx.textAlign='left';cx.font='bold 18px system-ui,Arial';txt('🪙 '+coins,12,22);txt('Mejor: '+Progreso.puntaje('torre'),12,48);
    if(perfectos>1){cx.textAlign='center';txt('¡Perfecto ×'+perfectos+'!',W/2,76);cx.textAlign='left';}
    if(msgT>0){msgT--;cx.textAlign='center';txt('Toca para soltar el bloque encima de la torre',W/2,H*0.25);cx.textAlign='left';}
  }
  return {init,step,draw,toque};
})();
