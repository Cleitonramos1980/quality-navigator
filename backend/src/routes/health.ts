import type { FastifyInstance } from "fastify";
import { executeOracle, isOracleEnabled } from "../db/oracle.js";
import { getObservabilitySnapshot } from "../utils/observability.js";

export async function healthRoutes(app: FastifyInstance) {
  app.get("/api/health", async () => {
    if (!isOracleEnabled()) {
      return { status: "OK", oracle: "not-configured" };
    }
    const result = await executeOracle<{ STATUS: string }>("SELECT 'OK' AS STATUS FROM DUAL");
    const row = result.rows?.[0] as { STATUS?: string } | undefined;
    return { status: row?.STATUS ?? "OK", oracle: "connected" };
  });

  app.get("/api/health/oracle", async () => {
    if (!isOracleEnabled()) return { status: "SKIPPED", detail: "Oracle não configurado" };
    const result = await executeOracle<{ STATUS: string }>("SELECT 'OK' AS STATUS FROM DUAL");
    const row = result.rows?.[0] as { STATUS?: string } | undefined;
    return { status: row?.STATUS ?? "OK" };
  });

  app.get("/api/metrics", async () => getObservabilitySnapshot());
}
