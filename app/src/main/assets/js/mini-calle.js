// Merudichis Capuchinis · minijuego Cruza la calle: Kiara avanza carril por carril (vista desde arriba).
// Calles con autos, ríos con troncos (hay que ir encima) y pasto seguro. La pantalla sube poco a poco: no te quedes atrás.
// Toque = avanzar; deslizar a los lados o hacia abajo = moverse a ese lado.
'use strict';
const MiniCalle=(()=>{
  const COL=9;
  let carriles=[], k=null, filaMax=0, camF=0, muerta=0, celda=40, ini=null, msgT=0;
  const COLORES=['#c62828','#1e5bd8','#f2f2f2','#ffb300','#6a1b9a'];
  function carril(n){
    if(n<3)return {tipo:'pasto',arboles:[]};
    const r=Math.random(),dif=Math.min(1,n/80);
    if(r<0.3)return {tipo:'pasto',arboles:[0,1,2,3,4,5,6,7,8].filter(c=>c!==4&&Math.random()<0.18)};
    const dir=Math.random()<.5?-1:1;
    if(r<0.72){const v=(0.025+Math.random()*0.03+dif*0.03)*dir,cosas=[];let x=Math.random()*3;
      while(x<COL+4){cosas.push({x,w:1.4,color:COLORES[Math.floor(Math.random()*5)]});x+=3+Math.random()*3-dif;}
      return {tipo:'calle',v,cosas};}
    const v=(0.018+Math.random()*0.02)*dir,cosas=[];let x=Math.random()*2;
    while(x<COL+4){const w=2+Math.floor(Math.random()*2);cosas.push({x,w});x+=w+1.2+Math.random()*1.8+dif;}
    return {tipo:'rio',v,cosas};
  }
  function init(){
    frames=0;coins=0;carriles=[];for(let i=0;i<30;i++)carriles.push(carril(i));
    k={c:4,f:0,x:4,anim:0,dir:1};filaMax=0;camF=-1;muerta=0;msgT=150;
    sembrarMonedas(3,30);
  }
  function sembrarMonedas(a,b){for(let i=a;i<b;i++)if(carriles[i].tipo!=='rio'&&Math.random()<0.25)carriles[i].moneda=Math.floor(Math.random()*COL);}
  function mover(dc,df){
    if(muerta)return;
    const c=Math.max(0,Math.min(COL-1,Math.round(k.x)+dc)),f=Math.max(0,k.f+df);
    const cl=carriles[f];if(cl.tipo==='pasto'&&cl.arboles.includes(c))return;   // los árboles estorban
    k.c=c;k.x=c;k.f=f;k.anim=8;if(dc)k.dir=dc;msgT=0;beep(400,600,.04,'square',.03);
    if(f>filaMax){filaMax=f;}
    if(cl.moneda===c){cl.moneda=null;coins++;sfx.coin();}
    while(carriles.length<f+30){carriles.push(carril(carriles.length));sembrarMonedas(carriles.length-1,carriles.length);}
  }
  function toque(tipo,x,y){
    if(tipo==='down'){ini={x,y};return;}
    if(tipo!=='up'||!ini)return;
    const dx=x-ini.x,dy=y-ini.y;ini=null;
    if(Math.hypot(dx,dy)<25)mover(0,1);
    else if(Math.abs(dx)>Math.abs(dy))mover(dx>0?1:-1,0);
    else mover(0,dy<0?1:-1);
  }
  function morir(motivo){if(muerta)return;muerta=1;sfx.hurt();if(motivo==='agua')Voces.decir('vacio');else{bubble=90;say();}}
  function step(){
    frames++;
    if(input.jp){input.jp=false;mover(0,1);}
    if(input.l){input.l=false;mover(-1,0);}if(input.r){input.r=false;mover(1,0);}
    if(k.anim>0)k.anim--;
    for(const cl of carriles){if(!cl.cosas)continue;
      for(const o of cl.cosas){o.x+=cl.v;if(cl.v>0&&o.x>COL+2)o.x-=COL+6;if(cl.v<0&&o.x+o.w<-2)o.x+=COL+6;}}
    if(bubble>0)bubble--;
    if(muerta){if(++muerta>70)terminarMinijuego('calle',filaMax,coins+Math.floor(filaMax/10),[`🐾 ${filaMax} carriles`,`🪙 ${coins} monedas`],false);return;}
    const cl=carriles[k.f];
    if(cl.tipo==='calle'){for(const o of cl.cosas)if(k.x+0.35>o.x&&k.x-0.35<o.x+o.w-0.4)morir('auto');}
    else if(cl.tipo==='rio'){const t=cl.cosas.find(o=>k.x+0.5>o.x&&k.x+0.5<o.x+o.w);
      if(!t)morir('agua');else{k.x+=cl.v;if(k.x<-0.4||k.x>COL-0.6)morir('agua');}}
    // la cámara avanza sola, más rápido conforme llegas lejos
    camF+=0.006+Math.min(0.012,filaMax*0.0002);
    if(camF<k.f-4)camF+=(k.f-4-camF)*0.05;
    if(k.f<camF-0.6)morir('atras');
  }
  function draw(){
    cx.setTransform(dpr,0,0,dpr,0,0);
    cx.fillStyle='#4caf50';cx.fillRect(0,0,W,H);
    if(!k)return;
    celda=Math.min(W/COL,H/9);
    const ox=(W-celda*COL)/2,fy=f=>H-(f-camF+1.5)*celda;
    const f0=Math.max(0,Math.floor(camF)-2),f1=Math.min(carriles.length-1,Math.ceil(camF+H/celda)+1);
    for(let f=f0;f<=f1;f++){const cl=carriles[f],y=fy(f);
      cx.fillStyle=cl.tipo==='calle'?'#555':cl.tipo==='rio'?'#2b87d1':(f%2?'#66bb6a':'#5fb55c');cx.fillRect(0,y,W,celda);
      if(cl.tipo==='calle'){cx.fillStyle='#ddd';for(let x=0;x<W;x+=40)cx.fillRect(x,y+celda/2-1,20,2);}
      if(cl.tipo==='rio'){cx.fillStyle='rgba(255,255,255,.25)';for(let i=0;i<6;i++)cx.fillRect(((i*97+frames*cl.v*80)%W+W)%W,y+8+(i%3)*10,14,2);}
      if(cl.arboles)for(const c of cl.arboles){const x=ox+c*celda;cx.fillStyle='#6d4c41';cx.fillRect(x+celda*0.42,y+celda*0.55,celda*0.16,celda*0.35);
        cx.fillStyle='#2e7d32';cx.beginPath();cx.arc(x+celda/2,y+celda*0.42,celda*0.34,0,7);cx.fill();}
      if(cl.moneda!=null){const x=ox+cl.moneda*celda+celda/2,s=Math.abs(Math.cos(frames*0.1));cx.fillStyle='#ffd23f';cx.strokeStyle='#c98a00';cx.lineWidth=2;
        cx.beginPath();cx.ellipse(x,y+celda/2,celda*0.2*s+1.5,celda*0.25,0,0,7);cx.fill();cx.stroke();}
      if(cl.cosas)for(const o of cl.cosas){const x=ox+o.x*celda;
        if(cl.tipo==='rio'){cx.fillStyle='#8d5524';rr(x,y+celda*0.15,o.w*celda,celda*0.7,8);cx.fill();cx.fillStyle='#a0693a';cx.fillRect(x+6,y+celda*0.35,o.w*celda-12,3);}
        else{const w=o.w*celda;cx.fillStyle='#111';cx.fillRect(x+w*0.12,y+celda*0.08,w*0.18,celda*0.84);cx.fillRect(x+w*0.7,y+celda*0.08,w*0.18,celda*0.84);
          cx.fillStyle=o.color;rr(x,y+celda*0.16,w,celda*0.68,8);cx.fill();cx.fillStyle='rgba(150,220,255,.85)';
          cx.fillRect(cl.v>0?x+w*0.62:x+w*0.18,y+celda*0.24,w*0.2,celda*0.52);}}
    }
    const kx=ox+k.x*celda+celda/2,ky=fy(k.f)+celda*0.85-(k.anim>0?Math.sin(k.anim/8*Math.PI)*10:0);
    if(muerta&&carriles[k.f].tipo==='rio'){cx.globalAlpha=Math.max(0,1-muerta/40);}
    Personajes.kiara(cx,k.anim>0?'k_correA':'k_parada',kx,ky,k.dir,celda*0.7);cx.globalAlpha=1;
    if(bubble>0)drawSpeech(kx,ky-celda*0.7,bubble);
    cx.textBaseline='middle';cx.textAlign='left';cx.font='bold 18px system-ui,Arial';
    txt('🐾 '+filaMax,12,22);txt('🪙 '+coins,90,22);txt('Mejor: '+Progreso.puntaje('calle'),160,22);
    if(msgT>0){msgT--;cx.textAlign='center';cx.font='bold 18px system-ui,Arial';txt('Toca para avanzar · desliza a los lados para moverte',W/2,H*0.3);cx.textAlign='left';}
  }
  return {init,step,draw,toque};
})();
