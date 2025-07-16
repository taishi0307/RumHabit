import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Play, Moon } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { insertGoalSchema, type InsertGoal } from "@shared/schema";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const goalTypes = [
  {
    id: "workout-distance",
    name: "ランニング",
    icon: Play,
    description: "距離目標を設定",
    unit: "km",
    category: "workout"
  },
  {
    id: "sleep-time",
    name: "睡眠",
    icon: Moon,
    description: "睡眠時間目標を設定",
    unit: "時間",
    category: "sleep"
  }
];

export default function AddGoalPage() {
  const [, navigate] = useLocation();
  const [selectedType, setSelectedType] = useState<string>("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<InsertGoal>({
    resolver: zodResolver(insertGoalSchema),
    defaultValues: {
      name: "",
      type: "",
      targetValue: "",
      unit: "",
      category: "",
      isActive: true
    }
  });

  const createGoalMutation = useMutation({
    mutationFn: async (goalData: InsertGoal) => {
      const response = await apiRequest("/api/goals", {
        method: "POST",
        body: JSON.stringify(goalData)
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/goals"] });
      toast({
        title: "目標を作成しました",
        description: "新しい目標が正常に作成されました。"
      });
      navigate("/");
    },
    onError: (error) => {
      toast({
        title: "エラーが発生しました",
        description: "目標の作成に失敗しました。もう一度お試しください。",
        variant: "destructive"
      });
    }
  });

  const handleTypeSelect = (typeId: string) => {
    const goalType = goalTypes.find(t => t.id === typeId);
    if (goalType) {
      setSelectedType(typeId);
      form.setValue("type", typeId);
      form.setValue("name", goalType.name + "目標");
      form.setValue("unit", goalType.unit);
      form.setValue("category", goalType.category);
    }
  };

  const onSubmit = (data: InsertGoal) => {
    createGoalMutation.mutate(data);
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold text-gray-800">目標を追加</h1>
      </div>

      {/* Goal Type Selection */}
      {!selectedType && (
        <Card>
          <CardHeader>
            <CardTitle>目標タイプを選択</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {goalTypes.map((type) => {
                const Icon = type.icon;
                return (
                  <Button
                    key={type.id}
                    variant="outline"
                    className="h-24 flex-col gap-2 hover:bg-gray-50"
                    onClick={() => handleTypeSelect(type.id)}
                  >
                    <Icon className="h-8 w-8" />
                    <div className="text-center">
                      <div className="font-semibold">{type.name}</div>
                      <div className="text-xs text-gray-600">{type.description}</div>
                    </div>
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Goal Configuration */}
      {selectedType && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {(() => {
                const selectedGoalType = goalTypes.find(t => t.id === selectedType);
                if (selectedGoalType) {
                  const Icon = selectedGoalType.icon;
                  return (
                    <>
                      <Icon className="h-5 w-5" />
                      {selectedGoalType.name}目標の設定
                    </>
                  );
                }
                return null;
              })()}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>目標名</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="目標名を入力" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="targetValue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>目標値</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          type="number" 
                          step="0.1" 
                          placeholder="目標値を入力" 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex gap-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setSelectedType("")}
                  >
                    戻る
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={createGoalMutation.isPending}
                  >
                    {createGoalMutation.isPending ? "作成中..." : "目標を作成"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}