import { useState, useRef, useEffect } from "react";
import { useAppData } from "@/hooks/useAppData";
import { BudgetItem } from "@/data/defaults";
import { formatINR } from "@/utils/format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Plus, Edit2, Trash2, RefreshCw, AlertTriangle, CheckCircle2, TrendingUp } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Pie } from "react-chartjs-2";
import { ArcElement, Tooltip as ChartTooltip, Legend as ChartLegend } from "chart.js";
import { Chart as ChartJS } from "chart.js";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

ChartJS.register(ArcElement, ChartTooltip, ChartLegend);

const budgetSchema = z.object({
  channel: z.string().min(1, "Channel name is required"),
  planned: z.coerce.number().min(0, "Must be ≥ 0"),
  actual: z.coerce.number().min(0, "Must be ≥ 0"),
});

const PALETTE = [
  "#0f766e","#0e7490","#0369a1","#0284c7","#1d4ed8",
  "#4338ca","#b45309","#d97706","#ea580c","#f59e0b","#fbbf24","#84cc16","#16a34a",
];

// ── Category classification ────────────────────────────────────────────────
type Category = "Digital" | "Outdoor" | "Print" | "Events" | "Misc";
const CATEGORY_COLORS: Record<Category, string> = {
  Digital:  "bg-blue-100 text-blue-800",
  Outdoor:  "bg-purple-100 text-purple-800",
  Print:    "bg-amber-100 text-amber-800",
  Events:   "bg-teal-100 text-teal-800",
  Misc:     "bg-slate-100 text-slate-600",
};
const CATEGORY_BAR: Record<Category, string> = {
  Digital:  "bg-blue-500",
  Outdoor:  "bg-purple-500",
  Print:    "bg-amber-500",
  Events:   "bg-teal-500",
  Misc:     "bg-slate-400",
};

function classifyChannel(name: string): Category {
  const n = name.toLowerCase();
  if (/google|meta|facebook|whatsapp|email|content|youtube|instagram|digital|social/.test(n)) return "Digital";
  if (/hoarding|billboard|outdoor|signage/.test(n)) return "Outdoor";
  if (/toi|newspaper|flyer|print|magazine|brochure/.test(n)) return "Print";
  if (/event|activation|workshop|seminar|webinar|experience/.test(n)) return "Events";
  return "Misc";
}

function roundTo1k(n: number) { return Math.round(n / 1000) * 1000; }

// ── formatInput helpers ────────────────────────────────────────────────────
function parseAmount(str: string): number {
  return parseInt(str.replace(/[^0-9]/g, ""), 10) || 0;
}

