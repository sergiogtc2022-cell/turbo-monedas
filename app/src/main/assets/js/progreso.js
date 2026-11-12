// Merudichis Capuchinis · progreso guardado en el celular: monedas del banco, compras, récords y estrellas por nivel
'use strict';
const NOMBRES_NIVEL={1:'Plataformas','1px':'Pradera',px2:'Desierto',px3:'Cueva',px4:'Montaña nevada',
  px5:'La torre',px6:'El cielo',px7:'El castillo',px8:'La mina',px9:'Bajo el agua',px10:'Carrera al atardecer',px11:'Casa de los ratones',
  2:'Gran Premio',3:'La Viborita',4:'Nivel de Kiara',5:'Zombie Gigante'};
// Mundos del selector de niveles (todos abiertos); el orden de ORDEN_NIVELES decide el "siguiente nivel"
const MUNDOS=[
  {nombre:'Mundo 1',icono:'🌳',niveles:['1px','px2','px3','px4']},
  {nombre:'Mundo 2',icono:'🏰',niveles:['px5','px6','px7','px8']},
  {nombre:'Mundo 3',icono:'🌊',niveles:['px9','px10','px11']},
  {nombre:'Clásicos',icono:'⭐',niveles:[1,2,3,4,5]}
];
const ORDEN_NIVELES=MUNDOS.flatMap(m=>m.niveles);
const ETIQUETA_NIVEL={'1px':'1-1',px2:'1-2',px3:'1-3',px4:'1-4',px5:'2-1',px6:'2-2',px7:'2-3',px8:'2-4',px9:'3-1',px10:'3-2',px11:'3-3'};
const etiquetaNivel=n=>ETIQUETA_NIVEL[n]||String(n);
const esPixel=n=>!!ETIQUETA_NIVEL[n];
const siguienteNivel=n=>{const i=ORDEN_NIVELES.indexOf(n);return i>=0&&i<ORDEN_NIVELES.length-1?ORDEN_NIVELES[i+1]:null;};
const TOTAL_NIVELES=5;
const MINIJUEGOS={kiaraman:'Kiara-Man',trastes:'Atrapa los trastes',saltarina:'Kiara saltarina',memorama:'Memorama familiar',
  voladora:'Kiara voladora',calle:'Cruza la calle',raton:'Pégale al ratón',corre:'Corre sin parar',ladrillos:'Rompe ladrillos',torre:'Torre de bloques',simon:'Kiara dice'};
const nombreDe=k=>NOMBRES_NIVEL[k]||MINIJUEGOS[k]||k;

const Progreso=(()=>{
  const CLAVE='mc_progreso';
  let d={banco:0,compras:{},equipo:{},records:{},puntajes:{}};
  try{const g=JSON.parse(localStorage.getItem(CLAVE)||'null');if(g)d=Object.assign(d,g);}catch(_){}
  const guardar=()=>{try{localStorage.setItem(CLAVE,JSON.stringify(d))}catch(_){}};
  return {
    get banco(){return d.banco;},
    record:n=>d.records[n]||null,
    // Guarda el resultado de un nivel ganado y deposita sus monedas; regresa true si es mejor tiempo
    registrar(nivel,tiempo,monedas,estrellas){
      const r=d.records[nivel], nuevo=!r||tiempo<r.tiempo;
      d.records[nivel]=r?{tiempo:Math.min(r.tiempo,tiempo),monedas:Math.max(r.monedas,monedas),estrellas:Math.max(r.estrellas,estrellas)}
                        :{tiempo,monedas,estrellas};
      d.banco+=monedas;guardar();
      return nuevo;
    },
    // Minijuegos: se guarda el mejor puntaje (más es mejor)
    puntaje:id=>d.puntajes&&d.puntajes[id]||0,
    registrarPuntaje(id,puntos,monedas){
      if(!d.puntajes)d.puntajes={};
      const nuevo=puntos>(d.puntajes[id]||0);
      if(nuevo)d.puntajes[id]=puntos;
      d.banco+=monedas;guardar();
      return nuevo;
    },
    tiene:id=>!!d.compras[id],
    comprar(id,precio){
      if(d.compras[id]||d.banco<precio)return false;
      d.banco-=precio;d.compras[id]=true;guardar();return true;
    },
    equipo:k=>d.equipo[k],
    equipar(k,v){d.equipo[k]=v;guardar();}
  };
})();

const vidasIniciales=()=>Progreso.tiene('vida_extra')?4:3;
function fmtSeg(s){return Math.floor(s/60)+':'+String(Math.floor(s%60)).padStart(2,'0');}
const textoEstrellas=n=>'★'.repeat(n)+'☆'.repeat(3-n);

