// Merudichis Capuchinis · mapas de los niveles pixel 1-2 (Desierto), 1-3 (Cueva) y 1-4 (Montaña nevada)
// Cada mapa es más largo que el 1-1 (~330 columnas) y usa las mismas piezas: suelo, ladrillos, bloques ?, picos, resortes, turbo.
'use strict';
function mapaPixel(cols){
  COLS=cols;
  grid=Array.from({length:ROWS},()=>new Array(COLS).fill(' '));
  enemies=[];
  const set=(c,r,ch)=>{if(c>=0&&c<COLS&&r>=0&&r<ROWS)grid[r][c]=ch;};
  const m={
    set,
    suelo:(a,b)=>{for(let c=a;c<=b;c++){set(c,G,'#');set(c,G+1,'#');}},
    plat:(c,r,n,ch='B')=>{for(let i=0;i<n;i++)set(c+i,r,ch);},
    duro:(c,r,n)=>m.plat(c,r,n,'K'),
    monedas:(c,r,n)=>{for(let i=0;i<n;i++)set(c+i,r,'o');},
    arco:(c,r,n,h)=>{for(let i=0;i<n;i++){const t=i/(n-1);set(c+i,Math.round(r-Math.sin(t*Math.PI)*h),'o');}},
    bloques:(c,r,txt)=>{for(let i=0;i<txt.length;i++)if(txt[i]!==' ')set(c+i,r,txt[i]);},
    enemigo:c=>enemies.push({x:c*T+3,y:(G-1)*T+8,w:26,h:24,vx:-1.1,vy:0,alive:true,dead:0,onGround:false}),
    escalera:(c,n)=>{for(let i=0;i<n;i++)for(let k=1;k<=i+1;k++)set(c+i,G-k,'K');},
    bajada:(c,n)=>{for(let i=0;i<n;i++)for(let k=1;k<=n-i;k++)set(c+i,G-k,'K');},
    piramide:(c,n)=>{m.escalera(c,n);m.bajada(c+n,n);m.monedas(c+n-1,G-n-2,2);},
    picos:(a,b)=>{for(let c=a;c<=b;c++)set(c,G-1,'^');},
    resorte:c=>set(c,G,'S'),
    turbo:c=>set(c,G,'>'),
    control:c=>set(c,G-1,'C'),
    // techo de roca; en los túneles (desde>1) la fila de abajo es de ladrillo para que se pueda romper con el puño
    techo:(a,b,desde,hasta)=>{for(let c=a;c<=b;c++)for(let r=desde;r<=hasta;r++)set(c,r,desde>1&&r===hasta?'B':'K');},
    meta:c=>{flagCol=c;set(c,G-1,'F');},
    cerrar:()=>{totalCoins=0;for(const f of grid)for(const ch of f)if(ch==='o')totalCoins++;}
  };
  return m;
}

// 1-2 · Desierto: pirámides, pozos de picos y tramos largos para correr
function mapaDesierto(){
  const m=mapaPixel(330);
  m.suelo(0,40);m.monedas(6,9,5);m.bloques(10,7,'BQBHB');m.enemigo(18);m.enemigo(23);
  m.piramide(27,5);m.arco(38,8,8,3);                       // hueco 41-44
  m.suelo(45,90);
  m.picos(52,55);m.arco(51,8,6,2);m.duro(58,8,4);m.monedas(58,7,4);m.enemigo(63);m.enemigo(67);
  m.resorte(72);for(let r=4;r<=7;r++)m.set(72,r,'o');m.plat(75,5,5);m.monedas(75,4,5);
  m.bloques(82,7,'QBQBQ');m.enemigo(86);
  m.duro(92,9,2);m.monedas(92,8,2);                         // hueco 91-94 con isla
  m.suelo(95,150);m.control(100);
  m.turbo(105);m.monedas(108,G-1,14);m.enemigo(125);m.enemigo(130);
  m.piramide(136,4);
  m.arco(149,8,6,2);                                        // hueco 151-153
  m.suelo(154,210);
  m.bloques(160,7,'BHBQB');m.enemigo(165);m.enemigo(170);m.enemigo(175);
  m.picos(180,186);m.duro(180,8,3);m.duro(185,8,3);m.monedas(180,7,3);m.monedas(185,7,3);
  m.escalera(192,4);m.monedas(196,6,3);
  m.duro(212,8,2);                                          // hueco 211-214 con isla
  m.suelo(215,329);
  m.bloques(222,7,'QQQ');m.enemigo(228);m.turbo(235);m.monedas(238,G-1,14);
  m.enemigo(246);m.enemigo(252);m.enemigo(258);
  m.piramide(264,6);m.control(280);
  m.bloques(285,7,'BQBHBQB');m.enemigo(291);m.enemigo(297);m.enemigo(302);
  m.escalera(306,6);m.meta(318);
  m.cerrar();
}

