#!/usr/bin/env node
/**
 * Official import script — reads the REAL Excel spreadsheet and populates:
 *   - Oracle INS_* tables (when Oracle is configured)
 *   - In-memory dataStore (fallback for local dev)
 *
 * Usage:
 *   npx tsx backend/scripts/import-inspecoes-planilha.ts [--force]
 */

import { db } from "../src/repositories/dataStore.js";
import { isOracleEnabled } from "../src/db/oracle.js";
import { initOraclePool } from "../src/db/oracle.js";
import { execDml, queryRows } from "../src/repositories/baseRepository.js";
import { ensureInspecoesTables } from "../src/repositories/inspecoes/initTables.js";
import * as XLSX from "xlsx";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { readFileSync } from "node:fs";
import { randomUUID } from "node:crypto";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const force = process.argv.includes("--force");

// ── NC setor mapping (sheet uses unaccented names) ──
const NC_SETOR_MAP: Record<string, string> = {
  ESPUMACAO: "ESPUMAÇÃO", "AREA DE CURA": "ÁREA DE CURA",
  FLOCADEIRA: "FLOCADEIRA", LAMINACAO: "LAMINAÇÃO",
  BORDADEIRA: "BORDADEIRA", ALMOXARIFADO: "ALMOXARIFADO",
  MOLA: "MOLA", "CORTE E COSTURA": "CORTE E COSTURA",
  ESTOFAMENTO: "ESTOFAMENTO", FECHAMENTO: "FECHAMENTO",
  EMBALAGEM: "EMBALAGEM", MARCENARIA: "MARCENARIA",
  TAPECARIA: "TAPEÇARIA", MOVEIS: "MÓVEIS",
  "EMBALAGEM DE BASE": "EMBALAGEM DE BASE",
};

// ── Audit log ──
interface ImportAudit {
  setores: number;
  modelos: number;
  itens: number;
  tiposNc: number;
  padroesMola: number;
  maquinas: number;
  usuarios: number;
  usuarioSetorVinculos: number;
  alertas: string[];
}
const audit: ImportAudit = {
  setores: 0, modelos: 0, itens: 0, tiposNc: 0,
  padroesMola: 0, maquinas: 4, usuarios: 0,
  usuarioSetorVinculos: 0, alertas: [],
};

console.log("╔══════════════════════════════════════════════════════════════╗");
console.log("║  IMPORTAÇÃO OFICIAL — INSPEÇÕES (Planilha Excel → Banco)   ║");
console.log("╚══════════════════════════════════════════════════════════════╝\n");

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
console.log(`   Abas encontradas: ${workbook.SheetNames.join(", ")}\n`);

// ── 2. Init Oracle if available ──
await initOraclePool();
const useOracle = isOracleEnabled();
console.log(`🔌 Oracle: ${useOracle ? "CONECTADO — dados serão gravados em tabelas reais" : "NÃO CONFIGURADO — fallback para dataStore em memória"}\n`);

if (useOracle) {
  await ensureInspecoesTables();
  if (force) {
    console.log("[FORCE] Limpando tabelas Oracle para reimportação...");
    for (const tbl of [
      "INS_IMPORT_LOG",
      "INS_MOLA_INSPECAO_AMOSTRA", "INS_MOLA_INSPECAO",
      "INS_EXECUCAO_ITEM_EVIDENCIA", "INS_EXECUCAO_ITEM", "INS_EXECUCAO",
      "INS_TIPO_NC", "INS_MODELO_CHECKLIST_ITEM", "INS_MODELO_CHECKLIST",
      "INS_MOLA_PADRAO", "INS_MOLA_MAQUINA", "INS_USUARIO_SETOR", "INS_SETOR",
    ]) {
      await execDml(`DELETE FROM ${tbl}`);
    }
    console.log();
  } else {
    const existing = await queryRows<{ CNT: number }>(`SELECT COUNT(*) AS CNT FROM INS_SETOR`);
    if ((existing[0] as any)?.CNT > 0) {
      console.log("⚠️  Dados já existem nas tabelas Oracle. Use --force para reimportar.");
      process.exit(0);
    }
  }
} else {
  if (force) {
    db.inspecoesModelos.length = 0;
    db.inspecoesExecucoes.length = 0;
    db.inspecoesTiposNc.length = 0;
    db.inspecoesPadroesMola.length = 0;
    db.inspecoesMola.length = 0;
    db.inspecoesUsuarioSetor.length = 0;
  }
  if (db.inspecoesModelos.length > 0 && !force) {
    console.log("⚠️  Dados já existem em memória. Use --force para reimportar.");
    process.exit(0);
  }
}

