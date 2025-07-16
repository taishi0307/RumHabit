import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import SettingsPage from "@/pages/settings";
import GoalDetailPage from "@/pages/goal-detail";
import AddGoalPage from "@/pages/add-goal";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/settings" component={SettingsPage} />
      <Route path="/add-goal" component={AddGoalPage} />
      <Route path="/add-goal/workout" component={() => <AddGoalPage goalType="workout" />} />
      <Route path="/add-goal/sleep" component={() => <AddGoalPage goalType="sleep" />} />
      <Route path="/goal/:id" component={GoalDetailPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
