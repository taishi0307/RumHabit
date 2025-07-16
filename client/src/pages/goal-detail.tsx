import { useQuery } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { ArrowLeft, Calendar, TrendingUp, Target } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import type { Goal, HabitData } from "@shared/schema";

export default function GoalDetailPage() {
  const [, params] = useRoute("/goals/:id");
  const goalId = params?.id ? parseInt(params.id) : null;

  const { data: goals = [] } = useQuery<Goal[]>({
    queryKey: ["/api/goals"],
  });

  const { data: habitData = [] } = useQuery<HabitData[]>({
    queryKey: ["/api/habit-data"],
  });

  const goal = goals.find(g => g.id === goalId);
  const goalHabitData = habitData.filter(data => data.goalId === goalId);

  if (!goal) {
    return (
      <div className="max-w-4xl mx-auto p-6 bg-gray-50 min-h-screen">
        <Card>
          <CardContent className="text-center py-12">
            <Target className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-800 mb-2">目標が見つかりません</h3>
            <p className="text-gray-600 mb-4">指定された目標は存在しません。</p>
            <Link href="/">
              <Button>
                <ArrowLeft className="h-4 w-4 mr-2" />
                ホームに戻る
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Calculate statistics
  const totalRecords = goalHabitData.length;
  const achievedRecords = goalHabitData.filter(data => data.achieved).length;
  const achievementRate = totalRecords > 0 ? Math.round((achievedRecords / totalRecords) * 100) : 0;

  // Get recent records (last 30 days)
  const recentRecords = goalHabitData
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 30);

  // Calculate average value
  const validValues = goalHabitData.filter(data => data.actualValue !== null).map(data => data.actualValue!);
  const averageValue = validValues.length > 0 ? validValues.reduce((a, b) => a + b, 0) / validValues.length : 0;

  // Calculate streak
  const sortedRecords = goalHabitData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  let currentStreak = 0;
  for (const record of sortedRecords) {
    if (record.achieved) {
      currentStreak++;
    } else {
      break;
    }
  }

  // Create calendar data
  const calendarData = new Map<string, boolean>();
  goalHabitData.forEach(data => {
    calendarData.set(data.date, data.achieved);
  });

  const getDayStatus = (date: Date) => {
    // Format date to match data format (YYYY-MM-DD)
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    
    const achieved = calendarData.get(dateStr);
    if (achieved === true) return 'achieved';
    if (achieved === false) return 'failed';
    return 'none';
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                戻る
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">{goal.name}</h1>
              <p className="text-gray-600 mt-1">
                目標: {goal.targetValue} {goal.unit}
              </p>
            </div>
          </div>
          <Badge variant={goal.isActive ? "default" : "secondary"}>
            {goal.isActive ? "アクティブ" : "非アクティブ"}
          </Badge>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">達成率</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{achievementRate}%</div>
            <Progress value={achievementRate} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">連続達成</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{currentStreak}</div>
            <p className="text-xs text-gray-600 mt-1">日間</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">総記録数</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRecords}</div>
            <p className="text-xs text-gray-600 mt-1">記録</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">平均値</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageValue.toFixed(1)}</div>
            <p className="text-xs text-gray-600 mt-1">{goal.unit}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Calendar View */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              カレンダー表示
            </CardTitle>
            <CardDescription>
              過去の記録を日付別に表示
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span>達成</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                  <span>記録なし</span>
                </div>
              </div>
              
              <div className="grid grid-cols-7 gap-1 text-xs">
                {['日', '月', '火', '水', '木', '金', '土'].map(day => (
                  <div key={day} className="text-center font-medium py-2">
                    {day}
                  </div>
                ))}
              </div>
              
              <div className="grid grid-cols-7 gap-1">
                {/* Generate calendar for July 2025 */}
                {Array.from({ length: 31 }, (_, i) => {
                  const date = new Date(2025, 6, i + 1); // July 2025
                  
                  // Format date to match data format (YYYY-MM-DD)
                  const year = date.getFullYear();
                  const month = String(date.getMonth() + 1).padStart(2, '0');
                  const day = String(date.getDate()).padStart(2, '0');
                  const dateStr = `${year}-${month}-${day}`;
                  
                  const status = getDayStatus(date);
                  
                  let bgColor = 'bg-gray-100';
                  if (status === 'achieved') bgColor = 'bg-green-500';
                  
                  return (
                    <div
                      key={i}
                      className={`aspect-square flex items-center justify-center text-xs rounded ${bgColor} ${
                        status === 'achieved' ? 'text-white' : 'text-white'
                      }`}
                    >
                      {i + 1}
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Records */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              最近の記録
            </CardTitle>
            <CardDescription>
              最新30件の記録
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {recentRecords.length === 0 ? (
                <p className="text-gray-500 text-center py-4">記録がありません</p>
              ) : (
                recentRecords.map((record, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium">{record.date}</div>
                      <div className="text-sm text-gray-600">
                        {record.actualValue} {goal.unit}
                      </div>
                    </div>
                    <Badge variant={record.achieved ? "default" : "secondary"}>
                      {record.achieved ? "達成" : "未達成"}
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}