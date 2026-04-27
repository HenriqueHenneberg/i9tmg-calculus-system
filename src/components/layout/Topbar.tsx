import { Bell, Calculator, CheckCircle2, Clock3, LogOut, Search, ShieldAlert, User } from "lucide-react";
import { useMemo, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useAuth } from "@/contexts/AuthContext";
import { useIndustrialWorkspace } from "@/contexts/IndustrialWorkspaceContext";

export function Topbar() {
  const [searchFocused, setSearchFocused] = useState(false);
  const [globalSearch, setGlobalSearch] = useState("");
  const { user, logout } = useAuth();
  const { formulas, history } = useIndustrialWorkspace();
  const navigate = useNavigate();
  const pendingFormulas = useMemo(
    () => formulas.filter((formula) => formula.status === "rascunho" || formula.status === "em_revisao").slice(0, 4),
    [formulas],
  );
  const recentHistory = history.slice(0, 3);
  const notificationCount = pendingFormulas.length + recentHistory.length;

  const runSearch = (event?: FormEvent<HTMLFormElement>) => {
    event?.preventDefault();
    const term = globalSearch.trim();
    if (!term) {
      navigate("/calculos");
      return;
    }
    navigate(`/calculos?q=${encodeURIComponent(term)}`);
    setSearchFocused(false);
  };

  return (
    <header className="flex min-h-14 flex-shrink-0 items-center justify-between gap-2 border-b border-border bg-card/65 px-3 py-2 backdrop-blur-md sm:px-4 md:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <SidebarTrigger className="text-muted-foreground hover:bg-muted/50 hover:text-foreground md:hidden" />
        <div className="min-w-0">
          <h2 className="truncate text-sm font-medium text-foreground">Sistema de Calculos Tecnicos</h2>
          <p className="hidden text-[11px] text-muted-foreground sm:block">Painel industrial i9TMG</p>
        </div>
      </div>

      <div className="flex min-w-0 shrink-0 items-center gap-1.5 sm:gap-2">
        <form
          onSubmit={runSearch}
          className={`hidden items-center gap-2 rounded-lg border px-2 py-1.5 transition-all duration-200 md:flex ${
            searchFocused ? "w-[min(24rem,34vw)] border-primary bg-muted/50 shadow-[0_0_0_1px_hsl(var(--primary)/0.18)]" : "w-[min(17rem,28vw)] border-border bg-muted/30"
          }`}
        >
          <Search className="h-3.5 w-3.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar calculo..."
            value={globalSearch}
            onChange={(event) => setGlobalSearch(event.target.value)}
            className="min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
          />
          <Button type="submit" size="sm" variant="ghost" className="h-7 px-2 text-xs text-muted-foreground hover:text-primary">
            Ir
          </Button>
        </form>

        <Popover>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="rounded-lg p-2 text-muted-foreground transition-all hover:-translate-y-0.5 hover:bg-muted/50 hover:text-foreground md:hidden"
              title="Buscar"
            >
              <Search className="h-4 w-4" />
            </button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-[min(22rem,calc(100vw-1.5rem))] border-border bg-popover p-3">
            <form onSubmit={runSearch} className="flex gap-2">
              <input
                autoFocus
                type="text"
                placeholder="Buscar calculo, tag ou setor"
                value={globalSearch}
                onChange={(event) => setGlobalSearch(event.target.value)}
                className="min-w-0 flex-1 rounded-md border border-border bg-muted/25 px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
              />
              <Button type="submit" size="sm" className="bg-primary text-primary-foreground">
                Buscar
              </Button>
            </form>
          </PopoverContent>
        </Popover>

        <Popover>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="relative rounded-lg p-2 text-muted-foreground transition-all hover:-translate-y-0.5 hover:bg-muted/50 hover:text-foreground"
              title="Notificacoes"
            >
              <Bell className="h-4 w-4" />
              {notificationCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground">
                  {notificationCount}
                </span>
              )}
            </button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-[min(24rem,calc(100vw-1.5rem))] border-border bg-popover p-0">
            <div className="border-b border-border/70 p-4">
              <p className="text-sm font-semibold text-foreground">Central de notificacoes</p>
              <p className="mt-1 text-xs text-muted-foreground">Pendencias, revisoes e ultimas execucoes.</p>
            </div>
            <div className="max-h-[360px] space-y-3 overflow-y-auto p-3">
              {pendingFormulas.map((formula) => (
                <button
                  key={formula.id}
                  type="button"
                  onClick={() => navigate(`/formulas?q=${encodeURIComponent(formula.name)}`)}
                  className="group w-full rounded-lg border border-warning/20 bg-warning/10 p-3 text-left transition-all hover:-translate-y-0.5 hover:border-warning/40"
                >
                  <div className="flex items-start gap-3">
                    <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
                    <div className="min-w-0">
                      <p className="line-clamp-2 text-sm font-medium text-foreground">{formula.name}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{formula.status.replace("_", " ")} - {formula.sector}</p>
                    </div>
                  </div>
                </button>
              ))}
              {recentHistory.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => navigate("/historico")}
                  className="group w-full rounded-lg border border-border/70 bg-muted/20 p-3 text-left transition-all hover:-translate-y-0.5 hover:border-primary/35 hover:bg-muted/35"
                >
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                    <div className="min-w-0">
                      <p className="line-clamp-2 text-sm font-medium text-foreground">{item.formula}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{item.operator} - {item.result} {item.unit}</p>
                    </div>
                  </div>
                </button>
              ))}
              {notificationCount === 0 && (
                <div className="rounded-lg border border-border/70 bg-muted/20 p-4 text-center text-sm text-muted-foreground">
                  Tudo em dia por aqui.
                </div>
              )}
            </div>
          </PopoverContent>
        </Popover>

        <Popover>
          <PopoverTrigger asChild>
            <button type="button" className="flex min-w-0 items-center gap-2 rounded-lg p-1.5 transition-all hover:-translate-y-0.5 hover:bg-muted/50">
              <div className="flex h-7 w-7 items-center justify-center rounded-full border border-primary/30 bg-primary/20">
                <User className="h-3.5 w-3.5 text-primary" />
              </div>
              <span className="hidden max-w-28 truncate text-xs font-medium text-muted-foreground xl:inline">
                {user?.name || "Engenharia"}
              </span>
            </button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-72 border-border bg-popover p-4">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-primary/30 bg-primary/15">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="break-words text-sm font-semibold text-foreground">{user?.name || "Engenharia"}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <Badge variant="outline" className="border-primary/25 bg-primary/10 text-primary">
                    {user?.role === "admin" ? "Administrador" : "Usuario"}
                  </Badge>
                  <Badge variant="outline" className="border-border bg-muted/25 text-muted-foreground">
                    <Clock3 className="h-3 w-3" />
                    sessao local
                  </Badge>
                </div>
              </div>
            </div>
            <div className="mt-4 grid gap-2">
              <Button type="button" variant="outline" onClick={() => navigate("/calculos")} className="justify-start border-border bg-muted/25 text-foreground">
                <Calculator className="h-4 w-4" />
                Abrir calculos
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  logout();
                  navigate("/login", { replace: true });
                }}
                className="justify-start border-destructive/30 bg-destructive/10 text-destructive hover:bg-destructive hover:text-destructive-foreground"
              >
                <LogOut className="h-4 w-4" />
                Sair
              </Button>
            </div>
          </PopoverContent>
        </Popover>

      </div>
    </header>
  );
}
