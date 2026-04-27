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
  onChange,
  onCalculate,
  onReset,
  onToggleFavorite,
  onUseExample,
}: CalculationPanelProps) {
  return (
    <Card className="gradient-industrial glow-card flex h-full min-w-0 flex-col border-border/60">
      <CardHeader className="border-b border-border/70 p-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Console de calculo</p>
            <CardTitle className="mt-2 text-xl leading-snug text-foreground">{formula.name}</CardTitle>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">{formula.description}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {formula.tags.slice(0, 5).map((tag) => (
                <Badge key={tag} variant="outline" className="border-border bg-muted/25 text-muted-foreground">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
          <div className="flex min-w-0 flex-col gap-2 md:max-w-[320px]">
            <div className="technical-code text-sm">
              {formula.expression}
            </div>
            <div className="flex gap-2">
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
      <CardContent className="flex flex-1 flex-col p-5">
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

        <div className="mt-5 rounded-lg border border-border/70 bg-muted/15 p-4">
          <div className="flex items-start gap-3">
            <Lightbulb className="mt-0.5 h-4 w-4 text-primary" />
            <p className="text-sm leading-relaxed text-muted-foreground">{formula.simpleExplanation}</p>
          </div>
        </div>

        <div className="mt-auto flex flex-col gap-3 border-t border-border/70 pt-5 sm:flex-row">
          <Button
            type="button"
            onClick={onCalculate}
            disabled={loading}
            className="h-11 flex-1 bg-primary text-primary-foreground glow-primary hover:bg-highlight-glow"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Calculator className="h-4 w-4" />}
            Calcular
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={onReset}
            className="h-11 border-border bg-muted/25 text-foreground hover:bg-muted/50"
          >
            <RotateCcw className="h-4 w-4" />
            Limpar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
