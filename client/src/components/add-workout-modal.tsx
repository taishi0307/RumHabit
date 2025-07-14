import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertWorkoutSchema } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { Plus, Calendar, Clock, MapPin, Heart, Zap } from "lucide-react";
import type { InsertWorkout } from "@shared/schema";
import { z } from "zod";

interface AddWorkoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const workoutFormSchema = insertWorkoutSchema.extend({
  date: z.string().min(1, "日付は必須です"),
  time: z.string().min(1, "時間は必須です"),
  distance: z.coerce.number().min(0.1, "距離は0.1km以上で入力してください"),
  heartRate: z.coerce.number().min(50, "心拍数は50以上で入力してください").max(220, "心拍数は220以下で入力してください"),
  duration: z.coerce.number().min(60, "運動時間は60秒以上で入力してください"),
  calories: z.coerce.number().min(1, "消費カロリーは1以上で入力してください"),
});

type WorkoutFormData = z.infer<typeof workoutFormSchema>;

export function AddWorkoutModal({ isOpen, onClose }: AddWorkoutModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<WorkoutFormData>({
    resolver: zodResolver(workoutFormSchema),
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      time: new Date().toTimeString().slice(0, 8),
      distance: 0,
      heartRate: 0,
      duration: 0,
      calories: 0,
    },
  });

  const createWorkoutMutation = useMutation({
    mutationFn: async (workoutData: WorkoutFormData) => {
      const response = await apiRequest("/api/workouts", {
        method: "POST",
        body: JSON.stringify(workoutData),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/workouts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/habit-data"] });
      queryClient.invalidateQueries({ queryKey: ["/api/statistics"] });
      toast({
        title: "ワークアウトを記録しました",
        description: "新しいワークアウトが追加されました。",
      });
      reset();
      onClose();
    },
    onError: (error) => {
      toast({
        title: "エラーが発生しました",
        description: "ワークアウトの記録に失敗しました。",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: WorkoutFormData) => {
    createWorkoutMutation.mutate(data);
  };

  const formatDurationDisplay = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}分${secs}秒`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5 text-blue-600" />
            ワークアウト記録
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* 日付と時間 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="date" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                日付
              </Label>
              <Input
                id="date"
                type="date"
                {...register("date")}
                className="mt-1"
              />
              {errors.date && (
                <p className="text-sm text-red-500 mt-1">{errors.date.message}</p>
              )}
            </div>
            
            <div>
              <Label htmlFor="time" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                時間
              </Label>
              <Input
                id="time"
                type="time"
                {...register("time")}
                className="mt-1"
              />
              {errors.time && (
                <p className="text-sm text-red-500 mt-1">{errors.time.message}</p>
              )}
            </div>
          </div>

          {/* 距離 */}
          <div>
            <Label htmlFor="distance" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              距離 (km)
            </Label>
            <Input
              id="distance"
              type="number"
              step="0.1"
              min="0.1"
              placeholder="5.0"
              {...register("distance")}
              className="mt-1"
            />
            {errors.distance && (
              <p className="text-sm text-red-500 mt-1">{errors.distance.message}</p>
            )}
          </div>

          {/* 心拍数 */}
          <div>
            <Label htmlFor="heartRate" className="flex items-center gap-2">
              <Heart className="h-4 w-4" />
              平均心拍数 (BPM)
            </Label>
            <Input
              id="heartRate"
              type="number"
              min="50"
              max="220"
              placeholder="150"
              {...register("heartRate")}
              className="mt-1"
            />
            {errors.heartRate && (
              <p className="text-sm text-red-500 mt-1">{errors.heartRate.message}</p>
            )}
          </div>

          {/* 運動時間 */}
          <div>
            <Label htmlFor="duration" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              運動時間 (秒)
            </Label>
            <Input
              id="duration"
              type="number"
              min="60"
              placeholder="1800"
              {...register("duration")}
              className="mt-1"
            />
            {errors.duration && (
              <p className="text-sm text-red-500 mt-1">{errors.duration.message}</p>
            )}
          </div>

          {/* 消費カロリー */}
          <div>
            <Label htmlFor="calories" className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              消費カロリー (kcal)
            </Label>
            <Input
              id="calories"
              type="number"
              min="1"
              placeholder="240"
              {...register("calories")}
              className="mt-1"
            />
            {errors.calories && (
              <p className="text-sm text-red-500 mt-1">{errors.calories.message}</p>
            )}
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              キャンセル
            </Button>
            <Button
              type="submit"
              disabled={createWorkoutMutation.isPending}
              className="flex-1"
            >
              {createWorkoutMutation.isPending ? "記録中..." : "記録"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}