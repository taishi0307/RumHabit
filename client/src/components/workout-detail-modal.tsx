import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin, Heart, Zap, Target } from "lucide-react";
import type { Workout, Goal } from "@shared/schema";

interface WorkoutDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  workout: Workout | null;
  currentGoal?: Goal;
}

export function WorkoutDetailModal({ isOpen, onClose, workout, currentGoal }: WorkoutDetailModalProps) {
  if (!workout) return null;

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
      day: '2-digit',
      weekday: 'short'
    });
  };

  const formatTimeOnly = (time: string) => {
    return time.slice(0, 5);
  };

  const getAchievementStatus = () => {
    if (!currentGoal) return [];
    
    const achievements = [];
    
    const distanceAchieved = workout.distance >= currentGoal.distance;
    const heartRateAchieved = workout.heartRate >= currentGoal.heartRate;
    const durationAchieved = workout.duration >= currentGoal.duration * 60;
    
    achievements.push({
      label: '距離目標',
      value: `${workout.distance.toFixed(1)} km`,
      target: `${currentGoal.distance} km`,
      achieved: distanceAchieved,
      icon: MapPin,
      color: distanceAchieved ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'
    });
    
    achievements.push({
      label: '心拍数目標',
      value: `${workout.heartRate} BPM`,
      target: `${currentGoal.heartRate} BPM`,
      achieved: heartRateAchieved,
      icon: Heart,
      color: heartRateAchieved ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200'
    });
    
    achievements.push({
      label: '時間目標',
      value: formatTime(workout.duration),
      target: `${currentGoal.duration}:00`,
      achieved: durationAchieved,
      icon: Clock,
      color: durationAchieved ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
    });
    
    return achievements;
  };

  const achievements = getAchievementStatus();
  const totalAchievements = achievements.filter(a => a.achieved).length;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-orange-600" />
            ワークアウト詳細
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* 基本情報 */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="h-4 w-4 text-gray-600" />
              <span className="font-medium text-gray-800">
                {formatDate(workout.date, workout.time)}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">開始時刻</span>
                <p className="font-medium">{formatTimeOnly(workout.time)}</p>
              </div>
              <div>
                <span className="text-gray-600">消費カロリー</span>
                <p className="font-medium text-orange-600">{workout.calories} kcal</p>
              </div>
            </div>
          </div>

          {/* 目標達成状況 */}
          {currentGoal && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-gray-800">目標達成状況</h4>
                <Badge variant={totalAchievements === 3 ? "default" : "secondary"}>
                  {totalAchievements}/3 達成
                </Badge>
              </div>
              
              <div className="space-y-3">
                {achievements.map((achievement, index) => {
                  const Icon = achievement.icon;
                  return (
                    <div
                      key={index}
                      className={`p-3 rounded-lg border ${achievement.color}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4 text-gray-600" />
                          <span className="font-medium text-sm">{achievement.label}</span>
                        </div>
                        {achievement.achieved && (
                          <Badge variant="default" className="text-xs">
                            達成
                          </Badge>
                        )}
                      </div>
                      <div className="mt-2 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">実績</span>
                          <span className="font-medium">{achievement.value}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">目標</span>
                          <span className="font-medium">{achievement.target}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* パフォーマンス指標 */}
          <div>
            <h4 className="font-medium text-gray-800 mb-3">パフォーマンス指標</h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2 mb-1">
                  <MapPin className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-800">距離</span>
                </div>
                <p className="text-lg font-bold text-blue-600">{workout.distance.toFixed(1)} km</p>
              </div>
              
              <div className="bg-red-50 p-3 rounded-lg border border-red-200">
                <div className="flex items-center gap-2 mb-1">
                  <Heart className="h-4 w-4 text-red-600" />
                  <span className="text-sm font-medium text-red-800">平均心拍数</span>
                </div>
                <p className="text-lg font-bold text-red-600">{workout.heartRate} BPM</p>
              </div>
              
              <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-green-800">時間</span>
                </div>
                <p className="text-lg font-bold text-green-600">{formatTime(workout.duration)}</p>
              </div>
              
              <div className="bg-orange-50 p-3 rounded-lg border border-orange-200">
                <div className="flex items-center gap-2 mb-1">
                  <Zap className="h-4 w-4 text-orange-600" />
                  <span className="text-sm font-medium text-orange-800">カロリー</span>
                </div>
                <p className="text-lg font-bold text-orange-600">{workout.calories} kcal</p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}