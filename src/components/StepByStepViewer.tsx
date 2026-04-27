import { CheckCircle2, Clipboard, ClipboardCheck, ClipboardList, Download, FileText, Lightbulb, Sigma, type LucideIcon } from "lucide-react";
import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import { toast } from "sonner";
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

  const buildReportText = () => [
    "Relatorio tecnico i9TMG",
    `Data: ${new Date().toLocaleString("pt-BR")}`,
    `Formula: ${formula.name}`,
    `Setor: ${formula.sector}`,
    `Status da formula: ${formula.status}`,
    `Versao: ${formula.version}`,
    `Expressao: ${formula.expression}`,
    `Resultado: ${result}${formula.resultUnit ? ` ${formula.resultUnit}` : ""}`,
    "",
    "Entradas:",
    ...formula.variables.map((variable) => `${variable.name} = ${values[variable.name] || "0"} ${variable.unit}`.trim()),
    "",
    "Passo a passo:",
    ...steps.map((step, index) => `${index + 1}. ${step}`),
    "",
    "Observacao: validar criterios internos, normas aplicaveis e limites do equipamento antes de liberar para campo.",
  ].join("\n");

  const exportTextResult = () => {
    if (!result) return;
    const blob = new Blob([buildReportText()], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${formula.id}-resultado.txt`;
    anchor.click();
    URL.revokeObjectURL(url);
    toast.success("Relatorio TXT baixado.");
  };

  const printPdfReport = () => {
    if (!result) return;
    const reportRows = formula.variables
      .map(
        (variable) => `
          <tr>
            <td>${escapeHtml(variable.name)}</td>
            <td>${escapeHtml(variable.label)}</td>
            <td>${escapeHtml(values[variable.name] || "0")}</td>
            <td>${escapeHtml(variable.unit)}</td>
          </tr>
        `,
      )
      .join("");
    const stepRows = steps.map((step, index) => `<li>${index + 1}. ${escapeHtml(step)}</li>`).join("");
    const logoUrl = `${window.location.origin}/logo-i9tmg.png`;
    const html = `
      <!doctype html>
      <html lang="pt-BR">
        <head>
          <meta charset="utf-8" />
          <title>Relatorio i9TMG - ${escapeHtml(formula.name)}</title>
          <style>
            body { margin: 0; background: #f4f6f8; color: #102033; font-family: Arial, sans-serif; }
            main { max-width: 920px; margin: 0 auto; padding: 32px; }
            header { display: flex; align-items: center; justify-content: space-between; border-bottom: 4px solid #ff6a00; padding-bottom: 18px; }
            img { height: 54px; width: 54px; object-fit: contain; }
            h1 { margin: 0; color: #0A2540; font-size: 26px; }
            h2 { color: #0A2540; font-size: 18px; margin-top: 28px; }
            .meta { color: #53606f; font-size: 13px; margin-top: 6px; }
            .result { margin-top: 24px; border: 1px solid #d8dee8; background: #fff; padding: 20px; border-left: 6px solid #ff6a00; }
            .value { color: #ff6a00; font-size: 36px; font-weight: 700; font-family: Consolas, monospace; }
            table { border-collapse: collapse; width: 100%; background: #fff; }
            th, td { border: 1px solid #d8dee8; padding: 10px; text-align: left; font-size: 13px; }
            th { background: #0A2540; color: #fff; }
            li { margin: 8px 0; font-family: Consolas, monospace; }
            .note { margin-top: 26px; color: #53606f; font-size: 12px; }
            @media print { body { background: #fff; } main { padding: 0; } button { display: none; } }
          </style>
        </head>
        <body>
          <main>
            <header>
              <div>
                <h1>Relatorio tecnico i9TMG</h1>
                <div class="meta">${escapeHtml(new Date().toLocaleString("pt-BR"))}</div>
              </div>
              <img src="${escapeHtml(logoUrl)}" alt="i9TMG" />
            </header>
            <section class="result">
              <div class="meta">${escapeHtml(formula.sector)} - status ${escapeHtml(formula.status)} - versao ${formula.version}</div>
              <h2>${escapeHtml(formula.name)}</h2>
              <p>${escapeHtml(formula.description)}</p>
              <div class="value">${escapeHtml(result)} ${escapeHtml(formula.resultUnit)}</div>
              <div class="meta">${escapeHtml(formula.expression)}</div>
            </section>
            <h2>Entradas</h2>
            <table>
              <thead><tr><th>Variavel</th><th>Descricao</th><th>Valor</th><th>Unidade</th></tr></thead>
              <tbody>${reportRows}</tbody>
            </table>
            <h2>Passo a passo</h2>
            <ol>${stepRows}</ol>
            <p class="note">Validar criterios internos, normas aplicaveis e limites do equipamento antes de liberar para campo.</p>
          </main>
          <script>window.onload = () => window.print();</script>
        </body>
      </html>
    `;
    const frame = document.createElement("iframe");
    frame.style.position = "fixed";
    frame.style.right = "0";
    frame.style.bottom = "0";
    frame.style.width = "0";
    frame.style.height = "0";
    frame.style.border = "0";
    document.body.appendChild(frame);
    const doc = frame.contentWindow?.document;
    if (!doc) {
      exportTextResult();
      return;
    }
    doc.open();
    doc.write(html);
    doc.close();
    window.setTimeout(() => {
      frame.contentWindow?.focus();
      frame.contentWindow?.print();
      window.setTimeout(() => frame.remove(), 1200);
    }, 350);
    toast.success("Relatorio PDF aberto para impressao/salvar.");
  };

  return (
    <Card className="gradient-industrial glow-card h-full min-w-0 border-border/60">
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
                <p className="mt-2 break-words font-mono text-3xl font-semibold text-primary sm:text-4xl">{result}</p>
                {formula.resultUnit && <p className="mt-1 text-sm text-muted-foreground">{formula.resultUnit}</p>}
                <div className="mt-4 flex flex-wrap justify-center gap-2">
                  <Button type="button" size="sm" variant="outline" onClick={copyResult} className="border-primary/25 bg-background/30 text-foreground">
                    {copied ? <ClipboardCheck className="h-4 w-4 text-success" /> : <Clipboard className="h-4 w-4" />}
                    {copied ? "Copiado" : "Copiar"}
                  </Button>
                  <Button type="button" size="sm" variant="outline" onClick={printPdfReport} className="border-primary/25 bg-background/30 text-foreground">
                    <FileText className="h-4 w-4" />
                    PDF
                  </Button>
                  <Button type="button" size="sm" variant="outline" onClick={exportTextResult} className="border-primary/25 bg-background/30 text-foreground">
                    <Download className="h-4 w-4" />
                    TXT
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
                    <div key={variable.name} className="flex flex-col gap-1 rounded-md bg-muted/25 px-3 py-2 text-sm sm:flex-row sm:items-center sm:justify-between">
                      <span className="min-w-0 text-muted-foreground">{variable.label}</span>
                      <span className="font-mono text-foreground sm:text-right">
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

function escapeHtml(value: string | number) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
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
