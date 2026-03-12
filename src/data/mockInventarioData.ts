import type {
  LojaInventario,
  DepartamentoInventario,
  FrequenciaConfig,
  TarefaInventario,
  Contagem,
  ItemContagem,
  DivergenciaDiaria,
} from "@/types/inventario";

export const mockLojas: LojaInventario[] = [
  { id: "L01", codigo: "001", nome: "Loja Centro Manaus", regional: "Norte", gerente: "Carlos Mendes", supervisor: "Ana Souza" },
  { id: "L02", codigo: "002", nome: "Loja Adrianópolis", regional: "Norte", gerente: "Carlos Mendes", supervisor: "Bruno Lima" },
  { id: "L03", codigo: "003", nome: "Loja Cachoeirinha", regional: "Norte", gerente: "Carlos Mendes", supervisor: "Ana Souza" },
  { id: "L04", codigo: "004", nome: "Loja Parque 10", regional: "Norte", gerente: "Fernanda Reis", supervisor: "Diego Martins" },
  { id: "L05", codigo: "005", nome: "Loja Belém Nazaré", regional: "Norte", gerente: "Fernanda Reis", supervisor: "Camila Barros" },
  { id: "L06", codigo: "006", nome: "Loja Belém Pedreira", regional: "Norte", gerente: "Fernanda Reis", supervisor: "Camila Barros" },
  { id: "L07", codigo: "007", nome: "Loja Agrestina Centro", regional: "Nordeste", gerente: "Roberto Silva", supervisor: "Juliana Ramos" },
  { id: "L08", codigo: "008", nome: "Loja Caruaru", regional: "Nordeste", gerente: "Roberto Silva", supervisor: "Marcos Oliveira" },
  { id: "L09", codigo: "009", nome: "Loja Recife Boa Viagem", regional: "Nordeste", gerente: "Roberto Silva", supervisor: "Juliana Ramos" },
  { id: "L10", codigo: "010", nome: "Loja Cidade Nova", regional: "Norte", gerente: "Carlos Mendes", supervisor: "Bruno Lima" },
];

export const mockDepartamentos: DepartamentoInventario[] = [
  { id: "D01", codigo: "COL", nome: "Colchões" },
  { id: "D02", codigo: "EST", nome: "Estofados" },
  { id: "D03", codigo: "MOV", nome: "Móveis" },
  { id: "D04", codigo: "ACE", nome: "Acessórios" },
  { id: "D05", codigo: "COZ", nome: "Cozinha" },
  { id: "D06", codigo: "DEC", nome: "Decoração" },
];

export const mockFrequenciaConfigs: FrequenciaConfig[] = [
  { id: "FC01", lojaId: "L01", lojaNome: "Loja Centro Manaus", regional: "Norte", gerente: "Carlos Mendes", supervisor: "Ana Souza", departamentoId: "D01", departamentoNome: "Colchões", frequencia: "DIARIA", ativo: true, proximaExecucao: "2026-03-13", responsavelPadrao: "Maria Santos" },
  { id: "FC02", lojaId: "L01", lojaNome: "Loja Centro Manaus", regional: "Norte", gerente: "Carlos Mendes", supervisor: "Ana Souza", departamentoId: "D02", departamentoNome: "Estofados", frequencia: "SEMANAL", ativo: true, proximaExecucao: "2026-03-16", responsavelPadrao: "Maria Santos" },
  { id: "FC03", lojaId: "L02", lojaNome: "Loja Adrianópolis", regional: "Norte", gerente: "Carlos Mendes", supervisor: "Bruno Lima", departamentoId: "D01", departamentoNome: "Colchões", frequencia: "DIARIA", ativo: true, proximaExecucao: "2026-03-13", responsavelPadrao: "Pedro Costa" },
  { id: "FC04", lojaId: "L03", lojaNome: "Loja Cachoeirinha", regional: "Norte", gerente: "Carlos Mendes", supervisor: "Ana Souza", departamentoId: "D03", departamentoNome: "Móveis", frequencia: "QUINZENAL", ativo: true, proximaExecucao: "2026-03-20", responsavelPadrao: "José Almeida" },
  { id: "FC05", lojaId: "L04", lojaNome: "Loja Parque 10", regional: "Norte", gerente: "Fernanda Reis", supervisor: "Diego Martins", departamentoId: "D01", departamentoNome: "Colchões", frequencia: "DIARIA", ativo: true, proximaExecucao: "2026-03-13", responsavelPadrao: "Lucas Ferreira" },
  { id: "FC06", lojaId: "L05", lojaNome: "Loja Belém Nazaré", regional: "Norte", gerente: "Fernanda Reis", supervisor: "Camila Barros", departamentoId: "D01", departamentoNome: "Colchões", frequencia: "SEMANAL", ativo: true, proximaExecucao: "2026-03-16", responsavelPadrao: "Rafaela Nunes" },
  { id: "FC07", lojaId: "L06", lojaNome: "Loja Belém Pedreira", regional: "Norte", gerente: "Fernanda Reis", supervisor: "Camila Barros", departamentoId: "D04", departamentoNome: "Acessórios", frequencia: "MENSAL", ativo: true, proximaExecucao: "2026-04-01", responsavelPadrao: "Tiago Melo" },
  { id: "FC08", lojaId: "L07", lojaNome: "Loja Agrestina Centro", regional: "Nordeste", gerente: "Roberto Silva", supervisor: "Juliana Ramos", departamentoId: "D01", departamentoNome: "Colchões", frequencia: "DIARIA", ativo: true, proximaExecucao: "2026-03-13", responsavelPadrao: "Sandra Vieira" },
  { id: "FC09", lojaId: "L08", lojaNome: "Loja Caruaru", regional: "Nordeste", gerente: "Roberto Silva", supervisor: "Marcos Oliveira", departamentoId: "D02", departamentoNome: "Estofados", frequencia: "SEMANAL", ativo: true, proximaExecucao: "2026-03-16", responsavelPadrao: "Felipe Rocha" },
  { id: "FC10", lojaId: "L09", lojaNome: "Loja Recife Boa Viagem", regional: "Nordeste", gerente: "Roberto Silva", supervisor: "Juliana Ramos", departamentoId: "D05", departamentoNome: "Cozinha", frequencia: "QUINZENAL", ativo: false, proximaExecucao: "2026-03-25", responsavelPadrao: "Carla Dias" },
];

