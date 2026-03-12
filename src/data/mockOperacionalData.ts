import type {
  Acesso, Visitante, VeiculoVisitante, VeiculoFrota, DeslocamentoFrota,
  Transportadora, MotoristaTerceiro, VeiculoTerceiro, OperacaoTerceiro,
  AgendamentoDoca, Doca, FilaPatio, AlertaOperacional, ExcecaoOperacional,
  NFTransito, ExcecaoFiscal, EventoTimeline,
} from "@/types/operacional";

// ── ACESSOS / PORTARIA ──
export const mockAcessos: Acesso[] = [
  { id: "ACS-2026-0001", tipo: "VISITANTE", nome: "João Carlos de Mendonça", documento: "123.456.789-01", empresa: "Consultoria Norte LTDA", placa: "ABC-1D23", tipoVeiculo: "Carro", responsavelInterno: "Ana Paula Soares", setorDestino: "Diretoria", horarioPrevisto: "2026-03-12T09:00:00", horarioReal: "2026-03-12T09:12:00", status: "EM_PERMANENCIA", criticidade: "BAIXA", motivo: "Reunião comercial", selfieUrl: "/placeholder.svg", planta: "MAO", criadoEm: "2026-03-11T15:00:00", criadoPor: "Sistema", ultimaAtualizacao: "2026-03-12T09:12:00" },
  { id: "ACS-2026-0002", tipo: "MOTORISTA", nome: "Carlos Eduardo Silva", documento: "987.654.321-00", empresa: "Rápido Manaus Log.", placa: "MNO-5F67", tipoVeiculo: "Caminhão Truck", responsavelInterno: "Ricardo Lima", setorDestino: "Doca 03", horarioPrevisto: "2026-03-12T07:00:00", horarioReal: "2026-03-12T07:45:00", status: "ENTRADA_REGISTRADA", criticidade: "MEDIA", motivo: "Descarga NF 112500", planta: "MAO", criadoEm: "2026-03-11T18:00:00", criadoPor: "Agendamento", ultimaAtualizacao: "2026-03-12T07:45:00" },
  { id: "ACS-2026-0003", tipo: "PRESTADOR", nome: "Marcos Antônio Ferreira", documento: "456.123.789-55", empresa: "Manutenção Industrial MA", responsavelInterno: "Pedro Almeida", setorDestino: "Manutenção", horarioPrevisto: "2026-03-12T08:00:00", status: "AGUARDANDO_VALIDACAO", criticidade: "BAIXA", motivo: "Manutenção preventiva compressores", planta: "MAO", criadoEm: "2026-03-12T07:30:00", criadoPor: "Pedro Almeida", ultimaAtualizacao: "2026-03-12T07:30:00" },
  { id: "ACS-2026-0004", tipo: "VISITANTE", nome: "Maria Fernanda Oliveira", documento: "321.654.987-11", empresa: "Grupo Varejo Norte", placa: "DEF-2G45", tipoVeiculo: "SUV", responsavelInterno: "Diretoria", setorDestino: "Sala de Reuniões", horarioPrevisto: "2026-03-12T14:00:00", status: "PRE_AUTORIZADO", criticidade: "BAIXA", motivo: "Visita técnica", planta: "MAO", criadoEm: "2026-03-10T10:00:00", criadoPor: "Ana Paula Soares", ultimaAtualizacao: "2026-03-10T10:00:00" },
  { id: "ACS-2026-0005", tipo: "MOTORISTA", nome: "José Raimundo Costa", documento: "111.222.333-44", empresa: "TransBrasil Cargas", placa: "GHI-3H89", tipoVeiculo: "Carreta", responsavelInterno: "Logística", setorDestino: "Doca 01", horarioPrevisto: "2026-03-12T06:00:00", horarioReal: "2026-03-12T08:30:00", status: "ENTRADA_REGISTRADA", criticidade: "ALTA", motivo: "Carga de insumos — atrasado 2h30", planta: "MAO", criadoEm: "2026-03-11T16:00:00", criadoPor: "Agendamento", ultimaAtualizacao: "2026-03-12T08:30:00" },
  { id: "ACS-2026-0006", tipo: "ENTREGA", nome: "Delivery Express", documento: "00.123.456/0001-99", empresa: "Delivery Express", responsavelInterno: "Recepção", setorDestino: "Portaria", horarioPrevisto: "2026-03-12T11:00:00", status: "RECUSADO", criticidade: "MEDIA", motivo: "Documentação incompleta", planta: "MAO", criadoEm: "2026-03-12T10:50:00", criadoPor: "Portaria", ultimaAtualizacao: "2026-03-12T11:05:00" },
  { id: "ACS-2026-0007", tipo: "VISITANTE", nome: "Roberto Nascimento", documento: "555.666.777-88", empresa: "Auditoria Externa S/A", responsavelInterno: "Qualidade", setorDestino: "Qualidade", horarioPrevisto: "2026-03-11T09:00:00", horarioReal: "2026-03-11T09:05:00", horarioSaida: "2026-03-11T17:00:00", status: "ENCERRADO", criticidade: "BAIXA", motivo: "Auditoria ISO programada", planta: "MAO", criadoEm: "2026-03-10T08:00:00", criadoPor: "Sistema", ultimaAtualizacao: "2026-03-11T17:00:00" },
  { id: "ACS-2026-0008", tipo: "VISITANTE", nome: "Patrícia Lima Santos", documento: "999.888.777-66", empresa: "Fornecedor Têxtil PA", responsavelInterno: "Compras", setorDestino: "Compras", horarioPrevisto: "2026-03-10T10:00:00", status: "EXPIRADO", criticidade: "BAIXA", motivo: "Apresentação de novos tecidos", planta: "MAO", criadoEm: "2026-03-08T14:00:00", criadoPor: "Compras", ultimaAtualizacao: "2026-03-10T23:59:00", obs: "Visitante não compareceu" },
];

