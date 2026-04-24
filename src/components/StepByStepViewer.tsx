import { CheckCircle2, Clipboard, ClipboardCheck, ClipboardList, Download, Lightbulb, Sigma, type LucideIcon } from "lucide-react";
import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { buildCalculationSteps } from "@/lib/formula-engine";
import type { Formula } from "@/lib/industrial-data";

interface StepByStepViewerProps {
  formula: Formula;
  values: Record<string, string>;
  result: string | null;
}

export function StepByStepViewer({ formula, values, result }: StepByStepViewerProps) {
  const [copied, setCopied] = useState(false);
  const steps = useMemo(() => buildCalculationSteps(formula, values, result), [formula, result, values]);

  const resultText = result ? `${formula.name}: ${result}${formula.resultUnit ? ` ${formula.resultUnit}` : ""}` : "";

  const copyResult = async () => {
    if (!resultText) return;
    await navigator.clipboard.writeText(resultText);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  };

  const exportResult = () => {
    if (!result) return;
    const content = [
      "Resultado tecnico i9TMG",
      `Formula: ${formula.name}`,
      `Setor: ${formula.sector}`,
      `Expressao: ${formula.expression}`,
      `Resultado: ${result}${formula.resultUnit ? ` ${formula.resultUnit}` : ""}`,
      "",
      "Entradas:",
      ...formula.variables.map((variable) => `${variable.name} = ${values[variable.name] || "0"} ${variable.unit}`.trim()),
      "",
      "Passo a passo:",
      ...steps.map((step, index) => `${index + 1}. ${step}`),
    ].join("\n");
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${formula.id}-resultado.txt`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Card className="gradient-industrial glow-card h-full border-border/60">
      <CardHeader className="border-b border-border/70 p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Resultado tecnico</p>
        <CardTitle className="text-xl text-foreground">Analise e passo a passo</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {!result ? (
          <div className="flex min-h-[420px] items-center justify-center p-8 text-center">
            <div>
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg border border-border bg-muted/25 text-muted-foreground">
                <Sigma className="h-6 w-6" />
              </div>
              <p className="mt-4 text-sm font-medium text-foreground">Aguardando entrada</p>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                Preencha as variaveis do painel central para gerar resultado, substituicao e explicacao.
              </p>
            </div>
          </div>
        ) : (
          <ScrollArea className="h-[620px]">
            <div className="space-y-4 p-5">
              <div className="rounded-lg border border-primary/25 bg-primary/10 p-5 text-center">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Resultado</p>
                <p className="mt-2 font-mono text-4xl font-semibold text-primary">{result}</p>
                {formula.resultUnit && <p className="mt-1 text-sm text-muted-foreground">{formula.resultUnit}</p>}
                <div className="mt-4 flex justify-center gap-2">
                  <Button type="button" size="sm" variant="outline" onClick={copyResult} className="border-primary/25 bg-background/30 text-foreground">
                    {copied ? <ClipboardCheck className="h-4 w-4 text-success" /> : <Clipboard className="h-4 w-4" />}
                    {copied ? "Copiado" : "Copiar"}
                  </Button>
                  <Button type="button" size="sm" variant="outline" onClick={exportResult} className="border-primary/25 bg-background/30 text-foreground">
                    <Download className="h-4 w-4" />
                    Exportar
                  </Button>
                </div>
              </div>

              <Step title="1. Formula selecionada" icon={ClipboardList}>
                <p className="font-mono text-sm text-foreground">{steps[0]}</p>
              </Step>

              <Step title="2. Substituicao direta" icon={Sigma}>
                <p className="font-mono text-sm text-foreground">{steps[1]}</p>
                <div className="mt-3 space-y-2">
                  {formula.variables.map((variable) => (
                    <div key={variable.name} className="flex items-center justify-between gap-3 rounded-md bg-muted/25 px-3 py-2 text-sm">
                      <span className="min-w-0 truncate text-muted-foreground">{variable.label}</span>
                      <span className="shrink-0 font-mono text-foreground">
                        {variable.name} = {values[variable.name] || "0"} {variable.unit}
                      </span>
                    </div>
                  ))}
                </div>
              </Step>

              <Step title="3. Resultado final" icon={CheckCircle2}>
                <p className="font-mono text-sm text-foreground">{steps[2]}</p>
              </Step>

              <Step title="4. Interpretacao" icon={Lightbulb}>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {formula.simpleExplanation} Antes de liberar para campo, valide tolerancias, normas internas e limites do equipamento.
                </p>
              </Step>

              <div className="rounded-lg border border-warning/25 bg-warning/10 p-4">
                <div className="flex items-start gap-3">
                  <Lightbulb className="mt-0.5 h-4 w-4 text-warning" />
                  <p className="text-sm leading-relaxed text-muted-foreground">{formula.example}</p>
                </div>
              </div>
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}

function Step({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: LucideIcon;
  children: ReactNode;
}) {
  return (
    <div className="rounded-lg border border-border/70 bg-muted/20 p-4">
      <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
        <Icon className="h-4 w-4 text-primary" />
        {title}
      </div>
      {children}
    </div>
  );
}
