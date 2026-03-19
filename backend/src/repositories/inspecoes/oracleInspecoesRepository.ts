/**
 * Oracle-backed repository for the Inspeções module.
 * When Oracle is enabled, queries real INS_* tables.
 * When Oracle is NOT enabled, falls back to in-memory dataStore (dev mode).
 */
import { queryRows, queryOne, execDml } from "../baseRepository.js";
import { isOracleEnabled } from "../../db/oracle.js";
import { db } from "../dataStore.js";
import { randomUUID } from "node:crypto";

function uid(prefix: string): string {
  return `${prefix}-${randomUUID().slice(0, 8)}`;
}

// ════════════════════════════════════════
// SETORES
// ════════════════════════════════════════

export async function listSetores(): Promise<string[]> {
  if (!isOracleEnabled()) {
    const s = new Set<string>();
    for (const m of db.inspecoesModelos) s.add((m as any).setor);
    return Array.from(s).sort();
  }
  const rows = await queryRows<{ NOME: string }>(
    `SELECT NOME FROM INS_SETOR WHERE ATIVO = 1 ORDER BY ORDEM`,
  );
  return rows.map((r) => r.NOME);
}

// ════════════════════════════════════════
// USUÁRIO-SETOR
// ════════════════════════════════════════

export async function listUsuarioSetor(): Promise<any[]> {
  if (!isOracleEnabled()) return db.inspecoesUsuarioSetor;
  const rows = await queryRows<{ ID: string; USER_ID: string; SETOR_ID: string }>(
    `SELECT us.ID, us.USER_ID, s.NOME AS SETOR
     FROM INS_USUARIO_SETOR us JOIN INS_SETOR s ON us.SETOR_ID = s.ID`,
  );
  return rows.map((r) => ({ id: r.ID, userId: r.USER_ID, setor: (r as any).SETOR }));
}

// Profile-based sector rules (server-side source of truth)
const PERFIL_SETOR_RULES: Record<string, string[] | "ALL"> = {
  ADMIN: "ALL",
  DIRETORIA: "ALL",
  QUALIDADE: "ALL",
  SAC: ["ALMOXARIFADO", "EMBALAGEM", "EMBALAGEM DE BASE"],
  ASSISTENCIA: ["FECHAMENTO", "ESTOFAMENTO", "TAPEÇARIA", "EMBALAGEM"],
  TECNICO: ["ESPUMAÇÃO", "ÁREA DE CURA", "FLOCADEIRA", "LAMINAÇÃO", "MOLA", "BORDADEIRA", "CORTE E COSTURA", "MARCENARIA", "TAPEÇARIA", "FECHAMENTO", "ESTOFAMENTO"],
  ALMOX: ["ALMOXARIFADO"],
  AUDITOR: "ALL",
  VALIDACAO: "ALL",
  INSPECAO: "ALL",
};

export async function getSetoresByUserId(userId: string, perfil?: string): Promise<string[]> {
  // 1. Try explicit user-sector mappings first
  let mapped: string[] = [];
  if (!isOracleEnabled()) {
    mapped = db.inspecoesUsuarioSetor
      .filter((us: any) => us.userId === userId)
      .map((us: any) => us.setor);
  } else {
    const rows = await queryRows<{ NOME: string }>(
      `SELECT s.NOME FROM INS_USUARIO_SETOR us JOIN INS_SETOR s ON us.SETOR_ID = s.ID WHERE us.USER_ID = :userId`,
      { userId },
    );
    mapped = rows.map((r) => r.NOME);
  }

  // 2. If explicit mappings exist, use them
  if (mapped.length > 0) return mapped;

  // 3. Fallback: profile-based rules (server-side SETOR_PERMITIDO)
  if (perfil) {
    const rule = PERFIL_SETOR_RULES[perfil.toUpperCase()];
    if (rule === "ALL") return listSetores();
    if (rule) return rule;
  }

  // 4. No profile provided and no mappings → return all sectors
  return listSetores();
}

