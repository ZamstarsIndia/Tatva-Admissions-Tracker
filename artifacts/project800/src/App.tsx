import { useEffect } from "react";
import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { Layout } from "@/components/Layout";
import { initializeData } from "@/hooks/useAppData";

import Dashboard from "@/pages/Dashboard";
import ProgressTracker from "@/pages/ProgressTracker";
import BudgetManager from "@/pages/BudgetManager";
import MonthlyPlan from "@/pages/MonthlyPlan";
import Campaigns from "@/pages/Campaigns";
import Events from "@/pages/Events";
import Hoardings from "@/pages/Hoardings";
import Notes from "@/pages/Notes";

const queryClient = new QueryClient();

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/tracker" component={ProgressTracker} />
        <Route path="/budget" component={BudgetManager} />
        <Route path="/monthly" component={MonthlyPlan} />
        <Route path="/campaigns" component={Campaigns} />
        <Route path="/events" component={Events} />
        <Route path="/hoardings" component={Hoardings} />
        <Route path="/notes" component={Notes} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  useEffect(() => {
    initializeData();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
