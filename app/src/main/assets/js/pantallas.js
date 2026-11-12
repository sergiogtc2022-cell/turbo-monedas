// Turbo Monedas · foto del personaje, menús y configuración
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
  <div class="opt"><b>Voz "¡Ora, zombie!"<span>Cuando un enemigo o un auto te choca</span></b>
    <button class="pill ${cfg.voice?'':'off'}" data-a="voice">${cfg.voice?'Sí':'No'}</button></div>
  <div class="opt" style="margin-top:6px"><b>Tu propia voz<span>${voiceData?'Usando tu grabación':'Graba "¡Ora, zombie!" con la grabadora del celular y elígela aquí'}</span></b></div>
  <label class="btn" for="vfile">🎙 ${voiceData?'Cambiar grabación':'Elegir grabación'}<input type="file" accept="audio/*,.m4a,.mp3,.ogg,.opus,.wav,.aac,.3gp,.amr,.webm,.mp4" id="vfile"></label>
  ${voiceData?'<button class="btn" data-a="delvoice">🗑 Quitar mi grabación</button>':''}
  <div class="msg" id="vmsg"></div>
  <button class="btn" data-a="testvoice">🔊 Probar voz</button>
  ${window.AndroidApp?`<div class="opt" style="margin-top:6px"><b>Versión instalada<span>${AndroidApp.version()}</span></b></div>
  <button class="btn" data-a="update">🔄 Buscar actualizaciones</button>`:''}
  <button class="btn go" data-a="back">✔ Listo</button>`;
}
function showOverlay(){
  clearTouches();
  pauseBtn.style.display='none';overlay.style.display='flex';
  if(view==='cfg'){card.innerHTML=cfgHTML();return;}
  const cfgBtn=`<button class="btn" data-a="cfg">⚙ Configuración</button>`;
  const photo=`<div class="face"><canvas id="prev" width="96" height="96" style="width:96px;height:96px"></canvas></div>
    <label class="btn" for="file">📷 Tomar o elegir foto<input type="file" accept="image/*" id="file"></label>
    <div class="msg" id="msg"></div>`;
  const autoBtn=k=>`<button class="pill ${cfg.car===k?'':'off'}" data-a="car-${k}" style="${cfg.car===k?'background:'+AUTOS[k].color+';color:'+(k==='hatch'?'#222':'#fff'):''}">${AUTOS[k].nombre}</button>`;
  const autos=`<p class="sub" style="margin:10px 0 0">Tu auto para el Gran Premio</p><div class="modes">${autoBtn('sedan')}${autoBtn('compacto')}${autoBtn('hatch')}</div>`;
  const ctl1=cfg.mode==='touch'
    ?`Lado ${cfg.swap?'derecho':'izquierdo'}: pon el dedo y deslízalo para moverte. Lado ${cfg.swap?'izquierdo':'derecho'}: toca para saltar (mantén para más alto).`
    :cfg.mode==='auto'?'El personaje corre solo. Toca en cualquier parte para saltar (mantén para más alto).'
    :'◀ ▶ moverse · ⤒ saltar (mantén para saltar más alto).';
  const ctl2=cfg.mode==='buttons'?'◀ ▶ girar · ⤒ brincar.'
    :'Mantén el dedo del lado izquierdo para girar a la izquierda y del derecho para girar a la derecha. Desliza hacia arriba para brincar.';
  const hint1=`<b>Nivel 1:</b> ${ctl1} Pisa a los enemigos; las flechas amarillas dan velocidad y el resorte rojo te lanza. Si te golpean pierdes tus monedas; sin monedas pierdes una vida.`;
  const hint2=`<b>Nivel 2:</b> El auto acelera solo. ${ctl2} Las monedas suben tu velocidad máxima, las franjas amarillas son turbo y los charcos negros te hacen derrapar. Son 3 vueltas.`;
  const hint=t=>`<p class="hint">Gira el celular en horizontal.<br>${t}</p>`;
  if(state==='menu') card.innerHTML=`<h1>TURBO MONEDAS</h1><p class="sub">Prototipo · 2 niveles</p>${photo}
    <button class="btn go" data-a="play1">▶ Nivel 1 · Plataformas</button>
    <button class="btn go" data-a="play2">🏁 Nivel 2 · Gran Premio</button>${autos}${cfgBtn}${hint(hint1+'<br>'+hint2)}`;
  else if(state==='pause') card.innerHTML=`<h1>Pausa</h1>${photo}<button class="btn go" data-a="resume">▶ Continuar</button>
    <button class="btn" data-a="restart">⟲ Reiniciar nivel</button><button class="btn" data-a="home">🏠 Menú principal</button>${cfgBtn}${hint(level===2?hint2:hint1)}`;
  else if(state==='win'&&level===1) card.innerHTML=`<h1>¡NIVEL COMPLETADO!</h1><p class="stats">🪙 ${coins} / ${totalCoins} monedas<br>⏱ ${fmtTime()} · ❤ ${lives} vidas</p>
    <button class="btn go" data-a="play2">🏁 Siguiente: Gran Premio</button>${autos}<button class="btn" data-a="play1">⟲ Repetir nivel 1</button>`;
  else if(state==='win'&&level===2){const r=Nivel2.result();
    const medal=r.place===1?'🥇':r.place===2?'🥈':r.place===3?'🥉':'🏁';
    card.innerHTML=`<h1>${medal} ¡LLEGASTE ${r.place}° DE ${r.total}!</h1><p class="stats">${r.auto}<br>⏱ ${r.time} · 🪙 ${r.coins} monedas</p>
    <button class="btn go" data-a="play2">⟲ Correr otra vez</button>${autos}<button class="btn" data-a="home">🏠 Menú principal</button>`;}
  else if(state==='over') card.innerHTML=`<h1>FIN DEL JUEGO</h1><p class="stats">Te quedaste sin vidas.</p>${photo}<button class="btn go" data-a="play1">▶ Intentar de nuevo</button><button class="btn" data-a="home">🏠 Menú principal</button>`;
  drawPreview();
}
function pauseGame(){state='pause';showOverlay();}
function startAudio(){try{if(!ac){ac=new (window.AudioContext||window.webkitAudioContext)();if(voiceData)decodeVoice();}if(ac.state==='suspended')ac.resume();}catch(_){}primeTTS();}
function goFullscreen(){
  try{const el=document.documentElement;if(!document.fullscreenElement&&el.requestFullscreen){
    el.requestFullscreen().then(()=>{try{screen.orientation.lock('landscape').catch(()=>{})}catch(_){}}).catch(()=>{});}}catch(_){}
}
overlay.addEventListener('click',e=>{
  const b=e.target.closest('[data-a]');if(!b)return;
  const a=b.dataset.a;
  startAudio();
  if(a==='cfg'){view='cfg';showOverlay();return;}
  if(a.startsWith('mode-')){cfg.mode=a.slice(5);saveCfg();showOverlay();return;}
  if(a==='swap'){cfg.swap=!cfg.swap;saveCfg();showOverlay();return;}
  if(a==='voice'){cfg.voice=!cfg.voice;saveCfg();showOverlay();return;}
  if(a==='testvoice'){say(true);return;}
  if(a==='update'){try{AndroidApp.buscarActualizacion();}catch(_){}return;}
  if(a==='delvoice'){voiceData=null;voiceBuf=null;try{localStorage.removeItem('tm_voice')}catch(_){}showOverlay();return;}
  if(a==='back'){view='';showOverlay();return;}
  if(a.startsWith('car-')){cfg.car=a.slice(4);saveCfg();showOverlay();return;}
  if(a==='home'){state='menu';startLevel(1);showOverlay();return;}
  goFullscreen();
  if(a==='play1')startLevel(1);
  else if(a==='play2')startLevel(2);
  else if(a==='restart')startLevel(level);
  for(const k in input)input[k]=false;
  state='play';overlay.style.display='none';pauseBtn.style.display='block';
});
overlay.addEventListener('change',e=>{
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
