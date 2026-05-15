import {
  classifyMistura90Item,
  getEquipmentById,
  getMistura90Criticality,
  getReportItemsByEquipment,
  mistura90Equipments,
  mistura90ReportItems,
  mistura90Workbook,
  type Mistura90Criticality,
  type Mistura90Equipment,
  type Mistura90ReportItem,
} from "@/lib/mistura90-excel-data";

export interface Mistura90CategorySummary {
  category: string;
  itemCount: number;
  quantity: number;
  pending: number;
}

export interface Mistura90EquipmentRelease {
  equipment: Mistura90Equipment;
  itemCount: number;
  totalQuantity: number;
  pendingCount: number;
  highCriticalityCount: number;
  score: number;
  statusLabel: string;
}

export interface Mistura90ActionItem {
  equipmentCode: string;
  item: string;
  criticality: Mistura90Criticality;
  owner: string;
  action: string;
}

export interface Mistura90ReportAnalytics {
  releaseScore: number;
  statusLabel: string;
  totalItems: number;
  totalQuantity: number;
  pendingItems: number;
  highCriticalityItems: number;
  selectedItems: Mistura90ReportItem[];
  selectedScore: number;
  selectedPendingItems: number;
  categorySummaries: Mistura90CategorySummary[];
  selectedCategorySummaries: Mistura90CategorySummary[];
  equipmentReleases: Mistura90EquipmentRelease[];
  actionItems: Mistura90ActionItem[];
  sourceAudit: Array<[string, string]>;
  deliverables: Array<[string, string]>;
}

const categoryOrder = [
  "Acionamento",
  "Conjunto mecanico",
  "Mancais e rolamentos",
  "Transporte e processo",
  "Correia transportadora",
  "Vibracao",
  "Complementar",
];

export function getMistura90ReportAnalytics(selectedEquipmentId: string): Mistura90ReportAnalytics {
  const selectedItems = getReportItemsByEquipment(selectedEquipmentId);
  const pendingItems = mistura90ReportItems.filter((item) => getMistura90Criticality(item) === "Pendente").length;
  const highCriticalityItems = mistura90ReportItems.filter((item) => getMistura90Criticality(item) === "Alta").length;
  const selectedPendingItems = selectedItems.filter((item) => getMistura90Criticality(item) === "Pendente").length;
  const releaseScore = calculateScore(mistura90ReportItems);
  const selectedScore = calculateScore(selectedItems);

  return {
    releaseScore,
    statusLabel: getStatusLabel(releaseScore, pendingItems),
    totalItems: mistura90ReportItems.length,
    totalQuantity: totalQuantity(mistura90ReportItems),
    pendingItems,
    highCriticalityItems,
    selectedItems,
    selectedScore,
    selectedPendingItems,
    categorySummaries: summarizeByCategory(mistura90ReportItems),
    selectedCategorySummaries: summarizeByCategory(selectedItems),
    equipmentReleases: mistura90Equipments.map((equipment) => {
      const items = getReportItemsByEquipment(equipment.id);
      const score = calculateScore(items);
      const pendingCount = items.filter((item) => getMistura90Criticality(item) === "Pendente").length;
      return {
        equipment,
        itemCount: items.length,
        totalQuantity: totalQuantity(items),
        pendingCount,
        highCriticalityCount: items.filter((item) => getMistura90Criticality(item) === "Alta").length,
        score,
        statusLabel: getStatusLabel(score, pendingCount),
      };
    }),
    actionItems: buildActionItems(),
    sourceAudit: [
      ["Arquivo", mistura90Workbook.fileName],
      ["Abas analisadas", String(mistura90Workbook.sheets)],
      ["Celulas com formulas", `${mistura90Workbook.formulaCells}+`],
      ["Linhas RESUMO", String(mistura90Workbook.summaryRows)],
      ["Equipamentos", String(mistura90Workbook.equipmentCount)],
      ["Formato origem", "Excel protegido, aba RESUMO agrupada por equipamento"],
    ],
    deliverables: [
      ["Compra", "Lista consolidada por item, quantidade, descricao, criticidade e pendencias de desenho."],
      ["Fabricacao", "Separacao de eixos, tambores, gaiolas, cavaletes, tubos e conjuntos mecanicos."],
      ["Montagem", "Destaque de acionamentos, correias, canecas, roletes, mancais e pontos de verificacao."],
      ["Qualidade", "Matriz de liberacao com score, pendencias, itens criticos e rastreabilidade da planilha."],
    ],
  };
}

export function getReleaseBadgeClass(score: number, pendingCount: number) {
  if (pendingCount > 0) return "border-warning/25 bg-warning/10 text-warning";
  if (score >= 95) return "border-success/25 bg-success/10 text-success";
  return "border-info/25 bg-info/10 text-info";
}

function summarizeByCategory(items: Mistura90ReportItem[]) {
  const grouped = new Map<string, Mistura90CategorySummary>();
  items.forEach((item) => {
    const category = classifyMistura90Item(item);
    const current = grouped.get(category) || { category, itemCount: 0, quantity: 0, pending: 0 };
    current.itemCount += 1;
    current.quantity += item.quantity || 0;
    current.pending += getMistura90Criticality(item) === "Pendente" ? 1 : 0;
    grouped.set(category, current);
  });

  return Array.from(grouped.values()).sort((a, b) => {
    const orderDiff = categoryOrder.indexOf(a.category) - categoryOrder.indexOf(b.category);
    return orderDiff === 0 ? b.quantity - a.quantity : orderDiff;
  });
}

function buildActionItems() {
  return mistura90ReportItems
    .filter((item) => getMistura90Criticality(item) === "Pendente")
    .map((item) => {
      const equipment = getEquipmentById(item.equipmentId);
      return {
        equipmentCode: equipment?.code || item.equipmentId,
        item: item.item,
        criticality: getMistura90Criticality(item),
        owner: inferOwner(item),
        action: item.note || inferAction(item),
      };
    });
}

function inferOwner(item: Mistura90ReportItem) {
  const label = item.item.toLowerCase();
  if (label.includes("mancal") || label.includes("eixo") || label.includes("tambor")) return "Engenharia mecanica";
  if (label.includes("rolete") || label.includes("cavalete") || label.includes("correia")) return "Suprimentos / Projetos";
  if (label.includes("coxim") || label.includes("tela")) return "Desenho / Processo";
  return "Engenharia i9TMG";
}

function inferAction(item: Mistura90ReportItem) {
  if (!item.quantity && !item.description) return "Definir quantidade e descricao antes de compra/fabricacao.";
  if (!item.quantity) return "Confirmar quantidade final no desenho ou lista de materiais.";
  if (!item.description) return "Completar descricao tecnica e referencia comercial.";
  return "Validar item antes da liberacao.";
}

function calculateScore(items: Mistura90ReportItem[]) {
  if (!items.length) return 0;
  const pending = items.filter((item) => getMistura90Criticality(item) === "Pendente").length;
  return Math.max(0, Math.round(((items.length - pending) / items.length) * 100));
}

function getStatusLabel(score: number, pendingCount: number) {
  if (pendingCount === 0 && score >= 95) return "Liberado";
  if (score >= 80) return "Liberar com ressalvas";
  return "Revisao obrigatoria";
}

function totalQuantity(items: Mistura90ReportItem[]) {
  return items.reduce((total, item) => total + (item.quantity || 0), 0);
}
