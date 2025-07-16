import { useQuery } from "@tanstack/react-query";
import { Target, Settings, Plus, Activity, Moon, Droplet } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import type { Goal, HabitData } from "@shared/schema";

interface Statistics {
  streak: number;
  totalWorkoutDays: number;
  averageAchievementRate: number;
}

export default function Home() {
  const { data: goals = [] } = useQuery<Goal[]>({
    queryKey: ["/api/goals"],
  });

  const { data: habitData = [] } = useQuery<HabitData[]>({
    queryKey: ["/api/habit-data"],
  });

  const { data: statistics } = useQuery<Statistics>({
    queryKey: ["/api/statistics"],
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
    <div className="max-w-6xl mx-auto p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <Target className="text-blue-600" />
            目標管理
          </h1>
          <Link href="/settings">
            <Button>
              <Settings className="h-4 w-4 mr-2" />
              設定
            </Button>
          </Link>
        </div>
      </div>

      {/* Statistics Overview */}
      {statistics && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>統計情報</CardTitle>
            <CardDescription>全体的な達成状況</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-around items-center">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">{statistics.streak}</div>
                <div className="text-sm text-gray-600">連続達成日数</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">{statistics.totalWorkoutDays}</div>
                <div className="text-sm text-gray-600">総活動日数</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">{statistics.averageAchievementRate}%</div>
                <div className="text-sm text-gray-600">平均達成率</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Goals by Category */}
      <div className="space-y-6">
        {Object.entries(goalsByCategory).map(([category, categoryGoals]) => (
          <Card key={category}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className={`p-2 rounded-lg ${getCategoryColor(category)} text-white`}>
                  {getCategoryIcon(category)}
                </div>
                {getCategoryName(category)}
              </CardTitle>
              <CardDescription>
                {categoryGoals.length}個の目標
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categoryGoals.map((goal) => {
                  const achievementRate = getGoalAchievementRate(goal.id);
                  const recentAchievement = getRecentAchievement(goal.id);
                  
                  // Get calendar data for July 2025 (sample data month)
                  const currentMonth = 6; // July (0-indexed)
                  const currentYear = 2025;
                  const firstDay = new Date(currentYear, currentMonth, 1);
                  const startOfWeek = new Date(firstDay);
                  startOfWeek.setDate(firstDay.getDate() - firstDay.getDay());
                  
                  const miniCalendarData = [];
                  
                  // Generate 35 days (7x5 grid)
                  for (let i = 0; i < 35; i++) {
                    const date = new Date(startOfWeek);
                    date.setDate(startOfWeek.getDate() + i);
                    
                    // Format date to match data format (YYYY-MM-DD)
                    const year = date.getFullYear();
                    const month = String(date.getMonth() + 1).padStart(2, '0');
                    const day = String(date.getDate()).padStart(2, '0');
                    const dateStr = `${year}-${month}-${day}`;
                    
                    const record = habitData.find(data => data.goalId === goal.id && data.date === dateStr);
                    const isCurrentMonth = date.getMonth() === currentMonth;
                    
                    miniCalendarData.push({
                      date: dateStr,
                      day: date.getDate(),
                      achieved: record?.achieved || false,
                      hasRecord: !!record,
                      isCurrentMonth: isCurrentMonth,
                    });
                  }
                  
                  return (
                    <Link key={goal.id} href={`/goals/${goal.id}`}>
                      <div className="p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-gray-800">{goal.name}</h3>
                            <span className="text-sm text-gray-600">
                              {goal.targetValue} {goal.unit}
                            </span>
                          </div>
                          <Badge variant={goal.isActive ? "default" : "secondary"}>
                            {goal.isActive ? "アクティブ" : "非アクティブ"}
                          </Badge>
                        </div>

                        <div className="mb-3">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm text-gray-600">達成率</span>
                            <span className="text-sm font-medium">{achievementRate}%</span>
                          </div>
                          <Progress value={achievementRate} className="h-2" />
                        </div>

                        {/* Mini Calendar Grid */}
                        <div className="mb-3">
                          <div className="text-center text-xs text-gray-600 mb-2">
                            {goal.name} - {goal.targetValue} {goal.unit}
                          </div>
                          <div className="grid grid-cols-7 gap-px bg-gray-200 p-1 rounded">
                            {miniCalendarData.map((day, index) => {
                              let bgColor = 'bg-gray-100';
                              let textColor = 'text-gray-400';
                              
                              if (day.isCurrentMonth) {
                                bgColor = 'bg-gray-100';
                                textColor = 'text-gray-600';
                                
                                if (day.hasRecord && day.achieved) {
                                  bgColor = 'bg-green-500';
                                  textColor = 'text-white';
                                }
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
                            最新: {recentAchievement.actualValue} {goal.unit} ({recentAchievement.date})
                            <Badge 
                              variant={recentAchievement.achieved ? "default" : "secondary"}
                              className="ml-2"
                            >
                              {recentAchievement.achieved ? "達成" : "未達成"}
                            </Badge>
                          </div>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {goals.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Target className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-800 mb-2">目標が設定されていません</h3>
            <p className="text-gray-600 mb-4">新しい目標を作成して習慣トラッキングを始めましょう。</p>
            <Link href="/settings">
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