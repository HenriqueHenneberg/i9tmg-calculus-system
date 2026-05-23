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
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Calculo ativo</p>
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
          <div className="flex min-w-0 flex-col gap-2 md:max-w-[320px]">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Expressao</p>
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
              <Button
                type="button"
                onClick={onCalculate}
                disabled={loading}
                className="col-span-2 h-10 bg-primary text-primary-foreground glow-primary hover:bg-highlight-glow"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Calculator className="h-4 w-4" />}
                Calcular agora
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col p-4 sm:p-5">
        <div className="mb-4 rounded-lg border border-border/70 bg-background/30 p-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">1. Informe os valores</p>
              <p className="text-sm text-muted-foreground">Use ponto ou virgula para decimais. O botao laranja calcula e salva no historico.</p>
            </div>
            <div className="min-w-36">
              <div className="h-2 overflow-hidden rounded-full bg-muted/55">
                <span className="block h-full rounded-full bg-primary transition-all" style={{ width: `${progress}%` }} />
              </div>
              <p className="mt-1 text-right text-xs text-muted-foreground">{progress}% preenchido</p>
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
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">2. Resultado</p>
              <p className="mt-1 text-sm text-muted-foreground">Clique em Calcular agora para gerar a memoria tecnica.</p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="rounded-lg border border-primary/25 bg-background/35 px-4 py-3 text-left sm:min-w-56 sm:text-right">
                <p className="font-mono text-3xl font-semibold text-primary">
                  {result ?? "--"}
                  {result ? <span className="ml-2 text-base text-muted-foreground">{formula.resultUnit}</span> : null}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">{result ? "Calculado e pronto para historico" : "Aguardando entradas"}</p>
              </div>
              <Button
                type="button"
                onClick={onCalculate}
                disabled={loading}
                className="h-12 min-w-44 bg-primary text-primary-foreground glow-primary hover:bg-highlight-glow"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Calculator className="h-4 w-4" />}
                Calcular agora
              </Button>
            </div>
          </div>
        </div>

        <div className="mt-5 rounded-lg border border-border/70 bg-muted/15 p-4">
          <div className="flex items-start gap-3">
            <Lightbulb className="mt-0.5 h-4 w-4 text-primary" />
            <p className="text-sm leading-relaxed text-muted-foreground">{formula.simpleExplanation}</p>
          </div>
        </div>

        <div className="-mx-4 -mb-4 mt-5 flex flex-col gap-3 border-t border-border/70 bg-card/85 p-4 backdrop-blur sm:-mx-5 sm:-mb-5 sm:flex-row sm:p-5">
          <Button
            type="button"
            onClick={onCalculate}
            disabled={loading}
            className="h-11 flex-1 bg-primary text-primary-foreground glow-primary hover:bg-highlight-glow"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Calculator className="h-4 w-4" />}
            Calcular agora
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={onReset}
            className="h-11 border-border bg-muted/25 text-foreground hover:bg-muted/50"
          >
            <RotateCcw className="h-4 w-4" />
            Zerar campos
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
