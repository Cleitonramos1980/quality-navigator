
import { appendAudit, db } from "./dataStore.js";
import {
  getSesmtModuleDefinition,
  SESMT_EXECUTIVE_VIEWS,
  SESMT_MENU_TREE,
  SESMT_MODULE_DEFINITIONS,
} from "./sesmtCatalog.js";
import {
  validateSesmtSpecificData,
  validateSpecificFieldKey,
} from "./sesmtFormSchemaCatalog.js";
import type {
  SesmtAttachment,
  SesmtEvidence,
  SesmtFavoritePreset,
  SesmtRecord,
  SesmtRecordListResult,
} from "../types/sesmt.js";

const ALL_UNITS = ["MAO", "BEL", "AGR"];

const READ_PROFILES = new Set([
  "ADMIN",
  "CORPORATIVO_SST",
  "SESMT",
  "TECNICO_SEGURANCA",
  "ENFERMAGEM_TRABALHO",
  "MEDICO_TRABALHO",
  "RH",
  "GESTOR_UNIDADE",
  "AUDITOR",
  "DIRETORIA",
  "LEITOR_RESTRITO",
  "GESTOR_CONTRATOS",
  "TERCEIRO_CONSULTA_LIMITADA",
  "LIDER_OPERACIONAL",
  "RH_OCUPACIONAL",
  "COMITE_SST",
  "DIRETOR_EXECUTIVO_SST",
  "QUALIDADE",
  "ASSISTENCIA",
  "SAC",
]);

const WRITE_PROFILES = new Set([
  "ADMIN",
  "CORPORATIVO_SST",
  "SESMT",
  "TECNICO_SEGURANCA",
  "ENFERMAGEM_TRABALHO",
  "MEDICO_TRABALHO",
  "RH",
  "GESTOR_UNIDADE",
  "GESTOR_CONTRATOS",
  "LIDER_OPERACIONAL",
  "RH_OCUPACIONAL",
  "COMITE_SST",
  "DIRETOR_EXECUTIVO_SST",
]);

const SENSITIVE_HEALTH_READ_PROFILES = new Set([
  "ADMIN",
  "CORPORATIVO_SST",
  "SESMT",
  "MEDICO_TRABALHO",
  "ENFERMAGEM_TRABALHO",
  "RH_OCUPACIONAL",
  "DIRETOR_EXECUTIVO_SST",
]);

const SENSITIVE_HEALTH_WRITE_PROFILES = new Set([
  "ADMIN",
  "CORPORATIVO_SST",
  "SESMT",
  "MEDICO_TRABALHO",
  "ENFERMAGEM_TRABALHO",
  "RH_OCUPACIONAL",
]);

const RESTRICTED_UNIT_PROFILES = new Set(["GESTOR_UNIDADE", "LIDER_OPERACIONAL", "TERCEIRO_CONSULTA_LIMITADA"]);

function ensureStore(): any {
  if (!db.sesmt || typeof db.sesmt !== "object") {
    (db as any).sesmt = {
      registros: [],
      acessosSensiveis: [],
      custos: [],
      documentosControlados: [],
      indicadores: [],
      unidades: [],
      setores: [],
      cargos: [],
      funcoes: [],
      colaboradores: [],
      profissionaisSesmt: [],
      dimensionamentoSesmt: [],
      requisitosLegais: [],
      cadastrosAuxiliares: [],
      bibliotecaTecnica: [],
      favoritePresets: [],
    };
  }

  if (!Array.isArray(db.sesmt.registros)) db.sesmt.registros = [];
  if (!Array.isArray(db.sesmt.acessosSensiveis)) db.sesmt.acessosSensiveis = [];
  if (!Array.isArray(db.sesmt.favoritePresets)) db.sesmt.favoritePresets = [];

  return db.sesmt;
}

function nowIso(): string {
  return new Date().toISOString();
}

function hashText(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function getAllowedUnits(profile: string, userId: string): string[] {
  if (!RESTRICTED_UNIT_PROFILES.has(profile)) return ALL_UNITS;
  const idx = hashText(userId || profile) % ALL_UNITS.length;
  return [ALL_UNITS[idx]];
}

function assertRead(profile: string): void {
  if (!READ_PROFILES.has(profile)) {
    throw Object.assign(new Error("Perfil sem acesso ao modulo SESMT/SST."), { statusCode: 403 });
  }
}

function assertSensitiveRead(profile: string, moduleKey: string, userName: string): void {
  if (!SENSITIVE_HEALTH_READ_PROFILES.has(profile)) {
    throw Object.assign(new Error("Perfil sem acesso a dados ocupacionais sensiveis."), { statusCode: 403 });
  }
  const store = ensureStore();
  store.acessosSensiveis.unshift({
    id: `SENS-${String(store.acessosSensiveis.length + 1).padStart(4, "0")}`,
    data: nowIso(),
    usuario: userName,
    perfil: profile,
    moduleKey,
    acao: "LEITURA_SENSIVEL",
  });
  appendAudit("ACESSO_SENSIVEL", "SESMT_SAUDE", moduleKey, `Acesso sensivel de ${userName} (${profile})`, userName);
}

function assertWrite(profile: string, isSensitive: boolean): void {
  if (!WRITE_PROFILES.has(profile)) {
    throw Object.assign(new Error("Perfil sem permissao de escrita no modulo SESMT/SST."), { statusCode: 403 });
  }
  if (isSensitive && !SENSITIVE_HEALTH_WRITE_PROFILES.has(profile)) {
    throw Object.assign(new Error("Perfil sem permissao de escrita para dados de saude ocupacional."), { statusCode: 403 });
  }
}

function normalizeNumber(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim().length > 0) {
    const parsed = Number(value.replace(",", "."));
    if (Number.isFinite(parsed)) return parsed;
  }
  return undefined;
}

