#!/usr/bin/env node
/**
 * Script de importação oficial da planilha de Inspeções para o backend/banco.
 *
 * Uso:
 *   npx tsx backend/scripts/import-inspecoes-planilha.ts [--force]
 *
 * Este script:
 * - Lê os dados reais do seed (que é a transcrição fiel da planilha)
 * - Popula as coleções do dataStore
 * - Persiste no Oracle quando disponível
 * - É idempotente (não duplica dados se já existem)
 * - Gera logs claros
 *
 * Quando o Oracle estiver habilitado, os dados são persistidos automaticamente
 * via persistentCollectionStore. Quando não estiver, ficam em memória com seed.
 *
 * Para migração futura para tabelas Oracle dedicadas (INS_SETOR, INS_MODELO_CHECKLIST, etc.),
 * este script serve como base de carga inicial.
 */

import { db } from "../src/repositories/dataStore.js";
import { seedInspecoesData, SETORES_REAIS, MAQUINAS_REAIS } from "../src/repositories/seedInspecoesData.js";

const force = process.argv.includes("--force");

console.log("╔══════════════════════════════════════════════════════════════╗");
console.log("║  IMPORTAÇÃO OFICIAL — INSPEÇÕES (Planilha → Backend/Banco) ║");
console.log("╚══════════════════════════════════════════════════════════════╝");
console.log();

if (force) {
  console.log("[FORCE] Limpando coleções existentes para reimportação...");
  db.inspecoesModelos.length = 0;
  db.inspecoesExecucoes.length = 0;
  db.inspecoesTiposNc.length = 0;
  db.inspecoesPadroesMola.length = 0;
  db.inspecoesMola.length = 0;
  db.inspecoesUsuarioSetor.length = 0;
}

const antes = {
  modelos: db.inspecoesModelos.length,
  tiposNc: db.inspecoesTiposNc.length,
  padroesMola: db.inspecoesPadroesMola.length,
  usuarioSetor: db.inspecoesUsuarioSetor.length,
};

seedInspecoesData();

const depois = {
  modelos: db.inspecoesModelos.length,
  tiposNc: db.inspecoesTiposNc.length,
  padroesMola: db.inspecoesPadroesMola.length,
  usuarioSetor: db.inspecoesUsuarioSetor.length,
};

console.log();
console.log("── RESULTADO DA IMPORTAÇÃO ──");
console.log();
console.log(`  Setores oficiais:     ${SETORES_REAIS.length}`);
console.log(`  Máquinas oficiais:    ${MAQUINAS_REAIS.length} (${MAQUINAS_REAIS.join(", ")})`);
console.log();
console.log(`  Modelos/Checklists:   ${antes.modelos} → ${depois.modelos}`);

let totalItens = 0;
for (const m of db.inspecoesModelos) {
  const itens = (m as any).itens;
  totalItens += Array.isArray(itens) ? itens.length : 0;
}
console.log(`  Itens de checklist:   ${totalItens}`);
console.log(`  Tipos de NC:          ${antes.tiposNc} → ${depois.tiposNc}`);
console.log(`  Padrões de mola:      ${antes.padroesMola} → ${depois.padroesMola}`);
console.log(`  Mapeamentos usr-setor: ${antes.usuarioSetor} → ${depois.usuarioSetor}`);
console.log();

// Validate
const errors: string[] = [];
if (depois.modelos < 15) errors.push(`Esperados >= 15 modelos, encontrados ${depois.modelos}`);
if (totalItens < 900) errors.push(`Esperados >= 900 itens, encontrados ${totalItens}`);
if (depois.tiposNc < 150) errors.push(`Esperados >= 150 tipos NC, encontrados ${depois.tiposNc}`);
if (depois.padroesMola < 16) errors.push(`Esperados >= 16 padrões mola, encontrados ${depois.padroesMola}`);

if (errors.length > 0) {
  console.log("⚠️  ALERTAS:");
  for (const e of errors) console.log(`  - ${e}`);
} else {
  console.log("✅ Importação concluída com sucesso. Dados reais da planilha carregados.");
}

console.log();
console.log("── Detalhamento por setor ──");
for (const setor of SETORES_REAIS) {
  const modelo = db.inspecoesModelos.find((m: any) => m.setor === setor);
  const itensCount = modelo ? ((modelo as any).itens?.length ?? 0) : 0;
  const ncsCount = db.inspecoesTiposNc.filter((t: any) => t.setor === setor).length;
  console.log(`  ${setor.padEnd(22)} → ${itensCount} itens, ${ncsCount} tipos NC`);
}

const ncsGeral = db.inspecoesTiposNc.filter((t: any) => t.setor === "Geral").length;
if (ncsGeral > 0) {
  console.log(`  ${"Geral".padEnd(22)} → ${ncsGeral} tipos NC (transversais)`);
}

console.log();
console.log("── Padrões de mola ──");
const p130 = db.inspecoesPadroesMola.filter((p: any) => p.alturaTipo === "130").length;
const p200 = db.inspecoesPadroesMola.filter((p: any) => p.alturaTipo === "200").length;
console.log(`  Altura 130: ${p130} padrões`);
console.log(`  Altura 200: ${p200} padrões`);
console.log();
console.log("Importação finalizada.");
