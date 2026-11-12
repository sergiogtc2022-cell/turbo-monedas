// Merudichis Capuchinis · Nivel 4: juegas con Kiara (túneles, olfatear, excavar huesos y ladrar a los zombies)
// Usa la cuadrícula, la física y los dibujos de bloques del nivel 1.
'use strict';
const Nivel4=(()=>{
  const HUESOS=5;
  let huesos=0, digT=0, olfaT=0, olfaCool=0, ladraT=0, ladraCool=0, golpes=0, avisoT=0, faltanT=0;

  function build(){
    COLS=170;
    grid=Array.from({length:ROWS},()=>new Array(COLS).fill(' '));
    enemies=[];
    const set=(c,r,ch)=>{if(c>=0&&c<COLS&&r>=0&&r<ROWS)grid[r][c]=ch};
    const ground=(a,b)=>{for(let c=a;c<=b;c++){set(c,G,'#');set(c,G+1,'#')}};
    const techo=(a,b)=>{for(let c=a;c<=b;c++)for(let r=G-4;r<=G-2;r++)set(c,r,'K')};   // túnel bajo: solo cabe Kiara
    const coinRow=(c,r,n)=>{for(let i=0;i<n;i++)set(c+i,r,'o')};
    const coinArc=(c,r,n,h)=>{for(let i=0;i<n;i++){const t=i/(n-1);set(c+i,Math.round(r-Math.sin(t*Math.PI)*h),'o')}};
    const enemy=c=>enemies.push({x:c*T+3,y:(G-1)*T+8,w:26,h:24,vx:-1.1,vy:0,alive:true,dead:0,onGround:false});

    ground(0,39); ground(44,80); ground(85,169);
    set(10,G,'X');                                   // huesos enterrados
    coinRow(5,9,4); enemy(15);
    techo(20,30); set(25,G,'X'); coinRow(21,G-1,3);
    enemy(35); coinArc(38,8,7,3);                    // hueco 40-43
    for(let i=0;i<4;i++)set(46+i,8,'K'); set(48,8,'X'); coinRow(46,7,2);
    enemy(55); enemy(62);
    techo(66,78); set(72,G,'X'); coinRow(68,G-1,3); coinRow(75,G-1,3);
    coinArc(79,8,7,3);                               // hueco 81-84
    set(86,G-1,'C');
    for(let i=0;i<4;i++)for(let k=1;k<=i+1;k++)set(92+i,G-k,'K');
    enemy(100); enemy(110);
    set(120,G,'X'); coinRow(116,8,8);
    enemy(130); enemy(138);
    flagCol=160;
    totalCoins=0;for(const row of grid)for(const ch of row)if(ch==='o')totalCoins++;
  }
  function nuevaKiara(col){return {x:col*T+4,y:G*T-19,w:24,h:18,vx:0,vy:0,face:1,onGround:false,inv:0,coyote:0,jumpBuf:0,jumping:false,anim:0,under:''};}

  function init(){
    bloqueEspecial=null;kiara=null;kiaraMsg.t=0;
    build();P=nuevaKiara(2);coins=0;lives=vidasIniciales();frames=0;checkpoint=2;cam=0;parts=[];items=[];bumps={};winT=0;
    huesos=0;digT=0;olfaT=0;olfaCool=0;ladraT=0;ladraCool=0;golpes=0;avisoT=240;faltanT=0;
  }
  function herida(){
    if(P.inv>0)return;
    golpes++;lives--;sfx.hurt();bubble=100;say();
    if(lives<=0){state='over';Musica.parar();Musica.jingle('perder');showOverlay();return;}
    P.inv=100;P.vy=-7;P.vx=-P.face*5;
  }
  function caer(){
    golpes++;lives--;sfx.hurt();
    if(lives<=0){state='over';Musica.parar();Musica.jingle('perder');showOverlay();return;}
    P=nuevaKiara(checkpoint);P.inv=90;cam=Math.max(0,P.x-(W/scale)*0.38);
  }
  function huesoMasCercano(){
    let mejor=null,dist=1e9;
    for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++)if(grid[r][c]==='X'){
      const d=Math.abs(c*T+16-(P.x+P.w/2))+Math.abs(r*T-(P.y+P.h))*0.5;
      if(d<dist){dist=d;mejor={c,r};}
    }
    return mejor;
  }

  function step(){
    frames++;
    if(bubble>0)bubble--;
    if(avisoT>0)avisoT--;
    if(faltanT>0)faltanT--;
    if(winT>0){
      winT--;P.vx=0;P.vy=Math.min(P.vy+0.6,14);moveY(P);
      if(winT===0){const seg=frames/60;
        terminarNivel(4,seg,coins,1+(seg<150?1:0)+(golpes===0?1:0),[`🦴 ${HUESOS} huesos encontrados`,`🪙 ${coins} de ${totalCoins} monedas`]);}
      return;
    }
    if(input.jp){P.jumpBuf=8;input.jp=false;}
    const dir=(input.r?1:0)-(input.l?1:0), acc=P.onGround?0.38:0.26;
    if(dir){P.vx+=dir*acc;P.face=dir;} else if(P.onGround){P.vx*=0.82;if(Math.abs(P.vx)<0.1)P.vx=0;} else P.vx*=0.985;
    P.vx=Math.max(-5.2,Math.min(5.2,P.vx));
    P.coyote=P.onGround?6:P.coyote-1;
    if(P.jumpBuf>0){P.jumpBuf--;if(P.coyote>0){P.vy=-10.8;P.jumping=true;P.coyote=0;P.jumpBuf=0;P.onGround=false;sfx.jump();}}
    if(P.jumping&&!input.j&&P.vy<-4)P.vy=-4;
    P.vy=Math.min(P.vy+0.6,14);
    moveX(P);moveY(P);
    if(P.onGround)P.jumping=false;
    P.anim+=Math.abs(P.vx)*0.08;
    if(P.inv>0)P.inv--;
    actualizarItems();

    // olfatear (👃 o tecla X) y ladrar (🐶 o tecla C)
    if(olfaCool>0)olfaCool--; if(olfaT>0)olfaT--;
    if(ladraCool>0)ladraCool--; if(ladraT>0)ladraT--;
    if(input.a1&&olfaCool===0){olfaT=180;olfaCool=300;beep(500,900,.25,'sine',.06);}
    if(input.a2&&ladraCool===0){
      ladraCool=240;ladraT=24;sfx.ladrido();
      for(const e of enemies)if(e.alive&&Math.abs(e.x-P.x)<280&&Math.abs(e.y-P.y)<160)e.paralizado=240;
    }

    // excavar: quedarse quieta encima de un hueso enterrado
    const cc=Math.floor((P.x+P.w/2)/T), rr2=Math.floor((P.y+P.h+2)/T);
    if(P.onGround&&Math.abs(P.vx)<1&&grid[rr2]&&grid[rr2][cc]==='X'){
      if(++digT%8===0)parts.push({x:P.x+P.w/2,y:P.y+P.h,vx:(Math.random()-.5)*4,vy:-3-Math.random()*2,life:25,color:'#8d5a2b',g:0.3,r:3});
      if(digT>=40){
        grid[rr2][cc]='#';digT=0;huesos++;sfx.item();Musica.jingle('acierto');
        parts.push({x:cc*T+16,y:rr2*T-10,vx:0,vy:-6,life:35,color:'#fff8e1',g:0.3,r:7});
        kiaraMsg={texto:huesos>=HUESOS?'¡Todos los huesos! Ve con tu dueño':`🦴 ${huesos} de ${HUESOS}`,t:110};
      }
    } else digT=0;

    // monedas y checkpoint
    const c0=Math.floor(P.x/T),c1=Math.floor((P.x+P.w)/T),r0=Math.floor(P.y/T),r1=Math.floor((P.y+P.h)/T);
    for(let r=r0;r<=r1;r++)for(let c=c0;c<=c1;c++){
      if(r<0||r>=ROWS||c<0||c>=COLS)continue;
      const ch=grid[r][c];
      if(ch==='o'){grid[r][c]=' ';coins++;sfx.coin();sparkle(c*T+16,r*T+16);}
      else if(ch==='C'){grid[r][c]='c';checkpoint=c;sfx.check();}
    }

    // zombies
    const vw=W/scale;
    for(const e of enemies){
      if(!e.alive){e.dead++;if(e.huye){e.x+=e.huye.vx;e.y+=e.huye.vy;e.huye.vy+=0.5;}continue;}
      if(Math.abs(e.x-P.x)>vw+150)continue;
      e.vy=Math.min(e.vy+0.6,14);
      if(e.paralizado>0){e.paralizado--;moveY(e);}
      else{const ox=e.vx;moveX(e);if(e.hitWall)e.vx=-ox;moveY(e);
        if(e.onGround){const ahead=e.vx>0?e.x+e.w+2:e.x-2;if(!solid(Math.floor(ahead/T),Math.floor((e.y+e.h+4)/T)))e.vx=-e.vx;}}
      if(e.y>ROWS*T+100){e.alive=false;e.dead=99;}
      if(e.alive&&aabb(P,e)){
        if(e.paralizado>0||(P.vy>1&&P.y+P.h-e.y<14)){ahuyentar(e,P.face);sfx.stomp();if(P.vy>1)P.vy=-7;}
        else herida();
      }
      if(state!=='play')return;
    }
    enemies=enemies.filter(e=>e.alive||e.dead<(e.huye?90:30));
    if(kiaraMsg.t>0)kiaraMsg.t--;

    if(P.y>ROWS*T+40){Voces.decir('vacio');caer();if(state!=='play')return;}
    if(P.x+P.w/2>flagCol*T-24){
      if(huesos>=HUESOS){winT=90;Musica.parar();Musica.jingle('victoria');P.vx=0;return;}
      if(faltanT===0){kiaraMsg={texto:`Te faltan ${HUESOS-huesos} huesos 🦴 (usa 👃 para olfatear)`,t:150};faltanT=200;}
      P.x=flagCol*T-24-P.w/2;P.vx=Math.min(P.vx,0);
    }
    const target=P.x+P.w/2-vw*0.38+P.vx*10;
    cam+=(target-cam)*0.1;cam=Math.max(0,Math.min(cam,COLS*T-vw));
    for(const p of parts){p.x+=p.vx;p.y+=p.vy;p.vy+=p.g;p.life--;}
    parts=parts.filter(p=>p.life>0);
  }

  function pose(){
    if(ladraT>0)return 'k_ladra';
    if(!P.onGround)return 'k_ataca';
    if(digT>0)return Math.floor(digT/5)%2?'k_correA':'k_parada';
    if(Math.abs(P.vx)>0.6)return Math.floor(P.anim/2.5)%2?'k_correA':'k_correB';
    return 'k_parada';
  }
  function draw(){
    cx.setTransform(dpr,0,0,dpr,0,0);
    const g=cx.createLinearGradient(0,0,0,H);g.addColorStop(0,'#ff9e5e');g.addColorStop(1,'#ffe0b2');   // atardecer
    cx.fillStyle=g;cx.fillRect(0,0,W,H);
    if(!P)return;
    const vw=W/scale,vh=ROWS*T;
    cx.setTransform(dpr*scale,0,0,dpr*scale,0,0);
    drawBackground(vw,vh);
    cx.save();cx.translate(-cam,0);
    const c0=Math.max(0,Math.floor(cam/T)-1),c1=Math.min(COLS-1,c0+Math.ceil(vw/T)+3);
    for(let r=0;r<ROWS;r++)for(let c=c0;c<=c1;c++){const ch=grid[r][c];if(ch!==' ')drawTile(ch,c,r);}
    for(const e of enemies)if(e.x>cam-40&&e.x<cam+vw+40)drawEnemy(e);
    // el dueño espera en la meta
    Personajes.heroe(cx,huesos>=HUESOS?'victoria':'llama',flagCol*T+16,G*T,-1,46);
    // rastro del olfato hacia el hueso más cercano
    if(olfaT>0){
      const h=huesoMasCercano();
      if(h){
        const x0=P.x+P.w/2,y0=P.y,x1=h.c*T+16,y1=h.r*T;
        cx.fillStyle='rgba(255,255,255,.85)';
        for(let i=1;i<=8;i++){const t=((i/8)+frames*0.01)%1;cx.globalAlpha=Math.min(1,olfaT/40)*(1-t*0.5);
          cx.beginPath();cx.arc(x0+(x1-x0)*t,y0+(y1-y0)*t-Math.sin(t*Math.PI)*30,3,0,7);cx.fill();}
        cx.globalAlpha=Math.min(1,olfaT/40);cx.strokeStyle='#fff';cx.lineWidth=2;
        cx.beginPath();cx.arc(x1,y1,10+Math.sin(frames*0.2)*4,0,7);cx.stroke();cx.globalAlpha=1;
      }
    }
    if(!(P.inv>0&&Math.floor(P.inv/4)%2))Personajes.kiara(cx,pose(),P.x+P.w/2,P.y+P.h,P.face,KIARA_ALTO+4);
    if(ladraT>0){
      const bx=P.x+P.w/2+P.face*22,by=P.y-4;
      cx.strokeStyle='rgba(255,255,255,.9)';cx.lineWidth=2;
      for(let i=1;i<=3;i++){const r=i*10+(24-ladraT);cx.beginPath();cx.arc(bx,by,r,P.face>0?-0.6:Math.PI-0.6,P.face>0?0.6:Math.PI+0.6);cx.stroke();}
    }
    if(digT>0){cx.fillStyle='#fff';cx.fillRect(P.x,P.y-12,P.w*digT/40,4);}
    if(bubble>0)drawSpeech(P.x+P.w/2,P.y-10,bubble);
    for(const p of parts){cx.globalAlpha=Math.min(1,p.life/20);cx.fillStyle=p.color;cx.beginPath();cx.arc(p.x,p.y,p.r,0,7);cx.fill();}
    cx.globalAlpha=1;cx.restore();
    hud();
  }
  function hud(){
    cx.setTransform(dpr,0,0,dpr,0,0);cx.textBaseline='middle';cx.textAlign='left';
    cx.font='bold 18px system-ui,Arial';
    txt(`🦴 ${huesos}/${HUESOS}`,12,22);
    txt('🪙 '+coins,100,22);
    txt('❤ '+lives,170,22);
    txt('⏱ '+fmtSeg(frames/60),230,22);
    cx.font='bold 14px system-ui,Arial';
    txt(`👃 ${olfaCool>0?Math.ceil(olfaCool/60)+' s':'listo'}   🐶 ${ladraCool>0?Math.ceil(ladraCool/60)+' s':'listo'}`,12,48);
    cx.textAlign='center';
    if(avisoT>0){cx.font='bold 18px system-ui,Arial';cx.globalAlpha=Math.min(1,avisoT/30);
      txt('Busca 5 huesos: 👃 olfatea, quédate quieta encima para excavar, 🐶 ladra a los zombies',W/2,H*0.3);cx.globalAlpha=1;}
    if(kiaraMsg.t>0){cx.font='bold 20px system-ui,Arial';txt(kiaraMsg.texto,W/2,H*0.22);}
    cx.textAlign='left';
  }

  return {init,step,draw};
})();
