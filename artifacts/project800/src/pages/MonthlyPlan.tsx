import { useState } from "react";
import { useAppData } from "@/hooks/useAppData";
import { MonthData } from "@/data/defaults";
import { formatINR } from "@/utils/format";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Edit, Activity, X } from "lucide-react";
import { toast } from "sonner";

export default function MonthlyPlan() {
  const { months, setMonths } = useAppData();
  
  const [editingMonth, setEditingMonth] = useState<MonthData | null>(null);
  const [editMode, setEditMode] = useState<'plan' | 'actual' | null>(null);
  const [formData, setFormData] = useState({ adm: 0, enq: 0, spend: 0 });

  const handleEditClick = (month: MonthData, mode: 'plan' | 'actual') => {
    setEditingMonth(month);
    setEditMode(mode);
    if (mode === 'plan') {
      setFormData({ adm: month.planAdm, enq: month.planEnq, spend: month.planSpend });
    } else {
      setFormData({ adm: month.actualAdm, enq: month.actualEnq, spend: month.actualSpend });
    }
  };

  const handleSave = () => {
    if (!editingMonth || !editMode) return;
    
    setMonths(months.map(m => {
      if (m.id === editingMonth.id) {
        if (editMode === 'plan') {
          return { ...m, planAdm: formData.adm, planEnq: formData.enq, planSpend: formData.spend };
        } else {
          return { ...m, actualAdm: formData.adm, actualEnq: formData.enq, actualSpend: formData.spend };
        }
      }
      return m;
    }));
    
    toast.success(`${editMode === 'plan' ? 'Plan' : 'Actuals'} updated for ${editingMonth.month}`);
    setEditingMonth(null);
    setEditMode(null);
  };

  const handleAddActivity = (monthId: string, activity: string) => {
    if (!activity.trim()) return;
    setMonths(months.map(m => {
      if (m.id === monthId) {
        return { ...m, activities: [...(m.activities || []), activity.trim()] };
      }
      return m;
    }));
  };

  const handleDeleteActivity = (monthId: string, index: number) => {
    setMonths(months.map(m => {
      if (m.id === monthId) {
        const newActivities = [...(m.activities || [])];
        newActivities.splice(index, 1);
        return { ...m, activities: newActivities };
      }
      return m;
    }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Monthly Plan</h2>
        <p className="text-sm text-slate-500">Detailed month-by-month objectives and activities.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {months.map((m) => {
          const progress = m.planAdm > 0 ? Math.min((m.actualAdm / m.planAdm) * 100, 100) : 0;
          return (
            <Card key={m.id} className="flex flex-col h-full border-t-4 border-t-primary shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-3 border-b border-slate-100 bg-slate-50/50">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-bold text-slate-800">{m.month}</h3>
                    <p className="text-sm text-primary font-medium">{m.theme}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-4 flex-1 flex flex-col">
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium">Admissions</span>
                      <span className="text-slate-500">{m.actualAdm} / {m.planAdm}</span>
                    </div>
                    <Progress value={progress} className="h-2 bg-slate-100" />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div className="space-y-1">
                      <p className="text-xs text-slate-500 uppercase font-semibold tracking-wider">Enquiries</p>
                      <p className="text-sm"><span className="font-medium text-slate-800">{m.actualEnq}</span> <span className="text-slate-400">/ {m.planEnq}</span></p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-slate-500 uppercase font-semibold tracking-wider">Spend</p>
                      <p className="text-sm"><span className="font-medium text-slate-800">{formatINR(m.actualSpend)}</span></p>
                      <p className="text-xs text-slate-400">of {formatINR(m.planSpend)}</p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100">
                    <p className="text-sm font-semibold flex items-center gap-2 mb-3 text-slate-700">
                      <Activity className="w-4 h-4 text-accent" /> Key Activities
                    </p>
                    <ul className="space-y-2 mb-3">
                      {(m.activities || []).map((act, i) => (
                        <li key={i} className="text-sm text-slate-600 bg-slate-50 px-2 py-1.5 rounded flex justify-between items-start group">
                          <span className="flex-1 leading-snug">{act}</span>
                          <button 
                            onClick={() => handleDeleteActivity(m.id, i)}
                            className="text-slate-400 hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity ml-2 shrink-0"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </li>
                      ))}
                    </ul>
                    <Input 
                      placeholder="Add activity (Press Enter)" 
                      className="h-8 text-sm"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleAddActivity(m.id, e.currentTarget.value);
                          e.currentTarget.value = '';
                        }
                      }}
                    />
                  </div>
                </div>

                <div className="mt-auto pt-6 flex gap-2">
                  <Button variant="outline" size="sm" className="w-full text-xs" onClick={() => handleEditClick(m, 'plan')}>
                    <Edit className="w-3 h-3 mr-1.5" /> Edit Plan
                  </Button>
                  <Button variant="secondary" size="sm" className="w-full text-xs bg-slate-100 hover:bg-slate-200 text-slate-800" onClick={() => handleEditClick(m, 'actual')}>
                    Enter Actuals
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Dialog open={!!editingMonth} onOpenChange={(open) => !open && setEditingMonth(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editMode === 'plan' ? 'Edit Plan for ' : 'Enter Actuals for '}
              {editingMonth?.month}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Admissions</Label>
              <Input 
                type="number" 
                value={formData.adm} 
                onChange={(e) => setFormData({...formData, adm: Number(e.target.value) || 0})}
              />
            </div>
            <div className="space-y-2">
              <Label>Enquiries</Label>
              <Input 
                type="number" 
                value={formData.enq} 
                onChange={(e) => setFormData({...formData, enq: Number(e.target.value) || 0})}
              />
            </div>
            <div className="space-y-2">
              <Label>Spend (₹)</Label>
              <Input 
                type="number" 
                value={formData.spend} 
                onChange={(e) => setFormData({...formData, spend: Number(e.target.value) || 0})}
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleSave}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
