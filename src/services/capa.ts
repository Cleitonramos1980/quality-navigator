import { apiGet, apiPost } from "@/services/api";
import type { CAPA } from "@/types/sgq";

export async function getCAPAs(): Promise<CAPA[]> {
  return apiGet<CAPA[]>("/capa");
}

export async function createCAPA(data: Omit<CAPA, "id">): Promise<CAPA> {
  return apiPost<CAPA>("/capa", data);
}


