// Merudichis Capuchinis · minijuego Rompe ladrillos: mueve la camita de Kiara con el dedo para rebotar la pelota.
// Los bloques "?" sueltan poderes: camita larga (🛏), tres pelotas (⚾) o moneda. Tres vidas; al limpiar la pared sale otra más rápida.
'use strict';
const MiniLadrillos=(()=>{
  let pal=null, bolas=[], bloques=[], cae=[], vidas=3, puntos=0, ronda=1, objetivo=0, pegada=true, largoT=0;
  function pared(){
    bloques=[];const cols=10,filas=4+Math.min(3,ronda),bw=Math.min(64,(W-40)/cols),x0=(W-bw*cols)/2,y0=56;
    for(let f=0;f<filas;f++)for(let c=0;c<cols;c++){
      if(ronda>1&&(c+f+ronda)%7===0)continue;
      const r=Math.random();
      bloques.push({x:x0+c*bw,y:y0+f*24,w:bw-3,h:21,tipo:r<0.12?'Q':(ronda>2&&r<0.22)?'K':'B',golpes:0});
    }
  }
  function nuevaBola(){bolas=[{x:0,y:0,vx:0,vy:0,r:7}];pegada=true;}
  function init(){frames=0;coins=0;vidas=3;puntos=0;ronda=1;cae=[];largoT=0;
    pal={x:W/2,y:H-36,w:90};objetivo=W/2;pared();nuevaBola();}
  function lanzar(){if(!pegada)return;pegada=false;const v=5.2+ronda*0.4;bolas[0].vx=(Math.random()<.5?-1:1)*v*0.5;bolas[0].vy=-v;}
  function toque(tipo,x){if(tipo==='down'||tipo==='move')objetivo=x;if(tipo==='up')lanzar();}
  function golpear(b){
    if(b.tipo==='K'&&++b.golpes<2){beep(220,180,.05,'square',.04);return;}
    b.roto=true;puntos+=b.tipo==='Q'?3:1;sfx.romper();
    if(b.tipo==='Q'){const r=Math.random();cae.push({x:b.x+b.w/2,y:b.y,t:r<0.4?'largo':r<0.7?'multi':'moneda'});}
  }
  function step(){
    frames++;
    if(input.jp){input.jp=false;lanzar();}
    if(input.l)objetivo-=9;if(input.r)objetivo+=9;
    pal.w=largoT>0?140:90;if(largoT>0)largoT--;
    pal.x+=(objetivo-pal.x)*0.35;pal.x=Math.max(pal.w/2,Math.min(W-pal.w/2,pal.x));
    for(const b of bolas){
      if(pegada){b.x=pal.x;b.y=pal.y-12;continue;}
      b.x+=b.vx;b.y+=b.vy;
      if(b.x<b.r){b.x=b.r;b.vx=Math.abs(b.vx);}if(b.x>W-b.r){b.x=W-b.r;b.vx=-Math.abs(b.vx);}
      if(b.y<44+b.r){b.y=44+b.r;b.vy=Math.abs(b.vy);}
      if(b.vy>0&&b.y+b.r>=pal.y-6&&b.y<pal.y+6&&Math.abs(b.x-pal.x)<pal.w/2+b.r){   // rebote según dónde pegó
        const v=Math.hypot(b.vx,b.vy)*1.01,a=(b.x-pal.x)/(pal.w/2)*1.05;
        b.vx=Math.sin(a)*v;b.vy=-Math.cos(a)*v;beep(300,500,.05,'square',.04);}
      for(const k of bloques){if(k.roto)continue;
        if(b.x+b.r>k.x&&b.x-b.r<k.x+k.w&&b.y+b.r>k.y&&b.y-b.r<k.y+k.h){
          const dx=Math.min(b.x+b.r-k.x,k.x+k.w-(b.x-b.r)),dy=Math.min(b.y+b.r-k.y,k.y+k.h-(b.y-b.r));
          if(dx<dy)b.vx=-b.vx;else b.vy=-b.vy;golpear(k);break;}}
    }
    bolas=bolas.filter(b=>b.y<H+20);
    if(!bolas.length){vidas--;sfx.hurt();if(vidas<=0)return fin();nuevaBola();}
    for(const c of cae){c.y+=2.6;
      if(c.y>pal.y-10&&c.y<pal.y+10&&Math.abs(c.x-pal.x)<pal.w/2+8){c.fuera=true;Musica.jingle('poder');
        if(c.t==='largo')largoT=900;else if(c.t==='moneda'){coins++;sfx.coin();}
        else if(bolas.length&&!pegada){const b=bolas[0];for(const s of[-1,1])bolas.push({x:b.x,y:b.y,vx:b.vx+s*2,vy:b.vy,r:7});}}}
    cae=cae.filter(c=>!c.fuera&&c.y<H+20);
    bloques=bloques.filter(k=>!k.roto);
    if(!bloques.length){ronda++;Musica.jingle('victoria');coins+=2;pared();nuevaBola();cae=[];}
  }
  function fin(){terminarMinijuego('ladrillos',puntos,coins+Math.floor(puntos/15),[`🧱 ${puntos} puntos`,`Ronda ${ronda}`,`🪙 ${coins} monedas`],false);}
  function draw(){
    cx.setTransform(dpr,0,0,dpr,0,0);
    const g=cx.createLinearGradient(0,0,0,H);g.addColorStop(0,'#1a1630');g.addColorStop(1,'#3a3460');cx.fillStyle=g;cx.fillRect(0,0,W,H);
    if(!pal)return;
    for(const k of bloques){
      cx.fillStyle=k.tipo==='Q'?'#ffc107':k.tipo==='K'?(k.golpes?'#757575':'#9e9e9e'):'#e07b39';rr(k.x,k.y,k.w,k.h,3);cx.fill();
      cx.strokeStyle='rgba(0,0,0,.4)';cx.lineWidth=2;cx.stroke();
      if(k.tipo==='Q'){cx.fillStyle='#fff';cx.font='bold 15px Arial';cx.textAlign='center';cx.fillText('?',k.x+k.w/2,k.y+16);cx.textAlign='left';}
      else if(k.tipo==='B'){cx.strokeStyle='#8a3f12';cx.lineWidth=1;cx.beginPath();cx.moveTo(k.x,k.y+k.h/2);cx.lineTo(k.x+k.w,k.y+k.h/2);cx.moveTo(k.x+k.w/2,k.y);cx.lineTo(k.x+k.w/2,k.y+k.h/2);cx.stroke();}
    }
    cx.font='18px system-ui,Arial';cx.textAlign='center';cx.textBaseline='middle';
    for(const c of cae)cx.fillText(c.t==='largo'?'🛏':c.t==='multi'?'⚾':'🪙',c.x,c.y);
    cx.textAlign='left';
    // camita de Kiara con Kiara dormida
    cx.fillStyle='#e91e63';rr(pal.x-pal.w/2,pal.y-6,pal.w,14,7);cx.fill();cx.fillStyle='#f8bbd0';rr(pal.x-pal.w/2+4,pal.y-4,pal.w-8,6,3);cx.fill();
    Personajes.kiara(cx,'k_parada',pal.x,pal.y-5,1,20);
    for(const b of bolas){cx.fillStyle='#fff';cx.beginPath();cx.arc(b.x,b.y,b.r,0,7);cx.fill();cx.strokeStyle='#e53935';cx.lineWidth=1.5;cx.beginPath();cx.arc(b.x-3,b.y,b.r-2,-1,1);cx.stroke();}
    cx.font='bold 18px system-ui,Arial';
    txt('🧱 '+puntos,12,22);txt('❤ '+vidas,100,22);txt('Ronda '+ronda,160,22);txt('Mejor: '+Progreso.puntaje('ladrillos'),260,22);
    if(pegada){cx.textAlign='center';txt('Mueve el dedo y suéltalo para lanzar la pelota',W/2,H*0.6);cx.textAlign='left';}
  }
  return {init,step,draw,toque};
})();
