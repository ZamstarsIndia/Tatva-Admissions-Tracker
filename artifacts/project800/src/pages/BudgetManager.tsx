import { useState } from "react";
import { useAppData } from "@/hooks/useAppData";
import { BudgetItem } from "@/data/defaults";
import { formatINR } from "@/utils/format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Plus, Edit2, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Pie, Bar } from "react-chartjs-2";
import { ArcElement, Tooltip as ChartTooltip, Legend as ChartLegend, CategoryScale, LinearScale, BarElement, Title as ChartTitle } from "chart.js";
import { Chart as ChartJS } from "chart.js";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

ChartJS.register(ArcElement, ChartTooltip, ChartLegend, CategoryScale, LinearScale, BarElement, ChartTitle);

const budgetSchema = z.object({
  channel: z.string().min(1, "Channel name is required"),
  planned: z.coerce.number().min(0, "Planned amount must be positive"),
  actual: z.coerce.number().min(0, "Actual amount must be positive"),
});

export default function BudgetManager() {
  const { budget, setBudget } = useAppData();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<BudgetItem | null>(null);

  const totalPlanned = 4000000;
  const currentPlanned = budget.reduce((sum, item) => sum + item.planned, 0);
  const totalActual = budget.reduce((sum, item) => sum + item.actual, 0);
  const totalVariance = currentPlanned - totalActual;
  const budgetRemaining = totalPlanned - totalActual;

  const form = useForm<z.infer<typeof budgetSchema>>({
    resolver: zodResolver(budgetSchema),
    defaultValues: {
      channel: "",
      planned: 0,
      actual: 0,
    },
  });

  const onSubmit = (values: z.infer<typeof budgetSchema>) => {
    if (editingItem) {
      setBudget(budget.map(item => item.id === editingItem.id ? { ...editingItem, ...values } : item));
      toast.success("Line item updated");
      setEditingItem(null);
    } else {
      const newItem: BudgetItem = {
        id: `b${Date.now()}`,
        ...values,
      };
      setBudget([...budget, newItem]);
      toast.success("Line item added");
      setIsAddOpen(false);
    }
    form.reset();
  };

  const handleDelete = (id: string) => {
    setBudget(budget.filter(item => item.id !== id));
    toast.success("Line item deleted");
  };

  const handleInlineEdit = (id: string, newChannel: string) => {
    if (!newChannel.trim()) return;
    setBudget(budget.map(item => item.id === id ? { ...item, channel: newChannel } : item));
  };

  const handleEditClick = (item: BudgetItem) => {
    setEditingItem(item);
    form.reset({
      channel: item.channel,
      planned: item.planned,
      actual: item.actual,
    });
  };

  const pieData = {
    labels: budget.map(b => b.channel),
    datasets: [{
      data: budget.map(b => b.planned),
      backgroundColor: [
        '#0f766e', '#0e7490', '#0369a1', '#0284c7', '#1d4ed8', 
        '#4338ca', '#b45309', '#d97706', '#ea580c', '#f59e0b', '#fbbf24'
      ],
      borderWidth: 1,
    }]
  };

  return (
    <div className="space-y-6">
      <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-primary">Budget Remaining</h2>
          <p className="text-sm text-slate-600">from ₹40L total allocation</p>
        </div>
        <div className="text-3xl font-bold text-primary">
          {formatINR(budgetRemaining)}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle>Budget Line Items</CardTitle>
            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-2"><Plus className="w-4 h-4" /> Add Line Item</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Budget Line Item</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="channel"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Channel / Purpose</FormLabel>
                          <FormControl><Input {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="planned"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Planned Amount (₹)</FormLabel>
                          <FormControl><Input type="number" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="actual"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Actual Spend (₹)</FormLabel>
                          <FormControl><Input type="number" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <DialogFooter>
                      <Button type="submit">Save</Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">#</TableHead>
                  <TableHead>Channel</TableHead>
                  <TableHead className="text-right">Planned</TableHead>
                  <TableHead className="text-right">Actual Spend</TableHead>
                  <TableHead className="text-right">Variance</TableHead>
                  <TableHead className="text-right">% Used</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {budget.map((item, i) => {
                  const variance = item.planned - item.actual;
                  const percentUsed = item.planned > 0 ? (item.actual / item.planned) * 100 : 0;
                  return (
                    <TableRow key={item.id}>
                      <TableCell className="text-slate-500">{i + 1}</TableCell>
                      <TableCell 
                        className="font-medium outline-none focus:bg-slate-50 focus:ring-2 ring-primary/20 rounded px-2"
                        contentEditable
                        suppressContentEditableWarning
                        onBlur={(e) => handleInlineEdit(item.id, e.currentTarget.textContent || "")}
                      >
                        {item.channel}
                      </TableCell>
                      <TableCell className="text-right">{formatINR(item.planned)}</TableCell>
                      <TableCell className="text-right font-medium">{formatINR(item.actual)}</TableCell>
                      <TableCell className={`text-right ${variance < 0 ? 'text-destructive' : 'text-emerald-600'}`}>
                        {variance > 0 ? '+' : ''}{formatINR(variance)}
                      </TableCell>
                      <TableCell className="text-right">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${percentUsed > 100 ? 'bg-destructive/10 text-destructive' : 'bg-slate-100 text-slate-700'}`}>
                          {percentUsed.toFixed(1)}%
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500" onClick={() => handleEditClick(item)}>
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Line Item</AlertDialogTitle>
                                <AlertDialogDescription>Are you sure you want to delete "{item.channel}"? This cannot be undone.</AlertDialogDescription>
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
                <TableRow className="bg-slate-50 font-bold hover:bg-slate-50">
                  <TableCell colSpan={2}>Totals</TableCell>
                  <TableCell className="text-right">{formatINR(currentPlanned)}</TableCell>
                  <TableCell className="text-right text-primary">{formatINR(totalActual)}</TableCell>
                  <TableCell className="text-right">{formatINR(totalVariance)}</TableCell>
                  <TableCell className="text-right">{currentPlanned > 0 ? ((totalActual/currentPlanned)*100).toFixed(1) : 0}%</TableCell>
                  <TableCell></TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Allocation</CardTitle>
            </CardHeader>
            <CardContent className="h-[300px] flex items-center justify-center">
              <Pie data={pieData} options={{ maintainAspectRatio: false }} />
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={!!editingItem} onOpenChange={(open) => !open && setEditingItem(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Budget Line Item</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="channel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Channel / Purpose</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="planned"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Planned Amount (₹)</FormLabel>
                    <FormControl><Input type="number" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="actual"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Actual Spend (₹)</FormLabel>
                    <FormControl><Input type="number" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="submit">Save Changes</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
