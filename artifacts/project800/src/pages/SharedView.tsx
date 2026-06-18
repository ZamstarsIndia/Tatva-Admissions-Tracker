import { SnapshotData } from "@/utils/shareLink";
import { formatINR } from "@/utils/format";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Props = { snapshot: SnapshotData };

const STATUS_COLORS: Record<string, string> = {
  Idea: "bg-yellow-100 text-yellow-800",
  Planned: "bg-blue-100 text-blue-800",
  Active: "bg-green-100 text-green-800",
  Completed: "bg-slate-100 text-slate-700",
  Paused: "bg-orange-100 text-orange-800",
  Confirmed: "bg-green-100 text-green-800",
  Cancelled: "bg-red-100 text-red-800",
  Designing: "bg-purple-100 text-purple-800",
  Printing: "bg-indigo-100 text-indigo-800",
};

function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex flex-col gap-1">
      <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">{label}</span>
      <span className="text-2xl font-bold text-slate-800">{value}</span>
      {sub && <span className="text-xs text-slate-400">{sub}</span>}
    </div>
  );
}

export default function SharedView({ snapshot }: Props) {
  const { months, budget, campaigns, events, hoardings, totalBudget, generatedAt } = snapshot;

  const totalActualAdm = months.reduce((s, m) => s + m.actualAdm, 0);
  const totalPlanAdm = months.reduce((s, m) => s + m.planAdm, 0);
  const totalActualSpend = months.reduce((s, m) => s + m.actualSpend, 0);
  const totalPlanSpend = months.reduce((s, m) => s + m.planSpend, 0);
  const totalActualEnq = months.reduce((s, m) => s + m.actualEnq, 0);

  const generatedDate = new Date(generatedAt).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-[#0f172a] text-white px-8 py-5 flex items-center justify-between shadow-md">
        <div>
          <div className="text-xs font-semibold uppercase tracking-widest text-teal-400 mb-1">Tatva Global School</div>
          <h1 className="text-2xl font-bold tracking-tight">Project 800 — Marketing Plan</h1>
          <p className="text-sm text-slate-400 mt-0.5">AY 2027-28 | Jul 2026 – May 2027 | Read-only snapshot</p>
        </div>
        <div className="text-right">
          <div className="text-xs text-slate-400">Snapshot generated</div>
          <div className="text-sm font-medium text-slate-200 mt-0.5">{generatedDate}</div>
          <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-800/50 border border-teal-600/30">
            <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
            <span className="text-xs text-teal-300 font-medium">View only</span>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-10">
        <section>
          <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-400 mb-4">Summary</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <StatCard label="Target" value="800" sub="admissions" />
            <StatCard label="Admissions" value={String(totalActualAdm)} sub={`of ${totalPlanAdm} planned`} />
            <StatCard label="Remaining" value={String(800 - totalActualAdm)} sub="seats left" />
            <StatCard label="Budget" value={formatINR(totalBudget)} sub="total planned" />
            <StatCard label="Spent" value={totalActualSpend ? formatINR(totalActualSpend) : "₹0"} sub={`of ${formatINR(totalPlanSpend)} planned`} />
            <StatCard label="Enquiries" value={String(totalActualEnq)} sub="total received" />
          </div>
        </section>

        <section>
          <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-400 mb-4">Monthly Progress</h2>
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-[#0f766e] text-white">
                      {["Month", "Theme", "Plan Adm", "Actual Adm", "Plan Enq", "Actual Enq", "Plan Spend", "Actual Spend"].map((h) => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-semibold">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {months.map((m, i) => {
                      const admPct = m.planAdm > 0 ? Math.round((m.actualAdm / m.planAdm) * 100) : 0;
                      return (
                        <tr key={m.id} className={i % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                          <td className="px-4 py-3 font-semibold text-slate-700 whitespace-nowrap">{m.month}</td>
                          <td className="px-4 py-3 text-slate-500 text-xs max-w-[180px]">{m.theme}</td>
                          <td className="px-4 py-3 text-slate-700">{m.planAdm}</td>
                          <td className="px-4 py-3">
                            <span className={`font-semibold ${m.actualAdm > 0 ? "text-teal-700" : "text-slate-400"}`}>
                              {m.actualAdm || "–"}
                            </span>
                            {m.actualAdm > 0 && (
                              <span className="ml-1.5 text-xs text-slate-400">{admPct}%</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-slate-700">{m.planEnq}</td>
                          <td className="px-4 py-3 font-semibold text-slate-700">{m.actualEnq || "–"}</td>
                          <td className="px-4 py-3 text-slate-700 whitespace-nowrap">{formatINR(m.planSpend)}</td>
                          <td className="px-4 py-3 font-semibold whitespace-nowrap">
                            <span className={m.actualSpend > 0 ? "text-teal-700" : "text-slate-400"}>
                              {m.actualSpend ? formatINR(m.actualSpend) : "–"}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr className="bg-[#0f172a] text-white font-bold text-xs">
                      <td className="px-4 py-3" colSpan={2}>TOTAL</td>
                      <td className="px-4 py-3">{totalPlanAdm}</td>
                      <td className="px-4 py-3">{totalActualAdm || "–"}</td>
                      <td className="px-4 py-3">{months.reduce((s, m) => s + m.planEnq, 0)}</td>
                      <td className="px-4 py-3">{totalActualEnq || "–"}</td>
                      <td className="px-4 py-3">{formatINR(totalPlanSpend)}</td>
                      <td className="px-4 py-3">{totalActualSpend ? formatINR(totalActualSpend) : "–"}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </CardContent>
          </Card>
        </section>

        <section>
          <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-400 mb-4">Budget Allocation</h2>
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-[#0f766e] text-white">
                      {["#", "Channel", "Planned Budget", "Actual Spend", "Variance", "% Used"].map((h) => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-semibold">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {budget.map((b, i) => {
                      const variance = b.planned - b.actual;
                      const pct = b.planned > 0 ? ((b.actual / b.planned) * 100).toFixed(1) : "0";
                      return (
                        <tr key={b.id} className={i % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                          <td className="px-4 py-3 text-slate-400 text-xs">{i + 1}</td>
                          <td className="px-4 py-3 font-medium text-slate-700">{b.channel}</td>
                          <td className="px-4 py-3 text-slate-700">{formatINR(b.planned)}</td>
                          <td className="px-4 py-3 font-semibold text-teal-700">{b.actual ? formatINR(b.actual) : "–"}</td>
                          <td className="px-4 py-3 text-slate-500">{b.actual ? formatINR(variance) : "–"}</td>
                          <td className="px-4 py-3">
                            {b.actual > 0 && (
                              <div className="flex items-center gap-2">
                                <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden w-16">
                                  <div className="h-full bg-teal-500 rounded-full" style={{ width: `${Math.min(parseFloat(pct), 100)}%` }} />
                                </div>
                                <span className="text-xs text-slate-500">{pct}%</span>
                              </div>
                            )}
                            {!b.actual && <span className="text-slate-400">–</span>}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr className="bg-[#0f172a] text-white font-bold text-xs">
                      <td className="px-4 py-3" colSpan={2}>TOTAL</td>
                      <td className="px-4 py-3">{formatINR(totalBudget)}</td>
                      <td className="px-4 py-3">{budget.reduce((s, b) => s + b.actual, 0) ? formatINR(budget.reduce((s, b) => s + b.actual, 0)) : "–"}</td>
                      <td className="px-4 py-3">{budget.reduce((s, b) => s + b.actual, 0) ? formatINR(totalBudget - budget.reduce((s, b) => s + b.actual, 0)) : "–"}</td>
                      <td className="px-4 py-3" />
                    </tr>
                  </tfoot>
                </table>
              </div>
            </CardContent>
          </Card>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <section>
            <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-400 mb-4">Campaigns ({campaigns.length})</h2>
            <Card>
              <CardContent className="p-0">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-[#0f766e] text-white">
                      {["Campaign", "Channel", "Month", "Budget", "Status"].map((h) => (
                        <th key={h} className="px-3 py-3 text-left text-xs font-semibold">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {campaigns.map((c, i) => (
                      <tr key={c.id} className={i % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                        <td className="px-3 py-2.5 font-medium text-slate-700 text-xs">{c.name}</td>
                        <td className="px-3 py-2.5 text-slate-500 text-xs">{c.channel}</td>
                        <td className="px-3 py-2.5 text-slate-500 text-xs whitespace-nowrap">{c.month}</td>
                        <td className="px-3 py-2.5 text-slate-700 text-xs whitespace-nowrap">{formatINR(c.budget)}</td>
                        <td className="px-3 py-2.5">
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_COLORS[c.status] ?? "bg-slate-100 text-slate-600"}`}>
                            {c.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </section>

          <section>
            <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-400 mb-4">Hoardings ({hoardings.length} rounds)</h2>
            <Card>
              <CardContent className="p-0">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-[#0f766e] text-white">
                      {["Creative", "Period", "Sites", "Days", "Status"].map((h) => (
                        <th key={h} className="px-3 py-3 text-left text-xs font-semibold">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {hoardings.map((h, i) => (
                      <tr key={h.id} className={i % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                        <td className="px-3 py-2.5 font-medium text-slate-700 text-xs">{h.creativeRound}</td>
                        <td className="px-3 py-2.5 text-slate-500 text-xs whitespace-nowrap">{h.period}</td>
                        <td className="px-3 py-2.5 text-slate-700 text-xs">{h.sites}</td>
                        <td className="px-3 py-2.5 text-slate-700 text-xs">{h.durationDays}</td>
                        <td className="px-3 py-2.5">
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_COLORS[h.status] ?? "bg-slate-100 text-slate-600"}`}>
                            {h.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </section>
        </div>

        <section>
          <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-400 mb-4">Events Calendar ({events.length} events)</h2>
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-[#0f766e] text-white">
                      {["Event", "Type", "Month", "Date", "Expected", "Actual", "Status"].map((h) => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-semibold">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {events.map((e, i) => (
                      <tr key={e.id} className={i % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                        <td className="px-4 py-2.5 font-medium text-slate-700 text-xs">{e.name}</td>
                        <td className="px-4 py-2.5 text-slate-500 text-xs">{e.type}</td>
                        <td className="px-4 py-2.5 text-slate-500 text-xs whitespace-nowrap">{e.month}</td>
                        <td className="px-4 py-2.5 text-slate-500 text-xs whitespace-nowrap">{e.date}</td>
                        <td className="px-4 py-2.5 text-slate-700 text-xs">{e.expected}</td>
                        <td className="px-4 py-2.5 text-xs font-semibold">
                          <span className={e.actual > 0 ? "text-teal-700" : "text-slate-400"}>
                            {e.actual || "–"}
                          </span>
                        </td>
                        <td className="px-4 py-2.5">
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_COLORS[e.status] ?? "bg-slate-100 text-slate-600"}`}>
                            {e.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </section>

        <footer className="text-center text-xs text-slate-400 py-6 border-t border-slate-200">
          Tatva Global School — Project 800 — Read-only snapshot generated on {generatedDate}
        </footer>
      </div>
    </div>
  );
}
