import React, { useState } from "react";
import { useAppData, makeDefaultWeeklyData } from "@/hooks/useAppData";
import { MonthData, WeekEntry, DayEntry } from "@/data/defaults";
import { formatINR } from "@/utils/format";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { Save, ChevronRight, ChevronDown } from "lucide-react";

// ─── helpers ────────────────────────────────────────────────────────────────

function weekTotals(entry: WeekEntry) {
  return {
    admissions: entry.days.reduce((s, d) => s + d.admissions, 0),
    enquiries: entry.days.reduce((s, d) => s + d.enquiries, 0),
    spend: entry.days.reduce((s, d) => s + d.spend, 0),
  };
}

function monthRollup(monthId: string, weekly: WeekEntry[]) {
  return weekly
    .filter((w) => w.monthId === monthId)
    .reduce(
      (acc, w) => {
        const t = weekTotals(w);
        return {
          admissions: acc.admissions + t.admissions,
          enquiries: acc.enquiries + t.enquiries,
          spend: acc.spend + t.spend,
        };
      },
      { admissions: 0, enquiries: 0, spend: 0 }
    );
}

function hasWeeklyEntries(monthId: string, weekly: WeekEntry[]): boolean {
  return weekly
    .filter((w) => w.monthId === monthId)
    .some((w) => w.days.some((d) => d.admissions > 0 || d.enquiries > 0 || d.spend > 0));
}

// Day-of-week labels for the 7 days inside each week
const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

// ─── component ──────────────────────────────────────────────────────────────

