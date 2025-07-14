import { goals, workouts, habitData, type Goal, type InsertGoal, type Workout, type InsertWorkout, type HabitData, type InsertHabitData } from "@shared/schema";

export interface IStorage {
  // Goals
  getCurrentGoal(): Promise<Goal | undefined>;
  updateGoal(goal: InsertGoal): Promise<Goal>;
  
  // Workouts
  getWorkouts(): Promise<Workout[]>;
  getWorkoutsByDateRange(startDate: string, endDate: string): Promise<Workout[]>;
  createWorkout(workout: InsertWorkout): Promise<Workout>;
  
  // Habit Data
  getHabitData(): Promise<HabitData[]>;
  getHabitDataByDate(date: string): Promise<HabitData | undefined>;
  createOrUpdateHabitData(habitData: InsertHabitData): Promise<HabitData>;
}

export class MemStorage implements IStorage {
  private goals: Map<number, Goal>;
  private workouts: Map<number, Workout>;
  private habitDataMap: Map<string, HabitData>;
  private currentGoalId: number;
  private currentWorkoutId: number;
  private currentHabitDataId: number;

  constructor() {
    this.goals = new Map();
    this.workouts = new Map();
    this.habitDataMap = new Map();
    this.currentGoalId = 1;
    this.currentWorkoutId = 1;
    this.currentHabitDataId = 1;

    // Initialize with default goal
    const defaultGoal: Goal = {
      id: 1,
      distance: 5.0,
      heartRate: 150,
      duration: 30,
      createdAt: new Date(),
    };
    this.goals.set(1, defaultGoal);
    this.currentGoalId = 2;

    // Initialize with sample workout data
    this.initializeSampleData();
  }

  private initializeSampleData() {
    const sampleWorkouts = [
      // 7月のサンプルデータ - 全目標達成
      {
        id: 1,
        date: '2025-07-14',
        time: '07:30:00',
        distance: 5.2,
        heartRate: 155,
        duration: 1800,
        calories: 240,
        createdAt: new Date('2025-07-14T07:30:00'),
      },
      {
        id: 2,
        date: '2025-07-13',
        time: '18:45:00',
        distance: 6.1,
        heartRate: 162,
        duration: 2100,
        calories: 280,
        createdAt: new Date('2025-07-13T18:45:00'),
      },
      {
        id: 3,
        date: '2025-07-12',
        time: '06:15:00',
        distance: 5.8,
        heartRate: 158,
        duration: 2400,
        calories: 290,
        createdAt: new Date('2025-07-12T06:15:00'),
      },
      // 一部達成データ
      {
        id: 4,
        date: '2025-07-11',
        time: '07:00:00',
        distance: 3.2,
        heartRate: 155,
        duration: 1800,
        calories: 150,
        createdAt: new Date('2025-07-11T07:00:00'),
      },
      {
        id: 5,
        date: '2025-07-10',
        time: '19:30:00',
        distance: 5.2,
        heartRate: 140,
        duration: 1200,
        calories: 220,
        createdAt: new Date('2025-07-10T19:30:00'),
      },
      {
        id: 6,
        date: '2025-07-09',
        time: '08:15:00',
        distance: 4.2,
        heartRate: 142,
        duration: 1500,
        calories: 185,
        createdAt: new Date('2025-07-09T08:15:00'),
      },
      // 実施のみ（目標未達成）
      {
        id: 7,
        date: '2025-07-08',
        time: '06:45:00',
        distance: 2.8,
        heartRate: 135,
        duration: 900,
        calories: 120,
        createdAt: new Date('2025-07-08T06:45:00'),
      },
      {
        id: 8,
        date: '2025-07-07',
        time: '18:00:00',
        distance: 3.1,
        heartRate: 140,
        duration: 1200,
        calories: 140,
        createdAt: new Date('2025-07-07T18:00:00'),
      },
      {
        id: 9,
        date: '2025-07-06',
        time: '07:30:00',
        distance: 2.5,
        heartRate: 130,
        duration: 800,
        calories: 100,
        createdAt: new Date('2025-07-06T07:30:00'),
      },
      // 追加の7月データ
      {
        id: 10,
        date: '2025-07-05',
        time: '19:00:00',
        distance: 5.5,
        heartRate: 160,
        duration: 1900,
        calories: 260,
        createdAt: new Date('2025-07-05T19:00:00'),
      },
      {
        id: 11,
        date: '2025-07-04',
        time: '06:30:00',
        distance: 4.5,
        heartRate: 145,
        duration: 1600,
        calories: 200,
        createdAt: new Date('2025-07-04T06:30:00'),
      },
      {
        id: 12,
        date: '2025-07-03',
        time: '18:30:00',
        distance: 6.2,
        heartRate: 165,
        duration: 2200,
        calories: 300,
        createdAt: new Date('2025-07-03T18:30:00'),
      },
      {
        id: 13,
        date: '2025-07-02',
        time: '07:15:00',
        distance: 3.8,
        heartRate: 148,
        duration: 1400,
        calories: 170,
        createdAt: new Date('2025-07-02T07:15:00'),
      },
      {
        id: 14,
        date: '2025-07-01',
        time: '08:00:00',
        distance: 5.1,
        heartRate: 152,
        duration: 1850,
        calories: 230,
        createdAt: new Date('2025-07-01T08:00:00'),
      },
    ];

    sampleWorkouts.forEach(workout => {
      this.workouts.set(workout.id, workout);
    });
    this.currentWorkoutId = 15;

    // Create corresponding habit data
    const currentGoal = this.goals.get(1)!;
    sampleWorkouts.forEach(workout => {
      const habitData: HabitData = {
        id: workout.id,
        date: workout.date,
        distanceAchieved: workout.distance >= currentGoal.distance,
        heartRateAchieved: workout.heartRate >= currentGoal.heartRate,
        durationAchieved: workout.duration >= currentGoal.duration * 60,
        workoutId: workout.id,
      };
      this.habitDataMap.set(workout.date, habitData);
    });
    this.currentHabitDataId = 15;
  }

