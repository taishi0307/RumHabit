import type { Request, Response } from "express";
import { goals, workouts, habitData, type Goal, type InsertGoal, type Workout, type InsertWorkout, type HabitData, type InsertHabitData } from "@shared/schema";
import { db } from "./db";
import { eq, and } from "drizzle-orm";

export interface IStorage {
  // Goals
  getGoals(userId: number): Promise<Goal[]>;
  getGoalsByCategory(userId: number, category: string): Promise<Goal[]>;
  createGoal(userId: number, goal: InsertGoal): Promise<Goal>;
  updateGoal(userId: number, id: number, goal: InsertGoal): Promise<Goal>;
  deleteGoal(userId: number, id: number): Promise<boolean>;
  
  // Workouts
  getWorkouts(userId: number): Promise<Workout[]>;
  getWorkoutsByDateRange(userId: number, startDate: string, endDate: string): Promise<Workout[]>;
  createWorkout(userId: number, workout: InsertWorkout): Promise<Workout>;
  
  // Habit Data
  getHabitData(userId: number): Promise<HabitData[]>;
  getHabitDataByGoal(userId: number, goalId: number): Promise<HabitData[]>;
  getHabitDataByDate(userId: number, date: string): Promise<HabitData[]>;
  createOrUpdateHabitData(userId: number, habitData: InsertHabitData): Promise<HabitData>;
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
        userId: 1, // Default user ID for development
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
        userId: 1, // Default user ID for development
        type: 'sleep',
        name: '睡眠目標',
        targetValue: 8,
        unit: '時間',
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
      { id: 1, userId: 1, date: "2025-07-15", time: "00:12:00", distance: 2.07, heartRate: 160, duration: 828, calories: 139, createdAt: new Date() },
      { id: 2, userId: 1, date: "2025-07-14", time: "07:30:00", distance: 5.2, heartRate: 155, duration: 1800, calories: 320, createdAt: new Date() },
      { id: 3, userId: 1, date: "2025-07-13", time: "18:45:00", distance: 3.8, heartRate: 142, duration: 1200, calories: 280, createdAt: new Date() },
      { id: 4, userId: 1, date: "2025-07-12", time: "06:15:00", distance: 6.1, heartRate: 160, duration: 2100, calories: 410, createdAt: new Date() },
      { id: 5, userId: 1, date: "2025-07-11", time: "19:30:00", distance: 4.5, heartRate: 148, duration: 1500, calories: 295, createdAt: new Date() },
      { id: 6, userId: 1, date: "2025-07-10", time: "07:00:00", distance: 5.8, heartRate: 165, duration: 1950, calories: 385, createdAt: new Date() },
      { id: 7, userId: 1, date: "2025-07-09", time: "17:20:00", distance: 3.2, heartRate: 138, duration: 1080, calories: 250, createdAt: new Date() },
      { id: 8, userId: 1, date: "2025-07-08", time: "08:45:00", distance: 5.5, heartRate: 152, duration: 1740, calories: 340, createdAt: new Date() },
      { id: 9, userId: 1, date: "2025-07-07", time: "18:15:00", distance: 4.2, heartRate: 145, duration: 1350, calories: 275, createdAt: new Date() },
      { id: 10, userId: 1, date: "2025-07-06", time: "07:45:00", distance: 6.3, heartRate: 158, duration: 2040, calories: 420, createdAt: new Date() },
      { id: 11, userId: 1, date: "2025-07-05", time: "19:00:00", distance: 3.9, heartRate: 140, duration: 1260, calories: 265, createdAt: new Date() },
      { id: 12, userId: 1, date: "2025-07-04", time: "06:30:00", distance: 5.1, heartRate: 153, duration: 1680, calories: 315, createdAt: new Date() },
      { id: 13, userId: 1, date: "2025-07-03", time: "17:45:00", distance: 4.8, heartRate: 149, duration: 1620, calories: 305, createdAt: new Date() },
      { id: 14, userId: 1, date: "2025-07-02", time: "08:15:00", distance: 5.9, heartRate: 162, duration: 1980, calories: 395, createdAt: new Date() },
      { id: 15, userId: 1, date: "2025-07-01", time: "18:30:00", distance: 4.0, heartRate: 143, duration: 1200, calories: 270, createdAt: new Date() },
    ];

    sampleWorkouts.forEach(workout => {
      this.workouts.set(workout.id, workout);
    });
    this.currentWorkoutId = 16;

    // Generate habit data only for the default goal (id: 1)
    sampleWorkouts.forEach(workout => {
      // Only create habit data for the default workout goal (id: 1)
      const distanceHabit: HabitData = {
        id: this.currentHabitDataId++,
        userId: 1,
        date: workout.date,
        goalId: 1,
        achieved: workout.distance >= 5.0,
        actualValue: workout.distance,
        workoutId: workout.id,
      };
      this.habitDataList.push(distanceHabit);
    });

    // Add some sample sleep data only for the default sleep goal (id: 2)
    const sleepDates = ["2025-07-14", "2025-07-13", "2025-07-12", "2025-07-11", "2025-07-10"];
    sleepDates.forEach(date => {
      // Sleep time data for default sleep goal (id: 2)
      const sleepTime = 6.5 + Math.random() * 3; // 6.5 to 9.5 hours
      const sleepTimeHabit: HabitData = {
        id: this.currentHabitDataId++,
        userId: 1,
        date: date,
        goalId: 2,
        achieved: sleepTime >= 8,
        actualValue: sleepTime,
        workoutId: null,
      };
      this.habitDataList.push(sleepTimeHabit);
    });
  }

  async getGoals(userId: number): Promise<Goal[]> {
    return Array.from(this.goals.values()).filter(goal => goal.userId === userId);
  }

  async getGoalsByCategory(userId: number, category: string): Promise<Goal[]> {
    return Array.from(this.goals.values()).filter(goal => 
      goal.userId === userId && goal.category === category
    );
  }

  async createGoal(userId: number, goal: InsertGoal): Promise<Goal> {
    try {
      console.log('MemStorage.createGoal called with:', { userId, goal });
      const newGoal: Goal = {
        id: this.currentGoalId++,
        userId,
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
      console.log('MemStorage.createGoal success:', newGoal);
      return newGoal;
    } catch (error) {
      console.error('MemStorage.createGoal error:', error);
      throw error;
    }
  }

  async updateGoal(userId: number, id: number, goal: InsertGoal): Promise<Goal> {
    const existing = this.goals.get(id);
    if (!existing || existing.userId !== userId) {
      throw new Error(`Goal with id ${id} not found`);
    }
    
    const updated: Goal = {
      ...existing,
      ...goal,
      id: existing.id,
      userId: existing.userId,
    };
    this.goals.set(id, updated);
    return updated;
  }

  async deleteGoal(userId: number, id: number): Promise<boolean> {
    const existing = this.goals.get(id);
    if (!existing || existing.userId !== userId) {
      return false;
    }
    return this.goals.delete(id);
  }

  async getWorkouts(userId: number): Promise<Workout[]> {
    return Array.from(this.workouts.values())
      .filter(workout => workout.userId === userId)
      .sort((a, b) => 
        new Date(b.date + ' ' + b.time).getTime() - new Date(a.date + ' ' + a.time).getTime()
      );
  }

  async getWorkoutsByDateRange(userId: number, startDate: string, endDate: string): Promise<Workout[]> {
    return Array.from(this.workouts.values()).filter(workout => 
      workout.userId === userId && workout.date >= startDate && workout.date <= endDate
    );
  }

  async createWorkout(userId: number, workout: InsertWorkout): Promise<Workout> {
    const newWorkout: Workout = {
      id: this.currentWorkoutId++,
      userId,
      ...workout,
      createdAt: new Date(),
    };
    this.workouts.set(newWorkout.id, newWorkout);
    return newWorkout;
  }

  async getHabitData(userId: number): Promise<HabitData[]> {
    return this.habitDataList.filter(data => data.userId === userId);
  }

  async getHabitDataByGoal(userId: number, goalId: number): Promise<HabitData[]> {
    return this.habitDataList.filter(data => data.userId === userId && data.goalId === goalId);
  }

  async getHabitDataByDate(userId: number, date: string): Promise<HabitData[]> {
    return this.habitDataList.filter(data => data.userId === userId && data.date === date);
  }

  async createOrUpdateHabitData(userId: number, habitData: InsertHabitData): Promise<HabitData> {
    const existing = this.habitDataList.find(data => 
      data.userId === userId && data.date === habitData.date && data.goalId === habitData.goalId
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
        userId,
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

export class DatabaseStorage implements IStorage {
  async getGoals(userId: number): Promise<Goal[]> {
    return await db.select().from(goals).where(eq(goals.userId, userId));
  }

  async getGoalsByCategory(userId: number, category: string): Promise<Goal[]> {
    return await db.select().from(goals).where(and(
      eq(goals.userId, userId),
      eq(goals.category, category)
    ));
  }

  async createGoal(userId: number, goal: InsertGoal): Promise<Goal> {
    try {
      console.log('DatabaseStorage.createGoal called with:', { userId, goal });
      const [newGoal] = await db.insert(goals).values({ ...goal, userId }).returning();
      console.log('DatabaseStorage.createGoal success:', newGoal);
      return newGoal;
    } catch (error) {
      console.error('DatabaseStorage.createGoal error:', error);
      throw error;
    }
  }

  async updateGoal(userId: number, id: number, goal: InsertGoal): Promise<Goal> {
    const [updatedGoal] = await db.update(goals)
      .set(goal)
      .where(and(eq(goals.id, id), eq(goals.userId, userId)))
      .returning();
    return updatedGoal;
  }

  async deleteGoal(userId: number, id: number): Promise<boolean> {
    const result = await db.delete(goals).where(and(
      eq(goals.id, id),
      eq(goals.userId, userId)
    ));
    return (result.rowCount || 0) > 0;
  }

  async getWorkouts(userId: number): Promise<Workout[]> {
    return await db.select().from(workouts).where(eq(workouts.userId, userId));
  }

  async getWorkoutsByDateRange(userId: number, startDate: string, endDate: string): Promise<Workout[]> {
    return await db.select().from(workouts).where(and(
      eq(workouts.userId, userId),
      eq(workouts.date, startDate) // Note: This should be a range query, but simplified for now
    ));
  }

  async createWorkout(userId: number, workout: InsertWorkout): Promise<Workout> {
    const [newWorkout] = await db.insert(workouts).values({ ...workout, userId }).returning();
    return newWorkout;
  }

  async getHabitData(userId: number): Promise<HabitData[]> {
    return await db.select().from(habitData).where(eq(habitData.userId, userId));
  }

  async getHabitDataByGoal(userId: number, goalId: number): Promise<HabitData[]> {
    return await db.select().from(habitData).where(and(
      eq(habitData.userId, userId),
      eq(habitData.goalId, goalId)
    ));
  }

  async getHabitDataByDate(userId: number, date: string): Promise<HabitData[]> {
    return await db.select().from(habitData).where(and(
      eq(habitData.userId, userId),
      eq(habitData.date, date)
    ));
  }

  async createOrUpdateHabitData(userId: number, habitDataInput: InsertHabitData): Promise<HabitData> {
    // Check if habit data exists for this goal and date
    const existing = await db.select().from(habitData)
      .where(and(
        eq(habitData.userId, userId),
        eq(habitData.goalId, habitDataInput.goalId),
        eq(habitData.date, habitDataInput.date)
      ))
      .limit(1);

    if (existing.length > 0) {
      // Update existing record
      const [updated] = await db.update(habitData)
        .set(habitDataInput)
        .where(eq(habitData.id, existing[0].id))
        .returning();
      return updated;
    } else {
      // Create new record
      const [newHabitData] = await db.insert(habitData).values({ ...habitDataInput, userId }).returning();
      return newHabitData;
    }
  }
}

// 無料プランでは環境変数で切り替え可能
// 本番環境でも一時的にMemStorageを使用してテスト
const useInMemoryStorage = true; // process.env.NODE_ENV === 'development' || !process.env.DATABASE_URL;

console.log('Storage configuration:', {
  NODE_ENV: process.env.NODE_ENV,
  DATABASE_URL: process.env.DATABASE_URL ? '[SET]' : '[NOT SET]',
  useInMemoryStorage
});

export const storage = useInMemoryStorage ? new MemStorage() : new DatabaseStorage();