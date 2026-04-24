import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppLayout } from "@/components/layout/AppLayout";
import { StartupGate } from "@/components/StartupGate";
import { IndustrialWorkspaceProvider } from "@/contexts/IndustrialWorkspaceContext";
import Dashboard from "./pages/Dashboard";
import Calculos from "./pages/Calculos";
import Formulas from "./pages/Formulas";
import Historico from "./pages/Historico";
import Setores from "./pages/Setores";
import Configuracoes from "./pages/Configuracoes";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <IndustrialWorkspaceProvider>
        <StartupGate>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<AppLayout><Dashboard /></AppLayout>} />
              <Route path="/calculos" element={<AppLayout><Calculos /></AppLayout>} />
              <Route path="/formulas" element={<AppLayout><Formulas /></AppLayout>} />
              <Route path="/historico" element={<AppLayout><Historico /></AppLayout>} />
              <Route path="/setores" element={<AppLayout><Setores /></AppLayout>} />
              <Route path="/configuracoes" element={<AppLayout><Configuracoes /></AppLayout>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </StartupGate>
      </IndustrialWorkspaceProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
