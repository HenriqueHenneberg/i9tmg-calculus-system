import type { LucideIcon } from "lucide-react";
import { ArrowRight, Calculator, Gauge } from "lucide-react";
import { motion } from "framer-motion";
import { Progress } from "@/components/ui/progress";
import type { Sector } from "@/lib/industrial-data";
import { getSectorBackgroundImage, getSectorVisual } from "@/lib/sector-visuals";

interface SectorCardProps {
  sector: Sector;
  icon: LucideIcon;
  index?: number;
  selected?: boolean;
  onOpen?: () => void;
  onPreview?: () => void;
}

export function SectorCard({ sector, icon: Icon, selected, onOpen, onPreview }: SectorCardProps) {
  const visual = getSectorVisual(sector.id);

  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.99 }}
      onClick={onOpen}
      onFocus={onPreview}
      onMouseEnter={onPreview}
      aria-label={`Abrir setor ${sector.name}`}
      className={`group relative flex min-h-[310px] w-full overflow-hidden rounded-lg border text-left shadow-[0_16px_40px_hsl(210_60%_4%/0.35)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_22px_55px_hsl(210_70%_3%/0.55)] ${
        selected ? "border-primary/55 ring-1 ring-primary/35" : "border-border/65 hover:border-primary/40"
      }`}
      style={{
        backgroundColor: "#0A2540",
      }}
    >
      <span
        className="absolute inset-0 scale-105 bg-cover bg-center opacity-45 blur-[1px] transition duration-500 group-hover:scale-110 group-hover:opacity-65"
        style={{ backgroundImage: getSectorBackgroundImage(visual), backgroundPosition: visual.focus }}
        aria-hidden="true"
      />
      <span
        className="absolute inset-0 bg-[linear-gradient(135deg,hsl(210_74%_10%/0.90),hsl(200_46%_15%/0.74)_55%,hsl(24_100%_50%/0.20))]"
        aria-hidden="true"
      />
      <span
        className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-background/75 to-transparent"
        aria-hidden="true"
      />

      <span className="relative flex h-full w-full flex-col p-5">
        <span className="flex items-start justify-between gap-4">
          <span className="flex min-w-0 items-center gap-3">
            <span
              className="rounded-lg border p-3 shadow-[0_0_28px_hsl(24_100%_50%/0.18)]"
              style={{ borderColor: `${sector.color}66`, backgroundColor: `${sector.color}25`, color: sector.color }}
            >
              <Icon className="h-6 w-6" />
            </span>
            <span className="min-w-0">
              <span className="block text-base font-semibold leading-snug text-foreground [overflow-wrap:normal] [word-break:normal]">{sector.name}</span>
              <span className="mt-1 block text-xs text-muted-foreground">{visual.keyword}</span>
            </span>
          </span>
          <span className="rounded-md border border-white/15 bg-background/35 px-2.5 py-1 font-mono text-sm text-foreground">
            {sector.formulas}
          </span>
        </span>

        <span className="mt-5 block min-h-[78px] text-sm leading-relaxed text-muted-foreground">{sector.description}</span>

        <span className="mt-auto grid grid-cols-2 gap-3">
          <span className="rounded-lg border border-white/10 bg-background/35 p-3">
            <span className="flex items-center gap-2 text-xs text-muted-foreground">
              <Calculator className="h-3.5 w-3.5 text-primary" />
              Calculos
            </span>
            <span className="mt-1 block font-mono text-xl font-semibold text-foreground">{sector.activeCalculations}</span>
          </span>
          <span className="rounded-lg border border-white/10 bg-background/35 p-3">
            <span className="flex items-center gap-2 text-xs text-muted-foreground">
              <Gauge className="h-3.5 w-3.5 text-primary" />
              Uso
            </span>
            <span className="mt-1 block truncate text-sm font-semibold text-foreground">{sector.usageLevel}</span>
          </span>
        </span>

        <span className="mt-4 space-y-2">
          <span className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Maturidade operacional</span>
            <span className="font-mono text-foreground">{sector.health}%</span>
          </span>
          <Progress value={sector.health} className="h-2 bg-background/45" />
        </span>

        <span className="mt-5 flex items-center justify-between rounded-lg border border-primary/25 bg-primary/10 px-3 py-2 text-sm font-semibold text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
          Abrir setor
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </span>
      </span>
    </motion.button>
  );
}
