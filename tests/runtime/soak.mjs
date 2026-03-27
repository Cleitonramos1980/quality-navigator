import { performance } from "node:perf_hooks";
import fs from "node:fs";

const BASE_URL = process.env.RUNTIME_BASE_URL || "http://127.0.0.1:3333";
const DURATION_MINUTES = Number(process.env.SOAK_DURATION_MINUTES || 30);
const CONCURRENCY = Number(process.env.SOAK_CONCURRENCY || 4);
const REQUEST_TIMEOUT_MS = Number(process.env.SOAK_TIMEOUT_MS || 15000);
const PAUSE_MS = Number(process.env.SOAK_PAUSE_MS || 150);
const PROGRESS_FILE = process.env.SOAK_PROGRESS_FILE || "tests/runtime/soak-progress.json";
const AUTH_TOKEN = (process.env.RUNTIME_AUTH_TOKEN || "").trim();
const AUTH_EMAIL = (process.env.RUNTIME_AUTH_EMAIL || "").trim();
const AUTH_PASSWORD = (process.env.RUNTIME_AUTH_PASSWORD || "").trim();

const scenarios = [
  {
    name: "erp-clientes",
    method: "GET",
    path: "/api/erp/clientes-sac-busca?codcli=362811",
    weight: 4,
  },
  {
    name: "erp-pedidos",
    method: "GET",
    path: "/api/erp/pedidos-por-cliente?codcli=362811",
    weight: 3,
  },
  {
    name: "erp-itens",
    method: "GET",
    path: "/api/erp/pedido-itens-por-pedido?numped=121000060",
    weight: 3,
  },
  {
    name: "sac-create",
    method: "POST",
    path: "/api/sac/atendimentos",
    weight: 2,
    body: () => ({
      codcli: "362811",
      clienteNome: "CENTRO AUDITIVO DO PARA LTDA",
      cgcent: "21876788000174",
      telefone: "91932416476",
      canal: "EMAIL",
      tipoContato: "TROCA",
      descricao: `Soak SAC ${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
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
    weight: 2,
    body: () => ({
      origemTipo: "SAC",
      origemId: `SOAK-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      codcli: "362811",
      clienteNome: "CENTRO AUDITIVO DO PARA LTDA",
      numPedido: 121000060,
      nfVenda: 10,
      codprod: 133919,
      planta: "BEL",
      tipoOs: "ASSISTENCIA_EXTERNA",
      status: "ABERTA",
      prioridade: "MEDIA",
      tecnicoResponsavel: "soak-test",
      descricaoProblema: "Teste de soak",
      dataAbertura: "2026-03-07",
      dataPrevista: "2026-03-14",
    }),
  },
];

const weighted = scenarios.flatMap((scenario) => Array.from({ length: scenario.weight }, () => scenario));
const totalDurationMs = DURATION_MINUTES * 60 * 1000;
const startedAtMs = Date.now();
const endAtMs = startedAtMs + totalDurationMs;

let success = 0;
let failed = 0;
let timeouts = 0;
const latencies = [];
const statusCount = new Map();
const scenarioCount = new Map();

function sampleScenario() {
  return weighted[Math.floor(Math.random() * weighted.length)];
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function resolveAuthToken() {
  if (AUTH_TOKEN) return AUTH_TOKEN;
  if (!AUTH_EMAIL || !AUTH_PASSWORD) {
    throw new Error("Defina RUNTIME_AUTH_TOKEN ou (RUNTIME_AUTH_EMAIL + RUNTIME_AUTH_PASSWORD).");
  }

  const response = await fetch(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: AUTH_EMAIL, password: AUTH_PASSWORD }),
  });

  if (!response.ok) {
    throw new Error(`Falha no login para runtime script: ${response.status} ${await response.text()}`);
  }

  const body = await response.json();
  if (!body?.token || typeof body.token !== "string") {
    throw new Error("Resposta de login sem token valido.");
  }
  return body.token;
}

