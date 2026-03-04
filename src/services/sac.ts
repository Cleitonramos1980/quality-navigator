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
  const todos = [
    { numped: "PED-88421", numnf: "NF-112340", codcli: "1042", dtPedido: "2026-01-10", vlrPedido: 1890.0, status: "FATURADO", canal: "LOJA" },
    { numped: "PED-88500", numnf: "NF-112500", codcli: "1042", dtPedido: "2026-02-05", vlrPedido: 3250.0, status: "FATURADO", canal: "ECOMMERCE" },
    { numped: "PED-77312", numnf: "NF-109877", codcli: "2081", dtPedido: "2026-01-15", vlrPedido: 2450.0, status: "FATURADO", canal: "ECOMMERCE" },
    { numped: "PED-66201", numnf: "", codcli: "3055", dtPedido: "2026-02-10", vlrPedido: 1200.0, status: "EM_SEPARACAO", canal: "LOJA" },
  ];
  return codcli ? todos.filter((p) => p.codcli === codcli) : todos;
}

export async function buscarItensPedidoERP(numped: string) {
  const itensMap: Record<string, Array<{ numped: string; numnf: string; codprod: string; descricao: string; un: string; qtd: number; vlrUnit: number; vlrTotal: number }>> = {
    "PED-88421": [
      { numped: "PED-88421", numnf: "NF-112340", codprod: "COL-QN-001", descricao: "Colchão Queen Premium Molas Ensacadas", un: "UN", qtd: 2, vlrUnit: 789.0, vlrTotal: 1578.0 },
      { numped: "PED-88421", numnf: "NF-112340", codprod: "TRV-VIS-01", descricao: "Travesseiro Viscoelástico", un: "UN", qtd: 4, vlrUnit: 78.0, vlrTotal: 312.0 },
    ],
    "PED-88500": [
      { numped: "PED-88500", numnf: "NF-112500", codprod: "COL-CS-002", descricao: "Colchão Casal Ortopédico", un: "UN", qtd: 3, vlrUnit: 650.0, vlrTotal: 1950.0 },
      { numped: "PED-88500", numnf: "NF-112500", codprod: "COL-SL-003", descricao: "Colchão Solteiro Confort", un: "UN", qtd: 5, vlrUnit: 260.0, vlrTotal: 1300.0 },
    ],
    "PED-77312": [
      { numped: "PED-77312", numnf: "NF-109877", codprod: "COL-KG-004", descricao: "Colchão King Size Luxo", un: "UN", qtd: 1, vlrUnit: 2450.0, vlrTotal: 2450.0 },
    ],
    "PED-66201": [
      { numped: "PED-66201", numnf: "", codprod: "COL-QN-001", descricao: "Colchão Queen Premium Molas Ensacadas", un: "UN", qtd: 1, vlrUnit: 789.0, vlrTotal: 789.0 },
      { numped: "PED-66201", numnf: "", codprod: "PRO-BS-01", descricao: "Protetor de Colchão Impermeável", un: "UN", qtd: 2, vlrUnit: 205.5, vlrTotal: 411.0 },
    ],
  };
  return itensMap[numped] || [];
}

export async function buscarNFVendaERP(filtro?: Record<string, string>) {
  return [
    { numnf: "NF-112340", serie: "1", chaveNfe: "35260247960950000121550010001123401001123400", dtEmissao: "2026-01-12", codcli: "1042", numped: "PED-88421", vlrTotal: 1890.0 },
    { numnf: "NF-109877", serie: "1", chaveNfe: "35260233041260000165550010001098771001098770", dtEmissao: "2026-01-18", codcli: "2081", numped: "PED-77312", vlrTotal: 2450.0 },
  ];
}