// Cada nivel llama esto al ganar
let resultadoNivel=null;
function terminarNivel(nivel,tiempo,monedas,estrellas,lineas){
  const nuevo=Progreso.registrar(nivel,tiempo,monedas,estrellas);
  resultadoNivel={nivel,tiempo,monedas,estrellas,lineas:lineas||[],nuevo};
  state='win';showOverlay();
}
function terminarMinijuego(id,puntos,monedas,lineas,gano){
  const nuevo=Progreso.registrarPuntaje(id,puntos,monedas);
  resultadoNivel={mini:id,puntos,monedas,lineas:lineas||[],nuevo,gano:!!gano};
  Musica.parar();Musica.jingle(gano||nuevo?'victoria':'nivel');
  state='win';showOverlay();
}

// ---------- Pantalla de récords ----------
function recordsHTML(){
  let filas='<p class="sub" style="margin:10px 0 0">Historia</p>';
  for(const n of ORDEN_NIVELES){
    const r=Progreso.record(n);
    filas+=`<div class="opt shop"><b>${etiquetaNivel(n)}. ${NOMBRES_NIVEL[n]}<span>${r?`<span class="estrellas">${textoEstrellas(r.estrellas)}</span> · ⏱ ${fmtSeg(r.tiempo)} · 🪙 ${r.monedas}`:'Sin jugar todavía'}</span></b>
      ${r?`<button class="pill" data-a="share-${n}">Compartir</button>`:''}</div>`;
  }
  filas+='<p class="sub" style="margin:10px 0 0">Minijuegos</p>';
  for(const id in MINIJUEGOS){
    const p=Progreso.puntaje(id);
    filas+=`<div class="opt shop"><b>${MINIJUEGOS[id]}<span>${p?`Mejor puntaje: ${p}`:'Sin jugar todavía'}</span></b>
      ${p?`<button class="pill" data-a="share-${id}">Compartir</button>`:''}</div>`;
  }
  return `<h1>Récords</h1><p class="hint">Tus mejores marcas en este celular. Compártelas y reta a tu familia y amigos.</p>${filas}
    <div id="sharebox"></div><button class="btn go" data-a="back">✔ Listo</button>`;
}
function datosRecord(k){
  if(MINIJUEGOS[k]){const p=Progreso.puntaje(k);return p?{titulo:MINIJUEGOS[k],grande:`${p} puntos`,linea:'Minijuego',texto:`Hice ${p} puntos en ${MINIJUEGOS[k]} de Merudichis Capuchinis. ¿Me ganas?`}:null;}
  const r=Progreso.record(k);
  return r?{titulo:`Nivel ${etiquetaNivel(k)} · ${NOMBRES_NIVEL[k]}`,grande:textoEstrellas(r.estrellas),linea:`Tiempo ${fmtSeg(r.tiempo)}   ·   Monedas ${r.monedas}`,
    texto:`Hice ${textoEstrellas(r.estrellas)} en el nivel ${k} (${NOMBRES_NIVEL[k]}) de Merudichis Capuchinis: ${fmtSeg(r.tiempo)} y ${r.monedas} monedas. ¿Me ganas?`}:null;
}
// Arma una imagen con el récord para mandarla por WhatsApp
function imagenRecord(dr){
  const c=document.createElement('canvas');c.width=720;c.height=400;const g=c.getContext('2d');
  const fondo=g.createLinearGradient(0,0,0,400);fondo.addColorStop(0,'#1e3a8a');fondo.addColorStop(1,'#3d9bff');
  g.fillStyle=fondo;g.fillRect(0,0,720,400);
  g.fillStyle='#ffd23f';g.font='bold 40px Arial';g.textAlign='center';g.fillText('MERUDICHIS CAPUCHINIS',360,62);
  g.fillStyle='#fff';g.font='bold 30px Arial';g.fillText(dr.titulo,360,112);
  g.fillStyle='#ffd23f';g.font='bold 58px Arial';g.fillText(dr.grande,360,188);
  g.fillStyle='#fff';g.font='bold 32px Arial';g.fillText(dr.linea,360,250);
  g.font='bold 30px Arial';g.fillStyle='#c8e6ff';g.fillText('¿Me ganas?',360,300);
  Personajes.heroe(g,'victoria',90,380,1,150);
  Personajes.kiara(g,'k_parada',640,380,-1,80);
  return c;
}
function compartirRecord(k){
  const dr=datosRecord(k);if(!dr)return;
  const img=imagenRecord(dr);
  if(window.AndroidApp&&AndroidApp.compartir){try{AndroidApp.compartir(dr.texto,img.toDataURL('image/png'));return;}catch(_){}}
  const box=document.getElementById('sharebox');if(!box)return;
  box.innerHTML=`<p class="hint">Mantén presionada la imagen para guardarla o compartirla.</p>
    <img src="${img.toDataURL('image/png')}" style="width:100%;border-radius:12px" alt="Récord de ${dr.titulo}">
    <button class="btn" data-a="copytxt">📋 Copiar texto del reto</button>`;
  box.dataset.texto=dr.texto;
}
