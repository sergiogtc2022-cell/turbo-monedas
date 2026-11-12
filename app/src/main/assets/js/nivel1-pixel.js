// Merudichis Capuchinis · niveles de plataformas en pixel art: mismas reglas que el nivel 1, física estilo plataformas
// clásicas (caminar, correr, medidor P, derrape) y gráficos de 16 pixeles dibujados en baja resolución y ampliados sin suavizar.
// crearNivelPixel arma cada nivel con su mapa, su temática (colores, fondo, adornos) y su título.
'use strict';
const TEMAS_PIXEL={
  pradera:{cielo:['#62a8ff'],nubes:true,colinas:[['#4caf50','#1b5e20'],['#86e04a','#2e7d32']],colores:{}},
  desierto:{cielo:['#ffd28a','#ffb36b','#ff9a5a'],sol:'#fff3b0',colinas:[['#e8b46a','#9a6a2a'],['#f3cf8a','#b0803a']],cactus:true,
    colores:{g:'#f0d080',G:'#fff0b0',d:'#e0b060',D:'#b8863b',b:'#d08a3a',B:'#f3c27a',m:'#7a4a14',p:'#d0661c',P:'#5a2a08'}},
  cueva:{cielo:['#1a1630','#221c3d'],cristales:true,colinas:[['#2c2747','#120f22'],['#3a3460','#1a1630']],oscuro:true,
    colores:{g:'#6a6a9a',G:'#9a9ad0',d:'#4b4b6b',D:'#2e2e48',b:'#3a5ab8',B:'#7ea0ff',m:'#101830',s:'#7a7a9a',S:'#4a4a66',L:'#b0b0d0',p:'#4caf50',P:'#1b4d1e'}},
  nieve:{cielo:['#a8d8ff','#c8e8ff'],nubes:true,nevando:true,colinas:[['#dfeeff','#6a8db0'],['#ffffff','#8fb0d0']],pinos:true,
    colores:{g:'#ffffff',G:'#e8f4ff',d:'#7a8fa8',D:'#566a82',b:'#7fb3e0',B:'#cfe8ff',m:'#2a4a6a',p:'#5c8ad8',P:'#1c3460'}}
};
function crearNivelPixel(opc){
  const tema=TEMAS_PIXEL[opc.tema||'pradera'];
  let lc=null,lx=null;
  function init(){
    initGame();modoPixel=true;clavePixel=opc.clave;sueloResbaloso=!!opc.hielo;
    if(opc.construir){opc.construir();P=newPlayer(3);checkpoint=3;cam=0;items=[];bumps={};}
  }
  function lienzo(lw,lh){
    if(!lc||lc.width!==lw||lc.height!==lh){lc=document.createElement('canvas');lc.width=lw;lc.height=lh;lx=lc.getContext('2d');}
    lx.imageSmoothingEnabled=false;
  }
  function nube(x,y){
    for(const [dx,dy,r] of [[0,0,6],[8,-4,8],[17,0,6]])PixelArt.circulo(lx,x+dx,y+dy,r+1,'#2a3f8f');
    for(const [dx,dy,r] of [[0,0,6],[8,-4,8],[17,0,6]])PixelArt.circulo(lx,x+dx,y+dy,r,'#ffffff');
    lx.fillStyle='#cfe3ff';lx.fillRect(x-5,y+3,27,2);
  }
  function colinas(off,base,alto,col,borde){
    const lw=lc.width,paso=96,ini=Math.floor(off/paso)-1;
    for(let i=ini;i<ini+lw/paso+3;i++){
      const x=Math.round(i*paso-off+((i%2+2)%2)*24),h=alto+((i%3+3)%3)*7,rx=34+((i%2+2)%2)*10;
      PixelArt.elipse(lx,x,base,rx+1,h+1,borde);PixelArt.elipse(lx,x,base,rx,h,col);
      lx.fillStyle=borde;lx.fillRect(x-8,base-h+7,2,2);lx.fillRect(x+6,base-h+12,2,2);lx.fillRect(x-1,base-h+18,2,2);
    }
    lx.fillStyle=col;lx.fillRect(0,base,lw,lc.height-base);
  }
  function tile(ch,c,r,camL){
    const b=bumps[c+','+r];
    const x=c*16-camL,y=r*16-(b?Math.round(Math.sin(b/8*Math.PI)*3):0);
    const arriba=r>0&&isSolid(grid[r-1][c]);
    if(ch==='#'||ch==='S'||ch==='>'){
      lx.drawImage(arriba?PixelArt.tiles['#']():PixelArt.tiles.pasto(),x,y);
      if(ch==='S'){const d=springT>0?2:0;lx.fillStyle='#151515';lx.fillRect(x+1,y-8+d,14,4);lx.fillStyle='#d82800';lx.fillRect(x+2,y-7+d,12,2);
        lx.fillStyle='#9e9e9e';for(let i=0;i<3;i++)lx.fillRect(x+4,y-4+d+i*2-(i?0:0),8,1);}
      if(ch==='>'){lx.fillStyle=Math.floor(frames/8)%2?'#ffeb3b':'#ff9800';for(let i=0;i<2;i++){const sx=x+2+i*7;lx.fillRect(sx,y,1,5);lx.fillRect(sx+1,y+1,1,3);lx.fillRect(sx+2,y+2,1,1);}}
      return;
    }
    if(PixelArt.tiles[ch]){lx.drawImage(PixelArt.tiles[ch](),x,y);
      if((ch==='Q'||ch==='H')&&Math.floor(frames/12)%4===0){lx.fillStyle='#fffbe6';lx.fillRect(x+3,y+3,2,1);}
      return;}
    if(ch==='^'){for(let i=0;i<2;i++){const bx=x+i*8;for(let k=0;k<7;k++){lx.fillStyle='#151515';lx.fillRect(bx+3-Math.floor(k/2)-0,y+9+k,Math.floor(k/2)*2+2,1);
      lx.fillStyle='#cfd8dc';if(k>0)lx.fillRect(bx+4-Math.floor(k/2),y+9+k,Math.max(0,Math.floor(k/2)*2),1);}}return;}
    if(ch==='o'){PixelArt.moneda(lx,x+8,y+8,frames+c*3);return;}
    if(ch==='C'||ch==='c'){lx.fillStyle='#151515';lx.fillRect(x+7,y-7,3,23);lx.fillStyle='#e0e0e0';lx.fillRect(x+8,y-6,1,22);
      lx.fillStyle=ch==='c'?'#43d14b':'#e53935';for(let k=0;k<6;k++)lx.fillRect(x+10,y-6+k,6-k,1);return;}
  }
  function meta(camL){
    const x=flagCol*16-camL,base=(G)*16,top=base-7*16;
    lx.fillStyle='#151515';lx.fillRect(x+6,top,4,7*16);lx.fillStyle='#ffffff';lx.fillRect(x+7,top,2,7*16);
    PixelArt.circulo(lx,x+8,top-1,4,'#151515');PixelArt.circulo(lx,x+8,top-1,3,'#ffd23f');
    const w=Math.round(Math.sin(frames*0.12)*2);
    for(let k=0;k<12;k++){lx.fillStyle='#151515';lx.fillRect(x+10,top+3+k,(12-Math.abs(6-k))*2+1+w,1);
      lx.fillStyle='#2fa82f';lx.fillRect(x+10,top+3+k,(12-Math.abs(6-k))*2+w,1);}
  }

  function draw(){
    cx.setTransform(dpr,0,0,dpr,0,0);
    if(!P)return;
    const vw=W/scale,lw=Math.ceil(vw/2)+1,lh=ROWS*T/2;
    lienzo(lw,lh);
    const camL=Math.round(cam/2);
    PixelArt.capturarCabezas();
    PixelArt.tema(opc.tema||'pradera',tema.colores);
    fondo(lw,lh,camL);
    const c0=Math.max(0,Math.floor(camL/16)-1),c1=Math.min(COLS-1,c0+Math.ceil(lw/16)+2);
    for(let r=0;r<ROWS;r++)for(let c=c0;c<=c1;c++){const ch=grid[r][c];if(ch!==' '&&ch!=='F')tile(ch,c,r,camL);}
    if(tema.oscuro)estalactitas(c0,c1,camL);
    if(flagCol>=c0-2&&flagCol<=c1+2)meta(camL);
    for(const it of items)PixelArt.hueso(lx,Math.round(it.x/2)-camL,Math.round(it.y/2));
    for(const e of enemies){if(e.x>cam-40&&e.x<cam+vw+40&&(e.alive||e.huye)){PixelArt.enemigo(lx,e,Math.round((e.x+13)/2)-camL,Math.round((e.y+e.h)/2));
      if(e.paralizado>0){lx.fillStyle='#ffeb3b';for(let i=0;i<3;i++){const a=frames*0.12+i*2.1;lx.fillRect(Math.round((e.x+13)/2-camL+Math.cos(a)*6),Math.round((e.y)/2-6+Math.sin(a)*2),2,2);}}}
      else if(!e.alive&&e.dead<30&&e.x>cam-40&&e.x<cam+vw+40){lx.fillStyle='#3a1d4d';lx.fillRect(Math.round((e.x+3)/2)-camL,Math.round((e.y+e.h)/2)-3,12,3);}}
    // Kiara del poder
    if(kiara&&!kiara.montada){const k=kiara;PixelArt.kiara(lx,poseKiara(k),Math.round((k.x+k.w/2)/2)-camL,Math.round((k.y+k.h)/2),k.face,k.modo==='grande'?2:1);
      if(k.ladra>0){lx.fillStyle='#ffffff';const bx=Math.round((k.x+k.w/2)/2)-camL+k.face*12,by=Math.round(k.y/2);for(let i=1;i<=3;i++){const r=i*4+(24-k.ladra)/3;
        for(let a=-0.6;a<=0.6;a+=0.15)lx.fillRect(Math.round(bx+Math.cos(a)*r*k.face),Math.round(by+Math.sin(a)*r),1,1);}}}
    // jugador (estilo chibi o normal según Configuración)
    const hx=Math.round((P.x+P.w/2)/2)-camL,hy=Math.round((P.y+P.h)/2);
    if(!(P.inv>0&&Math.floor(P.inv/4)%2)){
      if(kiaraMontada()){PixelArt.kiara(lx,poseKiara(kiara),hx,hy,P.face,2);PixelArt.heroe(lx,'monta',hx-P.face*2,hy+PixelArt.cuerpo().montaY,P.face);}
      else{
        if(P.pm>=6&&Math.abs(P.vx)>5&&Math.floor(frames/3)%2){lx.globalAlpha=0.4;PixelArt.heroe(lx,poseJugador(),hx-P.face*6,hy,P.face);lx.globalAlpha=1;}
        PixelArt.heroe(lx,P.derrape?'golpe':poseJugador(),hx,hy,P.face);
        if(P.derrape&&frames%4===0)parts.push({x:P.x+P.w/2,y:P.y+P.h-2,vx:-P.face*0.5,vy:-0.6,life:14,color:'#e0e0e0',g:0,r:2});
      }
      if(P.aturdido>0){lx.fillStyle='#ffeb3b';for(let i=0;i<3;i++){const a=P.aturdido*0.15+i*2.09;lx.fillRect(Math.round(hx+Math.cos(a)*7),Math.round(hy+PixelArt.cuerpo().tope-2+Math.sin(a)*2),2,2);}}
    }
    for(const p of parts){lx.globalAlpha=Math.min(1,p.life/20);lx.fillStyle=p.color;const s=p.r>4?3:2;lx.fillRect(Math.round(p.x/2)-camL,Math.round(p.y/2),s,s);}
    lx.globalAlpha=1;
    if(tema.nevando){lx.fillStyle='#ffffff';for(let i=0;i<40;i++){const x=((i*53+frames*(0.3+i%3*0.2)-camL*0.5)%lw+lw)%lw,y=((i*37+frames*(0.5+i%4*0.15))%lh);lx.fillRect(Math.round(x),Math.round(y),1+(i%3===0),1+(i%3===0));}}
    // ampliar sin suavizar
    cx.setTransform(dpr,0,0,dpr,0,0);
    cx.imageSmoothingEnabled=false;
    cx.drawImage(lc,0,0,lw,lh,0,0,lw*2*scale,lh*2*scale);
    cx.imageSmoothingEnabled=true;
    PixelArt.dibujarCabezas(cx,2*scale);   // la cara con foto va en alta resolución, sobre el pixel art
    if(bubble>0)drawSpeech((P.x+P.w/2-cam)*scale,(P.y+P.h+PixelArt.cuerpo().tope*2)*scale,bubble);
    hud();
  }
  // Barra inferior estilo consola clásica, con el medidor P (se llena al correr)
  function hud(){
    cx.setTransform(dpr,0,0,dpr,0,0);
    for(const t of touches.values()){
      if(t.role!=='move')continue;
      cx.globalAlpha=.35;cx.fillStyle='#fff';cx.beginPath();cx.arc(t.x0,t.y0,42,0,7);cx.fill();
      cx.globalAlpha=.7;cx.beginPath();cx.arc(t.x0+t.dx*0.6,t.y0,22,0,7);cx.fill();cx.globalAlpha=1;
    }
    const hb=34,y=H-hb;
    cx.fillStyle='#000';cx.fillRect(0,y,W,hb);
    cx.strokeStyle='#f6a06b';cx.lineWidth=2;cx.strokeRect(4,y+3,W-8,hb-6);
    cx.font='bold 15px monospace';cx.textBaseline='middle';cx.textAlign='left';cx.fillStyle='#fff';
    const my=y+hb/2;
    cx.fillText(opc.titulo||'NIVEL 1',14,my);
    const pm=Math.floor(P.pm||0);
    for(let i=0;i<6;i++){const x=112+i*14;cx.fillStyle=i<pm?'#ffffff':'#555';cx.beginPath();cx.moveTo(x,my-6);cx.lineTo(x+10,my);cx.lineTo(x,my+6);cx.fill();}
    cx.fillStyle=pm>=6&&Math.floor(frames/6)%2?'#ffd23f':'#555';cx.fillRect(198,my-8,20,16);cx.fillStyle='#000';cx.fillText('P',203,my+1);
    cx.fillStyle='#fff';
    cx.fillText('🪙×'+coins,236,my);cx.fillText('❤×'+lives,316,my);
    const s=Math.floor(frames/60);cx.fillText('⏱'+Math.floor(s/60)+':'+String(s%60).padStart(2,'0'),386,my);
    hudKiara(12);
  }
  // ---------- fondos y adornos de cada temática ----------
  function fondo(lw,lh,camL){
    const c=tema.cielo;
    for(let i=0;i<c.length;i++){lx.fillStyle=c[i];lx.fillRect(0,Math.floor(i*lh*0.25),lw,lh);}
    if(tema.sol){PixelArt.circulo(lx,Math.round(lw*0.78),34,16,'#ffe08a');PixelArt.circulo(lx,Math.round(lw*0.78),34,13,tema.sol);}
    if(tema.cristales){for(let i=0;i<14;i++){const span=lw+40,x=Math.round((((i*97-camL*0.25)%span)+span)%span-20),y=20+(i*41)%110;
      lx.fillStyle=['#7ef9ff','#ff7ef0','#b28cff'][i%3];lx.globalAlpha=0.5+0.4*Math.sin(frames*0.05+i);lx.fillRect(x,y,2,4);lx.fillRect(x-1,y+1,4,2);lx.globalAlpha=1;}}
    if(tema.nubes)for(let i=0;i<6;i++){const span=lw+80,x=Math.round((((i*150-camL*0.3)%span)+span)%span-40);nube(x,14+(i*23)%45);}
    const [lejos,cerca]=tema.colinas;
    if(tema.pinos)montanas(camL*0.2,lh-40,lejos[0],lejos[1]);else colinas(camL*0.35,lh-44,24,lejos[0],lejos[1]);
    colinas(camL*0.6+40,lh-28,16,cerca[0],cerca[1]);
    if(tema.cactus)for(let i=0;i<8;i++){const span=lw+60,x=Math.round((((i*130-camL*0.6)%span)+span)%span-30);cactus(x,lh-30);}
    if(tema.pinos)for(let i=0;i<9;i++){const span=lw+60,x=Math.round((((i*110-camL*0.6)%span)+span)%span-30);pino(x,lh-28);}
  }
  function montanas(off,base,col,borde){
    const lw=lc.width,paso=120,ini=Math.floor(off/paso)-1;
    for(let i=ini;i<ini+lw/paso+3;i++){const x=Math.round(i*paso-off),h=60+((i%3+3)%3)*14;
      for(let y=0;y<h;y++){const w=Math.round((h-y)*0.9);lx.fillStyle=borde;lx.fillRect(x-w-1,base-y,w*2+2,1);lx.fillStyle=y>h-14?'#ffffff':col;lx.fillRect(x-w,base-y,w*2,1);}}
    lx.fillStyle=col;lx.fillRect(0,base,lw,lc.height-base);
  }
  function cactus(x,base){
    const k='#1e4d1e',v='#3f9b3f';
    lx.fillStyle=k;lx.fillRect(x-3,base-26,8,26);lx.fillRect(x-10,base-18,6,10);lx.fillRect(x+6,base-22,6,12);
    lx.fillStyle=v;lx.fillRect(x-2,base-25,6,25);lx.fillRect(x-9,base-17,4,8);lx.fillRect(x-6,base-11,4,3);lx.fillRect(x+7,base-21,4,10);lx.fillRect(x+4,base-13,4,3);
  }
  function pino(x,base){
    lx.fillStyle='#5d4037';lx.fillRect(x-1,base-6,3,6);
    for(let y=0;y<26;y++){const w=Math.round(2+(y%9)*0.9+y*0.25);lx.fillStyle='#14361f';lx.fillRect(x-w-1,base-32+y,w*2+3,1);lx.fillStyle=y%9<2?'#ffffff':'#2e7d4f';lx.fillRect(x-w,base-32+y,w*2+1,1);}
  }
  function estalactitas(c0,c1,camL){
    for(let c=c0;c<=c1;c++)for(let r=0;r<ROWS-1;r++){
      if(isSolid(grid[r][c])&&grid[r+1][c]===' '&&(c*7+r)%3===0){const x=c*16-camL+5,y=r*16+16;
        for(let k=0;k<7;k++){lx.fillStyle='#120f22';lx.fillRect(x+Math.floor(k/2),y+k,6-Math.floor(k/2)*2,1);}}
    }
  }
  return {init,step,draw};
}
const Nivel1Pixel=crearNivelPixel({clave:'1px',titulo:'NIVEL 1-1',tema:'pradera'});
