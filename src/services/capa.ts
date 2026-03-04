import { CAPA } from "@/types/sgq";
import { mockCAPAs } from "@/data/mockData";

export async function getCAPAs(): Promise<CAPA[]> {
  return Promise.resolve(mockCAPAs);
}

export async function createCAPA(data: Omit<CAPA, "id">): Promise<CAPA> {
  const novo: CAPA = { ...data, id: `CAPA-${String(mockCAPAs.length + 1).padStart(3, "0")}` };
  mockCAPAs.push(novo);
  return Promise.resolve(novo);
}