function buildHistoryEntry(acao: string, descricao: string, usuario: string) {
  return {
    id: `HIS-${Math.floor(Math.random() * 1_000_000)}`,
    data: nowIso(),
    usuario,
    acao,
    descricao,
  };
}

function cleanString(value: unknown): string | undefined {
  if (value == null) return undefined;
  const normalized = String(value).trim();
  return normalized.length > 0 ? normalized : undefined;
}

function normalizeSpecificValue(value: unknown): string | number | boolean | null | undefined {
  if (value === null) return null;
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return Number.isFinite(value) ? value : undefined;
  if (typeof value === "string") {
    const normalized = value.trim();
    return normalized.length > 0 ? normalized : null;
  }
  return undefined;
}

function normalizeSpecificData(
  payloadValue: unknown,
  priorValue?: SesmtRecord["dadosEspecificos"],
): SesmtRecord["dadosEspecificos"] {
  const merged: Record<string, string | number | boolean | null> = { ...(priorValue || {}) };
  if (!payloadValue || typeof payloadValue !== "object" || Array.isArray(payloadValue)) {
    return Object.keys(merged).length > 0 ? merged : undefined;
  }

  for (const [key, value] of Object.entries(payloadValue as Record<string, unknown>)) {
    const normalized = normalizeSpecificValue(value);
    if (normalized === undefined) continue;
    merged[key] = normalized;
  }

  return Object.keys(merged).length > 0 ? merged : undefined;
}

function normalizeSpecificFilters(value: unknown): Record<string, string> | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) return undefined;
  const entries = Object.entries(value as Record<string, unknown>)
    .map(([key, raw]) => [key, String(raw ?? "").trim()] as const)
    .filter(([, normalized]) => normalized.length > 0);
  return entries.length > 0 ? Object.fromEntries(entries) : undefined;
}

function normalizeSortDir(value: unknown, fallback: "asc" | "desc" = "desc"): "asc" | "desc" {
  const normalized = cleanString(value)?.toLowerCase();
  if (normalized === "asc" || normalized === "desc") return normalized;
  return fallback;
}

function applyUnitFilter(records: SesmtRecord[], allowedUnits: string[]): SesmtRecord[] {
  if (allowedUnits.length === 0) return [];
  return records.filter((record) => allowedUnits.includes(record.unidade));
}

function sortRecords(records: SesmtRecord[], sortBy?: string, sortDir: "asc" | "desc" = "desc"): SesmtRecord[] {
  const getSortValue = (record: SesmtRecord, key?: string): unknown => {
    if (!key || key === "updatedAt") return record.updatedAt;
    if (key.startsWith("specific:")) {
      const specificKey = key.slice("specific:".length);
      return record.dadosEspecificos?.[specificKey];
    }
    return (record as any)[key];
  };

  const normalizeSortValue = (value: unknown): string | number => {
    if (value == null) return "";
    if (typeof value === "number") return Number.isFinite(value) ? value : "";
    if (typeof value === "boolean") return value ? 1 : 0;

    const text = String(value).trim();
    if (text.length === 0) return "";

    if (/^-?\d+(?:[.,]\d+)?$/.test(text)) {
      const parsedNumber = Number(text.replace(",", "."));
      if (Number.isFinite(parsedNumber)) return parsedNumber;
    }

    if (/^\d{4}-\d{2}-\d{2}(?:[T ][\d:.+-Z]*)?$/.test(text)) {
      const timestamp = Date.parse(text);
      if (!Number.isNaN(timestamp)) return timestamp;
    }

    return text.toLowerCase();
  };

  const sorted = [...records];
  sorted.sort((a, b) => {
    const va = normalizeSortValue(getSortValue(a, sortBy));
    const vb = normalizeSortValue(getSortValue(b, sortBy));
    if (typeof va === "number" && typeof vb === "number") {
      return sortDir === "asc" ? va - vb : vb - va;
    }
    const sa = String(va);
    const sb = String(vb);
    const compared = sortDir === "asc" ? sa.localeCompare(sb) : sb.localeCompare(sa);
    if (compared !== 0) return compared;
    return sortDir === "asc"
      ? String(a.updatedAt || "").localeCompare(String(b.updatedAt || ""))
      : String(b.updatedAt || "").localeCompare(String(a.updatedAt || ""));
  });
  return sorted;
}

function monthsBack(amount: number): string[] {
  const result: string[] = [];
  const date = new Date();
  date.setDate(1);
  for (let i = amount - 1; i >= 0; i -= 1) {
    const d = new Date(date);
    d.setMonth(d.getMonth() - i);
    result.push(d.toISOString().slice(0, 7));
  }
  return result;
}

