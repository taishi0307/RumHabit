import { useState } from "react";
import type { Workout, Goal } from "@shared/schema";
import { WorkoutDetailModal } from "./workout-detail-modal";

interface WorkoutHistoryProps {
  workouts: Workout[];
  currentGoal?: Goal;
}

export function WorkoutHistory({ workouts, currentGoal }: WorkoutHistoryProps) {
  const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const handleWorkoutClick = (workout: Workout) => {
    setSelectedWorkout(workout);
    setIsDetailModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsDetailModalOpen(false);
    setSelectedWorkout(null);
  };
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (date: string, time: string) => {
    const dateObj = new Date(date + 'T' + time);
    return dateObj.toLocaleDateString('ja-JP', { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit' 
    }) + ' ' + time;
  };

  const getAchievementBadges = (workout: Workout) => {
    if (!currentGoal) return [];
    
    const badges = [];
    
    if (workout.distance >= currentGoal.distance) {
      badges.push({ text: '距離達成', color: 'bg-blue-100 text-blue-800' });
    }
    
    if (workout.heartRate >= currentGoal.heartRate) {
      badges.push({ text: '心拍数達成', color: 'bg-red-100 text-red-800' });
    }
    
    if (workout.duration >= currentGoal.duration * 60) {
      badges.push({ text: '時間達成', color: 'bg-green-100 text-green-800' });
    }
    
    return badges;
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-lg font-semibold mb-4">最近のワークアウト履歴</h3>
      
      {workouts.length === 0 ? (
        <p className="text-gray-500 text-center py-8">
          ワークアウトの記録がありません
        </p>
      ) : (
        <div className="space-y-3">
          {workouts.map((workout) => {
            const badges = getAchievementBadges(workout);
            
            return (
              <div 
                key={workout.id} 
                className="bg-gray-50 p-4 rounded-lg border border-gray-100 hover:border-gray-200 hover:shadow-md transition-all cursor-pointer"
                onClick={() => handleWorkoutClick(workout)}
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-medium text-gray-800">
                      {formatDate(workout.date, workout.time)}
                    </p>
                    <p className="text-sm text-gray-600">
                      {formatTime(workout.duration)} | {workout.distance.toFixed(1)}km | {workout.heartRate} BPM avg
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-orange-600">
                      {workout.calories} kcal
                    </p>
                    <div className="flex gap-2 mt-1">
                      {badges.map((badge, index) => (
                        <span
                          key={index}
                          className={`text-xs px-2 py-1 rounded ${badge.color}`}
                        >
                          {badge.text}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      
      <WorkoutDetailModal
        isOpen={isDetailModalOpen}
        onClose={handleCloseModal}
        workout={selectedWorkout}
        currentGoal={currentGoal}
      />
    </div>
  );
}
