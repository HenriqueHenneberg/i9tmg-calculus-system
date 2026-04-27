import { lazy, Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppLayout } from "@/components/layout/AppLayout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { StartupGate } from "@/components/StartupGate";
import { AuthProvider } from "@/contexts/AuthContext";
import { IndustrialWorkspaceProvider } from "@/contexts/IndustrialWorkspaceContext";

const Dashboard = lazy(() => import("./pages/Dashboard"));
const Admin = lazy(() => import("./pages/Admin"));
const Calculos = lazy(() => import("./pages/Calculos"));
const Formulas = lazy(() => import("./pages/Formulas"));
const Historico = lazy(() => import("./pages/Historico"));
const Setores = lazy(() => import("./pages/Setores"));
const Configuracoes = lazy(() => import("./pages/Configuracoes"));
const Login = lazy(() => import("./pages/Login"));
const NotFound = lazy(() => import("./pages/NotFound"));

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
              <Suspense fallback={<RouteLoader />}>
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
              </Suspense>
            </BrowserRouter>
          </StartupGate>
        </IndustrialWorkspaceProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

function RouteLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background text-muted-foreground">
      <div className="rounded-lg border border-border/70 bg-card/70 p-5 text-center">
        <Loader2 className="mx-auto h-5 w-5 animate-spin text-primary" />
        <p className="mt-3 text-sm">Carregando modulo tecnico...</p>
      </div>
    </div>
  );
}

export default App;