function mapRecordInput(moduleKey: string, payload: any, userName: string, existing?: SesmtRecord): SesmtRecord {
  const prior = existing ?? ({} as SesmtRecord);
  const criticalityRaw = cleanString(payload.criticidade)?.toUpperCase();
  const criticidade = ["BAIXA", "MEDIA", "ALTA", "CRITICA"].includes(criticalityRaw || "")
    ? (criticalityRaw as SesmtRecord["criticidade"])
    : (prior.criticidade || "MEDIA");

  const date = nowIso();
  return {
    id: prior.id || `SES-${moduleKey.slice(0, 3).toUpperCase()}-${String(Date.now()).slice(-6)}`,
    moduleKey,
    titulo: cleanString(payload.titulo) || prior.titulo || "Registro SESMT",
    descricao: cleanString(payload.descricao) || prior.descricao || "",
    unidade: cleanString(payload.unidade) || prior.unidade || "MAO",
    status: cleanString(payload.status) || prior.status || "ABERTO",
    responsavel: cleanString(payload.responsavel) || prior.responsavel || userName,
    criticidade,
    nr: cleanString(payload.nr) || prior.nr,
    periodoInicio: cleanString(payload.periodoInicio) || prior.periodoInicio,
    periodoFim: cleanString(payload.periodoFim) || prior.periodoFim,
    setor: cleanString(payload.setor) || prior.setor,
    funcao: cleanString(payload.funcao) || prior.funcao,
    investimento: normalizeNumber(payload.investimento) ?? prior.investimento,
    custo: normalizeNumber(payload.custo) ?? prior.custo,
    riscoInerente: normalizeNumber(payload.riscoInerente) ?? prior.riscoInerente,
    riscoResidual: normalizeNumber(payload.riscoResidual) ?? prior.riscoResidual,
    vencimentoAt: cleanString(payload.vencimentoAt) || prior.vencimentoAt,
    dadosSaudeSensiveis: Boolean(payload.dadosSaudeSensiveis ?? prior.dadosSaudeSensiveis),
    dadosEspecificos: validateSesmtSpecificData(moduleKey, payload.dadosEspecificos, prior.dadosEspecificos),
    tags: Array.isArray(payload.tags) ? payload.tags.map((tag: unknown) => String(tag).trim()).filter(Boolean) : prior.tags || [],
    anexos: prior.anexos || [],
    evidencias: prior.evidencias || [],
    historico: prior.historico || [],
    origemVinculada: Array.isArray(payload.origemVinculada)
      ? payload.origemVinculada.map((item: any) => ({ tipo: String(item.tipo || ""), id: String(item.id || "") }))
      : prior.origemVinculada || [],
    createdAt: prior.createdAt || date,
    updatedAt: date,
    createdBy: prior.createdBy || userName,
    updatedBy: userName,
  };
}

