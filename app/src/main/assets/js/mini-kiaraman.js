// Merudichis Capuchinis · minijuego Kiara-Man: Kiara se come las croquetas de la casa y los ratoncitos la persiguen
'use strict';
const MiniKiaraman=(()=>{
  const MAPA=[
    '###################',
    '#........#........#',
    '#.##.###.#.###.##.#',
    '#o...............o#',
    '#.##.#.#####.#.##.#',
    '#....#.......#....#',
    '####.#.##-##.#.####',
    '    .#.#RRR#.#.    ',
    '####.#.#####.#.####',
    '#........#........#',
    '#.##.###.#.###.##.#',
    '#o.......K.......o#',
    '###################'];
  const C=19,R=13,PUERTA={x:9,y:6},CASA={x:9,y:7};
  const D={u:{x:0,y:-1},d:{x:0,y:1},l:{x:-1,y:0},r:{x:1,y:0}};
  const RATONES=[{color:'#9e9e9e',nombre:'persigue'},{color:'#8d6e63',nombre:'adelanta'},{color:'#eeeeee',nombre:'azar'},{color:'#424242',nombre:'timido'}];
  let celdas=[], quedan=0, kiaraP=null, ratones=[], quiere=null, puntos=0, susto=0, cadena=0, pausa=0,
      salchicha=null, comidas=0, prev={}, avisoT=0, celda=20, ox=0, oy=0;

  const pared=(x,y,raton)=>{
    if(y<0||y>=R)return true;
    const xx=(x+C)%C, ch=celdas[y][xx];
    if(ch==='#')return true;
    if(ch==='-')return !raton;
    return false;
  };
  function nuevo(x,y,vel){return {x,y,dir:D.l,prog:0,vel,face:-1,anim:0};}
  function colocar(){
    kiaraP=nuevo(9,11,0.11);quiere=null;
    ratones=RATONES.map((r,i)=>Object.assign(nuevo(i===0?9:8+(i%3),i===0?5:7,0.085),{color:r.color,modo:r.nombre,i,
      salida:i*150,comido:false}));
    pausa=60;
  }
  function init(){
    celdas=MAPA.map(f=>f.split(''));
    quedan=0;for(const f of celdas)for(const ch of f)if(ch==='.'||ch==='o')quedan++;
    for(const f of celdas)for(let i=0;i<f.length;i++)if(f[i]==='K'||f[i]==='R')f[i]=' ';
    lives=vidasIniciales();coins=0;frames=0;puntos=0;susto=0;cadena=0;salchicha=null;comidas=0;avisoT=200;
    prev={};colocar();
  }

  function leer(){
    const fl=k=>input[k]&&!prev[k];
    if(input.swipe){quiere=D[input.swipe];input.swipe=null;}
    if(fl('pu')||fl('j'))quiere=D.u; if(fl('pd')||fl('d'))quiere=D.d;
    if(fl('pl')||fl('l'))quiere=D.l; if(fl('pr')||fl('r'))quiere=D.r;
    for(const k of ['pu','pd','pl','pr','j','d','l','r'])prev[k]=input[k];
    input.jp=false;
  }
  // Mueve una entidad por la cuadrícula; "elegir" decide la dirección al llegar a cada celda
  function avanzar(e,vel,elegir,raton){
    if(e.prog===0&&pared(e.x+e.dir.x,e.y+e.dir.y,raton)){elegir(e);if(pared(e.x+e.dir.x,e.y+e.dir.y,raton))return false;}
    e.prog+=vel;
    if(e.prog<1)return true;
    e.prog-=1;
    e.x=(e.x+e.dir.x+C)%C;e.y+=e.dir.y;
    elegir(e);
    if(pared(e.x+e.dir.x,e.y+e.dir.y,raton)){e.prog=0;}
    return true;
  }
  function elegirKiara(e){
    if(quiere&&!pared(e.x+quiere.x,e.y+quiere.y,false))e.dir=quiere;
    if(e.dir.x)e.face=e.dir.x;
  }
  function objetivo(r){
    if(r.comido)return CASA;
    const k=kiaraP;
    if(r.y===7&&r.x>=8&&r.x<=10)return PUERTA;
    if(frames<300)return [{x:17,y:1},{x:1,y:1},{x:17,y:11},{x:1,y:11}][r.i];      // al principio se dispersan
    if(r.modo==='persigue')return k;
    if(r.modo==='adelanta')return {x:k.x+k.dir.x*4,y:k.y+k.dir.y*4};
    if(r.modo==='azar')return {x:(frames>>6)*7%C,y:(frames>>6)*5%R};
    return Math.abs(r.x-k.x)+Math.abs(r.y-k.y)>6?k:{x:1,y:11};
  }
  function elegirRaton(r){
    if(r.comido&&r.x===CASA.x&&r.y===CASA.y){r.comido=false;}
    const ops=Object.values(D).filter(d=>!(d.x===-r.dir.x&&d.y===-r.dir.y)&&!pared(r.x+d.x,r.y+d.y,true));
    if(!ops.length){r.dir={x:-r.dir.x,y:-r.dir.y};return;}
    if(susto>0&&!r.comido){r.dir=ops[Math.floor(Math.random()*ops.length)];return;}
    const o=objetivo(r);
    ops.sort((a,b)=>Math.hypot(r.x+a.x-o.x,r.y+a.y-o.y)-Math.hypot(r.x+b.x-o.x,r.y+b.y-o.y));
    r.dir=ops[0];
  }
  const pos=e=>({x:e.x+e.dir.x*e.prog,y:e.y+e.dir.y*e.prog});

  function step(){
    frames++;
    if(bubble>0)bubble--;
    if(avisoT>0)avisoT--;
    leer();
    if(pausa>0){pausa--;return;}
    if(susto>0)susto--;
    // Kiara
    const k=kiaraP;
    if(quiere&&quiere.x===-k.dir.x&&quiere.y===-k.dir.y&&k.prog>0){   // darse la vuelta en cualquier momento
      k.x=(k.x+k.dir.x+C)%C;k.y+=k.dir.y;k.dir=quiere;k.prog=1-k.prog;if(k.dir.x)k.face=k.dir.x;
    }
    if(k.prog===0)elegirKiara(k);
    if(avanzar(k,k.vel,elegirKiara,false))k.anim+=0.25;
    const ch=celdas[k.y]&&celdas[k.y][k.x];
    if(ch==='.'){celdas[k.y][k.x]=' ';quedan--;comidas++;puntos+=10;if(comidas%2)beep(700,0,.04,'square',.03);}
    else if(ch==='o'){celdas[k.y][k.x]=' ';quedan--;puntos+=50;susto=480;cadena=0;Musica.jingle('poder');}
    if(comidas===70&&!salchicha){salchicha={t:540};comidas++;}
    if(salchicha){
      if(--salchicha.t<=0)salchicha=null;
      else if(k.x===9&&k.y===11){puntos+=100;salchicha=null;sfx.item();}
    }
    // ratoncitos
    for(const r of ratones){
      if(frames<r.salida)continue;
      const vel=r.comido?0.22:susto>0?0.055:r.vel+(frames>3600?0.015:0);
      avanzar(r,vel,elegirRaton,true);
      const a=pos(k),b=pos(r);
      if(Math.hypot(a.x-b.x,a.y-b.y)<0.7){
        if(r.comido)continue;
        if(susto>0){r.comido=true;cadena++;puntos+=200*Math.pow(2,cadena-1);sfx.stomp();Musica.jingle('acierto');}
        else{
          lives--;sfx.hurt();bubble=90;say();
          if(lives<=0){terminarMinijuego('kiaraman',puntos,Math.floor(puntos/60),[`🦴 ${puntos} puntos`],false);return;}
          colocar();return;
        }
      }
    }
    if(quedan<=0){
      terminarMinijuego('kiaraman',puntos+lives*300,Math.floor(puntos/60)+10,[`🏠 ¡Kiara limpió toda la casa!`,`❤ ${lives} vidas (+${lives*300})`],true);
    }
  }

  // ---------- Dibujo ----------
  function raton(r){
    const p=pos(r),x=ox+(p.x+0.5)*celda,y=oy+(p.y+0.5)*celda,s=celda/26;
    cx.save();cx.translate(x,y);cx.scale((r.dir.x||1)*s,s);
    if(r.comido){cx.fillStyle='#fff';cx.beginPath();cx.arc(-4,-2,3.5,0,7);cx.arc(5,-2,3.5,0,7);cx.fill();
      cx.fillStyle='#1e88e5';cx.beginPath();cx.arc(-3,-2,1.6,0,7);cx.arc(6,-2,1.6,0,7);cx.fill();cx.restore();return;}
    const asust=susto>0, tiembla=asust?Math.sin(frames*0.8)*1.2:0;
    cx.translate(tiembla,0);
    cx.strokeStyle=asust?'#90caf9':'#f48fb1';cx.lineWidth=2;cx.beginPath();cx.moveTo(-10,3);cx.quadraticCurveTo(-18,8,-20,0);cx.stroke();
    cx.fillStyle=asust?(susto<120&&Math.floor(frames/8)%2?'#fff':'#1e88e5'):r.color;
    cx.beginPath();cx.ellipse(0,2,11,8,0,0,7);cx.fill();
    cx.beginPath();cx.ellipse(9,-2,6,5,0,0,7);cx.fill();
    cx.fillStyle='#f8bbd0';cx.beginPath();cx.arc(6,-8,4,0,7);cx.fill();
    cx.fillStyle='#111';cx.beginPath();cx.arc(11,-3,1.5,0,7);cx.arc(15,-1,1.5,0,7);cx.fill();
    cx.restore();
  }
  function draw(){
    cx.setTransform(dpr,0,0,dpr,0,0);
    cx.fillStyle='#3e2723';cx.fillRect(0,0,W,H);
    const libre=W-170;
    celda=Math.max(8,Math.floor(Math.min(libre/C,(H-44)/R)));
    ox=Math.floor(cfg.swap?170+(libre-celda*C)/2:(libre-celda*C)/2);oy=Math.floor(44+((H-44)-celda*R)/2);
    for(let y=0;y<R;y++)for(let x=0;x<C;x++){
      const ch=celdas[y][x],px=ox+x*celda,py=oy+y*celda;
      if(ch==='#'){cx.fillStyle='#8d6e63';cx.fillRect(px,py,celda,celda);cx.fillStyle='#a1887f';cx.fillRect(px,py,celda,celda*0.25);}
      else{cx.fillStyle=(x+y)%2?'#f5e6c8':'#efdcb5';cx.fillRect(px,py,celda,celda);
        if(ch==='-'){cx.fillStyle='#f06292';cx.fillRect(px,py+celda*0.4,celda,celda*0.2);}
        if(ch==='.'){cx.fillStyle='#795548';cx.beginPath();cx.arc(px+celda/2,py+celda/2,celda*0.13,0,7);cx.fill();}
        if(ch==='o'){const s=celda/24*(1+Math.sin(frames*0.15)*0.15);cx.save();cx.translate(px+celda/2,py+celda/2);cx.scale(s,s);
          cx.fillStyle='#fff8e1';cx.strokeStyle='#8d6e63';cx.lineWidth=1.5;cx.beginPath();cx.rect(-7,-3,14,6);cx.fill();cx.stroke();
          for(const [bx,by] of [[-7,-3],[-7,3],[7,-3],[7,3]]){cx.beginPath();cx.arc(bx,by,3.5,0,7);cx.fill();cx.stroke();}cx.restore();}
      }
    }
    if(salchicha){const x=ox+9.5*celda,y=oy+11.5*celda;cx.fillStyle='#c62828';rr(x-celda*0.45,y-celda*0.18,celda*0.9,celda*0.36,celda*0.18);cx.fill();}
    for(const r of ratones)raton(r);
    const p=pos(kiaraP);
    const pose=pausa>0?'k_parada':Math.floor(kiaraP.anim)%2?'k_correA':'k_correB';
    Personajes.kiara(cx,pose,ox+(p.x+0.5)*celda,oy+(p.y+0.95)*celda,kiaraP.face,celda*1.25);
    if(bubble>0)drawSpeech(ox+(p.x+0.5)*celda,oy+p.y*celda,bubble);
    cx.textBaseline='middle';cx.font='bold 18px system-ui,Arial';cx.textAlign='left';
    txt('🦴 '+puntos,12,22);txt('❤ '+lives,130,22);txt('Mejor: '+Progreso.puntaje('kiaraman'),190,22);
    if(susto>0){cx.fillStyle='#1e88e5';cx.fillRect(330,16,120*susto/480,10);}
    if(avisoT>0||pausa>0){cx.textAlign='center';cx.font='bold 20px system-ui,Arial';
      txt(pausa>0&&avisoT<=0?'¡Lista!':'Come todas las croquetas · el hueso grande asusta a los ratones',ox+C*celda/2,oy+7.5*celda);cx.textAlign='left';}
  }
  return {init,step,draw};
})();
