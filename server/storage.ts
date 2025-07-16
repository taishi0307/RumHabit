import type { Request, Response } from "express";
import { goals, workouts, habitData, type Goal, type InsertGoal, type Workout, type InsertWorkout, type HabitData, type InsertHabitData } from "@shared/schema";

export interface IStorage {
  // Goals
  getGoals(): Promise<Goal[]>;
  getGoalsByCategory(category: string): Promise<Goal[]>;
  createGoal(goal: InsertGoal): Promise<Goal>;
  updateGoal(id: number, goal: InsertGoal): Promise<Goal>;
  deleteGoal(id: number): Promise<boolean>;
  
  // Workouts
  getWorkouts(): Promise<Workout[]>;
  getWorkoutsByDateRange(startDate: string, endDate: string): Promise<Workout[]>;
  createWorkout(workout: InsertWorkout): Promise<Workout>;
  
  // Habit Data
  getHabitData(): Promise<HabitData[]>;
  getHabitDataByGoal(goalId: number): Promise<HabitData[]>;
  getHabitDataByDate(date: string): Promise<HabitData[]>;
  createOrUpdateHabitData(habitData: InsertHabitData): Promise<HabitData>;
}

export class MemStorage implements IStorage {
  private goals: Map<number, Goal>;
  private workouts: Map<number, Workout>;
  private habitDataList: HabitData[];
  private currentGoalId: number;
  private currentWorkoutId: number;
  private currentHabitDataId: number;

  constructor() {
    this.goals = new Map();
    this.workouts = new Map();
    this.habitDataList = [];
    this.currentGoalId = 1;
    this.currentWorkoutId = 1;
    this.currentHabitDataId = 1;

    // Initialize with default goals
    this.initializeDefaultGoals();
    
    // Initialize with sample data
    this.initializeSampleData();
  }

  private initializeDefaultGoals() {
    const defaultGoals: Goal[] = [
      {
        id: 1,
        type: 'workout',
        name: 'ランニング目標',
        targetValue: null,
        unit: null,
        category: 'workout',
        targetDistance: 5.0,
        targetTime: 30,
        targetHeartRate: 150,
        targetCalories: 300,
        targetSleepTime: null,
        targetSleepScore: null,
        isActive: true,
        createdAt: new Date(),
      },
      {
        id: 2,
        type: 'sleep',
        name: '睡眠目標',
        targetValue: null,
        unit: null,
        category: 'sleep',
        targetDistance: null,
        targetTime: null,
        targetHeartRate: null,
        targetCalories: null,
        targetSleepTime: 8,
        targetSleepScore: 85,
        isActive: true,
        createdAt: new Date(),
      },
    ];

    defaultGoals.forEach(goal => {
      this.goals.set(goal.id, goal);
    });
    this.currentGoalId = 3;
  }

  private initializeSampleData() {
    // Sample workouts for July 2025
    const sampleWorkouts: Workout[] = [
      { id: 1, date: "2025-07-14", time: "07:30:00", distance: 5.2, heartRate: 155, duration: 1800, calories: 320, createdAt: new Date() },
      { id: 2, date: "2025-07-13", time: "18:45:00", distance: 3.8, heartRate: 142, duration: 1200, calories: 280, createdAt: new Date() },
      { id: 3, date: "2025-07-12", time: "06:15:00", distance: 6.1, heartRate: 160, duration: 2100, calories: 410, createdAt: new Date() },
      { id: 4, date: "2025-07-11", time: "19:30:00", distance: 4.5, heartRate: 148, duration: 1500, calories: 295, createdAt: new Date() },
      { id: 5, date: "2025-07-10", time: "07:00:00", distance: 5.8, heartRate: 165, duration: 1950, calories: 385, createdAt: new Date() },
      { id: 6, date: "2025-07-09", time: "17:20:00", distance: 3.2, heartRate: 138, duration: 1080, calories: 250, createdAt: new Date() },
      { id: 7, date: "2025-07-08", time: "08:45:00", distance: 5.5, heartRate: 152, duration: 1740, calories: 340, createdAt: new Date() },
      { id: 8, date: "2025-07-07", time: "18:15:00", distance: 4.2, heartRate: 145, duration: 1350, calories: 275, createdAt: new Date() },
      { id: 9, date: "2025-07-06", time: "07:45:00", distance: 6.3, heartRate: 158, duration: 2040, calories: 420, createdAt: new Date() },
      { id: 10, date: "2025-07-05", time: "19:00:00", distance: 3.9, heartRate: 140, duration: 1260, calories: 265, createdAt: new Date() },
      { id: 11, date: "2025-07-04", time: "06:30:00", distance: 5.1, heartRate: 153, duration: 1680, calories: 315, createdAt: new Date() },
      { id: 12, date: "2025-07-03", time: "17:45:00", distance: 4.8, heartRate: 149, duration: 1620, calories: 305, createdAt: new Date() },
      { id: 13, date: "2025-07-02", time: "08:15:00", distance: 5.9, heartRate: 162, duration: 1980, calories: 395, createdAt: new Date() },
      { id: 14, date: "2025-07-01", time: "18:30:00", distance: 4.0, heartRate: 143, duration: 1200, calories: 270, createdAt: new Date() },
    ];

    sampleWorkouts.forEach(workout => {
      this.workouts.set(workout.id, workout);
    });
    this.currentWorkoutId = 15;

    // Generate habit data for each goal and workout
    sampleWorkouts.forEach(workout => {
      // Distance goal (id: 1)
      const distanceHabit: HabitData = {
        id: this.currentHabitDataId++,
        date: workout.date,
        goalId: 1,
        achieved: workout.distance >= 5.0,
        actualValue: workout.distance,
        workoutId: workout.id,
      };
      this.habitDataList.push(distanceHabit);

      // Heart rate goal (id: 2)
      const heartRateHabit: HabitData = {
        id: this.currentHabitDataId++,
        date: workout.date,
        goalId: 2,
        achieved: workout.heartRate >= 150,
        actualValue: workout.heartRate,
        workoutId: workout.id,
      };
      this.habitDataList.push(heartRateHabit);

      // Duration goal (id: 3) - converting seconds to minutes
      const durationHabit: HabitData = {
        id: this.currentHabitDataId++,
        date: workout.date,
        goalId: 3,
        achieved: workout.duration >= 1800, // 30 minutes
        actualValue: workout.duration / 60, // convert to minutes
        workoutId: workout.id,
      };
      this.habitDataList.push(durationHabit);
    });

    // Add some sample sleep data
    const sleepDates = ["2025-07-14", "2025-07-13", "2025-07-12", "2025-07-11", "2025-07-10"];
    sleepDates.forEach(date => {
      // Sleep time goal (id: 4)
      const sleepTime = 6.5 + Math.random() * 3; // 6.5 to 9.5 hours
      const sleepTimeHabit: HabitData = {
        id: this.currentHabitDataId++,
        date: date,
        goalId: 2,
        achieved: sleepTime >= 8,
        actualValue: sleepTime,
        workoutId: null,
      };
      this.habitDataList.push(sleepTimeHabit);

      // Sleep score goal (id: 2)
      const sleepScore = 70 + Math.random() * 25; // 70 to 95
      const sleepScoreHabit: HabitData = {
        id: this.currentHabitDataId++,
        date: date,
        goalId: 2,
        achieved: sleepScore >= 85,
        actualValue: sleepScore,
        workoutId: null,
      };
      this.habitDataList.push(sleepScoreHabit);
    });
  }

