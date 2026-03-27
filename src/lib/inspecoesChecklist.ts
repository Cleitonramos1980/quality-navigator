export type ChecklistTipoOficial = {
  key: string;
  setor: string;
  label: string;
};

export const CHECKLIST_TIPOS_OFICIAIS: ChecklistTipoOficial[] = [
  { key: "1.0_-_ESPUMACAO", setor: "ESPUMACAO", label: "1.0 - ESPUMACAO" },
  { key: "2.0_-_AREA_DE_CURA", setor: "AREA DE CURA", label: "2.0 - AREA DE CURA" },
  { key: "3.0_-_FLOCADEIRA", setor: "FLOCADEIRA", label: "3.0 - FLOCADEIRA" },
  { key: "4.0_-_LAMINACAO", setor: "LAMINACAO", label: "4.0 - LAMINACAO" },
  { key: "5.0_-_MOLA", setor: "MOLA", label: "5.0 - MOLA" },
  { key: "6.0_-_BORDADEIRA", setor: "BORDADEIRA", label: "6.0 - BORDADEIRA" },
  { key: "7.0_-_CORTE_E_COSTURA", setor: "CORTE E COSTURA", label: "7.0 - CORTE E COSTURA" },
  { key: "8.0_-_MARCENARIA", setor: "MARCENARIA", label: "8.0 - MARCENARIA" },
  { key: "9.0_-_TAPECARIA", setor: "TAPECARIA", label: "9.0 - TAPECARIA" },
  { key: "10.0_-_FECHAMENTO", setor: "FECHAMENTO", label: "10.0 - FECHAMENTO" },
  { key: "11.0_-_MOVEIS", setor: "MOVEIS", label: "11.0 - MOVEIS" },
  { key: "12.0_-_EMBALAGEM", setor: "EMBALAGEM", label: "12.0 - EMBALAGEM" },
  { key: "13.0_-_ALMOXARIFADO", setor: "ALMOXARIFADO", label: "13.0 - ALMOXARIFADO" },
  { key: "14.0_-_ESTOFAMENTO", setor: "ESTOFAMENTO", label: "14.0 - ESTOFAMENTO" },
  { key: "15.0_-_EMBALAGEM_DE_BASE", setor: "EMBALAGEM DE BASE", label: "15.0 - EMBALAGEM DE BASE" },
];

export function normalizeSetorKey(value: string): string {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toUpperCase();
}

export function isSameSetor(left: string, right: string): boolean {
  return normalizeSetorKey(left) === normalizeSetorKey(right);
}

export function hasSetorPermitido(setoresPermitidos: string[], setor: string): boolean {
  const target = normalizeSetorKey(setor);
  return setoresPermitidos.some((item) => normalizeSetorKey(item) === target);
}

export function getChecklistTipoBySetor(setor: string): ChecklistTipoOficial | undefined {
  const normalized = normalizeSetorKey(setor);
  return CHECKLIST_TIPOS_OFICIAIS.find((item) => normalizeSetorKey(item.setor) === normalized);
}
