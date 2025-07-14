import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertGoalSchema, insertWorkoutSchema, insertHabitDataSchema, type HabitData } from "@shared/schema";
import { smartWatchRoutes } from "./smartwatch-apis";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Goals endpoints
  app.get("/api/goals", async (req, res) => {
    try {
      const category = req.query.category as string;
      const goals = category 
        ? await storage.getGoalsByCategory(category)
        : await storage.getGoals();
      res.json(goals);
    } catch (error) {
      res.status(500).json({ message: "Failed to get goals" });
    }
  });

  app.post("/api/goals", async (req, res) => {
    try {
      const goalData = insertGoalSchema.parse(req.body);
      const goal = await storage.createGoal(goalData);
      res.json(goal);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid goal data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create goal" });
      }
    }
  });

  app.put("/api/goals/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const goalData = insertGoalSchema.parse(req.body);
      const goal = await storage.updateGoal(id, goalData);
      res.json(goal);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid goal data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to update goal" });
      }
    }
  });

  app.delete("/api/goals/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteGoal(id);
      res.json({ success });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete goal" });
    }
  });

  // Workouts endpoints
  app.get("/api/workouts", async (req, res) => {
    try {
      const workouts = await storage.getWorkouts();
      res.json(workouts);
    } catch (error) {
      res.status(500).json({ message: "Failed to get workouts" });
    }
  });

  app.post("/api/workouts", async (req, res) => {
    try {
      const workoutData = insertWorkoutSchema.parse(req.body);
      const workout = await storage.createWorkout(workoutData);
      res.json(workout);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid workout data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create workout" });
      }
    }
  });

  // Habit data endpoints
  app.get("/api/habit-data", async (req, res) => {
    try {
      const goalId = req.query.goalId as string;
      const date = req.query.date as string;
      
      let habitData: HabitData[];
      if (goalId) {
        habitData = await storage.getHabitDataByGoal(parseInt(goalId));
      } else if (date) {
        habitData = await storage.getHabitDataByDate(date);
      } else {
        habitData = await storage.getHabitData();
      }
      
      res.json(habitData);
    } catch (error) {
      res.status(500).json({ message: "Failed to get habit data" });
    }
  });

  app.post("/api/habit-data", async (req, res) => {
    try {
      const habitDataInput = insertHabitDataSchema.parse(req.body);
      const habitData = await storage.createOrUpdateHabitData(habitDataInput);
      res.json(habitData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid habit data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create/update habit data" });
      }
    }
  });

  // Statistics endpoint
  app.get("/api/statistics", async (req, res) => {
    try {
      const goals = await storage.getGoals();
      const habitData = await storage.getHabitData();
      
      // Calculate statistics
      let streak = 0;
      let totalWorkoutDays = 0;
      let totalAchievements = 0;
      let totalDays = 0;
      
      // Group habit data by date
      const dataByDate = new Map<string, HabitData[]>();
      habitData.forEach(data => {
        if (!dataByDate.has(data.date)) {
          dataByDate.set(data.date, []);
        }
        dataByDate.get(data.date)!.push(data);
      });
      
      // Sort dates (newest first)
      const sortedDates = Array.from(dataByDate.keys()).sort((a, b) => 
        new Date(b).getTime() - new Date(a).getTime()
      );
      
      // Calculate current streak
      for (const date of sortedDates) {
        const dayData = dataByDate.get(date)!;
        const allAchieved = dayData.every(data => data.achieved);
        if (allAchieved && dayData.length > 0) {
          streak++;
        } else {
          break;
        }
      }
      
      // Calculate total statistics
      totalWorkoutDays = sortedDates.length;
      
      sortedDates.forEach(date => {
        const dayData = dataByDate.get(date)!;
        const achievedCount = dayData.filter(data => data.achieved).length;
        totalAchievements += achievedCount;
        totalDays += dayData.length;
      });
      
      const averageAchievementRate = totalDays > 0 ? (totalAchievements / totalDays) * 100 : 0;
      
      res.json({
        streak,
        totalWorkoutDays,
        averageAchievementRate: Math.round(averageAchievementRate),
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to get statistics" });
    }
  });

  // Smart Watch API routes
  smartWatchRoutes(app);

  return createServer(app);
}