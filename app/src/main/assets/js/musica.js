// Merudichis Capuchinis · música chiptune original (8 bits) y fanfarrias de poderes, generadas con Web Audio
'use strict';
const Musica=(()=>{
  const NOTAS={C:0,'C#':1,D:2,'D#':3,E:4,F:5,'F#':6,G:7,'G#':8,A:9,'A#':10,B:11};
  const frec=n=>{const m=/^([A-G]#?)(\d)$/.exec(n);return 440*Math.pow(2,(NOTAS[m[1]]+(+m[2]+1)*12-69)/12);};
  const rep=(s,n)=>Array(n).fill(s).join(' ');
  // Cada voz es texto "nota:octavos"; "-" es silencio; "|" separa compases (solo para leer).
  // Batería: k bombo, s tarola, h platillo.
  const CANCIONES={
    menu:{tempo:110,
      mel:'C5:2 E5:2 G5:2 E5:2 | F5:2 A5:2 G5:4 | E5:2 D5:2 C5:2 D5:2 | E5:4 G4:4',
      bajo:'C3:4 G2:4 | F2:4 C3:4 | A2:4 G2:4 | C3:4 C2:4',
      bat:rep('k:2 h:2 h:2 h:2',4)},
    nivel1:{tempo:150,
      mel:'E5:1 G5:1 C6:2 B5:1 G5:1 E5:2 | F5:1 A5:1 C6:2 A5:2 F5:2 | G5:1 B5:1 D6:2 C6:1 B5:1 G5:2 | E5:2 G5:2 C5:4 | '+
          'C5:1 E5:1 G5:1 C6:1 A5:2 G5:2 | F5:1 E5:1 D5:1 F5:1 E5:4 | D5:1 F5:1 A5:1 D6:1 C6:2 B5:2 | C6:6 -:2',
      bajo:'C3:2 G3:2 C3:2 G3:2 | F2:2 C3:2 F2:2 C3:2 | G2:2 D3:2 G2:2 D3:2 | C3:2 G3:2 C3:4 | '+
           'C3:2 G3:2 A2:2 E3:2 | F2:2 C3:2 C3:2 G3:2 | D3:2 A3:2 G2:2 D3:2 | C3:2 G2:2 C3:4',
      bat:rep('k:2 h:1 h:1 s:2 h:1 h:1',8)},
    pixel:{tempo:160,
      mel:'C5:1 C5:1 G5:1 C5:1 A5:1 G5:1 E5:2 | D5:1 D5:1 A5:1 D5:1 B5:1 A5:1 F5:2 | E5:1 G5:1 C6:1 G5:1 F5:1 A5:1 D6:1 A5:1 | G5:2 B5:2 C6:4',
      bajo:rep('C3:1 C4:1',4)+' | '+rep('D3:1 D4:1',4)+' | E3:1 E4:1 E3:1 E4:1 F3:1 F4:1 F3:1 F4:1 | G2:2 G3:2 C3:4',
      bat:rep('k:1 h:1 s:1 h:1',8)},
    carrera:{tempo:170,
      mel:'A4:1 C5:1 E5:1 A5:1 G5:1 E5:1 C5:1 E5:1 | F5:1 A5:1 C6:1 A5:1 G5:2 E5:2 | D5:1 F5:1 A5:1 F5:1 E5:1 G5:1 B5:1 G5:1 | A5:4 E5:2 -:2',
      bajo:rep('A2:1 A3:1',4)+' | '+rep('F2:1 F3:1',4)+' | D3:1 D2:1 D3:1 D2:1 E3:1 E2:1 E3:1 E2:1 | A2:2 E3:2 A2:4',
      bat:rep('k:1 h:1 s:1 h:1 k:1 k:1 s:1 h:1',4)},
    viborita:{tempo:130,
      mel:'G4:1 B4:1 D5:1 B4:1 G4:2 -:2 | A4:1 C5:1 E5:1 C5:1 A4:2 -:2 | B4:1 D5:1 G5:1 F#5:1 E5:1 D5:1 C5:1 B4:1 | A4:2 D5:2 G4:4',
      bajo:'G2:2 D3:2 G2:2 D3:2 | A2:2 E3:2 A2:2 E3:2 | G2:2 B2:2 C3:2 E3:2 | D3:2 D2:2 G2:4',
      bat:rep('k:2 h:2 s:2 h:2',4)},
    kiara:{tempo:140,
      mel:'F5:1 -:1 A5:1 -:1 C6:2 A5:2 | B5:1 A5:1 G5:1 F5:1 G5:4 | E5:1 -:1 G5:1 -:1 B5:2 G5:2 | A5:1 G5:1 F5:1 E5:1 F5:4',
      bajo:'F2:2 C3:2 F2:2 C3:2 | G2:2 D3:2 C3:2 E3:2 | C3:2 G3:2 C3:2 G3:2 | C3:2 E3:2 F2:4',
      bat:rep('k:1 h:1 s:1 h:1',8)},
    jefe:{tempo:160,
      mel:'D5:1 D5:1 F5:1 D5:1 G#5:2 A5:2 | D5:1 D5:1 F5:1 D5:1 C6:2 A5:2 | A#5:1 A5:1 G5:1 F5:1 E5:1 F5:1 G5:1 E5:1 | D5:4 -:2 A4:2',
      bajo:rep('D2:1 D3:1',4)+' | D2:1 D3:1 D2:1 D3:1 F2:1 F3:1 F2:1 F3:1 | A#1:1 A#2:1 A#1:1 A#2:1 A1:1 A2:1 A1:1 A2:1 | D2:4 A1:4',
      bat:rep('k:1 k:1 s:1 h:1 k:1 k:1 s:1 s:1',4)},
    mini:{tempo:145,
      mel:'E5:1 G5:1 B5:1 G5:1 A5:1 G5:1 E5:2 | D5:1 F#5:1 A5:1 F#5:1 G5:2 B4:2 | C5:1 E5:1 G5:1 E5:1 F#5:1 E5:1 D5:2 | E5:4 B4:2 -:2',
      bajo:'E2:2 B2:2 E2:2 B2:2 | D2:2 A2:2 G2:2 D3:2 | C3:2 G2:2 D3:2 A2:2 | E2:2 B2:2 E2:4',
      bat:rep('k:1 h:1 s:1 h:1',8)},
    tranquila:{tempo:100,
      mel:'G5:2 E5:2 C5:2 E5:2 | F5:2 D5:2 B4:4 | C5:2 E5:2 G5:2 C6:2 | B5:4 G5:4',
      bajo:'C3:4 C3:4 | G2:4 G2:4 | A2:4 E3:4 | G2:4 G2:4',
      bat:rep('h:2 h:2 h:2 h:2',4)}
  };
  // Fanfarrias cortas (en dieciseisavos, más rápidas)
  const JINGLES={
    poder:   'C5:1 E5:1 G5:1 C6:1 E6:1 G6:1 C7:3',
    kiara:   'G5:1 G5:1 -:1 G5:1 C6:2 E6:2 G6:4',
    gigante: 'C5:1 C5:1 C5:1 G5:2 E5:1 G5:2 C6:5',
    turbo:   'C5:1 D5:1 E5:1 F5:1 G5:1 A5:1 B5:1 C6:3',
    mareo:   'E6:1 C6:1 E6:1 C6:1 E6:1 C6:2',
    victoria:'C5:2 E5:2 G5:2 C6:4 G5:2 C6:8',
    perder:  'G4:3 F#4:3 F4:3 E4:8',
    acierto: 'C6:1 E6:1 G6:3',
    error:   'D4:2 C#4:4',
    nivel:   'E5:1 G5:1 E6:1 C6:1 D6:1 G6:4'
  };
  const parse=s=>s.trim().split(/\s+/).filter(t=>t!=='|').map(t=>{const [n,d]=t.split(':');return {n,d:+d||1};});

  let maestro=null, actual=null, pendiente='menu', voces=[], timer=null, ruido=null;

  function asegurar(){
    if(!ac)return false;
    if(!maestro){maestro=ac.createGain();maestro.connect(ac.destination);}
    if(!ruido){
      ruido=ac.createBuffer(1,ac.sampleRate*0.3,ac.sampleRate);
      const d=ruido.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;
    }
    volumen();
    return true;
  }
  function volumen(){if(maestro)maestro.gain.setTargetAtTime(cfg.musica?cfg.volumen*0.6:0,ac.currentTime,0.05);}
  function nota(tipo,f,t,dur,vol,dest){
    const o=ac.createOscillator(),g=ac.createGain();
    o.type=tipo;o.frequency.setValueAtTime(f,t);
    g.gain.setValueAtTime(0.0001,t);g.gain.linearRampToValueAtTime(vol,t+0.006);
    g.gain.setValueAtTime(vol,t+dur*0.65);g.gain.exponentialRampToValueAtTime(0.0001,t+dur*0.95);
    o.connect(g).connect(dest);o.start(t);o.stop(t+dur);
  }
  function bateria(k,t){
    if(k==='k'){
      const o=ac.createOscillator(),g=ac.createGain();
      o.frequency.setValueAtTime(150,t);o.frequency.exponentialRampToValueAtTime(40,t+0.12);
      g.gain.setValueAtTime(0.5,t);g.gain.exponentialRampToValueAtTime(0.0001,t+0.14);
      o.connect(g).connect(maestro);o.start(t);o.stop(t+0.15);return;
    }
    const src=ac.createBufferSource(),f=ac.createBiquadFilter(),g=ac.createGain();
    src.buffer=ruido;
    f.type=k==='s'?'bandpass':'highpass';f.frequency.value=k==='s'?1800:7000;
    const dur=k==='s'?0.12:0.04;
    g.gain.setValueAtTime(k==='s'?0.22:0.1,t);g.gain.exponentialRampToValueAtTime(0.0001,t+dur);
    src.connect(f).connect(g).connect(maestro);src.start(t);src.stop(t+dur+0.01);
  }
  function programar(){
    if(!actual||!ac)return;
    const fin=ac.currentTime+0.25;
    for(const v of voces){
      while(v.t<fin){
        const ev=v.ev[v.i],dur=ev.d*v.octavo;
        if(ev.n!=='-'){
          if(v.tipo==='bat')bateria(ev.n,v.t);
          else nota(v.tipo,frec(ev.n),v.t,dur,v.vol,maestro);
        }
        v.t+=dur;v.i=(v.i+1)%v.ev.length;
      }
    }
  }
  function tocar(nombre){
    pendiente=nombre;
    if(!asegurar())return;
    if(actual===nombre)return;
    parar();
    const c=CANCIONES[nombre];if(!c)return;
    actual=nombre;
    const octavo=60/c.tempo/2, t0=ac.currentTime+0.06;
    voces=[{tipo:'square',vol:0.05,ev:parse(c.mel)},{tipo:'triangle',vol:0.09,ev:parse(c.bajo)},{tipo:'bat',ev:parse(c.bat)}]
      .map(v=>Object.assign(v,{t:t0,i:0,octavo}));
    timer=setInterval(programar,40);programar();
  }
  function parar(){if(timer)clearInterval(timer);timer=null;actual=null;}
  // Reanuda la última canción pedida (después de que el jugador toca la pantalla por primera vez o al salir de pausa)
  const reanudar=()=>tocar(pendiente);
  function jingle(nombre){
    if(!ac||!JINGLES[nombre])return;
    asegurar();
    const ev=parse(JINGLES[nombre]),d16=60/170/4;
    let t=ac.currentTime+0.02;
    const g=ac.createGain();g.gain.value=0.09;g.connect(ac.destination);
    for(const e of ev){if(e.n!=='-')nota('square',frec(e.n),t,e.d*d16,1,g);t+=e.d*d16;}
    if(maestro&&cfg.musica){                       // baja la música mientras suena la fanfarria
      maestro.gain.setTargetAtTime(cfg.volumen*0.15,ac.currentTime,0.03);
      maestro.gain.setTargetAtTime(cfg.volumen*0.6,t,0.15);
    }
  }
  return {tocar,parar,reanudar,jingle,volumen};
})();
