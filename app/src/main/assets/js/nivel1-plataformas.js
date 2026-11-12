// Merudichis Capuchinis · Nivel 1: plataformas 2D (bloques que se rompen con el puño y el poder de Kiara)
'use strict';
// ---------- Nivel ----------
function buildLevel(){
  COLS=215;
  grid=Array.from({length:ROWS},()=>new Array(COLS).fill(' '));
  enemies=[];
  const set=(c,r,ch)=>{if(c>=0&&c<COLS&&r>=0&&r<ROWS)grid[r][c]=ch};
  const ground=(a,b)=>{for(let c=a;c<=b;c++){set(c,G,'#');set(c,G+1,'#')}};
  const plat=(c,r,n)=>{for(let i=0;i<n;i++)set(c+i,r,'B')};
  const coinRow=(c,r,n)=>{for(let i=0;i<n;i++)set(c+i,r,'o')};
  const coinArc=(c,r,n,h)=>{for(let i=0;i<n;i++){const t=i/(n-1);set(c+i,Math.round(r-Math.sin(t*Math.PI)*h),'o')}};
  const enemy=c=>enemies.push({x:c*T+3,y:(G-1)*T+8,w:26,h:24,vx:-1.1,vy:0,alive:true,dead:0,onGround:false});
  const platK=(c,r,n)=>{for(let i=0;i<n;i++)set(c+i,r,'K')};
  const stairs=(c,n)=>{for(let i=0;i<n;i++)for(let k=1;k<=i+1;k++)set(c+i,G-k,'K')};
  // Bloques: B ladrillo (se rompe), Q "?" con moneda, H "?" con el hueso de Kiara, K bloque duro
  const blocks=(c,r,txt)=>{for(let i=0;i<txt.length;i++)if(txt[i]!==' ')set(c+i,r,txt[i]);};

  // Tramo 1: introducción
  ground(0,30);
  coinRow(8,9,6);
  blocks(10,7,'BQBHB');
  enemy(18);
  plat(21,8,4); coinRow(21,7,4);
  set(27,G,'>');                 // impulso de velocidad
  coinArc(29,8,8,3);             // hueco 31-34
  // Tramo 2: picos y escalera
  ground(35,60);
  set(42,G-1,'^'); set(43,G-1,'^');
  coinArc(41,8,4,2);
  stairs(47,4); coinRow(48,6,3);
  blocks(52,7,'QBQ');
  enemy(55); enemy(58);
  platK(62,8,3); coinRow(62,7,3); // hueco 61-65
  // Tramo 3: resorte, checkpoint y carrera
  ground(66,125);
  set(70,G,'S'); for(let r=4;r<=7;r++)set(70,r,'o');
  plat(73,5,6); coinRow(73,4,6);
  set(80,G-1,'C');
  set(85,G,'>');
  coinRow(88,G-1,20);
  blocks(97,7,'BQBH');
  blocks(108,7,'QBBQ');
  enemy(112); enemy(118);
  // Tramo 4: plataformas sobre picos (hueco 126-129)
  ground(130,160);
  for(let c=134;c<=146;c++)set(c,G-1,'^');
  platK(133,9,3); platK(137,7,3); platK(141,5,3); platK(145,7,3);
  coinRow(137,6,3); coinRow(141,4,3); coinRow(145,6,3);
  // Tramo 5: final (hueco 161-163)
  ground(164,214);
  set(166,G,'>');
  blocks(170,7,'BQBHBQBB'); coinRow(170,G-1,8);
  enemy(176); enemy(181); enemy(186);
  stairs(192,5); coinArc(197,4,5,2);
  flagCol=204; set(flagCol,G-1,'F');

  totalCoins=0; for(const row of grid)for(const ch of row)if(ch==='o')totalCoins++;
}
const isSolid=ch=>!!ch&&ch!==' '&&'#BS>KQHUXMm'.includes(ch);   // X: hueso enterrado (nivel 4), M: bloque de maceta (nivel 5)
function solid(c,r){ if(c<0)return true; if(c>=COLS||r<0||r>=ROWS)return false; return isSolid(grid[r][c]); }

