export type Mistura90ScenarioMode = "elevador" | "peneira" | "transportador" | "moinho";

export interface Mistura90ScenarioInput {
  key: string;
  label: string;
  unit: string;
  value: number;
  step?: number;
}

export interface Mistura90ScenarioOutput {
  key: string;
  label: string;
  value: number;
  unit: string;
  status?: "ok" | "warning" | "critical";
}

export interface Mistura90ScenarioResult {
  mode: Mistura90ScenarioMode;
  title: string;
  source: string;
  inputs: Mistura90ScenarioInput[];
  outputs: Mistura90ScenarioOutput[];
  steps: string[];
  warnings: string[];
}

export const mistura90ScenarioLabels: Record<Mistura90ScenarioMode, string> = {
  elevador: "Elevador de canecas",
  peneira: "Peneira rotativa/vibratoria",
  transportador: "Transportador de correia",
  moinho: "Moinho tipo facas",
};

export const mistura90ScenarioPresets: Record<Mistura90ScenarioMode, Mistura90ScenarioInput[]> = {
  elevador: [
    { key: "V", label: "Volume da caneca", unit: "L", value: 11.99, step: 0.01 },
    { key: "n", label: "Numero de fileiras", unit: "un", value: 1, step: 1 },
    { key: "v", label: "Velocidade da correia", unit: "m/s", value: 1.525, step: 0.001 },
    { key: "CF1", label: "Coef. enchimento", unit: "", value: 0.754, step: 0.001 },
    { key: "CF2", label: "Coef. homogeneidade", unit: "", value: 1, step: 0.01 },
    { key: "gamma", label: "Peso especifico", unit: "t/m3", value: 1, step: 0.01 },
    { key: "e", label: "Passo das canecas", unit: "mm", value: 310, step: 1 },
    { key: "H", label: "Altura do elevador", unit: "m", value: 20.6, step: 0.1 },
    { key: "D", label: "Diametro do tambor", unit: "m", value: 0.62, step: 0.001 },
    { key: "k", label: "Fator dinamico", unit: "", value: 0.85, step: 0.01 },
  ],
  peneira: [
    { key: "Q", label: "Alimentacao", unit: "t/h", value: 160, step: 1 },
    { key: "Cunit", label: "Capacidade unitaria", unit: "t/h.m2", value: 21, step: 0.1 },
    { key: "F1", label: "Fator granulometria", unit: "", value: 0.9048, step: 0.0001 },
    { key: "F2", label: "Fator abertura", unit: "", value: 2, step: 0.01 },
    { key: "F3", label: "Fator material", unit: "", value: 1.15, step: 0.01 },
    { key: "F4", label: "Fator deck", unit: "", value: 1, step: 0.01 },
    { key: "F5", label: "Fator umidade", unit: "", value: 1, step: 0.01 },
    { key: "F6", label: "Fator eficiencia", unit: "", value: 1.1, step: 0.01 },
    { key: "D", label: "Diametro da gaiola", unit: "m", value: 1.25, step: 0.01 },
    { key: "L", label: "Largura/comprimento util", unit: "m", value: 2.9, step: 0.01 },
    { key: "rpmFactor", label: "Fator de rotacao", unit: "", value: 0.45, step: 0.01 },
  ],
  transportador: [
    { key: "S", label: "Area carregada", unit: "m2", value: 0.05498, step: 0.0001 },
    { key: "v", label: "Velocidade da correia", unit: "m/s", value: 1.08, step: 0.01 },
    { key: "gamma", label: "Densidade aparente", unit: "t/m3", value: 0.9, step: 0.01 },
    { key: "eta", label: "Fator de enchimento", unit: "", value: 1, step: 0.01 },
    { key: "projectFactor", label: "Fator de projeto", unit: "", value: 1.56, step: 0.01 },
    { key: "B", label: "Largura da correia", unit: "pol", value: 30, step: 1 },
    { key: "L", label: "Comprimento estimado", unit: "m", value: 16, step: 1 },
  ],
  moinho: [
    { key: "Wi", label: "Indice de trabalho", unit: "kWh/t", value: 11.61, step: 0.01 },
    { key: "d1", label: "Produto final", unit: "mm", value: 5, step: 0.1 },
    { key: "d0", label: "Produto inicial", unit: "mm", value: 35, step: 0.1 },
    { key: "T", label: "Taxa de alimentacao", unit: "t/h", value: 8, step: 0.1 },
    { key: "motorRpm", label: "Rotacao do motor", unit: "rpm", value: 1770, step: 1 },
    { key: "poliaMotor", label: "Polia do motor", unit: "mm", value: 250, step: 1 },
    { key: "poliaMaq", label: "Polia da maquina", unit: "mm", value: 200, step: 1 },
    { key: "Fs", label: "Fator de servico", unit: "", value: 1.1, step: 0.01 },
  ],
};

