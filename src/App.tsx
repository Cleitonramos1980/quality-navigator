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
          <Route path="/nao-conformidades" element={<AppLayout><NCPage /></AppLayout>} />
          <Route path="/capa" element={<AppLayout><CAPAPage /></AppLayout>} />
          <Route path="/auditorias" element={<AppLayout><AuditoriasPage /></AppLayout>} />
          <Route path="/admin" element={<AppLayout><AdminPage /></AppLayout>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
