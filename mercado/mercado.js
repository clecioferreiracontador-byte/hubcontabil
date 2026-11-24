/* Mercado — comparação da NHD Foods com referências publicadas do setor (Hub Contábil)
   Os números da NHD vêm do próprio dash (D = DRE mensal, BALHIST = balanço do último mês).
   As referências do setor ficam em mercado/mercado.json, que o contador revisa e atualiza
   (uma vez por ano, ou a cada trimestre para as empresas listadas). Cada número traz fonte e ano.
   Formato do JSON: {v, atualizado, setor, periodo, avisos:[], fontes:{id:{nome,url,ano}},
     indicadores:[{k,nome,un:'%'|'x'|'d',melhor:'alto'|'baixo',min,p25,med,p75,max,fontes:[id],nota}],
     pares:{titulo, linhas:[{nome,seg,ano,v:{k:valor},fonte:id}]}}
   Pode haver mais de um grupo de comparação (ex.: atacado de alimentos e alimentação saudável), cada um no seu
   arquivo JSON, no mesmo formato: um seletor no topo troca o grupo (a escolha fica salva neste navegador). */
(function(){
'use strict';
var CFG=window.MERCADO_CFG||{};
var NOME=CFG.nome||'NHD Foods', CURTO=CFG.curto||'NHD', ROOT=CFG.root||'mercadoRoot';
var GRUPOS=CFG.grupos||[{id:'atacado',nome:'Atacado de alimentos',arq:'mercado/mercado.json'},{id:'saudavel',nome:'Alimentação saudável',arq:'mercado/saudavel.json'}];
var REFS={}, SEL=GRUPOS[0].id;
try{var g0=localStorage.getItem('mercadoGrupo');if(GRUPOS.some(function(g){return g.id===g0;}))SEL=g0;}catch(e){}
var REF=CFG.ref||null, erro=null, carregando=false;
// período da NHD: acumulado (jan até o último mês), um mês ou "escolher período" (de/até)
var PER={modo:'all',de:0,ate:null};
var MC=['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'],MLc=['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
function nMeses(){return (typeof numMeses==='number'&&numMeses>0)?numMeses:12;}
function periodo(){
  var n=nMeses(),ult=n-1;
  if(PER.modo==='all'){PER.de=0;PER.ate=ult;}
  if(PER.ate===null||PER.ate>ult)PER.ate=ult;if(PER.de<0||PER.de>PER.ate)PER.de=0;
  return {de:PER.de,ate:PER.ate};
}
function perMudar(v){if(v==='all'){PER.modo='all';PER.de=0;PER.ate=null;}else if(v==='range'){PER.modo='range';}else{PER.modo='m';PER.de=PER.ate=+v;}render();}
function perDe(v){PER.de=+v;render();}
function perAte(v){PER.ate=+v;render();}
function barraPeriodo(){
  var n=nMeses(),P=periodo(),o='<option value="all">Acumulado (Jan–'+MC[n-1]+')</option><option value="range">Escolher período…</option>';
  for(var i=0;i<n;i++)o+='<option value="'+i+'">'+MLc[i]+'</option>';
  var opt=function(a,b,sel){var h='';for(var i=a;i<=b;i++)h+='<option value="'+i+'"'+(i===sel?' selected':'')+'>'+MC[i]+'</option>';return h;};
  var val=PER.modo==='m'?String(P.ate):PER.modo;
  return '<div class="fbar"><span class="fl">Período:</span><select class="fs" id="mktPer" onchange="Mercado.periodo(this.value)">'+o.replace('value="'+val+'"','value="'+val+'" selected')+'</select>'+
    (PER.modo==='range'?'<span class="fl">de:</span><select class="fs" onchange="Mercado.de(this.value)">'+opt(0,P.ate,P.de)+'</select><span class="fl">até:</span><select class="fs" onchange="Mercado.ate(this.value)">'+opt(P.de,n-1,P.ate)+'</select>':'')+
    '<span class="finfo">Prazos e dívida usam o balancete do último mês do período; a dívida/EBITDA anualiza o EBITDA do período.</span></div>';
}
if(REF)REFS[SEL]=REF;

function css(){
  if(document.getElementById('mkt-css'))return;
  var s=document.createElement('style');s.id='mkt-css';
  s.textContent=
  '.mkt-head{display:flex;flex-wrap:wrap;gap:10px 18px;align-items:flex-end;justify-content:space-between;margin:18px 0 14px}'+
  '.mkt-chips{display:flex;flex-wrap:wrap;gap:6px}'+
  '.mkt-chip{font-size:12px;color:var(--gray2);border:1px solid var(--bdr);border-radius:99px;padding:3px 10px;background:var(--n3)}'+
  '.mkt-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:12px}'+
  '.mkt-card{background:var(--n3);border:1px solid var(--bdr);border-radius:var(--r);padding:14px 16px;display:flex;flex-direction:column;gap:8px;min-width:0}'+
  '.mkt-top{display:flex;justify-content:space-between;align-items:center;gap:8px}'+
  '.mkt-name{font-family:Calibri,"Segoe UI",Arial,sans-serif;font-weight:700;font-size:16px;color:var(--g2)}'+
  '.mkt-st{font-size:11px;font-weight:700;border-radius:99px;padding:2px 9px;white-space:nowrap}'+
  '.mkt-st.bom{background:rgba(39,174,96,.15);color:#2ECC71}.mkt-st.meio{background:rgba(52,152,219,.15);color:#5DADE2}.mkt-st.ruim{background:rgba(231,76,60,.15);color:#F08A7C}.mkt-st.na{background:rgba(127,140,141,.15);color:var(--gray2)}'+
  '.mkt-vals{display:flex;gap:18px;align-items:baseline;flex-wrap:wrap}'+
  '.mkt-v{display:flex;flex-direction:column}.mkt-v b{font-size:24px;color:var(--white);font-weight:700;line-height:1.1}.mkt-v span{font-size:11.5px;color:var(--gray)}'+
  '.mkt-v.ref b{font-size:18px;color:var(--gray2)}'+
  '.mkt-bar{position:relative;height:34px;margin:4px 6px 0}'+
  '.mkt-track{position:absolute;left:0;right:0;top:12px;height:6px;border-radius:99px;background:rgba(160,176,190,.15)}'+
  '.mkt-band{position:absolute;top:12px;height:6px;border-radius:99px;background:rgba(201,168,76,.45)}'+
  '.mkt-med{position:absolute;top:8px;width:2px;height:14px;background:var(--g2);margin-left:-1px}'+
  '.mkt-dot{position:absolute;top:8px;width:14px;height:14px;border-radius:50%;margin-left:-7px;background:#5DADE2;border:2px solid var(--white);box-shadow:0 0 0 2px rgba(13,27,46,.8)}'+
  '.mkt-lbl{position:absolute;top:24px;font-size:10.5px;color:var(--gray);transform:translateX(-50%);white-space:nowrap}'+
  '.mkt-frase{font-size:13px;color:var(--gray2);line-height:1.4}'+
  '.mkt-src{font-size:11px;color:var(--gray);line-height:1.35}'+
  '.mkt-leg{display:flex;flex-wrap:wrap;gap:14px;font-size:12px;color:var(--gray2);margin:0 0 12px}'+
  '.mkt-leg i{display:inline-block;vertical-align:middle;margin-right:5px}'+
  '.mkt-sec{margin-top:16px}'+
  '.mkt-grupos{display:flex;flex-wrap:wrap;gap:6px;margin:0 0 12px}.mkt-grupos .fs{cursor:pointer}.mkt-grupos .fs.on{border-color:var(--gold);color:var(--g2);background:rgba(201,168,76,.13)}'+
  '.mkt-tw{overflow-x:auto;-webkit-overflow-scrolling:touch}'+
  '.mkt-t{width:100%;border-collapse:collapse;font-size:13px;min-width:560px}'+
  '.mkt-t th,.mkt-t td{padding:7px 8px;border-bottom:1px solid rgba(201,168,76,.08);text-align:right;white-space:nowrap}'+
  '.mkt-t th{color:var(--gray2);font-weight:600;font-size:12px}'+
  '.mkt-t td:first-child,.mkt-t th:first-child{text-align:left}'+
  '.mkt-t tr.nhd td{color:var(--g2);font-weight:700;background:rgba(201,168,76,.06)}'+
  '.mkt-t td small{color:var(--gray);font-weight:400}'+
  '.mkt-notas{font-size:12.5px;color:var(--gray2);line-height:1.5;padding-left:18px;margin:6px 0 0}'+
  '.mkt-notas a{color:#5DADE2}'+
  '@media(max-width:860px){.mkt-grid{grid-template-columns:minmax(0,1fr)}.mkt-v b{font-size:20px}.mkt-v.ref b{font-size:16px}}';
  document.head.appendChild(s);
}

/* ---------- números da NHD (período escolhido, a partir do dash) ---------- */
function nhd(){
  if(typeof CFG.dados==='function')return CFG.dados();
  var P=periodo(),n=P.ate-P.de+1;
  var soma=function(k){var a=(typeof D!=='undefined'&&D[k])||[];var t=0;for(var i=P.de;i<=P.ate;i++)t+=a[i]||0;return t;};
  var rb=soma('rb'),rl=soma('rl'),mb=soma('mb'),eb=soma('eb'),ll=soma('ll'),cmv=soma('custos');
  // balanço do último mês do período (sem ele, o último balancete anterior)
  var ult=P.ate, b=(typeof BALHIST!=='undefined'&&BALHIST[ult])||null;
  if(!b&&typeof BALHIST!=='undefined'){var ks=Object.keys(BALHIST).map(Number).filter(function(k){return k<=P.ate;}).sort(function(x,y){return x-y;});if(ks.length){ult=ks[ks.length-1];b=BALHIST[ult];}}
  var dias=n*30.4, anual=12/n, o={_n:n,_de:P.de,_ate:P.ate,_ult:ult};
  if(rl){o.mb=mb/rl*100;o.eb=eb/rl*100;o.ll=ll/rl*100;}
  if(b){
    if(b.pc)o.liq=b.ac/b.pc;
    if(b.at)o.endiv=(b.pc+Math.abs(b.pnc||0))/b.at*100;
    var dl=(b.empCP||0)+(b.empLP||0)-(b.caixa||0);
    if(eb)o.dlEb=dl/(eb*anual);
    if(rb)o.pmr=(b.cred||0)/rb*dias;
    if(cmv){o.pmp=(b.forn||0)/cmv*dias;o.pme=(b.est||0)/cmv*dias;}
    if(b.pl>0)o.roe=ll*anual/b.pl*100;
  }
  return o;
}

/* ---------- formatação ---------- */
function nf(v,d){return v.toFixed(d).replace('.',',');}
function fv(v,un){
  if(v==null||!isFinite(v))return '—';
  if(un==='%')return nf(v,1)+'%';
  if(un==='x')return nf(v,2)+'×';
  if(un==='d')return Math.round(v)+' dias';
  return nf(v,1);
}
function fdif(d,un){
  var s=d>=0?'+':'−',a=Math.abs(d);
  if(un==='%')return s+nf(a,1)+' p.p.';
  if(un==='x')return s+nf(a,2)+'×';
  if(un==='d')return s+Math.round(a)+' dias';
  return s+nf(a,1);
}
function esc(t){return String(t==null?'':t).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}

/* posição relativa à faixa: acima / dentro / abaixo, ajustada a "melhor alto|baixo" */
function situacao(v,r){
  if(v==null||!isFinite(v))return {cls:'na',txt:'Sem dado'};
  var lo=r.p25!=null?r.p25:r.med, hi=r.p75!=null?r.p75:r.med;
  var pos=v>hi?1:v<lo?-1:0;
  if(r.melhor==='baixo')pos=-pos;
  if(pos>0)return {cls:'bom',txt:'Melhor que o setor'};
  if(pos<0)return {cls:'ruim',txt:'Pior que o setor'};
  return {cls:'meio',txt:'Na faixa do setor'};
}

function barra(v,r){
  var xs=[r.min,r.p25,r.med,r.p75,r.max,v].filter(function(x){return x!=null&&isFinite(x);});
  var lo=Math.min.apply(null,xs),hi=Math.max.apply(null,xs),pad=(hi-lo)*0.08||1;lo-=pad;hi+=pad;
  if(r.un!=='x'&&lo<0&&Math.min.apply(null,xs)>=0)lo=0;
  var p=function(x){return ((x-lo)/(hi-lo)*100).toFixed(2)+'%';};
  var h='<div class="mkt-bar"><div class="mkt-track"></div>';
  if(r.p25!=null&&r.p75!=null)h+='<div class="mkt-band" style="left:'+p(r.p25)+';width:calc('+p(r.p75)+' - '+p(r.p25)+')"></div>';
  if(r.med!=null)h+='<div class="mkt-med" style="left:'+p(r.med)+'"></div>';
  if(v!=null&&isFinite(v))h+='<div class="mkt-dot" style="left:'+p(v)+'" title="'+esc(CURTO)+': '+esc(fv(v,r.un))+'"></div>';
  if(r.p25!=null)h+='<div class="mkt-lbl" style="left:'+p(r.p25)+'">'+fv(r.p25,r.un).replace(' dias','d')+'</div>';
  if(r.p75!=null)h+='<div class="mkt-lbl" style="left:'+p(r.p75)+'">'+fv(r.p75,r.un).replace(' dias','d')+'</div>';
  return h+'</div>';
}

function nomesFontes(ids){
  var f=(REF&&REF.fontes)||{};
  return (ids||[]).map(function(id){var x=f[id];return x?esc(x.nome)+(x.ano?' ('+esc(x.ano)+')':''):esc(id);}).join(' · ');
}

function card(r,o){
  var v=o[r.k], st=situacao(v,r), fr='';
  if(v!=null&&isFinite(v)&&r.med!=null){
    var d=v-r.med, melhor=r.melhor==='baixo'?d<0:d>0;
    fr=CURTO+' '+fv(v,r.un)+' contra mediana de '+fv(r.med,r.un)+' ('+fdif(d,r.un)+(Math.abs(d)<1e-9?'':melhor?', a favor da '+CURTO:', contra a '+CURTO)+').';
  }else if(v==null)fr='Não foi possível calcular com os dados do período.';
  return '<div class="mkt-card">'+
    '<div class="mkt-top"><span class="mkt-name">'+esc(r.nome)+'</span><span class="mkt-st '+st.cls+'">'+st.txt+'</span></div>'+
    '<div class="mkt-vals"><div class="mkt-v"><b>'+fv(v,r.un)+'</b><span>'+esc(NOME)+'</span></div>'+
    '<div class="mkt-v ref"><b>'+fv(r.med,r.un)+'</b><span>mediana do setor</span></div>'+
    (r.p25!=null&&r.p75!=null?'<div class="mkt-v ref"><b>'+fv(r.p25,r.un).replace(' dias','')+' a '+fv(r.p75,r.un)+'</b><span>faixa do setor</span></div>':'')+'</div>'+
    barra(v,r)+
    '<div class="mkt-frase">'+fr+(r.nota?' '+esc(r.nota):'')+'</div>'+
    '<div class="mkt-src">Fonte: '+nomesFontes(r.fontes)+'</div></div>';
}

function tabelaPares(o){
  var P=REF.pares; if(!P||!P.linhas||!P.linhas.length)return '';
  var inds=REF.indicadores.filter(function(r){return P.linhas.some(function(l){return l.v&&l.v[r.k]!=null;});});
  var h='<div class="cc mkt-sec"><div class="ctop"><div><div class="ctitle">'+esc(P.titulo||'Empresas de referência')+'</div>'+
    '<div class="cdesc">Números publicados pelas próprias empresas. '+esc(CURTO)+' no período escolhido ('+esc(periodoNHD(o))+').</div></div></div>'+
    '<div class="mkt-tw"><table class="mkt-t"><thead><tr><th>Empresa</th>'+inds.map(function(r){return '<th>'+esc(r.curto||r.nome)+'</th>';}).join('')+'</tr></thead><tbody>'+
    '<tr class="nhd"><td>'+esc(NOME)+' <small>'+esc(periodoNHD(o))+'</small></td>'+inds.map(function(r){return '<td>'+fv(o[r.k],r.un)+'</td>';}).join('')+'</tr>';
  P.linhas.forEach(function(l){
    h+='<tr><td>'+esc(l.nome)+' <small>'+esc([l.seg,l.ano].filter(Boolean).join(' · '))+'</small></td>'+
      inds.map(function(r){var x=l.v&&l.v[r.k];return '<td>'+(x==null?'—':fv(x,r.un))+'</td>';}).join('')+'</tr>';
  });
  return h+'</tbody></table></div></div>';
}

function periodoNHD(o){
  if(o._per)return o._per;
  var de=o._de!=null?o._de:0,ate=o._ate!=null?o._ate:o._n-1;
  return (de===ate?MLc[ate].toLowerCase():MC[de]+'–'+MC[ate])+'/2026';
}

function notas(){
  var h='<div class="cc mkt-sec"><div class="ctitle">Como ler esta comparação</div><ul class="mkt-notas">';
  (REF.avisos||[]).forEach(function(a){h+='<li>'+esc(a)+'</li>';});
  h+='</ul><div class="ctitle" style="margin-top:12px;font-size:14px">Fontes</div><ul class="mkt-notas">';
  var f=REF.fontes||{};
  Object.keys(f).forEach(function(id){var x=f[id];h+='<li>'+esc(x.nome)+(x.ano?' · base '+esc(x.ano):'')+(x.url?' · <a href="'+esc(x.url)+'" target="_blank" rel="noopener">abrir fonte</a>':'')+(x.obs?' · '+esc(x.obs):'')+'</li>';});
  return h+'</ul></div>';
}

function grupoTrocar(id){SEL=id;try{localStorage.setItem('mercadoGrupo',id);}catch(e){}REF=REFS[SEL]||null;erro=null;render();}
function seletor(){
  if(GRUPOS.length<2)return '';
  return '<div class="mkt-grupos" role="tablist" aria-label="Grupo de comparação">'+GRUPOS.map(function(g){return '<button type="button" class="fs'+(g.id===SEL?' on':'')+'" role="tab" aria-selected="'+(g.id===SEL)+'" onclick="Mercado.grupo(\''+g.id+'\')">'+esc(g.nome)+'</button>';}).join('')+'</div>';
}
function render(){
  var root=document.getElementById(ROOT); if(!root)return;
  css();
  REF=REFS[SEL]||null;
  if(!REF){
    root.innerHTML='<div style="margin:18px 0"><div class="ptitle">Mercado</div>'+seletor()+'<div class="psub">'+(erro?'Não foi possível carregar as referências do setor ('+esc(erro)+').':'Carregando referências do setor…')+'</div></div>';
    if(!carregando&&!erro)carregar();
    return;
  }
  var o=nhd();
  var bom=0,tot=0;
  REF.indicadores.forEach(function(r){var s=situacao(o[r.k],r);if(s.cls!=='na'){tot++;if(s.cls!=='ruim')bom++;}});
  root.innerHTML=
    barraPeriodo()+'<div class="mkt-head"><div><div class="ptitle">Mercado</div>'+seletor()+'<div class="psub">'+esc(NOME)+' comparada com referências publicadas do setor · '+esc(REF.setor||'')+'</div></div>'+
    '<div class="mkt-chips"><span class="mkt-chip">'+esc(CURTO)+': '+(o._n>1?'acumulado ':'')+esc(periodoNHD(o))+'</span><span class="mkt-chip">Setor: '+esc(REF.periodo||'')+'</span><span class="mkt-chip">'+bom+' de '+tot+' indicadores na faixa ou melhor</span></div></div>'+
    '<div class="mkt-leg"><span><i style="width:12px;height:12px;border-radius:50%;background:#5DADE2;border:2px solid var(--white)"></i>'+esc(NOME)+'</span><span><i style="width:22px;height:6px;border-radius:99px;background:rgba(201,168,76,.45)"></i>Faixa de referência do setor</span><span><i style="width:2px;height:12px;background:var(--g2)"></i>Mediana</span></div>'+
    '<div class="mkt-grid">'+REF.indicadores.map(function(r){return card(r,o);}).join('')+'</div>'+
    tabelaPares(o)+notas();
}

function carregar(){
  var g=GRUPOS.filter(function(x){return x.id===SEL;})[0]||GRUPOS[0],id=g.id;
  carregando=true;
  fetch(g.arq+'?t='+Date.now(),{cache:'no-store'}).then(function(r){if(!r.ok)throw new Error('HTTP '+r.status);return r.json();})
    .then(function(j){REFS[id]=j;carregando=false;if(ativo())render();})
    .catch(function(e){if(id===SEL)erro=e.message||String(e);carregando=false;render();});
}

/* quando o admin aplica uma base nova, os números da NHD mudam */
if(typeof window.adminApply==='function'){var aa=window.adminApply;window.adminApply=function(){var r=aa.apply(this,arguments);try{var p=document.getElementById('page-mercado');if(p&&p.classList.contains('active'))render();}catch(e){}return r;};}

function ativo(){if(typeof CFG.ativo==='function')return CFG.ativo();var p=document.getElementById('page-mercado');return !!(p&&p.classList.contains('active'));}
window.Mercado={render:render,nhd:nhd,grupo:grupoTrocar,periodo:perMudar,de:perDe,ate:perAte};
if(!REF)carregar();
})();
