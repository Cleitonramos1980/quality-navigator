const STATUS_LABEL_OVERRIDES: Record<string, string> = {
  ABERTO: "Aberto",
  ABERTA: "Aberta",
  EM_ANALISE: "Em Análise",
  AGUARDANDO_CLIENTE: "Aguardando Cliente",
  AGUARDANDO_VALIDACAO: "Aguardando Validação",
  AGUARDANDO_RECEBIMENTO: "Aguardando Recebimento",
  AGUARDANDO_PECAS: "Aguardando Peças",
  EM_INSPECAO: "Em Inspeção",
  EM_REPARO: "Em Reparo",
  CONCLUIDA: "Concluída",
  ENCERRADA: "Encerrada",
  ENCERRADO: "Encerrado",
  NAO_CONFORMIDADE: "Não Conformidade",
};

function titleCase(input: string): string {
  return input
    .toLowerCase()
    .split(" ")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function getStatusText(status: string): string {
  const normalized = String(status || "").trim().toUpperCase();
  if (!normalized) return "-";
  if (STATUS_LABEL_OVERRIDES[normalized]) return STATUS_LABEL_OVERRIDES[normalized];
  return titleCase(normalized.replace(/_/g, " "));
}
