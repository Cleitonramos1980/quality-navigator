import { lazy, Suspense } from "react";
import type { ReactNode } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import AppLayout from "@/components/AppLayout";
import { RequirePermission, RequireRole, RequireSesmtAccess } from "@/components/RequireAuthz";
import PageSkeleton from "@/components/layout/PageSkeleton";
import RouteErrorBoundary from "@/components/layout/RouteErrorBoundary";

const Dashboard = lazy(() => import("@/pages/Dashboard"));
const GarantiasPage = lazy(() => import("@/pages/GarantiasPage"));
const NCPage = lazy(() => import("@/pages/NCPage"));
const CAPAPage = lazy(() => import("@/pages/CAPAPage"));
const AuditoriasPage = lazy(() => import("@/pages/AuditoriasPage"));
const AdminPage = lazy(() => import("@/pages/AdminPage"));
const LoginPage = lazy(() => import("@/pages/LoginPage"));
const NotFound = lazy(() => import("@/pages/NotFound"));
const NovaGarantiaPage = lazy(() => import("@/pages/garantias/NovaGarantiaPage"));
const NovaNCPage = lazy(() => import("@/pages/nc/NovaNCPage"));
const NovaCAPAPage = lazy(() => import("@/pages/capa/NovaCAPAPage"));
const NovaAuditoriaPage = lazy(() => import("@/pages/auditorias/NovaAuditoriaPage"));
const CalendarioAuditoriasPage = lazy(() => import("@/pages/auditorias/CalendarioAuditoriasPage"));
const DocumentosQualidadePage = lazy(() => import("@/pages/qualidade/DocumentosQualidadePage"));
const TreinamentosQualidadePage = lazy(() => import("@/pages/qualidade/TreinamentosQualidadePage"));
const MudancasQualidadePage = lazy(() => import("@/pages/qualidade/MudancasQualidadePage"));
const FornecedoresQualidadePage = lazy(() => import("@/pages/qualidade/FornecedoresQualidadePage"));
const MetrologiaQualidadePage = lazy(() => import("@/pages/qualidade/MetrologiaQualidadePage"));
const KpisIndustriaisPage = lazy(() => import("@/pages/qualidade/KpisIndustriaisPage"));
const RiscoSlaQualidadePage = lazy(() => import("@/pages/qualidade/RiscoSlaQualidadePage"));
const AuditoriasCamadasPage = lazy(() => import("@/pages/qualidade/AuditoriasCamadasPage"));
const CoreToolsFornecedoresPage = lazy(() => import("@/pages/qualidade/CoreToolsFornecedoresPage"));
const IsoReadinessPage = lazy(() => import("@/pages/qualidade/IsoReadinessPage"));
const UsuariosPage = lazy(() => import("@/pages/admin/UsuariosPage"));
const PerfisPage = lazy(() => import("@/pages/admin/PerfisPage"));
const LogAuditoriaPage = lazy(() => import("@/pages/admin/LogAuditoriaPage"));
const ParametrosPage = lazy(() => import("@/pages/admin/ParametrosPage"));
const SACDashboardPage = lazy(() => import("@/pages/sac/SACDashboardPage"));
const AtendimentosPage = lazy(() => import("@/pages/sac/AtendimentosPage"));
const NovoAtendimentoPage = lazy(() => import("@/pages/sac/NovoAtendimentoPage"));
const AtendimentoDetalhePage = lazy(() => import("@/pages/sac/AtendimentoDetalhePage"));
const AvaliacoesPage = lazy(() => import("@/pages/sac/AvaliacoesPage"));
const AvaliacaoRespostaPage = lazy(() => import("@/pages/sac/AvaliacaoRespostaPage"));
const PesquisaSACPage = lazy(() => import("@/pages/sac/PesquisaSACPage"));
const NovaRequisicaoPage = lazy(() => import("@/pages/sac/requisicoes/NovaRequisicaoPage"));
const RequisicaoListPage = lazy(() => import("@/pages/sac/requisicoes/RequisicaoListPage"));
const RequisicaoDetalhePage = lazy(() => import("@/pages/sac/requisicoes/RequisicaoDetalhePage"));
const AtenderRequisicaoPage = lazy(() => import("@/pages/sac/requisicoes/AtenderRequisicaoPage"));
const AssistenciaDashboardPage = lazy(() => import("@/pages/assistencia/AssistenciaDashboardPage"));
const OSListPage = lazy(() => import("@/pages/assistencia/OSListPage"));
const OSDetalhePage = lazy(() => import("@/pages/assistencia/OSDetalhePage"));
const ReqAssistListPage = lazy(() => import("@/pages/assistencia/ReqAssistListPage"));
const EstoquePage = lazy(() => import("@/pages/assistencia/EstoquePage"));
const NovaOSPage = lazy(() => import("@/pages/assistencia/NovaOSPage"));
const ReceberRequisicaoPage = lazy(() => import("@/pages/assistencia/ReceberRequisicaoPage"));
const ConsumoOSPage = lazy(() => import("@/pages/assistencia/ConsumoOSPage"));
const TerceirizadaDashboardPage = lazy(() => import("@/pages/assistencia/terceirizada/TerceirizadaDashboardPage"));
const CadastroAssistenciaPage = lazy(() => import("@/pages/assistencia/terceirizada/CadastroAssistenciaPage"));
const EstoqueTerceirizadaPage = lazy(() => import("@/pages/assistencia/terceirizada/EstoqueTerceirizadaPage"));
const MovimentacoesPage = lazy(() => import("@/pages/assistencia/terceirizada/MovimentacoesPage"));
const EnviarParaAssistenciaPage = lazy(() => import("@/pages/assistencia/terceirizada/EnviarParaAssistenciaPage"));
const RetornoAssistenciaPage = lazy(() => import("@/pages/assistencia/terceirizada/RetornoAssistenciaPage"));
const AssistenciaTercDetalhePage = lazy(() => import("@/pages/assistencia/terceirizada/AssistenciaDetalhePage"));
const ItemDetalhePage = lazy(() => import("@/pages/assistencia/terceirizada/ItemDetalhePage"));

