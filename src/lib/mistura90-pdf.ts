import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { i9QualityRequirements, i9Segments, i9SolutionFronts } from "@/lib/i9-requirements";
import {
  classifyMistura90Item,
  getEquipmentById,
  getMistura90Criticality,
  getMistura90Kpis,
  mistura90Equipments,
  mistura90ReportItems,
  mistura90Workbook,
  type Mistura90Equipment,
} from "@/lib/mistura90-excel-data";
import { formatScenarioValue, type Mistura90ScenarioResult } from "@/lib/mistura90-calculations";

interface PdfReportOptions {
  selectedEquipment: Mistura90Equipment;
  scenario: Mistura90ScenarioResult;
}

const i9Blue = [0, 68, 94] as const;
const i9Orange = [255, 106, 0] as const;
const slate = [74, 85, 104] as const;
const light = [242, 245, 247] as const;

export async function generateMistura90PdfReport({ selectedEquipment, scenario }: PdfReportOptions) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const kpis = getMistura90Kpis();
  const logo = await loadLogo();

  drawHeader(doc, logo);
  doc.setTextColor(...i9Blue);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.text("Relatorio Tecnico i9TMG", 14, 34);
  doc.setTextColor(...slate);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text("Projeto Mistura 90 | Engenharia, memoria de calculo, suprimentos e liberacao tecnica", 14, 41);

  drawInfoGrid(doc, [
    ["Fonte", mistura90Workbook.fileName],
    ["Equipamento ativo", `${selectedEquipment.code} - ${selectedEquipment.name}`],
    ["Cenario calculado", scenario.title],
    ["Emissao", new Date().toLocaleDateString("pt-BR")],
  ], 14, 50);

  drawKpiRow(doc, [
    ["Equipamentos", String(kpis.equipments)],
    ["Itens", String(kpis.reportItems)],
    ["Qtd. total", formatScenarioValue(kpis.totalQuantity)],
    ["Pendencias", String(kpis.pendingItems)],
  ], 14, 77);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(...i9Blue);
  doc.text("1. Resultado do calculo parametrico", 14, 104);
  autoTable(doc, {
    startY: 109,
    head: [["Indicador", "Valor", "Unidade", "Status"]],
    body: scenario.outputs.map((output) => [
      output.label,
      formatScenarioValue(output.value),
      output.unit,
      output.status === "critical" ? "Critico" : output.status === "warning" ? "Atencao" : "OK",
    ]),
    theme: "grid",
    styles: { font: "helvetica", fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: i9Blue, textColor: 255 },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    margin: { left: 14, right: 14 },
  });

  const afterOutputs = getAutoTableY(doc) + 8;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(...i9Blue);
  doc.text("2. Passo a passo", 14, afterOutputs);
  autoTable(doc, {
    startY: afterOutputs + 5,
    body: scenario.steps.map((step, index) => [`${index + 1}`, step]),
    theme: "plain",
    styles: { fontSize: 8.5, cellPadding: 1.6, textColor: slate },
    columnStyles: { 0: { cellWidth: 10, textColor: i9Orange, fontStyle: "bold" }, 1: { cellWidth: 168 } },
    margin: { left: 14, right: 14 },
  });

  addPageIfNeeded(doc, 62);
  drawHeader(doc, logo);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(...i9Blue);
  doc.text("3. Grafico executivo por categoria", 14, 28);
  drawCategoryChart(doc, 14, 35);

  const chartBottom = 96;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(...i9Blue);
  doc.text("4. Padrao i9TMG aplicado", 14, chartBottom);
  autoTable(doc, {
    startY: chartBottom + 5,
    head: [["Frente", "Entrega esperada no software"]],
    body: i9SolutionFronts.map((front) => [front.name, `${front.description} Entregas: ${front.deliverables.join(", ")}.`]),
    theme: "grid",
    styles: { fontSize: 7.5, cellPadding: 2 },
    headStyles: { fillColor: i9Blue, textColor: 255 },
    columnStyles: { 0: { cellWidth: 38, fontStyle: "bold", textColor: i9Blue }, 1: { cellWidth: 140 } },
    margin: { left: 14, right: 14 },
  });

  addPageIfNeeded(doc, 90);
  drawHeader(doc, logo);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(...i9Blue);
  doc.text("5. Lista de materiais e selecoes", 14, 28);
  autoTable(doc, {
    startY: 33,
    head: [["Equip.", "Item", "Qtd.", "Categoria", "Crit.", "Descricao / observacao"]],
    body: mistura90ReportItems.map((item) => {
      const equipment = getEquipmentById(item.equipmentId);
      const note = item.note ? ` OBS: ${item.note}` : "";
      return [
        equipment?.code || "",
        item.item,
        item.quantity ?? "A definir",
        classifyMistura90Item(item),
        getMistura90Criticality(item),
        `${item.description || "Descricao pendente."}${note}`,
      ];
    }),
    theme: "grid",
    styles: { fontSize: 6.5, cellPadding: 1.4, valign: "top" },
    headStyles: { fillColor: i9Blue, textColor: 255 },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    columnStyles: {
      0: { cellWidth: 20, fontStyle: "bold", textColor: i9Blue },
      1: { cellWidth: 28 },
      2: { cellWidth: 16, halign: "right" },
      3: { cellWidth: 30 },
      4: { cellWidth: 18 },
      5: { cellWidth: 70 },
    },
    margin: { left: 10, right: 10 },
  });

  addPageIfNeeded(doc, 84);
  drawHeader(doc, logo);
  const start = 28;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(...i9Blue);
  doc.text("6. Pendencias e liberacao", 14, start);
  const pending = mistura90ReportItems.filter((item) => getMistura90Criticality(item) === "Pendente");
  autoTable(doc, {
    startY: start + 5,
    head: [["Equip.", "Item", "Acao requerida"]],
    body: pending.map((item) => [getEquipmentById(item.equipmentId)?.code || "", item.item, item.note || "Validar quantidade, descricao ou desenho final."]),
    theme: "grid",
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: i9Orange, textColor: 255 },
    columnStyles: { 0: { cellWidth: 28, fontStyle: "bold" }, 1: { cellWidth: 42 }, 2: { cellWidth: 108 } },
    margin: { left: 14, right: 14 },
  });

  const qualityY = getAutoTableY(doc) + 8;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(...i9Blue);
  doc.text("7. Requisitos de qualidade", 14, qualityY);
  autoTable(doc, {
    startY: qualityY + 5,
    body: i9QualityRequirements.map((requirement) => [requirement.name, requirement.application]),
    theme: "plain",
    styles: { fontSize: 8, cellPadding: 1.8 },
    columnStyles: { 0: { cellWidth: 40, fontStyle: "bold", textColor: i9Blue }, 1: { cellWidth: 138, textColor: slate } },
    margin: { left: 14, right: 14 },
  });

  drawFooterAllPages(doc);
  doc.save(`relatorio-i9tmg-mistura-90-${selectedEquipment.code.replace(/\s+/g, "-").toLowerCase()}.pdf`);
}

