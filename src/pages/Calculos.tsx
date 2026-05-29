import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  BookOpenCheck,
  Brain,
  Calculator,
  CheckCircle2,
  ClipboardCheck,
  Factory,
  FileDown,
  PanelTopOpen,
  Search,
  ShieldAlert,
  SlidersHorizontal,
  Star,
  type LucideIcon,
} from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { CalculationPanel } from "@/components/CalculationPanel";
import { FormulaCard } from "@/components/FormulaCard";
import { Mistura90Guide } from "@/components/Mistura90Guide";
import { StepByStepViewer } from "@/components/StepByStepViewer";
import { TechnicalAssistant } from "@/components/TechnicalAssistant";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/contexts/AuthContext";
import { useIndustrialWorkspace } from "@/contexts/IndustrialWorkspaceContext";
import { evaluateFormula } from "@/lib/formula-engine";
import { rankFormulas } from "@/lib/industrial-assistant";
import type { Formula, Sector, SectorId } from "@/lib/industrial-data";
import { getSectorBackgroundImage, getSectorVisual } from "@/lib/sector-visuals";

export default function Calculos() {
  const { formulas, sectors, favoriteIds, isFavorite, toggleFavorite, recordCalculation, preferences } = useIndustrialWorkspace();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState("");
  const [selectedSector, setSelectedSector] = useState<SectorId>("eletrica");
  const defaultFormulaId = getDefaultFormulaId(formulas);
  const [selectedFormulaId, setSelectedFormulaId] = useState(defaultFormulaId);
  const [values, setValues] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [result, setResult] = useState<string | null>(null);
  const [calculationError, setCalculationError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!formulas.some((formula) => formula.id === selectedFormulaId)) {
      setSelectedFormulaId(defaultFormulaId);
    }
  }, [defaultFormulaId, formulas, selectedFormulaId]);

  useEffect(() => {
    const query = searchParams.get("q");
    if (query) setSearch(query);
  }, [searchParams]);

  useEffect(() => {
    const formulaId = searchParams.get("formula");
    const sectorId = searchParams.get("sector") as SectorId | null;
    const encodedValues = searchParams.get("values");

    const formulaFromUrl = formulaId ? formulas.find((formula) => formula.id === formulaId) : undefined;
    if (formulaFromUrl) {
      setSelectedFormulaId(formulaFromUrl.id);
      if (!sectorId) setSelectedSector(formulaFromUrl.sectorId);
    }

    if (sectorId) {
      setSelectedSector(sectorId);
      if (!formulaId) {
        const firstSectorFormula = getFirstFormulaForSector(formulas, sectorId);
        if (firstSectorFormula) setSelectedFormulaId(firstSectorFormula.id);
      }
    }

    if (encodedValues) {
      try {
        const parsed = JSON.parse(encodedValues) as Record<string, string>;
        setValues(parsed);
        setErrors({});
        setResult(null);
        setCalculationError(null);
      } catch {
        toast.error("Nao foi possivel recuperar os valores do historico.");
      }
    }
  }, [formulas, searchParams]);

  const selectedFormula =
    formulas.find((formula) => formula.id === selectedFormulaId) ||
    formulas.find((formula) => formula.id === defaultFormulaId) ||
    formulas[0];

  const filteredFormulas = useMemo(() => {
    const term = search.trim().toLowerCase();
    const activeFormulas = formulas.filter((formula) => formula.status !== "arquivada" && formula.sectorId === selectedSector);

    if (!term) {
      return [...activeFormulas].sort((a, b) => statusRank[b.status] - statusRank[a.status] || b.usageCount - a.usageCount);
    }

    const ranked = rankFormulas(search, activeFormulas);
    if (ranked.length > 0) {
      return ranked.map((item) => item.formula);
    }

    const terms = term.split(/\s+/).filter(Boolean);
    return activeFormulas
      .filter((formula) => {
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
        return terms.some((searchTerm) => searchable.includes(searchTerm));
      })
      .sort((a, b) => statusRank[b.status] - statusRank[a.status] || b.usageCount - a.usageCount);
  }, [formulas, search, selectedSector]);

  useEffect(() => {
    if (search.trim().length < 3 || filteredFormulas.length === 0) return;
    const firstMatch = filteredFormulas[0];
    if (firstMatch.id === selectedFormulaId) return;

    setSelectedFormulaId(firstMatch.id);
    setValues({});
    setErrors({});
    setResult(null);
    setCalculationError(null);
  }, [filteredFormulas, search, selectedFormulaId]);

  const favoriteFormulas = useMemo(
    () =>
      favoriteIds
        .map((id) => formulas.find((formula) => formula.id === id))
        .filter((formula): formula is Formula => Boolean(formula))
        .slice(0, 6),
    [favoriteIds, formulas],
  );

  const mostUsed = useMemo(
    () => [...formulas].filter((formula) => formula.status !== "arquivada").sort((a, b) => b.usageCount - a.usageCount).slice(0, 8),
    [formulas],
  );
  const auditItems = useMemo(
    () => buildAuditItems(selectedFormula, values, errors, result),
    [errors, result, selectedFormula, values],
  );

  const selectedSectorName = sectors.find((sector) => sector.id === selectedSector)?.name || "Setor";
  const visibleFormulas = filteredFormulas.slice(0, 90);

  const selectFormula = (formulaId: string) => {
    setSelectedFormulaId(formulaId);
    setValues({});
    setErrors({});
    setResult(null);
    setCalculationError(null);
  };

  const selectSector = (sectorId: SectorId) => {
    setSelectedSector(sectorId);

    const firstSectorFormula = getFirstFormulaForSector(formulas, sectorId);
    if (firstSectorFormula && firstSectorFormula.id !== selectedFormulaId) {
      selectFormula(firstSectorFormula.id);
    }
  };

  const handleCalculate = () => {
    if (!selectedFormula) return;
    const nextErrors: Record<string, string> = {};
    const normalizedValues: Record<string, string> = {};

    selectedFormula.variables.forEach((variable) => {
      const value = values[variable.name];
      const parsed = parseTechnicalNumber(value);
      if (!value || value.trim() === "") {
        nextErrors[variable.name] = "Campo obrigatorio";
      } else if (!Number.isFinite(parsed)) {
        nextErrors[variable.name] = "Valor invalido";
      } else if (Math.abs(parsed) > 1_000_000_000) {
        nextErrors[variable.name] = "Valor fora da faixa tecnica";
      } else if (parsed === 0 && isLikelyDenominator(selectedFormula.expression, variable.name)) {
        nextErrors[variable.name] = "Nao pode ser zero nesta formula";
      } else {
        normalizedValues[variable.name] = String(parsed);
      }
    });

    setErrors(nextErrors);
    setCalculationError(null);
    if (Object.keys(nextErrors).length > 0) return;

    setLoading(true);
    window.setTimeout(() => {
      try {
        const calculated = evaluateFormula(selectedFormula, normalizedValues);
        if (!Number.isFinite(calculated)) {
          throw new Error("Resultado invalido. Verifique divisao por zero, valores negativos em raiz ou dados incoerentes.");
        }

        const formatted = calculated.toFixed(preferences.precision);
        setValues((current) => ({ ...current, ...normalizedValues }));
        setResult(formatted);
        recordCalculation(selectedFormula, normalizedValues, formatted, user?.name);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Nao foi possivel concluir o calculo.";
        setResult(null);
        setCalculationError(message);
        toast.error(message);
      }
      setLoading(false);
    }, 420);
  };

  const handleReset = () => {
    setValues({});
    setErrors({});
    setResult(null);
    setCalculationError(null);
  };

  const fillExample = () => {
    if (!selectedFormula) return;
    setValues(
      Object.fromEntries(selectedFormula.variables.map((variable) => [variable.name, variable.placeholder || "1"])),
    );
    setErrors({});
    setResult(null);
    setCalculationError(null);
  };

  const applyDetectedValues = (nextValues: Record<string, string>) => {
    setValues((current) => ({ ...current, ...nextValues }));
    setErrors((current) => {
      const nextErrors = { ...current };
      Object.keys(nextValues).forEach((key) => {
        delete nextErrors[key];
      });
      return nextErrors;
    });
    setResult(null);
    setCalculationError(null);
  };

  if (!selectedFormula) {
    return null;
  }

  return (
    <div className="mx-auto flex w-full max-w-[1740px] flex-col gap-4 overflow-x-hidden">
      <section className="relative overflow-hidden rounded-lg border border-primary/20 bg-card/82 p-3 glow-card sm:p-4">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-[0.16]"
          style={{ backgroundImage: "url('/i9-user-images/wallpaper-i9.png'), url('/i9-wallpaper.svg')" }}
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,hsl(var(--card)/0.97),hsl(var(--card)/0.9)_62%,hsl(var(--primary)/0.1))]" aria-hidden="true" />
        <div className="relative grid gap-3 xl:grid-cols-[220px_minmax(0,1fr)_auto] xl:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Calculos</p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-foreground">Bancada tecnica</h1>
          </div>

          <div className="relative min-w-0">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={`Buscar em ${selectedSectorName}`}
              className="h-11 border-primary/25 bg-background/65 pl-9 text-foreground shadow-inner focus-visible:ring-primary/40"
            />
          </div>

          <div className="flex flex-wrap gap-2 xl:justify-end">
            <Badge variant="outline" className="border-primary/25 bg-primary/10 text-primary">
              {selectedSectorName}
            </Badge>
            <Badge variant="outline" className="border-border bg-background/40 text-muted-foreground">
              {filteredFormulas.length} formulas
            </Badge>
          </div>
        </div>
      </section>

      <SectorRail sectors={sectors} selectedSector={selectedSector} onSelect={selectSector} />

      <section className="grid gap-4 xl:grid-cols-[360px_minmax(0,1fr)]">
        <FormulaFinderPanel
          formulas={visibleFormulas}
          total={filteredFormulas.length}
          selectedFormula={selectedFormula}
          selectedSectorName={selectedSectorName}
          search={search}
          onSearch={setSearch}
          onSelectFormula={selectFormula}
          favoriteFormulas={favoriteFormulas}
          mostUsed={mostUsed}
          isFavorite={isFavorite}
        />

        <div className="min-w-0 space-y-4">
          <CalculationPanel
            formula={selectedFormula}
            values={values}
            errors={errors}
            loading={loading}
            result={result}
            favorite={isFavorite(selectedFormula.id)}
            onToggleFavorite={() => toggleFavorite(selectedFormula.id)}
            onUseExample={fillExample}
            onChange={(name, value) => {
              setValues((current) => ({ ...current, [name]: value }));
              setErrors((current) => ({ ...current, [name]: "" }));
              setResult(null);
              setCalculationError(null);
            }}
            onCalculate={handleCalculate}
            onReset={handleReset}
          />

          {calculationError && (
            <div className="rounded-lg border border-destructive/25 bg-destructive/10 p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="mt-0.5 h-4 w-4 text-destructive" />
                <p className="text-sm leading-relaxed text-muted-foreground">{calculationError}</p>
              </div>
            </div>
          )}

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

          <Accordion type="multiple" defaultValue={["relatorio"]} className="space-y-3">
            <AccordionItem value="relatorio" className="overflow-hidden rounded-lg border border-border/60 bg-card/70 glow-card">
              <AccordionTrigger className="px-4 py-3 text-left hover:no-underline">
                <span className="flex items-center gap-2 font-semibold text-foreground">
                  <BookOpenCheck className="h-4 w-4 text-primary" />
                  Relatorio e explicacao
                </span>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <FormulaTeachingReport formula={selectedFormula} result={result} />
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="auditoria" className="overflow-hidden rounded-lg border border-border/60 bg-card/70 glow-card">
              <AccordionTrigger className="px-4 py-3 text-left hover:no-underline">
                <span className="flex items-center gap-2 font-semibold text-foreground">
                  <Brain className="h-4 w-4 text-primary" />
                  Auditoria e passo a passo
                </span>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <div className="grid gap-4 2xl:grid-cols-2">
                  <AuditPanel items={auditItems} formula={selectedFormula} />
                  <StepByStepViewer formula={selectedFormula} values={values} result={result} />
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      <section className="rounded-lg border border-border/60 bg-card/70 glow-card">
        <Accordion type="single" collapsible>
          <AccordionItem value="assistente" className="border-0">
            <AccordionTrigger className="px-4 py-4 text-left hover:no-underline sm:px-5">
              <span className="flex min-w-0 items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-primary/25 bg-primary/10 text-primary">
                  <PanelTopOpen className="h-4 w-4" />
                </span>
                <span className="min-w-0">
                  <span className="block font-semibold text-foreground">Busca assistida e preenchimento por texto</span>
                  <span className="mt-1 block text-sm font-normal text-muted-foreground">
                    Cole uma anotacao de campo para detectar valores e formulas relacionadas.
                  </span>
                </span>
              </span>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4 sm:px-5 sm:pb-5">
              <div className="grid gap-4 xl:grid-cols-[1fr_0.95fr]">
                <TechnicalAssistant
                  formulas={formulas}
                  selectedFormula={selectedFormula}
                  onSelectFormula={selectFormula}
                  onApplyValues={applyDetectedValues}
                  onSearch={(query) => setSearch(query)}
                />

                {(selectedSector === "elevadores_mistura_90" || selectedFormula.sectorId === "elevadores_mistura_90") ? (
                  <Mistura90Guide formulas={formulas} onSelectFormula={selectFormula} onApplyValues={applyDetectedValues} />
                ) : (
                  <Card className="gradient-industrial border-border/60">
                    <CardHeader className="border-b border-border/70 p-5">
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Leitura tecnica</p>
                      <CardTitle className="mt-1 text-lg text-foreground">Como orientar a busca</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-3 p-5 sm:grid-cols-2">
                      {sectors.slice(0, 6).map((sector) => (
                        <button
                          key={sector.id}
                          type="button"
                          onClick={() => selectSector(sector.id)}
                          className="rounded-lg border border-border/70 bg-background/35 p-4 text-left transition-all hover:-translate-y-0.5 hover:border-primary/35 hover:bg-muted/25"
                        >
                          <p className="font-semibold text-foreground">{sector.name}</p>
                          <p className="mt-2 text-sm leading-relaxed text-muted-foreground line-clamp-3">{sector.description}</p>
                        </button>
                      ))}
                    </CardContent>
                  </Card>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
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

function SectorRail({
  sectors,
  selectedSector,
  onSelect,
}: {
  sectors: Sector[];
  selectedSector: SectorId;
  onSelect: (sectorId: SectorId) => void;
}) {
  return (
    <section className="rounded-lg border border-border/60 bg-card/75 p-3 glow-card">
      <div className="flex gap-2 overflow-x-auto pb-1 pr-1 [scrollbar-width:thin]">
        {sectors.map((sector) => (
          <SectorRailButton
            key={sector.id}
            title={sector.name}
            detail={`${sector.formulas} formulas`}
            active={selectedSector === sector.id}
            sector={sector}
            icon={Factory}
            onClick={() => onSelect(sector.id)}
          />
        ))}
      </div>
    </section>
  );
}

function SectorRailButton({
  title,
  detail,
  active,
  icon: Icon,
  sector,
  onClick,
}: {
  title: string;
  detail: string;
  active: boolean;
  icon: LucideIcon;
  sector?: Sector;
  onClick: () => void;
}) {
  const visual = sector ? getSectorVisual(sector.id) : null;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`group relative min-h-[118px] w-[190px] shrink-0 overflow-hidden rounded-lg border p-3 text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg ${
        active ? "border-primary/55 bg-primary/15 shadow-[0_0_0_1px_hsl(var(--primary)/0.25)]" : "border-border/70 bg-muted/20 hover:border-primary/35"
      }`}
    >
      {visual && (
        <span
          className="absolute inset-0 scale-105 bg-cover bg-center opacity-38 transition duration-300 group-hover:scale-110 group-hover:opacity-55"
          style={{ backgroundImage: getSectorBackgroundImage(visual), backgroundPosition: visual.focus }}
          aria-hidden="true"
        />
      )}
      <span className="absolute inset-0 bg-[linear-gradient(145deg,hsl(var(--card)/0.9),hsl(var(--surface-elevated)/0.72))]" aria-hidden="true" />
      <span className="relative flex h-full flex-col">
        <Icon className="h-4 w-4 text-primary" />
        <span className="mt-auto block">
          <span className="line-clamp-2 text-sm font-semibold leading-tight text-foreground">{title}</span>
          <span className="mt-1 block text-xs text-muted-foreground">{detail}</span>
        </span>
      </span>
    </button>
  );
}