// ── VISITANTES ──
export const mockVisitantes: Visitante[] = [
  { id: "VIS-2026-0001", nome: "João Carlos de Mendonça", documento: "123.456.789-01", empresa: "Consultoria Norte LTDA", telefone: "(92) 99876-5432", email: "joao@consultorianorte.com.br", selfieUrl: "/placeholder.svg", responsavelInterno: "Ana Paula Soares", setorDestino: "Diretoria", motivoVisita: "Reunião comercial trimestral", status: "VISITA_EM_ANDAMENTO", possuiVeiculo: true, veiculoId: "VVE-2026-0001", dataVisitaPrevista: "2026-03-12", ultimaVisita: "2026-01-15", criadoEm: "2026-03-11T15:00:00", criadoPor: "Ana Paula Soares", ultimaAtualizacao: "2026-03-12T09:12:00", planta: "MAO" },
  { id: "VIS-2026-0002", nome: "Maria Fernanda Oliveira", documento: "321.654.987-11", empresa: "Grupo Varejo Norte", telefone: "(92) 98765-4321", responsavelInterno: "Diretoria", setorDestino: "Sala de Reuniões", motivoVisita: "Visita técnica e avaliação de produtos", status: "APROVADO", possuiVeiculo: true, veiculoId: "VVE-2026-0002", dataVisitaPrevista: "2026-03-12", criadoEm: "2026-03-10T10:00:00", criadoPor: "Ana Paula Soares", ultimaAtualizacao: "2026-03-11T16:00:00", planta: "MAO", qrCodeUrl: "QR-VIS-0002" },
  { id: "VIS-2026-0003", nome: "Roberto Nascimento", documento: "555.666.777-88", empresa: "Auditoria Externa S/A", telefone: "(11) 91234-5678", responsavelInterno: "Qualidade", setorDestino: "Qualidade", motivoVisita: "Auditoria ISO 9001 programada", status: "ENCERRADO", possuiVeiculo: false, dataVisitaPrevista: "2026-03-11", ultimaVisita: "2026-03-11", criadoEm: "2026-03-10T08:00:00", criadoPor: "Pedro Almeida", ultimaAtualizacao: "2026-03-11T17:00:00", planta: "MAO" },
  { id: "VIS-2026-0004", nome: "Patrícia Lima Santos", documento: "999.888.777-66", empresa: "Fornecedor Têxtil PA", telefone: "(91) 98888-7777", responsavelInterno: "Compras", setorDestino: "Compras", motivoVisita: "Apresentação de novos tecidos", status: "EXPIRADO", possuiVeiculo: false, dataVisitaPrevista: "2026-03-10", criadoEm: "2026-03-08T14:00:00", criadoPor: "Compras", ultimaAtualizacao: "2026-03-10T23:59:00", planta: "MAO" },
  { id: "VIS-2026-0005", nome: "Fernando Albuquerque", documento: "444.555.666-77", empresa: "Tech Solutions AM", telefone: "(92) 97777-6666", email: "fernando@techsolutions.com.br", responsavelInterno: "TI", setorDestino: "CPD", motivoVisita: "Instalação de novo servidor", status: "AGUARDANDO_VALIDACAO", possuiVeiculo: true, veiculoId: "VVE-2026-0003", dataVisitaPrevista: "2026-03-13", criadoEm: "2026-03-12T08:00:00", criadoPor: "TI", ultimaAtualizacao: "2026-03-12T08:00:00", planta: "MAO", selfieUrl: "/placeholder.svg" },
  { id: "VIS-2026-0006", nome: "Luciana Barros", documento: "222.333.444-55", empresa: "Labtest Equipamentos", telefone: "(92) 96666-5555", responsavelInterno: "Qualidade", setorDestino: "Laboratório", motivoVisita: "Calibração de equipamentos", status: "CADASTRO_PREENCHIDO", possuiVeiculo: false, dataVisitaPrevista: "2026-03-14", criadoEm: "2026-03-12T09:00:00", criadoPor: "Sistema", ultimaAtualizacao: "2026-03-12T10:30:00", planta: "MAO", linkPreenchimento: "https://sgq.rodrigues.com.br/visitante/VIS-2026-0006" },
];

// ── VEÍCULOS DE VISITANTES ──
export const mockVeiculosVisitantes: VeiculoVisitante[] = [
  { id: "VVE-2026-0001", placa: "ABC-1D23", tipo: "Carro", modelo: "Toyota Corolla", cor: "Prata", visitanteId: "VIS-2026-0001", visitanteNome: "João Carlos de Mendonça", empresaOrigem: "Consultoria Norte LTDA", localVaga: "Estacionamento Visitantes - Vaga 04", horarioEntrada: "2026-03-12T09:12:00", status: "ESTACIONADO", planta: "MAO" },
  { id: "VVE-2026-0002", placa: "DEF-2G45", tipo: "SUV", modelo: "Hyundai Tucson", cor: "Branco", visitanteId: "VIS-2026-0002", visitanteNome: "Maria Fernanda Oliveira", empresaOrigem: "Grupo Varejo Norte", status: "AGUARDANDO_CHEGADA", planta: "MAO" },
  { id: "VVE-2026-0003", placa: "JKL-4M56", tipo: "Carro", modelo: "Honda Civic", cor: "Preto", visitanteId: "VIS-2026-0005", visitanteNome: "Fernando Albuquerque", empresaOrigem: "Tech Solutions AM", status: "AGUARDANDO_CHEGADA", planta: "MAO" },
];

