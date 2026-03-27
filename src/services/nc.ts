import { apiGet, apiPost, apiPut } from "@/services/api";
import { mockNCs } from "@/data/mockData";
import type { NCRegistro } from "@/types/sgq";

export async function getNCs(): Promise<NCRegistro[]> {
  try {
    return await apiGet<NCRegistro[]>("/nc");
  } catch {
    return mockNCs;
  }
}

export async function createNC(data: Omit<NCRegistro, "id">): Promise<NCRegistro> {
  return apiPost<NCRegistro>("/nc", data);
}

export async function updateNC(id: string, data: Partial<NCRegistro>): Promise<NCRegistro> {
  return apiPut<NCRegistro>(`/nc/${id}`, data);
}


