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
import { useEffect, Component, ErrorInfo, ReactNode } from "react";

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<{ children: ReactNode }, ErrorBoundaryState> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center p-4">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-800 mb-4">エラーが発生しました</h1>
            <p className="text-red-600 mb-4">
              {this.state.error?.message || "不明なエラーが発生しました"}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              再読み込み
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

function Router() {
  try {
    const { isAuthenticated, isLoading } = useAuth();

    console.log("Router render - isAuthenticated:", isAuthenticated, "isLoading:", isLoading);

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
  } catch (error) {
    console.error("Router error:", error);
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-800 mb-4">ルーターエラー</h1>
          <p className="text-red-600 mb-4">
            {error instanceof Error ? error.message : "Unknown error"}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            再読み込み
          </button>
        </div>
      </div>
    );
  }
}

function App() {
  useEffect(() => {
    console.log("App component mounted");
  }, []);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <Router />
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