export default function ProgressTracker() {
  const { months, setMonths, weeklyData, setWeeklyData } = useAppData();

  const [localMonths, setLocalMonths] = useState<MonthData[]>(months);
  const [localWeekly, setLocalWeekly] = useState<WeekEntry[]>(() =>
    weeklyData && weeklyData.length > 0
      ? weeklyData
      : makeDefaultWeeklyData(months)
  );

  const [expandedMonths, setExpandedMonths] = useState<Set<string>>(new Set());
  const [expandedWeeks, setExpandedWeeks] = useState<Set<string>>(new Set());

  // ── toggle helpers ─────────────────────────────────────────────────────────

  const toggleMonth = (id: string) =>
    setExpandedMonths((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const toggleWeek = (key: string) =>
    setExpandedWeeks((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });

  // ── input handlers ─────────────────────────────────────────────────────────

  const handleMonthInput = (id: string, field: keyof MonthData, value: string) =>
    setLocalMonths((prev) =>
      prev.map((m) =>
        m.id === id
          ? { ...m, [field]: field === "notes" ? value : Number(value) || 0 }
          : m
      )
    );

  const handleDayInput = (
    monthId: string,
    week: number,
    day: number,
    field: keyof Omit<DayEntry, "day">,
    value: string
  ) =>
    setLocalWeekly((prev) =>
      prev.map((w) =>
        w.monthId !== monthId || w.week !== week
          ? w
          : {
              ...w,
              days: w.days.map((d) =>
                d.day !== day
                  ? d
                  : {
                      ...d,
                      [field]: field === "note" ? value : Number(value) || 0,
                    }
              ),
            }
      )
    );

  // ── save ───────────────────────────────────────────────────────────────────

  const handleSave = () => {
    // Roll up weekly data into monthly actuals where applicable
    const updated = localMonths.map((m) => {
      if (hasWeeklyEntries(m.id, localWeekly)) {
        const t = monthRollup(m.id, localWeekly);
        return { ...m, actualAdm: t.admissions, actualEnq: t.enquiries, actualSpend: t.spend };
      }
      return m;
    });
    setMonths(updated);
    setWeeklyData(localWeekly);
    setLocalMonths(updated);
    toast.success("Progress saved successfully");
  };

  // ── grand totals ───────────────────────────────────────────────────────────

  const grand = localMonths.reduce(
    (acc, m) => {
      const hasW = hasWeeklyEntries(m.id, localWeekly);
      const mt = hasW ? monthRollup(m.id, localWeekly) : null;
      return {
        planAdm: acc.planAdm + m.planAdm,
        actualAdm: acc.actualAdm + (mt ? mt.admissions : m.actualAdm),
        planEnq: acc.planEnq + m.planEnq,
        actualEnq: acc.actualEnq + (mt ? mt.enquiries : m.actualEnq),
        planSpend: acc.planSpend + m.planSpend,
        actualSpend: acc.actualSpend + (mt ? mt.spend : m.actualSpend),
      };
    },
    { planAdm: 0, actualAdm: 0, planEnq: 0, actualEnq: 0, planSpend: 0, actualSpend: 0 }
  );

  // ── render ─────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Progress Tracker</h2>
          <p className="text-sm text-slate-500">
            Click ▶ to expand months → weeks → days. Daily entries roll up automatically.
          </p>
        </div>
        <Button onClick={handleSave} className="gap-2 bg-primary hover:bg-primary/90">
          <Save className="w-4 h-4" /> Save Progress
        </Button>
      </div>

      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead className="w-[170px]">Month / Week / Day</TableHead>
                <TableHead className="w-[190px]">Theme / Label</TableHead>
                <TableHead className="text-right">Plan Adm</TableHead>
                <TableHead className="text-right w-[110px]">Actual Adm</TableHead>
                <TableHead className="text-right">Plan Enq</TableHead>
                <TableHead className="text-right w-[110px]">Actual Enq</TableHead>
                <TableHead className="text-right">Plan Spend</TableHead>
                <TableHead className="text-right w-[140px]">Actual Spend</TableHead>
                <TableHead>Notes</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {localMonths.map((m) => {
                const isMonthOpen = expandedMonths.has(m.id);
                const hasW = hasWeeklyEntries(m.id, localWeekly);
                const mt = hasW ? monthRollup(m.id, localWeekly) : null;
                const weeksForMonth = localWeekly.filter((w) => w.monthId === m.id);

                return (
                  <React.Fragment key={m.id}>
                    {/* ── MONTH ROW ─────────────────────────────────────────── */}
                    <TableRow className="bg-white hover:bg-slate-50 border-b-2 border-slate-200">
                      <TableCell className="font-semibold text-slate-800 py-2">
                        <button
                          onClick={() => toggleMonth(m.id)}
                          className="flex items-center gap-1.5 text-left w-full hover:text-teal-700 transition-colors"
                        >
                          {isMonthOpen ? (
                            <ChevronDown className="w-3.5 h-3.5 text-teal-600 flex-shrink-0" />
                          ) : (
                            <ChevronRight className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                          )}
                          <span>{m.month}</span>
                        </button>
                      </TableCell>

                      <TableCell className="text-xs text-slate-500">{m.theme}</TableCell>

                      <TableCell className="text-right text-slate-600">{m.planAdm}</TableCell>

                      <TableCell>
                        {mt !== null ? (
                          <span className="flex justify-end pr-2 font-semibold text-teal-700 text-sm">
                            {mt.admissions}
                          </span>
                        ) : (
                          <Input
                            type="number"
                            value={m.actualAdm || ""}
                            onChange={(e) => handleMonthInput(m.id, "actualAdm", e.target.value)}
                            className="h-8 text-right px-2"
                          />
                        )}
                      </TableCell>

                      <TableCell className="text-right text-slate-600">{m.planEnq}</TableCell>

                      <TableCell>
                        {mt !== null ? (
                          <span className="flex justify-end pr-2 font-semibold text-teal-700 text-sm">
                            {mt.enquiries}
                          </span>
                        ) : (
                          <Input
                            type="number"
                            value={m.actualEnq || ""}
                            onChange={(e) => handleMonthInput(m.id, "actualEnq", e.target.value)}
                            className="h-8 text-right px-2"
                          />
                        )}
                      </TableCell>

                      <TableCell className="text-right text-slate-600">{formatINR(m.planSpend)}</TableCell>

                      <TableCell>
                        {mt !== null ? (
                          <span className="flex justify-end pr-2 font-semibold text-teal-700 text-sm">
                            {formatINR(mt.spend)}
                          </span>
                        ) : (
                          <Input
                            type="number"
                            value={m.actualSpend || ""}
                            onChange={(e) => handleMonthInput(m.id, "actualSpend", e.target.value)}
                            className="h-8 text-right px-2"
                          />
                        )}
                      </TableCell>

                      <TableCell>
                        <Input
                          type="text"
                          value={m.notes || ""}
                          onChange={(e) => handleMonthInput(m.id, "notes", e.target.value)}
                          className="h-8 px-2 min-w-[120px]"
                          placeholder="Notes..."
                        />
                      </TableCell>
                    </TableRow>

                    {/* ── WEEK ROWS ─────────────────────────────────────────── */}
                    {isMonthOpen &&
                      weeksForMonth.map((wEntry) => {
                        const wKey = `${m.id}-${wEntry.week}`;
                        const isWeekOpen = expandedWeeks.has(wKey);
                        const wt = weekTotals(wEntry);
                        const weekHasData = wt.admissions > 0 || wt.enquiries > 0 || wt.spend > 0;

                        return (
                          <React.Fragment key={wKey}>
                            <TableRow className="bg-teal-50/50 border-b border-teal-100">
                              <TableCell className="py-2 pl-7">
                                <button
                                  onClick={() => toggleWeek(wKey)}
                                  className="flex items-center gap-1.5 text-left w-full text-sm font-medium text-teal-800 hover:text-teal-600 transition-colors"
                                >
                                  {isWeekOpen ? (
                                    <ChevronDown className="w-3 h-3 text-teal-600 flex-shrink-0" />
                                  ) : (
                                    <ChevronRight className="w-3 h-3 text-teal-400 flex-shrink-0" />
                                  )}
                                  <span>Week {wEntry.week}</span>
                                </button>
                              </TableCell>

                              <TableCell className="text-xs text-teal-500 italic">
                                {weekHasData ? "auto-computed from days" : "expand to enter days"}
                              </TableCell>

                              <TableCell />

                              <TableCell className="text-right text-sm font-semibold text-teal-700 pr-3">
                                {weekHasData ? wt.admissions : <span className="text-slate-300">–</span>}
                              </TableCell>

                              <TableCell />

                              <TableCell className="text-right text-sm font-semibold text-teal-700 pr-3">
                                {weekHasData ? wt.enquiries : <span className="text-slate-300">–</span>}
                              </TableCell>

                              <TableCell />

                              <TableCell className="text-right text-sm font-semibold text-teal-700 pr-3">
                                {weekHasData ? formatINR(wt.spend) : <span className="text-slate-300">–</span>}
                              </TableCell>

                              <TableCell />
                            </TableRow>

                            {/* ── DAY ROWS ──────────────────────────────────── */}
                            {isWeekOpen &&
                              wEntry.days.map((day) => (
                                <TableRow
                                  key={`${wKey}-d${day.day}`}
                                  className="bg-white border-b border-slate-100 hover:bg-slate-50/40"
                                >
                                  <TableCell className="py-1.5 pl-14 text-xs text-slate-500 font-medium">
                                    <span className="inline-flex items-center gap-1">
                                      <span className="text-slate-300">│</span>
                                      {DAY_LABELS[day.day - 1]}
                                    </span>
                                  </TableCell>

                                  <TableCell className="text-xs text-slate-400 italic">Day {day.day}</TableCell>

                                  <TableCell />

                                  <TableCell>
                                    <Input
                                      type="number"
                                      min={0}
                                      value={day.admissions || ""}
                                      onChange={(e) =>
                                        handleDayInput(m.id, wEntry.week, day.day, "admissions", e.target.value)
                                      }
                                      className="h-7 text-right px-2 text-xs w-20 ml-auto"
                                      placeholder="0"
                                    />
                                  </TableCell>

                                  <TableCell />

                                  <TableCell>
                                    <Input
                                      type="number"
                                      min={0}
                                      value={day.enquiries || ""}
                                      onChange={(e) =>
                                        handleDayInput(m.id, wEntry.week, day.day, "enquiries", e.target.value)
                                      }
                                      className="h-7 text-right px-2 text-xs w-20 ml-auto"
                                      placeholder="0"
                                    />
                                  </TableCell>

                                  <TableCell />

                                  <TableCell>
                                    <Input
                                      type="number"
                                      min={0}
                                      value={day.spend || ""}
                                      onChange={(e) =>
                                        handleDayInput(m.id, wEntry.week, day.day, "spend", e.target.value)
                                      }
                                      className="h-7 text-right px-2 text-xs w-28 ml-auto"
                                      placeholder="0"
                                    />
                                  </TableCell>

                                  <TableCell>
                                    <Input
                                      type="text"
                                      value={day.note || ""}
                                      onChange={(e) =>
                                        handleDayInput(m.id, wEntry.week, day.day, "note", e.target.value)
                                      }
                                      className="h-7 px-2 text-xs min-w-[120px]"
                                      placeholder="Note..."
                                    />
                                  </TableCell>
                                </TableRow>
                              ))}
                          </React.Fragment>
                        );
                      })}
                  </React.Fragment>
                );
              })}

              {/* ── GRAND TOTALS ROW ──────────────────────────────────────── */}
              <TableRow className="bg-slate-100 font-bold hover:bg-slate-100 border-t-2 border-slate-300">
                <TableCell colSpan={2} className="text-slate-700">
                  Totals (11 months)
                </TableCell>
                <TableCell className="text-right">{grand.planAdm}</TableCell>
                <TableCell className="text-right text-primary">{grand.actualAdm}</TableCell>
                <TableCell className="text-right">{grand.planEnq}</TableCell>
                <TableCell className="text-right text-primary">{grand.actualEnq}</TableCell>
                <TableCell className="text-right">{formatINR(grand.planSpend)}</TableCell>
                <TableCell className="text-right text-primary">{formatINR(grand.actualSpend)}</TableCell>
                <TableCell />
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
