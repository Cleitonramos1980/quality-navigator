import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { PersistentCollectionStore } from "../repositories/persistentCollectionStore.js";

const modelos = new PersistentCollectionStore("inspecoes_modelos");
const execucoes = new PersistentCollectionStore("inspecoes_execucoes");
const tiposNc = new PersistentCollectionStore("inspecoes_tipos_nc");
const padroesMola = new PersistentCollectionStore("inspecoes_padroes_mola");
const inspecoesMola = new PersistentCollectionStore("inspecoes_mola");

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
