import {
  BadgeCheck,
  BarChart3,
  BatteryCharging,
  Building2,
  CalendarClock,
  Cpu,
  Droplets,
  Factory,
  FileSpreadsheet,
  Gauge,
  ShieldCheck,
  SlidersHorizontal,
  Thermometer,
  Truck,
  Wrench,
  Zap,
} from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { SectorCard } from "@/components/SectorCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { useIndustrialWorkspace } from "@/contexts/IndustrialWorkspaceContext";
import type { SectorId, UsageLevel } from "@/lib/industrial-data";
import { adminOnlyMessage, canCreateSector } from "@/lib/permissions";
import { getSectorVisual } from "@/lib/sector-visuals";

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
  equipamentos_mistura_90: FileSpreadsheet,
  elevadores_mistura_90: Factory,
};

export default function Setores() {
  const navigate = useNavigate();
  const { role } = useAuth();
  const { formulas, sectors, saveSector } = useIndustrialWorkspace();
  const admin = canCreateSector(role);
  const [selectedSector, setSelectedSector] = useState<SectorId>("mecanica");
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [sectorDraft, setSectorDraft] = useState({
    name: "",
    description: "",
    color: "#ff6a00",
    usageLevel: "Moderado" as UsageLevel,
    health: 70,
  });

  const activeSector = sectors.find((sector) => sector.id === selectedSector) || sectors[0];
  const activeVisual = getSectorVisual(activeSector.id);
  const sectorFormulas = useMemo(
    () => formulas.filter((formula) => formula.sectorId === activeSector.id),
    [activeSector.id, formulas],
  );

  const editSector = () => {
    if (!admin) {
      toast.error(adminOnlyMessage());
      return;
    }
    setSectorDraft({
      name: activeSector.name,
      description: activeSector.description,
      color: activeSector.color,
      usageLevel: activeSector.usageLevel,
      health: activeSector.health,
    });
    setEditDialogOpen(true);
  };

  const saveSectorEdit = () => {
    if (!sectorDraft.name.trim()) {
      toast.error("Informe o nome do setor.");
      return;
    }
    saveSector({
      ...activeSector,
      name: sectorDraft.name.trim(),
      description: sectorDraft.description.trim(),
      color: sectorDraft.color,
      usageLevel: sectorDraft.usageLevel,
      health: sectorDraft.health,
    });
    setEditDialogOpen(false);
    toast.success("Setor atualizado.");
  };

  return (
    <div className="mx-auto flex w-full max-w-[1500px] flex-col gap-6">
      <section className="relative overflow-hidden rounded-lg border border-primary/25 bg-card/60 p-5 glow-card">
        <div
          className="absolute inset-0 scale-105 bg-cover bg-center opacity-20 blur-sm"
          style={{ backgroundImage: `url(${activeVisual.image})`, backgroundPosition: activeVisual.focus }}
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-[linear-gradient(135deg,hsl(var(--background)/0.96),hsl(var(--card)/0.86)_58%,hsl(var(--primary)/0.12))]" aria-hidden="true" />
        <div className="relative flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <Badge className="border-primary/25 bg-primary/15 text-primary hover:bg-primary/15">Mapa operacional i9TMG</Badge>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground md:text-4xl">Mapa de setores i9TMG</h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Cada card abre a biblioteca daquele setor. Passe o mouse para ver a previa tecnica e entre no fluxo de trabalho.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
        <Button
          type="button"
          onClick={() => navigate(`/calculos?sector=${activeSector.id}`)}
          className="h-11 bg-primary text-primary-foreground glow-primary hover:bg-highlight-glow"
        >
          Abrir {activeSector.name}
        </Button>
        {admin && (
          <Button
            type="button"
            variant="outline"
            onClick={editSector}
            className="h-11 border-border bg-muted/25 text-foreground hover:bg-muted/50"
          >
            Editar setor selecionado
          </Button>
        )}
        </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {sectors.map((sector, index) => (
          <SectorCard
            key={sector.id}
            sector={sector}
            selected={activeSector.id === sector.id}
            icon={sectorIcons[sector.id as keyof typeof sectorIcons] || Factory}
            index={index}
            onPreview={() => setSelectedSector(sector.id)}
            onOpen={() => navigate(`/calculos?sector=${sector.id}`)}
          />
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
        <Card className="relative overflow-hidden border-border/60 bg-card/70 glow-card">
          <div
            className="absolute inset-0 scale-105 bg-cover bg-center opacity-20 blur-sm"
            style={{ backgroundImage: `url(${activeVisual.image})`, backgroundPosition: activeVisual.focus }}
            aria-hidden="true"
          />
          <div className="absolute inset-0 bg-[linear-gradient(135deg,hsl(var(--card)/0.94),hsl(var(--surface-elevated)/0.82))]" aria-hidden="true" />
          <div className="relative">
          <CardHeader className="border-b border-border/70 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Setor selecionado</p>
            <CardTitle className="mt-1 flex items-center gap-3 text-xl text-foreground">
              {(() => {
                const Icon = sectorIcons[activeSector.id as keyof typeof sectorIcons] || Factory;
                return <Icon className="h-5 w-5 text-primary" />;
              })()}
              {activeSector.name}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5 p-5">
            <p className="text-sm leading-relaxed text-muted-foreground">{activeSector.description}</p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
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
          </div>
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
                onClick={() => navigate(`/calculos?formula=${formula.id}&sector=${formula.sectorId}`)}
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

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-xl border-border bg-background text-foreground">
          <DialogHeader>
            <DialogTitle>Editar setor selecionado</DialogTitle>
            <DialogDescription>
              Ajuste descricao, cor, nivel de uso e maturidade sem alterar os calculos cadastrados.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <Field label="Nome">
              <Input
                value={sectorDraft.name}
                onChange={(event) => setSectorDraft((current) => ({ ...current, name: event.target.value }))}
                className="border-border bg-muted/25 text-foreground"
              />
            </Field>
            <Field label="Descricao">
              <Textarea
                value={sectorDraft.description}
                onChange={(event) => setSectorDraft((current) => ({ ...current, description: event.target.value }))}
                className="min-h-[120px] border-border bg-muted/25 text-foreground"
              />
            </Field>
            <div className="grid gap-4 sm:grid-cols-[1fr_120px]">
              <Field label="Nivel de uso">
                <Select
                  value={sectorDraft.usageLevel}
                  onValueChange={(usageLevel) => setSectorDraft((current) => ({ ...current, usageLevel: usageLevel as UsageLevel }))}
                >
                  <SelectTrigger className="border-border bg-muted/25 text-foreground">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Baixo">Baixo</SelectItem>
                    <SelectItem value="Moderado">Moderado</SelectItem>
                    <SelectItem value="Alto">Alto</SelectItem>
                    <SelectItem value="Critico">Critico</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Cor">
                <Input
                  type="color"
                  value={sectorDraft.color}
                  onChange={(event) => setSectorDraft((current) => ({ ...current, color: event.target.value }))}
                  className="h-10 border-border bg-muted/25 p-1"
                />
              </Field>
            </div>
            <Field label="Maturidade tecnica">
              <Input
                type="number"
                min={0}
                max={100}
                value={sectorDraft.health}
                onChange={(event) =>
                  setSectorDraft((current) => ({
                    ...current,
                    health: Math.min(100, Math.max(0, Number(event.target.value) || 0)),
                  }))
                }
                className="border-border bg-muted/25 text-foreground"
              />
            </Field>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setEditDialogOpen(false)} className="border-border bg-muted/25 text-foreground">
              Cancelar
            </Button>
            <Button type="button" onClick={saveSectorEdit} className="bg-primary text-primary-foreground hover:bg-highlight-glow">
              Salvar setor
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="space-y-2">
      <Label className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">{label}</Label>
      {children}
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
