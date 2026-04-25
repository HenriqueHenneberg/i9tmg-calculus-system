import type { UserRole } from "@/contexts/AuthContext";
import type { Formula } from "@/lib/industrial-data";

export function isAdmin(role: UserRole | null | undefined) {
  return role === "admin";
}

export function canEditFormula(role: UserRole | null | undefined, formula: Formula) {
  return formula.isCustom || isAdmin(role);
}

export function canApproveFormula(role: UserRole | null | undefined) {
  return isAdmin(role);
}

export function canCreateSector(role: UserRole | null | undefined) {
  return isAdmin(role);
}

export function adminOnlyMessage() {
  return "Apenas administradores podem executar esta ação.";
}
