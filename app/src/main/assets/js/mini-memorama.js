// Merudichis Capuchinis · minijuego Memorama familiar: voltea cartas y encuentra los pares (con tus fotos)
'use strict';
const MiniMemorama=(()=>{
  // Dibujos para las cartas que no tienen foto de la familia
  const ICONOS={
    kiara:(g,s)=>Personajes.kiara(g,'k_parada',0,s*0.35,1,s*0.7),
    heroe:(g,s)=>Personajes.heroe(g,'victoria',0,s*0.4,1,s*0.8),
    nina:(g,s)=>Personajes.nina(g,'n_rie',0,s*0.4,1,s*0.8),
    moneda:(g,s)=>{g.fillStyle='#ffd23f';g.strokeStyle='#c98a00';g.lineWidth=s*0.05;g.beginPath();g.ellipse(0,0,s*0.25,s*0.3,0,0,7);g.fill();g.stroke();},
    hueso:(g,s)=>{const k=s/40;g.save();g.scale(k,k);g.fillStyle='#fff8e1';g.strokeStyle='#8d6e63';g.lineWidth=1.5;g.beginPath();g.rect(-9,-3,18,6);g.fill();g.stroke();
      for(const [x,y] of [[-9,-3],[-9,3],[9,-3],[9,3]]){g.beginPath();g.arc(x,y,4,0,7);g.fill();g.stroke();}g.restore();},
    estrella:(g,s)=>{g.fillStyle='#ffeb3b';g.strokeStyle='#f57f17';g.beginPath();for(let k=0;k<10;k++){const r=k%2?s*0.13:s*0.32,a=-Math.PI/2+k*Math.PI/5;g.lineTo(Math.cos(a)*r,Math.sin(a)*r);}g.closePath();g.fill();g.stroke();},
    bloque:(g,s)=>{g.fillStyle='#ffc107';g.fillRect(-s*0.25,-s*0.25,s*0.5,s*0.5);g.fillStyle='#fff';g.font=`bold ${Math.round(s*0.4)}px Arial`;g.textAlign='center';g.textBaseline='middle';g.fillText('?',0,s*0.02);},
    maceta:(g,s)=>{const k=s/50;g.save();g.scale(k,k);g.fillStyle='#a1542b';g.beginPath();g.moveTo(-12,-2);g.lineTo(12,-2);g.lineTo(9,18);g.lineTo(-9,18);g.fill();
      g.fillStyle='#43a047';g.beginPath();g.arc(-5,-8,7,0,7);g.arc(5,-10,8,0,7);g.fill();g.fillStyle='#e91e63';g.beginPath();g.arc(4,-14,3,0,7);g.fill();g.restore();}
  };
  let cartas=[], abiertas=[], movs=0, pares=0, espera=0, efectos=[], cols=8, filas=2, avisoT=0, fin=false;

  function init(){
    frames=0;coins=0;movs=0;pares=0;espera=0;efectos=[];abiertas=[];avisoT=200;fin=false;
    const fotos=MEMO_IDS.filter(id=>Personajes.tiene(id));
    const relleno=Object.keys(ICONOS);
    const caras=[];
    for(const id of fotos)caras.push({foto:id});
    for(const ic of relleno){if(caras.length>=8)break;caras.push({icono:ic});}
    cartas=[];
    caras.forEach((c,i)=>{cartas.push(Object.assign({par:i,abierta:false,lista:false,giro:0,sacude:0,brilla:0},c));
                          cartas.push(Object.assign({par:i,abierta:false,lista:false,giro:0,sacude:0,brilla:0},c));});
    for(let i=cartas.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[cartas[i],cartas[j]]=[cartas[j],cartas[i]];}
  }
  function medidas(){
    cols=W>=H?8:4;filas=16/cols;
    const arriba=46,gap=10;
    const cw=Math.min((W-20-gap*(cols-1))/cols,((H-arriba-12-gap*(filas-1))/filas)*0.75);
    const ch=cw/0.75;
    const ox=(W-(cw*cols+gap*(cols-1)))/2, oy=arriba+((H-arriba)-(ch*filas+gap*(filas-1)))/2;
    return {cw,ch,gap,ox,oy};
  }
  function toque(tipo,x,y){
    if(tipo!=='down'||espera>0||fin)return;
    const m=medidas();
    cartas.forEach((c,i)=>{
      const cx0=m.ox+(i%cols)*(m.cw+m.gap),cy0=m.oy+Math.floor(i/cols)*(m.ch+m.gap);
      if(x>=cx0&&x<=cx0+m.cw&&y>=cy0&&y<=cy0+m.ch&&!c.abierta&&!c.lista&&abiertas.length<2){
        c.abierta=true;abiertas.push(c);beep(500,700,.05,'triangle',.05);
        if(abiertas.length===2){movs++;revisar(cx0+m.cw/2,cy0+m.ch/2);}
      }
    });
  }
  function revisar(x,y){
    const [a,b]=abiertas;
    if(a.par===b.par){
      a.lista=b.lista=true;a.brilla=b.brilla=50;abiertas=[];pares++;
      Musica.jingle('acierto');
      for(let i=0;i<24;i++){const an=Math.random()*6.28,v=2+Math.random()*4;
        efectos.push({x,y,vx:Math.cos(an)*v,vy:Math.sin(an)*v-2,t:45,color:['#ffd23f','#76ff03','#40c4ff','#ff4081'][i%4]});}
      if(pares===8){
        fin=true;
        const seg=frames/60,puntos=Math.max(100,1200-movs*25-Math.floor(seg)*3);
        setTimeout(()=>{if(state==='play')terminarMinijuego('memorama',puntos,10+Math.max(0,20-(movs-8)),[`🃏 ${movs} intentos`,`⏱ ${fmtSeg(seg)}`],true);},900);
      }
    } else {
      a.sacude=b.sacude=24;espera=55;
      Musica.jingle('error');
    }
  }
  function step(){
    frames++;
    if(avisoT>0)avisoT--;
    if(espera>0&&--espera===0){for(const c of abiertas)c.abierta=false;abiertas=[];}
    for(const c of cartas){
      c.giro+=((c.abierta||c.lista?1:0)-c.giro)*0.25;
      if(c.sacude>0)c.sacude--;if(c.brilla>0)c.brilla--;
    }
    for(const e of efectos){e.x+=e.vx;e.y+=e.vy;e.vy+=0.15;e.t--;}
    efectos=efectos.filter(e=>e.t>0);
  }
  function draw(){
    cx.setTransform(dpr,0,0,dpr,0,0);
    const g=cx.createLinearGradient(0,0,0,H);g.addColorStop(0,'#4a148c');g.addColorStop(1,'#880e4f');
    cx.fillStyle=g;cx.fillRect(0,0,W,H);
    const m=medidas();
    cartas.forEach((c,i)=>{
      const x=m.ox+(i%cols)*(m.cw+m.gap)+m.cw/2,y=m.oy+Math.floor(i/cols)*(m.ch+m.gap)+m.ch/2;
      const esc=Math.abs(Math.cos(c.giro*Math.PI)),frente=c.giro>0.5;
      const dx=c.sacude>0?Math.sin(c.sacude*1.2)*6:0;
      const bote=c.brilla>0?Math.sin(c.brilla/50*Math.PI)*8:0;
      cx.save();cx.translate(x+dx,y-bote);cx.scale(Math.max(0.02,esc),1);
      if(c.brilla>0){cx.fillStyle=`rgba(118,255,3,${c.brilla/50})`;rr(-m.cw/2-6,-m.ch/2-6,m.cw+12,m.ch+12,12);cx.fill();}
      if(c.sacude>0){cx.fillStyle='rgba(255,23,68,.5)';rr(-m.cw/2-5,-m.ch/2-5,m.cw+10,m.ch+10,12);cx.fill();}
      if(!frente){
        cx.fillStyle='#1e88e5';rr(-m.cw/2,-m.ch/2,m.cw,m.ch,10);cx.fill();
        cx.strokeStyle='#fff';cx.lineWidth=3;rr(-m.cw/2+5,-m.ch/2+5,m.cw-10,m.ch-10,7);cx.stroke();
        cx.fillStyle='#ffd23f';cx.font=`bold ${Math.round(m.cw*0.45)}px Arial`;cx.textAlign='center';cx.textBaseline='middle';cx.fillText('?',0,2);
      } else {
        cx.fillStyle=c.lista?'#f1f8e9':'#fff';rr(-m.cw/2,-m.ch/2,m.cw,m.ch,10);cx.fill();
        cx.save();rr(-m.cw/2+4,-m.ch/2+4,m.cw-8,m.ch-8,8);cx.clip();
        const im=c.foto&&Personajes.foto(c.foto);
        if(im){const s=Math.max((m.cw-8)/im.width,(m.ch-8)/im.height);cx.drawImage(im,-im.width*s/2,-im.height*s/2,im.width*s,im.height*s);}
        else if(c.icono)ICONOS[c.icono](cx,Math.min(m.cw,m.ch));
        cx.restore();
      }
      cx.restore();
    });
    for(const e of efectos){cx.globalAlpha=Math.min(1,e.t/20);cx.fillStyle=e.color;cx.fillRect(e.x-3,e.y-3,6,6);}
    cx.globalAlpha=1;
    cx.textBaseline='middle';cx.textAlign='left';cx.font='bold 18px system-ui,Arial';
    txt(`🃏 ${pares}/8 pares`,12,22);txt(`Intentos: ${movs}`,150,22);txt('⏱ '+fmtSeg(frames/60),280,22);
    if(avisoT>0&&!MEMO_IDS.some(id=>Personajes.tiene(id))){cx.textAlign='center';cx.font='bold 16px system-ui,Arial';cx.globalAlpha=Math.min(1,avisoT/30);
      txt('Sube fotos de tu familia en 📸 Fotos de personajes para verlas en las cartas',W/2,H-16);cx.globalAlpha=1;cx.textAlign='left';}
  }
  return {init,step,draw,toque};
})();
