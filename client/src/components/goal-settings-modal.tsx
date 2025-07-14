import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Goal, InsertGoal } from "@shared/schema";

interface GoalSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentGoal?: Goal;
}

export function GoalSettingsModal({ isOpen, onClose, currentGoal }: GoalSettingsModalProps) {
  const [goals, setGoals] = useState({
    distance: 5.0,
    heartRate: 150,
    duration: 30
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (currentGoal) {
      setGoals({
        distance: currentGoal.distance,
        heartRate: currentGoal.heartRate,
        duration: currentGoal.duration
      });
    }
  }, [currentGoal]);

  const updateGoalMutation = useMutation({
    mutationFn: async (goalData: InsertGoal) => {
      const res = await apiRequest("PUT", "/api/goals", goalData);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/goals/current"] });
      queryClient.invalidateQueries({ queryKey: ["/api/statistics"] });
      toast({
        title: "目標を更新しました",
        description: "新しい目標が保存されました。",
      });
      onClose();
    },
    onError: () => {
      toast({
        title: "エラー",
        description: "目標の更新に失敗しました。",
        variant: "destructive",
      });
    }
  });

  const handleSave = () => {
    updateGoalMutation.mutate(goals);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4 shadow-2xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800">目標設定</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X size={24} />
          </button>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              距離目標 (km)
            </label>
            <input
              type="number"
              step="0.1"
              value={goals.distance}
              onChange={(e) => setGoals({...goals, distance: parseFloat(e.target.value) || 0})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              心拍数目標 (BPM)
            </label>
            <input
              type="number"
              value={goals.heartRate}
              onChange={(e) => setGoals({...goals, heartRate: parseInt(e.target.value) || 0})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              時間目標 (分)
            </label>
            <input
              type="number"
              value={goals.duration}
              onChange={(e) => setGoals({...goals, duration: parseInt(e.target.value) || 0})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
        
        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-400 transition-colors"
          >
            キャンセル
          </button>
          <button
            onClick={handleSave}
            disabled={updateGoalMutation.isPending}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {updateGoalMutation.isPending ? "保存中..." : "保存"}
          </button>
        </div>
      </div>
    </div>
  );
}
