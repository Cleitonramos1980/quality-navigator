import { isOracleEnabled } from "../db/oracle.js";
import { execDml, queryOne } from "./baseRepository.js";
import { db } from "./dataStore.js";

type DbShape = typeof db;
type DbKey = keyof DbShape;

const TABLE_NAME = "SGQ_COLLECTION_STORE";

const COLLECTION_KEYS: DbKey[] = [
  "usuarios",
  "auditLog",
  "parametros",
  "atendimentos",
  "sacAtendimentoAnexos",
  "requisicoesSac",
  "garantias",
  "ncs",
  "capas",
  "auditorias",
  "auditoriaTemplates",
  "auditoriaTemplateItems",
  "documentosQualidade",
  "treinamentosQualidade",
  "treinamentoParticipantes",
  "mudancasQualidade",
  "fornecedoresQualidade",
  "scarsFornecedores",
  "metrologiaInstrumentos",
  "metrologiaMsa",
  "indicadoresIndustriais",
  "regrasRiscoSla",
  "avaliacoesRiscoSla",
  "auditoriasCamadas",
  "gatesFornecedores",
  "isoReadiness",
  "osAssistencia",
  "reqMaterial",
  "consumoPeca",
  "osTransitionLog",
  "uxMetrics",
  "sacAvaliacoes",
  "inventarioLojas",
  "inventarioDepartamentos",
  "inventarioFrequencias",
  "inventarioTarefas",
  "inventarioContagens",
  "inventarioDivergencias",
  "operacionalAcessos",
  "operacionalVisitantes",
  "operacionalVeiculosVisitantes",
  "operacionalFrota",
  "operacionalDeslocamentos",
  "operacionalTransportadoras",
  "operacionalMotoristasTerceiros",
  "operacionalVeiculosTerceiros",
  "operacionalOperacoes",
  "operacionalAgendamentos",
  "operacionalDocas",
  "operacionalFilaPatio",
  "operacionalAlertas",
  "operacionalExcecoes",
  "operacionalNFsTransito",
  "operacionalExcecoesFiscais",
  "operacionalMovimentacoesFrota",
  "operacionalTimeline",
  "operacionalDashboard",
  "torreExcecoes",
  "torreKPIs",
  "agendamentosSlots",
  "agendamentoDockCapacity",
  "agendamentoKPIs",
  "custodias",
  "custodiaKPIs",
  "inspecoesModelos",
  "inspecoesExecucoes",
  "inspecoesTiposNc",
  "inspecoesPadroesMola",
  "inspecoesMola",
  "inspecoesUsuarioSetor",
];

let ensured = false;

async function ensureTable(): Promise<void> {
  if (!isOracleEnabled() || ensured) return;
  await execDml(`
    BEGIN
      EXECUTE IMMEDIATE '
        CREATE TABLE ${TABLE_NAME} (
          COLLECTION_KEY VARCHAR2(80) PRIMARY KEY,
          PAYLOAD CLOB NOT NULL,
          UPDATED_AT TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL
        )
      ';
    EXCEPTION
      WHEN OTHERS THEN
        IF SQLCODE != -955 THEN
          RAISE;
        END IF;
    END;
  `);
  ensured = true;
}

async function loadCollectionFromOracle<K extends DbKey>(key: K): Promise<DbShape[K] | null> {
  const row = await queryOne<{ PAYLOAD?: string }>(
    `SELECT PAYLOAD FROM ${TABLE_NAME} WHERE COLLECTION_KEY = :collectionKey`,
    { collectionKey: key },
  );
  if (!row?.PAYLOAD) return null;
  try {
    return JSON.parse(row.PAYLOAD) as DbShape[K];
  } catch {
    return null;
  }
}

async function saveCollectionToOracle<K extends DbKey>(key: K, value: DbShape[K]): Promise<void> {
  const payload = JSON.stringify(value);
  await execDml(
    `MERGE INTO ${TABLE_NAME} t
      USING (SELECT :collectionKey AS COLLECTION_KEY, :payload AS PAYLOAD FROM DUAL) s
      ON (t.COLLECTION_KEY = s.COLLECTION_KEY)
     WHEN MATCHED THEN
      UPDATE SET t.PAYLOAD = s.PAYLOAD, t.UPDATED_AT = SYSTIMESTAMP
     WHEN NOT MATCHED THEN
      INSERT (COLLECTION_KEY, PAYLOAD, UPDATED_AT)
      VALUES (s.COLLECTION_KEY, s.PAYLOAD, SYSTIMESTAMP)`,
    { collectionKey: key, payload },
  );
}

export async function initPersistentCollections(): Promise<void> {
  if (!isOracleEnabled()) return;

  try {
    await ensureTable();
    for (const key of COLLECTION_KEYS) {
      const loaded = await loadCollectionFromOracle(key);
      if (loaded == null) {
        await saveCollectionToOracle(key, db[key]);
      } else {
        (db[key] as unknown) = loaded as unknown;
      }
    }
  } catch (error) {
    console.error("Falha ao inicializar SGQ_COLLECTION_STORE no Oracle. Mantendo store em memoria.", error);
  }
}

export async function persistCollection<K extends DbKey>(key: K): Promise<void> {
  if (!isOracleEnabled()) return;
  try {
    await ensureTable();
    await saveCollectionToOracle(key, db[key]);
  } catch (error) {
    console.error(`Falha ao persistir colecao ${String(key)} no Oracle.`, error);
  }
}

export async function persistCollections(keys: DbKey[]): Promise<void> {
  if (!isOracleEnabled()) return;
  for (const key of keys) {
    await persistCollection(key);
  }
}

export async function persistAllCollections(): Promise<void> {
  await persistCollections(COLLECTION_KEYS);
}