// Inventory module
const InventarioDashboardPage = lazy(() => import("@/pages/inventario/InventarioDashboardPage"));
const AgendaInventarioPage = lazy(() => import("@/pages/inventario/AgendaInventarioPage"));
const ContagensPage = lazy(() => import("@/pages/inventario/ContagensPage"));
const DigitacaoInventarioPage = lazy(() => import("@/pages/inventario/DigitacaoInventarioPage"));
const ValidacaoInventarioPage = lazy(() => import("@/pages/inventario/ValidacaoInventarioPage"));
const HistoricoDivergenciaPage = lazy(() => import("@/pages/inventario/HistoricoDivergenciaPage"));
const RelatoriosInventarioPage = lazy(() => import("@/pages/inventario/RelatoriosInventarioPage"));
const ConfiguracaoInventarioPage = lazy(() => import("@/pages/inventario/ConfiguracaoInventarioPage"));
const NovoPlanoInventarioPage = lazy(() => import("@/pages/inventario/NovoPlanoInventarioPage"));

// Operational modules
const AcessosListPage = lazy(() => import("@/pages/portaria/AcessosListPage"));
const AcessoDetalhePage = lazy(() => import("@/pages/portaria/AcessoDetalhePage"));
const PresencaPainelPage = lazy(() => import("@/pages/portaria/PresencaPainelPage"));
const NovoAcessoPage = lazy(() => import("@/pages/portaria/NovoAcessoPage"));
const SolicitacaoAcessoDetalhePage = lazy(() => import("@/pages/portaria/SolicitacaoAcessoDetalhePage"));
const LeituraQrPage = lazy(() => import("@/pages/portaria/LeituraQrPage"));
const LeituraPlacaPage = lazy(() => import("@/pages/portaria/LeituraPlacaPage"));
const VisitantesListPage = lazy(() => import("@/pages/visitantes/VisitantesListPage"));
const NovaPreAutorizacaoPage = lazy(() => import("@/pages/visitantes/NovaPreAutorizacaoPage"));
const VisitanteDetalhePage = lazy(() => import("@/pages/visitantes/VisitanteDetalhePage"));
const VeiculosVisitantesPage = lazy(() => import("@/pages/veiculos-visitantes/VeiculosVisitantesPage"));
const FrotaPage = lazy(() => import("@/pages/frota/FrotaPage"));
const VeiculoDetalhePage = lazy(() => import("@/pages/frota/VeiculoDetalhePage"));
const NovoDespachoPage = lazy(() => import("@/pages/frota/NovoDespachoPage"));
const TerceirosPage = lazy(() => import("@/pages/terceiros/TerceirosPage"));
const PatioPage = lazy(() => import("@/pages/patio/PatioPage"));
const MonitoramentoPage = lazy(() => import("@/pages/monitoramento/MonitoramentoPage"));
const NFTransitoDashboardPage = lazy(() => import("@/pages/nf-transito/NFTransitoDashboardPage"));
const NFTransitoDetalhePage = lazy(() => import("@/pages/nf-transito/NFTransitoDetalhePage"));
const VisitantePublicoPage = lazy(() => import("@/pages/visitantes/VisitantePublicoPage"));

