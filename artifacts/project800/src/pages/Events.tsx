import { useState } from "react";
import { useAppData } from "@/hooks/useAppData";
import { EventItem } from "@/data/defaults";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Plus, Edit2, Trash2, Search, MapPin, Users } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

const STATUS_COLORS: Record<string, string> = {
  Planned: "bg-blue-100 text-blue-800 border-blue-200",
  Confirmed: "bg-purple-100 text-purple-800 border-purple-200",
  Completed: "bg-emerald-100 text-emerald-800 border-emerald-200",
  Cancelled: "bg-red-100 text-red-800 border-red-200",
};

const NEXT_STATUS: Record<EventItem['status'], EventItem['status']> = {
  Planned: 'Confirmed',
  Confirmed: 'Completed',
  Completed: 'Cancelled',
  Cancelled: 'Planned'
};

const EVENT_TYPES = ['Open House', 'Orientation', 'Workshop', 'Cultural', 'Seminar', 'Experience', 'Talk', 'Celebration', 'Counseling'];

const eventSchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.string().min(1, "Type is required"),
  month: z.string().min(1, "Month is required"),
  date: z.string().min(1, "Date is required"),
  expected: z.coerce.number().min(0, "Expected must be non-negative"),
  actual: z.coerce.number().min(0, "Actual must be non-negative"),
  venue: z.string().min(1, "Venue is required"),
  status: z.enum(['Planned', 'Confirmed', 'Completed', 'Cancelled']),
});

export default function Events() {
  const { events, setEvents, months } = useAppData();
  const [search, setSearch] = useState("");
  const [monthFilter, setMonthFilter] = useState<string>("All");
  const [typeFilter, setTypeFilter] = useState<string>("All");
  
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<EventItem | null>(null);

  const form = useForm<z.infer<typeof eventSchema>>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      name: "", type: "", month: "", date: "", expected: 0, actual: 0, venue: "Tatva Global School Campus", status: "Planned"
    },
  });

  const filteredEvents = events.filter(e => {
    const matchesSearch = e.name.toLowerCase().includes(search.toLowerCase());
    const matchesMonth = monthFilter === "All" || e.month === monthFilter;
    const matchesType = typeFilter === "All" || e.type === typeFilter;
    return matchesSearch && matchesMonth && matchesType;
  });

  const onSubmit = (values: z.infer<typeof eventSchema>) => {
    if (editingItem) {
      setEvents(events.map(e => e.id === editingItem.id ? { ...editingItem, ...values } : e));
      toast.success("Event updated");
      setEditingItem(null);
    } else {
      setEvents([...events, { id: `e${Date.now()}`, ...values }]);
      toast.success("Event added");
      setIsAddOpen(false);
    }
    form.reset();
  };

  const handleDelete = (id: string) => {
    setEvents(events.filter(e => e.id !== id));
    toast.success("Event deleted");
  };

  const handleEditClick = (e: EventItem) => {
    setEditingItem(e);
    form.reset(e);
  };

  const handleStatusCycle = (id: string, currentStatus: EventItem['status']) => {
    const next = NEXT_STATUS[currentStatus];
    setEvents(events.map(e => e.id === id ? { ...e, status: next } : e));
  };

  const monthOptions = Array.from(new Set(months.map(m => m.month)));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Events Tracker</h2>
          <p className="text-sm text-slate-500">Manage open houses, seminars, and campus experiences.</p>
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="w-4 h-4" /> Add Event</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Event</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField control={form.control} name="name" render={({ field }) => (
                    <FormItem><FormLabel>Event Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="type" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Event Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger></FormControl>
                        <SelectContent>
                          {EVENT_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FormField control={form.control} name="month" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Planning Month</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select month" /></SelectTrigger></FormControl>
                        <SelectContent>
                          {monthOptions.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="date" render={({ field }) => (
                    <FormItem><FormLabel>Specific Date</FormLabel><FormControl><Input {...field} placeholder="e.g., Jul 5 2026" /></FormControl><FormMessage /></FormItem>
                  )} />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <FormField control={form.control} name="expected" render={({ field }) => (
                    <FormItem><FormLabel>Expected Pax</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="actual" render={({ field }) => (
                    <FormItem><FormLabel>Actual Pax</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
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
                <FormField control={form.control} name="venue" render={({ field }) => (
                  <FormItem><FormLabel>Venue</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <DialogFooter><Button type="submit">Save</Button></DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader className="pb-3 border-b">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
              <Input placeholder="Search events..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[140px]"><SelectValue placeholder="Event Type" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Types</SelectItem>
                  {EVENT_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={monthFilter} onValueChange={setMonthFilter}>
                <SelectTrigger className="w-[140px]"><SelectValue placeholder="Month" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Months</SelectItem>
                  {monthOptions.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead>Event Info</TableHead>
                <TableHead>Date / Month</TableHead>
                <TableHead className="text-center">Expected</TableHead>
                <TableHead className="text-center">Actual</TableHead>
                <TableHead className="w-[120px]">Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEvents.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center text-slate-500 py-8">No events found.</TableCell></TableRow>
              ) : (
                filteredEvents.map((e) => (
                  <TableRow key={e.id}>
                    <TableCell>
                      <div className="font-bold text-slate-800">{e.name}</div>
                      <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                        <span className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 font-medium">{e.type}</span>
                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {e.venue}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-slate-700">{e.date}</div>
                      <div className="text-xs text-slate-500">{e.month}</div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="inline-flex items-center justify-center bg-slate-100 text-slate-600 font-medium rounded-full px-3 py-1">
                        <Users className="w-3 h-3 mr-1.5" /> {e.expected}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className={`inline-flex items-center justify-center font-bold rounded-full px-3 py-1 ${e.actual > 0 ? 'bg-primary/10 text-primary' : 'bg-slate-50 text-slate-400'}`}>
                        {e.actual || '-'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <button 
                        onClick={() => handleStatusCycle(e.id, e.status)}
                        className={`text-xs px-2.5 py-1.5 rounded-full font-medium border cursor-pointer hover:opacity-80 transition-opacity w-full text-center shadow-sm ${STATUS_COLORS[e.status]}`}
                      >
                        {e.status}
                      </button>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500" onClick={() => handleEditClick(e)}>
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
                              <AlertDialogTitle>Delete Event</AlertDialogTitle>
                              <AlertDialogDescription>Are you sure you want to delete "{e.name}"?</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(e.id)} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
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
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Event</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {/* Similar form layout as Add... */}
              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="name" render={({ field }) => (
                  <FormItem><FormLabel>Event Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="type" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Event Type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger></FormControl>
                      <SelectContent>
                        {EVENT_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="month" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Planning Month</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Select month" /></SelectTrigger></FormControl>
                      <SelectContent>
                        {monthOptions.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="date" render={({ field }) => (
                  <FormItem><FormLabel>Specific Date</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <FormField control={form.control} name="expected" render={({ field }) => (
                  <FormItem><FormLabel>Expected Pax</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="actual" render={({ field }) => (
                  <FormItem><FormLabel>Actual Pax</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
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
              <FormField control={form.control} name="venue" render={({ field }) => (
                <FormItem><FormLabel>Venue</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <DialogFooter><Button type="submit">Save Changes</Button></DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