const now = new Date().toISOString();
let itemCounter = 0;

// ═══════════════════════════════════════════
// Helper: insert into Oracle or in-memory
// ═══════════════════════════════════════════

async function insertSetor(id: string, nome: string, ordem: number) {
  if (useOracle) {
    await execDml(
      `INSERT INTO INS_SETOR (ID, NOME, ORDEM, ATIVO) VALUES (:id, :nome, :ordem, 1)`,
      { id, nome, ordem },
    );
  }
}

interface ItemMeta {
  id: string;
  descricao: string;
  ordem: number;
  obrigatorio: boolean;
  exigeEvidencia: boolean;
  exigeTipoNc: boolean;
}

async function insertModelo(id: string, nome: string, setorId: string, setor: string, descricao: string, ordem: number, itens: ItemMeta[]) {
  if (useOracle) {
    await execDml(
      `INSERT INTO INS_MODELO_CHECKLIST (ID, NOME, SETOR_ID, DESCRICAO, ATIVO, ORDEM) VALUES (:id, :nome, :sid, :desc, 1, :ordem)`,
      { id, nome, sid: setorId, desc: descricao, ordem },
    );
    for (const item of itens) {
      await execDml(
        `INSERT INTO INS_MODELO_CHECKLIST_ITEM (ID, MODELO_ID, DESCRICAO, ORDEM, OBRIGATORIO, EXIGE_EVIDENCIA, EXIGE_TIPO_NC, ATIVO)
         VALUES (:id, :mid, :desc, :ordem, :obrig, :evid, :tnc, 1)`,
        {
          id: item.id, mid: id, desc: item.descricao, ordem: item.ordem,
          obrig: item.obrigatorio ? 1 : 0,
          evid: item.exigeEvidencia ? 1 : 0,
          tnc: item.exigeTipoNc ? 1 : 0,
        },
      );
    }
  } else {
    db.inspecoesModelos.push({
      id, nome, setor, descricao, ativo: true, ordem,
      itens: itens.map((i) => ({
        ...i,
        exigeEvidenciaNc: i.exigeEvidencia,
        exigeTipoNc: i.exigeTipoNc,
        ativo: true,
      })),
      createdAt: now, updatedAt: now,
    } as any);
  }
}

async function insertTipoNc(id: string, setorId: string | null, setor: string, nome: string, categoria: string) {
  if (useOracle) {
    await execDml(
      `INSERT INTO INS_TIPO_NC (ID, SETOR_ID, NOME, CATEGORIA, ATIVO) VALUES (:id, :sid, :nome, :cat, 1)`,
      { id, sid: setorId, nome, cat: categoria },
    );
  } else {
    db.inspecoesTiposNc.push({ id, setor, nome, categoria, ativo: true } as any);
  }
}

async function insertPadraoMola(id: string, alturaTipo: string, item: string, descricao: string, padrao: string, minimo: number, maximo: number, unidade: string) {
  if (useOracle) {
    await execDml(
      `INSERT INTO INS_MOLA_PADRAO (ID, ALTURA_TIPO, ITEM, DESCRICAO, PADRAO, MINIMO, MAXIMO, UNIDADE, ATIVO)
       VALUES (:id, :alt, :item, :desc, :pad, :min, :max, :uni, 1)`,
      { id, alt: alturaTipo, item, desc: descricao, pad: padrao, min: minimo, max: maximo, uni: unidade },
    );
  } else {
    db.inspecoesPadroesMola.push({ id, alturaTipo, item, descricao, padrao, minimo, maximo, unidade, ativo: true } as any);
  }
}

async function insertMaquina(id: string, codigo: string) {
  if (useOracle) {
    await execDml(
      `INSERT INTO INS_MOLA_MAQUINA (ID, CODIGO, DESCRICAO, ATIVO) VALUES (:id, :cod, :desc, 1)`,
      { id, cod: codigo, desc: `Máquina ${codigo}` },
    );
  }
}

