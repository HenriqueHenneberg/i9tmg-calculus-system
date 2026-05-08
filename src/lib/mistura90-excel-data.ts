export type Mistura90EquipmentType =
  | "Elevador"
  | "Peneira"
  | "Moinho"
  | "Transportador"
  | "Misturador"
  | "Dosador";

export type Mistura90Criticality = "Alta" | "Media" | "Baixa" | "Pendente";

export interface Mistura90Metric {
  label: string;
  value: string | number;
  unit?: string;
  tone?: "primary" | "success" | "warning" | "info";
}

export interface Mistura90Equipment {
  id: string;
  code: string;
  sheet: string;
  name: string;
  type: Mistura90EquipmentType;
  status: "Calculado" | "Com pendencias";
  description: string;
  metrics: Mistura90Metric[];
  formulas: string[];
}

export interface Mistura90ReportItem {
  id: string;
  equipmentId: string;
  item: string;
  quantity?: number;
  description?: string;
  note?: string;
}

export interface Mistura90WorkbookSheet {
  name: string;
  rows: number;
  columns: number;
  formulas: number;
  purpose: string;
}

export const mistura90Workbook = {
  fileName: "Calculos Equipamentos Mistura 90 (2).xlsx",
  sourceLabel: "Planilha tecnica protegida por senha, analisada em 08/05/2026",
  sheets: 11,
  equipmentCount: 13,
  summaryRows: 135,
  formulaCells: 2190,
};

export const mistura90Sheets: Mistura90WorkbookSheet[] = [
  { name: "110-EL-001", rows: 484, columns: 33, formulas: 327, purpose: "Elevador EL 01 Mistura 90" },
  { name: "110-PN-001", rows: 460, columns: 21, formulas: 40, purpose: "Peneira rotativa abertura malha 10" },
  { name: "110-MO-001", rows: 122, columns: 15, formulas: 48, purpose: "Moinho tipo facas" },
  { name: "110-EL-002", rows: 483, columns: 33, formulas: 329, purpose: "Elevador EL 02 Mistura 90" },
  { name: "110-PN-002", rows: 460, columns: 21, formulas: 40, purpose: "Peneira rotativa malha 10" },
  { name: "110-TP-001", rows: 220, columns: 26, formulas: 135, purpose: "Transportador de correia" },
  { name: "110-TP-002", rows: 220, columns: 26, formulas: 135, purpose: "Transportador de correia" },
  { name: "110-TP-003", rows: 220, columns: 26, formulas: 135, purpose: "Transportador de correia" },
  { name: "110-TP-004", rows: 908, columns: 26, formulas: 350, purpose: "Transportador do Big-Bag" },
  { name: "110 - EL- 003", rows: 484, columns: 32, formulas: 308, purpose: "Elevador EL 01 Descarga" },
  { name: "RESUMO", rows: 137, columns: 5, formulas: 1, purpose: "Relatorio de materiais e selecoes" },
];

