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
  const auditLog: JsonRecord[] = [
    { id: "LOG-001", data: "2026-03-07 12:00", usuario: "Admin QA", acao: "LOGIN", entidade: "AUTH", entidadeId: "AUTH-1", detalhes: "Login de teste" },
  ];
  const parametros: JsonRecord[] = [
    { chave: "SLA_SAC_DIAS", valor: "7", descricao: "SLA SAC (dias)" },
    { chave: "MAX_UPLOAD_MB", valor: "25", descricao: "Tamanho máximo de upload (MB)" },
  ];

  const perfis = ["ADMIN", "SAC", "QUALIDADE", "AUDITOR", "ASSISTENCIA", "TECNICO", "ALMOX", "DIRETORIA", "VALIDACAO"];
  const templates = [{ id: "TPL-001", nome: "Checklist Processo", tipoAuditoria: "PROCESSO" }];

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