  async getCurrentGoal(): Promise<Goal | undefined> {
    const goalEntries = Array.from(this.goals.entries());
    if (goalEntries.length === 0) return undefined;
    
    // Get the most recent goal (highest id)
    const latestGoal = goalEntries.reduce((latest, current) => 
      current[1].id > latest[1].id ? current : latest
    );
    
    return latestGoal[1];
  }

  async updateGoal(goal: InsertGoal): Promise<Goal> {
    const id = this.currentGoalId++;
    const newGoal: Goal = {
      id,
      distance: goal.distance ?? 5.0,
      heartRate: goal.heartRate ?? 150,
      duration: goal.duration ?? 30,
      createdAt: new Date(),
    };
    this.goals.set(id, newGoal);
    return newGoal;
  }

  async getWorkouts(): Promise<Workout[]> {
    return Array.from(this.workouts.values()).sort((a, b) => 
      new Date(b.date + 'T' + b.time).getTime() - new Date(a.date + 'T' + a.time).getTime()
    );
  }

  async getWorkoutsByDateRange(startDate: string, endDate: string): Promise<Workout[]> {
    return Array.from(this.workouts.values()).filter(workout => 
      workout.date >= startDate && workout.date <= endDate
    );
  }

  async createWorkout(workout: InsertWorkout): Promise<Workout> {
    const id = this.currentWorkoutId++;
    const newWorkout: Workout = {
      id,
      date: workout.date,
      time: workout.time,
      distance: workout.distance,
      heartRate: workout.heartRate,
      duration: workout.duration,
      calories: workout.calories,
      createdAt: new Date(),
    };
    this.workouts.set(id, newWorkout);
    
    // Automatically create or update habit data based on current goal
    const currentGoal = await this.getCurrentGoal();
    if (currentGoal) {
      const habitData = {
        date: workout.date,
        distanceAchieved: workout.distance >= currentGoal.distance,
        heartRateAchieved: workout.heartRate >= currentGoal.heartRate,
        durationAchieved: workout.duration >= currentGoal.duration * 60,
        workoutId: id,
      };
      await this.createOrUpdateHabitData(habitData);
    }
    
    return newWorkout;
  }

  async getHabitData(): Promise<HabitData[]> {
    return Array.from(this.habitDataMap.values());
  }

  async getHabitDataByDate(date: string): Promise<HabitData | undefined> {
    return this.habitDataMap.get(date);
  }

  async createOrUpdateHabitData(habitData: InsertHabitData): Promise<HabitData> {
    const existing = this.habitDataMap.get(habitData.date);
    
    if (existing) {
      const updated: HabitData = {
        id: existing.id,
        date: habitData.date,
        distanceAchieved: habitData.distanceAchieved ?? existing.distanceAchieved,
        heartRateAchieved: habitData.heartRateAchieved ?? existing.heartRateAchieved,
        durationAchieved: habitData.durationAchieved ?? existing.durationAchieved,
        workoutId: habitData.workoutId ?? existing.workoutId,
      };
      this.habitDataMap.set(habitData.date, updated);
      return updated;
    } else {
      const id = this.currentHabitDataId++;
      const newHabitData: HabitData = {
        id,
        date: habitData.date,
        distanceAchieved: habitData.distanceAchieved ?? null,
        heartRateAchieved: habitData.heartRateAchieved ?? null,
        durationAchieved: habitData.durationAchieved ?? null,
        workoutId: habitData.workoutId ?? null,
      };
      this.habitDataMap.set(habitData.date, newHabitData);
      return newHabitData;
    }
  }
}

export const storage = new MemStorage();
