import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Target, Settings, Plus, Activity, Moon, Droplet, Trash2 } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Goal, HabitData } from "@shared/schema";

interface Statistics {
  streak: number;
  totalWorkoutDays: number;
  averageAchievementRate: number;
}

export default function Home() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: goals = [] } = useQuery<Goal[]>({
    queryKey: ["/api/goals"],
  });

  const { data: habitData = [] } = useQuery<HabitData[]>({
    queryKey: ["/api/habit-data"],
  });

  const { data: statistics } = useQuery<Statistics>({
    queryKey: ["/api/statistics"],
  });

  const deleteGoalMutation = useMutation({
    mutationFn: async (goalId: number) => {
      const response = await apiRequest("DELETE", `/api/goals/${goalId}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/goals"] });
      queryClient.invalidateQueries({ queryKey: ["/api/habit-data"] });
      toast({
        title: "目標を削除しました",
        description: "目標とその関連データが正常に削除されました。"
      });
    },
    onError: (error) => {
      console.error("Goal deletion error:", error);
      toast({
        title: "エラーが発生しました",
        description: "目標の削除に失敗しました。もう一度お試しください。",
        variant: "destructive"
      });
    }
  });

  // Group goals by category
  const goalsByCategory = goals.reduce((acc, goal) => {
    if (!acc[goal.category]) {
      acc[goal.category] = [];
    }
    acc[goal.category].push(goal);
    return acc;
  }, {} as Record<string, Goal[]>);

  // Calculate achievement rate for each goal
  const getGoalAchievementRate = (goalId: number) => {
    const goalHabitData = habitData.filter(data => data.goalId === goalId);
    if (goalHabitData.length === 0) return 0;
    const achievedCount = goalHabitData.filter(data => data.achieved).length;
    return Math.round((achievedCount / goalHabitData.length) * 100);
  };

  // Get recent achievement for a goal
  const getRecentAchievement = (goalId: number) => {
    const goalHabitData = habitData.filter(data => data.goalId === goalId);
    const sortedData = goalHabitData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return sortedData[0];
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'workout':
        return <Activity className="h-5 w-5" />;
      case 'sleep':
        return <Moon className="h-5 w-5" />;
      case 'hydration':
        return <Droplet className="h-5 w-5" />;
      default:
        return <Target className="h-5 w-5" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'workout':
        return 'bg-blue-500';
      case 'sleep':
        return 'bg-purple-500';
      case 'hydration':
        return 'bg-cyan-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getCategoryName = (category: string) => {
    switch (category) {
      case 'workout':
        return 'ワークアウト';
      case 'sleep':
        return '睡眠';
      case 'hydration':
        return '水分補給';
      default:
        return category;
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-gray-50 min-h-screen" style={{ backgroundColor: 'hsl(0, 0%, 97.6%)' }}>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">習慣トラッカー</h1>
          <p className="text-sm text-gray-600 mt-1">
            目標達成をサポートします
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/add-goal">
            <Button variant="outline" size="sm">
              <Plus className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/settings">
            <Button variant="outline" size="sm" className="text-gray-500 border-gray-300 hover:bg-gray-50">
              <Settings className="h-3 w-3 mr-1" />
              設定
            </Button>
          </Link>
        </div>
      </div>



      {/* Goals */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {goals.map((goal) => {
                  const achievementRate = getGoalAchievementRate(goal.id);
                  const recentAchievement = getRecentAchievement(goal.id);
                  
                  // Get calendar data for 5 weeks (past 4 weeks + current week)
                  const today = new Date();
                  today.setHours(23, 59, 59, 999); // Set to end of today
                  
                  // Find the start of current week (Sunday)
                  const currentWeekStart = new Date(today);
                  currentWeekStart.setDate(today.getDate() - today.getDay());
                  currentWeekStart.setHours(0, 0, 0, 0);
                  
                  // Go back 4 weeks from current week start
                  const startOfWeek = new Date(currentWeekStart);
                  startOfWeek.setDate(currentWeekStart.getDate() - 28); // 4 weeks back
                  
                  // Display range: from 4 weeks ago to current week end
                  const startDate = new Date(startOfWeek);
                  const endDate = new Date(today);
                  
                  const miniCalendarData = [];
                  
                  // Generate 35 days (7x5 grid)
                  for (let i = 0; i < 35; i++) {
                    const date = new Date(startOfWeek);
                    date.setDate(startOfWeek.getDate() + i);
                    date.setHours(12, 0, 0, 0); // Set to noon for comparison
                    
                    // Format date to match data format (YYYY-MM-DD)
                    const year = date.getFullYear();
                    const month = String(date.getMonth() + 1).padStart(2, '0');
                    const day = String(date.getDate()).padStart(2, '0');
                    const dateStr = `${year}-${month}-${day}`;
                    
                    const record = habitData.find(data => data.goalId === goal.id && data.date === dateStr);
                    const isInRange = date >= startDate && date <= endDate;
                    
                    miniCalendarData.push({
                      date: dateStr,
                      day: date.getDate(),
                      achieved: record?.achieved || false,
                      hasRecord: !!record,
                      isInRange: isInRange,
                    });
                  }
                  
                  return (
                    <Card key={goal.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <Link href={`/goal/${goal.id}`} className="flex items-center gap-2 flex-1 cursor-pointer">
                            <h3 className="font-semibold text-gray-800">{goal.name}</h3>
                            <span className="text-sm text-gray-600">
                              {goal.targetValue} {goal.unit}
                            </span>
                          </Link>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0 text-gray-400 hover:text-red-500"
                                onClick={(e) => e.preventDefault()}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>目標を削除しますか？</AlertDialogTitle>
                                <AlertDialogDescription>
                                  この操作は元に戻せません。目標「{goal.name}」とその関連データがすべて削除されます。
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>キャンセル</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => deleteGoalMutation.mutate(goal.id)}
                                  disabled={deleteGoalMutation.isPending}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  {deleteGoalMutation.isPending ? "削除中..." : "削除"}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>

                        {/* Mini Calendar Grid */}
                        <div className="mb-3">
                          <div className="grid grid-cols-7 gap-px bg-gray-200 p-1 rounded">
                            {miniCalendarData.map((day, index) => {
                              let bgColor = 'bg-gray-100';
                              let textColor = 'text-white';
                              
                              if (day.hasRecord && day.achieved) {
                                bgColor = 'bg-green-500';
                                textColor = 'text-white';
                              }
                              
                              // Period outside range gets gray text
                              if (!day.isInRange) {
                                textColor = 'text-gray-400';
                              }
                              
                              return (
                                <div
                                  key={index}
                                  className={`${bgColor} ${textColor} aspect-square flex items-center justify-center text-xs font-medium`}
                                  title={`${day.date}: ${day.hasRecord ? (day.achieved ? '達成' : '記録なし') : '記録なし'}`}
                                >
                                  {day.day}
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {recentAchievement && (
                          <div className="text-xs text-gray-500">
                            最新: {
                              goal.type === 'sleep-time' || (goal.type === 'sleep' && goal.unit === '時間')
                                ? Number(recentAchievement.actualValue).toFixed(1)
                                : goal.type === 'sleep-score'
                                ? Math.round(Number(recentAchievement.actualValue))
                                : recentAchievement.actualValue
                            } {goal.unit} ({recentAchievement.date})
                            <Badge 
                              variant={recentAchievement.achieved ? "default" : "secondary"}
                              className="ml-2"
                            >
                              {recentAchievement.achieved ? "達成" : "未達成"}
                            </Badge>
                          </div>
                        )}
                        </CardContent>
                      </Card>
                  );
                })}
      </div>

      {/* Empty State */}
      {goals.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Target className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-800 mb-2">目標が設定されていません</h3>
            <p className="text-gray-600 mb-4">新しい目標を作成して習慣トラッキングを始めましょう。</p>
            <Link href="/add-goal">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                目標を追加
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}