// 1-3 · Cueva: techo de roca, túneles bajos, islas sobre pozos y muchos bloques
function mapaCueva(){
  const m=mapaPixel(340);
  m.techo(0,339,0,1);                                        // techo de la cueva en todo el nivel
  m.suelo(0,34);m.bloques(8,7,'BQB');m.monedas(8,6,3);m.enemigo(16);
  m.techo(20,30,2,7);m.monedas(21,G-1,9);m.enemigo(27);      // túnel bajo
  m.duro(36,9,2);m.duro(41,9,2);m.monedas(36,8,2);m.monedas(41,8,2);   // pozo 35-44 con dos islas
  m.suelo(45,95);
  m.bloques(50,7,'QHQ');m.enemigo(56);m.enemigo(60);
  m.picos(64,68);m.plat(64,8,5);m.monedas(64,7,5);
  m.techo(72,84,2,7);m.monedas(73,G-1,11);m.enemigo(78);m.enemigo(82);
  m.escalera(88,3);m.bajada(91,3);
  m.duro(98,9,2);m.duro(102,8,2);                          // pozo 96-104
  m.suelo(105,170);m.control(108);
  m.bloques(112,7,'BBQBB');m.bloques(112,4,'  H  ');m.enemigo(118);m.enemigo(122);
  m.resorte(128);m.plat(131,5,6);m.monedas(131,4,6);for(let r=4;r<=7;r++)m.set(128,r,'o');
  m.turbo(140);m.monedas(143,G-1,12);m.enemigo(155);m.enemigo(160);
  m.picos(164,169);m.duro(165,8,4);
  m.duro(172,9,2);m.duro(176,8,2);m.monedas(176,7,2);        // pozo 171-179
  m.suelo(180,250);
  m.techo(185,200,2,7);m.monedas(186,G-1,14);m.enemigo(192);m.enemigo(197);
  m.bloques(205,7,'QBQBQBQ');m.enemigo(212);m.enemigo(218);
  m.piramide(224,4);m.control(236);
  m.picos(240,246);m.plat(240,8,3);m.plat(245,8,3);
  m.duro(252,9,2);m.duro(256,8,2);                           // pozo 251-259
  m.suelo(260,339);
  m.bloques(266,7,'BHBQB');m.enemigo(272);m.enemigo(278);m.enemigo(284);
  m.techo(290,302,2,7);m.monedas(291,G-1,11);m.enemigo(298);
  m.escalera(310,6);m.meta(326);
  m.cerrar();
}

// 1-4 · Montaña nevada: el suelo resbala (hielo), pozos amplios, resortes y escaleras de nieve
function mapaNieve(){
  const m=mapaPixel(335);
  m.suelo(0,36);m.monedas(5,9,6);m.bloques(12,7,'BHBQB');m.enemigo(20);m.enemigo(26);
  m.escalera(30,3);m.arco(33,7,8,3);                       // hueco 37-40
  m.suelo(41,88);
  m.bloques(46,7,'QBQ');m.enemigo(52);m.picos(56,58);m.arco(55,8,5,2);
  m.resorte(62);for(let r=4;r<=7;r++)m.set(62,r,'o');m.plat(65,5,6,'K');m.monedas(65,4,6);
  m.enemigo(74);m.enemigo(80);m.piramide(82,3);
  m.duro(90,9,2);m.duro(94,8,2);m.monedas(94,7,2);           // pozo 89-97
  m.suelo(98,160);m.control(102);
  m.turbo(106);m.monedas(109,G-1,12);m.enemigo(124);m.enemigo(129);
  m.bloques(134,7,'BQBQBQB');m.enemigo(140);m.enemigo(146);
  m.picos(150,155);m.duro(150,8,3);m.duro(154,8,2);
  m.arco(160,8,6,2);                                        // hueco 161-164
  m.suelo(165,230);
  m.escalera(170,5);m.bajada(175,5);m.monedas(173,4,4);
  m.bloques(185,7,'BHB');m.enemigo(190);m.enemigo(196);m.enemigo(202);
  m.resorte(208);for(let r=4;r<=7;r++)m.set(208,r,'o');m.plat(211,5,5);m.monedas(211,4,5);
  m.control(222);
  m.duro(232,9,2);m.duro(236,8,2);m.duro(240,9,2);           // pozo 231-243
  m.suelo(244,334);
  m.bloques(250,7,'QBQBQ');m.enemigo(256);m.enemigo(262);m.turbo(268);m.monedas(271,G-1,12);
  m.enemigo(286);m.enemigo(292);m.piramide(296,4);
  m.bloques(306,7,'BQB');m.enemigo(310);
  m.escalera(312,6);m.meta(324);
  m.cerrar();
}

const Nivel1_2=crearNivelPixel({clave:'px2',titulo:'NIVEL 1-2',tema:'desierto',construir:mapaDesierto});
const Nivel1_3=crearNivelPixel({clave:'px3',titulo:'NIVEL 1-3',tema:'cueva',construir:mapaCueva});
const Nivel1_4=crearNivelPixel({clave:'px4',titulo:'NIVEL 1-4',tema:'nieve',construir:mapaNieve,hielo:true});