// ── FROTA ──
export const mockFrota: VeiculoFrota[] = [
  { id: "FRT-2026-0001", placa: "ROD-1A01", tipo: "Van", modelo: "Mercedes Sprinter", ano: 2024, setor: "Assistência Técnica", motoristaResponsavel: "Antônio Souza", status: "EM_DESLOCAMENTO", ultimaMovimentacao: "2026-03-12T07:30:00", quilometragem: 45230, planta: "MAO", alertas: [] },
  { id: "FRT-2026-0002", placa: "ROD-2B02", tipo: "Caminhão Toco", modelo: "VW Delivery 11.180", ano: 2023, setor: "Expedição", motoristaResponsavel: "Paulo Roberto", status: "DISPONIVEL", ultimaMovimentacao: "2026-03-11T17:00:00", quilometragem: 78500, planta: "MAO", alertas: ["Revisão em 500 km"], proximaManutencao: "2026-03-20" },
  { id: "FRT-2026-0003", placa: "ROD-3C03", tipo: "Utilitário", modelo: "Fiat Fiorino", ano: 2024, setor: "Compras", motoristaResponsavel: "Marcos Vieira", status: "PARADA_PROGRAMADA", ultimaMovimentacao: "2026-03-12T06:00:00", quilometragem: 23100, planta: "MAO", alertas: [] },
  { id: "FRT-2026-0004", placa: "ROD-4D04", tipo: "Van", modelo: "Renault Master", ano: 2022, setor: "Assistência Técnica", motoristaResponsavel: "José Oliveira", status: "EM_MANUTENCAO", ultimaMovimentacao: "2026-03-10T14:00:00", quilometragem: 89700, planta: "MAO", alertas: ["Troca de embreagem"], proximaManutencao: "2026-03-15" },
  { id: "FRT-2026-0005", placa: "ROD-5E05", tipo: "Caminhão 3/4", modelo: "Iveco Daily 35S14", ano: 2024, setor: "Expedição", motoristaResponsavel: "Raimundo Costa", status: "EM_DESLOCAMENTO", ultimaMovimentacao: "2026-03-12T05:30:00", quilometragem: 31200, planta: "MAO", alertas: ["Licenciamento vence em 15 dias"] },
  { id: "FRT-2026-0006", placa: "ROD-6F06", tipo: "Moto", modelo: "Honda CG 160", ano: 2025, setor: "Expedição Urbana", motoristaResponsavel: "Diego Santos", status: "DISPONIVEL", ultimaMovimentacao: "2026-03-12T08:00:00", quilometragem: 8900, planta: "MAO", alertas: [] },
  { id: "FRT-2026-0007", placa: "ROD-7G07", tipo: "Caminhão Truck", modelo: "Scania P250", ano: 2021, setor: "Transferência", motoristaResponsavel: "Luís Fernando", status: "BLOQUEADO", ultimaMovimentacao: "2026-03-08T10:00:00", quilometragem: 156000, planta: "MAO", alertas: ["IPVA atrasado", "Seguro vencido"] },
];

export const mockDeslocamentos: DeslocamentoFrota[] = [
  { id: "DSL-001", veiculoId: "FRT-2026-0001", placa: "ROD-1A01", motorista: "Antônio Souza", origem: "Fábrica MAO", destino: "Cliente Magazine Luiza - Centro", horarioSaida: "2026-03-12T07:30:00", horarioPrevistoChegada: "2026-03-12T08:30:00", status: "EM_ROTA", kmPercorrido: 12 },
  { id: "DSL-002", veiculoId: "FRT-2026-0005", placa: "ROD-5E05", motorista: "Raimundo Costa", origem: "CD Manaus", destino: "Filial Iranduba", horarioSaida: "2026-03-12T05:30:00", horarioPrevistoChegada: "2026-03-12T07:00:00", status: "ATRASADO", kmPercorrido: 35 },
  { id: "DSL-003", veiculoId: "FRT-2026-0002", placa: "ROD-2B02", motorista: "Paulo Roberto", origem: "Fábrica MAO", destino: "CD Belém", horarioSaida: "2026-03-11T06:00:00", horarioPrevistoChegada: "2026-03-13T18:00:00", horarioRealChegada: "2026-03-13T16:30:00", status: "CONCLUIDO", kmPercorrido: 1650 },
];

// ── TRANSPORTADORAS ──
export const mockTransportadoras: Transportadora[] = [
  { id: "TRN-001", nome: "Rápido Manaus Logística", cnpj: "12.345.678/0001-90", contato: "Carlos Operações", telefone: "(92) 3232-1010", status: "ATIVA", rntrc: "RNTRC-000123", qtdOperacoes: 48, mediaAtraso: 15, slaScore: 87 },
  { id: "TRN-002", nome: "TransBrasil Cargas", cnpj: "98.765.432/0001-10", contato: "Sandra Logística", telefone: "(92) 3131-2020", status: "ATIVA", rntrc: "RNTRC-000456", qtdOperacoes: 32, mediaAtraso: 45, slaScore: 62 },
  { id: "TRN-003", nome: "Norte Frete Express", cnpj: "55.444.333/0001-22", contato: "Marcos Expedição", telefone: "(92) 3030-3030", status: "ATIVA", rntrc: "RNTRC-000789", qtdOperacoes: 15, mediaAtraso: 8, slaScore: 94 },
  { id: "TRN-004", nome: "Amazônia Log", cnpj: "11.222.333/0001-44", contato: "Roberto Fretes", telefone: "(92) 2929-4040", status: "BLOQUEADA", rntrc: "RNTRC-001234", qtdOperacoes: 5, mediaAtraso: 120, slaScore: 28 },
];

