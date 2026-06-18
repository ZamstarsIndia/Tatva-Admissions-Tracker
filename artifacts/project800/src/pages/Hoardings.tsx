import { useState } from "react";
import { useAppData } from "@/hooks/useAppData";
import { Hoarding } from "@/data/defaults";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Plus, Edit2, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

const STATUS_COLORS: Record<string, string> = {
  Designing: "bg-blue-100 text-blue-800 border-blue-200",
  Printing: "bg-purple-100 text-purple-800 border-purple-200",
  Active: "bg-emerald-100 text-emerald-800 border-emerald-200",
  Completed: "bg-slate-100 text-slate-800 border-slate-200",
};

const NEXT_STATUS: Record<Hoarding['status'], Hoarding['status']> = {
  Designing: 'Printing',
  Printing: 'Active',
  Active: 'Completed',
  Completed: 'Designing'
};

const hoardingSchema = z.object({
  creativeRound: z.string().min(1, "Round name is required"),
  period: z.string().min(1, "Period is required"),
  sites: z.coerce.number().min(1, "Sites must be at least 1"),
  durationDays: z.coerce.number().min(1, "Duration must be positive"),
  status: z.enum(['Designing', 'Printing', 'Active', 'Completed']),
});

export default function Hoardings() {
  const { hoardings, setHoardings } = useAppData();
  
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Hoarding | null>(null);

  const form = useForm<z.infer<typeof hoardingSchema>>({
    resolver: zodResolver(hoardingSchema),
    defaultValues: {
      creativeRound: "", period: "", sites: 15, durationDays: 30, status: "Designing"
    },
  });

  const onSubmit = (values: z.infer<typeof hoardingSchema>) => {
    if (editingItem) {
      setHoardings(hoardings.map(h => h.id === editingItem.id ? { ...editingItem, ...values } : h));
      toast.success("Hoarding round updated");
      setEditingItem(null);
    } else {
      setHoardings([...hoardings, { id: `h${Date.now()}`, ...values }]);
      toast.success("Hoarding round added");
      setIsAddOpen(false);
    }
    form.reset();
  };

  const handleDelete = (id: string) => {
    setHoardings(hoardings.filter(h => h.id !== id));
    toast.success("Hoarding round deleted");
  };

  const handleEditClick = (h: Hoarding) => {
    setEditingItem(h);
    form.reset(h);
  };

  const handleStatusCycle = (id: string, currentStatus: Hoarding['status']) => {
    const next = NEXT_STATUS[currentStatus];
    setHoardings(hoardings.map(h => h.id === id ? { ...h, status: next } : h));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Hoardings Tracker</h2>
          <p className="text-sm text-slate-500">Manage outdoor OOH campaigns and creative cycles.</p>
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="w-4 h-4" /> Add Round</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Hoarding Round</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField control={form.control} name="creativeRound" render={({ field }) => (
                  <FormItem><FormLabel>Creative Round</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <div className="grid grid-cols-2 gap-4">
                  <FormField control={form.control} name="period" render={({ field }) => (
                    <FormItem><FormLabel>Period (Month/Season)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="status" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger></FormControl>
                        <SelectContent>
                          {Object.keys(STATUS_COLORS).map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FormField control={form.control} name="sites" render={({ field }) => (
                    <FormItem><FormLabel>Number of Sites</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="durationDays" render={({ field }) => (
                    <FormItem><FormLabel>Duration (Days)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                </div>
                <DialogFooter><Button type="submit">Save</Button></DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead>Creative Round</TableHead>
                <TableHead>Period</TableHead>
                <TableHead className="text-center">Sites</TableHead>
                <TableHead className="text-center">Duration</TableHead>
                <TableHead className="w-[140px]">Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {hoardings.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center text-slate-500 py-8">No hoarding rounds found.</TableCell></TableRow>
              ) : (
                hoardings.map((h) => (
                  <TableRow key={h.id}>
                    <TableCell className="font-bold text-slate-800">{h.creativeRound}</TableCell>
                    <TableCell className="text-slate-600 font-medium">{h.period}</TableCell>
                    <TableCell className="text-center text-slate-600">{h.sites}</TableCell>
                    <TableCell className="text-center text-slate-600">{h.durationDays} days</TableCell>
                    <TableCell>
                      <button 
                        onClick={() => handleStatusCycle(h.id, h.status)}
                        className={`text-xs px-2.5 py-1.5 rounded font-bold border cursor-pointer hover:opacity-80 transition-opacity w-full text-center tracking-wide uppercase ${STATUS_COLORS[h.status]}`}
                      >
                        {h.status}
                      </button>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500" onClick={() => handleEditClick(h)}>
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Hoarding Round</AlertDialogTitle>
                              <AlertDialogDescription>Are you sure you want to delete "{h.creativeRound}"?</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(h.id)} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!editingItem} onOpenChange={(open) => !open && setEditingItem(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Hoarding Round</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField control={form.control} name="creativeRound" render={({ field }) => (
                <FormItem><FormLabel>Creative Round</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="period" render={({ field }) => (
                  <FormItem><FormLabel>Period (Month/Season)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="status" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger></FormControl>
                      <SelectContent>
                        {Object.keys(STATUS_COLORS).map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="sites" render={({ field }) => (
                  <FormItem><FormLabel>Number of Sites</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="durationDays" render={({ field }) => (
                  <FormItem><FormLabel>Duration (Days)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
              </div>
              <DialogFooter><Button type="submit">Save Changes</Button></DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
