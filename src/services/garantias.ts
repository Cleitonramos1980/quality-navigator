import { GarantiaCaso } from "@/types/sgq";
import { mockGarantias } from "@/data/mockData";

// Mock service — replace with apiGet/apiPost when backend is ready

export async function getGarantias(): Promise<GarantiaCaso[]> {
  return Promise.resolve(mockGarantias);
}

export async function createGarantia(data: Omit<GarantiaCaso, "id">): Promise<GarantiaCaso> {
  const novo: GarantiaCaso = { ...data, id: `GAR-${String(mockGarantias.length + 1).padStart(3, "0")}` };
  mockGarantias.push(novo);
  return Promise.resolve(novo);
}

export async function updateGarantia(id: string, data: Partial<GarantiaCaso>): Promise<GarantiaCaso> {
  const idx = mockGarantias.findIndex((g) => g.id === id);
  if (idx === -1) throw new Error("Garantia não encontrada");
  mockGarantias[idx] = { ...mockGarantias[idx], ...data };
  return Promise.resolve(mockGarantias[idx]);
}
