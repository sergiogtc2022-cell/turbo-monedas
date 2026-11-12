// Merudichis Capuchinis · pixel art: sprites de bloques y enemigos, y el personaje y Kiara dibujados pixel por pixel
// Se dibuja en un lienzo de baja resolución (un "pixel" = 2 unidades del mundo) que luego se amplía sin suavizar.
'use strict';
const PixelArt=(()=>{
  const PALETA={k:'#151515',w:'#ffffff',g:'#2fa82f',G:'#86e04a',d:'#c8742c',D:'#8a4b14',b:'#c2410c',B:'#f6a06b',m:'#4a1d06',
    y:'#f7b500',Y:'#ffe39a',o:'#b06a00',u:'#9c6a40',U:'#5f3a1c',s:'#a9a9a9',S:'#6b6b6b',L:'#e6e6e6',
    p:'#8a4cc0',P:'#3a1d4d',e:'#ffffff',K:'#000000',r:'#d82800',c:'#ffd23f',C:'#c98a00'};
  const cache={};
  function sprite(nombre,filas){
    if(cache[nombre])return cache[nombre];
    const c=document.createElement('canvas');c.width=16;c.height=16;const g=c.getContext('2d');
    filas.forEach((f,y)=>{f=(f+'................').slice(0,16);
      for(let x=0;x<16;x++){const ch=f[x];if(ch!=='.'&&PALETA[ch]){g.fillStyle=PALETA[ch];g.fillRect(x,y,1,1);}}});
    return cache[nombre]=c;
  }
  const PASTO=[
    'GGGGGGGGGGGGGGGG','GgGGGgGGGGgGGGgG','gggggggggggggggg','gDggggDgggggDggg','DdDDdDdDDdDdDDdD','dddddddddddddddd',
    'ddDdddddddDddddd','dddddddddddddddd','dddddDdddddddDdd','dddddddddddddddd','ddDddddddddddddd','dddddddddDdddddd',
    'dddddddddddddddd','dddDdddddddddDdd','dddddddddddddddd','dddddddddddddddd'];
  const TIERRA=[
    'dddddddddddddddd','ddDdddddddDddddd','dddddddddddddddd','dddddDdddddddDdd','dddddddddddddddd','ddDddddddddddddd',
    'dddddddddDdddddd','dddddddddddddddd','dddDdddddddddDdd','dddddddddddddddd','dddddddDdddddddd','dDdddddddddddddd',
    'dddddddddddddDdd','dddddDdddddddddd','dddddddddddddddd','ddddddddddDddddd'];
  const LADRILLO=[
    'BBBBBBBmBBBBBBBm','bbbbbbbmbbbbbbbm','bbbbbbbmbbbbbbbm','bbbbbbbmbbbbbbbm','bbbbbbbmbbbbbbbm','bbbbbbbmbbbbbbbm',
    'bbbbbbbmbbbbbbbm','mmmmmmmmmmmmmmmm','BBBmBBBBBBBmBBBB','bbbmbbbbbbbmbbbb','bbbmbbbbbbbmbbbb','bbbmbbbbbbbmbbbb',
    'bbbmbbbbbbbmbbbb','bbbmbbbbbbbmbbbb','bbbmbbbbbbbmbbbb','mmmmmmmmmmmmmmmm'];
  const PREGUNTA=[
    'kkkkkkkkkkkkkkkk','kYYYYYYYYYYYYYYk','kYkyyyyyyyyyykok','kYyyyywwwwyyyyok','kYyyywwkkwwkyyok','kYyyyykkyywwkyok',
    'kYyyyyyyywwkkyok','kYyyyyyywwkkyyok','kYyyyyyywwkyyyok','kYyyyyyykkkyyyok','kYyyyyyywwyyyyok','kYyyyyyywwkyyyok',
    'kYyyyyyyykkyyyok','kYkyyyyyyyyyykok','kYoooooooooooook','kkkkkkkkkkkkkkkk'];
  const USADO=[
    'kkkkkkkkkkkkkkkk','kuuuuuuuuuuuuuUk','kuUuuuuuuuuuuUUk','kuuuuuuuuuuuuuUk','kuuuuuuuuuuuuuUk','kuuuuuuuuuuuuuUk',
    'kuuuuuuuuuuuuuUk','kuuuuuuuuuuuuuUk','kuuuuuuuuuuuuuUk','kuuuuuuuuuuuuuUk','kuuuuuuuuuuuuuUk','kuuuuuuuuuuuuuUk',
    'kuuuuuuuuuuuuuUk','kuUuuuuuuuuuuUUk','kUUUUUUUUUUUUUUk','kkkkkkkkkkkkkkkk'];
  const DURO=[
    'LLLLLLLLLLLLLLLk','LsssssssssssssSk','LsssssssssssssSk','LssLLLLLLLLLSsSk','LssLsssssssSSsSk','LssLsssssssSSsSk',
    'LssLsssssssSSsSk','LssLsssssssSSsSk','LssLsssssssSSsSk','LssLsssssssSSsSk','LssLsssssssSSsSk','LssLSSSSSSSSSsSk',
    'LsssssssssssssSk','LsssssssssssssSk','LSSSSSSSSSSSSSSk','kkkkkkkkkkkkkkkk'];
  const ENEMIGO=[
    '................','................','.....kkkkkk.....','...kkppppppkk...','..kppppppppppk..','.kppppppppppppk.',
    '.kpkkppppppkkpk.','.kpeekppppkeepk.','.kpeKkppppkKepk.','.kppkkppppkkppk.','.kppppppppppppk.','.kpppkkkkkkpppk.',
    '.kppppppppppppk.','..kkpppppppppk..','.kPPkkkkkkkkPPk.','.kkkk......kkkk.'];
  const ENEMIGO2=ENEMIGO.slice(0,14).concat(['..kPPkkkkkkPPk..','..kkkk....kkkk..']);
  const MAREADO=ENEMIGO.map((f,i)=>i===7?'.kpkwkppppkwkpk.':i===8?'.kpwkwppppwkwpk.':f);
  const tiles={'#':()=>sprite('tierra',TIERRA),pasto:()=>sprite('pasto',PASTO),B:()=>sprite('ladrillo',LADRILLO),
    Q:()=>sprite('pregunta',PREGUNTA),H:()=>sprite('pregunta',PREGUNTA),U:()=>sprite('usado',USADO),K:()=>sprite('duro',DURO)};

  // ---------- primitivas pixel a pixel (sin suavizado) ----------
  function linea(g,x0,y0,x1,y1,col,w){
    g.fillStyle=col;const n=Math.max(Math.abs(x1-x0),Math.abs(y1-y0),1)|0;
    for(let i=0;i<=n;i++){const x=Math.round(x0+(x1-x0)*i/n-w/2+0.01),y=Math.round(y0+(y1-y0)*i/n-w/2+0.01);g.fillRect(x,y,w,w);}
  }
  function circulo(g,cx,cy,r,col){
    g.fillStyle=col;
    for(let y=-r;y<=r;y++){const dx=Math.floor(Math.sqrt(r*r-y*y)+0.3);g.fillRect(Math.round(cx-dx),Math.round(cy+y),dx*2+1,1);}
  }
  function elipse(g,cx,cy,rx,ry,col){
    g.fillStyle=col;
    for(let y=-ry;y<=ry;y++){const dx=Math.floor(rx*Math.sqrt(Math.max(0,1-(y*y)/(ry*ry)))+0.3);g.fillRect(Math.round(cx-dx),Math.round(cy+y),dx*2+1,1);}
  }

  // ---------- personaje (24 pixeles de alto, pies en 0) ----------
  const POSE={
    parado:  {p:[[-1,-6,-2,0],[1,-6,2,0]],          b:[[-3,-12,-4,-7],[3,-12,4,-7]]},
    caminaA: {p:[[0,-6,3,0],[0,-6,-3,0]],           b:[[-3,-12,-5,-8],[3,-12,5,-9]]},
    caminaB: {p:[[0,-6,1,-3],[1,-3,1,0],[0,-6,-1,0]],b:[[-3,-12,-2,-7],[3,-12,2,-7]]},
    salto:   {p:[[0,-6,3,-4],[3,-4,1,-2],[0,-6,-2,-3],[-2,-3,-3,-1]],b:[[2,-12,3,-23],[-3,-12,-5,-9]],punos:[[3,-24]]},
    cae:     {p:[[-1,-6,-3,0],[1,-6,3,-1]],          b:[[-3,-12,-7,-15],[3,-12,7,-15]]},
    golpe:   {p:[[-1,-6,-3,0],[1,-6,2,0]],           b:[[-3,-12,-7,-10],[3,-12,6,-16]],boca:'o'},
    llama:   {p:[[-1,-6,-2,0],[1,-6,2,0]],           b:[[-3,-12,-4,-7],[3,-12,5,-15],[5,-15,3,-17]]},
    monta:   {p:[[0,-6,4,-5],[4,-5,4,-1]],           b:[[2,-12,6,-9]]},
    victoria:{p:[[-1,-6,-3,0],[1,-6,3,0]],           b:[[-3,-12,-5,-20],[3,-12,5,-20]],punos:[[-5,-21],[5,-21]],boca:'sonrisa'}
  };
  let caraPx=null,caraOrigen=null;
  function caraPixel(){
    if(!faceCanvas)return null;
    if(caraOrigen!==faceCanvas){caraOrigen=faceCanvas;caraPx=document.createElement('canvas');caraPx.width=caraPx.height=11;
      const g=caraPx.getContext('2d');g.beginPath();g.arc(5.5,5.5,5.5,0,7);g.clip();g.drawImage(faceCanvas,0,0,11,11);}
    return caraPx;
  }
  function heroe(g,pose,x,y,dir){
    const foto=Personajes.foto(pose)||(Personajes.tiene('parado')&&Personajes.foto('parado'));
    if(foto){   // foto real convertida a pixeles
      const h=26,w=Math.max(4,Math.round(h*foto.width/foto.height));
      g.save();g.imageSmoothingEnabled=false;g.translate(Math.round(x),Math.round(y));if(dir<0)g.scale(-1,1);
      g.drawImage(foto,-Math.round(w/2),-h,w,h);g.restore();return;
    }
    const m=POSE[pose]||POSE.parado;
    g.save();g.translate(Math.round(x),Math.round(y));if(dir<0)g.scale(-1,1);
    const lineas=(segs,col,w)=>{for(const s of segs)linea(g,s[0],s[1],s[2],s[3],col,w);};
    // contorno oscuro
    lineas(m.p,PALETA.k,4);lineas(m.b,PALETA.k,4);
    g.fillStyle=PALETA.k;g.fillRect(-4,-14,8,10);
    for(const p of (m.punos||[]))circulo(g,p[0],p[1],3,PALETA.k);
    circulo(g,0,-18,6,PALETA.k);
    // colores
    lineas(m.p,'#2038ec',2);
    g.fillStyle='#7c3c00';for(const s of m.p)if(s[3]>=-1)g.fillRect(Math.round(s[2])-1,-1,3,1);
    g.fillStyle='#d82800';g.fillRect(-3,-13,6,8);
    lineas(m.b,'#f8b878',2);
    for(const p of (m.punos||[]))circulo(g,p[0],p[1],2,'#f8b878');
    const cara=caraPixel();
    if(cara){g.drawImage(cara,-5,-23);}
    else{
      circulo(g,0,-18,5,'#f8b878');
      g.fillStyle='#5a2e0e';g.fillRect(-5,-23,10,3);g.fillRect(-5,-21,2,3);
      g.fillStyle=PALETA.k;g.fillRect(2,-19,1,2);
      if(m.boca==='o')g.fillRect(2,-15,2,2);else if(m.boca==='sonrisa'){g.fillRect(1,-15,3,1);}else g.fillRect(2,-15,2,1);
    }
    if(Progreso.equipo('gorra')){g.fillStyle='#1565c0';g.fillRect(-5,-24,10,3);g.fillRect(2,-22,6,2);}
    if(Progreso.equipo('lentes')){g.fillStyle=PALETA.k;g.fillRect(0,-19,5,2);}
    g.restore();
  }

  // ---------- Kiara (f = tamaño: 1 normal, 2 gigante) ----------
  const PATAS={k_parada:[[4,0],[3,0],[-4,0],[-3,0]],k_correA:[[7,-1],[5,0],[-7,-1],[-5,0]],k_correB:[[2,0],[1,0],[-1,0],[-2,0]],
    k_ladra:[[4,0],[3,0],[-4,0],[-3,0]],k_ataca:[[8,-2],[6,-1],[-8,-2],[-6,-1]]};
  function kiara(g,pose,x,y,dir,f){
    const foto=Personajes.foto(pose)||(Personajes.tiene('k_parada')&&Personajes.foto('k_parada'));
    if(foto){const h=13*f,w=Math.max(4,Math.round(h*foto.width/foto.height));
      g.save();g.imageSmoothingEnabled=false;g.translate(Math.round(x),Math.round(y));if(dir<0)g.scale(-1,1);g.drawImage(foto,-Math.round(w/2),-h,w,h);g.restore();return;}
    const pat=PATAS[pose]||PATAS.k_parada, cafe='#d4a373', oscuro='#a47148';
    g.save();g.translate(Math.round(x),Math.round(y));if(dir<0)g.scale(-1,1);
    const dib=(col,extra)=>{
      linea(g,-6*f,-7*f,-9*f,-11*f,col==='k'?PALETA.k:oscuro,(1+extra)*f);
      for(let i=0;i<4;i++){const sx=[4,3,-4,-3][i]*f;linea(g,sx,-4*f,pat[i][0]*f,pat[i][1]*f,col==='k'?PALETA.k:oscuro,(1+extra)*f);}
      elipse(g,0,-6*f,6*f+extra,3*f+extra,col==='k'?PALETA.k:cafe);
      circulo(g,6*f,-9*f,3*f+extra,col==='k'?PALETA.k:cafe);
      linea(g,4*f,-11*f,4*f,-15*f,col==='k'?PALETA.k:cafe,(1+extra)*f);linea(g,7*f,-11*f,8*f,-15*f,col==='k'?PALETA.k:cafe,(1+extra)*f);
    };
    dib('k',1);dib('c',0);
    if(Progreso.equipo('sueter')){elipse(g,1*f,-6*f,4*f,3*f,'#d32f2f');}
    g.fillStyle={rojo:'#e91e63',azul:'#1e88e5',dorado:'#ffc107'}[Progreso.equipo('collar')||'rojo']||'#e91e63';
    g.fillRect(3*f,-8*f,2*f,f);
    g.fillStyle='#e9c9a0';g.fillRect(8*f,-9*f,2*f,2*f);
    g.fillStyle=PALETA.k;g.fillRect(7*f,-10*f,f,f);g.fillRect(10*f,-9*f,f,f);
    if(pose==='k_ladra'||pose==='k_ataca'){g.fillStyle='#8b1a1a';g.fillRect(8*f,-7*f,2*f,f);}
    if(Progreso.equipo('mono')){g.fillStyle='#ec407a';g.fillRect(5*f,-14*f,3*f,2*f);}
    g.restore();
  }

  // ---------- extras ----------
  function moneda(g,x,y,t){
    const w=[5,4,1,4][Math.floor(t/6)%4];
    elipse(g,x,y,w+1,7,PALETA.k);elipse(g,x,y,w,6,PALETA.c);
    if(w>1){g.fillStyle=PALETA.C;g.fillRect(x-w+1,y+4,w*2-1,1);g.fillStyle='#fff8c0';g.fillRect(x-1,y-4,1,5);}
  }
  function enemigo(g,e,x,y){
    const s=e.paralizado>0?sprite('mareado',MAREADO):Math.floor(frames/10)%2?sprite('enemigo',ENEMIGO):sprite('enemigo2',ENEMIGO2);
    g.save();g.translate(Math.round(x),Math.round(y));
    if(!e.alive&&e.huye){g.rotate(e.dead*0.25);}
    if(e.vx>0)g.scale(-1,1);
    g.drawImage(s,-8,-16);g.restore();
  }
  function hueso(g,x,y){
    g.fillStyle=PALETA.k;g.fillRect(x-1,y+1,14,6);circulo(g,x+1,y+2,3,PALETA.k);circulo(g,x+1,y+6,3,PALETA.k);circulo(g,x+11,y+2,3,PALETA.k);circulo(g,x+11,y+6,3,PALETA.k);
    g.fillStyle='#fff8e1';g.fillRect(x,y+2,12,4);circulo(g,x+1,y+2,2,'#fff8e1');circulo(g,x+1,y+6,2,'#fff8e1');circulo(g,x+11,y+2,2,'#fff8e1');circulo(g,x+11,y+6,2,'#fff8e1');
  }
  return {tiles,sprite,linea,circulo,elipse,heroe,kiara,moneda,enemigo,hueso,PALETA};
})();
