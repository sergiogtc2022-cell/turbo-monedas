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

  // ---------- personaje (pies en 0); dos estilos que se eligen en Configuración ----------
  // chibi: cabeza casi del tamaño del cuerpo para que la cara tenga espacio. normal: proporciones clásicas.
  // Con foto, la cara se pinta en alta resolución encima del pixel art (ver cabezaHD) para que se distinga.
  const CUERPOS={
    chibi:{cabeza:{y:-19,r:9},torso:-10,tope:-29,montaY:-11,pose:{
      parado:  {p:[[-1,-5,-2,0],[1,-5,2,0]],          b:[[-3,-10,-5,-5],[3,-10,5,-5]]},
      caminaA: {p:[[0,-5,3,0],[0,-5,-3,0]],           b:[[-3,-10,-6,-6],[3,-10,6,-7]]},
      caminaB: {p:[[0,-5,1,-3],[1,-3,1,0],[0,-5,-1,0]],b:[[-3,-10,-2,-5],[3,-10,2,-5]]},
      salto:   {p:[[0,-5,3,-3],[3,-3,1,-1],[0,-5,-2,-2],[-2,-2,-3,0]],b:[[3,-10,10,-22],[-3,-10,-7,-7]],punos:[[11,-24]]},
      cae:     {p:[[-1,-5,-3,0],[1,-5,3,-1]],          b:[[-3,-10,-11,-14],[3,-10,11,-14]]},
      golpe:   {p:[[-1,-5,-3,0],[1,-5,2,0]],           b:[[-3,-10,-9,-8],[3,-10,10,-13]],boca:'o'},
      llama:   {p:[[-1,-5,-2,0],[1,-5,2,0]],           b:[[-3,-10,-5,-5],[3,-10,10,-13],[10,-13,10,-17]]},
      monta:   {p:[[0,-5,4,-4],[4,-4,4,-1]],           b:[[2,-10,7,-7]]},
      victoria:{p:[[-1,-5,-3,0],[1,-5,3,0]],           b:[[-3,-10,-10,-21],[3,-10,10,-21]],punos:[[-11,-23],[11,-23]],boca:'sonrisa'}}},
    normal:{cabeza:{y:-18,r:5},torso:-13,tope:-25,montaY:-12,pose:{
      parado:  {p:[[-1,-6,-2,0],[1,-6,2,0]],          b:[[-3,-12,-4,-7],[3,-12,4,-7]]},
      caminaA: {p:[[0,-6,3,0],[0,-6,-3,0]],           b:[[-3,-12,-5,-8],[3,-12,5,-9]]},
      caminaB: {p:[[0,-6,1,-3],[1,-3,1,0],[0,-6,-1,0]],b:[[-3,-12,-2,-7],[3,-12,2,-7]]},
      salto:   {p:[[0,-6,3,-4],[3,-4,1,-2],[0,-6,-2,-3],[-2,-3,-3,-1]],b:[[2,-12,3,-23],[-3,-12,-5,-9]],punos:[[3,-24]]},
      cae:     {p:[[-1,-6,-3,0],[1,-6,3,-1]],          b:[[-3,-12,-7,-15],[3,-12,7,-15]]},
      golpe:   {p:[[-1,-6,-3,0],[1,-6,2,0]],           b:[[-3,-12,-7,-10],[3,-12,6,-16]],boca:'o'},
      llama:   {p:[[-1,-6,-2,0],[1,-6,2,0]],           b:[[-3,-12,-4,-7],[3,-12,5,-15],[5,-15,3,-17]]},
      monta:   {p:[[0,-6,4,-5],[4,-5,4,-1]],           b:[[2,-12,6,-9]]},
      victoria:{p:[[-1,-6,-3,0],[1,-6,3,0]],           b:[[-3,-12,-5,-20],[3,-12,5,-20]],punos:[[-5,-21],[5,-21]],boca:'sonrisa'}}}
  };
  const cuerpo=()=>CUERPOS[cfg.personaje]||CUERPOS.chibi;
  // Cara preparada: recorte circular, niveles automáticos (estira del 2% al 98% de luz) y más saturación
  let caraLista=null,caraOrigen=null;
  function caraHD(){
    if(!faceCanvas)return null;
    if(caraOrigen===faceCanvas)return caraLista;
    caraOrigen=faceCanvas;
    const n=128,c=document.createElement('canvas');c.width=c.height=n;const g=c.getContext('2d');
    g.beginPath();g.arc(n/2,n/2,n/2,0,7);g.clip();g.drawImage(faceCanvas,0,0,n,n);
    try{
      const im=g.getImageData(0,0,n,n),d=im.data,hist=new Array(256).fill(0);let tot=0;
      for(let i=0;i<d.length;i+=4){if(d[i+3]<128)continue;hist[Math.round(0.299*d[i]+0.587*d[i+1]+0.114*d[i+2])]++;tot++;}
      let lo=0,hi=255,acc=0;
      for(let v=0;v<256;v++){acc+=hist[v];if(acc>=tot*0.02){lo=v;break;}}
      acc=0;for(let v=255;v>=0;v--){acc+=hist[v];if(acc>=tot*0.02){hi=v;break;}}
      const k=255/Math.max(40,hi-lo),SAT=1.25;
      for(let i=0;i<d.length;i+=4){
        if(!d[i+3])continue;
        let r=(d[i]-lo)*k,gg=(d[i+1]-lo)*k,b=(d[i+2]-lo)*k;
        const l=0.299*r+0.587*gg+0.114*b;
        d[i]=l+(r-l)*SAT;d[i+1]=l+(gg-l)*SAT;d[i+2]=l+(b-l)*SAT;   // Uint8ClampedArray recorta a 0-255
      }
      g.putImageData(im,0,0);
    }catch(_){}                          // si el navegador no deja leer pixeles, se usa la foto tal cual
    return caraLista=c;
  }
  // Cabezas con foto que se pintan después de ampliar el lienzo de pixeles (coordenadas en pixeles del lienzo bajo)
  let cola=null;
  function capturarCabezas(){cola=[];}
  function dibujarCabezas(ctx,k){
    for(const c of (cola||[]))cabezaHD(ctx,c.x*k,c.y*k,c.r*k,c.dir,c.alpha);
    cola=null;
  }
  function cabezaHD(ctx,x,y,r,dir,alpha){
    const cara=caraHD();if(!cara)return;
    ctx.save();ctx.globalAlpha=alpha;ctx.translate(x,y);if(dir<0)ctx.scale(-1,1);
    ctx.fillStyle=PALETA.k;ctx.beginPath();ctx.arc(0,0,r*1.12,0,7);ctx.fill();   // contorno oscuro estilo pixel art
    ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
    ctx.drawImage(cara,-r,-r,r*2,r*2);
    if(Progreso.equipo('gorra')){ctx.fillStyle='#1565c0';ctx.beginPath();ctx.arc(0,-r*0.25,r*1.05,Math.PI,0);ctx.closePath();ctx.fill();
      ctx.fillRect(r*0.3,-r*0.4,r*1.0,r*0.2);}
    if(Progreso.equipo('lentes')){ctx.fillStyle='rgba(10,10,10,0.92)';ctx.fillRect(-r*0.65,-r*0.22,r*0.55,r*0.32);ctx.fillRect(r*0.1,-r*0.22,r*0.55,r*0.32);
      ctx.fillRect(-r*0.1,-r*0.16,r*0.2,r*0.08);}
    ctx.restore();
  }
  function heroe(g,pose,x,y,dir){
    const foto=Personajes.foto(pose)||(Personajes.tiene('parado')&&Personajes.foto('parado'));
    if(foto){   // foto real convertida a pixeles
      const h=26,w=Math.max(4,Math.round(h*foto.width/foto.height));
      g.save();g.imageSmoothingEnabled=false;g.translate(Math.round(x),Math.round(y));if(dir<0)g.scale(-1,1);
      g.drawImage(foto,-Math.round(w/2),-h,w,h);g.restore();return;
    }
    const C=cuerpo(),m=C.pose[pose]||C.pose.parado,HY=C.cabeza.y,HR=C.cabeza.r,TY=C.torso;
    g.save();g.translate(Math.round(x),Math.round(y));if(dir<0)g.scale(-1,1);
    const lineas=(segs,col,w)=>{for(const s of segs)linea(g,s[0],s[1],s[2],s[3],col,w);};
    // contorno oscuro
    lineas(m.p,PALETA.k,4);lineas(m.b,PALETA.k,4);
    g.fillStyle=PALETA.k;g.fillRect(-4,TY-1,8,-TY-2);
    for(const p of (m.punos||[]))circulo(g,p[0],p[1],3,PALETA.k);
    // colores
    lineas(m.p,'#2038ec',2);
    g.fillStyle='#7c3c00';for(const s of m.p)if(s[3]>=-1)g.fillRect(Math.round(s[2])-1,-1,3,1);
    g.fillStyle='#d82800';g.fillRect(-3,TY,6,-TY-4);
    lineas(m.b,'#f8b878',2);
    for(const p of (m.punos||[]))circulo(g,p[0],p[1],2,'#f8b878');
    if(faceCanvas){
      if(cola)cola.push({x:Math.round(x),y:Math.round(y)+HY,r:HR,dir,alpha:g.globalAlpha});
      else{g.restore();cabezaHD(g,Math.round(x),Math.round(y)+HY,HR,dir,g.globalAlpha);return;}
    } else {
      const k=v=>Math.round(v*HR/9);   // la cara por default se escala con el tamaño de la cabeza
      circulo(g,0,HY,HR+1,PALETA.k);circulo(g,0,HY,HR,'#f8b878');
      g.fillStyle='#5a2e0e';g.fillRect(k(-8),HY+k(-9),k(16),k(5));g.fillRect(k(-9),HY+k(-5),Math.max(2,k(4)),k(6));
      g.fillStyle=PALETA.k;g.fillRect(k(4),HY-1,Math.max(1,k(2)),2);
      if(m.boca==='o')g.fillRect(k(4),HY+k(5),2,2);else if(m.boca==='sonrisa')g.fillRect(k(2),HY+k(5),Math.max(3,k(5)),1);else g.fillRect(k(3),HY+k(5),Math.max(2,k(4)),1);
      if(Progreso.equipo('gorra')){g.fillStyle='#1565c0';g.fillRect(-HR,HY-HR-1,HR*2,k(5)+1);g.fillRect(k(4),HY+k(-6),k(8),2);}
      if(Progreso.equipo('lentes')){g.fillStyle=PALETA.k;g.fillRect(k(1),HY+k(-2),k(8),2);}
    }
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
  return {tiles,sprite,linea,circulo,elipse,heroe,cuerpo,capturarCabezas,dibujarCabezas,kiara,moneda,enemigo,hueso,PALETA};
})();
