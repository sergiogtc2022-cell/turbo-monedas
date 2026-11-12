// Merudichis Capuchinis · mecánicas extra de los niveles pixel del Mundo 1 y 2:
// nadar, viento, plataformas que se mueven o se caen, barras de fuego, puertas que teletransportan y lava que sube.
// Cada nivel las activa con su objeto `mec` (ver crearNivelPixel); el motor del nivel 1 las llama si existen.
'use strict';

// Bajo el agua: se nada con el botón de salto (cada toque es una brazada) y se cae despacio
function fisicaAgua(dir){
  if(dir){P.vx+=dir*0.14;P.face=dir;}else P.vx*=0.94;
  if(Math.abs(P.vx)<0.05)P.vx=0;
  P.vx=Math.max(-2.6,Math.min(2.6,P.vx));
  if(P.jumpBuf>0){P.jumpBuf=0;P.vy=-3.6;sfx.jump();
    parts.push({x:P.x+11,y:P.y,vx:0,vy:-0.6,life:50,color:'#e1f5fe',g:-0.01,r:3});}
  P.vy=Math.min(P.vy+0.09,1.8);
  if(P.y<6){P.y=6;if(P.vy<0)P.vy=0;}
  if(frames%40===0)parts.push({x:P.x+(P.face>0?18:4),y:P.y+4,vx:0,vy:-0.5,life:60,color:'#b3e5fc',g:-0.005,r:2});
}

// Ráfagas de viento en contra (en el cielo): empujan más cuando vas en el aire
function soplarViento(){
  const fuerza=Math.sin(frames/160)>0.35?mec.viento:0;
  mec.rafaga=fuerza;
  if(!fuerza)return;
  P.vx+=P.onGround?fuerza*0.4:fuerza;
  if(frames%3===0){const vw=W/scale;parts.push({x:cam+vw+10,y:camY+Math.random()*VROWS*T,vx:-7,vy:0,life:50,color:'#ffffff',g:0,r:2,viento:true});}
}

// Plataformas móviles. tipo: 'h' de lado a lado, 'v' sube y baja, 'cae' se cae poco después de pisarla
function crearPlat(c,r,n,tipo,rango,vel){
  const pl={x0:c*T,y0:r*T,x:c*T,y:r*T,w:n*T,h:14,tipo,rango:(rango||3)*T,vel:vel||0.02,vy:0,t:0,pisada:false,dx:0,dy:0};
  plats.push(pl);return pl;
}
function moverPlats(){
  for(const pl of plats){
    const ox=pl.x,oy=pl.y;
    if(pl.tipo==='h')pl.x=pl.x0+Math.sin(frames*pl.vel)*pl.rango;
    else if(pl.tipo==='v')pl.y=pl.y0+Math.sin(frames*pl.vel)*pl.rango;
    else if(pl.tipo==='cae'&&pl.pisada){pl.t++;if(pl.t>28){pl.vy=Math.min(pl.vy+0.35,9);pl.y+=pl.vy;}
      if(pl.y>ROWS*T+200&&P.sobre!==pl){pl.y=pl.y0;pl.vy=0;pl.t=0;pl.pisada=false;}}   // vuelve a su lugar
    pl.dx=pl.x-ox;pl.dy=pl.y-oy;
    if(P.sobre===pl){P.x+=pl.dx;P.y+=pl.dy;}
  }
  P.sobre=null;
}
function pisarPlats(pieAntes){
  if(P.vy<0)return;
  for(const pl of plats){
    if(P.x+P.w<=pl.x+2||P.x>=pl.x+pl.w-2)continue;
    if(pieAntes<=pl.y+1+Math.max(0,pl.dy)&&P.y+P.h>=pl.y){
      P.y=pl.y-P.h;P.vy=0;P.onGround=true;P.under='';P.sobre=pl;
      if(pl.tipo==='cae')pl.pisada=true;
      return;
    }
  }
}

// Barras de fuego que giran alrededor de un bloque (castillo)
function crearBarra(c,r,n,vel){barras.push({x:c*T+16,y:r*T+16,n:n||5,ang:0,vel:vel||0.03});}
function tocaBarra(){
  if(P.inv>0)return false;
  for(const b of barras){
    for(let i=1;i<=b.n;i++){const x=b.x+Math.cos(b.ang)*i*13,y=b.y+Math.sin(b.ang)*i*13;
      if(x>P.x-4&&x<P.x+P.w+4&&y>P.y-4&&y<P.y+P.h+4)return true;}
  }
  return false;
}
function girarBarras(){for(const b of barras)b.ang+=b.vel;}

// Puertas: van en parejas en el orden en que aparecen en el mapa (de izquierda a derecha); al entrar sales por la otra
function prepararPuertas(){
  const lista=[];
  for(let c=0;c<COLS;c++)for(let r=0;r<ROWS;r++)if(grid[r][c]==='D')lista.push({c,r});
  mec.puertas=lista;
}
function usarPuertas(){
  const cxp=P.x+P.w/2,cyp=P.y+P.h-4;
  const i=mec.puertas.findIndex(d=>cxp>d.c*T+4&&cxp<d.c*T+T-4&&cyp>d.r*T&&cyp<d.r*T+T);
  if(i<0){P.enPuerta=false;return;}
  if(P.enPuerta)return;
  const d=mec.puertas[i^1];if(!d)return;
  P.x=d.c*T+5;P.y=(d.r+1)*T-P.h-0.01;P.vx=0;P.vy=0;P.enPuerta=true;
  cam=Math.max(0,Math.min(P.x-(W/scale)*0.38,COLS*T-W/scale));
  sfx.item();sparkle(P.x+11,P.y+15,'#fff59d',10);
}

// Lava que sube (torre): nunca queda a más de `margen` debajo de ti
function crearLiquido(vel,margen){liquido={y:ROWS*T+40,vel,margen};}
