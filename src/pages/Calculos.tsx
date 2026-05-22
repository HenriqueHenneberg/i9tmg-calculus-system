import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  BookOpenCheck,
  Brain,
  Calculator,
  CheckCircle2,
  ClipboardCheck,
  Flame,
  Search,
  ShieldAlert,
  SlidersHorizontal,
  Star,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { CalculationPanel } from "@/components/CalculationPanel";
import { FormulaCard } from "@/components/FormulaCard";
import { Mistura90Guide } from "@/components/Mistura90Guide";
import { StepByStepViewer } from "@/components/StepByStepViewer";
import { TechnicalAssistant } from "@/components/TechnicalAssistant";
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
import { getSectorVisual } from "@/lib/sector-visuals";

export default function Calculos() {
  const { formulas, sectors, favoriteIds, isFavorite, toggleFavorite, recordCalculation, preferences } = useIndustrialWorkspace();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState("");
  const [selectedSector, setSelectedSector] = useState<SectorId | "todos">("todos");
  const [selectedFormulaId, setSelectedFormulaId] = useState(formulas[0]?.id || "");
  const [values, setValues] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [result, setResult] = useState<string | null>(null);
  const [calculationError, setCalculationError] = useState<string | null>(null);
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

  useEffect(() => {
    const formulaId = searchParams.get("formula");
    const sectorId = searchParams.get("sector") as SectorId | null;
    const encodedValues = searchParams.get("values");

    if (formulaId && formulas.some((formula) => formula.id === formulaId)) {
      setSelectedFormulaId(formulaId);
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

  const selectedFormula = formulas.find((formula) => formula.id === selectedFormulaId) || formulas[0];

  const filteredFormulas = useMemo(() => {
    const term = search.trim().toLowerCase();
    const activeFormulas = formulas.filter((formula) => formula.status !== "arquivada").filter((formula) => {
      const matchSector = selectedSector === "todos" || formula.sectorId === selectedSector;
      return matchSector;
    });

    if (!term) {
      return [...activeFormulas].sort((a, b) => statusRank[b.status] - statusRank[a.status] || b.usageCount - a.usageCount);
    }

    const ranked = rankFormulas(search, activeFormulas);
    if (ranked.length > 0) {
      return ranked.map((item) => item.formula);
    }

    const terms = term.split(/\s+/).filter(Boolean);
    return activeFormulas.filter((formula) => {
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
    }).sort((a, b) => statusRank[b.status] - statusRank[a.status] || b.usageCount - a.usageCount);
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
    () => [...formulas].sort((a, b) => b.usageCount - a.usageCount).slice(0, 8),
    [formulas],
  );
  const auditItems = useMemo(
    () => buildAuditItems(selectedFormula, values, errors, result),
    [errors, result, selectedFormula, values],
  );

  const prioritySectors = useMemo(() => {
    const ids: Array<SectorId | "todos"> = ["todos", "eletrica", "mecanica", "producao", "hidraulica", "elevadores_mistura_90"];
    return ids
      .map((id) => (id === "todos" ? null : sectors.find((sector) => sector.id === id)))
      .filter((sector): sector is Sector => Boolean(sector));
  }, [sectors]);

  const selectFormula = (formulaId: string) => {
    setSelectedFormulaId(formulaId);
    setValues({});
    setErrors({});
    setResult(null);
    setCalculationError(null);
  };

  const selectSector = (sectorId: SectorId | "todos") => {
    setSelectedSector(sectorId);
    if (sectorId === "todos") return;

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
    <div className="mx-auto flex w-full max-w-[1720px] flex-col gap-5">
      <section className="rounded-lg border border-primary/25 bg-[linear-gradient(135deg,hsl(var(--card)),hsl(var(--surface-elevated))_58%,hsl(var(--primary)/0.12))] p-5 glow-card">
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_380px]">
          <div className="min-w-0">
            <Badge className="border-primary/25 bg-primary/15 text-primary hover:bg-primary/15">Assistente i9TMG</Badge>
            <h1 className="mt-3 text-balance text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
              Calcule com fluxo guiado
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground md:text-base">
              Busque a formula, preencha os valores, confira a auditoria tecnica e gere resultado com memoria de calculo.
              A tela foi reorganizada para deixar a conta no centro da operacao.
            </p>

            <div className="mt-5 grid gap-3 md:grid-cols-4">
              <WorkflowHint index="1" title="Buscar" text="Digite problema, setor ou variavel." />
              <WorkflowHint index="2" title="Preencher" text="Campos numericos com unidade." />
              <WorkflowHint index="3" title="Auditar" text="O sistema checa risco e status." />
              <WorkflowHint index="4" title="Calcular" text="Resultado, historico e relatorio." />
            </div>
          </div>

          <div className="rounded-lg border border-primary/25 bg-background/35 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Formula em operacao</p>
              <h2 className="mt-2 text-xl font-semibold text-foreground">{selectedFormula.name}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{selectedFormula.simpleExplanation}</p>
            <div className="mt-4 technical-code text-sm">{selectedFormula.expression}</div>
            <div className="mt-4 flex flex-wrap gap-2">
              <Badge variant="outline" className="border-primary/25 bg-primary/10 text-primary">
                {selectedFormula.sector}
              </Badge>
              <Badge variant="outline" className="border-border bg-muted/25 text-muted-foreground">
                {selectedFormula.variables.length} entradas
              </Badge>
              <Badge variant="outline" className="border-success/25 bg-success/10 text-success">
                {selectedFormula.resultUnit || "sem unidade"}
              </Badge>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-6">
        <SectorShortcut
          title="Todos"
          detail={`${formulas.length} formulas`}
          active={selectedSector === "todos"}
          icon={Calculator}
          onClick={() => selectSector("todos")}
        />
        {prioritySectors.map((sector) => (
          <SectorShortcut
            key={sector.id}
            title={sector.name}
            detail={`${sector.formulas} formulas`}
            active={selectedSector === sector.id}
            icon={sector.id === "eletrica" || sector.id === "energia" ? Zap : Calculator}
            sectorId={sector.id}
            onClick={() => selectSector(sector.id)}
          />
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-[390px_minmax(0,1fr)]">
        <Card className="gradient-industrial glow-card order-2 min-h-[560px] border-border/60 xl:order-1">
          <CardHeader className="border-b border-border/70 p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Escolha a formula</p>
                <CardTitle className="mt-1 text-lg text-foreground">Biblioteca de calculos</CardTitle>
              </div>
              <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="relative mt-4">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Digite o que precisa calcular..."
                className="h-11 border-border bg-muted/25 pl-9 text-foreground focus-visible:ring-primary/40"
              />
            </div>
            <div className="mt-3 flex max-h-32 flex-wrap gap-2 overflow-auto pr-1">
              <FilterButton active={selectedSector === "todos"} onClick={() => selectSector("todos")}>
                Todos
              </FilterButton>
              {sectors.map((sector) => (
                <FilterButton key={sector.id} active={selectedSector === sector.id} onClick={() => selectSector(sector.id)}>
                  {sector.name}
                </FilterButton>
              ))}
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[650px]">
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
                          className="justify-between border-border bg-background/30 text-left text-foreground hover:bg-muted/40"
                        >
                          <span className="truncate">{formula.name}</span>
                          <ArrowRight className="h-3.5 w-3.5" />
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
                    Nenhuma formula encontrada. Tente buscar por setor, variavel ou equipamento.
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        <div className="order-1 grid min-w-0 gap-4 xl:order-2 2xl:grid-cols-[minmax(0,1fr)_390px]">
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
          </div>

          <div className="min-w-0 space-y-4">
            <AuditPanel items={auditItems} formula={selectedFormula} />
            <StepByStepViewer formula={selectedFormula} values={values} result={result} />
            <Card className="gradient-industrial glow-card border-border/60">
              <CardHeader className="border-b border-border/70 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Ajuda rapida</p>
                <CardTitle className="mt-1 flex items-center gap-2 text-lg text-foreground">
                  <BookOpenCheck className="h-5 w-5 text-primary" />
                  Onde esta a conta?
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 p-4 text-sm leading-relaxed text-muted-foreground">
                <p>O calculo principal fica no painel grande ao lado: entradas, botao Calcular e resultado.</p>
                <p>A biblioteca so troca a formula ativa. A memoria mostra como o resultado foi montado.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1fr_0.95fr]">
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
          <Card className="gradient-industrial glow-card border-border/60">
            <CardHeader className="border-b border-border/70 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Sugestao de uso</p>
              <CardTitle className="mt-1 text-lg text-foreground">Comece pelos setores principais</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 p-5 sm:grid-cols-2">
              {prioritySectors.slice(0, 4).map((sector) => (
                <button
                  key={sector.id}
                  type="button"
                  onClick={() => selectSector(sector.id)}
                  className="rounded-lg border border-border/70 bg-background/35 p-4 text-left transition-all hover:-translate-y-0.5 hover:border-primary/35 hover:bg-muted/25"
                >
                  <p className="font-semibold text-foreground">{sector.name}</p>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{sector.description}</p>
                </button>
              ))}
            </CardContent>
          </Card>
        )}
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

function WorkflowHint({ index, title, text }: { index: string; title: string; text: string }) {
  return (
    <div className="rounded-lg border border-border/70 bg-background/35 p-3">
      <div className="flex items-center gap-3">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/15 font-mono text-sm font-semibold text-primary">
          {index}
        </span>
        <div className="min-w-0">
          <p className="font-semibold text-foreground">{title}</p>
          <p className="text-sm text-muted-foreground">{text}</p>
        </div>
      </div>
    </div>
  );
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

function SectorShortcut({
  title,
  detail,
  active,
  icon: Icon,
  sectorId,
  onClick,
}: {
  title: string;
  detail: string;
  active: boolean;
  icon: LucideIcon;
  sectorId?: SectorId;
  onClick: () => void;
}) {
  const visual = sectorId ? getSectorVisual(sectorId) : null;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`group relative min-h-24 overflow-hidden rounded-lg border p-4 text-left transition-all hover:-translate-y-0.5 ${
        active ? "border-primary/45 bg-primary/15" : "border-border/70 bg-card/55 hover:border-primary/35 hover:bg-muted/25"
      }`}
    >
      {visual && (
        <span
          className="absolute inset-0 scale-105 bg-cover bg-center opacity-20 blur-[1px] transition duration-300 group-hover:scale-110 group-hover:opacity-35"
          style={{ backgroundImage: `url(${visual.image})`, backgroundPosition: visual.focus }}
          aria-hidden="true"
        />
      )}
      <span className="absolute inset-0 bg-[linear-gradient(135deg,hsl(var(--card)/0.92),hsl(var(--surface-elevated)/0.78))]" aria-hidden="true" />
      <span className="relative block">
        <Icon className="h-4 w-4 text-primary" />
        <p className="mt-3 font-semibold text-foreground">{title}</p>
        <p className="mt-1 text-xs text-muted-foreground">{detail}</p>
      </span>
    </button>
  );
}

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
