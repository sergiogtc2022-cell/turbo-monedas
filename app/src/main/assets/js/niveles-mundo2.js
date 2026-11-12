// Merudichis Capuchinis · niveles pixel de los Mundos 2 y 3:
// 2-1 Torre (vertical, la lava sube), 2-2 Cielo (nubes y viento), 2-3 Castillo (lava, barras de fuego y jefe),
// 2-4 Mina (carrito que avanza solo), 3-1 Bajo el agua (nadar), 3-2 Atardecer (la pantalla avanza sola)
// y 3-3 Casa de los ratones (cuartos unidos por puertas).
'use strict';
// Piezas extra para estos mapas (se suman a las de mapaPixel)
function piezasExtra(m){
  m.tablas=(c,r,n)=>m.plat(c,r,n,'=');
  m.lava=(a,b)=>{for(let c=a;c<=b;c++){m.set(c,G,'L');m.set(c,G+1,'L');}};
  m.hueco=(a,b)=>{for(let c=a;c<=b;c++){m.set(c,G,' ');m.set(c,G+1,' ');}};
  m.enemigoEn=(c,r)=>enemies.push({x:c*T+3,y:r*T-24,w:26,h:24,vx:-1.1,vy:0,alive:true,dead:0,onGround:false});
  m.raton=(c,r=G)=>enemies.push({t:'raton',x:c*T+5,y:r*T-14,w:22,h:14,vx:-2.1,vy:0,alive:true,dead:0,onGround:false});
  m.pez=(c,r,rango=3)=>enemies.push({t:'pez',x:c*T,y:r*T,x0:c*T,y0:r*T,w:26,h:18,vx:-0.9,vy:0,rango:rango*T,amp:10,alive:true,dead:0});
  m.jefe=c=>enemies.push({t:'jefe',x:c*T,y:G*T-48,w:52,h:48,vx:-1.3,vy:0,hp:3,inv:0,alive:true,dead:0,onGround:false});
  m.pilar=(c,h,ch='K')=>{for(let k=1;k<=h;k++)m.set(c,G-k,ch);};
  return m;
}

// 2-1 · Torre: se sube por plataformas mientras la lava sube; la meta está arriba
function mapaTorre(){
  const m=piezasExtra(mapaPixel(30));
  for(let r=0;r<ROWS;r++){m.set(0,r,'K');m.set(29,r,'K');}
  m.suelo(1,28);
  m.bloques(5,G-4,'BVBHB');m.monedas(14,G-1,6);m.enemigo(20);
  const xs=[3,12,20,12,4,13,21,13];
  let i=0;
  for(let r=G-3;r>=7;r-=2,i++){
    const x=xs[i%xs.length];
    if(i%5===3)crearPlat(11,r,4,'h',6,0.018);
    else if(i%7===5){crearPlat(x,r,3,'cae');crearPlat(x+3,r,3,'cae');}
    else{m.tablas(x,r,6);m.monedas(x+1,r-1,4);
      if(i%6===2)m.enemigoEn(x+3,r);
      if(i===8||i===16)m.set(x+5,r-1,'C');}
  }
  m.tablas(1,5,28);m.arco(4,3,8,1);
  flagCol=26;flagFila=4;m.set(26,4,'F');
  m.cerrar();
}

// 2-2 · Cielo: nubes que se atraviesan desde abajo, plataformas que se mueven o se caen y ráfagas de viento
function mapaCielo(){
  const m=piezasExtra(mapaPixel(320));
  m.suelo(0,14);m.bloques(6,7,'BVB');m.monedas(9,G-1,4);
  const alturas=[9,8,7,8];
  let c=17,k=0;
  while(c<292){
    const t=k%6;
    if(t===0||t===3){for(let j=0;j<3;j++){const r=alturas[(k+j)%4];m.tablas(c,r,4);m.monedas(c,r-1,4);c+=7;}}
    else if(t===1){crearPlat(c+3,8,3,'h',3,0.025);m.arco(c,6,10,2);c+=11;}
    else if(t===2){m.suelo(c,c+9);m.enemigo(c+6);m.bloques(c+2,7,k%12===2?'QVQ':'BHB');if(k===8||k===20)m.control(c+1);c+=13;}
    else if(t===4){crearPlat(c,9,3,'v',2,0.03);crearPlat(c+6,8,3,'v',2,0.03);c+=12;}
    else{crearPlat(c,9,3,'cae');crearPlat(c+5,8,3,'cae');crearPlat(c+10,9,3,'cae');m.monedas(c+5,6,3);c+=16;}
    k++;
  }
  m.suelo(c,319);m.escalera(c+4,4);m.meta(Math.min(310,c+14));
  m.cerrar();
}

