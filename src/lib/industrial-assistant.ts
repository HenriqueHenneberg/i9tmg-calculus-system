import type { Formula } from "@/lib/industrial-data";

export interface AssistantSuggestion {
  formula: Formula;
  score: number;
  reasons: string[];
}

export interface DetectedValue {
  variable: string;
  label: string;
  value: string;
  source: string;
}

export interface AssistantAnalysis {
  query: string;
  suggestions: AssistantSuggestion[];
  detectedValues: DetectedValue[];
  related: Formula[];
}

const intentDictionary: Record<string, string[]> = {
  acoplamento: ["acoplamento", "torque", "momento equivalente", "meq"],
  capacidade: ["capacidade", "vazao", "produção", "producao", "transportar", "m3h", "m3/h"],
  correia: ["correia", "belt", "esteira", "lonas", "carcaca", "carcaça"],
  eixo: ["eixo", "motriz", "movido", "flecha", "diametro", "diâmetro", "flexao", "flexão"],
  elevador: ["elevador", "caneca", "canecas", "mistura", "mistura 90"],
  energia: ["energia", "consumo", "kwh", "demanda"],
  motor: ["motor", "potencia", "potência", "cv", "acionamento"],
  redutor: ["redutor", "reducao", "redução", "rpm", "rotacao", "rotação"],
  rolamento: ["rolamento", "mancal", "l10h", "vida nominal", "capacidade dinamica"],
  tambor: ["tambor", "abracamento", "abraçamento", "esticador", "costado"],
  tensao: ["tensao", "tensão", "tracao", "tração", "kgf", "admissivel", "admissível"],
};

const variableAliases: Record<string, string[]> = {
  A: ["area", "área", "secao", "seção"],
  B: ["largura", "largura da correia"],
  C: ["constante", "distancia ate carga", "distância até carga"],
  Ca: ["comprimento", "comprimento aberto", "correia aberta", "corrente aberta"],
  CF1: ["coeficiente de enchimento", "enchimento", "cf1"],
  CF2: ["coeficiente de homogeneidade", "homogeneidade", "cf2"],
  D: ["diametro", "diâmetro", "diametro do tambor", "tambor"],
  E: ["modulo", "módulo", "elasticidade"],
  F: ["forca", "força"],
  Fs: ["fator de servico", "fator de serviço", "fs"],
  Fsf: ["fator flexao", "fator flexão", "fsf"],
  Fst: ["fator torcao", "fator torção", "fst"],
  H: ["altura", "altura de elevacao", "altura de elevação"],
  Ho: ["altura complementar", "ho"],
  K: ["fator", "fator de abracamento", "fator de abraçamento"],
  Kc: ["coeficiente costado", "kc"],
  Ks: ["fator rigidez", "ks"],
  L: ["comprimento", "vao", "vão", "distancia entre apoios"],
  L10h: ["vida", "vida nominal", "l10h"],
  Mi: ["momento ideal", "momento composto"],
  Mf: ["momento fletor"],
  Mt: ["momento torsor", "torcao", "torção"],
  N: ["potencia", "potência", "numero", "número", "canecas"],
  N1: ["numero de canecas", "número de canecas", "canecas"],
  NL: ["numero de lonas", "número de lonas", "lonas"],
  P: ["carga", "peso", "potencia", "potência"],
  Pm: ["peso por metro", "peso metro"],
  Rm: ["rotacao motor", "rotação motor", "rpm motor"],
  Te: ["tensao efetiva", "tensão efetiva"],
  Tm: ["tensao maxima", "tensão máxima"],
  Tu: ["tensao admissivel", "tensão admissível"],
  V: ["volume", "volume da caneca", "velocidade linear"],
  a: ["braco", "braço", "distancia", "distância"],
  angulo: ["angulo", "ângulo"],
  d: ["diametro minimo", "diâmetro mínimo", "diametro eixo"],
  e: ["passo", "passo das canecas"],
  eta: ["rendimento", "eficiencia", "eficiência"],
  gamma: ["peso especifico", "peso específico", "densidade"],
  k: ["fator dinamico", "fator dinâmico"],
  mi: ["atrito", "coeficiente de atrito"],
  n: ["fileiras", "rotacao", "rotação", "rpm"],
  p: ["peso caneca", "peso unitario", "peso unitário"],
  p1: ["peso material", "material por caneca"],
  pc: ["peso correia", "peso corrente"],
  rs: ["rotacao saida", "rotação saída", "saida redutor", "saída redutor"],
  sigmaAdm: ["tensao admissivel", "tensão admissível", "sigma adm"],
  sigmaC: ["tensao costado", "tensão costado"],
  v: ["velocidade", "velocidade da correia", "velocidade corrente"],
};

