import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { db, nextId, appendAudit } from "../repositories/dataStore.js";

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export async function inventarioRoutes(app: FastifyInstance) {
  app.get("/api/inventario/lojas", async () => db.inventarioLojas);
  app.get("/api/inventario/departamentos", async () => db.inventarioDepartamentos);
  app.get("/api/inventario/frequencias", async () => db.inventarioFrequencias);
  app.get("/api/inventario/tarefas", async () => db.inventarioTarefas);

  app.get("/api/inventario/contagens", async () => db.inventarioContagens);

  app.get("/api/inventario/contagens/:id", async (req, reply) => {
    const { id } = z.object({ id: z.string() }).parse(req.params);
    const contagem = db.inventarioContagens.find((c: any) => c.id === id);
    if (!contagem) return reply.status(404).send({ error: { message: "Contagem não encontrada." } });
    return contagem;
  });

  app.post("/api/inventario/contagens", async (req) => {
    const body = req.body as any;
    const rec = {
      ...body,
      id: nextId("CNT", db.inventarioContagens.length),
      status: body.status || "NAO_INICIADO",
      itensContados: body.itensContados ?? 0,
      itensDivergentes: body.itensDivergentes ?? 0,
      acuracidade: body.acuracidade ?? 0,
      itens: body.itens ?? [],
    };
    db.inventarioContagens.push(rec);
    appendAudit("CRIAR", "INVENTARIO_CONTAGEM", rec.id, "Contagem criada", (req as any).authUser?.nome ?? "system");
    return rec;
  });

  app.put("/api/inventario/contagens/:id", async (req, reply) => {
    const { id } = z.object({ id: z.string() }).parse(req.params);
    const idx = db.inventarioContagens.findIndex((c: any) => c.id === id);
    if (idx < 0) return reply.status(404).send({ error: { message: "Contagem não encontrada." } });
    db.inventarioContagens[idx] = { ...db.inventarioContagens[idx], ...(req.body as any) };
    appendAudit("ATUALIZAR", "INVENTARIO_CONTAGEM", id, "Contagem atualizada", (req as any).authUser?.nome ?? "system");
    return db.inventarioContagens[idx];
  });

  app.put("/api/inventario/contagens/:id/validar", async (req, reply) => {
    const { id } = z.object({ id: z.string() }).parse(req.params);
    const body = z.object({ validadoPor: z.string() }).parse(req.body);
    const idx = db.inventarioContagens.findIndex((c: any) => c.id === id);
    if (idx < 0) return reply.status(404).send({ error: { message: "Contagem não encontrada." } });
    db.inventarioContagens[idx] = {
      ...db.inventarioContagens[idx],
      status: "VALIDADO",
      validadoEm: new Date().toISOString(),
      validadoPor: body.validadoPor,
    };
    appendAudit("VALIDAR", "INVENTARIO_CONTAGEM", id, `Validado por ${body.validadoPor}`, (req as any).authUser?.nome ?? "system");
    return db.inventarioContagens[idx];
  });

  app.post("/api/inventario/contagens/:id/recontagem", async (req, reply) => {
    const { id } = z.object({ id: z.string() }).parse(req.params);
    const body = z.object({ solicitadoPor: z.string() }).parse(req.body);
    const idx = db.inventarioContagens.findIndex((c: any) => c.id === id);
    if (idx < 0) return reply.status(404).send({ error: { message: "Contagem não encontrada." } });
    db.inventarioContagens[idx] = {
      ...db.inventarioContagens[idx],
      status: "RECONTAGEM",
      recontagem: true,
      recontagemOrigem: db.inventarioContagens[idx].recontagemOrigem || id,
    };
    appendAudit("RECONTAGEM", "INVENTARIO_CONTAGEM", id, `Recontagem solicitada por ${body.solicitadoPor}`, (req as any).authUser?.nome ?? "system");
    return db.inventarioContagens[idx];
  });

  app.get("/api/inventario/divergencias", async () => db.inventarioDivergencias);

  app.get("/api/inventario/dashboard", async () => {
    const contagens = db.inventarioContagens as any[];
    const concluidas = contagens.filter((c) => ["CONCLUIDO", "VALIDADO"].includes(c.status));
    const acuracidadeMedia = concluidas.length > 0
      ? Math.round(concluidas.reduce((sum: number, c: any) => sum + c.acuracidade, 0) / concluidas.length)
      : 0;
    return {
      totalContagens: contagens.length,
      contagensConcluidas: concluidas.length,
      contagensPendentes: contagens.filter((c) => ["NAO_INICIADO", "EM_ANDAMENTO"].includes(c.status)).length,
      acuracidadeMedia,
      lojasComDivergenciaAlta: (db.inventarioDivergencias as any[]).filter((d) => d.nivel === "alta").length,
      totalItensContados: concluidas.reduce((sum: number, c: any) => sum + c.itensContados, 0),
      totalItensDivergentes: concluidas.reduce((sum: number, c: any) => sum + c.itensDivergentes, 0),
    };
  });
}