export async function addUsuarioSetor(data: any): Promise<any> {
  const id = data.id ?? uid("US");
  if (!isOracleEnabled()) {
    const item = { ...data, id };
    db.inspecoesUsuarioSetor.push(item);
    return item;
  }
  // Find setor ID by name
  const setor = await queryOne<{ ID: string }>(
    `SELECT ID FROM INS_SETOR WHERE NOME = :nome`, { nome: data.setor },
  );
  if (!setor) throw new Error(`Setor not found: ${data.setor}`);
  await execDml(
    `INSERT INTO INS_USUARIO_SETOR (ID, USER_ID, SETOR_ID) VALUES (:id, :userId, :setorId)`,
    { id, userId: data.userId, setorId: setor.ID },
  );
  return { id, userId: data.userId, setor: data.setor };
}

export async function removeUsuarioSetor(id: string): Promise<boolean> {
  if (!isOracleEnabled()) {
    const idx = db.inspecoesUsuarioSetor.findIndex((us: any) => us.id === id);
    if (idx === -1) return false;
    db.inspecoesUsuarioSetor.splice(idx, 1);
    return true;
  }
  await execDml(`DELETE FROM INS_USUARIO_SETOR WHERE ID = :id`, { id });
  return true;
}

// ════════════════════════════════════════
// MODELOS
// ════════════════════════════════════════

export async function listModelos(): Promise<any[]> {
  if (!isOracleEnabled()) return db.inspecoesModelos;
  const modelos = await queryRows<any>(
    `SELECT m.ID, m.NOME, s.NOME AS SETOR, m.DESCRICAO, m.ATIVO, m.ORDEM,
            TO_CHAR(m.CREATED_AT,'YYYY-MM-DD"T"HH24:MI:SS') AS CREATED_AT,
            TO_CHAR(m.UPDATED_AT,'YYYY-MM-DD"T"HH24:MI:SS') AS UPDATED_AT
     FROM INS_MODELO_CHECKLIST m JOIN INS_SETOR s ON m.SETOR_ID = s.ID
     ORDER BY m.ORDEM`,
  );
  // Attach items
  for (const mod of modelos) {
    const items = await queryRows<any>(
      `SELECT ID, DESCRICAO, ORDEM, OBRIGATORIO, EXIGE_EVIDENCIA AS EXIGE_EVIDENCIA_NC,
              EXIGE_TIPO_NC, ATIVO
       FROM INS_MODELO_CHECKLIST_ITEM WHERE MODELO_ID = :modeloId ORDER BY ORDEM`,
      { modeloId: mod.ID },
    );
    mod.id = mod.ID;
    mod.nome = mod.NOME;
    mod.setor = mod.SETOR;
    mod.descricao = mod.DESCRICAO;
    mod.ativo = mod.ATIVO === 1;
    mod.ordem = mod.ORDEM;
    mod.createdAt = mod.CREATED_AT;
    mod.updatedAt = mod.UPDATED_AT;
    mod.itens = items.map((i: any) => ({
      id: i.ID,
      descricao: i.DESCRICAO,
      ordem: i.ORDEM,
      obrigatorio: i.OBRIGATORIO === 1,
      exigeEvidenciaNc: i.EXIGE_EVIDENCIA_NC === 1,
      exigeTipoNc: i.EXIGE_TIPO_NC === 1,
      ativo: i.ATIVO === 1,
    }));
  }
  return modelos;
}

export async function getModeloById(id: string): Promise<any | null> {
  if (!isOracleEnabled()) return db.inspecoesModelos.find((m: any) => m.id === id) ?? null;
  const all = await listModelos();
  return all.find((m: any) => m.id === id) ?? null;
}

