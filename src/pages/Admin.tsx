import { ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useIndustrialWorkspace } from "@/contexts/IndustrialWorkspaceContext";
import type { FormulaStatus } from "@/lib/industrial-data";

const statusLabels: Record<FormulaStatus, string> = {
  rascunho: "Rascunho",
  em_revisao: "Em revisao",
  validada: "Validada",
  aprovada: "Aprovada",
  arquivada: "Arquivada",
};

export default function Admin() {
  const { user } = useAuth();
  const { formulas, sectors, history } = useIndustrialWorkspace();
  const statusEntries = Object.keys(statusLabels) as FormulaStatus[];

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
        <Metric label="Mistura 90" value={formulas.filter((formula) => formula.sectorId === "elevadores_mistura_90").length} />
      </section>

      <section className="grid gap-4 xl:grid-cols-[0.8fr_1.2fr]">
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