export const mistura90Equipments: Mistura90Equipment[] = [
  {
    id: "110-el-001",
    code: "110 EL-001",
    sheet: "110-EL-001",
    name: "Elevador EL 01 Mistura 90",
    type: "Elevador",
    status: "Calculado",
    description: "Elevador principal de Mistura 90 com verificacoes de capacidade, correia, tensoes, eixos, motorredutor e rolamentos.",
    metrics: [
      { label: "Capacidade nominal", value: 160.1, unit: "m3/h", tone: "primary" },
      { label: "Capacidade de projeto", value: 297.27, unit: "m3/h", tone: "warning" },
      { label: "Altura", value: 20.6, unit: "m", tone: "info" },
      { label: "Tensao maxima", value: 4632.84, unit: "kgf", tone: "success" },
    ],
    formulas: ["Q = (3600 x V x n x v x CF1 x CF2 x gamma) / e", "Tm = (1 + k) x Te", "d = cbrt((16 x Mi) / (pi x sigmaAdm))"],
  },
  {
    id: "110-el-002",
    code: "110 EL-002",
    sheet: "110-EL-002",
    name: "Elevador EL 02 Mistura 90",
    type: "Elevador",
    status: "Calculado",
    description: "Segundo elevador da linha Mistura 90, com correia de 22 polegadas, tambor de 610 mm e capacidade projetada.",
    metrics: [
      { label: "Capacidade nominal", value: 140.59, unit: "m3/h", tone: "primary" },
      { label: "Capacidade de projeto", value: 262.44, unit: "m3/h", tone: "warning" },
      { label: "Canecas calculadas", value: 123.3, unit: "un", tone: "info" },
      { label: "Tensao maxima", value: 4103.37, unit: "kgf", tone: "success" },
    ],
    formulas: ["Pm = (1000 x n x gamma x V) / e", "Tp = (p x N1) / 2 + (pc x Ca) / 4 + (p1 x N1) / 4", "N = (v x Pm x n x (H + 7 x D)) / (75 x eta)"],
  },
  {
    id: "110-el-003",
    code: "110 EL-003",
    sheet: "110 - EL- 003",
    name: "Elevador EL 01 Descarga",
    type: "Elevador",
    status: "Calculado",
    description: "Elevador de descarga com menor altura, correia 3PN2000 e selecao propria de tambor, mancais e canecas.",
    metrics: [
      { label: "Capacidade nominal", value: 77.44, unit: "m3/h", tone: "primary" },
      { label: "Capacidade de projeto", value: 154.87, unit: "m3/h", tone: "warning" },
      { label: "Altura", value: 10, unit: "m", tone: "info" },
      { label: "Tensao maxima", value: 1725.25, unit: "kgf", tone: "success" },
    ],
    formulas: ["Ca = pi x D + 2 x H", "N1 = (1000 x Ca x n) / e", "Ut = Tm / B"],
  },
  {
    id: "110-pn-001",
    code: "110 PN001",
    sheet: "110-PN-001",
    name: "Peneira Rotativa PN001",
    type: "Peneira",
    status: "Calculado",
    description: "Peneira rotativa com abertura de malha 10, area requerida, area selecionada, rotacao e potencia estimada.",
    metrics: [
      { label: "Alimentacao", value: 160, unit: "t/h", tone: "primary" },
      { label: "Area requerida", value: 3.33, unit: "m2", tone: "warning" },
      { label: "Area selecionada", value: 3.8, unit: "m2", tone: "success" },
      { label: "Potencia", value: 4.44, unit: "cv", tone: "info" },
    ],
    formulas: ["Area requerida = capacidade / fatores de peneiramento", "rpm = 42,2 / sqrt(D)", "Potencia = funcao da rotacao, diametro e carga"],
  },
  {
    id: "110-pn-002",
    code: "110 PN002",
    sheet: "110-PN-002",
    name: "Peneira Rotativa PN002",
    type: "Peneira",
    status: "Calculado",
    description: "Peneira rotativa de 140 t/h com gaiola menor, eixo motriz de 127 mm e tela modular inox.",
    metrics: [
      { label: "Alimentacao", value: 140, unit: "t/h", tone: "primary" },
      { label: "Area requerida", value: 2.78, unit: "m2", tone: "warning" },
      { label: "Area selecionada", value: 3.11, unit: "m2", tone: "success" },
      { label: "Potencia", value: 3.35, unit: "cv", tone: "info" },
    ],
    formulas: ["Areq = Q / fatores", "TR = 60 / rpm", "Volume util = geometria da gaiola"],
  },
  {
    id: "110-pn-003",
    code: "110 PN003",
    sheet: "RESUMO",
    name: "Peneira Vibratoria PN003",
    type: "Peneira",
    status: "Com pendencias",
    description: "Conjunto vibratorio com motovibradores, coxins e tela harpa. A planilha marca confirmacao pendente de desenho.",
    metrics: [
      { label: "Motovibradores", value: 2, unit: "un", tone: "primary" },
      { label: "Coxins", value: 156, unit: "un", tone: "warning" },
      { label: "Telas", value: 6, unit: "un", tone: "info" },
      { label: "Pendencias", value: 1, unit: "item", tone: "warning" },
    ],
    formulas: ["Selecao por lista tecnica do RESUMO", "Validacao dimensional pelo desenho final"],
  },
  {
    id: "110-mo-001",
    code: "110 MO001",
    sheet: "110-MO-001",
    name: "Moinho tipo facas MO001",
    type: "Moinho",
    status: "Calculado",
    description: "Moinho dimensionado por energia especifica, taxa de alimentacao, potencia, rotor, camara e esforco no conjunto.",
    metrics: [
      { label: "Wi", value: 11.61, unit: "", tone: "info" },
      { label: "Taxa", value: 8, unit: "t/h", tone: "primary" },
      { label: "Potencia", value: 12.25, unit: "cv", tone: "success" },
      { label: "Diametro camara", value: 0.647, unit: "m", tone: "warning" },
    ],
    formulas: ["Energia = 10 x Wi x (1/sqrt(d1) - 1/sqrt(d0))", "Potencia = energia x taxa", "Torque = potencia x 716,2 / rpm"],
  },
  {
    id: "110-tp-001",
    code: "110 TP001",
    sheet: "110-TP-001",
    name: "Transportador TP001",
    type: "Transportador",
    status: "Com pendencias",
    description: "Transportador de correia 30 polegadas com motorredutor N06, roletes de retorno e itens de carga a definir.",
    metrics: [
      { label: "Capacidade nominal", value: 113.97, unit: "m3/h", tone: "primary" },
      { label: "Capacidade projeto", value: 151.96, unit: "m3/h", tone: "warning" },
      { label: "Velocidade", value: 0.542, unit: "m/s", tone: "info" },
      { label: "Pendencias", value: 2, unit: "itens", tone: "warning" },
    ],
    formulas: ["Q = 3600 x area x velocidade x gamma", "FA = fator de ajuste por capacidade", "Selecao de roletes por largura e carga"],
  },
  {
    id: "110-tp-002",
    code: "110 TP002",
    sheet: "110-TP-002",
    name: "Transportador TP002",
    type: "Transportador",
    status: "Com pendencias",
    description: "Transportador similar ao TP001, com menor comprimento de correia e oito roletes de retorno.",
    metrics: [
      { label: "Capacidade nominal", value: 113.97, unit: "m3/h", tone: "primary" },
      { label: "Correia", value: 8, unit: "m", tone: "info" },
      { label: "Roletes retorno", value: 8, unit: "un", tone: "success" },
      { label: "Pendencias", value: 2, unit: "itens", tone: "warning" },
    ],
    formulas: ["Q = 3600 x area x velocidade x gamma", "Validacao de correia 2PN2200", "Resumo de compras por componente"],
  },
  {
    id: "110-tp-003",
    code: "110 TP003",
    sheet: "110-TP-003",
    name: "Transportador TP003",
    type: "Transportador",
    status: "Com pendencias",
    description: "Transportador de maior extensao, motorredutor N07 e 45 roletes de retorno no resumo.",
    metrics: [
      { label: "Capacidade nominal", value: 109.34, unit: "m3/h", tone: "primary" },
      { label: "Capacidade projeto", value: 145.79, unit: "m3/h", tone: "warning" },
      { label: "Correia", value: 35, unit: "m", tone: "info" },
      { label: "Roletes retorno", value: 45, unit: "un", tone: "success" },
    ],
    formulas: ["Q = 3600 x area x velocidade x gamma", "Verificacao por capacidade menor", "Selecao por fator de servico 2,11"],
  },
  {
    id: "110-tp-004",
    code: "110 TP004",
    sheet: "110-TP-004",
    name: "Transportador do Big-Bag TP004",
    type: "Transportador",
    status: "Com pendencias",
    description: "Transportador do Big-Bag com maior capacidade, cavaletes definidos, roletes de carga e retorno.",
    metrics: [
      { label: "Capacidade nominal", value: 192.4, unit: "m3/h", tone: "primary" },
      { label: "Capacidade projeto", value: 299.29, unit: "m3/h", tone: "warning" },
      { label: "Velocidade", value: 1.08, unit: "m/s", tone: "info" },
      { label: "Roletes carga", value: 36, unit: "un", tone: "success" },
    ],
    formulas: ["Q = 3600 x area x velocidade x gamma", "FA = fator de ajuste por capacidade", "Dimensionamento por largura 30 polegadas"],
  },
  {
    id: "110-mm-001",
    code: "110 MM001",
    sheet: "RESUMO",
    name: "Misturador MM001",
    type: "Misturador",
    status: "Com pendencias",
    description: "Misturador com motorredutor V12 e varios itens ainda sem quantidade definida no resumo.",
    metrics: [
      { label: "Motorredutor", value: 30, unit: "HP", tone: "primary" },
      { label: "Itens sem quantidade", value: 8, unit: "itens", tone: "warning" },
      { label: "Eixos informados", value: 3, unit: "linhas", tone: "info" },
      { label: "Status", value: "Aberto", tone: "warning" },
    ],
    formulas: ["Selecao preliminar por motorredutor", "Pendencias dimensionais por desenho do misturador"],
  },
  {
    id: "110-dr-001",
    code: "110 DR001",
    sheet: "RESUMO",
    name: "Dosador DR001",
    type: "Dosador",
    status: "Com pendencias",
    description: "Dosador com motorredutor com motofreio, mancais e eixo; resumo pede conferencia com desenho.",
    metrics: [
      { label: "Motorredutor", value: 1, unit: "un", tone: "primary" },
      { label: "Mancais", value: 2, unit: "un", tone: "success" },
      { label: "Pendencias", value: 1, unit: "item", tone: "warning" },
      { label: "Eixo", value: 102, unit: "mm", tone: "info" },
    ],
    formulas: ["Selecao por baixa rotacao", "Conferencia de mancal e eixo com desenho final"],
  },
];