export default function BudgetManager() {
  const { budget, setBudget, totalBudget, setTotalBudget } = useAppData();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<BudgetItem | null>(null);
  const [masterInput, setMasterInput] = useState(String(totalBudget));
  const [isDirty, setIsDirty] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // keep masterInput in sync when totalBudget changes externally (reset)
  useEffect(() => {
    setMasterInput(String(totalBudget));
    setIsDirty(false);
  }, [totalBudget]);

  const pendingTotal = parseAmount(masterInput);
  const lineItemsSum = budget.reduce((s, b) => s + b.planned, 0);
  const totalActual  = budget.reduce((s, b) => s + b.actual, 0);
  const diff = lineItemsSum - totalBudget;           // positive = over
  const utilPct = totalBudget > 0 ? Math.min((lineItemsSum / totalBudget) * 100, 100) : 0;
  const spentPct = totalBudget > 0 ? Math.min((totalActual / totalBudget) * 100, 100) : 0;

  // ── Apply & Redistribute ─────────────────────────────────────────────────
  function applyAndRedistribute() {
    if (!pendingTotal || pendingTotal <= 0) {
      toast.error("Enter a valid budget amount");
      inputRef.current?.focus();
      return;
    }
    const newBudget = budget.map(b => ({
      ...b,
      planned: lineItemsSum > 0
        ? roundTo1k((b.planned / lineItemsSum) * pendingTotal)
        : roundTo1k(pendingTotal / budget.length),
    }));
    setBudget(newBudget);
    setTotalBudget(pendingTotal);
    setIsDirty(false);
    toast.success(`Budget updated to ${formatINR(pendingTotal)} and redistributed proportionally`);
  }

  function handleMasterInput(v: string) {
    setMasterInput(v.replace(/[^0-9]/g, ""));
    setIsDirty(true);
  }

  // ── Line item CRUD ────────────────────────────────────────────────────────
  const form = useForm<z.infer<typeof budgetSchema>>({
    resolver: zodResolver(budgetSchema),
    defaultValues: { channel: "", planned: 0, actual: 0 },
  });

  function onSubmit(values: z.infer<typeof budgetSchema>) {
    if (editingItem) {
      setBudget(budget.map(i => i.id === editingItem.id ? { ...editingItem, ...values } : i));
      toast.success("Line item updated");
      setEditingItem(null);
    } else {
      setBudget([...budget, { id: `b${Date.now()}`, ...values }]);
      toast.success("Line item added");
      setIsAddOpen(false);
    }
    form.reset();
  }

  function handleDelete(id: string) {
    setBudget(budget.filter(i => i.id !== id));
    toast.success("Line item deleted");
  }

  function handleInlineEdit(id: string, newChannel: string) {
    if (!newChannel.trim()) return;
    setBudget(budget.map(i => i.id === id ? { ...i, channel: newChannel } : i));
  }

  function handleEditClick(item: BudgetItem) {
    setEditingItem(item);
    form.reset({ channel: item.channel, planned: item.planned, actual: item.actual });
  }

  // ── Category breakdown ────────────────────────────────────────────────────
  const categories: Category[] = ["Digital", "Outdoor", "Print", "Events", "Misc"];
  const catTotals = categories.map(cat => ({
    cat,
    planned: budget.filter(b => classifyChannel(b.channel) === cat).reduce((s, b) => s + b.planned, 0),
    actual:  budget.filter(b => classifyChannel(b.channel) === cat).reduce((s, b) => s + b.actual, 0),
  }));

  // ── Chart ─────────────────────────────────────────────────────────────────
  const pieData = {
    labels: budget.map(b => b.channel),
    datasets: [{
      data: budget.map(b => b.planned),
      backgroundColor: PALETTE.slice(0, budget.length),
      borderWidth: 1,
      borderColor: "#fff",
    }],
  };

  // ── Redistribute preview ──────────────────────────────────────────────────
  const previewBudget = budget.map(b => ({
    ...b,
    newPlanned: lineItemsSum > 0
      ? roundTo1k((b.planned / lineItemsSum) * pendingTotal)
      : roundTo1k(pendingTotal / budget.length),
  }));

  const isAmountChanged = isDirty && pendingTotal !== totalBudget && pendingTotal > 0;

  return (
    <div className="space-y-6">

      {/* ════════════════════════════════════════════════════════════════════
          MASTER BUDGET CONTROL PANEL
      ════════════════════════════════════════════════════════════════════ */}
      <div className="rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        {/* Top stripe */}
        <div className="bg-[#0f172a] px-6 py-5">
          <p className="text-xs font-bold uppercase tracking-widest text-teal-400 mb-3">
            Total Marketing Budget (₹)
          </p>
          <p className="text-xs text-slate-400 mb-3">
            Edit to redistribute across all channels proportionally — rounded to nearest ₹1,000
          </p>

          <div className="flex flex-wrap items-end gap-4">
            {/* Big input */}
            <div className="flex-1 min-w-[220px]">
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-slate-400 pointer-events-none">₹</span>
                <input
                  ref={inputRef}
                  type="text"
                  inputMode="numeric"
                  value={Number(masterInput || 0).toLocaleString("en-IN")}
                  onChange={e => handleMasterInput(e.target.value)}
                  onFocus={e => { e.target.select(); }}
                  className="w-full pl-9 pr-4 py-3 rounded-xl text-2xl font-bold bg-white/10 border border-white/20 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-teal-400/60 transition"
                  data-testid="input-total-budget"
                  placeholder="40,00,000"
                />
              </div>
            </div>

            {/* Apply button */}
            <Button
              size="lg"
              disabled={!isAmountChanged}
              onClick={applyAndRedistribute}
              data-testid="btn-apply-redistribute"
              className={`gap-2 font-semibold text-sm px-6 transition-all ${
                isAmountChanged
                  ? "bg-teal-500 hover:bg-teal-400 text-white shadow-lg shadow-teal-900/30"
                  : "bg-white/10 text-white/30 cursor-not-allowed"
              }`}
            >
              <RefreshCw className="w-4 h-4" />
              Apply &amp; Redistribute
            </Button>

            {/* Status pill */}
            <div className="flex flex-col items-end gap-1">
              {diff === 0 ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Balanced
                </span>
              ) : diff > 0 ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-500/20 border border-red-500/30 text-red-300 text-xs font-semibold">
                  <AlertTriangle className="w-3.5 h-3.5" /> ₹{Math.abs(diff).toLocaleString("en-IN")} over budget
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-sky-500/20 border border-sky-500/30 text-sky-300 text-xs font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5" /> ₹{Math.abs(diff).toLocaleString("en-IN")} remaining
                </span>
              )}
              <p className="text-xs text-slate-500 text-right">
                Allocated {formatINR(lineItemsSum)} of {formatINR(totalBudget)}
              </p>
            </div>
          </div>

          {/* Progress bars */}
          <div className="mt-5 space-y-3">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-400 font-medium">Budget Utilization (allocated ÷ total)</span>
                <span className={`font-semibold ${utilPct >= 100 ? "text-red-400" : utilPct >= 85 ? "text-amber-400" : "text-teal-400"}`}>
                  {utilPct.toFixed(1)}%
                </span>
              </div>
              <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${utilPct > 100 ? "bg-red-500" : utilPct > 85 ? "bg-amber-400" : "bg-teal-400"}`}
                  style={{ width: `${utilPct}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-400 font-medium">Actual spend so far</span>
                <span className="font-semibold text-amber-400">{spentPct.toFixed(1)}%</span>
              </div>
              <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-amber-400 transition-all duration-500"
                  style={{ width: `${spentPct}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y sm:divide-y-0 divide-slate-200 bg-white">
          {[
            { label: "Total Budget", val: formatINR(totalBudget), color: "text-slate-800" },
            { label: "Total Allocated", val: formatINR(lineItemsSum), color: diff > 0 ? "text-red-600" : "text-teal-700" },
            { label: "Actual Spent", val: formatINR(totalActual), color: "text-amber-700" },
            { label: "Unspent", val: formatINR(totalBudget - totalActual), color: (totalBudget - totalActual) >= 0 ? "text-emerald-600" : "text-red-600" },
          ].map(({ label, val, color }) => (
            <div key={label} className="px-5 py-4">
              <p className="text-xs text-slate-400 uppercase tracking-wide font-medium mb-1">{label}</p>
              <p className={`text-xl font-bold ${color}`}>{val}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Preview redistribution ───────────────────────────────────────── */}
      {isAmountChanged && (
        <div className="rounded-xl border border-teal-200 bg-teal-50 p-4">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4 text-teal-600" />
            <p className="font-semibold text-teal-800 text-sm">
              Preview: redistribution to {formatINR(pendingTotal)}
            </p>
            <span className={`ml-auto text-xs font-bold px-2 py-0.5 rounded-full ${pendingTotal > totalBudget ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
              {pendingTotal > totalBudget ? "+" : ""}{formatINR(pendingTotal - totalBudget)}
            </span>
          </div>
          <div className="overflow-x-auto rounded-lg border border-teal-100">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-teal-100">
                  <th className="text-left px-3 py-2 text-teal-800 font-semibold">Channel</th>
                  <th className="text-right px-3 py-2 text-teal-800 font-semibold">Current</th>
                  <th className="text-right px-3 py-2 text-teal-800 font-semibold">After redistribution</th>
                  <th className="text-right px-3 py-2 text-teal-800 font-semibold">Change</th>
                </tr>
              </thead>
              <tbody>
                {previewBudget.map(b => {
                  const d = b.newPlanned - b.planned;
                  return (
                    <tr key={b.id} className="border-t border-teal-100 bg-white">
                      <td className="px-3 py-2 text-slate-700 font-medium">{b.channel}</td>
                      <td className="px-3 py-2 text-right text-slate-500">{formatINR(b.planned)}</td>
                      <td className="px-3 py-2 text-right font-bold text-teal-800">{formatINR(b.newPlanned)}</td>
                      <td className={`px-3 py-2 text-right font-semibold ${d >= 0 ? "text-emerald-600" : "text-red-500"}`}>
                        {d >= 0 ? "+" : ""}{formatINR(d)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-teal-600 mt-2">All amounts rounded to nearest ₹1,000. Click "Apply &amp; Redistribute" above to confirm.</p>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════
          CATEGORY BREAKDOWN
      ════════════════════════════════════════════════════════════════════ */}
      <div>
        <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-3">
          Summary by Category
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
          {catTotals.map(({ cat, planned, actual }) => {
            const pct = totalBudget > 0 ? (planned / totalBudget) * 100 : 0;
            const usedPct = planned > 0 ? Math.min((actual / planned) * 100, 100) : 0;
            return (
              <div key={cat} className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${CATEGORY_COLORS[cat]}`}>{cat}</span>
                  <span className="text-xs text-slate-400 font-medium">{pct.toFixed(1)}%</span>
                </div>
                <p className="text-lg font-bold text-slate-800 leading-tight">{formatINR(planned)}</p>
                <p className="text-xs text-slate-400 mt-0.5">spent: {formatINR(actual)}</p>
                <div className="mt-2.5 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${CATEGORY_BAR[cat]}`} style={{ width: `${usedPct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════════
          LINE ITEMS TABLE + PIE CHART
      ════════════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Table */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base">Budget Line Items</CardTitle>
            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-1.5" data-testid="btn-add-line-item">
                  <Plus className="w-4 h-4" /> Add Line Item
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Add Budget Line Item</DialogTitle></DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField control={form.control} name="channel" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Channel / Purpose</FormLabel>
                        <FormControl><Input {...field} data-testid="input-channel" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="planned" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Planned Amount (₹)</FormLabel>
                        <FormControl><Input type="number" {...field} data-testid="input-planned" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="actual" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Actual Spend (₹)</FormLabel>
                        <FormControl><Input type="number" {...field} data-testid="input-actual" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <DialogFooter><Button type="submit">Save</Button></DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead className="w-8 pl-4">#</TableHead>
                  <TableHead>Channel</TableHead>
                  <TableHead className="w-20">Category</TableHead>
                  <TableHead className="text-right">Planned</TableHead>
                  <TableHead className="text-right w-24">% of Total</TableHead>
                  <TableHead className="text-right">Actual</TableHead>
                  <TableHead className="text-right">Variance</TableHead>
                  <TableHead className="text-right w-24">% Used</TableHead>
                  <TableHead className="w-20" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {budget.map((item, i) => {
                  const variance  = item.planned - item.actual;
                  const pctOfTotal = totalBudget > 0 ? (item.planned / totalBudget) * 100 : 0;
                  const pctUsed   = item.planned > 0 ? (item.actual / item.planned) * 100 : 0;
                  const cat = classifyChannel(item.channel);
                  return (
                    <TableRow key={item.id} data-testid={`row-budget-${item.id}`}>
                      <TableCell className="text-slate-400 text-xs pl-4">{i + 1}</TableCell>
                      <TableCell
                        className="font-medium outline-none focus:bg-slate-50 rounded px-2 min-w-[140px]"
                        contentEditable
                        suppressContentEditableWarning
                        onBlur={e => handleInlineEdit(item.id, e.currentTarget.textContent || "")}
                        title="Double-click to rename"
                      >
                        {item.channel}
                      </TableCell>
                      <TableCell>
                        <span className={`text-xs font-medium px-1.5 py-0.5 rounded-full ${CATEGORY_COLORS[cat]}`}>{cat}</span>
                      </TableCell>
                      <TableCell className="text-right tabular-nums">{formatINR(item.planned)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <div className="w-10 h-1 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-teal-500 rounded-full" style={{ width: `${Math.min(pctOfTotal, 100)}%` }} />
                          </div>
                          <span className="text-xs text-slate-500 tabular-nums w-9 text-right">{pctOfTotal.toFixed(1)}%</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-medium tabular-nums">{formatINR(item.actual)}</TableCell>
                      <TableCell className={`text-right tabular-nums ${variance < 0 ? "text-red-600" : "text-emerald-600"}`}>
                        {variance >= 0 ? "+" : ""}{formatINR(variance)}
                      </TableCell>
                      <TableCell className="text-right">
                        <span className={`px-1.5 py-0.5 rounded text-xs font-semibold ${
                          pctUsed > 100 ? "bg-red-100 text-red-700" :
                          pctUsed > 75  ? "bg-amber-100 text-amber-700" :
                                          "bg-slate-100 text-slate-600"
                        }`}>
                          {pctUsed.toFixed(0)}%
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-0.5">
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-400 hover:text-slate-700" onClick={() => handleEditClick(item)} data-testid={`btn-edit-${item.id}`}>
                            <Edit2 className="w-3.5 h-3.5" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-7 w-7 text-red-400 hover:text-red-600 hover:bg-red-50" data-testid={`btn-delete-${item.id}`}>
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Line Item</AlertDialogTitle>
                                <AlertDialogDescription>Delete "{item.channel}"? This cannot be undone.</AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(item.id)} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}

                {/* Totals row */}
                <TableRow className="bg-[#0f172a] hover:bg-[#0f172a]">
                  <TableCell colSpan={3} className="font-bold text-white pl-4 text-sm">Total Allocated</TableCell>
                  <TableCell className="text-right font-bold text-white tabular-nums">{formatINR(lineItemsSum)}</TableCell>
                  <TableCell className="text-right text-xs text-slate-300 tabular-nums">
                    {totalBudget > 0 ? (lineItemsSum / totalBudget * 100).toFixed(1) : 0}%
                  </TableCell>
                  <TableCell className="text-right font-bold text-amber-300 tabular-nums">{formatINR(totalActual)}</TableCell>
                  <TableCell className={`text-right font-bold tabular-nums ${lineItemsSum - totalActual >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                    {lineItemsSum - totalActual >= 0 ? "+" : ""}{formatINR(lineItemsSum - totalActual)}
                  </TableCell>
                  <TableCell className="text-right text-slate-300 text-xs tabular-nums">
                    {lineItemsSum > 0 ? (totalActual / lineItemsSum * 100).toFixed(0) : 0}%
                  </TableCell>
                  <TableCell />
                </TableRow>
              </TableBody>
            </Table>

            {/* Over/under budget footer */}
            {diff !== 0 && (
              <div className={`mx-4 mb-4 mt-2 flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium ${
                diff > 0 ? "bg-red-50 border border-red-200 text-red-700" : "bg-sky-50 border border-sky-200 text-sky-700"
              }`}>
                {diff > 0
                  ? <><AlertTriangle className="w-4 h-4 shrink-0" /> Line items exceed master budget by {formatINR(Math.abs(diff))}. Increase the master budget or reduce channel amounts.</>
                  : <><CheckCircle2 className="w-4 h-4 shrink-0" /> {formatINR(Math.abs(diff))} unallocated — add line items or update the master budget.</>
                }
              </div>
            )}
          </CardContent>
        </Card>

        {/* Right column */}
        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-sm">Allocation by Channel</CardTitle></CardHeader>
            <CardContent className="h-[260px] flex items-center justify-center">
              {budget.length > 0 ? (
                <Pie
                  data={pieData}
                  options={{
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { position: "bottom", labels: { boxWidth: 10, font: { size: 9 }, padding: 8 } },
                      tooltip: {
                        callbacks: {
                          label: ctx => {
                            const v = ctx.raw as number;
                            const p = totalBudget > 0 ? (v / totalBudget * 100).toFixed(1) : "0";
                            return ` ${formatINR(v)} (${p}%)`;
                          },
                        },
                      },
                    },
                  }}
                />
              ) : (
                <p className="text-slate-400 text-sm">No line items yet</p>
              )}
            </CardContent>
          </Card>

          {/* Budget summary card */}
          <Card>
            <CardHeader><CardTitle className="text-sm">Budget Summary</CardTitle></CardHeader>
            <CardContent className="space-y-2.5 text-sm">
              {[
                { label: "Master Budget",  val: formatINR(totalBudget),              cls: "font-bold text-slate-800" },
                { label: "Total Allocated", val: formatINR(lineItemsSum),             cls: diff > 0 ? "font-bold text-red-600" : "font-semibold text-teal-700" },
                { label: "Unallocated",    val: formatINR(Math.abs(totalBudget - lineItemsSum)), cls: (totalBudget - lineItemsSum) < 0 ? "text-red-600" : "text-sky-600" },
                { label: "Actual Spent",   val: formatINR(totalActual),              cls: "font-semibold text-amber-700" },
                { label: "Unspent Budget", val: formatINR(totalBudget - totalActual), cls: (totalBudget - totalActual) >= 0 ? "font-bold text-emerald-600" : "font-bold text-red-600" },
              ].map(({ label, val, cls }) => (
                <div key={label} className="flex justify-between items-center py-1 border-b border-slate-100 last:border-0">
                  <span className="text-slate-500 text-xs">{label}</span>
                  <span className={`text-xs ${cls}`}>{val}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ── Edit dialog ──────────────────────────────────────────────────── */}
      <Dialog open={!!editingItem} onOpenChange={open => !open && setEditingItem(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Budget Line Item</DialogTitle></DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField control={form.control} name="channel" render={({ field }) => (
                <FormItem><FormLabel>Channel / Purpose</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="planned" render={({ field }) => (
                <FormItem><FormLabel>Planned Amount (₹)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="actual" render={({ field }) => (
                <FormItem><FormLabel>Actual Spend (₹)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <DialogFooter><Button type="submit">Save Changes</Button></DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
