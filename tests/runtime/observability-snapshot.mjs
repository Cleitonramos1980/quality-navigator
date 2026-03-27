import fs from "node:fs";
import path from "node:path";

const apiBase = process.env.E2E_REAL_API_BASE_URL || "http://127.0.0.1:3333/api";
const loginEmail = process.env.E2E_AUTH_EMAIL || "teste@admin.com";
const passwordCandidates = [
  process.env.E2E_AUTH_PASSWORD,
  "123456",
  "12345678",
].filter(Boolean);

async function login() {
  let lastStatus = 0;
  let lastBody = "";

  for (const password of passwordCandidates) {
    const response = await fetch(`${apiBase}/auth/login`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email: loginEmail, password }),
    });

    if (response.ok) {
      return response.json();
    }

    lastStatus = response.status;
    lastBody = await response.text();
  }

  throw new Error(`Nao foi possivel autenticar em ${apiBase}/auth/login (${lastStatus}): ${lastBody}`);
}

const session = await login();
const headers = { Authorization: `Bearer ${session.token}` };

const [observabilityRes, uxRes] = await Promise.all([
  fetch(`${apiBase}/metrics/observability`, { headers }),
  fetch(`${apiBase}/metrics/ux?limit=100`, { headers }),
]);

if (!observabilityRes.ok) {
  throw new Error(`Falha ao consultar observabilidade: ${observabilityRes.status} ${await observabilityRes.text()}`);
}
if (!uxRes.ok) {
  throw new Error(`Falha ao consultar métricas UX: ${uxRes.status} ${await uxRes.text()}`);
}

const observability = await observabilityRes.json();
const ux = await uxRes.json();

const payload = {
  generatedAt: new Date().toISOString(),
  apiBase,
  observability,
  ux: {
    total: Array.isArray(ux) ? ux.length : 0,
    items: ux,
  },
};

const outPath = path.resolve("tests/runtime/results/observability-snapshot.json");
fs.writeFileSync(outPath, JSON.stringify(payload, null, 2));

console.log(JSON.stringify({
  output: outPath,
  httpRoutes: Array.isArray(observability.http) ? observability.http.length : 0,
  oracleQueries: Array.isArray(observability.oracle) ? observability.oracle.length : 0,
  uxEvents: Array.isArray(ux) ? ux.length : 0,
}, null, 2));

