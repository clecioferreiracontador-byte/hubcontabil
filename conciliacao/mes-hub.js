/* Mês de fechamento escolhido no Book de conciliação.
   O Book grava o mês (aaaa-mm) neste navegador; os outros painéis da Conciliação abrem nele e, se já estiverem
   abertos, mudam junto quando o mês do Book muda (evento "storage", que chega aos outros painéis do Hub). */
(function(){
  var K = 'aud-hub-mes', ok = function(m){ return /^\d{4}-\d{2}$/.test(m || ''); };
  window.mesDoHub = function(){ try { var m = localStorage.getItem(K); return ok(m) ? m : ''; } catch(e){ return ''; } };
  window.publicarMesHub = function(m){ try { if (ok(m) && localStorage.getItem(K) !== m) localStorage.setItem(K, m); } catch(e){} };
  window.aoMudarMesHub = function(fn){ window.addEventListener('storage', function(e){ if (e.key === K && ok(e.newValue)) fn(e.newValue); }); };
  window.fimDoMesHub = function(m){ var y = +m.slice(0, 4), mm = +m.slice(5, 7), d = new Date(y, mm, 0); return m + '-' + String(d.getDate()).padStart(2, '0'); };

  /* Suportes por mês: cada painel publica em "aud-hub-suportes" o saldo das contas só do mês em que foi aberto por
     último. Aqui cada publicação também é guardada num histórico por data-base ("aud-hub-suportes-hist"), para o Book
     continuar vendo a conta como conciliada num mês mesmo depois de o painel ter sido aberto em outro mês. */
  var KS = 'aud-hub-suportes', KH = 'aud-hub-suportes-hist', MAX = 36;
  var setOrig = Storage.prototype.setItem;
  function lerJSON(k){ try { return JSON.parse(localStorage.getItem(k) || '{}') || {}; } catch(e){ return {}; } }
  function guardarHist(json){
    try {
      var s = JSON.parse(json || '{}') || {}, h = lerJSON(KH), por = {}, mudou = false;
      Object.keys(s).forEach(function(c){ var x = s[c]; if (x && /^\d{4}-\d{2}-\d{2}$/.test(x.data || '')) (por[x.data] = por[x.data] || {})[c] = x; });
      Object.keys(por).forEach(function(d){
        var H = h[d] = h[d] || {}, fontes = {};
        Object.keys(por[d]).forEach(function(c){ fontes[por[d][c].fonte] = 1; });
        // a publicação de um painel para a data substitui o que ele tinha publicado antes para a mesma data
        Object.keys(H).forEach(function(c){ if (fontes[H[c].fonte] && !por[d][c]){ delete H[c]; mudou = true; } });
        Object.keys(por[d]).forEach(function(c){ if (JSON.stringify(H[c]) !== JSON.stringify(por[d][c])){ H[c] = por[d][c]; mudou = true; } });
      });
      var ds = Object.keys(h).sort(); while (ds.length > MAX){ delete h[ds.shift()]; mudou = true; }
      if (mudou) setOrig.call(localStorage, KH, JSON.stringify(h));
    } catch(e){}
  }
  try {
    Storage.prototype.setItem = function(k, v){ setOrig.call(this, k, v); if (k === KS && this === window.localStorage) guardarHist(v); };
    guardarHist(localStorage.getItem(KS));   // o que já estava publicado entra no histórico
  } catch(e){}
  // suporte da conta na data-base (aaaa-mm-dd): o publicado agora, se for da data; senão o do histórico
  window.suporteHub = function(conta, data){
    var s = lerJSON(KS)[conta]; if (s && s.data === data) return s;
    var h = lerJSON(KH)[data]; return h && h[conta] ? h[conta] : null;
  };
  window.suportesHubData = function(data){
    var out = {}, h = lerJSON(KH)[data] || {}, s = lerJSON(KS);
    Object.keys(h).forEach(function(c){ out[c] = h[c]; });
    Object.keys(s).forEach(function(c){ if (s[c] && s[c].data === data) out[c] = s[c]; });
    return out;
  };
})();
