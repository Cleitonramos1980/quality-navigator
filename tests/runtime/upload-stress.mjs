import { performance } from "node:perf_hooks";

const BASE_URL = process.env.RUNTIME_BASE_URL || "http://127.0.0.1:3333";

function makeBlob(sizeBytes, contentByte = 65) {
  return new Blob([Buffer.alloc(sizeBytes, contentByte)], { type: "application/pdf" });
}

async function createAtendimento() {
  const response = await fetch(`${BASE_URL}/api/sac/atendimentos`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
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

async function uploadBatch(atendimentoId, files, suffix) {
  const form = new FormData();
  files.forEach((file, index) => form.append("files", file, `stress-${suffix}-${index + 1}.pdf`));
  const started = performance.now();
  const response = await fetch(`${BASE_URL}/api/sac/atendimentos/${encodeURIComponent(atendimentoId)}/anexos`, {
    method: "POST",
    body: form,
  });
  const elapsed = performance.now() - started;
  const text = await response.text();
  return { status: response.status, ok: response.ok, elapsedMs: Number(elapsed.toFixed(2)), body: text };
}

async function concurrentSingleFileUploads(atendimentoId) {
  const workers = 12;
  const oneFile = makeBlob(256 * 1024, 66);
  const promises = Array.from({ length: workers }, (_, idx) => uploadBatch(atendimentoId, [oneFile], `single-${idx}`));
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

async function maxFilesSingleRequest(atendimentoId) {
  const files = Array.from({ length: 10 }, (_, i) => makeBlob(1024 * 1024, 67 + i));
  const result = await uploadBatch(atendimentoId, files, "max-files");
  return {
    test: "single-request-10-files-1mb-each",
    status: result.status,
    ok: result.ok,
    latencyMs: result.elapsedMs,
    bodySnippet: result.body.slice(0, 400),
  };
}

async function oversizedFileRequest(atendimentoId) {
  const oversized = makeBlob(26 * 1024 * 1024, 88);
  const result = await uploadBatch(atendimentoId, [oversized], "oversized");
  return {
    test: "single-oversized-file-26mb",
    status: result.status,
    ok: result.ok,
    latencyMs: result.elapsedMs,
    bodySnippet: result.body.slice(0, 400),
  };
}

async function main() {
  const atendimento = await createAtendimento();
  const atendimentoId = atendimento.id;

  const parallel = await concurrentSingleFileUploads(atendimentoId);
  const maxFiles = await maxFilesSingleRequest(atendimentoId);
  const oversized = await oversizedFileRequest(atendimentoId);

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