const unitPattern = "(mm|cm|m/s|m|min|h|rpm|kgf|kg|n|cv|kw|m3|m³|%)?";
const stopWords = new Set([
  "a",
  "o",
  "as",
  "os",
  "de",
  "da",
  "do",
  "das",
  "dos",
  "e",
  "para",
  "por",
  "com",
  "um",
  "uma",
  "preciso",
  "calcular",
]);

export function analyzeIndustrialIntent(query: string, formulas: Formula[], currentFormula?: Formula): AssistantAnalysis {
  const activeFormulas = formulas.filter((formula) => formula.status !== "arquivada");
  const suggestions = rankFormulas(query, activeFormulas).slice(0, 6);
  const targetFormula = suggestions[0]?.formula || currentFormula;
  const detectedValues = targetFormula ? extractValuesFromText(query, targetFormula) : [];
  const related = targetFormula ? suggestRelatedFormulas(targetFormula, activeFormulas).slice(0, 5) : [];

  return {
    query,
    suggestions,
    detectedValues,
    related,
  };
}

export function rankFormulas(query: string, formulas: Formula[]) {
  const normalizedQuery = normalize(query);
  const expandedTerms = expandQuery(normalizedQuery);

  return formulas
    .map((formula) => {
      const searchable = buildSearchableFormula(formula);
      const normalizedName = normalize(formula.name);
      const normalizedTags = normalize(formula.tags.join(" "));
      const reasons: string[] = [];
      let score = 0;

      expandedTerms.forEach((term) => {
        if (!term) return;
        if (normalizedName.includes(term)) {
          score += 12;
          reasons.push("nome");
        }
        if (normalize(formula.sector).includes(term)) {
          score += 8;
          reasons.push("setor");
        }
        if (formula.tags.some((tag) => normalize(tag).includes(term))) {
          score += 7;
          reasons.push("tag");
        }
        if (formula.variables.some((variable) => normalize(`${variable.name} ${variable.label}`).includes(term))) {
          score += 6;
          reasons.push("variavel");
        }
        if (searchable.includes(term)) {
          score += 2;
        }
      });

      const strongNameMatches = normalizedName
        .split(/\s+/)
        .filter((word) => word.length > 3 && normalizedQuery.includes(word)).length;
      const strongTagMatches = normalizedTags
        .split(/\s+/)
        .filter((word) => word.length > 3 && normalizedQuery.includes(word)).length;

      score += strongNameMatches * 10 + strongTagMatches * 6;

      if (formula.status === "aprovada") score += 5;
      if (formula.status === "validada") score += 4;
      if (formula.sectorId === "elevadores_mistura_90" && normalizedQuery.includes("mistura")) score += 12;
      score += Math.min(formula.usageCount / 50, 4);

      return {
        formula,
        score,
        reasons: Array.from(new Set(reasons)).slice(0, 4),
      };
    })
    .filter((item) => item.score > 1 || normalize(item.formula.name).includes(normalizedQuery))
    .sort((a, b) => b.score - a.score);
}

export function extractValuesFromText(text: string, formula: Formula): DetectedValue[] {
  const detections: DetectedValue[] = [];
  const usedVariables = new Set<string>();

  formula.variables.forEach((variable) => {
    const aliases = [variable.name, variable.label, ...(variableAliases[variable.name] || [])].map(normalize);
    for (const alias of aliases) {
      const escapedAlias = escapeRegExp(alias).replace(/\\ /g, "\\s+");
      const directPattern = new RegExp(`(?:^|\\b)${escapedAlias}\\s*(?:=|:|de|com|em)?\\s*(-?\\d+(?:[,.]\\d+)?)\\s*${unitPattern}`, "i");
      const match = normalize(text).match(directPattern);
      if (!match) continue;

      const value = normalizeUnitValue(match[1], match[2], variable.unit);
      if (value && !usedVariables.has(variable.name)) {
        detections.push({
          variable: variable.name,
          label: variable.label,
          value,
          source: match[0].trim(),
        });
        usedVariables.add(variable.name);
      }
      break;
    }
  });

  return detections;
}

