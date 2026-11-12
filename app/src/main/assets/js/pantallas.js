// Merudichis Capuchinis · foto del personaje, menús y configuración
'use strict';
// ---------- Foto del personaje ----------
function setFaceFromImage(img,save){
  const fc=document.createElement('canvas');fc.width=fc.height=128;const f=fc.getContext('2d');
  const s=Math.min(img.width,img.height),sx=(img.width-s)/2,sy=(img.height-s)*0.3;
  f.beginPath();f.arc(64,64,64,0,7);f.clip();f.drawImage(img,sx,sy,s,s,0,0,128,128);
  faceCanvas=fc;
  if(save){try{localStorage.setItem('tm_face',fc.toDataURL('image/png'))}catch(_){}}
  drawPreview();
}
try{const d=localStorage.getItem('tm_face');if(d){const im=new Image();im.onload=()=>setFaceFromImage(im,false);im.src=d;}}catch(_){}
function drawPreview(){
  const pv=document.getElementById('prev');if(!pv)return;const p=pv.getContext('2d');
  p.clearRect(0,0,96,96);drawHead(p,48,48,44,1);
}

// ---------- Pantallas ----------
function fmtTime(){const s=Math.floor(frames/60);return Math.floor(s/60)+':'+String(s%60).padStart(2,'0');}
function cfgHTML(){
  const m=k=>`<button class="pill ${cfg.mode===k?'':'off'}" data-a="mode-${k}">`;
  return `<h1>Configuración</h1>
  <div class="opt"><b>Modo de control<span>${cfg.mode==='touch'?'Desliza para moverte y toca para saltar':cfg.mode==='auto'?'Corre solo; tú solo saltas':'Botones en pantalla'}</span></b></div>
  <div class="modes">${m('touch')}👆 Táctil</button>${m('auto')}🏃 Auto-correr</button>${m('buttons')}🎮 Botones</button></div>
  <div class="opt"><b>Lados<span>${cfg.swap?'Moverse a la derecha, saltar a la izquierda':'Moverse a la izquierda, saltar a la derecha'}</span></b>
    <button class="pill" data-a="swap">${cfg.swap?'Invertidos':'Normales'}</button></div>
  <div class="opt"><b>Música<span>Melodías de cada nivel y efectos de poderes</span></b>
    <button class="pill ${cfg.musica?'':'off'}" data-a="musica">${cfg.musica?'Sí':'No'}</button></div>
  <div class="opt"><b>Personaje del nivel pixel art<span>${cfg.personaje==='normal'?'Proporciones clásicas, cabeza chica':'Cabeza grande para que se vea bien tu cara'}</span></b></div>
  <div class="modes"><button class="pill ${cfg.personaje!=='normal'?'':'off'}" data-a="pj-chibi">😀 Cabezón</button><button class="pill ${cfg.personaje==='normal'?'':'off'}" data-a="pj-normal">🧍 Normal</button></div>
  <div class="opt"><b>Volumen de la música</b><input type="range" id="vol" min="0" max="1" step="0.05" value="${cfg.volumen}" style="width:45%"></div>
  <div class="opt"><b>Volante del Gran Premio<span>${cfg.volante==='inclinar'?'Inclinas el celular como volante':'Arrastras el dedo: más lejos = gira más'}</span></b></div>
  <div class="modes"><button class="pill ${cfg.volante==='dedo'?'':'off'}" data-a="vol-dedo">👆 Dedo</button><button class="pill ${cfg.volante==='inclinar'?'':'off'}" data-a="vol-inclinar">📱 Inclinar</button>
    ${cfg.volante==='inclinar'?`<button class="pill ${cfg.inclInv?'':'off'}" data-a="inclinv">Invertir</button>`:''}</div>
  <div class="opt"><b>Voz "¡Ora, zombie!"<span>Cuando un enemigo o un auto te choca</span></b>
    <button class="pill ${cfg.voice?'':'off'}" data-a="voice">${cfg.voice?'Sí':'No'}</button></div>
  <div class="opt" style="margin-top:6px"><b>Tu propia voz<span>${voiceData?'Usando tu grabación':'Graba "¡Ora, zombie!" con la grabadora del celular y elígela aquí'}</span></b></div>
  <label class="btn" for="vfile">🎙 ${voiceData?'Cambiar grabación':'Elegir grabación'}<input type="file" accept="audio/*" id="vfile"></label>
  ${voiceData?'<button class="btn" data-a="delvoice">🗑 Quitar mi grabación</button>':''}
  <div class="msg" id="vmsg"></div>
  <button class="btn" data-a="testvoice">🔊 Probar voz</button>
  ${window.AndroidApp?`<div class="opt" style="margin-top:6px"><b>Versión instalada<span>${AndroidApp.version()}</span></b></div>
  <button class="btn" data-a="update">🔄 Buscar actualizaciones</button>`:''}
  <button class="btn go" data-a="back">✔ Listo</button>`;
}
// Pantalla de fotos: una casilla por pose, con el modelo o la foto que subió el jugador
function fotosHTML(){
  const celda=p=>`<div class="slot"><canvas data-pose="${p.id}" width="144" height="168"></canvas><div class="sl">${p.nombre}</div>
    <label class="mini" for="f_${p.id}">${Personajes.tiene(p.id)?'Cambiar':'Subir'}<input type="file" accept="image/*" id="f_${p.id}" data-foto="${p.id}"></label>
    ${Personajes.tiene(p.id)?`<button class="mini off" data-a="qf-${p.id}">Quitar</button>`:''}</div>`;
  return `<h1>Fotos de personajes</h1>
  <p class="hint">De perfil mirando a la derecha, cuerpo completo, misma ropa y luz. Mejor sin fondo (en la Galería: mantén presionada la persona y guárdala como imagen). Donde no subas foto se usa el modelo.</p>
  <p class="sub" style="margin:10px 0 0">Tú</p><div class="grid">${POSES_HEROE.map(celda).join('')}</div>
  <p class="sub" style="margin:10px 0 0">Kiara</p><div class="grid">${POSES_KIARA.map(celda).join('')}</div>
  <p class="hint">Cuando Kiara se hace grande se usa la foto K1 ampliada.</p>
  <p class="sub" style="margin:10px 0 0">Niña traviesa (Atrapa los trastes)</p><div class="grid">${POSES_NINA.map(celda).join('')}</div>
  <p class="sub" style="margin:10px 0 0">Memorama familiar (hasta 8 fotos de tu familia)</p>
  <div class="grid">${MEMO_IDS.map((id,i)=>celda({id,nombre:'Foto '+(i+1)})).join('')}</div>
  <div class="msg" id="fmsg"></div><button class="btn go" data-a="back">✔ Listo</button>`;
}
function pintarMiniaturas(){
  for(const c of card.querySelectorAll('canvas[data-pose]')){
    const g=c.getContext('2d'),id=c.dataset.pose;
    g.clearRect(0,0,c.width,c.height);
    if(id.startsWith('memo_')){const im=Personajes.foto(id);
      if(im){const s=Math.max(c.width/im.width,c.height/im.height);g.drawImage(im,(c.width-im.width*s)/2,(c.height-im.height*s)/2,im.width*s,im.height*s);}
      else{g.fillStyle='#90a4ae';g.font='bold 60px Arial';g.textAlign='center';g.textBaseline='middle';g.fillText('+',c.width/2,c.height/2);}}
    else if(id.startsWith('k_'))Personajes.kiara(g,id,c.width/2,c.height-14,1,90);
    else if(id.startsWith('n_'))Personajes.nina(g,id,c.width/2,c.height-10,1,140);
    else Personajes.heroe(g,id,c.width/2,c.height-10,1,140);
  }
}
// Ayuda de controles para cada nivel
function ayudaNivel(n){
  const ctlPlat=cfg.mode==='buttons'?'◀ ▶ moverse · ⤒ saltar (mantén para más alto).'
    :cfg.mode==='auto'&&n===1?'El personaje corre solo. Toca en cualquier parte para saltar.'
    :`Lado ${cfg.swap?'derecho':'izquierdo'}: desliza el dedo para moverte. Lado ${cfg.swap?'izquierdo':'derecho'}: toca para saltar (mantén para más alto).`;
  return {
    1:`${ctlPlat} Golpea los bloques con el puño: los ladrillos se rompen, los ? dan monedas o el hueso de Kiara. Si golpeas muchas veces un bloque duro te mareas.`,
    '1px':`${ctlPlat} Versión pixel art: si mantienes la dirección empiezas a correr y se llena el medidor P (abajo); con el medidor lleno corres y saltas más. Mantén el salto para llegar más alto.`,
    px2:`${ctlPlat} Desierto: igual que el 1-1 pero más largo, con pirámides y pozos de picos.`,
    px3:`${ctlPlat} Cueva: túneles bajos con techo de ladrillo (se rompe con el puño) e islas sobre los pozos.`,
    px4:`${ctlPlat} Montaña nevada: el suelo es hielo y resbala, frena con tiempo. Usa los resortes para subir.`,
    2:`El auto acelera solo. ${cfg.mode==='buttons'?'◀ ▶ girar · ⤒ brincar.':'Mantén el dedo de un lado para girar hacia ese lado; desliza hacia arriba para brincar.'} Monedas = más velocidad máxima, franjas amarillas = turbo, charcos = derrape. 3 vueltas.`,
    3:`${cfg.mode==='buttons'?'◀ ▶ giran a la viborita.':'Desliza el dedo hacia donde quieres que vaya.'} Come bloques para crecer hasta 30. No choques con la pared ni con tu cola. El hueso trae a Kiara.`,
    4:`${ctlPlat} Juegas con Kiara: busca 5 huesos. 👃 olfatea para ver hacia dónde están, quédate quieta encima para excavar y 🐶 ladra para paralizar zombies. Al final llévaselos a tu dueño.`,
    5:`${ctlPlat} Golpea con el puño los bloques de maceta cuando el Zombie Gigante pase debajo. Esquiva sus zapatos. Tres golpes y Kiara da la mordida final.`,
    kiaraman:'Usa la cruz o desliza el dedo. Come todas las croquetas; el hueso grande asusta a los ratones y Kiara puede atraparlos.',
    trastes:'Mueve el dedo y el personaje lo sigue. Atrapa platos, tazas, vasos y ollas; no atrapes globos de agua ni zapatos. El hueso trae a Kiara.',
    saltarina:'Toca o arrastra el dedo hacia donde quieres que vaya Kiara (o inclina el celular si lo elegiste). Rebota hacia arriba lo más alto que puedas.',
    memorama:'Toca dos cartas para voltearlas y encuentra los pares. Sube fotos de tu familia en 📸 Fotos.'
  }[n];
}
function nivelesHTML(){
  let h='<h1>Niveles</h1>';
  for(const n of ORDEN_NIVELES){
    const r=Progreso.record(n);
    h+=`<div class="opt shop"><b>${etiquetaNivel(n)}. ${NOMBRES_NIVEL[n]}<span>${r?`<span class="estrellas">${textoEstrellas(r.estrellas)}</span> · récord ${fmtSeg(r.tiempo)}`:'Nuevo'}</span></b>
      <button class="pill" data-a="play${n}">▶ Jugar</button></div>`;
    if(n===2){
      const autoBtn=k=>`<button class="pill ${cfg.car===k?'':'off'}" data-a="car-${k}" style="${cfg.car===k?'background:'+(Progreso.equipo('pintura')||AUTOS[k].color)+';color:'+(k==='hatch'&&!Progreso.equipo('pintura')?'#222':'#fff'):''}">${AUTOS[k].nombre}</button>`;
      h+=`<div class="modes">${autoBtn('sedan')}${autoBtn('compacto')}${autoBtn('hatch')}</div>`;
    }
  }
  return h+'<button class="btn go" data-a="back">✔ Listo</button>';
}
function minijuegosHTML(){
  let h='<h1>Minijuegos</h1>';
  for(const id in MINIJUEGOS){
    const p=Progreso.puntaje(id);
    h+=`<div class="opt shop"><b>${MINIJUEGOS[id]}<span>${p?'Mejor: '+p:'Nuevo'}</span></b><button class="pill" data-a="mini-${id}">▶ Jugar</button></div>`;
  }
  return h+'<button class="btn go" data-a="back">✔ Listo</button>';
}
function resultadoHTML(){
  if(resultadoNivel.mini){
    const r=resultadoNivel,id=r.mini;
    return `<h1>${r.gano?'¡GANASTE!':'¡SE ACABÓ!'}</h1><p class="sub">${MINIJUEGOS[id]}</p>
      <p class="stats">${r.lineas.join('<br>')}<br>Puntaje: <b>${r.puntos}</b> · Mejor: ${Progreso.puntaje(id)}<br>+${r.monedas} 🪙 al banco${r.nuevo?'<br><b style="color:#ffd23f">¡Nuevo récord!</b>':''}</p>
      <button class="btn go" data-a="mini-${id}">⟲ Jugar otra vez</button>
      <button class="btn" data-a="share-${id}">📤 Compartir récord</button><div id="sharebox"></div>
      <button class="btn" data-a="minijuegos">🎮 Otros minijuegos</button>
      <button class="btn" data-a="home">🏠 Menú principal</button>`;
  }
  const r=resultadoNivel,n=r.nivel,sig=siguienteNivel(n);
  return `<h1>¡${NOMBRES_NIVEL[n].toUpperCase()} COMPLETADO!</h1><p class="estrellas grandes">${textoEstrellas(r.estrellas)}</p>
    <p class="stats">${r.lineas.join('<br>')}<br>⏱ ${fmtSeg(r.tiempo)} · +${r.monedas} 🪙 al banco${r.nuevo?'<br><b style="color:#ffd23f">¡Nuevo récord!</b>':''}</p>
    ${sig?`<button class="btn go" data-a="play${sig}">▶ Siguiente: ${NOMBRES_NIVEL[sig]}</button>`:'<p class="stats">🏆 ¡Terminaste todo el juego!</p>'}
    <button class="btn" data-a="play${n}">⟲ Repetir nivel</button>
    <button class="btn" data-a="share-${n}">📤 Compartir récord</button><div id="sharebox"></div>
    <button class="btn" data-a="home">🏠 Menú principal</button>`;
}
function showOverlay(){
  clearTouches();
  pauseBtn.style.display='none';overlay.style.display='flex';
  if(view==='cfg'){card.innerHTML=cfgHTML();return;}
  if(view==='fotos'){card.innerHTML=fotosHTML();pintarMiniaturas();return;}
  if(view==='niveles'){card.innerHTML=nivelesHTML();return;}
  if(view==='tienda'){card.innerHTML=tiendaHTML();pintarTienda();return;}
  if(view==='records'){card.innerHTML=recordsHTML();return;}
  if(view==='minijuegos'){card.innerHTML=minijuegosHTML();return;}
  const extras=`<button class="btn" data-a="fotos">📸 Fotos de personajes</button><button class="btn" data-a="cfg">⚙ Configuración</button>`;
  const photo=`<div class="face"><canvas id="prev" width="96" height="96" style="width:96px;height:96px"></canvas></div>
    <label class="btn" for="file">📷 Foto de tu cara<input type="file" accept="image/*" id="file"></label>
    <div class="msg" id="msg"></div>`;
  const hint=t=>`<p class="hint">Gira el celular en horizontal.<br>${t}</p>`;
  if(state==='menu') card.innerHTML=`<h1>MERUDICHIS CAPUCHINIS</h1><p class="sub">Con Kiara · ${TOTAL_NIVELES} niveles · 🪙 ${Progreso.banco}</p>${photo}
    <button class="btn go" data-a="niveles">▶ Historia</button>
    <button class="btn go" data-a="minijuegos">🎮 Minijuegos</button>
    <button class="btn" data-a="tienda">🛒 Tienda</button>
    <button class="btn" data-a="records">🏆 Récords</button>${extras}`;
  else if(state==='pause') card.innerHTML=`<h1>Pausa</h1><p class="sub">${nombreDe(level)}</p>
    <button class="btn go" data-a="resume">▶ Continuar</button>
    <button class="btn" data-a="restart">⟲ Reiniciar nivel</button><button class="btn" data-a="home">🏠 Menú principal</button>${extras}${hint(ayudaNivel(level))}`;
  else if(state==='win') card.innerHTML=resultadoHTML();
  else if(state==='over') card.innerHTML=`<h1>FIN DEL JUEGO</h1><p class="stats">Te quedaste sin vidas en ${nombreDe(level)}.</p>
    <button class="btn go" data-a="play${level}">▶ Intentar de nuevo</button><button class="btn" data-a="home">🏠 Menú principal</button>`;
  drawPreview();
}
function pauseGame(){state='pause';Musica.parar();showOverlay();}
function startAudio(){
  try{if(!ac){ac=new (window.AudioContext||window.webkitAudioContext)();if(voiceData)decodeVoice();Musica.reanudar();}
      if(ac.state==='suspended')ac.resume();}catch(_){}
  primeTTS();
}
function goFullscreen(){
  try{const el=document.documentElement;if(!document.fullscreenElement&&el.requestFullscreen){
    el.requestFullscreen().then(()=>{try{screen.orientation.lock('landscape').catch(()=>{})}catch(_){}}).catch(()=>{});}}catch(_){}
}
overlay.addEventListener('click',e=>{
  const b=e.target.closest('[data-a]');if(!b)return;
  const a=b.dataset.a;
  startAudio();
  if(a==='cfg'){view='cfg';showOverlay();return;}
  if(a==='fotos'||a==='niveles'||a==='tienda'||a==='records'||a==='minijuegos'){view=a;if(state==='win')state='menu';showOverlay();return;}
  if(a==='musica'){cfg.musica=!cfg.musica;saveCfg();Musica.volumen();showOverlay();return;}
  if(a.startsWith('pj-')){cfg.personaje=a.slice(3);saveCfg();showOverlay();return;}
  if(a.startsWith('vol-')){cfg.volante=a.slice(4);saveCfg();showOverlay();return;}
  if(a==='inclinv'){cfg.inclInv=!cfg.inclInv;saveCfg();showOverlay();return;}
  if(a.startsWith('buy-')||a.startsWith('eq-')){const m=accionTienda(a);showOverlay();const t=document.getElementById('tmsg');if(t)t.textContent=m;return;}
  if(a.startsWith('share-')){const k=a.slice(6);compartirRecord(/^\d$/.test(k)?+k:k);return;}
  if(a==='copytxt'){const box=document.getElementById('sharebox');try{navigator.clipboard.writeText(box.dataset.texto).then(()=>{b.textContent='✔ Copiado';}).catch(()=>{});}catch(_){}return;}
  if(a.startsWith('qf-')){Personajes.quitar(a.slice(3));showOverlay();return;}
  if(a.startsWith('mode-')){cfg.mode=a.slice(5);saveCfg();showOverlay();return;}
  if(a==='swap'){cfg.swap=!cfg.swap;saveCfg();showOverlay();return;}
  if(a==='voice'){cfg.voice=!cfg.voice;saveCfg();showOverlay();return;}
  if(a==='testvoice'){say(true);return;}
  if(a==='update'){try{AndroidApp.buscarActualizacion();}catch(_){}return;}
  if(a==='delvoice'){voiceData=null;voiceBuf=null;try{localStorage.removeItem('tm_voice')}catch(_){}showOverlay();return;}
  if(a==='back'){view='';showOverlay();return;}
  if(a.startsWith('car-')){cfg.car=a.slice(4);saveCfg();showOverlay();return;}
  if(a==='home'){state='menu';view='';startLevel(1);Musica.tocar('menu');showOverlay();return;}
  goFullscreen();
  if(/^play(\d|1px|px\d)$/.test(a)){view='';const k=a.slice(4);startLevel(/^\d$/.test(k)?+k:k);}
  else if(a.startsWith('mini-')){view='';startLevel(a.slice(5));}
  else if(a==='restart')startLevel(level);
  for(const k in input)input[k]=false;
  state='play';overlay.style.display='none';pauseBtn.style.display='block';
  Musica.tocar(CANCION[level]);
});
overlay.addEventListener('input',e=>{
  if(e.target.id==='vol'){cfg.volumen=+e.target.value;saveCfg();Musica.volumen();}
});
overlay.addEventListener('change',e=>{
  if(e.target.dataset&&e.target.dataset.foto&&e.target.files[0]){
    const id=e.target.dataset.foto, m=()=>document.getElementById('fmsg');
    m().textContent='Procesando foto…';
    Personajes.guardar(id,e.target.files[0]).then(guardada=>{
      showOverlay();
      m().textContent=guardada?'¡Listo!':'Se usará en esta partida, pero el celular no tiene espacio para guardarla.';
    }).catch(()=>{m().textContent='No se pudo leer esa imagen. Prueba con otra (JPG o PNG).';});
    return;
  }
  if(e.target.id==='vfile'&&e.target.files[0]){
    const f=e.target.files[0], m=()=>document.getElementById('vmsg');
    if(f.size>3000000){m().textContent='El audio es muy largo; graba solo 1 o 2 segundos.';return;}
    m().textContent='Cargando audio…';
    const fr=new FileReader();
    fr.onload=async()=>{
      const prev=voiceData; voiceData=fr.result; startAudio();
      if(await decodeVoice()){
        try{localStorage.setItem('tm_voice',voiceData)}catch(_){}
        showOverlay(); m().textContent='¡Listo! Esa será la voz.'; say(true);
      } else {voiceData=prev; if(prev)decodeVoice(); m().textContent='No se pudo reproducir ese audio. Ese formato no es compatible; prueba grabarlo con otra app o mándatelo como nota de voz de WhatsApp y guárdalo.';}
    };
    fr.onerror=()=>{m().textContent='No se pudo leer el archivo.';};
    fr.readAsDataURL(f); return;
  }
  if(e.target.id!=='file'||!e.target.files[0])return;
  const file=e.target.files[0], msg=document.getElementById('msg');
  if(msg)msg.textContent='Cargando foto…';
  const fail=()=>{if(msg)msg.textContent='No se pudo leer esa imagen. Prueba con otra foto (JPG o PNG).';};
  const ok=im=>{setFaceFromImage(im,true);if(msg)msg.textContent='¡Listo! Ya eres el personaje.';};
  const viaReader=()=>{const fr=new FileReader();fr.onload=()=>{const im=new Image();im.onload=()=>ok(im);im.onerror=fail;im.src=fr.result;};fr.onerror=fail;fr.readAsDataURL(file);};
  try{const url=URL.createObjectURL(file);const im=new Image();
    im.onload=()=>{ok(im);URL.revokeObjectURL(url);};im.onerror=()=>{URL.revokeObjectURL(url);viaReader();};im.src=url;}
  catch(_){viaReader();}
});
pauseBtn.addEventListener('click',pauseGame);
document.addEventListener('visibilitychange',()=>{if(document.hidden&&state==='play')pauseGame();});