export const mistura90ReportItems: Mistura90ReportItem[] = [
  { id: "110-el-001-01", equipmentId: "110-el-001", item: "Motorredutor", quantity: 1, description: "MOTORREDUTOR V 10 2 1:37,26 BGA 180M 30HP 4P 60Hz P3, B5, IP65, DISCO, RECUO LIVRE AH, fs1,79" },
  { id: "110-el-001-02", equipmentId: "110-el-001", item: "Correia", quantity: 46, description: "CORREIA ELEVADORA 22\" 4PN3000, REVEST. 1/8\"x1/8\" NBR REACAO" },
  { id: "110-el-001-03", equipmentId: "110-el-001", item: "Mancal Motriz", quantity: 2, description: "Kit mancal SNH 526 TSN L, rol diam. 115, 22226 EK, H3126, 2 FRB 13/230" },
  { id: "110-el-001-04", equipmentId: "110-el-001", item: "Mancal Esticador", quantity: 2, description: "Kit mancal SNH 516 TSN L, rol diam. 70, 22216EK, H316, 2 FRB 12.5/140" },
  { id: "110-el-001-05", equipmentId: "110-el-001", item: "Tambor Motriz", quantity: 1, description: "Diam. 620mm, comprim. 710mm, ranhurado V 30x5, abaulado 6mm, borracha nitilica 13mm" },
  { id: "110-el-001-06", equipmentId: "110-el-001", item: "Tambor Esticador", quantity: 1, description: "Diam. 550mm, comprim. 710mm, gaiola com cone" },
  { id: "110-el-001-07", equipmentId: "110-el-001", item: "Eixo Motriz", quantity: 1, description: "Diam. 140mm - 1780mm SAE 4140" },
  { id: "110-el-001-08", equipmentId: "110-el-001", item: "Eixo Esticador", quantity: 1, description: "Diam. 89mm - 1650mm SAE 1045" },
  { id: "110-el-001-09", equipmentId: "110-el-001", item: "Siit Lock Motriz", quantity: 4, description: "tipo_4 medida 130x180" },
  { id: "110-el-001-10", equipmentId: "110-el-001", item: "Siit Lock Motriz", quantity: 2, description: "tipo_1 medida 95x135" },
  { id: "110-el-001-11", equipmentId: "110-el-001", item: "Canecas", quantity: 104, description: "Centrifugas chapa 3/16 - 550 x 220 x 230 passo 430mm" },
  { id: "110-el-002-01", equipmentId: "110-el-002", item: "Motorredutor", quantity: 1, description: "MOTORREDUTOR V 10 2 1:37,26 BGA 180M 30HP 4P 60Hz P3, B5, IP65, DISCO, RECUO LIVRE H, fs1,79" },
  { id: "110-el-002-02", equipmentId: "110-el-002", item: "Correia", quantity: 45, description: "CORREIA ELEVADORA 22\" 4PN3000, REVEST. 1/8\"x1/8\" NBR REACAO" },
  { id: "110-el-002-03", equipmentId: "110-el-002", item: "Mancal Motriz", quantity: 2, description: "Kit mancal SNH 526 TSN L, rol diam. 115, 22226 EK, H3126, 2 FRB 13/230" },
  { id: "110-el-002-04", equipmentId: "110-el-002", item: "Mancal Esticador", quantity: 2, description: "Kit mancal SNH 516 TSN L, rol diam. 70, 22216EK, H316, 2 FRB 12.5/140" },
  { id: "110-el-002-05", equipmentId: "110-el-002", item: "Tambor Motriz", quantity: 1, description: "Diam. 620mm, comprim. 610mm, ranhurado V 30x5, abaulado 6mm, borracha nitilica 13mm" },
  { id: "110-el-002-06", equipmentId: "110-el-002", item: "Tambor Esticador", quantity: 1, description: "Diam. 550mm, comprim. 610mm, gaiola com cone" },
  { id: "110-el-002-07", equipmentId: "110-el-002", item: "Eixo Motriz", quantity: 1, description: "Diam. 127mm - 1500mm SAE 4140" },
  { id: "110-el-002-08", equipmentId: "110-el-002", item: "Eixo Esticador", quantity: 1, description: "Diam. 89mm - 1000mm SAE 1045" },
  { id: "110-el-002-09", equipmentId: "110-el-002", item: "Siit Lock Motriz", quantity: 4, description: "tipo_4 medida 120x165" },
  { id: "110-el-002-10", equipmentId: "110-el-002", item: "Siit Lock Esticador", quantity: 2, description: "tipo_1 medida 70x110" },
  { id: "110-el-002-11", equipmentId: "110-el-002", item: "Canecas", quantity: 102, description: "Centrifugas chapa 3/16 - 450 x 220 x 230 passo 430mm" },
  { id: "110-mo-001-01", equipmentId: "110-mo-001", item: "Motor", quantity: 1, description: "MOTOR ELETRICO COM PES WEG W22 IR3 PREMIUM 15CV 4P 132M 3F 220/380/440V 60Hz CX LIG DIR IP65, B3E" },
  { id: "110-mo-001-02", equipmentId: "110-mo-001", item: "Mancal Esticador", quantity: 2, description: "Kit mancal SNH 515 TSN L, rol diam. 65, 22215EK, H315, 2 FRB 12.5/130" },
  { id: "110-mo-001-03", equipmentId: "110-mo-001", item: "Polia Motor", quantity: 1, description: "POLIA EM V 3 CANAIS TIPO B diam. 250mm" },
  { id: "110-mo-001-04", equipmentId: "110-mo-001", item: "Polia Maq", quantity: 1, description: "POLIA EM V 3 CANAIS TIPO B diam. 200mm" },
  { id: "110-pn-001-01", equipmentId: "110-pn-001", item: "Motorredutor", quantity: 1, description: "MOTORREDUTOR N 09 3 1:109,7 BGA 112M 6HP 4P 60Hz P1 B5D/B14D, IP65, DISCO, fs 1,75" },
  { id: "110-pn-001-02", equipmentId: "110-pn-001", item: "Mancal", quantity: 2, description: "Kit mancal SNH 516 TSN L, rol diam. 70, 2216K, H316, 2 FRB 12.5/140" },
  { id: "110-pn-001-03", equipmentId: "110-pn-001", item: "Gaiola da Peneira", quantity: 1, description: "Diam. 1250mm, comprim. 3000mm" },
  { id: "110-pn-001-04", equipmentId: "110-pn-001", item: "Tubo da Gaiola", quantity: 1, description: "Diam. 6\" SCH 80, comprim. 3200mm, ASTM A-53" },
  { id: "110-pn-001-05", equipmentId: "110-pn-001", item: "Eixo Motriz", quantity: 1, description: "Diam. 140mm -1000mm SAE 1045" },
  { id: "110-pn-001-06", equipmentId: "110-pn-001", item: "Eixo Movido", quantity: 1, description: "Diam. 140mm -600mm SAE 1046" },
  { id: "110-pn-001-07", equipmentId: "110-pn-001", item: "Telas", quantity: 6, description: "INOX 304 aberturas 15 x 10mm fio 3,2mm modulos 1000 x 2000mm com moldura" },
  { id: "110-pn-003-01", equipmentId: "110-pn-003", item: "Motovibrador", quantity: 2, description: "MOTOVIBRADOR MVL ARC-100-1200 1,5CV 2P 60Hz IP66 IR3 (380V)" },
  { id: "110-pn-003-02", equipmentId: "110-pn-003", item: "Coxim Motovibrador", quantity: 60, description: "56,5 X 50 VAZADO" },
  { id: "110-pn-003-03", equipmentId: "110-pn-003", item: "Coxim Tela", quantity: 60, description: "50 X 28 X 26 FLANGE", note: "Confirmar assim que pronto o desenho" },
  { id: "110-pn-003-04", equipmentId: "110-pn-003", item: "Coxim Tela", quantity: 12, description: "93 X 55 - ROSCA 5 -8" },
  { id: "110-pn-003-05", equipmentId: "110-pn-003", item: "Coxim Deck", quantity: 24, description: "50 X 50 - ROSCA 5/8\"" },
  { id: "110-pn-003-06", equipmentId: "110-pn-003", item: "Telas", quantity: 6, description: "TELA HARPA (III) 1,5mm COM ABERTURA DE 1,4 X 50 mm COM ILHOS" },
  { id: "110-pn-002-01", equipmentId: "110-pn-002", item: "Motorredutor", quantity: 1, description: "MOTORREDUTOR N 09 3 1:94,9 BGA 112M 5HP 4P 60Hz P1 B5D/B14D, IP65, DISCO, fs 1,75" },
  { id: "110-pn-002-02", equipmentId: "110-pn-002", item: "Mancal", quantity: 2, description: "Kit mancal SNH 515 TSN L, rol diam. 65, 2215K, H315, 2 FRB 12.5/130" },
  { id: "110-pn-002-03", equipmentId: "110-pn-002", item: "Gaiola da Peneira", quantity: 1, description: "Diam. 1120mm, comprim. 2800mm" },
  { id: "110-pn-002-04", equipmentId: "110-pn-002", item: "Tubo da Gaiola", quantity: 1, description: "Diam. 5\" SCH 80, comprim. 3000mm, ASTM A-53" },
  { id: "110-pn-002-05", equipmentId: "110-pn-002", item: "Eixo Motriz", quantity: 1, description: "Diam. 127mm - 1000mm SAE 1045" },
  { id: "110-pn-002-06", equipmentId: "110-pn-002", item: "Eixo Movido", quantity: 1, description: "Diam. 127mm - 600mm SAE 1046" },
  { id: "110-pn-002-07", equipmentId: "110-pn-002", item: "Telas", quantity: 6, description: "INOX 304 aberturas 15 x 10mm fio 3,2mm modulos 930x 1800mm com moldura" },
  { id: "110-tp-001-01", equipmentId: "110-tp-001", item: "Motorredutor", quantity: 1, description: "MOTORREDUTOR N 06 3 1:58,89 BGA 90S 2HP 4P 60Hz B5D/B14D - DISCO, SAIDA LADO 1, P3, A1, fs 1,7" },
  { id: "110-tp-001-02", equipmentId: "110-tp-001", item: "Correia (m)", quantity: 14, description: "CORREIA TRANSP. 30\" 2PN2200, REVEST. 3/16\"x1/16\" SBR CORRUGADA" },
  { id: "110-tp-001-03", equipmentId: "110-tp-001", item: "Mancal Motriz", quantity: 2, description: "Kit mancal SNH 515 TSN L, rol diam. 65, 2215K, H315, 2 FRB 12.5/130" },
  { id: "110-tp-001-04", equipmentId: "110-tp-001", item: "Mancal Esticador", quantity: 2, description: "Kit mancal SNH 512 TSN L, rol diam. 55, 2212K, H312, 2 FRB 10/110" },
  { id: "110-tp-001-05", equipmentId: "110-tp-001", item: "Tambor Motriz", quantity: 1, description: "Diam. 323mm, comprim. 870mm, ranhurado V 30x5, abaulado 6mm, borracha nitilica 13mm" },
  { id: "110-tp-001-06", equipmentId: "110-tp-001", item: "Tambor Esticador", quantity: 1, description: "Diam. 323mm, comprim. 870mm, liso, abaulado 6mm, borracha nitilica 13mm" },
  { id: "110-tp-001-07", equipmentId: "110-tp-001", item: "Eixo Motriz", quantity: 1, description: "Diam. 76,2mm -1680mm SAE 1045" },
  { id: "110-tp-001-08", equipmentId: "110-tp-001", item: "Eixo Esticador", quantity: 1, description: "Diam. 63,5mm - 1280mm SAE 1045" },
  { id: "110-tp-001-09", equipmentId: "110-tp-001", item: "Siit Lock Motriz", quantity: 1, description: "tipo_1 medida 75x115" },
  { id: "110-tp-001-10", equipmentId: "110-tp-001", item: "Siit Lock Motriz", quantity: 1, description: "tipo_1 medida 60x90" },
  { id: "110-tp-001-11", equipmentId: "110-tp-001", item: "Roletes Retorno", quantity: 15, description: "Diam. 102 Kanaflex azul, corpo 837mm, eixo diam. 20 x 871mm, pescoco 14x9x4mm, rol 6204, vedacao plast. p/ fertilizantes" },
  { id: "110-tp-001-12", equipmentId: "110-tp-001", item: "Roletes de Carga" },
  { id: "110-tp-001-13", equipmentId: "110-tp-001", item: "Cavaletes de Carga" },
  { id: "110-tp-002-01", equipmentId: "110-tp-002", item: "Motorredutor", quantity: 1, description: "MOTORREDUTOR N 06 3 1:58,89 BGA 90S 2HP 4P 60Hz B5D/B14D - DISCO, SAIDA LADO 1, P1, A1, fs 1,7" },
  { id: "110-tp-002-02", equipmentId: "110-tp-002", item: "Correia (m)", quantity: 8, description: "CORREIA TRANSP. 30\" 2PN2200, REVEST. 3/16\"x1/16\" SBR CORRUGADA" },
  { id: "110-tp-002-03", equipmentId: "110-tp-002", item: "Mancal Motriz", quantity: 2, description: "Kit mancal SNH 515 TSN L, rol diam. 65, 2215K, H315, 2 FRB 12.5/130" },
  { id: "110-tp-002-04", equipmentId: "110-tp-002", item: "Mancal Esticador", quantity: 2, description: "Kit mancal SNH 512 TSN L, rol diam. 55, 2212K, H312, 2 FRB 10/110" },
  { id: "110-tp-002-05", equipmentId: "110-tp-002", item: "Tambor Motriz", quantity: 1, description: "Diam. 323mm, comprim. 870mm, ranhurado V 30x5, abaulado 6mm, borracha nitilica 13mm" },
  { id: "110-tp-002-06", equipmentId: "110-tp-002", item: "Tambor Esticador", quantity: 1, description: "Diam. 323mm, comprim. 870mm, liso, abaulado 6mm, borracha nitilica 13mm" },
  { id: "110-tp-002-07", equipmentId: "110-tp-002", item: "Eixo Motriz", quantity: 1, description: "Diam. 76,2mm -1680mm SAE 1045" },
  { id: "110-tp-002-08", equipmentId: "110-tp-002", item: "Eixo Esticador", quantity: 1, description: "Diam. 63,5mm - 1280mm SAE 1045" },
  { id: "110-tp-002-09", equipmentId: "110-tp-002", item: "Siit Lock Motriz", quantity: 1, description: "tipo_1 medida 75x115" },
  { id: "110-tp-002-10", equipmentId: "110-tp-002", item: "Siit Lock Motriz", quantity: 1, description: "tipo_1 medida 60x90" },
  { id: "110-tp-002-11", equipmentId: "110-tp-002", item: "Roletes Retorno", quantity: 8, description: "Diam. 102 Kanaflex azul, corpo 837mm, eixo diam. 20 x 871mm, pescoco 14x9x4mm, rol 6204, vedacao plast. p/ fertilizantes" },
  { id: "110-tp-002-12", equipmentId: "110-tp-002", item: "Roletes de Carga" },
  { id: "110-tp-002-13", equipmentId: "110-tp-002", item: "Cavaletes de Carga" },
  { id: "110-tp-003-01", equipmentId: "110-tp-003", item: "Motorredutor", quantity: 1, description: "MOTORREDUTOR N 07 3 1:61,25 BGA 90L 3HP 4P 60Hz B5D/B14D - DISCO, SAIDA LADO 1, P1, A1, fs 2,11" },
  { id: "110-tp-003-02", equipmentId: "110-tp-003", item: "Correia (m)", quantity: 35, description: "CORREIA TRANSP. 30\" 2PN2200, REVEST. 3/16\"x1/16\" SBR CORRUGADA" },
  { id: "110-tp-003-03", equipmentId: "110-tp-003", item: "Mancal Motriz", quantity: 2, description: "Kit mancal SNH 515 TSN L, rol diam. 65, 2215K, H315, 2 FRB 12.5/130" },
  { id: "110-tp-003-04", equipmentId: "110-tp-003", item: "Mancal Esticador", quantity: 2, description: "Kit mancal SNH 512 TSN L, rol diam. 55, 2212K, H312, 2 FRB 10/110" },
  { id: "110-tp-003-05", equipmentId: "110-tp-003", item: "Tambor Motriz", quantity: 1, description: "Diam. 323mm, comprim. 870mm, ranhurado V 30x5, abaulado 6mm, borracha nitilica 13mm" },
  { id: "110-tp-003-06", equipmentId: "110-tp-003", item: "Tambor Esticador", quantity: 1, description: "Diam. 323mm, comprim. 870mm, liso, abaulado 6mm, borracha nitilica 13mm" },
  { id: "110-tp-003-07", equipmentId: "110-tp-003", item: "Eixo Motriz", quantity: 1, description: "Diam. 76,2mm -1680mm SAE 1045" },
  { id: "110-tp-003-08", equipmentId: "110-tp-003", item: "Eixo Esticador", quantity: 1, description: "Diam. 63,5mm - 1280mm SAE 1045" },
  { id: "110-tp-003-09", equipmentId: "110-tp-003", item: "Siit Lock Motriz", quantity: 1, description: "tipo_1 medida 75x115" },
  { id: "110-tp-003-10", equipmentId: "110-tp-003", item: "Siit Lock Motriz", quantity: 1, description: "tipo_1 medida 60x90" },
  { id: "110-tp-003-11", equipmentId: "110-tp-003", item: "Roletes Retorno", quantity: 45, description: "Diam. 102 Kanaflex azul, corpo 837mm, eixo diam. 20 x 871mm, pescoco 14x9x4mm, rol 6204, vedacao plast. p/ fertilizantes" },
  { id: "110-tp-003-12", equipmentId: "110-tp-003", item: "Roletes de Carga" },
  { id: "110-tp-003-13", equipmentId: "110-tp-003", item: "Cavaletes de Carga" },
  { id: "110-tp-004-01", equipmentId: "110-tp-004", item: "Motorredutor", quantity: 1, description: "N07 3 1:32,4 BGA 112M 7,5HP 4P 60HZ, IP65, P1, B5/B14D, DISCO, SAIDA LADO A (1), BRACO, fs 1,59" },
  { id: "110-tp-004-02", equipmentId: "110-tp-004", item: "Correia (m)", quantity: 16, description: "CORREIA TRANSP. 30\" 2PN2200, REVEST. 3/16\"x1/16\" NBR REACAO" },
  { id: "110-tp-004-03", equipmentId: "110-tp-004", item: "Mancal Motriz", quantity: 2, description: "Kit mancal SNH 520 TSN L, rol diam. 90, 22220 EK, H320, 2 FRB 12/180" },
  { id: "110-tp-004-04", equipmentId: "110-tp-004", item: "Mancal Esticador", quantity: 2, description: "Kit mancal SNH 512 TSN L, rol diam. 55, 2212K, H312, 2 FRB 10/110" },
  { id: "110-tp-004-05", equipmentId: "110-tp-004", item: "Tambor Motriz", quantity: 1, description: "Diam. 355mm, comprim. 870mm, ranhurado V 30x5, abaulado 6mm, borracha nitilica 13mm" },
  { id: "110-tp-004-06", equipmentId: "110-tp-004", item: "Tambor Esticador", quantity: 1, description: "Diam. 355mm, comprim. 870mm, liso, abaulado 6mm, borracha nitilica 13mm" },
  { id: "110-tp-004-07", equipmentId: "110-tp-004", item: "Eixo Motriz", quantity: 1, description: "Diam. 102mm -1680mm SAE 1045" },
  { id: "110-tp-004-08", equipmentId: "110-tp-004", item: "Eixo Esticador", quantity: 1, description: "Diam. 63,5mm - 1280mm SAE 1045" },
  { id: "110-tp-004-09", equipmentId: "110-tp-004", item: "Siit Lock Motriz", quantity: 1, description: "tipo_1 medida 95x135" },
  { id: "110-tp-004-10", equipmentId: "110-tp-004", item: "Siit Lock Motriz", quantity: 1, description: "tipo_1 medida 60x90" },
  { id: "110-tp-004-11", equipmentId: "110-tp-004", item: "Cavaletes", quantity: 12, description: "10 cavaletes 36\" x 35 graus, e 2 cavaletes 36\" x 20 graus" },
  { id: "110-tp-004-12", equipmentId: "110-tp-004", item: "Roletes Carga", quantity: 36, description: "Diam. 102 Kanaflex azul, corpo 280mm, eixo diam. 20 x 306mm, encaixe 14x9mm, rol 6204, vedacao plast. p/ fertilizantes" },
  { id: "110-tp-004-13", equipmentId: "110-tp-004", item: "Roletes Retorno", quantity: 4, description: "Diam. 102 Kanaflex azul, corpo 837mm, eixo diam. 20 x 871mm, pescoco 14x9x4mm, rol 6204, vedacao plast. p/ fertilizantes" },
  { id: "110-tp-004-14", equipmentId: "110-tp-004", item: "Roletes de Carga" },
  { id: "110-tp-004-15", equipmentId: "110-tp-004", item: "Cavaletes de Carga" },
  { id: "110-el-003-01", equipmentId: "110-el-003", item: "Motorredutor", quantity: 1, description: "MOTORREDUTOR V 08 2 1:36 BGA 132M 12,5HP 4P 60Hz P3 B5D/B14D, IP65, DISCO, RECUO LIVRE H, fs1,64" },
  { id: "110-el-003-02", equipmentId: "110-el-003", item: "Correia", quantity: 26, description: "CORREIA ELEVADORA 3PN2000, REVEST. 1/8\"x1/8\" AB DE REACAO" },
  { id: "110-el-003-03", equipmentId: "110-el-003", item: "Mancal Motriz", quantity: 2, description: "Kit mancal SNL 519 TSN L, rol diam. 85, 22219 EK, H319, 2 FRB 12.5/170" },
  { id: "110-el-003-04", equipmentId: "110-el-003", item: "Mancal Esticador", quantity: 2, description: "Kit mancal SNL 511 TSN L, rol diam. 50, 2211EK, H311, FRB 9.5/100" },
  { id: "110-el-003-05", equipmentId: "110-el-003", item: "Tambor Motriz", quantity: 1, description: "Diam. 594mm, comprim. 610mm, ranhurado V 30x5, abaulado 6mm, borracha nitilica 13mm" },
  { id: "110-el-003-06", equipmentId: "110-el-003", item: "Tambor Esticador", quantity: 1, description: "Diam. 520mm, comprim. 610mm, gaiola com cone" },
  { id: "110-el-003-07", equipmentId: "110-el-003", item: "Eixo Motriz", quantity: 1, description: "Diam. 101,6mm - 1278mm ASTM 4140" },
  { id: "110-el-003-08", equipmentId: "110-el-003", item: "Eixo Esticador", quantity: 1, description: "Diam. 63,5mm - 998mm SAE 1045" },
  { id: "110-el-003-09", equipmentId: "110-el-003", item: "Siit Lock Motriz", quantity: 4, description: "tipo_4 medida 100x145" },
  { id: "110-el-003-10", equipmentId: "110-el-003", item: "Siit Lock Esticador", quantity: 2, description: "tipo_1 medida 70x110" },
  { id: "110-el-003-11", equipmentId: "110-el-003", item: "Canecas", quantity: 86, description: "Centrifugas chapa 3/16 - 450 x 220 x 230 passo 300mm" },
  { id: "110-mm-001-01", equipmentId: "110-mm-001", item: "Motorredutor", quantity: 1, description: "MOTORREDUTOR V 12 3 1:58,96 BGA 180 30HP 4P 60Hz P1, B5D, IP65, DISCO, fs 1,84" },
  { id: "110-mm-001-02", equipmentId: "110-mm-001", item: "Mancais", description: "Kit mancal SNL TSN L, rol diam. 85, EK, H, FRB" },
  { id: "110-mm-001-03", equipmentId: "110-mm-001", item: "Tubo do Eixo", description: "Diam. 4\" SCH 80, comprim. 2800mm, ASTM A-53" },
  { id: "110-mm-001-04", equipmentId: "110-mm-001", item: "Eixo Motriz", description: "Diam. 102mm - 800mm SAE 1045" },
  { id: "110-mm-001-05", equipmentId: "110-mm-001", item: "Eixo Movido", description: "Diam. 102mm - 400mm SAE 1045" },
  { id: "110-mm-001-06", equipmentId: "110-mm-001", item: "Haste do Helicoide", description: "INOX 304 aberturas 15 x 10mm fio 3,2mm modulos 930x 1800mm com moldura" },
  { id: "110-mm-001-07", equipmentId: "110-mm-001", item: "Mancal da Comporta" },
  { id: "110-mm-001-08", equipmentId: "110-mm-001", item: "Cilindro Pneumatico" },
  { id: "110-mm-001-09", equipmentId: "110-mm-001", item: "Eixo Comporta", description: "Diam. 102mm - 400mm SAE 1045" },
  { id: "110-dr-001-01", equipmentId: "110-dr-001", item: "Motorredutor", quantity: 1, description: "MOTORREDUTOR N 06 3 1:156,92 BGA 160 4P 60Hz P6, B5D, IP65, DISCO, fs 2,6, SAIDA LADO 2, CLASSE S3, COM MOTOFREIO" },
  { id: "110-dr-001-02", equipmentId: "110-dr-001", item: "Mancal", quantity: 2, description: "Kit mancal SNH 515 TSN L, rol diam. 65, 2215K, H315, 2 FRB 12.5/130", note: "Conferir com o desenho" },
  { id: "110-dr-001-03", equipmentId: "110-dr-001", item: "Eixo", quantity: 1, description: "Diam. 102mm - 800mm SAE 1045" },
];

