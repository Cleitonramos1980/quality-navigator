import { performance } from "node:perf_hooks";

const BASE_URL = process.env.RUNTIME_BASE_URL || "http://127.0.0.1:3333";
const DURATION_SECONDS = Number(process.env.LOAD_DURATION_SECONDS || 20);
const CONCURRENCY = Number(process.env.LOAD_CONCURRENCY || 15);
const REQUEST_TIMEOUT_MS = Number(process.env.LOAD_TIMEOUT_MS || 15000);

const scenarios = [
  {
    name: "health",
    method: "GET",
    path: "/api/health",
  },
  {
    name: "erp-clientes-codcli",
    method: "GET",
    path: "/api/erp/clientes-sac-busca?codcli=362811",
  },
  {
    name: "erp-pedidos-codcli",
    method: "GET",
    path: "/api/erp/pedidos-por-cliente?codcli=362811",
  },
  {
    name: "erp-itens-numped",
    method: "GET",
    path: "/api/erp/pedido-itens-por-pedido?numped=121000060",
  },
  {
    name: "sac-create",
    method: "POST",
    path: "/api/sac/atendimentos",
    body: () => ({
      codcli: "362811",
      clienteNome: "CENTRO AUDITIVO DO PARA LTDA",
      cgcent: "21876788000174",
      telefone: "91932416476",
      canal: "EMAIL",
      tipoContato: "TROCA",
      descricao: `Load test SAC ${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      plantaResp: "BEL",
      numPedido: 121000060,
      numNfVenda: 10,
      codprod: 133919,
      produtoRelacionado: "133919 - AR CONDICIONADO",
      status: "ABERTO",
    }),
  },
  {
    name: "assistencia-create-os",
    method: "POST",
    path: "/api/assistencia/os",
    body: () => ({
      origemTipo: "SAC",
      origemId: `LOAD-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      codcli: "362811",
      clienteNome: "CENTRO AUDITIVO DO PARA LTDA",
      numPedido: 121000060,
      nfVenda: 10,
      codprod: 133919,
      planta: "BEL",
      tipoOs: "ASSISTENCIA_EXTERNA",
      status: "ABERTA",
      prioridade: "MEDIA",
      tecnicoResponsavel: "load-test",
      descricaoProblema: "Teste de carga",
      dataAbertura: "2026-03-07",
      dataPrevista: "2026-03-14",
    }),
  },
];

function percentile(sorted, p) {
  if (!sorted.length) return null;
  const index = Math.min(sorted.length - 1, Math.max(0, Math.ceil((p / 100) * sorted.length) - 1));
  return Number(sorted[index].toFixed(2));
}

async function oneRequest(scenario) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  const started = performance.now();
  try {
    const payload = typeof scenario.body === "function" ? scenario.body() : scenario.body;
    const response = await fetch(`${BASE_URL}${scenario.path}`, {
      method: scenario.method,
      headers: payload ? { "Content-Type": "application/json" } : undefined,
      body: payload ? JSON.stringify(payload) : undefined,
      signal: controller.signal,
    });
    const elapsed = performance.now() - started;
    return { ok: response.ok, status: response.status, latencyMs: elapsed };
  } catch (error) {
    const elapsed = performance.now() - started;
    return { ok: false, status: 0, latencyMs: elapsed, error: String(error) };
  } finally {
    clearTimeout(timeout);
  }
}

async function runScenario(scenario) {
  const endAt = Date.now() + DURATION_SECONDS * 1000;
  const latencies = [];
  let success = 0;
  let failed = 0;
  const statusCount = new Map();

  async function worker() {
    while (Date.now() < endAt) {
      const result = await oneRequest(scenario);
      latencies.push(result.latencyMs);
      const statusKey = String(result.status);
      statusCount.set(statusKey, (statusCount.get(statusKey) || 0) + 1);
      if (result.ok) success += 1;
      else failed += 1;
    }
  }

  await Promise.all(Array.from({ length: CONCURRENCY }, () => worker()));

  const total = success + failed;
  const sorted = latencies.sort((a, b) => a - b);
  return {
    scenario: scenario.name,
    method: scenario.method,
    path: scenario.path,
    durationSeconds: DURATION_SECONDS,
    concurrency: CONCURRENCY,
    totalRequests: total,
    success,
    failed,
    errorRatePct: total ? Number(((failed / total) * 100).toFixed(2)) : 0,
    rps: Number((total / DURATION_SECONDS).toFixed(2)),
    latencyMs: {
      min: sorted.length ? Number(sorted[0].toFixed(2)) : null,
      p50: percentile(sorted, 50),
      p95: percentile(sorted, 95),
      p99: percentile(sorted, 99),
      max: sorted.length ? Number(sorted[sorted.length - 1].toFixed(2)) : null,
      avg: sorted.length ? Number((sorted.reduce((acc, v) => acc + v, 0) / sorted.length).toFixed(2)) : null,
    },
    statusCount: Object.fromEntries(statusCount.entries()),
  };
}

async function main() {
  const startedAt = new Date().toISOString();
  const results = [];
  for (const scenario of scenarios) {
    // eslint-disable-next-line no-console
    console.log(`[load] running ${scenario.name}...`);
    results.push(await runScenario(scenario));
  }
  const endedAt = new Date().toISOString();
  const output = { startedAt, endedAt, baseUrl: BASE_URL, results };
  // eslint-disable-next-line no-console
  console.log(JSON.stringify(output, null, 2));
}

main().catch((error) => {
  // eslint-disable-next-line no-console
  console.error(error);
  process.exit(1);
});
