// Merudichis Capuchinis · minijuego Kiara saltarina: brinca de plataforma en plataforma hacia arriba lo más alto posible
'use strict';
const MiniSaltarina=(()=>{
  let k=null, plats=[], monedas=[], zombis=[], camY=0, altura=0, objetivoX=0, siguienteY=0, avisoT=0, dedo=false;

  // Cada piso nuevo tiene una plataforma principal que siempre se puede pisar y queda a un salto de la anterior;
  // las frágiles son solo señuelos extra.
  let ultimaX=0;
  function agregar(x,y,tipo){
    const alt=-y/10;
    const p={x,y,w:72,tipo,vx:tipo==='movil'?(Math.random()<.5?-1:1)*(0.8+Math.min(1.6,alt/300)):0,rota:false};
    plats.push(p);
    if(tipo!=='fragil'&&Math.random()<0.3)monedas.push({x:p.x+p.w/2,y:y-26});
    if(alt>120&&tipo==='normal'&&Math.random()<0.1)zombis.push({x:p.x+p.w/2-13,y:y-24,w:26,h:24,p,vivo:true,dir:1});
  }
  function init(){
    frames=0;coins=0;plats=[];monedas=[];zombis=[];camY=0;altura=0;avisoT=200;dedo=false;
    k={x:W/2,y:H-60,w:24,h:18,vx:0,vy:-11,face:1};
    objetivoX=W/2;
    plats.push({x:0,y:H-30,w:W,tipo:'normal',vx:0,piso:true});      // piso de inicio para no caer de entrada
    siguienteY=H-100;ultimaX=W/2;
    while(siguienteY>-H)generar();
  }
  function generar(){
    const alt=-siguienteY/10, r=Math.random();
    const tipo=alt>80&&r<0.3?'movil':r<0.08?'resorte':'normal';
    let x=ultimaX-36+(Math.random()*2-1)*Math.min(W*0.35,200);
    x=Math.max(8,Math.min(W-80,x));
    agregar(x,siguienteY,tipo);ultimaX=x+36;
    if(alt>150&&Math.random()<0.3)agregar(8+Math.random()*(W-88),siguienteY-24,'fragil');
    siguienteY-=46+Math.random()*Math.min(40,14+alt/10);     // nunca más de ~86 px: el salto alcanza ~120
  }
  function toque(tipo,x){if(tipo==='up')dedo=false;else{dedo=true;objetivoX=x;}}

  function step(){
    frames++;
    if(avisoT>0)avisoT--;
    // control horizontal: dedo, inclinación o teclas
    let ax=0;
    if(input.l||input.r){ax=(input.r?1:0)-(input.l?1:0);k.vx+=ax*0.6;}
    else if(cfg.volante==='inclinar'&&!dedo){k.vx+=input.inclinacion*0.9;}
    else{const dx=objetivoX-(k.x);k.vx+=Math.max(-0.9,Math.min(0.9,dx*0.03));}
    k.vx*=0.88;k.vx=Math.max(-7,Math.min(7,k.vx));
    if(Math.abs(k.vx)>0.3)k.face=Math.sign(k.vx);
    k.x+=k.vx;
    if(k.x<-12){k.x+=W;objetivoX+=W;}if(k.x>W+12){k.x-=W;objetivoX-=W;}      // sale por un lado y entra por el otro
    k.vy=Math.min(k.vy+0.42,12);k.y+=k.vy;
    // rebotar en plataformas al caer
    if(k.vy>0)for(const p of plats){
      if(p.rota)continue;
      if(k.x>p.x-8&&k.x<p.x+p.w+8&&k.y>=p.y-2&&k.y-k.vy<=p.y+2){
        if(p.tipo==='fragil'){p.rota=true;beep(200,90,.1,'square',.06);continue;}
        k.y=p.y;k.vy=p.tipo==='resorte'?-16:-10.2;
        if(p.tipo==='resorte'){sfx.spring();Musica.jingle('turbo');}else beep(320,620,.08,'square',.035);
        break;
      }
    }
    for(const p of plats){if(p.vx){p.x+=p.vx;if(p.x<0||p.x+p.w>W)p.vx*=-1;}if(p.rota)p.y+=6;}
    for(const m of monedas)if(!m.got&&Math.hypot(m.x-k.x,m.y-(k.y-10))<22){m.got=true;coins++;sfx.coin();}
    for(const z of zombis){
      if(!z.vivo){z.y+=8;continue;}
      z.x+=z.dir*0.6;if(z.x<z.p.x||z.x+z.w>z.p.x+z.p.w)z.dir*=-1;z.y=z.p.y-24;
      const kb={x:k.x-k.w/2,y:k.y-k.h,w:k.w,h:k.h};
      if(aabb(kb,z)){
        if(k.vy>0&&k.y-z.y<14){z.vivo=false;k.vy=-12;sfx.stomp();}
        else{k.vy=4;k.cayendo=true;sfx.hurt();bubble=90;say();}
      }
    }
    // cámara solo sube
    const meta=k.y-H*0.45;
    if(meta<camY)camY=meta;
    altura=Math.max(altura,Math.floor((H-60-k.y)/10));
    while(siguienteY>camY-H)generar();
    plats=plats.filter(p=>p.y<camY+H+60);monedas=monedas.filter(m=>m.y<camY+H+60&&!m.got);zombis=zombis.filter(z=>z.y<camY+H+60);
    if(bubble>0)bubble--;
    if(k.y>camY+H+40){
      terminarMinijuego('saltarina',altura,coins+Math.floor(altura/80),[`⬆ Altura: ${altura} m`,`🪙 ${coins} monedas`],false);
    }
  }

  function cielo(){
    const t=Math.min(1,altura/1500);
    const arriba=t<0.5?`hsl(${205-t*80},70%,${60-t*30}%)`:`hsl(${245},50%,${Math.max(8,45-(t-0.5)*70)}%)`;
    const g=cx.createLinearGradient(0,0,0,H);g.addColorStop(0,arriba);g.addColorStop(1,t<0.6?'#bfe4ff':'#3a2d6b');
    cx.fillStyle=g;cx.fillRect(0,0,W,H);
    if(t>0.55){cx.fillStyle='#fff';for(let i=0;i<40;i++){const x=(i*97)%W,y=((i*53)-camY*0.05)%H;cx.globalAlpha=0.5+0.5*Math.sin(frames*0.05+i);cx.fillRect(x,(y+H)%H,2,2);}cx.globalAlpha=1;}
  }
  function draw(){
    cx.setTransform(dpr,0,0,dpr,0,0);
    cielo();
    cx.save();cx.translate(0,-camY);
    for(const p of plats){
      const col={normal:'#66bb6a',movil:'#42a5f5',fragil:'#a1887f',resorte:'#66bb6a'}[p.tipo];
      cx.fillStyle=col;rr(p.x,p.y,p.w,12,6);cx.fill();
      if(p.tipo==='fragil'){cx.strokeStyle='#5d4037';cx.lineWidth=1.5;cx.beginPath();cx.moveTo(p.x+p.w*0.3,p.y);cx.lineTo(p.x+p.w*0.4,p.y+12);cx.moveTo(p.x+p.w*0.7,p.y);cx.lineTo(p.x+p.w*0.6,p.y+12);cx.stroke();}
      if(p.tipo==='resorte'){cx.fillStyle='#e53935';cx.fillRect(p.x+p.w/2-10,p.y-8,20,6);cx.strokeStyle='#888';cx.beginPath();cx.moveTo(p.x+p.w/2-6,p.y-2);cx.lineTo(p.x+p.w/2+6,p.y);cx.stroke();}
    }
    for(const m of monedas){const s=Math.abs(Math.cos(frames*0.1+m.x));cx.fillStyle='#ffd23f';cx.strokeStyle='#c98a00';cx.lineWidth=2;cx.beginPath();cx.ellipse(m.x,m.y,8*s+1.5,10,0,0,7);cx.fill();cx.stroke();}
    for(const z of zombis){const x=z.x+13,by=z.y+z.h;cx.fillStyle='#7b3fa0';cx.beginPath();cx.ellipse(x,by-12,14,11,0,Math.PI,0);cx.lineTo(x+14,by-4);cx.lineTo(x-14,by-4);cx.fill();
      cx.fillStyle='#fff';cx.beginPath();cx.arc(x-5,by-14,4,0,7);cx.arc(x+5,by-14,4,0,7);cx.fill();}
    Personajes.kiara(cx,k.vy<-2?'k_ataca':k.vy<2?'k_correA':'k_parada',k.x,k.y,k.face,30);
    if(bubble>0)drawSpeech(k.x,k.y-30,bubble);
    cx.restore();
    cx.textBaseline='middle';cx.textAlign='left';cx.font='bold 18px system-ui,Arial';
    txt('⬆ '+altura+' m',12,22);txt('🪙 '+coins,120,22);txt('Mejor: '+Progreso.puntaje('saltarina')+' m',190,22);
    if(avisoT>0){cx.textAlign='center';cx.font='bold 20px system-ui,Arial';cx.globalAlpha=Math.min(1,avisoT/30);
      txt(cfg.volante==='inclinar'?'Inclina el celular o toca donde quieres que vaya Kiara':'Toca o arrastra el dedo hacia donde quieres que vaya Kiara',W/2,H*0.35);cx.globalAlpha=1;cx.textAlign='left';}
  }
  return {init,step,draw,toque};
})();