export function getEquipmentById(equipmentId: string) {
  return mistura90Equipments.find((equipment) => equipment.id === equipmentId);
}

export function getReportItemsByEquipment(equipmentId: string) {
  return mistura90ReportItems.filter((item) => item.equipmentId === equipmentId);
}

export function classifyMistura90Item(item: Mistura90ReportItem) {
  const label = item.item.toLowerCase();
  if (label.includes("motor")) return "Acionamento";
  if (label.includes("correia") || label.includes("caneca") || label.includes("tela")) return "Transporte e processo";
  if (label.includes("mancal") || label.includes("rol")) return "Mancais e rolamentos";
  if (label.includes("tambor") || label.includes("eixo") || label.includes("polia") || label.includes("siit")) return "Conjunto mecanico";
  if (label.includes("rolete") || label.includes("cavalete")) return "Correia transportadora";
  if (label.includes("coxim") || label.includes("vibrador")) return "Vibracao";
  return "Complementar";
}

export function getMistura90Criticality(item: Mistura90ReportItem): Mistura90Criticality {
  if (item.note || !item.quantity || !item.description) return "Pendente";
  const label = item.item.toLowerCase();
  if (label.includes("motor") || label.includes("mancal") || label.includes("eixo") || label.includes("tambor")) return "Alta";
  if (label.includes("correia") || label.includes("caneca") || label.includes("tela") || label.includes("rolete")) return "Media";
  return "Baixa";
}

export function getMistura90Kpis() {
  const totalQuantity = mistura90ReportItems.reduce((total, item) => total + (item.quantity || 0), 0);
  const pendingItems = mistura90ReportItems.filter((item) => getMistura90Criticality(item) === "Pendente").length;
  const beltMeters = mistura90ReportItems
    .filter((item) => item.item.toLowerCase().includes("correia"))
    .reduce((total, item) => total + (item.quantity || 0), 0);
  const bucketCount = mistura90ReportItems
    .filter((item) => item.item.toLowerCase().includes("canecas"))
    .reduce((total, item) => total + (item.quantity || 0), 0);
  const rollerCount = mistura90ReportItems
    .filter((item) => item.item.toLowerCase().includes("rolete"))
    .reduce((total, item) => total + (item.quantity || 0), 0);
  const driveCount = mistura90ReportItems
    .filter((item) => item.item.toLowerCase().includes("motor"))
    .reduce((total, item) => total + (item.quantity || 0), 0);

  return {
    totalQuantity,
    pendingItems,
    beltMeters,
    bucketCount,
    rollerCount,
    driveCount,
    equipments: mistura90Equipments.length,
    reportItems: mistura90ReportItems.length,
  };
}
