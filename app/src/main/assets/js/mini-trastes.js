// Merudichis Capuchinis · minijuego Atrapa los trastes: una niña traviesa los avienta desde la alacena y tú los atrapas
'use strict';
const MiniTrastes=(()=>{
  // valor: puntos al atraparlo; malo: no hay que atraparlo
  const TIPOS={
    plato:{valor:1,vel:1,  color:'#fafafa'},
    taza: {valor:2,vel:1.1,color:'#ffcc80'},
    vaso: {valor:3,vel:1.35,color:'#b3e5fc'},
    olla: {valor:5,vel:0.9,color:'#90a4ae',pesada:true},
    globo:{malo:true,vel:0.8,color:'#4fc3f7'},
    zapato:{malo:true,vel:1.1,color:'#6d4c41'},
    hueso:{valor:0,vel:1,color:'#fff8e1',hueso:true}
  };
  let ninaX=0, ninaDir=1, ninaPose='n_parada', poseT=0, tiro=0, cosas=[], rotos=[], jx=0, objetivoX=0,
      puntos=0, corazones=3, lento=0, lodo=0, kiaraT=0, kx=0, atrapadas=0, avisoT=0, anim=0, rafaga=0, rafT=0, msgT=0;
  const dificultad=()=>1+Math.min(2.4,frames/3600*0.9+atrapadas/45);     // sube con el tiempo y con lo que atrapas

  const piso=()=>H-12, repisa=()=>H*0.2;
  function init(){
    frames=0;coins=0;puntos=0;corazones=3+(Progreso.tiene('vida_extra')?1:0);
    ninaX=W/2;ninaDir=1;tiro=90;rafaga=0;rafT=0;msgT=0;cosas=[];rotos=[];jx=W/2;objetivoX=W/2;lento=0;lodo=0;kiaraT=0;kx=-40;atrapadas=0;avisoT=200;
  }
  function toque(tipo,x){if(tipo!=='up')objetivoX=x;}

  function lanzar(){
    const n=atrapadas;
    const r=Math.random();
    let t=r<0.32?'plato':r<0.55?'taza':r<0.7?'vaso':r<0.78?'olla':r<0.88?'globo':r<0.96?'zapato':'hueso';
    if(t==='hueso'&&kiaraT>0)t='plato';
    const dif=dificultad();
    cosas.push({t,x:ninaX,y:repisa()+10,vx:(Math.random()-0.5)*2.2,vy:-2,rot:0,g:0.12*TIPOS[t].vel*dif});
    ninaPose='n_lanza';poseT=18;beep(400,600,.06,'triangle',.04);
  }
  function step(){
    frames++;anim++;
    if(avisoT>0)avisoT--;
    // la niña camina por la repisa y avienta trastes cada vez más rápido
    ninaX+=ninaDir*(1.2*dificultad());
    if(ninaX<50||ninaX>W-50){ninaDir*=-1;ninaX=Math.max(50,Math.min(W-50,ninaX));}
    if(Math.random()<0.006)ninaDir*=-1;
    if(poseT>0&&--poseT===0)ninaPose='n_parada';
    // de vez en cuando avienta una ráfaga de trastes seguidos
    if(++rafT>Math.max(420,900-frames/6)&&!rafaga){rafaga=3+Math.min(4,Math.floor(frames/1800));rafT=0;msgT=70;Musica.jingle('turbo');}
    if(msgT>0)msgT--;
    if(--tiro<=0){
      lanzar();
      if(rafaga>0){rafaga--;tiro=12;}
      else tiro=Math.max(20,75-frames/80-atrapadas)+Math.random()*25;
    }
    // jugador: sigue al dedo; con el teclado o los botones se mueve paso a paso
    if(input.l)objetivoX-=7;if(input.r)objetivoX+=7;
    objetivoX=Math.max(30,Math.min(W-30,objetivoX));
    const vel=lento>0?0.08:0.25;
    jx+=(objetivoX-jx)*vel;
    if(lento>0)lento--;if(lodo>0)lodo--;
    // Kiara ayuda atrapando lo que cae del otro lado
    if(kiaraT>0){
      kiaraT--;
      let obj=null;for(const c of cosas)if(!TIPOS[c.t].malo&&!c.fuera&&Math.abs(c.x-jx)>90&&(!obj||c.y>obj.y))obj=c;
      const tx=obj?obj.x:jx-80;kx+=Math.sign(tx-kx)*Math.min(7,Math.abs(tx-kx));
    } else if(kx>-40)kx-=6;
    const yCanasta=piso()-58;
    for(const c of cosas){
      c.vy+=c.g;c.x+=c.vx;c.y+=c.vy;c.rot+=0.08;
      if(c.x<15||c.x>W-15)c.vx*=-1;
      const tp=TIPOS[c.t];
      const enCanasta=c.vy>0&&Math.abs(c.y-yCanasta)<14&&Math.abs(c.x-jx)<44;
      const enKiara=kiaraT>0&&!tp.malo&&c.vy>0&&Math.abs(c.y-(piso()-26))<16&&Math.abs(c.x-kx)<30;
      if(enCanasta||enKiara){
        c.fuera=true;
        if(tp.hueso){kiaraT=kiaraDura();kx=-30;sfx.silbido();Musica.jingle('kiara');hablar('¡Ven, Kiara!');}
        else if(c.t==='globo'){corazones--;sfx.hurt();rotos.push({x:c.x,y:yCanasta,t:40,agua:true});ninaPose='n_rie';poseT=40;}
        else if(c.t==='zapato'){puntos=Math.max(0,puntos-5);lodo=120;beep(150,80,.2,'sawtooth',.05);ninaPose='n_rie';poseT=40;}
        else{puntos+=tp.valor;atrapadas++;sfx.coin();if(tp.pesada)lento=90;}
      } else if(c.y>piso()-8){
        c.fuera=true;
        if(!tp.malo&&!tp.hueso){corazones--;sfx.romper();rotos.push({x:c.x,y:piso()-6,t:50,color:tp.color});ninaPose='n_rie';poseT=40;bubble=0;}
      }
    }
    cosas=cosas.filter(c=>!c.fuera);
    for(const r of rotos)r.t--;rotos=rotos.filter(r=>r.t>0);
    if(corazones<=0)terminarMinijuego('trastes',puntos,Math.floor(puntos/2),[`🍽 ${atrapadas} trastes salvados`],false);
  }

  function traste(c){
    const tp=TIPOS[c.t];
    cx.save();cx.translate(c.x,c.y);cx.rotate(c.t==='globo'?0:c.rot);
    cx.fillStyle=tp.color;cx.strokeStyle='#555';cx.lineWidth=1.5;
    if(c.t==='plato'){cx.beginPath();cx.ellipse(0,0,16,6,0,0,7);cx.fill();cx.stroke();cx.beginPath();cx.ellipse(0,0,9,3,0,0,7);cx.stroke();}
    else if(c.t==='taza'){cx.fillRect(-8,-9,16,16);cx.strokeRect(-8,-9,16,16);cx.beginPath();cx.arc(10,-1,5,-1.4,1.4);cx.stroke();}
    else if(c.t==='vaso'){cx.globalAlpha=0.8;cx.beginPath();cx.moveTo(-8,-12);cx.lineTo(8,-12);cx.lineTo(6,12);cx.lineTo(-6,12);cx.closePath();cx.fill();cx.stroke();cx.globalAlpha=1;}
    else if(c.t==='olla'){cx.beginPath();cx.rect(-14,-8,28,16);cx.fill();cx.stroke();cx.fillStyle='#37474f';cx.fillRect(-20,-6,6,4);cx.fillRect(14,-6,6,4);cx.fillRect(-6,-11,12,3);}
    else if(c.t==='globo'){cx.beginPath();cx.ellipse(0,0,11,13,0,0,7);cx.fill();cx.stroke();cx.fillStyle='#fff';cx.beginPath();cx.arc(-4,-5,3,0,7);cx.fill();}
    else if(c.t==='zapato'){cx.beginPath();cx.ellipse(2,3,13,6,0,0,7);cx.fill();cx.fillRect(-11,-8,9,10);cx.fillStyle='#3e2723';cx.beginPath();cx.arc(6,2,3,0,7);cx.arc(-3,4,2,0,7);cx.fill();}
    else{cx.beginPath();cx.rect(-7,-3,14,6);cx.fill();cx.stroke();for(const [bx,by] of [[-7,-3],[-7,3],[7,-3],[7,3]]){cx.beginPath();cx.arc(bx,by,3.5,0,7);cx.fill();cx.stroke();}}
    cx.restore();
  }
  function draw(){
    cx.setTransform(dpr,0,0,dpr,0,0);
    // cocina
    cx.fillStyle='#fff3e0';cx.fillRect(0,0,W,H);
    cx.fillStyle='#ffe0b2';for(let x=0;x<W;x+=40)for(let y=repisa()+40;y<piso();y+=40)if(((x+y)/40)%2===0)cx.fillRect(x,y,40,40);
    cx.fillStyle='#8d6e63';cx.fillRect(0,0,W,repisa()-6);                       // alacena
    for(let x=20;x<W;x+=120){cx.fillStyle='#a1887f';cx.fillRect(x,8,100,repisa()-24);cx.fillStyle='#ffd54f';cx.beginPath();cx.arc(x+92,repisa()/2,3,0,7);cx.fill();}
    cx.fillStyle='#5d4037';cx.fillRect(0,repisa()-6,W,8);                       // repisa
    cx.fillStyle='#bcaaa4';cx.fillRect(0,piso(),W,H-piso());
    Personajes.nina(cx,ninaPose,ninaX,repisa()-6,ninaDir,H*0.17);
    for(const r of rotos){
      cx.globalAlpha=Math.min(1,r.t/20);
      if(r.agua){cx.fillStyle='#4fc3f7';for(let i=0;i<6;i++){cx.beginPath();cx.arc(r.x+Math.cos(i)*(50-r.t),r.y-Math.abs(Math.sin(i*2))*(40-r.t*0.6),4,0,7);cx.fill();}}
      else{cx.fillStyle=r.color;cx.strokeStyle='#555';for(let i=0;i<5;i++){const a=i*1.3;cx.beginPath();cx.moveTo(r.x+Math.cos(a)*(54-r.t)*0.6,r.y);
        cx.lineTo(r.x+Math.cos(a)*(54-r.t)*0.6+6,r.y-4);cx.lineTo(r.x+Math.cos(a)*(54-r.t)*0.6+10,r.y+2);cx.closePath();cx.fill();cx.stroke();}}
      cx.globalAlpha=1;
    }
    for(const c of cosas)traste(c);
    if(kx>-40)Personajes.kiara(cx,Math.floor(anim/5)%2?'k_correA':'k_correB',kx,piso(),1,30);
    const mov=Math.abs(objetivoX-jx)>3;
    Personajes.heroe(cx,mov?(Math.floor(anim/6)%2?'caminaA':'caminaB'):'parado',jx,piso(),objetivoX>=jx?1:-1,70);
    // canasta
    const yc=piso()-58;
    cx.fillStyle='#a1662f';cx.beginPath();cx.moveTo(jx-40,yc);cx.lineTo(jx+40,yc);cx.lineTo(jx+32,yc+20);cx.lineTo(jx-32,yc+20);cx.closePath();cx.fill();
    cx.strokeStyle='#6d4321';cx.lineWidth=2;for(let i=-30;i<=30;i+=10){cx.beginPath();cx.moveTo(jx+i,yc+2);cx.lineTo(jx+i*0.85,yc+18);cx.stroke();}
    if(lodo>0){cx.globalAlpha=Math.min(0.6,lodo/100);cx.fillStyle='#4e342e';for(let i=0;i<7;i++){cx.beginPath();cx.arc((i*173)%W,(i*97)%H+30,40,0,7);cx.fill();}cx.globalAlpha=1;}
    cx.textBaseline='middle';cx.textAlign='left';cx.font='bold 18px system-ui,Arial';
    txt('🍽 '+puntos,12,repisa()+22);txt('❤'.repeat(Math.max(0,corazones)),100,repisa()+22);txt('Mejor: '+Progreso.puntaje('trastes'),200,repisa()+22);
    if(kiaraT>0){cx.fillStyle='#ffb74d';cx.fillRect(330,repisa()+16,110*kiaraT/kiaraDura(),10);}
    if(msgT>0){cx.textAlign='center';cx.font='bold 30px system-ui,Arial';txt('¡RÁFAGA!',W/2,H*0.42);cx.textAlign='left';}
    if(avisoT>0){cx.textAlign='center';cx.font='bold 20px system-ui,Arial';cx.globalAlpha=Math.min(1,avisoT/30);
      txt('Mueve el dedo para atrapar los trastes · no atrapes globos ni zapatos',W/2,H*0.5);cx.globalAlpha=1;cx.textAlign='left';}
  }
  return {init,step,draw,toque};
})();
