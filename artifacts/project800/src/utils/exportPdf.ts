import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { MonthData, BudgetItem, Campaign, EventItem, Hoarding } from "@/data/defaults";

const TEAL = [15, 118, 110] as [number, number, number];
const GOLD = [180, 83, 9] as [number, number, number];
const DARK = [15, 23, 42] as [number, number, number];
const LIGHT_GRAY = [248, 250, 252] as [number, number, number];
const MID_GRAY = [100, 116, 139] as [number, number, number];

function formatINR(amount: number): string {
  if (isNaN(amount)) return "₹0";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function addPageHeader(doc: jsPDF, title: string, subtitle?: string) {
  const pageWidth = doc.internal.pageSize.getWidth();

  doc.setFillColor(...DARK);
  doc.rect(0, 0, pageWidth, 22, "F");

  doc.setFillColor(...TEAL);
  doc.rect(0, 22, pageWidth, 3, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("TATVA GLOBAL SCHOOL", 14, 10);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(180, 200, 220);
  doc.text("Project 800 — AY 2027-28 Marketing Plan", 14, 16);

  const dateStr = new Date().toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  doc.setTextColor(180, 200, 220);
  doc.text(`Generated: ${dateStr}`, pageWidth - 14, 16, { align: "right" });

  doc.setTextColor(...DARK);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text(title, 14, 36);

  if (subtitle) {
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...MID_GRAY);
    doc.text(subtitle, 14, 43);
  }
}

function addPageFooter(doc: jsPDF) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const pageCount = (doc as unknown as { internal: { getNumberOfPages(): number } }).internal.getNumberOfPages();

  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.line(14, pageHeight - 12, pageWidth - 14, pageHeight - 12);
    doc.setFontSize(7);
    doc.setTextColor(...MID_GRAY);
    doc.setFont("helvetica", "normal");
    doc.text("Tatva Global School | Project 800 | Confidential", 14, pageHeight - 7);
    doc.text(`Page ${i} of ${pageCount}`, pageWidth - 14, pageHeight - 7, { align: "right" });
  }
}

