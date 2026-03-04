import { useState } from "react";
import { Link } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { buscarClientesERP, buscarPedidosERP, buscarNFVendaERP } from "@/services/sac";
import { mockAtendimentos } from "@/data/mockSACData";
import { mockGarantias, mockNCs, mockCAPAs } from "@/data/mockData";
import { SAC_STATUS_LABELS, SAC_STATUS_COLORS } from "@/types/sac";
import { Search, Plus, Eye, FileText, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

const PesquisaSACPage = () => {
  const [clienteSearch, setClienteSearch] = useState("");
  const [pedidoSearch, setPedidoSearch] = useState("");
  const [nfSearch, setNfSearch] = useState("");
  const [historicoSearch, setHistoricoSearch] = useState("");

  // Mock results
  const clientes = [
    { codcli: "1042", nome: "Magazine Luiza", cgcent: "47.960.950/0001-21", telefones: "(92) 3232-1010", cidade: "Manaus", uf: "AM" },
    { codcli: "2081", nome: "Casas Bahia", cgcent: "33.041.260/0001-65", telefones: "(91) 3344-5566", cidade: "Belém", uf: "PA" },
    { codcli: "3055", nome: "Ponto Frio", cgcent: "44.123.456/0001-78", telefones: "(81) 3456-7890", cidade: "Agrestina", uf: "PE" },
  ];

  const pedidos = [
    { numped: "PED-88421", codcli: "1042", dtPedido: "2026-01-10", status: "FATURADO", canal: "LOJA" },
    { numped: "PED-77312", codcli: "2081", dtPedido: "2026-01-15", status: "FATURADO", canal: "ECOMMERCE" },
    { numped: "PED-66201", codcli: "3055", dtPedido: "2025-12-20", status: "ENTREGUE", canal: "LOJA" },
  ];

  const nfs = [
    { numnf: "NF-112340", serie: "1", chaveNfe: "3526024796...400", dtEmissao: "2026-01-12", codcli: "1042", numped: "PED-88421", vlrTotal: 1890.0 },
    { numnf: "NF-109877", serie: "1", chaveNfe: "3526023304...770", dtEmissao: "2026-01-18", codcli: "2081", numped: "PED-77312", vlrTotal: 2450.0 },
  ];

  const filteredClientes = clientes.filter((c) =>
    !clienteSearch || c.nome.toLowerCase().includes(clienteSearch.toLowerCase()) || c.cgcent.includes(clienteSearch) || c.codcli.includes(clienteSearch)
  );

  const filteredPedidos = pedidos.filter((p) =>
    !pedidoSearch || p.numped.toLowerCase().includes(pedidoSearch.toLowerCase()) || p.codcli.includes(pedidoSearch)
  );

  const filteredNFs = nfs.filter((n) =>
    !nfSearch || n.numnf.toLowerCase().includes(nfSearch.toLowerCase()) || n.codcli.includes(nfSearch)
  );

  // Historico: filter atendimentos + garantias + NCs + CAPAs by client search
  const filteredAtendimentos = mockAtendimentos.filter((a) =>
    !historicoSearch || a.clienteNome.toLowerCase().includes(historicoSearch.toLowerCase()) || a.codcli.includes(historicoSearch)
  );

  const filteredGarantias = mockGarantias.filter((g) =>
    !historicoSearch || g.clienteNome.toLowerCase().includes(historicoSearch.toLowerCase()) || g.codcli.includes(historicoSearch)
  );

  const filteredNCs = mockNCs.filter((nc) =>
    !historicoSearch || (nc.clienteNome && nc.clienteNome.toLowerCase().includes(historicoSearch.toLowerCase())) || (nc.codcli && nc.codcli.includes(historicoSearch))
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Pesquisa SAC</h1>
        <p className="text-sm text-muted-foreground">Consulte clientes, pedidos, notas fiscais e histórico</p>
      </div>

      <Tabs defaultValue="clientes">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="clientes">Clientes</TabsTrigger>
          <TabsTrigger value="pedidos">Pedidos</TabsTrigger>
          <TabsTrigger value="nfs">Notas Fiscais</TabsTrigger>
          <TabsTrigger value="historico">Histórico</TabsTrigger>
        </TabsList>

        {/* Clientes Tab */}
        <TabsContent value="clientes">
          <Card>
            <CardContent className="pt-4 space-y-4">
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Buscar por nome, CPF/CNPJ ou código..." value={clienteSearch} onChange={(e) => setClienteSearch(e.target.value)} className="pl-9" />
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Código</TableHead>
                    <TableHead>Nome</TableHead>
                    <TableHead className="hidden md:table-cell">CPF/CNPJ</TableHead>
                    <TableHead className="hidden md:table-cell">Telefone</TableHead>
                    <TableHead className="hidden lg:table-cell">Cidade</TableHead>
                    <TableHead className="hidden lg:table-cell">UF</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredClientes.map((c) => (
                    <TableRow key={c.codcli}>
                      <TableCell className="font-mono text-foreground">{c.codcli}</TableCell>
                      <TableCell className="font-medium text-foreground">{c.nome}</TableCell>
                      <TableCell className="hidden md:table-cell font-mono text-xs text-muted-foreground">{c.cgcent}</TableCell>
                      <TableCell className="hidden md:table-cell text-muted-foreground">{c.telefones}</TableCell>
                      <TableCell className="hidden lg:table-cell text-muted-foreground">{c.cidade}</TableCell>
                      <TableCell className="hidden lg:table-cell text-muted-foreground">{c.uf}</TableCell>
                      <TableCell className="text-right">
                        <Link to="/sac/novo">
                          <Button variant="ghost" size="sm"><Plus className="w-3 h-3 mr-1" /> Atendimento</Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pedidos Tab */}
        <TabsContent value="pedidos">
          <Card>
            <CardContent className="pt-4 space-y-4">
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Buscar por número do pedido ou CODCLI..." value={pedidoSearch} onChange={(e) => setPedidoSearch(e.target.value)} className="pl-9" />
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Pedido</TableHead>
                    <TableHead>CODCLI</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Canal</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPedidos.map((p) => (
                    <TableRow key={p.numped}>
                      <TableCell className="font-mono font-medium text-foreground">{p.numped}</TableCell>
                      <TableCell className="font-mono text-muted-foreground">{p.codcli}</TableCell>
                      <TableCell className="text-muted-foreground">{p.dtPedido}</TableCell>
                      <TableCell><span className="status-badge bg-success/15 text-success">{p.status}</span></TableCell>
                      <TableCell className="text-muted-foreground">{p.canal}</TableCell>
                      <TableCell className="text-right">
                        <Link to="/sac/novo">
                          <Button variant="ghost" size="sm"><Plus className="w-3 h-3 mr-1" /> Atendimento</Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notas Fiscais Tab */}
        <TabsContent value="nfs">
          <Card>
            <CardContent className="pt-4 space-y-4">
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Buscar por número NF, chave ou CODCLI..." value={nfSearch} onChange={(e) => setNfSearch(e.target.value)} className="pl-9" />
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>NF</TableHead>
                    <TableHead>Série</TableHead>
                    <TableHead className="hidden md:table-cell">Chave NFe</TableHead>
                    <TableHead>Emissão</TableHead>
                    <TableHead>CODCLI</TableHead>
                    <TableHead>Pedido</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredNFs.map((n) => (
                    <TableRow key={n.numnf}>
                      <TableCell className="font-mono font-medium text-foreground">{n.numnf}</TableCell>
                      <TableCell className="text-muted-foreground">{n.serie}</TableCell>
                      <TableCell className="hidden md:table-cell font-mono text-xs text-muted-foreground">{n.chaveNfe}</TableCell>
                      <TableCell className="text-muted-foreground">{n.dtEmissao}</TableCell>
                      <TableCell className="font-mono text-muted-foreground">{n.codcli}</TableCell>
                      <TableCell className="font-mono text-muted-foreground">{n.numped}</TableCell>
                      <TableCell className="text-right font-medium text-foreground">R$ {n.vlrTotal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Link to="/sac/novo"><Button variant="ghost" size="sm"><Plus className="w-3 h-3 mr-1" /> Atend.</Button></Link>
                          <Link to="/garantias/nova"><Button variant="ghost" size="sm"><ShieldCheck className="w-3 h-3 mr-1" /> Garantia</Button></Link>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Histórico Tab */}
        <TabsContent value="historico">
          <Card>
            <CardContent className="pt-4 space-y-6">
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Buscar por nome do cliente ou CODCLI..." value={historicoSearch} onChange={(e) => setHistoricoSearch(e.target.value)} className="pl-9" />
              </div>

              {/* Atendimentos */}
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-2">Chamados SAC ({filteredAtendimentos.length})</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Data</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAtendimentos.slice(0, 10).map((a) => (
                      <TableRow key={a.id}>
                        <TableCell className="font-mono text-foreground">{a.id}</TableCell>
                        <TableCell className="text-foreground">{a.clienteNome}</TableCell>
                        <TableCell><span className={cn("status-badge", SAC_STATUS_COLORS[a.status])}>{SAC_STATUS_LABELS[a.status]}</span></TableCell>
                        <TableCell className="text-muted-foreground">{a.abertoAt}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Garantias */}
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-2">Garantias ({filteredGarantias.length})</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Defeito</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredGarantias.slice(0, 10).map((g) => (
                      <TableRow key={g.id}>
                        <TableCell className="font-mono text-foreground">{g.id}</TableCell>
                        <TableCell className="text-foreground">{g.clienteNome}</TableCell>
                        <TableCell className="text-muted-foreground">{g.defeito}</TableCell>
                        <TableCell><span className="status-badge bg-info/15 text-info">{g.status}</span></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* NCs */}
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-2">Não Conformidades ({filteredNCs.length})</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Gravidade</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredNCs.slice(0, 10).map((nc) => (
                      <TableRow key={nc.id}>
                        <TableCell className="font-mono text-foreground">{nc.id}</TableCell>
                        <TableCell className="text-foreground">{nc.clienteNome || "—"}</TableCell>
                        <TableCell className="text-muted-foreground">{nc.gravidade}</TableCell>
                        <TableCell><span className="status-badge bg-warning/15 text-warning">{nc.status}</span></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PesquisaSACPage;
