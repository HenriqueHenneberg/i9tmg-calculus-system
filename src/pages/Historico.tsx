import { useMemo, useState } from "react";
import { CalendarDays, Eye, Filter, RotateCcw, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useIndustrialWorkspace } from "@/contexts/IndustrialWorkspaceContext";
import type { CalculationRecord } from "@/lib/industrial-data";

const statusClasses: Record<CalculationRecord["status"], string> = {
  Validado: "border-success/25 bg-success/10 text-success",
  Rascunho: "border-warning/25 bg-warning/10 text-warning",
  Revisao: "border-primary/25 bg-primary/10 text-primary",
};

const formulaStatusLabels = {
  rascunho: "Rascunho",
  em_revisao: "Em revisao",
  validada: "Validada",
  aprovada: "Aprovada",
  arquivada: "Arquivada",
};

export default function Historico() {
  const navigate = useNavigate();
  const { history: calculationsHistory, sectors } = useIndustrialWorkspace();
  const [search, setSearch] = useState("");
  const [sector, setSector] = useState("todos");
  const [date, setDate] = useState("");
  const [highlighted, setHighlighted] = useState<CalculationRecord | null>(calculationsHistory[0]);

  const filteredItems = useMemo(() => {
    return calculationsHistory.filter((item) => {
      const term = search.toLowerCase();
      const matchSearch =
        item.formula.toLowerCase().includes(term) ||
        item.operator.toLowerCase().includes(term) ||
        Object.entries(item.values)
          .map(([key, value]) => `${key}=${value}`)
          .join(" ")
          .toLowerCase()
          .includes(term);
      const matchSector = sector === "todos" || item.sectorId === sector;
      const matchDate = !date || item.isoDate === date;
      return matchSearch && matchSector && matchDate;
    });
  }, [calculationsHistory, date, search, sector]);

  const columns: DataTableColumn<CalculationRecord>[] = [
    {
      key: "formula",
      header: "Calculo",
      cell: (row) => (
        <div>
          <p className="font-medium text-foreground">{row.formula}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            ID #{row.id} - Formula {formulaStatusLabels[row.formulaStatus]}
          </p>
        </div>
      ),
    },
    {
      key: "sector",
      header: "Setor",
      cell: (row) => (
        <Badge variant="outline" className="border-primary/25 bg-primary/10 text-primary">
          {row.sector}
        </Badge>
      ),
    },
    {
      key: "values",
      header: "Entradas",
      cell: (row) => (
        <div className="flex max-w-[340px] flex-wrap gap-1.5">
          {Object.entries(row.values).map(([key, value]) => (
            <span key={key} className="rounded-md border border-border bg-muted/25 px-2 py-1 font-mono text-xs text-muted-foreground">
              {key}={value}
            </span>
          ))}
        </div>
      ),
    },
    {
      key: "result",
      header: "Resultado",
      className: "text-right",
      cell: (row) => (
        <div>
          <p className="font-mono font-semibold text-foreground">
            {row.result} {row.unit}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">{row.date}</p>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      cell: (row) => (
        <Badge variant="outline" className={statusClasses[row.status]}>
          {row.status}
        </Badge>
      ),
    },
    {
      key: "actions",
      header: "Acoes",
      className: "text-right",
      cell: (row) => (
        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setHighlighted(row)}
            className="h-8 w-8 text-muted-foreground hover:bg-primary/10 hover:text-primary"
            title="Visualizar"
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => rerunCalculation(row)}
            className="h-8 w-8 text-muted-foreground hover:bg-muted/50 hover:text-foreground"
            title="Reexecutar no console"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  const clearFilters = () => {
    setSearch("");
    setSector("todos");
    setDate("");
  };

  const rerunCalculation = (row: CalculationRecord) => {
    navigate(`/calculos?formula=${encodeURIComponent(row.formulaId)}&values=${encodeURIComponent(JSON.stringify(row.values))}`);
  };

  return (
    <div className="mx-auto flex w-full max-w-[1500px] flex-col gap-6">
      <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <Badge className="border-primary/25 bg-primary/15 text-primary hover:bg-primary/15">Rastreabilidade</Badge>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground">Historico</h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Consulte, visualize e reexecute calculos tecnicos ja executados pela operacao.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-3 text-center sm:grid-cols-3">
          <Metric label="Registros" value={filteredItems.length} />
          <Metric label="Validados" value={filteredItems.filter((item) => item.status === "Validado").length} />
          <Metric label="Revisao" value={filteredItems.filter((item) => item.status !== "Validado").length} />
        </div>
      </section>

      <Card className="gradient-industrial glow-card border-border/60">
        <CardHeader className="border-b border-border/70 p-5">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Filtros</p>
              <CardTitle className="mt-1 text-lg text-foreground">Pesquisa tecnica</CardTitle>
            </div>
            <div className="grid gap-3 md:grid-cols-[minmax(220px,1fr)_190px_180px_auto]">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Buscar calculo, operador ou entrada"
                  className="border-border bg-muted/25 pl-9 text-foreground focus-visible:ring-primary/40"
                />
              </div>
              <Select value={sector} onValueChange={setSector}>
                <SelectTrigger className="border-border bg-muted/25 text-foreground">
                  <Filter className="mr-2 h-4 w-4 text-muted-foreground" />
                  <SelectValue placeholder="Setor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os setores</SelectItem>
                  {sectors.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="relative">
                <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={date}
                  onChange={(event) => setDate(event.target.value)}
                  type="date"
                  className="border-border bg-muted/25 pl-9 text-foreground focus-visible:ring-primary/40"
                />
              </div>
              <Button type="button" variant="outline" onClick={clearFilters} className="border-border bg-muted/25 text-foreground">
                <RotateCcw className="h-4 w-4" />
                Limpar
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-5">
          <DataTable data={filteredItems} columns={columns} getRowKey={(row) => row.id} />
        </CardContent>
      </Card>

      {highlighted && (
        <Card className="gradient-industrial glow-card border-primary/25">
          <CardHeader className="border-b border-border/70 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Visualizacao rapida</p>
            <CardTitle className="mt-1 text-lg text-foreground">{highlighted.formula}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 p-5 md:grid-cols-[1fr_240px]">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {Object.entries(highlighted.values).map(([key, value]) => (
                <div key={key} className="rounded-lg border border-border/70 bg-muted/20 p-3">
                  <p className="text-xs text-muted-foreground">{key}</p>
                  <p className="mt-1 font-mono text-lg font-semibold text-foreground">{value}</p>
                </div>
              ))}
            </div>
            <div className="rounded-lg border border-primary/25 bg-primary/10 p-4 text-right">
              <p className="text-xs uppercase tracking-[0.16em] text-primary">Resultado</p>
              <p className="mt-2 font-mono text-3xl font-semibold text-primary">
                {highlighted.result} {highlighted.unit}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">{highlighted.date}</p>
              <p className="mt-1 text-xs text-muted-foreground">Formula {formulaStatusLabels[highlighted.formulaStatus]}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-border/70 bg-card/60 px-4 py-3">
      <p className="font-mono text-xl font-semibold text-foreground">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}
