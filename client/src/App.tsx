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
import LoginPage from "@/pages/login";
import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";

function ProtectedRoute({ component: Component, ...props }: any) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50" style={{ backgroundColor: 'hsl(0, 0%, 97.6%)' }}>
        <div className="text-gray-500">読み込み中...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return <Component {...props} />;
}

function Router() {
  return (
    <Switch>
      <Route path="/login" component={LoginPage} />
      <Route path="/" component={(props) => <ProtectedRoute component={Home} {...props} />} />
      <Route path="/settings" component={(props) => <ProtectedRoute component={SettingsPage} {...props} />} />
      <Route path="/add-goal" component={(props) => <ProtectedRoute component={AddGoalPage} {...props} />} />
      <Route path="/add-goal/workout" component={(props) => <ProtectedRoute component={() => <AddGoalPage goalType="workout" />} {...props} />} />
      <Route path="/add-goal/sleep" component={(props) => <ProtectedRoute component={() => <AddGoalPage goalType="sleep" />} {...props} />} />
      <Route path="/goal/:goalId/record/:recordId" component={(props) => <ProtectedRoute component={RecordDetailPage} {...props} />} />
      <Route path="/goal/:id" component={(props) => <ProtectedRoute component={GoalDetailPage} {...props} />} />
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