export async function createModelo(data: any): Promise<any> {
  const id = data.id ?? uid("MOD");
  if (!isOracleEnabled()) {
    const item = { ...data, id };
    db.inspecoesModelos.push(item);
    return item;
  }
  const setor = await queryOne<{ ID: string }>(
    `SELECT ID FROM INS_SETOR WHERE NOME = :nome`, { nome: data.setor },
  );
  if (!setor) throw new Error(`Setor not found: ${data.setor}`);
  await execDml(
    `INSERT INTO INS_MODELO_CHECKLIST (ID, NOME, SETOR_ID, DESCRICAO, ATIVO, ORDEM)
     VALUES (:id, :nome, :setorId, :descricao, :ativo, :ordem)`,
    { id, nome: data.nome, setorId: setor.ID, descricao: data.descricao ?? '', ativo: data.ativo ? 1 : 0, ordem: data.ordem ?? 1 },
  );
  if (data.itens?.length) {
    for (const item of data.itens) {
      const itemId = item.id ?? uid("ITEM");
      await execDml(
        `INSERT INTO INS_MODELO_CHECKLIST_ITEM (ID, MODELO_ID, DESCRICAO, ORDEM, OBRIGATORIO, EXIGE_EVIDENCIA, EXIGE_TIPO_NC, ATIVO)
         VALUES (:id, :modeloId, :descricao, :ordem, :obrig, :evid, :tnc, :ativo)`,
        { id: itemId, modeloId: id, descricao: item.descricao, ordem: item.ordem ?? 1, obrig: item.obrigatorio ? 1 : 0, evid: item.exigeEvidenciaNc ? 1 : 0, tnc: item.exigeTipoNc ? 1 : 0, ativo: item.ativo !== false ? 1 : 0 },
      );
    }
  }
  return { ...data, id };
}

export async function updateModelo(id: string, data: any): Promise<any | null> {
  if (!isOracleEnabled()) {
    const idx = db.inspecoesModelos.findIndex((m: any) => m.id === id);
    if (idx === -1) return null;
    db.inspecoesModelos[idx] = { ...db.inspecoesModelos[idx], ...(data as any), id };
    return db.inspecoesModelos[idx];
  }
  await execDml(
    `UPDATE INS_MODELO_CHECKLIST SET NOME = :nome, DESCRICAO = :descricao, ATIVO = :ativo, UPDATED_AT = SYSTIMESTAMP WHERE ID = :id`,
    { id, nome: data.nome, descricao: data.descricao ?? '', ativo: data.ativo ? 1 : 0 },
  );
  return getModeloById(id);
}

// ════════════════════════════════════════
// EXECUÇÕES
// ════════════════════════════════════════

export async function listExecucoes(): Promise<any[]> {
  if (!isOracleEnabled()) return db.inspecoesExecucoes;
  const rows = await queryRows<any>(
    `SELECT e.ID, e.MODELO_ID, s.NOME AS SETOR, e.INSPETOR, e.STATUS,
            TO_CHAR(e.DATA_INICIO,'YYYY-MM-DD"T"HH24:MI:SS') AS DATA_INICIO,
            TO_CHAR(e.DATA_FIM,'YYYY-MM-DD"T"HH24:MI:SS') AS DATA_FIM,
            e.OBSERVACOES,
            TO_CHAR(e.CREATED_AT,'YYYY-MM-DD"T"HH24:MI:SS') AS CREATED_AT
     FROM INS_EXECUCAO e JOIN INS_SETOR s ON e.SETOR_ID = s.ID
     ORDER BY e.DATA_INICIO DESC`,
  );
  for (const row of rows) {
    const items = await queryRows<any>(
      `SELECT ei.ID, ei.ITEM_ID, ei.STATUS, ei.TIPO_NC_ID, ei.OBSERVACAO
       FROM INS_EXECUCAO_ITEM ei WHERE ei.EXECUCAO_ID = :execId`,
      { execId: row.ID },
    );
    // Attach evidências per item
    for (const item of items) {
      const evids = await queryRows<any>(
        `SELECT ID, ARQUIVO_URL, ARQUIVO_NOME, TIPO_MIME FROM INS_EXECUCAO_ITEM_EVIDENCIA WHERE EXEC_ITEM_ID = :itemId`,
        { itemId: item.ID },
      );
      item.evidencias = evids.map((e: any) => ({
        id: e.ID, arquivoUrl: e.ARQUIVO_URL, arquivoNome: e.ARQUIVO_NOME, tipoMime: e.TIPO_MIME,
      }));
    }
    row.id = row.ID;
    row.modeloId = row.MODELO_ID;
    row.setor = row.SETOR;
    row.inspetor = row.INSPETOR;
    row.status = row.STATUS;
    row.dataInicio = row.DATA_INICIO;
    row.dataFim = row.DATA_FIM;
    row.observacoes = row.OBSERVACOES;
    row.createdAt = row.CREATED_AT;
    row.itens = items.map((i: any) => ({
      id: i.ID, itemId: i.ITEM_ID, status: i.STATUS, tipoNcId: i.TIPO_NC_ID, observacao: i.OBSERVACAO, evidencias: i.evidencias,
    }));
  }
  return rows;
}

