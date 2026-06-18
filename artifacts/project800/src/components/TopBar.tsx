import { resetData } from "@/hooks/useAppData";
import { useAppData } from "@/hooks/useAppData";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { RotateCcw, FileDown, ChevronDown } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  exportFullPlan,
  exportMonthlyPlan,
  exportBudget,
  exportCampaigns,
  exportEvents,
} from "@/utils/exportPdf";
import { useToast } from "@/hooks/use-toast";

export function TopBar() {
  const { months, budget, campaigns, events, hoardings } = useAppData();
  const { toast } = useToast();

  function handleExport(type: string) {
    try {
      switch (type) {
        case "full":
          exportFullPlan(months, budget, campaigns, events, hoardings);
          toast({ title: "PDF exported", description: "Full marketing plan downloaded." });
          break;
        case "monthly":
          exportMonthlyPlan(months);
          toast({ title: "PDF exported", description: "Monthly plan tracker downloaded." });
          break;
        case "budget":
          exportBudget(budget);
          toast({ title: "PDF exported", description: "Budget report downloaded." });
          break;
        case "campaigns":
          exportCampaigns(campaigns);
          toast({ title: "PDF exported", description: "Campaigns report downloaded." });
          break;
        case "events":
          exportEvents(events);
          toast({ title: "PDF exported", description: "Events calendar downloaded." });
          break;
      }
    } catch {
      toast({ title: "Export failed", description: "Something went wrong. Please try again.", variant: "destructive" });
    }
  }

  return (
    <header className="h-[60px] bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0 shadow-sm z-10">
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-semibold text-slate-800 tracking-tight">Project 800</h1>
        <div className="h-4 w-[1px] bg-slate-300" />
        <span className="text-sm font-medium text-slate-500">
          {format(new Date(), "MMM d, yyyy")}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="text-teal-700 border-teal-200 hover:bg-teal-50"
              data-testid="button-export-pdf"
            >
              <FileDown className="w-4 h-4 mr-2" />
              Export PDF
              <ChevronDown className="w-3 h-3 ml-1 opacity-60" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuLabel className="text-xs text-slate-500 font-medium">Choose Report</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="cursor-pointer"
              data-testid="export-full-plan"
              onClick={() => handleExport("full")}
            >
              <FileDown className="w-4 h-4 mr-2 text-teal-600" />
              <div>
                <div className="font-medium text-sm">Full Marketing Plan</div>
                <div className="text-xs text-slate-400">All sections — 6 pages</div>
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem
              className="cursor-pointer"
              data-testid="export-monthly"
              onClick={() => handleExport("monthly")}
            >
              <FileDown className="w-4 h-4 mr-2 text-teal-600" />
              <div>
                <div className="font-medium text-sm">Monthly Progress</div>
                <div className="text-xs text-slate-400">Plan vs actuals by month</div>
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem
              className="cursor-pointer"
              data-testid="export-budget"
              onClick={() => handleExport("budget")}
            >
              <FileDown className="w-4 h-4 mr-2 text-teal-600" />
              <div>
                <div className="font-medium text-sm">Budget Report</div>
                <div className="text-xs text-slate-400">Channel-wise spend breakdown</div>
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem
              className="cursor-pointer"
              data-testid="export-campaigns"
              onClick={() => handleExport("campaigns")}
            >
              <FileDown className="w-4 h-4 mr-2 text-teal-600" />
              <div>
                <div className="font-medium text-sm">Campaigns</div>
                <div className="text-xs text-slate-400">All campaigns &amp; status</div>
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem
              className="cursor-pointer"
              data-testid="export-events"
              onClick={() => handleExport("events")}
            >
              <FileDown className="w-4 h-4 mr-2 text-teal-600" />
              <div>
                <div className="font-medium text-sm">Events Calendar</div>
                <div className="text-xs text-slate-400">All 22 events with details</div>
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="text-slate-600"
              data-testid="button-reset"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset to Defaults
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This will erase all your actuals, custom plans, campaigns, and events, and restore the original template data. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={resetData}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Yes, Reset Data
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </header>
  );
}
