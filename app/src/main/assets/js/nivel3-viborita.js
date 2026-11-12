// Merudichis Capuchinis · Nivel 3: La Viborita (vista desde arriba; crece comiendo bloques hasta medir 30)
'use strict';
const Nivel3=(()=>{
  const C=24, R=13, META=30;
  const DIRS={u:{x:0,y:-1},d:{x:0,y:1},l:{x:-1,y:0},r:{x:1,y:0}};
  let vib=[], dir=DIRS.r, cola=[], crecer=0, tick=0, bloques=[], zombies=[], zombiesPend=[],
      hueso=null, huesoT=0, kv=null, inv=0, raceF=0, prev={}, avisoT=0;
  let celda=20, ox=0, oy=0;

  const ocupada=(x,y)=>vib.some(s=>s.x===x&&s.y===y)||bloques.some(b=>b.x===x&&b.y===y)||
    zombies.some(z=>z.x===x&&z.y===y)||(hueso&&hueso.x===x&&hueso.y===y);
  function libre(lejosDe){
    for(let i=0;i<200;i++){
      const x=Math.floor(Math.random()*C),y=Math.floor(Math.random()*R);
      if(ocupada(x,y))continue;
      if(lejosDe&&Math.abs(x-lejosDe.x)+Math.abs(y-lejosDe.y)<6)continue;
      return {x,y};
    }
    return {x:0,y:0};
  }
  function nuevoBloque(){const p=libre();bloques.push({x:p.x,y:p.y,t:Math.random()<0.3?'Q':'B'});}
  function nuevoZombie(){const p=libre(vib[0]);zombies.push({x:p.x,y:p.y,par:0,mov:Math.floor(Math.random()*24)});}
  function reiniciarVibora(){
    vib=[{x:6,y:6},{x:5,y:6},{x:4,y:6}];dir=DIRS.r;cola=[];crecer=0;tick=0;inv=60;
    zombies=zombies.filter(z=>Math.abs(z.x-6)+Math.abs(z.y-6)>4);
  }

  function init(){
    lives=vidasIniciales();coins=0;frames=0;raceF=0;bubble=0;
    bloques=[];zombies=[];zombiesPend=[];hueso=null;huesoT=600;kv=null;avisoT=240;
    reiniciarVibora();
    for(let i=0;i<5;i++)nuevoBloque();
    for(let i=0;i<3;i++)nuevoZombie();
    prev={l:false,r:false,j:false,d:false,pu:false,pd:false,pl:false,pr:false};input.swipe=null;
  }

  function pedirGiro(n){
    const ult=cola.length?cola[cola.length-1]:dir;
    if(n.x===-ult.x&&n.y===-ult.y)return;       // no puede regresarse sobre sí misma
    if(n.x===ult.x&&n.y===ult.y)return;
    if(cola.length<2)cola.push(n);
  }
  function leerControles(){
    if(input.swipe){pedirGiro(DIRS[input.swipe]);input.swipe=null;}
    const flanco=k=>input[k]&&!prev[k];
    if(flanco('pu')||flanco('j'))pedirGiro(DIRS.u);           // cruz direccional en pantalla o flechas del teclado
    if(flanco('pd')||flanco('d'))pedirGiro(DIRS.d);
    if(flanco('pl')||flanco('l'))pedirGiro(DIRS.l);
    if(flanco('pr')||flanco('r'))pedirGiro(DIRS.r);
    for(const k in prev)prev[k]=input[k];
    input.jp=false;
  }

  function choque(){
    lives--;sfx.hurt();
    if(lives<=0){state='over';Musica.parar();Musica.jingle('perder');showOverlay();return;}
    reiniciarVibora();
  }
  function comer(b){
    bloques.splice(bloques.indexOf(b),1);
    if(b.t==='Q'){crecer+=2;coins++;sfx.coin();}else{crecer+=1;sfx.romper();}
    nuevoBloque();
  }
  function mordidaZombie(z){
    if(z.par>0){zombies.splice(zombies.indexOf(z),1);zombiesPend.push(300);crecer+=1;sfx.stomp();return;}
    if(inv>0)return;
    bubble=100;say();sfx.hurt();inv=90;
    vib.length=Math.max(3,Math.ceil(vib.length/2));crecer=0;
  }

  function mover(){
    if(cola.length)dir=cola.shift();
    const h={x:vib[0].x+dir.x,y:vib[0].y+dir.y};
    if(h.x<0||h.x>=C||h.y<0||h.y>=R){choque();return;}
    const cuerpo=crecer>0?vib:vib.slice(0,-1);
    if(cuerpo.some(s=>s.x===h.x&&s.y===h.y)){choque();return;}
    vib.unshift(h);
    if(crecer>0)crecer--;else vib.pop();
    const b=bloques.find(b=>b.x===h.x&&b.y===h.y);if(b)comer(b);
    if(hueso&&hueso.x===h.x&&hueso.y===h.y){hueso=null;activarKiaraV();}
    const z=zombies.find(z=>z.x===h.x&&z.y===h.y);if(z)mordidaZombie(z);
  }

  function moverZombies(){
    for(const z of zombies){
      if(z.par>0){z.par--;continue;}
      if(--z.mov>0)continue;
      z.mov=24;
      const head=vib[0];
      const opciones=Object.values(DIRS).filter(d=>{
        const x=z.x+d.x,y=z.y+d.y;
        return x>=0&&x<C&&y>=0&&y<R&&!bloques.some(b=>b.x===x&&b.y===y)&&!vib.slice(1).some(s=>s.x===x&&s.y===y)&&!zombies.some(o=>o.x===x&&o.y===y);
      });
      if(!opciones.length)continue;
      let d=opciones[Math.floor(Math.random()*opciones.length)];
      if(Math.random()<0.3){opciones.sort((a,b)=>(Math.abs(z.x+a.x-head.x)+Math.abs(z.y+a.y-head.y))-(Math.abs(z.x+b.x-head.x)+Math.abs(z.y+b.y-head.y)));d=opciones[0];}
      z.x+=d.x;z.y+=d.y;
      if(z.x===head.x&&z.y===head.y)mordidaZombie(z);
    }
    zombiesPend=zombiesPend.map(t=>t-1);
    while(zombiesPend.length&&zombiesPend[0]<=0){zombiesPend.shift();nuevoZombie();}
  }

  // Kiara corre por el tablero comiendo bloques por ti y ladrando a los zombies
  function activarKiaraV(){
    sfx.silbido();Musica.jingle('kiara');hablar('¡Ven, Kiara!');
    kv={x:0,y:Math.floor(R/2),t:kiaraDura(),mov:0,ladra:0,face:1,anim:0};
    kiaraMsg={texto:'¡Kiara te ayuda a comer!',t:120};
  }
  function moverKiaraV(){
    if(!kv)return;
    kv.t--;kv.anim+=0.3;if(kv.ladra>0)kv.ladra--;
    if(kv.t<=0){kv=null;return;}
    if(kv.t%90===0){
      kv.ladra=24;sfx.ladrido();
      for(const z of zombies)if(Math.abs(z.x-kv.x)+Math.abs(z.y-kv.y)<=6)z.par=240;
    }
    if(--kv.mov>0)return;
    kv.mov=6;
    let obj=null,dist=1e9;
    for(const b of bloques){const d=Math.abs(b.x-kv.x)+Math.abs(b.y-kv.y);if(d<dist){dist=d;obj=b;}}
    if(!obj)return;
    if(obj.x!==kv.x){const s=Math.sign(obj.x-kv.x);kv.x+=s;kv.face=s;}
    else if(obj.y!==kv.y)kv.y+=Math.sign(obj.y-kv.y);
    if(kv.x===obj.x&&kv.y===obj.y)comer(obj);
  }

  function step(){
    frames++;raceF++;
    if(bubble>0)bubble--;
    if(inv>0)inv--;
    if(avisoT>0)avisoT--;
    if(kiaraMsg.t>0)kiaraMsg.t--;
    leerControles();
    moverZombies();
    moverKiaraV();
    if(hueso&&--hueso.t<=0)hueso=null;
    if(!hueso&&!kv&&--huesoT<=0){const p=libre(vib[0]);hueso={x:p.x,y:p.y,t:480};huesoT=900;}
    const vel=Math.max(6,13-Math.floor(vib.length/4));   // empieza lenta y acelera al crecer
    if(++tick>=vel){tick=0;mover();if(state!=='play')return;}
    if(vib.length>=META){
      Musica.parar();Musica.jingle('victoria');
      const seg=raceF/60;
      terminarNivel(3,seg,coins,1+(seg<90?1:0)+(lives>=vidasIniciales()?1:0),[`🐍 Llegaste a ${vib.length} de largo`,`❤ ${lives} vidas`]);
    }
  }

  // ---------- Dibujo ----------
  const px=x=>ox+x*celda, py=y=>oy+y*celda;
  function bloque(b){
    const x=px(b.x),y=py(b.y),s=celda;
    if(b.t==='Q'){
      cx.fillStyle=Math.floor(frames/20)%3===0?'#ffd54f':'#ffc107';cx.fillRect(x+1,y+1,s-2,s-2);
      cx.strokeStyle='#b8860b';cx.lineWidth=2;cx.strokeRect(x+2,y+2,s-4,s-4);
      cx.fillStyle='#fff';cx.font=`bold ${Math.round(s*0.65)}px Arial`;cx.textAlign='center';cx.textBaseline='middle';cx.fillText('?',x+s/2,y+s/2+1);
    } else {
      cx.fillStyle='#e07b39';cx.fillRect(x+1,y+1,s-2,s-2);
      cx.strokeStyle='#8a3f12';cx.lineWidth=1.5;cx.beginPath();
      cx.moveTo(x+1,y+s/2);cx.lineTo(x+s-1,y+s/2);cx.moveTo(x+s/2,y+1);cx.lineTo(x+s/2,y+s/2);
      cx.moveTo(x+s/4,y+s/2);cx.lineTo(x+s/4,y+s-1);cx.moveTo(x+s*0.75,y+s/2);cx.lineTo(x+s*0.75,y+s-1);cx.stroke();
    }
  }
  function zombie(z){
    const x=px(z.x)+celda/2,y=py(z.y)+celda/2,s=celda/30;
    cx.save();cx.translate(x,y);cx.scale(s,s);
    cx.fillStyle=z.par>0?'#9575cd':'#7b3fa0';cx.beginPath();cx.arc(0,0,13,0,7);cx.fill();
    cx.fillStyle='#fff';cx.beginPath();cx.arc(-5,-3,4,0,7);cx.arc(5,-3,4,0,7);cx.fill();
    cx.fillStyle='#111';
    if(z.par>0){cx.font='bold 9px Arial';cx.textAlign='center';cx.textBaseline='middle';cx.fillText('x',-5,-3);cx.fillText('x',5,-3);}
    else{cx.beginPath();cx.arc(-5,-2,2,0,7);cx.arc(5,-2,2,0,7);cx.fill();}
    cx.strokeStyle='#111';cx.lineWidth=2;cx.beginPath();cx.moveTo(-6,7);cx.lineTo(6,7);cx.stroke();
    cx.restore();
    if(z.par>0){cx.fillStyle='#ffeb3b';for(let i=0;i<3;i++){const a=frames*0.12+i*2.1;cx.beginPath();cx.arc(x+Math.cos(a)*celda*0.4,y-celda*0.5+Math.sin(a)*2,2.5,0,7);cx.fill();}}
  }
  function huesoDib(){
    const x=px(hueso.x)+celda/2,y=py(hueso.y)+celda/2,s=celda/24;
    if(hueso.t<120&&Math.floor(hueso.t/8)%2)return;
    cx.save();cx.translate(x,y);cx.scale(s,s);
    cx.fillStyle='#fff8e1';cx.strokeStyle='#8d6e63';cx.lineWidth=1.5;
    cx.beginPath();cx.rect(-7,-3,14,6);cx.fill();cx.stroke();
    for(const [bx,by] of [[-7,-3],[-7,3],[7,-3],[7,3]]){cx.beginPath();cx.arc(bx,by,3.5,0,7);cx.fill();cx.stroke();}
    cx.restore();
  }
  function draw(){
    cx.setTransform(dpr,0,0,dpr,0,0);
    const libreX=W-(cfg.swap?0:170)-(cfg.swap?170:0);
    celda=Math.max(8,Math.floor(Math.min(libreX/C,(H-46)/R)));
    ox=Math.floor(cfg.swap?170+(libreX-celda*C)/2:(libreX-celda*C)/2);oy=Math.floor(46+((H-46)-celda*R)/2);
    cx.fillStyle='#2e5e2e';cx.fillRect(0,0,W,H);
    cx.fillStyle='#6d4c2f';cx.fillRect(ox-6,oy-6,celda*C+12,celda*R+12);
    for(let y=0;y<R;y++)for(let x=0;x<C;x++){cx.fillStyle=(x+y)%2?'#8bc34a':'#9ccc65';cx.fillRect(px(x),py(y),celda,celda);}
    for(const b of bloques)bloque(b);
    if(hueso)huesoDib();
    for(const z of zombies)zombie(z);
    // viborita: la cola cambia de color conforme crece
    const parpadea=inv>0&&Math.floor(inv/5)%2;
    if(!parpadea){
      for(let i=vib.length-1;i>=1;i--){
        const s=vib[i],hue=(140+vib.length*9+i*7)%360;
        cx.fillStyle=`hsl(${hue},70%,48%)`;
        rr(px(s.x)+2,py(s.y)+2,celda-4,celda-4,celda*0.3);cx.fill();
      }
      const h=vib[0];
      drawHead(cx,px(h.x)+celda/2,py(h.y)+celda/2,celda*0.62,dir.x||1);
    }
    if(kv)Personajes.kiara(cx,kv.ladra>0?'k_ladra':(Math.floor(kv.anim)%2?'k_correA':'k_correB'),px(kv.x)+celda/2,py(kv.y)+celda*0.95,kv.face,celda*1.4);
    if(kv&&kv.ladra>0){cx.fillStyle='#fff';cx.font='bold 13px system-ui,Arial';cx.textAlign='center';cx.fillText('¡GUAU!',px(kv.x)+celda/2,py(kv.y)-celda*0.6);}
    if(bubble>0){const h=vib[0];drawSpeech(px(h.x)+celda/2,py(h.y)-celda*0.3,bubble);}
    hud();
  }
  function hud(){
    cx.setTransform(dpr,0,0,dpr,0,0);cx.textAlign='left';cx.textBaseline='middle';
    cx.font='bold 18px system-ui,Arial';
    txt('🐍 '+vib.length+' / '+META,12,22);
    txt('🪙 '+coins,120,22);
    txt('❤ '+lives,190,22);
    txt('⏱ '+fmtSeg(raceF/60),250,22);
    if(kv){const w=110,x=W/2-w/2+40;cx.fillStyle='rgba(0,0,0,.35)';cx.fillRect(x,14,w,10);cx.fillStyle='#ffb74d';cx.fillRect(x,14,w*kv.t/kiaraDura(),10);}
    cx.textAlign='center';
    if(avisoT>0){cx.font='bold 20px system-ui,Arial';cx.globalAlpha=Math.min(1,avisoT/30);
      txt('Usa la cruz o desliza el dedo · come bloques para crecer',W/2,H/2);cx.globalAlpha=1;}
    if(kiaraMsg.t>0){cx.font='bold 20px system-ui,Arial';txt(kiaraMsg.texto,W/2,H*0.25);}
    cx.textAlign='left';
  }

  return {init,step,draw};
})();
