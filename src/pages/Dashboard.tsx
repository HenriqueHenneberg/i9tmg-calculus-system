import { Activity, Calculator, Database, FileSpreadsheet, Layers, PackageCheck, ShieldCheck, Sparkles, Star } from "lucide-react";
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
import { getMistura90Kpis, mistura90Workbook } from "@/lib/mistura90-excel-data";

const tooltipStyle = {
  background: "hsl(var(--card))",
  border: "1px solid hsl(var(--border))",
  borderRadius: 8,
  color: "hsl(var(--foreground))",
  boxShadow: "0 14px 40px hsl(210 60% 4% / 0.45)",
};

const sectorChartLabels: Record<string, string> = {
  Mecanica: "Mec",
  Eletrica: "Ele",
  Hidraulica: "Hid",
  Producao: "Prod",
  Pneumatica: "Pneu",
  Estrutural: "Estr",
  Termodinamica: "Term",
  Instrumentacao: "Instr",
  Automacao: "Auto",
  Manutencao: "Mant",
  "Logistica industrial": "Log",
  Qualidade: "Qual",
  Planejamento: "Plan",
  Energia: "Ener",
  "Projeto Mistura 90": "M90",
  "Elevadores Industriais": "Elev",
};

export default function Dashboard() {
  const navigate = useNavigate();
  const { userName, formulas, sectors, history, favoriteIds } = useIndustrialWorkspace();
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
  const equipamentosMistura90Sector = sectors.find((sector) => sector.id === "equipamentos_mistura_90");
  const mistura90Formulas = formulas.filter((formula) => formula.sectorId === "elevadores_mistura_90");
  const equipamentosMistura90Formulas = formulas.filter((formula) => formula.sectorId === "equipamentos_mistura_90");
  const excelKpis = getMistura90Kpis();
  const favoriteFormulas = favoriteIds
    .map((id) => formulas.find((formula) => formula.id === id))
    .filter(Boolean)
    .slice(0, 4);

  return (
    <div className="mx-auto flex w-full max-w-[1500px] flex-col gap-6">
      <section className="gradient-industrial relative overflow-hidden rounded-lg border border-primary/25 p-5 glow-card">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-28"
          style={{ backgroundImage: "url('/i9-user-images/banner-i9tmg.jpg')" }}
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,hsl(var(--card)/0.96),hsl(var(--card)/0.88)_48%,hsl(var(--card)/0.42))]" aria-hidden="true" />
        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Badge className="border-primary/25 bg-primary/15 text-primary hover:bg-primary/15">i9TMG Industrial</Badge>
            <Badge variant="outline" className="border-success/25 bg-success/10 text-success">
              Online
            </Badge>
          </div>
          <h1 className="mt-4 text-balance text-3xl font-semibold tracking-tight text-foreground md:text-4xl">Centro de calculo i9TMG</h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            {userName}, aqui ficam os atalhos de bancada, a fila recente e o projeto Mistura 90.
          </p>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <Button
              type="button"
              onClick={() => navigate("/calculos")}
              className="h-11 bg-primary text-primary-foreground hover:bg-highlight-glow"
            >
              <Calculator className="h-4 w-4" />
              Bancada tecnica
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/mistura90-excel")}
              className="h-11 border-border bg-background/35 text-foreground hover:bg-muted/35"
            >
              <FileSpreadsheet className="h-4 w-4" />
              Projeto Mistura 90
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-3 text-center sm:grid-cols-3 lg:min-w-[420px]">
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
              <h2 className="mt-2 text-2xl font-semibold text-foreground">Elevadores Industriais</h2>
              <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">{mistura90Sector.description}</p>
            </div>
            <div className="grid grid-cols-1 gap-3 text-center sm:grid-cols-3">
              <Metric label="Formulas" value={mistura90Formulas.length} />
              <Metric label="Uso" value={mistura90Sector.activeCalculations} />
              <Metric label="Saude" value={`${mistura90Sector.health}%`} />
            </div>
          </div>
        </section>
      )}

      {equipamentosMistura90Sector && (
        <section className="gradient-industrial rounded-lg border border-primary/25 p-5 glow-card">
          <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(360px,430px)_auto] xl:items-center">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Planilha tecnica convertida</p>
              <h2 className="mt-2 flex flex-wrap items-center gap-3 text-2xl font-semibold text-foreground">
                <FileSpreadsheet className="h-6 w-6 text-primary" />
                Projeto Mistura 90
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {equipamentosMistura90Sector.description} Fonte: {mistura90Workbook.fileName}.
              </p>
            </div>
            <div className="grid min-w-0 grid-cols-2 gap-3 text-center sm:grid-cols-4">
              <Metric label="Equipamentos" value={excelKpis.equipments} />
              <Metric label="Itens" value={excelKpis.reportItems} />
              <Metric label="Pendencias" value={excelKpis.pendingItems} />
              <Metric label="Formulas" value={equipamentosMistura90Formulas.length} />
            </div>
            <Button
              type="button"
              onClick={() => navigate("/mistura90-excel")}
              className="h-11 w-full shrink-0 bg-primary text-primary-foreground hover:bg-highlight-glow sm:w-auto"
            >
              <PackageCheck className="mr-2 h-4 w-4" />
              Abrir Projeto M90
            </Button>
          </div>
        </section>
      )}

      <section className="grid gap-4 lg:grid-cols-[1fr_0.8fr]">
        <Card className="gradient-industrial glow-card border-border/60">
          <CardHeader className="flex flex-col gap-3 border-b border-border/70 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Atalhos pessoais</p>
              <CardTitle className="mt-1 text-lg text-foreground">Favoritos do usuario</CardTitle>
            </div>
            <Star className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent className="grid gap-3 p-5 sm:grid-cols-2">
            {favoriteFormulas.length > 0 ? (
              favoriteFormulas.map((formula) => (
                <button
                  key={formula.id}
                  type="button"
                  onClick={() => navigate(`/calculos?q=${encodeURIComponent(formula.name)}`)}
                  className="rounded-lg border border-border/70 bg-muted/20 p-3 text-left transition-colors hover:border-primary/35 hover:bg-muted/35"
                >
                  <p className="truncate text-sm font-semibold text-foreground">{formula.name}</p>
                  <p className="mt-1 truncate font-mono text-xs text-muted-foreground">{formula.expression}</p>
                </button>
              ))
            ) : (
              <div className="rounded-lg border border-border/70 bg-muted/20 p-4 text-sm text-muted-foreground sm:col-span-2">
                Marque formulas com estrela na bancada para montar seus atalhos.
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="gradient-industrial glow-card border-primary/20">
          <CardHeader className="border-b border-border/70 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Busca assistida</p>
            <CardTitle className="mt-1 flex items-center gap-2 text-lg text-foreground">
              <Sparkles className="h-5 w-5 text-primary" />
              Leitor de pedido tecnico
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 p-5">
            <p className="text-sm leading-relaxed text-muted-foreground">
              Escreva o problema em linguagem direta, encontre a formula e preencha valores detectados sem API externa.
            </p>
            <Button type="button" onClick={() => navigate("/calculos")} className="w-full bg-primary text-primary-foreground hover:bg-highlight-glow">
              Abrir assistente
            </Button>
          </CardContent>
        </Card>
      </section>

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
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    interval={0}
                    tickFormatter={(value) => sectorChartLabels[String(value)] || String(value).slice(0, 4)}
                    tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                  />
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
          <div className="w-full overflow-x-auto">
          <Table className="min-w-[760px]">
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
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="min-w-0 rounded-lg border border-border/70 bg-background/35 px-3 py-3 sm:px-4">
      <p className="whitespace-nowrap font-mono text-2xl font-semibold text-foreground">{value}</p>
      <p className="truncate text-xs text-muted-foreground">{label}</p>
    </div>
  );
}
