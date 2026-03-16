import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { db, nextId, appendAudit } from "../repositories/dataStore.js";

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export async function operacionalRoutes(app: FastifyInstance) {
  // ── ACESSOS ──
  app.get("/api/operacional/acessos", async () => db.operacionalAcessos);
  app.get("/api/operacional/acessos/:id", async (req, reply) => {
    const { id } = z.object({ id: z.string() }).parse(req.params);
    const item = (db.operacionalAcessos as any[]).find((a) => a.id === id);
    if (!item) return reply.status(404).send({ error: { message: "Acesso não encontrado." } });
    return item;
  });
  app.post("/api/operacional/acessos", async (req) => {
    const body = req.body as any;
    const rec = { ...body, id: nextId("ACS", (db.operacionalAcessos as any[]).length), criadoEm: new Date().toISOString(), ultimaAtualizacao: new Date().toISOString() };
    (db.operacionalAcessos as any[]).push(rec);
    appendAudit("CRIAR", "ACESSO", rec.id, "Acesso criado", (req as any).authUser?.nome ?? "system");
    return rec;
  });
  app.put("/api/operacional/acessos/:id/liberar", async (req, reply) => {
    const { id } = z.object({ id: z.string() }).parse(req.params);
    const idx = (db.operacionalAcessos as any[]).findIndex((a) => a.id === id);
    if (idx < 0) return reply.status(404).send({ error: { message: "Acesso não encontrado." } });
    (db.operacionalAcessos as any[])[idx] = { ...(db.operacionalAcessos as any[])[idx], status: "ENTRADA_LIBERADA", horarioReal: new Date().toISOString(), ultimaAtualizacao: new Date().toISOString() };
    appendAudit("LIBERAR", "ACESSO", id, "Entrada liberada", (req as any).authUser?.nome ?? "system");
    return (db.operacionalAcessos as any[])[idx];
  });
  app.put("/api/operacional/acessos/:id/saida", async (req, reply) => {
    const { id } = z.object({ id: z.string() }).parse(req.params);
    const idx = (db.operacionalAcessos as any[]).findIndex((a) => a.id === id);
    if (idx < 0) return reply.status(404).send({ error: { message: "Acesso não encontrado." } });
    (db.operacionalAcessos as any[])[idx] = { ...(db.operacionalAcessos as any[])[idx], status: "SAIDA_REGISTRADA", horarioSaida: new Date().toISOString(), ultimaAtualizacao: new Date().toISOString() };
    appendAudit("SAIDA", "ACESSO", id, "Saída registrada", (req as any).authUser?.nome ?? "system");
    return (db.operacionalAcessos as any[])[idx];
  });

  // ── VISITANTES ──
  app.get("/api/operacional/visitantes", async () => db.operacionalVisitantes);
  app.get("/api/operacional/visitantes/:id", async (req, reply) => {
    const { id } = z.object({ id: z.string() }).parse(req.params);
    const item = (db.operacionalVisitantes as any[]).find((v) => v.id === id);
    if (!item) return reply.status(404).send({ error: { message: "Visitante não encontrado." } });
    return item;
  });
  app.post("/api/operacional/visitantes", async (req) => {
    const body = req.body as any;
    const rec = { ...body, id: nextId("VIS", (db.operacionalVisitantes as any[]).length), criadoEm: new Date().toISOString(), ultimaAtualizacao: new Date().toISOString() };
    (db.operacionalVisitantes as any[]).push(rec);
    appendAudit("CRIAR", "VISITANTE", rec.id, "Visitante criado", (req as any).authUser?.nome ?? "system");
    return rec;
  });
  app.put("/api/operacional/visitantes/:id/aprovar", async (req, reply) => {
    const { id } = z.object({ id: z.string() }).parse(req.params);
    const idx = (db.operacionalVisitantes as any[]).findIndex((v) => v.id === id);
    if (idx < 0) return reply.status(404).send({ error: { message: "Visitante não encontrado." } });
    (db.operacionalVisitantes as any[])[idx] = { ...(db.operacionalVisitantes as any[])[idx], status: "APROVADO", ultimaAtualizacao: new Date().toISOString() };
    appendAudit("APROVAR", "VISITANTE", id, "Visitante aprovado", (req as any).authUser?.nome ?? "system");
    return (db.operacionalVisitantes as any[])[idx];
  });

  // ── VEÍCULOS VISITANTES ──
  app.get("/api/operacional/veiculos-visitantes", async () => db.operacionalVeiculosVisitantes);

  // ── FROTA ──
  app.get("/api/operacional/frota", async () => db.operacionalFrota);
  app.get("/api/operacional/frota/:id", async (req, reply) => {
    const { id } = z.object({ id: z.string() }).parse(req.params);
    const item = (db.operacionalFrota as any[]).find((v) => v.id === id);
    if (!item) return reply.status(404).send({ error: { message: "Veículo não encontrado." } });
    return item;
  });
  app.get("/api/operacional/frota/deslocamentos", async () => db.operacionalDeslocamentos);
  app.post("/api/operacional/frota/despacho", async (req) => {
    const body = req.body as any;
    const rec = { ...body, id: nextId("DSL", (db.operacionalDeslocamentos as any[]).length), status: "EM_ROTA", horarioSaida: new Date().toISOString() };
    (db.operacionalDeslocamentos as any[]).push(rec);
    appendAudit("DESPACHO", "FROTA", rec.id, "Despacho registrado", (req as any).authUser?.nome ?? "system");
    return rec;
  });
  app.put("/api/operacional/frota/:id/movimentacao", async (req, reply) => {
    const { id } = z.object({ id: z.string() }).parse(req.params);
    const body = req.body as any;
    const idx = (db.operacionalFrota as any[]).findIndex((v) => v.id === id);
    if (idx < 0) return reply.status(404).send({ error: { message: "Veículo não encontrado." } });
    (db.operacionalFrota as any[])[idx] = {
      ...(db.operacionalFrota as any[])[idx],
      status: body.status || (db.operacionalFrota as any[])[idx].status,
      quilometragem: body.quilometragem ?? (db.operacionalFrota as any[])[idx].quilometragem,
      ultimaMovimentacao: new Date().toISOString(),
    };
    // Log movimentacao
    (db.operacionalMovimentacoesFrota as any[]).push({
      id: nextId("MOV", (db.operacionalMovimentacoesFrota as any[]).length),
      veiculoId: id,
      statusAnterior: "",
      statusNovo: body.status || "",
      descricao: body.observacao || "Movimentação registrada",
      dataHora: new Date().toISOString(),
      usuario: (req as any).authUser?.nome ?? "system",
      docaNome: body.docaId,
      km: body.quilometragem,
    });
    appendAudit("MOVIMENTACAO", "FROTA", id, `Status: ${body.status}`, (req as any).authUser?.nome ?? "system");
    return (db.operacionalFrota as any[])[idx];
  });
  app.get("/api/operacional/frota/movimentacoes", async () => db.operacionalMovimentacoesFrota);

  // ── TERCEIROS ──
  app.get("/api/operacional/transportadoras", async () => db.operacionalTransportadoras);
  app.get("/api/operacional/motoristas-terceiros", async () => db.operacionalMotoristasTerceiros);
  app.get("/api/operacional/veiculos-terceiros", async () => db.operacionalVeiculosTerceiros);
  app.get("/api/operacional/operacoes", async () => db.operacionalOperacoes);
  app.get("/api/operacional/agendamentos", async () => db.operacionalAgendamentos);

  // ── PÁTIO / DOCAS ──
  app.get("/api/operacional/docas", async () => db.operacionalDocas);
  app.get("/api/operacional/fila-patio", async () => db.operacionalFilaPatio);

  // ── MONITORAMENTO ──
  app.get("/api/operacional/alertas", async () => db.operacionalAlertas);
  app.get("/api/operacional/excecoes", async () => db.operacionalExcecoes);

  // ── DASHBOARD ──
  app.get("/api/operacional/dashboard", async () => db.operacionalDashboard);

  // ── NF TRÂNSITO ──
  app.get("/api/operacional/nf-transito", async () => db.operacionalNFsTransito);
  app.get("/api/operacional/nf-transito/:id", async (req, reply) => {
    const { id } = z.object({ id: z.string() }).parse(req.params);
    const item = (db.operacionalNFsTransito as any[]).find((nf) => nf.id === id);
    if (!item) return reply.status(404).send({ error: { message: "NF não encontrada." } });
    return item;
  });
  app.get("/api/operacional/excecoes-fiscais", async () => db.operacionalExcecoesFiscais);
  app.put("/api/operacional/nf-transito/:id/confirmar-recebimento", async (req, reply) => {
    const { id } = z.object({ id: z.string() }).parse(req.params);
    const idx = (db.operacionalNFsTransito as any[]).findIndex((nf) => nf.id === id);
    if (idx < 0) return reply.status(404).send({ error: { message: "NF não encontrada." } });
    (db.operacionalNFsTransito as any[])[idx] = {
      ...(db.operacionalNFsTransito as any[])[idx],
      status: "RECEBIMENTO_CONFIRMADO",
      dataEntregaReal: new Date().toISOString(),
      criticidade: "VERDE",
      scoreRisco: 0,
    };
    appendAudit("CONFIRMAR_RECEBIMENTO", "NF_TRANSITO", id, "Recebimento confirmado", (req as any).authUser?.nome ?? "system");
    return (db.operacionalNFsTransito as any[])[idx];
  });

  // ── TIMELINE ──
  app.get("/api/operacional/timeline/:acessoId", async (req) => {
    const { acessoId } = z.object({ acessoId: z.string() }).parse(req.params);
    return db.operacionalTimeline;
  });
}
