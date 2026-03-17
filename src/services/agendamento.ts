import { apiGet, apiPost, apiPut } from "@/services/api";
import type { AgendamentoDockSlot, DockCapacity, AgendamentoKPIs, AgendamentoStatus } from "@/types/agendamento";
import { mockAgendamentosSlots, mockDockCapacity, mockAgendamentoKPIs } from "@/data/mockAgendamento";

export async function getAgendamentosSlots(): Promise<AgendamentoDockSlot[]> {
  try { return await apiGet<AgendamentoDockSlot[]>("/operacional/agendamentos-dock"); } catch { return mockAgendamentosSlots; }
}

export async function getDockCapacity(): Promise<DockCapacity[]> {
  try { return await apiGet<DockCapacity[]>("/operacional/dock-capacity"); } catch { return mockDockCapacity; }
}

export async function getAgendamentoKPIs(): Promise<AgendamentoKPIs> {
  try { return await apiGet<AgendamentoKPIs>("/operacional/agendamento-kpis"); } catch { return mockAgendamentoKPIs; }
}

export async function criarAgendamento(data: Partial<AgendamentoDockSlot>): Promise<AgendamentoDockSlot> {
  try { return await apiPost<AgendamentoDockSlot>("/operacional/agendamentos-dock", data); }
  catch { return mockAgendamentosSlots[0]; }
}

export async function editarAgendamento(id: string, data: Partial<AgendamentoDockSlot>): Promise<AgendamentoDockSlot> {
  try { return await apiPut<AgendamentoDockSlot>(`/operacional/agendamentos-dock/${id}`, data); }
  catch { return mockAgendamentosSlots[0]; }
}

export async function atualizarStatusAgendamento(id: string, status: AgendamentoStatus, observacao?: string): Promise<AgendamentoDockSlot> {
  try { return await apiPut<AgendamentoDockSlot>(`/operacional/agendamentos-dock/${id}/status`, { status, observacao }); }
  catch { return mockAgendamentosSlots.find(s => s.id === id) || mockAgendamentosSlots[0]; }
}

export async function alocarDoca(id: string, docaId: string, docaNome: string): Promise<AgendamentoDockSlot> {
  try { return await apiPut<AgendamentoDockSlot>(`/operacional/agendamentos-dock/${id}/doca`, { docaId, docaNome }); }
  catch { return mockAgendamentosSlots.find(s => s.id === id) || mockAgendamentosSlots[0]; }
}
