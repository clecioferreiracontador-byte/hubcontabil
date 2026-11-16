/* Mês de fechamento escolhido no Book de conciliação.
   O Book grava o mês (aaaa-mm) neste navegador; os outros painéis da Conciliação abrem nele e, se já estiverem
   abertos, mudam junto quando o mês do Book muda (evento "storage", que chega aos outros painéis do Hub). */
(function(){
  var K = 'aud-hub-mes', ok = function(m){ return /^\d{4}-\d{2}$/.test(m || ''); };
  window.mesDoHub = function(){ try { var m = localStorage.getItem(K); return ok(m) ? m : ''; } catch(e){ return ''; } };
  window.publicarMesHub = function(m){ try { if (ok(m) && localStorage.getItem(K) !== m) localStorage.setItem(K, m); } catch(e){} };
  window.aoMudarMesHub = function(fn){ window.addEventListener('storage', function(e){ if (e.key === K && ok(e.newValue)) fn(e.newValue); }); };
  window.fimDoMesHub = function(m){ var y = +m.slice(0, 4), mm = +m.slice(5, 7), d = new Date(y, mm, 0); return m + '-' + String(d.getDate()).padStart(2, '0'); };
})();
