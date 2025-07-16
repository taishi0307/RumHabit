import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRoute, useLocation } from "wouter";
import { ArrowLeft, Calendar, TrendingUp, Target, Trash2 } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
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

export default function GoalDetailPage() {
  const [, params] = useRoute("/goal/:id");
  const [, setLocation] = useLocation();
  const goalId = params?.id ? parseInt(params.id) : null;
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: goals = [] } = useQuery<Goal[]>({
    queryKey: ["/api/goals"],
  });

  const { data: habitData = [] } = useQuery<HabitData[]>({
    queryKey: ["/api/habit-data"],
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
      setLocation("/");
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

  const goal = goals.find(g => g.id === goalId);
  const goalHabitData = habitData.filter(data => data.goalId === goalId);

  if (!goal) {
    return (
      <div className="max-w-4xl mx-auto p-6 bg-gray-50 min-h-screen" style={{ backgroundColor: 'hsl(0, 0%, 97.6%)' }}>
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
    <div className="max-w-6xl mx-auto p-6 bg-gray-50 min-h-screen" style={{ backgroundColor: 'hsl(0, 0%, 97.6%)' }}>
      {/* Top Navigation */}
      <div className="flex justify-between items-center mb-4">
        <Link href="/">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            戻る
          </Button>
        </Link>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="sm">
              <Trash2 className="h-4 w-4 mr-2" />
              削除
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

      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <h1 className="text-3xl font-bold text-gray-800">{goal.name}</h1>
        <div className="text-gray-600 mt-1">
          {goal.category === 'workout' && goal.type === 'workout' && (
            <div className="flex flex-wrap gap-4">
              {goal.targetDistance && (
                <span>距離: {goal.targetDistance}km</span>
              )}
              {goal.targetTime && (
                <span>時間: {goal.targetTime}分</span>
              )}
              {goal.targetHeartRate && (
                <span>心拍数: {goal.targetHeartRate}bpm</span>
              )}
              {goal.targetCalories && (
                <span>カロリー: {goal.targetCalories}kcal</span>
              )}
            </div>
          )}
          {goal.category === 'sleep' && goal.type === 'sleep' && (
            <div className="flex flex-wrap gap-4">
              {goal.targetSleepTime && (
                <span>睡眠時間: {goal.targetSleepTime}時間</span>
              )}
              {goal.targetSleepScore && (
                <span>睡眠スコア: {goal.targetSleepScore}点</span>
              )}
            </div>
          )}
          {goal.targetValue && (
            <span>目標: {goal.targetValue} {goal.unit}</span>
          )}
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
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
                {/* Generate calendar for 5 weeks (past 4 weeks + current week) */}
                {Array.from({ length: 35 }, (_, i) => {
                  // Find the start of current week (Sunday)
                  const today = new Date();
                  today.setHours(23, 59, 59, 999); // Set to end of today
                  const currentWeekStart = new Date(today);
                  currentWeekStart.setDate(today.getDate() - today.getDay());
                  currentWeekStart.setHours(0, 0, 0, 0);
                  
                  // Go back 4 weeks from current week start
                  const startOfWeek = new Date(currentWeekStart);
                  startOfWeek.setDate(currentWeekStart.getDate() - 28); // 4 weeks back
                  
                  // Calculate the date for this grid cell
                  const date = new Date(startOfWeek);
                  date.setDate(startOfWeek.getDate() + i);
                  date.setHours(12, 0, 0, 0); // Set to noon for comparison
                  
                  // Format date to match data format (YYYY-MM-DD)
                  const year = date.getFullYear();
                  const month = String(date.getMonth() + 1).padStart(2, '0');
                  const day = String(date.getDate()).padStart(2, '0');
                  const dateStr = `${year}-${month}-${day}`;
                  
                  const status = getDayStatus(date);
                  
                  let bgColor = 'bg-gray-100';
                  let textColor = 'text-white';
                  
                  if (status === 'achieved') {
                    bgColor = 'bg-green-500';
                    textColor = 'text-white';
                  }
                  
                  // Display range: from 4 weeks ago to current week end
                  const startDate = new Date(startOfWeek);
                  const endDate = new Date(today);
                  const isInRange = date >= startDate && date <= endDate;
                  
                  // Period outside range gets gray text
                  if (!isInRange) {
                    textColor = 'text-gray-400';
                  }
                  
                  return (
                    <div
                      key={i}
                      className={`aspect-square flex items-center justify-center text-xs rounded ${bgColor} ${textColor}`}
                    >
                      {date.getDate()}
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