export function exportFullPlan(
  months: MonthData[],
  budget: BudgetItem[],
  campaigns: Campaign[],
  events: EventItem[],
  hoardings: Hoarding[]
) {
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();

  const totalActualAdm = months.reduce((s, m) => s + m.actualAdm, 0);
  const totalPlanAdm = months.reduce((s, m) => s + m.planAdm, 0);
  const totalActualSpend = months.reduce((s, m) => s + m.actualSpend, 0);
  const totalActualEnq = months.reduce((s, m) => s + m.actualEnq, 0);

  doc.setFillColor(...DARK);
  doc.rect(0, 0, pageWidth, doc.internal.pageSize.getHeight(), "F");

  doc.setFillColor(...TEAL);
  doc.rect(0, 75, pageWidth, 4, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(28);
  doc.setFont("helvetica", "bold");
  doc.text("PROJECT 800", pageWidth / 2, 50, { align: "center" });

  doc.setFontSize(14);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(180, 200, 220);
  doc.text("Tatva Global School — Admissions Marketing Plan", pageWidth / 2, 62, { align: "center" });
  doc.text("Academic Year 2027-28  |  Jul 2026 – May 2027", pageWidth / 2, 70, { align: "center" });

  doc.setTextColor(...TEAL);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  const cols = [pageWidth * 0.15, pageWidth * 0.38, pageWidth * 0.61, pageWidth * 0.84];
  const labels = ["TARGET", "ADMISSIONS SO FAR", "BUDGET SPENT", "ENQUIRIES"];
  const values = ["800", `${totalActualAdm} / ${totalPlanAdm}`, formatINR(totalActualSpend), String(totalActualEnq)];

  labels.forEach((lbl, i) => {
    doc.setTextColor(100, 160, 200);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text(lbl, cols[i], 95, { align: "center" });
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.text(values[i], cols[i], 104, { align: "center" });
  });

  doc.setTextColor(100, 120, 140);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text(`Total Budget: INR 40,00,000  |  Duration: 11 months  |  Campaigns: ${campaigns.length}  |  Events: ${events.length}`, pageWidth / 2, 120, { align: "center" });

  const dateStr = new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" });
  doc.text(`Report generated on ${dateStr}`, pageWidth / 2, 128, { align: "center" });

  doc.addPage();
  addPageHeader(doc, "Monthly Progress Summary", "Plan vs Actuals — Jul 2026 to May 2027");

  autoTable(doc, {
    startY: 50,
    head: [["Month", "Theme", "Plan Adm", "Actual Adm", "Plan Enq", "Actual Enq", "Plan Spend", "Actual Spend", "Variance"]],
    body: months.map((m) => [
      m.month,
      m.theme,
      m.planAdm,
      m.actualAdm || "–",
      m.planEnq,
      m.actualEnq || "–",
      formatINR(m.planSpend),
      m.actualSpend ? formatINR(m.actualSpend) : "–",
      m.actualSpend ? formatINR(m.planSpend - m.actualSpend) : "–",
    ]),
    foot: [[
      "TOTAL", "",
      months.reduce((s, m) => s + m.planAdm, 0),
      months.reduce((s, m) => s + m.actualAdm, 0) || "–",
      months.reduce((s, m) => s + m.planEnq, 0),
      months.reduce((s, m) => s + m.actualEnq, 0) || "–",
      formatINR(months.reduce((s, m) => s + m.planSpend, 0)),
      totalActualSpend ? formatINR(totalActualSpend) : "–",
      totalActualSpend ? formatINR(months.reduce((s, m) => s + m.planSpend, 0) - totalActualSpend) : "–",
    ]],
    headStyles: { fillColor: TEAL, textColor: [255, 255, 255], fontStyle: "bold", fontSize: 8 },
    footStyles: { fillColor: DARK, textColor: [255, 255, 255], fontStyle: "bold", fontSize: 8 },
    bodyStyles: { fontSize: 8 },
    alternateRowStyles: { fillColor: LIGHT_GRAY },
    columnStyles: { 1: { cellWidth: 55 } },
    margin: { left: 14, right: 14 },
  });

  doc.addPage();
  addPageHeader(doc, "Budget Allocation", `Total Budget: ${formatINR(40000000)} | ${budget.length} line items`);

  const totalBudgetSpend = budget.reduce((s, b) => s + b.actual, 0);
  autoTable(doc, {
    startY: 50,
    head: [["#", "Channel", "Planned Budget", "Actual Spend", "Variance", "% Used"]],
    body: budget.map((b, i) => {
      const variance = b.planned - b.actual;
      const pct = b.planned > 0 ? ((b.actual / b.planned) * 100).toFixed(1) + "%" : "0%";
      return [i + 1, b.channel, formatINR(b.planned), b.actual ? formatINR(b.actual) : "–", b.actual ? formatINR(variance) : "–", b.actual ? pct : "–"];
    }),
    foot: [["", "TOTAL", formatINR(40000000), totalBudgetSpend ? formatINR(totalBudgetSpend) : "–", totalBudgetSpend ? formatINR(40000000 - totalBudgetSpend) : "–", totalBudgetSpend ? ((totalBudgetSpend / 40000000) * 100).toFixed(1) + "%" : "0%"]],
    headStyles: { fillColor: TEAL, textColor: [255, 255, 255], fontStyle: "bold", fontSize: 8 },
    footStyles: { fillColor: DARK, textColor: [255, 255, 255], fontStyle: "bold", fontSize: 8 },
    bodyStyles: { fontSize: 8 },
    alternateRowStyles: { fillColor: LIGHT_GRAY },
    margin: { left: 14, right: 14 },
  });

  doc.addPage();
  addPageHeader(doc, "Campaigns", `${campaigns.length} campaigns across all channels`);

  autoTable(doc, {
    startY: 50,
    head: [["Campaign Name", "Channel", "Month", "Budget", "Status", "Description"]],
    body: campaigns.map((c) => [c.name, c.channel, c.month, formatINR(c.budget), c.status, c.description || "–"]),
    headStyles: { fillColor: TEAL, textColor: [255, 255, 255], fontStyle: "bold", fontSize: 8 },
    bodyStyles: { fontSize: 8 },
    alternateRowStyles: { fillColor: LIGHT_GRAY },
    didDrawCell: (data) => {
      if (data.section === "body" && data.column.index === 4) {
        const status = campaigns[data.row.index]?.status;
        const colors: Record<string, [number, number, number]> = {
          Idea: [161, 98, 7],
          Planned: [29, 78, 216],
          Active: [21, 128, 61],
          Completed: [100, 116, 139],
          Paused: [194, 65, 12],
        };
        if (status && colors[status]) {
          doc.setTextColor(...colors[status]);
          doc.setFontSize(8);
          doc.setFont("helvetica", "bold");
          doc.text(status, data.cell.x + data.cell.width / 2, data.cell.y + data.cell.height / 2 + 1, { align: "center" });
        }
      }
    },
    columnStyles: { 5: { cellWidth: 60 } },
    margin: { left: 14, right: 14 },
  });

  doc.addPage();
  addPageHeader(doc, "Events Calendar", `${events.length} events planned — Jul 2026 to May 2027`);

  autoTable(doc, {
    startY: 50,
    head: [["Event Name", "Type", "Month", "Date", "Expected", "Actual", "Venue", "Status"]],
    body: events.map((e) => [e.name, e.type, e.month, e.date, e.expected, e.actual || "–", e.venue, e.status]),
    headStyles: { fillColor: TEAL, textColor: [255, 255, 255], fontStyle: "bold", fontSize: 8 },
    bodyStyles: { fontSize: 8 },
    alternateRowStyles: { fillColor: LIGHT_GRAY },
    margin: { left: 14, right: 14 },
  });

  doc.addPage();
  addPageHeader(doc, "Hoarding Creatives", "7 creative rounds across 15 outdoor sites");

  autoTable(doc, {
    startY: 50,
    head: [["Creative Round", "Period", "Sites", "Duration (days)", "Status"]],
    body: hoardings.map((h) => [h.creativeRound, h.period, h.sites, h.durationDays, h.status]),
    headStyles: { fillColor: TEAL, textColor: [255, 255, 255], fontStyle: "bold", fontSize: 8 },
    bodyStyles: { fontSize: 8 },
    alternateRowStyles: { fillColor: LIGHT_GRAY },
    margin: { left: 14, right: 14 },
  });

  addPageFooter(doc);
  doc.save(`Project800_FullPlan_${new Date().toISOString().slice(0, 10)}.pdf`);
}

export function exportMonthlyPlan(months: MonthData[]) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  addPageHeader(doc, "Monthly Plan Tracker", "Progress vs targets for each month | Jul 2026 – May 2027");

  autoTable(doc, {
    startY: 50,
    head: [["Month", "Theme", "Plan", "Actual", "Enq Plan", "Enq Actual", "Spend Plan", "Spend Actual", "Activities"]],
    body: months.map((m) => [
      m.month,
      m.theme,
      m.planAdm,
      m.actualAdm || "–",
      m.planEnq,
      m.actualEnq || "–",
      formatINR(m.planSpend),
      m.actualSpend ? formatINR(m.actualSpend) : "–",
      m.activities.length > 0 ? m.activities.join(", ") : "–",
    ]),
    headStyles: { fillColor: TEAL, textColor: [255, 255, 255], fontStyle: "bold", fontSize: 7 },
    bodyStyles: { fontSize: 7 },
    alternateRowStyles: { fillColor: LIGHT_GRAY },
    columnStyles: { 1: { cellWidth: 42 }, 8: { cellWidth: 40 } },
    margin: { left: 10, right: 10 },
  });

  addPageFooter(doc);
  doc.save(`Project800_MonthlyPlan_${new Date().toISOString().slice(0, 10)}.pdf`);
}