export async function getExecucaoById(id: string): Promise<any | null> {
  if (!isOracleEnabled()) return db.inspecoesExecucoes.find((e: any) => e.id === id) ?? null;
  const all = await listExecucoes();
  return all.find((e: any) => e.id === id) ?? null;
}

export async function createExecucao(data: any): Promise<any> {
  const id = data.id ?? uid("EXEC");
  if (!isOracleEnabled()) {
    const item = { ...data, id };
    db.inspecoesExecucoes.push(item);
    return item;
  }
  const setor = await queryOne<{ ID: string }>(
    `SELECT ID FROM INS_SETOR WHERE NOME = :nome`, { nome: data.setor },
  );
  if (!setor) throw new Error(`Setor not found: ${data.setor}`);
  await execDml(
    `INSERT INTO INS_EXECUCAO (ID, MODELO_ID, SETOR_ID, INSPETOR, STATUS, OBSERVACOES)
     VALUES (:id, :modeloId, :setorId, :inspetor, :status, :obs)`,
    { id, modeloId: data.modeloId, setorId: setor.ID, inspetor: data.inspetor ?? '', status: data.status ?? 'EM_ANDAMENTO', obs: data.observacoes ?? '' },
  );
  if (data.itens?.length) {
    for (const item of data.itens) {
      const itemId = item.id ?? uid("EI");
      await execDml(
        `INSERT INTO INS_EXECUCAO_ITEM (ID, EXECUCAO_ID, ITEM_ID, STATUS, TIPO_NC_ID, OBSERVACAO)
         VALUES (:id, :execId, :itemId, :status, :tipoNcId, :obs)`,
        { id: itemId, execId: id, itemId: item.itemId, status: item.status, tipoNcId: item.tipoNcId ?? null, obs: item.observacao ?? '' },
      );
      if (item.evidencias?.length) {
        for (const ev of item.evidencias) {
          await execDml(
            `INSERT INTO INS_EXECUCAO_ITEM_EVIDENCIA (ID, EXEC_ITEM_ID, ARQUIVO_URL, ARQUIVO_NOME, TIPO_MIME)
             VALUES (:id, :eiId, :url, :nome, :mime)`,
            { id: ev.id ?? uid("EV"), eiId: itemId, url: ev.arquivoUrl, nome: ev.arquivoNome ?? '', mime: ev.tipoMime ?? '' },
          );
        }
      }
    }
  }
  return { ...data, id };
}

// ════════════════════════════════════════
// TIPOS NC
// ════════════════════════════════════════

export async function listTiposNc(): Promise<any[]> {
  if (!isOracleEnabled()) return db.inspecoesTiposNc;
  const rows = await queryRows<any>(
    `SELECT t.ID, s.NOME AS SETOR, t.NOME, t.CATEGORIA, t.ATIVO
     FROM INS_TIPO_NC t LEFT JOIN INS_SETOR s ON t.SETOR_ID = s.ID
     ORDER BY s.NOME, t.NOME`,
  );
  return rows.map((r: any) => ({
    id: r.ID, setor: r.SETOR, nome: r.NOME, categoria: r.CATEGORIA, ativo: r.ATIVO === 1,
  }));
}

export async function createTipoNc(data: any): Promise<any> {
  const id = data.id ?? uid("TNC");
  if (!isOracleEnabled()) {
    const item = { ...data, id };
    db.inspecoesTiposNc.push(item);
    return item;
  }
  const setor = await queryOne<{ ID: string }>(
    `SELECT ID FROM INS_SETOR WHERE NOME = :nome`, { nome: data.setor },
  );
  await execDml(
    `INSERT INTO INS_TIPO_NC (ID, SETOR_ID, NOME, CATEGORIA, ATIVO) VALUES (:id, :setorId, :nome, :cat, :ativo)`,
    { id, setorId: setor?.ID ?? null, nome: data.nome, cat: data.categoria ?? 'Processo', ativo: data.ativo !== false ? 1 : 0 },
  );
  return { ...data, id };
}

