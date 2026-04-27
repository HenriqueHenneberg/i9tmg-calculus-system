import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  calculationsHistory,
  formulas as catalogFormulas,
  sectors as catalogSectors,
  type CalculationRecord,
  type Formula,
  type Sector,
  type SectorId,
} from "@/lib/industrial-data";
import { useAuth } from "@/contexts/AuthContext";

export interface WorkspacePreferences {
  precision: number;
  compactMode: boolean;
  notifications: boolean;
  darkTheme: boolean;
  autoSaveHistory: boolean;
  defaultSector: SectorId;
  jobTitle: string;
  email: string;
  unit: string;
}

interface StoredWorkspace {
  userName: string;
  favoriteIds: string[];
  favoriteIdsByUser: Record<string, string[]>;
  preferences: WorkspacePreferences;
  customSectors: Sector[];
  sectorOverrides: Record<string, Sector>;
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
  preferences: WorkspacePreferences;
  saveSector: (sector: Sector) => void;
  saveFormula: (formula: Formula) => void;
  updatePreferences: (preferences: Partial<WorkspacePreferences>) => void;
  duplicateFormula: (formulaId: string) => Formula | null;
  removeFormula: (formulaId: string) => boolean;
  updateFormulaStatus: (formulaId: string, status: Formula["status"], reviewer?: string) => void;
  toggleFavorite: (formulaId: string) => void;
  isFavorite: (formulaId: string) => boolean;
  recordCalculation: (formula: Formula, values: Record<string, string>, result: string, operator?: string) => void;
}

const storageKey = "tech-calculus-industrial-workspace-v2";

const initialWorkspace: StoredWorkspace = {
  userName: "",
  favoriteIds: ["torque", "oee", "potencia-trifasica", "mtbf"],
  favoriteIdsByUser: {},
  preferences: {
    precision: 4,
    compactMode: false,
    notifications: true,
    darkTheme: true,
    autoSaveHistory: true,
    defaultSector: "mecanica",
    jobTitle: "Engenharia Industrial",
    email: "engenharia@i9tmg.com.br",
    unit: "planta-01",
  },
  customSectors: [],
  sectorOverrides: {},
  customFormulas: [],
  formulaOverrides: {},
  customHistory: [],
};

const IndustrialWorkspaceContext = createContext<IndustrialWorkspaceContextValue | null>(null);

