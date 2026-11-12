// Merudichis Capuchinis · bucle principal y cambio de nivel
'use strict';
const NIVELES={1:Nivel1,'1px':Nivel1Pixel,px2:Nivel1_2,px3:Nivel1_3,px4:Nivel1_4,2:Nivel2,3:Nivel3,4:Nivel4,5:Nivel5,
  kiaraman:MiniKiaraman,trastes:MiniTrastes,saltarina:MiniSaltarina,memorama:MiniMemorama};
const CANCION={1:'nivel1','1px':'pixel',px2:'desierto',px3:'cueva',px4:'nieve',2:'carrera',3:'viborita',4:'kiara',5:'jefe',
  kiaraman:'mini',trastes:'mini',saltarina:'kiara',memorama:'tranquila'};

function startLevel(n){
  level=n;
  NIVELES[level].init();
  bubble=0;
  for(const k in input)input[k]=k==='swipe'?null:false;
  document.body.classList.toggle('n4',level===4);   // botones de olfatear y ladrar
  document.body.classList.toggle('dpad',level===3||level==='kiaraman');   // cruz direccional
  document.body.classList.toggle('mini',!!MINIJUEGOS[level]);          // los minijuegos no usan los botones de plataforma
}

let last=0,accT=0;
function loop(t){
  requestAnimationFrame(loop);
  const dt=Math.min(0.1,(t-last)/1000||0);last=t;
  const nv=NIVELES[level];
  if(state==='play'){
    accT+=dt;
    while(accT>=1/60){nv.step();accT-=1/60;if(state!=='play'){accT=0;break;}}
  } else if(state==='menu')frames++;
  nv.draw();
}
startLevel(1);Musica.tocar('menu');showOverlay();requestAnimationFrame(loop);