// Phase 1-3: New modules
const TorreControlePage = lazy(() => import("@/pages/torre-controle/TorreControlePage"));
const ExcecaoDetalhePage = lazy(() => import("@/pages/torre-controle/ExcecaoDetalhePage"));
const AgendamentoDocaPage = lazy(() => import("@/pages/patio/AgendamentoDocaPage"));
const NovoAgendamentoDocaPage = lazy(() => import("@/pages/patio/NovoAgendamentoDocaPage"));
const AgendamentoDetalhePage = lazy(() => import("@/pages/patio/AgendamentoDetalhePage"));
const CadeiasCustodiaPage = lazy(() => import("@/pages/custodia/CadeiasCustodiaPage"));
const CustodiaDetalhePage = lazy(() => import("@/pages/custodia/CustodiaDetalhePage"));

// Inspeções module
const InspecoesDashboardPage = lazy(() => import("@/pages/inspecoes/InspecoesDashboardPage"));
const ModelosListPage = lazy(() => import("@/pages/inspecoes/ModelosListPage"));
const ModeloFormPage = lazy(() => import("@/pages/inspecoes/ModeloFormPage"));
const NovaExecucaoPage = lazy(() => import("@/pages/inspecoes/NovaExecucaoPage"));
const ExecucaoDetalhePage = lazy(() => import("@/pages/inspecoes/ExecucaoDetalhePage"));
const HistoricoInspecoesPage = lazy(() => import("@/pages/inspecoes/HistoricoInspecoesPage"));
const TiposNCPage = lazy(() => import("@/pages/inspecoes/TiposNCPage"));
const MolasDashboardPage = lazy(() => import("@/pages/inspecoes/MolasDashboardPage"));
const NovaInspecaoMolaPage = lazy(() => import("@/pages/inspecoes/NovaInspecaoMolaPage"));
const MolaDetalhePage = lazy(() => import("@/pages/inspecoes/MolaDetalhePage"));
const MolasHistoricoPage = lazy(() => import("@/pages/inspecoes/MolasHistoricoPage"));
const PadroesMolaPage = lazy(() => import("@/pages/inspecoes/PadroesMolaPage"));
const SesmtExecutivePage = lazy(() => import("@/pages/sesmt/SesmtExecutivePage"));
const SesmtModulePage = lazy(() => import("@/pages/sesmt/SesmtModulePage"));
const DossieColaboradorPage = lazy(() => import("@/pages/sesmt/DossieColaboradorPage"));

const queryClient = new QueryClient();