// 2-3 · Castillo: pozos de lava, barras de fuego que giran y un jefe que aguanta tres pisotones
function mapaCastillo(){
  const m=piezasExtra(mapaPixel(300));
  m.techo(0,299,0,1);
  m.suelo(0,299);
  m.bloques(8,7,'BVB');m.monedas(14,G-1,5);
  m.lava(21,26);crearPlat(22,8,3,'h',2,0.02);
  m.set(35,7,'K');crearBarra(35,7,5,0.035);m.enemigo(42);m.monedas(38,G-1,6);
  m.set(50,8,'K');crearBarra(50,8,4,-0.04);
  m.lava(61,70);m.duro(63,9,2);m.duro(67,9,2);m.monedas(63,8,2);m.monedas(67,8,2);
  m.control(75);
  m.techo(80,95,2,7);m.monedas(81,G-1,14);m.enemigo(86);m.enemigo(91);
  m.set(105,6,'K');crearBarra(105,6,6,0.03);m.bloques(100,8,'Q');m.bloques(110,8,'Q');
  m.lava(121,132);crearPlat(122,9,2,'cae');crearPlat(126,8,2,'cae');crearPlat(130,9,2,'cae');
  m.bloques(138,7,'BQBVB');m.enemigo(144);m.enemigo(148);
  m.set(155,7,'K');crearBarra(155,7,5,0.04);
  m.set(168,8,'K');crearBarra(168,8,5,-0.035);m.monedas(160,G-1,12);
  m.lava(181,190);crearPlat(182,9,3,'v',2,0.03);crearPlat(187,8,3,'h',2,0.025);
  m.control(195);
  m.escalera(200,4);m.bajada(204,4);m.monedas(203,5,2);
  m.bloques(212,7,'QHQ');m.enemigo(218);m.enemigo(224);m.enemigo(230);
  m.set(236,7,'K');crearBarra(236,7,5,0.045);
  m.lava(241,246);m.duro(243,9,2);
  m.monedas(250,G-1,6);m.jefe(270);
  m.meta(290);
  m.cerrar();
}

// 2-4 · Mina: vas en un carrito que avanza solo; solo saltas huecos, picos y enemigos
function mapaMina(){
  const m=piezasExtra(mapaPixel(340));
  m.techo(0,339,0,1);
  m.suelo(0,339);m.monedas(8,G-1,10);
  for(let x=30,k=0;x<318;x+=18,k++){
    const t=k%9;
    if(t===0){m.hueco(x,x+2);m.arco(x-1,8,5,2);}
    else if(t===1)m.enemigo(x+2);
    else if(t===2)m.picos(x,x+1);
    else if(t===3){m.hueco(x,x+3);m.arco(x-1,7,6,3);}
    else if(t===4){m.bloques(x,7,'QQQ');m.monedas(x+4,G-1,6);if(k===4||k===13)m.control(x+12);}
    else if(t===5){m.techo(x,x+8,2,7);m.monedas(x,G-1,9);}
    else if(t===6){m.enemigo(x);m.enemigo(x+4);}
    else if(t===7){m.hueco(x,x+2);m.monedas(x+3,G-1,2);m.hueco(x+5,x+7);}
    else m.picos(x,x+2);
  }
  m.meta(330);
  m.cerrar();
}

// 3-1 · Bajo el agua: cada toque de salto es una brazada; peces que van y vienen
function mapaAgua(){
  const m=piezasExtra(mapaPixel(300));
  m.suelo(0,299);m.monedas(8,8,5);
  for(let x=22,k=0;x<280;x+=16,k++){
    const t=k%5;
    if(t===0){m.pilar(x,4);m.pilar(x+1,4);m.monedas(x,G-6,2);m.pez(x+6,6,3);}
    else if(t===1){for(let r=0;r<=G-6;r++){m.set(x,r,'K');m.set(x+1,r,'K');}m.monedas(x,G-2,2);m.pez(x+8,8,4);}
    else if(t===2){m.hueco(x,x+3);m.arco(x,7,4,2);m.pez(x+10,4,3);}
    else if(t===3){m.bloques(x,7,k===8?'BVB':'QHQ');m.enemigo(x+6);m.pez(x+4,3,5);}
    else{m.pilar(x,2,'B');m.pilar(x+5,3,'B');m.pilar(x+10,2,'B');m.monedas(x+2,G-4,3);m.pez(x+6,7,3);if(k===4||k===14)m.control(x+12);}
  }
  m.meta(288);
  m.cerrar();
}

