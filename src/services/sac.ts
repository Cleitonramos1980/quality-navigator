import { mockAtendimentos, sacDashboardData } from "@/data/mockSACData";
import { SACAtendimento } from "@/types/sac";

// Mock service — prepared for future Oracle/WinThor REST integration

export async function getSACDashboard() {
  return sacDashboardData;
}

export async function getAtendimentos(): Promise<SACAtendimento[]> {
  return mockAtendimentos;
}

export async function getAtendimentoById(id: string): Promise<SACAtendimento | undefined> {
  return mockAtendimentos.find((a) => a.id === id);
}

export async function criarAtendimento(data: Partial<SACAtendimento>): Promise<SACAtendimento> {
  const novo: SACAtendimento = {
    id: `SAC-${String(mockAtendimentos.length + 1).padStart(3, "0")}`,
    codcli: data.codcli || "",
    clienteNome: data.clienteNome || "",
    cgcent: data.cgcent || "",
    telefone: data.telefone || "",
    canal: data.canal || "TELEFONE",
    tipoContato: data.tipoContato || "RECLAMACAO",
    descricao: data.descricao || "",
    plantaResp: data.plantaResp || "MAO",
    numPedido: data.numPedido,
    numNfVenda: data.numNfVenda,
    status: "ABERTO",
    abertoAt: new Date().toISOString().slice(0, 10),
    atualizadoAt: new Date().toISOString().slice(0, 10),
  };
  mockAtendimentos.push(novo);
  return novo;
}

// ERP views — future integration
export async function buscarClientesERP(filtro: Record<string, string>) {
  // Will call /erp/clientes
  return [
    { codcli: "1042", nome: "Magazine Luiza", cgcent: "47.960.950/0001-21", telefones: "(92) 3232-1010", cidade: "Manaus", uf: "AM" },
    { codcli: "2081", nome: "Casas Bahia", cgcent: "33.041.260/0001-65", telefones: "(91) 3344-5566", cidade: "Belém", uf: "PA" },
    { codcli: "3055", nome: "Ponto Frio", cgcent: "44.123.456/0001-78", telefones: "(81) 3456-7890", cidade: "Agrestina", uf: "PE" },
  ];
}

export async function buscarPedidosERP(codcli?: string) {
  return [
    { numped: "PED-88421", codcli: "1042", dtPedido: "2026-01-10", status: "FATURADO", canal: "LOJA" },
    { numped: "PED-77312", codcli: "2081", dtPedido: "2026-01-15", status: "FATURADO", canal: "ECOMMERCE" },
  ];
}

export async function buscarNFVendaERP(filtro?: Record<string, string>) {
  return [
    { numnf: "NF-112340", serie: "1", chaveNfe: "35260247960950000121550010001123401001123400", dtEmissao: "2026-01-12", codcli: "1042", numped: "PED-88421", vlrTotal: 1890.0 },
    { numnf: "NF-109877", serie: "1", chaveNfe: "35260233041260000165550010001098771001098770", dtEmissao: "2026-01-18", codcli: "2081", numped: "PED-77312", vlrTotal: 2450.0 },
  ];
}
