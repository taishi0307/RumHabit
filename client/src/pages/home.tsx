import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle, Settings } from "lucide-react";
import { GoalSettingsModal } from "@/components/goal-settings-modal";
import { StatisticsCard } from "@/components/statistics-card";
import { CalendarView } from "@/components/calendar-view";
import { WorkoutHistory } from "@/components/workout-history";
import type { Goal, Workout, HabitData } from "@shared/schema";

interface Statistics {
  streak: number;
  totalWorkoutDays: number;
  averageAchievementRate: number;
}

export default function Home() {
  const [showGoalSettings, setShowGoalSettings] = useState(false);

  const { data: currentGoal } = useQuery<Goal>({
    queryKey: ["/api/goals/current"],
  });

  const { data: workouts = [] } = useQuery<Workout[]>({
    queryKey: ["/api/workouts"],
  });

  const { data: habitData = [] } = useQuery<HabitData[]>({
    queryKey: ["/api/habit-data"],
  });

  const { data: statistics } = useQuery<Statistics>({
    queryKey: ["/api/statistics"],
  });

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <CheckCircle className="text-green-600" />
            習慣トラッカー
          </h1>
          <button
            onClick={() => setShowGoalSettings(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Settings size={20} />
            目標設定
          </button>
        </div>
      </div>

      {/* Goal Settings Modal */}
      <GoalSettingsModal
        isOpen={showGoalSettings}
        onClose={() => setShowGoalSettings(false)}
        currentGoal={currentGoal}
      />

      {/* Statistics */}
      <StatisticsCard statistics={statistics} />

      {/* Calendar */}
      <CalendarView habitData={habitData} />

      {/* Current Goals */}
      {currentGoal && (
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <i className="fas fa-target text-orange-600"></i>
            現在の目標
          </h3>
          <div className="grid md:grid-cols-3 gap-4">
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
        </div>
      )}

      {/* Workout History */}
      <WorkoutHistory workouts={workouts} currentGoal={currentGoal} />
    </div>
  );
}
