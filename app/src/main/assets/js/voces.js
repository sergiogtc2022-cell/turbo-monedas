// Merudichis Capuchinis · frases del personaje. Orden de preferencia: la grabación que cargó el jugador,
// la voz incluida en el juego (carpeta voces/) y, si no hay ninguna, la voz del teléfono con su tono y velocidad.
'use strict';
const FRASES={
  zombie: {nombre:'Un enemigo te choca', muestra:'¡Ora, zombie!',          texto:'¡Ora, zombi!',              tono:1.25,vel:1.1,archivo:'voces/zombie.mp3'},
  choque: {nombre:'Chocas con un muro',  muestra:'¡Chocamos!',             texto:'¡Chocamos!',                tono:1.1, vel:1.2,archivo:'voces/choque.mp3'},
  kiara:  {nombre:'Llamas a Kiara',      muestra:'¡Kiara, ven!',           texto:'¡Kiara, ven!',              tono:1.2, vel:1.0},
  huesito:{nombre:'Sale un hueso',       muestra:'Un huesito para Kiara',  texto:'Un huesito para Kiara',     tono:1.7, vel:0.8},
  vacio:  {nombre:'Caes al vacío',       muestra:'¡Ora, zooooobieeee!',    texto:'¡Ora, zooooombiiiieeeee!',  tono:0.8, vel:0.55,archivo:'voces/vacio.mp3'},
  moshi:  {nombre:'Te quedas quieto',    muestra:'¡Moshi moshi!',          texto:'¡Moshi moshi!',             tono:1.4, vel:1.0,archivo:'voces/moshi.mp3'}
};
const Voces=(()=>{
  const datos={},bufs={};
  const clave=id=>id==='zombie'?'tm_voice':'mc_voz_'+id;   // "zombie" conserva la grabación que ya existía
  for(const id in FRASES){try{const d=localStorage.getItem(clave(id));if(d)datos[id]=d;}catch(_){}}

  let esVoz=null,despierta=false;
  function elegirVoz(){try{const v=speechSynthesis.getVoices();esVoz=v.find(x=>/es[-_](MX|US|419)/i.test(x.lang))||v.find(x=>/^es/i.test(x.lang))||null;}catch(_){}}
  if(window.speechSynthesis){elegirVoz();try{speechSynthesis.onvoiceschanged=elegirVoz;}catch(_){}}
  // Android pide "despertar" la voz del navegador con un toque del usuario
  function despertar(){
    if(despierta||!window.speechSynthesis)return;despierta=true;
    try{const u=new SpeechSynthesisUtterance(' ');u.volume=0;speechSynthesis.speak(u);}catch(_){}
  }
  async function decodificar(id){
    if(!ac||!datos[id])return false;
    try{
      const bin=atob(datos[id].split(',')[1]),arr=new Uint8Array(bin.length);
      for(let i=0;i<bin.length;i++)arr[i]=bin.charCodeAt(i);
      bufs[id]=await ac.decodeAudioData(arr.buffer);return true;
    }catch(_){delete bufs[id];return false;}
  }
  // voz incluida en el juego (archivo de audio junto al juego)
  const incluidas={};
  function tocarIncluida(id){
    const f=FRASES[id];if(!f||!f.archivo)return false;
    try{const a=incluidas[id]||(incluidas[id]=new Audio(f.archivo));a.currentTime=0;a.volume=cfg.volumen!=null?Math.min(1,cfg.volumen*1.4+0.2):1;
      const p=a.play();if(p&&p.catch)p.catch(()=>{});return true;}catch(_){return false;}
  }
  const prepararTodas=()=>{for(const id in datos)if(!bufs[id])decodificar(id);};
  function vozTelefono(texto,tono,vel){
    if(window.AndroidVoz){
      try{if(AndroidVoz.hablarCon?AndroidVoz.hablarCon(texto,tono,vel):AndroidVoz.hablar(texto))return;}catch(_){}
    }
    if(!window.speechSynthesis)return;
    try{speechSynthesis.cancel();speechSynthesis.resume();
      const u=new SpeechSynthesisUtterance(texto);u.lang=esVoz?esVoz.lang:'es-MX';if(esVoz)u.voice=esVoz;
      u.pitch=tono;u.rate=vel;speechSynthesis.speak(u);}catch(_){}
  }
  function decir(id,forzar){
    if(!cfg.voice&&!forzar)return;
    if(bufs[id]&&ac){
      try{const src=ac.createBufferSource(),g=ac.createGain();g.gain.value=1.2;src.buffer=bufs[id];src.connect(g).connect(ac.destination);src.start();return;}catch(_){}
    }
    if(datos[id])return;                 // grabación aún sin decodificar: mejor callar que mezclar voces
    if(tocarIncluida(id))return;
    const f=FRASES[id];if(f)vozTelefono(f.texto,f.tono,f.vel);
  }
  async function grabar(id,dataUrl){
    const antes=datos[id];datos[id]=dataUrl;
    if(await decodificar(id)){try{localStorage.setItem(clave(id),dataUrl);}catch(_){}return true;}
    if(antes){datos[id]=antes;decodificar(id);}else delete datos[id];
    return false;
  }
  function quitar(id){delete datos[id];delete bufs[id];try{localStorage.removeItem(clave(id));}catch(_){}}
  const tiene=id=>!!datos[id];
  const origen=id=>datos[id]?'tu grabación':FRASES[id]&&FRASES[id].archivo?'voz incluida':'voz del teléfono';
  return {decir,grabar,quitar,tiene,origen,prepararTodas,despertar};
})();
