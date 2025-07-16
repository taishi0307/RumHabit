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
import RecordDetailPage from "@/pages/record-detail";
import { useEffect } from "react";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/settings" component={SettingsPage} />
      <Route path="/add-goal" component={AddGoalPage} />
      <Route path="/add-goal/workout" component={() => <AddGoalPage goalType="workout" />} />
      <Route path="/add-goal/sleep" component={() => <AddGoalPage goalType="sleep" />} />
      <Route path="/goal/:id" component={GoalDetailPage} />
      <Route path="/goal/:goalId/record/:recordId" component={RecordDetailPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  useEffect(() => {
    // 開発環境でのキャッシュ問題を防ぐため、ページ読み込み時に古いキャッシュを削除
    const isDev = window.location.hostname === 'localhost' || window.location.hostname.includes('127.0.0.1');
    
    if (isDev) {
      // 開発環境では強制的にキャッシュを無効化
      if ('caches' in window) {
        caches.keys().then(function(names) {
          for (let name of names) {
            caches.delete(name);
          }
        });
      }
      
      // Service Workerも削除
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then(function(registrations) {
          for(let registration of registrations) {
            registration.unregister();
          }
        });
      }
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Router />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;