export function exportBudget(budget: BudgetItem[]) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  addPageHeader(doc, "Budget Report", `Total Budget: INR 40,00,000 | ${budget.length} channels`);

  const totalSpent = budget.reduce((s, b) => s + b.actual, 0);
  const totalPlanned = 4000000;

  doc.setFillColor(...TEAL);
  doc.roundedRect(14, 47, 55, 18, 2, 2, "F");
  doc.setFillColor(...GOLD);
  doc.roundedRect(76, 47, 55, 18, 2, 2, "F");
  doc.setFillColor(...DARK);
  doc.roundedRect(138, 47, 55, 18, 2, 2, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  [[14, "TOTAL BUDGET"], [76, "SPENT"], [138, "REMAINING"]].forEach(([x, lbl]) => {
    doc.text(lbl as string, (x as number) + 27.5, 53, { align: "center" });
  });
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text(formatINR(totalPlanned), 41.5, 61, { align: "center" });
  doc.text(totalSpent ? formatINR(totalSpent) : "₹0", 103.5, 61, { align: "center" });
  doc.text(formatINR(totalPlanned - totalSpent), 165.5, 61, { align: "center" });

  autoTable(doc, {
    startY: 72,
    head: [["#", "Channel", "Planned (INR)", "Actual Spend (INR)", "Variance (INR)", "% Used"]],
    body: budget.map((b, i) => {
      const pct = b.planned > 0 ? ((b.actual / b.planned) * 100).toFixed(1) + "%" : "0%";
      return [i + 1, b.channel, formatINR(b.planned), b.actual ? formatINR(b.actual) : "–", b.actual ? formatINR(b.planned - b.actual) : "–", b.actual ? pct : "–"];
    }),
    foot: [["", "TOTAL", formatINR(totalPlanned), totalSpent ? formatINR(totalSpent) : "–", totalSpent ? formatINR(totalPlanned - totalSpent) : "–", totalSpent ? ((totalSpent / totalPlanned) * 100).toFixed(1) + "%" : "0%"]],
    headStyles: { fillColor: TEAL, textColor: [255, 255, 255], fontStyle: "bold" },
    footStyles: { fillColor: DARK, textColor: [255, 255, 255], fontStyle: "bold" },
    bodyStyles: { fontSize: 9 },
    alternateRowStyles: { fillColor: LIGHT_GRAY },
    margin: { left: 14, right: 14 },
  });

  addPageFooter(doc);
  doc.save(`Project800_Budget_${new Date().toISOString().slice(0, 10)}.pdf`);
}

