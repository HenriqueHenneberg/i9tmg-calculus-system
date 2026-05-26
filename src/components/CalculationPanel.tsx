import { Calculator, Lightbulb, Loader2, RotateCcw, Star, Wand2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TechInput } from "@/components/ui/tech-input";
import type { Formula } from "@/lib/industrial-data";

interface CalculationPanelProps {
  formula: Formula;
  values: Record<string, string>;
  errors?: Record<string, string>;
  loading?: boolean;
  favorite?: boolean;
  result?: string | null;
  onChange: (name: string, value: string) => void;
  onCalculate: () => void;
  onReset: () => void;
  onToggleFavorite?: () => void;
  onUseExample?: () => void;
}

export function CalculationPanel({
  formula,
  values,
  errors = {},
  loading,
  favorite,
  result,
  onChange,
  onCalculate,
  onReset,
  onToggleFavorite,
  onUseExample,
}: CalculationPanelProps) {
  const filledCount = formula.variables.filter((variable) => values[variable.name]?.trim()).length;
  const readyToCalculate = filledCount === formula.variables.length;
  const progress = formula.variables.length ? Math.round((filledCount / formula.variables.length) * 100) : 0;

  return (
    <Card id="calculo-operacional" className="gradient-industrial glow-card flex min-w-0 scroll-mt-24 flex-col overflow-hidden border-primary/30">
      <CardHeader className="border-b border-border/70 p-4 sm:p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Em uso</p>
            <CardTitle className="mt-2 text-xl leading-snug text-foreground">{formula.name}</CardTitle>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">{formula.description}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {formula.tags.slice(0, 5).map((tag) => (
                <Badge key={tag} variant="outline" className="border-border bg-muted/25 text-muted-foreground">
                  {tag}
                </Badge>
              ))}
              <Badge variant="outline" className={readyToCalculate ? "border-success/25 bg-success/10 text-success" : "border-primary/25 bg-primary/10 text-primary"}>
                {filledCount}/{formula.variables.length} entradas
              </Badge>
            </div>
          </div>
          <div className="flex min-w-0 flex-col gap-2 lg:max-w-[340px]">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Formula</p>
            <div className="technical-code mt-2 text-sm">
              {formula.expression}
            </div>
            <div className="grid grid-cols-2 gap-2">
              {onToggleFavorite && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={onToggleFavorite}
                  className="flex-1 border-border bg-muted/25 text-foreground hover:bg-muted/50"
                >
                  <Star className={favorite ? "h-4 w-4 fill-primary text-primary" : "h-4 w-4"} />
                  Favorito
                </Button>
              )}
              {onUseExample && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={onUseExample}
                  className="flex-1 border-border bg-muted/25 text-foreground hover:bg-muted/50"
                >
                  <Wand2 className="h-4 w-4" />
                  Exemplo
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col p-4 sm:p-5">
        <div className="mb-4 rounded-lg border border-border/70 bg-background/30 p-3">
          <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Dados de entrada</p>
              <p className="text-sm text-muted-foreground">Informe os dados do equipamento. Use ponto ou virgula para decimais.</p>
            </div>
            <div className="grid gap-2 lg:grid-cols-[150px_auto_auto] lg:items-center">
              <div className="min-w-0">
                <div className="h-2 overflow-hidden rounded-full bg-muted/55">
                  <span className="block h-full rounded-full bg-primary transition-all" style={{ width: `${progress}%` }} />
                </div>
                <p className="mt-1 text-right text-xs text-muted-foreground">{progress}% preenchido</p>
              </div>
              <Button
                type="button"
                onClick={onCalculate}
                disabled={loading}
                className="h-11 bg-primary px-5 text-primary-foreground glow-primary hover:bg-highlight-glow"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Calculator className="h-4 w-4" />}
                Executar calculo
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={onReset}
                className="h-11 border-border bg-background/35 px-4 text-foreground hover:bg-muted/50"
              >
                <RotateCcw className="h-4 w-4" />
                Limpar
              </Button>
            </div>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {formula.variables.map((variable) => (
            <TechInput
              key={variable.name}
              label={`${variable.label} (${variable.name})`}
              unit={variable.unit}
              type="number"
              inputMode="decimal"
              placeholder={variable.placeholder || "0.00"}
              value={values[variable.name] || ""}
              error={errors[variable.name]}
              onChange={(event) => onChange(variable.name, event.target.value)}
            />
          ))}
        </div>

        <div className="mt-5 rounded-lg border border-primary/25 bg-primary/10 p-4">
          <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(240px,320px)] lg:items-center">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Resultado tecnico</p>
              <p className="mt-1 text-sm text-muted-foreground">Saida numerica com memoria tecnica e registro no historico.</p>
            </div>
            <div className="rounded-lg border border-primary/25 bg-background/35 px-4 py-3 text-left lg:text-right">
              <p className="break-words font-mono text-3xl font-semibold text-primary">
                {result ?? "--"}
                {result ? <span className="ml-2 text-base text-muted-foreground">{formula.resultUnit}</span> : null}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">{result ? "Registrado no historico" : "Sem resultado ainda"}</p>
            </div>
          </div>
        </div>

        <div className="mt-5 rounded-lg border border-border/70 bg-muted/15 p-4">
          <div className="flex items-start gap-3">
            <Lightbulb className="mt-0.5 h-4 w-4 text-primary" />
            <p className="text-sm leading-relaxed text-muted-foreground">{formula.simpleExplanation}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
