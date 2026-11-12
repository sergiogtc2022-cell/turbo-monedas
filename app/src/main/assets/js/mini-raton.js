// Merudichis Capuchinis · minijuego Pégale al ratón: salen ratones de los hoyos; tócalos antes de que se escondan.
// El ratón dorado vale 3. Si sale Kiara, no le pegues (resta 3). Dura 60 segundos y cada vez salen más rápido.
'use strict';
const MiniRaton=(()=>{
  const FILAS=3,COLS=3,DURA=60*60;
  let hoyos=[], puntos=0, t=0, sigT=0, golpes=[], fallas=0;
  function geometria(){
    const w=Math.min(W*0.8,H*1.25),h=H*0.72,x0=(W-w)/2,y0=H*0.22;
    return {w:w/COLS,h:h/FILAS,x0,y0};
  }
  function init(){frames=0;coins=0;puntos=0;t=0;sigT=40;golpes=[];fallas=0;
    hoyos=[];for(let i=0;i<FILAS*COLS;i++)hoyos.push({quien:null,sube:0,vida:0,golpeado:0});}
  function sacar(){
    const libres=hoyos.filter(h=>!h.quien);if(!libres.length)return;
    const h=libres[Math.floor(Math.random()*libres.length)],r=Math.random();
    h.quien=r<0.12?'kiara':r<0.24?'dorado':'raton';h.sube=0;h.golpeado=0;
    h.vida=Math.max(38,100-t/60*1.1);
  }
  function toque(tipo,x,y){
    if(tipo!=='down')return;
    const g=geometria();
    const c=Math.floor((x-g.x0)/g.w),f=Math.floor((y-g.y0)/g.h);
    if(c<0||c>=COLS||f<0||f>=FILAS)return;
    const h=hoyos[f*COLS+c];
    golpes.push({x,y,t:12});
    if(!h.quien||h.golpeado||h.sube<0.4){beep(150,110,.05,'square',.03);return;}
    h.golpeado=20;
    if(h.quien==='kiara'){puntos=Math.max(0,puntos-3);sfx.hurt();Musica.jingle('error');}
    else{const v=h.quien==='dorado'?3:1;puntos+=v;if(h.quien==='dorado'){coins++;sfx.coin();}else sfx.stomp();}
  }
  function step(){
    frames++;t++;
    if(--sigT<=0){sacar();if(t>DURA*0.5&&Math.random()<0.5)sacar();sigT=Math.max(14,45-t/60*0.5);}
    for(const h of hoyos){if(!h.quien)continue;
      if(h.golpeado){if(--h.golpeado<=0)h.quien=null;continue;}
      h.vida--;h.sube=Math.min(1,h.sube+0.15);
      if(h.vida<10)h.sube=Math.max(0,h.vida/10);
      if(h.vida<=0){if(h.quien!=='kiara')fallas++;h.quien=null;}}
    for(const g of golpes)g.t--;golpes=golpes.filter(g=>g.t>0);
    if(t>=DURA)terminarMinijuego('raton',puntos,coins+Math.floor(puntos/5),[`🐭 ${puntos} puntos`,`🪙 ${coins} ratones dorados`,`Se escaparon ${fallas}`],false);
  }
  function raton(x,y,s,dorado,golpeado){
    cx.save();cx.translate(x,y);cx.scale(s,s);
    const c=dorado?'#ffca28':'#9e9e9e',o=dorado?'#c98a00':'#616161';
    cx.fillStyle=c;cx.beginPath();cx.arc(-18,-46,11,0,7);cx.arc(18,-46,11,0,7);cx.fill();
    cx.fillStyle='#f8bbd0';cx.beginPath();cx.arc(-18,-46,6,0,7);cx.arc(18,-46,6,0,7);cx.fill();
    cx.fillStyle=c;cx.beginPath();cx.ellipse(0,-22,24,26,0,0,7);cx.fill();cx.strokeStyle=o;cx.lineWidth=2;cx.stroke();
    cx.fillStyle='#111';
    if(golpeado){cx.font='bold 14px Arial';cx.textAlign='center';cx.fillText('x',-9,-26);cx.fillText('x',9,-26);cx.textAlign='left';}
    else{cx.beginPath();cx.arc(-9,-28,3.5,0,7);cx.arc(9,-28,3.5,0,7);cx.fill();}
    cx.fillStyle='#e91e63';cx.beginPath();cx.arc(0,-16,4,0,7);cx.fill();
    cx.strokeStyle='#333';cx.lineWidth=1.2;cx.beginPath();for(const d of[-1,1]){cx.moveTo(d*6,-15);cx.lineTo(d*26,-20);cx.moveTo(d*6,-13);cx.lineTo(d*26,-10);}cx.stroke();
    cx.restore();
  }
  function draw(){
    cx.setTransform(dpr,0,0,dpr,0,0);
    cx.fillStyle='#7cb342';cx.fillRect(0,0,W,H);cx.fillStyle='#8bc34a';for(let i=0;i<60;i++)cx.fillRect((i*137)%W,(i*71)%H,3,8);
    if(!hoyos.length)return;
    const g=geometria(),s=Math.min(g.w,g.h)/110;
    for(let f=0;f<FILAS;f++)for(let c=0;c<COLS;c++){
      const h=hoyos[f*COLS+c],x=g.x0+c*g.w+g.w/2,y=g.y0+f*g.h+g.h*0.72;
      cx.fillStyle='#3e2723';cx.beginPath();cx.ellipse(x,y,42*s,14*s,0,0,7);cx.fill();
      if(h.quien){
        cx.save();cx.beginPath();cx.rect(x-60*s,y-110*s,120*s,110*s);cx.clip();
        const dy=(1-h.sube)*70*s;
        if(h.quien==='kiara')Personajes.kiara(cx,'k_ladra',x,y+dy+4*s,1,62*s);
        else raton(x,y+dy+6*s,s,h.quien==='dorado',h.golpeado>0);
        cx.restore();
      }
      cx.fillStyle='#5d4037';cx.beginPath();cx.ellipse(x,y+2*s,44*s,8*s,0,0,Math.PI);cx.fill();
    }
    for(const gp of golpes){cx.globalAlpha=gp.t/12;cx.fillStyle='#ffeb3b';cx.beginPath();cx.arc(gp.x,gp.y,30-gp.t*1.5,0,7);cx.fill();}
    cx.globalAlpha=1;
    cx.textBaseline='middle';cx.textAlign='left';cx.font='bold 20px system-ui,Arial';
    txt('🐭 '+puntos,12,24);txt('⏱ '+Math.ceil((DURA-t)/60),110,24);txt('Mejor: '+Progreso.puntaje('raton'),190,24);
    if(t<150){cx.textAlign='center';cx.font='bold 18px system-ui,Arial';txt('¡Pégale a los ratones! A Kiara no 🐶',W/2,H*0.14);cx.textAlign='left';}
  }
  return {init,step,draw,toque};
})();
