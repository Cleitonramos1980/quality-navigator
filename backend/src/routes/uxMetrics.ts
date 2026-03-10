import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { db, nextId } from "../repositories/dataStore.js";

const uxMetricSchema = z.object({
  type: z.enum(["PAGE_VIEW", "ACTION", "ERROR", "SCREEN_TIME"]),
  screen: z.string().trim().min(1),
  action: z.string().trim().optional(),
  success: z.boolean().optional(),
  durationMs: z.number().finite().nonnegative().optional(),
  metadata: z.record(z.any()).optional(),
  createdAt: z.string().optional(),
});

export async function uxMetricsRoutes(app: FastifyInstance) {
  app.get("/api/metrics/ux", async (req) => {
    const { limit } = z.object({ limit: z.coerce.number().int().positive().max(500).optional() }).parse(req.query);
    return db.uxMetrics.slice(0, limit ?? 100);
  });

  app.post("/api/metrics/ux", async (req) => {
    const payload = uxMetricSchema.parse(req.body);
    const entry = {
      id: nextId("UX", db.uxMetrics.length),
      ...payload,
      createdAt: payload.createdAt || new Date().toISOString(),
    };
    db.uxMetrics.unshift(entry);
    if (db.uxMetrics.length > 2000) {
      db.uxMetrics.splice(2000);
    }
    return entry;
  });
}
