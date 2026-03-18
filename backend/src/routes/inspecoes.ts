import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { randomUUID } from "node:crypto";

// ── Simple in-memory collection store for inspeções ──
class InspecoesStore {
  private items: any[] = [];
  constructor(public readonly name: string) {}

  list() { return this.items; }

  getById(id: string) { return this.items.find((i) => i.id === id) ?? null; }

  create(data: any) {
    const item = { ...data, id: data.id ?? `${this.name.toUpperCase()}-${randomUUID().slice(0, 8)}` };
    this.items.push(item);
    return item;
  }

  update(id: string, data: any) {
    const idx = this.items.findIndex((i) => i.id === id);
    if (idx === -1) return null;
    this.items[idx] = { ...this.items[idx], ...data, id };
    return this.items[idx];
  }
}

// Re-export for seed usage
export const modelos = new InspecoesStore("inspecoes_modelos");
export const execucoes = new InspecoesStore("inspecoes_execucoes");
export const tiposNc = new InspecoesStore("inspecoes_tipos_nc");
export const padroesMola = new InspecoesStore("inspecoes_padroes_mola");
export const inspecoesMola = new InspecoesStore("inspecoes_mola");

export async function inspecoesRoutes(app: FastifyInstance) {
  // ── Modelos ──
  app.get("/api/qualidade/inspecoes/modelos", async () => modelos.list());
  app.get("/api/qualidade/inspecoes/modelos/:id", async (req, reply) => {
    const { id } = z.object({ id: z.string() }).parse(req.params);
    const item = modelos.getById(id);
    if (!item) return reply.status(404).send({ error: { message: "Modelo não encontrado" } });
    return item;
  });
  app.post("/api/qualidade/inspecoes/modelos", async (req) => modelos.create(req.body as any));
  app.put("/api/qualidade/inspecoes/modelos/:id", async (req, reply) => {
    const { id } = z.object({ id: z.string() }).parse(req.params);
    const updated = modelos.update(id, req.body as any);
    if (!updated) return reply.status(404).send({ error: { message: "Modelo não encontrado" } });
    return updated;
  });

  // ── Execuções ──
  app.get("/api/qualidade/inspecoes/execucoes", async () => execucoes.list());
  app.get("/api/qualidade/inspecoes/execucoes/:id", async (req, reply) => {
    const { id } = z.object({ id: z.string() }).parse(req.params);
    const item = execucoes.getById(id);
    if (!item) return reply.status(404).send({ error: { message: "Execução não encontrada" } });
    return item;
  });
  app.post("/api/qualidade/inspecoes/execucoes", async (req) => execucoes.create(req.body as any));

  // ── Tipos NC ──
  app.get("/api/qualidade/inspecoes/tipos-nc", async () => tiposNc.list());
  app.post("/api/qualidade/inspecoes/tipos-nc", async (req) => tiposNc.create(req.body as any));
  app.put("/api/qualidade/inspecoes/tipos-nc/:id", async (req, reply) => {
    const { id } = z.object({ id: z.string() }).parse(req.params);
    const updated = tiposNc.update(id, req.body as any);
    if (!updated) return reply.status(404).send({ error: { message: "Tipo NC não encontrado" } });
    return updated;
  });

  // ── Padrões de Mola ──
  app.get("/api/qualidade/inspecoes/molas/padroes", async () => padroesMola.list());
  app.post("/api/qualidade/inspecoes/molas/padroes", async (req) => padroesMola.create(req.body as any));
  app.put("/api/qualidade/inspecoes/molas/padroes/:id", async (req, reply) => {
    const { id } = z.object({ id: z.string() }).parse(req.params);
    const updated = padroesMola.update(id, req.body as any);
    if (!updated) return reply.status(404).send({ error: { message: "Padrão não encontrado" } });
    return updated;
  });

  // ── Inspeções de Mola ──
  app.get("/api/qualidade/inspecoes/molas", async () => inspecoesMola.list());
  app.get("/api/qualidade/inspecoes/molas/:id", async (req, reply) => {
    const { id } = z.object({ id: z.string() }).parse(req.params);
    const item = inspecoesMola.getById(id);
    if (!item) return reply.status(404).send({ error: { message: "Inspeção de mola não encontrada" } });
    return item;
  });
  app.post("/api/qualidade/inspecoes/molas", async (req) => inspecoesMola.create(req.body as any));
}
