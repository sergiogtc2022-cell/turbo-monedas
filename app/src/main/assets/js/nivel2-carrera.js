// Merudichis Capuchinis · Nivel 2: Gran Premio (carrera en pseudo-3D con carretera por segmentos)
'use strict';

// Autos que puede elegir el jugador (formas genéricas, sin marcas)
const AUTOS={
  sedan:   {nombre:'Sedán rojo',       color:'#c62828',tipo:'sedan',   top:1.00,acel:1.00,giro:0.92},
  compacto:{nombre:'Compacto azul',    color:'#1e5bd8',tipo:'compacto',top:0.95,acel:1.12,giro:1.15},
  hatch:   {nombre:'Hatchback blanco', color:'#f2f2f2',tipo:'hatch',   top:0.97,acel:1.06,giro:1.04}
};

const Nivel2=(()=>{
  const SEG=200, RW=1400, RUMBLE=3, CAM_H=1000, DRAW=200, LAPS=3;
  const DEPTH=1/Math.tan(50*Math.PI/180);
  const PLAYER_Z=CAM_H*DEPTH;
  const MAXV=SEG*60, ACCEL=MAXV/5, OFF_DECEL=-MAXV/2, OFF_LIMIT=MAXV/4, CENTRIF=0.3;
  const PW=0.31;                         // ancho del auto en medios-anchos de carretera
  const RIVALES=[
    {nombre:'Gris',    color:'#8a8f98',tipo:'sedan',   placa:'QRO'},
    {nombre:'Negro',   color:'#262626',tipo:'hatch',   placa:'JAL'},
    {nombre:'Verde',   color:'#2e9e4f',tipo:'compacto',placa:'AGS'},
    {nombre:'Amarillo',color:'#f2c200',tipo:'sedan',   placa:'MICH'},
    {nombre:'Naranja', color:'#ef6c00',tipo:'hatch',   placa:'CDMX'}
  ];
  const FORMAS={
    sedan:   {h:0.52,cabTop:0.58,cabBot:0.84,belt:0.52,luz:'ancha'},
    compacto:{h:0.70,cabTop:0.66,cabBot:0.88,belt:0.50,luz:'vertical'},
    hatch:   {h:0.62,cabTop:0.74,cabBot:0.90,belt:0.50,luz:'franja'}
  };

  let segs=[], trackLen=0, pdist=0, speed=0, px=0, autos=[], skyOff=0, count=0, raceF=0,
      hopT=0, spinT=0, boostT=0, steer=0, place=6, lastLap=1, yo=AUTOS.sedan, finalPlace=6;

  // ---------- Construcción de la pista ----------
  const lastY=()=>segs.length?segs[segs.length-1].p2.world.y:0;
  function addSeg(curve,y){
    const n=segs.length;
    segs.push({index:n,curve,sprites:[],autos:[],decal:null,clip:0,start:false,
      p1:{world:{y:lastY(),z:n*SEG},camera:{},screen:{}},
      p2:{world:{y:y,z:(n+1)*SEG},camera:{},screen:{}},
      dark:Math.floor(n/RUMBLE)%2===1});
  }
  const easeIn=(a,b,p)=>a+(b-a)*p*p;
  const easeInOut=(a,b,p)=>a+(b-a)*((-Math.cos(p*Math.PI)/2)+0.5);
  function road(enter,hold,leave,curve,hill){
    const sy=lastY(), ey=sy+hill*SEG, tot=enter+hold+leave;
    for(let i=0;i<enter;i++)addSeg(easeIn(0,curve,i/enter),easeInOut(sy,ey,i/tot));
    for(let i=0;i<hold;i++)addSeg(curve,easeInOut(sy,ey,(enter+i)/tot));
    for(let i=0;i<leave;i++)addSeg(easeInOut(curve,0,i/leave),easeInOut(sy,ey,(enter+hold+i)/tot));
  }
  function build(){
    segs=[];
    road(30,40,30,0,0);
    road(40,60,40,3,15);
    road(30,40,30,0,-15);
    road(30,40,30,-4,0);
    road(30,40,30,4,10);
    road(40,80,40,-2,25);
    road(30,60,30,0,-25);
    road(40,50,40,5,0);
    road(30,40,30,-3,-10);
    road(40,60,40,2,20);
    road(40,60,40,0,-lastY()/SEG);       // regresa a la altura de salida
    trackLen=segs.length*SEG;
    const startSeg=Math.floor(PLAYER_Z/SEG);
    segs[startSeg].start=segs[startSeg+1].start=true;

    let seed=11;const rand=()=>(seed=(seed*16807)%2147483647)/2147483647;
    for(let n=12;n<segs.length;n+=4){
      if(rand()<0.6){const side=rand()<.5?-1:1;
        segs[n].sprites.push({t:rand()<.55?'arbol':'cactus',off:side*(1.45+rand()*1.6),w:rand()<.5?0.45:0.32});}
    }
    for(let n=20;n<segs.length;n++){
      if(segs[n].curve!==0&&segs[n-1].curve===0&&n>=12){
        const d=Math.sign(segs[n].curve);
        for(const k of [12,6])segs[n-k].sprites.push({t:'letrero',off:d>0?-1.3:1.3,w:0.35,dir:d});
      }
    }
    for(let n=60;n<segs.length-30;n+=70){
      const off=[-0.6,0,0.6][Math.floor(rand()*3)];
      for(let k=0;k<5;k++)segs[n+k*3].sprites.push({t:'moneda',off,w:0.12,ph:k});
    }
    for(let n=120;n<segs.length-20;n+=160){
      const off=[-0.5,0,0.5][Math.floor(rand()*3)];
      for(let k=0;k<8;k++)segs[n+k].decal={t:'turbo',off,w:0.4};
    }
    for(let n=200;n<segs.length-20;n+=190){
      if(segs[n].decal||segs[n+5].decal)continue;
      const off=[-0.5,0,0.5][Math.floor(rand()*3)];
      for(let k=0;k<5;k++)segs[n+k].decal={t:'aceite',off,w:0.45};
    }
  }

  const wrapZ=z=>((z%trackLen)+trackLen)%trackLen;
  const findSeg=z=>segs[Math.floor(wrapZ(z)/SEG)%segs.length];
  const wd=d=>{d=wrapZ(d);return d>trackLen/2?d-trackLen:d;};

  function init(){
    yo=Object.assign({},AUTOS[cfg.car]||AUTOS.sedan);
    if(Progreso.equipo('pintura'))yo.color=Progreso.equipo('pintura');
    build();
    pdist=0;speed=0;px=0;skyOff=0;count=0;raceF=0;hopT=0;spinT=0;boostT=0;steer=0;
    coins=0;frames=0;bubble=0;lastLap=1;place=6;
    autos=RIVALES.map((r,i)=>Object.assign({},r,{
      dist:PLAYER_Z+SEG*(4+i*4),off:i%2?-0.5:0.5,tOff:i%2?-0.5:0.5,speed:0,
      top:MAXV*(0.84+0.02*i),tt:60+i*40}));
  }

  function choque(){
    beep(160,60,.18,'square',.09);
    if(bubble<=0){bubble=100;say();}
  }

  // ---------- Lógica ----------
  function step(){
    frames++;
    const dt=1/60;
    if(bubble>0)bubble--;
    if(count<180){                       // semáforo 3, 2, 1
      if(count%60===0)beep(440,0,.15,'square',.08);
      count++;
      if(count===180)beep(880,0,.45,'square',.08);
      input.jp=false;return;
    }
    if(count<240)count++;
    raceF++;

    const seg=findSeg(pdist+PLAYER_Z), sp=speed/MAXV;
    const top=MAXV*(0.92+Math.min(coins,10)*0.01)*yo.top*(boostT>0?1.3:1);

    // dirección
    let s=0;
    if(spinT>0)spinT--;
    else if(input.l||input.r){if(input.l)s-=1;if(input.r)s+=1;}        // botones o teclado
    else if(cfg.volante==='inclinar')s=input.inclinacion;              // inclinar el celular
    else if(input.volante!=null)s=input.volante;                       // arrastrar el dedo
    steer+=(s-steer)*0.25;
    const dx=dt*2*sp*yo.giro;
    px+=steer*dx;
    px-=dx*sp*seg.curve*CENTRIF;

    // velocidad (acelera solo)
    if(spinT>0)speed-=MAXV*0.6*dt; else speed+=ACCEL*yo.acel*dt;
    if(speed>top)speed=Math.max(top,speed-MAXV*0.5*dt);
    if((px<-1||px>1)&&speed>OFF_LIMIT)speed+=OFF_DECEL*dt;
    speed=Math.max(0,speed);
    px=Math.max(-2.3,Math.min(2.3,px));
    if(boostT>0)boostT--;

    // brinco
    if(input.jp){input.jp=false;if(hopT===0){hopT=22;beep(300,620,.12,'square',.04);}}
    if(hopT>0)hopT--;

    pdist+=speed*dt;
    skyOff+=0.0015*seg.curve*sp;

    // turbo y aceite
    const pseg=findSeg(pdist+PLAYER_Z);
    const d=pseg.decal;
    if(d&&hopT===0&&Math.abs(px-d.off)<d.w/2+PW*0.3){
      if(d.t==='turbo'){if(boostT<60){sfx.boost();Musica.jingle('turbo');}boostT=100;speed=Math.max(speed,MAXV*1.1);}
      else if(spinT===0){spinT=45;beep(600,150,.4,'sawtooth',.05);}
    }
    // monedas
    for(const sg of [pseg,segs[(pseg.index+1)%segs.length]])
      for(const o of sg.sprites)
        if(o.t==='moneda'&&!o.got&&Math.abs(px-o.off)<0.22){o.got=true;coins++;sfx.coin();}
    // árboles y letreros fuera de la carretera
    if(Math.abs(px)>1)for(const o of pseg.sprites){
      if(o.t==='moneda')continue;
      if(Math.abs(px-o.off)<(PW+o.w)/2*0.7){speed=Math.min(speed,MAXV/8);px+=px>0?-0.12:0.12;beep(120,60,.1,'square',.06);}
    }

    // rivales
    const me=pdist+PLAYER_Z;
    for(const k of autos){
      const ahead=k.dist-me;
      let tgt=k.top;
      if(ahead>trackLen*0.15)tgt*=0.9; else if(ahead<-trackLen*0.08)tgt*=1.1;
      if(k.speed<tgt)k.speed+=ACCEL*0.9*dt; else k.speed=Math.max(tgt,k.speed-MAXV*0.3*dt);
      if(--k.tt<=0){k.tt=120+Math.random()*180;k.tOff=[-0.6,-0.2,0.2,0.6][Math.floor(Math.random()*4)];}
      for(const o of autos.concat([{dist:me,off:px,speed}])){
        if(o===k)continue;
        const g=wd(o.dist-k.dist);
        if(g>0&&g<SEG*6&&Math.abs(o.off-k.off)<0.5&&k.speed>o.speed)
          k.tOff=Math.max(-0.8,Math.min(0.8,o.off>0?o.off-0.75:o.off+0.75));
      }
      k.off+=(k.tOff-k.off)*0.03;
      k.dist+=k.speed*dt;

      const g=wd(k.dist-me);
      if(Math.abs(g)<SEG*1.1&&Math.abs(px-k.off)<PW*0.9&&hopT===0){
        if(g>0&&speed>k.speed){speed=k.speed*0.85;pdist-=(SEG*1.1-g);choque();}
        else if(g<=0&&k.speed>speed){k.speed=speed*0.85;k.dist-=(SEG*1.1+g);choque();}
        px+=px>k.off?0.04:-0.04;
      }
    }

    // vueltas y lugar
    const lap=Math.floor(pdist/trackLen)+1;
    if(lap>lastLap){
      lastLap=lap;
      if(lap<=LAPS){sfx.check();for(const sg of segs)for(const o of sg.sprites)o.got=false;}
    }
    place=1+autos.filter(k=>k.dist>pdist+PLAYER_Z).length;
    if(pdist>=LAPS*trackLen){
      finalPlace=place;Musica.parar();Musica.jingle('victoria');
      const medalla=place===1?'🥇':place===2?'🥈':place===3?'🥉':'🏁';
      terminarNivel(2,raceF/60,coins,place===1?3:place<=3?2:1,[`${medalla} Llegaste ${place}° de ${autos.length+1}`,yo.nombre]);
    }
  }

  // ---------- Dibujo ----------
  function project(p,camX,camY,camZ){
    p.camera.x=-camX;p.camera.y=p.world.y-camY;p.camera.z=p.world.z-camZ;
    const s=p.screen.scale=DEPTH/p.camera.z;
    p.screen.x=Math.round(W/2+s*p.camera.x*W/2);
    p.screen.y=Math.round(H/2-s*p.camera.y*H/2);
    p.screen.w=Math.round(s*RW*W/2);
  }
  function poly(x1,y1,x2,y2,x3,y3,x4,y4,color){
    cx.fillStyle=color;cx.beginPath();cx.moveTo(x1,y1);cx.lineTo(x2,y2);cx.lineTo(x3,y3);cx.lineTo(x4,y4);cx.closePath();cx.fill();
  }
  function drawSeg(sg){
    const x1=sg.p1.screen.x,y1=sg.p1.screen.y+1,w1=sg.p1.screen.w,x2=sg.p2.screen.x,y2=sg.p2.screen.y,w2=sg.p2.screen.w;
    cx.fillStyle=sg.dark?'#36a03f':'#41b04a';cx.fillRect(0,y2,W,y1-y2+1);
    const r1=w1/6,r2=w2/6;
    const rc=sg.dark?'#ffffff':'#e53935';
    poly(x1-w1-r1,y1,x1-w1,y1,x2-w2,y2,x2-w2-r2,y2,rc);
    poly(x1+w1+r1,y1,x1+w1,y1,x2+w2,y2,x2+w2+r2,y2,rc);
    poly(x1-w1,y1,x1+w1,y1,x2+w2,y2,x2-w2,y2,sg.dark?'#666a70':'#6f7379');
    if(sg.start){
      for(let i=0;i<8;i++){const a=-1+i*0.25,b=a+0.25;
        poly(x1+a*w1,y1,x1+b*w1,y1,x2+b*w2,y2,x2+a*w2,y2,(i+sg.index)%2?'#fff':'#222');}
    } else if(!sg.dark){
      for(const o of [-1/3,1/3]){const l1=w1/40,l2=w2/40;
        poly(x1+o*w1-l1,y1,x1+o*w1+l1,y1,x2+o*w2+l2,y2,x2+o*w2-l2,y2,'#eeeeee');}
    }
    if(sg.decal){
      const d=sg.decal,a=d.off-d.w/2,b=d.off+d.w/2;
      const col=d.t==='turbo'?(Math.floor(frames/5+sg.index)%2?'#ffeb3b':'#ff9800'):'#141414';
      poly(x1+a*w1,y1,x1+b*w1,y1,x2+b*w2,y2,x2+a*w2,y2,col);
    }
  }
  function clipTo(clip){if(clip<H){cx.beginPath();cx.rect(0,0,W,clip);cx.clip();}}
  function drawSprite(o,x,y,u,clip){
    const w=o.w*u;if(w<1.5)return;
    cx.save();clipTo(clip);
    if(o.t==='arbol'){
      cx.fillStyle='#6d4c2f';cx.fillRect(x-w*0.08,y-w*0.95,w*0.16,w*0.95);
      cx.fillStyle='#2f8f3a';cx.beginPath();cx.arc(x,y-w*1.15,w*0.5,0,7);cx.fill();
      cx.fillStyle='#46b552';cx.beginPath();cx.arc(x-w*0.15,y-w*1.3,w*0.28,0,7);cx.fill();
    } else if(o.t==='cactus'){
      cx.fillStyle='#2e7d32';
      rr(x-w*0.14,y-w*1.4,w*0.28,w*1.4,w*0.14);cx.fill();
      rr(x-w*0.45,y-w*1.0,w*0.2,w*0.5,w*0.1);cx.fill();cx.fillRect(x-w*0.45,y-w*0.62,w*0.35,w*0.14);
      rr(x+w*0.25,y-w*1.2,w*0.2,w*0.5,w*0.1);cx.fill();cx.fillRect(x+w*0.1,y-w*0.84,w*0.35,w*0.14);
    } else if(o.t==='letrero'){
      cx.fillStyle='#555';cx.fillRect(x-w*0.4,y-w*0.6,w*0.06,w*0.6);cx.fillRect(x+w*0.34,y-w*0.6,w*0.06,w*0.6);
      cx.fillStyle='#ffd600';rr(x-w*0.5,y-w*1.05,w,w*0.5,w*0.06);cx.fill();
      cx.fillStyle='#111';
      for(let i=0;i<3;i++){const cxp=x-w*0.25+i*w*0.25,dd=o.dir*w*0.08;
        cx.beginPath();cx.moveTo(cxp-dd,y-w*0.95);cx.lineTo(cxp+dd,y-w*0.8);cx.lineTo(cxp-dd,y-w*0.65);
        cx.lineTo(cxp-dd*0.3,y-w*0.65);cx.lineTo(cxp+dd*0.6,y-w*0.8);cx.lineTo(cxp-dd*0.3,y-w*0.95);cx.closePath();cx.fill();}
    } else if(o.t==='moneda'){
      const s=Math.abs(Math.cos(frames*0.1+o.ph));
      cx.fillStyle='#ffd23f';cx.strokeStyle='#c98a00';cx.lineWidth=Math.max(1,w*0.08);
      cx.beginPath();cx.ellipse(x,y-w*1.3,w*0.42*s+1,w*0.5,0,0,7);cx.fill();cx.stroke();
    }
    cx.restore();
  }
  function shade(hex,f){
    const n=parseInt(hex.slice(1),16),m=v=>Math.max(0,Math.min(255,Math.round(f<0?v*(1+f):v+(255-v)*f)));
    return `rgb(${m(n>>16)},${m(n>>8&255)},${m(n&255)})`;
  }
  // Auto visto desde atrás. x,y = centro de la base; w = ancho en pixeles
  function drawCar(x,y,w,c,o){
    if(w<3)return;
    const S=FORMAS[c.tipo], h=w*S.h, yb=-h*S.belt, yt=-h, by=-h*0.13, bw=w*0.5;
    cx.save();clipTo(o.clip);
    cx.translate(x,y);if(o.tilt)cx.rotate(o.tilt);
    cx.fillStyle='rgba(0,0,0,.28)';cx.beginPath();cx.ellipse(0,0,w*0.56,w*0.07,0,0,7);cx.fill();
    cx.fillStyle='#151515';
    rr(-w*0.47,-h*0.2,w*0.17,h*0.2,w*0.03);cx.fill();rr(w*0.30,-h*0.2,w*0.17,h*0.2,w*0.03);cx.fill();
    // cabina
    const tb=w*S.cabBot/2,tt=w*S.cabTop/2;
    cx.fillStyle=shade(c.color,-0.1);
    cx.beginPath();cx.moveTo(-tb,yb);cx.lineTo(-tt,yt+h*0.05);cx.quadraticCurveTo(-tt,yt,-tt+w*0.05,yt);
    cx.lineTo(tt-w*0.05,yt);cx.quadraticCurveTo(tt,yt,tt,yt+h*0.05);cx.lineTo(tb,yb);cx.closePath();cx.fill();
    if(w>=22){
      // medallón (vidrio trasero) con el conductor
      const wi=w*0.035,wy1=yt+h*0.09,wy2=yb-h*0.02,wtb=tb-wi*2,wtt=tt-wi*1.5;
      cx.save();
      cx.beginPath();cx.moveTo(-wtb,wy2);cx.lineTo(-wtt,wy1);cx.lineTo(wtt,wy1);cx.lineTo(wtb,wy2);cx.closePath();
      cx.fillStyle='#22313f';cx.fill();cx.clip();
      const hr=Math.min((wy2-wy1)*0.42,w*0.12),hx=-w*0.15,hy=wy2-hr*0.95;
      cx.fillStyle='#0d0d0d';rr(hx-hr*1.25,hy-hr*0.2,hr*2.5,hr*2,hr*0.4);cx.fill();
      if(o.player)drawHead(cx,hx,hy,hr,1); else {cx.fillStyle='#3a2a20';cx.beginPath();cx.arc(hx,hy,hr,0,7);cx.fill();}
      cx.fillStyle='rgba(180,220,255,.16)';cx.fillRect(-w,wy1,w*2,wy2-wy1);
      cx.restore();
    }
    // carrocería
    cx.fillStyle=c.color;rr(-bw,yb,bw*2,by-yb,w*0.06);cx.fill();
    cx.fillStyle=shade(c.color,-0.25);cx.fillRect(-bw+w*0.02,by-h*0.06,bw*2-w*0.04,h*0.06);
    cx.fillStyle='#1d1d1d';rr(-bw*0.96,by-h*0.02,bw*1.92,h*0.09,h*0.03);cx.fill();
    if(w>=22){
      const ly=yb+(by-yb)*0.2,lh=(by-yb)*0.28;
      cx.fillStyle=o.brake?'#ff1744':'#b71c1c';
      if(S.luz==='ancha'){rr(-bw*0.95,ly,bw*0.42,lh,lh*0.3);cx.fill();rr(bw*0.53,ly,bw*0.42,lh,lh*0.3);cx.fill();}
      else if(S.luz==='vertical'){rr(-bw*0.95,ly-lh*0.5,bw*0.2,lh*1.9,lh*0.4);cx.fill();rr(bw*0.75,ly-lh*0.5,bw*0.2,lh*1.9,lh*0.4);cx.fill();}
      else{rr(-bw*0.98,ly,bw*0.5,lh*0.8,lh*0.2);cx.fill();rr(bw*0.48,ly,bw*0.5,lh*0.8,lh*0.2);cx.fill();
        cx.fillStyle='#7f0000';cx.fillRect(-bw*0.48,ly+lh*0.25,bw*0.96,lh*0.3);}
      const py=ly+lh*1.3,ph=(by-yb)*0.24;
      cx.fillStyle='#f5f5f5';rr(-w*0.12,py,w*0.24,ph,2);cx.fill();
      cx.fillStyle='#1a237e';cx.font=`bold ${Math.max(6,Math.round(w*0.07))}px Arial`;
      cx.textAlign='center';cx.textBaseline='middle';cx.fillText(c.placa||'GTO',0,py+ph/2);cx.textAlign='left';
    }
    if(o.boost){
      const f=w*(0.12+Math.random()*0.08);
      cx.fillStyle='#ff9800';cx.beginPath();cx.moveTo(w*0.26,by+h*0.02);cx.lineTo(w*0.36,by+h*0.02);cx.lineTo(w*0.31,by+h*0.02+f);cx.fill();
      cx.fillStyle='#ffeb3b';cx.beginPath();cx.moveTo(w*0.28,by+h*0.02);cx.lineTo(w*0.34,by+h*0.02);cx.lineTo(w*0.31,by+h*0.02+f*0.6);cx.fill();
    }
    cx.restore();
  }
  function drawBg(){
    const hz=H*0.5;
    const g=cx.createLinearGradient(0,0,0,hz);g.addColorStop(0,'#3d8ff0');g.addColorStop(1,'#bfe4ff');
    cx.fillStyle=g;cx.fillRect(0,0,W,hz+2);
    cx.fillStyle='#41b04a';cx.fillRect(0,hz,W,H-hz);
    const sx=((W*0.8-skyOff*W*0.3)%(W*2)+W*2)%(W*2)-W*0.3;
    cx.fillStyle='rgba(255,240,170,.9)';cx.beginPath();cx.arc(sx,hz*0.35,H*0.07,0,7);cx.fill();
    const layer=(par,amp,base,col)=>{
      cx.fillStyle=col;cx.beginPath();cx.moveTo(0,hz+2);
      for(let x=0;x<=W+6;x+=6){const t=x/W+skyOff*par;
        cx.lineTo(x,base-(0.55+0.3*Math.sin(t*Math.PI*4)+0.15*Math.sin(t*Math.PI*10+1))*amp);}
      cx.lineTo(W+6,hz+2);cx.fill();
    };
    layer(0.5,H*0.2,hz,'#8796b8');
    layer(1,H*0.09,hz,'#5e9e5e');
  }
  function draw(){
    cx.setTransform(dpr,0,0,dpr,0,0);
    drawBg();
    if(!segs.length)return;
    const base=findSeg(pdist),basePct=(wrapZ(pdist)%SEG)/SEG;
    const pseg=findSeg(pdist+PLAYER_Z),pPct=(wrapZ(pdist+PLAYER_Z)%SEG)/SEG;
    const pY=pseg.p1.world.y+(pseg.p2.world.y-pseg.p1.world.y)*pPct;
    const camZ=wrapZ(pdist);
    let maxy=H,x=0,dx=-(base.curve*basePct);
    for(let n=0;n<DRAW;n++){
      const sg=segs[(base.index+n)%segs.length];
      const cz=camZ-(sg.index<base.index?trackLen:0);
      sg.clip=maxy;
      project(sg.p1,px*RW-x,pY+CAM_H,cz);
      project(sg.p2,px*RW-x-dx,pY+CAM_H,cz);
      x+=dx;dx+=sg.curve;
      if(sg.p1.camera.z<=DEPTH||sg.p2.screen.y>=sg.p1.screen.y||sg.p2.screen.y>=maxy)continue;
      drawSeg(sg);
      maxy=sg.p1.screen.y;
    }
    for(const k of autos)findSeg(k.dist).autos.push(k);
    for(let n=DRAW-1;n>0;n--){
      const sg=segs[(base.index+n)%segs.length];
      if(sg.p1.camera.z<=DEPTH)continue;
      for(const o of sg.sprites)if(!o.got)drawSprite(o,sg.p1.screen.x+o.off*sg.p1.screen.w,sg.p1.screen.y,sg.p1.screen.w,sg.clip);
      for(const k of sg.autos){
        const p=(wrapZ(k.dist)%SEG)/SEG;
        const u=sg.p1.screen.w+(sg.p2.screen.w-sg.p1.screen.w)*p;
        const kx=sg.p1.screen.x+(sg.p2.screen.x-sg.p1.screen.x)*p+k.off*u;
        const ky=sg.p1.screen.y+(sg.p2.screen.y-sg.p1.screen.y)*p;
        drawCar(kx,ky,PW*u,k,{clip:sg.clip});
      }
    }
    for(const k of autos)findSeg(k.dist).autos.length=0;

    // auto del jugador
    const camY=pseg.p1.camera.y+(pseg.p2.camera.y-pseg.p1.camera.y)*pPct;
    const pw=PW*RW/CAM_H*W/2;
    let py=H/2-(DEPTH/PLAYER_Z*camY*H/2)-H*0.03;
    if(hopT>0)py-=Math.sin(Math.PI*(22-hopT)/22)*pw*0.25;
    else py+=Math.sin(frames*0.6)*(speed/MAXV)*1.2;
    const tilt=steer*0.04+(spinT>0?Math.sin(spinT*0.7)*0.45:0);
    if(boostT>0){
      cx.strokeStyle='rgba(255,255,255,.55)';cx.lineWidth=2;
      for(let i=0;i<10;i++){const a=(i*37+frames*13)%W,len=H*0.15;
        const side=i%2?a*0.25:W-a*0.25;cx.beginPath();cx.moveTo(side,H*0.35+i*H*0.06);cx.lineTo(side+(i%2?-1:1)*len*0.3,H*0.35+i*H*0.06+len*0.2);cx.stroke();}
    }
    drawCar(W/2,py,pw,Object.assign({},yo,{placa:'GTO'}),{player:true,clip:H,tilt,boost:boostT>0,
      brake:spinT>0||((px<-1||px>1)&&speed>OFF_LIMIT)});
    if(bubble>0)drawSpeech(W/2,py-pw*0.75,bubble,1.2);
    hud();
  }
  function hud(){
    cx.setTransform(dpr,0,0,dpr,0,0);
    for(const t of touches.values()){                 // volante bajo el dedo
      if(t.role!=='volante')continue;
      const k=Math.max(-70,Math.min(70,t.cx-t.sx));
      cx.globalAlpha=.3;cx.strokeStyle='#fff';cx.lineWidth=6;cx.beginPath();cx.arc(t.sx,t.y0,48,0,7);cx.stroke();
      cx.globalAlpha=.7;cx.fillStyle='#fff';cx.beginPath();cx.arc(t.sx+k*0.7,t.y0,20,0,7);cx.fill();cx.globalAlpha=1;
    }
    if(cfg.volante==='inclinar'&&state==='play'){
      cx.fillStyle='rgba(255,255,255,.35)';cx.fillRect(W/2-60,H-14,120,6);
      cx.fillStyle='#fff';cx.fillRect(W/2-3+input.inclinacion*57,H-18,6,14);
    }
    const L=12;
    cx.font='bold 20px system-ui,Arial';cx.textBaseline='middle';
    cx.fillStyle='#ffd23f';cx.strokeStyle='#c98a00';cx.lineWidth=2;cx.beginPath();cx.ellipse(L+12,24,8,10,0,0,7);cx.fill();cx.stroke();
    txt('× '+coins,L+26,25);
    txt('🏁 '+Math.min(LAPS,Math.floor(pdist/trackLen)+1)+'/'+LAPS,L+96,25);
    txt('⏱ '+timeText(),L+180,25);
    cx.font='bold 16px system-ui,Arial';
    txt(Math.round(speed/MAXV*180)+' km/h',L,54);
    cx.font='bold 42px system-ui,Arial';const pwid=cx.measureText(place+'°').width;txt(place+'°',W-170,32);
    cx.font='bold 18px system-ui,Arial';txt('/ '+(autos.length+1),W-170+pwid+4,38);
    if(count<240){
      const n=count<180?3-Math.floor(count/60):0;
      const t=n>0?String(n):'¡YA!';
      const k=1+((count%60)/60)*0.4;
      cx.save();cx.translate(W/2,H*0.38);cx.scale(k,k);
      cx.font='bold 72px system-ui,Arial';cx.textAlign='center';
      cx.fillStyle='rgba(0,0,0,.5)';cx.fillText(t,3,3);
      cx.fillStyle=n>0?'#ffd23f':'#43d14b';cx.fillText(t,0,0);
      cx.restore();cx.textAlign='left';
    }
    if(H>W&&state==='play'){cx.font='bold 14px system-ui,Arial';txt('↻ Mejor con el celular en horizontal',L,80);}
  }
  function timeText(){const s=raceF/60;return Math.floor(s/60)+':'+String(Math.floor(s%60)).padStart(2,'0')+'.'+String(Math.floor((s%1)*10));}
  function result(){return {place:finalPlace,total:autos.length+1,time:timeText(),coins,auto:yo.nombre};}

  return {init,step,draw,result};
})();
