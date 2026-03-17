import { apiGet } from "@/services/api";
import type { AgendamentoDockSlot, DockCapacity, AgendamentoKPIs } from "@/types/agendamento";
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