function newPlayer(col){return {x:col*T+4,y:G*T-31,w:22,h:30,vx:0,vy:0,face:1,onGround:false,inv:0,boost:0,coyote:0,jumpBuf:0,jumping:false,anim:0,under:'',llama:0,golpeT:0};}
let items=[], bumps={}, winT=0;
let bloqueEspecial=null;
let modoPixel=false, clavePixel='1px', sueloResbaloso=false;   // clavePixel: récord del nivel pixel; hielo en la montaña nevada      // true en la versión pixel art del nivel 1 (física estilo clásico de 8/16 bits)   // el nivel 5 lo usa para que sus bloques suelten macetas
function initGame(){bloqueEspecial=null;buildLevel();P=newPlayer(3);coins=0;lives=vidasIniciales();frames=0;checkpoint=3;cam=0;parts=[];items=[];bumps={};winT=0;kiara=null;kiaraMsg.t=0;}

// ---------- Bloques ----------
// Dar varios puñetazos seguidos a bloques que no se rompen marea al personaje
function golpeDuro(){
  P.golpesDuros=(frames-(P.ultimoGolpe||-999)<150?(P.golpesDuros||0):0)+1;P.ultimoGolpe=frames;
  if(P.golpesDuros>=3){P.golpesDuros=0;P.aturdido=120;sfx.aturdido();Musica.jingle('mareo');}
}
function golpeBloque(c,r){
  if(bloqueEspecial&&bloqueEspecial(c,r))return;
  const ch=grid[r][c], cxp=c*T+16;
  for(const e of enemies)if(e.alive&&Math.abs(e.x+e.w/2-cxp)<24&&Math.abs(e.y+e.h-r*T)<6)ahuyentar(e,e.x+e.w/2>cxp?1:-1);
  if(r>0&&grid[r-1][c]==='o'){grid[r-1][c]=' ';coins++;sfx.coin();sparkle(cxp,r*T-16);}
  if(ch==='B'){
    grid[r][c]=' ';sfx.romper();
    for(let i=0;i<4;i++)parts.push({x:c*T+8+(i%2)*16,y:r*T+8+(i>1?16:0),vx:(i%2?1:-1)*(1.5+Math.random()),vy:-6+(i>1?2:0),life:45,color:'#e07b39',g:0.4,r:5});
  } else if(ch==='Q'){
    grid[r][c]='U';bumps[c+','+r]=8;coins++;sfx.coin();
    parts.push({x:cxp,y:r*T-6,vx:0,vy:-7,life:26,color:'#ffd23f',g:0.5,r:7,coin:true});
  } else if(ch==='H'){
    grid[r][c]='U';bumps[c+','+r]=8;sfx.item();Musica.jingle('poder');
    items.push({t:'hueso',x:c*T+4,y:r*T,w:24,h:14,vx:0,vy:0,dir:1,sale:16});
  } else {
    if(ch==='U'||ch==='K')bumps[c+','+r]=bumps[c+','+r]||4;
    sfx.tock();golpeDuro();
  }
}
function actualizarItems(){
  for(const it of items){
    if(it.sale>0){it.y-=1;it.sale--;continue;}
    it.vx=1.8*it.dir;it.vy=Math.min(it.vy+0.5,12);
    moveX(it);if(it.hitWall)it.dir=-it.dir;
    moveY(it);
    if(aabb(P,it)){it.fuera=true;activarKiara();}
    if(it.y>ROWS*T+40)it.fuera=true;
  }
  items=items.filter(it=>!it.fuera);
  for(const k in bumps)if(--bumps[k]<=0)delete bumps[k];
}