function generateItems(dept: string, count: number): ItemContagem[] {
  const prefixes: Record<string, string[]> = {
    Colchões: ["Colchão Casal Molas", "Colchão Solteiro Espuma", "Colchão Queen Pocket", "Colchão King Látex", "Travesseiro Viscoelástico", "Protetor Impermeável", "Pillow Top Premium", "Base Box Casal", "Colchão Berço Ortopédico", "Capa Protetora Casal"],
    Estofados: ["Sofá 3 Lugares Retrátil", "Poltrona Reclinável", "Sofá Canto Chaise", "Puff Redondo", "Sofá 2 Lugares Fixo", "Banco Estofado", "Sofá-Cama", "Poltrona Decorativa", "Pufe Quadrado", "Sofá Modular"],
    Móveis: ["Rack TV 180cm", "Guarda-Roupa 6 Portas", "Mesa Jantar 6 Lugares", "Cômoda 5 Gavetas", "Sapateira", "Estante Livros", "Criado-Mudo", "Penteadeira", "Mesa Centro", "Painel TV"],
    Acessórios: ["Lençol Casal 300 Fios", "Edredom Queen", "Fronha Algodão", "Manta Soft", "Almofada Decorativa", "Jogo Cama Solteiro", "Toalha Banho Premium", "Cortina Blackout", "Tapete Sala", "Kit Berço"],
    Cozinha: ["Jogo Panelas 5pç", "Faqueiro 42pç", "Jogo Pratos 20pç", "Liquidificador", "Air Fryer", "Cafeteira", "Mixer", "Conjunto Potes", "Escorredor Louça", "Batedeira"],
    Decoração: ["Quadro Abstrato 60x80", "Vaso Cerâmica", "Luminária Mesa", "Espelho Redondo", "Relógio Parede", "Porta-Retrato", "Cachepô", "Abajur", "Bandeja Decorativa", "Escultura Resina"],
  };
  const items = prefixes[dept] || prefixes["Colchões"];
  return items.slice(0, count).map((desc, i) => {
    const estoque = Math.floor(Math.random() * 50) + 5;
    const contado = Math.random() > 0.3 ? estoque + Math.floor((Math.random() - 0.5) * 6) : null;
    const diff = contado !== null ? contado - estoque : null;
    return {
      id: `ITEM-${dept.substring(0, 3).toUpperCase()}-${String(i + 1).padStart(3, "0")}`,
      codigoItem: `${String(1000 + i * 13)}`,
      codigoBarras: `789${String(Math.floor(Math.random() * 9999999999)).padStart(10, "0")}`,
      descricao: desc,
      estoqueSistema: estoque,
      quantidadeContada: contado,
      diferenca: diff,
      motivoDivergencia: diff && Math.abs(diff) > 2 ? "Divergência identificada" : undefined,
      observacao: diff && Math.abs(diff) > 3 ? "Verificar recebimento pendente" : undefined,
    };
  });
}

