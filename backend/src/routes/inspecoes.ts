import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { randomUUID } from "node:crypto";
import { db } from "../repositories/dataStore.js";
import { persistCollections } from "../repositories/persistentCollectionStore.js";

function nextInspecaoId(prefix: string, list: any[]) {
  return `${prefix}-${randomUUID().slice(0, 8)}`;
}

export async function inspecoesRoutes(app: FastifyInstance) {
  // ── Modelos ──
  app.get("/api/inspecoes/modelos", async () => db.inspecoesModelos);
  app.get("/api/inspecoes/modelos/:id", async (req, reply) => {
    const { id } = z.object({ id: z.string() }).parse(req.params);
    const item = db.inspecoesModelos.find((m: any) => m.id === id);
    if (!item) return reply.status(404).send({ error: { message: "Modelo não encontrado" } });
    return item;
  });
  app.post("/api/inspecoes/modelos", async (req) => {
    const data = req.body as any;
    const item = { ...data, id: data.id ?? nextInspecaoId("MOD", db.inspecoesModelos) };
    db.inspecoesModelos.push(item);
    return item;
  });
  app.put("/api/inspecoes/modelos/:id", async (req, reply) => {
    const { id } = z.object({ id: z.string() }).parse(req.params);
    const idx = db.inspecoesModelos.findIndex((m: any) => m.id === id);
    if (idx === -1) return reply.status(404).send({ error: { message: "Modelo não encontrado" } });
    db.inspecoesModelos[idx] = { ...db.inspecoesModelos[idx], ...(req.body as any), id };
    return db.inspecoesModelos[idx];
  });

  // ── Execuções ──
  app.get("/api/inspecoes/execucoes", async () => db.inspecoesExecucoes);
  app.get("/api/inspecoes/execucoes/:id", async (req, reply) => {
    const { id } = z.object({ id: z.string() }).parse(req.params);
    const item = db.inspecoesExecucoes.find((e: any) => e.id === id);
    if (!item) return reply.status(404).send({ error: { message: "Execução não encontrada" } });
    return item;
  });
  app.post("/api/inspecoes/execucoes", async (req) => {
    const data = req.body as any;
    const item = { ...data, id: data.id ?? nextInspecaoId("EXEC", db.inspecoesExecucoes) };
    db.inspecoesExecucoes.push(item);
    return item;
  });

  // ── Tipos NC ──
  app.get("/api/inspecoes/tipos-nc", async () => db.inspecoesTiposNc);
  app.post("/api/inspecoes/tipos-nc", async (req) => {
    const data = req.body as any;
    const item = { ...data, id: data.id ?? nextInspecaoId("TNC", db.inspecoesTiposNc) };
    db.inspecoesTiposNc.push(item);
    return item;
  });
  app.put("/api/inspecoes/tipos-nc/:id", async (req, reply) => {
    const { id } = z.object({ id: z.string() }).parse(req.params);
    const idx = db.inspecoesTiposNc.findIndex((t: any) => t.id === id);
    if (idx === -1) return reply.status(404).send({ error: { message: "Tipo NC não encontrado" } });
    db.inspecoesTiposNc[idx] = { ...db.inspecoesTiposNc[idx], ...(req.body as any), id };
    return db.inspecoesTiposNc[idx];
  });

  // ── Padrões de Mola ──
  app.get("/api/inspecoes/molas/padroes", async () => db.inspecoesPadroesMola);
  app.post("/api/inspecoes/molas/padroes", async (req) => {
    const data = req.body as any;
    const item = { ...data, id: data.id ?? nextInspecaoId("PM", db.inspecoesPadroesMola) };
    db.inspecoesPadroesMola.push(item);
    return item;
  });
  app.put("/api/inspecoes/molas/padroes/:id", async (req, reply) => {
    const { id } = z.object({ id: z.string() }).parse(req.params);
    const idx = db.inspecoesPadroesMola.findIndex((p: any) => p.id === id);
    if (idx === -1) return reply.status(404).send({ error: { message: "Padrão não encontrado" } });
    db.inspecoesPadroesMola[idx] = { ...db.inspecoesPadroesMola[idx], ...(req.body as any), id };
    return db.inspecoesPadroesMola[idx];
  });

  // ── Inspeções de Mola ──
  app.get("/api/inspecoes/molas", async () => db.inspecoesMola);
  app.get("/api/inspecoes/molas/:id", async (req, reply) => {
    const { id } = z.object({ id: z.string() }).parse(req.params);
    const item = db.inspecoesMola.find((m: any) => m.id === id);
    if (!item) return reply.status(404).send({ error: { message: "Inspeção de mola não encontrada" } });
    return item;
  });
  app.post("/api/inspecoes/molas", async (req) => {
    const data = req.body as any;
    const item = { ...data, id: data.id ?? nextInspecaoId("MOLA", db.inspecoesMola) };
    db.inspecoesMola.push(item);
    return item;
  });

  // ── Setores ──
  app.get("/api/inspecoes/setores", async () => {
    const setores = new Set<string>();
    for (const m of db.inspecoesModelos) setores.add((m as any).setor);
    return Array.from(setores).sort();
  });

  // ── Usuário-Setor mapping ──
  app.get("/api/inspecoes/usuario-setor", async () => db.inspecoesUsuarioSetor);
  app.get("/api/inspecoes/usuario-setor/:userId", async (req) => {
    const { userId } = z.object({ userId: z.string() }).parse(req.params);
    const mappings = db.inspecoesUsuarioSetor.filter((us: any) => us.userId === userId);
    return mappings.map((us: any) => us.setor);
  });
  app.post("/api/inspecoes/usuario-setor", async (req) => {
    const data = req.body as any;
    const item = { ...data, id: data.id ?? nextInspecaoId("US", db.inspecoesUsuarioSetor) };
    db.inspecoesUsuarioSetor.push(item);
    return item;
  });
  app.delete("/api/inspecoes/usuario-setor/:id", async (req, reply) => {
    const { id } = z.object({ id: z.string() }).parse(req.params);
    const idx = db.inspecoesUsuarioSetor.findIndex((us: any) => us.id === id);
    if (idx === -1) return reply.status(404).send({ error: { message: "Mapeamento não encontrado" } });
    db.inspecoesUsuarioSetor.splice(idx, 1);
    return { ok: true };
  });
}