// ---------- Colisiones ----------
function moveX(e){
  e.x+=e.vx; e.hitWall=false;
  const r0=Math.floor(e.y/T), r1=Math.floor((e.y+e.h-0.01)/T);
  if(e.vx>0){const c=Math.floor((e.x+e.w)/T);for(let r=r0;r<=r1;r++)if(solid(c,r)){e.x=c*T-e.w-0.01;e.vx=0;e.hitWall=true;break}}
  else if(e.vx<0){const c=Math.floor(e.x/T);for(let r=r0;r<=r1;r++)if(solid(c,r)){e.x=(c+1)*T+0.01;e.vx=0;e.hitWall=true;break}}
}
function moveY(e){
  e.y+=e.vy; e.onGround=false;
  const c0=Math.floor(e.x/T), c1=Math.floor((e.x+e.w-0.01)/T);
  if(e.vy>0){const r=Math.floor((e.y+e.h)/T);let hit=false,under='#';
    for(let c=c0;c<=c1;c++)if(solid(c,r)){hit=true;const ch=grid[r]&&grid[r][c];if(ch==='S')under='S';else if(ch==='>'&&under!=='S')under='>';}
    if(hit){e.y=r*T-e.h;e.vy=0;e.onGround=true;e.under=under;}}
  else if(e.vy<0){
    const r=Math.floor(e.y/T), mid=e.x+e.w/2;let hitC=-1;
    for(let c=c0;c<=c1;c++)if(solid(c,r)&&(hitC<0||Math.abs(c*T+16-mid)<Math.abs(hitC*T+16-mid)))hitC=c;
    if(hitC>=0){e.y=(r+1)*T;e.vy=0;if(e===P&&r>=0)golpeBloque(hitC,r);}
  }
}
const aabb=(a,b)=>a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;

// ---------- Lógica ----------
function sparkle(x,y,color='#fff59d',n=6){for(let i=0;i<n;i++){const a=Math.random()*6.28,s=1+Math.random()*2.5;parts.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s-1,life:25,color,g:.05,r:3})}}
function hurt(src){
  if(P.inv>0||kiaraMontada())return;
  P.golpeT=30;
  if(src==='enemy'){bubble=100;say();}
  if(coins>0){
    const n=Math.min(coins,16);
    for(let i=0;i<n;i++){const a=-Math.PI*(0.1+0.8*Math.random());parts.push({x:P.x+11,y:P.y+10,vx:Math.cos(a)*(2+Math.random()*4)*(Math.random()<.5?-1:1),vy:Math.sin(a)*7,life:70,color:'#ffd23f',g:.3,r:6,coin:true})}
    coins=0; P.inv=120; P.vy=-7; P.vx=-P.face*5; P.jumping=false; sfx.hurt();
  } else die();
}
function die(){
  lives--; sfx.hurt();
  if(lives<=0){state='over';Musica.parar();Musica.jingle('perder');showOverlay();return;}
  P=newPlayer(checkpoint); P.inv=90; kiara=null; cam=Math.max(0,P.x-(W/scale)*0.38);
}
function win(){
  const seg=frames/60;
  const estrellas=1+(coins>=totalCoins*0.5?1:0)+(seg<120*COLS/215?1:0);   // mapas más largos dan más tiempo
  terminarNivel(modoPixel?clavePixel:1,seg,coins,estrellas,[`🪙 ${coins} de ${totalCoins} monedas`,`❤ ${lives} vidas`]);
}