export function suggestRelatedFormulas(formula: Formula, formulas: Formula[]) {
  return formulas
    .filter((candidate) => candidate.id !== formula.id && candidate.status !== "arquivada")
    .map((candidate) => {
      const tagOverlap = candidate.tags.filter((tag) => formula.tags.map(normalize).includes(normalize(tag))).length;
      const sectorScore = candidate.sectorId === formula.sectorId ? 8 : 0;
      const variableOverlap = candidate.variables.filter((variable) =>
        formula.variables.some((current) => normalize(current.name) === normalize(variable.name)),
      ).length;
      return {
        formula: candidate,
        score: sectorScore + tagOverlap * 5 + variableOverlap * 2 + candidate.usageCount / 100,
      };
    })
    .filter((item) => item.score > 2)
    .sort((a, b) => b.score - a.score)
    .map((item) => item.formula);
}

export function buildMistura90SeedValues(text: string) {
  const normalized = normalize(text);
  const pairs: Record<string, string> = {};
  const aliases: Record<string, string[]> = {
    V: ["volume", "caneca"],
    n: ["fileiras"],
    v: ["velocidade"],
    CF1: ["enchimento"],
    CF2: ["homogeneidade"],
    gamma: ["peso especifico", "densidade"],
    e: ["passo"],
    D: ["diametro", "tambor"],
    H: ["altura"],
    eta: ["rendimento"],
  };

  Object.entries(aliases).forEach(([variable, terms]) => {
    for (const term of [variable, ...terms]) {
      const match = normalized.match(new RegExp(`(?:^|\\b)${escapeRegExp(normalize(term))}\\s*(?:=|:|de|com)?\\s*(-?\\d+(?:[,.]\\d+)?)\\s*${unitPattern}`, "i"));
      if (match) {
        pairs[variable] = normalizeUnitValue(match[1], match[2], variable === "D" || variable === "H" || variable === "e" ? "m" : "");
        break;
      }
    }
  });

  return pairs;
}

function buildSearchableFormula(formula: Formula) {
  return normalize(
    [
      formula.name,
      formula.sector,
      formula.description,
      formula.simpleExplanation,
      formula.expression,
      formula.tags.join(" "),
      formula.variables.map((variable) => `${variable.name} ${variable.label} ${variable.unit}`).join(" "),
    ].join(" "),
  );
}

function expandQuery(query: string) {
  const words = query
    .split(/\s+/)
    .filter((word) => word && !stopWords.has(word) && (word.length > 2 || /\d/.test(word)));
  const expanded = new Set(words);

  Object.entries(intentDictionary).forEach(([intent, terms]) => {
    if (terms.some((term) => query.includes(normalize(term)))) {
      expanded.add(intent);
      terms.forEach((term) => expanded.add(normalize(term)));
    }
  });

  return Array.from(expanded);
}

function normalizeUnitValue(rawValue: string, rawUnit = "", expectedUnit = "") {
  const numericValue = Number.parseFloat(rawValue.replace(",", "."));
  if (!Number.isFinite(numericValue)) return "";

  const sourceUnit = normalize(rawUnit);
  const targetUnit = normalize(expectedUnit);
  let converted = numericValue;

  if (targetUnit === "m") {
    if (sourceUnit === "mm") converted = numericValue / 1000;
    if (sourceUnit === "cm") converted = numericValue / 100;
  }
  if (targetUnit === "cm") {
    if (sourceUnit === "mm") converted = numericValue / 10;
    if (sourceUnit === "m") converted = numericValue * 100;
  }
  if (targetUnit === "mm" && sourceUnit === "m") {
    converted = numericValue * 1000;
  }

  return Number.isInteger(converted) ? String(converted) : Number(converted.toFixed(6)).toString();
}

function normalize(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/π/g, "pi")
    .replace(/³/g, "3")
    .replace(/,/g, ".")
    .trim();
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