export async function updateTipoNc(id: string, data: any): Promise<any | null> {
  if (!isOracleEnabled()) {
    const idx = db.inspecoesTiposNc.findIndex((t: any) => t.id === id);
    if (idx === -1) return null;
    db.inspecoesTiposNc[idx] = { ...db.inspecoesTiposNc[idx], ...(data as any), id };
    return db.inspecoesTiposNc[idx];
  }
  await execDml(
    `UPDATE INS_TIPO_NC SET NOME = :nome, CATEGORIA = :cat, ATIVO = :ativo WHERE ID = :id`,
    { id, nome: data.nome, cat: data.categoria ?? 'Processo', ativo: data.ativo ? 1 : 0 },
  );
  return { ...data, id };
}

// ════════════════════════════════════════
// PADRÕES DE MOLA
// ════════════════════════════════════════

export async function listPadroesMola(): Promise<any[]> {
  if (!isOracleEnabled()) return db.inspecoesPadroesMola;
  const rows = await queryRows<any>(
    `SELECT ID, ALTURA_TIPO, ITEM, DESCRICAO, PADRAO, MINIMO, MAXIMO, UNIDADE, ATIVO
     FROM INS_MOLA_PADRAO ORDER BY ALTURA_TIPO, ITEM`,
  );
  return rows.map((r: any) => ({
    id: r.ID, alturaTipo: r.ALTURA_TIPO, item: r.ITEM, descricao: r.DESCRICAO,
    padrao: r.PADRAO, minimo: r.MINIMO, maximo: r.MAXIMO, unidade: r.UNIDADE, ativo: r.ATIVO === 1,
  }));
}

export async function createPadraoMola(data: any): Promise<any> {
  const id = data.id ?? uid("PM");
  if (!isOracleEnabled()) {
    const item = { ...data, id };
    db.inspecoesPadroesMola.push(item);
    return item;
  }
  await execDml(
    `INSERT INTO INS_MOLA_PADRAO (ID, ALTURA_TIPO, ITEM, DESCRICAO, PADRAO, MINIMO, MAXIMO, UNIDADE, ATIVO)
     VALUES (:id, :alt, :item, :desc, :pad, :min, :max, :uni, :ativo)`,
    { id, alt: data.alturaTipo, item: data.item ?? '', desc: data.descricao, pad: data.padrao ?? '', min: data.minimo ?? 0, max: data.maximo ?? 0, uni: data.unidade ?? '', ativo: data.ativo !== false ? 1 : 0 },
  );
  return { ...data, id };
}

export async function updatePadraoMola(id: string, data: any): Promise<any | null> {
  if (!isOracleEnabled()) {
    const idx = db.inspecoesPadroesMola.findIndex((p: any) => p.id === id);
    if (idx === -1) return null;
    db.inspecoesPadroesMola[idx] = { ...db.inspecoesPadroesMola[idx], ...(data as any), id };
    return db.inspecoesPadroesMola[idx];
  }
  await execDml(
    `UPDATE INS_MOLA_PADRAO SET DESCRICAO = :desc, PADRAO = :pad, MINIMO = :min, MAXIMO = :max, UNIDADE = :uni, ATIVO = :ativo WHERE ID = :id`,
    { id, desc: data.descricao, pad: data.padrao ?? '', min: data.minimo ?? 0, max: data.maximo ?? 0, uni: data.unidade ?? '', ativo: data.ativo ? 1 : 0 },
  );
  return { ...data, id };
}

// ════════════════════════════════════════
// INSPEÇÕES DE MOLA
// ════════════════════════════════════════

