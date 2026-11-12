// Merudichis Capuchinis · Nivel 1 en pixel art: mismo mapa y reglas, física estilo plataformas clásicas (caminar, correr,
// medidor P, derrape) y gráficos de 16 pixeles dibujados en baja resolución y ampliados sin suavizar.
'use strict';
const Nivel1Pixel=(()=>{
  let lc=null,lx=null;
  function init(){initGame();modoPixel=true;}
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
    lx.fillStyle='#62a8ff';lx.fillRect(0,0,lw,lh);
    for(let i=0;i<6;i++){const span=lw+80,x=Math.round((((i*150-camL*0.3)%span)+span)%span-40);nube(x,14+(i*23)%45);}
    colinas(camL*0.35,lh-44,24,'#4caf50','#1b5e20');
    colinas(camL*0.6+40,lh-28,16,'#86e04a','#2e7d32');
    const c0=Math.max(0,Math.floor(camL/16)-1),c1=Math.min(COLS-1,c0+Math.ceil(lw/16)+2);
    for(let r=0;r<ROWS;r++)for(let c=c0;c<=c1;c++){const ch=grid[r][c];if(ch!==' '&&ch!=='F')tile(ch,c,r,camL);}
    if(flagCol>=c0-2&&flagCol<=c1+2)meta(camL);
    for(const it of items)PixelArt.hueso(lx,Math.round(it.x/2)-camL,Math.round(it.y/2));
    for(const e of enemies){if(e.x>cam-40&&e.x<cam+vw+40&&(e.alive||e.huye)){PixelArt.enemigo(lx,e,Math.round((e.x+13)/2)-camL,Math.round((e.y+e.h)/2));
      if(e.paralizado>0){lx.fillStyle='#ffeb3b';for(let i=0;i<3;i++){const a=frames*0.12+i*2.1;lx.fillRect(Math.round((e.x+13)/2-camL+Math.cos(a)*6),Math.round((e.y)/2-6+Math.sin(a)*2),2,2);}}}
      else if(!e.alive&&e.dead<30&&e.x>cam-40&&e.x<cam+vw+40){lx.fillStyle='#3a1d4d';lx.fillRect(Math.round((e.x+3)/2)-camL,Math.round((e.y+e.h)/2)-3,12,3);}}
    // Kiara del poder
    if(kiara&&!kiara.montada){const k=kiara;PixelArt.kiara(lx,poseKiara(k),Math.round((k.x+k.w/2)/2)-camL,Math.round((k.y+k.h)/2),k.face,k.modo==='grande'?2:1);
      if(k.ladra>0){lx.fillStyle='#ffffff';const bx=Math.round((k.x+k.w/2)/2)-camL+k.face*12,by=Math.round(k.y/2);for(let i=1;i<=3;i++){const r=i*4+(24-k.ladra)/3;
        for(let a=-0.6;a<=0.6;a+=0.15)lx.fillRect(Math.round(bx+Math.cos(a)*r*k.face),Math.round(by+Math.sin(a)*r),1,1);}}}
    // jugador (cabeza grande estilo chibi)
    const hx=Math.round((P.x+P.w/2)/2)-camL,hy=Math.round((P.y+P.h)/2);
    if(!(P.inv>0&&Math.floor(P.inv/4)%2)){
      if(kiaraMontada()){PixelArt.kiara(lx,poseKiara(kiara),hx,hy,P.face,2);PixelArt.heroe(lx,'monta',hx-P.face*2,hy-11,P.face);}
      else{
        if(P.pm>=6&&Math.abs(P.vx)>5&&Math.floor(frames/3)%2){lx.globalAlpha=0.4;PixelArt.heroe(lx,poseJugador(),hx-P.face*6,hy,P.face);lx.globalAlpha=1;}
        PixelArt.heroe(lx,P.derrape?'golpe':poseJugador(),hx,hy,P.face);
        if(P.derrape&&frames%4===0)parts.push({x:P.x+P.w/2,y:P.y+P.h-2,vx:-P.face*0.5,vy:-0.6,life:14,color:'#e0e0e0',g:0,r:2});
      }
      if(P.aturdido>0){lx.fillStyle='#ffeb3b';for(let i=0;i<3;i++){const a=P.aturdido*0.15+i*2.09;lx.fillRect(Math.round(hx+Math.cos(a)*7),Math.round(hy-31+Math.sin(a)*2),2,2);}}
    }
    for(const p of parts){lx.globalAlpha=Math.min(1,p.life/20);lx.fillStyle=p.color;const s=p.r>4?3:2;lx.fillRect(Math.round(p.x/2)-camL,Math.round(p.y/2),s,s);}
    lx.globalAlpha=1;
    // ampliar sin suavizar
    cx.setTransform(dpr,0,0,dpr,0,0);
    cx.imageSmoothingEnabled=false;
    cx.drawImage(lc,0,0,lw,lh,0,0,lw*2*scale,lh*2*scale);
    cx.imageSmoothingEnabled=true;
    PixelArt.dibujarCabezas(cx,2*scale);   // la cara con foto va en alta resolución, sobre el pixel art
    if(bubble>0)drawSpeech((P.x+P.w/2-cam)*scale,(P.y-30)*scale,bubble);
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
    cx.fillText('NIVEL 1',14,my);
    const pm=Math.floor(P.pm||0);
    for(let i=0;i<6;i++){const x=96+i*14;cx.fillStyle=i<pm?'#ffffff':'#555';cx.beginPath();cx.moveTo(x,my-6);cx.lineTo(x+10,my);cx.lineTo(x,my+6);cx.fill();}
    cx.fillStyle=pm>=6&&Math.floor(frames/6)%2?'#ffd23f':'#555';cx.fillRect(182,my-8,20,16);cx.fillStyle='#000';cx.fillText('P',187,my+1);
    cx.fillStyle='#fff';
    cx.fillText('🪙×'+coins,220,my);cx.fillText('❤×'+lives,300,my);
    const s=Math.floor(frames/60);cx.fillText('⏱'+Math.floor(s/60)+':'+String(s%60).padStart(2,'0'),370,my);
    hudKiara(12);
  }
  return {init,step,draw};
})();
