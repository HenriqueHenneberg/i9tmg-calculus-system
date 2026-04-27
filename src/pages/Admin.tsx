import { Archive, CheckCircle2, Clock3, FileCheck2, ShieldCheck, Users } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useIndustrialWorkspace } from "@/contexts/IndustrialWorkspaceContext";
import type { Formula, FormulaStatus } from "@/lib/industrial-data";

const statusLabels: Record<FormulaStatus, string> = {
  rascunho: "Rascunho",
  em_revisao: "Em revisao",
  validada: "Validada",
  aprovada: "Aprovada",
  arquivada: "Arquivada",
};

export default function Admin() {
  const { user } = useAuth();
  const { formulas, sectors, history, updateFormulaStatus } = useIndustrialWorkspace();
  const statusEntries = Object.keys(statusLabels) as FormulaStatus[];
  const approvalQueue = formulas
    .filter((formula) => formula.status === "rascunho" || formula.status === "em_revisao" || formula.status === "validada")
    .sort((a, b) => statusPriority[a.status] - statusPriority[b.status])
    .slice(0, 8);
  const customFormulas = formulas.filter((formula) => formula.isCustom).length;
  const criticalSectors = [...sectors].sort((a, b) => b.activeCalculations - a.activeCalculations).slice(0, 5);

  const setStatus = (formula: Formula, status: FormulaStatus) => {
    updateFormulaStatus(formula.id, status, user?.name);
    toast.success(`${formula.name} atualizado para ${statusLabels[status]}.`);
  };

  return (
    <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-6">
      <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <Badge className="border-primary/25 bg-primary/15 text-primary hover:bg-primary/15">Painel administrativo</Badge>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground">Administracao</h1>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
            Controle de status das formulas, setores oficiais e auditoria do prototipo. Usuario ativo: {user?.name}.
          </p>
        </div>
        <div className="rounded-lg border border-success/25 bg-success/10 p-4 text-success">
          <ShieldCheck className="h-6 w-6" />
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Metric label="Formulas" value={formulas.length} />
        <Metric label="Setores" value={sectors.length} />
        <Metric label="Execucoes" value={history.length} />
        <Metric label="Customizadas" value={customFormulas} />
      </section>

      <section className="grid gap-4 xl:grid-cols-[0.75fr_1.25fr]">
        <Card className="gradient-industrial glow-card border-border/60">
          <CardHeader className="border-b border-border/70 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Governanca</p>
            <CardTitle className="mt-1 text-lg text-foreground">Status das formulas</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 p-5">
            {statusEntries.map((status) => (
              <div key={status} className="flex items-center justify-between rounded-lg border border-border/70 bg-muted/20 p-3">
                <span className="text-sm text-muted-foreground">{statusLabels[status]}</span>
                <span className="font-mono text-lg font-semibold text-foreground">
                  {formulas.filter((formula) => formula.status === status).length}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="gradient-industrial glow-card border-border/60">
          <CardHeader className="flex flex-col gap-3 border-b border-border/70 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Fila de aprovacao</p>
              <CardTitle className="mt-1 text-lg text-foreground">Formulas aguardando acao</CardTitle>
            </div>
            <Badge variant="outline" className="border-warning/25 bg-warning/10 text-warning">
              <Clock3 className="h-3.5 w-3.5" />
              {approvalQueue.length} itens
            </Badge>
          </CardHeader>
          <CardContent className="grid gap-3 p-5">
            {approvalQueue.map((formula) => (
              <div key={formula.id} className="rounded-lg border border-border/70 bg-muted/20 p-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate text-sm font-semibold text-foreground">{formula.name}</p>
                      <Badge variant="outline" className="border-primary/25 bg-primary/10 text-primary">
                        {formula.sector}
                      </Badge>
                      <Badge variant="outline" className="border-border bg-muted/25 text-muted-foreground">
                        {statusLabels[formula.status]}
                      </Badge>
                    </div>
                    <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">{formula.description}</p>
                  </div>
                  <div className="flex shrink-0 flex-wrap gap-2">
                    <Button type="button" size="sm" variant="outline" onClick={() => setStatus(formula, "validada")} className="border-info/30 bg-info/10 text-info">
                      <CheckCircle2 className="h-4 w-4" />
                      Validar
                    </Button>
                    <Button type="button" size="sm" variant="outline" onClick={() => setStatus(formula, "aprovada")} className="border-success/30 bg-success/10 text-success">
                      <FileCheck2 className="h-4 w-4" />
                      Aprovar
                    </Button>
                    <Button type="button" size="sm" variant="outline" onClick={() => setStatus(formula, "arquivada")} className="border-destructive/30 bg-destructive/10 text-destructive">
                      <Archive className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            {approvalQueue.length === 0 && (
              <div className="rounded-lg border border-border/70 bg-muted/20 p-6 text-center text-sm text-muted-foreground">
                Nenhuma formula aguardando aprovacao.
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
        <Card className="gradient-industrial glow-card border-border/60">
          <CardHeader className="border-b border-border/70 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Permissoes</p>
            <CardTitle className="mt-1 flex items-center gap-2 text-lg text-foreground">
              <Users className="h-5 w-5 text-primary" />
              Matriz do prototipo
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 p-5">
            <PermissionRow role="Admin" description="Cria setores, edita formulas oficiais, valida, aprova e arquiva." />
            <PermissionRow role="Usuario comum" description="Visualiza formulas, executa calculos e salva historico rastreavel." />
            <div className="rounded-lg border border-warning/25 bg-warning/10 p-3 text-sm text-muted-foreground">
              Autenticacao local apenas demonstrativa. Em producao, migrar para backend seguro com hash, JWT e auditoria persistente.
            </div>
          </CardContent>
        </Card>

        <Card className="gradient-industrial glow-card border-border/60">
          <CardHeader className="border-b border-border/70 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Operacao</p>
            <CardTitle className="mt-1 text-lg text-foreground">Setores mais ativos</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 p-5">
            {criticalSectors.map((sector) => (
              <div key={sector.id} className="rounded-lg border border-border/70 bg-muted/20 p-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground">{sector.name}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{sector.formulas} formulas cadastradas</p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-lg font-semibold text-primary">{sector.activeCalculations}</p>
                    <p className="text-[11px] text-muted-foreground">execucoes</p>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4">
        <Card className="gradient-industrial glow-card border-border/60">
          <CardHeader className="border-b border-border/70 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Auditoria</p>
            <CardTitle className="mt-1 text-lg text-foreground">Ultimas execucoes</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 p-5 md:grid-cols-2">
            {history.slice(0, 8).map((item) => (
              <div key={item.id} className="rounded-lg border border-border/70 bg-muted/20 p-3">
                <p className="truncate text-sm font-medium text-foreground">{item.formula}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {item.operator} - {item.date}
                </p>
                <div className="mt-3 flex items-center justify-between gap-3">
                  <Badge variant="outline" className="border-primary/25 bg-primary/10 text-primary">
                    {statusLabels[item.formulaStatus]}
                  </Badge>
                  <span className="font-mono text-sm text-foreground">
                    {item.result} {item.unit}
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

const statusPriority: Record<FormulaStatus, number> = {
  em_revisao: 1,
  validada: 2,
  rascunho: 3,
  aprovada: 4,
  arquivada: 5,
};

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <Card className="gradient-industrial glow-card border-border/60">
      <CardContent className="p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">{label}</p>
        <p className="mt-3 font-mono text-3xl font-semibold text-foreground">{value}</p>
      </CardContent>
    </Card>
  );
}

function PermissionRow({ role, description }: { role: string; description: string }) {
  return (
    <div className="rounded-lg border border-border/70 bg-muted/20 p-3">
      <p className="text-sm font-semibold text-foreground">{role}</p>
      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{description}</p>
    </div>
  );
}