function FormulaFinderPanel({
  formulas,
  total,
  selectedFormula,
  selectedSectorName,
  search,
  onSearch,
  onSelectFormula,
  favoriteFormulas,
  mostUsed,
  isFavorite,
}: {
  formulas: Formula[];
  total: number;
  selectedFormula: Formula;
  selectedSectorName: string;
  search: string;
  onSearch: (value: string) => void;
  onSelectFormula: (formulaId: string) => void;
  favoriteFormulas: Formula[];
  mostUsed: Formula[];
  isFavorite: (formulaId: string) => boolean;
}) {
  return (
    <aside className="min-w-0 space-y-4 xl:sticky xl:top-24 xl:self-start">
      <Card className="gradient-industrial glow-card border-border/60">
        <CardHeader className="border-b border-border/70 p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Formulas</p>
              <CardTitle className="mt-1 text-lg text-foreground">Lista do setor</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">{selectedSectorName}</p>
            </div>
            <SlidersHorizontal className="mt-1 h-4 w-4 text-muted-foreground" />
          </div>
          <div className="relative mt-4">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(event) => onSearch(event.target.value)}
              placeholder="Ex: pH, correia, motor, vazao"
              className="h-11 border-border bg-muted/25 pl-9 text-foreground focus-visible:ring-primary/40"
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Accordion type="single" collapsible className="border-b border-border/70">
            <AccordionItem value="atalhos" className="border-0 px-4">
              <AccordionTrigger className="py-3 text-sm hover:no-underline">
                <span className="flex items-center gap-2 text-foreground">
                  <Star className="h-4 w-4 text-primary" />
                  Favoritos e mais usadas
                </span>
              </AccordionTrigger>
              <AccordionContent className="pb-4">
                <div className="space-y-4">
                  <QuickFormulaList title="Favoritos" formulas={favoriteFormulas} empty="Nenhum favorito ainda." onSelectFormula={onSelectFormula} />
                  <QuickFormulaList title="Mais usadas" formulas={mostUsed.slice(0, 6)} onSelectFormula={onSelectFormula} />
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <div className="border-b border-border/70 px-4 py-3">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-foreground">{total} formulas encontradas</p>
              <Badge variant="outline" className="border-primary/25 bg-primary/10 text-primary">
                {total > formulas.length ? `${formulas.length} visiveis` : "filtrado"}
              </Badge>
            </div>
          </div>

          <ScrollArea className="h-[690px]">
            <div className="space-y-3 p-4">
              {formulas.map((formula) => (
                <FormulaCard
                  key={formula.id}
                  formula={formula}
                  selected={formula.id === selectedFormula.id}
                  favorite={isFavorite(formula.id)}
                  compact
                  onClick={() => onSelectFormula(formula.id)}
                />
              ))}
              {formulas.length === 0 && (
                <div className="rounded-lg border border-border/70 bg-muted/20 p-5 text-center text-sm text-muted-foreground">
                  Nenhuma formula encontrada. Tente buscar por equipamento, grandeza ou variavel.
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </aside>
  );
}

function QuickFormulaList({
  title,
  formulas,
  empty,
  onSelectFormula,
}: {
  title: string;
  formulas: Formula[];
  empty?: string;
  onSelectFormula: (formulaId: string) => void;
}) {
  return (
    <div>
      <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">{title}</p>
      {formulas.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {formulas.map((formula) => (
            <button
              key={formula.id}
              type="button"
              onClick={() => onSelectFormula(formula.id)}
              className="rounded-md border border-border/70 bg-background/35 px-2.5 py-1.5 text-left text-xs text-muted-foreground transition-colors hover:border-primary/35 hover:text-primary"
            >
              {formula.name}
            </button>
          ))}
        </div>
      ) : (
        <p className="rounded-md border border-border/70 bg-muted/15 p-3 text-sm text-muted-foreground">{empty || "Sem itens."}</p>
      )}
    </div>
  );
}

