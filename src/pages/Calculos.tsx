import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Flame, Search, SlidersHorizontal, Star } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { CalculationPanel } from "@/components/CalculationPanel";
import { FormulaCard } from "@/components/FormulaCard";
import { StepByStepViewer } from "@/components/StepByStepViewer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/contexts/AuthContext";
import { useIndustrialWorkspace } from "@/contexts/IndustrialWorkspaceContext";
import { evaluateFormula } from "@/lib/formula-engine";
import type { Formula, SectorId } from "@/lib/industrial-data";

export default function Calculos() {
  const { formulas, sectors, favoriteIds, isFavorite, toggleFavorite, recordCalculation } = useIndustrialWorkspace();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState("");
  const [selectedSector, setSelectedSector] = useState<SectorId | "todos">("todos");
  const [selectedFormulaId, setSelectedFormulaId] = useState(formulas[0]?.id || "");
  const [values, setValues] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!formulas.some((formula) => formula.id === selectedFormulaId)) {
      setSelectedFormulaId(formulas[0]?.id || "");
    }
  }, [formulas, selectedFormulaId]);

  useEffect(() => {
    const query = searchParams.get("q");
    if (query) setSearch(query);
  }, [searchParams]);

  const selectedFormula = formulas.find((formula) => formula.id === selectedFormulaId) || formulas[0];

  const filteredFormulas = useMemo(() => {
    const term = search.toLowerCase();
    return formulas.filter((formula) => formula.status !== "arquivada").filter((formula) => {
      const searchable = [
        formula.name,
        formula.sector,
        formula.expression,
        formula.description,
        formula.simpleExplanation,
        formula.tags.join(" "),
        formula.variables.map((variable) => `${variable.name} ${variable.label}`).join(" "),
      ]
        .join(" ")
        .toLowerCase();
      const matchSearch = searchable.includes(term);
      const matchSector = selectedSector === "todos" || formula.sectorId === selectedSector;
      return matchSearch && matchSector;
    }).sort((a, b) => statusRank[b.status] - statusRank[a.status] || b.usageCount - a.usageCount);
  }, [formulas, search, selectedSector]);

  const favoriteFormulas = useMemo(
    () =>
      favoriteIds
        .map((id) => formulas.find((formula) => formula.id === id))
        .filter((formula): formula is Formula => Boolean(formula))
        .slice(0, 6),
    [favoriteIds, formulas],
  );

  const mostUsed = useMemo(
    () => [...formulas].sort((a, b) => b.usageCount - a.usageCount).slice(0, 6),
    [formulas],
  );

  const selectFormula = (formulaId: string) => {
    setSelectedFormulaId(formulaId);
    setValues({});
    setErrors({});
    setResult(null);
  };

  const handleCalculate = () => {
    if (!selectedFormula) return;
    const nextErrors: Record<string, string> = {};

    selectedFormula.variables.forEach((variable) => {
      const value = values[variable.name];
      if (!value) {
        nextErrors[variable.name] = "Campo obrigatorio";
      } else if (Number.isNaN(Number.parseFloat(value))) {
        nextErrors[variable.name] = "Valor invalido";
      }
    });

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setLoading(true);
    window.setTimeout(() => {
      const calculated = evaluateFormula(selectedFormula, values);
      const formatted = Number.isFinite(calculated) ? calculated.toFixed(4) : "0.0000";
      setResult(formatted);
      recordCalculation(selectedFormula, values, formatted, user?.name);
      setLoading(false);
    }, 420);
  };

  const handleReset = () => {
    setValues({});
    setErrors({});
    setResult(null);
  };

  const fillExample = () => {
    if (!selectedFormula) return;
    setValues(
      Object.fromEntries(selectedFormula.variables.map((variable) => [variable.name, variable.placeholder || "1"])),
    );
    setErrors({});
    setResult(null);
  };

  if (!selectedFormula) {
    return null;
  }

  return (
    <div className="mx-auto flex w-full max-w-[1680px] flex-col gap-5">
      <section className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <Badge className="border-primary/25 bg-primary/15 text-primary hover:bg-primary/15">Symbolab industrial</Badge>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground">Calculos tecnicos</h1>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
            Escolha uma formula da biblioteca, use exemplos prontos, marque favoritos e acompanhe substituicao numerica
            passo a passo.
          </p>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center">
          <Metric label="Formulas" value={formulas.length} />
          <Metric label="Setores" value={sectors.length} />
          <Metric label="Favoritos" value={favoriteIds.length} />
        </div>
      </section>

      <section className="rounded-lg border border-primary/25 bg-primary/10 p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Destaque tecnico</p>
            <h2 className="mt-1 text-lg font-semibold text-foreground">Elevadores e Mistura 90</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Calculos de capacidade, correias, tensoes, eixos, potencia, redutores, acoplamentos e rolamentos.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={() => setSelectedSector("elevadores_mistura_90")}
            className="border-primary/30 bg-background/30 text-foreground hover:bg-primary hover:text-primary-foreground"
          >
            Ver formulas do PDF
          </Button>
        </div>
      </section>

      <section className="grid min-h-[760px] gap-4 xl:grid-cols-[350px_minmax(420px,1fr)_420px]">
        <Card className="gradient-industrial glow-card min-h-[560px] border-border/60">
          <CardHeader className="border-b border-border/70 p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Biblioteca</p>
                <CardTitle className="mt-1 text-lg text-foreground">Formulas inteligentes</CardTitle>
              </div>
              <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="relative mt-4">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar formula, tag, variavel ou setor"
                className="border-border bg-muted/25 pl-9 text-foreground focus-visible:ring-primary/40"
              />
            </div>
            <div className="mt-3 flex max-h-32 flex-wrap gap-2 overflow-auto pr-1">
              <FilterButton active={selectedSector === "todos"} onClick={() => setSelectedSector("todos")}>
                Todos
              </FilterButton>
              {sectors.map((sector) => (
                <FilterButton key={sector.id} active={selectedSector === sector.id} onClick={() => setSelectedSector(sector.id)}>
                  {sector.name}
                </FilterButton>
              ))}
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[610px]">
              <div className="space-y-3 p-4">
                {favoriteFormulas.length > 0 && (
                  <div className="rounded-lg border border-primary/25 bg-primary/10 p-3">
                    <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-primary">
                      <Star className="h-4 w-4 fill-primary" />
                      Favoritos
                    </div>
                    <div className="grid gap-2">
                      {favoriteFormulas.map((formula) => (
                        <Button
                          key={formula.id}
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => selectFormula(formula.id)}
                          className="justify-start border-border bg-background/30 text-left text-foreground hover:bg-muted/40"
                        >
                          <span className="truncate">{formula.name}</span>
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="rounded-lg border border-border/70 bg-muted/15 p-3">
                  <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                    <Flame className="h-4 w-4 text-primary" />
                    Mais usadas
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {mostUsed.map((formula) => (
                      <button
                        key={formula.id}
                        type="button"
                        onClick={() => selectFormula(formula.id)}
                        className="rounded-md border border-border/70 bg-background/30 px-2 py-1 text-xs text-muted-foreground transition-colors hover:border-primary/35 hover:text-primary"
                      >
                        {formula.name}
                      </button>
                    ))}
                  </div>
                </div>

                {filteredFormulas.map((formula) => (
                  <FormulaCard
                    key={formula.id}
                    formula={formula}
                    selected={formula.id === selectedFormula.id}
                    favorite={isFavorite(formula.id)}
                    compact
                    onClick={() => selectFormula(formula.id)}
                  />
                ))}
                {filteredFormulas.length === 0 && (
                  <div className="rounded-lg border border-border/70 bg-muted/20 p-5 text-center text-sm text-muted-foreground">
                    Nenhuma formula encontrada.
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        <div className="flex min-h-0 flex-col gap-4">
          <CalculationPanel
            formula={selectedFormula}
            values={values}
            errors={errors}
            loading={loading}
            favorite={isFavorite(selectedFormula.id)}
            onToggleFavorite={() => toggleFavorite(selectedFormula.id)}
            onUseExample={fillExample}
            onChange={(name, value) => {
              setValues((current) => ({ ...current, [name]: value }));
              setErrors((current) => ({ ...current, [name]: "" }));
              setResult(null);
            }}
            onCalculate={handleCalculate}
            onReset={handleReset}
          />

          {selectedFormula.status !== "validada" && selectedFormula.status !== "aprovada" && (
            <div className="rounded-lg border border-warning/25 bg-warning/10 p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="mt-0.5 h-4 w-4 text-warning" />
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Esta formula esta com status {selectedFormula.status.replace("_", " ")}. Valide criterios internos antes de usar em campo.
                </p>
              </div>
            </div>
          )}
        </div>

        <StepByStepViewer formula={selectedFormula} values={values} result={result} />
      </section>
    </div>
  );
}

const statusRank = {
  aprovada: 5,
  validada: 4,
  em_revisao: 3,
  rascunho: 2,
  arquivada: 1,
};

function FilterButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-md border px-2.5 py-1.5 text-xs transition-all ${
        active
          ? "border-primary/40 bg-primary/15 text-primary"
          : "border-border/70 bg-muted/20 text-muted-foreground hover:border-primary/30 hover:text-foreground"
      }`}
    >
      {children}
    </button>
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