function drawHeader(doc: jsPDF, logo?: string) {
  doc.setFillColor(245, 247, 249);
  doc.rect(0, 0, 210, 18, "F");
  doc.setDrawColor(...i9Orange);
  doc.setLineWidth(0.8);
  doc.line(0, 18, 210, 18);
  if (logo) doc.addImage(logo, "PNG", 14, 4, 12, 12);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...i9Blue);
  doc.text("i9TMG Calculus System", logo ? 30 : 14, 11);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...slate);
  doc.text("Mentes e maquinas em beneficio da sua industria", 128, 11);
}

function drawInfoGrid(doc: jsPDF, items: Array<[string, string]>, x: number, y: number) {
  const width = 88;
  const height = 12;
  items.forEach(([label, value], index) => {
    const col = index % 2;
    const row = Math.floor(index / 2);
    const cx = x + col * 92;
    const cy = y + row * 15;
    doc.setFillColor(...light);
    doc.roundedRect(cx, cy, width, height, 2, 2, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.setTextColor(...i9Blue);
    doc.text(label, cx + 3, cy + 4);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...slate);
    doc.text(doc.splitTextToSize(value, width - 6), cx + 3, cy + 8);
  });
}

function drawKpiRow(doc: jsPDF, items: Array<[string, string]>, x: number, y: number) {
  items.forEach(([label, value], index) => {
    const cx = x + index * 46;
    doc.setFillColor(index === 3 ? 255 : 250, index === 3 ? 242 : 250, index === 3 ? 232 : 250);
    doc.roundedRect(cx, y, 42, 19, 2, 2, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(index === 3 ? i9Orange[0] : i9Blue[0], index === 3 ? i9Orange[1] : i9Blue[1], index === 3 ? i9Orange[2] : i9Blue[2]);
    doc.text(value, cx + 3, y + 9);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(...slate);
    doc.text(label, cx + 3, y + 15);
  });
}

function drawCategoryChart(doc: jsPDF, x: number, y: number) {
  const grouped = new Map<string, number>();
  mistura90ReportItems.forEach((item) => {
    const category = classifyMistura90Item(item);
    grouped.set(category, (grouped.get(category) || 0) + (item.quantity || 1));
  });
  const data = Array.from(grouped.entries()).sort((a, b) => b[1] - a[1]).slice(0, 7);
  const max = Math.max(...data.map(([, value]) => value));
  data.forEach(([label, value], index) => {
    const rowY = y + index * 8;
    const barWidth = (value / max) * 86;
    doc.setTextColor(...slate);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.text(label, x, rowY + 4.5);
    doc.setFillColor(226, 232, 240);
    doc.roundedRect(x + 48, rowY, 92, 5, 1, 1, "F");
    doc.setFillColor(index % 2 === 0 ? i9Orange[0] : i9Blue[0], index % 2 === 0 ? i9Orange[1] : i9Blue[1], index % 2 === 0 ? i9Orange[2] : i9Blue[2]);
    doc.roundedRect(x + 48, rowY, barWidth, 5, 1, 1, "F");
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...i9Blue);
    doc.text(String(value), x + 145, rowY + 4.5);
  });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...i9Blue);
  doc.text("Segmentos atendidos no padrao i9TMG", x, y + 63);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...slate);
  doc.text(doc.splitTextToSize(i9Segments.map((segment) => segment.name).join(" | "), 178), x, y + 69);
}

function getAutoTableY(doc: jsPDF) {
  const withTable = doc as jsPDF & { lastAutoTable?: { finalY: number } };
  return withTable.lastAutoTable?.finalY || 20;
}

function addPageIfNeeded(doc: jsPDF, requiredHeight: number) {
  if (getAutoTableY(doc) + requiredHeight > 278) doc.addPage();
}

function drawFooterAllPages(doc: jsPDF) {
  const pages = doc.getNumberOfPages();
  for (let page = 1; page <= pages; page += 1) {
    doc.setPage(page);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(120, 130, 140);
    doc.text("Documento gerado pelo i9TMG Calculus System - prototipo academico frontend.", 14, 291);
    doc.text(`Pagina ${page}/${pages}`, 184, 291);
  }
}

async function loadLogo() {
  try {
    const response = await fetch("/logo-i9tmg.png");
    const blob = await response.blob();
    return await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch {
    return undefined;
  }
}