export const mockContagens: Contagem[] = [
  {
    id: "CNT-2026-0001", numero: "CNT-2026-0001", tarefaId: "T01", data: "2026-03-12",
    lojaId: "L01", lojaNome: "Loja Centro Manaus", regional: "Norte", gerente: "Carlos Mendes", supervisor: "Ana Souza",
    departamentoId: "D01", departamentoNome: "Colchões", frequencia: "DIARIA", responsavel: "Maria Santos",
    status: "VALIDADO", itens: generateItems("Colchões", 10), itensContados: 10, itensDivergentes: 1, acuracidade: 97.2,
    iniciadoEm: "2026-03-12T08:15:00", concluidoEm: "2026-03-12T09:45:00", validadoEm: "2026-03-12T10:30:00", validadoPor: "Ana Souza",
  },
  {
    id: "CNT-2026-0002", numero: "CNT-2026-0002", tarefaId: "T02", data: "2026-03-12",
    lojaId: "L02", lojaNome: "Loja Adrianópolis", regional: "Norte", gerente: "Carlos Mendes", supervisor: "Bruno Lima",
    departamentoId: "D01", departamentoNome: "Colchões", frequencia: "DIARIA", responsavel: "Pedro Costa",
    status: "CONCLUIDO", itens: generateItems("Colchões", 10), itensContados: 10, itensDivergentes: 3, acuracidade: 88.5,
    iniciadoEm: "2026-03-12T07:30:00", concluidoEm: "2026-03-12T09:10:00",
  },
  {
    id: "CNT-2026-0003", numero: "CNT-2026-0003", tarefaId: "T03", data: "2026-03-12",
    lojaId: "L04", lojaNome: "Loja Parque 10", regional: "Norte", gerente: "Fernanda Reis", supervisor: "Diego Martins",
    departamentoId: "D01", departamentoNome: "Colchões", frequencia: "DIARIA", responsavel: "Lucas Ferreira",
    status: "EM_ANDAMENTO", itens: generateItems("Colchões", 10), itensContados: 6, itensDivergentes: 2, acuracidade: 91.0,
    iniciadoEm: "2026-03-12T08:00:00",
  },
  {
    id: "CNT-2026-0004", numero: "CNT-2026-0004", tarefaId: "T04", data: "2026-03-12",
    lojaId: "L07", lojaNome: "Loja Agrestina Centro", regional: "Nordeste", gerente: "Roberto Silva", supervisor: "Juliana Ramos",
    departamentoId: "D01", departamentoNome: "Colchões", frequencia: "DIARIA", responsavel: "Sandra Vieira",
    status: "NAO_INICIADO", itens: generateItems("Colchões", 10), itensContados: 0, itensDivergentes: 0, acuracidade: 0,
  },
  {
    id: "CNT-2026-0005", numero: "CNT-2026-0005", tarefaId: "T05", data: "2026-03-11",
    lojaId: "L03", lojaNome: "Loja Cachoeirinha", regional: "Norte", gerente: "Carlos Mendes", supervisor: "Ana Souza",
    departamentoId: "D03", departamentoNome: "Móveis", frequencia: "QUINZENAL", responsavel: "José Almeida",
    status: "NAO_FEITO", itens: generateItems("Móveis", 8), itensContados: 0, itensDivergentes: 0, acuracidade: 0,
  },
  {
    id: "CNT-2026-0006", numero: "CNT-2026-0006", tarefaId: "T06", data: "2026-03-11",
    lojaId: "L08", lojaNome: "Loja Caruaru", regional: "Nordeste", gerente: "Roberto Silva", supervisor: "Marcos Oliveira",
    departamentoId: "D02", departamentoNome: "Estofados", frequencia: "SEMANAL", responsavel: "Felipe Rocha",
    status: "RECONTAGEM", itens: generateItems("Estofados", 10), itensContados: 10, itensDivergentes: 5, acuracidade: 72.0,
    iniciadoEm: "2026-03-11T08:00:00", concluidoEm: "2026-03-11T10:30:00", recontagem: true, recontagemOrigem: "CNT-2026-0006-R0",
  },
  {
    id: "CNT-2026-0007", numero: "CNT-2026-0007", tarefaId: "T07", data: "2026-03-10",
    lojaId: "L05", lojaNome: "Loja Belém Nazaré", regional: "Norte", gerente: "Fernanda Reis", supervisor: "Camila Barros",
    departamentoId: "D01", departamentoNome: "Colchões", frequencia: "SEMANAL", responsavel: "Rafaela Nunes",
    status: "VALIDADO", itens: generateItems("Colchões", 10), itensContados: 10, itensDivergentes: 0, acuracidade: 100,
    iniciadoEm: "2026-03-10T07:45:00", concluidoEm: "2026-03-10T09:00:00", validadoEm: "2026-03-10T09:30:00", validadoPor: "Camila Barros",
  },
  {
    id: "CNT-2026-0008", numero: "CNT-2026-0008", tarefaId: "T08", data: "2026-03-10",
    lojaId: "L09", lojaNome: "Loja Recife Boa Viagem", regional: "Nordeste", gerente: "Roberto Silva", supervisor: "Juliana Ramos",
    departamentoId: "D05", departamentoNome: "Cozinha", frequencia: "QUINZENAL", responsavel: "Carla Dias",
    status: "ATRASADO", itens: generateItems("Cozinha", 8), itensContados: 3, itensDivergentes: 1, acuracidade: 85.0,
    iniciadoEm: "2026-03-10T14:00:00",
  },
  {
    id: "CNT-2026-0009", numero: "CNT-2026-0009", tarefaId: "T09", data: "2026-03-09",
    lojaId: "L10", lojaNome: "Loja Cidade Nova", regional: "Norte", gerente: "Carlos Mendes", supervisor: "Bruno Lima",
    departamentoId: "D01", departamentoNome: "Colchões", frequencia: "DIARIA", responsavel: "Pedro Costa",
    status: "VALIDADO", itens: generateItems("Colchões", 10), itensContados: 10, itensDivergentes: 2, acuracidade: 94.0,
    iniciadoEm: "2026-03-09T08:00:00", concluidoEm: "2026-03-09T09:30:00", validadoEm: "2026-03-09T10:00:00", validadoPor: "Bruno Lima",
  },
  {
    id: "CNT-2026-0010", numero: "CNT-2026-0010", tarefaId: "T10", data: "2026-03-12",
    lojaId: "L06", lojaNome: "Loja Belém Pedreira", regional: "Norte", gerente: "Fernanda Reis", supervisor: "Camila Barros",
    departamentoId: "D04", departamentoNome: "Acessórios", frequencia: "MENSAL", responsavel: "Tiago Melo",
    status: "CONCLUIDO", itens: generateItems("Acessórios", 10), itensContados: 10, itensDivergentes: 4, acuracidade: 82.5,
    iniciadoEm: "2026-03-12T09:00:00", concluidoEm: "2026-03-12T11:30:00",
  },
];