export function inferMistura90Scenario(type: string): Mistura90ScenarioMode {
  if (type === "Peneira") return "peneira";
  if (type === "Transportador") return "transportador";
  if (type === "Moinho") return "moinho";
  return "elevador";
}

export function cloneScenarioInputs(mode: Mistura90ScenarioMode) {
  return mistura90ScenarioPresets[mode].map((input) => ({ ...input }));
}

export function calculateMistura90Scenario(mode: Mistura90ScenarioMode, inputs: Mistura90ScenarioInput[]): Mistura90ScenarioResult {
  const values = Object.fromEntries(inputs.map((input) => [input.key, Number(input.value) || 0]));

  if (mode === "peneira") return calculatePeneira(inputs, values);
  if (mode === "transportador") return calculateTransportador(inputs, values);
  if (mode === "moinho") return calculateMoinho(inputs, values);
  return calculateElevador(inputs, values);
}

function calculateElevador(inputs: Mistura90ScenarioInput[], v: Record<string, number>): Mistura90ScenarioResult {
  const q = (3600 * v.V * v.n * v.v * v.CF1 * v.CF2 * v.gamma) / v.e;
  const pm = (1000 * v.n * v.gamma * v.V * v.CF1) / v.e;
  const ca = Math.PI * v.D + 2 * v.H;
  const n1 = (1000 * ca * v.n) / v.e;
  const te = ((v.H + 12 * v.D) * pm) / Math.max(v.e / 1000, 0.001);
  const tm = (1 + v.k) * te;
  return {
    mode: "elevador",
    title: "Dimensionamento rapido de elevador i9TMG",
    source: "Baseado nas abas 110-EL do Excel Mistura 90",
    inputs,
    outputs: [
      output("Q", "Capacidade estimada", q, "m3/h", q > 0 ? "ok" : "warning"),
      output("Pm", "Peso por metro de material", pm, "kg/m", "ok"),
      output("Ca", "Comprimento aberto", ca, "m", "ok"),
      output("N1", "Numero de canecas", n1, "un", n1 > 0 ? "ok" : "warning"),
      output("Te", "Tensao efetiva", te, "kgf", te > 5000 ? "warning" : "ok"),
      output("Tm", "Tensao maxima", tm, "kgf", tm > 8000 ? "critical" : "ok"),
    ],
    steps: [
      `Q = (3600 x ${v.V} x ${v.n} x ${v.v} x ${v.CF1} x ${v.CF2} x ${v.gamma}) / ${v.e}`,
      `Q = ${format(q)} m3/h`,
      `Ca = pi x ${v.D} + 2 x ${v.H} = ${format(ca)} m`,
      `N1 = (1000 x ${format(ca)} x ${v.n}) / ${v.e} = ${format(n1)} canecas`,
      `Tm = (1 + ${v.k}) x ${format(te)} = ${format(tm)} kgf`,
    ],
    warnings: buildWarnings([
      [v.e <= 0, "Passo das canecas precisa ser maior que zero."],
      [tm > 8000, "Tensao maxima elevada: validar carcaça da correia, lonas e fator de seguranca."],
      [q < 100, "Capacidade abaixo do alvo tipico da Mistura 90: revisar caneca, velocidade ou enchimento."],
    ]),
  };
}

function calculatePeneira(inputs: Mistura90ScenarioInput[], v: Record<string, number>): Mistura90ScenarioResult {
  const factor = v.Cunit * v.F1 * v.F2 * v.F3 * v.F4 * v.F5 * v.F6;
  const areaRequired = v.Q / Math.max(factor, 0.001);
  const areaSelected = (Math.PI * v.D * v.L) / 3;
  const rc = 42.2 / Math.sqrt(Math.max(v.D, 0.001));
  const rpm = rc * v.rpmFactor;
  const margin = ((areaSelected / Math.max(areaRequired, 0.001)) - 1) * 100;
  return {
    mode: "peneira",
    title: "Dimensionamento rapido de peneira i9TMG",
    source: "Baseado nas abas 110-PN do Excel Mistura 90",
    inputs,
    outputs: [
      output("Areq", "Area requerida", areaRequired, "m2", margin >= 0 ? "ok" : "warning"),
      output("Asel", "Area selecionada", areaSelected, "m2", margin >= 0 ? "ok" : "warning"),
      output("Margem", "Margem de area", margin, "%", margin >= 10 ? "ok" : margin >= 0 ? "warning" : "critical"),
      output("Rc", "Rotacao critica", rc, "rpm", "ok"),
      output("rpm", "Rotacao de trabalho", rpm, "rpm", "ok"),
    ],
    steps: [
      `Areq = ${v.Q} / (${v.Cunit} x ${v.F1} x ${v.F2} x ${v.F3} x ${v.F4} x ${v.F5} x ${v.F6})`,
      `Areq = ${format(areaRequired)} m2`,
      `Asel = pi x ${v.D} x ${v.L} / 3 = ${format(areaSelected)} m2`,
      `Rc = 42,2 / sqrt(${v.D}) = ${format(rc)} rpm`,
      `rpm = ${format(rc)} x ${v.rpmFactor} = ${format(rpm)} rpm`,
    ],
    warnings: buildWarnings([
      [margin < 0, "Area selecionada menor que a requerida: ampliar gaiola, comprimento ou revisar fatores."],
      [margin >= 0 && margin < 10, "Margem de area apertada: validar eficiencia e variacao de alimentacao."],
      [rpm > rc * 0.65, "Rotacao de trabalho alta em relacao a critica: revisar regime operacional."],
    ]),
  };
}

