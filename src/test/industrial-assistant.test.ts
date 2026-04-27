import { describe, expect, it } from "vitest";
import { analyzeIndustrialIntent, buildMistura90SeedValues, extractValuesFromText } from "@/lib/industrial-assistant";
import { formulas } from "@/lib/industrial-data";

describe("local industrial assistant", () => {
  it("ranks Mistura 90 formulas from a natural technical query", () => {
    const analysis = analyzeIndustrialIntent("preciso calcular potencia do motor do elevador mistura 90", formulas);

    expect(analysis.suggestions[0].formula.id).toBe("mistura90-potencia-motor");
  });

  it("detects values and converts simple length units for a selected formula", () => {
    const formula = formulas.find((item) => item.id === "mistura90-potencia-motor")!;
    const values = extractValuesFromText("H 1800cm D 420mm v 1.2 Pm 12 n 2 rendimento 0.82", formula);
    const valueMap = Object.fromEntries(values.map((item) => [item.variable, item.value]));

    expect(valueMap.H).toBe("18");
    expect(valueMap.D).toBe("0.42");
    expect(valueMap.v).toBe("1.2");
    expect(valueMap.eta).toBe("0.82");
  });

  it("builds reusable seed values for the Mistura 90 guided flow", () => {
    const values = buildMistura90SeedValues("volume 0.008 fileiras 2 velocidade 1.2 altura 18 D 420mm passo 30.5cm");

    expect(values.V).toBe("0.008");
    expect(values.n).toBe("2");
    expect(values.v).toBe("1.2");
    expect(values.D).toBe("0.42");
    expect(values.e).toBe("0.305");
  });
});