async function insertUsuarioSetor(id: string, userId: string, setorId: string, setor: string) {
  if (useOracle) {
    await execDml(
      `INSERT INTO INS_USUARIO_SETOR (ID, USER_ID, SETOR_ID) VALUES (:id, :uid, :sid)`,
      { id, uid: userId, sid: setorId },
    );
  } else {
    db.inspecoesUsuarioSetor.push({ id, userId, setor } as any);
  }
}

// ═══════════════════════════════════════════
// 3. Parse Checklist sheet
// ═══════════════════════════════════════════
console.log("── Importando aba Checklist ──");
const checklistSheet = workbook.Sheets["Checklist"];
if (!checklistSheet) { console.error("❌ Aba 'Checklist' não encontrada!"); process.exit(1); }
const checklistRows: any[] = XLSX.utils.sheet_to_json(checklistSheet, { defval: "" });
console.log(`   Linhas brutas: ${checklistRows.length}`);

const bySetor = new Map<string, { item: string; descricao: string; obrigatorio: boolean | null; ordem: number | null; exigeEvidencia: boolean | null; exigeTipoNc: boolean | null }[]>();
let ignoredRows = 0;
for (const row of checklistRows) {
  const setorRaw = String(row["Setor"] || "").trim();
  const item = String(row["Item"] || "").trim();
  const descricao = String(row["Descrição"] || row["Descricao"] || "").trim();
  if (!setorRaw || !descricao) {
    if (setorRaw || item || descricao) {
      ignoredRows++;
      audit.alertas.push(`Linha ignorada (dados incompletos): setor="${setorRaw}" item="${item}" desc="${descricao.slice(0, 40)}..."`);
    }
    continue;
  }
  const clean = setorRaw.includes(" - ") ? setorRaw.split(" - ").slice(1).join(" - ") : setorRaw;

  // Parse real metadata from spreadsheet (when available)
  const obrigRaw = row["Obrigatorio? "] ?? row["Obrigatorio?"] ?? row["Obrigatorio"] ?? null;
  const ordemRaw = row["Ordem"] ?? null;
  const evidRaw = row["Exige Evidencia?"] ?? row["Exige Evidencia"] ?? row["ExigeEvidencia"] ?? null;
  const tncRaw = row["Exige Tipo NC?"] ?? row["Exige Tipo NC"] ?? row["ExigeTipoNC"] ?? null;

  const parseBool = (v: unknown): boolean | null => {
    if (v === null || v === undefined || v === "") return null;
    const s = String(v).toUpperCase().trim();
    return s === "SIM" || s === "S" || s === "TRUE" || s === "1" || v === true || v === 1;
  };

  const obrigatorio = parseBool(obrigRaw);
  const exigeEvidencia = parseBool(evidRaw);
  const exigeTipoNc = parseBool(tncRaw);
  const ordemExplicita = ordemRaw !== null && ordemRaw !== "" ? Number(ordemRaw) : null;

  if (!bySetor.has(clean)) bySetor.set(clean, []);
  bySetor.get(clean)!.push({ item, descricao, obrigatorio, ordem: ordemExplicita, exigeEvidencia, exigeTipoNc });
}

if (ignoredRows > 0) {
  console.log(`   ⚠️ Linhas ignoradas por dados incompletos: ${ignoredRows}`);
}

// Create setores
const setorIdMap = new Map<string, string>();
let setorOrdem = 1;
for (const setor of bySetor.keys()) {
  const setorId = `SET-${String(setorOrdem).padStart(3, "0")}`;
  setorIdMap.set(setor, setorId);
  await insertSetor(setorId, setor, setorOrdem);
  setorOrdem++;
}
audit.setores = bySetor.size;
console.log(`   Setores: ${bySetor.size}`);

