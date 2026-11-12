// Merudichis Capuchinis · tienda: se paga con las monedas del banco que dejan los niveles ganados
'use strict';
const TIENDA=[
  {id:'collar_azul',  grupo:'Kiara',       nombre:'Collar azul',             precio:30, equipa:['collar','azul']},
  {id:'collar_dorado',grupo:'Kiara',       nombre:'Collar dorado',           precio:80, equipa:['collar','dorado']},
  {id:'mono',         grupo:'Kiara',       nombre:'Moñito',                  precio:40, equipa:['mono',true]},
  {id:'sueter',       grupo:'Kiara',       nombre:'Suéter',                  precio:60, equipa:['sueter',true]},
  {id:'gorra',        grupo:'Tu personaje',nombre:'Gorra',                   precio:50, equipa:['gorra',true]},
  {id:'lentes',       grupo:'Tu personaje',nombre:'Lentes oscuros',          precio:50, equipa:['lentes',true]},
  {id:'auto_verde',   grupo:'Autos',       nombre:'Pintura verde limón',     precio:40, equipa:['pintura','#7cb342']},
  {id:'auto_negro',   grupo:'Autos',       nombre:'Pintura negro mate',      precio:40, equipa:['pintura','#2b2b2b']},
  {id:'auto_morado',  grupo:'Autos',       nombre:'Pintura morada',          precio:40, equipa:['pintura','#7b1fa2']},
  {id:'vida_extra',   grupo:'Ventajas',    nombre:'Vida extra al iniciar',   precio:100},
  {id:'kiara_12',     grupo:'Ventajas',    nombre:'Kiara dura 12 segundos',  precio:120}
];
const VALOR_SIN_EQUIPO={collar:'rojo',mono:false,sueter:false,gorra:false,lentes:false,pintura:null};

const equipado=it=>!!it.equipa&&Progreso.equipo(it.equipa[0])===it.equipa[1];

function tiendaHTML(){
  let h=`<h1>Tienda</h1><p class="stats">🪙 ${Progreso.banco} monedas</p>
    <canvas id="tprev" width="320" height="150" style="width:240px;height:112px;background:#cfe6ff;border-radius:12px;display:block;margin:0 auto 6px"></canvas>
    <p class="hint">Las monedas se guardan cada vez que ganas un nivel. Los accesorios se ven en los modelos (no en tus fotos).</p>`;
  let grupo='';
  for(const it of TIENDA){
    if(it.grupo!==grupo){grupo=it.grupo;h+=`<p class="sub" style="margin:10px 0 0">${grupo}</p>`;}
    const tiene=Progreso.tiene(it.id), puesto=equipado(it);
    let estado,boton;
    if(!tiene){estado='🪙 '+it.precio;boton=`<button class="pill ${Progreso.banco>=it.precio?'':'off'}" data-a="buy-${it.id}">Comprar</button>`;}
    else if(!it.equipa){estado='Activa';boton='';}
    else{estado=puesto?'Puesto':'Comprado';boton=`<button class="pill ${puesto?'off':''}" data-a="eq-${it.id}">${puesto?'Quitar':'Usar'}</button>`;}
    h+=`<div class="opt shop"><b>${it.nombre}<span>${estado}</span></b>${boton}</div>`;
  }
  return h+`<div class="msg" id="tmsg"></div><button class="btn go" data-a="back">✔ Listo</button>`;
}
function pintarTienda(){
  const c=document.getElementById('tprev');if(!c)return;
  const g=c.getContext('2d');g.clearRect(0,0,c.width,c.height);
  Personajes.heroe(g,'parado',110,140,1,125);
  Personajes.kiara(g,'k_parada',220,140,1,70);
}
// Regresa el mensaje para mostrar, o '' si todo salió bien
function accionTienda(a){
  const it=TIENDA.find(x=>a.endsWith('-'+x.id));if(!it)return '';
  if(a.startsWith('buy-')){
    if(!Progreso.comprar(it.id,it.precio))return `Te faltan ${it.precio-Progreso.banco} monedas. ¡Gana más niveles!`;
    sfx.item();
    if(it.equipa)Progreso.equipar(it.equipa[0],it.equipa[1]);
    return '';
  }
  if(a.startsWith('eq-')&&it.equipa){
    const [k,v]=it.equipa;
    Progreso.equipar(k,equipado(it)?VALOR_SIN_EQUIPO[k]:v);
  }
  return '';
}