export const mockMotoristasTerceiros: MotoristaTerceiro[] = [
  { id: "MOT-T-001", nome: "Carlos Eduardo Silva", documento: "987.654.321-00", transportadoraId: "TRN-001", transportadoraNome: "Rápido Manaus Logística", telefone: "(92) 98765-0001", status: "ATIVO", ultimaEntrada: "2026-03-12T07:45:00" },
  { id: "MOT-T-002", nome: "José Raimundo Costa", documento: "111.222.333-44", transportadoraId: "TRN-002", transportadoraNome: "TransBrasil Cargas", telefone: "(92) 98765-0002", status: "ATIVO", ultimaEntrada: "2026-03-12T08:30:00" },
  { id: "MOT-T-003", nome: "Francisco Lima", documento: "777.888.999-00", transportadoraId: "TRN-003", transportadoraNome: "Norte Frete Express", telefone: "(92) 98765-0003", status: "ATIVO" },
  { id: "MOT-T-004", nome: "Reginaldo Souza", documento: "444.555.666-11", transportadoraId: "TRN-004", transportadoraNome: "Amazônia Log", telefone: "(92) 98765-0004", status: "BLOQUEADO" },
];

export const mockVeiculosTerceiros: VeiculoTerceiro[] = [
  { id: "VT-001", placa: "MNO-5F67", tipo: "Caminhão Truck", transportadoraId: "TRN-001", transportadoraNome: "Rápido Manaus Logística", motoristaId: "MOT-T-001", motoristaNome: "Carlos Eduardo Silva", statusOperacao: "EM_DOCA", localizacao: "Doca 03", docaAtual: "DCA-003" },
  { id: "VT-002", placa: "GHI-3H89", tipo: "Carreta", transportadoraId: "TRN-002", transportadoraNome: "TransBrasil Cargas", motoristaId: "MOT-T-002", motoristaNome: "José Raimundo Costa", statusOperacao: "AGUARDANDO_DOCA", localizacao: "Pátio" },
  { id: "VT-003", placa: "PQR-6I01", tipo: "Caminhão Toco", transportadoraId: "TRN-003", transportadoraNome: "Norte Frete Express", motoristaId: "MOT-T-003", motoristaNome: "Francisco Lima", statusOperacao: "FILA_EXTERNA", localizacao: "Fila Externa" },
];

export const mockOperacoes: OperacaoTerceiro[] = [
  { id: "OPR-2026-0001", tipo: "DESCARGA", transportadoraId: "TRN-001", transportadoraNome: "Rápido Manaus Logística", motoristaId: "MOT-T-001", motoristaNome: "Carlos Eduardo Silva", veiculoId: "VT-001", placa: "MNO-5F67", docaId: "DCA-003", docaNome: "Doca 03", horarioPrevisto: "2026-03-12T07:00:00", horarioChegada: "2026-03-12T07:45:00", horarioInicio: "2026-03-12T08:15:00", status: "EM_ANDAMENTO", nfVinculada: "NF-112500", planta: "MAO" },
  { id: "OPR-2026-0002", tipo: "CARGA", transportadoraId: "TRN-002", transportadoraNome: "TransBrasil Cargas", motoristaId: "MOT-T-002", motoristaNome: "José Raimundo Costa", veiculoId: "VT-002", placa: "GHI-3H89", horarioPrevisto: "2026-03-12T06:00:00", horarioChegada: "2026-03-12T08:30:00", status: "ATRASADA", nfVinculada: "NF-113200", planta: "MAO" },
  { id: "OPR-2026-0003", tipo: "COLETA", transportadoraId: "TRN-003", transportadoraNome: "Norte Frete Express", motoristaId: "MOT-T-003", motoristaNome: "Francisco Lima", veiculoId: "VT-003", placa: "PQR-6I01", horarioPrevisto: "2026-03-12T10:00:00", status: "AGENDADA", planta: "MAO" },
  { id: "OPR-2026-0004", tipo: "DESCARGA", transportadoraId: "TRN-001", transportadoraNome: "Rápido Manaus Logística", motoristaId: "MOT-T-001", motoristaNome: "Carlos Eduardo Silva", veiculoId: "VT-001", placa: "MNO-5F67", docaId: "DCA-001", docaNome: "Doca 01", horarioPrevisto: "2026-03-11T14:00:00", horarioChegada: "2026-03-11T14:10:00", horarioInicio: "2026-03-11T14:30:00", horarioFim: "2026-03-11T16:00:00", horarioSaida: "2026-03-11T16:15:00", status: "CONCLUIDA", tempoTotal: 125, planta: "MAO" },
];

export const mockAgendamentos: AgendamentoDoca[] = [
  { id: "AGE-2026-0001", docaId: "DCA-003", docaNome: "Doca 03", transportadoraId: "TRN-001", transportadoraNome: "Rápido Manaus Logística", operacao: "DESCARGA", horarioPrevisto: "2026-03-12T07:00:00", status: "EM_ANDAMENTO", placa: "MNO-5F67", motorista: "Carlos Eduardo Silva", planta: "MAO" },
  { id: "AGE-2026-0002", docaId: "DCA-001", docaNome: "Doca 01", transportadoraId: "TRN-002", transportadoraNome: "TransBrasil Cargas", operacao: "CARGA", horarioPrevisto: "2026-03-12T06:00:00", etaEstimado: "2026-03-12T08:30:00", status: "JANELA_PERDIDA", placa: "GHI-3H89", motorista: "José Raimundo Costa", planta: "MAO" },
  { id: "AGE-2026-0003", docaId: "DCA-002", docaNome: "Doca 02", transportadoraId: "TRN-003", transportadoraNome: "Norte Frete Express", operacao: "COLETA", horarioPrevisto: "2026-03-12T10:00:00", status: "CONFIRMADO", placa: "PQR-6I01", motorista: "Francisco Lima", planta: "MAO" },
  { id: "AGE-2026-0004", docaId: "DCA-001", docaNome: "Doca 01", transportadoraId: "TRN-002", transportadoraNome: "TransBrasil Cargas", operacao: "CARGA", horarioPrevisto: "2026-03-12T11:00:00", status: "REPLANEJADO", placa: "GHI-3H89", motorista: "José Raimundo Costa", planta: "MAO" },
  { id: "AGE-2026-0005", docaId: "DCA-004", docaNome: "Doca 04", transportadoraId: "TRN-001", transportadoraNome: "Rápido Manaus Logística", operacao: "DESCARGA", horarioPrevisto: "2026-03-12T14:00:00", status: "PENDENTE", planta: "MAO" },
];

