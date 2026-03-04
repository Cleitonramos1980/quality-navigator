import { AudExec } from "@/types/sgq";
import { mockAuditorias } from "@/data/mockData";

export async function getAuditorias(): Promise<AudExec[]> {
  return Promise.resolve(mockAuditorias);
}

export async function createAuditoria(data: Omit<AudExec, "id">): Promise<AudExec> {
  const novo: AudExec = { ...data, id: `AUD-${String(mockAuditorias.length + 1).padStart(3, "0")}` };
  mockAuditorias.push(novo);
  return Promise.resolve(novo);
}
