import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Building2,
  CheckCircle2,
  ClipboardCopy,
  Download,
  Factory,
  FileDown,
  FileSpreadsheet,
  Filter,
  Gauge,
  Layers,
  PackageCheck,
  Printer,
  RefreshCw,
  Search,
  Settings2,
  ShieldCheck,
  Target,
  type LucideIcon,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  classifyMistura90Item,
  getEquipmentById,
  getMistura90Criticality,
  getMistura90Kpis,
  getReportItemsByEquipment,
  mistura90Equipments,
  mistura90ReportItems,
  mistura90Sheets,
  mistura90Workbook,
  type Mistura90Equipment,
  type Mistura90EquipmentType,
} from "@/lib/mistura90-excel-data";
import {
  calculateMistura90Scenario,
  cloneScenarioInputs,
  formatScenarioValue,
  inferMistura90Scenario,
  mistura90ScenarioLabels,
  type Mistura90ScenarioInput,
  type Mistura90ScenarioMode,
} from "@/lib/mistura90-calculations";
import { i9CompanyTimeline, i9QualityRequirements, i9Segments, i9SolutionFronts } from "@/lib/i9-requirements";

const chartColors = ["#ff6a00", "#38bdf8", "#22c55e", "#f59e0b", "#a855f7", "#94a3b8"];

const tooltipStyle = {
  background: "hsl(var(--card))",
  border: "1px solid hsl(var(--border))",
  borderRadius: 8,
  color: "hsl(var(--foreground))",
  boxShadow: "0 14px 40px hsl(210 60% 4% / 0.45)",
};