// ── PÁTIO / DOCAS ──
export const mockDocas: Doca[] = [
  { id: "DCA-001", nome: "Doca 01", status: "LIVRE", planta: "MAO" },
  { id: "DCA-002", nome: "Doca 02", status: "LIVRE", planta: "MAO" },
  { id: "DCA-003", nome: "Doca 03", status: "OCUPADA", veiculoAtual: "VT-001", placaAtual: "MNO-5F67", operacaoAtual: "Descarga NF-112500", tempoOcupacao: 75, planta: "MAO" },
  { id: "DCA-004", nome: "Doca 04", status: "MANUTENCAO", planta: "MAO" },
  { id: "DCA-005", nome: "Doca 05", status: "LIVRE", planta: "MAO" },
];

export const mockFilaPatio: FilaPatio[] = [
  { id: "FP-001", ordem: 1, placa: "GHI-3H89", tipoVeiculo: "Carreta", transportadora: "TransBrasil Cargas", operacao: "CARGA", horarioChegada: "2026-03-12T08:30:00", tempoAguardando: 90, prioridade: "ALTA", status: "AGUARDANDO_DOCA" },
  { id: "FP-002", ordem: 2, placa: "PQR-6I01", tipoVeiculo: "Caminhão Toco", transportadora: "Norte Frete Express", operacao: "COLETA", horarioChegada: "2026-03-12T09:30:00", tempoAguardando: 30, prioridade: "NORMAL", status: "FILA_EXTERNA" },
  { id: "FP-003", ordem: 3, placa: "STU-7J23", tipoVeiculo: "Truck", transportadora: "Rápido Manaus Logística", operacao: "DESCARGA", horarioChegada: "2026-03-12T09:45:00", tempoAguardando: 15, prioridade: "NORMAL", status: "FILA_EXTERNA" },
];

// ── ALERTAS E EXCEÇÕES ──
export const mockAlertas: AlertaOperacional[] = [
  { id: "ALT-001", tipo: "ATRASO_OPERACAO", descricao: "Operação OPR-2026-0002 atrasada — veículo chegou 2h30 após horário previsto", origem: "Operação", origemId: "OPR-2026-0002", criticidade: "ALTA", responsavel: "Logística", status: "ATIVO", criadoEm: "2026-03-12T08:35:00", acaoSugerida: "Replanejar doca e notificar expedição" },
  { id: "ALT-002", tipo: "DOCA_OCUPADA_ACIMA_LIMITE", descricao: "Doca 03 ocupada há 75 minutos — limite: 60 minutos", origem: "Pátio", origemId: "DCA-003", criticidade: "MEDIA", responsavel: "Supervisor Pátio", status: "ATIVO", criadoEm: "2026-03-12T09:30:00", acaoSugerida: "Verificar andamento da descarga" },
  { id: "ALT-003", tipo: "VISITA_EXPIRADA", descricao: "Visitante Patrícia Lima Santos não compareceu na data prevista", origem: "Visitante", origemId: "VIS-2026-0004", criticidade: "BAIXA", responsavel: "Compras", status: "ATIVO", criadoEm: "2026-03-11T00:01:00" },
  { id: "ALT-004", tipo: "NF_EM_RISCO", descricao: "NF 113200 — 5 dias em trânsito sem confirmação de recebimento", origem: "NF em Trânsito", origemId: "NFT-2026-0003", criticidade: "ALTA", responsavel: "Logística", status: "ATIVO", criadoEm: "2026-03-12T06:00:00", acaoSugerida: "Contatar transportadora e rastrear carga" },
  { id: "ALT-005", tipo: "PLACA_BLOCKLIST", descricao: "Placa XYZ-9K99 identificada na portaria — blocklist ativa", origem: "Portaria", origemId: "ACS-2026-0009", criticidade: "CRITICA", responsavel: "Segurança", status: "ATIVO", criadoEm: "2026-03-12T10:00:00", acaoSugerida: "Recusar entrada e notificar segurança" },
  { id: "ALT-006", tipo: "VEICULO_SEM_SAIDA", descricao: "Veículo ROD-7G07 sem registro de saída há 4 dias", origem: "Frota", origemId: "FRT-2026-0007", criticidade: "MEDIA", responsavel: "Frota", status: "RECONHECIDO", criadoEm: "2026-03-08T10:00:00" },
  { id: "ALT-007", tipo: "SELFIE_PENDENTE", descricao: "Visitante Fernando Albuquerque — selfie pendente de validação", origem: "Visitante", origemId: "VIS-2026-0005", criticidade: "BAIXA", responsavel: "Portaria", status: "ATIVO", criadoEm: "2026-03-12T08:05:00" },
  { id: "ALT-008", tipo: "JANELA_PERDIDA", descricao: "Janela de doca AGE-2026-0002 perdida — TransBrasil Cargas", origem: "Agendamento", origemId: "AGE-2026-0002", criticidade: "ALTA", responsavel: "Logística", status: "ATIVO", criadoEm: "2026-03-12T06:30:00", acaoSugerida: "Replanejar janela e registrar ocorrência" },
];