export function IndustrialWorkspaceProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [workspace, setWorkspace] = useState<StoredWorkspace>(() => readWorkspace());
  const activeUserKey = user?.username || workspace.userName || "operador";
  const activeFavoriteIds = workspace.favoriteIdsByUser[activeUserKey] || workspace.favoriteIds;

  useEffect(() => {
    window.localStorage.setItem(storageKey, JSON.stringify(workspace));
  }, [workspace]);

  useEffect(() => {
    document.documentElement.dataset.compact = String(workspace.preferences.compactMode);
    document.documentElement.dataset.theme = workspace.preferences.darkTheme ? "dark" : "light";
  }, [workspace.preferences.compactMode, workspace.preferences.darkTheme]);

  const formulas = useMemo(() => {
    const catalogWithOverrides = catalogFormulas.map((formula) => normalizeFormula(workspace.formulaOverrides[formula.id] || formula));
    return [...workspace.customFormulas.map(normalizeFormula), ...catalogWithOverrides];
  }, [workspace.customFormulas, workspace.formulaOverrides]);

  const history = useMemo(
    () => [...workspace.customHistory.map(normalizeRecord), ...calculationsHistory.map(normalizeRecord)],
    [workspace.customHistory],
  );

  const sectors = useMemo(() => {
    const catalogWithOverrides = catalogSectors.map((sector) => workspace.sectorOverrides[sector.id] || sector);
    return [...catalogWithOverrides, ...workspace.customSectors].map((sector) => {
      const formulaCount = formulas.filter((formula) => formula.sectorId === sector.id).length;
      const newExecutions = workspace.customHistory.filter((item) => item.sectorId === sector.id).length;
      return {
        ...sector,
        formulas: formulaCount,
        activeCalculations: sector.activeCalculations + newExecutions,
      };
    });
  }, [formulas, workspace.customHistory, workspace.customSectors, workspace.sectorOverrides]);

  const saveSector = (sector: Sector) => {
    setWorkspace((current) => {
      const isCatalogSector = catalogSectors.some((item) => item.id === sector.id);
      if (isCatalogSector) {
        return {
          ...current,
          sectorOverrides: {
            ...current.sectorOverrides,
            [sector.id]: sector,
          },
        };
      }

      const exists = current.customSectors.some((item) => item.id === sector.id);
      return {
        ...current,
        customSectors: exists
          ? current.customSectors.map((item) => (item.id === sector.id ? sector : item))
          : [sector, ...current.customSectors],
      };
    });
  };

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
      status: "rascunho",
      createdBy: "Operador",
      approvedBy: undefined,
      approvedAt: undefined,
      version: source.version + 1,
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
      favoriteIdsByUser: Object.fromEntries(
        Object.entries(current.favoriteIdsByUser).map(([key, ids]) => [key, ids.filter((id) => id !== formulaId)]),
      ),
    }));
    return true;
  };

  const updatePreferences = (preferences: Partial<WorkspacePreferences>) => {
    setWorkspace((current) => ({
      ...current,
      preferences: {
        ...current.preferences,
        ...preferences,
      },
    }));
  };

  const updateFormulaStatus = (formulaId: string, status: Formula["status"], reviewer = "Administrador i9TMG") => {
    const formula = formulas.find((item) => item.id === formulaId);
    if (!formula) return;

    const reviewedFormula: Formula = {
      ...formula,
      status,
      approvedBy: status === "aprovada" || status === "validada" ? reviewer : formula.approvedBy,
      approvedAt: status === "aprovada" || status === "validada" ? new Date().toISOString() : formula.approvedAt,
      version: formula.version || 1,
    };

    saveFormula(reviewedFormula);
  };

  const toggleFavorite = (formulaId: string) => {
    setWorkspace((current) => ({
      ...current,
      favoriteIdsByUser: {
        ...current.favoriteIdsByUser,
        [activeUserKey]: (current.favoriteIdsByUser[activeUserKey] || current.favoriteIds).includes(formulaId)
          ? (current.favoriteIdsByUser[activeUserKey] || current.favoriteIds).filter((id) => id !== formulaId)
          : [formulaId, ...(current.favoriteIdsByUser[activeUserKey] || current.favoriteIds)],
      },
    }));
  };

  const recordCalculation = (formula: Formula, values: Record<string, string>, result: string, operator?: string) => {
    if (!workspace.preferences.autoSaveHistory) return;

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
          formulaStatus: formula.status,
          status: "Validado",
          operator: operator || current.userName || "Operador",
          date: formatDate(new Date()),
          isoDate: new Date().toISOString().slice(0, 10),
        },
        ...current.customHistory.slice(0, 99),
      ],
    }));
  };

  const value: IndustrialWorkspaceContextValue = {
    userName: user?.name || workspace.userName,
    setUserName: (name) => setWorkspace((current) => ({ ...current, userName: name })),
    formulas,
    sectors,
    history,
    favoriteIds: activeFavoriteIds,
    preferences: workspace.preferences,
    saveSector,
    saveFormula,
    updatePreferences,
    duplicateFormula,
    removeFormula,
    updateFormulaStatus,
    toggleFavorite,
    isFavorite: (formulaId) => activeFavoriteIds.includes(formulaId),
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
      favoriteIdsByUser: parsed.favoriteIdsByUser || {},
      preferences: {
        ...initialWorkspace.preferences,
        ...(parsed.preferences || {}),
      },
      customSectors: parsed.customSectors || [],
      sectorOverrides: parsed.sectorOverrides || {},
      customFormulas: parsed.customFormulas || [],
      formulaOverrides: parsed.formulaOverrides || {},
      customHistory: parsed.customHistory || [],
    };
  } catch {
    return initialWorkspace;
  }
}

function normalizeFormula(formula: Formula): Formula {
  return {
    status: "aprovada",
    createdBy: "i9TMG Engenharia",
    approvedBy: "Administrador i9TMG",
    createdAt: "2026-04-24T00:00:00.000Z",
    approvedAt: "2026-04-24T00:00:00.000Z",
    version: 1,
    ...formula,
  };
}

function normalizeRecord(record: CalculationRecord): CalculationRecord {
  return {
    formulaStatus: "aprovada",
    ...record,
  };
}

function formatDate(date: Date) {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${day}/${month}/${year} ${hours}:${minutes}`;
}
