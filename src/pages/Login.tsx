import { useMemo, useState, type FormEvent } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { LockKeyhole, LogIn, UserRound } from "lucide-react";
import { toast } from "sonner";
import { BrandLogo } from "@/components/BrandLogo";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";

export default function Login() {
  const { isAuthenticated, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const normalizedUsername = username.trim();
  const isAdminLogin = normalizedUsername === "adminadmin";
  const canSubmit = Boolean(normalizedUsername) && (!isAdminLogin || Boolean(password));
  const from = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname || "/";

  const helperText = useMemo(() => {
    if (!normalizedUsername) return "Digite seu usuario para acessar o sistema.";
    if (isAdminLogin) return "Usuario administrador detectado. Informe a senha administrativa.";
    return "Login de operador: nenhuma senha e necessaria.";
  }, [isAdminLogin, normalizedUsername]);

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSubmit) return;
    setLoading(true);

    window.setTimeout(() => {
      const ok = login(normalizedUsername, password);
      setLoading(false);
      if (!ok) {
        toast.error("Senha administrativa incorreta.");
        return;
      }
      toast.success(isAdminLogin ? "Admin autenticado com sucesso." : "Operador autenticado com sucesso.");
      navigate(from, { replace: true });
    }, 240);
  };

  return (
    <main className="flex min-h-screen overflow-x-hidden bg-background p-4 text-foreground sm:p-6">
      <div className="absolute inset-0 bg-[linear-gradient(135deg,#0A2540,#0d2f46_55%,#111827)]" />
      <div className="relative mx-auto grid w-full max-w-6xl items-center gap-6 lg:grid-cols-[1fr_430px]">
        <section className="hidden min-w-0 lg:block">
          <BrandLogo markClassName="h-20 w-20" />
          <h1 className="mt-8 max-w-2xl text-4xl font-semibold tracking-tight text-foreground">
            i9TMG Calculus System
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground">
            Ambiente industrial para calculos tecnicos, formulas validadas, historico rastreavel e setores operacionais.
          </p>
          <div className="mt-8 grid max-w-2xl gap-3 sm:grid-cols-3">
            <InfoCard label="Admin" value="Controle total" />
            <InfoCard label="Operador" value="Calculos e historico" />
            <InfoCard label="Layout" value="Responsivo" />
          </div>
        </section>

        <Card className="w-full min-w-0 border-border/70 bg-card/85 shadow-2xl backdrop-blur">
          <CardHeader className="border-b border-border/70 p-5 sm:p-6">
            <BrandLogo markClassName="h-12 w-12 sm:h-14 sm:w-14" />
            <div className="mt-6">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Acesso ao sistema</p>
              <CardTitle className="mt-3 text-2xl text-foreground">Entrar</CardTitle>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{helperText}</p>
            </div>
          </CardHeader>
          <CardContent className="p-5 sm:p-6">
            <form onSubmit={submit} className="space-y-5">
              <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Usuario</Label>
                <div className="relative">
                  <UserRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    autoFocus
                    value={username}
                    onChange={(event) => {
                      setUsername(event.target.value);
                      if (event.target.value.trim() !== "adminadmin") setPassword("");
                    }}
                    placeholder="adminadmin, operador, tecnico..."
                    className="h-11 border-border bg-muted/25 pl-9 text-foreground focus-visible:ring-primary/40"
                  />
                </div>
              </div>

              {isAdminLogin && (
                <div className="space-y-2">
                  <Label className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Senha admin</Label>
                  <Input
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    type="password"
                    placeholder="ladmin"
                    className="h-11 border-border bg-muted/25 text-foreground focus-visible:ring-primary/40"
                  />
                </div>
              )}

              <div className="rounded-lg border border-warning/25 bg-warning/10 p-3">
                <div className="flex items-start gap-2">
                  <LockKeyhole className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    Autenticacao local apenas para prototipo academico. Em producao, use backend, senha com hash e sessao segura.
                  </p>
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading || !canSubmit}
                className="h-11 w-full bg-primary text-primary-foreground hover:bg-highlight-glow"
              >
                <LogIn className="h-4 w-4" />
                {loading ? "Validando..." : "Entrar"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border/70 bg-card/50 p-4">
      <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">{label}</p>
      <p className="mt-2 text-sm font-semibold text-foreground">{value}</p>
    </div>
  );
}
