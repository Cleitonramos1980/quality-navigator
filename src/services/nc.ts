import { NCRegistro } from "@/types/sgq";
import { mockNCs } from "@/data/mockData";

export async function getNCs(): Promise<NCRegistro[]> {
  return Promise.resolve(mockNCs);
}

export async function createNC(data: Omit<NCRegistro, "id">): Promise<NCRegistro> {
  const novo: NCRegistro = { ...data, id: `NC-${String(mockNCs.length + 1).padStart(3, "0")}` };
  mockNCs.push(novo);
  return Promise.resolve(novo);
}

export async function updateNC(id: string, data: Partial<NCRegistro>): Promise<NCRegistro> {
  const idx = mockNCs.findIndex((n) => n.id === id);
  if (idx === -1) throw new Error("NC não encontrada");
  mockNCs[idx] = { ...mockNCs[idx], ...data };
  return Promise.resolve(mockNCs[idx]);
}
