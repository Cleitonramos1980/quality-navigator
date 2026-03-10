import { SACAtendimento } from "@/types/sac";

export const mockAtendimentos: SACAtendimento[] = [
  {
    id: "SAC-001", codcli: "1042", clienteNome: "Magazine Luiza", cgcent: "47.960.950/0001-21",
    telefone: "(92) 3232-1010", canal: "TELEFONE", tipoContato: "RECLAMACAO",
    descricao: "Cliente relata que colchão Queen apresenta deformação após 2 meses de uso.",
    plantaResp: "MAO", numPedido: "PED-88421", numNfVenda: "NF-112340",
    status: "ABERTO", abertoAt: "2026-03-01", atualizadoAt: "2026-03-01",
    timeline: [
      { id: "T1", data: "2026-03-01 09:00", usuario: "Ana SAC", acao: "Abertura", descricao: "Chamado aberto via telefone." },
    ],
  },
  {
    id: "SAC-002", codcli: "2081", clienteNome: "Casas Bahia", cgcent: "33.041.260/0001-65",
    telefone: "(91) 3344-5566", canal: "EMAIL", tipoContato: "TROCA",
    descricao: "Solicitação de troca por ruído nas molas do colchão Solteiro.",
    plantaResp: "BEL", numPedido: "PED-77312", numNfVenda: "NF-109877",
    status: "EM_ANALISE", abertoAt: "2026-02-25", atualizadoAt: "2026-02-27",
    timeline: [
      { id: "T1", data: "2026-02-25 14:30", usuario: "Carlos SAC", acao: "Abertura", descricao: "Chamado registrado via e-mail." },
      { id: "T2", data: "2026-02-27 10:00", usuario: "Carlos SAC", acao: "Análise", descricao: "Enviado para equipe de qualidade." },
    ],
  },
  {
    id: "SAC-003", codcli: "3055", clienteNome: "Ponto Frio", cgcent: "44.123.456/0001-78",
    telefone: "(81) 3456-7890", canal: "WHATSAPP", tipoContato: "DUVIDA",
    descricao: "Cliente pergunta sobre prazo de garantia do modelo Casal Premium.",
    plantaResp: "AGR", status: "AGUARDANDO_CLIENTE", abertoAt: "2026-02-20", atualizadoAt: "2026-02-22",
    timeline: [
      { id: "T1", data: "2026-02-20 16:00", usuario: "Maria SAC", acao: "Abertura", descricao: "Dúvida recebida via WhatsApp." },
      { id: "T2", data: "2026-02-22 09:00", usuario: "Maria SAC", acao: "Resposta", descricao: "Informações enviadas, aguardando retorno do cliente." },
    ],
  },
  {
    id: "SAC-004", codcli: "4010", clienteNome: "Havan", cgcent: "79.456.789/0001-34",
    telefone: "(92) 4455-6677", canal: "SITE", tipoContato: "RECLAMACAO",
    descricao: "Reclamação de odor forte no colchão recebido há 1 semana.",
    plantaResp: "BEL", numPedido: "PED-55100", numNfVenda: "NF-100200",
    status: "RESOLVIDO", abertoAt: "2026-02-15", atualizadoAt: "2026-02-28",
  },
  {
    id: "SAC-005", codcli: "5022", clienteNome: "Riachuelo", cgcent: "12.345.678/0001-90",
    telefone: "(81) 5566-7788", canal: "PRESENCIAL", tipoContato: "ELOGIO",
    descricao: "Elogio à qualidade do colchão King Size entregue.",
    plantaResp: "AGR", status: "ENCERRADO", abertoAt: "2026-02-10", atualizadoAt: "2026-02-10", encerradoAt: "2026-02-10",
  },
  {
    id: "SAC-006", codcli: "1042", clienteNome: "Magazine Luiza", cgcent: "47.960.950/0001-21",
    telefone: "(92) 3232-1010", canal: "TELEFONE", tipoContato: "TROCA",
    descricao: "Solicitação de troca de colchão com tecido manchado.",
    plantaResp: "MAO", numPedido: "PED-88500", numNfVenda: "NF-112500",
    status: "ABERTO", abertoAt: "2026-02-28", atualizadoAt: "2026-02-28",
  },
  {
    id: "SAC-007", codcli: "6033", clienteNome: "Lojas Americanas", cgcent: "22.333.444/0001-55",
    telefone: "(91) 6677-8899", canal: "EMAIL", tipoContato: "INFORMACAO",
    descricao: "Solicitação de informações sobre linha de colchões ortopédicos.",
    plantaResp: "BEL", status: "ABERTO", abertoAt: "2026-03-02", atualizadoAt: "2026-03-02",
  },
  {
    id: "SAC-008", codcli: "3055", clienteNome: "Ponto Frio", cgcent: "44.123.456/0001-78",
    telefone: "(81) 3456-7890", canal: "REDES_SOCIAIS", tipoContato: "RECLAMACAO",
    descricao: "Reclamação via Instagram sobre atraso na entrega.",
    plantaResp: "AGR", numPedido: "PED-66201", status: "EM_ANALISE",
    abertoAt: "2026-02-18", atualizadoAt: "2026-02-20",
  },
];

export const sacDashboardData = {
  porStatus: [
    { name: "Abertos", value: 3, status: "ABERTO" },
    { name: "Em Análise", value: 2, status: "EM_ANALISE" },
    { name: "Aguard. Cliente", value: 1, status: "AGUARDANDO_CLIENTE" },
    { name: "Resolvidos", value: 1, status: "RESOLVIDO" },
    { name: "Encerrados", value: 1, status: "ENCERRADO" },
  ],
  porTipo: [
    { name: "Reclamação", value: 3 },
    { name: "Troca", value: 2 },
    { name: "Dúvida", value: 1 },
    { name: "Elogio", value: 1 },
    { name: "Informação", value: 1 },
  ],
  porPlanta: [
    { name: "MAO", value: 3 },
    { name: "BEL", value: 3 },
    { name: "AGR", value: 2 },
  ],
  porDia: [
    { dia: "24/02", count: 0 },
    { dia: "25/02", count: 1 },
    { dia: "26/02", count: 0 },
    { dia: "27/02", count: 0 },
    { dia: "28/02", count: 2 },
    { dia: "01/03", count: 1 },
    { dia: "02/03", count: 1 },
  ],
};