  async getGoals(): Promise<Goal[]> {
    return Array.from(this.goals.values());
  }

  async getGoalsByCategory(category: string): Promise<Goal[]> {
    return Array.from(this.goals.values()).filter(goal => goal.category === category);
  }

  async createGoal(goal: InsertGoal): Promise<Goal> {
    const newGoal: Goal = {
      id: this.currentGoalId++,
      ...goal,
      targetValue: goal.targetValue || null,
      unit: goal.unit || null,
      targetDistance: goal.targetDistance || null,
      targetTime: goal.targetTime || null,
      targetHeartRate: goal.targetHeartRate || null,
      targetCalories: goal.targetCalories || null,
      targetSleepTime: goal.targetSleepTime || null,
      targetSleepScore: goal.targetSleepScore || null,
      isActive: goal.isActive ?? true,
      createdAt: new Date(),
    };
    this.goals.set(newGoal.id, newGoal);
    return newGoal;
  }

  async updateGoal(id: number, goal: InsertGoal): Promise<Goal> {
    const existing = this.goals.get(id);
    if (!existing) {
      throw new Error(`Goal with id ${id} not found`);
    }
    
    const updated: Goal = {
      ...existing,
      ...goal,
    };
    this.goals.set(id, updated);
    return updated;
  }

  async deleteGoal(id: number): Promise<boolean> {
    return this.goals.delete(id);
  }

  async getWorkouts(): Promise<Workout[]> {
    return Array.from(this.workouts.values()).sort((a, b) => 
      new Date(b.date + ' ' + b.time).getTime() - new Date(a.date + ' ' + a.time).getTime()
    );
  }

  async getWorkoutsByDateRange(startDate: string, endDate: string): Promise<Workout[]> {
    return Array.from(this.workouts.values()).filter(workout => 
      workout.date >= startDate && workout.date <= endDate
    );
  }

  async createWorkout(workout: InsertWorkout): Promise<Workout> {
    const newWorkout: Workout = {
      id: this.currentWorkoutId++,
      ...workout,
      createdAt: new Date(),
    };
    this.workouts.set(newWorkout.id, newWorkout);
    return newWorkout;
  }

  async getHabitData(): Promise<HabitData[]> {
    return this.habitDataList;
  }

  async getHabitDataByGoal(goalId: number): Promise<HabitData[]> {
    return this.habitDataList.filter(data => data.goalId === goalId);
  }

  async getHabitDataByDate(date: string): Promise<HabitData[]> {
    return this.habitDataList.filter(data => data.date === date);
  }

  async createOrUpdateHabitData(habitData: InsertHabitData): Promise<HabitData> {
    const existing = this.habitDataList.find(data => 
      data.date === habitData.date && data.goalId === habitData.goalId
    );

    if (existing) {
      const updated: HabitData = {
        ...existing,
        ...habitData,
      };
      const index = this.habitDataList.findIndex(data => data.id === existing.id);
      this.habitDataList[index] = updated;
      return updated;
    } else {
      const newHabitData: HabitData = {
        id: this.currentHabitDataId++,
        ...habitData,
        achieved: habitData.achieved ?? false,
        actualValue: habitData.actualValue ?? null,
        workoutId: habitData.workoutId ?? null,
      };
      this.habitDataList.push(newHabitData);
      return newHabitData;
    }
  }
}

export const storage = new MemStorage();