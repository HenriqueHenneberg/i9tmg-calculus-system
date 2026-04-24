import {
  BadgeCheck,
  BarChart3,
  BatteryCharging,
  Building2,
  CalendarClock,
  Cpu,
  Droplets,
  Gauge,
  ShieldCheck,
  SlidersHorizontal,
  Thermometer,
  Truck,
  Wrench,
  Zap,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { SectorCard } from "@/components/SectorCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useIndustrialWorkspace } from "@/contexts/IndustrialWorkspaceContext";
import type { SectorId } from "@/lib/industrial-data";

const sectorIcons = {
  mecanica: Wrench,
  eletrica: Zap,
  hidraulica: Droplets,
  producao: BarChart3,
  pneumatica: Gauge,
  estrutural: Building2,
  termodinamica: Thermometer,
  instrumentacao: SlidersHorizontal,
  automacao: Cpu,
  manutencao: ShieldCheck,
  logistica: Truck,
  qualidade: BadgeCheck,
  planejamento: CalendarClock,
  energia: BatteryCharging,
};

export default function Setores() {
  const navigate = useNavigate();
  const { formulas, sectors } = useIndustrialWorkspace();
  const [selectedSector, setSelectedSector] = useState<SectorId>("mecanica");

  const activeSector = sectors.find((sector) => sector.id === selectedSector) || sectors[0];
  const sectorFormulas = useMemo(
    () => formulas.filter((formula) => formula.sectorId === activeSector.id),
    [activeSector.id, formulas],
  );

  return (
    <div className="mx-auto flex w-full max-w-[1500px] flex-col gap-6">
      <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <Badge className="border-primary/25 bg-primary/15 text-primary hover:bg-primary/15">Mapa operacional</Badge>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground">Setores</h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Organize calculos por area industrial e acompanhe volume, maturidade e formulas disponiveis.
          </p>
        </div>
        <Button
          type="button"
          onClick={() => navigate("/calculos")}
          className="h-11 bg-primary text-primary-foreground glow-primary hover:bg-highlight-glow"
        >
          Abrir console de calculos
        </Button>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {sectors.map((sector, index) => (
          <div key={sector.id} onClick={() => setSelectedSector(sector.id)} className="cursor-pointer">
            <SectorCard sector={sector} icon={sectorIcons[sector.id]} index={index} onOpen={() => navigate("/calculos")} />
          </div>
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
        <Card className="gradient-industrial glow-card border-border/60">
          <CardHeader className="border-b border-border/70 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Setor selecionado</p>
            <CardTitle className="mt-1 flex items-center gap-3 text-xl text-foreground">
              {(() => {
                const Icon = sectorIcons[activeSector.id];
                return <Icon className="h-5 w-5 text-primary" />;
              })()}
              {activeSector.name}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5 p-5">
            <p className="text-sm leading-relaxed text-muted-foreground">{activeSector.description}</p>
            <div className="grid grid-cols-3 gap-3">
              <Metric label="Formulas" value={activeSector.formulas} />
              <Metric label="Calculos" value={activeSector.activeCalculations} />
              <Metric label="Uso" value={activeSector.usageLevel} />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Maturidade tecnica</span>
                <span className="font-mono text-foreground">{activeSector.health}%</span>
              </div>
              <Progress value={activeSector.health} className="h-2 bg-muted" />
            </div>
          </CardContent>
        </Card>

        <Card className="gradient-industrial glow-card border-border/60">
          <CardHeader className="border-b border-border/70 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Formulas do setor</p>
            <CardTitle className="mt-1 text-xl text-foreground">Biblioteca aplicada</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 p-5 md:grid-cols-2">
            {sectorFormulas.map((formula) => (
              <button
                type="button"
                key={formula.id}
                onClick={() => navigate("/calculos")}
                className="rounded-lg border border-border/70 bg-muted/20 p-4 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/35 hover:bg-muted/35"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-foreground">{formula.name}</p>
                    <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-muted-foreground">{formula.description}</p>
                  </div>
                  <Badge variant="outline" className="border-primary/25 bg-primary/10 text-primary">
                    {formula.difficulty}
                  </Badge>
                </div>
                <p className="mt-3 rounded-md border border-primary/20 bg-primary/10 px-3 py-2 font-mono text-sm text-primary">
                  {formula.expression}
                </p>
              </button>
            ))}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-border/70 bg-muted/20 p-3">
      <p className="font-mono text-xl font-semibold text-foreground">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}
