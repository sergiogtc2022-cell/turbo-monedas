// Merudichis Capuchinis · minijuego Defiende el patio: pon ayudantes en el pasto para que los zombies no lleguen a la casa
'use strict';
const MiniPatio=(()=>{
  const FILAS=5, COLS=9, DURA=150*60;     // 2.5 minutos de oleadas
  const AYUDAS={
    kiara: {nombre:'Kiara',  costo:50,vida:6, recarga:300},
    maceta:{nombre:'Maceta', costo:25,vida:30,recarga:420},
    plato: {nombre:'Croquetas',costo:25,vida:6,recarga:300}
  };
  const ZOMBIS={normal:{vida:5,vel:0.22},rapido:{vida:3,vel:0.42},cubeta:{vida:13,vel:0.2}};
  let celda=40, ox=0, oy=0, croquetas=75, elegida='kiara', ayudas=[], zombis=[], ladridos=[], flotan=[], recargas={},
      vencidos=0, prox=600, avisoT=0, fin=false;

  function init(){
    frames=0;coins=0;croquetas=75;elegida='kiara';ayudas=[];zombis=[];ladridos=[];flotan=[];vencidos=0;prox=600;avisoT=260;fin=false;
    recargas={kiara:0,maceta:0,plato:0};
  }
  function medidas(){
    const arriba=62, casa=Math.min(110,W*0.13);
    celda=Math.floor(Math.min((W-casa-16)/COLS,(H-arriba-8)/FILAS));
    ox=Math.floor(casa+((W-casa)-celda*COLS)/2);oy=arriba;
  }
  const tarjetas=()=>Object.keys(AYUDAS).map((id,i)=>({id,x:12+i*112,y:6,w:104,h:50}));

  function toque(tipo,x,y){
    if(tipo!=='down')return;
    for(const t of tarjetas())if(x>=t.x&&x<=t.x+t.w&&y>=t.y&&y<=t.y+t.h){elegida=t.id;beep(600,0,.05,'square',.04);return;}
    const c=Math.floor((x-ox)/celda),f=Math.floor((y-oy)/celda);
    if(c<0||c>=COLS||f<0||f>=FILAS)return;
    if(ayudas.some(a=>a.c===c&&a.f===f))return;
    const a=AYUDAS[elegida];
    if(croquetas<a.costo){flotan.push({x,y,t:50,txt:'Faltan croquetas'});Musica.jingle('error');return;}
    if(recargas[elegida]>0){flotan.push({x,y,t:50,txt:'Espera un momento'});return;}
    croquetas-=a.costo;recargas[elegida]=a.recarga;
    ayudas.push({tipo:elegida,c,f,vida:a.vida,t:0,ladra:0});sfx.item();
  }
  function crearZombi(){
    const s=frames/DURA;
    const r=Math.random();
    const tipo=s>0.35&&r<0.25?'cubeta':s>0.15&&r<0.5?'rapido':'normal';
    zombis.push({tipo,f:Math.floor(Math.random()*FILAS),x:COLS+0.3,vida:ZOMBIS[tipo].vida,come:0,golpe:0,anim:Math.random()*6});
  }
  function step(){
    frames++;
    if(avisoT>0)avisoT--;
    for(const k in recargas)if(recargas[k]>0)recargas[k]--;
    if(frames%600===0)croquetas+=25;                     // croquetas que caen solas
    // oleadas: cada vez más seguidas; al final una oleada grande
    if(frames<DURA&&--prox<=0){
      crearZombi();
      const s=frames/DURA;prox=Math.max(70,420-s*360)+Math.random()*80;
      if(s>0.9&&Math.random()<0.5)crearZombi();
    }
    if(frames===DURA-600){for(let i=0;i<6;i++)crearZombi();Musica.jingle('gigante');flotan.push({x:W/2,y:H/2,t:120,txt:'¡Viene la oleada final!'});}
    // ayudantes
    for(const a of ayudas){
      a.t++;if(a.ladra>0)a.ladra--;
      if(a.tipo==='kiara'&&a.t%90===0&&zombis.some(z=>z.f===a.f&&z.x>a.c)){ladridos.push({f:a.f,x:a.c+0.6});a.ladra=20;if(Math.random()<0.35)sfx.ladrido();}
      if(a.tipo==='plato'&&a.t%420===0){croquetas+=25;flotan.push({x:ox+(a.c+0.5)*celda,y:oy+a.f*celda,t:50,txt:'+25'});}
    }
    for(const l of ladridos){
      l.x+=0.09;
      const z=zombis.find(z=>z.f===l.f&&Math.abs(z.x-l.x)<0.4&&z.vida>0);
      if(z){z.vida--;z.golpe=8;l.fuera=true;}
      if(l.x>COLS+1)l.fuera=true;
    }
    ladridos=ladridos.filter(l=>!l.fuera);
    // zombies: caminan; si hay un ayudante enfrente se lo comen
    for(const z of zombis){
      if(z.golpe>0)z.golpe--;
      if(z.vida<=0){z.fuera=true;vencidos++;coins++;sfx.stomp();continue;}
      const frente=ayudas.find(a=>a.f===z.f&&z.x-a.c>0.3&&z.x-a.c<1.05);
      if(frente){if(++z.come%40===0){frente.vida--;beep(150,100,.06,'square',.04);}if(frente.vida<=0)frente.fuera=true;}
      else{z.x-=ZOMBIS[z.tipo].vel/60*3;z.anim+=0.1;}
      if(z.x<-0.4&&!fin){fin=true;
        terminarMinijuego('patio',vencidos*10,vencidos,[`🧟 Zombies detenidos: ${vencidos}`,'¡Un zombie entró a la casa!'],false);return;}
    }
    zombis=zombis.filter(z=>!z.fuera);ayudas=ayudas.filter(a=>!a.fuera);
    for(const t of flotan){t.t--;t.y-=0.5;}flotan=flotan.filter(t=>t.t>0);
    if(frames>=DURA&&!zombis.length&&!fin){fin=true;
      terminarMinijuego('patio',vencidos*10+500,vencidos+20,[`🧟 Zombies detenidos: ${vencidos}`,'🏠 ¡La casa está a salvo! (+500)'],true);}
  }

  function zombi(z){
    const x=ox+z.x*celda,by=oy+(z.f+1)*celda-4,s=celda/60;
    cx.save();cx.translate(x,by);cx.scale(-s,s);
    if(z.golpe>0)cx.globalAlpha=0.5;
    const p=Math.sin(z.anim)*4;
    cx.fillStyle='#3e2f5b';cx.fillRect(-9+p,-22,7,22);cx.fillRect(2-p,-22,7,22);
    cx.fillStyle=z.tipo==='rapido'?'#6a4e2e':'#4e6e4e';cx.fillRect(-12,-48,24,28);
    cx.strokeStyle='#7a9a6a';cx.lineWidth=5;cx.beginPath();cx.moveTo(8,-44);cx.lineTo(26,-42);cx.moveTo(8,-36);cx.lineTo(24,-32);cx.stroke();
    cx.fillStyle='#8fae7a';cx.beginPath();cx.arc(2,-58,12,0,7);cx.fill();
    cx.fillStyle='#d32f2f';cx.beginPath();cx.arc(7,-60,2.5,0,7);cx.arc(0,-60,2.5,0,7);cx.fill();
    if(z.tipo==='cubeta'){cx.fillStyle='#90a4ae';cx.beginPath();cx.moveTo(-11,-66);cx.lineTo(13,-66);cx.lineTo(10,-80);cx.lineTo(-8,-80);cx.closePath();cx.fill();}
    cx.restore();cx.globalAlpha=1;
  }
  function ayuda(a){
    const x=ox+(a.c+0.5)*celda,by=oy+(a.f+1)*celda-4;
    if(a.tipo==='kiara')Personajes.kiara(cx,a.ladra>0?'k_ladra':'k_parada',x,by,1,celda*0.75);
    else if(a.tipo==='maceta'){const s=celda/40;cx.fillStyle='#a1542b';cx.beginPath();cx.moveTo(x-12*s,by-22*s);cx.lineTo(x+12*s,by-22*s);cx.lineTo(x+9*s,by);cx.lineTo(x-9*s,by);cx.fill();
      cx.fillStyle='#43a047';cx.beginPath();cx.arc(x-5*s,by-28*s,7*s,0,7);cx.arc(x+5*s,by-30*s,8*s,0,7);cx.fill();cx.fillStyle='#e91e63';cx.beginPath();cx.arc(x+4*s,by-34*s,3*s,0,7);cx.fill();}
    else{const s=celda/40;cx.fillStyle='#e53935';cx.beginPath();cx.ellipse(x,by-6*s,15*s,7*s,0,0,Math.PI);cx.fill();cx.fillStyle='#795548';for(let i=0;i<5;i++){cx.beginPath();cx.arc(x-8*s+i*4*s,by-7*s,2.5*s,0,7);cx.fill();}}
    const max=AYUDAS[a.tipo].vida;
    if(a.vida<max){cx.fillStyle='#000';cx.fillRect(x-celda*0.3,by-celda*0.9,celda*0.6,4);cx.fillStyle='#76ff03';cx.fillRect(x-celda*0.3,by-celda*0.9,celda*0.6*a.vida/max,4);}
  }
  function draw(){
    cx.setTransform(dpr,0,0,dpr,0,0);medidas();
    cx.fillStyle='#8d6e63';cx.fillRect(0,0,W,H);
    // casa
    const casa=ox-6;
    cx.fillStyle='#ffcc80';cx.fillRect(0,oy,casa,celda*FILAS);
    cx.fillStyle='#c62828';cx.beginPath();cx.moveTo(0,oy);cx.lineTo(casa,oy);cx.lineTo(casa/2,oy-26);cx.fill();
    cx.fillStyle='#6d4c41';cx.fillRect(casa*0.3,oy+celda*FILAS*0.55,casa*0.4,celda*FILAS*0.45);
    for(let f=0;f<FILAS;f++)for(let c=0;c<COLS;c++){cx.fillStyle=(f+c)%2?'#7cb342':'#8bc34a';cx.fillRect(ox+c*celda,oy+f*celda,celda,celda);}
    for(const a of ayudas)ayuda(a);
    for(const l of ladridos){const x=ox+l.x*celda,y=oy+(l.f+0.55)*celda;cx.strokeStyle='#fff';cx.lineWidth=2;
      for(let i=0;i<3;i++){cx.beginPath();cx.arc(x-i*6,y,6+i*3,-0.7,0.7);cx.stroke();}}
    for(const z of zombis.slice().sort((a,b)=>a.f-b.f))zombi(z);
    // tarjetas
    for(const t of tarjetas()){
      const a=AYUDAS[t.id],ok=croquetas>=a.costo&&recargas[t.id]===0;
      cx.fillStyle=elegida===t.id?'#fff59d':'rgba(255,255,255,.85)';rr(t.x,t.y,t.w,t.h,8);cx.fill();
      if(elegida===t.id){cx.strokeStyle='#f57f17';cx.lineWidth=3;rr(t.x,t.y,t.w,t.h,8);cx.stroke();}
      if(recargas[t.id]>0){cx.fillStyle='rgba(0,0,0,.25)';cx.fillRect(t.x,t.y,t.w*recargas[t.id]/a.recarga,t.h);}
      cx.globalAlpha=ok?1:0.5;
      const mini={tipo:t.id,c:0,f:0,vida:a.vida};
      const gx=ox,gy=oy,gc=celda;ox=t.x+24-celda/2;oy=t.y+t.h-celda+2;celda=Math.min(gc,44);ayuda(mini);ox=gx;oy=gy;celda=gc;
      cx.fillStyle='#3e2723';cx.font='bold 13px system-ui,Arial';cx.textBaseline='middle';cx.textAlign='left';
      cx.fillText(a.nombre,t.x+46,t.y+16);cx.fillText('🦴 '+a.costo,t.x+46,t.y+36);cx.globalAlpha=1;
    }
    cx.font='bold 18px system-ui,Arial';cx.textAlign='left';
    txt('🦴 '+croquetas,360,22);
    txt('🧟 '+vencidos,460,22);
    const resto=Math.max(0,DURA-frames);txt('⏱ '+fmtSeg(resto/60),530,22);
    cx.textAlign='center';
    for(const t of flotan){cx.font='bold 16px system-ui,Arial';cx.globalAlpha=Math.min(1,t.t/20);txt(t.txt,t.x,t.y);cx.globalAlpha=1;}
    if(avisoT>0){cx.font='bold 18px system-ui,Arial';cx.globalAlpha=Math.min(1,avisoT/30);
      txt('Elige un ayudante arriba y toca el pasto para ponerlo. ¡Que ningún zombie llegue a la casa!',W/2,H*0.55);cx.globalAlpha=1;}
    cx.textAlign='left';
  }
  return {init,step,draw,toque};
})();
