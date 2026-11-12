// Turbo Monedas · Nivel 1: plataformas 2D
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
  const stairs=(c,n)=>{for(let i=0;i<n;i++)for(let k=1;k<=i+1;k++)set(c+i,G-k,'B')};

  // Tramo 1: introducción
  ground(0,30);
  coinRow(8,9,6);
  enemy(18);
  plat(21,8,4); coinRow(21,7,4);
  set(27,G,'>');                 // impulso de velocidad
  coinArc(29,8,8,3);             // hueco 31-34
  // Tramo 2: picos y escalera
  ground(35,60);
  set(42,G-1,'^'); set(43,G-1,'^');
  coinArc(41,8,4,2);
  stairs(47,4); coinRow(48,6,3);
  enemy(55); enemy(58);
  plat(62,8,3); coinRow(62,7,3); // hueco 61-65
  // Tramo 3: resorte, checkpoint y carrera
  ground(66,125);
  set(70,G,'S'); for(let r=2;r<=7;r++)set(70,r,'o');
  plat(73,4,6); coinRow(73,3,6);
  set(80,G-1,'C');
  set(85,G,'>');
  coinRow(88,G-1,20);
  enemy(112); enemy(118);
  // Tramo 4: plataformas sobre picos (hueco 126-129)
  ground(130,160);
  for(let c=134;c<=146;c++)set(c,G-1,'^');
  plat(133,9,3); plat(137,7,3); plat(141,5,3); plat(145,7,3);
  coinRow(137,6,3); coinRow(141,4,3); coinRow(145,6,3);
  // Tramo 5: final (hueco 161-163)
  ground(164,214);
  set(166,G,'>');
  coinRow(170,8,8);
  enemy(176); enemy(181); enemy(186);
  stairs(192,5); coinArc(197,4,5,2);
  flagCol=204; set(flagCol,G-1,'F');

  totalCoins=0; for(const row of grid)for(const ch of row)if(ch==='o')totalCoins++;
}
const isSolid=ch=>ch==='#'||ch==='B'||ch==='S'||ch==='>';
function solid(c,r){ if(c<0)return true; if(c>=COLS||r<0||r>=ROWS)return false; return isSolid(grid[r][c]); }

function newPlayer(col){return {x:col*T+4,y:G*T-31,w:22,h:30,vx:0,vy:0,face:1,onGround:false,inv:0,boost:0,coyote:0,jumpBuf:0,jumping:false,anim:0,under:''};}
function initGame(){buildLevel();P=newPlayer(3);coins=0;lives=3;frames=0;checkpoint=3;cam=0;parts=[];}

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
  else if(e.vy<0){const r=Math.floor(e.y/T);for(let c=c0;c<=c1;c++)if(solid(c,r)){e.y=(r+1)*T;e.vy=0;break}}
}
const aabb=(a,b)=>a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;

// ---------- Lógica ----------
function sparkle(x,y,color='#fff59d',n=6){for(let i=0;i<n;i++){const a=Math.random()*6.28,s=1+Math.random()*2.5;parts.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s-1,life:25,color,g:.05,r:3})}}
function hurt(src){
  if(P.inv>0)return;
  if(src==='enemy'){bubble=100;say();}
  if(coins>0){
    const n=Math.min(coins,16);
    for(let i=0;i<n;i++){const a=-Math.PI*(0.1+0.8*Math.random());parts.push({x:P.x+11,y:P.y+10,vx:Math.cos(a)*(2+Math.random()*4)*(Math.random()<.5?-1:1),vy:Math.sin(a)*7,life:70,color:'#ffd23f',g:.3,r:6,coin:true})}
    coins=0; P.inv=120; P.vy=-7; P.vx=-P.face*5; P.jumping=false; sfx.hurt();
  } else die();
}
function die(){
  lives--; sfx.hurt();
  if(lives<=0){state='over';showOverlay();return;}
  P=newPlayer(checkpoint); P.inv=90; cam=Math.max(0,P.x-(W/scale)*0.38);
}
function win(){state='win';sfx.win();showOverlay();}

