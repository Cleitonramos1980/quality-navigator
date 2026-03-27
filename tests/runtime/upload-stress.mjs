import { performance } from "node:perf_hooks";

const BASE_URL = process.env.RUNTIME_BASE_URL || "http://127.0.0.1:3333";
const AUTH_TOKEN = (process.env.RUNTIME_AUTH_TOKEN || "").trim();
const AUTH_EMAIL = (process.env.RUNTIME_AUTH_EMAIL || "").trim();
const AUTH_PASSWORD = (process.env.RUNTIME_AUTH_PASSWORD || "").trim();

function makeBlob(sizeBytes, contentByte = 65) {
  return new Blob([Buffer.alloc(sizeBytes, contentByte)], { type: "application/pdf" });
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

function authHeaders(extraHeaders, token) {
  return {
    ...extraHeaders,
    Authorization: `Bearer ${token}`,
  };
}

async function createAtendimento(token) {
  const response = await fetch(`${BASE_URL}/api/sac/atendimentos`, {
    method: "POST",
    headers: authHeaders({ "Content-Type": "application/json" }, token),
    body: JSON.stringify({
      codcli: "362811",
      clienteNome: "CENTRO AUDITIVO DO PARA LTDA",
      cgcent: "21876788000174",
      telefone: "91932416476",
      canal: "EMAIL",
      tipoContato: "TROCA",
      descricao: `Upload stress ${Date.now()}`,
      plantaResp: "BEL",
      numPedido: 121000060,
      numNfVenda: 10,
      codprod: 133919,
      produtoRelacionado: "133919 - AR CONDICIONADO",
      status: "ABERTO",
    }),
  });
  if (!response.ok) {
    throw new Error(`Falha ao criar atendimento: ${response.status} ${await response.text()}`);
  }
  return response.json();
}

async function uploadBatch(atendimentoId, files, suffix, token) {
  const form = new FormData();
  files.forEach((file, index) => form.append("files", file, `stress-${suffix}-${index + 1}.pdf`));
  const started = performance.now();
  const response = await fetch(`${BASE_URL}/api/sac/atendimentos/${encodeURIComponent(atendimentoId)}/anexos`, {
    method: "POST",
    headers: authHeaders({}, token),
    body: form,
  });
  const elapsed = performance.now() - started;
  const text = await response.text();
  return { status: response.status, ok: response.ok, elapsedMs: Number(elapsed.toFixed(2)), body: text };
}

async function concurrentSingleFileUploads(atendimentoId, token) {
  const workers = 12;
  const oneFile = makeBlob(256 * 1024, 66);
  const promises = Array.from({ length: workers }, (_, idx) => uploadBatch(atendimentoId, [oneFile], `single-${idx}`, token));
  const results = await Promise.all(promises);
  const success = results.filter((r) => r.ok).length;
  return {
    test: "parallel-single-file",
    workers,
    success,
    failed: workers - success,
    avgLatencyMs: Number((results.reduce((acc, r) => acc + r.elapsedMs, 0) / results.length).toFixed(2)),
    maxLatencyMs: Math.max(...results.map((r) => r.elapsedMs)),
    statusCount: results.reduce((acc, r) => {
      acc[r.status] = (acc[r.status] || 0) + 1;
      return acc;
    }, {}),
  };
}

async function maxFilesSingleRequest(atendimentoId, token) {
  const files = Array.from({ length: 10 }, (_, i) => makeBlob(1024 * 1024, 67 + i));
  const result = await uploadBatch(atendimentoId, files, "max-files", token);
  return {
    test: "single-request-10-files-1mb-each",
    status: result.status,
    ok: result.ok,
    latencyMs: result.elapsedMs,
    bodySnippet: result.body.slice(0, 400),
  };
}

async function oversizedFileRequest(atendimentoId, token) {
  const oversized = makeBlob(26 * 1024 * 1024, 88);
  const result = await uploadBatch(atendimentoId, [oversized], "oversized", token);
  return {
    test: "single-oversized-file-26mb",
    status: result.status,
    ok: result.ok,
    latencyMs: result.elapsedMs,
    bodySnippet: result.body.slice(0, 400),
  };
}

async function main() {
  const token = await resolveAuthToken();
  const atendimento = await createAtendimento(token);
  const atendimentoId = atendimento.id;

  const parallel = await concurrentSingleFileUploads(atendimentoId, token);
  const maxFiles = await maxFilesSingleRequest(atendimentoId, token);
  const oversized = await oversizedFileRequest(atendimentoId, token);

  const output = {
    baseUrl: BASE_URL,
    atendimentoId,
    generatedAt: new Date().toISOString(),
    results: [parallel, maxFiles, oversized],
  };

  // eslint-disable-next-line no-console
  console.log(JSON.stringify(output, null, 2));
}

main().catch((error) => {
  // eslint-disable-next-line no-console
  console.error(error);
  process.exit(1);
});
