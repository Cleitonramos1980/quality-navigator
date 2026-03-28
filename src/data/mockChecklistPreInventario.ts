import type { ChecklistPreInventario, ChecklistBloco } from "@/types/checklistPreInventario";

const BLOCOS_TEMPLATE: Omit<ChecklistBloco, "itens">[] = [
  { id: "B01", ordem: 1, nome: "Planejamento do Inventário" },
  { id: "B02", ordem: 2, nome: "Organização do Estoque" },
  { id: "B03", ordem: 3, nome: "Bloqueio de Movimentações" },
  { id: "B04", ordem: 4, nome: "Conciliação Sistêmica" },
  { id: "B05", ordem: 5, nome: "Identificação e Controle" },
  { id: "B06", ordem: 6, nome: "Tratamento de Exceções" },
  { id: "B07", ordem: 7, nome: "Comunicação" },
  { id: "B08", ordem: 8, nome: "Infraestrutura" },
  { id: "B09", ordem: 9, nome: "Teste" },
  { id: "B10", ordem: 10, nome: "Validação" },
];

const ITENS_POR_BLOCO: Record<string, { descricao: string; criticidade: "ALTA" | "MEDIA" | "BAIXA" }[]> = {
  B01: [
    { descricao: "Definir data e horário do inventário", criticidade: "ALTA" },
    { descricao: "Definir equipes e responsáveis por setor", criticidade: "ALTA" },
    { descricao: "Comunicar cronograma aos gestores", criticidade: "MEDIA" },
    { descricao: "Reservar equipamentos (coletores, impressoras)", criticidade: "MEDIA" },
    { descricao: "Validar escopo de produtos/setores a inventariar", criticidade: "ALTA" },
  ],
  B02: [
    { descricao: "Organizar endereçamentos e corredores", criticidade: "ALTA" },
    { descricao: "Retirar produtos avariados/vencidos da área", criticidade: "MEDIA" },
    { descricao: "Garantir que todos os produtos estão endereçados", criticidade: "ALTA" },
    { descricao: "Separar devoluções pendentes", criticidade: "MEDIA" },
    { descricao: "Conferir unitização de pallets", criticidade: "BAIXA" },
  ],
  B03: [
    { descricao: "Bloquear entrada de mercadorias no período", criticidade: "ALTA" },
    { descricao: "Bloquear saída de mercadorias no período", criticidade: "ALTA" },
    { descricao: "Suspender transferências entre filiais", criticidade: "ALTA" },
    { descricao: "Notificar fornecedores sobre bloqueio de recebimento", criticidade: "MEDIA" },
  ],
  B04: [
    { descricao: "Fechar notas fiscais pendentes de entrada", criticidade: "ALTA" },
    { descricao: "Fechar notas fiscais pendentes de saída", criticidade: "ALTA" },
    { descricao: "Conciliar saldos WMS x ERP", criticidade: "ALTA" },
    { descricao: "Ajustar divergências encontradas antes do inventário", criticidade: "MEDIA" },
  ],
  B05: [
    { descricao: "Verificar etiquetas de endereçamento", criticidade: "MEDIA" },
    { descricao: "Garantir código de barras legível nos produtos", criticidade: "ALTA" },
    { descricao: "Conferir placas de identificação de setores", criticidade: "BAIXA" },
    { descricao: "Identificar áreas de quarentena e avaria", criticidade: "MEDIA" },
  ],
  B06: [
    { descricao: "Listar produtos em poder de terceiros", criticidade: "MEDIA" },
    { descricao: "Listar produtos de terceiros em poder da empresa", criticidade: "MEDIA" },
    { descricao: "Tratar itens em trânsito", criticidade: "ALTA" },
    { descricao: "Definir critério para itens sem código de barras", criticidade: "BAIXA" },
  ],
  B07: [
    { descricao: "Enviar comunicado geral sobre o inventário", criticidade: "MEDIA" },
    { descricao: "Reunião de kick-off com equipes", criticidade: "MEDIA" },
    { descricao: "Divulgar regras e procedimentos do inventário", criticidade: "ALTA" },
    { descricao: "Comunicar clientes sobre possível atraso de entregas", criticidade: "BAIXA" },
  ],
  B08: [
    { descricao: "Testar coletores de dados", criticidade: "ALTA" },
    { descricao: "Verificar rede Wi-Fi nos galpões", criticidade: "ALTA" },
    { descricao: "Verificar iluminação das áreas de contagem", criticidade: "MEDIA" },
    { descricao: "Disponibilizar pranchetas e formulários de contingência", criticidade: "BAIXA" },
  ],
  B09: [
    { descricao: "Realizar contagem piloto em área menor", criticidade: "ALTA" },
    { descricao: "Validar integração coletor → sistema", criticidade: "ALTA" },
    { descricao: "Testar impressão de relatórios de divergência", criticidade: "MEDIA" },
  ],
  B10: [
    { descricao: "Aprovar checklist com gestor responsável", criticidade: "ALTA" },
    { descricao: "Confirmar que todos os bloqueios estão ativos", criticidade: "ALTA" },
    { descricao: "Confirmar presença das equipes escaladas", criticidade: "MEDIA" },
    { descricao: "Validação final pelo coordenador do inventário", criticidade: "ALTA" },
  ],
};