function step(){
  frames++;
  if(input.jp){P.jumpBuf=8;input.jp=false;}
  const dir=cfg.mode==='auto'?1:(input.r?1:0)-(input.l?1:0);
  const maxV=P.boost>0?13:6.5, acc=P.onGround?0.5:0.32;
  if(dir){ if(Math.sign(P.vx)===-dir&&P.onGround)P.vx+=dir*acc*2.2; else P.vx+=dir*acc; P.face=dir; }
  else if(P.onGround){P.vx*=0.84;if(Math.abs(P.vx)<0.1)P.vx=0;} else P.vx*=0.985;
  if(Math.abs(P.vx)>maxV)P.vx=Math.sign(P.vx)*Math.max(maxV,Math.abs(P.vx)*0.97);
  if(P.boost>0)P.boost--;
  P.coyote=P.onGround?6:P.coyote-1;
  if(P.jumpBuf>0){P.jumpBuf--;
    if(P.coyote>0){P.vy=-11.2-Math.min(Math.abs(P.vx),13)*0.18;P.jumping=true;P.coyote=0;P.jumpBuf=0;P.onGround=false;sfx.jump();}}
  if(P.jumping&&!input.j&&P.vy<-4)P.vy=-4;
  P.vy=Math.min(P.vy+0.6,14);
  moveX(P); moveY(P);
  if(P.onGround){P.jumping=false;
    if(P.under==='S'){P.vy=-17;P.onGround=false;P.coyote=0;springT=10;sfx.spring();}
    else if(P.under==='>'){if(P.boost<60)sfx.boost();P.boost=90;P.vx=Math.max(P.vx,12);P.face=1;}
  }
  P.anim+=Math.abs(P.vx)*0.07;
  if(P.inv>0)P.inv--;
  if(springT>0)springT--;
  if(bubble>0)bubble--;

  // Monedas, picos, checkpoint
  const c0=Math.floor(P.x/T),c1=Math.floor((P.x+P.w)/T),r0=Math.floor(P.y/T),r1=Math.floor((P.y+P.h)/T);
  for(let r=r0;r<=r1;r++)for(let c=c0;c<=c1;c++){
    if(r<0||r>=ROWS||c<0||c>=COLS)continue;
    const ch=grid[r][c];
    if(ch==='o'){grid[r][c]=' ';coins++;sfx.coin();sparkle(c*T+16,r*T+16);}
    else if(ch==='^'){if(aabb(P,{x:c*T+4,y:r*T+12,w:T-8,h:T-12}))hurt();}
    else if(ch==='C'){grid[r][c]='c';checkpoint=c;sfx.check();sparkle(c*T+16,r*T,'#7CFC00',12);}
  }
  if(state!=='play')return;

  // Enemigos
  const vw=W/scale;
  for(const e of enemies){
    if(!e.alive){e.dead++;continue;}
    if(Math.abs(e.x-P.x)>vw+150)continue;
    e.vy=Math.min(e.vy+0.6,14);
    const ox=e.vx; moveX(e); if(e.hitWall)e.vx=-ox;
    moveY(e);
    if(e.onGround){const ahead=e.vx>0?e.x+e.w+2:e.x-2; if(!solid(Math.floor(ahead/T),Math.floor((e.y+e.h+4)/T)))e.vx=-e.vx;}
    if(e.y>ROWS*T+100){e.alive=false;e.dead=99;}
    if(aabb(P,e)){
      if((P.vy>1&&P.y+P.h-e.y<18)||P.boost>0){
        e.alive=false;e.dead=0;sfx.stomp();sparkle(e.x+13,e.y+12,'#d7a6ff',10);
        if(P.boost<=0){P.vy=input.j?-11:-7;P.jumping=input.j;}
      } else hurt('enemy');
    }
    if(state!=='play')return;
  }
  enemies=enemies.filter(e=>e.alive||e.dead<30);

  if(P.y>ROWS*T+40){die();if(state!=='play')return;}
  if(P.x+P.w/2>flagCol*T+14){win();return;}

  const target=P.x+P.w/2-vw*0.38+P.vx*10;
  cam+=(target-cam)*0.1; cam=Math.max(0,Math.min(cam,COLS*T-vw));

  for(const p of parts){p.x+=p.vx;p.y+=p.vy;p.vy+=p.g;p.life--;}
  parts=parts.filter(p=>p.life>0);
}

