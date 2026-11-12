// Merudichis Capuchinis · bucle principal y cambio de nivel
'use strict';
const NIVELES={1:Nivel1,2:Nivel2};

function startLevel(n){
  level=n;
  NIVELES[level].init();
  bubble=0;
  for(const k in input)input[k]=false;
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
startLevel(1);showOverlay();requestAnimationFrame(loop);
