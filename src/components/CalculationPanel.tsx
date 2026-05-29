import { Calculator, Loader2, RotateCcw, Star, Wand2 } from "lucide-react";
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
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(320px,430px)] xl:items-start">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Em uso</p>
            <CardTitle className="mt-2 text-xl leading-snug text-foreground">{formula.name}</CardTitle>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground line-clamp-2">{formula.description}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Badge variant="outline" className={readyToCalculate ? "border-success/25 bg-success/10 text-success" : "border-primary/25 bg-primary/10 text-primary"}>
                {filledCount}/{formula.variables.length} entradas
              </Badge>
              <Badge variant="outline" className="border-border bg-muted/25 text-muted-foreground">
                {formula.resultUnit || "resultado"}
              </Badge>
            </div>
          </div>

          <div className="min-w-0 rounded-lg border border-primary/25 bg-primary/10 p-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Resultado</p>
                <p className="mt-1 break-words font-mono text-3xl font-semibold text-primary">
                  {result ?? "--"}
                  {result ? <span className="ml-2 text-base text-muted-foreground">{formula.resultUnit}</span> : null}
                </p>
              </div>
              <p className="rounded-md border border-border/60 bg-background/35 px-2 py-1 text-xs text-muted-foreground">
                {progress}%
              </p>
            </div>

            <div className="mt-3 h-2 overflow-hidden rounded-full bg-background/50">
              <span className="block h-full rounded-full bg-primary transition-all" style={{ width: `${progress}%` }} />
            </div>

            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              <Button
                type="button"
                onClick={onCalculate}
                disabled={loading}
                className="h-11 bg-primary px-4 text-primary-foreground glow-primary hover:bg-highlight-glow sm:col-span-2"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Calculator className="h-4 w-4" />}
                Executar calculo
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={onReset}
                className="h-10 border-border bg-background/35 px-4 text-foreground hover:bg-muted/50"
              >
                <RotateCcw className="h-4 w-4" />
                Limpar
              </Button>
              {onUseExample && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={onUseExample}
                  className="h-10 border-border bg-background/35 px-4 text-foreground hover:bg-muted/50"
                >
                  <Wand2 className="h-4 w-4" />
                  Exemplo
                </Button>
              )}
              {onToggleFavorite && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={onToggleFavorite}
                  className="h-10 border-border bg-background/35 text-foreground hover:bg-muted/50 sm:col-span-2"
                >
                  <Star className={favorite ? "h-4 w-4 fill-primary text-primary" : "h-4 w-4"} />
                  Favorito
                </Button>
              )}
            </div>
            <p className="mt-3 text-xs text-muted-foreground">{result ? "Registrado no historico" : formula.resultUnit || "aguardando calculo"}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col p-4 sm:p-5">
        <div className="mb-4">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Dados de entrada</p>
          <p className="mt-1 text-sm text-muted-foreground">Informe os dados do equipamento. Use ponto ou virgula para decimais.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
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

        <details className="mt-4 rounded-lg border border-border/70 bg-muted/15 p-4">
          <summary className="cursor-pointer text-sm font-semibold text-foreground">Detalhes da formula</summary>
          <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(260px,360px)]">
            <div className="min-w-0">
              <p className="text-sm leading-relaxed text-muted-foreground">{formula.simpleExplanation}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {formula.tags.slice(0, 6).map((tag) => (
                  <Badge key={tag} variant="outline" className="border-border bg-muted/25 text-muted-foreground">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="technical-code min-w-0 text-sm">
              {formula.expression}
            </div>
          </div>
        </details>
      </CardContent>
    </Card>
  );
}
