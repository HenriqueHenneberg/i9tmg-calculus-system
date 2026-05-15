import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Building2,
  CheckCircle2,
  ClipboardCopy,
  Download,
  Eraser,
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
  validateMistura90ScenarioInputs,
  zeroScenarioInputs,
  type Mistura90ScenarioInput,
  type Mistura90ScenarioMode,
  type Mistura90ScenarioResult,
} from "@/lib/mistura90-calculations";
import { i9CompanyTimeline, i9QualityRequirements, i9Segments, i9SolutionFronts } from "@/lib/i9-requirements";
import {
  getMistura90ReportAnalytics,
  getReleaseBadgeClass,
  type Mistura90ReportAnalytics,
} from "@/lib/mistura90-report";

const chartColors = [
  "hsl(var(--primary))",
  "hsl(var(--info))",
  "hsl(var(--success))",
  "hsl(var(--warning))",
  "hsl(var(--destructive))",
  "hsl(var(--muted-foreground))",
];

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
  const [activeTab, setActiveTab] = useState("dimensionador");
  const [showFullReport, setShowFullReport] = useState(false);

  const selectedEquipment = getEquipmentById(selectedEquipmentId) || mistura90Equipments[0];
  const selectedItems = getReportItemsByEquipment(selectedEquipment.id);
  const [scenarioMode, setScenarioMode] = useState<Mistura90ScenarioMode>(() => inferMistura90Scenario(selectedEquipment.type));
  const [scenarioInputs, setScenarioInputs] = useState<Mistura90ScenarioInput[]>(() => cloneScenarioInputs(inferMistura90Scenario(selectedEquipment.type)));
  const scenarioResult = useMemo(() => calculateMistura90Scenario(scenarioMode, scenarioInputs), [scenarioInputs, scenarioMode]);
  const scenarioValidation = useMemo(() => validateMistura90ScenarioInputs(scenarioMode, scenarioInputs), [scenarioInputs, scenarioMode]);
  const reportAnalytics = useMemo(() => getMistura90ReportAnalytics(selectedEquipment.id), [selectedEquipment.id]);

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

  const reportTableItems = useMemo(
    () => (showFullReport ? filteredReportItems : filteredReportItems.filter((item) => item.equipmentId === selectedEquipment.id)),
    [filteredReportItems, selectedEquipment.id, showFullReport],
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

  const reportText = useMemo(
    () => buildReportText(selectedEquipment, scenarioResult, reportAnalytics),
    [reportAnalytics, scenarioResult, selectedEquipment],
  );

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

  const clearScenario = () => {
    setScenarioInputs((current) => zeroScenarioInputs(current));
    toast.info("Numeros zerados. Preencha valores dentro dos limites para liberar o PDF.");
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
    if (!scenarioValidation.isValid) {
      setActiveTab("dimensionador");
      toast.error("Corrija os numeros fora dos limites antes de gerar o PDF.");
      return;
    }

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
              Projeto Mistura 90
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground md:text-base">
              Modulo tecnico baseado no arquivo {mistura90Workbook.fileName}: elevadores, peneiras, moinho,
              transportadores, misturador, dosador, selecoes mecanicas e relatorio final de componentes.
            </p>
            <div className="mt-5 grid gap-3 md:grid-cols-3 print:hidden">
              <WorkflowStepCard
                index="1"
                title="Preencher numeros"
                text="Escolha o equipamento e ajuste os parametros do Excel."
                active={activeTab === "dimensionador"}
                onClick={() => setActiveTab("dimensionador")}
              />
              <WorkflowStepCard
                index="2"
                title="Conferir resultado"
                text="Veja indicadores, alertas e memoria de calculo."
                active={activeTab === "relatorio"}
                onClick={() => setActiveTab("relatorio")}
              />
              <WorkflowStepCard
                index="3"
                title="Emitir PDF"
                text="Gere o relatorio final com tabelas e rastreabilidade."
                active={false}
                onClick={exportPdf}
              />
            </div>
            <div className="mt-5 flex flex-wrap gap-3 print:hidden">
              <Button type="button" onClick={() => setActiveTab("dimensionador")} className="bg-primary text-primary-foreground hover:bg-highlight-glow">
                <Settings2 className="mr-2 h-4 w-4" />
                Ir para os numeros
              </Button>
              <Button type="button" variant="outline" onClick={() => setActiveTab("relatorio")} className="border-border bg-muted/25">
                <FileDown className="mr-2 h-4 w-4" />
                Ver relatorio
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

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid h-auto w-full grid-cols-1 gap-2 bg-muted/20 p-1 sm:grid-cols-2 lg:grid-cols-5 print:hidden">
          <TabsTrigger value="dimensionador" className="min-h-10 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            1. Dimensionador
          </TabsTrigger>
          <TabsTrigger value="relatorio" className="min-h-10 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            2. Relatorio final
          </TabsTrigger>
          <TabsTrigger value="painel" className="min-h-10 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            Painel executivo
          </TabsTrigger>
          <TabsTrigger value="padrao-i9" className="min-h-10 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            Padrao i9TMG
          </TabsTrigger>
          <TabsTrigger value="memoria" className="min-h-10 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            Memoria de calculo
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
                  <CardTitle className="mt-1 text-xl text-foreground">Preenchimento do relatorio tecnico</CardTitle>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button type="button" variant="outline" onClick={resetScenario} className="border-border bg-muted/25">
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Recarregar padrao
                  </Button>
                  <Button type="button" variant="outline" onClick={clearScenario} className="border-destructive/30 bg-destructive/10 text-destructive hover:bg-destructive/15">
                    <Eraser className="mr-2 h-4 w-4" />
                    Zerar numeros
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-5 p-5">
                <div className="rounded-lg border border-primary/30 bg-primary/10 p-4">
                  <div className="grid gap-4 lg:grid-cols-[1fr_0.8fr]">
                    <div className="min-w-0">
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Equipamento base</p>
                      <h2 className="mt-1 text-lg font-semibold text-foreground">{selectedEquipment.code} - {selectedEquipment.name}</h2>
                      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                        O PDF final usa este equipamento, os valores informados abaixo e a lista tecnica filtrada do RESUMO.
                      </p>
                    </div>
                    <Select value={selectedEquipmentId} onValueChange={setSelectedEquipmentId}>
                      <SelectTrigger className="h-11 border-primary/30 bg-background/70">
                        <SelectValue placeholder="Selecionar equipamento" />
                      </SelectTrigger>
                      <SelectContent>
                        {mistura90Equipments.map((equipment) => (
                          <SelectItem key={equipment.id} value={equipment.id}>
                            {equipment.code} - {equipment.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Tipo de calculo</p>
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
                </div>

                <div>
                  <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Numeros de entrada</p>
                <div className="grid gap-3 md:grid-cols-2">
                  {scenarioInputs.map((input) => (
                    <label
                      key={input.key}
                      className={`rounded-lg border bg-background/35 p-3 transition-colors ${
                        scenarioValidation.fieldErrors[input.key]
                          ? "border-destructive/60 bg-destructive/10"
                          : "border-border/70"
                      }`}
                    >
                      <span className="flex items-center justify-between gap-3 text-xs text-muted-foreground">
                        <span>{input.label}</span>
                        <span className="font-mono text-primary">{input.unit || "coef."}</span>
                      </span>
                      <Input
                        type="number"
                        step={input.step || 0.01}
                        value={input.value}
                        onChange={(event) => updateScenarioInput(input.key, event.target.value)}
                        aria-invalid={Boolean(scenarioValidation.fieldErrors[input.key])}
                        className={`mt-2 h-10 bg-background/65 font-mono ${
                          scenarioValidation.fieldErrors[input.key]
                            ? "border-destructive/70 focus-visible:ring-destructive/40"
                            : "border-border/70"
                        }`}
                      />
                      <span className="mt-2 block text-[11px] leading-relaxed text-muted-foreground">
                        Limite: {formatScenarioValue(input.min ?? 0)} a {formatScenarioValue(input.max ?? 999999)} {input.unit || "coef."}
                        {input.useCase ? ` | Uso: ${input.useCase}` : ""}
                      </span>
                      {scenarioValidation.fieldErrors[input.key] ? (
                        <span className="mt-2 block text-xs leading-relaxed text-destructive">
                          {scenarioValidation.fieldErrors[input.key]}
                        </span>
                      ) : null}
                    </label>
                  ))}
                </div>
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
                  {!scenarioValidation.isValid ? (
                    <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-4">
                      <p className="flex items-center gap-2 text-sm font-semibold text-destructive">
                        <AlertTriangle className="h-4 w-4" />
                        PDF bloqueado por entrada fora da faixa
                      </p>
                      <div className="mt-3 space-y-2">
                        {scenarioValidation.errors.slice(0, 5).map((error) => (
                          <p key={error} className="text-sm leading-relaxed text-muted-foreground">
                            {error}
                          </p>
                        ))}
                      </div>
                    </div>
                  ) : null}
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Button
                      type="button"
                      onClick={exportPdf}
                      disabled={!scenarioValidation.isValid}
                      className="bg-primary text-primary-foreground hover:bg-highlight-glow disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <FileDown className="mr-2 h-4 w-4" />
                      Gerar PDF com estes numeros
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setActiveTab("relatorio")} className="border-border bg-muted/25">
                      Conferir relatorio na tela
                    </Button>
                  </div>
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
          <ReportCover kpis={kpis} selectedEquipment={selectedEquipment} scenario={scenarioResult} analytics={reportAnalytics} />
          <ReportExecutiveGrid analytics={reportAnalytics} />
          <ReleaseMatrix analytics={reportAnalytics} selectedEquipmentId={selectedEquipment.id} />
          <PackageSummary analytics={reportAnalytics} />
          <SourceAuditPanel analytics={reportAnalytics} />
          <ExportActionPanel
            onPdf={exportPdf}
            onCopy={copyReport}
            onTxt={exportReport}
            onCsv={exportCsv}
            onPrint={() => window.print()}
          />
          <Card className="gradient-industrial glow-card border-border/60">
            <CardHeader className="flex flex-col gap-3 border-b border-border/70 p-5 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Saida tecnica</p>
                <CardTitle className="mt-1 text-xl text-foreground">
                  {showFullReport ? "Apendice completo de materiais" : `Lista do equipamento ${selectedEquipment.code}`}
                </CardTitle>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline" className="w-fit border-primary/25 bg-primary/10 text-primary">
                  {reportTableItems.length} linhas em exibicao
                </Badge>
                <Button type="button" variant="outline" onClick={() => setShowFullReport((current) => !current)} className="h-9 border-border bg-muted/25">
                  {showFullReport ? "Ver equipamento ativo" : "Ver apendice completo"}
                </Button>
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
                    {reportTableItems.map((item) => {
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
      <p className="break-words font-mono text-sm font-semibold text-foreground">{value}</p>
      <p className="mt-1 text-[11px] text-muted-foreground">{label}</p>
    </div>
  );
}

function WorkflowStepCard({
  index,
  title,
  text,
  active,
  onClick,
}: {
  index: string;
  title: string;
  text: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group rounded-lg border p-3 text-left transition-all duration-200 hover:-translate-y-0.5 ${
        active ? "border-primary/45 bg-primary/15" : "border-border/70 bg-background/30 hover:border-primary/35 hover:bg-muted/20"
      }`}
    >
      <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/15 font-mono text-xs font-semibold text-primary">
        {index}
      </span>
      <p className="mt-3 text-sm font-semibold text-foreground">{title}</p>
      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{text}</p>
    </button>
  );
}

function ExportActionPanel({
  onPdf,
  onCopy,
  onTxt,
  onCsv,
  onPrint,
}: {
  onPdf: () => void;
  onCopy: () => void;
  onTxt: () => void;
  onCsv: () => void;
  onPrint: () => void;
}) {
  return (
    <Card className="gradient-industrial glow-card border-border/60 print:hidden">
      <CardContent className="flex flex-col gap-3 p-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm font-semibold text-foreground">Saidas do relatorio</p>
          <p className="mt-1 text-sm text-muted-foreground">Use o PDF como entrega principal; TXT, CSV e impressao ficam como apoio tecnico.</p>
        </div>
        <div className="grid gap-2 sm:grid-cols-2 lg:flex lg:flex-wrap lg:justify-end">
          <Button type="button" onClick={onPdf} className="bg-primary text-primary-foreground hover:bg-highlight-glow">
            <FileDown className="mr-2 h-4 w-4" />
            Gerar PDF
          </Button>
          <Button type="button" variant="outline" onClick={onCopy} className="border-border bg-muted/25">
            <ClipboardCopy className="mr-2 h-4 w-4" />
            Copiar
          </Button>
          <Button type="button" variant="outline" onClick={onTxt} className="border-border bg-muted/25">
            <Download className="mr-2 h-4 w-4" />
            TXT
          </Button>
          <Button type="button" variant="outline" onClick={onCsv} className="border-border bg-muted/25">
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            CSV
          </Button>
          <Button type="button" variant="outline" onClick={onPrint} className="border-border bg-muted/25">
            <Printer className="mr-2 h-4 w-4" />
            Imprimir
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function ReportCover({
  kpis,
  selectedEquipment,
  scenario,
  analytics,
}: {
  kpis: ReturnType<typeof getMistura90Kpis>;
  selectedEquipment: Mistura90Equipment;
  scenario: Mistura90ScenarioResult;
  analytics: Mistura90ReportAnalytics;
}) {
  return (
    <Card className="gradient-industrial glow-card border-primary/20">
      <CardContent className="grid gap-5 p-5 lg:grid-cols-[1fr_0.82fr]">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Relatorio tecnico de saida</p>
          <h2 className="mt-2 text-2xl font-semibold text-foreground">Dossie de liberacao do Projeto Mistura 90</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Entrega consolidada a partir da aba RESUMO e das memorias de calculo do Excel. O pacote separa compra,
            fabricacao, montagem, pendencias de desenho e criterios de qualidade para a rotina da i9TMG.
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
            <MiniStat label="Equipamento ativo" value={selectedEquipment.code} />
            <MiniStat label="Cenario" value={scenario.title.replace("Dimensionamento rapido de ", "")} />
            <MiniStat label="Score geral" value={`${analytics.releaseScore}%`} />
            <MiniStat label="Equipamentos" value={kpis.equipments} />
            <MiniStat label="Itens" value={kpis.reportItems} />
          </div>
        </div>
        <div className="rounded-lg border border-border/70 bg-background/35 p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-semibold text-foreground">Status de liberacao</p>
            <Badge variant="outline" className={getReleaseBadgeClass(analytics.releaseScore, analytics.pendingItems)}>
              {analytics.statusLabel}
            </Badge>
          </div>
          <div className="mt-3 space-y-3">
            {[
              "Comprar somente itens com quantidade e descricao tecnica completas.",
              "Liberar fabricacao apos validar eixos, tambores, gaiolas, tubos e cavaletes.",
              "Separar pendencias por desenho, suprimentos e engenharia mecanica.",
              "Anexar o PDF ao pacote tecnico de compra, fabricacao, montagem e qualidade.",
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

function ReportExecutiveGrid({ analytics }: { analytics: Mistura90ReportAnalytics }) {
  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <ExecutiveMetric title="Score geral" value={`${analytics.releaseScore}%`} detail={analytics.statusLabel} tone="success" />
      <ExecutiveMetric title="Pendencias" value={analytics.pendingItems} detail="itens exigindo acao antes da liberacao" tone="warning" />
      <ExecutiveMetric title="Itens criticos" value={analytics.highCriticalityItems} detail="acionamentos, eixos, mancais e tambores" tone="primary" />
      <ExecutiveMetric title="Quantidade total" value={formatNumber(analytics.totalQuantity)} detail="soma das quantidades do RESUMO" tone="info" />
    </section>
  );
}

function ExecutiveMetric({ title, value, detail, tone }: { title: string; value: string | number; detail: string; tone: "primary" | "success" | "warning" | "info" }) {
  const toneClass = {
    primary: "text-primary",
    success: "text-success",
    warning: "text-warning",
    info: "text-info",
  }[tone];

  return (
    <Card className="gradient-industrial glow-card border-border/60">
      <CardContent className="p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">{title}</p>
        <p className={`mt-3 font-mono text-3xl font-semibold ${toneClass}`}>{value}</p>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{detail}</p>
      </CardContent>
    </Card>
  );
}

function ReleaseMatrix({ analytics, selectedEquipmentId }: { analytics: Mistura90ReportAnalytics; selectedEquipmentId: string }) {
  return (
    <Card className="gradient-industrial glow-card border-border/60">
      <CardHeader className="border-b border-border/70 p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Matriz de liberacao</p>
        <CardTitle className="mt-1 text-xl text-foreground">Equipamentos, pendencias e score tecnico</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3 p-5 md:grid-cols-2 xl:grid-cols-3">
        {analytics.equipmentReleases.map((release) => (
          <div
            key={release.equipment.id}
            className={`rounded-lg border p-4 transition-all duration-200 hover:-translate-y-0.5 ${
              release.equipment.id === selectedEquipmentId
                ? "border-primary/45 bg-primary/10"
                : "border-border/70 bg-background/35 hover:border-primary/30"
            }`}
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-mono text-sm font-semibold text-primary">{release.equipment.code}</p>
                <p className="mt-1 text-sm font-semibold text-foreground">{release.equipment.name}</p>
              </div>
              <Badge variant="outline" className={getReleaseBadgeClass(release.score, release.pendingCount)}>
                {release.statusLabel}
              </Badge>
            </div>
            <div className="mt-4 grid grid-cols-4 gap-2 text-center">
              <MiniStat label="Score" value={`${release.score}%`} />
              <MiniStat label="Itens" value={release.itemCount} />
              <MiniStat label="Qtd." value={formatNumber(release.totalQuantity)} />
              <MiniStat label="Pend." value={release.pendingCount} />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function PackageSummary({ analytics }: { analytics: Mistura90ReportAnalytics }) {
  return (
    <section className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
      <Card className="gradient-industrial glow-card border-border/60">
        <CardHeader className="border-b border-border/70 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Pacotes de entrega</p>
          <CardTitle className="mt-1 text-xl text-foreground">Compra, fabricacao, montagem e qualidade</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 p-5 sm:grid-cols-2">
          {analytics.deliverables.map(([name, description]) => (
            <div key={name} className="rounded-lg border border-border/70 bg-background/35 p-4">
              <p className="font-semibold text-foreground">{name}</p>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="gradient-industrial glow-card border-border/60">
        <CardHeader className="border-b border-border/70 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Pendencias acionaveis</p>
          <CardTitle className="mt-1 text-xl text-foreground">Proximas acoes antes da liberacao</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 p-5">
          {analytics.actionItems.slice(0, 6).map((action) => (
            <div key={`${action.equipmentCode}-${action.item}-${action.action}`} className="rounded-lg border border-warning/25 bg-warning/10 p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-mono text-sm font-semibold text-warning">{action.equipmentCode} | {action.item}</p>
                <Badge variant="outline" className="border-warning/25 bg-warning/10 text-warning">
                  {action.owner}
                </Badge>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{action.action}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </section>
  );
}

function SourceAuditPanel({ analytics }: { analytics: Mistura90ReportAnalytics }) {
  return (
    <section className="grid gap-4 xl:grid-cols-[0.88fr_1.12fr]">
      <Card className="gradient-industrial glow-card border-border/60">
        <CardHeader className="border-b border-border/70 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Auditoria da fonte</p>
          <CardTitle className="mt-1 text-xl text-foreground">O que foi lido da planilha protegida</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 p-5 sm:grid-cols-2">
          {analytics.sourceAudit.map(([label, value]) => (
            <div key={label} className="rounded-lg border border-border/70 bg-background/35 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">{label}</p>
              <p className="mt-2 break-words font-mono text-sm font-semibold text-foreground">{value}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="gradient-industrial glow-card border-border/60">
        <CardHeader className="border-b border-border/70 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Resumo por pacote</p>
          <CardTitle className="mt-1 text-xl text-foreground">Categorias que viram compra, fabricacao e montagem</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 p-5 md:grid-cols-2">
          {analytics.categorySummaries.map((summary) => (
            <div key={summary.category} className="rounded-lg border border-border/70 bg-background/35 p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/35 hover:bg-muted/20">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-semibold text-foreground">{summary.category}</p>
                {summary.pending > 0 ? (
                  <Badge variant="outline" className="border-warning/25 bg-warning/10 text-warning">
                    {summary.pending} pend.
                  </Badge>
                ) : (
                  <Badge variant="outline" className="border-success/25 bg-success/10 text-success">
                    OK
                  </Badge>
                )}
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <MiniStat label="Itens" value={summary.itemCount} />
                <MiniStat label="Qtd. total" value={formatNumber(summary.quantity)} />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </section>
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

function buildReportText(
  selectedEquipment: Mistura90Equipment,
  scenario: Mistura90ScenarioResult,
  analytics: Mistura90ReportAnalytics,
) {
  const kpis = getMistura90Kpis();
  const lines = [
    "i9TMG - DOSSIE TECNICO EQUIPAMENTOS MISTURA 90",
    `Fonte: ${mistura90Workbook.fileName}`,
    `Data de emissao: ${new Date().toLocaleDateString("pt-BR")}`,
    `Equipamento ativo: ${selectedEquipment.code} - ${selectedEquipment.name}`,
    `Cenario calculado: ${scenario.title}`,
    "",
    "1. RESUMO EXECUTIVO",
    `- Status de liberacao: ${analytics.statusLabel}`,
    `- Score geral: ${analytics.releaseScore}%`,
    `- Pendencias tecnicas: ${analytics.pendingItems}`,
    `- Itens de criticidade alta: ${analytics.highCriticalityItems}`,
    "",
    "2. INDICADORES GERAIS",
    `- Equipamentos mapeados: ${kpis.equipments}`,
    `- Itens no resumo: ${kpis.reportItems}`,
    `- Quantidade total acumulada: ${formatNumber(kpis.totalQuantity)}`,
    `- Acionamentos: ${kpis.driveCount}`,
    `- Correias: ${kpis.beltMeters}`,
    `- Canecas: ${kpis.bucketCount}`,
    `- Roletes: ${kpis.rollerCount}`,
    `- Pendencias tecnicas: ${kpis.pendingItems}`,
    "",
    "3. AUDITORIA DA FONTE",
    ...analytics.sourceAudit.map(([label, value]) => `- ${label}: ${value}`),
    "",
    "4. PACOTES DE ENTREGA",
    ...analytics.deliverables.map(([name, description]) => `- ${name}: ${description}`),
    "",
    "5. ESCOPO POR EQUIPAMENTO",
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
    "6. PENDENCIAS DE ENGENHARIA",
    ...analytics.actionItems.map(
      (item) => `- ${item.equipmentCode} | ${item.item} | ${item.owner}: ${item.action}`,
    ),
    "",
    "7. PARECER",
    "A memoria da planilha foi consolidada em modulo tecnico navegavel. Antes de emitir pedido de compra ou liberacao de fabricacao, revisar todos os itens classificados como Pendente e anexar desenho final quando solicitado.",
  );

  return lines.join("\n");
}
