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
      {
        id: 1,
        date: '2025-01-15',
        time: '07:30:00',
        distance: 5.2,
        heartRate: 155,
        duration: 1800,
        calories: 240,
        createdAt: new Date('2025-01-15T07:30:00'),
      },
      {
        id: 2,
        date: '2025-01-14',
        time: '18:45:00',
        distance: 4.8,
        heartRate: 145,
        duration: 1680,
        calories: 220,
        createdAt: new Date('2025-01-14T18:45:00'),
      },
      {
        id: 3,
        date: '2025-01-13',
        time: '06:15:00',
        distance: 6.1,
        heartRate: 162,
        duration: 2100,
        calories: 280,
        createdAt: new Date('2025-01-13T06:15:00'),
      },
      {
        id: 4,
        date: '2025-01-12',
        time: '07:00:00',
        distance: 3.2,
        heartRate: 140,
        duration: 1200,
        calories: 150,
        createdAt: new Date('2025-01-12T07:00:00'),
      },
      {
        id: 5,
        date: '2025-01-11',
        time: '19:30:00',
        distance: 5.8,
        heartRate: 158,
        duration: 2400,
        calories: 290,
        createdAt: new Date('2025-01-11T19:30:00'),
      },
      {
        id: 6,
        date: '2025-01-10',
        time: '08:15:00',
        distance: 4.2,
        heartRate: 142,
        duration: 1500,
        calories: 185,
        createdAt: new Date('2025-01-10T08:15:00'),
      },
      {
        id: 7,
        date: '2025-01-09',
        time: '06:45:00',
        distance: 6.5,
        heartRate: 165,
        duration: 2700,
        calories: 320,
        createdAt: new Date('2025-01-09T06:45:00'),
      },
      {
        id: 8,
        date: '2025-01-08',
        time: '18:00:00',
        distance: 2.8,
        heartRate: 135,
        duration: 900,
        calories: 120,
        createdAt: new Date('2025-01-08T18:00:00'),
      },
    ];

    sampleWorkouts.forEach(workout => {
      this.workouts.set(workout.id, workout);
    });
    this.currentWorkoutId = 9;

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
    this.currentHabitDataId = 9;
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
