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
    id: "workout",
    name: "ランニング",
    icon: Play,
    description: "ランニング目標を設定",
    category: "workout",
    multipleValues: true,
    fields: [
      { id: "distance", name: "距離", unit: "km", key: "targetDistance" },
      { id: "time", name: "時間", unit: "分", key: "targetTime" },
      { id: "heart-rate", name: "平均心拍数", unit: "bpm", key: "targetHeartRate" },
      { id: "calories", name: "消費エネルギー", unit: "kcal", key: "targetCalories" }
    ]
  },
  {
    id: "sleep",
    name: "睡眠",
    icon: Moon,
    description: "睡眠目標を設定",
    category: "sleep",
    multipleValues: true,
    fields: [
      { id: "time", name: "睡眠時間", unit: "時間", key: "targetSleepTime" },
      { id: "score", name: "睡眠スコア", unit: "点", key: "targetSleepScore" }
    ]
  }
];

export default function AddGoalPage() {
  const [, navigate] = useLocation();
  const [selectedType, setSelectedType] = useState<string>("");
  const [selectedSubtype, setSelectedSubtype] = useState<string>("");
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
      if (goalType.subtypes) {
        // Has subtypes, don't set form values yet
        setSelectedSubtype("");
      } else if (goalType.multipleValues) {
        // Multiple values, set basic form values
        form.setValue("type", typeId);
        form.setValue("name", goalType.name + "目標");
        form.setValue("category", goalType.category);
      } else {
        // No subtypes, set form values directly
        form.setValue("type", typeId);
        form.setValue("name", goalType.name + "目標");
        form.setValue("unit", goalType.unit);
        form.setValue("category", goalType.category);
      }
    }
  };

  const handleSubtypeSelect = (subtypeId: string) => {
    const goalType = goalTypes.find(t => t.id === selectedType);
    if (goalType && goalType.subtypes) {
      const subtype = goalType.subtypes.find(s => s.id === subtypeId);
      if (subtype) {
        setSelectedSubtype(subtypeId);
        form.setValue("type", subtypeId);
        form.setValue("name", subtype.name + "目標");
        form.setValue("unit", subtype.unit);
        form.setValue("category", goalType.category);
      }
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

      {/* Multiple Values Configuration */}
      {selectedType && goalTypes.find(t => t.id === selectedType)?.multipleValues && (
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

                {/* Multiple value fields */}
                {goalTypes.find(t => t.id === selectedType)?.fields?.map((field) => (
                  <FormField
                    key={field.id}
                    control={form.control}
                    name={field.key as any}
                    render={({ field: formField }) => (
                      <FormItem>
                        <FormLabel>{field.name} ({field.unit})</FormLabel>
                        <FormControl>
                          <Input 
                            {...formField}
                            type="number" 
                            step="0.1" 
                            placeholder={`${field.name}を入力`}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ))}

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

      {/* Subtype Selection */}
      {selectedType && !selectedSubtype && goalTypes.find(t => t.id === selectedType)?.subtypes && (
        <Card>
          <CardHeader>
            <CardTitle>
              {selectedType === "workout" ? "ランニング目標の種類を選択" : "睡眠目標の種類を選択"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {goalTypes.find(t => t.id === selectedType)?.subtypes?.map((subtype) => (
                <Button
                  key={subtype.id}
                  variant="outline"
                  className="h-20 flex-col gap-2 hover:bg-gray-50"
                  onClick={() => handleSubtypeSelect(subtype.id)}
                >
                  <div className="text-center">
                    <div className="font-semibold">{subtype.name}</div>
                    <div className="text-xs text-gray-600">単位: {subtype.unit}</div>
                  </div>
                </Button>
              ))}
            </div>
            <div className="flex justify-start mt-4">
              <Button 
                variant="outline" 
                onClick={() => setSelectedType("")}
              >
                戻る
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Goal Configuration */}
      {(selectedType && !goalTypes.find(t => t.id === selectedType)?.subtypes && !goalTypes.find(t => t.id === selectedType)?.multipleValues) || selectedSubtype ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {(() => {
                const selectedGoalType = goalTypes.find(t => t.id === selectedType);
                if (selectedGoalType) {
                  const Icon = selectedGoalType.icon;
                  let title = selectedGoalType.name + "目標の設定";
                  
                  if (selectedSubtype && selectedGoalType.subtypes) {
                    const subtype = selectedGoalType.subtypes.find(s => s.id === selectedSubtype);
                    if (subtype) {
                      title = subtype.name + "目標の設定";
                    }
                  }
                  
                  return (
                    <>
                      <Icon className="h-5 w-5" />
                      {title}
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
                    onClick={() => {
                      if (selectedSubtype) {
                        setSelectedSubtype("");
                      } else {
                        setSelectedType("");
                      }
                    }}
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
      ) : null}
    </div>
  );
}