function FormulaTeachingReport({ formula, result }: { formula: Formula; result: string | null }) {
  return (
    <Card className="gradient-industrial glow-card border-border/60">
      <CardHeader className="border-b border-border/70 p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Relatorio da formula</p>
            <CardTitle className="mt-1 flex items-center gap-2 text-lg text-foreground">
              <BookOpenCheck className="h-5 w-5 text-primary" />
              {formula.name}
            </CardTitle>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="w-fit border-border bg-muted/20 text-muted-foreground">
              v{formula.version} - {formula.resultUnit || "sem unidade"}
            </Badge>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => exportFormulaPdf(formula, result)}
              className="border-primary/25 bg-primary/10 text-primary hover:bg-primary/15"
            >
              <FileDown className="h-4 w-4" />
              PDF
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="grid gap-4 p-4">
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
          <div className="rounded-lg border border-border/70 bg-background/30 p-4">
            <p className="text-sm font-semibold text-foreground">Para que serve</p>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{formula.description}</p>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{formula.simpleExplanation}</p>
          </div>
          <div className="rounded-lg border border-primary/25 bg-primary/10 p-4">
            <p className="text-sm font-semibold text-foreground">Resultado</p>
            <p className="mt-2 font-mono text-2xl font-semibold text-primary">{result ? `${result} ${formula.resultUnit}` : `Aguardando ${formula.resultUnit || "calculo"}`}</p>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{formula.example}</p>
          </div>
        </div>

        <div className="overflow-hidden rounded-lg border border-border/70">
          <div className="grid grid-cols-[90px_minmax(0,1fr)_120px] border-b border-border/70 bg-muted/25 px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            <span>Variavel</span>
            <span>Significado</span>
            <span>Unidade</span>
          </div>
          <div className="divide-y divide-border/70">
            {formula.variables.map((variable) => (
              <div key={variable.name} className="grid grid-cols-[90px_minmax(0,1fr)_120px] gap-3 px-3 py-2 text-sm">
                <span className="break-all font-mono font-semibold text-primary">{variable.name}</span>
                <span className="min-w-0 text-muted-foreground">{variable.label}</span>
                <span className="text-muted-foreground">{variable.unit || "-"}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

async function exportFormulaPdf(formula: Formula, result: string | null) {
  const { default: jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const margin = 16;
  const pageWidth = doc.internal.pageSize.getWidth();
  const contentWidth = pageWidth - margin * 2;
  let y = 18;

  doc.setFillColor(10, 37, 64);
  doc.rect(0, 0, pageWidth, 34, "F");
  doc.setTextColor(255, 106, 0);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("i9TMG - Relatorio de formula", margin, y);
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.text(formula.sector, margin, y + 8);

  y = 48;
  doc.setTextColor(10, 37, 64);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.text(splitPdfText(doc, formula.name, contentWidth), margin, y);
  y += 12;

  const blocks = [
    ["Formula", formula.expression],
    ["Resultado", result ? `${result} ${formula.resultUnit}` : `Aguardando calculo em ${formula.resultUnit || "unidade definida"}`],
    ["Descricao", formula.description],
    ["Explicacao", formula.simpleExplanation],
    ["Exemplo", formula.example],
  ];

  blocks.forEach(([title, text]) => {
    y = ensurePdfSpace(doc, y, 28, margin);
    doc.setTextColor(255, 106, 0);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text(title, margin, y);
    y += 5;
    doc.setTextColor(38, 55, 68);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    const lines = splitPdfText(doc, text, contentWidth);
    doc.text(lines, margin, y);
    y += lines.length * 5 + 5;
  });

  y = ensurePdfSpace(doc, y, 40, margin);
  doc.setTextColor(255, 106, 0);
  doc.setFont("helvetica", "bold");
  doc.text("Variaveis", margin, y);
  y += 6;
  doc.setTextColor(38, 55, 68);
  doc.setFont("helvetica", "normal");
  formula.variables.forEach((variable) => {
    y = ensurePdfSpace(doc, y, 12, margin);
    const unit = variable.unit ? ` (${variable.unit})` : "";
    const line = `${variable.name} - ${variable.label}${unit}`;
    const lines = splitPdfText(doc, line, contentWidth);
    doc.text(lines, margin, y);
    y += lines.length * 5;
  });

  doc.save(`relatorio-${slugify(formula.name)}.pdf`);
}

function splitPdfText(doc: { splitTextToSize: (text: string, maxWidth: number) => string[] }, text: string, maxWidth: number) {
  return doc.splitTextToSize(text || "-", maxWidth);
}

function ensurePdfSpace(
  doc: { internal: { pageSize: { getHeight: () => number } }; addPage: () => unknown },
  y: number,
  needed: number,
  margin: number,
) {
  const pageHeight = doc.internal.pageSize.getHeight();
  if (y + needed <= pageHeight - margin) return y;
  doc.addPage();
  return margin;
}

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

type AuditState = "ok" | "warn" | "block" | "neutral";

interface AuditItem {
  title: string;
  detail: string;
  state: AuditState;
  icon: LucideIcon;
}

function AuditPanel({ items, formula }: { items: AuditItem[]; formula: Formula }) {
  const score = items.length ? Math.round((items.filter((item) => item.state === "ok").length / items.length) * 100) : 0;
  const blocked = items.some((item) => item.state === "block");

  return (
    <Card className="gradient-industrial glow-card border-primary/25">
      <CardHeader className="border-b border-border/70 p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Auditoria tecnica</p>
            <CardTitle className="mt-1 flex items-center gap-2 text-lg text-foreground">
              <Brain className="h-5 w-5 text-primary" />
              Checagem antes do calculo
            </CardTitle>
          </div>
          <Badge
            variant="outline"
            className={blocked ? "border-warning/25 bg-warning/10 text-warning" : "border-success/25 bg-success/10 text-success"}
          >
            {blocked ? "Revisar entradas" : `${score}% pronto`}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="grid gap-3 p-4">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.title} className={`rounded-lg border p-3 ${auditClasses[item.state]}`}>
              <div className="flex items-start gap-3">
                <Icon className="mt-0.5 h-4 w-4 shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground">{item.title}</p>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{item.detail}</p>
                </div>
              </div>
            </div>
          );
        })}
        <div className="rounded-lg border border-border/70 bg-muted/15 p-3">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Rastreabilidade</p>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Ao calcular, o resultado entra no historico com usuario, setor, status da formula e entradas usadas. Versao da formula: {formula.version}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function parseTechnicalNumber(value: string | undefined) {
  if (!value) return Number.NaN;
  const normalized = value.trim().replace(",", ".");
  if (!/^-?\d+(\.\d+)?$/.test(normalized)) return Number.NaN;
  return Number(normalized);
}

function buildAuditItems(formula: Formula | undefined, values: Record<string, string>, errors: Record<string, string>, result: string | null): AuditItem[] {
  if (!formula) return [];

  const filledCount = formula.variables.filter((variable) => values[variable.name]?.trim()).length;
  const invalidCount = Object.values(errors).filter(Boolean).length;
  const zeroRisk = formula.variables.some((variable) => parseTechnicalNumber(values[variable.name]) === 0 && isLikelyDenominator(formula.expression, variable.name));
  const largeValues = formula.variables.filter((variable) => {
    const parsed = parseTechnicalNumber(values[variable.name]);
    return Number.isFinite(parsed) && Math.abs(parsed) > 1_000_000;
  }).length;

  return [
    {
      title: "Entradas preenchidas",
      detail: `${filledCount}/${formula.variables.length} variaveis informadas com valor numerico.`,
      state: filledCount === formula.variables.length ? "ok" : "block",
      icon: ClipboardCheck,
    },
    {
      title: "Consistencia numerica",
      detail: invalidCount ? `${invalidCount} campo(s) precisam de correcao antes de calcular.` : "Nenhum erro numerico detectado nos campos.",
      state: invalidCount || zeroRisk ? "block" : largeValues ? "warn" : "ok",
      icon: invalidCount || zeroRisk ? ShieldAlert : CheckCircle2,
    },
    {
      title: "Status da formula",
      detail: formula.status === "validada" || formula.status === "aprovada" ? "Formula liberada para uso operacional." : `Status atual: ${formula.status.replace("_", " ")}.`,
      state: formula.status === "validada" || formula.status === "aprovada" ? "ok" : "warn",
      icon: formula.status === "validada" || formula.status === "aprovada" ? CheckCircle2 : AlertTriangle,
    },
    {
      title: "Saida tecnica",
      detail: result ? `Resultado gerado em ${formula.resultUnit || "unidade nao definida"}.` : `Resultado previsto em ${formula.resultUnit || "unidade nao definida"}.`,
      state: result ? "ok" : "neutral",
      icon: Calculator,
    },
  ];
}

function getFirstFormulaForSector(formulas: Formula[], sectorId: SectorId) {
  return formulas
    .filter((formula) => formula.sectorId === sectorId && formula.status !== "arquivada")
    .sort((a, b) => statusRank[b.status] - statusRank[a.status] || b.usageCount - a.usageCount)[0];
}

function getDefaultFormulaId(formulas: Formula[]) {
  return formulas.find((formula) => formula.id === "eletrica-corrente-trifasica-motor")?.id || formulas[0]?.id || "";
}

function isLikelyDenominator(expression: string, variableName: string) {
  const body = expression.split("=").slice(1).join("=") || expression;
  const name = escapeRegExp(variableName);
  return new RegExp(`/\\s*(?:\\([^)]*\\b${name}\\b|\\b${name}\\b)`).test(body);
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

const auditClasses: Record<AuditState, string> = {
  ok: "border-success/25 bg-success/10 text-success",
  warn: "border-warning/25 bg-warning/10 text-warning",
  block: "border-destructive/25 bg-destructive/10 text-destructive",
  neutral: "border-border/70 bg-muted/15 text-muted-foreground",
};