// Create modelos + items with real metadata
let modeloOrdem = 1;
let totalItens = 0;
for (const [setor, items] of bySetor) {
  const setorId = setorIdMap.get(setor)!;
  const itens: ItemMeta[] = items.map((ci, idx) => {
    // Derive order: use explicit order from spreadsheet, else parse from Item column (e.g., "1.2" -> 2), else positional
    let ordem = ci.ordem;
    if (ordem === null) {
      const parts = ci.item.split(".");
      ordem = parts.length >= 2 ? parseInt(parts[parts.length - 1], 10) : idx + 1;
      if (isNaN(ordem)) ordem = idx + 1;
    }

    // Metadata fallback rules (use spreadsheet value when present, else fallback):
    // - obrigatorio: default TRUE (quality inspection items are obligatory)
    // - exigeTipoNc: default TRUE (NC type classification is standard)
    // - exigeEvidencia: default FALSE (evidence is optional, not mandatory)
    const obrigatorio = ci.obrigatorio !== null ? ci.obrigatorio : true;
    const exigeTipoNc = ci.exigeTipoNc !== null ? ci.exigeTipoNc : true;
    const exigeEvidencia = ci.exigeEvidencia !== null ? ci.exigeEvidencia : false;

    return {
      id: `ITEM-${String(++itemCounter).padStart(4, "0")}`,
      descricao: ci.descricao,
      ordem,
      obrigatorio,
      exigeEvidencia,
      exigeTipoNc,
    };
  });
  totalItens += itens.length;
  const modeloId = `MOD-${String(modeloOrdem).padStart(3, "0")}`;
  await insertModelo(modeloId, `Checklist ${setor}`, setorId, setor, `Checklist de inspeção do setor ${setor} — importado da planilha oficial`, modeloOrdem, itens);
  modeloOrdem++;
}
audit.modelos = bySetor.size;
audit.itens = totalItens;
console.log(`   Modelos criados: ${bySetor.size}`);
console.log(`   Itens de checklist: ${totalItens}\n`);

// ═══════════════════════════════════════════
// 4. Parse NC_PADROES sheet
// ═══════════════════════════════════════════
console.log("── Importando aba NC_PADROES ──");
const ncSheet = workbook.Sheets["NC_PADROES"];
if (!ncSheet) { console.error("❌ Aba 'NC_PADROES' não encontrada!"); process.exit(1); }
const ncRows: any[] = XLSX.utils.sheet_to_json(ncSheet, { defval: "" });
let ncOrdem = 1;
for (const row of ncRows) {
  const setorRaw = String(row["Setor"] || "").trim();
  const defeito = String(row["Defeito"] || "").trim();
  if (!setorRaw || !defeito) {
    if (setorRaw || defeito) audit.alertas.push(`NC ignorada: setor="${setorRaw}" defeito="${defeito}"`);
    continue;
  }
  const setor = NC_SETOR_MAP[setorRaw] || setorRaw;
  const setorId = setorIdMap.get(setor) ?? null;
  if (!setorId) {
    audit.alertas.push(`NC com setor não mapeado: "${setorRaw}" → "${setor}"`);
  }
  const ncId = `TNC-${String(ncOrdem).padStart(3, "0")}`;
  await insertTipoNc(ncId, setorId, setor, defeito, defeito === "OUTRO" ? "Outro" : "Processo");
  ncOrdem++;
}
audit.tiposNc = ncOrdem - 1;
console.log(`   Tipos de NC: ${ncOrdem - 1}\n`);

// ═══════════════════════════════════════════
// 5. Parse Molas_Padroes sheet
// ═══════════════════════════════════════════
console.log("── Importando aba Molas_Padroes ──");
const molasSheet = workbook.Sheets["Molas_Padroes"];
if (!molasSheet) { console.error("❌ Aba 'Molas_Padroes' não encontrada!"); process.exit(1); }
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
  if (!descricao) {
    audit.alertas.push(`Padrão mola ignorado: linha sem descrição`);
    continue;
  }
  const pmId = `PM-${String(molaOrdem).padStart(3, "0")}`;
  await insertPadraoMola(pmId, alturaTipo, item, descricao, padrao, minimo, maximo, unidade);
  molaOrdem++;
}
audit.padroesMola = molaOrdem - 1;
console.log(`   Padrões de mola: ${molaOrdem - 1}\n`);

// ═══════════════════════════════════════════
// 6. Insert machines
// ═══════════════════════════════════════════
console.log("── Consolidando máquinas de mola ──");
for (const cod of ["01", "02", "03", "04"]) {
  await insertMaquina(`MAQ-${cod}`, cod);
}
console.log(`   Máquinas: 01, 02, 03, 04\n`);