// 3-2 · Atardecer: la pantalla avanza sola; si te atrapa contra una pared, pierdes una vida
function mapaAtardecer(){
  const m=piezasExtra(mapaPixel(300));
  m.suelo(0,299);m.monedas(10,G-1,6);
  for(let x=24,k=0;x<282;x+=14,k++){
    const t=k%7;
    if(t===0){m.pilar(x,2);m.monedas(x,G-4,1);}
    else if(t===1){m.hueco(x,x+2);m.arco(x-1,7,5,2);}
    else if(t===2){m.pilar(x,3);m.plat(x-4,7,3);m.monedas(x-4,6,3);m.enemigo(x+5);}
    else if(t===3){m.bloques(x,7,k===10?'BVB':'BQBHB');m.enemigo(x+3);}
    else if(t===4){m.escalera(x,3);m.hueco(x+3,x+5);m.bajada(x+6,3);}
    else if(t===5){m.pilar(x,4);m.resorte(x-2);m.monedas(x,5,1);if(k===5||k===19)m.control(x+6);}
    else{m.picos(x,x+2);m.plat(x,7,3);m.enemigo(x+6);}
  }
  m.meta(290);
  m.cerrar();
}

// 3-3 · Casa de los ratones: cuartos separados por paredes; las puertas te llevan al siguiente cuarto
function mapaRatones(){
  const CUARTO=34,N=7;
  const m=piezasExtra(mapaPixel(CUARTO*N));
  m.techo(0,COLS-1,0,1);
  m.suelo(0,COLS-1);
  for(let i=0;i<N;i++){
    const b=i*CUARTO;
    if(i<N-1){for(let r=2;r<G;r++)m.set(b+CUARTO-1,r,'K');m.set(b+CUARTO-4,G-1,'D');m.set(b+CUARTO+3,G-1,'D');}
    m.tablas(b+6,8,4);m.monedas(b+6,7,4);m.raton(b+8,8);
    m.tablas(b+14,6,5);m.monedas(b+14,5,5);
    m.pilar(b+21,1);m.pilar(b+22,1);m.tablas(b+20,8,4);
    m.raton(b+12);m.raton(b+24);if(i>=2)m.raton(b+17);
    m.bloques(b+11,4,i%3===1?'V':i%3===2?'H':'Q');
    if(i===2||i===5)m.control(b+5);
    if(i===N-1)m.meta(b+CUARTO-6);
  }
  m.cerrar();
}

const Nivel2_1=crearNivelPixel({clave:'px5',titulo:'NIVEL 2-1',tema:'torre',construir:mapaTorre,filas:60,mec:{lavaSube:0.28,margen:320}});
const Nivel2_2=crearNivelPixel({clave:'px6',titulo:'NIVEL 2-2',tema:'cielo',construir:mapaCielo,mec:{viento:-0.035}});
const Nivel2_3=crearNivelPixel({clave:'px7',titulo:'NIVEL 2-3',tema:'castillo',construir:mapaCastillo,mec:{}});
const Nivel2_4=crearNivelPixel({clave:'px8',titulo:'NIVEL 2-4',tema:'mina',construir:mapaMina,mec:{carrito:3.6}});
const Nivel3_1=crearNivelPixel({clave:'px9',titulo:'NIVEL 3-1',tema:'agua',construir:mapaAgua,mec:{agua:true}});
const Nivel3_2=crearNivelPixel({clave:'px10',titulo:'NIVEL 3-2',tema:'atardecer',construir:mapaAtardecer,mec:{auto:1.2}});
const Nivel3_3=crearNivelPixel({clave:'px11',titulo:'NIVEL 3-3',tema:'ratones',construir:mapaRatones,mec:{puertasOn:true}});
