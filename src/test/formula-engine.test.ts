import { describe, expect, it } from "vitest";
import { evaluateFormula, validateFormula } from "@/lib/formula-engine";
import { formulas, sectors } from "@/lib/industrial-data";

describe("industrial formula catalog", () => {
  it("contains a professional 100+ calculation catalog across all sectors", () => {
    expect(formulas.length).toBeGreaterThanOrEqual(100);
    expect(sectors.length).toBe(14);
  });

  it("validates and evaluates every bundled formula with placeholder values", () => {
    formulas.forEach((formula) => {
      const validation = validateFormula(
        formula.expression,
        formula.variables.map((variable) => variable.name),
      );
      expect(validation.valid, `${formula.id}: ${validation.error || "invalid"}`).toBe(true);

      const values = Object.fromEntries(
        formula.variables.map((variable) => [variable.name, variable.placeholder || "1"]),
      );
      const result = evaluateFormula(formula, values);
      expect(Number.isFinite(result), `${formula.id} should produce a finite result`).toBe(true);
    });
  });
});
