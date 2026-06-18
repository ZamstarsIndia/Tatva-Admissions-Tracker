import { useState } from "react";
import { useAppData } from "@/hooks/useAppData";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Trash2, MessageSquarePlus } from "lucide-react";
import { format } from "date-fns";

const SECTION_TAGS = ['General', 'Dashboard', 'Campaigns', 'Events', 'Budget'];

export default function Notes() {
  const { notes, setNotes } = useAppData();
  const [text, setText] = useState("");
  const [section, setSection] = useState("General");

  const handleAddNote = () => {
    if (!text.trim()) return;
    
    const newNote = {
      id: `n${Date.now()}`,
      timestamp: new Date().toISOString(),
      section,
      text: text.trim(),
    };
    
    setNotes([newNote, ...notes]);
    setText("");
    toast.success("Note added");
  };

  const handleDelete = (id: string) => {
    setNotes(notes.filter(n => n.id !== id));
    toast.success("Note deleted");
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Notes & Comments</h2>
        <p className="text-sm text-slate-500">Log strategic thoughts, meeting notes, or temporary reminders.</p>
      </div>

      <Card className="bg-white shadow-sm border-slate-200">
        <CardContent className="p-4 sm:p-6 space-y-4">
          <div className="flex gap-4">
            <div className="w-[150px] shrink-0">
              <Select value={section} onValueChange={setSection}>
                <SelectTrigger>
                  <SelectValue placeholder="Tag" />
                </SelectTrigger>
                <SelectContent>
                  {SECTION_TAGS.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <Textarea 
            placeholder="Type your note here..." 
            className="min-h-[100px] resize-y bg-slate-50 focus:bg-white"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <div className="flex justify-end">
            <Button onClick={handleAddNote} disabled={!text.trim()} className="gap-2 bg-primary hover:bg-primary/90">
              <MessageSquarePlus className="w-4 h-4" /> Add Note
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {notes.length === 0 ? (
          <div className="text-center py-12 text-slate-400 bg-slate-50/50 rounded-lg border border-dashed border-slate-200">
            No notes yet. Add one above.
          </div>
        ) : (
          notes.map(note => (
            <Card key={note.id} className="group overflow-hidden">
              <CardContent className="p-0 flex flex-col sm:flex-row">
                <div className="bg-slate-50 p-4 sm:w-[150px] sm:border-r border-slate-100 flex sm:flex-col justify-between sm:justify-start items-center sm:items-start shrink-0">
                  <span className="text-xs font-bold text-primary uppercase tracking-wider">{note.section}</span>
                  <span className="text-[11px] text-slate-400 sm:mt-2">
                    {format(new Date(note.timestamp), "MMM d, yyyy")}
                    <br className="hidden sm:block" />
                    <span className="hidden sm:inline"> at </span>
                    {format(new Date(note.timestamp), "h:mm a")}
                  </span>
                </div>
                <div className="p-4 flex-1 flex justify-between gap-4">
                  <p className="text-sm text-slate-700 whitespace-pre-wrap">{note.text}</p>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="shrink-0 h-8 w-8 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity hover:text-destructive hover:bg-destructive/10"
                    onClick={() => handleDelete(note.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
