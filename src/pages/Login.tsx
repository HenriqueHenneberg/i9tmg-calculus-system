import { useState, type FormEvent } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { LockKeyhole, LogIn } from "lucide-react";
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

  const from = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname || "/";

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);

    window.setTimeout(() => {
      const ok = login(username, password);
      setLoading(false);
      if (!ok) {
        toast.error("Usuario ou senha invalidos.");
        return;
      }
      toast.success("Login realizado com sucesso.");
      navigate(from, { replace: true });
    }, 260);
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-6 text-foreground">
      <div className="absolute inset-0 bg-[linear-gradient(135deg,#0A2540,#0d2f46_55%,#111827)]" />
      <Card className="relative w-full max-w-md border-border/70 bg-card/85 shadow-2xl backdrop-blur">
        <CardHeader className="border-b border-border/70 p-6">
          <BrandLogo markClassName="h-14 w-14" />
          <div className="mt-8">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Acesso seguro</p>
            <CardTitle className="mt-3 text-2xl text-foreground">Entrar no i9TMG</CardTitle>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Plataforma industrial de calculos tecnicos, formulas e rastreabilidade operacional.
            </p>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={submit} className="space-y-5">
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Usuario</Label>
              <Input
                autoFocus
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                placeholder="adminadmin"
                className="h-11 border-border bg-muted/25 text-foreground focus-visible:ring-primary/40"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Senha</Label>
              <Input
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                type="password"
                placeholder="Senha do administrador"
                className="h-11 border-border bg-muted/25 text-foreground focus-visible:ring-primary/40"
              />
            </div>
            <div className="rounded-lg border border-warning/25 bg-warning/10 p-3">
              <div className="flex items-start gap-2">
                <LockKeyhole className="mt-0.5 h-4 w-4 text-warning" />
                <p className="text-xs leading-relaxed text-muted-foreground">
                  Autenticacao local apenas para prototipo academico. Em producao, use backend, senha com hash e sessao segura.
                </p>
              </div>
            </div>
            <Button
              type="submit"
              disabled={loading || !username.trim() || !password}
              className="h-11 w-full bg-primary text-primary-foreground hover:bg-highlight-glow"
            >
              <LogIn className="h-4 w-4" />
              {loading ? "Validando..." : "Entrar"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
