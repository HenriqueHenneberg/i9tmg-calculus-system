import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  calculationsHistory,
  formulas as catalogFormulas,
  sectors as catalogSectors,
  type CalculationRecord,
  type Formula,
  type Sector,
} from "@/lib/industrial-data";

interface StoredWorkspace {
  userName: string;
  favoriteIds: string[];
  customFormulas: Formula[];
  formulaOverrides: Record<string, Formula>;
  customHistory: CalculationRecord[];
}

interface IndustrialWorkspaceContextValue {
  userName: string;
  setUserName: (name: string) => void;
  formulas: Formula[];
  sectors: Sector[];
  history: CalculationRecord[];
  favoriteIds: string[];
  saveFormula: (formula: Formula) => void;
  duplicateFormula: (formulaId: string) => Formula | null;
  removeFormula: (formulaId: string) => boolean;
  toggleFavorite: (formulaId: string) => void;
  isFavorite: (formulaId: string) => boolean;
  recordCalculation: (formula: Formula, values: Record<string, string>, result: string) => void;
}

const storageKey = "tech-calculus-industrial-workspace-v2";

const initialWorkspace: StoredWorkspace = {
  userName: "",
  favoriteIds: ["torque", "oee", "potencia-trifasica", "mtbf"],
  customFormulas: [],
  formulaOverrides: {},
  customHistory: [],
};

const IndustrialWorkspaceContext = createContext<IndustrialWorkspaceContextValue | null>(null);

export function IndustrialWorkspaceProvider({ children }: { children: ReactNode }) {
  const [workspace, setWorkspace] = useState<StoredWorkspace>(() => readWorkspace());

  useEffect(() => {
    window.localStorage.setItem(storageKey, JSON.stringify(workspace));
  }, [workspace]);

  const formulas = useMemo(() => {
    const catalogWithOverrides = catalogFormulas.map((formula) => workspace.formulaOverrides[formula.id] || formula);
    return [...workspace.customFormulas, ...catalogWithOverrides];
  }, [workspace.customFormulas, workspace.formulaOverrides]);

  const history = useMemo(() => [...workspace.customHistory, ...calculationsHistory], [workspace.customHistory]);

  const sectors = useMemo(() => {
    return catalogSectors.map((sector) => {
      const formulaCount = formulas.filter((formula) => formula.sectorId === sector.id).length;
      const newExecutions = workspace.customHistory.filter((item) => item.sectorId === sector.id).length;
      return {
        ...sector,
        formulas: formulaCount,
        activeCalculations: sector.activeCalculations + newExecutions,
      };
    });
  }, [formulas, workspace.customHistory]);

  const saveFormula = (formula: Formula) => {
    setWorkspace((current) => {
      const isCatalogFormula = catalogFormulas.some((item) => item.id === formula.id);
      if (isCatalogFormula && !formula.isCustom) {
        return {
          ...current,
          formulaOverrides: {
            ...current.formulaOverrides,
            [formula.id]: formula,
          },
        };
      }

      const normalizedFormula = { ...formula, isCustom: true };
      const exists = current.customFormulas.some((item) => item.id === normalizedFormula.id);
      return {
        ...current,
        customFormulas: exists
          ? current.customFormulas.map((item) => (item.id === normalizedFormula.id ? normalizedFormula : item))
          : [normalizedFormula, ...current.customFormulas],
      };
    });
  };

  const duplicateFormula = (formulaId: string) => {
    const source = formulas.find((formula) => formula.id === formulaId);
    if (!source) return null;

    const duplicated: Formula = {
      ...source,
      id: `custom-${Date.now()}`,
      name: `${source.name} - copia`,
      usageCount: 0,
      isCustom: true,
      createdAt: new Date().toISOString(),
    };
    saveFormula(duplicated);
    return duplicated;
  };

  const removeFormula = (formulaId: string) => {
    const isCustom = workspace.customFormulas.some((formula) => formula.id === formulaId);
    if (!isCustom) return false;

    setWorkspace((current) => ({
      ...current,
      customFormulas: current.customFormulas.filter((formula) => formula.id !== formulaId),
      favoriteIds: current.favoriteIds.filter((id) => id !== formulaId),
    }));
    return true;
  };

  const toggleFavorite = (formulaId: string) => {
    setWorkspace((current) => ({
      ...current,
      favoriteIds: current.favoriteIds.includes(formulaId)
        ? current.favoriteIds.filter((id) => id !== formulaId)
        : [formulaId, ...current.favoriteIds],
    }));
  };

  const recordCalculation = (formula: Formula, values: Record<string, string>, result: string) => {
    setWorkspace((current) => ({
      ...current,
      customHistory: [
        {
          id: Date.now(),
          formulaId: formula.id,
          formula: formula.name,
          sector: formula.sector,
          sectorId: formula.sectorId,
          values,
          result,
          unit: formula.resultUnit,
          status: "Validado",
          operator: current.userName || "Operador",
          date: formatDate(new Date()),
          isoDate: new Date().toISOString().slice(0, 10),
        },
        ...current.customHistory.slice(0, 99),
      ],
    }));
  };

  const value: IndustrialWorkspaceContextValue = {
    userName: workspace.userName,
    setUserName: (name) => setWorkspace((current) => ({ ...current, userName: name })),
    formulas,
    sectors,
    history,
    favoriteIds: workspace.favoriteIds,
    saveFormula,
    duplicateFormula,
    removeFormula,
    toggleFavorite,
    isFavorite: (formulaId) => workspace.favoriteIds.includes(formulaId),
    recordCalculation,
  };

  return <IndustrialWorkspaceContext.Provider value={value}>{children}</IndustrialWorkspaceContext.Provider>;
}

export function useIndustrialWorkspace() {
  const context = useContext(IndustrialWorkspaceContext);
  if (!context) {
    throw new Error("useIndustrialWorkspace must be used inside IndustrialWorkspaceProvider");
  }
  return context;
}

function readWorkspace(): StoredWorkspace {
  try {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) return initialWorkspace;
    const parsed = JSON.parse(raw) as Partial<StoredWorkspace>;
    return {
      ...initialWorkspace,
      ...parsed,
      favoriteIds: parsed.favoriteIds || initialWorkspace.favoriteIds,
      customFormulas: parsed.customFormulas || [],
      formulaOverrides: parsed.formulaOverrides || {},
      customHistory: parsed.customHistory || [],
    };
  } catch {
    return initialWorkspace;
  }
}

function formatDate(date: Date) {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${day}/${month}/${year} ${hours}:${minutes}`;
}
