import { Bell, Moon, Save, ShieldCheck, SlidersHorizontal, Sun, type LucideIcon } from "lucide-react";
import { useState } from "react";
import type { ReactNode } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useIndustrialWorkspace } from "@/contexts/IndustrialWorkspaceContext";

export default function Configuracoes() {
  const { userName, setUserName, sectors } = useIndustrialWorkspace();
  const [precision, setPrecision] = useState([4]);
  const [compactMode, setCompactMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [darkTheme, setDarkTheme] = useState(true);

  return (
    <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-6">
      <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <Badge className="border-primary/25 bg-primary/15 text-primary hover:bg-primary/15">Preferencias</Badge>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground">Configuracoes</h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Ajuste perfil, tema visual e padroes de calculo para o fluxo tecnico da equipe.
          </p>
        </div>
        <Button type="button" className="h-11 bg-primary text-primary-foreground glow-primary hover:bg-highlight-glow">
          <Save className="h-4 w-4" />
          Salvar preferencias
        </Button>
      </section>

      <Tabs defaultValue="perfil" className="space-y-4">
        <TabsList className="grid h-auto w-full max-w-xl grid-cols-3 bg-muted/25 p-1">
          <TabsTrigger value="perfil">Perfil</TabsTrigger>
          <TabsTrigger value="tema">Tema</TabsTrigger>
          <TabsTrigger value="preferencias">Preferencias</TabsTrigger>
        </TabsList>

        <TabsContent value="perfil" className="mt-0">
          <div className="grid gap-4 lg:grid-cols-[340px_1fr]">
            <Card className="gradient-industrial glow-card border-border/60">
              <CardContent className="flex flex-col items-center p-6 text-center">
                <Avatar className="h-20 w-20 border border-primary/35 bg-primary/15">
                  <AvatarFallback className="bg-primary/15 text-xl font-semibold text-primary">IM</AvatarFallback>
                </Avatar>
                <h2 className="mt-4 text-xl font-semibold text-foreground">{userName || "i9TMG Master"}</h2>
                <p className="text-sm text-muted-foreground">Engenharia Industrial</p>
                <Badge variant="outline" className="mt-4 border-success/25 bg-success/10 text-success">
                  Acesso tecnico validado
                </Badge>
                <Separator className="my-5 bg-border" />
                <div className="grid w-full grid-cols-2 gap-3">
                  <Metric label="Perfis" value="3" />
                  <Metric label="Projetos" value="18" />
                </div>
              </CardContent>
            </Card>

            <Card className="gradient-industrial glow-card border-border/60">
              <CardHeader className="border-b border-border/70 p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Perfil do usuario</p>
                <CardTitle className="mt-1 text-xl text-foreground">Dados operacionais</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 p-5 md:grid-cols-2">
                <Field label="Nome">
                  <Input value={userName} onChange={(event) => setUserName(event.target.value)} className="border-border bg-muted/25 text-foreground" />
                </Field>
                <Field label="Cargo">
                  <Input defaultValue="Engenharia Industrial" className="border-border bg-muted/25 text-foreground" />
                </Field>
                <Field label="E-mail">
                  <Input defaultValue="engenharia@i9tmg.com.br" className="border-border bg-muted/25 text-foreground" />
                </Field>
                <Field label="Unidade">
                  <Select defaultValue="planta-01">
                    <SelectTrigger className="border-border bg-muted/25 text-foreground">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="planta-01">Planta 01</SelectItem>
                      <SelectItem value="planta-02">Planta 02</SelectItem>
                      <SelectItem value="laboratorio">Laboratorio tecnico</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="tema" className="mt-0">
          <div className="grid gap-4 lg:grid-cols-2">
            <Card className="gradient-industrial glow-card border-border/60">
              <CardHeader className="border-b border-border/70 p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Tema</p>
                <CardTitle className="mt-1 text-xl text-foreground">Identidade visual</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5 p-5">
                <SettingRow
                  icon={darkTheme ? Moon : Sun}
                  title="Tema industrial escuro"
                  description="Mantem fundo #0A2540 e contraste alto para salas de controle."
                  control={<Switch checked={darkTheme} onCheckedChange={setDarkTheme} />}
                />
                <SettingRow
                  icon={SlidersHorizontal}
                  title="Modo compacto"
                  description="Reduz espacamentos em tabelas e paineis de uso recorrente."
                  control={<Switch checked={compactMode} onCheckedChange={setCompactMode} />}
                />
                <div className="grid grid-cols-4 gap-3">
                  <Swatch label="Fundo" className="bg-[#0A2540]" />
                  <Swatch label="Container" className="bg-[#112D44]" />
                  <Swatch label="Petroleo" className="bg-[#163B4F]" />
                  <Swatch label="Destaque" className="bg-[#ff6a00]" />
                </div>
              </CardContent>
            </Card>

            <Card className="gradient-industrial glow-card border-border/60">
              <CardHeader className="border-b border-border/70 p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Preview</p>
                <CardTitle className="mt-1 text-xl text-foreground">Cartao de calculo</CardTitle>
              </CardHeader>
              <CardContent className="p-5">
                <div className="rounded-lg border border-primary/25 bg-primary/10 p-5">
                  <p className="text-xs uppercase tracking-[0.16em] text-primary">Resultado</p>
                  <p className="mt-3 font-mono text-4xl font-semibold text-primary">45.0000</p>
                  <p className="text-sm text-muted-foreground">N.m</p>
                  <div className="mt-5 rounded-lg border border-border/70 bg-background/45 p-4">
                    <p className="font-mono text-sm text-foreground">T = F x d</p>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      Interface com foco em leitura tecnica, estados claros e contraste para turnos longos.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="preferencias" className="mt-0">
          <Card className="gradient-industrial glow-card border-border/60">
            <CardHeader className="border-b border-border/70 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Padroes de calculo</p>
              <CardTitle className="mt-1 text-xl text-foreground">Preferencias tecnicas</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-5 p-5 lg:grid-cols-2">
              <div className="space-y-5">
                <SettingRow
                  icon={Bell}
                  title="Alertas de validacao"
                  description="Exibe aviso quando resultado exige revisao ou tolerancia adicional."
                  control={<Switch checked={notifications} onCheckedChange={setNotifications} />}
                />
                <SettingRow
                  icon={ShieldCheck}
                  title="Salvar historico automaticamente"
                  description="Registra calculos concluidos para rastreabilidade."
                  control={<Switch defaultChecked />}
                />
                <Field label="Setor padrao">
                  <Select defaultValue="mecanica">
                    <SelectTrigger className="border-border bg-muted/25 text-foreground">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mecanica">Mecanica</SelectItem>
                      {sectors.filter((sector) => sector.id !== "mecanica").map((sector) => (
                        <SelectItem key={sector.id} value={sector.id}>
                          {sector.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              </div>

              <div className="rounded-lg border border-border/70 bg-muted/20 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-foreground">Precisao numerica</p>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                      Casas decimais exibidas em resultados e tabelas.
                    </p>
                  </div>
                  <span className="rounded-md border border-primary/25 bg-primary/10 px-3 py-1 font-mono text-sm text-primary">
                    {precision[0]}
                  </span>
                </div>
                <Slider value={precision} max={8} min={1} step={1} onValueChange={setPrecision} className="mt-8" />
                <div className="mt-8 rounded-lg border border-border/70 bg-background/45 p-4">
                  <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Exemplo</p>
                  <p className="mt-2 font-mono text-2xl font-semibold text-foreground">
                    {(45).toFixed(precision[0])} N.m
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
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

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border/70 bg-muted/20 p-3">
      <p className="font-mono text-xl font-semibold text-foreground">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

function SettingRow({
  icon: Icon,
  title,
  description,
  control,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  control: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border border-border/70 bg-muted/20 p-4">
      <div className="flex items-start gap-3">
        <div className="rounded-md border border-primary/25 bg-primary/10 p-2 text-primary">
          <Icon className="h-4 w-4" />
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">{title}</p>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{description}</p>
        </div>
      </div>
      {control}
    </div>
  );
}

function Swatch({ label, className }: { label: string; className: string }) {
  return (
    <div className="rounded-lg border border-border/70 bg-muted/20 p-3">
      <div className={`h-10 rounded-md border border-white/10 ${className}`} />
      <p className="mt-2 text-xs text-muted-foreground">{label}</p>
    </div>
  );
}