export async function listInspecoesMola(): Promise<any[]> {
  if (!isOracleEnabled()) return db.inspecoesMola;
  const rows = await queryRows<any>(
    `SELECT i.ID, m.CODIGO AS MAQUINA, i.INSPETOR, i.STATUS, i.MAQUINA_PARADA,
            TO_CHAR(i.DATA_INSPECAO,'YYYY-MM-DD"T"HH24:MI:SS') AS DATA_INSPECAO,
            i.OBSERVACOES
     FROM INS_MOLA_INSPECAO i JOIN INS_MOLA_MAQUINA m ON i.MAQUINA_ID = m.ID
     ORDER BY i.DATA_INSPECAO DESC`,
  );
  for (const row of rows) {
    const amostras = await queryRows<any>(
      `SELECT a.ID, p.DESCRICAO AS PADRAO_DESC, a.VALOR_MEDIDO, a.CONFORME, a.OBSERVACAO
       FROM INS_MOLA_INSPECAO_AMOSTRA a JOIN INS_MOLA_PADRAO p ON a.PADRAO_ID = p.ID
       WHERE a.INSPECAO_ID = :insId`,
      { insId: row.ID },
    );
    row.id = row.ID;
    row.maquina = row.MAQUINA;
    row.inspetor = row.INSPETOR;
    row.status = row.STATUS;
    row.maquinaParada = row.MAQUINA_PARADA === 1;
    row.dataInspecao = row.DATA_INSPECAO;
    row.observacoes = row.OBSERVACOES;
    row.amostras = amostras.map((a: any) => ({
      id: a.ID, padraoDesc: a.PADRAO_DESC, valorMedido: a.VALOR_MEDIDO, conforme: a.CONFORME === 1, observacao: a.OBSERVACAO,
    }));
  }
  return rows;
}

export async function getInspecaoMolaById(id: string): Promise<any | null> {
  if (!isOracleEnabled()) return db.inspecoesMola.find((m: any) => m.id === id) ?? null;
  const all = await listInspecoesMola();
  return all.find((m: any) => m.id === id) ?? null;
}

export async function createInspecaoMola(data: any): Promise<any> {
  const id = data.id ?? uid("MOLA");
  if (!isOracleEnabled()) {
    const item = { ...data, id };
    db.inspecoesMola.push(item);
    return item;
  }
  const maq = await queryOne<{ ID: string }>(
    `SELECT ID FROM INS_MOLA_MAQUINA WHERE CODIGO = :codigo`, { codigo: data.maquina },
  );
  if (!maq) throw new Error(`Máquina not found: ${data.maquina}`);
  await execDml(
    `INSERT INTO INS_MOLA_INSPECAO (ID, MAQUINA_ID, INSPETOR, STATUS, MAQUINA_PARADA, OBSERVACOES)
     VALUES (:id, :maqId, :insp, :status, :parada, :obs)`,
    { id, maqId: maq.ID, insp: data.inspetor ?? '', status: data.status ?? 'EM_ANDAMENTO', parada: data.maquinaParada ? 1 : 0, obs: data.observacoes ?? '' },
  );
  if (data.amostras?.length) {
    for (const am of data.amostras) {
      await execDml(
        `INSERT INTO INS_MOLA_INSPECAO_AMOSTRA (ID, INSPECAO_ID, PADRAO_ID, VALOR_MEDIDO, CONFORME, OBSERVACAO)
         VALUES (:id, :insId, :padId, :val, :conf, :obs)`,
        { id: am.id ?? uid("AMS"), insId: id, padId: am.padraoId, val: am.valorMedido ?? null, conf: am.conforme ? 1 : 0, obs: am.observacao ?? '' },
      );
    }
  }
  return { ...data, id };
}

// ════════════════════════════════════════
// MÁQUINAS DE MOLA
// ════════════════════════════════════════

export async function listMaquinasMola(): Promise<any[]> {
  if (!isOracleEnabled()) return [
    { id: "MAQ-01", codigo: "01", descricao: "Máquina 01", ativo: true },
    { id: "MAQ-02", codigo: "02", descricao: "Máquina 02", ativo: true },
    { id: "MAQ-03", codigo: "03", descricao: "Máquina 03", ativo: true },
    { id: "MAQ-04", codigo: "04", descricao: "Máquina 04", ativo: true },
  ];
  const rows = await queryRows<any>(
    `SELECT ID, CODIGO, DESCRICAO, ATIVO FROM INS_MOLA_MAQUINA ORDER BY CODIGO`,
  );
  return rows.map((r: any) => ({
    id: r.ID, codigo: r.CODIGO, descricao: r.DESCRICAO, ativo: r.ATIVO === 1,
  }));
}
