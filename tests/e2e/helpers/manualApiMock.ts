import type { Page, Route } from "@playwright/test";

type JsonRecord = Record<string, any>;

function readJsonBody(route: Route): JsonRecord {
  const raw = route.request().postData();
  if (!raw) return {};
  try {
    return JSON.parse(raw) as JsonRecord;
  } catch {
    return {};
  }
}

function nowIsoDate(): string {
  return new Date().toISOString().slice(0, 10);
}

export async function installManualApiMock(page: Page): Promise<void> {
  const cliente = {
    codcli: "10",
    cliente: "VISA CREDITO",
    cgcent: "33040981000150",
    nomecidade: "MANAUS",
    telefone: "92999999999",
  };

  const pedidos = [
    {
      numped: "121000060",
      numnf: "10",
      codcli: "10",
      dtPedido: "2026-03-01",
      vlrPedido: 199.9,
      status: "FATURADO",
      canal: "LOJA",
    },
    {
      numped: "121000061",
      numnf: "11",
      codcli: "10",
      dtPedido: "2026-03-02",
      vlrPedido: 349.9,
      status: "EM_DIGITACAO",
      canal: "SITE",
    },
  ];

  const itensByPedido: Record<string, JsonRecord[]> = {
    "121000060": [
      {
        numped: "121000060",
        numnf: "10",
        codprod: "133919",
        descricao: "AR CONDICIONADO VG 12000MIL BTUS INVERTE",
        un: "UN",
        qtd: 1,
        vlrUnit: 199.9,
        vlrTotal: 199.9,
      },
      {
        numped: "121000060",
        numnf: "10",
        codprod: "880001",
        descricao: "CONTROLE REMOTO UNIVERSAL",
        un: "UN",
        qtd: 1,
        vlrUnit: 45.0,
        vlrTotal: 45.0,
      },
    ],
    "121000061": [
      {
        numped: "121000061",
        numnf: "11",
        codprod: "992001",
        descricao: "VENTILADOR INDUSTRIAL 50CM",
        un: "UN",
        qtd: 2,
        vlrUnit: 174.95,
        vlrTotal: 349.9,
      },
    ],
  };

  const sacAtendimentos: JsonRecord[] = [
    {
      id: "SAC-001",
      codcli: "10",
      clienteNome: "VISA CREDITO",
      cgcent: "33040981000150",
      telefone: "92999999999",
      canal: "EMAIL",
      tipoContato: "TROCA",
      descricao: "Cliente reportou falha após instalação.",
      plantaResp: "MAO",
      numPedido: "121000060",
      numNfVenda: "10",
      codprod: "133919",
      produtoRelacionado: "133919 - AR CONDICIONADO VG 12000MIL BTUS INVERTE",
      status: "EM_ANALISE",
      abertoAt: "2026-03-01",
      atualizadoAt: "2026-03-07",
      timeline: [
        {
          id: "TL-001",
          data: "2026-03-01 08:30",
          usuario: "Maria Costa",
          acao: "ABERTURA",
          descricao: "Atendimento aberto no SAC.",
        },
      ],
      anexos: [
        {
          id: "ANX-001",
          atendimentoId: "SAC-001",
          nomeArquivo: "evidencia.pdf",
          mimeType: "application/pdf",
          tamanho: 15444,
          caminho: "/uploads/sac/SAC-001/evidencia.pdf",
          criadoAt: "2026-03-01 08:35",
        },
      ],
    },
  ];

  const sacRequisicoes: JsonRecord[] = [
    {
      id: "REQ-001",
      atendimentoId: "SAC-001",
      codcli: "10",
      clienteNome: "VISA CREDITO",
      cgcent: "33040981000150",
      numPedido: "121000060",
      numNfVenda: "10",
      codprod: "133919",
      produtoRelacionado: "133919 - AR CONDICIONADO VG 12000MIL BTUS INVERTE",
      plantaCd: "MAO",
      motivo: "MANUTENCAO_CONSERTO",
      prioridade: "MEDIA",
      observacoes: "Requisição para reparo em assistência externa.",
      status: "PENDENTE",
      criadoAt: "2026-03-03",
      atualizadoAt: "2026-03-03",
      itens: [
        {
          codmat: "MAT-001",
          descricaoMaterial: "Compressor 12k",
          un: "UN",
          qtdSolicitada: 1,
          qtdAtendida: 0,
          situacao: "INDISPONIVEL",
          observacao: "",
          observacaoAtendente: "",
        },
      ],
    },
    {
      id: "REQ-002",
      atendimentoId: "SAC-001",
      codcli: "10",
      clienteNome: "VISA CREDITO",
      cgcent: "33040981000150",
      numPedido: "121000060",
      numNfVenda: "10",
      plantaCd: "BEL",
      motivo: "TROCA_COMPONENTE",
      prioridade: "ALTA",
      observacoes: "Atendida parcialmente.",
      status: "PARCIAL",
      criadoAt: "2026-03-04",
      atualizadoAt: "2026-03-05",
      atendidoAt: "2026-03-05",
      atendidoPor: "João Técnico",
      observacoesAtendimento: "Sem disponibilidade total no estoque.",
      itens: [
        {
          codmat: "MAT-002",
          descricaoMaterial: "Placa eletrÃ´nica",
          un: "UN",
          qtdSolicitada: 2,
          qtdAtendida: 1,
          situacao: "PARCIAL",
          observacao: "",
          observacaoAtendente: "Falta 1 unidade",
        },
      ],
    },
  ];

  const osList: JsonRecord[] = [
    {
      id: "OS-001",
      origemTipo: "SAC",
      origemId: "SAC-001",
      codcli: "10",
      clienteNome: "VISA CREDITO",
      numPedido: "121000060",
      nfVenda: "10",
      codprod: "133919",
      planta: "MAO",
      tipoOs: "ASSISTENCIA_EXTERNA",
      status: "AGUARDANDO_PECAS",
      prioridade: "MEDIA",
      tecnicoResponsavel: "João Técnico",
      descricaoProblema: "Falha na refrigeração após 48h de uso.",
      laudoInspecao: "Necessária troca de componente interno.",
      decisaoTecnica: "REPARAR",
      dataAbertura: "2026-03-02",
      dataPrevista: "2026-03-12",
      recebimentoConfirmado: true,
      relatorioReparo: "",
      validacaoAprovada: false,
      mensagemEncerramento: "",
    },
  ];

  const reqAssistencia: JsonRecord[] = [
    {
      id: "REQA-001",
      osId: "OS-001",
      cdResponsavel: "BEL",
      plantaDestino: "MAO",
      status: "EM_TRANSFERENCIA",
      prioridade: "MEDIA",
      observacao: "Envio para assistência.",
      criadoAt: "2026-03-05",
      atualizadoAt: "2026-03-06",
      itens: [
        {
          codMaterial: "MAT-001",
          descricao: "Compressor 12k",
          un: "UN",
          qtdSolicitada: 1,
          qtdAtendida: 1,
          qtdRecebida: 0,
          situacao: "ATENDIDO",
          observacao: "",
          observacaoAtendente: "",
        },
      ],
    },
    {
      id: "REQA-002",
      osId: "OS-001",
      cdResponsavel: "MAO",
      plantaDestino: "MAO",
      status: "RECEBIDA_ASSISTENCIA",
      prioridade: "BAIXA",
      observacao: "",
      criadoAt: "2026-03-04",
      atualizadoAt: "2026-03-05",
      itens: [
        {
          codMaterial: "MAT-002",
          descricao: "Placa eletrÃ´nica",
          un: "UN",
          qtdSolicitada: 1,
          qtdAtendida: 1,
          qtdRecebida: 1,
          situacao: "ATENDIDO",
          observacao: "",
          observacaoAtendente: "",
        },
      ],
    },
  ];

  const consumos: JsonRecord[] = [
    {
      id: "CON-001",
      osId: "OS-001",
      reqId: "REQA-002",
      codMaterial: "MAT-002",
      descricao: "Placa eletrÃ´nica",
      un: "UN",
      qtdConsumida: 1,
      tecnico: "João Técnico",
      dataConsumo: "2026-03-06",
      observacao: "Aplicado em bancada técnica.",
    },
  ];

  const transitionLogs: JsonRecord[] = [
    {
      id: "TRL-001",
      osId: "OS-001",
      oldStatus: "ABERTA",
      newStatus: "AGUARDANDO_RECEBIMENTO",
      usuario: "Maria Costa",
      perfil: "SAC",
      papel: "SAC",
      planta: "MAO",
      timestamp: "2026-03-02T10:20:00.000Z",
      motivo: "",
      detalhes: "{\"evento\":\"ENVIAR_PARA_RECEBIMENTO\"}",
    },
    {
      id: "TRL-002",
      osId: "OS-001",
      oldStatus: "AGUARDANDO_RECEBIMENTO",
      newStatus: "RECEBIDO",
      usuario: "João Técnico",
      perfil: "ASSISTENCIA",
      papel: "ASSISTENCIA",
      planta: "MAO",
      timestamp: "2026-03-03T11:20:00.000Z",
      motivo: "",
      detalhes: "{\"evento\":\"CONFIRMAR_RECEBIMENTO\"}",
    },
  ];

  const estoque: JsonRecord[] = [
    {
      codMaterial: "MAT-001",
      descricao: "Compressor 12k",
      un: "UN",
      categoria: "Climatização",
      estoqueMAO: 2,
      estoqueBEL: 4,
      estoqueAGR: 1,
    },
    {
      codMaterial: "MAT-002",
      descricao: "Placa eletrÃ´nica",
      un: "UN",
      categoria: "EletrÃ´nica",
      estoqueMAO: 8,
      estoqueBEL: 0,
      estoqueAGR: 3,
    },
  ];

  const garantias: JsonRecord[] = [
    {
      id: "GAR-001",
      codcli: "10",
      clienteNome: "VISA CREDITO",
      numPedido: "121000060",
      numNfVenda: "10",
      numNfTroca: "",
      codprod: "133919",
      defeito: "deformação",
      descricao: "Produto com variação estrutural.",
      plantaResp: "MAO",
      status: "EM_ANALISE",
      custoEstimado: 120,
      abertoAt: "2026-03-03",
      encerradoAt: "",
      obs: "Aguardando validação.",
    },
  ];

  const ncs: JsonRecord[] = [
    {
      id: "NC-001",
      codcli: "10",
      clienteNome: "VISA CREDITO",
      numPedido: "121000060",
      numNf: "10",
      codprod: "133919",
      motivoId: "NC-GERAL",
      tipoNc: "CLIENTE",
      gravidade: "MEDIA",
      descricao: "Registro de NC por reclamação SAC.",
      causaRaiz: "Falta de inspeção final.",
      planoAcao: "Reforçar checklist final.",
      responsavel: "Ana Souza",
      prazo: "2026-03-20",
      status: "EM_ANALISE",
      planta: "MAO",
      abertoAt: "2026-03-04",
      origem: "SAC",
      origemId: "SAC-001",
    },
  ];

  const capas: JsonRecord[] = [
    {
      id: "CAPA-001",
      origemTipo: "NC",
      origemId: "NC-001",
      descricaoProblema: "Não conformidade recorrente no fluxo de inspeção.",
      causaRaiz: "Checklist incompleto.",
      planoAcao: "Treinamento da equipe de inspeção.",
      criterioEficacia: "Redução de 80% em 60 dias.",
      responsavel: "Ana Souza",
      dataInicio: "2026-03-05",
      dataPrazo: "2026-04-05",
      dataConclusao: "",
      status: "EM_ANDAMENTO",
    },
  ];

  const auditorias: JsonRecord[] = [
    {
      id: "AUD-001",
      tplId: "TPL-001",
      tplNome: "Checklist Processo",
      tipoAuditoria: "PROCESSO",
      planta: "MAO",
      local: "Linha 1",
      auditor: "Pedro Almeida",
      escopo: "Conferir aderência ao procedimento padrão.",
      status: "PLANEJADA",
      startedAt: "2026-03-15",
      finishedAt: "",
    },
  ];

  const templates: JsonRecord[] = [
    { id: "TPL-001", nome: "Checklist Processo", tipoAuditoria: "PROCESSO" },
    { id: "TPL-002", nome: "Checklist Produto", tipoAuditoria: "PRODUTO" },
  ];

  const templateItems: Record<string, JsonRecord[]> = {
    "TPL-001": [
      { id: "TPL-001-ITM-001", descricao: "Conferir procedimento da etapa 1" },
      { id: "TPL-001-ITM-002", descricao: "Validar registro documental da produção" },
    ],
    "TPL-002": [
      { id: "TPL-002-ITM-001", descricao: "Inspecionar produto final em amostragem" },
      { id: "TPL-002-ITM-002", descricao: "Verificar laudos de conformidade" },
    ],
  };

  const usuarios: JsonRecord[] = [
    { id: "USR-001", nome: "Admin QA", email: "admin@sgq.local", perfil: "ADMIN", ativo: true },
    { id: "USR-002", nome: "Maria Costa", email: "sac@sgq.local", perfil: "SAC", ativo: true },
  ];

  const perfis = ["ADMIN", "SAC", "QUALIDADE", "AUDITOR", "ASSISTENCIA", "TECNICO", "ALMOX", "DIRETORIA", "VALIDACAO"];

  const auditLog: JsonRecord[] = [
    {
      id: "LOG-001",
      data: "2026-03-07 12:00",
      usuario: "Admin QA",
      acao: "LOGIN",
      entidade: "AUTH",
      entidadeId: "AUTH-1",
      detalhes: "Login de teste para manual.",
    },
  ];

  const parametros: JsonRecord[] = [
    { chave: "SLA_SAC_DIAS", valor: "7", descricao: "SLA SAC (dias)" },
    { chave: "MAX_UPLOAD_MB", valor: "25", descricao: "Tamanho máximo de upload (MB)" },
  ];

  await page.route("**/api/**", async (route) => {
    const req = route.request();
    const url = new URL(req.url());
    const path = url.pathname;
    const method = req.method();

    const json = (data: unknown, status = 200) =>
      route.fulfill({
        status,
        contentType: "application/json",
        body: JSON.stringify(data),
      });

    const findById = (collection: JsonRecord[], id: string) =>
      collection.find((item) => String(item.id) === id) || null;

    if (method === "GET" && path === "/api/dashboard/qualidade") {
      return json({
        garantiaRate: 94,
        totalGarantias: garantias.length,
        totalNCs: ncs.length,
        avgResolutionDays: 6,
        topDefeitos: [{ name: "deformação", value: 3 }],
        ncByGravidade: [{ name: "MEDIA", value: 1 }],
        garantiasByMonth: [{ month: "Mar", count: garantias.length }],
        ncByCategoria: [{ name: "CLIENTE", value: 1 }],
      });
    }

    if (method === "GET" && path === "/api/sac/dashboard") {
      return json({
        porStatus: [
          { name: "ABERTO", value: 1 },
          { name: "EM_ANALISE", value: 1 },
        ],
        porTipo: [
          { name: "TROCA", value: 1 },
          { name: "RECLAMACAO", value: 1 },
        ],
        porPlanta: [{ name: "MAO", value: 2 }],
        porDia: [{ date: "2026-03-07", value: 2 }],
      });
    }

    if (method === "GET" && path === "/api/sac/requisicoes/dashboard") {
      return json({
        pendentes: sacRequisicoes.filter((r) => r.status === "PENDENTE").length,
        atendidasMes: sacRequisicoes.filter((r) => ["ATENDIDA", "PARCIAL"].includes(String(r.status))).length,
        porPlanta: [{ name: "MAO", value: 1 }, { name: "BEL", value: 1 }],
        ultimasPendentes: sacRequisicoes.filter((r) => r.status === "PENDENTE"),
      });
    }

    if (method === "GET" && path === "/api/assistencia/dashboard") {
      const abertas = osList.filter((os) => !["CONCLUIDA", "ENCERRADA", "CANCELADA"].includes(String(os.status)));
      const concluidas = osList.filter((os) => ["CONCLUIDA", "ENCERRADA"].includes(String(os.status)));
      const canceladas = osList.filter((os) => os.status === "CANCELADA");
      return json({
        osAbertas: abertas.length,
        osConcluidas: concluidas.length,
        osCanceladas: canceladas.length,
        reqPendentes: reqAssistencia.filter((r) => ["PENDENTE", "EM_SEPARACAO", "EM_TRANSFERENCIA"].includes(String(r.status))).length,
        reqAtendidas: reqAssistencia.filter((r) => ["ATENDIDA", "RECEBIDA_ASSISTENCIA"].includes(String(r.status))).length,
        consumoTotal: consumos.reduce((sum, c) => sum + Number(c.qtdConsumida || 0), 0),
        osPorStatus: { AGUARDANDO_PECAS: 1 },
        osPorPlanta: { MAO: 1 },
      });
    }

    if (method === "GET" && path === "/api/erp/clientes-sac-busca") {
      const codcli = (url.searchParams.get("codcli") || "").trim();
      const cgcent = (url.searchParams.get("cgcent") || "").trim();
      const telent = (url.searchParams.get("telent") || "").trim();
      const found = codcli === cliente.codcli || cgcent === cliente.cgcent || telent === cliente.telefone;
      return json(
        found
          ? [
              {
                codcli: cliente.codcli,
                cliente: cliente.cliente,
                cgcent: cliente.cgcent,
                nomecidade: cliente.nomecidade,
                telefone: cliente.telefone,
              },
            ]
          : [],
      );
    }

    if (method === "GET" && path === "/api/erp/pedidos-por-cliente") {
      const codcli = (url.searchParams.get("codcli") || "").trim();
      return json(codcli === cliente.codcli ? pedidos : []);
    }

    if (method === "GET" && path === "/api/erp/pedido-itens-por-pedido") {
      const numped = (url.searchParams.get("numped") || "").trim();
      return json(itensByPedido[numped] || []);
    }

    if (method === "GET" && path === "/api/erp/nf-venda") {
      return json(
        pedidos.map((p) => ({
          numnf: p.numnf,
          serie: "1",
          chaveNfe: `CHAVE-${p.numnf}`,
          dtEmissao: p.dtPedido,
          codcli: p.codcli,
          numped: p.numped,
          vlrTotal: p.vlrPedido,
        })),
      );
    }

    if (method === "GET" && path === "/api/erp/materiais") {
      return json([
        { codmat: "MAT-001", descricao: "Compressor 12k", un: "UN", categoria: "Climatização", estoqueDisponivel: 7 },
        { codmat: "MAT-002", descricao: "Placa eletrÃ´nica", un: "UN", categoria: "EletrÃ´nica", estoqueDisponivel: 11 },
      ]);
    }

    if (method === "GET" && path === "/api/sac/atendimentos") {
      return json(sacAtendimentos);
    }

    if (method === "GET" && /^\/api\/sac\/atendimentos\/[^/]+$/.test(path)) {
      const id = decodeURIComponent(path.split("/").pop() || "");
      return json(findById(sacAtendimentos, id));
    }

    if (method === "POST" && path === "/api/sac/atendimentos") {
      const body = readJsonBody(route);
      const id = `SAC-${String(sacAtendimentos.length + 1).padStart(3, "0")}`;
      const created = {
        id,
        ...body,
        status: body.status || "ABERTO",
        abertoAt: body.abertoAt || nowIsoDate(),
        atualizadoAt: nowIsoDate(),
        timeline: body.timeline || [],
      };
      sacAtendimentos.unshift(created);
      return json(created, 201);
    }

    if (method === "PUT" && /^\/api\/sac\/atendimentos\/[^/]+$/.test(path)) {
      const id = decodeURIComponent(path.split("/").pop() || "");
      const body = readJsonBody(route);
      const index = sacAtendimentos.findIndex((item) => String(item.id) === id);
      if (index < 0) return json(null, 404);
      sacAtendimentos[index] = { ...sacAtendimentos[index], ...body, atualizadoAt: nowIsoDate() };
      return json(sacAtendimentos[index]);
    }

    if (method === "POST" && /^\/api\/sac\/atendimentos\/[^/]+\/anexos$/.test(path)) {
      const atendimentoId = path.split("/")[4];
      return json(
        {
          atendimentoId,
          uploaded: 1,
          anexos: [
            {
              id: `ANX-${Date.now()}`,
              atendimentoId,
              nomeArquivo: "anexo-evidencia.pdf",
              mimeType: "application/pdf",
              tamanho: 18422,
              caminho: `/uploads/sac/${atendimentoId}/anexo-evidencia.pdf`,
              criadoAt: new Date().toISOString().replace("T", " ").slice(0, 16),
            },
          ],
        },
        201,
      );
    }

    if (method === "GET" && path === "/api/sac/requisicoes") {
      return json(sacRequisicoes);
    }

    if (method === "GET" && /^\/api\/sac\/requisicoes\/[^/]+$/.test(path)) {
      const id = decodeURIComponent(path.split("/").pop() || "");
      return json(findById(sacRequisicoes, id));
    }

    if (method === "POST" && path === "/api/sac/requisicoes") {
      const body = readJsonBody(route);
      const id = `REQ-${String(sacRequisicoes.length + 1).padStart(3, "0")}`;
      const created = { id, ...body, criadoAt: nowIsoDate(), atualizadoAt: nowIsoDate() };
      sacRequisicoes.unshift(created);
      return json(created, 201);
    }

    if (method === "POST" && /^\/api\/sac\/requisicoes\/[^/]+\/atender$/.test(path)) {
      const id = path.split("/")[4];
      const body = readJsonBody(route);
      const index = sacRequisicoes.findIndex((item) => String(item.id) === id);
      if (index < 0) return json(null, 404);
      sacRequisicoes[index] = {
        ...sacRequisicoes[index],
        status: body.status || "ATENDIDA",
        itens: body.itens || sacRequisicoes[index].itens,
        observacoesAtendimento: body.observacoesAtendimento || "",
        atendidoPor: body.atendidoPor || "Usuário Manual",
        atendidoAt: nowIsoDate(),
        atualizadoAt: nowIsoDate(),
      };
      return json(sacRequisicoes[index]);
    }

    if (method === "GET" && path === "/api/assistencia/os") {
      return json(osList);
    }

    if (method === "GET" && /^\/api\/assistencia\/os\/[^/]+$/.test(path)) {
      const id = decodeURIComponent(path.split("/").pop() || "");
      return json(findById(osList, id));
    }

    if (method === "POST" && path === "/api/assistencia/os") {
      const body = readJsonBody(route);
      const id = `OS-${String(osList.length + 1).padStart(3, "0")}`;
      const created = { id, ...body };
      osList.unshift(created);
      return json(created, 201);
    }

    if (method === "PUT" && /^\/api\/assistencia\/os\/[^/]+\/status$/.test(path)) {
      const id = path.split("/")[4];
      const body = readJsonBody(route);
      const index = osList.findIndex((item) => String(item.id) === id);
      if (index < 0) return json({}, 404);
      osList[index] = { ...osList[index], status: body.status || osList[index].status };
      return json(osList[index]);
    }

    if (method === "GET" && path === "/api/assistencia/requisicoes") {
      return json(reqAssistencia);
    }

    if (method === "GET" && /^\/api\/assistencia\/requisicoes\/[^/]+$/.test(path)) {
      const id = decodeURIComponent(path.split("/").pop() || "");
      return json(findById(reqAssistencia, id));
    }

    if (method === "POST" && path === "/api/assistencia/requisicoes") {
      const body = readJsonBody(route);
      const id = `REQA-${String(reqAssistencia.length + 1).padStart(3, "0")}`;
      const created = { id, ...body, criadoAt: nowIsoDate(), atualizadoAt: nowIsoDate() };
      reqAssistencia.unshift(created);
      return json(created, 201);
    }

    if (method === "PUT" && /^\/api\/assistencia\/requisicoes\/[^/]+\/status$/.test(path)) {
      const id = path.split("/")[4];
      const body = readJsonBody(route);
      const index = reqAssistencia.findIndex((item) => String(item.id) === id);
      if (index < 0) return json({}, 404);
      reqAssistencia[index] = { ...reqAssistencia[index], status: body.status || reqAssistencia[index].status, atualizadoAt: nowIsoDate() };
      return json(reqAssistencia[index]);
    }

    if (method === "POST" && /^\/api\/assistencia\/requisicoes\/[^/]+\/receber$/.test(path)) {
      const id = path.split("/")[4];
      const body = readJsonBody(route);
      const index = reqAssistencia.findIndex((item) => String(item.id) === id);
      if (index < 0) return json({}, 404);
      const itensRecebidos = Array.isArray(body.itensRecebidos) ? body.itensRecebidos : [];
      reqAssistencia[index] = {
        ...reqAssistencia[index],
        status: "RECEBIDA_ASSISTENCIA",
        observacao: body.observacao || reqAssistencia[index].observacao,
        itens: reqAssistencia[index].itens.map((item: any) => {
          const recebido = itensRecebidos.find((x: any) => x.codMaterial === item.codMaterial);
          return {
            ...item,
            qtdRecebida: recebido ? Number(recebido.qtdRecebida || 0) : item.qtdRecebida,
          };
        }),
        atualizadoAt: nowIsoDate(),
      };
      return json(reqAssistencia[index]);
    }

    if (method === "GET" && path === "/api/assistencia/consumos") {
      return json(consumos);
    }

    if (method === "GET" && /^\/api\/assistencia\/consumos\/[^/]+$/.test(path)) {
      const osId = decodeURIComponent(path.split("/").pop() || "");
      return json(consumos.filter((item) => String(item.osId) === osId));
    }

    if (method === "POST" && path === "/api/assistencia/consumos") {
      const body = readJsonBody(route);
      const id = `CON-${String(consumos.length + 1).padStart(3, "0")}`;
      const created = { id, ...body };
      consumos.unshift(created);
      return json(created, 201);
    }

    if (method === "GET" && path === "/api/assistencia/estoque") {
      return json(estoque);
    }

    if (method === "GET" && path === "/api/os-transition-log") {
      const osId = (url.searchParams.get("osId") || "").trim();
      return json(osId ? transitionLogs.filter((item) => item.osId === osId) : transitionLogs);
    }

    if (method === "POST" && path === "/api/os-transition-log") {
      const body = readJsonBody(route);
      const created = {
        id: `TRL-${String(transitionLogs.length + 1).padStart(3, "0")}`,
        timestamp: new Date().toISOString(),
        ...body,
      };
      transitionLogs.unshift(created);
      return json(created, 201);
    }

    if (method === "GET" && path === "/api/garantias") return json(garantias);
    if (method === "GET" && path === "/api/nc") return json(ncs);
    if (method === "GET" && path === "/api/capa") return json(capas);
    if (method === "GET" && path === "/api/auditorias") return json(auditorias);

    if (method === "POST" && path === "/api/garantias") {
      const body = readJsonBody(route);
      const created = { id: `GAR-${String(garantias.length + 1).padStart(3, "0")}`, ...body };
      garantias.unshift(created);
      return json(created, 201);
    }
    if (method === "POST" && path === "/api/nc") {
      const body = readJsonBody(route);
      const created = { id: `NC-${String(ncs.length + 1).padStart(3, "0")}`, ...body };
      ncs.unshift(created);
      return json(created, 201);
    }
    if (method === "POST" && path === "/api/capa") {
      const body = readJsonBody(route);
      const created = { id: `CAPA-${String(capas.length + 1).padStart(3, "0")}`, ...body };
      capas.unshift(created);
      return json(created, 201);
    }
    if (method === "POST" && path === "/api/auditorias") {
      const body = readJsonBody(route);
      const created = { id: `AUD-${String(auditorias.length + 1).padStart(3, "0")}`, ...body };
      auditorias.unshift(created);
      return json(created, 201);
    }

    if (method === "GET" && path === "/api/auditorias/templates") return json(templates);
    if (method === "GET" && /^\/api\/auditorias\/templates\/[^/]+\/items$/.test(path)) {
      const tplId = path.split("/")[4];
      return json(templateItems[tplId] || []);
    }

    if (method === "GET" && path === "/api/admin/usuarios") return json(usuarios);
    if (method === "POST" && path === "/api/admin/usuarios") {
      const body = readJsonBody(route);
      const created = { id: `USR-${String(usuarios.length + 1).padStart(3, "0")}`, ...body };
      usuarios.unshift(created);
      return json(created, 201);
    }
    if (method === "PUT" && /^\/api\/admin\/usuarios\/[^/]+$/.test(path)) {
      const id = path.split("/").pop() || "";
      const body = readJsonBody(route);
      const index = usuarios.findIndex((item) => String(item.id) === id);
      if (index < 0) return json(null, 404);
      usuarios[index] = { ...usuarios[index], ...body };
      return json(usuarios[index]);
    }
    if (method === "GET" && path === "/api/admin/perfis") return json(perfis);
    if (method === "GET" && path === "/api/admin/audit-log") return json(auditLog);
    if (method === "POST" && path === "/api/admin/audit-log") {
      const body = readJsonBody(route);
      const created = { id: `LOG-${String(auditLog.length + 1).padStart(3, "0")}`, ...body };
      auditLog.unshift(created);
      return json(created, 201);
    }
    if (method === "GET" && path === "/api/admin/parametros") return json(parametros);
    if (method === "PUT" && /^\/api\/admin\/parametros\/[^/]+$/.test(path)) {
      const chave = decodeURIComponent(path.split("/").pop() || "");
      const body = readJsonBody(route);
      const index = parametros.findIndex((item) => String(item.chave) === chave);
      if (index < 0) return json(null, 404);
      parametros[index] = { ...parametros[index], ...body };
      return json(parametros[index]);
    }

    if (method === "GET") return json([]);
    if (method === "POST") return json({}, 201);
    if (method === "PUT") return json({});
    if (method === "DELETE") return json({}, 204);
    return json({});
  });
}




