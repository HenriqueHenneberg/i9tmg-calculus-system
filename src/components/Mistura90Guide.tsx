import { useMemo, useState } from "react";
import { ArrowRight, ClipboardList, Gauge, Route, Wand2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { buildMistura90SeedValues } from "@/lib/industrial-assistant";
import type { Formula } from "@/lib/industrial-data";
import { cn } from "@/lib/utils";

interface Mistura90GuideProps {
  formulas: Formula[];
  onSelectFormula: (id: string) => void;
  onApplyValues: (values: Record<string, string>) => void;
}

const mistura90Flow = [
  "mistura90-capacidade-elevador",
  "mistura90-peso-metro-material",
  "mistura90-numero-canecas",
  "mistura90-tensao-estatica",
  "mistura90-tensao-maxima",
  "mistura90-potencia-motor",
  "mistura90-reducao-redutor",
  "mistura90-capacidade-dinamica-rolamento",
];

const sampleSeed = "volume 0.008 fileiras 2 velocidade 1.2 enchimento 0.75 homogeneidade 0.92 densidade 0.78 passo 0.305 altura 18 D 0.42 rendimento 0.82";

export function Mistura90Guide({ formulas, onSelectFormula, onApplyValues }: Mistura90GuideProps) {
  const [seedText, setSeedText] = useState(sampleSeed);
  const seedValues = useMemo(() => buildMistura90SeedValues(seedText), [seedText]);
  const flowFormulas = useMemo(
    () =>
      mistura90Flow
        .map((id) => formulas.find((formula) => formula.id === id))
        .filter((formula): formula is Formula => Boolean(formula)),
    [formulas],
  );

  const selectFlowStep = (formula: Formula) => {
    onSelectFormula(formula.id);
    const valuesForFormula = Object.fromEntries(
      formula.variables
        .filter((variable) => seedValues[variable.name])
        .map((variable) => [variable.name, seedValues[variable.name]]),
    );
    if (Object.keys(valuesForFormula).length > 0) {
      onApplyValues(valuesForFormula);
    }
  };

  return (
    <Card className="overflow-hidden border-primary/20 bg-card/80">
      <CardHeader className="border-b border-border/70 p-4 md:p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <Badge className="border-primary/30 bg-primary/15 text-primary hover:bg-primary/15">
              <Route className="h-3.5 w-3.5" />
              fluxo tecnico
            </Badge>
            <CardTitle className="mt-3 flex items-center gap-2 text-xl text-foreground">
              <Gauge className="h-5 w-5 text-primary" />
              Assistente Mistura 90
            </CardTitle>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
              Sequencia rapida para elevadores industriais, correias, eixos, redutores, acoplamentos e rolamentos.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={() => setSeedText(sampleSeed)}
            className="border-border bg-muted/25 text-foreground hover:bg-muted/50"
          >
            <Wand2 className="h-4 w-4" />
            Exemplo Mistura 90
          </Button>
        </div>
      </CardHeader>
      <CardContent className="grid gap-4 p-4 md:p-5 xl:grid-cols-[minmax(260px,0.85fr)_minmax(0,1.15fr)]">
        <div className="min-w-0 space-y-3">
          <div className="rounded-lg border border-border/70 bg-muted/15 p-3">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Dados base</p>
            <Input
              value={seedText}
              onChange={(event) => setSeedText(event.target.value)}
              className="border-border bg-background/40 text-foreground focus-visible:ring-primary/40"
              placeholder="altura 18 D 0.42 velocidade 1.2 volume 0.008"
            />
            <div className="mt-3 flex flex-wrap gap-2">
              {Object.entries(seedValues).length > 0 ? (
                Object.entries(seedValues).map(([key, value]) => (
                  <span key={key} className="rounded-md border border-primary/25 bg-primary/10 px-2.5 py-1 font-mono text-xs text-primary">
                    {key} = {value}
                  </span>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">Preencha dados base para reaproveitar nas etapas.</p>
              )}
            </div>
          </div>
        </div>

        <div className="min-w-0">
          <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
            {flowFormulas.map((formula, index) => {
              const usableValues = formula.variables.filter((variable) => seedValues[variable.name]).length;
              return (
                <button
                  key={formula.id}
                  type="button"
                  onClick={() => selectFlowStep(formula)}
                  className={cn(
                    "group flex min-h-[118px] flex-col rounded-lg border p-3 text-left transition-all hover:-translate-y-0.5",
                    usableValues > 0
                      ? "border-primary/30 bg-primary/10 hover:bg-primary/15"
                      : "border-border/70 bg-muted/15 hover:border-primary/25 hover:bg-muted/25",
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="rounded-md bg-background/40 px-2 py-1 font-mono text-[11px] text-muted-foreground">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
                  </div>
                  <p className="mt-3 line-clamp-2 text-sm font-semibold text-foreground">{formula.name}</p>
                  <div className="mt-auto flex items-center gap-2 pt-3 text-xs text-muted-foreground">
                    <ClipboardList className="h-3.5 w-3.5" />
                    {usableValues}/{formula.variables.length} preenchidos
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
