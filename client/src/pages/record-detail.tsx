import { useParams, useRoute } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Calendar, Target, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import type { HabitData, Goal } from "@shared/schema";

export default function RecordDetailPage() {
  const [match, params] = useRoute("/goal/:goalId/record/:recordId");
  
  console.log('RecordDetailPage match:', match);
  console.log('RecordDetailPage params:', params);
  
  if (!match) {
    return (
      <div className="max-w-4xl mx-auto p-6 bg-gray-50 min-h-screen" style={{ backgroundColor: 'hsl(0, 0%, 97.6%)' }}>
        <div className="flex items-center justify-center h-64">
          <div className="text-red-500">ルートが一致しません</div>
        </div>
      </div>
    );
  }

  const { goalId, recordId } = params as { goalId: string; recordId: string };
  
  console.log('RecordDetailPage goalId:', goalId, 'recordId:', recordId);

  const { data: goal, isLoading: goalLoading } = useQuery<Goal>({
    queryKey: [`/api/goals/${goalId}`],
  });

  const { data: habitData, isLoading: habitDataLoading } = useQuery<HabitData[]>({
    queryKey: [`/api/habit-data`, goalId],
  });

  if (goalLoading || habitDataLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6 bg-gray-50 min-h-screen" style={{ backgroundColor: 'hsl(0, 0%, 97.6%)' }}>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">読み込み中...goalId: {goalId}, recordId: {recordId}</div>
        </div>
      </div>
    );
  }

  if (!goal) {
    return (
      <div className="max-w-4xl mx-auto p-6 bg-gray-50 min-h-screen" style={{ backgroundColor: 'hsl(0, 0%, 97.6%)' }}>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">目標が見つかりません (goalId: {goalId})</div>
        </div>
      </div>
    );
  }

  const record = habitData?.find(data => data.id === parseInt(recordId || '0'));

  if (!record) {
    return (
      <div className="max-w-4xl mx-auto p-6 bg-gray-50 min-h-screen" style={{ backgroundColor: 'hsl(0, 0%, 97.6%)' }}>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">記録が見つかりません (recordId: {recordId})</div>
        </div>
      </div>
    );
  }

  // Format the date
  const recordDate = new Date(record.date + 'T00:00:00');
  const formattedDate = recordDate.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  });

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gray-50 min-h-screen" style={{ backgroundColor: 'hsl(0, 0%, 97.6%)' }}>
      {/* Back Button */}
      <div className="mb-4">
        <Link href={`/goal/${goalId}`}>
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            目標詳細に戻る
          </Button>
        </Link>
      </div>

      {/* Record Header */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <Calendar className="h-6 w-6 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{formattedDate}</h1>
            <p className="text-gray-600">{goal.name}の記録</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <Badge variant={record.achieved ? "default" : "secondary"} className="text-sm">
            {record.achieved ? "目標達成" : "目標未達成"}
          </Badge>
          <div className="text-sm text-gray-600">
            記録ID: {record.id}
          </div>
        </div>
      </div>

      {/* Record Details */}
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              実績値
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">
                {goal.type === 'sleep' && goal.unit === '時間' 
                  ? Number(record.actualValue).toFixed(1)
                  : record.actualValue}
              </div>
              <div className="text-lg text-gray-600">{goal.unit}</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              目標値との比較
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">目標値:</span>
                <span className="font-semibold">
                  {goal.targetValue} {goal.unit}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">実績値:</span>
                <span className="font-semibold">
                  {goal.type === 'sleep' && goal.unit === '時間' 
                    ? Number(record.actualValue).toFixed(1)
                    : record.actualValue} {goal.unit}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">達成率:</span>
                <span className={`font-semibold ${
                  record.achieved ? 'text-green-600' : 'text-red-600'
                }`}>
                  {goal.targetValue 
                    ? Math.round((parseFloat(record.actualValue) / parseFloat(goal.targetValue)) * 100)
                    : 0}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Goal Type Specific Details */}
        {goal.category === 'workout' && goal.type === 'workout' && (
          <Card>
            <CardHeader>
              <CardTitle>ワークアウト目標</CardTitle>
              <CardDescription>設定された各種目標値</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {goal.targetDistance && (
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-sm text-gray-600">距離目標</div>
                    <div className="font-semibold">{goal.targetDistance}km</div>
                  </div>
                )}
                {goal.targetTime && (
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-sm text-gray-600">時間目標</div>
                    <div className="font-semibold">{goal.targetTime}分</div>
                  </div>
                )}
                {goal.targetHeartRate && (
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-sm text-gray-600">心拍数目標</div>
                    <div className="font-semibold">{goal.targetHeartRate}bpm</div>
                  </div>
                )}
                {goal.targetCalories && (
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-sm text-gray-600">カロリー目標</div>
                    <div className="font-semibold">{goal.targetCalories}kcal</div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {goal.category === 'sleep' && goal.type === 'sleep' && (
          <Card>
            <CardHeader>
              <CardTitle>睡眠目標</CardTitle>
              <CardDescription>設定された睡眠関連目標</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {goal.targetSleepTime && (
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-sm text-gray-600">睡眠時間目標</div>
                    <div className="font-semibold">{goal.targetSleepTime}時間</div>
                  </div>
                )}
                {goal.targetSleepScore && (
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-sm text-gray-600">睡眠スコア目標</div>
                    <div className="font-semibold">{goal.targetSleepScore}点</div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Record Metadata */}
        <Card>
          <CardHeader>
            <CardTitle>記録情報</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">記録日:</span>
                <span>{record.date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">目標ID:</span>
                <span>{record.goalId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">記録ID:</span>
                <span>{record.id}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}