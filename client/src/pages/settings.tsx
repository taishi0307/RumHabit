import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Settings, Watch, Target, ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { GoalSettingsModal } from "@/components/goal-settings-modal";
import { SmartWatchIntegration } from "@/components/smartwatch-integration";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Goal } from "@shared/schema";

export default function SettingsPage() {
  const [showGoalSettings, setShowGoalSettings] = useState(false);

  const { data: currentGoal } = useQuery<Goal>({
    queryKey: ["/api/goals/current"],
  });

  return (
    <div className="max-w-6xl mx-auto p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Link href="/">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                戻る
              </Button>
            </Link>
            <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
              <Settings className="text-blue-600" />
              設定
            </h1>
          </div>
        </div>
      </div>

      {/* Goal Settings Modal */}
      <GoalSettingsModal
        isOpen={showGoalSettings}
        onClose={() => setShowGoalSettings(false)}
        currentGoal={currentGoal}
      />

      {/* Settings Tabs */}
      <Tabs defaultValue="smartwatch" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="smartwatch">スマートウォッチ統合</TabsTrigger>
          <TabsTrigger value="goals">目標設定</TabsTrigger>
        </TabsList>

        <TabsContent value="smartwatch" className="space-y-6">
          <SmartWatchIntegration />
        </TabsContent>

        <TabsContent value="goals" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="text-orange-600" />
                目標設定
              </CardTitle>
              <CardDescription>
                日々のワークアウト目標を設定します。これらの目標は習慣トラッカーで達成度を測定するために使用されます。
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Current Goals Display */}
                {currentGoal && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                      <div className="text-sm font-medium text-gray-700 mb-1">距離目標</div>
                      <div className="text-2xl font-bold text-blue-600">{currentGoal.distance} km</div>
                    </div>
                    <div className="bg-red-50 p-4 rounded-lg border border-red-100">
                      <div className="text-sm font-medium text-gray-700 mb-1">心拍数目標</div>
                      <div className="text-2xl font-bold text-red-600">{currentGoal.heartRate} BPM</div>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                      <div className="text-sm font-medium text-gray-700 mb-1">時間目標</div>
                      <div className="text-2xl font-bold text-green-600">{currentGoal.duration} 分</div>
                    </div>
                  </div>
                )}

                <Button
                  onClick={() => setShowGoalSettings(true)}
                  className="w-full md:w-auto"
                >
                  <Target className="h-4 w-4 mr-2" />
                  目標を更新
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}