export const mockExcecoes: ExcecaoOperacional[] = [
  { id: "EXC-2026-0001", tipo: "Atraso Operacional", origem: "Operação", origemId: "OPR-2026-0002", descricao: "Veículo GHI-3H89 chegou 2h30 atrasado para operação de carga", criticidade: "ALTA", responsavel: "Logística", status: "ABERTA", abertura: "2026-03-12T08:35:00", prazo: "2026-03-12T12:00:00", acaoSugerida: "Replanejar e abrir NC se reincidente" },
  { id: "EXC-2026-0002", tipo: "Divergência Fiscal", origem: "NF em Trânsito", origemId: "NFT-2026-0004", descricao: "CT-e com valor divergente da NF — diferença de R$ 1.250,00", criticidade: "CRITICA", responsavel: "Fiscal", status: "EM_TRATAMENTO", abertura: "2026-03-11T14:00:00", prazo: "2026-03-12T14:00:00", acaoSugerida: "Verificar com transportadora e abrir NC", ncVinculada: "NC-006" },
  { id: "EXC-2026-0003", tipo: "Transportadora Reincidente", origem: "Transportadora", origemId: "TRN-004", descricao: "Amazônia Log com 5 ocorrências de atraso nos últimos 30 dias — média de 120 min", criticidade: "ALTA", responsavel: "Logística", status: "ESCALADA", abertura: "2026-03-10T10:00:00", prazo: "2026-03-12T10:00:00", acaoSugerida: "Avaliar bloqueio definitivo e abrir CAPA" },
  { id: "EXC-2026-0004", tipo: "Veículo sem Encerramento", origem: "Frota", origemId: "FRT-2026-0007", descricao: "Veículo ROD-7G07 retornou à unidade mas não teve operação encerrada", criticidade: "MEDIA", responsavel: "Frota", status: "ABERTA", abertura: "2026-03-08T18:00:00", prazo: "2026-03-12T18:00:00", acaoSugerida: "Regularizar registro e auditar processo" },
];