function withModuleMetadata(record: SesmtRecord): SesmtRecord & { moduleLabel: string; moduleGroup: string } {
  const moduleDef = getSesmtModuleDefinition(record.moduleKey);
  return {
    ...record,
    moduleLabel: moduleDef?.label ?? record.moduleKey,
    moduleGroup: moduleDef?.groupLabel ?? "SESMT/SST",
  };
}
export const sesmtRepo = {
  listMenu(profile: string) {
    assertRead(profile);
    return SESMT_MENU_TREE.map((group) => ({
      ...group,
      children: group.children.filter((child) => {
        const moduleDef = getSesmtModuleDefinition(child.key);
        if (!moduleDef) return true;
        if (moduleDef.visibility === "SENSITIVE_HEALTH" && !SENSITIVE_HEALTH_READ_PROFILES.has(profile)) {
          return false;
        }
        return true;
      }),
    }));
  },

  listModuleDefinitions(profile: string) {
    assertRead(profile);
    return SESMT_MODULE_DEFINITIONS.filter((item) => {
      if (item.visibility === "SENSITIVE_HEALTH") {
        return SENSITIVE_HEALTH_READ_PROFILES.has(profile);
      }
      return true;
    });
  },

  listExecutiveViews(profile: string) {
    assertRead(profile);
    return SESMT_EXECUTIVE_VIEWS.filter((item) => {
      if ((item as any).visibility === "SENSITIVE_HEALTH") {
        return SENSITIVE_HEALTH_READ_PROFILES.has(profile);
      }
      return true;
    });
  },

  getLookups(profile: string, userId: string) {
    assertRead(profile);
    const store = ensureStore();
    const allowedUnits = getAllowedUnits(profile, userId);
    return {
      unidades: (store.unidades as any[]).filter((unit) => allowedUnits.includes(unit.codigo)),
      setores: (store.setores as any[]).filter((setor) => allowedUnits.includes(setor.unidade)),
      cargos: store.cargos,
      funcoes: store.funcoes,
      colaboradores: (store.colaboradores as any[]).filter((col) => allowedUnits.includes(col.unidade)),
      profissionaisSesmt: (store.profissionaisSesmt as any[]).filter((prof) => allowedUnits.includes(prof.unidade)),
      fornecedoresLaboratorios: store.fornecedoresLaboratorios ?? [],
      cadastrosAuxiliares: store.cadastrosAuxiliares ?? [],
      allowedUnits,
    };
  },

  listRecords(input: {
    profile: string;
    userId: string;
    userName: string;
    moduleKey: string;
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    unidade?: string;
    responsavel?: string;
    criticidade?: string;
    nr?: string;
    periodStart?: string;
    periodEnd?: string;
    sortBy?: string;
    sortDir?: "asc" | "desc";
    specificFilters?: Record<string, string>;
  }): SesmtRecordListResult {
    assertRead(input.profile);

    const moduleDef = getSesmtModuleDefinition(input.moduleKey);
    if (!moduleDef) {
      throw Object.assign(new Error("Submodulo SESMT/SST nao encontrado."), { statusCode: 404 });
    }

    if (moduleDef.visibility === "SENSITIVE_HEALTH") {
      assertSensitiveRead(input.profile, moduleDef.key, input.userName);
    }

    if (input.sortBy?.startsWith("specific:")) {
      validateSpecificFieldKey(input.moduleKey, input.sortBy.slice("specific:".length));
    }

    if (input.specificFilters && Object.keys(input.specificFilters).length > 0) {
      Object.keys(input.specificFilters).forEach((fieldKey) => validateSpecificFieldKey(input.moduleKey, fieldKey));
    }

    const store = ensureStore();
    const allowedUnits = getAllowedUnits(input.profile, input.userId);
    let records = (store.registros as SesmtRecord[]).filter((record) => record.moduleKey === input.moduleKey);
    records = applyUnitFilter(records, allowedUnits);

    if (input.unidade) records = records.filter((record) => record.unidade === input.unidade);
    if (input.status) records = records.filter((record) => record.status === input.status);
    if (input.responsavel) {
      const normalized = input.responsavel.toLowerCase();
      records = records.filter((record) => record.responsavel.toLowerCase().includes(normalized));
    }
    if (input.criticidade) records = records.filter((record) => record.criticidade === input.criticidade);
    if (input.nr) records = records.filter((record) => record.nr === input.nr);

    if (input.periodStart) records = records.filter((record) => !record.periodoInicio || record.periodoInicio >= input.periodStart!);
    if (input.periodEnd) records = records.filter((record) => !record.periodoFim || record.periodoFim <= input.periodEnd!);

    if (input.search?.trim()) {
      const normalized = input.search.trim().toLowerCase();
      records = records.filter((record) => [record.titulo, record.descricao, record.responsavel, record.setor, record.funcao]
        .filter(Boolean)
        .some((part) => String(part).toLowerCase().includes(normalized)));
    }

    if (input.specificFilters && Object.keys(input.specificFilters).length > 0) {
      const filters = Object.entries(input.specificFilters)
        .map(([key, value]) => [key, String(value).trim().toLowerCase()] as const)
        .filter(([, value]) => value.length > 0);

      if (filters.length > 0) {
        records = records.filter((record) => filters.every(([fieldKey, expected]) => {
          const value = record.dadosEspecificos?.[fieldKey];
          if (value == null) return false;
          return String(value).toLowerCase().includes(expected);
        }));
      }
    }

    records = sortRecords(records, input.sortBy, input.sortDir);

    const page = Math.max(1, input.page ?? 1);
    const limit = Math.min(Math.max(1, input.limit ?? 20), 100);
    const start = (page - 1) * limit;

    return {
      page,
      limit,
      total: records.length,
      items: records.slice(start, start + limit).map(withModuleMetadata),
    };
  },

  getRecordById(input: { profile: string; userId: string; userName: string; moduleKey: string; id: string }) {
    assertRead(input.profile);
    const moduleDef = getSesmtModuleDefinition(input.moduleKey);
    if (!moduleDef) throw Object.assign(new Error("Submodulo nao encontrado."), { statusCode: 404 });

    if (moduleDef.visibility === "SENSITIVE_HEALTH") {
      assertSensitiveRead(input.profile, moduleDef.key, input.userName);
    }

    const store = ensureStore();
    const allowedUnits = getAllowedUnits(input.profile, input.userId);
    const record = (store.registros as SesmtRecord[]).find((item) => item.moduleKey === input.moduleKey && item.id === input.id);
    if (!record) throw Object.assign(new Error("Registro nao encontrado."), { statusCode: 404 });
    if (!allowedUnits.includes(record.unidade)) {
      throw Object.assign(new Error("Registro fora do escopo de unidade deste perfil."), { statusCode: 403 });
    }

    return withModuleMetadata(record);
  },

  createRecord(input: { profile: string; userId: string; userName: string; moduleKey: string; payload: any }) {
    assertRead(input.profile);
    const moduleDef = getSesmtModuleDefinition(input.moduleKey);
    if (!moduleDef) throw Object.assign(new Error("Submodulo nao encontrado."), { statusCode: 404 });

    const isSensitive = moduleDef.visibility === "SENSITIVE_HEALTH" || Boolean(input.payload?.dadosSaudeSensiveis);
    if (isSensitive && !SENSITIVE_HEALTH_READ_PROFILES.has(input.profile)) {
      throw Object.assign(new Error("Perfil sem acesso ao contexto de saude ocupacional."), { statusCode: 403 });
    }
    assertWrite(input.profile, isSensitive);

    const unit = cleanString(input.payload?.unidade) || "MAO";
    const allowedUnits = getAllowedUnits(input.profile, input.userId);
    if (!allowedUnits.includes(unit)) {
      throw Object.assign(new Error("Nao e permitido criar registros fora da unidade do perfil."), { statusCode: 403 });
    }

    const store = ensureStore();
    const record = mapRecordInput(input.moduleKey, input.payload, input.userName);
    record.historico.unshift(buildHistoryEntry("CRIADO", "Registro criado no modulo SESMT/SST.", input.userName));

    (store.registros as SesmtRecord[]).unshift(record);
    if (Array.isArray((store as any)[moduleDef.collectionKey])) {
      (store as any)[moduleDef.collectionKey].unshift(record);
    }

    appendAudit("CRIAR", "SESMT_REGISTRO", record.id, `Criado em ${moduleDef.label}`, input.userName);
    return withModuleMetadata(record);
  },

  updateRecord(input: {
    profile: string;
    userId: string;
    userName: string;
    moduleKey: string;
    id: string;
    payload: any;
  }) {
    assertRead(input.profile);
    const moduleDef = getSesmtModuleDefinition(input.moduleKey);
    if (!moduleDef) throw Object.assign(new Error("Submodulo nao encontrado."), { statusCode: 404 });

    const store = ensureStore();
    const list = store.registros as SesmtRecord[];
    const idx = list.findIndex((item) => item.moduleKey === input.moduleKey && item.id === input.id);
    if (idx < 0) throw Object.assign(new Error("Registro nao encontrado."), { statusCode: 404 });

    const existing = list[idx];
    const allowedUnits = getAllowedUnits(input.profile, input.userId);
    if (!allowedUnits.includes(existing.unidade)) {
      throw Object.assign(new Error("Registro fora do escopo de unidade deste perfil."), { statusCode: 403 });
    }

    const isSensitive = Boolean(moduleDef.visibility === "SENSITIVE_HEALTH" || existing.dadosSaudeSensiveis);
    if (isSensitive && !SENSITIVE_HEALTH_READ_PROFILES.has(input.profile)) {
      throw Object.assign(new Error("Perfil sem acesso ao contexto de saude ocupacional."), { statusCode: 403 });
    }
    assertWrite(input.profile, isSensitive);

    const next = mapRecordInput(input.moduleKey, input.payload, input.userName, existing);
    next.historico = [
      buildHistoryEntry("ATUALIZADO", "Registro atualizado no modulo SESMT/SST.", input.userName),
      ...(existing.historico || []),
    ];

    list[idx] = next;
    if (Array.isArray((store as any)[moduleDef.collectionKey])) {
      const moduleList = (store as any)[moduleDef.collectionKey] as SesmtRecord[];
      const moduleIdx = moduleList.findIndex((item) => item.id === input.id);
      if (moduleIdx >= 0) moduleList[moduleIdx] = next;
    }

    appendAudit("ATUALIZAR", "SESMT_REGISTRO", input.id, `Atualizado em ${moduleDef.label}`, input.userName);
    return withModuleMetadata(next);
  },

  getFavoritePreset(input: { profile: string; userId: string; moduleKey: string }) {
    assertRead(input.profile);
    const moduleDef = getSesmtModuleDefinition(input.moduleKey);
    if (!moduleDef) throw Object.assign(new Error("Submodulo nao encontrado."), { statusCode: 404 });
    if (moduleDef.visibility === "SENSITIVE_HEALTH" && !SENSITIVE_HEALTH_READ_PROFILES.has(input.profile)) {
      throw Object.assign(new Error("Perfil sem acesso ao submodulo sensivel."), { statusCode: 403 });
    }

    const store = ensureStore();
    const favorite = (store.favoritePresets as SesmtFavoritePreset[])
      .find((item) => item.userId === input.userId && item.moduleKey === input.moduleKey);

    if (!favorite) return { favoritePreset: null };

    return {
      favoritePreset: {
        moduleKey: favorite.moduleKey,
        presetKey: favorite.presetKey,
        status: favorite.status,
        criticidade: favorite.criticidade,
        unidade: favorite.unidade,
        sortBy: favorite.sortBy,
        sortDir: favorite.sortDir,
        specificFilters: favorite.specificFilters,
        updatedAt: favorite.updatedAt,
        updatedBy: favorite.updatedBy,
      },
    };
  },

  saveFavoritePreset(input: {
    profile: string;
    userId: string;
    userName: string;
    moduleKey: string;
    payload: {
      presetKey?: unknown;
      status?: unknown;
      criticidade?: unknown;
      unidade?: unknown;
      sortBy?: unknown;
      sortDir?: unknown;
      specificFilters?: unknown;
      clear?: boolean;
    };
  }) {
    assertRead(input.profile);
    const moduleDef = getSesmtModuleDefinition(input.moduleKey);
    if (!moduleDef) throw Object.assign(new Error("Submodulo nao encontrado."), { statusCode: 404 });
    if (moduleDef.visibility === "SENSITIVE_HEALTH" && !SENSITIVE_HEALTH_READ_PROFILES.has(input.profile)) {
      throw Object.assign(new Error("Perfil sem acesso ao submodulo sensivel."), { statusCode: 403 });
    }

    const specificFilters = normalizeSpecificFilters(input.payload?.specificFilters);
    if (specificFilters) {
      Object.keys(specificFilters).forEach((fieldKey) => validateSpecificFieldKey(input.moduleKey, fieldKey));
    }

    const sortByRaw = cleanString(input.payload?.sortBy) || "updatedAt";
    if (sortByRaw.startsWith("specific:")) {
      validateSpecificFieldKey(input.moduleKey, sortByRaw.slice("specific:".length));
    }

    const store = ensureStore();
    const list = store.favoritePresets as SesmtFavoritePreset[];
    const index = list.findIndex((item) => item.userId === input.userId && item.moduleKey === input.moduleKey);

    if (Boolean(input.payload?.clear)) {
      if (index >= 0) list.splice(index, 1);
      appendAudit("REMOVER", "SESMT_PRESET_FAVORITO", input.moduleKey, `Favorito removido em ${moduleDef.label}`, input.userName);
      return { favoritePreset: null };
    }

    const timestamp = nowIso();
    const prior = index >= 0 ? list[index] : undefined;

    const favorite: SesmtFavoritePreset = {
      userId: input.userId,
      moduleKey: input.moduleKey,
      presetKey: cleanString(input.payload?.presetKey) ?? null,
      status: cleanString(input.payload?.status),
      criticidade: cleanString(input.payload?.criticidade),
      unidade: cleanString(input.payload?.unidade),
      sortBy: sortByRaw || prior?.sortBy || "updatedAt",
      sortDir: normalizeSortDir(input.payload?.sortDir, prior?.sortDir || "desc"),
      specificFilters,
      createdAt: prior?.createdAt || timestamp,
      updatedAt: timestamp,
      createdBy: prior?.createdBy || input.userName,
      updatedBy: input.userName,
    };

    if (index >= 0) {
      list[index] = favorite;
    } else {
      list.unshift(favorite);
    }

    appendAudit("ATUALIZAR", "SESMT_PRESET_FAVORITO", input.moduleKey, `Favorito salvo em ${moduleDef.label}`, input.userName);
    return {
      favoritePreset: {
        moduleKey: favorite.moduleKey,
        presetKey: favorite.presetKey,
        status: favorite.status,
        criticidade: favorite.criticidade,
        unidade: favorite.unidade,
        sortBy: favorite.sortBy,
        sortDir: favorite.sortDir,
        specificFilters: favorite.specificFilters,
        updatedAt: favorite.updatedAt,
        updatedBy: favorite.updatedBy,
      },
    };
  },
  addEvidence(input: {
    profile: string;
    userId: string;
    userName: string;
    moduleKey: string;
    id: string;
    payload: {
      descricao: string;
      tipo?: string;
      data?: string;
      responsavel?: string;
      anexoId?: string;
    };
  }) {
    const record = sesmtRepo.getRecordById({
      profile: input.profile,
      userId: input.userId,
      userName: input.userName,
      moduleKey: input.moduleKey,
      id: input.id,
    });

    const moduleDef = getSesmtModuleDefinition(input.moduleKey)!;
    const isSensitive = Boolean(moduleDef.visibility === "SENSITIVE_HEALTH" || record.dadosSaudeSensiveis);
    assertWrite(input.profile, isSensitive);

    const evidence: SesmtEvidence = {
      id: `EVD-${Math.floor(Math.random() * 1_000_000)}`,
      descricao: cleanString(input.payload.descricao) || "Evidencia registrada",
      tipo: cleanString(input.payload.tipo) || "EVIDENCIA",
      data: cleanString(input.payload.data) || nowIso().slice(0, 10),
      responsavel: cleanString(input.payload.responsavel) || input.userName,
      anexoId: cleanString(input.payload.anexoId),
      criadoAt: nowIso(),
      criadoPor: input.userName,
    };

    const store = ensureStore();
    const list = store.registros as SesmtRecord[];
    const idx = list.findIndex((item) => item.id === input.id && item.moduleKey === input.moduleKey);
    if (idx < 0) throw Object.assign(new Error("Registro nao encontrado."), { statusCode: 404 });

    list[idx].evidencias = [evidence, ...(list[idx].evidencias || [])];
    list[idx].historico = [
      buildHistoryEntry("EVIDENCIA", `Evidencia adicionada: ${evidence.descricao}`, input.userName),
      ...(list[idx].historico || []),
    ];
    list[idx].updatedAt = nowIso();
    list[idx].updatedBy = input.userName;

    appendAudit("CRIAR", "SESMT_EVIDENCIA", input.id, `Evidencia adicionada em ${moduleDef.label}`, input.userName);
    return list[idx];
  },

  addAttachmentMetadata(input: {
    profile: string;
    userId: string;
    userName: string;
    moduleKey: string;
    id: string;
    attachment: Omit<SesmtAttachment, "id" | "criadoAt" | "criadoPor">;
  }) {
    const record = sesmtRepo.getRecordById({
      profile: input.profile,
      userId: input.userId,
      userName: input.userName,
      moduleKey: input.moduleKey,
      id: input.id,
    });

    const moduleDef = getSesmtModuleDefinition(input.moduleKey)!;
    const isSensitive = Boolean(moduleDef.visibility === "SENSITIVE_HEALTH" || record.dadosSaudeSensiveis);
    assertWrite(input.profile, isSensitive);

    const attachment: SesmtAttachment = {
      id: `ANX-${Math.floor(Math.random() * 1_000_000)}`,
      ...input.attachment,
      criadoAt: nowIso(),
      criadoPor: input.userName,
    };

    const store = ensureStore();
    const list = store.registros as SesmtRecord[];
    const idx = list.findIndex((item) => item.id === input.id && item.moduleKey === input.moduleKey);
    if (idx < 0) throw Object.assign(new Error("Registro nao encontrado."), { statusCode: 404 });

    list[idx].anexos = [attachment, ...(list[idx].anexos || [])];
    list[idx].historico = [
      buildHistoryEntry("ANEXO", `Anexo adicionado: ${attachment.nomeArquivo}`, input.userName),
      ...(list[idx].historico || []),
    ];
    list[idx].updatedAt = nowIso();
    list[idx].updatedBy = input.userName;

    appendAudit("UPLOAD", "SESMT_ANEXO", input.id, `Anexo ${attachment.nomeArquivo} em ${moduleDef.label}`, input.userName);
    return attachment;
  },

  getMasterDashboard(profile: string, userId: string, userName: string, filters?: { unidade?: string; periodStart?: string; periodEnd?: string }) {
    assertRead(profile);

    const store = ensureStore();
    const allowedUnits = getAllowedUnits(profile, userId);
    const filterUnit = cleanString(filters?.unidade);

    let records = applyUnitFilter(store.registros as SesmtRecord[], allowedUnits);
    if (filterUnit) records = records.filter((record) => record.unidade === filterUnit);

    if (filters?.periodStart) records = records.filter((record) => !record.createdAt || record.createdAt.slice(0, 10) >= filters.periodStart!);
    if (filters?.periodEnd) records = records.filter((record) => !record.createdAt || record.createdAt.slice(0, 10) <= filters.periodEnd!);

    const now = new Date();
    const in60Days = new Date(now.getTime() + 60 * 86_400_000).toISOString().slice(0, 10);

    const concluido = records.filter((item) => item.status === "CONCLUIDO").length;
    const scoreGeral = records.length > 0 ? Number(((concluido / records.length) * 100).toFixed(1)) : 0;

    const documentosVencendo = (store.documentosControlados as any[])
      .filter((doc) => {
        const due = String(doc.vigenciaAt || "");
        if (!due) return false;
        return due >= now.toISOString().slice(0, 10) && due <= in60Days;
      }).length;

    const asoVencendo = records.filter((record) => record.moduleKey === "exames" && record.vencimentoAt && record.vencimentoAt <= in60Days).length;
    const treinamentosVencendo = records.filter((record) => record.moduleKey === "treinamentos-e-integracao" && record.vencimentoAt && record.vencimentoAt <= in60Days).length;
    const inspecoesAtrasadas = records.filter((record) => record.moduleKey === "inspecoes-e-visitas" && record.status === "ATRASADO").length;
    const acoesCriticasAbertas = records.filter((record) => record.moduleKey === "plano-de-acao-x-risco" && record.criticidade === "CRITICA" && record.status !== "CONCLUIDO").length;

    const byUnit = records.reduce<Record<string, { total: number; concluidos: number; criticos: number }>>((acc, record) => {
      if (!acc[record.unidade]) acc[record.unidade] = { total: 0, concluidos: 0, criticos: 0 };
      acc[record.unidade].total += 1;
      if (record.status === "CONCLUIDO") acc[record.unidade].concluidos += 1;
      if (record.criticidade === "CRITICA") acc[record.unidade].criticos += 1;
      return acc;
    }, {});

    const rankingUnidades = Object.entries(byUnit)
      .map(([unidade, stats]) => ({
        unidade,
        score: stats.total > 0 ? Number((((stats.concluidos - stats.criticos * 0.35) / stats.total) * 100).toFixed(1)) : 0,
        total: stats.total,
        concluidos: stats.concluidos,
        criticos: stats.criticos,
      }))
      .sort((a, b) => b.score - a.score);

    const visaoNr = Object.entries(records.reduce<Record<string, number>>((acc, record) => {
      const key = record.nr || "NR-NA";
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {})).map(([nr, total]) => ({ nr, total }));

    const custoAnual = (store.custos as any[])
      .filter((item) => String(item.competencia || "").startsWith(String(now.getFullYear())))
      .reduce((sum, item) => sum + Number(item.valor || 0), 0);

    const months = monthsBack(6);
    const tendencia = months.map((month) => {
      const monthRecords = records.filter((item) => item.createdAt.slice(0, 7) === month);
      return {
        mes: month,
        abertos: monthRecords.filter((item) => item.status !== "CONCLUIDO").length,
        concluidos: monthRecords.filter((item) => item.status === "CONCLUIDO").length,
      };
    });

    const pendenciasPrioritarias = records
      .filter((item) => item.criticidade === "CRITICA" && item.status !== "CONCLUIDO")
      .sort((a, b) => (a.vencimentoAt || "9999-12-31").localeCompare(b.vencimentoAt || "9999-12-31"))
      .slice(0, 10)
      .map((item) => ({ id: item.id, titulo: item.titulo, unidade: item.unidade, responsavel: item.responsavel, vencimentoAt: item.vencimentoAt, moduleKey: item.moduleKey }));

    return {
      scoreGeral,
      documentosVencendo,
      asoVencendo,
      treinamentosVencendo,
      inspecoesAtrasadas,
      acoesCriticasAbertas,
      rankingUnidades,
      visaoNr,
      custoAnual,
      tendencia,
      pendenciasPrioritarias,
      generatedAt: nowIso(),
      generatedBy: userName,
    };
  },

  getMaturityDashboard(profile: string, userId: string, userName: string, filters?: { unidade?: string }) {
    const base = sesmtRepo.getMasterDashboard(profile, userId, userName, filters);
    const eixoDetalhado = [
      { eixo: "Riscos criticos controlados", peso: 1.4, valor: Math.max(0, 100 - base.acoesCriticasAbertas * 4) },
      { eixo: "Inspecoes e tratativas", peso: 1.2, valor: Math.max(0, 100 - base.inspecoesAtrasadas * 6) },
      { eixo: "Saude ocupacional", peso: 1.4, valor: Math.max(0, 100 - base.asoVencendo * 5) },
      { eixo: "Treinamentos", peso: 1.1, valor: Math.max(0, 100 - base.treinamentosVencendo * 3) },
      { eixo: "Emergencia", peso: 1.0, valor: Math.max(0, 100 - Math.round(base.acoesCriticasAbertas * 2.2)) },
      { eixo: "Terceiros", peso: 0.9, valor: Math.max(0, 100 - Math.round(base.documentosVencendo * 1.7)) },
      { eixo: "Ambiente fisico", peso: 1.0, valor: Math.max(0, 100 - Math.round(base.inspecoesAtrasadas * 2.5)) },
      { eixo: "Documentacao", peso: 0.8, valor: Math.max(0, 100 - Math.round(base.documentosVencendo * 2.8)) },
      { eixo: "Participacao do trabalhador", peso: 0.7, valor: Math.max(0, 65 + (base.pendenciasPrioritarias.length === 0 ? 15 : 0)) },
    ];

    const weighted = eixoDetalhado.reduce((acc, item) => {
      acc.totalPeso += item.peso;
      acc.totalValor += item.valor * item.peso;
      return acc;
    }, { totalPeso: 0, totalValor: 0 });

    return {
      indiceMaturidade: weighted.totalPeso > 0 ? Number((weighted.totalValor / weighted.totalPeso).toFixed(1)) : 0,
      eixoDetalhado,
      rankingUnidades: base.rankingUnidades,
      generatedAt: nowIso(),
    };
  },
  getPredictiveDashboard(profile: string, userId: string, userName: string, filters?: { unidade?: string }) {
    assertRead(profile);
    const base = sesmtRepo.getMasterDashboard(profile, userId, userName, filters);

    const riscosFuturos = base.rankingUnidades.map((item) => {
      const pressure = Math.max(0, 100 - item.score);
      const reincidencia = Math.min(100, Math.round(item.criticos * 14 + pressure * 0.35));
      const degradacao = Math.min(100, Math.round(base.inspecoesAtrasadas * 4 + (100 - item.score) * 0.4));
      const riscoFuturo = Math.min(100, Math.round((reincidencia * 0.45) + (degradacao * 0.55)));
      return {
        unidade: item.unidade,
        riscoFuturo,
        reincidencia,
        degradacao,
        justificativa: `Criticos: ${item.criticos}, score unidade: ${item.score}, inspecoes atrasadas corporativas: ${base.inspecoesAtrasadas}.`,
      };
    });

    const alertas = riscosFuturos
      .filter((item) => item.riscoFuturo >= 60)
      .map((item) => ({
        unidade: item.unidade,
        nivel: item.riscoFuturo >= 80 ? "ALTO" : "MODERADO",
        titulo: "Probabilidade elevada de reincidencia",
        descricao: `Risco projetado em ${item.riscoFuturo}% para os proximos 30 dias.`,
        justificativa: item.justificativa,
      }));

    return {
      riscosFuturos,
      alertas,
      generatedAt: nowIso(),
    };
  },

  getIndicatorsDashboard(profile: string, userId: string, userName: string, filters?: { unidade?: string }) {
    assertRead(profile);
    const base = sesmtRepo.getMasterDashboard(profile, userId, userName, filters);

    const scopedRecords = applyUnitFilter(ensureStore().registros as SesmtRecord[], getAllowedUnits(profile, userId));

    const statusDistribuicao = Object.entries(scopedRecords.reduce<Record<string, number>>((acc, record) => {
      acc[record.status] = (acc[record.status] || 0) + 1;
      return acc;
    }, {})).map(([status, total]) => ({ status, total }));

    const criticidadeDistribuicao = Object.entries(scopedRecords.reduce<Record<string, number>>((acc, record) => {
      acc[record.criticidade] = (acc[record.criticidade] || 0) + 1;
      return acc;
    }, {})).map(([criticidade, total]) => ({ criticidade, total }));

    return {
      cards: [
        { titulo: "Score geral SST", valor: base.scoreGeral, meta: 90, unidade: "%" },
        { titulo: "Acoes criticas", valor: base.acoesCriticasAbertas, meta: 8, unidade: "itens" },
        { titulo: "Inspecoes atrasadas", valor: base.inspecoesAtrasadas, meta: 3, unidade: "itens" },
        { titulo: "Documentos vencendo", valor: base.documentosVencendo, meta: 10, unidade: "itens" },
      ],
      statusDistribuicao,
      criticidadeDistribuicao,
      visaoNr: base.visaoNr,
      tendencia: base.tendencia,
      generatedAt: nowIso(),
    };
  },

  getGerencialOcupacionalDashboard(profile: string, userId: string, userName: string, filters?: { unidade?: string }) {
    assertRead(profile);
    assertSensitiveRead(profile, "gerencial-ocupacional", userName);

    const store = ensureStore();
    const allowedUnits = getAllowedUnits(profile, userId);
    const selectedUnit = cleanString(filters?.unidade);
    const records = applyUnitFilter(store.registros as SesmtRecord[], allowedUnits)
      .filter((record) => record.moduleKey === "saude-ocupacional" || record.moduleKey === "exames" || record.moduleKey === "ambulatorio-prontuario")
      .filter((record) => !selectedUnit || record.unidade === selectedUnit);

    const agendaExames = records
      .filter((record) => record.moduleKey === "exames")
      .map((record) => ({
        id: record.id,
        colaborador: record.titulo,
        unidade: record.unidade,
        vencimentoAt: record.vencimentoAt,
        status: record.status,
      }))
      .sort((a, b) => String(a.vencimentoAt || "").localeCompare(String(b.vencimentoAt || "")))
      .slice(0, 20);

    const afastamentos = records.filter((record) => record.status === "ATRASADO").length;
    const restricoesAtivas = records.filter((record) => record.criticidade === "ALTA" || record.criticidade === "CRITICA").length;

    return {
      kpis: {
        totalProntuarios: records.filter((record) => record.moduleKey === "ambulatorio-prontuario").length,
        examesPendentes: records.filter((record) => record.moduleKey === "exames" && record.status !== "CONCLUIDO").length,
        afastamentos,
        restricoesAtivas,
      },
      agendaExames,
      historicoAtendimentos: records
        .filter((record) => record.moduleKey === "ambulatorio-prontuario")
        .slice(0, 10)
        .map((record) => ({ id: record.id, titulo: record.titulo, unidade: record.unidade, updatedAt: record.updatedAt, status: record.status })),
      generatedAt: nowIso(),
    };
  },

  listAccessAudit(profile: string) {
    assertRead(profile);
    if (!SENSITIVE_HEALTH_READ_PROFILES.has(profile)) {
      throw Object.assign(new Error("Perfil sem acesso ao log sensivel."), { statusCode: 403 });
    }
    return ensureStore().acessosSensiveis;
  },
};

