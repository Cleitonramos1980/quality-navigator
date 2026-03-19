#!/usr/bin/env node
/**
 * Official import script — reads the REAL Excel spreadsheet and populates the backend store.
 *
 * Usage:
 *   npx tsx backend/scripts/import-inspecoes-planilha.ts [--force]
 *
 * This script:
 * - Reads backend/data/CHECKLIST_MANAUS_-_qualidade.xlsx
 * - Parses sheets: Checklist, NC_PADROES, Molas_Padroes, Users
 * - Populates db.inspecoesModelos, db.inspecoesTiposNc, db.inspecoesPadroesMola, db.inspecoesUsuarioSetor
 * - Is idempotent (skips if data already exists, use --force to reimport)
 * - Generates clear logs
 */

import { db } from "../src/repositories/dataStore.js";
import * as XLSX from "xlsx";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { readFileSync } from "node:fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const force = process.argv.includes("--force");

// ── NC setor mapping (sheet uses unaccented names) ──
const NC_SETOR_MAP: Record<string, string> = {
  ESPUMACAO: "ESPUMAÇÃO",
  "AREA DE CURA": "ÁREA DE CURA",
  FLOCADEIRA: "FLOCADEIRA",
  LAMINACAO: "LAMINAÇÃO",
  BORDADEIRA: "BORDADEIRA",
  ALMOXARIFADO: "ALMOXARIFADO",
  MOLA: "MOLA",
  "CORTE E COSTURA": "CORTE E COSTURA",
  ESTOFAMENTO: "ESTOFAMENTO",
  FECHAMENTO: "FECHAMENTO",
  EMBALAGEM: "EMBALAGEM",
  MARCENARIA: "MARCENARIA",
  TAPECARIA: "TAPEÇARIA",
  MOVEIS: "MÓVEIS",
  "EMBALAGEM DE BASE": "EMBALAGEM DE BASE",
};

console.log("╔══════════════════════════════════════════════════════════════╗");
console.log("║  IMPORTAÇÃO OFICIAL — INSPEÇÕES (Planilha Excel → Backend) ║");
console.log("╚══════════════════════════════════════════════════════════════╝");
console.log();

// ── 1. Read the Excel file ──
const xlsxPath = resolve(__dirname, "../data/CHECKLIST_MANAUS_-_qualidade.xlsx");
console.log(`📂 Lendo arquivo: ${xlsxPath}`);
let workbook: XLSX.WorkBook;
try {
  const buf = readFileSync(xlsxPath);
  workbook = XLSX.read(buf, { type: "buffer" });
} catch (err: any) {
  console.error(`❌ Erro ao ler a planilha: ${err.message}`);
  process.exit(1);
}
console.log(`   Abas encontradas: ${workbook.SheetNames.join(", ")}`);
console.log();

// ── 2. Clear if --force ──
if (force) {
  console.log("[FORCE] Limpando coleções existentes para reimportação...");
  db.inspecoesModelos.length = 0;
  db.inspecoesExecucoes.length = 0;
  db.inspecoesTiposNc.length = 0;
  db.inspecoesPadroesMola.length = 0;
  db.inspecoesMola.length = 0;
  db.inspecoesUsuarioSetor.length = 0;
  console.log();
}

if (db.inspecoesModelos.length > 0 && !force) {
  console.log("⚠️  Dados já existem. Use --force para reimportar.");
  process.exit(0);
}

const now = new Date().toISOString();
let itemCounter = 0;

// ── 3. Parse Checklist sheet ──
console.log("── Importando aba Checklist ──");
const checklistSheet = workbook.Sheets["Checklist"];
if (!checklistSheet) {
  console.error("❌ Aba 'Checklist' não encontrada!");
  process.exit(1);
}
const checklistRows: any[] = XLSX.utils.sheet_to_json(checklistSheet, { defval: "" });
console.log(`   Linhas brutas: ${checklistRows.length}`);

// Group by sector
const bySetor = new Map<string, { item: string; descricao: string }[]>();
for (const row of checklistRows) {
  const setorRaw = String(row["Setor"] || "").trim();
  const item = String(row["Item"] || "").trim();
  const descricao = String(row["Descrição"] || row["Descricao"] || "").trim();
  if (!setorRaw || !item || !descricao) continue;

  // Extract clean name: "1.0 - ESPUMAÇÃO" -> "ESPUMAÇÃO"
  const clean = setorRaw.includes(" - ") ? setorRaw.split(" - ").slice(1).join(" - ") : setorRaw;
  if (!bySetor.has(clean)) bySetor.set(clean, []);
  bySetor.get(clean)!.push({ item, descricao });
}

let modeloOrdem = 1;
let totalItens = 0;
for (const [setor, items] of bySetor) {
  const itens = items.map((ci, idx) => ({
    id: `ITEM-${String(++itemCounter).padStart(4, "0")}`,
    descricao: ci.descricao,
    ordem: idx + 1,
    obrigatorio: true,
    exigeEvidenciaNc: true,
    exigeTipoNc: true,
    ativo: true,
  }));
  totalItens += itens.length;

  db.inspecoesModelos.push({
    id: `MOD-${String(modeloOrdem).padStart(3, "0")}`,
    nome: `Checklist ${setor}`,
    setor,
    descricao: `Checklist de inspeção do setor ${setor} — importado da planilha oficial`,
    ativo: true,
    ordem: modeloOrdem++,
    itens,
    createdAt: now,
    updatedAt: now,
  } as any);
}
console.log(`   Setores: ${bySetor.size}`);
console.log(`   Modelos criados: ${db.inspecoesModelos.length}`);
console.log(`   Itens de checklist: ${totalItens}`);
console.log();