function buildBlocos(seed: number): ChecklistBloco[] {
  const responsaveis = ["Ana Souza", "Carlos Lima", "Fernanda Dias", "Roberto Mendes", "Juliana Rocha"];
  const setores = ["Logística", "Almoxarifado", "TI", "Operações", "Qualidade", "Compras"];
  const statuses: ("PENDENTE" | "EM_ANDAMENTO" | "CONCLUIDO")[] = ["PENDENTE", "EM_ANDAMENTO", "CONCLUIDO"];

  return BLOCOS_TEMPLATE.map((bloco) => {
    const itensTemplate = ITENS_POR_BLOCO[bloco.id] || [];
    return {
      ...bloco,
      itens: itensTemplate.map((item, idx) => {
        const st = statuses[(seed + idx) % statuses.length];
        return {
          id: `${bloco.id}-I${String(idx + 1).padStart(2, "0")}`,
          blocoId: bloco.id,
          descricao: item.descricao,
          status: st,
          responsavel: responsaveis[(seed + idx) % responsaveis.length],
          data: `2026-04-${String(5 + idx).padStart(2, "0")}`,
          setor: setores[(seed + idx) % setores.length],
          criticidade: item.criticidade,
          observacao: st === "CONCLUIDO" ? "Concluído dentro do prazo." : undefined,
          evidencias: st === "CONCLUIDO" ? ["evidencia_exemplo.pdf"] : [],
          historico: [
            { id: "H1", data: "2026-03-25T10:00:00", usuario: "Sistema", acao: "Criação", detalhe: "Item criado automaticamente." },
          ],
        };
      }),
    };
  });
}

export const mockChecklists: ChecklistPreInventario[] = [
  {
    id: "CKL-001",
    nome: "Checklist Inventário Q2 — CD São Paulo",
    unidade: "CD São Paulo",
    dataPrevistaInventario: "2026-04-15",
    tipoInventario: "Inventário Geral",
    responsavelGeral: "Carlos Lima",
    statusGeral: "EM_ANDAMENTO",
    observacoes: "Inventário trimestral obrigatório.",
    criadoPor: "Ana Souza",
    criadoEm: "2026-03-20T08:00:00",
    blocos: buildBlocos(0),
  },
  {
    id: "CKL-002",
    nome: "Checklist Inventário Rotativo — Filial BH",
    unidade: "Filial Belo Horizonte",
    dataPrevistaInventario: "2026-04-22",
    tipoInventario: "Inventário Rotativo",
    responsavelGeral: "Fernanda Dias",
    statusGeral: "ABERTO",
    criadoPor: "Roberto Mendes",
    criadoEm: "2026-03-22T09:30:00",
    blocos: buildBlocos(2),
  },
  {
    id: "CKL-003",
    nome: "Checklist Inventário Anual — CD Curitiba",
    unidade: "CD Curitiba",
    dataPrevistaInventario: "2026-05-01",
    tipoInventario: "Inventário Geral",
    responsavelGeral: "Juliana Rocha",
    statusGeral: "CONCLUIDO",
    observacoes: "Checklist finalizado e aprovado.",
    criadoPor: "Ana Souza",
    criadoEm: "2026-02-28T14:00:00",
    blocos: buildBlocos(1),
  },
];
