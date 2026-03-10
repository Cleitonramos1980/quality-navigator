import { apiGet, apiPost, apiPut } from "@/services/api";
import type { NCRegistro } from "@/types/sgq";

export async function getNCs(): Promise<NCRegistro[]> {
  return apiGet<NCRegistro[]>("/nc");
}

export async function createNC(data: Omit<NCRegistro, "id">): Promise<NCRegistro> {
  return apiPost<NCRegistro>("/nc", data);
}

export async function updateNC(id: string, data: Partial<NCRegistro>): Promise<NCRegistro> {
  return apiPut<NCRegistro>(`/nc/${id}`, data);
}


