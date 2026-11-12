// Merudichis Capuchinis · progreso guardado en el celular: monedas del banco, compras, récords y estrellas por nivel
'use strict';
const NOMBRES_NIVEL={1:'Plataformas',2:'Gran Premio',3:'La Viborita',4:'Nivel de Kiara',5:'Zombie Gigante'};
const TOTAL_NIVELES=5;

const Progreso=(()=>{
  const CLAVE='mc_progreso';
  let d={banco:0,compras:{},equipo:{},records:{}};
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

// ---------- Pantalla de récords ----------
function recordsHTML(){
  let filas='';
  for(let n=1;n<=TOTAL_NIVELES;n++){
    const r=Progreso.record(n);
    filas+=`<div class="opt shop"><b>${n}. ${NOMBRES_NIVEL[n]}<span>${r?`<span class="estrellas">${textoEstrellas(r.estrellas)}</span> · ⏱ ${fmtSeg(r.tiempo)} · 🪙 ${r.monedas}`:'Sin jugar todavía'}</span></b>
      ${r?`<button class="pill" data-a="share-${n}">Compartir</button>`:''}</div>`;
  }
  return `<h1>Récords</h1><p class="hint">Tus mejores marcas en este celular. Compártelas y reta a tu familia y amigos.</p>${filas}
    <div id="sharebox"></div><button class="btn go" data-a="back">✔ Listo</button>`;
}

// Arma una imagen con el récord para mandarla por WhatsApp
function imagenRecord(n){
  const r=Progreso.record(n);
  const c=document.createElement('canvas');c.width=720;c.height=400;const g=c.getContext('2d');
  const fondo=g.createLinearGradient(0,0,0,400);fondo.addColorStop(0,'#1e3a8a');fondo.addColorStop(1,'#3d9bff');
  g.fillStyle=fondo;g.fillRect(0,0,720,400);
  g.fillStyle='#ffd23f';g.font='bold 40px Arial';g.textAlign='center';g.fillText('MERUDICHIS CAPUCHINIS',360,62);
  g.fillStyle='#fff';g.font='bold 30px Arial';g.fillText(`Nivel ${n} · ${NOMBRES_NIVEL[n]}`,360,112);
  g.fillStyle='#ffd23f';g.font='bold 64px Arial';g.fillText(textoEstrellas(r.estrellas),360,190);
  g.fillStyle='#fff';g.font='bold 34px Arial';g.fillText(`Tiempo ${fmtSeg(r.tiempo)}   ·   Monedas ${r.monedas}`,360,250);
  g.font='bold 30px Arial';g.fillStyle='#c8e6ff';g.fillText('¿Me ganas?',360,300);
  Personajes.heroe(g,'victoria',90,380,1,150);
  Personajes.kiara(g,'k_parada',640,380,-1,80);
  return c;
}
function compartirRecord(n){
  const r=Progreso.record(n);if(!r)return;
  const texto=`Hice ${textoEstrellas(r.estrellas)} en el nivel ${n} (${NOMBRES_NIVEL[n]}) de Merudichis Capuchinis: ${fmtSeg(r.tiempo)} y ${r.monedas} monedas. ¿Me ganas?`;
  const img=imagenRecord(n);
  if(window.AndroidApp&&AndroidApp.compartir){try{AndroidApp.compartir(texto,img.toDataURL('image/png'));return;}catch(_){}}
  const box=document.getElementById('sharebox');if(!box)return;
  box.innerHTML=`<p class="hint">Mantén presionada la imagen para guardarla o compartirla.</p>
    <img src="${img.toDataURL('image/png')}" style="width:100%;border-radius:12px" alt="Récord del nivel ${n}">
    <button class="btn" data-a="copytxt">📋 Copiar texto del reto</button>`;
  box.dataset.texto=texto;
}