function fisicaClasica(dir,montada){
  const maxV=P.boost>0?9:(montada?6.5:4.6), acc=P.onGround?0.34:0.24;
  if(dir){ if(Math.sign(P.vx)===-dir&&P.onGround)P.vx+=dir*acc*2.5; else P.vx+=dir*acc; P.face=dir; }
  else if(P.onGround){P.vx*=0.8;if(Math.abs(P.vx)<0.1)P.vx=0;} else P.vx*=0.98;
  if(Math.abs(P.vx)>maxV)P.vx=Math.sign(P.vx)*Math.max(maxV,Math.abs(P.vx)*0.97);
  if(P.boost>0)P.boost--;
  P.coyote=P.onGround?6:P.coyote-1;
  if(P.jumpBuf>0){P.jumpBuf--;
    if(P.coyote>0){P.vy=(montada?-11.8:-10.6)-Math.min(Math.abs(P.vx),9)*0.12;P.jumping=true;P.coyote=0;P.jumpBuf=0;P.onGround=false;sfx.jump();}}
  if(P.jumping&&!input.j&&P.vy<-4)P.vy=-4;
  P.vy=Math.min(P.vy+0.6,12);
}
// Física estilo plataformas clásicas: caminar, correr (al mantener la dirección) y medidor P;
// derrape al cambiar de lado y salto cuya altura depende de cuánto mantienes el botón.
function fisicaP3(dir,montada){
  const suelo=P.onGround;
  if(dir&&dir===P.ultDir)P.holdT=(P.holdT||0)+1;else P.holdT=0;
  P.ultDir=dir;
  const corre=P.holdT>28;
  const MAX_CAMINA=3.0,MAX_CORRE=4.6,MAX_P=6.0;
  if(suelo){if(corre&&Math.abs(P.vx)>=MAX_CORRE-0.3)P.pm=Math.min(6,(P.pm||0)+0.1);else P.pm=Math.max(0,(P.pm||0)-0.05);}
  let max=P.pm>=6?MAX_P:corre?MAX_CORRE:MAX_CAMINA;
  if(montada)max=Math.max(max,5.4);
  if(P.boost>0){max=8;P.boost--;}
  P.derrape=0;
  if(dir){
    const agarre=suelo&&sueloResbaloso?0.45:1;
    if(suelo&&Math.sign(P.vx)===-dir&&Math.abs(P.vx)>1){P.vx+=dir*0.32*agarre;P.derrape=1;}
    else if(Math.abs(P.vx)<max||Math.sign(P.vx)!==dir)P.vx+=dir*(suelo?0.13:0.1)*(corre?1.3:1)*agarre;
    else if(suelo)P.vx-=Math.sign(P.vx)*0.1;
    P.face=dir;
  } else if(suelo){P.vx-=Math.sign(P.vx)*Math.min(Math.abs(P.vx),sueloResbaloso?0.035:0.14);}
  if(Math.abs(P.vx)>max+0.3&&!suelo)P.vx*=0.995;
  P.coyote=suelo?6:P.coyote-1;
  if(P.jumpBuf>0){P.jumpBuf--;
    if(P.coyote>0){P.vy=(montada?-10:-8.6)-Math.abs(P.vx)*0.25;P.jumping=true;P.coyote=0;P.jumpBuf=0;P.onGround=false;sfx.jump();}}
  const g=P.vy<0?(P.resorte?0.55:(P.jumping&&input.j?0.36:1.0)):0.6;
  P.vy=Math.min(P.vy+g,8.5);
}
function step(){
  frames++;
  if(winT>0){                          // festejo en la meta antes de mostrar resultados
    winT--;P.vx=0;P.vy=Math.min(P.vy+0.6,14);moveY(P);
    for(const p of parts){p.x+=p.vx;p.y+=p.vy;p.vy+=p.g;p.life--;}
    if(winT===0)win();
    return;
  }
  if(input.jp){P.jumpBuf=P.aturdido>0?0:8;input.jp=false;}
  let dir=cfg.mode==='auto'?1:(input.r?1:0)-(input.l?1:0);
  if(P.aturdido>0){P.aturdido--;dir=0;}
  const montada=kiaraMontada();
  if(modoPixel)fisicaP3(dir,montada);else fisicaClasica(dir,montada);
  moveX(P); moveY(P);
  if(P.onGround){P.jumping=false;P.resorte=false;
    if(P.under==='S'){P.vy=-15.5;P.onGround=false;P.coyote=0;P.resorte=true;springT=10;sfx.spring();}
    else if(P.under==='>'){if(P.boost<60){sfx.boost();Musica.jingle('turbo');}P.boost=90;P.vx=Math.max(P.vx,8.5);P.face=1;}
  }
  P.anim+=Math.abs(P.vx)*0.07;
  if(P.inv>0)P.inv--;
  if(P.llama>0)P.llama--;
  if(P.golpeT>0)P.golpeT--;
  actualizarItems();
  actualizarKiara();
  if(springT>0)springT--;
  if(bubble>0)bubble--;

  // Monedas, picos, checkpoint
  const c0=Math.floor(P.x/T),c1=Math.floor((P.x+P.w)/T),r0=Math.floor(P.y/T),r1=Math.floor((P.y+P.h)/T);
  for(let r=r0;r<=r1;r++)for(let c=c0;c<=c1;c++){
    if(r<0||r>=ROWS||c<0||c>=COLS)continue;
    const ch=grid[r][c];
    if(ch==='o'){grid[r][c]=' ';coins++;sfx.coin();sparkle(c*T+16,r*T+16);}
    else if(ch==='^'){if(!montada&&aabb(P,{x:c*T+4,y:r*T+12,w:T-8,h:T-12}))hurt();}
    else if(ch==='C'){grid[r][c]='c';checkpoint=c;sfx.check();sparkle(c*T+16,r*T,'#7CFC00',12);}
  }
  if(state!=='play')return;

  // Enemigos
  const vw=W/scale;
  for(const e of enemies){
    if(!e.alive){e.dead++;if(e.huye){e.x+=e.huye.vx;e.y+=e.huye.vy;e.huye.vy+=0.5;}continue;}
    if(Math.abs(e.x-P.x)>vw+150)continue;
    e.vy=Math.min(e.vy+0.6,14);
    if(e.paralizado>0){e.paralizado--;moveY(e);}
    else{
      const ox=e.vx; moveX(e); if(e.hitWall)e.vx=-ox;
      moveY(e);
      if(e.onGround){const ahead=e.vx>0?e.x+e.w+2:e.x-2; if(!solid(Math.floor(ahead/T),Math.floor((e.y+e.h+4)/T)))e.vx=-e.vx;}
    }
    if(e.y>ROWS*T+100){e.alive=false;e.dead=99;}
    if(e.alive&&aabb(P,e)){
      if((P.vy>1&&P.y+P.h-e.y<18)||P.boost>0||e.paralizado>0){
        e.alive=false;e.dead=0;sfx.stomp();sparkle(e.x+13,e.y+12,'#d7a6ff',10);
        if(P.boost<=0){P.vy=input.j?-11:-7;P.jumping=input.j;}
      } else hurt('enemy');
    }
    if(state!=='play')return;
  }
  enemies=enemies.filter(e=>e.alive||e.dead<(e.huye?90:30));

  if(P.y>ROWS*T+40){die();if(state!=='play')return;}
  if(P.x+P.w/2>flagCol*T+14){bajarDeKiara();winT=80;P.vx=0;Musica.parar();Musica.jingle('victoria');return;}

  const target=P.x+P.w/2-vw*0.38+P.vx*10;
  cam+=(target-cam)*0.1; cam=Math.max(0,Math.min(cam,COLS*T-vw));

  for(const p of parts){p.x+=p.vx;p.y+=p.vy;p.vy+=p.g;p.life--;}
  parts=parts.filter(p=>p.life>0);
}

