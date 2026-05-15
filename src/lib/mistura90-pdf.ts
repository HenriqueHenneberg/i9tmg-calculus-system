import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { i9QualityRequirements, i9Segments, i9SolutionFronts } from "@/lib/i9-requirements";
import {
  classifyMistura90Item,
  getEquipmentById,
  getMistura90Criticality,
  getMistura90Kpis,
  getReportItemsByEquipment,
  mistura90Equipments,
  mistura90ReportItems,
  mistura90Workbook,
  type Mistura90Equipment,
} from "@/lib/mistura90-excel-data";
import { formatScenarioValue, type Mistura90ScenarioResult } from "@/lib/mistura90-calculations";
import { getMistura90ReportAnalytics } from "@/lib/mistura90-report";

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
  const selectedItems = getReportItemsByEquipment(selectedEquipment.id);
  const analytics = getMistura90ReportAnalytics(selectedEquipment.id);

  drawHeader(doc, logo, "Dossie tecnico de liberacao");
  doc.setTextColor(...i9Blue);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text("Dossie Tecnico i9TMG", 14, 33);
  doc.setTextColor(...slate);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text("Projeto Mistura 90 | Compra, fabricacao, montagem, qualidade e rastreabilidade", 14, 40);

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
    ["Score", `${analytics.releaseScore}%`],
  ], 14, 77);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(...i9Blue);
  doc.text("1. Resumo executivo de liberacao", 14, 104);
  drawStatusPanel(doc, analytics.statusLabel, analytics.pendingItems, analytics.highCriticalityItems, 14, 110);

  autoTable(doc, {
    startY: 137,
    head: [["Pacote", "Entrega esperada"]],
    body: analytics.deliverables,
    theme: "grid",
    styles: { font: "helvetica", fontSize: 8, cellPadding: 2.2, valign: "top" },
    headStyles: { fillColor: i9Blue, textColor: 255 },
    columnStyles: { 0: { cellWidth: 32, fontStyle: "bold", textColor: i9Blue }, 1: { cellWidth: 146 } },
    margin: { left: 14, right: 14 },
  });

  const scopeY = getAutoTableY(doc) + 9;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(...i9Blue);
  doc.text("2. Escopo do equipamento selecionado", 14, scopeY);
  autoTable(doc, {
    startY: scopeY + 5,
    head: [["Codigo", "Tipo", "Status", "Descricao tecnica"]],
    body: [[selectedEquipment.code, selectedEquipment.type, selectedEquipment.status, selectedEquipment.description]],
    theme: "grid",
    styles: { font: "helvetica", fontSize: 8, cellPadding: 2.2, valign: "top" },
    headStyles: { fillColor: i9Blue, textColor: 255 },
    columnStyles: {
      0: { cellWidth: 28, fontStyle: "bold", textColor: i9Blue },
      1: { cellWidth: 28 },
      2: { cellWidth: 24 },
      3: { cellWidth: 98 },
    },
    margin: { left: 14, right: 14 },
  });

  autoTable(doc, {
    startY: getAutoTableY(doc) + 5,
    head: [["Indicador do equipamento", "Valor", "Unidade"]],
    body: selectedEquipment.metrics.map((metric) => [metric.label, String(metric.value), metric.unit || "-"]),
    theme: "grid",
    styles: { font: "helvetica", fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [38, 61, 76], textColor: 255 },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    columnStyles: { 0: { cellWidth: 82 }, 1: { cellWidth: 46, halign: "right", fontStyle: "bold" }, 2: { cellWidth: 50 } },
    margin: { left: 14, right: 14 },
  });

  doc.addPage();
  drawHeader(doc, logo, "Memoria parametrica");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(...i9Blue);
  doc.text("3. Numeros preenchidos no dimensionador", 14, 28);
  autoTable(doc, {
    startY: 33,
    head: [["Variavel", "Descricao", "Valor", "Unidade"]],
    body: scenario.inputs.map((input) => [input.key, input.label, formatScenarioValue(input.value), input.unit || "coef."]),
    theme: "grid",
    styles: { font: "helvetica", fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: i9Blue, textColor: 255 },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    columnStyles: {
      0: { cellWidth: 22, fontStyle: "bold", textColor: i9Blue },
      1: { cellWidth: 82 },
      2: { cellWidth: 38, halign: "right", fontStyle: "bold" },
      3: { cellWidth: 36 },
    },
    margin: { left: 14, right: 14 },
  });

  const outputY = getAutoTableY(doc) + 8;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(...i9Blue);
  doc.text("4. Resultado do calculo parametrico", 14, outputY);
  autoTable(doc, {
    startY: outputY + 5,
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
  doc.text("5. Memoria passo a passo", 14, afterOutputs);
  autoTable(doc, {
    startY: afterOutputs + 5,
    body: scenario.steps.map((step, index) => [`${index + 1}`, step]),
    theme: "plain",
    styles: { fontSize: 8.5, cellPadding: 1.6, textColor: slate },
    columnStyles: { 0: { cellWidth: 10, textColor: i9Orange, fontStyle: "bold" }, 1: { cellWidth: 168 } },
    margin: { left: 14, right: 14 },
  });

  doc.addPage();
  drawHeader(doc, logo, "Matriz executiva");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(...i9Blue);
  doc.text("6. Grafico executivo por categoria", 14, 28);
  drawCategoryChart(doc, 14, 35);

  const chartBottom = 98;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(...i9Blue);
  doc.text("7. Matriz de liberacao por equipamento", 14, chartBottom);
  autoTable(doc, {
    startY: chartBottom + 5,
    head: [["Equipamento", "Tipo", "Score", "Pend.", "Criticos", "Status"]],
    body: analytics.equipmentReleases.map((release) => [
      release.equipment.code,
      release.equipment.type,
      `${release.score}%`,
      String(release.pendingCount),
      String(release.highCriticalityCount),
      release.statusLabel,
    ]),
    theme: "grid",
    styles: { fontSize: 7.5, cellPadding: 1.8 },
    headStyles: { fillColor: i9Blue, textColor: 255 },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    columnStyles: {
      0: { cellWidth: 32, fontStyle: "bold", textColor: i9Blue },
      1: { cellWidth: 28 },
      2: { cellWidth: 18, halign: "right" },
      3: { cellWidth: 16, halign: "right" },
      4: { cellWidth: 18, halign: "right" },
      5: { cellWidth: 66 },
    },
    margin: { left: 14, right: 14 },
  });

  const i9Y = getAutoTableY(doc) + 8;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(...i9Blue);
  doc.text("8. Padrao i9TMG aplicado", 14, i9Y);
  autoTable(doc, {
    startY: i9Y + 5,
    head: [["Frente", "Entrega esperada no software"]],
    body: i9SolutionFronts.map((front) => [front.name, `${front.description} Entregas: ${front.deliverables.join(", ")}.`]),
    theme: "grid",
    styles: { fontSize: 7.5, cellPadding: 2 },
    headStyles: { fillColor: i9Blue, textColor: 255 },
    columnStyles: { 0: { cellWidth: 38, fontStyle: "bold", textColor: i9Blue }, 1: { cellWidth: 140 } },
    margin: { left: 14, right: 14 },
  });

  doc.addPage();
  drawHeader(doc, logo, "Lista tecnica por equipamento");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(...i9Blue);
  doc.text("9. Pacote do equipamento selecionado", 14, 28);
  autoTable(doc, {
    startY: 33,
    head: [["Categoria", "Itens", "Qtd. total", "Pendencias"]],
    body: analytics.selectedCategorySummaries.map((summary) => [
      summary.category,
      String(summary.itemCount),
      formatScenarioValue(summary.quantity),
      String(summary.pending),
    ]),
    theme: "grid",
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [38, 61, 76], textColor: 255 },
    columnStyles: {
      0: { cellWidth: 72, fontStyle: "bold", textColor: i9Blue },
      1: { cellWidth: 26, halign: "right" },
      2: { cellWidth: 42, halign: "right" },
      3: { cellWidth: 38, halign: "right" },
    },
    margin: { left: 14, right: 14 },
  });

  autoTable(doc, {
    startY: getAutoTableY(doc) + 7,
    head: [["Equip.", "Item", "Qtd.", "Categoria", "Crit.", "Descricao / observacao"]],
    body: selectedItems.map((item) => {
      const note = item.note ? ` OBS: ${item.note}` : "";
      return [
        selectedEquipment.code,
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
    margin: { top: 24, left: 10, right: 10 },
  });

  doc.addPage();
  drawHeader(doc, logo, "Pendencias e qualidade");
  const start = 28;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(...i9Blue);
  doc.text("10. Pendencias e plano de acao", 14, start);
  autoTable(doc, {
    startY: start + 5,
    head: [["Equip.", "Item", "Responsavel", "Acao requerida"]],
    body: analytics.actionItems.map((item) => [item.equipmentCode, item.item, item.owner, item.action]),
    theme: "grid",
    styles: { fontSize: 7.5, cellPadding: 2, valign: "top" },
    headStyles: { fillColor: i9Orange, textColor: 255 },
    columnStyles: { 0: { cellWidth: 24, fontStyle: "bold" }, 1: { cellWidth: 34 }, 2: { cellWidth: 42 }, 3: { cellWidth: 78 } },
    margin: { left: 14, right: 14 },
  });

  const qualityY = getAutoTableY(doc) + 8;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(...i9Blue);
  doc.text("11. Requisitos de qualidade", 14, qualityY);
  autoTable(doc, {
    startY: qualityY + 5,
    body: i9QualityRequirements.map((requirement) => [requirement.name, requirement.application]),
    theme: "plain",
    styles: { fontSize: 8, cellPadding: 1.8 },
    columnStyles: { 0: { cellWidth: 40, fontStyle: "bold", textColor: i9Blue }, 1: { cellWidth: 138, textColor: slate } },
    margin: { left: 14, right: 14 },
  });

  doc.addPage("a4", "landscape");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(...i9Blue);
  doc.text("12. Apendice completo do RESUMO", 10, 28);
  autoTable(doc, {
    startY: 34,
    head: [["Equip.", "Tipo", "Item", "Qtd.", "Categoria", "Crit.", "Descricao / observacao"]],
    body: mistura90ReportItems.map((item) => {
      const equipment = getEquipmentById(item.equipmentId);
      const note = item.note ? ` OBS: ${item.note}` : "";
      return [
        equipment?.code || "",
        equipment?.type || "",
        item.item,
        item.quantity ?? "A definir",
        classifyMistura90Item(item),
        getMistura90Criticality(item),
        `${item.description || "Descricao pendente."}${note}`,
      ];
    }),
    theme: "grid",
    styles: { fontSize: 6.2, cellPadding: 1.2, valign: "top" },
    headStyles: { fillColor: i9Blue, textColor: 255 },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    columnStyles: {
      0: { cellWidth: 20, fontStyle: "bold", textColor: i9Blue },
      1: { cellWidth: 22 },
      2: { cellWidth: 28 },
      3: { cellWidth: 17, halign: "right" },
      4: { cellWidth: 36 },
      5: { cellWidth: 20 },
      6: { cellWidth: 142 },
    },
    margin: { top: 24, left: 6, right: 6 },
    willDrawPage: () => drawHeader(doc, logo, "Apendice completo"),
  });

  drawFooterAllPages(doc);
  doc.save(`relatorio-i9tmg-mistura-90-${selectedEquipment.code.replace(/\s+/g, "-").toLowerCase()}.pdf`);
}

function drawStatusPanel(doc: jsPDF, status: string, pendingItems: number, criticalItems: number, x: number, y: number) {
  doc.setFillColor(250, 252, 254);
  doc.roundedRect(x, y, 178, 20, 2, 2, "F");
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(x, y, 178, 20, 2, 2, "S");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...i9Blue);
  doc.text("Leitura executiva", x + 4, y + 6);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...slate);
  doc.text(doc.splitTextToSize(`Status: ${status}. Existem ${pendingItems} pendencias tecnicas e ${criticalItems} itens de criticidade alta no pacote completo.`, 168), x + 4, y + 11);
}

function drawHeader(doc: jsPDF, logo?: string, section = "Relatorio tecnico") {
  const width = doc.internal.pageSize.getWidth();
  doc.setFillColor(245, 247, 249);
  doc.rect(0, 0, width, 18, "F");
  doc.setDrawColor(...i9Orange);
  doc.setLineWidth(0.8);
  doc.line(0, 18, width, 18);
  if (logo) doc.addImage(logo, "PNG", 14, 4, 12, 12);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...i9Blue);
  doc.text("i9TMG Calculus System", logo ? 30 : 14, 11);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...slate);
  doc.text(section, width - 14, 8, { align: "right" });
  doc.setFontSize(7);
  doc.text("Mentes e maquinas em beneficio da sua industria", width - 14, 13, { align: "right" });
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

function drawFooterAllPages(doc: jsPDF) {
  const pages = doc.getNumberOfPages();
  for (let page = 1; page <= pages; page += 1) {
    doc.setPage(page);
    const width = doc.internal.pageSize.getWidth();
    const height = doc.internal.pageSize.getHeight();
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(120, 130, 140);
    doc.text("Documento gerado pelo i9TMG Calculus System - prototipo academico frontend.", 14, height - 6);
    doc.text(`Pagina ${page}/${pages}`, width - 14, height - 6, { align: "right" });
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