const Lazy = ({ children }: { children: ReactNode }) => (
  <RouteErrorBoundary>
    <Suspense fallback={<PageSkeleton />}>{children}</Suspense>
  </RouteErrorBoundary>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route
            path="/login"
            element={
              <Suspense fallback={<div className="p-6 text-sm text-muted-foreground">Carregando...</div>}>
                <LoginPage />
              </Suspense>
            }
          />
          <Route path="/" element={<AppLayout><Lazy><Dashboard /></Lazy></AppLayout>} />
          <Route path="/garantias" element={<AppLayout><Lazy><GarantiasPage /></Lazy></AppLayout>} />
          <Route path="/garantias/nova" element={<AppLayout><Lazy><NovaGarantiaPage /></Lazy></AppLayout>} />
          <Route path="/nao-conformidades" element={<AppLayout><Lazy><NCPage /></Lazy></AppLayout>} />
          <Route path="/nao-conformidades/nova" element={<AppLayout><Lazy><NovaNCPage /></Lazy></AppLayout>} />
          <Route path="/capa" element={<AppLayout><Lazy><CAPAPage /></Lazy></AppLayout>} />
          <Route path="/capa/nova" element={<AppLayout><Lazy><NovaCAPAPage /></Lazy></AppLayout>} />
          <Route path="/auditorias" element={<AppLayout><Lazy><AuditoriasPage /></Lazy></AppLayout>} />
          <Route path="/auditorias/nova" element={<AppLayout><Lazy><NovaAuditoriaPage /></Lazy></AppLayout>} />
          <Route path="/auditorias/calendario" element={<AppLayout><Lazy><CalendarioAuditoriasPage /></Lazy></AppLayout>} />
          <Route path="/qualidade/documentos" element={<AppLayout><Lazy><DocumentosQualidadePage /></Lazy></AppLayout>} />
          <Route path="/qualidade/treinamentos" element={<AppLayout><Lazy><TreinamentosQualidadePage /></Lazy></AppLayout>} />
          <Route path="/qualidade/mudancas" element={<AppLayout><Lazy><MudancasQualidadePage /></Lazy></AppLayout>} />
          <Route path="/qualidade/fornecedores" element={<AppLayout><Lazy><FornecedoresQualidadePage /></Lazy></AppLayout>} />
          <Route path="/qualidade/metrologia" element={<AppLayout><Lazy><MetrologiaQualidadePage /></Lazy></AppLayout>} />
          <Route path="/qualidade/kpis-industriais" element={<AppLayout><Lazy><KpisIndustriaisPage /></Lazy></AppLayout>} />
          <Route path="/qualidade/risco-sla" element={<AppLayout><Lazy><RiscoSlaQualidadePage /></Lazy></AppLayout>} />
          <Route path="/qualidade/auditorias-camadas" element={<AppLayout><Lazy><AuditoriasCamadasPage /></Lazy></AppLayout>} />
          <Route path="/qualidade/core-tools" element={<AppLayout><Lazy><CoreToolsFornecedoresPage /></Lazy></AppLayout>} />
          <Route path="/qualidade/iso-readiness" element={<AppLayout><Lazy><IsoReadinessPage /></Lazy></AppLayout>} />

          {/* Inspeções module */}
          <Route path="/inspecoes" element={<AppLayout><Lazy><InspecoesDashboardPage /></Lazy></AppLayout>} />
          <Route path="/inspecoes/modelos" element={<AppLayout><Lazy><ModelosListPage /></Lazy></AppLayout>} />
          <Route path="/inspecoes/modelos/novo" element={<AppLayout><Lazy><ModeloFormPage /></Lazy></AppLayout>} />
          <Route path="/inspecoes/modelos/:id" element={<AppLayout><Lazy><ModeloFormPage /></Lazy></AppLayout>} />
          <Route path="/inspecoes/nova" element={<AppLayout><Lazy><NovaExecucaoPage /></Lazy></AppLayout>} />
          <Route path="/inspecoes/execucoes/:id" element={<AppLayout><Lazy><ExecucaoDetalhePage /></Lazy></AppLayout>} />
          <Route path="/inspecoes/historico" element={<AppLayout><Lazy><HistoricoInspecoesPage /></Lazy></AppLayout>} />
          <Route path="/inspecoes/tipos-nc" element={<AppLayout><Lazy><TiposNCPage /></Lazy></AppLayout>} />
          <Route path="/inspecoes/molas" element={<AppLayout><Lazy><MolasDashboardPage /></Lazy></AppLayout>} />
          <Route path="/inspecoes/molas/nova" element={<AppLayout><Lazy><NovaInspecaoMolaPage /></Lazy></AppLayout>} />
          <Route path="/inspecoes/molas/historico" element={<AppLayout><Lazy><MolasHistoricoPage /></Lazy></AppLayout>} />
          <Route path="/inspecoes/molas/padroes" element={<AppLayout><Lazy><PadroesMolaPage /></Lazy></AppLayout>} />
          <Route path="/inspecoes/molas/:id" element={<AppLayout><Lazy><MolaDetalhePage /></Lazy></AppLayout>} />
          <Route path="/qualidade/inventario" element={<AppLayout><Lazy><InventarioDashboardPage /></Lazy></AppLayout>} />
          <Route path="/qualidade/inventario/agenda" element={<AppLayout><Lazy><AgendaInventarioPage /></Lazy></AppLayout>} />
          <Route path="/qualidade/inventario/contagens" element={<AppLayout><Lazy><ContagensPage /></Lazy></AppLayout>} />
          <Route path="/qualidade/inventario/novo-plano" element={<AppLayout><Lazy><NovoPlanoInventarioPage /></Lazy></AppLayout>} />
          <Route path="/qualidade/inventario/digitacao" element={<AppLayout><Lazy><DigitacaoInventarioPage /></Lazy></AppLayout>} />
          <Route path="/qualidade/inventario/digitacao/:id" element={<AppLayout><Lazy><DigitacaoInventarioPage /></Lazy></AppLayout>} />
          <Route path="/qualidade/inventario/validacao/:id" element={<AppLayout><Lazy><ValidacaoInventarioPage /></Lazy></AppLayout>} />
          <Route path="/qualidade/inventario/divergencia" element={<AppLayout><Lazy><HistoricoDivergenciaPage /></Lazy></AppLayout>} />
          <Route path="/qualidade/inventario/relatorios" element={<AppLayout><Lazy><RelatoriosInventarioPage /></Lazy></AppLayout>} />
          <Route path="/qualidade/inventario/configuracao" element={<AppLayout><Lazy><ConfiguracaoInventarioPage /></Lazy></AppLayout>} />

          <Route path="/sac/dashboard" element={<AppLayout><RequireRole roles={["SAC", "DIRETORIA"]}><Lazy><SACDashboardPage /></Lazy></RequireRole></AppLayout>} />
          <Route path="/sac/atendimentos" element={<AppLayout><RequireRole roles={["SAC", "DIRETORIA"]}><Lazy><AtendimentosPage /></Lazy></RequireRole></AppLayout>} />
          <Route path="/sac/novo" element={<AppLayout><RequireRole roles={["SAC"]}><Lazy><NovoAtendimentoPage /></Lazy></RequireRole></AppLayout>} />
          <Route path="/sac/pesquisa" element={<AppLayout><RequireRole roles={["SAC", "DIRETORIA"]}><Lazy><PesquisaSACPage /></Lazy></RequireRole></AppLayout>} />
          <Route path="/sac/avaliacoes" element={<AppLayout><RequireRole roles={["SAC", "DIRETORIA"]}><Lazy><AvaliacoesPage /></Lazy></RequireRole></AppLayout>} />
          <Route path="/sac/requisicoes" element={<AppLayout><RequireRole roles={["SAC", "DIRETORIA"]}><Lazy><RequisicaoListPage /></Lazy></RequireRole></AppLayout>} />
          <Route path="/sac/requisicoes/nova" element={<AppLayout><RequireRole roles={["SAC"]}><Lazy><NovaRequisicaoPage /></Lazy></RequireRole></AppLayout>} />
          <Route path="/sac/requisicoes/:id" element={<AppLayout><RequireRole roles={["SAC", "DIRETORIA"]}><Lazy><RequisicaoDetalhePage /></Lazy></RequireRole></AppLayout>} />
          <Route path="/sac/requisicoes/:id/atender" element={<AppLayout><RequireRole roles={["SAC"]}><Lazy><AtenderRequisicaoPage /></Lazy></RequireRole></AppLayout>} />
          <Route path="/sac/:id" element={<AppLayout><RequireRole roles={["SAC", "DIRETORIA"]}><Lazy><AtendimentoDetalhePage /></Lazy></RequireRole></AppLayout>} />
          <Route path="/avaliacao/:token" element={<Lazy><AvaliacaoRespostaPage /></Lazy>} />
          <Route path="/visitante/cadastro/:token" element={<Lazy><VisitantePublicoPage /></Lazy>} />

          <Route path="/admin" element={<AppLayout><RequireRole roles={["ADMIN"]}><Lazy><AdminPage /></Lazy></RequireRole></AppLayout>} />
          <Route path="/administracao/usuarios" element={<AppLayout><RequireRole roles={["ADMIN"]}><Lazy><UsuariosPage /></Lazy></RequireRole></AppLayout>} />
          <Route path="/administracao/perfis" element={<AppLayout><RequireRole roles={["ADMIN"]}><Lazy><PerfisPage /></Lazy></RequireRole></AppLayout>} />
          <Route path="/administracao/log-auditoria" element={<AppLayout><RequireRole roles={["ADMIN"]}><Lazy><LogAuditoriaPage /></Lazy></RequireRole></AppLayout>} />
          <Route path="/administracao/parametros" element={<AppLayout><RequireRole roles={["ADMIN"]}><Lazy><ParametrosPage /></Lazy></RequireRole></AppLayout>} />

          <Route path="/assistencia/dashboard" element={<AppLayout><RequirePermission perm="ASSIST_DASH_VIEW"><Lazy><AssistenciaDashboardPage /></Lazy></RequirePermission></AppLayout>} />
          <Route path="/assistencia/os" element={<AppLayout><RequirePermission perm="ASSIST_OS_VIEW"><Lazy><OSListPage /></Lazy></RequirePermission></AppLayout>} />
          <Route path="/assistencia/os/nova" element={<AppLayout><RequireRole roles={["SAC"]}><Lazy><NovaOSPage /></Lazy></RequireRole></AppLayout>} />
          <Route path="/assistencia/consumo" element={<AppLayout><RequirePermission perm="ASSIST_OS_VIEW"><Lazy><OSListPage /></Lazy></RequirePermission></AppLayout>} />
          <Route path="/assistencia/os/:id" element={<AppLayout><RequirePermission perm="ASSIST_OS_VIEW"><Lazy><OSDetalhePage /></Lazy></RequirePermission></AppLayout>} />
          <Route path="/assistencia/os/:id/consumo" element={<AppLayout><RequirePermission perm="ASSIST_CONSUMO_CREATE"><Lazy><ConsumoOSPage /></Lazy></RequirePermission></AppLayout>} />
          <Route path="/assistencia/requisicoes/:id/receber" element={<AppLayout><RequirePermission perm="ASSIST_REQ_RECEBER"><Lazy><ReceberRequisicaoPage /></Lazy></RequirePermission></AppLayout>} />
          <Route path="/assistencia/requisicoes" element={<AppLayout><RequirePermission perm="ASSIST_REQ_VIEW"><Lazy><ReqAssistListPage /></Lazy></RequirePermission></AppLayout>} />
          <Route path="/assistencia/estoque" element={<AppLayout><RequirePermission perm="ASSIST_ESTOQUE_VIEW"><Lazy><EstoquePage /></Lazy></RequirePermission></AppLayout>} />
          <Route path="/assistencia/terceirizada" element={<AppLayout><Lazy><TerceirizadaDashboardPage /></Lazy></AppLayout>} />
          <Route path="/assistencia/terceirizada/cadastro" element={<AppLayout><Lazy><CadastroAssistenciaPage /></Lazy></AppLayout>} />
          <Route path="/assistencia/terceirizada/estoque" element={<AppLayout><Lazy><EstoqueTerceirizadaPage /></Lazy></AppLayout>} />
          <Route path="/assistencia/terceirizada/movimentacoes" element={<AppLayout><Lazy><MovimentacoesPage /></Lazy></AppLayout>} />
          <Route path="/assistencia/terceirizada/enviar" element={<AppLayout><Lazy><EnviarParaAssistenciaPage /></Lazy></AppLayout>} />
          <Route path="/assistencia/terceirizada/retorno" element={<AppLayout><Lazy><RetornoAssistenciaPage /></Lazy></AppLayout>} />
          <Route path="/assistencia/terceirizada/detalhe/:id" element={<AppLayout><Lazy><AssistenciaTercDetalhePage /></Lazy></AppLayout>} />
          <Route path="/assistencia/terceirizada/itens/:id" element={<AppLayout><Lazy><ItemDetalhePage /></Lazy></AppLayout>} />

          {/* Operational modules */}
          <Route path="/portaria" element={<AppLayout><Lazy><AcessosListPage /></Lazy></AppLayout>} />
          <Route path="/portaria/novo" element={<AppLayout><Lazy><NovoAcessoPage /></Lazy></AppLayout>} />
          <Route path="/portaria/qr" element={<AppLayout><Lazy><LeituraQrPage /></Lazy></AppLayout>} />
          <Route path="/portaria/placa" element={<AppLayout><Lazy><LeituraPlacaPage /></Lazy></AppLayout>} />
          <Route path="/portaria/presenca" element={<AppLayout><Lazy><PresencaPainelPage /></Lazy></AppLayout>} />
          <Route path="/portaria/solicitacoes/:id" element={<AppLayout><Lazy><SolicitacaoAcessoDetalhePage /></Lazy></AppLayout>} />
          <Route path="/portaria/:id" element={<AppLayout><Lazy><AcessoDetalhePage /></Lazy></AppLayout>} />
          <Route path="/visitantes" element={<AppLayout><Lazy><VisitantesListPage /></Lazy></AppLayout>} />
          <Route path="/visitantes/pre-autorizacao" element={<AppLayout><Lazy><NovaPreAutorizacaoPage /></Lazy></AppLayout>} />
          <Route path="/visitantes/:id" element={<AppLayout><Lazy><VisitanteDetalhePage /></Lazy></AppLayout>} />
          <Route path="/veiculos-visitantes" element={<AppLayout><Lazy><VeiculosVisitantesPage /></Lazy></AppLayout>} />
          <Route path="/frota" element={<AppLayout><Lazy><FrotaPage /></Lazy></AppLayout>} />
          <Route path="/frota/despacho" element={<AppLayout><Lazy><NovoDespachoPage /></Lazy></AppLayout>} />
          <Route path="/frota/:id" element={<AppLayout><Lazy><VeiculoDetalhePage /></Lazy></AppLayout>} />
          <Route path="/terceiros" element={<AppLayout><Lazy><TerceirosPage /></Lazy></AppLayout>} />
          <Route path="/patio" element={<AppLayout><Lazy><PatioPage /></Lazy></AppLayout>} />
          <Route path="/monitoramento" element={<AppLayout><Lazy><MonitoramentoPage /></Lazy></AppLayout>} />
          <Route path="/nf-transito" element={<AppLayout><Lazy><NFTransitoDashboardPage /></Lazy></AppLayout>} />
          <Route path="/nf-transito/:id" element={<AppLayout><Lazy><NFTransitoDetalhePage /></Lazy></AppLayout>} />
          <Route path="/torre-controle" element={<AppLayout><Lazy><TorreControlePage /></Lazy></AppLayout>} />
          <Route path="/torre-controle/:id" element={<AppLayout><Lazy><ExcecaoDetalhePage /></Lazy></AppLayout>} />
          <Route path="/patio/agendamento" element={<AppLayout><Lazy><AgendamentoDocaPage /></Lazy></AppLayout>} />
          <Route path="/patio/agendamento/novo" element={<AppLayout><Lazy><NovoAgendamentoDocaPage /></Lazy></AppLayout>} />
          <Route path="/patio/agendamento/:id" element={<AppLayout><Lazy><AgendamentoDetalhePage /></Lazy></AppLayout>} />
          <Route path="/custodia" element={<AppLayout><Lazy><CadeiasCustodiaPage /></Lazy></AppLayout>} />
          <Route path="/custodia/:id" element={<AppLayout><Lazy><CustodiaDetalhePage /></Lazy></AppLayout>} />

          {/* SESMT / SST */}
          <Route path="/sesmt" element={<Navigate to="/sesmt/visao-executiva/painel-mestre" replace />} />
          <Route
            path="/sesmt/visao-executiva/:viewKey"
            element={
              <AppLayout>
                <RequireSesmtAccess>
                  <Lazy><SesmtExecutivePage /></Lazy>
                </RequireSesmtAccess>
              </AppLayout>
            }
          />
          <Route
            path="/sesmt/:groupKey/:moduleKey"
            element={
              <AppLayout>
                <RequireSesmtAccess>
                  <Lazy><SesmtModulePage /></Lazy>
                </RequireSesmtAccess>
              </AppLayout>
            }
          />
          <Route
            path="*"
            element={
              <Suspense fallback={<div className="p-6 text-sm text-muted-foreground">Carregando...</div>}>
                <NotFound />
              </Suspense>
            }
          />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