export const mockTarefas: TarefaInventario[] = mockContagens.map((c, i) => ({
  id: `T${String(i + 1).padStart(2, "0")}`,
  data: c.data,
  lojaId: c.lojaId,
  lojaNome: c.lojaNome,
  regional: c.regional,
  gerente: c.gerente,
  supervisor: c.supervisor,
  departamentoId: c.departamentoId,
  departamentoNome: c.departamentoNome,
  frequencia: c.frequencia,
  responsavel: c.responsavel,
  status: c.status,
  contagemId: c.id,
}));

// Generate 30 days of divergence data for heatmap
function genDivergencias(): DivergenciaDiaria[] {
  const result: DivergenciaDiaria[] = [];
  const lojas = mockLojas.slice(0, 8);
  for (let d = 0; d < 30; d++) {
    const date = new Date(2026, 1, 11 + d); // Feb 11 to Mar 12
    const dateStr = date.toISOString().split("T")[0];
    for (const loja of lojas) {
      const rand = Math.random();
      if (rand < 0.1) {
        result.push({
          data: dateStr, lojaId: loja.id, lojaNome: loja.nome, supervisor: loja.supervisor,
          departamento: "Colchões", frequencia: "DIARIA", itensContados: 0, itensDivergentes: 0,
          acuracidade: 0, status: "NAO_FEITO", contagemId: "", nivel: "sem_contagem",
        });
      } else {
        const acur = 70 + Math.random() * 30;
        const itens = 10;
        const div = Math.round(itens * (1 - acur / 100));
        const nivel = acur >= 95 ? "ok" : acur >= 85 ? "atencao" : "alta";
        result.push({
          data: dateStr, lojaId: loja.id, lojaNome: loja.nome, supervisor: loja.supervisor,
          departamento: "Colchões", frequencia: "DIARIA", itensContados: itens, itensDivergentes: div,
          acuracidade: Math.round(acur * 10) / 10, status: "VALIDADO",
          contagemId: `CNT-${dateStr.replace(/-/g, "")}-${loja.id}`, nivel,
        });
      }
    }
  }
  return result;
}

export const mockDivergencias: DivergenciaDiaria[] = genDivergencias();
