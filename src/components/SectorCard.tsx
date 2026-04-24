import type { LucideIcon } from "lucide-react";
import { ArrowRight, Calculator } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { Sector } from "@/lib/industrial-data";

interface SectorCardProps {
  sector: Sector;
  icon: LucideIcon;
  index?: number;
  onOpen?: () => void;
}

export function SectorCard({ sector, icon: Icon, index = 0, onOpen }: SectorCardProps) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.06 }}>
      <Card className="gradient-industrial glow-card h-full border-border/60 transition-all duration-300 hover:-translate-y-1 hover:border-primary/35">
        <CardContent className="flex h-full flex-col p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div
                className="rounded-lg border p-3"
                style={{ borderColor: `${sector.color}55`, backgroundColor: `${sector.color}1f`, color: sector.color }}
              >
                <Icon className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">{sector.name}</h3>
                <p className="text-xs text-muted-foreground">{sector.trend} de uso no mes - {sector.usageLevel}</p>
              </div>
            </div>
            <div className="rounded-md border border-border bg-muted/25 px-2.5 py-1 font-mono text-sm text-foreground">
              {sector.formulas}
            </div>
          </div>

          <p className="mt-4 min-h-[72px] text-sm leading-relaxed text-muted-foreground">{sector.description}</p>

          <div className="mt-5 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Maturidade operacional</span>
              <span className="font-mono text-foreground">{sector.health}%</span>
            </div>
            <Progress value={sector.health} className="h-2 bg-muted" />
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="rounded-lg border border-border/70 bg-muted/20 p-3">
              <p className="text-xs text-muted-foreground">Formulas</p>
              <p className="mt-1 font-mono text-xl font-semibold text-foreground">{sector.formulas}</p>
            </div>
            <div className="rounded-lg border border-border/70 bg-muted/20 p-3">
              <p className="text-xs text-muted-foreground">Calculos</p>
              <p className="mt-1 font-mono text-xl font-semibold text-foreground">{sector.activeCalculations}</p>
            </div>
          </div>

          <Button
            type="button"
            onClick={onOpen}
            variant="outline"
            className="mt-5 border-border bg-muted/25 text-foreground hover:bg-primary hover:text-primary-foreground"
          >
            <Calculator className="h-4 w-4" />
            Abrir setor
            <ArrowRight className="h-4 w-4" />
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}