function buildHeaders(payload, authToken) {
  const headers = {
    ...(payload ? { "Content-Type": "application/json" } : {}),
    Authorization: `Bearer ${authToken}`,
  };
  return headers;
}

async function hitScenario(scenario, authToken) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  const started = performance.now();
  try {
    const payload = typeof scenario.body === "function" ? scenario.body() : scenario.body;
    const response = await fetch(`${BASE_URL}${scenario.path}`, {
      method: scenario.method,
      headers: buildHeaders(payload, authToken),
      body: payload ? JSON.stringify(payload) : undefined,
      signal: controller.signal,
    });
    const elapsed = performance.now() - started;
    latencies.push(elapsed);
    scenarioCount.set(scenario.name, (scenarioCount.get(scenario.name) || 0) + 1);
    statusCount.set(String(response.status), (statusCount.get(String(response.status)) || 0) + 1);
    if (response.ok) success += 1;
    else failed += 1;
  } catch (error) {
    const elapsed = performance.now() - started;
    latencies.push(elapsed);
    failed += 1;
    statusCount.set("0", (statusCount.get("0") || 0) + 1);
    if (String(error).includes("AbortError")) {
      timeouts += 1;
    }
  } finally {
    clearTimeout(timeout);
  }
}

function percentile(sorted, p) {
  if (!sorted.length) return null;
  const index = Math.min(sorted.length - 1, Math.max(0, Math.ceil((p / 100) * sorted.length) - 1));
  return Number(sorted[index].toFixed(2));
}

function snapshot() {
  const elapsedMs = Date.now() - startedAtMs;
  const sorted = [...latencies].sort((a, b) => a - b);
  const total = success + failed;
  return {
    baseUrl: BASE_URL,
    startedAt: new Date(startedAtMs).toISOString(),
    now: new Date().toISOString(),
    durationMinutes: DURATION_MINUTES,
    elapsedMinutes: Number((elapsedMs / 60000).toFixed(2)),
    progressPct: Number(Math.min(100, (elapsedMs / totalDurationMs) * 100).toFixed(2)),
    concurrency: CONCURRENCY,
    pauseMs: PAUSE_MS,
    totalRequests: total,
    success,
    failed,
    timeouts,
    errorRatePct: total ? Number(((failed / total) * 100).toFixed(2)) : 0,
    rps: elapsedMs > 0 ? Number((total / (elapsedMs / 1000)).toFixed(2)) : 0,
    latencyMs: {
      p50: percentile(sorted, 50),
      p95: percentile(sorted, 95),
      p99: percentile(sorted, 99),
      max: sorted.length ? Number(sorted[sorted.length - 1].toFixed(2)) : null,
      avg: sorted.length ? Number((sorted.reduce((acc, v) => acc + v, 0) / sorted.length).toFixed(2)) : null,
    },
    scenarioCount: Object.fromEntries(scenarioCount.entries()),
    statusCount: Object.fromEntries(statusCount.entries()),
  };
}

function persistProgress() {
  const snap = snapshot();
  fs.writeFileSync(PROGRESS_FILE, JSON.stringify(snap, null, 2), "utf-8");
}

async function worker(authToken) {
  while (Date.now() < endAtMs) {
    const scenario = sampleScenario();
    await hitScenario(scenario, authToken);
    if (PAUSE_MS > 0) await delay(PAUSE_MS);
  }
}

async function main() {
  const token = await resolveAuthToken();
  persistProgress();
  const progressTimer = setInterval(persistProgress, 60_000);
  await Promise.all(Array.from({ length: CONCURRENCY }, () => worker(token)));
  clearInterval(progressTimer);
  persistProgress();
  // eslint-disable-next-line no-console
  console.log(JSON.stringify(snapshot(), null, 2));
}

main().catch((error) => {
  // eslint-disable-next-line no-console
  console.error(error);
  process.exit(1);
});