// ═══════════════════════════════════════════
// 7. Mine real user→sector mappings from execution history sheets
// ═══════════════════════════════════════════
console.log("── Minerando vínculos usuário↔setor do histórico real ──");
const userSectorMap = new Map<string, Set<string>>();
for (const sheetName of workbook.SheetNames) {
  // Sector-specific sheets follow pattern "N.0_-_SECTOR_NAME"
  const match = sheetName.match(/^\d+\.\d+\s*[-_]\s*/);
  if (!match) continue;
  const sectorSheet = workbook.Sheets[sheetName];
  if (!sectorSheet) continue;
  const sectorRows: any[] = XLSX.utils.sheet_to_json(sectorSheet, { defval: "" });
  for (const row of sectorRows) {
    const usuario = String(row["Usuario"] || "").trim();
    const setorRaw = String(row["Setor"] || "").trim();
    if (!usuario || !setorRaw) continue;
    const setorClean = setorRaw.includes(" - ") ? setorRaw.split(" - ").slice(1).join(" - ") : setorRaw;
    if (!userSectorMap.has(usuario)) userSectorMap.set(usuario, new Set());
    userSectorMap.get(usuario)!.add(setorClean);
  }
}
if (userSectorMap.size > 0) {
  console.log(`   Usuários encontrados no histórico: ${userSectorMap.size}`);
  for (const [user, sectors] of userSectorMap) {
    const sectorList = Array.from(sectors);
    console.log(`     ${user} → ${sectorList.join(", ")}`);
    for (const setor of sectorList) {
      const sid = setorIdMap.get(setor);
      if (sid) {
        await insertUsuarioSetor(`US-${user}-${setor.replace(/\s+/g, "_")}`, user, sid, setor);
        audit.usuarioSetorVinculos++;
      } else {
        audit.alertas.push(`Usuário "${user}": setor "${setor}" do histórico não encontrado nos setores importados`);
      }
    }
  }
} else {
  console.log("   ⚠️ Nenhum histórico de execução encontrado nas abas de setor.");
}

// ═══════════════════════════════════════════
// 8. Parse Users sheet — enrich with explicit mappings
// ═══════════════════════════════════════════
console.log("\n── Importando aba Users ──");
const usersSheet = workbook.Sheets["Users"];
if (usersSheet) {
  const usersRows: any[] = XLSX.utils.sheet_to_json(usersSheet, { defval: "" });
  const activeUsers: string[] = [];

  for (const row of usersRows) {
    const usuario = String(row["Usuario"] || "").trim();
    const ativo = String(row["Ativo?"] || row["Ativo"] || "").trim().toUpperCase();
    if (!usuario) continue;
    if (ativo === "NÃO" || ativo === "NAO" || ativo === "N") {
      audit.alertas.push(`Usuário "${usuario}" inativo — ignorado no mapeamento de setores`);
      continue;
    }
    activeUsers.push(usuario);
    audit.usuarios++;

    // Check if spreadsheet has explicit sector column for user
    const setorUsuario = String(row["Setor"] || row["Setores"] || "").trim();
    if (setorUsuario) {
      const setores = setorUsuario.split(",").map(s => s.trim()).filter(Boolean);
      for (const s of setores) {
        const mapped = NC_SETOR_MAP[s.toUpperCase()] || s;
        const sid = setorIdMap.get(mapped);
        if (sid) {
          // Avoid duplicates with history-mined mappings
          const existingKey = `US-${usuario}-${mapped.replace(/\s+/g, "_")}`;
          const alreadyMined = userSectorMap.get(usuario)?.has(mapped);
          if (!alreadyMined) {
            await insertUsuarioSetor(existingKey, usuario, sid, mapped);
            audit.usuarioSetorVinculos++;
          }
        } else {
          audit.alertas.push(`Usuário "${usuario}": setor "${s}" não encontrado nos setores importados`);
        }
      }
    }
    // Users without explicit sectors AND without history: no auto-assign.
    // Their access is controlled by RBAC profile rules on the backend.
    if (!setorUsuario && !userSectorMap.has(usuario)) {
      audit.alertas.push(`Usuário "${usuario}": sem setor explícito nem histórico — escopo via perfil RBAC`);
    }
  }

  console.log(`   Usuários ativos: ${activeUsers.length}`);
  console.log(`   Vínculos usuário-setor totais: ${audit.usuarioSetorVinculos}`);
} else {
  console.log("   ⚠️ Aba 'Users' não encontrada, pulando mapeamento.");
  audit.alertas.push("Aba 'Users' não encontrada na planilha");
}
console.log();