// ── NF EM TRÂNSITO ──
export const mockNFsTransito: NFTransito[] = [
  { id: "NFT-2026-0001", numero: "NF-113500", chaveNfe: "13260312345678000190550010001135001001135009", cliente: "Magazine Luiza — CD São Paulo", destino: "São Paulo / SP", uf: "SP", valor: 185000, peso: 4200, volumes: 120, dataEmissao: "2026-03-10", dataSaidaPrevista: "2026-03-10", dataSaidaReal: "2026-03-10T16:00:00", dataEntregaPrevista: "2026-03-15", diasEmTransito: 2, status: "EM_TRANSITO", criticidade: "VERDE", scoreRisco: 15, transportadoraNome: "Norte Frete Express", transportadoraId: "TRN-003", placa: "NRF-8A01", motoristaNome: "Francisco Lima", motoristaId: "MOT-T-003", pedido: "PED-90100", carga: "CRG-2026-0045", mdfeNumero: "MDF-e 132603000001", mdfeStatus: "Autorizado", cteNumero: "CT-e 132603000012", cteStatus: "Autorizado", checkpoints: [
    { id: "CK-001", tipo: "SAIDA_PORTARIA", descricao: "Saída registrada na portaria MAO", dataHora: "2026-03-10T16:00:00", localizacao: "Portaria MAO", responsavel: "Portaria" },
    { id: "CK-002", tipo: "CHECKPOINT", descricao: "Checkpoint Porto Velho/RO", dataHora: "2026-03-11T22:00:00", localizacao: "Porto Velho / RO" },
  ], alertas: [], planta: "MAO" },
  { id: "NFT-2026-0002", numero: "NF-113450", chaveNfe: "13260312345678000190550010001134501001134509", cliente: "Casas Bahia — CD Camaçari", destino: "Camaçari / BA", uf: "BA", valor: 92000, peso: 2100, volumes: 60, dataEmissao: "2026-03-08", dataSaidaPrevista: "2026-03-08", dataSaidaReal: "2026-03-08T14:00:00", dataEntregaPrevista: "2026-03-13", diasEmTransito: 4, status: "CHECKPOINT_RECEBIDO", criticidade: "AMARELO", scoreRisco: 45, motivoRisco: "Prazo de entrega se aproximando", transportadoraNome: "Rápido Manaus Logística", transportadoraId: "TRN-001", placa: "RML-2B03", motoristaNome: "Carlos Eduardo Silva", pedido: "PED-89500", carga: "CRG-2026-0042", mdfeNumero: "MDF-e 132603000002", mdfeStatus: "Autorizado", cteNumero: "CT-e 132603000010", cteStatus: "Autorizado", checkpoints: [
    { id: "CK-003", tipo: "SAIDA_PORTARIA", descricao: "Saída registrada", dataHora: "2026-03-08T14:00:00", localizacao: "Portaria MAO" },
    { id: "CK-004", tipo: "CHECKPOINT", descricao: "Checkpoint Imperatriz/MA", dataHora: "2026-03-10T08:00:00", localizacao: "Imperatriz / MA" },
    { id: "CK-005", tipo: "CHECKPOINT", descricao: "Checkpoint Teresina/PI", dataHora: "2026-03-11T16:00:00", localizacao: "Teresina / PI" },
  ], alertas: ["Prazo se aproximando — 2 dias restantes"], planta: "MAO" },
  { id: "NFT-2026-0003", numero: "NF-113200", chaveNfe: "13260312345678000190550010001132001001132009", cliente: "Havan — CD Brusque", destino: "Brusque / SC", uf: "SC", valor: 256000, peso: 5800, volumes: 180, dataEmissao: "2026-03-07", dataSaidaPrevista: "2026-03-07", dataSaidaReal: "2026-03-07T10:00:00", dataEntregaPrevista: "2026-03-12", diasEmTransito: 5, status: "EM_RISCO", criticidade: "VERMELHO", scoreRisco: 78, motivoRisco: "Prazo vencido — sem confirmação de recebimento", acaoRecomendada: "Contatar transportadora e rastrear carga imediatamente", transportadoraNome: "TransBrasil Cargas", transportadoraId: "TRN-002", placa: "TBC-4C05", motoristaNome: "José Raimundo Costa", pedido: "PED-88900", carga: "CRG-2026-0040", mdfeNumero: "MDF-e 132603000003", mdfeStatus: "Autorizado", cteNumero: "CT-e 132603000008", cteStatus: "Autorizado", checkpoints: [
    { id: "CK-006", tipo: "SAIDA_PORTARIA", descricao: "Saída registrada", dataHora: "2026-03-07T10:00:00", localizacao: "Portaria MAO" },
    { id: "CK-007", tipo: "CHECKPOINT", descricao: "Checkpoint Porto Velho/RO", dataHora: "2026-03-08T18:00:00", localizacao: "Porto Velho / RO" },
  ], alertas: ["Prazo vencido", "Sem atualização há 3 dias", "Sem confirmação de recebimento"], planta: "MAO" },
  { id: "NFT-2026-0004", numero: "NF-113100", chaveNfe: "13260312345678000190550010001131001001131009", cliente: "Riachuelo — CD Natal", destino: "Natal / RN", uf: "RN", valor: 67000, peso: 1500, volumes: 45, dataEmissao: "2026-03-05", dataSaidaPrevista: "2026-03-05", dataSaidaReal: "2026-03-05T08:00:00", dataEntregaPrevista: "2026-03-10", diasEmTransito: 7, status: "CRITICA", criticidade: "CRITICO", scoreRisco: 95, motivoRisco: "CT-e com valor divergente + prazo vencido há 2 dias", acaoRecomendada: "Abrir NC e SAC — divergência fiscal e atraso", transportadoraNome: "Amazônia Log", transportadoraId: "TRN-004", placa: "AML-1Z99", motoristaNome: "Reginaldo Souza", pedido: "PED-88200", mdfeNumero: "MDF-e 132603000004", mdfeStatus: "Autorizado", cteNumero: "CT-e 132603000005", cteStatus: "Divergente", checkpoints: [
    { id: "CK-008", tipo: "SAIDA_PORTARIA", descricao: "Saída registrada", dataHora: "2026-03-05T08:00:00", localizacao: "Portaria MAO" },
  ], alertas: ["Prazo vencido há 2 dias", "CT-e divergente", "Sem checkpoint desde a saída", "Transportadora bloqueada"], planta: "MAO" },
  { id: "NFT-2026-0005", numero: "NF-113600", chaveNfe: "13260312345678000190550010001136001001136009", cliente: "Ponto Frio — CD RJ", destino: "Rio de Janeiro / RJ", uf: "RJ", valor: 142000, peso: 3200, volumes: 95, dataEmissao: "2026-03-11", dataSaidaPrevista: "2026-03-11", dataSaidaReal: "2026-03-11T15:00:00", dataEntregaPrevista: "2026-03-16", diasEmTransito: 1, status: "SAIDA_REGISTRADA", criticidade: "VERDE", scoreRisco: 8, transportadoraNome: "Norte Frete Express", transportadoraId: "TRN-003", placa: "NRF-9B02", motoristaNome: "Tiago Oliveira", pedido: "PED-90200", carga: "CRG-2026-0048", mdfeNumero: "MDF-e 132603000005", mdfeStatus: "Autorizado", cteNumero: "CT-e 132603000015", cteStatus: "Autorizado", checkpoints: [
    { id: "CK-009", tipo: "SAIDA_PORTARIA", descricao: "Saída registrada na portaria MAO", dataHora: "2026-03-11T15:00:00", localizacao: "Portaria MAO", responsavel: "Portaria" },
  ], alertas: [], planta: "MAO" },
  { id: "NFT-2026-0006", numero: "NF-112900", chaveNfe: "13260312345678000190550010001129001001129009", cliente: "Magazine Luiza — CD Uberlândia", destino: "Uberlândia / MG", uf: "MG", valor: 198000, peso: 4500, volumes: 140, dataEmissao: "2026-03-03", dataSaidaPrevista: "2026-03-03", dataSaidaReal: "2026-03-03T07:00:00", dataEntregaPrevista: "2026-03-08", dataEntregaReal: "2026-03-08T14:00:00", diasEmTransito: 5, status: "RECEBIMENTO_CONFIRMADO", criticidade: "VERDE", scoreRisco: 0, transportadoraNome: "Norte Frete Express", transportadoraId: "TRN-003", pedido: "PED-87800", carga: "CRG-2026-0038", mdfeNumero: "MDF-e 132603000006", mdfeStatus: "Encerrado", cteNumero: "CT-e 132603000003", cteStatus: "Autorizado", checkpoints: [
    { id: "CK-010", tipo: "SAIDA_PORTARIA", descricao: "Saída registrada", dataHora: "2026-03-03T07:00:00", localizacao: "Portaria MAO" },
    { id: "CK-011", tipo: "CHECKPOINT", descricao: "Porto Velho / RO", dataHora: "2026-03-04T20:00:00", localizacao: "Porto Velho / RO" },
    { id: "CK-012", tipo: "CHECKPOINT", descricao: "Cuiabá / MT", dataHora: "2026-03-06T10:00:00", localizacao: "Cuiabá / MT" },
    { id: "CK-013", tipo: "RECEBIMENTO", descricao: "Recebimento confirmado pelo CD", dataHora: "2026-03-08T14:00:00", localizacao: "Uberlândia / MG", responsavel: "CD Uberlândia" },
  ], alertas: [], planta: "MAO" },
];

