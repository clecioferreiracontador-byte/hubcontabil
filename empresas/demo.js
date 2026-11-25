/* Demonstração comercial do Hub Contábil (?demo no endereço) — empresa e números FICTÍCIOS.
   "Sabor do Campo Alimentos" é uma indústria de alimentos inventada para apresentar o Hub a clientes.
   Usa o mesmo modelo da NHD Foods (DRE, balanço, LALUR, mercado e mapa de vendas): por isso esta
   configuração não traz DTREE/receitas próprias, só nome, logo e as telas que ficam de fora.
   Os dados vêm de demo/dados/*.json (lidos pelo auth/hub-auth.js no modo demo); nada vai ao Firebase. */
(function(){
  var logo = 'data:image/svg+xml,' + encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 145">' +
      '<g fill="none" stroke="#E8C96A" stroke-width="7" stroke-linecap="round" stroke-linejoin="round">' +
        '<path d="M18 112h104"/>' +
        '<path d="M34 112a36 36 0 0 1 72 0"/>' +
        '<path d="M70 62V40M44 72l-12-14M96 72l12-14"/>' +
        '<path d="M70 112V84M70 96c-10-2-16-8-18-16 10 1 16 7 18 16zM70 96c10-2 16-8 18-16-10 1-16 7-18 16z"/>' +
      '</g>' +
      '<text x="146" y="80" font-family="Segoe UI,Calibri,Arial,sans-serif" font-size="58" font-weight="700" fill="#FFFFFF">Sabor do Campo</text>' +
      '<text x="149" y="116" font-family="Segoe UI,Calibri,Arial,sans-serif" font-size="22" font-weight="600" letter-spacing="9" fill="#E8C96A">ALIMENTOS</text>' +
    '</svg>');

  window.EMP_CFG = {
    id: 'demo',
    demo: true,                 // modelo da NHD: aplicarCfgEmpresa mantém a DRE, o balanço e o LALUR padrão
    titulo: 'Sabor do Campo',
    sub: 'Empresa fictícia · dados ilustrativos para demonstração',
    rodape: 'Sabor do Campo Alimentos (fictícia)',
    logo: logo,
    logoAltura: 40,
    logoSeloClaro: true,        // logo clara sem fundo: no modo claro fica sobre o selo azul-marinho
    favicon: { x0: 0, x1: 0.23, bg: '#0F2035' },
    // Conciliação e Book são rotinas internas da Audicon: ficam fora da demonstração
    ocultarPaginas: ['conc', 'bookv'],
    paineis: []
  };
  // Mercado: nome da empresa nas comparações com o setor
  window.MERCADO_CFG = { nome: 'Sabor do Campo', curto: 'Sabor do Campo' };
})();