// ---------- Dibujo del nivel 1 ----------
function drawPlayer(){
  if(P.inv>0&&Math.floor(P.inv/4)%2)return;
  const x=P.x+P.w/2, y=P.y+P.h, f=P.face, sp=Math.abs(P.vx);
  if(P.boost>0){for(let i=1;i<=3;i++){cx.globalAlpha=0.18/i;cx.fillStyle='#ffe066';cx.beginPath();cx.ellipse(x-f*i*12,y-18,14,18,0,0,7);cx.fill();}cx.globalAlpha=1;}
  cx.save();cx.translate(x,y);
  const st=P.onGround?1:Math.max(0.88,Math.min(1.12,1-P.vy*0.012));
  cx.scale(2-st,st);
  const sw=(sp>0.5&&P.onGround)?Math.sin(P.anim)*6:(P.onGround?0:4);
  // bufanda
  cx.strokeStyle='#e53935';cx.lineWidth=5;cx.lineCap='round';cx.beginPath();cx.moveTo(0,-20);
  cx.quadraticCurveTo(-f*(6+sp),-22+Math.sin(frames*0.4)*2,-f*(10+sp*2),-18+Math.sin(frames*0.3+1)*3);cx.stroke();
  // botas
  cx.fillStyle='#ffb300';
  cx.beginPath();cx.ellipse(-5+sw+f*2,-3,6.5,4,0,0,7);cx.ellipse(5-sw+f*2,-3,6.5,4,0,0,7);cx.fill();
  // cuerpo
  cx.fillStyle='#2e9e4f';rr(-10,-20,20,16,6);cx.fill();
  cx.fillStyle='#ffd23f';cx.beginPath();cx.arc(0,-12,3,0,7);cx.fill();
  // brazos
  cx.strokeStyle='#2e9e4f';cx.lineWidth=5;cx.beginPath();
  if(P.onGround){cx.moveTo(-8,-16);cx.lineTo(-11-sw*0.6,-8);cx.moveTo(8,-16);cx.lineTo(11+sw*0.6,-8);}
  else {cx.moveTo(-8,-16);cx.lineTo(-13,-24);cx.moveTo(8,-16);cx.lineTo(13,-24);}
  cx.stroke();
  // cabeza
  drawHead(cx,f*1.5,-33,14,f);
  cx.restore();
}
function drawBubble(){drawSpeech(P.x+P.w/2,P.y-34,bubble);}
function drawEnemy(e){
  const x=e.x+13, by=e.y+e.h;
  if(!e.alive){cx.globalAlpha=Math.max(0,1-e.dead/30);cx.fillStyle='#7b3fa0';cx.beginPath();cx.ellipse(x,by-3,14,4,0,0,7);cx.fill();cx.globalAlpha=1;return;}
  const wob=Math.sin(frames*0.25+e.x)*2;
  cx.fillStyle='#3a1d4d';cx.beginPath();cx.ellipse(x-7+wob,by-2,5,3,0,0,7);cx.ellipse(x+7-wob,by-2,5,3,0,0,7);cx.fill();
  cx.fillStyle='#7b3fa0';cx.beginPath();cx.ellipse(x,by-12,14,11,0,Math.PI,0);cx.lineTo(x+14,by-4);cx.lineTo(x-14,by-4);cx.fill();
  const d=Math.sign(e.vx)*2;
  cx.fillStyle='#fff';cx.beginPath();cx.arc(x-5,by-14,4,0,7);cx.arc(x+5,by-14,4,0,7);cx.fill();
  cx.fillStyle='#111';cx.beginPath();cx.arc(x-5+d,by-13,2,0,7);cx.arc(x+5+d,by-13,2,0,7);cx.fill();
  cx.strokeStyle='#111';cx.lineWidth=2;cx.beginPath();cx.moveTo(x-9,by-20);cx.lineTo(x-2,by-18);cx.moveTo(x+9,by-20);cx.lineTo(x+2,by-18);cx.stroke();
}
function drawTile(ch,c,r){
  const x=c*T,y=r*T;
  if(ch==='#'||ch==='S'||ch==='>'){
    const top=r===0||!isSolid(grid[r-1][c]);
    cx.fillStyle='#b8733a';cx.fillRect(x,y,T,T);
    cx.fillStyle='#9a5d2c';cx.fillRect(x+6,y+14,4,4);cx.fillRect(x+20,y+22,4,4);
    if(top){cx.fillStyle='#4caf50';cx.fillRect(x,y,T,9);cx.fillStyle='#7ddc6b';cx.fillRect(x,y,T,3);}
    if(ch==='S'){const d=springT>0?5:0;
      cx.strokeStyle='#888';cx.lineWidth=2;cx.beginPath();for(let i=0;i<4;i++){cx.moveTo(x+8,y-12+d+i*3);cx.lineTo(x+24,y-10+d+i*3);}cx.stroke();
      cx.fillStyle='#e53935';cx.fillRect(x+3,y-14+d,T-6,5);cx.fillStyle='#555';cx.fillRect(x+5,y-1,T-10,3);}
    if(ch==='>'){cx.fillStyle=Math.floor(frames/8)%2?'#ffeb3b':'#ff9800';
      for(let i=0;i<2;i++){const sx=x+5+i*12;cx.beginPath();cx.moveTo(sx,y+1);cx.lineTo(sx+8,y+4.5);cx.lineTo(sx,y+8);cx.fill();}}
  } else if(ch==='B'){
    cx.fillStyle='#e07b39';cx.fillRect(x,y,T,T);cx.strokeStyle='#8a3f12';cx.lineWidth=2;
    cx.strokeRect(x+1,y+1,T-2,T-2);cx.beginPath();cx.moveTo(x,y+16);cx.lineTo(x+T,y+16);cx.moveTo(x+16,y);cx.lineTo(x+16,y+16);
    cx.moveTo(x+8,y+16);cx.lineTo(x+8,y+T);cx.moveTo(x+24,y+16);cx.lineTo(x+24,y+T);cx.stroke();
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
  for(const e of enemies)if(e.x>cam-40&&e.x<cam+vw+40)drawEnemy(e);
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
}


const Nivel1={init:initGame,step,draw};
