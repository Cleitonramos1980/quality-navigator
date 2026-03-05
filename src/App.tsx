import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AppLayout from "@/components/AppLayout";
import Dashboard from "@/pages/Dashboard";
import GarantiasPage from "@/pages/GarantiasPage";
import NCPage from "@/pages/NCPage";
import CAPAPage from "@/pages/CAPAPage";
import AuditoriasPage from "@/pages/AuditoriasPage";
import AdminPage from "@/pages/AdminPage";
import LoginPage from "@/pages/LoginPage";
import NotFound from "@/pages/NotFound";
import NovaGarantiaPage from "@/pages/garantias/NovaGarantiaPage";
import NovaNCPage from "@/pages/nc/NovaNCPage";
import NovaCAPAPage from "@/pages/capa/NovaCAPAPage";
import NovaAuditoriaPage from "@/pages/auditorias/NovaAuditoriaPage";
import CalendarioAuditoriasPage from "@/pages/auditorias/CalendarioAuditoriasPage";
import UsuariosPage from "@/pages/admin/UsuariosPage";
import PerfisPage from "@/pages/admin/PerfisPage";
import LogAuditoriaPage from "@/pages/admin/LogAuditoriaPage";
import ParametrosPage from "@/pages/admin/ParametrosPage";
import SACDashboardPage from "@/pages/sac/SACDashboardPage";
import AtendimentosPage from "@/pages/sac/AtendimentosPage";
import NovoAtendimentoPage from "@/pages/sac/NovoAtendimentoPage";
import AtendimentoDetalhePage from "@/pages/sac/AtendimentoDetalhePage";
import PesquisaSACPage from "@/pages/sac/PesquisaSACPage";
import NovaRequisicaoPage from "@/pages/sac/requisicoes/NovaRequisicaoPage";
import RequisicaoListPage from "@/pages/sac/requisicoes/RequisicaoListPage";
import RequisicaoDetalhePage from "@/pages/sac/requisicoes/RequisicaoDetalhePage";
import AtenderRequisicaoPage from "@/pages/sac/requisicoes/AtenderRequisicaoPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<AppLayout><Dashboard /></AppLayout>} />
          <Route path="/garantias" element={<AppLayout><GarantiasPage /></AppLayout>} />
          <Route path="/garantias/nova" element={<AppLayout><NovaGarantiaPage /></AppLayout>} />
          <Route path="/nao-conformidades" element={<AppLayout><NCPage /></AppLayout>} />
          <Route path="/nao-conformidades/nova" element={<AppLayout><NovaNCPage /></AppLayout>} />
          <Route path="/capa" element={<AppLayout><CAPAPage /></AppLayout>} />
          <Route path="/capa/nova" element={<AppLayout><NovaCAPAPage /></AppLayout>} />
          <Route path="/auditorias" element={<AppLayout><AuditoriasPage /></AppLayout>} />
          <Route path="/auditorias/nova" element={<AppLayout><NovaAuditoriaPage /></AppLayout>} />
          <Route path="/auditorias/calendario" element={<AppLayout><CalendarioAuditoriasPage /></AppLayout>} />
          <Route path="/sac/dashboard" element={<AppLayout><SACDashboardPage /></AppLayout>} />
          <Route path="/sac/atendimentos" element={<AppLayout><AtendimentosPage /></AppLayout>} />
          <Route path="/sac/novo" element={<AppLayout><NovoAtendimentoPage /></AppLayout>} />
          <Route path="/sac/pesquisa" element={<AppLayout><PesquisaSACPage /></AppLayout>} />
          <Route path="/sac/requisicoes" element={<AppLayout><RequisicaoListPage /></AppLayout>} />
          <Route path="/sac/requisicoes/nova" element={<AppLayout><NovaRequisicaoPage /></AppLayout>} />
          <Route path="/sac/requisicoes/:id" element={<AppLayout><RequisicaoDetalhePage /></AppLayout>} />
          <Route path="/sac/requisicoes/:id/atender" element={<AppLayout><AtenderRequisicaoPage /></AppLayout>} />
          <Route path="/sac/:id" element={<AppLayout><AtendimentoDetalhePage /></AppLayout>} />
          <Route path="/admin" element={<AppLayout><AdminPage /></AppLayout>} />
          <Route path="/administracao/usuarios" element={<AppLayout><UsuariosPage /></AppLayout>} />
          <Route path="/administracao/perfis" element={<AppLayout><PerfisPage /></AppLayout>} />
          <Route path="/administracao/log-auditoria" element={<AppLayout><LogAuditoriaPage /></AppLayout>} />
          <Route path="/administracao/parametros" element={<AppLayout><ParametrosPage /></AppLayout>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
