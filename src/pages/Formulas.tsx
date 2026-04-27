import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import { Archive, CheckCircle2, Copy, Edit3, Eye, FlaskConical, Plus, Save, Search, Send, Sparkles, Trash2, Variable } from "lucide-react";
import { toast } from "sonner";
import { FormulaCard } from "@/components/FormulaCard";
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
import { ScrollArea } from "@/components/ui/scroll-area";
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
import { evaluateFormula, formatFormulaForDisplay, validateFormula } from "@/lib/formula-engine";
import type { Difficulty, Formula, FormulaStatus, SectorId } from "@/lib/industrial-data";
import { adminOnlyMessage, canApproveFormula, canCreateFormula, canCreateSector, canEditFormula } from "@/lib/permissions";

interface VariableDraft {
  id: string;
  name: string;
  label: string;
  unit: string;
  placeholder: string;
}

interface FormulaDraft {
  name: string;
  sectorId: SectorId;
  expression: string;
  resultUnit: string;
  description: string;
  example: string;
  simpleExplanation: string;
  technicalNotes: string;
  difficulty: Difficulty;
  status: FormulaStatus;
  tags: string;
  variables: VariableDraft[];
}

const emptyDraft: FormulaDraft = {
  name: "",
  sectorId: "mecanica",
  expression: "",
  resultUnit: "",
  description: "",
  example: "",
  simpleExplanation: "",
  technicalNotes: "",
  difficulty: "Intermediaria",
  status: "rascunho",
  tags: "",
  variables: [{ id: "1", name: "", label: "", unit: "", placeholder: "" }],
};

const variableSuggestions = ["F", "r", "P", "Q", "T", "V", "I", "FP", "eta", "rho", "sigma", "A", "L", "D", "t", "n"];

const statusLabels: Record<FormulaStatus, string> = {
  rascunho: "Rascunho",
  em_revisao: "Em revisao",
  validada: "Validada",
  aprovada: "Aprovada",
  arquivada: "Arquivada",
};

