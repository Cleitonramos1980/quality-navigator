import { apiGet, apiPost, apiPut } from "@/services/api";
import type {
  ModeloInspecao,
  ExecucaoInspecao,
  TipoNCInspecao,
  PadraoMola,
  InspecaoMola,
} from "@/types/inspecoes";

// Modelos
export const listModelosInspecao = () => apiGet<ModeloInspecao[]>("/qualidade/inspecoes/modelos");
export const getModeloInspecao = (id: string) => apiGet<ModeloInspecao>(`/qualidade/inspecoes/modelos/${id}`);
export const createModeloInspecao = (data: Omit<ModeloInspecao, "id" | "createdAt" | "updatedAt">) => apiPost<ModeloInspecao>("/qualidade/inspecoes/modelos", data);
export const updateModeloInspecao = (id: string, data: Partial<ModeloInspecao>) => apiPut<ModeloInspecao>(`/qualidade/inspecoes/modelos/${id}`, data);

// Execuções
export const listExecucoesInspecao = () => apiGet<ExecucaoInspecao[]>("/qualidade/inspecoes/execucoes");
export const getExecucaoInspecao = (id: string) => apiGet<ExecucaoInspecao>(`/qualidade/inspecoes/execucoes/${id}`);
export const createExecucaoInspecao = (data: Omit<ExecucaoInspecao, "id">) => apiPost<ExecucaoInspecao>("/qualidade/inspecoes/execucoes", data);

// Tipos NC
export const listTiposNCInspecao = () => apiGet<TipoNCInspecao[]>("/qualidade/inspecoes/tipos-nc");
export const createTipoNCInspecao = (data: Omit<TipoNCInspecao, "id">) => apiPost<TipoNCInspecao>("/qualidade/inspecoes/tipos-nc", data);
export const updateTipoNCInspecao = (id: string, data: Partial<TipoNCInspecao>) => apiPut<TipoNCInspecao>(`/qualidade/inspecoes/tipos-nc/${id}`, data);

// Padrões de Molas
export const listPadroesMola = () => apiGet<PadraoMola[]>("/qualidade/inspecoes/molas/padroes");
export const createPadraoMola = (data: Omit<PadraoMola, "id">) => apiPost<PadraoMola>("/qualidade/inspecoes/molas/padroes", data);
export const updatePadraoMola = (id: string, data: Partial<PadraoMola>) => apiPut<PadraoMola>(`/qualidade/inspecoes/molas/padroes/${id}`, data);

// Inspeções de Molas
export const listInspecoesMola = () => apiGet<InspecaoMola[]>("/qualidade/inspecoes/molas");
export const getInspecaoMola = (id: string) => apiGet<InspecaoMola>(`/qualidade/inspecoes/molas/${id}`);
export const createInspecaoMola = (data: Omit<InspecaoMola, "id">) => apiPost<InspecaoMola>("/qualidade/inspecoes/molas", data);
