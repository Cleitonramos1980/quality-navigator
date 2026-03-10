import { apiGet, apiPost, apiPut } from "@/services/api";
import type { GarantiaCaso } from "@/types/sgq";

export async function getGarantias(): Promise<GarantiaCaso[]> {
  return apiGet<GarantiaCaso[]>("/garantias");
}

export async function createGarantia(data: Omit<GarantiaCaso, "id">): Promise<GarantiaCaso> {
  return apiPost<GarantiaCaso>("/garantias", data);
}

export async function updateGarantia(id: string, data: Partial<GarantiaCaso>): Promise<GarantiaCaso> {
  return apiPut<GarantiaCaso>(`/garantias/${id}`, data);
}


