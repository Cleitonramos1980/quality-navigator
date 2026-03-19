/**
 * Dedicated repository for the Inspeções module.
 * All data access for inspections goes through here.
 * Persistence is handled by persistentCollectionStore via the server onResponse hook.
 */
import { db, nextId } from "./dataStore.js";
import { randomUUID } from "node:crypto";

// ── Setores ──

export function listSetores(): string[] {
  const setores = new Set<string>();
  for (const m of db.inspecoesModelos) setores.add((m as any).setor);
  return Array.from(setores).sort();
}

// ── Usuário-Setor ──

export function listUsuarioSetor() {
  return db.inspecoesUsuarioSetor;
}

export function getSetoresByUserId(userId: string): string[] {
  return db.inspecoesUsuarioSetor
    .filter((us: any) => us.userId === userId)
    .map((us: any) => us.setor);
}

export function addUsuarioSetor(data: any) {
  const item = { ...data, id: data.id ?? `US-${randomUUID().slice(0, 8)}` };
  db.inspecoesUsuarioSetor.push(item);
  return item;
}

export function removeUsuarioSetor(id: string): boolean {
  const idx = db.inspecoesUsuarioSetor.findIndex((us: any) => us.id === id);
  if (idx === -1) return false;
  db.inspecoesUsuarioSetor.splice(idx, 1);
  return true;
}

// ── Modelos ──

export function listModelos() {
  return db.inspecoesModelos;
}

export function getModeloById(id: string) {
  return db.inspecoesModelos.find((m: any) => m.id === id) ?? null;
}

export function createModelo(data: any) {
  const id = data.id ?? `MOD-${randomUUID().slice(0, 8)}`;
  const item = { ...data, id };
  db.inspecoesModelos.push(item);
  return item;
}

export function updateModelo(id: string, data: any) {
  const idx = db.inspecoesModelos.findIndex((m: any) => m.id === id);
  if (idx === -1) return null;
  db.inspecoesModelos[idx] = { ...db.inspecoesModelos[idx], ...(data as any), id };
  return db.inspecoesModelos[idx];
}

// ── Execuções ──

export function listExecucoes() {
  return db.inspecoesExecucoes;
}

export function getExecucaoById(id: string) {
  return db.inspecoesExecucoes.find((e: any) => e.id === id) ?? null;
}

export function createExecucao(data: any) {
  const id = data.id ?? `EXEC-${randomUUID().slice(0, 8)}`;
  const item = { ...data, id };
  db.inspecoesExecucoes.push(item);
  return item;
}

// ── Tipos NC ──

export function listTiposNc() {
  return db.inspecoesTiposNc;
}

export function createTipoNc(data: any) {
  const id = data.id ?? `TNC-${randomUUID().slice(0, 8)}`;
  const item = { ...data, id };
  db.inspecoesTiposNc.push(item);
  return item;
}

export function updateTipoNc(id: string, data: any) {
  const idx = db.inspecoesTiposNc.findIndex((t: any) => t.id === id);
  if (idx === -1) return null;
  db.inspecoesTiposNc[idx] = { ...db.inspecoesTiposNc[idx], ...(data as any), id };
  return db.inspecoesTiposNc[idx];
}

// ── Padrões de Mola ──

export function listPadroesMola() {
  return db.inspecoesPadroesMola;
}

export function createPadraoMola(data: any) {
  const id = data.id ?? `PM-${randomUUID().slice(0, 8)}`;
  const item = { ...data, id };
  db.inspecoesPadroesMola.push(item);
  return item;
}

export function updatePadraoMola(id: string, data: any) {
  const idx = db.inspecoesPadroesMola.findIndex((p: any) => p.id === id);
  if (idx === -1) return null;
  db.inspecoesPadroesMola[idx] = { ...db.inspecoesPadroesMola[idx], ...(data as any), id };
  return db.inspecoesPadroesMola[idx];
}

// ── Inspeções de Mola ──

export function listInspecoesMola() {
  return db.inspecoesMola;
}

export function getInspecaoMolaById(id: string) {
  return db.inspecoesMola.find((m: any) => m.id === id) ?? null;
}

export function createInspecaoMola(data: any) {
  const id = data.id ?? `MOLA-${randomUUID().slice(0, 8)}`;
  const item = { ...data, id };
  db.inspecoesMola.push(item);
  return item;
}
