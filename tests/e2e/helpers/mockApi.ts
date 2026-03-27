import type { Page, Route } from "@playwright/test";

type JsonRecord = Record<string, unknown>;

function readJsonBody(route: Route): JsonRecord {
  const raw = route.request().postData();
  if (!raw) return {};
  try {
    return JSON.parse(raw) as JsonRecord;
  } catch {
    return {};
  }
}

export async function installApiMock(page: Page): Promise<void> {
  const cliente = {
    codcli: 10,
    cliente: "VISA CREDITO",
    cgcent: "33040981000150",
    nomecidade: "MANAUS",
    telefone: "92999999999",
  };
  const pedido = {
    numped: "121000060",
    numnf: "10",
    codcli: "10",
    dtPedido: "2026-03-01",
    vlrPedido: 199.9,
    status: "FATURADO",
    canal: "LOJA",
  };
  const itemPedido = {
    codprod: "133919",
    descricao: "AR CONDICIONADO VG 12000MIL BTUS INVERTE",
    un: "UN",
    qtd: 1,
    vlrUnit: 199.9,
    vlrTotal: 199.9,
  };

  const sacAtendimentos: JsonRecord[] = [];
  const osList: JsonRecord[] = [];
  const garantias: JsonRecord[] = [];
  const ncs: JsonRecord[] = [];
  const capas: JsonRecord[] = [];
  const auditorias: JsonRecord[] = [];
  const usuarios: JsonRecord[] = [
    { id: "USR-001", nome: "Admin QA", email: "admin@sgq.local", perfil: "ADMIN", ativo: true },
  ];
  let authUser: JsonRecord | null = {
    id: "USR-001",
    nome: "Admin QA",
    email: "admin@sgq.local",
    perfil: "ADMIN",
    ativo: true,
  };
  const auditLog: JsonRecord[] = [
    { id: "LOG-001", data: "2026-03-07 12:00", usuario: "Admin QA", acao: "LOGIN", entidade: "AUTH", entidadeId: "AUTH-1", detalhes: "Login de teste" },
  ];
  const parametros: JsonRecord[] = [
    { chave: "SLA_SAC_DIAS", valor: "7", descricao: "SLA SAC (dias)" },
    { chave: "MAX_UPLOAD_MB", valor: "25", descricao: "Tamanho máximo de upload (MB)" },
  ];

  const perfis = ["ADMIN", "SAC", "QUALIDADE", "AUDITOR", "ASSISTENCIA", "TECNICO", "ALMOX", "DIRETORIA", "VALIDACAO"];
  const templates = [{ id: "TPL-001", nome: "Checklist Processo", tipoAuditoria: "PROCESSO" }];
  const solicitacoesAcesso: JsonRecord[] = [
    {
      id: "USR-001",
      codigo: "SOL-001",
      token: "token-teste",
      linkPreenchimento: "http://127.0.0.1:4173/visitante/cadastro/token-teste",
      status: "LINK_GERADO",
      tipoAcesso: "VISITANTE",
      responsavelInterno: "Andre Lima",
      setorDestino: "Logistica",
      unidadePlanta: "MAO",
      validadeHoras: 24,
      observacaoInterna: "Acesso para vistoria",
      solicitadoPor: "Admin QA",
      horarioPrevisto: "2026-03-27T14:00:00.000Z",
      expiraEm: "2026-03-28T14:00:00.000Z",
      criadoEm: "2026-03-27T10:00:00.000Z",
      atualizadoEm: "2026-03-27T10:30:00.000Z",
      preenchidoEm: "2026-03-27T10:20:00.000Z",
      acessoId: "ACS-001",
      visitanteId: "VIS-001",
      preenchimento: {
        nome: "Visitante QA",
        documento: "12345678900",
        empresa: "Fornecedor QA",
        telefone: "92999999999",
        email: "visitante@qa.local",
        possuiVeiculo: false,
      },
      historico: [
        {
          id: "SOL-HIS-001",
          tipo: "LINK_GERADO",
          descricao: "Solicitacao criada e link gerado.",
          dataHora: "2026-03-27T10:00:00.000Z",
          usuario: "Admin QA",
        },
      ],
    },
  ];
  const nfTransitoList: JsonRecord[] = [
    {
      id: "USR-001",
      numero: "NF-123456",
      chaveNfe: "35260312345678000123550010000012341000012345",
      cliente: "Cliente QA",
      destino: "Manaus",
      uf: "AM",
      valor: 25000,
      peso: 780,
      volumes: 12,
      dataEmissao: "2026-03-25",
      dataSaidaPrevista: "2026-03-26",
      dataSaidaReal: "2026-03-26T07:00:00.000Z",
      dataEntregaPrevista: "2026-03-29",
      dataEntregaReal: undefined,
      diasEmTransito: 2,
      status: "EM_TRANSITO",
      criticidade: "AMARELO",
      scoreRisco: 48,
      motivoRisco: "Rota com checkpoint pendente.",
      acaoRecomendada: "Monitorar checkpoints nas proximas 6 horas.",
      pedido: "PED-9001",
      carga: "CAR-778",
      mdfeNumero: "MDFE-001",
      mdfeStatus: "AUTORIZADO",
      cteNumero: "CTE-001",
      cteStatus: "AUTORIZADO",
      placa: "QAT-1234",
      motoristaNome: "Motorista QA",
      transportadoraNome: "Trans QA",
      checkpoints: [
        {
          id: "CK-001",
          tipo: "SAIDA",
          descricao: "Saida da unidade de origem.",
          dataHora: "2026-03-26T07:00:00.000Z",
          localizacao: "MAO",
          responsavel: "Portaria MAO",
        },
      ],
      alertas: ["Checkpoint de chegada ainda nao recebido."],
      planta: "MAO",
    },
  ];
  const custodias: JsonRecord[] = [
    {
      id: "USR-001",
      nfId: "NF-001",
      nfNumero: "NF-123456",
      status: "EM_TRANSITO",
      cliente: "Cliente QA",
      destino: "Manaus",
      valor: 25000,
      veiculoPlaca: "QAT-1234",
      motoristaNome: "Motorista QA",
      transportadoraNome: "Trans QA",
      docaSaida: "Doca 2",
      operacaoPatio: "Carregamento padrao",
      dataEmissao: "2026-03-25",
      dataSaidaPortaria: "2026-03-26T07:00:00.000Z",
      dataChegadaDestino: undefined,
      dataEntrega: undefined,
      recebedorNome: undefined,
      statusAceite: "PENDENTE",
      divergencia: "",
      eventos: [
        {
          id: "CST-EVT-001",
          etapa: "Saida Portaria",
          descricao: "Carga liberada para transporte.",
          dataHora: "2026-03-26T07:00:00.000Z",
          localizacao: "MAO",
          responsavel: "Portaria MAO",
          tipo: "SAIDA",
        },
      ],
      evidencias: [
        {
          id: "CST-EVD-001",
          tipo: "COMPROVANTE_SAIDA",
          descricao: "Checklist de liberacao assinado.",
          dataHora: "2026-03-26T06:55:00.000Z",
          responsavel: "Portaria MAO",
          nomeArquivo: "checklist-liberacao.pdf",
          mimeType: "application/pdf",
          tamanhoArquivo: 102400,
        },
      ],
      diasEmTransito: 2,
      scoreRisco: 35,
      planta: "MAO",
    },
  ];
  const agendamentosDock: JsonRecord[] = [
    {
      id: "AGD-001",
      codigo: "AGD-001",
      transportadoraNome: "Trans QA",
      tipoOperacao: "Carregamento",
      status: "EM_ANDAMENTO",
      docaPrevistaNome: "Doca 2",
      janelaInicio: "2026-03-27T09:00:00.000Z",
      placa: "QAT-1234",
      sla: 92,
    },
  ];
  const torreExcecoes: JsonRecord[] = [
    {
      id: "USR-001",
      titulo: "Fila acima do limite",
      descricao: "Fila de carregamento excedeu tempo esperado.",
      categoria: "PATIO",
      criticidade: "ALTA",
      status: "EM_ANALISE",
      origem: "Agendamento",
      origemId: "AGD-001",
      origemRota: "/patio/agendamento/AGD-001",
      responsavel: "Operador QA",
      criadoEm: "2026-03-27T08:00:00.000Z",
      atualizadoEm: "2026-03-27T09:15:00.000Z",
      prazo: "2026-03-27T18:00:00.000Z",
      venceEm: "2026-03-27T18:00:00.000Z",
      reincidencias: 1,
      acaoSugerida: "Redistribuir docas para carga urgente.",
      tratativa: "Equipe acionada para priorizacao.",
      historico: [
        {
          id: "TOR-HIS-001",
          tipo: "CRIADA",
          descricao: "Excecao criada automaticamente.",
          dataHora: "2026-03-27T08:00:00.000Z",
          usuario: "Sistema",
        },
      ],
      tags: ["patiodocas", "fila"],
      planta: "MAO",
    },
  ];
  const inspecoesMola: JsonRecord[] = [
    {
      id: "USR-001",
      maquina: "Mola-01",
      statusMaquina: "Operando",
      alturaTipo: "130mm",
      linhaPocket: "L1-P2",
      operador: "Operador QA",
      dataHora: "2026-03-27T09:00:00.000Z",
      observacaoGeral: "Inspecao dentro do esperado.",
      resultado: "APROVADO",
      motivoParada: "",
      medicoes: [
        {
          id: "MED-001",
          padraoId: "PAD-001",
          item: "A1",
          descricao: "Altura nominal",
          padrao: "130",
          minimo: 128,
          maximo: 132,
          unidade: "mm",
          valorMedido: 130.2,
          conforme: true,
        },
      ],
    },
  ];
  const sacRequisicoesList: JsonRecord[] = [
    {
      id: "USR-001",
      atendimentoId: "SAC-001",
      codcli: "10",
      clienteNome: "Cliente QA",
      cgcent: "33040981000150",
      numPedido: "121000060",
      numNfVenda: "10",
      codprod: "133919",
      produtoRelacionado: "Produto QA",
      plantaCd: "MAO",
      motivo: "MANUTENCAO_CONSERTO",
      prioridade: "MEDIA",
      observacoes: "Requisicao para reposicao.",
      itens: [
        {
          codmat: "MAT-001",
          descricaoMaterial: "Mola ensacada",
          un: "UN",
          qtdSolicitada: 2,
          qtdAtendida: 1,
          situacao: "PARCIAL",
          observacao: "Prioridade media",
        },
      ],
      status: "PENDENTE",
      criadoAt: "2026-03-27",
      atualizadoAt: "2026-03-27",
    },
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

    if (method === "POST" && path === "/api/auth/login") {
      const body = readJsonBody(route);
      const email = String(body.email || "").toLowerCase();
      const found = usuarios.find((u) => String(u.email || "").toLowerCase() === email) ?? usuarios[0];
      authUser = found;
      return json(
        {
          token: `mock-token-${String(found.id || "USR-001")}`,
          user: found,
          expiresIn: 8 * 60 * 60,
        },
        200,
      );
    }

    if (method === "GET" && path === "/api/auth/me") {
      if (!authUser) {
        return json({ error: { message: "Nao autenticado." } }, 401);
      }
      return json(authUser, 200);
    }

    if (method === "GET" && path === "/api/dashboard/qualidade") {
      return json({
        garantiaRate: 94,
        totalGarantias: garantias.length,
        totalNCs: ncs.length,
        avgResolutionDays: 7,
        topDefeitos: [{ name: "deformação", value: 3 }],
        ncByGravidade: [{ name: "MEDIA", value: 1 }],
        garantiasByMonth: [{ month: "Mar", count: 2 }],
        ncByCategoria: [{ name: "CLIENTE", value: 1 }],
      });
    }

    if (method === "GET" && path === "/api/sac/dashboard") {
      return json({
        porStatus: [{ name: "ABERTO", value: sacAtendimentos.length }],
        porTipo: [{ name: "TROCA", value: sacAtendimentos.length }],
        porPlanta: [{ name: "MAO", value: sacAtendimentos.length }],
        porDia: [{ date: "2026-03-07", value: sacAtendimentos.length }],
      });
    }

    if (method === "GET" && path === "/api/sac/requisicoes/dashboard") {
      return json({
        pendentes: 0,
        atendidasMes: 0,
        porPlanta: [{ name: "MAO", value: 0 }],
        ultimasPendentes: [],
      });
    }

    if (method === "GET" && path === "/api/sac/requisicoes") {
      return json(sacRequisicoesList);
    }

    if (method === "GET" && /^\/api\/sac\/requisicoes\/[^/]+$/.test(path)) {
      const id = decodeURIComponent(path.split("/").pop() || "");
      const found = sacRequisicoesList.find((item) => item.id === id) || null;
      return json(found);
    }

    if (method === "GET" && path === "/api/assistencia/dashboard") {
      return json({
        osAbertas: osList.filter((os) => !["CONCLUIDA", "ENCERRADA", "CANCELADA"].includes(String(os.status))).length,
        osConcluidas: osList.filter((os) => ["CONCLUIDA", "ENCERRADA"].includes(String(os.status))).length,
        osCanceladas: osList.filter((os) => os.status === "CANCELADA").length,
        reqPendentes: 0,
        reqAtendidas: 0,
        consumoTotal: 0,
        osPorStatus: {},
        osPorPlanta: {},
      });
    }

    if (method === "GET" && path === "/api/erp/clientes-sac-busca") {
      const codcli = (url.searchParams.get("codcli") || "").trim();
      const cgcent = (url.searchParams.get("cgcent") || "").trim();
      const telent = (url.searchParams.get("telent") || "").trim();
      const found = codcli === "10" || cgcent === cliente.cgcent || telent === cliente.telefone;
      return json(found ? [cliente] : []);
    }

    if (method === "GET" && path === "/api/erp/pedidos-por-cliente") {
      const codcli = (url.searchParams.get("codcli") || "").trim();
      return json(codcli === "10" ? [pedido] : []);
    }

    if (method === "GET" && path === "/api/erp/pedido-itens-por-pedido") {
      const numped = (url.searchParams.get("numped") || "").trim();
      return json(numped === pedido.numped ? [itemPedido] : []);
    }

    if (method === "GET" && path === "/api/erp/materiais") {
      return json([
        { codmat: "MAT-001", descricao: "Mola ensacada", un: "UN", categoria: "Molas", estoqueDisponivel: 120 },
      ]);
    }

    if (method === "GET" && path === "/api/sac/atendimentos") {
      return json(sacAtendimentos);
    }

    if (method === "POST" && path === "/api/sac/atendimentos") {
      const body = readJsonBody(route);
      const id = `SAC-${String(sacAtendimentos.length + 1).padStart(3, "0")}`;
      const created = {
        id,
        ...body,
        status: body.status ?? "ABERTO",
        abertoAt: "2026-03-07",
        atualizadoAt: "2026-03-07",
        timeline: [],
      };
      sacAtendimentos.push(created);
      return json(created, 201);
    }

    if (method === "POST" && /^\/api\/sac\/atendimentos\/[^/]+\/anexos$/.test(path)) {
      const atendimentoId = path.split("/")[4];
      return json({ atendimentoId, uploaded: 1, anexos: [] }, 201);
    }

    if (method === "GET" && path === "/api/assistencia/os") {
      return json(osList);
    }

    if (method === "POST" && path === "/api/assistencia/os") {
      const body = readJsonBody(route);
      const id = `OS-${String(osList.length + 1).padStart(3, "0")}`;
      const created = { id, ...body };
      osList.push(created);
      return json(created, 201);
    }

    if (method === "GET" && /^\/api\/assistencia\/os\/[^/]+$/.test(path)) {
      const id = decodeURIComponent(path.split("/").pop() || "");
      const existing = osList.find((os) => os.id === id);
      return json(existing ?? null);
    }

    if (method === "GET" && path === "/api/assistencia/requisicoes") {
      return json([]);
    }

    if (method === "GET" && /^\/api\/assistencia\/consumos(\/[^/]+)?$/.test(path)) {
      return json([]);
    }

    if (method === "GET" && path === "/api/assistencia/estoque") {
      return json([]);
    }

    if (method === "GET" && path === "/api/os-transition-log") {
      return json([]);
    }

    if (method === "GET" && path === "/api/garantias") {
      return json(garantias);
    }

    if (method === "POST" && path === "/api/garantias") {
      const body = readJsonBody(route);
      const id = `GAR-${String(garantias.length + 1).padStart(3, "0")}`;
      const created = { id, ...body };
      garantias.push(created);
      return json(created, 201);
    }

    if (method === "GET" && path === "/api/nc") {
      return json(ncs);
    }

    if (method === "POST" && path === "/api/nc") {
      const body = readJsonBody(route);
      const id = `NC-${String(ncs.length + 1).padStart(3, "0")}`;
      const created = { id, ...body };
      ncs.push(created);
      return json(created, 201);
    }

    if (method === "GET" && path === "/api/capa") {
      return json(capas);
    }

    if (method === "POST" && path === "/api/capa") {
      const body = readJsonBody(route);
      const id = `CAPA-${String(capas.length + 1).padStart(3, "0")}`;
      const created = { id, ...body };
      capas.push(created);
      return json(created, 201);
    }

    if (method === "GET" && path === "/api/auditorias") {
      return json(auditorias);
    }

    if (method === "POST" && path === "/api/auditorias") {
      const body = readJsonBody(route);
      const id = `AUD-${String(auditorias.length + 1).padStart(3, "0")}`;
      const created = { id, ...body };
      auditorias.push(created);
      return json(created, 201);
    }

    if (method === "GET" && path === "/api/auditorias/templates") {
      return json(templates);
    }

    if (method === "GET" && /^\/api\/auditorias\/templates\/[^/]+\/items$/.test(path)) {
      return json([{ id: "ITM-001", descricao: "Checklist item 1" }]);
    }

    if (method === "GET" && path === "/api/operacional/nf-transito") {
      return json(nfTransitoList);
    }

    if (method === "GET" && /^\/api\/operacional\/nf-transito\/[^/]+$/.test(path)) {
      const id = decodeURIComponent(path.split("/").pop() || "");
      const found = nfTransitoList.find((item) => item.id === id) || nfTransitoList[0];
      return json(found);
    }

    if (method === "GET" && path === "/api/operacional/solicitacoes-acesso") {
      return json(solicitacoesAcesso);
    }

    if (method === "GET" && /^\/api\/operacional\/solicitacoes-acesso\/[^/]+$/.test(path)) {
      const id = decodeURIComponent(path.split("/").pop() || "");
      const found = solicitacoesAcesso.find((item) => item.id === id) || null;
      return json(found);
    }

    if (method === "GET" && path === "/api/operacional/custodia") {
      return json(custodias);
    }

    if (method === "GET" && /^\/api\/operacional\/custodia\/[^/]+$/.test(path)) {
      const id = decodeURIComponent(path.split("/").pop() || "");
      const found = custodias.find((item) => item.id === id) || custodias[0];
      return json(found);
    }

    if (method === "GET" && path === "/api/operacional/agendamentos-dock") {
      return json(agendamentosDock);
    }

    if (method === "GET" && path === "/api/operacional/torre-controle/excecoes") {
      return json(torreExcecoes);
    }

    if (method === "GET" && /^\/api\/operacional\/torre-controle\/excecoes\/[^/]+$/.test(path)) {
      const id = decodeURIComponent(path.split("/").pop() || "");
      const found = torreExcecoes.find((item) => item.id === id) || torreExcecoes[0];
      return json(found);
    }

    if (method === "GET" && path === "/api/inspecoes/molas/padroes") {
      return json([
        {
          id: "PAD-001",
          alturaTipo: "130mm",
          item: "A1",
          descricao: "Altura nominal",
          padrao: "130",
          minimo: 128,
          maximo: 132,
          unidade: "mm",
          ativo: true,
        },
      ]);
    }

    if (method === "GET" && /^\/api\/inspecoes\/molas\/[^/]+$/.test(path)) {
      const id = decodeURIComponent(path.split("/").pop() || "");
      const found = inspecoesMola.find((item) => item.id === id) || inspecoesMola[0];
      return json(found);
    }

    if (method === "GET" && path === "/api/admin/usuarios") {
      return json(usuarios);
    }

    if (method === "POST" && path === "/api/admin/usuarios") {
      const body = readJsonBody(route);
      const id = `USR-${String(usuarios.length + 1).padStart(3, "0")}`;
      const created = { id, ...body };
      usuarios.push(created);
      return json(created, 201);
    }

    if (method === "PUT" && /^\/api\/admin\/usuarios\/[^/]+$/.test(path)) {
      const id = path.split("/").pop() || "";
      const body = readJsonBody(route);
      const index = usuarios.findIndex((u) => u.id === id);
      if (index < 0) return json(null);
      const updated = { ...usuarios[index], ...body };
      usuarios[index] = updated;
      return json(updated);
    }

    if (method === "GET" && path === "/api/admin/perfis") {
      return json(perfis);
    }

    if (method === "GET" && path === "/api/admin/audit-log") {
      return json(auditLog);
    }

    if (method === "POST" && path === "/api/admin/audit-log") {
      const body = readJsonBody(route);
      const id = `LOG-${String(auditLog.length + 1).padStart(3, "0")}`;
      const created = { id, ...body };
      auditLog.unshift(created);
      return json(created, 201);
    }

    if (method === "GET" && path === "/api/admin/parametros") {
      return json(parametros);
    }

    if (method === "PUT" && /^\/api\/admin\/parametros\/[^/]+$/.test(path)) {
      const chave = decodeURIComponent(path.split("/").pop() || "");
      const body = readJsonBody(route);
      const index = parametros.findIndex((p) => p.chave === chave);
      if (index < 0) return json(null);
      const updated = { ...parametros[index], ...body };
      parametros[index] = updated;
      return json(updated);
    }

    if (method === "GET") return json([]);
    if (method === "POST") return json({}, 201);
    if (method === "PUT") return json({});
    if (method === "DELETE") return json({}, 204);
    return json({});
  });
}
