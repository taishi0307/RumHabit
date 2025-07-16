import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import SettingsPage from "@/pages/settings";
import GoalDetailPage from "@/pages/goal-detail";
import AddGoalPage from "@/pages/add-goal";
import LoginPage from "@/pages/login";
import { useAuth } from "@/hooks/useAuth";
// import { ToastProvider, SimpleToastContainer } from "@/hooks/useSimpleToast";
import { useEffect } from "react";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

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
      <Router />
    </QueryClientProvider>
  );
}

export default App;