export const mockExcecoesFiscais: ExcecaoFiscal[] = [
  { id: "EXF-001", tipo: "CT-e Divergente", nfId: "NFT-2026-0004", nfNumero: "NF-113100", descricao: "Valor do CT-e diverge do valor da NF — diferença de R$ 1.250,00", criticidade: "CRITICO", status: "EM_TRATAMENTO", criadoEm: "2026-03-11T14:00:00", responsavel: "Fiscal" },
  { id: "EXF-002", tipo: "MDF-e Ausente", nfId: "NFT-2026-0004", nfNumero: "NF-113100", descricao: "MDF-e associado sem encerramento após 7 dias", criticidade: "VERMELHO", status: "ABERTA", criadoEm: "2026-03-12T06:00:00" },
  { id: "EXF-003", tipo: "Sem Confirmação", nfId: "NFT-2026-0003", nfNumero: "NF-113200", descricao: "NF sem confirmação de recebimento — prazo vencido", criticidade: "VERMELHO", status: "ABERTA", criadoEm: "2026-03-12T06:00:00", responsavel: "Logística" },
  { id: "EXF-004", tipo: "Sem Checkpoint", nfId: "NFT-2026-0004", nfNumero: "NF-113100", descricao: "Nenhum checkpoint registrado desde a saída há 7 dias", criticidade: "CRITICO", status: "ABERTA", criadoEm: "2026-03-12T06:00:00" },
];

// ── MOVIMENTAÇÕES FROTA ──
export interface MovimentacaoFrota {
  id: string;
  veiculoId: string;
  statusAnterior: string;
  statusNovo: string;
  descricao: string;
  dataHora: string;
  usuario: string;
  docaNome?: string;
  km?: number;
}

export const mockMovimentacoesFrota: MovimentacaoFrota[] = [
  { id: "MOV-001", veiculoId: "FRT-2026-0001", statusAnterior: "DISPONIVEL", statusNovo: "EM_DESLOCAMENTO", descricao: "Saída para entrega — Cliente Magazine Luiza Centro", dataHora: "2026-03-12T07:30:00", usuario: "Antônio Souza", km: 45218 },
  { id: "MOV-002", veiculoId: "FRT-2026-0001", statusAnterior: "EM_MANUTENCAO", statusNovo: "DISPONIVEL", descricao: "Retorno da manutenção preventiva", dataHora: "2026-03-11T16:00:00", usuario: "Oficina Central", docaNome: "Doca 02" },
  { id: "MOV-003", veiculoId: "FRT-2026-0001", statusAnterior: "DISPONIVEL", statusNovo: "EM_MANUTENCAO", descricao: "Entrada para manutenção preventiva 50.000 km", dataHora: "2026-03-10T08:00:00", usuario: "Paulo Roberto" },
  { id: "MOV-004", veiculoId: "FRT-2026-0002", statusAnterior: "EM_DESLOCAMENTO", statusNovo: "DISPONIVEL", descricao: "Retorno de entrega — CD Belém", dataHora: "2026-03-11T17:00:00", usuario: "Paulo Roberto", docaNome: "Doca 01", km: 78500 },
  { id: "MOV-005", veiculoId: "FRT-2026-0004", statusAnterior: "DISPONIVEL", statusNovo: "EM_MANUTENCAO", descricao: "Troca de embreagem — defeito identificado", dataHora: "2026-03-10T14:00:00", usuario: "Mecânica Externa" },
  { id: "MOV-006", veiculoId: "FRT-2026-0005", statusAnterior: "DISPONIVEL", statusNovo: "EM_DESLOCAMENTO", descricao: "Saída para Filial Iranduba", dataHora: "2026-03-12T05:30:00", usuario: "Raimundo Costa", km: 31180 },
  { id: "MOV-007", veiculoId: "FRT-2026-0007", statusAnterior: "EM_DESLOCAMENTO", statusNovo: "BLOQUEADO", descricao: "Veículo bloqueado — IPVA atrasado e seguro vencido", dataHora: "2026-03-08T10:00:00", usuario: "Administrativo" },
];

// ── TIMELINE DE EVENTOS ──
export const mockTimelinePortaria: EventoTimeline[] = [
  { id: "EVT-001", tipo: "PRE_AUTORIZACAO", descricao: "Pré-autorização criada", dataHora: "2026-03-11T15:00:00", usuario: "Ana Paula Soares" },
  { id: "EVT-002", tipo: "LINK_ENVIADO", descricao: "Link de cadastro enviado ao visitante", dataHora: "2026-03-11T15:05:00", usuario: "Sistema" },
  { id: "EVT-003", tipo: "CADASTRO_PREENCHIDO", descricao: "Visitante preencheu dados e enviou selfie", dataHora: "2026-03-11T18:30:00", usuario: "João Carlos de Mendonça" },
  { id: "EVT-004", tipo: "APROVACAO", descricao: "Acesso aprovado pela responsável", dataHora: "2026-03-11T19:00:00", usuario: "Ana Paula Soares" },
  { id: "EVT-005", tipo: "QR_GERADO", descricao: "QR Code gerado e disponibilizado", dataHora: "2026-03-11T19:01:00", usuario: "Sistema" },
  { id: "EVT-006", tipo: "ENTRADA_REGISTRADA", descricao: "Entrada registrada na portaria — QR Code lido", dataHora: "2026-03-12T09:12:00", usuario: "Portaria", detalhes: "Placa ABC-1D23 identificada" },
];

// ── Dashboard KPIs ──
export const dashboardOperacional = {
  visitantesPresentes: 2,
  veiculosVisitantesPresentes: 1,
  frotaEmDeslocamento: 2,
  terceirosNaUnidade: 2,
  docasOcupadas: 1,
  docasTotal: 5,
  filaExterna: 2,
  filaInterna: 0,
  veiculosParados: 1,
  veiculosManutencao: 1,
  nfsEmTransito: 3,
  nfsEmRisco: 2,
  nfsSemConfirmacao: 2,
  valorEmTransito: 600000,
  valorEmRisco: 323000,
  mediaDiasTransito: 3.8,
  alertasAtivos: 6,
  excecoesAbertas: 3,
  operacoesHoje: 4,
  tempoMedioPatio: 65,
  slaGeral: 74,
};
