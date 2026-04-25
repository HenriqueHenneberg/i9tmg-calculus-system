import { Activity, Calculator, Database, Layers, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { DashboardCard } from "@/components/DashboardCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useIndustrialWorkspace } from "@/contexts/IndustrialWorkspaceContext";
import { weeklyActivity } from "@/lib/industrial-data";

const tooltipStyle = {
  background: "hsl(var(--card))",
  border: "1px solid hsl(var(--border))",
  borderRadius: 8,
  color: "hsl(var(--foreground))",
  boxShadow: "0 14px 40px hsl(210 60% 4% / 0.45)",
};

export default function Dashboard() {
  const navigate = useNavigate();
  const { userName, formulas, sectors, history } = useIndustrialWorkspace();
  const sectorUsage = sectors.map((sector) => ({
    name: sector.name,
    calculos: sector.activeCalculations,
    formulas: sector.formulas,
  }));
  const totalCalculations = sectorUsage.reduce((total, item) => total + item.calculos, 0);
  const totalFormulas = formulas.length;
  const topFormulas = [...formulas].sort((a, b) => b.usageCount - a.usageCount).slice(0, 6);
  const validatedFormulas = formulas.filter((formula) => formula.status === "validada" || formula.status === "aprovada").length;
  const pendingApproval = formulas.filter((formula) => formula.status === "em_revisao").length;
  const mostUsedSector = [...sectors].sort((a, b) => b.activeCalculations - a.activeCalculations)[0];
  const mistura90Sector = sectors.find((sector) => sector.id === "elevadores_mistura_90");
  const mistura90Formulas = formulas.filter((formula) => formula.sectorId === "elevadores_mistura_90");

  return (
    <div className="mx-auto flex w-full max-w-[1500px] flex-col gap-6">
      <section className="flex flex-col gap-4 rounded-lg border border-border/60 bg-card/50 p-5 glow-card lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Badge className="border-primary/25 bg-primary/15 text-primary hover:bg-primary/15">i9TMG Industrial</Badge>
            <Badge variant="outline" className="border-success/25 bg-success/10 text-success">
              Online
            </Badge>
          </div>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-foreground">Dashboard tecnico</h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Ola, {userName}. Visao consolidada de calculos, setores, formulas e validacoes para operacao industrial.
          </p>
        </div>
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="rounded-lg border border-border/70 bg-muted/20 px-4 py-3">
            <p className="font-mono text-2xl font-semibold text-primary">98.4%</p>
            <p className="text-xs text-muted-foreground">Confiabilidade</p>
          </div>
          <div className="rounded-lg border border-border/70 bg-muted/20 px-4 py-3">
            <p className="font-mono text-2xl font-semibold text-foreground">24/7</p>
            <p className="text-xs text-muted-foreground">Operacao</p>
          </div>
          <div className="rounded-lg border border-border/70 bg-muted/20 px-4 py-3">
            <p className="font-mono text-2xl font-semibold text-success">{sectors.length}</p>
            <p className="text-xs text-muted-foreground">Setores</p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <DashboardCard
          title="Total de calculos"
          value={history.length}
          subtitle="Execucoes rastreadas no historico"
          icon={Calculator}
          trend={{ value: "+12%", positive: true }}
        />
        <DashboardCard
          title="Formulas validadas"
          value={validatedFormulas}
          subtitle="Liberadas para uso operacional"
          icon={Layers}
          trend={{ value: "+4%", positive: true }}
          accent="blue"
        />
        <DashboardCard
          title="Formulas cadastradas"
          value={totalFormulas}
          subtitle={`${pendingApproval} aguardando aprovacao`}
          icon={Database}
          trend={{ value: "+6 novas", positive: true }}
          accent="green"
        />
        <DashboardCard
          title="Setor mais usado"
          value={mostUsedSector?.name || "-"}
          subtitle={`${totalCalculations} calculos ativos no mes`}
          icon={ShieldCheck}
          trend={{ value: "+3%", positive: true }}
          accent="yellow"
        />
      </section>

      {mistura90Sector && (
        <section className="rounded-lg border border-primary/25 bg-primary/10 p-5 glow-card">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Setor especial</p>
              <h2 className="mt-2 text-2xl font-semibold text-foreground">Elevadores e Mistura 90</h2>
              <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">{mistura90Sector.description}</p>
            </div>
            <div className="grid grid-cols-3 gap-3 text-center">
              <Metric label="Formulas" value={mistura90Formulas.length} />
              <Metric label="Uso" value={mistura90Sector.activeCalculations} />
              <Metric label="Saude" value={`${mistura90Sector.health}%`} />
            </div>
          </div>
        </section>
      )}

      <section className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
        <Card className="gradient-industrial glow-card border-border/60">
          <CardHeader className="flex flex-row items-center justify-between border-b border-border/70 p-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Uso por setor</p>
              <CardTitle className="mt-1 text-lg text-foreground">Distribuicao de calculos</CardTitle>
            </div>
            <Activity className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent className="p-5">
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sectorUsage}>
                  <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                  <Tooltip cursor={{ fill: "hsl(var(--muted) / 0.25)" }} contentStyle={tooltipStyle} />
                  <Bar dataKey="calculos" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="formulas" fill="hsl(var(--info))" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="gradient-industrial glow-card border-border/60">
          <CardHeader className="border-b border-border/70 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Atividade recente</p>
            <CardTitle className="mt-1 text-lg text-foreground">Frequencia semanal</CardTitle>
          </CardHeader>
          <CardContent className="p-5">
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={weeklyActivity}>
                  <defs>
                    <linearGradient id="activityFill" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Area dataKey="calculos" type="monotone" stroke="hsl(var(--primary))" fill="url(#activityFill)" strokeWidth={2.5} />
                  <Area dataKey="validacoes" type="monotone" stroke="hsl(var(--success))" fill="transparent" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
        <Card className="gradient-industrial glow-card border-border/60">
          <CardHeader className="border-b border-border/70 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Mais utilizados</p>
            <CardTitle className="mt-1 text-lg text-foreground">Calculos em destaque</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 p-5">
            {topFormulas.map((formula) => (
              <button
                key={formula.id}
                type="button"
                onClick={() => navigate("/calculos")}
                className="flex w-full items-center justify-between gap-3 rounded-lg border border-border/70 bg-muted/20 p-3 text-left transition-colors hover:border-primary/35 hover:bg-muted/35"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-foreground">{formula.name}</p>
                  <p className="mt-1 truncate font-mono text-xs text-muted-foreground">{formula.expression}</p>
                </div>
                <Badge variant="outline" className="shrink-0 border-primary/25 bg-primary/10 text-primary">
                  {formula.usageCount} usos
                </Badge>
              </button>
            ))}
          </CardContent>
        </Card>

        <Card className="gradient-industrial glow-card border-border/60">
          <CardHeader className="border-b border-border/70 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Atividade recente</p>
            <CardTitle className="mt-1 text-lg text-foreground">Linha operacional</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 p-5 md:grid-cols-2">
            {history.slice(0, 6).map((item) => (
              <div key={item.id} className="rounded-lg border border-border/70 bg-muted/20 p-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">{item.formula}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{item.operator} - {item.date}</p>
                  </div>
                  <Badge variant="outline" className="border-success/25 bg-success/10 text-success">
                    {item.status}
                  </Badge>
                </div>
                <p className="mt-3 font-mono text-sm font-semibold text-primary">
                  {item.result} {item.unit}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <Card className="gradient-industrial glow-card border-border/60">
        <CardHeader className="flex flex-col gap-3 border-b border-border/70 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Ultimos calculos</p>
            <CardTitle className="mt-1 text-lg text-foreground">Fila tecnica recente</CardTitle>
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/historico")}
            className="border-border bg-muted/25 text-foreground hover:bg-primary hover:text-primary-foreground"
          >
            Ver historico
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/25">
              <TableRow className="hover:bg-transparent">
                <TableHead>Formula</TableHead>
                <TableHead>Setor</TableHead>
                <TableHead>Operador</TableHead>
                <TableHead className="text-right">Resultado</TableHead>
                <TableHead className="text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {history.slice(0, 5).map((item) => (
                <TableRow key={item.id} className="border-border/70 hover:bg-muted/25">
                  <TableCell>
                    <div>
                      <p className="font-medium text-foreground">{item.formula}</p>
                      <p className="text-xs text-muted-foreground">{item.date}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="border-primary/25 bg-primary/10 text-primary">
                      {item.sector}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{item.operator}</TableCell>
                  <TableCell className="text-right font-mono font-semibold text-foreground">
                    {item.result} {item.unit}
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge variant="outline" className="border-success/25 bg-success/10 text-success">
                      {item.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-border/70 bg-background/35 px-4 py-3">
      <p className="font-mono text-2xl font-semibold text-foreground">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}
