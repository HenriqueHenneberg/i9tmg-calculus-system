import { Calculator, ChevronRight, Star } from "lucide-react";
import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { Formula, FormulaStatus } from "@/lib/industrial-data";

interface FormulaCardProps {
  formula: Formula;
  selected?: boolean;
  compact?: boolean;
  favorite?: boolean;
  onClick?: () => void;
  children?: ReactNode;
}

export function FormulaCard({ formula, selected, compact, favorite, onClick, children }: FormulaCardProps) {
  const content = (
    <Card
      className={cn(
        "border-border/60 bg-card/70 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/35 hover:bg-muted/35",
        selected && "border-primary/50 bg-primary/10 shadow-[0_0_0_1px_hsl(var(--primary)/0.25)]",
      )}
    >
      <CardContent className={cn("p-4", compact && "p-3")}>
        <div className="flex items-start gap-3">
          <div
            className={cn(
              "mt-0.5 rounded-md border p-2",
              selected ? "border-primary/35 bg-primary/15 text-primary" : "border-border bg-muted/35 text-muted-foreground",
            )}
          >
            <Calculator className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-3">
              <p className="truncate text-sm font-semibold text-foreground">{formula.name}</p>
              <div className="flex shrink-0 items-center gap-2">
                {favorite && <Star className="h-3.5 w-3.5 fill-primary text-primary" />}
                {onClick && <ChevronRight className={cn("h-4 w-4 text-muted-foreground", selected && "text-primary")} />}
              </div>
            </div>
            {!compact && <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">{formula.description}</p>}
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="border-primary/25 bg-primary/10 text-primary">
                {formula.sector}
              </Badge>
              <Badge variant="outline" className="border-border bg-muted/30 text-muted-foreground">
                {formula.difficulty}
              </Badge>
              <Badge variant="outline" className="border-border bg-muted/30 text-muted-foreground">
                {formula.usageCount} usos
              </Badge>
              <Badge variant="outline" className={statusClasses[formula.status]}>
                {statusLabels[formula.status]}
              </Badge>
              <span className="font-mono text-xs text-muted-foreground">{formula.expression}</span>
            </div>
            {!compact && formula.tags.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {formula.tags.slice(0, 4).map((tag) => (
                  <span key={tag} className="rounded-md border border-border/70 bg-muted/20 px-2 py-1 text-[11px] text-muted-foreground">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
        {children && <div className="mt-4 border-t border-border/70 pt-4">{children}</div>}
      </CardContent>
    </Card>
  );

  if (!onClick) {
    return content;
  }

  return (
    <button type="button" onClick={onClick} className="w-full text-left">
      {content}
    </button>
  );
}

const statusLabels: Record<FormulaStatus, string> = {
  rascunho: "Rascunho",
  em_revisao: "Em revisao",
  validada: "Validada",
  aprovada: "Aprovada",
  arquivada: "Arquivada",
};

const statusClasses: Record<FormulaStatus, string> = {
  rascunho: "border-muted-foreground/25 bg-muted/20 text-muted-foreground",
  em_revisao: "border-warning/25 bg-warning/10 text-warning",
  validada: "border-info/25 bg-info/10 text-info",
  aprovada: "border-success/25 bg-success/10 text-success",
  arquivada: "border-destructive/25 bg-destructive/10 text-destructive",
};
