import type { ChecklistPreInventario, ChecklistBloco, ChecklistCriticidade, ChecklistItemStatus } from "@/types/checklistPreInventario";

interface ItemDef { descricao: string; criticidade: ChecklistCriticidade }

const BLOCOS: { id: string; ordem: number; nome: string; itens: ItemDef[] }[] = [
  {
    id: "B01", ordem: 1, nome: "Planejamento do Inventário",
    itens: [
      { descricao: "Definir data e horário do inventário", criticidade: "ALTA" },
      { descricao: "Definir tipo de inventário", criticidade: "ALTA" },
      { descricao: "Nomear responsável geral", criticidade: "ALTA" },
      { descricao: "Definir equipe e treinar", criticidade: "ALTA" },
      { descricao: "Definir áreas/setores", criticidade: "MEDIA" },
      { descricao: "Elaborar cronograma", criticidade: "MEDIA" },
    ],
  },
  {
    id: "B02", ordem: 2, nome: "Organização do Estoque",
    itens: [
      { descricao: "Estoque limpo e organizado", criticidade: "ALTA" },
      { descricao: "Endereçamento atualizado", criticidade: "ALTA" },
      { descricao: "Separação por tipo de material", criticidade: "MEDIA" },
      { descricao: "Materiais identificados", criticidade: "MEDIA" },
      { descricao: "Segregar avariados/obsoletos / caixas secas", criticidade: "ALTA" },
      { descricao: "Eliminar materiais fora do lugar", criticidade: "MEDIA" },
    ],
  },
  {
    id: "B03", ordem: 3, nome: "Bloqueio de Movimentações",
    itens: [
      { descricao: "Definir corte de movimentação", criticidade: "ALTA" },
      { descricao: "Bloquear sistema", criticidade: "ALTA" },
      { descricao: "Suspender recebimento", criticidade: "ALTA" },
      { descricao: "Suspender expedição", criticidade: "ALTA" },
      { descricao: "Validação pedidos em abertos", criticidade: "MEDIA" },
      { descricao: "Comunicar áreas", criticidade: "MEDIA" },
      { descricao: "Garantir ausência de movimentação", criticidade: "ALTA" },
    ],
  },
  {
    id: "B04", ordem: 4, nome: "Conciliação Sistêmica",
    itens: [
      { descricao: "Atualizar entradas", criticidade: "ALTA" },
      { descricao: "Atualizar saídas", criticidade: "ALTA" },
      { descricao: "Baixar OPs", criticidade: "MEDIA" },
      { descricao: "Conferir saldo", criticidade: "ALTA" },
      { descricao: "Validar WIP", criticidade: "MEDIA" },
    ],
  },
  {
    id: "B05", ordem: 5, nome: "Identificação e Controle",
    itens: [
      { descricao: "Gerar etiquetas", criticidade: "MEDIA" },
      { descricao: "Definir método de contagem", criticidade: "ALTA" },
      { descricao: "Disponibilizar materiais", criticidade: "MEDIA" },
      { descricao: "Definir responsáveis", criticidade: "ALTA" },
    ],
  },
  {
    id: "B06", ordem: 6, nome: "Tratamento de Exceções",
    itens: [
      { descricao: "Separar materiais de terceiros", criticidade: "MEDIA" },
      { descricao: "Identificar quarentena", criticidade: "ALTA" },
      { descricao: "Isolar devoluções", criticidade: "MEDIA" },
      { descricao: "Identificar sem cadastro", criticidade: "BAIXA" },
    ],
  },
  {
    id: "B07", ordem: 7, nome: "Comunicação",
    itens: [
      { descricao: "Comunicar inventário", criticidade: "MEDIA" },
      { descricao: "Alinhar líderes", criticidade: "MEDIA" },
      { descricao: "Orientar bloqueios", criticidade: "ALTA" },
    ],
  },
  {
    id: "B08", ordem: 8, nome: "Infraestrutura",
    itens: [
      { descricao: "Verificar iluminação", criticidade: "MEDIA" },
      { descricao: "Disponibilizar equipamentos", criticidade: "ALTA" },
      { descricao: "EPIs disponíveis", criticidade: "MEDIA" },
      { descricao: "Suporte TI", criticidade: "ALTA" },
    ],
  },
  {
    id: "B09", ordem: 9, nome: "Teste",
    itens: [
      { descricao: "Realizar piloto", criticidade: "ALTA" },
      { descricao: "Validar método", criticidade: "ALTA" },
    ],
  },
  {
    id: "B10", ordem: 10, nome: "Validação",
    itens: [
      { descricao: "Aprovação final", criticidade: "ALTA" },
      { descricao: "Equipe posicionada", criticidade: "MEDIA" },
    ],
  },
];

const SETORES = [
  "Espumação", "Aglomerado", "Laminação", "Bordado", "Costura reta",
  "Montagem", "Fechamento", "Embalagem", "Marcenaria", "Móveis",
  "Almoxarifado", "CD", "Lojas", "Avaria",
];

const EVIDENCIAS = ["Foto", "Print do sistema bloqueado", "Etiquetas aplicadas", "Relatório do sistema"];

const RESPONSAVEIS = ["Ana Souza", "Carlos Lima", "Fernanda Dias", "Roberto Mendes", "Juliana Rocha", "Marcos Pereira"];

function buildBlocos(seed: number): ChecklistBloco[] {
  const statuses: ChecklistItemStatus[] = ["PENDENTE", "EM_ANDAMENTO", "CONCLUIDO"];

  return BLOCOS.map((bloco) => ({
    id: bloco.id,
    ordem: bloco.ordem,
    nome: bloco.nome,
    itens: bloco.itens.map((item, idx) => {
      const st = statuses[(seed + idx + bloco.ordem) % statuses.length];
      const hasNc = st === "PENDENTE" && item.criticidade === "ALTA" && idx % 3 === 0;
      return {
        id: `${bloco.id}-I${String(idx + 1).padStart(2, "0")}`,
        blocoId: bloco.id,
        descricao: item.descricao,
        status: st,
        responsavel: RESPONSAVEIS[(seed + idx + bloco.ordem) % RESPONSAVEIS.length],
        data: `2026-04-${String(3 + idx + bloco.ordem).padStart(2, "0")}`,
        setor: SETORES[(seed + idx + bloco.ordem) % SETORES.length],
        criticidade: item.criticidade,
        evidencia: st === "CONCLUIDO" ? EVIDENCIAS[(idx + bloco.ordem) % EVIDENCIAS.length] : undefined,
        nc: hasNc,
        planoAcao: hasNc ? "Abrir CAPA e reavaliar processo antes do inventário" : undefined,
        observacao: st === "CONCLUIDO" ? "Concluído dentro do prazo." : undefined,
        evidencias: st === "CONCLUIDO" ? ["evidencia_exemplo.pdf"] : [],
        historico: [
          { id: "H1", data: "2026-03-25T10:00:00", usuario: "Sistema", acao: "Criação", detalhe: "Item criado automaticamente." },
          ...(st === "CONCLUIDO" ? [{ id: "H2", data: "2026-04-02T14:30:00", usuario: RESPONSAVEIS[(seed + idx) % RESPONSAVEIS.length], acao: "Conclusão", detalhe: "Item concluído e evidência anexada." }] : []),
        ],
      };
    }),
  }));
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
