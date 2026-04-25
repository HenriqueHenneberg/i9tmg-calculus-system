import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppLayout } from "@/components/layout/AppLayout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { StartupGate } from "@/components/StartupGate";
import { AuthProvider } from "@/contexts/AuthContext";
import { IndustrialWorkspaceProvider } from "@/contexts/IndustrialWorkspaceContext";
import Dashboard from "./pages/Dashboard";
import Admin from "./pages/Admin";
import Calculos from "./pages/Calculos";
import Formulas from "./pages/Formulas";
import Historico from "./pages/Historico";
import Setores from "./pages/Setores";
import Configuracoes from "./pages/Configuracoes";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <IndustrialWorkspaceProvider>
          <StartupGate>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/" element={<ProtectedRoute><AppLayout><Dashboard /></AppLayout></ProtectedRoute>} />
                <Route path="/calculos" element={<ProtectedRoute><AppLayout><Calculos /></AppLayout></ProtectedRoute>} />
                <Route path="/formulas" element={<ProtectedRoute><AppLayout><Formulas /></AppLayout></ProtectedRoute>} />
                <Route path="/historico" element={<ProtectedRoute><AppLayout><Historico /></AppLayout></ProtectedRoute>} />
                <Route path="/setores" element={<ProtectedRoute><AppLayout><Setores /></AppLayout></ProtectedRoute>} />
                <Route path="/configuracoes" element={<ProtectedRoute><AppLayout><Configuracoes /></AppLayout></ProtectedRoute>} />
                <Route path="/admin" element={<ProtectedRoute adminOnly><AppLayout><Admin /></AppLayout></ProtectedRoute>} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </StartupGate>
        </IndustrialWorkspaceProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
