/* Configuração da Landix Sistemas no Hub Contábil (carregada só quando a empresa ativa é "landix").
   Lucro Real, receitas diferidas (CPC 47) e IRPJ/CSLL diferidos sobre prejuízo fiscal.
   Plano de contas em 5 níveis (ex.: 3.1.1.01.00001). Resultado: 3 receitas, 4 despesas, 5 custos,
   6 outras receitas/despesas, 7 financeiro, 8 IRPJ/CSLL (corrente e diferido); 9 = apuração (fica de fora).
   DRE no modelo da aba "Análise Resultado" do Book. As linhas-chave usam os mesmos números da NHD
   (6 receita bruta, 14 receita líquida, 85 resultado antes do IR, 89 lucro líquido...) para os painéis,
   os indicadores e o relatório funcionarem iguais; as demais linhas são da Landix (300+). */
(function(){
  var DTREE = [], REC = {};
  // n(r, rótulo, tipo de linha, receita, filhos): receita 'L' = contas [[conta, sinal, 'CD'|'DC']], 'C' = linhas [[r, sinal]]
  function n(r, l, t, rec, filhos){
    var no = { r: r, l: l, t: t, v: [0, 0, 0, 0, 0, 0, 0] };
    if (rec) REC[r] = rec;
    if (filhos && filhos.length) no.c = filhos;
    return no;
  }
  var L = function(){ return { t: 'L', x: [].slice.call(arguments) }; };
  var C = function(){ return { t: 'C', x: [].slice.call(arguments) }; };
  var dc = function(c){ return [c, 1, 'DC']; }, cd = function(c){ return [c, 1, 'CD']; }, menos = function(c){ return [c, -1, 'DC']; };

  DTREE = [
    n(6, 'RECEITA BRUTA', 'rt', L(cd('3.1.1')), [
      n(301, 'Mercado interno (serviços, licenças e recorrente)', 'rs', L(cd('3.1.1.01.00001'), cd('3.1.1.01.00002'), cd('3.1.1.01.00005'))),
      n(302, 'Exportação de serviços', 'rs', L(cd('3.1.1.01.00003'), cd('3.1.1.01.00004'))),
      n(303, 'Diferimento / receita a faturar (CPC 47)', 'rs', L(cd('3.1.1.01.0005')))
    ]),
    n(7, '( - ) Deduções', 'rst', L(dc('3.1.2')), [
      n(304, 'Tributos s/ faturamento (PIS, COFINS, ISS)', 'rs', L(dc('3.1.2.01'))),
      n(305, 'Cancelamentos e devoluções', 'rs', L(dc('3.1.2.02')))
    ]),
    n(14, 'RECEITA LÍQUIDA', 'rt', C([6, 1], [7, -1])),
    n(15, '( - ) Custos dos Serviços Prestados', 'rst', L(dc('5')), [
      n(306, 'Pessoal', 'rst', L(dc('5.1.1')), [
        n(307, 'Remunerações', 'rs', L(dc('5.1.1.20'))),
        n(308, 'Encargos sociais', 'rs', L(dc('5.1.1.30'))),
        n(309, 'Benefícios', 'rs', L(dc('5.1.1.40')))
      ]),
      n(310, 'Utilidades e serviços', 'rs', L(dc('5.1.4'))),
      n(311, 'Dados e telecomunicações', 'rs', L(dc('5.1.5'))),
      n(312, 'Viagens e representações', 'rs', L(dc('5.1.6'))),
      n(313, 'Outras despesas', 'rs', L(dc('5.1.7')))
    ]),
    n(60, '≈ MARGEM BRUTA', 'rst', C([14, 1], [15, -1])),
    n(61, 'DESPESAS TOTAIS', 'rt', C([62, 1], [69, 1])),
    n(62, 'Desp. com Pessoal', 'rst', L(dc('4.1.1')), [
      n(314, 'Remunerações', 'rs', L(dc('4.1.1.20'))),
      n(315, 'Encargos sociais', 'rs', L(dc('4.1.1.30'))),
      n(316, 'Benefícios', 'rs', L(dc('4.1.1.40')))
    ]),
    n(69, 'Desp. Operacionais', 'rst', C([317, 1], [318, 1], [319, 1], [320, 1], [321, 1], [59, 1], [322, 1], [325, 1]), [
      n(317, 'Ocupação', 'rs', L(dc('4.1.2'))),
      n(318, 'Serviços de Terceiros', 'rs', L(dc('4.1.3'))),
      n(319, 'Utilidades e Serviços', 'rs', L(dc('4.1.4'))),
      n(320, 'Dados e Telecomunicações', 'rs', L(dc('4.1.5'))),
      n(321, 'Viagens e Representações', 'rs', L(dc('4.1.6'))),
      n(59, 'Depreciações e Amortizações', 'rs', L(dc('4.1.7'))),
      n(322, 'Outras Despesas', 'rst', L(dc('4.1.8')), [
        n(323, 'Dedutíveis', 'rs', L(dc('4.1.8.10'))),
        n(324, 'Indedutíveis', 'rs', L(dc('4.1.8.20')))
      ]),
      n(325, 'Perdas estimadas c/ créditos (PCLD)', 'rs', L(dc('4.3')))
    ]),
    n(78, 'RESULTADO OPERACIONAL', 'rt', C([60, 1], [61, -1])),
    n(79, 'OUTRAS RECEITAS E DESPESAS', 'rst', C([80, 1], [81, 1]), [
      n(80, 'Ganhos e perdas de capital (imobilizado)', 'rs', L(dc('6.1.3'))),
      n(81, 'Outras', 'rs', L(dc('6'), menos('6.1.3')))
    ]),
    n(82, 'RESULTADO FINANCEIRO', 'rst', C([84, 1], [83, 1]), [
      n(83, 'Receita Financeira', 'rs', L(dc('7.1.1.10'))),
      n(84, 'Despesa Financeira', 'rs', L(dc('7.1.1.20')))
    ]),
    n(85, 'RES. ANTES IRPJ E CSLL', 'rt', C([78, 1], [79, -1], [82, -1])),
    n(86, 'PROVISÃO IRPJ E CSLL', 'rst', C([87, 1], [88, 1]), [
      n(87, 'IRPJ', 'rst', L(dc('8.1.1.10.00010'), dc('8.1.1.20.00010')), [
        n(327, 'IRPJ corrente', 'rs', L(dc('8.1.1.10.00010'))),
        n(328, 'IRPJ diferido', 'rs', L(dc('8.1.1.20.00010')))
      ]),
      n(88, 'CSLL', 'rst', L(dc('8.1.1.10.00020'), dc('8.1.1.20.00020')), [
        n(329, 'CSLL corrente', 'rs', L(dc('8.1.1.10.00020'))),
        n(330, 'CSLL diferida', 'rs', L(dc('8.1.1.20.00020')))
      ])
    ]),
    n(89, 'LUCRO LÍQUIDO', 'rt', C([85, 1], [86, -1])),
    n(90, 'EBITDA', 'rt', C([78, 1], [59, 1]))
  ];
  // linhas só de cálculo (fora da árvore): depreciação de custos (não há) e encargos + benefícios das despesas
  REC[58] = L();
  REC[331] = C([315, 1], [316, 1]);

  var D0 = function(){ return [0, 0, 0, 0, 0, 0, 0]; };
  window.EMP_CFG = {
    id: 'landix',
    titulo: 'Landix Sistemas',
    sub: 'Lucro Real · receitas e IRPJ/CSLL diferidos',
    rodape: 'Landix Sistemas',
    semLogo: true,
    ocultarPaginas: ['mercado', 'mapa'],
    paineis: ['book'],
    // contas de resultado (para incluir contas novas na DRE); o grupo 9 (apuração) fica de fora
    resultado: /^[3-8]/,
    DTREE: DTREE,
    DRE_RECIPE: REC,
    DRE_ORDER: [14, 69, 331, 60, 61, 78, 79, 82, 85, 86, 89, 90],
    ROW2DKEY: { 6: 'rb', 7: 'ded', 14: 'rl', 15: 'custos', 58: 'df', 59: 'da', 60: 'mb', 61: 'dt', 62: 'dc', 314: 'dv', 331: 'dm', 69: 'dop',
      320: 'fol', 319: 'ben', 317: 'ocu', 318: 'srv', 78: 'ro', 82: 'rf', 84: 'dfn', 83: 'rcf', 79: 'out', 85: 'ai', 87: 'ir', 88: 'cs', 89: 'll', 90: 'eb' },
    // conta nova fora de todas as linhas: entra como linha automática dentro destes grupos
    DRE_EXTRA_PAI: [['3.1.2', 7], ['3.1', 6], ['3', 6], ['5', 15], ['4.1.1', 62], ['4', 69], ['6', 79], ['7', 82], ['8', 86]],
    // balanço: grupo → contas (lista) e sinal
    BAL_RECIPE: {
      caixa: [['1.1.1'], 1],
      cred: [['1.1.2.01', '1.1.2.03', '1.1.2.04', '1.1.2.05', '1.1.2.06', '1.1.2.08', '1.1.2.09'], 1],
      trib: [['1.1.2.07'], 1], est: [[], 1],
      rlp: [['1.2'], 1], inv: [[], 1], imo: [['1.3.3'], 1], intang: [['1.3.6'], 1],
      forn: [['2.1.1.01'], -1], empCP: [[], -1],
      obrT: [['2.1.1.02', '2.1.1.03', '2.1.1.06'], -1],
      obrTrib: [['2.1.1.04', '2.1.1.05'], -1],
      outrosPC: [['2.1.1.07', '2.1.3'], -1],
      empLP: [[], -1], tribFed: [['2.3.3'], -1], tribEst: [[], -1],
      capSoc: [['2.4.1'], -1], resLucros: [[], -1], ajusteAval: [[], -1], lucrosAcum: [['2.4.3'], -1], resExerc: [[], -1]
    },
    // grandes grupos do balancete (o que não cair nas linhas acima vira "Outros" do grupo)
    BAL_GRUPOS: { ac: ['1.1'], anc: ['1.2', '1.3'], pc: ['2.1'], pnc: ['2.2', '2.3'], pl: ['2.4'] },
    BAL_DET: {
      caixa: [['Caixa', 'd_cx_caixa', [['1.1.1.01', 1]]], ['Bancos', 'd_cx_banc', [['1.1.1.02', 1]]], ['Aplicações financeiras', 'd_cx_apl', [['1.1.1.03', 1]]]],
      cred: [['Clientes (contas a receber)', 'd_cr_cli', [['1.1.2.01', 1], ['1.1.2.01.99999', -1]]],
        ['Receitas a faturar (CPC 47)', 'd_cr_fat', [['1.1.2.01.99999', 1]]],
        ['(−) Perdas estimadas com clientes (PCLD)', 'd_cr_pcld', [['1.1.2.03', 1]]],
        ['Adiantamentos (viagem e pessoal)', 'd_cr_adt', [['1.1.2.04', 1], ['1.1.2.05', 1]]],
        ['Adiantamento a fornecedores', 'd_cr_adf', [['1.1.2.08', 1]]],
        ['Despesas pagas antecipadamente', 'd_cr_ant', [['1.1.2.09', 1]]]],
      imo: [['Bens em operação', 'd_im_bens', [['1.3.3.16', 1]]], ['(−) Depreciação acumulada', 'd_im_dep', [['1.3.3.17', 1]]]],
      intang: [['Softwares próprios', 'd_in_prop', [['1.3.6.01', 1]]], ['Softwares de terceiros', 'd_in_terc', [['1.3.6.02', 1]]], ['(−) Amortização acumulada', 'd_in_amort', [['1.3.6.99', 1]]]],
      obrT: [['Obrigações com pessoal', 'd_ot_pes', [['2.1.1.02', -1]]], ['Obrigações previdenciárias', 'd_ot_prev', [['2.1.1.03', -1]]], ['Provisão de férias, 13º e encargos', 'd_ot_prov', [['2.1.1.06', -1]]]],
      obrTrib: [['Obrigações tributárias', 'd_otb_trib', [['2.1.1.04', -1]]], ['Parcelamentos (curto prazo)', 'd_otb_parc', [['2.1.1.05', -1]]]],
      outrosPC: [['Adiantamentos de clientes', 'd_opc_adc', [['2.1.1.07', -1]]], ['Despesas incorridas (provisões)', 'd_opc_desp', [['2.1.3.02', -1]]], ['Receitas diferidas (CPC 47)', 'd_opc_dif', [['2.1.3.03', -1]]]]
    },
    // rótulos dos painéis que na NHD falam de despesas comerciais, vendas e CMV
    ROT: {
      'Comerciais': 'Pessoal', 'Desp. Comerciais': 'Desp. com Pessoal', 'Despesas Comerciais': 'Despesas com Pessoal',
      '( − ) Despesas Comerciais': '( − ) Despesas com Pessoal', 'Despesas Vendas': 'Remunerações', '   Vendas': '   Remunerações',
      'Desp. Marketing': 'Encargos e Benefícios', '   Marketing comercial': '   Encargos e benefícios',
      'Folha de Pagamento': 'Dados e Telecom.', '   Folha de Pagamento': '   Dados e telecomunicações', 'Folha': 'Dados/Telecom',
      '( - ) CMV + Depr.': '( - ) Custos dos serviços', '(-) CMV': '(-) Custos', 'Outros': 'Utilidades e outros'
    },
    DESCS: {},
    // guarda o movimento (débito/crédito) de cada conta no mês importado: o LALUR usa nas adições/exclusões
    guardarMov: true,
    novoD: D0,
    /* LALUR (balanço de suspensão/redução, acumulado de janeiro até o mês), como a planilha
       "LALUR - IRPJ E CSLL DIFERIDO":
       - diferenças temporárias (CPC 32) pelas contas patrimoniais: adição = créditos do ano, exclusão = débitos do ano;
       - adições não temporárias pelas contas de resultado (débito − crédito do ano);
       - PAT: 15% do gasto, limitado a 4% do IRPJ a 15%; retenções deduzidas do IRPJ e da CSLL;
       - IRPJ/CSLL diferidos = prejuízo fiscal / base negativa que sobra × 25% / 9%, conferidos com o ativo diferido. */
    LALUR: {
      temporarias: [
        ['2.1.3.02.00002', 'Provisão de despesas incorridas'],
        ['1.1.2.01.99999', 'Receitas a faturar (CPC 47)'],
        ['2.1.3.03.00001', 'Receitas diferidas (CPC 47)'],
        ['2.1.3.03.0005', '(−) PIS/COFINS/INSS/ISS diferidos'],
        ['2.1.3.02.00003', 'Provisões (contingências)']
      ],
      naoTemporarias: [
        ['4.1.8.20', 'Outras despesas indedutíveis (multas, brindes, despesas indedutíveis)']
      ],
      pat: { contas: ['4.1.1.40.00010', '5.1.1.40.00010'], incentivo: 0.15, limite: 0.04 },
      retencoesIR: [['1.1.2.07.00056', 'IRPJ retido na fonte'], ['1.1.2.07.00009', 'IRRF s/ aplicações']],
      retencoesCS: [['1.1.2.07.00057', 'CSLL retida na fonte']],
      diferido: {
        ir: { conta: '1.2.9.01.00001', aliq: 0.25, resultado: '8.1.1.20.00010' },
        cs: { conta: '1.2.9.01.00002', aliq: 0.09, resultado: '8.1.1.20.00020' }
      },
      // provisão corrente no balancete (as linhas de IRPJ/CSLL da DRE também trazem o diferido)
      correnteIR: '8.1.1.10.00010', correnteCS: '8.1.1.10.00020'
    }
  };
})();
