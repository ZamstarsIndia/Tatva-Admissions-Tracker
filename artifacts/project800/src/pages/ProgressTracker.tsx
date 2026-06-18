import { useState } from "react";
import { useAppData } from "@/hooks/useAppData";
import { MonthData } from "@/data/defaults";
import { formatINR } from "@/utils/format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Save } from "lucide-react";

export default function ProgressTracker() {
  const { months, setMonths } = useAppData();
  const [localMonths, setLocalMonths] = useState<MonthData[]>(months);

  const handleInputChange = (id: string, field: keyof MonthData, value: string) => {
    setLocalMonths(prev => 
      prev.map(m => {
        if (m.id === id) {
          return {
            ...m,
            [field]: field === 'notes' ? value : (Number(value) || 0)
          };
        }
        return m;
      })
    );
  };

  const handleSave = () => {
    setMonths(localMonths);
    toast.success("Actuals saved successfully");
  };

  const totals = localMonths.reduce(
    (acc, m) => ({
      planAdm: acc.planAdm + m.planAdm,
      actualAdm: acc.actualAdm + m.actualAdm,
      planEnq: acc.planEnq + m.planEnq,
      actualEnq: acc.actualEnq + m.actualEnq,
      planSpend: acc.planSpend + m.planSpend,
      actualSpend: acc.actualSpend + m.actualSpend,
    }),
    { planAdm: 0, actualAdm: 0, planEnq: 0, actualEnq: 0, planSpend: 0, actualSpend: 0 }
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Progress Tracker</h2>
          <p className="text-sm text-slate-500">Track planned vs actual metrics month by month.</p>
        </div>
        <Button onClick={handleSave} className="gap-2 bg-primary hover:bg-primary/90">
          <Save className="w-4 h-4" /> Save Actuals
        </Button>
      </div>

      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead className="w-[120px]">Month</TableHead>
                <TableHead className="w-[200px]">Theme</TableHead>
                <TableHead className="text-right">Plan Adm</TableHead>
                <TableHead className="text-right w-[100px]">Actual Adm</TableHead>
                <TableHead className="text-right">Plan Enq</TableHead>
                <TableHead className="text-right w-[100px]">Actual Enq</TableHead>
                <TableHead className="text-right">Plan Spend</TableHead>
                <TableHead className="text-right w-[140px]">Actual Spend</TableHead>
                <TableHead>Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {localMonths.map((m) => (
                <TableRow key={m.id}>
                  <TableCell className="font-medium text-slate-700">{m.month}</TableCell>
                  <TableCell className="text-xs text-slate-500">{m.theme}</TableCell>
                  <TableCell className="text-right text-slate-600">{m.planAdm}</TableCell>
                  <TableCell>
                    <Input 
                      type="number" 
                      value={m.actualAdm || ''} 
                      onChange={(e) => handleInputChange(m.id, 'actualAdm', e.target.value)}
                      className="h-8 text-right px-2"
                    />
                  </TableCell>
                  <TableCell className="text-right text-slate-600">{m.planEnq}</TableCell>
                  <TableCell>
                    <Input 
                      type="number" 
                      value={m.actualEnq || ''} 
                      onChange={(e) => handleInputChange(m.id, 'actualEnq', e.target.value)}
                      className="h-8 text-right px-2"
                    />
                  </TableCell>
                  <TableCell className="text-right text-slate-600">{formatINR(m.planSpend)}</TableCell>
                  <TableCell>
                    <Input 
                      type="number" 
                      value={m.actualSpend || ''} 
                      onChange={(e) => handleInputChange(m.id, 'actualSpend', e.target.value)}
                      className="h-8 text-right px-2"
                    />
                  </TableCell>
                  <TableCell>
                    <Input 
                      type="text" 
                      value={m.notes || ''} 
                      onChange={(e) => handleInputChange(m.id, 'notes', e.target.value)}
                      className="h-8 px-2 min-w-[150px]"
                      placeholder="Add notes..."
                    />
                  </TableCell>
                </TableRow>
              ))}
              <TableRow className="bg-slate-100 font-bold hover:bg-slate-100">
                <TableCell colSpan={2}>Totals</TableCell>
                <TableCell className="text-right">{totals.planAdm}</TableCell>
                <TableCell className="text-right text-primary">{totals.actualAdm}</TableCell>
                <TableCell className="text-right">{totals.planEnq}</TableCell>
                <TableCell className="text-right text-primary">{totals.actualEnq}</TableCell>
                <TableCell className="text-right">{formatINR(totals.planSpend)}</TableCell>
                <TableCell className="text-right text-primary">{formatINR(totals.actualSpend)}</TableCell>
                <TableCell></TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
