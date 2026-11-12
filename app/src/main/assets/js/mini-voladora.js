// Merudichis Capuchinis · minijuego Kiara voladora: con el gorro con hélice, cada toque la impulsa hacia arriba;
// pasa entre las torres de macetas sin tocarlas. Cada torre que pasas es un punto.
'use strict';
const MiniVoladora=(()=>{
  let k=null, torres=[], monedas=[], puntos=0, vel=3, avisoT=0, muerta=0, sigT=0;
  const SUELO=()=>H-40;
  function init(){
    frames=0;coins=0;puntos=0;vel=3;avisoT=180;muerta=0;torres=[];monedas=[];sigT=60;
    k={x:W*0.28,y:H*0.45,vy:0};
  }
  function aleteo(){if(muerta)return;k.vy=-7.2;beep(500,820,.06,'square',.04);avisoT=0;}
  function toque(tipo){if(tipo==='down')aleteo();}
  function nuevaTorre(){
    const hueco=Math.max(120,H*0.38-puntos*1.5),arriba=50+Math.random()*(SUELO()-hueco-100);
    torres.push({x:W+40,w:58,arriba,hueco,paso:false});
    if(Math.random()<0.6)monedas.push({x:W+69,y:arriba+hueco/2});
  }
  function step(){
    frames++;
    if(input.jp){input.jp=false;aleteo();}
    if(muerta){muerta++;k.vy=Math.min(k.vy+0.6,12);k.y=Math.min(k.y+k.vy,SUELO()-10);
      if(muerta>70)terminarMinijuego('voladora',puntos,coins+Math.floor(puntos/3),[`🗼 ${puntos} torres`,`🪙 ${coins} monedas`],false);
      return;}
    if(avisoT>0){avisoT--;k.y=H*0.45+Math.sin(frames*0.1)*8;return;}   // espera el primer toque
    k.vy=Math.min(k.vy+0.42,9);k.y+=k.vy;
    vel=3+Math.min(2.5,puntos*0.06);
    if(--sigT<=0){nuevaTorre();sigT=Math.round(200/vel*1.1);}
    for(const t of torres){t.x-=vel;
      if(!t.paso&&t.x+t.w<k.x){t.paso=true;puntos++;beep(880,1320,.07,'square',.04);}
      const r=13;
      if(k.x+r>t.x&&k.x-r<t.x+t.w&&(k.y-r<t.arriba||k.y+r>t.arriba+t.hueco))chocar();}
    for(const m of monedas){m.x-=vel;if(!m.got&&Math.hypot(m.x-k.x,m.y-k.y)<24){m.got=true;coins++;sfx.coin();}}
    torres=torres.filter(t=>t.x>-80);monedas=monedas.filter(m=>m.x>-20&&!m.got);
    if(k.y<12){k.y=12;k.vy=Math.max(k.vy,0);}   // el cielo es el límite, no mata
    if(k.y>SUELO()-10)chocar();
  }
  function chocar(){if(muerta)return;muerta=1;k.vy=-6;sfx.hurt();Voces.decir('choque');}
  function maceta(x,y,w,h,arriba){
    cx.fillStyle='#b5651d';cx.fillRect(x+4,y,w-8,h);
    cx.fillStyle='#8a4513';for(let yy=y+(arriba?h%40:0);yy<y+h;yy+=40)cx.fillRect(x+4,yy,w-8,4);
    const by=arriba?y+h-16:y;cx.fillStyle='#d2733a';cx.fillRect(x,by,w,16);cx.strokeStyle='#5a2a08';cx.lineWidth=2;cx.strokeRect(x,by,w,16);
    cx.fillStyle='#43a047';const fy=arriba?by+16:by;for(let i=0;i<3;i++){cx.beginPath();cx.arc(x+12+i*17,fy+(arriba?4:-4),7,0,7);cx.fill();}
  }
  function draw(){
    cx.setTransform(dpr,0,0,dpr,0,0);
    const g=cx.createLinearGradient(0,0,0,H);g.addColorStop(0,'#62a8ff');g.addColorStop(1,'#cfe9ff');cx.fillStyle=g;cx.fillRect(0,0,W,H);
    cx.fillStyle='rgba(255,255,255,.9)';for(let i=0;i<5;i++){const x=((i*230-frames*0.6)%(W+200)+W+200)%(W+200)-100,y=40+(i*67)%140;
      cx.beginPath();cx.ellipse(x,y,40,14,0,0,7);cx.ellipse(x+26,y-8,24,13,0,0,7);cx.fill();}
    if(!k)return;
    for(const t of torres){maceta(t.x,0,t.w,t.arriba,true);maceta(t.x,t.arriba+t.hueco,t.w,SUELO()-t.arriba-t.hueco,false);}
    for(const m of monedas){const s=Math.abs(Math.cos(frames*0.1+m.x*0.05));cx.fillStyle='#ffd23f';cx.strokeStyle='#c98a00';cx.lineWidth=2;cx.beginPath();cx.ellipse(m.x,m.y,8*s+1.5,10,0,0,7);cx.fill();cx.stroke();}
    cx.fillStyle='#5fb55c';cx.fillRect(0,SUELO(),W,H-SUELO());cx.fillStyle='#3d8b3a';
    for(let x=-((frames*vel)%24);x<W;x+=24)cx.fillRect(x,SUELO(),12,6);
    // Kiara con su gorro con hélice
    cx.save();cx.translate(k.x,k.y);cx.rotate(Math.max(-0.5,Math.min(0.9,k.vy*0.07)));
    Personajes.kiara(cx,muerta?'k_parada':(k.vy<0?'k_correA':'k_correB'),0,14,1,30);
    cx.fillStyle='#1e88e5';cx.beginPath();cx.arc(10,-12,7,Math.PI,0);cx.fill();cx.fillStyle='#e53935';cx.beginPath();cx.arc(10,-12,7,Math.PI,Math.PI*1.5);cx.lineTo(10,-12);cx.fill();
    cx.fillStyle='#ffd23f';cx.fillRect(9,-23,2,6);const a=Math.abs(Math.cos(frames*0.7))*14;cx.fillStyle='#455a64';cx.fillRect(10-a,-25,a*2,3);
    cx.restore();
    cx.textBaseline='middle';cx.textAlign='center';cx.font='bold 34px system-ui,Arial';txt(String(puntos),W/2,40);
    cx.textAlign='left';cx.font='bold 18px system-ui,Arial';txt('🪙 '+coins,12,22);txt('Mejor: '+Progreso.puntaje('voladora'),12,48);
    if(avisoT>0){cx.textAlign='center';cx.font='bold 20px system-ui,Arial';txt('Toca la pantalla para que Kiara vuele',W/2,H*0.7);cx.textAlign='left';}
  }
  return {init,step,draw,toque};
})();
