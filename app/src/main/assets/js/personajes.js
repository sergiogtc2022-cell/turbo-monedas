// Merudichis Capuchinis · personajes: modelos por default y fotos reales por pose (tú y Kiara)
'use strict';

const POSES_HEROE=[
  {id:'parado',  nombre:'1 Parado'},
  {id:'caminaA', nombre:'2 Caminando A'},
  {id:'caminaB', nombre:'3 Caminando B'},
  {id:'salto',   nombre:'4 Salto con puño'},
  {id:'cae',     nombre:'5 Cayendo'},
  {id:'golpe',   nombre:'6 Golpeado'},
  {id:'llama',   nombre:'7 Llamando a Kiara'},
  {id:'monta',   nombre:'8 Montando'},
  {id:'victoria',nombre:'9 Victoria'}
];
const POSES_KIARA=[
  {id:'k_parada', nombre:'K1 Parada'},
  {id:'k_correA', nombre:'K2 Corriendo A'},
  {id:'k_correB', nombre:'K3 Corriendo B'},
  {id:'k_ladra',  nombre:'K4 Ladrando'},
  {id:'k_ataca',  nombre:'K5 Atacando'}
];

const Personajes=(()=>{
  // ---------- Modelos dibujados (pies en y=0, mirando a la derecha) ----------
  const HEROE={
    parado:  {p:'M-3 -27 L-4 -2 M3 -27 L4 -2',             b:'M-6 -46 L-9 -30 M6 -46 L9 -30',    h:[0,-60]},
    caminaA: {p:'M0 -27 L10 -2 M0 -27 L-9 -2',             b:'M0 -46 L-9 -34 M0 -46 L10 -36',    h:[1,-60]},
    caminaB: {p:'M0 -27 L5 -14 L2 -2 M0 -27 L-2 -14 L-3 -2',b:'M0 -46 L4 -32 M0 -46 L-4 -32',     h:[0,-60]},
    salto:   {p:'M0 -27 L9 -18 L3 -10 M0 -27 L-7 -16 L-9 -6',b:'M4 -46 L6 -70 M-4 -46 L-11 -38',  h:[-1,-59],punos:[[6,-73]]},
    cae:     {p:'M-2 -27 L-8 -4 M2 -27 L9 -6',             b:'M-5 -46 L-17 -56 M5 -46 L17 -56',  h:[0,-60]},
    golpe:   {p:'M-3 -27 L-7 -2 M3 -27 L6 -2',             b:'M-5 -46 L-16 -40 M5 -46 L14 -58', h:[0,-60],rot:-0.25,boca:'susto'},
    llama:   {p:'M-3 -27 L-4 -2 M3 -27 L4 -2',             b:'M-6 -46 L-9 -30 M5 -46 L11 -52 L7 -57',h:[0,-60],silbido:true},
    monta:   {p:'M0 -27 L10 -22 L10 -8',                   b:'M4 -46 L14 -36',                   h:[1,-60]},
    victoria:{p:'M-3 -27 L-6 -2 M3 -27 L6 -2',             b:'M-5 -46 L-13 -66 M5 -46 L13 -66',  h:[0,-60],punos:[[-13,-69],[13,-69]],boca:'sonrisa'}
  };
  const PATAS_QUIETA='M8 -9 L9 0 M5 -9 L5 0 M-8 -9 L-9 0 M-5 -9 L-5 0';
  const KIARA={
    k_parada:{patas:PATAS_QUIETA},
    k_correA:{patas:'M8 -9 L16 -3 M5 -9 L12 -2 M-8 -9 L-16 -4 M-5 -9 L-12 -2',cola:'M-12 -16 q-10 -2 -9 -10'},
    k_correB:{patas:'M8 -9 L3 -1 M5 -9 L1 -2 M-8 -9 L-2 -1 M-5 -9 L-4 -2'},
    k_ladra: {patas:PATAS_QUIETA,boca:true},
    k_ataca: {patas:'M8 -9 L17 -6 M5 -9 L14 -3 M-8 -9 L-17 -4 M-5 -9 L-14 -1',cola:'M-12 -16 q-10 -2 -9 -10',boca:true,rot:-0.3}
  };
  const ALTO_HEROE=70, ALTO_KIARA=38;   // altura de los modelos en sus propias unidades
  const cache={};
  const path=d=>cache[d]||(cache[d]=new Path2D(d));

  function linea(ctx,d,color,ancho){
    ctx.strokeStyle=color;ctx.lineWidth=ancho;ctx.lineCap='round';ctx.lineJoin='round';ctx.stroke(path(d));
  }
  function modeloHeroe(ctx,pose){
    const m=HEROE[pose]||HEROE.parado;
    if(m.rot)ctx.rotate(m.rot);
    linea(ctx,m.p,'#1e3a8a',5);
    ctx.fillStyle='#c62828';ctx.beginPath();ctx.rect(-7,-50,14,24);ctx.fill();
    linea(ctx,m.b,'#e0ac69',4);
    ctx.fillStyle='#e0ac69';
    for(const [x,y] of (m.punos||[])){ctx.beginPath();ctx.arc(x,y,4.5,0,7);ctx.fill();}
    const [hx,hy]=m.h;
    if(faceCanvas){
      ctx.drawImage(faceCanvas,hx-10,hy-10,20,20);
      ctx.strokeStyle='#3b2416';ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(hx,hy,10,0,7);ctx.stroke();
    } else {
      ctx.fillStyle='#e0ac69';ctx.beginPath();ctx.arc(hx,hy,9,0,7);ctx.fill();
      ctx.fillStyle='#3b2416';ctx.beginPath();ctx.arc(hx,hy-1,9,Math.PI,0);ctx.closePath();ctx.fill();
      ctx.fillStyle='#222';ctx.beginPath();ctx.arc(hx+4,hy+1,1.3,0,7);ctx.fill();
      if(m.boca==='susto'){ctx.fillStyle='#5a1a1a';ctx.beginPath();ctx.arc(hx+5,hy+5,2.2,0,7);ctx.fill();}
      else if(m.boca==='sonrisa'){ctx.strokeStyle='#5a1a1a';ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(hx+3,hy+3,3,0.2,Math.PI-0.2);ctx.stroke();}
    }
    if(m.silbido){ctx.strokeStyle='#555';ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(hx+15,hy+2,3,-1,1);ctx.arc(hx+19,hy+2,6,-1,1);ctx.stroke();}
  }
  function modeloKiara(ctx,pose){
    const m=KIARA[pose]||KIARA.k_parada;
    if(m.rot)ctx.rotate(m.rot);
    linea(ctx,m.cola||'M-12 -16 q-9 -5 -5 -13','#a47148',3);
    linea(ctx,m.patas,'#a47148',3);
    ctx.fillStyle='#d4a373';
    ctx.beginPath();ctx.ellipse(0,-14,13,7,0,0,7);ctx.fill();
    ctx.beginPath();ctx.moveTo(8,-26);ctx.lineTo(8,-38);ctx.lineTo(14,-28);ctx.moveTo(15,-28);ctx.lineTo(21,-38);ctx.lineTo(20,-25);ctx.fill();
    ctx.beginPath();ctx.arc(14,-22,7,0,7);ctx.fill();
    ctx.fillStyle='#e9c9a0';
    if(m.boca){
      ctx.beginPath();ctx.moveTo(17,-21);ctx.lineTo(25,-23);ctx.lineTo(24,-19);ctx.fill();
      ctx.beginPath();ctx.moveTo(17,-18);ctx.lineTo(24,-15);ctx.lineTo(23,-12);ctx.fill();
      ctx.fillStyle='#222';ctx.beginPath();ctx.arc(25,-22,1.4,0,7);ctx.fill();
    } else {
      ctx.beginPath();ctx.ellipse(20,-19,4.5,3,0,0,7);ctx.fill();
      ctx.fillStyle='#222';ctx.beginPath();ctx.arc(24,-20,1.4,0,7);ctx.fill();
    }
    ctx.fillStyle='#222';ctx.beginPath();ctx.arc(16,-24,1.4,0,7);ctx.fill();
    ctx.strokeStyle='#e91e63';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(9,-17);ctx.quadraticCurveTo(13,-14,17,-17);ctx.stroke();
  }

  // ---------- Fotos del jugador ----------
  const fotos={};                       // id de pose → canvas ya recortado
  const SUSTITUTOS={caminaA:['parado'],caminaB:['caminaA','parado'],salto:['cae','parado'],cae:['salto','parado'],
    golpe:['parado'],llama:['parado'],monta:['parado'],victoria:['parado'],
    k_correA:['k_parada'],k_correB:['k_correA','k_parada'],k_ladra:['k_parada'],k_ataca:['k_correA','k_parada']};
  const clave=id=>'mc_foto_'+id;

  function imagenPara(pose,lista){
    if(fotos[pose])return fotos[pose];
    for(const s of (SUSTITUTOS[pose]||[]))if(fotos[s])return fotos[s];
    for(const p of lista)if(fotos[p.id])return fotos[p.id];   // si hay alguna foto, no mezclar con el modelo
    return null;
  }
  function dibujar(ctx,img,modelo,altoModelo,pose,x,y,dir,alto){
    ctx.save();ctx.translate(x,y);if(dir<0)ctx.scale(-1,1);
    if(img){const w=alto*img.width/img.height;ctx.drawImage(img,-w/2,-alto,w,alto);}
    else{const s=alto/altoModelo;ctx.scale(s,s);modelo(ctx,pose);}
    ctx.restore();
  }
  // x,y = centro de los pies; dir = 1 derecha, -1 izquierda; alto en pixeles
  const heroe=(ctx,pose,x,y,dir,alto)=>dibujar(ctx,imagenPara(pose,POSES_HEROE),modeloHeroe,ALTO_HEROE,pose,x,y,dir,alto);
  const kiara=(ctx,pose,x,y,dir,alto)=>dibujar(ctx,imagenPara(pose,POSES_KIARA),modeloKiara,ALTO_KIARA,pose,x,y,dir,alto);

  // Reduce la foto, recorta los bordes transparentes y la guarda
  function procesar(img){
    const maxH=320, s=Math.min(1,maxH/img.height);
    const c=document.createElement('canvas');c.width=Math.max(1,Math.round(img.width*s));c.height=Math.max(1,Math.round(img.height*s));
    const g=c.getContext('2d');g.drawImage(img,0,0,c.width,c.height);
    const d=g.getImageData(0,0,c.width,c.height).data;
    let x0=c.width,y0=c.height,x1=-1,y1=-1;
    for(let y=0;y<c.height;y++)for(let x=0;x<c.width;x++)if(d[(y*c.width+x)*4+3]>16){if(x<x0)x0=x;if(x>x1)x1=x;if(y<y0)y0=y;if(y>y1)y1=y;}
    if(x1<0)return c;
    const r=document.createElement('canvas');r.width=x1-x0+1;r.height=y1-y0+1;
    r.getContext('2d').drawImage(c,x0,y0,r.width,r.height,0,0,r.width,r.height);
    return r;
  }
  function cargarImagen(src){return new Promise((ok,mal)=>{const im=new Image();im.onload=()=>ok(im);im.onerror=mal;im.src=src;});}
  async function guardar(id,file){
    let src=null;
    try{src=URL.createObjectURL(file);}catch(_){}
    let img;
    try{img=await cargarImagen(src||await new Promise((ok,mal)=>{const fr=new FileReader();fr.onload=()=>ok(fr.result);fr.onerror=mal;fr.readAsDataURL(file);}));}
    finally{if(src)URL.revokeObjectURL(src);}
    const c=procesar(img);
    fotos[id]=c;
    try{localStorage.setItem(clave(id),c.toDataURL('image/png'));return true;}
    catch(_){return false;}             // se usa en esta partida pero no se pudo guardar (memoria llena)
  }
  function quitar(id){delete fotos[id];try{localStorage.removeItem(clave(id))}catch(_){}}
  const tiene=id=>!!fotos[id];
  for(const p of POSES_HEROE.concat(POSES_KIARA)){
    try{const d=localStorage.getItem(clave(p.id));if(d)cargarImagen(d).then(im=>{fotos[p.id]=im;}).catch(()=>{});}catch(_){}
  }

  return {heroe,kiara,guardar,quitar,tiene};
})();