export function exportCampaigns(campaigns: Campaign[]) {
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  addPageHeader(doc, "Campaigns Report", `${campaigns.length} campaigns | Total budget: ${formatINR(campaigns.reduce((s, c) => s + c.budget, 0))}`);

  autoTable(doc, {
    startY: 50,
    head: [["Campaign Name", "Channel", "Month", "Budget", "Status", "Description"]],
    body: campaigns.map((c) => [c.name, c.channel, c.month, formatINR(c.budget), c.status, c.description || "–"]),
    foot: [["TOTAL", "", "", formatINR(campaigns.reduce((s, c) => s + c.budget, 0)), "", ""]],
    headStyles: { fillColor: TEAL, textColor: [255, 255, 255], fontStyle: "bold" },
    footStyles: { fillColor: DARK, textColor: [255, 255, 255], fontStyle: "bold" },
    bodyStyles: { fontSize: 9 },
    alternateRowStyles: { fillColor: LIGHT_GRAY },
    columnStyles: { 5: { cellWidth: 70 } },
    margin: { left: 14, right: 14 },
  });

  addPageFooter(doc);
  doc.save(`Project800_Campaigns_${new Date().toISOString().slice(0, 10)}.pdf`);
}

export function exportEvents(events: EventItem[]) {
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  addPageHeader(doc, "Events Calendar", `${events.length} events | Jul 2026 – May 2027`);

  autoTable(doc, {
    startY: 50,
    head: [["Event Name", "Type", "Month", "Date", "Expected Attendance", "Actual Attendance", "Venue", "Status"]],
    body: events.map((e) => [e.name, e.type, e.month, e.date, e.expected, e.actual || "–", e.venue, e.status]),
    headStyles: { fillColor: TEAL, textColor: [255, 255, 255], fontStyle: "bold" },
    bodyStyles: { fontSize: 9 },
    alternateRowStyles: { fillColor: LIGHT_GRAY },
    margin: { left: 14, right: 14 },
  });

  addPageFooter(doc);
  doc.save(`Project800_Events_${new Date().toISOString().slice(0, 10)}.pdf`);
}
