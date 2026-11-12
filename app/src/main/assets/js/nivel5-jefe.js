// Merudichis Capuchinis · Nivel 5: el Zombie Gigante (golpea los bloques de arriba para tirarle macetas; Kiara da la mordida final)
// Usa la cuadrícula, la física y los dibujos de bloques del nivel 1.
'use strict';
const Nivel5=(()=>{
  const ANCHO=26, VEL=[1.4,2.0,2.7], TIRO=[150,110,80];
  let jefe=null, macetas=[], zapatos=[], regen=[], final=null, golpes=0, avisoT=0;

  function build(){
    COLS=ANCHO;
    grid=Array.from({length:ROWS},()=>new Array(COLS).fill(' '));
    enemies=[];
    for(let c=0;c<COLS;c++){grid[G][c]='#';grid[G+1][c]='#';}
    for(let r=0;r<G;r++){grid[r][0]='K';grid[r][COLS-1]='K';}
    for(const c of [4,8,12,16,20])grid[7][c]='M';
    totalCoins=0;flagCol=-99;
  }
  function init(){
    kiara=null;kiaraMsg.t=0;
    build();P=newPlayer(2);coins=0;lives=vidasIniciales();frames=0;checkpoint=2;parts=[];items=[];bumps={};winT=0;
    jefe={x:15*T,y:G*T-84,w:60,h:84,dir:-1,hp:3,flash:0,tiro:120,pausa:0,anim:0};
    macetas=[];zapatos=[];regen=[];final=null;golpes=0;avisoT=240;
    bloqueEspecial=golpeMaceta;
  }
  function golpeMaceta(c,r){
    const ch=grid[r][c];
    if(ch==='M'){
      grid[r][c]='m';bumps[c+','+r]=8;regen.push({c,r,t:300});sfx.item();
      macetas.push({x:c*T+6,y:(r+1)*T,w:20,h:20,vy:1});
      return true;
    }
    if(ch==='m'){bumps[c+','+r]=4;sfx.tock();golpeDuro();return true;}
    return false;
  }
  function herida(){
    if(P.inv>0||final)return;
    golpes++;lives--;sfx.hurt();bubble=100;say();P.golpeT=30;
    if(lives<=0){state='over';Musica.parar();Musica.jingle('perder');showOverlay();return;}
    P.inv=110;P.vy=-7;P.vx=(P.x<jefe.x?-1:1)*5;
  }
  function romperMaceta(m){
    for(let i=0;i<6;i++)parts.push({x:m.x+10,y:m.y+10,vx:(Math.random()-.5)*6,vy:-3-Math.random()*3,life:35,color:i%2?'#a1542b':'#4caf50',g:0.35,r:4});
  }

  function step(){
    frames++;
    if(bubble>0)bubble--;
    if(avisoT>0)avisoT--;
    if(kiaraMsg.t>0)kiaraMsg.t--;
    if(winT>0){
      winT--;P.vx=0;P.vy=Math.min(P.vy+0.6,14);moveY(P);
      if(winT===0){const seg=frames/60;
        terminarNivel(5,seg,coins,1+(seg<75?1:0)+(golpes===0?1:0),['🧟 ¡Venciste al Zombie Gigante!',`❤ ${lives} vidas`]);}
      return;
    }
    // jugador
    if(input.jp){P.jumpBuf=P.aturdido>0?0:8;input.jp=false;}
    let dir=(input.r?1:0)-(input.l?1:0);
    if(P.aturdido>0){P.aturdido--;dir=0;}
    const acc=P.onGround?0.36:0.25;
    if(dir){P.vx+=dir*acc;P.face=dir;} else if(P.onGround){P.vx*=0.84;if(Math.abs(P.vx)<0.1)P.vx=0;} else P.vx*=0.985;
    P.vx=Math.max(-4.8,Math.min(4.8,P.vx));
    P.coyote=P.onGround?6:P.coyote-1;
    if(P.jumpBuf>0){P.jumpBuf--;if(P.coyote>0){P.vy=-10.8;P.jumping=true;P.coyote=0;P.jumpBuf=0;P.onGround=false;sfx.jump();}}
    if(P.jumping&&!input.j&&P.vy<-4)P.vy=-4;
    P.vy=Math.min(P.vy+0.6,14);
    moveX(P);moveY(P);
    if(P.onGround)P.jumping=false;
    P.anim+=Math.abs(P.vx)*0.07;
    if(P.inv>0)P.inv--;
    if(P.golpeT>0)P.golpeT--;
    actualizarItems();
    for(const g of regen)if(--g.t<=0)grid[g.r][g.c]='M';
    regen=regen.filter(g=>g.t>0);

    // macetas que caen
    for(const m of macetas){
      m.vy=Math.min(m.vy+0.6,14);m.y+=m.vy;
      if(!final&&jefe.hp>0&&aabb(m,jefe)){
        m.fuera=true;romperMaceta(m);jefe.hp--;jefe.flash=40;jefe.pausa=50;sfx.stomp();
        kiaraMsg={texto:jefe.hp>0?`¡Le diste! Le quedan ${jefe.hp}`:'¡Ya casi! ¡Kiara, ven!',t:100};
        if(jefe.hp<=0){final={kx:-40,t:0,mordio:false};sfx.silbido();Musica.jingle('kiara');Voces.decir('kiara');}
      } else if(m.y+m.h>=G*T){m.fuera=true;romperMaceta(m);beep(200,80,.1,'square',.05);}
    }
    macetas=macetas.filter(m=>!m.fuera);

    // jefe
    if(jefe.flash>0)jefe.flash--;
    const fase=Math.min(2,3-Math.max(1,jefe.hp));
    if(!final){
      if(jefe.pausa>0)jefe.pausa--;
      else{
        jefe.x+=VEL[fase]*jefe.dir;jefe.anim+=VEL[fase]*0.08;
        if(jefe.x<2*T){jefe.x=2*T;jefe.dir=1;}
        if(jefe.x+jefe.w>(ANCHO-2)*T){jefe.x=(ANCHO-2)*T-jefe.w;jefe.dir=-1;}
        if(--jefe.tiro<=0){
          jefe.tiro=TIRO[fase];jefe.pausa=20;
          const ox=jefe.x+jefe.w/2,oy=jefe.y+20;
          const n=fase===2?2:1;
          for(let i=0;i<n;i++)zapatos.push({x:ox,y:oy,w:16,h:10,vx:Math.max(-6,Math.min(6,(P.x-ox)/55))+(i?1.5:0),vy:-9-i,rot:0});
          beep(300,150,.15,'triangle',.08);
        }
      }
      if(aabb(P,jefe)){
        if(P.vy>1&&P.y+P.h-jefe.y<18){P.vy=-9;beep(500,700,.08,'square',.05);}   // rebota en su cabeza, pero no le hace daño
        else herida();
      }
    } else {
      // Kiara corre a morderle la colita
      final.t++;
      const cola=jefe.dir>0?jefe.x-10:jefe.x+jefe.w+10;
      if(!final.mordio){
        final.kx+=(cola>final.kx?1:-1)*6;
        if(Math.abs(final.kx-cola)<8){final.mordio=true;final.tm=0;sfx.ladrido();jefe.flash=60;}
      } else {
        final.tm++;
        if(final.tm>40){jefe.y-=2;jefe.x+=jefe.dir*-4;}       // sale volando del susto
        if(final.tm===110){winT=60;Musica.parar();Musica.jingle('victoria');}
      }
    }
    for(const z of zapatos){
      z.vy+=0.35;z.x+=z.vx;z.y+=z.vy;z.rot+=0.25;
      if(aabb(P,z)){z.fuera=true;herida();}
      if(z.y>G*T)z.fuera=true;
    }
    zapatos=zapatos.filter(z=>!z.fuera);
    if(state!=='play')return;
    for(const p of parts){p.x+=p.vx;p.y+=p.vy;p.vy+=p.g;p.life--;}
    parts=parts.filter(p=>p.life>0);
  }

  // ---------- Dibujo ----------
  function dibujarJefe(){
    const j=jefe,x=j.x+j.w/2,y=j.y+j.h,d=j.dir;
    if(j.flash>0&&Math.floor(j.flash/4)%2)cx.globalAlpha=0.45;
    cx.save();cx.translate(x,y);cx.scale(d,1);
    // colita
    cx.strokeStyle='#5d7a4f';cx.lineWidth=5;cx.lineCap='round';
    cx.beginPath();cx.moveTo(-26,-30);cx.quadraticCurveTo(-48,-28+Math.sin(frames*0.2)*5,-44,-48);cx.stroke();
    // piernas
    const p=Math.sin(j.anim)*8;
    cx.fillStyle='#3e2f5b';cx.fillRect(-18+p*0.5,-30,14,30);cx.fillRect(4-p*0.5,-30,14,30);
    cx.fillStyle='#222';cx.fillRect(-20+p*0.5,-6,18,6);cx.fillRect(2-p*0.5,-6,18,6);
    // cuerpo con ropa rota
    cx.fillStyle='#4e6e4e';cx.beginPath();cx.moveTo(-28,-30);cx.lineTo(28,-30);cx.lineTo(24,-66);cx.lineTo(-24,-66);cx.closePath();cx.fill();
    cx.fillStyle='#8fae7a';cx.beginPath();cx.moveTo(-10,-30);cx.lineTo(-4,-40);cx.lineTo(2,-30);cx.fill();
    // brazos estirados
    cx.strokeStyle='#7a9a6a';cx.lineWidth=9;cx.beginPath();cx.moveTo(14,-60);cx.lineTo(46,-56);cx.moveTo(14,-50);cx.lineTo(44,-44);cx.stroke();
    // cabeza
    cx.fillStyle='#8fae7a';cx.beginPath();cx.arc(4,-80,20,0,7);cx.fill();
    cx.fillStyle='#d32f2f';cx.beginPath();cx.arc(10,-84,4,0,7);cx.arc(-2,-84,4,0,7);cx.fill();
    cx.fillStyle='#fff';cx.fillRect(0,-72,16,5);cx.strokeStyle='#333';cx.lineWidth=1;
    for(let i=0;i<4;i++){cx.beginPath();cx.moveTo(i*4,-72);cx.lineTo(i*4,-67);cx.stroke();}
    cx.strokeStyle='#333';cx.lineWidth=2;cx.beginPath();cx.moveTo(-12,-94);cx.lineTo(-4,-90);cx.moveTo(-10,-98);cx.lineTo(-6,-88);cx.stroke();
    cx.restore();cx.globalAlpha=1;
  }
  function draw(){
    cx.setTransform(dpr,0,0,dpr,0,0);
    const g=cx.createLinearGradient(0,0,0,H);g.addColorStop(0,'#2c1e4a');g.addColorStop(1,'#7b4a8c');
    cx.fillStyle=g;cx.fillRect(0,0,W,H);
    if(!P||!jefe)return;
    const vw=W/scale,ancho=COLS*T;
    cam=vw>=ancho?(ancho-vw)/2:Math.max(0,Math.min(ancho-vw,P.x-vw/2));
    cx.setTransform(dpr*scale,0,0,dpr*scale,0,0);
    cx.fillStyle='#f5f5dc';cx.beginPath();cx.arc(vw*0.8,70,30,0,7);cx.fill();       // luna
    cx.save();cx.translate(-cam,0);
    for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++){
      const ch=grid[r][c];if(ch===' ')continue;
      if(ch==='M'||ch==='m')bloqueMaceta(ch,c,r);else drawTile(ch,c,r);
    }
    dibujarJefe();
    for(const m of macetas){
      cx.fillStyle='#a1542b';cx.beginPath();cx.moveTo(m.x,m.y+6);cx.lineTo(m.x+20,m.y+6);cx.lineTo(m.x+16,m.y+20);cx.lineTo(m.x+4,m.y+20);cx.fill();
      cx.fillStyle='#4caf50';cx.beginPath();cx.arc(m.x+7,m.y+3,5,0,7);cx.arc(m.x+13,m.y+2,6,0,7);cx.fill();
    }
    for(const z of zapatos){
      cx.save();cx.translate(z.x,z.y);cx.rotate(z.rot);
      cx.fillStyle='#5d4037';cx.beginPath();cx.ellipse(0,0,9,5,0,0,7);cx.fill();cx.fillRect(-9,-6,7,6);
      cx.fillStyle='#eee';cx.fillRect(-9,3,18,2);cx.restore();
    }
    if(!(P.inv>0&&Math.floor(P.inv/4)%2)){
      const pose=winT>0?'victoria':P.aturdido>0||P.golpeT>0?'golpe':!P.onGround?(P.vy<0?'salto':'cae'):Math.abs(P.vx)>0.5?(Math.floor(P.anim/2.5)%2?'caminaA':'caminaB'):'parado';
      Personajes.heroe(cx,pose,P.x+P.w/2,P.y+P.h,P.face,46);
      if(P.aturdido>0)estrellasMareo(P.x+P.w/2,P.y-20,P.aturdido);
    }
    if(final){
      Personajes.kiara(cx,final.mordio?'k_ataca':(Math.floor(final.t/4)%2?'k_correA':'k_correB'),final.kx,G*T,jefe.x+jefe.w/2>final.kx?1:-1,KIARA_ALTO+6);
      if(final.mordio&&final.tm<80){cx.fillStyle='#fff';cx.font='bold 22px system-ui,Arial';cx.textAlign='center';cx.fillText('¡ÑAM!',final.kx,G*T-40);cx.textAlign='left';}
    }
    if(bubble>0)drawSpeech(P.x+P.w/2,P.y-24,bubble);
    for(const p of parts){cx.globalAlpha=Math.min(1,p.life/20);cx.fillStyle=p.color;cx.beginPath();cx.arc(p.x,p.y,p.r,0,7);cx.fill();}
    cx.globalAlpha=1;cx.restore();
    hud();
  }
  function bloqueMaceta(ch,c,r){
    const x=c*T,b=bumps[c+','+r],y=r*T-(b?Math.sin(b/8*Math.PI)*6:0);
    if(ch==='M'){
      cx.fillStyle=Math.floor(frames/20)%3===0?'#ffd54f':'#ffc107';cx.fillRect(x,y,T,T);
      cx.strokeStyle='#b8860b';cx.lineWidth=2;cx.strokeRect(x+1,y+1,T-2,T-2);
      cx.fillStyle='#a1542b';cx.beginPath();cx.moveTo(x+9,y+15);cx.lineTo(x+23,y+15);cx.lineTo(x+20,y+26);cx.lineTo(x+12,y+26);cx.fill();
      cx.fillStyle='#4caf50';cx.beginPath();cx.arc(x+13,y+12,4,0,7);cx.arc(x+19,y+11,5,0,7);cx.fill();
    } else {
      cx.fillStyle='#8d6e63';cx.fillRect(x,y,T,T);cx.strokeStyle='#5d4037';cx.lineWidth=2;cx.strokeRect(x+1,y+1,T-2,T-2);
    }
  }
  function hud(){
    cx.setTransform(dpr,0,0,dpr,0,0);cx.textBaseline='middle';cx.textAlign='left';
    cx.font='bold 18px system-ui,Arial';
    txt('❤ '+lives,12,22);
    txt('⏱ '+fmtSeg(frames/60),80,22);
    const w=180,x=W/2-w/2+30;
    cx.fillStyle='rgba(0,0,0,.4)';cx.fillRect(x,14,w,12);
    cx.fillStyle='#e53935';cx.fillRect(x,14,w*Math.max(0,jefe.hp)/3,12);
    cx.font='bold 13px system-ui,Arial';txt('Zombie Gigante',x,38);
    cx.textAlign='center';
    if(avisoT>0){cx.font='bold 18px system-ui,Arial';cx.globalAlpha=Math.min(1,avisoT/30);
      txt('Golpea con el puño los bloques de arriba cuando el zombie pase debajo',W/2,H*0.3);cx.globalAlpha=1;}
    if(kiaraMsg.t>0){cx.font='bold 20px system-ui,Arial';txt(kiaraMsg.texto,W/2,H*0.22);}
    cx.textAlign='left';
  }

  return {init,step,draw};
})();