function calculateTransportador(inputs: Mistura90ScenarioInput[], v: Record<string, number>): Mistura90ScenarioResult {
  const q = 3600 * v.S * v.v * v.gamma * v.eta;
  const project = q * v.projectFactor;
  const beltReserve = v.L * 1.08;
  return {
    mode: "transportador",
    title: "Dimensionamento rapido de transportador i9TMG",
    source: "Baseado nas abas 110-TP e criterio ABNT NBR 8011 usado no Excel",
    inputs,
    outputs: [
      output("Q", "Capacidade nominal", q, "t/h", "ok"),
      output("Qproj", "Capacidade de projeto", project, "t/h", project > 250 ? "warning" : "ok"),
      output("B", "Largura da correia", v.B, "pol", "ok"),
      output("Lres", "Correia com reserva", beltReserve, "m", "ok"),
    ],
    steps: [
      `Q = 3600 x ${v.S} x ${v.v} x ${v.gamma} x ${v.eta}`,
      `Q = ${format(q)} t/h`,
      `Qprojeto = ${format(q)} x ${v.projectFactor} = ${format(project)} t/h`,
      `Reserva de correia = ${v.L} x 1,08 = ${format(beltReserve)} m`,
    ],
    warnings: buildWarnings([
      [v.B < 24, "Largura de correia baixa para operacao industrial robusta: revisar capacidade e granulometria."],
      [project > 250, "Capacidade de projeto alta: verificar roletes, cavaletes, potencia e transferencia."],
    ]),
  };
}

function calculateMoinho(inputs: Mistura90ScenarioInput[], v: Record<string, number>): Mistura90ScenarioResult {
  const finalMicron = v.d1 * 1000;
  const initialMicron = v.d0 * 1000;
  const energy = 10 * v.Wi * ((1 / Math.sqrt(finalMicron)) - (1 / Math.sqrt(initialMicron)));
  const tphShort = (v.T * 1000) / 907;
  const kw = energy * tphShort * v.Fs;
  const cv = kw * 1.35962;
  const rotor = v.motorRpm * (v.poliaMotor / Math.max(v.poliaMaq, 0.001));
  return {
    mode: "moinho",
    title: "Dimensionamento rapido de moinho i9TMG",
    source: "Baseado na aba 110-MO do Excel Mistura 90",
    inputs,
    outputs: [
      output("Et", "Energia especifica", energy, "kWh/t", "ok"),
      output("Pkw", "Potencia estimada", kw, "kW", kw > 15 ? "warning" : "ok"),
      output("Pcv", "Potencia estimada", cv, "cv", cv > 20 ? "warning" : "ok"),
      output("rotor", "Rotacao do rotor", rotor, "rpm", "ok"),
    ],
    steps: [
      `Et = 10 x ${v.Wi} x (1/sqrt(${finalMicron}) - 1/sqrt(${initialMicron}))`,
      `Et = ${format(energy)} kWh/t`,
      `P = ${format(energy)} x ${format(tphShort)} x ${v.Fs} = ${format(kw)} kW`,
      `Rotor = ${v.motorRpm} x (${v.poliaMotor} / ${v.poliaMaq}) = ${format(rotor)} rpm`,
    ],
    warnings: buildWarnings([
      [v.d1 >= v.d0, "Produto final deve ser menor que o produto inicial."],
      [cv > 20, "Potencia acima da selecao de referencia: revisar motor, polias e fator de servico."],
    ]),
  };
}

function output(key: string, label: string, value: number, unit: string, status: Mistura90ScenarioOutput["status"] = "ok"): Mistura90ScenarioOutput {
  return { key, label, value: Number.isFinite(value) ? value : 0, unit, status };
}

function buildWarnings(items: Array<[boolean, string]>) {
  return items.filter(([condition]) => condition).map(([, message]) => message);
}

export function formatScenarioValue(value: number) {
  return format(value);
}

function format(value: number) {
  return new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 3 }).format(Number.isFinite(value) ? value : 0);
}
