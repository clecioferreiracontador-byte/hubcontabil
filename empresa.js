/* Empresa ativa do Hub Contábil (vários clientes no mesmo Hub).
   Carregar ANTES de qualquer outro script da página (index e telas de conciliação).
   - A empresa escolhida fica na aba (sessionStorage) e a última usada fica no navegador.
   - NHD Foods é a empresa original: seus dados continuam nas chaves e coleções de sempre.
   - Para as outras empresas, toda chave do localStorage ganha o prefixo "emp:<id>:", e o banco local
     (HubDB) e as coleções do Firebase ficam separados por empresa: uma empresa nunca lê dado da outra. */
(function(){
  var EMPRESAS = {
    nhd:    { id: 'nhd',    nome: 'NHD Foods',        curto: 'NHD',    sub: 'Belive' },
    landix: { id: 'landix', nome: 'Landix Sistemas',  curto: 'Landix', sub: 'Landix Sistemas S/A' }
  };
  var K_ABA = 'hubEmpresa', K_ULT = 'hubEmpresaUlt';
  var ls = null; try { ls = window.localStorage; } catch (e) {}
  var proto = window.Storage && Storage.prototype;
  var get0 = proto && proto.getItem, set0 = proto && proto.setItem, del0 = proto && proto.removeItem;
  function ler(){
    var id = null;
    try { id = sessionStorage.getItem(K_ABA); } catch (e) {}
    if (!id && ls) try { id = get0.call(ls, K_ULT); } catch (e) {}
    return EMPRESAS[id] ? id : 'nhd';
  }
  var atual = ler();
  var PREF = atual === 'nhd' ? '' : 'emp:' + atual + ':';
  // chaves que valem para o Hub inteiro (não são dado de empresa)
  var GLOBAL = /^(hubEmpresa|firebase|nhdGhToken$|nhdFullVals$|nhdSkpiCollapsed$)/;
  if (PREF && proto && ls){
    var k = function(st, key){ key = String(key); return st === ls && !GLOBAL.test(key) ? PREF + key : key; };
    proto.getItem = function(key){ return get0.call(this, k(this, key)); };
    proto.setItem = function(key, v){ return set0.call(this, k(this, key), v); };
    proto.removeItem = function(key){ return del0.call(this, k(this, key)); };
    // avisos de outra tela (evento "storage"): só os desta empresa, já com a chave sem o prefixo
    var add0 = window.addEventListener;
    window.addEventListener = function(tipo, fn, op){
      if (tipo === 'storage' && typeof fn === 'function'){
        var f = fn;
        fn = function(e){
          if (e.storageArea !== ls || !e.key || GLOBAL.test(e.key)) return f.call(this, e);
          if (e.key.indexOf(PREF) !== 0) return;
          return f.call(this, { key: e.key.slice(PREF.length), newValue: e.newValue, oldValue: e.oldValue, storageArea: e.storageArea, url: e.url });
        };
      }
      return add0.call(this, tipo, fn, op);
    };
  }
  window.HubEmpresa = {
    lista: EMPRESAS,
    get id(){ return atual; },
    get info(){ return EMPRESAS[atual]; },
    /* sufixo para nomes de banco/coleção: '' na NHD */
    get sufixo(){ return atual === 'nhd' ? '' : '-' + atual; },
    /* chave do localStorage como fica gravada (para comparar com StorageEvent.key) */
    chave: function(key){ return PREF && !GLOBAL.test(key) ? PREF + key : key; },
    trocar: function(id){
      if (!EMPRESAS[id]) return;
      try { sessionStorage.setItem(K_ABA, id); } catch (e) {}
      try { if (ls) set0.call(ls, K_ULT, id); } catch (e) {}
      var top = window.top || window;
      top.location.reload();
    },
    /* apaga estas chaves em todas as empresas (ao sair do Hub) */
    apagarTodas: function(chaves){
      if (!ls) return;
      Object.keys(EMPRESAS).forEach(function(e){ chaves.forEach(function(c){ try { del0.call(ls, e === 'nhd' ? c : 'emp:' + e + ':' + c); } catch (x) {} }); });
    },
    fixar: function(id){
      try { sessionStorage.setItem(K_ABA, id); } catch (e) {}
      try { if (ls) set0.call(ls, K_ULT, id); } catch (e) {}
    }
  };
  HubEmpresa.fixar(atual);
})();