// ---------- Dibujo del nivel 1 ----------
function poseJugador(){
  if(winT>0)return 'victoria';
  if(P.aturdido>0)return 'golpe';
  if(P.llama>0)return 'llama';
  if(P.golpeT>0)return 'golpe';
  if(!P.onGround)return P.vy<0?'salto':'cae';
  if(Math.abs(P.vx)>0.5)return Math.floor(P.anim/2.5)%2?'caminaA':'caminaB';
  return 'parado';
}
function drawPlayer(){
  if(P.inv>0&&Math.floor(P.inv/4)%2)return;
  const x=P.x+P.w/2, y=P.y+P.h, f=P.face;
  if(P.boost>0){for(let i=1;i<=3;i++){cx.globalAlpha=0.18/i;cx.fillStyle='#ffe066';cx.beginPath();cx.ellipse(x-f*i*12,y-22,14,22,0,0,7);cx.fill();}cx.globalAlpha=1;}
  if(kiaraMontada()){dibujarMontados(f);return;}
  Personajes.heroe(cx,poseJugador(),x,y,f,46);
  if(P.aturdido>0)estrellasMareo(x,y-50,P.aturdido);
}
function estrellasMareo(x,y,t){
  cx.fillStyle='#ffeb3b';cx.strokeStyle='#f57f17';cx.lineWidth=1;
  for(let i=0;i<3;i++){
    const a=t*0.15+i*2.09, sx=x+Math.cos(a)*14, sy=y+Math.sin(a)*4;
    cx.beginPath();
    for(let k=0;k<10;k++){const r=k%2?2.2:5.5,an=-Math.PI/2+k*Math.PI/5;cx.lineTo(sx+Math.cos(an)*r,sy+Math.sin(an)*r);}
    cx.closePath();cx.fill();cx.stroke();
  }
}
function drawBubble(){drawSpeech(P.x+P.w/2,P.y-24,bubble);}
function drawItem(it){
  const x=it.x,y=it.y;
  cx.fillStyle='#fff8e1';cx.strokeStyle='#8d6e63';cx.lineWidth=1.5;
  cx.beginPath();cx.rect(x+5,y+4,14,6);cx.fill();cx.stroke();
  for(const [bx,by] of [[x+5,y+4],[x+5,y+10],[x+19,y+4],[x+19,y+10]]){cx.beginPath();cx.arc(bx,by,3.5,0,7);cx.fill();cx.stroke();}
}
function drawEnemyBody(e){
  const x=e.x+13, by=e.y+e.h;
  const wob=e.paralizado>0?0:Math.sin(frames*0.25+e.x)*2;
  cx.fillStyle='#3a1d4d';cx.beginPath();cx.ellipse(x-7+wob,by-2,5,3,0,0,7);cx.ellipse(x+7-wob,by-2,5,3,0,0,7);cx.fill();
  cx.fillStyle=e.paralizado>0?'#9575cd':'#7b3fa0';cx.beginPath();cx.ellipse(x,by-12,14,11,0,Math.PI,0);cx.lineTo(x+14,by-4);cx.lineTo(x-14,by-4);cx.fill();
  const d=Math.sign(e.vx)*2;
  cx.fillStyle='#fff';cx.beginPath();cx.arc(x-5,by-14,4,0,7);cx.arc(x+5,by-14,4,0,7);cx.fill();
  cx.fillStyle='#111';
  if(e.paralizado>0){cx.font='bold 9px Arial';cx.textAlign='center';cx.fillText('x',x-5,by-11);cx.fillText('x',x+5,by-11);cx.textAlign='left';}
  else{cx.beginPath();cx.arc(x-5+d,by-13,2,0,7);cx.arc(x+5+d,by-13,2,0,7);cx.fill();}
  cx.strokeStyle='#111';cx.lineWidth=2;cx.beginPath();cx.moveTo(x-9,by-20);cx.lineTo(x-2,by-18);cx.moveTo(x+9,by-20);cx.lineTo(x+2,by-18);cx.stroke();
  if(e.paralizado>0){
    cx.fillStyle='#ffeb3b';
    for(let i=0;i<3;i++){const a=frames*0.12+i*2.1;cx.beginPath();cx.arc(x+Math.cos(a)*12,by-28+Math.sin(a)*3,2.5,0,7);cx.fill();}
  }
}
function drawEnemy(e){
  const x=e.x+13, by=e.y+e.h;
  if(!e.alive&&e.huye){
    cx.save();cx.translate(x,by-12);cx.rotate(e.dead*0.25);cx.translate(-x,-(by-12));drawEnemyBody(e);cx.restore();return;
  }
  if(!e.alive){cx.globalAlpha=Math.max(0,1-e.dead/30);cx.fillStyle='#7b3fa0';cx.beginPath();cx.ellipse(x,by-3,14,4,0,0,7);cx.fill();cx.globalAlpha=1;return;}
  drawEnemyBody(e);
}
function drawTile(ch,c,r){
  const x=c*T,b=bumps[c+','+r],y=r*T-(b?Math.sin(b/8*Math.PI)*6:0);
  if(ch==='#'||ch==='S'||ch==='>'||ch==='X'){
    const top=r===0||!isSolid(grid[r-1][c]);
    cx.fillStyle='#b8733a';cx.fillRect(x,y,T,T);
    cx.fillStyle='#9a5d2c';cx.fillRect(x+6,y+14,4,4);cx.fillRect(x+20,y+22,4,4);
    if(top){cx.fillStyle='#4caf50';cx.fillRect(x,y,T,9);cx.fillStyle='#7ddc6b';cx.fillRect(x,y,T,3);}
    if(ch==='S'){const d=springT>0?5:0;
      cx.strokeStyle='#888';cx.lineWidth=2;cx.beginPath();for(let i=0;i<4;i++){cx.moveTo(x+8,y-12+d+i*3);cx.lineTo(x+24,y-10+d+i*3);}cx.stroke();
      cx.fillStyle='#e53935';cx.fillRect(x+3,y-14+d,T-6,5);cx.fillStyle='#555';cx.fillRect(x+5,y-1,T-10,3);}
    if(ch==='X'){cx.fillStyle='#8d5a2b';cx.beginPath();cx.ellipse(x+16,y+1,11,5,0,Math.PI,0);cx.fill();
      cx.fillStyle='#6d4321';cx.fillRect(x+10,y-2,2,2);cx.fillRect(x+19,y-3,2,2);}
    if(ch==='>'){cx.fillStyle=Math.floor(frames/8)%2?'#ffeb3b':'#ff9800';
      for(let i=0;i<2;i++){const sx=x+5+i*12;cx.beginPath();cx.moveTo(sx,y+1);cx.lineTo(sx+8,y+4.5);cx.lineTo(sx,y+8);cx.fill();}}
  } else if(ch==='B'){
    cx.fillStyle='#e07b39';cx.fillRect(x,y,T,T);cx.strokeStyle='#8a3f12';cx.lineWidth=2;
    cx.strokeRect(x+1,y+1,T-2,T-2);cx.beginPath();cx.moveTo(x,y+16);cx.lineTo(x+T,y+16);cx.moveTo(x+16,y);cx.lineTo(x+16,y+16);
    cx.moveTo(x+8,y+16);cx.lineTo(x+8,y+T);cx.moveTo(x+24,y+16);cx.lineTo(x+24,y+T);cx.stroke();
  } else if(ch==='K'){
    cx.fillStyle='#9e9e9e';cx.fillRect(x,y,T,T);
    cx.fillStyle='#bdbdbd';cx.fillRect(x,y,T,4);cx.fillRect(x,y,4,T);
    cx.fillStyle='#757575';cx.fillRect(x,y+T-4,T,4);cx.fillRect(x+T-4,y,4,T);
  } else if(ch==='Q'||ch==='H'){
    cx.fillStyle=Math.floor(frames/20)%3===0?'#ffd54f':'#ffc107';cx.fillRect(x,y,T,T);
    cx.strokeStyle='#b8860b';cx.lineWidth=2;cx.strokeRect(x+1,y+1,T-2,T-2);
    cx.fillStyle='#8a5a00';cx.fillRect(x+4,y+4,3,3);cx.fillRect(x+T-7,y+4,3,3);cx.fillRect(x+4,y+T-7,3,3);cx.fillRect(x+T-7,y+T-7,3,3);
    cx.fillStyle='#fff';cx.font='bold 20px Arial';cx.textAlign='center';cx.fillText('?',x+16,y+24);cx.textAlign='left';
  } else if(ch==='U'){
    cx.fillStyle='#8d6e63';cx.fillRect(x,y,T,T);cx.strokeStyle='#5d4037';cx.lineWidth=2;cx.strokeRect(x+1,y+1,T-2,T-2);
    cx.fillStyle='#5d4037';cx.fillRect(x+4,y+4,3,3);cx.fillRect(x+T-7,y+4,3,3);cx.fillRect(x+4,y+T-7,3,3);cx.fillRect(x+T-7,y+T-7,3,3);
  } else if(ch==='^'){
    cx.fillStyle='#cfd8dc';cx.strokeStyle='#607d8b';cx.lineWidth=1.5;
    for(let i=0;i<2;i++){cx.beginPath();cx.moveTo(x+i*16,y+T);cx.lineTo(x+8+i*16,y+10);cx.lineTo(x+16+i*16,y+T);cx.closePath();cx.fill();cx.stroke();}
  } else if(ch==='o'){
    const s=Math.abs(Math.cos(frames*0.08+c*0.5));
    cx.fillStyle='#ffd23f';cx.strokeStyle='#c98a00';cx.lineWidth=2;
    cx.beginPath();cx.ellipse(x+16,y+16,9*s+1.5,11,0,0,7);cx.fill();cx.stroke();
    if(s>0.4){cx.fillStyle='#fff6c4';cx.fillRect(x+14-2*s,y+10,2.5,9);}
  } else if(ch==='C'||ch==='c'){
    cx.fillStyle='#555';cx.fillRect(x+14,y-14,4,T+14);
    cx.fillStyle=ch==='c'?'#43d14b':'#e53935';cx.beginPath();cx.moveTo(x+18,y-14);cx.lineTo(x+32,y-8);cx.lineTo(x+18,y-2);cx.fill();
  } else if(ch==='F'){
    const top=y+T-7*T;
    cx.fillStyle='#eee';cx.fillRect(x+14,top,4,7*T);
    cx.fillStyle='#ffd23f';cx.beginPath();cx.arc(x+16,top,6,0,7);cx.fill();
    const wv=Math.sin(frames*0.12)*3;
    cx.fillStyle='#2e9e4f';cx.beginPath();cx.moveTo(x+18,top+6);cx.quadraticCurveTo(x+34,top+10+wv,x+50,top+14);
    cx.quadraticCurveTo(x+34,top+20-wv,x+18,top+28);cx.fill();
    cx.fillStyle='#ffd23f';cx.font='bold 12px Arial';cx.fillText('META',x+20,top+21);
  }
}
function drawBackground(vw,vh){
  for(let i=0;i<7;i++){
    const span=vw+320, x=(((i*270-cam*0.15)%span)+span)%span-160, y=30+(i*53)%110;
    cx.fillStyle='rgba(255,255,255,.9)';cx.beginPath();cx.ellipse(x,y,38,14,0,0,7);cx.ellipse(x+26,y-8,26,14,0,0,7);cx.ellipse(x-24,y-4,22,11,0,0,7);cx.fill();
  }
  const hill=(par,base,a1,a2,col)=>{cx.fillStyle=col;cx.beginPath();cx.moveTo(0,vh);
    for(let x=0;x<=vw+8;x+=8){const wx=x+cam*par;cx.lineTo(x,base-Math.sin(wx/110)*a1-Math.sin(wx/41)*a2);}cx.lineTo(vw+8,vh);cx.fill();};
  hill(0.25,300,34,10,'#8fd18a');
  hill(0.5,335,22,8,'#5fb55c');
}
function draw(){
  cx.setTransform(dpr,0,0,dpr,0,0);
  const g=cx.createLinearGradient(0,0,0,H);g.addColorStop(0,'#3d9bff');g.addColorStop(1,'#c4e8ff');
  cx.fillStyle=g;cx.fillRect(0,0,W,H);
  if(!P)return;
  const vw=W/scale, vh=ROWS*T;
  cx.setTransform(dpr*scale,0,0,dpr*scale,0,0);
  drawBackground(vw,vh);
  cx.save();cx.translate(-cam,0);
  const c0=Math.max(0,Math.floor(cam/T)-1), c1=Math.min(COLS-1,c0+Math.ceil(vw/T)+3);
  for(let r=0;r<ROWS;r++)for(let c=c0;c<=c1;c++){const ch=grid[r][c];if(ch!==' '&&ch!=='F')drawTile(ch,c,r);}
  if(flagCol>=c0-2&&flagCol<=c1+2)drawTile('F',flagCol,G-1);
  for(const it of items)drawItem(it);
  for(const e of enemies)if(e.x>cam-40&&e.x<cam+vw+40)drawEnemy(e);
  dibujarKiara();
  drawPlayer();
  if(bubble>0)drawBubble();
  for(const p of parts){cx.globalAlpha=Math.min(1,p.life/20);cx.fillStyle=p.color;cx.beginPath();
    if(p.coin)cx.ellipse(p.x,p.y,p.r*Math.abs(Math.cos(p.life*0.3))+1,p.r,0,0,7);else cx.arc(p.x,p.y,p.r,0,7);cx.fill();}
  cx.globalAlpha=1;cx.restore();
  drawHUD();
}
function drawHUD(){
  cx.setTransform(dpr,0,0,dpr,0,0);
  for(const t of touches.values()){
    if(t.role!=='move')continue;
    cx.globalAlpha=.35;cx.fillStyle='#fff';cx.beginPath();cx.arc(t.x0,t.y0,42,0,7);cx.fill();
    cx.globalAlpha=.7;cx.beginPath();cx.arc(t.x0+t.dx*0.6,t.y0,22,0,7);cx.fill();cx.globalAlpha=1;
  }
  const L=12+(parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--sl'))||0);
  cx.font='bold 20px system-ui,Arial';cx.textBaseline='middle';
  cx.fillStyle='#ffd23f';cx.strokeStyle='#c98a00';cx.lineWidth=2;cx.beginPath();cx.ellipse(L+12,24,8,10,0,0,7);cx.fill();cx.stroke();
  txt('× '+coins,L+26,25);
  txt('❤ '+lives,L+100,25);
  const s=Math.floor(frames/60);txt('⏱ '+Math.floor(s/60)+':'+String(s%60).padStart(2,'0'),L+160,25);
  if(H>W&&state==='play'){cx.font='bold 14px system-ui,Arial';txt('↻ Mejor con el celular en horizontal',L,56);}
  hudKiara(L);
}


const Nivel1={init(){initGame();modoPixel=false;sueloResbaloso=false;},step,draw};