export default function Formulas() {
  const { role, user } = useAuth();
  const {
    formulas,
    sectors,
    saveSector,
    saveFormula,
    duplicateFormula,
    removeFormula,
    updateFormulaStatus,
    isFavorite,
  } = useIndustrialWorkspace();
  const admin = canApproveFormula(role);
  const [search, setSearch] = useState("");
  const [sectorFilter, setSectorFilter] = useState<SectorId | "todos">("todos");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<FormulaDraft>(emptyDraft);
  const [submitted, setSubmitted] = useState(false);

  const filteredItems = useMemo(() => {
    const term = search.toLowerCase();
    return formulas.filter((formula) => {
      const searchable = [
        formula.name,
        formula.sector,
        formula.expression,
        formula.description,
        formula.tags.join(" "),
        formula.variables.map((variable) => `${variable.name} ${variable.label}`).join(" "),
      ]
        .join(" ")
        .toLowerCase();
      const matchSearch = searchable.includes(term);
      const matchSector = sectorFilter === "todos" || formula.sectorId === sectorFilter;
      return matchSearch && matchSector;
    });
  }, [formulas, search, sectorFilter]);

  const selectedSector = sectors.find((sector) => sector.id === draft.sectorId) || sectors[0];
  const validVariables = draft.variables.filter((variable) => variable.name.trim());
  const validation = useMemo(
    () => validateFormula(draft.expression, validVariables.map((variable) => variable.name)),
    [draft.expression, validVariables],
  );
  const hasRequiredFields = Boolean(
    draft.name && draft.expression && draft.description && draft.example && draft.simpleExplanation && validVariables.length > 0,
  );
  const canSave = hasRequiredFields && validation.valid;
  const previewValues = useMemo(
    () => Object.fromEntries(validVariables.map((variable) => [variable.name.trim(), variable.placeholder || "1"])),
    [validVariables],
  );
  const previewFormula = useMemo<Formula | null>(() => {
    if (!draft.expression || validVariables.length === 0) return null;
    return {
      id: editingId || "preview",
      name: draft.name || "Preview",
      sectorId: draft.sectorId,
      sector: selectedSector?.name || "Setor",
      expression: draft.expression,
      resultUnit: draft.resultUnit,
      description: draft.description || "Formula em edicao.",
      variables: validVariables.map((variable) => ({
        name: variable.name.trim(),
        label: variable.label.trim() || variable.name.trim(),
        unit: variable.unit.trim(),
        placeholder: variable.placeholder.trim() || "1",
      })),
      difficulty: draft.difficulty,
      usageCount: 0,
      example: draft.example,
      simpleExplanation: draft.simpleExplanation,
      tags: draft.tags.split(",").map((tag) => tag.trim()).filter(Boolean),
      status: draft.status,
      createdBy: user?.name || "Preview",
      createdAt: new Date().toISOString(),
      version: 1,
      technicalNotes: draft.technicalNotes,
    };
  }, [draft, editingId, selectedSector?.name, user?.name, validVariables]);
  const previewResult = useMemo(() => {
    if (!previewFormula || !validation.valid) return null;
    try {
      const calculated = evaluateFormula(previewFormula, previewValues);
      return Number.isFinite(calculated) ? calculated.toFixed(4) : null;
    } catch {
      return null;
    }
  }, [previewFormula, previewValues, validation.valid]);

  const openCreateDialog = () => {
    setDraft({ ...emptyDraft, variables: [{ id: Date.now().toString(), name: "", label: "", unit: "", placeholder: "" }] });
    setEditingId(null);
    setSubmitted(false);
    setDialogOpen(true);
  };

  const openEditDialog = (formula: Formula) => {
    setDraft({
      name: formula.name,
      sectorId: formula.sectorId,
      expression: formula.expression,
      resultUnit: formula.resultUnit,
      description: formula.description,
      example: formula.example,
      simpleExplanation: formula.simpleExplanation,
      technicalNotes: formula.technicalNotes || "",
      difficulty: formula.difficulty,
      status: formula.status,
      tags: formula.tags.join(", "),
      variables: formula.variables.map((variable, index) => ({
        id: `${formula.id}-${index}`,
        name: variable.name,
        label: variable.label,
        unit: variable.unit,
        placeholder: variable.placeholder || "",
      })),
    });
    setEditingId(formula.id);
    setSubmitted(false);
    setDialogOpen(true);
  };

  const updateDraft = <K extends keyof Omit<FormulaDraft, "variables">>(field: K, value: FormulaDraft[K]) => {
    setDraft((current) => ({ ...current, [field]: value }));
  };

  const updateVariable = (id: string, field: keyof VariableDraft, value: string) => {
    setDraft((current) => ({
      ...current,
      variables: current.variables.map((variable) => (variable.id === id ? { ...variable, [field]: value } : variable)),
    }));
  };

  const addVariable = (name = "") => {
    setDraft((current) => {
      if (name && current.variables.some((variable) => variable.name === name)) return current;
      return {
        ...current,
        variables: [
          ...current.variables,
          { id: `${Date.now()}-${name || current.variables.length}`, name, label: name ? `Variavel ${name}` : "", unit: "", placeholder: "" },
        ],
      };
    });
  };

  const removeVariable = (id: string) => {
    setDraft((current) => ({
      ...current,
      variables: current.variables.length === 1 ? current.variables : current.variables.filter((variable) => variable.id !== id),
    }));
  };

  const saveDraft = () => {
    setSubmitted(true);
    if (!canSave) {
      toast.error(validation.error || "Complete os campos obrigatorios antes de salvar.");
      return;
    }

    const existing = formulas.find((item) => item.id === editingId);
    if (!canCreateFormula(role)) {
      toast.error(adminOnlyMessage());
      return;
    }

    const nextStatus = draft.status;
    const formula: Formula = {
      id: editingId || `custom-${Date.now()}`,
      name: draft.name.trim(),
      sectorId: draft.sectorId,
      sector: selectedSector.name,
      expression: draft.expression.trim(),
      resultUnit: draft.resultUnit.trim(),
      description: draft.description.trim(),
      example: draft.example.trim(),
      simpleExplanation: draft.simpleExplanation.trim(),
      technicalNotes: draft.technicalNotes.trim(),
      difficulty: draft.difficulty,
      status: nextStatus,
      createdBy: existing?.createdBy || user?.name || "Operador",
      approvedBy: nextStatus === "validada" || nextStatus === "aprovada" ? user?.name || "Administrador i9TMG" : existing?.approvedBy,
      createdAt: existing?.createdAt || new Date().toISOString(),
      approvedAt: nextStatus === "validada" || nextStatus === "aprovada" ? new Date().toISOString() : existing?.approvedAt,
      version: existing ? existing.version + 1 : 1,
      usageCount: existing?.usageCount || 0,
      isCustom: existing?.isCustom ?? !editingId,
      tags: draft.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
      variables: validVariables.map((variable) => ({
        name: variable.name.trim(),
        label: variable.label.trim() || variable.name.trim(),
        unit: variable.unit.trim(),
        placeholder: variable.placeholder.trim(),
      })),
    };

    saveFormula(formula);
    setDialogOpen(false);
    toast.success("Formula salva e liberada no console de calculos.");
  };

  const handleRemoveFormula = (id: string) => {
    const removed = removeFormula(id);
    if (removed) {
      toast.success("Formula personalizada removida.");
      return;
    }
    toast.error("Formulas nativas ficam protegidas. Duplique antes de alterar livremente.");
  };

  const setStatus = (formula: Formula, status: FormulaStatus) => {
    if (!canApproveFormula(role)) {
      toast.error(adminOnlyMessage());
      return;
    }
    updateFormulaStatus(formula.id, status, user?.name);
    toast.success(`Status atualizado para ${statusLabels[status]}.`);
  };

  const guardedEdit = (formula: Formula) => {
    if (!canEditFormula(role)) {
      toast.error(adminOnlyMessage());
      return;
    }
    openEditDialog(formula);
  };

  const requestNewSector = () => {
    if (!canCreateSector(role)) {
      toast.error(adminOnlyMessage());
      return;
    }
    const name = window.prompt("Nome do novo setor");
    if (!name?.trim()) return;
    const description = window.prompt("Descricao tecnica do setor") || "Setor personalizado criado pelo administrador.";
    const id = `custom_${name.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "")}_${Date.now()}`;
    saveSector({
      id,
      name: name.trim(),
      description,
      formulas: 0,
      activeCalculations: 0,
      health: 70,
      trend: "+0%",
      usageLevel: "Moderado",
      color: "#ff6a00",
      iconName: "Factory",
    });
    toast.success("Setor criado com sucesso.");
  };

  const handleDuplicate = (id: string) => {
    const copy = duplicateFormula(id);
    if (copy) toast.success("Formula duplicada como modelo personalizado.");
  };

  const addMissingVariables = () => {
    validation.missingVariables.forEach((name) => addVariable(name));
  };

  return (
    <div className="mx-auto flex w-full max-w-[1540px] flex-col gap-6">
      <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <Badge className="border-primary/25 bg-primary/15 text-primary hover:bg-primary/15">Biblioteca tecnica</Badge>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground">Formulas</h1>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
            Crie calculos novos sem programar, valide a expressao, cadastre variaveis e use imediatamente no console.
          </p>
        </div>
        {admin && (
          <Button type="button" onClick={openCreateDialog} className="h-11 bg-primary text-primary-foreground glow-primary hover:bg-highlight-glow">
            <Plus className="h-4 w-4" />
            Nova formula
          </Button>
        )}
      </section>

      <section className="grid gap-4 lg:grid-cols-[340px_1fr]">
        <Card className="gradient-industrial glow-card border-border/60">
          <CardHeader className="border-b border-border/70 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Controle</p>
            <CardTitle className="mt-1 text-lg text-foreground">Resumo da biblioteca</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 p-5">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar formula, tag ou variavel"
                className="border-border bg-muted/25 pl-9 text-foreground focus-visible:ring-primary/40"
              />
            </div>
            <Select value={sectorFilter} onValueChange={(value) => setSectorFilter(value as SectorId | "todos")}>
              <SelectTrigger className="border-border bg-muted/25 text-foreground">
                <SelectValue placeholder="Filtrar setor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os setores</SelectItem>
                {sectors.map((sector) => (
                  <SelectItem key={sector.id} value={sector.id}>
                    {sector.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="grid grid-cols-2 gap-3">
              <Metric label="Formulas" value={formulas.length} />
              <Metric label="Setores" value={sectors.length} />
              <Metric label="Variaveis" value={formulas.reduce((total, formula) => total + formula.variables.length, 0)} />
              <Metric label="Custom" value={formulas.filter((formula) => formula.isCustom).length} />
            </div>
            {admin && (
              <Button type="button" variant="outline" onClick={requestNewSector} className="w-full border-border bg-muted/25 text-foreground">
                <Plus className="h-4 w-4" />
                Novo setor
              </Button>
            )}
            <div className="rounded-lg border border-primary/25 bg-primary/10 p-4">
              <div className="flex items-start gap-3">
                <Sparkles className="mt-0.5 h-4 w-4 text-primary" />
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Digite a formula como <span className="font-mono text-foreground">T = F * r</span>. O editor detecta variaveis e avisa inconsistencias.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4 xl:grid-cols-2">
          {filteredItems.map((formula) => (
            <FormulaCard key={formula.id} formula={formula} favorite={isFavorite(formula.id)}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap gap-2">
                  {formula.variables.slice(0, 5).map((variable) => (
                    <Badge key={variable.name} variant="outline" className="border-border bg-muted/25 text-muted-foreground">
                      {variable.name}
                    </Badge>
                  ))}
                </div>
                <div className="flex flex-wrap justify-end gap-2">
                  {admin ? (
                    <>
                      <Button type="button" variant="outline" size="sm" onClick={() => handleDuplicate(formula.id)} className="border-border bg-muted/25 text-foreground">
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button type="button" variant="outline" size="sm" onClick={() => setStatus(formula, "em_revisao")} className="border-border bg-muted/25 text-foreground">
                        <Send className="h-4 w-4" />
                        Revisao
                      </Button>
                      <Button type="button" variant="outline" size="sm" onClick={() => setStatus(formula, "validada")} className="border-info/30 bg-info/10 text-info">
                        <CheckCircle2 className="h-4 w-4" />
                        Validar
                      </Button>
                      <Button type="button" variant="outline" size="sm" onClick={() => setStatus(formula, "aprovada")} className="border-success/30 bg-success/10 text-success">
                        Aprovar
                      </Button>
                      <Button type="button" variant="outline" size="sm" onClick={() => setStatus(formula, "arquivada")} className="border-destructive/30 bg-destructive/10 text-destructive">
                        <Archive className="h-4 w-4" />
                      </Button>
                      <Button type="button" variant="outline" size="sm" onClick={() => guardedEdit(formula)} className="border-border bg-muted/25 text-foreground">
                        <Edit3 className="h-4 w-4" />
                        Editar
                      </Button>
                    </>
                  ) : (
                    <Badge variant="outline" className="border-border bg-muted/25 text-muted-foreground">
                      Somente visualizacao
                    </Badge>
                  )}
                  {admin && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleRemoveFormula(formula.id)}
                      className="border-destructive/30 bg-destructive/10 text-destructive hover:bg-destructive hover:text-destructive-foreground"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </FormulaCard>
          ))}
        </div>
      </section>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[94vh] max-w-6xl border-border bg-background p-0 text-foreground">
          <DialogHeader className="border-b border-border/70 p-6 pb-4">
            <DialogTitle className="flex items-center gap-2 text-xl">
              <FlaskConical className="h-5 w-5 text-primary" />
              {editingId ? "Editar formula" : "Nova formula"}
            </DialogTitle>
            <DialogDescription>
              Configure expressao, variaveis, contexto tecnico e exemplo para liberar o calculo no console.
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="max-h-[68vh]">
            <div className="grid gap-6 p-6 lg:grid-cols-[1fr_390px]">
              <div className="space-y-5">
                <div className="grid gap-4 md:grid-cols-3">
                  <Field label="Nome" required error={submitted && !draft.name}>
                    <Input value={draft.name} onChange={(event) => updateDraft("name", event.target.value)} placeholder="Ex: Torque de Aperto" className="border-border bg-muted/25 text-foreground" />
                  </Field>
                  <Field label="Setor">
                    <Select value={draft.sectorId} onValueChange={(value) => updateDraft("sectorId", value as SectorId)}>
                      <SelectTrigger className="border-border bg-muted/25 text-foreground">
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        {sectors.map((sector) => (
                          <SelectItem key={sector.id} value={sector.id}>
                            {sector.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field label="Dificuldade">
                    <Select value={draft.difficulty} onValueChange={(value) => updateDraft("difficulty", value as Difficulty)}>
                      <SelectTrigger className="border-border bg-muted/25 text-foreground">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Basica">Basica</SelectItem>
                        <SelectItem value="Intermediaria">Intermediaria</SelectItem>
                        <SelectItem value="Avancada">Avancada</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field label="Status">
                    <Select value={draft.status} onValueChange={(value) => updateDraft("status", value as FormulaStatus)} disabled={!canApproveFormula(role)}>
                      <SelectTrigger className="border-border bg-muted/25 text-foreground">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(statusLabels).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                </div>

                <div className="grid gap-4 md:grid-cols-[1fr_160px]">
                  <Field label="Formula" required error={submitted && (!draft.expression || !validation.valid)} helper={validation.error}>
                    <Input value={draft.expression} onChange={(event) => updateDraft("expression", event.target.value)} placeholder="Ex: T = F * r" className="border-border bg-muted/25 font-mono text-foreground" />
                  </Field>
                  <Field label="Unidade do resultado">
                    <Input value={draft.resultUnit} onChange={(event) => updateDraft("resultUnit", event.target.value)} placeholder="Ex: N.m" className="border-border bg-muted/25 font-mono text-foreground" />
                  </Field>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="Descricao tecnica" required error={submitted && !draft.description}>
                    <Textarea value={draft.description} onChange={(event) => updateDraft("description", event.target.value)} placeholder="Quando e como a formula deve ser aplicada." className="min-h-[104px] border-border bg-muted/25 text-foreground" />
                  </Field>
                  <Field label="Explicacao simples" required error={submitted && !draft.simpleExplanation}>
                    <Textarea value={draft.simpleExplanation} onChange={(event) => updateDraft("simpleExplanation", event.target.value)} placeholder="Explique em linguagem direta para o operador." className="min-h-[104px] border-border bg-muted/25 text-foreground" />
                  </Field>
                </div>

                <Field label="Observacoes tecnicas">
                  <Textarea value={draft.technicalNotes} onChange={(event) => updateDraft("technicalNotes", event.target.value)} placeholder="Normas, premissas, restricoes e criterios de aplicacao." className="min-h-[86px] border-border bg-muted/25 text-foreground" />
                </Field>

                <div className="grid gap-4 md:grid-cols-[1fr_260px]">
                  <Field label="Exemplo preenchido" required error={submitted && !draft.example}>
                    <Input value={draft.example} onChange={(event) => updateDraft("example", event.target.value)} placeholder="Ex: F = 10 N e r = 2 m resultam em 20 N.m" className="border-border bg-muted/25 text-foreground" />
                  </Field>
                  <Field label="Tags">
                    <Input value={draft.tags} onChange={(event) => updateDraft("tags", event.target.value)} placeholder="torque, eixo, seguranca" className="border-border bg-muted/25 text-foreground" />
                  </Field>
                </div>

                <div className="space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Variaveis dinamicas</p>
                      {submitted && validVariables.length === 0 && <p className="mt-1 text-xs text-destructive">Adicione ao menos uma variavel.</p>}
                    </div>
                    <Button type="button" variant="outline" size="sm" onClick={() => addVariable()} className="border-border bg-muted/25 text-foreground">
                      <Plus className="h-4 w-4" />
                      Adicionar
                    </Button>
                  </div>

                  {validation.missingVariables.length > 0 && (
                    <div className="rounded-lg border border-warning/25 bg-warning/10 p-3">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <p className="text-sm text-muted-foreground">Variaveis detectadas na formula ainda nao cadastradas: {validation.missingVariables.join(", ")}</p>
                        <Button type="button" size="sm" variant="outline" onClick={addMissingVariables} className="border-warning/30 bg-background/30 text-foreground">
                          Adicionar detectadas
                        </Button>
                      </div>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2">
                    {variableSuggestions.map((name) => (
                      <button key={name} type="button" onClick={() => addVariable(name)} className="rounded-md border border-border/70 bg-muted/20 px-2 py-1 font-mono text-xs text-muted-foreground hover:border-primary/35 hover:text-primary">
                        + {name}
                      </button>
                    ))}
                  </div>

                  {draft.variables.map((variable, index) => (
                    <div key={variable.id} className="grid gap-3 rounded-lg border border-border/70 bg-muted/15 p-3 md:grid-cols-[110px_1fr_100px_110px_auto]">
                      <Input value={variable.name} onChange={(event) => updateVariable(variable.id, "name", event.target.value)} placeholder={`V${index + 1}`} className="border-border bg-background/50 font-mono text-foreground" />
                      <Input value={variable.label} onChange={(event) => updateVariable(variable.id, "label", event.target.value)} placeholder="Descricao da variavel" className="border-border bg-background/50 text-foreground" />
                      <Input value={variable.unit} onChange={(event) => updateVariable(variable.id, "unit", event.target.value)} placeholder="Un." className="border-border bg-background/50 font-mono text-foreground" />
                      <Input value={variable.placeholder} onChange={(event) => updateVariable(variable.id, "placeholder", event.target.value)} placeholder="Ex." className="border-border bg-background/50 font-mono text-foreground" />
                      <Button type="button" variant="ghost" size="icon" onClick={() => removeVariable(variable.id)} className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              <Card className="h-fit border-primary/25 bg-primary/10">
                <CardHeader className="p-5 pb-3">
                  <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                    <Eye className="h-4 w-4" />
                    Preview e validacao
                  </p>
                  <CardTitle className="text-lg text-foreground">{draft.name || "Nome da formula"}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 p-5 pt-0">
                  <p className="text-sm leading-relaxed text-muted-foreground">{draft.description || "Descricao operacional da formula."}</p>
                  <div className="rounded-lg border border-primary/25 bg-background/45 p-4 font-mono text-sm text-primary">
                    {draft.expression ? formatFormulaForDisplay(draft.expression) : "Expressao"} {draft.resultUnit ? `=> ${draft.resultUnit}` : ""}
                  </div>
                  <div className={validation.valid ? "rounded-lg border border-success/25 bg-success/10 p-3" : "rounded-lg border border-warning/25 bg-warning/10 p-3"}>
                    <p className={validation.valid ? "text-sm font-medium text-success" : "text-sm font-medium text-warning"}>
                      {validation.valid ? "Formula valida para uso" : validation.error || "Aguardando formula valida"}
                    </p>
                    {validation.unusedVariables.length > 0 && (
                      <p className="mt-1 text-xs text-muted-foreground">Variaveis cadastradas nao usadas: {validation.unusedVariables.join(", ")}</p>
                    )}
                  </div>
                  <div className="rounded-lg border border-border/70 bg-background/35 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Preview calculavel</p>
                        <p className="mt-1 text-sm text-muted-foreground">Usa os valores de exemplo das variaveis.</p>
                      </div>
                      <Badge variant="outline" className={previewResult ? "border-primary/25 bg-primary/10 text-primary" : "border-warning/25 bg-warning/10 text-warning"}>
                        {previewResult ? "calculado" : "aguardando"}
                      </Badge>
                    </div>
                    {previewResult ? (
                      <div className="mt-4 rounded-lg border border-primary/25 bg-primary/10 p-4">
                        <p className="font-mono text-3xl font-semibold text-primary">{previewResult}</p>
                        {draft.resultUnit && <p className="mt-1 text-xs text-muted-foreground">{draft.resultUnit}</p>}
                      </div>
                    ) : (
                      <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                        Complete formula e variaveis com exemplos numericos para ver o resultado antes de salvar.
                      </p>
                    )}
                    {Object.keys(previewValues).length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {Object.entries(previewValues).map(([name, value]) => (
                          <span key={name} className="rounded-md border border-border/70 bg-muted/20 px-2 py-1 font-mono text-xs text-muted-foreground">
                            {name}={value}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="border-primary/25 bg-primary/10 text-primary">
                      {selectedSector.name}
                    </Badge>
                    {validVariables.map((variable) => (
                      <Badge key={variable.id} variant="outline" className="border-border bg-muted/25 text-muted-foreground">
                        <Variable className="mr-1 h-3 w-3" />
                        {variable.name}
                      </Badge>
                    ))}
                  </div>
                  <div className="rounded-lg border border-border/70 bg-background/35 p-4">
                    <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Exemplo</p>
                    <p className="mt-2 text-sm leading-relaxed text-foreground">{draft.example || "Preencha um exemplo de aplicacao."}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </ScrollArea>

          <DialogFooter className="border-t border-border/70 p-6 pt-4">
            <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} className="border-border bg-muted/25 text-foreground">
              Cancelar
            </Button>
            <Button type="button" onClick={saveDraft} className="bg-primary text-primary-foreground hover:bg-highlight-glow">
              <Save className="h-4 w-4" />
              Salvar formula
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-border/70 bg-muted/20 p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 font-mono text-2xl font-semibold text-foreground">{value}</p>
    </div>
  );
}

function Field({
  label,
  required,
  error,
  helper,
  children,
}: {
  label: string;
  required?: boolean;
  error?: boolean;
  helper?: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        {label} {required && <span className="text-primary">*</span>}
      </Label>
      {children}
      {error && <p className="text-xs text-destructive">{helper || "Campo obrigatorio."}</p>}
    </div>
  );
}