// ═══════════════════════════════════════════
// 9. Persist audit log
// ═══════════════════════════════════════════
if (useOracle) {
  const logId = `LOG-${Date.now()}`;
  await execDml(
    `INSERT INTO INS_IMPORT_LOG (ID, DATA_IMPORTACAO, SETORES, MODELOS, ITENS, TIPOS_NC, PADROES_MOLA, MAQUINAS, USUARIOS, VINCULOS_SETOR, ALERTAS)
     VALUES (:id, SYSTIMESTAMP, :set, :mod, :itens, :nc, :mola, :maq, :usr, :vinc, :alertas)`,
    {
      id: logId,
      set: audit.setores,
      mod: audit.modelos,
      itens: audit.itens,
      nc: audit.tiposNc,
      mola: audit.padroesMola,
      maq: audit.maquinas,
      usr: audit.usuarios,
      vinc: audit.usuarioSetorVinculos,
      alertas: audit.alertas.length > 0 ? audit.alertas.join("\n").slice(0, 3900) : null,
    },
  );
}

// ═══════════════════════════════════════════
// 10. Summary
// ═══════════════════════════════════════════
console.log("══ RESULTADO DA IMPORTAÇÃO ══\n");
console.log(`  Destino:              ${useOracle ? "Oracle (tabelas INS_*)" : "dataStore (memória)"}`);
console.log(`  Setores:              ${audit.setores}`);
console.log(`  Modelos/Checklists:   ${audit.modelos}`);
console.log(`  Itens de checklist:   ${audit.itens}`);
console.log(`  Tipos de NC:          ${audit.tiposNc}`);
console.log(`  Padrões de mola:      ${audit.padroesMola}`);
console.log(`  Máquinas:             01, 02, 03, 04`);
console.log(`  Usuários:             ${audit.usuarios}`);
console.log(`  Vínculos usr↔setor:   ${audit.usuarioSetorVinculos}`);
console.log();

const errors: string[] = [];
if (audit.setores < 15) errors.push(`Esperados >= 15 setores, encontrados ${audit.setores}`);
if (audit.itens < 180) errors.push(`Esperados >= 180 itens, encontrados ${audit.itens}`);
if (audit.tiposNc < 160) errors.push(`Esperados >= 160 tipos NC, encontrados ${audit.tiposNc}`);
if (audit.padroesMola < 16) errors.push(`Esperados >= 16 padrões mola, encontrados ${audit.padroesMola}`);

if (errors.length > 0) {
  console.log("⚠️  ALERTAS DE VALIDAÇÃO:");
  for (const e of errors) console.log(`  - ${e}`);
}

if (audit.alertas.length > 0) {
  console.log(`\n⚠️  ALERTAS DA IMPORTAÇÃO (${audit.alertas.length}):`);
  for (const a of audit.alertas.slice(0, 20)) console.log(`  - ${a}`);
  if (audit.alertas.length > 20) console.log(`  ... e mais ${audit.alertas.length - 20} alertas`);
} else {
  console.log("✅ Importação concluída sem alertas.");
}
console.log();

console.log("── Detalhamento por setor ──");
for (const [setor, items] of bySetor) {
  console.log(`  ${setor.padEnd(22)} → ${items.length} itens`);
}

console.log("\n── Regras de fallback aplicadas ──");
console.log("  obrigatorio:     valor da planilha quando preenchido; default = SIM");
console.log("  exigeTipoNc:     valor da planilha quando preenchido; default = SIM");
console.log("  exigeEvidencia:  valor da planilha quando preenchido; default = NÃO");
console.log("  ordem:           coluna 'Ordem' da planilha; fallback = número do Item (ex: 1.2 → 2)");

console.log("\nImportação finalizada.");
