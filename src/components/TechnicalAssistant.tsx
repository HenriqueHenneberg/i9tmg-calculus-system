import { useMemo, useState } from "react";
import { ArrowRight, BrainCircuit, CheckCircle2, SearchCheck, Sparkles, Wand2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { analyzeIndustrialIntent, extractValuesFromText } from "@/lib/industrial-assistant";
import type { Formula } from "@/lib/industrial-data";
import { cn } from "@/lib/utils";

interface TechnicalAssistantProps {
  formulas: Formula[];
  selectedFormula?: Formula;
  onSelectFormula: (id: string) => void;
  onApplyValues: (values: Record<string, string>) => void;
  onSearch: (query: string) => void;
}

const promptExamples = [
  "potencia motor H 18 D 0.42 v 1.2 Pm 12 n 2 rendimento 0.82",
  "rolamento vida 30000h rpm 55 P 18000",
  "tensao correia Tm 2250 B 45",
];

export function TechnicalAssistant({
  formulas,
  selectedFormula,
  onSelectFormula,
  onApplyValues,
  onSearch,
}: TechnicalAssistantProps) {
  const [prompt, setPrompt] = useState("");
  const analysis = useMemo(() => analyzeIndustrialIntent(prompt, formulas, selectedFormula), [formulas, prompt, selectedFormula]);
  const selectedDetections = useMemo(
    () => (selectedFormula ? extractValuesFromText(prompt, selectedFormula) : []),
    [prompt, selectedFormula],
  );
  const detectedValues = selectedDetections.length > 0 ? selectedDetections : analysis.detectedValues;
  const canApply = detectedValues.length > 0;

  const applyDetectedValues = () => {
    if (!canApply) return;
    onApplyValues(Object.fromEntries(detectedValues.map((item) => [item.variable, item.value])));
  };

  const selectSuggestedFormula = (formula: Formula) => {
    onSelectFormula(formula.id);
    const formulaValues = extractValuesFromText(prompt, formula);
    if (formulaValues.length > 0) {
      onApplyValues(Object.fromEntries(formulaValues.map((item) => [item.variable, item.value])));
    }
  };

  return (
    <Card className="gradient-industrial glow-card overflow-hidden border-primary/20">
      <CardHeader className="border-b border-border/70 p-4 md:p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="border-primary/30 bg-primary/15 text-primary hover:bg-primary/15">
                <Sparkles className="h-3.5 w-3.5" />
                IA local
              </Badge>
              <Badge variant="outline" className="border-border bg-muted/25 text-muted-foreground">
                sem API
              </Badge>
            </div>
            <CardTitle className="mt-3 flex items-center gap-2 text-xl text-foreground">
              <BrainCircuit className="h-5 w-5 text-primary" />
              Assistente tecnico i9TMG
            </CardTitle>
          </div>
          <div className="grid grid-cols-2 gap-2 text-center sm:grid-cols-3">
            <AssistantMetric label="opcoes" value={analysis.suggestions.length} />
            <AssistantMetric label="valores" value={detectedValues.length} />
            <AssistantMetric label="relacoes" value={analysis.related.length} className="col-span-2 sm:col-span-1" />
          </div>
        </div>
      </CardHeader>

      <CardContent className="grid gap-4 p-4 md:p-5 xl:grid-cols-[minmax(0,1.15fr)_minmax(300px,0.85fr)]">
        <div className="min-w-0 space-y-4">
          <Textarea
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            placeholder="Descreva o calculo, equipamento ou valores. Ex: potencia motor H 18 D 0.42 v 1.2"
            className="min-h-28 resize-none border-border bg-muted/20 text-foreground focus-visible:ring-primary/40"
          />

          <div className="flex flex-wrap gap-2">
            {promptExamples.map((example) => (
              <button
                key={example}
                type="button"
                onClick={() => setPrompt(example)}
                className="rounded-md border border-border/70 bg-muted/20 px-3 py-1.5 text-left text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
              >
                {example}
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <Button
              type="button"
              onClick={() => onSearch(prompt)}
              variant="outline"
              className="border-border bg-muted/25 text-foreground hover:bg-muted/50"
            >
              <SearchCheck className="h-4 w-4" />
              Buscar na biblioteca
            </Button>
            <Button
              type="button"
              onClick={applyDetectedValues}
              disabled={!canApply}
              className="bg-primary text-primary-foreground hover:bg-highlight-glow"
            >
              <Wand2 className="h-4 w-4" />
              Aplicar valores
            </Button>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <div className="rounded-lg border border-border/70 bg-muted/15 p-3">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Valores detectados</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {detectedValues.length > 0 ? (
                  detectedValues.map((item) => (
                    <span
                      key={`${item.variable}-${item.value}`}
                      className="rounded-md border border-primary/25 bg-primary/10 px-2.5 py-1 font-mono text-xs text-primary"
                    >
                      {item.variable} = {item.value}
                    </span>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">Nenhum valor numerico reconhecido.</p>
                )}
              </div>
            </div>

            <div className="rounded-lg border border-border/70 bg-muted/15 p-3">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Proximos calculos</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {analysis.related.length > 0 ? (
                  analysis.related.map((formula) => (
                    <button
                      key={formula.id}
                      type="button"
                      onClick={() => selectSuggestedFormula(formula)}
                      className="rounded-md border border-border/70 bg-background/30 px-2.5 py-1 text-left text-xs text-muted-foreground transition-colors hover:border-primary/35 hover:text-primary"
                    >
                      {formula.name}
                    </button>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">Digite uma necessidade tecnica para cruzar formulas.</p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="min-w-0 rounded-lg border border-border/70 bg-muted/15 p-3">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Sugestoes inteligentes</p>
          <div className="mt-3 space-y-2">
            {analysis.suggestions.slice(0, 5).map((suggestion, index) => (
              <button
                key={suggestion.formula.id}
                type="button"
                onClick={() => selectSuggestedFormula(suggestion.formula)}
                className={cn(
                  "group w-full rounded-lg border p-3 text-left transition-all hover:-translate-y-0.5",
                  suggestion.formula.id === selectedFormula?.id
                    ? "border-primary/35 bg-primary/10"
                    : "border-border/70 bg-background/30 hover:border-primary/30 hover:bg-muted/30",
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="rounded-md bg-muted/35 px-2 py-1 font-mono text-[11px] text-muted-foreground">
                        #{index + 1}
                      </span>
                      <p className="truncate text-sm font-semibold text-foreground">{suggestion.formula.name}</p>
                    </div>
                    <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                      {suggestion.formula.description}
                    </p>
                  </div>
                  <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <Badge variant="outline" className="border-border bg-muted/20 text-[11px] text-muted-foreground">
                    {suggestion.formula.sector}
                  </Badge>
                  {suggestion.reasons.map((reason) => (
                    <Badge key={reason} variant="outline" className="border-primary/25 bg-primary/10 text-[11px] text-primary">
                      {reason}
                    </Badge>
                  ))}
                  {suggestion.formula.status === "aprovada" || suggestion.formula.status === "validada" ? (
                    <Badge className="border-emerald-500/25 bg-emerald-500/10 text-[11px] text-emerald-400 hover:bg-emerald-500/10">
                      <CheckCircle2 className="h-3 w-3" />
                      {suggestion.formula.status}
                    </Badge>
                  ) : null}
                </div>
              </button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function AssistantMetric({ label, value, className }: { label: string; value: number; className?: string }) {
  return (
    <div className={cn("rounded-lg border border-border/70 bg-card/60 px-3 py-2", className)}>
      <p className="font-mono text-lg font-semibold text-foreground">{value}</p>
      <p className="text-[11px] text-muted-foreground">{label}</p>
    </div>
  );
}