export default function Mistura90Excel() {
  const kpis = useMemo(() => getMistura90Kpis(), []);
  const [selectedEquipmentId, setSelectedEquipmentId] = useState(mistura90Equipments[0].id);
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<Mistura90EquipmentType | "todos">("todos");
  const [criticalityFilter, setCriticalityFilter] = useState("todos");

  const selectedEquipment = getEquipmentById(selectedEquipmentId) || mistura90Equipments[0];
  const selectedItems = getReportItemsByEquipment(selectedEquipment.id);
  const [scenarioMode, setScenarioMode] = useState<Mistura90ScenarioMode>(() => inferMistura90Scenario(selectedEquipment.type));
  const [scenarioInputs, setScenarioInputs] = useState<Mistura90ScenarioInput[]>(() => cloneScenarioInputs(inferMistura90Scenario(selectedEquipment.type)));
  const scenarioResult = useMemo(() => calculateMistura90Scenario(scenarioMode, scenarioInputs), [scenarioInputs, scenarioMode]);

  useEffect(() => {
    const nextMode = inferMistura90Scenario(selectedEquipment.type);
    setScenarioMode(nextMode);
    setScenarioInputs(cloneScenarioInputs(nextMode));
  }, [selectedEquipment.id, selectedEquipment.type]);

  const filteredEquipments = useMemo(
    () =>
      mistura90Equipments.filter((equipment) => {
        const matchesType = typeFilter === "todos" || equipment.type === typeFilter;
        const text = `${equipment.code} ${equipment.name} ${equipment.description}`.toLowerCase();
        return matchesType && text.includes(query.trim().toLowerCase());
      }),
    [query, typeFilter],
  );

  const filteredReportItems = useMemo(
    () =>
      mistura90ReportItems.filter((item) => {
        const equipment = getEquipmentById(item.equipmentId);
        const criticality = getMistura90Criticality(item);
        const text = `${equipment?.code} ${equipment?.name} ${item.item} ${item.description || ""} ${item.note || ""}`.toLowerCase();
        const matchesText = text.includes(query.trim().toLowerCase());
        const matchesType = typeFilter === "todos" || equipment?.type === typeFilter;
        const matchesCriticality = criticalityFilter === "todos" || criticality === criticalityFilter;
        return matchesText && matchesType && matchesCriticality;
      }),
    [criticalityFilter, query, typeFilter],
  );

  const equipmentTypeData = useMemo(() => {
    const grouped = new Map<Mistura90EquipmentType, number>();
    mistura90Equipments.forEach((equipment) => {
      grouped.set(equipment.type, (grouped.get(equipment.type) || 0) + 1);
    });
    return Array.from(grouped.entries()).map(([name, value]) => ({ name, value }));
  }, []);

  const categoryData = useMemo(() => {
    const grouped = new Map<string, number>();
    mistura90ReportItems.forEach((item) => {
      const category = classifyMistura90Item(item);
      grouped.set(category, (grouped.get(category) || 0) + (item.quantity || 1));
    });
    return Array.from(grouped.entries())
      .map(([name, quantidade]) => ({ name, quantidade }))
      .sort((a, b) => b.quantidade - a.quantidade);
  }, []);

  const criticalityData = useMemo(() => {
    const grouped = new Map<string, number>();
    mistura90ReportItems.forEach((item) => {
      const criticality = getMistura90Criticality(item);
      grouped.set(criticality, (grouped.get(criticality) || 0) + 1);
    });
    return Array.from(grouped.entries()).map(([name, value]) => ({ name, value }));
  }, []);

  const reportText = useMemo(() => buildReportText(), []);

  const updateScenarioInput = (key: string, value: string) => {
    setScenarioInputs((current) =>
      current.map((input) => (input.key === key ? { ...input, value: Number(value) || 0 } : input)),
    );
  };

  const changeScenarioMode = (mode: Mistura90ScenarioMode) => {
    setScenarioMode(mode);
    setScenarioInputs(cloneScenarioInputs(mode));
  };

  const resetScenario = () => {
    setScenarioInputs(cloneScenarioInputs(scenarioMode));
    toast.success("Parametros padrao recarregados.");
  };

  const copyReport = async () => {
    try {
      await navigator.clipboard.writeText(reportText);
      toast.success("Relatorio tecnico copiado.");
    } catch {
      toast.error("Nao foi possivel copiar o relatorio.");
    }
  };

  const exportReport = () => {
    downloadFile("relatorio-mistura-90-i9tmg.txt", reportText, "text/plain;charset=utf-8");
    toast.success("Relatorio TXT exportado.");
  };

  const exportCsv = () => {
    const csv = [
      ["Equipamento", "Tipo", "Item", "Quantidade", "Categoria", "Criticidade", "Descricao", "Observacao"],
      ...mistura90ReportItems.map((item) => {
        const equipment = getEquipmentById(item.equipmentId);
        return [
          equipment?.code || "",
          equipment?.type || "",
          item.item,
          item.quantity ?? "A definir",
          classifyMistura90Item(item),
          getMistura90Criticality(item),
          item.description || "",
          item.note || "",
        ];
      }),
    ]
      .map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(";"))
      .join("\n");

    downloadFile("resumo-mistura-90-i9tmg.csv", csv, "text/csv;charset=utf-8");
    toast.success("Resumo CSV exportado.");
  };

  const exportPdf = async () => {
    const toastId = toast.loading("Gerando PDF tecnico i9TMG...");
    try {
      const { generateMistura90PdfReport } = await import("@/lib/mistura90-pdf");
      await generateMistura90PdfReport({ selectedEquipment, scenario: scenarioResult });
      toast.success("PDF tecnico gerado com layout i9TMG.", { id: toastId });
    } catch {
      toast.error("Nao foi possivel gerar o PDF.", { id: toastId });
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-[1680px] flex-col gap-6 print:max-w-none">
      <section className="overflow-hidden rounded-lg border border-primary/25 bg-[radial-gradient(circle_at_top_right,hsl(var(--primary)/0.18),transparent_32%),linear-gradient(135deg,hsl(var(--card)),hsl(var(--muted)/0.18))] glow-card">
        <div className="grid gap-5 p-5 lg:grid-cols-[1fr_0.72fr] lg:p-7">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="border-primary/25 bg-primary/15 text-primary hover:bg-primary/15">
                Planilha digitalizada
              </Badge>
              <Badge variant="outline" className="border-success/25 bg-success/10 text-success">
                {mistura90Workbook.sheets} abas analisadas
              </Badge>
              <Badge variant="outline" className="border-warning/25 bg-warning/10 text-warning">
                {kpis.pendingItems} pendencias tecnicas
              </Badge>
            </div>
            <h1 className="mt-4 text-balance text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
              Equipamentos Mistura 90
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground md:text-base">
              Modulo tecnico baseado no arquivo {mistura90Workbook.fileName}: elevadores, peneiras, moinho,
              transportadores, misturador, dosador, selecoes mecanicas e relatorio final de componentes.
            </p>
            <div className="mt-5 flex flex-wrap gap-3 print:hidden">
              <Button type="button" onClick={exportPdf} className="bg-primary text-primary-foreground hover:bg-highlight-glow">
                <FileDown className="mr-2 h-4 w-4" />
                Gerar PDF i9TMG
              </Button>
              <Button type="button" variant="outline" onClick={copyReport} className="border-border bg-muted/25">
                <ClipboardCopy className="mr-2 h-4 w-4" />
                Copiar relatorio
              </Button>
              <Button type="button" variant="outline" onClick={exportReport} className="border-border bg-muted/25">
                <Download className="mr-2 h-4 w-4" />
                TXT tecnico
              </Button>
              <Button type="button" variant="outline" onClick={exportCsv} className="border-border bg-muted/25">
                <FileSpreadsheet className="mr-2 h-4 w-4" />
                Baixar CSV
              </Button>
              <Button type="button" variant="outline" onClick={() => window.print()} className="border-border bg-muted/25">
                <Printer className="mr-2 h-4 w-4" />
                Imprimir
              </Button>
            </div>
          </div>

          <div className="grid min-w-0 grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-2">
            <HeroMetric icon={Factory} label="Equipamentos" value={kpis.equipments} />
            <HeroMetric icon={PackageCheck} label="Itens no resumo" value={kpis.reportItems} />
            <HeroMetric icon={Gauge} label="Qtd. total" value={formatNumber(kpis.totalQuantity)} />
            <HeroMetric icon={ShieldCheck} label="Formulas Excel" value={`${mistura90Workbook.formulaCells}+`} />
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
        <KpiCard title="Acionamentos" value={kpis.driveCount} subtitle="Motores, motorredutores e motovibradores" tone="primary" />
        <KpiCard title="Correias" value={kpis.beltMeters} subtitle="Metros/listas de correia no resumo" tone="info" />
        <KpiCard title="Canecas" value={kpis.bucketCount} subtitle="Elevadores EL-001, EL-002 e EL-003" tone="success" />
        <KpiCard title="Roletes" value={kpis.rollerCount} subtitle="Retorno e carga dos transportadores" tone="primary" />
        <KpiCard title="Pendencias" value={kpis.pendingItems} subtitle="Itens sem qtd., descricao ou com observacao" tone="warning" />
        <KpiCard title="Fonte" value={mistura90Workbook.sheets} subtitle="Abas tecnicas mapeadas" tone="info" />
      </section>

      <Card className="gradient-industrial glow-card border-border/60 print:hidden">
        <CardContent className="grid gap-3 p-4 lg:grid-cols-[1fr_220px_220px]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar por equipamento, item, descricao, mancal, correia, motorredutor..."
              className="h-10 border-border/70 bg-background/60 pl-9"
            />
          </div>
          <Select value={typeFilter} onValueChange={(value) => setTypeFilter(value as Mistura90EquipmentType | "todos")}>
            <SelectTrigger className="h-10 border-border/70 bg-background/60">
              <Filter className="mr-2 h-4 w-4 text-muted-foreground" />
              <SelectValue placeholder="Tipo de equipamento" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os tipos</SelectItem>
              <SelectItem value="Elevador">Elevadores</SelectItem>
              <SelectItem value="Peneira">Peneiras</SelectItem>
              <SelectItem value="Moinho">Moinho</SelectItem>
              <SelectItem value="Transportador">Transportadores</SelectItem>
              <SelectItem value="Misturador">Misturador</SelectItem>
              <SelectItem value="Dosador">Dosador</SelectItem>
            </SelectContent>
          </Select>
          <Select value={criticalityFilter} onValueChange={setCriticalityFilter}>
            <SelectTrigger className="h-10 border-border/70 bg-background/60">
              <AlertTriangle className="mr-2 h-4 w-4 text-muted-foreground" />
              <SelectValue placeholder="Criticidade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todas as criticidades</SelectItem>
              <SelectItem value="Alta">Alta</SelectItem>
              <SelectItem value="Media">Media</SelectItem>
              <SelectItem value="Baixa">Baixa</SelectItem>
              <SelectItem value="Pendente">Pendente</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Tabs defaultValue="painel" className="space-y-4">
        <TabsList className="grid h-auto w-full grid-cols-1 gap-2 bg-muted/20 p-1 sm:grid-cols-2 lg:grid-cols-5 print:hidden">
          <TabsTrigger value="painel" className="min-h-10 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            Painel executivo
          </TabsTrigger>
          <TabsTrigger value="dimensionador" className="min-h-10 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            Dimensionador
          </TabsTrigger>
          <TabsTrigger value="padrao-i9" className="min-h-10 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            Padrao i9TMG
          </TabsTrigger>
          <TabsTrigger value="memoria" className="min-h-10 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            Memoria de calculo
          </TabsTrigger>
          <TabsTrigger value="relatorio" className="min-h-10 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            Relatorio final
          </TabsTrigger>
        </TabsList>

        <TabsContent value="painel" className="space-y-4">
          <section className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
            <Card className="gradient-industrial glow-card border-border/60">
              <CardHeader className="border-b border-border/70 p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Mapa da planilha</p>
                <CardTitle className="mt-1 text-xl text-foreground">Escopo por equipamento</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3 p-5 sm:grid-cols-2">
                {filteredEquipments.map((equipment) => (
                  <EquipmentButton
                    key={equipment.id}
                    equipment={equipment}
                    active={selectedEquipment.id === equipment.id}
                    onClick={() => setSelectedEquipmentId(equipment.id)}
                  />
                ))}
              </CardContent>
            </Card>

            <div className="grid gap-4">
              <Card className="gradient-industrial glow-card border-border/60">
                <CardHeader className="border-b border-border/70 p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Equipamento selecionado</p>
                  <CardTitle className="mt-1 flex flex-wrap items-center gap-3 text-xl text-foreground">
                    {selectedEquipment.code}
                    <Badge variant="outline" className={selectedEquipment.status === "Calculado" ? "border-success/25 bg-success/10 text-success" : "border-warning/25 bg-warning/10 text-warning"}>
                      {selectedEquipment.status}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-5 p-5">
                  <div>
                    <h2 className="text-2xl font-semibold text-foreground">{selectedEquipment.name}</h2>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{selectedEquipment.description}</p>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    {selectedEquipment.metrics.map((metric) => (
                      <MetricPill key={metric.label} metric={metric} />
                    ))}
                  </div>
                  <div className="grid gap-3 lg:grid-cols-[0.95fr_1.05fr]">
                    <div className="rounded-lg border border-border/70 bg-background/35 p-4">
                      <p className="text-sm font-semibold text-foreground">Formulas e criterios</p>
                      <div className="mt-3 space-y-2">
                        {selectedEquipment.formulas.map((formula) => (
                          <div key={formula} className="rounded-md border border-primary/15 bg-primary/10 px-3 py-2 font-mono text-xs leading-relaxed text-primary">
                            {formula}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="rounded-lg border border-border/70 bg-background/35 p-4">
                      <p className="text-sm font-semibold text-foreground">Itens do RESUMO</p>
                      <div className="mt-3 grid gap-2">
                        {selectedItems.slice(0, 6).map((item) => (
                          <div key={item.id} className="flex items-start justify-between gap-3 rounded-md bg-muted/20 px-3 py-2">
                            <span className="min-w-0 text-sm text-muted-foreground">{item.item}</span>
                            <span className="shrink-0 font-mono text-sm font-semibold text-foreground">{item.quantity ?? "A definir"}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>

          <section className="grid gap-4 xl:grid-cols-[1fr_0.8fr]">
            <Card className="gradient-industrial glow-card border-border/60">
              <CardHeader className="border-b border-border/70 p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Distribuicao</p>
                <CardTitle className="mt-1 text-xl text-foreground">Quantidade por categoria tecnica</CardTitle>
              </CardHeader>
              <CardContent className="p-5">
                <div className="h-[320px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={categoryData}>
                      <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} interval={0} angle={-20} textAnchor="end" height={90} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                      <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "hsl(var(--muted) / 0.25)" }} />
                      <Bar dataKey="quantidade" radius={[6, 6, 0, 0]}>
                        {categoryData.map((entry, index) => (
                          <Cell key={entry.name} fill={chartColors[index % chartColors.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="gradient-industrial glow-card border-border/60">
              <CardHeader className="border-b border-border/70 p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Risco de liberacao</p>
                <CardTitle className="mt-1 text-xl text-foreground">Criticidade dos itens</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 p-5 lg:grid-cols-[0.9fr_1fr] xl:grid-cols-1 2xl:grid-cols-[0.9fr_1fr]">
                <div className="h-[230px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={criticalityData} dataKey="value" nameKey="name" innerRadius={54} outerRadius={88} paddingAngle={3}>
                        {criticalityData.map((entry, index) => (
                          <Cell key={entry.name} fill={chartColors[index % chartColors.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={tooltipStyle} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-2">
                  {criticalityData.map((item, index) => (
                    <div key={item.name} className="flex items-center justify-between rounded-lg border border-border/70 bg-background/35 px-3 py-2">
                      <div className="flex min-w-0 items-center gap-2">
                        <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: chartColors[index % chartColors.length] }} />
                        <span className="text-sm text-muted-foreground">{item.name}</span>
                      </div>
                      <span className="font-mono text-sm font-semibold text-foreground">{item.value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </section>
        </TabsContent>

        <TabsContent value="dimensionador" className="space-y-4">
          <section className="grid gap-4 xl:grid-cols-[0.92fr_1.08fr]">
            <Card className="gradient-industrial glow-card border-border/60">
              <CardHeader className="flex flex-col gap-3 border-b border-border/70 p-5 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Inputs do Excel</p>
                  <CardTitle className="mt-1 text-xl text-foreground">Dimensionador parametrico i9TMG</CardTitle>
                </div>
                <Button type="button" variant="outline" onClick={resetScenario} className="w-fit border-border bg-muted/25">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Recarregar padrao
                </Button>
              </CardHeader>
              <CardContent className="space-y-5 p-5">
                <div className="grid gap-3 sm:grid-cols-2">
                  {(Object.keys(mistura90ScenarioLabels) as Mistura90ScenarioMode[]).map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => changeScenarioMode(mode)}
                      className={`rounded-lg border p-4 text-left transition-all duration-200 hover:-translate-y-0.5 ${
                        scenarioMode === mode
                          ? "border-primary/50 bg-primary/15 text-foreground"
                          : "border-border/70 bg-background/35 text-muted-foreground hover:border-primary/35 hover:bg-muted/25"
                      }`}
                    >
                      <p className="font-semibold">{mistura90ScenarioLabels[mode]}</p>
                      <p className="mt-1 text-xs leading-relaxed">
                        {mode === "elevador" && "Capacidade, material por metro, canecas e tensoes."}
                        {mode === "peneira" && "Area requerida, area selecionada e rotacao."}
                        {mode === "transportador" && "Capacidade pela area carregada e velocidade da correia."}
                        {mode === "moinho" && "Energia especifica, potencia e rotacao do rotor."}
                      </p>
                    </button>
                  ))}
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  {scenarioInputs.map((input) => (
                    <label key={input.key} className="rounded-lg border border-border/70 bg-background/35 p-3">
                      <span className="flex items-center justify-between gap-3 text-xs text-muted-foreground">
                        <span>{input.label}</span>
                        <span className="font-mono text-primary">{input.unit || "coef."}</span>
                      </span>
                      <Input
                        type="number"
                        step={input.step || 0.01}
                        value={input.value}
                        onChange={(event) => updateScenarioInput(input.key, event.target.value)}
                        className="mt-2 h-10 border-border/70 bg-background/65 font-mono"
                      />
                    </label>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-4">
              <Card className="gradient-industrial glow-card border-primary/20">
                <CardHeader className="border-b border-border/70 p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Resultado calculado</p>
                  <CardTitle className="mt-1 text-xl text-foreground">{scenarioResult.title}</CardTitle>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{scenarioResult.source}</p>
                </CardHeader>
                <CardContent className="space-y-5 p-5">
                  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    {scenarioResult.outputs.map((output) => (
                      <ScenarioOutputCard key={output.key} output={output} />
                    ))}
                  </div>

                  {scenarioResult.warnings.length > 0 ? (
                    <div className="rounded-lg border border-warning/30 bg-warning/10 p-4">
                      <p className="flex items-center gap-2 text-sm font-semibold text-warning">
                        <AlertTriangle className="h-4 w-4" />
                        Alertas de engenharia
                      </p>
                      <div className="mt-3 space-y-2">
                        {scenarioResult.warnings.map((warning) => (
                          <p key={warning} className="text-sm leading-relaxed text-muted-foreground">
                            {warning}
                          </p>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-lg border border-success/30 bg-success/10 p-4 text-sm text-success">
                      Parametros consistentes para emissao preliminar do relatorio.
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="gradient-industrial glow-card border-border/60">
                <CardHeader className="border-b border-border/70 p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Passo a passo</p>
                  <CardTitle className="mt-1 text-xl text-foreground">Como o resultado foi gerado</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 p-5">
                  {scenarioResult.steps.map((step, index) => (
                    <div key={step} className="grid grid-cols-[36px_1fr] gap-3 rounded-lg border border-border/70 bg-background/35 p-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/15 font-mono text-sm font-semibold text-primary">
                        {index + 1}
                      </div>
                      <p className="font-mono text-sm leading-relaxed text-muted-foreground">{step}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </section>
        </TabsContent>

        <TabsContent value="padrao-i9" className="space-y-4">
          <section className="grid gap-4 xl:grid-cols-[1fr_0.78fr]">
            <Card className="gradient-industrial glow-card border-border/60">
              <CardHeader className="border-b border-border/70 p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Aderencia institucional</p>
                <CardTitle className="mt-1 text-xl text-foreground">Segmentos i9TMG dentro do sistema</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3 p-5 md:grid-cols-2 xl:grid-cols-3">
                {i9Segments.map((segment) => (
                  <div key={segment.id} className="group rounded-lg border border-border/70 bg-background/35 p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/35 hover:bg-muted/25">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-primary" />
                      <p className="font-semibold text-foreground">{segment.name}</p>
                    </div>
                    <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted-foreground">{segment.focus}</p>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {segment.equipmentFit.slice(0, 3).map((fit) => (
                        <Badge key={fit} variant="outline" className="border-primary/20 bg-primary/10 text-primary">
                          {fit}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="gradient-industrial glow-card border-primary/20">
              <CardHeader className="border-b border-border/70 p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Evolucao i9TMG</p>
                <CardTitle className="mt-1 text-xl text-foreground">Linha do tempo aplicada</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 p-5">
                {i9CompanyTimeline.map((item) => (
                  <div key={item.year} className="grid grid-cols-[58px_1fr] gap-3 rounded-lg border border-border/70 bg-background/35 p-3">
                    <span className="font-mono text-sm font-semibold text-primary">{item.year}</span>
                    <span className="text-sm leading-relaxed text-muted-foreground">{item.event}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </section>

          <section className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
            <Card className="gradient-industrial glow-card border-border/60">
              <CardHeader className="border-b border-border/70 p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Frentes de solucao</p>
                <CardTitle className="mt-1 text-xl text-foreground">Como o modulo conversa com a i9TMG</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 p-5">
                {i9SolutionFronts.map((front) => (
                  <div key={front.name} className="rounded-lg border border-border/70 bg-background/35 p-4 transition-all duration-200 hover:border-primary/35 hover:bg-muted/20">
                    <div className="flex items-center gap-2">
                      <Layers className="h-4 w-4 text-primary" />
                      <p className="font-semibold text-foreground">{front.name}</p>
                    </div>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{front.description}</p>
                    <div className="mt-3 grid gap-2 sm:grid-cols-2">
                      {front.deliverables.map((deliverable) => (
                        <div key={deliverable} className="rounded-md bg-muted/20 px-3 py-2 text-xs text-muted-foreground">
                          {deliverable}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="gradient-industrial glow-card border-border/60">
              <CardHeader className="border-b border-border/70 p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Requisitos do projeto</p>
                <CardTitle className="mt-1 text-xl text-foreground">Qualidade, UX e operacao</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 p-5">
                {i9QualityRequirements.map((requirement) => (
                  <div key={requirement.name} className="grid gap-3 rounded-lg border border-border/70 bg-background/35 p-4 md:grid-cols-[180px_1fr]">
                    <p className="flex items-center gap-2 font-semibold text-foreground">
                      <Target className="h-4 w-4 text-primary" />
                      {requirement.name}
                    </p>
                    <p className="text-sm leading-relaxed text-muted-foreground">{requirement.application}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </section>
        </TabsContent>

        <TabsContent value="memoria" className="space-y-4">
          <section className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
            <Card className="gradient-industrial glow-card border-border/60">
              <CardHeader className="border-b border-border/70 p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Abas do arquivo</p>
                <CardTitle className="mt-1 text-xl text-foreground">Mapa tecnico do workbook</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3 p-5">
                {mistura90Sheets.map((sheet) => (
                  <div key={sheet.name} className="group rounded-lg border border-border/70 bg-background/35 p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/35 hover:bg-muted/25">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-mono text-sm font-semibold text-primary">{sheet.name}</p>
                        <p className="mt-1 text-sm text-foreground">{sheet.purpose}</p>
                      </div>
                      <Badge variant="outline" className="border-primary/25 bg-primary/10 text-primary">
                        {sheet.formulas} formulas
                      </Badge>
                    </div>
                    <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                      <MiniStat label="Linhas" value={sheet.rows} />
                      <MiniStat label="Colunas" value={sheet.columns} />
                      <MiniStat label="Celulas calc." value={sheet.formulas} />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="gradient-industrial glow-card border-border/60">
              <CardHeader className="border-b border-border/70 p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Memoria consolidada</p>
                <CardTitle className="mt-1 text-xl text-foreground">Leitura tecnica por equipamento</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 p-5">
                {mistura90Equipments.map((equipment) => (
                  <div key={equipment.id} className="rounded-lg border border-border/70 bg-background/35 p-4 transition-all duration-200 hover:border-primary/35 hover:bg-muted/20">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge variant="outline" className="border-primary/25 bg-primary/10 text-primary">
                            {equipment.code}
                          </Badge>
                          <Badge variant="outline" className="border-border bg-muted/30 text-muted-foreground">
                            {equipment.type}
                          </Badge>
                        </div>
                        <h3 className="mt-2 text-lg font-semibold text-foreground">{equipment.name}</h3>
                        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{equipment.description}</p>
                      </div>
                      <Badge variant="outline" className={equipment.status === "Calculado" ? "border-success/25 bg-success/10 text-success" : "border-warning/25 bg-warning/10 text-warning"}>
                        {equipment.status}
                      </Badge>
                    </div>
                    <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
                      {equipment.metrics.map((metric) => (
                        <MetricPill key={metric.label} metric={metric} compact />
                      ))}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </section>
        </TabsContent>

        <TabsContent value="relatorio" className="space-y-4">
          <ReportCover kpis={kpis} />
          <Card className="gradient-industrial glow-card border-border/60">
            <CardHeader className="flex flex-col gap-3 border-b border-border/70 p-5 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Saida tecnica</p>
                <CardTitle className="mt-1 text-xl text-foreground">Lista de materiais e selecoes</CardTitle>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline" className="w-fit border-primary/25 bg-primary/10 text-primary">
                  {filteredReportItems.length} linhas filtradas
                </Badge>
                <Button type="button" onClick={exportPdf} className="h-9 bg-primary text-primary-foreground hover:bg-highlight-glow">
                  <FileDown className="mr-2 h-4 w-4" />
                  PDF
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="w-full overflow-x-auto">
                <Table className="min-w-[1120px]">
                  <TableHeader className="bg-muted/25">
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="w-[128px]">Equip.</TableHead>
                      <TableHead className="w-[150px]">Item</TableHead>
                      <TableHead className="w-[92px] text-right">Qtd.</TableHead>
                      <TableHead>Descricao tecnica</TableHead>
                      <TableHead className="w-[180px]">Categoria</TableHead>
                      <TableHead className="w-[130px]">Criticidade</TableHead>
                      <TableHead className="w-[220px]">Observacao</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredReportItems.map((item) => {
                      const equipment = getEquipmentById(item.equipmentId);
                      const criticality = getMistura90Criticality(item);
                      return (
                        <TableRow key={item.id} className="border-border/70 hover:bg-muted/25">
                          <TableCell>
                            <div className="font-mono text-sm font-semibold text-primary">{equipment?.code}</div>
                            <div className="mt-1 text-xs text-muted-foreground">{equipment?.type}</div>
                          </TableCell>
                          <TableCell className="font-medium text-foreground">{item.item}</TableCell>
                          <TableCell className="text-right font-mono font-semibold text-foreground">
                            {item.quantity ?? "A definir"}
                          </TableCell>
                          <TableCell className="max-w-[460px] whitespace-normal text-sm leading-relaxed text-muted-foreground">
                            {item.description || "Descricao pendente no resumo da planilha."}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="border-border bg-muted/30 text-muted-foreground">
                              {classifyMistura90Item(item)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={criticalityClass(criticality)}>
                              {criticality}
                            </Badge>
                          </TableCell>
                          <TableCell className="max-w-[220px] whitespace-normal text-sm text-muted-foreground">
                            {item.note || (criticality === "Pendente" ? "Validar quantidade/desenho." : "-")}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          <Card className="gradient-industrial glow-card border-primary/20">
            <CardHeader className="border-b border-border/70 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Parecer i9TMG</p>
              <CardTitle className="mt-1 text-xl text-foreground">Conclusao de engenharia</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 p-5 lg:grid-cols-3">
              <ConclusionCard
                icon={CheckCircle2}
                title="Liberado para consolidacao"
                text="Elevadores, peneiras, moinho e transportadores possuem memoria de capacidade e selecao base carregada no sistema."
              />
              <ConclusionCard
                icon={AlertTriangle}
                title="Pendencias controladas"
                text="Itens sem quantidade, sem descricao ou com nota de desenho aparecem destacados para revisao antes de compra/fabricacao."
              />
              <ConclusionCard
                icon={Settings2}
                title="Relatorio operacional"
                text="A saida gera PDF com identidade i9TMG, graficos, tabelas, checklist, pendencias e rastreabilidade tecnica."
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function HeroMetric({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-border/70 bg-background/35 p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/35 hover:bg-background/50">
      <Icon className="h-5 w-5 text-primary" />
      <p className="mt-3 break-words font-mono text-2xl font-semibold text-foreground">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

function ScenarioOutputCard({ output }: { output: { label: string; value: number; unit: string; status?: string } }) {
  const className =
    output.status === "critical"
      ? "border-destructive/30 bg-destructive/10 text-destructive"
      : output.status === "warning"
        ? "border-warning/30 bg-warning/10 text-warning"
        : "border-success/30 bg-success/10 text-success";

  return (
    <div className={`rounded-lg border p-4 ${className}`}>
      <p className="text-xs font-medium opacity-85">{output.label}</p>
      <p className="mt-2 break-words font-mono text-2xl font-semibold">
        {formatScenarioValue(output.value)} <span className="text-sm">{output.unit}</span>
      </p>
    </div>
  );
}

function KpiCard({ title, value, subtitle, tone }: { title: string; value: string | number; subtitle: string; tone: "primary" | "success" | "warning" | "info" }) {
  const toneClass = {
    primary: "text-primary",
    success: "text-success",
    warning: "text-warning",
    info: "text-info",
  }[tone];

  return (
    <Card className="gradient-industrial glow-card border-border/60 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/35">
      <CardContent className="p-4">
        <p className="text-xs font-medium text-muted-foreground">{title}</p>
        <p className={`mt-2 break-words font-mono text-2xl font-semibold ${toneClass}`}>{value}</p>
        <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{subtitle}</p>
      </CardContent>
    </Card>
  );
}

function EquipmentButton({ equipment, active, onClick }: { equipment: Mistura90Equipment; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-lg border p-4 text-left transition-all duration-200 hover:-translate-y-0.5 ${
        active ? "border-primary/50 bg-primary/15 shadow-[0_0_24px_hsl(var(--primary)/0.16)]" : "border-border/70 bg-background/35 hover:border-primary/35 hover:bg-muted/25"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-mono text-sm font-semibold text-primary">{equipment.code}</p>
          <p className="mt-1 line-clamp-1 text-sm font-medium text-foreground">{equipment.name}</p>
        </div>
        <Badge variant="outline" className="shrink-0 border-border bg-muted/30 text-muted-foreground">
          {equipment.type}
        </Badge>
      </div>
      <p className="mt-3 line-clamp-2 text-xs leading-relaxed text-muted-foreground">{equipment.description}</p>
    </button>
  );
}

function MetricPill({ metric, compact = false }: { metric: { label: string; value: string | number; unit?: string; tone?: string }; compact?: boolean }) {
  const toneClass = {
    primary: "text-primary",
    success: "text-success",
    warning: "text-warning",
    info: "text-info",
  }[metric.tone || "primary"] || "text-foreground";

  return (
    <div className="rounded-lg border border-border/70 bg-muted/20 px-3 py-3">
      <p className={`${compact ? "text-lg" : "text-2xl"} break-words font-mono font-semibold ${toneClass}`}>
        {metric.value} {metric.unit || ""}
      </p>
      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{metric.label}</p>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-md border border-border/60 bg-muted/20 px-2 py-2">
      <p className="font-mono text-sm font-semibold text-foreground">{value}</p>
      <p className="mt-1 text-[11px] text-muted-foreground">{label}</p>
    </div>
  );
}

function ReportCover({ kpis }: { kpis: ReturnType<typeof getMistura90Kpis> }) {
  return (
    <Card className="gradient-industrial glow-card border-primary/20">
      <CardContent className="grid gap-5 p-5 lg:grid-cols-[1fr_0.82fr]">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Relatorio tecnico de saida</p>
          <h2 className="mt-2 text-2xl font-semibold text-foreground">Resumo executivo para Equipamentos Mistura 90</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Documento consolidado a partir da aba RESUMO e das memorias de calculo do Excel. A estrutura destaca
            equipamentos, listas de compra/fabricacao, componentes criticos, pendencias de desenho e indicadores de liberacao.
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <MiniStat label="Equipamentos" value={kpis.equipments} />
            <MiniStat label="Itens" value={kpis.reportItems} />
            <MiniStat label="Qtd. acumulada" value={formatNumber(kpis.totalQuantity)} />
          </div>
        </div>
        <div className="rounded-lg border border-border/70 bg-background/35 p-4">
          <p className="text-sm font-semibold text-foreground">Checklist de liberacao</p>
          <div className="mt-3 space-y-3">
            {[
              "Conferir pendencias de desenho em coxins, mancais, roletes e cavaletes.",
              "Validar materiais SAE/ASTM e dimensoes de eixos antes da compra.",
              "Separar correias elevadoras, transportadoras e telas por tipo de aplicacao.",
              "Anexar este relatorio ao pacote tecnico de suprimentos e fabricacao.",
            ].map((item) => (
              <div key={item} className="flex gap-3 rounded-md bg-muted/20 p-3">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <p className="text-sm leading-relaxed text-muted-foreground">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ConclusionCard({ icon: Icon, title, text }: { icon: LucideIcon; title: string; text: string }) {
  return (
    <div className="rounded-lg border border-border/70 bg-background/35 p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/35">
      <Icon className="h-5 w-5 text-primary" />
      <p className="mt-3 font-semibold text-foreground">{title}</p>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{text}</p>
    </div>
  );
}

function criticalityClass(criticality: string) {
  if (criticality === "Alta") return "border-primary/25 bg-primary/10 text-primary";
  if (criticality === "Media") return "border-info/25 bg-info/10 text-info";
  if (criticality === "Baixa") return "border-success/25 bg-success/10 text-success";
  return "border-warning/25 bg-warning/10 text-warning";
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 2 }).format(value);
}

function downloadFile(fileName: string, content: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function buildReportText() {
  const kpis = getMistura90Kpis();
  const lines = [
    "i9TMG - RELATORIO TECNICO EQUIPAMENTOS MISTURA 90",
    `Fonte: ${mistura90Workbook.fileName}`,
    `Data de emissao: ${new Date().toLocaleDateString("pt-BR")}`,
    "",
    "1. INDICADORES GERAIS",
    `- Equipamentos mapeados: ${kpis.equipments}`,
    `- Itens no resumo: ${kpis.reportItems}`,
    `- Quantidade total acumulada: ${formatNumber(kpis.totalQuantity)}`,
    `- Acionamentos: ${kpis.driveCount}`,
    `- Correias: ${kpis.beltMeters}`,
    `- Canecas: ${kpis.bucketCount}`,
    `- Roletes: ${kpis.rollerCount}`,
    `- Pendencias tecnicas: ${kpis.pendingItems}`,
    "",
    "2. ESCOPO POR EQUIPAMENTO",
  ];

  mistura90Equipments.forEach((equipment) => {
    lines.push("", `${equipment.code} - ${equipment.name}`, `Tipo: ${equipment.type} | Status: ${equipment.status}`);
    lines.push(`Memoria: ${equipment.description}`);
    lines.push("Metricas:");
    equipment.metrics.forEach((metric) => lines.push(`  - ${metric.label}: ${metric.value} ${metric.unit || ""}`.trim()));
    lines.push("Itens principais:");
    getReportItemsByEquipment(equipment.id).forEach((item) => {
      const qty = item.quantity ?? "A definir";
      const note = item.note ? ` | OBS: ${item.note}` : "";
      lines.push(`  - ${item.item}: ${qty} | ${item.description || "Descricao pendente"}${note}`);
    });
  });

  lines.push(
    "",
    "3. PENDENCIAS DE ENGENHARIA",
    ...mistura90ReportItems
      .filter((item) => getMistura90Criticality(item) === "Pendente")
      .map((item) => {
        const equipment = getEquipmentById(item.equipmentId);
        return `- ${equipment?.code} | ${item.item}: ${item.note || "Quantidade ou descricao pendente no resumo."}`;
      }),
    "",
    "4. PARECER",
    "A memoria da planilha foi consolidada em modulo tecnico navegavel. Antes de emitir pedido de compra ou liberacao de fabricacao, revisar todos os itens classificados como Pendente e anexar desenho final quando solicitado.",
  );

  return lines.join("\n");
}