// ── 4. Parse NC_PADROES sheet ──
console.log("── Importando aba NC_PADROES ──");
const ncSheet = workbook.Sheets["NC_PADROES"];
if (!ncSheet) {
  console.error("❌ Aba 'NC_PADROES' não encontrada!");
  process.exit(1);
}
const ncRows: any[] = XLSX.utils.sheet_to_json(ncSheet, { defval: "" });
let ncOrdem = 1;
for (const row of ncRows) {
  const setorRaw = String(row["Setor"] || "").trim();
  const defeito = String(row["Defeito"] || "").trim();
  if (!setorRaw || !defeito) continue;

  const setor = NC_SETOR_MAP[setorRaw] || setorRaw;
  db.inspecoesTiposNc.push({
    id: `TNC-${String(ncOrdem).padStart(3, "0")}`,
    setor,
    nome: defeito,
    categoria: defeito === "OUTRO" ? "Outro" : "Processo",
    ativo: true,
  } as any);
  ncOrdem++;
}
console.log(`   Tipos de NC: ${db.inspecoesTiposNc.length}`);
console.log();

// ── 5. Parse Molas_Padroes sheet ──
console.log("── Importando aba Molas_Padroes ──");
const molasSheet = workbook.Sheets["Molas_Padroes"];
if (!molasSheet) {
  console.error("❌ Aba 'Molas_Padroes' não encontrada!");
  process.exit(1);
}
const molasRows: any[] = XLSX.utils.sheet_to_json(molasSheet, { defval: "" });
let molaOrdem = 1;
for (const row of molasRows) {
  const alturaTipo = String(Math.round(Number(row["AlturaTipo"] || 0)));
  const item = String(Math.round(Number(row["Item"] || 0)));
  const descricao = String(row["Descricao"] || "").trim();
  const padrao = String(row["Padrao"] || "").trim();
  const minimo = Number(row["Min"] || 0);
  const maximo = Number(row["Max"] || 0);
  const unidade = String(row["Unidade"] || "").trim();
  if (!descricao) continue;

  db.inspecoesPadroesMola.push({
    id: `PM-${String(molaOrdem).padStart(3, "0")}`,
    alturaTipo,
    item,
    descricao,
    padrao,
    minimo,
    maximo,
    unidade,
    ativo: true,
  } as any);
  molaOrdem++;
}
console.log(`   Padrões de mola: ${db.inspecoesPadroesMola.length}`);
console.log();

// ── 6. Parse Users sheet ──
console.log("── Importando aba Users ──");
const usersSheet = workbook.Sheets["Users"];
if (usersSheet) {
  const usersRows: any[] = XLSX.utils.sheet_to_json(usersSheet, { defval: "" });
  for (const row of usersRows) {
    const usuario = String(row["Usuario"] || "").trim();
    if (!usuario) continue;
    // Map each user to all sectors (can be refined later)
    for (const setor of bySetor.keys()) {
      db.inspecoesUsuarioSetor.push({
        id: `US-${usuario}-${setor.replace(/\s+/g, "_")}`,
        userId: usuario,
        setor,
      } as any);
    }
  }
  console.log(`   Usuários mapeados: ${usersRows.filter(r => r["Usuario"]).length}`);
  console.log(`   Mapeamentos usuario-setor: ${db.inspecoesUsuarioSetor.length}`);
} else {
  console.log("   ⚠️ Aba 'Users' não encontrada, pulando mapeamento.");
}
console.log();

// ── 7. Summary ──
console.log("── RESULTADO DA IMPORTAÇÃO ──");
console.log();
console.log(`  Setores:              ${bySetor.size}`);
console.log(`  Modelos/Checklists:   ${db.inspecoesModelos.length}`);
console.log(`  Itens de checklist:   ${totalItens}`);
console.log(`  Tipos de NC:          ${db.inspecoesTiposNc.length}`);
console.log(`  Padrões de mola:      ${db.inspecoesPadroesMola.length}`);
console.log(`  Máquinas:             01, 02, 03, 04`);
console.log();

// Validate
const errors: string[] = [];
if (bySetor.size < 15) errors.push(`Esperados >= 15 setores, encontrados ${bySetor.size}`);
if (totalItens < 180) errors.push(`Esperados >= 180 itens, encontrados ${totalItens}`);
if (db.inspecoesTiposNc.length < 160) errors.push(`Esperados >= 160 tipos NC, encontrados ${db.inspecoesTiposNc.length}`);
if (db.inspecoesPadroesMola.length < 16) errors.push(`Esperados >= 16 padrões mola, encontrados ${db.inspecoesPadroesMola.length}`);

if (errors.length > 0) {
  console.log("⚠️  ALERTAS:");
  for (const e of errors) console.log(`  - ${e}`);
} else {
  console.log("✅ Importação concluída com sucesso. Dados REAIS da planilha carregados.");
}

console.log();
console.log("── Detalhamento por setor ──");
for (const [setor, items] of bySetor) {
  const ncsCount = db.inspecoesTiposNc.filter((t: any) => t.setor === setor).length;
  console.log(`  ${setor.padEnd(22)} → ${items.length} itens, ${ncsCount} tipos NC`);
}

console.log();
console.log("── Padrões de mola ──");
const p130 = db.inspecoesPadroesMola.filter((p: any) => p.alturaTipo === "130").length;
const p200 = db.inspecoesPadroesMola.filter((p: any) => p.alturaTipo === "200").length;
console.log(`  Altura 130: ${p130} padrões`);
console.log(`  Altura 200: ${p200} padrões`);
console.log();
console.log("Importação finalizada.");
