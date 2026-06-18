import { Link, useLocation } from "wouter";
import { LayoutDashboard, Target, PiggyBank, CalendarDays, Megaphone, CalendarRange, MonitorPlay, StickyNote } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/tracker", label: "Progress Tracker", icon: Target },
  { href: "/budget", label: "Budget Manager", icon: PiggyBank },
  { href: "/monthly", label: "Monthly Plan", icon: CalendarDays },
  { href: "/campaigns", label: "Campaigns", icon: Megaphone },
  { href: "/events", label: "Events", icon: CalendarRange },
  { href: "/hoardings", label: "Hoardings", icon: MonitorPlay },
  { href: "/notes", label: "Notes & Comments", icon: StickyNote },
];

export function Sidebar() {
  const [location] = useLocation();

  return (
    <div className="w-[190px] bg-sidebar text-sidebar-foreground flex flex-col h-full border-r border-sidebar-border shrink-0">
      <div className="h-[60px] bg-sidebar-primary flex items-center justify-center font-bold text-lg text-white tracking-wider shrink-0">
        TATVA GLOBAL
      </div>
      <div className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const isActive = location === item.href;
          return (
            <Link key={item.href} href={item.href}>
              <div
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-slate-400 hover:text-slate-100 hover:bg-sidebar-accent/50"
                )}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                <span>{item.label}</span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
